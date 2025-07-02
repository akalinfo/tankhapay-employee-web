import { ChangeDetectorRef, Component, ElementRef, ViewChild} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import jwtDecode from 'jwt-decode';
import { SessionService } from 'src/app/shared/services/session.service';
import { EncrypterService } from 'src/app/shared/services/encrypter.service';
import { ShiftRotationService } from '../shift-rotation.service';
import { ShiftDetailService } from '../shift-detail.service';
import { ShiftSpecificService } from '../shift-specific-service';
import { EmployeeShiftMappingService } from '../employee-shift-mapping.service';
import { ToastrService } from 'ngx-toastr';
import { GlobalConstants } from 'src/app/shared/global-constants';
import { AlertService } from 'src/app/shared/_alert';
import { DatePipe } from '@angular/common';

declare var $: any;

@Component({
  selector: 'app-employee-shift-mapping',
  templateUrl: './employee-shift-mapping.component.html',
  styleUrls: ['./employee-shift-mapping.component.css'],
  providers: [DatePipe]

})
export class EmployeeShiftMappingComponent {

public showSidebar: boolean = true;
public addEmployeeShiftMappingForm:FormGroup
tp_account_id: any;
decoded_token: any;
breakDetails: any;
popupType: any;
userList: any;
product_type: any;
GeoFenceId: any;
dropdownSettings = {};
selectedItems: any=[];
shiftDetails: any;
@ViewChild('timePickerInput') timePickerInput: ElementRef;
  shiftmappingList: any;
  delete_shift_map_id: any;
  shift_mapping_id: any;
  decodedeToken: any;


constructor(private fb:FormBuilder,private shiftRottionService:ShiftRotationService,private _sessionService:SessionService,
  private encriptedService:EncrypterService,private cdr: ChangeDetectorRef,private shiftSettingService:ShiftSpecificService,
  private empShiftMappingService:EmployeeShiftMappingService,private toastr:ToastrService,private shiftService:ShiftDetailService,
  private _alertservice:AlertService,private datePipe:DatePipe
) {

  this.addEmployeeShiftMappingForm=this.fb.group({
    shift_id:["",Validators.required],
    applicable_for:["",Validators.required],
    from_date:["",Validators.required],
    to_date:["",Validators.required],
    reason:["",Validators.required],
    update_past_attendance:[""],
  })

 }

 checkPopupType(val){
  this.popupType=val
  if(val== 'addEmployeeShiftMapping'){
  }
}


ngOnInit(): void {
  let session_obj = this._sessionService.get_user_session();
  let token = JSON.parse(session_obj).token;
  this.decoded_token = jwtDecode(token);
  this.decodedeToken=this.decoded_token.id
  this.product_type = this.decoded_token.product_type;
  this.GeoFenceId= this.decoded_token.geo_location_id
  this.tp_account_id = this.decoded_token.tp_account_id;

  this.getUserList();
  this.getShiftDetails();
  this.getEmployeeShiftmapping();
}


formatDateDisplay(value: string): string {
  return this.datePipe.transform(value, 'dd-MM-yyyy');
}
///////////////////////////////////////////////////



isFromDateLessThanToDate(): boolean {
  const fromDate = this.addEmployeeShiftMappingForm.get('from_date').value;
  const toDate = this.addEmployeeShiftMappingForm.get('to_date').value;
  return fromDate < toDate;
}


//////////////////////////////////////////////////////



submitShiftMapping(){
if(this.addEmployeeShiftMappingForm.invalid){
  return this.addEmployeeShiftMappingForm.markAllAsTouched();
}else{
  let obj={
    action:(this.popupType =='addEmployeeShiftMapping')?'shiftmapping':'update_shiftmapping',
    shiftmapping_id:(this.popupType =='addEmployeeShiftMapping') ? '' : this.shift_mapping_id.toString(),
    customeraccountid: this.tp_account_id.toString(),
    shift_id:this.addEmployeeShiftMappingForm.value.shift_id,
    applicable_for:this.addEmployeeShiftMappingForm.value.applicable_for,
    applicable_type:'',
    from_time:this.addEmployeeShiftMappingForm.value.from_date,
    to_time:this.addEmployeeShiftMappingForm.value.to_date,
    reason:this.addEmployeeShiftMappingForm.value.reason,
    is_update_past_attendance_entries:(this.addEmployeeShiftMappingForm.value.update_past_attendance)?'Y':'N',
    userby:this.decodedeToken.toString(),
    userip:"::1",
  }

    this.empShiftMappingService.saveShiftMapping(obj).subscribe((res:any)=>{

    if(res.statusCode){
      this.addEmployeeShiftMappingForm.reset();
     this.getEmployeeShiftmapping()
     this.toastr.success(res.message);
     this.addEmployeeShiftMappingForm.reset()
    }else{
    this.toastr.error(res?.message);
    let decryptData=JSON.parse(this.encriptedService.aesDecrypt(res.commonData))
    }

  })
}
}


formatDatePatch(inputDate) {
  const date = new Date(inputDate);
  const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
  return formattedDate;
}

patchData(bigData,smallData){


    this.shift_mapping_id=smallData.shiftmapping_id

      let applicable_for=[{
        emp_code:bigData.emp_code.toString(),
        emp_name:bigData.emp_name
      }]

      this.addEmployeeShiftMappingForm.patchValue({
        applicable_for:applicable_for,
        shift_id: smallData?.shift_name_id,
        from_date: this.formatDatePatch(smallData?.dt_from),
        to_date: this.formatDatePatch(smallData?.dt_to),
        reason:smallData?.reason,
        update_past_attendance:smallData?.is_update_past_attendance_entries,
      })


}

toggle() {
  this.showSidebar = !this.showSidebar;
}

cancelForm(){
  this.addEmployeeShiftMappingForm.reset()
}


async getShiftDetails(){
  let obj={
    accountid:this.tp_account_id.toString(),
    keyword:'',
    action:'shift_list'
  }
  await this.shiftSettingService.getShiftDetails(obj).subscribe((res:any)=>{
    let decryptData=JSON.parse(this.encriptedService.aesDecrypt(res.commonData))
    this.shiftDetails=decryptData?.data
  })
}


async getEmployeeShiftmapping(){
  let obj={
      action:"get_shiftmapping_list",
      accountid:this.tp_account_id.toString(),
      keyword:""
    }
  
  await this.empShiftMappingService.getEmployeeShiftMapping(obj).subscribe((res:any)=>{
    let decryptData=JSON.parse(this.encriptedService.aesDecrypt(res.commonData))
    this.shiftmappingList=decryptData?.data
  })

}


async getUserList(){
  let obj=
  {
   customeraccountid:this.tp_account_id.toString(),
   productTypeId:this.product_type,
   GeoFenceId:this.GeoFenceId
}
   await this.shiftSettingService.getUserList(obj
    ).subscribe((res:any)=>{
    if(res.statusCode){
      this.userList=[];
    let userList=res.commonData
    userList.map((item)=>{
      item.emp_name = item.emp_name + ` (${item.orgempcode!=''? item.orgempcode : (item.tpcode ? item.tpcode : item.emp_code)})`
      if(item.joiningstatus.trim() == 'Active' && item.dateofrelieveing ==''){
        this.userList.push(item)
      }
      })

      this.dropdownSettings = {
        singleSelection: false,
        idField: 'emp_code',
        textField: 'emp_name',
        selectAllText: 'Select All',
        unSelectAllText: 'UnSelect All',
        itemsShowLimit: 3,
        allowSearchFilter: true
      };
}else{

}
})

}



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



openDeleteModal(id:any){
  this.delete_shift_map_id=id
}


deleteShiftMapping(){
  let obj={
     action:"delete_shiftmapping",
     row_id:this.delete_shift_map_id.toString(),
     customeraccountid:this.tp_account_id.toString(),
     status:"0",
     userby:this.tp_account_id.toString(),
}

  this.shiftService.deleteShiftDetails(obj).subscribe((res:any)=>{
    if(res.statusCode){
      this.toastr.success("Deleted succesfully")
      // this._alertservice.success(res.message, GlobalConstants.alert_options);
      this.getEmployeeShiftmapping()
    }else{
      this.toastr.error(res?.message)
    }
  })
}





}