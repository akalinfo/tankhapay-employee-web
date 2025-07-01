import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';
import * as constants from '../../shared/helpers/constants';

@Injectable({
  providedIn: 'root'
})
export class EncrypterService {

  encrypted: any = "";
  decrypted:any = "";
  ZedriqoTix:any = this.dec_txt(constants.no_name);

  constructor() { }

//   post(userData: any,postUrl: string){    
//     return this.http.post(postUrl,JSON.stringify(userData))
//                     .pipe(
//                       retry(1),
//                       catchError(this.errorHandler)
//                     );
//   }

  aesEncrypt(data:any) { 
    var key = CryptoJS.enc.Utf8.parse(this.ZedriqoTix);
    var encrypted = CryptoJS.AES.encrypt((data), key,
        {
            keySize: 16,
            mode: CryptoJS.mode.ECB,
            padding: CryptoJS.pad.Pkcs7,

        });

    this.encrypted= encrypted.toString();
    return this.encrypted;
  }

  //The get method is use for decrypt the value.
  aesDecrypt(data:any){
    var key = CryptoJS.enc.Utf8.parse(this.ZedriqoTix);
    var decrypted = CryptoJS.AES.decrypt((data), key, {
        keySize: 16,
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
    });
    this.decrypted = decrypted.toString(CryptoJS.enc.Utf8);
    return this.decrypted;
  }



  // Encrypt the data
  enc_txt(data: string): string {
   
    return CryptoJS.AES.encrypt(data, atob(constants.vbasvdbvasbvbds)).toString();    
  }

  // Decrypt the data
  dec_txt(data_enc: string): string {
    const bytes = CryptoJS.AES.decrypt(data_enc, atob(constants.vbasvdbvasbvbds));
    return bytes.toString(CryptoJS.enc.Utf8);
  }

}
