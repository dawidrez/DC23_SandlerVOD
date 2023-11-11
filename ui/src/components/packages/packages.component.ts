import { AfterViewInit, Component, ElementRef, Inject, OnDestroy, OnInit, Renderer2, SecurityContext, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, UrlSerializer } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { Views } from 'src/enums/Views.enum';
import { UserService } from 'src/services/user.service';
import { Clipboard } from '@angular/cdk/clipboard';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import { PackagesService } from 'src/services/packages.service';
import { ScreenDetector, ScreenDetectorService } from 'src/services/screenDetector.service';
import { SubscriptionsService } from 'src/services/subscriptions.service';
import * as moment from 'moment';
import { UtilsService } from 'src/services/utils.service';
import { Location } from '@angular/common';

@Component({
    selector: 'app-packages',
    templateUrl: './packages.component.html',
    styleUrls: ['./packages.component.scss']
})
export class PackagesComponent implements OnInit, OnDestroy, AfterViewInit {
    @ViewChild('packagesContainer') packagesContainer!: any;
    showUserPackages: string | undefined = this.route.snapshot.paramMap.get('userPackages') || undefined;
    userId: string | undefined = this.route.snapshot.paramMap.get('userId') || undefined;
    sortOrder!: number;
    sortField!: string;
    // sortOptions: any[];
    packages!: any[];
    userSubscriptions: any;
    filteredPackages!: any[];
    layout: "list" | "grid" = 'grid';

    // User change variables
    userObject: any;
    userEditForm: FormGroup = new FormGroup({
        first_name: new FormControl(null, Validators.required),
        second_name: new FormControl(null, Validators.required),
        email: new FormControl(null, [Validators.required, Validators.email]),
        street_address: new FormControl(null, Validators.required),
        city: new FormControl(null, Validators.required),
        gender: new FormControl(null, Validators.required),
    });
    genderOptions = [
        { name: 'Male', value: "male" },
        { name: 'Female', value: "female" },
        { name: 'Other', value: "other" },
    ];
    // User change variables

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
        private utilsService: UtilsService,
        private el: ElementRef, private renderer: Renderer2,
        private _location: Location,) {
        this.screenDetectorObject = this.screenDetectorService.getScreenDetectorObject();
    }
    ngOnDestroy(): void {
        this.subscriptions.forEach(s => s.unsubscribe());
    }

    ngAfterViewInit() {
        if (this.showUserPackages) {
            this.changeBackgroundImage();
        }
    }
    ngOnInit() {
        console.log("userSubscriptions: ", this.showUserPackages);
        if (isPlatformBrowser(this.platformId)) {
            if (this.userId) {
                this.getUserDataById();
            }
            else {
                this.getAllUserSubscriptions();
            }
        }
    }

    getUserDataById() {
        this.userService.getAll().subscribe(
            (users: any) => {
                console.log("users: ", users);
                this.userObject = users.find((user: any) => Number(user.id) === Number(this.userId));
                this.userEditForm.patchValue(this.userObject);
                console.log(this.userObject);
                if (this.userObject) {
                    this.getAllUserSubscriptions(this.userObject.email);
                }
            },
            (error: any) => {
                console.log(error);
            }
        );
    }

    getAllPackages() {
        this.packagesService.getAll().subscribe((packages: any) => {
            console.log(packages);
            this.packages = packages;
            if (!this.showUserPackages && !this.userId) {
                this.filteredPackages = [...this.packages];
            }
            else {
                this.filteredPackages = this.packages.filter(packageItem => {
                    return this.userSubscriptions.some((userPackage: any) => userPackage.package === packageItem.id);
                });
            }

            console.log(this.filteredPackages);
        });
    }


    getAllUserSubscriptions(email: string | undefined = undefined) {
        this.subscriptionsService.getAllUserSubscriptions(email).subscribe(
            (userSubscriptions: any) => {
                this.userSubscriptions = userSubscriptions.map((subscription: any) => {
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
        return Array.isArray(this.userSubscriptions) && this.userSubscriptions.find((userPackage: any) => userPackage.package === Number(packageId));
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

    changeBackgroundImage() {
        const heroBanner = this.el.nativeElement.querySelector('.hero-banner');
        console.log(heroBanner);
        if (heroBanner) {
            this.renderer.setStyle(
                heroBanner,
                'background',
                'url("/assets/img/my_subscriptions_banner.jpg") no-repeat'
            );
            this.renderer.setStyle(heroBanner, 'background-size', 'cover');
            this.renderer.setStyle(heroBanner, 'background-position', 'left');
        }
    }

    getTitle() {
        if (!this.showUserPackages && !this.userId) {
            return 'SANDLER VOD';
        }
        else if (this.userId) {
            return this.userObject ? 'Client: ' + this.userObject?.first_name + ' ' + this.userObject?.second_name : '--- ---';
        }
        return this.translate.instant('commons.my-packages');
    }

    getSubtitle() {
        if (!this.showUserPackages && !this.userId) {
            return 'When I take my kid to school, all the parents stop and stare.';
        }
        else if (this.userId) {
            return '';
        }
        return this.translate.instant('commons.home-subtitle');
    }

    updateUserData() {
        if (this.userEditForm.valid && this.userId) {
            this.loading = true;
            this.userService.updateUser(this.userId, this.userEditForm.getRawValue()).subscribe(
                (response: any) => {
                    this.loading = false;
                },
                (error: any) => {
                    this.loading = false;
                    console.log(error);
                }
            );
        }
    }

    getSubscriptionPreview(packageId: any) {
        const subscriptionId = this.userSubscriptions.find((subscription: any) => subscription.package === packageId)?.id;
        if (subscriptionId) {
            return ['/' + Views.SUBSCRIPTIONS, subscriptionId];
        }
        else {
            return ['/' + Views.PACKAGES, this.userId];
        }
    }

    routerBack() {
        this._location.back();
    }

}
