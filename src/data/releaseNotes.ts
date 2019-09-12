//import * as SDK from "azure-devops-extension-sdk";
//import { CommonServiceIds, IProjectPageService, IExtensionDataManager, IExtensionDataService, Ser } from "azure-devops-extension-api";

import { GitRestClient, PullRequestStatus } from "azure-devops-extension-api/Git";
import { WorkItemTrackingRestClient, WorkItemExpand, WorkItemErrorPolicy } from "azure-devops-extension-api/WorkItemTracking";
import * as API from "azure-devops-extension-api";

export enum IssueType {
    UserStory,
    Defect
}

export interface PullRequestRef {
    id: number;
    title: string;
    status: string;
}

export interface ReleaseNotesIssue {
    href: string;
    id: number;
    type: string;
    title: string;
    tags: string[];
    status: string;
}

const TOP_PULLREQUESTS = 10;

export class ReleaseNotesService {
    async getTopPullRequests(repositoryId: string): Promise<PullRequestRef[]> {
        var gitClient = API.getClient(GitRestClient);
        var pullRequests = await gitClient.getPullRequests(
            repositoryId,
            {
                targetRefName: "refs/heads/master",
                status: PullRequestStatus.All,
                creatorId: "",
                repositoryId: repositoryId,
                includeLinks: false,
                reviewerId: "",
                sourceRefName: "",
                sourceRepositoryId: ""
            }, undefined, undefined, 0, TOP_PULLREQUESTS);

        return pullRequests.map(pr => ({
            id: pr.pullRequestId,
            title: pr.title,
            status: this.getPullRequestStatus(pr.status)
        }));
    }

    async getReleaseNotes(repositoryId: string, pullRequestId: number): Promise<ReleaseNotesIssue[]> {
        var gitClient = API.getClient(GitRestClient);

        var prWorkItems = await this.getPullRequestWorkItems(gitClient, repositoryId, pullRequestId);
        var commentsWorkItems = await this.getCommentsWorkItems(gitClient, repositoryId, pullRequestId);
        var workItemsIds = [...prWorkItems, ...commentsWorkItems].filter((v, i, a) => a.indexOf(v) === i);

        var witClient = API.getClient(WorkItemTrackingRestClient);
        var workItems = await witClient.getWorkItemsBatch({
            $expand: WorkItemExpand.All,
            ids: workItemsIds,
            errorPolicy: WorkItemErrorPolicy.Omit,
            asOf: <Date><any>undefined,
            fields: <string[]><any>undefined
        });

        return workItems.map(x => ({
            id: x.id,
            href: (x._links.html || { href: "#" }).href,
            type: (<string | undefined>x.fields["System.WorkItemType"]) || "",
            title: (<string | undefined>x.fields["System.Title"]) || "",
            tags: ((<string | undefined>x.fields["System.Tags"]) || "").split(';').map(x => x.trim()).filter(x => x !== ""),
            status: (<string | undefined>x.fields["System.State"] || "")
        }));
    }

    private async getPullRequestWorkItems(gitClient: GitRestClient, repositoryId: string, pullRequestId: number): Promise<number[]> {
        var workItemRefs = await gitClient.getPullRequestWorkItemRefs(repositoryId, pullRequestId);
        return workItemRefs.map(w => Number(w.url.split('/').pop()));
    }

    private async getCommentsWorkItems(gitClient: GitRestClient, repositoryId: string, pullRequestId: number): Promise<number[]> {
        var commitRefs = await gitClient.getPullRequestCommits(repositoryId, pullRequestId);

        return commitRefs.map(c => {
            var match = /\b#[0-9]+\b/.exec(c.comment);
            return match ? match.map(x => Number(x)) : [];
        }).reduce((c, a) => c.concat(a), []);
    }


    private getPullRequestStatus(status: PullRequestStatus) {
        switch (status) {
            case PullRequestStatus.Active: return "Active";
            case PullRequestStatus.Completed: return "Completed";
            case PullRequestStatus.Abandoned: return "Abandoned";
            default: return "";
        }
    }
}
