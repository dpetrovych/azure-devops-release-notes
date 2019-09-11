import "es6-promise/auto";
import * as SDK from "azure-devops-extension-sdk";

import { renderApp } from "./controls/app";

SDK.init();
SDK.ready().then(async () => {
    renderApp();
    SDK.register(SDK.getContributionId(), {});
});
