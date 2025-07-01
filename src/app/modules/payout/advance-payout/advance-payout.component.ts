import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import decode from 'jwt-decode';
import { EncrypterService } from 'src/app/shared/services/encrypter.service';
import { SessionService } from 'src/app/shared/services/session.service';
import { EmployeeService } from '../../employee/employee.service';
import { PayoutService } from '../payout.service';

@Component({
  selector: 'app-advance-payout',
  templateUrl: './advance-payout.component.html',
  styleUrls: ['./advance-payout.component.css']
})
export class AdvancePayoutComponent {
  showSidebar: boolean = true;
  id: any;
  product_type: any;
  voucher_data: any = [];
  voucher_json_data: any = [];
  selectedPayoutType: string = 'All';
  tp_account_id: any = '';

  constructor(
    private _EncrypterService: EncrypterService,
    private _SessionService: SessionService,
    private _EmployeeService: EmployeeService,
    private router: ActivatedRoute,
    private _PayoutService: PayoutService,
    public toastr: ToastrService
  ) {
    this.router.params.subscribe((params: any) => {
      this.id = params['id'];
    });
  }

  ngOnInit() {
    let session_obj_d: any = JSON.parse(
      this._SessionService.get_user_session());
    const token: any = decode(session_obj_d.token);
    this.tp_account_id = token.tp_account_id;
    this.product_type = token.product_type;

    this.VoucherDetails(this.id);
  }

  toggle() {
    this.showSidebar = !this.showSidebar;
  }

  VoucherDetails(id: any) {
    this._PayoutService.GetTpVoucherDetails({
      "customerAccountId": this.tp_account_id.toString(),
      "productTypeId": this.product_type
    })
      .subscribe((resData: any) => {
       // console.log(resData);
        if (resData.statusCode) {
          this.voucher_data = this._EncrypterService.aesDecrypt(resData.commonData);
          this.voucher_json_data = JSON.parse(this.voucher_data);
          //console.log(this.voucher_json_data);

          // this.toastr.success(resData.message, 'Success');
        }
        else {
          this.voucher_json_data = [];
          this.toastr.error(resData.message, 'Error');
        }

      });
  }
}
