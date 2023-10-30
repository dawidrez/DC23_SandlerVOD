import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Subject, Observable } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class UtilsService {
    readonly MAX_INTEGER = 2147483647;

    readonly numberPatterns = {
        INTEGER: 'INTEGER',
        DECIMAL_2: 'DECIMAL_2',
        DECIMAL_2_WITH_NEGATIVE: 'DECIMAL_2_WITH_NEGATIVE'
    };

    readonly textPatterns = {
        GEO: 'GEO'
    };

    readonly DEFAULT_DEBOUNCE_TIME = 500;
    readonly DEFAULT_ANIMATION_TIME = 200;

    readonly DEBOUNCE_250 = 250;

    readonly INDICATOR_INTERVAL_TIME = 30 * 1000;
    readonly DOCUMENT_EXPORT_INTERVAL_TIME = 120 * 1000;

    readonly BACKEND_DATE_FORMAT = 'YYYY-MM-DD';
    readonly BACKEND_YEAR_MONTH_FORMAT = 'YYYY-MM';
    readonly FRONTEND_DATE_FORMAT = 'DD/MM/YYYY';
    readonly FRONTEND_DATETIME_FORMAT = 'DD/MM/YYYY HH:mm:ss';
    readonly FRONTEND_YEAR_MONTH_FORMAT = 'MM/YYYY';
    readonly FRONTEND_MONTH_YEAR_FORMAT = 'MMMM YYYY';
    readonly FRONTEND_WEEK_NUMBER_FORMAT = 'w';
    readonly FRONTEND_DAY_NUMBER_FORMAT = 'D';
    readonly FRONTEND_WEEK_DAY_FORMAT = 'ddd';

    readonly SORTING_ASCENDING = 'ASC';
    readonly SORTING_DESCENDING = 'DESC';

    readonly debounceModelOptions = {
        debounce: this.DEFAULT_DEBOUNCE_TIME
    };

    readonly paginationLimitOptions = [10, 25, 50];

    readonly autoCompleteItemHeightPx = 48;

    private timeoutSubject = new Subject<void>();

    constructor(private translate: TranslateService) {
        this.timeoutSubject.pipe(debounceTime(this.DEFAULT_DEBOUNCE_TIME)).subscribe(() => {
            // Handle debounced logic here
        });
    }

    private copyToClipboardFallback(text: string): void {
        const textElement = document.createElement('textarea');
        textElement.value = text;
        textElement.style.position = 'fixed';
        document.body.appendChild(textElement);
        textElement.focus();
        textElement.select();
        document.execCommand('copy');
        document.body.removeChild(textElement);
    }

    getPaginationTranslations(): any {
        return {
            of: this.translate.instant('commons.pagination.of'),
            page: this.translate.instant('commons.pagination.page'),
            rowsPerPage: this.translate.instant('commons.pagination.rowsPerPage')
        };
    }

    tabKeyDownOnMdEditDialog(event: KeyboardEvent): boolean {
        if (event.keyCode === 9) {
            event.preventDefault();

            const formElement = document.getElementById('editDialog') as HTMLFormElement;
            const submitButton = document.createElement('button');
            submitButton.id = 'submitEditDialog';
            submitButton.type = 'submit';
            submitButton.style.display = 'none';
            formElement.appendChild(submitButton);
            const submitEditDialog = document.getElementById('submitEditDialog') as HTMLButtonElement;
            submitEditDialog.click();
            formElement.removeChild(submitButton);

            return false;
        }
        return true;
    }

    setCustomAutoCompleteItemHeightBasedOnItemsCount(dataCount: number, itemHeight?: number): void {
        const itemHeightInPx = itemHeight ?? this.autoCompleteItemHeightPx;
        const result = document.getElementsByClassName('md-virtual-repeat-container');
        const wrappedResult = Array.from(result) as HTMLElement[];
        wrappedResult[0].style.height = (dataCount > 0 ? itemHeightInPx * dataCount : itemHeightInPx) + 'px';
    }

    romanize(num: number): string {
        if (!+num) {
            return '';
        }
        const digits = String(+num).split('');
        const key = ['', 'C', 'CC', 'CCC', 'CD', 'D', 'DC', 'DCC', 'DCCC', 'CM',
            '', 'X', 'XX', 'XXX', 'XL', 'L', 'LX', 'LXX', 'LXXX', 'XC',
            '', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX'];
        let roman = '';
        let i = 3;

        while (i--) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            roman = (key[+digits.pop()! + (i * 10)] || '') + roman;
        }

        return Array(+digits.join('') + 1).join('M') + roman;
    }

    debounce<T>(fn: () => T, wait: number = this.DEFAULT_DEBOUNCE_TIME): Observable<T> {
        return new Observable<T>((observer) => {
            this.timeoutSubject.pipe(debounceTime(wait)).subscribe(() => {
                const result = fn();
                observer.next(result);
                observer.complete();
            });
        });
    }

    generateUUID(): string {
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }

    calculateWeekdaysWithoutWeekends(from: moment.Moment, to: moment.Moment): number {
        let totalDays = 0;
        let weekendDays = 0;

        const toInclusive = to.clone().add(1, 'days');
        let currentDateInclusive = from.clone();

        while (toInclusive.isAfter(currentDateInclusive, 'day')) {
            ++totalDays;

            if (currentDateInclusive.isoWeekday() === 6 || currentDateInclusive.isoWeekday() === 7) {
                ++weekendDays;
            }

            currentDateInclusive = currentDateInclusive.add(1, 'days');
        }

        return totalDays - weekendDays;
    }

    copyToClipboard(text: string): Promise<void> {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            return navigator.clipboard.writeText(text);
        } else {
            this.copyToClipboardFallback(text);
            return Promise.resolve();
        }
    }

    buildQueryString(params: { [key: string]: any }): string {
        return Object.keys(params)
            .filter((key) => params[key])
            .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
            .join('&');
    }
}