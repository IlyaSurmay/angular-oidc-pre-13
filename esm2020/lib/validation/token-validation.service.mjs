import { Injectable } from '@angular/core';
import { KEYUTIL, KJUR } from 'jsrsasign-reduced';
import * as i0 from "@angular/core";
import * as i1 from "../utils/tokenHelper/token-helper.service";
import * as i2 from "../logging/logger.service";
import * as i3 from "./jsrsasign-reduced.service";
// http://openid.net/specs/openid-connect-implicit-1_0.html
// id_token
// id_token C1: The Issuer Identifier for the OpenID Provider (which is typically obtained during Discovery)
// MUST exactly match the value of the iss (issuer) Claim.
//
// id_token C2: The Client MUST validate that the aud (audience) Claim contains its client_id value registered at the Issuer identified
// by the iss (issuer) Claim as an audience.The ID Token MUST be rejected if the ID Token does not list the Client as a valid audience,
// or if it contains additional audiences not trusted by the Client.
//
// id_token C3: If the ID Token contains multiple audiences, the Client SHOULD verify that an azp Claim is present.
//
// id_token C4: If an azp (authorized party) Claim is present, the Client SHOULD verify that its client_id is the Claim Value.
//
// id_token C5: The Client MUST validate the signature of the ID Token according to JWS [JWS] using the algorithm specified in the
// alg Header Parameter of the JOSE Header.The Client MUST use the keys provided by the Issuer.
//
// id_token C6: The alg value SHOULD be RS256. Validation of tokens using other signing algorithms is described in the OpenID Connect
// Core 1.0
// [OpenID.Core] specification.
//
// id_token C7: The current time MUST be before the time represented by the exp Claim (possibly allowing for some small leeway to account
// for clock skew).
//
// id_token C8: The iat Claim can be used to reject tokens that were issued too far away from the current time,
// limiting the amount of time that nonces need to be stored to prevent attacks.The acceptable range is Client specific.
//
// id_token C9: The value of the nonce Claim MUST be checked to verify that it is the same value as the one that was sent
// in the Authentication Request.The Client SHOULD check the nonce value for replay attacks.The precise method for detecting replay attacks
// is Client specific.
//
// id_token C10: If the acr Claim was requested, the Client SHOULD check that the asserted Claim Value is appropriate.
// The meaning and processing of acr Claim Values is out of scope for this document.
//
// id_token C11: When a max_age request is made, the Client SHOULD check the auth_time Claim value and request re- authentication
// if it determines too much time has elapsed since the last End- User authentication.
// Access Token Validation
// access_token C1: Hash the octets of the ASCII representation of the access_token with the hash algorithm specified in JWA[JWA]
// for the alg Header Parameter of the ID Token's JOSE Header. For instance, if the alg is RS256, the hash algorithm used is SHA-256.
// access_token C2: Take the left- most half of the hash and base64url- encode it.
// access_token C3: The value of at_hash in the ID Token MUST match the value produced in the previous step if at_hash is present
// in the ID Token.
export class TokenValidationService {
    constructor(tokenHelperService, loggerService, jsrsAsignReducedService) {
        this.tokenHelperService = tokenHelperService;
        this.loggerService = loggerService;
        this.jsrsAsignReducedService = jsrsAsignReducedService;
        this.keyAlgorithms = ['HS256', 'HS384', 'HS512', 'RS256', 'RS384', 'RS512', 'ES256', 'ES384', 'PS256', 'PS384', 'PS512'];
    }
    // id_token C7: The current time MUST be before the time represented by the exp Claim
    // (possibly allowing for some small leeway to account for clock skew).
    hasIdTokenExpired(token, configId, offsetSeconds) {
        const decoded = this.tokenHelperService.getPayloadFromToken(token, false, configId);
        return !this.validateIdTokenExpNotExpired(decoded, configId, offsetSeconds);
    }
    // id_token C7: The current time MUST be before the time represented by the exp Claim
    // (possibly allowing for some small leeway to account for clock skew).
    validateIdTokenExpNotExpired(decodedIdToken, configId, offsetSeconds) {
        const tokenExpirationDate = this.tokenHelperService.getTokenExpirationDate(decodedIdToken);
        offsetSeconds = offsetSeconds || 0;
        if (!tokenExpirationDate) {
            return false;
        }
        const tokenExpirationValue = tokenExpirationDate.valueOf();
        const nowWithOffset = new Date(new Date().toUTCString()).valueOf() + offsetSeconds * 1000;
        const tokenNotExpired = tokenExpirationValue > nowWithOffset;
        this.loggerService.logDebug(configId, `Has idToken expired: ${!tokenNotExpired} --> expires in ${this.millisToMinutesAndSeconds(tokenExpirationValue - nowWithOffset)} , ${new Date(tokenExpirationValue).toLocaleTimeString()} > ${new Date(nowWithOffset).toLocaleTimeString()}`);
        // Token not expired?
        return tokenNotExpired;
    }
    validateAccessTokenNotExpired(accessTokenExpiresAt, configId, offsetSeconds) {
        // value is optional, so if it does not exist, then it has not expired
        if (!accessTokenExpiresAt) {
            return true;
        }
        offsetSeconds = offsetSeconds || 0;
        const accessTokenExpirationValue = accessTokenExpiresAt.valueOf();
        const nowWithOffset = new Date(new Date().toUTCString()).valueOf() + offsetSeconds * 1000;
        const tokenNotExpired = accessTokenExpirationValue > nowWithOffset;
        this.loggerService.logDebug(configId, `Has accessToken expired: ${!tokenNotExpired} --> expires in ${this.millisToMinutesAndSeconds(accessTokenExpirationValue - nowWithOffset)} , ${new Date(accessTokenExpirationValue).toLocaleTimeString()} > ${new Date(nowWithOffset).toLocaleTimeString()}`);
        // access token not expired?
        return tokenNotExpired;
    }
    // iss
    // REQUIRED. Issuer Identifier for the Issuer of the response.The iss value is a case-sensitive URL using the
    // https scheme that contains scheme, host,
    // and optionally, port number and path components and no query or fragment components.
    //
    // sub
    // REQUIRED. Subject Identifier.Locally unique and never reassigned identifier within the Issuer for the End- User,
    // which is intended to be consumed by the Client, e.g., 24400320 or AItOawmwtWwcT0k51BayewNvutrJUqsvl6qs7A4.
    // It MUST NOT exceed 255 ASCII characters in length.The sub value is a case-sensitive string.
    //
    // aud
    // REQUIRED. Audience(s) that this ID Token is intended for. It MUST contain the OAuth 2.0 client_id of the Relying Party as an
    // audience value.
    // It MAY also contain identifiers for other audiences.In the general case, the aud value is an array of case-sensitive strings.
    // In the common special case when there is one audience, the aud value MAY be a single case-sensitive string.
    //
    // exp
    // REQUIRED. Expiration time on or after which the ID Token MUST NOT be accepted for processing.
    // The processing of this parameter requires that the current date/ time MUST be before the expiration date/ time listed in the value.
    // Implementers MAY provide for some small leeway, usually no more than a few minutes, to account for clock skew.
    // Its value is a JSON [RFC7159] number representing the number of seconds from 1970- 01 - 01T00: 00:00Z as measured in UTC until
    // the date/ time.
    // See RFC 3339 [RFC3339] for details regarding date/ times in general and UTC in particular.
    //
    // iat
    // REQUIRED. Time at which the JWT was issued. Its value is a JSON number representing the number of seconds from
    // 1970- 01 - 01T00: 00: 00Z as measured
    // in UTC until the date/ time.
    validateRequiredIdToken(dataIdToken, configId) {
        let validated = true;
        if (!dataIdToken.hasOwnProperty('iss')) {
            validated = false;
            this.loggerService.logWarning(configId, 'iss is missing, this is required in the id_token');
        }
        if (!dataIdToken.hasOwnProperty('sub')) {
            validated = false;
            this.loggerService.logWarning(configId, 'sub is missing, this is required in the id_token');
        }
        if (!dataIdToken.hasOwnProperty('aud')) {
            validated = false;
            this.loggerService.logWarning(configId, 'aud is missing, this is required in the id_token');
        }
        if (!dataIdToken.hasOwnProperty('exp')) {
            validated = false;
            this.loggerService.logWarning(configId, 'exp is missing, this is required in the id_token');
        }
        if (!dataIdToken.hasOwnProperty('iat')) {
            validated = false;
            this.loggerService.logWarning(configId, 'iat is missing, this is required in the id_token');
        }
        return validated;
    }
    // id_token C8: The iat Claim can be used to reject tokens that were issued too far away from the current time,
    // limiting the amount of time that nonces need to be stored to prevent attacks.The acceptable range is Client specific.
    validateIdTokenIatMaxOffset(dataIdToken, maxOffsetAllowedInSeconds, disableIatOffsetValidation, configId) {
        if (disableIatOffsetValidation) {
            return true;
        }
        if (!dataIdToken.hasOwnProperty('iat')) {
            return false;
        }
        const dateTimeIatIdToken = new Date(0); // The 0 here is the key, which sets the date to the epoch
        dateTimeIatIdToken.setUTCSeconds(dataIdToken.iat);
        maxOffsetAllowedInSeconds = maxOffsetAllowedInSeconds || 0;
        const nowInUtc = new Date(new Date().toUTCString());
        const diff = nowInUtc.valueOf() - dateTimeIatIdToken.valueOf();
        const maxOffsetAllowedInMilliseconds = maxOffsetAllowedInSeconds * 1000;
        this.loggerService.logDebug(configId, `validate id token iat max offset ${diff} < ${maxOffsetAllowedInMilliseconds}`);
        if (diff > 0) {
            return diff < maxOffsetAllowedInMilliseconds;
        }
        return -diff < maxOffsetAllowedInMilliseconds;
    }
    // id_token C9: The value of the nonce Claim MUST be checked to verify that it is the same value as the one
    // that was sent in the Authentication Request.The Client SHOULD check the nonce value for replay attacks.
    // The precise method for detecting replay attacks is Client specific.
    // However the nonce claim SHOULD not be present for the refresh_token grant type
    // https://bitbucket.org/openid/connect/issues/1025/ambiguity-with-how-nonce-is-handled-on
    // The current spec is ambiguous and KeyCloak does send it.
    validateIdTokenNonce(dataIdToken, localNonce, ignoreNonceAfterRefresh, configId) {
        const isFromRefreshToken = (dataIdToken.nonce === undefined || ignoreNonceAfterRefresh) && localNonce === TokenValidationService.refreshTokenNoncePlaceholder;
        if (!isFromRefreshToken && dataIdToken.nonce !== localNonce) {
            this.loggerService.logDebug(configId, 'Validate_id_token_nonce failed, dataIdToken.nonce: ' + dataIdToken.nonce + ' local_nonce:' + localNonce);
            return false;
        }
        return true;
    }
    // id_token C1: The Issuer Identifier for the OpenID Provider (which is typically obtained during Discovery)
    // MUST exactly match the value of the iss (issuer) Claim.
    validateIdTokenIss(dataIdToken, authWellKnownEndpointsIssuer, configId) {
        if (dataIdToken.iss !== authWellKnownEndpointsIssuer) {
            this.loggerService.logDebug(configId, 'Validate_id_token_iss failed, dataIdToken.iss: ' +
                dataIdToken.iss +
                ' authWellKnownEndpoints issuer:' +
                authWellKnownEndpointsIssuer);
            return false;
        }
        return true;
    }
    // id_token C2: The Client MUST validate that the aud (audience) Claim contains its client_id value registered at the Issuer identified
    // by the iss (issuer) Claim as an audience.
    // The ID Token MUST be rejected if the ID Token does not list the Client as a valid audience, or if it contains additional audiences
    // not trusted by the Client.
    validateIdTokenAud(dataIdToken, aud, configId) {
        if (Array.isArray(dataIdToken.aud)) {
            const result = dataIdToken.aud.includes(aud);
            if (!result) {
                this.loggerService.logDebug(configId, 'Validate_id_token_aud array failed, dataIdToken.aud: ' + dataIdToken.aud + ' client_id:' + aud);
                return false;
            }
            return true;
        }
        else if (dataIdToken.aud !== aud) {
            this.loggerService.logDebug(configId, 'Validate_id_token_aud failed, dataIdToken.aud: ' + dataIdToken.aud + ' client_id:' + aud);
            return false;
        }
        return true;
    }
    validateIdTokenAzpExistsIfMoreThanOneAud(dataIdToken) {
        if (!dataIdToken) {
            return false;
        }
        if (Array.isArray(dataIdToken.aud) && dataIdToken.aud.length > 1 && !dataIdToken.azp) {
            return false;
        }
        return true;
    }
    // If an azp (authorized party) Claim is present, the Client SHOULD verify that its client_id is the Claim Value.
    validateIdTokenAzpValid(dataIdToken, clientId) {
        if (!dataIdToken?.azp) {
            return true;
        }
        if (dataIdToken.azp === clientId) {
            return true;
        }
        return false;
    }
    validateStateFromHashCallback(state, localState, configId) {
        if (state !== localState) {
            this.loggerService.logDebug(configId, 'ValidateStateFromHashCallback failed, state: ' + state + ' local_state:' + localState);
            return false;
        }
        return true;
    }
    // id_token C5: The Client MUST validate the signature of the ID Token according to JWS [JWS] using the algorithm specified in the alg
    // Header Parameter of the JOSE Header.The Client MUST use the keys provided by the Issuer.
    // id_token C6: The alg value SHOULD be RS256. Validation of tokens using other signing algorithms is described in the
    // OpenID Connect Core 1.0 [OpenID.Core] specification.
    validateSignatureIdToken(idToken, jwtkeys, configId) {
        if (!jwtkeys || !jwtkeys.keys) {
            return false;
        }
        const headerData = this.tokenHelperService.getHeaderFromToken(idToken, false, configId);
        if (Object.keys(headerData).length === 0 && headerData.constructor === Object) {
            this.loggerService.logWarning(configId, 'id token has no header data');
            return false;
        }
        const kid = headerData.kid;
        const alg = headerData.alg;
        if (!this.keyAlgorithms.includes(alg)) {
            this.loggerService.logWarning(configId, 'alg not supported', alg);
            return false;
        }
        let jwtKtyToUse = 'RSA';
        if (alg.charAt(0) === 'E') {
            jwtKtyToUse = 'EC';
        }
        let isValid = false;
        // No kid in the Jose header
        if (!kid) {
            let keyToValidate;
            // If only one key, use it
            if (jwtkeys.keys.length === 1 && jwtkeys.keys[0].kty === jwtKtyToUse) {
                keyToValidate = jwtkeys.keys[0];
            }
            else {
                // More than one key
                // Make sure there's exactly 1 key candidate
                // kty "RSA" and "EC" uses "sig"
                let amountOfMatchingKeys = 0;
                for (const key of jwtkeys.keys) {
                    if (key.kty === jwtKtyToUse && key.use === 'sig') {
                        amountOfMatchingKeys++;
                        keyToValidate = key;
                    }
                }
                if (amountOfMatchingKeys > 1) {
                    this.loggerService.logWarning(configId, 'no ID Token kid claim in JOSE header and multiple supplied in jwks_uri');
                    return false;
                }
            }
            if (!keyToValidate) {
                this.loggerService.logWarning(configId, 'no keys found, incorrect Signature, validation failed for id_token');
                return false;
            }
            isValid = KJUR.jws.JWS.verify(idToken, KEYUTIL.getKey(keyToValidate), [alg]);
            if (!isValid) {
                this.loggerService.logWarning(configId, 'incorrect Signature, validation failed for id_token');
            }
            return isValid;
        }
        else {
            // kid in the Jose header of id_token
            for (const key of jwtkeys.keys) {
                if (key.kid === kid) {
                    const publicKey = KEYUTIL.getKey(key);
                    isValid = KJUR.jws.JWS.verify(idToken, publicKey, [alg]);
                    if (!isValid) {
                        this.loggerService.logWarning(configId, 'incorrect Signature, validation failed for id_token');
                    }
                    return isValid;
                }
            }
        }
        return isValid;
    }
    // Accepts ID Token without 'kid' claim in JOSE header if only one JWK supplied in 'jwks_url'
    //// private validate_no_kid_in_header_only_one_allowed_in_jwtkeys(header_data: any, jwtkeys: any): boolean {
    ////    this.oidcSecurityCommon.logDebug('amount of jwtkeys.keys: ' + jwtkeys.keys.length);
    ////    if (!header_data.hasOwnProperty('kid')) {
    ////        // no kid defined in Jose header
    ////        if (jwtkeys.keys.length != 1) {
    ////            this.oidcSecurityCommon.logDebug('jwtkeys.keys.length != 1 and no kid in header');
    ////            return false;
    ////        }
    ////    }
    ////    return true;
    //// }
    // Access Token Validation
    // access_token C1: Hash the octets of the ASCII representation of the access_token with the hash algorithm specified in JWA[JWA]
    // for the alg Header Parameter of the ID Token's JOSE Header. For instance, if the alg is RS256, the hash algorithm used is SHA-256.
    // access_token C2: Take the left- most half of the hash and base64url- encode it.
    // access_token C3: The value of at_hash in the ID Token MUST match the value produced in the previous step if at_hash
    // is present in the ID Token.
    validateIdTokenAtHash(accessToken, atHash, idTokenAlg, configId) {
        this.loggerService.logDebug(configId, 'at_hash from the server:' + atHash);
        // 'sha256' 'sha384' 'sha512'
        let sha = 'sha256';
        if (idTokenAlg.includes('384')) {
            sha = 'sha384';
        }
        else if (idTokenAlg.includes('512')) {
            sha = 'sha512';
        }
        const testData = this.jsrsAsignReducedService.generateAtHash('' + accessToken, sha);
        this.loggerService.logDebug(configId, 'at_hash client validation not decoded:' + testData);
        if (testData === atHash) {
            return true; // isValid;
        }
        else {
            const testValue = this.jsrsAsignReducedService.generateAtHash('' + decodeURIComponent(accessToken), sha);
            this.loggerService.logDebug(configId, '-gen access--' + testValue);
            if (testValue === atHash) {
                return true; // isValid
            }
        }
        return false;
    }
    millisToMinutesAndSeconds(millis) {
        const minutes = Math.floor(millis / 60000);
        const seconds = ((millis % 60000) / 1000).toFixed(0);
        return minutes + ':' + (+seconds < 10 ? '0' : '') + seconds;
    }
}
TokenValidationService.refreshTokenNoncePlaceholder = '--RefreshToken--';
TokenValidationService.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: TokenValidationService, deps: [{ token: i1.TokenHelperService }, { token: i2.LoggerService }, { token: i3.JsrsAsignReducedService }], target: i0.ɵɵFactoryTarget.Injectable });
TokenValidationService.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: TokenValidationService });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: TokenValidationService, decorators: [{
            type: Injectable
        }], ctorParameters: function () { return [{ type: i1.TokenHelperService }, { type: i2.LoggerService }, { type: i3.JsrsAsignReducedService }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9rZW4tdmFsaWRhdGlvbi5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvYW5ndWxhci1hdXRoLW9pZGMtY2xpZW50L3NyYy9saWIvdmFsaWRhdGlvbi90b2tlbi12YWxpZGF0aW9uLnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUMzQyxPQUFPLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLG1CQUFtQixDQUFDOzs7OztBQUtsRCwyREFBMkQ7QUFFM0QsV0FBVztBQUNYLDRHQUE0RztBQUM1RywwREFBMEQ7QUFDMUQsRUFBRTtBQUNGLHVJQUF1STtBQUN2SSx1SUFBdUk7QUFDdkksb0VBQW9FO0FBQ3BFLEVBQUU7QUFDRixtSEFBbUg7QUFDbkgsRUFBRTtBQUNGLDhIQUE4SDtBQUM5SCxFQUFFO0FBQ0Ysa0lBQWtJO0FBQ2xJLCtGQUErRjtBQUMvRixFQUFFO0FBQ0YscUlBQXFJO0FBQ3JJLFdBQVc7QUFDWCwrQkFBK0I7QUFDL0IsRUFBRTtBQUNGLHlJQUF5STtBQUN6SSxtQkFBbUI7QUFDbkIsRUFBRTtBQUNGLCtHQUErRztBQUMvRyx3SEFBd0g7QUFDeEgsRUFBRTtBQUNGLHlIQUF5SDtBQUN6SCwySUFBMkk7QUFDM0ksc0JBQXNCO0FBQ3RCLEVBQUU7QUFDRixzSEFBc0g7QUFDdEgsb0ZBQW9GO0FBQ3BGLEVBQUU7QUFDRixpSUFBaUk7QUFDakksc0ZBQXNGO0FBRXRGLDBCQUEwQjtBQUMxQixpSUFBaUk7QUFDakkscUlBQXFJO0FBQ3JJLGtGQUFrRjtBQUNsRixpSUFBaUk7QUFDakksbUJBQW1CO0FBR25CLE1BQU0sT0FBTyxzQkFBc0I7SUFJakMsWUFDVSxrQkFBc0MsRUFDdEMsYUFBNEIsRUFDNUIsdUJBQWdEO1FBRmhELHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBb0I7UUFDdEMsa0JB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QUFDLFVBQVU7YUFDeEI7U0FDRjtRQUVELE9BQU8sS0FBSyxDQUFDO0lBQ2YsQ0FBQztJQUVPLHlCQUF5QixDQUFDLE1BQWM7UUFDOUMsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDLENBQUM7UUFDM0MsTUFBTSxPQUFPLEdBQUcsQ0FBQyxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFckQsT0FBTyxPQUFPLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQyxPQUFPLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLE9BQU8sQ0FBQztJQUM5RCxDQUFDOztBQTlZTSxtREFBNEIsR0FBRyxrQkFBa0IsQ0FBQzttSEFEOUMsc0JBQXNCO3VIQUF0QixzQkFBc0I7MkZBQXRCLHNCQUFzQjtrQkFEbEMsVUFBVSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEluamVjdGFibGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IEtFWVVUSUwsIEtKVVIgfSBmcm9tICdqc3JzYXNpZ24tcmVkdWNlZCc7XG5pbXBvcnQgeyBMb2dnZXJTZXJ2aWNlIH0gZnJvbSAnLi4vbG9nZ2luZy9sb2dnZXIuc2VydmljZSc7XG5pbXBvcnQgeyBUb2tlbkhlbHBlclNlcnZpY2UgfSBmcm9tICcuLi91dGlscy90b2tlbkhlbHBlci90b2tlbi1oZWxwZXIuc2VydmljZSc7XG5pbXBvcnQgeyBKc3JzQXNpZ25SZWR1Y2VkU2VydmljZSB9IGZyb20gJy4vanNyc2FzaWduLXJlZHVjZWQuc2VydmljZSc7XG5cbi8vIGh0dHA6Ly9vcGVuaWQubmV0L3NwZWNzL29wZW5pZC1jb25uZWN0LWltcGxpY2l0LTFfMC5odG1sXG5cbi8vIGlkX3Rva2VuXG4vLyBpZF90b2tlbiBDMTogVGhlIElzc3VlciBJZGVudGlmaWVyIGZvciB0aGUgT3BlbklEIFByb3ZpZGVyICh3aGljaCBpcyB0eXBpY2FsbHkgb2J0YWluZWQgZHVyaW5nIERpc2NvdmVyeSlcbi8vIE1VU1QgZXhhY3RseSBtYXRjaCB0aGUgdmFsdWUgb2YgdGhlIGlzcyAoaXNzdWVyKSBDbGFpbS5cbi8vXG4vLyBpZF90b2tlbiBDMjogVGhlIENsaWVudCBNVVNUIHZhbGlkYXRlIHRoYXQgdGhlIGF1ZCAoYXVkaWVuY2UpIENsYWltIGNvbnRhaW5zIGl0cyBjbGllbnRfaWQgdmFsdWUgcmVnaXN0ZXJlZCBhdCB0aGUgSXNzdWVyIGlkZW50aWZpZWRcbi8vIGJ5IHRoZSBpc3MgKGlzc3VlcikgQ2xhaW0gYXMgYW4gYXVkaWVuY2UuVGhlIElEIFRva2VuIE1VU1QgYmUgcmVqZWN0ZWQgaWYgdGhlIElEIFRva2VuIGRvZXMgbm90IGxpc3QgdGhlIENsaWVudCBhcyBhIHZhbGlkIGF1ZGllbmNlLFxuLy8gb3IgaWYgaXQgY29udGFpbnMgYWRkaXRpb25hbCBhdWRpZW5jZXMgbm90IHRydXN0ZWQgYnkgdGhlIENsaWVudC5cbi8vXG4vLyBpZF90b2tlbiBDMzogSWYgdGhlIElEIFRva2VuIGNvbnRhaW5zIG11bHRpcGxlIGF1ZGllbmNlcywgdGhlIENsaWVudCBTSE9VTEQgdmVyaWZ5IHRoYXQgYW4gYXpwIENsYWltIGlzIHByZXNlbnQuXG4vL1xuLy8gaWRfdG9rZW4gQzQ6IElmIGFuIGF6cCAoYXV0aG9yaXplZCBwYXJ0eSkgQ2xhaW0gaXMgcHJlc2VudCwgdGhlIENsaWVudCBTSE9VTEQgdmVyaWZ5IHRoYXQgaXRzIGNsaWVudF9pZCBpcyB0aGUgQ2xhaW0gVmFsdWUuXG4vL1xuLy8gaWRfdG9rZW4gQzU6IFRoZSBDbGllbnQgTVVTVCB2YWxpZGF0ZSB0aGUgc2lnbmF0dXJlIG9mIHRoZSBJRCBUb2tlbiBhY2NvcmRpbmcgdG8gSldTIFtKV1NdIHVzaW5nIHRoZSBhbGdvcml0aG0gc3BlY2lmaWVkIGluIHRoZVxuLy8gYWxnIEhlYWRlciBQYXJhbWV0ZXIgb2YgdGhlIEpPU0UgSGVhZGVyLlRoZSBDbGllbnQgTVVTVCB1c2UgdGhlIGtleXMgcHJvdmlkZWQgYnkgdGhlIElzc3Vlci5cbi8vXG4vLyBpZF90b2tlbiBDNjogVGhlIGFsZyB2YWx1ZSBTSE9VTEQgYmUgUlMyNTYuIFZhbGlkYXRpb24gb2YgdG9rZW5zIHVzaW5nIG90aGVyIHNpZ25pbmcgYWxnb3JpdGhtcyBpcyBkZXNjcmliZWQgaW4gdGhlIE9wZW5JRCBDb25uZWN0XG4vLyBDb3JlIDEuMFxuLy8gW09wZW5JRC5Db3JlXSBzcGVjaWZpY2F0aW9uLlxuLy9cbi8vIGlkX3Rva2VuIEM3OiBUaGUgY3VycmVudCB0aW1lIE1VU1QgYmUgYmVmb3JlIHRoZSB0aW1lIHJlcHJlc2VudGVkIGJ5IHRoZSBleHAgQ2xhaW0gKHBvc3NpYmx5IGFsbG93aW5nIGZvciBzb21lIHNtYWxsIGxlZXdheSB0byBhY2NvdW50XG4vLyBmb3IgY2xvY2sgc2tldykuXG4vL1xuLy8gaWRfdG9rZW4gQzg6IFRoZSBpYXQgQ2xhaW0gY2FuIGJlIHVzZWQgdG8gcmVqZWN0IHRva2VucyB0aGF0IHdlcmUgaXNzdWVkIHRvbyBmYXIgYXdheSBmcm9tIHRoZSBjdXJyZW50IHRpbWUsXG4vLyBsaW1pdGluZyB0aGUgYW1vdW50IG9mIHRpbWUgdGhhdCBub25jZXMgbmVlZCB0byBiZSBzdG9yZWQgdG8gcHJldmVudCBhdHRhY2tzLlRoZSBhY2NlcHRhYmxlIHJhbmdlIGlzIENsaWVudCBzcGVjaWZpYy5cbi8vXG4vLyBpZF90b2tlbiBDOTogVGhlIHZhbHVlIG9mIHRoZSBub25jZSBDbGFpbSBNVVNUIGJlIGNoZWNrZWQgdG8gdmVyaWZ5IHRoYXQgaXQgaXMgdGhlIHNhbWUgdmFsdWUgYXMgdGhlIG9uZSB0aGF0IHdhcyBzZW50XG4vLyBpbiB0aGUgQXV0aGVudGljYXRpb24gUmVxdWVzdC5UaGUgQ2xpZW50IFNIT1VMRCBjaGVjayB0aGUgbm9uY2UgdmFsdWUgZm9yIHJlcGxheSBhdHRhY2tzLlRoZSBwcmVjaXNlIG1ldGhvZCBmb3IgZGV0ZWN0aW5nIHJlcGxheSBhdHRhY2tzXG4vLyBpcyBDbGllbnQgc3BlY2lmaWMuXG4vL1xuLy8gaWRfdG9rZW4gQzEwOiBJZiB0aGUgYWNyIENsYWltIHdhcyByZXF1ZXN0ZWQsIHRoZSBDbGllbnQgU0hPVUxEIGNoZWNrIHRoYXQgdGhlIGFzc2VydGVkIENsYWltIFZhbHVlIGlzIGFwcHJvcHJpYXRlLlxuLy8gVGhlIG1lYW5pbmcgYW5kIHByb2Nlc3Npbmcgb2YgYWNyIENsYWltIFZhbHVlcyBpcyBvdXQgb2Ygc2NvcGUgZm9yIHRoaXMgZG9jdW1lbnQuXG4vL1xuLy8gaWRfdG9rZW4gQzExOiBXaGVuIGEgbWF4X2FnZSByZXF1ZXN0IGlzIG1hZGUsIHRoZSBDbGllbnQgU0hPVUxEIGNoZWNrIHRoZSBhdXRoX3RpbWUgQ2xhaW0gdmFsdWUgYW5kIHJlcXVlc3QgcmUtIGF1dGhlbnRpY2F0aW9uXG4vLyBpZiBpdCBkZXRlcm1pbmVzIHRvbyBtdWNoIHRpbWUgaGFzIGVsYXBzZWQgc2luY2UgdGhlIGxhc3QgRW5kLSBVc2VyIGF1dGhlbnRpY2F0aW9uLlxuXG4vLyBBY2Nlc3MgVG9rZW4gVmFsaWRhdGlvblxuLy8gYWNjZXNzX3Rva2VuIEMxOiBIYXNoIHRoZSBvY3RldHMgb2YgdGhlIEFTQ0lJIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBhY2Nlc3NfdG9rZW4gd2l0aCB0aGUgaGFzaCBhbGdvcml0aG0gc3BlY2lmaWVkIGluIEpXQVtKV0FdXG4vLyBmb3IgdGhlIGFsZyBIZWFkZXIgUGFyYW1ldGVyIG9mIHRoZSBJRCBUb2tlbidzIEpPU0UgSGVhZGVyLiBGb3IgaW5zdGFuY2UsIGlmIHRoZSBhbGcgaXMgUlMyNTYsIHRoZSBoYXNoIGFsZ29yaXRobSB1c2VkIGlzIFNIQS0yNTYuXG4vLyBhY2Nlc3NfdG9rZW4gQzI6IFRha2UgdGhlIGxlZnQtIG1vc3QgaGFsZiBvZiB0aGUgaGFzaCBhbmQgYmFzZTY0dXJsLSBlbmNvZGUgaXQuXG4vLyBhY2Nlc3NfdG9rZW4gQzM6IFRoZSB2YWx1ZSBvZiBhdF9oYXNoIGluIHRoZSBJRCBUb2tlbiBNVVNUIG1hdGNoIHRoZSB2YWx1ZSBwcm9kdWNlZCBpbiB0aGUgcHJldmlvdXMgc3RlcCBpZiBhdF9oYXNoIGlzIHByZXNlbnRcbi8vIGluIHRoZSBJRCBUb2tlbi5cblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIFRva2VuVmFsaWRhdGlvblNlcnZpY2Uge1xuICBzdGF0aWMgcmVmcmVzaFRva2VuTm9uY2VQbGFjZWhvbGRlciA9ICctLVJlZnJlc2hUb2tlbi0tJztcbiAga2V5QWxnb3JpdGhtczogc3RyaW5nW10gPSBbJ0hTMjU2JywgJ0hTMzg0JywgJ0hTNTEyJywgJ1JTMjU2JywgJ1JTMzg0JywgJ1JTNTEyJywgJ0VTMjU2JywgJ0VTMzg0JywgJ1BTMjU2JywgJ1BTMzg0JywgJ1BTNTEyJ107XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSB0b2tlbkhlbHBlclNlcnZpY2U6IFRva2VuSGVscGVyU2VydmljZSxcbiAgICBwcml2YXRlIGxvZ2dlclNlcnZpY2U6IExvZ2dlclNlcnZpY2UsXG4gICAgcHJpdmF0ZSBqc3JzQXNpZ25SZWR1Y2VkU2VydmljZTogSnNyc0FzaWduUmVkdWNlZFNlcnZpY2VcbiAgKSB7fVxuXG4gIC8vIGlkX3Rva2VuIEM3OiBUaGUgY3VycmVudCB0aW1lIE1VU1QgYmUgYmVmb3JlIHRoZSB0aW1lIHJlcHJlc2VudGVkIGJ5IHRoZSBleHAgQ2xhaW1cbiAgLy8gKHBvc3NpYmx5IGFsbG93aW5nIGZvciBzb21lIHNtYWxsIGxlZXdheSB0byBhY2NvdW50IGZvciBjbG9jayBza2V3KS5cbiAgaGFzSWRUb2tlbkV4cGlyZWQodG9rZW46IHN0cmluZywgY29uZmlnSWQ6IHN0cmluZywgb2Zmc2V0U2Vjb25kcz86IG51bWJlcik6IGJvb2xlYW4ge1xuICAgIGNvbnN0IGRlY29kZWQgPSB0aGlzLnRva2VuSGVscGVyU2VydmljZS5nZXRQYXlsb2FkRnJvbVRva2VuKHRva2VuLCBmYWxzZSwgY29uZmlnSWQpO1xuXG4gICAgcmV0dXJuICF0aGlzLnZhbGlkYXRlSWRUb2tlbkV4cE5vdEV4cGlyZWQoZGVjb2RlZCwgY29uZmlnSWQsIG9mZnNldFNlY29uZHMpO1xuICB9XG5cbiAgLy8gaWRfdG9rZW4gQzc6IFRoZSBjdXJyZW50IHRpbWUgTVVTVCBiZSBiZWZvcmUgdGhlIHRpbWUgcmVwcmVzZW50ZWQgYnkgdGhlIGV4cCBDbGFpbVxuICAvLyAocG9zc2libHkgYWxsb3dpbmcgZm9yIHNvbWUgc21hbGwgbGVld2F5IHRvIGFjY291bnQgZm9yIGNsb2NrIHNrZXcpLlxuICB2YWxpZGF0ZUlkVG9rZW5FeHBOb3RFeHBpcmVkKGRlY29kZWRJZFRva2VuOiBzdHJpbmcsIGNvbmZpZ0lkOiBzdHJpbmcsIG9mZnNldFNlY29uZHM/OiBudW1iZXIpOiBib29sZWFuIHtcbiAgICBjb25zdCB0b2tlbkV4cGlyYXRpb25EYXRlID0gdGhpcy50b2tlbkhlbHBlclNlcnZpY2UuZ2V0VG9rZW5FeHBpcmF0aW9uRGF0ZShkZWNvZGVkSWRUb2tlbik7XG4gICAgb2Zmc2V0U2Vjb25kcyA9IG9mZnNldFNlY29uZHMgfHwgMDtcblxuICAgIGlmICghdG9rZW5FeHBpcmF0aW9uRGF0ZSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGNvbnN0IHRva2VuRXhwaXJhdGlvblZhbHVlID0gdG9rZW5FeHBpcmF0aW9uRGF0ZS52YWx1ZU9mKCk7XG4gICAgY29uc3Qgbm93V2l0aE9mZnNldCA9IG5ldyBEYXRlKG5ldyBEYXRlKCkudG9VVENTdHJpbmcoKSkudmFsdWVPZigpICsgb2Zmc2V0U2Vjb25kcyAqIDEwMDA7XG4gICAgY29uc3QgdG9rZW5Ob3RFeHBpcmVkID0gdG9rZW5FeHBpcmF0aW9uVmFsdWUgPiBub3dXaXRoT2Zmc2V0O1xuXG4gICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKFxuICAgICAgY29uZmlnSWQsXG4gICAgICBgSGFzIGlkVG9rZW4gZXhwaXJlZDogJHshdG9rZW5Ob3RFeHBpcmVkfSAtLT4gZXhwaXJlcyBpbiAke3RoaXMubWlsbGlzVG9NaW51dGVzQW5kU2Vjb25kcyhcbiAgICAgICAgdG9rZW5FeHBpcmF0aW9uVmFsdWUgLSBub3dXaXRoT2Zmc2V0XG4gICAgICApfSAsICR7bmV3IERhdGUodG9rZW5FeHBpcmF0aW9uVmFsdWUpLnRvTG9jYWxlVGltZVN0cmluZygpfSA+ICR7bmV3IERhdGUobm93V2l0aE9mZnNldCkudG9Mb2NhbGVUaW1lU3RyaW5nKCl9YFxuICAgICk7XG5cbiAgICAvLyBUb2tlbiBub3QgZXhwaXJlZD9cbiAgICByZXR1cm4gdG9rZW5Ob3RFeHBpcmVkO1xuICB9XG5cbiAgdmFsaWRhdGVBY2Nlc3NUb2tlbk5vdEV4cGlyZWQoYWNjZXNzVG9rZW5FeHBpcmVzQXQ6IERhdGUsIGNvbmZpZ0lkOiBzdHJpbmcsIG9mZnNldFNlY29uZHM/OiBudW1iZXIpOiBib29sZWFuIHtcbiAgICAvLyB2YWx1ZSBpcyBvcHRpb25hbCwgc28gaWYgaXQgZG9lcyBub3QgZXhpc3QsIHRoZW4gaXQgaGFzIG5vdCBleHBpcmVkXG4gICAgaWYgKCFhY2Nlc3NUb2tlbkV4cGlyZXNBdCkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgb2Zmc2V0U2Vjb25kcyA9IG9mZnNldFNlY29uZHMgfHwgMDtcbiAgICBjb25zdCBhY2Nlc3NUb2tlbkV4cGlyYXRpb25WYWx1ZSA9IGFjY2Vzc1Rva2VuRXhwaXJlc0F0LnZhbHVlT2YoKTtcbiAgICBjb25zdCBub3dXaXRoT2Zmc2V0ID0gbmV3IERhdGUobmV3IERhdGUoKS50b1VUQ1N0cmluZygpKS52YWx1ZU9mKCkgKyBvZmZzZXRTZWNvbmRzICogMTAwMDtcbiAgICBjb25zdCB0b2tlbk5vdEV4cGlyZWQgPSBhY2Nlc3NUb2tlbkV4cGlyYXRpb25WYWx1ZSA+IG5vd1dpdGhPZmZzZXQ7XG5cbiAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoXG4gICAgICBjb25maWdJZCxcbiAgICAgIGBIYXMgYWNjZXNzVG9rZW4gZXhwaXJlZDogJHshdG9rZW5Ob3RFeHBpcmVkfSAtLT4gZXhwaXJlcyBpbiAke3RoaXMubWlsbGlzVG9NaW51dGVzQW5kU2Vjb25kcyhcbiAgICAgICAgYWNjZXNzVG9rZW5FeHBpcmF0aW9uVmFsdWUgLSBub3dXaXRoT2Zmc2V0XG4gICAgICApfSAsICR7bmV3IERhdGUoYWNjZXNzVG9rZW5FeHBpcmF0aW9uVmFsdWUpLnRvTG9jYWxlVGltZVN0cmluZygpfSA+ICR7bmV3IERhdGUobm93V2l0aE9mZnNldCkudG9Mb2NhbGVUaW1lU3RyaW5nKCl9YFxuICAgICk7XG5cbiAgICAvLyBhY2Nlc3MgdG9rZW4gbm90IGV4cGlyZWQ/XG4gICAgcmV0dXJuIHRva2VuTm90RXhwaXJlZDtcbiAgfVxuXG4gIC8vIGlzc1xuICAvLyBSRVFVSVJFRC4gSXNzdWVyIElkZW50aWZpZXIgZm9yIHRoZSBJc3N1ZXIgb2YgdGhlIHJlc3BvbnNlLlRoZSBpc3MgdmFsdWUgaXMgYSBjYXNlLXNlbnNpdGl2ZSBVUkwgdXNpbmcgdGhlXG4gIC8vIGh0dHBzIHNjaGVtZSB0aGF0IGNvbnRhaW5zIHNjaGVtZSwgaG9zdCxcbiAgLy8gYW5kIG9wdGlvbmFsbHksIHBvcnQgbnVtYmVyIGFuZCBwYXRoIGNvbXBvbmVudHMgYW5kIG5vIHF1ZXJ5IG9yIGZyYWdtZW50IGNvbXBvbmVudHMuXG4gIC8vXG4gIC8vIHN1YlxuICAvLyBSRVFVSVJFRC4gU3ViamVjdCBJZGVudGlmaWVyLkxvY2FsbHkgdW5pcXVlIGFuZCBuZXZlciByZWFzc2lnbmVkIGlkZW50aWZpZXIgd2l0aGluIHRoZSBJc3N1ZXIgZm9yIHRoZSBFbmQtIFVzZXIsXG4gIC8vIHdoaWNoIGlzIGludGVuZGVkIHRvIGJlIGNvbnN1bWVkIGJ5IHRoZSBDbGllbnQsIGUuZy4sIDI0NDAwMzIwIG9yIEFJdE9hd213dFd3Y1QwazUxQmF5ZXdOdnV0ckpVcXN2bDZxczdBNC5cbiAgLy8gSXQgTVVTVCBOT1QgZXhjZWVkIDI1NSBBU0NJSSBjaGFyYWN0ZXJzIGluIGxlbmd0aC5UaGUgc3ViIHZhbHVlIGlzIGEgY2FzZS1zZW5zaXRpdmUgc3RyaW5nLlxuICAvL1xuICAvLyBhdWRcbiAgLy8gUkVRVUlSRUQuIEF1ZGllbmNlKHMpIHRoYXQgdGhpcyBJRCBUb2tlbiBpcyBpbnRlbmRlZCBmb3IuIEl0IE1VU1QgY29udGFpbiB0aGUgT0F1dGggMi4wIGNsaWVudF9pZCBvZiB0aGUgUmVseWluZyBQYXJ0eSBhcyBhblxuICAvLyBhdWRpZW5jZSB2YWx1ZS5cbiAgLy8gSXQgTUFZIGFsc28gY29udGFpbiBpZGVudGlmaWVycyBmb3Igb3RoZXIgYXVkaWVuY2VzLkluIHRoZSBnZW5lcmFsIGNhc2UsIHRoZSBhdWQgdmFsdWUgaXMgYW4gYXJyYXkgb2YgY2FzZS1zZW5zaXRpdmUgc3RyaW5ncy5cbiAgLy8gSW4gdGhlIGNvbW1vbiBzcGVjaWFsIGNhc2Ugd2hlbiB0aGVyZSBpcyBvbmUgYXVkaWVuY2UsIHRoZSBhdWQgdmFsdWUgTUFZIGJlIGEgc2luZ2xlIGNhc2Utc2Vuc2l0aXZlIHN0cmluZy5cbiAgLy9cbiAgLy8gZXhwXG4gIC8vIFJFUVVJUkVELiBFeHBpcmF0aW9uIHRpbWUgb24gb3IgYWZ0ZXIgd2hpY2ggdGhlIElEIFRva2VuIE1VU1QgTk9UIGJlIGFjY2VwdGVkIGZvciBwcm9jZXNzaW5nLlxuICAvLyBUaGUgcHJvY2Vzc2luZyBvZiB0aGlzIHBhcmFtZXRlciByZXF1aXJlcyB0aGF0IHRoZSBjdXJyZW50IGRhdGUvIHRpbWUgTVVTVCBiZSBiZWZvcmUgdGhlIGV4cGlyYXRpb24gZGF0ZS8gdGltZSBsaXN0ZWQgaW4gdGhlIHZhbHVlLlxuICAvLyBJbXBsZW1lbnRlcnMgTUFZIHByb3ZpZGUgZm9yIHNvbWUgc21hbGwgbGVld2F5LCB1c3VhbGx5IG5vIG1vcmUgdGhhbiBhIGZldyBtaW51dGVzLCB0byBhY2NvdW50IGZvciBjbG9jayBza2V3LlxuICAvLyBJdHMgdmFsdWUgaXMgYSBKU09OIFtSRkM3MTU5XSBudW1iZXIgcmVwcmVzZW50aW5nIHRoZSBudW1iZXIgb2Ygc2Vjb25kcyBmcm9tIDE5NzAtIDAxIC0gMDFUMDA6IDAwOjAwWiBhcyBtZWFzdXJlZCBpbiBVVEMgdW50aWxcbiAgLy8gdGhlIGRhdGUvIHRpbWUuXG4gIC8vIFNlZSBSRkMgMzMzOSBbUkZDMzMzOV0gZm9yIGRldGFpbHMgcmVnYXJkaW5nIGRhdGUvIHRpbWVzIGluIGdlbmVyYWwgYW5kIFVUQyBpbiBwYXJ0aWN1bGFyLlxuICAvL1xuICAvLyBpYXRcbiAgLy8gUkVRVUlSRUQuIFRpbWUgYXQgd2hpY2ggdGhlIEpXVCB3YXMgaXNzdWVkLiBJdHMgdmFsdWUgaXMgYSBKU09OIG51bWJlciByZXByZXNlbnRpbmcgdGhlIG51bWJlciBvZiBzZWNvbmRzIGZyb21cbiAgLy8gMTk3MC0gMDEgLSAwMVQwMDogMDA6IDAwWiBhcyBtZWFzdXJlZFxuICAvLyBpbiBVVEMgdW50aWwgdGhlIGRhdGUvIHRpbWUuXG4gIHZhbGlkYXRlUmVxdWlyZWRJZFRva2VuKGRhdGFJZFRva2VuOiBhbnksIGNvbmZpZ0lkOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICBsZXQgdmFsaWRhdGVkID0gdHJ1ZTtcbiAgICBpZiAoIWRhdGFJZFRva2VuLmhhc093blByb3BlcnR5KCdpc3MnKSkge1xuICAgICAgdmFsaWRhdGVkID0gZmFsc2U7XG4gICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nV2FybmluZyhjb25maWdJZCwgJ2lzcyBpcyBtaXNzaW5nLCB0aGlzIGlzIHJlcXVpcmVkIGluIHRoZSBpZF90b2tlbicpO1xuICAgIH1cblxuICAgIGlmICghZGF0YUlkVG9rZW4uaGFzT3duUHJvcGVydHkoJ3N1YicpKSB7XG4gICAgICB2YWxpZGF0ZWQgPSBmYWxzZTtcbiAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dXYXJuaW5nKGNvbmZpZ0lkLCAnc3ViIGlzIG1pc3NpbmcsIHRoaXMgaXMgcmVxdWlyZWQgaW4gdGhlIGlkX3Rva2VuJyk7XG4gICAgfVxuXG4gICAgaWYgKCFkYXRhSWRUb2tlbi5oYXNPd25Qcm9wZXJ0eSgnYXVkJykpIHtcbiAgICAgIHZhbGlkYXRlZCA9IGZhbHNlO1xuICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ1dhcm5pbmcoY29uZmlnSWQsICdhdWQgaXMgbWlzc2luZywgdGhpcyBpcyByZXF1aXJlZCBpbiB0aGUgaWRfdG9rZW4nKTtcbiAgICB9XG5cbiAgICBpZiAoIWRhdGFJZFRva2VuLmhhc093blByb3BlcnR5KCdleHAnKSkge1xuICAgICAgdmFsaWRhdGVkID0gZmFsc2U7XG4gICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nV2FybmluZyhjb25maWdJZCwgJ2V4cCBpcyBtaXNzaW5nLCB0aGlzIGlzIHJlcXVpcmVkIGluIHRoZSBpZF90b2tlbicpO1xuICAgIH1cblxuICAgIGlmICghZGF0YUlkVG9rZW4uaGFzT3duUHJvcGVydHkoJ2lhdCcpKSB7XG4gICAgICB2YWxpZGF0ZWQgPSBmYWxzZTtcbiAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dXYXJuaW5nKGNvbmZpZ0lkLCAnaWF0IGlzIG1pc3NpbmcsIHRoaXMgaXMgcmVxdWlyZWQgaW4gdGhlIGlkX3Rva2VuJyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHZhbGlkYXRlZDtcbiAgfVxuXG4gIC8vIGlkX3Rva2VuIEM4OiBUaGUgaWF0IENsYWltIGNhbiBiZSB1c2VkIHRvIHJlamVjdCB0b2tlbnMgdGhhdCB3ZXJlIGlzc3VlZCB0b28gZmFyIGF3YXkgZnJvbSB0aGUgY3VycmVudCB0aW1lLFxuICAvLyBsaW1pdGluZyB0aGUgYW1vdW50IG9mIHRpbWUgdGhhdCBub25jZXMgbmVlZCB0byBiZSBzdG9yZWQgdG8gcHJldmVudCBhdHRhY2tzLlRoZSBhY2NlcHRhYmxlIHJhbmdlIGlzIENsaWVudCBzcGVjaWZpYy5cbiAgdmFsaWRhdGVJZFRva2VuSWF0TWF4T2Zmc2V0KFxuICAgIGRhdGFJZFRva2VuOiBhbnksXG4gICAgbWF4T2Zmc2V0QWxsb3dlZEluU2Vjb25kczogbnVtYmVyLFxuICAgIGRpc2FibGVJYXRPZmZzZXRWYWxpZGF0aW9uOiBib29sZWFuLFxuICAgIGNvbmZpZ0lkOiBzdHJpbmdcbiAgKTogYm9vbGVhbiB7XG4gICAgaWYgKGRpc2FibGVJYXRPZmZzZXRWYWxpZGF0aW9uKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICBpZiAoIWRhdGFJZFRva2VuLmhhc093blByb3BlcnR5KCdpYXQnKSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGNvbnN0IGRhdGVUaW1lSWF0SWRUb2tlbiA9IG5ldyBEYXRlKDApOyAvLyBUaGUgMCBoZXJlIGlzIHRoZSBrZXksIHdoaWNoIHNldHMgdGhlIGRhdGUgdG8gdGhlIGVwb2NoXG4gICAgZGF0ZVRpbWVJYXRJZFRva2VuLnNldFVUQ1NlY29uZHMoZGF0YUlkVG9rZW4uaWF0KTtcbiAgICBtYXhPZmZzZXRBbGxvd2VkSW5TZWNvbmRzID0gbWF4T2Zmc2V0QWxsb3dlZEluU2Vjb25kcyB8fCAwO1xuXG4gICAgY29uc3Qgbm93SW5VdGMgPSBuZXcgRGF0ZShuZXcgRGF0ZSgpLnRvVVRDU3RyaW5nKCkpO1xuICAgIGNvbnN0IGRpZmYgPSBub3dJblV0Yy52YWx1ZU9mKCkgLSBkYXRlVGltZUlhdElkVG9rZW4udmFsdWVPZigpO1xuICAgIGNvbnN0IG1heE9mZnNldEFsbG93ZWRJbk1pbGxpc2Vjb25kcyA9IG1heE9mZnNldEFsbG93ZWRJblNlY29uZHMgKiAxMDAwO1xuXG4gICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKGNvbmZpZ0lkLCBgdmFsaWRhdGUgaWQgdG9rZW4gaWF0IG1heCBvZmZzZXQgJHtkaWZmfSA8ICR7bWF4T2Zmc2V0QWxsb3dlZEluTWlsbGlzZWNvbmRzfWApO1xuXG4gICAgaWYgKGRpZmYgPiAwKSB7XG4gICAgICByZXR1cm4gZGlmZiA8IG1heE9mZnNldEFsbG93ZWRJbk1pbGxpc2Vjb25kcztcbiAgICB9XG5cbiAgICByZXR1cm4gLWRpZmYgPCBtYXhPZmZzZXRBbGxvd2VkSW5NaWxsaXNlY29uZHM7XG4gIH1cblxuICAvLyBpZF90b2tlbiBDOTogVGhlIHZhbHVlIG9mIHRoZSBub25jZSBDbGFpbSBNVVNUIGJlIGNoZWNrZWQgdG8gdmVyaWZ5IHRoYXQgaXQgaXMgdGhlIHNhbWUgdmFsdWUgYXMgdGhlIG9uZVxuICAvLyB0aGF0IHdhcyBzZW50IGluIHRoZSBBdXRoZW50aWNhdGlvbiBSZXF1ZXN0LlRoZSBDbGllbnQgU0hPVUxEIGNoZWNrIHRoZSBub25jZSB2YWx1ZSBmb3IgcmVwbGF5IGF0dGFja3MuXG4gIC8vIFRoZSBwcmVjaXNlIG1ldGhvZCBmb3IgZGV0ZWN0aW5nIHJlcGxheSBhdHRhY2tzIGlzIENsaWVudCBzcGVjaWZpYy5cblxuICAvLyBIb3dldmVyIHRoZSBub25jZSBjbGFpbSBTSE9VTEQgbm90IGJlIHByZXNlbnQgZm9yIHRoZSByZWZyZXNoX3Rva2VuIGdyYW50IHR5cGVcbiAgLy8gaHR0cHM6Ly9iaXRidWNrZXQub3JnL29wZW5pZC9jb25uZWN0L2lzc3Vlcy8xMDI1L2FtYmlndWl0eS13aXRoLWhvdy1ub25jZS1pcy1oYW5kbGVkLW9uXG4gIC8vIFRoZSBjdXJyZW50IHNwZWMgaXMgYW1iaWd1b3VzIGFuZCBLZXlDbG9hayBkb2VzIHNlbmQgaXQuXG4gIHZhbGlkYXRlSWRUb2tlbk5vbmNlKGRhdGFJZFRva2VuOiBhbnksIGxvY2FsTm9uY2U6IGFueSwgaWdub3JlTm9uY2VBZnRlclJlZnJlc2g6IGJvb2xlYW4sIGNvbmZpZ0lkOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICBjb25zdCBpc0Zyb21SZWZyZXNoVG9rZW4gPVxuICAgICAgKGRhdGFJZFRva2VuLm5vbmNlID09PSB1bmRlZmluZWQgfHwgaWdub3JlTm9uY2VBZnRlclJlZnJlc2gpICYmIGxvY2FsTm9uY2UgPT09IFRva2VuVmFsaWRhdGlvblNlcnZpY2UucmVmcmVzaFRva2VuTm9uY2VQbGFjZWhvbGRlcjtcbiAgICBpZiAoIWlzRnJvbVJlZnJlc2hUb2tlbiAmJiBkYXRhSWRUb2tlbi5ub25jZSAhPT0gbG9jYWxOb25jZSkge1xuICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKFxuICAgICAgICBjb25maWdJZCxcbiAgICAgICAgJ1ZhbGlkYXRlX2lkX3Rva2VuX25vbmNlIGZhaWxlZCwgZGF0YUlkVG9rZW4ubm9uY2U6ICcgKyBkYXRhSWRUb2tlbi5ub25jZSArICcgbG9jYWxfbm9uY2U6JyArIGxvY2FsTm9uY2VcbiAgICAgICk7XG5cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIC8vIGlkX3Rva2VuIEMxOiBUaGUgSXNzdWVyIElkZW50aWZpZXIgZm9yIHRoZSBPcGVuSUQgUHJvdmlkZXIgKHdoaWNoIGlzIHR5cGljYWxseSBvYnRhaW5lZCBkdXJpbmcgRGlzY292ZXJ5KVxuICAvLyBNVVNUIGV4YWN0bHkgbWF0Y2ggdGhlIHZhbHVlIG9mIHRoZSBpc3MgKGlzc3VlcikgQ2xhaW0uXG4gIHZhbGlkYXRlSWRUb2tlbklzcyhkYXRhSWRUb2tlbjogYW55LCBhdXRoV2VsbEtub3duRW5kcG9pbnRzSXNzdWVyOiBhbnksIGNvbmZpZ0lkOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICBpZiAoKGRhdGFJZFRva2VuLmlzcyBhcyBzdHJpbmcpICE9PSAoYXV0aFdlbGxLbm93bkVuZHBvaW50c0lzc3VlciBhcyBzdHJpbmcpKSB7XG4gICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoXG4gICAgICAgIGNvbmZpZ0lkLFxuICAgICAgICAnVmFsaWRhdGVfaWRfdG9rZW5faXNzIGZhaWxlZCwgZGF0YUlkVG9rZW4uaXNzOiAnICtcbiAgICAgICAgICBkYXRhSWRUb2tlbi5pc3MgK1xuICAgICAgICAgICcgYXV0aFdlbGxLbm93bkVuZHBvaW50cyBpc3N1ZXI6JyArXG4gICAgICAgICAgYXV0aFdlbGxLbm93bkVuZHBvaW50c0lzc3VlclxuICAgICAgKTtcblxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgLy8gaWRfdG9rZW4gQzI6IFRoZSBDbGllbnQgTVVTVCB2YWxpZGF0ZSB0aGF0IHRoZSBhdWQgKGF1ZGllbmNlKSBDbGFpbSBjb250YWlucyBpdHMgY2xpZW50X2lkIHZhbHVlIHJlZ2lzdGVyZWQgYXQgdGhlIElzc3VlciBpZGVudGlmaWVkXG4gIC8vIGJ5IHRoZSBpc3MgKGlzc3VlcikgQ2xhaW0gYXMgYW4gYXVkaWVuY2UuXG4gIC8vIFRoZSBJRCBUb2tlbiBNVVNUIGJlIHJlamVjdGVkIGlmIHRoZSBJRCBUb2tlbiBkb2VzIG5vdCBsaXN0IHRoZSBDbGllbnQgYXMgYSB2YWxpZCBhdWRpZW5jZSwgb3IgaWYgaXQgY29udGFpbnMgYWRkaXRpb25hbCBhdWRpZW5jZXNcbiAgLy8gbm90IHRydXN0ZWQgYnkgdGhlIENsaWVudC5cbiAgdmFsaWRhdGVJZFRva2VuQXVkKGRhdGFJZFRva2VuOiBhbnksIGF1ZDogYW55LCBjb25maWdJZDogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgaWYgKEFycmF5LmlzQXJyYXkoZGF0YUlkVG9rZW4uYXVkKSkge1xuICAgICAgY29uc3QgcmVzdWx0ID0gZGF0YUlkVG9rZW4uYXVkLmluY2x1ZGVzKGF1ZCk7XG5cbiAgICAgIGlmICghcmVzdWx0KSB7XG4gICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1ZyhcbiAgICAgICAgICBjb25maWdJZCxcbiAgICAgICAgICAnVmFsaWRhdGVfaWRfdG9rZW5fYXVkIGFycmF5IGZhaWxlZCwgZGF0YUlkVG9rZW4uYXVkOiAnICsgZGF0YUlkVG9rZW4uYXVkICsgJyBjbGllbnRfaWQ6JyArIGF1ZFxuICAgICAgICApO1xuXG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSBlbHNlIGlmIChkYXRhSWRUb2tlbi5hdWQgIT09IGF1ZCkge1xuICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKGNvbmZpZ0lkLCAnVmFsaWRhdGVfaWRfdG9rZW5fYXVkIGZhaWxlZCwgZGF0YUlkVG9rZW4uYXVkOiAnICsgZGF0YUlkVG9rZW4uYXVkICsgJyBjbGllbnRfaWQ6JyArIGF1ZCk7XG5cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIHZhbGlkYXRlSWRUb2tlbkF6cEV4aXN0c0lmTW9yZVRoYW5PbmVBdWQoZGF0YUlkVG9rZW46IGFueSk6IGJvb2xlYW4ge1xuICAgIGlmICghZGF0YUlkVG9rZW4pIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBpZiAoQXJyYXkuaXNBcnJheShkYXRhSWRUb2tlbi5hdWQpICYmIGRhdGFJZFRva2VuLmF1ZC5sZW5ndGggPiAxICYmICFkYXRhSWRUb2tlbi5henApIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIC8vIElmIGFuIGF6cCAoYXV0aG9yaXplZCBwYXJ0eSkgQ2xhaW0gaXMgcHJlc2VudCwgdGhlIENsaWVudCBTSE9VTEQgdmVyaWZ5IHRoYXQgaXRzIGNsaWVudF9pZCBpcyB0aGUgQ2xhaW0gVmFsdWUuXG4gIHZhbGlkYXRlSWRUb2tlbkF6cFZhbGlkKGRhdGFJZFRva2VuOiBhbnksIGNsaWVudElkOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICBpZiAoIWRhdGFJZFRva2VuPy5henApIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIGlmIChkYXRhSWRUb2tlbi5henAgPT09IGNsaWVudElkKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICB2YWxpZGF0ZVN0YXRlRnJvbUhhc2hDYWxsYmFjayhzdGF0ZTogYW55LCBsb2NhbFN0YXRlOiBhbnksIGNvbmZpZ0lkOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICBpZiAoKHN0YXRlIGFzIHN0cmluZykgIT09IChsb2NhbFN0YXRlIGFzIHN0cmluZykpIHtcbiAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1Zyhjb25maWdJZCwgJ1ZhbGlkYXRlU3RhdGVGcm9tSGFzaENhbGxiYWNrIGZhaWxlZCwgc3RhdGU6ICcgKyBzdGF0ZSArICcgbG9jYWxfc3RhdGU6JyArIGxvY2FsU3RhdGUpO1xuXG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICAvLyBpZF90b2tlbiBDNTogVGhlIENsaWVudCBNVVNUIHZhbGlkYXRlIHRoZSBzaWduYXR1cmUgb2YgdGhlIElEIFRva2VuIGFjY29yZGluZyB0byBKV1MgW0pXU10gdXNpbmcgdGhlIGFsZ29yaXRobSBzcGVjaWZpZWQgaW4gdGhlIGFsZ1xuICAvLyBIZWFkZXIgUGFyYW1ldGVyIG9mIHRoZSBKT1NFIEhlYWRlci5UaGUgQ2xpZW50IE1VU1QgdXNlIHRoZSBrZXlzIHByb3ZpZGVkIGJ5IHRoZSBJc3N1ZXIuXG4gIC8vIGlkX3Rva2VuIEM2OiBUaGUgYWxnIHZhbHVlIFNIT1VMRCBiZSBSUzI1Ni4gVmFsaWRhdGlvbiBvZiB0b2tlbnMgdXNpbmcgb3RoZXIgc2lnbmluZyBhbGdvcml0aG1zIGlzIGRlc2NyaWJlZCBpbiB0aGVcbiAgLy8gT3BlbklEIENvbm5lY3QgQ29yZSAxLjAgW09wZW5JRC5Db3JlXSBzcGVjaWZpY2F0aW9uLlxuICB2YWxpZGF0ZVNpZ25hdHVyZUlkVG9rZW4oaWRUb2tlbjogYW55LCBqd3RrZXlzOiBhbnksIGNvbmZpZ0lkOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICBpZiAoIWp3dGtleXMgfHwgIWp3dGtleXMua2V5cykge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGNvbnN0IGhlYWRlckRhdGEgPSB0aGlzLnRva2VuSGVscGVyU2VydmljZS5nZXRIZWFkZXJGcm9tVG9rZW4oaWRUb2tlbiwgZmFsc2UsIGNvbmZpZ0lkKTtcblxuICAgIGlmIChPYmplY3Qua2V5cyhoZWFkZXJEYXRhKS5sZW5ndGggPT09IDAgJiYgaGVhZGVyRGF0YS5jb25zdHJ1Y3RvciA9PT0gT2JqZWN0KSB7XG4gICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nV2FybmluZyhjb25maWdJZCwgJ2lkIHRva2VuIGhhcyBubyBoZWFkZXIgZGF0YScpO1xuXG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgY29uc3Qga2lkID0gaGVhZGVyRGF0YS5raWQ7XG4gICAgY29uc3QgYWxnID0gaGVhZGVyRGF0YS5hbGc7XG5cbiAgICBpZiAoIXRoaXMua2V5QWxnb3JpdGhtcy5pbmNsdWRlcyhhbGcgYXMgc3RyaW5nKSkge1xuICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ1dhcm5pbmcoY29uZmlnSWQsICdhbGcgbm90IHN1cHBvcnRlZCcsIGFsZyk7XG5cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBsZXQgand0S3R5VG9Vc2UgPSAnUlNBJztcbiAgICBpZiAoKGFsZyBhcyBzdHJpbmcpLmNoYXJBdCgwKSA9PT0gJ0UnKSB7XG4gICAgICBqd3RLdHlUb1VzZSA9ICdFQyc7XG4gICAgfVxuXG4gICAgbGV0IGlzVmFsaWQgPSBmYWxzZTtcblxuICAgIC8vIE5vIGtpZCBpbiB0aGUgSm9zZSBoZWFkZXJcbiAgICBpZiAoIWtpZCkge1xuICAgICAgbGV0IGtleVRvVmFsaWRhdGU7XG5cbiAgICAgIC8vIElmIG9ubHkgb25lIGtleSwgdXNlIGl0XG4gICAgICBpZiAoand0a2V5cy5rZXlzLmxlbmd0aCA9PT0gMSAmJiAoand0a2V5cy5rZXlzWzBdLmt0eSBhcyBzdHJpbmcpID09PSBqd3RLdHlUb1VzZSkge1xuICAgICAgICBrZXlUb1ZhbGlkYXRlID0gand0a2V5cy5rZXlzWzBdO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gTW9yZSB0aGFuIG9uZSBrZXlcbiAgICAgICAgLy8gTWFrZSBzdXJlIHRoZXJlJ3MgZXhhY3RseSAxIGtleSBjYW5kaWRhdGVcbiAgICAgICAgLy8ga3R5IFwiUlNBXCIgYW5kIFwiRUNcIiB1c2VzIFwic2lnXCJcbiAgICAgICAgbGV0IGFtb3VudE9mTWF0Y2hpbmdLZXlzID0gMDtcbiAgICAgICAgZm9yIChjb25zdCBrZXkgb2Ygand0a2V5cy5rZXlzKSB7XG4gICAgICAgICAgaWYgKChrZXkua3R5IGFzIHN0cmluZykgPT09IGp3dEt0eVRvVXNlICYmIChrZXkudXNlIGFzIHN0cmluZykgPT09ICdzaWcnKSB7XG4gICAgICAgICAgICBhbW91bnRPZk1hdGNoaW5nS2V5cysrO1xuICAgICAgICAgICAga2V5VG9WYWxpZGF0ZSA9IGtleTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoYW1vdW50T2ZNYXRjaGluZ0tleXMgPiAxKSB7XG4gICAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ1dhcm5pbmcoY29uZmlnSWQsICdubyBJRCBUb2tlbiBraWQgY2xhaW0gaW4gSk9TRSBoZWFkZXIgYW5kIG11bHRpcGxlIHN1cHBsaWVkIGluIGp3a3NfdXJpJyk7XG5cbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKCFrZXlUb1ZhbGlkYXRlKSB7XG4gICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dXYXJuaW5nKGNvbmZpZ0lkLCAnbm8ga2V5cyBmb3VuZCwgaW5jb3JyZWN0IFNpZ25hdHVyZSwgdmFsaWRhdGlvbiBmYWlsZWQgZm9yIGlkX3Rva2VuJyk7XG5cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuXG4gICAgICBpc1ZhbGlkID0gS0pVUi5qd3MuSldTLnZlcmlmeShpZFRva2VuLCBLRVlVVElMLmdldEtleShrZXlUb1ZhbGlkYXRlKSwgW2FsZ10pO1xuXG4gICAgICBpZiAoIWlzVmFsaWQpIHtcbiAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ1dhcm5pbmcoY29uZmlnSWQsICdpbmNvcnJlY3QgU2lnbmF0dXJlLCB2YWxpZGF0aW9uIGZhaWxlZCBmb3IgaWRfdG9rZW4nKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGlzVmFsaWQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIGtpZCBpbiB0aGUgSm9zZSBoZWFkZXIgb2YgaWRfdG9rZW5cbiAgICAgIGZvciAoY29uc3Qga2V5IG9mIGp3dGtleXMua2V5cykge1xuICAgICAgICBpZiAoKGtleS5raWQgYXMgc3RyaW5nKSA9PT0gKGtpZCBhcyBzdHJpbmcpKSB7XG4gICAgICAgICAgY29uc3QgcHVibGljS2V5ID0gS0VZVVRJTC5nZXRLZXkoa2V5KTtcbiAgICAgICAgICBpc1ZhbGlkID0gS0pVUi5qd3MuSldTLnZlcmlmeShpZFRva2VuLCBwdWJsaWNLZXksIFthbGddKTtcbiAgICAgICAgICBpZiAoIWlzVmFsaWQpIHtcbiAgICAgICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dXYXJuaW5nKGNvbmZpZ0lkLCAnaW5jb3JyZWN0IFNpZ25hdHVyZSwgdmFsaWRhdGlvbiBmYWlsZWQgZm9yIGlkX3Rva2VuJyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmV0dXJuIGlzVmFsaWQ7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gaXNWYWxpZDtcbiAgfVxuXG4gIC8vIEFjY2VwdHMgSUQgVG9rZW4gd2l0aG91dCAna2lkJyBjbGFpbSBpbiBKT1NFIGhlYWRlciBpZiBvbmx5IG9uZSBKV0sgc3VwcGxpZWQgaW4gJ2p3a3NfdXJsJ1xuICAvLy8vIHByaXZhdGUgdmFsaWRhdGVfbm9fa2lkX2luX2hlYWRlcl9vbmx5X29uZV9hbGxvd2VkX2luX2p3dGtleXMoaGVhZGVyX2RhdGE6IGFueSwgand0a2V5czogYW55KTogYm9vbGVhbiB7XG4gIC8vLy8gICAgdGhpcy5vaWRjU2VjdXJpdHlDb21tb24ubG9nRGVidWcoJ2Ftb3VudCBvZiBqd3RrZXlzLmtleXM6ICcgKyBqd3RrZXlzLmtleXMubGVuZ3RoKTtcbiAgLy8vLyAgICBpZiAoIWhlYWRlcl9kYXRhLmhhc093blByb3BlcnR5KCdraWQnKSkge1xuICAvLy8vICAgICAgICAvLyBubyBraWQgZGVmaW5lZCBpbiBKb3NlIGhlYWRlclxuICAvLy8vICAgICAgICBpZiAoand0a2V5cy5rZXlzLmxlbmd0aCAhPSAxKSB7XG4gIC8vLy8gICAgICAgICAgICB0aGlzLm9pZGNTZWN1cml0eUNvbW1vbi5sb2dEZWJ1Zygnand0a2V5cy5rZXlzLmxlbmd0aCAhPSAxIGFuZCBubyBraWQgaW4gaGVhZGVyJyk7XG4gIC8vLy8gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gIC8vLy8gICAgICAgIH1cbiAgLy8vLyAgICB9XG5cbiAgLy8vLyAgICByZXR1cm4gdHJ1ZTtcbiAgLy8vLyB9XG5cbiAgLy8gQWNjZXNzIFRva2VuIFZhbGlkYXRpb25cbiAgLy8gYWNjZXNzX3Rva2VuIEMxOiBIYXNoIHRoZSBvY3RldHMgb2YgdGhlIEFTQ0lJIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBhY2Nlc3NfdG9rZW4gd2l0aCB0aGUgaGFzaCBhbGdvcml0aG0gc3BlY2lmaWVkIGluIEpXQVtKV0FdXG4gIC8vIGZvciB0aGUgYWxnIEhlYWRlciBQYXJhbWV0ZXIgb2YgdGhlIElEIFRva2VuJ3MgSk9TRSBIZWFkZXIuIEZvciBpbnN0YW5jZSwgaWYgdGhlIGFsZyBpcyBSUzI1NiwgdGhlIGhhc2ggYWxnb3JpdGhtIHVzZWQgaXMgU0hBLTI1Ni5cbiAgLy8gYWNjZXNzX3Rva2VuIEMyOiBUYWtlIHRoZSBsZWZ0LSBtb3N0IGhhbGYgb2YgdGhlIGhhc2ggYW5kIGJhc2U2NHVybC0gZW5jb2RlIGl0LlxuICAvLyBhY2Nlc3NfdG9rZW4gQzM6IFRoZSB2YWx1ZSBvZiBhdF9oYXNoIGluIHRoZSBJRCBUb2tlbiBNVVNUIG1hdGNoIHRoZSB2YWx1ZSBwcm9kdWNlZCBpbiB0aGUgcHJldmlvdXMgc3RlcCBpZiBhdF9oYXNoXG4gIC8vIGlzIHByZXNlbnQgaW4gdGhlIElEIFRva2VuLlxuICB2YWxpZGF0ZUlkVG9rZW5BdEhhc2goYWNjZXNzVG9rZW46IGFueSwgYXRIYXNoOiBhbnksIGlkVG9rZW5BbGc6IHN0cmluZywgY29uZmlnSWQ6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1Zyhjb25maWdJZCwgJ2F0X2hhc2ggZnJvbSB0aGUgc2VydmVyOicgKyBhdEhhc2gpO1xuXG4gICAgLy8gJ3NoYTI1NicgJ3NoYTM4NCcgJ3NoYTUxMidcbiAgICBsZXQgc2hhID0gJ3NoYTI1Nic7XG4gICAgaWYgKGlkVG9rZW5BbGcuaW5jbHVkZXMoJzM4NCcpKSB7XG4gICAgICBzaGEgPSAnc2hhMzg0JztcbiAgICB9IGVsc2UgaWYgKGlkVG9rZW5BbGcuaW5jbHVkZXMoJzUxMicpKSB7XG4gICAgICBzaGEgPSAnc2hhNTEyJztcbiAgICB9XG5cbiAgICBjb25zdCB0ZXN0RGF0YSA9IHRoaXMuanNyc0FzaWduUmVkdWNlZFNlcnZpY2UuZ2VuZXJhdGVBdEhhc2goJycgKyBhY2Nlc3NUb2tlbiwgc2hhKTtcbiAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoY29uZmlnSWQsICdhdF9oYXNoIGNsaWVudCB2YWxpZGF0aW9uIG5vdCBkZWNvZGVkOicgKyB0ZXN0RGF0YSk7XG4gICAgaWYgKHRlc3REYXRhID09PSAoYXRIYXNoIGFzIHN0cmluZykpIHtcbiAgICAgIHJldHVybiB0cnVlOyAvLyBpc1ZhbGlkO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCB0ZXN0VmFsdWUgPSB0aGlzLmpzcnNBc2lnblJlZHVjZWRTZXJ2aWNlLmdlbmVyYXRlQXRIYXNoKCcnICsgZGVjb2RlVVJJQ29tcG9uZW50KGFjY2Vzc1Rva2VuKSwgc2hhKTtcbiAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1Zyhjb25maWdJZCwgJy1nZW4gYWNjZXNzLS0nICsgdGVzdFZhbHVlKTtcbiAgICAgIGlmICh0ZXN0VmFsdWUgPT09IChhdEhhc2ggYXMgc3RyaW5nKSkge1xuICAgICAgICByZXR1cm4gdHJ1ZTsgLy8gaXNWYWxpZFxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHByaXZhdGUgbWlsbGlzVG9NaW51dGVzQW5kU2Vjb25kcyhtaWxsaXM6IG51bWJlcik6IHN0cmluZyB7XG4gICAgY29uc3QgbWludXRlcyA9IE1hdGguZmxvb3IobWlsbGlzIC8gNjAwMDApO1xuICAgIGNvbnN0IHNlY29uZHMgPSAoKG1pbGxpcyAlIDYwMDAwKSAvIDEwMDApLnRvRml4ZWQoMCk7XG5cbiAgICByZXR1cm4gbWludXRlcyArICc6JyArICgrc2Vjb25kcyA8IDEwID8gJzAnIDogJycpICsgc2Vjb25kcztcbiAgfVxufVxuIl19