import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { EmployeeService } from '../../employee/employee.service';
import { SessionService } from 'src/app/shared/services/session.service';
import jwtDecode from 'jwt-decode';
import { Router } from '@angular/router';
import { AlertService } from 'src/app/shared/_alert';
import { GlobalConstants } from 'src/app/shared/global-constants';
import { EncrypterService } from 'src/app/shared/services/encrypter.service';
import { LoginService } from '../../login/login.service';
import { ApprovalsService } from '../../approvals/approvals.service';
import { MasterServiceService } from 'src/app/shared/services/master-service.service';
import { dongleState, grooveState } from 'src/app/app.animation';

@Component({
  selector: 'app-salary-structure',
  templateUrl: './salary-structure.component.html',
  styleUrls: ['./salary-structure.component.css','../welcome/welcome.component.css'],
  animations: [dongleState, grooveState]
})
export class SalaryStructureComponent {

  showSidebar: boolean = false;
  salaryStructureForm: FormGroup;
  accountid: any;
  showAssistantBtn: boolean = false;
  salaryStructure: any=[];
  progressPercent: any = 0;
  progressData: any;
  formIndex: number=0;
  subSalaryStructureform :FormGroup;
  isDisabled : boolean=true;
  activeTab: any = 'Earnings';
  deductionsData: any;
  product_type: string;
  accessRights: any = {};
  addDeductionPopup: boolean;
  saveDeductionForm:FormGroup;
  token: any;
  other_ledger_data: any;
  
  constructor(
    private _formBuilder: FormBuilder,
    private toastr: ToastrService,
    private _employeeService: EmployeeService,
    private _sessionService: SessionService,
    private router: Router,
    private _AlertService: AlertService,
    private _encrypterService: EncrypterService,
    private _loginService : LoginService,
    private _approvalsService: ApprovalsService,
    private _masterService: MasterServiceService) {
      if (this.router.getCurrentNavigation().extras.state != undefined && this.router.getCurrentNavigation().extras.state.page != undefined) {
        this.showAssistantBtn = true;
      }  
  }

  ngOnInit() {
    let session_obj = JSON.parse(this._sessionService.get_user_session());
    let decoded_token: any = jwtDecode(session_obj.token);
    this.token = decoded_token;
    this.accountid = decoded_token.tp_account_id;
    this.product_type = localStorage.getItem('product_type');

    this.subSalaryStructureform= this._formBuilder.group({
      earningType : ['',[Validators.required,
        Validators.pattern(/^[a-zA-Z \-\(\)]+$/),
        Validators.maxLength(30)
      ]],
      earningName : [''],
      calculationtype : [''],
      calculationpercent :[''],
      epfapplicable : ['N'],
      esiapplicable : ['N'],
      isactive : ['']
    })

    this.saveDeductionForm = this._formBuilder.group({
      saveLedger: ['',  [Validators.required]],
    });

    this.accessRights = this._masterService.checkAccessRights('/approval/voucher');

    this.initialSalaryStructure();
    this.get_mst_business_setup();
    this.getMasterSalaryStructure();
    this.get_dashboard_status();
    this.getDeductionsData();

  }

  toggle() {
    this.showSidebar = !this.showSidebar;
  }

  get ss() {
    return this.salaryStructureForm.controls;
  }

  get salaryHeadText() {
    return this.salaryStructureForm.get('salary_head_text') as FormArray;
  }

  initialSalaryStructure() {
    this.salaryStructureForm = this._formBuilder.group({
      is_default_salary_structure: ['Y', [Validators.required]],
      salary_head_text: this._formBuilder.array([], [Validators.required]),
      is_fbp_allowances_taxable: ['Y', [Validators.required]],
      is_salary_structure_verify: ['N', [Validators.required]],
      salary_setup_createdby: [''],
    })
  }

  removeSalaryHead(index: number) {
    this.salaryHeadText.removeAt(index);
  }

  changeDefaultStructure(e: any) {
    let checked = e.target.checked;
    if (checked) {
      this.salaryStructureForm.patchValue({
        is_default_salary_structure: 'Y'
      })
    } else {
      this.salaryStructureForm.patchValue({
        is_default_salary_structure: 'N'
      })
    }
  }

  changeFbpAllowanceTax(e: any) {
    let checked = e.target.checked;
    if (checked) {
      this.salaryStructureForm.patchValue({
        is_fbp_allowances_taxable: 'Y'
      });
    } else {
      this.salaryStructureForm.patchValue({
        is_fbp_allowances_taxable: 'N'
      })
    }
  }

  verifySalaryStructure() {
    let data = this.salaryStructureForm.value;
    this.salaryStructureForm.patchValue({
      is_salary_structure_verify: 'Y'
    });

    data['action'] = 'manage_salary_structure_verify';
    this.manage_salary_structure(data);
  }

  editSalarycomponent(component:any,idx:number){

    this.formIndex = idx;  
    this.subSalaryStructureform.patchValue({
      earningType : component.value.earningtype,
      earningName : component.value.componentname,
      payslipName : component.value.componentname,
      calculationtype : component.value.calculationtype,
      calculationpercent : component.value.calculationpercent,
      isactive : component.value.isactive,
      epfapplicable : component.value.epfapplicable,
      esiapplicable : component.value.esiapplicable
    });

  }

  getEpfValue(isChecked:boolean){
    this.subSalaryStructureform.patchValue({
      epfapplicable : isChecked ? 'Y' : 'N'
    })
  }

  getEsiValue(isChecked:boolean){
    this.subSalaryStructureform.patchValue({
      esiapplicable : isChecked ? 'Y' : 'N'
    })
  }

  isComponentActive(checked :boolean){
    this.subSalaryStructureform.patchValue({
      isactive : checked ? 'Y' : 'N'
    })
  }

  saveSalaryStructure():any {
    this.salaryStructureForm.patchValue({
      is_salary_structure_verify: 'N'
    });
    let data = this.subSalaryStructureform.value;
    this.salaryHeadText.controls[this.formIndex].patchValue({
      earningtype : data.earningType,
      componentname : data.earningName,
      calculationtype : data.calculationtype,      
      calculationpercent : data.calculationpercent,
      epfapplicable : data.epfapplicable,
      esiapplicable : data.esiapplicable,
      isactive : data.isactive,
    })

    this.salaryStructureForm.value['action'] = 'manage_salary_structure';
    this.manage_salary_structure(this.salaryStructureForm.value);
  }

  setPercentage(component:any,idx:number){
    if(component=='Gratuity'){
      this.salaryHeadText.controls[idx].patchValue({
        percentage_ctc : 4.81,
        percentage_fixed : 'Percentage',
        is_taxable : 'N'
      })
    }
  }

  manage_salary_structure(data: any) {
    if (!this.salaryStructureForm.valid) {
      this.toastr.error('Please fill all the required fields', 'Oops!');
      return;
    }

    let tot_percent_ctc = 0;
    data.salary_head_text.map((el: any) => {
      if (el.percentage_fixed == 'Percentage' && el.salary_component!='HRA' && el.salary_component!='Gratuity') {
        tot_percent_ctc += parseFloat(el.percentage_ctc);
      }else if(el.salary_component=='HRA' || el.salary_component=='Gratuity'){
        tot_percent_ctc += (parseFloat(data.salary_head_text[0].percentage_ctc)*parseFloat(el.percentage_ctc))/100;
      }

    })

    // if (Math.ceil(tot_percent_ctc) != 100) {
    //   this.toastr.error('Please make sure that sum of the percentages is equal to 100', 'Oops!');
    //   this._AlertService.error('Please make sure that sum of the percentages is equal to 100', GlobalConstants.alert_options_autoClose);
    //   return;
    // }
    data['accountid'] = this.accountid;

    if (this.salaryStructureForm.valid) {
      this._employeeService.manage_salary_structure(data)
        .subscribe({
          next: (resData: any) => {
            if (resData.statusCode) {
              this.toastr.success(resData.message, 'Success');
              this._AlertService.success(resData.message, GlobalConstants.alert_options_autoClose);
              this.get_mst_business_setup();
              this.getMasterSalaryStructure()
            } else {
             // this.toastr.error(resData.message, 'Oops!');
              this._AlertService.error(resData.message, GlobalConstants.alert_options_autoClose);
            }
          },
          error: (e: any) => {
            console.log(e);
          }
        })

    } else {
      // this.toastr.error('Please fill all the required fields', 'Oops!');
      this._AlertService.error('Please fill all the required fields', GlobalConstants.alert_options_autoClose);
    }
  }

  get_mst_business_setup() {
    this._employeeService.get_mst_business_setup({
      'accountid': this.accountid,
    }).subscribe({
      next: (resData: any) => {
        if (resData.statusCode) {
          let data = resData.commonData[0];
          if (!data.salary_head_text) {
            // this.defaultSalaryHeadFunc();
          } else {
            // this.initialSalaryStructure();
            this.salaryStructureForm.patchValue({
              is_default_salary_structure: data.is_default_salary_structure,
              is_fbp_allowances_taxable: data.is_fbp_allowances_taxable,
              is_salary_structure_verify: data.is_salary_structure_verify,
              salary_setup_createdby: data.salary_setup_createdby
            });
           
          }
        } else {
          // this.defaultSalaryHeadFunc();
          // this.toastr.error(resData.message, 'Oops!');
        }
      }, error: (e) => {
        console.log(e);
      }
    })
  }

  getMasterSalaryStructure(){
    this._employeeService.getMasterSalaryStructure({'customerAccountId':this.accountid.toString()}).subscribe((resData:any)=>{
      if(resData.statusCode){
        this.salaryStructure=  JSON.parse(this._encrypterService.aesDecrypt(resData.commonData));
        for(let i=0;i<this.salaryStructure.length;i++){
          let exist = this.salaryHeadText.value.some(control => 
            control.id==this.salaryStructure[i].id
          );
          if(!exist)
          this.salaryHeadText.push(this._formBuilder.group({
            id : [this.salaryStructure[i].id],
            earningtype : [this.salaryStructure[i].earningtype],
            componentname : [this.salaryStructure[i].componentname],
            calculationtype : [this.salaryStructure[i].calculationtype],
            calculationbasis  : [this.salaryStructure[i].calculationbasis],
            epfapplicable : [this.salaryStructure[i].epfapplicable],
            esiapplicable : [this.salaryStructure[i].esiapplicable],
            calculationpercent : [this.salaryStructure[i].calculationpercent],
            isactive : [this.salaryStructure[i].isactive],
            displayorder : [this.salaryStructure[i].displayorder]
          }));
        }   
      }
    })
  }

  routeToCompany(check_flag: any) {
    if (check_flag == 'N') {
      this.router.navigate(['/dashboard/company-details'], { state: { 'page': 'welcome' } });
    } else {
      this.router.navigate(['/business-settings'], { state: { 'page': 'welcome' } });
    }
  }

  routeToPayout() {
    this.router.navigate(['/business-settings/payout'], { state: { 'page': 'welcome' } });
  }

  routeToLeave() {
    this.router.navigate(['/leave-mgmt/leave-settings'], { state: { 'page': 'welcome' } });
  }

  routeToAddEmp() {
    this.router.navigate(['/employees'], { state: { 'page': 'welcome' } });
  }

  routeTosalarystructure() {
    this.router.navigate(['/dashboard/salary-stucture'], { state: { 'page': 'welcome' } });
  }

  routeTosalarycompliance() {
    this.router.navigate(['/dashboard/compliance'], { state: { 'page': 'welcome' } });
  }

  get_dashboard_status() {
    this._loginService.get_dashboard_status({
      'account_id': this.accountid
    })
      .subscribe({
        next: (resData: any) => {
          if (resData.statusCode) {
            this.progressData = resData.commonData?.onboarding_assistant;
            let entries = Object.entries(this.progressData);
            // console.log(entries);
            let t = 0;
            entries.forEach(([key, val]) => {
              if (val == 'Y') {
                // console.log(key,val);
                t++;
              }
            })

            this.progressPercent = (t * (100 / entries.length)).toFixed(2);
            if (t == entries.length) {
              localStorage.setItem('assistant_status', 'N');
              localStorage.setItem('default_url', '/dashboard');
              //this.router.navigate(['/dashboard']);
            }
            // console.log(this.progressPercent);
          } else {
            this.progressData = {};
            this.progressPercent = 0;
            this.toastr.error(resData.message, 'Oops!');
          }
        }, error: (e: any) => {
          this.progressPercent = 0;
          this.progressData = {};
        }
      })
  }

  markAsActive(idx:number){
    this.salaryHeadText.controls[idx].patchValue({
      isactive : 'Y'
    })

    this.salaryStructureForm.value['action'] = 'manage_salary_structure';

    this.manage_salary_structure(this.salaryStructureForm.value);
  }

  markAsInactive(idx:number){
    this.salaryHeadText.controls[idx].patchValue({
      isactive : 'N'
    })

    this.salaryStructureForm.value['action'] = 'manage_salary_structure';

    this.manage_salary_structure(this.salaryStructureForm.value);
  }

  backPage(){
    this.router.navigate(['/business-settings/payout'], { state: { 'page': 'welcome' } });
  }

  nextPage() {
    this.router.navigate(['/leave-mgmt/leave-settings'], { state: { 'page': 'welcome' } });
  }

  
  // Start New code for Deductions Tab - sidharth kaul dated. 19.05.2025
  setActiveTab(text: any){
    this.activeTab = text;
    console.log("SET ACTIVE TAB", this.activeTab);
  }

  // GET DEDUCTIONS DATA
  getDeductionsData() {
    let obj = {
      ledgerName: 'Deduction',
      productTypeId: this.product_type,
      customerAccountId: this.accountid?.toString()
    }

    this._approvalsService.GetSubLedgerName(obj).subscribe((resData: any) => {
      if (resData.statusCode) {
        this.deductionsData = resData.commonData;
        console.log("Deductions Data :-", this.deductionsData);
      } else {
        this.deductionsData = [];
      }
    });
  }

  // Open Pop-up
  showAddDeductionPopup(){
    this.addDeductionPopup = true;

  }

  // Close Pop-up
  closeAddDeductionPopup(){
    this.addDeductionPopup = false;
    this.saveDeductionForm.reset();
  }

  // SAVE NEW LEDGER NAME
  SaveNewDeduction(){
    
    if (this.token.isEmployer != '1' && !(this.accessRights.Edit || this.accessRights.Add )) {
      this.toastr.error("You do not have the permission for this.");
      return; 
    }

    if (!this.saveDeductionForm.get('saveLedger')?.value) {
      // this.toastr.error("Please Enter a Ledger Name.");
      this._AlertService.error("Please Enter a Ledger Name.", GlobalConstants.alert_options_autoClose);
      return; 
    }

    let obj = {
      masterVoucherName: 'Debit',
      masterVoucherType: 'Deduction',
      masterVoucherTypeId: '1',
      isTaxableOther: 'N',
      createdBy: this.accountid?.toString(),
      otherLedgerName: this.saveDeductionForm.get('saveLedger')?.value,
      customerAccountId: this.accountid?.toString(),
    }

   this._approvalsService.SaveOtherLedgerCustomerSpecific(obj).subscribe((resData: any) => {
      // console.log(resData);
      if (resData.statusCode) {
        this.other_ledger_data = resData.commonData;
        this.getDeductionsData();
        this.toastr.success(resData.message);  
        this.closeAddDeductionPopup();
      } else {
        this.other_ledger_data = [];
        this._AlertService.error(resData.message, GlobalConstants.alert_options_autoClose);
      }

    });
  }
  // End New code for Deductions Tab - sidharth kaul dated. 19.05.2025


}