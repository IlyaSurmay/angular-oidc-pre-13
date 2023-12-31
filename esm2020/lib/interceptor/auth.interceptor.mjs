import { Injectable } from '@angular/core';
import * as i0 from "@angular/core";
import * as i1 from "../auth-state/auth-state.service";
import * as i2 from "../config/provider/config.provider";
import * as i3 from "../logging/logger.service";
import * as i4 from "./closest-matching-route.service";
export class AuthInterceptor {
    constructor(authStateService, configurationProvider, loggerService, closestMatchingRouteService) {
        this.authStateService = authStateService;
        this.configurationProvider = configurationProvider;
        this.loggerService = loggerService;
        this.closestMatchingRouteService = closestMatchingRouteService;
    }
    intercept(req, next) {
        if (!this.configurationProvider.hasAtLeastOneConfig()) {
            return next.handle(req);
        }
        const allConfigurations = this.configurationProvider.getAllConfigurations();
        const allRoutesConfigured = allConfigurations.map((x) => x.secureRoutes || []);
        const allRoutesConfiguredFlat = [].concat.apply([], allRoutesConfigured);
        if (allRoutesConfiguredFlat.length === 0) {
            const { configId } = allConfigurations[0];
            this.loggerService.logDebug(configId, `No routes to check configured`);
            return next.handle(req);
        }
        const { matchingConfigId, matchingRoute } = this.closestMatchingRouteService.getConfigIdForClosestMatchingRoute(req.url);
        if (!matchingConfigId) {
            const { configId } = allConfigurations[0];
            this.loggerService.logDebug(configId, `Did not find any configured route for route ${req.url}`);
            return next.handle(req);
        }
        this.loggerService.logDebug(matchingConfigId, `'${req.url}' matches configured route '${matchingRoute}'`);
        const token = this.authStateService.getAccessToken(matchingConfigId);
        if (!token) {
            this.loggerService.logDebug(matchingConfigId, `Wanted to add token to ${req.url} but found no token: '${token}'`);
            return next.handle(req);
        }
        this.loggerService.logDebug(matchingConfigId, `'${req.url}' matches configured route '${matchingRoute}', adding token`);
        req = req.clone({
            headers: req.headers.set('Authorization', 'Bearer ' + token),
        });
        return next.handle(req);
    }
}
AuthInterceptor.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: AuthInterceptor, deps: [{ token: i1.AuthStateService }, { token: i2.ConfigurationProvider }, { token: i3.LoggerService }, { token: i4.ClosestMatchingRouteService }], target: i0.ɵɵFactoryTarget.Injectable });
AuthInterceptor.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: AuthInterceptor });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: AuthInterceptor, decorators: [{
            type: Injectable
        }], ctorParameters: function () { return [{ type: i1.AuthStateService }, { type: i2.ConfigurationProvider }, { type: i3.LoggerService }, { type: i4.ClosestMatchingRouteService }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXV0aC5pbnRlcmNlcHRvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL2FuZ3VsYXItYXV0aC1vaWRjLWNsaWVudC9zcmMvbGliL2ludGVyY2VwdG9yL2F1dGguaW50ZXJjZXB0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGVBQWUsQ0FBQzs7Ozs7O0FBUTNDLE1BQU0sT0FBTyxlQUFlO0lBQzFCLFlBQ1UsZ0JBQWtDLEVBQ2xDLHFCQUE0QyxFQUM1QyxhQUE0QixFQUM1QiwyQkFBd0Q7UUFIeEQscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFrQjtRQUNsQywwQkFBcUIsR0FBckIscUJBQXFCLENBQXVCO1FBQzVDLGtCQUFhLEdBQWIsYUFBYSxDQUFlO1FBQzVCLGdDQUEyQixHQUEzQiwyQkFBMkIsQ0FBNkI7SUFDL0QsQ0FBQztJQUVKLFNBQVMsQ0FBQyxHQUFxQixFQUFFLElBQWlCO1FBQ2hELElBQUksQ0FBQyxJQUFJLENBQUMscUJBQXFCLENBQUMsbUJBQW1CLEVBQUUsRUFBRTtZQUNyRCxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7U0FDekI7UUFFRCxNQUFNLGlCQUFpQixHQUFHLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxvQkFBb0IsRUFBRSxDQUFDO1FBQzVFLE1BQU0sbUJBQW1CLEdBQUcsaUJBQWlCLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsWUFBWSxJQUFJLEVBQUUsQ0FBQyxDQUFDO1FBQy9FLE1BQU0sdUJBQXVCLEdBQUcsRUFBRSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsRUFBRSxFQUFFLG1CQUFtQixDQUFDLENBQUM7UUFFekUsSUFBSSx1QkFBdUIsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO1lBQ3hDLE1BQU0sRUFBRSxRQUFRLEVBQUUsR0FBRyxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUMxQyxJQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxRQUFRLEVBQUUsK0JBQStCLENBQUMsQ0FBQztZQUV2RSxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7U0FDekI7UUFFRCxNQUFNLEVBQUUsZ0JBQWdCLEVBQUUsYUFBYSxFQUFFLEdBQUcsSUFBSSxDQUFDLDJCQUEyQixDQUFDLGtDQUFrQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUV6SCxJQUFJLENBQUMsZ0JBQWdCLEVBQUU7WUFDckIsTUFBTSxFQUFFLFFBQVEsRUFBRSxHQUFHLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzFDLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRSwrQ0FBK0MsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUM7WUFFaEcsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1NBQ3pCO1FBRUQsSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsZ0JBQWdCLEVBQUUsSUFBSSxHQUFHLENBQUMsR0FBRywrQkFBK0IsYUFBYSxHQUFHLENBQUMsQ0FBQztRQUUxRyxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsY0FBYyxDQUFDLGdCQUFnQixDQUFDLENBQUM7UUFFckUsSUFBSSxDQUFDLEtBQUssRUFBRTtZQUNWLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLGdCQUFnQixFQUFFLDBCQUEwQixHQUFHLENBQUMsR0FBRyx5QkFBeUIsS0FBSyxHQUFHLENBQUMsQ0FBQztZQUVsSCxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7U0FDekI7UUFFRCxJQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxnQkFBZ0IsRUFBRSxJQUFJLEdBQUcsQ0FBQyxHQUFHLCtCQUErQixhQUFhLGlCQUFpQixDQUFDLENBQUM7UUFDeEgsR0FBRyxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUM7WUFDZCxPQUFPLEVBQUUsR0FBRyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsZUFBZSxFQUFFLFNBQVMsR0FBRyxLQUFLLENBQUM7U0FDN0QsQ0FBQyxDQUFDO1FBRUgsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQzFCLENBQUM7OzRHQWpEVSxlQUFlO2dIQUFmLGVBQWU7MkZBQWYsZUFBZTtrQkFEM0IsVUFBVSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEh0dHBFdmVudCwgSHR0cEhhbmRsZXIsIEh0dHBJbnRlcmNlcHRvciwgSHR0cFJlcXVlc3QgfSBmcm9tICdAYW5ndWxhci9jb21tb24vaHR0cCc7XG5pbXBvcnQgeyBJbmplY3RhYmxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBPYnNlcnZhYmxlIH0gZnJvbSAncnhqcyc7XG5pbXBvcnQgeyBBdXRoU3RhdGVTZXJ2aWNlIH0gZnJvbSAnLi4vYXV0aC1zdGF0ZS9hdXRoLXN0YXRlLnNlcnZpY2UnO1xuaW1wb3J0IHsgQ29uZmlndXJhdGlvblByb3ZpZGVyIH0gZnJvbSAnLi4vY29uZmlnL3Byb3ZpZGVyL2NvbmZpZy5wcm92aWRlcic7XG5pbXBvcnQgeyBMb2dnZXJTZXJ2aWNlIH0gZnJvbSAnLi4vbG9nZ2luZy9sb2dnZXIuc2VydmljZSc7XG5pbXBvcnQgeyBDbG9zZXN0TWF0Y2hpbmdSb3V0ZVNlcnZpY2UgfSBmcm9tICcuL2Nsb3Nlc3QtbWF0Y2hpbmctcm91dGUuc2VydmljZSc7XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBBdXRoSW50ZXJjZXB0b3IgaW1wbGVtZW50cyBIdHRwSW50ZXJjZXB0b3Ige1xuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIGF1dGhTdGF0ZVNlcnZpY2U6IEF1dGhTdGF0ZVNlcnZpY2UsXG4gICAgcHJpdmF0ZSBjb25maWd1cmF0aW9uUHJvdmlkZXI6IENvbmZpZ3VyYXRpb25Qcm92aWRlcixcbiAgICBwcml2YXRlIGxvZ2dlclNlcnZpY2U6IExvZ2dlclNlcnZpY2UsXG4gICAgcHJpdmF0ZSBjbG9zZXN0TWF0Y2hpbmdSb3V0ZVNlcnZpY2U6IENsb3Nlc3RNYXRjaGluZ1JvdXRlU2VydmljZVxuICApIHt9XG5cbiAgaW50ZXJjZXB0KHJlcTogSHR0cFJlcXVlc3Q8YW55PiwgbmV4dDogSHR0cEhhbmRsZXIpOiBPYnNlcnZhYmxlPEh0dHBFdmVudDxhbnk+PiB7XG4gICAgaWYgKCF0aGlzLmNvbmZpZ3VyYXRpb25Qcm92aWRlci5oYXNBdExlYXN0T25lQ29uZmlnKCkpIHtcbiAgICAgIHJldHVybiBuZXh0LmhhbmRsZShyZXEpO1xuICAgIH1cblxuICAgIGNvbnN0IGFsbENvbmZpZ3VyYXRpb25zID0gdGhpcy5jb25maWd1cmF0aW9uUHJvdmlkZXIuZ2V0QWxsQ29uZmlndXJhdGlvbnMoKTtcbiAgICBjb25zdCBhbGxSb3V0ZXNDb25maWd1cmVkID0gYWxsQ29uZmlndXJhdGlvbnMubWFwKCh4KSA9PiB4LnNlY3VyZVJvdXRlcyB8fCBbXSk7XG4gICAgY29uc3QgYWxsUm91dGVzQ29uZmlndXJlZEZsYXQgPSBbXS5jb25jYXQuYXBwbHkoW10sIGFsbFJvdXRlc0NvbmZpZ3VyZWQpO1xuXG4gICAgaWYgKGFsbFJvdXRlc0NvbmZpZ3VyZWRGbGF0Lmxlbmd0aCA9PT0gMCkge1xuICAgICAgY29uc3QgeyBjb25maWdJZCB9ID0gYWxsQ29uZmlndXJhdGlvbnNbMF07XG4gICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoY29uZmlnSWQsIGBObyByb3V0ZXMgdG8gY2hlY2sgY29uZmlndXJlZGApO1xuXG4gICAgICByZXR1cm4gbmV4dC5oYW5kbGUocmVxKTtcbiAgICB9XG5cbiAgICBjb25zdCB7IG1hdGNoaW5nQ29uZmlnSWQsIG1hdGNoaW5nUm91dGUgfSA9IHRoaXMuY2xvc2VzdE1hdGNoaW5nUm91dGVTZXJ2aWNlLmdldENvbmZpZ0lkRm9yQ2xvc2VzdE1hdGNoaW5nUm91dGUocmVxLnVybCk7XG5cbiAgICBpZiAoIW1hdGNoaW5nQ29uZmlnSWQpIHtcbiAgICAgIGNvbnN0IHsgY29uZmlnSWQgfSA9IGFsbENvbmZpZ3VyYXRpb25zWzBdO1xuICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKGNvbmZpZ0lkLCBgRGlkIG5vdCBmaW5kIGFueSBjb25maWd1cmVkIHJvdXRlIGZvciByb3V0ZSAke3JlcS51cmx9YCk7XG5cbiAgICAgIHJldHVybiBuZXh0LmhhbmRsZShyZXEpO1xuICAgIH1cblxuICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1ZyhtYXRjaGluZ0NvbmZpZ0lkLCBgJyR7cmVxLnVybH0nIG1hdGNoZXMgY29uZmlndXJlZCByb3V0ZSAnJHttYXRjaGluZ1JvdXRlfSdgKTtcblxuICAgIGNvbnN0IHRva2VuID0gdGhpcy5hdXRoU3RhdGVTZXJ2aWNlLmdldEFjY2Vzc1Rva2VuKG1hdGNoaW5nQ29uZmlnSWQpO1xuXG4gICAgaWYgKCF0b2tlbikge1xuICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKG1hdGNoaW5nQ29uZmlnSWQsIGBXYW50ZWQgdG8gYWRkIHRva2VuIHRvICR7cmVxLnVybH0gYnV0IGZvdW5kIG5vIHRva2VuOiAnJHt0b2tlbn0nYCk7XG5cbiAgICAgIHJldHVybiBuZXh0LmhhbmRsZShyZXEpO1xuICAgIH1cblxuICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1ZyhtYXRjaGluZ0NvbmZpZ0lkLCBgJyR7cmVxLnVybH0nIG1hdGNoZXMgY29uZmlndXJlZCByb3V0ZSAnJHttYXRjaGluZ1JvdXRlfScsIGFkZGluZyB0b2tlbmApO1xuICAgIHJlcSA9IHJlcS5jbG9uZSh7XG4gICAgICBoZWFkZXJzOiByZXEuaGVhZGVycy5zZXQoJ0F1dGhvcml6YXRpb24nLCAnQmVhcmVyICcgKyB0b2tlbiksXG4gICAgfSk7XG5cbiAgICByZXR1cm4gbmV4dC5oYW5kbGUocmVxKTtcbiAgfVxufVxuIl19