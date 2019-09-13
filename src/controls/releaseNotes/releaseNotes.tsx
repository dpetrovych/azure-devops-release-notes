import * as React from "react";

import { Card } from "azure-devops-ui/Card";
import {
    CustomHeader,
    HeaderIcon,
    HeaderTitle,
    HeaderDescription,
    HeaderTitleArea,
    HeaderTitleRow,
    TitleSize
} from "azure-devops-ui/Header";
import { VssPersona, IIdentityDetailsProvider } from "azure-devops-ui/VssPersona";
import { Table } from "azure-devops-ui/Table";
import { ObservableArray, ObservableValue } from "azure-devops-ui/Core/Observable";
import { Pill, PillSize } from "azure-devops-ui/Pill";
import { PillGroup } from "azure-devops-ui/PillGroup";
import { Ago } from "azure-devops-ui/Ago";
import { AgoFormat } from "azure-devops-ui/Utilities/Date";

import { RepositoryRef } from "../../data/repository";
import { ReleaseNotesService, Issue, PullRequestRef } from "../../data/releaseNotes";
import { ITableItem, issueColumns } from "./issueTable";

interface IReleaseNotesProps {
    repostitory: RepositoryRef;
}

interface IReleaseNotesState {
    pullRequestIndex: number | null;
    pullRequest: PullRequestRef | null;
}

const issueToTableItem = (issue: Issue): ITableItem => {
    var issueIconModificator = issue.type.toLowerCase().replace(/\s/g, "-");

    return {
        code: {
            iconProps: { className: `issue_icon issue_icon--${issueIconModificator}` },
            text: issue.id.toString(),
            href: issue.href
        },
        title: issue.title,
        tags: issue.tags,
        status: issue.status
    };
};

const pullRequestIdentity = (pr: PullRequestRef): IIdentityDetailsProvider | undefined => {
    return {
        getDisplayName: () => (pr.createdBy.displayName),
        getIdentityImageUrl: () => (pr.createdBy.imageUrl)
    };
};


export class ReleaseNotes extends React.Component<IReleaseNotesProps, IReleaseNotesState> {
    private service = new ReleaseNotesService();
    private pullRequests: PullRequestRef[];
    private itemProvider = new ObservableArray<ITableItem | ObservableValue<ITableItem | undefined>>();

    constructor(props: Readonly<IReleaseNotesProps>) {
        super(props);
        this.state = {
            pullRequestIndex: null,
            pullRequest: null
        };
    }

    componentDidMount() {
        this.initialize();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.repostitory && prevProps.repostitory.id !== this.props.repostitory.id) {
            this.initialize();
        }
    }

    render() {
        return (
            <Card className="release-notes-card" titleProps={{ text: this.props.repostitory.name }}>
                {(this.state.pullRequest !== null) &&
                    (<div>
                        <CustomHeader className="bolt-header-with-commandbar">
                            <HeaderIcon
                                className="bolt-table-status-icon-large"
                                iconProps={{ iconName: "OpenSource" }}
                                titleSize={TitleSize.Medium}
                            />
                            <HeaderTitleArea>
                                <HeaderTitleRow>
                                    <HeaderTitle className="text-ellipsis" titleSize={TitleSize.Medium}>
                                        {this.state.pullRequest.title + " "}
                                        <PillGroup className="pull-request-status">
                                            <Pill size={PillSize.compact}>{this.state.pullRequest.status}</Pill>
                                        </PillGroup>
                                    </HeaderTitle>
                                </HeaderTitleRow>
                                <HeaderDescription>
                                    <VssPersona identityDetailsProvider={pullRequestIdentity(this.state.pullRequest)} size={"small"} className={"persona-inline"} />
                                    {this.state.pullRequest.createdBy.displayName + ", "}
                                    <Ago date={this.state.pullRequest.creationDate} format={AgoFormat.Compact} />
                                </HeaderDescription>
                            </HeaderTitleArea>
                            {/* <HeaderCommandBar items={commandBarItemsAdvanced} /> */}
                        </CustomHeader>
                        <Table<Partial<ITableItem>>
                            columns={issueColumns}
                            itemProvider={this.itemProvider}
                            showLines={false}
                        />
                    </div>)
                }
            </Card>
        );
    }

    private async initialize() {
        this.setState({ pullRequestIndex: null });
        this.pullRequests = await this.service.getTopPullRequests(this.props.repostitory.id);

        var currentPullRequest = this.pullRequests[0];
        this.setState({ pullRequestIndex: 0, pullRequest: currentPullRequest });
        await this.initializeNotes(currentPullRequest.id);
    }

    private async initializeNotes(pullRequestId: number) {
        this.itemProvider.removeAll();
        this.itemProvider.push(...new Array(5).fill(new ObservableValue<ITableItem | undefined>(undefined)));

        var notes = await this.service.getReleaseNotes(this.props.repostitory.id, pullRequestId);

        this.itemProvider.removeAll();
        this.itemProvider.push(...notes.map(x => issueToTableItem(x)));
    }
}
