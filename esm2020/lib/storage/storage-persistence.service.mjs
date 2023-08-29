import { Injectable } from '@angular/core';
import * as i0 from "@angular/core";
import * as i1 from "./browser-storage.service";
export class StoragePersistenceService {
    constructor(browserStorageService) {
        this.browserStorageService = browserStorageService;
    }
    read(key, configId) {
        const storedConfig = this.browserStorageService.read(key, configId) || {};
        return storedConfig[key];
    }
    write(key, value, configId) {
        const storedConfig = this.browserStorageService.read(key, configId) || {};
        storedConfig[key] = value;
        this.browserStorageService.write(storedConfig, configId);
    }
    remove(key, configId) {
        const storedConfig = this.browserStorageService.read(key, configId) || {};
        delete storedConfig[key];
        this.browserStorageService.write(storedConfig, configId);
    }
    clear(configId) {
        this.browserStorageService.clear(configId);
    }
    resetStorageFlowData(configId) {
        this.remove('session_state', configId);
        this.remove('storageSilentRenewRunning', configId);
        this.remove('codeVerifier', configId);
        this.remove('userData', configId);
        this.remove('storageCustomParamsAuthRequest', configId);
        this.remove('access_token_expires_at', configId);
        this.remove('storageCustomParamsRefresh', configId);
        this.remove('storageCustomParamsEndSession', configId);
    }
    resetAuthStateInStorage(configId) {
        this.remove('authzData', configId);
        this.remove('authnResult', configId);
    }
    getAccessToken(configId) {
        return this.read('authzData', configId);
    }
    getIdToken(configId) {
        return this.read('authnResult', configId)?.id_token;
    }
    getRefreshToken(configId) {
        return this.read('authnResult', configId)?.refresh_token;
    }
    getAuthenticationResult(configId) {
        return this.read('authnResult', configId);
    }
}
StoragePersistenceService.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: StoragePersistenceService, deps: [{ token: i1.BrowserStorageService }], target: i0.ɵɵFactoryTarget.Injectable });
StoragePersistenceService.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: StoragePersistenceService });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: StoragePersistenceService, decorators: [{
            type: Injectable
        }], ctorParameters: function () { return [{ type: i1.BrowserStorageService }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RvcmFnZS1wZXJzaXN0ZW5jZS5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvYW5ndWxhci1hdXRoLW9pZGMtY2xpZW50L3NyYy9saWIvc3RvcmFnZS9zdG9yYWdlLXBlcnNpc3RlbmNlLnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGVBQWUsQ0FBQzs7O0FBc0IzQyxNQUFNLE9BQU8seUJBQXlCO0lBQ3BDLFlBQTZCLHFCQUE0QztRQUE1QywwQkFBcUIsR0FBckIscUJBQXFCLENBQXVCO0lBQUcsQ0FBQztJQUU3RSxJQUFJLENBQUMsR0FBZ0IsRUFBRSxRQUFnQjtRQUNyQyxNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMscUJBQXFCLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxRQUFRLENBQUMsSUFBSSxFQUFFLENBQUM7UUFFMUUsT0FBTyxZQUFZLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDM0IsQ0FBQztJQUVELEtBQUssQ0FBQyxHQUFnQixFQUFFLEtBQVUsRUFBRSxRQUFnQjtRQUNsRCxNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMscUJBQXFCLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxRQUFRLENBQUMsSUFBSSxFQUFFLENBQUM7UUFFMUUsWUFBWSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEtBQUssQ0FBQztRQUMxQixJQUFJLENBQUMscUJBQXFCLENBQUMsS0FBSyxDQUFDLFlBQVksRUFBRSxRQUFRLENBQUMsQ0FBQztJQUMzRCxDQUFDO0lBRUQsTUFBTSxDQUFDLEdBQWdCLEVBQUUsUUFBZ0I7UUFDdkMsTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLHFCQUFxQixDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDO1FBRTFFLE9BQU8sWUFBWSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBRXpCLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxLQUFLLENBQUMsWUFBWSxFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBQzNELENBQUM7SUFFRCxLQUFLLENBQUMsUUFBZ0I7UUFDcEIsSUFBSSxDQUFDLHFCQUFxQixDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUM3QyxDQUFDO0lBRUQsb0JBQW9CLENBQUMsUUFBZ0I7UUFDbkMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxlQUFlLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFDdkMsSUFBSSxDQUFDLE1BQU0sQ0FBQywyQkFBMkIsRUFBRSxRQUFRLENBQUMsQ0FBQztRQUNuRCxJQUFJLENBQUMsTUFBTSxDQUFDLGNBQWMsRUFBRSxRQUFRLENBQUMsQ0FBQztRQUN0QyxJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsRUFBRSxRQUFRLENBQUMsQ0FBQztRQUNsQyxJQUFJLENBQUMsTUFBTSxDQUFDLGdDQUFnQyxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBQ3hELElBQUksQ0FBQyxNQUFNLENBQUMseUJBQXlCLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFDakQsSUFBSSxDQUFDLE1BQU0sQ0FBQyw0QkFBNEIsRUFBRSxRQUFRLENBQUMsQ0FBQztRQUNwRCxJQUFJLENBQUMsTUFBTSxDQUFDLCtCQUErQixFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBQ3pELENBQUM7SUFFRCx1QkFBdUIsQ0FBQyxRQUFnQjtRQUN0QyxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsRUFBRSxRQUFRLENBQUMsQ0FBQztRQUNuQyxJQUFJLENBQUMsTUFBTSxDQUFDLGFBQWEsRUFBRSxRQUFRLENBQUMsQ0FBQztJQUN2QyxDQUFDO0lBRUQsY0FBYyxDQUFDLFFBQWdCO1FBQzdCLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsUUFBUSxDQUFDLENBQUM7SUFDMUMsQ0FBQztJQUVELFVBQVUsQ0FBQyxRQUFnQjtRQUN6QixPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFLFFBQVEsQ0FBQyxFQUFFLFFBQVEsQ0FBQztJQUN0RCxDQUFDO0lBRUQsZUFBZSxDQUFDLFFBQWdCO1FBQzlCLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsUUFBUSxDQUFDLEVBQUUsYUFBYSxDQUFDO0lBQzNELENBQUM7SUFFRCx1QkFBdUIsQ0FBQyxRQUFnQjtRQUN0QyxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBQzVDLENBQUM7O3NIQTFEVSx5QkFBeUI7MEhBQXpCLHlCQUF5QjsyRkFBekIseUJBQXlCO2tCQURyQyxVQUFVIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSW5qZWN0YWJsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgQnJvd3NlclN0b3JhZ2VTZXJ2aWNlIH0gZnJvbSAnLi9icm93c2VyLXN0b3JhZ2Uuc2VydmljZSc7XG5cbmV4cG9ydCB0eXBlIFN0b3JhZ2VLZXlzID1cbiAgfCAnYXV0aG5SZXN1bHQnXG4gIHwgJ2F1dGh6RGF0YSdcbiAgfCAnYWNjZXNzX3Rva2VuX2V4cGlyZXNfYXQnXG4gIHwgJ2F1dGhXZWxsS25vd25FbmRQb2ludHMnXG4gIHwgJ3VzZXJEYXRhJ1xuICB8ICdhdXRoTm9uY2UnXG4gIHwgJ2NvZGVWZXJpZmllcidcbiAgfCAnYXV0aFN0YXRlQ29udHJvbCdcbiAgfCAnc2Vzc2lvbl9zdGF0ZSdcbiAgfCAnc3RvcmFnZVNpbGVudFJlbmV3UnVubmluZydcbiAgfCAnc3RvcmFnZUN1c3RvbVBhcmFtc0F1dGhSZXF1ZXN0J1xuICB8ICdzdG9yYWdlQ3VzdG9tUGFyYW1zUmVmcmVzaCdcbiAgfCAnc3RvcmFnZUN1c3RvbVBhcmFtc0VuZFNlc3Npb24nXG4gIHwgJ3JlZGlyZWN0J1xuICB8ICdjb25maWdJZHMnXG4gIHwgJ2p3dEtleXMnO1xuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgU3RvcmFnZVBlcnNpc3RlbmNlU2VydmljZSB7XG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgcmVhZG9ubHkgYnJvd3NlclN0b3JhZ2VTZXJ2aWNlOiBCcm93c2VyU3RvcmFnZVNlcnZpY2UpIHt9XG5cbiAgcmVhZChrZXk6IFN0b3JhZ2VLZXlzLCBjb25maWdJZDogc3RyaW5nKTogYW55IHtcbiAgICBjb25zdCBzdG9yZWRDb25maWcgPSB0aGlzLmJyb3dzZXJTdG9yYWdlU2VydmljZS5yZWFkKGtleSwgY29uZmlnSWQpIHx8IHt9O1xuXG4gICAgcmV0dXJuIHN0b3JlZENvbmZpZ1trZXldO1xuICB9XG5cbiAgd3JpdGUoa2V5OiBTdG9yYWdlS2V5cywgdmFsdWU6IGFueSwgY29uZmlnSWQ6IHN0cmluZyk6IHZvaWQge1xuICAgIGNvbnN0IHN0b3JlZENvbmZpZyA9IHRoaXMuYnJvd3NlclN0b3JhZ2VTZXJ2aWNlLnJlYWQoa2V5LCBjb25maWdJZCkgfHwge307XG5cbiAgICBzdG9yZWRDb25maWdba2V5XSA9IHZhbHVlO1xuICAgIHRoaXMuYnJvd3NlclN0b3JhZ2VTZXJ2aWNlLndyaXRlKHN0b3JlZENvbmZpZywgY29uZmlnSWQpO1xuICB9XG5cbiAgcmVtb3ZlKGtleTogU3RvcmFnZUtleXMsIGNvbmZpZ0lkOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBjb25zdCBzdG9yZWRDb25maWcgPSB0aGlzLmJyb3dzZXJTdG9yYWdlU2VydmljZS5yZWFkKGtleSwgY29uZmlnSWQpIHx8IHt9O1xuXG4gICAgZGVsZXRlIHN0b3JlZENvbmZpZ1trZXldO1xuXG4gICAgdGhpcy5icm93c2VyU3RvcmFnZVNlcnZpY2Uud3JpdGUoc3RvcmVkQ29uZmlnLCBjb25maWdJZCk7XG4gIH1cblxuICBjbGVhcihjb25maWdJZDogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5icm93c2VyU3RvcmFnZVNlcnZpY2UuY2xlYXIoY29uZmlnSWQpO1xuICB9XG5cbiAgcmVzZXRTdG9yYWdlRmxvd0RhdGEoY29uZmlnSWQ6IHN0cmluZyk6IHZvaWQge1xuICAgIHRoaXMucmVtb3ZlKCdzZXNzaW9uX3N0YXRlJywgY29uZmlnSWQpO1xuICAgIHRoaXMucmVtb3ZlKCdzdG9yYWdlU2lsZW50UmVuZXdSdW5uaW5nJywgY29uZmlnSWQpO1xuICAgIHRoaXMucmVtb3ZlKCdjb2RlVmVyaWZpZXInLCBjb25maWdJZCk7XG4gICAgdGhpcy5yZW1vdmUoJ3VzZXJEYXRhJywgY29uZmlnSWQpO1xuICAgIHRoaXMucmVtb3ZlKCdzdG9yYWdlQ3VzdG9tUGFyYW1zQXV0aFJlcXVlc3QnLCBjb25maWdJZCk7XG4gICAgdGhpcy5yZW1vdmUoJ2FjY2Vzc190b2tlbl9leHBpcmVzX2F0JywgY29uZmlnSWQpO1xuICAgIHRoaXMucmVtb3ZlKCdzdG9yYWdlQ3VzdG9tUGFyYW1zUmVmcmVzaCcsIGNvbmZpZ0lkKTtcbiAgICB0aGlzLnJlbW92ZSgnc3RvcmFnZUN1c3RvbVBhcmFtc0VuZFNlc3Npb24nLCBjb25maWdJZCk7XG4gIH1cblxuICByZXNldEF1dGhTdGF0ZUluU3RvcmFnZShjb25maWdJZDogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5yZW1vdmUoJ2F1dGh6RGF0YScsIGNvbmZpZ0lkKTtcbiAgICB0aGlzLnJlbW92ZSgnYXV0aG5SZXN1bHQnLCBjb25maWdJZCk7XG4gIH1cblxuICBnZXRBY2Nlc3NUb2tlbihjb25maWdJZDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5yZWFkKCdhdXRoekRhdGEnLCBjb25maWdJZCk7XG4gIH1cblxuICBnZXRJZFRva2VuKGNvbmZpZ0lkOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLnJlYWQoJ2F1dGhuUmVzdWx0JywgY29uZmlnSWQpPy5pZF90b2tlbjtcbiAgfVxuXG4gIGdldFJlZnJlc2hUb2tlbihjb25maWdJZDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5yZWFkKCdhdXRoblJlc3VsdCcsIGNvbmZpZ0lkKT8ucmVmcmVzaF90b2tlbjtcbiAgfVxuXG4gIGdldEF1dGhlbnRpY2F0aW9uUmVzdWx0KGNvbmZpZ0lkOiBzdHJpbmcpOiBhbnkge1xuICAgIHJldHVybiB0aGlzLnJlYWQoJ2F1dGhuUmVzdWx0JywgY29uZmlnSWQpO1xuICB9XG59XG4iXX0=