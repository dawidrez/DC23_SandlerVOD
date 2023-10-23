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

@Component({
    selector: 'app-packages',
    templateUrl: './packages.component.html',
    styleUrls: ['./packages.component.scss']
})
export class PackagesComponent implements OnInit, OnDestroy {
    @ViewChild('carsContainer') carsContainer!: any;
    sortOrder!: number;
    sortField!: string;
    // sortOptions: any[];
    cars!: any[];
    filteredCars!: any[];
    layout: "list" | "grid" = 'grid';

    carsLine = [
        { name: 'H-Line', value: 1 },
        { name: 'P-Line', value: 2 },
        { name: 'D-Line', value: 3 },
    ];

    filterForm: FormGroup = new FormGroup({
        searchPhrase: new FormControl(null),
        maxMileage: new FormControl(null),
        minMakeYear: new FormControl(null),
        line: new FormControl(null),
        page: new FormControl(0),
    });
    subscriptions: Subscription[] = [];
    pageChanged: boolean | undefined = undefined;

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
        private urlSerializer: UrlSerializer) {
        // this.sortOptions = [
        //     { label: 'Price High to Low', value: '!price' },
        //     { label: 'Price Low to High', value: 'price' }
        // ];

        // const params: Params = this.route.queryParams;
        // if (this.route.snapshot.queryParams) {
        //     const urlParams: Params = { ...this.route.snapshot.queryParams }
        //     if (urlParams['line']) {
        //         urlParams['line'] = Number(urlParams['line']);
        //     }
        //     if (urlParams['page']) {
        //         urlParams['page'] = Number(urlParams['page']);
        //     }
        //     if (!this.pageChanged) {
        //         if (this.pageChanged !== undefined) {
        //             urlParams['page'] = 0;
        //         }
        //         else {
        //             this.pageChanged = false;
        //         }
        //         this.filterForm.patchValue(urlParams);
        //         if (this.cars) {
        //             this.filterFormSubmit();
        //         }
        //     }
        //     else {
        //         this.pageChanged = false;
        //     }
        // }
    }
    ngOnDestroy(): void {
        // this.subscriptions.forEach(s => s.unsubscribe());
    }

    ngOnInit() {
        // if (isPlatformBrowser(this.platformId)) {
        //     this.getCars();
        // }
    }

    // consoleLog(data: any) {
    //     console.log(data);
    // }

    // getCars() {
    //     this.carService.getAll().subscribe((cars: any) => {
    //         const now = new Date();
    //         cars.forEach((car: any) => {
    //             if (car.auctionEndDate) {
    //                 car.timeToEndAuction = this.getDateDiffToCurrentDate(car.auctionEndDate);
    //             }
    //             car.images = car.imageUrls.map((imageUrl: any) => {
    //                 const outputURL = this.sanitizer.sanitize(SecurityContext.URL, imageUrl);
    //                 return {
    //                     type: GalleryItemTypes.Image,
    //                     data: {
    //                         altText: car.name,
    //                         src: outputURL,
    //                         thumb: outputURL,
    //                     }
    //                 }
    //             });
    //             car.loadingDelete = false;
    //         });
    //         cars.sort((a: any, b: any) => {
    //             // Convert auctionEndDate strings to Date objects
    //             const dateA = new Date(a.auctionEndDate);
    //             const dateB = new Date(b.auctionEndDate);

    //             if (dateA && dateB) {
    //                 // Both have auctionEndDate, sort in ascending order
    //                 return dateA.getTime() - dateB.getTime();
    //             } else if (dateA) {
    //                 // Only a has auctionEndDate, a comes first
    //                 return -1;
    //             } else if (dateB) {
    //                 // Only b has auctionEndDate, b comes first
    //                 return 1;
    //             }
    //             // Neither have auctionEndDate, retain their order
    //             return 0;
    //         });
    //         cars = cars.filter((car: any) => {
    //             return car.timeToEndAuction && this.getDateDiffToCurrentDateAsNumber(car.auctionEndDate) < 100 && !car.nameEN.includes('units') && !car.nameEN.includes('sets');
    //         });
    //         this.cars = cars;
    //         this.filteredCars = [...this.cars];
    //         if (this.filterFormHasAnyValue()) {
    //             this.filterFormSubmit();
    //         }
    //     });
    // }

    // filterFormHasAnyValue(): boolean {
    //     for (const controlName in this.filterForm.controls) {
    //         if (this.filterForm.controls.hasOwnProperty(controlName)) {
    //             const controlValue = this.filterForm.controls[controlName].value;
    //             if (controlValue) {
    //                 return true;
    //             }
    //         }
    //     }
    //     return false;
    // }

    // removeCar(event: any, carId: any) {
    //     event && event.preventDefault();
    //     this.carService.delete(carId).subscribe(() => {
    //         this.cars = this.cars.filter((car) => car.id !== carId);
    //         // if only 1 car left
    //         if (this.filterForm.controls['page'].value && (this.filteredCars.length - (this.filterForm.controls['page'].value * 32) === 1)) {
    //             this.filterForm.controls['page'].setValue(this.filterForm.controls['page'].value - 1);
    //             this.setParams(this.filterForm.value);
    //         }
    //         this.filteredCars = this.filteredCars.filter((car) => car.id !== carId);
    //     })
    // }

    // onSortChange(event: any) {
    //     let value = event.value;

    //     if (value.indexOf('!') === 0) {
    //         this.sortOrder = -1;
    //         this.sortField = value.substring(1, value.length);
    //     }
    //     else {
    //         this.sortOrder = 1;
    //         this.sortField = value;
    //     }
    // }

    // getFormValuesWithoutNulls(control: AbstractControl): any {
    //     if (control instanceof FormControl) {
    //         return control.value !== null ? control.value : undefined;
    //     }

    //     if (control instanceof FormGroup) {
    //         const result: any = {};
    //         Object.keys(control.controls).forEach(key => {
    //             const value = this.getFormValuesWithoutNulls(control.controls[key]);
    //             if (value !== undefined) {
    //                 result[key] = value;
    //             }
    //         });
    //         return result;
    //     }

    //     if (control instanceof FormArray) {
    //         return control.controls.map(c => this.getFormValuesWithoutNulls(c)).filter(value => value !== undefined);
    //     }

    //     return undefined;
    // }

    // getNameByLanguage(car: any) {
    //     return car.nameEN
    // }

    // getFuelTypeByLanguage(car: any) {
    //     if (this.translate.currentLang === 'cz') {
    //         return car.fuelTypeCS && car.fuelTypeCS.charAt(0).toUpperCase() + car.fuelTypeCS.slice(1).toLowerCase();
    //     }
    //     else if (this.translate.currentLang === 'uk') {
    //         return car.fuelTypeUA && car.fuelTypeUA.charAt(0).toUpperCase() + car.fuelTypeUA.slice(1).toLowerCase();
    //     }
    //     else {
    //         return car.fuelTypeEN && car.fuelTypeEN.charAt(0).toUpperCase() + car.fuelTypeEN.slice(1).toLowerCase();
    //     }
    // }

    // getTransmissionTypeByLanguage(car: any) {
    //     if (this.translate.currentLang === 'cz') {
    //         return car.transmissionTypeCS && car.transmissionTypeCS.charAt(0).toUpperCase() + car.transmissionTypeCS.slice(1).toLowerCase();
    //     }
    //     else if (this.translate.currentLang === 'uk') {
    //         return car.transmissionTypeUA && car.transmissionTypeUA.charAt(0).toUpperCase() + car.transmissionTypeUA.slice(1).toLowerCase();
    //     }
    //     else {
    //         return car.transmissionTypeEN && car.transmissionTypeEN.charAt(0).toUpperCase() + car.transmissionTypeEN.slice(1).toLowerCase();
    //     }
    // }


    // getDateDiffToCurrentDate(endDateString: any) {
    //     const endDate = new Date(endDateString);
    //     const now = new Date();

    //     const differenceInMilliseconds = endDate.getTime() - now.getTime();
    //     const differenceInDays = differenceInMilliseconds / (1000 * 60 * 60 * 24);

    //     if (differenceInDays < 1 && differenceInDays > 0) {
    //         const differenceInHours = differenceInMilliseconds / (1000 * 60 * 60);
    //         if (Math.ceil(differenceInHours) === 1) {
    //             return `${Math.ceil(differenceInHours)} ${this.translate.instant('commons.hour')}`;
    //         }
    //         return `${Math.ceil(differenceInHours)} ${this.translate.instant('commons.hours')}`;
    //     } else if (differenceInDays >= 1) {
    //         if (Math.ceil(differenceInDays) === 1) {
    //             return `${Math.ceil(differenceInDays)} ${this.translate.instant('commons.day')}`;
    //         }
    //         return `${Math.ceil(differenceInDays)} ${this.translate.instant('commons.days')}`;
    //     }
    //     else {
    //         return '';
    //     }
    // }

    // getDateDiffToCurrentDateAsNumber(endDateString: any) {
    //     const endDate = new Date(endDateString);
    //     const now = new Date();

    //     const differenceInMilliseconds = endDate.getTime() - now.getTime();
    //     const differenceInDays = differenceInMilliseconds / (1000 * 60 * 60 * 24);

    //     return differenceInDays;
    // }

    // filterCarsBy(searchPhrase: any, maxMileage: any, minMakeYear: any, line: number) {
    //     let filteredCars = [...this.cars];
    //     if (searchPhrase) {
    //         const searchWords = searchPhrase.toLowerCase().split(/\s+/);  // Split searchPhrase into words
    //         filteredCars = filteredCars.filter((car: any) => {
    //             return searchWords.some((word: any) => {  // Check if any word in searchPhrase is found
    //                 return (car.nameKO && car.nameKO.toLowerCase().includes(word)) ||
    //                     (car.nameEN && car.nameEN.toLowerCase().includes(word)) ||
    //                     (car.nameUA && car.nameUA.toLowerCase().includes(word)) ||
    //                     (car.nameCS && car.nameCS.toLowerCase().includes(word)) ||
    //                     (car.transmissionTypeKO && car.transmissionTypeKO.toLowerCase().includes(word)) ||
    //                     (car.transmissionTypeEN && car.transmissionTypeEN.toLowerCase().includes(word)) ||
    //                     (car.transmissionTypeUA && car.transmissionTypeUA.toLowerCase().includes(word)) ||
    //                     (car.transmissionTypeCS && car.transmissionTypeCS.toLowerCase().includes(word)) ||
    //                     (car.fuelTypeKO && car.fuelTypeKO.toLowerCase().includes(word)) ||
    //                     (car.fuelTypeEN && car.fuelTypeEN.toLowerCase().includes(word)) ||
    //                     (car.fuelTypeUA && car.fuelTypeUA.toLowerCase().includes(word)) ||
    //                     (car.fuelTypeCS && car.fuelTypeCS.toLowerCase().includes(word));
    //             });
    //         });
    //     }
    //     if (maxMileage) {
    //         filteredCars = filteredCars.filter((car: any) => {
    //             return car.mileage && car.mileage <= maxMileage;
    //         });
    //     }

    //     if (minMakeYear) {
    //         filteredCars = filteredCars.filter((car: any) => {
    //             return car.registrationYear && car.registrationYear >= minMakeYear;
    //         });
    //     }

    //     if (line) {
    //         filteredCars = filteredCars.filter((car: any) => {
    //             return car.carsLine && car.carsLine === line;
    //         });
    //     }

    //     this.filteredCars = filteredCars;
    //     this.setParams(this.filterForm.value);
    // }

    // filterFormSubmit(scrollToList: boolean = true, resetPage = false) {
    //     if (resetPage) {
    //         this.filterForm.controls['page'].setValue(0);
    //         this.setParams(this.filterForm.value);
    //     }
    //     this.filterCarsBy(this.filterForm.controls['searchPhrase'].value,
    //         this.filterForm.controls['maxMileage'].value,
    //         this.filterForm.controls['minMakeYear'].value,
    //         this.filterForm.controls['line'].value);

    //     if (scrollToList && this.carsContainer) {
    //         const elementPosition = this.carsContainer.nativeElement.offsetTop;
    //         if (isPlatformBrowser(this.platformId)) {
    //             window.scrollTo({
    //                 top: elementPosition - 70,
    //                 behavior: 'smooth'
    //             });
    //         }
    //         // this.carsContainer.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });

    //     }
    //     // }
    // }

    // onPageEvent(event: any) {
    //     this.filterForm.controls['page']?.setValue(event.first / event.rows);
    //     this.pageChanged = true;
    //     this.setParams(this.filterForm.value);
    //     const elementPosition = this.carsContainer.nativeElement.offsetTop;
    //     window.scrollTo({
    //         top: elementPosition - 100,
    //     });
    // }

    // openCarPreview(carId: any) {
    //     this.router.navigate([Views.PACKAGES, carId])
    // }

    // isUserHasAdminRole() {
    //     return this.authService.isLoggedIn() && this.userService.hasRole(UserRole.ADMIN);
    // }

    // copyCarLink(carId: any) {
    //     if (isPlatformBrowser(this.platformId)) {
    //         const urlTree = this.router.parseUrl(this.router.url);
    //         urlTree.queryParams = {};
    //         const cleanUrl = this.urlSerializer.serialize(urlTree);
    //         const carLink = `${window.location.origin}${cleanUrl}/${carId}`;
    //         this.clipboard.copy(carLink);
    //     }
    // }

    // setParams(params: any = {}) {
    //     const paramsToSave = { ...params };
    //     this.deleteEmptyOrNullProperties(paramsToSave);
    //     this.router.navigate([], {
    //         queryParams: {
    //             ...paramsToSave,
    //         },
    //     });
    // }

    // deleteEmptyOrNullProperties(obj: { [key: string]: any }): void {
    //     for (const key in obj) {
    //         if (obj.hasOwnProperty(key)) {
    //             const value = obj[key];
    //             if (value === null || value === undefined || value === '') {
    //                 delete obj[key];
    //             }
    //         }
    //     }
    // }

    // handleGalleryClick(event: Event) {
    //     const target = event.target as Node;

    //     const classList = (target as HTMLElement)?.classList;
    //     const classListParent = (target?.parentNode as HTMLElement)?.classList;
    //     const classListParentParent = (target?.parentNode?.parentNode as HTMLElement)?.classList;
    //     const classListParentParentParent = (target?.parentNode?.parentNode?.parentNode as HTMLElement)?.classList;
    //     if (this.isNavButton(classList) || this.isNavButton(classListParent) || this.isNavButton(classListParentParent) || this.isNavButton(classListParentParentParent)) {
    //         event.stopPropagation();
    //         event.preventDefault();
    //     }
    // }

    // isNavButton(classList: DOMTokenList): boolean {
    //     // Check if the element or its parent has a class or attribute that identifies it as a navigation button
    //     return !!(classList.contains('g-nav-next') || classList.contains('g-nav-prev'));
    // }
}
