import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { EncrypterService } from 'src/app/shared/services/encrypter.service';
import { SessionService } from 'src/app/shared/services/session.service';
declare var $: any;
import decode from 'jwt-decode';
import { Router } from '@angular/router';
import { ApprovalsService } from '../approvals.service';
import { MasterServiceService } from 'src/app/shared/services/master-service.service';

@Component({
  selector: 'app-voucher',
  templateUrl: './voucher.component.html',
  styleUrls: ['./voucher.component.css']
})
export class VoucherComponent {

  showSidebar: boolean = true;
  month: any;
  
  data: any = [];
  year: any;
  check:any;
  mpr_month:any;
  mpr_year:any;
  mpr_emp_code:any;
  Voucher_form:FormGroup;
  selected_date: any;
  addRemoveHide: boolean = false;
  token: any = '';
  invKey: any = '';
  isSelected:boolean=false;
  filteredEmployees: any = [];
  tp_account_id: any;
  search_Type:any;
  p: number = 1;
  search_Keyword:any;
  product_type: any = '';
  parent_data:any;
  searchEmployeeName: string = '';
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
  selectedReports: any[] = [];
  yearsArray: any = [];
  accessRights:any={};
  constructor(
    private _approvalsService: ApprovalsService,
    private toastr: ToastrService,
    private _sessionService: SessionService,
    private _masterService: MasterServiceService,
    private _formBuilder: FormBuilder,
    private router: Router
  ) { }
  ngOnInit() {
    let session_obj_d: any = JSON.parse(
      this._sessionService.get_user_session());
    this.token = decode(session_obj_d.token);
    this.tp_account_id = this.token.tp_account_id;
    this.product_type = localStorage.getItem('product_type');

    const date = new Date();
    let currentMonth = date.getMonth();
    let currentYear = date.getFullYear();

    for (let i = 2021; i <= currentYear + 1; i++) {
      this.yearsArray.push(i);

    };
    if (localStorage.getItem('selected_date') == null) {
      let prev_month;
      let prev_year;

      if (currentMonth === 0) {
        prev_month = 12;
        prev_year = currentYear - 1;
      } else {
        prev_month = currentMonth;
        prev_year = currentYear;
      }

      let prev_monthdate = new Date(prev_year, prev_month, 0).getDate() + '-' + prev_month + '-' + prev_year;
      localStorage.setItem('selected_date', prev_monthdate);

    }
    this.selected_date = localStorage.getItem('selected_date');

    this.month = this.selected_date.split('-')[1];
    this.year = this.selected_date.split('-')[2];

    this.parent_data = {
      'year': this.year,
      'month': this.month,
    };

    this.Voucher_form = this._formBuilder.group({
      searchKeyword: [''],
      searchType:['All']
    });
    // localStorage.setItem('activeTab', 'id_Vouchers');
    this.accessRights=this._masterService.checkAccessRights('/approval/voucher');
    //console.log(this.accessRights);
    this.Canditate_Details_For_Voucher();
  }

  toggle() {
    this.showSidebar = !this.showSidebar;
  }
  add_voucher_type(){
    this.router.navigate(['/approval/master_voucher_type']);
  }

  checkAll(event: any) {
    const isChecked = event.target.checked;
    this.data.forEach(row => (row.isSelected = isChecked));
    
    this.selectedReports = this.getSelectedReports();
  }
  onRowCheckboxChange(report: any) {
   if( report.isSelected ){// Toggle the isSelected property
    this.selectedReports = this.getSelectedReports(); // Update the selectedReports array
    // const copiedReport = { ...report };
    // this.selectedReports.push(copiedReport);
    // console.log(this.selectedReports);
    
  }
  else {
    // If the checkbox is unchecked, remove the report from the selectedReports array
    const index = this.selectedReports.findIndex(r => r.emp_code === report.emp_code);
    if (index !== -1) {
      this.selectedReports.splice(index, 1);
    }
    // console.log(this.selectedReports);
    
  }
}
  
  Hideshow_Emp(val: any) {
    if (val == 1) {
      this.addRemoveHide = true;
    }
    else {
      this.addRemoveHide = false;
    }
  }

  checkAllCheckBox(ev: any) { 
		this.data.forEach(x => x.checked = ev.target.checked)
	}

	isAllCheckBoxChecked() {
		return this.data.every(p => p.checked);
	}

  showAlert() {
    if (this.isColumnCheckBoxChecked() || this.AllCheckBoxChecked()) {
      if (this.selectedReports.length > 0) {
        let selectedRowsParams;
        if (this.selectedReports.length === 1) {
          // If only one checkbox is checked, send parameters for that row only
          const report = this.selectedReports[0];
          const mob = report.mobile;
          const dob = report.dateofbirth;
          const empCode = report.emp_code;
          const empName = report.emp_name;
          const empCodeConcatenated = mob + 'CJHUB' + empCode + 'CJHUB' + dob;
  
          selectedRowsParams = [{
            mprmonth: report.mprmonth,
            mpryear: report.mpryear,
            emp_Code: empCodeConcatenated,
            emp_name: empName,
            check_box_count: 1, // Only one checkbox is checked
            only_emp_code: empCode
          }];
          
          // console.log(selectedRowsParams);
          
        }  else {
          // If multiple checkboxes are checked, send parameters for all selected rows
          selectedRowsParams = this.selectedReports.map(report => {
            const mob = report.mobile;
            const dob = report.dateofbirth;
            const empCode = report.emp_code;
            const empName = report.emp_name;
            const empCodeConcatenated = mob + 'CJHUB' + empCode + 'CJHUB' + dob;
  
            return {
              mprmonth: report.mprmonth,
              mpryear: report.mpryear,
              emp_Code: empCodeConcatenated,
              emp_name: empName,
              check_box_count: this.selectedReports.length,
              only_emp_code: empCode
            };
          });
        }
  
        // Send array of parameters with navigation
        this.router.navigate(['/approval/voucher/add-new-voucher'], {
          state: { selectedRowsParams: selectedRowsParams }
        });
      }
    } else {
      alert('Please select at least one employee to proceed.');
      this.router.navigate(['/approval/voucher']);
    }
  }
  
  
  search(key: any) {
    let invKey = key.target.value;
    this.p = 1;
    this.filteredEmployees = this.data.filter(function (element: any) {
      
      return element.emp_name.toLowerCase().includes(invKey.toLowerCase())||
      element.emp_code.toString().toLowerCase().includes(invKey.toLowerCase())||
      element.orgempcode.toString().toLowerCase().includes(invKey.toLowerCase())
      
    });
   
  }

  isColumnCheckBoxChecked() {
    // Check if at least one row's checkbox in the column is checked
    return this.data.some(row => row.isSelected);
  }
  getSelectedReports() {
    // Return an array of selected reports
    return this.data.filter(row => row.isSelected);
  }
  
  
  AllCheckBoxChecked() {
    // Check if all checkboxes are checked
    return this.data.every(row => row.isSelected);
  }
  

  getCheckedCheckboxCount() {
    return this.data.filter(report => report.isSelected).length;
  }
  
  
  changeMonth(e: any) {
    this.month = e.target.value;
    let date = new Date(this.year, this.month, 0).getDate() + '-' + this.month + '-' + this.year;
    this.selected_date = date;
    localStorage.setItem('selected_date', date);
    this.Canditate_Details_For_Voucher();
  }

  changeYear(e: any) {
    this.year = e.target.value;
    let date = new Date(this.year, this.month, 0).getDate() + '-' + this.month + '-' + this.year;
    this.selected_date = date;
    localStorage.setItem('selected_date', date);
    this.Canditate_Details_For_Voucher();
  }


  voucher_report(){
    this.router.navigate(['/approval/voucher_report']);
  }
  // CanditateDetailsForVoucher
  Canditate_Details_For_Voucher() {
    this.search_Type=this.Voucher_form.get('searchType').value;
    this.search_Keyword=this.Voucher_form.get('searchKeyword').value;
  
    this._approvalsService.CanditateDetailsForVoucher({
      "productTypeId": this.product_type,
      "customerAccountId":this.tp_account_id.toString(),
      "searchKeyword":this.search_Keyword,
      "searchType":this.search_Type,
      "year":this.year,
      "month":this.month

    }).subscribe((resData: any) => {
      // console.log(resData);
      if (resData.statusCode) {
        this.data = resData.commonData;
        this.filteredEmployees = this.data;

      } else {
        this.filteredEmployees = [];
      }
    });
  }

}
