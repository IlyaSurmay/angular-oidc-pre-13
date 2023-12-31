import { LoggerService } from '../../logging/logger.service';
import { OpenIdConfiguration } from '../openid-configuration';
import * as i0 from "@angular/core";
export declare class ConfigValidationService {
    private loggerService;
    constructor(loggerService: LoggerService);
    validateConfigs(passedConfigs: OpenIdConfiguration[]): boolean;
    validateConfig(passedConfig: OpenIdConfiguration): boolean;
    private validateConfigsInternal;
    private validateConfigInternal;
    private processValidationResultsAndGetErrorCount;
    private getAllMessagesOfType;
    static ɵfac: i0.ɵɵFactoryDeclaration<ConfigValidationService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<ConfigValidationService>;
}
