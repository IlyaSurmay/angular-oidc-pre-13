import { Injectable } from '@angular/core';
import { forkJoin, of, throwError } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { EventTypes } from '../public-events/event-types';
import { DEFAULT_CONFIG } from './default-config';
import * as i0 from "@angular/core";
import * as i1 from "../logging/logger.service";
import * as i2 from "../public-events/public-events.service";
import * as i3 from "./provider/config.provider";
import * as i4 from "./auth-well-known/auth-well-known.service";
import * as i5 from "../storage/storage-persistence.service";
import * as i6 from "./validation/config-validation.service";
import * as i7 from "../utils/platform-provider/platform.provider";
import * as i8 from "./../storage/default-sessionstorage.service";
export class OidcConfigService {
    constructor(loggerService, publicEventsService, configurationProvider, authWellKnownService, storagePersistenceService, configValidationService, platformProvider, defaultSessionStorageService) {
        this.loggerService = loggerService;
        this.publicEventsService = publicEventsService;
        this.configurationProvider = configurationProvider;
        this.authWellKnownService = authWellKnownService;
        this.storagePersistenceService = storagePersistenceService;
        this.configValidationService = configValidationService;
        this.platformProvider = platformProvider;
        this.defaultSessionStorageService = defaultSessionStorageService;
    }
    withConfigs(passedConfigs) {
        if (!this.configValidationService.validateConfigs(passedConfigs)) {
            return of(null);
        }
        this.createUniqueIds(passedConfigs);
        const allHandleConfigs$ = passedConfigs.map((x) => this.handleConfig(x));
        return forkJoin(allHandleConfigs$);
    }
    createUniqueIds(passedConfigs) {
        passedConfigs.forEach((config, index) => {
            if (!config.configId) {
                config.configId = `${index}-${config.clientId}`;
            }
        });
    }
    handleConfig(passedConfig) {
        if (!this.configValidationService.validateConfig(passedConfig)) {
            this.loggerService.logError(passedConfig.configId, 'Validation of config rejected with errors. Config is NOT set.');
            return of(null);
        }
        if (!passedConfig.authWellknownEndpointUrl) {
            passedConfig.authWellknownEndpointUrl = passedConfig.authority;
        }
        const usedConfig = this.prepareConfig(passedConfig);
        this.configurationProvider.setConfig(usedConfig);
        const alreadyExistingAuthWellKnownEndpoints = this.storagePersistenceService.read('authWellKnownEndPoints', usedConfig.configId);
        if (!!alreadyExistingAuthWellKnownEndpoints) {
            usedConfig.authWellknownEndpoints = alreadyExistingAuthWellKnownEndpoints;
            this.publicEventsService.fireEvent(EventTypes.ConfigLoaded, usedConfig);
            return of(usedConfig);
        }
        const passedAuthWellKnownEndpoints = usedConfig.authWellknownEndpoints;
        if (!!passedAuthWellKnownEndpoints) {
            this.authWellKnownService.storeWellKnownEndpoints(usedConfig.configId, passedAuthWellKnownEndpoints);
            usedConfig.authWellknownEndpoints = passedAuthWellKnownEndpoints;
            this.publicEventsService.fireEvent(EventTypes.ConfigLoaded, usedConfig);
            return of(usedConfig);
        }
        if (usedConfig.eagerLoadAuthWellKnownEndpoints) {
            return this.authWellKnownService.getAuthWellKnownEndPoints(usedConfig.authWellknownEndpointUrl, usedConfig.configId).pipe(catchError((error) => {
                this.loggerService.logError(usedConfig.configId, 'Getting auth well known endpoints failed on start', error);
                return throwError(() => new Error(error));
            }), tap((wellknownEndPoints) => {
                usedConfig.authWellknownEndpoints = wellknownEndPoints;
                this.publicEventsService.fireEvent(EventTypes.ConfigLoaded, usedConfig);
            }), switchMap(() => of(usedConfig)));
        }
        else {
            this.publicEventsService.fireEvent(EventTypes.ConfigLoaded, usedConfig);
            return of(usedConfig);
        }
    }
    prepareConfig(configuration) {
        const openIdConfigurationInternal = { ...DEFAULT_CONFIG, ...configuration };
        this.setSpecialCases(openIdConfigurationInternal);
        this.setStorage(openIdConfigurationInternal);
        return openIdConfigurationInternal;
    }
    setSpecialCases(currentConfig) {
        if (!this.platformProvider.isBrowser) {
            currentConfig.startCheckSession = false;
            currentConfig.silentRenew = false;
            currentConfig.useRefreshToken = false;
            currentConfig.usePushedAuthorisationRequests = false;
        }
    }
    setStorage(currentConfig) {
        if (currentConfig.storage) {
            return;
        }
        if (this.hasBrowserStorage()) {
            currentConfig.storage = this.defaultSessionStorageService;
        }
        else {
            currentConfig.storage = null;
        }
    }
    hasBrowserStorage() {
        return typeof navigator !== 'undefined' && navigator.cookieEnabled && typeof Storage !== 'undefined';
    }
}
OidcConfigService.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: OidcConfigService, deps: [{ token: i1.LoggerService }, { token: i2.PublicEventsService }, { token: i3.ConfigurationProvider }, { token: i4.AuthWellKnownService }, { token: i5.StoragePersistenceService }, { token: i6.ConfigValidationService }, { token: i7.PlatformProvider }, { token: i8.DefaultSessionStorageService }], target: i0.ɵɵFactoryTarget.Injectable });
OidcConfigService.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: OidcConfigService });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: OidcConfigService, decorators: [{
            type: Injectable
        }], ctorParameters: function () { return [{ type: i1.LoggerService }, { type: i2.PublicEventsService }, { type: i3.ConfigurationProvider }, { type: i4.AuthWellKnownService }, { type: i5.StoragePersistenceService }, { type: i6.ConfigValidationService }, { type: i7.PlatformProvider }, { type: i8.DefaultSessionStorageService }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnLnNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy9hbmd1bGFyLWF1dGgtb2lkYy1jbGllbnQvc3JjL2xpYi9jb25maWcvY29uZmlnLnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUMzQyxPQUFPLEVBQUUsUUFBUSxFQUFjLEVBQUUsRUFBRSxVQUFVLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFDNUQsT0FBTyxFQUFFLFVBQVUsRUFBRSxTQUFTLEVBQUUsR0FBRyxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFFNUQsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBTTFELE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSxrQkFBa0IsQ0FBQzs7Ozs7Ozs7OztBQU1sRCxNQUFNLE9BQU8saUJBQWlCO0lBQzVCLFlBQ1UsYUFBNEIsRUFDNUIsbUJBQXdDLEVBQ3hDLHFCQUE0QyxFQUM1QyxvQkFBMEMsRUFDMUMseUJBQW9ELEVBQ3BELHVCQUFnRCxFQUNoRCxnQkFBa0MsRUFDbEMsNEJBQTBEO1FBUDFELGtCQUFhLEdBQWIsYUFBYSxDQUFlO1FBQzVCLHdCQUFtQixHQUFuQixtQkFBbUIsQ0FBcUI7UUFDeEMsMEJBQXFCLEdBQXJCLHFCQUFxQixDQUF1QjtRQUM1Qyx5QkFBb0IsR0FBcEIsb0JBQW9CLENBQXNCO1FBQzFDLDhCQUF5QixHQUF6Qix5QkFBeUIsQ0FBMkI7UUFDcEQsNEJBQXVCLEdBQXZCLHVCQUF1QixDQUF5QjtRQUNoRCxxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQWtCO1FBQ2xDLGlDQUE0QixHQUE1Qiw0QkFBNEIsQ0FBOEI7SUFDakUsQ0FBQztJQUVKLFdBQVcsQ0FBQyxhQUFvQztRQUM5QyxJQUFJLENBQUMsSUFBSSxDQUFDLHVCQUF1QixDQUFDLGVBQWUsQ0FBQyxhQUFh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QUFFO1lBQzVCLGFBQWEsQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLDRCQUE0QixDQUFDO1NBQzNEO2FBQU07WUFDTCxhQUFhLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQztTQUM5QjtJQUNILENBQUM7SUFFTyxpQkFBaUI7UUFDdkIsT0FBTyxPQUFPLFNBQVMsS0FBSyxXQUFXLElBQUksU0FBUyxDQUFDLGFBQWEsSUFBSSxPQUFPLE9BQU8sS0FBSyxXQUFXLENBQUM7SUFDdkcsQ0FBQzs7OEdBbEhVLGlCQUFpQjtrSEFBakIsaUJBQWlCOzJGQUFqQixpQkFBaUI7a0JBRDdCLFVBQVUiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJbmplY3RhYmxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBmb3JrSm9pbiwgT2JzZXJ2YWJsZSwgb2YsIHRocm93RXJyb3IgfSBmcm9tICdyeGpzJztcbmltcG9ydCB7IGNhdGNoRXJyb3IsIHN3aXRjaE1hcCwgdGFwIH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuaW1wb3J0IHsgTG9nZ2VyU2VydmljZSB9IGZyb20gJy4uL2xvZ2dpbmcvbG9nZ2VyLnNlcnZpY2UnO1xuaW1wb3J0IHsgRXZlbnRUeXBlcyB9IGZyb20gJy4uL3B1YmxpYy1ldmVudHMvZXZlbnQtdHlwZXMnO1xuaW1wb3J0IHsgUHVibGljRXZlbnRzU2VydmljZSB9IGZyb20gJy4uL3B1YmxpYy1ldmVudHMvcHVibGljLWV2ZW50cy5zZXJ2aWNlJztcbmltcG9ydCB7IFN0b3JhZ2VQZXJzaXN0ZW5jZVNlcnZpY2UgfSBmcm9tICcuLi9zdG9yYWdlL3N0b3JhZ2UtcGVyc2lzdGVuY2Uuc2VydmljZSc7XG5pbXBvcnQgeyBQbGF0Zm9ybVByb3ZpZGVyIH0gZnJvbSAnLi4vdXRpbHMvcGxhdGZvcm0tcHJvdmlkZXIvcGxhdGZvcm0ucHJvdmlkZXInO1xuaW1wb3J0IHsgRGVmYXVsdFNlc3Npb25TdG9yYWdlU2VydmljZSB9IGZyb20gJy4vLi4vc3RvcmFnZS9kZWZhdWx0LXNlc3Npb25zdG9yYWdlLnNlcnZpY2UnO1xuaW1wb3J0IHsgQXV0aFdlbGxLbm93blNlcnZpY2UgfSBmcm9tICcuL2F1dGgtd2VsbC1rbm93bi9hdXRoLXdlbGwta25vd24uc2VydmljZSc7XG5pbXBvcnQgeyBERUZBVUxUX0NPTkZJRyB9IGZyb20gJy4vZGVmYXVsdC1jb25maWcnO1xuaW1wb3J0IHsgT3BlbklkQ29uZmlndXJhdGlvbiB9IGZyb20gJy4vb3BlbmlkLWNvbmZpZ3VyYXRpb24nO1xuaW1wb3J0IHsgQ29uZmlndXJhdGlvblByb3ZpZGVyIH0gZnJvbSAnLi9wcm92aWRlci9jb25maWcucHJvdmlkZXInO1xuaW1wb3J0IHsgQ29uZmlnVmFsaWRhdGlvblNlcnZpY2UgfSBmcm9tICcuL3ZhbGlkYXRpb24vY29uZmlnLXZhbGlkYXRpb24uc2VydmljZSc7XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBPaWRjQ29uZmlnU2VydmljZSB7XG4gIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUgbG9nZ2VyU2VydmljZTogTG9nZ2VyU2VydmljZSxcbiAgICBwcml2YXRlIHB1YmxpY0V2ZW50c1NlcnZpY2U6IFB1YmxpY0V2ZW50c1NlcnZpY2UsXG4gICAgcHJpdmF0ZSBjb25maWd1cmF0aW9uUHJvdmlkZXI6IENvbmZpZ3VyYXRpb25Qcm92aWRlcixcbiAgICBwcml2YXRlIGF1dGhXZWxsS25vd25TZXJ2aWNlOiBBdXRoV2VsbEtub3duU2VydmljZSxcbiAgICBwcml2YXRlIHN0b3JhZ2VQZXJzaXN0ZW5jZVNlcnZpY2U6IFN0b3JhZ2VQZXJzaXN0ZW5jZVNlcnZpY2UsXG4gICAgcHJpdmF0ZSBjb25maWdWYWxpZGF0aW9uU2VydmljZTogQ29uZmlnVmFsaWRhdGlvblNlcnZpY2UsXG4gICAgcHJpdmF0ZSBwbGF0Zm9ybVByb3ZpZGVyOiBQbGF0Zm9ybVByb3ZpZGVyLFxuICAgIHByaXZhdGUgZGVmYXVsdFNlc3Npb25TdG9yYWdlU2VydmljZTogRGVmYXVsdFNlc3Npb25TdG9yYWdlU2VydmljZVxuICApIHt9XG5cbiAgd2l0aENvbmZpZ3MocGFzc2VkQ29uZmlnczogT3BlbklkQ29uZmlndXJhdGlvbltdKTogT2JzZXJ2YWJsZTxPcGVuSWRDb25maWd1cmF0aW9uW10+IHtcbiAgICBpZiAoIXRoaXMuY29uZmlnVmFsaWRhdGlvblNlcnZpY2UudmFsaWRhdGVDb25maWdzKHBhc3NlZENvbmZpZ3MpKSB7XG4gICAgICByZXR1cm4gb2YobnVsbCk7XG4gICAgfVxuXG4gICAgdGhpcy5jcmVhdGVVbmlxdWVJZHMocGFzc2VkQ29uZmlncyk7XG4gICAgY29uc3QgYWxsSGFuZGxlQ29uZmlncyQgPSBwYXNzZWRDb25maWdzLm1hcCgoeCkgPT4gdGhpcy5oYW5kbGVDb25maWcoeCkpO1xuXG4gICAgcmV0dXJuIGZvcmtKb2luKGFsbEhhbmRsZUNvbmZpZ3MkKTtcbiAgfVxuXG4gIHByaXZhdGUgY3JlYXRlVW5pcXVlSWRzKHBhc3NlZENvbmZpZ3M6IE9wZW5JZENvbmZpZ3VyYXRpb25bXSk6IHZvaWQge1xuICAgIHBhc3NlZENvbmZpZ3MuZm9yRWFjaCgoY29uZmlnLCBpbmRleCkgPT4ge1xuICAgICAgaWYgKCFjb25maWcuY29uZmlnSWQpIHtcbiAgICAgICAgY29uZmlnLmNvbmZpZ0lkID0gYCR7aW5kZXh9LSR7Y29uZmlnLmNsaWVudElkfWA7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIGhhbmRsZUNvbmZpZyhwYXNzZWRDb25maWc6IE9wZW5JZENvbmZpZ3VyYXRpb24pOiBPYnNlcnZhYmxlPE9wZW5JZENvbmZpZ3VyYXRpb24+IHtcbiAgICBpZiAoIXRoaXMuY29uZmlnVmFsaWRhdGlvblNlcnZpY2UudmFsaWRhdGVDb25maWcocGFzc2VkQ29uZmlnKSkge1xuICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0Vycm9yKHBhc3NlZENvbmZpZy5jb25maWdJZCwgJ1ZhbGlkYXRpb24gb2YgY29uZmlnIHJlamVjdGVkIHdpdGggZXJyb3JzLiBDb25maWcgaXMgTk9UIHNldC4nKTtcblxuICAgICAgcmV0dXJuIG9mKG51bGwpO1xuICAgIH1cblxuICAgIGlmICghcGFzc2VkQ29uZmlnLmF1dGhXZWxsa25vd25FbmRwb2ludFVybCkge1xuICAgICAgcGFzc2VkQ29uZmlnLmF1dGhXZWxsa25vd25FbmRwb2ludFVybCA9IHBhc3NlZENvbmZpZy5hdXRob3JpdHk7XG4gICAgfVxuXG4gICAgY29uc3QgdXNlZENvbmZpZyA9IHRoaXMucHJlcGFyZUNvbmZpZyhwYXNzZWRDb25maWcpO1xuICAgIHRoaXMuY29uZmlndXJhdGlvblByb3ZpZGVyLnNldENvbmZpZyh1c2VkQ29uZmlnKTtcblxuICAgIGNvbnN0IGFscmVhZHlFeGlzdGluZ0F1dGhXZWxsS25vd25FbmRwb2ludHMgPSB0aGlzLnN0b3JhZ2VQZXJzaXN0ZW5jZVNlcnZpY2UucmVhZCgnYXV0aFdlbGxLbm93bkVuZFBvaW50cycsIHVzZWRDb25maWcuY29uZmlnSWQpO1xuICAgIGlmICghIWFscmVhZHlFeGlzdGluZ0F1dGhXZWxsS25vd25FbmRwb2ludHMpIHtcbiAgICAgIHVzZWRDb25maWcuYXV0aFdlbGxrbm93bkVuZHBvaW50cyA9IGFscmVhZHlFeGlzdGluZ0F1dGhXZWxsS25vd25FbmRwb2ludHM7XG4gICAgICB0aGlzLnB1YmxpY0V2ZW50c1NlcnZpY2UuZmlyZUV2ZW50PE9wZW5JZENvbmZpZ3VyYXRpb24+KEV2ZW50VHlwZXMuQ29uZmlnTG9hZGVkLCB1c2VkQ29uZmlnKTtcblxuICAgICAgcmV0dXJuIG9mKHVzZWRDb25maWcpO1xuICAgIH1cblxuICAgIGNvbnN0IHBhc3NlZEF1dGhXZWxsS25vd25FbmRwb2ludHMgPSB1c2VkQ29uZmlnLmF1dGhXZWxsa25vd25FbmRwb2ludHM7XG5cbiAgICBpZiAoISFwYXNzZWRBdXRoV2VsbEtub3duRW5kcG9pbnRzKSB7XG4gICAgICB0aGlzLmF1dGhXZWxsS25vd25TZXJ2aWNlLnN0b3JlV2VsbEtub3duRW5kcG9pbnRzKHVzZWRDb25maWcuY29uZmlnSWQsIHBhc3NlZEF1dGhXZWxsS25vd25FbmRwb2ludHMpO1xuICAgICAgdXNlZENvbmZpZy5hdXRoV2VsbGtub3duRW5kcG9pbnRzID0gcGFzc2VkQXV0aFdlbGxLbm93bkVuZHBvaW50cztcbiAgICAgIHRoaXMucHVibGljRXZlbnRzU2VydmljZS5maXJlRXZlbnQ8T3BlbklkQ29uZmlndXJhdGlvbj4oRXZlbnRUeXBlcy5Db25maWdMb2FkZWQsIHVzZWRDb25maWcpO1xuXG4gICAgICByZXR1cm4gb2YodXNlZENvbmZpZyk7XG4gICAgfVxuXG4gICAgaWYgKHVzZWRDb25maWcuZWFnZXJMb2FkQXV0aFdlbGxLbm93bkVuZHBvaW50cykge1xuICAgICAgcmV0dXJuIHRoaXMuYXV0aFdlbGxLbm93blNlcnZpY2UuZ2V0QXV0aFdlbGxLbm93bkVuZFBvaW50cyh1c2VkQ29uZmlnLmF1dGhXZWxsa25vd25FbmRwb2ludFVybCwgdXNlZENvbmZpZy5jb25maWdJZCkucGlwZShcbiAgICAgICAgY2F0Y2hFcnJvcigoZXJyb3IpID0+IHtcbiAgICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRXJyb3IodXNlZENvbmZpZy5jb25maWdJZCwgJ0dldHRpbmcgYXV0aCB3ZWxsIGtub3duIGVuZHBvaW50cyBmYWlsZWQgb24gc3RhcnQnLCBlcnJvcik7XG5cbiAgICAgICAgICByZXR1cm4gdGhyb3dFcnJvcigoKSA9PiBuZXcgRXJyb3IoZXJyb3IpKTtcbiAgICAgICAgfSksXG4gICAgICAgIHRhcCgod2VsbGtub3duRW5kUG9pbnRzKSA9PiB7XG4gICAgICAgICAgdXNlZENvbmZpZy5hdXRoV2VsbGtub3duRW5kcG9pbnRzID0gd2VsbGtub3duRW5kUG9pbnRzO1xuICAgICAgICAgIHRoaXMucHVibGljRXZlbnRzU2VydmljZS5maXJlRXZlbnQ8T3BlbklkQ29uZmlndXJhdGlvbj4oRXZlbnRUeXBlcy5Db25maWdMb2FkZWQsIHVzZWRDb25maWcpO1xuICAgICAgICB9KSxcbiAgICAgICAgc3dpdGNoTWFwKCgpID0+IG9mKHVzZWRDb25maWcpKVxuICAgICAgKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5wdWJsaWNFdmVudHNTZXJ2aWNlLmZpcmVFdmVudDxPcGVuSWRDb25maWd1cmF0aW9uPihFdmVudFR5cGVzLkNvbmZpZ0xvYWRlZCwgdXNlZENvbmZpZyk7XG5cbiAgICAgIHJldHVybiBvZih1c2VkQ29uZmlnKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIHByZXBhcmVDb25maWcoY29uZmlndXJhdGlvbjogT3BlbklkQ29uZmlndXJhdGlvbik6IE9wZW5JZENvbmZpZ3VyYXRpb24ge1xuICAgIGNvbnN0IG9wZW5JZENvbmZpZ3VyYXRpb25JbnRlcm5hbCA9IHsgLi4uREVGQVVMVF9DT05GSUcsIC4uLmNvbmZpZ3VyYXRpb24gfTtcbiAgICB0aGlzLnNldFNwZWNpYWxDYXNlcyhvcGVuSWRDb25maWd1cmF0aW9uSW50ZXJuYWwpO1xuICAgIHRoaXMuc2V0U3RvcmFnZShvcGVuSWRDb25maWd1cmF0aW9uSW50ZXJuYWwpO1xuXG4gICAgcmV0dXJuIG9wZW5JZENvbmZpZ3VyYXRpb25JbnRlcm5hbDtcbiAgfVxuXG4gIHByaXZhdGUgc2V0U3BlY2lhbENhc2VzKGN1cnJlbnRDb25maWc6IE9wZW5JZENvbmZpZ3VyYXRpb24pOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMucGxhdGZvcm1Qcm92aWRlci5pc0Jyb3dzZXIpIHtcbiAgICAgIGN1cnJlbnRDb25maWcuc3RhcnRDaGVja1Nlc3Npb24gPSBmYWxzZTtcbiAgICAgIGN1cnJlbnRDb25maWcuc2lsZW50UmVuZXcgPSBmYWxzZTtcbiAgICAgIGN1cnJlbnRDb25maWcudXNlUmVmcmVzaFRva2VuID0gZmFsc2U7XG4gICAgICBjdXJyZW50Q29uZmlnLnVzZVB1c2hlZEF1dGhvcmlzYXRpb25SZXF1ZXN0cyA9IGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgc2V0U3RvcmFnZShjdXJyZW50Q29uZmlnOiBPcGVuSWRDb25maWd1cmF0aW9uKTogdm9pZCB7XG4gICAgaWYgKGN1cnJlbnRDb25maWcuc3RvcmFnZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmICh0aGlzLmhhc0Jyb3dzZXJTdG9yYWdlKCkpIHtcbiAgICAgIGN1cnJlbnRDb25maWcuc3RvcmFnZSA9IHRoaXMuZGVmYXVsdFNlc3Npb25TdG9yYWdlU2VydmljZTtcbiAgICB9IGVsc2Uge1xuICAgICAgY3VycmVudENvbmZpZy5zdG9yYWdlID0gbnVsbDtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGhhc0Jyb3dzZXJTdG9yYWdlKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0eXBlb2YgbmF2aWdhdG9yICE9PSAndW5kZWZpbmVkJyAmJiBuYXZpZ2F0b3IuY29va2llRW5hYmxlZCAmJiB0eXBlb2YgU3RvcmFnZSAhPT0gJ3VuZGVmaW5lZCc7XG4gIH1cbn1cbiJdfQ==