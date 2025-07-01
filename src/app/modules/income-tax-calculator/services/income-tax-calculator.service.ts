import { Injectable } from '@angular/core';
import { CallApiService } from 'src/app/shared/services/call-api.service';
import { EncrypterService } from 'src/app/shared/services/encrypter.service';
import * as constants from '../../../shared/helpers/constants';

@Injectable({
  providedIn: 'root'
})
export class IncomeTaxCalculatorService {
 constructor(private _EncrypterService: EncrypterService,
    private _CallApiService: CallApiService,
  ) { }

  private TaxCalculator_url: string = constants.TaxCalculator_url;
 
  TaxCalculator(data:any){
    return this._CallApiService.post_enc(data,this.TaxCalculator_url);
  }
  // end 
}