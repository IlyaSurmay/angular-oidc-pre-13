import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { APP_INITIALIZER, InjectionToken, NgModule } from '@angular/core';
import { forkJoin } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { DataService } from './api/data.service';
import { HttpBaseService } from './api/http-base.service';
import { AuthStateService } from './auth-state/auth-state.service';
import { AutoLoginService } from './auto-login/auto-login.service';
import { ImplicitFlowCallbackService } from './callback/implicit-flow-callback.service';
import { CheckAuthService } from './check-auth.service';
import { AuthWellKnownDataService } from './config/auth-well-known/auth-well-known-data.service';
import { AuthWellKnownService } from './config/auth-well-known/auth-well-known.service';
import { OidcConfigService } from './config/config.service';
import { StsConfigLoader, StsConfigStaticLoader } from './config/loader/config-loader';
import { ConfigurationProvider } from './config/provider/config.provider';
import { ConfigValidationService } from './config/validation/config-validation.service';
import { CodeFlowCallbackHandlerService } from './flows/callback-handling/code-flow-callback-handler.service';
import { HistoryJwtKeysCallbackHandlerService } from './flows/callback-handling/history-jwt-keys-callback-handler.service';
import { ImplicitFlowCallbackHandlerService } from './flows/callback-handling/implicit-flow-callback-handler.service';
import { RefreshSessionCallbackHandlerService } from './flows/callback-handling/refresh-session-callback-handler.service';
import { RefreshTokenCallbackHandlerService } from './flows/callback-handling/refresh-token-callback-handler.service';
import { StateValidationCallbackHandlerService } from './flows/callback-handling/state-validation-callback-handler.service';
import { UserCallbackHandlerService } from './flows/callback-handling/user-callback-handler.service';
import { FlowsDataService } from './flows/flows-data.service';
import { FlowsService } from './flows/flows.service';
import { RandomService } from './flows/random/random.service';
import { ResetAuthDataService } from './flows/reset-auth-data.service';
import { SigninKeyDataService } from './flows/signin-key-data.service';
import { CheckSessionService } from './iframe/check-session.service';
import { IFrameService } from './iframe/existing-iframe.service';
import { SilentRenewService } from './iframe/silent-renew.service';
import { ClosestMatchingRouteService } from './interceptor/closest-matching-route.service';
import { LoggerService } from './logging/logger.service';
import { LoginService } from './login/login.service';
import { ParLoginService } from './login/par/par-login.service';
import { ParService } from './login/par/par.service';
import { PopUpLoginService } from './login/popup/popup-login.service';
import { ResponseTypeValidationService } from './login/response-type-validation/response-type-validation.service';
import { StandardLoginService } from './login/standard/standard-login.service';
import { LogoffRevocationService } from './logoff-revoke/logoff-revocation.service';
import { OidcSecurityService } from './oidc.security.service';
import { PublicEventsService } from './public-events/public-events.service';
import { BrowserStorageService } from './storage/browser-storage.service';
import { DefaultSessionStorageService } from './storage/default-sessionstorage.service';
import { StoragePersistenceService } from './storage/storage-persistence.service';
import { UserService } from './user-data/user.service';
import { EqualityService } from './utils/equality/equality.service';
import { FlowHelper } from './utils/flowHelper/flow-helper.service';
import { PlatformProvider } from './utils/platform-provider/platform.provider';
import { TokenHelperService } from './utils/tokenHelper/token-helper.service';
import { CurrentUrlService } from './utils/url/current-url.service';
import { UrlService } from './utils/url/url.service';
import { JsrsAsignReducedService } from './validation/jsrsasign-reduced.service';
import { StateValidationService } from './validation/state-validation.service';
import { TokenValidationService } from './validation/token-validation.service';
import * as i0 from "@angular/core";
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function createStaticLoader(passedConfig) {
    return new StsConfigStaticLoader(passedConfig.config);
}
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function configurationProviderFactory(oidcConfigService, loader) {
    const allConfigs$ = forkJoin(loader.loadConfigs());
    const fn = () => allConfigs$.pipe(switchMap((configs) => oidcConfigService.withConfigs(configs)));
    return fn;
}
export const PASSED_CONFIG = new InjectionToken('PASSED_CONFIG');
export class AuthModule {
    static forRoot(passedConfig) {
        return {
            ngModule: AuthModule,
            providers: [
                // Make the PASSED_CONFIG available through injection
                { provide: PASSED_CONFIG, useValue: passedConfig },
                // Create the loader: Either the one getting passed or a static one
                passedConfig?.loader || { provide: StsConfigLoader, useFactory: createStaticLoader, deps: [PASSED_CONFIG] },
                // Load the config when the app starts
                {
                    provide: APP_INITIALIZER,
                    multi: true,
                    deps: [OidcConfigService, StsConfigLoader, PASSED_CONFIG],
                    useFactory: configurationProviderFactory,
                },
                OidcConfigService,
                PublicEventsService,
                FlowHelper,
                ConfigurationProvider,
                OidcSecurityService,
                TokenValidationService,
                PlatformProvider,
                CheckSessionService,
                FlowsDataService,
                FlowsService,
                SilentRenewService,
                LogoffRevocationService,
                UserService,
                RandomService,
                HttpBaseService,
                UrlService,
                AuthStateService,
                SigninKeyDataService,
                StoragePersistenceService,
                TokenHelperService,
                LoggerService,
                IFrameService,
                EqualityService,
                LoginService,
                ParService,
                AuthWellKnownDataService,
                AuthWellKnownService,
                DataService,
                StateValidationService,
                ConfigValidationService,
                CheckAuthService,
                ResetAuthDataService,
                ImplicitFlowCallbackService,
                HistoryJwtKeysCallbackHandlerService,
                ResponseTypeValidationService,
                UserCallbackHandlerService,
                StateValidationCallbackHandlerService,
                RefreshSessionCallbackHandlerService,
                RefreshTokenCallbackHandlerService,
                CodeFlowCallbackHandlerService,
                ImplicitFlowCallbackHandlerService,
                ParLoginService,
                PopUpLoginService,
                StandardLoginService,
                AutoLoginService,
                JsrsAsignReducedService,
                CurrentUrlService,
                ClosestMatchingRouteService,
                DefaultSessionStorageService,
                BrowserStorageService,
            ],
        };
    }
}
AuthModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: AuthModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
AuthModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: AuthModule, imports: [CommonModule, HttpClientModule] });
AuthModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: AuthModule, imports: [[CommonModule, HttpClientModule]] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: AuthModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [CommonModule, HttpClientModule],
                    declarations: [],
                    exports: [],
                }]
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXV0aC5tb2R1bGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9wcm9qZWN0cy9hbmd1bGFyLWF1dGgtb2lkYy1jbGllbnQvc3JjL2xpYi9hdXRoLm1vZHVsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFDL0MsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUFDeEQsT0FBTyxFQUFFLGVBQWUsRUFBRSxjQUFjLEVBQXVCLFFBQVEsRUFBWSxNQUFNLGVBQWUsQ0FBQztBQUN6RyxPQUFPLEVBQUUsUUFBUSxFQUFjLE1BQU0sTUFBTSxDQUFDO0FBQzVDLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUMzQyxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFDakQsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBQzFELE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLGlDQUFpQyxDQUFDO0FBQ25FLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLGlDQUFpQyxDQUFDO0FBQ25FLE9BQU8sRUFBRSwyQkFBMkIsRUFBRSxNQUFNLDJDQUEyQyxDQUFDO0FBQ3hGLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBQ3hELE9BQU8sRUFBRSx3QkFBd0IsRUFBRSxNQUFNLHVEQUF1RCxDQUFDO0FBQ2pHLE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxNQUFNLGtEQUFrRCxDQUFDO0FBQ3hGLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBQzVELE9BQU8sRUFBRSxlQUFlLEVBQUUscUJBQXFCLEVBQUUsTUFBTSwrQkFBK0IsQ0FBQztBQUV2RixPQUFPLEVBQUUscUJBQXFCLEVBQUUsTUFBTSxtQ0FBbUMsQ0FBQztBQUMxRSxP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bk1vZHVsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG5pbXBvcnQgeyBIdHRwQ2xpZW50TW9kdWxlIH0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uL2h0dHAnO1xuaW1wb3J0IHsgQVBQX0lOSVRJQUxJWkVSLCBJbmplY3Rpb25Ub2tlbiwgTW9kdWxlV2l0aFByb3ZpZGVycywgTmdNb2R1bGUsIFByb3ZpZGVyIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBmb3JrSm9pbiwgT2JzZXJ2YWJsZSB9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHsgc3dpdGNoTWFwIH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuaW1wb3J0IHsgRGF0YVNlcnZpY2UgfSBmcm9tICcuL2FwaS9kYXRhLnNlcnZpY2UnO1xuaW1wb3J0IHsgSHR0cEJhc2VTZXJ2aWNlIH0gZnJvbSAnLi9hcGkvaHR0cC1iYXNlLnNlcnZpY2UnO1xuaW1wb3J0IHsgQXV0aFN0YXRlU2VydmljZSB9IGZyb20gJy4vYXV0aC1zdGF0ZS9hdXRoLXN0YXRlLnNlcnZpY2UnO1xuaW1wb3J0IHsgQXV0b0xvZ2luU2VydmljZSB9IGZyb20gJy4vYXV0by1sb2dpbi9hdXRvLWxvZ2luLnNlcnZpY2UnO1xuaW1wb3J0IHsgSW1wbGljaXRGbG93Q2FsbGJhY2tTZXJ2aWNlIH0gZnJvbSAnLi9jYWxsYmFjay9pbXBsaWNpdC1mbG93LWNhbGxiYWNrLnNlcnZpY2UnO1xuaW1wb3J0IHsgQ2hlY2tBdXRoU2VydmljZSB9IGZyb20gJy4vY2hlY2stYXV0aC5zZXJ2aWNlJztcbmltcG9ydCB7IEF1dGhXZWxsS25vd25EYXRhU2VydmljZSB9IGZyb20gJy4vY29uZmlnL2F1dGgtd2VsbC1rbm93bi9hdXRoLXdlbGwta25vd24tZGF0YS5zZXJ2aWNlJztcbmltcG9ydCB7IEF1dGhXZWxsS25vd25TZXJ2aWNlIH0gZnJvbSAnLi9jb25maWcvYXV0aC13ZWxsLWtub3duL2F1dGgtd2VsbC1rbm93bi5zZXJ2aWNlJztcbmltcG9ydCB7IE9pZGNDb25maWdTZXJ2aWNlIH0gZnJvbSAnLi9jb25maWcvY29uZmlnLnNlcnZpY2UnO1xuaW1wb3J0IHsgU3RzQ29uZmlnTG9hZGVyLCBTdHNDb25maWdTdGF0aWNMb2FkZXIgfSBmcm9tICcuL2NvbmZpZy9sb2FkZXIvY29uZmlnLWxvYWRlcic7XG5pbXBvcnQgeyBPcGVuSWRDb25maWd1cmF0aW9uIH0gZnJvbSAnLi9jb25maWcvb3BlbmlkLWNvbmZpZ3VyYXRpb24nO1xuaW1wb3J0IHsgQ29uZmlndXJhdGlvblByb3ZpZGVyIH0gZnJvbSAnLi9jb25maWcvcHJvdmlkZXIvY29uZmlnLnByb3ZpZGVyJztcbmltcG9ydCB7IENvbmZpZ1ZhbGlkYXRpb25TZXJ2aWNlIH0gZnJvbSAnLi9jb25maWcvdmFsaWRhdGlvbi9jb25maWctdmFsaWRhdGlvbi5zZXJ2aWNlJztcbmltcG9ydCB7IENvZGVGbG93Q2FsbGJhY2tIYW5kbGVyU2VydmljZSB9IGZyb20gJy4vZmxvd3MvY2FsbGJhY2staGFuZGxpbmcvY29kZS1mbG93LWNhbGxiYWNrLWhhbmRsZXIuc2VydmljZSc7XG5pbXBvcnQgeyBIaXN0b3J5Snd0S2V5c0NhbGxiYWNrSGFuZGxlclNlcnZpY2UgfSBmcm9tICcuL2Zsb3dzL2NhbGxiYWNrLWhhbmRsaW5nL2hpc3Rvcnktand0LWtleXMtY2FsbGJhY2staGFuZGxlci5zZXJ2aWNlJztcbmltcG9ydCB7IEltcGxpY2l0Rmxvd0NhbGxiYWNrSGFuZGxlclNlcnZpY2UgfSBmcm9tICcuL2Zsb3dzL2NhbGxiYWNrLWhhbmRsaW5nL2ltcGxpY2l0LWZsb3ctY2FsbGJhY2staGFuZGxlci5zZXJ2aWNlJztcbmltcG9ydCB7IFJlZnJlc2hTZXNzaW9uQ2FsbGJhY2tIYW5kbGVyU2VydmljZSB9IGZyb20gJy4vZmxvd3MvY2FsbGJhY2staGFuZGxpbmcvcmVmcmVzaC1zZXNzaW9uLWNhbGxiYWNrLWhhbmRsZXIuc2VydmljZSc7XG5pbXBvcnQgeyBSZWZyZXNoVG9rZW5DYWxsYmFja0hhbmRsZXJTZXJ2aWNlIH0gZnJvbSAnLi9mbG93cy9jYWxsYmFjay1oYW5kbGluZy9yZWZyZXNoLXRva2VuLWNhbGxiYWNrLWhhbmRsZXIuc2VydmljZSc7XG5pbXBvcnQgeyBTdGF0ZVZhbGlkYXRpb25DYWxsYmFja0hhbmRsZXJTZXJ2aWNlIH0gZnJvbSAnLi9mbG93cy9jYWxsYmFjay1oYW5kbGluZy9zdGF0ZS12YWxpZGF0aW9uLWNhbGxiYWNrLWhhbmRsZXIuc2VydmljZSc7XG5pbXBvcnQgeyBVc2VyQ2FsbGJhY2tIYW5kbGVyU2VydmljZSB9IGZyb20gJy4vZmxvd3MvY2FsbGJhY2staGFuZGxpbmcvdXNlci1jYWxsYmFjay1oYW5kbGVyLnNlcnZpY2UnO1xuaW1wb3J0IHsgRmxvd3NEYXRhU2VydmljZSB9IGZyb20gJy4vZmxvd3MvZmxvd3MtZGF0YS5zZXJ2aWNlJztcbmltcG9ydCB7IEZsb3dzU2VydmljZSB9IGZyb20gJy4vZmxvd3MvZmxvd3Muc2VydmljZSc7XG5pbXBvcnQgeyBSYW5kb21TZXJ2aWNlIH0gZnJvbSAnLi9mbG93cy9yYW5kb20vcmFuZG9tLnNlcnZpY2UnO1xuaW1wb3J0IHsgUmVzZXRBdXRoRGF0YVNlcnZpY2UgfSBmcm9tICcuL2Zsb3dzL3Jlc2V0LWF1dGgtZGF0YS5zZXJ2aWNlJztcbmltcG9ydCB7IFNpZ25pbktleURhdGFTZXJ2aWNlIH0gZnJvbSAnLi9mbG93cy9zaWduaW4ta2V5LWRhdGEuc2VydmljZSc7XG5pbXBvcnQgeyBDaGVja1Nlc3Npb25TZXJ2aWNlIH0gZnJvbSAnLi9pZnJhbWUvY2hlY2stc2Vzc2lvbi5zZXJ2aWNlJztcbmltcG9ydCB7IElGcmFtZVNlcnZpY2UgfSBmcm9tICcuL2lmcmFtZS9leGlzdGluZy1pZnJhbWUuc2VydmljZSc7XG5pbXBvcnQgeyBTaWxlbnRSZW5ld1NlcnZpY2UgfSBmcm9tICcuL2lmcmFtZS9zaWxlbnQtcmVuZXcuc2VydmljZSc7XG5pbXBvcnQgeyBDbG9zZXN0TWF0Y2hpbmdSb3V0ZVNlcnZpY2UgfSBmcm9tICcuL2ludGVyY2VwdG9yL2Nsb3Nlc3QtbWF0Y2hpbmctcm91dGUuc2VydmljZSc7XG5pbXBvcnQgeyBMb2dnZXJTZXJ2aWNlIH0gZnJvbSAnLi9sb2dnaW5nL2xvZ2dlci5zZXJ2aWNlJztcbmltcG9ydCB7IExvZ2luU2VydmljZSB9IGZyb20gJy4vbG9naW4vbG9naW4uc2VydmljZSc7XG5pbXBvcnQgeyBQYXJMb2dpblNlcnZpY2UgfSBmcm9tICcuL2xvZ2luL3Bhci9wYXItbG9naW4uc2VydmljZSc7XG5pbXBvcnQgeyBQYXJTZXJ2aWNlIH0gZnJvbSAnLi9sb2dpbi9wYXIvcGFyLnNlcnZpY2UnO1xuaW1wb3J0IHsgUG9wVXBMb2dpblNlcnZpY2UgfSBmcm9tICcuL2xvZ2luL3BvcHVwL3BvcHVwLWxvZ2luLnNlcnZpY2UnO1xuaW1wb3J0IHsgUmVzcG9uc2VUeXBlVmFsaWRhdGlvblNlcnZpY2UgfSBmcm9tICcuL2xvZ2luL3Jlc3BvbnNlLXR5cGUtdmFsaWRhdGlvbi9yZXNwb25zZS10eXBlLXZhbGlkYXRpb24uc2VydmljZSc7XG5pbXBvcnQgeyBTdGFuZGFyZExvZ2luU2VydmljZSB9IGZyb20gJy4vbG9naW4vc3RhbmRhcmQvc3RhbmRhcmQtbG9naW4uc2VydmljZSc7XG5pbXBvcnQgeyBMb2dvZmZSZXZvY2F0aW9uU2VydmljZSB9IGZyb20gJy4vbG9nb2ZmLXJldm9rZS9sb2dvZmYtcmV2b2NhdGlvbi5zZXJ2aWNlJztcbmltcG9ydCB7IE9pZGNTZWN1cml0eVNlcnZpY2UgfSBmcm9tICcuL29pZGMuc2VjdXJpdHkuc2VydmljZSc7XG5pbXBvcnQgeyBQdWJsaWNFdmVudHNTZXJ2aWNlIH0gZnJvbSAnLi9wdWJsaWMtZXZlbnRzL3B1YmxpYy1ldmVudHMuc2VydmljZSc7XG5pbXBvcnQgeyBCcm93c2VyU3RvcmFnZVNlcnZpY2UgfSBmcm9tICcuL3N0b3JhZ2UvYnJvd3Nlci1zdG9yYWdlLnNlcnZpY2UnO1xuaW1wb3J0IHsgRGVmYXVsdFNlc3Npb25TdG9yYWdlU2VydmljZSB9IGZyb20gJy4vc3RvcmFnZS9kZWZhdWx0LXNlc3Npb25zdG9yYWdlLnNlcnZpY2UnO1xuaW1wb3J0IHsgU3RvcmFnZVBlcnNpc3RlbmNlU2VydmljZSB9IGZyb20gJy4vc3RvcmFnZS9zdG9yYWdlLXBlcnNpc3RlbmNlLnNlcnZpY2UnO1xuaW1wb3J0IHsgVXNlclNlcnZpY2UgfSBmcm9tICcuL3VzZXItZGF0YS91c2VyLnNlcnZpY2UnO1xuaW1wb3J0IHsgRXF1YWxpdHlTZXJ2aWNlIH0gZnJvbSAnLi91dGlscy9lcXVhbGl0eS9lcXVhbGl0eS5zZXJ2aWNlJztcbmltcG9ydCB7IEZsb3dIZWxwZXIgfSBmcm9tICcuL3V0aWxzL2Zsb3dIZWxwZXIvZmxvdy1oZWxwZXIuc2VydmljZSc7XG5pbXBvcnQgeyBQbGF0Zm9ybVByb3ZpZGVyIH0gZnJvbSAnLi91dGlscy9wbGF0Zm9ybS1wcm92aWRlci9wbGF0Zm9ybS5wcm92aWRlcic7XG5pbXBvcnQgeyBUb2tlbkhlbHBlclNlcnZpY2UgfSBmcm9tICcuL3V0aWxzL3Rva2VuSGVscGVyL3Rva2VuLWhlbHBlci5zZXJ2aWNlJztcbmltcG9ydCB7IEN1cnJlbnRVcmxTZXJ2aWNlIH0gZnJvbSAnLi91dGlscy91cmwvY3VycmVudC11cmwuc2VydmljZSc7XG5pbXBvcnQgeyBVcmxTZXJ2aWNlIH0gZnJvbSAnLi91dGlscy91cmwvdXJsLnNlcnZpY2UnO1xuaW1wb3J0IHsgSnNyc0FzaWduUmVkdWNlZFNlcnZpY2UgfSBmcm9tICcuL3ZhbGlkYXRpb24vanNyc2FzaWduLXJlZHVjZWQuc2VydmljZSc7XG5pbXBvcnQgeyBTdGF0ZVZhbGlkYXRpb25TZXJ2aWNlIH0gZnJvbSAnLi92YWxpZGF0aW9uL3N0YXRlLXZhbGlkYXRpb24uc2VydmljZSc7XG5pbXBvcnQgeyBUb2tlblZhbGlkYXRpb25TZXJ2aWNlIH0gZnJvbSAnLi92YWxpZGF0aW9uL3Rva2VuLXZhbGlkYXRpb24uc2VydmljZSc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgUGFzc2VkSW5pdGlhbENvbmZpZyB7XG4gIGNvbmZpZz86IE9wZW5JZENvbmZpZ3VyYXRpb24gfCBPcGVuSWRDb25maWd1cmF0aW9uW107XG4gIGxvYWRlcj86IFByb3ZpZGVyO1xuICBzdG9yYWdlPzogYW55O1xufVxuXG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L2V4cGxpY2l0LWZ1bmN0aW9uLXJldHVybi10eXBlXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlU3RhdGljTG9hZGVyKHBhc3NlZENvbmZpZzogUGFzc2VkSW5pdGlhbENvbmZpZykge1xuICByZXR1cm4gbmV3IFN0c0NvbmZpZ1N0YXRpY0xvYWRlcihwYXNzZWRDb25maWcuY29uZmlnKTtcbn1cblxuLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9leHBsaWNpdC1mdW5jdGlvbi1yZXR1cm4tdHlwZVxuZXhwb3J0IGZ1bmN0aW9uIGNvbmZpZ3VyYXRpb25Qcm92aWRlckZhY3RvcnkoXG4gIG9pZGNDb25maWdTZXJ2aWNlOiBPaWRjQ29uZmlnU2VydmljZSxcbiAgbG9hZGVyOiBTdHNDb25maWdMb2FkZXJcbik6ICgpID0+IE9ic2VydmFibGU8T3BlbklkQ29uZmlndXJhdGlvbltdPiB7XG4gIGNvbnN0IGFsbENvbmZpZ3MkID0gZm9ya0pvaW4obG9hZGVyLmxvYWRDb25maWdzKCkpO1xuXG4gIGNvbnN0IGZuOiAoKSA9PiBPYnNlcnZhYmxlPE9wZW5JZENvbmZpZ3VyYXRpb25bXT4gPSAoKSA9PlxuICAgIGFsbENvbmZpZ3MkLnBpcGUoc3dpdGNoTWFwKChjb25maWdzKSA9PiBvaWRjQ29uZmlnU2VydmljZS53aXRoQ29uZmlncyhjb25maWdzKSkpO1xuXG4gIHJldHVybiBmbjtcbn1cblxuZXhwb3J0IGNvbnN0IFBBU1NFRF9DT05GSUcgPSBuZXcgSW5qZWN0aW9uVG9rZW48UGFzc2VkSW5pdGlhbENvbmZpZz4oJ1BBU1NFRF9DT05GSUcnKTtcblxuQE5nTW9kdWxlKHtcbiAgaW1wb3J0czogW0NvbW1vbk1vZHVsZSwgSHR0cENsaWVudE1vZHVsZV0sXG4gIGRlY2xhcmF0aW9uczogW10sXG4gIGV4cG9ydHM6IFtdLFxufSlcbmV4cG9ydCBjbGFzcyBBdXRoTW9kdWxlIHtcbiAgc3RhdGljIGZvclJvb3QocGFzc2VkQ29uZmlnOiBQYXNzZWRJbml0aWFsQ29uZmlnKTogTW9kdWxlV2l0aFByb3ZpZGVyczxBdXRoTW9kdWxlPiB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG5nTW9kdWxlOiBBdXRoTW9kdWxlLFxuICAgICAgcHJvdmlkZXJzOiBbXG4gICAgICAgIC8vIE1ha2UgdGhlIFBBU1NFRF9DT05GSUcgYXZhaWxhYmxlIHRocm91Z2ggaW5qZWN0aW9uXG4gICAgICAgIHsgcHJvdmlkZTogUEFTU0VEX0NPTkZJRywgdXNlVmFsdWU6IHBhc3NlZENvbmZpZyB9LFxuXG4gICAgICAgIC8vIENyZWF0ZSB0aGUgbG9hZGVyOiBFaXRoZXIgdGhlIG9uZSBnZXR0aW5nIHBhc3NlZCBvciBhIHN0YXRpYyBvbmVcbiAgICAgICAgcGFzc2VkQ29uZmlnPy5sb2FkZXIgfHwgeyBwcm92aWRlOiBTdHNDb25maWdMb2FkZXIsIHVzZUZhY3Rvcnk6IGNyZWF0ZVN0YXRpY0xvYWRlciwgZGVwczogW1BBU1NFRF9DT05GSUddIH0sXG5cbiAgICAgICAgLy8gTG9hZCB0aGUgY29uZmlnIHdoZW4gdGhlIGFwcCBzdGFydHNcbiAgICAgICAge1xuICAgICAgICAgIHByb3ZpZGU6IEFQUF9JTklUSUFMSVpFUixcbiAgICAgICAgICBtdWx0aTogdHJ1ZSxcbiAgICAgICAgICBkZXBzOiBbT2lkY0NvbmZpZ1NlcnZpY2UsIFN0c0NvbmZpZ0xvYWRlciwgUEFTU0VEX0NPTkZJR10sXG4gICAgICAgICAgdXNlRmFjdG9yeTogY29uZmlndXJhdGlvblByb3ZpZGVyRmFjdG9yeSxcbiAgICAgICAgfSxcbiAgICAgICAgT2lkY0NvbmZpZ1NlcnZpY2UsXG4gICAgICAgIFB1YmxpY0V2ZW50c1NlcnZpY2UsXG4gICAgICAgIEZsb3dIZWxwZXIsXG4gICAgICAgIENvbmZpZ3VyYXRpb25Qcm92aWRlcixcbiAgICAgICAgT2lkY1NlY3VyaXR5U2VydmljZSxcbiAgICAgICAgVG9rZW5WYWxpZGF0aW9uU2VydmljZSxcbiAgICAgICAgUGxhdGZvcm1Qcm92aWRlcixcbiAgICAgICAgQ2hlY2tTZXNzaW9uU2VydmljZSxcbiAgICAgICAgRmxvd3NEYXRhU2VydmljZSxcbiAgICAgICAgRmxvd3NTZXJ2aWNlLFxuICAgICAgICBTaWxlbnRSZW5ld1NlcnZpY2UsXG4gICAgICAgIExvZ29mZlJldm9jYXRpb25TZXJ2aWNlLFxuICAgICAgICBVc2VyU2VydmljZSxcbiAgICAgICAgUmFuZG9tU2VydmljZSxcbiAgICAgICAgSHR0cEJhc2VTZXJ2aWNlLFxuICAgICAgICBVcmxTZXJ2aWNlLFxuICAgICAgICBBdXRoU3RhdGVTZXJ2aWNlLFxuICAgICAgICBTaWduaW5LZXlEYXRhU2VydmljZSxcbiAgICAgICAgU3RvcmFnZVBlcnNpc3RlbmNlU2VydmljZSxcbiAgICAgICAgVG9rZW5IZWxwZXJTZXJ2aWNlLFxuICAgICAgICBMb2dnZXJTZXJ2aWNlLFxuICAgICAgICBJRnJhbWVTZXJ2aWNlLFxuICAgICAgICBFcXVhbGl0eVNlcnZpY2UsXG4gICAgICAgIExvZ2luU2VydmljZSxcbiAgICAgICAgUGFyU2VydmljZSxcbiAgICAgICAgQXV0aFdlbGxLbm93bkRhdGFTZXJ2aWNlLFxuICAgICAgICBBdXRoV2VsbEtub3duU2VydmljZSxcbiAgICAgICAgRGF0YVNlcnZpY2UsXG4gICAgICAgIFN0YXRlVmFsaWRhdGlvblNlcnZpY2UsXG4gICAgICAgIENvbmZpZ1ZhbGlkYXRpb25TZXJ2aWNlLFxuICAgICAgICBDaGVja0F1dGhTZXJ2aWNlLFxuICAgICAgICBSZXNldEF1dGhEYXRhU2VydmljZSxcbiAgICAgICAgSW1wbGljaXRGbG93Q2FsbGJhY2tTZXJ2aWNlLFxuICAgICAgICBIaXN0b3J5Snd0S2V5c0NhbGxiYWNrSGFuZGxlclNlcnZpY2UsXG4gICAgICAgIFJlc3BvbnNlVHlwZVZhbGlkYXRpb25TZXJ2aWNlLFxuICAgICAgICBVc2VyQ2FsbGJhY2tIYW5kbGVyU2VydmljZSxcbiAgICAgICAgU3RhdGVWYWxpZGF0aW9uQ2FsbGJhY2tIYW5kbGVyU2VydmljZSxcbiAgICAgICAgUmVmcmVzaFNlc3Npb25DYWxsYmFja0hhbmRsZXJTZXJ2aWNlLFxuICAgICAgICBSZWZyZXNoVG9rZW5DYWxsYmFja0hhbmRsZXJTZXJ2aWNlLFxuICAgICAgICBDb2RlRmxvd0NhbGxiYWNrSGFuZGxlclNlcnZpY2UsXG4gICAgICAgIEltcGxpY2l0Rmxvd0NhbGxiYWNrSGFuZGxlclNlcnZpY2UsXG4gICAgICAgIFBhckxvZ2luU2VydmljZSxcbiAgICAgICAgUG9wVXBMb2dpblNlcnZpY2UsXG4gICAgICAgIFN0YW5kYXJkTG9naW5TZXJ2aWNlLFxuICAgICAgICBBdXRvTG9naW5TZXJ2aWNlLFxuICAgICAgICBKc3JzQXNpZ25SZWR1Y2VkU2VydmljZSxcbiAgICAgICAgQ3VycmVudFVybFNlcnZpY2UsXG4gICAgICAgIENsb3Nlc3RNYXRjaGluZ1JvdXRlU2VydmljZSxcbiAgICAgICAgRGVmYXVsdFNlc3Npb25TdG9yYWdlU2VydmljZSxcbiAgICAgICAgQnJvd3NlclN0b3JhZ2VTZXJ2aWNlLFxuICAgICAgXSxcbiAgICB9O1xuICB9XG59XG4iXX0=