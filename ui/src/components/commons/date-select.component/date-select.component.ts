import { Component, Inject, Input, OnDestroy, OnInit } from "@angular/core";
import { FormControl, Validators } from '@angular/forms';
import { DOCUMENT } from "@angular/common";
import * as moment from 'moment';
import { Subscription } from "rxjs";
import { ScreenDetector, ScreenDetectorService } from "src/services/screenDetector.service";
import { UtilsService } from "src/services/utils.service";
import { OptionInterface } from "src/interfaces/primengSelectOption.interface";

@Component({
    selector: "app-date-select",
    templateUrl: "./date-select.component.html",
    styleUrls: ["./date-select.component.scss"],
})
export class DateSelectComponent implements OnInit, OnDestroy {
    @Input() label = "commons.date";
    @Input() dateControl!: FormControl;
    @Input() min: any = null;
    @Input() max: any = null;
    @Input() inputId = 'date-select';
    @Input() showClear = true;
    @Input() readonlyInput = false;
    @Input() absoluteError = true;
    @Input() useBackendDateFormat = false;
    @Input() convertBackendDatesFormatOnInit = false;
    // rangeDates: any;
    screenDetectorObject: ScreenDetector;
    validators = Validators;
    options: Array<OptionInterface> = [];
    localControl: FormControl = new FormControl();
    private subscriptions: Subscription[] = [];

    constructor(@Inject(DOCUMENT) public document: Document,
        private checkMobileService: ScreenDetectorService,
        private utilsService: UtilsService) {
        this.screenDetectorObject = this.checkMobileService.getScreenDetectorObject();
    }
    ngOnInit() {
        if (this.dateControl.hasValidator(Validators.required)) {
            this.localControl.setValidators(Validators.required);
        }
        if (this.dateControl && this.dateControl.value) {
            let date = this.dateControl.value;
            if (this.convertBackendDatesFormatOnInit) {
                date = moment(date, this.utilsService.BACKEND_DATE_FORMAT).toDate();
            }
            this.localControl.setValue(date);
            this.localControl.valueChanges.subscribe((date: any) => {
                if (date) {
                    this.dateControl.setValue(moment(date).format(this.utilsService.BACKEND_DATE_FORMAT));
                }
                else {
                    this.dateControl.setValue(null);
                }
            })
        }
    }

    ngOnDestroy() {
        this.subscriptions.forEach(s => s.unsubscribe());
    }

    // dateChange(event: any) {
    //     console.log(event);
    //     // if (event) {
    //     //     this.dateFromControl.markAsDirty();
    //     //     this.dateToControl.markAsDirty();
    //     //     this.dateFromControl.setValue(this.useBackendDateFormat && event[0] ? moment(event[0]).format(this.utilsService.BACKEND_DATE_FORMAT) : event[0]);
    //     //     this.dateToControl.setValue(this.useBackendDateFormat && event[1] ? moment(event[1]).format(this.utilsService.BACKEND_DATE_FORMAT) : event[1]);
    //     // }
    //     // else {
    //     //     this.dateFromControl.setValue(null);
    //     //     this.dateToControl.setValue(null);
    //     // }
    // }
}