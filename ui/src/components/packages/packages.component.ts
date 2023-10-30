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
    selector: 'app-packages',
    templateUrl: './packages.component.html',
    styleUrls: ['./packages.component.scss']
})
export class PackagesComponent implements OnInit, OnDestroy {
    @ViewChild('packagesContainer') packagesContainer!: any;
    showUserPackages: string | undefined = this.route.snapshot.paramMap.get('userPackages') || undefined;
    sortOrder!: number;
    sortField!: string;
    // sortOptions: any[];
    packages!: any[];
    userPackages: any;
    filteredPackages!: any[];
    layout: "list" | "grid" = 'grid';

    // carsLine = [
    //     { name: 'H-Line', value: 1 },
    //     { name: 'P-Line', value: 2 },
    //     { name: 'D-Line', value: 3 },
    // ];

    filterForm: FormGroup = new FormGroup({
        searchPhrase: new FormControl(null),
        page: new FormControl(0),
    });
    subscriptions: Subscription[] = [];
    pageChanged: boolean | undefined = undefined;
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
        console.log("userPackages: ", this.showUserPackages);
        if (isPlatformBrowser(this.platformId)) {
            this.getAllUserSubscriptions();
        }
    }

    // consoleLog(data: any) {
    //     console.log(data);
    // }

    getAllPackages() {
        this.packagesService.getAll().subscribe((packages: any) => {
            console.log(packages);
            this.packages = packages;
            if (!this.showUserPackages) {
                this.filteredPackages = [...this.packages];
            }
            else {
                this.filteredPackages = this.packages.filter(packageItem => {
                    return this.userPackages.some((userPackage: any) => userPackage.package === packageItem.id);
                });
            }

            console.log(this.filteredPackages);
        });
    }


    getAllUserSubscriptions() {
        this.subscriptionsService.getAllUserPackages().subscribe(
            (userPackages: any) => {
                this.userPackages = userPackages.map((subscription: any) => {
                    subscription.start_date = moment(subscription.start_date, this.utilsService.BACKEND_DATE_FORMAT).toDate();
                    subscription.end_date = moment(subscription.end_date, this.utilsService.BACKEND_DATE_FORMAT).toDate();
                    return subscription;
                });
                this.getAllPackages();
            },
            (error: any) => {
                console.log(error);
            }
        );
    }

    getSubscriptionIfPackageAlreadyUserPackage(packageId: any) {
        return Array.isArray(this.userPackages) && this.userPackages.find((userPackage: any) => userPackage.package === Number(packageId));
    }

    onPageEvent(event: any) {
        this.filterForm.controls['page']?.setValue(event.first / event.rows);
        this.pageChanged = true;
        this.setParams(this.filterForm.value);
        const elementPosition = this.packagesContainer.nativeElement.offsetTop;
        window.scrollTo({
            top: elementPosition - 100,
        });
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
}
