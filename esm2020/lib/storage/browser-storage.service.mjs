import { Injectable } from '@angular/core';
import * as i0 from "@angular/core";
import * as i1 from "../config/provider/config.provider";
import * as i2 from "../logging/logger.service";
export class BrowserStorageService {
    constructor(configProvider, loggerService) {
        this.configProvider = configProvider;
        this.loggerService = loggerService;
    }
    read(key, configId) {
        if (!this.hasStorage()) {
            this.loggerService.logDebug(configId, `Wanted to read '${key}' but Storage was undefined`);
            return null;
        }
        const storage = this.getStorage(configId);
        if (!storage) {
            this.loggerService.logDebug(configId, `Wanted to read config for '${configId}' but Storage was falsy`);
            return null;
        }
        const storedConfig = storage.read(configId);
        if (!storedConfig) {
            return null;
        }
        return JSON.parse(storedConfig);
    }
    write(value, configId) {
        if (!this.hasStorage()) {
            this.loggerService.logDebug(configId, `Wanted to write '${value}' but Storage was falsy`);
            return false;
        }
        const storage = this.getStorage(configId);
        if (!storage) {
            this.loggerService.logDebug(configId, `Wanted to write '${value}' but Storage was falsy`);
            return false;
        }
        value = value || null;
        storage.write(configId, JSON.stringify(value));
        return true;
    }
    remove(key, configId) {
        if (!this.hasStorage()) {
            this.loggerService.logDebug(configId, `Wanted to remove '${key}' but Storage was falsy`);
            return false;
        }
        const storage = this.getStorage(configId);
        if (!storage) {
            this.loggerService.logDebug(configId, `Wanted to write '${key}' but Storage was falsy`);
            return false;
        }
        storage.remove(key);
        return true;
    }
    // TODO THIS STORAGE WANTS AN ID BUT CLEARS EVERYTHING
    clear(configId) {
        if (!this.hasStorage()) {
            this.loggerService.logDebug(configId, `Wanted to clear storage but Storage was falsy`);
            return false;
        }
        const storage = this.getStorage(configId);
        if (!storage) {
            this.loggerService.logDebug(configId, `Wanted to clear storage but Storage was falsy`);
            return false;
        }
        storage.clear();
        return true;
    }
    getStorage(configId) {
        const { storage } = this.configProvider.getOpenIDConfiguration(configId) || {};
        return storage;
    }
    hasStorage() {
        return typeof Storage !== 'undefined';
    }
}
BrowserStorageService.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: BrowserStorageService, deps: [{ token: i1.ConfigurationProvider }, { token: i2.LoggerService }], target: i0.ɵɵFactoryTarget.Injectable });
BrowserStorageService.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: BrowserStorageService });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: BrowserStorageService, decorators: [{
            type: Injectable
        }], ctorParameters: function () { return [{ type: i1.ConfigurationProvider }, { type: i2.LoggerService }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnJvd3Nlci1zdG9yYWdlLnNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy9hbmd1bGFyLWF1dGgtb2lkYy1jbGllbnQvc3JjL2xpYi9zdG9yYWdlL2Jyb3dzZXItc3RvcmFnZS5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7Ozs7QUFNM0MsTUFBTSxPQUFPLHFCQUFxQjtJQUNoQyxZQUFvQixjQUFxQyxFQUFVLGFBQTRCO1FBQTNFLG1CQUFjLEdBQWQsY0FBYyxDQUF1QjtRQUFVLGtCQUFhLEdBQWIsYUFBYSxDQUFlO0lBQUcsQ0FBQztJQUVuRyxJQUFJLENBQUMsR0FBVyxFQUFFLFFBQWdCO1FBQ2hDLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLEVBQUU7WUFDdEIsSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFLG1CQUFtQixHQUFHLDZCQUE2QixDQUFDLENBQUM7WUFFM0YsT0FBTyxJQUFJLENBQUM7U0FDYjtRQUVELE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLENBQUM7UUFFMUMsSUFBSSxDQUFDLE9BQU8sRUFBRTtZQUNaLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRSw4QkFBOEIsUUFBUSx5QkFBeUIsQ0FBQyxDQUFDO1lBRXZHLE9BQU8sSUFBSSxDQUFDO1NBQ2I7UUFFRCxNQUFNLFlBQVksR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBRTVDLElBQUksQ0FBQyxZQUFZLEVBQUU7WUFDakIsT0FBTyxJQUFJLENBQUM7U0FDYjtRQUVELE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUMsQ0FBQztJQUNsQyxDQUFDO0lBRUQsS0FBSyxDQUFDLEtBQVUsRUFBRSxRQUFnQjtRQUNoQyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxFQUFFO1lBQ3RCLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRSxvQkFBb0IsS0FBSyx5QkFBeUIsQ0FBQyxDQUFDO1lBRTFGLE9BQU8sS0FBSyxDQUFDO1NBQ2Q7UUFFRCxNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQzFDLElBQUksQ0FBQyxPQUFPLEVBQUU7WUFDWixJQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxRQUFRLEVBQUUsb0JBQW9CLEtBQUsseUJBQXlCLENBQUMsQ0FBQztZQUUxRixPQUFPLEtBQUssQ0FBQztTQUNkO1FBRUQsS0FBSyxHQUFHLEtBQUssSUFBSSxJQUFJLENBQUM7UUFFdEIsT0FBTyxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBRS9DLE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQUVELE1BQU0sQ0FBQyxHQUFXLEVBQUUsUUFBZ0I7UUFDbEMsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsRUFBRTtZQUN0QixJQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxRQUFRLEVBQUUscUJBQXFCLEdBQUcseUJBQXlCLENBQUMsQ0FBQztZQUV6RixPQUFPLEtBQUssQ0FBQztTQUNkO1FBRUQsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUMxQyxJQUFJLENBQUMsT0FBTyxFQUFFO1lBQ1osSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFLG9CQUFvQixHQUFHLHlCQUF5QixDQUFDLENBQUM7WUFFeEYsT0FBTyxLQUFLLENBQUM7U0FDZDtRQUVELE9BQU8sQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7UUFFcEIsT0FBTyxJQUFJLENBQUM7SUFDZCxDQUFDO0lBRUQsc0RBQXNEO0lBQ3RELEtBQUssQ0FBQyxRQUFnQjtRQUNwQixJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxFQUFFO1lBQ3RCLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRSwrQ0FBK0MsQ0FBQyxDQUFDO1lBRXZGLE9BQU8sS0FBSyxDQUFDO1NBQ2Q7UUFFRCxNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQzFDLElBQUksQ0FBQyxPQUFPLEVBQUU7WUFDWixJQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxRQUFRLEVBQUUsK0NBQStDLENBQUMsQ0FBQztZQUV2RixPQUFPLEtBQUssQ0FBQztTQUNkO1FBRUQsT0FBTyxDQUFDLEtBQUssRUFBRSxDQUFDO1FBRWhCLE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQUVPLFVBQVUsQ0FBQyxRQUFnQjtRQUNqQyxNQUFNLEVBQUUsT0FBTyxFQUFFLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxzQkFBc0IsQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLENBQUM7UUFFL0UsT0FBTyxPQUFPLENBQUM7SUFDakIsQ0FBQztJQUVPLFVBQVU7UUFDaEIsT0FBTyxPQUFPLE9BQU8sS0FBSyxXQUFXLENBQUM7SUFDeEMsQ0FBQzs7a0hBL0ZVLHFCQUFxQjtzSEFBckIscUJBQXFCOzJGQUFyQixxQkFBcUI7a0JBRGpDLFVBQVUiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJbmplY3RhYmxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBDb25maWd1cmF0aW9uUHJvdmlkZXIgfSBmcm9tICcuLi9jb25maWcvcHJvdmlkZXIvY29uZmlnLnByb3ZpZGVyJztcbmltcG9ydCB7IExvZ2dlclNlcnZpY2UgfSBmcm9tICcuLi9sb2dnaW5nL2xvZ2dlci5zZXJ2aWNlJztcbmltcG9ydCB7IEFic3RyYWN0U2VjdXJpdHlTdG9yYWdlIH0gZnJvbSAnLi9hYnN0cmFjdC1zZWN1cml0eS1zdG9yYWdlJztcblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIEJyb3dzZXJTdG9yYWdlU2VydmljZSB7XG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgY29uZmlnUHJvdmlkZXI6IENvbmZpZ3VyYXRpb25Qcm92aWRlciwgcHJpdmF0ZSBsb2dnZXJTZXJ2aWNlOiBMb2dnZXJTZXJ2aWNlKSB7fVxuXG4gIHJlYWQoa2V5OiBzdHJpbmcsIGNvbmZpZ0lkOiBzdHJpbmcpOiBhbnkge1xuICAgIGlmICghdGhpcy5oYXNTdG9yYWdlKCkpIHtcbiAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1Zyhjb25maWdJZCwgYFdhbnRlZCB0byByZWFkICcke2tleX0nIGJ1dCBTdG9yYWdlIHdhcyB1bmRlZmluZWRgKTtcblxuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgY29uc3Qgc3RvcmFnZSA9IHRoaXMuZ2V0U3RvcmFnZShjb25maWdJZCk7XG5cbiAgICBpZiAoIXN0b3JhZ2UpIHtcbiAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1Zyhjb25maWdJZCwgYFdhbnRlZCB0byByZWFkIGNvbmZpZyBmb3IgJyR7Y29uZmlnSWR9JyBidXQgU3RvcmFnZSB3YXMgZmFsc3lgKTtcblxuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgY29uc3Qgc3RvcmVkQ29uZmlnID0gc3RvcmFnZS5yZWFkKGNvbmZpZ0lkKTtcblxuICAgIGlmICghc3RvcmVkQ29uZmlnKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICByZXR1cm4gSlNPTi5wYXJzZShzdG9yZWRDb25maWcpO1xuICB9XG5cbiAgd3JpdGUodmFsdWU6IGFueSwgY29uZmlnSWQ6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIGlmICghdGhpcy5oYXNTdG9yYWdlKCkpIHtcbiAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1Zyhjb25maWdJZCwgYFdhbnRlZCB0byB3cml0ZSAnJHt2YWx1ZX0nIGJ1dCBTdG9yYWdlIHdhcyBmYWxzeWApO1xuXG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgY29uc3Qgc3RvcmFnZSA9IHRoaXMuZ2V0U3RvcmFnZShjb25maWdJZCk7XG4gICAgaWYgKCFzdG9yYWdlKSB7XG4gICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoY29uZmlnSWQsIGBXYW50ZWQgdG8gd3JpdGUgJyR7dmFsdWV9JyBidXQgU3RvcmFnZSB3YXMgZmFsc3lgKTtcblxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHZhbHVlID0gdmFsdWUgfHwgbnVsbDtcblxuICAgIHN0b3JhZ2Uud3JpdGUoY29uZmlnSWQsIEpTT04uc3RyaW5naWZ5KHZhbHVlKSk7XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIHJlbW92ZShrZXk6IHN0cmluZywgY29uZmlnSWQ6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIGlmICghdGhpcy5oYXNTdG9yYWdlKCkpIHtcbiAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1Zyhjb25maWdJZCwgYFdhbnRlZCB0byByZW1vdmUgJyR7a2V5fScgYnV0IFN0b3JhZ2Ugd2FzIGZhbHN5YCk7XG5cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBjb25zdCBzdG9yYWdlID0gdGhpcy5nZXRTdG9yYWdlKGNvbmZpZ0lkKTtcbiAgICBpZiAoIXN0b3JhZ2UpIHtcbiAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1Zyhjb25maWdJZCwgYFdhbnRlZCB0byB3cml0ZSAnJHtrZXl9JyBidXQgU3RvcmFnZSB3YXMgZmFsc3lgKTtcblxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHN0b3JhZ2UucmVtb3ZlKGtleSk7XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIC8vIFRPRE8gVEhJUyBTVE9SQUdFIFdBTlRTIEFOIElEIEJVVCBDTEVBUlMgRVZFUllUSElOR1xuICBjbGVhcihjb25maWdJZDogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgaWYgKCF0aGlzLmhhc1N0b3JhZ2UoKSkge1xuICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKGNvbmZpZ0lkLCBgV2FudGVkIHRvIGNsZWFyIHN0b3JhZ2UgYnV0IFN0b3JhZ2Ugd2FzIGZhbHN5YCk7XG5cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBjb25zdCBzdG9yYWdlID0gdGhpcy5nZXRTdG9yYWdlKGNvbmZpZ0lkKTtcbiAgICBpZiAoIXN0b3JhZ2UpIHtcbiAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1Zyhjb25maWdJZCwgYFdhbnRlZCB0byBjbGVhciBzdG9yYWdlIGJ1dCBTdG9yYWdlIHdhcyBmYWxzeWApO1xuXG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgc3RvcmFnZS5jbGVhcigpO1xuXG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICBwcml2YXRlIGdldFN0b3JhZ2UoY29uZmlnSWQ6IHN0cmluZyk6IEFic3RyYWN0U2VjdXJpdHlTdG9yYWdlIHtcbiAgICBjb25zdCB7IHN0b3JhZ2UgfSA9IHRoaXMuY29uZmlnUHJvdmlkZXIuZ2V0T3BlbklEQ29uZmlndXJhdGlvbihjb25maWdJZCkgfHwge307XG5cbiAgICByZXR1cm4gc3RvcmFnZTtcbiAgfVxuXG4gIHByaXZhdGUgaGFzU3RvcmFnZSgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdHlwZW9mIFN0b3JhZ2UgIT09ICd1bmRlZmluZWQnO1xuICB9XG59XG4iXX0=