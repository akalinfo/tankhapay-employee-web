import { ChangeDetectorRef, Component, ElementRef, ViewChild} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import jwtDecode from 'jwt-decode';
import { SessionService } from 'src/app/shared/services/session.service';
import { BreakService } from '../break.service ';
import { EncrypterService } from 'src/app/shared/services/encrypter.service';
import { ToastrService } from 'ngx-toastr';
import { ShiftSpecificService } from '../shift-specific-service';
import { ShiftDetailService } from '../shift-detail.service';
import { DatePipe } from '@angular/common';

declare var $: any;

@Component({
  selector: 'app-break',
  templateUrl: './break.component.html',
  styleUrls: ['./break.component.css'],
  providers: [DatePipe],

})
export class BreakComponent {

  @ViewChild('iconImages') iconImages: ElementRef[];

  icons: string[] = [
    '../../../../assets/img/icon-11.png',
    '../../../../assets/img/icon-12.png',
    '../../../../assets/img/icon-13.png',
    '../../../../assets/img/icon-14.png',
    '../../../../assets/img/icon-15.png',
    '../../../../assets/img/icon-16.png',
    '../../../../assets/img/icon-17.png'
  ];

public showSidebar: boolean = true;
public addBreakForm:FormGroup
tp_account_id: any;
decoded_token: any;
  breakDetails: any;
  popupType: any;
  selectedImagePath: any;
  totalTime: any;
  checkMsg: string;
  shiftDetails: any;
  delete_break_id: any;
  edit_break_id: any;

////////////////////////////
startTime:any;
endTime:any;

@ViewChild('popoverContentStartTime') popoverContentStartTime: ElementRef<HTMLElement>;
@ViewChild('popoverStartTime') popoverStartTime: ElementRef<HTMLElement>;

@ViewChild('popoverContentEndTime') popoverContentEndTime: ElementRef<HTMLElement>;
@ViewChild('popoverEndTime') popoverEndTime: ElementRef<HTMLElement>;
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
  this.addBreakForm.controls[controlName].setValue(formattedTime);
}



constructor(private fb:FormBuilder,private breakService:BreakService,private _sessionService:SessionService,private shiftService:ShiftDetailService,
  private encriptedService:EncrypterService,private cdr: ChangeDetectorRef,private toastr:ToastrService,private shiftSettingService:ShiftSpecificService,
  private datePipe:DatePipe
) {

  this.addBreakForm=this.fb.group({
    name:["",Validators.required],
    payType:["",Validators.required],
    mode:["",Validators.required],
    startTime:["",Validators.required],
    endTime:["",Validators.required],
    applicableShift:["",Validators.required],
  },
)

 }


 checkPopupType(val){
  this.popupType=val
  // if(val=='addBreak'){
  // }
}


private parseTimeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

// Method to calculate the break time
calculateBreakTime(fromTime: string, toTime: string): string {
  const fromMinutes = this.parseTimeToMinutes(fromTime);
  const toMinutes = this.parseTimeToMinutes(toTime);

  let diffMinutes = toMinutes - fromMinutes;

  // Handle cases where the times might be on different days
  if (diffMinutes < 0) {
    diffMinutes += 24 * 60; // add 24 hours worth of minutes
  }

  const diffHours = Math.floor(diffMinutes / 60);
  const remainingMinutes = diffMinutes % 60;

  return `${diffHours} hours, ${remainingMinutes} minutes`;
}



ngOnInit(): void {
  let session_obj = this._sessionService.get_user_session();
  let token = JSON.parse(session_obj).token;
  this.decoded_token = jwtDecode(token);
  this.decodedeToken=this.decoded_token.id
  this.tp_account_id = this.decoded_token.tp_account_id;
  this.getBreakDetails();
  this.getShiftDetails();

  this.addBreakForm.get('startTime').valueChanges.subscribe(() => {
    this.calculateTotalTime();
  });

  this.addBreakForm.get('endTime').valueChanges.subscribe(() => {
    this.calculateTotalTime();
  });
}


ngAfterViewInit() {
  if (this.iconImages) {
    const iconSrcs = this.iconImages?.map(icon => icon.nativeElement.src);
  }
}

async getBreakDetails(){
  let obj={
    action:'get_att_break_list',
    accountid:this.tp_account_id.toString(),
    keyword:''
  }
   await this.breakService.getBreakDetails(obj).subscribe((res:any)=>{
    let decryptData=JSON.parse(this.encriptedService.aesDecrypt(res.commonData))
    this.breakDetails=decryptData.data
  })
}


submitBreakData(){
if(this.addBreakForm.invalid){
  return this.addBreakForm.markAllAsTouched();
}else{
  let obj={
    action:(this.popupType=='addBreak')?'save_att_break':'update_att_break',
    customeraccountid: this.tp_account_id.toString(),
    icon:(this.selectedImagePath)?this.selectedImagePath:'',
    break_name:this.addBreakForm.value.name,
    pay_type:this.addBreakForm.value.payType,
    break_mode:this.addBreakForm.value.mode,
    from_time:this.addBreakForm.value.startTime,
    to_time:this.addBreakForm.value.endTime,
    applicable_shift:this.addBreakForm.value.applicableShift.toString(),
    userby:this.decodedeToken.toString(),
    userip:"::1",
    break_id:(this.popupType=='addBreak')?'':this.edit_break_id.toString(),
  }
  this.breakService.saveBreakDetails(obj).subscribe((res:any)=>{
    this.addBreakForm.reset()
    if(res.statusCode){
      this.toastr.success(res.message)
      this.getBreakDetails();
    }else{
      this.toastr.error(res.message)
      let decryptData=JSON.parse(this.encriptedService.aesDecrypt(res.commonData))
    }
  })

}

}

patchData(val){
  this.edit_break_id=val?.break_id
  this.addBreakForm.patchValue({
    name:val.break_name,
    payType:val.pay_type,
    mode:val.break_mode,
    startTime:this.timeMange(val.from_time),
    endTime:this.timeMange(val.to_time),
    applicableShift:val.applicable_shift,
  })
}

toggle() {
  this.showSidebar = !this.showSidebar;
}

selectIcon(event: any) {
  this.selectedImagePath = event
}

timeMange(val){
  let time=[]
  time=val?.split(":")
  return time[0]+":"+time[1]
}

cancelForm(){
  this.addBreakForm.reset()
  this.totalTime='';
  this.checkMsg=''
}

calculateTotalTime() {
  const startTime = this.addBreakForm.get('startTime').value;
  const endTime = this.addBreakForm.get('endTime').value;
  if (startTime && endTime) {
    this.totalTime = this.breakService.calculateTotalTime(startTime, endTime);
  }
}

// isFromTimeLessThanToTime(){
//   const startTime = this.addBreakForm.get('startTime').value;
//   const endTime = this.addBreakForm.get('endTime').value;
//   if (startTime && endTime) {
//     this.checkMsg = this.breakService.isFromTimeLessThanToTime(startTime, endTime);
//   }
// }

async getShiftDetails(){
  let obj={
    accountid:this.tp_account_id.toString(),
    keyword:'',
    action:'shift_list'
  }
  await this.shiftSettingService.getShiftDetails(obj).subscribe((res:any)=>{
    let decryptData=JSON.parse(this.encriptedService.aesDecrypt(res.commonData))
    this.shiftDetails=decryptData.data
  })
}


openDeleteModal(id:any){
  this.delete_break_id=id
}


deleteBreak(){
  let obj={
     action:"delete_att_break",
     row_id:this.delete_break_id.toString(),
     customeraccountid:this.tp_account_id.toString(),
     status:"0",
     userby:this.tp_account_id.toString(),
}

  this.shiftService.deleteShiftDetails(obj).subscribe((res:any)=>{
    if(res.statusCode){
      this.toastr.success("Deleted succesfully")
      this.getBreakDetails();
    }else{
      let decryptData= JSON.parse(this.encriptedService.aesDecrypt(res.commonData))
      this.toastr.error(decryptData?.message)
    }
  })
}


updateStatus(event:any,id:any){
  let status=event.target.checked;
  let obj={
     action:"update_status_att_break",
     row_id:id.toString(),
     customeraccountid:this.tp_account_id.toString(),
     status:(status==true)?'1':'0',
     userby:this.tp_account_id.toString(),
}

  this.shiftService.deleteShiftDetails(obj).subscribe((res:any)=>{
    if(res.statusCode){
      this.toastr.success("Updated succesfully")
    }else{
      let decryptData= JSON.parse(this.encriptedService.aesDecrypt(res.commonData))
      this.toastr.error(decryptData?.message)
    }
  })

}



}