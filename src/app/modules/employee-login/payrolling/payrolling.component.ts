import { Component, Input } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { SessionService } from 'src/app/shared/services/session.service';
import { EmployeeService } from '../../employee/employee.service';
import { EncrypterService } from 'src/app/shared/services/encrypter.service';
import { PayoutService } from '../../payout/payout.service';
import { Router } from '@angular/router';
import decode from 'jwt-decode';
import { BusinesSettingsService } from '../../business-settings/business-settings.service';
import { MasterServiceService } from 'src/app/shared/services/master-service.service';
import { dongleState, grooveState } from 'src/app/app.animation';
import { EmployeeManagementService } from '../../employee-management/employee-management.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
declare var $:any;


@Component({
  selector: 'app-payrolling',
  templateUrl: './payrolling.component.html',
  styleUrls: ['./payrolling.component.css','../../employee-management/empl-payrolling/empl-payrolling.component.css'],
  animations: [dongleState, grooveState]
})
export class PayrollingComponent {
payout_method : any;
  GetForm16_data:any=[];
  form16_flag:boolean=false;
  flag:boolean=false;
  payslip_data: SafeResourceUrl | null = null; 
  mobile:any;
  employer_mobile:any
  add_exit_data:any=[];
  reason_of_leaving_data:any=[];
  exit_detail_data:any=[];
  openPopup:boolean=false;
  open_form16_popup:boolean=false;
  candidateDetails: any='';
  token: any;
  tp_account_id: any;
  product_type: string;
  @Input() empDataFromParent: any;
  statutoryComplianceForm: FormGroup;
  statesMaster: any=[];
  deductionsMaster: any=[];
  isEditsal: boolean=false;
  edit_statutory_compliances: boolean=false;
  restructureMode: string='';
  isCustomEditSal: boolean=false;
  advanceSalaryform: FormGroup;
  customSalaryform: FormGroup;
  consultantform: FormGroup;
  otherDetailForm: FormGroup;
  Form16Form:FormGroup;
  Exit_form:FormGroup;
  salaryDetails: string='';
  minWagesCtg: any=[];
  LWF_master_data: any=[];
  lwfmsg: string='';
  PT_applied_master_data: any=[];
  ptmsg: string='';
  salaryStructure: any={};
  isGratuity: boolean=false;
  isShowSalaryTable: boolean=false;
  isEmployerGratuity: boolean=false;
  leaveTemplateData: any=[];
  customCalculatedData: any;
  isEmployerPartExcluded: any='N';
  grossSalary: any=0;
  esi_details: any='';
  pf_details: any='';
  customSalaryMsg: any='';
  isCustomInputTrigger: boolean=false;
  salaryPercent: { basicPercent: any; hraPercent: any; };
  salaryCalcType: string ='percent';
  gratuityInHand: boolean=false;
  isDojValid: boolean=false;
  edit_salary_restructure: boolean;
  accessRights: any;
  isFormDisable: boolean=false;
  edit_custom_salary: boolean=false;
  minWageDays: any=[];
  changedFields: Set<string> = new Set();
  master_data:any=[];
  selectedExitType: string = "";
  emp_name:any;
  employer_name:any;
  documentNameResignation: string = '';
  resignationBase64Data: string = '';
  resignationDocumentType: string = '';
  resignationFilePath: string = '';
  base64DataForm16: string = '';  
  originalDocumentNameForm16: string = ''; 
  base64DataNOC: string = '';  // To store the base64 encoded string for NOC file
  originalDocumentNameNOC: string = '';  // To store the original NOC file name
  documentTypeNOC: string = ''; 
  relievingBase64Data: string = ''; // To store the base64 encoded string for the relieving letter
  originalDocumentNameRelievingLetter: string = ''; // To store the original file name for the relieving letter
  relievingDocumentType: string = '';
  emp_id:any;
  financialYears_Array: string[] = [];
  selectedFinancial_Year: string;
  exit_row_id:any;
  exit_status_id:any;
  exit_status_name:any;
  exit_type_id:any;
  isEditConsultantSalary: boolean=false;
  monthsArray: any = [
    {
      'id': '1',
      'month': 'January',
    },
    {
      'id': '2',
      'month': 'February',
    },
    {
      'id': '3',
      'month': 'March',
    },
    {
      'id': '4',
      'month': 'April',
    },
    {
      'id': '5',
      'month': 'May',
    },
    {
      'id': '6',
      'month': 'June',
    },
    {
      'id': '7',
      'month': 'July',
    },
    {
      'id': '8',
      'month': 'August',
    },
    {
      'id': '9',
      'month': 'September',
    },
    {
      'id': '10',
      'month': 'October',
    },
    {
      'id': '11',
      'month': 'November',
    },
    {
      'id': '12',
      'month': 'December',
    }
  ];
  yearsArray: any = [];
  year: any;
  selected_date: any;
  days_count: any;
  fin_year:any;
  month: any;
  edli_adminchargesincludeinctc: any;
  financialYearsArray: string[] = [];
  selectedFinancialYear: string = '';
  addForm16_data:any=[];
  form16_id:any;
  
  form16_edit_popup:boolean=false;
  isGrpInsurance: boolean=false;
  isGrpInsuranceAllowed: any='';
  employerInsurance:any=0;
  employeeInsurance :any=0;
  tds_details : any ='';
  maxDays: number=0;

  constructor(
    public toastr: ToastrService,
    private _sessionService: SessionService,
    private _formBuilder: FormBuilder,
    private _EmployeeService : EmployeeService,
    private _EncrypterService : EncrypterService,
    private Router : Router,
    private _BusinesSettingsService: BusinesSettingsService,
    private _PayoutService: PayoutService,
    private _EmployeeManagementService:EmployeeManagementService,
    private _masterService : MasterServiceService,
    private sanitizer: DomSanitizer) {

  }

  ngOnInit(){
    let session_obj_d: any = JSON.parse(
    this._sessionService.get_user_session());
    this.token = decode(session_obj_d?.token);
    this.tp_account_id = this.token.tp_account_id;
    this.payout_method = this.token.payout_mode_type;
    this.employer_name=this.token.name;
    this.employer_mobile=this.token.mobile;
    
    // this.product_type = token.product_type;
    this.product_type = localStorage.getItem('product_type');
    this.accessRights = this._masterService.checkAccessRights('/employees');
    const date = new Date();
    let currentMonth = date.getMonth() + 1; // getMonth() returns 0-11, so add 1
    let currentYear = date.getFullYear();
    for (let i = 2022; i <= currentYear + 1; i++) {
      this.yearsArray.push(i);
    };
    this.selected_date = localStorage.getItem('selected_date') || null;
    this.generateFinancialYears();

    if (this.selected_date) {
      this.days_count = this.selected_date.split('-')[0];
      this.month = this.selected_date.split('-')[1];
      this.year = this.selected_date.split('-')[2];
      // console.log("A",this.month,this.year);
    } else {
      this.month = currentMonth.toString();
      this.year = currentYear.toString();
      // console.log("B",this.month,this.year);
    }

    this.Form16Form = this._formBuilder.group({
      documentByteCode: ['', [Validators.required]],
      documentUploadType: ['', [Validators.required,]],
    });

    this.getMasterData();
    this.getAppointmentDetails();
    if (this.empDataFromParent?.emp_code) {
      this.GetForm16_Details();
    }

  }
  openFileInNewTab(filePath: string): void {
    window.open(filePath, '_blank');
}
generateFinancialYears(): void {
  const currentYear = new Date().getFullYear();
  this.financialYearsArray.push('All');  // Add 'All' option first
  
  for (let i = 0; i < 3; i++) {  // Adjust the range as needed
    const financialYear = `${currentYear - i}-${currentYear - i + 1}`;
    this.financialYearsArray.push(financialYear);
  }
  
  this.selectedFinancialYear = this.financialYearsArray[0];  // Default to 'All' or current financial year
}

openEditPopup(data:any){
  this.form16_id=data?.form_16_row_id;
  this.fin_year=data?.financial_year;
  this.form16_edit_popup=true;
}
closeEditPopup(){
  this.form16_edit_popup=false;
  this.removeForm16File();
}
changeFinancialYear(event: any): void {
  this.selectedFinancialYear = event.target.value;
  this.GetForm16_Details();
}
changeMonth(e: any) {
  this.month = e.target.value;
  let date = new Date(this.year, this.month, 0).getDate() + '-' + this.month + '-' + this.year;
  this.selected_date = date;
  localStorage.setItem('selected_date', date);
}

changeYear(e: any) {
  this.year = e.target.value;
  let date = new Date(this.year, this.month, 0).getDate() + '-' + this.month + '-' + this.year;
  this.selected_date = date;
  localStorage.setItem('selected_date', date);
}

ngAfterViewChecked() {
  let currDate = new Date();
  // currDate.setMonth(currDate.getMonth() + 1);
  currDate.setDate(currDate.getDate() + 30);
  $('#customEffectiveDate').datepicker({
    dateFormat: 'mm/yy',
    changeMonth: true,
    changeYear: true,
    defaultDate: '1',
    maxDate: currDate,
    beforeShowDay: function(date) {
      // Disable all days except the 1st of the month
      return [date.getDate() === 1, ''];
    }
  })
}

// open_form16_popup
open_form_popup(){
  this.open_form16_popup=true;
}
close_form16_popup(){
  this.open_form16_popup=false;
  this.removeForm16File();
}
open_exit_popup(data:any){
  this.openPopup = true;
  this.emp_name=data?.emp_name;
  this.emp_id=data?.emp_id;
  this.selectedExitType = this.master_data.find(item => item.id === this.exit_detail_data.exit_type_id)?.exittype || '';

  this.Exit_form.patchValue({
    exitTypeId: this.exit_detail_data.exit_type_id || '',
    documentByteCodeResignation: this.exit_detail_data.resignation_doc_path || '',
    documentByteCodeNOC: this.exit_detail_data.noc_doc_path || '',
    documentByteCodeRelievingLetter: this.exit_detail_data.relieving_experience_letter_path || '',
    NOCClearanceDate: this.exit_detail_data.noc_clearance_date || '',
  });
  this.GetReasons_Of_Leaving(this.exit_detail_data.exit_type_id);
  if (this.exit_detail_data.exit_type_id === '3') { 
    this.Exit_form.patchValue({
      resignationDate: this.exit_detail_data.termination_date || '',
    });
  } else {
    this.Exit_form.patchValue({
      resignationDate: this.exit_detail_data.resignation_date || '',
    });
  }
  
  if (this.exit_detail_data.exit_type_id === '1' ) {
    this.Exit_form.patchValue({
      noticePeriod: this.exit_detail_data.notice_period || '',
      relievingDate: this.exit_detail_data.agreed_relieving_date || '',
    });
  }
  if (this.exit_detail_data.exit_type_id === '1' || this.exit_detail_data.exit_type_id === '3') {
    this.Exit_form.patchValue({
      exitReason: this.exit_detail_data.reason_of_leaving || ''
    });
    
  }
  if (this.exit_detail_data.exit_status_id == '5') {
    this.Exit_form.patchValue({
      finalDues: this.exit_detail_data.final_dues || '',
      clearanceDate: this.exit_detail_data.final_dues_clearance_date || ''
    });
  }

  setTimeout(() => {
    $('#resignationDate').datepicker({
      dateFormat: 'dd/mm/yy',
      changeMonth: true,
      changeYear: true,
      defaultDate: null 
    })
  }, 1000);

  setTimeout(() => {
    $('#NOCClearanceDate').datepicker({
      dateFormat: 'dd/mm/yy',
      changeMonth: true,
      changeYear: true,
      defaultDate: null 
    })
  },1000);
  setTimeout(() => {
    $('#relievingDate').datepicker({
      dateFormat: 'dd/mm/yy',
      changeMonth: true,
      changeYear: true,
      defaultDate: null 
    });
  }, 1000);

  setTimeout(() => {
    $('#clearanceDate').datepicker({
      dateFormat: 'dd/mm/yy',
      changeMonth: true,
      changeYear: true,
      defaultDate: null
    });
  }, 1000);

}
getFileName(path: string): string {
  return path ? path.split('/').pop() : '';
}
getDateLabel(): string {
  switch (this.selectedExitType) {
    case 'Resignation Received':
      return 'Date of Resignation';
    case 'Termination':
      return 'Termination Date';
    case 'Retirement':
      return 'Retirement Date';
    case 'Absconding':
      return 'Absconding reported Date';
    case 'Demise':
      return 'Demise reported Date';
    default:
      return 'Date of Resignation'; 
  }
}
getDynamicLabel(): string {
  switch (this.exit_detail_data?.exit_type_name) {
    case 'Retirement':
      return 'Retirement Date';
    case 'Absconding':
      return 'Absconding Reported Date';
    case 'Demise':
      return 'Demise Reported Date';
    case 'Resignation Received':
      return 'Date of Resignation';
    default:
      return 'Date of Resignation'; 
  }
}
close_exit_popup(){
  this.openPopup = false;
  this.Exit_form.reset();
  this.removeNOCImage();
  this.removeResignationFile();
  this.removeRelievingFile();
  this.resetResignationFileData();
}
getMasterData(){
  this._PayoutService.GetMaster({
    "actionType": "GetMasterExitTypes",
    "productTypeId": this.product_type,
  }).subscribe((resData: any) => {
    // console.log(resData);
    if (resData.statusCode) {
      this.master_data = resData.commonData;
    } else {
      this.master_data = [];
      this.toastr.error(resData.message);
    }
  });
}
onResignationTypeChange(event: any) {
  const selectedValue = event.target.value;
  this.selectedExitType = this.master_data.find(item => item.id === selectedValue)?.exittype || '';
  // Call GetReasonsOfLeaving with the selected exitTypeId
  this.GetReasons_Of_Leaving(selectedValue);
  setTimeout(() => {
    $('#relievingDate').datepicker({
      dateFormat: 'dd/mm/yy',
      changeMonth: true,
      changeYear: true,
      defaultDate: null 
    });
  }, 1000);
  this.removeResignationFile();
}

// Function to hide separation reason for specific resignation types
isSeparationReasonHidden(): boolean {
  return this.selectedExitType === 'Retirement' || 
         this.selectedExitType === 'Absconding' || 
         this.selectedExitType === 'Demise';
}

onResignationFileSelected(event: Event): void {
  const input = event.target as HTMLInputElement;
  if (!input.files?.length) {
    this.resetResignationFileData();
    return;
  }

  const file = input.files[0];
  this.documentNameResignation = file.name;

  if (file.size > 1048576) { // 1 MB limit
    this.toastr.error('File must be less than 1 MB.', 'File Size Error');
    this.clearFileInput(input);
    return;
  }

  const fileExtension = this.documentNameResignation.split('.').pop()?.toLowerCase();
  if (fileExtension === 'jpg' || fileExtension === 'jpeg' || fileExtension === 'png' || fileExtension === 'pdf') {
    this.handleResignationFile(file, fileExtension);
  } else {
    this.toastr.error('Invalid file type. Only JPG, PNG, and PDF are allowed.', 'File Type Error');
    this.clearFileInput(input);
  }

  // Update the form control for originalDocumentNameResignation
  this.Exit_form.patchValue({
    originalDocumentNameResignation: this.documentNameResignation,
  });
}
isPdf(fileName: string): boolean {
  const extension = fileName?.split('.')?.pop()?.toLowerCase();
  return extension === 'pdf';
}
isImage(fileName: string): boolean {
  const extension = fileName?.split('.')?.pop()?.toLowerCase();
  return extension === 'jpg' || extension === 'jpeg' || extension === 'png';
}

handleResignationFile(file: File, fileType: string): void {
  const reader = new FileReader();
  reader.readAsDataURL(file);

  reader.onload = () => {
    const base64String = reader.result as string;
    this.resignationBase64Data = base64String.split(',')[1];
    this.resignationDocumentType = file.type.split('/')[1];
    // Update form control with base64 data
    this.Exit_form.patchValue({
      documentByteCodeResignation: this.resignationBase64Data,
    });
  };

  reader.onerror = (error) => {
    console.error('File reading error: ', error);
  };
}

// Handling NOC file selection
onNOCFileSelected(event: Event): void {
  const input = event.target as HTMLInputElement;
  if (!input.files?.length) {
    this.originalDocumentNameNOC = '';
    this.base64DataNOC = '';
    this.clearFileInput(input);
    return;
  }

  const file = input.files[0];
  this.originalDocumentNameNOC = file.name;

  if (file.size > 1048576) { // 1 MB limit
    this.toastr.error('Uploaded NOC document must be less than 1 MB.', 'File Size Error');
    this.clearFileInput(input);
    return;
  }

  const fileExtension = this.originalDocumentNameNOC.split('.').pop()?.toLowerCase();
  if (fileExtension === 'jpg' || fileExtension === 'jpeg' || fileExtension === 'png' || fileExtension === 'pdf') {
    this.handleNOCFile(file, fileExtension);
  } else {
    this.toastr.error('Invalid file type. Only JPG, PNG, and PDF are allowed.', 'File Type Error');
    this.clearFileInput(input);
  }
}

handleNOCFile(file: File, fileType: string): void {
  const reader = new FileReader();
  reader.readAsDataURL(file);

  reader.onload = () => {
    const base64String = reader.result as string;
    this.base64DataNOC = base64String.split(',')[1];
    this.documentTypeNOC = file.type.split('/')[1];

    // Set form controls for NOC
    this.Exit_form.patchValue({
      documentByteCodeNOC: this.base64DataNOC,
      originalDocumentNameNOC: this.originalDocumentNameNOC,
    });
  };

  reader.onerror = (error) => {
    console.error('File reading error: ', error);
  };
}

clearFileInput(input: HTMLInputElement): void {
  input.value = ''; // Reset file input
}

resetResignationFileData(): void {
  this.documentNameResignation = '';
  this.resignationBase64Data = '';
  this.resignationDocumentType = '';
}

removeResignationFile(): void {
  this.resetResignationFileData();
  this.Exit_form.patchValue({
    originalDocumentNameResignation: '',
    documentByteCodeResignation: '',
  });

  const fileInput = document.querySelector('#inputGroupFile01') as HTMLInputElement;
  if (fileInput) {
    fileInput.value = '';
  }
}

removeNOCImage(): void {
  // Clear the file input's values
  this.originalDocumentNameNOC = '';
  this.base64DataNOC = '';
  this.documentTypeNOC = '';

  // Get the specific file input by ID or class, then reset it
  const fileInput = document.querySelector('#inputGroupFile02') as HTMLInputElement; // Match with the file input ID
  if (fileInput) {
    fileInput.value = ''; // Clear the file input selection
  }

  // Reset the form controls that hold the file's data
  this.Exit_form.patchValue({
    documentByteCodeNOC: '',
    originalDocumentNameNOC: '',
  });
}
onForm16FileSelected(event: Event): void {
  const input = event.target as HTMLInputElement;
  if (!input.files?.length) {
    this.originalDocumentNameForm16 = '';
    this.base64DataForm16 = '';
    this.clear_FileInput(input);
    return;
  }

  const file = input.files[0];
  this.originalDocumentNameForm16 = file.name;

  if (file.size > 1048576) { // 1 MB limit
    this.toastr.error('Uploaded Form 16 must be less than 1 MB.', 'File Size Error');
    this.clear_FileInput(input);
    return;
  }

  const fileExtension = this.originalDocumentNameForm16.split('.').pop()?.toLowerCase();
  if (fileExtension === 'pdf') {
    this.handleForm16File(file);
  } else {
    this.toastr.error('Invalid file type. Only PDF is allowed.', 'File Type Error');
    this.clear_FileInput(input);
  }
}

handleForm16File(file: File): void {
  const reader = new FileReader();
  reader.readAsDataURL(file);

  reader.onload = () => {
    const base64String = reader.result as string;
    this.base64DataForm16 = base64String.split(',')[1];
  };

  reader.onerror = (error) => {
    console.error('File reading error: ', error);
  };
}

clear_FileInput(input: HTMLInputElement): void {
  input.value = ''; // Reset file input
}

removeForm16File(): void {
  this.originalDocumentNameForm16 = '';
  this.base64DataForm16 = '';

  const fileInput = document.getElementById('inputGroupFileForm16') as HTMLInputElement;
  if (fileInput) {
    fileInput.value = ''; 
  }
}

onRelievingFileSelected(event: Event): void {
  const input = event.target as HTMLInputElement;
  if (!input.files?.length) {
    this.originalDocumentNameRelievingLetter = ''; 
    this.relievingBase64Data = '';
    this.clearFileInput(input);
    return;
  }

  if (input.files && input.files.length > 0) {
    const file = input.files[0];
    this.originalDocumentNameRelievingLetter = file.name;

    if (file.size > 1048576) { // Check if file size is more than 1 MB
      this.toastr.error('Uploaded document must be less than 1 MB.', 'File Size Error');
      this.clearFileInput(input); // Clear input to reset selection
      return;
    }

    const fileExtension = this.originalDocumentNameRelievingLetter.split('.').pop()?.toLowerCase();
    if (fileExtension === 'jpg' || fileExtension === 'jpeg' || fileExtension === 'png' || fileExtension === 'pdf') {
      this.handleSupportedFileRelieving(file);
    } else {
      this.toastr.error('Invalid file type. Only JPG, PNG, and PDF are allowed.', 'File Type Error');
      this.clearFileInput(input); 
    }
  }
}

handleSupportedFileRelieving(file: File): void {
  const reader = new FileReader();
  reader.readAsDataURL(file);

  reader.onload = () => {
    const base64String = reader.result as string;
    this.relievingBase64Data = base64String.split(',')[1]; // Store the base64 encoded string
    this.relievingDocumentType = file.type.split('/')[1]; // Store the document type
  };

  reader.onerror = (error) => {
    console.error('File reading error: ', error);
  };
}

removeRelievingFile(): void {
  this.originalDocumentNameRelievingLetter = '';
  this.relievingBase64Data = '';
  this.relievingDocumentType = '';

  const fileInput = document.querySelector('#inputGroupFileRelieving') as HTMLInputElement;
  if (fileInput) {
    fileInput.value = ''; // Clear the input file selection
  }
}
  

  get sf(){
    return this.statutoryComplianceForm.controls;
  }

  get variableForm() {
    return this.statutoryComplianceForm.controls.otherVariablesDetails as FormArray;
  }

  getAppointmentDetails() {

    let emp_code = this.empDataFromParent.mobile + 'CJHUB' + (this.empDataFromParent.emp_code == '' ? this.empDataFromParent.js_id : this.empDataFromParent.emp_code) + 'CJHUB' + this.empDataFromParent.dob;
    let ecStatusValue = (this.empDataFromParent.emp_code == '' ? 'TEC' : 'EC')

    this._EmployeeService.getAppointeeDetails({
      'customerAccountId': this._EncrypterService.aesEncrypt(this.tp_account_id.toString()),
      'productTypeId': this._EncrypterService.aesEncrypt(this.product_type), 'empCode': this._EncrypterService.aesEncrypt(emp_code), 'ecStatus': ecStatusValue
    }).subscribe((resData: any):any => {
      if (resData.statusCode) {
        let appointMentDetails = JSON.parse(this._EncrypterService.aesDecrypt(resData.commonData));

        this.candidateDetails = appointMentDetails.candidateDetails;
        let jsonData = this.candidateDetails.emp_address != '' ? JSON.parse(this.candidateDetails.emp_address) : this.candidateDetails.emp_address;
        let nonemptyVal = Object.values(jsonData).filter(value => value !== "");
        let perm_add = nonemptyVal.join(', ');
        // this.candidateDetails.emp_address = perm_add;
        this.candidateDetails.emp_address = perm_add?.replaceAll('<br>', '');
        let  basic_details= this.candidateDetails;
 
        if (this.candidateDetails.joiningStatus == 'RESTRUCTURE' && localStorage.getItem('restructureMode')=='Restructure') {
          this.isEditsal = true;
          this.edit_statutory_compliances = true;
          this.restructureMode ='Restructure';
        }else if(this.candidateDetails.joiningStatus == 'RESTRUCTURE' && localStorage.getItem('restructureMode')=='CustomRestructureMode'){
          this.isCustomEditSal = true;
          this.restructureMode ='CustomRestructureMode';
        }else if(this.candidateDetails.joiningStatus == 'JOINED'){
          localStorage.setItem('restructureMode','');
        }
       // console.log(this.candidateDetails.is_lwf_state);
        
       
        if (this.candidateDetails.joiningStatus == 'JOINED' || this.candidateDetails.joiningStatus == 'RESTRUCTURE' || this.candidateDetails.joiningStatus=='RELIEVED') {
          this.getSalaryStructure();
        }

        this.deductionsMaster = appointMentDetails.deductionsMaster;
        this.statesMaster = appointMentDetails.statesMaster;
      } else {
        this.candidateDetails = [];
        this.deductionsMaster = [];
        this.statesMaster = [];
        return this.toastr.error(resData.message);
      }
      
    })
  }

  checkDOJ(): any {
    if ($('#doj').val() != '' && $('#dob') != '') {
      let dobParts = $('#dob').val().split('/');
      let formattedDateDob: any = `${dobParts[2]}/${dobParts[1]}/${dobParts[0]}`;

      let minDate = new Date(formattedDateDob);
      minDate.setFullYear(minDate.getFullYear() + 18);
      let dojValue = $('#doj').val(); // Assuming #doj contains a date in "dd-mm-yy" format
      let dojParts = dojValue.split('/');
      let formattedDateDoj = `${dojParts[2]}-${dojParts[1]}-${dojParts[0]}`;
      let dojDate = new Date(formattedDateDoj);

      if (dojDate <= minDate) {
        this.isDojValid = false;
        return this.toastr.error(`Date of joining must be greater than or equal to ${dobParts[0]}/${dobParts[1]}/${(Number(dobParts[2]) + 18)}`)
      } else {
        this.isDojValid = true;
      }
    }
  }
  
  getSalaryStructure() {
    this._EmployeeService.getSalaryStructure({
      'productTypeId': this._EncrypterService.aesEncrypt(this.product_type),
      'customerAccountId': this._EncrypterService.aesEncrypt(this.tp_account_id.toString()), 'empId':
        this._EncrypterService.aesEncrypt(this.candidateDetails.emp_id),
      'salaryMode' :'Custom'
    }).subscribe((resData: any) => {
      if (resData.statusCode) {
        this.salaryStructure = JSON.parse(this._EncrypterService.aesDecrypt(resData.commonData));
      
        this.isGratuity = this.salaryStructure.gratuity=='' || (this.salaryStructure.gratuity!='' && Math.round(this.salaryStructure.gratuity)==0)?false :true;
        
        let date = !this.salaryStructure.effectivefrom?'': (this.salaryStructure.effectivefrom.substring(0, 10).split('/')[1] + '/' +
          this.salaryStructure.effectivefrom.substring(0, 10).split('/')[0] + '/' +
          this.salaryStructure.effectivefrom.substring(0, 10).split('/')[2]);

        if(this.isGrpInsuranceAllowed=='Y'){
          this.isGrpInsurance = this.salaryStructure.isgroupinsurance =='Y'? true : false;
          if(this.isGrpInsurance){

            this.employeeInsurance=this.salaryStructure.insuranceamount;
            this.employerInsurance = this.salaryStructure.employerinsuranceamount;
            
          }
        }

        // this.calculateSal();
     
        this.isShowSalaryTable=true;
        this.isEmployerGratuity= this.salaryStructure.employergratuityopted!='N' ? true:false;
        this.edli_adminchargesincludeinctc = this.salaryStructure.edli_adminchargesincludeinctc;
        
        // if(this.candidateDetails.joiningStatus=='RESTRUCTURE' && localStorage.getItem('restructureMode')=='CustomRestructureMode'){
        //   this.getuspccalcgrossfromctc_withoutconveyance();
        // }
    
        this.salaryStructure['ctcAnnual'] = Math.round(this.salaryStructure['ctc']*12);
        this.salaryStructure['inHandAnnual'] = Math.round(this.salaryStructure['salaryinhand']*12);
        this.salaryStructure['grossAnnual'] = Math.round(this.salaryStructure['gross']*12);
        this.salaryStructure['total'] = (parseFloat(this.salaryStructure.gross) + parseFloat(this.salaryStructure.bonus || '0') + parseFloat(this.salaryStructure.employerepfrate ||'0' ) + parseFloat(this.salaryStructure.employeresirate||'0') + parseFloat(this.salaryStructure.employerlwf||'0') + parseFloat(this.salaryStructure.employergratuity ||'0')
                              +parseFloat(this.salaryStructure.mealvouchers || '0') + parseFloat(this.salaryStructure.medicalinsurancepremium || '0') + parseFloat(this.salaryStructure.teaallowances || '0')) + parseFloat(this.salaryStructure.employerinsuranceamount||'0');
        
        this.salaryStructure['totalAnnual'] = Math.round(this.salaryStructure['total']*12)
        this.salaryStructure['total'] = Math.round(this.salaryStructure['total'])

        if (this.salaryStructure && typeof this.salaryStructure === 'object') {
          for (const key in this.salaryStructure) {
            if (typeof Math.round(this.salaryStructure[key]) === 'number' && !Number.isNaN(Math.round(this.salaryStructure[key]))) {
              
              this.salaryStructure[key] = Math.round(this.salaryStructure[key]);
            } 
          }
        }

        const exclusions = [
          'Conveyance Allowance',
          'Medical',
          'Bonus',
          'Meal Vouchers',
          'Medical Insurance Premium',
          'Tea Allowances'
        ];

        this.salaryStructure['OtherDeductions'] = [
          {
            'deduction_name' : 'Salary Bonus',
            'deduction_amount' : this.salaryStructure.salarybonus
          },
          {
            'deduction_name' : 'Commission',
            'deduction_amount' : this.salaryStructure.commission
          },
          {
            'deduction_name' : 'Transport Allowance',
            'deduction_amount' : this.salaryStructure.transport_allowance
          },
          {
            'deduction_name' : 'Travelling Allowance',
            'deduction_amount' : this.salaryStructure.travelling_allowance
          },
          {
            'deduction_name' : 'Leave Encashment',
            'deduction_amount' : this.salaryStructure.leave_encashment
          },
          {
            'deduction_name' : 'Gratuity In Hand',
            'deduction_amount' : this.salaryStructure.gratuityinhand
          },
          {
            'deduction_name' : 'Overtime Allowance',
            'deduction_amount' : this.salaryStructure.overtime_allowance
          },
          {
            'deduction_name' : 'Notice Pay',
            'deduction_amount' : this.salaryStructure.notice_pay
          },
          {
            'deduction_name' : 'Hold Salary (Non Taxable)',
            'deduction_amount' : this.salaryStructure.hold_salary_non_taxable
          },
          {
            'deduction_name' : 'Children Education Allowance',
            'deduction_amount' : this.salaryStructure.children_education_allowance
          },
          ...(this.salaryStructure.OtherDeductions && this.salaryStructure.OtherDeductions.trim() !== ""
          ? JSON.parse(this.salaryStructure.OtherDeductions).filter((deduction: any) => 
              !exclusions.includes(deduction.deduction_name)
            )
          : [])
        ]

      } else {
        this.salaryStructure = '';
      }
    })
  }


  GetReasons_Of_Leaving(exitTypeId: string) {
    this._EmployeeManagementService.GetReasonsOfLeaving({
      "customerAccountId": this.tp_account_id?.toString(),
      "productTypeId": this.product_type,
      "exitTypeId": exitTypeId?.toString() 
    })
    .subscribe((resData: any) => {
      if (resData.statusCode) {
        this.reason_of_leaving_data = resData.commonData;
        // console.log(this.reason_of_leaving_data);
      } else {
        this.reason_of_leaving_data = [];
        // this.toastr.error(resData.message, 'Oops!');
      }
    });
  } 
 

  pay_salary_slip() {
    const empcodestring = `${this.empDataFromParent?.mobile?.toString()}CJHUB${this.empDataFromParent?.emp_code?.toString()}CJHUB${this.empDataFromParent?.dob?.toString()}CJHUB${this.month.toString()}CJHUB${this.year.toString()}`;
  
    this._EmployeeManagementService.GetSalarySlipURL({
      "productTypeId": this._EncrypterService.aesEncrypt(this.product_type),
      "empCodeString": this._EncrypterService.aesEncrypt(empcodestring.toString())
    }).subscribe((resData: any) => {
      if (resData.statusCode) {
        this.flag = true;  // Set flag to true if statusCode is successful
        const sanitizedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(resData.pdfPath);
  
        if (sanitizedUrl) {
          this.payslip_data = sanitizedUrl;
          this.toastr.success(resData.message, 'Success');
        } else {
          this.flag = false;
          this.payslip_data = null;
          this.toastr.error('Invalid PDF Path', 'Error');
        }
      } else {
        this.flag = false;
        this.payslip_data = null;  // Reset on failure
        this.toastr.error(resData.message, 'Oops!');
      }
    });
  }

  GetForm16_Details(){
    this._EmployeeManagementService.GetForm16Details({
      "customerAccountId": this.tp_account_id?.toString(),
      "productTypeId":  this.product_type,
      "empCode":this.empDataFromParent?.emp_code?.toString(),
      "financialYear":this.selectedFinancialYear?.toString()
        })
          .subscribe((resData: any) => {
            if (resData.statusCode) {
              this.GetForm16_data = resData.commonData;
              this.form16_flag=resData.statusCode;
              console.log(this.GetForm16_data[0]?.form16path);
              
            // this.toastr.success(resData.message, 'Success');
            } else {
              this.GetForm16_data=[];
              this.form16_flag=false;
              console.error('Error:', resData.message);
              // this.toastr.error(resData.message, 'Oops!');
            }
          })
  }

  Add_Form16(){
    const createdByUserName = `${this.employer_name}-${this.employer_mobile}`;
    // console.log(createdByUserName);
    
    this._EmployeeManagementService.AddEditForm16({
      "action":"AddForm16",
      "customerAccountId": this.tp_account_id?.toString(),
      "productTypeId":  this.product_type,
      "empCode":this.empDataFromParent?.emp_code?.toString(),
      "financialYear":this.selectedFinancialYear?.toString(),
      "createdBy":this.tp_account_id?.toString(),
      "createdByUserName":createdByUserName?.toString(),
      "form16RowId":"",
      "documentByteCode":this.base64DataForm16?.toString(),
      "originalDocumentName": this.originalDocumentNameForm16?.toString()
        })
          .subscribe((resData: any) => {
            if (resData.statusCode) {
              this.addForm16_data = resData.commonData;
              this.form16_flag=resData.statusCode;
              this.GetForm16_Details();
              this.close_form16_popup();
            console.log(this.addForm16_data);
            this.toastr.success(resData.message, 'Success');
            } else {
              this.form16_flag=false;
              this.addForm16_data=[];
              this.toastr.error(resData.message, 'Oops!');
            }
          })
  }
  Edit_Form16(){
    const createdByUserName = `${this.employer_name}-${this.employer_mobile}`;
    // console.log(createdByUserName);
    
    this._EmployeeManagementService.AddEditForm16({
      "action":"EditForm16",
      "customerAccountId": this.tp_account_id?.toString(),
      "productTypeId":  this.product_type,
      "empCode":this.empDataFromParent?.emp_code?.toString(),
      "financialYear":this.selectedFinancialYear?.toString(),
      "createdBy":this.tp_account_id?.toString(),
      "createdByUserName":createdByUserName?.toString(),
      "form16RowId":  this.form16_id?.toString(),
      "documentByteCode":this.base64DataForm16?.toString(),
      "originalDocumentName": this.originalDocumentNameForm16?.toString()
        })
          .subscribe((resData: any) => {
            if (resData.statusCode) {
              this.addForm16_data = resData.commonData;
              this.form16_flag=resData.statusCode;
              this.GetForm16_Details();
              this.closeEditPopup();
            console.log(this.addForm16_data);
            this.toastr.success(resData.message, 'Success');
            } else {
              this.form16_flag=false;
              this.addForm16_data=[];
              this.toastr.error(resData.message, 'Oops!');
            }
          })
  }

  printSalaryStructure(){
    var modalContent = document.querySelector('#salarystructure');
    var printWindow = window.open('', '_blank');

    printWindow.document.open();
    printWindow.document.write('<html><head><title>Salary Structure</title>');
    printWindow.document.write('<link rel="stylesheet" href="assets/css/style.css">');
    printWindow.document.write('<link rel="stylesheet" href="assets/plugins/css/plugins.css">');
    printWindow.document.write('<link rel="stylesheet" href="assets/css/bootstrap.min.css">');
    printWindow.document.write(`<style> .Appointment-outer-box{
      width:100%;
    }
    .Appointment-outer-box table tr th {
      font-weight: 600;
      background: #ceedff;
      line-height:30px;
      text-align: left;
      padding-left: 10px;
    }
    .Appointment-outer-box table tr.danger1 th {
      font-weight: 600;
      background: #ceedff;
      text-align: left;
      padding-left: 10px;
      line-height:30px;
    }
    .danger1 td{
      padding-left:10px;
      line-height:30px;
    }
    .danger3 td, .danger3 th {
      background: #337ab7 !important;
      color: #fff;
      padding-left :10px;
      line-height:30px;
    }
    .table-responsive{
      width: 100%;
    }
    table.table{
      width:100%;
    }
    p{
      font-size: 14px;
      text-align: center;
      margin: 0 0 10px;
      line-height: 1.8;
    }
    </style>`);
    printWindow.document.write(`</head><body><div class="Appointment-outer-box">
    <h3 style="padding: 0px;margin-top: 8px;text-align:center;margin-top: 43px;">ANNEXURE-A</h3>
    <p>Annual Earning Opportunity For ${this.candidateDetails.emp_name}</p>`);
    printWindow.document.write(modalContent.innerHTML);
    printWindow.document.write('</div></body></html>');
    printWindow.document.close();

    var printStyle = `
                      <style>
                        @media print {

                   body {
                    background-color: #eef5f9;
                    color: #67757c;
                    font-family: 'Montserrat', sans-serif;
                    font-size: 12px;
                    line-height: 1.618;
                    overflow-x: hidden;
                    -webkit-font-smoothing: antialiased;
                    margin: 0;
                    font-weight: 400;
                    }
                    .Appointment-outer-box{
                      width:100%;
                    }
                    .Appointment-outer-box table tr th {
                      font-weight: 600;
                      background: #ceedff;
                    }
                    .Appointment-outer-box table tr.danger1 th {
                      font-weight: 600;
                      background: #ceedff;
                      text-align: left;
                      padding-left: 10px;
                    }
                    .danger1 td{
                      padding-left:10px;
                    }
                    .danger3 td, .danger3 th {
                      background: #337ab7 !important;
                      color: #fff;
                      padding-left :10px;
                    }
                    .table-responsive{
                      width: 100%;
                    }
                    table.table{
                      width:100%;
                    }
                 </style>`;
    printWindow.document.head.insertAdjacentHTML('beforeend', printStyle);

    printWindow.print();
    // printWindow.window.close();

  }

}