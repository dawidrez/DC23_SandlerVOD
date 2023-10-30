import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { PrimeNgModule } from "src/app/primeng.module";
import { TranslateModule } from "@ngx-translate/core";
import { DateRangeSelectComponent } from "./date-range-select.component/date-range-select.component";
@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        PrimeNgModule,
        TranslateModule,
    ],
    exports: [
        DateRangeSelectComponent
    ],
    declarations: [
        DateRangeSelectComponent
    ],
    providers: [],
})
export class CommonsModule { }