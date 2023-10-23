import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { ScreenDetector, ScreenDetectorService } from 'src/services/screenDetector.service';

@Component({
    selector: 'app-footer',
    templateUrl: './footer.component.html',
    styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {
    isDarkTheme = false;
    languageControl = new FormControl('en', Validators.required)
    languageOptions: any[] = [
        { icon: 'fi fi-gb', value: 'en' },
        { icon: 'fi fi-pl', value: 'pl' },
    ];
    localStorageTranslateKey: string = 'LANGUAGE'
    screenDetectorObject: ScreenDetector = this.screenDetectorService.getScreenDetectorObject();

    constructor(private translate: TranslateService,
        private screenDetectorService: ScreenDetectorService,
        @Inject(PLATFORM_ID) private platformId: Object,) { }

    ngOnInit(): void {
        let language: any = 'en'
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
        // window.localStorage.getItem(this.localStorageTranslateKey, JSON.stringify(user));
    }

    // toggleTheme(): void {
    //     //this.isDarkTheme = !this.isDarkTheme;
    // }
}
