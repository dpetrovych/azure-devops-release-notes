import * as React from "react";

import { Card } from "azure-devops-ui/Card";
import { Table } from "azure-devops-ui/Table";
import { ObservableArray, ObservableValue } from "azure-devops-ui/Core/Observable";

import { RepositoryRef } from "../../data/repository";
import { ReleaseNotesService, Issue, PullRequestRef, ZeroPullRequestRef } from "../../data/releaseNotes";
import { ITableItem, issueColumns } from "./issueTable";
import { ReleaseHeader } from "./releaseHeader";


interface IReleaseNotesProps {
    repostitory: RepositoryRef;
}

interface IReleaseNotesState {
    pullRequestIndex: number | undefined;
    pullRequest: PullRequestRef | ZeroPullRequestRef | undefined;
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

export class ReleaseNotes extends React.Component<IReleaseNotesProps, IReleaseNotesState> {
    private service = new ReleaseNotesService();
    private pullRequests: PullRequestRef[];
    private itemProvider = new ObservableArray<ITableItem | ObservableValue<ITableItem | undefined>>();

    constructor(props: Readonly<IReleaseNotesProps>) {
        super(props);
        this.state = {
            pullRequestIndex: undefined,
            pullRequest: undefined
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
                {this.state.pullRequest &&
                    (<div>
                        <ReleaseHeader pullRequest={this.state.pullRequest}/>
                        {(this.state.pullRequest instanceof PullRequestRef) && (
                            <Table<Partial<ITableItem>>
                            columns={issueColumns}
                            itemProvider={this.itemProvider}
                            showLines={false}
                        />)}
                    </div>)
                }
            </Card>
        );
    }

    private async initialize() {
        this.setState({ pullRequestIndex: undefined });
        this.pullRequests = await this.service.getTopPullRequests(this.props.repostitory.id);

        var hasPullRequests = this.pullRequests && this.pullRequests.length > 0;

        this.setState({
            pullRequestIndex: 0,
            pullRequest: hasPullRequests ? this.pullRequests[0] : new ZeroPullRequestRef()
        });

        if (hasPullRequests) {
            await this.initializeNotes(this.pullRequests[0].id);
        }
    }

    private async initializeNotes(pullRequestId: number) {
        this.itemProvider.removeAll();
        this.itemProvider.push(...new Array(5).fill(new ObservableValue<ITableItem | undefined>(undefined)));

        var notes = await this.service.getReleaseNotes(this.props.repostitory.id, pullRequestId);

        this.itemProvider.removeAll();
        this.itemProvider.push(...notes.map(x => issueToTableItem(x)));
    }
}
