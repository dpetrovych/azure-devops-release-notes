import * as React from "react";

import { Card } from "azure-devops-ui/Card";
import { Table } from "azure-devops-ui/Table";
import { ObservableArray, ObservableValue } from "azure-devops-ui/Core/Observable";

import { RepositoryRef } from "../../data/repository";
import { Release } from "../../data/app";
import { ReleaseNotesService, Issue, PullRequestRef, ZeroPullRequestRef } from "../../data/releaseNotes";
import { ITableItem, issueColumns } from "./issueTable";
import { ReleaseHeader } from "./releaseHeader";
import { modificator } from "../helper/bem";


interface IReleaseNotesProps {
    repostitory: RepositoryRef;
}

interface IReleaseNotesState {
    pullRequestIndex: number | undefined;
    pullRequest: PullRequestRef | ZeroPullRequestRef | undefined;
}

const issueToTableItem = (issue: Issue): ITableItem => {
    return {
        code: {
            iconProps: { className: `issue_icon issue_icon--${modificator(issue.type)}` },
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
    private header: ReleaseHeader | null;
    private itemProvider = new ObservableArray<ITableItem | ObservableValue<ITableItem | undefined>>();
    private issues: Issue[] = [];

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
                        <ReleaseHeader pullRequest={this.state.pullRequest} ref={r => this.header = r}/>
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

    getRelease(): Release | null {
        if (this.state.pullRequest === undefined || this.state.pullRequest instanceof ZeroPullRequestRef) {
            return null;
        }

        return new Release(this.props.repostitory, this.state.pullRequest, this.issues, this.header!.getReleaseDate());
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
        this.itemProvider.push(...new Array(3).fill(new ObservableValue<ITableItem | undefined>(undefined)));

        this.issues = await this.service.getReleaseNotes(this.props.repostitory.id, pullRequestId);

        this.itemProvider.removeAll();
        this.itemProvider.push(...this.issues.map(x => issueToTableItem(x)));
    }
}
