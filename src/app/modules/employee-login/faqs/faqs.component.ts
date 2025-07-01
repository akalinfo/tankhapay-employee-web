import { Component,Input } from '@angular/core';
import {EmployeeLoginService} from '../employee-login.service';
import { EncrypterService } from 'src/app/shared/services/encrypter.service';
import { ToastrService } from 'ngx-toastr';
import { SessionService } from 'src/app/shared/services/session.service';
import jwtDecode from 'jwt-decode';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-faqs',
  templateUrl: './faqs.component.html',
  styleUrls: ['./faqs.component.css']
})
export class FaqsComponent {
 @Input() empDataFromParent: any;
  emp_code :any;
  employeeTrainingRecords :any=[];
  decoded_token: any;
  tp_account_id:any;
  product_type:any;
  faqList: any=[];

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
      this.emp_code= this.empDataFromParent.emp_code;
      this.get_faq_category('TP-GEN-FAQ');
    
    }

    get_faq_category(action: any){
      this._employeeLoginService.get_faq_category({"category_cd":action}).subscribe((resData:any)=>{
        if(resData.statusCode){
          let data = JSON.parse(this._encrypterService.aesDecrypt(resData.commonData))
          console.log(data);
          
          this.faqList = data.data;
        }else{
          this.faqList=[];
        }
      })
    }

    getSanitizedHtml(content: string): SafeHtml {
      return this.sanitizer.bypassSecurityTrustHtml(content);
    }

    toggleAccordion(index: number) {
      this.faqList.forEach((faq, i) => {
        faq.isOpen = i === index ? !faq.isOpen : false; // Close others, toggle the clicked one
      });
    }
}
