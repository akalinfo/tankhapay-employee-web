import { Component} from '@angular/core';
import { AttendanceService } from '../attendance.service';
import { SessionService } from 'src/app/shared/services/session.service';
import decode from 'jwt-decode';
import { ToastrService } from 'ngx-toastr';
import { FormBuilder, FormGroup } from '@angular/forms';
import { dongleState, grooveState } from 'src/app/app.animation';
import { DatePipe } from '@angular/common';
import { FaceCheckinService } from '../face-checkin.service';
import { EncrypterService } from 'src/app/shared/services/encrypter.service';
declare var $:any;

@Component({
  selector: 'app-tea-allowance',
  templateUrl: './tea-allowance.component.html',
  styleUrls: ['./tea-allowance.component.css'],
  animations : [grooveState,dongleState],
  providers: [DatePipe]
})
export class TeaAllowanceComponent {
  showSidebar: boolean=true;
  teaAllowanceList : any=[];
  tp_account_id: any;
  token: any;
  product_type : any;
  isAddEditAllow : boolean =false;
  teaAllowanceForm : FormGroup;
  per_day:any;
  dropdownSettings : any={};
  action :any='';
  dayList : any = [{day :'Monday'}, {day :'Tuesday'}, {day :'Wednesday'}, {day :'Thursday'}, {day :'Friday'}, {day :'Saturday'}, {day :'Sunday'},{day :'Holiday'}]

  constructor( private _attendanceService : AttendanceService,
    private _sessionService : SessionService,
    private toastr : ToastrService,
    private datePipe:DatePipe,
    private _fb : FormBuilder,
    private _faceCheckinService : FaceCheckinService,
    private _e : EncrypterService
  ){}
  ngOnInit(){
    let session_obj_d: any = JSON.parse(
    this._sessionService.get_user_session());
    this.token = decode(session_obj_d.token);
    this.tp_account_id = this.token.tp_account_id;
    this.product_type = localStorage.getItem('product_type');

    this.dropdownSettings = {
      singleSelection: false,
      idField: 'day',
      textField: 'day',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 3,
      allowSearchFilter: true
    };

    this.teaAllowanceForm = this._fb.group({
      hours_from : [''],
      hours_to : [''],
      dayType : [''],
      rate: [''],
      effectiveFrom: [''],
      effectiveTo : [''],
      id: ['']
    })
    this.getAllowaneList();
  }

  toggle() {
    this.showSidebar = !this.showSidebar;
  }

  getAllowaneList(){
    this._faceCheckinService.getemployeeList({'action':'tea_allowance_rate','customeraccountid': this.tp_account_id,
      "organization_unitid": "",
      "emp_code": "",
      "keyword": "",
      "fromdate": "",
      "todate": "",
      "index": 0,
      "pagesize": 100
    }).subscribe((resData:any)=>{
      if(resData.statusCode){
        this.teaAllowanceList = JSON.parse(this._e.aesDecrypt(resData.commonData));
      }else{
        this.toastr.error(resData.message);
      }
    })
  }

  formatTime(time) {
    // Separate hours and fractional part (minutes)
    let hours = Math.floor(time);
    
    let minutes = (time.toString().split('.')[1] ? time.toString().split('.')[1] : '0');
       
    // Pad the values with zeroes if necessary
    let formattedHours = String(hours).padStart(2, '0');
    let formattedMinutes = minutes == 0 ? '00' : (minutes < 6  && minutes.toString().length==1 ? String(minutes * 10) : String(minutes));
    return `${formattedHours}:${formattedMinutes}`;
  }

  showAddEditModal(action:any,data:any={}){
    this.isAddEditAllow=true;
    this.action = action;

    if(action =='update'){
      this.teaAllowanceForm.patchValue({
        hours_from : (data.hours_range_from),
        hours_to : (data.hours_range_to),
        dayType : data.daytype.split(',').map(day => ({ day: day.trim() })),
        rate: data.rate,
        id: data.id,
        effectiveFrom: data.effectivefrom.split('-').reverse().join('/'),
        effectiveTo : data.effectiveto.split('-').reverse().join('/'),
      })
    }
    
    $('#effectivefrom').datepicker({
      dateFormat: 'dd/mm/yy',
      changeMonth: true,
      changeYear: true,
    })
    $('#effectiveto').datepicker({
      dateFormat: 'dd/mm/yy',
      changeMonth: true,
      changeYear: true,
    })
  }

  hideModal(){
    this.isAddEditAllow =false;
    this.teaAllowanceForm.reset();
    this.action='';
  }

  submitForm(data:any={}):any{
    if(this.action){
      if(!this.teaAllowanceForm.controls.hours_from.value){
        return this.toastr.error('Please select the hour from.');
      }
      if(!this.teaAllowanceForm.controls.hours_to.value){
        return this.toastr.error('Please select the hour to.');
      }
      if(!this.teaAllowanceForm.controls.dayType.value){
        return this.toastr.error('Please select the day type.');
      }
      if(!this.teaAllowanceForm.controls.rate.value){
        return this.toastr.error('Please enter the tea allowance rate.');
      }
      if(!$('#effectivefrom').val()){
        return this.toastr.error('Please select the effective from date.');
      }
      if(!$('#effectiveto').val()){
        return this.toastr.error('Please select the effective to date.');
      }
      
      let from_dt = new Date($('#effectivefrom').val().split('/').reverse().join('-'));
      let to_dt = new Date($('#effectiveto').val().split('/').reverse().join('-'));

      if(from_dt > to_dt){
        return this.toastr.error('Effective From date should not be later than Effective To date.');
      }

      this.teaAllowanceForm.patchValue({
        effectiveFrom: $('#effectivefrom').val(),
        effectiveTo : $('#effectiveto').val()
      })
    }else{
      if(!confirm('Are you sure you want to delete this record ?')){
        return;
      }

      this.teaAllowanceForm.patchValue({
        id: data.id
      })
    }


    let postData = {
      ...this.teaAllowanceForm.value,
      dayType : !this.teaAllowanceForm.value.dayType ? '' : this.teaAllowanceForm.value.dayType?.map(item => item.day).join(', '),
      customerAccountid : this.tp_account_id,
      action : !this.action ? 'delete': this.action,
      hours_from : this.teaAllowanceForm.value.hours_from,
      hours_to : this.teaAllowanceForm.value.hours_to,
      effectiveFrom : this.teaAllowanceForm.value.effectiveFrom?.split('/').reverse().join('/'),
      effectiveTo : this.teaAllowanceForm.value.effectiveTo?.split('/').reverse().join('/')
    }
    this._attendanceService.tea_allowance_rate(postData).subscribe((resData:any)=>{
      if(resData.statusCode){
        this.toastr.success(resData.message);
        this.getAllowaneList();
        this.hideModal();
      }else{
        this.toastr.error(resData.message);
      }
    })
    console.log(this.teaAllowanceForm.value);
    return

    
  }

  onItemSelect(event:any){
    
  }
  onSelectAll(event:any){

  }
  onUnselectAll(event:any){

  }
  onItemUnselect(event:any){

  }
}
