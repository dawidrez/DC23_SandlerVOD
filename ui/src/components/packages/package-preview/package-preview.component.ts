import { Component, ElementRef, Inject, OnDestroy, OnInit, PLATFORM_ID, Sanitizer, SecurityContext, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, UrlSerializer } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { AbstractControl, FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
// import { CarService } from 'src/services/car.service';
import { TranslateService } from '@ngx-translate/core';
import { DOCUMENT } from '@angular/common';
import { Galleria } from 'primeng/galleria';
import { Location } from '@angular/common';
import { Views } from 'src/enums/Views.enum';
import { UserRole } from 'src/enums/UserRole.enum';
import { UserService } from 'src/services/user.service';
import { DomSanitizer, Meta } from '@angular/platform-browser';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { ScreenDetectorService, ScreenDetector } from "src/services/screenDetector.service";
import { Gallery, GalleryItem, GalleryItemTypes, GalleryRef, GalleryState } from 'ng-gallery';
import { Observable, Subscription, forkJoin, of } from 'rxjs';
import { PackagesService } from 'src/services/packages.service';
import { MoviesService } from 'src/services/movies.service';
import { Clipboard } from '@angular/cdk/clipboard';
import { SubscriptionsService } from 'src/services/subscriptions.service';
import * as moment from 'moment';
import { UtilsService } from 'src/services/utils.service';

@Component({
    selector: 'app-package-preview.',
    templateUrl: './package-preview.component.html',
    styleUrls: ['./package-preview.component.scss'],
})
export class PackagePreviewComponent implements OnInit, OnDestroy {
    @ViewChild('packagesContainer') packagesContainer!: any;
    packageId = this.route.snapshot.paramMap.get('packageId') || '';
    packageObject: any;
    userPackages: any;
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
    }

    ngOnInit() {
        this.getPackage();
        this.getAllUserSubscriptions();
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
                        this.getAllMoviesByIds(this.packageObject.movies)
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
            this.subscriptionsService.subscribeOnPackage(this.subscriptionForm.getRawValue()).subscribe(
                (response: any) => {
                    this.getAllUserSubscriptions();
                },
                (error: any) => {
                    console.log(error);
                }
            );
        }
    }

    getAllUserSubscriptions() {
        this.subscriptionsService.getAllUserPackages().subscribe(
            (userPackages: any) => {
                this.userPackages = userPackages;
                // start_date: new FormControl(null, Validators.required),
                //     end_date: new FormControl(null, Validators.required),
                //         package: new FormControl(this.packageId, Validators.required),
                if (this.isPackageAlreadyUserPackage()) {
                    const subscription = this.userPackages.find((userPackage: any) => userPackage.package === Number(this.packageId));
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
        return Array.isArray(this.userPackages) && !!this.userPackages.find((userPackage: any) => userPackage.package === Number(this.packageId));
    }
}

