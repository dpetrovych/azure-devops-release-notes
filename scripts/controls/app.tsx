import * as React from "react";
import * as ReactDOM from "react-dom";

import { ReleaseNotes } from "./releaseNotes";
import { ZeroData, ZeroDataActionType } from "azure-devops-ui/ZeroData";
import { Page } from "azure-devops-ui/Page";
import { Panel } from "azure-devops-ui/Panel";
import { Header, TitleSize } from "azure-devops-ui/Header";
import { IHeaderCommandBarItem } from "azure-devops-ui/HeaderCommandBar";

import { RepositoryRef } from "../data/repository";
import { Settings } from "./settings";
import { noop } from "azure-devops-ui/Util";

import { SettingsService, IPluginSettings } from "../data/settings";

interface IAppState {
    repositories: RepositoryRef[];
    settingsExpanded: boolean;
    loaded: boolean;
}

class App extends React.Component<{}, IAppState> {
    private settings: Settings | null;
    private settingsService: SettingsService;
    private headerCommands: IHeaderCommandBarItem[] = [
        {
            id: "settings",
            iconProps: { iconName: "Settings" },
            onActivate: () => this.setState({ settingsExpanded: true })
        }
    ];

    constructor(props: Readonly<{}>) {
        super(props);
        this.settingsService = new SettingsService();

        this.state = {
            repositories: [],
            settingsExpanded: false,
            loaded: false
        };
    }

    componentDidMount() {
        this.settingsService.initialize()
            .then(() => this.settingsService.get().then(this.onSettingsChanged));
    }

    render() {
        return (
            <Page className="flex-grow">
                <Header
                    title="Release Notes"
                    titleSize={TitleSize.Large}
                    commandBarItems={this.headerCommands}
                />
                {this.state.loaded && this.renderCards()}
                {this.state.settingsExpanded && (
                    <Panel
                        onDismiss={() => this.setState({ settingsExpanded: false })}
                        titleProps={{ text: "Settings" }}
                        description={"Select repositories to be displayed"}
                        footerButtonProps={[
                            { text: "Cancel", onClick: () => this.setState({ settingsExpanded: false }) },
                            { text: "Save", primary: true, onClick: () => this.settings ? this.settings.save() : noop() }
                        ]}
                    >
                        <Settings settingsService={this.settingsService} onChanged={this.onSettingsChanged} ref={s => (this.settings = s)} />
                    </Panel>
                )}
            </Page>
        );
    }

    private renderCards() {
        if (this.state.repositories.length === 0) {
            return <ZeroData
                primaryText="Hey, thanks for checking"
                secondaryText={
                    <span>
                        I'm still developing the plugin. Go ahead and select some project from a dropdown above to see if it works.
                    </span>
                }
                imageAltText="logo"
                imagePath={"../img/zerodata.png"}
                actionText="Select projects"
                actionType={ZeroDataActionType.ctaButton}
                onActionClick={() => this.setState({ settingsExpanded: true })}
            />;
        }

        return <div>
            {this.state.repositories.map((repo: RepositoryRef) => {
                return (<ReleaseNotes repostitory={repo} />);
            })}
        </div>;
    }

    private onSettingsChanged = (settings: IPluginSettings) => {
        this.setState({ loaded: true, repositories: settings.repositories.map(r => ({ id: r.key, name: r.name })) });
    }
}

export function renderApp(callback?: () => void) {
    ReactDOM.render(
        <App />,
        document.getElementById("root"),
        callback
    );
}
