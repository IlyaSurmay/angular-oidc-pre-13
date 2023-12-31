import { Injectable } from '@angular/core';
import { map, take } from 'rxjs/operators';
import * as i0 from "@angular/core";
import * as i1 from "./auto-login.service";
import * as i2 from "../check-auth.service";
import * as i3 from "../login/login.service";
import * as i4 from "../config/provider/config.provider";
export class AutoLoginAllRoutesGuard {
    constructor(autoLoginService, checkAuthService, loginService, configurationProvider) {
        this.autoLoginService = autoLoginService;
        this.checkAuthService = checkAuthService;
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
        return this.checkAuthService.checkAuth().pipe(take(1), map(({ isAuthenticated }) => {
            if (isAuthenticated) {
                this.autoLoginService.checkSavedRedirectRouteAndNavigate(configId);
            }
            if (!isAuthenticated) {
                this.autoLoginService.saveRedirectRoute(configId, url);
                this.loginService.login(configId);
            }
            return isAuthenticated;
        }));
    }
    getId() {
        return this.configurationProvider.getOpenIDConfiguration().configId;
    }
}
AutoLoginAllRoutesGuard.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: AutoLoginAllRoutesGuard, deps: [{ token: i1.AutoLoginService }, { token: i2.CheckAuthService }, { token: i3.LoginService }, { token: i4.ConfigurationProvider }], target: i0.ɵɵFactoryTarget.Injectable });
AutoLoginAllRoutesGuard.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: AutoLoginAllRoutesGuard, providedIn: 'root' });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: AutoLoginAllRoutesGuard, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }], ctorParameters: function () { return [{ type: i1.AutoLoginService }, { type: i2.CheckAuthService }, { type: i3.LoginService }, { type: i4.ConfigurationProvider }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXV0by1sb2dpbi1hbGwtcm91dGVzLmd1YXJkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvYW5ndWxhci1hdXRoLW9pZGMtY2xpZW50L3NyYy9saWIvYXV0by1sb2dpbi9hdXRvLWxvZ2luLWFsbC1yb3V0ZXMuZ3VhcmQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQVkzQyxPQUFPLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxNQUFNLGdCQUFnQixDQUFDOzs7Ozs7QUFPM0MsTUFBTSxPQUFPLHVCQUF1QjtJQUNsQyxZQUNVLGdCQUFrQyxFQUNsQyxnQkFBa0MsRUFDbEMsWUFBMEIsRUFDMUIscUJBQTRDO1FBSDVDLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBa0I7UUFDbEMscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFrQjtRQUNsQyxpQkFBWSxHQUFaLFlBQVksQ0FBYztRQUMxQiwwQkFBcUIsR0FBckIscUJBQXFCLENBQXVCO0lBQ25ELENBQUM7SUFFSixPQUFPLENBQUMsS0FBWSxFQUFFLFFBQXNCO1FBQzFDLE1BQU0sZUFBZSxHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7UUFFM0MsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLGVBQWUsQ0FBQyxDQUFDO0lBQ3pDLENBQUM7SUFFRCxXQUFXLENBQUMsS0FBNkIsRUFBRSxLQUEwQjtRQUNuRSxPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ25DLENBQUM7SUFFRCxnQkFBZ0IsQ0FBQyxLQUE2QixFQUFFLEtBQTBCO1FBQ3hFLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDbkMsQ0FBQztJQUVPLFNBQVMsQ0FBQyxHQUFXO1FBQzNCLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUU5QixPQUFPLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxJQUFJLENBQzNDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFDUCxHQUFHLENBQUMsQ0FBQyxFQUFFLGVBQWUsRUFBRSxFQUFFLEVBQUU7WUFDMUIsSUFBSSxlQUFlLEVBQUU7Z0JBQ25CLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxrQ0FBa0MsQ0FBQyxRQUFRLENBQUMsQ0FBQzthQUNwRTtZQUVELElBQUksQ0FBQyxlQUFlLEVBQUU7Z0JBQ3BCLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxpQkFBaUIsQ0FBQyxRQUFRLEVBQUUsR0FBRyxDQUFDLENBQUM7Z0JBQ3ZELElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO2FBQ25DO1lBRUQsT0FBTyxlQUFlLENBQUM7UUFDekIsQ0FBQyxDQUFDLENBQ0gsQ0FBQztJQUNKLENBQUM7SUFFTyxLQUFLO1FBQ1gsT0FBTyxJQUFJLENBQUMscUJBQXFCLENBQUMsc0JBQXNCLEVBQUUsQ0FBQyxRQUFRLENBQUM7SUFDdEUsQ0FBQzs7b0hBNUNVLHVCQUF1Qjt3SEFBdkIsdUJBQXVCLGNBRFYsTUFBTTsyRkFDbkIsdUJBQXVCO2tCQURuQyxVQUFVO21CQUFDLEVBQUUsVUFBVSxFQUFFLE1BQU0sRUFBRSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEluamVjdGFibGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7XG4gIEFjdGl2YXRlZFJvdXRlU25hcHNob3QsXG4gIENhbkFjdGl2YXRlLFxuICBDYW5BY3RpdmF0ZUNoaWxkLFxuICBDYW5Mb2FkLFxuICBSb3V0ZSxcbiAgUm91dGVyU3RhdGVTbmFwc2hvdCxcbiAgVXJsU2VnbWVudCxcbiAgVXJsVHJlZSxcbn0gZnJvbSAnQGFuZ3VsYXIvcm91dGVyJztcbmltcG9ydCB7IE9ic2VydmFibGUgfSBmcm9tICdyeGpzJztcbmltcG9ydCB7IG1hcCwgdGFrZSB9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcbmltcG9ydCB7IENoZWNrQXV0aFNlcnZpY2UgfSBmcm9tICcuLi9jaGVjay1hdXRoLnNlcnZpY2UnO1xuaW1wb3J0IHsgQ29uZmlndXJhdGlvblByb3ZpZGVyIH0gZnJvbSAnLi4vY29uZmlnL3Byb3ZpZGVyL2NvbmZpZy5wcm92aWRlcic7XG5pbXBvcnQgeyBMb2dpblNlcnZpY2UgfSBmcm9tICcuLi9sb2dpbi9sb2dpbi5zZXJ2aWNlJztcbmltcG9ydCB7IEF1dG9Mb2dpblNlcnZpY2UgfSBmcm9tICcuL2F1dG8tbG9naW4uc2VydmljZSc7XG5cbkBJbmplY3RhYmxlKHsgcHJvdmlkZWRJbjogJ3Jvb3QnIH0pXG5leHBvcnQgY2xhc3MgQXV0b0xvZ2luQWxsUm91dGVzR3VhcmQgaW1wbGVtZW50cyBDYW5BY3RpdmF0ZSwgQ2FuQWN0aXZhdGVDaGlsZCwgQ2FuTG9hZCB7XG4gIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUgYXV0b0xvZ2luU2VydmljZTogQXV0b0xvZ2luU2VydmljZSxcbiAgICBwcml2YXRlIGNoZWNrQXV0aFNlcnZpY2U6IENoZWNrQXV0aFNlcnZpY2UsXG4gICAgcHJpdmF0ZSBsb2dpblNlcnZpY2U6IExvZ2luU2VydmljZSxcbiAgICBwcml2YXRlIGNvbmZpZ3VyYXRpb25Qcm92aWRlcjogQ29uZmlndXJhdGlvblByb3ZpZGVyXG4gICkge31cblxuICBjYW5Mb2FkKHJvdXRlOiBSb3V0ZSwgc2VnbWVudHM6IFVybFNlZ21lbnRbXSk6IE9ic2VydmFibGU8Ym9vbGVhbiB8IFVybFRyZWU+IHtcbiAgICBjb25zdCByb3V0ZVRvUmVkaXJlY3QgPSBzZWdtZW50cy5qb2luKCcvJyk7XG5cbiAgICByZXR1cm4gdGhpcy5jaGVja0F1dGgocm91dGVUb1JlZGlyZWN0KTtcbiAgfVxuXG4gIGNhbkFjdGl2YXRlKHJvdXRlOiBBY3RpdmF0ZWRSb3V0ZVNuYXBzaG90LCBzdGF0ZTogUm91dGVyU3RhdGVTbmFwc2hvdCk6IE9ic2VydmFibGU8Ym9vbGVhbiB8IFVybFRyZWU+IHtcbiAgICByZXR1cm4gdGhpcy5jaGVja0F1dGgoc3RhdGUudXJsKTtcbiAgfVxuXG4gIGNhbkFjdGl2YXRlQ2hpbGQocm91dGU6IEFjdGl2YXRlZFJvdXRlU25hcHNob3QsIHN0YXRlOiBSb3V0ZXJTdGF0ZVNuYXBzaG90KTogT2JzZXJ2YWJsZTxib29sZWFuIHwgVXJsVHJlZT4ge1xuICAgIHJldHVybiB0aGlzLmNoZWNrQXV0aChzdGF0ZS51cmwpO1xuICB9XG5cbiAgcHJpdmF0ZSBjaGVja0F1dGgodXJsOiBzdHJpbmcpOiBPYnNlcnZhYmxlPGJvb2xlYW4+IHtcbiAgICBjb25zdCBjb25maWdJZCA9IHRoaXMuZ2V0SWQoKTtcblxuICAgIHJldHVybiB0aGlzLmNoZWNrQXV0aFNlcnZpY2UuY2hlY2tBdXRoKCkucGlwZShcbiAgICAgIHRha2UoMSksXG4gICAgICBtYXAoKHsgaXNBdXRoZW50aWNhdGVkIH0pID0+IHtcbiAgICAgICAgaWYgKGlzQXV0aGVudGljYXRlZCkge1xuICAgICAgICAgIHRoaXMuYXV0b0xvZ2luU2VydmljZS5jaGVja1NhdmVkUmVkaXJlY3RSb3V0ZUFuZE5hdmlnYXRlKGNvbmZpZ0lkKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghaXNBdXRoZW50aWNhdGVkKSB7XG4gICAgICAgICAgdGhpcy5hdXRvTG9naW5TZXJ2aWNlLnNhdmVSZWRpcmVjdFJvdXRlKGNvbmZpZ0lkLCB1cmwpO1xuICAgICAgICAgIHRoaXMubG9naW5TZXJ2aWNlLmxvZ2luKGNvbmZpZ0lkKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBpc0F1dGhlbnRpY2F0ZWQ7XG4gICAgICB9KVxuICAgICk7XG4gIH1cblxuICBwcml2YXRlIGdldElkKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuY29uZmlndXJhdGlvblByb3ZpZGVyLmdldE9wZW5JRENvbmZpZ3VyYXRpb24oKS5jb25maWdJZDtcbiAgfVxufVxuIl19