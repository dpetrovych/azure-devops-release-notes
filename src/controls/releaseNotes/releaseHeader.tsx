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

import { Pill, PillSize } from "azure-devops-ui/Pill";
import { PillGroup } from "azure-devops-ui/PillGroup";
import { Ago } from "azure-devops-ui/Ago";
import { AgoFormat } from "azure-devops-ui/Utilities/Date";
import { VssPersona, IIdentityDetailsProvider } from "azure-devops-ui/VssPersona";

import { PullRequestRef, ZeroPullRequestRef } from "../../data/releaseNotes";

interface IReleaseHeaderProps {
    pullRequest: PullRequestRef | ZeroPullRequestRef;
}

const pullRequestIdentity = (pr: PullRequestRef): IIdentityDetailsProvider | undefined => {
    return {
        getDisplayName: () => (pr.createdBy.displayName),
        getIdentityImageUrl: () => (pr.createdBy.imageUrl)
    };
};

export class ReleaseHeader extends React.PureComponent<IReleaseHeaderProps> {
    constructor(props) {
        super(props);
    }

    render() {
        if (this.props.pullRequest instanceof ZeroPullRequestRef) {
            return this.renderHeader("No pull request found", "Create a pull request to master branch to review release notes");
        }

        return this.renderHeader(
            (<span>
                {this.props.pullRequest.title + " "}
                <PillGroup className="pull-request-status">
                    <Pill size={PillSize.compact}>{this.props.pullRequest.status}</Pill>
                </PillGroup>
            </span>),
            (<span>
                <VssPersona identityDetailsProvider={pullRequestIdentity(this.props.pullRequest)} size={"small"} className={"persona-inline"} />
                {this.props.pullRequest.createdBy.displayName + ", "}
                <Ago date={this.props.pullRequest.creationDate} format={AgoFormat.Compact} />
            </span>));
    }

    private renderHeader(header: JSX.Element | string, description: JSX.Element | string) {
        return (
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
            </CustomHeader>
        );
    }
}
