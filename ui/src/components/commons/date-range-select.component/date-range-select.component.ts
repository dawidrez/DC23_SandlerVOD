import { Component, Inject, Input, OnDestroy, OnInit } from "@angular/core";
import { FormControl, Validators } from '@angular/forms';
import { DOCUMENT } from "@angular/common";
import * as moment from 'moment';
import { Subscription } from "rxjs";
import { ScreenDetector, ScreenDetectorService } from "src/services/screenDetector.service";
import { UtilsService } from "src/services/utils.service";
import { OptionInterface } from "src/interfaces/primengSelectOption.interface";

@Component({
    selector: "app-date-range-select",
    templateUrl: "./date-range-select.component.html",
    styleUrls: ["./date-range-select.component.scss"],
})
export class DateRangeSelectComponent implements OnInit, OnDestroy {
    @Input() label = "commons.date-range";
    @Input() dateFromControl!: FormControl;
    @Input() dateToControl!: FormControl;
    @Input() min: any = null;
    @Input() max: any = null;
    @Input() inputId = 'date-range-select';
    @Input() showClear = true;
    @Input() disabled = false;
    @Input() readonlyInput = false;
    @Input() absoluteError = true;
    @Input() useBackendDateFormat = false;
    @Input() convertBackendDatesFormatOnInit = false;
    rangeDates: any;
    screenDetectorObject: ScreenDetector;
    validators = Validators;
    options: Array<OptionInterface> = [];
    private subscriptions: Subscription[] = [];

    constructor(@Inject(DOCUMENT) public document: Document,
        private checkMobileService: ScreenDetectorService,
        private utilsService: UtilsService) {
        this.screenDetectorObject = this.checkMobileService.getScreenDetectorObject();
    }
    ngOnInit() {
        if (this.dateFromControl && this.dateToControl && this.dateFromControl.value && this.dateToControl.value) {
            let dateFrom = this.dateFromControl.value;
            let dateTo = this.dateToControl.value;
            if (this.convertBackendDatesFormatOnInit) {
                dateFrom = moment(dateFrom, this.utilsService.BACKEND_DATE_FORMAT).toDate();
                dateTo = moment(dateTo, this.utilsService.BACKEND_DATE_FORMAT).toDate();
            }
            this.rangeDates = [dateFrom, dateTo];
        }

        if (this.dateFromControl && this.dateToControl && this.dateFromControl.value && !this.dateToControl.value) {
            let dateFrom = this.dateFromControl.value;
            if (this.convertBackendDatesFormatOnInit) {
                dateFrom = moment(dateFrom, this.utilsService.BACKEND_DATE_FORMAT).toDate();
            }
            this.rangeDates = [dateFrom, null];
        }

        this.subscriptions.push(this.dateFromControl.valueChanges.subscribe((value: any) => {
            if (!value) {
                this.rangeDates = undefined;
            }
        }));

        this.subscriptions.push(this.dateToControl.valueChanges.subscribe((value: any) => {
            if (!value) {
                this.rangeDates = undefined;
            }
        }));
    }

    ngOnDestroy() {
        this.subscriptions.forEach(s => s.unsubscribe());
    }

    rangeChange(event: any) {
        if (event && Array.isArray(event)) {
            this.dateFromControl.markAsDirty();
            this.dateToControl.markAsDirty();
            this.dateFromControl.setValue(this.useBackendDateFormat && event[0] ? moment(event[0]).format(this.utilsService.BACKEND_DATE_FORMAT) : event[0]);
            this.dateToControl.setValue(this.useBackendDateFormat && event[1] ? moment(event[1]).format(this.utilsService.BACKEND_DATE_FORMAT) : event[1]);
        }
        else {
            this.dateFromControl.setValue(null);
            this.dateToControl.setValue(null);
        }
    }
}