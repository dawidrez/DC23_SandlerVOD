import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable, filter, take, map, tap } from 'rxjs';
import { UserRole } from 'src/enums/UserRole.enum';
import { UserService } from 'src/services/user.service';
import { AuthService } from './auth.service';
import { Location } from '@angular/common'
import { Views } from 'src/enums/Views.enum';

@Injectable({
    providedIn: 'root',
})
export class RouteGuard {
    constructor(private userService: UserService, private router: Router, private authService: AuthService, private location: Location) { }

    canActivate(route: ActivatedRouteSnapshot): boolean | Observable<boolean> {
        if (!route.data['role']) {
            return true;
        }
        const requiredRole = route.data['role'] as UserRole;
        if (requiredRole === UserRole.ADMIN) {
            return this.authService.getIfUserIsAdmin().pipe(tap((is_admin: any) => {
                console.log('is_admin: ', is_admin);
                if (!is_admin) {
                    this.router.navigate(['/' + Views.PACKAGES]);
                }
            }));
        }
        return true;

        // return this.userService.isInitialized$.pipe(
        //     filter(isInitialized => isInitialized === true), // Wait for the service to be initialized
        //     take(1), // Take the first value that matches the filter
        //     map(() => {
        //         const requiredRole = route.data['role'] as UserRole;
        //         if (requiredRole === UserRole.ADMIN && !this.authService.isAdmin()) {
        //             if (this.authService.isAdmin()) {
        //                 return true;
        //             } else {
        //                 this.location.back();
        //                 return false;
        //             }
        //         }
        //         return this.authService.getIfUserIsAdmin();
        //     })
        // );
    }
}