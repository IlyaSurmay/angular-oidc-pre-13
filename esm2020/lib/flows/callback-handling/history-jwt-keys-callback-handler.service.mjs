import { Injectable } from '@angular/core';
import { of, throwError } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { ValidationResult } from '../../validation/validation-result';
import * as i0 from "@angular/core";
import * as i1 from "../../logging/logger.service";
import * as i2 from "../../config/provider/config.provider";
import * as i3 from "../../auth-state/auth-state.service";
import * as i4 from "../flows-data.service";
import * as i5 from "../signin-key-data.service";
import * as i6 from "../../storage/storage-persistence.service";
import * as i7 from "../reset-auth-data.service";
const JWT_KEYS = 'jwtKeys';
export class HistoryJwtKeysCallbackHandlerService {
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
HistoryJwtKeysCallbackHandlerService.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: HistoryJwtKeysCallbackHandlerService, deps: [{ token: i1.LoggerService }, { token: i2.ConfigurationProvider }, { token: i3.AuthStateService }, { token: i4.FlowsDataService }, { token: i5.SigninKeyDataService }, { token: i6.StoragePersistenceService }, { token: i7.ResetAuthDataService }], target: i0.ɵɵFactoryTarget.Injectable });
HistoryJwtKeysCallbackHandlerService.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: HistoryJwtKeysCallbackHandlerService });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: HistoryJwtKeysCallbackHandlerService, decorators: [{
            type: Injectable
        }], ctorParameters: function () { return [{ type: i1.LoggerService }, { type: i2.ConfigurationProvider }, { type: i3.AuthStateService }, { type: i4.FlowsDataService }, { type: i5.SigninKeyDataService }, { type: i6.StoragePersistenceService }, { type: i7.ResetAuthDataService }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGlzdG9yeS1qd3Qta2V5cy1jYWxsYmFjay1oYW5kbGVyLnNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy9hbmd1bGFyLWF1dGgtb2lkYy1jbGllbnQvc3JjL2xpYi9mbG93cy9jYWxsYmFjay1oYW5kbGluZy9oaXN0b3J5LWp3dC1rZXlzLWNhbGxiYWNrLWhhbmRsZXIuc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQzNDLE9BQU8sRUFBYyxFQUFFLEVBQUUsVUFBVSxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBQ2xELE9BQU8sRUFBRSxVQUFVLEVBQUUsU0FBUyxFQUFFLEdBQUcsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBTTVELE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLG9DQUFvQyxDQUFDOzs7Ozs7Ozs7QUFNdEUsTUFBTSxRQUFRLEdBQUcsU0FBUyxDQUFDO0FBRzNCLE1BQU0sT0FBTyxvQ0FBb0M7SUFDL0MsWUFDbUIsYUFBNEIsRUFDNUIscUJBQTRDLEVBQzVDLGdCQUFrQyxFQUNsQyxnQkFBa0MsRUFDbEMsb0JBQTBDLEVBQzFDLHlCQUFvRCxFQUNwRCxvQkFBMEM7UUFOMUMsa0JBQWEsR0FBYixhQUFhLENBQWU7UUFDNUIsMEJBQXFCLEdBQXJCLHFCQUFxQixDQUF1QjtRQUM1QyxxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQWtCO1FBQ2xDLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBa0I7UUFDbEMseUJBQW9CLEdBQXBCLG9CQUFvQixDQUFzQjtRQUMxQyw4QkFBeUIsR0FBekIseUJBQXlCLENBQTJCO1FBQ3BELHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBc0I7SUFDMUQsQ0FBQztJQUVKLCtEQUErRDtJQUMvRCw4QkFBOEIsQ0FBQyxlQUFnQyxFQUFFLFFBQWdCO1FBQy9FLElBQUksQ0FBQyx5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O2tCQURoRCxVQUFVIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSW5qZWN0YWJsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgT2JzZXJ2YWJsZSwgb2YsIHRocm93RXJyb3IgfSBmcm9tICdyeGpzJztcbmltcG9ydCB7IGNhdGNoRXJyb3IsIHN3aXRjaE1hcCwgdGFwIH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuaW1wb3J0IHsgQXV0aFN0YXRlU2VydmljZSB9IGZyb20gJy4uLy4uL2F1dGgtc3RhdGUvYXV0aC1zdGF0ZS5zZXJ2aWNlJztcbmltcG9ydCB7IENvbmZpZ3VyYXRpb25Qcm92aWRlciB9IGZyb20gJy4uLy4uL2NvbmZpZy9wcm92aWRlci9jb25maWcucHJvdmlkZXInO1xuaW1wb3J0IHsgTG9nZ2VyU2VydmljZSB9IGZyb20gJy4uLy4uL2xvZ2dpbmcvbG9nZ2VyLnNlcnZpY2UnO1xuaW1wb3J0IHsgU3RvcmFnZVBlcnNpc3RlbmNlU2VydmljZSB9IGZyb20gJy4uLy4uL3N0b3JhZ2Uvc3RvcmFnZS1wZXJzaXN0ZW5jZS5zZXJ2aWNlJztcbmltcG9ydCB7IEp3dEtleXMgfSBmcm9tICcuLi8uLi92YWxpZGF0aW9uL2p3dGtleXMnO1xuaW1wb3J0IHsgVmFsaWRhdGlvblJlc3VsdCB9IGZyb20gJy4uLy4uL3ZhbGlkYXRpb24vdmFsaWRhdGlvbi1yZXN1bHQnO1xuaW1wb3J0IHsgQ2FsbGJhY2tDb250ZXh0IH0gZnJvbSAnLi4vY2FsbGJhY2stY29udGV4dCc7XG5pbXBvcnQgeyBGbG93c0RhdGFTZXJ2aWNlIH0gZnJvbSAnLi4vZmxvd3MtZGF0YS5zZXJ2aWNlJztcbmltcG9ydCB7IFJlc2V0QXV0aERhdGFTZXJ2aWNlIH0gZnJvbSAnLi4vcmVzZXQtYXV0aC1kYXRhLnNlcnZpY2UnO1xuaW1wb3J0IHsgU2lnbmluS2V5RGF0YVNlcnZpY2UgfSBmcm9tICcuLi9zaWduaW4ta2V5LWRhdGEuc2VydmljZSc7XG5cbmNvbnN0IEpXVF9LRVlTID0gJ2p3dEtleXMnO1xuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgSGlzdG9yeUp3dEtleXNDYWxsYmFja0hhbmRsZXJTZXJ2aWNlIHtcbiAgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSByZWFkb25seSBsb2dnZXJTZXJ2aWNlOiBMb2dnZXJTZXJ2aWNlLFxuICAgIHByaXZhdGUgcmVhZG9ubHkgY29uZmlndXJhdGlvblByb3ZpZGVyOiBDb25maWd1cmF0aW9uUHJvdmlkZXIsXG4gICAgcHJpdmF0ZSByZWFkb25seSBhdXRoU3RhdGVTZXJ2aWNlOiBBdXRoU3RhdGVTZXJ2aWNlLFxuICAgIHByaXZhdGUgcmVhZG9ubHkgZmxvd3NEYXRhU2VydmljZTogRmxvd3NEYXRhU2VydmljZSxcbiAgICBwcml2YXRlIHJlYWRvbmx5IHNpZ25JbktleURhdGFTZXJ2aWNlOiBTaWduaW5LZXlEYXRhU2VydmljZSxcbiAgICBwcml2YXRlIHJlYWRvbmx5IHN0b3JhZ2VQZXJzaXN0ZW5jZVNlcnZpY2U6IFN0b3JhZ2VQZXJzaXN0ZW5jZVNlcnZpY2UsXG4gICAgcHJpdmF0ZSByZWFkb25seSByZXNldEF1dGhEYXRhU2VydmljZTogUmVzZXRBdXRoRGF0YVNlcnZpY2VcbiAgKSB7fVxuXG4gIC8vIFNURVAgMyBDb2RlIEZsb3csIFNURVAgMiBJbXBsaWNpdCBGbG93LCBTVEVQIDMgUmVmcmVzaCBUb2tlblxuICBjYWxsYmFja0hpc3RvcnlBbmRSZXNldEp3dEtleXMoY2FsbGJhY2tDb250ZXh0OiBDYWxsYmFja0NvbnRleHQsIGNvbmZpZ0lkOiBzdHJpbmcpOiBPYnNlcnZhYmxlPENhbGxiYWNrQ29udGV4dD4ge1xuICAgIHRoaXMuc3RvcmFnZVBlcnNpc3RlbmNlU2VydmljZS53cml0ZSgnYXV0aG5SZXN1bHQnLCBjYWxsYmFja0NvbnRleHQuYXV0aFJlc3VsdCwgY29uZmlnSWQpO1xuXG4gICAgaWYgKHRoaXMuaGlzdG9yeUNsZWFuVXBUdXJuZWRPbihjb25maWdJZCkgJiYgIWNhbGxiYWNrQ29udGV4dC5pc1JlbmV3UHJvY2Vzcykge1xuICAgICAgdGhpcy5yZXNldEJyb3dzZXJIaXN0b3J5KCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1Zyhjb25maWdJZCwgJ2hpc3RvcnkgY2xlYW4gdXAgaW5hY3RpdmUnKTtcbiAgICB9XG5cbiAgICBpZiAoY2FsbGJhY2tDb250ZXh0LmF1dGhSZXN1bHQuZXJyb3IpIHtcbiAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBBdXRoQ2FsbGJhY2sgQXV0aFJlc3VsdCBjYW1lIHdpdGggZXJyb3I6ICR7Y2FsbGJhY2tDb250ZXh0LmF1dGhSZXN1bHQuZXJyb3J9YDtcbiAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1Zyhjb25maWdJZCwgZXJyb3JNZXNzYWdlKTtcbiAgICAgIHRoaXMucmVzZXRBdXRoRGF0YVNlcnZpY2UucmVzZXRBdXRob3JpemF0aW9uRGF0YShjb25maWdJZCk7XG4gICAgICB0aGlzLmZsb3dzRGF0YVNlcnZpY2Uuc2V0Tm9uY2UoJycsIGNvbmZpZ0lkKTtcbiAgICAgIHRoaXMuaGFuZGxlUmVzdWx0RXJyb3JGcm9tQ2FsbGJhY2soY2FsbGJhY2tDb250ZXh0LmF1dGhSZXN1bHQsIGNhbGxiYWNrQ29udGV4dC5pc1JlbmV3UHJvY2Vzcyk7XG5cbiAgICAgIHJldHVybiB0aHJvd0Vycm9yKCgpID0+IG5ldyBFcnJvcihlcnJvck1lc3NhZ2UpKTtcbiAgICB9XG5cbiAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoXG4gICAgICBjb25maWdJZCxcbiAgICAgIGBBdXRoUmVzdWx0ICcke0pTT04uc3RyaW5naWZ5KGNhbGxiYWNrQ29udGV4dC5hdXRoUmVzdWx0LCBudWxsLCAyKX0nLlxuICAgICAgQXV0aENhbGxiYWNrIGNyZWF0ZWQsIGJlZ2luIHRva2VuIHZhbGlkYXRpb25gXG4gICAgKTtcblxuICAgIHJldHVybiB0aGlzLnNpZ25JbktleURhdGFTZXJ2aWNlLmdldFNpZ25pbmdLZXlzKGNvbmZpZ0lkKS5waXBlKFxuICAgICAgdGFwKChqd3RLZXlzOiBKd3RLZXlzKSA9PiB0aGlzLnN0b3JlU2lnbmluZ0tleXMoand0S2V5cywgY29uZmlnSWQpKSxcbiAgICAgIGNhdGNoRXJyb3IoKGVycikgPT4ge1xuICAgICAgICAvLyBmYWxsYmFjazogdHJ5IHRvIGxvYWQgand0S2V5cyBmcm9tIHN0b3JhZ2VcbiAgICAgICAgY29uc3Qgc3RvcmVkSnd0S2V5cyA9IHRoaXMucmVhZFNpZ25pbmdLZXlzKGNvbmZpZ0lkKTtcbiAgICAgICAgaWYgKCEhc3RvcmVkSnd0S2V5cykge1xuICAgICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dXYXJuaW5nKGNvbmZpZ0lkLCBgRmFpbGVkIHRvIHJldHJpZXZlIHNpZ25pbmcga2V5cywgZmFsbGJhY2sgdG8gc3RvcmVkIGtleXNgKTtcblxuICAgICAgICAgIHJldHVybiBvZihzdG9yZWRKd3RLZXlzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aHJvd0Vycm9yKCgpID0+IG5ldyBFcnJvcihlcnIpKTtcbiAgICAgIH0pLFxuICAgICAgc3dpdGNoTWFwKChqd3RLZXlzKSA9PiB7XG4gICAgICAgIGlmIChqd3RLZXlzKSB7XG4gICAgICAgICAgY2FsbGJhY2tDb250ZXh0Lmp3dEtleXMgPSBqd3RLZXlzO1xuXG4gICAgICAgICAgcmV0dXJuIG9mKGNhbGxiYWNrQ29udGV4dCk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgRmFpbGVkIHRvIHJldHJpZXZlIHNpZ25pbmcga2V5YDtcbiAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ1dhcm5pbmcoY29uZmlnSWQsIGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgcmV0dXJuIHRocm93RXJyb3IoKCkgPT4gbmV3IEVycm9yKGVycm9yTWVzc2FnZSkpO1xuICAgICAgfSksXG4gICAgICBjYXRjaEVycm9yKChlcnIpID0+IHtcbiAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYEZhaWxlZCB0byByZXRyaWV2ZSBzaWduaW5nIGtleSB3aXRoIGVycm9yOiAke2Vycn1gO1xuICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nV2FybmluZyhjb25maWdJZCwgZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICByZXR1cm4gdGhyb3dFcnJvcigoKSA9PiBuZXcgRXJyb3IoZXJyb3JNZXNzYWdlKSk7XG4gICAgICB9KVxuICAgICk7XG4gIH1cblxuICBwcml2YXRlIGhhbmRsZVJlc3VsdEVycm9yRnJvbUNhbGxiYWNrKHJlc3VsdDogYW55LCBpc1JlbmV3UHJvY2VzczogYm9vbGVhbik6IHZvaWQge1xuICAgIGxldCB2YWxpZGF0aW9uUmVzdWx0ID0gVmFsaWRhdGlvblJlc3VsdC5TZWN1cmVUb2tlblNlcnZlckVycm9yO1xuXG4gICAgaWYgKChyZXN1bHQuZXJyb3IgYXMgc3RyaW5nKSA9PT0gJ2xvZ2luX3JlcXVpcmVkJykge1xuICAgICAgdmFsaWRhdGlvblJlc3VsdCA9IFZhbGlkYXRpb25SZXN1bHQuTG9naW5SZXF1aXJlZDtcbiAgICB9XG5cbiAgICB0aGlzLmF1dGhTdGF0ZVNlcnZpY2UudXBkYXRlQW5kUHVibGlzaEF1dGhTdGF0ZSh7XG4gICAgICBpc0F1dGhlbnRpY2F0ZWQ6IGZhbHNlLFxuICAgICAgdmFsaWRhdGlvblJlc3VsdCxcbiAgICAgIGlzUmVuZXdQcm9jZXNzLFxuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBoaXN0b3J5Q2xlYW5VcFR1cm5lZE9uKGNvbmZpZ0lkOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICBjb25zdCB7IGhpc3RvcnlDbGVhbnVwT2ZmIH0gPSB0aGlzLmNvbmZpZ3VyYXRpb25Qcm92aWRlci5nZXRPcGVuSURDb25maWd1cmF0aW9uKGNvbmZpZ0lkKTtcblxuICAgIHJldHVybiAhaGlzdG9yeUNsZWFudXBPZmY7XG4gIH1cblxuICBwcml2YXRlIHJlc2V0QnJvd3Nlckhpc3RvcnkoKTogdm9pZCB7XG4gICAgd2luZG93Lmhpc3RvcnkucmVwbGFjZVN0YXRlKHt9LCB3aW5kb3cuZG9jdW1lbnQudGl0bGUsIHdpbmRvdy5sb2NhdGlvbi5vcmlnaW4gKyB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUpO1xuICB9XG5cbiAgcHJpdmF0ZSBzdG9yZVNpZ25pbmdLZXlzKGp3dEtleXM6IEp3dEtleXMsIGNvbmZpZ0lkOiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLnN0b3JhZ2VQZXJzaXN0ZW5jZVNlcnZpY2Uud3JpdGUoSldUX0tFWVMsIGp3dEtleXMsIGNvbmZpZ0lkKTtcbiAgfVxuXG4gIHByaXZhdGUgcmVhZFNpZ25pbmdLZXlzKGNvbmZpZ0lkOiBzdHJpbmcpOiBhbnkge1xuICAgIHJldHVybiB0aGlzLnN0b3JhZ2VQZXJzaXN0ZW5jZVNlcnZpY2UucmVhZChKV1RfS0VZUywgY29uZmlnSWQpO1xuICB9XG59XG4iXX0=