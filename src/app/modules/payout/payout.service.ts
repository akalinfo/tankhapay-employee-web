import { Injectable } from '@angular/core';
import { CallApiService } from 'src/app/shared/services/call-api.service';
import { EncrypterService } from 'src/app/shared/services/encrypter.service';
import * as constants from '../../shared/helpers/constants';
@Injectable({
  providedIn: 'root'
})
export class PayoutService {

  constructor(private _EncrypterService: EncrypterService,
    private _CallApiService: CallApiService,
  ) { }
  private CustomerPayoutDetails_url: string = constants.CustomerPayoutDetails_url;
  private CustomerPayoutSummary_url: string = constants.CustomerPayoutSummary_url;
  private GetTpVoucherDetails_url: string = constants.GetTpVoucherDetails_url;

  private paySalary_url: string = constants.paySalary_url;
  private UpdateSalaryStatus_url: string = constants.UpdateSalaryStatus_url;
  private getPackages_url: string = constants.getPackages_url;

  private CalcReciebale_url: string = constants.CalcReciebale_url;
  private saveReciebale_url: string = constants.saveReciebale_url;
  private getVpaDetails_url: string = constants.getVpaDetails_url;
  private manualTransfer_url: string = constants.manualTransfer_url;
  private GenerateRequiredAmountPI_url: string = constants.GenerateRequiredAmountPI_url;
private GetCustomerInvoiceDetails_url:string=constants.GetCustomerInvoiceDetails_url;
private reimbursementClaim_url:string=constants.reimbursementClaim_url;


reimbursementClaim(Data:any){
  return this._CallApiService.post_enc(Data, this.reimbursementClaim_url);
}
GetCustomerInvoiceDetails(Data:any){
  return this._CallApiService.post_enc(Data, this.GetCustomerInvoiceDetails_url);
}
  CustomerPayoutDetails(Data: any) {
    return this._CallApiService.post_enc(Data, this.CustomerPayoutDetails_url);
  }

  CustomerPayoutSummary(Data: any) {
    return this._CallApiService.post_enc(Data, this.CustomerPayoutSummary_url);
  }

  GetTpVoucherDetails(Data: any) {
    return this._CallApiService.post_enc(Data, this.GetTpVoucherDetails_url);
  }

  paySalary(Data: any) {
    return this._CallApiService.post(Data, this.paySalary_url);
  }

  UpdateSalaryStatus(Data: any) {
    // console.log(Data)
    return this._CallApiService.post(Data, this.UpdateSalaryStatus_url)
  }
  getPackages(Data: any) {
    return this._CallApiService.post(Data, this.getPackages_url)
  }

  CalcReciebaleFromBaseAmount(Data: any) {
    return this._CallApiService.post(Data, this.CalcReciebale_url)
  }

  saveReceiable(Data: any) {
    return this._CallApiService.post(Data, this.saveReciebale_url)
  }

  getVpaDetails(Data: any) {
    return this._CallApiService.post(Data, this.getVpaDetails_url)
  }
  manualTransfer(Data: any) {
    return this._CallApiService.post(Data, this.manualTransfer_url)
  }
  GenerateRequiredAmountPI(Data: any) {
    return this._CallApiService.post_enc(Data, this.GenerateRequiredAmountPI_url);
  }
private GetPaymentModeTypes_url:string = constants.GetPaymentModeTypes_url;

GetPaymentModeTypes(Data:any){
  return this._CallApiService.post_enc(Data, this.GetPaymentModeTypes_url);
}
private GetMaster_url:string = constants.GetMaster_url;
GetMaster(Data:any){
  return this._CallApiService.post_enc(Data, this.GetMaster_url);
}

private GetConsultantPayoutDetails_url:string = constants.GetConsultantPayoutDetails_url;
GetConsultantPayoutDetails(Data:any){
  return this._CallApiService.post_enc(Data, this.GetConsultantPayoutDetails_url);
}

private AddEditConsultantPayoutDetails_url:string=constants.AddEditConsultantPayoutDetails_url;
AddEditConsultantPayoutDetails(Data:any){
  return this._CallApiService.post_enc(Data, this.AddEditConsultantPayoutDetails_url);
}

private DeleteConsultantPayoutRecord_url:string=constants.DeleteConsultantPayoutRecord_url;
DeleteConsultantPayoutRecord(Data:any){
  return this._CallApiService.post_enc(Data, this.DeleteConsultantPayoutRecord_url);
}
private ConsultantPayout_url:string=constants.ConsultantPayout_url;
ConsultantPayout(Data:any){
  return this._CallApiService.post_enc(Data, this.ConsultantPayout_url);
}
private GetMonthWiseOnboarding_url:string = constants.GetMonthWiseOnboardingData_url;
GetMonthWiseOnboardingData_url(Data:any){
  return this._CallApiService.post_enc(Data, this.GetMonthWiseOnboarding_url);
}

private bulkPayout_url: string = constants.bulkPayout_url;
  bulkPayout(Data: any) {
    return this._CallApiService.post(Data, this.bulkPayout_url);
  }

}
