import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { UserRole } from 'src/enums/UserRole.enum';

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private currentUser: any;
    private isInitialized = new BehaviorSubject<boolean>(false);
    public isInitialized$ = this.isInitialized.asObservable();

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
}