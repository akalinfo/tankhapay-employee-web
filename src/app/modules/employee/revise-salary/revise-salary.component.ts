import { Component } from '@angular/core';
import { SessionService } from 'src/app/shared/services/session.service';
import decode from 'jwt-decode';
import { EmployeeService } from '../employee.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EncrypterService } from 'src/app/shared/services/encrypter.service';
import { ToastrService } from 'ngx-toastr';
import { state } from '@angular/animations';

@Component({
  selector: 'app-revise-salary',
  templateUrl: './revise-salary.component.html',
  styleUrls: ['./revise-salary.component.css']
})
export class ReviseSalaryComponent {
  showSidebar: boolean = true;
  token: any = '';
  tp_account_id: any = '';
  product_type: any = '';
  jsId: any = '';
  salarySetupForm: FormGroup;
  empId: any = '';
  view_emp_data: any = '';
  pfOpted: any = 'N';
  esicOpted: any = 'N';
  salaryStructuredata: any = '';
  isDisabled: boolean = false
  minWagesText: string = '';
  isEditsal: boolean = false;
  states: any = [];
  minWagesCtg: any = [];
  prevFormVal: any = '';
  filterdSalData: any = {};
  templateData: any = '';
  grossSal: any = 0;
  monthMinWageAmt: any = '';
  monthMaxWageAmt: any = '';
  isFormDisable: boolean = false;
  minWageDays: any=[];

  constructor(private _SessionService: SessionService,
    private _EmployeeService: EmployeeService,
    private router: ActivatedRoute,
    private _EncrypterService: EncrypterService,
    private _formBuilder: FormBuilder,
    private toastr: ToastrService,
    private Router: Router) {
    this.router.params.subscribe((params: any) => {
      let id = this._EncrypterService.aesDecrypt(params['id']);
      this.empId = id.split(',')[0];
      this.jsId = id.split(',')[1];
    });
  }
  ngOnInit() {
    let session_obj_d: any = JSON.parse(this._SessionService.get_user_session());
    this.token = decode(session_obj_d.token);
    this.tp_account_id = this.token.tp_account_id;
    this.product_type = this.token.product_type;

    this.salarySetupForm = this._formBuilder.group({
      payout_type: ['Monthly', [Validators.required]],
      pay_days: ['22', [Validators.required]],
      pfOpted: ['N', [Validators.required]],
      esicOpted: ['N', [Validators.required]],
      state: ['', [Validators.required]],
      minWage_ctg: ['', [Validators.required]],
      inhandSal: ['', [Validators.required]],
      payout_method: ['', [Validators.required]],

    })
    this.getstates();
    // this.getTpSalaryStructure();
    this.getEmployeeDetail();
    this.getMinWageDays();
  }

  editSalary() {
    this.view_emp_data.basicDetails.joiningStatus='RESTRUCTURE';
    this.SetCandidateRestructureMode('Restructure')
  }

  discardSalary() {
    this.view_emp_data.basicDetails.joiningStatus='JOINED';
    this.SetCandidateRestructureMode('DiscardRestructure');
  }
  getTpSalaryStructure() {
    this._EmployeeService.GetTPSalaryStructure({
      "customerAccountId": this.tp_account_id.toString(),
      "jsId": this.jsId,
      "productTypeId": this.product_type
    }).subscribe((resData: any) => {
      if (resData.statusCode) {
        this.salaryStructuredata = resData.commonData;
        this.filterdSalData = this.salaryStructuredata;
        this.grossSal = this.salaryStructuredata.salaryStructure.gross;
        let stateid = this.states.filter(obj => {
          if ((obj.state).toLowerCase() == (resData.commonData.salaryStructure.minwagestatename).toLowerCase()) return obj;
        });

        this.salarySetupForm.patchValue({
          payout_type: resData.commonData.payoutType,
          pay_days: resData.commonData.payoutDays,
          pfOpted: resData.commonData.pfapplicable,
          esicOpted: resData.commonData.esiapplicable,
          state: stateid[0].id,
          minWage_ctg: resData.commonData.minwagescategoryid,
          inhandSal: resData.commonData.salaryStructure.salary_in_hand,
          payout_method: resData.commonData.salaryStructure.timecriteria
        })

        this.getMinWagesState();
        this.pfOpted = resData.commonData.pfapplicable;
        this.esicOpted = resData.commonData.esiapplicable;

        for (let i = 0; i < resData.commonData.monthlyPayout.length; i++) {
          if (resData.commonData.monthlyPayout[i].monthDays == resData.commonData.payoutDays) {
            this.minWagesText = resData.commonData.monthlyPayout[i].monthMessageFirst + '\n' + resData.commonData.monthlyPayout[i].monthMessageSecond;
          }
        }
      }
    })
  }

  getEmployeeDetail() {

    this._EmployeeService.getTpCandidateDetails({ 'empId': this._EncrypterService.aesEncrypt(this.empId.toString()), 'productTypeId': this._EncrypterService.aesEncrypt(this.product_type) }).subscribe((resData: any): any => {
      if (resData.statusCode) {
        // this.employeeDetails = JSON.parse(this._EncrypterService.aesDecrypt(resData.commonData.commonData));
        this.view_emp_data = resData.commonData;
        if(this.view_emp_data.basicDetails.joiningStatus=='RESTRUCTURE'){
          this.isEditsal=true;
        }
        // console.log(this.view_emp_data.basicDetails.emp_address);
        if (Object.keys(this.view_emp_data.basicDetails).length == 0 && Object.keys(this.view_emp_data.kycDetails).length == 0 && Object.keys(this.view_emp_data.bankDetails).length == 0) {
          return this.toastr.warning('No data found for this employee', 'Oops');
        }

      }
    })

    //   }
    // })
  }

  get sf() {
    return this.salarySetupForm.controls;
  }

  getPfOption(opt: any) {
    this.pfOpted = opt;
    this.calSal();

  }

  getEsicOpted(opt: any) {
    this.esicOpted = opt;
    this.calSal();
  }

  getstates() {
    this._EmployeeService.getAll_state({}).subscribe((resData: any) => {
      if (resData.statusCode) {
        this.states = resData.commonData;
        this.getTpSalaryStructure();
      } else {
        this.states = [];
      }
    })
  }

  getMinWagesState() {

    let stateName = this.states.filter(obj => {
      if (obj.id == this.sf.state.value)
        return obj;
    })

    this._EmployeeService.GetMinWageCategoryByState({ 'minWagesStateName': stateName[0].state, 'productTypeId': this.product_type,'customerAccountId':this.tp_account_id.toString() }).subscribe((resData: any) => {
      if (resData.statusCode) {
        this.minWagesCtg = JSON.parse(this._EncrypterService.aesDecrypt(resData.commonData));
      } else {
        this.minWagesCtg = [];
        this.toastr.error(resData.message)
      }
    })
  }

  calSal() {
    if (this.salarySetupForm.invalid)
      return;
    this.calSalryRestructure();
  }

  calSalryRestructure(): any {
    this.minWagesText='';
    if (this.salarySetupForm.invalid) {
      return this.toastr.error("Invalid Form Input", "Oops");
    }

    if (this.pfOpted == 'N' && this.esicOpted == 'N' && Number(this.sf.inhandSal.value)<21050) {
      return this.toastr.error('Inhand salary should be more than 21050', "Oops");
    }

    this.salarySetupForm.patchValue({
      pfOpted: this.pfOpted,
      esicOpted: this.esicOpted
    })

    let stateName = this.states.filter(obj => {
      if (obj.id == this.salarySetupForm.controls['state'].value)
        return obj;
    })


    this.isFormDisable = false;
    this.prevFormVal = this.salarySetupForm.value;
    let postData = {
      customerAccountId: this.tp_account_id,
      'minWageState': stateName[0].state,
      jsId: this.jsId,
      ...this.salarySetupForm.value,
      productTypeId: this.product_type,
      doj: this.view_emp_data.basicDetails.dateofjoining
    }

    this._EmployeeService.getTpMinMaxPerDayWages(postData).subscribe((resData: any): any => {
      if (resData.statusCode) {


        let monthMinWage = 0, monthMaxWage = 0;
        for (let i = 0; i < resData.commonData.monthlyPayout.length; i++) {
          if (resData.commonData.monthlyPayout[i].monthDays == this.salarySetupForm.controls.pay_days.value) {
            monthMaxWage = Number(resData.commonData.monthlyPayout[i].monthMaxWage);
            monthMinWage = Number(resData.commonData.monthlyPayout[i].monthMinWage);
            this.monthMinWageAmt = resData.commonData.monthlyPayout[i].monthMinWage;
            this.monthMaxWageAmt = resData.commonData.monthlyPayout[i].monthMaxWage;
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
            'minWageState': stateName[0].state,
            jsId: this.jsId,
            ...this.salarySetupForm.value,
            productTypeId: this.product_type
          }

          this._EmployeeService.CalcTPSalaryStructure(postData).subscribe((resData: any) => {
            if (resData.statusCode) {
              this.salaryStructuredata = resData.commonData;
              this.salaryStructuredata['salarysetupcriteria'] = this.salarySetupForm.controls['payout_type'].value;
              this.salaryStructuredata['productTypeId'] = this.product_type;
              this.templateData = resData.templateData[0];
              this.filterdSalData['salaryStructure'] = {
                'basic': this.salaryStructuredata.basic == '' ? 0.0000 : (this.salaryStructuredata.basic.includes('.') ? this.salaryStructuredata.basic : (this.salaryStructuredata.basic + ".0000")),
                'hra': this.salaryStructuredata.hra == '' ? 0.0000 : (this.salaryStructuredata.hra),
                'allowances': this.salaryStructuredata.allowances == '' ? 0.0000 : (this.salaryStructuredata.allowances),
                'epf_employer': this.salaryStructuredata.epf_employer == '' ? 0.0000 : (this.salaryStructuredata.epf_employer),
                'epf_employee': this.salaryStructuredata.epf_employee == '' ? 0.0000 : (this.salaryStructuredata.epf_employee),
                'esi_employer': this.salaryStructuredata.esi_employer == '' ? 0.0000 : (this.salaryStructuredata.esi_employer),
                'esi_employee': this.salaryStructuredata.esi_employee == '' ? 0.0000 : (this.salaryStructuredata.esi_employee),
                'ctc': this.salaryStructuredata.ctc == '' ? 0.0000 : (this.salaryStructuredata.ctc),
                'salary_in_hand': this.salaryStructuredata.salary_in_hand == '' ? 0.0000 : (this.salaryStructuredata.salary_in_hand),
              }

              let grossVal = Number(this.filterdSalData['salaryStructure'].basic) + Number(this.filterdSalData['salaryStructure'].hra) + Number(this.filterdSalData['salaryStructure'].allowances);
              this.grossSal = grossVal.toString().includes('.') ? grossVal : (grossVal + ".0000");


            } else {
              this.minWagesText = resData.message;
            }
          })
        } else {
         
          this.salaryStructuredata = '';
          for (let i = 0; i < resData.commonData.monthlyPayout.length; i++) {
            if (resData.commonData.monthlyPayout[i].monthDays == this.salarySetupForm.controls.pay_days.value) {
              this.minWagesText = (resData.commonData.monthlyPayout[i].monthMessageFirst) + '\n' + resData.commonData.monthlyPayout[i].monthMessageSecond;
            }
          }
        }
      } else {

        return this.toastr.error(resData.message)
      }
    })

  }

  saveSalary(): any {

    if(Number(this.sf.inhandSal.value)< Number(this.monthMinWageAmt)){
      return this.toastr.error("Invalid In hand salary","Oops");
    }
    let stateName = this.states.filter(obj => {
      if (obj.id == this.salarySetupForm.controls['state'].value)
        return obj;
    })

    let sal_struct = [];
    // console.log(this.salaryStructureData);

    sal_struct.push(this.salaryStructuredata);
    let postData = {
      'jsId': this.jsId,
      'dateOfJoining': this.view_emp_data.basicDetails.dateofjoining,
      'tpSalaryStructure': sal_struct,
      'jobRole': this.view_emp_data.basicDetails.post_offered,
      'customerAccountId': this.tp_account_id.toString(),
      'tpLeaveTemplateId': this.templateData.templateid.toString(),
      'updatedBy': this.token.id,
      'minWageStateName': stateName[0].state,
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

  discardChanges() {
    if (confirm("Are you sure you want to discard changes?")) {
      this.Router.navigate(['/employees']);
    }
    return;
  }

  toggle() {
    this.showSidebar = !this.showSidebar;
  }

  SetCandidateRestructureMode(mode: any) {
    let postData = {
      customerAccountId: (this.tp_account_id.toString()),
      jsId: (this.jsId),
      productTypeId: (this.product_type),
      restructureMode: (mode)
    }

    this._EmployeeService.SetTpCandidateRestructureMode(postData).subscribe((resData: any) => {
      if (resData.statusCode == true) {
        this.toastr.success(resData.message);
        this.isEditsal = !this.isEditsal;
        this.isFormDisable = true;
      }
      else {
        this.toastr.error(resData.message);
        this.isEditsal = false;
        this.isFormDisable = false;
      }
    }, (error: any) => {
      this.toastr.error(error.error.message);
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
