import { GitRef, GitRestClient } from "azure-devops-extension-api/Git";
import * as API from "azure-devops-extension-api";
import { PagedList } from "azure-devops-extension-api/WebApi";

export class TagsService {
    private gitClient: GitRestClient;

    public async initialize(): Promise<void> {
        this.gitClient = API.getClient(GitRestClient);
    }

    public async getRefs(repostiroyId: string, filter: string): Promise<PagedList<GitRef>> {
        return await this.gitClient.getRefs(repostiroyId, undefined, filter );
    }

}

