import { Injectable } from '@angular/core';
import * as i0 from "@angular/core";
import * as i1 from "../config/provider/config.provider";
export class ClosestMatchingRouteService {
    constructor(configProvider) {
        this.configProvider = configProvider;
    }
    getConfigIdForClosestMatchingRoute(route) {
        const allConfiguredRoutes = this.getAllConfiguredRoutes();
        for (const routesWithConfig of allConfiguredRoutes) {
            const allRoutesForConfig = routesWithConfig.routes;
            for (const configuredRoute of allRoutesForConfig) {
                if (route.startsWith(configuredRoute)) {
                    return {
                        matchingRoute: configuredRoute,
                        matchingConfigId: routesWithConfig.configId,
                    };
                }
            }
        }
        return {
            matchingRoute: null,
            matchingConfigId: null,
        };
    }
    getAllConfiguredRoutes() {
        const allConfigurations = this.configProvider.getAllConfigurations();
        return allConfigurations.map((x) => ({ routes: x.secureRoutes, configId: x.configId }));
    }
}
ClosestMatchingRouteService.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: ClosestMatchingRouteService, deps: [{ token: i1.ConfigurationProvider }], target: i0.ɵɵFactoryTarget.Injectable });
ClosestMatchingRouteService.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: ClosestMatchingRouteService });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: ClosestMatchingRouteService, decorators: [{
            type: Injectable
        }], ctorParameters: function () { return [{ type: i1.ConfigurationProvider }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xvc2VzdC1tYXRjaGluZy1yb3V0ZS5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvYW5ndWxhci1hdXRoLW9pZGMtY2xpZW50L3NyYy9saWIvaW50ZXJjZXB0b3IvY2xvc2VzdC1tYXRjaGluZy1yb3V0ZS5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7OztBQUkzQyxNQUFNLE9BQU8sMkJBQTJCO0lBQ3RDLFlBQW9CLGNBQXFDO1FBQXJDLG1CQUFjLEdBQWQsY0FBYyxDQUF1QjtJQUFHLENBQUM7SUFFN0Qsa0NBQWtDLENBQUMsS0FBYTtRQUM5QyxNQUFNLG1CQUFtQixHQUFHLElBQUksQ0FBQyxzQkFBc0IsRUFBRSxDQUFDO1FBRTFELEtBQUssTUFBTSxnQkFBZ0IsSUFBSSxtQkFBbUIsRUFBRTtZQUNsRCxNQUFNLGtCQUFrQixHQUFHLGdCQUFnQixDQUFDLE1BQU0sQ0FBQztZQUVuRCxLQUFLLE1BQU0sZUFBZSxJQUFJLGtCQUFrQixFQUFFO2dCQUNoRCxJQUFJLEtBQUssQ0FBQyxVQUFVLENBQUMsZUFBZSxDQUFDLEVBQUU7b0JBQ3JDLE9BQU87d0JBQ0wsYUFBYSxFQUFFLGVBQWU7d0JBQzlCLGdCQUFnQixFQUFFLGdCQUFnQixDQUFDLFFBQVE7cUJBQzVDLENBQUM7aUJBQ0g7YUFDRjtTQUNGO1FBRUQsT0FBTztZQUNMLGFBQWEsRUFBRSxJQUFJO1lBQ25CLGdCQUFnQixFQUFFLElBQUk7U0FDdkIsQ0FBQztJQUNKLENBQUM7SUFFTyxzQkFBc0I7UUFDNUIsTUFBTSxpQkFBaUIsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLG9CQUFvQixFQUFFLENBQUM7UUFFckUsT0FBTyxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxDQUFDLFlBQVksRUFBRSxRQUFRLEVBQUUsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUMxRixDQUFDOzt3SEE3QlUsMkJBQTJCOzRIQUEzQiwyQkFBMkI7MkZBQTNCLDJCQUEyQjtrQkFEdkMsVUFBVSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEluamVjdGFibGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IENvbmZpZ3VyYXRpb25Qcm92aWRlciB9IGZyb20gJy4uL2NvbmZpZy9wcm92aWRlci9jb25maWcucHJvdmlkZXInO1xuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgQ2xvc2VzdE1hdGNoaW5nUm91dGVTZXJ2aWNlIHtcbiAgY29uc3RydWN0b3IocHJpdmF0ZSBjb25maWdQcm92aWRlcjogQ29uZmlndXJhdGlvblByb3ZpZGVyKSB7fVxuXG4gIGdldENvbmZpZ0lkRm9yQ2xvc2VzdE1hdGNoaW5nUm91dGUocm91dGU6IHN0cmluZyk6IENsb3Nlc3RNYXRjaGluZ1JvdXRlUmVzdWx0IHtcbiAgICBjb25zdCBhbGxDb25maWd1cmVkUm91dGVzID0gdGhpcy5nZXRBbGxDb25maWd1cmVkUm91dGVzKCk7XG5cbiAgICBmb3IgKGNvbnN0IHJvdXRlc1dpdGhDb25maWcgb2YgYWxsQ29uZmlndXJlZFJvdXRlcykge1xuICAgICAgY29uc3QgYWxsUm91dGVzRm9yQ29uZmlnID0gcm91dGVzV2l0aENvbmZpZy5yb3V0ZXM7XG5cbiAgICAgIGZvciAoY29uc3QgY29uZmlndXJlZFJvdXRlIG9mIGFsbFJvdXRlc0ZvckNvbmZpZykge1xuICAgICAgICBpZiAocm91dGUuc3RhcnRzV2l0aChjb25maWd1cmVkUm91dGUpKSB7XG4gICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIG1hdGNoaW5nUm91dGU6IGNvbmZpZ3VyZWRSb3V0ZSxcbiAgICAgICAgICAgIG1hdGNoaW5nQ29uZmlnSWQ6IHJvdXRlc1dpdGhDb25maWcuY29uZmlnSWQsXG4gICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICBtYXRjaGluZ1JvdXRlOiBudWxsLFxuICAgICAgbWF0Y2hpbmdDb25maWdJZDogbnVsbCxcbiAgICB9O1xuICB9XG5cbiAgcHJpdmF0ZSBnZXRBbGxDb25maWd1cmVkUm91dGVzKCk6IENvbmZpZ3VyZWRSb3V0ZXNXaXRoQ29uZmlnW10ge1xuICAgIGNvbnN0IGFsbENvbmZpZ3VyYXRpb25zID0gdGhpcy5jb25maWdQcm92aWRlci5nZXRBbGxDb25maWd1cmF0aW9ucygpO1xuXG4gICAgcmV0dXJuIGFsbENvbmZpZ3VyYXRpb25zLm1hcCgoeCkgPT4gKHsgcm91dGVzOiB4LnNlY3VyZVJvdXRlcywgY29uZmlnSWQ6IHguY29uZmlnSWQgfSkpO1xuICB9XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ29uZmlndXJlZFJvdXRlc1dpdGhDb25maWcge1xuICByb3V0ZXM6IHN0cmluZ1tdO1xuICBjb25maWdJZDogc3RyaW5nO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIENsb3Nlc3RNYXRjaGluZ1JvdXRlUmVzdWx0IHtcbiAgbWF0Y2hpbmdSb3V0ZTogc3RyaW5nO1xuICBtYXRjaGluZ0NvbmZpZ0lkOiBzdHJpbmc7XG59XG4iXX0=