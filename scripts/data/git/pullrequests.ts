import { GitPullRequestSearchCriteria, PullRequestStatus, GitPullRequest, GitRestClient } from "azure-devops-extension-api/Git";
import { getClient } from "azure-devops-extension-api";
import { IIndividualContributionFilter } from "../../filter";

export const trackedPrs: {
    [repoId: string]: Promise<GitPullRequest[]>
} = {};

const batchSize = 11;
function getPullRequestsForRepository(repoId: string, skip = 0): Promise<GitPullRequest[]> {
    const criteria = {
        targetRefName: 'refs/heads/master',
        status: PullRequestStatus.All
    } as GitPullRequestSearchCriteria;

    return Promise.all([
        getClient(GitRestClient).getPullRequests(repoId, criteria, undefined, 0, skip, batchSize)
    ]).then(([pullrequests]) => { return pullrequests; });
}

export async function getPullRequests(filter: IIndividualContributionFilter): Promise<GitPullRequest[]> {
    const prProms: Promise<GitPullRequest[]>[] = [];
    for (const {key: repoId} of filter.repositories) {
        trackedPrs[repoId] = getPullRequestsForRepository(repoId);
        prProms.push(trackedPrs[repoId]);
    }
    const pullrequestsArr = await Promise.all(prProms);
    const pullrequests: GitPullRequest[] = [];
    for (const arr of pullrequestsArr) {
        pullrequests.push(...arr);
    }
    return pullrequests;
}
