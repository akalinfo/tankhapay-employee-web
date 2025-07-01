import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { timeout } from 'rxjs/operators';

import { ServiceURL } from './serviceURL';
import { TrackcomponentComponent } from '../trackcomponent/trackcomponent.component';



export interface LiveTrackingResponseBlock<T> {
  successBlock: (data: T) => void;
  failureBlock: (error: any) => void;
}

@Injectable({
  providedIn: 'root'
})
export class ServiceMethod {
  // Maximum time to wait for API (ms)
  private apiRequestTime = 60000;
  

  constructor(private http: HttpClient, private serviceURL: ServiceURL, private trackComponent: TrackcomponentComponent ) {}
    

  postDataServiceRequest<T>(
    bodyMap: any,
    URL: string,
    token: any,
    responseBlock: LiveTrackingResponseBlock<T>
  ): void {
    console.log("token is ::",token,'bodymap::',bodyMap,'url is ',URL);


    const url = `${URL}`;
    const headers = new HttpHeaders({
         'Content-Type': this.serviceURL.kLiveTrackingContentType,
         'Authorization': `Bearer ${token}`
        });

    this.http
      .post<T>(url, bodyMap, { headers })
      .pipe(
        timeout(this.apiRequestTime),
      )
      .subscribe(
        res => {
          
          const anyRes = res as any;
          if (anyRes.statusCode === true || anyRes.statusCode === 200) {
            
            responseBlock.successBlock(res);
          } else  {
          
            responseBlock.failureBlock(res);
          }
        },
        error => {
          // Network or uncaught error
          responseBlock.failureBlock(error);
        }
      );
  }
}
