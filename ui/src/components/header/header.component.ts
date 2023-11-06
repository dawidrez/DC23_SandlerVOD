import { Component, Inject, Input, PLATFORM_ID } from '@angular/core';
import { Views } from 'src/enums/Views.enum';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/services/auth.service';
import { UserService } from 'src/services/user.service';
import { UserRole } from 'src/enums/UserRole.enum';
import { DOCUMENT } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { ScreenDetectorService, ScreenDetector } from "src/services/screenDetector.service";
import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {

  @Input() headerZIndex = 2;
  views = Views;
  userOptions = [
    { name: 'commons.pull-cars', value: 'updateAll', icon: 'bi bi-cloud-download', loading: false },
    { name: 'commons.logout', value: 'logout', icon: 'bi bi-box-arrow-right', loading: false }
  ];
  languageControl = new FormControl('en', Validators.required);
  languageOptions: any[] = [
    { icon: 'fi fi-gb', value: 'en' },
    { icon: 'fi fi-pl', value: 'pl' },
  ];
  localStorageTranslateKey: string = 'LANGUAGE'
  screenDetectorObject: ScreenDetector;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    @Inject(DOCUMENT) public document: Document,
    private router: Router,
    private authService: AuthService,
    private userService: UserService,
    private translate: TranslateService,
    // private carService: CarService,
    public screenDetectorService: ScreenDetectorService,) {
    this.screenDetectorObject = this.screenDetectorService.getScreenDetectorObject();
  }

  ngOnInit(): void {
    let language: any = 'en';
    if (isPlatformBrowser(this.platformId)) {
      language = window.localStorage.getItem(this.localStorageTranslateKey);
    }
    if (language) {
      this.translate.use(language);
      this.languageControl.setValue(language);
    }
    this.languageControl.valueChanges.subscribe((languageOption: any) => {
      this.translate.use(languageOption);
      if (isPlatformBrowser(this.platformId)) {
        window.localStorage.setItem(this.localStorageTranslateKey, languageOption);
      }
    })
  }

  openByView(view: any) {
    this.router.navigate(view)
  }

  isUserLoggedIn() {
    return this.authService.isLoggedIn();
  }

  isAdmin() {
    return this.authService.isAdmin();
  }

  logout() {
    this.authService.clean();
    this.router.navigate([Views.LOGIN]);
  }

  pullAllCars(option: any) {
    // this.carService.updateAll().subscribe(() => {
    //   option.loading = false;
    //   if (isPlatformBrowser(this.platformId)) {
    //     window.location.reload();
    //   }
    // })
  }

  userClickEvent(option: any) {
    if (option.value === 'updateAll' && !option.loading) {
      option.loading = true;
      this.pullAllCars(option);
    }
    else if (option.value === 'logout') {
      this.logout();
    }
  }

  getCurrentUserFullName() {
    return this.userService.getCurrentUser() ? this.userService.getCurrentUser().firstname + ' ' + this.userService.getCurrentUser().lastname : ''
  }

  getCurrentUserInitials() {
    const user = this.userService.getCurrentUser();
    if (!user) {
      return '';
    }

    const firstNameInitial = user.firstname ? user.firstname[0] : '';
    const lastNameInitial = user.lastname ? user.lastname[0] : '';

    return `${firstNameInitial} ${lastNameInitial}`;
  }

}
