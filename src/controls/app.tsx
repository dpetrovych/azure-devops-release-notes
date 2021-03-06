import * as React from "react";
import * as ReactDOM from "react-dom";

import { ReleaseNotes } from "./releaseNotes";
import { EmailTemplate, copyEmailTemplate } from "./email";
import { Settings } from "./settings";

import { ZeroData, ZeroDataActionType } from "azure-devops-ui/ZeroData";
import { Page } from "azure-devops-ui/Page";
import { Panel } from "azure-devops-ui/Panel";
import { Dialog } from "azure-devops-ui/Dialog";
import { ContentSize } from "azure-devops-ui/Callout";
import { Header, TitleSize } from "azure-devops-ui/Header";
import { IHeaderCommandBarItem } from "azure-devops-ui/HeaderCommandBar";
import { ObservableArray } from "azure-devops-ui/Core/Observable";
import { noop } from "azure-devops-ui/Util";

import { RepositoryRef } from "../data/repository";
import { SettingsService, IPluginSettings } from "../data/settings";
import { ReleaseService } from "../data/releases";
import { Report, Release } from "src/data/app";

interface IAppState {
    repositories: RepositoryRef[];
    settingsExpanded: boolean;
    emailDialogOpen: boolean;
    loaded: boolean;
}


class App extends React.Component<{}, IAppState> {
    private settings: Settings | null;
    private settingsService: SettingsService;
    private releaseService: ReleaseService;
    private releaseNotes: { [id: string]: (ReleaseNotes | null) } = {};

    private headerCommands: ObservableArray<IHeaderCommandBarItem> = new ObservableArray([
        this.renderEmailButton(true),
        {
            id: "settings",
            iconProps: { iconName: "Settings" },
            onActivate: () => this.setState({ settingsExpanded: true })
        }
    ]);

    constructor(props: Readonly<{}>) {
        super(props);
        this.settingsService = new SettingsService();
        this.releaseService = new ReleaseService();

        this.state = {
            repositories: [],
            settingsExpanded: false,
            emailDialogOpen: false,
            loaded: false
        };
    }

    componentDidMount() {
        Promise.all([this.settingsService.initialize(), this.releaseService.initialize()])
            .then(() => this.settingsService.get().then(this.onSettingsChanged));
    }

    render() {
        const onEmailDialogDismiss = () => this.setState({ emailDialogOpen: false });
        const onSettinsDismiss = () => this.setState({ settingsExpanded: false });

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
                        onDismiss={onSettinsDismiss}
                        titleProps={{ text: "Settings" }}
                        description={"Select repositories to be displayed"}
                        footerButtonProps={[
                            { text: "Cancel", onClick: onSettinsDismiss },
                            { text: "Save", primary: true, onClick: () => this.settings ? this.settings.save() : noop() }
                        ]}
                    >
                        <Settings settingsService={this.settingsService} onChanged={this.onSettingsChanged} ref={s => (this.settings = s)} />
                    </Panel>
                )}
                {this.state.emailDialogOpen && (
                    <Dialog
                        titleProps={{ text: "Email template" }}
                        contentSize={ContentSize.Large}
                        footerButtonProps={[
                            {
                                text: "Copy Content",
                                iconProps: { iconName: "Copy" },
                                onClick: copyEmailTemplate,
                                primary: true
                            },
                            {
                                text: "Close",
                                onClick: onEmailDialogDismiss,
                            }
                        ]}
                        onDismiss={onEmailDialogDismiss}
                    >
                        <EmailTemplate pullState={() => this.getReleaseReport()}/>
                    </Dialog>
                )}
            </Page>
        );
    }

    private getReleaseReport(): Report {
        var releases = Object.keys(this.releaseNotes)
            .map(key => this.releaseNotes[key])
            .filter(r => r !== null)
            .map((r: ReleaseNotes) => r.getRelease())
            .filter(r => r !== null) as Release[];

        return { releases: releases };
    }

    private renderCards() {
        if (this.state.repositories.length === 0) {
            return <ZeroData
                primaryText="No projects selected for release notes"
                secondaryText="Use settins to select projects to be dispalayed."
                imageAltText="logo"
                imagePath="../img/zerodata.png"
                actionText="Select projects"
                actionType={ZeroDataActionType.ctaButton}
                onActionClick={() => this.setState({ settingsExpanded: true })}
            />;
        }

        return <div className="release-notes-container">
            {this.state.repositories.map((repo: RepositoryRef) => {
                return (<ReleaseNotes repostitory={repo} key={repo.id} releaseService={this.releaseService} ref={r => this.releaseNotes[repo.id] = r} />);
            })}
        </div>;
    }

    private renderEmailButton(disabled: boolean): IHeaderCommandBarItem {
        return {
            id: "email",
            iconProps: { iconName: "Mail" },
            text: "Email",
            onActivate: () => this.setState({ emailDialogOpen: true }),
            disabled: disabled
        };
    }

    private onSettingsChanged = (settings: IPluginSettings) => {
        this.releaseNotes = {};
        this.setState({ loaded: true, repositories: settings.repositories.map(r => ({ id: r.key, name: r.name })) });
        this.headerCommands.change(0, this.renderEmailButton(settings.repositories.length === 0));
    }
}

export function renderApp(callback?: () => void) {
    ReactDOM.render(
        <App />,
        document.getElementById("root"),
        callback
    );
}
