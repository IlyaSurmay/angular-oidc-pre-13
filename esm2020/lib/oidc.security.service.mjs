import { Injectable } from '@angular/core';
import * as i0 from "@angular/core";
import * as i1 from "./iframe/check-session.service";
import * as i2 from "./check-auth.service";
import * as i3 from "./user-data/user.service";
import * as i4 from "./utils/tokenHelper/token-helper.service";
import * as i5 from "./config/provider/config.provider";
import * as i6 from "./auth-state/auth-state.service";
import * as i7 from "./flows/flows-data.service";
import * as i8 from "./callback/callback.service";
import * as i9 from "./logoff-revoke/logoff-revocation.service";
import * as i10 from "./login/login.service";
import * as i11 from "./callback/refresh-session.service";
import * as i12 from "./utils/url/url.service";
export class OidcSecurityService {
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
        configId = configId ?? this.configurationProvider.getOpenIDConfiguration().configId;
        return this.configurationProvider.getOpenIDConfiguration(configId);
    }
    /**
     * Returns the userData for a configuration
     *
     * @param configId The configId to identify the config. If not passed, the first one is being used
     */
    getUserData(configId) {
        configId = configId ?? this.configurationProvider.getOpenIDConfiguration().configId;
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
        configId = configId ?? this.configurationProvider.getOpenIDConfiguration(configId).configId;
        return this.authStateService.isAuthenticated(configId);
    }
    /**
     * Checks the server for an authenticated session using the iframe silent renew if not locally authenticated.
     */
    checkAuthIncludingServer(configId) {
        configId = configId ?? this.configurationProvider.getOpenIDConfiguration(configId).configId;
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
        configId = configId ?? this.configurationProvider.getOpenIDConfiguration(configId).configId;
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
        configId = configId ?? this.configurationProvider.getOpenIDConfiguration(configId).configId;
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
        configId = configId ?? this.configurationProvider.getOpenIDConfiguration(configId).configId;
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
        configId = configId ?? this.configurationProvider.getOpenIDConfiguration(configId).configId;
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
        configId = configId ?? this.configurationProvider.getOpenIDConfiguration(configId).configId;
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
        configId = configId ?? this.configurationProvider.getOpenIDConfiguration(configId).configId;
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
        configId = configId ?? this.configurationProvider.getOpenIDConfiguration(configId).configId;
        return this.flowsDataService.getAuthStateControl(configId);
    }
    /**
     * Redirects the user to the Security Token Service to begin the authentication process.
     *
     * @param configId The configId to perform the action in behalf of. If not passed, the first configs will be taken
     * @param authOptions The custom options for the the authentication request.
     */
    authorize(configId, authOptions) {
        configId = configId ?? this.configurationProvider.getOpenIDConfiguration(configId).configId;
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
        configId = configId ?? this.configurationProvider.getOpenIDConfiguration(configId).configId;
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
        configId = configId ?? this.configurationProvider.getOpenIDConfiguration(configId).configId;
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
        configId = configId ?? this.configurationProvider.getOpenIDConfiguration(configId).configId;
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
        configId = configId ?? this.configurationProvider.getOpenIDConfiguration(configId).configId;
        return this.logoffRevocationService.logoff(configId, authOptions);
    }
    /**
     * Logs the user out of the application without logging them out of the server.
     * Use this method if you have _one_ config enabled.
     *
     * @param configId The configId to perform the action in behalf of. If not passed, the first configs will be taken
     */
    logoffLocal(configId) {
        configId = configId ?? this.configurationProvider.getOpenIDConfiguration(configId).configId;
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
        configId = configId ?? this.configurationProvider.getOpenIDConfiguration(configId).configId;
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
        configId = configId ?? this.configurationProvider.getOpenIDConfiguration(configId).configId;
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
        configId = configId ?? this.configurationProvider.getOpenIDConfiguration(configId).configId;
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
        configId = configId ?? this.configurationProvider.getOpenIDConfiguration(configId).configId;
        return this.urlService.getAuthorizeUrl(configId, customParams);
    }
}
OidcSecurityService.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: OidcSecurityService, deps: [{ token: i1.CheckSessionService }, { token: i2.CheckAuthService }, { token: i3.UserService }, { token: i4.TokenHelperService }, { token: i5.ConfigurationProvider }, { token: i6.AuthStateService }, { token: i7.FlowsDataService }, { token: i8.CallbackService }, { token: i9.LogoffRevocationService }, { token: i10.LoginService }, { token: i11.RefreshSessionService }, { token: i12.UrlService }], target: i0.ɵɵFactoryTarget.Injectable });
OidcSecurityService.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: OidcSecurityService });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: OidcSecurityService, decorators: [{
            type: Injectable
        }], ctorParameters: function () { return [{ type: i1.CheckSessionService }, { type: i2.CheckAuthService }, { type: i3.UserService }, { type: i4.TokenHelperService }, { type: i5.ConfigurationProvider }, { type: i6.AuthStateService }, { type: i7.FlowsDataService }, { type: i8.CallbackService }, { type: i9.LogoffRevocationService }, { type: i10.LoginService }, { type: i11.RefreshSessionService }, { type: i12.UrlService }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib2lkYy5zZWN1cml0eS5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vcHJvamVjdHMvYW5ndWxhci1hdXRoLW9pZGMtY2xpZW50L3NyYy9saWIvb2lkYy5zZWN1cml0eS5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7Ozs7Ozs7Ozs7Ozs7O0FBc0IzQyxNQUFNLE9BQU8sbUJBQW1CO0lBdUM5QixZQUNVLG1CQUF3QyxFQUN4QyxnQkFBa0MsRUFDbEMsV0FBd0IsRUFDeEIsa0JBQXNDLEVBQ3RDLHFCQUE0QyxFQUM1QyxnQkFBa0MsRUFDbEMsZ0JBQWtDLEVBQ2xDLGVBQWdDLEVBQ2hDLHVCQUFnRCxFQUNoRCxZQUEwQixFQUMxQixxQkFBNEMsRUFDNUMsVUFBc0I7UUFYdEIsd0JBQW1CLEdBQW5CLG1CQUFtQixDQUFxQjtRQUN4QyxxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQWtCO1FBQ2xDLGdCQUFXLEdBQVgsV0FBVyxDQUFhO1FBQ3hCLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBb0I7UUFDdEMsMEJBQXFCLEdBQXJCLHFCQUFxQixDQUF1QjtRQUM1QyxxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQWtCO1FBQ2xDLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBa0I7UUFDbEMsb0JBQWUsR0FBZixlQUFlLENBQWlCO1FBQ2hDLDRCQUF1QixHQUF2Qix1QkFBdUIsQ0FBeUI7UUFDaEQsaUJBQVksR0FBWixZQUFZLENBQWM7UUFDMUIsMEJBQXFCLEdBQXJCLHFCQUFxQixDQUF1QjtRQUM1QyxlQUFVLEdBQVYsVUFBVSxDQUFZO0lBQzdCLENBQUM7SUFuREo7Ozs7O09BS0c7SUFDSCxJQUFJLFNBQVM7UUFDWCxPQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDO0lBQ3BDLENBQUM7SUFFRDs7Ozs7Ozs7T0FRRztJQUNILElBQUksZ0JB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Q0FBQyx1QkFBdUIsQ0FBQyxrQkFBa0IsQ0FBQyxRQUFRLEVBQUUsWUFBWSxDQUFDLENBQUM7SUFDakYsQ0FBQztJQUVEOzs7Ozs7O09BT0c7SUFDSCxnQkFBZ0IsQ0FBQyxZQUF5RCxFQUFFLFFBQWlCO1FBQzNGLFFBQVEsR0FBRyxRQUFRLElBQUksSUFBSSxDQUFDLHFCQUFxQixDQUFDLHNCQUFzQixDQUFDLFFBQVEsQ0FBQyxDQUFDLFFBQVEsQ0FBQztRQUU1RixPQUFPLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLEVBQUUsWUFBWSxDQUFDLENBQUM7SUFDL0UsQ0FBQztJQUVEOzs7Ozs7O09BT0c7SUFDSCxlQUFlLENBQUMsWUFBeUQsRUFBRSxRQUFpQjtRQUMxRixRQUFRLEdBQUcsUUFBUSxJQUFJLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxzQkFBc0IsQ0FBQyxRQUFRLENBQUMsQ0FBQyxRQUFRLENBQUM7UUFFNUYsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLGVBQWUsQ0FBQyxRQUFRLEVBQUUsWUFBWSxDQUFDLENBQUM7SUFDakUsQ0FBQzs7Z0hBelhVLG1CQUFtQjtvSEFBbkIsbUJBQW1COzJGQUFuQixtQkFBbUI7a0JBRC9CLFVBQVUiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJbmplY3RhYmxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBPYnNlcnZhYmxlIH0gZnJvbSAncnhqcyc7XG5pbXBvcnQgeyBBdXRoT3B0aW9ucyB9IGZyb20gJy4vYXV0aC1vcHRpb25zJztcbmltcG9ydCB7IEF1dGhlbnRpY2F0ZWRSZXN1bHQgfSBmcm9tICcuL2F1dGgtc3RhdGUvYXV0aC1yZXN1bHQnO1xuaW1wb3J0IHsgQXV0aFN0YXRlU2VydmljZSB9IGZyb20gJy4vYXV0aC1zdGF0ZS9hdXRoLXN0YXRlLnNlcnZpY2UnO1xuaW1wb3J0IHsgQ2FsbGJhY2tTZXJ2aWNlIH0gZnJvbSAnLi9jYWxsYmFjay9jYWxsYmFjay5zZXJ2aWNlJztcbmltcG9ydCB7IFJlZnJlc2hTZXNzaW9uU2VydmljZSB9IGZyb20gJy4vY2FsbGJhY2svcmVmcmVzaC1zZXNzaW9uLnNlcnZpY2UnO1xuaW1wb3J0IHsgQ2hlY2tBdXRoU2VydmljZSB9IGZyb20gJy4vY2hlY2stYXV0aC5zZXJ2aWNlJztcbmltcG9ydCB7IE9wZW5JZENvbmZpZ3VyYXRpb24gfSBmcm9tICcuL2NvbmZpZy9vcGVuaWQtY29uZmlndXJhdGlvbic7XG5pbXBvcnQgeyBDb25maWd1cmF0aW9uUHJvdmlkZXIgfSBmcm9tICcuL2NvbmZpZy9wcm92aWRlci9jb25maWcucHJvdmlkZXInO1xuaW1wb3J0IHsgRmxvd3NEYXRhU2VydmljZSB9IGZyb20gJy4vZmxvd3MvZmxvd3MtZGF0YS5zZXJ2aWNlJztcbmltcG9ydCB7IENoZWNrU2Vzc2lvblNlcnZpY2UgfSBmcm9tICcuL2lmcmFtZS9jaGVjay1zZXNzaW9uLnNlcnZpY2UnO1xuaW1wb3J0IHsgTG9naW5SZXNwb25zZSB9IGZyb20gJy4vbG9naW4vbG9naW4tcmVzcG9uc2UnO1xuaW1wb3J0IHsgTG9naW5TZXJ2aWNlIH0gZnJvbSAnLi9sb2dpbi9sb2dpbi5zZXJ2aWNlJztcbmltcG9ydCB7IFBvcHVwT3B0aW9ucyB9IGZyb20gJy4vbG9naW4vcG9wdXAvcG9wdXAtb3B0aW9ucyc7XG5pbXBvcnQgeyBMb2dvZmZSZXZvY2F0aW9uU2VydmljZSB9IGZyb20gJy4vbG9nb2ZmLXJldm9rZS9sb2dvZmYtcmV2b2NhdGlvbi5zZXJ2aWNlJztcbmltcG9ydCB7IFVzZXJTZXJ2aWNlIH0gZnJvbSAnLi91c2VyLWRhdGEvdXNlci5zZXJ2aWNlJztcbmltcG9ydCB7IFVzZXJEYXRhUmVzdWx0IH0gZnJvbSAnLi91c2VyLWRhdGEvdXNlcmRhdGEtcmVzdWx0JztcbmltcG9ydCB7IFRva2VuSGVscGVyU2VydmljZSB9IGZyb20gJy4vdXRpbHMvdG9rZW5IZWxwZXIvdG9rZW4taGVscGVyLnNlcnZpY2UnO1xuaW1wb3J0IHsgVXJsU2VydmljZSB9IGZyb20gJy4vdXRpbHMvdXJsL3VybC5zZXJ2aWNlJztcblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIE9pZGNTZWN1cml0eVNlcnZpY2Uge1xuICAvKipcbiAgICogUHJvdmlkZXMgaW5mb3JtYXRpb24gYWJvdXQgdGhlIHVzZXIgYWZ0ZXIgdGhleSBoYXZlIGxvZ2dlZCBpbi5cbiAgICpcbiAgICogQHJldHVybnMgUmV0dXJucyBhbiBvYmplY3QgY29udGFpbmluZyBlaXRoZXIgdGhlIHVzZXIgZGF0YSBkaXJlY3RseSAoc2luZ2xlIGNvbmZpZykgb3JcbiAgICogdGhlIHVzZXIgZGF0YSBwZXIgY29uZmlnIGluIGNhc2UgeW91IGFyZSBydW5uaW5nIHdpdGggbXVsdGlwbGUgY29uZmlnc1xuICAgKi9cbiAgZ2V0IHVzZXJEYXRhJCgpOiBPYnNlcnZhYmxlPFVzZXJEYXRhUmVzdWx0PiB7XG4gICAgcmV0dXJuIHRoaXMudXNlclNlcnZpY2UudXNlckRhdGEkO1xuICB9XG5cbiAgLyoqXG4gICAqIEVtaXRzIGVhY2ggdGltZSBhbiBhdXRob3JpemF0aW9uIGV2ZW50IG9jY3Vycy5cbiAgICpcbiAgICogQHJldHVybnMgUmV0dXJucyBhbiBvYmplY3QgY29udGFpbmluZyBpZiB5b3UgYXJlIGF1dGhlbnRpY2F0ZWQgb3Igbm90LlxuICAgKiBTaW5nbGUgQ29uZmlnOiB0cnVlIGlmIGNvbmZpZyBpcyBhdXRoZW50aWNhdGVkLCBmYWxzZSBpZiBub3QuXG4gICAqIE11bHRpcGxlIENvbmZpZ3M6IHRydWUgaXMgYWxsIGNvbmZpZ3MgYXJlIGF1dGhlbnRpY2F0ZWQsIGZhbHNlIGlmIG9ubHkgb25lIG9mIHRoZW0gaXMgbm90XG4gICAqXG4gICAqIFRoZSBgYWxsQ29uZmlnc0F1dGhlbnRpY2F0ZWRgIHByb3BlcnR5IGNvbnRhaW5zIHRoZSBhdXRoIGluZm9ybWF0aW9uIF9wZXIgY29uZmlnXy5cbiAgICovXG4gIGdldCBpc0F1dGhlbnRpY2F0ZWQkKCk6IE9ic2VydmFibGU8QXV0aGVudGljYXRlZFJlc3VsdD4ge1xuICAgIHJldHVybiB0aGlzLmF1dGhTdGF0ZVNlcnZpY2UuYXV0aGVudGljYXRlZCQ7XG4gIH1cblxuICAvKipcbiAgICogRW1pdHMgZWFjaCB0aW1lIHRoZSBzZXJ2ZXIgc2VuZHMgYSBDaGVja1Nlc3Npb24gZXZlbnQgYW5kIHRoZSB2YWx1ZSBjaGFuZ2VkLiBUaGlzIHByb3BlcnR5IHdpbGwgYWx3YXlzIHJldHVyblxuICAgKiB0cnVlLlxuICAgKi9cbiAgZ2V0IGNoZWNrU2Vzc2lvbkNoYW5nZWQkKCk6IE9ic2VydmFibGU8Ym9vbGVhbj4ge1xuICAgIHJldHVybiB0aGlzLmNoZWNrU2Vzc2lvblNlcnZpY2UuY2hlY2tTZXNzaW9uQ2hhbmdlZCQ7XG4gIH1cblxuICAvKipcbiAgICogRW1pdHMgb24gYSBTZWN1cml0eSBUb2tlbiBTZXJ2aWNlIGNhbGxiYWNrLiBUaGUgb2JzZXJ2YWJsZSB3aWxsIG5ldmVyIGNvbnRhaW4gYSB2YWx1ZS5cbiAgICovXG4gIGdldCBzdHNDYWxsYmFjayQoKTogT2JzZXJ2YWJsZTxhbnk+IHtcbiAgICByZXR1cm4gdGhpcy5jYWxsYmFja1NlcnZpY2Uuc3RzQ2FsbGJhY2skO1xuICB9XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSBjaGVja1Nlc3Npb25TZXJ2aWNlOiBDaGVja1Nlc3Npb25TZXJ2aWNlLFxuICAgIHByaXZhdGUgY2hlY2tBdXRoU2VydmljZTogQ2hlY2tBdXRoU2VydmljZSxcbiAgICBwcml2YXRlIHVzZXJTZXJ2aWNlOiBVc2VyU2VydmljZSxcbiAgICBwcml2YXRlIHRva2VuSGVscGVyU2VydmljZTogVG9rZW5IZWxwZXJTZXJ2aWNlLFxuICAgIHByaXZhdGUgY29uZmlndXJhdGlvblByb3ZpZGVyOiBDb25maWd1cmF0aW9uUHJvdmlkZXIsXG4gICAgcHJpdmF0ZSBhdXRoU3RhdGVTZXJ2aWNlOiBBdXRoU3RhdGVTZXJ2aWNlLFxuICAgIHByaXZhdGUgZmxvd3NEYXRhU2VydmljZTogRmxvd3NEYXRhU2VydmljZSxcbiAgICBwcml2YXRlIGNhbGxiYWNrU2VydmljZTogQ2FsbGJhY2tTZXJ2aWNlLFxuICAgIHByaXZhdGUgbG9nb2ZmUmV2b2NhdGlvblNlcnZpY2U6IExvZ29mZlJldm9jYXRpb25TZXJ2aWNlLFxuICAgIHByaXZhdGUgbG9naW5TZXJ2aWNlOiBMb2dpblNlcnZpY2UsXG4gICAgcHJpdmF0ZSByZWZyZXNoU2Vzc2lvblNlcnZpY2U6IFJlZnJlc2hTZXNzaW9uU2VydmljZSxcbiAgICBwcml2YXRlIHVybFNlcnZpY2U6IFVybFNlcnZpY2VcbiAgKSB7fVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBjdXJyZW50bHkgYWN0aXZlIE9wZW5JRCBjb25maWd1cmF0aW9ucy5cbiAgICpcbiAgICogQHJldHVybnMgYW4gYXJyYXkgb2YgT3BlbklkQ29uZmlndXJhdGlvbnMuXG4gICAqL1xuICBnZXRDb25maWd1cmF0aW9ucygpOiBPcGVuSWRDb25maWd1cmF0aW9uW10ge1xuICAgIHJldHVybiB0aGlzLmNvbmZpZ3VyYXRpb25Qcm92aWRlci5nZXRBbGxDb25maWd1cmF0aW9ucygpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBzaW5nbGUgYWN0aXZlIE9wZW5JZENvbmZpZ3VyYXRpb24uXG4gICAqXG4gICAqIEBwYXJhbSBjb25maWdJZCBUaGUgY29uZmlnSWQgdG8gaWRlbnRpZnkgdGhlIGNvbmZpZy4gSWYgbm90IHBhc3NlZCwgdGhlIGZpcnN0IG9uZSBpcyBiZWluZyByZXR1cm5lZFxuICAgKi9cbiAgZ2V0Q29uZmlndXJhdGlvbihjb25maWdJZD86IHN0cmluZyk6IE9wZW5JZENvbmZpZ3VyYXRpb24ge1xuICAgIGNvbmZpZ0lkID0gY29uZmlnSWQgPz8gdGhpcy5jb25maWd1cmF0aW9uUHJvdmlkZXIuZ2V0T3BlbklEQ29uZmlndXJhdGlvbigpLmNvbmZpZ0lkO1xuXG4gICAgcmV0dXJuIHRoaXMuY29uZmlndXJhdGlvblByb3ZpZGVyLmdldE9wZW5JRENvbmZpZ3VyYXRpb24oY29uZmlnSWQpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIHVzZXJEYXRhIGZvciBhIGNvbmZpZ3VyYXRpb25cbiAgICpcbiAgICogQHBhcmFtIGNvbmZpZ0lkIFRoZSBjb25maWdJZCB0byBpZGVudGlmeSB0aGUgY29uZmlnLiBJZiBub3QgcGFzc2VkLCB0aGUgZmlyc3Qgb25lIGlzIGJlaW5nIHVzZWRcbiAgICovXG4gIGdldFVzZXJEYXRhKGNvbmZpZ0lkPzogc3RyaW5nKTogYW55IHtcbiAgICBjb25maWdJZCA9IGNvbmZpZ0lkID8/IHRoaXMuY29uZmlndXJhdGlvblByb3ZpZGVyLmdldE9wZW5JRENvbmZpZ3VyYXRpb24oKS5jb25maWdJZDtcblxuICAgIHJldHVybiB0aGlzLnVzZXJTZXJ2aWNlLmdldFVzZXJEYXRhRnJvbVN0b3JlKGNvbmZpZ0lkKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTdGFydHMgdGhlIGNvbXBsZXRlIHNldHVwIGZsb3cgZm9yIG9uZSBjb25maWd1cmF0aW9uLiBDYWxsaW5nIHdpbGwgc3RhcnQgdGhlIGVudGlyZSBhdXRoZW50aWNhdGlvbiBmbG93LCBhbmQgdGhlIHJldHVybmVkIG9ic2VydmFibGVcbiAgICogd2lsbCBkZW5vdGUgd2hldGhlciB0aGUgdXNlciB3YXMgc3VjY2Vzc2Z1bGx5IGF1dGhlbnRpY2F0ZWQgaW5jbHVkaW5nIHRoZSB1c2VyIGRhdGEsIHRoZSBhY2Nlc3MgdG9rZW4sIHRoZSBjb25maWdJZCBhbmRcbiAgICogYW4gZXJyb3IgbWVzc2FnZSBpbiBjYXNlIGFuIGVycm9yIGhhcHBlbmVkXG4gICAqXG4gICAqIEBwYXJhbSB1cmwgVGhlIFVSTCB0byBwZXJmb3JtIHRoZSBhdXRob3JpemF0aW9uIG9uIHRoZSBiZWhhbGYgb2YuXG4gICAqIEBwYXJhbSBjb25maWdJZCBUaGUgY29uZmlnSWQgdG8gcGVyZm9ybSB0aGUgYXV0aG9yaXphdGlvbiBvbiB0aGUgYmVoYWxmIG9mLiBJZiBub3QgcGFzc2VkLCB0aGUgZmlyc3QgY29uZmlncyB3aWxsIGJlIHRha2VuXG4gICAqXG4gICAqIEByZXR1cm5zIEFuIG9iamVjdCBgTG9naW5SZXNwb25zZWAgY29udGFpbmluZyBhbGwgaW5mb3JtYXRpb24gYWJvdXQgdGhlIGxvZ2luXG4gICAqL1xuICBjaGVja0F1dGgodXJsPzogc3RyaW5nLCBjb25maWdJZD86IHN0cmluZyk6IE9ic2VydmFibGU8TG9naW5SZXNwb25zZT4ge1xuICAgIHJldHVybiB0aGlzLmNoZWNrQXV0aFNlcnZpY2UuY2hlY2tBdXRoKGNvbmZpZ0lkLCB1cmwpO1xuICB9XG5cbiAgLyoqXG4gICAqIFN0YXJ0cyB0aGUgY29tcGxldGUgc2V0dXAgZmxvdyBmb3IgbXVsdGlwbGUgY29uZmlndXJhdGlvbnMuXG4gICAqIENhbGxpbmcgd2lsbCBzdGFydCB0aGUgZW50aXJlIGF1dGhlbnRpY2F0aW9uIGZsb3csIGFuZCB0aGUgcmV0dXJuZWQgb2JzZXJ2YWJsZVxuICAgKiB3aWxsIGRlbm90ZSB3aGV0aGVyIHRoZSB1c2VyIHdhcyBzdWNjZXNzZnVsbHkgYXV0aGVudGljYXRlZCBpbmNsdWRpbmcgdGhlIHVzZXIgZGF0YSwgdGhlIGFjY2VzcyB0b2tlbiwgdGhlIGNvbmZpZ0lkIGFuZFxuICAgKiBhbiBlcnJvciBtZXNzYWdlIGluIGNhc2UgYW4gZXJyb3IgaGFwcGVuZWQgaW4gYW4gYXJyYXkgZm9yIGVhY2ggY29uZmlnIHdoaWNoIHdhcyBwcm92aWRlZFxuICAgKlxuICAgKiBAcGFyYW0gdXJsIFRoZSBVUkwgdG8gcGVyZm9ybSB0aGUgYXV0aG9yaXphdGlvbiBvbiB0aGUgYmVoYWxmIG9mLlxuICAgKiBAcGFyYW0gY29uZmlnSWQgVGhlIGNvbmZpZ0lkIHRvIHBlcmZvcm0gdGhlIGF1dGhvcml6YXRpb24gb24gdGhlIGJlaGFsZiBvZi4gSWYgbm90IHBhc3NlZCwgYWxsIG9mIHRoZSBjdXJyZW50XG4gICAqIGNvbmZpZ3VyZWQgb25lcyB3aWxsIGJlIHVzZWQgdG8gY2hlY2suXG4gICAqXG4gICAqIEByZXR1cm5zIEFuIGFycmF5IG9mIGBMb2dpblJlc3BvbnNlYCBvYmplY3RzIGNvbnRhaW5pbmcgYWxsIGluZm9ybWF0aW9uIGFib3V0IHRoZSBsb2dpbnNcbiAgICovXG4gIGNoZWNrQXV0aE11bHRpcGxlKHVybD86IHN0cmluZywgY29uZmlnSWQ/OiBzdHJpbmcpOiBPYnNlcnZhYmxlPExvZ2luUmVzcG9uc2VbXT4ge1xuICAgIHJldHVybiB0aGlzLmNoZWNrQXV0aFNlcnZpY2UuY2hlY2tBdXRoTXVsdGlwbGUoY29uZmlnSWQsIHVybCk7XG4gIH1cblxuICAvKipcbiAgICogUHJvdmlkZXMgaW5mb3JtYXRpb24gYWJvdXQgdGhlIGN1cnJlbnQgYXV0aGVudGljYXRlZCBzdGF0ZVxuICAgKlxuICAgKiBAcGFyYW0gY29uZmlnSWQgVGhlIGNvbmZpZ0lkIHRvIGNoZWNrIHRoZSBpbmZvcm1hdGlvbiBmb3IuIElmIG5vdCBwYXNzZWQsIHRoZSBmaXJzdCBjb25maWdzIHdpbGwgYmUgdGFrZW5cbiAgICpcbiAgICogQHJldHVybnMgQSBib29sZWFuIHdoZXRoZXIgdGhlIGNvbmZpZyBpcyBhdXRoZW50aWNhdGVkIG9yIG5vdC5cbiAgICovXG4gIGlzQXV0aGVudGljYXRlZChjb25maWdJZD86IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIGNvbmZpZ0lkID0gY29uZmlnSWQgPz8gdGhpcy5jb25maWd1cmF0aW9uUHJvdmlkZXIuZ2V0T3BlbklEQ29uZmlndXJhdGlvbihjb25maWdJZCkuY29uZmlnSWQ7XG5cbiAgICByZXR1cm4gdGhpcy5hdXRoU3RhdGVTZXJ2aWNlLmlzQXV0aGVudGljYXRlZChjb25maWdJZCk7XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2tzIHRoZSBzZXJ2ZXIgZm9yIGFuIGF1dGhlbnRpY2F0ZWQgc2Vzc2lvbiB1c2luZyB0aGUgaWZyYW1lIHNpbGVudCByZW5ldyBpZiBub3QgbG9jYWxseSBhdXRoZW50aWNhdGVkLlxuICAgKi9cbiAgY2hlY2tBdXRoSW5jbHVkaW5nU2VydmVyKGNvbmZpZ0lkPzogc3RyaW5nKTogT2JzZXJ2YWJsZTxMb2dpblJlc3BvbnNlPiB7XG4gICAgY29uZmlnSWQgPSBjb25maWdJZCA/PyB0aGlzLmNvbmZpZ3VyYXRpb25Qcm92aWRlci5nZXRPcGVuSURDb25maWd1cmF0aW9uKGNvbmZpZ0lkKS5jb25maWdJZDtcblxuICAgIHJldHVybiB0aGlzLmNoZWNrQXV0aFNlcnZpY2UuY2hlY2tBdXRoSW5jbHVkaW5nU2VydmVyKGNvbmZpZ0lkKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBhY2Nlc3MgdG9rZW4gZm9yIHRoZSBsb2dpbiBzY2VuYXJpby5cbiAgICpcbiAgICogQHBhcmFtIGNvbmZpZ0lkIFRoZSBjb25maWdJZCB0byBjaGVjayB0aGUgaW5mb3JtYXRpb24gZm9yLiBJZiBub3QgcGFzc2VkLCB0aGUgZmlyc3QgY29uZmlncyB3aWxsIGJlIHRha2VuXG4gICAqXG4gICAqIEByZXR1cm5zIEEgc3RyaW5nIHdpdGggdGhlIGFjY2VzcyB0b2tlbi5cbiAgICovXG4gIGdldEFjY2Vzc1Rva2VuKGNvbmZpZ0lkPzogc3RyaW5nKTogc3RyaW5nIHtcbiAgICBjb25maWdJZCA9IGNvbmZpZ0lkID8/IHRoaXMuY29uZmlndXJhdGlvblByb3ZpZGVyLmdldE9wZW5JRENvbmZpZ3VyYXRpb24oY29uZmlnSWQpLmNvbmZpZ0lkO1xuXG4gICAgcmV0dXJuIHRoaXMuYXV0aFN0YXRlU2VydmljZS5nZXRBY2Nlc3NUb2tlbihjb25maWdJZCk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgSUQgdG9rZW4gZm9yIHRoZSBzaWduLWluLlxuICAgKlxuICAgKiBAcGFyYW0gY29uZmlnSWQgVGhlIGNvbmZpZ0lkIHRvIGNoZWNrIHRoZSBpbmZvcm1hdGlvbiBmb3IuIElmIG5vdCBwYXNzZWQsIHRoZSBmaXJzdCBjb25maWdzIHdpbGwgYmUgdGFrZW5cbiAgICpcbiAgICogQHJldHVybnMgQSBzdHJpbmcgd2l0aCB0aGUgaWQgdG9rZW4uXG4gICAqL1xuICBnZXRJZFRva2VuKGNvbmZpZ0lkPzogc3RyaW5nKTogc3RyaW5nIHtcbiAgICBjb25maWdJZCA9IGNvbmZpZ0lkID8/IHRoaXMuY29uZmlndXJhdGlvblByb3ZpZGVyLmdldE9wZW5JRENvbmZpZ3VyYXRpb24oY29uZmlnSWQpLmNvbmZpZ0lkO1xuXG4gICAgcmV0dXJuIHRoaXMuYXV0aFN0YXRlU2VydmljZS5nZXRJZFRva2VuKGNvbmZpZ0lkKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSByZWZyZXNoIHRva2VuLCBpZiBwcmVzZW50LCBmb3IgdGhlIHNpZ24taW4uXG4gICAqXG4gICAqIEBwYXJhbSBjb25maWdJZCBUaGUgY29uZmlnSWQgdG8gY2hlY2sgdGhlIGluZm9ybWF0aW9uIGZvci4gSWYgbm90IHBhc3NlZCwgdGhlIGZpcnN0IGNvbmZpZ3Mgd2lsbCBiZSB0YWtlblxuICAgKlxuICAgKiBAcmV0dXJucyBBIHN0cmluZyB3aXRoIHRoZSByZWZyZXNoIHRva2VuLlxuICAgKi9cbiAgZ2V0UmVmcmVzaFRva2VuKGNvbmZpZ0lkPzogc3RyaW5nKTogc3RyaW5nIHtcbiAgICBjb25maWdJZCA9IGNvbmZpZ0lkID8/IHRoaXMuY29uZmlndXJhdGlvblByb3ZpZGVyLmdldE9wZW5JRENvbmZpZ3VyYXRpb24oY29uZmlnSWQpLmNvbmZpZ0lkO1xuXG4gICAgcmV0dXJuIHRoaXMuYXV0aFN0YXRlU2VydmljZS5nZXRSZWZyZXNoVG9rZW4oY29uZmlnSWQpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGF1dGhlbnRpY2F0aW9uIHJlc3VsdCwgaWYgcHJlc2VudCwgZm9yIHRoZSBzaWduLWluLlxuICAgKlxuICAgKiBAcGFyYW0gY29uZmlnSWQgVGhlIGNvbmZpZ0lkIHRvIGNoZWNrIHRoZSBpbmZvcm1hdGlvbiBmb3IuIElmIG5vdCBwYXNzZWQsIHRoZSBmaXJzdCBjb25maWdzIHdpbGwgYmUgdGFrZW5cbiAgICpcbiAgICogQHJldHVybnMgQSBvYmplY3Qgd2l0aCB0aGUgYXV0aGVudGljYXRpb24gcmVzdWx0XG4gICAqL1xuICBnZXRBdXRoZW50aWNhdGlvblJlc3VsdChjb25maWdJZD86IHN0cmluZyk6IGFueSB7XG4gICAgY29uZmlnSWQgPSBjb25maWdJZCA/PyB0aGlzLmNvbmZpZ3VyYXRpb25Qcm92aWRlci5nZXRPcGVuSURDb25maWd1cmF0aW9uKGNvbmZpZ0lkKS5jb25maWdJZDtcblxuICAgIHJldHVybiB0aGlzLmF1dGhTdGF0ZVNlcnZpY2UuZ2V0QXV0aGVudGljYXRpb25SZXN1bHQoY29uZmlnSWQpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIHBheWxvYWQgZnJvbSB0aGUgSUQgdG9rZW4uXG4gICAqXG4gICAqIEBwYXJhbSBlbmNvZGUgU2V0IHRvIHRydWUgaWYgdGhlIHBheWxvYWQgaXMgYmFzZTY0IGVuY29kZWRcbiAgICogQHBhcmFtIGNvbmZpZ0lkIFRoZSBjb25maWdJZCB0byBjaGVjayB0aGUgaW5mb3JtYXRpb24gZm9yLiBJZiBub3QgcGFzc2VkLCB0aGUgZmlyc3QgY29uZmlncyB3aWxsIGJlIHRha2VuXG4gICAqXG4gICAqIEByZXR1cm5zIFRoZSBwYXlsb2FkIGZyb20gdGhlIGlkIHRva2VuLlxuICAgKi9cbiAgZ2V0UGF5bG9hZEZyb21JZFRva2VuKGVuY29kZSA9IGZhbHNlLCBjb25maWdJZD86IHN0cmluZyk6IGFueSB7XG4gICAgY29uZmlnSWQgPSBjb25maWdJZCA/PyB0aGlzLmNvbmZpZ3VyYXRpb25Qcm92aWRlci5nZXRPcGVuSURDb25maWd1cmF0aW9uKGNvbmZpZ0lkKS5jb25maWdJZDtcbiAgICBjb25zdCB0b2tlbiA9IHRoaXMuYXV0aFN0YXRlU2VydmljZS5nZXRJZFRva2VuKGNvbmZpZ0lkKTtcblxuICAgIHJldHVybiB0aGlzLnRva2VuSGVscGVyU2VydmljZS5nZXRQYXlsb2FkRnJvbVRva2VuKHRva2VuLCBlbmNvZGUsIGNvbmZpZ0lkKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIGEgY3VzdG9tIHN0YXRlIGZvciB0aGUgYXV0aG9yaXplIHJlcXVlc3QuXG4gICAqXG4gICAqIEBwYXJhbSBzdGF0ZSBUaGUgc3RhdGUgdG8gc2V0LlxuICAgKiBAcGFyYW0gY29uZmlnSWQgVGhlIGNvbmZpZ0lkIHRvIGNoZWNrIHRoZSBpbmZvcm1hdGlvbiBmb3IuIElmIG5vdCBwYXNzZWQsIHRoZSBmaXJzdCBjb25maWdzIHdpbGwgYmUgdGFrZW5cbiAgICovXG4gIHNldFN0YXRlKHN0YXRlOiBzdHJpbmcsIGNvbmZpZ0lkPzogc3RyaW5nKTogdm9pZCB7XG4gICAgY29uZmlnSWQgPSBjb25maWdJZCA/PyB0aGlzLmNvbmZpZ3VyYXRpb25Qcm92aWRlci5nZXRPcGVuSURDb25maWd1cmF0aW9uKGNvbmZpZ0lkKS5jb25maWdJZDtcblxuICAgIHRoaXMuZmxvd3NEYXRhU2VydmljZS5zZXRBdXRoU3RhdGVDb250cm9sKHN0YXRlLCBjb25maWdJZCk7XG4gIH1cblxuICAvKipcbiAgICogR2V0cyB0aGUgc3RhdGUgdmFsdWUgdXNlZCBmb3IgdGhlIGF1dGhvcml6ZSByZXF1ZXN0LlxuICAgKlxuICAgKiBAcGFyYW0gY29uZmlnSWQgVGhlIGNvbmZpZ0lkIHRvIGNoZWNrIHRoZSBpbmZvcm1hdGlvbiBmb3IuIElmIG5vdCBwYXNzZWQsIHRoZSBmaXJzdCBjb25maWdzIHdpbGwgYmUgdGFrZW5cbiAgICpcbiAgICogQHJldHVybnMgVGhlIHN0YXRlIHZhbHVlIHVzZWQgZm9yIHRoZSBhdXRob3JpemUgcmVxdWVzdC5cbiAgICovXG4gIGdldFN0YXRlKGNvbmZpZ0lkPzogc3RyaW5nKTogc3RyaW5nIHtcbiAgICBjb25maWdJZCA9IGNvbmZpZ0lkID8/IHRoaXMuY29uZmlndXJhdGlvblByb3ZpZGVyLmdldE9wZW5JRENvbmZpZ3VyYXRpb24oY29uZmlnSWQpLmNvbmZpZ0lkO1xuXG4gICAgcmV0dXJuIHRoaXMuZmxvd3NEYXRhU2VydmljZS5nZXRBdXRoU3RhdGVDb250cm9sKGNvbmZpZ0lkKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZWRpcmVjdHMgdGhlIHVzZXIgdG8gdGhlIFNlY3VyaXR5IFRva2VuIFNlcnZpY2UgdG8gYmVnaW4gdGhlIGF1dGhlbnRpY2F0aW9uIHByb2Nlc3MuXG4gICAqXG4gICAqIEBwYXJhbSBjb25maWdJZCBUaGUgY29uZmlnSWQgdG8gcGVyZm9ybSB0aGUgYWN0aW9uIGluIGJlaGFsZiBvZi4gSWYgbm90IHBhc3NlZCwgdGhlIGZpcnN0IGNvbmZpZ3Mgd2lsbCBiZSB0YWtlblxuICAgKiBAcGFyYW0gYXV0aE9wdGlvbnMgVGhlIGN1c3RvbSBvcHRpb25zIGZvciB0aGUgdGhlIGF1dGhlbnRpY2F0aW9uIHJlcXVlc3QuXG4gICAqL1xuICBhdXRob3JpemUoY29uZmlnSWQ/OiBzdHJpbmcsIGF1dGhPcHRpb25zPzogQXV0aE9wdGlvbnMpOiB2b2lkIHtcbiAgICBjb25maWdJZCA9IGNvbmZpZ0lkID8/IHRoaXMuY29uZmlndXJhdGlvblByb3ZpZGVyLmdldE9wZW5JRENvbmZpZ3VyYXRpb24oY29uZmlnSWQpLmNvbmZpZ0lkO1xuXG4gICAgdGhpcy5sb2dpblNlcnZpY2UubG9naW4oY29uZmlnSWQsIGF1dGhPcHRpb25zKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBPcGVucyB0aGUgU2VjdXJpdHkgVG9rZW4gU2VydmljZSBpbiBhIG5ldyB3aW5kb3cgdG8gYmVnaW4gdGhlIGF1dGhlbnRpY2F0aW9uIHByb2Nlc3MuXG4gICAqXG4gICAqIEBwYXJhbSBhdXRoT3B0aW9ucyBUaGUgY3VzdG9tIG9wdGlvbnMgZm9yIHRoZSBhdXRoZW50aWNhdGlvbiByZXF1ZXN0LlxuICAgKiBAcGFyYW0gcG9wdXBPcHRpb25zIFRoZSBjb25maWd1cmF0aW9uIGZvciB0aGUgcG9wdXAgd2luZG93LlxuICAgKiBAcGFyYW0gY29uZmlnSWQgVGhlIGNvbmZpZ0lkIHRvIHBlcmZvcm0gdGhlIGFjdGlvbiBpbiBiZWhhbGYgb2YuIElmIG5vdCBwYXNzZWQsIHRoZSBmaXJzdCBjb25maWdzIHdpbGwgYmUgdGFrZW5cbiAgICpcbiAgICogQHJldHVybnMgQW4gYE9ic2VydmFibGU8TG9naW5SZXNwb25zZT5gIGNvbnRhaW5pbmcgYWxsIGluZm9ybWF0aW9uIGFib3V0IHRoZSBsb2dpblxuICAgKi9cbiAgYXV0aG9yaXplV2l0aFBvcFVwKGF1dGhPcHRpb25zPzogQXV0aE9wdGlvbnMsIHBvcHVwT3B0aW9ucz86IFBvcHVwT3B0aW9ucywgY29uZmlnSWQ/OiBzdHJpbmcpOiBPYnNlcnZhYmxlPExvZ2luUmVzcG9uc2U+IHtcbiAgICBjb25maWdJZCA9IGNvbmZpZ0lkID8/IHRoaXMuY29uZmlndXJhdGlvblByb3ZpZGVyLmdldE9wZW5JRENvbmZpZ3VyYXRpb24oY29uZmlnSWQpLmNvbmZpZ0lkO1xuXG4gICAgcmV0dXJuIHRoaXMubG9naW5TZXJ2aWNlLmxvZ2luV2l0aFBvcFVwKGNvbmZpZ0lkLCBhdXRoT3B0aW9ucywgcG9wdXBPcHRpb25zKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBNYW51YWxseSByZWZyZXNoZXMgdGhlIHNlc3Npb24uXG4gICAqXG4gICAqIEBwYXJhbSBjdXN0b21QYXJhbXMgQ3VzdG9tIHBhcmFtZXRlcnMgdG8gcGFzcyB0byB0aGUgcmVmcmVzaCByZXF1ZXN0LlxuICAgKiBAcGFyYW0gY29uZmlnSWQgVGhlIGNvbmZpZ0lkIHRvIHBlcmZvcm0gdGhlIGFjdGlvbiBpbiBiZWhhbGYgb2YuIElmIG5vdCBwYXNzZWQsIHRoZSBmaXJzdCBjb25maWdzIHdpbGwgYmUgdGFrZW5cbiAgICpcbiAgICogQHJldHVybnMgQW4gYE9ic2VydmFibGU8TG9naW5SZXNwb25zZT5gIGNvbnRhaW5pbmcgYWxsIGluZm9ybWF0aW9uIGFib3V0IHRoZSBsb2dpblxuICAgKi9cbiAgZm9yY2VSZWZyZXNoU2Vzc2lvbihjdXN0b21QYXJhbXM/OiB7IFtrZXk6IHN0cmluZ106IHN0cmluZyB8IG51bWJlciB8IGJvb2xlYW4gfSwgY29uZmlnSWQ/OiBzdHJpbmcpOiBPYnNlcnZhYmxlPExvZ2luUmVzcG9uc2U+IHtcbiAgICBjb25maWdJZCA9IGNvbmZpZ0lkID8/IHRoaXMuY29uZmlndXJhdGlvblByb3ZpZGVyLmdldE9wZW5JRENvbmZpZ3VyYXRpb24oY29uZmlnSWQpLmNvbmZpZ0lkO1xuXG4gICAgcmV0dXJuIHRoaXMucmVmcmVzaFNlc3Npb25TZXJ2aWNlLnVzZXJGb3JjZVJlZnJlc2hTZXNzaW9uKGNvbmZpZ0lkLCBjdXN0b21QYXJhbXMpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldm9rZXMgdGhlIHJlZnJlc2ggdG9rZW4gKGlmIHByZXNlbnQpIGFuZCB0aGUgYWNjZXNzIHRva2VuIG9uIHRoZSBzZXJ2ZXIgYW5kIHRoZW4gcGVyZm9ybXMgdGhlIGxvZ29mZiBvcGVyYXRpb24uXG4gICAqIFRoZSByZWZyZXNoIHRva2VuIGFuZCBhbmQgdGhlIGFjY2VzcyB0b2tlbiBhcmUgcmV2b2tlZCBvbiB0aGUgc2VydmVyLiBJZiB0aGUgcmVmcmVzaCB0b2tlbiBkb2VzIG5vdCBleGlzdFxuICAgKiBvbmx5IHRoZSBhY2Nlc3MgdG9rZW4gaXMgcmV2b2tlZC4gVGhlbiB0aGUgbG9nb3V0IHJ1bi5cbiAgICpcbiAgICogQHBhcmFtIGNvbmZpZ0lkIFRoZSBjb25maWdJZCB0byBwZXJmb3JtIHRoZSBhY3Rpb24gaW4gYmVoYWxmIG9mLiBJZiBub3QgcGFzc2VkLCB0aGUgZmlyc3QgY29uZmlncyB3aWxsIGJlIHRha2VuXG4gICAqIEBwYXJhbSBhdXRoT3B0aW9ucyBUaGUgY3VzdG9tIG9wdGlvbnMgZm9yIHRoZSByZXF1ZXN0LlxuICAgKlxuICAgKiBAcmV0dXJucyBBbiBvYnNlcnZhYmxlIHdoZW4gdGhlIGFjdGlvbiBpcyBmaW5pc2hlZFxuICAgKi9cbiAgbG9nb2ZmQW5kUmV2b2tlVG9rZW5zKGNvbmZpZ0lkPzogc3RyaW5nLCBhdXRoT3B0aW9ucz86IEF1dGhPcHRpb25zKTogT2JzZXJ2YWJsZTxhbnk+IHtcbiAgICBjb25maWdJZCA9IGNvbmZpZ0lkID8/IHRoaXMuY29uZmlndXJhdGlvblByb3ZpZGVyLmdldE9wZW5JRENvbmZpZ3VyYXRpb24oY29uZmlnSWQpLmNvbmZpZ0lkO1xuXG4gICAgcmV0dXJuIHRoaXMubG9nb2ZmUmV2b2NhdGlvblNlcnZpY2UubG9nb2ZmQW5kUmV2b2tlVG9rZW5zKGNvbmZpZ0lkLCBhdXRoT3B0aW9ucyk7XG4gIH1cblxuICAvKipcbiAgICogTG9ncyBvdXQgb24gdGhlIHNlcnZlciBhbmQgdGhlIGxvY2FsIGNsaWVudC4gSWYgdGhlIHNlcnZlciBzdGF0ZSBoYXMgY2hhbmdlZCwgY29uZmlybWVkIHZpYSBjaGVjayBzZXNzaW9uLFxuICAgKiB0aGVuIG9ubHkgYSBsb2NhbCBsb2dvdXQgaXMgcGVyZm9ybWVkLlxuICAgKlxuICAgKiBAcGFyYW0gY29uZmlnSWQgVGhlIGNvbmZpZ0lkIHRvIHBlcmZvcm0gdGhlIGFjdGlvbiBpbiBiZWhhbGYgb2YuIElmIG5vdCBwYXNzZWQsIHRoZSBmaXJzdCBjb25maWdzIHdpbGwgYmUgdGFrZW5cbiAgICogQHBhcmFtIGF1dGhPcHRpb25zIHdpdGggY3VzdG9tIHBhcmFtZXRlcnMgYW5kL29yIGFuIGN1c3RvbSB1cmwgaGFuZGxlclxuICAgKi9cbiAgbG9nb2ZmKGNvbmZpZ0lkPzogc3RyaW5nLCBhdXRoT3B0aW9ucz86IEF1dGhPcHRpb25zKTogdm9pZCB7XG4gICAgY29uZmlnSWQgPSBjb25maWdJZCA/PyB0aGlzLmNvbmZpZ3VyYXRpb25Qcm92aWRlci5nZXRPcGVuSURDb25maWd1cmF0aW9uKGNvbmZpZ0lkKS5jb25maWdJZDtcblxuICAgIHJldHVybiB0aGlzLmxvZ29mZlJldm9jYXRpb25TZXJ2aWNlLmxvZ29mZihjb25maWdJZCwgYXV0aE9wdGlvbnMpO1xuICB9XG5cbiAgLyoqXG4gICAqIExvZ3MgdGhlIHVzZXIgb3V0IG9mIHRoZSBhcHBsaWNhdGlvbiB3aXRob3V0IGxvZ2dpbmcgdGhlbSBvdXQgb2YgdGhlIHNlcnZlci5cbiAgICogVXNlIHRoaXMgbWV0aG9kIGlmIHlvdSBoYXZlIF9vbmVfIGNvbmZpZyBlbmFibGVkLlxuICAgKlxuICAgKiBAcGFyYW0gY29uZmlnSWQgVGhlIGNvbmZpZ0lkIHRvIHBlcmZvcm0gdGhlIGFjdGlvbiBpbiBiZWhhbGYgb2YuIElmIG5vdCBwYXNzZWQsIHRoZSBmaXJzdCBjb25maWdzIHdpbGwgYmUgdGFrZW5cbiAgICovXG4gIGxvZ29mZkxvY2FsKGNvbmZpZ0lkPzogc3RyaW5nKTogdm9pZCB7XG4gICAgY29uZmlnSWQgPSBjb25maWdJZCA/PyB0aGlzLmNvbmZpZ3VyYXRpb25Qcm92aWRlci5nZXRPcGVuSURDb25maWd1cmF0aW9uKGNvbmZpZ0lkKS5jb25maWdJZDtcblxuICAgIHJldHVybiB0aGlzLmxvZ29mZlJldm9jYXRpb25TZXJ2aWNlLmxvZ29mZkxvY2FsKGNvbmZpZ0lkKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBMb2dzIHRoZSB1c2VyIG91dCBvZiB0aGUgYXBwbGljYXRpb24gZm9yIGFsbCBjb25maWdzIHdpdGhvdXQgbG9nZ2luZyB0aGVtIG91dCBvZiB0aGUgc2VydmVyLlxuICAgKiBVc2UgdGhpcyBtZXRob2QgaWYgeW91IGhhdmUgX211bHRpcGxlXyBjb25maWdzIGVuYWJsZWQuXG4gICAqL1xuICBsb2dvZmZMb2NhbE11bHRpcGxlKCk6IHZvaWQge1xuICAgIHJldHVybiB0aGlzLmxvZ29mZlJldm9jYXRpb25TZXJ2aWNlLmxvZ29mZkxvY2FsTXVsdGlwbGUoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXZva2VzIGFuIGFjY2VzcyB0b2tlbiBvbiB0aGUgU2VjdXJpdHkgVG9rZW4gU2VydmljZS4gVGhpcyBpcyBvbmx5IHJlcXVpcmVkIGluIHRoZSBjb2RlIGZsb3cgd2l0aCByZWZyZXNoIHRva2Vucy4gSWYgbm8gdG9rZW4gaXNcbiAgICogcHJvdmlkZWQsIHRoZW4gdGhlIHRva2VuIGZyb20gdGhlIHN0b3JhZ2UgaXMgcmV2b2tlZC4gWW91IGNhbiBwYXNzIGFueSB0b2tlbiB0byByZXZva2UuXG4gICAqIGh0dHBzOi8vdG9vbHMuaWV0Zi5vcmcvaHRtbC9yZmM3MDA5XG4gICAqXG4gICAqIEBwYXJhbSBhY2Nlc3NUb2tlbiBUaGUgYWNjZXNzIHRva2VuIHRvIHJldm9rZS5cbiAgICogQHBhcmFtIGNvbmZpZ0lkIFRoZSBjb25maWdJZCB0byBwZXJmb3JtIHRoZSBhY3Rpb24gaW4gYmVoYWxmIG9mLiBJZiBub3QgcGFzc2VkLCB0aGUgZmlyc3QgY29uZmlncyB3aWxsIGJlIHRha2VuXG4gICAqXG4gICAqIEByZXR1cm5zIEFuIG9ic2VydmFibGUgd2hlbiB0aGUgYWN0aW9uIGlzIGZpbmlzaGVkXG4gICAqL1xuICByZXZva2VBY2Nlc3NUb2tlbihhY2Nlc3NUb2tlbj86IGFueSwgY29uZmlnSWQ/OiBzdHJpbmcpOiBPYnNlcnZhYmxlPGFueT4ge1xuICAgIGNvbmZpZ0lkID0gY29uZmlnSWQgPz8gdGhpcy5jb25maWd1cmF0aW9uUHJvdmlkZXIuZ2V0T3BlbklEQ29uZmlndXJhdGlvbihjb25maWdJZCkuY29uZmlnSWQ7XG5cbiAgICByZXR1cm4gdGhpcy5sb2dvZmZSZXZvY2F0aW9uU2VydmljZS5yZXZva2VBY2Nlc3NUb2tlbihjb25maWdJZCwgYWNjZXNzVG9rZW4pO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldm9rZXMgYSByZWZyZXNoIHRva2VuIG9uIHRoZSBTZWN1cml0eSBUb2tlbiBTZXJ2aWNlLiBUaGlzIGlzIG9ubHkgcmVxdWlyZWQgaW4gdGhlIGNvZGUgZmxvdyB3aXRoIHJlZnJlc2ggdG9rZW5zLiBJZiBubyB0b2tlbiBpc1xuICAgKiBwcm92aWRlZCwgdGhlbiB0aGUgdG9rZW4gZnJvbSB0aGUgc3RvcmFnZSBpcyByZXZva2VkLiBZb3UgY2FuIHBhc3MgYW55IHRva2VuIHRvIHJldm9rZS5cbiAgICogaHR0cHM6Ly90b29scy5pZXRmLm9yZy9odG1sL3JmYzcwMDlcbiAgICpcbiAgICogQHBhcmFtIHJlZnJlc2hUb2tlbiBUaGUgYWNjZXNzIHRva2VuIHRvIHJldm9rZS5cbiAgICogQHBhcmFtIGNvbmZpZ0lkIFRoZSBjb25maWdJZCB0byBwZXJmb3JtIHRoZSBhY3Rpb24gaW4gYmVoYWxmIG9mLiBJZiBub3QgcGFzc2VkLCB0aGUgZmlyc3QgY29uZmlncyB3aWxsIGJlIHRha2VuXG4gICAqXG4gICAqIEByZXR1cm5zIEFuIG9ic2VydmFibGUgd2hlbiB0aGUgYWN0aW9uIGlzIGZpbmlzaGVkXG4gICAqL1xuICByZXZva2VSZWZyZXNoVG9rZW4ocmVmcmVzaFRva2VuPzogYW55LCBjb25maWdJZD86IHN0cmluZyk6IE9ic2VydmFibGU8YW55PiB7XG4gICAgY29uZmlnSWQgPSBjb25maWdJZCA/PyB0aGlzLmNvbmZpZ3VyYXRpb25Qcm92aWRlci5nZXRPcGVuSURDb25maWd1cmF0aW9uKGNvbmZpZ0lkKS5jb25maWdJZDtcblxuICAgIHJldHVybiB0aGlzLmxvZ29mZlJldm9jYXRpb25TZXJ2aWNlLnJldm9rZVJlZnJlc2hUb2tlbihjb25maWdJZCwgcmVmcmVzaFRva2VuKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIHRoZSBlbmQgc2Vzc2lvbiBVUkwgd2hpY2ggY2FuIGJlIHVzZWQgdG8gaW1wbGVtZW50IGFuIGFsdGVybmF0ZSBzZXJ2ZXIgbG9nb3V0LlxuICAgKlxuICAgKiBAcGFyYW0gY3VzdG9tUGFyYW1zXG4gICAqIEBwYXJhbSBjb25maWdJZCBUaGUgY29uZmlnSWQgdG8gcGVyZm9ybSB0aGUgYWN0aW9uIGluIGJlaGFsZiBvZi4gSWYgbm90IHBhc3NlZCwgdGhlIGZpcnN0IGNvbmZpZ3Mgd2lsbCBiZSB0YWtlblxuICAgKlxuICAgKiBAcmV0dXJucyBBIHN0cmluZyB3aXRoIHRoZSBlbmQgc2Vzc2lvbiB1cmwgb3IgbnVsbFxuICAgKi9cbiAgZ2V0RW5kU2Vzc2lvblVybChjdXN0b21QYXJhbXM/OiB7IFtwOiBzdHJpbmddOiBzdHJpbmcgfCBudW1iZXIgfCBib29sZWFuIH0sIGNvbmZpZ0lkPzogc3RyaW5nKTogc3RyaW5nIHwgbnVsbCB7XG4gICAgY29uZmlnSWQgPSBjb25maWdJZCA/PyB0aGlzLmNvbmZpZ3VyYXRpb25Qcm92aWRlci5nZXRPcGVuSURDb25maWd1cmF0aW9uKGNvbmZpZ0lkKS5jb25maWdJZDtcblxuICAgIHJldHVybiB0aGlzLmxvZ29mZlJldm9jYXRpb25TZXJ2aWNlLmdldEVuZFNlc3Npb25VcmwoY29uZmlnSWQsIGN1c3RvbVBhcmFtcyk7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlcyB0aGUgYXV0aG9yaXplIFVSTCBiYXNlZCBvbiB5b3VyIGZsb3dcbiAgICpcbiAgICogQHBhcmFtIGN1c3RvbVBhcmFtc1xuICAgKiBAcGFyYW0gY29uZmlnSWQgVGhlIGNvbmZpZ0lkIHRvIHBlcmZvcm0gdGhlIGFjdGlvbiBpbiBiZWhhbGYgb2YuIElmIG5vdCBwYXNzZWQsIHRoZSBmaXJzdCBjb25maWdzIHdpbGwgYmUgdGFrZW5cbiAgICpcbiAgICogQHJldHVybnMgQSBzdHJpbmcgd2l0aCB0aGUgYXV0aG9yaXplIFVSTCBvciBudWxsXG4gICAqL1xuICBnZXRBdXRob3JpemVVcmwoY3VzdG9tUGFyYW1zPzogeyBbcDogc3RyaW5nXTogc3RyaW5nIHwgbnVtYmVyIHwgYm9vbGVhbiB9LCBjb25maWdJZD86IHN0cmluZyk6IHN0cmluZyB8IG51bGwge1xuICAgIGNvbmZpZ0lkID0gY29uZmlnSWQgPz8gdGhpcy5jb25maWd1cmF0aW9uUHJvdmlkZXIuZ2V0T3BlbklEQ29uZmlndXJhdGlvbihjb25maWdJZCkuY29uZmlnSWQ7XG5cbiAgICByZXR1cm4gdGhpcy51cmxTZXJ2aWNlLmdldEF1dGhvcml6ZVVybChjb25maWdJZCwgY3VzdG9tUGFyYW1zKTtcbiAgfVxufVxuIl19