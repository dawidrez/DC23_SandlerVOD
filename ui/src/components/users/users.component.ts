import { Component, ElementRef, Inject, OnDestroy, OnInit, SecurityContext, ViewChild } from '@angular/core';
import { ActivatedRoute, Params, Router, UrlSerializer } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AbstractControl, FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { Views } from 'src/enums/Views.enum';
import { filter } from 'rxjs/operators';
import { UserService } from 'src/services/user.service';
import { UserRole } from 'src/enums/UserRole.enum';
import { Clipboard } from '@angular/cdk/clipboard';
import { DOCUMENT, isPlatformBrowser, isPlatformServer } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { GalleryItemTypes } from 'ng-gallery';
import { Subscription } from 'rxjs';
import { PackagesService } from 'src/services/packages.service';
import { ScreenDetector, ScreenDetectorService } from 'src/services/screenDetector.service';
import { SubscriptionsService } from 'src/services/subscriptions.service';
import * as moment from 'moment';
import { UtilsService } from 'src/services/utils.service';

@Component({
    selector: 'app-users',
    templateUrl: './users.component.html',
    styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit, OnDestroy {
    users!: any[];

    filterForm: FormGroup = new FormGroup({
        searchPhrase: new FormControl(null),
        page: new FormControl(0),
    });
    subscriptions: Subscription[] = [];
    screenDetectorObject: ScreenDetector;

    validators = Validators;
    loading = false;

    constructor(
        @Inject(PLATFORM_ID) private platformId: Object,
        @Inject(DOCUMENT) public document: Document,
        private route: ActivatedRoute,
        public authService: AuthService,
        public userService: UserService,
        private translate: TranslateService,
        private router: Router,
        private clipboard: Clipboard,
        private sanitizer: DomSanitizer,
        private urlSerializer: UrlSerializer,
        private packagesService: PackagesService,
        private screenDetectorService: ScreenDetectorService,
        private subscriptionsService: SubscriptionsService,
        private utilsService: UtilsService,) {
        this.screenDetectorObject = this.screenDetectorService.getScreenDetectorObject();
    }
    ngOnDestroy(): void {
        this.subscriptions.forEach(s => s.unsubscribe());
    }

    ngOnInit() {
        if (isPlatformBrowser(this.platformId)) {
            this.getAllData();
        }
    }

    getAllData() {
        this.getAllUsers();
    }

    getAllUsers() {
        this.userService.getAll().subscribe(
            (users: any) => {
                this.users = users || [];
                this.loading = false;
            },
            (error: any) => {
                console.log(error);
                this.loading = false;
            }
        );
    }

    getEventValue(event: any) {
        return event.target.value;
    }

    onPageEvent(event: any) {
        this.filterForm.controls['page']?.setValue(event.first / event.rows);
        this.setParams(this.filterForm.value);
    }

    copyPackageLink(packageId: any) {
        if (isPlatformBrowser(this.platformId)) {
            const urlTree = this.router.parseUrl('/packages/preview');
            urlTree.queryParams = {};
            const cleanUrl = this.urlSerializer.serialize(urlTree);
            console.log(window.location.origin, cleanUrl);
            const carLink = `${window.location.origin}${cleanUrl}/${packageId}`;
            this.clipboard.copy(carLink);
        }
    }

    setParams(params: any = {}) {
        const paramsToSave = { ...params };
        this.deleteEmptyOrNullProperties(paramsToSave);
        this.router.navigate([], {
            queryParams: {
                ...paramsToSave,
            },
        });
    }

    deleteEmptyOrNullProperties(obj: { [key: string]: any }): void {
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                const value = obj[key];
                if (value === null || value === undefined || value === '') {
                    delete obj[key];
                }
            }
        }
    }
    openUserPreview(event: any) {
        console.log(event.data);
        this.router.navigate([Views.USERS, event.data.id]);
    }
}
