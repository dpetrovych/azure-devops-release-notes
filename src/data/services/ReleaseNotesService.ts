import { GitRestClient, PullRequestStatus, GitPullRequestSearchCriteria, GitCommitRef, GitPullRequest } from "azure-devops-extension-api/Git";
import { WorkItemTrackingRestClient, WorkItem, WorkItemExpand, WorkItemErrorPolicy } from "azure-devops-extension-api/WorkItemTracking";
import * as API from "azure-devops-extension-api";
import { PullRequestRef, Issue } from "../releaseNotes";


const TOP_PULLREQUESTS = 10;

const getPullRequestStatus = (status: PullRequestStatus) => {
    switch (status) {
        case PullRequestStatus.Active: return "Active";
        case PullRequestStatus.Completed: return "Completed";
        case PullRequestStatus.Abandoned: return "Abandoned";
        default: return "";
    }
};

const mapToPullRequestRef = (pr: GitPullRequest): PullRequestRef =>
    new PullRequestRef({
        id: pr.pullRequestId,
        title: pr.title,
        repositoryId: pr.repository.id,
        status: getPullRequestStatus(pr.status),
        creationDate: pr.creationDate,
        createdBy: pr.createdBy
    });

const mapToReleaseNotesIssue = (wit: WorkItem): Issue =>
    new Issue({
        id: wit.id,
        href: (wit._links.html || { href: "#" }).href,
        type: (<string | undefined>wit.fields["System.WorkItemType"]) || "",
        title: (<string | undefined>wit.fields["System.Title"]) || "",
        tags: ((<string | undefined>wit.fields["System.Tags"]) || "").split(';').map(x => x.trim()).filter(x => x !== ""),
        status: (<string | undefined>wit.fields["System.State"] || "")
    });


export class ReleaseNotesService {
    async getTopPullRequests(repositoryId: string): Promise<PullRequestRef[]> {
        const gitClient = API.getClient(GitRestClient);
        const searchCriteria = {
            targetRefName: "refs/heads/main",
            status: PullRequestStatus.All,
            repositoryId: repositoryId,
            creatorId: "",
            includeLinks: false,
            reviewerId: "",
            sourceRefName: "",
            sourceRepositoryId: "",
        } as GitPullRequestSearchCriteria;

        const pullRequests = await gitClient.getPullRequests(
            repositoryId,
            searchCriteria,
            undefined,
            undefined,
            0,
            TOP_PULLREQUESTS);

        return pullRequests.map(mapToPullRequestRef);
    }

    async getReleaseNotes(repositoryId: string, pullRequestId: number): Promise<Issue[]> {
        const gitClient = API.getClient(GitRestClient);
        const witClient = API.getClient(WorkItemTrackingRestClient);

        const prWorkItems = await this.getPullRequestWorkItems(gitClient, repositoryId, pullRequestId);
        const commentsWorkItems = await this.getCommentsWorkItems(gitClient, repositoryId, pullRequestId);
        const workItemsIds = [...prWorkItems, ...commentsWorkItems].filter((v, i, a) => a.indexOf(v) === i);

        const workItems = await this.getWorkItems(witClient, workItemsIds);

        return this.getReleaseNotesIssues(workItems, witClient);
    }

    async getReleaseNotesIssuesBasedOnTags(commits: GitCommitRef[]): Promise<Issue[]> {
        const witClient = API.getClient(WorkItemTrackingRestClient);

        const commitsWorkItemsId = commits.flatMap(commit => commit.workItems.map(workItem => +workItem.id));

        const workItems = await this.getWorkItems(witClient, commitsWorkItemsId);

        return this.getReleaseNotesIssues(workItems, witClient);
    }

    private async getReleaseNotesIssues(workItems: WorkItem[], witClient: WorkItemTrackingRestClient): Promise<Issue[]> {

        const isTask = (wit: WorkItem): boolean => wit.fields["System.WorkItemType"] === "Task";

        const nonTaskWorkItems = workItems.filter(x => !isTask(x));
        const taskWorkItems = workItems.filter(x => isTask(x));

        const taskParentWorkItems = await this.getParentWorkItems(witClient, taskWorkItems, nonTaskWorkItems.map(x => x.id));

        return [...nonTaskWorkItems, ...taskParentWorkItems].map(mapToReleaseNotesIssue).sort((a, b) => b.id - a.id);
    }

    private async getParentWorkItems(witClient: WorkItemTrackingRestClient, taskWorkItems: WorkItem[], excludeWorkItems: number[]): Promise<WorkItem[]> {
        const parentIds: number[] = taskWorkItems
            .map(t => t.relations.find(x => x.rel === "System.LinkTypes.Hierarchy-Reverse"))
            .filter(parentRel => parentRel && parentRel.url)
            .map(parentRel => Number(parentRel!.url.split('/').pop()))
            .filter(parentId => excludeWorkItems.findIndex(x => x === parentId) === -1);

        if (parentIds.length === 0) { return []; }
        return await this.getWorkItems(witClient, parentIds);
    }

    private getWorkItems(witClient: WorkItemTrackingRestClient, workItemsIds: number[]): Promise<WorkItem[]> {
        return witClient.getWorkItemsBatch({
            $expand: WorkItemExpand.All,
            ids: workItemsIds,
            errorPolicy: WorkItemErrorPolicy.Omit,
            asOf: <Date><any>undefined,
            fields: <string[]><any>undefined
        });
    }

    private async getPullRequestWorkItems(gitClient: GitRestClient, repositoryId: string, pullRequestId: number): Promise<number[]> {
        const workItemRefs = await gitClient.getPullRequestWorkItemRefs(repositoryId, pullRequestId);
        return workItemRefs.map(w => Number(w.url.split('/').pop()));
    }

    private async getCommentsWorkItems(gitClient: GitRestClient, repositoryId: string, pullRequestId: number): Promise<number[]> {
        const commitRefs = await gitClient.getPullRequestCommits(repositoryId, pullRequestId);

        return commitRefs.map(c => {
            const match = /\b#[0-9]+\b/.exec(c.comment);
            return match ? match.map(x => Number(x)) : [];
        }).reduce((c, a) => c.concat(a), []);
    }
}
