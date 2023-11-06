import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthComponent } from 'src/components/auth/auth.component';
import { Views } from 'src/enums/Views.enum';
import { RouteGuard } from 'src/services/route.guard';
import { UserRole } from 'src/enums/UserRole.enum';
import { PackagesComponent } from 'src/components/packages/packages.component';
import { PackagePreviewComponent } from 'src/components/packages/package-preview/package-preview.component';
import { SubscriptionsComponent } from 'src/components/subscriptions/subscriptions.component';
import { UsersComponent } from 'src/components/users/users.component';

const routes: Routes = [
  // { path: '/user-profile', component: UserProfileComponent, canActivate: [RouteGuard], data: { role: UserRole.ADMIN } },
  { path: Views.LOGIN, component: AuthComponent, data: { mode: 'login' } },
  { path: Views.REGISTER, component: AuthComponent, data: { mode: 'register' } },
  { path: Views.PACKAGES + '/preview/:packageId', component: PackagePreviewComponent },
  { path: Views.PACKAGES + '/:userPackages', component: PackagesComponent },
  { path: Views.PACKAGES, component: PackagesComponent },
  { path: Views.SUBSCRIPTIONS, component: SubscriptionsComponent },
  { path: Views.SUBSCRIPTIONS + '/:subscriptionId', component: PackagePreviewComponent },
  { path: Views.USERS, component: UsersComponent },
  { path: Views.USERS + '/:userId', component: PackagesComponent },
  { path: Views.ANY, redirectTo: Views.LOGIN },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    initialNavigation: 'enabledBlocking'
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
