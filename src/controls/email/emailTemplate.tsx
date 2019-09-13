import * as React from "react";

export const copyEmailTemplate = () => {
    const template = document.getElementById('email-template');
    if (!template) { return; }

    var range = document.createRange();
    range.selectNode(template);
    window.getSelection()!.removeAllRanges();
    window.getSelection()!.addRange(range);
    document.execCommand('copy');
};

export class EmailTemplate extends React.Component<{}, {}> {
    render() {
        return (
            <div id="email-template">
                <div>
                    <span style={{ fontWeight: "bold", fontSize: "16px" }}>@projectModel.PullRequest.Repository.Name,
                    <span style={{ color: "red" }}>[DAY] [MONTH] [DATE], [TIME] CET</span></span>
                </div>
                <table style={{ width: "100%" }}>
                    <tbody>
                        <tr style={{ borderTop: "1px solid #dee2e6;" }}>
                            <td style={{ width: "1px" }}>
                                <a href="#">#@userStory.Id</a>
                            </td>
                            <td>
                                @userStory.Title
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        );
    }
}
