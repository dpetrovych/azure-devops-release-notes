import { CommonServiceIds, IProjectPageService } from "azure-devops-extension-api";
import { GitCommitRef, GitQueryCommitsCriteria, GitRestClient, GitVersionType } from "azure-devops-extension-api/Git";
import * as API from "azure-devops-extension-api";
import * as SDK from "azure-devops-extension-sdk";


export class CommitService {
    private gitClient: GitRestClient;
    private projectId: string;

    private DEFAULT_BRANCH_NAME = "main"; // change this value to a name of your GIT default branch eg. "main" or "master"

    public async initialize(): Promise<void> {
        this.gitClient = API.getClient(GitRestClient);
        const projectService = await SDK.getService<IProjectPageService>(CommonServiceIds.ProjectPageService);
        const project = await projectService.getProject();
        this.projectId = project ? project?.id : "";
    }

    public async getCommitsFromTagName(repositoryId: string, tagName: string): Promise<GitCommitRef[]> {
        const gitSearchCriteria = {
            includeWorkItems: true,
            itemVersion: {
                versionType: GitVersionType.Tag,
                version: tagName
            },
            compareVersion: {
                versionType: GitVersionType.Branch,
                version: this.DEFAULT_BRANCH_NAME
            }

        } as GitQueryCommitsCriteria;

        return await this.getCommits(repositoryId, gitSearchCriteria, this.projectId);
    }

    public async getCommits(repositoryId: string, gitSearchCriteria: GitQueryCommitsCriteria, projectId: string): Promise<GitCommitRef[]> {
        return await this.gitClient.getCommits(repositoryId, gitSearchCriteria, projectId);
    }

    public async getCommit(repositoryId: string, commitId: string): Promise<GitCommitRef> {
        const searchCriteria = {
            includeWorkItems: true,
            toCommitId: commitId,
            fromCommitId: commitId
        } as GitQueryCommitsCriteria
        const result = await this.getCommits(repositoryId, searchCriteria, this.projectId);
        return result[0];
    }

}
