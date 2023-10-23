import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AbstractControl, FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { Views } from 'src/enums/Views.enum';
import { AppInitService } from 'src/services/appInit.service';
import { trigger, transition, style, animate } from '@angular/animations';
import { AnimationEvent } from '@angular/animations';

@Component({
    selector: 'app-auth',
    templateUrl: './auth.component.html',
    styleUrls: ['./auth.component.scss'],
    animations: [
        trigger('fadeInOut', [
            transition('void => fadeIn', [
                style({ opacity: 0 }),
                animate('1s', style({ opacity: 1 }))  // 1-second fade-in
            ]),
            transition('fadeOut => void', [
                animate('1s', style({ opacity: 0 }))  // 1-second fade-out
            ])
        ])
    ]

})
export class AuthComponent implements OnInit {
    imageVisible = false;
    imageSrc = '../../assets/img/loading.jpg';
    fadeInOutState: 'fadeIn' | 'fadeOut' | null = null;

    mode: string = this.route.snapshot.data['mode'];
    editForm: FormGroup = new FormGroup({
        firstname: new FormControl(null),
        lastname: new FormControl(null),
        email: new FormControl(null, [Validators.required, Validators.email]),
        address: new FormControl(null),
        gender: new FormControl(null),
        role: new FormControl("USER"),
    });
    validators = Validators;
    loading = false;

    constructor(private route: ActivatedRoute,
        private authService: AuthService,
        private appInitService: AppInitService,
        private router: Router) {
        if (this.mode === 'register') {
            this.editForm.controls['firstname'].setValidators(Validators.required);
            this.editForm.controls['address'].setValidators(Validators.required);
            this.editForm.controls['lastname'].setValidators(Validators.required);
            this.editForm.controls['gender'].setValidators(Validators.required);
            this.editForm.controls['role'].setValidators(Validators.required);
        }
    }

    ngOnInit() {
        // if (this.authService.isLoggedIn()) {

        // }
    }

    updateModeHelper() {
        if (this.mode === 'register') {
            this.editForm.controls['firstname'].setValidators(Validators.required);
            this.editForm.controls['address'].setValidators(Validators.required);
            this.editForm.controls['lastname'].setValidators(Validators.required);
            this.editForm.controls['gender'].setValidators(Validators.required);
            this.editForm.controls['role'].setValidators(Validators.required);

            this.editForm.controls['firstname'].updateValueAndValidity();
            this.editForm.controls['address'].updateValueAndValidity();
            this.editForm.controls['lastname'].updateValueAndValidity();
            this.editForm.controls['gender'].updateValueAndValidity();
            this.editForm.controls['role'].updateValueAndValidity();
        }
        else {
            this.editForm.controls['firstname'].clearValidators();
            this.editForm.controls['address'].clearValidators();
            this.editForm.controls['lastname'].clearValidators();
            this.editForm.controls['gender'].clearValidators();
            this.editForm.controls['role'].clearValidators();

            this.editForm.controls['firstname'].updateValueAndValidity();
            this.editForm.controls['address'].updateValueAndValidity();
            this.editForm.controls['lastname'].updateValueAndValidity();
            this.editForm.controls['gender'].updateValueAndValidity();
            this.editForm.controls['role'].updateValueAndValidity();
        }
    }

    showImage() {
        this.imageVisible = true;
        this.fadeInOutState = 'fadeIn';
    }

    onAnimationDone(event: AnimationEvent) {
        if (this.fadeInOutState === 'fadeIn') {
            // Fade-in animation is complete, start fade-out animation
            this.fadeInOutState = 'fadeOut';
        } else if (this.fadeInOutState === 'fadeOut') {
            // Fade-out animation is complete, hide the image and navigate to another page
            this.imageVisible = false;
            this.router.navigate([Views.PACKAGES]);
            // Navigate to another page
        }
    }

    login() {
        Object.keys(this.editForm.controls).forEach(key => {
            this.editForm.controls[key].markAsDirty();
        });
        if (this.editForm.valid) {
            this.loading = true;
            this.authService.login(this.getFormValuesWithoutNulls(this.editForm)).subscribe({
                next: data => {
                    console.log('login data: ', data)
                    if (!data) {
                        this.editForm.controls['email'].setErrors({ 'email-not-exist': true });
                        this.loading = false;
                    }
                    else {
                        this.authService.saveUser(data);
                        this.appInitService.init().subscribe(() => {
                            this.showImage();
                            this.loading = false;
                            // this.router.navigate([Views.CARS]);
                        });
                    }
                },
                error: err => {
                    this.loading = false;
                    // this.errorMessage = err.error.message;
                    // this.isLoginFailed = true;
                }
            });
        }
    }

    register() {
        if (this.editForm.valid) {
            this.loading = true;
            this.authService.register(this.getFormValuesWithoutNulls(this.editForm)).subscribe((data: any) => {
                if (!data) {
                    console.log('no data');
                    this.editForm.controls['email'].setErrors({ 'email-already-exist': true });
                    this.loading = false;
                }
                else {
                    console.log('new data exist');
                    this.loading = false;
                    this.login();
                }
            })
        }
    }


    getFormValuesWithoutNulls(control: AbstractControl): any {
        if (control instanceof FormControl) {
            return control.value !== null ? control.value : undefined;
        }

        if (control instanceof FormGroup) {
            const result: any = {};
            Object.keys(control.controls).forEach(key => {
                const value = this.getFormValuesWithoutNulls(control.controls[key]);
                if (value !== undefined) {
                    result[key] = value;
                }
            });
            return result;
        }

        if (control instanceof FormArray) {
            return control.controls.map(c => this.getFormValuesWithoutNulls(c)).filter(value => value !== undefined);
        }

        return undefined;
    }

}
