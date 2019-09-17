import * as SDK from "azure-devops-extension-sdk";
import { CommonServiceIds, IProjectPageService, IExtensionDataManager, IExtensionDataService } from "azure-devops-extension-api";

interface IReleaseEntity {
    date?: Date;
}

interface IReleasesDocument {
    id: string;
    [id: number] : IReleaseEntity | undefined;
}

export class ReleaseService {
    private dataManager: IExtensionDataManager;
    private projectName: string;

    public async initialize(): Promise<void> {
        const projectService = await SDK.getService<IProjectPageService>(CommonServiceIds.ProjectPageService);
        const project = await projectService.getProject();
        this.projectName = project ? project.name : "";

        const accessToken = await SDK.getAccessToken();
        const extDataService = await SDK.getService<IExtensionDataService>(CommonServiceIds.ExtensionDataService);
        this.dataManager = await extDataService.getExtensionDataManager(SDK.getExtensionContext().id, accessToken);
    }

    public async getRelease(repositoryId: string, pullRequestId:number): Promise<IReleaseEntity> {
        var document = await this.getDocument(repositoryId);
        return document[pullRequestId] || {};
    }

    public async setReleaseDate(repositoryId: string, pullRequestId:number, releaseDate: Date|undefined): Promise<void> {
        var document = await this.getDocument(repositoryId);
        var release = document[pullRequestId] || {};
        release.date = releaseDate;
        document[pullRequestId] = release;

        await this.dataManager.setDocument(`${this.projectName}-releases`, document);
    }

    private async getDocument(repositoryId: string): Promise<IReleasesDocument> {
        try {
            var releasedDocument = await this.dataManager!.getDocument(`${this.projectName}-releases`, repositoryId) as IReleasesDocument | undefined;
            return releasedDocument || {id : repositoryId};
        } catch (error) {
            return {id : repositoryId};
        }
    }
}
