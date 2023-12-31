import { Injectable } from '@angular/core';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import * as i0 from "@angular/core";
import * as i1 from "../logging/logger.service";
import * as i2 from "../flows/reset-auth-data.service";
import * as i3 from "../flows/flows.service";
import * as i4 from "./interval.service";
export class RefreshSessionRefreshTokenService {
    constructor(loggerService, resetAuthDataService, flowsService, intervalService) {
        this.loggerService = loggerService;
        this.resetAuthDataService = resetAuthDataService;
        this.flowsService = flowsService;
        this.intervalService = intervalService;
    }
    refreshSessionWithRefreshTokens(configId, customParamsRefresh) {
        this.loggerService.logDebug(configId, 'BEGIN refresh session Authorize');
        return this.flowsService.processRefreshToken(configId, customParamsRefresh).pipe(catchError((error) => {
            this.intervalService.stopPeriodicTokenCheck();
            this.resetAuthDataService.resetAuthorizationData(configId);
            return throwError(() => new Error(error));
        }));
    }
}
RefreshSessionRefreshTokenService.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: RefreshSessionRefreshTokenService, deps: [{ token: i1.LoggerService }, { token: i2.ResetAuthDataService }, { token: i3.FlowsService }, { token: i4.IntervalService }], target: i0.ɵɵFactoryTarget.Injectable });
RefreshSessionRefreshTokenService.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: RefreshSessionRefreshTokenService, providedIn: 'root' });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: RefreshSessionRefreshTokenService, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }], ctorParameters: function () { return [{ type: i1.LoggerService }, { type: i2.ResetAuthDataService }, { type: i3.FlowsService }, { type: i4.IntervalService }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVmcmVzaC1zZXNzaW9uLXJlZnJlc2gtdG9rZW4uc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL2FuZ3VsYXItYXV0aC1vaWRjLWNsaWVudC9zcmMvbGliL2NhbGxiYWNrL3JlZnJlc2gtc2Vzc2lvbi1yZWZyZXNoLXRva2VuLnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUMzQyxPQUFPLEVBQWMsVUFBVSxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBQzlDLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQzs7Ozs7O0FBUTVDLE1BQU0sT0FBTyxpQ0FBaUM7SUFDNUMsWUFDVSxhQUE0QixFQUM1QixvQkFBMEMsRUFDMUMsWUFBMEIsRUFDMUIsZUFBZ0M7UUFIaEMsa0JBQWEsR0FBYixhQUFhLENBQWU7UUFDNUIseUJBQW9CLEdBQXBCLG9CQUFvQixDQUFzQjtRQUMxQyxpQkFBWSxHQUFaLFlBQVksQ0FBYztRQUMxQixvQkFBZSxHQUFmLGVBQWUsQ0FBaUI7SUFDdkMsQ0FBQztJQUVKLCtCQUErQixDQUM3QixRQUFnQixFQUNoQixtQkFBa0U7UUFFbEUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFLGlDQUFpQyxDQUFDLENBQUM7UUFFekUsT0FBTyxJQUFJLENBQUMsWUFBWSxDQUFDLG1CQUFtQixDQUFDLFFBQVEsRUFBRSxtQkFBbUIsQ0FBQyxDQUFDLElBQUksQ0FDOUUsVUFBVSxDQUFDLENBQUMsS0FBSyxFQUFFLEVBQUU7WUFDbkIsSUFBSSxDQUFDLGVBQWUsQ0FBQyxzQkFBc0IsRUFBRSxDQUFDO1lBQzlDLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxzQkFBc0IsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUUzRCxPQUFPLFVBQVUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBQzVDLENBQUMsQ0FBQyxDQUNILENBQUM7SUFDSixDQUFDOzs4SEF0QlUsaUNBQWlDO2tJQUFqQyxpQ0FBaUMsY0FEcEIsTUFBTTsyRkFDbkIsaUNBQWlDO2tCQUQ3QyxVQUFVO21CQUFDLEVBQUUsVUFBVSxFQUFFLE1BQU0sRUFBRSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEluamVjdGFibGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IE9ic2VydmFibGUsIHRocm93RXJyb3IgfSBmcm9tICdyeGpzJztcbmltcG9ydCB7IGNhdGNoRXJyb3IgfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5pbXBvcnQgeyBDYWxsYmFja0NvbnRleHQgfSBmcm9tICcuLi9mbG93cy9jYWxsYmFjay1jb250ZXh0JztcbmltcG9ydCB7IEZsb3dzU2VydmljZSB9IGZyb20gJy4uL2Zsb3dzL2Zsb3dzLnNlcnZpY2UnO1xuaW1wb3J0IHsgUmVzZXRBdXRoRGF0YVNlcnZpY2UgfSBmcm9tICcuLi9mbG93cy9yZXNldC1hdXRoLWRhdGEuc2VydmljZSc7XG5pbXBvcnQgeyBMb2dnZXJTZXJ2aWNlIH0gZnJvbSAnLi4vbG9nZ2luZy9sb2dnZXIuc2VydmljZSc7XG5pbXBvcnQgeyBJbnRlcnZhbFNlcnZpY2UgfSBmcm9tICcuL2ludGVydmFsLnNlcnZpY2UnO1xuXG5ASW5qZWN0YWJsZSh7IHByb3ZpZGVkSW46ICdyb290JyB9KVxuZXhwb3J0IGNsYXNzIFJlZnJlc2hTZXNzaW9uUmVmcmVzaFRva2VuU2VydmljZSB7XG4gIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUgbG9nZ2VyU2VydmljZTogTG9nZ2VyU2VydmljZSxcbiAgICBwcml2YXRlIHJlc2V0QXV0aERhdGFTZXJ2aWNlOiBSZXNldEF1dGhEYXRhU2VydmljZSxcbiAgICBwcml2YXRlIGZsb3dzU2VydmljZTogRmxvd3NTZXJ2aWNlLFxuICAgIHByaXZhdGUgaW50ZXJ2YWxTZXJ2aWNlOiBJbnRlcnZhbFNlcnZpY2VcbiAgKSB7fVxuXG4gIHJlZnJlc2hTZXNzaW9uV2l0aFJlZnJlc2hUb2tlbnMoXG4gICAgY29uZmlnSWQ6IHN0cmluZyxcbiAgICBjdXN0b21QYXJhbXNSZWZyZXNoPzogeyBba2V5OiBzdHJpbmddOiBzdHJpbmcgfCBudW1iZXIgfCBib29sZWFuIH1cbiAgKTogT2JzZXJ2YWJsZTxDYWxsYmFja0NvbnRleHQ+IHtcbiAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoY29uZmlnSWQsICdCRUdJTiByZWZyZXNoIHNlc3Npb24gQXV0aG9yaXplJyk7XG5cbiAgICByZXR1cm4gdGhpcy5mbG93c1NlcnZpY2UucHJvY2Vzc1JlZnJlc2hUb2tlbihjb25maWdJZCwgY3VzdG9tUGFyYW1zUmVmcmVzaCkucGlwZShcbiAgICAgIGNhdGNoRXJyb3IoKGVycm9yKSA9PiB7XG4gICAgICAgIHRoaXMuaW50ZXJ2YWxTZXJ2aWNlLnN0b3BQZXJpb2RpY1Rva2VuQ2hlY2soKTtcbiAgICAgICAgdGhpcy5yZXNldEF1dGhEYXRhU2VydmljZS5yZXNldEF1dGhvcml6YXRpb25EYXRhKGNvbmZpZ0lkKTtcblxuICAgICAgICByZXR1cm4gdGhyb3dFcnJvcigoKSA9PiBuZXcgRXJyb3IoZXJyb3IpKTtcbiAgICAgIH0pXG4gICAgKTtcbiAgfVxufVxuIl19