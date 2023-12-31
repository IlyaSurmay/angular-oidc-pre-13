import { Injectable } from '@angular/core';
import * as i0 from "@angular/core";
export class DefaultSessionStorageService {
    read(key) {
        return sessionStorage.getItem(key);
    }
    write(key, value) {
        sessionStorage.setItem(key, value);
    }
    remove(key) {
        sessionStorage.removeItem(key);
    }
    clear() {
        sessionStorage.clear();
    }
}
DefaultSessionStorageService.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: DefaultSessionStorageService, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
DefaultSessionStorageService.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: DefaultSessionStorageService });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: DefaultSessionStorageService, decorators: [{
            type: Injectable
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVmYXVsdC1zZXNzaW9uc3RvcmFnZS5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvYW5ndWxhci1hdXRoLW9pZGMtY2xpZW50L3NyYy9saWIvc3RvcmFnZS9kZWZhdWx0LXNlc3Npb25zdG9yYWdlLnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGVBQWUsQ0FBQzs7QUFJM0MsTUFBTSxPQUFPLDRCQUE0QjtJQUNoQyxJQUFJLENBQUMsR0FBVztRQUNyQixPQUFPLGNBQWMsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDckMsQ0FBQztJQUVNLEtBQUssQ0FBQyxHQUFXLEVBQUUsS0FBVTtRQUNsQyxjQUFjLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsQ0FBQztJQUNyQyxDQUFDO0lBRU0sTUFBTSxDQUFDLEdBQVc7UUFDdkIsY0FBYyxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNqQyxDQUFDO0lBRU0sS0FBSztRQUNWLGNBQWMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUN6QixDQUFDOzt5SEFmVSw0QkFBNEI7NkhBQTVCLDRCQUE0QjsyRkFBNUIsNEJBQTRCO2tCQUR4QyxVQUFVIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSW5qZWN0YWJsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgQWJzdHJhY3RTZWN1cml0eVN0b3JhZ2UgfSBmcm9tICcuL2Fic3RyYWN0LXNlY3VyaXR5LXN0b3JhZ2UnO1xuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgRGVmYXVsdFNlc3Npb25TdG9yYWdlU2VydmljZSBpbXBsZW1lbnRzIEFic3RyYWN0U2VjdXJpdHlTdG9yYWdlIHtcbiAgcHVibGljIHJlYWQoa2V5OiBzdHJpbmcpOiBhbnkge1xuICAgIHJldHVybiBzZXNzaW9uU3RvcmFnZS5nZXRJdGVtKGtleSk7XG4gIH1cblxuICBwdWJsaWMgd3JpdGUoa2V5OiBzdHJpbmcsIHZhbHVlOiBhbnkpOiB2b2lkIHtcbiAgICBzZXNzaW9uU3RvcmFnZS5zZXRJdGVtKGtleSwgdmFsdWUpO1xuICB9XG5cbiAgcHVibGljIHJlbW92ZShrZXk6IHN0cmluZyk6IHZvaWQge1xuICAgIHNlc3Npb25TdG9yYWdlLnJlbW92ZUl0ZW0oa2V5KTtcbiAgfVxuXG4gIHB1YmxpYyBjbGVhcigpOiB2b2lkIHtcbiAgICBzZXNzaW9uU3RvcmFnZS5jbGVhcigpO1xuICB9XG59XG4iXX0=