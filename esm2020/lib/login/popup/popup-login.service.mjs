import { Injectable } from '@angular/core';
import { of, throwError } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';
import * as i0 from "@angular/core";
import * as i1 from "../../logging/logger.service";
import * as i2 from "../response-type-validation/response-type-validation.service";
import * as i3 from "../../utils/url/url.service";
import * as i4 from "../../config/provider/config.provider";
import * as i5 from "../../config/auth-well-known/auth-well-known.service";
import * as i6 from "../popup/popup.service";
import * as i7 from "../../check-auth.service";
export class PopUpLoginService {
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
PopUpLoginService.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: PopUpLoginService, deps: [{ token: i1.LoggerService }, { token: i2.ResponseTypeValidationService }, { token: i3.UrlService }, { token: i4.ConfigurationProvider }, { token: i5.AuthWellKnownService }, { token: i6.PopUpService }, { token: i7.CheckAuthService }], target: i0.ɵɵFactoryTarget.Injectable });
PopUpLoginService.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: PopUpLoginService });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: PopUpLoginService, decorators: [{
            type: Injectable
        }], ctorParameters: function () { return [{ type: i1.LoggerService }, { type: i2.ResponseTypeValidationService }, { type: i3.UrlService }, { type: i4.ConfigurationProvider }, { type: i5.AuthWellKnownService }, { type: i6.PopUpService }, { type: i7.CheckAuthService }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wdXAtbG9naW4uc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL2FuZ3VsYXItYXV0aC1vaWRjLWNsaWVudC9zcmMvbGliL2xvZ2luL3BvcHVwL3BvcHVwLWxvZ2luLnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUMzQyxPQUFPLEVBQWMsRUFBRSxFQUFFLFVBQVUsRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUNsRCxPQUFPLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxNQUFNLGdCQUFnQixDQUFDOzs7Ozs7Ozs7QUFjakQsTUFBTSxPQUFPLGlCQUFpQjtJQUM1QixZQUNVLGFBQTRCLEVBQzVCLDZCQUE0RCxFQUM1RCxVQUFzQixFQUN0QixxQkFBNEMsRUFDNUMsb0JBQTBDLEVBQzFDLFlBQTBCLEVBQzFCLGdCQUFrQztRQU5sQyxrQkFBYSxHQUFiLGFBQWEsQ0FBZTtRQUM1QixrQ0FBNkIsR0FBN0IsNkJBQTZCLENBQStCO1FBQzVELGVBQVUsR0FBVixVQUFVLENBQVk7UUFDdEIsMEJBQXFCLEdBQXJCLHFCQUFxQixDQUF1QjtRQUM1Qyx5QkFBb0IsR0FBcEIsb0JBQW9CLENBQXNCO1FBQzFDLGlCQUFZLEdBQVosWUFBWSxDQUFjO1FBQzFCLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBa0I7SUFDekMsQ0FBQztJQUVKLHNCQUFzQixDQUFDLFFBQWdCLEVBQUUsV0FBeUIsRUFBRSxZQUEyQjtRQUM3RixJQUFJLENBQUMsSUFBSSxDQUFDLDZCQUE2QixDQUFDLDBCQUEwQixDQUFDLFFBQVEsQ0FBQyxFQUFFO1lBQzVFLE1BQU0sWUFBWSxHQUFHLHdCQUF3QixDQUFDO1lBQzlDLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRSxZQUFZLENBQUMsQ0FBQztZQUVwRCxPQUFPLFVBQVUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLEtBQUssQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDO1NBQ2xEO1FBRUQsTUFBTSxFQUFFLHdCQUF3QixFQUFFLEdBQUcsSUFBSSxDQUFDLHFCQUFxQixDQUFDLHNCQUFzQixDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBRWpHLElBQUksQ0FBQyx3QkFBd0IsRUFBRTtZQUM3QixNQUFNLFlBQVksR0FBRyxpQ0FBaUMsQ0FBQztZQUN2RCxJQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxRQUFRLEVBQUUsWUFBWSxDQUFDLENBQUM7WUFFcEQsT0FBTyxVQUFVLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxLQUFLLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQztTQUNsRDtRQUVELElBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRSxvREFBb0QsQ0FBQyxDQUFDO1FBRTVGLE9BQU8sSUFBSSxDQUFDLG9CQUFvQixDQUFDLHlCQUF5QixDQUFDLHdCQUF3QixFQUFFLFFBQVEsQ0FBQyxDQUFDLElBQUksQ0FDakcsU0FBUyxDQUFDLEdBQUcsRUFBRTtZQUNiLE1BQU0sRUFBRSxZQUFZLEVBQUUsR0FBRyxXQUFXLElBQUksRUFBRSxDQUFDO1lBRTNDLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsZUFBZSxDQUFDLFFBQVEsRUFBRSxZQUFZLENBQUMsQ0FBQztZQUV4RSxJQUFJLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsWUFBWSxDQUFDLENBQUM7WUFFbkQsT0FBTyxJQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQ25DLElBQUksQ0FBQyxDQUFDLENBQUMsRUFDUCxTQUFTLENBQUMsQ0FBQyxNQUE4QixFQUFFLEVBQUU7Z0JBQzNDLE1BQU0sRUFBRSxVQUFVLEVBQUUsV0FBVyxFQUFFLEdBQUcsTUFBTSxDQUFDO2dCQUUzQyxJQUFJLFVBQVUsRUFBRTtvQkFDZCxPQUFPLEVBQUUsQ0FBQzt3QkFDUixlQUFlLEVBQUUsS0FBSzt3QkFDdEIsWUFBWSxFQUFFLG1CQUFtQjt3QkFDakMsUUFBUSxFQUFFLElBQUk7d0JBQ2QsT0FBTyxFQUFFLElBQUk7d0JBQ2IsV0FBVyxFQUFFLElBQUk7d0JBQ2pCLFFBQVE7cUJBQ1QsQ0FBQyxDQUFDO2lCQUNKO2dCQUVELE9BQU8sSUFBSSxDQUFDLGdCQUFnQixDQUFDLFNBQVMsQ0FBQyxRQUFRLEVBQUUsV0FBVyxDQUFDLENBQUM7WUFDaEUsQ0FBQyxDQUFDLENBQ0gsQ0FBQztRQUNKLENBQUMsQ0FBQyxDQUNILENBQUM7SUFDSixDQUFDOzs4R0EzRFUsaUJBQWlCO2tIQUFqQixpQkFBaUI7MkZBQWpCLGlCQUFpQjtrQkFEN0IsVUFBVSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEluamVjdGFibGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IE9ic2VydmFibGUsIG9mLCB0aHJvd0Vycm9yIH0gZnJvbSAncnhqcyc7XG5pbXBvcnQgeyBzd2l0Y2hNYXAsIHRha2UgfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5pbXBvcnQgeyBBdXRoT3B0aW9ucyB9IGZyb20gJy4uLy4uL2F1dGgtb3B0aW9ucyc7XG5pbXBvcnQgeyBDaGVja0F1dGhTZXJ2aWNlIH0gZnJvbSAnLi4vLi4vY2hlY2stYXV0aC5zZXJ2aWNlJztcbmltcG9ydCB7IEF1dGhXZWxsS25vd25TZXJ2aWNlIH0gZnJvbSAnLi4vLi4vY29uZmlnL2F1dGgtd2VsbC1rbm93bi9hdXRoLXdlbGwta25vd24uc2VydmljZSc7XG5pbXBvcnQgeyBDb25maWd1cmF0aW9uUHJvdmlkZXIgfSBmcm9tICcuLi8uLi9jb25maWcvcHJvdmlkZXIvY29uZmlnLnByb3ZpZGVyJztcbmltcG9ydCB7IExvZ2dlclNlcnZpY2UgfSBmcm9tICcuLi8uLi9sb2dnaW5nL2xvZ2dlci5zZXJ2aWNlJztcbmltcG9ydCB7IFVybFNlcnZpY2UgfSBmcm9tICcuLi8uLi91dGlscy91cmwvdXJsLnNlcnZpY2UnO1xuaW1wb3J0IHsgTG9naW5SZXNwb25zZSB9IGZyb20gJy4uL2xvZ2luLXJlc3BvbnNlJztcbmltcG9ydCB7IFBvcHVwT3B0aW9ucyB9IGZyb20gJy4uL3BvcHVwL3BvcHVwLW9wdGlvbnMnO1xuaW1wb3J0IHsgUG9wVXBTZXJ2aWNlIH0gZnJvbSAnLi4vcG9wdXAvcG9wdXAuc2VydmljZSc7XG5pbXBvcnQgeyBSZXNwb25zZVR5cGVWYWxpZGF0aW9uU2VydmljZSB9IGZyb20gJy4uL3Jlc3BvbnNlLXR5cGUtdmFsaWRhdGlvbi9yZXNwb25zZS10eXBlLXZhbGlkYXRpb24uc2VydmljZSc7XG5pbXBvcnQgeyBQb3B1cFJlc3VsdFJlY2VpdmVkVXJsIH0gZnJvbSAnLi9wb3B1cC1yZXN1bHQnO1xuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgUG9wVXBMb2dpblNlcnZpY2Uge1xuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIGxvZ2dlclNlcnZpY2U6IExvZ2dlclNlcnZpY2UsXG4gICAgcHJpdmF0ZSByZXNwb25zZVR5cGVWYWxpZGF0aW9uU2VydmljZTogUmVzcG9uc2VUeXBlVmFsaWRhdGlvblNlcnZpY2UsXG4gICAgcHJpdmF0ZSB1cmxTZXJ2aWNlOiBVcmxTZXJ2aWNlLFxuICAgIHByaXZhdGUgY29uZmlndXJhdGlvblByb3ZpZGVyOiBDb25maWd1cmF0aW9uUHJvdmlkZXIsXG4gICAgcHJpdmF0ZSBhdXRoV2VsbEtub3duU2VydmljZTogQXV0aFdlbGxLbm93blNlcnZpY2UsXG4gICAgcHJpdmF0ZSBwb3B1cFNlcnZpY2U6IFBvcFVwU2VydmljZSxcbiAgICBwcml2YXRlIGNoZWNrQXV0aFNlcnZpY2U6IENoZWNrQXV0aFNlcnZpY2VcbiAgKSB7fVxuXG4gIGxvZ2luV2l0aFBvcFVwU3RhbmRhcmQoY29uZmlnSWQ6IHN0cmluZywgYXV0aE9wdGlvbnM/OiBBdXRoT3B0aW9ucywgcG9wdXBPcHRpb25zPzogUG9wdXBPcHRpb25zKTogT2JzZXJ2YWJsZTxMb2dpblJlc3BvbnNlPiB7XG4gICAgaWYgKCF0aGlzLnJlc3BvbnNlVHlwZVZhbGlkYXRpb25TZXJ2aWNlLmhhc0NvbmZpZ1ZhbGlkUmVzcG9uc2VUeXBlKGNvbmZpZ0lkKSkge1xuICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gJ0ludmFsaWQgcmVzcG9uc2UgdHlwZSEnO1xuICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0Vycm9yKGNvbmZpZ0lkLCBlcnJvck1lc3NhZ2UpO1xuXG4gICAgICByZXR1cm4gdGhyb3dFcnJvcigoKSA9PiBuZXcgRXJyb3IoZXJyb3JNZXNzYWdlKSk7XG4gICAgfVxuXG4gICAgY29uc3QgeyBhdXRoV2VsbGtub3duRW5kcG9pbnRVcmwgfSA9IHRoaXMuY29uZmlndXJhdGlvblByb3ZpZGVyLmdldE9wZW5JRENvbmZpZ3VyYXRpb24oY29uZmlnSWQpO1xuXG4gICAgaWYgKCFhdXRoV2VsbGtub3duRW5kcG9pbnRVcmwpIHtcbiAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9ICdubyBhdXRoV2VsbGtub3duRW5kcG9pbnQgZ2l2ZW4hJztcbiAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dFcnJvcihjb25maWdJZCwgZXJyb3JNZXNzYWdlKTtcblxuICAgICAgcmV0dXJuIHRocm93RXJyb3IoKCkgPT4gbmV3IEVycm9yKGVycm9yTWVzc2FnZSkpO1xuICAgIH1cblxuICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1Zyhjb25maWdJZCwgJ0JFR0lOIEF1dGhvcml6ZSBPSURDIEZsb3cgd2l0aCBwb3B1cCwgbm8gYXV0aCBkYXRhJyk7XG5cbiAgICByZXR1cm4gdGhpcy5hdXRoV2VsbEtub3duU2VydmljZS5nZXRBdXRoV2VsbEtub3duRW5kUG9pbnRzKGF1dGhXZWxsa25vd25FbmRwb2ludFVybCwgY29uZmlnSWQpLnBpcGUoXG4gICAgICBzd2l0Y2hNYXAoKCkgPT4ge1xuICAgICAgICBjb25zdCB7IGN1c3RvbVBhcmFtcyB9ID0gYXV0aE9wdGlvbnMgfHwge307XG5cbiAgICAgICAgY29uc3QgYXV0aFVybCA9IHRoaXMudXJsU2VydmljZS5nZXRBdXRob3JpemVVcmwoY29uZmlnSWQsIGN1c3RvbVBhcmFtcyk7XG5cbiAgICAgICAgdGhpcy5wb3B1cFNlcnZpY2Uub3BlblBvcFVwKGF1dGhVcmwsIHBvcHVwT3B0aW9ucyk7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMucG9wdXBTZXJ2aWNlLnJlc3VsdCQucGlwZShcbiAgICAgICAgICB0YWtlKDEpLFxuICAgICAgICAgIHN3aXRjaE1hcCgocmVzdWx0OiBQb3B1cFJlc3VsdFJlY2VpdmVkVXJsKSA9PiB7XG4gICAgICAgICAgICBjb25zdCB7IHVzZXJDbG9zZWQsIHJlY2VpdmVkVXJsIH0gPSByZXN1bHQ7XG5cbiAgICAgICAgICAgIGlmICh1c2VyQ2xvc2VkKSB7XG4gICAgICAgICAgICAgIHJldHVybiBvZih7XG4gICAgICAgICAgICAgICAgaXNBdXRoZW50aWNhdGVkOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6ICdVc2VyIGNsb3NlZCBwb3B1cCcsXG4gICAgICAgICAgICAgICAgdXNlckRhdGE6IG51bGwsXG4gICAgICAgICAgICAgICAgaWRUb2tlbjogbnVsbCxcbiAgICAgICAgICAgICAgICBhY2Nlc3NUb2tlbjogbnVsbCxcbiAgICAgICAgICAgICAgICBjb25maWdJZCxcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNoZWNrQXV0aFNlcnZpY2UuY2hlY2tBdXRoKGNvbmZpZ0lkLCByZWNlaXZlZFVybCk7XG4gICAgICAgICAgfSlcbiAgICAgICAgKTtcbiAgICAgIH0pXG4gICAgKTtcbiAgfVxufVxuIl19