import { Component } from '@angular/core';
import { EmployeeService } from '../employee.service';
import { ToastrService } from 'ngx-toastr';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { EncrypterService } from 'src/app/shared/services/encrypter.service';
import decode from 'jwt-decode';
import { SessionService } from 'src/app/shared/services/session.service';

@Component({
  selector: 'app-setup-salary',
  templateUrl: './setup-salary.component.html',
  styleUrls: ['./setup-salary.component.css']
})
export class SetupSalaryComponent {

  showSidebar:boolean = true;
  salarySetupForm : FormGroup;
  states : any =[];
  salaryStructureData :any='';
  filterdSalData:any='';
  grossSal :any =0;
  prevFormVal: any;
  minWagesText: string='';
  templateData: any='';
  edit_salary_restructure: boolean=false;
  minWagesCtg: any=[];
  product_type: any ='';
  candidateDetails: any=[];
  token: any='';
  tp_account_id: any;
  routerDetails: any;
  statesMaster: any=[];
  minWageDays: any=[];
 
  constructor(
    private _EmployeeService : EmployeeService,
    private toastr : ToastrService,
    private  Router : Router,
    private _EncrypterService : EncrypterService,
    private _formBuilder : FormBuilder,
     private _SessionService :SessionService
  ){
    this.routerDetails = this.Router.getCurrentNavigation().extras.state;
  }

  ngOnInit(){

    let session_obj_d: any = JSON.parse(this._SessionService.get_user_session());
    this.token = decode(session_obj_d.token);
    this.tp_account_id = this.token.tp_account_id;
    this.product_type = this.token.product_type;
    this.salarySetupForm = this._formBuilder.group({
      payout_type: ['Monthly', [Validators.required]],
      pay_days: ['22', [Validators.required]],
      pfOpted: ['N', [Validators.required]],
      esicOpted: ['N', [Validators.required]],
      minWageState: ['', [Validators.required]],
      minWage_ctg: ['', [Validators.required]],
      inhandSal: ['', [Validators.pattern(/^-?\d+(\.\d+)?$/),Validators.required]],
      payout_method: ['', [Validators.required]],

    })
    this.getAppointmentDetails()
  }

  ngAfterViewInit() {
    if (this.minWagesText != '') {
      setInterval(() => {
        if (JSON.stringify(this.prevFormVal) != JSON.stringify(this.salarySetupForm.value)) {
          this.minWagesText = '';
        }
      }, 3000)
    }
  }
  
  toggle() {
    this.showSidebar = !this.showSidebar;
  }

  get sf(){
    return this.salarySetupForm.controls;
  }
  getAppointmentDetails(){
    let emp_code=this.routerDetails.mobile +'CJHUB'+this.routerDetails.emp_code +'CJHUB'+this.routerDetails.dob;
 
    this._EmployeeService.getAppointeeDetails({'customerAccountId': this._EncrypterService.aesEncrypt(this.tp_account_id.toString()),
    'productTypeId': this._EncrypterService.aesEncrypt(this.product_type),'empCode':this._EncrypterService.aesEncrypt(emp_code),'ecStatus': this.routerDetails.ecStatus}).subscribe((resData:any)=>{
      if(resData.statusCode){
        let appointMentDetails = JSON.parse(this._EncrypterService.aesDecrypt(resData.commonData));
        
        this.candidateDetails = appointMentDetails.candidateDetails;
        this.candidateDetails['encrypted_empid'] = this._EncrypterService.aesEncrypt(this.candidateDetails.emp_id + ',' + this.candidateDetails.js_id + ','+ this.routerDetails.ecStatus);
    
        let jsonData = this.candidateDetails.emp_address != '' ? JSON.parse(this.candidateDetails.emp_address) : this.candidateDetails.emp_address;
        let nonemptyVal = Object.values(jsonData).filter(value => value !== "");
        let perm_add = nonemptyVal.join(', ');
        this.candidateDetails.emp_address = perm_add;
        this.statesMaster = appointMentDetails.statesMaster;
        
      }else{
        this.candidateDetails = [];
        this.statesMaster =[];
      }

    })
  }

  getPfOption(opt: any) {
    this.salarySetupForm.patchValue({
      pfOpted: opt
    })
  }

  getEsicOpted(opt: any) {
    this.salarySetupForm.patchValue({
      esicOpted: opt
    })
  }

  getMinWagesState(state: any) {
    // let stateName = this.states.filter(obj => {
    //   if (obj.id == state.value)
    //     return obj;
    // })
  
    this._EmployeeService.GetMinWageCategoryByState({ 'minWagesStateName': state.value, 'productTypeId': this.product_type,'customerAccountId':this.tp_account_id.toString() }).subscribe((resData: any) => {
      if (resData.statusCode) {
        this.minWagesCtg = JSON.parse(this._EncrypterService.aesDecrypt(resData.commonData));
      } else {
        this.toastr.error(resData.message)
        this.minWagesCtg = [];
      }
    })
  }

  calSalryRestructure(): any {

    if (this.salarySetupForm.invalid) {
      return this.toastr.error("Invalid Form Input", "Oops");
    }

    if (this.sf.pfOpted.value == 'N' && this.sf.esicOpted.value == 'N' && Number(this.sf.inhandSal.value)<21050) {
      return this.toastr.error('Inhand salary should be more than 21050', "Oops");
    }

    this.salarySetupForm.patchValue({
      pfOpted: this.sf.pfOpted.value,
      esicOpted: this.sf.esicOpted.value
    })

    let stateName = this.states.filter(obj => {
      if (obj.id == this.salarySetupForm.controls['state'].value)
        return obj;
    })

    this.prevFormVal = this.salarySetupForm.value;
    let postData = {
      customerAccountId: this.tp_account_id.toString(),
      jsId: this.candidateDetails.js_id,
      ...this.salarySetupForm.value,
      productTypeId: this.product_type,
      doj: this.candidateDetails.dateofbirth
    }

    this._EmployeeService.getTpMinMaxPerDayWages(postData).subscribe((resData: any): any => {
      if (resData.statusCode) {
        let monthMinWage = 0, monthMaxWage = 0;
        for (let i = 0; i < resData.commonData.monthlyPayout.length; i++) {
          if (resData.commonData.monthlyPayout[i].monthDays == this.salarySetupForm.controls.pay_days.value) {
            monthMaxWage = Number(resData.commonData.monthlyPayout[i].monthMaxWage);
            monthMinWage = Number(resData.commonData.monthlyPayout[i].monthMinWage);
          }
        }

        if (Number(monthMinWage) <= Number(this.salarySetupForm.controls.inhandSal.value)) {
          for (let i = 0; i < resData.commonData.monthlyPayout.length; i++) {
            if (resData.commonData.monthlyPayout[i].monthDays == this.salarySetupForm.controls.pay_days.value) {
              this.minWagesText = (resData.commonData.monthlyPayout[i].monthMessageFirst) + '\n' + resData.commonData.monthlyPayout[i].monthMessageSecond;
            }
          }

          let postData = {
            customerAccountId: this.tp_account_id,
            jsId: this.candidateDetails.js_id,
            ...this.salarySetupForm.value,
            productTypeId: this.product_type
          }

          this._EmployeeService.CalcTPSalaryStructure(postData).subscribe((resData: any):any => {
            if (resData.statusCode) {
              this.salaryStructureData = resData.commonData;
        
              this.salaryStructureData['salarysetupcriteria'] = this.salarySetupForm.controls['payout_type'].value;
              // this.salaryStructureData['productTypeId'] = this.product_type;
              this.templateData = resData.templateData[0];
              this.filterdSalData = {
                'basic': this.salaryStructureData.basic == '' ? 0.0000 : (this.salaryStructureData.basic.includes('.') ? this.salaryStructureData.basic : (this.salaryStructureData.basic + ".0000")),
                'hra': this.salaryStructureData.hra == '' ? 0.0000 : (this.salaryStructureData.hra),
                'allowances': this.salaryStructureData.allowances == '' ? 0.0000 : (this.salaryStructureData.allowances),
                'epf_employer': this.salaryStructureData.epf_employer == '' ? 0.0000 : (this.salaryStructureData.epf_employer),
                'epf_employee': this.salaryStructureData.epf_employee == '' ? 0.0000 : (this.salaryStructureData.epf_employee),
                'esi_employer': this.salaryStructureData.esi_employer == '' ? 0.0000 : (this.salaryStructureData.esi_employer),
                'esi_employee': this.salaryStructureData.esi_employee == '' ? 0.0000 : (this.salaryStructureData.esi_employee),
                'ctc': this.salaryStructureData.ctc == '' ? 0.0000 : (this.salaryStructureData.ctc),
                'salary_in_hand': this.salaryStructureData.salary_in_hand == '' ? 0.0000 : (this.salaryStructureData.salary_in_hand),
              }

              let grossVal = Number(this.filterdSalData.basic) + Number(this.filterdSalData.hra) + Number(this.filterdSalData.allowances);
              this.grossSal = grossVal.toString().includes('.') ? grossVal : (grossVal + ".0000");


            }else{
              this.minWagesText=resData.message;
              // return this.toastr.error(resData.message,"Oops");
            }
          })
        } else {
          this.salaryStructureData = '';
     
          for (let i = 0; i < resData.commonData.monthlyPayout.length; i++) {
            if (resData.commonData.monthlyPayout[i].monthDays == this.salarySetupForm.controls.pay_days.value) {
              this.minWagesText = (resData.commonData.monthlyPayout[i].monthMessageFirst) + '\n' + resData.commonData.monthlyPayout[i].monthMessageSecond;
            }
          }
        }
      } else {
        this.salaryStructureData='';
        return this.toastr.error(resData.message)
      }
    })

  }


  saveSalary() {
    let sal_struct = [];

    sal_struct.push(this.salaryStructureData);
    let postData = {
      'jsId': this.candidateDetails.js_id,
      'dateOfJoining': this.candidateDetails.dateofjoining,
      'tpSalaryStructure': sal_struct,
      'jobRole': this.candidateDetails.post_offered,
      'customerAccountId': this.tp_account_id.toString(),
      'tpLeaveTemplateId': this.templateData.templateid.toString(),
      'updatedBy': this.token.id,
      'minWageStateName': this.sf.minWageState.value,
      'productTypeId': this.product_type
    }
    this._EmployeeService.SaveTpCandidateSalary(postData).subscribe((resData: any) => {
      if (resData.statusCode) {
        this.toastr.success(resData.message);
        this.Router.navigate(['/employees']);
      } else {
        this.toastr.error(resData.message);
      }
    })
  }

  getMinWageDays(){
    this._EmployeeService.getMinWageDays({}).subscribe((resData:any)=>{
      if(resData.statusCode){
        this.minWageDays = JSON.parse(this._EncrypterService.aesDecrypt(resData.commonData));
      }else{
        this.toastr.error(resData.message);
      }
    })
  }
}
