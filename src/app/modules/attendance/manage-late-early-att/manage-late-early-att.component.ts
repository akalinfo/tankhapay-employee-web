import { AfterViewInit, Component } from '@angular/core';
import { FormArray,FormGroup, FormBuilder, Validators ,FormControl} from '@angular/forms';
import { Router } from '@angular/router';
import decode from 'jwt-decode';
import { ToastrService } from 'ngx-toastr';
import { EncrypterService } from 'src/app/shared/services/encrypter.service';
import { SessionService } from 'src/app/shared/services/session.service';
import * as XLSX from 'xlsx';
import { ReportService } from '../../reports/report.service';
import { AlertService } from 'src/app/shared/_alert';
import { GlobalConstants } from 'src/app/shared/global-constants';
declare var $: any;

@Component({
  selector: 'app-manage-late-early-att',
  templateUrl: './manage-late-early-att.component.html',
  styleUrls: ['./manage-late-early-att.component.css']
})
export class ManageLateEarlyAttComponent {

  showSidebar: boolean = true;
  product_type: any;
  emp_code: any;
  id: any;
  currentDate: any;
  currentDateString: any;
  employer_name:any;
  data: any = [];
  employee_data: any = [];
  checkin_Form: FormGroup;
  designation: any;
  show_label: boolean = true;
  tp_account_id: any = '';
  token: any = '';
  from_date: any;
  to_date: any;
  year: any;
  is_overtime_applicable:any;
  no_of_overtime_hours_worked:any;
  deviation_in_checkin:any;
  deviation_in_checkout:any;
  deviation_in_total_working_hours:any;
  pop_imgcheck_in_image_path: any = '';
  pop_check_out_image_path: any = '';
  innerPanelData: any = [];
  innerTotalHrsWorked: any = 0;
  loading: boolean = false; 

  earlyFineModalStatus:any=false;
  lateFineModalStatus:any=false;

  earlyData:any = [];
  lateData:any = [];
  overtimeData:any = [];
  updateBy :any = '';

  overtimeModalStatus:any = false;
  overtimeForm: FormGroup;
  earlyForm: FormGroup;
  lateForm: FormGroup;
  totalLateAmount:any = 0;
  totalEarlyAmount:any = 0;
  totalOTAmount:any = 0;
  earlyLateHrAmount = '0.00';
  earlyLateHr = '01:00';

  constructor(
      public toastr: ToastrService,
      private _sessionService: SessionService,
      private _formBuilder: FormBuilder,
      private _EncrypterService: EncrypterService,
      private _ReportService: ReportService,
      private router: Router,
      private _alertservice: AlertService) {
  
      if (this.router.getCurrentNavigation().extras.state != null || this.router.getCurrentNavigation().extras.state != undefined) {
        this.emp_code = this.router.getCurrentNavigation().extras.state?.emp_code;
        this.id = this.router.getCurrentNavigation().extras.state?.id;
      }
  
      this.currentDate = new Date();
      this.currentDateString = this.currentDate.toString().slice(0, -30);

      this.overtimeForm = this._formBuilder.group({
        overtimeArray: this._formBuilder.array([])
      });

      this.earlyForm = this._formBuilder.group({
        earlyFormArray: this._formBuilder.array([])
      });
      this.lateForm = this._formBuilder.group({
        lateFormArray: this._formBuilder.array([])
      });
      

    }

    get otFormArr(){
      return this.overtimeForm.controls.overtimeArray as FormArray;
    }

    get earlyFormArr(){
      return this.earlyForm.controls.earlyFormArray as FormArray;
    }
    get lateFormArr(){
      return this.lateForm.controls.lateFormArray as FormArray;
    }
    

    formatDate(date: Date): string {
      const day: number = date.getDate();
      const month: number = date.getMonth() + 1;
      const year: number = date.getFullYear();
  
      // Pad single digit day/month with leading zero
      const dayString: string = day < 10 ? '0' + day : day.toString();
      const monthString: string = month < 10 ? '0' + month : month.toString();
  
      return `${dayString}/${monthString}/${year}`;
    }
  
  
    ngOnInit() {
      let session_obj_d: any = JSON.parse(
      this._sessionService.get_user_session());
      this.token = decode(session_obj_d.token);
      
      this.tp_account_id = this.token.tp_account_id;
      this.product_type = localStorage.getItem('product_type');
      this.employer_name= this.token.name;
      this.updateBy = this.employer_name+"-"+this.tp_account_id;
      let currDate = new Date();

      
      const firstDate = new Date(currDate.getFullYear(), currDate.getMonth(), 1);
  
      this.from_date = this.formatDate(firstDate);
      this.to_date = this.formatDate(currDate);
  
      this.checkin_Form = this._formBuilder.group({
        FromDate: ['', [Validators.required]],
        ToDate: ['', [Validators.required]]

      });


      this.getCalculateOneHrsAmount(this.earlyLateHr);
      
      this.TpCheckInOutSummary();
  
    }
    
  
    ngAfterViewInit() {
      setTimeout(() => {
        $('#FromDate2').datepicker({
          dateFormat: 'dd/mm/yy',
          changeMonth: true,
          changeYear: true,
        }).datepicker('setDate', this.from_date); // Set current date as default
      }, 500);
  
      setTimeout(() => {
        $('#ToDate2').datepicker({
          dateFormat: 'dd/mm/yy',
          changeMonth: true,
          changeYear: true,
        }).datepicker('setDate', new Date()); // Set current date as default
      }, 500);
    }
  
    openImagePopup(imagePath: string) {
  
  
    }
  
    getCheckInImage(checkin_image: any) {
  
      if (checkin_image != '' && checkin_image != null) {
        this.pop_imgcheck_in_image_path = checkin_image;
  
      }
      else {
        this.pop_imgcheck_in_image_path = '';
      }
    }
    getCheckOutImage(checkout_image: any) {
      if (checkout_image != '' && checkout_image != null) {
        this.pop_check_out_image_path = checkout_image;
      }
      else {
        this.pop_check_out_image_path = '';
      }
    }
  
    toggle() {
      this.showSidebar = !this.showSidebar;
    }
  
    open_new_Panel(i: number, emp_data: any){
      this.is_overtime_applicable=emp_data?.is_overtime_applicable;
      this.no_of_overtime_hours_worked=emp_data?.no_of_overtime_hours_worked;
      this.deviation_in_checkin=emp_data?.deviation_in_checkin;
      this.deviation_in_checkout=emp_data?.deviation_in_checkout;
      this.deviation_in_total_working_hours=emp_data?.deviation_in_total_working_hours
  
      const targetElement = document.getElementById(`CollapseOne${i}`);
  
      // Check if the clicked panel is already open
      const isOpen = targetElement.classList.contains('in');
  
      // Close all previously opened panels (if needed)
      const previouslyOpened = document.querySelectorAll('.in.panel-collapse.collapse');
  
      previouslyOpened.forEach(panel => {
        if (panel !== targetElement) {
          panel.classList.remove('in');
        }
      });
  
      // Toggle visibility of the clicked panel (considering its state)
      if (!isOpen) {
        targetElement.classList.add('in'); // Open if not already open
      } else {
        targetElement.classList.remove('in'); // Close if already open
      }
    }
  
    TpCheckInOutSummary() {
      this.earlyFormArr.clear();
      this.lateFormArr.clear();
      this.otFormArr.clear();
      this.calculateTotalLateAmount();
      this.calculateTotalEarlyAmount();
      this.calculateTotalOTAmount();
      // this.from_date = $('#FromDate').val();
      // this.to_date = $('#ToDate').val();
      this.loading = true; 
      if ($('#FromDate2').val() != '' && $('#FromDate2').val() != null && $('#FromDate2').val() != undefined) {
        this.from_date = $('#FromDate2').val();
      }
  
      if ($('#ToDate2').val() != '' && $('#ToDate2').val() != null && $('#ToDate2').val() != undefined) {
        this.to_date = $('#ToDate2').val();
      }
  
      this._ReportService.GetTpCheckInOutSummary({
        "fromDate": this.from_date,
        "toDate": this.to_date,
        "customerAccountId": this.tp_account_id.toString(),
        "productTypeId": this.product_type,
        "emp_code": this.emp_code,
        "GeoFenceId": this.token.geo_location_id ,
        "flag": "check_in_by_emp_code"
      }).subscribe((resData: any) => {
        this.loading = false; 
        // console.log(resData);
        if (resData.statusCode) {
          this.employee_data = JSON.parse(this._EncrypterService.aesDecrypt(resData.commonData));
          this.earlyData = this.employee_data.filter(item => item.deviation_in_checkout == "1");

          this.earlyData.map(obj=>{
            this.earlyFormArr.push(this._formBuilder.group({
              earlyAttnDate : obj.attendancedate,
              finalEarlyHours:  obj.early_check_out_time,
              finalEarlyAmount: obj.early_check_out_amount,
              shift_name: obj.shift_name,
              check_in_time : obj.check_in_time,
              check_out_time: obj.check_out_time
            }))
          })
          this.calculateTotalEarlyAmount();
          this.lateData  = this.employee_data.filter(item => item.deviation_in_checkin == "1");

          this.lateData.map(obj=>{
            this.lateFormArr.push(this._formBuilder.group({
              lateAttnDate : obj.attendancedate,
              finalLateHours:  obj.late_check_in_time,
              finalLateAmount: obj.late_check_in_amount,
              shift_name: obj.shift_name,
              check_in_time : obj.check_in_time,
              check_out_time: obj.check_out_time
            }))
          })
          this.calculateTotalLateAmount();

          this.overtimeData  = this.employee_data.filter(item => item.is_overtime_applicable == "Y");
         
          this.overtimeData.map(obj=>{
            this.otFormArr.push(this._formBuilder.group({
              overtimeAttnDate : obj.attendancedate,
              finalOvertimeHours:  obj.overtime_hours_approved_by_employer,
              finalOvertimeAmount : obj.overtime_amount_approved_by_employer,
              noOfOvertimeHoursWorked:obj.no_of_overtime_hours_worked,
              shift_name : obj.shift_name,
              check_in_time : obj.check_in_time,
              check_out_time: obj.check_out_time
            }))
          })
          this.calculateTotalOTAmount();
        } else {
          this.employee_data = [];
          this.earlyData = [];
          this.lateData = [];
          
          this.show_label = false;
          this._alertservice.error(resData.message, GlobalConstants.alert_options_autoClose);
        }
      });
  
    }
    formatBreakTotalTime(breakTotalTime: string): string {
      try {
        const breaks = JSON.parse(breakTotalTime);
        return breaks.map(b => 
          `${b.break_type} [${b.break_type_duration}] - ${b.break_type_paid_unpaid}`
        ).join(', ');
      } catch (e) {
        // console.error('Error parsing break_total_time:', e);
        return '';
      }
    }
    
  
    openPanel(i: number, emp_data: any) {
      this.innerPanelData = emp_data;
      this.innerTotalHrsWorked = 0;
        this.innerPanelData.check_in_out_details.map((el: any) => {
          if (el.no_of_hours_worked !== null && el.no_of_hours_worked !== undefined) {
            this.innerTotalHrsWorked += this.timeToHoursMinutes(el.no_of_hours_worked);
          }
        })
  
        // Convert total numerical hours to 'hours:minutes' format
        const totalHours = Math.floor(this.innerTotalHrsWorked);
        const totalMinutes = Math.round((this.innerTotalHrsWorked - totalHours) * 60);
        // console.log(totalHours, totalMinutes);
        if (totalHours === 0) {
          this.innerTotalHrsWorked = '00:' + totalMinutes.toString().padStart(2, '0');
        } else {
          this.innerTotalHrsWorked = totalHours.toString().padStart(2, '0') + ':' + totalMinutes.toString().padStart(2, '0');
        }
  
      const targetElement = document.getElementById(`collapseOne${i}`);
  
      // Check if the clicked panel is already open
      const isOpen = targetElement.classList.contains('in');
  
      // Close all previously opened panels (if needed)
      const previouslyOpened = document.querySelectorAll('.in.panel-collapse.collapse');
  
      previouslyOpened.forEach(panel => {
        if (panel !== targetElement) {
          panel.classList.remove('in');
        }
      });
  
      // Toggle visibility of the clicked panel (considering its state)
      if (!isOpen) {
        targetElement.classList.add('in'); // Open if not already open
      } else {
        targetElement.classList.remove('in'); // Close if already open
      }
    }
  
    timeToHoursMinutes(timeStr: any) {
      const [hours, minutes] = timeStr.split(':').map(Number);
      return hours + minutes / 60;
    }
    openEarlyFineModal(){
      this.earlyFineModalStatus = true;
    }
    
    closeEarlyModal(){
      this.earlyFineModalStatus = false;
    }
    openLateFineModal(){
      this.lateFineModalStatus = true;
    }
    closeLateModal(){
      this.lateFineModalStatus = false;
    }

    calculateAmount(fineType:any,rowId){
      this._ReportService.CalculateDeviationFines({
        "productTypeId": this._EncrypterService.aesEncrypt(this.product_type.toString()),
        "customerAccountId": this._EncrypterService.aesEncrypt(this.tp_account_id.toString()),
        "empCode": this._EncrypterService.aesEncrypt(this.emp_code.toString()),
        "lateComingFineHours": (fineType == 'Late')?this.lateFormArr.controls[rowId].value.finalLateHours:'' ,
        "earlyGoingFineHours": (fineType == 'Early' )?this.earlyFormArr.controls[rowId].value.finalEarlyHours:(fineType == 'Overtime')?this.otFormArr.controls[rowId].value.finalOvertimeHours:""  
      }).subscribe((resData: any) => {
         if(resData.statusCode == true){
          let result = JSON.parse(this._EncrypterService.aesDecrypt(resData.commonData));
          if(fineType == 'Late'){
            this.lateFormArr.controls[rowId].patchValue({
              'finalLateAmount':result.latecomingfine
            })
            this.calculateTotalLateAmount();
          }
          if(fineType == 'Early'){
            this.earlyFormArr.controls[rowId].patchValue({
              'finalEarlyAmount':result.earlygoingfine
            })
            this.calculateTotalEarlyAmount();
          }

          if(fineType == 'Overtime'){
            this.otFormArr.controls[rowId].patchValue({
              'finalOvertimeAmount':result.overtime_amount
            })
            this.calculateTotalOTAmount();
          }

         }
         else{

          if(fineType == 'Late'){
            this.lateFormArr.controls[rowId].patchValue({
              'finalLateAmount':'0.00'
            })
            this.calculateTotalLateAmount();
          }
          if(fineType == 'Early'){
            this.earlyFormArr.controls[rowId].patchValue({
              'finalEarlyAmount':'0.00'
            })
            this.calculateTotalEarlyAmount();
          }
          if(fineType == 'Overtime'){
            this.otFormArr.controls[rowId].patchValue({
              'finalOvertimeAmount':'0.00'
            })
            this.calculateTotalOTAmount();
          }

          this._alertservice.error(resData.message, GlobalConstants.alert_options_autoClose);
         }
      }, (error: any) => {
          if(fineType == 'Late'){
            this.lateFormArr.controls[rowId].patchValue({
              'finalLateAmount':'0.00'
            })
            this.calculateTotalLateAmount();
          }
          if(fineType == 'Early'){
            this.earlyFormArr.controls[rowId].patchValue({
              'finalEarlyAmount':'0.00'
            })
            this.calculateTotalEarlyAmount();
          }
          if(fineType == 'Overtime'){
            this.otFormArr.controls[rowId].patchValue({
              'finalOvertimeAmount':'0.00'
            })
            this.calculateTotalOTAmount();
          }
        this._alertservice.error(error.error.message, GlobalConstants.alert_options_autoClose);
      })
    }

    getCalculateOneHrsAmount(hrs:any){
      this._ReportService.CalculateDeviationFines({
        "productTypeId": this._EncrypterService.aesEncrypt(this.product_type.toString()),
        "customerAccountId": this._EncrypterService.aesEncrypt(this.tp_account_id.toString()),
        "empCode": this._EncrypterService.aesEncrypt(this.emp_code.toString()),
        "lateComingFineHours": "",
        "earlyGoingFineHours": hrs
      }).subscribe({
        next: (resData: any) => {
          if(resData.statusCode == true){
            let result = JSON.parse(this._EncrypterService.aesDecrypt(resData.commonData));
            this.earlyLateHrAmount = result.earlygoingfine;
           }
           else{
          
           }
        }, error: (e) => {
          console.log(e);
        }
      })
    }


    updateLateData(rowNo){
      var attrDate = this.lateFormArr.controls[rowNo].value.lateAttnDate
      let request = {
        "productTypeId":this._EncrypterService.aesEncrypt((this.product_type).toString()),
        "customerAccountId":this._EncrypterService.aesEncrypt((this.tp_account_id).toString()), 
        "empCode":this._EncrypterService.aesEncrypt((this.emp_code).toString()), 
        "deviationFineType":this._EncrypterService.aesEncrypt("LateCheckIn"), 
        "attDate":attrDate.replace(/-/g, "/"),
        "fineHours":this.lateFormArr.controls[rowNo].value.finalLateHours, 
        "fineAmount":this.lateFormArr.controls[rowNo].value.finalLateAmount, 
        "updatedByUser":this.updateBy
      }
      this.UpdateDeviationFines(request);
    }

    updateEarlyData(rowNo){
      var attrDate = this.earlyFormArr.controls[rowNo].value.earlyAttnDate;
      let request = {
        "productTypeId":this._EncrypterService.aesEncrypt((this.product_type).toString()),
        "customerAccountId":this._EncrypterService.aesEncrypt((this.tp_account_id).toString()), 
        "empCode":this._EncrypterService.aesEncrypt((this.emp_code).toString()), 
        "deviationFineType":this._EncrypterService.aesEncrypt("EarlyCheckOut"), 
        "attDate":attrDate.replace(/-/g, "/"),
        "fineHours":this.earlyFormArr.controls[rowNo].value.finalEarlyHours, 
        "fineAmount":this.earlyFormArr.controls[rowNo].value.finalEarlyAmount, 
        "updatedByUser":this.updateBy
      }
      
      this.UpdateDeviationFines(request);
    }

    UpdateDeviationFines(reqst:any){
      this._ReportService.UpdateDeviationFines(
        (reqst)
      ).subscribe(
        (resData: any) => {
          if (resData.statusCode == true){
            this._alertservice.success(resData.message, GlobalConstants.alert_options_autoClose);
          }
          else {
            this._alertservice.error(resData.message, GlobalConstants.alert_options_autoClose);
          }
        }, (error: any) => {
          this._alertservice.error(error.error.message, GlobalConstants.alert_options_autoClose);
        })
    }
    openOvertimeModal(){
      this.overtimeModalStatus = true;
    }
    closeOvertimeModal(){
      this.overtimeModalStatus = false;
      
    }
    updateOvertimeData(rowNo){
      var attrDate = this.otFormArr.controls[rowNo].value.overtimeAttnDate
      let request = {
        "productTypeId":this._EncrypterService.aesEncrypt((this.product_type).toString()),
        "customerAccountId":this._EncrypterService.aesEncrypt((this.tp_account_id).toString()), 
        "empCode":this._EncrypterService.aesEncrypt((this.emp_code).toString()), 
        "deviationFineType":this._EncrypterService.aesEncrypt("SaveOvertime"), 
        "attDate":attrDate.replace(/-/g, "/"),
        "fineHours":this.otFormArr.controls[rowNo].value.finalOvertimeHours, 
        "fineAmount":this.otFormArr.controls[rowNo].value.finalOvertimeAmount, 
        "updatedByUser":this.updateBy
      }
      this.UpdateDeviationFines(request);
    }

   
    
    calculateTotalLateAmount() {
      this.totalLateAmount = this.lateFormArr.controls.reduce((acc, control) => {
        const amount = control.get('finalLateAmount').value;
        return acc + (amount ? parseFloat(amount) : 0);
      }, 0);
    }

    calculateTotalEarlyAmount() {
      this.totalEarlyAmount = this.earlyFormArr.controls.reduce((acc, control) => {
        const amount = control.get('finalEarlyAmount').value;
        return acc + (amount ? parseFloat(amount) : 0);
      }, 0);
    }

    calculateTotalOTAmount() {
      this.totalOTAmount = this.otFormArr.controls.reduce((acc, control) => {
        const amount = control.get('finalOvertimeAmount').value;
        return acc + (amount ? parseFloat(amount) : 0);
      }, 0);
    }

}
