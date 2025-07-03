import { NgModule, Component } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
// import { SidebarComponent } from './components/core/sidebar/sidebar.component';
// import { DashboardComponent } from './modules/dashboard/dashboard.component';
import { LogoutComponent } from './components/logout/logout.component';
import { UserChangePasswordComponent } from './modules/user-change-password/user-change-password.component';
import { AuthguardService } from './shared/services/authguard.service';
import { FlagCheckService } from './shared/services/flag-check.service';
import { IncomeTaxCalculatorComponent } from './modules/income-tax-calculator/income-tax-calculator.component';
import { EmployeeSsoComponent } from './modules/sso-login/employee-sso/employee-sso.component';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'login'
  }, {
    path: 'logout',
    component: LogoutComponent
  }
 
  ,
  {
    path: 'change-password',
    component: UserChangePasswordComponent
  }, {
    path: 'login',
    loadChildren: () => import('./modules/login/login.module').then(m => m.LoginModule)
  }, {
    path: 'sso-login/:ssouid/:emplyrssoid',
    pathMatch: 'full',
    loadChildren: () => import('./modules/sso-login/sso-login.module').then(m => m.SsoLoginModule)
  },
  {
    path: 'dashboard',
    loadChildren: () => import('../app/modules/dashboard/dashboard.module').then(m => m.DashboardModule),
    canActivate: [AuthguardService, FlagCheckService]
  }, {
    path: 'products',
    loadChildren: () => import('../app/modules/products/products.module').then(m => m.ProductsModule),
    canActivate: [AuthguardService, FlagCheckService]
  },
  {
    path: 'payouts',
    loadChildren: () => import('../app/modules/payout/payout.module').then(m => m.PayoutModule),
    canActivate: [AuthguardService, FlagCheckService]
  },
  {
    path: 'employees',
    loadChildren: () => import('../app/modules/employee/employee.module').then(m => m.EmployeeModule),
    canActivate: [AuthguardService, FlagCheckService]
  },
  {
    path: 'attendance',
    loadChildren: () => import('../app/modules/attendance/attendance.module').then(m => m.AttendanceModule),
    canActivate: [AuthguardService, FlagCheckService]

  },
  {
    path: 'reports',
    loadChildren: () => import('../app/modules/reports/reports.module').then(m => m.ReportsModule),
    canActivate: [AuthguardService, FlagCheckService]
  },
  {
    path: 'accounts',
    loadChildren: () => import('../app/modules/accounts/accounts.module').then(m => m.AccountsModule),
    canActivate: [FlagCheckService]
  },
  //canActivate: [AuthguardService, FlagCheckService]
  {
    path: 'business-settings',
    loadChildren: () => import('../app/modules/business-settings/business-settings.module').then(m => m.BusinessSettingsModule),
    canActivate: [AuthguardService, FlagCheckService]
  },
  {

    path: 'approval',
    loadChildren: () => import('../app/modules/approvals/approvals.module').then(m => m.ApprovalsModule),
    canActivate: [AuthguardService, FlagCheckService]
  },
  {
    path: 'mgmt',
    loadChildren: () => import('../app/modules/user-mgmt/user-mgmt.module').then(m => m.UserMgmtModule),
    canActivate: [AuthguardService, FlagCheckService]
  },
  {
    path: 'visitor',
    loadChildren: () => import('../app/modules/visitor/visitor.module').then(m => m.VisitorModule),
    canActivate: [AuthguardService, FlagCheckService]
  },
  {
    path: 'leave-mgmt',
    loadChildren: () => import('../app/modules/leave-mgmt/leave-mgmt.module').then(m => m.LeaveMgmtModule),
    canActivate: [AuthguardService, FlagCheckService]
  },
  {
    path: 'broadcaster',
    loadChildren: () => import('../app/modules/broadcaster/broadcaster.module').then(m => m.BroadcasterModule),
    canActivate: [AuthguardService, FlagCheckService]
  },
 
 
  {
    path: 'help-and-support',
    loadChildren: () => import('../app/modules/help-and-support/help-and-support.module').then(m => m.HelpAndSupportModule),
    canActivate: [AuthguardService, FlagCheckService]
  }, {
    path: 'employee-mgmt',
    loadChildren: () => import('../app/modules/employee-management/employee-management.module').then(m => m.EmployeeManagementModule),
    canActivate: [AuthguardService, FlagCheckService]
  },
 
  {
    path: 'recruit',
    loadChildren: () => import('../app/modules/sso-redirect/sso-redirect.module').then(m => m.SsoRedirectModule)
    // loadChildren: () => import('./modules/recruit/recruit.module').then(m => m.RecruitModule),
  },
  {
    path: 'tnd',
    loadChildren: () => import('../app/modules/sso-redirect/sso-redirect.module').then(m => m.SsoRedirectModule)
  }
  , {
    path: 'performance',
    loadChildren: () => import('../app/modules/sso-redirect/sso-redirect.module').then(m => m.SsoRedirectModule)
  }, {
    path: 'survey-management',
    loadChildren: () => import('../app/modules/sso-redirect/sso-redirect.module').then(m => m.SsoRedirectModule)
  },
  {
    path: 'feedback',
    loadChildren: () => import('../app/modules/sso-redirect/sso-redirect.module').then(m => m.SsoRedirectModule)
  },
  {
    path: 'profile',
    loadChildren: () => import('../app/modules/employee-login/employee-login.module').then(m => m.EmployeeLoginModule),
    canActivate: [AuthguardService, FlagCheckService]
  }
  ,
  {
    path: 'income-tax-calculator',
    component: IncomeTaxCalculatorComponent
  }, {
    path: 'employee-sso/:accountid/:employeessoid',
    component: EmployeeSsoComponent
  },

  { path: '**', redirectTo: 'login' }
];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
