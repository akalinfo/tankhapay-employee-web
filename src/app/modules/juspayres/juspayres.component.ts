import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterStateSnapshot } from '@angular/router';
import { LoginService } from '../login/login.service';
import { ToastrService } from 'ngx-toastr';
import { SessionService } from 'src/app/shared/services/session.service';
import jwtDecode from 'jwt-decode';

@Component({
  selector: 'app-juspayres',
  templateUrl: './juspayres.component.html',
  styleUrls: ['./juspayres.component.css']
})

export class JuspayresComponent {
  snapshot_dummay: any;
  order_id: any;
  paymentStatusData: any = [];
  showStatusPage: number = 0;
  emp_mobile: any;
  prev_signup_flag: any;

  constructor(
    private router: Router,
    private _loginService: LoginService,
    private toastr: ToastrService,
    private _sessionService: SessionService,
    private _LoginService: LoginService,
  ) {
    const snapshot: RouterStateSnapshot = router.routerState.snapshot;

    this.snapshot_dummay = snapshot.url;
    this.order_id = !(snapshot?.root?.queryParams?.order_id) ? '' : snapshot?.root?.queryParams?.order_id;
    console.log(snapshot);  // <-- hope it helps

    let session_obj = this._sessionService.get_user_session();
    let token = JSON.parse(session_obj).token;
    let decoded_token: any = jwtDecode(token);

    this.emp_mobile = decoded_token.mobile;
    this.prev_signup_flag = decoded_token.signup_flag;
    console.log(this.prev_signup_flag);

  }

  ngOnInit() {
    this.jusPayOrderResponse();
  }

  jusPayOrderResponse() {

    if (!this.order_id) {
      this.toastr.error('No Order Id found', 'Oops!');
      return;
    }

    this._loginService.jusPayOrderResponse({
      "order_id": this.order_id,
    })
      .subscribe({
        next: (resData: any) => {
          if (resData.statusCode) {
            this.paymentStatusData = resData.commonData;

            if (this.paymentStatusData.status == 'CHARGED') {
              this.showStatusPage = 1;

            } else if (this.paymentStatusData.status == 'PENDING_VBV' || this.paymentStatusData.status == 'AUTHORIZING') {
              this.showStatusPage = 2;

            } else if (this.paymentStatusData.status == 'AUTHENTICATION_FAILED' || this.paymentStatusData.status == 'AUTHORIZATION_FAILED') {
              this.showStatusPage = 3;

            } else if (this.paymentStatusData.status == 'JUSPAY_DECLINED') {
              this.showStatusPage = 4;
            }

          } else {
            this.toastr.error(resData.message, 'Oops');
          }
        }, error: (e) => {
          console.log(e);
        }
      })
  }

  formatTime(dateStr: any) {
    // console.log(dateStr);
    const date = new Date(dateStr);

    // Adjust the date to IST (UTC+5:30)
    date.setHours(date.getHours());
    date.setMinutes(date.getMinutes());

    // Formatting options
    const options = {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short'
    };

    const formattedDate = date.toLocaleDateString('en-IN', options as Intl.DateTimeFormatOptions);
    // console.log(formattedDate);

    return formattedDate;
  }

  routeToOnboarding() {
    if (this.prev_signup_flag == 'AV' || this.prev_signup_flag == 'PT' || this.prev_signup_flag == 'CD' || this.prev_signup_flag == 'EA' || this.prev_signup_flag == 'SPI') {
      this.router.navigate(['/login/onboarding'], { state: { mobile: this.emp_mobile } });

    } else if (this.prev_signup_flag == 'SP') {
      this.router.navigate(['/accounts']);
    }
  }

  direct_login() {
    this._LoginService.direct_login({
      'mobile': this.emp_mobile,
    })
      .subscribe({
        next: (resData: any) => {

          if (resData.status == 'True') {

            localStorage.setItem('activeUser', JSON.stringify(resData));

            if (resData.token) {
              let token: any = jwtDecode(resData.token);
              let signup_flag = token.signup_flag;
              let gstin_no_isverify_y_n = token.gstin_no_isverify_y_n;
              let user_type = token.user_type;
              // console.log(signup_flag);

              if (this.prev_signup_flag == 'AV' || this.prev_signup_flag == 'PT' || this.prev_signup_flag == 'CD' || this.prev_signup_flag == 'EA' || this.prev_signup_flag == 'SPI') {
                if (user_type == 'Business') {
                  if (gstin_no_isverify_y_n != 'Y') {
                    this.router.navigate(['/dashboard/welcome']);
                  } else if (gstin_no_isverify_y_n == 'Y') {
                    // this.router.navigate(['/dashboard']);
                    this.router.navigate(['/dashboard/welcome']);
                  }
                } else if (user_type == 'Individual') {
                  localStorage.setItem('default_url', '/dashboard');
                  // this.router.navigate(['/dashboard']);
                  this.router.navigate(['/dashboard/welcome']);
                }


              } else if (this.prev_signup_flag == 'SP') {
                this.router.navigate(['/accounts']);

              }
            }
          } else {
            this.toastr.error(resData.msg, 'Error');
          }

        }, error: (e) => {
          console.log(e);
        }
      })
  }


  onPrint(divName: any) {
    window.print();

  }




}
