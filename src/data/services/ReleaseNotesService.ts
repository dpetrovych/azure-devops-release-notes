import { GitRestClient, PullRequestStatus, GitPullRequestSearchCriteria, GitCommitRef, GitPullRequest, GitPullRequestQuery, GitPullRequestQueryType } from "azure-devops-extension-api/Git";
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

    async getPullRequestsFromCommitIds(repositoryId: string, commitIds: string[]): Promise<GitPullRequest[]> {
        const gitClient = API.getClient(GitRestClient);
        const pullRequestQueryRequest = {
            queries: [{
                items: commitIds,
                type: GitPullRequestQueryType.LastMergeCommit
            }]
        } as GitPullRequestQuery;
        const pullRequestQuery = await gitClient.getPullRequestQuery(pullRequestQueryRequest, repositoryId);
        const pullRequests = this.getPullRequestsFromQuery(pullRequestQuery);

        return pullRequests;

    }

    private getPullRequestsFromQuery(pullRequestQuery: GitPullRequestQuery): GitPullRequest[] {
        let pullRequestIds: GitPullRequest[] = [];
        for (let i in pullRequestQuery.results) {
            for (let j in pullRequestQuery.results[i]) {
                for (let k in pullRequestQuery.results[i][j]) {
                    pullRequestIds.push(pullRequestQuery.results[i][j][k])
                }
            }
        }
        return pullRequestIds;
    }

    async getWorkItemsFromPullRequestsAndCommits(repositoryId: string, pullRequests: GitPullRequest[]): Promise<WorkItem[]> {
        const gitClient = API.getClient(GitRestClient);
        const witClient = API.getClient(WorkItemTrackingRestClient);

        let workItemNumbers: number[] = [];
        for (let pullRequest of pullRequests) {
            const pullRequestWorkItems = await this.getPullRequestWorkItems(gitClient, repositoryId, pullRequest.pullRequestId);
            const commitsWorkItems = await this.getCommitsWorkItems(gitClient, repositoryId, pullRequest.pullRequestId);

            workItemNumbers = [...workItemNumbers, ...pullRequestWorkItems, ...commitsWorkItems].filter((v, i, a) => a.indexOf(v) === i);
        }

        if (workItemNumbers.length === 0) {
            return [];
        }
        return await this.getWorkItems(witClient, workItemNumbers);
    }

    async getReleaseNotesIssuesBasedOnTags(repositoryId: string, commits: GitCommitRef[]): Promise<Issue[]> {
        const witClient = API.getClient(WorkItemTrackingRestClient);

        const commitsWithOutWorkItems = commits.filter(commit => commit.workItems.length === 0).map(commit => commit.commitId);

        let workItemIds: number[] = [...commits.flatMap(commit => commit.workItems.map(workItem => +workItem.id))];

        if (commitsWithOutWorkItems.length > 0) {
            const pullRequests = await this.getPullRequestsFromCommitIds(repositoryId, commitsWithOutWorkItems);
            const workItemsFromPullRequests = await this.getWorkItemsFromPullRequestsAndCommits(repositoryId, pullRequests);
            workItemIds = [
                ...workItemIds,
                ...workItemsFromPullRequests.map(workItem => workItem?.id)
            ];
        }

        if (workItemIds.length === 0) {
            return [];
        }
        console.log(workItemIds);
        const workItems = await this.getWorkItems(witClient, workItemIds.filter(workItemId => workItemId != null));

        return this.getReleaseNotesIssues(workItems, witClient);
    }
    private async getPullRequestWorkItems(gitClient: GitRestClient, repositoryId: string, pullRequestId: number): Promise<number[]> {
        const workItemRefs = await gitClient.getPullRequestWorkItemRefs(repositoryId, pullRequestId);
        return workItemRefs.map(w => Number(w.url.split('/').pop()));
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

    private async getCommitsWorkItems(gitClient: GitRestClient, repositoryId: string, pullRequestId: number): Promise<number[]> {
        const commitRefs = await gitClient.getPullRequestCommits(repositoryId, pullRequestId);

        return commitRefs
            .map(c => this.getWorkItemNumbersFromText(c.comment))
            .reduce((c, a) => c.concat(a), []);
    }

    private getWorkItemNumbersFromText(text: string) {
        const regex = /\d+/g;
        const match = text.match(regex);
        return match ? match.map(x => Number(x)) : [];
    }
}
