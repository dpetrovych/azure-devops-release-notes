import * as React from "react";

import { Dropdown } from "azure-devops-ui/Dropdown";
import { Observer } from "azure-devops-ui/Observer";
import { DropdownMultiSelection } from "azure-devops-ui/Utilities/DropdownSelection";

import { GitRestClient } from "azure-devops-extension-api/Git";
import * as API from "azure-devops-extension-api";
import { IListBoxItem } from "azure-devops-ui/ListBox";

export interface IFiltersProps {
    filter: Promise<{ key: string; name: string }[]>;
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

        API.getClient(GitRestClient).getRepositories()
            .then(repos => {
                var repositoryNames: IListBoxItem[] = repos.map(
                    (x): IListBoxItem => (
                        {
                            id: x.id,
                            text: x.name
                        }));

                this.setState({ repos: repositoryNames });

                props.filter.then(selectedRepos => {
                    selectedRepos.forEach(srepo => {
                        repositoryNames.forEach((r, i) => {
                            if (r.id === srepo.key) {
                                this.selection.select(i);
                            }
                        });
                    });
                });
            });
    }

    render() {
        return (
            <div style={{ margin: "8px" }} className="flex-grow">
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

    getRepositories(): { key: string; name: string }[] {
        var selectedRepos = this.selection.value
            .map(x => this.state.repos.slice(x.beginIndex, x.endIndex + 1))
            .reduce((a, x) => a.concat(x), []);

        return selectedRepos.map(s => ({ key: s.id, name: s.text || "" }));
    }
}

