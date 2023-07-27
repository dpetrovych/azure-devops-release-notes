import * as React from "react";

import {
    CustomHeader,
    HeaderTitle,
    HeaderDescription,
    HeaderTitleArea,
    HeaderTitleRow,
    TitleSize
} from "azure-devops-ui/Header";
import { Pill, PillSize } from "azure-devops-ui/Pill";
import { PillGroup } from "azure-devops-ui/PillGroup";
import { Ago } from "azure-devops-ui/Ago";
import { AgoFormat } from "azure-devops-ui/Utilities/Date";

import { DateTimePicker } from "./dateTimePicker";
import moment = require("moment");
import { PullRequestRef, ZeroPullRequestRef } from "../../data/releaseNotes";
import { ReleaseService } from "../../data/releases";

import Dialog, { DialogFooter, DialogType } from "@fluentui/react/lib/Dialog";
import { DefaultButton, FontIcon, IPersonaSharedProps, Persona, PersonaSize, PrimaryButton } from "@fluentui/react";

interface IReleaseHeaderProps {
    pullRequest: PullRequestRef | ZeroPullRequestRef | undefined;
    releaseService: ReleaseService;
}
interface IReleaseHeaderState {
    releaseDate?: Date;
    openTimeDialog: boolean;
}

const pullRequestIdentity = (pr: PullRequestRef): IPersonaSharedProps | undefined => {
    return {
        imageUrl: pr.createdBy.imageUrl,
        text: pr.createdBy.displayName,
    };
};

export class ReleaseHeader extends React.PureComponent<IReleaseHeaderProps, IReleaseHeaderState> {
    public releaseDatePicker: DateTimePicker | null;
    constructor(props) {
        super(props);
        this.state = {
            openTimeDialog: false,
        };
    }

    componentDidMount() {
        const { pullRequest, releaseService } = this.props;
        if (pullRequest instanceof ZeroPullRequestRef) {
            return;
        }

        releaseService.getRelease(pullRequest!.repositoryId, pullRequest!.id)
            .then(release => this.setState({ releaseDate: release.date }));
    }

    render() {
        if (this.props.pullRequest instanceof ZeroPullRequestRef) {
            return this.renderHeader("No pull request found", "Create a pull request to main branch to review release notes");
        }

        return this.renderHeader(
            (<React.Fragment>
                <span className="release-title">{this.props.pullRequest!.title}</span>
                <PillGroup className="release-status">
                    <Pill size={PillSize.compact}>{this.props.pullRequest!.status}</Pill>
                </PillGroup>
            </React.Fragment>),
            (<React.Fragment>
                <Persona {...pullRequestIdentity(this.props.pullRequest!)} size={PersonaSize.size24} />
                <span className="release-author_name">{this.props.pullRequest!.createdBy.displayName + ", "}</span>
                <Ago date={this.props.pullRequest!.creationDate} format={AgoFormat.Compact} />
            </React.Fragment>));
    }


    private renderHeader(header: JSX.Element | string, description: JSX.Element | string) {
        const { releaseDate } = this.state;


        const onDismiss = () => this.setState({ openTimeDialog: false });
        return (
            <React.Fragment>
                <CustomHeader className="bolt-header-with-commandbar release-header-container">
                    <FontIcon className="bolt-table-status-icon-large" iconName={"BranchPullRequest"} />
                    <div>
                        <HeaderTitleArea>
                            <HeaderTitleRow>
                                <HeaderTitle className="text-ellipsis" titleSize={TitleSize.Medium}>
                                    {header}
                                </HeaderTitle>
                            </HeaderTitleRow>
                            <HeaderDescription>
                                {description}
                            </HeaderDescription>
                        </HeaderTitleArea>
                        <div className="button-container">
                            <DefaultButton text={releaseDate ? "Deploy on" + moment(releaseDate).format("DD/MM HH:mm") : "Deployment Date"}
                                iconProps={{ "iconName": "DateTime2" }} onClick={() => this.setState({ openTimeDialog: true })}></DefaultButton>
                        </div>
                    </div>

                </CustomHeader>

                <Dialog
                    hidden={!this.state.openTimeDialog}
                    dialogContentProps={{
                        title: "Select deployment time",
                        type: DialogType.normal,

                    }}
                    onDismiss={onDismiss}
                >
                    <DialogFooter>
                        <DefaultButton text="Cancel" onClick={onDismiss}></DefaultButton>
                        <DefaultButton text="Reset time" onClick={() => this.releaseDatePicker!.reset()}></DefaultButton>
                        <PrimaryButton iconProps={{ "iconName": "Copy" }} text="Apply" onClick={this._setReleaseDate}></PrimaryButton>
                    </DialogFooter>
                    <span className="release-set-date-dialog_disclaimer">
                        Disclaimer: There is no automated deployment on schedule available.
                    </span>
                    <DateTimePicker value={releaseDate} ref={r => this.releaseDatePicker = r} />
                </Dialog>
            </React.Fragment>
        );
    }

    public getReleaseDate = (): Date | undefined => this.state.releaseDate;

    private _setReleaseDate = (): void => {
        const { pullRequest, releaseService } = this.props;
        if (pullRequest instanceof ZeroPullRequestRef) {
            this.setState({ openTimeDialog: false });
            return;
        }

        const releaseDate = this.releaseDatePicker!.getValue();

        releaseService.setReleaseDate(pullRequest!.repositoryId, pullRequest!.id, releaseDate)
            .then(() => this.setState({ openTimeDialog: false, releaseDate: releaseDate }));
    }
}
