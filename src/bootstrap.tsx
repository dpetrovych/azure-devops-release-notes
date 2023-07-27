import "es6-promise/auto";
import './main.scss';
import { renderApp } from "../src/controls/app";
import { applyFabricUITheme } from "./styles";
import * as SDK from "azure-devops-extension-sdk";


SDK.init();
SDK.ready().then(async () => {
    renderApp();
    applyFabricUITheme();
    SDK.register(SDK.getContributionId(), {});
});
