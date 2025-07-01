import { ChangeDetectorRef, Component, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import jwtDecode from 'jwt-decode';
import { SessionService } from 'src/app/shared/services/session.service';
import { EncrypterService } from 'src/app/shared/services/encrypter.service';
import { ShiftRotationService } from '../shift-rotation.service';
import { ShiftDetailService } from '../shift-detail.service';
import { ShiftSpecificService } from '../shift-specific-service';
import { ToastrService } from 'ngx-toastr';
import { PopoverDirective } from 'ngx-bootstrap/popover';
import { DatePipe } from '@angular/common';

declare var $: any;

@Component({
  selector: 'app-shift-rotation',
  templateUrl: './shift-rotation.component.html',
  styleUrls: ['./shift-rotation.component.css'],
  providers: [DatePipe],

})
export class ShiftRotationComponent {

  public showSidebar: boolean = true;
  public addShiftRotationForm: FormGroup
  tp_account_id: any;
  decoded_token: any;
  breakDetails: any;
  leaveList: any;
  shiftDetails: any;
  departmentList: any;
  dropdownSettings: {};
  selectedItems: any = [];
  shiftRotationDetails: any;
  delete_shift_rotation_id: any;
  popupType: any;
  editShiftRotationId: any;
  monthArray: any = [];
  sixthDay: string;
  monthData: string;

  timeShedule: any;

  @ViewChild('popoverContentFrom') popoverContentFrom: ElementRef<HTMLElement>;
  @ViewChild('popoverFrom') popoverFrom: PopoverDirective;
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
    this.addShiftRotationForm.controls[controlName].setValue(formattedTime);
  }


  constructor(private fb: FormBuilder, private shiftRottionService: ShiftRotationService, private _sessionService: SessionService,
    private encriptedService: EncrypterService, private cdr: ChangeDetectorRef, private shiftService: ShiftDetailService,
    private shiftSettingService: ShiftSpecificService, private toastr: ToastrService, private datePipe: DatePipe
  ) {

    this.addShiftRotationForm = this.fb.group({
      scheduleName: ["", Validators.required],
      scheduleFrequencyType: ["", Validators.required],
      scheduleFrequencyDay: [""],
      timeShedule: ["", Validators.required],
      applicablePeriod: ["", Validators.required],
      applicableFor: ["", Validators.required],
      shift_rotation_from: ["", Validators.required],
      shift_rotation_to: ["", Validators.required],
    })

  }


  generateDaysArray() {
    for (let i = 1; i <= 31; i++) {
      let suffix = '';
      if (i === 1 || i === 21 || i === 31) {
        suffix = 'st';
      } else if (i === 2 || i === 22) {
        suffix = 'nd';
      } else if (i === 3 || i === 23) {
        suffix = 'rd';
      } else {
        suffix = 'th';
      }
      this.monthArray.push(`${i}${suffix}`);
    }
  }


  getPreviousDayWithSuffix(event: any) {
    let selectedDay = event.target.value;
    let dayNumber = parseInt(selectedDay);
    let suffix = selectedDay.slice(-2);
    let isSpecialCase = suffix === 'st' || suffix === 'nd' || suffix === 'rd';
    if (isSpecialCase) {
      dayNumber = parseInt(selectedDay.slice(0, -2));
    }
    if (dayNumber === 1) {
      this.monthData = '31st';
    } else if (dayNumber === 2) {
      this.monthData = '1st';
    } else {
      this.monthData = `${dayNumber - 1}${this.getSuffix(dayNumber - 1)}`;
    }

  }

  getSuffix(dayNumber: number): string {
    if (dayNumber >= 11 && dayNumber <= 13) {
      return 'th';
    }
    const lastDigit = dayNumber % 10;
    switch (lastDigit) {
      case 1:
        return 'st';
      case 2:
        return 'nd';
      case 3:
        return 'rd';
      default:
        return 'th';
    }
  }

  checkPopupType(val) {
    this.popupType = val
    if (this.popupType == 'addShiftRotation') {
      this.selectedItems = [];
    }
  }


  ngOnInit(): void {
    let session_obj = this._sessionService.get_user_session();
    let token = JSON.parse(session_obj).token;
    this.decoded_token = jwtDecode(token);
    this.tp_account_id = this.decoded_token.tp_account_id;
    this.decodedeToken=this.decoded_token.id


    this.getShiftRotationDetails();
    this.getShiftDetails();
    this.getDepartmentList();
    this.generateDaysArray()
  }

  async getShiftRotationDetails() {
    let obj = {
      action: 'get_shift_rotation_list',
      accountid: this.tp_account_id.toString(),
      keyword: ''
    }
    await this.shiftRottionService.getShiftRotationDetails(obj).subscribe((res: any) => {
      if (res.statusCode) {
        let decryptData = JSON.parse(this.encriptedService.aesDecrypt(res.commonData))
        this.shiftRotationDetails = decryptData.data
      } else {
        let decryptData = JSON.parse(this.encriptedService.aesDecrypt(res.commonData))
      }

    })
  }

  submitShiftRotation() {
    if (this.addShiftRotationForm.invalid) {
      return this.addShiftRotationForm.markAllAsTouched();
    } else {

      let applicable_period_to
      if (this.addShiftRotationForm.value.scheduleFrequencyType == 'weekly' || this.addShiftRotationForm.value.scheduleFrequencyType == 'biweekly') {
        applicable_period_to = (this.sixthDay) ? this.sixthDay : ''
      } else if (this.addShiftRotationForm.value.scheduleFrequencyType == 'monthly') {
        applicable_period_to = (this.monthData) ? this.monthData : ''
      } else {
        applicable_period_to = ''
      }

      let schedule_frequency_day;
      if(this.addShiftRotationForm.value.scheduleFrequencyType == 'monthly'){
        schedule_frequency_day=this.addShiftRotationForm.value.scheduleFrequencyDay;
      }
      if(this.addShiftRotationForm.value.scheduleFrequencyType == 'weekly' || this.addShiftRotationForm.value.scheduleFrequencyType == 'biweekly' ){
        schedule_frequency_day=this.addShiftRotationForm.value.scheduleFrequencyDay;
      }
       if(this.addShiftRotationForm.value.scheduleFrequencyType == 'daily'){
        schedule_frequency_day='daily'
      }

      let obj = {
        action: (this.popupType == 'addShiftRotation') ? 'save_shift_rotation' : 'update_shift_rotation',
        shift_rotation_id: (this.popupType == 'addShiftRotation') ? '' : this.editShiftRotationId.toString(),
        customeraccountid: this.tp_account_id.toString(),
        schedule_name: this.addShiftRotationForm.value.scheduleName,
        schedule_frequency_type: this.addShiftRotationForm.value.scheduleFrequencyType,
        schedule_frequency_value:(schedule_frequency_day)?schedule_frequency_day:'',
        time_of_schedule: this.addShiftRotationForm.value.timeShedule,
        applicable_period_from: this.addShiftRotationForm.value.applicablePeriod,
        applicable_period_to: applicable_period_to,
        applicable_type: [],
        applicable_for: this.addShiftRotationForm.value.applicableFor,
        shift_rotation_from: this.addShiftRotationForm.value.shift_rotation_from,
        shift_rotation_to: this.addShiftRotationForm.value.shift_rotation_to,
        userby: this.decodedeToken?.toString(),
        userip: "::1",
      }


      this.shiftRottionService.saveShiftRotationDetails(obj).subscribe((res: any) => {
        if (res.statusCode) {
          this.addShiftRotationForm.reset()
          this.toastr.success(res?.message)
          this.getShiftRotationDetails();
        } else {
          let decryptData = JSON.parse(this.encriptedService.aesDecrypt(res.commonData))
          this.toastr.error(decryptData?.message)

        }
      })
    }
  }

  patchData(val) {
    this.editShiftRotationId = val?.shift_rotation_id
    let applicable_for = JSON.parse(val?.applicable_for)

    this.addShiftRotationForm.patchValue({
      scheduleName: val?.schedule_name,
      scheduleFrequencyType: val?.schedule_frequency_type,
      scheduleFrequencyDay: val?.schedule_frequency_value,
      timeShedule: val?.time_of_schedule?.substring(0, 5),
      applicablePeriod: val?.applicable_period_from,
      applicableFor: applicable_for,
      shift_rotation_from: val?.shift_rotation_from,
      shift_rotation_to: val?.shift_rotation_to,
    })

  }

  toggle() {
    this.showSidebar = !this.showSidebar;
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

  onUnselectAll(items) {
    this.selectedItems = [];
  }


  cancelForm() {
    this.addShiftRotationForm.reset()
  }


  async getShiftDetails() {
    let obj = {
      accountid: this.tp_account_id.toString(),
      keyword: '',
      action: 'shift_list'
    }
    await this.shiftSettingService.getShiftDetails(obj).subscribe((res: any) => {
      let decryptData = JSON.parse(this.encriptedService.aesDecrypt(res.commonData))
      this.shiftDetails = decryptData?.data
    })
  }


  async getDepartmentList() {
    let obj = {
      action: "departments_list",
      accountid: this.tp_account_id?.toString(),
      keyword: ""
    }
    await this.shiftService.getDepartmentList(obj).subscribe((res: any) => {
      if (res.statusCode) {
        let decryptData = JSON.parse(this.encriptedService.aesDecrypt(res.commonData))
        this.departmentList = decryptData.data
        this.dropdownSettings = {
          singleSelection: false,
          idField: 'id',
          textField: 'departmentname',
          selectAllText: 'Select All',
          unSelectAllText: 'UnSelect All',
          itemsShowLimit: 3,
          allowSearchFilter: false
        };

      } else {
        let decryptData = JSON.parse(this.encriptedService.aesDecrypt(res.commonData))
      }
    })
  }

  openDeleteModal(id: any) {
    this.delete_shift_rotation_id = id
  }

  deleteShiftRotation() {
    let obj = {
      action: "delete_shift_rotation",
      row_id: this.delete_shift_rotation_id.toString(),
      customeraccountid: this.tp_account_id.toString(),
      status: "0",
      userby: this.tp_account_id.toString()
    }

    this.shiftService.deleteShiftDetails(obj).subscribe((res: any) => {
      if (res?.statusCode) {
        this.getShiftRotationDetails()
        this.toastr.success("Deleted successfully")
      } else {
      }
    })
  }


  getSixthDayAfterSelectedDay(event) {
    let selectedDay = event.target.value
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const selectedIndex = daysOfWeek.indexOf(selectedDay);
    const sixthDayIndex = (selectedIndex + 6) % 7;
    this.sixthDay = daysOfWeek[sixthDayIndex];

  }


}