import { Observable } from 'rxjs';
import { AuthOptions } from './auth-options';
import { AuthenticatedResult } from './auth-state/auth-result';
import { AuthStateService } from './auth-state/auth-state.service';
import { CallbackService } from './callback/callback.service';
import { RefreshSessionService } from './callback/refresh-session.service';
import { CheckAuthService } from './check-auth.service';
import { OpenIdConfiguration } from './config/openid-configuration';
import { ConfigurationProvider } from './config/provider/config.provider';
import { FlowsDataService } from './flows/flows-data.service';
import { CheckSessionService } from './iframe/check-session.service';
import { LoginResponse } from './login/login-response';
import { LoginService } from './login/login.service';
import { PopupOptions } from './login/popup/popup-options';
import { LogoffRevocationService } from './logoff-revoke/logoff-revocation.service';
import { UserService } from './user-data/user.service';
import { UserDataResult } from './user-data/userdata-result';
import { TokenHelperService } from './utils/tokenHelper/token-helper.service';
import { UrlService } from './utils/url/url.service';
import * as i0 from "@angular/core";
export declare class OidcSecurityService {
    private checkSessionService;
    private checkAuthService;
    private userService;
    private tokenHelperService;
    private configurationProvider;
    private authStateService;
    private flowsDataService;
    private callbackService;
    private logoffRevocationService;
    private loginService;
    private refreshSessionService;
    private urlService;
    /**
     * Provides information about the user after they have logged in.
     *
     * @returns Returns an object containing either the user data directly (single config) or
     * the user data per config in case you are running with multiple configs
     */
    get userData$(): Observable<UserDataResult>;
    /**
     * Emits each time an authorization event occurs.
     *
     * @returns Returns an object containing if you are authenticated or not.
     * Single Config: true if config is authenticated, false if not.
     * Multiple Configs: true is all configs are authenticated, false if only one of them is not
     *
     * The `allConfigsAuthenticated` property contains the auth information _per config_.
     */
    get isAuthenticated$(): Observable<AuthenticatedResult>;
    /**
     * Emits each time the server sends a CheckSession event and the value changed. This property will always return
     * true.
     */
    get checkSessionChanged$(): Observable<boolean>;
    /**
     * Emits on a Security Token Service callback. The observable will never contain a value.
     */
    get stsCallback$(): Observable<any>;
    constructor(checkSessionService: CheckSessionService, checkAuthService: CheckAuthService, userService: UserService, tokenHelperService: TokenHelperService, configurationProvider: ConfigurationProvider, authStateService: AuthStateService, flowsDataService: FlowsDataService, callbackService: CallbackService, logoffRevocationService: LogoffRevocationService, loginService: LoginService, refreshSessionService: RefreshSessionService, urlService: UrlService);
    /**
     * Returns the currently active OpenID configurations.
     *
     * @returns an array of OpenIdConfigurations.
     */
    getConfigurations(): OpenIdConfiguration[];
    /**
     * Returns a single active OpenIdConfiguration.
     *
     * @param configId The configId to identify the config. If not passed, the first one is being returned
     */
    getConfiguration(configId?: string): OpenIdConfiguration;
    /**
     * Returns the userData for a configuration
     *
     * @param configId The configId to identify the config. If not passed, the first one is being used
     */
    getUserData(configId?: string): any;
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
    checkAuth(url?: string, configId?: string): Observable<LoginResponse>;
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
    checkAuthMultiple(url?: string, configId?: string): Observable<LoginResponse[]>;
    /**
     * Provides information about the current authenticated state
     *
     * @param configId The configId to check the information for. If not passed, the first configs will be taken
     *
     * @returns A boolean whether the config is authenticated or not.
     */
    isAuthenticated(configId?: string): boolean;
    /**
     * Checks the server for an authenticated session using the iframe silent renew if not locally authenticated.
     */
    checkAuthIncludingServer(configId?: string): Observable<LoginResponse>;
    /**
     * Returns the access token for the login scenario.
     *
     * @param configId The configId to check the information for. If not passed, the first configs will be taken
     *
     * @returns A string with the access token.
     */
    getAccessToken(configId?: string): string;
    /**
     * Returns the ID token for the sign-in.
     *
     * @param configId The configId to check the information for. If not passed, the first configs will be taken
     *
     * @returns A string with the id token.
     */
    getIdToken(configId?: string): string;
    /**
     * Returns the refresh token, if present, for the sign-in.
     *
     * @param configId The configId to check the information for. If not passed, the first configs will be taken
     *
     * @returns A string with the refresh token.
     */
    getRefreshToken(configId?: string): string;
    /**
     * Returns the authentication result, if present, for the sign-in.
     *
     * @param configId The configId to check the information for. If not passed, the first configs will be taken
     *
     * @returns A object with the authentication result
     */
    getAuthenticationResult(configId?: string): any;
    /**
     * Returns the payload from the ID token.
     *
     * @param encode Set to true if the payload is base64 encoded
     * @param configId The configId to check the information for. If not passed, the first configs will be taken
     *
     * @returns The payload from the id token.
     */
    getPayloadFromIdToken(encode?: boolean, configId?: string): any;
    /**
     * Sets a custom state for the authorize request.
     *
     * @param state The state to set.
     * @param configId The configId to check the information for. If not passed, the first configs will be taken
     */
    setState(state: string, configId?: string): void;
    /**
     * Gets the state value used for the authorize request.
     *
     * @param configId The configId to check the information for. If not passed, the first configs will be taken
     *
     * @returns The state value used for the authorize request.
     */
    getState(configId?: string): string;
    /**
     * Redirects the user to the Security Token Service to begin the authentication process.
     *
     * @param configId The configId to perform the action in behalf of. If not passed, the first configs will be taken
     * @param authOptions The custom options for the the authentication request.
     */
    authorize(configId?: string, authOptions?: AuthOptions): void;
    /**
     * Opens the Security Token Service in a new window to begin the authentication process.
     *
     * @param authOptions The custom options for the authentication request.
     * @param popupOptions The configuration for the popup window.
     * @param configId The configId to perform the action in behalf of. If not passed, the first configs will be taken
     *
     * @returns An `Observable<LoginResponse>` containing all information about the login
     */
    authorizeWithPopUp(authOptions?: AuthOptions, popupOptions?: PopupOptions, configId?: string): Observable<LoginResponse>;
    /**
     * Manually refreshes the session.
     *
     * @param customParams Custom parameters to pass to the refresh request.
     * @param configId The configId to perform the action in behalf of. If not passed, the first configs will be taken
     *
     * @returns An `Observable<LoginResponse>` containing all information about the login
     */
    forceRefreshSession(customParams?: {
        [key: string]: string | number | boolean;
    }, configId?: string): Observable<LoginResponse>;
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
    logoffAndRevokeTokens(configId?: string, authOptions?: AuthOptions): Observable<any>;
    /**
     * Logs out on the server and the local client. If the server state has changed, confirmed via check session,
     * then only a local logout is performed.
     *
     * @param configId The configId to perform the action in behalf of. If not passed, the first configs will be taken
     * @param authOptions with custom parameters and/or an custom url handler
     */
    logoff(configId?: string, authOptions?: AuthOptions): void;
    /**
     * Logs the user out of the application without logging them out of the server.
     * Use this method if you have _one_ config enabled.
     *
     * @param configId The configId to perform the action in behalf of. If not passed, the first configs will be taken
     */
    logoffLocal(configId?: string): void;
    /**
     * Logs the user out of the application for all configs without logging them out of the server.
     * Use this method if you have _multiple_ configs enabled.
     */
    logoffLocalMultiple(): void;
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
    revokeAccessToken(accessToken?: any, configId?: string): Observable<any>;
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
    revokeRefreshToken(refreshToken?: any, configId?: string): Observable<any>;
    /**
     * Creates the end session URL which can be used to implement an alternate server logout.
     *
     * @param customParams
     * @param configId The configId to perform the action in behalf of. If not passed, the first configs will be taken
     *
     * @returns A string with the end session url or null
     */
    getEndSessionUrl(customParams?: {
        [p: string]: string | number | boolean;
    }, configId?: string): string | null;
    /**
     * Creates the authorize URL based on your flow
     *
     * @param customParams
     * @param configId The configId to perform the action in behalf of. If not passed, the first configs will be taken
     *
     * @returns A string with the authorize URL or null
     */
    getAuthorizeUrl(customParams?: {
        [p: string]: string | number | boolean;
    }, configId?: string): string | null;
    static ɵfac: i0.ɵɵFactoryDeclaration<OidcSecurityService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<OidcSecurityService>;
}
