import { Injectable } from '@angular/core';
import { map, retry } from 'rxjs/operators';
import * as i0 from "@angular/core";
import * as i1 from "../../api/data.service";
const WELL_KNOWN_SUFFIX = `/.well-known/openid-configuration`;
export class AuthWellKnownDataService {
    constructor(http) {
        this.http = http;
    }
    getWellKnownEndPointsFromUrl(authWellknownEndpoint, configId) {
        return this.getWellKnownDocument(authWellknownEndpoint, configId).pipe(map((wellKnownEndpoints) => ({
            issuer: wellKnownEndpoints.issuer,
            jwksUri: wellKnownEndpoints.jwks_uri,
            authorizationEndpoint: wellKnownEndpoints.authorization_endpoint,
            tokenEndpoint: wellKnownEndpoints.token_endpoint,
            userInfoEndpoint: wellKnownEndpoints.userinfo_endpoint,
            endSessionEndpoint: wellKnownEndpoints.end_session_endpoint,
            checkSessionIframe: wellKnownEndpoints.check_session_iframe,
            revocationEndpoint: wellKnownEndpoints.revocation_endpoint,
            introspectionEndpoint: wellKnownEndpoints.introspection_endpoint,
            parEndpoint: wellKnownEndpoints.pushed_authorization_request_endpoint,
        })));
    }
    getWellKnownDocument(wellKnownEndpoint, configId) {
        let url = wellKnownEndpoint;
        if (!wellKnownEndpoint.includes(WELL_KNOWN_SUFFIX)) {
            url = `${wellKnownEndpoint}${WELL_KNOWN_SUFFIX}`;
        }
        return this.http.get(url, configId).pipe(retry(2));
    }
}
AuthWellKnownDataService.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: AuthWellKnownDataService, deps: [{ token: i1.DataService }], target: i0.ɵɵFactoryTarget.Injectable });
AuthWellKnownDataService.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: AuthWellKnownDataService });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: AuthWellKnownDataService, decorators: [{
            type: Injectable
        }], ctorParameters: function () { return [{ type: i1.DataService }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXV0aC13ZWxsLWtub3duLWRhdGEuc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL2FuZ3VsYXItYXV0aC1vaWRjLWNsaWVudC9zcmMvbGliL2NvbmZpZy9hdXRoLXdlbGwta25vd24vYXV0aC13ZWxsLWtub3duLWRhdGEuc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBRTNDLE9BQU8sRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7OztBQUk1QyxNQUFNLGlCQUFpQixHQUFHLG1DQUFtQyxDQUFDO0FBRzlELE1BQU0sT0FBTyx3QkFBd0I7SUFDbkMsWUFBNkIsSUFBaUI7UUFBakIsU0FBSSxHQUFKLElBQUksQ0FBYTtJQUFHLENBQUM7SUFFbEQsNEJBQTRCLENBQUMscUJBQTZCLEVBQUUsUUFBZ0I7UUFDMUUsT0FBTyxJQUFJLENBQUMsb0JBQW9CLENBQUMscUJBQXFCLEVBQUUsUUFBUSxDQUFDLENBQUMsSUFBSSxDQUNwRSxHQUFHLENBQ0QsQ0FBQyxrQkFBa0IsRUFBRSxFQUFFLENBQ3JCLENBQUM7WUFDQyxNQUFNLEVBQUUsa0JBQWtCLENBQUMsTUFBTTtZQUNqQyxPQUFPLEVBQUUsa0JBQWtCLENBQUMsUUFBUTtZQUNwQyxxQkFBcUIsRUFBRSxrQkFBa0IsQ0FBQyxzQkFBc0I7WUFDaEUsYUFBYSxFQUFFLGtCQUFrQixDQUFDLGNBQWM7WUFDaEQsZ0JBQWdCLEVBQUUsa0JBQWtCLENBQUMsaUJBQWlCO1lBQ3RELGtCQUFrQixFQUFFLGtCQUFrQixDQUFDLG9CQUFvQjtZQUMzRCxrQkFBa0IsRUFBRSxrQkFBa0IsQ0FBQyxvQkFBb0I7WUFDM0Qsa0JBQWtCLEVBQUUsa0JBQWtCLENBQUMsbUJBQW1CO1lBQzFELHFCQUFxQixFQUFFLGtCQUFrQixDQUFDLHNCQUFzQjtZQUNoRSxXQUFXLEVBQUUsa0JBQWtCLENBQUMscUNBQXFDO1NBQzNDLENBQUEsQ0FDL0IsQ0FDRixDQUFDO0lBQ0osQ0FBQztJQUVPLG9CQUFvQixDQUFDLGlCQUF5QixFQUFFLFFBQWdCO1FBQ3RFLElBQUksR0FBRyxHQUFHLGlCQUFpQixDQUFDO1FBRTVCLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxRQUFRLENBQUMsaUJBQWlCLENBQUMsRUFBRTtZQUNsRCxHQUFHLEdBQUcsR0FBRyxpQkFBaUIsR0FBRyxpQkFBaUIsRUFBRSxDQUFDO1NBQ2xEO1FBRUQsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBTSxHQUFHLEVBQUUsUUFBUSxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzFELENBQUM7O3FIQS9CVSx3QkFBd0I7eUhBQXhCLHdCQUF3QjsyRkFBeEIsd0JBQXdCO2tCQURwQyxVQUFVIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSW5qZWN0YWJsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgT2JzZXJ2YWJsZSB9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHsgbWFwLCByZXRyeSB9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcbmltcG9ydCB7IERhdGFTZXJ2aWNlIH0gZnJvbSAnLi4vLi4vYXBpL2RhdGEuc2VydmljZSc7XG5pbXBvcnQgeyBBdXRoV2VsbEtub3duRW5kcG9pbnRzIH0gZnJvbSAnLi9hdXRoLXdlbGwta25vd24tZW5kcG9pbnRzJztcblxuY29uc3QgV0VMTF9LTk9XTl9TVUZGSVggPSBgLy53ZWxsLWtub3duL29wZW5pZC1jb25maWd1cmF0aW9uYDtcblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIEF1dGhXZWxsS25vd25EYXRhU2VydmljZSB7XG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgcmVhZG9ubHkgaHR0cDogRGF0YVNlcnZpY2UpIHt9XG5cbiAgZ2V0V2VsbEtub3duRW5kUG9pbnRzRnJvbVVybChhdXRoV2VsbGtub3duRW5kcG9pbnQ6IHN0cmluZywgY29uZmlnSWQ6IHN0cmluZyk6IE9ic2VydmFibGU8QXV0aFdlbGxLbm93bkVuZHBvaW50cz4ge1xuICAgIHJldHVybiB0aGlzLmdldFdlbGxLbm93bkRvY3VtZW50KGF1dGhXZWxsa25vd25FbmRwb2ludCwgY29uZmlnSWQpLnBpcGUoXG4gICAgICBtYXAoXG4gICAgICAgICh3ZWxsS25vd25FbmRwb2ludHMpID0+XG4gICAgICAgICAgKHtcbiAgICAgICAgICAgIGlzc3Vlcjogd2VsbEtub3duRW5kcG9pbnRzLmlzc3VlcixcbiAgICAgICAgICAgIGp3a3NVcmk6IHdlbGxLbm93bkVuZHBvaW50cy5qd2tzX3VyaSxcbiAgICAgICAgICAgIGF1dGhvcml6YXRpb25FbmRwb2ludDogd2VsbEtub3duRW5kcG9pbnRzLmF1dGhvcml6YXRpb25fZW5kcG9pbnQsXG4gICAgICAgICAgICB0b2tlbkVuZHBvaW50OiB3ZWxsS25vd25FbmRwb2ludHMudG9rZW5fZW5kcG9pbnQsXG4gICAgICAgICAgICB1c2VySW5mb0VuZHBvaW50OiB3ZWxsS25vd25FbmRwb2ludHMudXNlcmluZm9fZW5kcG9pbnQsXG4gICAgICAgICAgICBlbmRTZXNzaW9uRW5kcG9pbnQ6IHdlbGxLbm93bkVuZHBvaW50cy5lbmRfc2Vzc2lvbl9lbmRwb2ludCxcbiAgICAgICAgICAgIGNoZWNrU2Vzc2lvbklmcmFtZTogd2VsbEtub3duRW5kcG9pbnRzLmNoZWNrX3Nlc3Npb25faWZyYW1lLFxuICAgICAgICAgICAgcmV2b2NhdGlvbkVuZHBvaW50OiB3ZWxsS25vd25FbmRwb2ludHMucmV2b2NhdGlvbl9lbmRwb2ludCxcbiAgICAgICAgICAgIGludHJvc3BlY3Rpb25FbmRwb2ludDogd2VsbEtub3duRW5kcG9pbnRzLmludHJvc3BlY3Rpb25fZW5kcG9pbnQsXG4gICAgICAgICAgICBwYXJFbmRwb2ludDogd2VsbEtub3duRW5kcG9pbnRzLnB1c2hlZF9hdXRob3JpemF0aW9uX3JlcXVlc3RfZW5kcG9pbnQsXG4gICAgICAgICAgfSBhcyBBdXRoV2VsbEtub3duRW5kcG9pbnRzKVxuICAgICAgKVxuICAgICk7XG4gIH1cblxuICBwcml2YXRlIGdldFdlbGxLbm93bkRvY3VtZW50KHdlbGxLbm93bkVuZHBvaW50OiBzdHJpbmcsIGNvbmZpZ0lkOiBzdHJpbmcpOiBPYnNlcnZhYmxlPGFueT4ge1xuICAgIGxldCB1cmwgPSB3ZWxsS25vd25FbmRwb2ludDtcblxuICAgIGlmICghd2VsbEtub3duRW5kcG9pbnQuaW5jbHVkZXMoV0VMTF9LTk9XTl9TVUZGSVgpKSB7XG4gICAgICB1cmwgPSBgJHt3ZWxsS25vd25FbmRwb2ludH0ke1dFTExfS05PV05fU1VGRklYfWA7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuaHR0cC5nZXQ8YW55Pih1cmwsIGNvbmZpZ0lkKS5waXBlKHJldHJ5KDIpKTtcbiAgfVxufVxuIl19