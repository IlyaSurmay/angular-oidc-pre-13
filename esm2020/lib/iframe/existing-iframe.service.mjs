import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import * as i0 from "@angular/core";
import * as i1 from "../logging/logger.service";
export class IFrameService {
    constructor(doc, loggerService) {
        this.doc = doc;
        this.loggerService = loggerService;
    }
    getExistingIFrame(identifier) {
        const iFrameOnParent = this.getIFrameFromParentWindow(identifier);
        if (this.isIFrameElement(iFrameOnParent)) {
            return iFrameOnParent;
        }
        const iFrameOnSelf = this.getIFrameFromWindow(identifier);
        if (this.isIFrameElement(iFrameOnSelf)) {
            return iFrameOnSelf;
        }
        return null;
    }
    addIFrameToWindowBody(identifier, configId) {
        const sessionIframe = this.doc.createElement('iframe');
        sessionIframe.id = identifier;
        sessionIframe.title = identifier;
        this.loggerService.logDebug(configId, sessionIframe);
        sessionIframe.style.display = 'none';
        this.doc.body.appendChild(sessionIframe);
        return sessionIframe;
    }
    getIFrameFromParentWindow(identifier) {
        try {
            const iFrameElement = this.doc.defaultView.parent.document.getElementById(identifier);
            if (this.isIFrameElement(iFrameElement)) {
                return iFrameElement;
            }
            return null;
        }
        catch (e) {
            return null;
        }
    }
    getIFrameFromWindow(identifier) {
        const iFrameElement = this.doc.getElementById(identifier);
        if (this.isIFrameElement(iFrameElement)) {
            return iFrameElement;
        }
        return null;
    }
    isIFrameElement(element) {
        return !!element && element instanceof HTMLIFrameElement;
    }
}
IFrameService.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: IFrameService, deps: [{ token: DOCUMENT }, { token: i1.LoggerService }], target: i0.ɵɵFactoryTarget.Injectable });
IFrameService.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: IFrameService });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: IFrameService, decorators: [{
            type: Injectable
        }], ctorParameters: function () { return [{ type: undefined, decorators: [{
                    type: Inject,
                    args: [DOCUMENT]
                }] }, { type: i1.LoggerService }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhpc3RpbmctaWZyYW1lLnNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy9hbmd1bGFyLWF1dGgtb2lkYy1jbGllbnQvc3JjL2xpYi9pZnJhbWUvZXhpc3RpbmctaWZyYW1lLnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBQzNDLE9BQU8sRUFBRSxNQUFNLEVBQUUsVUFBVSxFQUFFLE1BQU0sZUFBZSxDQUFDOzs7QUFJbkQsTUFBTSxPQUFPLGFBQWE7SUFDeEIsWUFBK0MsR0FBUSxFQUFVLGFBQTRCO1FBQTlDLFFBQUcsR0FBSCxHQUFHLENBQUs7UUFBVSxrQkFBYSxHQUFiLGFBQWEsQ0FBZTtJQUFHLENBQUM7SUFFakcsaUJBQWlCLENBQUMsVUFBa0I7UUFDbEMsTUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLHlCQUF5QixDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ2xFLElBQUksSUFBSSxDQUFDLGVBQWUsQ0FBQyxjQUFjLENBQUMsRUFBRTtZQUN4QyxPQUFPLGNBQWMsQ0FBQztTQUN2QjtRQUVELE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUMxRCxJQUFJLElBQUksQ0FBQyxlQUFlLENBQUMsWUFBWSxDQUFDLEVBQUU7WUFDdEMsT0FBTyxZQUFZLENBQUM7U0FDckI7UUFFRCxPQUFPLElBQUksQ0FBQztJQUNkLENBQUM7SUFFRCxxQkFBcUIsQ0FBQyxVQUFrQixFQUFFLFFBQWdCO1FBQ3hELE1BQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ3ZELGFBQWEsQ0FBQyxFQUFFLEdBQUcsVUFBVSxDQUFDO1FBQzlCLGFBQWEsQ0FBQyxLQUFLLEdBQUcsVUFBVSxDQUFDO1FBQ2pDLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRSxhQUFhLENBQUMsQ0FBQztRQUNyRCxhQUFhLENBQUMsS0FBSyxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUM7UUFDckMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBRXpDLE9BQU8sYUFBYSxDQUFDO0lBQ3ZCLENBQUM7SUFFTyx5QkFBeUIsQ0FBQyxVQUFrQjtRQUNsRCxJQUFJO1lBQ0YsTUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDdEYsSUFBSSxJQUFJLENBQUMsZUFBZSxDQUFDLGFBQWEsQ0FBQyxFQUFFO2dCQUN2QyxPQUFPLGFBQWEsQ0FBQzthQUN0QjtZQUVELE9BQU8sSUFBSSxDQUFDO1NBQ2I7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNWLE9BQU8sSUFBSSxDQUFDO1NBQ2I7SUFDSCxDQUFDO0lBRU8sbUJBQW1CLENBQUMsVUFBa0I7UUFDNUMsTUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDMUQsSUFBSSxJQUFJLENBQUMsZUFBZSxDQUFDLGFBQWEsQ0FBQyxFQUFFO1lBQ3ZDLE9BQU8sYUFBYSxDQUFDO1NBQ3RCO1FBRUQsT0FBTyxJQUFJLENBQUM7SUFDZCxDQUFDO0lBRU8sZUFBZSxDQUFDLE9BQTJCO1FBQ2pELE9BQU8sQ0FBQyxDQUFDLE9BQU8sSUFBSSxPQUFPLFlBQVksaUJBQWlCLENBQUM7SUFDM0QsQ0FBQzs7MEdBcERVLGFBQWEsa0JBQ0osUUFBUTs4R0FEakIsYUFBYTsyRkFBYixhQUFhO2tCQUR6QixVQUFVOzswQkFFSSxNQUFNOzJCQUFDLFFBQVEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBET0NVTUVOVCB9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG5pbXBvcnQgeyBJbmplY3QsIEluamVjdGFibGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IExvZ2dlclNlcnZpY2UgfSBmcm9tICcuLi9sb2dnaW5nL2xvZ2dlci5zZXJ2aWNlJztcblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIElGcmFtZVNlcnZpY2Uge1xuICBjb25zdHJ1Y3RvcihASW5qZWN0KERPQ1VNRU5UKSBwcml2YXRlIHJlYWRvbmx5IGRvYzogYW55LCBwcml2YXRlIGxvZ2dlclNlcnZpY2U6IExvZ2dlclNlcnZpY2UpIHt9XG5cbiAgZ2V0RXhpc3RpbmdJRnJhbWUoaWRlbnRpZmllcjogc3RyaW5nKTogSFRNTElGcmFtZUVsZW1lbnQgfCBudWxsIHtcbiAgICBjb25zdCBpRnJhbWVPblBhcmVudCA9IHRoaXMuZ2V0SUZyYW1lRnJvbVBhcmVudFdpbmRvdyhpZGVudGlmaWVyKTtcbiAgICBpZiAodGhpcy5pc0lGcmFtZUVsZW1lbnQoaUZyYW1lT25QYXJlbnQpKSB7XG4gICAgICByZXR1cm4gaUZyYW1lT25QYXJlbnQ7XG4gICAgfVxuXG4gICAgY29uc3QgaUZyYW1lT25TZWxmID0gdGhpcy5nZXRJRnJhbWVGcm9tV2luZG93KGlkZW50aWZpZXIpO1xuICAgIGlmICh0aGlzLmlzSUZyYW1lRWxlbWVudChpRnJhbWVPblNlbGYpKSB7XG4gICAgICByZXR1cm4gaUZyYW1lT25TZWxmO1xuICAgIH1cblxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgYWRkSUZyYW1lVG9XaW5kb3dCb2R5KGlkZW50aWZpZXI6IHN0cmluZywgY29uZmlnSWQ6IHN0cmluZyk6IEhUTUxJRnJhbWVFbGVtZW50IHtcbiAgICBjb25zdCBzZXNzaW9uSWZyYW1lID0gdGhpcy5kb2MuY3JlYXRlRWxlbWVudCgnaWZyYW1lJyk7XG4gICAgc2Vzc2lvbklmcmFtZS5pZCA9IGlkZW50aWZpZXI7XG4gICAgc2Vzc2lvbklmcmFtZS50aXRsZSA9IGlkZW50aWZpZXI7XG4gICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKGNvbmZpZ0lkLCBzZXNzaW9uSWZyYW1lKTtcbiAgICBzZXNzaW9uSWZyYW1lLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgdGhpcy5kb2MuYm9keS5hcHBlbmRDaGlsZChzZXNzaW9uSWZyYW1lKTtcblxuICAgIHJldHVybiBzZXNzaW9uSWZyYW1lO1xuICB9XG5cbiAgcHJpdmF0ZSBnZXRJRnJhbWVGcm9tUGFyZW50V2luZG93KGlkZW50aWZpZXI6IHN0cmluZyk6IEhUTUxJRnJhbWVFbGVtZW50IHwgbnVsbCB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGlGcmFtZUVsZW1lbnQgPSB0aGlzLmRvYy5kZWZhdWx0Vmlldy5wYXJlbnQuZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaWRlbnRpZmllcik7XG4gICAgICBpZiAodGhpcy5pc0lGcmFtZUVsZW1lbnQoaUZyYW1lRWxlbWVudCkpIHtcbiAgICAgICAgcmV0dXJuIGlGcmFtZUVsZW1lbnQ7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBudWxsO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgZ2V0SUZyYW1lRnJvbVdpbmRvdyhpZGVudGlmaWVyOiBzdHJpbmcpOiBIVE1MSUZyYW1lRWxlbWVudCB8IG51bGwge1xuICAgIGNvbnN0IGlGcmFtZUVsZW1lbnQgPSB0aGlzLmRvYy5nZXRFbGVtZW50QnlJZChpZGVudGlmaWVyKTtcbiAgICBpZiAodGhpcy5pc0lGcmFtZUVsZW1lbnQoaUZyYW1lRWxlbWVudCkpIHtcbiAgICAgIHJldHVybiBpRnJhbWVFbGVtZW50O1xuICAgIH1cblxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgcHJpdmF0ZSBpc0lGcmFtZUVsZW1lbnQoZWxlbWVudDogSFRNTEVsZW1lbnQgfCBudWxsKTogZWxlbWVudCBpcyBIVE1MSUZyYW1lRWxlbWVudCB7XG4gICAgcmV0dXJuICEhZWxlbWVudCAmJiBlbGVtZW50IGluc3RhbmNlb2YgSFRNTElGcmFtZUVsZW1lbnQ7XG4gIH1cbn1cbiJdfQ==