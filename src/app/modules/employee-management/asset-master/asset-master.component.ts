import { Component, ElementRef, ViewChild } from '@angular/core';
import { EmployeeManagementService } from '../employee-management.service';
import { dongleState, grooveState } from 'src/app/app.animation';
import { SessionService } from 'src/app/shared/services/session.service';
import jwtDecode from 'jwt-decode';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ConfirmationDialogService } from 'src/app/shared/services/confirmation-dialog.service';

declare var $: any;

@Component({
  selector: 'app-asset-master',
  templateUrl: './asset-master.component.html',
  styleUrls: ['./asset-master.component.css'],
  animations: [grooveState, dongleState],
})
export class AssetMasterComponent {

  showSidebar: boolean = true;
  showAddCategoryType: boolean = false;
  showAddEditAsset: boolean = false;
  description: any = '';
  tp_account_id: any;
  decoded_token: any;
  title_category_location: any;
  assetForm: FormGroup;
  asset_list_data: any = [];
  asset_status_data: any = [];
  asset_condition_data: any = [];
  asset_category_data: any = [];
  asset_location_data: any = [];
  asset_title: any;
  @ViewChild('pd') purchaseDate: ElementRef;
  @ViewChild('ld') lastServiceDate: ElementRef;
  p:any = 1;
  limit:any = 20;
  search_keyword: any;
  timeoutId: any;
  verify_status:string = 'N';
  constructor(
    private _employeeManagementService: EmployeeManagementService,
    private _sessionService: SessionService,
    private _formBuilder: FormBuilder,
    private toastr: ToastrService,
    private confirmationDialogService: ConfirmationDialogService,
  ) { }

  ngOnInit() {
    let session_obj = this._sessionService.get_user_session();
    let token = JSON.parse(session_obj).token;
    this.decoded_token = jwtDecode(token);
    this.tp_account_id = this.decoded_token.tp_account_id;

    this.assetForm = this._formBuilder.group({
      asset_row_id: [''],
      category_id: [''],
      location_id: [''],
      asset_code: [''],
      asset_name: [''],
      description: [''],
      model_name: [''],
      asset_status: [''],
      asset_condition: [''],
      device_serial_no: [''],
      vender_name: [''],
      purchase_date: [''],
      purchase_price: [''],
      last_service_date: [''],
      asset_image_url: [''],
      image_data: [''],
      image_name: [''],
      asset_invoice_url: [''],
      invoice_data: [''],
      invoice_name: [''],
      remarks: [''],
      verify_status:['']
    })

    this.get_asset_list();
    this.get_asset_status();
    this.get_asset_condition();
    // this.get_mst_tp_asset_catgeory();
  }

  toggle() {
    this.showSidebar = !this.showSidebar;
  }

  get_asset_list() {
    this.asset_list_data = [];

    this._employeeManagementService.get_asset_master({
      'action': 'get_asset_list',
      'account_id': this.tp_account_id,
      'pageindex': this.p-1,
      'pagesize': this.limit,
      'keyword': this.search_keyword,

    }).subscribe({
      next: (resData: any) => {
        if (resData.statusCode) {
          this.asset_list_data = resData.data;

        } else {
          this.toastr.error(resData.message, 'Oops!');
        }
      }, error: (e) => {
        console.log(e);
      }
    })
  }
  changePage(e:any) {
    this.limit = e.target.value;
    this.p = 1;
    this.get_asset_list();
  }
  get_page(event: any) {
    this.p = event;
    this.get_asset_list();
  }
  search() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }

    this.timeoutId = setTimeout(() => {
      this.p = 1;
      this.get_asset_list();
    },500)
  }
  get_total() {
    if (this.asset_list_data.length > 0) {
      return this.asset_list_data[0]?.tot_records;
    } else {
      return 0;
    }
  }

  get_asset_status() {
    this.asset_status_data = [];

    this._employeeManagementService.get_asset_master({
      'action': 'get_asset_status',
      'account_id': this.tp_account_id,

    }).subscribe({
      next: (resData: any) => {
        if (resData.statusCode) {
          this.asset_status_data = resData.data;

        } else {

        }
      }, error: (e) => {
        console.log(e);
      }
    })
  }

  get_asset_condition() {
    this.asset_condition_data = [];

    this._employeeManagementService.get_asset_master({
      'action': 'get_asset_condition',
      'account_id': this.tp_account_id,

    }).subscribe({
      next: (resData: any) => {
        if (resData.statusCode) {
          this.asset_condition_data = resData.data;
        } else {

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


  openAddLocationModal() {
    this.showAddCategoryType = true;
    this.title_category_location = 'Location';
  }
  openAddCategoryModal() {
    this.showAddCategoryType = true;
    this.title_category_location = 'Category';
  }
  closeAddLocationCategoryModal() {
    this.showAddCategoryType = false;
    this.description = '';
    this.title_category_location = '';
  }

  insert_asset_location() {
    this._employeeManagementService.insert_asset_location_category({
      'action': 'insert_mst_tp_asset_location',
      'account_id': this.tp_account_id,
      'description': this.description,
    }).subscribe({
      next: (resData: any) => {
        if (resData.statusCode) {
          this.toastr.success(resData.message, 'Success');
          this.get_mst_tp_asset_location();
          this.closeAddLocationCategoryModal();
        } else {
          this.toastr.error(resData.message, 'Oops!');
        }

      }, error: (e) => {
        console.log(e);
      }
    })
  }

  insert_asset_category() {
    this._employeeManagementService.insert_asset_location_category({
      'action': 'insert_mst_tp_asset_catgeory',
      'account_id': this.tp_account_id,
      'description': this.description,
    }).subscribe({
      next: (resData: any) => {
        if (resData.statusCode) {
          this.toastr.success(resData.message, 'Success');
          this.get_mst_tp_asset_catgeory();
          this.closeAddLocationCategoryModal();
        } else {
          this.toastr.error(resData.message, 'Oops!');
        }
      }, error: (e) => {
        console.log(e);
      }
    })
  }


  openAddAsset() {
    this.showAddEditAsset = true;
    this.asset_title = 'Add';
    this.get_mst_tp_asset_catgeory();
    this.get_mst_tp_asset_location();
    this.initialize_date();
  }
  closeAddEditAsset() {
    this.showAddEditAsset = false;
    this.assetForm.patchValue({
      asset_row_id: '',
      category_id: '',
      location_id: '',
      asset_code: '',
      asset_name: '',
      description: '',
      model_name: '',
      asset_status: '',
      asset_condition: '',
      device_serial_no: '',
      vender_name: '',
      purchase_date: '',
      purchase_price: '',
      last_service_date: '',
      asset_image_url: '',
      image_data: '',
      image_name: '',
      asset_invoice_url: '',
      invoice_data: '',
      invoice_name: '',
      remarks: '',
      verify_status: 'N'
    })
  }

  insert_update_assets() {
    console.log(this.assetForm.value);
    let data = this.assetForm.value;

    // return;
    this._employeeManagementService.insert_update_assets({
      'action': 'insert_update_assets',
      'account_id': this.tp_account_id.toString(),
      'asset_row_id': data.asset_row_id,
      'category_id': data.category_id,
      'location_id': data.location_id,
      'asset_code': data.asset_code,
      'asset_name': data.asset_name,
      'description': data.description,
      'model_name': data.model_name,
      'asset_status': data.asset_status,
      'asset_condition': data.asset_condition,
      'device_serial_no': data.device_serial_no,
      'vender_name': data.vender_name,
      'purchase_date': this.purchaseDate.nativeElement.value,
      'purchase_price': data.purchase_price,
      'last_service_date': this.lastServiceDate.nativeElement.value,
      'asset_image_url': data.asset_image_url,
      'image_data': data.image_data,
      'image_name': data.image_name,
      'asset_invoice_url': data.asset_invoice_url,
      'invoice_data': data.invoice_data,
      'invoice_name': data.invoice_name,
      'remarks': data.remarks,

    }).subscribe({
      next: (resData: any) => {
        if (resData.statusCode) {
          this.toastr.success(resData.message, 'Success');
          this.get_asset_list();
          this.closeAddEditAsset();
        } else {
          this.toastr.error(resData.message, 'Oops!');
        }
      }, error: (e) => {
        console.log(e);
      }
    })

  }

  openUpdateAsset(data:any) {
    this.showAddEditAsset = true;
    this.asset_title = 'Update';
    this.get_mst_tp_asset_catgeory();
    this.get_mst_tp_asset_location();
    this.initialize_date();
    // console.log(data);
    this.verify_status=data?.verify_status;
    this.assetForm.patchValue({
      asset_row_id: data?.asset_row_id,
      category_id: data?.category_id,
      location_id: data?.location_id,
      asset_code: data?.asset_code,
      asset_name: data?.asset_name,
      description: data?.description,
      model_name: data?.model_name,
      asset_status: data?.asset_status,
      asset_condition: data?.asset_condition,
      device_serial_no: data?.device_serial_no,
      vender_name: data?.vender_name,
      purchase_date: data?.purchase_date,
      purchase_price: data?.purchase_price,
      last_service_date: data?.last_service_date,
      asset_image_url: data?.asset_image_url,
      image_data: '',
      image_name: '',
      asset_invoice_url: data?.asset_invoice_url,
      invoice_data: '',
      invoice_name: '',
      remarks: data?.remarks,
      verify_status: data?.verify_status
    })
  }

  onInvoiceSelect(event: any) {
    const reader = new FileReader();

    if (event.target.files.length > 0) {
      let file = event.target.files[0];
      let invoiceFile = file;

      //  this.filename = file.name.replace(' ','_');
      if (file.type != 'application/pdf') {
        this.toastr.error('File should be PDF only.', 'Oops!');
        event.target.value = null;
      } else {
        reader.readAsDataURL(file);
        reader.onload = () => {
          let send_invoiceFile_base64 = reader.result;

          this.assetForm.patchValue({
            invoice_data: send_invoiceFile_base64,
            invoice_name: invoiceFile.name,
          });
        };
      }
    } else {
      this.toastr.error('Please choose a file.', 'Oops!');
    }
  }

  assetImgSelect(event: any) {
    const fileName = (document.getElementById("imageId") as HTMLInputElement).value;
    const idxDot = fileName.lastIndexOf(".") + 1;
    const ext = fileName.substring(idxDot, fileName.length).toLowerCase();

    if (ext == 'jpg' || ext == 'jpeg' || ext == 'png') {

      const reader = new FileReader();

      if (event.target.files.length > 0) {
        let file = event.target.files[0];

        // file.name = file.name.replace(/[^a-zA-Z0-9.]/g, '_');

        let imgFile = file;
        //  console.log(logoFile);

        reader.readAsDataURL(file);
        reader.onload = () => {
          let img_data_base64 = reader.result;

          this.assetForm.patchValue({
            image_data: img_data_base64,
            image_name: imgFile.name.replace(/[^a-zA-Z0-9.]/g, '_'),
          });

        };

      } else {
        this.toastr.error('Please choose a file.', 'Oops!');
      }

    } else {
      event.target.value = null;
      this.toastr.error('File should be jpg, jpeg, or png', 'Oops!');
    }

  }

  remove_verify_assets(asset_row_id: any, action:any) {
    let title = '';
    if (action == 'removed_assets') {
      title = 'Remove Asset';
    } else if (action == 'verify_assets') {
      title = 'Verify Asset';
    }
    this.confirmationDialogService.confirm(`Are you sure you want to ${title}?`, title).subscribe(result => {

      if (result) {
        this._employeeManagementService.remove_verify_assets({
          'action': action,
          'account_id': this.tp_account_id,
          'asset_row_id': asset_row_id,
        }).subscribe({
          next: (resData:any) => {
            if (resData.statusCode) {
              this.toastr.success(resData.message, 'Success');
              this.get_asset_list();
            } else {
              this.toastr.error(resData.message, 'Oops!');
            }
          }, error: (e) => {
            console.log(e);
          }
        });

      }
    })
  }

  check_digits(event: any) {
    const input = event.target as HTMLInputElement;
    const regex = /^\d*(\.\d{0,2})?$/;

    if (!regex.test(input.value)) {
      this.assetForm.patchValue({
        purchase_price: '',
      });
    } else {
      this.assetForm.patchValue({
        purchase_price: input.value,
      });
    }
  }
  // check_alpha_num(event: any) {
  //   const input = event.target as HTMLInputElement;
  //   const regex = /^[a-zA-Z0-9]+$/;

  //   if (!regex.test(input.value)) {
  //     this.assetForm.patchValue({
  //       asset_code: '',
  //     });
  //   } else {
  //     this.assetForm.patchValue({
  //       asset_code: input.value,
  //     });
  //   }
  // }

check_alpha_num(event: any) {
  const input = event.target as HTMLInputElement;
  this.assetForm.patchValue({
    asset_code: input.value,
  });
}




  initialize_date() {
    setTimeout(() => {
      $(function () {
        $('#PurchaseDateId').datepicker({
          dateFormat: 'dd/mm/yy',
          changeMonth: true,
          changeYear: true,
        });

        $(function () {
          $('#LastServiceDateId').datepicker({
            dateFormat: 'dd/mm/yy',
            changeMonth: true,
            changeYear: true,
          })
        })

      })
    }, 0)
  }

}
