import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import * as i0 from "@angular/core";
export class IntervalService {
    constructor(zone) {
        this.zone = zone;
        this.runTokenValidationRunning = null;
    }
    stopPeriodicTokenCheck() {
        if (this.runTokenValidationRunning) {
            this.runTokenValidationRunning.unsubscribe();
            this.runTokenValidationRunning = null;
        }
    }
    startPeriodicTokenCheck(repeatAfterSeconds) {
        const millisecondsDelayBetweenTokenCheck = repeatAfterSeconds * 1000;
        return new Observable((subscriber) => {
            let intervalId;
            this.zone.runOutsideAngular(() => {
                intervalId = setInterval(() => this.zone.run(() => subscriber.next()), millisecondsDelayBetweenTokenCheck);
            });
            return () => {
                clearInterval(intervalId);
            };
        });
    }
}
IntervalService.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: IntervalService, deps: [{ token: i0.NgZone }], target: i0.ɵɵFactoryTarget.Injectable });
IntervalService.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: IntervalService, providedIn: 'root' });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: IntervalService, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }], ctorParameters: function () { return [{ type: i0.NgZone }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW50ZXJ2YWwuc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL2FuZ3VsYXItYXV0aC1vaWRjLWNsaWVudC9zcmMvbGliL2NhbGxiYWNrL2ludGVydmFsLnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFVBQVUsRUFBVSxNQUFNLGVBQWUsQ0FBQztBQUNuRCxPQUFPLEVBQUUsVUFBVSxFQUFnQixNQUFNLE1BQU0sQ0FBQzs7QUFHaEQsTUFBTSxPQUFPLGVBQWU7SUFHMUIsWUFBb0IsSUFBWTtRQUFaLFNBQUksR0FBSixJQUFJLENBQVE7UUFGaEMsOEJBQXlCLEdBQWlCLElBQUksQ0FBQztJQUVaLENBQUM7SUFFcEMsc0JBQXNCO1FBQ3BCLElBQUksSUFBSSxDQUFDLHlCQUF5QixFQUFFO1lBQ2xDLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUM3QyxJQUFJLENBQUMseUJBQXlCLEdBQUcsSUFBSSxDQUFDO1NBQ3ZDO0lBQ0gsQ0FBQztJQUVELHVCQUF1QixDQUFDLGtCQUEwQjtRQUNoRCxNQUFNLGtDQUFrQyxHQUFHLGtCQUFrQixHQUFHLElBQUksQ0FBQztRQUVyRSxPQUFPLElBQUksVUFBVSxDQUFDLENBQUMsVUFBVSxFQUFFLEVBQUU7WUFDbkMsSUFBSSxVQUFVLENBQUM7WUFDZixJQUFJLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLEdBQUcsRUFBRTtnQkFDL0IsVUFBVSxHQUFHLFdBQVcsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxrQ0FBa0MsQ0FBQyxDQUFDO1lBQzdHLENBQUMsQ0FBQyxDQUFDO1lBRUgsT0FBTyxHQUFTLEVBQUU7Z0JBQ2hCLGFBQWEsQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUM1QixDQUFDLENBQUM7UUFDSixDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7OzRHQXpCVSxlQUFlO2dIQUFmLGVBQWUsY0FERixNQUFNOzJGQUNuQixlQUFlO2tCQUQzQixVQUFVO21CQUFDLEVBQUUsVUFBVSxFQUFFLE1BQU0sRUFBRSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEluamVjdGFibGUsIE5nWm9uZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgT2JzZXJ2YWJsZSwgU3Vic2NyaXB0aW9uIH0gZnJvbSAncnhqcyc7XG5cbkBJbmplY3RhYmxlKHsgcHJvdmlkZWRJbjogJ3Jvb3QnIH0pXG5leHBvcnQgY2xhc3MgSW50ZXJ2YWxTZXJ2aWNlIHtcbiAgcnVuVG9rZW5WYWxpZGF0aW9uUnVubmluZzogU3Vic2NyaXB0aW9uID0gbnVsbDtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIHpvbmU6IE5nWm9uZSkge31cblxuICBzdG9wUGVyaW9kaWNUb2tlbkNoZWNrKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLnJ1blRva2VuVmFsaWRhdGlvblJ1bm5pbmcpIHtcbiAgICAgIHRoaXMucnVuVG9rZW5WYWxpZGF0aW9uUnVubmluZy51bnN1YnNjcmliZSgpO1xuICAgICAgdGhpcy5ydW5Ub2tlblZhbGlkYXRpb25SdW5uaW5nID0gbnVsbDtcbiAgICB9XG4gIH1cblxuICBzdGFydFBlcmlvZGljVG9rZW5DaGVjayhyZXBlYXRBZnRlclNlY29uZHM6IG51bWJlcik6IE9ic2VydmFibGU8dW5rbm93bj4ge1xuICAgIGNvbnN0IG1pbGxpc2Vjb25kc0RlbGF5QmV0d2VlblRva2VuQ2hlY2sgPSByZXBlYXRBZnRlclNlY29uZHMgKiAxMDAwO1xuXG4gICAgcmV0dXJuIG5ldyBPYnNlcnZhYmxlKChzdWJzY3JpYmVyKSA9PiB7XG4gICAgICBsZXQgaW50ZXJ2YWxJZDtcbiAgICAgIHRoaXMuem9uZS5ydW5PdXRzaWRlQW5ndWxhcigoKSA9PiB7XG4gICAgICAgIGludGVydmFsSWQgPSBzZXRJbnRlcnZhbCgoKSA9PiB0aGlzLnpvbmUucnVuKCgpID0+IHN1YnNjcmliZXIubmV4dCgpKSwgbWlsbGlzZWNvbmRzRGVsYXlCZXR3ZWVuVG9rZW5DaGVjayk7XG4gICAgICB9KTtcblxuICAgICAgcmV0dXJuICgpOiB2b2lkID0+IHtcbiAgICAgICAgY2xlYXJJbnRlcnZhbChpbnRlcnZhbElkKTtcbiAgICAgIH07XG4gICAgfSk7XG4gIH1cbn1cbiJdfQ==