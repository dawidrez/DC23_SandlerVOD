import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { AuthService } from './auth.service';
import { UserService } from './user.service';
import { of, Observable, forkJoin } from 'rxjs';
import { tap } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
    providedIn: 'root',
})
export class AppInitService {
    constructor(
        @Inject(PLATFORM_ID) private platformId: Object,
        private authService: AuthService,
        private userService: UserService
    ) { }

    init(): Observable<any[]> {
        if (isPlatformBrowser(this.platformId)) {
            const observables: Observable<any>[] = [
                this.initCurrentUser(),
                // Other initialization observables here
            ];

            return forkJoin(observables);
        }
        else {
            return of();
        }
    }

    initCurrentUser() {
        if (this.authService.isLoggedIn()) {
            const user = this.authService.getAuthenticatedUserData();
            this.userService.setCurrentUser(user);
            return of(user);
        } else {
            return of(null);
        }
    }
}