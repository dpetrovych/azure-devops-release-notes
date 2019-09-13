import * as React from "react";

import { ITableColumn, SimpleTableCell } from "azure-devops-ui/Table";
import { ISimpleListCell } from "azure-devops-ui/List";
import { Icon } from "azure-devops-ui/Icon";
import { Link } from "azure-devops-ui/Link";
import { PillGroup, PillGroupOverflow } from "azure-devops-ui/PillGroup";
import { Pill, PillSize } from "azure-devops-ui/Pill";
import { ObservableValue } from "azure-devops-ui/Core/Observable";
import { IssueStatus } from "./issueStatus";

export interface ITableItem {
    code: ISimpleListCell;
    title: string;
    tags?: string[];
    status: string;
}

function renderCell(columnIndex: number, tableColumn: ITableColumn<ITableItem>, contentClassName: string, child: JSX.Element | string): JSX.Element {
    return (
        <SimpleTableCell columnIndex={columnIndex} tableColumn={tableColumn} key={"col-" + columnIndex} contentClassName={contentClassName}>
            {child}
        </SimpleTableCell>
    );
}

export function renderCode(_rowIndex: number, columnIndex: number, tableColumn: ITableColumn<ITableItem>, tableItem: ITableItem): JSX.Element {
    return renderCell(columnIndex, tableColumn, "issue-cell-link", (
        <Link href={tableItem.code.href} subtle={true}>
            <Icon {...tableItem.code.iconProps} />{" " + tableItem.code.text}
        </Link>
    ));
}

function renderTitle(_rowIndex: number, columnIndex: number, tableColumn: ITableColumn<ITableItem>, tableItem: ITableItem): JSX.Element {
    return renderCell(columnIndex, tableColumn, "issue-cell", tableItem.title);
}

function renderTags(_rowIndex: number, columnIndex: number, tableColumn: ITableColumn<ITableItem>, tableItem: ITableItem): JSX.Element {
    return renderCell(columnIndex, tableColumn, "issue-cell-pill", (
        <PillGroup className="flex-row" overflow={PillGroupOverflow.fade}>
            {tableItem.tags!.map(t => (<Pill size={PillSize.compact}>{t}</Pill>))}
        </PillGroup>
    ));
}

function renderIssueStatus(_rowIndex: number, columnIndex: number, tableColumn: ITableColumn<ITableItem>, tableItem: ITableItem): JSX.Element {
    return renderCell(columnIndex, tableColumn, "issue-cell-pill", (<IssueStatus status={tableItem.status} />));
}

function onSizeSizable(_: MouseEvent, index: number, width: number) {
    (issueColumns[index].width as ObservableValue<number>).value = width;
}

export const issueColumns: ITableColumn<ITableItem>[] = [
    {
        id: "code",
        name: "Code",
        minWidth: 100,
        width: new ObservableValue(100),
        renderCell: renderCode,
        onSize: onSizeSizable
    },
    {
        id: "title",
        name: "Title",
        width: -100,
        renderCell: renderTitle,
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
