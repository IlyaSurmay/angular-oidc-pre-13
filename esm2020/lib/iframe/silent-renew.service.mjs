import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { of, Subject, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ValidationResult } from '../validation/validation-result';
import * as i0 from "@angular/core";
import * as i1 from "../config/provider/config.provider";
import * as i2 from "./existing-iframe.service";
import * as i3 from "../flows/flows.service";
import * as i4 from "../flows/reset-auth-data.service";
import * as i5 from "../flows/flows-data.service";
import * as i6 from "../auth-state/auth-state.service";
import * as i7 from "../logging/logger.service";
import * as i8 from "../utils/flowHelper/flow-helper.service";
import * as i9 from "../callback/implicit-flow-callback.service";
import * as i10 from "../callback/interval.service";
const IFRAME_FOR_SILENT_RENEW_IDENTIFIER = 'myiFrameForSilentRenew';
export class SilentRenewService {
    constructor(configurationProvider, iFrameService, flowsService, resetAuthDataService, flowsDataService, authStateService, loggerService, flowHelper, implicitFlowCallbackService, intervalService) {
        this.configurationProvider = configurationProvider;
        this.iFrameService = iFrameService;
        this.flowsService = flowsService;
        this.resetAuthDataService = resetAuthDataService;
        this.flowsDataService = flowsDataService;
        this.authStateService = authStateService;
        this.loggerService = loggerService;
        this.flowHelper = flowHelper;
        this.implicitFlowCallbackService = implicitFlowCallbackService;
        this.intervalService = intervalService;
        this.refreshSessionWithIFrameCompletedInternal$ = new Subject();
    }
    get refreshSessionWithIFrameCompleted$() {
        return this.refreshSessionWithIFrameCompletedInternal$.asObservable();
    }
    getOrCreateIframe(configId) {
        const existingIframe = this.getExistingIframe();
        if (!existingIframe) {
            return this.iFrameService.addIFrameToWindowBody(IFRAME_FOR_SILENT_RENEW_IDENTIFIER, configId);
        }
        return existingIframe;
    }
    isSilentRenewConfigured(configId) {
        const { useRefreshToken, silentRenew } = this.configurationProvider.getOpenIDConfiguration(configId);
        return !useRefreshToken && silentRenew;
    }
    codeFlowCallbackSilentRenewIframe(urlParts, configId) {
        const params = new HttpParams({
            fromString: urlParts[1],
        });
        const error = params.get('error');
        if (error) {
            this.authStateService.updateAndPublishAuthState({
                isAuthenticated: false,
                validationResult: ValidationResult.LoginRequired,
                isRenewProcess: true,
            });
            this.resetAuthDataService.resetAuthorizationData(configId);
            this.flowsDataService.setNonce('', configId);
            this.intervalService.stopPeriodicTokenCheck();
            return throwError(() => new Error(error));
        }
        const code = params.get('code');
        const state = params.get('state');
        const sessionState = params.get('session_state');
        const callbackContext = {
            code,
            refreshToken: null,
            state,
            sessionState,
            authResult: null,
            isRenewProcess: true,
            jwtKeys: null,
            validationResult: null,
            existingIdToken: null,
        };
        return this.flowsService.processSilentRenewCodeFlowCallback(callbackContext, configId).pipe(catchError((errorFromFlow) => {
            this.intervalService.stopPeriodicTokenCheck();
            this.resetAuthDataService.resetAuthorizationData(configId);
            return throwError(() => new Error(error));
        }));
    }
    silentRenewEventHandler(e, configId) {
        this.loggerService.logDebug(configId, 'silentRenewEventHandler');
        if (!e.detail) {
            return;
        }
        let callback$ = of(null);
        const isCodeFlow = this.flowHelper.isCurrentFlowCodeFlow(configId);
        if (isCodeFlow) {
            const urlParts = e.detail.toString().split('?');
            callback$ = this.codeFlowCallbackSilentRenewIframe(urlParts, configId);
        }
        else {
            callback$ = this.implicitFlowCallbackService.authenticatedImplicitFlowCallback(configId, e.detail);
        }
        callback$.subscribe({
            next: (callbackContext) => {
                this.refreshSessionWithIFrameCompletedInternal$.next(callbackContext);
                this.flowsDataService.resetSilentRenewRunning(configId);
            },
            error: (err) => {
                this.loggerService.logError(configId, 'Error: ' + err);
                this.refreshSessionWithIFrameCompletedInternal$.next(null);
                this.flowsDataService.resetSilentRenewRunning(configId);
            },
        });
    }
    getExistingIframe() {
        return this.iFrameService.getExistingIFrame(IFRAME_FOR_SILENT_RENEW_IDENTIFIER);
    }
}
SilentRenewService.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: SilentRenewService, deps: [{ token: i1.ConfigurationProvider }, { token: i2.IFrameService }, { token: i3.FlowsService }, { token: i4.ResetAuthDataService }, { token: i5.FlowsDataService }, { token: i6.AuthStateService }, { token: i7.LoggerService }, { token: i8.FlowHelper }, { token: i9.ImplicitFlowCallbackService }, { token: i10.IntervalService }], target: i0.ɵɵFactoryTarget.Injectable });
SilentRenewService.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: SilentRenewService });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: SilentRenewService, decorators: [{
            type: Injectable
        }], ctorParameters: function () { return [{ type: i1.ConfigurationProvider }, { type: i2.IFrameService }, { type: i3.FlowsService }, { type: i4.ResetAuthDataService }, { type: i5.FlowsDataService }, { type: i6.AuthStateService }, { type: i7.LoggerService }, { type: i8.FlowHelper }, { type: i9.ImplicitFlowCallbackService }, { type: i10.IntervalService }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2lsZW50LXJlbmV3LnNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy9hbmd1bGFyLWF1dGgtb2lkYy1jbGllbnQvc3JjL2xpYi9pZnJhbWUvc2lsZW50LXJlbmV3LnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBQ2xELE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDM0MsT0FBTyxFQUFjLEVBQUUsRUFBRSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBQzNELE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQVc1QyxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxpQ0FBaUMsQ0FBQzs7Ozs7Ozs7Ozs7O0FBR25FLE1BQU0sa0NBQWtDLEdBQUcsd0JBQXdCLENBQUM7QUFHcEUsTUFBTSxPQUFPLGtCQUFrQjtJQU83QixZQUNVLHFCQUE0QyxFQUM1QyxhQUE0QixFQUM1QixZQUEwQixFQUMxQixvQkFBMEMsRUFDMUMsZ0JBQWtDLEVBQ2xDLGdCQUFrQyxFQUNsQyxhQUE0QixFQUM1QixVQUFzQixFQUN0QiwyQkFBd0QsRUFDeEQsZUFBZ0M7UUFUaEMsMEJBQXFCLEdBQXJCLHFCQUFxQixDQUF1QjtRQUM1QyxrQkFBYSxHQUFiLGFBQWEsQ0FBZTtRQUM1QixpQkFBWSxHQUFaLFlBQVksQ0FBYztRQUMxQix5QkFBb0IsR0FBcEIsb0JBQW9CLENBQXNCO1FBQzFDLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBa0I7UUFDbEMscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFrQjtRQUNsQyxrQkFBYSxHQUFiLGFBQWEsQ0FBZTtRQUM1QixlQUFVLEdBQVYsVUFBVSxDQUFZO1FBQ3RCLGdDQUEyQixHQUEzQiwyQkFBMkIsQ0FBNkI7UUFDeEQsb0JBQWUsR0FB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QUFDO0lBRU8saUJBQWlCO1FBQ3ZCLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxpQkFBaUIsQ0FBQyxrQ0FBa0MsQ0FBQyxDQUFDO0lBQ2xGLENBQUM7OytHQWxIVSxrQkFBa0I7bUhBQWxCLGtCQUFrQjsyRkFBbEIsa0JBQWtCO2tCQUQ5QixVQUFVIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSHR0cFBhcmFtcyB9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbi9odHRwJztcbmltcG9ydCB7IEluamVjdGFibGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IE9ic2VydmFibGUsIG9mLCBTdWJqZWN0LCB0aHJvd0Vycm9yIH0gZnJvbSAncnhqcyc7XG5pbXBvcnQgeyBjYXRjaEVycm9yIH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuaW1wb3J0IHsgQXV0aFN0YXRlU2VydmljZSB9IGZyb20gJy4uL2F1dGgtc3RhdGUvYXV0aC1zdGF0ZS5zZXJ2aWNlJztcbmltcG9ydCB7IEltcGxpY2l0Rmxvd0NhbGxiYWNrU2VydmljZSB9IGZyb20gJy4uL2NhbGxiYWNrL2ltcGxpY2l0LWZsb3ctY2FsbGJhY2suc2VydmljZSc7XG5pbXBvcnQgeyBJbnRlcnZhbFNlcnZpY2UgfSBmcm9tICcuLi9jYWxsYmFjay9pbnRlcnZhbC5zZXJ2aWNlJztcbmltcG9ydCB7IENvbmZpZ3VyYXRpb25Qcm92aWRlciB9IGZyb20gJy4uL2NvbmZpZy9wcm92aWRlci9jb25maWcucHJvdmlkZXInO1xuaW1wb3J0IHsgQ2FsbGJhY2tDb250ZXh0IH0gZnJvbSAnLi4vZmxvd3MvY2FsbGJhY2stY29udGV4dCc7XG5pbXBvcnQgeyBGbG93c0RhdGFTZXJ2aWNlIH0gZnJvbSAnLi4vZmxvd3MvZmxvd3MtZGF0YS5zZXJ2aWNlJztcbmltcG9ydCB7IEZsb3dzU2VydmljZSB9IGZyb20gJy4uL2Zsb3dzL2Zsb3dzLnNlcnZpY2UnO1xuaW1wb3J0IHsgUmVzZXRBdXRoRGF0YVNlcnZpY2UgfSBmcm9tICcuLi9mbG93cy9yZXNldC1hdXRoLWRhdGEuc2VydmljZSc7XG5pbXBvcnQgeyBMb2dnZXJTZXJ2aWNlIH0gZnJvbSAnLi4vbG9nZ2luZy9sb2dnZXIuc2VydmljZSc7XG5pbXBvcnQgeyBGbG93SGVscGVyIH0gZnJvbSAnLi4vdXRpbHMvZmxvd0hlbHBlci9mbG93LWhlbHBlci5zZXJ2aWNlJztcbmltcG9ydCB7IFZhbGlkYXRpb25SZXN1bHQgfSBmcm9tICcuLi92YWxpZGF0aW9uL3ZhbGlkYXRpb24tcmVzdWx0JztcbmltcG9ydCB7IElGcmFtZVNlcnZpY2UgfSBmcm9tICcuL2V4aXN0aW5nLWlmcmFtZS5zZXJ2aWNlJztcblxuY29uc3QgSUZSQU1FX0ZPUl9TSUxFTlRfUkVORVdfSURFTlRJRklFUiA9ICdteWlGcmFtZUZvclNpbGVudFJlbmV3JztcblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIFNpbGVudFJlbmV3U2VydmljZSB7XG4gIHByaXZhdGUgcmVmcmVzaFNlc3Npb25XaXRoSUZyYW1lQ29tcGxldGVkSW50ZXJuYWwkID0gbmV3IFN1YmplY3Q8Q2FsbGJhY2tDb250ZXh0PigpO1xuXG4gIGdldCByZWZyZXNoU2Vzc2lvbldpdGhJRnJhbWVDb21wbGV0ZWQkKCk6IE9ic2VydmFibGU8Q2FsbGJhY2tDb250ZXh0PiB7XG4gICAgcmV0dXJuIHRoaXMucmVmcmVzaFNlc3Npb25XaXRoSUZyYW1lQ29tcGxldGVkSW50ZXJuYWwkLmFzT2JzZXJ2YWJsZSgpO1xuICB9XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSBjb25maWd1cmF0aW9uUHJvdmlkZXI6IENvbmZpZ3VyYXRpb25Qcm92aWRlcixcbiAgICBwcml2YXRlIGlGcmFtZVNlcnZpY2U6IElGcmFtZVNlcnZpY2UsXG4gICAgcHJpdmF0ZSBmbG93c1NlcnZpY2U6IEZsb3dzU2VydmljZSxcbiAgICBwcml2YXRlIHJlc2V0QXV0aERhdGFTZXJ2aWNlOiBSZXNldEF1dGhEYXRhU2VydmljZSxcbiAgICBwcml2YXRlIGZsb3dzRGF0YVNlcnZpY2U6IEZsb3dzRGF0YVNlcnZpY2UsXG4gICAgcHJpdmF0ZSBhdXRoU3RhdGVTZXJ2aWNlOiBBdXRoU3RhdGVTZXJ2aWNlLFxuICAgIHByaXZhdGUgbG9nZ2VyU2VydmljZTogTG9nZ2VyU2VydmljZSxcbiAgICBwcml2YXRlIGZsb3dIZWxwZXI6IEZsb3dIZWxwZXIsXG4gICAgcHJpdmF0ZSBpbXBsaWNpdEZsb3dDYWxsYmFja1NlcnZpY2U6IEltcGxpY2l0Rmxvd0NhbGxiYWNrU2VydmljZSxcbiAgICBwcml2YXRlIGludGVydmFsU2VydmljZTogSW50ZXJ2YWxTZXJ2aWNlXG4gICkge31cblxuICBnZXRPckNyZWF0ZUlmcmFtZShjb25maWdJZDogc3RyaW5nKTogSFRNTElGcmFtZUVsZW1lbnQge1xuICAgIGNvbnN0IGV4aXN0aW5nSWZyYW1lID0gdGhpcy5nZXRFeGlzdGluZ0lmcmFtZSgpO1xuXG4gICAgaWYgKCFleGlzdGluZ0lmcmFtZSkge1xuICAgICAgcmV0dXJuIHRoaXMuaUZyYW1lU2VydmljZS5hZGRJRnJhbWVUb1dpbmRvd0JvZHkoSUZSQU1FX0ZPUl9TSUxFTlRfUkVORVdfSURFTlRJRklFUiwgY29uZmlnSWQpO1xuICAgIH1cblxuICAgIHJldHVybiBleGlzdGluZ0lmcmFtZTtcbiAgfVxuXG4gIGlzU2lsZW50UmVuZXdDb25maWd1cmVkKGNvbmZpZ0lkOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICBjb25zdCB7IHVzZVJlZnJlc2hUb2tlbiwgc2lsZW50UmVuZXcgfSA9IHRoaXMuY29uZmlndXJhdGlvblByb3ZpZGVyLmdldE9wZW5JRENvbmZpZ3VyYXRpb24oY29uZmlnSWQpO1xuXG4gICAgcmV0dXJuICF1c2VSZWZyZXNoVG9rZW4gJiYgc2lsZW50UmVuZXc7XG4gIH1cblxuICBjb2RlRmxvd0NhbGxiYWNrU2lsZW50UmVuZXdJZnJhbWUodXJsUGFydHM6IGFueSwgY29uZmlnSWQ6IHN0cmluZyk6IE9ic2VydmFibGU8Q2FsbGJhY2tDb250ZXh0PiB7XG4gICAgY29uc3QgcGFyYW1zID0gbmV3IEh0dHBQYXJhbXMoe1xuICAgICAgZnJvbVN0cmluZzogdXJsUGFydHNbMV0sXG4gICAgfSk7XG5cbiAgICBjb25zdCBlcnJvciA9IHBhcmFtcy5nZXQoJ2Vycm9yJyk7XG5cbiAgICBpZiAoZXJyb3IpIHtcbiAgICAgIHRoaXMuYXV0aFN0YXRlU2VydmljZS51cGRhdGVBbmRQdWJsaXNoQXV0aFN0YXRlKHtcbiAgICAgICAgaXNBdXRoZW50aWNhdGVkOiBmYWxzZSxcbiAgICAgICAgdmFsaWRhdGlvblJlc3VsdDogVmFsaWRhdGlvblJlc3VsdC5Mb2dpblJlcXVpcmVkLFxuICAgICAgICBpc1JlbmV3UHJvY2VzczogdHJ1ZSxcbiAgICAgIH0pO1xuICAgICAgdGhpcy5yZXNldEF1dGhEYXRhU2VydmljZS5yZXNldEF1dGhvcml6YXRpb25EYXRhKGNvbmZpZ0lkKTtcbiAgICAgIHRoaXMuZmxvd3NEYXRhU2VydmljZS5zZXROb25jZSgnJywgY29uZmlnSWQpO1xuICAgICAgdGhpcy5pbnRlcnZhbFNlcnZpY2Uuc3RvcFBlcmlvZGljVG9rZW5DaGVjaygpO1xuXG4gICAgICByZXR1cm4gdGhyb3dFcnJvcigoKSA9PiBuZXcgRXJyb3IoZXJyb3IpKTtcbiAgICB9XG5cbiAgICBjb25zdCBjb2RlID0gcGFyYW1zLmdldCgnY29kZScpO1xuICAgIGNvbnN0IHN0YXRlID0gcGFyYW1zLmdldCgnc3RhdGUnKTtcbiAgICBjb25zdCBzZXNzaW9uU3RhdGUgPSBwYXJhbXMuZ2V0KCdzZXNzaW9uX3N0YXRlJyk7XG5cbiAgICBjb25zdCBjYWxsYmFja0NvbnRleHQgPSB7XG4gICAgICBjb2RlLFxuICAgICAgcmVmcmVzaFRva2VuOiBudWxsLFxuICAgICAgc3RhdGUsXG4gICAgICBzZXNzaW9uU3RhdGUsXG4gICAgICBhdXRoUmVzdWx0OiBudWxsLFxuICAgICAgaXNSZW5ld1Byb2Nlc3M6IHRydWUsXG4gICAgICBqd3RLZXlzOiBudWxsLFxuICAgICAgdmFsaWRhdGlvblJlc3VsdDogbnVsbCxcbiAgICAgIGV4aXN0aW5nSWRUb2tlbjogbnVsbCxcbiAgICB9O1xuXG4gICAgcmV0dXJuIHRoaXMuZmxvd3NTZXJ2aWNlLnByb2Nlc3NTaWxlbnRSZW5ld0NvZGVGbG93Q2FsbGJhY2soY2FsbGJhY2tDb250ZXh0LCBjb25maWdJZCkucGlwZShcbiAgICAgIGNhdGNoRXJyb3IoKGVycm9yRnJvbUZsb3cpID0+IHtcbiAgICAgICAgdGhpcy5pbnRlcnZhbFNlcnZpY2Uuc3RvcFBlcmlvZGljVG9rZW5DaGVjaygpO1xuICAgICAgICB0aGlzLnJlc2V0QXV0aERhdGFTZXJ2aWNlLnJlc2V0QXV0aG9yaXphdGlvbkRhdGEoY29uZmlnSWQpO1xuXG4gICAgICAgIHJldHVybiB0aHJvd0Vycm9yKCgpID0+IG5ldyBFcnJvcihlcnJvcikpO1xuICAgICAgfSlcbiAgICApO1xuICB9XG5cbiAgc2lsZW50UmVuZXdFdmVudEhhbmRsZXIoZTogQ3VzdG9tRXZlbnQsIGNvbmZpZ0lkOiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoY29uZmlnSWQsICdzaWxlbnRSZW5ld0V2ZW50SGFuZGxlcicpO1xuICAgIGlmICghZS5kZXRhaWwpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBsZXQgY2FsbGJhY2skID0gb2YobnVsbCkgYXMgT2JzZXJ2YWJsZTxDYWxsYmFja0NvbnRleHQ+O1xuXG4gICAgY29uc3QgaXNDb2RlRmxvdyA9IHRoaXMuZmxvd0hlbHBlci5pc0N1cnJlbnRGbG93Q29kZUZsb3coY29uZmlnSWQpO1xuXG4gICAgaWYgKGlzQ29kZUZsb3cpIHtcbiAgICAgIGNvbnN0IHVybFBhcnRzID0gZS5kZXRhaWwudG9TdHJpbmcoKS5zcGxpdCgnPycpO1xuICAgICAgY2FsbGJhY2skID0gdGhpcy5jb2RlRmxvd0NhbGxiYWNrU2lsZW50UmVuZXdJZnJhbWUodXJsUGFydHMsIGNvbmZpZ0lkKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY2FsbGJhY2skID0gdGhpcy5pbXBsaWNpdEZsb3dDYWxsYmFja1NlcnZpY2UuYXV0aGVudGljYXRlZEltcGxpY2l0Rmxvd0NhbGxiYWNrKGNvbmZpZ0lkLCBlLmRldGFpbCk7XG4gICAgfVxuXG4gICAgY2FsbGJhY2skLnN1YnNjcmliZSh7XG4gICAgICBuZXh0OiAoY2FsbGJhY2tDb250ZXh0KSA9PiB7XG4gICAgICAgIHRoaXMucmVmcmVzaFNlc3Npb25XaXRoSUZyYW1lQ29tcGxldGVkSW50ZXJuYWwkLm5leHQoY2FsbGJhY2tDb250ZXh0KTtcbiAgICAgICAgdGhpcy5mbG93c0RhdGFTZXJ2aWNlLnJlc2V0U2lsZW50UmVuZXdSdW5uaW5nKGNvbmZpZ0lkKTtcbiAgICAgIH0sXG4gICAgICBlcnJvcjogKGVycjogYW55KSA9PiB7XG4gICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dFcnJvcihjb25maWdJZCwgJ0Vycm9yOiAnICsgZXJyKTtcbiAgICAgICAgdGhpcy5yZWZyZXNoU2Vzc2lvbldpdGhJRnJhbWVDb21wbGV0ZWRJbnRlcm5hbCQubmV4dChudWxsKTtcbiAgICAgICAgdGhpcy5mbG93c0RhdGFTZXJ2aWNlLnJlc2V0U2lsZW50UmVuZXdSdW5uaW5nKGNvbmZpZ0lkKTtcbiAgICAgIH0sXG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIGdldEV4aXN0aW5nSWZyYW1lKCk6IEhUTUxJRnJhbWVFbGVtZW50IHtcbiAgICByZXR1cm4gdGhpcy5pRnJhbWVTZXJ2aWNlLmdldEV4aXN0aW5nSUZyYW1lKElGUkFNRV9GT1JfU0lMRU5UX1JFTkVXX0lERU5USUZJRVIpO1xuICB9XG59XG4iXX0=