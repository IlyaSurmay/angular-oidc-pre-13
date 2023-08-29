import { Injectable } from '@angular/core';
import * as i0 from "@angular/core";
import * as i1 from "../../logging/logger.service";
import * as i2 from "../response-type-validation/response-type-validation.service";
import * as i3 from "../../utils/url/url.service";
import * as i4 from "../../utils/redirect/redirect.service";
import * as i5 from "../../config/provider/config.provider";
import * as i6 from "../../config/auth-well-known/auth-well-known.service";
export class StandardLoginService {
    constructor(loggerService, responseTypeValidationService, urlService, redirectService, configurationProvider, authWellKnownService) {
        this.loggerService = loggerService;
        this.responseTypeValidationService = responseTypeValidationService;
        this.urlService = urlService;
        this.redirectService = redirectService;
        this.configurationProvider = configurationProvider;
        this.authWellKnownService = authWellKnownService;
    }
    loginStandard(configId, authOptions) {
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
        this.authWellKnownService.getAuthWellKnownEndPoints(authWellknownEndpointUrl, configId).subscribe(() => {
            const { urlHandler, customParams } = authOptions || {};
            const url = this.urlService.getAuthorizeUrl(configId, customParams);
            if (!url) {
                this.loggerService.logError(configId, 'Could not create URL', url);
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
}
StandardLoginService.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: StandardLoginService, deps: [{ token: i1.LoggerService }, { token: i2.ResponseTypeValidationService }, { token: i3.UrlService }, { token: i4.RedirectService }, { token: i5.ConfigurationProvider }, { token: i6.AuthWellKnownService }], target: i0.ɵɵFactoryTarget.Injectable });
StandardLoginService.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: StandardLoginService });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: StandardLoginService, decorators: [{
            type: Injectable
        }], ctorParameters: function () { return [{ type: i1.LoggerService }, { type: i2.ResponseTypeValidationService }, { type: i3.UrlService }, { type: i4.RedirectService }, { type: i5.ConfigurationProvider }, { type: i6.AuthWellKnownService }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhbmRhcmQtbG9naW4uc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL2FuZ3VsYXItYXV0aC1vaWRjLWNsaWVudC9zcmMvbGliL2xvZ2luL3N0YW5kYXJkL3N0YW5kYXJkLWxvZ2luLnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGVBQWUsQ0FBQzs7Ozs7Ozs7QUFVM0MsTUFBTSxPQUFPLG9CQUFvQjtJQUMvQixZQUNVLGFBQTRCLEVBQzVCLDZCQUE0RCxFQUM1RCxVQUFzQixFQUN0QixlQUFnQyxFQUNoQyxxQkFBNEMsRUFDNUMsb0JBQTBDO1FBTDFDLGtCQUFhLEdBQWIsYUFBYSxDQUFlO1FBQzVCLGtDQUE2QixHQUE3Qiw2QkFBNkIsQ0FBK0I7UUFDNUQsZUFBVSxHQUFWLFVBQVUsQ0FBWTtRQUN0QixvQkFBZSxHQUFmLGVBQWUsQ0FBaUI7UUFDaEMsMEJBQXFCLEdBQXJCLHFCQUFxQixDQUF1QjtRQUM1Qyx5QkFBb0IsR0FBcEIsb0JBQW9CLENBQXNCO0lBQ2pELENBQUM7SUFFSixhQUFhLENBQUMsUUFBZ0IsRUFBRSxXQUF5QjtRQUN2RCxJQUFJLENBQUMsSUFBSSxDQUFDLDZCQUE2QixDQUFDLDBCQUEwQixDQUFDLFFBQVEsQ0FBQyxFQUFFO1lBQzVFLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRSx3QkFBd0IsQ0FBQyxDQUFDO1lBRWhFLE9BQU87U0FDUjtRQUVELE1BQU0sRUFBRSx3QkFBd0IsRUFBRSxHQUFHLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxzQkFBc0IsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUVqRyxJQUFJLENBQUMsd0JBQXdCLEVBQUU7WUFDN0IsSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFLGlDQUFpQyxDQUFDLENBQUM7WUFFekUsT0FBTztTQUNSO1FBRUQsSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFLHlDQUF5QyxDQUFDLENBQUM7UUFFakYsSUFBSSxDQUFDLG9CQUFvQixDQUFDLHlCQUF5QixDQUFDLHdCQUF3QixFQUFFLFFBQVEsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUU7WUFDckcsTUFBTSxFQUFFLFVBQVUsRUFBRSxZQUFZLEVBQUUsR0FBRyxXQUFXLElBQUksRUFBRSxDQUFDO1lBRXZELE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsZUFBZSxDQUFDLFFBQVEsRUFBRSxZQUFZLENBQUMsQ0FBQztZQUVwRSxJQUFJLENBQUMsR0FBRyxFQUFFO2dCQUNSLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRSxzQkFBc0IsRUFBRSxHQUFHLENBQUMsQ0FBQztnQkFFbkUsT0FBTzthQUNSO1lBRUQsSUFBSSxVQUFVLEVBQUU7Z0JBQ2QsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2FBQ2pCO2lCQUFNO2dCQUNMLElBQUksQ0FBQyxlQUFlLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2FBQ3RDO1FBQ0gsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDOztpSEE1Q1Usb0JBQW9CO3FIQUFwQixvQkFBb0I7MkZBQXBCLG9CQUFvQjtrQkFEaEMsVUFBVSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEluamVjdGFibGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IEF1dGhPcHRpb25zIH0gZnJvbSAnLi4vLi4vYXV0aC1vcHRpb25zJztcbmltcG9ydCB7IEF1dGhXZWxsS25vd25TZXJ2aWNlIH0gZnJvbSAnLi4vLi4vY29uZmlnL2F1dGgtd2VsbC1rbm93bi9hdXRoLXdlbGwta25vd24uc2VydmljZSc7XG5pbXBvcnQgeyBDb25maWd1cmF0aW9uUHJvdmlkZXIgfSBmcm9tICcuLi8uLi9jb25maWcvcHJvdmlkZXIvY29uZmlnLnByb3ZpZGVyJztcbmltcG9ydCB7IExvZ2dlclNlcnZpY2UgfSBmcm9tICcuLi8uLi9sb2dnaW5nL2xvZ2dlci5zZXJ2aWNlJztcbmltcG9ydCB7IFJlZGlyZWN0U2VydmljZSB9IGZyb20gJy4uLy4uL3V0aWxzL3JlZGlyZWN0L3JlZGlyZWN0LnNlcnZpY2UnO1xuaW1wb3J0IHsgVXJsU2VydmljZSB9IGZyb20gJy4uLy4uL3V0aWxzL3VybC91cmwuc2VydmljZSc7XG5pbXBvcnQgeyBSZXNwb25zZVR5cGVWYWxpZGF0aW9uU2VydmljZSB9IGZyb20gJy4uL3Jlc3BvbnNlLXR5cGUtdmFsaWRhdGlvbi9yZXNwb25zZS10eXBlLXZhbGlkYXRpb24uc2VydmljZSc7XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBTdGFuZGFyZExvZ2luU2VydmljZSB7XG4gIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUgbG9nZ2VyU2VydmljZTogTG9nZ2VyU2VydmljZSxcbiAgICBwcml2YXRlIHJlc3BvbnNlVHlwZVZhbGlkYXRpb25TZXJ2aWNlOiBSZXNwb25zZVR5cGVWYWxpZGF0aW9uU2VydmljZSxcbiAgICBwcml2YXRlIHVybFNlcnZpY2U6IFVybFNlcnZpY2UsXG4gICAgcHJpdmF0ZSByZWRpcmVjdFNlcnZpY2U6IFJlZGlyZWN0U2VydmljZSxcbiAgICBwcml2YXRlIGNvbmZpZ3VyYXRpb25Qcm92aWRlcjogQ29uZmlndXJhdGlvblByb3ZpZGVyLFxuICAgIHByaXZhdGUgYXV0aFdlbGxLbm93blNlcnZpY2U6IEF1dGhXZWxsS25vd25TZXJ2aWNlXG4gICkge31cblxuICBsb2dpblN0YW5kYXJkKGNvbmZpZ0lkOiBzdHJpbmcsIGF1dGhPcHRpb25zPzogQXV0aE9wdGlvbnMpOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMucmVzcG9uc2VUeXBlVmFsaWRhdGlvblNlcnZpY2UuaGFzQ29uZmlnVmFsaWRSZXNwb25zZVR5cGUoY29uZmlnSWQpKSB7XG4gICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRXJyb3IoY29uZmlnSWQsICdJbnZhbGlkIHJlc3BvbnNlIHR5cGUhJyk7XG5cbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCB7IGF1dGhXZWxsa25vd25FbmRwb2ludFVybCB9ID0gdGhpcy5jb25maWd1cmF0aW9uUHJvdmlkZXIuZ2V0T3BlbklEQ29uZmlndXJhdGlvbihjb25maWdJZCk7XG5cbiAgICBpZiAoIWF1dGhXZWxsa25vd25FbmRwb2ludFVybCkge1xuICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0Vycm9yKGNvbmZpZ0lkLCAnbm8gYXV0aFdlbGxrbm93bkVuZHBvaW50IGdpdmVuIScpO1xuXG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKGNvbmZpZ0lkLCAnQkVHSU4gQXV0aG9yaXplIE9JREMgRmxvdywgbm8gYXV0aCBkYXRhJyk7XG5cbiAgICB0aGlzLmF1dGhXZWxsS25vd25TZXJ2aWNlLmdldEF1dGhXZWxsS25vd25FbmRQb2ludHMoYXV0aFdlbGxrbm93bkVuZHBvaW50VXJsLCBjb25maWdJZCkuc3Vic2NyaWJlKCgpID0+IHtcbiAgICAgIGNvbnN0IHsgdXJsSGFuZGxlciwgY3VzdG9tUGFyYW1zIH0gPSBhdXRoT3B0aW9ucyB8fCB7fTtcblxuICAgICAgY29uc3QgdXJsID0gdGhpcy51cmxTZXJ2aWNlLmdldEF1dGhvcml6ZVVybChjb25maWdJZCwgY3VzdG9tUGFyYW1zKTtcblxuICAgICAgaWYgKCF1cmwpIHtcbiAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0Vycm9yKGNvbmZpZ0lkLCAnQ291bGQgbm90IGNyZWF0ZSBVUkwnLCB1cmwpO1xuXG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYgKHVybEhhbmRsZXIpIHtcbiAgICAgICAgdXJsSGFuZGxlcih1cmwpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5yZWRpcmVjdFNlcnZpY2UucmVkaXJlY3RUbyh1cmwpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG59XG4iXX0=