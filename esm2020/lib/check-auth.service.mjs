import { Injectable } from '@angular/core';
import { forkJoin, of, throwError } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import * as i0 from "@angular/core";
import * as i1 from "./iframe/check-session.service";
import * as i2 from "./utils/url/current-url.service";
import * as i3 from "./iframe/silent-renew.service";
import * as i4 from "./user-data/user.service";
import * as i5 from "./logging/logger.service";
import * as i6 from "./config/provider/config.provider";
import * as i7 from "./auth-state/auth-state.service";
import * as i8 from "./callback/callback.service";
import * as i9 from "./callback/refresh-session.service";
import * as i10 from "./callback/periodically-token-check.service";
import * as i11 from "./login/popup/popup.service";
import * as i12 from "./auto-login/auto-login.service";
import * as i13 from "./storage/storage-persistence.service";
export class CheckAuthService {
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
                if (loginResponseAfterRefreshSession?.isAuthenticated) {
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
CheckAuthService.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: CheckAuthService, deps: [{ token: i1.CheckSessionService }, { token: i2.CurrentUrlService }, { token: i3.SilentRenewService }, { token: i4.UserService }, { token: i5.LoggerService }, { token: i6.ConfigurationProvider }, { token: i7.AuthStateService }, { token: i8.CallbackService }, { token: i9.RefreshSessionService }, { token: i10.PeriodicallyTokenCheckService }, { token: i11.PopUpService }, { token: i12.AutoLoginService }, { token: i13.StoragePersistenceService }], target: i0.ɵɵFactoryTarget.Injectable });
CheckAuthService.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: CheckAuthService });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: CheckAuthService, decorators: [{
            type: Injectable
        }], ctorParameters: function () { return [{ type: i1.CheckSessionService }, { type: i2.CurrentUrlService }, { type: i3.SilentRenewService }, { type: i4.UserService }, { type: i5.LoggerService }, { type: i6.ConfigurationProvider }, { type: i7.AuthStateService }, { type: i8.CallbackService }, { type: i9.RefreshSessionService }, { type: i10.PeriodicallyTokenCheckService }, { type: i11.PopUpService }, { type: i12.AutoLoginService }, { type: i13.StoragePersistenceService }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hlY2stYXV0aC5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vcHJvamVjdHMvYW5ndWxhci1hdXRoLW9pZGMtY2xpZW50L3NyYy9saWIvY2hlY2stYXV0aC5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDM0MsT0FBTyxFQUFFLFFBQVEsRUFBYyxFQUFFLEVBQUUsVUFBVSxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBQzVELE9BQU8sRUFBRSxVQUFVLEVBQUUsR0FBRyxFQUFFLFNBQVMsRUFBRSxHQUFHLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7O0FBa0JqRSxNQUFNLE9BQU8sZ0JBQWdCO0lBQzNCLFlBQ1UsbUJBQXdDLEVBQ3hDLGlCQUFvQyxFQUNwQyxrQkFBc0MsRUFDdEMsV0FBd0IsRUFDeEIsYUFBNEIsRUFDNUIscUJBQTRDLEVBQzVDLGdCQUFrQyxFQUNsQyxlQUFnQyxFQUNoQyxxQkFBNEMsRUFDNUMsNkJBQTRELEVBQzVELFlBQTBCLEVBQzFCLGdCQUFrQyxFQUNsQyx5QkFBb0Q7UUFacEQsd0JBQW1CLEdBQW5CLG1CQUFtQixDQUFxQjtRQUN4QyxzQkFBaUIsR0FBakIsaUJBQWlCLENBQW1CO1FBQ3BDLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBb0I7UUFDdEMsZ0JBQVcsR0FBWCxXQUFXLENBQWE7UUFDeEIsa0JBQWEsR0FBYixhQUFhLENBQWU7UUFDNUIsMEJBQXFCLEdBQXJCLHFCQUFxQixDQUF1QjtRQUM1QyxxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQWtCO1FBQ2xDLG9CQUFlLEdBQWYsZUFBZSxDQUFpQjtRQUNoQywwQkFBcUIsR0FBckIscUJBQXFCLENBQXVCO1FBQzVDLGtDQUE2QixHQUE3Qiw2QkFBNkIsQ0FBK0I7UUFDNUQsaUJBQVksR0FBWixZQUFZLENBQWM7UUFDMUIscUJBQWdC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JztcbmltcG9ydCB7IGZvcmtKb2luLCBPYnNlcnZhYmxlLCBvZiwgdGhyb3dFcnJvciB9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHsgY2F0Y2hFcnJvciwgbWFwLCBzd2l0Y2hNYXAsIHRhcCB9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcbmltcG9ydCB7IEF1dGhTdGF0ZVNlcnZpY2UgfSBmcm9tICcuL2F1dGgtc3RhdGUvYXV0aC1zdGF0ZS5zZXJ2aWNlJztcbmltcG9ydCB7IEF1dG9Mb2dpblNlcnZpY2UgfSBmcm9tICcuL2F1dG8tbG9naW4vYXV0by1sb2dpbi5zZXJ2aWNlJztcbmltcG9ydCB7IENhbGxiYWNrU2VydmljZSB9IGZyb20gJy4vY2FsbGJhY2svY2FsbGJhY2suc2VydmljZSc7XG5pbXBvcnQgeyBQZXJpb2RpY2FsbHlUb2tlbkNoZWNrU2VydmljZSB9IGZyb20gJy4vY2FsbGJhY2svcGVyaW9kaWNhbGx5LXRva2VuLWNoZWNrLnNlcnZpY2UnO1xuaW1wb3J0IHsgUmVmcmVzaFNlc3Npb25TZXJ2aWNlIH0gZnJvbSAnLi9jYWxsYmFjay9yZWZyZXNoLXNlc3Npb24uc2VydmljZSc7XG5pbXBvcnQgeyBPcGVuSWRDb25maWd1cmF0aW9uIH0gZnJvbSAnLi9jb25maWcvb3BlbmlkLWNvbmZpZ3VyYXRpb24nO1xuaW1wb3J0IHsgQ29uZmlndXJhdGlvblByb3ZpZGVyIH0gZnJvbSAnLi9jb25maWcvcHJvdmlkZXIvY29uZmlnLnByb3ZpZGVyJztcbmltcG9ydCB7IENoZWNrU2Vzc2lvblNlcnZpY2UgfSBmcm9tICcuL2lmcmFtZS9jaGVjay1zZXNzaW9uLnNlcnZpY2UnO1xuaW1wb3J0IHsgU2lsZW50UmVuZXdTZXJ2aWNlIH0gZnJvbSAnLi9pZnJhbWUvc2lsZW50LXJlbmV3LnNlcnZpY2UnO1xuaW1wb3J0IHsgTG9nZ2VyU2VydmljZSB9IGZyb20gJy4vbG9nZ2luZy9sb2dnZXIuc2VydmljZSc7XG5pbXBvcnQgeyBMb2dpblJlc3BvbnNlIH0gZnJvbSAnLi9sb2dpbi9sb2dpbi1yZXNwb25zZSc7XG5pbXBvcnQgeyBQb3BVcFNlcnZpY2UgfSBmcm9tICcuL2xvZ2luL3BvcHVwL3BvcHVwLnNlcnZpY2UnO1xuaW1wb3J0IHsgU3RvcmFnZVBlcnNpc3RlbmNlU2VydmljZSB9IGZyb20gJy4vc3RvcmFnZS9zdG9yYWdlLXBlcnNpc3RlbmNlLnNlcnZpY2UnO1xuaW1wb3J0IHsgVXNlclNlcnZpY2UgfSBmcm9tICcuL3VzZXItZGF0YS91c2VyLnNlcnZpY2UnO1xuaW1wb3J0IHsgQ3VycmVudFVybFNlcnZpY2UgfSBmcm9tICcuL3V0aWxzL3VybC9jdXJyZW50LXVybC5zZXJ2aWNlJztcblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIENoZWNrQXV0aFNlcnZpY2Uge1xuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIGNoZWNrU2Vzc2lvblNlcnZpY2U6IENoZWNrU2Vzc2lvblNlcnZpY2UsXG4gICAgcHJpdmF0ZSBjdXJyZW50VXJsU2VydmljZTogQ3VycmVudFVybFNlcnZpY2UsXG4gICAgcHJpdmF0ZSBzaWxlbnRSZW5ld1NlcnZpY2U6IFNpbGVudFJlbmV3U2VydmljZSxcbiAgICBwcml2YXRlIHVzZXJTZXJ2aWNlOiBVc2VyU2VydmljZSxcbiAgICBwcml2YXRlIGxvZ2dlclNlcnZpY2U6IExvZ2dlclNlcnZpY2UsXG4gICAgcHJpdmF0ZSBjb25maWd1cmF0aW9uUHJvdmlkZXI6IENvbmZpZ3VyYXRpb25Qcm92aWRlcixcbiAgICBwcml2YXRlIGF1dGhTdGF0ZVNlcnZpY2U6IEF1dGhTdGF0ZVNlcnZpY2UsXG4gICAgcHJpdmF0ZSBjYWxsYmFja1NlcnZpY2U6IENhbGxiYWNrU2VydmljZSxcbiAgICBwcml2YXRlIHJlZnJlc2hTZXNzaW9uU2VydmljZTogUmVmcmVzaFNlc3Npb25TZXJ2aWNlLFxuICAgIHByaXZhdGUgcGVyaW9kaWNhbGx5VG9rZW5DaGVja1NlcnZpY2U6IFBlcmlvZGljYWxseVRva2VuQ2hlY2tTZXJ2aWNlLFxuICAgIHByaXZhdGUgcG9wdXBTZXJ2aWNlOiBQb3BVcFNlcnZpY2UsXG4gICAgcHJpdmF0ZSBhdXRvTG9naW5TZXJ2aWNlOiBBdXRvTG9naW5TZXJ2aWNlLFxuICAgIHByaXZhdGUgc3RvcmFnZVBlcnNpc3RlbmNlU2VydmljZTogU3RvcmFnZVBlcnNpc3RlbmNlU2VydmljZVxuICApIHt9XG5cbiAgY2hlY2tBdXRoKHBhc3NlZENvbmZpZ0lkPzogc3RyaW5nLCB1cmw/OiBzdHJpbmcpOiBPYnNlcnZhYmxlPExvZ2luUmVzcG9uc2U+IHtcbiAgICBpZiAodGhpcy5jdXJyZW50VXJsU2VydmljZS5jdXJyZW50VXJsSGFzU3RhdGVQYXJhbSgpKSB7XG4gICAgICBjb25zdCBzdGF0ZVBhcmFtRnJvbVVybCA9IHRoaXMuY3VycmVudFVybFNlcnZpY2UuZ2V0U3RhdGVQYXJhbUZyb21DdXJyZW50VXJsKCk7XG4gICAgICBjb25zdCBjb25maWcgPSB0aGlzLmdldENvbmZpZ3VyYXRpb25XaXRoVXJsU3RhdGUoc3RhdGVQYXJhbUZyb21VcmwpO1xuXG4gICAgICBpZiAoIWNvbmZpZykge1xuICAgICAgICByZXR1cm4gdGhyb3dFcnJvcigoKSA9PiBuZXcgRXJyb3IoYGNvdWxkIG5vdCBmaW5kIG1hdGNoaW5nIGNvbmZpZyBmb3Igc3RhdGUgJHtzdGF0ZVBhcmFtRnJvbVVybH1gKSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzLmNoZWNrQXV0aFdpdGhDb25maWcoY29uZmlnLCB1cmwpO1xuICAgIH1cblxuICAgIGlmICghIXBhc3NlZENvbmZpZ0lkKSB7XG4gICAgICBjb25zdCBjb25maWcgPSB0aGlzLmNvbmZpZ3VyYXRpb25Qcm92aWRlci5nZXRPcGVuSURDb25maWd1cmF0aW9uKHBhc3NlZENvbmZpZ0lkKTtcblxuICAgICAgcmV0dXJuIHRoaXMuY2hlY2tBdXRoV2l0aENvbmZpZyhjb25maWcsIHVybCk7XG4gICAgfVxuXG4gICAgY29uc3Qgb25seUV4aXN0aW5nQ29uZmlnID0gdGhpcy5jb25maWd1cmF0aW9uUHJvdmlkZXIuZ2V0T3BlbklEQ29uZmlndXJhdGlvbigpO1xuXG4gICAgcmV0dXJuIHRoaXMuY2hlY2tBdXRoV2l0aENvbmZpZyhvbmx5RXhpc3RpbmdDb25maWcsIHVybCk7XG4gIH1cblxuICBjaGVja0F1dGhNdWx0aXBsZShwYXNzZWRDb25maWdJZD86IHN0cmluZywgdXJsPzogc3RyaW5nKTogT2JzZXJ2YWJsZTxMb2dpblJlc3BvbnNlW10+IHtcbiAgICBpZiAodGhpcy5jdXJyZW50VXJsU2VydmljZS5jdXJyZW50VXJsSGFzU3RhdGVQYXJhbSgpKSB7XG4gICAgICBjb25zdCBzdGF0ZVBhcmFtRnJvbVVybCA9IHRoaXMuY3VycmVudFVybFNlcnZpY2UuZ2V0U3RhdGVQYXJhbUZyb21DdXJyZW50VXJsKCk7XG4gICAgICBjb25zdCBjb25maWcgPSB0aGlzLmdldENvbmZpZ3VyYXRpb25XaXRoVXJsU3RhdGUoc3RhdGVQYXJhbUZyb21VcmwpO1xuXG4gICAgICBpZiAoIWNvbmZpZykge1xuICAgICAgICByZXR1cm4gdGhyb3dFcnJvcigoKSA9PiBuZXcgRXJyb3IoYGNvdWxkIG5vdCBmaW5kIG1hdGNoaW5nIGNvbmZpZyBmb3Igc3RhdGUgJHtzdGF0ZVBhcmFtRnJvbVVybH1gKSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzLmNvbXBvc2VNdWx0aXBsZUxvZ2luUmVzdWx0cyhjb25maWcsIHVybCk7XG4gICAgfVxuXG4gICAgaWYgKCEhcGFzc2VkQ29uZmlnSWQpIHtcbiAgICAgIGNvbnN0IGNvbmZpZyA9IHRoaXMuY29uZmlndXJhdGlvblByb3ZpZGVyLmdldE9wZW5JRENvbmZpZ3VyYXRpb24ocGFzc2VkQ29uZmlnSWQpO1xuXG4gICAgICBpZiAoIWNvbmZpZykge1xuICAgICAgICByZXR1cm4gdGhyb3dFcnJvcigoKSA9PiBuZXcgRXJyb3IoYGNvdWxkIG5vdCBmaW5kIG1hdGNoaW5nIGNvbmZpZyBmb3IgaWQgJHtwYXNzZWRDb25maWdJZH1gKSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzLmNvbXBvc2VNdWx0aXBsZUxvZ2luUmVzdWx0cyhjb25maWcsIHVybCk7XG4gICAgfVxuXG4gICAgY29uc3QgYWxsQ29uZmlncyA9IHRoaXMuY29uZmlndXJhdGlvblByb3ZpZGVyLmdldEFsbENvbmZpZ3VyYXRpb25zKCk7XG4gICAgY29uc3QgYWxsQ2hlY2tzJCA9IGFsbENvbmZpZ3MubWFwKCh4KSA9PiB0aGlzLmNoZWNrQXV0aFdpdGhDb25maWcoeCwgdXJsKSk7XG5cbiAgICByZXR1cm4gZm9ya0pvaW4oYWxsQ2hlY2tzJCk7XG4gIH1cblxuICBjaGVja0F1dGhJbmNsdWRpbmdTZXJ2ZXIoY29uZmlnSWQ6IHN0cmluZyk6IE9ic2VydmFibGU8TG9naW5SZXNwb25zZT4ge1xuICAgIGNvbnN0IGNvbmZpZyA9IHRoaXMuY29uZmlndXJhdGlvblByb3ZpZGVyLmdldE9wZW5JRENvbmZpZ3VyYXRpb24oY29uZmlnSWQpO1xuXG4gICAgcmV0dXJuIHRoaXMuY2hlY2tBdXRoV2l0aENvbmZpZyhjb25maWcpLnBpcGUoXG4gICAgICBzd2l0Y2hNYXAoKGxvZ2luUmVzcG9uc2UpID0+IHtcbiAgICAgICAgY29uc3QgeyBpc0F1dGhlbnRpY2F0ZWQgfSA9IGxvZ2luUmVzcG9uc2U7XG5cbiAgICAgICAgaWYgKGlzQXV0aGVudGljYXRlZCkge1xuICAgICAgICAgIHJldHVybiBvZihsb2dpblJlc3BvbnNlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzLnJlZnJlc2hTZXNzaW9uU2VydmljZS5mb3JjZVJlZnJlc2hTZXNzaW9uKGNvbmZpZ0lkKS5waXBlKFxuICAgICAgICAgIHRhcCgobG9naW5SZXNwb25zZUFmdGVyUmVmcmVzaFNlc3Npb24pID0+IHtcbiAgICAgICAgICAgIGlmIChsb2dpblJlc3BvbnNlQWZ0ZXJSZWZyZXNoU2Vzc2lvbj8uaXNBdXRoZW50aWNhdGVkKSB7XG4gICAgICAgICAgICAgIHRoaXMuc3RhcnRDaGVja1Nlc3Npb25BbmRWYWxpZGF0aW9uKGNvbmZpZ0lkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KVxuICAgICAgICApO1xuICAgICAgfSlcbiAgICApO1xuICB9XG5cbiAgcHJpdmF0ZSBjaGVja0F1dGhXaXRoQ29uZmlnKGNvbmZpZzogT3BlbklkQ29uZmlndXJhdGlvbiwgdXJsPzogc3RyaW5nKTogT2JzZXJ2YWJsZTxMb2dpblJlc3BvbnNlPiB7XG4gICAgY29uc3QgeyBjb25maWdJZCwgYXV0aG9yaXR5IH0gPSBjb25maWc7XG5cbiAgICBpZiAoIXRoaXMuY29uZmlndXJhdGlvblByb3ZpZGVyLmhhc0F0TGVhc3RPbmVDb25maWcoKSkge1xuICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gJ1BsZWFzZSBwcm92aWRlIGF0IGxlYXN0IG9uZSBjb25maWd1cmF0aW9uIGJlZm9yZSBzZXR0aW5nIHVwIHRoZSBtb2R1bGUnO1xuICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0Vycm9yKGNvbmZpZ0lkLCBlcnJvck1lc3NhZ2UpO1xuXG4gICAgICByZXR1cm4gb2YoeyBpc0F1dGhlbnRpY2F0ZWQ6IGZhbHNlLCBlcnJvck1lc3NhZ2UsIHVzZXJEYXRhOiBudWxsLCBpZFRva2VuOiBudWxsLCBhY2Nlc3NUb2tlbjogbnVsbCwgY29uZmlnSWQgfSk7XG4gICAgfVxuXG4gICAgY29uc3QgY3VycmVudFVybCA9IHVybCB8fCB0aGlzLmN1cnJlbnRVcmxTZXJ2aWNlLmdldEN1cnJlbnRVcmwoKTtcblxuICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1Zyhjb25maWdJZCwgYFdvcmtpbmcgd2l0aCBjb25maWcgJyR7Y29uZmlnSWR9JyB1c2luZyAke2F1dGhvcml0eX1gKTtcblxuICAgIGlmICh0aGlzLnBvcHVwU2VydmljZS5pc0N1cnJlbnRseUluUG9wdXAoKSkge1xuICAgICAgdGhpcy5wb3B1cFNlcnZpY2Uuc2VuZE1lc3NhZ2VUb01haW5XaW5kb3coY3VycmVudFVybCk7XG5cbiAgICAgIHJldHVybiBvZihudWxsKTtcbiAgICB9XG5cbiAgICBjb25zdCBpc0NhbGxiYWNrID0gdGhpcy5jYWxsYmFja1NlcnZpY2UuaXNDYWxsYmFjayhjdXJyZW50VXJsKTtcblxuICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1Zyhjb25maWdJZCwgJ2N1cnJlbnRVcmwgdG8gY2hlY2sgYXV0aCB3aXRoOiAnLCBjdXJyZW50VXJsKTtcblxuICAgIGNvbnN0IGNhbGxiYWNrJCA9IGlzQ2FsbGJhY2sgPyB0aGlzLmNhbGxiYWNrU2VydmljZS5oYW5kbGVDYWxsYmFja0FuZEZpcmVFdmVudHMoY3VycmVudFVybCwgY29uZmlnSWQpIDogb2YobnVsbCk7XG5cbiAgICByZXR1cm4gY2FsbGJhY2skLnBpcGUoXG4gICAgICBtYXAoKCkgPT4ge1xuICAgICAgICBjb25zdCBpc0F1dGhlbnRpY2F0ZWQgPSB0aGlzLmF1dGhTdGF0ZVNlcnZpY2UuYXJlQXV0aFN0b3JhZ2VUb2tlbnNWYWxpZChjb25maWdJZCk7XG4gICAgICAgIGlmIChpc0F1dGhlbnRpY2F0ZWQpIHtcbiAgICAgICAgICB0aGlzLnN0YXJ0Q2hlY2tTZXNzaW9uQW5kVmFsaWRhdGlvbihjb25maWdJZCk7XG5cbiAgICAgICAgICBpZiAoIWlzQ2FsbGJhY2spIHtcbiAgICAgICAgICAgIHRoaXMuYXV0aFN0YXRlU2VydmljZS5zZXRBdXRoZW50aWNhdGVkQW5kRmlyZUV2ZW50KCk7XG4gICAgICAgICAgICB0aGlzLnVzZXJTZXJ2aWNlLnB1Ymxpc2hVc2VyRGF0YUlmRXhpc3RzKGNvbmZpZ0lkKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoY29uZmlnSWQsICdjaGVja0F1dGggY29tcGxldGVkIC0gZmlyaW5nIGV2ZW50cyBub3cuIGlzQXV0aGVudGljYXRlZDogJyArIGlzQXV0aGVudGljYXRlZCk7XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBpc0F1dGhlbnRpY2F0ZWQsXG4gICAgICAgICAgdXNlckRhdGE6IHRoaXMudXNlclNlcnZpY2UuZ2V0VXNlckRhdGFGcm9tU3RvcmUoY29uZmlnSWQpLFxuICAgICAgICAgIGFjY2Vzc1Rva2VuOiB0aGlzLmF1dGhTdGF0ZVNlcnZpY2UuZ2V0QWNjZXNzVG9rZW4oY29uZmlnSWQpLFxuICAgICAgICAgIGlkVG9rZW46IHRoaXMuYXV0aFN0YXRlU2VydmljZS5nZXRJZFRva2VuKGNvbmZpZ0lkKSxcbiAgICAgICAgICBjb25maWdJZCxcbiAgICAgICAgfTtcbiAgICAgIH0pLFxuICAgICAgdGFwKCh7IGlzQXV0aGVudGljYXRlZCB9KSA9PiB7XG4gICAgICAgIGlmIChpc0F1dGhlbnRpY2F0ZWQpIHtcbiAgICAgICAgICB0aGlzLmF1dG9Mb2dpblNlcnZpY2UuY2hlY2tTYXZlZFJlZGlyZWN0Um91dGVBbmROYXZpZ2F0ZShjb25maWdJZCk7XG4gICAgICAgIH1cbiAgICAgIH0pLFxuICAgICAgY2F0Y2hFcnJvcigoeyBtZXNzYWdlIH0pID0+IHtcbiAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0Vycm9yKGNvbmZpZ0lkLCBtZXNzYWdlKTtcblxuICAgICAgICByZXR1cm4gb2YoeyBpc0F1dGhlbnRpY2F0ZWQ6IGZhbHNlLCBlcnJvck1lc3NhZ2U6IG1lc3NhZ2UsIHVzZXJEYXRhOiBudWxsLCBpZFRva2VuOiBudWxsLCBhY2Nlc3NUb2tlbjogbnVsbCwgY29uZmlnSWQgfSk7XG4gICAgICB9KVxuICAgICk7XG4gIH1cblxuICBwcml2YXRlIHN0YXJ0Q2hlY2tTZXNzaW9uQW5kVmFsaWRhdGlvbihjb25maWdJZDogc3RyaW5nKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuY2hlY2tTZXNzaW9uU2VydmljZS5pc0NoZWNrU2Vzc2lvbkNvbmZpZ3VyZWQoY29uZmlnSWQpKSB7XG4gICAgICB0aGlzLmNoZWNrU2Vzc2lvblNlcnZpY2Uuc3RhcnQoY29uZmlnSWQpO1xuICAgIH1cblxuICAgIHRoaXMucGVyaW9kaWNhbGx5VG9rZW5DaGVja1NlcnZpY2Uuc3RhcnRUb2tlblZhbGlkYXRpb25QZXJpb2RpY2FsbHkoKTtcblxuICAgIGlmICh0aGlzLnNpbGVudFJlbmV3U2VydmljZS5pc1NpbGVudFJlbmV3Q29uZmlndXJlZChjb25maWdJZCkpIHtcbiAgICAgIHRoaXMuc2lsZW50UmVuZXdTZXJ2aWNlLmdldE9yQ3JlYXRlSWZyYW1lKGNvbmZpZ0lkKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGdldENvbmZpZ3VyYXRpb25XaXRoVXJsU3RhdGUoc3RhdGVGcm9tVXJsOiBzdHJpbmcpOiBPcGVuSWRDb25maWd1cmF0aW9uIHtcbiAgICBjb25zdCBhbGxDb25maWdzID0gdGhpcy5jb25maWd1cmF0aW9uUHJvdmlkZXIuZ2V0QWxsQ29uZmlndXJhdGlvbnMoKTtcblxuICAgIGZvciAoY29uc3QgY29uZmlnIG9mIGFsbENvbmZpZ3MpIHtcbiAgICAgIGNvbnN0IHN0b3JlZFN0YXRlID0gdGhpcy5zdG9yYWdlUGVyc2lzdGVuY2VTZXJ2aWNlLnJlYWQoJ2F1dGhTdGF0ZUNvbnRyb2wnLCBjb25maWcuY29uZmlnSWQpO1xuXG4gICAgICBpZiAoc3RvcmVkU3RhdGUgPT09IHN0YXRlRnJvbVVybCkge1xuICAgICAgICByZXR1cm4gY29uZmlnO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgcHJpdmF0ZSBjb21wb3NlTXVsdGlwbGVMb2dpblJlc3VsdHMoYWN0aXZlQ29uZmlnOiBPcGVuSWRDb25maWd1cmF0aW9uLCB1cmw/OiBzdHJpbmcpOiBPYnNlcnZhYmxlPExvZ2luUmVzcG9uc2VbXT4ge1xuICAgIGNvbnN0IGFsbE90aGVyQ29uZmlncyA9IHRoaXMuY29uZmlndXJhdGlvblByb3ZpZGVyLmdldEFsbENvbmZpZ3VyYXRpb25zKCkuZmlsdGVyKCh4KSA9PiB4LmNvbmZpZ0lkICE9PSBhY3RpdmVDb25maWcuY29uZmlnSWQpO1xuXG4gICAgY29uc3QgY3VycmVudENvbmZpZ1Jlc3VsdCA9IHRoaXMuY2hlY2tBdXRoV2l0aENvbmZpZyhhY3RpdmVDb25maWcsIHVybCk7XG5cbiAgICBjb25zdCBhbGxPdGhlckNvbmZpZ1Jlc3VsdHMgPSBhbGxPdGhlckNvbmZpZ3MubWFwKChjb25maWcpID0+IHtcbiAgICAgIGNvbnN0IHsgcmVkaXJlY3RVcmwgfSA9IGNvbmZpZztcblxuICAgICAgcmV0dXJuIHRoaXMuY2hlY2tBdXRoV2l0aENvbmZpZyhjb25maWcsIHJlZGlyZWN0VXJsKTtcbiAgICB9KTtcblxuICAgIHJldHVybiBmb3JrSm9pbihbY3VycmVudENvbmZpZ1Jlc3VsdCwgLi4uYWxsT3RoZXJDb25maWdSZXN1bHRzXSk7XG4gIH1cbn1cbiJdfQ==