import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EncrypterService } from 'src/app/shared/services/encrypter.service';
import { VisitorService } from '../visitor.service';
import { SessionService } from 'src/app/shared/services/session.service';
import { EmployeeService } from '../../employee/employee.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import decode from 'jwt-decode';

@Component({
  selector: 'app-new-card',
  templateUrl: './new-card.component.html',
  styleUrls: ['./new-card.component.css']
})
export class NewCardComponent {

  showSidebar: boolean=true;
  card_Form : FormGroup;
  token: any;
  tp_account_id: any;
  product_type: any;
  dynamic_visitor_card: any=[];

  constructor(
    private _formBuilder: FormBuilder,
    private _EncrypterService: EncrypterService,
    private _SessionService: SessionService,
    private _VisitorService: VisitorService,
    private _EmployeeService: EmployeeService,
    private toastr: ToastrService,
    private router: Router
  ){

  }

  ngOnInit(){
    let session_obj_d: any = JSON.parse(this._SessionService.get_user_session());
    this.token = decode(session_obj_d.token);
    this.tp_account_id = this.token.tp_account_id;
    this.product_type = this.token.product_type;

    this.card_Form = this._formBuilder.group({
      card_name: ['', [Validators.required]],
      card_type: ['', [Validators.required]],
      remarks: ['', [Validators.required]],
    });
  }

  Save_visitor_card(){
    this._VisitorService.save_visitor_card({
      "p_action": "save_visitor_card",
      "card_name": this.card_Form.get('card_name')?.value,
      "card_type":this.card_Form.get('card_type')?.value || '',
      "remarks": this.card_Form.get('remarks')?.value || '',
      "p_userby": this.tp_account_id?.toString(),
      "p_customeraccountid": this.tp_account_id?.toString(),
    }).subscribe((resData: any) => {
      // console.log(resData);
      if (resData.status) {
  
        this.dynamic_visitor_card = resData.commonData;
        this.toastr.success(resData.message);
        this.card_Form.reset();
        // this.router.navigate(['/visitor/all_visitor']);
      
      } else {
        this.dynamic_visitor_card = [];
        this.toastr.error(resData.message)
      }
    });
  
  }


}
