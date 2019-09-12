import * as React from "React";

interface IIssueStatusProps {
    status: string;
}

export class IssueStatus extends React.Component<IIssueStatusProps, {}>
{
    render() {
        return (
            <div className={`issue-status issue-status--${this.getModificator()}`}>
                <span> {this.props.status} </span>
            </div>
        );
    }

    getModificator() {
        return this.props.status.toLowerCase().replace(/\s/g, "-");
    }
}
