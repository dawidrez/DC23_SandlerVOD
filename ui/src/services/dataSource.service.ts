import { Inject, Injectable, PLATFORM_ID } from "@angular/core";
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "./../environments/environment";
import { isPlatformBrowser, isPlatformServer } from "@angular/common";
import { AuthService } from "./auth.service";
@Injectable({
    providedIn: "root",
})
export class DataSourceService {
    hostUrl = "";
    private readonly localStorageUser = "AUTH_USER";
    constructor(private http: HttpClient, @Inject(PLATFORM_ID) private platformId: Object) {
        if (isPlatformBrowser(this.platformId)) {
            this.hostUrl = '';
        } else if (isPlatformServer(this.platformId)) {
            // For server, specify the complete URL
            this.hostUrl = process.env["SSR_API_URL"] || 'http://localhost:8080';
        }
        // this.hostUrl = environment.apiUrl;
    }

    // Get
    get(restMapping: string, data = {}): Observable<object> {
        return this.http.get(`${this.hostUrl}${restMapping}`, { params: data });
    }

    getWithUserEmailInHeaderParam(restMapping: string, email: string | undefined = undefined): Observable<object> {
        let userEmail = '';
        if (!email) {
            userEmail = window.localStorage.getItem(this.localStorageUser) || '';
        }
        const headers = new HttpHeaders().set('X-EMAIL', email ? email : JSON.parse(userEmail));
        return this.http.get(`${this.hostUrl}${restMapping}`, {
            headers: headers,
            responseType: "json",
        });
    }

    // Create
    post(restMapping: string, data: any, httpParam?: boolean): Observable<any> {
        const requestParams = this.prepareRequestParams(data, httpParam);

        return this.http.post(`${this.hostUrl}${restMapping}`, requestParams.dataPost, {
            headers: requestParams.headerOptions,
            responseType: "json",
        });
    }

    postWithUserEmailInHeaderParam(restMapping: string, data: any): Observable<any> {
        // const requestParams = this.prepareRequestParams(data, httpParam);
        const userEmail = window.localStorage.getItem(this.localStorageUser) || '';
        const headers = new HttpHeaders().set('X-EMAIL', JSON.parse(userEmail));
        return this.http.post(`${this.hostUrl}${restMapping}`, data, {
            headers: headers,
            responseType: "json",
        });
    }

    patchWithUserEmailInHeaderParam(restMapping: string, data: any): Observable<any> {
        // const requestParams = this.prepareRequestParams(data, httpParam);
        const userEmail = window.localStorage.getItem(this.localStorageUser) || '';
        const headers = new HttpHeaders().set('X-EMAIL', JSON.parse(userEmail));
        return this.http.patch(`${this.hostUrl}${restMapping}`, data, {
            headers: headers,
            responseType: "json",
        });
    }

    // Update
    put(restMapping: string, data: any = {}, httpParam?: boolean): Observable<any> {
        const requestParams = this.prepareRequestParams(data, httpParam);

        return this.http.put(`${this.hostUrl}${restMapping}`, requestParams.dataPost, {
            headers: requestParams.headerOptions,
            responseType: "json",
        });
    }

    // Delete
    delete(restMapping: string): Observable<object> {
        return this.http.delete(`${this.hostUrl}${restMapping}`);
    }

    // Get File
    getFile(restMapping: string, data = {}): Observable<object> {
        return this.http.post(`${this.hostUrl}${restMapping}`, data, {
            responseType: "blob" as "json"
        });
    }

    // Create File
    postFile(restMapping: string, file: FormData, data: any = {}): Observable<string> {
        return this.http.post(`${this.hostUrl}${restMapping}`, file, {
            params: data,
            responseType: "text",
        });
    }

    updateParams(restMapping: string, data: any = {}): Observable<string> {
        const requestParams = this.prepareRequestParams(data, true);
        return this.http.put(`${this.hostUrl}${restMapping}`, requestParams.dataPost, {
            params: data,
            responseType: "text",
        });
    }

    private prepareRequestParams(data: any, httpParam?: boolean) {
        let headerOptions = {};
        let dataPost = new HttpParams();

        if (httpParam !== undefined) {
            headerOptions = { "Content-Type": "application/x-www-form-urlencoded" };
            // headerOptions = { "X-EMAIL": "application/x-www-form-urlencoded" }
            Object.keys(data).forEach((key) => {
                dataPost = dataPost.append(key, data[key]);
            });
        } else {
            headerOptions = {};
            dataPost = data;
        }

        return { headerOptions, dataPost };
    }
}
