import * as React from "react";

import { Card } from "azure-devops-ui/Card";
import {
    CustomHeader,
    HeaderIcon,
    HeaderTitle,
    HeaderTitleArea,
    HeaderTitleRow,
    TitleSize
} from "azure-devops-ui/Header";

import { renderSimpleCell, Table, ITableColumn, SimpleTableCell } from "azure-devops-ui/Table";
import { ObservableArray, ObservableValue } from "azure-devops-ui/Core/Observable";
import { ISimpleListCell } from "azure-devops-ui/List";
import { Pill, PillSize } from "azure-devops-ui/Pill";
import { PillGroup, PillGroupOverflow } from "azure-devops-ui/PillGroup";

import { RepositoryRef } from "../../data/repository";
import { ReleaseNotesService, ReleaseNotesIssue, PullRequestRef } from "../../data/releaseNotes";
import { IssueStatus } from "./issueStatus";

interface IReleaseNotesProps {
    repostitory: RepositoryRef;
}

interface IReleaseNotesState {
    pullRequestIndex: number | null;
}

interface ITableItem {
    code: ISimpleListCell;
    title: string;
    tags?: string[];
    status: string;
}

function onSizeSizable(_: MouseEvent, index: number, width: number) {
    (sizableColumns[index].width as ObservableValue<number>).value = width;
}

function renderIssueStatus(_rowIndex: number, columnIndex: number, tableColumn: ITableColumn<ITableItem>, tableItem: ITableItem): JSX.Element {
    return (
        <SimpleTableCell columnIndex={columnIndex} tableColumn={tableColumn} key={"col-" + columnIndex}>
            <IssueStatus status={tableItem.status} />
        </SimpleTableCell>
    );
}

function renderTags(_rowIndex: number, columnIndex: number, tableColumn: ITableColumn<ITableItem>, tableItem: ITableItem): JSX.Element {
    return (
        <SimpleTableCell columnIndex={columnIndex} tableColumn={tableColumn} key={"col-" + columnIndex}>
            <PillGroup className="flex-row" overflow={PillGroupOverflow.fade}>
                {tableItem.tags!.map(t => (<Pill>{t}</Pill>))}
            </PillGroup>
        </SimpleTableCell>
    );
}

const sizableColumns = [
    {
        id: "code",
        name: "Code",
        minWidth: 100,
        width: new ObservableValue(100),
        renderCell: renderSimpleCell,
        onSize: onSizeSizable
    },
    {
        id: "title",
        name: "Title",
        width: -100,
        renderCell: renderSimpleCell,
    },
    {
        id: "tags",
        name: "Tags",
        minWidth: 100,
        width: new ObservableValue(200),
        renderCell: renderTags,
        onSize: onSizeSizable
    },
    {
        id: "status",
        name: "Status",
        minWidth: 100,
        width: new ObservableValue(100),
        renderCell: renderIssueStatus,
        onSize: onSizeSizable
    }
];

export class ReleaseNotes extends React.Component<IReleaseNotesProps, IReleaseNotesState> {
    private service = new ReleaseNotesService();
    private pullRequests: PullRequestRef[];
    private itemProvider = new ObservableArray<ITableItem | ObservableValue<ITableItem | undefined>>();

    constructor(props: Readonly<IReleaseNotesProps>) {
        super(props);
        this.state = {
            pullRequestIndex: null
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
                {(this.state.pullRequestIndex !== null) &&
                    (<div>
                        <CustomHeader className="bolt-header-with-commandbar">
                            <HeaderIcon
                                className="bolt-table-status-icon-large"
                                iconProps={{ iconName: "OpenSource"}}
                                titleSize={TitleSize.Medium}
                            />
                            <HeaderTitleArea>
                                <HeaderTitleRow>
                                    <HeaderTitle className="text-ellipsis" titleSize={TitleSize.Medium}>
                                        {this.pullRequests[this.state.pullRequestIndex].title + " "}
                                        <PillGroup className="pull-request-status">
                                            <Pill size={PillSize.compact}>{this.pullRequests[this.state.pullRequestIndex].status}</Pill>
                                        </PillGroup>
                                    </HeaderTitle>
                                </HeaderTitleRow>
                                {/* <HeaderDescription>

                                </HeaderDescription> */}
                            </HeaderTitleArea>
                            {/* <HeaderCommandBar items={commandBarItemsAdvanced} /> */}
                        </CustomHeader>
                        <Table<Partial<ITableItem>>
                            columns={sizableColumns}
                            itemProvider={this.itemProvider}
                        />
                    </div>)
                }
            </Card>
        );
    }

    private async initialize() {
        this.setState({ pullRequestIndex: null });
        this.pullRequests = await this.service.getTopPullRequests(this.props.repostitory.id);

        this.setState({ pullRequestIndex: 0 });
        await this.initializeNotes(this.pullRequests[0].id);
    }

    private async initializeNotes(pullRequestId: number) {
        this.itemProvider.removeAll();
        this.itemProvider.push(...new Array(5).fill(new ObservableValue<ITableItem | undefined>(undefined)));

        var notes = await this.service.getReleaseNotes(this.props.repostitory.id, pullRequestId);

        this.itemProvider.removeAll();
        this.itemProvider.push(...notes.map(x => this.issueToRow(x)));
    }

    private issueToRow(issue: ReleaseNotesIssue): ITableItem {
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
    }
}
