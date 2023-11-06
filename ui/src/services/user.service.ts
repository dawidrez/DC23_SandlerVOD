import { Injectable } from '@angular/core';
import { BehaviorSubject, of, tap } from 'rxjs';
import { UserRole } from 'src/enums/UserRole.enum';
import { DataSourceService } from './dataSource.service';

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private readonly baseUrl = "/api/clients";
    private currentUser: any;
    private isInitialized = new BehaviorSubject<boolean>(false);
    public isInitialized$ = this.isInitialized.asObservable();
    private users: any;
    constructor(private dataSourceService: DataSourceService) { }

    setCurrentUser(user: any) {
        this.currentUser = user;
        this.isInitialized.next(true);
    }

    getCurrentUser() {
        return this.currentUser;
    }

    hasRole(role: UserRole) {
        return this.currentUser && this.currentUser['role'] === role;
    }

    getAll() {
        if (this.users?.length) {
            return of(this.users);
        }
        else {
            return this.dataSourceService.getWithUserEmailInHeaderParam(`${this.baseUrl}`).pipe(
                tap((response: any) => {
                    console.log('response: ', response);
                    this.users = response;
                })
            );
        }
    }

    updateUser(userId: string, params: any) {
        return this.dataSourceService.patchWithUserEmailInHeaderParam(`${this.baseUrl}/${userId}/`, params);
    }

}