// import { GitCommitRef } from "TFS/VersionControl/Contracts";
// import * as Q from "q";
// import { callApi } from "../RestCall";

// function getCommits(repoId: string, skip: number, top: number, author: string): Q.IPromise<GitCommitRef[]> {
//     const webContext = VSS.getWebContext();
//     const commitsUrl = webContext.collection.uri +
//         "_apis/git/repositories/" +
//          repoId +
//           "/Commits?api-version=1.0" +
//           "&author=" + encodeURIComponent(author) +
//           "&$skip=" + skip +
//           "&$top=" + top;

//     const defered = Q.defer<GitCommitRef[]>();
//     callApi(commitsUrl, "GET", undefined, undefined, (commits) => defered.resolve(commits.value), (error) => defered.reject(error));
//     return defered.promise;
// }

//const batchSize = 2000;
// async function commitsForRepository(username: string, repoId: string, skip = 0): Promise<GitCommitRef[]> {
//     return getCommits(repoId, skip, batchSize, username).then(commits => {
//         if (commits.length < batchSize) {
//             return commits.filter((c) => !c.comment.match(/Merged PR \d+/));
//         } else {
//             return commitsForRepository(username, repoId, skip + batchSize).then(moreCommits => [...commits, ...moreCommits]);
//         }
//     });
// }

