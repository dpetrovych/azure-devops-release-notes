
import { PullRequestRef, Issue } from "./releaseNotes";
import { RepositoryRef } from "./repository";

export class Release {
    releaseDate: Date | undefined;
    repository: RepositoryRef;
    pullRequest: PullRequestRef;
    issues: Issue[];

    constructor(repoRef: RepositoryRef, prRef: PullRequestRef, issues: Issue[], date?: Date) {
        this.releaseDate = date;
        this.repository = repoRef;
        this.pullRequest = prRef;
        this.issues = issues;
    }
}

export class Report {
    releases: Release[];
}
