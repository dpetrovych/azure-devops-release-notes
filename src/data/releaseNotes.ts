import { IdentityRef } from "azure-devops-extension-api/WebApi";
export class ZeroPullRequestRef {
    repositoryId: string;
}

export class PullRequestRef {
    id: number;
    repositoryId: string;
    title: string;
    status: string;
    creationDate: Date;
    createdBy: IdentityRef;

    constructor(fields?: Partial<PullRequestRef>) {
        Object.assign(this, fields);
    }
}

export class Issue {
    href: string;
    id: number;
    type: string;
    title: string;
    tags: string[];
    status: string;

    constructor(fields?: Partial<Issue>) {
        Object.assign(this, fields);
    }
}
