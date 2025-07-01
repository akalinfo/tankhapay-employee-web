
import { Component } from '@angular/core';

@Component({
  selector: 'app-sso-redirect',
  templateUrl: './sso-redirect.component.html',
  styleUrls: ['./sso-redirect.component.css']
})
export class SsoRedirectComponent {
  decoded_token: any;
  popupWindow: any='';

  constructor() {
    window.history.back();
  }


}
