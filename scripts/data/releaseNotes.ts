//import * as SDK from "azure-devops-extension-sdk";
//import { CommonServiceIds, IProjectPageService, IExtensionDataManager, IExtensionDataService, Ser } from "azure-devops-extension-api";

import { GitRestClient, PullRequestStatus  } from "azure-devops-extension-api/Git";
import { WorkItemTrackingRestClient, WorkItemExpand, WorkItemErrorPolicy } from "azure-devops-extension-api/WorkItemTracking";
import * as API from "azure-devops-extension-api";

export enum IssueType {
    UserStory,
    Defect
}

export interface ReleaseNotesDetails {
    title: string;
    status: string;
    issues: ReleaseNotesIssue[];
}

export interface ReleaseNotesIssue {
    id: number;
    type: string;
    title: string;
    tags: string[];
    status: string;
}

export class ReleaseNotesService {
    async getReleaseNotes(repositoryId: string) : Promise<ReleaseNotesDetails | null> {
        var gitClient = API.getClient(GitRestClient);
        var pullRequests = await gitClient.getPullRequests(
            repositoryId,
            {
                targetRefName:"refs/heads/master",
                status: PullRequestStatus.All,
                creatorId: "",
                repositoryId: repositoryId,
                includeLinks: false,
                reviewerId: "",
                sourceRefName: "",
                sourceRepositoryId: ""
            }, undefined, undefined, 0, 1);

        var pullRequest = pullRequests[0];

        var workItemRefs = await gitClient.getPullRequestWorkItemRefs(repositoryId, pullRequest.pullRequestId);
        var witClient = API.getClient(WorkItemTrackingRestClient);

        var workItems = await witClient.getWorkItemsBatch({
            $expand: WorkItemExpand.All,
            ids: workItemRefs.map(w => Number(w.url.split('/').pop())),
            asOf: new Date(),
            errorPolicy: WorkItemErrorPolicy.Omit,
            fields: []
        });

        return pullRequest ?
        ({
            title: pullRequest.title,
            status: this.getPullRequestStatus(pullRequest.status),
            issues: workItems.map(x => ({
                id: x.id,
                type: (<string | undefined>x.fields["System.WorkItemType"]) || "",
                title: (<string | undefined>x.fields["System.Title"]) || "",
                tags: ((<string | undefined>x.fields["System.Tags"]) || "").split(';').map(x => x.trim()).filter(x => x !== ""),
                status: (<string | undefined>x.fields["System.State"] || "")
            }))
        }) : null;
    }

    private getPullRequestStatus(status: PullRequestStatus) {
        switch(status) {
            case PullRequestStatus.Active: return "Active";
            case PullRequestStatus.Completed: return "Completed";
            case PullRequestStatus.Abandoned: return "Abandoned";
            default: return "";
        }
    }
}
