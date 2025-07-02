import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UserMgmtService } from '../user-mgmt.service';
import { SessionService } from 'src/app/shared/services/session.service';
import decode from 'jwt-decode';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { dongleState, grooveState } from 'src/app/app.animation';
import { EncrypterService } from 'src/app/shared/services/encrypter.service';
import { GlobalConstants } from 'src/app/shared/global-constants';
import { AlertService } from 'src/app/shared/_alert';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-roles',
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.css'],
  animations: [grooveState, dongleState]
})
export class RolesComponent {

  showSidebar: boolean = true;
  allRoles: any=[];
  token: any;
  tp_account_id: any;
  product_type: any;
  updateRoleform: FormGroup;
  addRole: boolean=false;
  isSubmitted: boolean=false;

  constructor(
    private router: Router,
    private _userMgmtService : UserMgmtService,
    private _SessionService : SessionService,
    private _formBuilder : FormBuilder,
    private _encrypterService : EncrypterService,
    private _alertservice : AlertService,
    private toastr : ToastrService
  
  ) {

  }

  ngOnInit(){
    let session_obj_d: any = JSON.parse(this._SessionService.get_user_session());
    this.token = decode(session_obj_d.token);
    this.tp_account_id = this.token.tp_account_id;
    this.product_type = this.token.product_type;

    this.updateRoleform = this._formBuilder.group({
      rolename:['',[Validators.required]],
      roledesc : ['',[Validators.required]],
      status : ['']
    })


    this.getRoles();
  }

  toggle() {
    this.showSidebar = !this.showSidebar;
  }


  get uf(){
    return this.updateRoleform.controls;
  }
  routeToNewRole() {
    this.router.navigateByUrl('/mgmt/new-role');
  }

  getRoles(){
    this._userMgmtService.getRoles({'customerAccountId': this._encrypterService.aesEncrypt(this.tp_account_id.toString())}).subscribe((resData:any)=>{
      if(resData.statusCode){
        this.allRoles = JSON.parse(this._encrypterService.aesDecrypt(resData.commonData));
      }
    })
  }

  addUpdateRole(){
    this.isSubmitted = true;
    if(this.updateRoleform.invalid){
      this._alertservice.error('Please fill the required fields', GlobalConstants.alert_options_autoClose);
      return
    }
    let posData = {
      ...this.updateRoleform.value,
      updatedBy: this.token.userid,
      'customerAccountId': this._encrypterService.aesEncrypt(this.tp_account_id.toString())
    }
    this._userMgmtService.saveRole(posData).subscribe((resData:any)=>{
      if(resData.statusCode){
        this._alertservice.success(resData.message, GlobalConstants.alert_options_autoClose);
        this.closeUpdateRole();
      }else{
        this._alertservice.error(resData.message, GlobalConstants.alert_options_autoClose);
      }
    })
  }

  showAddRolemodal(){
    this.addRole=true;
  }


  closeUpdateRole(){
    this.addRole=false;
    this.isSubmitted=false;
    this.updateRoleform.reset();
    this.getRoles();
  }

  routeToRolePrivilege(roleid:any){
    this.router.navigate(['/mgmt/new-role',this._encrypterService.aesEncrypt(roleid.toString())]);
  }

}
