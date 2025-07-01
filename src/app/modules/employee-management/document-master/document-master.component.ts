import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormArray,FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import decode from 'jwt-decode';
import { AlertService } from 'src/app/shared/_alert';
import { EncrypterService } from 'src/app/shared/services/encrypter.service';
import { SessionService } from 'src/app/shared/services/session.service';
import { ReportService } from '../../reports/report.service';
import { EmployeeManagementService } from '../employee-management.service';
import { dongleState, grooveState } from 'src/app/app.animation';
import { EmployeeService } from '../../employee/employee.service';
declare var $: any;

@Component({
  selector: 'app-document-master',
  templateUrl: './document-master.component.html',
  styleUrls: ['./document-master.component.css'],
  animations: [dongleState, grooveState]
})
export class DocumentMasterComponent {
  employer_name:any;
  employer_mobile:any
  add_category_data:any=[];
  add_category_document_data:any=[];
  showSidebar : boolean=true;
  tp_account_id: any = '';
  token: any = '';
  product_type: any;
 CategoryForm:FormGroup;
 DocumentForm:FormGroup;
  document_master_data:any=[];
  open_add_category_popup:boolean=false;
  open_document_popup:boolean=false;

  filteredEmployees : any = [];

  masterCategoryForm : any = [];
 
  modifiedBy:any = '';
  dropdownSettings = {
    singleSelection: false,
    idField: 'emp_id',
    textField: 'emp_name',
    selectAllText: 'Select All',
    unSelectAllText: 'Unselect All',
    allowSearchFilter: true,
    enableCheckAll: true,
    itemsShowLimit: 5,
  }; 

  constructor(
    public toastr: ToastrService,
    private _sessionService: SessionService,
    private _formBuilder: FormBuilder,
    private _EncrypterService: EncrypterService,
    private _EmployeeManagementService: EmployeeManagementService,
    private _alertservice: AlertService,
    private _EmployeeService : EmployeeService
  ){
    this.masterCategoryForm = this._formBuilder.group({
      masterCatArray: this._formBuilder.array([]),
      empIds:['']
    });
  }


  ngOnInit() {
    let session_obj_d: any = JSON.parse(
    this._sessionService.get_user_session());
    this.token = decode(session_obj_d.token);
    this.tp_account_id = this.token.tp_account_id;
    this.product_type = localStorage.getItem('product_type');
    this.employer_name=this.token.name;
    this.employer_mobile=this.token.mobile;

    this.modifiedBy = this.token.name+"-"+this.token.mobile;

    this.CategoryForm = this._formBuilder.group({
      CategoryName: ['', [Validators.required]],
    });
    this.DocumentForm = this._formBuilder.group({
      DocumentCategory: [''],
      DocumentName: ['', [Validators.required]],
      DocumentMandatory: ['N', [Validators.required]],
      actionType: ['', [Validators.required]]
    });
    
    
    this.GetDocument_MasterDetails();

   
    this.employer_details();

    
  }

  get masterFormArr(){
    return this.masterCategoryForm.controls.masterCatArray as FormArray;
  }
  
  toggle() {
    this.showSidebar = !this.showSidebar;
  }
  open_category_popup(){
    this.open_add_category_popup=true;
  }
  close_category_popup(){
    this.open_add_category_popup=false;
    this.CategoryForm.reset();
  }
  open_popup(){
    this.open_document_popup=true;
  }
  close_popup(){
    this.open_document_popup=false;
    this.DocumentForm.reset();
  }
 
  GetDocument_MasterDetails(){
    this.masterFormArr.clear();
    this._EmployeeManagementService.GetDocumentMasterDetails({
      "customerAccountId": this.tp_account_id?.toString(),
      "productTypeId":this.product_type
        })
          .subscribe((resData: any) => {
            if (resData.statusCode) {
              this.document_master_data = resData.commonData;

              this.document_master_data.map(obj=>{
                this.masterFormArr.push(this._formBuilder.group({
                  'fieldStatus':false,
                  'document_category_id':obj.document_category_id,
                  'document_category_name':obj.document_category_name
                }))
              })
             

            } else {
              //this.masterFormArr.clear();
              this.document_master_data=[];
              this.toastr.error(resData.message, 'Oops!');
            }
          })
  }
  
  AddNew_Catagory(){
    const createdBy = `${this.employer_name}-${this.employer_mobile}`;
    this._EmployeeManagementService.AddNewCatagory({
      "customerAccountId": this.tp_account_id?.toString(),
      "productTypeId":this.product_type,
      "createdByUser":createdBy,
      "documentCategoryName":this.CategoryForm.get('CategoryName')?.value?.toString()
        })
          .subscribe((resData: any) => {
            if (resData.statusCode) {
              this.add_category_data = resData.commonData;
              this.close_category_popup();
              this.GetDocument_MasterDetails();
              this.toastr.success(resData.message, 'Success!');
            } else {
              this.add_category_data=[];
              this.toastr.error(resData.message, 'Oops!');
            }
          })
  }

  AddCatagory_DocumentName(){
    const createdBy = `${this.employer_name}-${this.employer_mobile}`;
    this._EmployeeManagementService.AddCatagoryDocumentName({
      "customerAccountId": this.tp_account_id?.toString(),
      "productTypeId":this.product_type,
      "createdByUser":createdBy,
      "documentCategoryName":this.DocumentForm.get('DocumentCategory')?.value?.toString(),
      "documentName":this.DocumentForm.get('DocumentName')?.value?.toString(),
      "isMandatory":this.DocumentForm.get('DocumentMandatory')?.value?.toString()
        })
          .subscribe((resData: any) => {
            if (resData.statusCode) {
              this.add_category_document_data = resData.commonData;
              this.close_popup();
              this.GetDocument_MasterDetails();
              this.toastr.success(resData.message, 'Success!');
            } else {
              this.add_category_document_data=[];
              this.toastr.error(resData.message, 'Oops!');
            }
          })
  }
  onActionChange(actionType: string, documentId: string) {
    this.EnableDisable_CatagoryDocument(actionType, documentId);
  }
  EnableDisable_CatagoryDocument(actionType: string, documentId: string) {
    const createdBy = `${this.employer_name}-${this.employer_mobile}`;
    this._EmployeeManagementService.EnableDisableCatagoryDocument({
      "customerAccountId": this.tp_account_id?.toString(),
      "productTypeId": this.product_type,
      "updatedByUser": createdBy,
      "actionType": actionType,
      "documentId": documentId
    }).subscribe((resData: any) => {
      if (resData.statusCode) {
        this.add_category_document_data = resData.commonData;
        this.GetDocument_MasterDetails();
        this.toastr.success(resData.message, 'Success!');
      } else {
        this.add_category_document_data = [];
        this.toastr.error(resData.message, 'Oops!');
      }
    });
  }


  employer_details() {
    let ou_id = '';

    let desgName =[];
   
    let deptName =[];
    
    this._EmployeeService
      .employer_details({
        customeraccountid: this.tp_account_id.toString(),
        productTypeId: this.product_type,
        GeoFenceId: this.token.geo_location_id,
        ouIds: !this.token.ouIds ? ou_id : this.token.ouIds,
        department : deptName ?deptName.toString():'',
        designation : desgName ? desgName.toString():'',
        searchKeyword : '',
        employeesStatus : 'Active'
      })
      .subscribe((resData: any) => {
        if (resData.statusCode) {
          // this.employee_data = resData.commonData;
          let employee_data = resData.commonData;
          this.filteredEmployees = employee_data;

        }else{
          this.filteredEmployees =[];
        }
      });
  }

  updateMasterCatDefineEmployee(){
    let post = this.masterCategoryForm.value;
    let empCodes = ''
    let docementCategoryId = '';
    if(post.empIds != '' && post.empIds != null){
      empCodes = (post.empIds).map(emp => emp.emp_id).join(',');
    }
   
  docementCategoryId =  post.masterCatArray.filter(category => category.fieldStatus).map(category => category.document_category_id).join(',');
  if(empCodes == '' || empCodes == null){
    this.toastr.error('Please select at least one employee', 'Oops!');
  }
  else if(docementCategoryId == '' || docementCategoryId == null){
    this.toastr.error('Please select at least one document category', 'Oops!');
  }
  else{
  let reqs = {    
      "productTypeId":this._EncrypterService.aesEncrypt((this.product_type).toString()),
      "customerAccountId":this._EncrypterService.aesEncrypt((this.tp_account_id).toString()),
      "empIds":this._EncrypterService.aesEncrypt((empCodes).toString()),
      "documentCategoryIds":this._EncrypterService.aesEncrypt((docementCategoryId).toString()),
      "createdByUser":this.modifiedBy
    }
    this._EmployeeManagementService.updateMasterCatDefineEmployeeApi(reqs).subscribe((resData: any) => {
      if(resData.statusCode == true){
        return this.toastr.success(resData.message, 'Success!');
      }
      else{
        return this.toastr.error(resData.message, 'Oops!');
      }
    },error=>{
      return this.toastr.error(error.error.message, 'Oops!');
    })
  }

  }

  checkStatus(subCategoryDetails: any[]): boolean {
    if(subCategoryDetails != null){
      if(subCategoryDetails.length >0){
        return this.hasEnabledDocument(subCategoryDetails);
      }
    }
    return false;
  }

  hasEnabledDocument(subCategoryDetails: any[]): boolean {
    return subCategoryDetails.some(doc => doc.master_document_status === 'Y');
  }

}


