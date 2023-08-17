import { GitAnnotatedTag, GitRef, GitRestClient } from "azure-devops-extension-api/Git";
import * as API from "azure-devops-extension-api";
import { PagedList } from "azure-devops-extension-api/WebApi";
import { CommonServiceIds, IProjectPageService } from "azure-devops-extension-api";
import * as SDK from "azure-devops-extension-sdk";

export class TagsService {
    private gitClient: GitRestClient;
    private projectId: string;

    public async initialize(): Promise<void> {
        this.gitClient = API.getClient(GitRestClient);
        const projectService = await SDK.getService<IProjectPageService>(CommonServiceIds.ProjectPageService);
        const project = await projectService.getProject();
        this.projectId = project ? project?.id : "";
    }

    public async getRefs(repostiroyId: string, filter: string): Promise<PagedList<GitRef>> {
        return await this.gitClient.getRefs(repostiroyId, undefined, filter);
    }

    public async getAnnotatedTag(repositoryId: string, tagId: string): Promise<GitAnnotatedTag> {
        return await this.gitClient.getAnnotatedTag(this.projectId, repositoryId, tagId);
    }

}

