// import { CachedValue } from "../CachedValue";
// import { GitRepository, GitRestClient } from "azure-devops-extension-api/Git";
// import { getClient } from "azure-devops-extension-api";

// export const repositoriesVal = new CachedValue(() =>
//   getClient(GitRestClient).getRepositories()
// );

// export async function searchRepositories(allProjects: boolean): Promise<string[]> {
//   const repositories = await sortedRepos.getValue();
//   const selectedMap: {[key: string]: undefined} = {};
//   for (const {key} of selected || []) {
//     selectedMap[key] = undefined;
//   }
//   return repositories
//         .filter(r => (allProjects || r.project.id === proj) &&
//           r.name.toLocaleLowerCase().lastIndexOf(filter, 0) === 0
//         )
//         .filter(r => !selectedMap.hasOwnProperty(r.id))
//         .map(r => ({ key: r.id, name: r.name })
//     );
// }

// function getSortedRepos() {
//   return repositoriesVal.getValue().then(repositories => repositories.sort((a, b) =>
//     a.name.localeCompare(b.name)
//   ));
// }
// const sortedRepos = new CachedValue(getSortedRepos);

// export function getDefaultRepository(): Promise<GitRepository | undefined> {
//   const projName = VSS.getWebContext().project.name;
//   return sortedRepos.getValue().then(repositories => {

//     if (projName === "VSOnline") {
//       const [repo] = repositories.filter(r => r.name === "VSO" && r.project.name === "VSOnline");
//       if (repo) {
//         return repo;
//       }
//     }
//     return repositories.filter(r => r.name === projName)[0] || repositories[0];
//   });
// }
// export const defaultRepostory = new CachedValue(getDefaultRepository);
