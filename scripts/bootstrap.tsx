import "es6-promise/auto";
import * as React from "react";
import * as ReactDOM from "react-dom";
import * as SDK from "azure-devops-extension-sdk";

import { IHostNavigationService, CommonServiceIds } from "azure-devops-extension-api";
import { renderFilters } from "./controls/filters";
import { defaultFilter, IContributionFilter } from "./filter";

SDK.init();

SDK.getService<IHostNavigationService>(CommonServiceIds.HostNavigationService).then(async (navService) => {
    function updateHash(filter: IContributionFilter) {
      const hash = encodeURIComponent(JSON.stringify(filter));
      navService.setHash(hash);
    }

    async function parseHash(hash: string): Promise<IContributionFilter> {
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

      renderFilters(updateHash, filter, true);
    }

    const hash = await navService.getHash();
    updateFromHash(hash);
    navService.onHashChanged(updateFromHash);
});

SDK.register(SDK.getContributionId(), {});
SDK.ready();
