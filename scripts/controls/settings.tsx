import * as React from "react";
import { Filters } from "./filters";
import { SettingsService, IPluginSettings } from "../data/settings";

interface ISettingsProps {
    settingsService: SettingsService;
    onChanged: (settings: IPluginSettings) => void;
}

export class Settings extends React.Component<ISettingsProps, {}> {
    private filters: Filters | null;

    constructor(props: Readonly<ISettingsProps>) {
        super(props);
    }

    render() {
        return (
            <Filters
                filter={this.props.settingsService.get().then(x => x.repositories)}
                ref={f => (this.filters = f)}
            />
        );
    }

    public async save() {
        var repositories = this.filters!.getRepositories();
        var settings = { repositories: repositories };
        await this.props.settingsService.save(settings);

        this.props.onChanged(settings);
        console.log("save settings");
    }
}
