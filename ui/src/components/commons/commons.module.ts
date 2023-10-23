import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { PrimeNgModule } from "src/app/primeng.module";
import { TranslateModule } from "@ngx-translate/core";
@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        PrimeNgModule,
        TranslateModule,
    ],
    exports: [
        //component: SearchPhraseComponent, ...
    ],
    declarations: [
        //component: SearchPhraseComponent, ...
    ],
    providers: [],
})
export class CommonsModule { }