import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { EncrypterService } from 'src/app/shared/services/encrypter.service';
import { SessionService } from 'src/app/shared/services/session.service';
import { EmployeeService } from '../../employee/employee.service';
import { PayoutService } from '../payout.service';
import decode from 'jwt-decode';
@Component({
  selector: 'app-make-payments',
  templateUrl: './make-payments.component.html',
  styleUrls: ['./make-payments.component.css']
})
export class MakePaymentsComponent {

  showSidebar: boolean = true;
  product_type: any;
  tp_account_id: any = '';
  payout_data: any = [];
  payout_json_data:any = [];
  payout_json_detail_data:any = [];
  payout_detail:any =[];
  detail:any=[];
  month: any;
  yearsArray: any = [];
  summary:any =[];
  year: any;
  voucher_data:any=[];
  voucher_json_data:any=[];
  selectedPayoutType: string = 'All';
  monthsArray: any = [
    {
      'id': '1',
      'month': 'January',
    },
    {
      'id': '2',
      'month': 'February',
    },
    {
      'id': '3',
      'month': 'March',
    },
    {
      'id': '4',
      'month': 'April',
    },
    {
      'id': '5',
      'month': 'May',
    },
    {
      'id': '6',
      'month': 'June',
    },
    {
      'id': '7',
      'month': 'July',
    },
    {
      'id': '8',
      'month': 'August',
    },
    {
      'id': '9',
      'month': 'September',
    },
    {
      'id': '10',
      'month': 'October',
    },
    {
      'id': '11',
      'month': 'November',
    },
    {
      'id': '12',
      'month': 'December',
    }
  ];
  id:any;

constructor(
  private _EncrypterService: EncrypterService,
  private _SessionService: SessionService,
  private _EmployeeService: EmployeeService,
  private router: ActivatedRoute,
  private _PayoutService: PayoutService,
  public toastr: ToastrService
){
  this.router.params.subscribe((params: any) => {
    this.id = params['id'];
    });
}

ngOnInit(){
  let session_obj_d: any = JSON.parse(
    this._SessionService.get_user_session());
  const token: any = decode(session_obj_d.token);
  this.tp_account_id = token.tp_account_id;
  this.product_type = token.product_type;
  const date = new Date();
  let currentYear = date.getFullYear()
  this.yearsArray.push(currentYear - 1)
  this.yearsArray.push(currentYear)
  this.yearsArray.push(currentYear + 1)

  this.month = date.getMonth();
  this.year = currentYear;
  this.PayoutDetails();
  // this.VoucherDetails(this.id);
}

  toggle() {
    this.showSidebar = !this.showSidebar;
  }

  changeMonth(e: any) {
    // console.log(e.target.value);
    this.month = e.target.value;
    this.PayoutDetails();
    
  }

  changeYear(e: any) {
    // console.log(this.year);
    this.year = e.target.value;
    this.PayoutDetails();

  }

  changeProductType(e: any) {
    this.product_type = e.target.value;
    localStorage.setItem('product_type', this.product_type);
    this.PayoutDetails();
  }
  
  PayoutDetails() {
    this._PayoutService
    .CustomerPayoutDetails({
      "customeraccountid": this.tp_account_id.toString(),
        "payouttype": this.selectedPayoutType,
        "month": this.month.toString(),
        "year": this.year.toString(),
        "productTypeId": this.product_type
    })
    .subscribe((resData: any) => {
      
      if(resData.statusCode){

        this.payout_detail = this._EncrypterService.aesDecrypt(resData.commonData);
        this.payout_json_detail_data = JSON.parse(this.payout_detail);
        this.summary = this.payout_json_detail_data.customerPayoutSummary;
        this.detail=this.payout_json_detail_data.customerPayoutDetails;
        // console.log(this.payout_json_detail_data);
        // console.log(this.detail);
        this.toastr.success(resData.message, 'Success');
      }

      else{
        this.payout_json_detail_data=[];
        this.toastr.error(resData.message, 'Error');
      }
      
    });
  }


}
