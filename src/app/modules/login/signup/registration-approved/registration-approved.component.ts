import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { LoginService } from '../../login.service';
import { SessionService } from 'src/app/shared/services/session.service';
import decode from 'jwt-decode';
import { ToastrService } from 'ngx-toastr';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-registration-approved',
  templateUrl: './registration-approved.component.html',
  styleUrls: ['./registration-approved.component.css']
})
export class RegistrationApprovedComponent {
  employer_mobile: any;
  is_first_steps: boolean = true;
  intervalId: any;
  private ngUnsubscribe = new Subject<void>();


  constructor(
    private router: Router,
    private _LoginService: LoginService,
    private _SessionService: SessionService,
    private toastr: ToastrService,
  ) {
    if (this.router.getCurrentNavigation().extras.state != null || this.router.getCurrentNavigation().extras.state != undefined) {
      this.employer_mobile = this.router.getCurrentNavigation().extras.state?.mobile;
      // console.log(this.employer_mobile);
      this.is_first_steps = false;
    } else {
      this.is_first_steps = true;
    }

    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      takeUntil(this.ngUnsubscribe)
    ).subscribe((event: NavigationEnd) => {
      // Check if you are leaving the current component
      if (event.url !== '/login/registration-approved') {
        if (this.intervalId) {
          clearInterval(this.intervalId);
        }
      }
    });
  }

  // handleClick() {
  //   localStorage.clear();
  //   this.router.navigate(['/login']);
  // }
  ngOnInit() {
    // setTimeout(() => {
    //   this.handleClick();
    // }, 30000);

    if (this.employer_mobile == undefined || this.employer_mobile == null || this.employer_mobile == '') {
      let token: any = decode(JSON.parse(this._SessionService.get_user_session()).token);
      this.employer_mobile = token.mobile;

    }

    this.intervalId = setInterval(() => {
      this.direct_login();
    }, 5000); // 5 seconds
  }

  direct_login() {
    this._LoginService.direct_login({
      'mobile': this.employer_mobile,
    })
      .subscribe({
        next: (resData: any) => {

          if (resData.status == 'True') {
            localStorage.setItem('activeUser', JSON.stringify(resData));

            if (resData.token) {
              let token: any = decode(resData.token);
              let signup_flag = token.signup_flag;
              // let gstin_no_isverify_y_n = token.gstin_no_isverify_y_n;
              // let user_type = token.user_type;
              // console.log(signup_flag);
              if (signup_flag == 'AV' || signup_flag == 'PT' || signup_flag == 'CD' || signup_flag == 'EA' || signup_flag == 'SPI') {
                if (this.intervalId) {
                  clearInterval(this.intervalId);
                }
                this.router.navigate(['/login/onboarding'], { state: { mobile: token.mobile } });
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
}
