import { Component } from '@angular/core';
import { BusinesSettingsService } from '../business-settings.service';
import { ToastrService } from 'ngx-toastr';
import { SessionService } from 'src/app/shared/services/session.service';
import jwtDecode from 'jwt-decode';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-manage-card',
  templateUrl: './manage-card.component.html',
  styleUrls: ['./manage-card.component.css']
})
export class ManageCardComponent {

  showSidebar: boolean = true;
  decoded_token: any;
  tp_account_id: any;
  JusPaymanageCard_Data: any = [];
  linkUrl: any;

  constructor(
    private _businessSettingsService:BusinesSettingsService,
    private toastr: ToastrService,
    private _sessionService: SessionService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    let session_obj = this._sessionService.get_user_session();
    let token = JSON.parse(session_obj).token;
    this.decoded_token = jwtDecode(token);
    this.tp_account_id = this.decoded_token.tp_account_id;

    // console.log(this.decoded_token);
    this.JusPaymanageCard();

  }

  toggle() {
    this.showSidebar = !this.showSidebar;
  }

  JusPaymanageCard() {
    this._businessSettingsService.JusPaymanageCard({
      customer_id: this.tp_account_id,
      customer_phone: this.decoded_token.mobile,
      customer_email: this.decoded_token.userid,
    }).subscribe({
      next: (resData:any) => {
        if (resData.statusCode==false) {
          this.toastr.error(resData.message, 'Oops!');
          this.JusPaymanageCard_Data = [];

        } else {
          this.JusPaymanageCard_Data = resData;
          this.linkUrl = this.sanitizer.bypassSecurityTrustResourceUrl(resData.payment_links.web);
          console.log(resData);
        }
      }, error : (e) => {
        console.log(e);
        this.JusPaymanageCard_Data = [];
      }
    })
  }

}
