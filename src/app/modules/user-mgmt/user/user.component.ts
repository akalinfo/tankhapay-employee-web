import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UserMgmtService } from '../user-mgmt.service';
import { SessionService } from 'src/app/shared/services/session.service';
import decode from 'jwt-decode';
import { FormGroup,FormBuilder, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { EncrypterService } from 'src/app/shared/services/encrypter.service';
import { AlertService } from 'src/app/shared/_alert';
import { GlobalConstants } from 'src/app/shared/global-constants'
import { BusinesSettingsService } from '../../business-settings/business-settings.service';
import { dongleState, grooveState } from 'src/app/app.animation';
import { FaceCheckinService } from '../../attendance/face-checkin.service';
import { ReportService } from '../../reports/report.service';
import { lastValueFrom } from 'rxjs';
declare var $:any;

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css'],
  animations: [grooveState, dongleState]
})
export class UserComponent {

  showSidebar: boolean = true;
  token: any;
  tp_account_id: any;
  product_type: any;
  allUsers: any=[];
  addUserForm: FormGroup
  addDashboardSettingForm: FormGroup
  allRoles: any=[];
  isAddUpdateUser:boolean=false;
  isAddUpdateDashboardSetting:boolean=false;
  showSetGeofeningPopup :boolean = false;
  saveOUForm: FormGroup;
  form_title_name : string ='';
  geo_fencing_list_data: any[];
  isUpdate: boolean=false;
  isUpdateSetting: boolean=false;
  isSubmitted: boolean=false;
  isPassWordChng :boolean= false;
  empList: any=[];
  searchTerm:string='';
  OUWiseEmpList: any=[];
  show_suggestion_list_ca:boolean=false;
  geoDropdownSettings={};
  selectedval :any=[];
  orgGroup: any='';
  isShowEmp : boolean=false;
  pageIndex: any=1;
  totalEmp: number=0;
  currentUser: any;
  headtext: string;
  settingHeadtext: string;
  user_object: any;

  dashboard_settings: {
    employee_list: boolean;
    attendance: boolean;
    birthday: boolean;
    leaves: boolean;
    holidays: boolean;
    chart: boolean;
    notifications: boolean;
  } | null = null;

  constructor(
    private router: Router,
    private _userMgmtService : UserMgmtService,
    private _ReportService: ReportService,
    private _SessionService : SessionService,
    private _formBuilder: FormBuilder,
    private toastr: ToastrService,
    private _encrypterService : EncrypterService,
    private _alertservice : AlertService,
    private _businesessSettingsService : BusinesSettingsService,
    private _faceCheckinService : FaceCheckinService,
    private _BusinesSettingsService: BusinesSettingsService,
  ) {

  }

  ngOnInit(){
    let session_obj_d: any = JSON.parse(this._SessionService.get_user_session());
    this.token = decode(session_obj_d.token);
    this.tp_account_id = this.token.tp_account_id;
    this.product_type = this.token.product_type;

    this.addUserForm= this._formBuilder.group({
      name: ['',[Validators.required,Validators.pattern(/^[a-zA-Z ]+$/)]],
      mobile : ['',[Validators.required,Validators.pattern(/^[6-9]{1}[0-9]{9}/)]],
      email: ['',[Validators.required,Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$')]],
      role: ['',[Validators.required]],
      orgUnit : ['',[Validators.required]],
      status : ['1',[Validators.required]],
      profile:[''],
      user_id : ['']
    });

    this.addDashboardSettingForm = this._formBuilder.group({
      employee_list: [false],
      attendance: [false],
      birthday: [false],
      leaves: [false],
      holidays: [false],
      chart: [false],
      notifications: [false]
    });

    this.geoDropdownSettings = {
      singleSelection: false,
      idField: 'id',
      textField: 'org_unit_name',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      allowSearchFilter: true,
      // allowRemoteDataSearch: true,
      // searchFilter: (term: string, item: any)=> this.customSearchFilter(term, item)
   };

   this.getEmployeeList('')
    this.getAllUser();
    this.getRoles();
    this.get_geo_fencing_list();
  }

  customSearchFilter( item: any) {
    // term = term.toLowerCase();
    console.log(item);

    // return item.emp_name.toLowerCase().indexOf(term) !== -1 || item.emp_code.toLowerCase().indexOf(term) !== -1;
  }

  toggle() {
    this.showSidebar = !this.showSidebar;
  }

  get af(){
    return this.addUserForm.controls;
  }

  getAllUser(){
    this._userMgmtService.getAllUser({'keyword':'','customerAccountId': this.tp_account_id,'pageindex':0,'pagesize':500}).subscribe((resData:any)=>{
      if(resData.statusCode){
        this.allUsers = JSON.parse(this._encrypterService.aesDecrypt(resData.commonData));
        // console.log("allUsers-------", this.allUsers)
      }else{
        this.allUsers=[];

        this._alertservice.error(resData.message, GlobalConstants.alert_options);
      }
    })
  }

  getRoles(){
    this._userMgmtService.getRoles({'customerAccountId': this._encrypterService.aesEncrypt(this.tp_account_id.toString())}).subscribe((resData:any)=>{
      if(resData.statusCode){
        this.allRoles = JSON.parse(this._encrypterService.aesDecrypt(resData.commonData));
      }
    })
  }

  showAddUserModal(){
    this.isAddUpdateUser=true;
    this.headtext ='Add User';
    this.addUserForm.get('email').enable();
    this.addUserForm.get('mobile').enable();
  }

  closeAddUser(){
    this.isAddUpdateUser = false;
    this.isUpdate=false;
    this.isSubmitted=false;
    this.addUserForm.reset();
    this.searchTerm='';
    this.totalEmp=0;
    this.isPassWordChng=false;
    $('#searchEmp').val('');
    this.addUserForm.get('email').enable();
    this.addUserForm.get('mobile').enable();
    this.OUWiseEmpList=[];
    this.addUserForm.patchValue({
      status : '1',
      user_id:''
    })
  }

  close_OUPopup(){
    this.showSetGeofeningPopup=false;
  }

  get_geo_fencing_list() {
    this._userMgmtService.getGeoFencing({
      "customerAccoutnId": (this.tp_account_id).toString(),
    }).subscribe((resData: any) => {
      this.geo_fencing_list_data = [];
      if (resData.statusCode) {

        this.geo_fencing_list_data = JSON.parse(this._encrypterService.aesDecrypt(resData.commonData));

      } else {
        this.toastr.error(resData.message, 'Oops!');
      }
    })
  }




  addUpdateUser(){
    this.isSubmitted = true;

    if(this.addUserForm.controls.name.value==''){
      return  this._alertservice.error('Please enter name', GlobalConstants.alert_options_autoClose);
    }
    if(this.addUserForm.controls.name.errors && this.addUserForm.controls.name.errors.pattern){
      return  this._alertservice.error('Invalid name', GlobalConstants.alert_options_autoClose);
    }

    if(this.addUserForm.controls.mobile.value==''){
      return  this._alertservice.error('Please enter mobile no', GlobalConstants.alert_options_autoClose);
    }
    if(this.addUserForm.controls.mobile.errors && this.addUserForm.controls.mobile.errors.pattern){
      return  this._alertservice.error('Invalid mobile no', GlobalConstants.alert_options_autoClose);
    }

    if(this.addUserForm.controls.email.value==''){
      return  this._alertservice.error('Please enter emailid', GlobalConstants.alert_options_autoClose);
    }
    if(this.addUserForm.controls.email.errors && this.addUserForm.controls.email.errors.pattern){
      return  this._alertservice.error('Invalid emailid', GlobalConstants.alert_options_autoClose);
    }
    if(this.af.role.value==''){
      return  this._alertservice.error('Please select role', GlobalConstants.alert_options_autoClose);
    }
    if(this.orgGroup==''){
      this.onItemSelect([]);
    }
    if(this.af.orgUnit.value.length==0){
      return  this._alertservice.error('Please select organization unit', GlobalConstants.alert_options_autoClose);
    }
    // if(this.addUserForm.invalid){
    //   this._alertservice.error('Please fill the required fields', GlobalConstants.alert_options_autoClose);
    //   return;
    // }
    let action ='';
    if(this.isUpdate){
      action='update_user'
    }else{
      action='save_new_user'
    }
    // return console.log(this.allRoles.filter(obj=> obj.role_id==this.af.role.value));

    let postData = {
      'action':action,
      ...this.addUserForm.getRawValue(),
      updatedBy: this.token.userid,
      'employer_name': this.token.name,
      'role_name': (this.allRoles.filter(obj=> obj.role_id==this.af.role.value))[0].role_name,
      'customerAccountId': this._encrypterService.aesEncrypt(this.tp_account_id.toString()),
      'orgUnit': this.orgGroup.toString()
    };

    this._userMgmtService.saveUser(postData).subscribe((resData:any):any=>{
      if(resData.statusCode){
          this._userMgmtService.registerSubUser({'action': 'SUBUSER',...this.addUserForm.getRawValue(),
            updatedBy: this.token.userid,'customerAccountId': this.tp_account_id.toString(),
            'orgUnit': this.orgGroup.toString()
          }).subscribe((resData1:any)=>{
            if(resData1.statusCode){
              this.toastr.success(resData.message);
              this.closeAddUser();
              this.getAllUser();
              // refresh 
              this.refreshMaterializedViewByApi('users-refresh');
            }else{
              this.toastr.success(resData.message);
            }
          })

      }else{
        return this.toastr.error(resData.message);
      }
    })
  }

  editUserModal(user:object){
    this.isUpdate = true;
    this.headtext ='Edit User';
    if (this.isUpdate) {
      this.addUserForm.get('email').disable();
      // console.log(user);

      if(user['user_mobile']!='')
        this.addUserForm.get('mobile').disable();
    }

    this.isPassWordChng = user['is_passwordchange']=='Y' || user['is_passwordchange']=='N';
    let ouData = [];
    const userOfficeUnitIds = user['office_unit_id_fk'].split(',').map(id => id.trim());
    this.geo_fencing_list_data.map((ou,_index)=> {
      if(userOfficeUnitIds.includes(ou.id.toString())) ouData.push({'id':ou.id,'org_unit_name': ou.org_unit_name})
    })
    this.addUserForm.patchValue({
      name: user['user_fullname'],
      mobile : user['user_mobile'],
      email: user['user_email'],
      role: user['tp_role_id'].toString(),
      orgUnit : ouData,
      status : user['account_status'],
      user_id: user['user_id']
    })
  }

  getEmployeeList(key: string){
    if(key.length<3){
      return;
    }

    let postdata ={
      action:'emp_list',
      customeraccountid : this.tp_account_id.toString(),
      organization_unitid :this.token.geo_location_id,
      emp_code:'',
      keyword:key,
      fromdate:'',
      todate:''
    }

    this._faceCheckinService.getemployeeList(postdata).subscribe((resData:any)=>{
      if(resData.statusCode){
        this.empList= JSON.parse(this._encrypterService.aesDecrypt(resData.commonData));

        this.empList.map(emp=>{
            emp.emp_name1 = `${emp.emp_name} - ${emp.cjcode}`;
        })

      }else{
        this.empList=[];
      }
    })
  }


  hideSuggestionList() {
    this.show_suggestion_list_ca = false;
  }

  onFocusout() {
    setTimeout(() => {
      this.hideSuggestionList();
    }, 500);
  }

  patchSearchKeyword(emp:any){

    this.addUserForm.patchValue({
      name: emp.emp_name,
      email: emp.email,
      mobile: emp.mobile
    })
  }

  getOuWiseEmp(user:any){
    this.currentUser = user;
    this.totalEmp =user['emp_map'];

    let postdata ={
      action:'emp_list',
      customeraccountid : this.tp_account_id.toString(),
      organization_unitid :user['office_unit_id_fk'],
      emp_code:'',
      keyword:'',
      fromdate:'',
      todate:'',
      pagesize : 10,
      index : this.pageIndex-1
    }
    this.isShowEmp=true;
    this._faceCheckinService.getemployeeList(postdata).subscribe((resData:any)=>{
      if(resData.statusCode){
        this.OUWiseEmpList= JSON.parse(this._encrypterService.aesDecrypt(resData.commonData));
      }else{
        this.empList=[];
        this.OUWiseEmpList=[];
      }
    })
  }

  get_page(event: any) {
    // console.log(event);
    this.pageIndex = event;
    this.getOuWiseEmp(this.currentUser)
  }

  onItemSelect(item:any){
    console.log(this.selectedval);

    this.orgGroup = this.selectedval.map(val=> val.id);
   }

   onSelectAll(item:any){
     this.orgGroup = item.map(val=> val.id);

   }
   onUnselectAll(item:any){
     this.orgGroup = item.map(val=> val.id);
   }
   onItemUnselect(item:any){
     this.orgGroup = this.selectedval.map(val=> val.id);
   }

   deleteCache() {
    this._userMgmtService.deleteAllCacheKeysForAccount({
      'customerAccountId': this.tp_account_id.toString(),

    }).subscribe((resData: any) => {
      if (resData.statusCode) {
        this.toastr.success(resData.message, 'Success');
      } else {
        this.toastr.error(resData.message, 'Oops!');
      }
    })
   }
   // refreshMaterializedView() {
   refreshMaterializedViewByApi(action: any) {

    this._BusinesSettingsService.RefreshMaterializedViewByApi({
      'action': action
    }).subscribe({
      next: (resData: any) => {
        if (resData.statusCode) {
          // this.toastr.success(resData.message, 'Success');
          // console.log('Refresh Success');

        } else {
          this.toastr.error(resData.message, 'Oops!');
        }
      }, error: (e) => {
        console.log(e)
      }
    })
  }


  // ======== Add/Update Dashboard Setting for Sub_User - sidharth kaul dated. 20.06.2025 ======= 
  async showAddDashboardSettingModal(user: any){
    this.user_object = user;
    this.isAddUpdateDashboardSetting = true;
    this.settingHeadtext ='Add Dashboard/Notification Setting';
    await this.getDashboardSettingData(user?.user_id);

    if(this.dashboard_settings){
      this.editDashboardSettingsModal();
    }
  }

  closeAddDashboardSettingModal(){
    this.isAddUpdateDashboardSetting = false;
    this.isUpdateSetting = false;
    this.user_object = null;
    this.settingHeadtext ='Add Dashboard/Notification Setting';
    this.addDashboardSettingForm.reset();
  }

  editDashboardSettingsModal(){
    this.isUpdateSetting = true;
    this.settingHeadtext = 'Update Dashboard/Notification Setting';

    this.addDashboardSettingForm.patchValue({
      employee_list: this.dashboard_settings?.employee_list,
      attendance : this.dashboard_settings?.attendance,
      birthday: this.dashboard_settings?.birthday,
      leaves: this.dashboard_settings?.leaves,
      holidays : this.dashboard_settings?.holidays,
      chart: this.dashboard_settings?.chart,
      notifications: this.dashboard_settings?.notifications
    });

  }

  // CREATE DASHBOARD SETTING
  addUpdateDashboardSetting(){

    let dynamic_action = '';

    if(this.isUpdateSetting){
      dynamic_action ='update_dashboard_setting'
    } else {
      dynamic_action ='save_dashboard_setting'
    }

    let postData = {
      action: dynamic_action,
      customeraccountid: this.tp_account_id.toString(),
      subuser_id: this.user_object?.user_id?.toString(),
      status: true,
      dashboard_section: { 
        "employee_list": this.addDashboardSettingForm.get('employee_list').value || false,
        "attendance": this.addDashboardSettingForm.get('attendance').value || false,
        "birthday": this.addDashboardSettingForm.get('birthday').value || false,
        "leaves": this.addDashboardSettingForm.get('leaves').value || false,
        "holidays": this.addDashboardSettingForm.get('holidays').value || false,
        "chart": this.addDashboardSettingForm.get('chart').value || false,
        "notifications": this.addDashboardSettingForm.get('notifications').value || false
      },
      'createdBy': this.token.userid
    };

    // console.log("postData dashboard ---", postData);
    // return;

    this._userMgmtService.addUpdateDashboardSetting(postData).subscribe((resData:any):any=> {
      if (resData.statusCode) {
             this.toastr.success(resData.message);
              this.closeAddDashboardSettingModal();
              this.getAllUser();
              // refresh 
              // this.refreshMaterializedViewByApi('users-refresh');
      } else {
        // return this.toastr.error(resData.message);
        console.log("No Data Found!");
      }
    })
  }

  // GET DASHBOARD SETTINGS
  async getDashboardSettingData(subuserid: any): Promise<void> {  
    this.dashboard_settings = null;

    const resData: any = await lastValueFrom(
      this._ReportService.GetDashboardSettingData({
        action: 'GET_DASHBOARD_SETTINGS',
        customeraccountid: this.tp_account_id?.toString(),
        subuser_id: subuserid?.toString(),
      })
    );

    if (resData.statusCode) {
      this.dashboard_settings = resData.commonData;
      // console.log("dashboard_settings", this.dashboard_settings);
    } else {
      this.dashboard_settings = null;
      console.log("No setting found for this subUserId!");
    }

}
// End - Add/Update Dashboard Setting for Sub_User - sidharth kaul 



}
