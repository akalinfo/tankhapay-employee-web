import { Component, ElementRef, ViewChild} from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ShiftDetailService } from '../shift-detail.service';
import jwtDecode from 'jwt-decode';
import { SessionService } from 'src/app/shared/services/session.service';
import { EncrypterService } from 'src/app/shared/services/encrypter.service';
import { ToastrService } from 'ngx-toastr';
import { PopoverDirective } from 'ngx-bootstrap/popover';
import { DatePipe } from '@angular/common';

declare var $: any;

@Component({
  selector: 'app-shift-details',
  templateUrl: './shift-details.component.html',
  styleUrls: ['./shift-details.component.css'],
  providers: [DatePipe],

})
export class ShiftDetailsComponent {

public showDropdown: boolean = false;
public showSidebar: boolean = true;
public showNewDevicePopup: boolean = false;
device_popup_title:any = '';

public addShiftForm:FormGroup
shift_margin:any = 'Disable';
shift_allowance: any = 'Disable';
weekend:any = 'Disable';
dropdownOpen = false;
selectedText = 'None selected';

myTime:any;



// myTime: Date = new Date();


items= [
  { name: 'All', value: 0 },
  { name: 'HR', value: 1 },
  { name: 'Marketing', value: 2 },
  { name: 'Management', value: 3 },
  { name: 'IT', value: 4 }
];

selectedItems:any = [];
shiftDetails: any;
@ViewChild('hd') hdate: ElementRef;

  unique: any=[];
  tp_account_id: any;
  decoded_token: any;

  popupType: any;
  shiftDetailsError: any;
  departmentList: any;
  editShift_id: any;

  showFilter=false;
  limitSelection=false;


  selectedItems12:any=[];
  dropdownSettings:any={};
  disabled=false;
  cities:any=[]

  /////////////////////////////////
   from;
   to;
   shift_margin_hours_from;
   shift_margin_hours_to;

  /////////////////////////////////
    
  weekData = [
    {
      day: 'Sunday',
      selected: false,
      showDropdown:false,
      selections: [
        { value: 0, selected: false, dropdownValue: 0 },
        { value: 1, selected: false, dropdownValue: 0 },
        { value: 2, selected: false, dropdownValue: 0 },
        { value: 3, selected: false, dropdownValue: 0 },
        { value: 4, selected: false, dropdownValue: 0 },
      ],
    },
    {
      day: 'Monday',
      selected: false,
      showDropdown:false,
      selections: [
        { value: 0, selected: false, dropdownValue: 0 },
        { value: 1, selected: false, dropdownValue: 0 },
        { value: 2, selected: false, dropdownValue: 0 },
        { value: 3, selected: false, dropdownValue: 0 },
        { value: 4, selected: false, dropdownValue: 0 },
      ]
    },
    {
      day: 'Tuesday',
      selected: false,
      showDropdown:false,
      selections: [
        { value: 0, selected: false, dropdownValue: 0 },
        { value: 1, selected: false, dropdownValue: 0 },
        { value: 2, selected: false, dropdownValue: 0 },
        { value: 3, selected: false, dropdownValue: 0 },
        { value: 4, selected: false, dropdownValue: 0 },
      ]
    },
    {
      day: 'Wednesday',
      selected: false,
      showDropdown:false,
      selections: [
        { value: 0, selected: false, dropdownValue: 0 },
        { value: 1, selected: false, dropdownValue: 0 },
        { value: 2, selected: false, dropdownValue: 0 },
        { value: 3, selected: false, dropdownValue: 0 },
        { value: 4, selected: false, dropdownValue: 0 },
      ]
    },
    {
      day: 'Thursday',
      selected: false,
      showDropdown:false,
      selections: [
        { value: 0, selected: false, dropdownValue: 0 },
        { value: 1, selected: false, dropdownValue: 0 },
        { value: 2, selected: false, dropdownValue: 0 },
        { value: 3, selected: false, dropdownValue: 0 },
        { value: 4, selected: false, dropdownValue: 0 },
      ]
    },
    {
      day: 'Friday',
      selected: false,
      showDropdown:false,
      selections: [
        { value: 0, selected: false, dropdownValue: 0 },
        { value: 1, selected: false, dropdownValue: 0 },
        { value: 2, selected: false, dropdownValue: 0 },
        { value: 3, selected: false, dropdownValue: 0 },
        { value: 4, selected: false, dropdownValue: 0 },
      ]
    },
    {
      day: 'Saturday',
      selected: false,
      showDropdown:false,
      selections: [
        { value: 0, selected: false, dropdownValue: 0 },
        { value: 1, selected: false, dropdownValue: 0 },
        { value: 2, selected: false, dropdownValue: 0 },
        { value: 3, selected: false, dropdownValue: 0 },
        { value: 4, selected: false, dropdownValue: 0 },
      ]
    },
  ];
  checkMsg: any;
  delete_shift_id: any;
  
  @ViewChild('popoverContentFrom') popoverContentFrom: ElementRef<HTMLElement>;
  @ViewChild('popoverContentTo') popoverContentTo: ElementRef<HTMLElement>;
  @ViewChild('popoverShiftMarginFrom') popoverShiftMarginFrom: ElementRef<HTMLElement>;
  @ViewChild('popoverShiftMarginTo') popoverShiftMarginTo: ElementRef<HTMLElement>;
  @ViewChild('popoverFrom') popoverFrom: PopoverDirective;
  @ViewChild('popoverTo') popoverTo: PopoverDirective;
  @ViewChild('popoverShiftMFrom') popoverShiftMFrom: PopoverDirective;
  @ViewChild('popoverShiftMTo') popoverShiftMTo: PopoverDirective;
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
    this.addShiftForm.controls[controlName].setValue(formattedTime);
  }
  
  

constructor(private fb:FormBuilder,private shiftService:ShiftDetailService,private _sessionService: SessionService,
 private encriptedService:EncrypterService,private toastr:ToastrService,private datePipe: DatePipe
) { 

  this.addShiftForm=this.fb.group({
    shift_name:["sv2",Validators.required],
    from:["",Validators.required],
    to:["",Validators.required],
    shift_margin:["",Validators.required],
    shift_margin_hours_from:[""],
    shift_margin_hours_to:[""],
    weekend:["",Validators.required],
    half_working_day:[""],
    shift_allowance:["",Validators.required],
    rate_per_day:[""],
    applicable_from:[""] 
  })
  
 

    //////////////////// Subscribe to changes in the 'shift_margin' control///////////////////

    this.addShiftForm.get('shift_margin').valueChanges.subscribe(value => {
      const shiftMarginHoursFromControl = this.addShiftForm.get('shift_margin_hours_from');
      const shiftMarginHoursToControl = this.addShiftForm.get('shift_margin_hours_to');
      
      if (value === 'Enable') {
        shiftMarginHoursFromControl.setValidators(Validators.required);
        shiftMarginHoursToControl.setValidators(Validators.required);
      } else {
        shiftMarginHoursFromControl.clearValidators();
        shiftMarginHoursToControl.clearValidators();
      }
      
      shiftMarginHoursFromControl.updateValueAndValidity();
      shiftMarginHoursToControl.updateValueAndValidity();
    });





    //////////////////////////// shift_allowance ..////////////////////////////////


    this.addShiftForm.get('shift_allowance').valueChanges.subscribe(value => {
      const shiftAllowanceFromControl = this.addShiftForm.get('rate_per_day');
      
      if (value === 'Enable') {
        shiftAllowanceFromControl.setValidators(Validators.required);
      } else {
        shiftAllowanceFromControl.clearValidators();
      }
      shiftAllowanceFromControl.updateValueAndValidity();
    });
  

}


ngOnInit(): void {
  let session_obj = this._sessionService.get_user_session();
  let token = JSON.parse(session_obj).token;
  this.decoded_token = jwtDecode(token);
  this.decodedeToken=this.decoded_token.id

  this.tp_account_id = this.decoded_token.tp_account_id;
  this.getShiftDetails()
  this.getDepartmentList();

  // this.addShiftForm.get('from').valueChanges.subscribe(() => {
  //   this.isFromTimeLessThanToTime()
  // });

  // this.addShiftForm.get('to').valueChanges.subscribe(() => {
  //  this.isFromTimeLessThanToTime()
  // });
}


// isFromTimeLessThanToTime(){
//   const startTime = this.addShiftForm.get('from').value;
//   const endTime = this.addShiftForm.get('to').value;
//   if (startTime && endTime) {
//     this.checkMsg = this.shiftService.isFromTimeLessThanToTime(startTime, endTime);
//   }
// }

checkPopupType(val){
  this.popupType=val
  if(this.popupType=='addShift'){
    this.selectedItems=[];
  }
  
  
  this.shift_margin = '';
  this.shift_allowance = '';
  this.weekend = '';
  this.addShiftForm.reset();
  this.resetWeekData();
  this.addShiftForm.get('half_working_day').setValue('Disable');
}



getShiftMarginValue(event:any){
  this.shift_margin=event.target.value
}

getWeekend(event:any){
  this.weekend=event.target.value
}

getShiftAllowance(event:any){
  this.shift_allowance=event.target.value
}

toggleDropdown() {
  this.dropdownOpen = !this.dropdownOpen;
}


async getDepartmentList(){
  let obj={
   action:"departments_list",
   accountid:this.tp_account_id?.toString(),
   keyword:""
   }
   await this.shiftService.getDepartmentList(obj).subscribe((res:any)=>{
   let decryptData= JSON.parse(this.encriptedService.aesDecrypt(res.commonData))
   this.departmentList=decryptData.data
   this.dropdownSettings = {
    singleSelection: false,
    idField: 'id',
    textField: 'departmentname',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 3,
    allowSearchFilter: false
  };
 })
}


onItemSelect(item: any) {
  this.selectedItems.push(item);
}

onSelectAll(items: any) {
  this.selectedItems = [...items];
}

onItemUnselect(item: any) {
  this.selectedItems = this.selectedItems.filter((selectedItem) => selectedItem.id !== item.id);
}

onUnselectAll(items){
  this.selectedItems=[];
}

async getShiftDetails(){
  let obj={
    accountid:this.tp_account_id?.toString(),
    keyword:'',
    action:'shift_list'
  }
  await this.shiftService.getShiftDetails(obj).subscribe((res:any)=>{
    let decryptData=JSON.parse(this.encriptedService.aesDecrypt(res.commonData))
    this.shiftDetails=decryptData.data

    // for(let i in this.shiftDetails) {
    //   this.shiftDetails[i] = JSON.parse(this.shiftDetails[i].weekend_txt);
    //   for(let j in this.shiftDetails[i].weekend_txt) {
    //     if(this.shiftDetails[i].weekend_txt[j])
    //   }
    // }

  })
}

 submitShiftDetails(val){
  if(this.addShiftForm.invalid){
    this.addShiftForm.markAllAsTouched();
    return
  }else{
    if(this.addShiftForm.value.weekend =='Enable') {
      for(let i in this.weekData) {
        for(let j in this.weekData[i]['selections']) {
          if(this.weekData[i]['selections'][j].selected == false) {
            this.weekData[i]['selections'][j].dropdownValue = 0
          }
        }
      }
    }

    if(this.addShiftForm.get('half_working_day').value == 'Disable') {
      for(let i in this.weekData) {
        for(let j in this.weekData[i]['selections']) {
          this.weekData[i]['selections'][j].dropdownValue = 0
        }
      }
    }

    let uniqueApplicable_for = this.selectedItems.reduce((acc, obj) => {
      const existingItem = acc.find(item => item.id === obj.id);
      if (!existingItem) {
          acc.push(obj);
      }
      return acc;
    }, []);
    
  let obj={
    customeraccountid:this.tp_account_id?.toString(),
    shift_name:this.addShiftForm.value.shift_name,
    from_time:this.addShiftForm.value.from,
    to_time:this.addShiftForm.value.to,
    shift_margin:(this.addShiftForm.value.shift_margin =='Enable') ? "Y":"N",
    shift_margin_hours_from:(this.addShiftForm.value.shift_margin =='Enable' && this.addShiftForm.value.shift_margin_hours_from )?(this.addShiftForm.value.shift_margin_hours_from):null,
    shift_margin_hours_to:(this.addShiftForm.value.shift_margin =='Enable' && this.addShiftForm.value.shift_margin_hours_to)?(this.addShiftForm.value.shift_margin_hours_to):null,

    is_weekend_working_day:(this.addShiftForm.value.half_working_day=='Enable')? "Y" : "N",
    weekend_id:"0",
    weekend:(this.addShiftForm.value.weekend =='Enable') ? "shift based":'location based',

    weekend_txt: (this.addShiftForm.value.weekend =='Enable')?this.weekData:[], 
    is_shift_allowance:(this.addShiftForm.value.shift_allowance=='Enable') ? "Y":"N",
    rate_per_day:( this.addShiftForm.value.shift_allowance=='Enable' && this.addShiftForm.value.rate_per_day)?this.addShiftForm.value.rate_per_day?.toString():null,
    applicable_for: uniqueApplicable_for,
    userby:this.decodedeToken?.toString(),
    userip:"::1",
    action:(val=='addShift')?'save_new_shifts':'update_shift',
    shift_id:(val=='addShift')?'':this.editShift_id?.toString()
  }


  this.shiftService.saveShiftDetails(obj).subscribe((res:any)=>{
    if(res.statusCode){
      this.toastr.success(res.message);
      this.addShiftForm.reset()
      this.getShiftDetails()
    }else{
      let decryptData=(this.encriptedService.aesDecrypt(res.commonData))
      this.shiftDetailsError=decryptData
      this.toastr.error(res.message);
    }
  })
  }

}

patchShiftDetails(id,val){
this.resetWeekData()
 this.popupType=val;
 this.editShift_id=id
 let shift_id=id
 this.shiftDetails.filter((item)=>{
  if(item.shift_id==shift_id){
   let from_time=this.timeMange(item?.from_time)

    this.shift_margin = (item?.shift_margin=='Y')?'Enable':'Disable'
    this.shift_allowance = (item?.is_shift_allowance=='Y')?'Enable':'Disable';
    this.weekend = (item?.weekend=='shift based')?'Enable':'Disable' ;
    this.weekData = (this.weekend=='Enable')?JSON.parse(item?.weekend_txt):this.weekData;
    // let weekend_full=JSON.parse(item.weekend_txt)
    let applicable_from=JSON.parse(item.applicable_for)
    this.selectedItems=applicable_from

    this.addShiftForm.patchValue({
    shift_name:item?.shift_name,
    from:from_time,
    to:this.timeMange(item?.to_time),
    shift_margin: this.shift_margin,
    shift_margin_hours_from:item?.shift_margin_hours_from,
    shift_margin_hours_to:item?.shift_margin_hours_to,
    half_working_day:(item?.is_weekend_working_day=='Y')?'Enable':'Disable',
    shift_allowance: this.shift_allowance,
    rate_per_day:item?.rate_per_day,
    weekend:this.weekend,
    applicable_from:applicable_from,
    // weekend_txt:(this.weekend=='Enable')?weekendtxt:this.weekData
  })

  }
 })


}


changeDropdownFlag(type: string) {
  // if(type === 'Disable') {
  //     for(let i in this.weekData) {
  //       this.weekData[i]['showDropdown'] = false;
  //     }
  // } else {
  //     for(let i in this.weekData) {
  //       this.weekData[i]['showDropdown'] = true;
  //     }
  // }
}



timeMange(val){
  let time=[]
  time=val?.split(":")
  return time[0]+":"+time[1]
}

  toggle() {
    this.showSidebar = !this.showSidebar;
  }

cancelForm(){
  this.checkMsg =''
  this.selectedItems=[];
  this.addShiftForm.reset();
}

toggleAllSelections(dayIndex: number): void {
  const day = this.weekData[dayIndex];
  day.selected = !day.selected;
  day.selections.forEach((selection) => {
    selection.selected = day.selected;
    day.showDropdown = day.selected; // Update showDropdown for the specific day

    // selection.dropdownValue = day.selected ? 0 : null; 
  });
}

toggleSelection(dayIndex: number, selectionIndex: number): void {
  const selection = this.weekData[dayIndex].selections[selectionIndex];
  selection.selected = !selection.selected;

  const allSelected = this.weekData[dayIndex].selections.every((sel) => sel.selected);
  this.weekData[dayIndex].selected = allSelected;
  this.weekData[dayIndex].showDropdown = this.weekData[dayIndex].selections.some((sel) => sel.selected);


}

onDropdownChange(dayIndex, selectionIndex, dropdownValue) {
  // if(this.weekData[dayIndex]['selections'][selectionIndex]['selected'] === true) {
    this.weekData[dayIndex]['selections'][selectionIndex]['dropdownValue'] = parseInt(dropdownValue)
  // }
}

resetWeekData() {
  this.weekData = [
    {
      day: 'Sunday',
      selected: false,
      showDropdown:false,
      selections: [
        { value: 0, selected: false, dropdownValue: 0 },
        { value: 1, selected: false, dropdownValue: 0 },
        { value: 2, selected: false, dropdownValue: 0 },
        { value: 3, selected: false, dropdownValue: 0 },
        { value: 4, selected: false, dropdownValue: 0 },
      ],
    },
    {
      day: 'Monday',
      selected: false,
      showDropdown:false,
      selections: [
        { value: 0, selected: false, dropdownValue: 0 },
        { value: 1, selected: false, dropdownValue: 0 },
        { value: 2, selected: false, dropdownValue: 0 },
        { value: 3, selected: false, dropdownValue: 0 },
        { value: 4, selected: false, dropdownValue: 0 },
      ]
    },
    {
      day: 'Tuesday',
      selected: false,
      showDropdown:false,
      selections: [
        { value: 0, selected: false, dropdownValue: 0 },
        { value: 1, selected: false, dropdownValue: 0 },
        { value: 2, selected: false, dropdownValue: 0 },
        { value: 3, selected: false, dropdownValue: 0 },
        { value: 4, selected: false, dropdownValue: 0 },
      ]
    },
    {
      day: 'Wednesday',
      selected: false,
      showDropdown:false,
      selections: [
        { value: 0, selected: false, dropdownValue: 0 },
        { value: 1, selected: false, dropdownValue: 0 },
        { value: 2, selected: false, dropdownValue: 0 },
        { value: 3, selected: false, dropdownValue: 0 },
        { value: 4, selected: false, dropdownValue: 0 },
      ]
    },
    {
      day: 'Thursday',
      selected: false,
      showDropdown:false,
      selections: [
        { value: 0, selected: false, dropdownValue: 0 },
        { value: 1, selected: false, dropdownValue: 0 },
        { value: 2, selected: false, dropdownValue: 0 },
        { value: 3, selected: false, dropdownValue: 0 },
        { value: 4, selected: false, dropdownValue: 0 },
      ]
    },
    {
      day: 'Friday',
      selected: false,
      showDropdown:false,
      selections: [
        { value: 0, selected: false, dropdownValue: 0 },
        { value: 1, selected: false, dropdownValue: 0 },
        { value: 2, selected: false, dropdownValue: 0 },
        { value: 3, selected: false, dropdownValue: 0 },
        { value: 4, selected: false, dropdownValue: 0 },
      ]
    },
    {
      day: 'Saturday',
      selected: false,
      showDropdown:false,
      selections: [
        { value: 0, selected: false, dropdownValue: 0 },
        { value: 1, selected: false, dropdownValue: 0 },
        { value: 2, selected: false, dropdownValue: 0 },
        { value: 3, selected: false, dropdownValue: 0 },
        { value: 4, selected: false, dropdownValue: 0 },
      ]
    },
  ];
}


openDeleteModal(id:any){
  this.delete_shift_id=id
}


deleteShift(){
  let obj={
       action:"delete_shift",
       row_id:this.delete_shift_id.toString(),
       customeraccountid:this.tp_account_id.toString(),
       status:"0",
       userby:this.tp_account_id.toString()
  }

  this.shiftService.deleteShiftDetails(obj).subscribe((res:any)=>{
    if(res?.statusCode){
     this.toastr.success("Deleted sucessfully");
     this.getShiftDetails();
    }else{
      this.toastr.error(res?.message)
    }
  })
}


}