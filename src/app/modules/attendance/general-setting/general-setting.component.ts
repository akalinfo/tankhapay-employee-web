import { Component, ElementRef, OnInit, ViewChild,ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GeneralSettingService } from '../general-setting.service';
import { ShiftDetailService } from '../shift-detail.service';
import { ToastrService } from 'ngx-toastr';
import { EncrypterService } from 'src/app/shared/services/encrypter.service';
import { ShiftSpecificService } from '../shift-specific-service';
import { SessionService } from 'src/app/shared/services/session.service';
import jwtDecode from 'jwt-decode';
import { PopoverDirective } from 'ngx-bootstrap/popover';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-general-setting',
  templateUrl: './general-setting.component.html',
  styleUrls: ['./general-setting.component.css'],
  providers: [DatePipe],

})
export class GeneralSettingComponent implements OnInit {

public generalSettingForm:FormGroup
public showSidebar: boolean = true;
tp_account_id: any;
decoded_token: any;
public mode:any='EmployeeCode';
public maximum_hrs:any='Disable';
public round_off:any='Disable'
  product_type: any;
  GeoFenceId: any;
  shiftDetails: any;
  selectedItems: any =[];
  dropdownSettings: {};
  userList: any;
  roleList: any;
  generalDetails: any;


  max_full_day:any;
  max_half_day:any;
  max_per_day:any;

  min_full_day:any;
  min_half_day:any;
  min_per_day:any;

  @ViewChild('popoverContentMaxFullDay') popoverContentMaxFullDay: ElementRef<HTMLElement>;
  @ViewChild('popoverMaxFullDay') popoverMaxFullDay: PopoverDirective;

  @ViewChild('popoverContentMaxHalfDay') popoverContentMaxHalfDay: ElementRef<HTMLElement>;
  @ViewChild('popoverMaxHalfDay') popoverMaxHalfDay: PopoverDirective;

  @ViewChild('popoverContentMaxPerDay') popoverContentMaxPerDay: ElementRef<HTMLElement>;
  @ViewChild('popoverMaxPerDay') popoverMaxPerDay: PopoverDirective;


  @ViewChild('popoverContentMinFullDay') popoverContentMinFullDay: ElementRef<HTMLElement>;
  @ViewChild('popoverMinFullDay') popoverMinFullDay: PopoverDirective;

  @ViewChild('popoverContentMinHalfDay') popoverContentMinHalfDay: ElementRef<HTMLElement>;
  @ViewChild('popoverMinHalfDay') popoverMinHalfDay: PopoverDirective;

  @ViewChild('popoverContentMinPerDay') popoverContentMinPerDay: ElementRef<HTMLElement>;
  @ViewChild('popoverMinPerDay') popoverMinPerDay: PopoverDirective;
  decodedeToken: any;


  togglePopover(popover) {
    if (popover.isOpen) {
       popover.hide();
    } else {
       popover.show();
    }
  }
  
  formatTime(time: any, controlName: string) {
    const formattedTime = this.datePipe.transform(time, 'HH:mm') || '';
    this.generalSettingForm.controls[controlName].setValue(formattedTime);
  }

  constructor(private fb:FormBuilder,private generalService:GeneralSettingService,
    private shiftService:ShiftDetailService,private toastr:ToastrService,
    private shiftSettingService:ShiftSpecificService,private _sessionService:SessionService,
    private encriptedService:EncrypterService,private datePipe: DatePipe,private cd: ChangeDetectorRef,) { 

    this.generalSettingForm=this.fb.group({
      date:["",Validators.required],
      shift_id:["",Validators.required],
      scale_view:["N"],
      total_hrs_calc:["",Validators.required],
      minimum_hrs:["",Validators.required],
      min_full_day:[""],
      min_half_day:[""],
      min_per_day:[""],
      manual_input:["",Validators.required],
      show_over_time:[""],
      maximum_hrs:["",Validators.required],
      max_full_day:[""],
      max_half_day:[""],
      max_per_day:[""],
      round_off:["",Validators.required],
      first_check_in:[""],
      last_check_out:[""],
      worked_hrs:[""],
      include_weekend:["",Validators.required],
      include_holiday:["",Validators.required],
      include_leave:["",Validators.required],
      carry_over_balance:["",Validators.required],
      view_employee_shift_mapping:["",Validators.required],
      edit_employee_shift_mapping:["",Validators.required],
      is_types_of_on_duty: ["N",[Validators.required]],
      is_make_reason_mandatory_for_on_duty_request: ["N",[Validators.required]],
      is_restrict_on_duty_requests_for_future_dates: ["N",[Validators.required]],
      is_approval_required: ["N",[Validators.required]],
    })

  }

  

  

///////////////////////////////


  toggle() {
    this.showSidebar = !this.showSidebar;
  }

  ngOnInit(): void {

  let session_obj = this._sessionService.get_user_session();
  let token = JSON.parse(session_obj).token;
  this.decoded_token = jwtDecode(token);
  this.decodedeToken=this.decoded_token.id
  this.product_type = this.decoded_token.product_type;
  this.GeoFenceId= this.decoded_token.geo_location_id;
  this.tp_account_id = this.decoded_token.tp_account_id;

    ///////////////////// min full day and min half day and min_per_day ///////////////////////

    this.generalSettingForm.get('manual_input').valueChanges.subscribe(value => {
      const fulldayFromControl = this.generalSettingForm.get('min_full_day');    
      const halfdayFromControl = this.generalSettingForm.get('min_half_day');    
      if (value == 'manual_input' && this.generalSettingForm.value.minimum_hrs == 'Strict') {
        fulldayFromControl.setValidators(Validators.required);
        halfdayFromControl.setValidators(Validators.required);
      } else {
        fulldayFromControl.clearValidators();
        halfdayFromControl.clearValidators();
      }
      
      fulldayFromControl.updateValueAndValidity();
      halfdayFromControl.updateValueAndValidity();
  
    });


this.generalSettingForm.get('manual_input').valueChanges.subscribe(value => {
  const MinPerdayFromControl = this.generalSettingForm.get('min_per_day');    
  if (value == 'manual_input_lenient' && this.generalSettingForm.value.minimum_hrs == 'Lenient') {
    MinPerdayFromControl.setValidators(Validators.required);
  } else {
    MinPerdayFromControl.clearValidators();
  }
  
  MinPerdayFromControl.updateValueAndValidity();

});

/////////////////////////////////// max full day and max halfday and max_per_day /////////////////////////


this.generalSettingForm.get('maximum_hrs').valueChanges.subscribe(value => {
  const MaxfulldayFromControl = this.generalSettingForm.get('max_full_day');    
  const MaxhalfdayFromControl = this.generalSettingForm.get('max_half_day');    
  if (value == 'Enable' && this.generalSettingForm.value.minimum_hrs == 'Strict') {
    MaxfulldayFromControl.setValidators(Validators.required);
    MaxhalfdayFromControl.setValidators(Validators.required);
  } else {
    MaxfulldayFromControl.clearValidators();
    MaxhalfdayFromControl.clearValidators();
  }
  
  MaxfulldayFromControl.updateValueAndValidity();
  MaxhalfdayFromControl.updateValueAndValidity();

});


this.generalSettingForm.get('minimum_hrs').valueChanges.subscribe(value => {
  const MinPerdayFromControl = this.generalSettingForm.get('max_per_day');    
  if (value == 'Lenient' && this.generalSettingForm.value.maximum_hrs == 'Enable') {
    MinPerdayFromControl.setValidators(Validators.required);
  } else {
    MinPerdayFromControl.clearValidators();
  }
  
  MinPerdayFromControl.updateValueAndValidity();

});


///////////////////////////////////////////// Round off ///////////////////////////////////////////

this.generalSettingForm.get('round_off').valueChanges.subscribe(value => {
  const FirstCheckinFromControl = this.generalSettingForm.get('first_check_in');    
  const LastCheckOutFromControl = this.generalSettingForm.get('last_check_out');    
  const WorkedHoursFromControl = this.generalSettingForm.get('worked_hrs');    
  if (value == 'Enable') {
    FirstCheckinFromControl.setValidators(Validators.required);
    LastCheckOutFromControl.setValidators(Validators.required);
    WorkedHoursFromControl.setValidators(Validators.required);
  } else {
    FirstCheckinFromControl.clearValidators();
    LastCheckOutFromControl.clearValidators();
    WorkedHoursFromControl.clearValidators();
  }
  
  FirstCheckinFromControl.updateValueAndValidity();
  LastCheckOutFromControl.updateValueAndValidity();
  WorkedHoursFromControl.updateValueAndValidity();

});

this.getShiftDetails();
this.getAllRole();
this.getGeneralSettingsDetails();

}


async getGeneralSettingsDetails(){

  let obj={
    accountid:this.tp_account_id?.toString(),
    action:'get_general_settings_list',
    keyword:''
  }

  await this.generalService.getGeneralSettings(obj).subscribe((res:any)=>{
  if(res.statusCode && res.commonData){
  let decryptData=JSON.parse(this.encriptedService.aesDecrypt(res.commonData))
  this.generalDetails= decryptData?.data;
  
  this.patchData(this.generalDetails);
  }else{
    this.generalDetails=[];
  }
  // setTimeout(()=>{
  //   this.patchData(this.generalDetails)
  // },2000)
  
})

}


  submitGeneralSetting(){
    if(this.generalSettingForm.invalid){
      return this.generalSettingForm.markAllAsTouched();
    }else{    
      let obj={
      action:(this.generalDetails.length > 0) ? 'update_general_settings' : 'save_general_settings',
      setting_id:(this.generalDetails.length > 0) ? this.generalDetails[0].setting_id.toString() :'',
      customeraccountid:this.tp_account_id.toString(),
      effective_from:this.generalSettingForm.value.date,
      shift_id:this.generalSettingForm.value.shift_id.toString(),
      scale_view:'N',
      total_working_hours_cal:(this.generalSettingForm.value.total_hrs_calc),
      minimum_working_hours_req_for_day:this.generalSettingForm.value.minimum_hrs,
      full_day_time:(this.generalSettingForm.value.min_full_day) ? this.generalSettingForm.value.min_full_day :'',
      half_day_time:(this.generalSettingForm.value.min_half_day) ? this.generalSettingForm.value.min_half_day :'',
      per_day_time:(this.generalSettingForm.value.min_per_day) ? this.generalSettingForm.value.min_per_day :'' ,
      manual_input_shift_hours:(this.generalSettingForm.value.manual_input),
      show_overtime_deviation:(this.generalSettingForm.value.show_over_time==true)?'Y':'N',
      is_max_hours_required:(this.generalSettingForm.value.maximum_hrs == 'Enable') ? 'Y':'N',

      max_full_day_time:(this.generalSettingForm.value.max_full_day) ? this.generalSettingForm.value.max_full_day : '',
      max_half_day_time:(this.generalSettingForm.value.max_half_day) ? this.generalSettingForm.value.max_half_day :'',
      max_hours_per_day_time:(this.generalSettingForm.value.max_per_day) ? this.generalSettingForm.value.max_per_day :'',
      is_round_off:(this.generalSettingForm.value.round_off == 'Enable') ? 'Y':'N',

      first_checkin:(this.generalSettingForm.value.first_check_in) ? this.generalSettingForm.value.first_check_in.toString() : '',
      last_check_out:(this.generalSettingForm.value.last_check_out) ? this.generalSettingForm.value.last_check_out.toString() :'',
      worked_hours:(this.generalSettingForm.value.worked_hrs) ? this.generalSettingForm.value.worked_hrs.toString() :'',
      include_weekends:this.generalSettingForm.value.include_weekend,
      include_holidays:this.generalSettingForm.value.include_holiday,
      include_leave:this.generalSettingForm.value.include_leave,

      carry_balance_hours:(this.generalSettingForm.value.carry_over_balance),
      view_employee_shift_mapping:this.generalSettingForm.value.view_employee_shift_mapping,
      edit_employee_shift_mapping:this.generalSettingForm.value.edit_employee_shift_mapping,
      is_types_of_on_duty: this.generalSettingForm.value.is_types_of_on_duty,
      is_make_reason_mandatory_for_on_duty_request:this.generalSettingForm.value.is_make_reason_mandatory_for_on_duty_request,
      is_restrict_on_duty_requests_for_future_dates: this.generalSettingForm.value.is_restrict_on_duty_requests_for_future_dates,
      is_approval_required:this.generalSettingForm.value.is_approval_required,

      userby:this.decodedeToken.toString(),
      userip:"::1",

      }
    

      this.generalService.saveGeneralSetting(obj).subscribe((res:any)=>{
        if(res.statusCode){
          this.toastr.success(res?.message)
      
          this.getGeneralSettingsDetails();
        }else{
          this.toastr.error(res?.message)
          this.getGeneralSettingsDetails();
          let decryptData=JSON.parse(this.encriptedService.aesDecrypt(res.commonData))
          this.toastr.error(res?.message)
        }
      })
    
    }
    
    }


formatDatePatch(inputDate) {
  const date = new Date(inputDate);
  const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
  return formattedDate;
}


    async patchData(val){
     let view_employee_shift_mapping = await JSON.parse(val[0].view_employee_shift_mapping)
     let edit_employee_shift_mapping = await JSON.parse(val[0].edit_employee_shift_mapping)
     this.cd.detectChanges();

      this.generalSettingForm.patchValue({
        date:this.formatDatePatch(val[0]?.effective_from),
        shift_id:val[0].shift_id.toString(),
        scale_view:'N',
        total_hrs_calc:(val[0].total_working_hours_calculation),
        minimum_hrs:val[0].minimum_working_hours_required_for_day,
        min_full_day :(val[0].full_day_time),
        min_half_day:(val[0].half_day_time) ,
        min_per_day:(val[0]. per_day_time) ,
        manual_input :(val[0].manual_input_shift_hours),
        show_over_time :(val[0].show_overtime_deviation=='Y') ? true:false,
        maximum_hrs :(val[0].is_max_hours_required == 'Y') ? 'Enable':'Disable',
        max_full_day :(val[0].max_full_day_time),
        max_half_day :(val[0].max_half_day_time),
        max_per_day :(val[0].max_hours_per_day_time),
        round_off :(val[0].is_round_off == 'Y') ? 'Enable':'Disable',
        first_check_in:(val[0].first_checkin),
        last_check_out:(val[0].last_check_out),
        worked_hrs:(val[0].worked_hours),
        include_weekend :val[0].is_include_weekend_s,
        include_holiday:val[0].is_include_holidays,
        include_leave:val[0].is_include_leave,
        carry_over_balance:(val[0].is_carry_over_balance_hours_in_overtime_report),
        view_employee_shift_mapping:view_employee_shift_mapping,
        edit_employee_shift_mapping:edit_employee_shift_mapping,
        is_types_of_on_duty: val[0].is_types_of_on_duty,
        is_make_reason_mandatory_for_on_duty_request:val[0].is_make_reason_mandatory_for_on_duty_request,
        is_restrict_on_duty_requests_for_future_dates: val[0].is_restrict_on_duty_requests_for_future_dates,
        is_approval_required: val[0].is_approval_required
      })
     
    }


    async getShiftDetails(){
      let obj={
        accountid:this.tp_account_id.toString(),
        keyword:'',
        action:'shift_list'
      }
      await this.shiftSettingService.getShiftDetails(obj).subscribe((res:any)=>{
        if(res.statusCode){
          let decryptData=JSON.parse(this.encriptedService.aesDecrypt(res.commonData))
          this.shiftDetails=decryptData?.data
        }else{
          let decryptData=JSON.parse(this.encriptedService.aesDecrypt(res.commonData))
        }
 
      })
    }


///////////////////////////////////////////////// Patch data  ////////////////////////////////////////////



    onItemSelect(item: any) {
      this.selectedItems.push(item);
    }
    
    onSelectAll(items: any) {
      this.selectedItems = [...items];
    }
    
    onItemUnselect(item: any) {
      this.selectedItems = this.selectedItems.filter((selectedItem) => selectedItem.emp_code !== item.emp_code);
    }
    
    onUnselectAll(items){
      this.selectedItems=[];
    }
    

async getAllRole(){

  let obj={
    customerAccountId: this.encriptedService.aesEncrypt(this.tp_account_id.toString()),
  }

  await this.generalService.getAllRoles(obj).subscribe((res:any)=>{
    if(res.statusCode){
      let decryptData=JSON.parse(this.encriptedService.aesDecrypt(res.commonData))
      this.roleList=decryptData

      this.dropdownSettings = {
      singleSelection: false,
      idField: 'role_id',
      textField: 'role_name',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 3,
      allowSearchFilter: true
   };

    }else{
      let decryptData=JSON.parse(this.encriptedService.aesDecrypt(res.commonData))
    }

  })


}

resetGeneralSetting(){
  this.generalSettingForm.reset();
  this.getGeneralSettingsDetails();
}

getOnDutyValue(isChecked:boolean){
  if(isChecked){
    this.generalSettingForm.patchValue({
      is_types_of_on_duty:'Y'
    })
  }else{
    this.generalSettingForm.patchValue({
      is_types_of_on_duty:'N',
      is_restrict_on_duty_requests_for_future_dates:'N',
      is_approval_required:'N',
      is_make_reason_mandatory_for_on_duty_request:'N'
    })
  }

}

getFirstCheckBox(isChecked:boolean){
  if(isChecked){
    this.generalSettingForm.patchValue({
      is_make_reason_mandatory_for_on_duty_request:'Y'
    })
  }else{
    this.generalSettingForm.patchValue({
      is_make_reason_mandatory_for_on_duty_request:'N'
    })
  }

}
getSecondCheckBox(isChecked:boolean){
  if(isChecked){
    this.generalSettingForm.patchValue({
      is_restrict_on_duty_requests_for_future_dates:'Y'
    })
  }else{
    this.generalSettingForm.patchValue({
      is_restrict_on_duty_requests_for_future_dates:'N',     
    })
  }

}
getThirdCheckBox(isChecked:boolean){
  if(isChecked){
    this.generalSettingForm.patchValue({
      is_approval_required:'Y'
    })
  }else{
    this.generalSettingForm.patchValue({
      is_approval_required:'N'
    })
  }

}

}
