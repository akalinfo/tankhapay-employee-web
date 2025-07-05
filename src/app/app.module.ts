import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CoreModule } from "./components/core/core.module";
// import { DashboardComponent } from './modules/dashboard/dashboard.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
// import { LoginComponent } from './modules/login/login.component';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { httpInterceptor } from './shared/interceptors/httpInterceptor';
import { ToastrModule } from 'ngx-toastr';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { UserChangePasswordComponent }
  from './modules/user-change-password/user-change-password.component';
import { LogoutComponent } from './components/logout/logout.component';

// import { RECAPTCHA_V3_SITE_KEY, RecaptchaV3Module } from 'ng-recaptcha';
import { environment } from '../environments/environment';
// import { JuspayresComponent } from './modules/juspayres/juspayres.component';
import { StoreModule } from '@ngrx/store';
import { menuReducer } from './modules/employee-management/state-mgmt/employee.reducer';
// import { JuspyMakePaymentComponent } from './modules/juspay-make-payment/juspay-make-payment.component';
import { filtersReducer } from './modules/employee/store/filter.reducer';
import { SsoRedirectComponent } from './modules/sso-redirect/sso-redirect.component';
import { AppInitializerService } from './shared/services/app-intializer.service';
import { IncomeTaxCalculatorComponent } from './modules/income-tax-calculator/income-tax-calculator.component';
// import { IstToGermanTimePipe } from 'src/app/shared/pipes/ist-to-germant-timezone.pipe';
export function appInitializerFactory(appInitializer: AppInitializerService) {
  return () => appInitializer.initialize();
}

@NgModule({
  declarations: [
    AppComponent,
    // LoginComponent,
    UserChangePasswordComponent,
    LogoutComponent,
    // JuspayresComponent,
    // JuspyMakePaymentComponent,
    SsoRedirectComponent,
    IncomeTaxCalculatorComponent,
    // IstToGermanTimePipe
  ],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: appInitializerFactory,
      deps: [AppInitializerService],
      multi: true,
    },
    { provide: HTTP_INTERCEPTORS, useClass: httpInterceptor, multi: true },
    {
      // provide: RECAPTCHA_V3_SITE_KEY,
      // useValue: environment.recaptcha.siteKey,
    },
  ],
  bootstrap: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    CoreModule,
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule,
    // RecaptchaV3Module,

    ToastrModule.forRoot({
      maxOpened: 1,
      autoDismiss: true
    }),
    StoreModule.forRoot(menuReducer),
    StoreModule.forRoot({ filters: filtersReducer }),
  ]
})
export class AppModule { }
