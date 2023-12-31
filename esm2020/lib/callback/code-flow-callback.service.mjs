import { Injectable } from '@angular/core';
import { throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import * as i0 from "@angular/core";
import * as i1 from "../flows/flows.service";
import * as i2 from "../flows/flows-data.service";
import * as i3 from "./interval.service";
import * as i4 from "../config/provider/config.provider";
import * as i5 from "@angular/router";
export class CodeFlowCallbackService {
    constructor(flowsService, flowsDataService, intervalService, configurationProvider, router) {
        this.flowsService = flowsService;
        this.flowsDataService = flowsDataService;
        this.intervalService = intervalService;
        this.configurationProvider = configurationProvider;
        this.router = router;
    }
    authenticatedCallbackWithCode(urlToCheck, configId) {
        const isRenewProcess = this.flowsDataService.isSilentRenewRunning(configId);
        const { triggerAuthorizationResultEvent, postLoginRoute, unauthorizedRoute } = this.configurationProvider.getOpenIDConfiguration(configId);
        return this.flowsService.processCodeFlowCallback(urlToCheck, configId).pipe(tap((callbackContext) => {
            if (!triggerAuthorizationResultEvent && !callbackContext.isRenewProcess) {
                this.router.navigateByUrl(postLoginRoute);
            }
        }), catchError((error) => {
            this.flowsDataService.resetSilentRenewRunning(configId);
            this.intervalService.stopPeriodicTokenCheck();
            if (!triggerAuthorizationResultEvent && !isRenewProcess) {
                this.router.navigateByUrl(unauthorizedRoute);
            }
            return throwError(() => new Error(error));
        }));
    }
}
CodeFlowCallbackService.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: CodeFlowCallbackService, deps: [{ token: i1.FlowsService }, { token: i2.FlowsDataService }, { token: i3.IntervalService }, { token: i4.ConfigurationProvider }, { token: i5.Router }], target: i0.ɵɵFactoryTarget.Injectable });
CodeFlowCallbackService.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: CodeFlowCallbackService, providedIn: 'root' });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: CodeFlowCallbackService, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }], ctorParameters: function () { return [{ type: i1.FlowsService }, { type: i2.FlowsDataService }, { type: i3.IntervalService }, { type: i4.ConfigurationProvider }, { type: i5.Router }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29kZS1mbG93LWNhbGxiYWNrLnNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy9hbmd1bGFyLWF1dGgtb2lkYy1jbGllbnQvc3JjL2xpYi9jYWxsYmFjay9jb2RlLWZsb3ctY2FsbGJhY2suc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBRTNDLE9BQU8sRUFBYyxVQUFVLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFDOUMsT0FBTyxFQUFFLFVBQVUsRUFBRSxHQUFHLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQzs7Ozs7OztBQVFqRCxNQUFNLE9BQU8sdUJBQXVCO0lBQ2xDLFlBQ1UsWUFBMEIsRUFDMUIsZ0JBQWtDLEVBQ2xDLGVBQWdDLEVBQ2hDLHFCQUE0QyxFQUM1QyxNQUFjO1FBSmQsaUJBQVksR0FBWixZQUFZLENBQWM7UUFDMUIscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFrQjtRQUNsQyxvQkFBZSxHQUFmLGVBQWUsQ0FBaUI7UUFDaEMsMEJBQXFCLEdBQXJCLHFCQUFxQixDQUF1QjtRQUM1QyxXQUFNLEdBQU4sTUFBTSxDQUFRO0lBQ3JCLENBQUM7SUFFSiw2QkFBNkIsQ0FBQyxVQUFrQixFQUFFLFFBQWdCO1FBQ2hFLE1BQU0sY0FBYyxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxvQkFBb0IsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUM1RSxNQUFNLEVBQUUsK0JBQStCLEVBQUUsY0FBYyxFQUFFLGlCQUFpQixFQUFFLEdBQzFFLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxzQkFBc0IsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUU5RCxPQUFPLElBQUksQ0FBQyxZQUFZLENBQUMsdUJBQXVCLENBQUMsVUFBVSxFQUFFLFFBQVEsQ0FBQyxDQUFDLElBQUksQ0FDekUsR0FBRyxDQUFDLENBQUMsZUFBZSxFQUFFLEVBQUU7WUFDdEIsSUFBSSxDQUFDLCtCQUErQixJQUFJLENBQUMsZUFBZSxDQUFDLGNBQWMsRUFBRTtnQkFDdkUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsY0FBYyxDQUFDLENBQUM7YUFDM0M7UUFDSCxDQUFDLENBQUMsRUFDRixVQUFVLENBQUMsQ0FBQyxLQUFLLEVBQUUsRUFBRTtZQUNuQixJQUFJLENBQUMsZ0JBQWdCLENBQUMsdUJBQXVCLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDeEQsSUFBSSxDQUFDLGVBQWUsQ0FBQyxzQkFBc0IsRUFBRSxDQUFDO1lBQzlDLElBQUksQ0FBQywrQkFBK0IsSUFBSSxDQUFDLGNBQWMsRUFBRTtnQkFDdkQsSUFBSSxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsaUJBQWlCLENBQUMsQ0FBQzthQUM5QztZQUVELE9BQU8sVUFBVSxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFDNUMsQ0FBQyxDQUFDLENBQ0gsQ0FBQztJQUNKLENBQUM7O29IQTlCVSx1QkFBdUI7d0hBQXZCLHVCQUF1QixjQURWLE1BQU07MkZBQ25CLHVCQUF1QjtrQkFEbkMsVUFBVTttQkFBQyxFQUFFLFVBQVUsRUFBRSxNQUFNLEVBQUUiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJbmplY3RhYmxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBSb3V0ZXIgfSBmcm9tICdAYW5ndWxhci9yb3V0ZXInO1xuaW1wb3J0IHsgT2JzZXJ2YWJsZSwgdGhyb3dFcnJvciB9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHsgY2F0Y2hFcnJvciwgdGFwIH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuaW1wb3J0IHsgQ29uZmlndXJhdGlvblByb3ZpZGVyIH0gZnJvbSAnLi4vY29uZmlnL3Byb3ZpZGVyL2NvbmZpZy5wcm92aWRlcic7XG5pbXBvcnQgeyBDYWxsYmFja0NvbnRleHQgfSBmcm9tICcuLi9mbG93cy9jYWxsYmFjay1jb250ZXh0JztcbmltcG9ydCB7IEZsb3dzRGF0YVNlcnZpY2UgfSBmcm9tICcuLi9mbG93cy9mbG93cy1kYXRhLnNlcnZpY2UnO1xuaW1wb3J0IHsgRmxvd3NTZXJ2aWNlIH0gZnJvbSAnLi4vZmxvd3MvZmxvd3Muc2VydmljZSc7XG5pbXBvcnQgeyBJbnRlcnZhbFNlcnZpY2UgfSBmcm9tICcuL2ludGVydmFsLnNlcnZpY2UnO1xuXG5ASW5qZWN0YWJsZSh7IHByb3ZpZGVkSW46ICdyb290JyB9KVxuZXhwb3J0IGNsYXNzIENvZGVGbG93Q2FsbGJhY2tTZXJ2aWNlIHtcbiAgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSBmbG93c1NlcnZpY2U6IEZsb3dzU2VydmljZSxcbiAgICBwcml2YXRlIGZsb3dzRGF0YVNlcnZpY2U6IEZsb3dzRGF0YVNlcnZpY2UsXG4gICAgcHJpdmF0ZSBpbnRlcnZhbFNlcnZpY2U6IEludGVydmFsU2VydmljZSxcbiAgICBwcml2YXRlIGNvbmZpZ3VyYXRpb25Qcm92aWRlcjogQ29uZmlndXJhdGlvblByb3ZpZGVyLFxuICAgIHByaXZhdGUgcm91dGVyOiBSb3V0ZXJcbiAgKSB7fVxuXG4gIGF1dGhlbnRpY2F0ZWRDYWxsYmFja1dpdGhDb2RlKHVybFRvQ2hlY2s6IHN0cmluZywgY29uZmlnSWQ6IHN0cmluZyk6IE9ic2VydmFibGU8Q2FsbGJhY2tDb250ZXh0PiB7XG4gICAgY29uc3QgaXNSZW5ld1Byb2Nlc3MgPSB0aGlzLmZsb3dzRGF0YVNlcnZpY2UuaXNTaWxlbnRSZW5ld1J1bm5pbmcoY29uZmlnSWQpO1xuICAgIGNvbnN0IHsgdHJpZ2dlckF1dGhvcml6YXRpb25SZXN1bHRFdmVudCwgcG9zdExvZ2luUm91dGUsIHVuYXV0aG9yaXplZFJvdXRlIH0gPVxuICAgICAgdGhpcy5jb25maWd1cmF0aW9uUHJvdmlkZXIuZ2V0T3BlbklEQ29uZmlndXJhdGlvbihjb25maWdJZCk7XG5cbiAgICByZXR1cm4gdGhpcy5mbG93c1NlcnZpY2UucHJvY2Vzc0NvZGVGbG93Q2FsbGJhY2sodXJsVG9DaGVjaywgY29uZmlnSWQpLnBpcGUoXG4gICAgICB0YXAoKGNhbGxiYWNrQ29udGV4dCkgPT4ge1xuICAgICAgICBpZiAoIXRyaWdnZXJBdXRob3JpemF0aW9uUmVzdWx0RXZlbnQgJiYgIWNhbGxiYWNrQ29udGV4dC5pc1JlbmV3UHJvY2Vzcykge1xuICAgICAgICAgIHRoaXMucm91dGVyLm5hdmlnYXRlQnlVcmwocG9zdExvZ2luUm91dGUpO1xuICAgICAgICB9XG4gICAgICB9KSxcbiAgICAgIGNhdGNoRXJyb3IoKGVycm9yKSA9PiB7XG4gICAgICAgIHRoaXMuZmxvd3NEYXRhU2VydmljZS5yZXNldFNpbGVudFJlbmV3UnVubmluZyhjb25maWdJZCk7XG4gICAgICAgIHRoaXMuaW50ZXJ2YWxTZXJ2aWNlLnN0b3BQZXJpb2RpY1Rva2VuQ2hlY2soKTtcbiAgICAgICAgaWYgKCF0cmlnZ2VyQXV0aG9yaXphdGlvblJlc3VsdEV2ZW50ICYmICFpc1JlbmV3UHJvY2Vzcykge1xuICAgICAgICAgIHRoaXMucm91dGVyLm5hdmlnYXRlQnlVcmwodW5hdXRob3JpemVkUm91dGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRocm93RXJyb3IoKCkgPT4gbmV3IEVycm9yKGVycm9yKSk7XG4gICAgICB9KVxuICAgICk7XG4gIH1cbn1cbiJdfQ==