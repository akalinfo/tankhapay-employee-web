import { Injectable } from '@angular/core';

import { Observable, of, throwError } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { EncrypterService } from 'src/app/shared/services/encrypter.service';
@Injectable({
  providedIn: 'root'
})
export class CallApiService {

  constructor(private http: HttpClient, private _encrypterService: EncrypterService) { }

  post(userData: any, postUrl: string) {
    return this.http.post(postUrl, JSON.stringify(userData))
      .pipe(
        retry(1),
        catchError(this.errorHandler)
      );
  }
  // JSON.stringify
  post_enc(userData: any, postUrl: string) {
    return this.http.post(postUrl, ({ 'encrypted': this._encrypterService.aesEncrypt(JSON.stringify(userData)) }))
      .pipe(
        retry(1),
        catchError(this.errorHandler)
      );
  }

  excractData(res: Response) {
    let body = res.json();
    return body || {};
  }

  errorHandler(error: Response) {
    return throwError(error || 'Server Error');
  }

}
