import * as React from "react";

import { ComboBox, IComboBox, IComboBoxOption } from "@fluentui/react";

import { GitRestClient } from "azure-devops-extension-api/Git";
import * as API from "azure-devops-extension-api";

export interface IFiltersProps {
    filter: Promise<{ key: string; name: string }[]>;
}

interface IFiltersState {
    repos: IComboBoxOption[];
    selected: string[];
}

export class Filters extends React.Component<IFiltersProps, IFiltersState> {

    private defaultSelectedRepoKeys: string[] = [];

    constructor(props: Readonly<IFiltersProps>) {
        super(props);

        this.state = {
            repos: [],
            selected: []
        };

        API.getClient(GitRestClient).getRepositories()
            .then(repos => {
                const repositoryNames: IComboBoxOption[] = repos.map(
                    (x): IComboBoxOption => (
                        {
                            key: x.id,
                            text: x.name
                        }));

                this.setState({ repos: repositoryNames });

                props.filter.then(selectedRepos => {
                    console.log(selectedRepos);
                    selectedRepos.forEach(srepo => {
                        repositoryNames.forEach((r) => {
                            if (r.key === srepo.key) {
                                this.defaultSelectedRepoKeys = [...this.defaultSelectedRepoKeys, r.key];
                                this.setState({ selected: [...this.state.selected, r.key] })
                            }
                        });
                    });
                });
            }
            );
    }

    render() {
        return (
            <div style={{ margin: "8px" }} className="flex-grow">
                <ComboBox
                    multiSelect
                    defaultSelectedKey={this.defaultSelectedRepoKeys}
                    selectedKey={this.state.selected}
                    onChange={this.onChange}
                    className="projects-dropdown"
                    options={this.state.repos}
                    placeholder="Select repositories..."
                    autoComplete={"on"}
                />
            </div>
        );
    }

    getRepositories(): { key: string; name: string }[] {
        const repos = this.state.repos;
        const selectedKeys = this.state.selected;
        const selectedRepos = repos.filter(repo => selectedKeys.find(selected => selected === repo.key));

        selectedRepos.map(selected => ({ key: selected.key as string, name: selected.text }));
        return selectedRepos.map(selected => ({ key: selected.key as string, name: selected.text }));;
    }
    private onChange = (_: React.FormEvent<IComboBox>, item: IComboBoxOption) => {
        if (item) {
            this.setState({ selected: item.selected ? [...this.state.selected, item.key as string] : this.state.selected.filter(key => key !== item.key) });
        }
    }
}

