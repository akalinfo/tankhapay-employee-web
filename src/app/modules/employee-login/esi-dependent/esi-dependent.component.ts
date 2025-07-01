import { Component,Input  } from '@angular/core';
import jwtDecode from 'jwt-decode';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SessionService } from 'src/app/shared/services/session.service';
import { dongleState, grooveState } from 'src/app/app.animation';
import { ToastrService } from 'ngx-toastr'; 
import { EmployeeLoginService } from '../../employee-login/employee-login.service';
import { EncrypterService } from 'src/app/shared/services/encrypter.service';

@Component({
  selector: 'app-esi-dependent',
  templateUrl: './esi-dependent.component.html',
  styleUrls: ['./esi-dependent.component.css'],
    animations : [grooveState,dongleState]
})
export class EsiDependentComponent {
  createModalStatus :boolean = false;
  dependentForm :FormGroup;
  updateDependentForm :FormGroup;
  decoded_token:any = '';
  @Input() empDataFromParent: any;
  tp_account_id:any = '';
  product_type:any = '';
  stateList:any = '';
  esicRelationship:any = '';
  genderList :any = '';
  dispensoryList:any = '';
  dispensoryName:any = '';
  dependentLists :any = '';
  updateModalStatus : boolean =false;
  maxDate:any = new Date();
 
  constructor(
    private toastr: ToastrService,
    private _sessionService: SessionService,
    private _formBuilder: FormBuilder,
    private _EmployeeLoginService : EmployeeLoginService,
  private _EncrypterService:EncrypterService) {
  }

  ngOnInit() {
    let session_obj: any = JSON.parse(this._sessionService.get_user_session());
    this.decoded_token = jwtDecode(session_obj.token);

    this.tp_account_id = this.decoded_token.tp_account_id;
    this.product_type = localStorage.getItem('product_type');
    this.getStateList();
    this.getEsicRelationship();

    this.dependentForm = this._formBuilder.group({
      dependentName: ['', [Validators.required]],
      dependentDob: ['', [Validators.required]],
      dependentGender: ['', [Validators.required]],
      dependentRelation: ['', [Validators.required]],
      dependentPreferredDispensary: ['', [Validators.required]],
      dependentDispensary: ['', [Validators.required]],
    });
    

    this.updateDependentForm = this._formBuilder.group({
      depedentId : ['', [Validators.required]],
      dependentName: ['', [Validators.required]],
      dependentDob: ['', [Validators.required]],
      dependentGender: ['', [Validators.required]],
      dependentRelation: ['', [Validators.required]],
      dependentPreferredDispensary: ['', [Validators.required]],
      dependentDispensary: ['', [Validators.required]],
    });

    let day = String(this.maxDate.getDate()).padStart(2, '0');
    let month = String(this.maxDate.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    let year = this.maxDate.getFullYear();
    this.maxDate = `${year}-${month}-${day}`;

    this.getDependentLists();

  }

  openCreateEsiDependent(){
    this.dependentForm.reset();
    this.createModalStatus = true;
  }
  closeCreateDependent(){
    this.createModalStatus = false;
  }
  getStateList(){
    this.stateList = [];
    this._EmployeeLoginService.getAllState({
    }).subscribe((resData: any) => {
      if(resData.statusCode == true){
        this.stateList = this._EncrypterService.aesDecrypt(resData.commonData);
        this.stateList = JSON.parse(this.stateList);
      }
      else{
        this.toastr.error(resData.message, 'Oops!');
      }
    },error => {
        this.toastr.error(error.error.message, 'Oops!');
    })
  }
  getEsicRelationship(){
    this.esicRelationship = [];
    this.genderList = [];
    this._EmployeeLoginService.esicRelationship({
      'productTypeId':this.product_type
    }).subscribe((resData: any) => {
      if(resData.statusCode == true){
        let result = this._EncrypterService.aesDecrypt(resData.commonData);
        result = JSON.parse(result);
        this.esicRelationship = result.relationshipTypes
        this.genderList = result.genderList;
      }
      else{
        this.toastr.error(resData.message, 'Oops!');
      }
    },error => {
        this.toastr.error(error.error.message, 'Oops!');
    })
  }

  getDispensory(event){ 
    const selectElement = event.target as HTMLSelectElement;
    const selectedIndex = (selectElement.selectedIndex)-1;
    let selectState = selectElement.value;
    this.getStateEsiDispensaries(selectState)
  }
  getDispensoryName(event){
    const selectElement = event.target as HTMLSelectElement;
    const selectedIndex = (selectElement.selectedIndex)-1;
    this.dispensoryName = this.dispensoryList[selectedIndex]?.dispensary_name || '';
  }
  getStateEsiDispensaries(value){
    this.dispensoryList = [];
    let reqst ={
      "stateName":this._EncrypterService.aesEncrypt(value),
      "productTypeId": this.product_type
    }
    this._EmployeeLoginService.getStateEsiDispensary(reqst).subscribe((resData: any) => {
      if(resData.statusCode == true){
        let result = this._EncrypterService.aesDecrypt(resData.commonData);
        result = JSON.parse(result);
        this.dispensoryList = result
      }
      else{
        this.toastr.error(resData.message, 'Oops!');
      }
    },error => {
        this.toastr.error(error.error.message, 'Oops!');
    })
  }
  saveDependentDetails(){
    let dependentPost = this.dependentForm.value;
    let emp_code = this.empDataFromParent.emp_code;
    let customerAccountId = this.tp_account_id;
    let createdBy = this.empDataFromParent.emp_code;
    let dependentName = dependentPost.dependentName;
    let dependentDob = dependentPost.dependentDob;
    let dependentGender = dependentPost.dependentGender;
    let relationship = dependentPost.dependentRelation;
    let dependentPreferredDispensary = dependentPost.dependentPreferredDispensary;
    let dependentDispensary = dependentPost.dependentDispensary;
    if(emp_code == '' || emp_code == null){
        this.toastr.error('Emp Code is required', 'Oops!');
    }
    else if(customerAccountId == '' || customerAccountId == null){
        this.toastr.error('Account Id is required', 'Oops!');
    }
    else if(createdBy == '' || createdBy == null){
        this.toastr.error('Submitted By is required', 'Oops!');
    }
    else if(dependentName == '' || dependentName == null){
        this.toastr.error('Dependent Name is required', 'Oops!');
    }
    else if(dependentDob == '' || dependentDob == null){
        this.toastr.error('Dependent Dob is required', 'Oops!');
    }
    else if(dependentGender == '' || dependentGender == null){
        this.toastr.error('Dependent Gender is required', 'Oops!');
    }
    else if(relationship == '' || relationship == null){
        this.toastr.error('RElation is required', 'Oops!');
    }
    else if(dependentPreferredDispensary == '' || dependentPreferredDispensary == null){
        this.toastr.error('State is required', 'Oops!');
    }
    else if(dependentDispensary == '' || dependentDispensary == null){
        this.toastr.error('Dispensary is required', 'Oops!');
    }
    else{
      emp_code = emp_code.toString();
      customerAccountId = customerAccountId.toString();
      createdBy = createdBy.toString();
      dependentName = dependentName.toString();
      dependentDob = dependentDob.toString();
      dependentGender = dependentGender.toString();
      relationship = relationship.toString();
      dependentPreferredDispensary = dependentPreferredDispensary.toString();
      dependentDispensary = dependentDispensary.toString();
      dependentDob = new Date(dependentDob);
      let day = String(dependentDob.getDate()).padStart(2, '0');
      let month = String(dependentDob.getMonth() + 1).padStart(2, '0'); // Months are 0-based
      let year = dependentDob.getFullYear();
      let formattedDob = `${day}/${month}/${year}`;
      
      let reqst = {
        "empCode": this._EncrypterService.aesEncrypt(emp_code), // enc
        "customerAccountId": this._EncrypterService.aesEncrypt(customerAccountId), //enc
        "createdByIp": "",
        "createdBy": createdBy,
        "dependentName": dependentName,
        "dependentDob": formattedDob,
        "dependentGender": dependentGender,
        "dependentRelationship": relationship,
        "dispensaryStateName": dependentPreferredDispensary,
        "dispensaryId": dependentDispensary,
        "dependentId": "",
        "actionType": "2cY1XQBi/025pWddWnX4kQ==",
        "documentBase64": "",
        "originalDocumentName": "",
        "productTypeId": this.product_type
      }
      this._EmployeeLoginService.saveOrUpdateDependent(reqst).subscribe((resData: any) => {
        if(resData.statusCode == true){
          this.toastr.success(resData.message, 'Success!');
          this.closeCreateDependent();
          this.getDependentLists();
        }
        else{
          this.toastr.error(resData.message, 'Oops!');
        }
      },error => {
          this.toastr.error(error.error.message, 'Oops!');
      })
    }
  }

  getDependentLists(){
    this.dependentLists = [];
    let emp_code = this.empDataFromParent.emp_code;
    let reqst ={
        "empCode": this._EncrypterService.aesEncrypt(emp_code.toString()) ,
        "customerAccountId": this._EncrypterService.aesEncrypt((this.tp_account_id).toString()),
        "productTypeId": this.product_type
    }
    this._EmployeeLoginService.getDependentLists(reqst).subscribe((resData: any) => {
      if(resData.statusCode == true){
        this.dependentLists = this._EncrypterService.aesDecrypt(resData.commonData);
        this.dependentLists = JSON.parse(this.dependentLists);
      }
      else{
        this.toastr.error(resData.message, 'Oops!');
      }
    },error => {
        this.toastr.error(error.error.message, 'Oops!');
    })
  }

  editDependent(obj){
    this.updateDependentForm.reset();
    this.getStateEsiDispensaries(obj.dispensary_state);
    let [day, month, year] = (obj.dependent_dob).split('/');
    let dob = `${year}-${month}-${day}`;
    setTimeout(() => {
      this.updateDependentForm.patchValue({
        depedentId :obj.dependent_id,
        dependentName:obj.dependent_name,
        dependentDob:dob,
        dependentGender:obj.dependent_gender,
        dependentRelation:obj.dependent_relation_code,
        dependentPreferredDispensary:obj.dispensary_state,
        dependentDispensary:obj.dispensary_id
      })
    }, 1000);
    this.updateModalStatus = true;
  }
  closeUpdateDependent(){
    this.updateModalStatus = false;
  }
  updateDependentDetails(){
    let updateDependentPost = this.updateDependentForm.value;
    let emp_code = this.empDataFromParent.emp_code;
    let customerAccountId = this.tp_account_id;
    let createdBy = this.empDataFromParent.emp_code;
    let dependentName = updateDependentPost.dependentName;
    let dependentDob = updateDependentPost.dependentDob;
    let dependentGender = updateDependentPost.dependentGender;
    let relationship = updateDependentPost.dependentRelation;
    let dependentPreferredDispensary = updateDependentPost.dependentPreferredDispensary;
    let dependentDispensary = updateDependentPost.dependentDispensary;
    let dependentId = updateDependentPost.depedentId;
    if(dependentId == '' || dependentId == null){
      this.toastr.error('Dependent Id is required', 'Oops!');
    }
    if(emp_code == '' || emp_code == null){
        this.toastr.error('Emp Code is required', 'Oops!');
    }
    else if(customerAccountId == '' || customerAccountId == null){
        this.toastr.error('Account Id is required', 'Oops!');
    }
    else if(createdBy == '' || createdBy == null){
        this.toastr.error('Submitted By is required', 'Oops!');
    }
    else if(dependentName == '' || dependentName == null){
        this.toastr.error('Dependent Name is required', 'Oops!');
    }
    else if(dependentDob == '' || dependentDob == null){
        this.toastr.error('Dependent Dob is required', 'Oops!');
    }
    else if(dependentGender == '' || dependentGender == null){
        this.toastr.error('Dependent Gender is required', 'Oops!');
    }
    else if(relationship == '' || relationship == null){
        this.toastr.error('Relation is required', 'Oops!');
    }
    else if(dependentPreferredDispensary == '' || dependentPreferredDispensary == null){
        this.toastr.error('State is required', 'Oops!');
    }
    else if(dependentDispensary == '' || dependentDispensary == null){
        this.toastr.error('Dispensary is required', 'Oops!');
    }
    else{
      emp_code = emp_code.toString();
      customerAccountId = customerAccountId.toString();
      createdBy = createdBy.toString();
      dependentName = dependentName.toString();
      dependentDob = dependentDob.toString();
      dependentGender = dependentGender.toString();
      relationship = relationship.toString();
      dependentPreferredDispensary = dependentPreferredDispensary.toString();
      dependentDispensary = dependentDispensary.toString();
      dependentDob = new Date(dependentDob);
      let day = String(dependentDob.getDate()).padStart(2, '0');
      let month = String(dependentDob.getMonth() + 1).padStart(2, '0'); // Months are 0-based
      let year = dependentDob.getFullYear();
      let formattedDob = `${day}/${month}/${year}`;
      
      let reqst = {
        "empCode": this._EncrypterService.aesEncrypt(emp_code), // enc
        "customerAccountId": this._EncrypterService.aesEncrypt(customerAccountId), //enc
        "createdByIp": "",
        "createdBy": createdBy,
        "dependentName": dependentName,
        "dependentDob": formattedDob,
        "dependentGender": dependentGender,
        "dependentRelationship": relationship,
        "dispensaryStateName": dependentPreferredDispensary,
        "dispensaryId": dependentDispensary,
        "dependentId": dependentId,
        "actionType": "8Oy8AwwyrUCHMuLx+QwJOQ==",
        "documentBase64": "",
        "originalDocumentName": "",
        "productTypeId": this.product_type
      }
      this._EmployeeLoginService.saveOrUpdateDependent(reqst).subscribe((resData: any) => {
        if(resData.statusCode == true){
          this.toastr.success(resData.message, 'Success!');
          this.closeUpdateDependent();
          this.getDependentLists();
        }
        else{
          this.toastr.error(resData.message, 'Oops!');
        }
      },error => {
          this.toastr.error(error.error.message, 'Oops!');
      })
    }
  }
  disableTyping(event: KeyboardEvent) {
    event.preventDefault(); // Prevents typing
  }
  restrictSpecialCharacters(event: Event): void {
    const input = event.target as HTMLInputElement;
    // Regular expression to allow only letters, numbers, and spaces
    input.value = input.value.replace(/[^a-zA-Z0-9 ]/g, '');
  }
  
}
