import { Injectable } from '@angular/core';
import { of, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import * as i0 from "@angular/core";
import * as i1 from "../../logging/logger.service";
import * as i2 from "../../config/provider/config.provider";
import * as i3 from "../../auth-state/auth-state.service";
import * as i4 from "../flows-data.service";
import * as i5 from "../../user-data/user.service";
import * as i6 from "../reset-auth-data.service";
export class UserCallbackHandlerService {
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
UserCallbackHandlerService.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: UserCallbackHandlerService, deps: [{ token: i1.LoggerService }, { token: i2.ConfigurationProvider }, { token: i3.AuthStateService }, { token: i4.FlowsDataService }, { token: i5.UserService }, { token: i6.ResetAuthDataService }], target: i0.ɵɵFactoryTarget.Injectable });
UserCallbackHandlerService.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: UserCallbackHandlerService });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: UserCallbackHandlerService, decorators: [{
            type: Injectable
        }], ctorParameters: function () { return [{ type: i1.LoggerService }, { type: i2.ConfigurationProvider }, { type: i3.AuthStateService }, { type: i4.FlowsDataService }, { type: i5.UserService }, { type: i6.ResetAuthDataService }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlci1jYWxsYmFjay1oYW5kbGVyLnNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy9hbmd1bGFyLWF1dGgtb2lkYy1jbGllbnQvc3JjL2xpYi9mbG93cy9jYWxsYmFjay1oYW5kbGluZy91c2VyLWNhbGxiYWNrLWhhbmRsZXIuc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQzNDLE9BQU8sRUFBYyxFQUFFLEVBQUUsVUFBVSxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBQ2xELE9BQU8sRUFBRSxVQUFVLEVBQUUsU0FBUyxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7Ozs7Ozs7O0FBV3ZELE1BQU0sT0FBTywwQkFBMEI7SUFDckMsWUFDbUIsYUFBNEIsRUFDNUIscUJBQTRDLEVBQzVDLGdCQUFrQyxFQUNsQyxnQkFBa0MsRUFDbEMsV0FBd0IsRUFDeEIsb0JBQTBDO1FBTDFDLGtCQUFhLEdBQWIsYUFBYSxDQUFlO1FBQzVCLDBCQUFxQixHQUFyQixxQkFBcUIsQ0FBdUI7UUFDNUMscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFrQjtRQUNsQyxxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQWtCO1FBQ2xDLGdCQUFXLEdBQVgsV0FBVyxDQUFhO1FBQ3hCLHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBc0I7SUFDMUQsQ0FBQztJQUVKLGtCQUFrQjtJQUNsQixZQUFZLENBQUMsZUFBZ0MsRUFBRSxRQUFnQjtRQUM3RCxNQUFNLEVBQUUsY0FBYyxFQUFFLGdCQUFnQixFQUFFLFVBQVUsRUFBRSxZQUFZLEVBQUUsR0FBRyxlQUFlLENBQUM7UUFDdkYsTUFBTSxFQUFFLFlBQVksRUFBRSw0QkFBNEIsRUFBRSxHQUFHLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxzQkFBc0IsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUVuSCxJQUFJLENBQUMs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ZSc7XG5pbXBvcnQgeyBPYnNlcnZhYmxlLCBvZiwgdGhyb3dFcnJvciB9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHsgY2F0Y2hFcnJvciwgc3dpdGNoTWFwIH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuaW1wb3J0IHsgQXV0aFN0YXRlU2VydmljZSB9IGZyb20gJy4uLy4uL2F1dGgtc3RhdGUvYXV0aC1zdGF0ZS5zZXJ2aWNlJztcbmltcG9ydCB7IENvbmZpZ3VyYXRpb25Qcm92aWRlciB9IGZyb20gJy4uLy4uL2NvbmZpZy9wcm92aWRlci9jb25maWcucHJvdmlkZXInO1xuaW1wb3J0IHsgTG9nZ2VyU2VydmljZSB9IGZyb20gJy4uLy4uL2xvZ2dpbmcvbG9nZ2VyLnNlcnZpY2UnO1xuaW1wb3J0IHsgVXNlclNlcnZpY2UgfSBmcm9tICcuLi8uLi91c2VyLWRhdGEvdXNlci5zZXJ2aWNlJztcbmltcG9ydCB7IFN0YXRlVmFsaWRhdGlvblJlc3VsdCB9IGZyb20gJy4uLy4uL3ZhbGlkYXRpb24vc3RhdGUtdmFsaWRhdGlvbi1yZXN1bHQnO1xuaW1wb3J0IHsgQ2FsbGJhY2tDb250ZXh0IH0gZnJvbSAnLi4vY2FsbGJhY2stY29udGV4dCc7XG5pbXBvcnQgeyBGbG93c0RhdGFTZXJ2aWNlIH0gZnJvbSAnLi4vZmxvd3MtZGF0YS5zZXJ2aWNlJztcbmltcG9ydCB7IFJlc2V0QXV0aERhdGFTZXJ2aWNlIH0gZnJvbSAnLi4vcmVzZXQtYXV0aC1kYXRhLnNlcnZpY2UnO1xuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgVXNlckNhbGxiYWNrSGFuZGxlclNlcnZpY2Uge1xuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIHJlYWRvbmx5IGxvZ2dlclNlcnZpY2U6IExvZ2dlclNlcnZpY2UsXG4gICAgcHJpdmF0ZSByZWFkb25seSBjb25maWd1cmF0aW9uUHJvdmlkZXI6IENvbmZpZ3VyYXRpb25Qcm92aWRlcixcbiAgICBwcml2YXRlIHJlYWRvbmx5IGF1dGhTdGF0ZVNlcnZpY2U6IEF1dGhTdGF0ZVNlcnZpY2UsXG4gICAgcHJpdmF0ZSByZWFkb25seSBmbG93c0RhdGFTZXJ2aWNlOiBGbG93c0RhdGFTZXJ2aWNlLFxuICAgIHByaXZhdGUgcmVhZG9ubHkgdXNlclNlcnZpY2U6IFVzZXJTZXJ2aWNlLFxuICAgIHByaXZhdGUgcmVhZG9ubHkgcmVzZXRBdXRoRGF0YVNlcnZpY2U6IFJlc2V0QXV0aERhdGFTZXJ2aWNlXG4gICkge31cblxuICAvLyBTVEVQIDUgdXNlckRhdGFcbiAgY2FsbGJhY2tVc2VyKGNhbGxiYWNrQ29udGV4dDogQ2FsbGJhY2tDb250ZXh0LCBjb25maWdJZDogc3RyaW5nKTogT2JzZXJ2YWJsZTxDYWxsYmFja0NvbnRleHQ+IHtcbiAgICBjb25zdCB7IGlzUmVuZXdQcm9jZXNzLCB2YWxpZGF0aW9uUmVzdWx0LCBhdXRoUmVzdWx0LCByZWZyZXNoVG9rZW4gfSA9IGNhbGxiYWNrQ29udGV4dDtcbiAgICBjb25zdCB7IGF1dG9Vc2VySW5mbywgcmVuZXdVc2VySW5mb0FmdGVyVG9rZW5SZW5ldyB9ID0gdGhpcy5jb25maWd1cmF0aW9uUHJvdmlkZXIuZ2V0T3BlbklEQ29uZmlndXJhdGlvbihjb25maWdJZCk7XG5cbiAgICBpZiAoIWF1dG9Vc2VySW5mbykge1xuICAgICAgaWYgKCFpc1JlbmV3UHJvY2VzcyB8fCByZW5ld1VzZXJJbmZvQWZ0ZXJUb2tlblJlbmV3KSB7XG4gICAgICAgIC8vIHVzZXJEYXRhIGlzIHNldCB0byB0aGUgaWRfdG9rZW4gZGVjb2RlZCwgYXV0byBnZXQgdXNlciBkYXRhIHNldCB0byBmYWxzZVxuICAgICAgICBpZiAodmFsaWRhdGlvblJlc3VsdC5kZWNvZGVkSWRUb2tlbikge1xuICAgICAgICAgIHRoaXMudXNlclNlcnZpY2Uuc2V0VXNlckRhdGFUb1N0b3JlKHZhbGlkYXRpb25SZXN1bHQuZGVjb2RlZElkVG9rZW4sIGNvbmZpZ0lkKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoIWlzUmVuZXdQcm9jZXNzICYmICFyZWZyZXNoVG9rZW4pIHtcbiAgICAgICAgdGhpcy5mbG93c0RhdGFTZXJ2aWNlLnNldFNlc3Npb25TdGF0ZShhdXRoUmVzdWx0LnNlc3Npb25fc3RhdGUsIGNvbmZpZ0lkKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5wdWJsaXNoQXV0aFN0YXRlKHZhbGlkYXRpb25SZXN1bHQsIGlzUmVuZXdQcm9jZXNzKTtcblxuICAgICAgcmV0dXJuIG9mKGNhbGxiYWNrQ29udGV4dCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMudXNlclNlcnZpY2VcbiAgICAgIC5nZXRBbmRQZXJzaXN0VXNlckRhdGFJblN0b3JlKGNvbmZpZ0lkLCBpc1JlbmV3UHJvY2VzcywgdmFsaWRhdGlvblJlc3VsdC5pZFRva2VuLCB2YWxpZGF0aW9uUmVzdWx0LmRlY29kZWRJZFRva2VuKVxuICAgICAgLnBpcGUoXG4gICAgICAgIHN3aXRjaE1hcCgodXNlckRhdGEpID0+IHtcbiAgICAgICAgICBpZiAoISF1c2VyRGF0YSkge1xuICAgICAgICAgICAgaWYgKCFyZWZyZXNoVG9rZW4pIHtcbiAgICAgICAgICAgICAgdGhpcy5mbG93c0RhdGFTZXJ2aWNlLnNldFNlc3Npb25TdGF0ZShhdXRoUmVzdWx0LnNlc3Npb25fc3RhdGUsIGNvbmZpZ0lkKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5wdWJsaXNoQXV0aFN0YXRlKHZhbGlkYXRpb25SZXN1bHQsIGlzUmVuZXdQcm9jZXNzKTtcblxuICAgICAgICAgICAgcmV0dXJuIG9mKGNhbGxiYWNrQ29udGV4dCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMucmVzZXRBdXRoRGF0YVNlcnZpY2UucmVzZXRBdXRob3JpemF0aW9uRGF0YShjb25maWdJZCk7XG4gICAgICAgICAgICB0aGlzLnB1Ymxpc2hVbmF1dGhlbnRpY2F0ZWRTdGF0ZSh2YWxpZGF0aW9uUmVzdWx0LCBpc1JlbmV3UHJvY2Vzcyk7XG4gICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgQ2FsbGVkIGZvciB1c2VyRGF0YSBidXQgdGhleSB3ZXJlICR7dXNlckRhdGF9YDtcbiAgICAgICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dXYXJuaW5nKGNvbmZpZ0lkLCBlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICByZXR1cm4gdGhyb3dFcnJvcigoKSA9PiBuZXcgRXJyb3IoZXJyb3JNZXNzYWdlKSk7XG4gICAgICAgICAgfVxuICAgICAgICB9KSxcbiAgICAgICAgY2F0Y2hFcnJvcigoZXJyKSA9PiB7XG4gICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYEZhaWxlZCB0byByZXRyaWV2ZSB1c2VyIGluZm8gd2l0aCBlcnJvcjogICR7ZXJyfWA7XG4gICAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ1dhcm5pbmcoY29uZmlnSWQsIGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICByZXR1cm4gdGhyb3dFcnJvcigoKSA9PiBuZXcgRXJyb3IoZXJyb3JNZXNzYWdlKSk7XG4gICAgICAgIH0pXG4gICAgICApO1xuICB9XG5cbiAgcHJpdmF0ZSBwdWJsaXNoQXV0aFN0YXRlKHN0YXRlVmFsaWRhdGlvblJlc3VsdDogU3RhdGVWYWxpZGF0aW9uUmVzdWx0LCBpc1JlbmV3UHJvY2VzczogYm9vbGVhbik6IHZvaWQge1xuICAgIHRoaXMuYXV0aFN0YXRlU2VydmljZS51cGRhdGVBbmRQdWJsaXNoQXV0aFN0YXRlKHtcbiAgICAgIGlzQXV0aGVudGljYXRlZDogdHJ1ZSxcbiAgICAgIHZhbGlkYXRpb25SZXN1bHQ6IHN0YXRlVmFsaWRhdGlvblJlc3VsdC5zdGF0ZSxcbiAgICAgIGlzUmVuZXdQcm9jZXNzLFxuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBwdWJsaXNoVW5hdXRoZW50aWNhdGVkU3RhdGUoc3RhdGVWYWxpZGF0aW9uUmVzdWx0OiBTdGF0ZVZhbGlkYXRpb25SZXN1bHQsIGlzUmVuZXdQcm9jZXNzOiBib29sZWFuKTogdm9pZCB7XG4gICAgdGhpcy5hdXRoU3RhdGVTZXJ2aWNlLnVwZGF0ZUFuZFB1Ymxpc2hBdXRoU3RhdGUoe1xuICAgICAgaXNBdXRoZW50aWNhdGVkOiBmYWxzZSxcbiAgICAgIHZhbGlkYXRpb25SZXN1bHQ6IHN0YXRlVmFsaWRhdGlvblJlc3VsdC5zdGF0ZSxcbiAgICAgIGlzUmVuZXdQcm9jZXNzLFxuICAgIH0pO1xuICB9XG59XG4iXX0=