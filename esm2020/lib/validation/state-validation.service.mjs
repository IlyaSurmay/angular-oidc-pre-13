import { Injectable } from '@angular/core';
import { StateValidationResult } from './state-validation-result';
import { ValidationResult } from './validation-result';
import * as i0 from "@angular/core";
import * as i1 from "../storage/storage-persistence.service";
import * as i2 from "./token-validation.service";
import * as i3 from "../utils/tokenHelper/token-helper.service";
import * as i4 from "../logging/logger.service";
import * as i5 from "../config/provider/config.provider";
import * as i6 from "../utils/equality/equality.service";
import * as i7 from "../utils/flowHelper/flow-helper.service";
export class StateValidationService {
    constructor(storagePersistenceService, tokenValidationService, tokenHelperService, loggerService, configurationProvider, equalityService, flowHelper) {
        this.storagePersistenceService = storagePersistenceService;
        this.tokenValidationService = tokenValidationService;
        this.tokenHelperService = tokenHelperService;
        this.loggerService = loggerService;
        this.configurationProvider = configurationProvider;
        this.equalityService = equalityService;
        this.flowHelper = flowHelper;
    }
    getValidatedStateResult(callbackContext, configId) {
        if (!callbackContext) {
            return new StateValidationResult('', '', false, {});
        }
        if (callbackContext.authResult.error) {
            return new StateValidationResult('', '', false, {});
        }
        return this.validateState(callbackContext, configId);
    }
    validateState(callbackContext, configId) {
        const toReturn = new StateValidationResult();
        const authStateControl = this.storagePersistenceService.read('authStateControl', configId);
        if (!this.tokenValidationService.validateStateFromHashCallback(callbackContext.authResult.state, authStateControl, configId)) {
            this.loggerService.logWarning(configId, 'authCallback incorrect state');
            toReturn.state = ValidationResult.StatesDoNotMatch;
            this.handleUnsuccessfulValidation(configId);
            return toReturn;
        }
        const isCurrentFlowImplicitFlowWithAccessToken = this.flowHelper.isCurrentFlowImplicitFlowWithAccessToken(configId);
        const isCurrentFlowCodeFlow = this.flowHelper.isCurrentFlowCodeFlow(configId);
        if (isCurrentFlowImplicitFlowWithAccessToken || isCurrentFlowCodeFlow) {
            toReturn.accessToken = callbackContext.authResult.access_token;
        }
        if (callbackContext.authResult.id_token) {
            const { clientId, issValidationOff, maxIdTokenIatOffsetAllowedInSeconds, disableIatOffsetValidation, ignoreNonceAfterRefresh } = this.configurationProvider.getOpenIDConfiguration(configId);
            toReturn.idToken = callbackContext.authResult.id_token;
            toReturn.decodedIdToken = this.tokenHelperService.getPayloadFromToken(toReturn.idToken, false, configId);
            if (!this.tokenValidationService.validateSignatureIdToken(toReturn.idToken, callbackContext.jwtKeys, configId)) {
                this.loggerService.logDebug(configId, 'authCallback Signature validation failed id_token');
                toReturn.state = ValidationResult.SignatureFailed;
                this.handleUnsuccessfulValidation(configId);
                return toReturn;
            }
            const authNonce = this.storagePersistenceService.read('authNonce', configId);
            if (!this.tokenValidationService.validateIdTokenNonce(toReturn.decodedIdToken, authNonce, ignoreNonceAfterRefresh, configId)) {
                this.loggerService.logWarning(configId, 'authCallback incorrect nonce, did you call the checkAuth() method multiple times?');
                toReturn.state = ValidationResult.IncorrectNonce;
                this.handleUnsuccessfulValidation(configId);
                return toReturn;
            }
            if (!this.tokenValidationService.validateRequiredIdToken(toReturn.decodedIdToken, configId)) {
                this.loggerService.logDebug(configId, 'authCallback Validation, one of the REQUIRED properties missing from id_token');
                toReturn.state = ValidationResult.RequiredPropertyMissing;
                this.handleUnsuccessfulValidation(configId);
                return toReturn;
            }
            if (!this.tokenValidationService.validateIdTokenIatMaxOffset(toReturn.decodedIdToken, maxIdTokenIatOffsetAllowedInSeconds, disableIatOffsetValidation, configId)) {
                this.loggerService.logWarning(configId, 'authCallback Validation, iat rejected id_token was issued too far away from the current time');
                toReturn.state = ValidationResult.MaxOffsetExpired;
                this.handleUnsuccessfulValidation(configId);
                return toReturn;
            }
            const authWellKnownEndPoints = this.storagePersistenceService.read('authWellKnownEndPoints', configId);
            if (authWellKnownEndPoints) {
                if (issValidationOff) {
                    this.loggerService.logDebug(configId, 'iss validation is turned off, this is not recommended!');
                }
                else if (!issValidationOff &&
                    !this.tokenValidationService.validateIdTokenIss(toReturn.decodedIdToken, authWellKnownEndPoints.issuer, configId)) {
                    this.loggerService.logWarning(configId, 'authCallback incorrect iss does not match authWellKnownEndpoints issuer');
                    toReturn.state = ValidationResult.IssDoesNotMatchIssuer;
                    this.handleUnsuccessfulValidation(configId);
                    return toReturn;
                }
            }
            else {
                this.loggerService.logWarning(configId, 'authWellKnownEndpoints is undefined');
                toReturn.state = ValidationResult.NoAuthWellKnownEndPoints;
                this.handleUnsuccessfulValidation(configId);
                return toReturn;
            }
            if (!this.tokenValidationService.validateIdTokenAud(toReturn.decodedIdToken, clientId, configId)) {
                this.loggerService.logWarning(configId, 'authCallback incorrect aud');
                toReturn.state = ValidationResult.IncorrectAud;
                this.handleUnsuccessfulValidation(configId);
                return toReturn;
            }
            if (!this.tokenValidationService.validateIdTokenAzpExistsIfMoreThanOneAud(toReturn.decodedIdToken)) {
                this.loggerService.logWarning(configId, 'authCallback missing azp');
                toReturn.state = ValidationResult.IncorrectAzp;
                this.handleUnsuccessfulValidation(configId);
                return toReturn;
            }
            if (!this.tokenValidationService.validateIdTokenAzpValid(toReturn.decodedIdToken, clientId)) {
                this.loggerService.logWarning(configId, 'authCallback incorrect azp');
                toReturn.state = ValidationResult.IncorrectAzp;
                this.handleUnsuccessfulValidation(configId);
                return toReturn;
            }
            if (!this.isIdTokenAfterRefreshTokenRequestValid(callbackContext, toReturn.decodedIdToken, configId)) {
                this.loggerService.logWarning(configId, 'authCallback pre, post id_token claims do not match in refresh');
                toReturn.state = ValidationResult.IncorrectIdTokenClaimsAfterRefresh;
                this.handleUnsuccessfulValidation(configId);
                return toReturn;
            }
            if (!this.tokenValidationService.validateIdTokenExpNotExpired(toReturn.decodedIdToken, configId)) {
                this.loggerService.logWarning(configId, 'authCallback id token expired');
                toReturn.state = ValidationResult.TokenExpired;
                this.handleUnsuccessfulValidation(configId);
                return toReturn;
            }
        }
        else {
            this.loggerService.logDebug(configId, 'No id_token found, skipping id_token validation');
        }
        // flow id_token
        if (!isCurrentFlowImplicitFlowWithAccessToken && !isCurrentFlowCodeFlow) {
            toReturn.authResponseIsValid = true;
            toReturn.state = ValidationResult.Ok;
            this.handleSuccessfulValidation(configId);
            this.handleUnsuccessfulValidation(configId);
            return toReturn;
        }
        // only do check if id_token returned, no always the case when using refresh tokens
        if (callbackContext.authResult.id_token) {
            const idTokenHeader = this.tokenHelperService.getHeaderFromToken(toReturn.idToken, false, configId);
            // The at_hash is optional for the code flow
            if (isCurrentFlowCodeFlow && !toReturn.decodedIdToken.at_hash) {
                this.loggerService.logDebug(configId, 'Code Flow active, and no at_hash in the id_token, skipping check!');
            }
            else if (!this.tokenValidationService.validateIdTokenAtHash(toReturn.accessToken, toReturn.decodedIdToken.at_hash, idTokenHeader.alg, // 'RSA256'
            configId) ||
                !toReturn.accessToken) {
                this.loggerService.logWarning(configId, 'authCallback incorrect at_hash');
                toReturn.state = ValidationResult.IncorrectAtHash;
                this.handleUnsuccessfulValidation(configId);
                return toReturn;
            }
        }
        toReturn.authResponseIsValid = true;
        toReturn.state = ValidationResult.Ok;
        this.handleSuccessfulValidation(configId);
        return toReturn;
    }
    isIdTokenAfterRefreshTokenRequestValid(callbackContext, newIdToken, configId) {
        const { useRefreshToken, disableRefreshIdTokenAuthTimeValidation } = this.configurationProvider.getOpenIDConfiguration(configId);
        if (!useRefreshToken) {
            return true;
        }
        if (!callbackContext.existingIdToken) {
            return true;
        }
        const decodedIdToken = this.tokenHelperService.getPayloadFromToken(callbackContext.existingIdToken, false, configId);
        // Upon successful validation of the Refresh Token, the response body is the Token Response of Section 3.1.3.3
        // except that it might not contain an id_token.
        // If an ID Token is returned as a result of a token refresh request, the following requirements apply:
        // its iss Claim Value MUST be the same as in the ID Token issued when the original authentication occurred,
        if (decodedIdToken.iss !== newIdToken.iss) {
            this.loggerService.logDebug(configId, `iss do not match: ${decodedIdToken.iss} ${newIdToken.iss}`);
            return false;
        }
        // its azp Claim Value MUST be the same as in the ID Token issued when the original authentication occurred;
        //   if no azp Claim was present in the original ID Token, one MUST NOT be present in the new ID Token, and
        // otherwise, the same rules apply as apply when issuing an ID Token at the time of the original authentication.
        if (decodedIdToken.azp !== newIdToken.azp) {
            this.loggerService.logDebug(configId, `azp do not match: ${decodedIdToken.azp} ${newIdToken.azp}`);
            return false;
        }
        // its sub Claim Value MUST be the same as in the ID Token issued when the original authentication occurred,
        if (decodedIdToken.sub !== newIdToken.sub) {
            this.loggerService.logDebug(configId, `sub do not match: ${decodedIdToken.sub} ${newIdToken.sub}`);
            return false;
        }
        // its aud Claim Value MUST be the same as in the ID Token issued when the original authentication occurred,
        if (!this.equalityService.isStringEqualOrNonOrderedArrayEqual(decodedIdToken?.aud, newIdToken?.aud)) {
            this.loggerService.logDebug(configId, `aud in new id_token is not valid: '${decodedIdToken?.aud}' '${newIdToken.aud}'`);
            return false;
        }
        if (disableRefreshIdTokenAuthTimeValidation) {
            return true;
        }
        // its iat Claim MUST represent the time that the new ID Token is issued,
        // if the ID Token contains an auth_time Claim, its value MUST represent the time of the original authentication
        // - not the time that the new ID token is issued,
        if (decodedIdToken.auth_time !== newIdToken.auth_time) {
            this.loggerService.logDebug(configId, `auth_time do not match: ${decodedIdToken.auth_time} ${newIdToken.auth_time}`);
            return false;
        }
        return true;
    }
    handleSuccessfulValidation(configId) {
        const { autoCleanStateAfterAuthentication } = this.configurationProvider.getOpenIDConfiguration(configId);
        this.storagePersistenceService.write('authNonce', null, configId);
        if (autoCleanStateAfterAuthentication) {
            this.storagePersistenceService.write('authStateControl', '', configId);
        }
        this.loggerService.logDebug(configId, 'authCallback token(s) validated, continue');
    }
    handleUnsuccessfulValidation(configId) {
        const { autoCleanStateAfterAuthentication } = this.configurationProvider.getOpenIDConfiguration(configId);
        this.storagePersistenceService.write('authNonce', null, configId);
        if (autoCleanStateAfterAuthentication) {
            this.storagePersistenceService.write('authStateControl', '', configId);
        }
        this.loggerService.logDebug(configId, 'authCallback token(s) invalid');
    }
}
StateValidationService.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: StateValidationService, deps: [{ token: i1.StoragePersistenceService }, { token: i2.TokenValidationService }, { token: i3.TokenHelperService }, { token: i4.LoggerService }, { token: i5.ConfigurationProvider }, { token: i6.EqualityService }, { token: i7.FlowHelper }], target: i0.ɵɵFactoryTarget.Injectable });
StateValidationService.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: StateValidationService });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: StateValidationService, decorators: [{
            type: Injectable
        }], ctorParameters: function () { return [{ type: i1.StoragePersistenceService }, { type: i2.TokenValidationService }, { type: i3.TokenHelperService }, { type: i4.LoggerService }, { type: i5.ConfigurationProvider }, { type: i6.EqualityService }, { type: i7.FlowHelper }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhdGUtdmFsaWRhdGlvbi5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvYW5ndWxhci1hdXRoLW9pZGMtY2xpZW50L3NyYy9saWIvdmFsaWRhdGlvbi9zdGF0ZS12YWxpZGF0aW9uLnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQVEzQyxPQUFPLEVBQUUscUJBQXFCLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQztBQUVsRSxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQzs7Ozs7Ozs7O0FBR3ZELE1BQU0sT0FBTyxzQkFBc0I7SUFDakMsWUFDVSx5QkFBb0QsRUFDcEQsc0JBQThDLEVBQzlDLGtCQUFzQyxFQUN0QyxhQUE0QixFQUM1QixxQkFBNEMsRUFDNUMsZUFBZ0MsRUFDaEMsVUFBc0I7UUFOdEIsOEJBQXlCLEdBQXpCLHlCQUF5QixDQUEyQjtRQUNwRCwyQkFBc0IsR0FBdEIsc0JBQXNCLENBQXdCO1FBQzlDLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBb0I7UUFDdEMsa0JBQWEsR0FBYixhQUFhLENBQWU7UUFDNUIsMEJBQXFCLEdBQXJCLHFCQUFxQixDQUF1QjtRQUM1QyxvQkFBZSxHQUFmLGVBQWUsQ0FBaUI7UUFDaEMsZUFBVSxHQUFWLFVBQVUsQ0FBWTtJQUM3QixDQUFDO0lBRUosdUJBQXVCLENBQUMsZUFBZ0MsRUFBRSxRQUFnQjtRQUN4RSxJQUFJLENBQUMsZUFBZSxFQUFFO1lBQ3BCLE9BQU8sSUFBSSxxQkFBcUIsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEtBQUssRUFBRSxFQUFFLENBQUMsQ0FBQztTQUNyRDtRQUVELElBQUksZUFBZSxDQUFDLFVBQVUsQ0FBQyxLQUFLLEVBQUU7WUFDcEMsT0FBTyxJQUFJLHFCQUFxQixDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUs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LEtBQUssQ0FBQyxXQUFXLEVBQUUsSUFBSSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBRWxFLElBQUksaUNBQWlDLEVBQUU7WUFDckMsSUFBSSxDQUFDLHlCQUF5QixDQUFDLEtBQUssQ0FBQyxrQkFBa0IsRUFBRSxFQUFFLEVBQUUsUUFBUSxDQUFDLENBQUM7U0FDeEU7UUFDRCxJQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxRQUFRLEVBQUUsMkNBQTJDLENBQUMsQ0FBQztJQUNyRixDQUFDO0lBRU8sNEJBQTRCLENBQUMsUUFBZ0I7UUFDbkQsTUFBTSxFQUFFLGlDQUFpQyxFQUFFLEdBQUcsSUFBSSxDQUFDLHFCQUFxQixDQUFDLHNCQUFzQixDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQzFHLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxLQUFLLENBQUMsV0FBVyxFQUFFLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQztRQUVsRSxJQUFJLGlDQUFpQyxFQUFFO1lBQ3JDLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxLQUFLLENBQUMsa0JBQWtCLEVBQUUsRUFBRSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1NBQ3hFO1FBQ0QsSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFLCtCQUErQixDQUFDLENBQUM7SUFDekUsQ0FBQzs7bUhBeFJVLHNCQUFzQjt1SEFBdEIsc0JBQXNCOzJGQUF0QixzQkFBc0I7a0JBRGxDLFVBQVUiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJbmplY3RhYmxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBDb25maWd1cmF0aW9uUHJvdmlkZXIgfSBmcm9tICcuLi9jb25maWcvcHJvdmlkZXIvY29uZmlnLnByb3ZpZGVyJztcbmltcG9ydCB7IENhbGxiYWNrQ29udGV4dCB9IGZyb20gJy4uL2Zsb3dzL2NhbGxiYWNrLWNvbnRleHQnO1xuaW1wb3J0IHsgTG9nZ2VyU2VydmljZSB9IGZyb20gJy4uL2xvZ2dpbmcvbG9nZ2VyLnNlcnZpY2UnO1xuaW1wb3J0IHsgU3RvcmFnZVBlcnNpc3RlbmNlU2VydmljZSB9IGZyb20gJy4uL3N0b3JhZ2Uvc3RvcmFnZS1wZXJzaXN0ZW5jZS5zZXJ2aWNlJztcbmltcG9ydCB7IEVxdWFsaXR5U2VydmljZSB9IGZyb20gJy4uL3V0aWxzL2VxdWFsaXR5L2VxdWFsaXR5LnNlcnZpY2UnO1xuaW1wb3J0IHsgRmxvd0hlbHBlciB9IGZyb20gJy4uL3V0aWxzL2Zsb3dIZWxwZXIvZmxvdy1oZWxwZXIuc2VydmljZSc7XG5pbXBvcnQgeyBUb2tlbkhlbHBlclNlcnZpY2UgfSBmcm9tICcuLi91dGlscy90b2tlbkhlbHBlci90b2tlbi1oZWxwZXIuc2VydmljZSc7XG5pbXBvcnQgeyBTdGF0ZVZhbGlkYXRpb25SZXN1bHQgfSBmcm9tICcuL3N0YXRlLXZhbGlkYXRpb24tcmVzdWx0JztcbmltcG9ydCB7IFRva2VuVmFsaWRhdGlvblNlcnZpY2UgfSBmcm9tICcuL3Rva2VuLXZhbGlkYXRpb24uc2VydmljZSc7XG5pbXBvcnQgeyBWYWxpZGF0aW9uUmVzdWx0IH0gZnJvbSAnLi92YWxpZGF0aW9uLXJlc3VsdCc7XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBTdGF0ZVZhbGlkYXRpb25TZXJ2aWNlIHtcbiAgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSBzdG9yYWdlUGVyc2lzdGVuY2VTZXJ2aWNlOiBTdG9yYWdlUGVyc2lzdGVuY2VTZXJ2aWNlLFxuICAgIHByaXZhdGUgdG9rZW5WYWxpZGF0aW9uU2VydmljZTogVG9rZW5WYWxpZGF0aW9uU2VydmljZSxcbiAgICBwcml2YXRlIHRva2VuSGVscGVyU2VydmljZTogVG9rZW5IZWxwZXJTZXJ2aWNlLFxuICAgIHByaXZhdGUgbG9nZ2VyU2VydmljZTogTG9nZ2VyU2VydmljZSxcbiAgICBwcml2YXRlIGNvbmZpZ3VyYXRpb25Qcm92aWRlcjogQ29uZmlndXJhdGlvblByb3ZpZGVyLFxuICAgIHByaXZhdGUgZXF1YWxpdHlTZXJ2aWNlOiBFcXVhbGl0eVNlcnZpY2UsXG4gICAgcHJpdmF0ZSBmbG93SGVscGVyOiBGbG93SGVscGVyXG4gICkge31cblxuICBnZXRWYWxpZGF0ZWRTdGF0ZVJlc3VsdChjYWxsYmFja0NvbnRleHQ6IENhbGxiYWNrQ29udGV4dCwgY29uZmlnSWQ6IHN0cmluZyk6IFN0YXRlVmFsaWRhdGlvblJlc3VsdCB7XG4gICAgaWYgKCFjYWxsYmFja0NvbnRleHQpIHtcbiAgICAgIHJldHVybiBuZXcgU3RhdGVWYWxpZGF0aW9uUmVzdWx0KCcnLCAnJywgZmFsc2UsIHt9KTtcbiAgICB9XG5cbiAgICBpZiAoY2FsbGJhY2tDb250ZXh0LmF1dGhSZXN1bHQuZXJyb3IpIHtcbiAgICAgIHJldHVybiBuZXcgU3RhdGVWYWxpZGF0aW9uUmVzdWx0KCcnLCAnJywgZmFsc2UsIHt9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy52YWxpZGF0ZVN0YXRlKGNhbGxiYWNrQ29udGV4dCwgY29uZmlnSWQpO1xuICB9XG5cbiAgdmFsaWRhdGVTdGF0ZShjYWxsYmFja0NvbnRleHQ6IGFueSwgY29uZmlnSWQ6IHN0cmluZyk6IFN0YXRlVmFsaWRhdGlvblJlc3VsdCB7XG4gICAgY29uc3QgdG9SZXR1cm4gPSBuZXcgU3RhdGVWYWxpZGF0aW9uUmVzdWx0KCk7XG4gICAgY29uc3QgYXV0aFN0YXRlQ29udHJvbCA9IHRoaXMuc3RvcmFnZVBlcnNpc3RlbmNlU2VydmljZS5yZWFkKCdhdXRoU3RhdGVDb250cm9sJywgY29uZmlnSWQpO1xuXG4gICAgaWYgKCF0aGlzLnRva2VuVmFsaWRhdGlvblNlcnZpY2UudmFsaWRhdGVTdGF0ZUZyb21IYXNoQ2FsbGJhY2soY2FsbGJhY2tDb250ZXh0LmF1dGhSZXN1bHQuc3RhdGUsIGF1dGhTdGF0ZUNvbnRyb2wsIGNvbmZpZ0lkKSkge1xuICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ1dhcm5pbmcoY29uZmlnSWQsICdhdXRoQ2FsbGJhY2sgaW5jb3JyZWN0IHN0YXRlJyk7XG4gICAgICB0b1JldHVybi5zdGF0ZSA9IFZhbGlkYXRpb25SZXN1bHQuU3RhdGVzRG9Ob3RNYXRjaDtcbiAgICAgIHRoaXMuaGFuZGxlVW5zdWNjZXNzZnVsVmFsaWRhdGlvbihjb25maWdJZCk7XG5cbiAgICAgIHJldHVybiB0b1JldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBpc0N1cnJlbnRGbG93SW1wbGljaXRGbG93V2l0aEFjY2Vzc1Rva2VuID0gdGhpcy5mbG93SGVscGVyLmlzQ3VycmVudEZsb3dJbXBsaWNpdEZsb3dXaXRoQWNjZXNzVG9rZW4oY29uZmlnSWQpO1xuICAgIGNvbnN0IGlzQ3VycmVudEZsb3dDb2RlRmxvdyA9IHRoaXMuZmxvd0hlbHBlci5pc0N1cnJlbnRGbG93Q29kZUZsb3coY29uZmlnSWQpO1xuXG4gICAgaWYgKGlzQ3VycmVudEZsb3dJbXBsaWNpdEZsb3dXaXRoQWNjZXNzVG9rZW4gfHwgaXNDdXJyZW50Rmxvd0NvZGVGbG93KSB7XG4gICAgICB0b1JldHVybi5hY2Nlc3NUb2tlbiA9IGNhbGxiYWNrQ29udGV4dC5hdXRoUmVzdWx0LmFjY2Vzc190b2tlbjtcbiAgICB9XG5cbiAgICBpZiAoY2FsbGJhY2tDb250ZXh0LmF1dGhSZXN1bHQuaWRfdG9rZW4pIHtcbiAgICAgIGNvbnN0IHsgY2xpZW50SWQsIGlzc1ZhbGlkYXRpb25PZmYsIG1heElkVG9rZW5JYXRPZmZzZXRBbGxvd2VkSW5TZWNvbmRzLCBkaXNhYmxlSWF0T2Zmc2V0VmFsaWRhdGlvbiwgaWdub3JlTm9uY2VBZnRlclJlZnJlc2ggfSA9XG4gICAgICAgIHRoaXMuY29uZmlndXJhdGlvblByb3ZpZGVyLmdldE9wZW5JRENvbmZpZ3VyYXRpb24oY29uZmlnSWQpO1xuXG4gICAgICB0b1JldHVybi5pZFRva2VuID0gY2FsbGJhY2tDb250ZXh0LmF1dGhSZXN1bHQuaWRfdG9rZW47XG5cbiAgICAgIHRvUmV0dXJuLmRlY29kZWRJZFRva2VuID0gdGhpcy50b2tlbkhlbHBlclNlcnZpY2UuZ2V0UGF5bG9hZEZyb21Ub2tlbih0b1JldHVybi5pZFRva2VuLCBmYWxzZSwgY29uZmlnSWQpO1xuXG4gICAgICBpZiAoIXRoaXMudG9rZW5WYWxpZGF0aW9uU2VydmljZS52YWxpZGF0ZVNpZ25hdHVyZUlkVG9rZW4odG9SZXR1cm4uaWRUb2tlbiwgY2FsbGJhY2tDb250ZXh0Lmp3dEtleXMsIGNvbmZpZ0lkKSkge1xuICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoY29uZmlnSWQsICdhdXRoQ2FsbGJhY2sgU2lnbmF0dXJlIHZhbGlkYXRpb24gZmFpbGVkIGlkX3Rva2VuJyk7XG4gICAgICAgIHRvUmV0dXJuLnN0YXRlID0gVmFsaWRhdGlvblJlc3VsdC5TaWduYXR1cmVGYWlsZWQ7XG4gICAgICAgIHRoaXMuaGFuZGxlVW5zdWNjZXNzZnVsVmFsaWRhdGlvbihjb25maWdJZCk7XG5cbiAgICAgICAgcmV0dXJuIHRvUmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBhdXRoTm9uY2UgPSB0aGlzLnN0b3JhZ2VQZXJzaXN0ZW5jZVNlcnZpY2UucmVhZCgnYXV0aE5vbmNlJywgY29uZmlnSWQpO1xuXG4gICAgICBpZiAoIXRoaXMudG9rZW5WYWxpZGF0aW9uU2VydmljZS52YWxpZGF0ZUlkVG9rZW5Ob25jZSh0b1JldHVybi5kZWNvZGVkSWRUb2tlbiwgYXV0aE5vbmNlLCBpZ25vcmVOb25jZUFmdGVyUmVmcmVzaCwgY29uZmlnSWQpKSB7XG4gICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dXYXJuaW5nKGNvbmZpZ0lkLCAnYXV0aENhbGxiYWNrIGluY29ycmVjdCBub25jZSwgZGlkIHlvdSBjYWxsIHRoZSBjaGVja0F1dGgoKSBtZXRob2QgbXVsdGlwbGUgdGltZXM/Jyk7XG4gICAgICAgIHRvUmV0dXJuLnN0YXRlID0gVmFsaWRhdGlvblJlc3VsdC5JbmNvcnJlY3ROb25jZTtcbiAgICAgICAgdGhpcy5oYW5kbGVVbnN1Y2Nlc3NmdWxWYWxpZGF0aW9uKGNvbmZpZ0lkKTtcblxuICAgICAgICByZXR1cm4gdG9SZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGlmICghdGhpcy50b2tlblZhbGlkYXRpb25TZXJ2aWNlLnZhbGlkYXRlUmVxdWlyZWRJZFRva2VuKHRvUmV0dXJuLmRlY29kZWRJZFRva2VuLCBjb25maWdJZCkpIHtcbiAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKGNvbmZpZ0lkLCAnYXV0aENhbGxiYWNrIFZhbGlkYXRpb24sIG9uZSBvZiB0aGUgUkVRVUlSRUQgcHJvcGVydGllcyBtaXNzaW5nIGZyb20gaWRfdG9rZW4nKTtcbiAgICAgICAgdG9SZXR1cm4uc3RhdGUgPSBWYWxpZGF0aW9uUmVzdWx0LlJlcXVpcmVkUHJvcGVydHlNaXNzaW5nO1xuICAgICAgICB0aGlzLmhhbmRsZVVuc3VjY2Vzc2Z1bFZhbGlkYXRpb24oY29uZmlnSWQpO1xuXG4gICAgICAgIHJldHVybiB0b1JldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYgKFxuICAgICAgICAhdGhpcy50b2tlblZhbGlkYXRpb25TZXJ2aWNlLnZhbGlkYXRlSWRUb2tlbklhdE1heE9mZnNldChcbiAgICAgICAgICB0b1JldHVybi5kZWNvZGVkSWRUb2tlbixcbiAgICAgICAgICBtYXhJZFRva2VuSWF0T2Zmc2V0QWxsb3dlZEluU2Vjb25kcyxcbiAgICAgICAgICBkaXNhYmxlSWF0T2Zmc2V0VmFsaWRhdGlvbixcbiAgICAgICAgICBjb25maWdJZFxuICAgICAgICApXG4gICAgICApIHtcbiAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ1dhcm5pbmcoXG4gICAgICAgICAgY29uZmlnSWQsXG4gICAgICAgICAgJ2F1dGhDYWxsYmFjayBWYWxpZGF0aW9uLCBpYXQgcmVqZWN0ZWQgaWRfdG9rZW4gd2FzIGlzc3VlZCB0b28gZmFyIGF3YXkgZnJvbSB0aGUgY3VycmVudCB0aW1lJ1xuICAgICAgICApO1xuICAgICAgICB0b1JldHVybi5zdGF0ZSA9IFZhbGlkYXRpb25SZXN1bHQuTWF4T2Zmc2V0RXhwaXJlZDtcbiAgICAgICAgdGhpcy5oYW5kbGVVbnN1Y2Nlc3NmdWxWYWxpZGF0aW9uKGNvbmZpZ0lkKTtcblxuICAgICAgICByZXR1cm4gdG9SZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGF1dGhXZWxsS25vd25FbmRQb2ludHMgPSB0aGlzLnN0b3JhZ2VQZXJzaXN0ZW5jZVNlcnZpY2UucmVhZCgnYXV0aFdlbGxLbm93bkVuZFBvaW50cycsIGNvbmZpZ0lkKTtcblxuICAgICAgaWYgKGF1dGhXZWxsS25vd25FbmRQb2ludHMpIHtcbiAgICAgICAgaWYgKGlzc1ZhbGlkYXRpb25PZmYpIHtcbiAgICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoY29uZmlnSWQsICdpc3MgdmFsaWRhdGlvbiBpcyB0dXJuZWQgb2ZmLCB0aGlzIGlzIG5vdCByZWNvbW1lbmRlZCEnKTtcbiAgICAgICAgfSBlbHNlIGlmIChcbiAgICAgICAgICAhaXNzVmFsaWRhdGlvbk9mZiAmJlxuICAgICAgICAgICF0aGlzLnRva2VuVmFsaWRhdGlvblNlcnZpY2UudmFsaWRhdGVJZFRva2VuSXNzKHRvUmV0dXJuLmRlY29kZWRJZFRva2VuLCBhdXRoV2VsbEtub3duRW5kUG9pbnRzLmlzc3VlciwgY29uZmlnSWQpXG4gICAgICAgICkge1xuICAgICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dXYXJuaW5nKGNvbmZpZ0lkLCAnYXV0aENhbGxiYWNrIGluY29ycmVjdCBpc3MgZG9lcyBub3QgbWF0Y2ggYXV0aFdlbGxLbm93bkVuZHBvaW50cyBpc3N1ZXInKTtcbiAgICAgICAgICB0b1JldHVybi5zdGF0ZSA9IFZhbGlkYXRpb25SZXN1bHQuSXNzRG9lc05vdE1hdGNoSXNzdWVyO1xuICAgICAgICAgIHRoaXMuaGFuZGxlVW5zdWNjZXNzZnVsVmFsaWRhdGlvbihjb25maWdJZCk7XG5cbiAgICAgICAgICByZXR1cm4gdG9SZXR1cm47XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dXYXJuaW5nKGNvbmZpZ0lkLCAnYXV0aFdlbGxLbm93bkVuZHBvaW50cyBpcyB1bmRlZmluZWQnKTtcbiAgICAgICAgdG9SZXR1cm4uc3RhdGUgPSBWYWxpZGF0aW9uUmVzdWx0Lk5vQXV0aFdlbGxLbm93bkVuZFBvaW50cztcbiAgICAgICAgdGhpcy5oYW5kbGVVbnN1Y2Nlc3NmdWxWYWxpZGF0aW9uKGNvbmZpZ0lkKTtcblxuICAgICAgICByZXR1cm4gdG9SZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGlmICghdGhpcy50b2tlblZhbGlkYXRpb25TZXJ2aWNlLnZhbGlkYXRlSWRUb2tlbkF1ZCh0b1JldHVybi5kZWNvZGVkSWRUb2tlbiwgY2xpZW50SWQsIGNvbmZpZ0lkKSkge1xuICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nV2FybmluZyhjb25maWdJZCwgJ2F1dGhDYWxsYmFjayBpbmNvcnJlY3QgYXVkJyk7XG4gICAgICAgIHRvUmV0dXJuLnN0YXRlID0gVmFsaWRhdGlvblJlc3VsdC5JbmNvcnJlY3RBdWQ7XG4gICAgICAgIHRoaXMuaGFuZGxlVW5zdWNjZXNzZnVsVmFsaWRhdGlvbihjb25maWdJZCk7XG5cbiAgICAgICAgcmV0dXJuIHRvUmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpZiAoIXRoaXMudG9rZW5WYWxpZGF0aW9uU2VydmljZS52YWxpZGF0ZUlkVG9rZW5BenBFeGlzdHNJZk1vcmVUaGFuT25lQXVkKHRvUmV0dXJuLmRlY29kZWRJZFRva2VuKSkge1xuICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nV2FybmluZyhjb25maWdJZCwgJ2F1dGhDYWxsYmFjayBtaXNzaW5nIGF6cCcpO1xuICAgICAgICB0b1JldHVybi5zdGF0ZSA9IFZhbGlkYXRpb25SZXN1bHQuSW5jb3JyZWN0QXpwO1xuICAgICAgICB0aGlzLmhhbmRsZVVuc3VjY2Vzc2Z1bFZhbGlkYXRpb24oY29uZmlnSWQpO1xuXG4gICAgICAgIHJldHVybiB0b1JldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYgKCF0aGlzLnRva2VuVmFsaWRhdGlvblNlcnZpY2UudmFsaWRhdGVJZFRva2VuQXpwVmFsaWQodG9SZXR1cm4uZGVjb2RlZElkVG9rZW4sIGNsaWVudElkKSkge1xuICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nV2FybmluZyhjb25maWdJZCwgJ2F1dGhDYWxsYmFjayBpbmNvcnJlY3QgYXpwJyk7XG4gICAgICAgIHRvUmV0dXJuLnN0YXRlID0gVmFsaWRhdGlvblJlc3VsdC5JbmNvcnJlY3RBenA7XG4gICAgICAgIHRoaXMuaGFuZGxlVW5zdWNjZXNzZnVsVmFsaWRhdGlvbihjb25maWdJZCk7XG5cbiAgICAgICAgcmV0dXJuIHRvUmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpZiAoIXRoaXMuaXNJZFRva2VuQWZ0ZXJSZWZyZXNoVG9rZW5SZXF1ZXN0VmFsaWQoY2FsbGJhY2tDb250ZXh0LCB0b1JldHVybi5kZWNvZGVkSWRUb2tlbiwgY29uZmlnSWQpKSB7XG4gICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dXYXJuaW5nKGNvbmZpZ0lkLCAnYXV0aENhbGxiYWNrIHByZSwgcG9zdCBpZF90b2tlbiBjbGFpbXMgZG8gbm90IG1hdGNoIGluIHJlZnJlc2gnKTtcbiAgICAgICAgdG9SZXR1cm4uc3RhdGUgPSBWYWxpZGF0aW9uUmVzdWx0LkluY29ycmVjdElkVG9rZW5DbGFpbXNBZnRlclJlZnJlc2g7XG4gICAgICAgIHRoaXMuaGFuZGxlVW5zdWNjZXNzZnVsVmFsaWRhdGlvbihjb25maWdJZCk7XG5cbiAgICAgICAgcmV0dXJuIHRvUmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpZiAoIXRoaXMudG9rZW5WYWxpZGF0aW9uU2VydmljZS52YWxpZGF0ZUlkVG9rZW5FeHBOb3RFeHBpcmVkKHRvUmV0dXJuLmRlY29kZWRJZFRva2VuLCBjb25maWdJZCkpIHtcbiAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ1dhcm5pbmcoY29uZmlnSWQsICdhdXRoQ2FsbGJhY2sgaWQgdG9rZW4gZXhwaXJlZCcpO1xuICAgICAgICB0b1JldHVybi5zdGF0ZSA9IFZhbGlkYXRpb25SZXN1bHQuVG9rZW5FeHBpcmVkO1xuICAgICAgICB0aGlzLmhhbmRsZVVuc3VjY2Vzc2Z1bFZhbGlkYXRpb24oY29uZmlnSWQpO1xuXG4gICAgICAgIHJldHVybiB0b1JldHVybjtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKGNvbmZpZ0lkLCAnTm8gaWRfdG9rZW4gZm91bmQsIHNraXBwaW5nIGlkX3Rva2VuIHZhbGlkYXRpb24nKTtcbiAgICB9XG5cbiAgICAvLyBmbG93IGlkX3Rva2VuXG4gICAgaWYgKCFpc0N1cnJlbnRGbG93SW1wbGljaXRGbG93V2l0aEFjY2Vzc1Rva2VuICYmICFpc0N1cnJlbnRGbG93Q29kZUZsb3cpIHtcbiAgICAgIHRvUmV0dXJuLmF1dGhSZXNwb25zZUlzVmFsaWQgPSB0cnVlO1xuICAgICAgdG9SZXR1cm4uc3RhdGUgPSBWYWxpZGF0aW9uUmVzdWx0Lk9rO1xuICAgICAgdGhpcy5oYW5kbGVTdWNjZXNzZnVsVmFsaWRhdGlvbihjb25maWdJZCk7XG4gICAgICB0aGlzLmhhbmRsZVVuc3VjY2Vzc2Z1bFZhbGlkYXRpb24oY29uZmlnSWQpO1xuXG4gICAgICByZXR1cm4gdG9SZXR1cm47XG4gICAgfVxuXG4gICAgLy8gb25seSBkbyBjaGVjayBpZiBpZF90b2tlbiByZXR1cm5lZCwgbm8gYWx3YXlzIHRoZSBjYXNlIHdoZW4gdXNpbmcgcmVmcmVzaCB0b2tlbnNcbiAgICBpZiAoY2FsbGJhY2tDb250ZXh0LmF1dGhSZXN1bHQuaWRfdG9rZW4pIHtcbiAgICAgIGNvbnN0IGlkVG9rZW5IZWFkZXIgPSB0aGlzLnRva2VuSGVscGVyU2VydmljZS5nZXRIZWFkZXJGcm9tVG9rZW4odG9SZXR1cm4uaWRUb2tlbiwgZmFsc2UsIGNvbmZpZ0lkKTtcblxuICAgICAgLy8gVGhlIGF0X2hhc2ggaXMgb3B0aW9uYWwgZm9yIHRoZSBjb2RlIGZsb3dcbiAgICAgIGlmIChpc0N1cnJlbnRGbG93Q29kZUZsb3cgJiYgISh0b1JldHVybi5kZWNvZGVkSWRUb2tlbi5hdF9oYXNoIGFzIHN0cmluZykpIHtcbiAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKGNvbmZpZ0lkLCAnQ29kZSBGbG93IGFjdGl2ZSwgYW5kIG5vIGF0X2hhc2ggaW4gdGhlIGlkX3Rva2VuLCBza2lwcGluZyBjaGVjayEnKTtcbiAgICAgIH0gZWxzZSBpZiAoXG4gICAgICAgICF0aGlzLnRva2VuVmFsaWRhdGlvblNlcnZpY2UudmFsaWRhdGVJZFRva2VuQXRIYXNoKFxuICAgICAgICAgIHRvUmV0dXJuLmFjY2Vzc1Rva2VuLFxuICAgICAgICAgIHRvUmV0dXJuLmRlY29kZWRJZFRva2VuLmF0X2hhc2gsXG4gICAgICAgICAgaWRUb2tlbkhlYWRlci5hbGcsIC8vICdSU0EyNTYnXG4gICAgICAgICAgY29uZmlnSWRcbiAgICAgICAgKSB8fFxuICAgICAgICAhdG9SZXR1cm4uYWNjZXNzVG9rZW5cbiAgICAgICkge1xuICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nV2FybmluZyhjb25maWdJZCwgJ2F1dGhDYWxsYmFjayBpbmNvcnJlY3QgYXRfaGFzaCcpO1xuICAgICAgICB0b1JldHVybi5zdGF0ZSA9IFZhbGlkYXRpb25SZXN1bHQuSW5jb3JyZWN0QXRIYXNoO1xuICAgICAgICB0aGlzLmhhbmRsZVVuc3VjY2Vzc2Z1bFZhbGlkYXRpb24oY29uZmlnSWQpO1xuXG4gICAgICAgIHJldHVybiB0b1JldHVybjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0b1JldHVybi5hdXRoUmVzcG9uc2VJc1ZhbGlkID0gdHJ1ZTtcbiAgICB0b1JldHVybi5zdGF0ZSA9IFZhbGlkYXRpb25SZXN1bHQuT2s7XG4gICAgdGhpcy5oYW5kbGVTdWNjZXNzZnVsVmFsaWRhdGlvbihjb25maWdJZCk7XG5cbiAgICByZXR1cm4gdG9SZXR1cm47XG4gIH1cblxuICBwcml2YXRlIGlzSWRUb2tlbkFmdGVyUmVmcmVzaFRva2VuUmVxdWVzdFZhbGlkKGNhbGxiYWNrQ29udGV4dDogQ2FsbGJhY2tDb250ZXh0LCBuZXdJZFRva2VuOiBhbnksIGNvbmZpZ0lkOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICBjb25zdCB7IHVzZVJlZnJlc2hUb2tlbiwgZGlzYWJsZVJlZnJlc2hJZFRva2VuQXV0aFRpbWVWYWxpZGF0aW9uIH0gPSB0aGlzLmNvbmZpZ3VyYXRpb25Qcm92aWRlci5nZXRPcGVuSURDb25maWd1cmF0aW9uKGNvbmZpZ0lkKTtcbiAgICBpZiAoIXVzZVJlZnJlc2hUb2tlbikge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgaWYgKCFjYWxsYmFja0NvbnRleHQuZXhpc3RpbmdJZFRva2VuKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICBjb25zdCBkZWNvZGVkSWRUb2tlbiA9IHRoaXMudG9rZW5IZWxwZXJTZXJ2aWNlLmdldFBheWxvYWRGcm9tVG9rZW4oY2FsbGJhY2tDb250ZXh0LmV4aXN0aW5nSWRUb2tlbiwgZmFsc2UsIGNvbmZpZ0lkKTtcblxuICAgIC8vIFVwb24gc3VjY2Vzc2Z1bCB2YWxpZGF0aW9uIG9mIHRoZSBSZWZyZXNoIFRva2VuLCB0aGUgcmVzcG9uc2UgYm9keSBpcyB0aGUgVG9rZW4gUmVzcG9uc2Ugb2YgU2VjdGlvbiAzLjEuMy4zXG4gICAgLy8gZXhjZXB0IHRoYXQgaXQgbWlnaHQgbm90IGNvbnRhaW4gYW4gaWRfdG9rZW4uXG5cbiAgICAvLyBJZiBhbiBJRCBUb2tlbiBpcyByZXR1cm5lZCBhcyBhIHJlc3VsdCBvZiBhIHRva2VuIHJlZnJlc2ggcmVxdWVzdCwgdGhlIGZvbGxvd2luZyByZXF1aXJlbWVudHMgYXBwbHk6XG5cbiAgICAvLyBpdHMgaXNzIENsYWltIFZhbHVlIE1VU1QgYmUgdGhlIHNhbWUgYXMgaW4gdGhlIElEIFRva2VuIGlzc3VlZCB3aGVuIHRoZSBvcmlnaW5hbCBhdXRoZW50aWNhdGlvbiBvY2N1cnJlZCxcbiAgICBpZiAoZGVjb2RlZElkVG9rZW4uaXNzICE9PSBuZXdJZFRva2VuLmlzcykge1xuICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKGNvbmZpZ0lkLCBgaXNzIGRvIG5vdCBtYXRjaDogJHtkZWNvZGVkSWRUb2tlbi5pc3N9ICR7bmV3SWRUb2tlbi5pc3N9YCk7XG5cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgLy8gaXRzIGF6cCBDbGFpbSBWYWx1ZSBNVVNUIGJlIHRoZSBzYW1lIGFzIGluIHRoZSBJRCBUb2tlbiBpc3N1ZWQgd2hlbiB0aGUgb3JpZ2luYWwgYXV0aGVudGljYXRpb24gb2NjdXJyZWQ7XG4gICAgLy8gICBpZiBubyBhenAgQ2xhaW0gd2FzIHByZXNlbnQgaW4gdGhlIG9yaWdpbmFsIElEIFRva2VuLCBvbmUgTVVTVCBOT1QgYmUgcHJlc2VudCBpbiB0aGUgbmV3IElEIFRva2VuLCBhbmRcbiAgICAvLyBvdGhlcndpc2UsIHRoZSBzYW1lIHJ1bGVzIGFwcGx5IGFzIGFwcGx5IHdoZW4gaXNzdWluZyBhbiBJRCBUb2tlbiBhdCB0aGUgdGltZSBvZiB0aGUgb3JpZ2luYWwgYXV0aGVudGljYXRpb24uXG4gICAgaWYgKGRlY29kZWRJZFRva2VuLmF6cCAhPT0gbmV3SWRUb2tlbi5henApIHtcbiAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1Zyhjb25maWdJZCwgYGF6cCBkbyBub3QgbWF0Y2g6ICR7ZGVjb2RlZElkVG9rZW4uYXpwfSAke25ld0lkVG9rZW4uYXpwfWApO1xuXG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIC8vIGl0cyBzdWIgQ2xhaW0gVmFsdWUgTVVTVCBiZSB0aGUgc2FtZSBhcyBpbiB0aGUgSUQgVG9rZW4gaXNzdWVkIHdoZW4gdGhlIG9yaWdpbmFsIGF1dGhlbnRpY2F0aW9uIG9jY3VycmVkLFxuICAgIGlmIChkZWNvZGVkSWRUb2tlbi5zdWIgIT09IG5ld0lkVG9rZW4uc3ViKSB7XG4gICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoY29uZmlnSWQsIGBzdWIgZG8gbm90IG1hdGNoOiAke2RlY29kZWRJZFRva2VuLnN1Yn0gJHtuZXdJZFRva2VuLnN1Yn1gKTtcblxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIC8vIGl0cyBhdWQgQ2xhaW0gVmFsdWUgTVVTVCBiZSB0aGUgc2FtZSBhcyBpbiB0aGUgSUQgVG9rZW4gaXNzdWVkIHdoZW4gdGhlIG9yaWdpbmFsIGF1dGhlbnRpY2F0aW9uIG9jY3VycmVkLFxuICAgIGlmICghdGhpcy5lcXVhbGl0eVNlcnZpY2UuaXNTdHJpbmdFcXVhbE9yTm9uT3JkZXJlZEFycmF5RXF1YWwoZGVjb2RlZElkVG9rZW4/LmF1ZCwgbmV3SWRUb2tlbj8uYXVkKSkge1xuICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKGNvbmZpZ0lkLCBgYXVkIGluIG5ldyBpZF90b2tlbiBpcyBub3QgdmFsaWQ6ICcke2RlY29kZWRJZFRva2VuPy5hdWR9JyAnJHtuZXdJZFRva2VuLmF1ZH0nYCk7XG5cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBpZiAoZGlzYWJsZVJlZnJlc2hJZFRva2VuQXV0aFRpbWVWYWxpZGF0aW9uKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICAvLyBpdHMgaWF0IENsYWltIE1VU1QgcmVwcmVzZW50IHRoZSB0aW1lIHRoYXQgdGhlIG5ldyBJRCBUb2tlbiBpcyBpc3N1ZWQsXG4gICAgLy8gaWYgdGhlIElEIFRva2VuIGNvbnRhaW5zIGFuIGF1dGhfdGltZSBDbGFpbSwgaXRzIHZhbHVlIE1VU1QgcmVwcmVzZW50IHRoZSB0aW1lIG9mIHRoZSBvcmlnaW5hbCBhdXRoZW50aWNhdGlvblxuICAgIC8vIC0gbm90IHRoZSB0aW1lIHRoYXQgdGhlIG5ldyBJRCB0b2tlbiBpcyBpc3N1ZWQsXG4gICAgaWYgKGRlY29kZWRJZFRva2VuLmF1dGhfdGltZSAhPT0gbmV3SWRUb2tlbi5hdXRoX3RpbWUpIHtcbiAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1Zyhjb25maWdJZCwgYGF1dGhfdGltZSBkbyBub3QgbWF0Y2g6ICR7ZGVjb2RlZElkVG9rZW4uYXV0aF90aW1lfSAke25ld0lkVG9rZW4uYXV0aF90aW1lfWApO1xuXG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICBwcml2YXRlIGhhbmRsZVN1Y2Nlc3NmdWxWYWxpZGF0aW9uKGNvbmZpZ0lkOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBjb25zdCB7IGF1dG9DbGVhblN0YXRlQWZ0ZXJBdXRoZW50aWNhdGlvbiB9ID0gdGhpcy5jb25maWd1cmF0aW9uUHJvdmlkZXIuZ2V0T3BlbklEQ29uZmlndXJhdGlvbihjb25maWdJZCk7XG4gICAgdGhpcy5zdG9yYWdlUGVyc2lzdGVuY2VTZXJ2aWNlLndyaXRlKCdhdXRoTm9uY2UnLCBudWxsLCBjb25maWdJZCk7XG5cbiAgICBpZiAoYXV0b0NsZWFuU3RhdGVBZnRlckF1dGhlbnRpY2F0aW9uKSB7XG4gICAgICB0aGlzLnN0b3JhZ2VQZXJzaXN0ZW5jZVNlcnZpY2Uud3JpdGUoJ2F1dGhTdGF0ZUNvbnRyb2wnLCAnJywgY29uZmlnSWQpO1xuICAgIH1cbiAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoY29uZmlnSWQsICdhdXRoQ2FsbGJhY2sgdG9rZW4ocykgdmFsaWRhdGVkLCBjb250aW51ZScpO1xuICB9XG5cbiAgcHJpdmF0ZSBoYW5kbGVVbnN1Y2Nlc3NmdWxWYWxpZGF0aW9uKGNvbmZpZ0lkOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBjb25zdCB7IGF1dG9DbGVhblN0YXRlQWZ0ZXJBdXRoZW50aWNhdGlvbiB9ID0gdGhpcy5jb25maWd1cmF0aW9uUHJvdmlkZXIuZ2V0T3BlbklEQ29uZmlndXJhdGlvbihjb25maWdJZCk7XG4gICAgdGhpcy5zdG9yYWdlUGVyc2lzdGVuY2VTZXJ2aWNlLndyaXRlKCdhdXRoTm9uY2UnLCBudWxsLCBjb25maWdJZCk7XG5cbiAgICBpZiAoYXV0b0NsZWFuU3RhdGVBZnRlckF1dGhlbnRpY2F0aW9uKSB7XG4gICAgICB0aGlzLnN0b3JhZ2VQZXJzaXN0ZW5jZVNlcnZpY2Uud3JpdGUoJ2F1dGhTdGF0ZUNvbnRyb2wnLCAnJywgY29uZmlnSWQpO1xuICAgIH1cbiAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoY29uZmlnSWQsICdhdXRoQ2FsbGJhY2sgdG9rZW4ocykgaW52YWxpZCcpO1xuICB9XG59XG4iXX0=