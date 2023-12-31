import { HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as i0 from "@angular/core";
import * as i1 from "./http-base.service";
import * as i2 from "../config/provider/config.provider";
const NGSW_CUSTOM_PARAM = 'ngsw-bypass';
export class DataService {
    constructor(httpClient, configurationProvider) {
        this.httpClient = httpClient;
        this.configurationProvider = configurationProvider;
    }
    get(url, configId, token) {
        const headers = this.prepareHeaders(token);
        const params = this.prepareParams(configId);
        return this.httpClient.get(url, {
            headers,
            params,
        });
    }
    post(url, body, configId, headersParams) {
        const headers = headersParams || this.prepareHeaders();
        const params = this.prepareParams(configId);
        return this.httpClient.post(url, body, { headers, params });
    }
    prepareHeaders(token) {
        let headers = new HttpHeaders();
        headers = headers.set('Accept', 'application/json');
        if (!!token) {
            headers = headers.set('Authorization', 'Bearer ' + decodeURIComponent(token));
        }
        return headers;
    }
    prepareParams(configId) {
        let params = new HttpParams();
        const { ngswBypass } = this.configurationProvider.getOpenIDConfiguration(configId);
        if (ngswBypass) {
            params = params.set(NGSW_CUSTOM_PARAM, '');
        }
        return params;
    }
}
DataService.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: DataService, deps: [{ token: i1.HttpBaseService }, { token: i2.ConfigurationProvider }], target: i0.ɵɵFactoryTarget.Injectable });
DataService.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: DataService });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: DataService, decorators: [{
            type: Injectable
        }], ctorParameters: function () { return [{ type: i1.HttpBaseService }, { type: i2.ConfigurationProvider }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0YS5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvYW5ndWxhci1hdXRoLW9pZGMtY2xpZW50L3NyYy9saWIvYXBpL2RhdGEuc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsV0FBVyxFQUFFLFVBQVUsRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBQy9ELE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7Ozs7QUFLM0MsTUFBTSxpQkFBaUIsR0FBRyxhQUFhLENBQUM7QUFHeEMsTUFBTSxPQUFPLFdBQVc7SUFDdEIsWUFBb0IsVUFBMkIsRUFBbUIscUJBQTRDO1FBQTFGLGVBQVUsR0FBVixVQUFVLENBQWlCO1FBQW1CLDBCQUFxQixHQUFyQixxQkFBcUIsQ0FBdUI7SUFBRyxDQUFDO0lBRWxILEdBQUcsQ0FBSSxHQUFXLEVBQUUsUUFBZ0IsRUFBRSxLQUFjO1FBQ2xELE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDM0MsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUU1QyxPQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFJLEdBQUcsRUFBRTtZQUNqQyxPQUFPO1lBQ1AsTUFBTTtTQUNQLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFRCxJQUFJLENBQUksR0FBVyxFQUFFLElBQVMsRUFBRSxRQUFnQixFQUFFLGFBQTJCO1FBQzNFLE1BQU0sT0FBTyxHQUFHLGFBQWEsSUFBSSxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7UUFDdkQsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUU1QyxPQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFJLEdBQUcsRUFBRSxJQUFJLEVBQUUsRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLENBQUMsQ0FBQztJQUNqRSxDQUFDO0lBRU8sY0FBYyxDQUFDLEtBQWM7UUFDbkMsSUFBSSxPQUFPLEdBQUcsSUFBSSxXQUFXLEVBQUUsQ0FBQztRQUNoQyxPQUFPLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsa0JBQWtCLENBQUMsQ0FBQztRQUVwRCxJQUFJLENBQUMsQ0FBQyxLQUFLLEVBQUU7WUFDWCxPQUFPLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxlQUFlLEVBQUUsU0FBUyxHQUFHLGtCQUFrQixDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7U0FDL0U7UUFFRCxPQUFPLE9BQU8sQ0FBQztJQUNqQixDQUFDO0lBRU8sYUFBYSxDQUFDLFFBQWdCO1FBQ3BDLElBQUksTUFBTSxHQUFHLElBQUksVUFBVSxFQUFFLENBQUM7UUFDOUIsTUFBTSxFQUFFLFVBQVUsRUFBRSxHQUFHLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxzQkFBc0IsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUVuRixJQUFJLFVBQVUsRUFBRTtZQUNkLE1BQU0sR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLGlCQUFpQixFQUFFLEVBQUUsQ0FBQyxDQUFDO1NBQzVDO1FBRUQsT0FBTyxNQUFNLENBQUM7SUFDaEIsQ0FBQzs7d0dBeENVLFdBQVc7NEdBQVgsV0FBVzsyRkFBWCxXQUFXO2tCQUR2QixVQUFVIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSHR0cEhlYWRlcnMsIEh0dHBQYXJhbXMgfSBmcm9tICdAYW5ndWxhci9jb21tb24vaHR0cCc7XG5pbXBvcnQgeyBJbmplY3RhYmxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBPYnNlcnZhYmxlIH0gZnJvbSAncnhqcyc7XG5pbXBvcnQgeyBDb25maWd1cmF0aW9uUHJvdmlkZXIgfSBmcm9tICcuLi9jb25maWcvcHJvdmlkZXIvY29uZmlnLnByb3ZpZGVyJztcbmltcG9ydCB7IEh0dHBCYXNlU2VydmljZSB9IGZyb20gJy4vaHR0cC1iYXNlLnNlcnZpY2UnO1xuXG5jb25zdCBOR1NXX0NVU1RPTV9QQVJBTSA9ICduZ3N3LWJ5cGFzcyc7XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBEYXRhU2VydmljZSB7XG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgaHR0cENsaWVudDogSHR0cEJhc2VTZXJ2aWNlLCBwcml2YXRlIHJlYWRvbmx5IGNvbmZpZ3VyYXRpb25Qcm92aWRlcjogQ29uZmlndXJhdGlvblByb3ZpZGVyKSB7fVxuXG4gIGdldDxUPih1cmw6IHN0cmluZywgY29uZmlnSWQ6IHN0cmluZywgdG9rZW4/OiBzdHJpbmcpOiBPYnNlcnZhYmxlPFQ+IHtcbiAgICBjb25zdCBoZWFkZXJzID0gdGhpcy5wcmVwYXJlSGVhZGVycyh0b2tlbik7XG4gICAgY29uc3QgcGFyYW1zID0gdGhpcy5wcmVwYXJlUGFyYW1zKGNvbmZpZ0lkKTtcblxuICAgIHJldHVybiB0aGlzLmh0dHBDbGllbnQuZ2V0PFQ+KHVybCwge1xuICAgICAgaGVhZGVycyxcbiAgICAgIHBhcmFtcyxcbiAgICB9KTtcbiAgfVxuXG4gIHBvc3Q8VD4odXJsOiBzdHJpbmcsIGJvZHk6IGFueSwgY29uZmlnSWQ6IHN0cmluZywgaGVhZGVyc1BhcmFtcz86IEh0dHBIZWFkZXJzKTogT2JzZXJ2YWJsZTxUPiB7XG4gICAgY29uc3QgaGVhZGVycyA9IGhlYWRlcnNQYXJhbXMgfHwgdGhpcy5wcmVwYXJlSGVhZGVycygpO1xuICAgIGNvbnN0IHBhcmFtcyA9IHRoaXMucHJlcGFyZVBhcmFtcyhjb25maWdJZCk7XG5cbiAgICByZXR1cm4gdGhpcy5odHRwQ2xpZW50LnBvc3Q8VD4odXJsLCBib2R5LCB7IGhlYWRlcnMsIHBhcmFtcyB9KTtcbiAgfVxuXG4gIHByaXZhdGUgcHJlcGFyZUhlYWRlcnModG9rZW4/OiBzdHJpbmcpOiBIdHRwSGVhZGVycyB7XG4gICAgbGV0IGhlYWRlcnMgPSBuZXcgSHR0cEhlYWRlcnMoKTtcbiAgICBoZWFkZXJzID0gaGVhZGVycy5zZXQoJ0FjY2VwdCcsICdhcHBsaWNhdGlvbi9qc29uJyk7XG5cbiAgICBpZiAoISF0b2tlbikge1xuICAgICAgaGVhZGVycyA9IGhlYWRlcnMuc2V0KCdBdXRob3JpemF0aW9uJywgJ0JlYXJlciAnICsgZGVjb2RlVVJJQ29tcG9uZW50KHRva2VuKSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGhlYWRlcnM7XG4gIH1cblxuICBwcml2YXRlIHByZXBhcmVQYXJhbXMoY29uZmlnSWQ6IHN0cmluZyk6IEh0dHBQYXJhbXMge1xuICAgIGxldCBwYXJhbXMgPSBuZXcgSHR0cFBhcmFtcygpO1xuICAgIGNvbnN0IHsgbmdzd0J5cGFzcyB9ID0gdGhpcy5jb25maWd1cmF0aW9uUHJvdmlkZXIuZ2V0T3BlbklEQ29uZmlndXJhdGlvbihjb25maWdJZCk7XG5cbiAgICBpZiAobmdzd0J5cGFzcykge1xuICAgICAgcGFyYW1zID0gcGFyYW1zLnNldChOR1NXX0NVU1RPTV9QQVJBTSwgJycpO1xuICAgIH1cblxuICAgIHJldHVybiBwYXJhbXM7XG4gIH1cbn1cbiJdfQ==