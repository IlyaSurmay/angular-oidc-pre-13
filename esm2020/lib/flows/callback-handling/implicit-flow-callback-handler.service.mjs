import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { of } from 'rxjs';
import * as i0 from "@angular/core";
import * as i1 from "../reset-auth-data.service";
import * as i2 from "../../logging/logger.service";
import * as i3 from "../flows-data.service";
export class ImplicitFlowCallbackHandlerService {
    constructor(resetAuthDataService, loggerService, flowsDataService, doc) {
        this.resetAuthDataService = resetAuthDataService;
        this.loggerService = loggerService;
        this.flowsDataService = flowsDataService;
        this.doc = doc;
    }
    // STEP 1 Code Flow
    // STEP 1 Implicit Flow
    implicitFlowCallback(configId, hash) {
        const isRenewProcessData = this.flowsDataService.isSilentRenewRunning(configId);
        this.loggerService.logDebug(configId, 'BEGIN callback, no auth data');
        if (!isRenewProcessData) {
            this.resetAuthDataService.resetAuthorizationData(configId);
        }
        hash = hash || this.doc.location.hash.substr(1);
        const authResult = hash.split('&').reduce((resultData, item) => {
            const parts = item.split('=');
            resultData[parts.shift()] = parts.join('=');
            return resultData;
        }, {});
        const callbackContext = {
            code: null,
            refreshToken: null,
            state: null,
            sessionState: null,
            authResult,
            isRenewProcess: isRenewProcessData,
            jwtKeys: null,
            validationResult: null,
            existingIdToken: null,
        };
        return of(callbackContext);
    }
}
ImplicitFlowCallbackHandlerService.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: ImplicitFlowCallbackHandlerService, deps: [{ token: i1.ResetAuthDataService }, { token: i2.LoggerService }, { token: i3.FlowsDataService }, { token: DOCUMENT }], target: i0.ɵɵFactoryTarget.Injectable });
ImplicitFlowCallbackHandlerService.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: ImplicitFlowCallbackHandlerService });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: ImplicitFlowCallbackHandlerService, decorators: [{
            type: Injectable
        }], ctorParameters: function () { return [{ type: i1.ResetAuthDataService }, { type: i2.LoggerService }, { type: i3.FlowsDataService }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [DOCUMENT]
                }] }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW1wbGljaXQtZmxvdy1jYWxsYmFjay1oYW5kbGVyLnNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy9hbmd1bGFyLWF1dGgtb2lkYy1jbGllbnQvc3JjL2xpYi9mbG93cy9jYWxsYmFjay1oYW5kbGluZy9pbXBsaWNpdC1mbG93LWNhbGxiYWNrLWhhbmRsZXIuc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFDM0MsT0FBTyxFQUFFLE1BQU0sRUFBRSxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDbkQsT0FBTyxFQUFjLEVBQUUsRUFBRSxNQUFNLE1BQU0sQ0FBQzs7Ozs7QUFPdEMsTUFBTSxPQUFPLGtDQUFrQztJQUM3QyxZQUNtQixvQkFBMEMsRUFDMUMsYUFBNEIsRUFDNUIsZ0JBQWtDLEVBQ2hCLEdBQVE7UUFIMUIseUJBQW9CLEdBQXBCLG9CQUFvQixDQUFzQjtRQUMxQyxrQkFBYSxHQUFiLGFBQWEsQ0FBZTtRQUM1QixxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQWtCO1FBQ2hCLFFBQUcsR0FBSCxHQUFHLENBQUs7SUFDMUMsQ0FBQztJQUVKLG1CQUFtQjtJQUNuQix1QkFBdUI7SUFDdkIsb0JBQW9CLENBQUMsUUFBZ0IsRUFBRSxJQUFhO1FBQ2xELE1BQU0sa0JBQWtCLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLG9CQUFvQixDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBRWhGLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRSw4QkFBOEIsQ0FBQyxDQUFDO1FBQ3RFLElBQUksQ0FBQyxrQkFBa0IsRUFBRTtZQUN2QixJQUFJLENBQUMsb0JBQW9CLENBQUMsc0JBQXNCLENBQUMsUUFBUSxDQUFDLENBQUM7U0FDNUQ7UUFFRCxJQUFJLEdBQUcsSUFBSSxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFaEQsTUFBTSxVQUFVLEdBQVEsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxVQUFlLEVBQUUsSUFBWSxFQUFFLEVBQUU7WUFDL0UsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUM5QixVQUFVLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBWSxDQUFDLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUV0RCxPQUFPLFVBQVUsQ0FBQztRQUNwQixDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFFUCxNQUFNLGVBQWUsR0FBRztZQUN0QixJQUFJLEVBQUUsSUFBSTtZQUNWLFlBQVksRUFBRSxJQUFJO1lBQ2xCLEtBQUssRUFBRSxJQUFJO1lBQ1gsWUFBWSxFQUFFLElBQUk7WUFDbEIsVUFBVTtZQUNWLGNBQWMsRUFBRSxrQkFBa0I7WUFDbEMsT0FBTyxFQUFFLElBQUk7WUFDYixnQkFBZ0IsRUFBRSxJQUFJO1lBQ3RCLGVBQWUsRUFBRSxJQUFJO1NBQ3RCLENBQUM7UUFFRixPQUFPLEVBQUUsQ0FBQyxlQUFlLENBQUMsQ0FBQztJQUM3QixDQUFDOzsrSEF4Q1Usa0NBQWtDLG1IQUtuQyxRQUFRO21JQUxQLGtDQUFrQzsyRkFBbEMsa0NBQWtDO2tCQUQ5QyxVQUFVOzswQkFNTixNQUFNOzJCQUFDLFFBQVEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBET0NVTUVOVCB9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG5pbXBvcnQgeyBJbmplY3QsIEluamVjdGFibGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IE9ic2VydmFibGUsIG9mIH0gZnJvbSAncnhqcyc7XG5pbXBvcnQgeyBMb2dnZXJTZXJ2aWNlIH0gZnJvbSAnLi4vLi4vbG9nZ2luZy9sb2dnZXIuc2VydmljZSc7XG5pbXBvcnQgeyBDYWxsYmFja0NvbnRleHQgfSBmcm9tICcuLi9jYWxsYmFjay1jb250ZXh0JztcbmltcG9ydCB7IEZsb3dzRGF0YVNlcnZpY2UgfSBmcm9tICcuLi9mbG93cy1kYXRhLnNlcnZpY2UnO1xuaW1wb3J0IHsgUmVzZXRBdXRoRGF0YVNlcnZpY2UgfSBmcm9tICcuLi9yZXNldC1hdXRoLWRhdGEuc2VydmljZSc7XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBJbXBsaWNpdEZsb3dDYWxsYmFja0hhbmRsZXJTZXJ2aWNlIHtcbiAgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSByZWFkb25seSByZXNldEF1dGhEYXRhU2VydmljZTogUmVzZXRBdXRoRGF0YVNlcnZpY2UsXG4gICAgcHJpdmF0ZSByZWFkb25seSBsb2dnZXJTZXJ2aWNlOiBMb2dnZXJTZXJ2aWNlLFxuICAgIHByaXZhdGUgcmVhZG9ubHkgZmxvd3NEYXRhU2VydmljZTogRmxvd3NEYXRhU2VydmljZSxcbiAgICBASW5qZWN0KERPQ1VNRU5UKSBwcml2YXRlIHJlYWRvbmx5IGRvYzogYW55XG4gICkge31cblxuICAvLyBTVEVQIDEgQ29kZSBGbG93XG4gIC8vIFNURVAgMSBJbXBsaWNpdCBGbG93XG4gIGltcGxpY2l0Rmxvd0NhbGxiYWNrKGNvbmZpZ0lkOiBzdHJpbmcsIGhhc2g/OiBzdHJpbmcpOiBPYnNlcnZhYmxlPENhbGxiYWNrQ29udGV4dD4ge1xuICAgIGNvbnN0IGlzUmVuZXdQcm9jZXNzRGF0YSA9IHRoaXMuZmxvd3NEYXRhU2VydmljZS5pc1NpbGVudFJlbmV3UnVubmluZyhjb25maWdJZCk7XG5cbiAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoY29uZmlnSWQsICdCRUdJTiBjYWxsYmFjaywgbm8gYXV0aCBkYXRhJyk7XG4gICAgaWYgKCFpc1JlbmV3UHJvY2Vzc0RhdGEpIHtcbiAgICAgIHRoaXMucmVzZXRBdXRoRGF0YVNlcnZpY2UucmVzZXRBdXRob3JpemF0aW9uRGF0YShjb25maWdJZCk7XG4gICAgfVxuXG4gICAgaGFzaCA9IGhhc2ggfHwgdGhpcy5kb2MubG9jYXRpb24uaGFzaC5zdWJzdHIoMSk7XG5cbiAgICBjb25zdCBhdXRoUmVzdWx0OiBhbnkgPSBoYXNoLnNwbGl0KCcmJykucmVkdWNlKChyZXN1bHREYXRhOiBhbnksIGl0ZW06IHN0cmluZykgPT4ge1xuICAgICAgY29uc3QgcGFydHMgPSBpdGVtLnNwbGl0KCc9Jyk7XG4gICAgICByZXN1bHREYXRhW3BhcnRzLnNoaWZ0KCkgYXMgc3RyaW5nXSA9IHBhcnRzLmpvaW4oJz0nKTtcblxuICAgICAgcmV0dXJuIHJlc3VsdERhdGE7XG4gICAgfSwge30pO1xuXG4gICAgY29uc3QgY2FsbGJhY2tDb250ZXh0ID0ge1xuICAgICAgY29kZTogbnVsbCxcbiAgICAgIHJlZnJlc2hUb2tlbjogbnVsbCxcbiAgICAgIHN0YXRlOiBudWxsLFxuICAgICAgc2Vzc2lvblN0YXRlOiBudWxsLFxuICAgICAgYXV0aFJlc3VsdCxcbiAgICAgIGlzUmVuZXdQcm9jZXNzOiBpc1JlbmV3UHJvY2Vzc0RhdGEsXG4gICAgICBqd3RLZXlzOiBudWxsLFxuICAgICAgdmFsaWRhdGlvblJlc3VsdDogbnVsbCxcbiAgICAgIGV4aXN0aW5nSWRUb2tlbjogbnVsbCxcbiAgICB9O1xuXG4gICAgcmV0dXJuIG9mKGNhbGxiYWNrQ29udGV4dCk7XG4gIH1cbn1cbiJdfQ==