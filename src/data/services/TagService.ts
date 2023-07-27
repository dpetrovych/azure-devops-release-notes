import { CommonServiceIds, IProjectPageService } from "azure-devops-extension-api";
import { GitAnnotatedTag, GitRef, GitRestClient } from "azure-devops-extension-api/Git";
import * as API from "azure-devops-extension-api";
import * as SDK from "azure-devops-extension-sdk"
import { PagedList } from "azure-devops-extension-api/WebApi";

export class TagsService {
    private gitClient: GitRestClient;
    private projectId: string;

    public async initialize(): Promise<void> {

        this.gitClient = API.getClient(GitRestClient);
        const projectService = await SDK.getService<IProjectPageService>(CommonServiceIds.ProjectPageService);
        const project = await projectService.getProject();
        this.projectId = project ? project?.id : "";

    }

    public async getAnnotedTags(repositoryId: string): Promise<GitAnnotatedTag[]> {
        const refs = await this.getRefs(repositoryId, "tags");

        const tags = await Promise.all(refs.map(async ref => await this.gitClient.getAnnotatedTag(this.projectId, repositoryId, ref.objectId)));
        return tags;
    }

    public async getRefs(repostiroyId: string, filter: string): Promise<PagedList<GitRef>> {
        return await this.gitClient.getRefs(repostiroyId, undefined, filter);
    }

}

