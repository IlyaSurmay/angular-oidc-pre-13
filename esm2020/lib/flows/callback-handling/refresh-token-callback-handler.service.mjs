import { HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { of, throwError, timer } from 'rxjs';
import { catchError, mergeMap, retryWhen, switchMap } from 'rxjs/operators';
import * as i0 from "@angular/core";
import * as i1 from "../../utils/url/url.service";
import * as i2 from "../../logging/logger.service";
import * as i3 from "../../config/provider/config.provider";
import * as i4 from "../../api/data.service";
import * as i5 from "../../storage/storage-persistence.service";
export class RefreshTokenCallbackHandlerService {
    constructor(urlService, loggerService, configurationProvider, dataService, storagePersistenceService) {
        this.urlService = urlService;
        this.loggerService = loggerService;
        this.configurationProvider = configurationProvider;
        this.dataService = dataService;
        this.storagePersistenceService = storagePersistenceService;
    }
    // STEP 2 Refresh Token
    refreshTokensRequestTokens(callbackContext, configId, customParamsRefresh) {
        let headers = new HttpHeaders();
        headers = headers.set('Content-Type', 'application/x-www-form-urlencoded');
        const authWellknownEndpoints = this.storagePersistenceService.read('authWellKnownEndPoints', configId);
        const tokenEndpoint = authWellknownEndpoints?.tokenEndpoint;
        if (!tokenEndpoint) {
            return throwError(() => new Error('Token Endpoint not defined'));
        }
        const data = this.urlService.createBodyForCodeFlowRefreshTokensRequest(callbackContext.refreshToken, configId, customParamsRefresh);
        return this.dataService.post(tokenEndpoint, data, configId, headers).pipe(switchMap((response) => {
            this.loggerService.logDebug(configId, 'token refresh response: ', response);
            let authResult = new Object();
            authResult = response;
            authResult.state = callbackContext.state;
            callbackContext.authResult = authResult;
            return of(callbackContext);
        }), retryWhen((error) => this.handleRefreshRetry(error, configId)), catchError((error) => {
            const { authority } = this.configurationProvider.getOpenIDConfiguration(configId);
            const errorMessage = `OidcService code request ${authority}`;
            this.loggerService.logError(configId, errorMessage, error);
            return throwError(() => new Error(errorMessage));
        }));
    }
    handleRefreshRetry(errors, configId) {
        return errors.pipe(mergeMap((error) => {
            // retry token refresh if there is no internet connection
            if (error && error instanceof HttpErrorResponse && error.error instanceof ProgressEvent && error.error.type === 'error') {
                const { authority, refreshTokenRetryInSeconds } = this.configurationProvider.getOpenIDConfiguration(configId);
                const errorMessage = `OidcService code request ${authority} - no internet connection`;
                this.loggerService.logWarning(configId, errorMessage, error);
                return timer(refreshTokenRetryInSeconds * 1000);
            }
            return throwError(() => new Error(error));
        }));
    }
}
RefreshTokenCallbackHandlerService.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: RefreshTokenCallbackHandlerService, deps: [{ token: i1.UrlService }, { token: i2.LoggerService }, { token: i3.ConfigurationProvider }, { token: i4.DataService }, { token: i5.StoragePersistenceService }], target: i0.ɵɵFactoryTarget.Injectable });
RefreshTokenCallbackHandlerService.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: RefreshTokenCallbackHandlerService });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: RefreshTokenCallbackHandlerService, decorators: [{
            type: Injectable
        }], ctorParameters: function () { return [{ type: i1.UrlService }, { type: i2.LoggerService }, { type: i3.ConfigurationProvider }, { type: i4.DataService }, { type: i5.StoragePersistenceService }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVmcmVzaC10b2tlbi1jYWxsYmFjay1oYW5kbGVyLnNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy9hbmd1bGFyLWF1dGgtb2lkYy1jbGllbnQvc3JjL2xpYi9mbG93cy9jYWxsYmFjay1oYW5kbGluZy9yZWZyZXNoLXRva2VuLWNhbGxiYWNrLWhhbmRsZXIuc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsV0FBVyxFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUFDdEUsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUMzQyxPQUFPLEVBQWMsRUFBRSxFQUFFLFVBQVUsRUFBRSxLQUFLLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFDekQsT0FBTyxFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxNQUFNLGdCQUFnQixDQUFDOzs7Ozs7O0FBUzVFLE1BQU0sT0FBTyxrQ0FBa0M7SUFDN0MsWUFDbUIsVUFBc0IsRUFDdEIsYUFBNEIsRUFDNUIscUJBQTRDLEVBQzVDLFdBQXdCLEVBQ3hCLHlCQUFvRDtRQUpwRCxlQUFVLEdBQVYsVUFBVSxDQUFZO1FBQ3RCLGtCQUFhLEdBQWIsYUFBYSxDQUFlO1FBQzVCLDBCQUFxQixHQUFyQixxQkFBcUIsQ0FBdUI7UUFDNUMsZ0JBQVcsR0FBWCxXQUFXLENBQWE7UUFDeEIsOEJBQXlCLEdBQXpCLHlCQUF5QixDQUEyQjtJQUNwRSxDQUFDO0lBRUosdUJBQXVCO0lBQ3ZCLDBCQUEwQixDQUN4QixlQUFnQyxFQUNoQyxRQUFnQixFQUNoQixtQkFBa0U7UUFFbEUsSUFBSSxPQUFPLEdBQWdCLElBQUksV0FBVyxFQUFFLENBQUM7UUFDN0MsT0FBTyxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsY0FBYyxFQUFFLG1DQUFtQyxDQUFDLENBQUM7UUFFM0UsTUFB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Y2VzQ29udGVudCI6WyJpbXBvcnQgeyBIdHRwRXJyb3JSZXNwb25zZSwgSHR0cEhlYWRlcnMgfSBmcm9tICdAYW5ndWxhci9jb21tb24vaHR0cCc7XG5pbXBvcnQgeyBJbmplY3RhYmxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBPYnNlcnZhYmxlLCBvZiwgdGhyb3dFcnJvciwgdGltZXIgfSBmcm9tICdyeGpzJztcbmltcG9ydCB7IGNhdGNoRXJyb3IsIG1lcmdlTWFwLCByZXRyeVdoZW4sIHN3aXRjaE1hcCB9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcbmltcG9ydCB7IERhdGFTZXJ2aWNlIH0gZnJvbSAnLi4vLi4vYXBpL2RhdGEuc2VydmljZSc7XG5pbXBvcnQgeyBDb25maWd1cmF0aW9uUHJvdmlkZXIgfSBmcm9tICcuLi8uLi9jb25maWcvcHJvdmlkZXIvY29uZmlnLnByb3ZpZGVyJztcbmltcG9ydCB7IExvZ2dlclNlcnZpY2UgfSBmcm9tICcuLi8uLi9sb2dnaW5nL2xvZ2dlci5zZXJ2aWNlJztcbmltcG9ydCB7IFN0b3JhZ2VQZXJzaXN0ZW5jZVNlcnZpY2UgfSBmcm9tICcuLi8uLi9zdG9yYWdlL3N0b3JhZ2UtcGVyc2lzdGVuY2Uuc2VydmljZSc7XG5pbXBvcnQgeyBVcmxTZXJ2aWNlIH0gZnJvbSAnLi4vLi4vdXRpbHMvdXJsL3VybC5zZXJ2aWNlJztcbmltcG9ydCB7IENhbGxiYWNrQ29udGV4dCB9IGZyb20gJy4uL2NhbGxiYWNrLWNvbnRleHQnO1xuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgUmVmcmVzaFRva2VuQ2FsbGJhY2tIYW5kbGVyU2VydmljZSB7XG4gIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUgcmVhZG9ubHkgdXJsU2VydmljZTogVXJsU2VydmljZSxcbiAgICBwcml2YXRlIHJlYWRvbmx5IGxvZ2dlclNlcnZpY2U6IExvZ2dlclNlcnZpY2UsXG4gICAgcHJpdmF0ZSByZWFkb25seSBjb25maWd1cmF0aW9uUHJvdmlkZXI6IENvbmZpZ3VyYXRpb25Qcm92aWRlcixcbiAgICBwcml2YXRlIHJlYWRvbmx5IGRhdGFTZXJ2aWNlOiBEYXRhU2VydmljZSxcbiAgICBwcml2YXRlIHJlYWRvbmx5IHN0b3JhZ2VQZXJzaXN0ZW5jZVNlcnZpY2U6IFN0b3JhZ2VQZXJzaXN0ZW5jZVNlcnZpY2VcbiAgKSB7fVxuXG4gIC8vIFNURVAgMiBSZWZyZXNoIFRva2VuXG4gIHJlZnJlc2hUb2tlbnNSZXF1ZXN0VG9rZW5zKFxuICAgIGNhbGxiYWNrQ29udGV4dDogQ2FsbGJhY2tDb250ZXh0LFxuICAgIGNvbmZpZ0lkOiBzdHJpbmcsXG4gICAgY3VzdG9tUGFyYW1zUmVmcmVzaD86IHsgW2tleTogc3RyaW5nXTogc3RyaW5nIHwgbnVtYmVyIHwgYm9vbGVhbiB9XG4gICk6IE9ic2VydmFibGU8Q2FsbGJhY2tDb250ZXh0PiB7XG4gICAgbGV0IGhlYWRlcnM6IEh0dHBIZWFkZXJzID0gbmV3IEh0dHBIZWFkZXJzKCk7XG4gICAgaGVhZGVycyA9IGhlYWRlcnMuc2V0KCdDb250ZW50LVR5cGUnLCAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJyk7XG5cbiAgICBjb25zdCBhdXRoV2VsbGtub3duRW5kcG9pbnRzID0gdGhpcy5zdG9yYWdlUGVyc2lzdGVuY2VTZXJ2aWNlLnJlYWQoJ2F1dGhXZWxsS25vd25FbmRQb2ludHMnLCBjb25maWdJZCk7XG4gICAgY29uc3QgdG9rZW5FbmRwb2ludCA9IGF1dGhXZWxsa25vd25FbmRwb2ludHM/LnRva2VuRW5kcG9pbnQ7XG4gICAgaWYgKCF0b2tlbkVuZHBvaW50KSB7XG4gICAgICByZXR1cm4gdGhyb3dFcnJvcigoKSA9PiBuZXcgRXJyb3IoJ1Rva2VuIEVuZHBvaW50IG5vdCBkZWZpbmVkJykpO1xuICAgIH1cblxuICAgIGNvbnN0IGRhdGEgPSB0aGlzLnVybFNlcnZpY2UuY3JlYXRlQm9keUZvckNvZGVGbG93UmVmcmVzaFRva2Vuc1JlcXVlc3QoY2FsbGJhY2tDb250ZXh0LnJlZnJlc2hUb2tlbiwgY29uZmlnSWQsIGN1c3RvbVBhcmFtc1JlZnJlc2gpO1xuXG4gICAgcmV0dXJuIHRoaXMuZGF0YVNlcnZpY2UucG9zdCh0b2tlbkVuZHBvaW50LCBkYXRhLCBjb25maWdJZCwgaGVhZGVycykucGlwZShcbiAgICAgIHN3aXRjaE1hcCgocmVzcG9uc2U6IGFueSkgPT4ge1xuICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoY29uZmlnSWQsICd0b2tlbiByZWZyZXNoIHJlc3BvbnNlOiAnLCByZXNwb25zZSk7XG4gICAgICAgIGxldCBhdXRoUmVzdWx0OiBhbnkgPSBuZXcgT2JqZWN0KCk7XG4gICAgICAgIGF1dGhSZXN1bHQgPSByZXNwb25zZTtcbiAgICAgICAgYXV0aFJlc3VsdC5zdGF0ZSA9IGNhbGxiYWNrQ29udGV4dC5zdGF0ZTtcblxuICAgICAgICBjYWxsYmFja0NvbnRleHQuYXV0aFJlc3VsdCA9IGF1dGhSZXN1bHQ7XG5cbiAgICAgICAgcmV0dXJuIG9mKGNhbGxiYWNrQ29udGV4dCk7XG4gICAgICB9KSxcbiAgICAgIHJldHJ5V2hlbigoZXJyb3IpID0+IHRoaXMuaGFuZGxlUmVmcmVzaFJldHJ5KGVycm9yLCBjb25maWdJZCkpLFxuICAgICAgY2F0Y2hFcnJvcigoZXJyb3IpID0+IHtcbiAgICAgICAgY29uc3QgeyBhdXRob3JpdHkgfSA9IHRoaXMuY29uZmlndXJhdGlvblByb3ZpZGVyLmdldE9wZW5JRENvbmZpZ3VyYXRpb24oY29uZmlnSWQpO1xuICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgT2lkY1NlcnZpY2UgY29kZSByZXF1ZXN0ICR7YXV0aG9yaXR5fWA7XG4gICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dFcnJvcihjb25maWdJZCwgZXJyb3JNZXNzYWdlLCBlcnJvcik7XG5cbiAgICAgICAgcmV0dXJuIHRocm93RXJyb3IoKCkgPT4gbmV3IEVycm9yKGVycm9yTWVzc2FnZSkpO1xuICAgICAgfSlcbiAgICApO1xuICB9XG5cbiAgcHJpdmF0ZSBoYW5kbGVSZWZyZXNoUmV0cnkoZXJyb3JzOiBPYnNlcnZhYmxlPGFueT4sIGNvbmZpZ0lkOiBzdHJpbmcpOiBPYnNlcnZhYmxlPGFueT4ge1xuICAgIHJldHVybiBlcnJvcnMucGlwZShcbiAgICAgIG1lcmdlTWFwKChlcnJvcikgPT4ge1xuICAgICAgICAvLyByZXRyeSB0b2tlbiByZWZyZXNoIGlmIHRoZXJlIGlzIG5vIGludGVybmV0IGNvbm5lY3Rpb25cbiAgICAgICAgaWYgKGVycm9yICYmIGVycm9yIGluc3RhbmNlb2YgSHR0cEVycm9yUmVzcG9uc2UgJiYgZXJyb3IuZXJyb3IgaW5zdGFuY2VvZiBQcm9ncmVzc0V2ZW50ICYmIGVycm9yLmVycm9yLnR5cGUgPT09ICdlcnJvcicpIHtcbiAgICAgICAgICBjb25zdCB7IGF1dGhvcml0eSwgcmVmcmVzaFRva2VuUmV0cnlJblNlY29uZHMgfSA9IHRoaXMuY29uZmlndXJhdGlvblByb3ZpZGVyLmdldE9wZW5JRENvbmZpZ3VyYXRpb24oY29uZmlnSWQpO1xuICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBPaWRjU2VydmljZSBjb2RlIHJlcXVlc3QgJHthdXRob3JpdHl9IC0gbm8gaW50ZXJuZXQgY29ubmVjdGlvbmA7XG4gICAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ1dhcm5pbmcoY29uZmlnSWQsIGVycm9yTWVzc2FnZSwgZXJyb3IpO1xuXG4gICAgICAgICAgcmV0dXJuIHRpbWVyKHJlZnJlc2hUb2tlblJldHJ5SW5TZWNvbmRzICogMTAwMCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhyb3dFcnJvcigoKSA9PiBuZXcgRXJyb3IoZXJyb3IpKTtcbiAgICAgIH0pXG4gICAgKTtcbiAgfVxufVxuIl19