import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Observable, map, of, tap } from 'rxjs';
import { DataSourceService } from './dataSource.service';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';

@Injectable({
    providedIn: 'root',
})
export class AuthService {

    private readonly baseUrl = "/api/clients";
    private readonly localStorageUser = "AUTH_USER";
    private isAdminUser = false;
    private isAdminRequest: Observable<boolean> | undefined;
    // private readonly localStorageUsers = "USERS";

    constructor(private dataSourceService: DataSourceService, private http: HttpClient,
        @Inject(PLATFORM_ID) private platformId: Object,) { }

    login(params: any): Observable<any> {
        this.saveUser(params.email);
        console.log('login true');
        this.getIfUserIsAdmin(true).subscribe();
        return of(this.getAuthenticatedUserData());
    }

    register(params: any): Observable<any> {
        console.log('register data: ', params);
        // isAdmin
        return this.dataSourceService.post(`${this.baseUrl}/`, params).pipe(
            tap((response: any) => {
                if (response) {
                    this.saveUser(params.email);
                    this.getIfUserIsAdmin(true).subscribe();
                }
            }));
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
                this.getIfUserIsAdmin().subscribe();
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

    getIfUserIsAdmin(forceRestRequest: boolean = false) {
        if (!this.isAdminRequest || forceRestRequest) {
            this.isAdminRequest = this.dataSourceService.getWithUserEmailInHeaderParam(`${this.baseUrl}/is_admin`).pipe(
                tap((response: any) => {
                    this.isAdminUser = !!response?.is_admin;
                }),
                map((data: any) => {
                    return !!data?.is_admin;
                }));
        }
        return this.isAdminRequest;
    }

    isAdmin(): boolean {
        return this.isAdminUser;
    }

    clean(): void {
        if (isPlatformBrowser(this.platformId)) {
            window.localStorage.clear();
        }
    }

}