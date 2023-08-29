import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { throwError } from 'rxjs';
import { catchError, map, retry } from 'rxjs/operators';
import * as i0 from "@angular/core";
import * as i1 from "../../logging/logger.service";
import * as i2 from "../../utils/url/url.service";
import * as i3 from "../../api/data.service";
import * as i4 from "../../storage/storage-persistence.service";
export class ParService {
    constructor(loggerService, urlService, dataService, storagePersistenceService) {
        this.loggerService = loggerService;
        this.urlService = urlService;
        this.dataService = dataService;
        this.storagePersistenceService = storagePersistenceService;
    }
    postParRequest(configId, customParams) {
        let headers = new HttpHeaders();
        headers = headers.set('Content-Type', 'application/x-www-form-urlencoded');
        const authWellknownEndpoints = this.storagePersistenceService.read('authWellKnownEndPoints', configId);
        if (!authWellknownEndpoints) {
            return throwError(() => new Error('Could not read PAR endpoint because authWellKnownEndPoints are not given'));
        }
        const parEndpoint = authWellknownEndpoints.parEndpoint;
        if (!parEndpoint) {
            return throwError(() => new Error('Could not read PAR endpoint from authWellKnownEndpoints'));
        }
        const data = this.urlService.createBodyForParCodeFlowRequest(configId, customParams);
        return this.dataService.post(parEndpoint, data, configId, headers).pipe(retry(2), map((response) => {
            this.loggerService.logDebug(configId, 'par response: ', response);
            return {
                expiresIn: response.expires_in,
                requestUri: response.request_uri,
            };
        }), catchError((error) => {
            const errorMessage = `There was an error on ParService postParRequest`;
            this.loggerService.logError(configId, errorMessage, error);
            return throwError(() => new Error(errorMessage));
        }));
    }
}
ParService.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: ParService, deps: [{ token: i1.LoggerService }, { token: i2.UrlService }, { token: i3.DataService }, { token: i4.StoragePersistenceService }], target: i0.ɵɵFactoryTarget.Injectable });
ParService.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: ParService });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: ParService, decorators: [{
            type: Injectable
        }], ctorParameters: function () { return [{ type: i1.LoggerService }, { type: i2.UrlService }, { type: i3.DataService }, { type: i4.StoragePersistenceService }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFyLnNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy9hbmd1bGFyLWF1dGgtb2lkYy1jbGllbnQvc3JjL2xpYi9sb2dpbi9wYXIvcGFyLnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBQ25ELE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDM0MsT0FBTyxFQUFjLFVBQVUsRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUM5QyxPQUFPLEVBQUUsVUFBVSxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQzs7Ozs7O0FBUXhELE1BQU0sT0FBTyxVQUFVO0lBQ3JCLFlBQ1UsYUFBNEIsRUFDNUIsVUFBc0IsRUFDdEIsV0FBd0IsRUFDeEIseUJBQW9EO1FBSHBELGtCQUFhLEdBQWIsYUFBYSxDQUFlO1FBQzVCLGVBQVUsR0FBVixVQUFVLENBQVk7UUFDdEIsZ0JBQVcsR0FBWCxXQUFXLENBQWE7UUFDeEIsOEJBQXlCLEdBQXpCLHlCQUF5QixDQUEyQjtJQUMzRCxDQUFDO0lBRUosY0FBYyxDQUFDLFFBQWdCLEVBQUUsWUFBMkQ7UUFDMUYsSUFBSSxPQUFPLEdBQWdCLElBQUksV0FBVyxFQUFFLENBQUM7UUFDN0MsT0FBTyxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsY0FBYyxFQUFFLG1DQUFtQyxDQUFDLENBQUM7UUFFM0UsTUFBTSxzQkFBc0IsR0FBRyxJQUFJLENBQUMseUJBQXlCLENBQUMsSUFBSSxDQUFDLHdCQUF3QixFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBRXZHLElBQUksQ0FBQyxzQkFBc0IsRUFBRTtZQUMzQixPQUFPLFVBQVUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLEtBQUssQ0FBQywwRUFBMEUsQ0FBQyxDQUFDLENBQUM7U0FDaEg7UUFFRCxNQUFNLFdBQVcsR0FBRyxzQkFBc0IsQ0FBQyxXQUFXLENBQUM7UUFDdkQsSUFBSSxDQUFDLFdBQVcsRUFBRTtZQUNoQixPQUFPLFVBQVUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLEtBQUssQ0FBQyx5REFBeUQsQ0FBQyxDQUFDLENBQUM7U0FDL0Y7UUFFRCxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLCtCQUErQixDQUFDLFFBQVEsRUFBRSxZQUFZLENBQUMsQ0FBQztRQUVyRixPQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FDckUsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUNSLEdBQUcsQ0FBQyxDQUFDLFFBQWEsRUFBRSxFQUFFO1lBQ3BCLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRSxnQkFBZ0IsRUFBRSxRQUFRLENBQUMsQ0FBQztZQUVsRSxPQUFPO2dCQUNMLFNBQVMsRUFBRSxRQUFRLENBQUMsVUFBVTtnQkFDOUIsVUFBVSxFQUFFLFFBQVEsQ0FBQyxXQUFXO2FBQ2pDLENBQUM7UUFDSixDQUFDLENBQUMsRUFDRixVQUFVLENBQUMsQ0FBQyxLQUFLLEVBQUUsRUFBRTtZQUNuQixNQUFNLFlBQVksR0FBRyxpREFBaUQsQ0FBQztZQUN2RSxJQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxRQUFRLEVBQUUsWUFBWSxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBRTNELE9BQU8sVUFBVSxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksS0FBSyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7UUFDbkQsQ0FBQyxDQUFDLENBQ0gsQ0FBQztJQUNKLENBQUM7O3VHQTFDVSxVQUFVOzJHQUFWLFVBQVU7MkZBQVYsVUFBVTtrQkFEdEIsVUFBVSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEh0dHBIZWFkZXJzIH0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uL2h0dHAnO1xuaW1wb3J0IHsgSW5qZWN0YWJsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgT2JzZXJ2YWJsZSwgdGhyb3dFcnJvciB9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHsgY2F0Y2hFcnJvciwgbWFwLCByZXRyeSB9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcbmltcG9ydCB7IERhdGFTZXJ2aWNlIH0gZnJvbSAnLi4vLi4vYXBpL2RhdGEuc2VydmljZSc7XG5pbXBvcnQgeyBMb2dnZXJTZXJ2aWNlIH0gZnJvbSAnLi4vLi4vbG9nZ2luZy9sb2dnZXIuc2VydmljZSc7XG5pbXBvcnQgeyBTdG9yYWdlUGVyc2lzdGVuY2VTZXJ2aWNlIH0gZnJvbSAnLi4vLi4vc3RvcmFnZS9zdG9yYWdlLXBlcnNpc3RlbmNlLnNlcnZpY2UnO1xuaW1wb3J0IHsgVXJsU2VydmljZSB9IGZyb20gJy4uLy4uL3V0aWxzL3VybC91cmwuc2VydmljZSc7XG5pbXBvcnQgeyBQYXJSZXNwb25zZSB9IGZyb20gJy4vcGFyLXJlc3BvbnNlJztcblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIFBhclNlcnZpY2Uge1xuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIGxvZ2dlclNlcnZpY2U6IExvZ2dlclNlcnZpY2UsXG4gICAgcHJpdmF0ZSB1cmxTZXJ2aWNlOiBVcmxTZXJ2aWNlLFxuICAgIHByaXZhdGUgZGF0YVNlcnZpY2U6IERhdGFTZXJ2aWNlLFxuICAgIHByaXZhdGUgc3RvcmFnZVBlcnNpc3RlbmNlU2VydmljZTogU3RvcmFnZVBlcnNpc3RlbmNlU2VydmljZVxuICApIHt9XG5cbiAgcG9zdFBhclJlcXVlc3QoY29uZmlnSWQ6IHN0cmluZywgY3VzdG9tUGFyYW1zPzogeyBba2V5OiBzdHJpbmddOiBzdHJpbmcgfCBudW1iZXIgfCBib29sZWFuIH0pOiBPYnNlcnZhYmxlPFBhclJlc3BvbnNlPiB7XG4gICAgbGV0IGhlYWRlcnM6IEh0dHBIZWFkZXJzID0gbmV3IEh0dHBIZWFkZXJzKCk7XG4gICAgaGVhZGVycyA9IGhlYWRlcnMuc2V0KCdDb250ZW50LVR5cGUnLCAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJyk7XG5cbiAgICBjb25zdCBhdXRoV2VsbGtub3duRW5kcG9pbnRzID0gdGhpcy5zdG9yYWdlUGVyc2lzdGVuY2VTZXJ2aWNlLnJlYWQoJ2F1dGhXZWxsS25vd25FbmRQb2ludHMnLCBjb25maWdJZCk7XG5cbiAgICBpZiAoIWF1dGhXZWxsa25vd25FbmRwb2ludHMpIHtcbiAgICAgIHJldHVybiB0aHJvd0Vycm9yKCgpID0+IG5ldyBFcnJvcignQ291bGQgbm90IHJlYWQgUEFSIGVuZHBvaW50IGJlY2F1c2UgYXV0aFdlbGxLbm93bkVuZFBvaW50cyBhcmUgbm90IGdpdmVuJykpO1xuICAgIH1cblxuICAgIGNvbnN0IHBhckVuZHBvaW50ID0gYXV0aFdlbGxrbm93bkVuZHBvaW50cy5wYXJFbmRwb2ludDtcbiAgICBpZiAoIXBhckVuZHBvaW50KSB7XG4gICAgICByZXR1cm4gdGhyb3dFcnJvcigoKSA9PiBuZXcgRXJyb3IoJ0NvdWxkIG5vdCByZWFkIFBBUiBlbmRwb2ludCBmcm9tIGF1dGhXZWxsS25vd25FbmRwb2ludHMnKSk7XG4gICAgfVxuXG4gICAgY29uc3QgZGF0YSA9IHRoaXMudXJsU2VydmljZS5jcmVhdGVCb2R5Rm9yUGFyQ29kZUZsb3dSZXF1ZXN0KGNvbmZpZ0lkLCBjdXN0b21QYXJhbXMpO1xuXG4gICAgcmV0dXJuIHRoaXMuZGF0YVNlcnZpY2UucG9zdChwYXJFbmRwb2ludCwgZGF0YSwgY29uZmlnSWQsIGhlYWRlcnMpLnBpcGUoXG4gICAgICByZXRyeSgyKSxcbiAgICAgIG1hcCgocmVzcG9uc2U6IGFueSkgPT4ge1xuICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoY29uZmlnSWQsICdwYXIgcmVzcG9uc2U6ICcsIHJlc3BvbnNlKTtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGV4cGlyZXNJbjogcmVzcG9uc2UuZXhwaXJlc19pbixcbiAgICAgICAgICByZXF1ZXN0VXJpOiByZXNwb25zZS5yZXF1ZXN0X3VyaSxcbiAgICAgICAgfTtcbiAgICAgIH0pLFxuICAgICAgY2F0Y2hFcnJvcigoZXJyb3IpID0+IHtcbiAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFRoZXJlIHdhcyBhbiBlcnJvciBvbiBQYXJTZXJ2aWNlIHBvc3RQYXJSZXF1ZXN0YDtcbiAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0Vycm9yKGNvbmZpZ0lkLCBlcnJvck1lc3NhZ2UsIGVycm9yKTtcblxuICAgICAgICByZXR1cm4gdGhyb3dFcnJvcigoKSA9PiBuZXcgRXJyb3IoZXJyb3JNZXNzYWdlKSk7XG4gICAgICB9KVxuICAgICk7XG4gIH1cbn1cbiJdfQ==