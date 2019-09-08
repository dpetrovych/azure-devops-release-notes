import * as React from "react";
import * as ReactDOM from "react-dom";

import { IRepositoryFilter } from "../filter";
import { Filters, IFiltersProps } from "./filters";
import { ReleaseNotes } from "./releaseNotes";
import { ZeroData } from "azure-devops-ui/ZeroData";

import { RepositoryRef } from "../data/repository";

interface IAppState {
    repositories: RepositoryRef[];
}

class App extends React.Component<IFiltersProps, IAppState> {
    constructor(props: Readonly<IFiltersProps>) {
        super(props);
        this.state = {
            repositories: []
        };
    }

    render() {
        return (
            <div>
                <Filters
                    onChanged={this.onFilterChange}
                    filter={this.props.filter}
                    collapsible={this.props.collapsible}
                />
                {this.renderCards()}
            </div>
        );
    }

    private renderCards() {
        if (this.state.repositories.length === 0) {
            return <ZeroData
                primaryText="Hey, thanks for checking"
                secondaryText={
                    <span>
                        I'm still developing the plugin. Go ahead and select some project from a dropdown above to see if it works.
                    </span>
                }
                imageAltText="logo"
                imagePath={"../img/zerodata.png"}
            />;
        }

        return <div>
            {this.state.repositories.map((repo: RepositoryRef) => {
                return (<ReleaseNotes repostitory={repo} />);
            })}
        </div>;
    }

    private onFilterChange = (filter: IRepositoryFilter) => {
        this.setState({ repositories: filter.repositories.map(r => ({ id: r.key, name: r.name })) });
        //this.props.onChanged(filter);
    }
}

export function renderApp(
    onChanged: (filter: IRepositoryFilter) => void,
    initialFilter: IRepositoryFilter,
    collapsible: boolean = true,
    callback?: () => void,
) {
    const props = { onChanged, filter: initialFilter, collapsible };
    ReactDOM.render(
        <App {...props} />,
        document.getElementById("root"),
        callback
    );
}
