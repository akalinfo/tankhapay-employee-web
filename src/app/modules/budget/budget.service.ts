import { Injectable } from '@angular/core';
import { CallApiService } from 'src/app/shared/services/call-api.service';
import * as constants from '../../shared/helpers/constants';

@Injectable({
  providedIn: 'root'
})
export class BudgetService {

  constructor(private _CallApiService : CallApiService) { }

  private addUpdateBudget_url : string= constants.addUpdateBudget_url;

  addUpdateBudget(userData:any){
    return this._CallApiService.post_enc(userData,this.insertBudgetDetail_url);
  }
  private insertBudgetDetail_url : string= constants.insertBudgetDetail_url;

  insertBudgetDetail(userData:any){
    return this._CallApiService.post_enc(userData,this.insertBudgetDetail_url);
  }
}
