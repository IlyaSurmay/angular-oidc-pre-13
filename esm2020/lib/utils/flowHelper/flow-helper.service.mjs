import { Injectable } from '@angular/core';
import * as i0 from "@angular/core";
import * as i1 from "../../config/provider/config.provider";
export class FlowHelper {
    constructor(configurationProvider) {
        this.configurationProvider = configurationProvider;
    }
    isCurrentFlowCodeFlow(configId) {
        return this.currentFlowIs('code', configId);
    }
    isCurrentFlowAnyImplicitFlow(configId) {
        return this.isCurrentFlowImplicitFlowWithAccessToken(configId) || this.isCurrentFlowImplicitFlowWithoutAccessToken(configId);
    }
    isCurrentFlowCodeFlowWithRefreshTokens(configId) {
        const { useRefreshToken } = this.configurationProvider.getOpenIDConfiguration(configId);
        if (this.isCurrentFlowCodeFlow(configId) && useRefreshToken) {
            return true;
        }
        return false;
    }
    isCurrentFlowImplicitFlowWithAccessToken(configId) {
        return this.currentFlowIs('id_token token', configId);
    }
    currentFlowIs(flowTypes, configId) {
        const { responseType } = this.configurationProvider.getOpenIDConfiguration(configId);
        if (Array.isArray(flowTypes)) {
            return flowTypes.some((x) => responseType === x);
        }
        return responseType === flowTypes;
    }
    isCurrentFlowImplicitFlowWithoutAccessToken(configId) {
        return this.currentFlowIs('id_token', configId);
    }
}
FlowHelper.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: FlowHelper, deps: [{ token: i1.ConfigurationProvider }], target: i0.ɵɵFactoryTarget.Injectable });
FlowHelper.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: FlowHelper });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: FlowHelper, decorators: [{
            type: Injectable
        }], ctorParameters: function () { return [{ type: i1.ConfigurationProvider }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmxvdy1oZWxwZXIuc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL2FuZ3VsYXItYXV0aC1vaWRjLWNsaWVudC9zcmMvbGliL3V0aWxzL2Zsb3dIZWxwZXIvZmxvdy1oZWxwZXIuc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sZUFBZSxDQUFDOzs7QUFJM0MsTUFBTSxPQUFPLFVBQVU7SUFDckIsWUFBb0IscUJBQTRDO1FBQTVDLDBCQUFxQixHQUFyQixxQkFBcUIsQ0FBdUI7SUFBRyxDQUFDO0lBRXBFLHFCQUFxQixDQUFDLFFBQWdCO1FBQ3BDLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLEVBQUUsUUFBUSxDQUFDLENBQUM7SUFDOUMsQ0FBQztJQUVELDRCQUE0QixDQUFDLFFBQWdCO1FBQzNDLE9BQU8sSUFBSSxDQUFDLHdDQUF3QyxDQUFDLFFBQVEsQ0FBQyxJQUFJLElBQUksQ0FBQywyQ0FBMkMsQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUMvSCxDQUFDO0lBRUQsc0NBQXNDLENBQUMsUUFBZ0I7UUFDckQsTUFBTSxFQUFFLGVBQWUsRUFBRSxHQUFHLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxzQkFBc0IsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUN4RixJQUFJLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxRQUFRLENBQUMsSUFBSSxlQUFlLEVBQUU7WUFDM0QsT0FBTyxJQUFJLENBQUM7U0FDYjtRQUVELE9BQU8sS0FBSyxDQUFDO0lBQ2YsQ0FBQztJQUVELHdDQUF3QyxDQUFDLFFBQWdCO1FBQ3ZELE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxnQkFBZ0IsRUFBRSxRQUFRLENBQUMsQ0FBQztJQUN4RCxDQUFDO0lBRUQsYUFBYSxDQUFDLFNBQTRCLEVBQUUsUUFBZ0I7UUFDMUQsTUFBTSxFQUFFLFlBQVksRUFBRSxHQUFHLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxzQkFBc0IsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUVyRixJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLEVBQUU7WUFDNUIsT0FBTyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxZQUFZLEtBQUssQ0FBQyxDQUFDLENBQUM7U0FDbEQ7UUFFRCxPQUFPLFlBQVksS0FBSyxTQUFTLENBQUM7SUFDcEMsQ0FBQztJQUVPLDJDQUEyQyxDQUFDLFFBQWdCO1FBQ2xFLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxVQUFVLEVBQUUsUUFBUSxDQUFDLENBQUM7SUFDbEQsQ0FBQzs7dUdBcENVLFVBQVU7MkdBQVYsVUFBVTsyRkFBVixVQUFVO2tCQUR0QixVQUFVIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSW5qZWN0YWJsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgQ29uZmlndXJhdGlvblByb3ZpZGVyIH0gZnJvbSAnLi4vLi4vY29uZmlnL3Byb3ZpZGVyL2NvbmZpZy5wcm92aWRlcic7XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBGbG93SGVscGVyIHtcbiAgY29uc3RydWN0b3IocHJpdmF0ZSBjb25maWd1cmF0aW9uUHJvdmlkZXI6IENvbmZpZ3VyYXRpb25Qcm92aWRlcikge31cblxuICBpc0N1cnJlbnRGbG93Q29kZUZsb3coY29uZmlnSWQ6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmN1cnJlbnRGbG93SXMoJ2NvZGUnLCBjb25maWdJZCk7XG4gIH1cblxuICBpc0N1cnJlbnRGbG93QW55SW1wbGljaXRGbG93KGNvbmZpZ0lkOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5pc0N1cnJlbnRGbG93SW1wbGljaXRGbG93V2l0aEFjY2Vzc1Rva2VuKGNvbmZpZ0lkKSB8fCB0aGlzLmlzQ3VycmVudEZsb3dJbXBsaWNpdEZsb3dXaXRob3V0QWNjZXNzVG9rZW4oY29uZmlnSWQpO1xuICB9XG5cbiAgaXNDdXJyZW50Rmxvd0NvZGVGbG93V2l0aFJlZnJlc2hUb2tlbnMoY29uZmlnSWQ6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIGNvbnN0IHsgdXNlUmVmcmVzaFRva2VuIH0gPSB0aGlzLmNvbmZpZ3VyYXRpb25Qcm92aWRlci5nZXRPcGVuSURDb25maWd1cmF0aW9uKGNvbmZpZ0lkKTtcbiAgICBpZiAodGhpcy5pc0N1cnJlbnRGbG93Q29kZUZsb3coY29uZmlnSWQpICYmIHVzZVJlZnJlc2hUb2tlbikge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgaXNDdXJyZW50Rmxvd0ltcGxpY2l0Rmxvd1dpdGhBY2Nlc3NUb2tlbihjb25maWdJZDogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuY3VycmVudEZsb3dJcygnaWRfdG9rZW4gdG9rZW4nLCBjb25maWdJZCk7XG4gIH1cblxuICBjdXJyZW50Rmxvd0lzKGZsb3dUeXBlczogc3RyaW5nW10gfCBzdHJpbmcsIGNvbmZpZ0lkOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICBjb25zdCB7IHJlc3BvbnNlVHlwZSB9ID0gdGhpcy5jb25maWd1cmF0aW9uUHJvdmlkZXIuZ2V0T3BlbklEQ29uZmlndXJhdGlvbihjb25maWdJZCk7XG5cbiAgICBpZiAoQXJyYXkuaXNBcnJheShmbG93VHlwZXMpKSB7XG4gICAgICByZXR1cm4gZmxvd1R5cGVzLnNvbWUoKHgpID0+IHJlc3BvbnNlVHlwZSA9PT0geCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlc3BvbnNlVHlwZSA9PT0gZmxvd1R5cGVzO1xuICB9XG5cbiAgcHJpdmF0ZSBpc0N1cnJlbnRGbG93SW1wbGljaXRGbG93V2l0aG91dEFjY2Vzc1Rva2VuKGNvbmZpZ0lkOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5jdXJyZW50Rmxvd0lzKCdpZF90b2tlbicsIGNvbmZpZ0lkKTtcbiAgfVxufVxuIl19