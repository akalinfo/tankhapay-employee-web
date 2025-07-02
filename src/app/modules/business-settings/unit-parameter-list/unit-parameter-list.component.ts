import { Component } from '@angular/core';
import { FaceCheckinService } from '../../attendance/face-checkin.service';
import { SessionService } from 'src/app/shared/services/session.service';
import { ToastrService } from 'ngx-toastr';
import jwtDecode from 'jwt-decode';
import { EncrypterService } from 'src/app/shared/services/encrypter.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-unit-parameter-list',
  templateUrl: './unit-parameter-list.component.html',
  styleUrls: ['./unit-parameter-list.component.css']
})
export class UnitParameterListComponent {

  showSidebar: boolean = true;
  decoded_token: any;
  tp_account_id: any;
  userid: any;
  organzationUnitList: any;
  individualOrgData: any=[];
  pageSizeArr : any =[10,50,100];
  pageSize : number=10;
  p: number= 1;
  tot_records: any=0;
  keyword: any='';
  constructor(
    private _faceCheckinService : FaceCheckinService,
    private _sessionService : SessionService,
    private toastr: ToastrService,
    private _e : EncrypterService,
    private router: Router
  ){}
  ngOnInit(){
    let session_obj = this._sessionService.get_user_session();
    let token = JSON.parse(session_obj).token;
    this.decoded_token = jwtDecode(token);
    this.tp_account_id = this.decoded_token.tp_account_id;
    this.userid = this.decoded_token.userid;

    this.getMasterData();
  }
  toggle() {
    this.showSidebar = !this.showSidebar;
  }
  searchUnit(key:string){
    this.getMasterData();
  }

  getMasterData(){
    this._faceCheckinService.getemployeeList({ "action": "unit_list",
      "customeraccountid": this.tp_account_id,
      "organization_unitid": "",
      "emp_code": "",
      "keyword": this.keyword,
      "fromdate": "",
      "todate": "",
      "index":this.p-1,
      "pagesize":this.pageSize
    }).subscribe((resData:any)=>{
      if(resData.statusCode){
        this.organzationUnitList = JSON.parse(this._e.aesDecrypt(resData.commonData));
        this.tot_records = this.organzationUnitList[0].tot_records;
      }else{
        this.toastr.error(resData.message);
        this.organzationUnitList = [];
      }
    })
  }

  get_page(event: any) {
    this.p = event;
    this.getMasterData();
  }

  getDynamicLimit(event:any){
    this.pageSize=event;
    this.getMasterData();
  }

  editorg(org:any){
    this.router.navigate(['business-settings/unit-parameter-settings',this._e.aesEncrypt(org.id.toString())])

  }

  getDesgDetails(orgid:any){
    this._faceCheckinService.getemployeeList({ "action": "unit_list",
      "customeraccountid": this.tp_account_id,
      "organization_unitid": orgid.toString(),
      "emp_code": "",
      "keyword": "",
      "fromdate": "",
      "todate": ""
    }).subscribe((resData:any)=>{
      if(resData.statusCode){
        
        this.individualOrgData = (JSON.parse(this._e.aesDecrypt(resData.commonData)))[0];
        this.individualOrgData['role']= !this.individualOrgData['role'] ? [] : JSON.parse(this.individualOrgData['role']);
      }else{
        this.toastr.error(resData.message);
        this.individualOrgData = [];
      }
    })
  }
}
