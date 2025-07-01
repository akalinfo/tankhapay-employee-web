import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { EmployeeService } from '../../employee/employee.service';
import { ToastrService } from 'ngx-toastr';
import { EmployeeManagementService } from '../employee-management.service';
import { SessionService } from 'src/app/shared/services/session.service';
import decode from 'jwt-decode';
import { FaceCheckinService } from '../../attendance/face-checkin.service';
import { EncrypterService } from 'src/app/shared/services/encrypter.service';
declare var $:any;

@Component({
  selector: 'app-letterhead',
  templateUrl: './letterhead.component.html',
  styleUrls: ['./letterhead.component.css']
})
export class LetterheadComponent {
  showSidebar: any=true;
  brandingForm : FormGroup;
  token: any;
  tp_account_id: any;
  product_type: any;
  validationMessage: string='';
  validationMessageFoot :string ='';

  constructor(private _fb : FormBuilder,
    private _employeeService : EmployeeService,
    private _employeeMgmtService : EmployeeManagementService,
    private _SessionService : SessionService,
    private toastr: ToastrService,
    private _faceCheckinservice : FaceCheckinService,
    private _encrypterService : EncrypterService
  ){}

  ngOnInit(){
    let session_obj_d: any = JSON.parse(this._SessionService.get_user_session());
    this.token = decode(session_obj_d.token);
    this.tp_account_id = this.token.tp_account_id;
    this.product_type = this.token.product_type;
    this.brandingForm = this._fb.group({
      letterheadid:[null],
      headerImage: [
        null,
        [Validators.required
        ],
         // Header with max height of 300
      ],
      headerImgName : [''],
      footerImage: [
        null,
        [Validators.required,
          
        ],
         // Footer with max height of 200
      ],
      footerImgName : [''],
      signature : [null],
      signatureImgName : ['']
    })

    this.getLetterHead();
  }

  get bf(){
    return this.brandingForm.value;
  }
  toggle() {
    this.showSidebar = !this.showSidebar;
  }

  

  onFileChange(event: any, controlName: string,controlfileName : string, 
    minWidth: number, maxWidth: number, minHeight: number, maxHeight: number
  ) {
    const file = event.target.files[0];

    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (e:any) => {    
        const img = new Image();
        img.src = e.target.result; 
        img.onload = () => {
          if (img.width >= minWidth && img.width<=maxWidth && img.height >= minHeight && img.height <= maxHeight) {
            controlName=='headerImage' ? this.validationMessage = '' : this.validationMessageFoot ='';
          } else {
            controlName=='headerImage' ? this.validationMessage = `Invalid image dimensions.` : this.validationMessageFoot ='Invalid image dimensions.';
          } 
        };

        img.onerror = () => controlName=='headerImage' ? this.validationMessage = 'Invalid image URL or unable to load image.' : this.validationMessageFoot = 'Invalid image URL or unable to load image.'
        this.brandingForm.patchValue({
          [controlName]: reader.result,
           [controlfileName] : file.name
        });
      };
    
      this.brandingForm.get(controlName)?.updateValueAndValidity();
    } 
  }

  uploadImage(controlname : string, controlFileName:string){
    this._employeeService.file_upload({ 'data': this.bf[controlname], 'name': this.bf[controlFileName] }).subscribe((resData:any)=>{
      if(resData.status){
        this.toastr.success(resData.msg);
        this.brandingForm.patchValue({
          [controlname] : resData.file_path
        })
        console.log(this.brandingForm.invalid);
        
      }else{
        this.toastr.error(resData.msg, 'Oops!');
      }
    })
  }

  removeImage(controlname : string, controlFileName:string){
    this.brandingForm.patchValue({
      [controlname]: null,
      [controlFileName] : ''
    })
    $('#'+controlname).val('');
  }

  saveTemplateImg():any{
    let action='';

    if(!this.isURL(this.bf.headerImage)){
      return this.toastr.error('Please upload header image before submit.')
    }

    if( !this.isURL(this.bf.footerImage)){
      return this.toastr.error('Please upload footer image before submit.')
    }
    if(this.bf.letterheadid){
      action='update';
    }else{
      action='insert';
    }
    this._employeeMgmtService.insertLetterHead({
      action:action,
      header : this.bf.headerImage,
      footer : this.bf.footerImage,
      signature : this.bf.signature,
      customerAccountId : this.tp_account_id,
      letterheadid : this.bf.letterheadid
    }).subscribe((resData:any)=>{
      if(resData.statusCode){
        this.toastr.success(resData.message);
      }else{
        this.toastr.error(resData.error);
      }
    })
  }

  getLetterHead(){
    this._faceCheckinservice.getemployeeList({"action": "header_footer_list",
      "customeraccountid": this.tp_account_id,
      "emp_code": "",
      "organization_unitid": "",
      "keyword": "",
      "fromdate": "",
      "todate": ""}).subscribe((resData:any)=>{
        if(resData.statusCode){
          let master_data = JSON.parse(this._encrypterService.aesDecrypt(resData.commonData))[0];
          this.brandingForm.patchValue({
            headerImage : master_data.header,
            footerImage : master_data.footer,
            signature : master_data.signature,
            letterheadid: master_data.id
          })
          
        }
      })
  }

  isURL(value: string): boolean {
    // Check for URL pattern
    const urlPattern = /^(https?:\/\/)[^\s$.?#].[^\s]*$/;
    return urlPattern.test(value);
  }
}
