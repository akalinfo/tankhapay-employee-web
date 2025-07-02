import { Component } from '@angular/core';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SessionService } from 'src/app/shared/services/session.service';
import { Router } from '@angular/router';
import { EmployeeService } from '../employee.service';
import decode from 'jwt-decode';
import { ToastrService } from 'ngx-toastr';
import { EncrypterService } from 'src/app/shared/services/encrypter.service';
import { environment } from 'src/environments/environment';
import { BusinesSettingsService } from '../../business-settings/business-settings.service';
import { PayoutService } from '../../payout/payout.service';

declare var $: any;

@Component({
  selector: 'app-single-employee',
  templateUrl: './single-employee.component.html',
  styleUrls: ['./single-employee.component.css'],
})
export class SingleEmployeeComponent {
  employee_form!: FormGroup;
  postData: any;
  showSidebar: boolean = true;
  token: any = '';
  submitted: boolean = false;
  employeeDetails: any = '';
  product_type_array: any[];
  product_type: any;
  product_type_text: any;
  show_product_type_dropdown: boolean = false;
  tp_account_id: string = '';
  company_name: string = '';
  masterJobType: any=[];
  loader: boolean=false;

  constructor(
    private _formBuilder: FormBuilder,
    private _EmployeeService: EmployeeService,
    private toastr: ToastrService,
    private _SessionService: SessionService,
    private router: Router,
    private _encrypterService: EncrypterService,
    private payOutService : PayoutService
  ) { }

  ngOnInit() {


    if (this._SessionService.check_user_session()) {
      let session_obj: any = localStorage.getItem('activeUser');
      this.token = decode(JSON.parse(session_obj).token);

      this.tp_account_id = this.token.tp_account_id;
      this.product_type = localStorage.getItem('product_type');

      

    } else {
      this.router.navigateByUrl('/login');
    }

    this.product_type = localStorage.getItem('product_type');

    this.product_type_text = this.product_type == '1' ? 'Social Security' : this.product_type == '2' ? 'Payrolling' : '';
    this.product_type_array = [];
    if (this.token['product_type'] == '1,2') {
      this.show_product_type_dropdown = true;
      this.product_type_array.push({ 'product_type_id': '1', 'product_type': 'Social Security' });
      this.product_type_array.push({ 'product_type_id': '2', 'product_type': 'Payrolling' });
    }
    if (this.token['product_type'] == '1') {
      this.product_type_array.push({ 'product_type_id': '1', 'product_type': 'Social Security' });

    }
    if (this.token['product_type'] == '2') {
      this.product_type_array.push({ 'product_type_id': '2', 'product_type': 'Payrolling' });
    }


    this.employee_form = this._formBuilder.group({
      product_type: [this.product_type, [Validators.required]],
      employee_name: ['', [Validators.required]],
      employee_mobile: [
        '',
        [
          Validators.required,
          Validators.pattern('^[6-9]{1}[0-9]{9}$'),
          Validators.minLength(10),
          Validators.maxLength(10),
        ],
      ],
      employee_email: [
        '',
        [
          Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-z]{2,4}$'),
        ],
      ],
      is_associate_notify_req: ['Y'],
      category_cd : ['',[Validators.required]]
    });
    this.getMasterJobRole();
  }

  get ef() {
    return this.employee_form.controls;
  }


  toggle() {
    this.showSidebar = !this.showSidebar;
  }

  getMasterJobRole(){
    this.payOutService.GetMaster({actionType :'MasterJobTypes',productTypeId : this.product_type}).subscribe((resData:any)=>{
      if(resData.statusCode){
        this.masterJobType = (resData.commonData);
      }
    })
  }
  
  save_emp(): any {
    // add_new_employee
    this.loader = true;
    if (this.employee_form.invalid) {
      this.submitted = true;
      return this.toastr.error("Invalid Form Input", "Oops!");
    }

    let postData = [{
      'productTypeId': this._encrypterService.aesEncrypt(this.product_type),
      'customerAccountId': this._encrypterService.aesEncrypt(this.tp_account_id.toString()),
      'empEmail': '',
      'empMobile': this.employee_form.value.employee_mobile,
      'aadharCardNo': '',
      'panCardNo': '',
      'bankAccountNo': '',
      'orgEmpCode': '',
    }]
    
    this._EmployeeService.checkUniqueDetails({
      'productTypeId': this._encrypterService.aesEncrypt(this.product_type),
      'customerAccountId': this._encrypterService.aesEncrypt(this.tp_account_id.toString()), 'encrypted': postData
    }).subscribe((resData: any): any => {
      if (resData.statusCode) {
        let data = JSON.parse(this._encrypterService.aesDecrypt(resData.commonData));
        if(data[0].empMobileStatus){
          let postData1 = {
            ...this.employee_form.value,
            'employer_leadid': this.token.tp_lead_id.toString(),
            'customeraccountid': this.token.tp_account_id.toString(),
            'employer_id': this.token.id.toString(),
            'geoFenceId': this.token.geo_location_id.toString(),
            'ouIds': this.token.ouIds.toString(),
            'subEmpId': this.token.sub_userid!=undefined ?this.token.sub_userid.toString():null,
            'is_hub_left':'Y'
          };
          this._EmployeeService
            .add_new_employee(postData1)
            .subscribe((resData: any) => {
              // console.log(resData);
              if (resData.statusCode) {
                this.toastr.success(resData.message, 'Success');
                $('#personal_info').hide("slow")
                let encr_str = this._encrypterService.aesEncrypt(this.ef['employee_mobile'].value)
                this._EmployeeService.verify_emp_mobile({
                  'emp_mobile': encr_str,
                  'emp_secret_key': 'L0MIewmxbN+zB/1aThhVXEEVRInhqzZ6Br67OOWNaKBwDwXxYQ7yBmjrU0wJuIq9'
                }).subscribe((resData1: any) => {
                  if (resData.statusCode) {
      
                    // environment.production && 
                    if (this.employee_form.get('is_associate_notify_req').value == 'Y') {
                      this._EmployeeService
                        .send_sms_employee({
                          employee_mobile: this.ef.employee_mobile.value,
                          action_type: 'add_employee',
                          employee_name: this.ef.employee_name.value,
                          company_name: this.company_name,
                        })
                        .subscribe((resData2: any) => {
                        //  console.log(resData2);
                          // this.toastr.success(
                          //   'New Employee Added and Notification has been sent to Employee Mobile Number',
                          //   'Success'
                          // );
                        });
                    }
      
      
                    let emp_data = resData1.commonData;
                    this.loader= false;
                    let id = emp_data.emp_id + ',' + emp_data.js_id + ',' + emp_data.ecStatus;
                    this.router.navigate(['employees/view-employee-detail', this._encrypterService.aesEncrypt(id.toString())]);
                  } else {
                    this.loader= false;
                    this.toastr.error(resData1.message);
                  }
                })
              }
              else {
                this.loader= false;
                this.toastr.error(resData.message, 'Error');
              }
            });
        }else{
          this.loader= false;
          return this.toastr.error(data[0].empMobileMsg)
        }
      }
    })
  }

}
