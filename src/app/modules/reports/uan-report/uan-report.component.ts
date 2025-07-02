import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import jwtDecode from 'jwt-decode';
import { ToastrService } from 'ngx-toastr';
import { SessionService } from 'src/app/shared/services/session.service';
import { VisitorService } from '../../visitor/visitor.service';
import { ReportService } from '../report.service';

@Component({
  selector: 'app-uan-report',
  templateUrl: './uan-report.component.html',
  styleUrls: ['./uan-report.component.css']
})
export class UanReportComponent {
  showSidebar: boolean = false;
  tp_account_id: any;
  message:any;
  filteredEmployees:any=[];
  submit_uan_data:any=[];
  uan_data:any=[];
  data:any=[];
  decoded_token:any;
  currentDate: any;
  filterStatus:any='NG';
  p: number = 1;
  currentDateString: any;
  visitor_list_data:any=[];
  employer_name: any = '';
  UAN_Form:FormGroup;
  header_checkbox: boolean = false;

  constructor(
    private _VisitorService: VisitorService,
    private toastr: ToastrService,
    private _sessionService: SessionService,
    private router: Router,
    private _ReportService:ReportService,
    private _formBuilder: FormBuilder,
  ) {
    this.currentDate = new Date();
    this.currentDateString = this.currentDate.toString().slice(0, -30);
   }

  
  ngOnInit() {
    let session_obj: any = JSON.parse(this._sessionService.get_user_session());
     this.decoded_token = jwtDecode(session_obj.token);
    this.tp_account_id = this.decoded_token.tp_account_id;
    this.employer_name = this.decoded_token.name;
    // console.log(decoded_token);

    this.UAN_Form = this._formBuilder.group({
      filterStatus:['NG',[Validators.required]]
    });

    this.UAN_Report('NG');
  }

  toggle() {
    this.showSidebar = !this.showSidebar;
  }
  onRadioChange(filter:any) {
    this.filterStatus=filter.target.value;
    this.UAN_Report(this.filterStatus);
  }

  search(key: any) {
    let invKey = key.target.value;
    this.p = 0;
    this.filteredEmployees = this.uan_data.filter(function (element: any) {
      
      return element.orgempcode.toLowerCase().includes(invKey.toLowerCase())||
      element.tpcode.toLowerCase().includes(invKey.toLowerCase())||
      element.emp_name.toString().toLowerCase().includes(invKey.toLowerCase())||
      element.mobile.toString().toLowerCase().includes(invKey.toLowerCase())||
      element.uannumber.toString().toLowerCase().includes(invKey.toLowerCase())
    });
   
  }

  selectAll(event: any) {
    this.header_checkbox = event.target.checked;
  
    if (this.header_checkbox) {
      // Select all rows based on a condition (e.g., status === 'pending')
      this.uan_data.forEach(row => row.isSelected = true);
    } else {
      // Deselect all rows
      this.uan_data.forEach(row => row.isSelected = false);
    }
  }

  onCheckbox_Change(event: any, row: any, index: any) {
    row.isSelected = event.target.checked;
    // Check if all rows are selected or not
    this.header_checkbox = this.uan_data.every(row => row.isSelected);
  }

  isAnyCheckboxChecked(): boolean {
    return this.header_checkbox || this.uan_data.some(row => row.isSelected);
  }  

  UAN_Report(Filterstatus:any){
    this._ReportService.complianceFlagReportForBusiness({
      "compliancesFlag": "EPF",
      "filterStatus":Filterstatus,
      "customerAccountId": this.tp_account_id.toString(),
      "orgUnitId": this.decoded_token.geo_location_id?.toString() 
    }).subscribe((resData: any) => {
      //console.log(resData);
      if (resData.statusCode) {
        this.uan_data =resData.commonData; 
        this.filteredEmployees = this.uan_data;

      } else {
        this.filteredEmployees = [];
        this.uan_data=[];
        this.toastr.error(resData.message, 'Oops!');
      }
    });
  }

  confirmation(){
    this.message = window.confirm('Are you sure! You want to process selected records?.');
    // console.log(this.message);
    if(this.message){
      this.SubmitUan_ForBusiness();
    }
    else{
      window.close();
    }
  }

  SubmitUan_ForBusiness() {
    const checkedRows = this.uan_data.filter(row => row.isSelected);
    checkedRows.forEach(row => {
      this._ReportService.SubmitUanForBusiness({
        "empId": row.emp_id?.toString(),
        "empCode": row.emp_code?.toString(),
        "customerAccountId": this.tp_account_id.toString(),
        "createdBy": this.tp_account_id.toString(),
        "uanNumber": row.Uan_number?.toString()
      }).subscribe((resData: any) => {
        if (resData.statusCode) {
          this.submit_uan_data = resData.commonData;
          this.UAN_Report(this.filterStatus);
          this.toastr.success(resData.message, 'Oops!');
        } else {
          this.submit_uan_data = [];
          this.toastr.error(resData.message, 'Oops!');
        }
      });
    });
  }
  
}
