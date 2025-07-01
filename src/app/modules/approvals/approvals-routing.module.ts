import { NgModule, Component } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VoucherComponent } from './voucher/voucher.component';
import { AddNewVoucherComponent } from './voucher/add-new-voucher/add-new-voucher.component';
import { VoucherReportComponent } from './voucher_report/voucher-report.component';
import { ProofOfReimbursementComponent } from './proof-of-reimbursement/proof-of-reimbursement.component';
import { OndutyComponent } from './onduty-applications/onduty.component';
import { MasterVoucherTypeComponent } from './master-voucher-type/master-voucher-type.component';
import { TravelRequestComponent } from './travel-request/travel-request.component';
import { TravelExpenseComponent } from './travel-expense/travel-expense.component';
import { ManageMissPunchComponent } from './manage-miss-punch/manage-miss-punch.component';
import { FaceRegisterComponent } from './face-register/face-register.component';
import { CompOffRequestApprovalComponent } from './comp-off-request-approval/comp-off-request-approval.component';
import { WfhRequestApprovalComponent } from './wfh-request-approval/wfh-request-approval.component';
import { ImprestReimburseApprovalComponent } from './imprest-reimburse-approval/imprest-reimburse-approval.component';

const routes: Routes = [
  {
    path: '',  component:VoucherReportComponent } ,
  // {
  //   path:'proof-of-investments',
  //   component : ProofOfInvestmentsComponent
  // },
  // {
  //   path:'reimbursements',
  //   component:ReimbursementsComponent
  // },
//   {
//     path:'payouts',
//     component:AdvanceSalaryComponent
//   },

//  {
//     path:'advance-salary',
//     component:AdvanceSalaryComponent
//   },
//  {
//   path:'deduction',
//   component:DeductionComponent
//  },

//  {
//   path:'overtime',
//   component:OvertimeComponent
//  },

//  {
//   path:'allowance',
//   component:AllowanceComponent
//  },
{
  path:'proof_of_reimbursement',
  component : ProofOfReimbursementComponent
},
 {
  path:'voucher',
  component:VoucherComponent
},
{
  path:'voucher/add-new-voucher',
  component:AddNewVoucherComponent
},{
  path:'voucher_report',
  component:VoucherReportComponent
},{
  path:'onduty-applications',
  component:OndutyComponent
},
{
  path:'master_voucher_type',
  component:MasterVoucherTypeComponent
 },
 {
  path: 'travel-request',
  component: TravelRequestComponent
 },
 {
  path: 'travel-expense',
  component: TravelExpenseComponent
 },
 {
  path: 'missed-punch-approval',
  component: ManageMissPunchComponent
 },
 {
  path: 'face-register',
  component: FaceRegisterComponent
 },
 {
  path: 'comp-off-request-approval',
  component: CompOffRequestApprovalComponent
 },
 {
  path: 'wfh-request-approval',
  component: WfhRequestApprovalComponent
 },
 {
  path: 'imprest-reimburse-approval',
  component: ImprestReimburseApprovalComponent
 }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ApprovalsRoutingModule { }
