import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { take } from 'rxjs/operators';
import { EventTypes } from '../public-events/event-types';
import * as i0 from "@angular/core";
import * as i1 from "../storage/storage-persistence.service";
import * as i2 from "../logging/logger.service";
import * as i3 from "./existing-iframe.service";
import * as i4 from "../public-events/public-events.service";
import * as i5 from "../config/provider/config.provider";
const IFRAME_FOR_CHECK_SESSION_IDENTIFIER = 'myiFrameForCheckSession';
// http://openid.net/specs/openid-connect-session-1_0-ID4.html
export class CheckSessionService {
    constructor(storagePersistenceService, loggerService, iFrameService, eventService, configurationProvider, zone) {
        this.storagePersistenceService = storagePersistenceService;
        this.loggerService = loggerService;
        this.iFrameService = iFrameService;
        this.eventService = eventService;
        this.configurationProvider = configurationProvider;
        this.zone = zone;
        this.checkSessionReceived = false;
        this.lastIFrameRefresh = 0;
        this.outstandingMessages = 0;
        this.heartBeatInterval = 3000;
        this.iframeRefreshInterval = 60000;
        this.checkSessionChangedInternal$ = new BehaviorSubject(false);
    }
    get checkSessionChanged$() {
        return this.checkSessionChangedInternal$.asObservable();
    }
    isCheckSessionConfigured(configId) {
        const { startCheckSession } = this.configurationProvider.getOpenIDConfiguration(configId);
        return startCheckSession;
    }
    start(configId) {
        if (!!this.scheduledHeartBeatRunning) {
            return;
        }
        const { clientId } = this.configurationProvider.getOpenIDConfiguration(configId);
        this.pollServerSession(clientId, configId);
    }
    stop() {
        if (!this.scheduledHeartBeatRunning) {
            return;
        }
        this.clearScheduledHeartBeat();
        this.checkSessionReceived = false;
    }
    serverStateChanged(configId) {
        const { startCheckSession } = this.configurationProvider.getOpenIDConfiguration(configId);
        return startCheckSession && this.checkSessionReceived;
    }
    getExistingIframe() {
        return this.iFrameService.getExistingIFrame(IFRAME_FOR_CHECK_SESSION_IDENTIFIER);
    }
    init(configId) {
        if (this.lastIFrameRefresh + this.iframeRefreshInterval > Date.now()) {
            return of(undefined);
        }
        const authWellKnownEndPoints = this.storagePersistenceService.read('authWellKnownEndPoints', configId);
        if (!authWellKnownEndPoints) {
            this.loggerService.logWarning(configId, 'CheckSession - init check session: authWellKnownEndpoints is undefined. Returning.');
            return of();
        }
        const existingIframe = this.getOrCreateIframe(configId);
        const checkSessionIframe = authWellKnownEndPoints.checkSessionIframe;
        if (checkSessionIframe) {
            existingIframe.contentWindow.location.replace(checkSessionIframe);
        }
        else {
            this.loggerService.logWarning(configId, 'CheckSession - init check session: checkSessionIframe is not configured to run');
        }
        return new Observable((observer) => {
            existingIframe.onload = () => {
                this.lastIFrameRefresh = Date.now();
                observer.next();
                observer.complete();
            };
        });
    }
    pollServerSession(clientId, configId) {
        this.outstandingMessages = 0;
        const pollServerSessionRecur = () => {
            this.init(configId)
                .pipe(take(1))
                .subscribe(() => {
                const existingIframe = this.getExistingIframe();
                if (existingIframe && clientId) {
                    this.loggerService.logDebug(configId, `CheckSession - clientId : '${clientId}' - existingIframe: '${existingIframe}'`);
                    const sessionState = this.storagePersistenceService.read('session_state', configId);
                    const authWellKnownEndPoints = this.storagePersistenceService.read('authWellKnownEndPoints', configId);
                    if (sessionState && authWellKnownEndPoints?.checkSessionIframe) {
                        const iframeOrigin = new URL(authWellKnownEndPoints.checkSessionIframe)?.origin;
                        this.outstandingMessages++;
                        existingIframe.contentWindow.postMessage(clientId + ' ' + sessionState, iframeOrigin);
                    }
                    else {
                        this.loggerService.logDebug(configId, `CheckSession - session_state is '${sessionState}' - AuthWellKnownEndPoints is '${JSON.stringify(authWellKnownEndPoints, null, 2)}'`);
                        this.checkSessionChangedInternal$.next(true);
                    }
                }
                else {
                    this.loggerService.logWarning(configId, `CheckSession - OidcSecurityCheckSession pollServerSession checkSession IFrame does not exist:
               clientId : '${clientId}' - existingIframe: '${existingIframe}'`);
                }
                // after sending three messages with no response, fail.
                if (this.outstandingMessages > 3) {
                    this.loggerService.logError(configId, `CheckSession - OidcSecurityCheckSession not receiving check session response messages.
                            Outstanding messages: '${this.outstandingMessages}'. Server unreachable?`);
                }
                this.zone.runOutsideAngular(() => {
                    this.scheduledHeartBeatRunning = setTimeout(() => this.zone.run(pollServerSessionRecur), this.heartBeatInterval);
                });
            });
        };
        pollServerSessionRecur();
    }
    clearScheduledHeartBeat() {
        clearTimeout(this.scheduledHeartBeatRunning);
        this.scheduledHeartBeatRunning = null;
    }
    messageHandler(configId, e) {
        const existingIFrame = this.getExistingIframe();
        const authWellKnownEndPoints = this.storagePersistenceService.read('authWellKnownEndPoints', configId);
        const startsWith = !!authWellKnownEndPoints?.checkSessionIframe?.startsWith(e.origin);
        this.outstandingMessages = 0;
        if (existingIFrame && startsWith && e.source === existingIFrame.contentWindow) {
            if (e.data === 'error') {
                this.loggerService.logWarning(configId, 'CheckSession - error from check session messageHandler');
            }
            else if (e.data === 'changed') {
                this.loggerService.logDebug(configId, `CheckSession - ${e} from check session messageHandler`);
                this.checkSessionReceived = true;
                this.eventService.fireEvent(EventTypes.CheckSessionReceived, e.data);
                this.checkSessionChangedInternal$.next(true);
            }
            else {
                this.eventService.fireEvent(EventTypes.CheckSessionReceived, e.data);
                this.loggerService.logDebug(configId, `CheckSession - ${e.data} from check session messageHandler`);
            }
        }
    }
    bindMessageEventToIframe(configId) {
        const iframeMessageEvent = this.messageHandler.bind(this, configId);
        window.addEventListener('message', iframeMessageEvent, false);
    }
    getOrCreateIframe(configId) {
        const existingIframe = this.getExistingIframe();
        if (!existingIframe) {
            const frame = this.iFrameService.addIFrameToWindowBody(IFRAME_FOR_CHECK_SESSION_IDENTIFIER, configId);
            this.bindMessageEventToIframe(configId);
            return frame;
        }
        return existingIframe;
    }
}
CheckSessionService.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: CheckSessionService, deps: [{ token: i1.StoragePersistenceService }, { token: i2.LoggerService }, { token: i3.IFrameService }, { token: i4.PublicEventsService }, { token: i5.ConfigurationProvider }, { token: i0.NgZone }], target: i0.ɵɵFactoryTarget.Injectable });
CheckSessionService.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: CheckSessionService });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: CheckSessionService, decorators: [{
            type: Injectable
        }], ctorParameters: function () { return [{ type: i1.StoragePersistenceService }, { type: i2.LoggerService }, { type: i3.IFrameService }, { type: i4.PublicEventsService }, { type: i5.ConfigurationProvider }, { type: i0.NgZone }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hlY2stc2Vzc2lvbi5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvYW5ndWxhci1hdXRoLW9pZGMtY2xpZW50L3NyYy9saWIvaWZyYW1lL2NoZWNrLXNlc3Npb24uc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFVLE1BQU0sZUFBZSxDQUFDO0FBQ25ELE9BQU8sRUFBRSxlQUFlLEVBQUUsVUFBVSxFQUFFLEVBQUUsRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUN2RCxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFHdEMsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLDhCQUE4QixDQUFDOzs7Ozs7O0FBSzFELE1BQU0sbUNBQW1DLEdBQUcseUJBQXlCLENBQUM7QUFFdEUsOERBQThEO0FBRzlELE1BQU0sT0FBTyxtQkFBbUI7SUFhOUIsWUFDVSx5QkFBb0QsRUFDcEQsYUFBNEIsRUFDNUIsYUFBNEIsRUFDNUIsWUFBaUMsRUFDakMscUJBQTRDLEVBQzVDLElBQVk7UUFMWiw4QkFBeUIsR0FBekIseUJBQXlCLENBQTJCO1FBQ3BELGtCQUFhLEdBQWIsYUFBYSxDQUFlO1FBQzVCLGtCQUFhLEdBQWIsYUFBYSxDQUFlO1FBQzVCLGlCQUFZLEdBQVosWUFBWSxDQUFxQjtRQUNqQywwQkFBcUIsR0FBckIscUJBQXFCLENBQXVCO1FBQzVDLFNBQUksR0FBSixJQUFJLENBQVE7UUFsQmQseUJBQW9CLEdBQUcsS0FBSyxDQUFDO1FBRTdCLHNCQUFpQixHQUFHLENBQUMsQ0FBQztRQUN0Qix3QkFBbUIsR0FBRyxDQUFDLENBQUM7UUFDeEIsc0JBQWlCLEdBQUcsSUFBSSxDQUFDO1FBQ3pCLDBCQUFxQixHQUFHLEtBQUssQ0FBQztRQUM5QixpQ0FBNEIsR0FBRyxJQUFJLGVBQWUsQ0FBVSxLQUFLLENBQUMsQ0FBQztJQWF4RSxDQUFD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LEVBQUUsQ0FBQztRQUVoRCxJQUFJLENBQUMsY0FBYyxFQUFFO1lBQ25CLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMscUJBQXFCLENBQUMsbUNBQW1DLEVBQUUsUUFBUSxDQUFDLENBQUM7WUFDdEcsSUFBSSxDQUFDLHdCQUF3QixDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBRXhDLE9BQU8sS0FBSyxDQUFDO1NBQ2Q7UUFFRCxPQUFPLGNBQWMsQ0FBQztJQUN4QixDQUFDOztnSEF2TFUsbUJBQW1CO29IQUFuQixtQkFBbUI7MkZBQW5CLG1CQUFtQjtrQkFEL0IsVUFBVSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEluamVjdGFibGUsIE5nWm9uZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgQmVoYXZpb3JTdWJqZWN0LCBPYnNlcnZhYmxlLCBvZiB9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHsgdGFrZSB9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcbmltcG9ydCB7IENvbmZpZ3VyYXRpb25Qcm92aWRlciB9IGZyb20gJy4uL2NvbmZpZy9wcm92aWRlci9jb25maWcucHJvdmlkZXInO1xuaW1wb3J0IHsgTG9nZ2VyU2VydmljZSB9IGZyb20gJy4uL2xvZ2dpbmcvbG9nZ2VyLnNlcnZpY2UnO1xuaW1wb3J0IHsgRXZlbnRUeXBlcyB9IGZyb20gJy4uL3B1YmxpYy1ldmVudHMvZXZlbnQtdHlwZXMnO1xuaW1wb3J0IHsgUHVibGljRXZlbnRzU2VydmljZSB9IGZyb20gJy4uL3B1YmxpYy1ldmVudHMvcHVibGljLWV2ZW50cy5zZXJ2aWNlJztcbmltcG9ydCB7IFN0b3JhZ2VQZXJzaXN0ZW5jZVNlcnZpY2UgfSBmcm9tICcuLi9zdG9yYWdlL3N0b3JhZ2UtcGVyc2lzdGVuY2Uuc2VydmljZSc7XG5pbXBvcnQgeyBJRnJhbWVTZXJ2aWNlIH0gZnJvbSAnLi9leGlzdGluZy1pZnJhbWUuc2VydmljZSc7XG5cbmNvbnN0IElGUkFNRV9GT1JfQ0hFQ0tfU0VTU0lPTl9JREVOVElGSUVSID0gJ215aUZyYW1lRm9yQ2hlY2tTZXNzaW9uJztcblxuLy8gaHR0cDovL29wZW5pZC5uZXQvc3BlY3Mvb3BlbmlkLWNvbm5lY3Qtc2Vzc2lvbi0xXzAtSUQ0Lmh0bWxcblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIENoZWNrU2Vzc2lvblNlcnZpY2Uge1xuICBwcml2YXRlIGNoZWNrU2Vzc2lvblJlY2VpdmVkID0gZmFsc2U7XG4gIHByaXZhdGUgc2NoZWR1bGVkSGVhcnRCZWF0UnVubmluZzogYW55O1xuICBwcml2YXRlIGxhc3RJRnJhbWVSZWZyZXNoID0gMDtcbiAgcHJpdmF0ZSBvdXRzdGFuZGluZ01lc3NhZ2VzID0gMDtcbiAgcHJpdmF0ZSBoZWFydEJlYXRJbnRlcnZhbCA9IDMwMDA7XG4gIHByaXZhdGUgaWZyYW1lUmVmcmVzaEludGVydmFsID0gNjAwMDA7XG4gIHByaXZhdGUgY2hlY2tTZXNzaW9uQ2hhbmdlZEludGVybmFsJCA9IG5ldyBCZWhhdmlvclN1YmplY3Q8Ym9vbGVhbj4oZmFsc2UpO1xuXG4gIGdldCBjaGVja1Nlc3Npb25DaGFuZ2VkJCgpOiBPYnNlcnZhYmxlPGJvb2xlYW4+IHtcbiAgICByZXR1cm4gdGhpcy5jaGVja1Nlc3Npb25DaGFuZ2VkSW50ZXJuYWwkLmFzT2JzZXJ2YWJsZSgpO1xuICB9XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSBzdG9yYWdlUGVyc2lzdGVuY2VTZXJ2aWNlOiBTdG9yYWdlUGVyc2lzdGVuY2VTZXJ2aWNlLFxuICAgIHByaXZhdGUgbG9nZ2VyU2VydmljZTogTG9nZ2VyU2VydmljZSxcbiAgICBwcml2YXRlIGlGcmFtZVNlcnZpY2U6IElGcmFtZVNlcnZpY2UsXG4gICAgcHJpdmF0ZSBldmVudFNlcnZpY2U6IFB1YmxpY0V2ZW50c1NlcnZpY2UsXG4gICAgcHJpdmF0ZSBjb25maWd1cmF0aW9uUHJvdmlkZXI6IENvbmZpZ3VyYXRpb25Qcm92aWRlcixcbiAgICBwcml2YXRlIHpvbmU6IE5nWm9uZVxuICApIHt9XG5cbiAgaXNDaGVja1Nlc3Npb25Db25maWd1cmVkKGNvbmZpZ0lkOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICBjb25zdCB7IHN0YXJ0Q2hlY2tTZXNzaW9uIH0gPSB0aGlzLmNvbmZpZ3VyYXRpb25Qcm92aWRlci5nZXRPcGVuSURDb25maWd1cmF0aW9uKGNvbmZpZ0lkKTtcblxuICAgIHJldHVybiBzdGFydENoZWNrU2Vzc2lvbjtcbiAgfVxuXG4gIHN0YXJ0KGNvbmZpZ0lkOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBpZiAoISF0aGlzLnNjaGVkdWxlZEhlYXJ0QmVhdFJ1bm5pbmcpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCB7IGNsaWVudElkIH0gPSB0aGlzLmNvbmZpZ3VyYXRpb25Qcm92aWRlci5nZXRPcGVuSURDb25maWd1cmF0aW9uKGNvbmZpZ0lkKTtcbiAgICB0aGlzLnBvbGxTZXJ2ZXJTZXNzaW9uKGNsaWVudElkLCBjb25maWdJZCk7XG4gIH1cblxuICBzdG9wKCk6IHZvaWQge1xuICAgIGlmICghdGhpcy5zY2hlZHVsZWRIZWFydEJlYXRSdW5uaW5nKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5jbGVhclNjaGVkdWxlZEhlYXJ0QmVhdCgpO1xuICAgIHRoaXMuY2hlY2tTZXNzaW9uUmVjZWl2ZWQgPSBmYWxzZTtcbiAgfVxuXG4gIHNlcnZlclN0YXRlQ2hhbmdlZChjb25maWdJZDogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgY29uc3QgeyBzdGFydENoZWNrU2Vzc2lvbiB9ID0gdGhpcy5jb25maWd1cmF0aW9uUHJvdmlkZXIuZ2V0T3BlbklEQ29uZmlndXJhdGlvbihjb25maWdJZCk7XG5cbiAgICByZXR1cm4gc3RhcnRDaGVja1Nlc3Npb24gJiYgdGhpcy5jaGVja1Nlc3Npb25SZWNlaXZlZDtcbiAgfVxuXG4gIGdldEV4aXN0aW5nSWZyYW1lKCk6IEhUTUxJRnJhbWVFbGVtZW50IHtcbiAgICByZXR1cm4gdGhpcy5pRnJhbWVTZXJ2aWNlLmdldEV4aXN0aW5nSUZyYW1lKElGUkFNRV9GT1JfQ0hFQ0tfU0VTU0lPTl9JREVOVElGSUVSKTtcbiAgfVxuXG4gIHByaXZhdGUgaW5pdChjb25maWdJZDogc3RyaW5nKTogT2JzZXJ2YWJsZTxhbnk+IHtcbiAgICBpZiAodGhpcy5sYXN0SUZyYW1lUmVmcmVzaCArIHRoaXMuaWZyYW1lUmVmcmVzaEludGVydmFsID4gRGF0ZS5ub3coKSkge1xuICAgICAgcmV0dXJuIG9mKHVuZGVmaW5lZCk7XG4gICAgfVxuXG4gICAgY29uc3QgYXV0aFdlbGxLbm93bkVuZFBvaW50cyA9IHRoaXMuc3RvcmFnZVBlcnNpc3RlbmNlU2VydmljZS5yZWFkKCdhdXRoV2VsbEtub3duRW5kUG9pbnRzJywgY29uZmlnSWQpO1xuXG4gICAgaWYgKCFhdXRoV2VsbEtub3duRW5kUG9pbnRzKSB7XG4gICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nV2FybmluZyhjb25maWdJZCwgJ0NoZWNrU2Vzc2lvbiAtIGluaXQgY2hlY2sgc2Vzc2lvbjogYXV0aFdlbGxLbm93bkVuZHBvaW50cyBpcyB1bmRlZmluZWQuIFJldHVybmluZy4nKTtcblxuICAgICAgcmV0dXJuIG9mKCk7XG4gICAgfVxuXG4gICAgY29uc3QgZXhpc3RpbmdJZnJhbWUgPSB0aGlzLmdldE9yQ3JlYXRlSWZyYW1lKGNvbmZpZ0lkKTtcbiAgICBjb25zdCBjaGVja1Nlc3Npb25JZnJhbWUgPSBhdXRoV2VsbEtub3duRW5kUG9pbnRzLmNoZWNrU2Vzc2lvbklmcmFtZTtcblxuICAgIGlmIChjaGVja1Nlc3Npb25JZnJhbWUpIHtcbiAgICAgIGV4aXN0aW5nSWZyYW1lLmNvbnRlbnRXaW5kb3cubG9jYXRpb24ucmVwbGFjZShjaGVja1Nlc3Npb25JZnJhbWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nV2FybmluZyhjb25maWdJZCwgJ0NoZWNrU2Vzc2lvbiAtIGluaXQgY2hlY2sgc2Vzc2lvbjogY2hlY2tTZXNzaW9uSWZyYW1lIGlzIG5vdCBjb25maWd1cmVkIHRvIHJ1bicpO1xuICAgIH1cblxuICAgIHJldHVybiBuZXcgT2JzZXJ2YWJsZSgob2JzZXJ2ZXIpID0+IHtcbiAgICAgIGV4aXN0aW5nSWZyYW1lLm9ubG9hZCA9ICgpOiB2b2lkID0+IHtcbiAgICAgICAgdGhpcy5sYXN0SUZyYW1lUmVmcmVzaCA9IERhdGUubm93KCk7XG4gICAgICAgIG9ic2VydmVyLm5leHQoKTtcbiAgICAgICAgb2JzZXJ2ZXIuY29tcGxldGUoKTtcbiAgICAgIH07XG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIHBvbGxTZXJ2ZXJTZXNzaW9uKGNsaWVudElkOiBzdHJpbmcsIGNvbmZpZ0lkOiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLm91dHN0YW5kaW5nTWVzc2FnZXMgPSAwO1xuICAgIGNvbnN0IHBvbGxTZXJ2ZXJTZXNzaW9uUmVjdXIgPSAoKTogdm9pZCA9PiB7XG4gICAgICB0aGlzLmluaXQoY29uZmlnSWQpXG4gICAgICAgIC5waXBlKHRha2UoMSkpXG4gICAgICAgIC5zdWJzY3JpYmUoKCkgPT4ge1xuICAgICAgICAgIGNvbnN0IGV4aXN0aW5nSWZyYW1lID0gdGhpcy5nZXRFeGlzdGluZ0lmcmFtZSgpO1xuICAgICAgICAgIGlmIChleGlzdGluZ0lmcmFtZSAmJiBjbGllbnRJZCkge1xuICAgICAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKGNvbmZpZ0lkLCBgQ2hlY2tTZXNzaW9uIC0gY2xpZW50SWQgOiAnJHtjbGllbnRJZH0nIC0gZXhpc3RpbmdJZnJhbWU6ICcke2V4aXN0aW5nSWZyYW1lfSdgKTtcbiAgICAgICAgICAgIGNvbnN0IHNlc3Npb25TdGF0ZSA9IHRoaXMuc3RvcmFnZVBlcnNpc3RlbmNlU2VydmljZS5yZWFkKCdzZXNzaW9uX3N0YXRlJywgY29uZmlnSWQpO1xuICAgICAgICAgICAgY29uc3QgYXV0aFdlbGxLbm93bkVuZFBvaW50cyA9IHRoaXMuc3RvcmFnZVBlcnNpc3RlbmNlU2VydmljZS5yZWFkKCdhdXRoV2VsbEtub3duRW5kUG9pbnRzJywgY29uZmlnSWQpO1xuXG4gICAgICAgICAgICBpZiAoc2Vzc2lvblN0YXRlICYmIGF1dGhXZWxsS25vd25FbmRQb2ludHM/LmNoZWNrU2Vzc2lvbklmcmFtZSkge1xuICAgICAgICAgICAgICBjb25zdCBpZnJhbWVPcmlnaW4gPSBuZXcgVVJMKGF1dGhXZWxsS25vd25FbmRQb2ludHMuY2hlY2tTZXNzaW9uSWZyYW1lKT8ub3JpZ2luO1xuICAgICAgICAgICAgICB0aGlzLm91dHN0YW5kaW5nTWVzc2FnZXMrKztcbiAgICAgICAgICAgICAgZXhpc3RpbmdJZnJhbWUuY29udGVudFdpbmRvdy5wb3N0TWVzc2FnZShjbGllbnRJZCArICcgJyArIHNlc3Npb25TdGF0ZSwgaWZyYW1lT3JpZ2luKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1ZyhcbiAgICAgICAgICAgICAgICBjb25maWdJZCxcbiAgICAgICAgICAgICAgICBgQ2hlY2tTZXNzaW9uIC0gc2Vzc2lvbl9zdGF0ZSBpcyAnJHtzZXNzaW9uU3RhdGV9JyAtIEF1dGhXZWxsS25vd25FbmRQb2ludHMgaXMgJyR7SlNPTi5zdHJpbmdpZnkoXG4gICAgICAgICAgICAgICAgICBhdXRoV2VsbEtub3duRW5kUG9pbnRzLFxuICAgICAgICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgICAgICAgIDJcbiAgICAgICAgICAgICAgICApfSdgXG4gICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgIHRoaXMuY2hlY2tTZXNzaW9uQ2hhbmdlZEludGVybmFsJC5uZXh0KHRydWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nV2FybmluZyhcbiAgICAgICAgICAgICAgY29uZmlnSWQsXG4gICAgICAgICAgICAgIGBDaGVja1Nlc3Npb24gLSBPaWRjU2VjdXJpdHlDaGVja1Nlc3Npb24gcG9sbFNlcnZlclNlc3Npb24gY2hlY2tTZXNzaW9uIElGcmFtZSBkb2VzIG5vdCBleGlzdDpcbiAgICAgICAgICAgICAgIGNsaWVudElkIDogJyR7Y2xpZW50SWR9JyAtIGV4aXN0aW5nSWZyYW1lOiAnJHtleGlzdGluZ0lmcmFtZX0nYFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBhZnRlciBzZW5kaW5nIHRocmVlIG1lc3NhZ2VzIHdpdGggbm8gcmVzcG9uc2UsIGZhaWwuXG4gICAgICAgICAgaWYgKHRoaXMub3V0c3RhbmRpbmdNZXNzYWdlcyA+IDMpIHtcbiAgICAgICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dFcnJvcihcbiAgICAgICAgICAgICAgY29uZmlnSWQsXG4gICAgICAgICAgICAgIGBDaGVja1Nlc3Npb24gLSBPaWRjU2VjdXJpdHlDaGVja1Nlc3Npb24gbm90IHJlY2VpdmluZyBjaGVjayBzZXNzaW9uIHJlc3BvbnNlIG1lc3NhZ2VzLlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIE91dHN0YW5kaW5nIG1lc3NhZ2VzOiAnJHt0aGlzLm91dHN0YW5kaW5nTWVzc2FnZXN9Jy4gU2VydmVyIHVucmVhY2hhYmxlP2BcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgdGhpcy56b25lLnJ1bk91dHNpZGVBbmd1bGFyKCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuc2NoZWR1bGVkSGVhcnRCZWF0UnVubmluZyA9IHNldFRpbWVvdXQoKCkgPT4gdGhpcy56b25lLnJ1bihwb2xsU2VydmVyU2Vzc2lvblJlY3VyKSwgdGhpcy5oZWFydEJlYXRJbnRlcnZhbCk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBwb2xsU2VydmVyU2Vzc2lvblJlY3VyKCk7XG4gIH1cblxuICBwcml2YXRlIGNsZWFyU2NoZWR1bGVkSGVhcnRCZWF0KCk6IHZvaWQge1xuICAgIGNsZWFyVGltZW91dCh0aGlzLnNjaGVkdWxlZEhlYXJ0QmVhdFJ1bm5pbmcpO1xuICAgIHRoaXMuc2NoZWR1bGVkSGVhcnRCZWF0UnVubmluZyA9IG51bGw7XG4gIH1cblxuICBwcml2YXRlIG1lc3NhZ2VIYW5kbGVyKGNvbmZpZ0lkOiBzdHJpbmcsIGU6IGFueSk6IHZvaWQge1xuICAgIGNvbnN0IGV4aXN0aW5nSUZyYW1lID0gdGhpcy5nZXRFeGlzdGluZ0lmcmFtZSgpO1xuICAgIGNvbnN0IGF1dGhXZWxsS25vd25FbmRQb2ludHMgPSB0aGlzLnN0b3JhZ2VQZXJzaXN0ZW5jZVNlcnZpY2UucmVhZCgnYXV0aFdlbGxLbm93bkVuZFBvaW50cycsIGNvbmZpZ0lkKTtcbiAgICBjb25zdCBzdGFydHNXaXRoID0gISFhdXRoV2VsbEtub3duRW5kUG9pbnRzPy5jaGVja1Nlc3Npb25JZnJhbWU/LnN0YXJ0c1dpdGgoZS5vcmlnaW4pO1xuXG4gICAgdGhpcy5vdXRzdGFuZGluZ01lc3NhZ2VzID0gMDtcblxuICAgIGlmIChleGlzdGluZ0lGcmFtZSAmJiBzdGFydHNXaXRoICYmIGUuc291cmNlID09PSBleGlzdGluZ0lGcmFtZS5jb250ZW50V2luZG93KSB7XG4gICAgICBpZiAoZS5kYXRhID09PSAnZXJyb3InKSB7XG4gICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dXYXJuaW5nKGNvbmZpZ0lkLCAnQ2hlY2tTZXNzaW9uIC0gZXJyb3IgZnJvbSBjaGVjayBzZXNzaW9uIG1lc3NhZ2VIYW5kbGVyJyk7XG4gICAgICB9IGVsc2UgaWYgKGUuZGF0YSA9PT0gJ2NoYW5nZWQnKSB7XG4gICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1Zyhjb25maWdJZCwgYENoZWNrU2Vzc2lvbiAtICR7ZX0gZnJvbSBjaGVjayBzZXNzaW9uIG1lc3NhZ2VIYW5kbGVyYCk7XG4gICAgICAgIHRoaXMuY2hlY2tTZXNzaW9uUmVjZWl2ZWQgPSB0cnVlO1xuICAgICAgICB0aGlzLmV2ZW50U2VydmljZS5maXJlRXZlbnQoRXZlbnRUeXBlcy5DaGVja1Nlc3Npb25SZWNlaXZlZCwgZS5kYXRhKTtcbiAgICAgICAgdGhpcy5jaGVja1Nlc3Npb25DaGFuZ2VkSW50ZXJuYWwkLm5leHQodHJ1ZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmV2ZW50U2VydmljZS5maXJlRXZlbnQoRXZlbnRUeXBlcy5DaGVja1Nlc3Npb25SZWNlaXZlZCwgZS5kYXRhKTtcbiAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKGNvbmZpZ0lkLCBgQ2hlY2tTZXNzaW9uIC0gJHtlLmRhdGF9IGZyb20gY2hlY2sgc2Vzc2lvbiBtZXNzYWdlSGFuZGxlcmApO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgYmluZE1lc3NhZ2VFdmVudFRvSWZyYW1lKGNvbmZpZ0lkOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBjb25zdCBpZnJhbWVNZXNzYWdlRXZlbnQgPSB0aGlzLm1lc3NhZ2VIYW5kbGVyLmJpbmQodGhpcywgY29uZmlnSWQpO1xuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgaWZyYW1lTWVzc2FnZUV2ZW50LCBmYWxzZSk7XG4gIH1cblxuICBwcml2YXRlIGdldE9yQ3JlYXRlSWZyYW1lKGNvbmZpZ0lkOiBzdHJpbmcpOiBIVE1MSUZyYW1lRWxlbWVudCB7XG4gICAgY29uc3QgZXhpc3RpbmdJZnJhbWUgPSB0aGlzLmdldEV4aXN0aW5nSWZyYW1lKCk7XG5cbiAgICBpZiAoIWV4aXN0aW5nSWZyYW1lKSB7XG4gICAgICBjb25zdCBmcmFtZSA9IHRoaXMuaUZyYW1lU2VydmljZS5hZGRJRnJhbWVUb1dpbmRvd0JvZHkoSUZSQU1FX0ZPUl9DSEVDS19TRVNTSU9OX0lERU5USUZJRVIsIGNvbmZpZ0lkKTtcbiAgICAgIHRoaXMuYmluZE1lc3NhZ2VFdmVudFRvSWZyYW1lKGNvbmZpZ0lkKTtcblxuICAgICAgcmV0dXJuIGZyYW1lO1xuICAgIH1cblxuICAgIHJldHVybiBleGlzdGluZ0lmcmFtZTtcbiAgfVxufVxuIl19