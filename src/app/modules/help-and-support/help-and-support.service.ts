import { Injectable } from '@angular/core';
import { CallApiService } from 'src/app/shared/services/call-api.service';
import { EncrypterService } from 'src/app/shared/services/encrypter.service';
import * as constants from '../../shared/helpers/constants';

@Injectable({
  providedIn: 'root'
})
export class HelpAndSupportService {

  constructor(
    private _EncrypterService: EncrypterService,
    private _CallApiService: CallApiService) { }

  private getAllQueriesTickets_url: string = constants.getAllQueriesTickets_url;
  private GetTickets_url: string = constants.GetTickets_url;
  private UpdateTicketstatus_url: string = constants.UpdateTicketstatus_url;
  private CreateTicketTrail_url: string = constants.CreateTicketTrail_url;
  private getTpAlerts_url: string = constants.getTpAlerts_url;
  private get_branding_detail_url_url: string = constants.get_branding_detail_url;
  private GetTicketTrail_url: string = constants.GetTicketTrail_url;
  private getTpAlertsByDateFilter_url: string = constants.getTpAlertsByDateFilter_url;
  private insertActivityLogs_url: string = constants.insertActivityLogs_url;
  
  GetTickets(Data: any) {
    return this._CallApiService.post_enc(Data, this.GetTickets_url);
  }

  getAllQueriesTickets(Data: any) {
    return this._CallApiService.post_enc(Data, this.getAllQueriesTickets_url);
  }
  GetTicketTrail(Data: any) {
    return this._CallApiService.post_enc(Data, this.GetTicketTrail_url);
  }

  CreateTicketTrail(Data: any) {
    return this._CallApiService.post_enc(Data, this.CreateTicketTrail_url);
  }

  UpdateTicketstatus(Data: any) {
    return this._CallApiService.post_enc(Data, this.UpdateTicketstatus_url);
  }

  getTpAlerts(Data: any) {
    return this._CallApiService.post_enc(Data, this.getTpAlerts_url);
  }

  get_branding_details(Data: any) {
    return this._CallApiService.post_enc(Data, this.get_branding_detail_url_url);
  }

  getTpAlertsByDateFilter(Data: any) {
    return this._CallApiService.post_enc(Data, this.getTpAlertsByDateFilter_url);
  }

  insertActivityLogs(Data: any){
    return this._CallApiService.post_enc(Data, this.insertActivityLogs_url);
  }

}
