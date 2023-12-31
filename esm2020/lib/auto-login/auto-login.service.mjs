import { Injectable } from '@angular/core';
import * as i0 from "@angular/core";
import * as i1 from "../storage/storage-persistence.service";
import * as i2 from "@angular/router";
const STORAGE_KEY = 'redirect';
export class AutoLoginService {
    constructor(storageService, router) {
        this.storageService = storageService;
        this.router = router;
    }
    checkSavedRedirectRouteAndNavigate(configId) {
        const savedRouteForRedirect = this.getStoredRedirectRoute(configId);
        if (savedRouteForRedirect) {
            this.deleteStoredRedirectRoute(configId);
            this.router.navigateByUrl(savedRouteForRedirect);
        }
    }
    /**
     * Saves the redirect URL to storage.
     *
     * @param url The redirect URL to save.
     */
    saveRedirectRoute(configId, url) {
        this.storageService.write(STORAGE_KEY, url, configId);
    }
    /**
     * Gets the stored redirect URL from storage.
     */
    getStoredRedirectRoute(configId) {
        return this.storageService.read(STORAGE_KEY, configId);
    }
    /**
     * Removes the redirect URL from storage.
     */
    deleteStoredRedirectRoute(configId) {
        this.storageService.remove(STORAGE_KEY, configId);
    }
}
AutoLoginService.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: AutoLoginService, deps: [{ token: i1.StoragePersistenceService }, { token: i2.Router }], target: i0.ɵɵFactoryTarget.Injectable });
AutoLoginService.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: AutoLoginService });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: AutoLoginService, decorators: [{
            type: Injectable
        }], ctorParameters: function () { return [{ type: i1.StoragePersistenceService }, { type: i2.Router }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXV0by1sb2dpbi5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvYW5ndWxhci1hdXRoLW9pZGMtY2xpZW50L3NyYy9saWIvYXV0by1sb2dpbi9hdXRvLWxvZ2luLnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGVBQWUsQ0FBQzs7OztBQUkzQyxNQUFNLFdBQVcsR0FBRyxVQUFVLENBQUM7QUFHL0IsTUFBTSxPQUFPLGdCQUFnQjtJQUMzQixZQUE2QixjQUF5QyxFQUFtQixNQUFjO1FBQTFFLG1CQUFjLEdBQWQsY0FBYyxDQUEyQjtRQUFtQixXQUFNLEdBQU4sTUFBTSxDQUFRO0lBQUcsQ0FBQztJQUUzRyxrQ0FBa0MsQ0FBQyxRQUFnQjtRQUNqRCxNQUFNLHFCQUFxQixHQUFHLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUVwRSxJQUFJLHFCQUFxQixFQUFFO1lBQ3pCLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUN6QyxJQUFJLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO1NBQ2xEO0lBQ0gsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxpQkFBaUIsQ0FBQyxRQUFnQixFQUFFLEdBQVc7UUFDN0MsSUFBSSxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUMsV0FBVyxFQUFFLEdBQUcsRUFBRSxRQUFRLENBQUMsQ0FBQztJQUN4RCxDQUFDO0lBRUQ7O09BRUc7SUFDSyxzQkFBc0IsQ0FBQyxRQUFnQjtRQUM3QyxPQUFPLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxRQUFRLENBQUMsQ0FBQztJQUN6RCxDQUFDO0lBRUQ7O09BRUc7SUFDSyx5QkFBeUIsQ0FBQyxRQUFnQjtRQUNoRCxJQUFJLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxXQUFXLEVBQUUsUUFBUSxDQUFDLENBQUM7SUFDcEQsQ0FBQzs7NkdBakNVLGdCQUFnQjtpSEFBaEIsZ0JBQWdCOzJGQUFoQixnQkFBZ0I7a0JBRDVCLFVBQVUiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJbmplY3RhYmxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBSb3V0ZXIgfSBmcm9tICdAYW5ndWxhci9yb3V0ZXInO1xuaW1wb3J0IHsgU3RvcmFnZVBlcnNpc3RlbmNlU2VydmljZSB9IGZyb20gJy4uL3N0b3JhZ2Uvc3RvcmFnZS1wZXJzaXN0ZW5jZS5zZXJ2aWNlJztcblxuY29uc3QgU1RPUkFHRV9LRVkgPSAncmVkaXJlY3QnO1xuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgQXV0b0xvZ2luU2VydmljZSB7XG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgcmVhZG9ubHkgc3RvcmFnZVNlcnZpY2U6IFN0b3JhZ2VQZXJzaXN0ZW5jZVNlcnZpY2UsIHByaXZhdGUgcmVhZG9ubHkgcm91dGVyOiBSb3V0ZXIpIHt9XG5cbiAgY2hlY2tTYXZlZFJlZGlyZWN0Um91dGVBbmROYXZpZ2F0ZShjb25maWdJZDogc3RyaW5nKTogdm9pZCB7XG4gICAgY29uc3Qgc2F2ZWRSb3V0ZUZvclJlZGlyZWN0ID0gdGhpcy5nZXRTdG9yZWRSZWRpcmVjdFJvdXRlKGNvbmZpZ0lkKTtcblxuICAgIGlmIChzYXZlZFJvdXRlRm9yUmVkaXJlY3QpIHtcbiAgICAgIHRoaXMuZGVsZXRlU3RvcmVkUmVkaXJlY3RSb3V0ZShjb25maWdJZCk7XG4gICAgICB0aGlzLnJvdXRlci5uYXZpZ2F0ZUJ5VXJsKHNhdmVkUm91dGVGb3JSZWRpcmVjdCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFNhdmVzIHRoZSByZWRpcmVjdCBVUkwgdG8gc3RvcmFnZS5cbiAgICpcbiAgICogQHBhcmFtIHVybCBUaGUgcmVkaXJlY3QgVVJMIHRvIHNhdmUuXG4gICAqL1xuICBzYXZlUmVkaXJlY3RSb3V0ZShjb25maWdJZDogc3RyaW5nLCB1cmw6IHN0cmluZyk6IHZvaWQge1xuICAgIHRoaXMuc3RvcmFnZVNlcnZpY2Uud3JpdGUoU1RPUkFHRV9LRVksIHVybCwgY29uZmlnSWQpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgdGhlIHN0b3JlZCByZWRpcmVjdCBVUkwgZnJvbSBzdG9yYWdlLlxuICAgKi9cbiAgcHJpdmF0ZSBnZXRTdG9yZWRSZWRpcmVjdFJvdXRlKGNvbmZpZ0lkOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLnN0b3JhZ2VTZXJ2aWNlLnJlYWQoU1RPUkFHRV9LRVksIGNvbmZpZ0lkKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmVzIHRoZSByZWRpcmVjdCBVUkwgZnJvbSBzdG9yYWdlLlxuICAgKi9cbiAgcHJpdmF0ZSBkZWxldGVTdG9yZWRSZWRpcmVjdFJvdXRlKGNvbmZpZ0lkOiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLnN0b3JhZ2VTZXJ2aWNlLnJlbW92ZShTVE9SQUdFX0tFWSwgY29uZmlnSWQpO1xuICB9XG59XG4iXX0=