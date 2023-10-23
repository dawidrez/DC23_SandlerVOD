import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { PrimeNGConfig } from 'primeng/api';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/services/auth.service';
import { EventBusService } from 'src/services/eventBus.service';
import { UserService } from '../services/user.service';
import { Router } from '@angular/router';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
    eventBusSub?: Subscription;

    constructor(
        @Inject(PLATFORM_ID) private platformId: Object,
        private translateService: TranslateService,
        private config: PrimeNGConfig,
        private authService: AuthService,
        private userService: UserService,
        private eventBusService: EventBusService,
        private router: Router) {
        if (isPlatformBrowser(this.platformId)) {
            translateService.setDefaultLang('en');
            translateService.use('en');
            translateService.get('primeng').subscribe(res => this.config.setTranslation(res));
        }
    }

    ngOnInit(): void {
        this.eventBusSub = this.eventBusService.on('logout', () => {
            console.log('logout')
            this.logout();
        });
    }

    logout(): void {
        this.authService.clean();
        this.router.navigate(['/login']);
    }

    translate(lang: string) {
        this.translateService.use(lang);
        this.translateService.get('primeng').subscribe(res => this.config.setTranslation(res));
    }
}
