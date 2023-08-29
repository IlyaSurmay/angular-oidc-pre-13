import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import * as i0 from "@angular/core";
import * as i1 from "../logging/logger.service";
import * as i2 from "../utils/url/url.service";
import * as i3 from "./silent-renew.service";
export class RefreshSessionIframeService {
    constructor(doc, loggerService, urlService, silentRenewService, rendererFactory) {
        this.doc = doc;
        this.loggerService = loggerService;
        this.urlService = urlService;
        this.silentRenewService = silentRenewService;
        this.renderer = rendererFactory.createRenderer(null, null);
    }
    refreshSessionWithIframe(configId, customParams) {
        this.loggerService.logDebug(configId, 'BEGIN refresh session Authorize Iframe renew');
        const url = this.urlService.getRefreshSessionSilentRenewUrl(configId, customParams);
        return this.sendAuthorizeRequestUsingSilentRenew(url, configId);
    }
    sendAuthorizeRequestUsingSilentRenew(url, configId) {
        const sessionIframe = this.silentRenewService.getOrCreateIframe(configId);
        this.initSilentRenewRequest(configId);
        this.loggerService.logDebug(configId, 'sendAuthorizeRequestUsingSilentRenew for URL:' + url);
        return new Observable((observer) => {
            const onLoadHandler = () => {
                sessionIframe.removeEventListener('load', onLoadHandler);
                this.loggerService.logDebug(configId, 'removed event listener from IFrame');
                observer.next(true);
                observer.complete();
            };
            sessionIframe.addEventListener('load', onLoadHandler);
            sessionIframe.contentWindow.location.replace(url);
        });
    }
    initSilentRenewRequest(configId) {
        const instanceId = Math.random();
        const initDestroyHandler = this.renderer.listen('window', 'oidc-silent-renew-init', (e) => {
            if (e.detail !== instanceId) {
                initDestroyHandler();
                renewDestroyHandler();
            }
        });
        const renewDestroyHandler = this.renderer.listen('window', 'oidc-silent-renew-message', (e) => this.silentRenewService.silentRenewEventHandler(e, configId));
        this.doc.defaultView.dispatchEvent(new CustomEvent('oidc-silent-renew-init', {
            detail: instanceId,
        }));
    }
}
RefreshSessionIframeService.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: RefreshSessionIframeService, deps: [{ token: DOCUMENT }, { token: i1.LoggerService }, { token: i2.UrlService }, { token: i3.SilentRenewService }, { token: i0.RendererFactory2 }], target: i0.ɵɵFactoryTarget.Injectable });
RefreshSessionIframeService.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: RefreshSessionIframeService, providedIn: 'root' });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: RefreshSessionIframeService, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }], ctorParameters: function () { return [{ type: undefined, decorators: [{
                    type: Inject,
                    args: [DOCUMENT]
                }] }, { type: i1.LoggerService }, { type: i2.UrlService }, { type: i3.SilentRenewService }, { type: i0.RendererFactory2 }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVmcmVzaC1zZXNzaW9uLWlmcmFtZS5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvYW5ndWxhci1hdXRoLW9pZGMtY2xpZW50L3NyYy9saWIvaWZyYW1lL3JlZnJlc2gtc2Vzc2lvbi1pZnJhbWUuc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFDM0MsT0FBTyxFQUFFLE1BQU0sRUFBRSxVQUFVLEVBQStCLE1BQU0sZUFBZSxDQUFDO0FBQ2hGLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxNQUFNLENBQUM7Ozs7O0FBTWxDLE1BQU0sT0FBTywyQkFBMkI7SUFHdEMsWUFDcUMsR0FBUSxFQUNuQyxhQUE0QixFQUM1QixVQUFzQixFQUN0QixrQkFBc0MsRUFDOUMsZUFBaUM7UUFKRSxRQUFHLEdBQUgsR0FBRyxDQUFLO1FBQ25DLGtCQUFhLEdBQWIsYUFBYSxDQUFlO1FBQzVCLGVBQVUsR0FBVixVQUFVLENBQVk7UUFDdEIsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFvQjtRQUc5QyxJQUFJLENBQUMsUUFBUSxHQUFHLGVBQWUsQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQzdELENBQUM7SUFFRCx3QkFBd0IsQ0FBQyxRQUFnQixFQUFFLFlBQTJEO1FBQ3BHLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRSw4Q0FBOEMsQ0FBQyxDQUFDO1FBQ3RGLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsK0JBQStCLENBQUMsUUFBUSxFQUFFLFlBQVksQ0FBQyxDQUFDO1FBRXBGLE9BQU8sSUFBSSxDQUFDLG9DQUFvQyxDQUFDLEdBQUcsRUFBRSxRQUFRLENBQUMsQ0FBQztJQUNsRSxDQUFDO0lBRU8sb0NBQW9DLENBQUMsR0FBVyxFQUFFLFFBQWdCO1FBQ3hFLE1BQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxpQkFBaUIsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUMxRSxJQUFJLENBQUMsc0JBQXNCLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDdEMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFLCtDQUErQyxHQUFHLEdBQUcsQ0FBQyxDQUFDO1FBRTdGLE9BQU8sSUFBSSxVQUFVLENBQUMsQ0FBQyxRQUFRLEVBQUUsRUFBRTtZQUNqQyxNQUFNLGFBQWEsR0FBRyxHQUFTLEVBQUU7Z0JBQy9CLGFBQWEsQ0FBQyxtQkFBbUIsQ0FBQyxNQUFNLEVBQUUsYUFBYSxDQUFDLENBQUM7Z0JBQ3pELElBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRSxvQ0FBb0MsQ0FBQyxDQUFDO2dCQUM1RSxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNwQixRQUFRLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDdEIsQ0FBQyxDQUFDO1lBQ0YsYUFBYSxDQUFDLGdCQUFnQixDQUFDLE1BQU0sRUFBRSxhQUFhLENBQUMsQ0FBQztZQUN0RCxhQUFhLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDcEQsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0lBRU8sc0JBQXNCLENBQUMsUUFBZ0I7UUFDN0MsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBRWpDLE1BQU0sa0JBQWtCLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLHdCQUF3QixFQUFFLENBQUMsQ0FBYyxFQUFFLEVBQUU7WUFDckcsSUFBSSxDQUFDLENBQUMsTUFBTSxLQUFLLFVBQVUsRUFBRTtnQkFDM0Isa0JBQWtCLEVBQUUsQ0FBQztnQkFDckIsbUJBQW1CLEVBQUUsQ0FBQzthQUN2QjtRQUNILENBQUMsQ0FBQyxDQUFDO1FBQ0gsTUFBTSxtQkFBbUIsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsMkJBQTJCLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUM1RixJQUFJLENBQUMsa0JBQWtCLENBQUMsdUJBQXVCLENBQUMsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxDQUM3RCxDQUFDO1FBRUYsSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsYUFBYSxDQUNoQyxJQUFJLFdBQVcsQ0FBQyx3QkFBd0IsRUFBRTtZQUN4QyxNQUFNLEVBQUUsVUFBVTtTQUNuQixDQUFDLENBQ0gsQ0FBQztJQUNKLENBQUM7O3dIQXZEVSwyQkFBMkIsa0JBSTVCLFFBQVE7NEhBSlAsMkJBQTJCLGNBRGQsTUFBTTsyRkFDbkIsMkJBQTJCO2tCQUR2QyxVQUFVO21CQUFDLEVBQUUsVUFBVSxFQUFFLE1BQU0sRUFBRTs7MEJBSzdCLE1BQU07MkJBQUMsUUFBUSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IERPQ1VNRU5UIH0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcbmltcG9ydCB7IEluamVjdCwgSW5qZWN0YWJsZSwgUmVuZGVyZXIyLCBSZW5kZXJlckZhY3RvcnkyIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBPYnNlcnZhYmxlIH0gZnJvbSAncnhqcyc7XG5pbXBvcnQgeyBMb2dnZXJTZXJ2aWNlIH0gZnJvbSAnLi4vbG9nZ2luZy9sb2dnZXIuc2VydmljZSc7XG5pbXBvcnQgeyBVcmxTZXJ2aWNlIH0gZnJvbSAnLi4vdXRpbHMvdXJsL3VybC5zZXJ2aWNlJztcbmltcG9ydCB7IFNpbGVudFJlbmV3U2VydmljZSB9IGZyb20gJy4vc2lsZW50LXJlbmV3LnNlcnZpY2UnO1xuXG5ASW5qZWN0YWJsZSh7IHByb3ZpZGVkSW46ICdyb290JyB9KVxuZXhwb3J0IGNsYXNzIFJlZnJlc2hTZXNzaW9uSWZyYW1lU2VydmljZSB7XG4gIHByaXZhdGUgcmVuZGVyZXI6IFJlbmRlcmVyMjtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBASW5qZWN0KERPQ1VNRU5UKSBwcml2YXRlIHJlYWRvbmx5IGRvYzogYW55LFxuICAgIHByaXZhdGUgbG9nZ2VyU2VydmljZTogTG9nZ2VyU2VydmljZSxcbiAgICBwcml2YXRlIHVybFNlcnZpY2U6IFVybFNlcnZpY2UsXG4gICAgcHJpdmF0ZSBzaWxlbnRSZW5ld1NlcnZpY2U6IFNpbGVudFJlbmV3U2VydmljZSxcbiAgICByZW5kZXJlckZhY3Rvcnk6IFJlbmRlcmVyRmFjdG9yeTJcbiAgKSB7XG4gICAgdGhpcy5yZW5kZXJlciA9IHJlbmRlcmVyRmFjdG9yeS5jcmVhdGVSZW5kZXJlcihudWxsLCBudWxsKTtcbiAgfVxuXG4gIHJlZnJlc2hTZXNzaW9uV2l0aElmcmFtZShjb25maWdJZDogc3RyaW5nLCBjdXN0b21QYXJhbXM/OiB7IFtrZXk6IHN0cmluZ106IHN0cmluZyB8IG51bWJlciB8IGJvb2xlYW4gfSk6IE9ic2VydmFibGU8Ym9vbGVhbj4ge1xuICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1Zyhjb25maWdJZCwgJ0JFR0lOIHJlZnJlc2ggc2Vzc2lvbiBBdXRob3JpemUgSWZyYW1lIHJlbmV3Jyk7XG4gICAgY29uc3QgdXJsID0gdGhpcy51cmxTZXJ2aWNlLmdldFJlZnJlc2hTZXNzaW9uU2lsZW50UmVuZXdVcmwoY29uZmlnSWQsIGN1c3RvbVBhcmFtcyk7XG5cbiAgICByZXR1cm4gdGhpcy5zZW5kQXV0aG9yaXplUmVxdWVzdFVzaW5nU2lsZW50UmVuZXcodXJsLCBjb25maWdJZCk7XG4gIH1cblxuICBwcml2YXRlIHNlbmRBdXRob3JpemVSZXF1ZXN0VXNpbmdTaWxlbnRSZW5ldyh1cmw6IHN0cmluZywgY29uZmlnSWQ6IHN0cmluZyk6IE9ic2VydmFibGU8Ym9vbGVhbj4ge1xuICAgIGNvbnN0IHNlc3Npb25JZnJhbWUgPSB0aGlzLnNpbGVudFJlbmV3U2VydmljZS5nZXRPckNyZWF0ZUlmcmFtZShjb25maWdJZCk7XG4gICAgdGhpcy5pbml0U2lsZW50UmVuZXdSZXF1ZXN0KGNvbmZpZ0lkKTtcbiAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoY29uZmlnSWQsICdzZW5kQXV0aG9yaXplUmVxdWVzdFVzaW5nU2lsZW50UmVuZXcgZm9yIFVSTDonICsgdXJsKTtcblxuICAgIHJldHVybiBuZXcgT2JzZXJ2YWJsZSgob2JzZXJ2ZXIpID0+IHtcbiAgICAgIGNvbnN0IG9uTG9hZEhhbmRsZXIgPSAoKTogdm9pZCA9PiB7XG4gICAgICAgIHNlc3Npb25JZnJhbWUucmVtb3ZlRXZlbnRMaXN0ZW5lcignbG9hZCcsIG9uTG9hZEhhbmRsZXIpO1xuICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoY29uZmlnSWQsICdyZW1vdmVkIGV2ZW50IGxpc3RlbmVyIGZyb20gSUZyYW1lJyk7XG4gICAgICAgIG9ic2VydmVyLm5leHQodHJ1ZSk7XG4gICAgICAgIG9ic2VydmVyLmNvbXBsZXRlKCk7XG4gICAgICB9O1xuICAgICAgc2Vzc2lvbklmcmFtZS5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgb25Mb2FkSGFuZGxlcik7XG4gICAgICBzZXNzaW9uSWZyYW1lLmNvbnRlbnRXaW5kb3cubG9jYXRpb24ucmVwbGFjZSh1cmwpO1xuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBpbml0U2lsZW50UmVuZXdSZXF1ZXN0KGNvbmZpZ0lkOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBjb25zdCBpbnN0YW5jZUlkID0gTWF0aC5yYW5kb20oKTtcblxuICAgIGNvbnN0IGluaXREZXN0cm95SGFuZGxlciA9IHRoaXMucmVuZGVyZXIubGlzdGVuKCd3aW5kb3cnLCAnb2lkYy1zaWxlbnQtcmVuZXctaW5pdCcsIChlOiBDdXN0b21FdmVudCkgPT4ge1xuICAgICAgaWYgKGUuZGV0YWlsICE9PSBpbnN0YW5jZUlkKSB7XG4gICAgICAgIGluaXREZXN0cm95SGFuZGxlcigpO1xuICAgICAgICByZW5ld0Rlc3Ryb3lIYW5kbGVyKCk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgY29uc3QgcmVuZXdEZXN0cm95SGFuZGxlciA9IHRoaXMucmVuZGVyZXIubGlzdGVuKCd3aW5kb3cnLCAnb2lkYy1zaWxlbnQtcmVuZXctbWVzc2FnZScsIChlKSA9PlxuICAgICAgdGhpcy5zaWxlbnRSZW5ld1NlcnZpY2Uuc2lsZW50UmVuZXdFdmVudEhhbmRsZXIoZSwgY29uZmlnSWQpXG4gICAgKTtcblxuICAgIHRoaXMuZG9jLmRlZmF1bHRWaWV3LmRpc3BhdGNoRXZlbnQoXG4gICAgICBuZXcgQ3VzdG9tRXZlbnQoJ29pZGMtc2lsZW50LXJlbmV3LWluaXQnLCB7XG4gICAgICAgIGRldGFpbDogaW5zdGFuY2VJZCxcbiAgICAgIH0pXG4gICAgKTtcbiAgfVxufVxuIl19