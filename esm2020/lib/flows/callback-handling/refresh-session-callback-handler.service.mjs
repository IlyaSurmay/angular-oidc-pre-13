import { Injectable } from '@angular/core';
import { of, throwError } from 'rxjs';
import { TokenValidationService } from '../../validation/token-validation.service';
import * as i0 from "@angular/core";
import * as i1 from "../../logging/logger.service";
import * as i2 from "../../auth-state/auth-state.service";
import * as i3 from "../flows-data.service";
export class RefreshSessionCallbackHandlerService {
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
RefreshSessionCallbackHandlerService.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: RefreshSessionCallbackHandlerService, deps: [{ token: i1.LoggerService }, { token: i2.AuthStateService }, { token: i3.FlowsDataService }], target: i0.ɵɵFactoryTarget.Injectable });
RefreshSessionCallbackHandlerService.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: RefreshSessionCallbackHandlerService });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: RefreshSessionCallbackHandlerService, decorators: [{
            type: Injectable
        }], ctorParameters: function () { return [{ type: i1.LoggerService }, { type: i2.AuthStateService }, { type: i3.FlowsDataService }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVmcmVzaC1zZXNzaW9uLWNhbGxiYWNrLWhhbmRsZXIuc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL2FuZ3VsYXItYXV0aC1vaWRjLWNsaWVudC9zcmMvbGliL2Zsb3dzL2NhbGxiYWNrLWhhbmRsaW5nL3JlZnJlc2gtc2Vzc2lvbi1jYWxsYmFjay1oYW5kbGVyLnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUMzQyxPQUFPLEVBQWMsRUFBRSxFQUFFLFVBQVUsRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUdsRCxPQUFPLEVBQUUsc0JBQXNCLEVBQUUsTUFBTSwyQ0FBMkMsQ0FBQzs7Ozs7QUFLbkYsTUFBTSxPQUFPLG9DQUFvQztJQUMvQyxZQUNtQixhQUE0QixFQUM1QixnQkFBa0MsRUFDbEMsZ0JBQWtDO1FBRmxDLGtCQUFhLEdBQWIsYUFBYSxDQUFlO1FBQzVCLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBa0I7UUFDbEMscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFrQjtJQUNsRCxDQUFDO0lBRUoseUJBQXlCO0lBQ3pCLCtCQUErQixDQUFDLFFBQWdCO1FBQzlDLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxtQ0FBbUMsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUN0RixJQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxRQUFRLEVBQUUsOENBQThDLEdBQUcsU0FBUyxDQUFDLENBQUM7UUFDbEcsTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLGVBQWUsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUNyRSxNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBRTNELElBQUksWUFBWSxFQUFFO1lBQ2hCLE1BQU0sZUFBZSxHQUFHO2dCQUN0QixJQUFJLEVBQUUsSUFBSTtnQkFDVixZQUFZO2dCQUNaLEtBQUssRUFBRSxTQUFTO2dCQUNoQixZQUFZLEVBQUUsSUFBSTtnQkFDbEIsVUFBVSxFQUFFLElBQUk7Z0JBQ2hCLGNBQWMsRUFBRSxJQUFJO2dCQUNwQixPQUFPLEVBQUUsSUFBSTtnQkFDYixnQkFBZ0IsRUFBRSxJQUFJO2dCQUN0QixlQUFlLEVBQUUsT0FBTzthQUN6QixDQUFDO1lBRUYsSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFLGlFQUFpRSxDQUFDLENBQUM7WUFDekcsMEVBQTBFO1lBQzFFLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLENBQUMsc0JBQXNCLENBQUMsNEJBQTRCLEVBQUUsUUFBUSxDQUFDLENBQUM7WUFFOUYsT0FBTyxFQUFFLENBQUMsZUFBZSxDQUFDLENBQUM7U0FDNUI7YUFBTTtZQUNMLE1BQU0sWUFBWSxHQUFHLHNDQUFzQyxDQUFDO1lBQzVELElBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRSxZQUFZLENBQUMsQ0FBQztZQUVwRCxPQUFPLFVBQVUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLEtBQUssQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDO1NBQ2xEO0lBQ0gsQ0FBQzs7aUlBdENVLG9DQUFvQztxSUFBcEMsb0NBQW9DOzJGQUFwQyxvQ0FBb0M7a0JBRGhELFVBQVUiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJbmplY3RhYmxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBPYnNlcnZhYmxlLCBvZiwgdGhyb3dFcnJvciB9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHsgQXV0aFN0YXRlU2VydmljZSB9IGZyb20gJy4uLy4uL2F1dGgtc3RhdGUvYXV0aC1zdGF0ZS5zZXJ2aWNlJztcbmltcG9ydCB7IExvZ2dlclNlcnZpY2UgfSBmcm9tICcuLi8uLi9sb2dnaW5nL2xvZ2dlci5zZXJ2aWNlJztcbmltcG9ydCB7IFRva2VuVmFsaWRhdGlvblNlcnZpY2UgfSBmcm9tICcuLi8uLi92YWxpZGF0aW9uL3Rva2VuLXZhbGlkYXRpb24uc2VydmljZSc7XG5pbXBvcnQgeyBDYWxsYmFja0NvbnRleHQgfSBmcm9tICcuLi9jYWxsYmFjay1jb250ZXh0JztcbmltcG9ydCB7IEZsb3dzRGF0YVNlcnZpY2UgfSBmcm9tICcuLi9mbG93cy1kYXRhLnNlcnZpY2UnO1xuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgUmVmcmVzaFNlc3Npb25DYWxsYmFja0hhbmRsZXJTZXJ2aWNlIHtcbiAgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSByZWFkb25seSBsb2dnZXJTZXJ2aWNlOiBMb2dnZXJTZXJ2aWNlLFxuICAgIHByaXZhdGUgcmVhZG9ubHkgYXV0aFN0YXRlU2VydmljZTogQXV0aFN0YXRlU2VydmljZSxcbiAgICBwcml2YXRlIHJlYWRvbmx5IGZsb3dzRGF0YVNlcnZpY2U6IEZsb3dzRGF0YVNlcnZpY2VcbiAgKSB7fVxuXG4gIC8vIFNURVAgMSBSZWZyZXNoIHNlc3Npb25cbiAgcmVmcmVzaFNlc3Npb25XaXRoUmVmcmVzaFRva2Vucyhjb25maWdJZDogc3RyaW5nKTogT2JzZXJ2YWJsZTxDYWxsYmFja0NvbnRleHQ+IHtcbiAgICBjb25zdCBzdGF0ZURhdGEgPSB0aGlzLmZsb3dzRGF0YVNlcnZpY2UuZ2V0RXhpc3RpbmdPckNyZWF0ZUF1dGhTdGF0ZUNvbnRyb2woY29uZmlnSWQpO1xuICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1Zyhjb25maWdJZCwgJ1JlZnJlc2hTZXNzaW9uIGNyZWF0ZWQuIEFkZGluZyBteWF1dG9zdGF0ZTogJyArIHN0YXRlRGF0YSk7XG4gICAgY29uc3QgcmVmcmVzaFRva2VuID0gdGhpcy5hdXRoU3RhdGVTZXJ2aWNlLmdldFJlZnJlc2hUb2tlbihjb25maWdJZCk7XG4gICAgY29uc3QgaWRUb2tlbiA9IHRoaXMuYXV0aFN0YXRlU2VydmljZS5nZXRJZFRva2VuKGNvbmZpZ0lkKTtcblxuICAgIGlmIChyZWZyZXNoVG9rZW4pIHtcbiAgICAgIGNvbnN0IGNhbGxiYWNrQ29udGV4dCA9IHtcbiAgICAgICAgY29kZTogbnVsbCxcbiAgICAgICAgcmVmcmVzaFRva2VuLFxuICAgICAgICBzdGF0ZTogc3RhdGVEYXRhLFxuICAgICAgICBzZXNzaW9uU3RhdGU6IG51bGwsXG4gICAgICAgIGF1dGhSZXN1bHQ6IG51bGwsXG4gICAgICAgIGlzUmVuZXdQcm9jZXNzOiB0cnVlLFxuICAgICAgICBqd3RLZXlzOiBudWxsLFxuICAgICAgICB2YWxpZGF0aW9uUmVzdWx0OiBudWxsLFxuICAgICAgICBleGlzdGluZ0lkVG9rZW46IGlkVG9rZW4sXG4gICAgICB9O1xuXG4gICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoY29uZmlnSWQsICdmb3VuZCByZWZyZXNoIGNvZGUsIG9idGFpbmluZyBuZXcgY3JlZGVudGlhbHMgd2l0aCByZWZyZXNoIGNvZGUnKTtcbiAgICAgIC8vIE5vbmNlIGlzIG5vdCB1c2VkIHdpdGggcmVmcmVzaCB0b2tlbnM7IGJ1dCBLZXkgY2xvYWsgbWF5IHNlbmQgaXQgYW55d2F5XG4gICAgICB0aGlzLmZsb3dzRGF0YVNlcnZpY2Uuc2V0Tm9uY2UoVG9rZW5WYWxpZGF0aW9uU2VydmljZS5yZWZyZXNoVG9rZW5Ob25jZVBsYWNlaG9sZGVyLCBjb25maWdJZCk7XG5cbiAgICAgIHJldHVybiBvZihjYWxsYmFja0NvbnRleHQpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSAnbm8gcmVmcmVzaCB0b2tlbiBmb3VuZCwgcGxlYXNlIGxvZ2luJztcbiAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dFcnJvcihjb25maWdJZCwgZXJyb3JNZXNzYWdlKTtcblxuICAgICAgcmV0dXJuIHRocm93RXJyb3IoKCkgPT4gbmV3IEVycm9yKGVycm9yTWVzc2FnZSkpO1xuICAgIH1cbiAgfVxufVxuIl19