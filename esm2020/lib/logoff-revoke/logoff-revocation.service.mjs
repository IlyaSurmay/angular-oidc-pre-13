import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { of, throwError } from 'rxjs';
import { catchError, retry, switchMap, tap } from 'rxjs/operators';
import * as i0 from "@angular/core";
import * as i1 from "../api/data.service";
import * as i2 from "../storage/storage-persistence.service";
import * as i3 from "../logging/logger.service";
import * as i4 from "../utils/url/url.service";
import * as i5 from "../iframe/check-session.service";
import * as i6 from "../flows/reset-auth-data.service";
import * as i7 from "../utils/redirect/redirect.service";
import * as i8 from "../config/provider/config.provider";
export class LogoffRevocationService {
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
        const mergedParams = { ...customParamsEndSessionRequest, ...customParams };
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
LogoffRevocationService.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: LogoffRevocationService, deps: [{ token: i1.DataService }, { token: i2.StoragePersistenceService }, { token: i3.LoggerService }, { token: i4.UrlService }, { token: i5.CheckSessionService }, { token: i6.ResetAuthDataService }, { token: i7.RedirectService }, { token: i8.ConfigurationProvider }], target: i0.ɵɵFactoryTarget.Injectable });
LogoffRevocationService.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: LogoffRevocationService });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: LogoffRevocationService, decorators: [{
            type: Injectable
        }], ctorParameters: function () { return [{ type: i1.DataService }, { type: i2.StoragePersistenceService }, { type: i3.LoggerService }, { type: i4.UrlService }, { type: i5.CheckSessionService }, { type: i6.ResetAuthDataService }, { type: i7.RedirectService }, { type: i8.ConfigurationProvider }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9nb2ZmLXJldm9jYXRpb24uc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL2FuZ3VsYXItYXV0aC1vaWRjLWNsaWVudC9zcmMvbGliL2xvZ29mZi1yZXZva2UvbG9nb2ZmLXJldm9jYXRpb24uc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUFDbkQsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUMzQyxPQUFPLEVBQWMsRUFBRSxFQUFFLFVBQVUsRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUNsRCxPQUFPLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUUsR0FBRyxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7Ozs7Ozs7Ozs7QUFZbkUsTUFBTSxPQUFPLHVCQUF1QjtJQUNsQyxZQUNVLFdBQXdCLEVBQ3hCLHlCQUFvRCxFQUNwRCxhQUE0QixFQUM1QixVQUFzQixFQUN0QixtQkFBd0MsRUFDeEMsb0JBQTBDLEVBQzFDLGVBQWdDLEVBQ2hDLHFCQUE0QztRQVA1QyxnQkFBVyxHQUFYLFdBQVcsQ0FBYTtRQUN4Qiw4QkFBeUIsR0FBekIseUJBQXlCLENBQTJCO1FBQ3BELGtCQUFhLEdBQWIsYUFBYSxDQUFlO1FBQzVCLGVBQVUsR0FBVixVQUFVLENBQVk7UUFDdEIsd0JBQW1CLEdBQW5CLG1CQUFtQixDQUFxQjtRQUN4Qyx5QkFBb0IsR0FBcEIsb0JBQW9CLENBQXNCO1FBQzFDLG9CQUFlLEdBQWYsZUFBZSxDQUFpQjtRQUNoQywwQkFBcUIsR0FBckIscUJBQXFCLENBQXVCO0lBQ25ELENBQUM7SUFFSiwrQ0FBK0M7SUFDL0MsNEVBQTRFO0lBQzVFLE1BQU0sQ0FBQyxRQUFnQixFQUFFLFdBQXlCO1FBQ2hELE1BQU0sRUFBRSxVQUFVLEVBQUUsWUFBWSxFQUFFLEdBQUcsV0FBVyxJ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SSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFLFlBQVksRUFBRSxLQUFLLENBQUMsQ0FBQztZQUUzRCxPQUFPLFVBQVUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLEtBQUssQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDO1FBQ25ELENBQUMsQ0FBQyxDQUNILENBQUM7SUFDSixDQUFDOztvSEF0SVUsdUJBQXVCO3dIQUF2Qix1QkFBdUI7MkZBQXZCLHVCQUF1QjtrQkFEbkMsVUFBVSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEh0dHBIZWFkZXJzIH0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uL2h0dHAnO1xuaW1wb3J0IHsgSW5qZWN0YWJsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgT2JzZXJ2YWJsZSwgb2YsIHRocm93RXJyb3IgfSBmcm9tICdyeGpzJztcbmltcG9ydCB7IGNhdGNoRXJyb3IsIHJldHJ5LCBzd2l0Y2hNYXAsIHRhcCB9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcbmltcG9ydCB7IERhdGFTZXJ2aWNlIH0gZnJvbSAnLi4vYXBpL2RhdGEuc2VydmljZSc7XG5pbXBvcnQgeyBBdXRoT3B0aW9ucyB9IGZyb20gJy4uL2F1dGgtb3B0aW9ucyc7XG5pbXBvcnQgeyBDb25maWd1cmF0aW9uUHJvdmlkZXIgfSBmcm9tICcuLi9jb25maWcvcHJvdmlkZXIvY29uZmlnLnByb3ZpZGVyJztcbmltcG9ydCB7IFJlc2V0QXV0aERhdGFTZXJ2aWNlIH0gZnJvbSAnLi4vZmxvd3MvcmVzZXQtYXV0aC1kYXRhLnNlcnZpY2UnO1xuaW1wb3J0IHsgQ2hlY2tTZXNzaW9uU2VydmljZSB9IGZyb20gJy4uL2lmcmFtZS9jaGVjay1zZXNzaW9uLnNlcnZpY2UnO1xuaW1wb3J0IHsgTG9nZ2VyU2VydmljZSB9IGZyb20gJy4uL2xvZ2dpbmcvbG9nZ2VyLnNlcnZpY2UnO1xuaW1wb3J0IHsgU3RvcmFnZVBlcnNpc3RlbmNlU2VydmljZSB9IGZyb20gJy4uL3N0b3JhZ2Uvc3RvcmFnZS1wZXJzaXN0ZW5jZS5zZXJ2aWNlJztcbmltcG9ydCB7IFJlZGlyZWN0U2VydmljZSB9IGZyb20gJy4uL3V0aWxzL3JlZGlyZWN0L3JlZGlyZWN0LnNlcnZpY2UnO1xuaW1wb3J0IHsgVXJsU2VydmljZSB9IGZyb20gJy4uL3V0aWxzL3VybC91cmwuc2VydmljZSc7XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBMb2dvZmZSZXZvY2F0aW9uU2VydmljZSB7XG4gIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUgZGF0YVNlcnZpY2U6IERhdGFTZXJ2aWNlLFxuICAgIHByaXZhdGUgc3RvcmFnZVBlcnNpc3RlbmNlU2VydmljZTogU3RvcmFnZVBlcnNpc3RlbmNlU2VydmljZSxcbiAgICBwcml2YXRlIGxvZ2dlclNlcnZpY2U6IExvZ2dlclNlcnZpY2UsXG4gICAgcHJpdmF0ZSB1cmxTZXJ2aWNlOiBVcmxTZXJ2aWNlLFxuICAgIHByaXZhdGUgY2hlY2tTZXNzaW9uU2VydmljZTogQ2hlY2tTZXNzaW9uU2VydmljZSxcbiAgICBwcml2YXRlIHJlc2V0QXV0aERhdGFTZXJ2aWNlOiBSZXNldEF1dGhEYXRhU2VydmljZSxcbiAgICBwcml2YXRlIHJlZGlyZWN0U2VydmljZTogUmVkaXJlY3RTZXJ2aWNlLFxuICAgIHByaXZhdGUgY29uZmlndXJhdGlvblByb3ZpZGVyOiBDb25maWd1cmF0aW9uUHJvdmlkZXJcbiAgKSB7fVxuXG4gIC8vIExvZ3Mgb3V0IG9uIHRoZSBzZXJ2ZXIgYW5kIHRoZSBsb2NhbCBjbGllbnQuXG4gIC8vIElmIHRoZSBzZXJ2ZXIgc3RhdGUgaGFzIGNoYW5nZWQsIGNoZWNrIHNlc3Npb24sIHRoZW4gb25seSBhIGxvY2FsIGxvZ291dC5cbiAgbG9nb2ZmKGNvbmZpZ0lkOiBzdHJpbmcsIGF1dGhPcHRpb25zPzogQXV0aE9wdGlvbnMpOiB2b2lkIHtcbiAgICBjb25zdCB7IHVybEhhbmRsZXIsIGN1c3RvbVBhcmFtcyB9ID0gYXV0aE9wdGlvbnMgfHwge307XG5cbiAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoY29uZmlnSWQsICdsb2dvZmYsIHJlbW92ZSBhdXRoICcpO1xuXG4gICAgY29uc3QgZW5kU2Vzc2lvblVybCA9IHRoaXMuZ2V0RW5kU2Vzc2lvblVybChjb25maWdJZCwgY3VzdG9tUGFyYW1zKTtcblxuICAgIHRoaXMucmVzZXRBdXRoRGF0YVNlcnZpY2UucmVzZXRBdXRob3JpemF0aW9uRGF0YShjb25maWdJZCk7XG5cbiAgICBpZiAoIWVuZFNlc3Npb25VcmwpIHtcbiAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1Zyhjb25maWdJZCwgJ29ubHkgbG9jYWwgbG9naW4gY2xlYW5lZCB1cCwgbm8gZW5kX3Nlc3Npb25fZW5kcG9pbnQnKTtcblxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmICh0aGlzLmNoZWNrU2Vzc2lvblNlcnZpY2Uuc2VydmVyU3RhdGVDaGFuZ2VkKGNvbmZpZ0lkKSkge1xuICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKGNvbmZpZ0lkLCAnb25seSBsb2NhbCBsb2dpbiBjbGVhbmVkIHVwLCBzZXJ2ZXIgc2Vzc2lvbiBoYXMgY2hhbmdlZCcpO1xuICAgIH0gZWxzZSBpZiAodXJsSGFuZGxlcikge1xuICAgICAgdXJsSGFuZGxlcihlbmRTZXNzaW9uVXJsKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5yZWRpcmVjdFNlcnZpY2UucmVkaXJlY3RUbyhlbmRTZXNzaW9uVXJsKTtcbiAgICB9XG4gIH1cblxuICBsb2dvZmZMb2NhbChjb25maWdJZDogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5yZXNldEF1dGhEYXRhU2VydmljZS5yZXNldEF1dGhvcml6YXRpb25EYXRhKGNvbmZpZ0lkKTtcbiAgICB0aGlzLmNoZWNrU2Vzc2lvblNlcnZpY2Uuc3RvcCgpO1xuICB9XG5cbiAgbG9nb2ZmTG9jYWxNdWx0aXBsZSgpOiB2b2lkIHtcbiAgICBjb25zdCBhbGxDb25maWdzID0gdGhpcy5jb25maWd1cmF0aW9uUHJvdmlkZXIuZ2V0QWxsQ29uZmlndXJhdGlvbnMoKTtcblxuICAgIGFsbENvbmZpZ3MuZm9yRWFjaCgoeyBjb25maWdJZCB9KSA9PiB0aGlzLmxvZ29mZkxvY2FsKGNvbmZpZ0lkKSk7XG4gIH1cblxuICAvLyBUaGUgcmVmcmVzaCB0b2tlbiBhbmQgYW5kIHRoZSBhY2Nlc3MgdG9rZW4gYXJlIHJldm9rZWQgb24gdGhlIHNlcnZlci4gSWYgdGhlIHJlZnJlc2ggdG9rZW4gZG9lcyBub3QgZXhpc3RcbiAgLy8gb25seSB0aGUgYWNjZXNzIHRva2VuIGlzIHJldm9rZWQuIFRoZW4gdGhlIGxvZ291dCBydW4uXG4gIGxvZ29mZkFuZFJldm9rZVRva2Vucyhjb25maWdJZDogc3RyaW5nLCBhdXRoT3B0aW9ucz86IEF1dGhPcHRpb25zKTogT2JzZXJ2YWJsZTxhbnk+IHtcbiAgICBjb25zdCB7IHJldm9jYXRpb25FbmRwb2ludCB9ID0gdGhpcy5zdG9yYWdlUGVyc2lzdGVuY2VTZXJ2aWNlLnJlYWQoJ2F1dGhXZWxsS25vd25FbmRQb2ludHMnLCBjb25maWdJZCkgfHwge307XG5cbiAgICBpZiAoIXJldm9jYXRpb25FbmRwb2ludCkge1xuICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKGNvbmZpZ0lkLCAncmV2b2NhdGlvbiBlbmRwb2ludCBub3Qgc3VwcG9ydGVkJyk7XG4gICAgICB0aGlzLmxvZ29mZihjb25maWdJZCwgYXV0aE9wdGlvbnMpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLnN0b3JhZ2VQZXJzaXN0ZW5jZVNlcnZpY2UuZ2V0UmVmcmVzaFRva2VuKGNvbmZpZ0lkKSkge1xuICAgICAgcmV0dXJuIHRoaXMucmV2b2tlUmVmcmVzaFRva2VuKGNvbmZpZ0lkKS5waXBlKFxuICAgICAgICBzd2l0Y2hNYXAoKHJlc3VsdCkgPT4gdGhpcy5yZXZva2VBY2Nlc3NUb2tlbihjb25maWdJZCwgcmVzdWx0KSksXG4gICAgICAgIGNhdGNoRXJyb3IoKGVycm9yKSA9PiB7XG4gICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYHJldm9rZSB0b2tlbiBmYWlsZWRgO1xuICAgICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dFcnJvcihjb25maWdJZCwgZXJyb3JNZXNzYWdlLCBlcnJvcik7XG5cbiAgICAgICAgICByZXR1cm4gdGhyb3dFcnJvcigoKSA9PiBuZXcgRXJyb3IoZXJyb3JNZXNzYWdlKSk7XG4gICAgICAgIH0pLFxuICAgICAgICB0YXAoKCkgPT4gdGhpcy5sb2dvZmYoY29uZmlnSWQsIGF1dGhPcHRpb25zKSlcbiAgICAgICk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLnJldm9rZUFjY2Vzc1Rva2VuKGNvbmZpZ0lkKS5waXBlKFxuICAgICAgICBjYXRjaEVycm9yKChlcnJvcikgPT4ge1xuICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGByZXZva2UgYWNjZXNzVG9rZW4gZmFpbGVkYDtcbiAgICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRXJyb3IoY29uZmlnSWQsIGVycm9yTWVzc2FnZSwgZXJyb3IpO1xuXG4gICAgICAgICAgcmV0dXJuIHRocm93RXJyb3IoKCkgPT4gbmV3IEVycm9yKGVycm9yTWVzc2FnZSkpO1xuICAgICAgICB9KSxcbiAgICAgICAgdGFwKCgpID0+IHRoaXMubG9nb2ZmKGNvbmZpZ0lkLCBhdXRoT3B0aW9ucykpXG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIC8vIGh0dHBzOi8vdG9vbHMuaWV0Zi5vcmcvaHRtbC9yZmM3MDA5XG4gIC8vIHJldm9rZXMgYW4gYWNjZXNzIHRva2VuIG9uIHRoZSBTVFMuIElmIG5vIHRva2VuIGlzIHByb3ZpZGVkLCB0aGVuIHRoZSB0b2tlbiBmcm9tXG4gIC8vIHRoZSBzdG9yYWdlIGlzIHJldm9rZWQuIFlvdSBjYW4gcGFzcyBhbnkgdG9rZW4gdG8gcmV2b2tlLiBUaGlzIG1ha2VzIGl0IHBvc3NpYmxlIHRvXG4gIC8vIG1hbmFnZSB5b3VyIG93biB0b2tlbnMuIFRoZSBpcyBhIHB1YmxpYyBBUEkuXG4gIHJldm9rZUFjY2Vzc1Rva2VuKGNvbmZpZ0lkOiBzdHJpbmcsIGFjY2Vzc1Rva2VuPzogYW55KTogT2JzZXJ2YWJsZTxhbnk+IHtcbiAgICBjb25zdCBhY2Nlc3NUb2sgPSBhY2Nlc3NUb2tlbiB8fCB0aGlzLnN0b3JhZ2VQZXJzaXN0ZW5jZVNlcnZpY2UuZ2V0QWNjZXNzVG9rZW4oY29uZmlnSWQpO1xuICAgIGNvbnN0IGJvZHkgPSB0aGlzLnVybFNlcnZpY2UuY3JlYXRlUmV2b2NhdGlvbkVuZHBvaW50Qm9keUFjY2Vzc1Rva2VuKGFjY2Vzc1RvaywgY29uZmlnSWQpO1xuXG4gICAgcmV0dXJuIHRoaXMuc2VuZFJldm9rZVJlcXVlc3QoY29uZmlnSWQsIGJvZHkpO1xuICB9XG5cbiAgLy8gaHR0cHM6Ly90b29scy5pZXRmLm9yZy9odG1sL3JmYzcwMDlcbiAgLy8gcmV2b2tlcyBhbiByZWZyZXNoIHRva2VuIG9uIHRoZSBTVFMuIFRoaXMgaXMgb25seSByZXF1aXJlZCBpbiB0aGUgY29kZSBmbG93IHdpdGggcmVmcmVzaCB0b2tlbnMuXG4gIC8vIElmIG5vIHRva2VuIGlzIHByb3ZpZGVkLCB0aGVuIHRoZSB0b2tlbiBmcm9tIHRoZSBzdG9yYWdlIGlzIHJldm9rZWQuIFlvdSBjYW4gcGFzcyBhbnkgdG9rZW4gdG8gcmV2b2tlLlxuICAvLyBUaGlzIG1ha2VzIGl0IHBvc3NpYmxlIHRvIG1hbmFnZSB5b3VyIG93biB0b2tlbnMuXG4gIHJldm9rZVJlZnJlc2hUb2tlbihjb25maWdJZDogc3RyaW5nLCByZWZyZXNoVG9rZW4/OiBhbnkpOiBPYnNlcnZhYmxlPGFueT4ge1xuICAgIGNvbnN0IHJlZnJlc2hUb2sgPSByZWZyZXNoVG9rZW4gfHwgdGhpcy5zdG9yYWdlUGVyc2lzdGVuY2VTZXJ2aWNlLmdldFJlZnJlc2hUb2tlbihjb25maWdJZCk7XG4gICAgY29uc3QgYm9keSA9IHRoaXMudXJsU2VydmljZS5jcmVhdGVSZXZvY2F0aW9uRW5kcG9pbnRCb2R5UmVmcmVzaFRva2VuKHJlZnJlc2hUb2ssIGNvbmZpZ0lkKTtcblxuICAgIHJldHVybiB0aGlzLnNlbmRSZXZva2VSZXF1ZXN0KGNvbmZpZ0lkLCBib2R5KTtcbiAgfVxuXG4gIGdldEVuZFNlc3Npb25VcmwoY29uZmlnSWQ6IHN0cmluZywgY3VzdG9tUGFyYW1zPzogeyBbcDogc3RyaW5nXTogc3RyaW5nIHwgbnVtYmVyIHwgYm9vbGVhbiB9KTogc3RyaW5nIHwgbnVsbCB7XG4gICAgY29uc3QgaWRUb2tlbiA9IHRoaXMuc3RvcmFnZVBlcnNpc3RlbmNlU2VydmljZS5nZXRJZFRva2VuKGNvbmZpZ0lkKTtcbiAgICBjb25zdCB7IGN1c3RvbVBhcmFtc0VuZFNlc3Npb25SZXF1ZXN0IH0gPSB0aGlzLmNvbmZpZ3VyYXRpb25Qcm92aWRlci5nZXRPcGVuSURDb25maWd1cmF0aW9uKCk7XG5cbiAgICBjb25zdCBtZXJnZWRQYXJhbXMgPSB7IC4uLmN1c3RvbVBhcmFtc0VuZFNlc3Npb25SZXF1ZXN0LCAuLi5jdXN0b21QYXJhbXMgfTtcblxuICAgIHJldHVybiB0aGlzLnVybFNlcnZpY2UuY3JlYXRlRW5kU2Vzc2lvblVybChpZFRva2VuLCBjb25maWdJZCwgbWVyZ2VkUGFyYW1zKTtcbiAgfVxuXG4gIHByaXZhdGUgc2VuZFJldm9rZVJlcXVlc3QoY29uZmlnSWQ6IHN0cmluZywgYm9keTogc3RyaW5nKTogT2JzZXJ2YWJsZTxhbnk+IHtcbiAgICBjb25zdCB1cmwgPSB0aGlzLnVybFNlcnZpY2UuZ2V0UmV2b2NhdGlvbkVuZHBvaW50VXJsKGNvbmZpZ0lkKTtcblxuICAgIGxldCBoZWFkZXJzOiBIdHRwSGVhZGVycyA9IG5ldyBIdHRwSGVhZGVycygpO1xuICAgIGhlYWRlcnMgPSBoZWFkZXJzLnNldCgnQ29udGVudC1UeXBlJywgJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCcpO1xuXG4gICAgcmV0dXJuIHRoaXMuZGF0YVNlcnZpY2UucG9zdCh1cmwsIGJvZHksIGNvbmZpZ0lkLCBoZWFkZXJzKS5waXBlKFxuICAgICAgcmV0cnkoMiksXG4gICAgICBzd2l0Y2hNYXAoKHJlc3BvbnNlOiBhbnkpID0+IHtcbiAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKGNvbmZpZ0lkLCAncmV2b2NhdGlvbiBlbmRwb2ludCBwb3N0IHJlc3BvbnNlOiAnLCByZXNwb25zZSk7XG5cbiAgICAgICAgcmV0dXJuIG9mKHJlc3BvbnNlKTtcbiAgICAgIH0pLFxuICAgICAgY2F0Y2hFcnJvcigoZXJyb3IpID0+IHtcbiAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFJldm9jYXRpb24gcmVxdWVzdCBmYWlsZWRgO1xuICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRXJyb3IoY29uZmlnSWQsIGVycm9yTWVzc2FnZSwgZXJyb3IpO1xuXG4gICAgICAgIHJldHVybiB0aHJvd0Vycm9yKCgpID0+IG5ldyBFcnJvcihlcnJvck1lc3NhZ2UpKTtcbiAgICAgIH0pXG4gICAgKTtcbiAgfVxufVxuIl19