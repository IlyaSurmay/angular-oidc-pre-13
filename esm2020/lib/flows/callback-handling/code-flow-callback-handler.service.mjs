import { HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { of, throwError, timer } from 'rxjs';
import { catchError, mergeMap, retryWhen, switchMap } from 'rxjs/operators';
import * as i0 from "@angular/core";
import * as i1 from "../../utils/url/url.service";
import * as i2 from "../../logging/logger.service";
import * as i3 from "../../validation/token-validation.service";
import * as i4 from "../flows-data.service";
import * as i5 from "../../config/provider/config.provider";
import * as i6 from "../../storage/storage-persistence.service";
import * as i7 from "../../api/data.service";
export class CodeFlowCallbackHandlerService {
    constructor(urlService, loggerService, tokenValidationService, flowsDataService, configurationProvider, storagePersistenceService, dataService) {
        this.urlService = urlService;
        this.loggerService = loggerService;
        this.tokenValidationService = tokenValidationService;
        this.flowsDataService = flowsDataService;
        this.configurationProvider = configurationProvider;
        this.storagePersistenceService = storagePersistenceService;
        this.dataService = dataService;
    }
    // STEP 1 Code Flow
    codeFlowCallback(urlToCheck, configId) {
        const code = this.urlService.getUrlParameter(urlToCheck, 'code');
        const state = this.urlService.getUrlParameter(urlToCheck, 'state');
        const sessionState = this.urlService.getUrlParameter(urlToCheck, 'session_state');
        if (!state) {
            this.loggerService.logDebug(configId, 'no state in url');
            return throwError(() => new Error('no state in url'));
        }
        if (!code) {
            this.loggerService.logDebug(configId, 'no code in url');
            return throwError(() => new Error('no code in url'));
        }
        this.loggerService.logDebug(configId, 'running validation for callback', urlToCheck);
        const initialCallbackContext = {
            code,
            refreshToken: null,
            state,
            sessionState,
            authResult: null,
            isRenewProcess: false,
            jwtKeys: null,
            validationResult: null,
            existingIdToken: null,
        };
        return of(initialCallbackContext);
    }
    // STEP 2 Code Flow //  Code Flow Silent Renew starts here
    codeFlowCodeRequest(callbackContext, configId) {
        const authStateControl = this.flowsDataService.getAuthStateControl(configId);
        const isStateCorrect = this.tokenValidationService.validateStateFromHashCallback(callbackContext.state, authStateControl, configId);
        if (!isStateCorrect) {
            return throwError(() => new Error('codeFlowCodeRequest incorrect state'));
        }
        const authWellknownEndpoints = this.storagePersistenceService.read('authWellKnownEndPoints', configId);
        const tokenEndpoint = authWellknownEndpoints?.tokenEndpoint;
        if (!tokenEndpoint) {
            return throwError(() => new Error('Token Endpoint not defined'));
        }
        let headers = new HttpHeaders();
        headers = headers.set('Content-Type', 'application/x-www-form-urlencoded');
        const config = this.configurationProvider.getOpenIDConfiguration(configId);
        const bodyForCodeFlow = this.urlService.createBodyForCodeFlowCodeRequest(callbackContext.code, configId, config?.customParamsCodeRequest);
        return this.dataService.post(tokenEndpoint, bodyForCodeFlow, configId, headers).pipe(switchMap((response) => {
            let authResult = new Object();
            authResult = response;
            authResult.state = callbackContext.state;
            authResult.session_state = callbackContext.sessionState;
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
CodeFlowCallbackHandlerService.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: CodeFlowCallbackHandlerService, deps: [{ token: i1.UrlService }, { token: i2.LoggerService }, { token: i3.TokenValidationService }, { token: i4.FlowsDataService }, { token: i5.ConfigurationProvider }, { token: i6.StoragePersistenceService }, { token: i7.DataService }], target: i0.ɵɵFactoryTarget.Injectable });
CodeFlowCallbackHandlerService.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: CodeFlowCallbackHandlerService });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: CodeFlowCallbackHandlerService, decorators: [{
            type: Injectable
        }], ctorParameters: function () { return [{ type: i1.UrlService }, { type: i2.LoggerService }, { type: i3.TokenValidationService }, { type: i4.FlowsDataService }, { type: i5.ConfigurationProvider }, { type: i6.StoragePersistenceService }, { type: i7.DataService }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29kZS1mbG93LWNhbGxiYWNrLWhhbmRsZXIuc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL2FuZ3VsYXItYXV0aC1vaWRjLWNsaWVudC9zcmMvbGliL2Zsb3dzL2NhbGxiYWNrLWhhbmRsaW5nL2NvZGUtZmxvdy1jYWxsYmFjay1oYW5kbGVyLnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLGlCQUFpQixFQUFFLFdBQVcsRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBQ3RFLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDM0MsT0FBTyxFQUFjLEVBQUUsRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBQ3pELE9BQU8sRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQzs7Ozs7Ozs7O0FBVzVFLE1BQU0sT0FBTyw4QkFBOEI7SUFDekMsWUFDbUIsVUFBc0IsRUFDdEIsYUFBNEIsRUFDNUIsc0JBQThDLEVBQzlDLGdCQUFrQyxFQUNsQyxxQkFBNEMsRUFDNUMseUJBQW9ELEVBQ3BELFdBQXdCO1FBTnhCLGVBQVUsR0FBVixVQUFVLENBQVk7UUFDdEIsa0JBQWEsR0FBYixhQUFhLENBQWU7UUFDNUIsMkJBQXNCLEdBQXRCLHNCQUFzQixDQUF3QjtRQUM5QyxxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQWtCO1FBQ2xDLDBCQUFxQixHQUFyQixxQkFBcUIsQ0FBdUI7UUFDNUMsOEJBQXlCLEdBQXpCLHlCQUF5QixDQUEyQjtRQUNwRCxnQkFBVyxHQUFYLFdBQVcsQ0FBYTtJQUN4QyxDQUFDO0lBRUosbUJBQW1CO0lBQ25CLGdCQUFnQixDQUFDLFVBQWtCLEVBQUUsUUFBZ0I7UUFDbkQsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxlQUFl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RUFBRSxTQUFTLEVBQUUsMEJBQTBCLEVBQUUsR0FBRyxJQUFJLENBQUMscUJBQXFCLENBQUMsc0JBQXNCLENBQUMsUUFBUSxDQUFDLENBQUM7Z0JBQzlHLE1BQU0sWUFBWSxHQUFHLDRCQUE0QixTQUFTLDJCQUEyQixDQUFDO2dCQUN0RixJQUFJLENBQUMsYUFBYSxDQUFDLFVBQVUsQ0FBQyxRQUFRLEVBQUUsWUFBWSxFQUFFLEtBQUssQ0FBQyxDQUFDO2dCQUU3RCxPQUFPLEtBQUssQ0FBQywwQkFBMEIsR0FBRyxJQUFJLENBQUMsQ0FBQzthQUNqRDtZQUVELE9BQU8sVUFBVSxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFDNUMsQ0FBQyxDQUFDLENBQ0gsQ0FBQztJQUNKLENBQUM7OzJIQTlHVSw4QkFBOEI7K0hBQTlCLDhCQUE4QjsyRkFBOUIsOEJBQThCO2tCQUQxQyxVQUFVIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSHR0cEVycm9yUmVzcG9uc2UsIEh0dHBIZWFkZXJzIH0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uL2h0dHAnO1xuaW1wb3J0IHsgSW5qZWN0YWJsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgT2JzZXJ2YWJsZSwgb2YsIHRocm93RXJyb3IsIHRpbWVyIH0gZnJvbSAncnhqcyc7XG5pbXBvcnQgeyBjYXRjaEVycm9yLCBtZXJnZU1hcCwgcmV0cnlXaGVuLCBzd2l0Y2hNYXAgfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5pbXBvcnQgeyBEYXRhU2VydmljZSB9IGZyb20gJy4uLy4uL2FwaS9kYXRhLnNlcnZpY2UnO1xuaW1wb3J0IHsgQ29uZmlndXJhdGlvblByb3ZpZGVyIH0gZnJvbSAnLi4vLi4vY29uZmlnL3Byb3ZpZGVyL2NvbmZpZy5wcm92aWRlcic7XG5pbXBvcnQgeyBMb2dnZXJTZXJ2aWNlIH0gZnJvbSAnLi4vLi4vbG9nZ2luZy9sb2dnZXIuc2VydmljZSc7XG5pbXBvcnQgeyBTdG9yYWdlUGVyc2lzdGVuY2VTZXJ2aWNlIH0gZnJvbSAnLi4vLi4vc3RvcmFnZS9zdG9yYWdlLXBlcnNpc3RlbmNlLnNlcnZpY2UnO1xuaW1wb3J0IHsgVXJsU2VydmljZSB9IGZyb20gJy4uLy4uL3V0aWxzL3VybC91cmwuc2VydmljZSc7XG5pbXBvcnQgeyBUb2tlblZhbGlkYXRpb25TZXJ2aWNlIH0gZnJvbSAnLi4vLi4vdmFsaWRhdGlvbi90b2tlbi12YWxpZGF0aW9uLnNlcnZpY2UnO1xuaW1wb3J0IHsgQ2FsbGJhY2tDb250ZXh0IH0gZnJvbSAnLi4vY2FsbGJhY2stY29udGV4dCc7XG5pbXBvcnQgeyBGbG93c0RhdGFTZXJ2aWNlIH0gZnJvbSAnLi4vZmxvd3MtZGF0YS5zZXJ2aWNlJztcblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIENvZGVGbG93Q2FsbGJhY2tIYW5kbGVyU2VydmljZSB7XG4gIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUgcmVhZG9ubHkgdXJsU2VydmljZTogVXJsU2VydmljZSxcbiAgICBwcml2YXRlIHJlYWRvbmx5IGxvZ2dlclNlcnZpY2U6IExvZ2dlclNlcnZpY2UsXG4gICAgcHJpdmF0ZSByZWFkb25seSB0b2tlblZhbGlkYXRpb25TZXJ2aWNlOiBUb2tlblZhbGlkYXRpb25TZXJ2aWNlLFxuICAgIHByaXZhdGUgcmVhZG9ubHkgZmxvd3NEYXRhU2VydmljZTogRmxvd3NEYXRhU2VydmljZSxcbiAgICBwcml2YXRlIHJlYWRvbmx5IGNvbmZpZ3VyYXRpb25Qcm92aWRlcjogQ29uZmlndXJhdGlvblByb3ZpZGVyLFxuICAgIHByaXZhdGUgcmVhZG9ubHkgc3RvcmFnZVBlcnNpc3RlbmNlU2VydmljZTogU3RvcmFnZVBlcnNpc3RlbmNlU2VydmljZSxcbiAgICBwcml2YXRlIHJlYWRvbmx5IGRhdGFTZXJ2aWNlOiBEYXRhU2VydmljZVxuICApIHt9XG5cbiAgLy8gU1RFUCAxIENvZGUgRmxvd1xuICBjb2RlRmxvd0NhbGxiYWNrKHVybFRvQ2hlY2s6IHN0cmluZywgY29uZmlnSWQ6IHN0cmluZyk6IE9ic2VydmFibGU8Q2FsbGJhY2tDb250ZXh0PiB7XG4gICAgY29uc3QgY29kZSA9IHRoaXMudXJsU2VydmljZS5nZXRVcmxQYXJhbWV0ZXIodXJsVG9DaGVjaywgJ2NvZGUnKTtcbiAgICBjb25zdCBzdGF0ZSA9IHRoaXMudXJsU2VydmljZS5nZXRVcmxQYXJhbWV0ZXIodXJsVG9DaGVjaywgJ3N0YXRlJyk7XG4gICAgY29uc3Qgc2Vzc2lvblN0YXRlID0gdGhpcy51cmxTZXJ2aWNlLmdldFVybFBhcmFtZXRlcih1cmxUb0NoZWNrLCAnc2Vzc2lvbl9zdGF0ZScpO1xuXG4gICAgaWYgKCFzdGF0ZSkge1xuICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKGNvbmZpZ0lkLCAnbm8gc3RhdGUgaW4gdXJsJyk7XG5cbiAgICAgIHJldHVybiB0aHJvd0Vycm9yKCgpID0+IG5ldyBFcnJvcignbm8gc3RhdGUgaW4gdXJsJykpO1xuICAgIH1cblxuICAgIGlmICghY29kZSkge1xuICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKGNvbmZpZ0lkLCAnbm8gY29kZSBpbiB1cmwnKTtcblxuICAgICAgcmV0dXJuIHRocm93RXJyb3IoKCkgPT4gbmV3IEVycm9yKCdubyBjb2RlIGluIHVybCcpKTtcbiAgICB9XG5cbiAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoY29uZmlnSWQsICdydW5uaW5nIHZhbGlkYXRpb24gZm9yIGNhbGxiYWNrJywgdXJsVG9DaGVjayk7XG5cbiAgICBjb25zdCBpbml0aWFsQ2FsbGJhY2tDb250ZXh0ID0ge1xuICAgICAgY29kZSxcbiAgICAgIHJlZnJlc2hUb2tlbjogbnVsbCxcbiAgICAgIHN0YXRlLFxuICAgICAgc2Vzc2lvblN0YXRlLFxuICAgICAgYXV0aFJlc3VsdDogbnVsbCxcbiAgICAgIGlzUmVuZXdQcm9jZXNzOiBmYWxzZSxcbiAgICAgIGp3dEtleXM6IG51bGwsXG4gICAgICB2YWxpZGF0aW9uUmVzdWx0OiBudWxsLFxuICAgICAgZXhpc3RpbmdJZFRva2VuOiBudWxsLFxuICAgIH07XG5cbiAgICByZXR1cm4gb2YoaW5pdGlhbENhbGxiYWNrQ29udGV4dCk7XG4gIH1cblxuICAvLyBTVEVQIDIgQ29kZSBGbG93IC8vICBDb2RlIEZsb3cgU2lsZW50IFJlbmV3IHN0YXJ0cyBoZXJlXG4gIGNvZGVGbG93Q29kZVJlcXVlc3QoY2FsbGJhY2tDb250ZXh0OiBDYWxsYmFja0NvbnRleHQsIGNvbmZpZ0lkOiBzdHJpbmcpOiBPYnNlcnZhYmxlPENhbGxiYWNrQ29udGV4dD4ge1xuICAgIGNvbnN0IGF1dGhTdGF0ZUNvbnRyb2wgPSB0aGlzLmZsb3dzRGF0YVNlcnZpY2UuZ2V0QXV0aFN0YXRlQ29udHJvbChjb25maWdJZCk7XG5cbiAgICBjb25zdCBpc1N0YXRlQ29ycmVjdCA9IHRoaXMudG9rZW5WYWxpZGF0aW9uU2VydmljZS52YWxpZGF0ZVN0YXRlRnJvbUhhc2hDYWxsYmFjayhjYWxsYmFja0NvbnRleHQuc3RhdGUsIGF1dGhTdGF0ZUNvbnRyb2wsIGNvbmZpZ0lkKTtcblxuICAgIGlmICghaXNTdGF0ZUNvcnJlY3QpIHtcbiAgICAgIHJldHVybiB0aHJvd0Vycm9yKCgpID0+IG5ldyBFcnJvcignY29kZUZsb3dDb2RlUmVxdWVzdCBpbmNvcnJlY3Qgc3RhdGUnKSk7XG4gICAgfVxuXG4gICAgY29uc3QgYXV0aFdlbGxrbm93bkVuZHBvaW50cyA9IHRoaXMuc3RvcmFnZVBlcnNpc3RlbmNlU2VydmljZS5yZWFkKCdhdXRoV2VsbEtub3duRW5kUG9pbnRzJywgY29uZmlnSWQpO1xuICAgIGNvbnN0IHRva2VuRW5kcG9pbnQgPSBhdXRoV2VsbGtub3duRW5kcG9pbnRzPy50b2tlbkVuZHBvaW50O1xuICAgIGlmICghdG9rZW5FbmRwb2ludCkge1xuICAgICAgcmV0dXJuIHRocm93RXJyb3IoKCkgPT4gbmV3IEVycm9yKCdUb2tlbiBFbmRwb2ludCBub3QgZGVmaW5lZCcpKTtcbiAgICB9XG5cbiAgICBsZXQgaGVhZGVyczogSHR0cEhlYWRlcnMgPSBuZXcgSHR0cEhlYWRlcnMoKTtcbiAgICBoZWFkZXJzID0gaGVhZGVycy5zZXQoJ0NvbnRlbnQtVHlwZScsICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnKTtcblxuICAgIGNvbnN0IGNvbmZpZyA9IHRoaXMuY29uZmlndXJhdGlvblByb3ZpZGVyLmdldE9wZW5JRENvbmZpZ3VyYXRpb24oY29uZmlnSWQpO1xuXG4gICAgY29uc3QgYm9keUZvckNvZGVGbG93ID0gdGhpcy51cmxTZXJ2aWNlLmNyZWF0ZUJvZHlGb3JDb2RlRmxvd0NvZGVSZXF1ZXN0KFxuICAgICAgY2FsbGJhY2tDb250ZXh0LmNvZGUsXG4gICAgICBjb25maWdJZCxcbiAgICAgIGNvbmZpZz8uY3VzdG9tUGFyYW1zQ29kZVJlcXVlc3RcbiAgICApO1xuXG4gICAgcmV0dXJuIHRoaXMuZGF0YVNlcnZpY2UucG9zdCh0b2tlbkVuZHBvaW50LCBib2R5Rm9yQ29kZUZsb3csIGNvbmZpZ0lkLCBoZWFkZXJzKS5waXBlKFxuICAgICAgc3dpdGNoTWFwKChyZXNwb25zZSkgPT4ge1xuICAgICAgICBsZXQgYXV0aFJlc3VsdDogYW55ID0gbmV3IE9iamVjdCgpO1xuICAgICAgICBhdXRoUmVzdWx0ID0gcmVzcG9uc2U7XG4gICAgICAgIGF1dGhSZXN1bHQuc3RhdGUgPSBjYWxsYmFja0NvbnRleHQuc3RhdGU7XG4gICAgICAgIGF1dGhSZXN1bHQuc2Vzc2lvbl9zdGF0ZSA9IGNhbGxiYWNrQ29udGV4dC5zZXNzaW9uU3RhdGU7XG5cbiAgICAgICAgY2FsbGJhY2tDb250ZXh0LmF1dGhSZXN1bHQgPSBhdXRoUmVzdWx0O1xuXG4gICAgICAgIHJldHVybiBvZihjYWxsYmFja0NvbnRleHQpO1xuICAgICAgfSksXG4gICAgICByZXRyeVdoZW4oKGVycm9yKSA9PiB0aGlzLmhhbmRsZVJlZnJlc2hSZXRyeShlcnJvciwgY29uZmlnSWQpKSxcbiAgICAgIGNhdGNoRXJyb3IoKGVycm9yKSA9PiB7XG4gICAgICAgIGNvbnN0IHsgYXV0aG9yaXR5IH0gPSB0aGlzLmNvbmZpZ3VyYXRpb25Qcm92aWRlci5nZXRPcGVuSURDb25maWd1cmF0aW9uKGNvbmZpZ0lkKTtcbiAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYE9pZGNTZXJ2aWNlIGNvZGUgcmVxdWVzdCAke2F1dGhvcml0eX1gO1xuICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRXJyb3IoY29uZmlnSWQsIGVycm9yTWVzc2FnZSwgZXJyb3IpO1xuXG4gICAgICAgIHJldHVybiB0aHJvd0Vycm9yKCgpID0+IG5ldyBFcnJvcihlcnJvck1lc3NhZ2UpKTtcbiAgICAgIH0pXG4gICAgKTtcbiAgfVxuXG4gIHByaXZhdGUgaGFuZGxlUmVmcmVzaFJldHJ5KGVycm9yczogT2JzZXJ2YWJsZTxhbnk+LCBjb25maWdJZDogc3RyaW5nKTogT2JzZXJ2YWJsZTxhbnk+IHtcbiAgICByZXR1cm4gZXJyb3JzLnBpcGUoXG4gICAgICBtZXJnZU1hcCgoZXJyb3IpID0+IHtcbiAgICAgICAgLy8gcmV0cnkgdG9rZW4gcmVmcmVzaCBpZiB0aGVyZSBpcyBubyBpbnRlcm5ldCBjb25uZWN0aW9uXG4gICAgICAgIGlmIChlcnJvciAmJiBlcnJvciBpbnN0YW5jZW9mIEh0dHBFcnJvclJlc3BvbnNlICYmIGVycm9yLmVycm9yIGluc3RhbmNlb2YgUHJvZ3Jlc3NFdmVudCAmJiBlcnJvci5lcnJvci50eXBlID09PSAnZXJyb3InKSB7XG4gICAgICAgICAgY29uc3QgeyBhdXRob3JpdHksIHJlZnJlc2hUb2tlblJldHJ5SW5TZWNvbmRzIH0gPSB0aGlzLmNvbmZpZ3VyYXRpb25Qcm92aWRlci5nZXRPcGVuSURDb25maWd1cmF0aW9uKGNvbmZpZ0lkKTtcbiAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgT2lkY1NlcnZpY2UgY29kZSByZXF1ZXN0ICR7YXV0aG9yaXR5fSAtIG5vIGludGVybmV0IGNvbm5lY3Rpb25gO1xuICAgICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dXYXJuaW5nKGNvbmZpZ0lkLCBlcnJvck1lc3NhZ2UsIGVycm9yKTtcblxuICAgICAgICAgIHJldHVybiB0aW1lcihyZWZyZXNoVG9rZW5SZXRyeUluU2Vjb25kcyAqIDEwMDApO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRocm93RXJyb3IoKCkgPT4gbmV3IEVycm9yKGVycm9yKSk7XG4gICAgICB9KVxuICAgICk7XG4gIH1cbn1cbiJdfQ==