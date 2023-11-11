import { Component, Inject, OnDestroy, OnInit, PLATFORM_ID, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, UrlSerializer } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { DOCUMENT } from '@angular/common';
import { Location } from '@angular/common';
import { UserService } from 'src/services/user.service';
import { Meta } from '@angular/platform-browser';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { ScreenDetectorService, ScreenDetector } from "src/services/screenDetector.service";
import { Gallery, } from 'ng-gallery';
import { Subscription, forkJoin } from 'rxjs';
import { PackagesService } from 'src/services/packages.service';
import { MoviesService } from 'src/services/movies.service';
import { Clipboard } from '@angular/cdk/clipboard';
import { SubscriptionsService } from 'src/services/subscriptions.service';
import * as moment from 'moment';
import { UtilsService } from 'src/services/utils.service';

@Component({
    selector: 'app-package-preview',
    templateUrl: './package-preview.component.html',
    styleUrls: ['./package-preview.component.scss'],
})
export class PackagePreviewComponent implements OnInit, OnDestroy {
    @ViewChild('packagesContainer') packagesContainer!: any;
    packageId = this.route.snapshot.paramMap.get('packageId') || '';
    subscriptionId = this.route.snapshot.paramMap.get('subscriptionId') || '';
    packageObject: any;
    userSubscriptions: any;
    packages: any;
    users: any;
    subscriptionItem: any;
    packageMovies: any;
    filterForm: FormGroup = new FormGroup({
        searchPhrase: new FormControl(null),
        page: new FormControl(0),
    });
    subscriptionForm: FormGroup = new FormGroup({
        start_date: new FormControl(null, Validators.required),
        end_date: new FormControl(null, Validators.required),
        package: new FormControl(this.packageId, Validators.required),
    });
    today = new Date();
    screenDetectorObject: ScreenDetector = this.screenDetectorService.getScreenDetectorObject();
    subscriptions: Subscription[] = [];
    layout: "list" | "grid" = 'grid';
    updatingSubscription = false;
    subscribing = false;

    constructor(
        @Inject(PLATFORM_ID) private platformId: Object,
        @Inject(DOCUMENT) public document: Document,
        public gallery: Gallery,
        private route: ActivatedRoute,
        private authService: AuthService,
        private packagesService: PackagesService,
        private subscriptionsService: SubscriptionsService,
        private translate: TranslateService,
        private router: Router,
        private _location: Location,
        private userService: UserService,
        private metaService: Meta,
        private screenDetectorService: ScreenDetectorService,
        private moviesService: MoviesService,
        private urlSerializer: UrlSerializer,
        private clipboard: Clipboard,
        private utilsService: UtilsService,) {
        // if(this.subscriptionId){
        //     this.subscriptionForm.addControl('new', new FormControl('', Validators.required));
        // }
    }

    ngOnInit() {
        console.log(this.subscriptionId);
        if (!this.subscriptionId) {
            this.getPackage();
            this.getAllUserSubscriptions();
        }
        else {
            this.getDataForExistingSubscription();
        }
    }


    ngOnDestroy() {
        this.subscriptions.forEach(s => s.unsubscribe());
        // this.interval && clearInterval(this.interval);
    }

    setOpenGraphMeta(packageObject: any) {
        this.metaService.updateTag({ property: 'og:title', content: packageObject.name || '' });
        // this.metaService.updateTag({ property: 'og:image', content: packageObject.imageUrls[0] || '' });
        // this.metaService.updateTag({ property: 'og:description', content: car.description || '' })
    }

    getPackage() {
        this.packagesService.get(this.packageId).subscribe(
            (packageObject: any) => {
                if (isPlatformServer(this.platformId)) {
                    this.setOpenGraphMeta(packageObject);
                }
                else {
                    this.packageObject = packageObject;
                    if (Array.isArray(this.packageObject.movies)) {
                        this.getAllMoviesByIds(this.packageObject.movies);
                    }
                }

            },
            (error: any) => {
                console.log(error);
            }
        );
    }

    getDataForExistingSubscription() {
        this.getAllPackages();
    }

    getAllPackages() {
        this.packagesService.getAll().subscribe(
            (packages: any) => {
                console.log(packages);
                this.packages = packages || [];
                if (this.packages.length) {
                    this.getAllUsers();
                }
            },
            (error: any) => {
                console.log(error);
            }
        );
    }

    getAllUsers() {
        this.userService.getAll().subscribe(
            (users: any) => {
                console.log("users: " + users);
                this.users = users || [];
                if (this.users.length) {
                    this.getUserSubscriptionAndSetFetchedData();
                }
            },
            (error: any) => {
                console.log(error);
            }
        );
    }


    getUserSubscriptionAndSetFetchedData() {
        this.subscriptionsService.getAll().subscribe(
            (subscriptions: any) => {
                subscriptions ||= [];
                const filteredItem = subscriptions.filter((subscription: any) => Number(subscription.id) === Number(this.subscriptionId))?.map((subscription: any) => {
                    subscription.start_date = moment(subscription.start_date, this.utilsService.BACKEND_DATE_FORMAT).toDate();
                    subscription.end_date = moment(subscription.end_date, this.utilsService.BACKEND_DATE_FORMAT).toDate();
                    const subscriptionPackage = this.packages.find((packageItem: any) => Number(subscription.package) === Number(packageItem.id));
                    const subscriptionUser = this.users.find((user: any) => Number(subscription.client) === Number(user.id));
                    if (subscriptionPackage) {
                        subscriptionPackage.moviesNumber = subscriptionPackage.movies?.length || 0;
                    }
                    if (subscriptionUser) {
                        subscriptionUser.fullName = subscriptionUser.first_name + ' ' + subscriptionUser.second_name;
                    }
                    const now = moment();
                    subscription.active = now.isBetween(subscription.start_date, subscription.end_date, null, '[]');
                    subscription.packageObject = subscriptionPackage;
                    subscription.userObject = subscriptionUser;

                    return subscription;
                });
                if (filteredItem?.length) {
                    this.subscriptionItem = filteredItem[0];
                    this.packageObject = this.subscriptionItem.packageObject;
                    this.subscriptionForm.controls['start_date'].setValue(this.subscriptionItem.start_date);
                    this.subscriptionForm.controls['end_date'].setValue(this.subscriptionItem.end_date);
                    this.subscriptionForm.controls['package'].setValue(this.subscriptionItem.packageObject?.id);
                    this.userSubscriptions = [this.subscriptionItem];
                    if (Array.isArray(this.packageObject.movies)) {
                        this.getAllMoviesByIds(this.packageObject.movies);
                    }
                }
            },
            (error: any) => {
                console.log(error);
            }
        );
    }

    getAllMoviesByIds(ids: Array<any>) {
        const observables = ids.map(id => this.moviesService.get(id));

        forkJoin(observables).subscribe(
            responses => {
                this.packageMovies = responses;
            },
            error => {
                console.error('Error fetching movies', error);
            }
        );
    }


    isPlatformBrowserOpened() {
        return isPlatformBrowser(this.platformId);
    }

    routerBack() {
        this._location.back();
    }

    openLinkInNewTab(link: string) {
        if (isPlatformBrowser(this.platformId)) {
            window.open(link, "_blank")
        }
    }

    onPageEvent(event: any) {
        this.filterForm.controls['page']?.setValue(event.first / event.rows);
        // this.pageChanged = true;
        // this.setParams(this.filterForm.value);
        const elementPosition = this.packagesContainer.nativeElement.offsetTop;
        window.scrollTo({
            top: elementPosition - 100,
        });
    }

    copyMovieLink(packageId: any) {
        if (isPlatformBrowser(this.platformId)) {
            const urlTree = this.router.parseUrl(this.router.url);
            urlTree.queryParams = {};
            const cleanUrl = this.urlSerializer.serialize(urlTree);
            const carLink = `${window.location.origin}${cleanUrl}/${packageId}`;
            this.clipboard.copy(carLink);
        }
    }

    addPackage() {
        if (this.subscriptionForm.valid) {
            this.subscribing = true;
            this.subscriptionsService.subscribeOnPackage(this.subscriptionForm.getRawValue()).subscribe(
                (response: any) => {
                    this.getAllUserSubscriptions();
                    this.subscribing = false;
                },
                (error: any) => {
                    console.log(error);
                    this.subscribing = false;
                }
            );
        }
    }

    updateSubscription() {
        if (this.subscriptionForm.valid) {
            this.updatingSubscription = true;
            const model = this.subscriptionForm.getRawValue();
            delete model.start_date;
            delete model.package;
            this.subscriptionsService.updateSubscription(this.subscriptionId, model).subscribe(
                (response: any) => {
                    this.updatingSubscription = false;
                },
                (error: any) => {
                    this.updatingSubscription = false;
                    console.log(error);
                }
            );
        }
    }

    getAllUserSubscriptions() {
        this.subscriptionsService.getAllUserSubscriptions().subscribe(
            (userSubscriptions: any) => {
                this.userSubscriptions = userSubscriptions;
                // start_date: new FormControl(null, Validators.required),
                //     end_date: new FormControl(null, Validators.required),
                //         package: new FormControl(this.packageId, Validators.required),
                if (this.isPackageAlreadyUserPackage()) {
                    const subscription = this.userSubscriptions.find((userPackage: any) => userPackage.package === Number(this.packageId));
                    this.subscriptionForm.controls['start_date'].setValue(moment(subscription.start_date, this.utilsService.BACKEND_DATE_FORMAT).toDate());
                    this.subscriptionForm.controls['end_date'].setValue(moment(subscription.end_date, this.utilsService.BACKEND_DATE_FORMAT).toDate());
                    // subscription && this.subscriptionForm.patchValue(subscription);
                }
            },
            (error: any) => {
                console.log(error);
            }
        );
    }

    isPackageAlreadyUserPackage() {
        return !this.subscriptionId && Array.isArray(this.userSubscriptions) && !!this.userSubscriptions.find((userPackage: any) => userPackage.package === Number(this.packageId));
    }
}

