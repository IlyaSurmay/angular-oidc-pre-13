import { Injectable } from '@angular/core';
import * as i0 from "@angular/core";
export class ConfigurationProvider {
    constructor() {
        this.configsInternal = {};
    }
    hasAtLeastOneConfig() {
        return Object.keys(this.configsInternal).length > 0;
    }
    hasManyConfigs() {
        return Object.keys(this.configsInternal).length > 1;
    }
    setConfig(readyConfig) {
        const { configId } = readyConfig;
        this.configsInternal[configId] = readyConfig;
    }
    getOpenIDConfiguration(configId) {
        if (!!configId) {
            return this.configsInternal[configId] || null;
        }
        const [, value] = Object.entries(this.configsInternal)[0] || [[null, null]];
        return value || null;
    }
    getAllConfigurations() {
        return Object.values(this.configsInternal);
    }
}
ConfigurationProvider.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: ConfigurationProvider, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
ConfigurationProvider.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: ConfigurationProvider });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: ConfigurationProvider, decorators: [{
            type: Injectable
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnLnByb3ZpZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvYW5ndWxhci1hdXRoLW9pZGMtY2xpZW50L3NyYy9saWIvY29uZmlnL3Byb3ZpZGVyL2NvbmZpZy5wcm92aWRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sZUFBZSxDQUFDOztBQUkzQyxNQUFNLE9BQU8scUJBQXFCO0lBRGxDO1FBRVUsb0JBQWUsR0FBd0MsRUFBRSxDQUFDO0tBNEJuRTtJQTFCQyxtQkFBbUI7UUFDakIsT0FBTyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO0lBQ3RELENBQUM7SUFFRCxjQUFjO1FBQ1osT0FBTyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO0lBQ3RELENBQUM7SUFFRCxTQUFTLENBQUMsV0FBZ0M7UUFDeEMsTUFBTSxFQUFFLFFBQVEsRUFBRSxHQUFHLFdBQVcsQ0FBQztRQUNqQyxJQUFJLENBQUMsZUFBZSxDQUFDLFFBQVEsQ0FBQyxHQUFHLFdBQVcsQ0FBQztJQUMvQyxDQUFDO0lBRUQsc0JBQXNCLENBQUMsUUFBaUI7UUFDdEMsSUFBSSxDQUFDLENBQUMsUUFBUSxFQUFFO1lBQ2QsT0FBTyxJQUFJLENBQUMsZUFBZSxDQUFDLFFBQVEsQ0FBQyxJQUFJLElBQUksQ0FBQztTQUMvQztRQUVELE1BQU0sQ0FBQyxFQUFFLEtBQUssQ0FBQyxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUU1RSxPQUFPLEtBQUssSUFBSSxJQUFJLENBQUM7SUFDdkIsQ0FBQztJQUVELG9CQUFvQjtRQUNsQixPQUFPLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDO0lBQzdDLENBQUM7O2tIQTVCVSxxQkFBcUI7c0hBQXJCLHFCQUFxQjsyRkFBckIscUJBQXFCO2tCQURqQyxVQUFVIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSW5qZWN0YWJsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgT3BlbklkQ29uZmlndXJhdGlvbiB9IGZyb20gJy4uL29wZW5pZC1jb25maWd1cmF0aW9uJztcblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIENvbmZpZ3VyYXRpb25Qcm92aWRlciB7XG4gIHByaXZhdGUgY29uZmlnc0ludGVybmFsOiBSZWNvcmQ8c3RyaW5nLCBPcGVuSWRDb25maWd1cmF0aW9uPiA9IHt9O1xuXG4gIGhhc0F0TGVhc3RPbmVDb25maWcoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIE9iamVjdC5rZXlzKHRoaXMuY29uZmlnc0ludGVybmFsKS5sZW5ndGggPiAwO1xuICB9XG5cbiAgaGFzTWFueUNvbmZpZ3MoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIE9iamVjdC5rZXlzKHRoaXMuY29uZmlnc0ludGVybmFsKS5sZW5ndGggPiAxO1xuICB9XG5cbiAgc2V0Q29uZmlnKHJlYWR5Q29uZmlnOiBPcGVuSWRDb25maWd1cmF0aW9uKTogdm9pZCB7XG4gICAgY29uc3QgeyBjb25maWdJZCB9ID0gcmVhZHlDb25maWc7XG4gICAgdGhpcy5jb25maWdzSW50ZXJuYWxbY29uZmlnSWRdID0gcmVhZHlDb25maWc7XG4gIH1cblxuICBnZXRPcGVuSURDb25maWd1cmF0aW9uKGNvbmZpZ0lkPzogc3RyaW5nKTogT3BlbklkQ29uZmlndXJhdGlvbiB7XG4gICAgaWYgKCEhY29uZmlnSWQpIHtcbiAgICAgIHJldHVybiB0aGlzLmNvbmZpZ3NJbnRlcm5hbFtjb25maWdJZF0gfHwgbnVsbDtcbiAgICB9XG5cbiAgICBjb25zdCBbLCB2YWx1ZV0gPSBPYmplY3QuZW50cmllcyh0aGlzLmNvbmZpZ3NJbnRlcm5hbClbMF0gfHwgW1tudWxsLCBudWxsXV07XG5cbiAgICByZXR1cm4gdmFsdWUgfHwgbnVsbDtcbiAgfVxuXG4gIGdldEFsbENvbmZpZ3VyYXRpb25zKCk6IE9wZW5JZENvbmZpZ3VyYXRpb25bXSB7XG4gICAgcmV0dXJuIE9iamVjdC52YWx1ZXModGhpcy5jb25maWdzSW50ZXJuYWwpO1xuICB9XG59XG4iXX0=