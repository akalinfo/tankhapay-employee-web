import { Component } from '@angular/core';
import { EmployeeManagementService } from '../employee-management.service';
import { SessionService } from 'src/app/shared/services/session.service';
import decode from 'jwt-decode';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { EmployeeService } from '../../employee/employee.service';
import { Observable, of, switchMap } from 'rxjs';
import { FaceCheckinService } from '../../attendance/face-checkin.service';
import { EncrypterService } from 'src/app/shared/services/encrypter.service';
import { Router } from '@angular/router';
import { dongleState, grooveState } from 'src/app/app.animation';
declare var $:any;

@Component({
  selector: 'app-policies',
  templateUrl: './policies.component.html',
  styleUrls: ['./policies.component.css'],
  animations: [grooveState,dongleState]
})
export class PoliciesComponent {
  showSidebar: boolean=true;
  token: any;
  policyForm : FormGroup;
  policyList: any;
  isAddUpdate: boolean=false;

  constructor(private _employeeMgmtService: EmployeeManagementService,
    private _sessionService : SessionService,
    private _fb: FormBuilder,
    private toastr : ToastrService,
    private _employeeService : EmployeeService,
    private _faceCheckinService : FaceCheckinService,
    private _encrypterService: EncrypterService,
    private router : Router
  ){}

  ngOnInit(){
    let session_obj_d: any = JSON.parse(
      this._sessionService.get_user_session());
      this.token = decode(session_obj_d?.token);
      // this.tp_account_id = this.token.tp_account_id;

      this.policyForm = this._fb.group({
        id: [null],
        policyType : ['',[Validators.required]],
        policyImgName : [''],
        policyImg : ['',[Validators.required]],
        acknowledgement : [''],
        policiesText : [''],
        department : [''],

      })

      this.getPolicyList();
  }

  toggle() {
    this.showSidebar = !this.showSidebar;
  }


  getPolicyList(){
    this._faceCheckinService.getemployeeList({
      "action": "get_policies_mst",
      "customeraccountid": this.token.tp_account_id.toString( ),
      "emp_code": "",
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

  managePolicies():any {
  // Check if the policyImg contains base64 data
  if(!this.policyForm.value.policyType){
    return this.toastr.error("Please enter policy type name");
  }

  if(!this.policyForm.value.policyImg){
    return this.toastr.error("Please select policy image");
  }

  const isBase64 = this.policyForm.value.policyImg?.startsWith('data:');

  let upload$ = of({ file_path: this.policyForm.value.policyImg }); // Default Observable if no upload is needed

  if (isBase64) {
    // If it contains base64, call uploadImage
    upload$ = this.uploadImage();
  }

  upload$
    .pipe(
      switchMap((uploadRes: any) => {
        this.policyForm.patchValue({
          policyImg: uploadRes.file_path, // Use uploaded file path
        });

        // Determine the action (insert or update)
        const action = this.policyForm.value.id ? 'update' : 'insert';

        // Construct post data
        const postData = {
          ...this.policyForm.value,
          acknowledgement:
            this.policyForm.value.acknowledgement === true ||
            this.policyForm.value.acknowledgement === 'Y'
              ? 'Y'
              : 'N',
          action: action,
          customerAccountId: this.token.tp_account_id,
        };

        // Call managePolicy API
        return this._employeeMgmtService.managePolicy(postData);
      })
    )
    .subscribe(
      (resData: any) => {
        if (resData.statusCode) {
          this.toastr.success(resData.message);
          this.getPolicyList();
          this.hideModal();
        } else {
          this.toastr.error(resData.message);
        }
      },
      (error) => {
        console.error('Error in process:', error);
      }
    );
}


  uploadImage():Observable<any>{
   return this._employeeService.file_upload({ 'data': this.policyForm.value.policyImg, 'name': this.policyForm.value.policyImgName })
  }

  onFileChange(event: any) {

      let file = event.target.files[0];
    if(file){
      const maxFileSize = 2 * 1024 * 1024; // 2MB in bytes
      const selectedFile = file; // Get the selected file

      if (selectedFile && selectedFile.size > maxFileSize) {
        // Check if the file size exceeds the limit
        this.toastr.error('File size exceeds the maximum allowed (2MB). Please choose a smaller file.');
        return
      }
      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      reader.onload = () => { 
        this.policyForm.patchValue({
          policyImg: reader.result,
          policyImgName: file.name
        })
        // console.log(file.name);
        
      };

    } else {
      this.toastr.error('Please choose a file.', 'Oops!');
    }

  }


  deletePolicyCtg(policyCtg:any){
    if(!confirm('Are you sure you want to delete this record?')){
      return;
    }
    let postData ={
      id : policyCtg.id,
      customerAccountId: this.token.tp_account_id,
      action :'delete_policy'
    }
    this._employeeMgmtService.managePolicy(postData).subscribe((resData:any)=>{
      if(resData.statusCode){
        this.toastr.success('Policy deleted successfully');
        this.getPolicyList();
      }else{
        this.toastr.error(resData.message);
      }
    })
  }

  hideModal(){
    this.isAddUpdate = false;
    document.querySelector('body').classList.remove('modal-open');
    // $('#final-bill2').modal('hide');
    this.policyForm.reset();
  }

  showUpdateModal(policy:any){
    this.isAddUpdate = true;
    document.querySelector('body').classList.add('modal-open');
    // $('#final-bill2').modal('show');
    if(!policy) return;

    this.policyForm.patchValue({
      id :policy.id,
      policyType : policy.policies_type,
      policyImg : policy.policies_image,
      acknowledgement : policy.acknowledgement_is_required=='Y'? true: false,
      policiesText : policy.policies_text,
    })
    
  }

  logEncryptedId(policyId: number): void {
    this.router.navigate([`/policy/${this._encrypterService.aesEncrypt(policyId.toString())}`])
  }
}
