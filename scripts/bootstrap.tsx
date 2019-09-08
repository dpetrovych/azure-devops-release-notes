import "es6-promise/auto";
import * as SDK from "azure-devops-extension-sdk";

import { IHostNavigationService, CommonServiceIds } from "azure-devops-extension-api";
import { renderApp } from "./controls/app";
import { defaultFilter, IRepositoryFilter } from "./filter";

SDK.init();

SDK.getService<IHostNavigationService>(CommonServiceIds.HostNavigationService).then(async (navService) => {
    function updateHash(filter: IRepositoryFilter) {
      const hash = encodeURIComponent(JSON.stringify(filter));
      navService.setHash(hash);
    }

    async function parseHash(hash: string): Promise<IRepositoryFilter> {
      try {
        return JSON.parse(decodeURIComponent(hash));
      } catch (e) {
        if (hash) {
          console.log("could not parse hash", hash, e);
        }
        return defaultFilter.getValue();
      }
    }

    async function updateFromHash(hash: string) {
      const filter = await parseHash(hash);

      renderApp(updateHash, filter, true);
    }

    const hash = await navService.getHash();
    updateFromHash(hash);
    navService.onHashChanged(updateFromHash);
});

SDK.ready().then(async () => {
    SDK.register(SDK.getContributionId(), {});
});
