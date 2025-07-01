import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { EncrypterService } from 'src/app/shared/services/encrypter.service';
import { SessionService } from 'src/app/shared/services/session.service';
import { AttendanceService } from '../attendance.service';
declare var $: any;
import decode from 'jwt-decode';
import { FaceCheckinService } from '../face-checkin.service';
import { dongleState, grooveState } from 'src/app/app.animation';
@Component({
  selector: 'app-ot-rules',
  templateUrl: './ot-rules.component.html',
  styleUrls: ['./ot-rules.component.css'],
  animations:[grooveState,dongleState]
})

export class OtRulesComponent {
  showSidebar: boolean = true;
  product_type: any;
  tp_account_id: any = '';
  token: any = '';
  otRulesList: any=[];
  isAddOt: boolean=false;
  otRuleForm:FormGroup;
  otModalHeading:string='';
  currentOt: any='';

  constructor(
    public toastr: ToastrService,
    private _sessionService: SessionService,
    private _formBuilder: FormBuilder,
    private router: Router,
    private _EncrypterService: EncrypterService,
    private _AttendanceService: AttendanceService,
    private _faceCheckinService : FaceCheckinService) {
  }

  ngOnInit() {
    let session_obj_d: any = JSON.parse(
      this._sessionService.get_user_session());
    this.token = decode(session_obj_d.token);
    this.tp_account_id = this.token.tp_account_id;
    this.product_type = localStorage.getItem('product_type');

    this.otRuleForm = this._formBuilder.group({
      ot_rule_name : [''],
      remarks :['']
    })
    this.getMasterData()
  }
  
  toggle() {
    this.showSidebar = !this.showSidebar;
  }

  getMasterData(){
    this._faceCheckinService.getemployeeList({
      "action": "get_ot_rule_list",
      "customeraccountid": this.tp_account_id,
      "organization_unitid": "",
      "emp_code": "",
      "keyword": "",
      "fromdate": "",
      "todate": ""
    }).subscribe((resData:any)=>{
      if(resData.statusCode){
        this.otRulesList = JSON.parse(this._EncrypterService.aesDecrypt(resData.commonData));
      }else{
        this.otRulesList=[];
        this.toastr.error(resData.message);
      }
    })
  }

  showAddOtRuleModal(head:string,otrule:any){
    this.currentOt =otrule;
    this.isAddOt=true;
    this.otModalHeading = head;
    head=='add' ? 'Add OT Rule' : (head=='edit'?'Edit OT Rue':'Delete OT Rule');
    if(head=='edit'){
      this.otRuleForm.patchValue({
        ot_rule_name:otrule.ot_rule_name,
      })
    }
  }


  hideOTRule(){
    this.isAddOt=false;
    this.otRuleForm.patchValue({
      ot_rule_name:'',
      remarks:''
    })
  }

  submitOtRule():any{
    if(this.otRuleForm.invalid){
      return this.toastr.error("Please enter OT Rule Name");
    }

    if((this.otModalHeading=='add' || this.otModalHeading=='edit') && this.otRuleForm.value.ot_rule_name==''){
      return this.toastr.error("Please enter OT Rule Name");
    }

    if(this.otModalHeading=='delete' && this.otRuleForm.value.remarks==''){
      return this.toastr.error("Please enter remarks");
    }

    let action= this.otModalHeading =='add'? 'ot_rule_insert':(this.otModalHeading=='edit'?'ot_rule_update': 'ot_rule_delete');
    let postData ={
      "action":action,
      "_customeraccountid": this.tp_account_id.toString(),
      ...this.otRuleForm.value,
      'modifiedby': this.token.id.toString(),
      'ot_rule_id': this.currentOt ? this.currentOt.id.toString():null
    }

    this._AttendanceService.saveUpdateOtrule(postData).subscribe((resData:any)=>{
      if(resData.statusCode){
        this.toastr.success(resData.message);
        this.getMasterData();
        this.hideOTRule();
      }else{
        this.toastr.error(resData.message);
      }
    })
  }
  editOt(ot:any){
    console.log(this._EncrypterService.aesEncrypt(JSON.stringify(
      {'id':ot.id.toString(),'name':ot.ot_rule_name})));
    
    this.router.navigate(['/attendance/ot_rules', this._EncrypterService.aesEncrypt(JSON.stringify(
      {'id':ot.id.toString(),'name':ot.ot_rule_name}))]);
  }



}

