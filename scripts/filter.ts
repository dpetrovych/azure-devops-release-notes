import { CachedValue } from "./data/CachedValue";

export interface IContributionFilter {
    allProjects: boolean;
    repositories: {key: string; name: string}[];
}

export interface IIndividualContributionFilter {
  allProjects: boolean;
  repositories: {key: string; name: string}[];
}

export function deepEqual(x, y): boolean {
  return (x && y && typeof x === 'object' && typeof y === 'object') ?
    (Object.keys(x).length === Object.keys(y).length) &&
      Object.keys(x).reduce(function(isEqual, key) {
        return isEqual && deepEqual(x[key], y[key]);
      }, true) : (x === y);
}

export const defaultFilter: CachedValue<IContributionFilter> = new CachedValue(getDefaultFilter);
async function getDefaultFilter(): Promise<IContributionFilter> {
  //const defaultRepo = await defaultRepostory.getValue();
  const repositories: {key: string, name: string}[] = [];

  const filter: IContributionFilter = {
    allProjects: false,
    repositories,
  };
  return filter;
}
