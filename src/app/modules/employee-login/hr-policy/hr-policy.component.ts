import { Component, Input } from '@angular/core';
import {EmployeeLoginService} from '../employee-login.service';
import { EncrypterService } from 'src/app/shared/services/encrypter.service';
import { ToastrService } from 'ngx-toastr';
import { SessionService } from 'src/app/shared/services/session.service';
import jwtDecode from 'jwt-decode';

@Component({
  selector: 'app-hr-policy',
  templateUrl: './hr-policy.component.html',
  styleUrls: ['./hr-policy.component.css']
})
export class HrPolicyComponent {

  showSidebar: boolean = true;
  @Input() empDataFromParent;
    decoded_token: any;
    tp_account_id:any;
    product_type:any;
    policies :any=[]
   constructor(
      private _employeeLoginService : EmployeeLoginService,
      private _encrypterService : EncrypterService,
      private toastr : ToastrService,
      private _sessionService : SessionService,
    ){}
  
    ngOnInit(){
        let session_obj: any = JSON.parse(this._sessionService.get_user_session());
      this.decoded_token = jwtDecode(session_obj.token);
      this.tp_account_id = this.decoded_token.tp_account_id;
      this.product_type = localStorage.getItem('product_type');
      this.hrPolicyList('TP-TERMS-OF-USE');
    
    }
  
    toggle() {
      this.showSidebar = !this.showSidebar;
    }
  
    hrPolicyList(action: any){
      this._employeeLoginService.hrPolicyList({
        "customerAccountId":this.tp_account_id.toString(),
        "empCode": this.empDataFromParent.emp_code,
        "productTypeId": this.product_type,
        "keyId": ""
    }).subscribe((resData:any)=>{
        if(resData.statusCode){
          let data = JSON.parse(this._encrypterService.aesDecrypt(resData.commonData))
        console.log(data);
          this.policies = data;
          // this.termofuse = data.data[0].answer;
      
        }else{
          this.policies=[];
        }
      })
    }

}
