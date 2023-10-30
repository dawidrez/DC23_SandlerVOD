import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Observable, of } from 'rxjs';
import { DataSourceService } from './dataSource.service';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';

@Injectable({
    providedIn: 'root',
})
export class AuthService {

    private readonly baseUrl = "/api/clients/";
    private readonly localStorageUser = "AUTH_USER";
    // private readonly localStorageUsers = "USERS";

    constructor(private dataSourceService: DataSourceService, private http: HttpClient,
        @Inject(PLATFORM_ID) private platformId: Object,) { }

    login(params: any): Observable<any> {
        //only email
        // const data = window.localStorage.getItem(this.localStorageUser);
        this.saveUser(params.email);
        // const user = JSON.parse(data);
        // if (!user) {
        //     this.saveUser(params.email);
        // }

        console.log('login true');
        // return this.dataSourceService.post(`${this.baseUrl}`, params);
        return of(this.getAuthenticatedUserData());
    }

    register(params: any): Observable<any> {
        // const data = window.localStorage.getItem(this.localStorageUsers);
        console.log('register data: ', params);
        // if (data && Array.isArray(JSON.parse(data))) {
        //     const users = JSON.parse(data);
        //     return this.addNewUser(users, params);
        // }
        // else {
        //     const users = [params];
        //     return this.addNewUser(users, params, true);
        // }
        return this.dataSourceService.post(`${this.baseUrl}`, params);
    }

    // addNewUser(users: any, params: any, forceAdd = false) {
    //     if (forceAdd || !users.find((user: any) => user.email === params.email)) {
    //         if (!forceAdd) {
    //             users.push(params);
    //         }
    //         window.localStorage.setItem(this.localStorageUsers, JSON.stringify(users));
    //         return of(params);
    //     }
    //     else {
    //         return of(null);
    //     }
    // }

    saveUser(userEmail: any): void {
        if (isPlatformBrowser(this.platformId)) {
            window.localStorage.removeItem(this.localStorageUser);
            window.localStorage.setItem(this.localStorageUser, JSON.stringify(userEmail));
        }
    }

    getAuthenticatedUserData(): any {
        if (isPlatformBrowser(this.platformId)) {
            const user = window.localStorage.getItem(this.localStorageUser);
            if (user) {
                return JSON.parse(user);
            }
        }
        return {};
    }

    isLoggedIn(): boolean {
        if (isPlatformBrowser(this.platformId)) {
            const user = window.localStorage.getItem(this.localStorageUser);
            if (user) {
                return true;
            }
        }
        return false;
    }

    clean(): void {
        if (isPlatformBrowser(this.platformId)) {
            window.localStorage.clear();
        }
    }

}