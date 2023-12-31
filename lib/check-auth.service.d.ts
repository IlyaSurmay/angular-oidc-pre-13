import { Observable } from 'rxjs';
import { AuthStateService } from './auth-state/auth-state.service';
import { AutoLoginService } from './auto-login/auto-login.service';
import { CallbackService } from './callback/callback.service';
import { PeriodicallyTokenCheckService } from './callback/periodically-token-check.service';
import { RefreshSessionService } from './callback/refresh-session.service';
import { ConfigurationProvider } from './config/provider/config.provider';
import { CheckSessionService } from './iframe/check-session.service';
import { SilentRenewService } from './iframe/silent-renew.service';
import { LoggerService } from './logging/logger.service';
import { LoginResponse } from './login/login-response';
import { PopUpService } from './login/popup/popup.service';
import { StoragePersistenceService } from './storage/storage-persistence.service';
import { UserService } from './user-data/user.service';
import { CurrentUrlService } from './utils/url/current-url.service';
import * as i0 from "@angular/core";
export declare class CheckAuthService {
    private checkSessionService;
    private currentUrlService;
    private silentRenewService;
    private userService;
    private loggerService;
    private configurationProvider;
    private authStateService;
    private callbackService;
    private refreshSessionService;
    private periodicallyTokenCheckService;
    private popupService;
    private autoLoginService;
    private storagePersistenceService;
    constructor(checkSessionService: CheckSessionService, currentUrlService: CurrentUrlService, silentRenewService: SilentRenewService, userService: UserService, loggerService: LoggerService, configurationProvider: ConfigurationProvider, authStateService: AuthStateService, callbackService: CallbackService, refreshSessionService: RefreshSessionService, periodicallyTokenCheckService: PeriodicallyTokenCheckService, popupService: PopUpService, autoLoginService: AutoLoginService, storagePersistenceService: StoragePersistenceService);
    checkAuth(passedConfigId?: string, url?: string): Observable<LoginResponse>;
    checkAuthMultiple(passedConfigId?: string, url?: string): Observable<LoginResponse[]>;
    checkAuthIncludingServer(configId: string): Observable<LoginResponse>;
    private checkAuthWithConfig;
    private startCheckSessionAndValidation;
    private getConfigurationWithUrlState;
    private composeMultipleLoginResults;
    static ɵfac: i0.ɵɵFactoryDeclaration<CheckAuthService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<CheckAuthService>;
}
