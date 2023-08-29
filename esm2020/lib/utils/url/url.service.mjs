import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UriEncoder } from './uri-encoder';
import * as i0 from "@angular/core";
import * as i1 from "../../config/provider/config.provider";
import * as i2 from "../../logging/logger.service";
import * as i3 from "../../flows/flows-data.service";
import * as i4 from "../flowHelper/flow-helper.service";
import * as i5 from "../../storage/storage-persistence.service";
import * as i6 from "../../validation/jsrsasign-reduced.service";
const CALLBACK_PARAMS_TO_CHECK = ['code', 'state', 'token', 'id_token'];
const AUTH0_ENDPOINT = 'auth0.com';
export class UrlService {
    constructor(configurationProvider, loggerService, flowsDataService, flowHelper, storagePersistenceService, jsrsAsignReducedService) {
        this.configurationProvider = configurationProvider;
        this.loggerService = loggerService;
        this.flowsDataService = flowsDataService;
        this.flowHelper = flowHelper;
        this.storagePersistenceService = storagePersistenceService;
        this.jsrsAsignReducedService = jsrsAsignReducedService;
    }
    getUrlParameter(urlToCheck, name) {
        if (!urlToCheck) {
            return '';
        }
        if (!name) {
            return '';
        }
        name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
        const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
        const results = regex.exec(urlToCheck);
        return results === null ? '' : decodeURIComponent(results[1]);
    }
    isCallbackFromSts(currentUrl) {
        return CALLBACK_PARAMS_TO_CHECK.some((x) => !!this.getUrlParameter(currentUrl, x));
    }
    getRefreshSessionSilentRenewUrl(configId, customParams) {
        if (this.flowHelper.isCurrentFlowCodeFlow(configId)) {
            return this.createUrlCodeFlowWithSilentRenew(configId, customParams);
        }
        return this.createUrlImplicitFlowWithSilentRenew(configId, customParams) || '';
    }
    getAuthorizeParUrl(requestUri, configId) {
        const authWellKnownEndPoints = this.storagePersistenceService.read('authWellKnownEndPoints', configId);
        if (!authWellKnownEndPoints) {
            this.loggerService.logError(configId, 'authWellKnownEndpoints is undefined');
            return null;
        }
        const authorizationEndpoint = authWellKnownEndPoints.authorizationEndpoint;
        if (!authorizationEndpoint) {
            this.loggerService.logError(configId, `Can not create an authorize URL when authorizationEndpoint is '${authorizationEndpoint}'`);
            return null;
        }
        const { clientId } = this.configurationProvider.getOpenIDConfiguration(configId);
        if (!clientId) {
            this.loggerService.logError(configId, `getAuthorizeParUrl could not add clientId because it was: `, clientId);
            return null;
        }
        const urlParts = authorizationEndpoint.split('?');
        const authorizationUrl = urlParts[0];
        const existingParams = urlParts[1];
        let params = this.createHttpParams(existingParams);
        params = params.set('request_uri', requestUri);
        params = params.append('client_id', clientId);
        return `${authorizationUrl}?${params}`;
    }
    getAuthorizeUrl(configId, customParams) {
        if (this.flowHelper.isCurrentFlowCodeFlow(configId)) {
            return this.createUrlCodeFlowAuthorize(configId, customParams);
        }
        return this.createUrlImplicitFlowAuthorize(configId, customParams) || '';
    }
    createEndSessionUrl(idTokenHint, configId, customParamsEndSession) {
        // Auth0 needs a special logout url
        // See https://auth0.com/docs/api/authentication#logout
        if (this.isAuth0Endpoint(configId)) {
            return this.composeAuth0Endpoint(configId);
        }
        const authWellKnownEndPoints = this.storagePersistenceService.read('authWellKnownEndPoints', configId);
        const endSessionEndpoint = authWellKnownEndPoints?.endSessionEndpoint;
        if (!endSessionEndpoint) {
            return null;
        }
        const urlParts = endSessionEndpoint.split('?');
        const authorizationEndSessionUrl = urlParts[0];
        const existingParams = urlParts[1];
        let params = this.createHttpParams(existingParams);
        params = params.set('id_token_hint', idTokenHint);
        const postLogoutRedirectUri = this.getPostLogoutRedirectUrl(configId);
        if (postLogoutRedirectUri) {
            params = params.append('post_logout_redirect_uri', postLogoutRedirectUri);
        }
        if (customParamsEndSession) {
            params = this.appendCustomParams({ ...customParamsEndSession }, params);
        }
        return `${authorizationEndSessionUrl}?${params}`;
    }
    createRevocationEndpointBodyAccessToken(token, configId) {
        const clientId = this.getClientId(configId);
        if (!clientId) {
            return null;
        }
        let params = this.createHttpParams();
        params = params.set('client_id', clientId);
        params = params.set('token', token);
        params = params.set('token_type_hint', 'access_token');
        return params.toString();
    }
    createRevocationEndpointBodyRefreshToken(token, configId) {
        const clientId = this.getClientId(configId);
        if (!clientId) {
            return null;
        }
        let params = this.createHttpParams();
        params = params.set('client_id', clientId);
        params = params.set('token', token);
        params = params.set('token_type_hint', 'refresh_token');
        return params.toString();
    }
    getRevocationEndpointUrl(configId) {
        const authWellKnownEndPoints = this.storagePersistenceService.read('authWellKnownEndPoints', configId);
        const revocationEndpoint = authWellKnownEndPoints?.revocationEndpoint;
        if (!revocationEndpoint) {
            return null;
        }
        const urlParts = revocationEndpoint.split('?');
        const revocationEndpointUrl = urlParts[0];
        return revocationEndpointUrl;
    }
    createBodyForCodeFlowCodeRequest(code, configId, customTokenParams) {
        const codeVerifier = this.flowsDataService.getCodeVerifier(configId);
        if (!codeVerifier) {
            this.loggerService.logError(configId, `CodeVerifier is not set `, codeVerifier);
            return null;
        }
        const clientId = this.getClientId(configId);
        if (!clientId) {
            return null;
        }
        let params = this.createHttpParams();
        params = params.set('grant_type', 'authorization_code');
        params = params.set('client_id', clientId);
        params = params.set('code_verifier', codeVerifier);
        params = params.set('code', code);
        if (customTokenParams) {
            params = this.appendCustomParams({ ...customTokenParams }, params);
        }
        const silentRenewUrl = this.getSilentRenewUrl(configId);
        if (this.flowsDataService.isSilentRenewRunning(configId) && silentRenewUrl) {
            params = params.set('redirect_uri', silentRenewUrl);
            return params.toString();
        }
        const redirectUrl = this.getRedirectUrl(configId);
        if (!redirectUrl) {
            return null;
        }
        params = params.set('redirect_uri', redirectUrl);
        return params.toString();
    }
    createBodyForCodeFlowRefreshTokensRequest(refreshToken, configId, customParamsRefresh) {
        const clientId = this.getClientId(configId);
        if (!clientId) {
            return null;
        }
        let params = this.createHttpParams();
        params = params.set('grant_type', 'refresh_token');
        params = params.set('client_id', clientId);
        params = params.set('refresh_token', refreshToken);
        if (customParamsRefresh) {
            params = this.appendCustomParams({ ...customParamsRefresh }, params);
        }
        return params.toString();
    }
    createBodyForParCodeFlowRequest(configId, customParamsRequest) {
        const redirectUrl = this.getRedirectUrl(configId);
        if (!redirectUrl) {
            return null;
        }
        const state = this.flowsDataService.getExistingOrCreateAuthStateControl(configId);
        const nonce = this.flowsDataService.createNonce(configId);
        this.loggerService.logDebug(configId, 'Authorize created. adding myautostate: ' + state);
        // code_challenge with "S256"
        const codeVerifier = this.flowsDataService.createCodeVerifier(configId);
        const codeChallenge = this.jsrsAsignReducedService.generateCodeChallenge(codeVerifier);
        const { clientId, responseType, scope, hdParam, customParamsAuthRequest } = this.configurationProvider.getOpenIDConfiguration(configId);
        let params = this.createHttpParams('');
        params = params.set('client_id', clientId);
        params = params.append('redirect_uri', redirectUrl);
        params = params.append('response_type', responseType);
        params = params.append('scope', scope);
        params = params.append('nonce', nonce);
        params = params.append('state', state);
        params = params.append('code_challenge', codeChallenge);
        params = params.append('code_challenge_method', 'S256');
        if (hdParam) {
            params = params.append('hd', hdParam);
        }
        if (customParamsAuthRequest) {
            params = this.appendCustomParams({ ...customParamsAuthRequest }, params);
        }
        if (customParamsRequest) {
            params = this.appendCustomParams({ ...customParamsRequest }, params);
        }
        return params.toString();
    }
    createAuthorizeUrl(codeChallenge, redirectUrl, nonce, state, configId, prompt, customRequestParams) {
        const authWellKnownEndPoints = this.storagePersistenceService.read('authWellKnownEndPoints', configId);
        const authorizationEndpoint = authWellKnownEndPoints?.authorizationEndpoint;
        if (!authorizationEndpoint) {
            this.loggerService.logError(configId, `Can not create an authorize URL when authorizationEndpoint is '${authorizationEndpoint}'`);
            return null;
        }
        const { clientId, responseType, scope, hdParam, customParamsAuthRequest } = this.configurationProvider.getOpenIDConfiguration(configId);
        if (!clientId) {
            this.loggerService.logError(configId, `createAuthorizeUrl could not add clientId because it was: `, clientId);
            return null;
        }
        if (!responseType) {
            this.loggerService.logError(configId, `createAuthorizeUrl could not add responseType because it was: `, responseType);
            return null;
        }
        if (!scope) {
            this.loggerService.logError(configId, `createAuthorizeUrl could not add scope because it was: `, scope);
            return null;
        }
        const urlParts = authorizationEndpoint.split('?');
        const authorizationUrl = urlParts[0];
        const existingParams = urlParts[1];
        let params = this.createHttpParams(existingParams);
        params = params.set('client_id', clientId);
        params = params.append('redirect_uri', redirectUrl);
        params = params.append('response_type', responseType);
        params = params.append('scope', scope);
        params = params.append('nonce', nonce);
        params = params.append('state', state);
        if (this.flowHelper.isCurrentFlowCodeFlow(configId)) {
            params = params.append('code_challenge', codeChallenge);
            params = params.append('code_challenge_method', 'S256');
        }
        const mergedParams = { ...customParamsAuthRequest, ...customRequestParams };
        if (Object.keys(mergedParams).length > 0) {
            params = this.appendCustomParams({ ...mergedParams }, params);
        }
        if (prompt) {
            params = this.overWriteParam(params, 'prompt', prompt);
        }
        if (hdParam) {
            params = params.append('hd', hdParam);
        }
        return `${authorizationUrl}?${params}`;
    }
    createUrlImplicitFlowWithSilentRenew(configId, customParams) {
        const state = this.flowsDataService.getExistingOrCreateAuthStateControl(configId);
        const nonce = this.flowsDataService.createNonce(configId);
        const silentRenewUrl = this.getSilentRenewUrl(configId);
        if (!silentRenewUrl) {
            return null;
        }
        this.loggerService.logDebug(configId, 'RefreshSession created. adding myautostate: ', state);
        const authWellKnownEndPoints = this.storagePersistenceService.read('authWellKnownEndPoints', configId);
        if (authWellKnownEndPoints) {
            return this.createAuthorizeUrl('', silentRenewUrl, nonce, state, configId, 'none', customParams);
        }
        this.loggerService.logError(configId, 'authWellKnownEndpoints is undefined');
        return null;
    }
    createUrlCodeFlowWithSilentRenew(configId, customParams) {
        const state = this.flowsDataService.getExistingOrCreateAuthStateControl(configId);
        const nonce = this.flowsDataService.createNonce(configId);
        this.loggerService.logDebug(configId, 'RefreshSession created. adding myautostate: ' + state);
        // code_challenge with "S256"
        const codeVerifier = this.flowsDataService.createCodeVerifier(configId);
        const codeChallenge = this.jsrsAsignReducedService.generateCodeChallenge(codeVerifier);
        const silentRenewUrl = this.getSilentRenewUrl(configId);
        if (!silentRenewUrl) {
            return null;
        }
        const authWellKnownEndPoints = this.storagePersistenceService.read('authWellKnownEndPoints', configId);
        if (authWellKnownEndPoints) {
            return this.createAuthorizeUrl(codeChallenge, silentRenewUrl, nonce, state, configId, 'none', customParams);
        }
        this.loggerService.logWarning(configId, 'authWellKnownEndpoints is undefined');
        return null;
    }
    createUrlImplicitFlowAuthorize(configId, customParams) {
        const state = this.flowsDataService.getExistingOrCreateAuthStateControl(configId);
        const nonce = this.flowsDataService.createNonce(configId);
        this.loggerService.logDebug(configId, 'Authorize created. adding myautostate: ' + state);
        const redirectUrl = this.getRedirectUrl(configId);
        if (!redirectUrl) {
            return null;
        }
        const authWellKnownEndPoints = this.storagePersistenceService.read('authWellKnownEndPoints', configId);
        if (authWellKnownEndPoints) {
            return this.createAuthorizeUrl('', redirectUrl, nonce, state, configId, null, customParams);
        }
        this.loggerService.logError(configId, 'authWellKnownEndpoints is undefined');
        return null;
    }
    createUrlCodeFlowAuthorize(configId, customParams) {
        const state = this.flowsDataService.getExistingOrCreateAuthStateControl(configId);
        const nonce = this.flowsDataService.createNonce(configId);
        this.loggerService.logDebug(configId, 'Authorize created. adding myautostate: ' + state);
        const redirectUrl = this.getRedirectUrl(configId);
        if (!redirectUrl) {
            return null;
        }
        // code_challenge with "S256"
        const codeVerifier = this.flowsDataService.createCodeVerifier(configId);
        const codeChallenge = this.jsrsAsignReducedService.generateCodeChallenge(codeVerifier);
        const authWellKnownEndPoints = this.storagePersistenceService.read('authWellKnownEndPoints', configId);
        if (authWellKnownEndPoints) {
            return this.createAuthorizeUrl(codeChallenge, redirectUrl, nonce, state, configId, null, customParams);
        }
        this.loggerService.logError(configId, 'authWellKnownEndpoints is undefined');
        return null;
    }
    getRedirectUrl(configId) {
        const { redirectUrl } = this.configurationProvider.getOpenIDConfiguration(configId);
        if (!redirectUrl) {
            this.loggerService.logError(configId, `could not get redirectUrl, was: `, redirectUrl);
            null;
        }
        return redirectUrl;
    }
    getSilentRenewUrl(configId) {
        const { silentRenewUrl } = this.configurationProvider.getOpenIDConfiguration(configId);
        if (!silentRenewUrl) {
            this.loggerService.logError(configId, `could not get silentRenewUrl, was: `, silentRenewUrl);
            return null;
        }
        return silentRenewUrl;
    }
    getPostLogoutRedirectUrl(configId) {
        const { postLogoutRedirectUri } = this.configurationProvider.getOpenIDConfiguration(configId);
        if (!postLogoutRedirectUri) {
            this.loggerService.logError(configId, `could not get postLogoutRedirectUri, was: `, postLogoutRedirectUri);
            return null;
        }
        return postLogoutRedirectUri;
    }
    getClientId(configId) {
        const { clientId } = this.configurationProvider.getOpenIDConfiguration(configId);
        if (!clientId) {
            this.loggerService.logError(configId, `could not get clientId, was: `, clientId);
            return null;
        }
        return clientId;
    }
    appendCustomParams(customParams, params) {
        for (const [key, value] of Object.entries({ ...customParams })) {
            params = params.append(key, value.toString());
        }
        return params;
    }
    overWriteParam(params, key, value) {
        return params.set(key, value);
    }
    createHttpParams(existingParams) {
        existingParams = existingParams ?? '';
        const params = new HttpParams({
            fromString: existingParams,
            encoder: new UriEncoder(),
        });
        return params;
    }
    isAuth0Endpoint(configId) {
        const { authority } = this.configurationProvider.getOpenIDConfiguration(configId);
        if (!authority) {
            return false;
        }
        return authority.endsWith(AUTH0_ENDPOINT);
    }
    composeAuth0Endpoint(configId) {
        // format: https://YOUR_DOMAIN/v2/logout?client_id=YOUR_CLIENT_ID&returnTo=LOGOUT_URL
        const { authority, clientId } = this.configurationProvider.getOpenIDConfiguration(configId);
        const postLogoutRedirectUrl = this.getPostLogoutRedirectUrl(configId);
        return `${authority}/v2/logout?client_id=${clientId}&returnTo=${postLogoutRedirectUrl}`;
    }
}
UrlService.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: UrlService, deps: [{ token: i1.ConfigurationProvider }, { token: i2.LoggerService }, { token: i3.FlowsDataService }, { token: i4.FlowHelper }, { token: i5.StoragePersistenceService }, { token: i6.JsrsAsignReducedService }], target: i0.ɵɵFactoryTarget.Injectable });
UrlService.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: UrlService });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: UrlService, decorators: [{
            type: Injectable
        }], ctorParameters: function () { return [{ type: i1.ConfigurationProvider }, { type: i2.LoggerService }, { type: i3.FlowsDataService }, { type: i4.FlowHelper }, { type: i5.StoragePersistenceService }, { type: i6.JsrsAsignReducedService }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXJsLnNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy9hbmd1bGFyLWF1dGgtb2lkYy1jbGllbnQvc3JjL2xpYi91dGlscy91cmwvdXJsLnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBQ2xELE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFPM0MsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGVBQWUsQ0FBQzs7Ozs7Ozs7QUFFM0MsTUFBTSx3QkFBd0IsR0FBRyxDQUFDLE1BQU0sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLFVBQVUsQ0FBQyxDQUFDO0FBQ3hFLE1BQU0sY0FBYyxHQUFHLFdBQVcsQ0FBQztBQUduQyxNQUFNLE9BQU8sVUFBVTtJQUNyQixZQUNtQixxQkFBNEMsRUFDNUMsYUFBNEIsRUFDNUIsZ0JBQWtDLEVBQ2xDLFVBQXNCLEVBQy9CLHlCQUFvRCxFQUNwRCx1QkFBZ0Q7UUFMdkMsMEJBQXFCLEdBQXJCLHFCQUFxQixDQUF1QjtRQUM1QyxrQkFBYSxHQUFiLGFBQWEsQ0FBZTtRQUM1QixxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQWtCO1FBQ2xDLGVBQVUsR0FBVixVQUFVLENBQVk7UUFDL0IsOEJBQXlCLEdBQXpCLHlCQUF5QixDQUEyQjtRQUNwRCw0QkFBdUIsR0FBdkIsdUJBQXVCLENBQXlCO0lBQ3ZELENBQUM7SUFFSixlQUFlLENBQUMsVUFBZSxFQUFFLElBQVM7UUFDeEMsSUFBSSxDQUFDLFVBQVUsRUFBRTtZQUNmLE9BQU8sRUFBRSxDQUFDO1NBQ1g7UUFFRCxJQUFJLENBQUMsSUFBSSxFQUFFO1lBQ1QsT0FBTyxFQUFFLENBQUM7U0FDWDtRQUVELElBQUksR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsQ0FBQyxPQUFP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dCB7IEh0dHBQYXJhbXMgfSBmcm9tICdAYW5ndWxhci9jb21tb24vaHR0cCc7XG5pbXBvcnQgeyBJbmplY3RhYmxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBDb25maWd1cmF0aW9uUHJvdmlkZXIgfSBmcm9tICcuLi8uLi9jb25maWcvcHJvdmlkZXIvY29uZmlnLnByb3ZpZGVyJztcbmltcG9ydCB7IEZsb3dzRGF0YVNlcnZpY2UgfSBmcm9tICcuLi8uLi9mbG93cy9mbG93cy1kYXRhLnNlcnZpY2UnO1xuaW1wb3J0IHsgTG9nZ2VyU2VydmljZSB9IGZyb20gJy4uLy4uL2xvZ2dpbmcvbG9nZ2VyLnNlcnZpY2UnO1xuaW1wb3J0IHsgU3RvcmFnZVBlcnNpc3RlbmNlU2VydmljZSB9IGZyb20gJy4uLy4uL3N0b3JhZ2Uvc3RvcmFnZS1wZXJzaXN0ZW5jZS5zZXJ2aWNlJztcbmltcG9ydCB7IEpzcnNBc2lnblJlZHVjZWRTZXJ2aWNlIH0gZnJvbSAnLi4vLi4vdmFsaWRhdGlvbi9qc3JzYXNpZ24tcmVkdWNlZC5zZXJ2aWNlJztcbmltcG9ydCB7IEZsb3dIZWxwZXIgfSBmcm9tICcuLi9mbG93SGVscGVyL2Zsb3ctaGVscGVyLnNlcnZpY2UnO1xuaW1wb3J0IHsgVXJpRW5jb2RlciB9IGZyb20gJy4vdXJpLWVuY29kZXInO1xuXG5jb25zdCBDQUxMQkFDS19QQVJBTVNfVE9fQ0hFQ0sgPSBbJ2NvZGUnLCAnc3RhdGUnLCAndG9rZW4nLCAnaWRfdG9rZW4nXTtcbmNvbnN0IEFVVEgwX0VORFBPSU5UID0gJ2F1dGgwLmNvbSc7XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBVcmxTZXJ2aWNlIHtcbiAgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSByZWFkb25seSBjb25maWd1cmF0aW9uUHJvdmlkZXI6IENvbmZpZ3VyYXRpb25Qcm92aWRlcixcbiAgICBwcml2YXRlIHJlYWRvbmx5IGxvZ2dlclNlcnZpY2U6IExvZ2dlclNlcnZpY2UsXG4gICAgcHJpdmF0ZSByZWFkb25seSBmbG93c0RhdGFTZXJ2aWNlOiBGbG93c0RhdGFTZXJ2aWNlLFxuICAgIHByaXZhdGUgcmVhZG9ubHkgZmxvd0hlbHBlcjogRmxvd0hlbHBlcixcbiAgICBwcml2YXRlIHN0b3JhZ2VQZXJzaXN0ZW5jZVNlcnZpY2U6IFN0b3JhZ2VQZXJzaXN0ZW5jZVNlcnZpY2UsXG4gICAgcHJpdmF0ZSBqc3JzQXNpZ25SZWR1Y2VkU2VydmljZTogSnNyc0FzaWduUmVkdWNlZFNlcnZpY2VcbiAgKSB7fVxuXG4gIGdldFVybFBhcmFtZXRlcih1cmxUb0NoZWNrOiBhbnksIG5hbWU6IGFueSk6IHN0cmluZyB7XG4gICAgaWYgKCF1cmxUb0NoZWNrKSB7XG4gICAgICByZXR1cm4gJyc7XG4gICAgfVxuXG4gICAgaWYgKCFuYW1lKSB7XG4gICAgICByZXR1cm4gJyc7XG4gICAgfVxuXG4gICAgbmFtZSA9IG5hbWUucmVwbGFjZSgvW1xcW10vLCAnXFxcXFsnKS5yZXBsYWNlKC9bXFxdXS8sICdcXFxcXScpO1xuICAgIGNvbnN0IHJlZ2V4ID0gbmV3IFJlZ0V4cCgnW1xcXFw/Jl0nICsgbmFtZSArICc9KFteJiNdKiknKTtcbiAgICBjb25zdCByZXN1bHRzID0gcmVnZXguZXhlYyh1cmxUb0NoZWNrKTtcblxuICAgIHJldHVybiByZXN1bHRzID09PSBudWxsID8gJycgOiBkZWNvZGVVUklDb21wb25lbnQocmVzdWx0c1sxXSk7XG4gIH1cblxuICBpc0NhbGxiYWNrRnJvbVN0cyhjdXJyZW50VXJsOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICByZXR1cm4gQ0FMTEJBQ0tfUEFSQU1TX1RPX0NIRUNLLnNvbWUoKHgpID0+ICEhdGhpcy5nZXRVcmxQYXJhbWV0ZXIoY3VycmVudFVybCwgeCkpO1xuICB9XG5cbiAgZ2V0UmVmcmVzaFNlc3Npb25TaWxlbnRSZW5ld1VybChjb25maWdJZDogc3RyaW5nLCBjdXN0b21QYXJhbXM/OiB7IFtrZXk6IHN0cmluZ106IHN0cmluZyB8IG51bWJlciB8IGJvb2xlYW4gfSk6IHN0cmluZyB7XG4gICAgaWYgKHRoaXMuZmxvd0hlbHBlci5pc0N1cnJlbnRGbG93Q29kZUZsb3coY29uZmlnSWQpKSB7XG4gICAgICByZXR1cm4gdGhpcy5jcmVhdGVVcmxDb2RlRmxvd1dpdGhTaWxlbnRSZW5ldyhjb25maWdJZCwgY3VzdG9tUGFyYW1zKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5jcmVhdGVVcmxJbXBsaWNpdEZsb3dXaXRoU2lsZW50UmVuZXcoY29uZmlnSWQsIGN1c3RvbVBhcmFtcykgfHwgJyc7XG4gIH1cblxuICBnZXRBdXRob3JpemVQYXJVcmwocmVxdWVzdFVyaTogc3RyaW5nLCBjb25maWdJZDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICBjb25zdCBhdXRoV2VsbEtub3duRW5kUG9pbnRzID0gdGhpcy5zdG9yYWdlUGVyc2lzdGVuY2VTZXJ2aWNlLnJlYWQoJ2F1dGhXZWxsS25vd25FbmRQb2ludHMnLCBjb25maWdJZCk7XG5cbiAgICBpZiAoIWF1dGhXZWxsS25vd25FbmRQb2ludHMpIHtcbiAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dFcnJvcihjb25maWdJZCwgJ2F1dGhXZWxsS25vd25FbmRwb2ludHMgaXMgdW5kZWZpbmVkJyk7XG5cbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGNvbnN0IGF1dGhvcml6YXRpb25FbmRwb2ludCA9IGF1dGhXZWxsS25vd25FbmRQb2ludHMuYXV0aG9yaXphdGlvbkVuZHBvaW50O1xuXG4gICAgaWYgKCFhdXRob3JpemF0aW9uRW5kcG9pbnQpIHtcbiAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dFcnJvcihjb25maWdJZCwgYENhbiBub3QgY3JlYXRlIGFuIGF1dGhvcml6ZSBVUkwgd2hlbiBhdXRob3JpemF0aW9uRW5kcG9pbnQgaXMgJyR7YXV0aG9yaXphdGlvbkVuZHBvaW50fSdgKTtcblxuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgY29uc3QgeyBjbGllbnRJZCB9ID0gdGhpcy5jb25maWd1cmF0aW9uUHJvdmlkZXIuZ2V0T3BlbklEQ29uZmlndXJhdGlvbihjb25maWdJZCk7XG5cbiAgICBpZiAoIWNsaWVudElkKSB7XG4gICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRXJyb3IoY29uZmlnSWQsIGBnZXRBdXRob3JpemVQYXJVcmwgY291bGQgbm90IGFkZCBjbGllbnRJZCBiZWNhdXNlIGl0IHdhczogYCwgY2xpZW50SWQpO1xuXG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBjb25zdCB1cmxQYXJ0cyA9IGF1dGhvcml6YXRpb25FbmRwb2ludC5zcGxpdCgnPycpO1xuICAgIGNvbnN0IGF1dGhvcml6YXRpb25VcmwgPSB1cmxQYXJ0c1swXTtcbiAgICBjb25zdCBleGlzdGluZ1BhcmFtcyA9IHVybFBhcnRzWzFdO1xuICAgIGxldCBwYXJhbXMgPSB0aGlzLmNyZWF0ZUh0dHBQYXJhbXMoZXhpc3RpbmdQYXJhbXMpO1xuXG4gICAgcGFyYW1zID0gcGFyYW1zLnNldCgncmVxdWVzdF91cmknLCByZXF1ZXN0VXJpKTtcbiAgICBwYXJhbXMgPSBwYXJhbXMuYXBwZW5kKCdjbGllbnRfaWQnLCBjbGllbnRJZCk7XG5cbiAgICByZXR1cm4gYCR7YXV0aG9yaXphdGlvblVybH0/JHtwYXJhbXN9YDtcbiAgfVxuXG4gIGdldEF1dGhvcml6ZVVybChjb25maWdJZDogc3RyaW5nLCBjdXN0b21QYXJhbXM/OiB7IFtrZXk6IHN0cmluZ106IHN0cmluZyB8IG51bWJlciB8IGJvb2xlYW4gfSk6IHN0cmluZyB7XG4gICAgaWYgKHRoaXMuZmxvd0hlbHBlci5pc0N1cnJlbnRGbG93Q29kZUZsb3coY29uZmlnSWQpKSB7XG4gICAgICByZXR1cm4gdGhpcy5jcmVhdGVVcmxDb2RlRmxvd0F1dGhvcml6ZShjb25maWdJZCwgY3VzdG9tUGFyYW1zKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5jcmVhdGVVcmxJbXBsaWNpdEZsb3dBdXRob3JpemUoY29uZmlnSWQsIGN1c3RvbVBhcmFtcykgfHwgJyc7XG4gIH1cblxuICBjcmVhdGVFbmRTZXNzaW9uVXJsKGlkVG9rZW5IaW50OiBzdHJpbmcsIGNvbmZpZ0lkOiBzdHJpbmcsIGN1c3RvbVBhcmFtc0VuZFNlc3Npb24/OiB7IFtwOiBzdHJpbmddOiBzdHJpbmcgfCBudW1iZXIgfCBib29sZWFuIH0pOiBzdHJpbmcge1xuICAgIC8vIEF1dGgwIG5lZWRzIGEgc3BlY2lhbCBsb2dvdXQgdXJsXG4gICAgLy8gU2VlIGh0dHBzOi8vYXV0aDAuY29tL2RvY3MvYXBpL2F1dGhlbnRpY2F0aW9uI2xvZ291dFxuXG4gICAgaWYgKHRoaXMuaXNBdXRoMEVuZHBvaW50KGNvbmZpZ0lkKSkge1xuICAgICAgcmV0dXJuIHRoaXMuY29tcG9zZUF1dGgwRW5kcG9pbnQoY29uZmlnSWQpO1xuICAgIH1cblxuICAgIGNvbnN0IGF1dGhXZWxsS25vd25FbmRQb2ludHMgPSB0aGlzLnN0b3JhZ2VQZXJzaXN0ZW5jZVNlcnZpY2UucmVhZCgnYXV0aFdlbGxLbm93bkVuZFBvaW50cycsIGNvbmZpZ0lkKTtcbiAgICBjb25zdCBlbmRTZXNzaW9uRW5kcG9pbnQgPSBhdXRoV2VsbEtub3duRW5kUG9pbnRzPy5lbmRTZXNzaW9uRW5kcG9pbnQ7XG5cbiAgICBpZiAoIWVuZFNlc3Npb25FbmRwb2ludCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgY29uc3QgdXJsUGFydHMgPSBlbmRTZXNzaW9uRW5kcG9pbnQuc3BsaXQoJz8nKTtcbiAgICBjb25zdCBhdXRob3JpemF0aW9uRW5kU2Vzc2lvblVybCA9IHVybFBhcnRzWzBdO1xuICAgIGNvbnN0IGV4aXN0aW5nUGFyYW1zID0gdXJsUGFydHNbMV07XG4gICAgbGV0IHBhcmFtcyA9IHRoaXMuY3JlYXRlSHR0cFBhcmFtcyhleGlzdGluZ1BhcmFtcyk7XG5cbiAgICBwYXJhbXMgPSBwYXJhbXMuc2V0KCdpZF90b2tlbl9oaW50JywgaWRUb2tlbkhpbnQpO1xuXG4gICAgY29uc3QgcG9zdExvZ291dFJlZGlyZWN0VXJpID0gdGhpcy5nZXRQb3N0TG9nb3V0UmVkaXJlY3RVcmwoY29uZmlnSWQpO1xuXG4gICAgaWYgKHBvc3RMb2dvdXRSZWRpcmVjdFVyaSkge1xuICAgICAgcGFyYW1zID0gcGFyYW1zLmFwcGVuZCgncG9zdF9sb2dvdXRfcmVkaXJlY3RfdXJpJywgcG9zdExvZ291dFJlZGlyZWN0VXJpKTtcbiAgICB9XG5cbiAgICBpZiAoY3VzdG9tUGFyYW1zRW5kU2Vzc2lvbikge1xuICAgICAgcGFyYW1zID0gdGhpcy5hcHBlbmRDdXN0b21QYXJhbXMoeyAuLi5jdXN0b21QYXJhbXNFbmRTZXNzaW9uIH0sIHBhcmFtcyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGAke2F1dGhvcml6YXRpb25FbmRTZXNzaW9uVXJsfT8ke3BhcmFtc31gO1xuICB9XG5cbiAgY3JlYXRlUmV2b2NhdGlvbkVuZHBvaW50Qm9keUFjY2Vzc1Rva2VuKHRva2VuOiBhbnksIGNvbmZpZ0lkOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIGNvbnN0IGNsaWVudElkID0gdGhpcy5nZXRDbGllbnRJZChjb25maWdJZCk7XG5cbiAgICBpZiAoIWNsaWVudElkKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBsZXQgcGFyYW1zID0gdGhpcy5jcmVhdGVIdHRwUGFyYW1zKCk7XG4gICAgcGFyYW1zID0gcGFyYW1zLnNldCgnY2xpZW50X2lkJywgY2xpZW50SWQpO1xuICAgIHBhcmFtcyA9IHBhcmFtcy5zZXQoJ3Rva2VuJywgdG9rZW4pO1xuICAgIHBhcmFtcyA9IHBhcmFtcy5zZXQoJ3Rva2VuX3R5cGVfaGludCcsICdhY2Nlc3NfdG9rZW4nKTtcblxuICAgIHJldHVybiBwYXJhbXMudG9TdHJpbmcoKTtcbiAgfVxuXG4gIGNyZWF0ZVJldm9jYXRpb25FbmRwb2ludEJvZHlSZWZyZXNoVG9rZW4odG9rZW46IGFueSwgY29uZmlnSWQ6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgY29uc3QgY2xpZW50SWQgPSB0aGlzLmdldENsaWVudElkKGNvbmZpZ0lkKTtcblxuICAgIGlmICghY2xpZW50SWQpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGxldCBwYXJhbXMgPSB0aGlzLmNyZWF0ZUh0dHBQYXJhbXMoKTtcbiAgICBwYXJhbXMgPSBwYXJhbXMuc2V0KCdjbGllbnRfaWQnLCBjbGllbnRJZCk7XG4gICAgcGFyYW1zID0gcGFyYW1zLnNldCgndG9rZW4nLCB0b2tlbik7XG4gICAgcGFyYW1zID0gcGFyYW1zLnNldCgndG9rZW5fdHlwZV9oaW50JywgJ3JlZnJlc2hfdG9rZW4nKTtcblxuICAgIHJldHVybiBwYXJhbXMudG9TdHJpbmcoKTtcbiAgfVxuXG4gIGdldFJldm9jYXRpb25FbmRwb2ludFVybChjb25maWdJZDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICBjb25zdCBhdXRoV2VsbEtub3duRW5kUG9pbnRzID0gdGhpcy5zdG9yYWdlUGVyc2lzdGVuY2VTZXJ2aWNlLnJlYWQoJ2F1dGhXZWxsS25vd25FbmRQb2ludHMnLCBjb25maWdJZCk7XG4gICAgY29uc3QgcmV2b2NhdGlvbkVuZHBvaW50ID0gYXV0aFdlbGxLbm93bkVuZFBvaW50cz8ucmV2b2NhdGlvbkVuZHBvaW50O1xuXG4gICAgaWYgKCFyZXZvY2F0aW9uRW5kcG9pbnQpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGNvbnN0IHVybFBhcnRzID0gcmV2b2NhdGlvbkVuZHBvaW50LnNwbGl0KCc/Jyk7XG5cbiAgICBjb25zdCByZXZvY2F0aW9uRW5kcG9pbnRVcmwgPSB1cmxQYXJ0c1swXTtcblxuICAgIHJldHVybiByZXZvY2F0aW9uRW5kcG9pbnRVcmw7XG4gIH1cblxuICBjcmVhdGVCb2R5Rm9yQ29kZUZsb3dDb2RlUmVxdWVzdChjb2RlOiBzdHJpbmcsIGNvbmZpZ0lkOiBzdHJpbmcsIGN1c3RvbVRva2VuUGFyYW1zPzogeyBbcDogc3RyaW5nXTogc3RyaW5nIHwgbnVtYmVyIHwgYm9vbGVhbiB9KTogc3RyaW5nIHtcbiAgICBjb25zdCBjb2RlVmVyaWZpZXIgPSB0aGlzLmZsb3dzRGF0YVNlcnZpY2UuZ2V0Q29kZVZlcmlmaWVyKGNvbmZpZ0lkKTtcbiAgICBpZiAoIWNvZGVWZXJpZmllcikge1xuICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0Vycm9yKGNvbmZpZ0lkLCBgQ29kZVZlcmlmaWVyIGlzIG5vdCBzZXQgYCwgY29kZVZlcmlmaWVyKTtcblxuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgY29uc3QgY2xpZW50SWQgPSB0aGlzLmdldENsaWVudElkKGNvbmZpZ0lkKTtcblxuICAgIGlmICghY2xpZW50SWQpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGxldCBwYXJhbXMgPSB0aGlzLmNyZWF0ZUh0dHBQYXJhbXMoKTtcbiAgICBwYXJhbXMgPSBwYXJhbXMuc2V0KCdncmFudF90eXBlJywgJ2F1dGhvcml6YXRpb25fY29kZScpO1xuICAgIHBhcmFtcyA9IHBhcmFtcy5zZXQoJ2NsaWVudF9pZCcsIGNsaWVudElkKTtcbiAgICBwYXJhbXMgPSBwYXJhbXMuc2V0KCdjb2RlX3ZlcmlmaWVyJywgY29kZVZlcmlmaWVyKTtcbiAgICBwYXJhbXMgPSBwYXJhbXMuc2V0KCdjb2RlJywgY29kZSk7XG5cbiAgICBpZiAoY3VzdG9tVG9rZW5QYXJhbXMpIHtcbiAgICAgIHBhcmFtcyA9IHRoaXMuYXBwZW5kQ3VzdG9tUGFyYW1zKHsgLi4uY3VzdG9tVG9rZW5QYXJhbXMgfSwgcGFyYW1zKTtcbiAgICB9XG5cbiAgICBjb25zdCBzaWxlbnRSZW5ld1VybCA9IHRoaXMuZ2V0U2lsZW50UmVuZXdVcmwoY29uZmlnSWQpO1xuXG4gICAgaWYgKHRoaXMuZmxvd3NEYXRhU2VydmljZS5pc1NpbGVudFJlbmV3UnVubmluZyhjb25maWdJZCkgJiYgc2lsZW50UmVuZXdVcmwpIHtcbiAgICAgIHBhcmFtcyA9IHBhcmFtcy5zZXQoJ3JlZGlyZWN0X3VyaScsIHNpbGVudFJlbmV3VXJsKTtcblxuICAgICAgcmV0dXJuIHBhcmFtcy50b1N0cmluZygpO1xuICAgIH1cblxuICAgIGNvbnN0IHJlZGlyZWN0VXJsID0gdGhpcy5nZXRSZWRpcmVjdFVybChjb25maWdJZCk7XG5cbiAgICBpZiAoIXJlZGlyZWN0VXJsKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBwYXJhbXMgPSBwYXJhbXMuc2V0KCdyZWRpcmVjdF91cmknLCByZWRpcmVjdFVybCk7XG5cbiAgICByZXR1cm4gcGFyYW1zLnRvU3RyaW5nKCk7XG4gIH1cblxuICBjcmVhdGVCb2R5Rm9yQ29kZUZsb3dSZWZyZXNoVG9rZW5zUmVxdWVzdChcbiAgICByZWZyZXNoVG9rZW46IHN0cmluZyxcbiAgICBjb25maWdJZDogc3RyaW5nLFxuICAgIGN1c3RvbVBhcmFtc1JlZnJlc2g/OiB7IFtrZXk6IHN0cmluZ106IHN0cmluZyB8IG51bWJlciB8IGJvb2xlYW4gfVxuICApOiBzdHJpbmcge1xuICAgIGNvbnN0IGNsaWVudElkID0gdGhpcy5nZXRDbGllbnRJZChjb25maWdJZCk7XG5cbiAgICBpZiAoIWNsaWVudElkKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBsZXQgcGFyYW1zID0gdGhpcy5jcmVhdGVIdHRwUGFyYW1zKCk7XG4gICAgcGFyYW1zID0gcGFyYW1zLnNldCgnZ3JhbnRfdHlwZScsICdyZWZyZXNoX3Rva2VuJyk7XG4gICAgcGFyYW1zID0gcGFyYW1zLnNldCgnY2xpZW50X2lkJywgY2xpZW50SWQpO1xuICAgIHBhcmFtcyA9IHBhcmFtcy5zZXQoJ3JlZnJlc2hfdG9rZW4nLCByZWZyZXNoVG9rZW4pO1xuXG4gICAgaWYgKGN1c3RvbVBhcmFtc1JlZnJlc2gpIHtcbiAgICAgIHBhcmFtcyA9IHRoaXMuYXBwZW5kQ3VzdG9tUGFyYW1zKHsgLi4uY3VzdG9tUGFyYW1zUmVmcmVzaCB9LCBwYXJhbXMpO1xuICAgIH1cblxuICAgIHJldHVybiBwYXJhbXMudG9TdHJpbmcoKTtcbiAgfVxuXG4gIGNyZWF0ZUJvZHlGb3JQYXJDb2RlRmxvd1JlcXVlc3QoY29uZmlnSWQ6IHN0cmluZywgY3VzdG9tUGFyYW1zUmVxdWVzdD86IHsgW2tleTogc3RyaW5nXTogc3RyaW5nIHwgbnVtYmVyIHwgYm9vbGVhbiB9KTogc3RyaW5nIHtcbiAgICBjb25zdCByZWRpcmVjdFVybCA9IHRoaXMuZ2V0UmVkaXJlY3RVcmwoY29uZmlnSWQpO1xuXG4gICAgaWYgKCFyZWRpcmVjdFVybCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgY29uc3Qgc3RhdGUgPSB0aGlzLmZsb3dzRGF0YVNlcnZpY2UuZ2V0RXhpc3RpbmdPckNyZWF0ZUF1dGhTdGF0ZUNvbnRyb2woY29uZmlnSWQpO1xuICAgIGNvbnN0IG5vbmNlID0gdGhpcy5mbG93c0RhdGFTZXJ2aWNlLmNyZWF0ZU5vbmNlKGNvbmZpZ0lkKTtcbiAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoY29uZmlnSWQsICdBdXRob3JpemUgY3JlYXRlZC4gYWRkaW5nIG15YXV0b3N0YXRlOiAnICsgc3RhdGUpO1xuXG4gICAgLy8gY29kZV9jaGFsbGVuZ2Ugd2l0aCBcIlMyNTZcIlxuICAgIGNvbnN0IGNvZGVWZXJpZmllciA9IHRoaXMuZmxvd3NEYXRhU2VydmljZS5jcmVhdGVDb2RlVmVyaWZpZXIoY29uZmlnSWQpO1xuICAgIGNvbnN0IGNvZGVDaGFsbGVuZ2UgPSB0aGlzLmpzcnNBc2lnblJlZHVjZWRTZXJ2aWNlLmdlbmVyYXRlQ29kZUNoYWxsZW5nZShjb2RlVmVyaWZpZXIpO1xuXG4gICAgY29uc3QgeyBjbGllbnRJZCwgcmVzcG9uc2VUeXBlLCBzY29wZSwgaGRQYXJhbSwgY3VzdG9tUGFyYW1zQXV0aFJlcXVlc3QgfSA9IHRoaXMuY29uZmlndXJhdGlvblByb3ZpZGVyLmdldE9wZW5JRENvbmZpZ3VyYXRpb24oY29uZmlnSWQpO1xuXG4gICAgbGV0IHBhcmFtcyA9IHRoaXMuY3JlYXRlSHR0cFBhcmFtcygnJyk7XG4gICAgcGFyYW1zID0gcGFyYW1zLnNldCgnY2xpZW50X2lkJywgY2xpZW50SWQpO1xuICAgIHBhcmFtcyA9IHBhcmFtcy5hcHBlbmQoJ3JlZGlyZWN0X3VyaScsIHJlZGlyZWN0VXJsKTtcbiAgICBwYXJhbXMgPSBwYXJhbXMuYXBwZW5kKCdyZXNwb25zZV90eXBlJywgcmVzcG9uc2VUeXBlKTtcbiAgICBwYXJhbXMgPSBwYXJhbXMuYXBwZW5kKCdzY29wZScsIHNjb3BlKTtcbiAgICBwYXJhbXMgPSBwYXJhbXMuYXBwZW5kKCdub25jZScsIG5vbmNlKTtcbiAgICBwYXJhbXMgPSBwYXJhbXMuYXBwZW5kKCdzdGF0ZScsIHN0YXRlKTtcbiAgICBwYXJhbXMgPSBwYXJhbXMuYXBwZW5kKCdjb2RlX2NoYWxsZW5nZScsIGNvZGVDaGFsbGVuZ2UpO1xuICAgIHBhcmFtcyA9IHBhcmFtcy5hcHBlbmQoJ2NvZGVfY2hhbGxlbmdlX21ldGhvZCcsICdTMjU2Jyk7XG5cbiAgICBpZiAoaGRQYXJhbSkge1xuICAgICAgcGFyYW1zID0gcGFyYW1zLmFwcGVuZCgnaGQnLCBoZFBhcmFtKTtcbiAgICB9XG5cbiAgICBpZiAoY3VzdG9tUGFyYW1zQXV0aFJlcXVlc3QpIHtcbiAgICAgIHBhcmFtcyA9IHRoaXMuYXBwZW5kQ3VzdG9tUGFyYW1zKHsgLi4uY3VzdG9tUGFyYW1zQXV0aFJlcXVlc3QgfSwgcGFyYW1zKTtcbiAgICB9XG5cbiAgICBpZiAoY3VzdG9tUGFyYW1zUmVxdWVzdCkge1xuICAgICAgcGFyYW1zID0gdGhpcy5hcHBlbmRDdXN0b21QYXJhbXMoeyAuLi5jdXN0b21QYXJhbXNSZXF1ZXN0IH0sIHBhcmFtcyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHBhcmFtcy50b1N0cmluZygpO1xuICB9XG5cbiAgcHJpdmF0ZSBjcmVhdGVBdXRob3JpemVVcmwoXG4gICAgY29kZUNoYWxsZW5nZTogc3RyaW5nLFxuICAgIHJlZGlyZWN0VXJsOiBzdHJpbmcsXG4gICAgbm9uY2U6IHN0cmluZyxcbiAgICBzdGF0ZTogc3RyaW5nLFxuICAgIGNvbmZpZ0lkOiBzdHJpbmcsXG4gICAgcHJvbXB0Pzogc3RyaW5nLFxuICAgIGN1c3RvbVJlcXVlc3RQYXJhbXM/OiB7IFtrZXk6IHN0cmluZ106IHN0cmluZyB8IG51bWJlciB8IGJvb2xlYW4gfVxuICApOiBzdHJpbmcge1xuICAgIGNvbnN0IGF1dGhXZWxsS25vd25FbmRQb2ludHMgPSB0aGlzLnN0b3JhZ2VQZXJzaXN0ZW5jZVNlcnZpY2UucmVhZCgnYXV0aFdlbGxLbm93bkVuZFBvaW50cycsIGNvbmZpZ0lkKTtcbiAgICBjb25zdCBhdXRob3JpemF0aW9uRW5kcG9pbnQgPSBhdXRoV2VsbEtub3duRW5kUG9pbnRzPy5hdXRob3JpemF0aW9uRW5kcG9pbnQ7XG5cbiAgICBpZiAoIWF1dGhvcml6YXRpb25FbmRwb2ludCkge1xuICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0Vycm9yKGNvbmZpZ0lkLCBgQ2FuIG5vdCBjcmVhdGUgYW4gYXV0aG9yaXplIFVSTCB3aGVuIGF1dGhvcml6YXRpb25FbmRwb2ludCBpcyAnJHthdXRob3JpemF0aW9uRW5kcG9pbnR9J2ApO1xuXG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBjb25zdCB7IGNsaWVudElkLCByZXNwb25zZVR5cGUsIHNjb3BlLCBoZFBhcmFtLCBjdXN0b21QYXJhbXNBdXRoUmVxdWVzdCB9ID0gdGhpcy5jb25maWd1cmF0aW9uUHJvdmlkZXIuZ2V0T3BlbklEQ29uZmlndXJhdGlvbihjb25maWdJZCk7XG5cbiAgICBpZiAoIWNsaWVudElkKSB7XG4gICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRXJyb3IoY29uZmlnSWQsIGBjcmVhdGVBdXRob3JpemVVcmwgY291bGQgbm90IGFkZCBjbGllbnRJZCBiZWNhdXNlIGl0IHdhczogYCwgY2xpZW50SWQpO1xuXG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBpZiAoIXJlc3BvbnNlVHlwZSkge1xuICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0Vycm9yKGNvbmZpZ0lkLCBgY3JlYXRlQXV0aG9yaXplVXJsIGNvdWxkIG5vdCBhZGQgcmVzcG9uc2VUeXBlIGJlY2F1c2UgaXQgd2FzOiBgLCByZXNwb25zZVR5cGUpO1xuXG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBpZiAoIXNjb3BlKSB7XG4gICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRXJyb3IoY29uZmlnSWQsIGBjcmVhdGVBdXRob3JpemVVcmwgY291bGQgbm90IGFkZCBzY29wZSBiZWNhdXNlIGl0IHdhczogYCwgc2NvcGUpO1xuXG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBjb25zdCB1cmxQYXJ0cyA9IGF1dGhvcml6YXRpb25FbmRwb2ludC5zcGxpdCgnPycpO1xuICAgIGNvbnN0IGF1dGhvcml6YXRpb25VcmwgPSB1cmxQYXJ0c1swXTtcbiAgICBjb25zdCBleGlzdGluZ1BhcmFtcyA9IHVybFBhcnRzWzFdO1xuICAgIGxldCBwYXJhbXMgPSB0aGlzLmNyZWF0ZUh0dHBQYXJhbXMoZXhpc3RpbmdQYXJhbXMpO1xuXG4gICAgcGFyYW1zID0gcGFyYW1zLnNldCgnY2xpZW50X2lkJywgY2xpZW50SWQpO1xuICAgIHBhcmFtcyA9IHBhcmFtcy5hcHBlbmQoJ3JlZGlyZWN0X3VyaScsIHJlZGlyZWN0VXJsKTtcbiAgICBwYXJhbXMgPSBwYXJhbXMuYXBwZW5kKCdyZXNwb25zZV90eXBlJywgcmVzcG9uc2VUeXBlKTtcbiAgICBwYXJhbXMgPSBwYXJhbXMuYXBwZW5kKCdzY29wZScsIHNjb3BlKTtcbiAgICBwYXJhbXMgPSBwYXJhbXMuYXBwZW5kKCdub25jZScsIG5vbmNlKTtcbiAgICBwYXJhbXMgPSBwYXJhbXMuYXBwZW5kKCdzdGF0ZScsIHN0YXRlKTtcblxuICAgIGlmICh0aGlzLmZsb3dIZWxwZXIuaXNDdXJyZW50Rmxvd0NvZGVGbG93KGNvbmZpZ0lkKSkge1xuICAgICAgcGFyYW1zID0gcGFyYW1zLmFwcGVuZCgnY29kZV9jaGFsbGVuZ2UnLCBjb2RlQ2hhbGxlbmdlKTtcbiAgICAgIHBhcmFtcyA9IHBhcmFtcy5hcHBlbmQoJ2NvZGVfY2hhbGxlbmdlX21ldGhvZCcsICdTMjU2Jyk7XG4gICAgfVxuXG4gICAgY29uc3QgbWVyZ2VkUGFyYW1zID0geyAuLi5jdXN0b21QYXJhbXNBdXRoUmVxdWVzdCwgLi4uY3VzdG9tUmVxdWVzdFBhcmFtcyB9O1xuXG4gICAgaWYgKE9iamVjdC5rZXlzKG1lcmdlZFBhcmFtcykubGVuZ3RoID4gMCkge1xuICAgICAgcGFyYW1zID0gdGhpcy5hcHBlbmRDdXN0b21QYXJhbXMoeyAuLi5tZXJnZWRQYXJhbXMgfSwgcGFyYW1zKTtcbiAgICB9XG5cbiAgICBpZiAocHJvbXB0KSB7XG4gICAgICBwYXJhbXMgPSB0aGlzLm92ZXJXcml0ZVBhcmFtKHBhcmFtcywgJ3Byb21wdCcsIHByb21wdCk7XG4gICAgfVxuXG4gICAgaWYgKGhkUGFyYW0pIHtcbiAgICAgIHBhcmFtcyA9IHBhcmFtcy5hcHBlbmQoJ2hkJywgaGRQYXJhbSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGAke2F1dGhvcml6YXRpb25Vcmx9PyR7cGFyYW1zfWA7XG4gIH1cblxuICBwcml2YXRlIGNyZWF0ZVVybEltcGxpY2l0Rmxvd1dpdGhTaWxlbnRSZW5ldyhjb25maWdJZDogc3RyaW5nLCBjdXN0b21QYXJhbXM/OiB7IFtrZXk6IHN0cmluZ106IHN0cmluZyB8IG51bWJlciB8IGJvb2xlYW4gfSk6IHN0cmluZyB7XG4gICAgY29uc3Qgc3RhdGUgPSB0aGlzLmZsb3dzRGF0YVNlcnZpY2UuZ2V0RXhpc3RpbmdPckNyZWF0ZUF1dGhTdGF0ZUNvbnRyb2woY29uZmlnSWQpO1xuICAgIGNvbnN0IG5vbmNlID0gdGhpcy5mbG93c0RhdGFTZXJ2aWNlLmNyZWF0ZU5vbmNlKGNvbmZpZ0lkKTtcblxuICAgIGNvbnN0IHNpbGVudFJlbmV3VXJsID0gdGhpcy5nZXRTaWxlbnRSZW5ld1VybChjb25maWdJZCk7XG5cbiAgICBpZiAoIXNpbGVudFJlbmV3VXJsKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoY29uZmlnSWQsICdSZWZyZXNoU2Vzc2lvbiBjcmVhdGVkLiBhZGRpbmcgbXlhdXRvc3RhdGU6ICcsIHN0YXRlKTtcblxuICAgIGNvbnN0IGF1dGhXZWxsS25vd25FbmRQb2ludHMgPSB0aGlzLnN0b3JhZ2VQZXJzaXN0ZW5jZVNlcnZpY2UucmVhZCgnYXV0aFdlbGxLbm93bkVuZFBvaW50cycsIGNvbmZpZ0lkKTtcbiAgICBpZiAoYXV0aFdlbGxLbm93bkVuZFBvaW50cykge1xuICAgICAgcmV0dXJuIHRoaXMuY3JlYXRlQXV0aG9yaXplVXJsKCcnLCBzaWxlbnRSZW5ld1VybCwgbm9uY2UsIHN0YXRlLCBjb25maWdJZCwgJ25vbmUnLCBjdXN0b21QYXJhbXMpO1xuICAgIH1cblxuICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dFcnJvcihjb25maWdJZCwgJ2F1dGhXZWxsS25vd25FbmRwb2ludHMgaXMgdW5kZWZpbmVkJyk7XG5cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIHByaXZhdGUgY3JlYXRlVXJsQ29kZUZsb3dXaXRoU2lsZW50UmVuZXcoY29uZmlnSWQ6IHN0cmluZywgY3VzdG9tUGFyYW1zPzogeyBba2V5OiBzdHJpbmddOiBzdHJpbmcgfCBudW1iZXIgfCBib29sZWFuIH0pOiBzdHJpbmcge1xuICAgIGNvbnN0IHN0YXRlID0gdGhpcy5mbG93c0RhdGFTZXJ2aWNlLmdldEV4aXN0aW5nT3JDcmVhdGVBdXRoU3RhdGVDb250cm9sKGNvbmZpZ0lkKTtcbiAgICBjb25zdCBub25jZSA9IHRoaXMuZmxvd3NEYXRhU2VydmljZS5jcmVhdGVOb25jZShjb25maWdJZCk7XG5cbiAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoY29uZmlnSWQsICdSZWZyZXNoU2Vzc2lvbiBjcmVhdGVkLiBhZGRpbmcgbXlhdXRvc3RhdGU6ICcgKyBzdGF0ZSk7XG5cbiAgICAvLyBjb2RlX2NoYWxsZW5nZSB3aXRoIFwiUzI1NlwiXG4gICAgY29uc3QgY29kZVZlcmlmaWVyID0gdGhpcy5mbG93c0RhdGFTZXJ2aWNlLmNyZWF0ZUNvZGVWZXJpZmllcihjb25maWdJZCk7XG4gICAgY29uc3QgY29kZUNoYWxsZW5nZSA9IHRoaXMuanNyc0FzaWduUmVkdWNlZFNlcnZpY2UuZ2VuZXJhdGVDb2RlQ2hhbGxlbmdlKGNvZGVWZXJpZmllcik7XG5cbiAgICBjb25zdCBzaWxlbnRSZW5ld1VybCA9IHRoaXMuZ2V0U2lsZW50UmVuZXdVcmwoY29uZmlnSWQpO1xuXG4gICAgaWYgKCFzaWxlbnRSZW5ld1VybCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgY29uc3QgYXV0aFdlbGxLbm93bkVuZFBvaW50cyA9IHRoaXMuc3RvcmFnZVBlcnNpc3RlbmNlU2VydmljZS5yZWFkKCdhdXRoV2VsbEtub3duRW5kUG9pbnRzJywgY29uZmlnSWQpO1xuICAgIGlmIChhdXRoV2VsbEtub3duRW5kUG9pbnRzKSB7XG4gICAgICByZXR1cm4gdGhpcy5jcmVhdGVBdXRob3JpemVVcmwoY29kZUNoYWxsZW5nZSwgc2lsZW50UmVuZXdVcmwsIG5vbmNlLCBzdGF0ZSwgY29uZmlnSWQsICdub25lJywgY3VzdG9tUGFyYW1zKTtcbiAgICB9XG5cbiAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nV2FybmluZyhjb25maWdJZCwgJ2F1dGhXZWxsS25vd25FbmRwb2ludHMgaXMgdW5kZWZpbmVkJyk7XG5cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIHByaXZhdGUgY3JlYXRlVXJsSW1wbGljaXRGbG93QXV0aG9yaXplKGNvbmZpZ0lkOiBzdHJpbmcsIGN1c3RvbVBhcmFtcz86IHsgW2tleTogc3RyaW5nXTogc3RyaW5nIHwgbnVtYmVyIHwgYm9vbGVhbiB9KTogc3RyaW5nIHtcbiAgICBjb25zdCBzdGF0ZSA9IHRoaXMuZmxvd3NEYXRhU2VydmljZS5nZXRFeGlzdGluZ09yQ3JlYXRlQXV0aFN0YXRlQ29udHJvbChjb25maWdJZCk7XG4gICAgY29uc3Qgbm9uY2UgPSB0aGlzLmZsb3dzRGF0YVNlcnZpY2UuY3JlYXRlTm9uY2UoY29uZmlnSWQpO1xuICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1Zyhjb25maWdJZCwgJ0F1dGhvcml6ZSBjcmVhdGVkLiBhZGRpbmcgbXlhdXRvc3RhdGU6ICcgKyBzdGF0ZSk7XG5cbiAgICBjb25zdCByZWRpcmVjdFVybCA9IHRoaXMuZ2V0UmVkaXJlY3RVcmwoY29uZmlnSWQpO1xuXG4gICAgaWYgKCFyZWRpcmVjdFVybCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgY29uc3QgYXV0aFdlbGxLbm93bkVuZFBvaW50cyA9IHRoaXMuc3RvcmFnZVBlcnNpc3RlbmNlU2VydmljZS5yZWFkKCdhdXRoV2VsbEtub3duRW5kUG9pbnRzJywgY29uZmlnSWQpO1xuICAgIGlmIChhdXRoV2VsbEtub3duRW5kUG9pbnRzKSB7XG4gICAgICByZXR1cm4gdGhpcy5jcmVhdGVBdXRob3JpemVVcmwoJycsIHJlZGlyZWN0VXJsLCBub25jZSwgc3RhdGUsIGNvbmZpZ0lkLCBudWxsLCBjdXN0b21QYXJhbXMpO1xuICAgIH1cblxuICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dFcnJvcihjb25maWdJZCwgJ2F1dGhXZWxsS25vd25FbmRwb2ludHMgaXMgdW5kZWZpbmVkJyk7XG5cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIHByaXZhdGUgY3JlYXRlVXJsQ29kZUZsb3dBdXRob3JpemUoY29uZmlnSWQ6IHN0cmluZywgY3VzdG9tUGFyYW1zPzogeyBba2V5OiBzdHJpbmddOiBzdHJpbmcgfCBudW1iZXIgfCBib29sZWFuIH0pOiBzdHJpbmcge1xuICAgIGNvbnN0IHN0YXRlID0gdGhpcy5mbG93c0RhdGFTZXJ2aWNlLmdldEV4aXN0aW5nT3JDcmVhdGVBdXRoU3RhdGVDb250cm9sKGNvbmZpZ0lkKTtcbiAgICBjb25zdCBub25jZSA9IHRoaXMuZmxvd3NEYXRhU2VydmljZS5jcmVhdGVOb25jZShjb25maWdJZCk7XG4gICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKGNvbmZpZ0lkLCAnQXV0aG9yaXplIGNyZWF0ZWQuIGFkZGluZyBteWF1dG9zdGF0ZTogJyArIHN0YXRlKTtcblxuICAgIGNvbnN0IHJlZGlyZWN0VXJsID0gdGhpcy5nZXRSZWRpcmVjdFVybChjb25maWdJZCk7XG5cbiAgICBpZiAoIXJlZGlyZWN0VXJsKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICAvLyBjb2RlX2NoYWxsZW5nZSB3aXRoIFwiUzI1NlwiXG4gICAgY29uc3QgY29kZVZlcmlmaWVyID0gdGhpcy5mbG93c0RhdGFTZXJ2aWNlLmNyZWF0ZUNvZGVWZXJpZmllcihjb25maWdJZCk7XG4gICAgY29uc3QgY29kZUNoYWxsZW5nZSA9IHRoaXMuanNyc0FzaWduUmVkdWNlZFNlcnZpY2UuZ2VuZXJhdGVDb2RlQ2hhbGxlbmdlKGNvZGVWZXJpZmllcik7XG5cbiAgICBjb25zdCBhdXRoV2VsbEtub3duRW5kUG9pbnRzID0gdGhpcy5zdG9yYWdlUGVyc2lzdGVuY2VTZXJ2aWNlLnJlYWQoJ2F1dGhXZWxsS25vd25FbmRQb2ludHMnLCBjb25maWdJZCk7XG4gICAgaWYgKGF1dGhXZWxsS25vd25FbmRQb2ludHMpIHtcbiAgICAgIHJldHVybiB0aGlzLmNyZWF0ZUF1dGhvcml6ZVVybChjb2RlQ2hhbGxlbmdlLCByZWRpcmVjdFVybCwgbm9uY2UsIHN0YXRlLCBjb25maWdJZCwgbnVsbCwgY3VzdG9tUGFyYW1zKTtcbiAgICB9XG5cbiAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRXJyb3IoY29uZmlnSWQsICdhdXRoV2VsbEtub3duRW5kcG9pbnRzIGlzIHVuZGVmaW5lZCcpO1xuXG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBwcml2YXRlIGdldFJlZGlyZWN0VXJsKGNvbmZpZ0lkOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIGNvbnN0IHsgcmVkaXJlY3RVcmwgfSA9IHRoaXMuY29uZmlndXJhdGlvblByb3ZpZGVyLmdldE9wZW5JRENvbmZpZ3VyYXRpb24oY29uZmlnSWQpO1xuXG4gICAgaWYgKCFyZWRpcmVjdFVybCkge1xuICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0Vycm9yKGNvbmZpZ0lkLCBgY291bGQgbm90IGdldCByZWRpcmVjdFVybCwgd2FzOiBgLCByZWRpcmVjdFVybCk7XG5cbiAgICAgIG51bGw7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlZGlyZWN0VXJsO1xuICB9XG5cbiAgcHJpdmF0ZSBnZXRTaWxlbnRSZW5ld1VybChjb25maWdJZDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICBjb25zdCB7IHNpbGVudFJlbmV3VXJsIH0gPSB0aGlzLmNvbmZpZ3VyYXRpb25Qcm92aWRlci5nZXRPcGVuSURDb25maWd1cmF0aW9uKGNvbmZpZ0lkKTtcblxuICAgIGlmICghc2lsZW50UmVuZXdVcmwpIHtcbiAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dFcnJvcihjb25maWdJZCwgYGNvdWxkIG5vdCBnZXQgc2lsZW50UmVuZXdVcmwsIHdhczogYCwgc2lsZW50UmVuZXdVcmwpO1xuXG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICByZXR1cm4gc2lsZW50UmVuZXdVcmw7XG4gIH1cblxuICBwcml2YXRlIGdldFBvc3RMb2dvdXRSZWRpcmVjdFVybChjb25maWdJZDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICBjb25zdCB7IHBvc3RMb2dvdXRSZWRpcmVjdFVyaSB9ID0gdGhpcy5jb25maWd1cmF0aW9uUHJvdmlkZXIuZ2V0T3BlbklEQ29uZmlndXJhdGlvbihjb25maWdJZCk7XG5cbiAgICBpZiAoIXBvc3RMb2dvdXRSZWRpcmVjdFVyaSkge1xuICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0Vycm9yKGNvbmZpZ0lkLCBgY291bGQgbm90IGdldCBwb3N0TG9nb3V0UmVkaXJlY3RVcmksIHdhczogYCwgcG9zdExvZ291dFJlZGlyZWN0VXJpKTtcblxuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgcmV0dXJuIHBvc3RMb2dvdXRSZWRpcmVjdFVyaTtcbiAgfVxuXG4gIHByaXZhdGUgZ2V0Q2xpZW50SWQoY29uZmlnSWQ6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgY29uc3QgeyBjbGllbnRJZCB9ID0gdGhpcy5jb25maWd1cmF0aW9uUHJvdmlkZXIuZ2V0T3BlbklEQ29uZmlndXJhdGlvbihjb25maWdJZCk7XG5cbiAgICBpZiAoIWNsaWVudElkKSB7XG4gICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRXJyb3IoY29uZmlnSWQsIGBjb3VsZCBub3QgZ2V0IGNsaWVudElkLCB3YXM6IGAsIGNsaWVudElkKTtcblxuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgcmV0dXJuIGNsaWVudElkO1xuICB9XG5cbiAgcHJpdmF0ZSBhcHBlbmRDdXN0b21QYXJhbXMoY3VzdG9tUGFyYW1zOiB7IFtrZXk6IHN0cmluZ106IHN0cmluZyB8IG51bWJlciB8IGJvb2xlYW4gfSwgcGFyYW1zOiBIdHRwUGFyYW1zKTogSHR0cFBhcmFtcyB7XG4gICAgZm9yIChjb25zdCBba2V5LCB2YWx1ZV0gb2YgT2JqZWN0LmVudHJpZXMoeyAuLi5jdXN0b21QYXJhbXMgfSkpIHtcbiAgICAgIHBhcmFtcyA9IHBhcmFtcy5hcHBlbmQoa2V5LCB2YWx1ZS50b1N0cmluZygpKTtcbiAgICB9XG5cbiAgICByZXR1cm4gcGFyYW1zO1xuICB9XG5cbiAgcHJpdmF0ZSBvdmVyV3JpdGVQYXJhbShwYXJhbXM6IEh0dHBQYXJhbXMsIGtleTogc3RyaW5nLCB2YWx1ZTogc3RyaW5nIHwgbnVtYmVyIHwgYm9vbGVhbik6IEh0dHBQYXJhbXMge1xuICAgIHJldHVybiBwYXJhbXMuc2V0KGtleSwgdmFsdWUpO1xuICB9XG5cbiAgcHJpdmF0ZSBjcmVhdGVIdHRwUGFyYW1zKGV4aXN0aW5nUGFyYW1zPzogc3RyaW5nKTogSHR0cFBhcmFtcyB7XG4gICAgZXhpc3RpbmdQYXJhbXMgPSBleGlzdGluZ1BhcmFtcyA/PyAnJztcblxuICAgIGNvbnN0IHBhcmFtcyA9IG5ldyBIdHRwUGFyYW1zKHtcbiAgICAgIGZyb21TdHJpbmc6IGV4aXN0aW5nUGFyYW1zLFxuICAgICAgZW5jb2RlcjogbmV3IFVyaUVuY29kZXIoKSxcbiAgICB9KTtcblxuICAgIHJldHVybiBwYXJhbXM7XG4gIH1cblxuICBwcml2YXRlIGlzQXV0aDBFbmRwb2ludChjb25maWdJZDogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgY29uc3QgeyBhdXRob3JpdHkgfSA9IHRoaXMuY29uZmlndXJhdGlvblByb3ZpZGVyLmdldE9wZW5JRENvbmZpZ3VyYXRpb24oY29uZmlnSWQpO1xuXG4gICAgaWYgKCFhdXRob3JpdHkpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICByZXR1cm4gYXV0aG9yaXR5LmVuZHNXaXRoKEFVVEgwX0VORFBPSU5UKTtcbiAgfVxuXG4gIHByaXZhdGUgY29tcG9zZUF1dGgwRW5kcG9pbnQoY29uZmlnSWQ6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgLy8gZm9ybWF0OiBodHRwczovL1lPVVJfRE9NQUlOL3YyL2xvZ291dD9jbGllbnRfaWQ9WU9VUl9DTElFTlRfSUQmcmV0dXJuVG89TE9HT1VUX1VSTFxuICAgIGNvbnN0IHsgYXV0aG9yaXR5LCBjbGllbnRJZCB9ID0gdGhpcy5jb25maWd1cmF0aW9uUHJvdmlkZXIuZ2V0T3BlbklEQ29uZmlndXJhdGlvbihjb25maWdJZCk7XG4gICAgY29uc3QgcG9zdExvZ291dFJlZGlyZWN0VXJsID0gdGhpcy5nZXRQb3N0TG9nb3V0UmVkaXJlY3RVcmwoY29uZmlnSWQpO1xuXG4gICAgcmV0dXJuIGAke2F1dGhvcml0eX0vdjIvbG9nb3V0P2NsaWVudF9pZD0ke2NsaWVudElkfSZyZXR1cm5Ubz0ke3Bvc3RMb2dvdXRSZWRpcmVjdFVybH1gO1xuICB9XG59XG4iXX0=