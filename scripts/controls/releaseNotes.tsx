import * as React from "react";

import { Card } from "azure-devops-ui/Card";
import { renderSimpleCell, Table } from "azure-devops-ui/Table";
import { ObservableValue } from "azure-devops-ui/Core/Observable";
import { ISimpleListCell } from "azure-devops-ui/List";
import { ArrayItemProvider } from "azure-devops-ui/Utilities/Provider";

import { RepositoryRef } from "../data/repository";


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

const tableItems = new ArrayItemProvider<ITableItem>([
    {
        code: { iconProps: { iconName: "Home" }, text: "428" },
        title: "BP new sites - Launch sites in production",
        status: "Closed"
    },
    {
        code: { iconProps: { iconName: "Home" }, text: "427" },
        title: "BP new sites - Launch sites in production",
        status: "Resolved"
    },
    {
        code: { iconProps: { iconName: "Home" }, text: "426" },
        title: "BP new sites - Launch sites in production",
        status: "Active"
    }
]);

function onSizeSizable(_: MouseEvent, index: number, width: number) {
    (sizableColumns[index].width as ObservableValue<number>).value = width;
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
        onSize: onSizeSizable
    },
    {
        id: "tags",
        name: "Tags",
        width: new ObservableValue(100),
        renderCell: renderSimpleCell
    },
    {
        id: "status",
        name: "Status",
        width: new ObservableValue(100),
        renderCell: renderSimpleCell
    }
];

export class ReleaseNotes extends React.Component<IReleaseNotesProps, IReleaseNotesState> {
    constructor(props: Readonly<IReleaseNotesProps>) {
        super(props);
        this.state = {};
    }

    render() {
        return (
            <Card className="flex-grow" titleProps={{text: this.props.repostitory.name }}>
                <Table<Partial<ITableItem>>
                    columns={sizableColumns}
                    itemProvider={tableItems}
                    />
            </Card>
        );
    }
}
