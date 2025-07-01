import { Component,ElementRef,ViewChild } from '@angular/core';
import { EmployeeManagementService } from '../../employee-management/employee-management.service';
import { ToastrService } from 'ngx-toastr';
import { SessionService } from 'src/app/shared/services/session.service';
import jwtDecode from 'jwt-decode';
import * as XLSX from 'xlsx';
import { ReportService } from '../report.service';
import { dongleState, grooveState } from 'src/app/app.animation';


declare var $:any;

@Component({
  selector: 'app-asset-inventory',
  templateUrl: './asset-inventory.component.html',
  styleUrls: ['./asset-inventory.component.css'],
  animations: [grooveState, dongleState],
})
export class AssetInventoryComponent {
  @ViewChild('reportTable', { static: false }) reportTable!: ElementRef;
  decoded_token: any;
  showSidebar: boolean = false;
  asset_status_data: any = [];
  asset_condition_data: any = [];
  asset_list_data: any = [];
  asset_category_data: any = [];
  asset_location_data: any = [];
  tp_account_id: any;
  search_keyword:any = '';
  asset_category_filter:any = '';
  asset_status_filter:any = '';
  location_filter:any = '';
  timeoutId:any
  p:any = 1;
  limit:any = 50;
  from_date:any;
  to_date:any;

  change_sidebar_filter_flag: boolean = false;
  search_keyword_copy:any = '';
  asset_category_filter_copy: any = '';
  asset_status_filter_copy: any = '';
  location_filter_copy: any = '';
  from_date_copy: any;
  to_date_copy: any;
  tot_records: any = 0;
  limit_copy:any = 50;
  rupee: any;
  showAssetImgModal: boolean = false;
  asset_img_url: any = '';

  constructor(
    private _employeeManagementService: EmployeeManagementService,
    private toastr: ToastrService,
    private _sessionService: SessionService,
    private _reportService: ReportService,) { }


  ngOnInit() {
    let session_obj = this._sessionService.get_user_session();
    let token = JSON.parse(session_obj).token;
    this.decoded_token = jwtDecode(token);
    this.tp_account_id = this.decoded_token.tp_account_id;

    this.from_date = this.formatDate(new Date());
    this.to_date = this.formatDate(new Date());

    this.rupee = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    });

    this.get_asset_list();
    this.get_asset_status();
    this.get_mst_tp_asset_location();
    this.get_mst_tp_asset_catgeory();
    // this.get_asset_condition();
  }

  toggle() {
    this.showSidebar = !this.showSidebar;
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

  get_asset_list() {
    this.asset_list_data = [];
    this.tot_records = 0;

    this._reportService.get_asset_report({
      'action': 'get_assets_list_report',
      'account_id': this.tp_account_id,
      'page_index': this.p - 1,
      'page_size': this.limit,
      'search_keyword': this.search_keyword,
      'from_dt': this.from_date,
      'to_dt': this.to_date,
      'assigned_location': this.location_filter,
      'asset_category': this.asset_category_filter,
      'asset_status': this.asset_status_filter,

    }).subscribe({
      next: (resData: any) => {
        if (resData.statusCode) {
          this.asset_list_data = resData.commonData;
          this.tot_records = this.asset_list_data[0].tot_records;

          if (this.change_sidebar_filter_flag) {
            this.closeSidebar();
          }

        } else {
          this.toastr.error(resData.message, 'Oops!');
        }
      }, error: (e) => {
        console.log(e);
      }
    })
  }
  changePage(e: any) {
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
    }, 500)
  }

  resetFilter() {
    this.from_date_copy = this.formatDate(new Date());
    this.to_date_copy = this.formatDate(new Date());

    setTimeout(() => {
      $('#FromDate').datepicker({
        dateFormat: 'dd-mm-yy',
        changeMonth: true,
        changeYear: true,
      }).datepicker('setDate', this.from_date_copy);
      $('#ToDate').datepicker({
        dateFormat: 'dd-mm-yy',
        changeMonth: true,
        changeYear: true,
      }).datepicker('setDate', this.to_date_copy);

      $('body').on('change', '#FromDate', function () {
        $('#recdate').trigger('click');
      });

      $('body').on('change', '#ToDate', function () {
        $('#recdate').trigger('click');
      });
    });

    this.search_keyword_copy = '';
    this.asset_category_filter_copy = '';
    this.asset_status_filter_copy = '';
    this.location_filter_copy = '';
    this.limit_copy = 50;
  }
  openSidebar() {
    this.search_keyword_copy = this.search_keyword;
    this.asset_category_filter_copy = this.asset_category_filter;
    this.asset_status_filter_copy = this.asset_status_filter;
    this.location_filter_copy = this.location_filter;
    this.limit_copy = this.limit;

    // console.log(this.limit_copy)

    setTimeout(() => {
      $('#FromDate').datepicker({
        dateFormat: 'dd-mm-yy',
        changeMonth: true,
        changeYear: true,
      }).datepicker('setDate', this.from_date);

      $('#ToDate').datepicker({
        dateFormat: 'dd-mm-yy',
        changeMonth: true,
        changeYear: true,
      }).datepicker('setDate', this.to_date);

      $('body').on('change', '#FromDate', function () {
        $('#recdate').trigger('click');
      });

      $('body').on('change', '#ToDate', function () {
        $('#recdate').trigger('click');
      });


      // this.from_date = $('#FromDate').val();
      // this.to_date = $('#ToDate').val();
      this.from_date_copy = this.from_date;
      this.to_date_copy = this.to_date;
    }, 1500);

    document.getElementById("sidebar").style.width = "380px";
  }

  closeSidebar() {
    this.change_sidebar_filter_flag = false;
    document.getElementById("sidebar").style.width = "0";
  }

  change_sidebar_filter() {
    this.change_sidebar_filter_flag = true;
    this.search_keyword = this.search_keyword_copy;
    this.asset_category_filter = this.asset_category_filter_copy;
    this.asset_status_filter = this.asset_status_filter_copy;
    this.location_filter = this.location_filter_copy;
    this.limit = this.limit_copy;

    this.from_date = $('#FromDate').val();
    this.to_date = $('#ToDate').val();

    this.get_asset_list();
  }

  download_excel() {
    let exportData = [];

    this.asset_list_data.map((el: any, i: any) => {
      let obj = {};
      obj = {
        'Asset Category/Type': el.category_name,
        'Asset Name': el.asset_name,
        'Location': el.location_name,
        'Asset Status': el.asset_status,
        'Supplier/Vendor Name': el.vender_name,
        'Purchase Date': el.purchase_date,
        'Purchase Price': el.purchase_price,
      }
      exportData.push(obj);
    })

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);
    const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

    const data: Blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const downloadLink: any = document.createElement('a');
    downloadLink.href = window.URL.createObjectURL(data);
    let date = new Date()
    downloadLink.download = `asset-inventory-report-${date.getMonth() + 1}-${date.getFullYear()}.xlsx`;
    downloadLink.click();
  }

  formatDate(date: Date): string {
    const dd = date.getDate().toString().padStart(2, '0');
    const mm = (date.getMonth() + 1).toString().padStart(2, '0');
    const yy = date.getFullYear().toString();
    return `${dd}-${mm}-${yy}`;
  }

  filterFromToDateLeads() {

    let splitted_f = $('#FromDate').val().split("-", 3);
    let splitted_t = $('#ToDate').val().split("-", 3);

    let fromdt: number = splitted_f[2] + splitted_f[1] + splitted_f[0];
    let todt: number = splitted_t[2] + splitted_t[1] + splitted_t[0];
    if (todt >= fromdt) {
      this.from_date_copy = $('#FromDate').val();
      this.to_date_copy = $('#ToDate').val();
    }
    else {
      $('#FromDate').val(this.from_date_copy);
      $('#ToDate').val(this.to_date_copy);
      this.toastr.error("Start date should be less than or equal to the end date", 'Oops!');
    }
  }

  openAssetImgModal(img_url:any) {
    this.showAssetImgModal = true;
    this.asset_img_url = img_url;
  }

  closeAssetImgModal() {
    this.showAssetImgModal = false;
    this.asset_img_url = '';
  }

  exportToPdf(pdfName,title){
    //pre-attendace-table
    if (this.reportTable) {
      //const tableHtml = this.preAttendaceRef.nativeElement.outerHTML;
      const tableElement = this.reportTable.nativeElement.cloneNode(true) as HTMLElement;
      this.removeComments(tableElement);
      let tableHtml = `<style>.table {
  border: 1px solid black;
  border-collapse: collapse;
}
.table th, 
.table td {
  border: 1px solid black; 
  padding: 8px;
}</style>`;
tableHtml += '<p style="text-align:center;"><b>'+title+'</b></p>';
      tableHtml += tableElement.outerHTML;
      this._reportService.generatePdfByCode({
        "htmlBody":tableHtml
      }).subscribe((resData: any) => {
        if(resData.statusCode == true){
          const byteCharacters = atob(resData.commonData);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const file = new Blob([byteArray], { type: 'application/pdf' });
          const fileURL = URL.createObjectURL(file);
          const a = document.createElement('a');
          a.href = fileURL;
          a.download = pdfName;
          a.click();
          URL.revokeObjectURL(fileURL);
        }
      })
      console.log('Clean Table HTML:', tableHtml);

    
    }


  }

  private removeComments(element: HTMLElement) {
    const iterator = document.createNodeIterator(element, NodeFilter.SHOW_COMMENT, null);
    let commentNode;
    while ((commentNode = iterator.nextNode())) {
      commentNode.parentNode?.removeChild(commentNode);
    }
  }

}

