import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import { EventTypes } from '../public-events/event-types';
import * as i0 from "@angular/core";
import * as i1 from "../storage/storage-persistence.service";
import * as i2 from "../logging/logger.service";
import * as i3 from "../public-events/public-events.service";
import * as i4 from "../config/provider/config.provider";
import * as i5 from "../validation/token-validation.service";
const DEFAULT_AUTHRESULT = { isAuthenticated: false, allConfigsAuthenticated: [] };
export class AuthStateService {
    constructor(storagePersistenceService, loggerService, publicEventsService, configurationProvider, tokenValidationService) {
        this.storagePersistenceService = storagePersistenceService;
        this.loggerService = loggerService;
        this.publicEventsService = publicEventsService;
        this.configurationProvider = configurationProvider;
        this.tokenValidationService = tokenValidationService;
        this.authenticatedInternal$ = new BehaviorSubject(DEFAULT_AUTHRESULT);
    }
    get authenticated$() {
        return this.authenticatedInternal$.asObservable().pipe(distinctUntilChanged());
    }
    setAuthenticatedAndFireEvent() {
        const result = this.composeAuthenticatedResult();
        this.authenticatedInternal$.next(result);
    }
    setUnauthenticatedAndFireEvent(configIdToReset) {
        this.storagePersistenceService.resetAuthStateInStorage(configIdToReset);
        const result = this.composeUnAuthenticatedResult();
        this.authenticatedInternal$.next(result);
    }
    updateAndPublishAuthState(authenticationResult) {
        this.publicEventsService.fireEvent(EventTypes.NewAuthenticationResult, authenticationResult);
    }
    setAuthorizationData(accessToken, authResult, configId) {
        this.loggerService.logDebug(configId, `storing the accessToken '${accessToken}'`);
        this.storagePersistenceService.write('authzData', accessToken, configId);
        this.persistAccessTokenExpirationTime(authResult, configId);
        this.setAuthenticatedAndFireEvent();
    }
    getAccessToken(configId) {
        if (!this.isAuthenticated(configId)) {
            return null;
        }
        const token = this.storagePersistenceService.getAccessToken(configId);
        return this.decodeURIComponentSafely(token);
    }
    getIdToken(configId) {
        if (!this.isAuthenticated(configId)) {
            return null;
        }
        const token = this.storagePersistenceService.getIdToken(configId);
        return this.decodeURIComponentSafely(token);
    }
    getRefreshToken(configId) {
        if (!this.isAuthenticated(configId)) {
            return null;
        }
        const token = this.storagePersistenceService.getRefreshToken(configId);
        return this.decodeURIComponentSafely(token);
    }
    getAuthenticationResult(configId) {
        if (!this.isAuthenticated(configId)) {
            return null;
        }
        return this.storagePersistenceService.getAuthenticationResult(configId);
    }
    areAuthStorageTokensValid(configId) {
        if (!this.isAuthenticated(configId)) {
            return false;
        }
        if (this.hasIdTokenExpiredAndRenewCheckIsEnabled(configId)) {
            this.loggerService.logDebug(configId, 'persisted idToken is expired');
            return false;
        }
        if (this.hasAccessTokenExpiredIfExpiryExists(configId)) {
            this.loggerService.logDebug(configId, 'persisted accessToken is expired');
            return false;
        }
        this.loggerService.logDebug(configId, 'persisted idToken and accessToken are valid');
        return true;
    }
    hasIdTokenExpiredAndRenewCheckIsEnabled(configId) {
        const { renewTimeBeforeTokenExpiresInSeconds, enableIdTokenExpiredValidationInRenew } = this.configurationProvider.getOpenIDConfiguration(configId);
        if (!enableIdTokenExpiredValidationInRenew) {
            return false;
        }
        const tokenToCheck = this.storagePersistenceService.getIdToken(configId);
        const idTokenExpired = this.tokenValidationService.hasIdTokenExpired(tokenToCheck, configId, renewTimeBeforeTokenExpiresInSeconds);
        if (idTokenExpired) {
            this.publicEventsService.fireEvent(EventTypes.IdTokenExpired, idTokenExpired);
        }
        return idTokenExpired;
    }
    hasAccessTokenExpiredIfExpiryExists(configId) {
        const { renewTimeBeforeTokenExpiresInSeconds } = this.configurationProvider.getOpenIDConfiguration(configId);
        const accessTokenExpiresIn = this.storagePersistenceService.read('access_token_expires_at', configId);
        const accessTokenHasNotExpired = this.tokenValidationService.validateAccessTokenNotExpired(accessTokenExpiresIn, configId, renewTimeBeforeTokenExpiresInSeconds);
        const hasExpired = !accessTokenHasNotExpired;
        if (hasExpired) {
            this.publicEventsService.fireEvent(EventTypes.TokenExpired, hasExpired);
        }
        return hasExpired;
    }
    isAuthenticated(configId) {
        return !!this.storagePersistenceService.getAccessToken(configId) && !!this.storagePersistenceService.getIdToken(configId);
    }
    decodeURIComponentSafely(token) {
        if (token) {
            return decodeURIComponent(token);
        }
        else {
            return '';
        }
    }
    persistAccessTokenExpirationTime(authResult, configId) {
        if (authResult?.expires_in) {
            const accessTokenExpiryTime = new Date(new Date().toUTCString()).valueOf() + authResult.expires_in * 1000;
            this.storagePersistenceService.write('access_token_expires_at', accessTokenExpiryTime, configId);
        }
    }
    composeAuthenticatedResult() {
        if (!this.configurationProvider.hasManyConfigs()) {
            const { configId } = this.configurationProvider.getOpenIDConfiguration();
            return { isAuthenticated: true, allConfigsAuthenticated: [{ configId, isAuthenticated: true }] };
        }
        return this.checkAllConfigsIfTheyAreAuthenticated();
    }
    composeUnAuthenticatedResult() {
        if (!this.configurationProvider.hasManyConfigs()) {
            const { configId } = this.configurationProvider.getOpenIDConfiguration();
            return { isAuthenticated: false, allConfigsAuthenticated: [{ configId, isAuthenticated: false }] };
        }
        return this.checkAllConfigsIfTheyAreAuthenticated();
    }
    checkAllConfigsIfTheyAreAuthenticated() {
        const configs = this.configurationProvider.getAllConfigurations();
        const allConfigsAuthenticated = configs.map(({ configId }) => ({
            configId,
            isAuthenticated: this.isAuthenticated(configId),
        }));
        const isAuthenticated = allConfigsAuthenticated.every((x) => !!x.isAuthenticated);
        return { allConfigsAuthenticated, isAuthenticated };
    }
}
AuthStateService.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: AuthStateService, deps: [{ token: i1.StoragePersistenceService }, { token: i2.LoggerService }, { token: i3.PublicEventsService }, { token: i4.ConfigurationProvider }, { token: i5.TokenValidationService }], target: i0.ɵɵFactoryTarget.Injectable });
AuthStateService.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: AuthStateService });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: AuthStateService, decorators: [{
            type: Injectable
        }], ctorParameters: function () { return [{ type: i1.StoragePersistenceService }, { type: i2.LoggerService }, { type: i3.PublicEventsService }, { type: i4.ConfigurationProvider }, { type: i5.TokenValidationService }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXV0aC1zdGF0ZS5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvYW5ndWxhci1hdXRoLW9pZGMtY2xpZW50L3NyYy9saWIvYXV0aC1zdGF0ZS9hdXRoLXN0YXRlLnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUMzQyxPQUFPLEVBQUUsZUFBZSxFQUFjLE1BQU0sTUFBTSxDQUFDO0FBQ25ELE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBSXRELE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQzs7Ozs7OztBQU8xRCxNQUFNLGtCQUFrQixHQUFHLEVBQUUsZUFBZSxFQUFFLEtBQUssRUFBRSx1QkFBdUIsRUFBRSxFQUFFLEVBQUUsQ0FBQztBQUduRixNQUFNLE9BQU8sZ0JBQWdCO0lBTzNCLFlBQ1UseUJBQW9ELEVBQ3BELGFBQTRCLEVBQzVCLG1CQUF3QyxFQUN4QyxxQkFBNEMsRUFDNUMsc0JBQThDO1FBSjlDLDhCQUF5QixHQUF6Qix5QkFBeUIsQ0FBMkI7UUFDcEQsa0JBQWEsR0FBYixhQUFhLENBQWU7UUFDNUIsd0JBQW1CLEdBQW5CLG1CQUFtQixDQUFxQjtRQUN4QywwQkFBcUIsR0FBckIscUJBQXFCLENBQXVCO1FBQzVDLDJCQUFzQixHQUF0QixzQkFBc0IsQ0FBd0I7UUFYaEQsMkJBQXNCLEdBQUcsSUFBSSxlQUFlLENBQXNCLGtCQUFrQixDQUFDLENBQUM7SUFZM0YsQ0FBQztJQVZKLElBQUksY0FBYztRQUNoQixPQUFPLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxJQUFJLENBQUMsb0JBQW9CLEVBQUUsQ0FBQyxDQUFDO0lBQ2pGLENBQUM7SUFVRCw0QkFBNEI7UUFDMUIsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLDBCQUEwQixFQUFFLENBQUM7UUFDakQsSUFBSSxDQUFDLHNCQUFzQixDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUMzQyxDQUFDO0lBRUQsOEJBQThCLENBQUMsZUFBdUI7UUFDcEQsSUFBSSxDQUFDLHlCQUF5QixDQUFDLHVCQUF1QixDQUFDLGVBQWUsQ0FBQyxDQUFDO1FBRXhFLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyw0QkFBNEIsRUFBRSxDQUFDO1FBQ25ELElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDM0MsQ0FBQztJQUVELHlCQUF5QixDQUFDLG9CQUFxQztRQUM3RCxJQUFJLENBQUMsbUJBQW1CLENBQUMsU0FBUyxDQUFrQixVQUFVLENBQUMsdUJBQXVCLEVBQUUsb0JBQW9CLENBQUMsQ0FBQztJQUNoSCxDQUFDO0lBRUQsb0JBQW9CLENBQUMsV0FBbUIsRUFBRSxVQUFzQixFQUFFLFFBQWdCO1FBQ2hGLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRSw0QkFBNEIsV0FBVyxHQUFHLENBQUMsQ0FBQztRQUVsRixJQUFJLENBQUMseUJBQXlCLENBQUMsS0FBSyxDQUFDLFdBQVcsRUFBRSxXQUFXLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFDekUsSUFBSSxDQUFDLGdDQUFnQyxDQUFDLFVBQVUsRUFBRSxRQUFRLENBQUMsQ0FBQztRQUM1RCxJQUFJLENBQUMsNEJBQTRCLEVBQUUsQ0FBQztJQUN0QyxDQUFDO0lBRUQsY0FBYyxDQUFDLFFBQWdCO1FBQzdCLElBQUksQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLFFBQVEsQ0FBQyxFQUFFO1lBQ25DLE9BQU8sSUFBSSxDQUFDO1NBQ2I7UUFFRCxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMseUJBQXlCLENBQUMsY0FBYyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBRXRFLE9BQU8sSUFBSSxDQUFDLHdCQUF3QixDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQzlDLENBQUM7SUFFRCxVQUFVLENBQUMsUUFBZ0I7UUFDekIsSUFBSSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsUUFBUSxDQUFDLEVBQUU7WUFDbkMsT0FBTyxJQUFJLENBQUM7U0FDYjtRQUVELE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLENBQUM7UUFFbEUsT0FBTyxJQUFJLENBQUMsd0JBQXdCLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDOUMsQ0FBQztJQUVELGVBQWUsQ0FBQyxRQUFnQjtRQUM5QixJQUFJLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxRQUFRLENBQUMsRUFBRTtZQUNuQyxPQUFPLElBQUksQ0FBQztTQUNiO1FBRUQsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLHlCQUF5QixDQUFDLGVBQWUsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUV2RSxPQUFPLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUM5QyxDQUFDO0lBRUQsdUJBQXVCLENBQUMsUUFBaUI7UUFDdkMsSUFBSSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsUUFBUSxDQUFDLEVBQUU7WUFDbkMsT0FBTyxJQUFJLENBQUM7U0FDYjtRQUVELE9BQU8sSUFBSSxDQUFDLHlCQUF5QixDQUFDLHVCQUF1QixDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQzFFLENBQUM7SUFFRCx5QkFBeUIsQ0FBQyxRQUFnQjtRQUN4QyxJQUFJLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxRQUFRLENBQUMsRUFBRTtZQUNuQyxPQUFPLEtBQUssQ0FBQztTQUNkO1FBRUQsSUFBSSxJQUFJLENBQUMsdUNBQXVDLENBQUMsUUFBUSxDQUFDLEVBQUU7WUFDMUQsSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFLDhCQUE4QixDQUFDLENBQUM7WUFFdEUsT0FBTyxLQUFLLENBQUM7U0FDZDtRQUVELElBQUksSUFBSSxDQUFDLG1DQUFtQyxDQUFDLFFBQVEsQ0FBQyxFQUFFO1lBQ3RELElBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRSxrQ0FBa0MsQ0FBQyxDQUFDO1lBRTFFLE9BQU8sS0FBSyxDQUFDO1NBQ2Q7UUFFRCxJQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxRQUFRLEVBQUUsNkNBQTZDLENBQUMsQ0FBQztRQUVyRixPQUFPLElBQUksQ0FBQztJQUNkLENBQUM7SUFFRCx1Q0FBdUMsQ0FBQyxRQUFnQjtRQUN0RCxNQUFNLEVBQUUsb0NBQW9DLEVBQUUscUNBQXFDLEVBQUUsR0FDbkYsSUFBSSxDQUFDLHFCQUFxQixDQUFDLHNCQUFzQixDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBRTlELElBQUksQ0FBQyxxQ0FBcUMsRUFBRTtZQUMxQyxPQUFPLEtBQUssQ0FBQztTQUNkO1FBQ0QsTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLHlCQUF5QixDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUV6RSxNQUFNLGNBQWMsR0FBRyxJQUFJLENBQUMsc0JBQXNCLENBQUMsaUJBQWlCLENBQUMsWUFBWSxFQUFFLFFBQVEsRUFBRSxvQ0FBb0MsQ0FBQyxDQUFDO1FBRW5JLElBQUksY0FBYyxFQUFFO1lBQ2xCLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxTQUFTLENBQVUsVUFBVSxDQUFDLGNBQWMsRUFBRSxjQUFjLENBQUMsQ0FBQztTQUN4RjtRQUVELE9BQU8sY0FBYyxDQUFDO0lBQ3hCLENBQUM7SUFFRCxtQ0FBbUMsQ0FBQyxRQUFnQjtRQUNsRCxNQUFNLEVBQUUsb0NBQW9DLEVBQUUsR0FBRyxJQUFJLENBQUMscUJBQXFCLENBQUMsc0JBQXNCLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDN0csTUFBTSxvQkFBb0IsR0FBRyxJQUFJLENBQUMseUJBQXlCLENBQUMsSUFBSSxDQUFDLHlCQUF5QixFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBQ3RHLE1BQU0sd0JBQXdCLEdBQUcsSUFBSSxDQUFDLHNCQUFzQixDQUFDLDZCQUE2QixDQUN4RixvQkFBb0IsRUFDcEIsUUFBUSxFQUNSLG9DQUFvQyxDQUNyQyxDQUFDO1FBRUYsTUFBTSxVQUFVLEdBQUcsQ0FBQyx3QkFBd0IsQ0FBQztRQUU3QyxJQUFJLFVBQVUsRUFBRTtZQUNkLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxTQUFTLENBQVUsVUFBVSxDQUFDLFlBQVksRUFBRSxVQUFVLENBQUMsQ0FBQztTQUNsRjtRQUVELE9BQU8sVUFBVSxDQUFDO0lBQ3BCLENBQUM7SUFFRCxlQUFlLENBQUMsUUFBZ0I7UUFDOUIsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLHlCQUF5QixDQUFDLGNBQWMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLHlCQUF5QixDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUM1SCxDQUFDO0lBRU8sd0JBQXdCLENBQUMsS0FBYTtRQUM1QyxJQUFJLEtBQUssRUFBRTtZQUNULE9BQU8sa0JBQWtCLENBQUMsS0FBSyxDQUFDLENBQUM7U0FDbEM7YUFBTTtZQUNMLE9BQU8sRUFBRSxDQUFDO1NBQ1g7SUFDSCxDQUFDO0lBRU8sZ0NBQWdDLENBQUMsVUFBZSxFQUFFLFFBQWdCO1FBQ3hFLElBQUksVUFBVSxFQUFFLFVBQVUsRUFBRTtZQUMxQixNQUFNLHFCQUFxQixHQUFHLElBQUksSUFBSSxDQUFDLElBQUksSUFBSSxFQUFFLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQyxPQUFPLEVBQUUsR0FBRyxVQUFVLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQztZQUMxRyxJQUFJLENBQUMseUJBQXlCLENBQUMsS0FBSyxDQUFDLHlCQUF5QixFQUFFLHFCQUFxQixFQUFFLFFBQVEsQ0FBQyxDQUFDO1NBQ2xHO0lBQ0gsQ0FBQztJQUVPLDBCQUEwQjtRQUNoQyxJQUFJLENBQUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLGNBQWMsRUFBRSxFQUFFO1lBQ2hELE1BQU0sRUFBRSxRQUFRLEVBQUUsR0FBRyxJQUFJLENBQUMscUJBQXFCLENBQUMsc0JBQXNCLEVBQUUsQ0FBQztZQUV6RSxPQUFPLEVBQUUsZUFBZSxFQUFFLElBQUksRUFBRSx1QkFBdUIsRUFBRSxDQUFDLEVBQUUsUUFBUSxFQUFFLGVBQWUsRUFBRSxJQUFJLEVBQUUsQ0FBQyxFQUFFLENBQUM7U0FDbEc7UUFFRCxPQUFPLElBQUksQ0FBQyxxQ0FBcUMsRUFBRSxDQUFDO0lBQ3RELENBQUM7SUFFTyw0QkFBNEI7UUFDbEMsSUFBSSxDQUFDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxjQUFjLEVBQUUsRUFBRTtZQUNoRCxNQUFNLEVBQUUsUUFBUSxFQUFFLEdBQUcsSUFBSSxDQUFDLHFCQUFxQixDQUFDLHNCQUFzQixFQUFFLENBQUM7WUFFekUsT0FBTyxFQUFFLGVBQWUsRUFBRSxLQUFLLEVBQUUsdUJBQXVCLEVBQUUsQ0FBQyxFQUFFLFFBQVEsRUFBRSxlQUFlLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxDQUFDO1NBQ3BHO1FBRUQsT0FBTyxJQUFJLENBQUMscUNBQXFDLEVBQUUsQ0FBQztJQUN0RCxDQUFDO0lBRU8scUNBQXFDO1FBQzNDLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxvQkFBb0IsRUFBRSxDQUFDO1FBRWxFLE1BQU0sdUJBQXVCLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsUUFBUSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDN0QsUUFBUTtZQUNSLGVBQWUsRUFBRSxJQUFJLENBQUMsZUFBZSxDQUFDLFFBQVEsQ0FBQztTQUNoRCxDQUFDLENBQUMsQ0FBQztRQUVKLE1BQU0sZUFBZSxHQUFHLHVCQUF1QixDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxlQUFlLENBQUMsQ0FBQztRQUVsRixPQUFPLEVBQUUsdUJBQXVCLEVBQUUsZUFBZSxFQUFFLENBQUM7SUFDdEQsQ0FBQzs7NkdBekxVLGdCQUFnQjtpSEFBaEIsZ0JBQWdCOzJGQUFoQixnQkFBZ0I7a0JBRDVCLFVBQVUiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJbmplY3RhYmxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBCZWhhdmlvclN1YmplY3QsIE9ic2VydmFibGUgfSBmcm9tICdyeGpzJztcbmltcG9ydCB7IGRpc3RpbmN0VW50aWxDaGFuZ2VkIH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuaW1wb3J0IHsgQ29uZmlndXJhdGlvblByb3ZpZGVyIH0gZnJvbSAnLi4vY29uZmlnL3Byb3ZpZGVyL2NvbmZpZy5wcm92aWRlcic7XG5pbXBvcnQgeyBBdXRoUmVzdWx0IH0gZnJvbSAnLi4vZmxvd3MvY2FsbGJhY2stY29udGV4dCc7XG5pbXBvcnQgeyBMb2dnZXJTZXJ2aWNlIH0gZnJvbSAnLi4vbG9nZ2luZy9sb2dnZXIuc2VydmljZSc7XG5pbXBvcnQgeyBFdmVudFR5cGVzIH0gZnJvbSAnLi4vcHVibGljLWV2ZW50cy9ldmVudC10eXBlcyc7XG5pbXBvcnQgeyBQdWJsaWNFdmVudHNTZXJ2aWNlIH0gZnJvbSAnLi4vcHVibGljLWV2ZW50cy9wdWJsaWMtZXZlbnRzLnNlcnZpY2UnO1xuaW1wb3J0IHsgU3RvcmFnZVBlcnNpc3RlbmNlU2VydmljZSB9IGZyb20gJy4uL3N0b3JhZ2Uvc3RvcmFnZS1wZXJzaXN0ZW5jZS5zZXJ2aWNlJztcbmltcG9ydCB7IFRva2VuVmFsaWRhdGlvblNlcnZpY2UgfSBmcm9tICcuLi92YWxpZGF0aW9uL3Rva2VuLXZhbGlkYXRpb24uc2VydmljZSc7XG5pbXBvcnQgeyBBdXRoZW50aWNhdGVkUmVzdWx0IH0gZnJvbSAnLi9hdXRoLXJlc3VsdCc7XG5pbXBvcnQgeyBBdXRoU3RhdGVSZXN1bHQgfSBmcm9tICcuL2F1dGgtc3RhdGUnO1xuXG5jb25zdCBERUZBVUxUX0FVVEhSRVNVTFQgPSB7IGlzQXV0aGVudGljYXRlZDogZmFsc2UsIGFsbENvbmZpZ3NBdXRoZW50aWNhdGVkOiBbXSB9O1xuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgQXV0aFN0YXRlU2VydmljZSB7XG4gIHByaXZhdGUgYXV0aGVudGljYXRlZEludGVybmFsJCA9IG5ldyBCZWhhdmlvclN1YmplY3Q8QXV0aGVudGljYXRlZFJlc3VsdD4oREVGQVVMVF9BVVRIUkVTVUxUKTtcblxuICBnZXQgYXV0aGVudGljYXRlZCQoKTogT2JzZXJ2YWJsZTxBdXRoZW50aWNhdGVkUmVzdWx0PiB7XG4gICAgcmV0dXJuIHRoaXMuYXV0aGVudGljYXRlZEludGVybmFsJC5hc09ic2VydmFibGUoKS5waXBlKGRpc3RpbmN0VW50aWxDaGFuZ2VkKCkpO1xuICB9XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSBzdG9yYWdlUGVyc2lzdGVuY2VTZXJ2aWNlOiBTdG9yYWdlUGVyc2lzdGVuY2VTZXJ2aWNlLFxuICAgIHByaXZhdGUgbG9nZ2VyU2VydmljZTogTG9nZ2VyU2VydmljZSxcbiAgICBwcml2YXRlIHB1YmxpY0V2ZW50c1NlcnZpY2U6IFB1YmxpY0V2ZW50c1NlcnZpY2UsXG4gICAgcHJpdmF0ZSBjb25maWd1cmF0aW9uUHJvdmlkZXI6IENvbmZpZ3VyYXRpb25Qcm92aWRlcixcbiAgICBwcml2YXRlIHRva2VuVmFsaWRhdGlvblNlcnZpY2U6IFRva2VuVmFsaWRhdGlvblNlcnZpY2VcbiAgKSB7fVxuXG4gIHNldEF1dGhlbnRpY2F0ZWRBbmRGaXJlRXZlbnQoKTogdm9pZCB7XG4gICAgY29uc3QgcmVzdWx0ID0gdGhpcy5jb21wb3NlQXV0aGVudGljYXRlZFJlc3VsdCgpO1xuICAgIHRoaXMuYXV0aGVudGljYXRlZEludGVybmFsJC5uZXh0KHJlc3VsdCk7XG4gIH1cblxuICBzZXRVbmF1dGhlbnRpY2F0ZWRBbmRGaXJlRXZlbnQoY29uZmlnSWRUb1Jlc2V0OiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLnN0b3JhZ2VQZXJzaXN0ZW5jZVNlcnZpY2UucmVzZXRBdXRoU3RhdGVJblN0b3JhZ2UoY29uZmlnSWRUb1Jlc2V0KTtcblxuICAgIGNvbnN0IHJlc3VsdCA9IHRoaXMuY29tcG9zZVVuQXV0aGVudGljYXRlZFJlc3VsdCgpO1xuICAgIHRoaXMuYXV0aGVudGljYXRlZEludGVybmFsJC5uZXh0KHJlc3VsdCk7XG4gIH1cblxuICB1cGRhdGVBbmRQdWJsaXNoQXV0aFN0YXRlKGF1dGhlbnRpY2F0aW9uUmVzdWx0OiBBdXRoU3RhdGVSZXN1bHQpOiB2b2lkIHtcbiAgICB0aGlzLnB1YmxpY0V2ZW50c1NlcnZpY2UuZmlyZUV2ZW50PEF1dGhTdGF0ZVJlc3VsdD4oRXZlbnRUeXBlcy5OZXdBdXRoZW50aWNhdGlvblJlc3VsdCwgYXV0aGVudGljYXRpb25SZXN1bHQpO1xuICB9XG5cbiAgc2V0QXV0aG9yaXphdGlvbkRhdGEoYWNjZXNzVG9rZW46IHN0cmluZywgYXV0aFJlc3VsdDogQXV0aFJlc3VsdCwgY29uZmlnSWQ6IHN0cmluZyk6IHZvaWQge1xuICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1Zyhjb25maWdJZCwgYHN0b3JpbmcgdGhlIGFjY2Vzc1Rva2VuICcke2FjY2Vzc1Rva2VufSdgKTtcblxuICAgIHRoaXMuc3RvcmFnZVBlcnNpc3RlbmNlU2VydmljZS53cml0ZSgnYXV0aHpEYXRhJywgYWNjZXNzVG9rZW4sIGNvbmZpZ0lkKTtcbiAgICB0aGlzLnBlcnNpc3RBY2Nlc3NUb2tlbkV4cGlyYXRpb25UaW1lKGF1dGhSZXN1bHQsIGNvbmZpZ0lkKTtcbiAgICB0aGlzLnNldEF1dGhlbnRpY2F0ZWRBbmRGaXJlRXZlbnQoKTtcbiAgfVxuXG4gIGdldEFjY2Vzc1Rva2VuKGNvbmZpZ0lkOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIGlmICghdGhpcy5pc0F1dGhlbnRpY2F0ZWQoY29uZmlnSWQpKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBjb25zdCB0b2tlbiA9IHRoaXMuc3RvcmFnZVBlcnNpc3RlbmNlU2VydmljZS5nZXRBY2Nlc3NUb2tlbihjb25maWdJZCk7XG5cbiAgICByZXR1cm4gdGhpcy5kZWNvZGVVUklDb21wb25lbnRTYWZlbHkodG9rZW4pO1xuICB9XG5cbiAgZ2V0SWRUb2tlbihjb25maWdJZDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICBpZiAoIXRoaXMuaXNBdXRoZW50aWNhdGVkKGNvbmZpZ0lkKSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgY29uc3QgdG9rZW4gPSB0aGlzLnN0b3JhZ2VQZXJzaXN0ZW5jZVNlcnZpY2UuZ2V0SWRUb2tlbihjb25maWdJZCk7XG5cbiAgICByZXR1cm4gdGhpcy5kZWNvZGVVUklDb21wb25lbnRTYWZlbHkodG9rZW4pO1xuICB9XG5cbiAgZ2V0UmVmcmVzaFRva2VuKGNvbmZpZ0lkOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIGlmICghdGhpcy5pc0F1dGhlbnRpY2F0ZWQoY29uZmlnSWQpKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBjb25zdCB0b2tlbiA9IHRoaXMuc3RvcmFnZVBlcnNpc3RlbmNlU2VydmljZS5nZXRSZWZyZXNoVG9rZW4oY29uZmlnSWQpO1xuXG4gICAgcmV0dXJuIHRoaXMuZGVjb2RlVVJJQ29tcG9uZW50U2FmZWx5KHRva2VuKTtcbiAgfVxuXG4gIGdldEF1dGhlbnRpY2F0aW9uUmVzdWx0KGNvbmZpZ0lkPzogc3RyaW5nKTogYW55IHtcbiAgICBpZiAoIXRoaXMuaXNBdXRoZW50aWNhdGVkKGNvbmZpZ0lkKSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuc3RvcmFnZVBlcnNpc3RlbmNlU2VydmljZS5nZXRBdXRoZW50aWNhdGlvblJlc3VsdChjb25maWdJZCk7XG4gIH1cblxuICBhcmVBdXRoU3RvcmFnZVRva2Vuc1ZhbGlkKGNvbmZpZ0lkOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICBpZiAoIXRoaXMuaXNBdXRoZW50aWNhdGVkKGNvbmZpZ0lkKSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGlmICh0aGlzLmhhc0lkVG9rZW5FeHBpcmVkQW5kUmVuZXdDaGVja0lzRW5hYmxlZChjb25maWdJZCkpIHtcbiAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1Zyhjb25maWdJZCwgJ3BlcnNpc3RlZCBpZFRva2VuIGlzIGV4cGlyZWQnKTtcblxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGlmICh0aGlzLmhhc0FjY2Vzc1Rva2VuRXhwaXJlZElmRXhwaXJ5RXhpc3RzKGNvbmZpZ0lkKSkge1xuICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKGNvbmZpZ0lkLCAncGVyc2lzdGVkIGFjY2Vzc1Rva2VuIGlzIGV4cGlyZWQnKTtcblxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1Zyhjb25maWdJZCwgJ3BlcnNpc3RlZCBpZFRva2VuIGFuZCBhY2Nlc3NUb2tlbiBhcmUgdmFsaWQnKTtcblxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgaGFzSWRUb2tlbkV4cGlyZWRBbmRSZW5ld0NoZWNrSXNFbmFibGVkKGNvbmZpZ0lkOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICBjb25zdCB7IHJlbmV3VGltZUJlZm9yZVRva2VuRXhwaXJlc0luU2Vjb25kcywgZW5hYmxlSWRUb2tlbkV4cGlyZWRWYWxpZGF0aW9uSW5SZW5ldyB9ID1cbiAgICAgIHRoaXMuY29uZmlndXJhdGlvblByb3ZpZGVyLmdldE9wZW5JRENvbmZpZ3VyYXRpb24oY29uZmlnSWQpO1xuXG4gICAgaWYgKCFlbmFibGVJZFRva2VuRXhwaXJlZFZhbGlkYXRpb25JblJlbmV3KSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGNvbnN0IHRva2VuVG9DaGVjayA9IHRoaXMuc3RvcmFnZVBlcnNpc3RlbmNlU2VydmljZS5nZXRJZFRva2VuKGNvbmZpZ0lkKTtcblxuICAgIGNvbnN0IGlkVG9rZW5FeHBpcmVkID0gdGhpcy50b2tlblZhbGlkYXRpb25TZXJ2aWNlLmhhc0lkVG9rZW5FeHBpcmVkKHRva2VuVG9DaGVjaywgY29uZmlnSWQsIHJlbmV3VGltZUJlZm9yZVRva2VuRXhwaXJlc0luU2Vjb25kcyk7XG5cbiAgICBpZiAoaWRUb2tlbkV4cGlyZWQpIHtcbiAgICAgIHRoaXMucHVibGljRXZlbnRzU2VydmljZS5maXJlRXZlbnQ8Ym9vbGVhbj4oRXZlbnRUeXBlcy5JZFRva2VuRXhwaXJlZCwgaWRUb2tlbkV4cGlyZWQpO1xuICAgIH1cblxuICAgIHJldHVybiBpZFRva2VuRXhwaXJlZDtcbiAgfVxuXG4gIGhhc0FjY2Vzc1Rva2VuRXhwaXJlZElmRXhwaXJ5RXhpc3RzKGNvbmZpZ0lkOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICBjb25zdCB7IHJlbmV3VGltZUJlZm9yZVRva2VuRXhwaXJlc0luU2Vjb25kcyB9ID0gdGhpcy5jb25maWd1cmF0aW9uUHJvdmlkZXIuZ2V0T3BlbklEQ29uZmlndXJhdGlvbihjb25maWdJZCk7XG4gICAgY29uc3QgYWNjZXNzVG9rZW5FeHBpcmVzSW4gPSB0aGlzLnN0b3JhZ2VQZXJzaXN0ZW5jZVNlcnZpY2UucmVhZCgnYWNjZXNzX3Rva2VuX2V4cGlyZXNfYXQnLCBjb25maWdJZCk7XG4gICAgY29uc3QgYWNjZXNzVG9rZW5IYXNOb3RFeHBpcmVkID0gdGhpcy50b2tlblZhbGlkYXRpb25TZXJ2aWNlLnZhbGlkYXRlQWNjZXNzVG9rZW5Ob3RFeHBpcmVkKFxuICAgICAgYWNjZXNzVG9rZW5FeHBpcmVzSW4sXG4gICAgICBjb25maWdJZCxcbiAgICAgIHJlbmV3VGltZUJlZm9yZVRva2VuRXhwaXJlc0luU2Vjb25kc1xuICAgICk7XG5cbiAgICBjb25zdCBoYXNFeHBpcmVkID0gIWFjY2Vzc1Rva2VuSGFzTm90RXhwaXJlZDtcblxuICAgIGlmIChoYXNFeHBpcmVkKSB7XG4gICAgICB0aGlzLnB1YmxpY0V2ZW50c1NlcnZpY2UuZmlyZUV2ZW50PGJvb2xlYW4+KEV2ZW50VHlwZXMuVG9rZW5FeHBpcmVkLCBoYXNFeHBpcmVkKTtcbiAgICB9XG5cbiAgICByZXR1cm4gaGFzRXhwaXJlZDtcbiAgfVxuXG4gIGlzQXV0aGVudGljYXRlZChjb25maWdJZDogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuICEhdGhpcy5zdG9yYWdlUGVyc2lzdGVuY2VTZXJ2aWNlLmdldEFjY2Vzc1Rva2VuKGNvbmZpZ0lkKSAmJiAhIXRoaXMuc3RvcmFnZVBlcnNpc3RlbmNlU2VydmljZS5nZXRJZFRva2VuKGNvbmZpZ0lkKTtcbiAgfVxuXG4gIHByaXZhdGUgZGVjb2RlVVJJQ29tcG9uZW50U2FmZWx5KHRva2VuOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIGlmICh0b2tlbikge1xuICAgICAgcmV0dXJuIGRlY29kZVVSSUNvbXBvbmVudCh0b2tlbik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiAnJztcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIHBlcnNpc3RBY2Nlc3NUb2tlbkV4cGlyYXRpb25UaW1lKGF1dGhSZXN1bHQ6IGFueSwgY29uZmlnSWQ6IHN0cmluZyk6IHZvaWQge1xuICAgIGlmIChhdXRoUmVzdWx0Py5leHBpcmVzX2luKSB7XG4gICAgICBjb25zdCBhY2Nlc3NUb2tlbkV4cGlyeVRpbWUgPSBuZXcgRGF0ZShuZXcgRGF0ZSgpLnRvVVRDU3RyaW5nKCkpLnZhbHVlT2YoKSArIGF1dGhSZXN1bHQuZXhwaXJlc19pbiAqIDEwMDA7XG4gICAgICB0aGlzLnN0b3JhZ2VQZXJzaXN0ZW5jZVNlcnZpY2Uud3JpdGUoJ2FjY2Vzc190b2tlbl9leHBpcmVzX2F0JywgYWNjZXNzVG9rZW5FeHBpcnlUaW1lLCBjb25maWdJZCk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBjb21wb3NlQXV0aGVudGljYXRlZFJlc3VsdCgpOiBBdXRoZW50aWNhdGVkUmVzdWx0IHtcbiAgICBpZiAoIXRoaXMuY29uZmlndXJhdGlvblByb3ZpZGVyLmhhc01hbnlDb25maWdzKCkpIHtcbiAgICAgIGNvbnN0IHsgY29uZmlnSWQgfSA9IHRoaXMuY29uZmlndXJhdGlvblByb3ZpZGVyLmdldE9wZW5JRENvbmZpZ3VyYXRpb24oKTtcblxuICAgICAgcmV0dXJuIHsgaXNBdXRoZW50aWNhdGVkOiB0cnVlLCBhbGxDb25maWdzQXV0aGVudGljYXRlZDogW3sgY29uZmlnSWQsIGlzQXV0aGVudGljYXRlZDogdHJ1ZSB9XSB9O1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLmNoZWNrQWxsQ29uZmlnc0lmVGhleUFyZUF1dGhlbnRpY2F0ZWQoKTtcbiAgfVxuXG4gIHByaXZhdGUgY29tcG9zZVVuQXV0aGVudGljYXRlZFJlc3VsdCgpOiBBdXRoZW50aWNhdGVkUmVzdWx0IHtcbiAgICBpZiAoIXRoaXMuY29uZmlndXJhdGlvblByb3ZpZGVyLmhhc01hbnlDb25maWdzKCkpIHtcbiAgICAgIGNvbnN0IHsgY29uZmlnSWQgfSA9IHRoaXMuY29uZmlndXJhdGlvblByb3ZpZGVyLmdldE9wZW5JRENvbmZpZ3VyYXRpb24oKTtcblxuICAgICAgcmV0dXJuIHsgaXNBdXRoZW50aWNhdGVkOiBmYWxzZSwgYWxsQ29uZmlnc0F1dGhlbnRpY2F0ZWQ6IFt7IGNvbmZpZ0lkLCBpc0F1dGhlbnRpY2F0ZWQ6IGZhbHNlIH1dIH07XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuY2hlY2tBbGxDb25maWdzSWZUaGV5QXJlQXV0aGVudGljYXRlZCgpO1xuICB9XG5cbiAgcHJpdmF0ZSBjaGVja0FsbENvbmZpZ3NJZlRoZXlBcmVBdXRoZW50aWNhdGVkKCk6IEF1dGhlbnRpY2F0ZWRSZXN1bHQge1xuICAgIGNvbnN0IGNvbmZpZ3MgPSB0aGlzLmNvbmZpZ3VyYXRpb25Qcm92aWRlci5nZXRBbGxDb25maWd1cmF0aW9ucygpO1xuXG4gICAgY29uc3QgYWxsQ29uZmlnc0F1dGhlbnRpY2F0ZWQgPSBjb25maWdzLm1hcCgoeyBjb25maWdJZCB9KSA9PiAoe1xuICAgICAgY29uZmlnSWQsXG4gICAgICBpc0F1dGhlbnRpY2F0ZWQ6IHRoaXMuaXNBdXRoZW50aWNhdGVkKGNvbmZpZ0lkKSxcbiAgICB9KSk7XG5cbiAgICBjb25zdCBpc0F1dGhlbnRpY2F0ZWQgPSBhbGxDb25maWdzQXV0aGVudGljYXRlZC5ldmVyeSgoeCkgPT4gISF4LmlzQXV0aGVudGljYXRlZCk7XG5cbiAgICByZXR1cm4geyBhbGxDb25maWdzQXV0aGVudGljYXRlZCwgaXNBdXRoZW50aWNhdGVkIH07XG4gIH1cbn1cbiJdfQ==