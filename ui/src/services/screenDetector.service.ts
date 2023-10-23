import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { EMPTY, fromEvent, Observable, of } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';

export interface ScreenDetector {
    isMobile: boolean;
    mobileScreenFrom: number;
    resizeObservable: Observable<Event>;
}

@UntilDestroy()
@Injectable({
    providedIn: 'root'
})
export class ScreenDetectorService {


    screenDetector: ScreenDetector = {
        isMobile: isPlatformBrowser(this.platformId) ? document.documentElement.clientWidth < 1055 : false,
        mobileScreenFrom: 1055,
        resizeObservable: EMPTY,
    };

    constructor(@Inject(PLATFORM_ID) private platformId: Object,) {
        if (this.screenDetector.resizeObservable === EMPTY) {
            this.listenOnScreenResize();
        }
    }

    listenOnScreenResize() {
        if (isPlatformBrowser(this.platformId)) {
            this.screenDetector.resizeObservable = fromEvent(window, 'resize').pipe(untilDestroyed(this), debounceTime(10))
            this.screenDetector.resizeObservable.subscribe((event: any) => {
                this.screenDetector.isMobile = event.target.innerWidth < this.screenDetector.mobileScreenFrom;
            });
        }
        if (isPlatformServer(this.platformId)) {
            this.screenDetector.resizeObservable = of();
        }
    }

    getScreenDetectorObject() {
        return this.screenDetector;
    }

}
