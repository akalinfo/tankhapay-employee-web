import { Component, Input } from '@angular/core';
import { SessionService } from 'src/app/shared/services/session.service';
import { EmployeeLoginService } from '../employee-login.service';
import decode from 'jwt-decode';
import { MasterServiceService } from 'src/app/shared/services/master-service.service';
import { EncrypterService } from 'src/app/shared/services/encrypter.service';
import { dongleState, grooveState } from 'src/app/app.animation';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-employee-reimbursement',
  templateUrl: './employee-reimbursement.component.html',
  styleUrls: ['./employee-reimbursement.component.css'],
  animations : [grooveState, dongleState]
})
export class EmployeeReimbursementComponent {

  token : any;
  tp_account_id:any;
  payout_method: any;
  product_type : any;
  accessRights:any=[];
  @Input() empDataFromParent;
  fromDate:any='';
  toDate : any='';
  status :any='All';
  reimbursementData: any=[];
  statusFilters :any=[];
  addEditReimbursment:boolean = false;
  reimbursementTypes : any=[];
  reimbursementForm : FormGroup;
  docUrl : any='';
  maxDate: string = new Date().toISOString().split('T')[0];

  constructor(private _sessionService: SessionService,
    private _employeeLoginService : EmployeeLoginService,
    private _masterService : MasterServiceService,
    private _encrypterService : EncrypterService,
    private _fb: FormBuilder,
    private toastr : ToastrService
  ){}

  ngOnInit(){
    let session_obj_d: any = JSON.parse(
    this._sessionService.get_user_session());
    this.token = decode(session_obj_d.token);
    this.tp_account_id = this.token.tp_account_id;
    this.payout_method = this.token.payout_mode_type;
    // this.product_type = token.product_type;
    this.product_type = localStorage.getItem('product_type');
    // this.accessRights = this._masterService.checkAccessRights('/employees');

    this.reimbursementForm = this._fb.group({
      "reimbursmentHeadId": ['',[Validators.required]],
      "expenseDate": ['',[Validators.required]],
      "expenseAmount": ['', [
        Validators.required, 
        Validators.maxLength(11) // Max length of 11 digits
      ]],
      "expenseDescription": ['',[Validators.required]],
      "documentsJson" : [''],
      "claimRecordId":['']
    })
    this.getAllReimbursementClaims();
  }

  get al(){
    return this.reimbursementForm.controls;
  }
  changeStatusFilter(status:string){
    this.status = status;
  }
  getAllReimbursementClaims(){
    let fromDate = this.fromDate.split('-').reverse().join('/');
    let toDate = this.toDate.split('-').reverse().join('/');
    this._employeeLoginService.getAllReimbursementClaims({
      customerAccountId : this._encrypterService.aesEncrypt(this.tp_account_id.toString()),
      "fromDate" : fromDate,
      "toDate": toDate,
      "empCode" : this._encrypterService.aesEncrypt(this.empDataFromParent.emp_code.toString()),
      "filterStatus":this.status,
      "productTypeId" : this._encrypterService.aesEncrypt(this.product_type.toString())
    }).subscribe((resData:any)=>{
      if(resData.statusCode){
        this.statusFilters = (JSON.parse(this._encrypterService.aesDecrypt(resData.commonData))).filterTypes;
        this.reimbursementTypes = (JSON.parse(this._encrypterService.aesDecrypt(resData.commonData))).reimbursementTypeMaster;
        this.reimbursementData = (JSON.parse(this._encrypterService.aesDecrypt(resData.commonData))).reimbursementClaimsDetails;
      }else{
        this.reimbursementData =[];
      }
    })
  }
  
  showAddEditModal(reimbursement:any=''){
    this.addEditReimbursment = true;
    console.log(reimbursement);
    
    if(reimbursement){
      this.reimbursementForm.patchValue({
        "reimbursmentHeadId": reimbursement.reimbursement_id,
        "expenseDate": reimbursement.expense_date.split('/').reverse().join('-'),
        "expenseAmount": reimbursement.expense_amount,
        "expenseDescription": reimbursement.expense_description,
        "documentsJson" : '',
        "claimRecordId": reimbursement.claim_record_id
      })
    }
    let body = document.querySelector('body');
    if(body){
      body.classList.add('modal-open');
    }
  }

  hideAddEditModal(){
    this.addEditReimbursment = false;
    Object.keys(this.reimbursementForm.controls).forEach(key => {
      this.reimbursementForm.get(key)?.setValue('');
    });
    let body = document.querySelector('body');
    if(body){
      body.classList.remove('modal-open');
    }
  }

  readFile(event: Event) {
    const input = event.target as HTMLInputElement;
    
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      // this.fileName = file.name;
      let fileName = file.name;

      const reader = new FileReader();
      reader.onload = () => {
        this.reimbursementForm.patchValue({
          documentsJson : JSON.stringify([{name:fileName,bytecode : reader.result.toString().split(',')[1]}])
        })
        // this.fileBase64 = reader.result; // Base64 result
        // console.log('Base64:', reader.result.toString().split(',')[1]);
      };

      reader.readAsDataURL(file);
    }
  }


  addEditReimbursementClaims(){
    let action = '';
    if(!this.reimbursementForm.value.claimRecordId ){
      action ='AddNewClaim';
    }else{
      action= 'EditClaim'
    }
    console.log('al:', this.al);
    // if (!this.al?.Description1?.value) {
    //   this.toastr.error("Please select leave type/subject");
    //   return;  // Early return to avoid further execution if validation fails
    // }
    if (this.reimbursementForm.invalid) {
      this.toastr.error("Please fill in all required fields.");
      return; // Stop further logic if form is invalid
    }

    let expenseDate = this.reimbursementForm.value.expenseDate.split('-').reverse().join('/');

    let postData ={
      "customerAccountId": this._encrypterService.aesEncrypt(this.tp_account_id.toString()),
      "empCode": this._encrypterService.aesEncrypt(this.empDataFromParent.emp_code.toString()),
      "action": this._encrypterService.aesEncrypt(action),
      "createdBy": this.tp_account_id.toString(),
      "productTypeId": this._encrypterService.aesEncrypt(this.product_type),
      ...this.reimbursementForm.value,
      expenseDate : expenseDate
    }
    this._employeeLoginService.addEditReimbursementClaim(postData).subscribe((resData:any)=>{
      if(resData.statusCode){
        this.toastr.success(resData.message);
        this.hideAddEditModal();
        this.getAllReimbursementClaims();
      }else{
        this.toastr.error(resData.message);
      }
    })
  }

  deleteReimbursementClaim(id:any){
    this._employeeLoginService.deleteReimbursementClaim({
      "customerAccountId": this._encrypterService.aesEncrypt(this.tp_account_id.toString()),
      "empCode": this._encrypterService.aesEncrypt(this.empDataFromParent.emp_code.toString()),
      "createdBy": this.tp_account_id.toString(),
      "claimRecordId": id,
      "productTypeId": this._encrypterService.aesEncrypt(this.product_type),
    }).subscribe((resData:any)=>{
      if(resData.statusCode){
        this.toastr.success(resData.message);
        this.getAllReimbursementClaims();
      }else{
        this.toastr.error(resData.message);
      }
    })
  }

    exportToExcel() {
      let fromDate = this.fromDate.split('-').reverse().join('/');
      let toDate = this.toDate.split('-').reverse().join('/');
      this._employeeLoginService.getAllReimbursementClaims({
        customerAccountId : this._encrypterService.aesEncrypt(this.tp_account_id.toString()),
        "fromDate" : fromDate,
        "toDate": toDate,
        "empCode" : this._encrypterService.aesEncrypt(this.empDataFromParent.emp_code.toString()),
        "filterStatus":this.status,
        "productTypeId" : this._encrypterService.aesEncrypt(this.product_type.toString())
      }).subscribe((resData:any)=>{
          if (resData.statusCode) {
            let data: any =  (JSON.parse(this._encrypterService.aesDecrypt(resData.commonData))).reimbursementClaimsDetails;
    
            let exportData = [];
            for (let i = 0; i < data.length; i++) {
                exportData.push({
                  'Type of Reimbursement': data[i].reimbursement_name,
                  "Expense Date": data[i].expense_date,
                  'Expense Amount': data[i].expense_amount,
                  'Expense Description': data[i].expense_description,
                  'Status': data[i].expense_doc_status_text,
                })
            }
    
            const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);
            const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
            const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    
            const excelData: Blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const downloadLink: any = document.createElement('a');
            downloadLink.href = window.URL.createObjectURL(excelData);
            let date = new Date()
            downloadLink.download = `Employee_Reimbursement.xlsx`;
            downloadLink.click();
          }
        })
      }
}
