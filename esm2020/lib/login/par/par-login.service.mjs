import { Injectable } from '@angular/core';
import { of, throwError } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';
import * as i0 from "@angular/core";
import * as i1 from "../../logging/logger.service";
import * as i2 from "../response-type-validation/response-type-validation.service";
import * as i3 from "../../utils/url/url.service";
import * as i4 from "../../utils/redirect/redirect.service";
import * as i5 from "../../config/provider/config.provider";
import * as i6 from "../../config/auth-well-known/auth-well-known.service";
import * as i7 from "../popup/popup.service";
import * as i8 from "../../check-auth.service";
import * as i9 from "./par.service";
export class ParLoginService {
    constructor(loggerService, responseTypeValidationService, urlService, redirectService, configurationProvider, authWellKnownService, popupService, checkAuthService, parService) {
        this.loggerService = loggerService;
        this.responseTypeValidationService = responseTypeValidationService;
        this.urlService = urlService;
        this.redirectService = redirectService;
        this.configurationProvider = configurationProvider;
        this.authWellKnownService = authWellKnownService;
        this.popupService = popupService;
        this.checkAuthService = checkAuthService;
        this.parService = parService;
    }
    loginPar(configId, authOptions) {
        if (!this.responseTypeValidationService.hasConfigValidResponseType(configId)) {
            this.loggerService.logError(configId, 'Invalid response type!');
            return;
        }
        const { authWellknownEndpointUrl } = this.configurationProvider.getOpenIDConfiguration(configId);
        if (!authWellknownEndpointUrl) {
            this.loggerService.logError(configId, 'no authWellknownEndpoint given!');
            return;
        }
        this.loggerService.logDebug(configId, 'BEGIN Authorize OIDC Flow, no auth data');
        const { urlHandler, customParams } = authOptions || {};
        this.authWellKnownService
            .getAuthWellKnownEndPoints(authWellknownEndpointUrl, configId)
            .pipe(switchMap(() => this.parService.postParRequest(configId, customParams)))
            .subscribe((response) => {
            this.loggerService.logDebug(configId, 'par response: ', response);
            const url = this.urlService.getAuthorizeParUrl(response.requestUri, configId);
            this.loggerService.logDebug(configId, 'par request url: ', url);
            if (!url) {
                this.loggerService.logError(configId, `Could not create URL with param ${response.requestUri}: '${url}'`);
                return;
            }
            if (urlHandler) {
                urlHandler(url);
            }
            else {
                this.redirectService.redirectTo(url);
            }
        });
    }
    loginWithPopUpPar(configId, authOptions, popupOptions) {
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
        const { customParams } = authOptions || {};
        return this.authWellKnownService.getAuthWellKnownEndPoints(authWellknownEndpointUrl, configId).pipe(switchMap(() => this.parService.postParRequest(configId, customParams)), switchMap((response) => {
            this.loggerService.logDebug(configId, 'par response: ', response);
            const url = this.urlService.getAuthorizeParUrl(response.requestUri, configId);
            this.loggerService.logDebug(configId, 'par request url: ', url);
            if (!url) {
                const errorMessage = `Could not create URL with param ${response.requestUri}: 'url'`;
                this.loggerService.logError(configId, errorMessage);
                return throwError(() => new Error(errorMessage));
            }
            this.popupService.openPopUp(url, popupOptions);
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
ParLoginService.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: ParLoginService, deps: [{ token: i1.LoggerService }, { token: i2.ResponseTypeValidationService }, { token: i3.UrlService }, { token: i4.RedirectService }, { token: i5.ConfigurationProvider }, { token: i6.AuthWellKnownService }, { token: i7.PopUpService }, { token: i8.CheckAuthService }, { token: i9.ParService }], target: i0.ɵɵFactoryTarget.Injectable });
ParLoginService.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: ParLoginService });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: ParLoginService, decorators: [{
            type: Injectable
        }], ctorParameters: function () { return [{ type: i1.LoggerService }, { type: i2.ResponseTypeValidationService }, { type: i3.UrlService }, { type: i4.RedirectService }, { type: i5.ConfigurationProvider }, { type: i6.AuthWellKnownService }, { type: i7.PopUpService }, { type: i8.CheckAuthService }, { type: i9.ParService }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFyLWxvZ2luLnNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy9hbmd1bGFyLWF1dGgtb2lkYy1jbGllbnQvc3JjL2xpYi9sb2dpbi9wYXIvcGFyLWxvZ2luLnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUMzQyxPQUFPLEVBQWMsRUFBRSxFQUFFLFVBQVUsRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUNsRCxPQUFPLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxNQUFNLGdCQUFnQixDQUFDOzs7Ozs7Ozs7OztBQWlCakQsTUFBTSxPQUFPLGVBQWU7SUFDMUIsWUFDVSxhQUE0QixFQUM1Qiw2QkFBNEQsRUFDNUQsVUFBc0IsRUFDdEIsZUFBZ0MsRUFDaEMscUJBQTRDLEVBQzVDLG9CQUEwQyxFQUMxQyxZQUEwQixFQUMxQixnQkFBa0MsRUFDbEMsVUFBc0I7UUFSdEIsa0JBQWEsR0FBYixhQUFhLENBQWU7UUFDNUIsa0NBQTZCLEdBQTdCLDZCQUE2QixDQUErQjtRQUM1RCxlQUFVLEdBQVYsVUFBVSxDQUFZO1FBQ3RCLG9CQUFlLEdBQWYsZUFBZSxDQUFpQjtRQUNoQywwQkFBcUIsR0FBckIscUJBQXFCLENBQXVCO1FBQzVDLHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBc0I7UUFDMUMsaUJBQVksR0FBWixZQUFZLENBQWM7UUFDMUIscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFrQjtRQUNsQyxlQUFVLEdBQVYsVUFBVSxDQUFZO0lBQzdCLENBQUM7SUFFSixRQUFRLENBQUMsUUFBZ0IsRUFBRSxXQUF5QjtRQUNsRCxJQUFJLENBQUMsSUFBSSxDQUFDLDZCQUE2QixDQUFDLDBCQUEwQixDQUFDLFFBQVEsQ0FBQyxFQUFFO1lBQzVFLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRSx3QkFB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QyxRQUFRLEVBQUUsSUFBSTt3QkFDZCxPQUFPLEVBQUUsSUFBSTt3QkFDYixXQUFXLEVBQUUsSUFBSTt3QkFDakIsUUFBUTtxQkFDVCxDQUFDLENBQUM7aUJBQ0o7Z0JBRUQsT0FBTyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxDQUFDLFFBQVEsRUFBRSxXQUFXLENBQUMsQ0FBQztZQUNoRSxDQUFDLENBQUMsQ0FDSCxDQUFDO1FBQ0osQ0FBQyxDQUFDLENBQ0gsQ0FBQztJQUNKLENBQUM7OzRHQXBIVSxlQUFlO2dIQUFmLGVBQWU7MkZBQWYsZUFBZTtrQkFEM0IsVUFBVSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEluamVjdGFibGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IE9ic2VydmFibGUsIG9mLCB0aHJvd0Vycm9yIH0gZnJvbSAncnhqcyc7XG5pbXBvcnQgeyBzd2l0Y2hNYXAsIHRha2UgfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5pbXBvcnQgeyBBdXRoT3B0aW9ucyB9IGZyb20gJy4uLy4uL2F1dGgtb3B0aW9ucyc7XG5pbXBvcnQgeyBDaGVja0F1dGhTZXJ2aWNlIH0gZnJvbSAnLi4vLi4vY2hlY2stYXV0aC5zZXJ2aWNlJztcbmltcG9ydCB7IEF1dGhXZWxsS25vd25TZXJ2aWNlIH0gZnJvbSAnLi4vLi4vY29uZmlnL2F1dGgtd2VsbC1rbm93bi9hdXRoLXdlbGwta25vd24uc2VydmljZSc7XG5pbXBvcnQgeyBDb25maWd1cmF0aW9uUHJvdmlkZXIgfSBmcm9tICcuLi8uLi9jb25maWcvcHJvdmlkZXIvY29uZmlnLnByb3ZpZGVyJztcbmltcG9ydCB7IExvZ2dlclNlcnZpY2UgfSBmcm9tICcuLi8uLi9sb2dnaW5nL2xvZ2dlci5zZXJ2aWNlJztcbmltcG9ydCB7IFJlZGlyZWN0U2VydmljZSB9IGZyb20gJy4uLy4uL3V0aWxzL3JlZGlyZWN0L3JlZGlyZWN0LnNlcnZpY2UnO1xuaW1wb3J0IHsgVXJsU2VydmljZSB9IGZyb20gJy4uLy4uL3V0aWxzL3VybC91cmwuc2VydmljZSc7XG5pbXBvcnQgeyBMb2dpblJlc3BvbnNlIH0gZnJvbSAnLi4vbG9naW4tcmVzcG9uc2UnO1xuaW1wb3J0IHsgUG9wdXBPcHRpb25zIH0gZnJvbSAnLi4vcG9wdXAvcG9wdXAtb3B0aW9ucyc7XG5pbXBvcnQgeyBQb3B1cFJlc3VsdFJlY2VpdmVkVXJsIH0gZnJvbSAnLi4vcG9wdXAvcG9wdXAtcmVzdWx0JztcbmltcG9ydCB7IFBvcFVwU2VydmljZSB9IGZyb20gJy4uL3BvcHVwL3BvcHVwLnNlcnZpY2UnO1xuaW1wb3J0IHsgUmVzcG9uc2VUeXBlVmFsaWRhdGlvblNlcnZpY2UgfSBmcm9tICcuLi9yZXNwb25zZS10eXBlLXZhbGlkYXRpb24vcmVzcG9uc2UtdHlwZS12YWxpZGF0aW9uLnNlcnZpY2UnO1xuaW1wb3J0IHsgUGFyUmVzcG9uc2UgfSBmcm9tICcuL3Bhci1yZXNwb25zZSc7XG5pbXBvcnQgeyBQYXJTZXJ2aWNlIH0gZnJvbSAnLi9wYXIuc2VydmljZSc7XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBQYXJMb2dpblNlcnZpY2Uge1xuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIGxvZ2dlclNlcnZpY2U6IExvZ2dlclNlcnZpY2UsXG4gICAgcHJpdmF0ZSByZXNwb25zZVR5cGVWYWxpZGF0aW9uU2VydmljZTogUmVzcG9uc2VUeXBlVmFsaWRhdGlvblNlcnZpY2UsXG4gICAgcHJpdmF0ZSB1cmxTZXJ2aWNlOiBVcmxTZXJ2aWNlLFxuICAgIHByaXZhdGUgcmVkaXJlY3RTZXJ2aWNlOiBSZWRpcmVjdFNlcnZpY2UsXG4gICAgcHJpdmF0ZSBjb25maWd1cmF0aW9uUHJvdmlkZXI6IENvbmZpZ3VyYXRpb25Qcm92aWRlcixcbiAgICBwcml2YXRlIGF1dGhXZWxsS25vd25TZXJ2aWNlOiBBdXRoV2VsbEtub3duU2VydmljZSxcbiAgICBwcml2YXRlIHBvcHVwU2VydmljZTogUG9wVXBTZXJ2aWNlLFxuICAgIHByaXZhdGUgY2hlY2tBdXRoU2VydmljZTogQ2hlY2tBdXRoU2VydmljZSxcbiAgICBwcml2YXRlIHBhclNlcnZpY2U6IFBhclNlcnZpY2VcbiAgKSB7fVxuXG4gIGxvZ2luUGFyKGNvbmZpZ0lkOiBzdHJpbmcsIGF1dGhPcHRpb25zPzogQXV0aE9wdGlvbnMpOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMucmVzcG9uc2VUeXBlVmFsaWRhdGlvblNlcnZpY2UuaGFzQ29uZmlnVmFsaWRSZXNwb25zZVR5cGUoY29uZmlnSWQpKSB7XG4gICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRXJyb3IoY29uZmlnSWQsICdJbnZhbGlkIHJlc3BvbnNlIHR5cGUhJyk7XG5cbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCB7IGF1dGhXZWxsa25vd25FbmRwb2ludFVybCB9ID0gdGhpcy5jb25maWd1cmF0aW9uUHJvdmlkZXIuZ2V0T3BlbklEQ29uZmlndXJhdGlvbihjb25maWdJZCk7XG5cbiAgICBpZiAoIWF1dGhXZWxsa25vd25FbmRwb2ludFVybCkge1xuICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0Vycm9yKGNvbmZpZ0lkLCAnbm8gYXV0aFdlbGxrbm93bkVuZHBvaW50IGdpdmVuIScpO1xuXG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKGNvbmZpZ0lkLCAnQkVHSU4gQXV0aG9yaXplIE9JREMgRmxvdywgbm8gYXV0aCBkYXRhJyk7XG5cbiAgICBjb25zdCB7IHVybEhhbmRsZXIsIGN1c3RvbVBhcmFtcyB9ID0gYXV0aE9wdGlvbnMgfHwge307XG5cbiAgICB0aGlzLmF1dGhXZWxsS25vd25TZXJ2aWNlXG4gICAgICAuZ2V0QXV0aFdlbGxLbm93bkVuZFBvaW50cyhhdXRoV2VsbGtub3duRW5kcG9pbnRVcmwsIGNvbmZpZ0lkKVxuICAgICAgLnBpcGUoc3dpdGNoTWFwKCgpID0+IHRoaXMucGFyU2VydmljZS5wb3N0UGFyUmVxdWVzdChjb25maWdJZCwgY3VzdG9tUGFyYW1zKSkpXG4gICAgICAuc3Vic2NyaWJlKChyZXNwb25zZSkgPT4ge1xuICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoY29uZmlnSWQsICdwYXIgcmVzcG9uc2U6ICcsIHJlc3BvbnNlKTtcblxuICAgICAgICBjb25zdCB1cmwgPSB0aGlzLnVybFNlcnZpY2UuZ2V0QXV0aG9yaXplUGFyVXJsKHJlc3BvbnNlLnJlcXVlc3RVcmksIGNvbmZpZ0lkKTtcblxuICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoY29uZmlnSWQsICdwYXIgcmVxdWVzdCB1cmw6ICcsIHVybCk7XG5cbiAgICAgICAgaWYgKCF1cmwpIHtcbiAgICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRXJyb3IoY29uZmlnSWQsIGBDb3VsZCBub3QgY3JlYXRlIFVSTCB3aXRoIHBhcmFtICR7cmVzcG9uc2UucmVxdWVzdFVyaX06ICcke3VybH0nYCk7XG5cbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodXJsSGFuZGxlcikge1xuICAgICAgICAgIHVybEhhbmRsZXIodXJsKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLnJlZGlyZWN0U2VydmljZS5yZWRpcmVjdFRvKHVybCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICB9XG5cbiAgbG9naW5XaXRoUG9wVXBQYXIoY29uZmlnSWQ6IHN0cmluZywgYXV0aE9wdGlvbnM/OiBBdXRoT3B0aW9ucywgcG9wdXBPcHRpb25zPzogUG9wdXBPcHRpb25zKTogT2JzZXJ2YWJsZTxMb2dpblJlc3BvbnNlPiB7XG4gICAgaWYgKCF0aGlzLnJlc3BvbnNlVHlwZVZhbGlkYXRpb25TZXJ2aWNlLmhhc0NvbmZpZ1ZhbGlkUmVzcG9uc2VUeXBlKGNvbmZpZ0lkKSkge1xuICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gJ0ludmFsaWQgcmVzcG9uc2UgdHlwZSEnO1xuICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0Vycm9yKGNvbmZpZ0lkLCBlcnJvck1lc3NhZ2UpO1xuXG4gICAgICByZXR1cm4gdGhyb3dFcnJvcigoKSA9PiBuZXcgRXJyb3IoZXJyb3JNZXNzYWdlKSk7XG4gICAgfVxuXG4gICAgY29uc3QgeyBhdXRoV2VsbGtub3duRW5kcG9pbnRVcmwgfSA9IHRoaXMuY29uZmlndXJhdGlvblByb3ZpZGVyLmdldE9wZW5JRENvbmZpZ3VyYXRpb24oY29uZmlnSWQpO1xuXG4gICAgaWYgKCFhdXRoV2VsbGtub3duRW5kcG9pbnRVcmwpIHtcbiAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9ICdubyBhdXRoV2VsbGtub3duRW5kcG9pbnQgZ2l2ZW4hJztcbiAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dFcnJvcihjb25maWdJZCwgZXJyb3JNZXNzYWdlKTtcblxuICAgICAgcmV0dXJuIHRocm93RXJyb3IoKCkgPT4gbmV3IEVycm9yKGVycm9yTWVzc2FnZSkpO1xuICAgIH1cblxuICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1Zyhjb25maWdJZCwgJ0JFR0lOIEF1dGhvcml6ZSBPSURDIEZsb3cgd2l0aCBwb3B1cCwgbm8gYXV0aCBkYXRhJyk7XG5cbiAgICBjb25zdCB7IGN1c3RvbVBhcmFtcyB9ID0gYXV0aE9wdGlvbnMgfHwge307XG5cbiAgICByZXR1cm4gdGhpcy5hdXRoV2VsbEtub3duU2VydmljZS5nZXRBdXRoV2VsbEtub3duRW5kUG9pbnRzKGF1dGhXZWxsa25vd25FbmRwb2ludFVybCwgY29uZmlnSWQpLnBpcGUoXG4gICAgICBzd2l0Y2hNYXAoKCkgPT4gdGhpcy5wYXJTZXJ2aWNlLnBvc3RQYXJSZXF1ZXN0KGNvbmZpZ0lkLCBjdXN0b21QYXJhbXMpKSxcbiAgICAgIHN3aXRjaE1hcCgocmVzcG9uc2U6IFBhclJlc3BvbnNlKSA9PiB7XG4gICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1Zyhjb25maWdJZCwgJ3BhciByZXNwb25zZTogJywgcmVzcG9uc2UpO1xuXG4gICAgICAgIGNvbnN0IHVybCA9IHRoaXMudXJsU2VydmljZS5nZXRBdXRob3JpemVQYXJVcmwocmVzcG9uc2UucmVxdWVzdFVyaSwgY29uZmlnSWQpO1xuXG4gICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1Zyhjb25maWdJZCwgJ3BhciByZXF1ZXN0IHVybDogJywgdXJsKTtcblxuICAgICAgICBpZiAoIXVybCkge1xuICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBDb3VsZCBub3QgY3JlYXRlIFVSTCB3aXRoIHBhcmFtICR7cmVzcG9uc2UucmVxdWVzdFVyaX06ICd1cmwnYDtcbiAgICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRXJyb3IoY29uZmlnSWQsIGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICByZXR1cm4gdGhyb3dFcnJvcigoKSA9PiBuZXcgRXJyb3IoZXJyb3JNZXNzYWdlKSk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnBvcHVwU2VydmljZS5vcGVuUG9wVXAodXJsLCBwb3B1cE9wdGlvbnMpO1xuXG4gICAgICAgIHJldHVybiB0aGlzLnBvcHVwU2VydmljZS5yZXN1bHQkLnBpcGUoXG4gICAgICAgICAgdGFrZSgxKSxcbiAgICAgICAgICBzd2l0Y2hNYXAoKHJlc3VsdDogUG9wdXBSZXN1bHRSZWNlaXZlZFVybCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgeyB1c2VyQ2xvc2VkLCByZWNlaXZlZFVybCB9ID0gcmVzdWx0O1xuXG4gICAgICAgICAgICBpZiAodXNlckNsb3NlZCkge1xuICAgICAgICAgICAgICByZXR1cm4gb2Yoe1xuICAgICAgICAgICAgICAgIGlzQXV0aGVudGljYXRlZDogZmFsc2UsXG4gICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiAnVXNlciBjbG9zZWQgcG9wdXAnLFxuICAgICAgICAgICAgICAgIHVzZXJEYXRhOiBudWxsLFxuICAgICAgICAgICAgICAgIGlkVG9rZW46IG51bGwsXG4gICAgICAgICAgICAgICAgYWNjZXNzVG9rZW46IG51bGwsXG4gICAgICAgICAgICAgICAgY29uZmlnSWQsXG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jaGVja0F1dGhTZXJ2aWNlLmNoZWNrQXV0aChjb25maWdJZCwgcmVjZWl2ZWRVcmwpO1xuICAgICAgICAgIH0pXG4gICAgICAgICk7XG4gICAgICB9KVxuICAgICk7XG4gIH1cbn1cbiJdfQ==