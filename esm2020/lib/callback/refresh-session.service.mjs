import { Injectable } from '@angular/core';
import { forkJoin, of, throwError, TimeoutError, timer } from 'rxjs';
import { map, mergeMap, retryWhen, switchMap, take, timeout } from 'rxjs/operators';
import * as i0 from "@angular/core";
import * as i1 from "../utils/flowHelper/flow-helper.service";
import * as i2 from "../config/provider/config.provider";
import * as i3 from "../flows/flows-data.service";
import * as i4 from "../logging/logger.service";
import * as i5 from "../iframe/silent-renew.service";
import * as i6 from "../auth-state/auth-state.service";
import * as i7 from "../config/auth-well-known/auth-well-known.service";
import * as i8 from "../iframe/refresh-session-iframe.service";
import * as i9 from "../storage/storage-persistence.service";
import * as i10 from "./refresh-session-refresh-token.service";
import * as i11 from "../user-data/user.service";
export const MAX_RETRY_ATTEMPTS = 3;
export class RefreshSessionService {
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
        const mergedParams = { ...customParamsRefreshTokenRequest, ...extraCustomParams };
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
            const isAuthenticated = this.authStateService.areAuthStorageTokensValid(configId);
            if (isAuthenticated) {
                return {
                    idToken: callbackContext?.authResult?.id_token,
                    accessToken: callbackContext?.authResult?.access_token,
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
RefreshSessionService.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: RefreshSessionService, deps: [{ token: i1.FlowHelper }, { token: i2.ConfigurationProvider }, { token: i3.FlowsDataService }, { token: i4.LoggerService }, { token: i5.SilentRenewService }, { token: i6.AuthStateService }, { token: i7.AuthWellKnownService }, { token: i8.RefreshSessionIframeService }, { token: i9.StoragePersistenceService }, { token: i10.RefreshSessionRefreshTokenService }, { token: i11.UserService }], target: i0.ɵɵFactoryTarget.Injectable });
RefreshSessionService.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: RefreshSessionService, providedIn: 'root' });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: RefreshSessionService, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }], ctorParameters: function () { return [{ type: i1.FlowHelper }, { type: i2.ConfigurationProvider }, { type: i3.FlowsDataService }, { type: i4.LoggerService }, { type: i5.SilentRenewService }, { type: i6.AuthStateService }, { type: i7.AuthWellKnownService }, { type: i8.RefreshSessionIframeService }, { type: i9.StoragePersistenceService }, { type: i10.RefreshSessionRefreshTokenService }, { type: i11.UserService }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVmcmVzaC1zZXNzaW9uLnNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy9hbmd1bGFyLWF1dGgtb2lkYy1jbGllbnQvc3JjL2xpYi9jYWxsYmFjay9yZWZyZXNoLXNlc3Npb24uc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQzNDLE9BQU8sRUFBRSxRQUFRLEVBQWMsRUFBRSxFQUFFLFVBQVUsRUFBRSxZQUFZLEVBQUUsS0FBSyxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBQ2pGLE9BQU8sRUFBRSxHQUFHLEVBQUUsUUFBUSxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxNQUFNLGdCQUFnQixDQUFDOzs7Ozs7Ozs7Ozs7O0FBZXBGLE1BQU0sQ0FBQyxNQUFNLGtCQUFrQixHQUFHLENBQUMsQ0FBQztBQUVwQyxNQUFNLE9BQU8scUJBQXFCO0lBQ2hDLFlBQ1UsVUFBc0IsRUFDdEIscUJBQTRDLEVBQzVDLGdCQUFrQyxFQUNsQyxhQUE0QixFQUM1QixrQkFBc0MsRUFDdEMsZ0JBQWtDLEVBQ2xDLG9CQUEwQyxFQUMxQywyQkFBd0QsRUFDeEQseUJBQW9ELEVBQ3BELGlDQUFvRSxFQUNwRSxXQUF3QjtRQVZ4QixlQUFVLEdBQVYsVUFBVSxDQUFZO1FBQ3RCLDBCQUFxQixHQUFyQixxQkFBcUIsQ0FBdUI7UUFDNUMscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFrQjtRQUNsQyxrQkFBYSxHQUFiLGFBQWEsQ0FBZTtRQUM1Qix1QkFBa0IsR0FBbEIsa0JBQWtCLENBQW9CO1FBQ3RDLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBa0I7UUFDbEMseUJBQW9CLEdBQXBCLG9CQUFvQixDQUFzQjtRQUMxQyxnQ0FBMkIsR0FBM0IsMkJBQTJCLENBQTZCO1FBQ3hELDhCQUF5QixHQUF6Qix5QkFB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RSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEluamVjdGFibGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IGZvcmtKb2luLCBPYnNlcnZhYmxlLCBvZiwgdGhyb3dFcnJvciwgVGltZW91dEVycm9yLCB0aW1lciB9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHsgbWFwLCBtZXJnZU1hcCwgcmV0cnlXaGVuLCBzd2l0Y2hNYXAsIHRha2UsIHRpbWVvdXQgfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5pbXBvcnQgeyBBdXRoU3RhdGVTZXJ2aWNlIH0gZnJvbSAnLi4vYXV0aC1zdGF0ZS9hdXRoLXN0YXRlLnNlcnZpY2UnO1xuaW1wb3J0IHsgQXV0aFdlbGxLbm93blNlcnZpY2UgfSBmcm9tICcuLi9jb25maWcvYXV0aC13ZWxsLWtub3duL2F1dGgtd2VsbC1rbm93bi5zZXJ2aWNlJztcbmltcG9ydCB7IENvbmZpZ3VyYXRpb25Qcm92aWRlciB9IGZyb20gJy4uL2NvbmZpZy9wcm92aWRlci9jb25maWcucHJvdmlkZXInO1xuaW1wb3J0IHsgQ2FsbGJhY2tDb250ZXh0IH0gZnJvbSAnLi4vZmxvd3MvY2FsbGJhY2stY29udGV4dCc7XG5pbXBvcnQgeyBGbG93c0RhdGFTZXJ2aWNlIH0gZnJvbSAnLi4vZmxvd3MvZmxvd3MtZGF0YS5zZXJ2aWNlJztcbmltcG9ydCB7IFJlZnJlc2hTZXNzaW9uSWZyYW1lU2VydmljZSB9IGZyb20gJy4uL2lmcmFtZS9yZWZyZXNoLXNlc3Npb24taWZyYW1lLnNlcnZpY2UnO1xuaW1wb3J0IHsgU2lsZW50UmVuZXdTZXJ2aWNlIH0gZnJvbSAnLi4vaWZyYW1lL3NpbGVudC1yZW5ldy5zZXJ2aWNlJztcbmltcG9ydCB7IExvZ2dlclNlcnZpY2UgfSBmcm9tICcuLi9sb2dnaW5nL2xvZ2dlci5zZXJ2aWNlJztcbmltcG9ydCB7IExvZ2luUmVzcG9uc2UgfSBmcm9tICcuLi9sb2dpbi9sb2dpbi1yZXNwb25zZSc7XG5pbXBvcnQgeyBTdG9yYWdlUGVyc2lzdGVuY2VTZXJ2aWNlIH0gZnJvbSAnLi4vc3RvcmFnZS9zdG9yYWdlLXBlcnNpc3RlbmNlLnNlcnZpY2UnO1xuaW1wb3J0IHsgVXNlclNlcnZpY2UgfSBmcm9tICcuLi91c2VyLWRhdGEvdXNlci5zZXJ2aWNlJztcbmltcG9ydCB7IEZsb3dIZWxwZXIgfSBmcm9tICcuLi91dGlscy9mbG93SGVscGVyL2Zsb3ctaGVscGVyLnNlcnZpY2UnO1xuaW1wb3J0IHsgUmVmcmVzaFNlc3Npb25SZWZyZXNoVG9rZW5TZXJ2aWNlIH0gZnJvbSAnLi9yZWZyZXNoLXNlc3Npb24tcmVmcmVzaC10b2tlbi5zZXJ2aWNlJztcblxuZXhwb3J0IGNvbnN0IE1BWF9SRVRSWV9BVFRFTVBUUyA9IDM7XG5ASW5qZWN0YWJsZSh7IHByb3ZpZGVkSW46ICdyb290JyB9KVxuZXhwb3J0IGNsYXNzIFJlZnJlc2hTZXNzaW9uU2VydmljZSB7XG4gIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUgZmxvd0hlbHBlcjogRmxvd0hlbHBlcixcbiAgICBwcml2YXRlIGNvbmZpZ3VyYXRpb25Qcm92aWRlcjogQ29uZmlndXJhdGlvblByb3ZpZGVyLFxuICAgIHByaXZhdGUgZmxvd3NEYXRhU2VydmljZTogRmxvd3NEYXRhU2VydmljZSxcbiAgICBwcml2YXRlIGxvZ2dlclNlcnZpY2U6IExvZ2dlclNlcnZpY2UsXG4gICAgcHJpdmF0ZSBzaWxlbnRSZW5ld1NlcnZpY2U6IFNpbGVudFJlbmV3U2VydmljZSxcbiAgICBwcml2YXRlIGF1dGhTdGF0ZVNlcnZpY2U6IEF1dGhTdGF0ZVNlcnZpY2UsXG4gICAgcHJpdmF0ZSBhdXRoV2VsbEtub3duU2VydmljZTogQXV0aFdlbGxLbm93blNlcnZpY2UsXG4gICAgcHJpdmF0ZSByZWZyZXNoU2Vzc2lvbklmcmFtZVNlcnZpY2U6IFJlZnJlc2hTZXNzaW9uSWZyYW1lU2VydmljZSxcbiAgICBwcml2YXRlIHN0b3JhZ2VQZXJzaXN0ZW5jZVNlcnZpY2U6IFN0b3JhZ2VQZXJzaXN0ZW5jZVNlcnZpY2UsXG4gICAgcHJpdmF0ZSByZWZyZXNoU2Vzc2lvblJlZnJlc2hUb2tlblNlcnZpY2U6IFJlZnJlc2hTZXNzaW9uUmVmcmVzaFRva2VuU2VydmljZSxcbiAgICBwcml2YXRlIHVzZXJTZXJ2aWNlOiBVc2VyU2VydmljZVxuICApIHt9XG5cbiAgdXNlckZvcmNlUmVmcmVzaFNlc3Npb24oY29uZmlnSWQ6IHN0cmluZywgZXh0cmFDdXN0b21QYXJhbXM/OiB7IFtrZXk6IHN0cmluZ106IHN0cmluZyB8IG51bWJlciB8IGJvb2xlYW4gfSk6IE9ic2VydmFibGU8TG9naW5SZXNwb25zZT4ge1xuICAgIHRoaXMucGVyc2lzdEN1c3RvbVBhcmFtcyhleHRyYUN1c3RvbVBhcmFtcywgY29uZmlnSWQpO1xuXG4gICAgcmV0dXJuIHRoaXMuZm9yY2VSZWZyZXNoU2Vzc2lvbihjb25maWdJZCwgZXh0cmFDdXN0b21QYXJhbXMpO1xuICB9XG5cbiAgZm9yY2VSZWZyZXNoU2Vzc2lvbihjb25maWdJZDogc3RyaW5nLCBleHRyYUN1c3RvbVBhcmFtcz86IHsgW2tleTogc3RyaW5nXTogc3RyaW5nIHwgbnVtYmVyIHwgYm9vbGVhbiB9KTogT2JzZXJ2YWJsZTxMb2dpblJlc3BvbnNlPiB7XG4gICAgY29uc3QgeyBjdXN0b21QYXJhbXNSZWZyZXNoVG9rZW5SZXF1ZXN0IH0gPSB0aGlzLmNvbmZpZ3VyYXRpb25Qcm92aWRlci5nZXRPcGVuSURDb25maWd1cmF0aW9uKCk7XG5cbiAgICBjb25zdCBtZXJnZWRQYXJhbXMgPSB7IC4uLmN1c3RvbVBhcmFtc1JlZnJlc2hUb2tlblJlcXVlc3QsIC4uLmV4dHJhQ3VzdG9tUGFyYW1zIH07XG5cbiAgICBpZiAodGhpcy5mbG93SGVscGVyLmlzQ3VycmVudEZsb3dDb2RlRmxvd1dpdGhSZWZyZXNoVG9rZW5zKGNvbmZpZ0lkKSkge1xuICAgICAgcmV0dXJuIHRoaXMuc3RhcnRSZWZyZXNoU2Vzc2lvbihjb25maWdJZCwgbWVyZ2VkUGFyYW1zKS5waXBlKFxuICAgICAgICBtYXAoKCkgPT4ge1xuICAgICAgICAgIGNvbnN0IGlzQXV0aGVudGljYXRlZCA9IHRoaXMuYXV0aFN0YXRlU2VydmljZS5hcmVBdXRoU3RvcmFnZVRva2Vuc1ZhbGlkKGNvbmZpZ0lkKTtcbiAgICAgICAgICBpZiAoaXNBdXRoZW50aWNhdGVkKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICBpZFRva2VuOiB0aGlzLmF1dGhTdGF0ZVNlcnZpY2UuZ2V0SWRUb2tlbihjb25maWdJZCksXG4gICAgICAgICAgICAgIGFjY2Vzc1Rva2VuOiB0aGlzLmF1dGhTdGF0ZVNlcnZpY2UuZ2V0QWNjZXNzVG9rZW4oY29uZmlnSWQpLFxuICAgICAgICAgICAgICB1c2VyRGF0YTogdGhpcy51c2VyU2VydmljZS5nZXRVc2VyRGF0YUZyb21TdG9yZShjb25maWdJZCksXG4gICAgICAgICAgICAgIGlzQXV0aGVudGljYXRlZCxcbiAgICAgICAgICAgICAgY29uZmlnSWQsXG4gICAgICAgICAgICB9IGFzIExvZ2luUmVzcG9uc2U7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH0pXG4gICAgICApO1xuICAgIH1cblxuICAgIGNvbnN0IHsgc2lsZW50UmVuZXdUaW1lb3V0SW5TZWNvbmRzIH0gPSB0aGlzLmNvbmZpZ3VyYXRpb25Qcm92aWRlci5nZXRPcGVuSURDb25maWd1cmF0aW9uKGNvbmZpZ0lkKTtcbiAgICBjb25zdCB0aW1lT3V0VGltZSA9IHNpbGVudFJlbmV3VGltZW91dEluU2Vjb25kcyAqIDEwMDA7XG5cbiAgICByZXR1cm4gZm9ya0pvaW4oW1xuICAgICAgdGhpcy5zdGFydFJlZnJlc2hTZXNzaW9uKGNvbmZpZ0lkLCBleHRyYUN1c3RvbVBhcmFtcyksXG4gICAgICB0aGlzLnNpbGVudFJlbmV3U2VydmljZS5yZWZyZXNoU2Vzc2lvbldpdGhJRnJhbWVDb21wbGV0ZWQkLnBpcGUodGFrZSgxKSksXG4gICAgXSkucGlwZShcbiAgICAgIHRpbWVvdXQodGltZU91dFRpbWUpLFxuICAgICAgcmV0cnlXaGVuKHRoaXMudGltZW91dFJldHJ5U3RyYXRlZ3kuYmluZCh0aGlzKSksXG4gICAgICBtYXAoKFtfLCBjYWxsYmFja0NvbnRleHRdKSA9PiB7XG4gICAgICAgIGNvbnN0IGlzQXV0aGVudGljYXRlZCA9IHRoaXMuYXV0aFN0YXRlU2VydmljZS5hcmVBdXRoU3RvcmFnZVRva2Vuc1ZhbGlkKGNvbmZpZ0lkKTtcbiAgICAgICAgaWYgKGlzQXV0aGVudGljYXRlZCkge1xuICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBpZFRva2VuOiBjYWxsYmFja0NvbnRleHQ/LmF1dGhSZXN1bHQ/LmlkX3Rva2VuLFxuICAgICAgICAgICAgYWNjZXNzVG9rZW46IGNhbGxiYWNrQ29udGV4dD8uYXV0aFJlc3VsdD8uYWNjZXNzX3Rva2VuLFxuICAgICAgICAgICAgdXNlckRhdGE6IHRoaXMudXNlclNlcnZpY2UuZ2V0VXNlckRhdGFGcm9tU3RvcmUoY29uZmlnSWQpLFxuICAgICAgICAgICAgaXNBdXRoZW50aWNhdGVkLFxuICAgICAgICAgICAgY29uZmlnSWQsXG4gICAgICAgICAgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfSlcbiAgICApO1xuICB9XG5cbiAgcHJpdmF0ZSBwZXJzaXN0Q3VzdG9tUGFyYW1zKGV4dHJhQ3VzdG9tUGFyYW1zOiB7IFtrZXk6IHN0cmluZ106IHN0cmluZyB8IG51bWJlciB8IGJvb2xlYW4gfSwgY29uZmlnSWQ6IHN0cmluZyk6IHZvaWQge1xuICAgIGNvbnN0IHsgdXNlUmVmcmVzaFRva2VuIH0gPSB0aGlzLmNvbmZpZ3VyYXRpb25Qcm92aWRlci5nZXRPcGVuSURDb25maWd1cmF0aW9uKCk7XG5cbiAgICBpZiAoZXh0cmFDdXN0b21QYXJhbXMpIHtcbiAgICAgIGlmICh1c2VSZWZyZXNoVG9rZW4pIHtcbiAgICAgICAgdGhpcy5zdG9yYWdlUGVyc2lzdGVuY2VTZXJ2aWNlLndyaXRlKCdzdG9yYWdlQ3VzdG9tUGFyYW1zUmVmcmVzaCcsIGV4dHJhQ3VzdG9tUGFyYW1zLCBjb25maWdJZCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnN0b3JhZ2VQZXJzaXN0ZW5jZVNlcnZpY2Uud3JpdGUoJ3N0b3JhZ2VDdXN0b21QYXJhbXNBdXRoUmVxdWVzdCcsIGV4dHJhQ3VzdG9tUGFyYW1zLCBjb25maWdJZCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBzdGFydFJlZnJlc2hTZXNzaW9uKFxuICAgIGNvbmZpZ0lkOiBzdHJpbmcsXG4gICAgZXh0cmFDdXN0b21QYXJhbXM/OiB7IFtrZXk6IHN0cmluZ106IHN0cmluZyB8IG51bWJlciB8IGJvb2xlYW4gfVxuICApOiBPYnNlcnZhYmxlPGJvb2xlYW4gfCBDYWxsYmFja0NvbnRleHQgfCBudWxsPiB7XG4gICAgY29uc3QgaXNTaWxlbnRSZW5ld1J1bm5pbmcgPSB0aGlzLmZsb3dzRGF0YVNlcnZpY2UuaXNTaWxlbnRSZW5ld1J1bm5pbmcoY29uZmlnSWQpO1xuICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1Zyhjb25maWdJZCwgYENoZWNraW5nOiBzaWxlbnRSZW5ld1J1bm5pbmc6ICR7aXNTaWxlbnRSZW5ld1J1bm5pbmd9YCk7XG4gICAgY29uc3Qgc2hvdWxkQmVFeGVjdXRlZCA9ICFpc1NpbGVudFJlbmV3UnVubmluZztcblxuICAgIGlmICghc2hvdWxkQmVFeGVjdXRlZCkge1xuICAgICAgcmV0dXJuIG9mKG51bGwpO1xuICAgIH1cblxuICAgIGNvbnN0IHsgYXV0aFdlbGxrbm93bkVuZHBvaW50VXJsIH0gPSB0aGlzLmNvbmZpZ3VyYXRpb25Qcm92aWRlci5nZXRPcGVuSURDb25maWd1cmF0aW9uKGNvbmZpZ0lkKSB8fCB7fTtcblxuICAgIGlmICghYXV0aFdlbGxrbm93bkVuZHBvaW50VXJsKSB7XG4gICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRXJyb3IoY29uZmlnSWQsICdubyBhdXRoV2VsbEtub3duRW5kcG9pbnQgZ2l2ZW4hJyk7XG5cbiAgICAgIHJldHVybiBvZihudWxsKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5hdXRoV2VsbEtub3duU2VydmljZS5nZXRBdXRoV2VsbEtub3duRW5kUG9pbnRzKGF1dGhXZWxsa25vd25FbmRwb2ludFVybCwgY29uZmlnSWQpLnBpcGUoXG4gICAgICBzd2l0Y2hNYXAoKCkgPT4ge1xuICAgICAgICB0aGlzLmZsb3dzRGF0YVNlcnZpY2Uuc2V0U2lsZW50UmVuZXdSdW5uaW5nKGNvbmZpZ0lkKTtcblxuICAgICAgICBpZiAodGhpcy5mbG93SGVscGVyLmlzQ3VycmVudEZsb3dDb2RlRmxvd1dpdGhSZWZyZXNoVG9rZW5zKGNvbmZpZ0lkKSkge1xuICAgICAgICAgIC8vIFJlZnJlc2ggU2Vzc2lvbiB1c2luZyBSZWZyZXNoIHRva2Vuc1xuICAgICAgICAgIHJldHVybiB0aGlzLnJlZnJlc2hTZXNzaW9uUmVmcmVzaFRva2VuU2VydmljZS5yZWZyZXNoU2Vzc2lvbldpdGhSZWZyZXNoVG9rZW5zKGNvbmZpZ0lkLCBleHRyYUN1c3RvbVBhcmFtcyk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcy5yZWZyZXNoU2Vzc2lvbklmcmFtZVNlcnZpY2UucmVmcmVzaFNlc3Npb25XaXRoSWZyYW1lKGNvbmZpZ0lkLCBleHRyYUN1c3RvbVBhcmFtcyk7XG4gICAgICB9KVxuICAgICk7XG4gIH1cblxuICBwcml2YXRlIHRpbWVvdXRSZXRyeVN0cmF0ZWd5KGVycm9yQXR0ZW1wdHM6IE9ic2VydmFibGU8YW55PiwgY29uZmlnSWQ6IHN0cmluZyk6IE9ic2VydmFibGU8bnVtYmVyPiB7XG4gICAgcmV0dXJuIGVycm9yQXR0ZW1wdHMucGlwZShcbiAgICAgIG1lcmdlTWFwKChlcnJvciwgaW5kZXgpID0+IHtcbiAgICAgICAgY29uc3Qgc2NhbGluZ0R1cmF0aW9uID0gMTAwMDtcbiAgICAgICAgY29uc3QgY3VycmVudEF0dGVtcHQgPSBpbmRleCArIDE7XG5cbiAgICAgICAgaWYgKCEoZXJyb3IgaW5zdGFuY2VvZiBUaW1lb3V0RXJyb3IpIHx8IGN1cnJlbnRBdHRlbXB0ID4gTUFYX1JFVFJZX0FUVEVNUFRTKSB7XG4gICAgICAgICAgcmV0dXJuIHRocm93RXJyb3IoKCkgPT4gbmV3IEVycm9yKGVycm9yKSk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoY29uZmlnSWQsIGBmb3JjZVJlZnJlc2hTZXNzaW9uIHRpbWVvdXQuIEF0dGVtcHQgIyR7Y3VycmVudEF0dGVtcHR9YCk7XG5cbiAgICAgICAgdGhpcy5mbG93c0RhdGFTZXJ2aWNlLnJlc2V0U2lsZW50UmVuZXdSdW5uaW5nKGNvbmZpZ0lkKTtcblxuICAgICAgICByZXR1cm4gdGltZXIoY3VycmVudEF0dGVtcHQgKiBzY2FsaW5nRHVyYXRpb24pO1xuICAgICAgfSlcbiAgICApO1xuICB9XG59XG4iXX0=