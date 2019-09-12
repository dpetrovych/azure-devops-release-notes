import * as SDK from "azure-devops-extension-sdk";
import { CommonServiceIds, IProjectPageService, IExtensionDataManager, IExtensionDataService } from "azure-devops-extension-api";

export interface IPluginSettings {
    repositories: { key: string; name: string }[];
}

export class SettingsService {
    private dataManager: IExtensionDataManager;
    private projectName: string;

    public async initialize() {
        const projectService = await SDK.getService<IProjectPageService>(CommonServiceIds.ProjectPageService);
        const project = await projectService.getProject();
        this.projectName = project ? project.name : "";

        const accessToken = await SDK.getAccessToken();
        const extDataService = await SDK.getService<IExtensionDataService>(CommonServiceIds.ExtensionDataService);
        this.dataManager = await extDataService.getExtensionDataManager(SDK.getExtensionContext().id, accessToken);
    }

    public async get(): Promise<IPluginSettings> {
        var settingsResult = await this.dataManager!.getValue<string>(`${this.projectName}-extension-settings`, { scopeType: "User" });
        if (settingsResult && settingsResult !== "") {
            return JSON.parse(settingsResult);
        }

        return { repositories: [] };
    }

    public async save(settings: IPluginSettings): Promise<any> {
        var settingsResult = JSON.stringify(settings);
        await this.dataManager!.setValue<string>(`${this.projectName}-extension-settings`, settingsResult || "", { scopeType: "User" });
    }
}
