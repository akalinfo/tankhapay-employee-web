import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EncrypterService } from 'src/app/shared/services/encrypter.service';
import { SessionService } from 'src/app/shared/services/session.service';
import { FaceCheckinService } from '../../attendance/face-checkin.service';
import decode from 'jwt-decode';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReportService } from '../../reports/report.service';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import insertTextAtCursor  from 'insert-text-at-cursor';
import { ShiftSpecificService } from '../../attendance/shift-specific-service';
import { EmployeeManagementService } from '../employee-management.service';
import { EmployeeService } from '../../employee/employee.service';
import { ToastrService } from 'ngx-toastr';
import { dongleState, grooveState } from 'src/app/app.animation';
import { TFHUB_SEARCH_PARAM } from '@tensorflow/tfjs-converter/dist/executor/graph_model';
declare var $:any;

@Component({
  selector: 'app-policy-listing',
  templateUrl: './policy-listing.component.html',
  styleUrls: ['./policy-listing.component.css'],
  animations : [grooveState, dongleState]
})
export class PolicyListingComponent {
  showSidebar: any=true;
  policyType='';
  updatePolicyId:any='';
  policyid:any;
  token: any;
  policyList: any=[];
  policyForm:FormGroup;
  dropdownList:any=[];
  dropdownSettings ={};
  selectedval :any=[];
  editorConfig: AngularEditorConfig = {
    editable: true,
    spellcheck: true,
    height: '15rem',
    minHeight: '5rem',
    placeholder: 'Enter text here...',
    translate: 'no',
    defaultParagraphSeparator: 'p',
    defaultFontName: 'Arial',
    toolbarHiddenButtons: [
      ['bold']
      ],
    customClasses: [
      {
        name: "quote",
        class: "quote",
      },
      {
        name: 'redText',
        class: 'redText'
      },
      {
        name: "titleText",
        class: "titleText",
        tag: "h1",
      },
    ]
  };
  currentCursorField: any;
  empList: any=[];
  page: number= 1;
  isAddPolicy: boolean =false;
  isEmpList : boolean = false;

  constructor(
    private route : ActivatedRoute,
    private _encrypterService : EncrypterService,
    private _sessionService : SessionService,
    private _faceCheckinService : FaceCheckinService,
    private _fb : FormBuilder,
    private _ReportService : ReportService,
    private shiftSettingService: ShiftSpecificService,
    private _employeeMgmtService : EmployeeManagementService,
    private _employeeService : EmployeeService,
    private toastr: ToastrService
  ){


    this.route.params.subscribe(param=>{
      let id = param['id'];
      if(id){
        let decrypted = this._encrypterService.aesDecrypt(id);
        this.policyid= decrypted.split(',')[0];
        this.policyType = decrypted.split(',')[1];
      }
    })
  }

  ngOnInit(){
    let session_obj_d: any = JSON.parse(
      this._sessionService.get_user_session());
      this.token = decode(session_obj_d?.token);

      this.policyForm = this._fb.group({
        policy_text : [''],
        file_name : [''],
        file : [''],
        applicable_for_type : ['emp_code',[Validators.required]],
        policyNo : ['',[Validators.required]],
        policyType : [''],
        policyCreateDt :['',[Validators.required]],
        id:[null],
        acknowledgement : ['']
      })

      this.getPolicyListByid();
      // this.getUserList();
  }
  toggle() {
    this.showSidebar = !this.showSidebar;
  }

  getPolicyListByid(){
    this._faceCheckinService.getemployeeList({
      "action": "get_policies_trn",
      "customeraccountid": this.token.tp_account_id.toString( ),
      "emp_code": this.policyid,
      "organization_unitid": "",
      "keyword": "",
      "fromdate": "",
      "todate": ""
    }).subscribe((resData:any)=>{
      if(resData.statusCode){
        this.policyList = JSON.parse(this._encrypterService.aesDecrypt(resData.commonData));
      }else{
        this.policyList= [];
      }
    })
  }

  get_att_dept_master_list(){
    this._ReportService.GetMaster_Dropdown({
      "actionType": "GetPostingDepartments",
      "productTypeId": this.token.product_type,
      "customerAccountId": this.token.tp_account_id.toString(),
    }).subscribe((resData: any) => {
      // console.log(resData);
      if (resData.statusCode) {
        this.dropdownList = resData.commonData;
        this.dropdownSettings = {
          singleSelection: false,
          idField: 'posting_department',
          textField: 'posting_department',
          selectAllText: 'Select All',
          unSelectAllText: 'UnSelect All',
          allowSearchFilter: true,
          // allowRemoteDataSearch: true,
          // searchFilter: (term: string, item: any)=> this.customSearchFilter(term, item)
      };
      //   if (!this.deptList.some(department => department.posting_department === this.selectedDepartmentId)) {
      //     this.selectedDepartmentId = 'All';  // Reset if the previously selected department no longer exists
      // }
      } else {
        this.dropdownList = [];
        // console.log(resData.message);
      }
    });
  }

  async getUserList(data:any='',action:any=''){
    let obj=
    {
     customeraccountid:this.token.tp_account_id.toString(),
     productTypeId:this.token.product_type,
     GeoFenceId:this.token.geo_location_id
  }
     await this.shiftSettingService.getUserList(obj
      ).subscribe((res:any)=>{
      this.dropdownList=[];
      let userList=res.commonData

      userList.map((item)=>{
        item.emp_name = item.emp_name + `  (${item.orgempcode!=''? item.orgempcode : (item.tpcode ? item.tpcode : item.emp_code)})`
        if(item.joiningstatus.trim() == 'Active' && item.dateofrelieveing ==''){
          this.dropdownList.push(item)
        }
      })
      this.dropdownSettings = {
        singleSelection: false,
        idField: 'emp_code',
        textField: 'emp_name',
        selectAllText: 'Select All',
        unSelectAllText: 'UnSelect All',
        allowSearchFilter: true,
        itemsShowLimit: 3,
        // allowRemoteDataSearch: true,
        // searchFilter: (term: string, item: any)=> this.customSearchFilter(term, item)
      };

      if(data){
        const empCodesArray = data.split(',').map(code => code.trim());
        const validEmpData = empCodesArray
          .map(code => {
            const match = this.dropdownList.find(emp => emp.emp_code === code);
            return match ? { emp_code: match.emp_code, emp_name: match.emp_name } : null;
          })
          .filter(emp => emp !== null); // Filter out invalid code
        if (validEmpData.length > 0) {
          // this.policyForm.patchValue({
          //   policyNo: validEmpData // Set transformed data back to the form
          // });
          if(action=='show'){
            this.empList = validEmpData;
          }else
            this.selectedval = validEmpData
        }

      }

    })
  }

  setActiveEditor(editor: any) {
    this.currentCursorField = editor;
  }

  onItemSelect(item:any){

    // this.orgGroup = this.selectedval.map(val=> val.org_unit_id);
  }

  onSelectAll(item:any){
    // this.orgGroup = item.map(val=> val.org_unit_id);

  }
  onUnselectAll(item:any){
    // this.orgGroup = item.map(val=> val.org_unit_id);
  }
  onItemUnselect(item:any){
    // this.orgGroup = this.selectedval.map(val=> val.org_unit_id);
  }

  getPolicyOnData(policyon:string){
    this.selectedval =[];
    console.log(policyon);

    if(policyon=='emp_code'){
      this.getUserList();
    }else{
      this.get_att_dept_master_list();
    }
  }

  onFileSelect(event: any) {

    if (event.target.files.length > 0) {
      let file = event.target.files[0];

      const maxFileSize = 2 * 1024 * 1024; // 2MB in bytes
      const selectedFile = file; // Get the selected file

      if (selectedFile && selectedFile.size > maxFileSize) {
        // Check if the file size exceeds the limit
        this.toastr.error('File size exceeds the maximum allowed (2MB). Please choose a smaller file.');
        return
      }

      if (file.name.split('.')[1] !== 'pdf') {
         this.toastr.error('Only pdf files are allowed', 'Oops!');
        return
      }

      const reader = new FileReader();
      reader.readAsDataURL(file);
      // console.log(reader.onload);

      // console.log(file.name);

      reader.onload = () => {
          this.policyForm.patchValue({
            file_name: file.name,
            file : reader.result
          })
      };

    } else {
      this.toastr.error('Please choose a file.', 'Oops!');
    }

  }



  savePolicy():any{
    let policyForm = this.policyForm.value;
    if(!policyForm.applicable_for_type){
      return this.toastr.error('Please select Policy by');
    }
    if(!policyForm.policyNo){
      return this.toastr.error(`Please select ${policyForm.applicable_for_type=='emp_code' ? 'user' : 'department' }`);
    }
    if(!policyForm.policyCreateDt){
      return this.toastr.error('Please select policy created date');
    }

    if(!policyForm.file){
      return this.toastr.error('Please select a file');
    }
    let urlREgex = /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/[^\s]*)?$/;
    // console.log(this.policyForm.value); return

    if(this.policyForm.value.file && !urlREgex.test(this.policyForm.value.file)){
      this._employeeService.file_upload({'data': this.policyForm.value.file, 'name': this.policyForm.value.file_name}).subscribe((resData:any)=>{
        if(resData.status){
          this.policyForm.patchValue({
            file: resData.file_path,
            file_name : resData.file_name
          })
          this.callManagePolicy();
        }
      })
    }else{
      this.callManagePolicy();
    }


  }

  hideModal(){
    // $('#add-policy').modal('hide');
    this.isAddPolicy = false;
    document.querySelector('body').classList.remove('modal-open');
    this.policyForm.reset();
    $('#policy-file').val('');
    this.policyForm.patchValue({
      applicable_for_type : 'emp_code',
    })
  }

  callManagePolicy(){
    let policyData = this.policyForm.value.applicable_for_type === 'emp_code'
    ? this.selectedval.map(val => val.emp_code).join(',')
    : this.selectedval.map(val => val.posting_department).join(',');

    let action = this.policyForm.value.id ? 'trn_update' : 'trn_insert';


    let postData = {
      "action": action,
      "customerAccountId": this.token.tp_account_id.toString(),
      "id": (action == 'trn_update')?this.updatePolicyId:this.policyid,
      "policiesText": this.policyForm.value.policy_text,
      "policyType": this.policyForm.value.policyType,
      "file_name": this.policyForm.value.file_name,
      "policyFile": this.policyForm.value.file,
      "acknowledgement":
            this.policyForm.value.acknowledgement === true ||
            this.policyForm.value.acknowledgement === 'Y'
              ? 'Y'
              : 'N',
      "policyCreateDt": this.policyForm.value.policyCreateDt.split('-').reverse().join('-'),
      "applicable_for_type": this.policyForm.value.applicable_for_type,
      "applicable_type_value":policyData

    }

    this._employeeMgmtService.managePolicy(postData).subscribe((resData:any)=>{
      if(resData.statusCode){
        this.getPolicyListByid();
        this.hideModal();
        this.toastr.success(resData.message);
      }else{
        this.toastr.error(resData.message);
      }
    })
  }

  openAddPolicyModal(action:any,policyData:any){
    this.updatePolicyId =  policyData.id;
    this.isAddPolicy = true;
    document.querySelector('body').classList.add('modal-open');
    // $('#add-policy').modal('show');
    this.policyForm.patchValue({
      applicable_for_type : policyData.applicable_for_type,
      // policyNo : policyData.applicable_type_value,
      policyCreateDt: policyData.policies_create_date?.substring(0,10),
      policyType : this.policyType,
      policy_text : policyData.policies_text,
      file: policyData.policies_file,
      acknowledgement : policyData.acknowledgement_is_required=='Y'? true: false,
      id : policyData.id
    })

    if(policyData.applicable_for_type=='emp_code'){
      this.getUserList(policyData.applicable_type_value);
    }else{
      this.get_att_dept_master_list();
    }
  }

  openAddPolicy(){
    this.isAddPolicy = true;
    document.querySelector('body').classList.add('modal-open');
    this.policyForm.patchValue({
    policyType : this.policyType,
  })
    if(this.policyForm.value.applicable_for_type=='emp_code'){
      this.getUserList();
    }
  }

  generatePDF(template:any) {
    const encryptedParams = encodeURIComponent(this._encrypterService.aesEncrypt('policy,'+'' + ',' + template.id));
    const url = `${window.location.origin}/employee-mgmt/preview-pdf/${encryptedParams}`;
    window.open(url, '_blank');
  }

  showEmployees(policyData:any){
    this.getUserList(policyData.applicable_type_value,'show');
    this.isEmpList = true;
    document.querySelector('body').classList.add('modal-open');

  }

  hideEmpListModal(){
    this.isEmpList = false;
    document.querySelector('body').classList.remove('modal-open');
    this.page=1;
    this.empList =[];
  }
}
