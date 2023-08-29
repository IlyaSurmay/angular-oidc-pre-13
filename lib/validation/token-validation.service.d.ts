import { LoggerService } from '../logging/logger.service';
import { TokenHelperService } from '../utils/tokenHelper/token-helper.service';
import { JsrsAsignReducedService } from './jsrsasign-reduced.service';
import * as i0 from "@angular/core";
export declare class TokenValidationService {
    private tokenHelperService;
    private loggerService;
    private jsrsAsignReducedService;
    static refreshTokenNoncePlaceholder: string;
    keyAlgorithms: string[];
    constructor(tokenHelperService: TokenHelperService, loggerService: LoggerService, jsrsAsignReducedService: JsrsAsignReducedService);
    hasIdTokenExpired(token: string, configId: string, offsetSeconds?: number): boolean;
    validateIdTokenExpNotExpired(decodedIdToken: string, configId: string, offsetSeconds?: number): boolean;
    validateAccessTokenNotExpired(accessTokenExpiresAt: Date, configId: string, offsetSeconds?: number): boolean;
    validateRequiredIdToken(dataIdToken: any, configId: string): boolean;
    validateIdTokenIatMaxOffset(dataIdToken: any, maxOffsetAllowedInSeconds: number, disableIatOffsetValidation: boolean, configId: string): boolean;
    validateIdTokenNonce(dataIdToken: any, localNonce: any, ignoreNonceAfterRefresh: boolean, configId: string): boolean;
    validateIdTokenIss(dataIdToken: any, authWellKnownEndpointsIssuer: any, configId: string): boolean;
    validateIdTokenAud(dataIdToken: any, aud: any, configId: string): boolean;
    validateIdTokenAzpExistsIfMoreThanOneAud(dataIdToken: any): boolean;
    validateIdTokenAzpValid(dataIdToken: any, clientId: string): boolean;
    validateStateFromHashCallback(state: any, localState: any, configId: string): boolean;
    validateSignatureIdToken(idToken: any, jwtkeys: any, configId: string): boolean;
    validateIdTokenAtHash(accessToken: any, atHash: any, idTokenAlg: string, configId: string): boolean;
    private millisToMinutesAndSeconds;
    static ɵfac: i0.ɵɵFactoryDeclaration<TokenValidationService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<TokenValidationService>;
}
