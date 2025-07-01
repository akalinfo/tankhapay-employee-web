import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { FilterField } from './filter.model';
import { BusinesSettingsService } from '../../business-settings/business-settings.service';
import { SessionService } from 'src/app/shared/services/session.service';
import decode from 'jwt-decode';
import { ToastrService } from 'ngx-toastr';
import { ReportService } from '../report.service';

@Component({
  selector: 'app-common-filter',
  templateUrl: './common-filter.component.html',
  styleUrls: ['./common-filter.component.css']
})
export class CommonFilterComponent {
  @Input() sidebarWidth : string ='0';
  @Input() filters: FilterField[] = [];
  @Output() filterChanged = new EventEmitter<any>();
  appliedFilters :any={
    month : '',
    year : '',
    invKey : '',
    departmentId : [],
    designationId : [],
    unitId : [],
    selectedStatus : 'All',
    radioBtnVal : 'DisbursementDetails'
  };
  dropdownSettings :any={};
  dropdownSettings_department: any={};
  dropdownSettings_designation:any={};
  unit_master_list_data : any=[];
  department_master_list_data:  any=[];
  role_master_list_data:any=[];
  selectedUnitId :any=[];
  selectedDepartmentId :any=[];
  selectedDesignationId :any=[];
  selectedStatus : any='All';
  
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

  yearsArray : any=[];
  invKey: string ='';

  filterValues: { [key: string]: any } = {};
  selected_date: any;
  month: any;
  year: any;
  tp_account_id: any;
  product_type: any;
  @Input() extraFilters : any=[];
  @Input() isSideBar;

  constructor(
    private _BusinesSettingsService: BusinesSettingsService,
    private _sessionService: SessionService,
    private toastr : ToastrService,
    private _ReportService : ReportService
  ){
    const date = new Date();
    let currentMonth = date.getMonth() + 1; // getMonth() returns 0-11, so add 1
    let currentYear = date.getFullYear();
    for (let i = 2022; i <= currentYear + 1; i++) {
      this.yearsArray.push(i);

    };
    let currentDate = localStorage.getItem('selected_date') || null;
    if (currentDate) {
      this.month = currentDate.split('-')[1];
      this.year = currentDate.split('-')[2];
      // console.log("A",this.month,this.year);
    } else {
      this.month = currentMonth.toString();
      this.year = currentYear.toString();
      // console.log("B",this.month,this.year);
    }
    this.appliedFilters.month = this.month;
    this.appliedFilters.year = this.year;

  }

  ngOnInit(){
    console.log(this.isSideBar);
    
      let session_obj_d: any = JSON.parse(
      this._sessionService.get_user_session());
      let token :any= decode(session_obj_d.token);
      this.tp_account_id = token.tp_account_id;
      this.product_type = localStorage.getItem('product_type');
      this.dropdownSettings = {
        singleSelection: false,
        idField: 'unitid',
        textField: 'unitname',
        selectAllText: 'Select All',
        unSelectAllText: 'Unselect All',
        allowSearchFilter: true,
        enableCheckAll: true,
        itemsShowLimit: 5,
      };    
      this.dropdownSettings_department = {
        singleSelection: false,
        idField: 'posting_department',
        textField: 'posting_department',
        selectAllText: 'Select All',
        unSelectAllText: 'Unselect All',
        allowSearchFilter: true,
        enableCheckAll: true,
        itemsShowLimit: 5,
      };
      this.dropdownSettings_designation = {
        singleSelection: false,         // Allow multiple selections
        idField: 'post_offered',        // Field to bind as the ID
        textField: 'post_offered',      // Field to bind as the display text
        selectAllText: 'Select All',
        unSelectAllText: 'Unselect All',
        itemsShowLimit: 5,              // Limit items displayed in the UI
        allowSearchFilter: true ,
        enableCheckAll: true,
      };

      this.get_geo_fencing_list();
      // this.get_att_unit_master_list();
      this.get_att_dept_master_list();
      this.get_att_role_master_list();
  }
  
  onFilterChange(key: string, value: any) {
    this.filterValues[key] = value;
    this.filterChanged.emit(this.filterValues);
  }

  search(key:any){

  }

  openSidebar() {
    this.sidebarWidth = '400px';  
    let body :HTMLElement = document.querySelector('body');
    body.classList.add('modal-open');
  }

  changeMonth(e: any) {
    this.appliedFilters.month = e.target.value;
    // console.log(e.target.value);
    this.month = e.target.value;
    let date = new Date(this.year, this.month, 0).getDate() + '-' + this.month + '-' + this.year;
    localStorage.setItem('selected_date', date);
    // this.loading=true;
    // this.LiabilityReport();
  }

  changeYear(e: any) {
    this.appliedFilters.year = e.target.value;
    // console.log(this.year);
    this.year = e.target.value;
    let date = new Date(this.year, this.month, 0).getDate() + '-' + this.month + '-' + this.year;
    // this.selected_date = date;
    localStorage.setItem('selected_date', date);
    // this.loading=true;
    // this.LiabilityReport();
  }

  apply_extra_filter(){
    this.appliedFilters.invKey = this.invKey;
    this.appliedFilters.unitId =this.selectedUnitId;
    this.appliedFilters.departmentId = this.selectedDepartmentId;
    this.appliedFilters.designationId = this.selectedDesignationId;
    this.appliedFilters.selectedStatus = this.selectedStatus;
    this.Apply_new_filter();
  }
  Apply_new_filter(){
    this.filterChanged.emit(this.appliedFilters);
    this.closeSidebar();
  }

  closeSidebar(){
    this.sidebarWidth ='0';
    let body :HTMLElement = document.querySelector('body');
    body.classList.remove('modal-open');
  }

  reset(){
    this.invKey ='';
    this.selectedUnitId=[];
    this.selectedDepartmentId =[];
    this.selectedDesignationId=[];
  }

  onRadioChange(event: any){
    this.appliedFilters.radioBtnVal = event.target.value;
    this.filterChanged.emit(this.appliedFilters);
  }

  get_geo_fencing_list() {
    this._BusinesSettingsService.GetGeoFencing_List({
      "customerAccountId": (this.tp_account_id).toString(),
      "action": "GetAllOUsForCustomer",
      "searchKeyword": ''
    }).subscribe((resData: any) => {
      let geo_fencing_list_data = [];
      if (resData.statusCode) {
        if (resData.commonData == null) {
          this.toastr.info('No data found', '');
          geo_fencing_list_data = [];
          return;
        }
        geo_fencing_list_data = resData.commonData;
        // console.log(this.geo_fencing_list_data);
  
        for (let index = 0; index < geo_fencing_list_data.length; index++) {
          const element = geo_fencing_list_data[index];
          if (element.emp_codes) {
            geo_fencing_list_data[index].emp_codes = element.emp_codes ? element.emp_codes.replace(/}/g, '').replace(/{/g, '') : '';
          }
        }
        // this.geo_fencing_list_data_count = this.geo_fencing_list_data.length;
  
        // Update unit_master_list_data with the org_unit_name for the dropdown
        this.unit_master_list_data = geo_fencing_list_data.map(item => ({
          unitname: item.org_unit_name,  // Use org_unit_name for unitname
          unitid: item.id                // Keep the ID for later use if needed
        }));
      } else {
        // this.geo_fencing_list_data_count = 0;
      }
    }, (error: any) => {
      // this.geo_fencing_list_data_count = 0;
    });
  }

  get_att_dept_master_list() {
    this._ReportService.GetMaster_Dropdown({
      "actionType": "GetPostingDepartments",
      "productTypeId": this.product_type,
      "customerAccountId": this.tp_account_id.toString(),
    }).subscribe((resData: any) => {
      if (resData.statusCode) {
        this.department_master_list_data = resData.commonData.map(department => ({
          posting_department: department.posting_department
        }));
  
        // Add 'All' if not already present
        if (!this.department_master_list_data.some(dept => dept.posting_department === 'All')) {
          // this.department_master_list_data.unshift({ posting_department: 'All' });
        }
      } else {
        this.department_master_list_data = [];
        console.log(resData.message);
      }
    });
  }
  
  get_att_role_master_list() {
    this._ReportService.GetMaster_Dropdown({
      "actionType": "GetMasterPostOffered",
      "productTypeId": this.product_type,
      "customerAccountId": this.tp_account_id.toString(),
    }).subscribe((resData: any) => {
      if (resData.statusCode) {
        this.role_master_list_data = resData.commonData.map(role => ({
          post_offered: role.post_offered
        }));
  
        // Add "All" option if it doesn't already exist
        if (!this.role_master_list_data.some(role => role.post_offered === 'All')) {
          // this.role_master_list_data.unshift({ post_offered: 'All' });
        }
      } else {
        this.role_master_list_data = [];
        console.log(resData.message);
      }
    });
  }
}
