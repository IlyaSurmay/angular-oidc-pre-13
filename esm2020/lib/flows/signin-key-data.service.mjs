import { HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import * as i0 from "@angular/core";
import * as i1 from "../storage/storage-persistence.service";
import * as i2 from "../logging/logger.service";
import * as i3 from "../api/data.service";
export class SigninKeyDataService {
    constructor(storagePersistenceService, loggerService, dataService) {
        this.storagePersistenceService = storagePersistenceService;
        this.loggerService = loggerService;
        this.dataService = dataService;
    }
    getSigningKeys(configId) {
        const authWellKnownEndPoints = this.storagePersistenceService.read('authWellKnownEndPoints', configId);
        const jwksUri = authWellKnownEndPoints?.jwksUri;
        if (!jwksUri) {
            const error = `getSigningKeys: authWellKnownEndpoints.jwksUri is: '${jwksUri}'`;
            this.loggerService.logWarning(configId, error);
            return throwError(() => new Error(error));
        }
        this.loggerService.logDebug(configId, 'Getting signinkeys from ', jwksUri);
        return this.dataService.get(jwksUri, configId).pipe(retry(2), catchError((e) => this.handleErrorGetSigningKeys(e, configId)));
    }
    handleErrorGetSigningKeys(errorResponse, configId) {
        let errMsg = '';
        if (errorResponse instanceof HttpResponse) {
            const body = errorResponse.body || {};
            const err = JSON.stringify(body);
            const { status, statusText } = errorResponse;
            errMsg = `${status || ''} - ${statusText || ''} ${err || ''}`;
        }
        else {
            const { message } = errorResponse;
            errMsg = !!message ? message : `${errorResponse}`;
        }
        this.loggerService.logError(configId, errMsg);
        return throwError(() => new Error(errMsg));
    }
}
SigninKeyDataService.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: SigninKeyDataService, deps: [{ token: i1.StoragePersistenceService }, { token: i2.LoggerService }, { token: i3.DataService }], target: i0.ɵɵFactoryTarget.Injectable });
SigninKeyDataService.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: SigninKeyDataService });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: SigninKeyDataService, decorators: [{
            type: Injectable
        }], ctorParameters: function () { return [{ type: i1.StoragePersistenceService }, { type: i2.LoggerService }, { type: i3.DataService }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2lnbmluLWtleS1kYXRhLnNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy9hbmd1bGFyLWF1dGgtb2lkYy1jbGllbnQvc3JjL2xpYi9mbG93cy9zaWduaW4ta2V5LWRhdGEuc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUFDcEQsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUMzQyxPQUFPLEVBQWMsVUFBVSxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBQzlDLE9BQU8sRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7Ozs7O0FBT25ELE1BQU0sT0FBTyxvQkFBb0I7SUFDL0IsWUFDVSx5QkFBb0QsRUFDcEQsYUFBNEIsRUFDNUIsV0FBd0I7UUFGeEIsOEJBQXlCLEdBQXpCLHlCQUF5QixDQUEyQjtRQUNwRCxrQkFBYSxHQUFiLGFBQWEsQ0FBZTtRQUM1QixnQkFBVyxHQUFYLFdBQVcsQ0FBYTtJQUMvQixDQUFDO0lBRUosY0FBYyxDQUFDLFFBQWdCO1FBQzdCLE1BQU0sc0JBQXNCLEdBQUcsSUFBSSxDQUFDLHlCQUF5QixDQUFDLElBQUksQ0FBQyx3QkFBd0IsRUFBRSxRQUFRLENBQUMsQ0FBQztRQUN2RyxNQUFNLE9BQU8sR0FBRyxzQkFBc0IsRUFBRSxPQUFPLENBQUM7UUFDaEQsSUFBSSxDQUFDLE9BQU8sRUFBRTtZQUNaLE1BQU0sS0FBSyxHQUFHLHVEQUF1RCxPQUFPLEdBQUcsQ0FBQztZQUNoRixJQUFJLENBQUMsYUFBYSxDQUFDLFVBQVUsQ0FBQyxRQUFRLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFFL0MsT0FBTyxVQUFVLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztTQUMzQztRQUVELElBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRSwwQkFBMEIsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUUzRSxPQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFVLE9BQU8sRUFBRSxRQUFRLENBQUMsQ0FBQyxJQUFJLENBQzFELEtBQUssQ0FBQyxDQUFDLENBQUMsRUFDUixVQUFVLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FDL0QsQ0FBQztJQUNKLENBQUM7SUFFTyx5QkFBeUIsQ0FBQyxhQUFzQyxFQUFFLFFBQWdCO1FBQ3hGLElBQUksTUFBTSxHQUFHLEVBQUUsQ0FBQztRQUNoQixJQUFJLGFBQWEsWUFBWSxZQUFZLEVBQUU7WUFDekMsTUFBTSxJQUFJLEdBQUcsYUFBYSxDQUFDLElBQUksSUFBSSxFQUFFLENBQUM7WUFDdEMsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNqQyxNQUFNLEVBQUUsTUFBTSxFQUFFLFVBQVUsRUFBRSxHQUFHLGFBQWEsQ0FBQztZQUM3QyxNQUFNLEdBQUcsR0FBRyxNQUFNLElBQUksRUFBRSxNQUFNLFVBQVUsSUFBSSxFQUFFLElBQUksR0FBRyxJQUFJLEVBQUUsRUFBRSxDQUFDO1NBQy9EO2FBQU07WUFDTCxNQUFNLEVBQUUsT0FBTyxFQUFFLEdBQUcsYUFBYSxDQUFDO1lBQ2xDLE1BQU0sR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEdBQUcsYUFBYSxFQUFFLENBQUM7U0FDbkQ7UUFDRCxJQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxRQUFRLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFFOUMsT0FBTyxVQUFVLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztJQUM3QyxDQUFDOztpSEF2Q1Usb0JBQW9CO3FIQUFwQixvQkFBb0I7MkZBQXBCLG9CQUFvQjtrQkFEaEMsVUFBVSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEh0dHBSZXNwb25zZSB9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbi9odHRwJztcbmltcG9ydCB7IEluamVjdGFibGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IE9ic2VydmFibGUsIHRocm93RXJyb3IgfSBmcm9tICdyeGpzJztcbmltcG9ydCB7IGNhdGNoRXJyb3IsIHJldHJ5IH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuaW1wb3J0IHsgRGF0YVNlcnZpY2UgfSBmcm9tICcuLi9hcGkvZGF0YS5zZXJ2aWNlJztcbmltcG9ydCB7IExvZ2dlclNlcnZpY2UgfSBmcm9tICcuLi9sb2dnaW5nL2xvZ2dlci5zZXJ2aWNlJztcbmltcG9ydCB7IFN0b3JhZ2VQZXJzaXN0ZW5jZVNlcnZpY2UgfSBmcm9tICcuLi9zdG9yYWdlL3N0b3JhZ2UtcGVyc2lzdGVuY2Uuc2VydmljZSc7XG5pbXBvcnQgeyBKd3RLZXlzIH0gZnJvbSAnLi4vdmFsaWRhdGlvbi9qd3RrZXlzJztcblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIFNpZ25pbktleURhdGFTZXJ2aWNlIHtcbiAgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSBzdG9yYWdlUGVyc2lzdGVuY2VTZXJ2aWNlOiBTdG9yYWdlUGVyc2lzdGVuY2VTZXJ2aWNlLFxuICAgIHByaXZhdGUgbG9nZ2VyU2VydmljZTogTG9nZ2VyU2VydmljZSxcbiAgICBwcml2YXRlIGRhdGFTZXJ2aWNlOiBEYXRhU2VydmljZVxuICApIHt9XG5cbiAgZ2V0U2lnbmluZ0tleXMoY29uZmlnSWQ6IHN0cmluZyk6IE9ic2VydmFibGU8Snd0S2V5cz4ge1xuICAgIGNvbnN0IGF1dGhXZWxsS25vd25FbmRQb2ludHMgPSB0aGlzLnN0b3JhZ2VQZXJzaXN0ZW5jZVNlcnZpY2UucmVhZCgnYXV0aFdlbGxLbm93bkVuZFBvaW50cycsIGNvbmZpZ0lkKTtcbiAgICBjb25zdCBqd2tzVXJpID0gYXV0aFdlbGxLbm93bkVuZFBvaW50cz8uandrc1VyaTtcbiAgICBpZiAoIWp3a3NVcmkpIHtcbiAgICAgIGNvbnN0IGVycm9yID0gYGdldFNpZ25pbmdLZXlzOiBhdXRoV2VsbEtub3duRW5kcG9pbnRzLmp3a3NVcmkgaXM6ICcke2p3a3NVcml9J2A7XG4gICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nV2FybmluZyhjb25maWdJZCwgZXJyb3IpO1xuXG4gICAgICByZXR1cm4gdGhyb3dFcnJvcigoKSA9PiBuZXcgRXJyb3IoZXJyb3IpKTtcbiAgICB9XG5cbiAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoY29uZmlnSWQsICdHZXR0aW5nIHNpZ25pbmtleXMgZnJvbSAnLCBqd2tzVXJpKTtcblxuICAgIHJldHVybiB0aGlzLmRhdGFTZXJ2aWNlLmdldDxKd3RLZXlzPihqd2tzVXJpLCBjb25maWdJZCkucGlwZShcbiAgICAgIHJldHJ5KDIpLFxuICAgICAgY2F0Y2hFcnJvcigoZSkgPT4gdGhpcy5oYW5kbGVFcnJvckdldFNpZ25pbmdLZXlzKGUsIGNvbmZpZ0lkKSlcbiAgICApO1xuICB9XG5cbiAgcHJpdmF0ZSBoYW5kbGVFcnJvckdldFNpZ25pbmdLZXlzKGVycm9yUmVzcG9uc2U6IEh0dHBSZXNwb25zZTxhbnk+IHwgYW55LCBjb25maWdJZDogc3RyaW5nKTogT2JzZXJ2YWJsZTxuZXZlcj4ge1xuICAgIGxldCBlcnJNc2cgPSAnJztcbiAgICBpZiAoZXJyb3JSZXNwb25zZSBpbnN0YW5jZW9mIEh0dHBSZXNwb25zZSkge1xuICAgICAgY29uc3QgYm9keSA9IGVycm9yUmVzcG9uc2UuYm9keSB8fCB7fTtcbiAgICAgIGNvbnN0IGVyciA9IEpTT04uc3RyaW5naWZ5KGJvZHkpO1xuICAgICAgY29uc3QgeyBzdGF0dXMsIHN0YXR1c1RleHQgfSA9IGVycm9yUmVzcG9uc2U7XG4gICAgICBlcnJNc2cgPSBgJHtzdGF0dXMgfHwgJyd9IC0gJHtzdGF0dXNUZXh0IHx8ICcnfSAke2VyciB8fCAnJ31gO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCB7IG1lc3NhZ2UgfSA9IGVycm9yUmVzcG9uc2U7XG4gICAgICBlcnJNc2cgPSAhIW1lc3NhZ2UgPyBtZXNzYWdlIDogYCR7ZXJyb3JSZXNwb25zZX1gO1xuICAgIH1cbiAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRXJyb3IoY29uZmlnSWQsIGVyck1zZyk7XG5cbiAgICByZXR1cm4gdGhyb3dFcnJvcigoKSA9PiBuZXcgRXJyb3IoZXJyTXNnKSk7XG4gIH1cbn1cbiJdfQ==