import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { tap } from 'rxjs/operators';
import * as i0 from "@angular/core";
import * as i1 from "../utils/url/url.service";
import * as i2 from "../utils/flowHelper/flow-helper.service";
import * as i3 from "./implicit-flow-callback.service";
import * as i4 from "./code-flow-callback.service";
export class CallbackService {
    constructor(urlService, flowHelper, implicitFlowCallbackService, codeFlowCallbackService) {
        this.urlService = urlService;
        this.flowHelper = flowHelper;
        this.implicitFlowCallbackService = implicitFlowCallbackService;
        this.codeFlowCallbackService = codeFlowCallbackService;
        this.stsCallbackInternal$ = new Subject();
    }
    get stsCallback$() {
        return this.stsCallbackInternal$.asObservable();
    }
    isCallback(currentUrl) {
        return this.urlService.isCallbackFromSts(currentUrl);
    }
    handleCallbackAndFireEvents(currentCallbackUrl, configId) {
        let callback$;
        if (this.flowHelper.isCurrentFlowCodeFlow(configId)) {
            callback$ = this.codeFlowCallbackService.authenticatedCallbackWithCode(currentCallbackUrl, configId);
        }
        else if (this.flowHelper.isCurrentFlowAnyImplicitFlow(configId)) {
            callback$ = this.implicitFlowCallbackService.authenticatedImplicitFlowCallback(configId);
        }
        return callback$.pipe(tap(() => this.stsCallbackInternal$.next()));
    }
}
CallbackService.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: CallbackService, deps: [{ token: i1.UrlService }, { token: i2.FlowHelper }, { token: i3.ImplicitFlowCallbackService }, { token: i4.CodeFlowCallbackService }], target: i0.ɵɵFactoryTarget.Injectable });
CallbackService.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: CallbackService, providedIn: 'root' });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: CallbackService, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }], ctorParameters: function () { return [{ type: i1.UrlService }, { type: i2.FlowHelper }, { type: i3.ImplicitFlowCallbackService }, { type: i4.CodeFlowCallbackService }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FsbGJhY2suc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL2FuZ3VsYXItYXV0aC1vaWRjLWNsaWVudC9zcmMvbGliL2NhbGxiYWNrL2NhbGxiYWNrLnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUMzQyxPQUFPLEVBQWMsT0FBTyxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBQzNDLE9BQU8sRUFBRSxHQUFHLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQzs7Ozs7O0FBUXJDLE1BQU0sT0FBTyxlQUFlO0lBTzFCLFlBQ1UsVUFBc0IsRUFDdEIsVUFBc0IsRUFDdEIsMkJBQXdELEVBQ3hELHVCQUFnRDtRQUhoRCxlQUFVLEdBQVYsVUFBVSxDQUFZO1FBQ3RCLGVBQVUsR0FBVixVQUFVLENBQVk7UUFDdEIsZ0NBQTJCLEdBQTNCLDJCQUEyQixDQUE2QjtRQUN4RCw0QkFBdUIsR0FBdkIsdUJBQXVCLENBQXlCO1FBVmxELHlCQUFvQixHQUFHLElBQUksT0FBTyxFQUFRLENBQUM7SUFXaEQsQ0FBQztJQVRKLElBQUksWUFBWTtRQUNkLE9BQU8sSUFBSSxDQUFDLG9CQUFvQixDQUFDLFlBQVksRUFBRSxDQUFDO0lBQ2xELENBQUM7SUFTRCxVQUFVLENBQUMsVUFBa0I7UUFDM0IsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLGlCQUFpQixDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBQ3ZELENBQUM7SUFFRCwyQkFBMkIsQ0FBQyxrQkFBMEIsRUFBRSxRQUFnQjtRQUN0RSxJQUFJLFNBQTBCLENBQUM7UUFFL0IsSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLHFCQUFxQixDQUFDLFFBQVEsQ0FBQyxFQUFFO1lBQ25ELFNBQVMsR0FBRyxJQUFJLENBQUMsdUJBQXVCLENBQUMsNkJBQTZCLENBQUMsa0JBQWtCLEVBQUUsUUFBUSxDQUFDLENBQUM7U0FDdEc7YUFBTSxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsNEJBQTRCLENBQUMsUUFBUSxDQUFDLEVBQUU7WUFDakUsU0FBUyxHQUFHLElBQUksQ0FBQywyQkFBMkIsQ0FBQyxpQ0FBaUMsQ0FBQyxRQUFRLENBQUMsQ0FBQztTQUMxRjtRQUVELE9BQU8sU0FBUyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLG9CQUFvQixDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQztJQUNyRSxDQUFDOzs0R0E1QlUsZUFBZTtnSEFBZixlQUFlLGNBREYsTUFBTTsyRkFDbkIsZUFBZTtrQkFEM0IsVUFBVTttQkFBQyxFQUFFLFVBQVUsRUFBRSxNQUFNLEVBQUUiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJbmplY3RhYmxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBPYnNlcnZhYmxlLCBTdWJqZWN0IH0gZnJvbSAncnhqcyc7XG5pbXBvcnQgeyB0YXAgfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5pbXBvcnQgeyBDYWxsYmFja0NvbnRleHQgfSBmcm9tICcuLi9mbG93cy9jYWxsYmFjay1jb250ZXh0JztcbmltcG9ydCB7IEZsb3dIZWxwZXIgfSBmcm9tICcuLi91dGlscy9mbG93SGVscGVyL2Zsb3ctaGVscGVyLnNlcnZpY2UnO1xuaW1wb3J0IHsgVXJsU2VydmljZSB9IGZyb20gJy4uL3V0aWxzL3VybC91cmwuc2VydmljZSc7XG5pbXBvcnQgeyBDb2RlRmxvd0NhbGxiYWNrU2VydmljZSB9IGZyb20gJy4vY29kZS1mbG93LWNhbGxiYWNrLnNlcnZpY2UnO1xuaW1wb3J0IHsgSW1wbGljaXRGbG93Q2FsbGJhY2tTZXJ2aWNlIH0gZnJvbSAnLi9pbXBsaWNpdC1mbG93LWNhbGxiYWNrLnNlcnZpY2UnO1xuXG5ASW5qZWN0YWJsZSh7IHByb3ZpZGVkSW46ICdyb290JyB9KVxuZXhwb3J0IGNsYXNzIENhbGxiYWNrU2VydmljZSB7XG4gIHByaXZhdGUgc3RzQ2FsbGJhY2tJbnRlcm5hbCQgPSBuZXcgU3ViamVjdDx2b2lkPigpO1xuXG4gIGdldCBzdHNDYWxsYmFjayQoKTogT2JzZXJ2YWJsZTx1bmtub3duPiB7XG4gICAgcmV0dXJuIHRoaXMuc3RzQ2FsbGJhY2tJbnRlcm5hbCQuYXNPYnNlcnZhYmxlKCk7XG4gIH1cblxuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIHVybFNlcnZpY2U6IFVybFNlcnZpY2UsXG4gICAgcHJpdmF0ZSBmbG93SGVscGVyOiBGbG93SGVscGVyLFxuICAgIHByaXZhdGUgaW1wbGljaXRGbG93Q2FsbGJhY2tTZXJ2aWNlOiBJbXBsaWNpdEZsb3dDYWxsYmFja1NlcnZpY2UsXG4gICAgcHJpdmF0ZSBjb2RlRmxvd0NhbGxiYWNrU2VydmljZTogQ29kZUZsb3dDYWxsYmFja1NlcnZpY2VcbiAgKSB7fVxuXG4gIGlzQ2FsbGJhY2soY3VycmVudFVybDogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMudXJsU2VydmljZS5pc0NhbGxiYWNrRnJvbVN0cyhjdXJyZW50VXJsKTtcbiAgfVxuXG4gIGhhbmRsZUNhbGxiYWNrQW5kRmlyZUV2ZW50cyhjdXJyZW50Q2FsbGJhY2tVcmw6IHN0cmluZywgY29uZmlnSWQ6IHN0cmluZyk6IE9ic2VydmFibGU8Q2FsbGJhY2tDb250ZXh0PiB7XG4gICAgbGV0IGNhbGxiYWNrJDogT2JzZXJ2YWJsZTxhbnk+O1xuXG4gICAgaWYgKHRoaXMuZmxvd0hlbHBlci5pc0N1cnJlbnRGbG93Q29kZUZsb3coY29uZmlnSWQpKSB7XG4gICAgICBjYWxsYmFjayQgPSB0aGlzLmNvZGVGbG93Q2FsbGJhY2tTZXJ2aWNlLmF1dGhlbnRpY2F0ZWRDYWxsYmFja1dpdGhDb2RlKGN1cnJlbnRDYWxsYmFja1VybCwgY29uZmlnSWQpO1xuICAgIH0gZWxzZSBpZiAodGhpcy5mbG93SGVscGVyLmlzQ3VycmVudEZsb3dBbnlJbXBsaWNpdEZsb3coY29uZmlnSWQpKSB7XG4gICAgICBjYWxsYmFjayQgPSB0aGlzLmltcGxpY2l0Rmxvd0NhbGxiYWNrU2VydmljZS5hdXRoZW50aWNhdGVkSW1wbGljaXRGbG93Q2FsbGJhY2soY29uZmlnSWQpO1xuICAgIH1cblxuICAgIHJldHVybiBjYWxsYmFjayQucGlwZSh0YXAoKCkgPT4gdGhpcy5zdHNDYWxsYmFja0ludGVybmFsJC5uZXh0KCkpKTtcbiAgfVxufVxuIl19