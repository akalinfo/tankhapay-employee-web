import { Component } from '@angular/core';
import {EmployeeLoginService} from '../employee-login.service';
import { EncrypterService } from 'src/app/shared/services/encrypter.service';
import { ToastrService } from 'ngx-toastr';
import { SessionService } from 'src/app/shared/services/session.service';
import jwtDecode from 'jwt-decode';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-privacy-policy',
  templateUrl: './privacy-policy.component.html',
  styleUrls: ['./privacy-policy.component.css']
})
export class PrivacyPolicyComponent {

  showSidebar: boolean = true;
    decoded_token: any;
    tp_account_id:any;
    product_type:any;
    termofuse :any=[]
   constructor(
      private _employeeLoginService : EmployeeLoginService,
      private _encrypterService : EncrypterService,
      private toastr : ToastrService,
      private _sessionService : SessionService,
      private sanitizer: DomSanitizer
    ){}
  
    ngOnInit(){
        let session_obj: any = JSON.parse(this._sessionService.get_user_session());
      this.decoded_token = jwtDecode(session_obj.token);
      this.tp_account_id = this.decoded_token.tp_account_id;
      this.product_type = localStorage.getItem('product_type');
      this.get_faq_category('TP-PRIVACY-POLICY');
    
    }
  
    toggle() {
      this.showSidebar = !this.showSidebar;
    }
  
    get_faq_category(action: any){
      this._employeeLoginService.get_faq_category({"category_cd":action}).subscribe((resData:any)=>{
        if(resData.statusCode){
          let data = JSON.parse(this._encrypterService.aesDecrypt(resData.commonData))
        
          this.termofuse = data.data[0].answer;
      
        }else{
          this.termofuse=[];
        }
      })
    }
  
    getSanitizedHtml(content: string): SafeHtml {
      return this.sanitizer.bypassSecurityTrustHtml(content);
    }
}
