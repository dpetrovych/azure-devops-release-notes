import * as React from "react";
import { Report } from "../../data/app";
import * as moment from "moment";

export const copyEmailTemplate = () => {
    const template = document.getElementById('email-template');
    if (!template) { return; }

    const range = document.createRange();
    range.selectNode(template);
    window.getSelection()!.removeAllRanges();
    window.getSelection()!.addRange(range);
    document.execCommand('copy');
};

const formatDate = (date: Date | undefined) => date ? moment(date).format('DD MMM YYYY, hh:mm') : "[DAY] [MONTH] [DATE], [TIME]";

interface IEmailTemplateProps {
    pullState: () => Report;
}

interface IEmailTemplateState {
    report: Report | undefined;
}

export class EmailTemplate extends React.PureComponent<IEmailTemplateProps, IEmailTemplateState> {
    constructor(props) {
        super(props);
        this.state = {
            report: undefined
        };
    }

    componentDidMount() {
        this.setState({ report: this.props.pullState() });
    }

    render() {
        return (
            <div id="email-template">
                {this.state.report !== undefined && this.state.report.releases.map(release => (
                    <div className="email-template_project">
                        <div>
                            <span style={{ fontWeight: "bold", fontSize: "16px" }}>{release.repository.name},
                            <span style={{ color: "red" }}>{formatDate(release.releaseDate)} CET</span></span>
                        </div>
                        <table style={{ width: "100%" }}>
                            <tbody>
                                {release.issues.map(issue => (
                                    <tr style={{ borderTop: "1px solid #dee2e6" }}>
                                        <td style={{ width: "1px" }}>
                                            <a href={issue.href}>#{issue.id}</a>
                                        </td>
                                        <td>{issue.title}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ))}
            </div>
        );
    }
}
