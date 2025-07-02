import { Injectable } from '@angular/core';
import { CallApiService } from 'src/app/shared/services/call-api.service';
import * as constants from '../../shared/helpers/constants';

@Injectable({
  providedIn: 'root'
})
export class AccountsService {

  constructor(private _CallApiService : CallApiService) { }

  private getLatestTransaction_Url : string = constants.getLatestTransaction_Url;
  private PaymentPerformaInvoice_url : string = constants.PaymentPerformaInvoice_url;
  private getCustomerLedgerSummary_url : string = constants.getCustomerLedgerSummary_url;
  private getFundAddedTransactionsDetails_url : string = constants.getFundAddedTransactionsDetails_url;
  private getPayoutTransactionsDetails_url :string = constants.getPayoutTransactionsDetails_url;

  getLatestTransaction(userData:any){
    return this._CallApiService.post_enc(userData,this.getLatestTransaction_Url);
  }

  PaymentPerformaInvoice(userData:any){
    return this._CallApiService.post_enc(userData,this.PaymentPerformaInvoice_url);
  }
  getCustomerLedgerSummary(userData:any){
    return this._CallApiService.post_enc(userData,this.getCustomerLedgerSummary_url);
  }
  getFundAddedTransactionsDetails(userData:any){
    return this._CallApiService.post_enc(userData,this.getFundAddedTransactionsDetails_url);
  }
  getPayoutTransactionsDetails(userData:any){
    return this._CallApiService.post_enc(userData,this.getPayoutTransactionsDetails_url);
  }
}
