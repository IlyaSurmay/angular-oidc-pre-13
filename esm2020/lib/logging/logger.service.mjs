import { Injectable } from '@angular/core';
import { LogLevel } from './log-level';
import * as i0 from "@angular/core";
import * as i1 from "../config/provider/config.provider";
export class LoggerService {
    constructor(configurationProvider) {
        this.configurationProvider = configurationProvider;
    }
    logError(configId, message, ...args) {
        if (!!configId) {
            this.logErrorWithConfig(configId, message, ...args);
        }
        else {
            this.logErrorWithoutConfig(message, ...args);
        }
    }
    logWarning(configId, message, ...args) {
        if (!!configId) {
            this.logWarningWithConfig(configId, message, ...args);
        }
        else {
            this.logWarningWithoutConfig(message, ...args);
        }
    }
    logDebug(configId, message, ...args) {
        if (!this.logLevelIsSet(configId)) {
            return;
        }
        if (this.loggingIsTurnedOff(configId)) {
            return;
        }
        if (!this.currentLogLevelIsEqualOrSmallerThan(configId, LogLevel.Debug)) {
            return;
        }
        if (!!args && !!args.length) {
            console.log(`[DEBUG] ${configId} - ${message}`, ...args);
        }
        else {
            console.log(`[DEBUG] ${configId} - ${message}`);
        }
    }
    logWarningWithoutConfig(message, ...args) {
        if (!!args && !!args.length) {
            console.warn(`[WARN] - ${message}`, ...args);
        }
        else {
            console.warn(`[WARN] - ${message}`);
        }
    }
    logWarningWithConfig(configId, message, ...args) {
        if (!this.logLevelIsSet(configId)) {
            return;
        }
        if (this.loggingIsTurnedOff(configId)) {
            return;
        }
        if (!this.currentLogLevelIsEqualOrSmallerThan(configId, LogLevel.Warn)) {
            return;
        }
        if (!!args && !!args.length) {
            console.warn(`[WARN] ${configId} - ${message}`, ...args);
        }
        else {
            console.warn(`[WARN] ${configId} - ${message}`);
        }
    }
    logErrorWithConfig(configId, message, ...args) {
        if (this.loggingIsTurnedOff(configId)) {
            return;
        }
        if (!!args && !!args.length) {
            console.error(`[ERROR] ${configId} - ${message}`, ...args);
        }
        else {
            console.error(`[ERROR] ${configId} - ${message}`);
        }
    }
    logErrorWithoutConfig(message, ...args) {
        if (!!args && !!args.length) {
            console.error(`[ERROR] - ${message}`, ...args);
        }
        else {
            console.error(`[ERROR] - ${message}`);
        }
    }
    currentLogLevelIsEqualOrSmallerThan(configId, logLevelToCompare) {
        const { logLevel } = this.configurationProvider.getOpenIDConfiguration(configId) || {};
        return logLevel <= logLevelToCompare;
    }
    logLevelIsSet(configId) {
        const { logLevel } = this.configurationProvider.getOpenIDConfiguration(configId) || {};
        if (logLevel === null) {
            return false;
        }
        if (logLevel === undefined) {
            return false;
        }
        return true;
    }
    loggingIsTurnedOff(configId) {
        const { logLevel } = this.configurationProvider.getOpenIDConfiguration(configId) || {};
        return logLevel === LogLevel.None;
    }
}
LoggerService.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: LoggerService, deps: [{ token: i1.ConfigurationProvider }], target: i0.ɵɵFactoryTarget.Injectable });
LoggerService.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: LoggerService });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: LoggerService, decorators: [{
            type: Injectable
        }], ctorParameters: function () { return [{ type: i1.ConfigurationProvider }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9nZ2VyLnNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy9hbmd1bGFyLWF1dGgtb2lkYy1jbGllbnQvc3JjL2xpYi9sb2dnaW5nL2xvZ2dlci5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFFM0MsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLGFBQWEsQ0FBQzs7O0FBR3ZDLE1BQU0sT0FBTyxhQUFhO0lBQ3hCLFlBQW9CLHFCQUE0QztRQUE1QywwQkFBcUIsR0FBckIscUJBQXFCLENBQXVCO0lBQUcsQ0FBQztJQUVwRSxRQUFRLENBQUMsUUFBZ0IsRUFBRSxPQUFZLEVBQUUsR0FBRyxJQUFXO1FBQ3JELElBQUksQ0FBQyxDQUFDLFFBQVEsRUFBRTtZQUNkLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxRQUFRLEVBQUUsT0FBTyxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUM7U0FDckQ7YUFBTTtZQUNMLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxPQUFPLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQztTQUM5QztJQUNILENBQUM7SUFFRCxVQUFVLENBQUMsUUFBZ0IsRUFBRSxPQUFZLEVBQUUsR0FBRyxJQUFXO1FBQ3ZELElBQUksQ0FBQyxDQUFDLFFBQVEsRUFBRTtZQUNkLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxRQUFRLEVBQUUsT0FBTyxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUM7U0FDdkQ7YUFBTTtZQUNMLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxPQUFPLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQztTQUNoRDtJQUNILENBQUM7SUFFRCxRQUFRLENBQUMsUUFBZ0IsRUFBRSxPQUFZLEVBQUUsR0FBRyxJQUFXO1FBQ3JELElBQUksQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxFQUFFO1lBQ2pD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LElBQUksRUFBRSxDQUFDO1FBRXZGLE9BQU8sUUFBUSxJQUFJLGlCQUFpQixDQUFDO0lBQ3ZDLENBQUM7SUFFTyxhQUFhLENBQUMsUUFBZ0I7UUFDcEMsTUFBTSxFQUFFLFFBQVEsRUFBRSxHQUFHLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxzQkFBc0IsQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLENBQUM7UUFFdkYsSUFBSSxRQUFRLEtBQUssSUFBSSxFQUFFO1lBQ3JCLE9BQU8sS0FBSyxDQUFDO1NBQ2Q7UUFFRCxJQUFJLFFBQVEsS0FBSyxTQUFTLEVBQUU7WUFDMUIsT0FBTyxLQUFLLENBQUM7U0FDZDtRQUVELE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQUVPLGtCQUFrQixDQUFDLFFBQWdCO1FBQ3pDLE1BQU0sRUFBRSxRQUFRLEVBQUUsR0FBRyxJQUFJLENBQUMscUJBQXFCLENBQUMsc0JBQXNCLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDO1FBRXZGLE9BQU8sUUFBUSxLQUFLLFFBQVEsQ0FBQyxJQUFJLENBQUM7SUFDcEMsQ0FBQzs7MEdBL0dVLGFBQWE7OEdBQWIsYUFBYTsyRkFBYixhQUFhO2tCQUR6QixVQUFVIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSW5qZWN0YWJsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgQ29uZmlndXJhdGlvblByb3ZpZGVyIH0gZnJvbSAnLi4vY29uZmlnL3Byb3ZpZGVyL2NvbmZpZy5wcm92aWRlcic7XG5pbXBvcnQgeyBMb2dMZXZlbCB9IGZyb20gJy4vbG9nLWxldmVsJztcblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIExvZ2dlclNlcnZpY2Uge1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGNvbmZpZ3VyYXRpb25Qcm92aWRlcjogQ29uZmlndXJhdGlvblByb3ZpZGVyKSB7fVxuXG4gIGxvZ0Vycm9yKGNvbmZpZ0lkOiBzdHJpbmcsIG1lc3NhZ2U6IGFueSwgLi4uYXJnczogYW55W10pOiB2b2lkIHtcbiAgICBpZiAoISFjb25maWdJZCkge1xuICAgICAgdGhpcy5sb2dFcnJvcldpdGhDb25maWcoY29uZmlnSWQsIG1lc3NhZ2UsIC4uLmFyZ3MpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmxvZ0Vycm9yV2l0aG91dENvbmZpZyhtZXNzYWdlLCAuLi5hcmdzKTtcbiAgICB9XG4gIH1cblxuICBsb2dXYXJuaW5nKGNvbmZpZ0lkOiBzdHJpbmcsIG1lc3NhZ2U6IGFueSwgLi4uYXJnczogYW55W10pOiB2b2lkIHtcbiAgICBpZiAoISFjb25maWdJZCkge1xuICAgICAgdGhpcy5sb2dXYXJuaW5nV2l0aENvbmZpZyhjb25maWdJZCwgbWVzc2FnZSwgLi4uYXJncyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMubG9nV2FybmluZ1dpdGhvdXRDb25maWcobWVzc2FnZSwgLi4uYXJncyk7XG4gICAgfVxuICB9XG5cbiAgbG9nRGVidWcoY29uZmlnSWQ6IHN0cmluZywgbWVzc2FnZTogYW55LCAuLi5hcmdzOiBhbnlbXSk6IHZvaWQge1xuICAgIGlmICghdGhpcy5sb2dMZXZlbElzU2V0KGNvbmZpZ0lkKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmICh0aGlzLmxvZ2dpbmdJc1R1cm5lZE9mZihjb25maWdJZCkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoIXRoaXMuY3VycmVudExvZ0xldmVsSXNFcXVhbE9yU21hbGxlclRoYW4oY29uZmlnSWQsIExvZ0xldmVsLkRlYnVnKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmICghIWFyZ3MgJiYgISFhcmdzLmxlbmd0aCkge1xuICAgICAgY29uc29sZS5sb2coYFtERUJVR10gJHtjb25maWdJZH0gLSAke21lc3NhZ2V9YCwgLi4uYXJncyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnNvbGUubG9nKGBbREVCVUddICR7Y29uZmlnSWR9IC0gJHttZXNzYWdlfWApO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgbG9nV2FybmluZ1dpdGhvdXRDb25maWcobWVzc2FnZTogYW55LCAuLi5hcmdzOiBhbnlbXSk6IHZvaWQge1xuICAgIGlmICghIWFyZ3MgJiYgISFhcmdzLmxlbmd0aCkge1xuICAgICAgY29uc29sZS53YXJuKGBbV0FSTl0gLSAke21lc3NhZ2V9YCwgLi4uYXJncyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnNvbGUud2FybihgW1dBUk5dIC0gJHttZXNzYWdlfWApO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgbG9nV2FybmluZ1dpdGhDb25maWcoY29uZmlnSWQ6IHN0cmluZywgbWVzc2FnZTogYW55LCAuLi5hcmdzOiBhbnlbXSk6IHZvaWQge1xuICAgIGlmICghdGhpcy5sb2dMZXZlbElzU2V0KGNvbmZpZ0lkKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmICh0aGlzLmxvZ2dpbmdJc1R1cm5lZE9mZihjb25maWdJZCkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoIXRoaXMuY3VycmVudExvZ0xldmVsSXNFcXVhbE9yU21hbGxlclRoYW4oY29uZmlnSWQsIExvZ0xldmVsLldhcm4pKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKCEhYXJncyAmJiAhIWFyZ3MubGVuZ3RoKSB7XG4gICAgICBjb25zb2xlLndhcm4oYFtXQVJOXSAke2NvbmZpZ0lkfSAtICR7bWVzc2FnZX1gLCAuLi5hcmdzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc29sZS53YXJuKGBbV0FSTl0gJHtjb25maWdJZH0gLSAke21lc3NhZ2V9YCk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBsb2dFcnJvcldpdGhDb25maWcoY29uZmlnSWQ6IHN0cmluZywgbWVzc2FnZTogYW55LCAuLi5hcmdzOiBhbnlbXSk6IHZvaWQge1xuICAgIGlmICh0aGlzLmxvZ2dpbmdJc1R1cm5lZE9mZihjb25maWdJZCkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoISFhcmdzICYmICEhYXJncy5sZW5ndGgpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoYFtFUlJPUl0gJHtjb25maWdJZH0gLSAke21lc3NhZ2V9YCwgLi4uYXJncyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoYFtFUlJPUl0gJHtjb25maWdJZH0gLSAke21lc3NhZ2V9YCk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBsb2dFcnJvcldpdGhvdXRDb25maWcobWVzc2FnZTogYW55LCAuLi5hcmdzOiBhbnlbXSk6IHZvaWQge1xuICAgIGlmICghIWFyZ3MgJiYgISFhcmdzLmxlbmd0aCkge1xuICAgICAgY29uc29sZS5lcnJvcihgW0VSUk9SXSAtICR7bWVzc2FnZX1gLCAuLi5hcmdzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc29sZS5lcnJvcihgW0VSUk9SXSAtICR7bWVzc2FnZX1gKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGN1cnJlbnRMb2dMZXZlbElzRXF1YWxPclNtYWxsZXJUaGFuKGNvbmZpZ0lkOiBzdHJpbmcsIGxvZ0xldmVsVG9Db21wYXJlOiBMb2dMZXZlbCk6IGJvb2xlYW4ge1xuICAgIGNvbnN0IHsgbG9nTGV2ZWwgfSA9IHRoaXMuY29uZmlndXJhdGlvblByb3ZpZGVyLmdldE9wZW5JRENvbmZpZ3VyYXRpb24oY29uZmlnSWQpIHx8IHt9O1xuXG4gICAgcmV0dXJuIGxvZ0xldmVsIDw9IGxvZ0xldmVsVG9Db21wYXJlO1xuICB9XG5cbiAgcHJpdmF0ZSBsb2dMZXZlbElzU2V0KGNvbmZpZ0lkOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICBjb25zdCB7IGxvZ0xldmVsIH0gPSB0aGlzLmNvbmZpZ3VyYXRpb25Qcm92aWRlci5nZXRPcGVuSURDb25maWd1cmF0aW9uKGNvbmZpZ0lkKSB8fCB7fTtcblxuICAgIGlmIChsb2dMZXZlbCA9PT0gbnVsbCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGlmIChsb2dMZXZlbCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICBwcml2YXRlIGxvZ2dpbmdJc1R1cm5lZE9mZihjb25maWdJZDogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgY29uc3QgeyBsb2dMZXZlbCB9ID0gdGhpcy5jb25maWd1cmF0aW9uUHJvdmlkZXIuZ2V0T3BlbklEQ29uZmlndXJhdGlvbihjb25maWdJZCkgfHwge307XG5cbiAgICByZXR1cm4gbG9nTGV2ZWwgPT09IExvZ0xldmVsLk5vbmU7XG4gIH1cbn1cbiJdfQ==