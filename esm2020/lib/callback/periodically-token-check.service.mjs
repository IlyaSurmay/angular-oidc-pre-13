import { Injectable } from '@angular/core';
import { forkJoin, of, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { EventTypes } from '../public-events/event-types';
import * as i0 from "@angular/core";
import * as i1 from "../flows/reset-auth-data.service";
import * as i2 from "../utils/flowHelper/flow-helper.service";
import * as i3 from "../config/provider/config.provider";
import * as i4 from "../flows/flows-data.service";
import * as i5 from "../logging/logger.service";
import * as i6 from "../user-data/user.service";
import * as i7 from "../auth-state/auth-state.service";
import * as i8 from "../iframe/refresh-session-iframe.service";
import * as i9 from "./refresh-session-refresh-token.service";
import * as i10 from "./interval.service";
import * as i11 from "../storage/storage-persistence.service";
import * as i12 from "../public-events/public-events.service";
export class PeriodicallyTokenCheckService {
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
        if (!config?.silentRenew) {
            this.resetAuthDataService.resetAuthorizationData(configId);
            return of(null);
        }
        this.flowsDataService.setSilentRenewRunning(configId);
        if (this.flowHelper.isCurrentFlowCodeFlowWithRefreshTokens(configId)) {
            // Retrieve Dynamically Set Custom Params for refresh body
            const customParamsRefresh = this.storagePersistenceService.read('storageCustomParamsRefresh', configId) || {};
            const { customParamsRefreshTokenRequest } = this.configurationProvider.getOpenIDConfiguration(configId);
            const mergedParams = { ...customParamsRefreshTokenRequest, ...customParamsRefresh };
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
PeriodicallyTokenCheckService.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: PeriodicallyTokenCheckService, deps: [{ token: i1.ResetAuthDataService }, { token: i2.FlowHelper }, { token: i3.ConfigurationProvider }, { token: i4.FlowsDataService }, { token: i5.LoggerService }, { token: i6.UserService }, { token: i7.AuthStateService }, { token: i8.RefreshSessionIframeService }, { token: i9.RefreshSessionRefreshTokenService }, { token: i10.IntervalService }, { token: i11.StoragePersistenceService }, { token: i12.PublicEventsService }], target: i0.ɵɵFactoryTarget.Injectable });
PeriodicallyTokenCheckService.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: PeriodicallyTokenCheckService, providedIn: 'root' });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: PeriodicallyTokenCheckService, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }], ctorParameters: function () { return [{ type: i1.ResetAuthDataService }, { type: i2.FlowHelper }, { type: i3.ConfigurationProvider }, { type: i4.FlowsDataService }, { type: i5.LoggerService }, { type: i6.UserService }, { type: i7.AuthStateService }, { type: i8.RefreshSessionIframeService }, { type: i9.RefreshSessionRefreshTokenService }, { type: i10.IntervalService }, { type: i11.StoragePersistenceService }, { type: i12.PublicEventsService }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGVyaW9kaWNhbGx5LXRva2VuLWNoZWNrLnNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy9hbmd1bGFyLWF1dGgtb2lkYy1jbGllbnQvc3JjL2xpYi9jYWxsYmFjay9wZXJpb2RpY2FsbHktdG9rZW4tY2hlY2suc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQzNDLE9BQU8sRUFBRSxRQUFRLEVBQWMsRUFBRSxFQUFFLFVBQVUsRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUM1RCxPQUFPLEVBQUUsVUFBVSxFQUFFLFNBQVMsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBUXZELE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7QUFTMUQsTUFBTSxPQUFPLDZCQUE2QjtJQUN4QyxZQUNVLG9CQUEwQyxFQUMxQyxVQUFzQixFQUN0QixxQkFBNEMsRUFDNUMsZ0JBQWtDLEVBQ2xDLGFBQTRCLEVBQzVCLFdBQXdCLEVBQ3hCLGdCQUFrQyxFQUNsQywyQkFBd0QsRUFDeEQsaUNBQW9FLEVBQ3BFLGVBQWdDLEVBQ2hDLHlCQUFvRCxFQUNwRCxtQkFBd0M7UUFYeEMseUJBQW9CLEdBQXBCLG9CQUFvQixDQUFzQjtRQUMxQyxlQUFVLEdBQVYsVUFBVSxDQUFZO1FBQ3RCLDBCQUFxQixHQUFyQixxQkFBcUIsQ0FBdUI7UUFDNUMscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFrQjtRQUNsQyxrQkFBYSxHQUFiLGFBQWEsQ0FBZTtRQUM1QixnQkFBVyxHQUFYLFdBQVcsQ0FBYTtRQUN4QixxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQWtCO1FBQ2xDLGdDQUEyQixHQUEzQiwyQkFBMkIsQ0FBNkI7UUFDeEQsc0NBQWlDLEdBQWpDLGlDQUFpQyxDQUFtQztRQUNwRSxvQkFBZSxHQUFmLGVBQWUsQ0FB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RWxHLElBQUksQ0FBQyxpQkFBaUIsSUFBSSxDQUFDLHFCQUFxQixFQUFFO1lBQ2hELE9BQU8sS0FBSyxDQUFDO1NBQ2Q7UUFFRCxPQUFPLElBQUksQ0FBQztJQUNkLENBQUM7OzBIQWpKVSw2QkFBNkI7OEhBQTdCLDZCQUE2QixjQURoQixNQUFNOzJGQUNuQiw2QkFBNkI7a0JBRHpDLFVBQVU7bUJBQUMsRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFFIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSW5qZWN0YWJsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgZm9ya0pvaW4sIE9ic2VydmFibGUsIG9mLCB0aHJvd0Vycm9yIH0gZnJvbSAncnhqcyc7XG5pbXBvcnQgeyBjYXRjaEVycm9yLCBzd2l0Y2hNYXAgfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5pbXBvcnQgeyBBdXRoU3RhdGVTZXJ2aWNlIH0gZnJvbSAnLi4vYXV0aC1zdGF0ZS9hdXRoLXN0YXRlLnNlcnZpY2UnO1xuaW1wb3J0IHsgT3BlbklkQ29uZmlndXJhdGlvbiB9IGZyb20gJy4uL2NvbmZpZy9vcGVuaWQtY29uZmlndXJhdGlvbic7XG5pbXBvcnQgeyBDb25maWd1cmF0aW9uUHJvdmlkZXIgfSBmcm9tICcuLi9jb25maWcvcHJvdmlkZXIvY29uZmlnLnByb3ZpZGVyJztcbmltcG9ydCB7IEZsb3dzRGF0YVNlcnZpY2UgfSBmcm9tICcuLi9mbG93cy9mbG93cy1kYXRhLnNlcnZpY2UnO1xuaW1wb3J0IHsgUmVzZXRBdXRoRGF0YVNlcnZpY2UgfSBmcm9tICcuLi9mbG93cy9yZXNldC1hdXRoLWRhdGEuc2VydmljZSc7XG5pbXBvcnQgeyBSZWZyZXNoU2Vzc2lvbklmcmFtZVNlcnZpY2UgfSBmcm9tICcuLi9pZnJhbWUvcmVmcmVzaC1zZXNzaW9uLWlmcmFtZS5zZXJ2aWNlJztcbmltcG9ydCB7IExvZ2dlclNlcnZpY2UgfSBmcm9tICcuLi9sb2dnaW5nL2xvZ2dlci5zZXJ2aWNlJztcbmltcG9ydCB7IEV2ZW50VHlwZXMgfSBmcm9tICcuLi9wdWJsaWMtZXZlbnRzL2V2ZW50LXR5cGVzJztcbmltcG9ydCB7IFB1YmxpY0V2ZW50c1NlcnZpY2UgfSBmcm9tICcuLi9wdWJsaWMtZXZlbnRzL3B1YmxpYy1ldmVudHMuc2VydmljZSc7XG5pbXBvcnQgeyBTdG9yYWdlUGVyc2lzdGVuY2VTZXJ2aWNlIH0gZnJvbSAnLi4vc3RvcmFnZS9zdG9yYWdlLXBlcnNpc3RlbmNlLnNlcnZpY2UnO1xuaW1wb3J0IHsgVXNlclNlcnZpY2UgfSBmcm9tICcuLi91c2VyLWRhdGEvdXNlci5zZXJ2aWNlJztcbmltcG9ydCB7IEZsb3dIZWxwZXIgfSBmcm9tICcuLi91dGlscy9mbG93SGVscGVyL2Zsb3ctaGVscGVyLnNlcnZpY2UnO1xuaW1wb3J0IHsgSW50ZXJ2YWxTZXJ2aWNlIH0gZnJvbSAnLi9pbnRlcnZhbC5zZXJ2aWNlJztcbmltcG9ydCB7IFJlZnJlc2hTZXNzaW9uUmVmcmVzaFRva2VuU2VydmljZSB9IGZyb20gJy4vcmVmcmVzaC1zZXNzaW9uLXJlZnJlc2gtdG9rZW4uc2VydmljZSc7XG5cbkBJbmplY3RhYmxlKHsgcHJvdmlkZWRJbjogJ3Jvb3QnIH0pXG5leHBvcnQgY2xhc3MgUGVyaW9kaWNhbGx5VG9rZW5DaGVja1NlcnZpY2Uge1xuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIHJlc2V0QXV0aERhdGFTZXJ2aWNlOiBSZXNldEF1dGhEYXRhU2VydmljZSxcbiAgICBwcml2YXRlIGZsb3dIZWxwZXI6IEZsb3dIZWxwZXIsXG4gICAgcHJpdmF0ZSBjb25maWd1cmF0aW9uUHJvdmlkZXI6IENvbmZpZ3VyYXRpb25Qcm92aWRlcixcbiAgICBwcml2YXRlIGZsb3dzRGF0YVNlcnZpY2U6IEZsb3dzRGF0YVNlcnZpY2UsXG4gICAgcHJpdmF0ZSBsb2dnZXJTZXJ2aWNlOiBMb2dnZXJTZXJ2aWNlLFxuICAgIHByaXZhdGUgdXNlclNlcnZpY2U6IFVzZXJTZXJ2aWNlLFxuICAgIHByaXZhdGUgYXV0aFN0YXRlU2VydmljZTogQXV0aFN0YXRlU2VydmljZSxcbiAgICBwcml2YXRlIHJlZnJlc2hTZXNzaW9uSWZyYW1lU2VydmljZTogUmVmcmVzaFNlc3Npb25JZnJhbWVTZXJ2aWNlLFxuICAgIHByaXZhdGUgcmVmcmVzaFNlc3Npb25SZWZyZXNoVG9rZW5TZXJ2aWNlOiBSZWZyZXNoU2Vzc2lvblJlZnJlc2hUb2tlblNlcnZpY2UsXG4gICAgcHJpdmF0ZSBpbnRlcnZhbFNlcnZpY2U6IEludGVydmFsU2VydmljZSxcbiAgICBwcml2YXRlIHN0b3JhZ2VQZXJzaXN0ZW5jZVNlcnZpY2U6IFN0b3JhZ2VQZXJzaXN0ZW5jZVNlcnZpY2UsXG4gICAgcHJpdmF0ZSBwdWJsaWNFdmVudHNTZXJ2aWNlOiBQdWJsaWNFdmVudHNTZXJ2aWNlXG4gICkge31cblxuICBzdGFydFRva2VuVmFsaWRhdGlvblBlcmlvZGljYWxseSgpOiB2b2lkIHtcbiAgICBjb25zdCBjb25maWdzV2l0aFNpbGVudFJlbmV3RW5hYmxlZCA9IHRoaXMuZ2V0Q29uZmlnc1dpdGhTaWxlbnRSZW5ld0VuYWJsZWQoKTtcbiAgICBpZiAoY29uZmlnc1dpdGhTaWxlbnRSZW5ld0VuYWJsZWQubGVuZ3RoIDw9IDApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCByZWZyZXNoVGltZUluU2Vjb25kcyA9IHRoaXMuZ2V0U21hbGxlc3RSZWZyZXNoVGltZUZyb21Db25maWdzKGNvbmZpZ3NXaXRoU2lsZW50UmVuZXdFbmFibGVkKTtcblxuICAgIGlmICghIXRoaXMuaW50ZXJ2YWxTZXJ2aWNlLnJ1blRva2VuVmFsaWRhdGlvblJ1bm5pbmcpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBTVEFSVCBQRVJJT0RJQ0FMTFkgQ0hFQ0sgT05DRSBBTkQgQ0hFQ0sgRUFDSCBDT05GSUcgV0hJQ0ggSEFTIElUIEVOQUJMRURcbiAgICBjb25zdCBwZXJpb2RpY2FsbHlDaGVjayQgPSB0aGlzLmludGVydmFsU2VydmljZS5zdGFydFBlcmlvZGljVG9rZW5DaGVjayhyZWZyZXNoVGltZUluU2Vjb25kcykucGlwZShcbiAgICAgIHN3aXRjaE1hcCgoKSA9PiB7XG4gICAgICAgIGNvbnN0IG9iamVjdFdpdGhDb25maWdJZHNBbmRSZWZyZXNoRXZlbnQgPSB7fTtcbiAgICAgICAgY29uZmlnc1dpdGhTaWxlbnRSZW5ld0VuYWJsZWQuZm9yRWFjaCgoeyBjb25maWdJZCB9KSA9PiB7XG4gICAgICAgICAgb2JqZWN0V2l0aENvbmZpZ0lkc0FuZFJlZnJlc2hFdmVudFtjb25maWdJZF0gPSB0aGlzLmdldFJlZnJlc2hFdmVudChjb25maWdJZCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiBmb3JrSm9pbihvYmplY3RXaXRoQ29uZmlnSWRzQW5kUmVmcmVzaEV2ZW50KTtcbiAgICAgIH0pXG4gICAgKTtcblxuICAgIHRoaXMuaW50ZXJ2YWxTZXJ2aWNlLnJ1blRva2VuVmFsaWRhdGlvblJ1bm5pbmcgPSBwZXJpb2RpY2FsbHlDaGVjayQuc3Vic2NyaWJlKChvYmplY3RXaXRoQ29uZmlnSWRzKSA9PiB7XG4gICAgICBmb3IgKGNvbnN0IFtrZXksIF9dIG9mIE9iamVjdC5lbnRyaWVzKG9iamVjdFdpdGhDb25maWdJZHMpKSB7XG4gICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1ZyhrZXksICdzaWxlbnQgcmVuZXcsIHBlcmlvZGljIGNoZWNrIGZpbmlzaGVkIScpO1xuXG4gICAgICAgIGlmICh0aGlzLmZsb3dIZWxwZXIuaXNDdXJyZW50Rmxvd0NvZGVGbG93V2l0aFJlZnJlc2hUb2tlbnMoa2V5KSkge1xuICAgICAgICAgIHRoaXMuZmxvd3NEYXRhU2VydmljZS5yZXNldFNpbGVudFJlbmV3UnVubmluZyhrZXkpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIGdldFJlZnJlc2hFdmVudChjb25maWdJZDogc3RyaW5nKTogT2JzZXJ2YWJsZTxhbnk+IHtcbiAgICBjb25zdCBzaG91bGRTdGFydFJlZnJlc2hFdmVudCA9IHRoaXMuc2hvdWxkU3RhcnRQZXJpb2RpY2FsbHlDaGVja0ZvckNvbmZpZyhjb25maWdJZCk7XG5cbiAgICBpZiAoIXNob3VsZFN0YXJ0UmVmcmVzaEV2ZW50KSB7XG4gICAgICByZXR1cm4gb2YobnVsbCk7XG4gICAgfVxuXG4gICAgY29uc3QgcmVmcmVzaEV2ZW50JCA9IHRoaXMuY3JlYXRlUmVmcmVzaEV2ZW50Rm9yQ29uZmlnKGNvbmZpZ0lkKTtcblxuICAgIHRoaXMucHVibGljRXZlbnRzU2VydmljZS5maXJlRXZlbnQoRXZlbnRUeXBlcy5TaWxlbnRSZW5ld1N0YXJ0ZWQpO1xuXG4gICAgY29uc3QgcmVmcmVzaEV2ZW50V2l0aEVycm9ySGFuZGxlciQgPSByZWZyZXNoRXZlbnQkLnBpcGUoXG4gICAgICBjYXRjaEVycm9yKChlcnJvcikgPT4ge1xuICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRXJyb3IoY29uZmlnSWQsICdzaWxlbnQgcmVuZXcgZmFpbGVkIScsIGVycm9yKTtcbiAgICAgICAgdGhpcy5mbG93c0RhdGFTZXJ2aWNlLnJlc2V0U2lsZW50UmVuZXdSdW5uaW5nKGNvbmZpZ0lkKTtcblxuICAgICAgICByZXR1cm4gdGhyb3dFcnJvcigoKSA9PiBuZXcgRXJyb3IoZXJyb3IpKTtcbiAgICAgIH0pXG4gICAgKTtcblxuICAgIHJldHVybiByZWZyZXNoRXZlbnRXaXRoRXJyb3JIYW5kbGVyJDtcbiAgfVxuXG4gIHByaXZhdGUgZ2V0U21hbGxlc3RSZWZyZXNoVGltZUZyb21Db25maWdzKGNvbmZpZ3NXaXRoU2lsZW50UmVuZXdFbmFibGVkOiBPcGVuSWRDb25maWd1cmF0aW9uW10pOiBudW1iZXIge1xuICAgIGNvbnN0IHJlc3VsdCA9IGNvbmZpZ3NXaXRoU2lsZW50UmVuZXdFbmFibGVkLnJlZHVjZSgocHJldiwgY3VycikgPT5cbiAgICAgIHByZXYudG9rZW5SZWZyZXNoSW5TZWNvbmRzIDwgY3Vyci50b2tlblJlZnJlc2hJblNlY29uZHMgPyBwcmV2IDogY3VyclxuICAgICk7XG5cbiAgICByZXR1cm4gcmVzdWx0LnRva2VuUmVmcmVzaEluU2Vjb25kcztcbiAgfVxuXG4gIHByaXZhdGUgZ2V0Q29uZmlnc1dpdGhTaWxlbnRSZW5ld0VuYWJsZWQoKTogT3BlbklkQ29uZmlndXJhdGlvbltdIHtcbiAgICByZXR1cm4gdGhpcy5jb25maWd1cmF0aW9uUHJvdmlkZXIuZ2V0QWxsQ29uZmlndXJhdGlvbnMoKS5maWx0ZXIoKHgpID0+IHguc2lsZW50UmVuZXcpO1xuICB9XG5cbiAgcHJpdmF0ZSBjcmVhdGVSZWZyZXNoRXZlbnRGb3JDb25maWcoY29uZmlnSWQ6IHN0cmluZyk6IE9ic2VydmFibGU8YW55PiB7XG4gICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKGNvbmZpZ0lkLCAnc3RhcnRpbmcgc2lsZW50IHJlbmV3Li4uJyk7XG5cbiAgICBjb25zdCBjb25maWcgPSB0aGlzLmNvbmZpZ3VyYXRpb25Qcm92aWRlci5nZXRPcGVuSURDb25maWd1cmF0aW9uKGNvbmZpZ0lkKTtcblxuICAgIGlmICghY29uZmlnPy5zaWxlbnRSZW5ldykge1xuICAgICAgdGhpcy5yZXNldEF1dGhEYXRhU2VydmljZS5yZXNldEF1dGhvcml6YXRpb25EYXRhKGNvbmZpZ0lkKTtcblxuICAgICAgcmV0dXJuIG9mKG51bGwpO1xuICAgIH1cblxuICAgIHRoaXMuZmxvd3NEYXRhU2VydmljZS5zZXRTaWxlbnRSZW5ld1J1bm5pbmcoY29uZmlnSWQpO1xuXG4gICAgaWYgKHRoaXMuZmxvd0hlbHBlci5pc0N1cnJlbnRGbG93Q29kZUZsb3dXaXRoUmVmcmVzaFRva2Vucyhjb25maWdJZCkpIHtcbiAgICAgIC8vIFJldHJpZXZlIER5bmFtaWNhbGx5IFNldCBDdXN0b20gUGFyYW1zIGZvciByZWZyZXNoIGJvZHlcbiAgICAgIGNvbnN0IGN1c3RvbVBhcmFtc1JlZnJlc2g6IHsgW2tleTogc3RyaW5nXTogc3RyaW5nIHwgbnVtYmVyIHwgYm9vbGVhbiB9ID1cbiAgICAgICAgdGhpcy5zdG9yYWdlUGVyc2lzdGVuY2VTZXJ2aWNlLnJlYWQoJ3N0b3JhZ2VDdXN0b21QYXJhbXNSZWZyZXNoJywgY29uZmlnSWQpIHx8IHt9O1xuXG4gICAgICBjb25zdCB7IGN1c3RvbVBhcmFtc1JlZnJlc2hUb2tlblJlcXVlc3QgfSA9IHRoaXMuY29uZmlndXJhdGlvblByb3ZpZGVyLmdldE9wZW5JRENvbmZpZ3VyYXRpb24oY29uZmlnSWQpO1xuXG4gICAgICBjb25zdCBtZXJnZWRQYXJhbXMgPSB7IC4uLmN1c3RvbVBhcmFtc1JlZnJlc2hUb2tlblJlcXVlc3QsIC4uLmN1c3RvbVBhcmFtc1JlZnJlc2ggfTtcblxuICAgICAgLy8gUmVmcmVzaCBTZXNzaW9uIHVzaW5nIFJlZnJlc2ggdG9rZW5zXG4gICAgICByZXR1cm4gdGhpcy5yZWZyZXNoU2Vzc2lvblJlZnJlc2hUb2tlblNlcnZpY2UucmVmcmVzaFNlc3Npb25XaXRoUmVmcmVzaFRva2Vucyhjb25maWdJZCwgbWVyZ2VkUGFyYW1zKTtcbiAgICB9XG5cbiAgICAvLyBSZXRyaWV2ZSBEeW5hbWljYWxseSBTZXQgQ3VzdG9tIFBhcmFtc1xuICAgIGNvbnN0IGN1c3RvbVBhcmFtczogeyBba2V5OiBzdHJpbmddOiBzdHJpbmcgfCBudW1iZXIgfCBib29sZWFuIH0gPSB0aGlzLnN0b3JhZ2VQZXJzaXN0ZW5jZVNlcnZpY2UucmVhZChcbiAgICAgICdzdG9yYWdlQ3VzdG9tUGFyYW1zQXV0aFJlcXVlc3QnLFxuICAgICAgY29uZmlnSWRcbiAgICApO1xuXG4gICAgcmV0dXJuIHRoaXMucmVmcmVzaFNlc3Npb25JZnJhbWVTZXJ2aWNlLnJlZnJlc2hTZXNzaW9uV2l0aElmcmFtZShjb25maWdJZCwgY3VzdG9tUGFyYW1zKTtcbiAgfVxuXG4gIHByaXZhdGUgc2hvdWxkU3RhcnRQZXJpb2RpY2FsbHlDaGVja0ZvckNvbmZpZyhjb25maWdJZDogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgY29uc3QgaWRUb2tlbiA9IHRoaXMuYXV0aFN0YXRlU2VydmljZS5nZXRJZFRva2VuKGNvbmZpZ0lkKTtcbiAgICBjb25zdCBpc1NpbGVudFJlbmV3UnVubmluZyA9IHRoaXMuZmxvd3NEYXRhU2VydmljZS5pc1NpbGVudFJlbmV3UnVubmluZyhjb25maWdJZCk7XG4gICAgY29uc3QgdXNlckRhdGFGcm9tU3RvcmUgPSB0aGlzLnVzZXJTZXJ2aWNlLmdldFVzZXJEYXRhRnJvbVN0b3JlKGNvbmZpZ0lkKTtcblxuICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1ZyhcbiAgICAgIGNvbmZpZ0lkLFxuICAgICAgYENoZWNraW5nOiBzaWxlbnRSZW5ld1J1bm5pbmc6ICR7aXNTaWxlbnRSZW5ld1J1bm5pbmd9IC0gaGFzIGlkVG9rZW46ICR7ISFpZFRva2VufSAtIGhhcyB1c2VyRGF0YTogJHshIXVzZXJEYXRhRnJvbVN0b3JlfWBcbiAgICApO1xuXG4gICAgY29uc3Qgc2hvdWxkQmVFeGVjdXRlZCA9ICEhdXNlckRhdGFGcm9tU3RvcmUgJiYgIWlzU2lsZW50UmVuZXdSdW5uaW5nICYmICEhaWRUb2tlbjtcblxuICAgIGlmICghc2hvdWxkQmVFeGVjdXRlZCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGNvbnN0IGlkVG9rZW5TdGlsbFZhbGlkID0gdGhpcy5hdXRoU3RhdGVTZXJ2aWNlLmhhc0lkVG9rZW5FeHBpcmVkQW5kUmVuZXdDaGVja0lzRW5hYmxlZChjb25maWdJZCk7XG4gICAgY29uc3QgYWNjZXNzVG9rZW5IYXNFeHBpcmVkID0gdGhpcy5hdXRoU3RhdGVTZXJ2aWNlLmhhc0FjY2Vzc1Rva2VuRXhwaXJlZElmRXhwaXJ5RXhpc3RzKGNvbmZpZ0lkKTtcblxuICAgIGlmICghaWRUb2tlblN0aWxsVmFsaWQgJiYgIWFjY2Vzc1Rva2VuSGFzRXhwaXJlZCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHJldHVybiB0cnVlO1xuICB9XG59XG4iXX0=