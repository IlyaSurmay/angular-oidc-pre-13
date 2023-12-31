import { ConfigurationProvider } from '../../config/provider/config.provider';
import { FlowsDataService } from '../../flows/flows-data.service';
import { LoggerService } from '../../logging/logger.service';
import { StoragePersistenceService } from '../../storage/storage-persistence.service';
import { JsrsAsignReducedService } from '../../validation/jsrsasign-reduced.service';
import { FlowHelper } from '../flowHelper/flow-helper.service';
import * as i0 from "@angular/core";
export declare class UrlService {
    private readonly configurationProvider;
    private readonly loggerService;
    private readonly flowsDataService;
    private readonly flowHelper;
    private storagePersistenceService;
    private jsrsAsignReducedService;
    constructor(configurationProvider: ConfigurationProvider, loggerService: LoggerService, flowsDataService: FlowsDataService, flowHelper: FlowHelper, storagePersistenceService: StoragePersistenceService, jsrsAsignReducedService: JsrsAsignReducedService);
    getUrlParameter(urlToCheck: any, name: any): string;
    isCallbackFromSts(currentUrl: string): boolean;
    getRefreshSessionSilentRenewUrl(configId: string, customParams?: {
        [key: string]: string | number | boolean;
    }): string;
    getAuthorizeParUrl(requestUri: string, configId: string): string;
    getAuthorizeUrl(configId: string, customParams?: {
        [key: string]: string | number | boolean;
    }): string;
    createEndSessionUrl(idTokenHint: string, configId: string, customParamsEndSession?: {
        [p: string]: string | number | boolean;
    }): string;
    createRevocationEndpointBodyAccessToken(token: any, configId: string): string;
    createRevocationEndpointBodyRefreshToken(token: any, configId: string): string;
    getRevocationEndpointUrl(configId: string): string;
    createBodyForCodeFlowCodeRequest(code: string, configId: string, customTokenParams?: {
        [p: string]: string | number | boolean;
    }): string;
    createBodyForCodeFlowRefreshTokensRequest(refreshToken: string, configId: string, customParamsRefresh?: {
        [key: string]: string | number | boolean;
    }): string;
    createBodyForParCodeFlowRequest(configId: string, customParamsRequest?: {
        [key: string]: string | number | boolean;
    }): string;
    private createAuthorizeUrl;
    private createUrlImplicitFlowWithSilentRenew;
    private createUrlCodeFlowWithSilentRenew;
    private createUrlImplicitFlowAuthorize;
    private createUrlCodeFlowAuthorize;
    private getRedirectUrl;
    private getSilentRenewUrl;
    private getPostLogoutRedirectUrl;
    private getClientId;
    private appendCustomParams;
    private overWriteParam;
    private createHttpParams;
    private isAuth0Endpoint;
    private composeAuth0Endpoint;
    static ɵfac: i0.ɵɵFactoryDeclaration<UrlService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<UrlService>;
}
