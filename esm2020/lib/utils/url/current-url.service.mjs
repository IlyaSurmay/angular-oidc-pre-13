import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import * as i0 from "@angular/core";
export class CurrentUrlService {
    constructor(doc) {
        this.doc = doc;
    }
    getStateParamFromCurrentUrl() {
        const currentUrl = this.getCurrentUrl();
        const parsedUrl = new URL(currentUrl);
        const urlParams = new URLSearchParams(parsedUrl.search);
        const stateFromUrl = urlParams.get('state');
        return stateFromUrl;
    }
    currentUrlHasStateParam() {
        return !!this.getStateParamFromCurrentUrl();
    }
    getCurrentUrl() {
        return this.doc.defaultView.location.toString();
    }
}
CurrentUrlService.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: CurrentUrlService, deps: [{ token: DOCUMENT }], target: i0.ɵɵFactoryTarget.Injectable });
CurrentUrlService.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: CurrentUrlService });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: CurrentUrlService, decorators: [{
            type: Injectable
        }], ctorParameters: function () { return [{ type: undefined, decorators: [{
                    type: Inject,
                    args: [DOCUMENT]
                }] }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3VycmVudC11cmwuc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL2FuZ3VsYXItYXV0aC1vaWRjLWNsaWVudC9zcmMvbGliL3V0aWxzL3VybC9jdXJyZW50LXVybC5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUMzQyxPQUFPLEVBQUUsTUFBTSxFQUFFLFVBQVUsRUFBRSxNQUFNLGVBQWUsQ0FBQzs7QUFHbkQsTUFBTSxPQUFPLGlCQUFpQjtJQUM1QixZQUFzQyxHQUFRO1FBQVIsUUFBRyxHQUFILEdBQUcsQ0FBSztJQUFHLENBQUM7SUFFbEQsMkJBQTJCO1FBQ3pCLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztRQUN4QyxNQUFNLFNBQVMsR0FBRyxJQUFJLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUN0QyxNQUFNLFNBQVMsR0FBRyxJQUFJLGVBQWUsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDeEQsTUFBTSxZQUFZLEdBQUcsU0FBUyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUU1QyxPQUFPLFlBQVksQ0FBQztJQUN0QixDQUFDO0lBRUQsdUJBQXVCO1FBQ3JCLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQywyQkFBMkIsRUFBRSxDQUFDO0lBQzlDLENBQUM7SUFFRCxhQUFhO1FBQ1gsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFLENBQUM7SUFDbEQsQ0FBQzs7OEdBbEJVLGlCQUFpQixrQkFDUixRQUFRO2tIQURqQixpQkFBaUI7MkZBQWpCLGlCQUFpQjtrQkFEN0IsVUFBVTs7MEJBRUksTUFBTTsyQkFBQyxRQUFRIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRE9DVU1FTlQgfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xuaW1wb3J0IHsgSW5qZWN0LCBJbmplY3RhYmxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBDdXJyZW50VXJsU2VydmljZSB7XG4gIGNvbnN0cnVjdG9yKEBJbmplY3QoRE9DVU1FTlQpIHByaXZhdGUgZG9jOiBhbnkpIHt9XG5cbiAgZ2V0U3RhdGVQYXJhbUZyb21DdXJyZW50VXJsKCk6IHN0cmluZyB7XG4gICAgY29uc3QgY3VycmVudFVybCA9IHRoaXMuZ2V0Q3VycmVudFVybCgpO1xuICAgIGNvbnN0IHBhcnNlZFVybCA9IG5ldyBVUkwoY3VycmVudFVybCk7XG4gICAgY29uc3QgdXJsUGFyYW1zID0gbmV3IFVSTFNlYXJjaFBhcmFtcyhwYXJzZWRVcmwuc2VhcmNoKTtcbiAgICBjb25zdCBzdGF0ZUZyb21VcmwgPSB1cmxQYXJhbXMuZ2V0KCdzdGF0ZScpO1xuXG4gICAgcmV0dXJuIHN0YXRlRnJvbVVybDtcbiAgfVxuXG4gIGN1cnJlbnRVcmxIYXNTdGF0ZVBhcmFtKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiAhIXRoaXMuZ2V0U3RhdGVQYXJhbUZyb21DdXJyZW50VXJsKCk7XG4gIH1cblxuICBnZXRDdXJyZW50VXJsKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuZG9jLmRlZmF1bHRWaWV3LmxvY2F0aW9uLnRvU3RyaW5nKCk7XG4gIH1cbn1cbiJdfQ==