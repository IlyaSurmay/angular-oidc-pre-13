import { LoggerService } from '../../logging/logger.service';
import * as i0 from "@angular/core";
export declare class TokenHelperService {
    private readonly loggerService;
    constructor(loggerService: LoggerService);
    getTokenExpirationDate(dataIdToken: any): Date;
    getHeaderFromToken(token: any, encoded: boolean, configId: string): any;
    getPayloadFromToken(token: any, encoded: boolean, configId: string): any;
    getSignatureFromToken(token: any, encoded: boolean, configId: string): any;
    private getPartOfToken;
    private urlBase64Decode;
    private tokenIsValid;
    private extractPartOfToken;
    static ɵfac: i0.ɵɵFactoryDeclaration<TokenHelperService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<TokenHelperService>;
}
