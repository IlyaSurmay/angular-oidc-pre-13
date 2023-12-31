import { Injectable } from '@angular/core';
import * as i0 from "@angular/core";
import * as i1 from "../config/provider/config.provider";
import * as i2 from "./par/par-login.service";
import * as i3 from "./popup/popup-login.service";
import * as i4 from "./standard/standard-login.service";
import * as i5 from "../storage/storage-persistence.service";
export class LoginService {
    constructor(configurationProvider, parLoginService, popUpLoginService, standardLoginService, storagePersistenceService) {
        this.configurationProvider = configurationProvider;
        this.parLoginService = parLoginService;
        this.popUpLoginService = popUpLoginService;
        this.standardLoginService = standardLoginService;
        this.storagePersistenceService = storagePersistenceService;
    }
    login(configId, authOptions) {
        if (authOptions?.customParams) {
            this.storagePersistenceService.write('storageCustomParamsAuthRequest', authOptions.customParams, configId);
        }
        const { usePushedAuthorisationRequests } = this.configurationProvider.getOpenIDConfiguration(configId);
        if (usePushedAuthorisationRequests) {
            return this.parLoginService.loginPar(configId, authOptions);
        }
        else {
            return this.standardLoginService.loginStandard(configId, authOptions);
        }
    }
    loginWithPopUp(configId, authOptions, popupOptions) {
        if (authOptions?.customParams) {
            this.storagePersistenceService.write('storageCustomParamsAuthRequest', authOptions.customParams, configId);
        }
        const { usePushedAuthorisationRequests } = this.configurationProvider.getOpenIDConfiguration(configId);
        if (usePushedAuthorisationRequests) {
            return this.parLoginService.loginWithPopUpPar(configId, authOptions, popupOptions);
        }
        else {
            return this.popUpLoginService.loginWithPopUpStandard(configId, authOptions, popupOptions);
        }
    }
}
LoginService.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: LoginService, deps: [{ token: i1.ConfigurationProvider }, { token: i2.ParLoginService }, { token: i3.PopUpLoginService }, { token: i4.StandardLoginService }, { token: i5.StoragePersistenceService }], target: i0.ɵɵFactoryTarget.Injectable });
LoginService.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: LoginService });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: LoginService, decorators: [{
            type: Injectable
        }], ctorParameters: function () { return [{ type: i1.ConfigurationProvider }, { type: i2.ParLoginService }, { type: i3.PopUpLoginService }, { type: i4.StandardLoginService }, { type: i5.StoragePersistenceService }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9naW4uc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL2FuZ3VsYXItYXV0aC1vaWRjLWNsaWVudC9zcmMvbGliL2xvZ2luL2xvZ2luLnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGVBQWUsQ0FBQzs7Ozs7OztBQVkzQyxNQUFNLE9BQU8sWUFBWTtJQUN2QixZQUNVLHFCQUE0QyxFQUM1QyxlQUFnQyxFQUNoQyxpQkFBb0MsRUFDcEMsb0JBQTBDLEVBQzFDLHlCQUFvRDtRQUpwRCwwQkFBcUIsR0FBckIscUJBQXFCLENBQXVCO1FBQzVDLG9CQUFlLEdBQWYsZUFBZSxDQUFpQjtRQUNoQyxzQkFBaUIsR0FBakIsaUJBQWlCLENBQW1CO1FBQ3BDLHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBc0I7UUFDMUMsOEJBQXlCLEdBQXpCLHlCQUF5QixDQUEyQjtJQUMzRCxDQUFDO0lBRUosS0FBSyxDQUFDLFFBQWdCLEVBQUUsV0FBeUI7UUFDL0MsSUFBSSxXQUFXLEVBQUUsWUFBWSxFQUFFO1lBQzdCLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxLQUFLLENBQUMsZ0NBQWdDLEVBQUUsV0FBVyxDQUFDLFlBQVksRUFBRSxRQUFRLENBQUMsQ0FBQztTQUM1RztRQUVELE1BQU0sRUFBRSw4QkFBOEIsRUFBRSxHQUFHLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxzQkFBc0IsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUV2RyxJQUFJLDhCQUE4QixFQUFFO1lBQ2xDLE9BQU8sSUFBSSxDQUFDLGVBQWUsQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFLFdBQVcsQ0FBQyxDQUFDO1NBQzdEO2FBQU07WUFDTCxPQUFPLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxhQUFhLENBQUMsUUFBUSxFQUFFLFdBQVcsQ0FBQyxDQUFDO1NBQ3ZFO0lBQ0gsQ0FBQztJQUVELGNBQWMsQ0FBQyxRQUFnQixFQUFFLFdBQXlCLEVBQUUsWUFBMkI7UUFDckYsSUFBSSxXQUFXLEVBQUUsWUFBWSxFQUFFO1lBQzdCLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxLQUFLLENBQUMsZ0NBQWdDLEVBQUUsV0FBVyxDQUFDLFlBQVksRUFBRSxRQUFRLENBQUMsQ0FBQztTQUM1RztRQUVELE1BQU0sRUFBRSw4QkFBOEIsRUFBRSxHQUFHLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxzQkFBc0IsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUV2RyxJQUFJLDhCQUE4QixFQUFFO1lBQ2xDLE9BQU8sSUFBSSxDQUFDLGVBQWUsQ0FBQyxpQkFBaUIsQ0FBQyxRQUFRLEVBQUUsV0FBVyxFQUFFLFlBQVksQ0FBQyxDQUFDO1NBQ3BGO2FBQU07WUFDTCxPQUFPLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxzQkFBc0IsQ0FBQyxRQUFRLEVBQUUsV0FBVyxFQUFFLFlBQVksQ0FBQyxDQUFDO1NBQzNGO0lBQ0gsQ0FBQzs7eUdBbkNVLFlBQVk7NkdBQVosWUFBWTsyRkFBWixZQUFZO2tCQUR4QixVQUFVIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSW5qZWN0YWJsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgT2JzZXJ2YWJsZSB9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHsgQXV0aE9wdGlvbnMgfSBmcm9tICcuLi9hdXRoLW9wdGlvbnMnO1xuaW1wb3J0IHsgQ29uZmlndXJhdGlvblByb3ZpZGVyIH0gZnJvbSAnLi4vY29uZmlnL3Byb3ZpZGVyL2NvbmZpZy5wcm92aWRlcic7XG5pbXBvcnQgeyBTdG9yYWdlUGVyc2lzdGVuY2VTZXJ2aWNlIH0gZnJvbSAnLi4vc3RvcmFnZS9zdG9yYWdlLXBlcnNpc3RlbmNlLnNlcnZpY2UnO1xuaW1wb3J0IHsgTG9naW5SZXNwb25zZSB9IGZyb20gJy4vbG9naW4tcmVzcG9uc2UnO1xuaW1wb3J0IHsgUGFyTG9naW5TZXJ2aWNlIH0gZnJvbSAnLi9wYXIvcGFyLWxvZ2luLnNlcnZpY2UnO1xuaW1wb3J0IHsgUG9wVXBMb2dpblNlcnZpY2UgfSBmcm9tICcuL3BvcHVwL3BvcHVwLWxvZ2luLnNlcnZpY2UnO1xuaW1wb3J0IHsgUG9wdXBPcHRpb25zIH0gZnJvbSAnLi9wb3B1cC9wb3B1cC1vcHRpb25zJztcbmltcG9ydCB7IFN0YW5kYXJkTG9naW5TZXJ2aWNlIH0gZnJvbSAnLi9zdGFuZGFyZC9zdGFuZGFyZC1sb2dpbi5zZXJ2aWNlJztcblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIExvZ2luU2VydmljZSB7XG4gIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUgY29uZmlndXJhdGlvblByb3ZpZGVyOiBDb25maWd1cmF0aW9uUHJvdmlkZXIsXG4gICAgcHJpdmF0ZSBwYXJMb2dpblNlcnZpY2U6IFBhckxvZ2luU2VydmljZSxcbiAgICBwcml2YXRlIHBvcFVwTG9naW5TZXJ2aWNlOiBQb3BVcExvZ2luU2VydmljZSxcbiAgICBwcml2YXRlIHN0YW5kYXJkTG9naW5TZXJ2aWNlOiBTdGFuZGFyZExvZ2luU2VydmljZSxcbiAgICBwcml2YXRlIHN0b3JhZ2VQZXJzaXN0ZW5jZVNlcnZpY2U6IFN0b3JhZ2VQZXJzaXN0ZW5jZVNlcnZpY2VcbiAgKSB7fVxuXG4gIGxvZ2luKGNvbmZpZ0lkOiBzdHJpbmcsIGF1dGhPcHRpb25zPzogQXV0aE9wdGlvbnMpOiB2b2lkIHtcbiAgICBpZiAoYXV0aE9wdGlvbnM/LmN1c3RvbVBhcmFtcykge1xuICAgICAgdGhpcy5zdG9yYWdlUGVyc2lzdGVuY2VTZXJ2aWNlLndyaXRlKCdzdG9yYWdlQ3VzdG9tUGFyYW1zQXV0aFJlcXVlc3QnLCBhdXRoT3B0aW9ucy5jdXN0b21QYXJhbXMsIGNvbmZpZ0lkKTtcbiAgICB9XG5cbiAgICBjb25zdCB7IHVzZVB1c2hlZEF1dGhvcmlzYXRpb25SZXF1ZXN0cyB9ID0gdGhpcy5jb25maWd1cmF0aW9uUHJvdmlkZXIuZ2V0T3BlbklEQ29uZmlndXJhdGlvbihjb25maWdJZCk7XG5cbiAgICBpZiAodXNlUHVzaGVkQXV0aG9yaXNhdGlvblJlcXVlc3RzKSB7XG4gICAgICByZXR1cm4gdGhpcy5wYXJMb2dpblNlcnZpY2UubG9naW5QYXIoY29uZmlnSWQsIGF1dGhPcHRpb25zKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMuc3RhbmRhcmRMb2dpblNlcnZpY2UubG9naW5TdGFuZGFyZChjb25maWdJZCwgYXV0aE9wdGlvbnMpO1xuICAgIH1cbiAgfVxuXG4gIGxvZ2luV2l0aFBvcFVwKGNvbmZpZ0lkOiBzdHJpbmcsIGF1dGhPcHRpb25zPzogQXV0aE9wdGlvbnMsIHBvcHVwT3B0aW9ucz86IFBvcHVwT3B0aW9ucyk6IE9ic2VydmFibGU8TG9naW5SZXNwb25zZT4ge1xuICAgIGlmIChhdXRoT3B0aW9ucz8uY3VzdG9tUGFyYW1zKSB7XG4gICAgICB0aGlzLnN0b3JhZ2VQZXJzaXN0ZW5jZVNlcnZpY2Uud3JpdGUoJ3N0b3JhZ2VDdXN0b21QYXJhbXNBdXRoUmVxdWVzdCcsIGF1dGhPcHRpb25zLmN1c3RvbVBhcmFtcywgY29uZmlnSWQpO1xuICAgIH1cblxuICAgIGNvbnN0IHsgdXNlUHVzaGVkQXV0aG9yaXNhdGlvblJlcXVlc3RzIH0gPSB0aGlzLmNvbmZpZ3VyYXRpb25Qcm92aWRlci5nZXRPcGVuSURDb25maWd1cmF0aW9uKGNvbmZpZ0lkKTtcblxuICAgIGlmICh1c2VQdXNoZWRBdXRob3Jpc2F0aW9uUmVxdWVzdHMpIHtcbiAgICAgIHJldHVybiB0aGlzLnBhckxvZ2luU2VydmljZS5sb2dpbldpdGhQb3BVcFBhcihjb25maWdJZCwgYXV0aE9wdGlvbnMsIHBvcHVwT3B0aW9ucyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLnBvcFVwTG9naW5TZXJ2aWNlLmxvZ2luV2l0aFBvcFVwU3RhbmRhcmQoY29uZmlnSWQsIGF1dGhPcHRpb25zLCBwb3B1cE9wdGlvbnMpO1xuICAgIH1cbiAgfVxufVxuIl19