import { Observable } from 'rxjs';
import { AuthStateService } from '../auth-state/auth-state.service';
import { ImplicitFlowCallbackService } from '../callback/implicit-flow-callback.service';
import { IntervalService } from '../callback/interval.service';
import { ConfigurationProvider } from '../config/provider/config.provider';
import { CallbackContext } from '../flows/callback-context';
import { FlowsDataService } from '../flows/flows-data.service';
import { FlowsService } from '../flows/flows.service';
import { ResetAuthDataService } from '../flows/reset-auth-data.service';
import { LoggerService } from '../logging/logger.service';
import { FlowHelper } from '../utils/flowHelper/flow-helper.service';
import { IFrameService } from './existing-iframe.service';
import * as i0 from "@angular/core";
export declare class SilentRenewService {
    private configurationProvider;
    private iFrameService;
    private flowsService;
    private resetAuthDataService;
    private flowsDataService;
    private authStateService;
    private loggerService;
    private flowHelper;
    private implicitFlowCallbackService;
    private intervalService;
    private refreshSessionWithIFrameCompletedInternal$;
    get refreshSessionWithIFrameCompleted$(): Observable<CallbackContext>;
    constructor(configurationProvider: ConfigurationProvider, iFrameService: IFrameService, flowsService: FlowsService, resetAuthDataService: ResetAuthDataService, flowsDataService: FlowsDataService, authStateService: AuthStateService, loggerService: LoggerService, flowHelper: FlowHelper, implicitFlowCallbackService: ImplicitFlowCallbackService, intervalService: IntervalService);
    getOrCreateIframe(configId: string): HTMLIFrameElement;
    isSilentRenewConfigured(configId: string): boolean;
    codeFlowCallbackSilentRenewIframe(urlParts: any, configId: string): Observable<CallbackContext>;
    silentRenewEventHandler(e: CustomEvent, configId: string): void;
    private getExistingIframe;
    static ɵfac: i0.ɵɵFactoryDeclaration<SilentRenewService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<SilentRenewService>;
}
