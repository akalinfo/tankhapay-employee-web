import { ChangeDetectorRef, Component, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { SessionService } from 'src/app/shared/services/session.service';
import jwtDecode from 'jwt-decode';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { dongleState, grooveState } from 'src/app/app.animation';
import { AlertService } from 'src/app/shared/_alert';
import { GlobalConstants } from 'src/app/shared/global-constants';
import { LeaveMgmtService } from '../leave-mgmt.service';
import { EmployeeService } from '../../employee/employee.service';

declare var $: any;

@Component({
  selector: 'app-add-new-template',
  templateUrl: './add-new-template.component.html',
  styleUrls: ['./add-new-template.component.css'],
  animations: [grooveState, dongleState],
})
export class AddNewTemplateComponent {
  selectedTypecodes: string[] = [];
  showSidebar: boolean = true;
  tp_account_id: any;
  decoded_token: any;
  lead_type_master_data: any = [];
  addNewTemplateForm: FormGroup;
  default_templateId: any = '';
  edit_templateId: any = '';
  submitted: boolean = false;
  update_text: string = 'Add New Template';
  // weeklyOffDays: any;
  accumulate_master_data: any = [];

  showRemoveTemplatePopup: boolean = false;
  checkTemplateAssignedStatus: boolean = false;
  AssignedStatus_Msg: string = '';
  validity_from_dt: any;
  validity_to_dt: any;
  @ViewChild('sd') sdate: ElementRef;
  @ViewChild('ed') edate: ElementRef;

  dropdownSettings: any = {
    singleSelection: false,
    idField: 'typecode',
    textField: 'typename',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    // itemsShowLimit: 3,
    allowSearchFilter: true,
  };
  leave_type_master_data: any = [];
  leave_template_data: any = [];
  state_master_data: any = [];
  clubDropdownSettings: any = {};
  leave_type_master_data_copy: any = [];
  get_template_with_settings_by_id_data: any = [];
  allLeaveTypeDropdownData: any;
  master_AllLeaveTypesDropdownData: any;

  constructor(
    private router: Router,
    private _leaveMgmtService: LeaveMgmtService,
    private toastr: ToastrService,
    private _sessionService: SessionService,
    private _formBuilder: FormBuilder,
    private cdr: ChangeDetectorRef,
    private _alertservice: AlertService,
    private _employeeService: EmployeeService,
  ) {

    if (this.router.getCurrentNavigation().extras.state.templateid != undefined) {
      this.default_templateId = this.router.getCurrentNavigation().extras.state.default_templateId;
      this.edit_templateId = this.router.getCurrentNavigation().extras.state.templateid
      this.update_text = 'Update Template';

    } else if (this.router.getCurrentNavigation().extras.state.default_templateId != undefined) {
      this.default_templateId = this.router.getCurrentNavigation().extras.state.default_templateId;
      this.update_text = 'Add New Template';

    }
  }

  ngOnInit() {
    let session_obj = this._sessionService.get_user_session();
    let token = JSON.parse(session_obj).token;
    this.decoded_token = jwtDecode(token);
    this.tp_account_id = this.decoded_token.tp_account_id;

    this.addNewTemplateForm = this._formBuilder.group({
      templateid: [''],
      templatedesc: ['', Validators.required],
      weekly_off_days: [''],
      weekly_off_days_name: [''],
      weekly_off_days_name_txt: [[], Validators.required],
      leaves_calender: ['Calender Year', Validators.required],
      absent_is_equal_to_loss_of_pay: ['Y', Validators.required],
      attendance_approval_required_for_payout: ['Y', Validators.required],
      leave_type: this._formBuilder.array([]),

      validity_from_dt: [''],
      validity_to_dt: [''],
      leave_description: [''],
      balance_based_on: [''],
      effective_after_unit: ['0'],
      effective_after_unit_type: [''],
      effective_after_from: [''],
      effective_min_paid_days: ['0'],

      carry_forward_type: [''],
      carry_forward_cnt: ['0'],
      carry_forward_unit: [''],
      carry_forward_max_limit: [''],
      carry_forward_expire_cnt: ['0'],
      carry_forward_expire_unit: [''],
      carry_forward_over_all_limit: [''],

      applicable_gender: [''],
      applicable_marital_status: [''],

      wk_beetwen_lp_as_leave_yn: [''],
      wk_beetwen_lp_as_leave_count: ['0'],
      ho_btwn_lp_as_leave_yn: [''],
      ho_btwn_lp_as_leave_count: ['0'],
      is_apply_leave_when_exceed_bal_yn: [''],
      is_apply_leave_when_exceed_bal_if_y: [''],
      duration_allowed: [''],
      allow_requests_for_past_dates_yn: [''],
      requests_for_past_days_cnt_if_y: ['0'],
      allow_requests_for_future_dates_yn: [''],
      requests_for_future_days_cnt_if_y: ['0'],
      admins_view_apply_leave_yn: [''],
      min_leave_per_appl_can_awail_yn: [''],
      min_leave_can_awail_cnt_if_y: ['0'],
      number_of_leaves_in_a_week_yn: [''],
      number_of_leaves_in_a_week_cnt_if_y: ['0'],

      number_of_absent_in_a_week_yn: [''],
      number_of_absent_in_a_week_cnt_if_y: ['0'],

      max_leave_per_appl_can_awail_yn: [''],
      max_leave_can_awail_cnt_if_y: ['0'],
      min_gap_btwn_two_leave_appl_yn: [''],
      min_gap_btwn_two_leave_appl_cnt_if_y: ['0'],
      file_upload_if_exceed_yn: [''],
      file_upload_if_exceed_cnt_if_y: ['0'],
      max_appls_in_period_yn: [''],
      max_appls_in_period_cnt_if_y: ['0'],
      max_appls_in_period_cnt_unit: [''],
      non_combinable_leaves_typecode: [''],

      is_probation_prd_enable: ['N'],
      probation_prd_months: ['0'],
      prob_prd_over_template: [''],

      enable_weekends_holiddys_absent_yn: ['N'],
      enable_weekends_absent_yn: [''],
      enable_holiddys_absent_yn: [''],

      club_leave_with_off: [''],
      // holiday_state_name: [''],
      full_day_credit_weeklyoff: [''],

      is_leave_clubbing_allowed: [''],
      clubbing_leave_type: this._formBuilder.array([])
    });


    let date = new Date();
    let yy = date.getFullYear();

    this.validity_from_dt = '01' + '-' + '01' + '-' + yy;

    this.addNewTemplateForm.patchValue({
      validity_from_dt: this.validity_from_dt,
    });
    this.addNewTemplateForm.get('leave_type').valueChanges.subscribe(() => {
      this.updateMaximumLimit();
      this.updateSelectedTypecodes();
    });

    this.accumulate_master_data = ['Monthly', 'Yearly', 'OneTime', 'Quarterly'];

    // this.get_lead_type_bytemplate();
    this.get_lead_type_all();
    // console.log(this.default_templateId)

    if (this.edit_templateId != ''){

      Promise.all([this.get_template_by_id(), this.get_lead_type_bytemplate()])
        .then(([leadTypeData, templateData]) => {
          let club_leave_with_off = [];
          // console.log('3')

          let temp = !this.get_template_with_settings_by_id_data?.club_leave_with_off ? [] : this.get_template_with_settings_by_id_data?.club_leave_with_off.split(',');
          if (temp.length > 0) {
            const mySet = new Set(temp);
            this.leave_type_master_data_copy.forEach((el: any) => {
              if (mySet.has(el.typecode)) {
                club_leave_with_off.push(el);
              }
            })
          }

          this.addNewTemplateForm.patchValue({
            club_leave_with_off: club_leave_with_off,
          })

        })
      this.GetTemplateAssignedStatus(this.edit_templateId);
    } else {
      this.get_lead_type_bytemplate();
      this.add_new_leave_type();
    }

    this.get_tp_leave_temeplate();
    // this.getStateMaster();

    this.addNewTemplateForm.get('is_leave_clubbing_allowed')?.valueChanges.subscribe(value => {
    // Re-run validation on all FormGroups inside the FormArray
    this.clubbing_leave_type.controls.forEach(group => {
      this.setupIsClubbingWatcher(group as FormGroup);
    });
  });

  }

  ngAfterViewInit() {
    setTimeout(() => {
      $(function () {
        $('#startDate').datepicker({
          dateFormat: 'dd-mm-yy',
          changeMonth: true,
          changeYear: true,
          // maxDate: new Date()
        });
        $('#endDate').datepicker({
          dateFormat: 'dd-mm-yy',
          changeMonth: true,
          changeYear: true,
        });

        $('body').on('change', '#startDate', function () {
          $('#recdate').trigger('click');
        });

        $('body').on('change', '#endDate', function () {
          $('#recdate').trigger('click');
        })

      });

      this.clubDropdownSettings = {
        singleSelection: false,
        idField: 'typecode',
        textField: 'typename',
        selectAllText: 'Select All',
        unSelectAllText: 'UnSelect All',
        itemsShowLimit: 3,
        allowSearchFilter: true,
      };
    }, 0)
  }

  GetTemplateAssignedStatus(templateid: any) {
    this._leaveMgmtService.check_template_is_editable({
      'accountId': this.tp_account_id.toString(),
      'template_id': templateid,
    })
      .subscribe((resData: any) => {
        if (resData.statusCode) {
          if (resData.commonData.msgcd == '1') {
            this.checkTemplateAssignedStatus = true;
            this.AssignedStatus_Msg = resData.message;
          } else {
            // this.toastr.error(resData.message, 'Oops!');
            console.log(resData.message);
          }

        } else {
          console.log(resData.message);
          // this.toastr.error(resData.message, 'Oops!');
        }
      })
  }


  toggle() {
    this.showSidebar = !this.showSidebar;
  }

  get antctrl() {
    return this.addNewTemplateForm.controls;
  }
  get antf() {
    return this.addNewTemplateForm.value;
  }
  get leave_type() {
    return this.addNewTemplateForm.get('leave_type') as FormArray;
  }

  get clubbing_leave_type() {
    return this.addNewTemplateForm.get('clubbing_leave_type') as FormArray;
  }
  getLeaveTypeFormGroup(index: number): FormGroup {
    return this.leave_type.at(index) as FormGroup;
  }

  new_leave_type() {
    return this._formBuilder.group({
      days: ['0', [Validators.required, Validators.min(0), Validators.max(365)]],
      typecode: ['', Validators.required],
      typename: ['', Validators.required],
      is_carry_forward: ['N', Validators.required],
      accumulate: ['', Validators.required],
      description: [''],
      maximum_limit: ['0', [Validators.required, Validators.max(365)]],
      disable_max_limit: [true],

      encashment_unit: ['0'],
      encashment_type: ['unit'],
      encashment_maxlimit: ['0'],
      // maximum_balance: ['0'],
      // opening_balance: ['0'],

      effective_after_unit: ['0'],
      effective_after_unit_type: ['month'],
      effective_after_from: ['DOJ'],
      effective_min_paid_days: ['0', [Validators.min(0), Validators.max(25)]],
    });
  }
  updateMaximumLimit() {
    const leaveTypeControls = this.leave_type.controls;
    leaveTypeControls.forEach(control => {
      const daysControl = control.get('days');
      const carryForwardControl = control.get('is_carry_forward');
      const accumulateControl = control.get('accumulate');
      const maximumLimitControl = control.get('maximum_limit');

      const daysValue = daysControl.value;
      const carryForwardValue = carryForwardControl.value;
      const accumulateValue = accumulateControl.value;

      if (daysValue && carryForwardValue === 'Y' && accumulateValue === 'Monthly') {
        const maximumLimit = (parseFloat(daysValue) * 12).toFixed(1);
        maximumLimitControl.setValue(maximumLimit.toString(), { emitEvent: false }); // Prevent triggering valueChanges
      }
      // else if (daysValue && carryForwardValue === 'Y' && accumulateValue === 'Half-Yearly') {
      //   let temp_val = daysValue*2;
      else if (daysValue && carryForwardValue === 'Y' && accumulateValue === 'Quarterly') {
        let temp_val = daysValue*4;
        const maximumLimit = parseFloat(temp_val.toString()).toFixed(1);
        maximumLimitControl.setValue(maximumLimit.toString(), { emitEvent: false }); // Prevent triggering valueChanges

      }
      else if (daysValue && carryForwardValue === 'Y' && accumulateValue === 'OneTime') {
        const maximumLimit = parseFloat(daysValue).toFixed(1);
        maximumLimitControl.setValue(maximumLimit.toString(), { emitEvent: false }); // Prevent triggering valueChanges
      }
      else if (daysValue && carryForwardValue === 'Y' && accumulateValue === 'Yearly') {
        const maximumLimit = parseFloat(daysValue).toFixed(1);
        maximumLimitControl.setValue(maximumLimit.toString(), { emitEvent: false }); // Prevent triggering valueChanges
      }
    });
  }

  updateSelectedTypecodes() {
    this.selectedTypecodes = [];
    this.leave_type.controls.forEach(control => {
      const typecode = control.get('typecode').value;
      if (typecode) {
        this.selectedTypecodes.push(typecode);
      }
    });

    // console.log(this.selectedTypecodes);
  }

  add_new_leave_type() {
    this.leave_type.push(this.new_leave_type());
    this.updateMaximumLimit(); // Update maximum limit when a new leave type is added
    this.updateSelectedTypecodes(); // Update selected typecodes array
  }

  // remove_leave_type(index) {
  //   this.leave_type.removeAt(index);
  // }

  remove_leave_type(index: any) {


    // remove from leave_type and clubbing_leave_type formArrays at given index 
    this.leave_type.removeAt(index);
    this.clubbing_leave_type.removeAt(index); 
    
    let arr = this.addNewTemplateForm.value.leave_type.map((el: any) => {
      return { typecode: el.typecode, typename: el.typename };
    });

    this.leave_type_master_data = arr.length > 0 ? arr : [];
    //this.leave_type_master_data = arr;

  }

  backToLeaveTemplate() {
    this.router.navigate(['leave-mgmt/leave-settings']);
  }

  get_tp_leave_temeplate() {
    this._leaveMgmtService.get_tp_leave_temeplate({
      "customeraccountid": this.tp_account_id.toString(),
    })
      .subscribe({
        next: (resData: any) => {
          if (resData.statusCode) {
            let leave_template_data = resData.commonData.data;
            if (this.update_text == 'Update Template') {
              this.leave_template_data = leave_template_data.filter((el: any) => {
                if (el.templateid != this.edit_templateId) {
                  return el;
                }
              })
            }
            else
             {
              this.leave_template_data = leave_template_data;
            }
          } else {
            this.leave_template_data = [];
            //this.toastr.error(resData.message, 'Oops!');
          }
        }, error: (e) => {
          this.leave_template_data = [];
          console.log(e);
        }
      })
  }

  get_lead_type_bytemplate() {
    return new Promise((resolve, reject) => {

      let obj = {
        'customeraccountid': this.tp_account_id.toString(),
        'action': 'get_leave_type_by_templeteid',
        'templeteid': !this.edit_templateId ? '' : this.edit_templateId
      }
      // console.log("OBJJJJJJJ", obj);
    this._leaveMgmtService.get_leave_types_by_account(obj)
      .subscribe((resData: any) => {
        if (resData.statusCode) {
          // this.leave_type_master_data = resData.commonData.data;
          if (resData.commonData.length > 0) {
            this.leave_type_master_data = JSON.parse(JSON.stringify(resData.commonData));
            this.leave_type_master_data_copy = JSON.parse(JSON.stringify(resData.commonData));

          }

          // console.log(this.leave_type_master_data);

        } else {
          this.leave_type_master_data = [];
          this.toastr.error(resData.message, 'Oops!');
        }

        resolve(true);
      })
    })

  }


  get_lead_type_all() {
      this._leaveMgmtService.getLeaveTemplate({
        'customeraccountid': this.tp_account_id.toString(),
        'action': 'get_lead_type'
      })
        .subscribe((resData: any) => {
          if (resData.statusCode) {
            if (resData.commonData.data.length > 0) {
              let arr = resData.commonData.data;
              this.lead_type_master_data = arr.filter(el => el.leavetype != 'CO' && !el.leave_days);

              // All Leaves Dropdown Data
              this.allLeaveTypeDropdownData = this.lead_type_master_data.map((el: any) => {
                return { typecode: el.leavetype, typename: el.leavetypename };
              });

              this.master_AllLeaveTypesDropdownData = this.allLeaveTypeDropdownData;
            }

          } else {
            this.lead_type_master_data = [];
            this.toastr.error(resData.message, 'Oops!');
          }

        })

  }


  // weeklyCheckBox(e: any) {
  //   const check_dayname = e.target.name;
  //   const check_day = e.target.value;

  //   let days_name = check_dayname;
  //   let days = check_day;

  //   if (this.antf.weekly_off_days_name !== '') {
  //     const split_days = this.antf.weekly_off_days.split(',');
  //     const split_days_name = this.antf.weekly_off_days_name.split(',');
  //     const index = split_days.findIndex((ob: any) => ob == check_day);

  //     if (index === -1) {
  //       split_days_name.push(check_dayname);
  //       split_days.push(check_day);
  //     } else {
  //       split_days_name.splice(index, 1);
  //       split_days.splice(index, 1);
  //     }

  //     days_name = split_days_name.join(',');
  //     days = split_days.join(',');
  //   }

  //   this.addNewTemplateForm.patchValue({
  //     weekly_off_days_name: days_name,
  //     weekly_off_days: days,
  //   });

  //   // console.log(this.antf);
  // }

  multiWeekCheckBox(event: any, day: string) {
    const checkedWeeks = Array.from(event.target.parentNode.parentNode.querySelectorAll('input[type="checkbox"]:checked')).map((checkbox: any) => checkbox.value);

    // Get current value of weekly_off_days_name_txt or initialize it as an empty array
    let updatedArray = this.addNewTemplateForm.value.weekly_off_days_name_txt || [];

    // Remove the current day's entry if it exists
    updatedArray = updatedArray.filter(item => item.week_name !== day);

    if (checkedWeeks.length > 0) {
      // Add new entry for the current day
      updatedArray.push({ week_name: day, week_no: checkedWeeks.join(',') });
    }

    this.addNewTemplateForm.patchValue({ weekly_off_days_name_txt: updatedArray });
    let dayNames = updatedArray.map(item => item.week_name).join(',');

    this.addNewTemplateForm.patchValue({
      weekly_off_days_name: dayNames.toString(),
      weekly_off_days: dayNames.split(',').length.toString(),
    });

    // set the old value of weekly_off_days_name_txt
    // const dayToIndex = {
    //   'Sunday': 1,
    //   'Monday': 2,
    //   'Tuesday': 3,
    //   'Wednesday': 4,
    //   'Thursday': 5,
    //   'Friday': 6,
    //   'Saturday': 7
    // };
    // let dayIndices = updatedArray.map(item => dayToIndex[item.week_name]).join(',');
    //  console.log(dayNames, dayNames.split(',').length.toString());




    // end
  }



  update() {

    this.submitted = true;

    if (!this.antf.templatedesc) {
      this._alertservice.error('Template name can not be blank', 'Oops!');
      return;
    }

    // console.log(this.leave_type.valid);
    // console.log(this.addNewTemplateForm.value);
    // console.log(this.default_templateId);
    // console.log(this.antf.leave_type);

    for (let i = 0; i < this.leave_type.value.length; i++) {
      let formGroup: any = this.getLeaveTypeFormGroup(i);
      // console.log(formGroup.value)

      // if (formGroup.value.encashment_type == 'percent') {
      //   if (!formGroup.value.encashment_maxlimit) {
      //     this.toastr.error('Encashment Max Limit required', 'Oops!');
      //     console.log('Encashment Max Limit Required');
      //     return;
      //   }
      //   if (formGroup.value.encashment_unit > 100) {
      //     this.toastr.error("Encashment Percent can't exceed 100", 'Oops!');
      //     console.log("Encashment Percent can't exceed 100");
      //     return;
      //   }
      // }
      if (!formGroup.value.typename) {
        this.toastr.error('Leave Code is required', 'Oops!');
        return;
      }
      if (!formGroup.value.days) {
        this.toastr.error('Days is required', 'Oops!');
        return;
      }
      if (!formGroup.value.accumulate) {
        this.toastr.error('Accumulate is required', 'Oops!');
        return;
      }
      if (formGroup.value.effective_min_paid_days < 0 || formGroup.value.effective_min_paid_days > 25) {
        this.toastr.error('Min paid days should be between 0 and 25', 'Oops!');
        return;
      }
    }

    // return;


    // if (this.antf.is_apply_leave_when_exceed_bal_yn == 'Y' && !this.antf.is_apply_leave_when_exceed_bal_if_y) {
    //   this.toastr.error("Is Apply leave when exceed balance value can't be blank", 'Oops!');
    //   console.log("Is Apply leave when exceed balance can't be blank");
    //   return;
    // }

    if (this.antf.is_probation_prd_enable == 'Y') {
      if (!this.antf.prob_prd_over_template) {
        this.toastr.error("Template after the probation period is over can't be blank", 'Oops!');
        // console.log("Template after the probation period is over can't be blank");
        return;
      }
      if (!this.antf.probation_prd_months) {
        this.toastr.error("Probation Period from DOJ can't be blank", 'Oops!');
        // console.log("Probation Period from DOJ can't be blank");
        return;
      }
    }

    if (this.antf.enable_weekends_holiddys_absent_yn == 'Y') {
      if ((!this.antf.enable_weekends_absent_yn && !this.antf.enable_holiddys_absent_yn)) {
        this.toastr.error("Both enable weekends or holidays value can't be blank", 'Oops!');
        // console.log("Both enable weekends or holidays value can't be blank");
        return;
      }

      if (!this.antf.enable_weekends_absent_yn) {
        this.addNewTemplateForm.patchValue({
          enable_weekends_absent_yn: 'N',
        })
      } else if (!this.antf.enable_holiddys_absent_yn) {
        this.addNewTemplateForm.patchValue({
          enable_holiddys_absent_yn: 'N',
        })
      }
    }

    let club_leave_with_off = '';
    if (this.antf?.enable_weekends_absent_yn == 'Y') {
      if (!this.antf.club_leave_with_off || this.antf.club_leave_with_off.length == 0) {
        this.toastr.error('Please select leave type for week-off absent policy', 'Oops!');
        return;
      } else {
        let temp = [];
        this.antf.club_leave_with_off.forEach((el: any) => {
          temp.push(el.typecode);
        })

        club_leave_with_off = temp.join(',')
      }
    }

    // console.log(this.antf);
    // return;

    let action = '';
    let default_template_id = '';
    if (this.update_text == 'Add New Template') {
      action = 'add_new_template';
      default_template_id = '';
    } else if (this.update_text == 'Update Template') {
      if (this.checkTemplateAssignedStatus) {
        action = 'update_template_after_assigned_by_id';
      } else {
        action = 'update_template_by_id';
      }
      default_template_id = this.edit_templateId;
    }

    // this.check_invalid_fields();
    // console.log(this.antf.leave_type)

    for (let i = 0; i < this.leave_type.value.length; i++) {
      let formGroup: any = this.getLeaveTypeFormGroup(i);

      if (formGroup.contains('is_not_editable')) {
        formGroup.removeControl('is_not_editable');
      }

    }


    if(this.addNewTemplateForm.get('clubbing_leave_type').status == 'INVALID'){
      this.addNewTemplateForm.markAllAsTouched();
      this.toastr.error("Please fill all mandatory fields!");
      return;
    }

    // Logic to Check same type code is not allowed while clubbing --
    const formArray = this.addNewTemplateForm.get('clubbing_leave_type') as FormArray;

    for (const group of formArray.controls) {
      const { typecode, leavetypesselected } = group.value;
      const hasSelfClubbed = (leavetypesselected || []).some((item: any) => item.typecode === typecode);

      if (hasSelfClubbed) {
        this.toastr.error(`Leave type "${typecode}" cannot be clubbed with itself.`);
        return;
      }
    }

    if (this.leave_type.valid && this.leave_type.length > 0) {
      let data = {
        "action": action,
        "customeraccountid": this.tp_account_id.toString(),
        "default_templateId": default_template_id.toString(),
        "add_template_txt": {
          "templateid": this.edit_templateId.toString(),
          "templatedesc": this.antf.templatedesc,
          "leave_details": {
             "leave_type": this.antf.leave_type,
             "leaves_calender": this.antf.leaves_calender,
             "weekly_off_days": this.antf.weekly_off_days,
             "weekly_off_days_name": this.antf.weekly_off_days_name,
             "weekly_off_days_name_txt": (this.antf.weekly_off_days_name_txt),
             "absent_is_equal_to_loss_of_pay": this.antf.absent_is_equal_to_loss_of_pay,
             "attendance_approval_required_for_payout": this.antf.attendance_approval_required_for_payout
          }
        },
        "validity_from_dt": this.validity_from_dt,
        "validity_to_dt": this.validity_to_dt,
        "leave_description": this.antf.leave_description,
        "balance_based_on": this.antf.balance_based_on,
        "effective_after_unit": this.antf.effective_after_unit,
        "effective_after_unit_type": this.antf.effective_after_unit_type,
        "effective_after_from": this.antf.effective_after_from,
        "effective_min_paid_days": this.antf.effective_min_paid_days,

        "carry_forward_type": this.antf.carry_forward_type,
        "carry_forward_cnt": this.antf.carry_forward_cnt,
        "carry_forward_unit": this.antf.carry_forward_unit,
        "carry_forward_max_limit": this.antf.carry_forward_max_limit,
        "carry_forward_expire_cnt": this.antf.carry_forward_expire_cnt,
        "carry_forward_expire_unit": this.antf.carry_forward_expire_unit,
        "carry_forward_over_all_limit": this.antf.carry_forward_over_all_limit,
        "applicable_gender": this.antf.applicable_gender,
        "applicable_marital_status": this.antf.applicable_marital_status,
        "wk_beetwen_lp_as_leave_yn": this.antf.wk_beetwen_lp_as_leave_yn,
        "wk_beetwen_lp_as_leave_count": this.antf.wk_beetwen_lp_as_leave_count,
        "ho_btwn_lp_as_leave_yn": this.antf.ho_btwn_lp_as_leave_yn,
        "ho_btwn_lp_as_leave_count": this.antf.ho_btwn_lp_as_leave_count,
        "is_apply_leave_when_exceed_bal_yn": this.antf.is_apply_leave_when_exceed_bal_yn,
        "is_apply_leave_when_exceed_bal_if_y": this.antf.is_apply_leave_when_exceed_bal_if_y,
        "duration_allowed": this.antf.duration_allowed,
        "allow_requests_for_past_dates_yn": this.antf.allow_requests_for_past_dates_yn,
        "requests_for_past_days_cnt_if_y": this.antf.requests_for_past_days_cnt_if_y,
        "allow_requests_for_future_dates_yn": this.antf.allow_requests_for_future_dates_yn,
        "requests_for_future_days_cnt_if_y": this.antf.requests_for_future_days_cnt_if_y,
        "admins_view_apply_leave_yn": this.antf.admins_view_apply_leave_yn,
        "min_leave_per_appl_can_awail_yn": this.antf.min_leave_per_appl_can_awail_yn,
        "min_leave_can_awail_cnt_if_y": this.antf.min_leave_can_awail_cnt_if_y,
        "number_of_leaves_in_a_week_yn": this.antf.number_of_leaves_in_a_week_yn,
        "number_of_leaves_in_a_week_cnt_if_y": this.antf.number_of_leaves_in_a_week_cnt_if_y,

        "number_of_absent_in_a_week_yn": this.antf.number_of_absent_in_a_week_yn,
        "number_of_absent_in_a_week_cnt_if_y": this.antf.number_of_absent_in_a_week_cnt_if_y,

        "max_leave_per_appl_can_awail_yn": this.antf.max_leave_per_appl_can_awail_yn,
        "max_leave_can_awail_cnt_if_y": this.antf.max_leave_can_awail_cnt_if_y,
        "min_gap_btwn_two_leave_appl_yn": this.antf.min_gap_btwn_two_leave_appl_yn,
        "min_gap_btwn_two_leave_appl_cnt_if_y": this.antf.min_gap_btwn_two_leave_appl_cnt_if_y,
        "file_upload_if_exceed_yn": this.antf.file_upload_if_exceed_yn,
        "file_upload_if_exceed_cnt_if_y": this.antf.file_upload_if_exceed_cnt_if_y,
        "max_appls_in_period_yn": this.antf.max_appls_in_period_yn,
        "max_appls_in_period_cnt_if_y": this.antf.max_appls_in_period_cnt_if_y,
        "max_appls_in_period_cnt_unit": this.antf.max_appls_in_period_cnt_unit,
        "non_combinable_leaves_typecode": JSON.stringify(this.antf.non_combinable_leaves_typecode),
        "club_leave_with_off": club_leave_with_off,

        "is_probation_prd_enable": this.antf.is_probation_prd_enable,
        "probation_prd_months": this.antf.probation_prd_months,
        "prob_prd_over_template": this.antf.prob_prd_over_template,
        "enable_weekends_holiddys_absent_yn": this.antf.enable_weekends_holiddys_absent_yn,
        "enable_weekends_absent_yn": this.antf.enable_weekends_absent_yn,
        "enable_holiddys_absent_yn": this.antf.enable_holiddys_absent_yn,
        "full_day_credit_weeklyoff": this.antf.full_day_credit_weeklyoff,
        "is_new_club_leave_policy_applied_yn": this.antf.is_leave_clubbing_allowed,
        "new_club_policy_text": (this.antf.is_leave_clubbing_allowed == 'Y')?this.antf.clubbing_leave_type: [],
        
        // "holiday_state_name": this.antf.holiday_state_name,

      }
      // console.log("Payload:",data);
      

      this._leaveMgmtService.getLeaveTemplate(data)
        .subscribe((resData: any) => {
          if (resData.statusCode) {
            if (resData.commonData.data.msgcd == true) {

              this.toastr.success(resData.commonData.data.msg, 'Success');
              this._alertservice.success(resData.commonData.data.msg,
                GlobalConstants.alert_options_autoClose);
              this.backToLeaveTemplate();
            } else {
              this._alertservice.error(resData.commonData.data.msg,
                GlobalConstants.alert_options_autoClose);
            }
            //
          } else {
            this.toastr.error(resData.message, 'Oops!');
            this._alertservice.error(resData.message,
              GlobalConstants.alert_options_autoClose);
          }
        })

    } else {
      // this.toastr.error('Fill all the mandatory fields', 'Oops!');
      this._alertservice.error('Fill all the mandatory fields',
        GlobalConstants.alert_options_autoClose);
      //return;
    }

  }

  change_encashment_type(val: any, index: any) {
    let formGroup: any = this.getLeaveTypeFormGroup(index);
    formGroup.patchValue({
      encashment_maxlimit: '',
    })
    // console.log(this.addNewTemplateForm.value);
  }

  change_calendar_financial(e: any) {
    let val = e.target.value;
    this.addNewTemplateForm.patchValue({
      'leaves_calender': val
    })

    let date = new Date();
    let dd = date.getDate();
    let mm = date.getMonth() + 1;
    let yy = date.getFullYear();
    if (val == 'Calender Year') {
      this.validity_from_dt = '01' + '-' + '01' + '-' + yy;

    } else if (val == 'Financial Year') {
      if (mm <= 3 && dd <= 31) {
        this.validity_from_dt = '01' + '-' + '04' + '-' + (yy - 1);
      } else {
        this.validity_from_dt = '01' + '-' + '04' + '-' + yy;
      }

    }
    this.validity_to_dt = '';
    this.addNewTemplateForm.patchValue({
      validity_to_dt: '',
      validity_from_dt: this.validity_from_dt,
    });

    // console.log(this.validity_from_dt)
  }

  change_absent_equal_to_lop(e: any) {
    this.addNewTemplateForm.patchValue({
      'absent_is_equal_to_loss_of_pay': e.target.value
    })
  }

  change_att_approval_required_for_payout(e: any) {
    this.addNewTemplateForm.patchValue({
      'attendance_approval_required_for_payout': e.target.value
    })
  }

  get_template_by_id() {
    return new Promise((resolve, reject) => {
      this._leaveMgmtService.getLeaveTemplate({
        // "action": "get_template_by_id",
        "action": "get_template_with_settings_by_id",
        "customeraccountid": this.tp_account_id.toString(),
        "default_templateId": this.edit_templateId.toString(),
      }).subscribe((resData: any) => {

        if (resData.statusCode) {
          this.get_template_with_settings_by_id_data = resData.commonData.data[0];
          let data = resData.commonData.data[0];
          // console.log("TEMPLATE DATA ----------",data);
          let leave_details = data.leave_details;

         
          // Clubbing Leave Type FormArray Patching -
          let arr = leave_details?.leave_type?.map((el: any) => {
            return { typecode: el.typecode, typename: el.typename };
          });

          if (data?.new_club_policy_text == null && arr) {
            this.rebuildLeaveTypeFormArray(arr);
          } else {

            const formArray = new FormArray<FormGroup>([]);

            data?.new_club_policy_text?.forEach(item => {
              const formGroup = this._formBuilder.group({
                typecode: [item.typecode],
                isclubbing: [item.isclubbing],
                leavetypesselected: [item.leavetypesselected],
              });

              formArray.push(formGroup);
            });

            this.addNewTemplateForm.setControl('clubbing_leave_type', formArray);
          }

          this.addNewTemplateForm.patchValue({
            templateid: data.templateid,
            templatedesc: data.templatedesc,
            weekly_off_days: leave_details.weekly_off_days,
            weekly_off_days_name: leave_details.weekly_off_days_name,
            weekly_off_days_name_txt: !leave_details.weekly_off_days_name_txt ? [] : (leave_details.weekly_off_days_name_txt),
            leaves_calender: leave_details.leaves_calender,
            absent_is_equal_to_loss_of_pay: leave_details.absent_is_equal_to_loss_of_pay,
            attendance_approval_required_for_payout: leave_details.attendance_approval_required_for_payout,
            // leave_type: leave_details.leave_type,


            validity_from_dt: !data.validity_from_dt ? '' : data.validity_from_dt,
            validity_to_dt: !data.validity_to_dt ? '' : data.validity_to_dt,
            leave_description: !data.leave_description ? '' : data.leave_description,
            balance_based_on: !data.balance_based_on ? '' : data.balance_based_on,
            effective_after_unit: !data.effective_after_unit ? '' : data.effective_after_unit,
            effective_after_unit_type: !data.effective_after_unit_type ? '' : data.effective_after_unit_type,
            effective_after_from: !data.effective_after_from ? '' : data.effective_after_from,
            effective_min_paid_days: !data.effective_min_paid_days ? '' : data.effective_min_paid_days,

            carry_forward_type: !data.carry_forward_type ? '' : data.carry_forward_type,
            carry_forward_cnt: !data.carry_forward_cnt ? '0' : data.carry_forward_cnt,
            carry_forward_unit: !data.carry_forward_unit ? '' : data.carry_forward_unit,
            carry_forward_max_limit: !data.carry_forward_max_limit ? '' : data.carry_forward_max_limit,
            carry_forward_expire_cnt: !data.carry_forward_expire_cnt ? '0' : data.carry_forward_expire_cnt,
            carry_forward_expire_unit: !data.carry_forward_expire_unit ? '' : data.carry_forward_expire_unit,
            carry_forward_over_all_limit: !data.carry_forward_over_all_limit ? '' : data.carry_forward_over_all_limit,

            applicable_gender: !data.applicable_gender ? '' : data.applicable_gender,
            applicable_marital_status: !data.applicable_marital_status ? '' : data.applicable_marital_status,

            wk_beetwen_lp_as_leave_yn: !data.wk_beetwen_lp_as_leave_yn ? '' : data.wk_beetwen_lp_as_leave_yn,
            wk_beetwen_lp_as_leave_count: !data.wk_beetwen_lp_as_leave_count ? '0' : data.wk_beetwen_lp_as_leave_count,
            ho_btwn_lp_as_leave_yn: !data.ho_btwn_lp_as_leave_yn ? '' : data.ho_btwn_lp_as_leave_yn,
            ho_btwn_lp_as_leave_count: !data.ho_btwn_lp_as_leave_count ? '0' : data.ho_btwn_lp_as_leave_count,
            is_apply_leave_when_exceed_bal_yn: !data.is_apply_leave_when_exceed_bal_yn ? '' : data.is_apply_leave_when_exceed_bal_yn,
            is_apply_leave_when_exceed_bal_if_y: !data.is_apply_leave_when_exceed_bal_if_y ? '' : data.is_apply_leave_when_exceed_bal_if_y,
            duration_allowed: !data.duration_allowed ? '' : data.duration_allowed,
            allow_requests_for_past_dates_yn: !data.allow_requests_for_past_dates_yn ? '' : data.allow_requests_for_past_dates_yn,
            requests_for_past_days_cnt_if_y: !data.requests_for_past_days_cnt_if_y ? '0' : data.requests_for_past_days_cnt_if_y,
            allow_requests_for_future_dates_yn: !data.allow_requests_for_future_dates_yn ? '' : data.allow_requests_for_future_dates_yn,
            requests_for_future_days_cnt_if_y: !data.requests_for_future_days_cnt_if_y ? '0' : data.requests_for_future_days_cnt_if_y,
            admins_view_apply_leave_yn: !data.admins_view_apply_leave_yn ? '' : data.admins_view_apply_leave_yn,
            min_leave_per_appl_can_awail_yn: !data.min_leave_per_appl_can_awail_yn ? '' : data.min_leave_per_appl_can_awail_yn,
            min_leave_can_awail_cnt_if_y: !data.min_leave_can_awail_cnt_if_y ? '0' : data.min_leave_can_awail_cnt_if_y,
            // added on 05/07/2024
            number_of_leaves_in_a_week_yn: !data.number_of_leaves_in_a_week_yn ? '' : data.number_of_leaves_in_a_week_yn,
            number_of_leaves_in_a_week_cnt_if_y: !data.number_of_leaves_in_a_week_cnt_if_y ? '0' : data.number_of_leaves_in_a_week_cnt_if_y,

            number_of_absent_in_a_week_yn: !data.number_of_absent_in_a_week_yn ? '' : data.number_of_absent_in_a_week_yn,
            number_of_absent_in_a_week_cnt_if_y: !data.number_of_absent_in_a_week_cnt_if_y ? '0' : data.number_of_absent_in_a_week_cnt_if_y,

            // end
            max_leave_per_appl_can_awail_yn: !data.max_leave_per_appl_can_awail_yn ? '' : data.max_leave_per_appl_can_awail_yn,
            max_leave_can_awail_cnt_if_y: !data.max_leave_can_awail_cnt_if_y ? '0' : data.max_leave_can_awail_cnt_if_y,
            min_gap_btwn_two_leave_appl_yn: !data.min_gap_btwn_two_leave_appl_yn ? '' : data.min_gap_btwn_two_leave_appl_yn,
            min_gap_btwn_two_leave_appl_cnt_if_y: !data.min_gap_btwn_two_leave_appl_cnt_if_y ? '0' : data.min_gap_btwn_two_leave_appl_cnt_if_y,
            file_upload_if_exceed_yn: !data.file_upload_if_exceed_yn ? '' : data.file_upload_if_exceed_yn,
            file_upload_if_exceed_cnt_if_y: !data.file_upload_if_exceed_cnt_if_y ? '0' : data.file_upload_if_exceed_cnt_if_y,
            max_appls_in_period_yn: !data.max_appls_in_period_yn ? '' : data.max_appls_in_period_yn,
            max_appls_in_period_cnt_if_y: !data.max_appls_in_period_cnt_if_y ? '0' : data.max_appls_in_period_cnt_if_y,
            max_appls_in_period_cnt_unit: !data.max_appls_in_period_cnt_unit ? '' : data.max_appls_in_period_cnt_unit,

            is_probation_prd_enable: !data.is_probation_prd_enable ? '' : data.is_probation_prd_enable,
            probation_prd_months: !data.probation_prd_months ? '0' : data.probation_prd_months,
            prob_prd_over_template: !data.prob_prd_over_template ? '' : data.prob_prd_over_template,
            enable_weekends_holiddys_absent_yn: !data.enable_weekends_holiddys_absent_yn ? 'N' : data.enable_weekends_holiddys_absent_yn,
            enable_weekends_absent_yn: !data.enable_weekends_absent_yn ? '' : data.enable_weekends_absent_yn,
            enable_holiddys_absent_yn: !data.enable_holiddys_absent_yn ? '' : data.enable_holiddys_absent_yn,
            full_day_credit_weeklyoff: !data.full_day_credit_weeklyoff_yn ? '' : data.full_day_credit_weeklyoff_yn,
            is_leave_clubbing_allowed: !data.is_new_club_leave_policy_applied_yn ? '' : data.is_new_club_leave_policy_applied_yn,

            // holiday_state_name: !data.holiday_state_name ? '' : data.holiday_state_name,
          });

          // Re-apply conditional validators after patching the FormArray
          (this.addNewTemplateForm.get('clubbing_leave_type') as FormArray).controls.forEach(group => {
            this.setupIsClubbingWatcher(group as FormGroup);
          });

          // console.log(this.antf.non_combinable_leaves_typecode);

          this.validity_from_dt = !this.antf.validity_from_dt ? '' : this.antf.validity_from_dt;
          this.validity_to_dt = !this.antf.validity_to_dt ? '' : this.antf.validity_to_dt;

          // this.weeklyOffDays = leave_details.weekly_off_days_name.split(',');
          this.updateCheckboxes();

          // Patch values into the FormArray
          leave_details.leave_type.forEach(lt => {
            let disable_max_limit = false;
            if (lt.is_carry_forward == 'N') {
              disable_max_limit = true;
            }
            this.leave_type.push(this._formBuilder.group({
              days: [lt.days, [Validators.required, Validators.min(0), Validators.max(365)]],
              typecode: [lt.typecode, Validators.required],
              typename: [lt.typename, Validators.required],
              accumulate: [lt.accumulate, Validators.required],
              // maximum_limit: [lt.maximum_limit, [Validators.required, Validators.max(365)]],
              maximum_limit: [lt.maximum_limit, [Validators.max(365)]],
              disable_max_limit: [disable_max_limit],
              description: [!lt.description ? '' : lt.description],
              is_carry_forward: [lt.is_carry_forward, Validators.required],
              encashment_unit: [lt.encashment_unit],
              encashment_type: [!lt.encashment_type ? '' : lt.encashment_type],
              encashment_maxlimit: [lt.encashment_maxlimit],

              effective_after_unit: [!lt.effective_after_unit ? '' : lt.effective_after_unit],
              effective_after_unit_type: [!lt.effective_after_unit_type ? '' : lt.effective_after_unit_type],
              effective_after_from: [!lt.effective_after_from ? '' : lt.effective_after_from],
              effective_min_paid_days: [!lt.effective_min_paid_days ? '' : lt.effective_min_paid_days],
              is_not_editable: [true],
              // maximum_balance: [lt.maximum_balance],
              // opening_balance: [lt.opening_balance],
            }));
          });

        } else {
          this.toastr.error('Something went wrong', 'Oops!');
        }

        resolve(true);
      })

    })

  }
  // updateCheckboxes() {
  //   // Update the checked property of each checkbox based on the API response
  //   const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  //   days.forEach((day, index) => {
  //     const checkbox = document.getElementsByName(day)[0] as HTMLInputElement;
  //     checkbox.checked = this.weeklyOffDays.includes(day);
  //   });
  // }

  updateCheckboxes() {
    // Check if the weekly_off_days_name_txt is empty
    const weeklyOffDaysNameTxt = this.addNewTemplateForm.value.weekly_off_days_name_txt;

    if (weeklyOffDaysNameTxt.length == 0) {
      // Update the checkboxes based on the old format
      if (this.addNewTemplateForm.value.weekly_off_days_name) {
        const oldFormatDays = this.addNewTemplateForm.value.weekly_off_days_name.split(',');
        const newArr = [];
        // const convertedDays = oldFormatDays.map(day => `${day}_1,2,3,4,5`);
        oldFormatDays.map((el: any) => {
          newArr.push({ week_name: el, week_no: '1,2,3,4,5' });
        })

        this.addNewTemplateForm.patchValue({ weekly_off_days_name_txt: newArr });

        oldFormatDays.forEach((day) => {
          for (let week = 1; week <= 5; week++) {
            const checkbox = document.getElementsByName(`${day}_${week}`)[0] as HTMLInputElement;
            if (checkbox) {
              checkbox.checked = true;
            }
          }
        });
      }
    } else if (weeklyOffDaysNameTxt.length > 0) {
      // Update the checkboxes based on the new format
      if (Array.isArray(weeklyOffDaysNameTxt)) {
        weeklyOffDaysNameTxt.forEach(entry => {
          const { week_name, week_no } = entry;
          const weekNumbers = week_no.split(',');

          weekNumbers.forEach(week => {
            const checkbox = document.getElementsByName(`${week_name}_${week}`)[0] as HTMLInputElement;
            if (checkbox) {
              checkbox.checked = true;
            }
          });
        });
      }

    }

    // console.log(this.antf);
  }

  change_is_carry(e: any, index: any) {
    // console.log(this.getLeaveTypeFormGroup(index).value.is_carry_forward);

    if (this.getLeaveTypeFormGroup(index).value.is_carry_forward == 'N') {
      this.getLeaveTypeFormGroup(index).patchValue({
        maximum_limit: '0',
        disable_max_limit: true
      });

    } else {
      this.getLeaveTypeFormGroup(index).patchValue({
        maximum_limit: '0',
        disable_max_limit: false
      });

    }

  }

  change_accumulate(val: any, index: any) {
    if (val != 'Monthly') {
      this.getLeaveTypeFormGroup(index).patchValue({
        effective_min_paid_days: '0',
      });

    }
  }

  // change_leave_type(e: any, index: any) {
  //   const selectElement = e.target as HTMLSelectElement;
  //   const selectedTitle = selectElement.selectedOptions[0].title;
  //   this.getLeaveTypeFormGroup(index).patchValue({
  //     typename: selectedTitle
  //   });
  // }

  change_leave_type(e: any, index: any) {

    const selectElement = e.target as HTMLSelectElement;
    const selectedTitle = selectElement.selectedOptions[0].title;

    this.getLeaveTypeFormGroup(index).patchValue({
      typename: selectedTitle
    });

    let arr = this.addNewTemplateForm.value.leave_type.map((el: any) => {
      return { typecode: el.typecode, typename: el.typename };
    });

    this.leave_type_master_data = arr.length > 0 ? arr : [];
    this.leave_type_master_data_copy = arr.length > 0 ? arr : [];
   
    // Building Clubbing Leave Type FormArray ---
     const formArray = this.clubbing_leave_type;

    // case - If FormArray is empty, fully rebuild (first time)
    if (formArray.length === 0) {
      this.rebuildLeaveTypeFormArray(this.leave_type_master_data_copy);
      return;
    }

    // case - FormArray already has data, add new ones only
    const existingTypecodes = formArray.controls.map(ctrl => ctrl.value.typecode);

    this.leave_type_master_data_copy.forEach(item => {
      if (!existingTypecodes.includes(item.typecode)) {
        formArray.push(this.createLeaveTypeGroup(item)); // This now includes validation setup
      }
    });

    // Remove outdated entries from formArray
    const validTypecodes = this.leave_type_master_data_copy.map(item => item.typecode);

    for (let i = formArray.length - 1; i >= 0; i--) {
      const ctrlTypecode = formArray.at(i).value.typecode;
      if (!validTypecodes.includes(ctrlTypecode)) {
        formArray.removeAt(i);
      }
    }

  }

  // Remove Leave Template
  openRemoveTemplatePopup() {
    this.showRemoveTemplatePopup = true;
  }

  closeRemoveTemplatePopup() {
    this.showRemoveTemplatePopup = false;
  }


  remove_template_by_id() {
    this._leaveMgmtService.getLeaveTemplate({
      "action": "remove_template_by_id",
      "customeraccountid": this.tp_account_id.toString(),
      "default_templateId": this.edit_templateId.toString(),
    }).subscribe((resData: any) => {
      if (resData.statusCode) {
        if (resData.commonData.data[0].msgcd == true) {
          this.toastr.success(resData.commonData.data[0].msg, 'Success');
          this.backToLeaveTemplate();
        } else {
          this.toastr.error(resData.commonData.data[0].msg, 'Oops!');
        }
      } else {
        this.toastr.error(resData.message, 'Oops!');
      }
    })

  }
  // Remove Leave Template

  filterFromToDateLeads() {
    // console.log(this.validity_from_dt);
    // console.log(this.validity_to_dt);

    let splitted_f = this.sdate.nativeElement.value.split("-", 3);
    let splitted_t = this.edate.nativeElement.value.split("-", 3);
    let fromdt: number = splitted_f[2] + splitted_f[1] + splitted_f[0];
    let todt: number = splitted_t[2] + splitted_t[1] + splitted_t[0];
    if (todt >= fromdt) {

      this.validity_from_dt = this.sdate.nativeElement.value;
      this.validity_to_dt = this.edate.nativeElement.value;

      if (this.validity_from_dt && this.validity_to_dt) {
        this.addNewTemplateForm.patchValue({
          validity_from_dt: this.validity_from_dt,
          validity_to_dt: this.validity_to_dt,
        })
      }
    }
    else {
      // this.from_color = true;
      // this.to_color = true;
      this.toastr.error("From date should be less than equal-to To date", 'Oops!');
    }
  }
  clearToDate() {
    this.validity_to_dt = '';
    this.addNewTemplateForm.patchValue({
      validity_to_dt: '',
    })
  }

  change_balance_basedon(val: any) {
    this.addNewTemplateForm.patchValue({
      balance_based_on: val,
    })
  }

  change_carry_forward_type(val: any) {
    this.addNewTemplateForm.patchValue({
      carry_forward_expire_cnt: '',
      carry_forward_expire_unit: '',
      carry_forward_over_all_limit: '',
    })
  }
  change_carry_forward_unit(val: any) {
    this.addNewTemplateForm.patchValue({
      carry_forward_max_limit: '',
    })
  }

  change_applicable_gender(val: any, check: any) {
    let gender_arr = !this.antctrl.applicable_gender.value ? [] : this.antctrl.applicable_gender.value.split(',');
    if (check) {
      gender_arr.push(val);
    } else {
      let idx = gender_arr.indexOf(val);
      gender_arr.splice(idx, 1);
    }
    this.addNewTemplateForm.patchValue({
      applicable_gender: gender_arr.join(','),
    })
  }
  isApplicableGender(val: any) {
    let gender_arr = !this.antctrl.applicable_gender.value ? [] : this.antctrl.applicable_gender.value.split(',');
    return gender_arr.includes(val);
  }

  change_applicable_marital_status(val: any, check: any) {
    let marital_arr = !this.antctrl.applicable_marital_status.value ? [] : this.antctrl.applicable_marital_status.value.split(',');
    if (check) {
      marital_arr.push(val);
    } else {
      let idx = marital_arr.indexOf(val);
      marital_arr.splice(idx, 1);
    }
    this.addNewTemplateForm.patchValue({
      applicable_marital_status: marital_arr.join(','),
    })
  }
  is_applicable_marital_status(val: any) {
    let marital_arr = !this.antctrl.applicable_marital_status.value ? [] : this.antctrl.applicable_marital_status.value.split(',');
    return marital_arr.includes(val);
  }

  change_wk_beetwen_lp_as_leave_yn(val: any) {
    this.addNewTemplateForm.patchValue({
      wk_beetwen_lp_as_leave_yn: val,
    })

    if (val == 'N') {
      this.addNewTemplateForm.patchValue({
        wk_beetwen_lp_as_leave_count: '0',
      })
    }
  }

  change_ho_btwn_lp_as_leave_yn(val: any) {
    this.addNewTemplateForm.patchValue({
      ho_btwn_lp_as_leave_yn: val,
    })

    if (val == 'N') {
      this.addNewTemplateForm.patchValue({
        ho_btwn_lp_as_leave_count: '0',
      })
    }

  }

  change_is_apply_leave_when_exceed_bal_yn(val: any) {
    this.addNewTemplateForm.patchValue({
      is_apply_leave_when_exceed_bal_yn: val,
      is_apply_leave_when_exceed_bal_if_y: '',
    })
  }

  change_is_apply_leave_when_exceed_bal_if_y(val: any) {
    this.addNewTemplateForm.patchValue({
      is_apply_leave_when_exceed_bal_if_y: val,
    })
  }

  change_durations(val: any, check: any) {
    let duration_arr = !this.antctrl.duration_allowed.value ? [] : this.antctrl.duration_allowed.value.split(',');
    if (check) {
      duration_arr.push(val);
    } else {
      let idx = duration_arr.indexOf(val);
      duration_arr.splice(idx, 1);
    }
    this.addNewTemplateForm.patchValue({
      duration_allowed: duration_arr.join(','),
    })
  }
  isDurationChecked(val: any) {
    let duration_arr = !this.antctrl.duration_allowed.value ? [] : this.antctrl.duration_allowed.value.split(',');
    return duration_arr.includes(val);
  }

  change_allow_requests_for_past_dates_yn(val: any, check: any) {
    let value = check ? 'Y' : 'N';
    this.addNewTemplateForm.patchValue({
      allow_requests_for_past_dates_yn: value,
      requests_for_past_days_cnt_if_y: '0',
    })
  }
  isAllowRequest(val: any) {
    let allowRequestArr = !this.antctrl.allow_requests_for_past_dates_yn.value ? [] : this.antctrl.allow_requests_for_past_dates_yn.value.split(',');
    return allowRequestArr.includes(val);
  }

  change_allow_requests_for_future_dates_yn(val: any, check: any) {
    let value = check ? 'Y' : 'N';
    this.addNewTemplateForm.patchValue({
      allow_requests_for_future_dates_yn: value,
      requests_for_future_days_cnt_if_y: '0',
    })
  }
  isAllowRequestFutureDates(val: any) {
    let allowRequestFutureDatesArr = !this.antctrl.allow_requests_for_future_dates_yn.value ? [] : this.antctrl.allow_requests_for_future_dates_yn.value.split(',');
    return allowRequestFutureDatesArr.includes(val);
  }

  change_admins_view_apply_leave_yn(val: any, check: any) {
    let value = check ? 'Y' : 'N';
    this.addNewTemplateForm.patchValue({
      admins_view_apply_leave_yn: value,
    })
  }
  isAdminViewApplyLeave(val: any) {
    let adminViewApplyLeaveArr = !this.antctrl.admins_view_apply_leave_yn.value ? [] : this.antctrl.admins_view_apply_leave_yn.value.split(',');
    return adminViewApplyLeaveArr.includes(val);
  }

  change_min_leave_per_appl_can_awail_yn(check: any) {
    let value = check ? 'Y' : 'N';
    this.addNewTemplateForm.patchValue({
      min_leave_per_appl_can_awail_yn: value,
      min_leave_can_awail_cnt_if_y: '0',
    })
  }
  isMinLeavePerApplCanAwail(val: any) {
    let minLeavePerApplCanAwailArr = !this.antctrl.min_leave_per_appl_can_awail_yn.value ? [] : this.antctrl.min_leave_per_appl_can_awail_yn.value.split(',');
    return minLeavePerApplCanAwailArr.includes(val);
  }
  // added new dated. 05/07/2024
  change_number_of_leaves_in_a_week_yn(check: any) {
    let value = check ? 'Y' : 'N';
    this.addNewTemplateForm.patchValue({
      number_of_leaves_in_a_week_yn: value,
      number_of_leaves_in_a_week_cnt_if_y: '0',
    })
  }


  isMaxLeavePerWeekCanAwail(val: any) {
    let number_of_leaves_in_a_weekArr = !this.antctrl.number_of_leaves_in_a_week_yn.value ? [] : this.antctrl.number_of_leaves_in_a_week_yn.value.split(',');
    return number_of_leaves_in_a_weekArr.includes(val);
  }
  // number of absent in a week 09/07/2024

  change_number_of_absent_in_a_week_yn(check: any) {
    let value = check ? 'Y' : 'N';
    this.addNewTemplateForm.patchValue({
      number_of_absent_in_a_week_yn: value,
      number_of_absent_in_a_week_cnt_if_y: '0',
      enable_weekends_holiddys_absent_yn: '',
      enable_weekends_absent_yn: '',
      enable_holiddys_absent_yn: '',
    })
  }
  isMinabsentPerWeekCanAwail(val: any) {
    let number_of_absent_in_a_weekArr = !this.antctrl.number_of_absent_in_a_week_yn.value ? [] : this.antctrl.number_of_absent_in_a_week_yn.value.split(',');
    return number_of_absent_in_a_weekArr.includes(val);
  }

  // end

  change_max_leave_per_appl_can_awail_yn(check: any) {
    let value = check ? 'Y' : 'N';
    this.addNewTemplateForm.patchValue({
      max_leave_per_appl_can_awail_yn: value,
      max_leave_can_awail_cnt_if_y: '0',
    })
  }
  isMaxLeavePerApplCanAwail(val: any) {
    let maxLeavePerApplCanAwailArr = !this.antctrl.max_leave_per_appl_can_awail_yn.value ? [] : this.antctrl.max_leave_per_appl_can_awail_yn.value.split(',');
    return maxLeavePerApplCanAwailArr.includes(val);
  }

  change_min_gap_btwn_two_leave_appl_yn(check: any) {
    let value = check ? 'Y' : 'N';
    this.addNewTemplateForm.patchValue({
      min_gap_btwn_two_leave_appl_yn: value,
      min_gap_btwn_two_leave_appl_cnt_if_y: '0',
    })
  }
  isMinGapBtwnTwoLeaveAppl(val: any) {
    let minGapBtwnTwoLeaveApplArr = !this.antctrl.min_gap_btwn_two_leave_appl_yn.value ? [] : this.antctrl.min_gap_btwn_two_leave_appl_yn.value.split(',');
    return minGapBtwnTwoLeaveApplArr.includes(val);
  }

  change_file_upload_if_exceed_yn(check: any) {
    let value = check ? 'Y' : 'N';
    this.addNewTemplateForm.patchValue({
      file_upload_if_exceed_yn: value,
      file_upload_if_exceed_cnt_if_y: '0',
    })
  }
  isFileUploadIfExceed(val: any) {
    let fileUploadIfExceedArr = !this.antctrl.file_upload_if_exceed_yn.value ? [] : this.antctrl.file_upload_if_exceed_yn.value.split(',');
    return fileUploadIfExceedArr.includes(val);
  }

  change_max_appls_in_period_yn(check: any) {
    let value = check ? 'Y' : 'N';
    this.addNewTemplateForm.patchValue({
      max_appls_in_period_yn: value,
      max_appls_in_period_cnt_if_y: '0',
      max_appls_in_period_cnt_unit: '',
    })
  }
  isMaxApplsInPeriod(val: any) {
    let maxApplsInPeriodArr = !this.antctrl.max_appls_in_period_yn.value ? [] : this.antctrl.max_appls_in_period_yn.value.split(',');
    return maxApplsInPeriodArr.includes(val);
  }

  change_is_probation_prd_enable_yn(check: any) {
    let value = check ? 'Y' : 'N';
    this.addNewTemplateForm.patchValue({
      is_probation_prd_enable: value,
      probation_prd_months: '0',
      prob_prd_over_template: '',
    })
  }
  is_probation_prd_enable(val: any) {
    let probation_prd_enable = !this.antctrl.is_probation_prd_enable.value ? '' : this.antctrl.is_probation_prd_enable.value;
    return probation_prd_enable.includes(val);
  }

  change_enable_weekends_holiddys_absent_yn(check: any) {
    let value = check ? 'Y' : 'N';
    this.addNewTemplateForm.patchValue({
      enable_weekends_holiddys_absent_yn: value,
      enable_weekends_absent_yn: '',
      enable_holiddys_absent_yn: '',
      number_of_absent_in_a_week_yn: '',
      number_of_absent_in_a_week_cnt_if_y: '',
    })
  }
  is_enable_weekends_holiddys_absent_yn(val: any) {
    let enable_weekends_holiddys_absent_yn = !this.antctrl.enable_weekends_holiddys_absent_yn.value ? '' : this.antctrl.enable_weekends_holiddys_absent_yn.value;
    return enable_weekends_holiddys_absent_yn.includes(val);
  }
  change_enable_weekends_absent_yn(check: any) {
    let value = check ? 'Y' : '';
    this.addNewTemplateForm.patchValue({
      enable_weekends_absent_yn: value,
    })
  }
  is_enable_weekends_absent_yn(val: any) {
    let enable_weekends_absent_yn = !this.antctrl.enable_weekends_absent_yn.value ? '' : this.antctrl.enable_weekends_absent_yn.value;
    return enable_weekends_absent_yn.includes(val);
  }

  change_enable_holiddys_absent_yn(check: any) {
    let value = check ? 'Y' : '';
    this.addNewTemplateForm.patchValue({
      enable_holiddys_absent_yn: value,
    })
  }

  is_enable_holiddys_absent_yn(val: any) {
    let enable_holiddys_absent_yn = !this.antctrl.enable_holiddys_absent_yn.value ? '' : this.antctrl.enable_holiddys_absent_yn.value;
    return enable_holiddys_absent_yn.includes(val);
  }

  // Start - ull day credit for weekly off(half-day work) if worked before-after weekoff
  change_full_day_credit_weeklyoff(check: any) {
    // console.log("CHECK-------", check)
    let value = check ? 'Y' : '';
    this.addNewTemplateForm.patchValue({
      full_day_credit_weeklyoff: value,
    })
  }
  
  full_day_credit_weeklyoff(val: any) {
    let full_day_credit_weeklyoff = !this.antctrl.full_day_credit_weeklyoff.value ? '' : this.antctrl.full_day_credit_weeklyoff.value;
    return full_day_credit_weeklyoff.includes(val);
  }
  // End - Full day credit for weekly off(half-day work) if worked before-after weekoff

  onItemSelect(e: any) {
    // console.log(e);

    // console.log(this.antf.non_combinable_leaves_typecode);
  }
  onSelectAll(e: any) {
    // console.log(e);
  }
  onUnselectAll(e: any) {
    // console.log(e);
  }
  onItemUnselect(e: any) {
    // console.log(e);
  }

  onClubItemSelect(e: any) {
    console.log(e);

    console.log(this.antf.club_leave_with_off);
  }
  onClubSelectAll(e: any) {
    console.log(e);
  }
  onClubUnselectAll(e: any) {
    console.log(e);
  }
  onClubItemUnselect(e: any) {
    console.log(e);
  }

  check_value(index: any, event: any) {
    const input = event.target as HTMLInputElement;
    const regex = /^\d{0,2}(\.\d{0,2})?$/;

    if (!regex.test(input.value)) {
      this.getLeaveTypeFormGroup(index).patchValue({
        days: '0',
        maximum_limit: '0',
      });
    } else {
      this.getLeaveTypeFormGroup(index).patchValue({
        days: input.value,
      });
    }

    // console.log(this.getLeaveTypeFormGroup(index).get('disable_max_limit').value)
    // console.log(this.getLeaveTypeFormGroup(index).value);
  }

  getStateMaster() {
    this._employeeService.getAll_state({})
      .subscribe({
        next: (resData: any) => {
          if (resData.statusCode) {
            this.state_master_data = resData.commonData;
          } else {
            this.state_master_data = [];
          }
        }, error: (e) => {
          this.state_master_data = [];
          console.log(e);
        }
      })
  }

  check_invalid_fields() {
    const invalidFields = Object.keys(this.addNewTemplateForm.controls).filter((field) => {
      const control = this.addNewTemplateForm.get(field);
      return control?.invalid;
    });

    // console.log('Invalid fields:', invalidFields);

    this.leave_type.controls.forEach((group, index) => {
      if (group.invalid) {
        console.log(`Invalid fields in leave_type[${index}]:`);
        Object.keys((group as FormGroup).controls).forEach((field) => {
          const control = group.get(field);
          if (control?.invalid) {
            console.log(`- Field '${field}' is invalid`);
          }
        });
      }
    });
  }


  //  Start - Leave Clubbing Policy - sidharth kaul dated. 06.06.2025
  change_is_leave_clubbing_allowed(check: any) {
    let value = check ? 'Y' : '';
    this.addNewTemplateForm.patchValue({
      is_leave_clubbing_allowed: value,
    })
  }
  
  is_leave_clubbing_allowed(val: any) {
    let is_leave_clubbing_allowed = !this.antctrl.is_leave_clubbing_allowed.value ? '' : this.antctrl.is_leave_clubbing_allowed.value;
    return is_leave_clubbing_allowed.includes(val);
  }

  // FormArray - clubbing_leave_type
  get leaveTypeArray(): FormArray {
  return this.addNewTemplateForm.get('clubbing_leave_type') as FormArray;
  }

  createLeaveTypeGroup(data: any): FormGroup {
    const group = this._formBuilder.group({
      typecode: [data?.typecode || ''],
      isclubbing: ['N'],
      leavetypesselected: [null]
    });

    this.setupIsClubbingWatcher(group); // Attaching the conditional validator

    return group;
  }

  rebuildLeaveTypeFormArray(data: any[]) {
    const formArray: FormArray<FormGroup> = this._formBuilder.array<FormGroup>([]);
    data.forEach(item => {
      formArray.push(this.createLeaveTypeGroup(item));
    });
    this.addNewTemplateForm.setControl('clubbing_leave_type', formArray);
  }

  // Conditional Validation - Clubbing LeaveType FormArray
  // setupIsClubbingWatcher(group: FormGroup) {
    
  //   const isClubbingCtrl = group.get('isclubbing');
  //   const leaveTypesCtrl = group.get('leavetypesselected');

  //   if (!isClubbingCtrl || !leaveTypesCtrl) return;

  //   // Run once immediately to set initial state
  //   const initialValue = isClubbingCtrl.value;
  //   if (initialValue === 'Y') {
  //     leaveTypesCtrl.enable();
  //     leaveTypesCtrl.setValidators([Validators.required]);
  //   } else {
  //     leaveTypesCtrl.setValue([]);
  //     leaveTypesCtrl.disable();
  //     leaveTypesCtrl.clearValidators();
  //   }
  //   leaveTypesCtrl.updateValueAndValidity();

  //   // Set up watcher for changes
  //   isClubbingCtrl.valueChanges.subscribe((value: string) => {
  //     if (value === 'Y') {
  //       leaveTypesCtrl.enable();
  //       leaveTypesCtrl.setValidators([Validators.required]);
  //     } else {
  //       leaveTypesCtrl.setValue([]);
  //       leaveTypesCtrl.disable();
  //       leaveTypesCtrl.clearValidators();
  //     }
  //     leaveTypesCtrl.updateValueAndValidity();
  //   });

  // }

  setupIsClubbingWatcher(group: FormGroup) {
    
    const leaveTypesCtrl = group.get('leavetypesselected');
    if (!leaveTypesCtrl) return;

    const isLeaveClubbingAllowed = this.addNewTemplateForm.get('is_leave_clubbing_allowed')?.value;

    if (isLeaveClubbingAllowed === 'Y') {
      leaveTypesCtrl.setValidators([Validators.required]);
    } else {
      leaveTypesCtrl.setValue(null);
      leaveTypesCtrl.clearValidators();
    }

    leaveTypesCtrl.updateValueAndValidity();
  }

  //  End - Leave Clubbing Policy - sidharth kaul dated. 06.06.2025


}
