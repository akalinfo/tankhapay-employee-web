import { Component, Input, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { dongleState, grooveState } from 'src/app/app.animation';
import { EmployeeManagementService } from '../employee-management.service';
import { SessionService } from 'src/app/shared/services/session.service';
import jwtDecode from 'jwt-decode';
import { ToastrService } from 'ngx-toastr';

declare var $: any;

@Component({
  selector: 'app-asset-details',
  templateUrl: './asset-details.component.html',
  styleUrls: ['./asset-details.component.css'],
  animations: [dongleState, grooveState],
})
export class AssetDetailsComponent {

  assignAssetForm: FormGroup;
  releaseAssetForm: FormGroup;
  showAssignForm: boolean = false;
  showRemoveConfirmReleaseModal: boolean = false;
  asset_category_data: any = [];
  tp_account_id: any;

  @ViewChild('ad1') assignDate1: any;
  // @ViewChild('ad2') assignDate2: any;
  @ViewChild('rd') releaseDate: any;
  @Input() empDataFromParent: any;

  decoded_token: any;
  p: any = 1;
  limit: any = 20;
  asset_location_data: any = [];
  asset_list_data: any = [];
  asset_search_keyword: any = '';
  selectedItems: any = [];
  dropdownSettings: any = {};
  timeoutId: any;
  asset_name_selected: any = '';
  assigned_assets_list_data: any = [];
  assigned_assets_list_data_filterCopy: any = [];
  remove_confirm_release_asset_title: any = '';
  search_asset_key: any = '';

  constructor(
    private _formBuilder: FormBuilder,
    private _employeeManagementService: EmployeeManagementService,
    private _sessionService: SessionService,
    private toastr: ToastrService,
  ) { }

  ngOnInit() {
    let session_obj = this._sessionService.get_user_session();
    let token = JSON.parse(session_obj).token;
    this.decoded_token = jwtDecode(token);
    this.tp_account_id = this.decoded_token.tp_account_id;

    this.assignAssetForm = this._formBuilder.group({
      assets_row_id: ['', [Validators.required]],
      asset_code: ['', [Validators.required]],
      assign_to_emp_code: [''],
      assigned_location: ['', [Validators.required]],
      assigned_date: [''],
      asset_txn_id: [''],
      remarks: ['', [Validators.required]],
    });

    this.releaseAssetForm = this._formBuilder.group({
      asset_txn_id: ['', [Validators.required]],
      emp_code: ['', [Validators.required]],
      release_date: [''],
      assigned_date: [''],
      category_name: [''],
      assigned_location: [''],
      remarks: ['', [Validators.required]],

      asset_name: [''],
      asset_code: [''],
    });

    this.dropdownSettings = {
      singleSelection: true,
      text: "Search",
      selectAllText: 'Select All',
      primaryKey: 'asset_row_id',
      labelKey: 'asset_name',
      unSelectAllText: 'UnSelect All',
      enableSearchFilter: true,
      classes: "myclass custom-class",
      lazyLoading: true,
      position: 'bottom',
      autoPosition: true,
    };

    // this.get_mst_tp_asset_catgeory();
    // this.get_mst_tp_asset_location();
    // this.get_asset_list();
    this.get_assigned_assets_list();
  }

  get_asset_list() {
    this.asset_list_data = [];

    this._employeeManagementService.get_asset_master({
      'action': 'get_asset_list',
      'account_id': this.tp_account_id,
      'pageindex': 0,
      'pagesize': 2000,
      'keyword': this.asset_search_keyword,

    }).subscribe({
      next: (resData: any) => {
        if (resData.statusCode) {
          this.asset_list_data = resData.data;
          // this.asset_list_data = this.asset_list_data.map(asset => ({
          //   ...asset,
          //   label: `${asset.asset_name} (${asset.asset_code})`
          // }));
          // console.log(this.asset_list_data);

        } else {
          this.toastr.error(resData.message, 'Oops!');
        }
      }, error: (e) => {
        console.log(e);
      }
    })
  }

  get_mst_tp_asset_catgeory() {
    this.asset_category_data = [];

    this._employeeManagementService.get_asset_master({
      'action': 'get_mst_tp_asset_catgeory',
      'account_id': this.tp_account_id,
    }).subscribe({
      next: (resData: any) => {
        if (resData.statusCode) {
          this.asset_category_data = resData.data;
        } else {

        }
      }, error: (e) => {
        console.log(e);
      }
    })
  }

  get_mst_tp_asset_location() {
    this.asset_location_data = [];

    this._employeeManagementService.get_asset_master({
      'action': 'get_mst_tp_asset_location',
      'account_id': this.tp_account_id,
    }).subscribe({
      next: (resData: any) => {
        if (resData.statusCode) {
          this.asset_location_data = resData.data;
        } else {

        }
      }, error: (e) => {
        console.log(e);
      }
    })
  }

  search_asset(key: any) {
    if (key != null && key != undefined && key != '') {
      // console.log(key);
      // this.search_asset_key = key;
      let searchkey = this.search_asset_key.toString().toLowerCase();
      this.p = 1;
      // this.p = 0;
      this.assigned_assets_list_data = this.assigned_assets_list_data_filterCopy.filter(function (element: any) {
        return (element?.asset_name?.toLowerCase().includes(searchkey)
          || element?.model_name?.toLowerCase().includes(searchkey)
          || element?.asset_code?.toLowerCase().includes(searchkey)
          || element?.device_serial_no?.toLowerCase().includes(searchkey)
        )
      });

    }
    else if (key == '') {
      this.assigned_assets_list_data = this.deepCopyArray(this.assigned_assets_list_data_filterCopy);
    }
  }

  get_assigned_assets_list() {
    this.assigned_assets_list_data = [];
    this.assigned_assets_list_data_filterCopy = [];

    this._employeeManagementService.get_assets({
      'action': 'get_assigned_assets_list',
      'account_id': this.tp_account_id.toString(),
      'emp_code': this.empDataFromParent.emp_code.toString(),
      'page_index': this.p - 1,
      'page_size': this.limit,
    }).subscribe({
      next: (resData: any) => {
        if (resData.statusCode) {
          this.assigned_assets_list_data = resData.commonData;
          this.assigned_assets_list_data_filterCopy = this.deepCopyArray(this.assigned_assets_list_data);
          this.search_asset(this.search_asset_key);
        } else {
          this.toastr.error(resData.message, 'Oops!');
        }
      }
    })
  }

  /**Assign Form**/
  openAssignForm() {
    this.get_asset_list();

    this.showAssignForm = true;
    $(function () {
      $('#assignDate1').datepicker({
        dateFormat: 'dd-mm-yy',
        changeMonth: true,
        changeYear: true,
      });
    });

  }

  closeAssignForm() {
    this.showAssignForm = false;
    this.selectedItems = [];
    this.asset_search_keyword = '';

    console.log('h')

    this.assignAssetForm.patchValue({
      assets_row_id: '',
      asset_code: '',
      assign_to_emp_code: '',
      assigned_location: '',
      assigned_date: '',
      remarks: '',
      asset_txn_id: '',
    });
  }

  saveAssignForm() {
    let data = this.assignAssetForm.value;
    let assignDate = this.assignDate1.nativeElement.value;
    console.log(data, assignDate);
    // return;

    if (!this.assignAssetForm.valid || !assignDate) {
      this.toastr.error('Please fill all the required fields', 'Oops!');
      return;
    }

    this._employeeManagementService.save_asset({
      'action': 'assign_asset_to_employee',
      'account_id': this.tp_account_id.toString(),
      'assets_row_id': data.assets_row_id,
      'asset_code': data.asset_code,
      'assign_to_emp_code': this.empDataFromParent.emp_code.toString(),
      'assigned_location': data.assigned_location,
      'assigned_date': assignDate,
      'remarks': data.remarks,
      'asset_txn_id': !data.asset_txn_id ? '' : data.asset_txn_id,
    }).subscribe({
      next: (resData: any) => {

        console.log(resData);
        if (resData.statusCode) {
              
          this.closeAssignForm();
          this.toastr.success(resData.message, 'Success');   
         
          setTimeout(() => {
            this.get_assigned_assets_list();
          }, 5000);
         
        } else {
          this.toastr.error(resData.message, 'Oops!')
        }
      }
    })

  }

  onSearch(e: any) {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    this.timeoutId = setTimeout(() => {
      // this.asset_search_keyword = e.target.value;
      this.get_asset_list();
    }, 1000)
  }

  onItemSelect(e: any) {
    // console.log(e);
    this.asset_name_selected = e.asset_name

    this.assignAssetForm.patchValue({
      assets_row_id: e.asset_row_id,
      asset_code: e.asset_code,
    })
  }

  onItemDeSelect(e: any) {
    this.assignAssetForm.patchValue({
      assets_row_id: '',
      asset_code: '',
    })
  }
  /**Assign Form**/


  /**Release Form**/
  openReleaseModal(data: any) {
    this.showRemoveConfirmReleaseModal = true;
    this.remove_confirm_release_asset_title = 'Release';

    setTimeout(() => {
      $(function () {
        // $('#assignDate2').datepicker({
        //   dateFormat: 'dd-mm-yy',
        //   changeMonth: true,
        //   changeYear: true,
        // });
        $('#release_date').datepicker({
          dateFormat: 'dd-mm-yy',
          changeMonth: true,
          changeYear: true,
        })

        // $('body').on('change', '#assignDate2', function () {
        //   $('#recdate').trigger('click');
        // })
        $('body').on('change', '#release_date', function () {
          $('#recdate').trigger('click');
        })

      });
    }, 500)

    // console.log(data);

    this.releaseAssetForm.patchValue({
      asset_txn_id: data.asset_txn_id,
      emp_code: data.emp_code,
      asset_name: data.asset_name,
      asset_code: data.asset_code,
      assigned_date: data.assigned_date,
      category_name: data.category_name,
      assigned_location: data.assigned_location,
      release_date: '',
    });
  }

  closeReleaseForm() {
    this.showRemoveConfirmReleaseModal = false;
    this.releaseAssetForm.patchValue({
      asset_txn_id: '',
      emp_code: '',
      release_date: '',
      remarks: '',
      asset_name: '',
      asset_code: '',
      assigned_date: '',
      category_name: '',
      assigned_location: '',
    });
  }

  saveReleaseForm() {
    let data = this.releaseAssetForm.value;
    // let assignDate = this.assignDate2.nativeElement.value;
    let releaseDate = this.releaseDate.nativeElement.value;
    console.log(data, releaseDate);
    // return;

    if (!this.releaseAssetForm.valid || !releaseDate) {
      this.toastr.error('Please fill all the required fields', 'Oops!');
      return;
    }

    this._employeeManagementService.release_asset({
      'action': 'release_assets_from_employee',
      'account_id': this.tp_account_id.toString(),
      'asset_txn_id': data.asset_txn_id,
      'emp_code': data.emp_code.toString(),
      'release_date': releaseDate,
      'remarks': data.remarks,

    }).subscribe({
      next: (resData: any) => {
        if (resData.statusCode) {
          this.toastr.success(resData.message, 'Success');
          this.closeReleaseForm();
          this.get_assigned_assets_list();
        } else {
          this.toastr.error(resData.message, 'Oops!')
        }
      }
    })
  }
  /**Release Form**/


  /**Remove Asset Before Confirm**/
  openRemoveAssetModal(data: any) {
    this.showRemoveConfirmReleaseModal = true;
    this.remove_confirm_release_asset_title = 'Remove';

    this.releaseAssetForm.patchValue({
      asset_txn_id: data.asset_txn_id,
      emp_code: data.emp_code,
      asset_name: data.asset_name,
      asset_code: data.asset_code,
      release_date: '',
    });
  }

  removeAsset() {
    let data = this.releaseAssetForm.value;
    console.log(data);
    // return;

    if (!this.releaseAssetForm.valid) {
      this.toastr.error('Please fill all the required fields', 'Oops!');
      return;
    }

    this._employeeManagementService.remove_asset({
      'action': 'remove_assigned_assest_before_confirm',
      'account_id': this.tp_account_id.toString(),
      'asset_txn_id': data.asset_txn_id,
      'emp_code': data.emp_code.toString(),
      'release_date': '',
      'remarks': data.remarks,
    }).subscribe({
      next: (resData: any) => {
        if (resData.statusCode) {
          this.toastr.success(resData.message, 'Success');
          this.closeReleaseForm();
          this.get_assigned_assets_list();
        } else {
          this.toastr.error(resData.message, 'Oops!');
        }
      }
    })
  }
  /**Remove Asset Before Confirm**/


  /**Confirm Asset**/
  openAssignConfirmModal(data: any) {
    this.showRemoveConfirmReleaseModal = true;
    this.remove_confirm_release_asset_title = 'Confirm';

    this.releaseAssetForm.patchValue({
      asset_txn_id: data.asset_txn_id,
      emp_code: data.emp_code,
      asset_name: data.asset_name,
      asset_code: data.asset_code,
      release_date: '',
    });
  }

  confirmAsset() {
    let data = this.releaseAssetForm.value;
    console.log(data);
    // return;

    if (!this.releaseAssetForm.valid) {
      this.toastr.error('Please fill all the required fields', 'Oops!');
      return;
    }

    this._employeeManagementService.confirm_asset({
      'action': 'assigned_assest_confirm',
      'account_id': this.tp_account_id.toString(),
      'asset_txn_id': data.asset_txn_id,
      'emp_code': data.emp_code.toString(),
      'release_date': '',
      'remarks': data.remarks,
    }).subscribe({
      next: (resData: any) => {
        if (resData.statusCode) {
          this.toastr.success(resData.message, 'Success');
          this.closeReleaseForm();
          this.get_assigned_assets_list();
        } else {
          this.toastr.error(resData.message, 'Oops!');
        }
      }
    })
  }
  /**Confirm Asset**/


  filterFromToDateLeads() {

    let assignDate = this.releaseAssetForm.value.assigned_date;
    let releaseDate = this.releaseDate.nativeElement.value;

    if (assignDate && releaseDate) {
      let split_assign_dt = assignDate.split("-", 3);
      let split_release_dt = releaseDate.split("-", 3);

      let join_assign_dt = split_assign_dt[2] + split_assign_dt[1] + split_assign_dt[0];
      let join_release_dt = split_release_dt[2] + split_release_dt[1] + split_release_dt[0];

      if (join_assign_dt > join_release_dt) {
        this.releaseAssetForm.patchValue({
          releaseDate: '',
        });
        this.releaseDate.nativeElement.value = '';

        this.toastr.error('Release date cannot be earlier than the assigned date', 'Oops!');
        return;
      }

    }

  }

  /**Deep Copy**/
  deepCopyArray(arr) {
    const copy = [];

    arr.forEach(item => {
      if (Array.isArray(item)) {
        copy.push(this.deepCopyArray(item)); // Recursively copy arrays
      } else if (typeof item === 'object' && item !== null) {
        copy.push(this.deepCopyObject(item)); // Recursively copy objects
      } else {
        copy.push(item); // Copy primitive values
      }
    });

    return copy;
  }
  deepCopyObject(obj) {
    const copy = {};

    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (Array.isArray(obj[key])) {
          copy[key] = this.deepCopyArray(obj[key]); // Recursively copy arrays
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          copy[key] = this.deepCopyObject(obj[key]); // Recursively copy objects
        } else {
          copy[key] = obj[key]; // Copy primitive values
        }
      }
    }

    return copy;
  }
  /**Deep Copy**/


}
