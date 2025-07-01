import { Component, ElementRef, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import jwtDecode from 'jwt-decode';
import { SessionService } from 'src/app/shared/services/session.service';
import { EncrypterService } from 'src/app/shared/services/encrypter.service';
import { ShiftSpecificService } from '../shift-specific-service';
import { ToastrService } from 'ngx-toastr';
import { ShiftDetailService } from '../shift-detail.service';
import { PopoverDirective } from 'ngx-bootstrap/popover';
import { DatePipe } from '@angular/common';

declare var $: any;

@Component({
  selector: 'app-shift-specific-settings',
  templateUrl: './shift-specific-settings.component.html',
  styleUrls: ['./shift-specific-settings.component.css'],
  providers: [DatePipe],

})
export class ShiftSpecificSettingsComponent {

  public showSidebar: boolean = true;
  public addShiftSettingForm: FormGroup
  tp_account_id: any;
  decoded_token: any;
  breakDetails: any;
  showMaximumHrs: any;
  showRoundOff: any;
  enableGracePeriod: any
  shiftSettingDetails: any = [];
  editshiftSettingDetails: any;
  popupType: any;
  showOverTimeDeviationVal: any;
  shiftDetails: any;
  product_type: any;
  GeoFenceId: any;
  userList: any;

  dropdownList = [];
  selectedItems = [];
  selectedItemsLeave = [];
  dropdownSettings = {};
  settingType: any;
  rules: any = [];
  leaveList: any;
  deviatioMoreThan: any;
  getDeviationMultiple: any;
  deviatioMoreThanPeriod: any;
  getDeviationMultiplePeriod: any;
  particularValue: any;
  delete_setting_id: any;


  ////////////////////////////////////////////////////////

  full_day: any;
  half_day: any;
  max_half_day: any;
  max_full_day: any;
  per_day: any;
  max_per_day: any;
  firstCheckInLateTime: any;


  @ViewChild('popoverContentFullDay') popoverContentFullDay: ElementRef<HTMLElement>;
  @ViewChild('popoverFullDay') popoverFullDay: PopoverDirective;

  @ViewChild('popoverContentHalfDay') popoverContentHalfDay: ElementRef<HTMLElement>;
  @ViewChild('popoverHalfDay') popoverHalfDay: PopoverDirective;

  @ViewChild('popoverContentMaxHalfDay') popoverContentMaxHalfDay: ElementRef<HTMLElement>;
  @ViewChild('popoverMaxHalfDay') popoverMaxHalfDay: PopoverDirective;

  @ViewChild('popoverContentMaxFullDay') popoverContentMaxFullDay: ElementRef<HTMLElement>;
  @ViewChild('popoverMaxFullDay') popoverMaxFullDay: PopoverDirective;

  @ViewChild('popoverContentMaxPerDay') popoverContentMaxPerDay: ElementRef<HTMLElement>;
  @ViewChild('popoverMaxPerDay') popoverMaxPerDay: PopoverDirective;

  @ViewChild('popoverContentPerDay') popoverContentPerDay: ElementRef<HTMLElement>;
  @ViewChild('popoverPerDay') popoverPerDay: PopoverDirective;
  dropdownSettingsLeave: { singleSelection: boolean; idField: string; textField: string; selectAllText: string; unSelectAllText: string; itemsShowLimit: number; allowSearchFilter: boolean; };
  decodedeToken: any;
  page: number = 1;


  togglePopover(popover) {
    if (popover.isOpen) {
      popover.hide();
    } else {
      popover.show();
    }
  }

  formatTime(time: any, controlName: string) {
    const formattedTime = this.datePipe.transform(time, 'HH:mm') || '';
    this.addShiftSettingForm.controls[controlName].setValue(formattedTime);
  }


  /////////////////////////////////////////////////////

  gracePeriodSelectedIndex = {
    'firstCheckInLateBy': null,
    'lastCheckOutEarlyBy': null,
    'workingHoursLessBy': null,
    'firstCheckinR2': null,
    // 'firstCheckinR3':null
  }

  constructor(private fb: FormBuilder,
    private _sessionService: SessionService,
    private encriptedService: EncrypterService,
    private shiftSettingService: ShiftSpecificService,
    private toastr: ToastrService,
    private shiftService: ShiftDetailService, private datePipe: DatePipe
  ) {

    this.addShiftSettingForm = this.fb.group({

      settings_name: ["", Validators.required],
      settings_type: ["", Validators.required],
      total_hrs_cal: ["", Validators.required],
      minimum_hrs: ["", Validators.required],
      manual_input: ["", Validators.required],
      show_over_time: [""],
      max_hrs: ["", Validators.required],
      calender_check_in_out: ["", Validators.required],
      mobile_check_in_out: ["", Validators.required],
      shift_id: [""],
      user_id: [""],
      full_day: [""],
      half_day: [""],
      per_day: [""],
      max_per_day: [""],
      max_full_day: [""],
      max_half_day: [""],
      round_of: ["", Validators.required],
      firstCheckIn: [""],
      last_checkout: [""],
      worked_hours: [""],
      grace_period: [""],
      enableGrace: this.fb.array([

      ])

    })

    ////////////////////////////////////Shift///////////////////////////////

    this.addShiftSettingForm.get('settings_type').valueChanges.subscribe(value => {
      const shiftFromControl = this.addShiftSettingForm.get('shift_id');
      if (value === 'shift') {
        shiftFromControl.setValidators(Validators.required);
      } else {
        shiftFromControl.clearValidators();
      }

      shiftFromControl.updateValueAndValidity();
    });

    ////////////////////////////// User_id/////////////////////////////////

    this.addShiftSettingForm.get('settings_type').valueChanges.subscribe(value => {
      const userFromControl = this.addShiftSettingForm.get('user_id');
      if (value === 'users') {
        userFromControl.setValidators(Validators.required);
      } else {
        userFromControl.clearValidators();
      }

      userFromControl.updateValueAndValidity();
    });


    ////////////////////////////////// full_day and Halfday /////////////////////////////////////////////

    this.addShiftSettingForm.get('manual_input').valueChanges.subscribe(value => {
      const fulldayFromControl = this.addShiftSettingForm.get('full_day');
      const halfdayFromControl = this.addShiftSettingForm.get('half_day');
      if (value === 'manual_input') {
        fulldayFromControl.setValidators(Validators.required);
        halfdayFromControl.setValidators(Validators.required);
      } else {
        fulldayFromControl.clearValidators();
        halfdayFromControl.clearValidators();
      }

      fulldayFromControl.updateValueAndValidity();
      halfdayFromControl.updateValueAndValidity();

    });


    ///////////////////////////////////////// per_day  /////////////////////////////////////////////

    this.addShiftSettingForm.get('manual_input').valueChanges.subscribe(value => {
      const userFromControl = this.addShiftSettingForm.get('per_day');
      if (value === 'manual_input_len') {
        userFromControl.setValidators(Validators.required);
      } else {
        userFromControl.clearValidators();
      }

      userFromControl.updateValueAndValidity();
    });

    /////////////////////////////////////////// max_per_day/////////////////////////////////////////////////

    this.addShiftSettingForm.get('manual_input').valueChanges.subscribe(value => {
      const userFromControl = this.addShiftSettingForm.get('max_per_day');
      if ((this.addShiftSettingForm.value.max_hrs == 'Enable') && this.addShiftSettingForm.value.minimum_hrs == 'Lenient') {
        userFromControl.setValidators(Validators.required);
      } else {
        userFromControl.clearValidators();
      }

      userFromControl.updateValueAndValidity();
    });


    /////////////////////////////////////// max full day and max half day /////////////////////////////////////////////////////////

    this.addShiftSettingForm.get('max_hrs').valueChanges.subscribe(value => {
      const maxFullDayFromControl = this.addShiftSettingForm.get('max_full_day');
      const maxHalfdayFromControl = this.addShiftSettingForm.get('max_half_day');
      if (value === 'Enable' && this.addShiftSettingForm.value.minimum_hrs == 'Strict') {
        maxFullDayFromControl.setValidators(Validators.required);
        maxHalfdayFromControl.setValidators(Validators.required);
      } else {
        maxFullDayFromControl.clearValidators();
        maxHalfdayFromControl.clearValidators();
      }

      maxFullDayFromControl.updateValueAndValidity();
      maxHalfdayFromControl.updateValueAndValidity();
    });

    //////////////////////////////////////////////////////////////////////////////////////////////////////////


    this.addShiftSettingForm.get('round_of').valueChanges.subscribe(value => {
      const firstCheckInFromControl = this.addShiftSettingForm.get('firstCheckIn');
      const firstCheckoutFromControl = this.addShiftSettingForm.get('last_checkout');
      const workedHoursFromControl = this.addShiftSettingForm.get('worked_hours');
      if (value === 'Enable') {
        firstCheckInFromControl.setValidators(Validators.required);
        firstCheckoutFromControl.setValidators(Validators.required);
        workedHoursFromControl.setValidators(Validators.required);
      } else {
        firstCheckInFromControl.clearValidators();
        firstCheckoutFromControl.clearValidators();
        workedHoursFromControl.clearValidators();
      }

      firstCheckInFromControl.updateValueAndValidity();
      firstCheckoutFromControl.updateValueAndValidity();
      workedHoursFromControl.updateValueAndValidity();
    });

    //////////////////////////////////////////////////////////////////////////////
  }



  get enableGrace() {
    return this.addShiftSettingForm.get('enableGrace') as FormArray;
  }


  // addField() {
  //   if(this.addShiftSettingForm.value['enableGrace'].length == 3) {
  //     return
  //   }

  //   this.enableGrace.push(this.fb.group({
  //     firstCheckInLateBy: false,
  //     firstCheckInLateTime: '',
  //     lastCheckOutEarlyBy: false,
  //     lastCheckOutEarlyTime: '',
  //     workingHoursLessBy: false,
  //     workingHoursLessTime: '',
  //     deviationsMoreThanTimes: '',
  //     deviationsMoreThanPeriod: '',
  //     deviationsMultiplesOf: '',
  //     deviationsMultiplesOfPeriod: '',
  //     deductLeaveBalanceDays: '',
  //     deductLeaveBalance:'',
  //     deductLeaveReason: '',
  //     deviationsRadio: '',
  //   }));  


  //   /////////////////////// 0 index //////////////////////////

  // const enableGrace = this.addShiftSettingForm.get('enableGrace') as FormArray;
  // const firstCheckInLateTime = enableGrace.at(0).get('firstCheckInLateTime');
  // firstCheckInLateTime.disable();

  // const lastCheckOutEarlyTime = enableGrace.at(0).get('lastCheckOutEarlyTime');
  // lastCheckOutEarlyTime.disable();

  // const workingHoursLessTime = enableGrace.at(0).get('workingHoursLessTime');
  // workingHoursLessTime.disable();

  // const deviationsMoreThanTimes=enableGrace.at(0).get('deviationsMoreThanTimes');
  // deviationsMoreThanTimes.disable();
  // const deviationsMoreThanPeriod=enableGrace.at(0).get('deviationsMoreThanPeriod');
  // deviationsMoreThanPeriod.disable();

  // const deviationsMultiplesOf=enableGrace.at(0).get('deviationsMultiplesOf');
  // deviationsMultiplesOf.disable();
  // const deviationsMultiplesOfPeriod=enableGrace.at(0).get('deviationsMultiplesOfPeriod');
  // deviationsMultiplesOfPeriod.disable();


  // ////////////////////////// 1 index ////////////////////////////////////


  // const firstCheckInLateTime1 = enableGrace.at(1).get('firstCheckInLateTime');
  // firstCheckInLateTime1.disable();

  // const lastCheckOutEarlyTime1 = enableGrace.at(1).get('lastCheckOutEarlyTime');
  // lastCheckOutEarlyTime1.disable();

  // const workingHoursLessTime1 = enableGrace.at(1).get('workingHoursLessTime');
  // workingHoursLessTime1.disable();

  // const deviationsMoreThanTimes1=enableGrace.at(1).get('deviationsMoreThanTimes');
  // deviationsMoreThanTimes1.disable();
  // const deviationsMoreThanPeriod1=enableGrace.at(1).get('deviationsMoreThanPeriod');
  // deviationsMoreThanPeriod1.disable();

  // const deviationsMultiplesOf1=enableGrace.at(1).get('deviationsMultiplesOf');
  // deviationsMultiplesOf1.disable();

  // const deviationsMultiplesOfPeriod1=enableGrace.at(1).get('deviationsMultiplesOfPeriod');
  // deviationsMultiplesOfPeriod1.disable();


  // ////////////////////////////////// 2 index ///////////////////////////////////////


  // const firstCheckInLateTime2 = enableGrace.at(2).get('firstCheckInLateTime');
  // firstCheckInLateTime2.disable();

  // const lastCheckOutEarlyTime2 = enableGrace.at(2).get('lastCheckOutEarlyTime');
  // lastCheckOutEarlyTime2.disable();

  // const workingHoursLessTime2 = enableGrace.at(2).get('workingHoursLessTime');
  // workingHoursLessTime2.disable();

  // const deviationsMoreThanTimes2=enableGrace.at(2).get('deviationsMoreThanTimes');
  // deviationsMoreThanTimes2.disable();

  // const deviationsMoreThanPeriod2=enableGrace.at(2).get('deviationsMoreThanPeriod');
  // deviationsMoreThanPeriod2.disable();

  // const deviationsMultiplesOf2=enableGrace.at(2).get('deviationsMultiplesOf');
  // deviationsMultiplesOf2.disable();

  // const deviationsMultiplesOfPeriod2=enableGrace.at(2).get('deviationsMultiplesOfPeriod');
  // deviationsMultiplesOfPeriod2.disable();



  // }


  atLeastOneFieldRequiredValidator(): ValidatorFn {
    return (formGroup: AbstractControl): { [key: string]: boolean } | null => {
      const form = formGroup as FormGroup;
      const firstCheckInLateBy = form.get('firstCheckInLateBy').value;
      const lastCheckOutEarlyBy = form.get('lastCheckOutEarlyBy').value;
      const workingHoursLessBy = form.get('workingHoursLessBy').value;
      const firstCheckinR2 = form.get('firstCheckinR2').value;
      // const firstCheckinR3 = form.get('firstCheckinR3').value;

      return firstCheckInLateBy || lastCheckOutEarlyBy || workingHoursLessBy || firstCheckinR2 ? null : { atLeastOneFieldRequired: true };
    };
  }


  addField() {

    const isNullPresent = Object.values(this.gracePeriodSelectedIndex).includes(null);
    if (!isNullPresent) return;

    const enableGrace = this.addShiftSettingForm.get('enableGrace') as FormArray;

    // if (enableGrace.length >= 3 || this.isRuleFullyChecked(0)) {
    //   return;
    // }

    if (enableGrace.length >= 4) {
      return;
    }

    enableGrace.push(this.fb.group({
      firstCheckInLateBy: false,
      firstCheckInLateTime: { value: '', disabled: true },
      lastCheckOutEarlyBy: false,
      lastCheckOutEarlyTime: { value: '', disabled: true },
      workingHoursLessBy: false,
      workingHoursLessTime: { value: '', disabled: true },
      deviationsMoreThanTimes: '',
      deviationsMoreThanPeriod: '',
      deviationsMultiplesOf: '',
      deviationsMultiplesOfPeriod: '',
      deductLeaveBalanceDays: '',
      deductLeaveBalance: '',
      deductLeaveReason: '',
      deviationsRadio: '',
      firstCheckinR2: false,
      firstCheckinR2LateTime: { value: '', disabled: true },
      // firstCheckinR3 : false,
      // firstCheckinR3LateTime : {value :'',disbaled: true}
    }, { validators: this.atLeastOneFieldRequiredValidator() }));

    const enableGrace2 = this.addShiftSettingForm.get('enableGrace') as FormArray;
    enableGrace2.controls.forEach((group, i) => {
      if (this.gracePeriodSelectedIndex['firstCheckInLateBy'] !== null && i !== this.gracePeriodSelectedIndex['firstCheckInLateBy']) {
        group.get('firstCheckInLateBy').disable();
      }

      if (this.gracePeriodSelectedIndex['lastCheckOutEarlyBy'] !== null && i !== this.gracePeriodSelectedIndex['lastCheckOutEarlyBy']) {
        group.get('lastCheckOutEarlyBy').disable();
      }

      if (this.gracePeriodSelectedIndex['workingHoursLessBy'] !== null && i !== this.gracePeriodSelectedIndex['workingHoursLessBy']) {
        group.get('workingHoursLessBy').disable();
      }
      if (this.gracePeriodSelectedIndex['firstCheckinR2'] !== null && i !== this.gracePeriodSelectedIndex['firstCheckinR2']) {
        group.get('firstCheckinR2').disable();
      }
      // if (this.gracePeriodSelectedIndex['firstCheckinR3'] !== null && i !== this.gracePeriodSelectedIndex['firstCheckinR3']) {
      //   group.get('firstCheckinR3').disable();
      // }
    });



    ////////////////////////////////////////// 0 index ////////////////////////////////////////

    if (!enableGrace.at(0).get('deviationsMoreThanTimes').value) {
      const deviationsMoreThanTimes = enableGrace.at(0).get('deviationsMoreThanTimes');
      deviationsMoreThanTimes.disable();
      const deviationsMoreThanPeriod = enableGrace.at(0).get('deviationsMoreThanPeriod');
      deviationsMoreThanPeriod.disable();
    }

    if (!enableGrace.at(0).get('deviationsMultiplesOf').value) {
      const deviationsMultiplesOf = enableGrace.at(0).get('deviationsMultiplesOf');
      deviationsMultiplesOf.disable();
      const deviationsMultiplesOfPeriod = enableGrace.at(0).get('deviationsMultiplesOfPeriod');
      deviationsMultiplesOfPeriod.disable();
    }

    //////////////////////////// 1 index ////////////////////////////////////

    if (!enableGrace.at(1).get('deviationsMoreThanTimes').value) {
      const deviationsMoreThanTimes1 = enableGrace.at(1).get('deviationsMoreThanTimes');
      deviationsMoreThanTimes1.disable();
      const deviationsMoreThanPeriod1 = enableGrace.at(1).get('deviationsMoreThanPeriod');
      deviationsMoreThanPeriod1.disable();
    }

    if (!enableGrace.at(1).get('deviationsMultiplesOf').value) {
      const deviationsMultiplesOf1 = enableGrace.at(1).get('deviationsMultiplesOf');
      deviationsMultiplesOf1.disable();

      const deviationsMultiplesOfPeriod1 = enableGrace.at(1).get('deviationsMultiplesOfPeriod');
      deviationsMultiplesOfPeriod1.disable();
    }

    //////////////////////////////////// 2 index ///////////////////////////////////////
    if (!enableGrace.at(2).get('deviationsMoreThanTimes').value) {
      const deviationsMoreThanTimes2 = enableGrace.at(2).get('deviationsMoreThanTimes');
      deviationsMoreThanTimes2.disable();

      const deviationsMoreThanPeriod2 = enableGrace.at(2).get('deviationsMoreThanPeriod');
      deviationsMoreThanPeriod2.disable();
    }

    if (!enableGrace.at(2).get('deviationsMultiplesOf').value) {
      const deviationsMultiplesOf2 = enableGrace.at(2).get('deviationsMultiplesOf');
      deviationsMultiplesOf2.disable();

      const deviationsMultiplesOfPeriod2 = enableGrace.at(2).get('deviationsMultiplesOfPeriod');
      deviationsMultiplesOfPeriod2.disable();
    }


  }

  updateDisabledFields(index, key, isChecked) {
    if (isChecked) {
      this.gracePeriodSelectedIndex[key] = index;
    } else {
      this.gracePeriodSelectedIndex[key] = null;
    }
    const enableGrace = this.addShiftSettingForm.get('enableGrace') as FormArray;
    console.log(enableGrace.value);


    for (let i = 0; i < enableGrace.length; i++) {
      const group = enableGrace.at(i);
      if (i != index) {
        if (isChecked) {
          group.get(`${key}`).disable();
        } else {
          group.get(`${key}`).enable();
        }
      }
      else {
        const group2 = enableGrace.at(i);
        const control = this.enableGrace.at(index) as FormGroup;
        const firstCheckInLateTime = control.get('firstCheckInLateTime');
        const lastCheckOutEarlyTime = control.get('lastCheckOutEarlyTime');
        const workingHoursLessTime = control.get('workingHoursLessTime');
        const firstCheckinR2LateTime = control.get('firstCheckinR2LateTime');
        // const firstCheckinR3LateTime = control.get('firstCheckinR3LateTime');

        if (isChecked) {
          if (key == 'firstCheckInLateBy') {
            group2.get('firstCheckInLateTime').enable();
            firstCheckInLateTime.setValidators(Validators.required);
          }

          if (key == 'lastCheckOutEarlyBy') {
            group2.get('lastCheckOutEarlyTime').enable();
            lastCheckOutEarlyTime.setValidators(Validators.required);
          }

          if (key == 'workingHoursLessBy') {
            group2.get('workingHoursLessTime').enable();
            workingHoursLessTime.setValidators(Validators.required);

          }
          if (key == 'firstCheckinR2') {
            group2.get('firstCheckinR2LateTime').enable();
            firstCheckinR2LateTime.setValidators(Validators.required);

          }
          // if(key == 'firstCheckinR3'){
          //  group2.get('firstCheckinR3LateTime').enable();
          //  firstCheckinR3LateTime.setValidators(Validators.required);

          // }

        } else {

          if (key == 'firstCheckInLateBy') {
            group2.get('firstCheckInLateTime').disable();
            group2.get('firstCheckInLateTime').setValue('');
            firstCheckInLateTime.clearValidators();
          }

          if (key == 'lastCheckOutEarlyBy') {
            group2.get('lastCheckOutEarlyTime').disable();
            group2.get('lastCheckOutEarlyTime').setValue('');
            lastCheckOutEarlyTime.clearValidators();
          }

          if (key == 'workingHoursLessBy') {
            group2.get('workingHoursLessTime').disable();
            group2.get('workingHoursLessTime').setValue('');
            workingHoursLessTime.clearValidators();
          }
          if (key == 'firstCheckinR2') {
            group2.get('firstCheckinR2LateTime').disable();
            group2.get('firstCheckinR2LateTime').setValue('');
            firstCheckinR2LateTime.clearValidators();
          }
          // if(key == 'firstCheckinR3'){
          // group2.get('firstCheckinR3LateTime').disable();
          // group2.get('firstCheckinR3LateTime').setValue('');
          // firstCheckinR3LateTime.clearValidators();
          // }
        }

        firstCheckInLateTime.updateValueAndValidity();
        lastCheckOutEarlyTime.updateValueAndValidity();
        workingHoursLessTime.updateValueAndValidity();
        firstCheckinR2LateTime.updateValueAndValidity();
        // firstCheckinR3LateTime.updateValueAndValidity();


      }
    }

    const isNullPresent = Object.values(this.gracePeriodSelectedIndex).includes(null);
    if (isNullPresent) {
      return;
    } else {
      let myIndex = [0, 1, 2];
      let objValue = Object.values(this.gracePeriodSelectedIndex);
      let indexNotPresent = myIndex.filter(index => !objValue.includes(index));
      if (indexNotPresent.length > 0) {
        for (let j in indexNotPresent) {
          if (indexNotPresent[j] == 0) {
            for (let key in this.gracePeriodSelectedIndex) {
              if (this.gracePeriodSelectedIndex.hasOwnProperty(key)) {
                if (this.gracePeriodSelectedIndex[key] == 1) {
                  this.gracePeriodSelectedIndex[key] = 0;
                }
                if (this.gracePeriodSelectedIndex[key] == 2) {
                  this.gracePeriodSelectedIndex[key] = 1;
                }
              }
            }
          }
          if (indexNotPresent[j] == 1) {
            for (let key in this.gracePeriodSelectedIndex) {
              if (this.gracePeriodSelectedIndex.hasOwnProperty(key)) {
                if (indexNotPresent.includes(0) && indexNotPresent.includes(1)) {
                  if (this.gracePeriodSelectedIndex.hasOwnProperty(key)) {
                    if (this.gracePeriodSelectedIndex[key] == 1) {
                      this.gracePeriodSelectedIndex[key] = 0;
                    }
                  }
                } else if (this.gracePeriodSelectedIndex[key] == 2) {
                  this.gracePeriodSelectedIndex[key] = 1;
                }
              }
            }
            if (indexNotPresent.includes(0) && indexNotPresent.includes(1)) {
              indexNotPresent[j] = 0;
            }
          }
          if (indexNotPresent[j] == 2) {
            for (let key in this.gracePeriodSelectedIndex) {
              if (this.gracePeriodSelectedIndex.hasOwnProperty(key)) {
                if (this.gracePeriodSelectedIndex[key] == 2) {
                  indexNotPresent[j] = 1;
                }
                if (indexNotPresent.includes(0) && indexNotPresent.includes(2)) {
                  indexNotPresent[j] = 1;
                }
                if (indexNotPresent.includes(1) && indexNotPresent.includes(2)) {
                  indexNotPresent[j] = 1;
                }
              }
            }
          }
          this.removeRule(indexNotPresent[j], false)
        }
      }

    }

  }


  // updateDisabledFields() {
  //   const enableGrace = this.addShiftSettingForm.get('enableGrace') as FormArray;

  //   for (let i = 0; i < enableGrace.length; i++) {
  //     const group = enableGrace.at(i);

  //     if (i === 0) {
  //       group.get('firstCheckInLateTime').disable();
  //       group.get('lastCheckOutEarlyTime').disable();
  //       group.get('workingHoursLessTime').disable();
  //     } else {
  //       const prevGroup = enableGrace.at(i - 1);
  //       const currentGroup = enableGrace.at(i);

  //       currentGroup.get('firstCheckInLateTime').enable();
  //       currentGroup.get('lastCheckOutEarlyTime').enable();
  //       currentGroup.get('workingHoursLessTime').enable();

  //       if (prevGroup.get('firstCheckInLateBy').value) {
  //         currentGroup.get('firstCheckInLateBy').disable();
  //         currentGroup.get('firstCheckInLateTime').disable();
  //       }
  //       if (prevGroup.get('lastCheckOutEarlyBy').value) {
  //         currentGroup.get('lastCheckOutEarlyBy').disable();
  //         currentGroup.get('lastCheckOutEarlyTime').disable();
  //       }
  //       if (prevGroup.get('workingHoursLessBy').value) {
  //         currentGroup.get('workingHoursLessBy').disable();
  //         currentGroup.get('workingHoursLessTime').disable();
  //       }
  //     }
  //   }
  // }


  resetForm() {
    this.addShiftSettingForm.reset();
    this.enableGracePeriod = false;
  }



  // toggleTimePicker(i: number): void {
  //   const enableGrace = this.addShiftSettingForm.get('enableGrace') as FormArray;
  //   const timePickerControl = enableGrace.at(i).get('firstCheckInLateTime');
  //   const checkboxControl = enableGrace.at(i).get('firstCheckInLateBy');

  //   if (checkboxControl.value) {
  //     timePickerControl.enable();
  //     // If there was a previously stored value, set it back
  //     if (timePickerControl.value) {
  //       timePickerControl.setValue(timePickerControl.value);
  //     }
  //   } else {
  //     // Reset the time picker value and disable it
  //     timePickerControl.setValue(''); // Reset the value
  //     timePickerControl.disable();
  //   }
  // }


  removeRule(index, isContinue) {
    this.enableGrace.removeAt(index);
    if (isContinue) {
      //! remove
      //! its selected value is now null
      // ! now others rule indexes is enabled
      //! rule 2 & rule 3 is decreased by 1 because of new index

      const keys = Object.keys(this.gracePeriodSelectedIndex);
      const val = Object.values(this.gracePeriodSelectedIndex);
      const isIndexPresent = Object.values(this.gracePeriodSelectedIndex).includes(index);

      if (isIndexPresent) {
        for (let k in val) {
          if (val[k] == index) {
            this.gracePeriodSelectedIndex[keys[k]] = null;
            const enableGrace2 = this.addShiftSettingForm.get('enableGrace') as FormArray;
            enableGrace2.controls.forEach((group, i) => {
              if (this.gracePeriodSelectedIndex['firstCheckInLateBy'] == null) {
                group.get('firstCheckInLateBy').enable();
              }

              if (this.gracePeriodSelectedIndex['lastCheckOutEarlyBy'] == null) {
                group.get('lastCheckOutEarlyBy').enable();
              }

              if (this.gracePeriodSelectedIndex['workingHoursLessBy'] == null) {
                group.get('workingHoursLessBy').enable();
              }
              if (this.gracePeriodSelectedIndex['firstCheckinR2'] == null) {
                group.get('firstCheckinR2').enable();
              }
              // if (this.gracePeriodSelectedIndex['firstCheckinR3'] == null) {
              //   group.get('firstCheckinR3').enable();
              // }
            });
          }

          let myIndex = [0, 1, 2];
          let objValue = Object.values(this.gracePeriodSelectedIndex);
          let indexNotPresent = myIndex.filter(index => !objValue.includes(index));
          if (indexNotPresent.length > 0) {
            for (let j in indexNotPresent) {
              if (indexNotPresent[j] == 0) {
                for (let key in this.gracePeriodSelectedIndex) {
                  if (this.gracePeriodSelectedIndex.hasOwnProperty(key)) {
                    if (this.gracePeriodSelectedIndex[key] == 1) {
                      this.gracePeriodSelectedIndex[key] = 0;
                    }
                    if (this.gracePeriodSelectedIndex[key] == 2) {
                      this.gracePeriodSelectedIndex[key] = 1;
                    }
                  }
                }
              }
              if (indexNotPresent[j] == 1) {
                for (let key in this.gracePeriodSelectedIndex) {
                  if (this.gracePeriodSelectedIndex.hasOwnProperty(key)) {
                    if (this.gracePeriodSelectedIndex[key] == 2) {
                      this.gracePeriodSelectedIndex[key] = 1;
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }


  // toggleTimePicker(i: number) {
  //   const enableGrace = this.addShiftSettingForm.get('enableGrace') as FormArray;
  //   const timePickerControl = enableGrace.at(i).get('firstCheckInLateTime');
  //   const checkboxControl = enableGrace.at(i).get('firstCheckInLateBy');

  //   if (checkboxControl.value) {
  //     timePickerControl.enable();
  //   } else {
  //     timePickerControl.disable();
  //   }
  // }


  // toggleTimePicker(i: number) {
  //   const enableGrace = this.addShiftSettingForm.get('enableGrace') as FormArray;
  //   const timePickerControl = enableGrace.at(i).get('firstCheckInLateTime');
  //   const checkboxControl = enableGrace.at(i).get('firstCheckInLateBy');

  //   if (checkboxControl.value) {
  //     timePickerControl.enable();
  //   } else {
  //     timePickerControl.disable();
  //   }
  // }



  toggleWorkingHoursLessTime(i: number): void {
    const enableGrace = this.addShiftSettingForm.get('enableGrace') as FormArray;
    const timePickerControl = enableGrace.at(i).get('workingHoursLessTime');
    const checkboxControl = enableGrace.at(i).get('workingHoursLessBy');

    if (checkboxControl.value) {
      timePickerControl.enable();
      timePickerControl.setValue(timePickerControl.value);
    } else {
      timePickerControl.disable();
      timePickerControl.setValue('');
    }
  }

  toggleLastCheckOutEarlyTime(i: number): void {
    const enableGrace = this.addShiftSettingForm.get('enableGrace') as FormArray;
    const timePickerControl = enableGrace.at(i).get('lastCheckOutEarlyTime');
    const checkboxControl = enableGrace.at(i).get('lastCheckOutEarlyBy');

    if (checkboxControl.value) {
      timePickerControl.enable();
      timePickerControl.setValue(timePickerControl.value);

    } else {
      timePickerControl.disable();
      timePickerControl.setValue('');
    }
  }

  toggleDeviationControls(i: number): void {
    const enableGrace = this.addShiftSettingForm.get('enableGrace') as FormArray;
    const deviationsRadioControl = enableGrace.at(i).get('deviationsRadio');

    const deviationsMoreThanTimesControl = enableGrace.at(i).get('deviationsMoreThanTimes');
    const deviationsMoreThanPeriodControl = enableGrace.at(i).get('deviationsMoreThanPeriod');
    const deviationsMultiplesOfControl = enableGrace.at(i).get('deviationsMultiplesOf');
    const deviationsMultiplesOfPeriodControl = enableGrace.at(i).get('deviationsMultiplesOfPeriod');

    if (deviationsRadioControl.value === 'deviation_more_than') {
      deviationsMoreThanTimesControl.enable();
      deviationsMoreThanPeriodControl.enable();
      deviationsMultiplesOfControl.disable();
      deviationsMultiplesOfControl.setValue('');
      deviationsMultiplesOfPeriodControl.setValue('');
      deviationsMultiplesOfPeriodControl.disable();

      deviationsMoreThanTimesControl.setValidators(Validators.required)
      deviationsMoreThanPeriodControl.setValidators(Validators.required)
      deviationsMultiplesOfControl.clearValidators()
      deviationsMultiplesOfPeriodControl.clearValidators()


    } else if (deviationsRadioControl.value === 'deviation_multiples') {
      deviationsMoreThanTimesControl.disable();
      deviationsMoreThanPeriodControl.disable();
      deviationsMultiplesOfControl.enable();
      deviationsMultiplesOfPeriodControl.enable();
      deviationsMoreThanTimesControl.setValue('');
      deviationsMoreThanPeriodControl.setValue('');

      deviationsMoreThanTimesControl.clearValidators()
      deviationsMoreThanPeriodControl.clearValidators()
      deviationsMultiplesOfControl.setValidators(Validators.required)
      deviationsMultiplesOfPeriodControl.setValidators(Validators.required)

    } else {
      deviationsMoreThanTimesControl.disable();
      deviationsMoreThanPeriodControl.disable();
      deviationsMultiplesOfControl.disable();
      deviationsMultiplesOfControl.setValue('');
      deviationsMultiplesOfPeriodControl.disable();
      deviationsMoreThanTimesControl.setValue('');
      deviationsMoreThanPeriodControl.setValue('');
    }

    deviationsMultiplesOfControl.updateValueAndValidity();
    deviationsMoreThanTimesControl.updateValueAndValidity();
    deviationsMultiplesOfPeriodControl.updateValueAndValidity();
    deviationsMoreThanPeriodControl.updateValueAndValidity();

  }


  /////////////////////////////////////////////////////////////

  checkPopupType(val) {
    this.popupType = val
    if (val == 'addSetting') {
      this.selectedItems = [];
      this.selectedItemsLeave = [];
      this.showMaximumHrs = '';
      this.showRoundOff = '';
      this.enableGracePeriod = ''
      this.enableGrace.clear();
      this.gracePeriodSelectedIndex = {
        'firstCheckInLateBy': null,
        'lastCheckOutEarlyBy': null,
        'workingHoursLessBy': null,
        'firstCheckinR2': null,
        // 'firstCheckinR3':null
      }
    }
  }

  closePopup() {
    this.showMaximumHrs = '';
    this.showRoundOff = '';
    this.enableGracePeriod = ''
    this.selectedItems = [];
    this.selectedItemsLeave = [];
    this.addShiftSettingForm.reset()
    this.enableGrace.clear();
    this.gracePeriodSelectedIndex = {
      'firstCheckInLateBy': null,
      'lastCheckOutEarlyBy': null,
      'workingHoursLessBy': null,
      'firstCheckinR2': null,
      // 'firstCheckinR3': null
    }

  }

  ngOnInit(): void {
    let session_obj = this._sessionService.get_user_session();
    let token = JSON.parse(session_obj).token;
    this.decoded_token = jwtDecode(token);
    this.decodedeToken = this.decoded_token.id

    this.product_type = this.decoded_token.product_type;
    this.GeoFenceId = this.decoded_token.geo_location_id
    this.tp_account_id = this.decoded_token.tp_account_id;
    this.getSpecificSettingsDetails()
    this.getUserList()
    this.getShiftDetails()
    this.getDepartmentList()

  }

  getMinimumHours(event: any) {
    this.showMaximumHrs = event.target.value;
  }
  showRoundOf(event) {
    this.showRoundOff = event.target.value
  }

  getSettingType(event) {
    let set = event.target.value
    if (set == 'shift') {
      this.settingType = 'shift'
      this.selectedItems = [];
    } else {
      this.settingType = ''
    }
  }

  EnableGracePeriod(event) {
    this.enableGracePeriod = event.target.checked
  }

  showOverTimeDeviation(event) {
    this.showOverTimeDeviationVal = event.target.checked
  }

  async getSpecificSettingsDetails() {
    let obj = {
      accountid: this.tp_account_id.toString(),
      keyword: '',
      action: 'get_user_specific_settings_list'
    }
    await this.shiftSettingService.getSpecificSettingsDetails(obj
    ).subscribe((res: any) => {
      let decryptData = JSON.parse(this.encriptedService.aesDecrypt(res.commonData))
      this.shiftSettingDetails = decryptData.data;
    })

  }


  parseApplicableForLength(applicableForString: string): number {
    try {
      const applicableForArray = JSON.parse(applicableForString);
      return applicableForArray.length;
    } catch (error) {
      return 0;
    }
  }

  submitData(val) {

    let deductLeaveReason = !this.addShiftSettingForm.get('enableGrace').getRawValue()[0]?.deductLeaveReason ? [] : this.addShiftSettingForm.get('enableGrace').getRawValue()[0]?.deductLeaveReason;

    for (let i = 0; i < deductLeaveReason.length; i++) {
      let idx = this.leaveList.findIndex(el => el.leave_id == deductLeaveReason[i].leave_id);

      if (idx != -1) {
        deductLeaveReason[i]['el_sn'] = this.leaveList[idx].el_sn;
        deductLeaveReason[i]['leave_ctg'] = this.leaveList[idx].leave_ctg;
        deductLeaveReason[i]['leavetypecode'] = this.leaveList[idx].leavetypecode;
      }

    }
    if (this.addShiftSettingForm.invalid) {
      return this.addShiftSettingForm.markAllAsTouched();
    } else {
      let uniqueApplicable_for = this.selectedItems.reduce((acc, obj) => {
        const existingItem = acc.find(item => item.emp_code === obj.emp_code);
        if (!existingItem) {
          acc.push(obj);
        }
        return acc;
      }, []);

      let obj = {
        action: (val == 'addSetting') ? "save_user_specific_settings" : 'update_user_specific_settings',
        setting_id: (val == 'addSetting') ? "" : this.editshiftSettingDetails.setting_id?.toString(),
        customeraccountid: this.tp_account_id?.toString(),
        settings_name: this.addShiftSettingForm.value.settings_name,
        settings_type: this.addShiftSettingForm.value.settings_type,
        shift_id: (((this.settingType == 'shift') || this.addShiftSettingForm.value.settings_type == 'shift') && this.addShiftSettingForm.value.shift_id) ? this.addShiftSettingForm.value.shift_id : null,
        user_id: (this.addShiftSettingForm.value.settings_type == 'users' && this.selectedItems.length > 0) ? uniqueApplicable_for : null,
        total_working_hours_cal: this.addShiftSettingForm.value.total_hrs_cal,
        minimum_working_hours_req_for_day: this.addShiftSettingForm.value.minimum_hrs,
        manual_input_shift_hours: this.addShiftSettingForm.value.manual_input,
        full_day_time: (this.addShiftSettingForm.value.manual_input == 'manual_input' && this.addShiftSettingForm.value.minimum_hrs == 'Strict' && this.addShiftSettingForm.value.full_day) ? this.addShiftSettingForm.value.full_day : '',
        half_day_time: (this.addShiftSettingForm.value.manual_input == 'manual_input' && this.addShiftSettingForm.value.minimum_hrs == 'Strict' && this.addShiftSettingForm.value.half_day) ? this.addShiftSettingForm.value.half_day : '',
        per_day_time: (this.addShiftSettingForm.value.minimum_hrs == 'Lenient' && this.addShiftSettingForm.value.manual_input == 'manual_input_len' && this.addShiftSettingForm.value.per_day) ? this.addShiftSettingForm.value.per_day : '',
        max_hours_per_day_time: (this.addShiftSettingForm.value.minimum_hrs == 'Lenient' && this.addShiftSettingForm.value.max_per_day) ? this.addShiftSettingForm.value.max_per_day : '',
        show_overtime_deviation: (this.showOverTimeDeviationVal == true) ? 'Y' : 'N',
        is_max_hours_required: (this.addShiftSettingForm.value.max_hrs == 'Enable') ? 'Y' : 'N',
        max_full_day_time: this.addShiftSettingForm.value.max_full_day,
        max_half_day_time: this.addShiftSettingForm.value.max_half_day,
        is_round_off: (this.addShiftSettingForm.value.round_of == 'Enable') ? 'Y' : 'N',
        first_checkin: (this.addShiftSettingForm.value.firstCheckIn) ? this.addShiftSettingForm.value.firstCheckIn.toString() : null,
        last_check_out: (this.addShiftSettingForm.value.last_checkout) ? this.addShiftSettingForm.value.last_checkout.toString() : null,
        worked_hours: (this.addShiftSettingForm.value.worked_hours) ? this.addShiftSettingForm.value.worked_hours.toString() : null,
        enable_grace_period: (this.enableGracePeriod == true) ? 'Y' : 'N',
        is_mobile_check_in_check_out: (this.addShiftSettingForm.value.mobile_check_in_out == 'Enable') ? 'Y' : 'N',
        calendar_enable_disable: (this.addShiftSettingForm.value.calender_check_in_out),
        rule_txt: this.addShiftSettingForm.get('enableGrace').getRawValue(),
        rule_id: "1,2",
        userby: this.decodedeToken?.toString(),
        userip: "::1",
      }


      this.shiftSettingService.saveSpecificSettings(obj).subscribe((res: any) => {
        if (res.statusCode) {
          this.toastr.success(res.message);
          this.getSpecificSettingsDetails()
          this.addShiftSettingForm.reset()
        } else {
          this.toastr.error(res?.message);
          this.addShiftSettingForm.reset()

        }
      })

    }

  }



  // parseUserIds(userIdsString: string): any[] {
  //   try {
  //     return JSON.parse(userIdsString) as any[];
  //   } catch (error) {
  //     return [];
  //   }
  // }


  // patchData(val){
  //   this.editshiftSettingDetails=val
  //   this.showMaximumHrs=(this.editshiftSettingDetails?.is_max_hours_required=='Y')?'Enable':'Disable'
  //   this.showRoundOff=(this.editshiftSettingDetails?.is_round_off =='Y')?'Enable':'Disable'
  //   this.enableGracePeriod = (this.editshiftSettingDetails?.enable_grace_period=='Y')? true:false
  //   let user_id
  //   if(val?.user_id.length>0 && val?.user_id !== 'null'){
  //    user_id=JSON.parse(val?.user_id)
  //    this.selectedItems=user_id
  //   }


  // //////////////////////////////////form Array /////////////////////////////


  // let parseRuleText = JSON.parse(this.editshiftSettingDetails.rule_txt);
  // this.enableGrace.clear();
  // let dataArray: any = []
  // dataArray = this.addShiftSettingForm.get('enableGrace') as FormArray;

  // parseRuleText.forEach(item => {
  //     dataArray.push(this.fb.group({
  //       firstCheckInLateBy: item.firstCheckInLateBy,
  //       firstCheckInLateTime:  [{value: item.firstCheckInLateTime, disabled: !item.firstCheckInLateTime}],
  //       lastCheckOutEarlyBy: item.lastCheckOutEarlyBy,
  //       lastCheckOutEarlyTime: [{value: item.lastCheckOutEarlyTime, disabled: !item.lastCheckOutEarlyTime}],
  //       workingHoursLessBy: item.workingHoursLessBy,
  //       workingHoursLessTime:[{value: item.workingHoursLessTime, disabled: !item.workingHoursLessTime}],
  //       deviationsMoreThanTimes:[{value: item.deviationsMoreThanTimes, disabled: !item.deviationsMoreThanTimes}],
  //       deviationsMoreThanPeriod:[{value: item.deviationsMoreThanPeriod, disabled: !item.deviationsMoreThanPeriod}],
  //       deviationsMultiplesOf: [{value: item.deviationsMultiplesOf, disabled: !item.deviationsMultiplesOf}],
  //       deviationsMultiplesOfPeriod: [{value: item.deviationsMultiplesOfPeriod, disabled: !item.deviationsMultiplesOfPeriod}],
  //       deductLeaveBalanceDays: item.deductLeaveBalanceDays,
  //       deductLeaveReasonTypes: item.deductLeaveReasonTypes,
  //       deviationsRadio: item.deviationsRadio,
  //       deductLeaveBalance:item.deductLeaveBalance,
  //       deductLeaveReason:item.deductLeaveReason,
  //     }));
  //   });


  // /////////////////////////////////////////////////////////////////////////

  //   this.addShiftSettingForm.patchValue({
  //   settings_name:this.editshiftSettingDetails?.settings_name,
  //   settings_type:this.editshiftSettingDetails?.settings_type,
  //   user_id:user_id,
  //   shift_id:this.editshiftSettingDetails?.shift_id,
  //   full_day:this.editshiftSettingDetails?.full_day_time,
  //   half_day:this.editshiftSettingDetails?.half_day_time,
  //   per_day:this.editshiftSettingDetails?.per_day_time,
  //   max_per_day:this.editshiftSettingDetails?.max_hours_per_day_time,
  //   total_hrs_cal:this.editshiftSettingDetails?.total_working_hours_calculation,
  //   minimum_hrs:this.editshiftSettingDetails?.minimum_working_hours_required_for_day,
  //   manual_input:this.editshiftSettingDetails?.manual_input_shift_hours,
  //   show_over_time:(this.editshiftSettingDetails?.show_overtime_deviation =='Y')? true:false,
  //   max_hrs:this.showMaximumHrs,
  //   max_full_day:this.editshiftSettingDetails?.max_full_day_time,
  //   max_half_day:this.editshiftSettingDetails?.max_half_day_time,
  //   round_of:this.showRoundOff,
  //   firstCheckIn:this.editshiftSettingDetails?.first_checkin,
  //   last_checkout:this.editshiftSettingDetails?.last_check_out,
  //   worked_hours:this.editshiftSettingDetails?.worked_hours,
  //   grace_period: this.enableGracePeriod,
  //   mobile_check_in_out:(this.editshiftSettingDetails.is_mobile_check_in_check_out=='Y')?'Enable':'Disable',
  //   calender_check_in_out:(this.editshiftSettingDetails.calendar_enable_disable=='Y')?'Enable':'Disable',

  //  })


  // }



  patchData(val) {
    this.gracePeriodSelectedIndex = {
      'firstCheckInLateBy': null,
      'lastCheckOutEarlyBy': null,
      'workingHoursLessBy': null,
      'firstCheckinR2': null,
      // 'firstCheckinR3':null
    }
    this.editshiftSettingDetails = val
    this.showMaximumHrs = (this.editshiftSettingDetails?.is_max_hours_required == 'Y') ? 'Enable' : 'Disable'
    this.showRoundOff = (this.editshiftSettingDetails?.is_round_off == 'Y') ? 'Enable' : 'Disable'
    this.enableGracePeriod = (this.editshiftSettingDetails?.enable_grace_period == 'Y') ? true : false
    let user_id
    if (val?.user_id.length > 0 && val?.user_id !== 'null') {
      user_id = JSON.parse(val?.user_id)
      this.selectedItems = user_id
    }

    //////////////////////////////////form Array /////////////////////////////

    let parseRuleText = JSON.parse(this.editshiftSettingDetails.rule_txt);

    this.enableGrace.clear();
    let dataArray: any = []
    dataArray = this.addShiftSettingForm.get('enableGrace') as FormArray;
    parseRuleText.forEach(item => {
      dataArray.push(this.fb.group({
        firstCheckInLateBy: item.firstCheckInLateBy,
        firstCheckInLateTime: [{ value: item.firstCheckInLateTime, disabled: !item.firstCheckInLateTime }],
        lastCheckOutEarlyBy: item.lastCheckOutEarlyBy,
        lastCheckOutEarlyTime: [{ value: item.lastCheckOutEarlyTime, disabled: !item.lastCheckOutEarlyTime }],
        workingHoursLessBy: item.workingHoursLessBy,
        workingHoursLessTime: [{ value: item.workingHoursLessTime, disabled: !item.workingHoursLessTime }],
        deviationsMoreThanTimes: [{ value: item.deviationsMoreThanTimes, disabled: !item.deviationsMoreThanTimes }],
        deviationsMoreThanPeriod: [{ value: item.deviationsMoreThanPeriod, disabled: !item.deviationsMoreThanPeriod }],
        deviationsMultiplesOf: [{ value: item.deviationsMultiplesOf, disabled: !item.deviationsMultiplesOf }],
        deviationsMultiplesOfPeriod: [{ value: item.deviationsMultiplesOfPeriod, disabled: !item.deviationsMultiplesOfPeriod }],
        deductLeaveBalanceDays: item.deductLeaveBalanceDays,
        deductLeaveReasonTypes: item.deductLeaveReasonTypes,
        deviationsRadio: item.deviationsRadio,
        deductLeaveBalance: item.deductLeaveBalance,
        firstCheckinR2: item.firstCheckinR2,
        firstCheckinR2LateTime: [{ value: item.firstCheckinR2LateTime, disabled: !item.firstCheckinR2LateTime }],
        // firstCheckinR3 : item.firstCheckinR3,
        // firstCheckinR3LateTime : [{value :item.firstCheckinR3LateTime,disbaled: !item.firstCheckinR3LateTime}],
        deductLeaveReason: this.fb.array(item.deductLeaveReason ? item.deductLeaveReason.map(reason => this.fb.control(reason)) : []),
      }, { validators: this.atLeastOneFieldRequiredValidator() }));

    });


    dataArray.updateValueAndValidity();


    this.addShiftSettingForm.patchValue({
      settings_name: this.editshiftSettingDetails?.settings_name,
      settings_type: this.editshiftSettingDetails?.settings_type,
      user_id: user_id,
      shift_id: this.editshiftSettingDetails?.shift_id,
      full_day: this.editshiftSettingDetails?.full_day_time,
      half_day: this.editshiftSettingDetails?.half_day_time,
      per_day: this.editshiftSettingDetails?.per_day_time,
      max_per_day: this.editshiftSettingDetails?.max_hours_per_day_time,
      total_hrs_cal: this.editshiftSettingDetails?.total_working_hours_calculation,
      minimum_hrs: this.editshiftSettingDetails?.minimum_working_hours_required_for_day,
      manual_input: this.editshiftSettingDetails?.manual_input_shift_hours,
      show_over_time: (this.editshiftSettingDetails?.show_overtime_deviation == 'Y') ? true : false,
      max_hrs: this.showMaximumHrs,
      max_full_day: this.editshiftSettingDetails?.max_full_day_time,
      max_half_day: this.editshiftSettingDetails?.max_half_day_time,
      round_of: this.showRoundOff,
      firstCheckIn: this.editshiftSettingDetails?.first_checkin,
      last_checkout: this.editshiftSettingDetails?.last_check_out,
      worked_hours: this.editshiftSettingDetails?.worked_hours,
      grace_period: this.enableGracePeriod,
      mobile_check_in_out: (this.editshiftSettingDetails.is_mobile_check_in_check_out == 'Y') ? 'Enable' : 'Disable',
      calender_check_in_out: (this.editshiftSettingDetails.calendar_enable_disable),
    })



    for (let i in dataArray.value) {
      if (dataArray.value[i]['firstCheckInLateBy'] == true) {
        this.gracePeriodSelectedIndex['firstCheckInLateBy'] = parseInt(i);
      }
      if (dataArray.value[i]['lastCheckOutEarlyBy'] == true) {
        this.gracePeriodSelectedIndex['lastCheckOutEarlyBy'] = parseInt(i);
      }
      if (dataArray.value[i]['workingHoursLessBy'] == true) {
        this.gracePeriodSelectedIndex['workingHoursLessBy'] = parseInt(i);
      }
      if (dataArray.value[i]['firstCheckinR2'] == true) {
        this.gracePeriodSelectedIndex['firstCheckinR2'] = parseInt(i);
      }
      // if(dataArray.value[i]['firstCheckinR3'] == true) {
      //   this.gracePeriodSelectedIndex['firstCheckinR3'] = parseInt(i);
      // }
    }

    const enableGrace2 = this.addShiftSettingForm.get('enableGrace') as FormArray;
    enableGrace2.controls.forEach((group, i) => {
      if (this.gracePeriodSelectedIndex['firstCheckInLateBy'] !== null && i !== this.gracePeriodSelectedIndex['firstCheckInLateBy']) {
        group.get('firstCheckInLateBy').disable();
      }

      if (this.gracePeriodSelectedIndex['lastCheckOutEarlyBy'] !== null && i !== this.gracePeriodSelectedIndex['lastCheckOutEarlyBy']) {
        group.get('lastCheckOutEarlyBy').disable();
      }

      if (this.gracePeriodSelectedIndex['workingHoursLessBy'] !== null && i !== this.gracePeriodSelectedIndex['workingHoursLessBy']) {
        group.get('workingHoursLessBy').disable();
      }
      if (this.gracePeriodSelectedIndex['firstCheckinR2'] !== null && i !== this.gracePeriodSelectedIndex['firstCheckinR2']) {
        group.get('firstCheckinR2').disable();
      }
      // if (this.gracePeriodSelectedIndex['firstCheckinR3'] !== null && i !== this.gracePeriodSelectedIndex['firstCheckinR3']) {
      //   group.get('firstCheckinR3').disable();
      // }
    });
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


  async getUserList() {
    let obj =
    {
      customeraccountid: this.tp_account_id.toString(),
      productTypeId: this.product_type,
      GeoFenceId: this.GeoFenceId
    }
    await this.shiftSettingService.getUserList(obj
    ).subscribe((res: any) => {
      this.userList = [];
      let userList = res.commonData

      userList.map((item) => {
        item.emp_name = item.emp_name + `  (${item.orgempcode != '' ? item.orgempcode : (item.tpcode ? item.tpcode : item.emp_code)})`
        if (item.joiningstatus.trim() == 'Active' && item.dateofrelieveing == '') {
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
    this.selectedItems = this.selectedItems.filter((selectedItem) => selectedItem.emp_code !== item.emp_code);
  }

  onUnselectAll(items) {
    this.selectedItems = [];
  }



  onItemSelectLeave(item: any) {
    this.selectedItemsLeave.push(item);
  }

  onSelectAllLeave(items: any) {
    this.selectedItemsLeave = [...items];
  }

  onItemUnselectLeave(item: any) {
    this.selectedItemsLeave = this.selectedItems.filter((selectedItem) => selectedItem.emp_code !== item.emp_code);
  }

  onUnselectAllLeave(items) {
    this.selectedItemsLeave = [];
  }


  async getDepartmentList() {
    let obj = {
      action: "typesofleave_list",
      accountid: this.tp_account_id?.toString(),
      keyword: ""
    }
    await this.shiftService.getDepartmentList(obj).subscribe((res: any) => {
      let decryptData = JSON.parse(this.encriptedService.aesDecrypt(res.commonData))
      this.leaveList = decryptData.data
      this.dropdownSettingsLeave = {
        singleSelection: false,
        idField: 'leave_id',
        textField: 'leave_type',
        selectAllText: 'Select All',
        unSelectAllText: 'UnSelect All',
        itemsShowLimit: 3,
        allowSearchFilter: true
      };
    })
  }



  ///////////////////////////////////////////////////////////////////

  getPayPeriod(event: any, index: any) {
    const particularValue = (this.addShiftSettingForm.get('enableGrace') as FormArray).at(index).get('deviationsRadio').value;

    if (particularValue == 'deviation_more_than') {
      this.deviatioMoreThanPeriod = event.target.value
    }

    if (particularValue == 'deviation_multiples') {
      this.getDeviationMultiplePeriod = event.target.value
    }

  }

  getDeviationMoreThan(event: any, index) {
    this.particularValue = (this.addShiftSettingForm.get('enableGrace') as FormArray).at(index).get('deviationsRadio').value;

    if (this.particularValue == 'deviation_more_than') {
      this.deviatioMoreThan = event.target.value
    }

    if (this.particularValue == 'deviation_multiples') {
      this.deviatioMoreThan = event.target.value
    }

  }

  openDeleteModal(id: any) {
    this.delete_setting_id = id
  }


  deleteShift() {
    let obj = {
      action: "delete_user_specific_settings",
      row_id: this.delete_setting_id?.toString(),
      customeraccountid: this.tp_account_id?.toString(),
      status: "0",
      userby: this.tp_account_id?.toString()
    }
    this.shiftService.deleteShiftDetails(obj).subscribe((res: any) => {
      if (res.statusCode) {
        this.getSpecificSettingsDetails()
        this.toastr.success("Deleted succesfully")
      } else {
        let decryptData = JSON.parse(this.encriptedService.aesDecrypt(res.commonData))
        this.toastr.error(decryptData?.message)

      }
    })
  }


}
