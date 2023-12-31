import { Injectable } from '@angular/core';
import * as i0 from "@angular/core";
import * as i1 from "../auth-state/auth-state.service";
import * as i2 from "./flows-data.service";
import * as i3 from "../user-data/user.service";
export class ResetAuthDataService {
    constructor(authStateService, flowsDataService, userService) {
        this.authStateService = authStateService;
        this.flowsDataService = flowsDataService;
        this.userService = userService;
    }
    resetAuthorizationData(configId) {
        this.userService.resetUserDataInStore(configId);
        this.flowsDataService.resetStorageFlowData(configId);
        this.authStateService.setUnauthenticatedAndFireEvent(configId);
    }
}
ResetAuthDataService.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: ResetAuthDataService, deps: [{ token: i1.AuthStateService }, { token: i2.FlowsDataService }, { token: i3.UserService }], target: i0.ɵɵFactoryTarget.Injectable });
ResetAuthDataService.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: ResetAuthDataService });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: ResetAuthDataService, decorators: [{
            type: Injectable
        }], ctorParameters: function () { return [{ type: i1.AuthStateService }, { type: i2.FlowsDataService }, { type: i3.UserService }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzZXQtYXV0aC1kYXRhLnNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy9hbmd1bGFyLWF1dGgtb2lkYy1jbGllbnQvc3JjL2xpYi9mbG93cy9yZXNldC1hdXRoLWRhdGEuc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sZUFBZSxDQUFDOzs7OztBQU0zQyxNQUFNLE9BQU8sb0JBQW9CO0lBQy9CLFlBQ21CLGdCQUFrQyxFQUNsQyxnQkFBa0MsRUFDbEMsV0FBd0I7UUFGeEIscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFrQjtRQUNsQyxxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQWtCO1FBQ2xDLGdCQUFXLEdBQVgsV0FBVyxDQUFhO0lBQ3hDLENBQUM7SUFFSixzQkFBc0IsQ0FBQyxRQUFnQjtRQUNyQyxJQUFJLENBQUMsV0FBVyxDQUFDLG9CQUFvQixDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ2hELElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxvQkFBb0IsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUNyRCxJQUFJLENBQUMsZ0JBQWdCLENBQUMsOEJBQThCLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDakUsQ0FBQzs7aUhBWFUsb0JBQW9CO3FIQUFwQixvQkFBb0I7MkZBQXBCLG9CQUFvQjtrQkFEaEMsVUFBVSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEluamVjdGFibGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IEF1dGhTdGF0ZVNlcnZpY2UgfSBmcm9tICcuLi9hdXRoLXN0YXRlL2F1dGgtc3RhdGUuc2VydmljZSc7XG5pbXBvcnQgeyBVc2VyU2VydmljZSB9IGZyb20gJy4uL3VzZXItZGF0YS91c2VyLnNlcnZpY2UnO1xuaW1wb3J0IHsgRmxvd3NEYXRhU2VydmljZSB9IGZyb20gJy4vZmxvd3MtZGF0YS5zZXJ2aWNlJztcblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIFJlc2V0QXV0aERhdGFTZXJ2aWNlIHtcbiAgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSByZWFkb25seSBhdXRoU3RhdGVTZXJ2aWNlOiBBdXRoU3RhdGVTZXJ2aWNlLFxuICAgIHByaXZhdGUgcmVhZG9ubHkgZmxvd3NEYXRhU2VydmljZTogRmxvd3NEYXRhU2VydmljZSxcbiAgICBwcml2YXRlIHJlYWRvbmx5IHVzZXJTZXJ2aWNlOiBVc2VyU2VydmljZVxuICApIHt9XG5cbiAgcmVzZXRBdXRob3JpemF0aW9uRGF0YShjb25maWdJZDogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy51c2VyU2VydmljZS5yZXNldFVzZXJEYXRhSW5TdG9yZShjb25maWdJZCk7XG4gICAgdGhpcy5mbG93c0RhdGFTZXJ2aWNlLnJlc2V0U3RvcmFnZUZsb3dEYXRhKGNvbmZpZ0lkKTtcbiAgICB0aGlzLmF1dGhTdGF0ZVNlcnZpY2Uuc2V0VW5hdXRoZW50aWNhdGVkQW5kRmlyZUV2ZW50KGNvbmZpZ0lkKTtcbiAgfVxufVxuIl19