import { Component, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EncrypterService } from 'src/app/shared/services/encrypter.service';

@Component({
  selector: 'app-mobile-view-login',
  templateUrl: './mobile-view-login.component.html',
  styleUrls: ['./mobile-view-login.component.css']
})
export class MobileViewLoginComponent {
  url: String= 'https://m.tankhapay.com/?id=';
  mobile : any;

  constructor(private _encrypterService : EncrypterService,
    private route: ActivatedRoute
  ){
    this.route.queryParams.subscribe((queryParam)=>{
      this.mobile = (this._encrypterService.aesDecrypt(queryParam['data']))
      console.log(this.mobile);
      
    })
  }

  ngOnInit(){

    const date = this.getCurrentFormattedDate();
    this.url += this._encrypterService.aesEncrypt(this.mobile+'TP'+date);
  }

  getCurrentFormattedDate(): string {
    const now = new Date();

    // Extract components
    const day = now.getDate().toString().padStart(2, '0');
    const month = (now.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-based
    const year = now.getFullYear();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');

    return `${day}-${month}-${year} ${hours}:${minutes}`;
  }
}
