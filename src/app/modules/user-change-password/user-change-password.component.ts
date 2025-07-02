import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MasterServiceService } from 'src/app/shared/services/master-service.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { Md5 } from 'ts-md5/dist/esm/md5';
import { SessionService } from 'src/app/shared/services/session.service';
import decode from 'jwt-decode';
import { AlertService } from 'src/app/shared/_alert';
import { GlobalConstants } from 'src/app/shared/global-constants';

@Component({
  selector: 'app-user-change-password',
  templateUrl: './user-change-password.component.html',
  styleUrls: ['./user-change-password.component.css']
})
export class UserChangePasswordComponent implements OnInit {
  page_title = 'Change Password';
  changeForm!: FormGroup;
  postData: any;
  isHidden = false;
  showSidebar: boolean = true;
  token :any;
  constructor(
    private formBuilder: FormBuilder,
    private _MasterServiceService: MasterServiceService,
    public toastr: ToastrService,
    private router: Router,
    private _SessionService: SessionService,
    private AlertService: AlertService
  ) { }

  

  toggleVisibility() {
    this.isHidden = !this.isHidden;
  }

  toggle() {
    this.showSidebar = !this.showSidebar;
  }
  ngOnInit(): void {

    let isLoggedIn = this._SessionService.check_user_session();
    let session_obj_d: any = JSON.parse(this._SessionService.get_user_session());
    this.token = decode(session_obj_d.token);

    if (isLoggedIn) {
      this.changeForm = this.formBuilder.group({
        currentpwd: ['',[Validators.required]],
        newpassword: ['',[Validators.required,Validators.minLength(6)]],
        confirmpassword: ['',[Validators.required]]
      })
    } else {
      localStorage.clear();
      this.router.navigate(['/login']);
      return;
    }

  }

  onSubmit() {
    this.postData = this.changeForm.value;

    if (this.postData.currentpwd == '') {
      this.toastr.error('Please enter your old password', 'Oops');
      return;
    }

    if (this.postData.newpassword == '') {
      this.toastr.error('Please enter your new password', 'Oops');
      return;
    }

    if(this.changeForm.controls.newpassword.errors?.pattern){
      this.toastr.error('Password does not match the required pattern.',"Oops!");
      return;
    }

    if (this.postData.newpassword != this.postData.confirmpassword) {
      this.toastr.error('New password and confirm password do not match', 'Oops');
      return;
    }


    let currentPassword = Md5.hashStr(this.postData.currentpwd);
    let newPassword = Md5.hashStr(this.postData.newpassword);
    let confirmPassword = Md5.hashStr(this.postData.confirmpassword);


    // console.log(this.postData);
    this._MasterServiceService.setEmployerPassword({ 'currentpwd': currentPassword, 'newpassword': newPassword, 'confirmpassword': confirmPassword ,
      'mobile':this.token.mobile==''? this.token.userid: this.token.mobile}).subscribe((resData: any) => {

      //console.log(resData.msgcd);
      if (resData.status && resData.commonData.msgcd == '1') {
        this.toastr.success(resData.commonData.msg);
        this.router.navigate(['/logout']);
      } else {
        this.toastr.error(resData.commonData.msg, 'Oops!');
      }
    })


  }

}
