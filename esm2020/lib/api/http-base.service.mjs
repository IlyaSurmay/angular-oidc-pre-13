import { Injectable } from '@angular/core';
import * as i0 from "@angular/core";
import * as i1 from "@angular/common/http";
export class HttpBaseService {
    constructor(http) {
        this.http = http;
    }
    get(url, params) {
        return this.http.get(url, params);
    }
    post(url, body, params) {
        return this.http.post(url, body, params);
    }
}
HttpBaseService.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: HttpBaseService, deps: [{ token: i1.HttpClient }], target: i0.ɵɵFactoryTarget.Injectable });
HttpBaseService.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: HttpBaseService });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: HttpBaseService, decorators: [{
            type: Injectable
        }], ctorParameters: function () { return [{ type: i1.HttpClient }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaHR0cC1iYXNlLnNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy9hbmd1bGFyLWF1dGgtb2lkYy1jbGllbnQvc3JjL2xpYi9hcGkvaHR0cC1iYXNlLnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGVBQWUsQ0FBQzs7O0FBSTNDLE1BQU0sT0FBTyxlQUFlO0lBQzFCLFlBQW9CLElBQWdCO1FBQWhCLFNBQUksR0FBSixJQUFJLENBQVk7SUFBRyxDQUFDO0lBRXhDLEdBQUcsQ0FBSSxHQUFXLEVBQUUsTUFBK0I7UUFDakQsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBSSxHQUFHLEVBQUUsTUFBTSxDQUFDLENBQUM7SUFDdkMsQ0FBQztJQUVELElBQUksQ0FBSSxHQUFXLEVBQUUsSUFBUyxFQUFFLE1BQStCO1FBQzdELE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUksR0FBRyxFQUFFLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQztJQUM5QyxDQUFDOzs0R0FUVSxlQUFlO2dIQUFmLGVBQWU7MkZBQWYsZUFBZTtrQkFEM0IsVUFBVSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEh0dHBDbGllbnQgfSBmcm9tICdAYW5ndWxhci9jb21tb24vaHR0cCc7XG5pbXBvcnQgeyBJbmplY3RhYmxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBPYnNlcnZhYmxlIH0gZnJvbSAncnhqcyc7XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBIdHRwQmFzZVNlcnZpY2Uge1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGh0dHA6IEh0dHBDbGllbnQpIHt9XG5cbiAgZ2V0PFQ+KHVybDogc3RyaW5nLCBwYXJhbXM/OiB7IFtrZXk6IHN0cmluZ106IGFueSB9KTogT2JzZXJ2YWJsZTxUPiB7XG4gICAgcmV0dXJuIHRoaXMuaHR0cC5nZXQ8VD4odXJsLCBwYXJhbXMpO1xuICB9XG5cbiAgcG9zdDxUPih1cmw6IHN0cmluZywgYm9keTogYW55LCBwYXJhbXM/OiB7IFtrZXk6IHN0cmluZ106IGFueSB9KTogT2JzZXJ2YWJsZTxUPiB7XG4gICAgcmV0dXJuIHRoaXMuaHR0cC5wb3N0PFQ+KHVybCwgYm9keSwgcGFyYW1zKTtcbiAgfVxufVxuIl19