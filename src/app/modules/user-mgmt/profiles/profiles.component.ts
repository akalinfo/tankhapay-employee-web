import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EncrypterService } from 'src/app/shared/services/encrypter.service';
import { SessionService } from 'src/app/shared/services/session.service';
import { UserMgmtService } from '../user-mgmt.service';
import decode from 'jwt-decode';
import { dongleState, grooveState } from 'src/app/app.animation';
import { AlertService } from 'src/app/shared/_alert';
import { GlobalConstants } from 'src/app/shared/global-constants';

@Component({
  selector: 'app-profiles',
  templateUrl: './profiles.component.html',
  styleUrls: ['./profiles.component.css'],
  animations: [grooveState, dongleState]
})
export class ProfilesComponent {

  showSidebar:boolean=true;
  allProfile: any =[];
  addProfile: boolean =false;
  addProfileForm : FormGroup;
  isSubmitted :boolean =false;
  token :any;
  tp_account_id:any;
  product_type:any;

  constructor(
    private _SessionService : SessionService,
    private _encrypterService : EncrypterService,
    private _userMgmtService : UserMgmtService,
    private _formBuilder : FormBuilder,
    private _alertservice : AlertService
  ){

  }

  ngOnInit(){
    let session_obj_d: any = JSON.parse(this._SessionService.get_user_session());
    this.token = decode(session_obj_d.token);
    this.tp_account_id = this.token.tp_account_id;
    this.product_type = this.token.product_type;

    this.addProfileForm = this._formBuilder.group({
      profilename :  ['',[Validators.required]],
      profiledesc : ['']
    })

    this.getProfile();
  }

  toggle() {
    this.showSidebar = !this.showSidebar;
  }

  get pf(){
    return this.addProfileForm.controls;
  }

  showAddProfileModal(){
    this.addProfile=true;
  }

  addUpdateProfile(){
      if(this.addProfileForm.invalid){
        return this._alertservice.error('Please enter Profile name', GlobalConstants.alert_options);
      }

      let postData ={
        ...this.addProfileForm.value,
        'updatedBy': this.token.id,
        'organisationId': this.tp_account_id.toString()
      }

      this._userMgmtService.saveProfile(postData).subscribe((resData:any)=>{
        if(resData.statusCode){

        }
      })
  }

  getProfile(){
    this._userMgmtService.getAllProfile({'customerAccountId': this.tp_account_id}).subscribe((resData:any)=>{
      if(resData.statusCode){
        this.allProfile = JSON.parse(this._encrypterService.aesDecrypt(resData.commonData))
      }else{
        this.allProfile=[];
        return this._alertservice.error('No Data found', GlobalConstants.alert_options);
      }
    })
  }

  closeUpdateProfile(){
    this.addProfile=false;
  }
}
