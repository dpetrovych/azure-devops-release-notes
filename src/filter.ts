// import { CachedValue } from "./data/CachedValue";

// export interface IRepositoryFilter {
//     repositories: {key: string; name: string}[];
// }

// export interface IIndividualContributionFilter {
//   allProjects: boolean;
//   repositories: {key: string; name: string}[];
// }

// export function deepEqual(x, y): boolean {
//   return (x && y && typeof x === 'object' && typeof y === 'object') ?
//     (Object.keys(x).length === Object.keys(y).length) &&
//       Object.keys(x).reduce(function(isEqual, key) {
//         return isEqual && deepEqual(x[key], y[key]);
//       }, true) : (x === y);
// }

// export const defaultFilter: CachedValue<IRepositoryFilter> = new CachedValue(getDefaultFilter);
// async function getDefaultFilter(): Promise<IRepositoryFilter> {
//   //const defaultRepo = await defaultRepostory.getValue();
//   const repositories: {key: string, name: string}[] = [];

//   const filter: IRepositoryFilter = {
//     repositories,
//   };
//   return filter;
// }
