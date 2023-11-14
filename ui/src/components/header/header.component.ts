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
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { RaportService } from 'src/services/raport.service';
import { MessageService } from 'primeng/api';
import * as moment from 'moment';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  providers: [MessageService]
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

  generateReportForm: FormGroup = new FormGroup({
    start_date: new FormControl(null, Validators.required),
    end_date: new FormControl(null, Validators.required),
    format: new FormControl('docx', Validators.required),
  });

  generatingReport: boolean = false;
  formatOptions: any[] = [{ label: 'Microsoft Word(DOCX)', value: 'docx', icon: 'bi bi-file-earmark-word-fill' },
  { label: 'OpenDocument(ODT)', value: 'odt', icon: 'bi bi-file-earmark-text-fill' }];

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    @Inject(DOCUMENT) public document: Document,
    private router: Router,
    private authService: AuthService,
    private userService: UserService,
    private translate: TranslateService,
    // private carService: CarService,
    public screenDetectorService: ScreenDetectorService,
    private raportService: RaportService,
    private messageService: MessageService) {
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

  generateReport() {
    if (this.generateReportForm.valid) {
      this.generatingReport = true;
      this.generateReportForm.controls['start_date'].disable();
      this.generateReportForm.controls['end_date'].disable();
      this.generateReportForm.controls['format'].disable();
      this.raportService.generate(this.generateReportForm.getRawValue()).subscribe(
        (response: any) => {
          const dataType = response.type;
          const binaryData = [];
          binaryData.push(response);
          const downloadLink = document.createElement("a");
          downloadLink.href = window.URL.createObjectURL(new Blob(binaryData, { type: dataType }));

          downloadLink.setAttribute("download", "report_" + this.generateReportForm.controls['start_date'].getRawValue() + '_'
            + this.generateReportForm.controls['end_date'].getRawValue() + "." + this.generateReportForm.controls['format'].getRawValue());
          document.body.appendChild(downloadLink);
          downloadLink.click();
          this.generatingReport = false;
          this.generateReportForm.controls['start_date'].enable();
          this.generateReportForm.controls['end_date'].enable();
          this.generateReportForm.controls['format'].enable();
        },
        (error: any) => {
          console.log(error);
          this.showGenerateRaportWarn();
          this.generatingReport = false;
          this.generateReportForm.controls['start_date'].enable();
          this.generateReportForm.controls['end_date'].enable();
          this.generateReportForm.controls['format'].enable();
        }
      )
    }
  }

  showGenerateRaportWarn() {
    this.messageService.add({ severity: 'warn', summary: 'Warn', detail: this.translate.instant('commons.date-range-error'), });
  }

  getDateFormat(date: any) {
    return moment(date).format("DD/MM/YYYY HH:mm:ss");
  }

}
