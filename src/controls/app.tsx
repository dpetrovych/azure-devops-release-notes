import * as React from "react";
import * as ReactDOM from "react-dom";
import { ReleaseNotes } from "./releaseNotes";
import { EmailTemplate, copyEmailTemplate } from "./email";
import { Settings } from "./settings";
import { ZeroData, ZeroDataActionType } from "azure-devops-ui/ZeroData";
import { Page } from "azure-devops-ui/Page";
import { Dialog, DialogFooter, DialogType } from "@fluentui/react/lib/Dialog";
import { RepositoryRef } from "../data/repository";
import { Report, Release } from "../../src/data/app";
import { ReleaseService } from "../../src/data/releases";
import { CommitService } from "../../src/data/services/CommitService";
import { TagsService } from "../../src/data/services/TagService";
import { SettingsService, IPluginSettings } from "../../src/data/settings";
import { DefaultButton, Panel, PrimaryButton } from "@fluentui/react";
import { Text } from '@fluentui/react/lib/Text';

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
    private tagService: TagsService;
    private commitService: CommitService;
    private releaseNotes: { [id: string]: (ReleaseNotes | null) } = {};

    constructor(props: Readonly<{}>) {
        super(props);
        this.settingsService = new SettingsService();
        this.releaseService = new ReleaseService();
        this.commitService = new CommitService();
        this.tagService = new TagsService();

        this.state = {
            repositories: [],
            settingsExpanded: false,
            emailDialogOpen: false,
            loaded: false
        };
    }

    public componentDidMount() {
        Promise.all([this.settingsService.initialize(), this.releaseService.initialize(), this.commitService.initialize(), this.tagService.initialize()])
            .then(() => this.settingsService.get().then(this.onSettingsChanged));
    }

    render() {
        const onEmailDialogDismiss = () => this.setState({ emailDialogOpen: false });
        const onSettinsDismiss = () => this.setState({ settingsExpanded: false });

        return (
            <Page className="flex-grow">
                <div className="header-container">
                    <Text variant={'xxLarge'} block>
                        Release Notes
                    </Text>
                    <div className="button-container">
                        <DefaultButton iconProps={{ "iconName": "Mail" }} text="Email" onClick={this.openEmailDialog}></DefaultButton>
                        <DefaultButton iconProps={{ "iconName": "Settings" }} text="Settings" onClick={this.openSettingsDialog}></DefaultButton>
                    </div>
                </div>

                {this.state.loaded && this.renderCards()}

                <Panel
                    onDismiss={onSettinsDismiss}
                    headerText="Settings"
                    closeButtonAriaLabel="Close"
                    isOpen={this.state.settingsExpanded}
                    onRenderFooterContent={() => (
                        <div className="button-container">
                            <PrimaryButton text="Save" onClick={this.onSettingsSave}></PrimaryButton>
                            <DefaultButton text="Cancel" onClick={onSettinsDismiss}></DefaultButton>
                        </div>
                    )}>

                    <p>Select repositories to be displayed</p>
                    <Settings settingsService={this.settingsService} onChanged={this.onSettingsChanged} ref={s => (this.settings = s)} />
                </Panel>

                <Dialog
                    hidden={!this.state.emailDialogOpen}
                    dialogContentProps={{
                        title: "Email template",
                        type: DialogType.normal,
                    }}
                >
                    <DialogFooter>
                        <PrimaryButton iconProps={{ "iconName": "Copy" }} text="Copy Content" onClick={copyEmailTemplate}></PrimaryButton>
                        <DefaultButton text="Close" onClick={onEmailDialogDismiss}></DefaultButton>
                    </DialogFooter>
                    <EmailTemplate pullState={() => this.getReleaseReport()} />
                </Dialog>
            </Page>
        );
    }
    private onSettingsSave = () => {
        if (this.settings) {
            this.settings.save();
            this.setState({ settingsExpanded: false });
            return;
        }
    }

    private openSettingsDialog = () => {
        this.setState({ settingsExpanded: true });
    }
    private openEmailDialog = () => {
        this.setState({ emailDialogOpen: true });
    }
    private getReleaseReport(): Report {
        const releases = Object.keys(this.releaseNotes)
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
                secondaryText="Use settings to select projects to be dispalayed."
                imageAltText="logo"
                imagePath="../img/zerodata.png"
                actionText="Select projects"
                actionType={ZeroDataActionType.ctaButton}
                onActionClick={() => this.setState({ settingsExpanded: true })}
            />;
        }

        return <div className="release-notes-container">
            {this.state.repositories.map((repo: RepositoryRef) => {
                return (<ReleaseNotes repostitory={repo}
                    key={repo.id}
                    releaseService={this.releaseService}
                    ref={r => this.releaseNotes[repo.id] = r}
                    commitService={this.commitService} tagService={this.tagService} />);
            })}
        </div>;
    }

    private onSettingsChanged = (settings: IPluginSettings) => {
        this.releaseNotes = {};
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