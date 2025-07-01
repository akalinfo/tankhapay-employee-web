
import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';
import { vbasvdbvasbvbds } from 'src/app/shared/helpers/constants';

@Injectable({
    providedIn: 'root'
  })
  
export class CryptoService {

    secretKey = '0123456789abcdef'; 
    
   

    getEncryptedData(textType: string): string {

        console.log("textype encrpt",textType);
        const encrypted = CryptoJS.AES.encrypt(textType, CryptoJS.enc.Utf8.parse(this.secretKey), {
          mode: CryptoJS.mode.ECB,
          padding: CryptoJS.pad.Pkcs7,
        });
        return encrypted.toString(); // Base64 encoded
      }

      getDecryptedData(encryptedDataStr: string): string {
        const decrypted = CryptoJS.AES.decrypt(encryptedDataStr, CryptoJS.enc.Utf8.parse(this.secretKey), {
          mode: CryptoJS.mode.ECB,
          padding: CryptoJS.pad.Pkcs7,
        });
        return decrypted.toString(CryptoJS.enc.Utf8);
      }
      getEncrypted_MapBody(dummyBody: Record<string, any>): Record<string, string> {
        const jsonEncodeData = JSON.stringify(dummyBody);
        console.log("getencbody", jsonEncodeData);
        const encodedBody = this.getEncryptedData(jsonEncodeData);
      console.log("encodebody", encodedBody);
        const originalBody: Record<string, string> = {};
        originalBody["encrypted"] = encodedBody;
      
        return originalBody;
      }
     
}