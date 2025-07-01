import { Component, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import decode from 'jwt-decode';
import { ToastrService } from 'ngx-toastr';
import { AlertService } from 'src/app/shared/_alert';
import { EncrypterService } from 'src/app/shared/services/encrypter.service';
import { SessionService } from 'src/app/shared/services/session.service';
import { EmployeeManagementService } from '../employee-management.service';
import { Router } from '@angular/router';
import { dongleState, grooveState } from 'src/app/app.animation';
declare var $:any;
@Component({
  selector: 'app-empl-service-book',
  templateUrl: './empl-service-book.component.html',
  styleUrls: ['./empl-service-book.component.css'],
  animations: [dongleState, grooveState]
})
export class EmplServiceBookComponent {
formattedDate: string;
service_book_data:any=[];
tp_account_id: any = '';
token: any = '';
product_type: any;
add_reward_data:any=[];
edit_reward_data:any=[];
employer_name:any;
employer_mobile:any;
@Input() empDataFromParent: any; 
Joining_Details:any=[];
Training_Details:any=[];
Increment_Details:any=[];
Promotion_Details:any=[];
Separation_Resignation:any=[];
Disciplinary_Actions_Details:any=[];
Reward_Details:any=[];
open_reward_popup:boolean=false;
open_edit_reward_popup:boolean=false;
open_disciplinary_popup:boolean=false;
open_edit_disciplinary_popup:boolean=false;
reward_form:FormGroup;
Reward_Form:FormGroup;
disciplinary_form:FormGroup;
Disciplinary_Form:FormGroup;
reward_row_id:any;
action_row_id:any;
delete_reward_data:any=[];
Leave_Summary:any=[];
formattedLeaveSummary: string[] = [];
constructor(
  public toastr: ToastrService,
  private _sessionService: SessionService,
  private _formBuilder: FormBuilder,
  private _EncrypterService: EncrypterService,
  private _EmployeeManagementService: EmployeeManagementService,
  private _alertservice: AlertService,
  private router: Router,
) { 
}

ngOnInit() {
  let session_obj_d: any = JSON.parse(this._sessionService.get_user_session());
  this.token = decode(session_obj_d?.token);
  this.tp_account_id = this.token.tp_account_id;
  this.product_type = localStorage.getItem('product_type');
  this.employer_name=this.token.name;
  this.employer_mobile=this.token.mobile;
  this.formattedDate = this.getFormattedDate();
  this.reward_form = this._formBuilder.group({
    rewardName: ['', [Validators.required]],
    rewardReason:['',[Validators.required]],
    rewardDate: ['', [Validators.required]],
  });
  this.disciplinary_form = this._formBuilder.group({
    actionDetail: ['', [Validators.required]],
    actionDate:['',[Validators.required]],
    actionReason: ['', [Validators.required]],
  });
  this.Disciplinary_Form = this._formBuilder.group({
    action_Detail: ['', [Validators.required]],
    action_Date:['',[Validators.required]],
    action_Reason: ['', [Validators.required]],
  });

  this.Reward_Form = this._formBuilder.group({
    reward_Name: ['', [Validators.required]],
    reward_Reason:['',[Validators.required]],
    reward_Date: ['', [Validators.required]],
  });
  
  if (this.empDataFromParent?.emp_code) {
    this.GetServiceBook_Details();
  }
}
formatLeaveSummary() {
  this.formattedLeaveSummary = this.Leave_Summary.map((leave) => {
    return `Availed <b>Leave</b> from <b>${leave.leave_start_from}</b> to <b>${leave.leave_end_to}</b>. Total days: <b>${leave.tot_leave}</b>. Leave balance updated accordingly.`;
  });
}
close_disciplinary_popup(){
  this.open_edit_disciplinary_popup=false;
  this.Disciplinary_Form.reset();
}
disciplinary_popup(data:any){
  this.action_row_id=data?.action_row_id;
  this.open_edit_disciplinary_popup=true;
  // console.log(data);
  
this.Disciplinary_Form.patchValue({
  'action_Detail': data?.action_detail,
  'action_Reason':data?.action_reason,
  'action_Date': data?.action_date,
});
  setTimeout(() => {
    $('#action_date').datepicker({
      dateFormat: 'dd/mm/yy',
      changeMonth: true,
      changeYear: true,
      defaultDate: null 
    });
  }, 1000);
}
close_edit_reward_popup(){
  this.open_edit_reward_popup=false;
  this.Reward_Form.reset();
}
open_edit_popup(data:any){
  this.reward_row_id=data?.reward_row_id;
  this.open_edit_reward_popup=true;
  
this.Reward_Form.patchValue({
  'reward_Name': data?.rewardname,
  'reward_Reason':data?.reward_reason,
  'reward_Date': data?.reward_date,
});
  setTimeout(() => {
    $('#reward_date').datepicker({
      dateFormat: 'dd/mm/yy',
      changeMonth: true,
      changeYear: true,
      defaultDate: null 
    });
  }, 1000);
}
close_reward_popup(){
  this.open_reward_popup=false;
  this.reward_form.reset();
}
open_popup(){
  this.open_reward_popup=true;

  setTimeout(() => {
    $('#reward_Date').datepicker({
      dateFormat: 'dd/mm/yy',
      changeMonth: true,
      changeYear: true,
      defaultDate: null 
    });
  }, 1000);
}
open_disciplinary(){
  this.open_disciplinary_popup=true;
  setTimeout(() => {
    $('#actionDate').datepicker({
      dateFormat: 'dd/mm/yy',
      changeMonth: true,
      changeYear: true,
      defaultDate: null 
    });
  }, 1000);
}
close_disciplinary(){
  this.open_disciplinary_popup=false;
  this.disciplinary_form.reset();
}
getFormattedDate(): string {
  const currentDate = new Date();
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'short', // 'Thu'
    month: 'short',   // 'Jan'
    day: '2-digit',   // '26'
    year: 'numeric',  // '2024'
  };
  
  return currentDate.toLocaleDateString('en-US', options).replace(',', ' -');
}
formatExitMessage(exitMessage: string | undefined): string {
  if (!exitMessage) return '';
  return exitMessage.replace(/(\d{1,2}(?:st|nd|rd|th) \w+ \d{4})/g, '<b>$1</b>');
}

getMonthName(mprmonth: number | undefined): string {
  if (!mprmonth) return ''; // Handle undefined case
  const monthNames = [
    '', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  return monthNames[mprmonth];
}
// getSalaryDetail(data: any,emp_id: string,emp_name:any) {
//   let id = data?.salaryid + ',' + emp_id+','+emp_name;
//   if (id != '' && id != undefined) {
//     this.router.navigate(['/employee-mgmt/annexure', this._EncrypterService.aesEncrypt(id.toString())]);
//   } else {
//     this.toastr.info('Something went wrong. Please try later.', 'Success');
//   }
// }
  GetServiceBook_Details(){
      this._EmployeeManagementService.GetServiceBookDetails({
        "empCode": this.empDataFromParent?.emp_code?.toString(),
        'action': 'YearwiseServiceBook',
        'year': '',
        "productTypeId": this.product_type,
        "customerAccountId": this.tp_account_id?.toString(),
      }).subscribe((resData: any) => {
        // console.log(resData);
        if (resData.statusCode) {
          this.service_book_data = resData.commonData;
          this.Joining_Details=this.service_book_data?.Joining_Details;
          this.Training_Details=this.service_book_data?.Training_Details;
          this.Increment_Details=this.service_book_data?.Increment_Details;
          this.Promotion_Details=this.service_book_data?.Promotion_Details;
          this.Separation_Resignation=this.service_book_data?.Separation_Resignation;
          this.Reward_Details=this.service_book_data?.Reward_Details;
          this.Disciplinary_Actions_Details=this.service_book_data?.Disciplinary_Actions_Details;
          this.Leave_Summary=this.service_book_data?.Leave_Summary;
          this.formatLeaveSummary();
          // console.log(this.Disciplinary_Actions_Details);
        } else {
          this.service_book_data = [];
          this.Joining_Details=[];
          this.Training_Details=[];
          this.Increment_Details=[];
          this.Promotion_Details=[];
          this.Separation_Resignation=[];
          this.Reward_Details=[];
          this.Disciplinary_Actions_Details=[];
          this.toastr.error(resData.message, 'Oops!');
        }
      }); 
    
  }

  Add_reward(){
    const createdByUserName = `${this.employer_name}-${this.employer_mobile}`;
    this._EmployeeManagementService.AddEditRewards({
      "empCode": this.empDataFromParent?.emp_code?.toString(),
      "productTypeId": this.product_type,
      "customerAccountId": this.tp_account_id?.toString(),
      "createdBy":this.tp_account_id?.toString(),
      "createdByUserName": createdByUserName,
      "action":'AddRewardDetails',
      "rewardName":this.reward_form.get('rewardName')?.value?.toString(),
      "rewardReason":this.reward_form.get('rewardReason')?.value?.toString(),
      "rewardDate":$('#reward_Date').val(),
    }).subscribe((resData: any) => {
      // console.log(resData);
      if (resData.statusCode) {
        this.add_reward_data = resData.commonData;
        console.log(this.add_reward_data);
        this.GetServiceBook_Details();
        this.close_reward_popup();
        this.toastr.success(resData.message, 'success');
      } else {
        this.add_reward_data = [];
        this.toastr.error(resData.message, 'Oops!');
      }
    }); 
  
  }

  edit_reward(){
    const createdByUserName = `${this.employer_name}-${this.employer_mobile}`;
    // console.log(createdByUserName);
    this._EmployeeManagementService.EditRewards({
      "empCode": this.empDataFromParent?.emp_code?.toString(),
      "productTypeId": this.product_type,
      "customerAccountId": this.tp_account_id?.toString(),
      "createdBy":this.tp_account_id?.toString(),
      "createdByUserName": createdByUserName,
      "action":'EditRewardDetails',
      "rewardName":this.Reward_Form.get('reward_Name')?.value?.toString(),
      "rewardReason":this.Reward_Form.get('reward_Reason')?.value?.toString(),
      "rewardDate":$('#reward_date')?.val(),
      "rewardRowId":this.reward_row_id?.toString()
    }).subscribe((resData: any) => {
      // console.log(resData);
      if (resData.statusCode) {
        this.edit_reward_data = resData.commonData;
        console.log(this.edit_reward_data);
        this.GetServiceBook_Details();
        this.close_edit_reward_popup();
        this.toastr.success(resData.message, 'success');
      } else {
        this.edit_reward_data = [];
        this.toastr.error(resData.message, 'Oops!');
      }
    }); 
  
  }

  DeleteReward_Details(data:any){
    const createdByUserName = `${this.employer_name}-${this.employer_mobile}`;
    this._EmployeeManagementService.DeleteRewardDetails({
      "empCode": this.empDataFromParent?.emp_code?.toString(),
      "productTypeId": this.product_type,
      "customerAccountId": this.tp_account_id?.toString(),
      "createdBy":this.tp_account_id?.toString(),
      "createdByUserName": createdByUserName,
      "rewardRowId":data?.toString()
    }).subscribe((resData: any) => {
      // console.log(resData);
      if (resData.statusCode) {
        this.delete_reward_data = resData.commonData;
        this.close_edit_reward_popup();
        this.GetServiceBook_Details();
        this.toastr.success(resData.message, 'success');
      } else {
        this.delete_reward_data = [];
        this.toastr.error(resData.message, 'Oops!');
      }
    }); 
  
  }

  AddDisciplinary_Action(){
    const createdByUserName = `${this.employer_name}-${this.employer_mobile}`;
    this._EmployeeManagementService.AddEditDisciplinaryAction({
      "empCode": this.empDataFromParent?.emp_code?.toString(),
      "productTypeId": this.product_type,
      "customerAccountId": this.tp_account_id?.toString(),
      "createdBy":this.tp_account_id?.toString(),
      "createdByUserName": createdByUserName,
      "action":'AddDisciplinaryAction',
      "actionDetail":this.disciplinary_form.get('actionDetail')?.value?.toString(),
      "actionReason":this.disciplinary_form.get('actionReason')?.value?.toString(),
      "actionDate":$('#actionDate').val(),
    }).subscribe((resData: any) => {
      // console.log(resData);
      if (resData.statusCode) {
        this.GetServiceBook_Details();
        this.close_disciplinary();
        this.toastr.success(resData.message, 'success');
      } else {
        this.toastr.error(resData.message, 'Oops!');
      }
    }); 

  }

  edit_disciplinary(){
    const createdByUserName = `${this.employer_name}-${this.employer_mobile}`;
    // console.log(createdByUserName);
    this._EmployeeManagementService.EditDisciplinaryAction({
      "empCode": this.empDataFromParent?.emp_code?.toString(),
      "productTypeId": this.product_type,
      "customerAccountId": this.tp_account_id?.toString(),
      "createdBy":this.tp_account_id?.toString(),
      "createdByUserName": createdByUserName,
      "action":'EditDisciplinaryAction',
      "actionDetail":this.Disciplinary_Form.get('action_Detail')?.value?.toString(),
      "actionReason":this.Disciplinary_Form.get('action_Reason')?.value?.toString(),
      "actionDate":$('#action_date').val(),
      "actionRowId":this.action_row_id?.toString()
    }).subscribe((resData: any) => {
      // console.log(resData);
      if (resData.statusCode) {
        this.GetServiceBook_Details();
        this.close_disciplinary_popup();
        this.toastr.success(resData.message, 'success');
      } else {
        this.toastr.error(resData.message, 'Oops!');
      }
    }); 
  
  }

  Deletedisciplinary_Details(data:any){
    const createdByUserName = `${this.employer_name}-${this.employer_mobile}`;
    this._EmployeeManagementService.DeleteDisciplinaryAction({
      "empCode": this.empDataFromParent?.emp_code?.toString(),
      "productTypeId": this.product_type,
      "customerAccountId": this.tp_account_id?.toString(),
      "createdBy":this.tp_account_id?.toString(),
      "createdByUserName": createdByUserName,
      "actionRowId":data?.toString()
    }).subscribe((resData: any) => {
      // console.log(resData);
      if (resData.statusCode) {
        this.close_disciplinary_popup();
        this.GetServiceBook_Details();
        this.toastr.success(resData.message, 'success');
      } else {
        this.toastr.error(resData.message, 'Oops!');
      }
    }); 
  
  }
}
