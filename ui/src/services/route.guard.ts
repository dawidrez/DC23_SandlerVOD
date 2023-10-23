import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable, filter, take, map } from 'rxjs';
import { UserRole } from 'src/enums/UserRole.enum';
import { UserService } from 'src/services/user.service';

@Injectable({
    providedIn: 'root',
})
export class RouteGuard {
    constructor(private userService: UserService, private router: Router) { }

    canActivate(route: ActivatedRouteSnapshot): boolean | Observable<boolean> {
        if (!route.data['role']) {
            return true;
        }

        return this.userService.isInitialized$.pipe(
            filter(isInitialized => isInitialized === true), // Wait for the service to be initialized
            take(1), // Take the first value that matches the filter
            map(() => {
                const requiredRole = route.data['role'] as UserRole;

                if (this.userService.hasRole(requiredRole)) {
                    return true;
                } else {
                    this.router.navigate(['/cars']);
                    return false;
                }
            })
        );
    }
}