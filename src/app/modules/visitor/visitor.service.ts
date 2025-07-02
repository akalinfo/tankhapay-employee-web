import { Injectable } from '@angular/core';
import { CallApiService } from 'src/app/shared/services/call-api.service';
import { EncrypterService } from 'src/app/shared/services/encrypter.service';
import * as constants from '../../shared/helpers/constants';

@Injectable({
  providedIn: 'root'
})
export class VisitorService {

  constructor(private _EncrypterService: EncrypterService,
    private _CallApiService: CallApiService) {
     }
     private saveVisitor_url: string = constants.saveVisitor_url;
     private visiting_card_list_url:string = constants.visiting_card_list_url;
    private visitor_list_url:string = constants.visitor_list_url;
     private update_blacklist_visitor_url:string = constants.update_blacklist_visitor_url;
    private Update_visitor_url:string = constants.Update_visitor_url;
    private check_in_out_visitor_url:string = constants.check_in_out_visitor_url;
    private send_visitor_otp_url:string = constants.send_visitor_otp_url;
    private verify_visitor_otp_url:string = constants.verify_visitor_otp_url;

    Update_visitor(userData:any){
      return this._CallApiService.post_enc(userData, this.Update_visitor_url);
    }
     update_blacklist_visitor(userData:any){
      return this._CallApiService.post_enc(userData, this.update_blacklist_visitor_url);
     }
    visitor_list(userData:any){
      return this._CallApiService.post_enc(userData, this.visitor_list_url);
    }
     visiting_card_list(userData:any){
      return this._CallApiService.post_enc(userData, this.visiting_card_list_url);
     }
     
     saveVisitor(userData: any) {
      return this._CallApiService.post_enc(userData, this.saveVisitor_url);
    }
    private save_visitor_card_url:string = constants.save_visitor_card_url;

    save_visitor_card(userData:any){
      return this._CallApiService.post_enc(userData, this.save_visitor_card_url);
    }
    check_in_out_visitor(userData:any){
      return this._CallApiService.post_enc(userData, this.check_in_out_visitor_url);
    }
    send_visitor_otp(userData:any){
      return this._CallApiService.post_enc(userData, this.send_visitor_otp_url);
    }
    verify_visitor_otp(userData:any){
      return this._CallApiService.post_enc(userData, this.verify_visitor_otp_url);
    }
    
}
