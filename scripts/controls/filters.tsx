import * as React from "react";

import { Dropdown } from "azure-devops-ui/Dropdown";
import { Observer } from "azure-devops-ui/Observer";
import { DropdownMultiSelection } from "azure-devops-ui/Utilities/DropdownSelection";

import { IRepositoryFilter } from "../filter";
import { GitRestClient } from "azure-devops-extension-api/Git";
import * as API from "azure-devops-extension-api";
import { IListBoxItem } from "azure-devops-ui/ListBox";

export interface IFiltersProps {
    onChanged: (filter: IRepositoryFilter) => void;
    filter: IRepositoryFilter;
    collapsible?: boolean;
}

interface IFiltersState {
    repos: IListBoxItem[];
}

export class Filters extends React.Component<IFiltersProps, IFiltersState> {
    private selection = new DropdownMultiSelection();

    constructor(props: Readonly<IFiltersProps>) {
        super(props);

        this.state = {
            repos: []
        };

        this.selection.subscribe(this.onSelectedChanged);

        let gitClient = API.getClient(GitRestClient);
        gitClient.getRepositories().then(repos => {
            var repositoryNames : IListBoxItem[] = repos.map(
                (x) : IListBoxItem => (
                    {
                        id: x.id,
                        text: x.name
                    }));

            this.setState({ ...this.state, repos: repositoryNames });
        });
    }

    render() {
        return (
            <div style={{ margin: "8px" }}>
                <Observer selection={this.selection}>
                    {() => {
                        return (
                            <Dropdown
                                actions={[
                                    {
                                        className: "bolt-dropdown-action-right-button",
                                        disabled: this.selection.selectedCount === 0,
                                        iconProps: { iconName: "Clear" },
                                        text: "Clear",
                                        onClick: () => {
                                            this.selection.clear();
                                        }
                                    }
                                ]}
                                className="projects-dropdown"
                                items={this.state.repos}
                                selection={this.selection}
                                placeholder="Select repositories..."
                                showFilterBox={true}
                            />
                        );
                    }
                    }
                </Observer>
            </div>
        );
    }

    private onSelectedChanged = () => {
        var selectedRepos = this.selection.value
            .map(x => this.state.repos.slice(x.beginIndex, x.endIndex + 1))
            .reduce((a, x) => a.concat(x), []);

        console.log(`Filter.onSelectedChanged: selected repost ${selectedRepos.map(r => r.text).join(',')}`);
        var filter: IRepositoryFilter = {
            repositories : selectedRepos.map(s => ({ key: s.id, name: s.text || "" }))};

        this.props.onChanged(filter);
    }
}

