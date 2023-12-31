import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import * as i0 from "@angular/core";
import * as i1 from "../../logging/logger.service";
export class RandomService {
    constructor(doc, loggerService) {
        this.doc = doc;
        this.loggerService = loggerService;
    }
    createRandom(requiredLength, configId) {
        if (requiredLength <= 0) {
            return '';
        }
        if (requiredLength > 0 && requiredLength < 7) {
            this.loggerService.logWarning(configId, `RandomService called with ${requiredLength} but 7 chars is the minimum, returning 10 chars`);
            requiredLength = 10;
        }
        const length = requiredLength - 6;
        const arr = new Uint8Array(Math.floor((length || length) / 2));
        if (this.getCrypto()) {
            this.getCrypto().getRandomValues(arr);
        }
        return Array.from(arr, this.toHex).join('') + this.randomString(7);
    }
    toHex(dec) {
        return ('0' + dec.toString(16)).substr(-2);
    }
    randomString(length) {
        let result = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const values = new Uint32Array(length);
        if (this.getCrypto()) {
            this.getCrypto().getRandomValues(values);
            for (let i = 0; i < length; i++) {
                result += characters[values[i] % characters.length];
            }
        }
        return result;
    }
    getCrypto() {
        // support for IE,  (window.crypto || window.msCrypto)
        return this.doc.defaultView.crypto || this.doc.defaultView.msCrypto;
    }
}
RandomService.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: RandomService, deps: [{ token: DOCUMENT }, { token: i1.LoggerService }], target: i0.ɵɵFactoryTarget.Injectable });
RandomService.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: RandomService });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: RandomService, decorators: [{
            type: Injectable
        }], ctorParameters: function () { return [{ type: undefined, decorators: [{
                    type: Inject,
                    args: [DOCUMENT]
                }] }, { type: i1.LoggerService }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmFuZG9tLnNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy9hbmd1bGFyLWF1dGgtb2lkYy1jbGllbnQvc3JjL2xpYi9mbG93cy9yYW5kb20vcmFuZG9tLnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBQzNDLE9BQU8sRUFBRSxNQUFNLEVBQUUsVUFBVSxFQUFFLE1BQU0sZUFBZSxDQUFDOzs7QUFJbkQsTUFBTSxPQUFPLGFBQWE7SUFDeEIsWUFBK0MsR0FBUSxFQUFVLGFBQTRCO1FBQTlDLFFBQUcsR0FBSCxHQUFHLENBQUs7UUFBVSxrQkFBYSxHQUFiLGFBQWEsQ0FBZTtJQUFHLENBQUM7SUFFakcsWUFBWSxDQUFDLGNBQXNCLEVBQUUsUUFBZ0I7UUFDbkQsSUFBSSxjQUFjLElBQUksQ0FBQyxFQUFFO1lBQ3ZCLE9BQU8sRUFBRSxDQUFDO1NBQ1g7UUFFRCxJQUFJLGNBQWMsR0FBRyxDQUFDLElBQUksY0FBYyxHQUFHLENBQUMsRUFBRTtZQUM1QyxJQUFJLENBQUMsYUFBYSxDQUFDLFVBQVUsQ0FBQyxRQUFRLEVBQUUsNkJBQTZCLGNBQWMsaURBQWlELENBQUMsQ0FBQztZQUN0SSxjQUFjLEdBQUcsRUFBRSxDQUFDO1NBQ3JCO1FBRUQsTUFBTSxNQUFNLEdBQUcsY0FBYyxHQUFHLENBQUMsQ0FBQztRQUNsQyxNQUFNLEdBQUcsR0FBRyxJQUFJLFVBQVUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsTUFBTSxJQUFJLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDL0QsSUFBSSxJQUFJLENBQUMsU0FBUyxFQUFFLEVBQUU7WUFDcEIsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsQ0FBQztTQUN2QztRQUVELE9BQU8sS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3JFLENBQUM7SUFFTyxLQUFLLENBQUMsR0FBRztRQUNmLE9BQU8sQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzdDLENBQUM7SUFFTyxZQUFZLENBQUMsTUFBTTtRQUN6QixJQUFJLE1BQU0sR0FBRyxFQUFFLENBQUM7UUFDaEIsTUFBTSxVQUFVLEdBQUcsZ0VBQWdFLENBQUM7UUFFcEYsTUFBTSxNQUFNLEdBQUcsSUFBSSxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDdkMsSUFBSSxJQUFJLENBQUMsU0FBUyxFQUFFLEVBQUU7WUFDcEIsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDLGVBQWUsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUN6QyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO2dCQUMvQixNQUFNLElBQUksVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUM7YUFDckQ7U0FDRjtRQUVELE9BQU8sTUFBTSxDQUFDO0lBQ2hCLENBQUM7SUFFTyxTQUFTO1FBQ2Ysc0RBQXNEO1FBQ3RELE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsTUFBTSxJQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsV0FBbUIsQ0FBQyxRQUFRLENBQUM7SUFDL0UsQ0FBQzs7MEdBNUNVLGFBQWEsa0JBQ0osUUFBUTs4R0FEakIsYUFBYTsyRkFBYixhQUFhO2tCQUR6QixVQUFVOzswQkFFSSxNQUFNOzJCQUFDLFFBQVEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBET0NVTUVOVCB9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG5pbXBvcnQgeyBJbmplY3QsIEluamVjdGFibGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IExvZ2dlclNlcnZpY2UgfSBmcm9tICcuLi8uLi9sb2dnaW5nL2xvZ2dlci5zZXJ2aWNlJztcblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIFJhbmRvbVNlcnZpY2Uge1xuICBjb25zdHJ1Y3RvcihASW5qZWN0KERPQ1VNRU5UKSBwcml2YXRlIHJlYWRvbmx5IGRvYzogYW55LCBwcml2YXRlIGxvZ2dlclNlcnZpY2U6IExvZ2dlclNlcnZpY2UpIHt9XG5cbiAgY3JlYXRlUmFuZG9tKHJlcXVpcmVkTGVuZ3RoOiBudW1iZXIsIGNvbmZpZ0lkOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIGlmIChyZXF1aXJlZExlbmd0aCA8PSAwKSB7XG4gICAgICByZXR1cm4gJyc7XG4gICAgfVxuXG4gICAgaWYgKHJlcXVpcmVkTGVuZ3RoID4gMCAmJiByZXF1aXJlZExlbmd0aCA8IDcpIHtcbiAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dXYXJuaW5nKGNvbmZpZ0lkLCBgUmFuZG9tU2VydmljZSBjYWxsZWQgd2l0aCAke3JlcXVpcmVkTGVuZ3RofSBidXQgNyBjaGFycyBpcyB0aGUgbWluaW11bSwgcmV0dXJuaW5nIDEwIGNoYXJzYCk7XG4gICAgICByZXF1aXJlZExlbmd0aCA9IDEwO1xuICAgIH1cblxuICAgIGNvbnN0IGxlbmd0aCA9IHJlcXVpcmVkTGVuZ3RoIC0gNjtcbiAgICBjb25zdCBhcnIgPSBuZXcgVWludDhBcnJheShNYXRoLmZsb29yKChsZW5ndGggfHwgbGVuZ3RoKSAvIDIpKTtcbiAgICBpZiAodGhpcy5nZXRDcnlwdG8oKSkge1xuICAgICAgdGhpcy5nZXRDcnlwdG8oKS5nZXRSYW5kb21WYWx1ZXMoYXJyKTtcbiAgICB9XG5cbiAgICByZXR1cm4gQXJyYXkuZnJvbShhcnIsIHRoaXMudG9IZXgpLmpvaW4oJycpICsgdGhpcy5yYW5kb21TdHJpbmcoNyk7XG4gIH1cblxuICBwcml2YXRlIHRvSGV4KGRlYyk6IHN0cmluZyB7XG4gICAgcmV0dXJuICgnMCcgKyBkZWMudG9TdHJpbmcoMTYpKS5zdWJzdHIoLTIpO1xuICB9XG5cbiAgcHJpdmF0ZSByYW5kb21TdHJpbmcobGVuZ3RoKTogc3RyaW5nIHtcbiAgICBsZXQgcmVzdWx0ID0gJyc7XG4gICAgY29uc3QgY2hhcmFjdGVycyA9ICdBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWmFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6MDEyMzQ1Njc4OSc7XG5cbiAgICBjb25zdCB2YWx1ZXMgPSBuZXcgVWludDMyQXJyYXkobGVuZ3RoKTtcbiAgICBpZiAodGhpcy5nZXRDcnlwdG8oKSkge1xuICAgICAgdGhpcy5nZXRDcnlwdG8oKS5nZXRSYW5kb21WYWx1ZXModmFsdWVzKTtcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgcmVzdWx0ICs9IGNoYXJhY3RlcnNbdmFsdWVzW2ldICUgY2hhcmFjdGVycy5sZW5ndGhdO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICBwcml2YXRlIGdldENyeXB0bygpOiBhbnkge1xuICAgIC8vIHN1cHBvcnQgZm9yIElFLCAgKHdpbmRvdy5jcnlwdG8gfHwgd2luZG93Lm1zQ3J5cHRvKVxuICAgIHJldHVybiB0aGlzLmRvYy5kZWZhdWx0Vmlldy5jcnlwdG8gfHwgKHRoaXMuZG9jLmRlZmF1bHRWaWV3IGFzIGFueSkubXNDcnlwdG87XG4gIH1cbn1cbiJdfQ==