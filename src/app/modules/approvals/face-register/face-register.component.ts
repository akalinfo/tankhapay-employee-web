import { Component } from '@angular/core';
import { ApprovalsService } from '../approvals.service';
import { ToastrService } from 'ngx-toastr';
import { SessionService } from 'src/app/shared/services/session.service';
import { EncrypterService } from 'src/app/shared/services/encrypter.service';
import jwtDecode from 'jwt-decode';

@Component({
  selector: 'app-face-register',
  templateUrl: './face-register.component.html',
  styleUrls: ['./face-register.component.css']
})
export class FaceRegisterComponent {
  showSidebar: boolean = true;
  decoded_token:any = '';
  tp_account_id:any = '';
  submittedBy:any = '';
  faceData:any = '';
  product_type : any = '';
  confirmationModal:boolean=false;
  approveStatus:any = '';
  p: number;
  limit: any = 50;
  employee_data :any ='';
  emp_json_data : any = '';
  filteredEmployees :any = '';
  view_reg_image_path: any;
  employerNo:any = '';
  upateData : any ='';
  updateStatus : any = '';
  search_keyword: any = '';

  constructor(
      private _approvalsService: ApprovalsService,
      private toastr: ToastrService,
      private _sessionService: SessionService,
      private _encrypterService: EncrypterService
    ) { }

   ngOnInit() {
      let session_obj = this._sessionService.get_user_session();
      let token = JSON.parse(session_obj).token;
      this.decoded_token = jwtDecode(token);
      this.tp_account_id = this.decoded_token.tp_account_id;
      this.product_type = this.decoded_token.product_type;
      this.employerNo = this.decoded_token.mobile;
      this.employer_details();
   }
   get_page(event: any) {
    this.p = event;
  }
   closeConfirmModal(){
    this.confirmationModal = false;
   }
   approveOrRejectStatus(){
    this._approvalsService.approveRejectFaceRegister({
      "faceId" : this.upateData.id,
    "customerAccountId" : this.upateData.customeraccountid,
    "approvalStatus" : this.approveStatus,
    "empCode" : this.upateData.emp_code,
    "remark" : "",
    "modifyBy" :this.upateData.customeraccountid
    }).subscribe((resData: any) => {
      if(resData.statusCode == true){
        this.toastr.success(resData.message);
        this.employer_details();
      }
      else{
        this.toastr.error(resData.message);
      }
      this.closeConfirmModal();
    },error => {
      this.toastr.error(error.error.message);
    })

   }
   search(){
     if (!this.search_keyword) {
       this.filteredEmployees = this.emp_json_data.filter(emp =>
         emp.face_image && emp.face_image.trim() !== ''
       );
     } else {
       let search_term = this.search_keyword.toLowerCase();

       this.filteredEmployees = this.emp_json_data.filter(emp =>
        emp.face_image && emp.face_image.trim() !== '' &&
        (
          emp.emp_name.toLowerCase().includes(search_term.toLowerCase()) ||
          emp.emp_code.toString().toLowerCase().includes(search_term.toLowerCase()) ||
          emp.orgempcode.toString().toLowerCase().includes(search_term.toLowerCase()) ||
          emp.cjcode.toString().toLowerCase().includes(search_term.toLowerCase())
        )
      );

     }



   }
   toggle() {
    this.showSidebar = !this.showSidebar;
  }

  employer_details() {
    this._approvalsService.getFaceEmployeeList({
        mobileNo:this.employerNo,
        customerAccountId: this._encrypterService.aesEncrypt(this.tp_account_id.toString()),
        productTypeId: this._encrypterService.aesEncrypt(this.product_type.toString())
      }).subscribe((resData: any) => {
        if (resData.statusCode == true) {
          this.employee_data = JSON.parse(this._encrypterService.aesDecrypt(resData.commonData));
          this.emp_json_data = (this.employee_data);

          this.filteredEmployees = this.emp_json_data.filter(emp =>
            emp.face_image && emp.face_image.trim() !== ''
          );

          //this.filteredEmployees = this.emp_json_data;
        }
        else{
          this.toastr.error(resData.message);
        }
      },error=>{
        this.toastr.error(error.error.message);
      });
  }


  getRegisteredImage(checkin_image: any) {
    if (checkin_image != '' && checkin_image != null) {
      this.view_reg_image_path = checkin_image;
    }
    else {
      this.view_reg_image_path = '';
    }
  }

  approveOrRejectFace(data,status){

    this.confirmationModal = true;
    this.approveStatus = status;
    this.upateData = data;

  }

}
