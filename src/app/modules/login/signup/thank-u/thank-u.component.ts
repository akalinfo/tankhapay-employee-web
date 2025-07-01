import { Component, OnDestroy } from '@angular/core';
import { LoginService } from '../../login.service';
import { NavigationEnd, Router } from '@angular/router';
import { EncrypterService } from 'src/app/shared/services/encrypter.service';
import { ToastrService } from 'ngx-toastr';
import { SessionService } from 'src/app/shared/services/session.service';
import decode from 'jwt-decode';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-thank-u',
  templateUrl: './thank-u.component.html',
  styleUrls: ['./thank-u.component.css']
})
export class ThankUComponent implements OnDestroy {

  pinumber: any;
  paymentData: any = [];
  emp_mobile: any;
  isLoggedIn: boolean = false;
  intervalId: any;
  private ngUnsubscribe = new Subject<void>();

  constructor(
    private _LoginService: LoginService,
    private router: Router,
    private _EncrypterService: EncrypterService,
    private toastr: ToastrService,
    private _SessionService: SessionService,
  ) {
    if (this.router.getCurrentNavigation().extras.state != null || this.router.getCurrentNavigation().extras.state != undefined) {
      this.pinumber = this.router.getCurrentNavigation().extras.state.pinumber;
      // console.log(this.emp_mobile);
    }

    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      takeUntil(this.ngUnsubscribe)
    ).subscribe((event: NavigationEnd) => {
      // Check if you are leaving the current component
      if (event.url !== '/login/thank-u') {
        if (this.intervalId) {
          clearInterval(this.intervalId);
        }
      }
    });
  }

  ngOnInit() {

    this.isLoggedIn = this._SessionService.check_user_session();

    if (this.isLoggedIn) {
      let token: any = decode(localStorage.getItem('activeUser'));
      // this.tp_account_id = token.tp_account_id;
      this.emp_mobile = token.mobile;
    }

    if (this.pinumber == '' || this.pinumber == null || this.pinumber == undefined) {
      localStorage.clear();
      this.router.navigate(['login']);
    }
    this.hdfcPaymentStatus();

  }

  hdfcPaymentStatus() {
    this._LoginService.hdfcPaymentStatus({
      "order_no": this.pinumber,
    })
      .subscribe({
        next: (resData: any) => {
          if (resData.statusCode) {
            this.paymentData = JSON.parse(this._EncrypterService.aesDecrypt(resData.commonData));

            this.intervalId = setInterval(() => {
              this.direct_login();
            }, 30000); // 30 seconds

            // {"transactionid":"","transactiontime":"","paymentstatus":"",
            // "amount":"","fromUser":"","toUser":"","paymentmode":"UPI","msg":"","invoice_no":""}
          } else {
            this.toastr.error(resData.message, 'Oops!');
          }
        }, error: (e) => {
          // console.log(e.error);
        }
      })

  }

  // continue_route() {
  //   if (this.isLoggedIn == false) {
  //     this.router.navigate(['/login']);
  //   } else {
  //     this.getEmployer_status();
  //   }
  // }

  direct_login() {
    this._LoginService.direct_login({
      'mobile': this.emp_mobile,
    })
      .subscribe({
        next: (resData: any) => {

          if (resData.status == 'True') {
            if (this.intervalId) {
              clearInterval(this.intervalId);
            }
            localStorage.setItem('activeUser', JSON.stringify(resData));

            if (resData.token) {
              let token: any = decode(resData.token);
              let signup_flag = token.signup_flag;
              let gstin_no_isverify_y_n = token.gstin_no_isverify_y_n;
              let user_type = token.user_type;
              // console.log(signup_flag);

              if (signup_flag == 'SP') {
                if (user_type == 'Business') {
                  if (gstin_no_isverify_y_n != 'Y') {
                    this.router.navigate(['/dashboard/welcome']);

                  } else if (gstin_no_isverify_y_n == 'Y') {
                    this.router.navigate(['/dashboard']);

                  }
                }
              }
            }
          } else {
            this.toastr.error(resData.msg, 'Error');
          }

        }, error: (e) => {

        }
      })
  }

  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  // getEmployer_status() {
  //   this._LoginService.getEmployer_status({
  //     'employer_mobile': this.emp_mobile
  //   }).subscribe({
  //     next: (resData: any) => {
  //       if (resData.statusCode) {
  //         let data = JSON.parse(this._EncrypterService.aesDecrypt(resData.commonData));
  //         let signup_flag = data.signup_flag;

  //         if (signup_flag == 'SP') {
  //           this.router.navigate(['/dashboard']);
  //         } else {
  //           this.router.navigate(['login']);
  //         }

  //       } else {
  //         this.toastr.error(resData.message, 'Oops!');
  //       }
  //     }, error: (e) => {
  //       this.toastr.error(e.error.message, 'Oops!');
  //     }
  //   })
  // }

}
