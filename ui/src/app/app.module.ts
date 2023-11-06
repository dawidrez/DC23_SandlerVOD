import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonsModule } from 'src/components/commons/commons.module';
import { PrimeNgModule } from './primeng.module';
import { InputSwitchModule } from 'primeng/inputswitch';
import { AppInitService } from 'src/services/appInit.service';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { PanelModule } from 'primeng/panel';
import { InplaceModule } from 'primeng/inplace';
import { GALLERY_CONFIG, GalleryConfig } from 'ng-gallery';
import { LIGHTBOX_CONFIG, LightboxConfig, LightboxModule } from 'ng-gallery/lightbox';
import { HammerModule } from "../../node_modules/@angular/platform-browser";
import { TableModule } from 'primeng/table';

import { AuthComponent } from 'src/components/auth/auth.component';
import { HeaderComponent } from 'src/components/header/header.component';
import { FooterComponent } from 'src/components/footer/footer.component';
import { QuillModule } from 'ngx-quill';
import { PackagesComponent } from 'src/components/packages/packages.component';
import { PackagePreviewComponent } from 'src/components/packages/package-preview/package-preview.component';
import { SubscriptionsComponent } from 'src/components/subscriptions/subscriptions.component';
import { UsersComponent } from 'src/components/users/users.component';

@NgModule({
    declarations: [
        AppComponent,
        AuthComponent,
        PackagesComponent,
        SubscriptionsComponent,
        UsersComponent,
        PackagePreviewComponent,
        HeaderComponent,
        FooterComponent,
    ],
    imports: [
        HammerModule,
        LightboxModule,
        BrowserModule,
        BrowserAnimationsModule,
        AppRoutingModule,
        PrimeNgModule,
        InputSwitchModule,
        HttpClientModule,
        CommonsModule,
        QuillModule.forRoot({
            customOptions: [{
                import: 'formats/font',
                whitelist: ['mirza', 'roboto', 'aref', 'serif', 'sansserif', 'monospace']
            }],
            modules: {
                syntax: false,
                toolbar: [
                    [
                        'bold', 'italic', 'strike',
                        { 'header': 1 }, { 'header': 2 },
                        { 'list': 'ordered' }, { 'list': 'bullet' }
                    ],
                ]
            },
            placeholder: '',
        }),
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: HttpLoaderFactory,
                deps: [HttpClient]
            }
        }),
        ReactiveFormsModule,
        FormsModule,
        TableModule,
        PanelModule,
        InplaceModule
    ],
    providers: [
        {
            provide: APP_INITIALIZER,
            useFactory: (appInitService: AppInitService) => () => appInitService.init(),
            deps: [AppInitService],
            multi: true,
        },
        {
            provide: GALLERY_CONFIG,
            useValue: {
                autoHeight: false,
                imageSize: 'contain',
                slidingDirection: 'vertical',
                // loadingStrategy: 'lazy',
            } as GalleryConfig
        },
        {
            provide: LIGHTBOX_CONFIG,
            useValue: {
                keyboardShortcuts: true,
                exitAnimationTime: 400
            } as LightboxConfig
        },
    ],
    bootstrap: [AppComponent],
})
export class AppModule { }


// Required for AOT compilation
export function HttpLoaderFactory(http: HttpClient): TranslateHttpLoader {
    return new TranslateHttpLoader(http);
}
