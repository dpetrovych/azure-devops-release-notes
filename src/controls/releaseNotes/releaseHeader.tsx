import * as React from "react";

import {
    CustomHeader,
    HeaderIcon,
    HeaderTitle,
    HeaderDescription,
    HeaderTitleArea,
    HeaderTitleRow,
    TitleSize
} from "azure-devops-ui/Header";
import { HeaderCommandBar, IHeaderCommandBarItem } from "azure-devops-ui/HeaderCommandBar";
import { Pill, PillSize } from "azure-devops-ui/Pill";
import { PillGroup } from "azure-devops-ui/PillGroup";
import { Dialog } from "azure-devops-ui/Dialog";
import { Ago } from "azure-devops-ui/Ago";
import { AgoFormat } from "azure-devops-ui/Utilities/Date";
import { VssPersona, IIdentityDetailsProvider } from "azure-devops-ui/VssPersona";

import { PullRequestRef, ZeroPullRequestRef } from "../../data/releaseNotes";
import { ReleaseService } from "../../data/releases";
import { DateTimePicker } from "./dateTimePicker";
import moment = require("moment");

interface IReleaseHeaderProps {
    pullRequest: PullRequestRef | ZeroPullRequestRef;
    releaseService: ReleaseService;
}

interface IReleaseHeaderState {
    releaseDate?: Date;
    openTimeDialog: boolean;
}

const pullRequestIdentity = (pr: PullRequestRef): IIdentityDetailsProvider | undefined => {
    return {
        getDisplayName: () => (pr.createdBy.displayName),
        getIdentityImageUrl: () => (pr.createdBy.imageUrl)
    };
};

export class ReleaseHeader extends React.PureComponent<IReleaseHeaderProps, IReleaseHeaderState> {
    public releaseDatePicker: DateTimePicker | null;

    constructor(props) {
        super(props);
        this.state = {
            openTimeDialog: false
        };
    }

    componentWillMount() {
        var { pullRequest, releaseService } = this.props;
        if (pullRequest instanceof ZeroPullRequestRef) {
            return;
        }

        releaseService.getRelease(pullRequest.repositoryId, pullRequest.id)
            .then(release => this.setState({ releaseDate: release.date }));
    }

    render() {
        if (this.props.pullRequest instanceof ZeroPullRequestRef) {
            return this.renderHeader("No pull request found", "Create a pull request to master branch to review release notes", true);
        }

        return this.renderHeader(
            (<React.Fragment>
                <span className="release-title">{this.props.pullRequest.title}</span>
                <PillGroup className="release-status">
                    <Pill size={PillSize.compact}>{this.props.pullRequest.status}</Pill>
                </PillGroup>
            </React.Fragment>),
            (<React.Fragment>
                <VssPersona identityDetailsProvider={pullRequestIdentity(this.props.pullRequest)} size={"small"} className="release-author_persona" />
                <span className="release-author_name">{this.props.pullRequest.createdBy.displayName + ", "}</span>
                <Ago date={this.props.pullRequest.creationDate} format={AgoFormat.Compact} />
            </React.Fragment>));
    }

    private renderHeader(header: JSX.Element | string, description: JSX.Element | string, isZero: boolean = false) {
        const { releaseDate } = this.state;

        const commandBarItems: IHeaderCommandBarItem[] = isZero
            ? []
            : [
                {
                    id: "setDate",
                    text: releaseDate ? "Deploy on " + moment(releaseDate).format("DD/MM HH:mm") : "Schedule deployment",
                    iconProps: {
                        iconName: "DateTime2"
                    },
                    onActivate: () => this.setState({ openTimeDialog: true })
                }
            ];

        const onDismiss = () => this.setState({ openTimeDialog: false });
        return (
            <React.Fragment>
                <CustomHeader className="bolt-header-with-commandbar">
                    <HeaderIcon className="bolt-table-status-icon-large" iconProps={{ iconName: "OpenSource" }} titleSize={TitleSize.Medium} />
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
                    <HeaderCommandBar items={commandBarItems} />
                </CustomHeader>
                {this.state.openTimeDialog && (
                    <Dialog
                        titleProps={{ text: "Select deployment time" }}
                        footerButtonProps={[
                            {
                                text: "Cancel",
                                onClick: onDismiss
                            },
                            {
                                text: "Reset time",
                                onClick: () => this.releaseDatePicker!.reset()
                            },
                            {
                                text: "Apply",
                                onClick: this._setReleaseDate,
                                primary: true
                            }
                        ]}
                        onDismiss={onDismiss}
                    >
                        <span className="release-set-date-dialog_disclaimer">
                            Disclaimer: There is no automated deployment on schedule available.
                        </span>
                        <DateTimePicker value={releaseDate} ref={r => this.releaseDatePicker = r} />
                    </Dialog>

                )}
            </React.Fragment>
        );
    }

    public getReleaseDate = (): Date | undefined => this.state.releaseDate;

    private _setReleaseDate = (): void => {
        var { pullRequest, releaseService } = this.props;
        if (pullRequest instanceof ZeroPullRequestRef) {
            this.setState({ openTimeDialog: false });
            return;
        }

        var releaseDate = this.releaseDatePicker!.getValue();

        releaseService.setReleaseDate(pullRequest.repositoryId, pullRequest.id, releaseDate)
            .then(() => this.setState({ openTimeDialog: false, releaseDate: releaseDate }));
    }
}
