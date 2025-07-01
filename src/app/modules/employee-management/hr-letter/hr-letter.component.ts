import { Component } from '@angular/core';
import { EmployeeManagementService } from '../employee-management.service';
import { SessionService } from 'src/app/shared/services/session.service';
import decode from 'jwt-decode';
import { EncrypterService } from 'src/app/shared/services/encrypter.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { dongleState, grooveState } from 'src/app/app.animation';
import { Location } from '@angular/common';

@Component({
  selector: 'app-hr-letter',
  templateUrl: './hr-letter.component.html',
  styleUrls: ['./hr-letter.component.css'],
  animations : [grooveState,dongleState]
})
export class HrLetterComponent {
  showSidebar : boolean = true;
  product_type : any;
  tp_account_id:any;
  token :any;
  letterTemplates: any=[];
  letterTemplateForm : FormGroup;
  send_file: string | ArrayBuffer;
  file: any;
  isAddEditCategory : boolean= false;

  constructor(
    private _employeeMgmtService : EmployeeManagementService,
    private _SessionService : SessionService,
    private _e: EncrypterService,
    private _fb : FormBuilder,
    private toastr : ToastrService,
    private _location : Location
  ){}

  ngOnInit(){
    let session_obj_d: any = JSON.parse(this._SessionService.get_user_session());
    this.token = decode(session_obj_d.token);
    this.tp_account_id = this.token.tp_account_id;
    this.product_type = this.token.product_type;

    this.letterTemplateForm = this._fb.group({
      id : [''],
      icon : ['',[Validators.required]],
      icon_name:[''],
      ctgName : ['',[Validators.required]],
      ctgDesc : ['']
    })

    this.getLetterTemplateCategories();
  }

  getLetterTemplateCategories(){
    this._employeeMgmtService.getLetterTemplateCategories({'productTypeId': this._e.aesEncrypt(this.product_type),
      'customerAccountId': this._e.aesEncrypt(this.tp_account_id.toString()),'letterTemplateCategoryId' : ''
    }).subscribe((resData:any)=>{
      if(resData.statusCode){
        this.letterTemplates = JSON.parse(this._e.aesDecrypt(resData.commonData));
      }else{
        this.letterTemplates =[];
        this.toastr.error(resData.message);
      }
    })
  }
  toggle() {
    this.showSidebar = !this.showSidebar;
  }

  onFileChange(event: any) {

    const reader = new FileReader();
   
    if (event.target.files.length > 0) {
      let file = event.target.files[0];
      this.file = file;

      const maxFileSize = 2 * 1024 * 1024; // 2MB in bytes
      const selectedFile = file; // Get the selected file

      if (selectedFile && selectedFile.size > maxFileSize) {
        // Check if the file size exceeds the limit
        this.toastr.error('File size exceeds the maximum allowed (2MB). Please choose a smaller file.');
        return
      }
      reader.readAsDataURL(file);
      reader.onload = () => {
        this.send_file = reader.result;
        this.letterTemplateForm.patchValue({
          icon: this.send_file,
          icon_name: this.file.name
        })
        // this.addNewContactForm.patchValue({
        //   gst_copy_path: this.send_file,
        // });
      };

    } else {
      this.toastr.error('Please choose a file.', 'Oops!');
    }

  }

  saveCategory():any{
    // console.log(this.letterTemplateForm.value);
    let action,ctgImgStatus;
    if(this.letterTemplateForm.value.id){
      action='EditCatagory';
      if(this.letterTemplateForm.value.icon_name){
        ctgImgStatus = 'new'
      }else{
        ctgImgStatus ='same'
      }
    }else{
      ctgImgStatus ='new';
      action ='AddCatagory';
    }
    
    if(action=='AddCatagory'){
      if(this.letterTemplateForm.invalid){
        return this.toastr.error("Please fill the required fields");
      }
    }
    let postData ={
      'productTypeId': this._e.aesEncrypt(this.product_type),
      'customerAccountId': this._e.aesEncrypt(this.tp_account_id.toString()),
      ...this.letterTemplateForm.value,
      action : action,
      ctgImgStatus : ctgImgStatus
    }
    this._employeeMgmtService.addEditLetterCateogory(postData).subscribe((resData:any)=>{
      if(resData.statusCode){
        this.toastr.success(resData.message);
        this.letterTemplateForm.reset();
        this.getLetterTemplateCategories();
        this.closeCategoryModal();
      }else{
        this.toastr.error(resData.message);
      }
    })
  }
  
  showAddEditCtgModal(letter :any=''){
    this.isAddEditCategory= true;
    if(letter){
      this.letterTemplateForm.patchValue({
        id: letter.template_id,
        icon : letter.template_icon,
        ctgName : letter.templatetype,
        ctgDesc : letter.template_desc
      })
    }
  }

  closeCategoryModal(){
    this.isAddEditCategory= false;
    this.letterTemplateForm.reset();
  }

  deleteCategory(ctg:any){
    console.log(ctg)
    if(!confirm('Are you sure you want to delete this category?')){
      return;
    }
    let postData= {
      id : ctg.template_id,
      productType : this._e.aesEncrypt(this.product_type),
      'customerAccountId': this._e.aesEncrypt(this.tp_account_id.toString()),
    }
    this._employeeMgmtService.deleteLetterCtg(postData).subscribe((resData:any)=>{
      if(resData.statusCode){
        this.toastr.success(resData.message);
        this.getLetterTemplateCategories();
      }else{
        this.toastr.error(resData.message);
      }
    })
  }

  goBack(){
    this._location.back();
  }
}
