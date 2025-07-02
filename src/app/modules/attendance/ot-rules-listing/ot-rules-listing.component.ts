import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AlertService } from 'src/app/shared/_alert';
import { EncrypterService } from 'src/app/shared/services/encrypter.service';
import { SessionService } from 'src/app/shared/services/session.service';
import { AttendanceService } from '../attendance.service';
declare var $: any;
import decode from 'jwt-decode';
import { FaceCheckinService } from '../face-checkin.service';
import { ShiftSpecificService } from '../shift-specific-service';
@Component({
  selector: 'app-ot-rules-listing',
  templateUrl: './ot-rules-listing.component.html',
  styleUrls: ['./ot-rules-listing.component.css']
})
export class OtRulesListingComponent {
  showSidebar: boolean = true;
  product_type: any;
  tp_account_id: any = '';
  token: any = '';
  otId: any;
  currentOtRule: any=[];
  pageHead: any='';
  shiftType : string='overtime';
  dayType:string='weekdays';
  shiftDifferentialForm: FormGroup;

  overTimeForm : FormGroup;
  selectedCompensationType: number=-1;
  OtRules: any=[];
  shiftDetails: any=[];
  constructor(
    public toastr: ToastrService,
    private _sessionService: SessionService,
    private _formBuilder: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private _EncrypterService: EncrypterService,
    private _AttendanceService: AttendanceService,
    private _faceCheckinService : FaceCheckinService,
    private shiftSettingService : ShiftSpecificService) {
      this.activatedRoute.params.subscribe((params: any) => {
        if(params['id']){
          let data = JSON.parse(this._EncrypterService.aesDecrypt(params['id']));
          console.log(data);
          
          this.otId = data.id;
          this.pageHead = data.name;
        }
      });

  }

  ngOnInit() {
    let session_obj_d: any = JSON.parse(
      this._sessionService.get_user_session());
    this.token = decode(session_obj_d.token);
    this.tp_account_id = this.token.tp_account_id;
    this.product_type = localStorage.getItem('product_type');

      this.overTimeForm = this._formBuilder.group({
      daily: this._formBuilder.array([]),
      overtimeRate : [''],
      doubleTimeRate: [''],
      shift_id : ['']
    });

    this.getOTRuleMaster();
    this.getShiftDetails()
  }

  get dailyControls() {
    return (this.overTimeForm.get('daily') as FormArray).controls;
  }
  

  onDailyCheckboxChange(event, dayIndex: number, controlName: string) {
    const dailyControls = this.overTimeForm.get('daily')['controls'][dayIndex];
    const control = dailyControls.get(controlName);
    if (event.target.checked) {
      control.enable();
    } else {
      control.disable();
      control.reset();
    }
  }

  filterAndOrganizeData(data: any[]) {
    const filteredData = data.filter(item => item.status === '1');
   
     return filteredData.reduce((acc, item) => {
      if (!acc[item.category_type]) {
        acc[item.category_type] = [];
      }
      acc[item.category_type].push(item);
      return acc;
    }, {});
  }

  updateFormWithOrganizedData(organizedData: any) {
    const dailyArray = this.overTimeForm.get('daily') as FormArray;
    dailyArray.clear();  // Clear previous values if any

    Object.values(organizedData).forEach((data:any)=>{
        // if(day.category_type=='1'){
        data.forEach(day=>{
          dailyArray.push(this._formBuilder.group({
            name: new FormControl(day.name),
            isOvertimeChecked: new FormControl(false),
            overtime: new FormControl({ value: '', disabled: true }),
            isDoubleTimeChecked: new FormControl(false),
            doubleTime: new FormControl({ value: '', disabled: true }),
            id : new FormControl(null),
            category : new FormControl(day.category_type),
            remarks : new FormControl(day.remark),
            category_id: new FormControl(day.id)
          }));
        })
    })
  }

  setCompensation(idx:number){
    this.selectedCompensationType =idx;
  }


  onSubmit() {
    if (this.shiftDifferentialForm.valid) {
      console.log(this.shiftDifferentialForm.value);
      // Handle form submission logic
    } else {
      console.log('Form is invalid');
    }
  }

  
  toggle() {
    this.showSidebar = !this.showSidebar;
  }


  getShiftDetails(){
    let obj={
      accountid:this.tp_account_id.toString(),
      keyword:'',
      action:'shift_list'
    }
    this.shiftSettingService.getShiftDetails(obj).subscribe((res:any)=>{
      let decryptData=JSON.parse(this._EncrypterService.aesDecrypt(res.commonData))
      this.shiftDetails=decryptData?.data
    })
  }

  getOTRuleMaster(){
    this._faceCheckinService.getemployeeList({
      "action": "otrule_category_type",
      "customeraccountid": this.tp_account_id,
      "organization_unitid": this.otId,
      "emp_code": "",
      "keyword": "",
      "fromdate": "",
      "todate": ""
    }).subscribe((resData:any)=>{
      if(resData.statusCode){
        this.OtRules = JSON.parse(this._EncrypterService.aesDecrypt(resData.commonData));
        const organizedData = this.filterAndOrganizeData(this.OtRules);
        
        this.updateFormWithOrganizedData(organizedData);
        
        this.getOtRulebyId();
      }else{
        this.OtRules=[];
      }
    })
  }

  getOtRulebyId(){

    this._faceCheckinService.getemployeeList({
      "action": "get_ot_rule_data",
      "customeraccountid": this.tp_account_id,
      "organization_unitid": this.otId,
      "emp_code": "",
      "keyword": "",
      "fromdate": "",
      "todate": ""
    }).subscribe((resData:any)=>{
      if(resData.statusCode){
        // console.log(JSON.parse(this._EncrypterService.aesDecrypt(resData.commonData)));
        let data= JSON.parse(this._EncrypterService.aesDecrypt(resData.commonData))[0];
        this.currentOtRule = JSON.parse(this._EncrypterService.aesDecrypt(resData.commonData));
        this.overTimeForm.patchValue({
          overtimeRate: data.overtime_rate,
          doubleTimeRate: data.double_time_rate,
          shift_id : data.shift_id
        });
      
        const daysArray = this.overTimeForm.get('daily') as FormArray;
        
        this.currentOtRule.forEach(item => {
          // Find the index of the FormGroup that has the matching id
          let index = daysArray.controls.findIndex(group => group.get('name').value === item.category_type_name);
         
          if (index !== -1) {
            const formGroup = daysArray.at(index) as FormGroup;

            // Determine if the controls should be enabled or disabled
            const isOvertimeChecked = item.after_overtime_hours > 0;
            const isDoubleTimeChecked = item.after_doubletime_hours > 0;
          
            // Patch the FormGroup with the new data
            formGroup.patchValue({
              name: item.category_type_name, // Update according to the relevant field if needed
              isOvertimeChecked: isOvertimeChecked,
              overtime: item.after_overtime_hours,
              isDoubleTimeChecked: isDoubleTimeChecked,
              doubleTime: item.after_doubletime_hours,
              id: item.id,
              category: item.category_type,
            });
        
            // Enable or disable controls based on their values
            if (isOvertimeChecked) {
              formGroup.get('overtime').enable();
            } else {
              formGroup.get('overtime').disable();
            }

            if (isDoubleTimeChecked) {
              formGroup.get('doubleTime').enable();
            } else {
              formGroup.get('doubleTime').disable();
            }

            // Ensure the checkbox controls are updated as well
            formGroup.get('isOvertimeChecked').setValue(isOvertimeChecked);
            formGroup.get('isDoubleTimeChecked').setValue(isDoubleTimeChecked);
          }

        })

      }
    })
  }

  saveOtForm(idx:any):any{
    let array= this.overTimeForm.controls.daily as FormArray;
    let day=[];
    let isPolicySelected :boolean= false;
    let overTimeHour: (number | null)[] = new Array(12).fill(null);
    let doubleTimeHour: (number | null)[] = new Array(12).fill(null);
    let action: string[] = new Array(12).fill('insert');
    for (let idx = 0; idx < array.controls.length; idx++) {
      let element = array.controls[idx];
      day[idx] = (element as FormGroup).value;
  
      if (day[idx].id) {
          action[idx] = 'update';
      }
  
      if (day[idx].isOvertimeChecked) {
        isPolicySelected = true;
          if (day[idx].overtime) {
              overTimeHour = day[idx].overtime;
          } else {
              this.toastr.error('Checkbox checked but hours not entered', 'Oops');
              return; // This will exit the function
          }
      }
  
      if (day[idx].isDoubleTimeChecked) {
          isPolicySelected = true;
          if (day[idx].doubleTime) {
              doubleTimeHour = day[idx].doubleTime;
          } else {
              this.toastr.error('Checkbox checked but hours not entered', 'Oops');
              return; // This will exit the function
          }
      }
  }
  
  if(!isPolicySelected){
    return this.toastr.error("Please select at least one policy.");
  }
    // console.log(day);
    // return
    if(!this.overTimeForm.value.shift_id){
      return this.toastr.error("Shift is mandatory.")
    }

    if(this.overTimeForm.value.overtimeRate=='0'){
      return this.toastr.error("Overtime rate cannot be zero.");
    }

    if(this.overTimeForm.value.doubleTimeRate=='0'){
      return this.toastr.error("Doubletime rate cannot be zero.");
    }



    // if()
    let postData ={
      action :action,
      customerAccountId : this.tp_account_id.toString(),
      otRuleid: this.otId,
      ot_rule_name : this.pageHead,
      overtimeRate : this.overTimeForm.value.overtimeRate ? this.overTimeForm.value.overtimeRate : null,
      doubleTimeRate : this.overTimeForm.value.doubleTimeRate ? this.overTimeForm.value.doubleTimeRate :null,
      shiftid : this.overTimeForm.value.shift_id,
      days: day
      // id:day.id,
      // afterOvertimeHours : overTimeHour,
      // afterDoubleTimeHours : doubleTimeHour,
      // otRemarks : day.remarks,
      // categoryTypeName : day.name,
      // categoryType : day.category,
      // categoryId : day.category_id
    }

    if(!postData.overtimeRate && !postData.doubleTimeRate){
      return this.toastr.error("Overtime rate is mandatory.")
    }
  
    this._AttendanceService.saveEditOtRules(postData).subscribe((resData:any)=>{
      if(resData.statusCode){
        this.toastr.success('OT rules saved successfully');
        this.getOtRulebyId();
        // this.hideOTRule();
      }else{
        this.toastr.error(resData.message);
      }
    })
  }

  setShiftType(shiftType:string){
    this.shiftType=shiftType;
  }

  setDayType(type:string){
    this.dayType=type;
  }
}
