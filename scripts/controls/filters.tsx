import * as React from "react";
import * as ReactDOM from "react-dom";

import { Dropdown } from "azure-devops-ui/Dropdown";
import { Observer } from "azure-devops-ui/Observer";
import { DropdownMultiSelection } from "azure-devops-ui/Utilities/DropdownSelection";

import { IContributionFilter } from "../filter";
import { GitRestClient } from "azure-devops-extension-api/Git";
import * as API from "azure-devops-extension-api";


interface IFiltersProps {
  onChanged: (filter: IContributionFilter) => void;
  filter: IContributionFilter;
  collapsible?: boolean;
}

class Filters extends React.Component<IFiltersProps, {}> {
    private repos:string[];
    private selection = new DropdownMultiSelection();

    constructor(props) {
        super(props);

        let gitClient = API.getClient(GitRestClient);
        gitClient.getRepositories().then(repos => this.repos = repos.map(x => x.name));
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
                            className="example-dropdown"
                            items={this.repos}
                            selection={this.selection}
                            placeholder="Select an Option"
                            showFilterBox={true}
                        />
                    );
                }}
            </Observer>
        </div>
    );
  }
}

export function renderFilters(
  onChanged: (filter: IContributionFilter) => void,
  initialFilter: IContributionFilter,
  collapsible: boolean = true,
  callback?: () => void,
) {
  const props = {onChanged, filter: initialFilter, collapsible};
  ReactDOM.render(
    <Filters {...props} />,
    document.getElementById("root"),
    callback
  );
}
