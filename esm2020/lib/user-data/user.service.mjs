import { Injectable } from '@angular/core';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { map, retry, switchMap } from 'rxjs/operators';
import { EventTypes } from '../public-events/event-types';
import * as i0 from "@angular/core";
import * as i1 from "../api/data.service";
import * as i2 from "../storage/storage-persistence.service";
import * as i3 from "../public-events/public-events.service";
import * as i4 from "../logging/logger.service";
import * as i5 from "../utils/tokenHelper/token-helper.service";
import * as i6 from "../utils/flowHelper/flow-helper.service";
import * as i7 from "../config/provider/config.provider";
const DEFAULT_USERRESULT = { userData: null, allUserData: [] };
export class UserService {
    constructor(oidcDataService, storagePersistenceService, eventService, loggerService, tokenHelperService, flowHelper, configurationProvider) {
        this.oidcDataService = oidcDataService;
        this.storagePersistenceService = storagePersistenceService;
        this.eventService = eventService;
        this.loggerService = loggerService;
        this.tokenHelperService = tokenHelperService;
        this.flowHelper = flowHelper;
        this.configurationProvider = configurationProvider;
        this.userDataInternal$ = new BehaviorSubject(DEFAULT_USERRESULT);
    }
    get userData$() {
        return this.userDataInternal$.asObservable();
    }
    getAndPersistUserDataInStore(configId, isRenewProcess = false, idToken, decodedIdToken) {
        idToken = idToken || this.storagePersistenceService.getIdToken(configId);
        decodedIdToken = decodedIdToken || this.tokenHelperService.getPayloadFromToken(idToken, false, configId);
        const existingUserDataFromStorage = this.getUserDataFromStore(configId);
        const haveUserData = !!existingUserDataFromStorage;
        const isCurrentFlowImplicitFlowWithAccessToken = this.flowHelper.isCurrentFlowImplicitFlowWithAccessToken(configId);
        const isCurrentFlowCodeFlow = this.flowHelper.isCurrentFlowCodeFlow(configId);
        const accessToken = this.storagePersistenceService.getAccessToken(configId);
        if (!(isCurrentFlowImplicitFlowWithAccessToken || isCurrentFlowCodeFlow)) {
            this.loggerService.logDebug(configId, `authCallback idToken flow with accessToken ${accessToken}`);
            this.setUserDataToStore(decodedIdToken, configId);
            return of(decodedIdToken);
        }
        const { renewUserInfoAfterTokenRenew } = this.configurationProvider.getOpenIDConfiguration(configId);
        if (!isRenewProcess || renewUserInfoAfterTokenRenew || !haveUserData) {
            return this.getUserDataOidcFlowAndSave(decodedIdToken.sub, configId).pipe(switchMap((userData) => {
                this.loggerService.logDebug(configId, 'Received user data: ', userData);
                if (!!userData) {
                    this.loggerService.logDebug(configId, 'accessToken: ', accessToken);
                    return of(userData);
                }
                else {
                    return throwError(() => new Error('Received no user data, request failed'));
                }
            }));
        }
        return of(existingUserDataFromStorage);
    }
    getUserDataFromStore(configId) {
        return this.storagePersistenceService.read('userData', configId) || null;
    }
    publishUserDataIfExists(configId) {
        const userData = this.getUserDataFromStore(configId);
        if (userData) {
            this.fireUserDataEvent(configId, userData);
        }
    }
    setUserDataToStore(userData, configId) {
        this.storagePersistenceService.write('userData', userData, configId);
        this.fireUserDataEvent(configId, userData);
    }
    resetUserDataInStore(configId) {
        this.storagePersistenceService.remove('userData', configId);
        this.fireUserDataEvent(configId, null);
    }
    getUserDataOidcFlowAndSave(idTokenSub, configId) {
        return this.getIdentityUserData(configId).pipe(map((data) => {
            if (this.validateUserDataSubIdToken(idTokenSub, data?.sub)) {
                this.setUserDataToStore(data, configId);
                return data;
            }
            else {
                // something went wrong, user data sub does not match that from id_token
                this.loggerService.logWarning(configId, `User data sub does not match sub in id_token, resetting`);
                this.resetUserDataInStore(configId);
                return null;
            }
        }));
    }
    getIdentityUserData(configId) {
        const token = this.storagePersistenceService.getAccessToken(configId);
        const authWellKnownEndPoints = this.storagePersistenceService.read('authWellKnownEndPoints', configId);
        if (!authWellKnownEndPoints) {
            this.loggerService.logWarning(configId, 'init check session: authWellKnownEndpoints is undefined');
            return throwError(() => new Error('authWellKnownEndpoints is undefined'));
        }
        const userInfoEndpoint = authWellKnownEndPoints.userInfoEndpoint;
        if (!userInfoEndpoint) {
            this.loggerService.logError(configId, 'init check session: authWellKnownEndpoints.userinfo_endpoint is undefined; set auto_userinfo = false in config');
            return throwError(() => new Error('authWellKnownEndpoints.userinfo_endpoint is undefined'));
        }
        return this.oidcDataService.get(userInfoEndpoint, configId, token).pipe(retry(2));
    }
    validateUserDataSubIdToken(idTokenSub, userDataSub) {
        if (!idTokenSub) {
            return false;
        }
        if (!userDataSub) {
            return false;
        }
        if (idTokenSub !== userDataSub) {
            this.loggerService.logDebug('validateUserDataSubIdToken failed', idTokenSub, userDataSub);
            return false;
        }
        return true;
    }
    fireUserDataEvent(configId, passedUserData) {
        const userData = this.composeSingleOrMultipleUserDataObject(configId, passedUserData);
        this.userDataInternal$.next(userData);
        this.eventService.fireEvent(EventTypes.UserDataChanged, { configId, userData: passedUserData });
    }
    composeSingleOrMultipleUserDataObject(configId, passedUserData) {
        const hasManyConfigs = this.configurationProvider.hasManyConfigs();
        if (!hasManyConfigs) {
            return this.composeSingleUserDataResult(configId, passedUserData);
        }
        const configs = this.configurationProvider.getAllConfigurations();
        const allUserData = configs.map((config) => {
            if (this.currentConfigIsToUpdate(configId, config)) {
                return { configId: config.configId, userData: passedUserData };
            }
            const alreadySavedUserData = this.storagePersistenceService.read('userData', config.configId) || null;
            return { configId: config.configId, userData: alreadySavedUserData };
        });
        return {
            userData: null,
            allUserData,
        };
    }
    composeSingleUserDataResult(configId, userData) {
        return {
            userData,
            allUserData: [{ configId, userData }],
        };
    }
    currentConfigIsToUpdate(configId, config) {
        return config.configId === configId;
    }
}
UserService.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: UserService, deps: [{ token: i1.DataService }, { token: i2.StoragePersistenceService }, { token: i3.PublicEventsService }, { token: i4.LoggerService }, { token: i5.TokenHelperService }, { token: i6.FlowHelper }, { token: i7.ConfigurationProvider }], target: i0.ɵɵFactoryTarget.Injectable });
UserService.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: UserService });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: UserService, decorators: [{
            type: Injectable
        }], ctorParameters: function () { return [{ type: i1.DataService }, { type: i2.StoragePersistenceService }, { type: i3.PublicEventsService }, { type: i4.LoggerService }, { type: i5.TokenHelperService }, { type: i6.FlowHelper }, { type: i7.ConfigurationProvider }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlci5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvYW5ndWxhci1hdXRoLW9pZGMtY2xpZW50L3NyYy9saWIvdXNlci1kYXRhL3VzZXIuc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQzNDLE9BQU8sRUFBRSxlQUFlLEVBQWMsRUFBRSxFQUFFLFVBQVUsRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUNuRSxPQUFPLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUt2RCxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sOEJBQThCLENBQUM7Ozs7Ozs7OztBQU8xRCxNQUFNLGtCQUFrQixHQUFHLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxXQUFXLEVBQUUsRUFBRSxFQUFFLENBQUM7QUFFL0QsTUFBTSxPQUFPLFdBQVc7SUFPdEIsWUFDVSxlQUE0QixFQUM1Qix5QkFBb0QsRUFDcEQsWUFBaUMsRUFDakMsYUFBNEIsRUFDNUIsa0JBQXNDLEVBQ3RDLFVBQXNCLEVBQ3RCLHFCQUE0QztRQU41QyxvQkFBZSxHQUFmLGVBQWUsQ0FBYTtRQUM1Qiw4QkFBeUIsR0FBekIseUJBQXlCLENBQTJCO1FBQ3BELGlCQUFZLEdBQVosWUFBWSxDQUFxQjtRQUNqQyxrQkFBYSxHQUFiLGFBQWEsQ0FBZTtRQUM1Qix1QkFBa0IsR0FBbEIsa0JBQWtCLENBQW9CO1FBQ3RDLGVBQVUsR0FBVixVQUFVLENBQVk7UUFDdEIsMEJBQXFCLEdBQXJCLHFCQUFxQixDQUF1QjtRQWI5QyxzQkFBaUIsR0FBRyxJQUFJLGVBQWUsQ0FBaUIsa0JBQWtCLENBQUMsQ0FBQztJQWNqRixDQUFDO0lBWkosSUFBSSxTQUFTO1FBQ1gsT0FBTyxJQUFJLENBQUMsaUJBQWlCLENBQUMsWUFBWSxFQUFFLENB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USxFQUFFLENBQUM7U0FDdEMsQ0FBQztJQUNKLENBQUM7SUFFTyx1QkFBdUIsQ0FBQyxRQUFnQixFQUFFLE1BQTJCO1FBQzNFLE9BQU8sTUFBTSxDQUFDLFFBQVEsS0FBSyxRQUFRLENBQUM7SUFDdEMsQ0FBQzs7d0dBcExVLFdBQVc7NEdBQVgsV0FBVzsyRkFBWCxXQUFXO2tCQUR2QixVQUFVIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSW5qZWN0YWJsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgQmVoYXZpb3JTdWJqZWN0LCBPYnNlcnZhYmxlLCBvZiwgdGhyb3dFcnJvciB9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHsgbWFwLCByZXRyeSwgc3dpdGNoTWFwIH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuaW1wb3J0IHsgRGF0YVNlcnZpY2UgfSBmcm9tICcuLi9hcGkvZGF0YS5zZXJ2aWNlJztcbmltcG9ydCB7IE9wZW5JZENvbmZpZ3VyYXRpb24gfSBmcm9tICcuLi9jb25maWcvb3BlbmlkLWNvbmZpZ3VyYXRpb24nO1xuaW1wb3J0IHsgQ29uZmlndXJhdGlvblByb3ZpZGVyIH0gZnJvbSAnLi4vY29uZmlnL3Byb3ZpZGVyL2NvbmZpZy5wcm92aWRlcic7XG5pbXBvcnQgeyBMb2dnZXJTZXJ2aWNlIH0gZnJvbSAnLi4vbG9nZ2luZy9sb2dnZXIuc2VydmljZSc7XG5pbXBvcnQgeyBFdmVudFR5cGVzIH0gZnJvbSAnLi4vcHVibGljLWV2ZW50cy9ldmVudC10eXBlcyc7XG5pbXBvcnQgeyBQdWJsaWNFdmVudHNTZXJ2aWNlIH0gZnJvbSAnLi4vcHVibGljLWV2ZW50cy9wdWJsaWMtZXZlbnRzLnNlcnZpY2UnO1xuaW1wb3J0IHsgU3RvcmFnZVBlcnNpc3RlbmNlU2VydmljZSB9IGZyb20gJy4uL3N0b3JhZ2Uvc3RvcmFnZS1wZXJzaXN0ZW5jZS5zZXJ2aWNlJztcbmltcG9ydCB7IEZsb3dIZWxwZXIgfSBmcm9tICcuLi91dGlscy9mbG93SGVscGVyL2Zsb3ctaGVscGVyLnNlcnZpY2UnO1xuaW1wb3J0IHsgVG9rZW5IZWxwZXJTZXJ2aWNlIH0gZnJvbSAnLi4vdXRpbHMvdG9rZW5IZWxwZXIvdG9rZW4taGVscGVyLnNlcnZpY2UnO1xuaW1wb3J0IHsgQ29uZmlnVXNlckRhdGFSZXN1bHQsIFVzZXJEYXRhUmVzdWx0IH0gZnJvbSAnLi91c2VyZGF0YS1yZXN1bHQnO1xuXG5jb25zdCBERUZBVUxUX1VTRVJSRVNVTFQgPSB7IHVzZXJEYXRhOiBudWxsLCBhbGxVc2VyRGF0YTogW10gfTtcbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBVc2VyU2VydmljZSB7XG4gIHByaXZhdGUgdXNlckRhdGFJbnRlcm5hbCQgPSBuZXcgQmVoYXZpb3JTdWJqZWN0PFVzZXJEYXRhUmVzdWx0PihERUZBVUxUX1VTRVJSRVNVTFQpO1xuXG4gIGdldCB1c2VyRGF0YSQoKTogT2JzZXJ2YWJsZTxVc2VyRGF0YVJlc3VsdD4ge1xuICAgIHJldHVybiB0aGlzLnVzZXJEYXRhSW50ZXJuYWwkLmFzT2JzZXJ2YWJsZSgpO1xuICB9XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSBvaWRjRGF0YVNlcnZpY2U6IERhdGFTZXJ2aWNlLFxuICAgIHByaXZhdGUgc3RvcmFnZVBlcnNpc3RlbmNlU2VydmljZTogU3RvcmFnZVBlcnNpc3RlbmNlU2VydmljZSxcbiAgICBwcml2YXRlIGV2ZW50U2VydmljZTogUHVibGljRXZlbnRzU2VydmljZSxcbiAgICBwcml2YXRlIGxvZ2dlclNlcnZpY2U6IExvZ2dlclNlcnZpY2UsXG4gICAgcHJpdmF0ZSB0b2tlbkhlbHBlclNlcnZpY2U6IFRva2VuSGVscGVyU2VydmljZSxcbiAgICBwcml2YXRlIGZsb3dIZWxwZXI6IEZsb3dIZWxwZXIsXG4gICAgcHJpdmF0ZSBjb25maWd1cmF0aW9uUHJvdmlkZXI6IENvbmZpZ3VyYXRpb25Qcm92aWRlclxuICApIHt9XG5cbiAgZ2V0QW5kUGVyc2lzdFVzZXJEYXRhSW5TdG9yZShjb25maWdJZDogc3RyaW5nLCBpc1JlbmV3UHJvY2VzcyA9IGZhbHNlLCBpZFRva2VuPzogYW55LCBkZWNvZGVkSWRUb2tlbj86IGFueSk6IE9ic2VydmFibGU8YW55PiB7XG4gICAgaWRUb2tlbiA9IGlkVG9rZW4gfHwgdGhpcy5zdG9yYWdlUGVyc2lzdGVuY2VTZXJ2aWNlLmdldElkVG9rZW4oY29uZmlnSWQpO1xuICAgIGRlY29kZWRJZFRva2VuID0gZGVjb2RlZElkVG9rZW4gfHwgdGhpcy50b2tlbkhlbHBlclNlcnZpY2UuZ2V0UGF5bG9hZEZyb21Ub2tlbihpZFRva2VuLCBmYWxzZSwgY29uZmlnSWQpO1xuXG4gICAgY29uc3QgZXhpc3RpbmdVc2VyRGF0YUZyb21TdG9yYWdlID0gdGhpcy5nZXRVc2VyRGF0YUZyb21TdG9yZShjb25maWdJZCk7XG4gICAgY29uc3QgaGF2ZVVzZXJEYXRhID0gISFleGlzdGluZ1VzZXJEYXRhRnJvbVN0b3JhZ2U7XG4gICAgY29uc3QgaXNDdXJyZW50Rmxvd0ltcGxpY2l0Rmxvd1dpdGhBY2Nlc3NUb2tlbiA9IHRoaXMuZmxvd0hlbHBlci5pc0N1cnJlbnRGbG93SW1wbGljaXRGbG93V2l0aEFjY2Vzc1Rva2VuKGNvbmZpZ0lkKTtcbiAgICBjb25zdCBpc0N1cnJlbnRGbG93Q29kZUZsb3cgPSB0aGlzLmZsb3dIZWxwZXIuaXNDdXJyZW50Rmxvd0NvZGVGbG93KGNvbmZpZ0lkKTtcblxuICAgIGNvbnN0IGFjY2Vzc1Rva2VuID0gdGhpcy5zdG9yYWdlUGVyc2lzdGVuY2VTZXJ2aWNlLmdldEFjY2Vzc1Rva2VuKGNvbmZpZ0lkKTtcbiAgICBpZiAoIShpc0N1cnJlbnRGbG93SW1wbGljaXRGbG93V2l0aEFjY2Vzc1Rva2VuIHx8IGlzQ3VycmVudEZsb3dDb2RlRmxvdykpIHtcbiAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1Zyhjb25maWdJZCwgYGF1dGhDYWxsYmFjayBpZFRva2VuIGZsb3cgd2l0aCBhY2Nlc3NUb2tlbiAke2FjY2Vzc1Rva2VufWApO1xuXG4gICAgICB0aGlzLnNldFVzZXJEYXRhVG9TdG9yZShkZWNvZGVkSWRUb2tlbiwgY29uZmlnSWQpO1xuXG4gICAgICByZXR1cm4gb2YoZGVjb2RlZElkVG9rZW4pO1xuICAgIH1cblxuICAgIGNvbnN0IHsgcmVuZXdVc2VySW5mb0FmdGVyVG9rZW5SZW5ldyB9ID0gdGhpcy5jb25maWd1cmF0aW9uUHJvdmlkZXIuZ2V0T3BlbklEQ29uZmlndXJhdGlvbihjb25maWdJZCk7XG5cbiAgICBpZiAoIWlzUmVuZXdQcm9jZXNzIHx8IHJlbmV3VXNlckluZm9BZnRlclRva2VuUmVuZXcgfHwgIWhhdmVVc2VyRGF0YSkge1xuICAgICAgcmV0dXJuIHRoaXMuZ2V0VXNlckRhdGFPaWRjRmxvd0FuZFNhdmUoZGVjb2RlZElkVG9rZW4uc3ViLCBjb25maWdJZCkucGlwZShcbiAgICAgICAgc3dpdGNoTWFwKCh1c2VyRGF0YSkgPT4ge1xuICAgICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1Zyhjb25maWdJZCwgJ1JlY2VpdmVkIHVzZXIgZGF0YTogJywgdXNlckRhdGEpO1xuICAgICAgICAgIGlmICghIXVzZXJEYXRhKSB7XG4gICAgICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoY29uZmlnSWQsICdhY2Nlc3NUb2tlbjogJywgYWNjZXNzVG9rZW4pO1xuXG4gICAgICAgICAgICByZXR1cm4gb2YodXNlckRhdGEpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gdGhyb3dFcnJvcigoKSA9PiBuZXcgRXJyb3IoJ1JlY2VpdmVkIG5vIHVzZXIgZGF0YSwgcmVxdWVzdCBmYWlsZWQnKSk7XG4gICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgKTtcbiAgICB9XG5cbiAgICByZXR1cm4gb2YoZXhpc3RpbmdVc2VyRGF0YUZyb21TdG9yYWdlKTtcbiAgfVxuXG4gIGdldFVzZXJEYXRhRnJvbVN0b3JlKGNvbmZpZ0lkOiBzdHJpbmcpOiBhbnkge1xuICAgIHJldHVybiB0aGlzLnN0b3JhZ2VQZXJzaXN0ZW5jZVNlcnZpY2UucmVhZCgndXNlckRhdGEnLCBjb25maWdJZCkgfHwgbnVsbDtcbiAgfVxuXG4gIHB1Ymxpc2hVc2VyRGF0YUlmRXhpc3RzKGNvbmZpZ0lkOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBjb25zdCB1c2VyRGF0YSA9IHRoaXMuZ2V0VXNlckRhdGFGcm9tU3RvcmUoY29uZmlnSWQpO1xuXG4gICAgaWYgKHVzZXJEYXRhKSB7XG4gICAgICB0aGlzLmZpcmVVc2VyRGF0YUV2ZW50KGNvbmZpZ0lkLCB1c2VyRGF0YSk7XG4gICAgfVxuICB9XG5cbiAgc2V0VXNlckRhdGFUb1N0b3JlKHVzZXJEYXRhOiBhbnksIGNvbmZpZ0lkOiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLnN0b3JhZ2VQZXJzaXN0ZW5jZVNlcnZpY2Uud3JpdGUoJ3VzZXJEYXRhJywgdXNlckRhdGEsIGNvbmZpZ0lkKTtcbiAgICB0aGlzLmZpcmVVc2VyRGF0YUV2ZW50KGNvbmZpZ0lkLCB1c2VyRGF0YSk7XG4gIH1cblxuICByZXNldFVzZXJEYXRhSW5TdG9yZShjb25maWdJZDogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5zdG9yYWdlUGVyc2lzdGVuY2VTZXJ2aWNlLnJlbW92ZSgndXNlckRhdGEnLCBjb25maWdJZCk7XG4gICAgdGhpcy5maXJlVXNlckRhdGFFdmVudChjb25maWdJZCwgbnVsbCk7XG4gIH1cblxuICBwcml2YXRlIGdldFVzZXJEYXRhT2lkY0Zsb3dBbmRTYXZlKGlkVG9rZW5TdWI6IGFueSwgY29uZmlnSWQ6IHN0cmluZyk6IE9ic2VydmFibGU8YW55PiB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0SWRlbnRpdHlVc2VyRGF0YShjb25maWdJZCkucGlwZShcbiAgICAgIG1hcCgoZGF0YTogYW55KSA9PiB7XG4gICAgICAgIGlmICh0aGlzLnZhbGlkYXRlVXNlckRhdGFTdWJJZFRva2VuKGlkVG9rZW5TdWIsIGRhdGE/LnN1YikpIHtcbiAgICAgICAgICB0aGlzLnNldFVzZXJEYXRhVG9TdG9yZShkYXRhLCBjb25maWdJZCk7XG5cbiAgICAgICAgICByZXR1cm4gZGF0YTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBzb21ldGhpbmcgd2VudCB3cm9uZywgdXNlciBkYXRhIHN1YiBkb2VzIG5vdCBtYXRjaCB0aGF0IGZyb20gaWRfdG9rZW5cbiAgICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nV2FybmluZyhjb25maWdJZCwgYFVzZXIgZGF0YSBzdWIgZG9lcyBub3QgbWF0Y2ggc3ViIGluIGlkX3Rva2VuLCByZXNldHRpbmdgKTtcbiAgICAgICAgICB0aGlzLnJlc2V0VXNlckRhdGFJblN0b3JlKGNvbmZpZ0lkKTtcblxuICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICB9KVxuICAgICk7XG4gIH1cblxuICBwcml2YXRlIGdldElkZW50aXR5VXNlckRhdGEoY29uZmlnSWQ6IHN0cmluZyk6IE9ic2VydmFibGU8YW55PiB7XG4gICAgY29uc3QgdG9rZW4gPSB0aGlzLnN0b3JhZ2VQZXJzaXN0ZW5jZVNlcnZpY2UuZ2V0QWNjZXNzVG9rZW4oY29uZmlnSWQpO1xuXG4gICAgY29uc3QgYXV0aFdlbGxLbm93bkVuZFBvaW50cyA9IHRoaXMuc3RvcmFnZVBlcnNpc3RlbmNlU2VydmljZS5yZWFkKCdhdXRoV2VsbEtub3duRW5kUG9pbnRzJywgY29uZmlnSWQpO1xuXG4gICAgaWYgKCFhdXRoV2VsbEtub3duRW5kUG9pbnRzKSB7XG4gICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nV2FybmluZyhjb25maWdJZCwgJ2luaXQgY2hlY2sgc2Vzc2lvbjogYXV0aFdlbGxLbm93bkVuZHBvaW50cyBpcyB1bmRlZmluZWQnKTtcblxuICAgICAgcmV0dXJuIHRocm93RXJyb3IoKCkgPT4gbmV3IEVycm9yKCdhdXRoV2VsbEtub3duRW5kcG9pbnRzIGlzIHVuZGVmaW5lZCcpKTtcbiAgICB9XG5cbiAgICBjb25zdCB1c2VySW5mb0VuZHBvaW50ID0gYXV0aFdlbGxLbm93bkVuZFBvaW50cy51c2VySW5mb0VuZHBvaW50O1xuXG4gICAgaWYgKCF1c2VySW5mb0VuZHBvaW50KSB7XG4gICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRXJyb3IoXG4gICAgICAgIGNvbmZpZ0lkLFxuICAgICAgICAnaW5pdCBjaGVjayBzZXNzaW9uOiBhdXRoV2VsbEtub3duRW5kcG9pbnRzLnVzZXJpbmZvX2VuZHBvaW50IGlzIHVuZGVmaW5lZDsgc2V0IGF1dG9fdXNlcmluZm8gPSBmYWxzZSBpbiBjb25maWcnXG4gICAgICApO1xuXG4gICAgICByZXR1cm4gdGhyb3dFcnJvcigoKSA9PiBuZXcgRXJyb3IoJ2F1dGhXZWxsS25vd25FbmRwb2ludHMudXNlcmluZm9fZW5kcG9pbnQgaXMgdW5kZWZpbmVkJykpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLm9pZGNEYXRhU2VydmljZS5nZXQodXNlckluZm9FbmRwb2ludCwgY29uZmlnSWQsIHRva2VuKS5waXBlKHJldHJ5KDIpKTtcbiAgfVxuXG4gIHByaXZhdGUgdmFsaWRhdGVVc2VyRGF0YVN1YklkVG9rZW4oaWRUb2tlblN1YjogYW55LCB1c2VyRGF0YVN1YjogYW55KTogYm9vbGVhbiB7XG4gICAgaWYgKCFpZFRva2VuU3ViKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgaWYgKCF1c2VyRGF0YVN1Yikge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGlmICgoaWRUb2tlblN1YiBhcyBzdHJpbmcpICE9PSAodXNlckRhdGFTdWIgYXMgc3RyaW5nKSkge1xuICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKCd2YWxpZGF0ZVVzZXJEYXRhU3ViSWRUb2tlbiBmYWlsZWQnLCBpZFRva2VuU3ViLCB1c2VyRGF0YVN1Yik7XG5cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIHByaXZhdGUgZmlyZVVzZXJEYXRhRXZlbnQoY29uZmlnSWQ6IHN0cmluZywgcGFzc2VkVXNlckRhdGE6IGFueSk6IHZvaWQge1xuICAgIGNvbnN0IHVzZXJEYXRhID0gdGhpcy5jb21wb3NlU2luZ2xlT3JNdWx0aXBsZVVzZXJEYXRhT2JqZWN0KGNvbmZpZ0lkLCBwYXNzZWRVc2VyRGF0YSk7XG5cbiAgICB0aGlzLnVzZXJEYXRhSW50ZXJuYWwkLm5leHQodXNlckRhdGEpO1xuXG4gICAgdGhpcy5ldmVudFNlcnZpY2UuZmlyZUV2ZW50KEV2ZW50VHlwZXMuVXNlckRhdGFDaGFuZ2VkLCB7IGNvbmZpZ0lkLCB1c2VyRGF0YTogcGFzc2VkVXNlckRhdGEgfSk7XG4gIH1cblxuICBwcml2YXRlIGNvbXBvc2VTaW5nbGVPck11bHRpcGxlVXNlckRhdGFPYmplY3QoY29uZmlnSWQ6IHN0cmluZywgcGFzc2VkVXNlckRhdGE6IGFueSk6IFVzZXJEYXRhUmVzdWx0IHtcbiAgICBjb25zdCBoYXNNYW55Q29uZmlncyA9IHRoaXMuY29uZmlndXJhdGlvblByb3ZpZGVyLmhhc01hbnlDb25maWdzKCk7XG5cbiAgICBpZiAoIWhhc01hbnlDb25maWdzKSB7XG4gICAgICByZXR1cm4gdGhpcy5jb21wb3NlU2luZ2xlVXNlckRhdGFSZXN1bHQoY29uZmlnSWQsIHBhc3NlZFVzZXJEYXRhKTtcbiAgICB9XG5cbiAgICBjb25zdCBjb25maWdzID0gdGhpcy5jb25maWd1cmF0aW9uUHJvdmlkZXIuZ2V0QWxsQ29uZmlndXJhdGlvbnMoKTtcblxuICAgIGNvbnN0IGFsbFVzZXJEYXRhOiBDb25maWdVc2VyRGF0YVJlc3VsdFtdID0gY29uZmlncy5tYXAoKGNvbmZpZykgPT4ge1xuICAgICAgaWYgKHRoaXMuY3VycmVudENvbmZpZ0lzVG9VcGRhdGUoY29uZmlnSWQsIGNvbmZpZykpIHtcbiAgICAgICAgcmV0dXJuIHsgY29uZmlnSWQ6IGNvbmZpZy5jb25maWdJZCwgdXNlckRhdGE6IHBhc3NlZFVzZXJEYXRhIH07XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGFscmVhZHlTYXZlZFVzZXJEYXRhID0gdGhpcy5zdG9yYWdlUGVyc2lzdGVuY2VTZXJ2aWNlLnJlYWQoJ3VzZXJEYXRhJywgY29uZmlnLmNvbmZpZ0lkKSB8fCBudWxsO1xuXG4gICAgICByZXR1cm4geyBjb25maWdJZDogY29uZmlnLmNvbmZpZ0lkLCB1c2VyRGF0YTogYWxyZWFkeVNhdmVkVXNlckRhdGEgfTtcbiAgICB9KTtcblxuICAgIHJldHVybiB7XG4gICAgICB1c2VyRGF0YTogbnVsbCxcbiAgICAgIGFsbFVzZXJEYXRhLFxuICAgIH07XG4gIH1cblxuICBwcml2YXRlIGNvbXBvc2VTaW5nbGVVc2VyRGF0YVJlc3VsdChjb25maWdJZDogc3RyaW5nLCB1c2VyRGF0YTogYW55KTogVXNlckRhdGFSZXN1bHQge1xuICAgIHJldHVybiB7XG4gICAgICB1c2VyRGF0YSxcbiAgICAgIGFsbFVzZXJEYXRhOiBbeyBjb25maWdJZCwgdXNlckRhdGEgfV0sXG4gICAgfTtcbiAgfVxuXG4gIHByaXZhdGUgY3VycmVudENvbmZpZ0lzVG9VcGRhdGUoY29uZmlnSWQ6IHN0cmluZywgY29uZmlnOiBPcGVuSWRDb25maWd1cmF0aW9uKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGNvbmZpZy5jb25maWdJZCA9PT0gY29uZmlnSWQ7XG4gIH1cbn1cbiJdfQ==