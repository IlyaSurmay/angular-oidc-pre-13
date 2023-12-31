import { Injectable } from '@angular/core';
import * as i0 from "@angular/core";
import * as i1 from "../../logging/logger.service";
import * as i2 from "../../utils/flowHelper/flow-helper.service";
export class ResponseTypeValidationService {
    constructor(loggerService, flowHelper) {
        this.loggerService = loggerService;
        this.flowHelper = flowHelper;
    }
    hasConfigValidResponseType(configId) {
        if (this.flowHelper.isCurrentFlowAnyImplicitFlow(configId)) {
            return true;
        }
        if (this.flowHelper.isCurrentFlowCodeFlow(configId)) {
            return true;
        }
        this.loggerService.logWarning(configId, 'module configured incorrectly, invalid response_type. Check the responseType in the config');
        return false;
    }
}
ResponseTypeValidationService.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: ResponseTypeValidationService, deps: [{ token: i1.LoggerService }, { token: i2.FlowHelper }], target: i0.ɵɵFactoryTarget.Injectable });
ResponseTypeValidationService.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: ResponseTypeValidationService });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: ResponseTypeValidationService, decorators: [{
            type: Injectable
        }], ctorParameters: function () { return [{ type: i1.LoggerService }, { type: i2.FlowHelper }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzcG9uc2UtdHlwZS12YWxpZGF0aW9uLnNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy9hbmd1bGFyLWF1dGgtb2lkYy1jbGllbnQvc3JjL2xpYi9sb2dpbi9yZXNwb25zZS10eXBlLXZhbGlkYXRpb24vcmVzcG9uc2UtdHlwZS12YWxpZGF0aW9uLnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGVBQWUsQ0FBQzs7OztBQUszQyxNQUFNLE9BQU8sNkJBQTZCO0lBQ3hDLFlBQW9CLGFBQTRCLEVBQVUsVUFBc0I7UUFBNUQsa0JBQWEsR0FBYixhQUFhLENBQWU7UUFBVSxlQUFVLEdBQVYsVUFBVSxDQUFZO0lBQUcsQ0FBQztJQUVwRiwwQkFBMEIsQ0FBQyxRQUFnQjtRQUN6QyxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsNEJBQTRCLENBQUMsUUFBUSxDQUFDLEVBQUU7WUFDMUQsT0FBTyxJQUFJLENBQUM7U0FDYjtRQUVELElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxxQkFBcUIsQ0FBQyxRQUFRLENBQUMsRUFBRTtZQUNuRCxPQUFPLElBQUksQ0FBQztTQUNiO1FBRUQsSUFBSSxDQUFDLGFBQWEsQ0FBQyxVQUFVLENBQUMsUUFBUSxFQUFFLDRGQUE0RixDQUFDLENBQUM7UUFFdEksT0FBTyxLQUFLLENBQUM7SUFDZixDQUFDOzswSEFmVSw2QkFBNkI7OEhBQTdCLDZCQUE2QjsyRkFBN0IsNkJBQTZCO2tCQUR6QyxVQUFVIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSW5qZWN0YWJsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgTG9nZ2VyU2VydmljZSB9IGZyb20gJy4uLy4uL2xvZ2dpbmcvbG9nZ2VyLnNlcnZpY2UnO1xuaW1wb3J0IHsgRmxvd0hlbHBlciB9IGZyb20gJy4uLy4uL3V0aWxzL2Zsb3dIZWxwZXIvZmxvdy1oZWxwZXIuc2VydmljZSc7XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBSZXNwb25zZVR5cGVWYWxpZGF0aW9uU2VydmljZSB7XG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgbG9nZ2VyU2VydmljZTogTG9nZ2VyU2VydmljZSwgcHJpdmF0ZSBmbG93SGVscGVyOiBGbG93SGVscGVyKSB7fVxuXG4gIGhhc0NvbmZpZ1ZhbGlkUmVzcG9uc2VUeXBlKGNvbmZpZ0lkOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICBpZiAodGhpcy5mbG93SGVscGVyLmlzQ3VycmVudEZsb3dBbnlJbXBsaWNpdEZsb3coY29uZmlnSWQpKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5mbG93SGVscGVyLmlzQ3VycmVudEZsb3dDb2RlRmxvdyhjb25maWdJZCkpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dXYXJuaW5nKGNvbmZpZ0lkLCAnbW9kdWxlIGNvbmZpZ3VyZWQgaW5jb3JyZWN0bHksIGludmFsaWQgcmVzcG9uc2VfdHlwZS4gQ2hlY2sgdGhlIHJlc3BvbnNlVHlwZSBpbiB0aGUgY29uZmlnJyk7XG5cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn1cbiJdfQ==