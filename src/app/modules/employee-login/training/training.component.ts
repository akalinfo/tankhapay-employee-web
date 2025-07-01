import { Component,Input } from '@angular/core';
import {EmployeeLoginService} from '../employee-login.service';
import { EncrypterService } from 'src/app/shared/services/encrypter.service';
import { ToastrService } from 'ngx-toastr';
import { SessionService } from 'src/app/shared/services/session.service';
import jwtDecode from 'jwt-decode';

@Component({
  selector: 'app-training',
  templateUrl: './training.component.html',
  styleUrls: ['./training.component.css']
})
export class TrainingComponent {
  @Input() empDataFromParent: any;
  emp_code :any;
  employeeTrainingRecords :any=[];
  decoded_token: any;
  tp_account_id:any;
  product_type:any;

  constructor(
    private _employeeLoginService : EmployeeLoginService,
    private _encrypterService : EncrypterService,
    private toastr : ToastrService,
    private _sessionService : SessionService,
  ){}

  ngOnInit(){
     let session_obj: any = JSON.parse(this._sessionService.get_user_session());
    this.decoded_token = jwtDecode(session_obj.token);
    this.tp_account_id = this.decoded_token.tp_account_id;
    this.product_type = localStorage.getItem('product_type');
    this.emp_code= this.empDataFromParent.emp_code;
    this.getCalenderRecordsByEmployee();
  }

  getCalenderRecordsByEmployee(){
    this._employeeLoginService.getCalenderRecordsByEmployee({
      "action": "tnd_list",
      "customerAccountId":  this.tp_account_id.toString(),
      "empCode": this.emp_code,
      "trainingId": "",
      "fromDt": "",
      "toDt": "",
      "productTypeId": this.product_type
    }).subscribe((resData:any)=>{
      if(resData.statusCode){
        this.employeeTrainingRecords = JSON.parse(this._encrypterService.aesDecrypt(resData.commonData));
        console.log(this.employeeTrainingRecords)
      }else{
        this.employeeTrainingRecords=[];
      }
    })
  }
}
