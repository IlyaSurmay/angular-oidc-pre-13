import { Injectable } from '@angular/core';
import { hextob64u, KJUR } from 'jsrsasign-reduced';
import * as i0 from "@angular/core";
export class JsrsAsignReducedService {
    generateCodeChallenge(codeVerifier) {
        const hash = KJUR.crypto.Util.hashString(codeVerifier, 'sha256');
        const testData = hextob64u(hash);
        return testData;
    }
    generateAtHash(accessToken, sha) {
        const hash = KJUR.crypto.Util.hashString(accessToken, sha);
        const first128bits = hash.substr(0, hash.length / 2);
        const testData = hextob64u(first128bits);
        return testData;
    }
}
JsrsAsignReducedService.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: JsrsAsignReducedService, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
JsrsAsignReducedService.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: JsrsAsignReducedService });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: JsrsAsignReducedService, decorators: [{
            type: Injectable
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoianNyc2FzaWduLXJlZHVjZWQuc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL2FuZ3VsYXItYXV0aC1vaWRjLWNsaWVudC9zcmMvbGliL3ZhbGlkYXRpb24vanNyc2FzaWduLXJlZHVjZWQuc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQzNDLE9BQU8sRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLE1BQU0sbUJBQW1CLENBQUM7O0FBR3BELE1BQU0sT0FBTyx1QkFBdUI7SUFDbEMscUJBQXFCLENBQUMsWUFBaUI7UUFDckMsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLFlBQVksRUFBRSxRQUFRLENBQUMsQ0FBQztRQUNqRSxNQUFNLFFBQVEsR0FBRyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7UUFFakMsT0FBTyxRQUFRLENBQUM7SUFDbEIsQ0FBQztJQUVELGNBQWMsQ0FBQyxXQUFnQixFQUFFLEdBQVc7UUFDMUMsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLFdBQVcsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUMzRCxNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQ3JELE1BQU0sUUFBUSxHQUFHLFNBQVMsQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUV6QyxPQUFPLFFBQVEsQ0FBQztJQUNsQixDQUFDOztvSEFkVSx1QkFBdUI7d0hBQXZCLHVCQUF1QjsyRkFBdkIsdUJBQXVCO2tCQURuQyxVQUFVIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSW5qZWN0YWJsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgaGV4dG9iNjR1LCBLSlVSIH0gZnJvbSAnanNyc2FzaWduLXJlZHVjZWQnO1xuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgSnNyc0FzaWduUmVkdWNlZFNlcnZpY2Uge1xuICBnZW5lcmF0ZUNvZGVDaGFsbGVuZ2UoY29kZVZlcmlmaWVyOiBhbnkpOiBzdHJpbmcge1xuICAgIGNvbnN0IGhhc2ggPSBLSlVSLmNyeXB0by5VdGlsLmhhc2hTdHJpbmcoY29kZVZlcmlmaWVyLCAnc2hhMjU2Jyk7XG4gICAgY29uc3QgdGVzdERhdGEgPSBoZXh0b2I2NHUoaGFzaCk7XG5cbiAgICByZXR1cm4gdGVzdERhdGE7XG4gIH1cblxuICBnZW5lcmF0ZUF0SGFzaChhY2Nlc3NUb2tlbjogYW55LCBzaGE6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgY29uc3QgaGFzaCA9IEtKVVIuY3J5cHRvLlV0aWwuaGFzaFN0cmluZyhhY2Nlc3NUb2tlbiwgc2hhKTtcbiAgICBjb25zdCBmaXJzdDEyOGJpdHMgPSBoYXNoLnN1YnN0cigwLCBoYXNoLmxlbmd0aCAvIDIpO1xuICAgIGNvbnN0IHRlc3REYXRhID0gaGV4dG9iNjR1KGZpcnN0MTI4Yml0cyk7XG5cbiAgICByZXR1cm4gdGVzdERhdGE7XG4gIH1cbn1cbiJdfQ==