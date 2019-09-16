import * as React from "React";
import { modificator } from "../helper/bem";

interface IIssueStatusProps {
    status: string;
}

export function IssueStatus(props: IIssueStatusProps): JSX.Element
{
    return (
        <div className={`issue-status issue-status--${modificator(props.status)}`}>
            <span> {props.status} </span>
        </div>
    );
}
