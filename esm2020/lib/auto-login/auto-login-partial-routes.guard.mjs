import { Injectable } from '@angular/core';
import * as i0 from "@angular/core";
import * as i1 from "./auto-login.service";
import * as i2 from "../auth-state/auth-state.service";
import * as i3 from "../login/login.service";
import * as i4 from "../config/provider/config.provider";
export class AutoLoginPartialRoutesGuard {
    constructor(autoLoginService, authStateService, loginService, configurationProvider) {
        this.autoLoginService = autoLoginService;
        this.authStateService = authStateService;
        this.loginService = loginService;
        this.configurationProvider = configurationProvider;
    }
    canLoad(route, segments) {
        const routeToRedirect = segments.join('/');
        return this.checkAuth(routeToRedirect);
    }
    canActivate(route, state) {
        return this.checkAuth(state.url);
    }
    canActivateChild(route, state) {
        return this.checkAuth(state.url);
    }
    checkAuth(url) {
        const configId = this.getId();
        const isAuthenticated = this.authStateService.areAuthStorageTokensValid(configId);
        if (isAuthenticated) {
            this.autoLoginService.checkSavedRedirectRouteAndNavigate(configId);
        }
        if (!isAuthenticated) {
            this.autoLoginService.saveRedirectRoute(configId, url);
            this.loginService.login(configId);
        }
        return isAuthenticated;
    }
    getId() {
        return this.configurationProvider.getOpenIDConfiguration().configId;
    }
}
AutoLoginPartialRoutesGuard.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: AutoLoginPartialRoutesGuard, deps: [{ token: i1.AutoLoginService }, { token: i2.AuthStateService }, { token: i3.LoginService }, { token: i4.ConfigurationProvider }], target: i0.ɵɵFactoryTarget.Injectable });
AutoLoginPartialRoutesGuard.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: AutoLoginPartialRoutesGuard, providedIn: 'root' });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: AutoLoginPartialRoutesGuard, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }], ctorParameters: function () { return [{ type: i1.AutoLoginService }, { type: i2.AuthStateService }, { type: i3.LoginService }, { type: i4.ConfigurationProvider }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXV0by1sb2dpbi1wYXJ0aWFsLXJvdXRlcy5ndWFyZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL2FuZ3VsYXItYXV0aC1vaWRjLWNsaWVudC9zcmMvbGliL2F1dG8tbG9naW4vYXV0by1sb2dpbi1wYXJ0aWFsLXJvdXRlcy5ndWFyZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sZUFBZSxDQUFDOzs7Ozs7QUFRM0MsTUFBTSxPQUFPLDJCQUEyQjtJQUN0QyxZQUNVLGdCQUFrQyxFQUNsQyxnQkFBa0MsRUFDbEMsWUFBMEIsRUFDMUIscUJBQTRDO1FBSDVDLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBa0I7UUFDbEMscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFrQjtRQUNsQyxpQkFBWSxHQUFaLFlBQVksQ0FBYztRQUMxQiwwQkFBcUIsR0FBckIscUJBQXFCLENBQXVCO0lBQ25ELENBQUM7SUFFSixPQUFPLENBQUMsS0FBWSxFQUFFLFFBQXNCO1FBQzFDLE1BQU0sZUFBZSxHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7UUFFM0MsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLGVBQWUsQ0FBQyxDQUFDO0lBQ3pDLENBQUM7SUFFRCxXQUFXLENBQUMsS0FBNkIsRUFBRSxLQUEwQjtRQUNuRSxPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ25DLENBQUM7SUFFRCxnQkFBZ0IsQ0FBQyxLQUE2QixFQUFFLEtBQTBCO1FBQ3hFLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDbkMsQ0FBQztJQUVPLFNBQVMsQ0FBQyxHQUFXO1FBQzNCLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUU5QixNQUFNLGVBQWUsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMseUJBQXlCLENBQUMsUUFBUSxDQUFDLENBQUM7UUFFbEYsSUFBSSxlQUFlLEVBQUU7WUFDbkIsSUFBSSxDQUFDLGdCQUFnQixDQUFDLGtDQUFrQyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1NBQ3BFO1FBRUQsSUFBSSxDQUFDLGVBQWUsRUFBRTtZQUNwQixJQUFJLENBQUMsZ0JBQWdCLENBQUMsaUJBQWlCLENBQUMsUUFBUSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1lBQ3ZELElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1NBQ25DO1FBRUQsT0FBTyxlQUFlLENBQUM7SUFDekIsQ0FBQztJQUVPLEtBQUs7UUFDWCxPQUFPLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxzQkFBc0IsRUFBRSxDQUFDLFFBQVEsQ0FBQztJQUN0RSxDQUFDOzt3SEF6Q1UsMkJBQTJCOzRIQUEzQiwyQkFBMkIsY0FEZCxNQUFNOzJGQUNuQiwyQkFBMkI7a0JBRHZDLFVBQVU7bUJBQUMsRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFFIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSW5qZWN0YWJsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgQWN0aXZhdGVkUm91dGVTbmFwc2hvdCwgQ2FuQWN0aXZhdGUsIENhbkFjdGl2YXRlQ2hpbGQsIENhbkxvYWQsIFJvdXRlLCBSb3V0ZXJTdGF0ZVNuYXBzaG90LCBVcmxTZWdtZW50IH0gZnJvbSAnQGFuZ3VsYXIvcm91dGVyJztcbmltcG9ydCB7IEF1dGhTdGF0ZVNlcnZpY2UgfSBmcm9tICcuLi9hdXRoLXN0YXRlL2F1dGgtc3RhdGUuc2VydmljZSc7XG5pbXBvcnQgeyBDb25maWd1cmF0aW9uUHJvdmlkZXIgfSBmcm9tICcuLi9jb25maWcvcHJvdmlkZXIvY29uZmlnLnByb3ZpZGVyJztcbmltcG9ydCB7IExvZ2luU2VydmljZSB9IGZyb20gJy4uL2xvZ2luL2xvZ2luLnNlcnZpY2UnO1xuaW1wb3J0IHsgQXV0b0xvZ2luU2VydmljZSB9IGZyb20gJy4vYXV0by1sb2dpbi5zZXJ2aWNlJztcblxuQEluamVjdGFibGUoeyBwcm92aWRlZEluOiAncm9vdCcgfSlcbmV4cG9ydCBjbGFzcyBBdXRvTG9naW5QYXJ0aWFsUm91dGVzR3VhcmQgaW1wbGVtZW50cyBDYW5BY3RpdmF0ZSwgQ2FuQWN0aXZhdGVDaGlsZCwgQ2FuTG9hZCB7XG4gIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUgYXV0b0xvZ2luU2VydmljZTogQXV0b0xvZ2luU2VydmljZSxcbiAgICBwcml2YXRlIGF1dGhTdGF0ZVNlcnZpY2U6IEF1dGhTdGF0ZVNlcnZpY2UsXG4gICAgcHJpdmF0ZSBsb2dpblNlcnZpY2U6IExvZ2luU2VydmljZSxcbiAgICBwcml2YXRlIGNvbmZpZ3VyYXRpb25Qcm92aWRlcjogQ29uZmlndXJhdGlvblByb3ZpZGVyXG4gICkge31cblxuICBjYW5Mb2FkKHJvdXRlOiBSb3V0ZSwgc2VnbWVudHM6IFVybFNlZ21lbnRbXSk6IGJvb2xlYW4ge1xuICAgIGNvbnN0IHJvdXRlVG9SZWRpcmVjdCA9IHNlZ21lbnRzLmpvaW4oJy8nKTtcblxuICAgIHJldHVybiB0aGlzLmNoZWNrQXV0aChyb3V0ZVRvUmVkaXJlY3QpO1xuICB9XG5cbiAgY2FuQWN0aXZhdGUocm91dGU6IEFjdGl2YXRlZFJvdXRlU25hcHNob3QsIHN0YXRlOiBSb3V0ZXJTdGF0ZVNuYXBzaG90KTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuY2hlY2tBdXRoKHN0YXRlLnVybCk7XG4gIH1cblxuICBjYW5BY3RpdmF0ZUNoaWxkKHJvdXRlOiBBY3RpdmF0ZWRSb3V0ZVNuYXBzaG90LCBzdGF0ZTogUm91dGVyU3RhdGVTbmFwc2hvdCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmNoZWNrQXV0aChzdGF0ZS51cmwpO1xuICB9XG5cbiAgcHJpdmF0ZSBjaGVja0F1dGgodXJsOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICBjb25zdCBjb25maWdJZCA9IHRoaXMuZ2V0SWQoKTtcblxuICAgIGNvbnN0IGlzQXV0aGVudGljYXRlZCA9IHRoaXMuYXV0aFN0YXRlU2VydmljZS5hcmVBdXRoU3RvcmFnZVRva2Vuc1ZhbGlkKGNvbmZpZ0lkKTtcblxuICAgIGlmIChpc0F1dGhlbnRpY2F0ZWQpIHtcbiAgICAgIHRoaXMuYXV0b0xvZ2luU2VydmljZS5jaGVja1NhdmVkUmVkaXJlY3RSb3V0ZUFuZE5hdmlnYXRlKGNvbmZpZ0lkKTtcbiAgICB9XG5cbiAgICBpZiAoIWlzQXV0aGVudGljYXRlZCkge1xuICAgICAgdGhpcy5hdXRvTG9naW5TZXJ2aWNlLnNhdmVSZWRpcmVjdFJvdXRlKGNvbmZpZ0lkLCB1cmwpO1xuICAgICAgdGhpcy5sb2dpblNlcnZpY2UubG9naW4oY29uZmlnSWQpO1xuICAgIH1cblxuICAgIHJldHVybiBpc0F1dGhlbnRpY2F0ZWQ7XG4gIH1cblxuICBwcml2YXRlIGdldElkKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuY29uZmlndXJhdGlvblByb3ZpZGVyLmdldE9wZW5JRENvbmZpZ3VyYXRpb24oKS5jb25maWdJZDtcbiAgfVxufVxuIl19