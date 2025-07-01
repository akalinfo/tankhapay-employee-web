//import { Component } from '@angular/core';
import { Component, Input } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { environment } from 'src/environments/environment';
import * as CryptoJS from 'crypto-js';
import { SessionService } from 'src/app/shared/services/session.service';
import jwtDecode from 'jwt-decode';
@Component({
  selector: 'app-feedback',
  templateUrl: './feedback.component.html',
  styleUrls: ['./feedback.component.css']
})
export class FeedbackComponent {
  websiteUrl: any;
  @Input() empDataFromParent: any;

  constructor(private sanitizer: DomSanitizer,
    private _sessionService : SessionService
  ) {
    
  }

  ngOnInit(){
 let session_obj: any = JSON.parse(this._sessionService.get_user_session());
    let decoded_token :any= jwtDecode(session_obj.token);
    let tp_account_id = decoded_token.tp_account_id;
    console.log(this.empDataFromParent,tp_account_id);
    let employeeMobile = this.empDataFromParent.mobile;
    let hashedAccountId = CryptoJS.MD5(tp_account_id.toString()).toString();
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Months start at 0
    const year = today.getFullYear();
    const currentDate = `${day}${month}${year}`;
    
    const dataToHash = `${employeeMobile}#${currentDate}`;
    const hash = CryptoJS.MD5(dataToHash).toString();
    const feedbackts = CryptoJS.MD5('feedback');
        console.log('harsh',"feedbackts",feedbackts);
        console.log('harsh',"hashedAccountId",hashedAccountId);
        console.log('harsh',"hash",hash);
    this.websiteUrl = this.sanitizer.bypassSecurityTrustResourceUrl(`${environment.PMS_TND_ATL_URL}/employee-sso/${hashedAccountId}/${hash}/${feedbackts}`);
    console.log('harsh',this.websiteUrl);
    
    // window.open(this.websiteUrl,'_blank',);
    // window.history.back();
  }
}

