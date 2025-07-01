import { Component, Input } from '@angular/core';
import { FormBuilder,Validators } from '@angular/forms';
import decode from 'jwt-decode';
import { ToastrService } from 'ngx-toastr';
import { AlertService } from 'src/app/shared/_alert';
import { EncrypterService } from 'src/app/shared/services/encrypter.service';
import { SessionService } from 'src/app/shared/services/session.service';
import { EmployeeManagementService } from '../../employee-management/employee-management.service'; 
import { dongleState, grooveState } from 'src/app/app.animation';
import { MasterServiceService } from 'src/app/shared/services/master-service.service';

@Component({
  selector: 'app-employee-documents',
  templateUrl: './employee-documents.component.html',
  styleUrls: ['./employee-documents.component.css'],
  animations : [grooveState,dongleState]
})
export class EmployeeDocumentsComponent {
  documentBase64: string = '';
  checkbox_Confirm_popup:boolean=false;
  documentName: string = '';
  tp_account_id: any = '';
  document_id:any;
  token: any = '';
  product_type: any;
  document_master_data:any=[];
  employer_name:any;
  employer_mobile:any
  isPanelOpen: boolean[] = [];
  @Input() empDataFromParent: any;
  add_edit_document_data:any=[];
  emp_id:any;
  documentCategoryId:any;
  addRemarks : boolean= false;
  remarks : string ='';
  docDetails: any={};
  accessRights: any;
  currentUrl: any='';

  constructor(
    public toastr: ToastrService,
    private _sessionService: SessionService,
    private _formBuilder: FormBuilder,
    private _EncrypterService: EncrypterService,
    private _EmployeeManagementService: EmployeeManagementService,
    private _alertservice: AlertService,
    private _masterService : MasterServiceService
  ) { }

  ngOnInit() {
    let session_obj_d: any = JSON.parse(this._sessionService.get_user_session());
    this.token = decode(session_obj_d?.token);
    this.tp_account_id = this.token.tp_account_id;
    this.product_type = localStorage.getItem('product_type');
    this.employer_name=this.token.name;
    this.employer_mobile=this.token.mobile;
    this.emp_id=this.empDataFromParent?.emp_id;
    this.accessRights = this._masterService.checkAccessRights('/employee-mgmt');
    this.currentUrl = window.location.pathname;
    this.GetDocument_MasterDetails();
  }
  togglePanel(index: number) {
    // Toggle the panel state (open/close) based on index
    this.isPanelOpen[index] = !this.isPanelOpen[index];
}
  GetDocument_MasterDetails(){
    this._EmployeeManagementService.GetCandidateDocumentMasterDetails({
      "customerAccountId": this.tp_account_id?.toString(),
      "productTypeId":this.product_type,
      "empId":this.emp_id?.toString()
        })
          .subscribe((resData: any) => {
            if (resData.statusCode) {
              this.document_master_data = resData.commonData;
            } else {
              this.document_master_data=[];
              this.toastr.error(resData.message, 'Oops!');
            }
          })
  }

  onDocumentFileSelected(event: Event,data:any,category_data:any): any {
    
    const input = event.target as HTMLInputElement;
    this.document_id=data.master_document_id;
    this.documentCategoryId =category_data.document_category_id;
    if (!input.files?.length) {
      return; // No file selected
    }
  
    const file = input.files[0];
    this.documentName = file.name;
  
    // Check file size (must be less than 1 MB)
    if (file.size > 1048576) {
      this.toastr.error('File must be less than 1 MB.', 'File Size Error');
      this.clearFileInput(input);
      return;
    }
  
    const fileExtension = this.documentName.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'pdf'].includes(fileExtension)) {
        this.handleDocumentFile(file, fileExtension);
    } else {
        this.toastr.error('Invalid file type. Only JPG, PNG, and PDF are allowed.', 'File Type Error');
        this.clearFileInput(input);
    }
  }
  
  handleDocumentFile(file: File, fileType: string): void {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = () => {
        const base64String = reader.result as string;
        // Prepend the appropriate prefix based on the file type
        this.documentBase64 = base64String; // The full Base64 string including the prefix
        this.open_confirmation_popup();
    };

    reader.onerror = (error) => {
        console.error('File reading error: ', error);
    };
}
  
  clearFileInput(input: HTMLInputElement): void {
    input.value = ''; // Clear the file input
  }
  open_confirmation_popup(){
    this.checkbox_Confirm_popup = true;
  }
  close_checkbox_Confirm_popup(){
    this.checkbox_Confirm_popup=false;
  }
  isImage(filePath: string): boolean {
    const imageExtensions = ['jpg', 'jpeg', 'png'];
    const extension = filePath.split('.').pop()?.toLowerCase();
    return imageExtensions.includes(extension || '');
  }
  
  isPdf(filePath: string): boolean {
    const extension = filePath.split('.').pop()?.toLowerCase();
    return extension === 'pdf';
  }  
  AddEdit_Document(){
    const createdBy = `${this.employer_name}-${this.employer_mobile}`;
    this._EmployeeManagementService.AddEditDocument({
      "customerAccountId": this.tp_account_id?.toString(),
      "productTypeId":this.product_type,
      "documentId": this.document_id?.toString(),
      "empId":this.emp_id?.toString(),
      "documentCategoryId": this.documentCategoryId?.toString(),
      "documentBase64": this.documentBase64,
      "uploadedByUser":this.emp_id
        })
          .subscribe((resData: any) => {
            if (resData.statusCode) {
              this.add_edit_document_data = resData.commonData;
              this.GetDocument_MasterDetails();
              this.close_checkbox_Confirm_popup();
              this.toastr.success(resData.message, 'Success!');
            } else {
              this.add_edit_document_data=[];
              this.toastr.error(resData.message, 'Oops!');
            }
          })
  }

  showAddRemarks(status:string,docDetail:any){
    this.addRemarks =true;
    this.docDetails.docStatus=status;
    this.docDetails.candidateDocId = docDetail.candidate_document_id;
  }

  changeDocumentStatusAcceptReject():any{
    if(this.token.isEmployer != '1' && !this.accessRights.Edit){
      return this.toastr.error("You do not have the permission for this.");
    }

    if(this.docDetails.docStatus=='R' && this.remarks==''){
      return this.toastr.error("Please enter remarks.");
    }
    this._EmployeeManagementService.changeDocumentStatusAcceptReject({
      productTypeId : this.product_type,
      customerAccountId : this.tp_account_id,
      empId : this.empDataFromParent.emp_id,
      candidateDocId : this.docDetails.candidateDocId,
      acceptStatus : this.docDetails.docStatus,
      remarks : this.remarks,
    }).subscribe((resData:any)=>{
      if(resData.statusCode){
        this.toastr.success(resData.message);
        this.GetDocument_MasterDetails();
        this.addRemarks = false;
        this.remarks='';
        this.docDetails= {};
      }else{
        this.toastr.error(resData.message);
      }
    })
  }

}
