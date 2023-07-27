import { CommonServiceIds, IProjectPageService } from "azure-devops-extension-api";
import { GitCommitRef, GitQueryCommitsCriteria, GitRestClient } from "azure-devops-extension-api/Git";
import * as API from "azure-devops-extension-api";
import * as SDK from "azure-devops-extension-sdk";


export class CommitService {
    private gitClient: GitRestClient;
    private projectId: string;
    public async initialize(): Promise<void> {
        this.gitClient = API.getClient(GitRestClient);
        const projectService = await SDK.getService<IProjectPageService>(CommonServiceIds.ProjectPageService);
        const project = await projectService.getProject();
        this.projectId = project ? project?.id : "";
    }

    public async getCommitsFromCommitId(repositoryId: string, commitId: string): Promise<GitCommitRef[]> {
        const gitSearchCriteria = {
            fromCommitId: commitId,
            includeWorkItems: true
        } as GitQueryCommitsCriteria;

        return await this.getCommits(repositoryId, gitSearchCriteria, this.projectId);
    }

    public async getCommits(repositoryId: string, gitSearchCriteria: GitQueryCommitsCriteria, projectId: string): Promise<GitCommitRef[]> {
        return await this.gitClient.getCommits(repositoryId, gitSearchCriteria, projectId);
    }

}
