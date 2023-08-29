import { ConfigurationProvider } from '../config/provider/config.provider';
import { CallbackContext } from '../flows/callback-context';
import { LoggerService } from '../logging/logger.service';
import { StoragePersistenceService } from '../storage/storage-persistence.service';
import { EqualityService } from '../utils/equality/equality.service';
import { FlowHelper } from '../utils/flowHelper/flow-helper.service';
import { TokenHelperService } from '../utils/tokenHelper/token-helper.service';
import { StateValidationResult } from './state-validation-result';
import { TokenValidationService } from './token-validation.service';
import * as i0 from "@angular/core";
export declare class StateValidationService {
    private storagePersistenceService;
    private tokenValidationService;
    private tokenHelperService;
    private loggerService;
    private configurationProvider;
    private equalityService;
    private flowHelper;
    constructor(storagePersistenceService: StoragePersistenceService, tokenValidationService: TokenValidationService, tokenHelperService: TokenHelperService, loggerService: LoggerService, configurationProvider: ConfigurationProvider, equalityService: EqualityService, flowHelper: FlowHelper);
    getValidatedStateResult(callbackContext: CallbackContext, configId: string): StateValidationResult;
    validateState(callbackContext: any, configId: string): StateValidationResult;
    private isIdTokenAfterRefreshTokenRequestValid;
    private handleSuccessfulValidation;
    private handleUnsuccessfulValidation;
    static ɵfac: i0.ɵɵFactoryDeclaration<StateValidationService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<StateValidationService>;
}
