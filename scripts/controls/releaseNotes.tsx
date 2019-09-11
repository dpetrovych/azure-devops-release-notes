import * as React from "react";

import { Card } from "azure-devops-ui/Card";
import { renderSimpleCell, Table, ITableColumn, SimpleTableCell } from "azure-devops-ui/Table";
import { ObservableArray, ObservableValue } from "azure-devops-ui/Core/Observable";
import { ISimpleListCell } from "azure-devops-ui/List";
import { Pill } from "azure-devops-ui/Pill";
import { PillGroup, PillGroupOverflow } from "azure-devops-ui/PillGroup";

import { RepositoryRef } from "../data/repository";
import { ReleaseNotesService, ReleaseNotesIssue } from "../data/releaseNotes";

interface IReleaseNotesProps {
    repostitory: RepositoryRef;
}

interface IReleaseNotesState {

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

function renderStatus(_rowIndex: number, columnIndex: number, tableColumn: ITableColumn<ITableItem>, tableItem: ITableItem): JSX.Element {
    return (
        <SimpleTableCell
            columnIndex={columnIndex}
            tableColumn={tableColumn}
            key={"col-" + columnIndex}
        >
            <PillGroup className="flex-row" overflow={PillGroupOverflow.fade}>
               <Pill>{tableItem.status}</Pill>
            </PillGroup>
        </SimpleTableCell>
    );
}

function renderTags(_rowIndex: number, columnIndex: number, tableColumn: ITableColumn<ITableItem>, tableItem: ITableItem): JSX.Element {
    return (
        <SimpleTableCell
            columnIndex={columnIndex}
            tableColumn={tableColumn}
            key={"col-" + columnIndex}
        >
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
        renderCell: renderStatus,
        onSize: onSizeSizable
    }
];

export class ReleaseNotes extends React.Component<IReleaseNotesProps, IReleaseNotesState> {
    private service = new ReleaseNotesService();
    private itemProvider = new ObservableArray<
        ITableItem | ObservableValue<ITableItem | undefined>
    >(new Array(5).fill(new ObservableValue<ITableItem | undefined>(undefined)));


    constructor(props: Readonly<IReleaseNotesProps>) {
        super(props);
    }

    componentDidMount() {
        this.initialize();
    }

    render() {
        return (
            <Card className="flex-grow" titleProps={{ text: this.props.repostitory.name }}>
                <Table<Partial<ITableItem>>
                    columns={sizableColumns}
                    itemProvider={this.itemProvider}
                />
            </Card>
        );
    }

    private async initialize() {
        var notes = await this.service.getReleaseNotes(this.props.repostitory.id);
        this.itemProvider.removeAll();
        this.itemProvider.push(...notes!.issues.map(x => this.issueToRow(x)));
    }

    private issueToRow(issue: ReleaseNotesIssue): ITableItem {
        return {
            code: { iconProps: { iconName: "CheckMark" }, text: issue.id.toString() },
            title: issue.title,
            tags: issue.tags,
            status: issue.status
        };
    }
}
