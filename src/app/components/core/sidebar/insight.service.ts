import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import * as constants from '../../../shared/helpers/constants';
import { CallApiService } from 'src/app/shared/services/call-api.service';


@Injectable({
  providedIn: 'root'
})
export class InsightService {

  private sso_url: string = constants.insight_sso_url;

  constructor(private _CallApiService: CallApiService) { }

getInsightTokenForSSO(obj:any){
  return this._CallApiService.post_enc(obj, this.sso_url)
}


}
