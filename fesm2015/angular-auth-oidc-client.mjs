import { DOCUMENT, isPlatformBrowser, CommonModule } from '@angular/common';
import * as i1 from '@angular/common/http';
import { HttpHeaders, HttpParams, HttpErrorResponse, HttpResponse, HttpClientModule } from '@angular/common/http';
import * as i0 from '@angular/core';
import { Injectable, Inject, PLATFORM_ID, InjectionToken, APP_INITIALIZER, NgModule } from '@angular/core';
import { ReplaySubject, BehaviorSubject, throwError, of, timer, Observable, Subject, forkJoin, TimeoutError } from 'rxjs';
import { distinctUntilChanged, switchMap, retryWhen, catchError, mergeMap, map, retry, tap, concatMap, take, timeout } from 'rxjs/operators';
import { KJUR, hextob64u, KEYUTIL } from 'jsrsasign-reduced';
import * as i2 from '@angular/router';

class HttpBaseService {
    constructor(http) {
        this.http = http;
    }
    get(url, params) {
        return this.http.get(url, params);
    }
    post(url, body, params) {
        return this.http.post(url, body, params);
    }
}
HttpBaseService.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: HttpBaseService, deps: [{ token: i1.HttpClient }], target: i0.ɵɵFactoryTarget.Injectable });
HttpBaseService.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: HttpBaseService });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: HttpBaseService, decorators: [{
            type: Injectable
        }], ctorParameters: function () { return [{ type: i1.HttpClient }]; } });

class ConfigurationProvider {
    constructor() {
        this.configsInternal = {};
    }
    hasAtLeastOneConfig() {
        return Object.keys(this.configsInternal).length > 0;
    }
    hasManyConfigs() {
        return Object.keys(this.configsInternal).length > 1;
    }
    setConfig(readyConfig) {
        const { configId } = readyConfig;
        this.configsInternal[configId] = readyConfig;
    }
    getOpenIDConfiguration(configId) {
        if (!!configId) {
            return this.configsInternal[configId] || null;
        }
        const [, value] = Object.entries(this.configsInternal)[0] || [[null, null]];
        return value || null;
    }
    getAllConfigurations() {
        return Object.values(this.configsInternal);
    }
}
ConfigurationProvider.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: ConfigurationProvider, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
ConfigurationProvider.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: ConfigurationProvider });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: ConfigurationProvider, decorators: [{
            type: Injectable
        }] });

const NGSW_CUSTOM_PARAM = 'ngsw-bypass';
class DataService {
    constructor(httpClient, configurationProvider) {
        this.httpClient = httpClient;
        this.configurationProvider = configurationProvider;
    }
    get(url, configId, token) {
        const headers = this.prepareHeaders(token);
        const params = this.prepareParams(configId);
        return this.httpClient.get(url, {
            headers,
            params,
        });
    }
    post(url, body, configId, headersParams) {
        const headers = headersParams || this.prepareHeaders();
        const params = this.prepareParams(configId);
        return this.httpClient.post(url, body, { headers, params });
    }
    prepareHeaders(token) {
        let headers = new HttpHeaders();
        headers = headers.set('Accept', 'application/json');
        if (!!token) {
            headers = headers.set('Authorization', 'Bearer ' + decodeURIComponent(token));
        }
        return headers;
    }
    prepareParams(configId) {
        let params = new HttpParams();
        const { ngswBypass } = this.configurationProvider.getOpenIDConfiguration(configId);
        if (ngswBypass) {
            params = params.set(NGSW_CUSTOM_PARAM, '');
        }
        return params;
    }
}
DataService.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: DataService, deps: [{ token: HttpBaseService }, { token: ConfigurationProvider }], target: i0.ɵɵFactoryTarget.Injectable });
DataService.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: DataService });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: DataService, decorators: [{
            type: Injectable
        }], ctorParameters: function () { return [{ type: HttpBaseService }, { type: ConfigurationProvider }]; } });

// eslint-disable-next-line no-shadow
var EventTypes;
(function (EventTypes) {
    /**
     *  This only works in the AppModule Constructor
     */
    EventTypes[EventTypes["ConfigLoaded"] = 0] = "ConfigLoaded";
    EventTypes[EventTypes["ConfigLoadingFailed"] = 1] = "ConfigLoadingFailed";
    EventTypes[EventTypes["CheckSessionReceived"] = 2] = "CheckSessionReceived";
    EventTypes[EventTypes["UserDataChanged"] = 3] = "UserDataChanged";
    EventTypes[EventTypes["NewAuthenticationResult"] = 4] = "NewAuthenticationResult";
    EventTypes[EventTypes["TokenExpired"] = 5] = "TokenExpired";
    EventTypes[EventTypes["IdTokenExpired"] = 6] = "IdTokenExpired";
    EventTypes[EventTypes["SilentRenewStarted"] = 7] = "SilentRenewStarted";
})(EventTypes || (EventTypes = {}));

// eslint-disable-next-line no-shadow
var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["None"] = 0] = "None";
    LogLevel[LogLevel["Debug"] = 1] = "Debug";
    LogLevel[LogLevel["Warn"] = 2] = "Warn";
    LogLevel[LogLevel["Error"] = 3] = "Error";
})(LogLevel || (LogLevel = {}));

class LoggerService {
    constructor(configurationProvider) {
        this.configurationProvider = configurationProvider;
    }
    logError(configId, message, ...args) {
        if (!!configId) {
            this.logErrorWithConfig(configId, message, ...args);
        }
        else {
            this.logErrorWithoutConfig(message, ...args);
        }
    }
    logWarning(configId, message, ...args) {
        if (!!configId) {
            this.logWarningWithConfig(configId, message, ...args);
        }
        else {
            this.logWarningWithoutConfig(message, ...args);
        }
    }
    logDebug(configId, message, ...args) {
        if (!this.logLevelIsSet(configId)) {
            return;
        }
        if (this.loggingIsTurnedOff(configId)) {
            return;
        }
        if (!this.currentLogLevelIsEqualOrSmallerThan(configId, LogLevel.Debug)) {
            return;
        }
        if (!!args && !!args.length) {
            console.log(`[DEBUG] ${configId} - ${message}`, ...args);
        }
        else {
            console.log(`[DEBUG] ${configId} - ${message}`);
        }
    }
    logWarningWithoutConfig(message, ...args) {
        if (!!args && !!args.length) {
            console.warn(`[WARN] - ${message}`, ...args);
        }
        else {
            console.warn(`[WARN] - ${message}`);
        }
    }
    logWarningWithConfig(configId, message, ...args) {
        if (!this.logLevelIsSet(configId)) {
            return;
        }
        if (this.loggingIsTurnedOff(configId)) {
            return;
        }
        if (!this.currentLogLevelIsEqualOrSmallerThan(configId, LogLevel.Warn)) {
            return;
        }
        if (!!args && !!args.length) {
            console.warn(`[WARN] ${configId} - ${message}`, ...args);
        }
        else {
            console.warn(`[WARN] ${configId} - ${message}`);
        }
    }
    logErrorWithConfig(configId, message, ...args) {
        if (this.loggingIsTurnedOff(configId)) {
            return;
        }
        if (!!args && !!args.length) {
            console.error(`[ERROR] ${configId} - ${message}`, ...args);
        }
        else {
            console.error(`[ERROR] ${configId} - ${message}`);
        }
    }
    logErrorWithoutConfig(message, ...args) {
        if (!!args && !!args.length) {
            console.error(`[ERROR] - ${message}`, ...args);
        }
        else {
            console.error(`[ERROR] - ${message}`);
        }
    }
    currentLogLevelIsEqualOrSmallerThan(configId, logLevelToCompare) {
        const { logLevel } = this.configurationProvider.getOpenIDConfiguration(configId) || {};
        return logLevel <= logLevelToCompare;
    }
    logLevelIsSet(configId) {
        const { logLevel } = this.configurationProvider.getOpenIDConfiguration(configId) || {};
        if (logLevel === null) {
            return false;
        }
        if (logLevel === undefined) {
            return false;
        }
        return true;
    }
    loggingIsTurnedOff(configId) {
        const { logLevel } = this.configurationProvider.getOpenIDConfiguration(configId) || {};
        return logLevel === LogLevel.None;
    }
}
LoggerService.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: LoggerService, deps: [{ token: ConfigurationProvider }], target: i0.ɵɵFactoryTarget.Injectable });
LoggerService.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: LoggerService });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: LoggerService, decorators: [{
            type: Injectable
        }], ctorParameters: function () { return [{ type: ConfigurationProvider }]; } });

class BrowserStorageService {
    constructor(configProvider, loggerService) {
        this.configProvider = configProvider;
        this.loggerService = loggerService;
    }
    read(key, configId) {
        if (!this.hasStorage()) {
            this.loggerService.logDebug(configId, `Wanted to read '${key}' but Storage was undefined`);
            return null;
        }
        const storage = this.getStorage(configId);
        if (!storage) {
            this.loggerService.logDebug(configId, `Wanted to read config for '${configId}' but Storage was falsy`);
            return null;
        }
        const storedConfig = storage.read(configId);
        if (!storedConfig) {
            return null;
        }
        return JSON.parse(storedConfig);
    }
    write(value, configId) {
        if (!this.hasStorage()) {
            this.loggerService.logDebug(configId, `Wanted to write '${value}' but Storage was falsy`);
            return false;
        }
        const storage = this.getStorage(configId);
        if (!storage) {
            this.loggerService.logDebug(configId, `Wanted to write '${value}' but Storage was falsy`);
            return false;
        }
        value = value || null;
        storage.write(configId, JSON.stringify(value));
        return true;
    }
    remove(key, configId) {
        if (!this.hasStorage()) {
            this.loggerService.logDebug(configId, `Wanted to remove '${key}' but Storage was falsy`);
            return false;
        }
        const storage = this.getStorage(configId);
        if (!storage) {
            this.loggerService.logDebug(configId, `Wanted to write '${key}' but Storage was falsy`);
            return false;
        }
        storage.remove(key);
        return true;
    }
    // TODO THIS STORAGE WANTS AN ID BUT CLEARS EVERYTHING
    clear(configId) {
        if (!this.hasStorage()) {
            this.loggerService.logDebug(configId, `Wanted to clear storage but Storage was falsy`);
            return false;
        }
        const storage = this.getStorage(configId);
        if (!storage) {
            this.loggerService.logDebug(configId, `Wanted to clear storage but Storage was falsy`);
            return false;
        }
        storage.clear();
        return true;
    }
    getStorage(configId) {
        const { storage } = this.configProvider.getOpenIDConfiguration(configId) || {};
        return storage;
    }
    hasStorage() {
        return typeof Storage !== 'undefined';
    }
}
BrowserStorageService.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: BrowserStorageService, deps: [{ token: ConfigurationProvider }, { token: LoggerService }], target: i0.ɵɵFactoryTarget.Injectable });
BrowserStorageService.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: BrowserStorageService });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: BrowserStorageService, decorators: [{
            type: Injectable
        }], ctorParameters: function () { return [{ type: ConfigurationProvider }, { type: LoggerService }]; } });

class StoragePersistenceService {
    constructor(browserStorageService) {
        this.browserStorageService = browserStorageService;
    }
    read(key, configId) {
        const storedConfig = this.browserStorageService.read(key, configId) || {};
        return storedConfig[key];
    }
    write(key, value, configId) {
        const storedConfig = this.browserStorageService.read(key, configId) || {};
        storedConfig[key] = value;
        this.browserStorageService.write(storedConfig, configId);
    }
    remove(key, configId) {
        const storedConfig = this.browserStorageService.read(key, configId) || {};
        delete storedConfig[key];
        this.browserStorageService.write(storedConfig, configId);
    }
    clear(configId) {
        this.browserStorageService.clear(configId);
    }
    resetStorageFlowData(configId) {
        this.remove('session_state', configId);
        this.remove('storageSilentRenewRunning', configId);
        this.remove('codeVerifier', configId);
        this.remove('userData', configId);
        this.remove('storageCustomParamsAuthRequest', configId);
        this.remove('access_token_expires_at', configId);
        this.remove('storageCustomParamsRefresh', configId);
        this.remove('storageCustomParamsEndSession', configId);
    }
    resetAuthStateInStorage(configId) {
        this.remove('authzData', configId);
        this.remove('authnResult', configId);
    }
    getAccessToken(configId) {
        return this.read('authzData', configId);
    }
    getIdToken(configId) {
        var _a;
        return (_a = this.read('authnResult', configId)) === null || _a === void 0 ? void 0 : _a.id_token;
    }
    getRefreshToken(configId) {
        var _a;
        return (_a = this.read('authnResult', configId)) === null || _a === void 0 ? void 0 : _a.refresh_token;
    }
    getAuthenticationResult(configId) {
        return this.read('authnResult', configId);
    }
}
StoragePersistenceService.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: StoragePersistenceService, deps: [{ token: BrowserStorageService }], target: i0.ɵɵFactoryTarget.Injectable });
StoragePersistenceService.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: StoragePersistenceService });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: StoragePersistenceService, decorators: [{
            type: Injectable
        }], ctorParameters: function () { return [{ type: BrowserStorageService }]; } });

class PublicEventsService {
    constructor() {
        this.notify = new ReplaySubject(1);
    }
    /**
     * Fires a new event.
     *
     * @param type The event type.
     * @param value The event value.
     */
    fireEvent(type, value) {
        this.notify.next({ type, value });
    }
    /**
     * Wires up the event notification observable.
     */
    registerForEvents() {
        return this.notify.asObservable();
    }
}
PublicEventsService.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: PublicEventsService, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
PublicEventsService.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: PublicEventsService });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: PublicEventsService, decorators: [{
            type: Injectable
        }] });

const PARTS_OF_TOKEN = 3;
class TokenHelperService {
    constructor(loggerService) {
        this.loggerService = loggerService;
    }
    getTokenExpirationDate(dataIdToken) {
        if (!dataIdToken.hasOwnProperty('exp')) {
            return new Date(new Date().toUTCString());
        }
        const date = new Date(0); // The 0 here is the key, which sets the date to the epoch
        date.setUTCSeconds(dataIdToken.exp);
        return date;
    }
    getHeaderFromToken(token, encoded, configId) {
        if (!this.tokenIsValid(token, configId)) {
            return {};
        }
        return this.getPartOfToken(token, 0, encoded);
    }
    getPayloadFromToken(token, encoded, configId) {
        if (!this.tokenIsValid(token, configId)) {
            return {};
        }
        return this.getPartOfToken(token, 1, encoded);
    }
    getSignatureFromToken(token, encoded, configId) {
        if (!this.tokenIsValid(token, configId)) {
            return {};
        }
        return this.getPartOfToken(token, 2, encoded);
    }
    getPartOfToken(token, index, encoded) {
        const partOfToken = this.extractPartOfToken(token, index);
        if (encoded) {
            return partOfToken;
        }
        const result = this.urlBase64Decode(partOfToken);
        return JSON.parse(result);
    }
    urlBase64Decode(str) {
        let output = str.replace(/-/g, '+').replace(/_/g, '/');
        switch (output.length % 4) {
            case 0:
                break;
            case 2:
                output += '==';
                break;
            case 3:
                output += '=';
                break;
            default:
                throw Error('Illegal base64url string!');
        }
        const decoded = typeof window !== 'undefined' ? window.atob(output) : Buffer.from(output, 'base64').toString('binary');
        try {
            // Going backwards: from byte stream, to percent-encoding, to original string.
            return decodeURIComponent(decoded
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join(''));
        }
        catch (err) {
            return decoded;
        }
    }
    tokenIsValid(token, configId) {
        if (!token) {
            this.loggerService.logError(configId, `token '${token}' is not valid --> token falsy`);
            return false;
        }
        if (!token.includes('.')) {
            this.loggerService.logError(configId, `token '${token}' is not valid --> no dots included`);
            return false;
        }
        const parts = token.split('.');
        if (parts.length !== PARTS_OF_TOKEN) {
            this.loggerService.logError(configId, `token '${token}' is not valid --> token has to have exactly ${PARTS_OF_TOKEN - 1} dots`);
            return false;
        }
        return true;
    }
    extractPartOfToken(token, index) {
        return token.split('.')[index];
    }
}
TokenHelperService.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: TokenHelperService, deps: [{ token: LoggerService }], target: i0.ɵɵFactoryTarget.Injectable });
TokenHelperService.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: TokenHelperService });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: TokenHelperService, decorators: [{
            type: Injectable
        }], ctorParameters: function () { return [{ type: LoggerService }]; } });

class JsrsAsignReducedService {
    generateCodeChallenge(codeVerifier) {
        const hash = KJUR.crypto.Util.hashString(codeVerifier, 'sha256');
        const testData = hextob64u(hash);
        return testData;
    }
    generateAtHash(accessToken, sha) {
        const hash = KJUR.crypto.Util.hashString(accessToken, sha);
        const first128bits = hash.substr(0, hash.length / 2);
        const testData = hextob64u(first128bits);
        return testData;
    }
}
JsrsAsignReducedService.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: JsrsAsignReducedService, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
JsrsAsignReducedService.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: JsrsAsignReducedService });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: JsrsAsignReducedService, decorators: [{
            type: Injectable
        }] });

// http://openid.net/specs/openid-connect-implicit-1_0.html
// id_token
// id_token C1: The Issuer Identifier for the OpenID Provider (which is typically obtained during Discovery)
// MUST exactly match the value of the iss (issuer) Claim.
//
// id_token C2: The Client MUST validate that the aud (audience) Claim contains its client_id value registered at the Issuer identified
// by the iss (issuer) Claim as an audience.The ID Token MUST be rejected if the ID Token does not list the Client as a valid audience,
// or if it contains additional audiences not trusted by the Client.
//
// id_token C3: If the ID Token contains multiple audiences, the Client SHOULD verify that an azp Claim is present.
//
// id_token C4: If an azp (authorized party) Claim is present, the Client SHOULD verify that its client_id is the Claim Value.
//
// id_token C5: The Client MUST validate the signature of the ID Token according to JWS [JWS] using the algorithm specified in the
// alg Header Parameter of the JOSE Header.The Client MUST use the keys provided by the Issuer.
//
// id_token C6: The alg value SHOULD be RS256. Validation of tokens using other signing algorithms is described in the OpenID Connect
// Core 1.0
// [OpenID.Core] specification.
//
// id_token C7: The current time MUST be before the time represented by the exp Claim (possibly allowing for some small leeway to account
// for clock skew).
//
// id_token C8: The iat Claim can be used to reject tokens that were issued too far away from the current time,
// limiting the amount of time that nonces need to be stored to prevent attacks.The acceptable range is Client specific.
//
// id_token C9: The value of the nonce Claim MUST be checked to verify that it is the same value as the one that was sent
// in the Authentication Request.The Client SHOULD check the nonce value for replay attacks.The precise method for detecting replay attacks
// is Client specific.
//
// id_token C10: If the acr Claim was requested, the Client SHOULD check that the asserted Claim Value is appropriate.
// The meaning and processing of acr Claim Values is out of scope for this document.
//
// id_token C11: When a max_age request is made, the Client SHOULD check the auth_time Claim value and request re- authentication
// if it determines too much time has elapsed since the last End- User authentication.
// Access Token Validation
// access_token C1: Hash the octets of the ASCII representation of the access_token with the hash algorithm specified in JWA[JWA]
// for the alg Header Parameter of the ID Token's JOSE Header. For instance, if the alg is RS256, the hash algorithm used is SHA-256.
// access_token C2: Take the left- most half of the hash and base64url- encode it.
// access_token C3: The value of at_hash in the ID Token MUST match the value produced in the previous step if at_hash is present
// in the ID Token.
class TokenValidationService {
    constructor(tokenHelperService, loggerService, jsrsAsignReducedService) {
        this.tokenHelperService = tokenHelperService;
        this.loggerService = loggerService;
        this.jsrsAsignReducedService = jsrsAsignReducedService;
        this.keyAlgorithms = ['HS256', 'HS384', 'HS512', 'RS256', 'RS384', 'RS512', 'ES256', 'ES384', 'PS256', 'PS384', 'PS512'];
    }
    // id_token C7: The current time MUST be before the time represented by the exp Claim
    // (possibly allowing for some small leeway to account for clock skew).
    hasIdTokenExpired(token, configId, offsetSeconds) {
        const decoded = this.tokenHelperService.getPayloadFromToken(token, false, configId);
        return !this.validateIdTokenExpNotExpired(decoded, configId, offsetSeconds);
    }
    // id_token C7: The current time MUST be before the time represented by the exp Claim
    // (possibly allowing for some small leeway to account for clock skew).
    validateIdTokenExpNotExpired(decodedIdToken, configId, offsetSeconds) {
        const tokenExpirationDate = this.tokenHelperService.getTokenExpirationDate(decodedIdToken);
        offsetSeconds = offsetSeconds || 0;
        if (!tokenExpirationDate) {
            return false;
        }
        const tokenExpirationValue = tokenExpirationDate.valueOf();
        const nowWithOffset = new Date(new Date().toUTCString()).valueOf() + offsetSeconds * 1000;
        const tokenNotExpired = tokenExpirationValue > nowWithOffset;
        this.loggerService.logDebug(configId, `Has idToken expired: ${!tokenNotExpired} --> expires in ${this.millisToMinutesAndSeconds(tokenExpirationValue - nowWithOffset)} , ${new Date(tokenExpirationValue).toLocaleTimeString()} > ${new Date(nowWithOffset).toLocaleTimeString()}`);
        // Token not expired?
        return tokenNotExpired;
    }
    validateAccessTokenNotExpired(accessTokenExpiresAt, configId, offsetSeconds) {
        // value is optional, so if it does not exist, then it has not expired
        if (!accessTokenExpiresAt) {
            return true;
        }
        offsetSeconds = offsetSeconds || 0;
        const accessTokenExpirationValue = accessTokenExpiresAt.valueOf();
        const nowWithOffset = new Date(new Date().toUTCString()).valueOf() + offsetSeconds * 1000;
        const tokenNotExpired = accessTokenExpirationValue > nowWithOffset;
        this.loggerService.logDebug(configId, `Has accessToken expired: ${!tokenNotExpired} --> expires in ${this.millisToMinutesAndSeconds(accessTokenExpirationValue - nowWithOffset)} , ${new Date(accessTokenExpirationValue).toLocaleTimeString()} > ${new Date(nowWithOffset).toLocaleTimeString()}`);
        // access token not expired?
        return tokenNotExpired;
    }
    // iss
    // REQUIRED. Issuer Identifier for the Issuer of the response.The iss value is a case-sensitive URL using the
    // https scheme that contains scheme, host,
    // and optionally, port number and path components and no query or fragment components.
    //
    // sub
    // REQUIRED. Subject Identifier.Locally unique and never reassigned identifier within the Issuer for the End- User,
    // which is intended to be consumed by the Client, e.g., 24400320 or AItOawmwtWwcT0k51BayewNvutrJUqsvl6qs7A4.
    // It MUST NOT exceed 255 ASCII characters in length.The sub value is a case-sensitive string.
    //
    // aud
    // REQUIRED. Audience(s) that this ID Token is intended for. It MUST contain the OAuth 2.0 client_id of the Relying Party as an
    // audience value.
    // It MAY also contain identifiers for other audiences.In the general case, the aud value is an array of case-sensitive strings.
    // In the common special case when there is one audience, the aud value MAY be a single case-sensitive string.
    //
    // exp
    // REQUIRED. Expiration time on or after which the ID Token MUST NOT be accepted for processing.
    // The processing of this parameter requires that the current date/ time MUST be before the expiration date/ time listed in the value.
    // Implementers MAY provide for some small leeway, usually no more than a few minutes, to account for clock skew.
    // Its value is a JSON [RFC7159] number representing the number of seconds from 1970- 01 - 01T00: 00:00Z as measured in UTC until
    // the date/ time.
    // See RFC 3339 [RFC3339] for details regarding date/ times in general and UTC in particular.
    //
    // iat
    // REQUIRED. Time at which the JWT was issued. Its value is a JSON number representing the number of seconds from
    // 1970- 01 - 01T00: 00: 00Z as measured
    // in UTC until the date/ time.
    validateRequiredIdToken(dataIdToken, configId) {
        let validated = true;
        if (!dataIdToken.hasOwnProperty('iss')) {
            validated = false;
            this.loggerService.logWarning(configId, 'iss is missing, this is required in the id_token');
        }
        if (!dataIdToken.hasOwnProperty('sub')) {
            validated = false;
            this.loggerService.logWarning(configId, 'sub is missing, this is required in the id_token');
        }
        if (!dataIdToken.hasOwnProperty('aud')) {
            validated = false;
            this.loggerService.logWarning(configId, 'aud is missing, this is required in the id_token');
        }
        if (!dataIdToken.hasOwnProperty('exp')) {
            validated = false;
            this.loggerService.logWarning(configId, 'exp is missing, this is required in the id_token');
        }
        if (!dataIdToken.hasOwnProperty('iat')) {
            validated = false;
            this.loggerService.logWarning(configId, 'iat is missing, this is required in the id_token');
        }
        return validated;
    }
    // id_token C8: The iat Claim can be used to reject tokens that were issued too far away from the current time,
    // limiting the amount of time that nonces need to be stored to prevent attacks.The acceptable range is Client specific.
    validateIdTokenIatMaxOffset(dataIdToken, maxOffsetAllowedInSeconds, disableIatOffsetValidation, configId) {
        if (disableIatOffsetValidation) {
            return true;
        }
        if (!dataIdToken.hasOwnProperty('iat')) {
            return false;
        }
        const dateTimeIatIdToken = new Date(0); // The 0 here is the key, which sets the date to the epoch
        dateTimeIatIdToken.setUTCSeconds(dataIdToken.iat);
        maxOffsetAllowedInSeconds = maxOffsetAllowedInSeconds || 0;
        const nowInUtc = new Date(new Date().toUTCString());
        const diff = nowInUtc.valueOf() - dateTimeIatIdToken.valueOf();
        const maxOffsetAllowedInMilliseconds = maxOffsetAllowedInSeconds * 1000;
        this.loggerService.logDebug(configId, `validate id token iat max offset ${diff} < ${maxOffsetAllowedInMilliseconds}`);
        if (diff > 0) {
            return diff < maxOffsetAllowedInMilliseconds;
        }
        return -diff < maxOffsetAllowedInMilliseconds;
    }
    // id_token C9: The value of the nonce Claim MUST be checked to verify that it is the same value as the one
    // that was sent in the Authentication Request.The Client SHOULD check the nonce value for replay attacks.
    // The precise method for detecting replay attacks is Client specific.
    // However the nonce claim SHOULD not be present for the refresh_token grant type
    // https://bitbucket.org/openid/connect/issues/1025/ambiguity-with-how-nonce-is-handled-on
    // The current spec is ambiguous and KeyCloak does send it.
    validateIdTokenNonce(dataIdToken, localNonce, ignoreNonceAfterRefresh, configId) {
        const isFromRefreshToken = (dataIdToken.nonce === undefined || ignoreNonceAfterRefresh) && localNonce === TokenValidationService.refreshTokenNoncePlaceholder;
        if (!isFromRefreshToken && dataIdToken.nonce !== localNonce) {
            this.loggerService.logDebug(configId, 'Validate_id_token_nonce failed, dataIdToken.nonce: ' + dataIdToken.nonce + ' local_nonce:' + localNonce);
            return false;
        }
        return true;
    }
    // id_token C1: The Issuer Identifier for the OpenID Provider (which is typically obtained during Discovery)
    // MUST exactly match the value of the iss (issuer) Claim.
    validateIdTokenIss(dataIdToken, authWellKnownEndpointsIssuer, configId) {
        if (dataIdToken.iss !== authWellKnownEndpointsIssuer) {
            this.loggerService.logDebug(configId, 'Validate_id_token_iss failed, dataIdToken.iss: ' +
                dataIdToken.iss +
                ' authWellKnownEndpoints issuer:' +
                authWellKnownEndpointsIssuer);
            return false;
        }
        return true;
    }
    // id_token C2: The Client MUST validate that the aud (audience) Claim contains its client_id value registered at the Issuer identified
    // by the iss (issuer) Claim as an audience.
    // The ID Token MUST be rejected if the ID Token does not list the Client as a valid audience, or if it contains additional audiences
    // not trusted by the Client.
    validateIdTokenAud(dataIdToken, aud, configId) {
        if (Array.isArray(dataIdToken.aud)) {
            const result = dataIdToken.aud.includes(aud);
            if (!result) {
                this.loggerService.logDebug(configId, 'Validate_id_token_aud array failed, dataIdToken.aud: ' + dataIdToken.aud + ' client_id:' + aud);
                return false;
            }
            return true;
        }
        else if (dataIdToken.aud !== aud) {
            this.loggerService.logDebug(configId, 'Validate_id_token_aud failed, dataIdToken.aud: ' + dataIdToken.aud + ' client_id:' + aud);
            return false;
        }
        return true;
    }
    validateIdTokenAzpExistsIfMoreThanOneAud(dataIdToken) {
        if (!dataIdToken) {
            return false;
        }
        if (Array.isArray(dataIdToken.aud) && dataIdToken.aud.length > 1 && !dataIdToken.azp) {
            return false;
        }
        return true;
    }
    // If an azp (authorized party) Claim is present, the Client SHOULD verify that its client_id is the Claim Value.
    validateIdTokenAzpValid(dataIdToken, clientId) {
        if (!(dataIdToken === null || dataIdToken === void 0 ? void 0 : dataIdToken.azp)) {
            return true;
        }
        if (dataIdToken.azp === clientId) {
            return true;
        }
        return false;
    }
    validateStateFromHashCallback(state, localState, configId) {
        if (state !== localState) {
            this.loggerService.logDebug(configId, 'ValidateStateFromHashCallback failed, state: ' + state + ' local_state:' + localState);
            return false;
        }
        return true;
    }
    // id_token C5: The Client MUST validate the signature of the ID Token according to JWS [JWS] using the algorithm specified in the alg
    // Header Parameter of the JOSE Header.The Client MUST use the keys provided by the Issuer.
    // id_token C6: The alg value SHOULD be RS256. Validation of tokens using other signing algorithms is described in the
    // OpenID Connect Core 1.0 [OpenID.Core] specification.
    validateSignatureIdToken(idToken, jwtkeys, configId) {
        if (!jwtkeys || !jwtkeys.keys) {
            return false;
        }
        const headerData = this.tokenHelperService.getHeaderFromToken(idToken, false, configId);
        if (Object.keys(headerData).length === 0 && headerData.constructor === Object) {
            this.loggerService.logWarning(configId, 'id token has no header data');
            return false;
        }
        const kid = headerData.kid;
        const alg = headerData.alg;
        if (!this.keyAlgorithms.includes(alg)) {
            this.loggerService.logWarning(configId, 'alg not supported', alg);
            return false;
        }
        let jwtKtyToUse = 'RSA';
        if (alg.charAt(0) === 'E') {
            jwtKtyToUse = 'EC';
        }
        let isValid = false;
        // No kid in the Jose header
        if (!kid) {
            let keyToValidate;
            // If only one key, use it
            if (jwtkeys.keys.length === 1 && jwtkeys.keys[0].kty === jwtKtyToUse) {
                keyToValidate = jwtkeys.keys[0];
            }
            else {
                // More than one key
                // Make sure there's exactly 1 key candidate
                // kty "RSA" and "EC" uses "sig"
                let amountOfMatchingKeys = 0;
                for (const key of jwtkeys.keys) {
                    if (key.kty === jwtKtyToUse && key.use === 'sig') {
                        amountOfMatchingKeys++;
                        keyToValidate = key;
                    }
                }
                if (amountOfMatchingKeys > 1) {
                    this.loggerService.logWarning(configId, 'no ID Token kid claim in JOSE header and multiple supplied in jwks_uri');
                    return false;
                }
            }
            if (!keyToValidate) {
                this.loggerService.logWarning(configId, 'no keys found, incorrect Signature, validation failed for id_token');
                return false;
            }
            isValid = KJUR.jws.JWS.verify(idToken, KEYUTIL.getKey(keyToValidate), [alg]);
            if (!isValid) {
                this.loggerService.logWarning(configId, 'incorrect Signature, validation failed for id_token');
            }
            return isValid;
        }
        else {
            // kid in the Jose header of id_token
            for (const key of jwtkeys.keys) {
                if (key.kid === kid) {
                    const publicKey = KEYUTIL.getKey(key);
                    isValid = KJUR.jws.JWS.verify(idToken, publicKey, [alg]);
                    if (!isValid) {
                        this.loggerService.logWarning(configId, 'incorrect Signature, validation failed for id_token');
                    }
                    return isValid;
                }
            }
        }
        return isValid;
    }
    // Accepts ID Token without 'kid' claim in JOSE header if only one JWK supplied in 'jwks_url'
    //// private validate_no_kid_in_header_only_one_allowed_in_jwtkeys(header_data: any, jwtkeys: any): boolean {
    ////    this.oidcSecurityCommon.logDebug('amount of jwtkeys.keys: ' + jwtkeys.keys.length);
    ////    if (!header_data.hasOwnProperty('kid')) {
    ////        // no kid defined in Jose header
    ////        if (jwtkeys.keys.length != 1) {
    ////            this.oidcSecurityCommon.logDebug('jwtkeys.keys.length != 1 and no kid in header');
    ////            return false;
    ////        }
    ////    }
    ////    return true;
    //// }
    // Access Token Validation
    // access_token C1: Hash the octets of the ASCII representation of the access_token with the hash algorithm specified in JWA[JWA]
    // for the alg Header Parameter of the ID Token's JOSE Header. For instance, if the alg is RS256, the hash algorithm used is SHA-256.
    // access_token C2: Take the left- most half of the hash and base64url- encode it.
    // access_token C3: The value of at_hash in the ID Token MUST match the value produced in the previous step if at_hash
    // is present in the ID Token.
    validateIdTokenAtHash(accessToken, atHash, idTokenAlg, configId) {
        this.loggerService.logDebug(configId, 'at_hash from the server:' + atHash);
        // 'sha256' 'sha384' 'sha512'
        let sha = 'sha256';
        if (idTokenAlg.includes('384')) {
            sha = 'sha384';
        }
        else if (idTokenAlg.includes('512')) {
            sha = 'sha512';
        }
        const testData = this.jsrsAsignReducedService.generateAtHash('' + accessToken, sha);
        this.loggerService.logDebug(configId, 'at_hash client validation not decoded:' + testData);
        if (testData === atHash) {
            return true; // isValid;
        }
        else {
            const testValue = this.jsrsAsignReducedService.generateAtHash('' + decodeURIComponent(accessToken), sha);
            this.loggerService.logDebug(configId, '-gen access--' + testValue);
            if (testValue === atHash) {
                return true; // isValid
            }
        }
        return false;
    }
    millisToMinutesAndSeconds(millis) {
        const minutes = Math.floor(millis / 60000);
        const seconds = ((millis % 60000) / 1000).toFixed(0);
        return minutes + ':' + (+seconds < 10 ? '0' : '') + seconds;
    }
}
TokenValidationService.refreshTokenNoncePlaceholder = '--RefreshToken--';
TokenValidationService.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: TokenValidationService, deps: [{ token: TokenHelperService }, { token: LoggerService }, { token: JsrsAsignReducedService }], target: i0.ɵɵFactoryTarget.Injectable });
TokenValidationService.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: TokenValidationService });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: TokenValidationService, decorators: [{
            type: Injectable
        }], ctorParameters: function () { return [{ type: TokenHelperService }, { type: LoggerService }, { type: JsrsAsignReducedService }]; } });

const DEFAULT_AUTHRESULT = { isAuthenticated: false, allConfigsAuthenticated: [] };
class AuthStateService {
    constructor(storagePersistenceService, loggerService, publicEventsService, configurationProvider, tokenValidationService) {
        this.storagePersistenceService = storagePersistenceService;
        this.loggerService = loggerService;
        this.publicEventsService = publicEventsService;
        this.configurationProvider = configurationProvider;
        this.tokenValidationService = tokenValidationService;
        this.authenticatedInternal$ = new BehaviorSubject(DEFAULT_AUTHRESULT);
    }
    get authenticated$() {
        return this.authenticatedInternal$.asObservable().pipe(distinctUntilChanged());
    }
    setAuthenticatedAndFireEvent() {
        const result = this.composeAuthenticatedResult();
        this.authenticatedInternal$.next(result);
    }
    setUnauthenticatedAndFireEvent(configIdToReset) {
        this.storagePersistenceService.resetAuthStateInStorage(configIdToReset);
        const result = this.composeUnAuthenticatedResult();
        this.authenticatedInternal$.next(result);
    }
    updateAndPublishAuthState(authenticationResult) {
        this.publicEventsService.fireEvent(EventTypes.NewAuthenticationResult, authenticationResult);
    }
    setAuthorizationData(accessToken, authResult, configId) {
        this.loggerService.logDebug(configId, `storing the accessToken '${accessToken}'`);
        this.storagePersistenceService.write('authzData', accessToken, configId);
        this.persistAccessTokenExpirationTime(authResult, configId);
        this.setAuthenticatedAndFireEvent();
    }
    getAccessToken(configId) {
        if (!this.isAuthenticated(configId)) {
            return null;
        }
        const token = this.storagePersistenceService.getAccessToken(configId);
        return this.decodeURIComponentSafely(token);
    }
    getIdToken(configId) {
        if (!this.isAuthenticated(configId)) {
            return null;
        }
        const token = this.storagePersistenceService.getIdToken(configId);
        return this.decodeURIComponentSafely(token);
    }
    getRefreshToken(configId) {
        if (!this.isAuthenticated(configId)) {
            return null;
        }
        const token = this.storagePersistenceService.getRefreshToken(configId);
        return this.decodeURIComponentSafely(token);
    }
    getAuthenticationResult(configId) {
        if (!this.isAuthenticated(configId)) {
            return null;
        }
        return this.storagePersistenceService.getAuthenticationResult(configId);
    }
    areAuthStorageTokensValid(configId) {
        if (!this.isAuthenticated(configId)) {
            return false;
        }
        if (this.hasIdTokenExpiredAndRenewCheckIsEnabled(configId)) {
            this.loggerService.logDebug(configId, 'persisted idToken is expired');
            return false;
        }
        if (this.hasAccessTokenExpiredIfExpiryExists(configId)) {
            this.loggerService.logDebug(configId, 'persisted accessToken is expired');
            return false;
        }
        this.loggerService.logDebug(configId, 'persisted idToken and accessToken are valid');
        return true;
    }
    hasIdTokenExpiredAndRenewCheckIsEnabled(configId) {
        const { renewTimeBeforeTokenExpiresInSeconds, enableIdTokenExpiredValidationInRenew } = this.configurationProvider.getOpenIDConfiguration(configId);
        if (!enableIdTokenExpiredValidationInRenew) {
            return false;
        }
        const tokenToCheck = this.storagePersistenceService.getIdToken(configId);
        const idTokenExpired = this.tokenValidationService.hasIdTokenExpired(tokenToCheck, configId, renewTimeBeforeTokenExpiresInSeconds);
        if (idTokenExpired) {
            this.publicEventsService.fireEvent(EventTypes.IdTokenExpired, idTokenExpired);
        }
        return idTokenExpired;
    }
    hasAccessTokenExpiredIfExpiryExists(configId) {
        const { renewTimeBeforeTokenExpiresInSeconds } = this.configurationProvider.getOpenIDConfiguration(configId);
        const accessTokenExpiresIn = this.storagePersistenceService.read('access_token_expires_at', configId);
        const accessTokenHasNotExpired = this.tokenValidationService.validateAccessTokenNotExpired(accessTokenExpiresIn, configId, renewTimeBeforeTokenExpiresInSeconds);
        const hasExpired = !accessTokenHasNotExpired;
        if (hasExpired) {
            this.publicEventsService.fireEvent(EventTypes.TokenExpired, hasExpired);
        }
        return hasExpired;
    }
    isAuthenticated(configId) {
        return !!this.storagePersistenceService.getAccessToken(configId) && !!this.storagePersistenceService.getIdToken(configId);
    }
    decodeURIComponentSafely(token) {
        if (token) {
            return decodeURIComponent(token);
        }
        else {
            return '';
        }
    }
    persistAccessTokenExpirationTime(authResult, configId) {
        if (authResult === null || authResult === void 0 ? void 0 : authResult.expires_in) {
            const accessTokenExpiryTime = new Date(new Date().toUTCString()).valueOf() + authResult.expires_in * 1000;
            this.storagePersistenceService.write('access_token_expires_at', accessTokenExpiryTime, configId);
        }
    }
    composeAuthenticatedResult() {
        if (!this.configurationProvider.hasManyConfigs()) {
            const { configId } = this.configurationProvider.getOpenIDConfiguration();
            return { isAuthenticated: true, allConfigsAuthenticated: [{ configId, isAuthenticated: true }] };
        }
        return this.checkAllConfigsIfTheyAreAuthenticated();
    }
    composeUnAuthenticatedResult() {
        if (!this.configurationProvider.hasManyConfigs()) {
            const { configId } = this.configurationProvider.getOpenIDConfiguration();
            return { isAuthenticated: false, allConfigsAuthenticated: [{ configId, isAuthenticated: false }] };
        }
        return this.checkAllConfigsIfTheyAreAuthenticated();
    }
    checkAllConfigsIfTheyAreAuthenticated() {
        const configs = this.configurationProvider.getAllConfigurations();
        const allConfigsAuthenticated = configs.map(({ configId }) => ({
            configId,
            isAuthenticated: this.isAuthenticated(configId),
        }));
        const isAuthenticated = allConfigsAuthenticated.every((x) => !!x.isAuthenticated);
        return { allConfigsAuthenticated, isAuthenticated };
    }
}
AuthStateService.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: AuthStateService, deps: [{ token: StoragePersistenceService }, { token: LoggerService }, { token: PublicEventsService }, { token: ConfigurationProvider }, { token: TokenValidationService }], target: i0.ɵɵFactoryTarget.Injectable });
AuthStateService.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: AuthStateService });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: AuthStateService, decorators: [{
            type: Injectable
        }], ctorParameters: function () { return [{ type: StoragePersistenceService }, { type: LoggerService }, { type: PublicEventsService }, { type: ConfigurationProvider }, { type: TokenValidationService }]; } });

const STORAGE_KEY = 'redirect';
class AutoLoginService {
    constructor(storageService, router) {
        this.storageService = storageService;
        this.router = router;
    }
    checkSavedRedirectRouteAndNavigate(configId) {
        const savedRouteForRedirect = this.getStoredRedirectRoute(configId);
        if (savedRouteForRedirect) {
            this.deleteStoredRedirectRoute(configId);
            this.router.navigateByUrl(savedRouteForRedirect);
        }
    }
    /**
     * Saves the redirect URL to storage.
     *
     * @param url The redirect URL to save.
     */
    saveRedirectRoute(configId, url) {
        this.storageService.write(STORAGE_KEY, url, configId);
    }
    /**
     * Gets the stored redirect URL from storage.
     */
    getStoredRedirectRoute(configId) {
        return this.storageService.read(STORAGE_KEY, configId);
    }
    /**
     * Removes the redirect URL from storage.
     */
    deleteStoredRedirectRoute(configId) {
        this.storageService.remove(STORAGE_KEY, configId);
    }
}
AutoLoginService.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: AutoLoginService, deps: [{ token: StoragePersistenceService }, { token: i2.Router }], target: i0.ɵɵFactoryTarget.Injectable });
AutoLoginService.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: AutoLoginService });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: AutoLoginService, decorators: [{
            type: Injectable
        }], ctorParameters: function () { return [{ type: StoragePersistenceService }, { type: i2.Router }]; } });

class UriEncoder {
    encodeKey(key) {
        return encodeURIComponent(key);
    }
    encodeValue(value) {
        return encodeURIComponent(value);
    }
    decodeKey(key) {
        return decodeURIComponent(key);
    }
    decodeValue(value) {
        return decodeURIComponent(value);
    }
}

class RandomService {
    constructor(doc, loggerService) {
        this.doc = doc;
        this.loggerService = loggerService;
    }
    createRandom(requiredLength, configId) {
        if (requiredLength <= 0) {
            return '';
        }
        if (requiredLength > 0 && requiredLength < 7) {
            this.loggerService.logWarning(configId, `RandomService called with ${requiredLength} but 7 chars is the minimum, returning 10 chars`);
            requiredLength = 10;
        }
        const length = requiredLength - 6;
        const arr = new Uint8Array(Math.floor((length || length) / 2));
        if (this.getCrypto()) {
            this.getCrypto().getRandomValues(arr);
        }
        return Array.from(arr, this.toHex).join('') + this.randomString(7);
    }
    toHex(dec) {
        return ('0' + dec.toString(16)).substr(-2);
    }
    randomString(length) {
        let result = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const values = new Uint32Array(length);
        if (this.getCrypto()) {
            this.getCrypto().getRandomValues(values);
            for (let i = 0; i < length; i++) {
                result += characters[values[i] % characters.length];
            }
        }
        return result;
    }
    getCrypto() {
        // support for IE,  (window.crypto || window.msCrypto)
        return this.doc.defaultView.crypto || this.doc.defaultView.msCrypto;
    }
}
RandomService.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: RandomService, deps: [{ token: DOCUMENT }, { token: LoggerService }], target: i0.ɵɵFactoryTarget.Injectable });
RandomService.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: RandomService });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: RandomService, decorators: [{
            type: Injectable
        }], ctorParameters: function () {
        return [{ type: undefined, decorators: [{
                        type: Inject,
                        args: [DOCUMENT]
                    }] }, { type: LoggerService }];
    } });

class FlowsDataService {
    constructor(storagePersistenceService, randomService, configurationProvider, loggerService) {
        this.storagePersistenceService = storagePersistenceService;
        this.randomService = randomService;
        this.configurationProvider = configurationProvider;
        this.loggerService = loggerService;
    }
    createNonce(configId) {
        const nonce = this.randomService.createRandom(40, configId);
        this.loggerService.logDebug(configId, 'Nonce created. nonce:' + nonce);
        this.setNonce(nonce, configId);
        return nonce;
    }
    setNonce(nonce, configId) {
        this.storagePersistenceService.write('authNonce', nonce, configId);
    }
    getAuthStateControl(configId) {
        return this.storagePersistenceService.read('authStateControl', configId);
    }
    setAuthStateControl(authStateControl, configId) {
        this.storagePersistenceService.write('authStateControl', authStateControl, configId);
    }
    getExistingOrCreateAuthStateControl(configId) {
        let state = this.storagePersistenceService.read('authStateControl', configId);
        if (!state) {
            state = this.randomService.createRandom(40, configId);
            this.storagePersistenceService.write('authStateControl', state, configId);
        }
        return state;
    }
    setSessionState(sessionState, configId) {
        this.storagePersistenceService.write('session_state', sessionState, configId);
    }
    resetStorageFlowData(configId) {
        this.storagePersistenceService.resetStorageFlowData(configId);
    }
    getCodeVerifier(configId) {
        return this.storagePersistenceService.read('codeVerifier', configId);
    }
    createCodeVerifier(configId) {
        const codeVerifier = this.randomService.createRandom(67, configId);
        this.storagePersistenceService.write('codeVerifier', codeVerifier, configId);
        return codeVerifier;
    }
    isSilentRenewRunning(configId) {
        const storageObject = this.getSilentRenewRunningStorageEntry(configId);
        if (!storageObject) {
            return false;
        }
        const { silentRenewTimeoutInSeconds } = this.configurationProvider.getOpenIDConfiguration(configId);
        const timeOutInMilliseconds = silentRenewTimeoutInSeconds * 1000;
        const dateOfLaunchedProcessUtc = Date.parse(storageObject.dateOfLaunchedProcessUtc);
        const currentDateUtc = Date.parse(new Date().toISOString());
        const elapsedTimeInMilliseconds = Math.abs(currentDateUtc - dateOfLaunchedProcessUtc);
        const isProbablyStuck = elapsedTimeInMilliseconds > timeOutInMilliseconds;
        if (isProbablyStuck) {
            this.loggerService.logDebug(configId, 'silent renew process is probably stuck, state will be reset.', configId);
            this.resetSilentRenewRunning(configId);
            return false;
        }
        return storageObject.state === 'running';
    }
    setSilentRenewRunning(configId) {
        const storageObject = {
            state: 'running',
            dateOfLaunchedProcessUtc: new Date().toISOString(),
        };
        this.storagePersistenceService.write('storageSilentRenewRunning', JSON.stringify(storageObject), configId);
    }
    resetSilentRenewRunning(configId) {
        this.storagePersistenceService.write('storageSilentRenewRunning', '', configId);
    }
    getSilentRenewRunningStorageEntry(configId) {
        const storageEntry = this.storagePersistenceService.read('storageSilentRenewRunning', configId);
        if (!storageEntry) {
            return null;
        }
        return JSON.parse(storageEntry);
    }
}
FlowsDataService.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: FlowsDataService, deps: [{ token: StoragePersistenceService }, { token: RandomService }, { token: ConfigurationProvider }, { token: LoggerService }], target: i0.ɵɵFactoryTarget.Injectable });
FlowsDataService.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: FlowsDataService });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: FlowsDataService, decorators: [{
            type: Injectable
        }], ctorParameters: function () { return [{ type: StoragePersistenceService }, { type: RandomService }, { type: ConfigurationProvider }, { type: LoggerService }]; } });

class FlowHelper {
    constructor(configurationProvider) {
        this.configurationProvider = configurationProvider;
    }
    isCurrentFlowCodeFlow(configId) {
        return this.currentFlowIs('code', configId);
    }
    isCurrentFlowAnyImplicitFlow(configId) {
        return this.isCurrentFlowImplicitFlowWithAccessToken(configId) || this.isCurrentFlowImplicitFlowWithoutAccessToken(configId);
    }
    isCurrentFlowCodeFlowWithRefreshTokens(configId) {
        const { useRefreshToken } = this.configurationProvider.getOpenIDConfiguration(configId);
        if (this.isCurrentFlowCodeFlow(configId) && useRefreshToken) {
            return true;
        }
        return false;
    }
    isCurrentFlowImplicitFlowWithAccessToken(configId) {
        return this.currentFlowIs('id_token token', configId);
    }
    currentFlowIs(flowTypes, configId) {
        const { responseType } = this.configurationProvider.getOpenIDConfiguration(configId);
        if (Array.isArray(flowTypes)) {
            return flowTypes.some((x) => responseType === x);
        }
        return responseType === flowTypes;
    }
    isCurrentFlowImplicitFlowWithoutAccessToken(configId) {
        return this.currentFlowIs('id_token', configId);
    }
}
FlowHelper.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: FlowHelper, deps: [{ token: ConfigurationProvider }], target: i0.ɵɵFactoryTarget.Injectable });
FlowHelper.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: FlowHelper });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: FlowHelper, decorators: [{
            type: Injectable
        }], ctorParameters: function () { return [{ type: ConfigurationProvider }]; } });

const CALLBACK_PARAMS_TO_CHECK = ['code', 'state', 'token', 'id_token'];
const AUTH0_ENDPOINT = 'auth0.com';
class UrlService {
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
        const endSessionEndpoint = authWellKnownEndPoints === null || authWellKnownEndPoints === void 0 ? void 0 : authWellKnownEndPoints.endSessionEndpoint;
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
            params = this.appendCustomParams(Object.assign({}, customParamsEndSession), params);
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
        const revocationEndpoint = authWellKnownEndPoints === null || authWellKnownEndPoints === void 0 ? void 0 : authWellKnownEndPoints.revocationEndpoint;
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
            params = this.appendCustomParams(Object.assign({}, customTokenParams), params);
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
            params = this.appendCustomParams(Object.assign({}, customParamsRefresh), params);
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
            params = this.appendCustomParams(Object.assign({}, customParamsAuthRequest), params);
        }
        if (customParamsRequest) {
            params = this.appendCustomParams(Object.assign({}, customParamsRequest), params);
        }
        return params.toString();
    }
    createAuthorizeUrl(codeChallenge, redirectUrl, nonce, state, configId, prompt, customRequestParams) {
        const authWellKnownEndPoints = this.storagePersistenceService.read('authWellKnownEndPoints', configId);
        const authorizationEndpoint = authWellKnownEndPoints === null || authWellKnownEndPoints === void 0 ? void 0 : authWellKnownEndPoints.authorizationEndpoint;
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
        const mergedParams = Object.assign(Object.assign({}, customParamsAuthRequest), customRequestParams);
        if (Object.keys(mergedParams).length > 0) {
            params = this.appendCustomParams(Object.assign({}, mergedParams), params);
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
        for (const [key, value] of Object.entries(Object.assign({}, customParams))) {
            params = params.append(key, value.toString());
        }
        return params;
    }
    overWriteParam(params, key, value) {
        return params.set(key, value);
    }
    createHttpParams(existingParams) {
        existingParams = existingParams !== null && existingParams !== void 0 ? existingParams : '';
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
UrlService.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: UrlService, deps: [{ token: ConfigurationProvider }, { token: LoggerService }, { token: FlowsDataService }, { token: FlowHelper }, { token: StoragePersistenceService }, { token: JsrsAsignReducedService }], target: i0.ɵɵFactoryTarget.Injectable });
UrlService.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: UrlService });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: UrlService, decorators: [{
            type: Injectable
        }], ctorParameters: function () { return [{ type: ConfigurationProvider }, { type: LoggerService }, { type: FlowsDataService }, { type: FlowHelper }, { type: StoragePersistenceService }, { type: JsrsAsignReducedService }]; } });

class CodeFlowCallbackHandlerService {
    constructor(urlService, loggerService, tokenValidationService, flowsDataService, configurationProvider, storagePersistenceService, dataService) {
        this.urlService = urlService;
        this.loggerService = loggerService;
        this.tokenValidationService = tokenValidationService;
        this.flowsDataService = flowsDataService;
        this.configurationProvider = configurationProvider;
        this.storagePersistenceService = storagePersistenceService;
        this.dataService = dataService;
    }
    // STEP 1 Code Flow
    codeFlowCallback(urlToCheck, configId) {
        const code = this.urlService.getUrlParameter(urlToCheck, 'code');
        const state = this.urlService.getUrlParameter(urlToCheck, 'state');
        const sessionState = this.urlService.getUrlParameter(urlToCheck, 'session_state');
        if (!state) {
            this.loggerService.logDebug(configId, 'no state in url');
            return throwError(() => new Error('no state in url'));
        }
        if (!code) {
            this.loggerService.logDebug(configId, 'no code in url');
            return throwError(() => new Error('no code in url'));
        }
        this.loggerService.logDebug(configId, 'running validation for callback', urlToCheck);
        const initialCallbackContext = {
            code,
            refreshToken: null,
            state,
            sessionState,
            authResult: null,
            isRenewProcess: false,
            jwtKeys: null,
            validationResult: null,
            existingIdToken: null,
        };
        return of(initialCallbackContext);
    }
    // STEP 2 Code Flow //  Code Flow Silent Renew starts here
    codeFlowCodeRequest(callbackContext, configId) {
        const authStateControl = this.flowsDataService.getAuthStateControl(configId);
        const isStateCorrect = this.tokenValidationService.validateStateFromHashCallback(callbackContext.state, authStateControl, configId);
        if (!isStateCorrect) {
            return throwError(() => new Error('codeFlowCodeRequest incorrect state'));
        }
        const authWellknownEndpoints = this.storagePersistenceService.read('authWellKnownEndPoints', configId);
        const tokenEndpoint = authWellknownEndpoints === null || authWellknownEndpoints === void 0 ? void 0 : authWellknownEndpoints.tokenEndpoint;
        if (!tokenEndpoint) {
            return throwError(() => new Error('Token Endpoint not defined'));
        }
        let headers = new HttpHeaders();
        headers = headers.set('Content-Type', 'application/x-www-form-urlencoded');
        const config = this.configurationProvider.getOpenIDConfiguration(configId);
        const bodyForCodeFlow = this.urlService.createBodyForCodeFlowCodeRequest(callbackContext.code, configId, config === null || config === void 0 ? void 0 : config.customParamsCodeRequest);
        return this.dataService.post(tokenEndpoint, bodyForCodeFlow, configId, headers).pipe(switchMap((response) => {
            let authResult = new Object();
            authResult = response;
            authResult.state = callbackContext.state;
            authResult.session_state = callbackContext.sessionState;
            callbackContext.authResult = authResult;
            return of(callbackContext);
        }), retryWhen((error) => this.handleRefreshRetry(error, configId)), catchError((error) => {
            const { authority } = this.configurationProvider.getOpenIDConfiguration(configId);
            const errorMessage = `OidcService code request ${authority}`;
            this.loggerService.logError(configId, errorMessage, error);
            return throwError(() => new Error(errorMessage));
        }));
    }
    handleRefreshRetry(errors, configId) {
        return errors.pipe(mergeMap((error) => {
            // retry token refresh if there is no internet connection
            if (error && error instanceof HttpErrorResponse && error.error instanceof ProgressEvent && error.error.type === 'error') {
                const { authority, refreshTokenRetryInSeconds } = this.configurationProvider.getOpenIDConfiguration(configId);
                const errorMessage = `OidcService code request ${authority} - no internet connection`;
                this.loggerService.logWarning(configId, errorMessage, error);
                return timer(refreshTokenRetryInSeconds * 1000);
            }
            return throwError(() => new Error(error));
        }));
    }
}
CodeFlowCallbackHandlerService.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: CodeFlowCallbackHandlerService, deps: [{ token: UrlService }, { token: LoggerService }, { token: TokenValidationService }, { token: FlowsDataService }, { token: ConfigurationProvider }, { token: StoragePersistenceService }, { token: DataService }], target: i0.ɵɵFactoryTarget.Injectable });
CodeFlowCallbackHandlerService.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: CodeFlowCallbackHandlerService });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: CodeFlowCallbackHandlerService, decorators: [{
            type: Injectable
        }], ctorParameters: function () { return [{ type: UrlService }, { type: LoggerService }, { type: TokenValidationService }, { type: FlowsDataService }, { type: ConfigurationProvider }, { type: StoragePersistenceService }, { type: DataService }]; } });

const DEFAULT_USERRESULT = { userData: null, allUserData: [] };
class UserService {
    constructor(oidcDataService, storagePersistenceService, eventService, loggerService, tokenHelperService, flowHelper, configurationProvider) {
        this.oidcDataService = oidcDataService;
        this.storagePersistenceService = storagePersistenceService;
        this.eventService = eventService;
        this.loggerService = loggerService;
        this.tokenHelperService = tokenHelperService;
        this.flowHelper = flowHelper;
        this.configurationProvider = configurationProvider;
        this.userDataInternal$ = new BehaviorSubject(DEFAULT_USERRESULT);
    }
    get userData$() {
        return this.userDataInternal$.asObservable();
    }
    getAndPersistUserDataInStore(configId, isRenewProcess = false, idToken, decodedIdToken) {
        idToken = idToken || this.storagePersistenceService.getIdToken(configId);
        decodedIdToken = decodedIdToken || this.tokenHelperService.getPayloadFromToken(idToken, false, configId);
        const existingUserDataFromStorage = this.getUserDataFromStore(configId);
        const haveUserData = !!existingUserDataFromStorage;
        const isCurrentFlowImplicitFlowWithAccessToken = this.flowHelper.isCurrentFlowImplicitFlowWithAccessToken(configId);
        const isCurrentFlowCodeFlow = this.flowHelper.isCurrentFlowCodeFlow(configId);
        const accessToken = this.storagePersistenceService.getAccessToken(configId);
        if (!(isCurrentFlowImplicitFlowWithAccessToken || isCurrentFlowCodeFlow)) {
            this.loggerService.logDebug(configId, `authCallback idToken flow with accessToken ${accessToken}`);
            this.setUserDataToStore(decodedIdToken, configId);
            return of(decodedIdToken);
        }
        const { renewUserInfoAfterTokenRenew } = this.configurationProvider.getOpenIDConfiguration(configId);
        if (!isRenewProcess || renewUserInfoAfterTokenRenew || !haveUserData) {
            return this.getUserDataOidcFlowAndSave(decodedIdToken.sub, configId).pipe(switchMap((userData) => {
                this.loggerService.logDebug(configId, 'Received user data: ', userData);
                if (!!userData) {
                    this.loggerService.logDebug(configId, 'accessToken: ', accessToken);
                    return of(userData);
                }
                else {
                    return throwError(() => new Error('Received no user data, request failed'));
                }
            }));
        }
        return of(existingUserDataFromStorage);
    }
    getUserDataFromStore(configId) {
        return this.storagePersistenceService.read('userData', configId) || null;
    }
    publishUserDataIfExists(configId) {
        const userData = this.getUserDataFromStore(configId);
        if (userData) {
            this.fireUserDataEvent(configId, userData);
        }
    }
    setUserDataToStore(userData, configId) {
        this.storagePersistenceService.write('userData', userData, configId);
        this.fireUserDataEvent(configId, userData);
    }
    resetUserDataInStore(configId) {
        this.storagePersistenceService.remove('userData', configId);
        this.fireUserDataEvent(configId, null);
    }
    getUserDataOidcFlowAndSave(idTokenSub, configId) {
        return this.getIdentityUserData(configId).pipe(map((data) => {
            if (this.validateUserDataSubIdToken(idTokenSub, data === null || data === void 0 ? void 0 : data.sub)) {
                this.setUserDataToStore(data, configId);
                return data;
            }
            else {
                // something went wrong, user data sub does not match that from id_token
                this.loggerService.logWarning(configId, `User data sub does not match sub in id_token, resetting`);
                this.resetUserDataInStore(configId);
                return null;
            }
        }));
    }
    getIdentityUserData(configId) {
        const token = this.storagePersistenceService.getAccessToken(configId);
        const authWellKnownEndPoints = this.storagePersistenceService.read('authWellKnownEndPoints', configId);
        if (!authWellKnownEndPoints) {
            this.loggerService.logWarning(configId, 'init check session: authWellKnownEndpoints is undefined');
            return throwError(() => new Error('authWellKnownEndpoints is undefined'));
        }
        const userInfoEndpoint = authWellKnownEndPoints.userInfoEndpoint;
        if (!userInfoEndpoint) {
            this.loggerService.logError(configId, 'init check session: authWellKnownEndpoints.userinfo_endpoint is undefined; set auto_userinfo = false in config');
            return throwError(() => new Error('authWellKnownEndpoints.userinfo_endpoint is undefined'));
        }
        return this.oidcDataService.get(userInfoEndpoint, configId, token).pipe(retry(2));
    }
    validateUserDataSubIdToken(idTokenSub, userDataSub) {
        if (!idTokenSub) {
            return false;
        }
        if (!userDataSub) {
            return false;
        }
        if (idTokenSub !== userDataSub) {
            this.loggerService.logDebug('validateUserDataSubIdToken failed', idTokenSub, userDataSub);
            return false;
        }
        return true;
    }
    fireUserDataEvent(configId, passedUserData) {
        const userData = this.composeSingleOrMultipleUserDataObject(configId, passedUserData);
        this.userDataInternal$.next(userData);
        this.eventService.fireEvent(EventTypes.UserDataChanged, { configId, userData: passedUserData });
    }
    composeSingleOrMultipleUserDataObject(configId, passedUserData) {
        const hasManyConfigs = this.configurationProvider.hasManyConfigs();
        if (!hasManyConfigs) {
            return this.composeSingleUserDataResult(configId, passedUserData);
        }
        const configs = this.configurationProvider.getAllConfigurations();
        const allUserData = configs.map((config) => {
            if (this.currentConfigIsToUpdate(configId, config)) {
                return { configId: config.configId, userData: passedUserData };
            }
            const alreadySavedUserData = this.storagePersistenceService.read('userData', config.configId) || null;
            return { configId: config.configId, userData: alreadySavedUserData };
        });
        return {
            userData: null,
            allUserData,
        };
    }
    composeSingleUserDataResult(configId, userData) {
        return {
            userData,
            allUserData: [{ configId, userData }],
        };
    }
    currentConfigIsToUpdate(configId, config) {
        return config.configId === configId;
    }
}
UserService.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: UserService, deps: [{ token: DataService }, { token: StoragePersistenceService }, { token: PublicEventsService }, { token: LoggerService }, { token: TokenHelperService }, { token: FlowHelper }, { token: ConfigurationProvider }], target: i0.ɵɵFactoryTarget.Injectable });
UserService.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: UserService });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: UserService, decorators: [{
            type: Injectable
        }], ctorParameters: function () { return [{ type: DataService }, { type: StoragePersistenceService }, { type: PublicEventsService }, { type: LoggerService }, { type: TokenHelperService }, { type: FlowHelper }, { type: ConfigurationProvider }]; } });

class ResetAuthDataService {
    constructor(authStateService, flowsDataService, userService) {
        this.authStateService = authStateService;
        this.flowsDataService = flowsDataService;
        this.userService = userService;
    }
    resetAuthorizationData(configId) {
        this.userService.resetUserDataInStore(configId);
        this.flowsDataService.resetStorageFlowData(configId);
        this.authStateService.setUnauthenticatedAndFireEvent(configId);
    }
}
ResetAuthDataService.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: ResetAuthDataService, deps: [{ token: AuthStateService }, { token: FlowsDataService }, { token: UserService }], target: i0.ɵɵFactoryTarget.Injectable });
ResetAuthDataService.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: ResetAuthDataService });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: ResetAuthDataService, decorators: [{
            type: Injectable
        }], ctorParameters: function () { return [{ type: AuthStateService }, { type: FlowsDataService }, { type: UserService }]; } });

class ImplicitFlowCallbackHandlerService {
    constructor(resetAuthDataService, loggerService, flowsDataService, doc) {
        this.resetAuthDataService = resetAuthDataService;
        this.loggerService = loggerService;
        this.flowsDataService = flowsDataService;
        this.doc = doc;
    }
    // STEP 1 Code Flow
    // STEP 1 Implicit Flow
    implicitFlowCallback(configId, hash) {
        const isRenewProcessData = this.flowsDataService.isSilentRenewRunning(configId);
        this.loggerService.logDebug(configId, 'BEGIN callback, no auth data');
        if (!isRenewProcessData) {
            this.resetAuthDataService.resetAuthorizationData(configId);
        }
        hash = hash || this.doc.location.hash.substr(1);
        const authResult = hash.split('&').reduce((resultData, item) => {
            const parts = item.split('=');
            resultData[parts.shift()] = parts.join('=');
            return resultData;
        }, {});
        const callbackContext = {
            code: null,
            refreshToken: null,
            state: null,
            sessionState: null,
            authResult,
            isRenewProcess: isRenewProcessData,
            jwtKeys: null,
            validationResult: null,
            existingIdToken: null,
        };
        return of(callbackContext);
    }
}
ImplicitFlowCallbackHandlerService.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: ImplicitFlowCallbackHandlerService, deps: [{ token: ResetAuthDataService }, { token: LoggerService }, { token: FlowsDataService }, { token: DOCUMENT }], target: i0.ɵɵFactoryTarget.Injectable });
ImplicitFlowCallbackHandlerService.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: ImplicitFlowCallbackHandlerService });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: ImplicitFlowCallbackHandlerService, decorators: [{
            type: Injectable
        }], ctorParameters: function () {
        return [{ type: ResetAuthDataService }, { type: LoggerService }, { type: FlowsDataService }, { type: undefined, decorators: [{
                        type: Inject,
                        args: [DOCUMENT]
                    }] }];
    } });

/* eslint-disable no-shadow */
var ValidationResult;
(function (ValidationResult) {
    ValidationResult["NotSet"] = "NotSet";
    ValidationResult["StatesDoNotMatch"] = "StatesDoNotMatch";
    ValidationResult["SignatureFailed"] = "SignatureFailed";
    ValidationResult["IncorrectNonce"] = "IncorrectNonce";
    ValidationResult["RequiredPropertyMissing"] = "RequiredPropertyMissing";
    ValidationResult["MaxOffsetExpired"] = "MaxOffsetExpired";
    ValidationResult["IssDoesNotMatchIssuer"] = "IssDoesNotMatchIssuer";
    ValidationResult["NoAuthWellKnownEndPoints"] = "NoAuthWellKnownEndPoints";
    ValidationResult["IncorrectAud"] = "IncorrectAud";
    ValidationResult["IncorrectIdTokenClaimsAfterRefresh"] = "IncorrectIdTokenClaimsAfterRefresh";
    ValidationResult["IncorrectAzp"] = "IncorrectAzp";
    ValidationResult["TokenExpired"] = "TokenExpired";
    ValidationResult["IncorrectAtHash"] = "IncorrectAtHash";
    ValidationResult["Ok"] = "Ok";
    ValidationResult["LoginRequired"] = "LoginRequired";
    ValidationResult["SecureTokenServerError"] = "SecureTokenServerError";
})(ValidationResult || (ValidationResult = {}));

class SigninKeyDataService {
    constructor(storagePersistenceService, loggerService, dataService) {
        this.storagePersistenceService = storagePersistenceService;
        this.loggerService = loggerService;
        this.dataService = dataService;
    }
    getSigningKeys(configId) {
        const authWellKnownEndPoints = this.storagePersistenceService.read('authWellKnownEndPoints', configId);
        const jwksUri = authWellKnownEndPoints === null || authWellKnownEndPoints === void 0 ? void 0 : authWellKnownEndPoints.jwksUri;
        if (!jwksUri) {
            const error = `getSigningKeys: authWellKnownEndpoints.jwksUri is: '${jwksUri}'`;
            this.loggerService.logWarning(configId, error);
            return throwError(() => new Error(error));
        }
        this.loggerService.logDebug(configId, 'Getting signinkeys from ', jwksUri);
        return this.dataService.get(jwksUri, configId).pipe(retry(2), catchError((e) => this.handleErrorGetSigningKeys(e, configId)));
    }
    handleErrorGetSigningKeys(errorResponse, configId) {
        let errMsg = '';
        if (errorResponse instanceof HttpResponse) {
            const body = errorResponse.body || {};
            const err = JSON.stringify(body);
            const { status, statusText } = errorResponse;
            errMsg = `${status || ''} - ${statusText || ''} ${err || ''}`;
        }
        else {
            const { message } = errorResponse;
            errMsg = !!message ? message : `${errorResponse}`;
        }
        this.loggerService.logError(configId, errMsg);
        return throwError(() => new Error(errMsg));
    }
}
SigninKeyDataService.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: SigninKeyDataService, deps: [{ token: StoragePersistenceService }, { token: LoggerService }, { token: DataService }], target: i0.ɵɵFactoryTarget.Injectable });
SigninKeyDataService.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: SigninKeyDataService });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: SigninKeyDataService, decorators: [{
            type: Injectable
        }], ctorParameters: function () { return [{ type: StoragePersistenceService }, { type: LoggerService }, { type: DataService }]; } });

const JWT_KEYS = 'jwtKeys';
class HistoryJwtKeysCallbackHandlerService {
    constructor(loggerService, configurationProvider, authStateService, flowsDataService, signInKeyDataService, storagePersistenceService, resetAuthDataService) {
        this.loggerService = loggerService;
        this.configurationProvider = configurationProvider;
        this.authStateService = authStateService;
        this.flowsDataService = flowsDataService;
        this.signInKeyDataService = signInKeyDataService;
        this.storagePersistenceService = storagePersistenceService;
        this.resetAuthDataService = resetAuthDataService;
    }
    // STEP 3 Code Flow, STEP 2 Implicit Flow, STEP 3 Refresh Token
    callbackHistoryAndResetJwtKeys(callbackContext, configId) {
        this.storagePersistenceService.write('authnResult', callbackContext.authResult, configId);
        if (this.historyCleanUpTurnedOn(configId) && !callbackContext.isRenewProcess) {
            this.resetBrowserHistory();
        }
        else {
            this.loggerService.logDebug(configId, 'history clean up inactive');
        }
        if (callbackContext.authResult.error) {
            const errorMessage = `AuthCallback AuthResult came with error: ${callbackContext.authResult.error}`;
            this.loggerService.logDebug(configId, errorMessage);
            this.resetAuthDataService.resetAuthorizationData(configId);
            this.flowsDataService.setNonce('', configId);
            this.handleResultErrorFromCallback(callbackContext.authResult, callbackContext.isRenewProcess);
            return throwError(() => new Error(errorMessage));
        }
        this.loggerService.logDebug(configId, `AuthResult '${JSON.stringify(callbackContext.authResult, null, 2)}'.
      AuthCallback created, begin token validation`);
        return this.signInKeyDataService.getSigningKeys(configId).pipe(tap((jwtKeys) => this.storeSigningKeys(jwtKeys, configId)), catchError((err) => {
            // fallback: try to load jwtKeys from storage
            const storedJwtKeys = this.readSigningKeys(configId);
            if (!!storedJwtKeys) {
                this.loggerService.logWarning(configId, `Failed to retrieve signing keys, fallback to stored keys`);
                return of(storedJwtKeys);
            }
            return throwError(() => new Error(err));
        }), switchMap((jwtKeys) => {
            if (jwtKeys) {
                callbackContext.jwtKeys = jwtKeys;
                return of(callbackContext);
            }
            const errorMessage = `Failed to retrieve signing key`;
            this.loggerService.logWarning(configId, errorMessage);
            return throwError(() => new Error(errorMessage));
        }), catchError((err) => {
            const errorMessage = `Failed to retrieve signing key with error: ${err}`;
            this.loggerService.logWarning(configId, errorMessage);
            return throwError(() => new Error(errorMessage));
        }));
    }
    handleResultErrorFromCallback(result, isRenewProcess) {
        let validationResult = ValidationResult.SecureTokenServerError;
        if (result.error === 'login_required') {
            validationResult = ValidationResult.LoginRequired;
        }
        this.authStateService.updateAndPublishAuthState({
            isAuthenticated: false,
            validationResult,
            isRenewProcess,
        });
    }
    historyCleanUpTurnedOn(configId) {
        const { historyCleanupOff } = this.configurationProvider.getOpenIDConfiguration(configId);
        return !historyCleanupOff;
    }
    resetBrowserHistory() {
        window.history.replaceState({}, window.document.title, window.location.origin + window.location.pathname);
    }
    storeSigningKeys(jwtKeys, configId) {
        this.storagePersistenceService.write(JWT_KEYS, jwtKeys, configId);
    }
    readSigningKeys(configId) {
        return this.storagePersistenceService.read(JWT_KEYS, configId);
    }
}
HistoryJwtKeysCallbackHandlerService.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: HistoryJwtKeysCallbackHandlerService, deps: [{ token: LoggerService }, { token: ConfigurationProvider }, { token: AuthStateService }, { token: FlowsDataService }, { token: SigninKeyDataService }, { token: StoragePersistenceService }, { token: ResetAuthDataService }], target: i0.ɵɵFactoryTarget.Injectable });
HistoryJwtKeysCallbackHandlerService.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: HistoryJwtKeysCallbackHandlerService });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: HistoryJwtKeysCallbackHandlerService, decorators: [{
            type: Injectable
        }], ctorParameters: function () { return [{ type: LoggerService }, { type: ConfigurationProvider }, { type: AuthStateService }, { type: FlowsDataService }, { type: SigninKeyDataService }, { type: StoragePersistenceService }, { type: ResetAuthDataService }]; } });

class UserCallbackHandlerService {
    constructor(loggerService, configurationProvider, authStateService, flowsDataService, userService, resetAuthDataService) {
        this.loggerService = loggerService;
        this.configurationProvider = configurationProvider;
        this.authStateService = authStateService;
        this.flowsDataService = flowsDataService;
        this.userService = userService;
        this.resetAuthDataService = resetAuthDataService;
    }
    // STEP 5 userData
    callbackUser(callbackContext, configId) {
        const { isRenewProcess, validationResult, authResult, refreshToken } = callbackContext;
        const { autoUserInfo, renewUserInfoAfterTokenRenew } = this.configurationProvider.getOpenIDConfiguration(configId);
        if (!autoUserInfo) {
            if (!isRenewProcess || renewUserInfoAfterTokenRenew) {
                // userData is set to the id_token decoded, auto get user data set to false
                if (validationResult.decodedIdToken) {
                    this.userService.setUserDataToStore(validationResult.decodedIdToken, configId);
                }
            }
            if (!isRenewProcess && !refreshToken) {
                this.flowsDataService.setSessionState(authResult.session_state, configId);
            }
            this.publishAuthState(validationResult, isRenewProcess);
            return of(callbackContext);
        }
        return this.userService
            .getAndPersistUserDataInStore(configId, isRenewProcess, validationResult.idToken, validationResult.decodedIdToken)
            .pipe(switchMap((userData) => {
            if (!!userData) {
                if (!refreshToken) {
                    this.flowsDataService.setSessionState(authResult.session_state, configId);
                }
                this.publishAuthState(validationResult, isRenewProcess);
                return of(callbackContext);
            }
            else {
                this.resetAuthDataService.resetAuthorizationData(configId);
                this.publishUnauthenticatedState(validationResult, isRenewProcess);
                const errorMessage = `Called for userData but they were ${userData}`;
                this.loggerService.logWarning(configId, errorMessage);
                return throwError(() => new Error(errorMessage));
            }
        }), catchError((err) => {
            const errorMessage = `Failed to retrieve user info with error:  ${err}`;
            this.loggerService.logWarning(configId, errorMessage);
            return throwError(() => new Error(errorMessage));
        }));
    }
    publishAuthState(stateValidationResult, isRenewProcess) {
        this.authStateService.updateAndPublishAuthState({
            isAuthenticated: true,
            validationResult: stateValidationResult.state,
            isRenewProcess,
        });
    }
    publishUnauthenticatedState(stateValidationResult, isRenewProcess) {
        this.authStateService.updateAndPublishAuthState({
            isAuthenticated: false,
            validationResult: stateValidationResult.state,
            isRenewProcess,
        });
    }
}
UserCallbackHandlerService.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: UserCallbackHandlerService, deps: [{ token: LoggerService }, { token: ConfigurationProvider }, { token: AuthStateService }, { token: FlowsDataService }, { token: UserService }, { token: ResetAuthDataService }], target: i0.ɵɵFactoryTarget.Injectable });
UserCallbackHandlerService.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: UserCallbackHandlerService });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: UserCallbackHandlerService, decorators: [{
            type: Injectable
        }], ctorParameters: function () { return [{ type: LoggerService }, { type: ConfigurationProvider }, { type: AuthStateService }, { type: FlowsDataService }, { type: UserService }, { type: ResetAuthDataService }]; } });

class StateValidationResult {
    constructor(accessToken = '', idToken = '', authResponseIsValid = false, decodedIdToken = {}, state = ValidationResult.NotSet) {
        this.accessToken = accessToken;
        this.idToken = idToken;
        this.authResponseIsValid = authResponseIsValid;
        this.decodedIdToken = decodedIdToken;
        this.state = state;
    }
}

class EqualityService {
    isStringEqualOrNonOrderedArrayEqual(value1, value2) {
        if (this.isNullOrUndefined(value1)) {
            return false;
        }
        if (this.isNullOrUndefined(value2)) {
            return false;
        }
        if (this.oneValueIsStringAndTheOtherIsArray(value1, value2)) {
            return false;
        }
        if (this.bothValuesAreStrings(value1, value2)) {
            return value1 === value2;
        }
        if (this.bothValuesAreArrays(value1, value2)) {
            return this.arraysHaveEqualContent(value1, value2);
        }
        return false;
    }
    areEqual(value1, value2) {
        if (!value1 || !value2) {
            return false;
        }
        if (this.bothValuesAreArrays(value1, value2)) {
            return this.arraysStrictEqual(value1, value2);
        }
        if (this.bothValuesAreStrings(value1, value2)) {
            return value1 === value2;
        }
        if (this.bothValuesAreObjects(value1, value2)) {
            return JSON.stringify(value1).toLowerCase() === JSON.stringify(value2).toLowerCase();
        }
        if (this.oneValueIsStringAndTheOtherIsArray(value1, value2)) {
            if (Array.isArray(value1) && this.valueIsString(value2)) {
                return value1[0] === value2;
            }
            if (Array.isArray(value2) && this.valueIsString(value1)) {
                return value2[0] === value1;
            }
        }
        return false;
    }
    oneValueIsStringAndTheOtherIsArray(value1, value2) {
        return (Array.isArray(value1) && this.valueIsString(value2)) || (Array.isArray(value2) && this.valueIsString(value1));
    }
    bothValuesAreObjects(value1, value2) {
        return this.valueIsObject(value1) && this.valueIsObject(value2);
    }
    bothValuesAreStrings(value1, value2) {
        return this.valueIsString(value1) && this.valueIsString(value2);
    }
    bothValuesAreArrays(value1, value2) {
        return Array.isArray(value1) && Array.isArray(value2);
    }
    valueIsString(value) {
        return typeof value === 'string' || value instanceof String;
    }
    valueIsObject(value) {
        return typeof value === 'object';
    }
    arraysStrictEqual(arr1, arr2) {
        if (arr1.length !== arr2.length) {
            return false;
        }
        for (let i = arr1.length; i--;) {
            if (arr1[i] !== arr2[i]) {
                return false;
            }
        }
        return true;
    }
    arraysHaveEqualContent(arr1, arr2) {
        if (arr1.length !== arr2.length) {
            return false;
        }
        return arr1.some((v) => arr2.includes(v));
    }
    isNullOrUndefined(val) {
        return val === null || val === undefined;
    }
}
EqualityService.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: EqualityService, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
EqualityService.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: EqualityService });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: EqualityService, decorators: [{
            type: Injectable
        }] });

class StateValidationService {
    constructor(storagePersistenceService, tokenValidationService, tokenHelperService, loggerService, configurationProvider, equalityService, flowHelper) {
        this.storagePersistenceService = storagePersistenceService;
        this.tokenValidationService = tokenValidationService;
        this.tokenHelperService = tokenHelperService;
        this.loggerService = loggerService;
        this.configurationProvider = configurationProvider;
        this.equalityService = equalityService;
        this.flowHelper = flowHelper;
    }
    getValidatedStateResult(callbackContext, configId) {
        if (!callbackContext) {
            return new StateValidationResult('', '', false, {});
        }
        if (callbackContext.authResult.error) {
            return new StateValidationResult('', '', false, {});
        }
        return this.validateState(callbackContext, configId);
    }
    validateState(callbackContext, configId) {
        const toReturn = new StateValidationResult();
        const authStateControl = this.storagePersistenceService.read('authStateControl', configId);
        if (!this.tokenValidationService.validateStateFromHashCallback(callbackContext.authResult.state, authStateControl, configId)) {
            this.loggerService.logWarning(configId, 'authCallback incorrect state');
            toReturn.state = ValidationResult.StatesDoNotMatch;
            this.handleUnsuccessfulValidation(configId);
            return toReturn;
        }
        const isCurrentFlowImplicitFlowWithAccessToken = this.flowHelper.isCurrentFlowImplicitFlowWithAccessToken(configId);
        const isCurrentFlowCodeFlow = this.flowHelper.isCurrentFlowCodeFlow(configId);
        if (isCurrentFlowImplicitFlowWithAccessToken || isCurrentFlowCodeFlow) {
            toReturn.accessToken = callbackContext.authResult.access_token;
        }
        if (callbackContext.authResult.id_token) {
            const { clientId, issValidationOff, maxIdTokenIatOffsetAllowedInSeconds, disableIatOffsetValidation, ignoreNonceAfterRefresh } = this.configurationProvider.getOpenIDConfiguration(configId);
            toReturn.idToken = callbackContext.authResult.id_token;
            toReturn.decodedIdToken = this.tokenHelperService.getPayloadFromToken(toReturn.idToken, false, configId);
            if (!this.tokenValidationService.validateSignatureIdToken(toReturn.idToken, callbackContext.jwtKeys, configId)) {
                this.loggerService.logDebug(configId, 'authCallback Signature validation failed id_token');
                toReturn.state = ValidationResult.SignatureFailed;
                this.handleUnsuccessfulValidation(configId);
                return toReturn;
            }
            const authNonce = this.storagePersistenceService.read('authNonce', configId);
            if (!this.tokenValidationService.validateIdTokenNonce(toReturn.decodedIdToken, authNonce, ignoreNonceAfterRefresh, configId)) {
                this.loggerService.logWarning(configId, 'authCallback incorrect nonce, did you call the checkAuth() method multiple times?');
                toReturn.state = ValidationResult.IncorrectNonce;
                this.handleUnsuccessfulValidation(configId);
                return toReturn;
            }
            if (!this.tokenValidationService.validateRequiredIdToken(toReturn.decodedIdToken, configId)) {
                this.loggerService.logDebug(configId, 'authCallback Validation, one of the REQUIRED properties missing from id_token');
                toReturn.state = ValidationResult.RequiredPropertyMissing;
                this.handleUnsuccessfulValidation(configId);
                return toReturn;
            }
            if (!this.tokenValidationService.validateIdTokenIatMaxOffset(toReturn.decodedIdToken, maxIdTokenIatOffsetAllowedInSeconds, disableIatOffsetValidation, configId)) {
                this.loggerService.logWarning(configId, 'authCallback Validation, iat rejected id_token was issued too far away from the current time');
                toReturn.state = ValidationResult.MaxOffsetExpired;
                this.handleUnsuccessfulValidation(configId);
                return toReturn;
            }
            const authWellKnownEndPoints = this.storagePersistenceService.read('authWellKnownEndPoints', configId);
            if (authWellKnownEndPoints) {
                if (issValidationOff) {
                    this.loggerService.logDebug(configId, 'iss validation is turned off, this is not recommended!');
                }
                else if (!issValidationOff &&
                    !this.tokenValidationService.validateIdTokenIss(toReturn.decodedIdToken, authWellKnownEndPoints.issuer, configId)) {
                    this.loggerService.logWarning(configId, 'authCallback incorrect iss does not match authWellKnownEndpoints issuer');
                    toReturn.state = ValidationResult.IssDoesNotMatchIssuer;
                    this.handleUnsuccessfulValidation(configId);
                    return toReturn;
                }
            }
            else {
                this.loggerService.logWarning(configId, 'authWellKnownEndpoints is undefined');
                toReturn.state = ValidationResult.NoAuthWellKnownEndPoints;
                this.handleUnsuccessfulValidation(configId);
                return toReturn;
            }
            if (!this.tokenValidationService.validateIdTokenAud(toReturn.decodedIdToken, clientId, configId)) {
                this.loggerService.logWarning(configId, 'authCallback incorrect aud');
                toReturn.state = ValidationResult.IncorrectAud;
                this.handleUnsuccessfulValidation(configId);
                return toReturn;
            }
            if (!this.tokenValidationService.validateIdTokenAzpExistsIfMoreThanOneAud(toReturn.decodedIdToken)) {
                this.loggerService.logWarning(configId, 'authCallback missing azp');
                toReturn.state = ValidationResult.IncorrectAzp;
                this.handleUnsuccessfulValidation(configId);
                return toReturn;
            }
            if (!this.tokenValidationService.validateIdTokenAzpValid(toReturn.decodedIdToken, clientId)) {
                this.loggerService.logWarning(configId, 'authCallback incorrect azp');
                toReturn.state = ValidationResult.IncorrectAzp;
                this.handleUnsuccessfulValidation(configId);
                return toReturn;
            }
            if (!this.isIdTokenAfterRefreshTokenRequestValid(callbackContext, toReturn.decodedIdToken, configId)) {
                this.loggerService.logWarning(configId, 'authCallback pre, post id_token claims do not match in refresh');
                toReturn.state = ValidationResult.IncorrectIdTokenClaimsAfterRefresh;
                this.handleUnsuccessfulValidation(configId);
                return toReturn;
            }
            if (!this.tokenValidationService.validateIdTokenExpNotExpired(toReturn.decodedIdToken, configId)) {
                this.loggerService.logWarning(configId, 'authCallback id token expired');
                toReturn.state = ValidationResult.TokenExpired;
                this.handleUnsuccessfulValidation(configId);
                return toReturn;
            }
        }
        else {
            this.loggerService.logDebug(configId, 'No id_token found, skipping id_token validation');
        }
        // flow id_token
        if (!isCurrentFlowImplicitFlowWithAccessToken && !isCurrentFlowCodeFlow) {
            toReturn.authResponseIsValid = true;
            toReturn.state = ValidationResult.Ok;
            this.handleSuccessfulValidation(configId);
            this.handleUnsuccessfulValidation(configId);
            return toReturn;
        }
        // only do check if id_token returned, no always the case when using refresh tokens
        if (callbackContext.authResult.id_token) {
            const idTokenHeader = this.tokenHelperService.getHeaderFromToken(toReturn.idToken, false, configId);
            // The at_hash is optional for the code flow
            if (isCurrentFlowCodeFlow && !toReturn.decodedIdToken.at_hash) {
                this.loggerService.logDebug(configId, 'Code Flow active, and no at_hash in the id_token, skipping check!');
            }
            else if (!this.tokenValidationService.validateIdTokenAtHash(toReturn.accessToken, toReturn.decodedIdToken.at_hash, idTokenHeader.alg, // 'RSA256'
            configId) ||
                !toReturn.accessToken) {
                this.loggerService.logWarning(configId, 'authCallback incorrect at_hash');
                toReturn.state = ValidationResult.IncorrectAtHash;
                this.handleUnsuccessfulValidation(configId);
                return toReturn;
            }
        }
        toReturn.authResponseIsValid = true;
        toReturn.state = ValidationResult.Ok;
        this.handleSuccessfulValidation(configId);
        return toReturn;
    }
    isIdTokenAfterRefreshTokenRequestValid(callbackContext, newIdToken, configId) {
        const { useRefreshToken, disableRefreshIdTokenAuthTimeValidation } = this.configurationProvider.getOpenIDConfiguration(configId);
        if (!useRefreshToken) {
            return true;
        }
        if (!callbackContext.existingIdToken) {
            return true;
        }
        const decodedIdToken = this.tokenHelperService.getPayloadFromToken(callbackContext.existingIdToken, false, configId);
        // Upon successful validation of the Refresh Token, the response body is the Token Response of Section 3.1.3.3
        // except that it might not contain an id_token.
        // If an ID Token is returned as a result of a token refresh request, the following requirements apply:
        // its iss Claim Value MUST be the same as in the ID Token issued when the original authentication occurred,
        if (decodedIdToken.iss !== newIdToken.iss) {
            this.loggerService.logDebug(configId, `iss do not match: ${decodedIdToken.iss} ${newIdToken.iss}`);
            return false;
        }
        // its azp Claim Value MUST be the same as in the ID Token issued when the original authentication occurred;
        //   if no azp Claim was present in the original ID Token, one MUST NOT be present in the new ID Token, and
        // otherwise, the same rules apply as apply when issuing an ID Token at the time of the original authentication.
        if (decodedIdToken.azp !== newIdToken.azp) {
            this.loggerService.logDebug(configId, `azp do not match: ${decodedIdToken.azp} ${newIdToken.azp}`);
            return false;
        }
        // its sub Claim Value MUST be the same as in the ID Token issued when the original authentication occurred,
        if (decodedIdToken.sub !== newIdToken.sub) {
            this.loggerService.logDebug(configId, `sub do not match: ${decodedIdToken.sub} ${newIdToken.sub}`);
            return false;
        }
        // its aud Claim Value MUST be the same as in the ID Token issued when the original authentication occurred,
        if (!this.equalityService.isStringEqualOrNonOrderedArrayEqual(decodedIdToken === null || decodedIdToken === void 0 ? void 0 : decodedIdToken.aud, newIdToken === null || newIdToken === void 0 ? void 0 : newIdToken.aud)) {
            this.loggerService.logDebug(configId, `aud in new id_token is not valid: '${decodedIdToken === null || decodedIdToken === void 0 ? void 0 : decodedIdToken.aud}' '${newIdToken.aud}'`);
            return false;
        }
        if (disableRefreshIdTokenAuthTimeValidation) {
            return true;
        }
        // its iat Claim MUST represent the time that the new ID Token is issued,
        // if the ID Token contains an auth_time Claim, its value MUST represent the time of the original authentication
        // - not the time that the new ID token is issued,
        if (decodedIdToken.auth_time !== newIdToken.auth_time) {
            this.loggerService.logDebug(configId, `auth_time do not match: ${decodedIdToken.auth_time} ${newIdToken.auth_time}`);
            return false;
        }
        return true;
    }
    handleSuccessfulValidation(configId) {
        const { autoCleanStateAfterAuthentication } = this.configurationProvider.getOpenIDConfiguration(configId);
        this.storagePersistenceService.write('authNonce', null, configId);
        if (autoCleanStateAfterAuthentication) {
            this.storagePersistenceService.write('authStateControl', '', configId);
        }
        this.loggerService.logDebug(configId, 'authCallback token(s) validated, continue');
    }
    handleUnsuccessfulValidation(configId) {
        const { autoCleanStateAfterAuthentication } = this.configurationProvider.getOpenIDConfiguration(configId);
        this.storagePersistenceService.write('authNonce', null, configId);
        if (autoCleanStateAfterAuthentication) {
            this.storagePersistenceService.write('authStateControl', '', configId);
        }
        this.loggerService.logDebug(configId, 'authCallback token(s) invalid');
    }
}
StateValidationService.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: StateValidationService, deps: [{ token: StoragePersistenceService }, { token: TokenValidationService }, { token: TokenHelperService }, { token: LoggerService }, { token: ConfigurationProvider }, { token: EqualityService }, { token: FlowHelper }], target: i0.ɵɵFactoryTarget.Injectable });
StateValidationService.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: StateValidationService });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: StateValidationService, decorators: [{
            type: Injectable
        }], ctorParameters: function () { return [{ type: StoragePersistenceService }, { type: TokenValidationService }, { type: TokenHelperService }, { type: LoggerService }, { type: ConfigurationProvider }, { type: EqualityService }, { type: FlowHelper }]; } });

class StateValidationCallbackHandlerService {
    constructor(loggerService, stateValidationService, authStateService, resetAuthDataService, doc) {
        this.loggerService = loggerService;
        this.stateValidationService = stateValidationService;
        this.authStateService = authStateService;
        this.resetAuthDataService = resetAuthDataService;
        this.doc = doc;
    }
    // STEP 4 All flows
    callbackStateValidation(callbackContext, configId) {
        const validationResult = this.stateValidationService.getValidatedStateResult(callbackContext, configId);
        callbackContext.validationResult = validationResult;
        if (validationResult.authResponseIsValid) {
            this.authStateService.setAuthorizationData(validationResult.accessToken, callbackContext.authResult, configId);
            return of(callbackContext);
        }
        else {
            const errorMessage = `authorizedCallback, token(s) validation failed, resetting. Hash: ${this.doc.location.hash}`;
            this.loggerService.logWarning(configId, errorMessage);
            this.resetAuthDataService.resetAuthorizationData(configId);
            this.publishUnauthorizedState(callbackContext.validationResult, callbackContext.isRenewProcess);
            return throwError(() => new Error(errorMessage));
        }
    }
    publishUnauthorizedState(stateValidationResult, isRenewProcess) {
        this.authStateService.updateAndPublishAuthState({
            isAuthenticated: false,
            validationResult: stateValidationResult.state,
            isRenewProcess,
        });
    }
}
StateValidationCallbackHandlerService.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: StateValidationCallbackHandlerService, deps: [{ token: LoggerService }, { token: StateValidationService }, { token: AuthStateService }, { token: ResetAuthDataService }, { token: DOCUMENT }], target: i0.ɵɵFactoryTarget.Injectable });
StateValidationCallbackHandlerService.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: StateValidationCallbackHandlerService });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: StateValidationCallbackHandlerService, decorators: [{
            type: Injectable
        }], ctorParameters: function () {
        return [{ type: LoggerService }, { type: StateValidationService }, { type: AuthStateService }, { type: ResetAuthDataService }, { type: undefined, decorators: [{
                        type: Inject,
                        args: [DOCUMENT]
                    }] }];
    } });

class RefreshSessionCallbackHandlerService {
    constructor(loggerService, authStateService, flowsDataService) {
        this.loggerService = loggerService;
        this.authStateService = authStateService;
        this.flowsDataService = flowsDataService;
    }
    // STEP 1 Refresh session
    refreshSessionWithRefreshTokens(configId) {
        const stateData = this.flowsDataService.getExistingOrCreateAuthStateControl(configId);
        this.loggerService.logDebug(configId, 'RefreshSession created. Adding myautostate: ' + stateData);
        const refreshToken = this.authStateService.getRefreshToken(configId);
        const idToken = this.authStateService.getIdToken(configId);
        if (refreshToken) {
            const callbackContext = {
                code: null,
                refreshToken,
                state: stateData,
                sessionState: null,
                authResult: null,
                isRenewProcess: true,
                jwtKeys: null,
                validationResult: null,
                existingIdToken: idToken,
            };
            this.loggerService.logDebug(configId, 'found refresh code, obtaining new credentials with refresh code');
            // Nonce is not used with refresh tokens; but Key cloak may send it anyway
            this.flowsDataService.setNonce(TokenValidationService.refreshTokenNoncePlaceholder, configId);
            return of(callbackContext);
        }
        else {
            const errorMessage = 'no refresh token found, please login';
            this.loggerService.logError(configId, errorMessage);
            return throwError(() => new Error(errorMessage));
        }
    }
}
RefreshSessionCallbackHandlerService.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: RefreshSessionCallbackHandlerService, deps: [{ token: LoggerService }, { token: AuthStateService }, { token: FlowsDataService }], target: i0.ɵɵFactoryTarget.Injectable });
RefreshSessionCallbackHandlerService.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: RefreshSessionCallbackHandlerService });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: RefreshSessionCallbackHandlerService, decorators: [{
            type: Injectable
        }], ctorParameters: function () { return [{ type: LoggerService }, { type: AuthStateService }, { type: FlowsDataService }]; } });

class RefreshTokenCallbackHandlerService {
    constructor(urlService, loggerService, configurationProvider, dataService, storagePersistenceService) {
        this.urlService = urlService;
        this.loggerService = loggerService;
        this.configurationProvider = configurationProvider;
        this.dataService = dataService;
        this.storagePersistenceService = storagePersistenceService;
    }
    // STEP 2 Refresh Token
    refreshTokensRequestTokens(callbackContext, configId, customParamsRefresh) {
        let headers = new HttpHeaders();
        headers = headers.set('Content-Type', 'application/x-www-form-urlencoded');
        const authWellknownEndpoints = this.storagePersistenceService.read('authWellKnownEndPoints', configId);
        const tokenEndpoint = authWellknownEndpoints === null || authWellknownEndpoints === void 0 ? void 0 : authWellknownEndpoints.tokenEndpoint;
        if (!tokenEndpoint) {
            return throwError(() => new Error('Token Endpoint not defined'));
        }
        const data = this.urlService.createBodyForCodeFlowRefreshTokensRequest(callbackContext.refreshToken, configId, customParamsRefresh);
        return this.dataService.post(tokenEndpoint, data, configId, headers).pipe(switchMap((response) => {
            this.loggerService.logDebug(configId, 'token refresh response: ', response);
            let authResult = new Object();
            authResult = response;
            authResult.state = callbackContext.state;
            callbackContext.authResult = authResult;
            return of(callbackContext);
        }), retryWhen((error) => this.handleRefreshRetry(error, configId)), catchError((error) => {
            const { authority } = this.configurationProvider.getOpenIDConfiguration(configId);
            const errorMessage = `OidcService code request ${authority}`;
            this.loggerService.logError(configId, errorMessage, error);
            return throwError(() => new Error(errorMessage));
        }));
    }
    handleRefreshRetry(errors, configId) {
        return errors.pipe(mergeMap((error) => {
            // retry token refresh if there is no internet connection
            if (error && error instanceof HttpErrorResponse && error.error instanceof ProgressEvent && error.error.type === 'error') {
                const { authority, refreshTokenRetryInSeconds } = this.configurationProvider.getOpenIDConfiguration(configId);
                const errorMessage = `OidcService code request ${authority} - no internet connection`;
                this.loggerService.logWarning(configId, errorMessage, error);
                return timer(refreshTokenRetryInSeconds * 1000);
            }
            return throwError(() => new Error(error));
        }));
    }
}
RefreshTokenCallbackHandlerService.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: RefreshTokenCallbackHandlerService, deps: [{ token: UrlService }, { token: LoggerService }, { token: ConfigurationProvider }, { token: DataService }, { token: StoragePersistenceService }], target: i0.ɵɵFactoryTarget.Injectable });
RefreshTokenCallbackHandlerService.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: RefreshTokenCallbackHandlerService });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: RefreshTokenCallbackHandlerService, decorators: [{
            type: Injectable
        }], ctorParameters: function () { return [{ type: UrlService }, { type: LoggerService }, { type: ConfigurationProvider }, { type: DataService }, { type: StoragePersistenceService }]; } });

class FlowsService {
    constructor(codeFlowCallbackHandlerService, implicitFlowCallbackHandlerService, historyJwtKeysCallbackHandlerService, userHandlerService, stateValidationCallbackHandlerService, refreshSessionCallbackHandlerService, refreshTokenCallbackHandlerService) {
        this.codeFlowCallbackHandlerService = codeFlowCallbackHandlerService;
        this.implicitFlowCallbackHandlerService = implicitFlowCallbackHandlerService;
        this.historyJwtKeysCallbackHandlerService = historyJwtKeysCallbackHandlerService;
        this.userHandlerService = userHandlerService;
        this.stateValidationCallbackHandlerService = stateValidationCallbackHandlerService;
        this.refreshSessionCallbackHandlerService = refreshSessionCallbackHandlerService;
        this.refreshTokenCallbackHandlerService = refreshTokenCallbackHandlerService;
    }
    processCodeFlowCallback(urlToCheck, configId) {
        return this.codeFlowCallbackHandlerService.codeFlowCallback(urlToCheck, configId).pipe(concatMap((callbackContext) => this.codeFlowCallbackHandlerService.codeFlowCodeRequest(callbackContext, configId)), concatMap((callbackContext) => this.historyJwtKeysCallbackHandlerService.callbackHistoryAndResetJwtKeys(callbackContext, configId)), concatMap((callbackContext) => this.stateValidationCallbackHandlerService.callbackStateValidation(callbackContext, configId)), concatMap((callbackContext) => this.userHandlerService.callbackUser(callbackContext, configId)));
    }
    processSilentRenewCodeFlowCallback(firstContext, configId) {
        return this.codeFlowCallbackHandlerService.codeFlowCodeRequest(firstContext, configId).pipe(concatMap((callbackContext) => this.historyJwtKeysCallbackHandlerService.callbackHistoryAndResetJwtKeys(callbackContext, configId)), concatMap((callbackContext) => this.stateValidationCallbackHandlerService.callbackStateValidation(callbackContext, configId)), concatMap((callbackContext) => this.userHandlerService.callbackUser(callbackContext, configId)));
    }
    processImplicitFlowCallback(configId, hash) {
        return this.implicitFlowCallbackHandlerService.implicitFlowCallback(configId, hash).pipe(concatMap((callbackContext) => this.historyJwtKeysCallbackHandlerService.callbackHistoryAndResetJwtKeys(callbackContext, configId)), concatMap((callbackContext) => this.stateValidationCallbackHandlerService.callbackStateValidation(callbackContext, configId)), concatMap((callbackContext) => this.userHandlerService.callbackUser(callbackContext, configId)));
    }
    processRefreshToken(configId, customParamsRefresh) {
        return this.refreshSessionCallbackHandlerService.refreshSessionWithRefreshTokens(configId).pipe(concatMap((callbackContext) => this.refreshTokenCallbackHandlerService.refreshTokensRequestTokens(callbackContext, configId, customParamsRefresh)), concatMap((callbackContext) => this.historyJwtKeysCallbackHandlerService.callbackHistoryAndResetJwtKeys(callbackContext, configId)), concatMap((callbackContext) => this.stateValidationCallbackHandlerService.callbackStateValidation(callbackContext, configId)), concatMap((callbackContext) => this.userHandlerService.callbackUser(callbackContext, configId)));
    }
}
FlowsService.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: FlowsService, deps: [{ token: CodeFlowCallbackHandlerService }, { token: ImplicitFlowCallbackHandlerService }, { token: HistoryJwtKeysCallbackHandlerService }, { token: UserCallbackHandlerService }, { token: StateValidationCallbackHandlerService }, { token: RefreshSessionCallbackHandlerService }, { token: RefreshTokenCallbackHandlerService }], target: i0.ɵɵFactoryTarget.Injectable });
FlowsService.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: FlowsService });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: FlowsService, decorators: [{
            type: Injectable
        }], ctorParameters: function () { return [{ type: CodeFlowCallbackHandlerService }, { type: ImplicitFlowCallbackHandlerService }, { type: HistoryJwtKeysCallbackHandlerService }, { type: UserCallbackHandlerService }, { type: StateValidationCallbackHandlerService }, { type: RefreshSessionCallbackHandlerService }, { type: RefreshTokenCallbackHandlerService }]; } });

class IntervalService {
    constructor(zone) {
        this.zone = zone;
        this.runTokenValidationRunning = null;
    }
    stopPeriodicTokenCheck() {
        if (this.runTokenValidationRunning) {
            this.runTokenValidationRunning.unsubscribe();
            this.runTokenValidationRunning = null;
        }
    }
    startPeriodicTokenCheck(repeatAfterSeconds) {
        const millisecondsDelayBetweenTokenCheck = repeatAfterSeconds * 1000;
        return new Observable((subscriber) => {
            let intervalId;
            this.zone.runOutsideAngular(() => {
                intervalId = setInterval(() => this.zone.run(() => subscriber.next()), millisecondsDelayBetweenTokenCheck);
            });
            return () => {
                clearInterval(intervalId);
            };
        });
    }
}
IntervalService.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: IntervalService, deps: [{ token: i0.NgZone }], target: i0.ɵɵFactoryTarget.Injectable });
IntervalService.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: IntervalService, providedIn: 'root' });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: IntervalService, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }], ctorParameters: function () { return [{ type: i0.NgZone }]; } });

class ImplicitFlowCallbackService {
    constructor(flowsService, configurationProvider, router, flowsDataService, intervalService) {
        this.flowsService = flowsService;
        this.configurationProvider = configurationProvider;
        this.router = router;
        this.flowsDataService = flowsDataService;
        this.intervalService = intervalService;
    }
    authenticatedImplicitFlowCallback(configId, hash) {
        const isRenewProcess = this.flowsDataService.isSilentRenewRunning(configId);
        const { triggerAuthorizationResultEvent, postLoginRoute, unauthorizedRoute } = this.configurationProvider.getOpenIDConfiguration(configId);
        return this.flowsService.processImplicitFlowCallback(configId, hash).pipe(tap((callbackContext) => {
            if (!triggerAuthorizationResultEvent && !callbackContext.isRenewProcess) {
                this.router.navigateByUrl(postLoginRoute);
            }
        }), catchError((error) => {
            this.flowsDataService.resetSilentRenewRunning(configId);
            this.intervalService.stopPeriodicTokenCheck();
            if (!triggerAuthorizationResultEvent && !isRenewProcess) {
                this.router.navigateByUrl(unauthorizedRoute);
            }
            return throwError(() => new Error(error));
        }));
    }
}
ImplicitFlowCallbackService.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: ImplicitFlowCallbackService, deps: [{ token: FlowsService }, { token: ConfigurationProvider }, { token: i2.Router }, { token: FlowsDataService }, { token: IntervalService }], target: i0.ɵɵFactoryTarget.Injectable });
ImplicitFlowCallbackService.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: ImplicitFlowCallbackService, providedIn: 'root' });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: ImplicitFlowCallbackService, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }], ctorParameters: function () { return [{ type: FlowsService }, { type: ConfigurationProvider }, { type: i2.Router }, { type: FlowsDataService }, { type: IntervalService }]; } });

class IFrameService {
    constructor(doc, loggerService) {
        this.doc = doc;
        this.loggerService = loggerService;
    }
    getExistingIFrame(identifier) {
        const iFrameOnParent = this.getIFrameFromParentWindow(identifier);
        if (this.isIFrameElement(iFrameOnParent)) {
            return iFrameOnParent;
        }
        const iFrameOnSelf = this.getIFrameFromWindow(identifier);
        if (this.isIFrameElement(iFrameOnSelf)) {
            return iFrameOnSelf;
        }
        return null;
    }
    addIFrameToWindowBody(identifier, configId) {
        const sessionIframe = this.doc.createElement('iframe');
        sessionIframe.id = identifier;
        sessionIframe.title = identifier;
        this.loggerService.logDebug(configId, sessionIframe);
        sessionIframe.style.display = 'none';
        this.doc.body.appendChild(sessionIframe);
        return sessionIframe;
    }
    getIFrameFromParentWindow(identifier) {
        try {
            const iFrameElement = this.doc.defaultView.parent.document.getElementById(identifier);
            if (this.isIFrameElement(iFrameElement)) {
                return iFrameElement;
            }
            return null;
        }
        catch (e) {
            return null;
        }
    }
    getIFrameFromWindow(identifier) {
        const iFrameElement = this.doc.getElementById(identifier);
        if (this.isIFrameElement(iFrameElement)) {
            return iFrameElement;
        }
        return null;
    }
    isIFrameElement(element) {
        return !!element && element instanceof HTMLIFrameElement;
    }
}
IFrameService.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: IFrameService, deps: [{ token: DOCUMENT }, { token: LoggerService }], target: i0.ɵɵFactoryTarget.Injectable });
IFrameService.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: IFrameService });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: IFrameService, decorators: [{
            type: Injectable
        }], ctorParameters: function () {
        return [{ type: undefined, decorators: [{
                        type: Inject,
                        args: [DOCUMENT]
                    }] }, { type: LoggerService }];
    } });

const IFRAME_FOR_CHECK_SESSION_IDENTIFIER = 'myiFrameForCheckSession';
// http://openid.net/specs/openid-connect-session-1_0-ID4.html
class CheckSessionService {
    constructor(storagePersistenceService, loggerService, iFrameService, eventService, configurationProvider, zone) {
        this.storagePersistenceService = storagePersistenceService;
        this.loggerService = loggerService;
        this.iFrameService = iFrameService;
        this.eventService = eventService;
        this.configurationProvider = configurationProvider;
        this.zone = zone;
        this.checkSessionReceived = false;
        this.lastIFrameRefresh = 0;
        this.outstandingMessages = 0;
        this.heartBeatInterval = 3000;
        this.iframeRefreshInterval = 60000;
        this.checkSessionChangedInternal$ = new BehaviorSubject(false);
    }
    get checkSessionChanged$() {
        return this.checkSessionChangedInternal$.asObservable();
    }
    isCheckSessionConfigured(configId) {
        const { startCheckSession } = this.configurationProvider.getOpenIDConfiguration(configId);
        return startCheckSession;
    }
    start(configId) {
        if (!!this.scheduledHeartBeatRunning) {
            return;
        }
        const { clientId } = this.configurationProvider.getOpenIDConfiguration(configId);
        this.pollServerSession(clientId, configId);
    }
    stop() {
        if (!this.scheduledHeartBeatRunning) {
            return;
        }
        this.clearScheduledHeartBeat();
        this.checkSessionReceived = false;
    }
    serverStateChanged(configId) {
        const { startCheckSession } = this.configurationProvider.getOpenIDConfiguration(configId);
        return startCheckSession && this.checkSessionReceived;
    }
    getExistingIframe() {
        return this.iFrameService.getExistingIFrame(IFRAME_FOR_CHECK_SESSION_IDENTIFIER);
    }
    init(configId) {
        if (this.lastIFrameRefresh + this.iframeRefreshInterval > Date.now()) {
            return of(undefined);
        }
        const authWellKnownEndPoints = this.storagePersistenceService.read('authWellKnownEndPoints', configId);
        if (!authWellKnownEndPoints) {
            this.loggerService.logWarning(configId, 'CheckSession - init check session: authWellKnownEndpoints is undefined. Returning.');
            return of();
        }
        const existingIframe = this.getOrCreateIframe(configId);
        const checkSessionIframe = authWellKnownEndPoints.checkSessionIframe;
        if (checkSessionIframe) {
            existingIframe.contentWindow.location.replace(checkSessionIframe);
        }
        else {
            this.loggerService.logWarning(configId, 'CheckSession - init check session: checkSessionIframe is not configured to run');
        }
        return new Observable((observer) => {
            existingIframe.onload = () => {
                this.lastIFrameRefresh = Date.now();
                observer.next();
                observer.complete();
            };
        });
    }
    pollServerSession(clientId, configId) {
        this.outstandingMessages = 0;
        const pollServerSessionRecur = () => {
            this.init(configId)
                .pipe(take(1))
                .subscribe(() => {
                var _a;
                const existingIframe = this.getExistingIframe();
                if (existingIframe && clientId) {
                    this.loggerService.logDebug(configId, `CheckSession - clientId : '${clientId}' - existingIframe: '${existingIframe}'`);
                    const sessionState = this.storagePersistenceService.read('session_state', configId);
                    const authWellKnownEndPoints = this.storagePersistenceService.read('authWellKnownEndPoints', configId);
                    if (sessionState && (authWellKnownEndPoints === null || authWellKnownEndPoints === void 0 ? void 0 : authWellKnownEndPoints.checkSessionIframe)) {
                        const iframeOrigin = (_a = new URL(authWellKnownEndPoints.checkSessionIframe)) === null || _a === void 0 ? void 0 : _a.origin;
                        this.outstandingMessages++;
                        existingIframe.contentWindow.postMessage(clientId + ' ' + sessionState, iframeOrigin);
                    }
                    else {
                        this.loggerService.logDebug(configId, `CheckSession - session_state is '${sessionState}' - AuthWellKnownEndPoints is '${JSON.stringify(authWellKnownEndPoints, null, 2)}'`);
                        this.checkSessionChangedInternal$.next(true);
                    }
                }
                else {
                    this.loggerService.logWarning(configId, `CheckSession - OidcSecurityCheckSession pollServerSession checkSession IFrame does not exist:
               clientId : '${clientId}' - existingIframe: '${existingIframe}'`);
                }
                // after sending three messages with no response, fail.
                if (this.outstandingMessages > 3) {
                    this.loggerService.logError(configId, `CheckSession - OidcSecurityCheckSession not receiving check session response messages.
                            Outstanding messages: '${this.outstandingMessages}'. Server unreachable?`);
                }
                this.zone.runOutsideAngular(() => {
                    this.scheduledHeartBeatRunning = setTimeout(() => this.zone.run(pollServerSessionRecur), this.heartBeatInterval);
                });
            });
        };
        pollServerSessionRecur();
    }
    clearScheduledHeartBeat() {
        clearTimeout(this.scheduledHeartBeatRunning);
        this.scheduledHeartBeatRunning = null;
    }
    messageHandler(configId, e) {
        var _a;
        const existingIFrame = this.getExistingIframe();
        const authWellKnownEndPoints = this.storagePersistenceService.read('authWellKnownEndPoints', configId);
        const startsWith = !!((_a = authWellKnownEndPoints === null || authWellKnownEndPoints === void 0 ? void 0 : authWellKnownEndPoints.checkSessionIframe) === null || _a === void 0 ? void 0 : _a.startsWith(e.origin));
        this.outstandingMessages = 0;
        if (existingIFrame && startsWith && e.source === existingIFrame.contentWindow) {
            if (e.data === 'error') {
                this.loggerService.logWarning(configId, 'CheckSession - error from check session messageHandler');
            }
            else if (e.data === 'changed') {
                this.loggerService.logDebug(configId, `CheckSession - ${e} from check session messageHandler`);
                this.checkSessionReceived = true;
                this.eventService.fireEvent(EventTypes.CheckSessionReceived, e.data);
                this.checkSessionChangedInternal$.next(true);
            }
            else {
                this.eventService.fireEvent(EventTypes.CheckSessionReceived, e.data);
                this.loggerService.logDebug(configId, `CheckSession - ${e.data} from check session messageHandler`);
            }
        }
    }
    bindMessageEventToIframe(configId) {
        const iframeMessageEvent = this.messageHandler.bind(this, configId);
        window.addEventListener('message', iframeMessageEvent, false);
    }
    getOrCreateIframe(configId) {
        const existingIframe = this.getExistingIframe();
        if (!existingIframe) {
            const frame = this.iFrameService.addIFrameToWindowBody(IFRAME_FOR_CHECK_SESSION_IDENTIFIER, configId);
            this.bindMessageEventToIframe(configId);
            return frame;
        }
        return existingIframe;
    }
}
CheckSessionService.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: CheckSessionService, deps: [{ token: StoragePersistenceService }, { token: LoggerService }, { token: IFrameService }, { token: PublicEventsService }, { token: ConfigurationProvider }, { token: i0.NgZone }], target: i0.ɵɵFactoryTarget.Injectable });
CheckSessionService.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: CheckSessionService });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: CheckSessionService, decorators: [{
            type: Injectable
        }], ctorParameters: function () { return [{ type: StoragePersistenceService }, { type: LoggerService }, { type: IFrameService }, { type: PublicEventsService }, { type: ConfigurationProvider }, { type: i0.NgZone }]; } });

class CurrentUrlService {
    constructor(doc) {
        this.doc = doc;
    }
    getStateParamFromCurrentUrl() {
        const currentUrl = this.getCurrentUrl();
        const parsedUrl = new URL(currentUrl);
        const urlParams = new URLSearchParams(parsedUrl.search);
        const stateFromUrl = urlParams.get('state');
        return stateFromUrl;
    }
    currentUrlHasStateParam() {
        return !!this.getStateParamFromCurrentUrl();
    }
    getCurrentUrl() {
        return this.doc.defaultView.location.toString();
    }
}
CurrentUrlService.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: CurrentUrlService, deps: [{ token: DOCUMENT }], target: i0.ɵɵFactoryTarget.Injectable });
CurrentUrlService.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: CurrentUrlService });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: CurrentUrlService, decorators: [{
            type: Injectable
        }], ctorParameters: function () {
        return [{ type: undefined, decorators: [{
                        type: Inject,
                        args: [DOCUMENT]
                    }] }];
    } });

const IFRAME_FOR_SILENT_RENEW_IDENTIFIER = 'myiFrameForSilentRenew';
class SilentRenewService {
    constructor(configurationProvider, iFrameService, flowsService, resetAuthDataService, flowsDataService, authStateService, loggerService, flowHelper, implicitFlowCallbackService, intervalService) {
        this.configurationProvider = configurationProvider;
        this.iFrameService = iFrameService;
        this.flowsService = flowsService;
        this.resetAuthDataService = resetAuthDataService;
        this.flowsDataService = flowsDataService;
        this.authStateService = authStateService;
        this.loggerService = loggerService;
        this.flowHelper = flowHelper;
        this.implicitFlowCallbackService = implicitFlowCallbackService;
        this.intervalService = intervalService;
        this.refreshSessionWithIFrameCompletedInternal$ = new Subject();
    }
    get refreshSessionWithIFrameCompleted$() {
        return this.refreshSessionWithIFrameCompletedInternal$.asObservable();
    }
    getOrCreateIframe(configId) {
        const existingIframe = this.getExistingIframe();
        if (!existingIframe) {
            return this.iFrameService.addIFrameToWindowBody(IFRAME_FOR_SILENT_RENEW_IDENTIFIER, configId);
        }
        return existingIframe;
    }
    isSilentRenewConfigured(configId) {
        const { useRefreshToken, silentRenew } = this.configurationProvider.getOpenIDConfiguration(configId);
        return !useRefreshToken && silentRenew;
    }
    codeFlowCallbackSilentRenewIframe(urlParts, configId) {
        const params = new HttpParams({
            fromString: urlParts[1],
        });
        const error = params.get('error');
        if (error) {
            this.authStateService.updateAndPublishAuthState({
                isAuthenticated: false,
                validationResult: ValidationResult.LoginRequired,
                isRenewProcess: true,
            });
            this.resetAuthDataService.resetAuthorizationData(configId);
            this.flowsDataService.setNonce('', configId);
            this.intervalService.stopPeriodicTokenCheck();
            return throwError(() => new Error(error));
        }
        const code = params.get('code');
        const state = params.get('state');
        const sessionState = params.get('session_state');
        const callbackContext = {
            code,
            refreshToken: null,
            state,
            sessionState,
            authResult: null,
            isRenewProcess: true,
            jwtKeys: null,
            validationResult: null,
            existingIdToken: null,
        };
        return this.flowsService.processSilentRenewCodeFlowCallback(callbackContext, configId).pipe(catchError((errorFromFlow) => {
            this.intervalService.stopPeriodicTokenCheck();
            this.resetAuthDataService.resetAuthorizationData(configId);
            return throwError(() => new Error(error));
        }));
    }
    silentRenewEventHandler(e, configId) {
        this.loggerService.logDebug(configId, 'silentRenewEventHandler');
        if (!e.detail) {
            return;
        }
        let callback$ = of(null);
        const isCodeFlow = this.flowHelper.isCurrentFlowCodeFlow(configId);
        if (isCodeFlow) {
            const urlParts = e.detail.toString().split('?');
            callback$ = this.codeFlowCallbackSilentRenewIframe(urlParts, configId);
        }
        else {
            callback$ = this.implicitFlowCallbackService.authenticatedImplicitFlowCallback(configId, e.detail);
        }
        callback$.subscribe({
            next: (callbackContext) => {
                this.refreshSessionWithIFrameCompletedInternal$.next(callbackContext);
                this.flowsDataService.resetSilentRenewRunning(configId);
            },
            error: (err) => {
                this.loggerService.logError(configId, 'Error: ' + err);
                this.refreshSessionWithIFrameCompletedInternal$.next(null);
                this.flowsDataService.resetSilentRenewRunning(configId);
            },
        });
    }
    getExistingIframe() {
        return this.iFrameService.getExistingIFrame(IFRAME_FOR_SILENT_RENEW_IDENTIFIER);
    }
}
SilentRenewService.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: SilentRenewService, deps: [{ token: ConfigurationProvider }, { token: IFrameService }, { token: FlowsService }, { token: ResetAuthDataService }, { token: FlowsDataService }, { token: AuthStateService }, { token: LoggerService }, { token: FlowHelper }, { token: ImplicitFlowCallbackService }, { token: IntervalService }], target: i0.ɵɵFactoryTarget.Injectable });
SilentRenewService.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: SilentRenewService });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: SilentRenewService, decorators: [{
            type: Injectable
        }], ctorParameters: function () { return [{ type: ConfigurationProvider }, { type: IFrameService }, { type: FlowsService }, { type: ResetAuthDataService }, { type: FlowsDataService }, { type: AuthStateService }, { type: LoggerService }, { type: FlowHelper }, { type: ImplicitFlowCallbackService }, { type: IntervalService }]; } });

class CodeFlowCallbackService {
    constructor(flowsService, flowsDataService, intervalService, configurationProvider, router) {
        this.flowsService = flowsService;
        this.flowsDataService = flowsDataService;
        this.intervalService = intervalService;
        this.configurationProvider = configurationProvider;
        this.router = router;
    }
    authenticatedCallbackWithCode(urlToCheck, configId) {
        const isRenewProcess = this.flowsDataService.isSilentRenewRunning(configId);
        const { triggerAuthorizationResultEvent, postLoginRoute, unauthorizedRoute } = this.configurationProvider.getOpenIDConfiguration(configId);
        return this.flowsService.processCodeFlowCallback(urlToCheck, configId).pipe(tap((callbackContext) => {
            if (!triggerAuthorizationResultEvent && !callbackContext.isRenewProcess) {
                this.router.navigateByUrl(postLoginRoute);
            }
        }), catchError((error) => {
            this.flowsDataService.resetSilentRenewRunning(configId);
            this.intervalService.stopPeriodicTokenCheck();
            if (!triggerAuthorizationResultEvent && !isRenewProcess) {
                this.router.navigateByUrl(unauthorizedRoute);
            }
            return throwError(() => new Error(error));
        }));
    }
}
CodeFlowCallbackService.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: CodeFlowCallbackService, deps: [{ token: FlowsService }, { token: FlowsDataService }, { token: IntervalService }, { token: ConfigurationProvider }, { token: i2.Router }], target: i0.ɵɵFactoryTarget.Injectable });
CodeFlowCallbackService.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: CodeFlowCallbackService, providedIn: 'root' });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: CodeFlowCallbackService, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }], ctorParameters: function () { return [{ type: FlowsService }, { type: FlowsDataService }, { type: IntervalService }, { type: ConfigurationProvider }, { type: i2.Router }]; } });

class CallbackService {
    constructor(urlService, flowHelper, implicitFlowCallbackService, codeFlowCallbackService) {
        this.urlService = urlService;
        this.flowHelper = flowHelper;
        this.implicitFlowCallbackService = implicitFlowCallbackService;
        this.codeFlowCallbackService = codeFlowCallbackService;
        this.stsCallbackInternal$ = new Subject();
    }
    get stsCallback$() {
        return this.stsCallbackInternal$.asObservable();
    }
    isCallback(currentUrl) {
        return this.urlService.isCallbackFromSts(currentUrl);
    }
    handleCallbackAndFireEvents(currentCallbackUrl, configId) {
        let callback$;
        if (this.flowHelper.isCurrentFlowCodeFlow(configId)) {
            callback$ = this.codeFlowCallbackService.authenticatedCallbackWithCode(currentCallbackUrl, configId);
        }
        else if (this.flowHelper.isCurrentFlowAnyImplicitFlow(configId)) {
            callback$ = this.implicitFlowCallbackService.authenticatedImplicitFlowCallback(configId);
        }
        return callback$.pipe(tap(() => this.stsCallbackInternal$.next()));
    }
}
CallbackService.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: CallbackService, deps: [{ token: UrlService }, { token: FlowHelper }, { token: ImplicitFlowCallbackService }, { token: CodeFlowCallbackService }], target: i0.ɵɵFactoryTarget.Injectable });
CallbackService.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: CallbackService, providedIn: 'root' });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: CallbackService, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }], ctorParameters: function () { return [{ type: UrlService }, { type: FlowHelper }, { type: ImplicitFlowCallbackService }, { type: CodeFlowCallbackService }]; } });

const WELL_KNOWN_SUFFIX = `/.well-known/openid-configuration`;
class AuthWellKnownDataService {
    constructor(http) {
        this.http = http;
    }
    getWellKnownEndPointsFromUrl(authWellknownEndpoint, configId) {
        return this.getWellKnownDocument(authWellknownEndpoint, configId).pipe(map((wellKnownEndpoints) => ({
            issuer: wellKnownEndpoints.issuer,
            jwksUri: wellKnownEndpoints.jwks_uri,
            authorizationEndpoint: wellKnownEndpoints.authorization_endpoint,
            tokenEndpoint: wellKnownEndpoints.token_endpoint,
            userInfoEndpoint: wellKnownEndpoints.userinfo_endpoint,
            endSessionEndpoint: wellKnownEndpoints.end_session_endpoint,
            checkSessionIframe: wellKnownEndpoints.check_session_iframe,
            revocationEndpoint: wellKnownEndpoints.revocation_endpoint,
            introspectionEndpoint: wellKnownEndpoints.introspection_endpoint,
            parEndpoint: wellKnownEndpoints.pushed_authorization_request_endpoint,
        })));
    }
    getWellKnownDocument(wellKnownEndpoint, configId) {
        let url = wellKnownEndpoint;
        if (!wellKnownEndpoint.includes(WELL_KNOWN_SUFFIX)) {
            url = `${wellKnownEndpoint}${WELL_KNOWN_SUFFIX}`;
        }
        return this.http.get(url, configId).pipe(retry(2));
    }
}
AuthWellKnownDataService.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: AuthWellKnownDataService, deps: [{ token: DataService }], target: i0.ɵɵFactoryTarget.Injectable });
AuthWellKnownDataService.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: AuthWellKnownDataService });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: AuthWellKnownDataService, decorators: [{
            type: Injectable
        }], ctorParameters: function () { return [{ type: DataService }]; } });

class AuthWellKnownService {
    constructor(publicEventsService, dataService, storagePersistenceService) {
        this.publicEventsService = publicEventsService;
        this.dataService = dataService;
        this.storagePersistenceService = storagePersistenceService;
    }
    getAuthWellKnownEndPoints(authWellknownEndpointUrl, configId) {
        const alreadySavedWellKnownEndpoints = this.storagePersistenceService.read('authWellKnownEndPoints', configId);
        if (!!alreadySavedWellKnownEndpoints) {
            return of(alreadySavedWellKnownEndpoints);
        }
        return this.getWellKnownEndPointsFromUrl(authWellknownEndpointUrl, configId).pipe(tap((mappedWellKnownEndpoints) => this.storeWellKnownEndpoints(configId, mappedWellKnownEndpoints)), catchError((error) => {
            this.publicEventsService.fireEvent(EventTypes.ConfigLoadingFailed, null);
            return throwError(() => new Error(error));
        }));
    }
    storeWellKnownEndpoints(configId, mappedWellKnownEndpoints) {
        this.storagePersistenceService.write('authWellKnownEndPoints', mappedWellKnownEndpoints, configId);
    }
    getWellKnownEndPointsFromUrl(authWellknownEndpointUrl, configId) {
        return this.dataService.getWellKnownEndPointsFromUrl(authWellknownEndpointUrl, configId);
    }
}
AuthWellKnownService.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: AuthWellKnownService, deps: [{ token: PublicEventsService }, { token: AuthWellKnownDataService }, { token: StoragePersistenceService }], target: i0.ɵɵFactoryTarget.Injectable });
AuthWellKnownService.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: AuthWellKnownService });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: AuthWellKnownService, decorators: [{
            type: Injectable
        }], ctorParameters: function () { return [{ type: PublicEventsService }, { type: AuthWellKnownDataService }, { type: StoragePersistenceService }]; } });

class RefreshSessionIframeService {
    constructor(doc, loggerService, urlService, silentRenewService, rendererFactory) {
        this.doc = doc;
        this.loggerService = loggerService;
        this.urlService = urlService;
        this.silentRenewService = silentRenewService;
        this.renderer = rendererFactory.createRenderer(null, null);
    }
    refreshSessionWithIframe(configId, customParams) {
        this.loggerService.logDebug(configId, 'BEGIN refresh session Authorize Iframe renew');
        const url = this.urlService.getRefreshSessionSilentRenewUrl(configId, customParams);
        return this.sendAuthorizeRequestUsingSilentRenew(url, configId);
    }
    sendAuthorizeRequestUsingSilentRenew(url, configId) {
        const sessionIframe = this.silentRenewService.getOrCreateIframe(configId);
        this.initSilentRenewRequest(configId);
        this.loggerService.logDebug(configId, 'sendAuthorizeRequestUsingSilentRenew for URL:' + url);
        return new Observable((observer) => {
            const onLoadHandler = () => {
                sessionIframe.removeEventListener('load', onLoadHandler);
                this.loggerService.logDebug(configId, 'removed event listener from IFrame');
                observer.next(true);
                observer.complete();
            };
            sessionIframe.addEventListener('load', onLoadHandler);
            sessionIframe.contentWindow.location.replace(url);
        });
    }
    initSilentRenewRequest(configId) {
        const instanceId = Math.random();
        const initDestroyHandler = this.renderer.listen('window', 'oidc-silent-renew-init', (e) => {
            if (e.detail !== instanceId) {
                initDestroyHandler();
                renewDestroyHandler();
            }
        });
        const renewDestroyHandler = this.renderer.listen('window', 'oidc-silent-renew-message', (e) => this.silentRenewService.silentRenewEventHandler(e, configId));
        this.doc.defaultView.dispatchEvent(new CustomEvent('oidc-silent-renew-init', {
            detail: instanceId,
        }));
    }
}
RefreshSessionIframeService.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: RefreshSessionIframeService, deps: [{ token: DOCUMENT }, { token: LoggerService }, { token: UrlService }, { token: SilentRenewService }, { token: i0.RendererFactory2 }], target: i0.ɵɵFactoryTarget.Injectable });
RefreshSessionIframeService.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: RefreshSessionIframeService, providedIn: 'root' });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: RefreshSessionIframeService, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }], ctorParameters: function () {
        return [{ type: undefined, decorators: [{
                        type: Inject,
                        args: [DOCUMENT]
                    }] }, { type: LoggerService }, { type: UrlService }, { type: SilentRenewService }, { type: i0.RendererFactory2 }];
    } });

class RefreshSessionRefreshTokenService {
    constructor(loggerService, resetAuthDataService, flowsService, intervalService) {
        this.loggerService = loggerService;
        this.resetAuthDataService = resetAuthDataService;
        this.flowsService = flowsService;
        this.intervalService = intervalService;
    }
    refreshSessionWithRefreshTokens(configId, customParamsRefresh) {
        this.loggerService.logDebug(configId, 'BEGIN refresh session Authorize');
        return this.flowsService.processRefreshToken(configId, customParamsRefresh).pipe(catchError((error) => {
            this.intervalService.stopPeriodicTokenCheck();
            this.resetAuthDataService.resetAuthorizationData(configId);
            return throwError(() => new Error(error));
        }));
    }
}
RefreshSessionRefreshTokenService.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: RefreshSessionRefreshTokenService, deps: [{ token: LoggerService }, { token: ResetAuthDataService }, { token: FlowsService }, { token: IntervalService }], target: i0.ɵɵFactoryTarget.Injectable });
RefreshSessionRefreshTokenService.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: RefreshSessionRefreshTokenService, providedIn: 'root' });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: RefreshSessionRefreshTokenService, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }], ctorParameters: function () { return [{ type: LoggerService }, { type: ResetAuthDataService }, { type: FlowsService }, { type: IntervalService }]; } });

const MAX_RETRY_ATTEMPTS = 3;
class RefreshSessionService {
    constructor(flowHelper, configurationProvider, flowsDataService, loggerService, silentRenewService, authStateService, authWellKnownService, refreshSessionIframeService, storagePersistenceService, refreshSessionRefreshTokenService, userService) {
        this.flowHelper = flowHelper;
        this.configurationProvider = configurationProvider;
        this.flowsDataService = flowsDataService;
        this.loggerService = loggerService;
        this.silentRenewService = silentRenewService;
        this.authStateService = authStateService;
        this.authWellKnownService = authWellKnownService;
        this.refreshSessionIframeService = refreshSessionIframeService;
        this.storagePersistenceService = storagePersistenceService;
        this.refreshSessionRefreshTokenService = refreshSessionRefreshTokenService;
        this.userService = userService;
    }
    userForceRefreshSession(configId, extraCustomParams) {
        this.persistCustomParams(extraCustomParams, configId);
        return this.forceRefreshSession(configId, extraCustomParams);
    }
    forceRefreshSession(configId, extraCustomParams) {
        const { customParamsRefreshTokenRequest } = this.configurationProvider.getOpenIDConfiguration();
        const mergedParams = Object.assign(Object.assign({}, customParamsRefreshTokenRequest), extraCustomParams);
        if (this.flowHelper.isCurrentFlowCodeFlowWithRefreshTokens(configId)) {
            return this.startRefreshSession(configId, mergedParams).pipe(map(() => {
                const isAuthenticated = this.authStateService.areAuthStorageTokensValid(configId);
                if (isAuthenticated) {
                    return {
                        idToken: this.authStateService.getIdToken(configId),
                        accessToken: this.authStateService.getAccessToken(configId),
                        userData: this.userService.getUserDataFromStore(configId),
                        isAuthenticated,
                        configId,
                    };
                }
                return null;
            }));
        }
        const { silentRenewTimeoutInSeconds } = this.configurationProvider.getOpenIDConfiguration(configId);
        const timeOutTime = silentRenewTimeoutInSeconds * 1000;
        return forkJoin([
            this.startRefreshSession(configId, extraCustomParams),
            this.silentRenewService.refreshSessionWithIFrameCompleted$.pipe(take(1)),
        ]).pipe(timeout(timeOutTime), retryWhen(this.timeoutRetryStrategy.bind(this)), map(([_, callbackContext]) => {
            var _a, _b;
            const isAuthenticated = this.authStateService.areAuthStorageTokensValid(configId);
            if (isAuthenticated) {
                return {
                    idToken: (_a = callbackContext === null || callbackContext === void 0 ? void 0 : callbackContext.authResult) === null || _a === void 0 ? void 0 : _a.id_token,
                    accessToken: (_b = callbackContext === null || callbackContext === void 0 ? void 0 : callbackContext.authResult) === null || _b === void 0 ? void 0 : _b.access_token,
                    userData: this.userService.getUserDataFromStore(configId),
                    isAuthenticated,
                    configId,
                };
            }
            return null;
        }));
    }
    persistCustomParams(extraCustomParams, configId) {
        const { useRefreshToken } = this.configurationProvider.getOpenIDConfiguration();
        if (extraCustomParams) {
            if (useRefreshToken) {
                this.storagePersistenceService.write('storageCustomParamsRefresh', extraCustomParams, configId);
            }
            else {
                this.storagePersistenceService.write('storageCustomParamsAuthRequest', extraCustomParams, configId);
            }
        }
    }
    startRefreshSession(configId, extraCustomParams) {
        const isSilentRenewRunning = this.flowsDataService.isSilentRenewRunning(configId);
        this.loggerService.logDebug(configId, `Checking: silentRenewRunning: ${isSilentRenewRunning}`);
        const shouldBeExecuted = !isSilentRenewRunning;
        if (!shouldBeExecuted) {
            return of(null);
        }
        const { authWellknownEndpointUrl } = this.configurationProvider.getOpenIDConfiguration(configId) || {};
        if (!authWellknownEndpointUrl) {
            this.loggerService.logError(configId, 'no authWellKnownEndpoint given!');
            return of(null);
        }
        return this.authWellKnownService.getAuthWellKnownEndPoints(authWellknownEndpointUrl, configId).pipe(switchMap(() => {
            this.flowsDataService.setSilentRenewRunning(configId);
            if (this.flowHelper.isCurrentFlowCodeFlowWithRefreshTokens(configId)) {
                // Refresh Session using Refresh tokens
                return this.refreshSessionRefreshTokenService.refreshSessionWithRefreshTokens(configId, extraCustomParams);
            }
            return this.refreshSessionIframeService.refreshSessionWithIframe(configId, extraCustomParams);
        }));
    }
    timeoutRetryStrategy(errorAttempts, configId) {
        return errorAttempts.pipe(mergeMap((error, index) => {
            const scalingDuration = 1000;
            const currentAttempt = index + 1;
            if (!(error instanceof TimeoutError) || currentAttempt > MAX_RETRY_ATTEMPTS) {
                return throwError(() => new Error(error));
            }
            this.loggerService.logDebug(configId, `forceRefreshSession timeout. Attempt #${currentAttempt}`);
            this.flowsDataService.resetSilentRenewRunning(configId);
            return timer(currentAttempt * scalingDuration);
        }));
    }
}
RefreshSessionService.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: RefreshSessionService, deps: [{ token: FlowHelper }, { token: ConfigurationProvider }, { token: FlowsDataService }, { token: LoggerService }, { token: SilentRenewService }, { token: AuthStateService }, { token: AuthWellKnownService }, { token: RefreshSessionIframeService }, { token: StoragePersistenceService }, { token: RefreshSessionRefreshTokenService }, { token: UserService }], target: i0.ɵɵFactoryTarget.Injectable });
RefreshSessionService.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: RefreshSessionService, providedIn: 'root' });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: RefreshSessionService, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }], ctorParameters: function () { return [{ type: FlowHelper }, { type: ConfigurationProvider }, { type: FlowsDataService }, { type: LoggerService }, { type: SilentRenewService }, { type: AuthStateService }, { type: AuthWellKnownService }, { type: RefreshSessionIframeService }, { type: StoragePersistenceService }, { type: RefreshSessionRefreshTokenService }, { type: UserService }]; } });

class PeriodicallyTokenCheckService {
    constructor(resetAuthDataService, flowHelper, configurationProvider, flowsDataService, loggerService, userService, authStateService, refreshSessionIframeService, refreshSessionRefreshTokenService, intervalService, storagePersistenceService, publicEventsService) {
        this.resetAuthDataService = resetAuthDataService;
        this.flowHelper = flowHelper;
        this.configurationProvider = configurationProvider;
        this.flowsDataService = flowsDataService;
        this.loggerService = loggerService;
        this.userService = userService;
        this.authStateService = authStateService;
        this.refreshSessionIframeService = refreshSessionIframeService;
        this.refreshSessionRefreshTokenService = refreshSessionRefreshTokenService;
        this.intervalService = intervalService;
        this.storagePersistenceService = storagePersistenceService;
        this.publicEventsService = publicEventsService;
    }
    startTokenValidationPeriodically() {
        const configsWithSilentRenewEnabled = this.getConfigsWithSilentRenewEnabled();
        if (configsWithSilentRenewEnabled.length <= 0) {
            return;
        }
        const refreshTimeInSeconds = this.getSmallestRefreshTimeFromConfigs(configsWithSilentRenewEnabled);
        if (!!this.intervalService.runTokenValidationRunning) {
            return;
        }
        // START PERIODICALLY CHECK ONCE AND CHECK EACH CONFIG WHICH HAS IT ENABLED
        const periodicallyCheck$ = this.intervalService.startPeriodicTokenCheck(refreshTimeInSeconds).pipe(switchMap(() => {
            const objectWithConfigIdsAndRefreshEvent = {};
            configsWithSilentRenewEnabled.forEach(({ configId }) => {
                objectWithConfigIdsAndRefreshEvent[configId] = this.getRefreshEvent(configId);
            });
            return forkJoin(objectWithConfigIdsAndRefreshEvent);
        }));
        this.intervalService.runTokenValidationRunning = periodicallyCheck$.subscribe((objectWithConfigIds) => {
            for (const [key, _] of Object.entries(objectWithConfigIds)) {
                this.loggerService.logDebug(key, 'silent renew, periodic check finished!');
                if (this.flowHelper.isCurrentFlowCodeFlowWithRefreshTokens(key)) {
                    this.flowsDataService.resetSilentRenewRunning(key);
                }
            }
        });
    }
    getRefreshEvent(configId) {
        const shouldStartRefreshEvent = this.shouldStartPeriodicallyCheckForConfig(configId);
        if (!shouldStartRefreshEvent) {
            return of(null);
        }
        const refreshEvent$ = this.createRefreshEventForConfig(configId);
        this.publicEventsService.fireEvent(EventTypes.SilentRenewStarted);
        const refreshEventWithErrorHandler$ = refreshEvent$.pipe(catchError((error) => {
            this.loggerService.logError(configId, 'silent renew failed!', error);
            this.flowsDataService.resetSilentRenewRunning(configId);
            return throwError(() => new Error(error));
        }));
        return refreshEventWithErrorHandler$;
    }
    getSmallestRefreshTimeFromConfigs(configsWithSilentRenewEnabled) {
        const result = configsWithSilentRenewEnabled.reduce((prev, curr) => prev.tokenRefreshInSeconds < curr.tokenRefreshInSeconds ? prev : curr);
        return result.tokenRefreshInSeconds;
    }
    getConfigsWithSilentRenewEnabled() {
        return this.configurationProvider.getAllConfigurations().filter((x) => x.silentRenew);
    }
    createRefreshEventForConfig(configId) {
        this.loggerService.logDebug(configId, 'starting silent renew...');
        const config = this.configurationProvider.getOpenIDConfiguration(configId);
        if (!(config === null || config === void 0 ? void 0 : config.silentRenew)) {
            this.resetAuthDataService.resetAuthorizationData(configId);
            return of(null);
        }
        this.flowsDataService.setSilentRenewRunning(configId);
        if (this.flowHelper.isCurrentFlowCodeFlowWithRefreshTokens(configId)) {
            // Retrieve Dynamically Set Custom Params for refresh body
            const customParamsRefresh = this.storagePersistenceService.read('storageCustomParamsRefresh', configId) || {};
            const { customParamsRefreshTokenRequest } = this.configurationProvider.getOpenIDConfiguration(configId);
            const mergedParams = Object.assign(Object.assign({}, customParamsRefreshTokenRequest), customParamsRefresh);
            // Refresh Session using Refresh tokens
            return this.refreshSessionRefreshTokenService.refreshSessionWithRefreshTokens(configId, mergedParams);
        }
        // Retrieve Dynamically Set Custom Params
        const customParams = this.storagePersistenceService.read('storageCustomParamsAuthRequest', configId);
        return this.refreshSessionIframeService.refreshSessionWithIframe(configId, customParams);
    }
    shouldStartPeriodicallyCheckForConfig(configId) {
        const idToken = this.authStateService.getIdToken(configId);
        const isSilentRenewRunning = this.flowsDataService.isSilentRenewRunning(configId);
        const userDataFromStore = this.userService.getUserDataFromStore(configId);
        this.loggerService.logDebug(configId, `Checking: silentRenewRunning: ${isSilentRenewRunning} - has idToken: ${!!idToken} - has userData: ${!!userDataFromStore}`);
        const shouldBeExecuted = !!userDataFromStore && !isSilentRenewRunning && !!idToken;
        if (!shouldBeExecuted) {
            return false;
        }
        const idTokenStillValid = this.authStateService.hasIdTokenExpiredAndRenewCheckIsEnabled(configId);
        const accessTokenHasExpired = this.authStateService.hasAccessTokenExpiredIfExpiryExists(configId);
        if (!idTokenStillValid && !accessTokenHasExpired) {
            return false;
        }
        return true;
    }
}
PeriodicallyTokenCheckService.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: PeriodicallyTokenCheckService, deps: [{ token: ResetAuthDataService }, { token: FlowHelper }, { token: ConfigurationProvider }, { token: FlowsDataService }, { token: LoggerService }, { token: UserService }, { token: AuthStateService }, { token: RefreshSessionIframeService }, { token: RefreshSessionRefreshTokenService }, { token: IntervalService }, { token: StoragePersistenceService }, { token: PublicEventsService }], target: i0.ɵɵFactoryTarget.Injectable });
PeriodicallyTokenCheckService.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: PeriodicallyTokenCheckService, providedIn: 'root' });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: PeriodicallyTokenCheckService, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }], ctorParameters: function () { return [{ type: ResetAuthDataService }, { type: FlowHelper }, { type: ConfigurationProvider }, { type: FlowsDataService }, { type: LoggerService }, { type: UserService }, { type: AuthStateService }, { type: RefreshSessionIframeService }, { type: RefreshSessionRefreshTokenService }, { type: IntervalService }, { type: StoragePersistenceService }, { type: PublicEventsService }]; } });

class PopUpService {
    constructor() {
        this.STORAGE_IDENTIFIER = 'popupauth';
        this.resultInternal$ = new Subject();
    }
    get result$() {
        return this.resultInternal$.asObservable();
    }
    isCurrentlyInPopup() {
        if (this.canAccessSessionStorage()) {
            const popup = sessionStorage.getItem(this.STORAGE_IDENTIFIER);
            return !!window.opener && window.opener !== window && !!popup;
        }
        return false;
    }
    openPopUp(url, popupOptions) {
        const optionsToPass = this.getOptions(popupOptions);
        this.popUp = window.open(url, '_blank', optionsToPass);
        this.popUp.sessionStorage.setItem(this.STORAGE_IDENTIFIER, 'true');
        const listener = (event) => {
            if (!(event === null || event === void 0 ? void 0 : event.data) || typeof event.data !== 'string') {
                return;
            }
            this.resultInternal$.next({ userClosed: false, receivedUrl: event.data });
            this.cleanUp(listener);
        };
        window.addEventListener('message', listener, false);
        this.handle = window.setInterval(() => {
            if (this.popUp.closed) {
                this.resultInternal$.next({ userClosed: true });
                this.cleanUp(listener);
            }
        }, 200);
    }
    sendMessageToMainWindow(url) {
        if (window.opener) {
            this.sendMessage(url, window.location.href);
        }
    }
    cleanUp(listener) {
        var _a;
        window.removeEventListener('message', listener, false);
        window.clearInterval(this.handle);
        if (this.popUp) {
            (_a = this.popUp.sessionStorage) === null || _a === void 0 ? void 0 : _a.removeItem(this.STORAGE_IDENTIFIER);
            this.popUp.close();
            this.popUp = null;
        }
    }
    sendMessage(url, href) {
        window.opener.postMessage(url, href);
    }
    getOptions(popupOptions) {
        const popupDefaultOptions = { width: 500, height: 500, left: 50, top: 50 };
        const options = Object.assign(Object.assign({}, popupDefaultOptions), (popupOptions || {}));
        const left = window.screenLeft + (window.outerWidth - options.width) / 2;
        const top = window.screenTop + (window.outerHeight - options.height) / 2;
        options.left = left;
        options.top = top;
        return Object.entries(options)
            .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
            .join(',');
    }
    canAccessSessionStorage() {
        return typeof navigator !== 'undefined' && navigator.cookieEnabled && typeof Storage !== 'undefined';
    }
}
PopUpService.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: PopUpService, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
PopUpService.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: PopUpService, providedIn: 'root' });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: PopUpService, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }] });

class CheckAuthService {
    constructor(checkSessionService, currentUrlService, silentRenewService, userService, loggerService, configurationProvider, authStateService, callbackService, refreshSessionService, periodicallyTokenCheckService, popupService, autoLoginService, storagePersistenceService) {
        this.checkSessionService = checkSessionService;
        this.currentUrlService = currentUrlService;
        this.silentRenewService = silentRenewService;
        this.userService = userService;
        this.loggerService = loggerService;
        this.configurationProvider = configurationProvider;
        this.authStateService = authStateService;
        this.callbackService = callbackService;
        this.refreshSessionService = refreshSessionService;
        this.periodicallyTokenCheckService = periodicallyTokenCheckService;
        this.popupService = popupService;
        this.autoLoginService = autoLoginService;
        this.storagePersistenceService = storagePersistenceService;
    }
    checkAuth(passedConfigId, url) {
        if (this.currentUrlService.currentUrlHasStateParam()) {
            const stateParamFromUrl = this.currentUrlService.getStateParamFromCurrentUrl();
            const config = this.getConfigurationWithUrlState(stateParamFromUrl);
            if (!config) {
                return throwError(() => new Error(`could not find matching config for state ${stateParamFromUrl}`));
            }
            return this.checkAuthWithConfig(config, url);
        }
        if (!!passedConfigId) {
            const config = this.configurationProvider.getOpenIDConfiguration(passedConfigId);
            return this.checkAuthWithConfig(config, url);
        }
        const onlyExistingConfig = this.configurationProvider.getOpenIDConfiguration();
        return this.checkAuthWithConfig(onlyExistingConfig, url);
    }
    checkAuthMultiple(passedConfigId, url) {
        if (this.currentUrlService.currentUrlHasStateParam()) {
            const stateParamFromUrl = this.currentUrlService.getStateParamFromCurrentUrl();
            const config = this.getConfigurationWithUrlState(stateParamFromUrl);
            if (!config) {
                return throwError(() => new Error(`could not find matching config for state ${stateParamFromUrl}`));
            }
            return this.composeMultipleLoginResults(config, url);
        }
        if (!!passedConfigId) {
            const config = this.configurationProvider.getOpenIDConfiguration(passedConfigId);
            if (!config) {
                return throwError(() => new Error(`could not find matching config for id ${passedConfigId}`));
            }
            return this.composeMultipleLoginResults(config, url);
        }
        const allConfigs = this.configurationProvider.getAllConfigurations();
        const allChecks$ = allConfigs.map((x) => this.checkAuthWithConfig(x, url));
        return forkJoin(allChecks$);
    }
    checkAuthIncludingServer(configId) {
        const config = this.configurationProvider.getOpenIDConfiguration(configId);
        return this.checkAuthWithConfig(config).pipe(switchMap((loginResponse) => {
            const { isAuthenticated } = loginResponse;
            if (isAuthenticated) {
                return of(loginResponse);
            }
            return this.refreshSessionService.forceRefreshSession(configId).pipe(tap((loginResponseAfterRefreshSession) => {
                if (loginResponseAfterRefreshSession === null || loginResponseAfterRefreshSession === void 0 ? void 0 : loginResponseAfterRefreshSession.isAuthenticated) {
                    this.startCheckSessionAndValidation(configId);
                }
            }));
        }));
    }
    checkAuthWithConfig(config, url) {
        const { configId, authority } = config;
        if (!this.configurationProvider.hasAtLeastOneConfig()) {
            const errorMessage = 'Please provide at least one configuration before setting up the module';
            this.loggerService.logError(configId, errorMessage);
            return of({ isAuthenticated: false, errorMessage, userData: null, idToken: null, accessToken: null, configId });
        }
        const currentUrl = url || this.currentUrlService.getCurrentUrl();
        this.loggerService.logDebug(configId, `Working with config '${configId}' using ${authority}`);
        if (this.popupService.isCurrentlyInPopup()) {
            this.popupService.sendMessageToMainWindow(currentUrl);
            return of(null);
        }
        const isCallback = this.callbackService.isCallback(currentUrl);
        this.loggerService.logDebug(configId, 'currentUrl to check auth with: ', currentUrl);
        const callback$ = isCallback ? this.callbackService.handleCallbackAndFireEvents(currentUrl, configId) : of(null);
        return callback$.pipe(map(() => {
            const isAuthenticated = this.authStateService.areAuthStorageTokensValid(configId);
            if (isAuthenticated) {
                this.startCheckSessionAndValidation(configId);
                if (!isCallback) {
                    this.authStateService.setAuthenticatedAndFireEvent();
                    this.userService.publishUserDataIfExists(configId);
                }
            }
            this.loggerService.logDebug(configId, 'checkAuth completed - firing events now. isAuthenticated: ' + isAuthenticated);
            return {
                isAuthenticated,
                userData: this.userService.getUserDataFromStore(configId),
                accessToken: this.authStateService.getAccessToken(configId),
                idToken: this.authStateService.getIdToken(configId),
                configId,
            };
        }), tap(({ isAuthenticated }) => {
            if (isAuthenticated) {
                this.autoLoginService.checkSavedRedirectRouteAndNavigate(configId);
            }
        }), catchError(({ message }) => {
            this.loggerService.logError(configId, message);
            return of({ isAuthenticated: false, errorMessage: message, userData: null, idToken: null, accessToken: null, configId });
        }));
    }
    startCheckSessionAndValidation(configId) {
        if (this.checkSessionService.isCheckSessionConfigured(configId)) {
            this.checkSessionService.start(configId);
        }
        this.periodicallyTokenCheckService.startTokenValidationPeriodically();
        if (this.silentRenewService.isSilentRenewConfigured(configId)) {
            this.silentRenewService.getOrCreateIframe(configId);
        }
    }
    getConfigurationWithUrlState(stateFromUrl) {
        const allConfigs = this.configurationProvider.getAllConfigurations();
        for (const config of allConfigs) {
            const storedState = this.storagePersistenceService.read('authStateControl', config.configId);
            if (storedState === stateFromUrl) {
                return config;
            }
        }
        return null;
    }
    composeMultipleLoginResults(activeConfig, url) {
        const allOtherConfigs = this.configurationProvider.getAllConfigurations().filter((x) => x.configId !== activeConfig.configId);
        const currentConfigResult = this.checkAuthWithConfig(activeConfig, url);
        const allOtherConfigResults = allOtherConfigs.map((config) => {
            const { redirectUrl } = config;
            return this.checkAuthWithConfig(config, redirectUrl);
        });
        return forkJoin([currentConfigResult, ...allOtherConfigResults]);
    }
}
CheckAuthService.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: CheckAuthService, deps: [{ token: CheckSessionService }, { token: CurrentUrlService }, { token: SilentRenewService }, { token: UserService }, { token: LoggerService }, { token: ConfigurationProvider }, { token: AuthStateService }, { token: CallbackService }, { token: RefreshSessionService }, { token: PeriodicallyTokenCheckService }, { token: PopUpService }, { token: AutoLoginService }, { token: StoragePersistenceService }], target: i0.ɵɵFactoryTarget.Injectable });
CheckAuthService.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: CheckAuthService });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: CheckAuthService, decorators: [{
            type: Injectable
        }], ctorParameters: function () { return [{ type: CheckSessionService }, { type: CurrentUrlService }, { type: SilentRenewService }, { type: UserService }, { type: LoggerService }, { type: ConfigurationProvider }, { type: AuthStateService }, { type: CallbackService }, { type: RefreshSessionService }, { type: PeriodicallyTokenCheckService }, { type: PopUpService }, { type: AutoLoginService }, { type: StoragePersistenceService }]; } });

const DEFAULT_CONFIG = {
    authority: 'https://please_set',
    authWellknownEndpointUrl: '',
    authWellknownEndpoints: null,
    redirectUrl: 'https://please_set',
    clientId: 'please_set',
    responseType: 'code',
    scope: 'openid email profile',
    hdParam: '',
    postLogoutRedirectUri: 'https://please_set',
    startCheckSession: false,
    silentRenew: false,
    silentRenewUrl: 'https://please_set',
    silentRenewTimeoutInSeconds: 20,
    renewTimeBeforeTokenExpiresInSeconds: 0,
    useRefreshToken: false,
    usePushedAuthorisationRequests: false,
    ignoreNonceAfterRefresh: false,
    postLoginRoute: '/',
    forbiddenRoute: '/forbidden',
    unauthorizedRoute: '/unauthorized',
    autoUserInfo: true,
    autoCleanStateAfterAuthentication: true,
    triggerAuthorizationResultEvent: false,
    logLevel: LogLevel.Warn,
    issValidationOff: false,
    historyCleanupOff: false,
    maxIdTokenIatOffsetAllowedInSeconds: 120,
    disableIatOffsetValidation: false,
    storage: null,
    customParamsAuthRequest: {},
    customParamsRefreshTokenRequest: {},
    customParamsEndSessionRequest: {},
    customParamsCodeRequest: {},
    eagerLoadAuthWellKnownEndpoints: true,
    disableRefreshIdTokenAuthTimeValidation: false,
    enableIdTokenExpiredValidationInRenew: true,
    tokenRefreshInSeconds: 4,
    refreshTokenRetryInSeconds: 3,
    ngswBypass: false,
};

const POSITIVE_VALIDATION_RESULT = {
    result: true,
    messages: [],
    level: null,
};

const ensureAuthority = (passedConfig) => {
    if (!passedConfig.authority) {
        return {
            result: false,
            messages: ['The authority URL MUST be provided in the configuration! '],
            level: 'error',
        };
    }
    return POSITIVE_VALIDATION_RESULT;
};

const ensureClientId = (passedConfig) => {
    if (!passedConfig.clientId) {
        return {
            result: false,
            messages: ['The clientId is required and missing from your config!'],
            level: 'error',
        };
    }
    return POSITIVE_VALIDATION_RESULT;
};

const createIdentifierToCheck = (passedConfig) => {
    if (!passedConfig) {
        return null;
    }
    const { authority, clientId, scope } = passedConfig;
    return `${authority}${clientId}${scope}`;
};
const arrayHasDuplicates = (array) => new Set(array).size !== array.length;
const ensureNoDuplicatedConfigsRule = (passedConfigs) => {
    const allIdentifiers = passedConfigs.map((x) => createIdentifierToCheck(x));
    const someAreNull = allIdentifiers.some((x) => x === null);
    if (someAreNull) {
        return {
            result: false,
            messages: [`Please make sure you add an object with a 'config' property: ....({ config }) instead of ...(config)`],
            level: 'error',
        };
    }
    const hasDuplicates = arrayHasDuplicates(allIdentifiers);
    if (hasDuplicates) {
        return {
            result: false,
            messages: ['You added multiple configs with the same authority, clientId and scope'],
            level: 'warning',
        };
    }
    return POSITIVE_VALIDATION_RESULT;
};

const ensureRedirectRule = (passedConfig) => {
    if (!passedConfig.redirectUrl) {
        return {
            result: false,
            messages: ['The redirectUrl is required and missing from your config'],
            level: 'error',
        };
    }
    return POSITIVE_VALIDATION_RESULT;
};

const ensureSilentRenewUrlWhenNoRefreshTokenUsed = (passedConfig) => {
    const usesSilentRenew = passedConfig.silentRenew;
    const usesRefreshToken = passedConfig.useRefreshToken;
    const hasSilentRenewUrl = passedConfig.silentRenewUrl;
    if (usesSilentRenew && !usesRefreshToken && !hasSilentRenewUrl) {
        return {
            result: false,
            messages: ['Please provide a silent renew URL if using renew and not refresh tokens'],
            level: 'error',
        };
    }
    return POSITIVE_VALIDATION_RESULT;
};

const useOfflineScopeWithSilentRenew = (passedConfig) => {
    const hasRefreshToken = passedConfig.useRefreshToken;
    const hasSilentRenew = passedConfig.silentRenew;
    const scope = passedConfig.scope || '';
    const hasOfflineScope = scope.split(' ').includes('offline_access');
    if (hasRefreshToken && hasSilentRenew && !hasOfflineScope) {
        return {
            result: false,
            messages: ['When using silent renew and refresh tokens please set the `offline_access` scope'],
            level: 'warning',
        };
    }
    return POSITIVE_VALIDATION_RESULT;
};

const allRules = [
    ensureAuthority,
    useOfflineScopeWithSilentRenew,
    ensureRedirectRule,
    ensureClientId,
    ensureSilentRenewUrlWhenNoRefreshTokenUsed,
];
const allMultipleConfigRules = [ensureNoDuplicatedConfigsRule];

class ConfigValidationService {
    constructor(loggerService) {
        this.loggerService = loggerService;
    }
    validateConfigs(passedConfigs) {
        return this.validateConfigsInternal(passedConfigs, allMultipleConfigRules);
    }
    validateConfig(passedConfig) {
        return this.validateConfigInternal(passedConfig, allRules);
    }
    validateConfigsInternal(passedConfigs, allRulesToUse) {
        const allValidationResults = allRulesToUse.map((rule) => rule(passedConfigs));
        let overallErrorCount = 0;
        passedConfigs.forEach((passedConfig) => {
            const errorCount = this.processValidationResultsAndGetErrorCount(allValidationResults, passedConfig === null || passedConfig === void 0 ? void 0 : passedConfig.configId);
            overallErrorCount += errorCount;
        });
        return overallErrorCount === 0;
    }
    validateConfigInternal(passedConfig, allRulesToUse) {
        const allValidationResults = allRulesToUse.map((rule) => rule(passedConfig));
        const errorCount = this.processValidationResultsAndGetErrorCount(allValidationResults, passedConfig.configId);
        return errorCount === 0;
    }
    processValidationResultsAndGetErrorCount(allValidationResults, configId) {
        const allMessages = allValidationResults.filter((x) => x.messages.length > 0);
        const allErrorMessages = this.getAllMessagesOfType('error', allMessages);
        const allWarnings = this.getAllMessagesOfType('warning', allMessages);
        allErrorMessages.forEach((message) => this.loggerService.logError(configId, message));
        allWarnings.forEach((message) => this.loggerService.logWarning(configId, message));
        return allErrorMessages.length;
    }
    getAllMessagesOfType(type, results) {
        const allMessages = results.filter((x) => x.level === type).map((result) => result.messages);
        return allMessages.reduce((acc, val) => acc.concat(val), []);
    }
}
ConfigValidationService.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: ConfigValidationService, deps: [{ token: LoggerService }], target: i0.ɵɵFactoryTarget.Injectable });
ConfigValidationService.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: ConfigValidationService });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: ConfigValidationService, decorators: [{
            type: Injectable
        }], ctorParameters: function () { return [{ type: LoggerService }]; } });

class PlatformProvider {
    constructor(platformId) {
        this.platformId = platformId;
    }
    get isBrowser() {
        return isPlatformBrowser(this.platformId);
    }
}
PlatformProvider.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: PlatformProvider, deps: [{ token: PLATFORM_ID }], target: i0.ɵɵFactoryTarget.Injectable });
PlatformProvider.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: PlatformProvider });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: PlatformProvider, decorators: [{
            type: Injectable
        }], ctorParameters: function () {
        return [{ type: undefined, decorators: [{
                        type: Inject,
                        args: [PLATFORM_ID]
                    }] }];
    } });

class DefaultSessionStorageService {
    read(key) {
        return sessionStorage.getItem(key);
    }
    write(key, value) {
        sessionStorage.setItem(key, value);
    }
    remove(key) {
        sessionStorage.removeItem(key);
    }
    clear() {
        sessionStorage.clear();
    }
}
DefaultSessionStorageService.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: DefaultSessionStorageService, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
DefaultSessionStorageService.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: DefaultSessionStorageService });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: DefaultSessionStorageService, decorators: [{
            type: Injectable
        }] });

class OidcConfigService {
    constructor(loggerService, publicEventsService, configurationProvider, authWellKnownService, storagePersistenceService, configValidationService, platformProvider, defaultSessionStorageService) {
        this.loggerService = loggerService;
        this.publicEventsService = publicEventsService;
        this.configurationProvider = configurationProvider;
        this.authWellKnownService = authWellKnownService;
        this.storagePersistenceService = storagePersistenceService;
        this.configValidationService = configValidationService;
        this.platformProvider = platformProvider;
        this.defaultSessionStorageService = defaultSessionStorageService;
    }
    withConfigs(passedConfigs) {
        if (!this.configValidationService.validateConfigs(passedConfigs)) {
            return of(null);
        }
        this.createUniqueIds(passedConfigs);
        const allHandleConfigs$ = passedConfigs.map((x) => this.handleConfig(x));
        return forkJoin(allHandleConfigs$);
    }
    createUniqueIds(passedConfigs) {
        passedConfigs.forEach((config, index) => {
            if (!config.configId) {
                config.configId = `${index}-${config.clientId}`;
            }
        });
    }
    handleConfig(passedConfig) {
        if (!this.configValidationService.validateConfig(passedConfig)) {
            this.loggerService.logError(passedConfig.configId, 'Validation of config rejected with errors. Config is NOT set.');
            return of(null);
        }
        if (!passedConfig.authWellknownEndpointUrl) {
            passedConfig.authWellknownEndpointUrl = passedConfig.authority;
        }
        const usedConfig = this.prepareConfig(passedConfig);
        this.configurationProvider.setConfig(usedConfig);
        const alreadyExistingAuthWellKnownEndpoints = this.storagePersistenceService.read('authWellKnownEndPoints', usedConfig.configId);
        if (!!alreadyExistingAuthWellKnownEndpoints) {
            usedConfig.authWellknownEndpoints = alreadyExistingAuthWellKnownEndpoints;
            this.publicEventsService.fireEvent(EventTypes.ConfigLoaded, usedConfig);
            return of(usedConfig);
        }
        const passedAuthWellKnownEndpoints = usedConfig.authWellknownEndpoints;
        if (!!passedAuthWellKnownEndpoints) {
            this.authWellKnownService.storeWellKnownEndpoints(usedConfig.configId, passedAuthWellKnownEndpoints);
            usedConfig.authWellknownEndpoints = passedAuthWellKnownEndpoints;
            this.publicEventsService.fireEvent(EventTypes.ConfigLoaded, usedConfig);
            return of(usedConfig);
        }
        if (usedConfig.eagerLoadAuthWellKnownEndpoints) {
            return this.authWellKnownService.getAuthWellKnownEndPoints(usedConfig.authWellknownEndpointUrl, usedConfig.configId).pipe(catchError((error) => {
                this.loggerService.logError(usedConfig.configId, 'Getting auth well known endpoints failed on start', error);
                return throwError(() => new Error(error));
            }), tap((wellknownEndPoints) => {
                usedConfig.authWellknownEndpoints = wellknownEndPoints;
                this.publicEventsService.fireEvent(EventTypes.ConfigLoaded, usedConfig);
            }), switchMap(() => of(usedConfig)));
        }
        else {
            this.publicEventsService.fireEvent(EventTypes.ConfigLoaded, usedConfig);
            return of(usedConfig);
        }
    }
    prepareConfig(configuration) {
        const openIdConfigurationInternal = Object.assign(Object.assign({}, DEFAULT_CONFIG), configuration);
        this.setSpecialCases(openIdConfigurationInternal);
        this.setStorage(openIdConfigurationInternal);
        return openIdConfigurationInternal;
    }
    setSpecialCases(currentConfig) {
        if (!this.platformProvider.isBrowser) {
            currentConfig.startCheckSession = false;
            currentConfig.silentRenew = false;
            currentConfig.useRefreshToken = false;
            currentConfig.usePushedAuthorisationRequests = false;
        }
    }
    setStorage(currentConfig) {
        if (currentConfig.storage) {
            return;
        }
        if (this.hasBrowserStorage()) {
            currentConfig.storage = this.defaultSessionStorageService;
        }
        else {
            currentConfig.storage = null;
        }
    }
    hasBrowserStorage() {
        return typeof navigator !== 'undefined' && navigator.cookieEnabled && typeof Storage !== 'undefined';
    }
}
OidcConfigService.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: OidcConfigService, deps: [{ token: LoggerService }, { token: PublicEventsService }, { token: ConfigurationProvider }, { token: AuthWellKnownService }, { token: StoragePersistenceService }, { token: ConfigValidationService }, { token: PlatformProvider }, { token: DefaultSessionStorageService }], target: i0.ɵɵFactoryTarget.Injectable });
OidcConfigService.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: OidcConfigService });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: OidcConfigService, decorators: [{
            type: Injectable
        }], ctorParameters: function () { return [{ type: LoggerService }, { type: PublicEventsService }, { type: ConfigurationProvider }, { type: AuthWellKnownService }, { type: StoragePersistenceService }, { type: ConfigValidationService }, { type: PlatformProvider }, { type: DefaultSessionStorageService }]; } });

class OpenIdConfigLoader {
}
class StsConfigLoader {
}
class StsConfigStaticLoader {
    constructor(passedConfigs) {
        this.passedConfigs = passedConfigs;
    }
    loadConfigs() {
        if (Array.isArray(this.passedConfigs)) {
            return this.passedConfigs.map((x) => of(x));
        }
        const singleStaticConfig$ = of(this.passedConfigs);
        return [singleStaticConfig$];
    }
}
class StsConfigHttpLoader {
    constructor(configs$) {
        this.configs$ = configs$;
    }
    loadConfigs() {
        return Array.isArray(this.configs$) ? this.configs$ : [this.configs$];
    }
}

class ClosestMatchingRouteService {
    constructor(configProvider) {
        this.configProvider = configProvider;
    }
    getConfigIdForClosestMatchingRoute(route) {
        const allConfiguredRoutes = this.getAllConfiguredRoutes();
        for (const routesWithConfig of allConfiguredRoutes) {
            const allRoutesForConfig = routesWithConfig.routes;
            for (const configuredRoute of allRoutesForConfig) {
                if (route.startsWith(configuredRoute)) {
                    return {
                        matchingRoute: configuredRoute,
                        matchingConfigId: routesWithConfig.configId,
                    };
                }
            }
        }
        return {
            matchingRoute: null,
            matchingConfigId: null,
        };
    }
    getAllConfiguredRoutes() {
        const allConfigurations = this.configProvider.getAllConfigurations();
        return allConfigurations.map((x) => ({ routes: x.secureRoutes, configId: x.configId }));
    }
}
ClosestMatchingRouteService.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: ClosestMatchingRouteService, deps: [{ token: ConfigurationProvider }], target: i0.ɵɵFactoryTarget.Injectable });
ClosestMatchingRouteService.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: ClosestMatchingRouteService });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: ClosestMatchingRouteService, decorators: [{
            type: Injectable
        }], ctorParameters: function () { return [{ type: ConfigurationProvider }]; } });

class ResponseTypeValidationService {
    constructor(loggerService, flowHelper) {
        this.loggerService = loggerService;
        this.flowHelper = flowHelper;
    }
    hasConfigValidResponseType(configId) {
        if (this.flowHelper.isCurrentFlowAnyImplicitFlow(configId)) {
            return true;
        }
        if (this.flowHelper.isCurrentFlowCodeFlow(configId)) {
            return true;
        }
        this.loggerService.logWarning(configId, 'module configured incorrectly, invalid response_type. Check the responseType in the config');
        return false;
    }
}
ResponseTypeValidationService.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: ResponseTypeValidationService, deps: [{ token: LoggerService }, { token: FlowHelper }], target: i0.ɵɵFactoryTarget.Injectable });
ResponseTypeValidationService.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: ResponseTypeValidationService });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: ResponseTypeValidationService, decorators: [{
            type: Injectable
        }], ctorParameters: function () { return [{ type: LoggerService }, { type: FlowHelper }]; } });

class RedirectService {
    constructor(doc) {
        this.doc = doc;
    }
    redirectTo(url) {
        this.doc.location.href = url;
    }
}
RedirectService.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: RedirectService, deps: [{ token: DOCUMENT }], target: i0.ɵɵFactoryTarget.Injectable });
RedirectService.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: RedirectService, providedIn: 'root' });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: RedirectService, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }], ctorParameters: function () {
        return [{ type: undefined, decorators: [{
                        type: Inject,
                        args: [DOCUMENT]
                    }] }];
    } });

class ParService {
    constructor(loggerService, urlService, dataService, storagePersistenceService) {
        this.loggerService = loggerService;
        this.urlService = urlService;
        this.dataService = dataService;
        this.storagePersistenceService = storagePersistenceService;
    }
    postParRequest(configId, customParams) {
        let headers = new HttpHeaders();
        headers = headers.set('Content-Type', 'application/x-www-form-urlencoded');
        const authWellknownEndpoints = this.storagePersistenceService.read('authWellKnownEndPoints', configId);
        if (!authWellknownEndpoints) {
            return throwError(() => new Error('Could not read PAR endpoint because authWellKnownEndPoints are not given'));
        }
        const parEndpoint = authWellknownEndpoints.parEndpoint;
        if (!parEndpoint) {
            return throwError(() => new Error('Could not read PAR endpoint from authWellKnownEndpoints'));
        }
        const data = this.urlService.createBodyForParCodeFlowRequest(configId, customParams);
        return this.dataService.post(parEndpoint, data, configId, headers).pipe(retry(2), map((response) => {
            this.loggerService.logDebug(configId, 'par response: ', response);
            return {
                expiresIn: response.expires_in,
                requestUri: response.request_uri,
            };
        }), catchError((error) => {
            const errorMessage = `There was an error on ParService postParRequest`;
            this.loggerService.logError(configId, errorMessage, error);
            return throwError(() => new Error(errorMessage));
        }));
    }
}
ParService.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: ParService, deps: [{ token: LoggerService }, { token: UrlService }, { token: DataService }, { token: StoragePersistenceService }], target: i0.ɵɵFactoryTarget.Injectable });
ParService.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: ParService });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: ParService, decorators: [{
            type: Injectable
        }], ctorParameters: function () { return [{ type: LoggerService }, { type: UrlService }, { type: DataService }, { type: StoragePersistenceService }]; } });

class ParLoginService {
    constructor(loggerService, responseTypeValidationService, urlService, redirectService, configurationProvider, authWellKnownService, popupService, checkAuthService, parService) {
        this.loggerService = loggerService;
        this.responseTypeValidationService = responseTypeValidationService;
        this.urlService = urlService;
        this.redirectService = redirectService;
        this.configurationProvider = configurationProvider;
        this.authWellKnownService = authWellKnownService;
        this.popupService = popupService;
        this.checkAuthService = checkAuthService;
        this.parService = parService;
    }
    loginPar(configId, authOptions) {
        if (!this.responseTypeValidationService.hasConfigValidResponseType(configId)) {
            this.loggerService.logError(configId, 'Invalid response type!');
            return;
        }
        const { authWellknownEndpointUrl } = this.configurationProvider.getOpenIDConfiguration(configId);
        if (!authWellknownEndpointUrl) {
            this.loggerService.logError(configId, 'no authWellknownEndpoint given!');
            return;
        }
        this.loggerService.logDebug(configId, 'BEGIN Authorize OIDC Flow, no auth data');
        const { urlHandler, customParams } = authOptions || {};
        this.authWellKnownService
            .getAuthWellKnownEndPoints(authWellknownEndpointUrl, configId)
            .pipe(switchMap(() => this.parService.postParRequest(configId, customParams)))
            .subscribe((response) => {
            this.loggerService.logDebug(configId, 'par response: ', response);
            const url = this.urlService.getAuthorizeParUrl(response.requestUri, configId);
            this.loggerService.logDebug(configId, 'par request url: ', url);
            if (!url) {
                this.loggerService.logError(configId, `Could not create URL with param ${response.requestUri}: '${url}'`);
                return;
            }
            if (urlHandler) {
                urlHandler(url);
            }
            else {
                this.redirectService.redirectTo(url);
            }
        });
    }
    loginWithPopUpPar(configId, authOptions, popupOptions) {
        if (!this.responseTypeValidationService.hasConfigValidResponseType(configId)) {
            const errorMessage = 'Invalid response type!';
            this.loggerService.logError(configId, errorMessage);
            return throwError(() => new Error(errorMessage));
        }
        const { authWellknownEndpointUrl } = this.configurationProvider.getOpenIDConfiguration(configId);
        if (!authWellknownEndpointUrl) {
            const errorMessage = 'no authWellknownEndpoint given!';
            this.loggerService.logError(configId, errorMessage);
            return throwError(() => new Error(errorMessage));
        }
        this.loggerService.logDebug(configId, 'BEGIN Authorize OIDC Flow with popup, no auth data');
        const { customParams } = authOptions || {};
        return this.authWellKnownService.getAuthWellKnownEndPoints(authWellknownEndpointUrl, configId).pipe(switchMap(() => this.parService.postParRequest(configId, customParams)), switchMap((response) => {
            this.loggerService.logDebug(configId, 'par response: ', response);
            const url = this.urlService.getAuthorizeParUrl(response.requestUri, configId);
            this.loggerService.logDebug(configId, 'par request url: ', url);
            if (!url) {
                const errorMessage = `Could not create URL with param ${response.requestUri}: 'url'`;
                this.loggerService.logError(configId, errorMessage);
                return throwError(() => new Error(errorMessage));
            }
            this.popupService.openPopUp(url, popupOptions);
            return this.popupService.result$.pipe(take(1), switchMap((result) => {
                const { userClosed, receivedUrl } = result;
                if (userClosed) {
                    return of({
                        isAuthenticated: false,
                        errorMessage: 'User closed popup',
                        userData: null,
                        idToken: null,
                        accessToken: null,
                        configId,
                    });
                }
                return this.checkAuthService.checkAuth(configId, receivedUrl);
            }));
        }));
    }
}
ParLoginService.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: ParLoginService, deps: [{ token: LoggerService }, { token: ResponseTypeValidationService }, { token: UrlService }, { token: RedirectService }, { token: ConfigurationProvider }, { token: AuthWellKnownService }, { token: PopUpService }, { token: CheckAuthService }, { token: ParService }], target: i0.ɵɵFactoryTarget.Injectable });
ParLoginService.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: ParLoginService });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: ParLoginService, decorators: [{
            type: Injectable
        }], ctorParameters: function () { return [{ type: LoggerService }, { type: ResponseTypeValidationService }, { type: UrlService }, { type: RedirectService }, { type: ConfigurationProvider }, { type: AuthWellKnownService }, { type: PopUpService }, { type: CheckAuthService }, { type: ParService }]; } });

class PopUpLoginService {
    constructor(loggerService, responseTypeValidationService, urlService, configurationProvider, authWellKnownService, popupService, checkAuthService) {
        this.loggerService = loggerService;
        this.responseTypeValidationService = responseTypeValidationService;
        this.urlService = urlService;
        this.configurationProvider = configurationProvider;
        this.authWellKnownService = authWellKnownService;
        this.popupService = popupService;
        this.checkAuthService = checkAuthService;
    }
    loginWithPopUpStandard(configId, authOptions, popupOptions) {
        if (!this.responseTypeValidationService.hasConfigValidResponseType(configId)) {
            const errorMessage = 'Invalid response type!';
            this.loggerService.logError(configId, errorMessage);
            return throwError(() => new Error(errorMessage));
        }
        const { authWellknownEndpointUrl } = this.configurationProvider.getOpenIDConfiguration(configId);
        if (!authWellknownEndpointUrl) {
            const errorMessage = 'no authWellknownEndpoint given!';
            this.loggerService.logError(configId, errorMessage);
            return throwError(() => new Error(errorMessage));
        }
        this.loggerService.logDebug(configId, 'BEGIN Authorize OIDC Flow with popup, no auth data');
        return this.authWellKnownService.getAuthWellKnownEndPoints(authWellknownEndpointUrl, configId).pipe(switchMap(() => {
            const { customParams } = authOptions || {};
            const authUrl = this.urlService.getAuthorizeUrl(configId, customParams);
            this.popupService.openPopUp(authUrl, popupOptions);
            return this.popupService.result$.pipe(take(1), switchMap((result) => {
                const { userClosed, receivedUrl } = result;
                if (userClosed) {
                    return of({
                        isAuthenticated: false,
                        errorMessage: 'User closed popup',
                        userData: null,
                        idToken: null,
                        accessToken: null,
                        configId,
                    });
                }
                return this.checkAuthService.checkAuth(configId, receivedUrl);
            }));
        }));
    }
}
PopUpLoginService.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: PopUpLoginService, deps: [{ token: LoggerService }, { token: ResponseTypeValidationService }, { token: UrlService }, { token: ConfigurationProvider }, { token: AuthWellKnownService }, { token: PopUpService }, { token: CheckAuthService }], target: i0.ɵɵFactoryTarget.Injectable });
PopUpLoginService.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: PopUpLoginService });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: PopUpLoginService, decorators: [{
            type: Injectable
        }], ctorParameters: function () { return [{ type: LoggerService }, { type: ResponseTypeValidationService }, { type: UrlService }, { type: ConfigurationProvider }, { type: AuthWellKnownService }, { type: PopUpService }, { type: CheckAuthService }]; } });

class StandardLoginService {
    constructor(loggerService, responseTypeValidationService, urlService, redirectService, configurationProvider, authWellKnownService) {
        this.loggerService = loggerService;
        this.responseTypeValidationService = responseTypeValidationService;
        this.urlService = urlService;
        this.redirectService = redirectService;
        this.configurationProvider = configurationProvider;
        this.authWellKnownService = authWellKnownService;
    }
    loginStandard(configId, authOptions) {
        if (!this.responseTypeValidationService.hasConfigValidResponseType(configId)) {
            this.loggerService.logError(configId, 'Invalid response type!');
            return;
        }
        const { authWellknownEndpointUrl } = this.configurationProvider.getOpenIDConfiguration(configId);
        if (!authWellknownEndpointUrl) {
            this.loggerService.logError(configId, 'no authWellknownEndpoint given!');
            return;
        }
        this.loggerService.logDebug(configId, 'BEGIN Authorize OIDC Flow, no auth data');
        this.authWellKnownService.getAuthWellKnownEndPoints(authWellknownEndpointUrl, configId).subscribe(() => {
            const { urlHandler, customParams } = authOptions || {};
            const url = this.urlService.getAuthorizeUrl(configId, customParams);
            if (!url) {
                this.loggerService.logError(configId, 'Could not create URL', url);
                return;
            }
            if (urlHandler) {
                urlHandler(url);
            }
            else {
                this.redirectService.redirectTo(url);
            }
        });
    }
}
StandardLoginService.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: StandardLoginService, deps: [{ token: LoggerService }, { token: ResponseTypeValidationService }, { token: UrlService }, { token: RedirectService }, { token: ConfigurationProvider }, { token: AuthWellKnownService }], target: i0.ɵɵFactoryTarget.Injectable });
StandardLoginService.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: StandardLoginService });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: StandardLoginService, decorators: [{
            type: Injectable
        }], ctorParameters: function () { return [{ type: LoggerService }, { type: ResponseTypeValidationService }, { type: UrlService }, { type: RedirectService }, { type: ConfigurationProvider }, { type: AuthWellKnownService }]; } });

class LoginService {
    constructor(configurationProvider, parLoginService, popUpLoginService, standardLoginService, storagePersistenceService) {
        this.configurationProvider = configurationProvider;
        this.parLoginService = parLoginService;
        this.popUpLoginService = popUpLoginService;
        this.standardLoginService = standardLoginService;
        this.storagePersistenceService = storagePersistenceService;
    }
    login(configId, authOptions) {
        if (authOptions === null || authOptions === void 0 ? void 0 : authOptions.customParams) {
            this.storagePersistenceService.write('storageCustomParamsAuthRequest', authOptions.customParams, configId);
        }
        const { usePushedAuthorisationRequests } = this.configurationProvider.getOpenIDConfiguration(configId);
        if (usePushedAuthorisationRequests) {
            return this.parLoginService.loginPar(configId, authOptions);
        }
        else {
            return this.standardLoginService.loginStandard(configId, authOptions);
        }
    }
    loginWithPopUp(configId, authOptions, popupOptions) {
        if (authOptions === null || authOptions === void 0 ? void 0 : authOptions.customParams) {
            this.storagePersistenceService.write('storageCustomParamsAuthRequest', authOptions.customParams, configId);
        }
        const { usePushedAuthorisationRequests } = this.configurationProvider.getOpenIDConfiguration(configId);
        if (usePushedAuthorisationRequests) {
            return this.parLoginService.loginWithPopUpPar(configId, authOptions, popupOptions);
        }
        else {
            return this.popUpLoginService.loginWithPopUpStandard(configId, authOptions, popupOptions);
        }
    }
}
LoginService.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: LoginService, deps: [{ token: ConfigurationProvider }, { token: ParLoginService }, { token: PopUpLoginService }, { token: StandardLoginService }, { token: StoragePersistenceService }], target: i0.ɵɵFactoryTarget.Injectable });
LoginService.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: LoginService });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: LoginService, decorators: [{
            type: Injectable
        }], ctorParameters: function () { return [{ type: ConfigurationProvider }, { type: ParLoginService }, { type: PopUpLoginService }, { type: StandardLoginService }, { type: StoragePersistenceService }]; } });

class LogoffRevocationService {
    constructor(dataService, storagePersistenceService, loggerService, urlService, checkSessionService, resetAuthDataService, redirectService, configurationProvider) {
        this.dataService = dataService;
        this.storagePersistenceService = storagePersistenceService;
        this.loggerService = loggerService;
        this.urlService = urlService;
        this.checkSessionService = checkSessionService;
        this.resetAuthDataService = resetAuthDataService;
        this.redirectService = redirectService;
        this.configurationProvider = configurationProvider;
    }
    // Logs out on the server and the local client.
    // If the server state has changed, check session, then only a local logout.
    logoff(configId, authOptions) {
        const { urlHandler, customParams } = authOptions || {};
        this.loggerService.logDebug(configId, 'logoff, remove auth ');
        const endSessionUrl = this.getEndSessionUrl(configId, customParams);
        this.resetAuthDataService.resetAuthorizationData(configId);
        if (!endSessionUrl) {
            this.loggerService.logDebug(configId, 'only local login cleaned up, no end_session_endpoint');
            return;
        }
        if (this.checkSessionService.serverStateChanged(configId)) {
            this.loggerService.logDebug(configId, 'only local login cleaned up, server session has changed');
        }
        else if (urlHandler) {
            urlHandler(endSessionUrl);
        }
        else {
            this.redirectService.redirectTo(endSessionUrl);
        }
    }
    logoffLocal(configId) {
        this.resetAuthDataService.resetAuthorizationData(configId);
        this.checkSessionService.stop();
    }
    logoffLocalMultiple() {
        const allConfigs = this.configurationProvider.getAllConfigurations();
        allConfigs.forEach(({ configId }) => this.logoffLocal(configId));
    }
    // The refresh token and and the access token are revoked on the server. If the refresh token does not exist
    // only the access token is revoked. Then the logout run.
    logoffAndRevokeTokens(configId, authOptions) {
        const { revocationEndpoint } = this.storagePersistenceService.read('authWellKnownEndPoints', configId) || {};
        if (!revocationEndpoint) {
            this.loggerService.logDebug(configId, 'revocation endpoint not supported');
            this.logoff(configId, authOptions);
        }
        if (this.storagePersistenceService.getRefreshToken(configId)) {
            return this.revokeRefreshToken(configId).pipe(switchMap((result) => this.revokeAccessToken(configId, result)), catchError((error) => {
                const errorMessage = `revoke token failed`;
                this.loggerService.logError(configId, errorMessage, error);
                return throwError(() => new Error(errorMessage));
            }), tap(() => this.logoff(configId, authOptions)));
        }
        else {
            return this.revokeAccessToken(configId).pipe(catchError((error) => {
                const errorMessage = `revoke accessToken failed`;
                this.loggerService.logError(configId, errorMessage, error);
                return throwError(() => new Error(errorMessage));
            }), tap(() => this.logoff(configId, authOptions)));
        }
    }
    // https://tools.ietf.org/html/rfc7009
    // revokes an access token on the STS. If no token is provided, then the token from
    // the storage is revoked. You can pass any token to revoke. This makes it possible to
    // manage your own tokens. The is a public API.
    revokeAccessToken(configId, accessToken) {
        const accessTok = accessToken || this.storagePersistenceService.getAccessToken(configId);
        const body = this.urlService.createRevocationEndpointBodyAccessToken(accessTok, configId);
        return this.sendRevokeRequest(configId, body);
    }
    // https://tools.ietf.org/html/rfc7009
    // revokes an refresh token on the STS. This is only required in the code flow with refresh tokens.
    // If no token is provided, then the token from the storage is revoked. You can pass any token to revoke.
    // This makes it possible to manage your own tokens.
    revokeRefreshToken(configId, refreshToken) {
        const refreshTok = refreshToken || this.storagePersistenceService.getRefreshToken(configId);
        const body = this.urlService.createRevocationEndpointBodyRefreshToken(refreshTok, configId);
        return this.sendRevokeRequest(configId, body);
    }
    getEndSessionUrl(configId, customParams) {
        const idToken = this.storagePersistenceService.getIdToken(configId);
        const { customParamsEndSessionRequest } = this.configurationProvider.getOpenIDConfiguration();
        const mergedParams = Object.assign(Object.assign({}, customParamsEndSessionRequest), customParams);
        return this.urlService.createEndSessionUrl(idToken, configId, mergedParams);
    }
    sendRevokeRequest(configId, body) {
        const url = this.urlService.getRevocationEndpointUrl(configId);
        let headers = new HttpHeaders();
        headers = headers.set('Content-Type', 'application/x-www-form-urlencoded');
        return this.dataService.post(url, body, configId, headers).pipe(retry(2), switchMap((response) => {
            this.loggerService.logDebug(configId, 'revocation endpoint post response: ', response);
            return of(response);
        }), catchError((error) => {
            const errorMessage = `Revocation request failed`;
            this.loggerService.logError(configId, errorMessage, error);
            return throwError(() => new Error(errorMessage));
        }));
    }
}
LogoffRevocationService.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: LogoffRevocationService, deps: [{ token: DataService }, { token: StoragePersistenceService }, { token: LoggerService }, { token: UrlService }, { token: CheckSessionService }, { token: ResetAuthDataService }, { token: RedirectService }, { token: ConfigurationProvider }], target: i0.ɵɵFactoryTarget.Injectable });
LogoffRevocationService.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: LogoffRevocationService });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: LogoffRevocationService, decorators: [{
            type: Injectable
        }], ctorParameters: function () { return [{ type: DataService }, { type: StoragePersistenceService }, { type: LoggerService }, { type: UrlService }, { type: CheckSessionService }, { type: ResetAuthDataService }, { type: RedirectService }, { type: ConfigurationProvider }]; } });

class OidcSecurityService {
    constructor(checkSessionService, checkAuthService, userService, tokenHelperService, configurationProvider, authStateService, flowsDataService, callbackService, logoffRevocationService, loginService, refreshSessionService, urlService) {
        this.checkSessionService = checkSessionService;
        this.checkAuthService = checkAuthService;
        this.userService = userService;
        this.tokenHelperService = tokenHelperService;
        this.configurationProvider = configurationProvider;
        this.authStateService = authStateService;
        this.flowsDataService = flowsDataService;
        this.callbackService = callbackService;
        this.logoffRevocationService = logoffRevocationService;
        this.loginService = loginService;
        this.refreshSessionService = refreshSessionService;
        this.urlService = urlService;
    }
    /**
     * Provides information about the user after they have logged in.
     *
     * @returns Returns an object containing either the user data directly (single config) or
     * the user data per config in case you are running with multiple configs
     */
    get userData$() {
        return this.userService.userData$;
    }
    /**
     * Emits each time an authorization event occurs.
     *
     * @returns Returns an object containing if you are authenticated or not.
     * Single Config: true if config is authenticated, false if not.
     * Multiple Configs: true is all configs are authenticated, false if only one of them is not
     *
     * The `allConfigsAuthenticated` property contains the auth information _per config_.
     */
    get isAuthenticated$() {
        return this.authStateService.authenticated$;
    }
    /**
     * Emits each time the server sends a CheckSession event and the value changed. This property will always return
     * true.
     */
    get checkSessionChanged$() {
        return this.checkSessionService.checkSessionChanged$;
    }
    /**
     * Emits on a Security Token Service callback. The observable will never contain a value.
     */
    get stsCallback$() {
        return this.callbackService.stsCallback$;
    }
    /**
     * Returns the currently active OpenID configurations.
     *
     * @returns an array of OpenIdConfigurations.
     */
    getConfigurations() {
        return this.configurationProvider.getAllConfigurations();
    }
    /**
     * Returns a single active OpenIdConfiguration.
     *
     * @param configId The configId to identify the config. If not passed, the first one is being returned
     */
    getConfiguration(configId) {
        configId = configId !== null && configId !== void 0 ? configId : this.configurationProvider.getOpenIDConfiguration().configId;
        return this.configurationProvider.getOpenIDConfiguration(configId);
    }
    /**
     * Returns the userData for a configuration
     *
     * @param configId The configId to identify the config. If not passed, the first one is being used
     */
    getUserData(configId) {
        configId = configId !== null && configId !== void 0 ? configId : this.configurationProvider.getOpenIDConfiguration().configId;
        return this.userService.getUserDataFromStore(configId);
    }
    /**
     * Starts the complete setup flow for one configuration. Calling will start the entire authentication flow, and the returned observable
     * will denote whether the user was successfully authenticated including the user data, the access token, the configId and
     * an error message in case an error happened
     *
     * @param url The URL to perform the authorization on the behalf of.
     * @param configId The configId to perform the authorization on the behalf of. If not passed, the first configs will be taken
     *
     * @returns An object `LoginResponse` containing all information about the login
     */
    checkAuth(url, configId) {
        return this.checkAuthService.checkAuth(configId, url);
    }
    /**
     * Starts the complete setup flow for multiple configurations.
     * Calling will start the entire authentication flow, and the returned observable
     * will denote whether the user was successfully authenticated including the user data, the access token, the configId and
     * an error message in case an error happened in an array for each config which was provided
     *
     * @param url The URL to perform the authorization on the behalf of.
     * @param configId The configId to perform the authorization on the behalf of. If not passed, all of the current
     * configured ones will be used to check.
     *
     * @returns An array of `LoginResponse` objects containing all information about the logins
     */
    checkAuthMultiple(url, configId) {
        return this.checkAuthService.checkAuthMultiple(configId, url);
    }
    /**
     * Provides information about the current authenticated state
     *
     * @param configId The configId to check the information for. If not passed, the first configs will be taken
     *
     * @returns A boolean whether the config is authenticated or not.
     */
    isAuthenticated(configId) {
        configId = configId !== null && configId !== void 0 ? configId : this.configurationProvider.getOpenIDConfiguration(configId).configId;
        return this.authStateService.isAuthenticated(configId);
    }
    /**
     * Checks the server for an authenticated session using the iframe silent renew if not locally authenticated.
     */
    checkAuthIncludingServer(configId) {
        configId = configId !== null && configId !== void 0 ? configId : this.configurationProvider.getOpenIDConfiguration(configId).configId;
        return this.checkAuthService.checkAuthIncludingServer(configId);
    }
    /**
     * Returns the access token for the login scenario.
     *
     * @param configId The configId to check the information for. If not passed, the first configs will be taken
     *
     * @returns A string with the access token.
     */
    getAccessToken(configId) {
        configId = configId !== null && configId !== void 0 ? configId : this.configurationProvider.getOpenIDConfiguration(configId).configId;
        return this.authStateService.getAccessToken(configId);
    }
    /**
     * Returns the ID token for the sign-in.
     *
     * @param configId The configId to check the information for. If not passed, the first configs will be taken
     *
     * @returns A string with the id token.
     */
    getIdToken(configId) {
        configId = configId !== null && configId !== void 0 ? configId : this.configurationProvider.getOpenIDConfiguration(configId).configId;
        return this.authStateService.getIdToken(configId);
    }
    /**
     * Returns the refresh token, if present, for the sign-in.
     *
     * @param configId The configId to check the information for. If not passed, the first configs will be taken
     *
     * @returns A string with the refresh token.
     */
    getRefreshToken(configId) {
        configId = configId !== null && configId !== void 0 ? configId : this.configurationProvider.getOpenIDConfiguration(configId).configId;
        return this.authStateService.getRefreshToken(configId);
    }
    /**
     * Returns the authentication result, if present, for the sign-in.
     *
     * @param configId The configId to check the information for. If not passed, the first configs will be taken
     *
     * @returns A object with the authentication result
     */
    getAuthenticationResult(configId) {
        configId = configId !== null && configId !== void 0 ? configId : this.configurationProvider.getOpenIDConfiguration(configId).configId;
        return this.authStateService.getAuthenticationResult(configId);
    }
    /**
     * Returns the payload from the ID token.
     *
     * @param encode Set to true if the payload is base64 encoded
     * @param configId The configId to check the information for. If not passed, the first configs will be taken
     *
     * @returns The payload from the id token.
     */
    getPayloadFromIdToken(encode = false, configId) {
        configId = configId !== null && configId !== void 0 ? configId : this.configurationProvider.getOpenIDConfiguration(configId).configId;
        const token = this.authStateService.getIdToken(configId);
        return this.tokenHelperService.getPayloadFromToken(token, encode, configId);
    }
    /**
     * Sets a custom state for the authorize request.
     *
     * @param state The state to set.
     * @param configId The configId to check the information for. If not passed, the first configs will be taken
     */
    setState(state, configId) {
        configId = configId !== null && configId !== void 0 ? configId : this.configurationProvider.getOpenIDConfiguration(configId).configId;
        this.flowsDataService.setAuthStateControl(state, configId);
    }
    /**
     * Gets the state value used for the authorize request.
     *
     * @param configId The configId to check the information for. If not passed, the first configs will be taken
     *
     * @returns The state value used for the authorize request.
     */
    getState(configId) {
        configId = configId !== null && configId !== void 0 ? configId : this.configurationProvider.getOpenIDConfiguration(configId).configId;
        return this.flowsDataService.getAuthStateControl(configId);
    }
    /**
     * Redirects the user to the Security Token Service to begin the authentication process.
     *
     * @param configId The configId to perform the action in behalf of. If not passed, the first configs will be taken
     * @param authOptions The custom options for the the authentication request.
     */
    authorize(configId, authOptions) {
        configId = configId !== null && configId !== void 0 ? configId : this.configurationProvider.getOpenIDConfiguration(configId).configId;
        this.loginService.login(configId, authOptions);
    }
    /**
     * Opens the Security Token Service in a new window to begin the authentication process.
     *
     * @param authOptions The custom options for the authentication request.
     * @param popupOptions The configuration for the popup window.
     * @param configId The configId to perform the action in behalf of. If not passed, the first configs will be taken
     *
     * @returns An `Observable<LoginResponse>` containing all information about the login
     */
    authorizeWithPopUp(authOptions, popupOptions, configId) {
        configId = configId !== null && configId !== void 0 ? configId : this.configurationProvider.getOpenIDConfiguration(configId).configId;
        return this.loginService.loginWithPopUp(configId, authOptions, popupOptions);
    }
    /**
     * Manually refreshes the session.
     *
     * @param customParams Custom parameters to pass to the refresh request.
     * @param configId The configId to perform the action in behalf of. If not passed, the first configs will be taken
     *
     * @returns An `Observable<LoginResponse>` containing all information about the login
     */
    forceRefreshSession(customParams, configId) {
        configId = configId !== null && configId !== void 0 ? configId : this.configurationProvider.getOpenIDConfiguration(configId).configId;
        return this.refreshSessionService.userForceRefreshSession(configId, customParams);
    }
    /**
     * Revokes the refresh token (if present) and the access token on the server and then performs the logoff operation.
     * The refresh token and and the access token are revoked on the server. If the refresh token does not exist
     * only the access token is revoked. Then the logout run.
     *
     * @param configId The configId to perform the action in behalf of. If not passed, the first configs will be taken
     * @param authOptions The custom options for the request.
     *
     * @returns An observable when the action is finished
     */
    logoffAndRevokeTokens(configId, authOptions) {
        configId = configId !== null && configId !== void 0 ? configId : this.configurationProvider.getOpenIDConfiguration(configId).configId;
        return this.logoffRevocationService.logoffAndRevokeTokens(configId, authOptions);
    }
    /**
     * Logs out on the server and the local client. If the server state has changed, confirmed via check session,
     * then only a local logout is performed.
     *
     * @param configId The configId to perform the action in behalf of. If not passed, the first configs will be taken
     * @param authOptions with custom parameters and/or an custom url handler
     */
    logoff(configId, authOptions) {
        configId = configId !== null && configId !== void 0 ? configId : this.configurationProvider.getOpenIDConfiguration(configId).configId;
        return this.logoffRevocationService.logoff(configId, authOptions);
    }
    /**
     * Logs the user out of the application without logging them out of the server.
     * Use this method if you have _one_ config enabled.
     *
     * @param configId The configId to perform the action in behalf of. If not passed, the first configs will be taken
     */
    logoffLocal(configId) {
        configId = configId !== null && configId !== void 0 ? configId : this.configurationProvider.getOpenIDConfiguration(configId).configId;
        return this.logoffRevocationService.logoffLocal(configId);
    }
    /**
     * Logs the user out of the application for all configs without logging them out of the server.
     * Use this method if you have _multiple_ configs enabled.
     */
    logoffLocalMultiple() {
        return this.logoffRevocationService.logoffLocalMultiple();
    }
    /**
     * Revokes an access token on the Security Token Service. This is only required in the code flow with refresh tokens. If no token is
     * provided, then the token from the storage is revoked. You can pass any token to revoke.
     * https://tools.ietf.org/html/rfc7009
     *
     * @param accessToken The access token to revoke.
     * @param configId The configId to perform the action in behalf of. If not passed, the first configs will be taken
     *
     * @returns An observable when the action is finished
     */
    revokeAccessToken(accessToken, configId) {
        configId = configId !== null && configId !== void 0 ? configId : this.configurationProvider.getOpenIDConfiguration(configId).configId;
        return this.logoffRevocationService.revokeAccessToken(configId, accessToken);
    }
    /**
     * Revokes a refresh token on the Security Token Service. This is only required in the code flow with refresh tokens. If no token is
     * provided, then the token from the storage is revoked. You can pass any token to revoke.
     * https://tools.ietf.org/html/rfc7009
     *
     * @param refreshToken The access token to revoke.
     * @param configId The configId to perform the action in behalf of. If not passed, the first configs will be taken
     *
     * @returns An observable when the action is finished
     */
    revokeRefreshToken(refreshToken, configId) {
        configId = configId !== null && configId !== void 0 ? configId : this.configurationProvider.getOpenIDConfiguration(configId).configId;
        return this.logoffRevocationService.revokeRefreshToken(configId, refreshToken);
    }
    /**
     * Creates the end session URL which can be used to implement an alternate server logout.
     *
     * @param customParams
     * @param configId The configId to perform the action in behalf of. If not passed, the first configs will be taken
     *
     * @returns A string with the end session url or null
     */
    getEndSessionUrl(customParams, configId) {
        configId = configId !== null && configId !== void 0 ? configId : this.configurationProvider.getOpenIDConfiguration(configId).configId;
        return this.logoffRevocationService.getEndSessionUrl(configId, customParams);
    }
    /**
     * Creates the authorize URL based on your flow
     *
     * @param customParams
     * @param configId The configId to perform the action in behalf of. If not passed, the first configs will be taken
     *
     * @returns A string with the authorize URL or null
     */
    getAuthorizeUrl(customParams, configId) {
        configId = configId !== null && configId !== void 0 ? configId : this.configurationProvider.getOpenIDConfiguration(configId).configId;
        return this.urlService.getAuthorizeUrl(configId, customParams);
    }
}
OidcSecurityService.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: OidcSecurityService, deps: [{ token: CheckSessionService }, { token: CheckAuthService }, { token: UserService }, { token: TokenHelperService }, { token: ConfigurationProvider }, { token: AuthStateService }, { token: FlowsDataService }, { token: CallbackService }, { token: LogoffRevocationService }, { token: LoginService }, { token: RefreshSessionService }, { token: UrlService }], target: i0.ɵɵFactoryTarget.Injectable });
OidcSecurityService.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: OidcSecurityService });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: OidcSecurityService, decorators: [{
            type: Injectable
        }], ctorParameters: function () { return [{ type: CheckSessionService }, { type: CheckAuthService }, { type: UserService }, { type: TokenHelperService }, { type: ConfigurationProvider }, { type: AuthStateService }, { type: FlowsDataService }, { type: CallbackService }, { type: LogoffRevocationService }, { type: LoginService }, { type: RefreshSessionService }, { type: UrlService }]; } });

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function createStaticLoader(passedConfig) {
    return new StsConfigStaticLoader(passedConfig.config);
}
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function configurationProviderFactory(oidcConfigService, loader) {
    const allConfigs$ = forkJoin(loader.loadConfigs());
    const fn = () => allConfigs$.pipe(switchMap((configs) => oidcConfigService.withConfigs(configs)));
    return fn;
}
const PASSED_CONFIG = new InjectionToken('PASSED_CONFIG');
class AuthModule {
    static forRoot(passedConfig) {
        return {
            ngModule: AuthModule,
            providers: [
                // Make the PASSED_CONFIG available through injection
                { provide: PASSED_CONFIG, useValue: passedConfig },
                // Create the loader: Either the one getting passed or a static one
                (passedConfig === null || passedConfig === void 0 ? void 0 : passedConfig.loader) || { provide: StsConfigLoader, useFactory: createStaticLoader, deps: [PASSED_CONFIG] },
                // Load the config when the app starts
                {
                    provide: APP_INITIALIZER,
                    multi: true,
                    deps: [OidcConfigService, StsConfigLoader, PASSED_CONFIG],
                    useFactory: configurationProviderFactory,
                },
                OidcConfigService,
                PublicEventsService,
                FlowHelper,
                ConfigurationProvider,
                OidcSecurityService,
                TokenValidationService,
                PlatformProvider,
                CheckSessionService,
                FlowsDataService,
                FlowsService,
                SilentRenewService,
                LogoffRevocationService,
                UserService,
                RandomService,
                HttpBaseService,
                UrlService,
                AuthStateService,
                SigninKeyDataService,
                StoragePersistenceService,
                TokenHelperService,
                LoggerService,
                IFrameService,
                EqualityService,
                LoginService,
                ParService,
                AuthWellKnownDataService,
                AuthWellKnownService,
                DataService,
                StateValidationService,
                ConfigValidationService,
                CheckAuthService,
                ResetAuthDataService,
                ImplicitFlowCallbackService,
                HistoryJwtKeysCallbackHandlerService,
                ResponseTypeValidationService,
                UserCallbackHandlerService,
                StateValidationCallbackHandlerService,
                RefreshSessionCallbackHandlerService,
                RefreshTokenCallbackHandlerService,
                CodeFlowCallbackHandlerService,
                ImplicitFlowCallbackHandlerService,
                ParLoginService,
                PopUpLoginService,
                StandardLoginService,
                AutoLoginService,
                JsrsAsignReducedService,
                CurrentUrlService,
                ClosestMatchingRouteService,
                DefaultSessionStorageService,
                BrowserStorageService,
            ],
        };
    }
}
AuthModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: AuthModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
AuthModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: AuthModule, imports: [CommonModule, HttpClientModule] });
AuthModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: AuthModule, imports: [[CommonModule, HttpClientModule]] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: AuthModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [CommonModule, HttpClientModule],
                    declarations: [],
                    exports: [],
                }]
        }] });

class AutoLoginAllRoutesGuard {
    constructor(autoLoginService, checkAuthService, loginService, configurationProvider) {
        this.autoLoginService = autoLoginService;
        this.checkAuthService = checkAuthService;
        this.loginService = loginService;
        this.configurationProvider = configurationProvider;
    }
    canLoad(route, segments) {
        const routeToRedirect = segments.join('/');
        return this.checkAuth(routeToRedirect);
    }
    canActivate(route, state) {
        return this.checkAuth(state.url);
    }
    canActivateChild(route, state) {
        return this.checkAuth(state.url);
    }
    checkAuth(url) {
        const configId = this.getId();
        return this.checkAuthService.checkAuth().pipe(take(1), map(({ isAuthenticated }) => {
            if (isAuthenticated) {
                this.autoLoginService.checkSavedRedirectRouteAndNavigate(configId);
            }
            if (!isAuthenticated) {
                this.autoLoginService.saveRedirectRoute(configId, url);
                this.loginService.login(configId);
            }
            return isAuthenticated;
        }));
    }
    getId() {
        return this.configurationProvider.getOpenIDConfiguration().configId;
    }
}
AutoLoginAllRoutesGuard.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: AutoLoginAllRoutesGuard, deps: [{ token: AutoLoginService }, { token: CheckAuthService }, { token: LoginService }, { token: ConfigurationProvider }], target: i0.ɵɵFactoryTarget.Injectable });
AutoLoginAllRoutesGuard.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: AutoLoginAllRoutesGuard, providedIn: 'root' });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: AutoLoginAllRoutesGuard, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }], ctorParameters: function () { return [{ type: AutoLoginService }, { type: CheckAuthService }, { type: LoginService }, { type: ConfigurationProvider }]; } });

class AutoLoginPartialRoutesGuard {
    constructor(autoLoginService, authStateService, loginService, configurationProvider) {
        this.autoLoginService = autoLoginService;
        this.authStateService = authStateService;
        this.loginService = loginService;
        this.configurationProvider = configurationProvider;
    }
    canLoad(route, segments) {
        const routeToRedirect = segments.join('/');
        return this.checkAuth(routeToRedirect);
    }
    canActivate(route, state) {
        return this.checkAuth(state.url);
    }
    canActivateChild(route, state) {
        return this.checkAuth(state.url);
    }
    checkAuth(url) {
        const configId = this.getId();
        const isAuthenticated = this.authStateService.areAuthStorageTokensValid(configId);
        if (isAuthenticated) {
            this.autoLoginService.checkSavedRedirectRouteAndNavigate(configId);
        }
        if (!isAuthenticated) {
            this.autoLoginService.saveRedirectRoute(configId, url);
            this.loginService.login(configId);
        }
        return isAuthenticated;
    }
    getId() {
        return this.configurationProvider.getOpenIDConfiguration().configId;
    }
}
AutoLoginPartialRoutesGuard.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: AutoLoginPartialRoutesGuard, deps: [{ token: AutoLoginService }, { token: AuthStateService }, { token: LoginService }, { token: ConfigurationProvider }], target: i0.ɵɵFactoryTarget.Injectable });
AutoLoginPartialRoutesGuard.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: AutoLoginPartialRoutesGuard, providedIn: 'root' });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: AutoLoginPartialRoutesGuard, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }], ctorParameters: function () { return [{ type: AutoLoginService }, { type: AuthStateService }, { type: LoginService }, { type: ConfigurationProvider }]; } });

class AuthInterceptor {
    constructor(authStateService, configurationProvider, loggerService, closestMatchingRouteService) {
        this.authStateService = authStateService;
        this.configurationProvider = configurationProvider;
        this.loggerService = loggerService;
        this.closestMatchingRouteService = closestMatchingRouteService;
    }
    intercept(req, next) {
        if (!this.configurationProvider.hasAtLeastOneConfig()) {
            return next.handle(req);
        }
        const allConfigurations = this.configurationProvider.getAllConfigurations();
        const allRoutesConfigured = allConfigurations.map((x) => x.secureRoutes || []);
        const allRoutesConfiguredFlat = [].concat.apply([], allRoutesConfigured);
        if (allRoutesConfiguredFlat.length === 0) {
            const { configId } = allConfigurations[0];
            this.loggerService.logDebug(configId, `No routes to check configured`);
            return next.handle(req);
        }
        const { matchingConfigId, matchingRoute } = this.closestMatchingRouteService.getConfigIdForClosestMatchingRoute(req.url);
        if (!matchingConfigId) {
            const { configId } = allConfigurations[0];
            this.loggerService.logDebug(configId, `Did not find any configured route for route ${req.url}`);
            return next.handle(req);
        }
        this.loggerService.logDebug(matchingConfigId, `'${req.url}' matches configured route '${matchingRoute}'`);
        const token = this.authStateService.getAccessToken(matchingConfigId);
        if (!token) {
            this.loggerService.logDebug(matchingConfigId, `Wanted to add token to ${req.url} but found no token: '${token}'`);
            return next.handle(req);
        }
        this.loggerService.logDebug(matchingConfigId, `'${req.url}' matches configured route '${matchingRoute}', adding token`);
        req = req.clone({
            headers: req.headers.set('Authorization', 'Bearer ' + token),
        });
        return next.handle(req);
    }
}
AuthInterceptor.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: AuthInterceptor, deps: [{ token: AuthStateService }, { token: ConfigurationProvider }, { token: LoggerService }, { token: ClosestMatchingRouteService }], target: i0.ɵɵFactoryTarget.Injectable });
AuthInterceptor.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: AuthInterceptor });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: AuthInterceptor, decorators: [{
            type: Injectable
        }], ctorParameters: function () { return [{ type: AuthStateService }, { type: ConfigurationProvider }, { type: LoggerService }, { type: ClosestMatchingRouteService }]; } });

/**
 * Implement this class-interface to create a custom storage.
 */
class AbstractSecurityStorage {
}
AbstractSecurityStorage.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: AbstractSecurityStorage, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
AbstractSecurityStorage.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: AbstractSecurityStorage });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: AbstractSecurityStorage, decorators: [{
            type: Injectable
        }] });

// Public classes.

/*
 * Public API Surface of angular-auth-oidc-client
 */

/**
 * Generated bundle index. Do not edit.
 */

export { AbstractSecurityStorage, AuthInterceptor, AuthModule, AutoLoginAllRoutesGuard, AutoLoginPartialRoutesGuard, EventTypes, LogLevel, LoggerService, OidcConfigService, OidcSecurityService, OpenIdConfigLoader, PASSED_CONFIG, PopUpService, PublicEventsService, StateValidationResult, StsConfigHttpLoader, StsConfigLoader, StsConfigStaticLoader, TokenHelperService, TokenValidationService, ValidationResult, configurationProviderFactory, createStaticLoader };
//# sourceMappingURL=angular-auth-oidc-client.mjs.map
