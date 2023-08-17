import * as React from "react";
import { Card } from "azure-devops-ui/Card";
import { Table } from "azure-devops-ui/Table";
import { ObservableArray, ObservableValue } from "azure-devops-ui/Core/Observable";

import { Release } from "../../data/app";

import { modificator } from "../helper/bem";
import { ITableItem, issueColumns } from "./issueTable";
import { ReleaseHeader } from "./releaseHeader";
import { Issue, PullRequestRef, ZeroPullRequestRef } from "../../data/releaseNotes";
import { ReleaseService } from "../../data/releases";
import { RepositoryRef } from "../../data/repository";
import { TagsService } from "../../data/services/TagService";
import { CommitService } from "../../data/services/CommitService";
import { Dropdown, IDropdownOption, Icon, Stack } from "@fluentui/react";
import { GitRef } from "azure-devops-extension-api/Git";
import { ReleaseNotesService } from "../../data/services/ReleaseNotesService";

interface IReleaseNotesState {
    pullRequestIndex: number | undefined;
    pullRequest: PullRequestRef | ZeroPullRequestRef | undefined;
    tags: IDropdownOption[];
    selected: { key: string | undefined }
}

interface IReleaseNotesProps {
    repostitory: RepositoryRef;
    releaseService: ReleaseService;
    tagService: TagsService;
    commitService: CommitService;
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
    private releaseNotesProvider = new ObservableArray<ITableItem | ObservableValue<ITableItem | undefined>>();
    private issues: Issue[] = [];

    private tags: GitRef[] = [];

    constructor(props: Readonly<IReleaseNotesProps>) {
        super(props);
        this.state = {
            pullRequestIndex: undefined,
            pullRequest: undefined,
            tags: [],
            selected: { key: undefined }
        }
    }

    async componentDidMount() {
        this.initialize();
        const { tagService } = this.props;

        this.tags = await tagService.getRefs(this.props.repostitory.id, "tags");

        this.setState({
            tags: this.tags.map(tag => {
                return {
                    key: tag.objectId,
                    text: [...tag.name.split('tags/')].pop()
                } as IDropdownOption
            })
        })

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
                        <ReleaseHeader pullRequest={this.state.pullRequest} releaseService={this.props.releaseService} ref={r => this.header = r} />
                    </div>)
                }
                <Dropdown
                    className="projects-dropdown"
                    options={this.state.tags}
                    placeholder="Select tags..."
                    onChange={this.onSelectionChange}
                    selectedKey={this.state.selected.key}
                    ariaLabel="From"
                    onRenderCaretDown={() => {
                        return (
                            <Stack horizontal verticalAlign={"center"}>
                                <Icon
                                    iconName={"ChevronDown"}
                                    styles={{
                                        root: {
                                            color: "rgb(96, 94, 92)",
                                            "&:hover": {
                                                fontWeight: 800
                                            }
                                        }
                                    }}
                                />

                            </Stack>
                        );
                    }}
                />
                <Table<Partial<ITableItem>>
                    columns={issueColumns}
                    itemProvider={this.releaseNotesProvider}
                    showLines={false}
                />
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

        const hasPullRequests = this.pullRequests && this.pullRequests.length > 0;

        this.setState({
            pullRequestIndex: 0,
            pullRequest: hasPullRequests ? this.pullRequests[0] : new ZeroPullRequestRef()
        });

    }


    private onSelectionChange = async (_: React.FormEvent<HTMLDivElement>, selection: IDropdownOption) => {
        this.releaseNotesProvider.removeAll();
        this.setState({ selected: { key: selection.key as string } })

        const selectedTag = this.tags.find(tag => tag.objectId === selection.key);
        const commitIdFromAnnotatedTag = (await this.props.tagService.getAnnotatedTag(this.props.repostitory.id, selectedTag!.objectId)).taggedObject.objectId;

        const commit = await this.props.commitService.getCommit(this.props.repostitory.id, commitIdFromAnnotatedTag);

        const commits = [commit, ...await this.props.commitService.getCommitsFromTagName(this.props.repostitory.id, selection.text)];

        const releaseNotesIssues = await this.service.getReleaseNotesIssuesBasedOnTags(this.props.repostitory.id, commits);

        this.issues = releaseNotesIssues;
        this.releaseNotesProvider.push(...releaseNotesIssues.map(releaseNoteIssue => issueToTableItem(releaseNoteIssue)));
    }

}
