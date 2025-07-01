import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import jwtDecode from 'jwt-decode';
import { ToastrService } from 'ngx-toastr';
import { SessionService } from 'src/app/shared/services/session.service';
import { ReportService } from '../../reports/report.service';
import { HelpAndSupportService } from '../../help-and-support/help-and-support.service';
import { LoginService } from '../../login/login.service';
import { EncrypterService } from 'src/app/shared/services/encrypter.service';
import { PayoutService } from '../../payout/payout.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-employee-notification',
  templateUrl: './employee-notification.component.html',
  styleUrls: ['./employee-notification.component.css']
})
export class EmployeeNotificationComponent {
showSidebar: boolean = false;
  tp_account_id: any;
  filteredEmployees: any = [];
  notification_updated_data: any = [];
  employer_notification: any = [];
  esic_data: any = [];
  data: any = [];
  notification_data: any = [];
  decoded_token: any;
  product_type: any;

  currentPage: number = 1;
  itemsPerPage: any = 10;
  totalPages: number = 0;
  // pages: number[] = [];
  pages: (number | string)[] = [];
  paginatedData: any[] = [];
  sortOrder: { [key: string]: boolean } = {};
  isLoading: boolean = true;
  pageSizeOptions: any[] = [10, 25, 50, 100, 'All'];
  selectedPageSize: number | string = this.itemsPerPage;
  filteredData: any = [];
  searchQuery: string = '';
  fromDate:any = '';
  toDate: any = '';
  filter_fromdate: any = '';
  filter_todate: any = '';
  decodedHtml: SafeHtml;
  get_employee_list_data: any = [];

  archiveConfirmModal : boolean =false;
  alertMessage = "";
  archiveSubmitButtonStatus = false;
  constructor(
    private helpAndSupportService: HelpAndSupportService,
    private toastr: ToastrService,
    private _sessionService: SessionService,
    private router: Router,
    private _EncrypterService: EncrypterService,
    private _PayoutService: PayoutService,
    private _formBuilder: FormBuilder,
    private _loginService: LoginService,
    private sanitizer: DomSanitizer
  ) {
  }


  ngOnInit() {
    let session_obj: any = JSON.parse(this._sessionService.get_user_session());
    this.decoded_token = jwtDecode(session_obj.token);
    this.tp_account_id = this.decoded_token.tp_account_id;
    this.product_type = localStorage.getItem('product_type');
    // console.log(decoded_token);
    const today = new Date().toISOString().split('T')[0]; // Get current date in YYYY-MM-DD format
    this.fromDate = today;
    this.toDate = today;
    this.filterByDate();
    this.Notification_set_Alert();
    this.get_employee_list();
  }

  toggle() {
    this.showSidebar = !this.showSidebar;
  }

  // get_employer_notification

  //   Employer_notification(){
  //    this.helpAndSupportService.get_employer_notification({
  //      "productTypeId": this.product_type,
  //      "customeraccountid": this._EncrypterService.aesEncrypt(this.tp_account_id?.toString())
  //    }).subscribe((resData: any) => {
  //      // console.log(resData);
  //      if (resData.statusCode) {
  //        this.employer_notification = JSON.parse(this._EncrypterService.aesDecrypt(resData.commonData));
  //        console.log(this.employer_notification.data.notifications);
  //        this.notification_data=this.employer_notification.data.notifications

  //      } else {
  //        this.employer_notification = [];
  //        this.notification_data=[];
  //        this.toastr.error(resData.message);
  //      }
  //    });

  //  }

  Notification_Alert() {
    let  jsId = '';
  if(typeof(this.decoded_token.employee_flag) == 'undefined' || typeof(this.decoded_token.employee_flag) == undefined){
    jsId = this.decoded_token.js_id;
  }
  else{
    jsId = this.decoded_token.employee_flag.js_id;
  }
    this.helpAndSupportService.getTpAlertsByDateFilter({
      "actionType": "78/CzK1pQjuzWsvPCMTRgvEbVog5oEbKsb0bUC1RDk0=",
      "emp_id": this._EncrypterService.aesEncrypt(jsId?.toString()),
      "alertUserType": "NQUelVWA95Obc3VrzpwPhw==",
      "productTypeId": this._EncrypterService.aesEncrypt(this.product_type.toString()),
      "fromDate": this.filter_fromdate,
      "toDate": this.filter_todate
    })
      .subscribe((resData: any) => {
        if (resData.statusCode) {
          this.isLoading = false;
          this.notification_data = JSON.parse(this._EncrypterService.aesDecrypt(resData.commonData));
          this.filteredData = this.notification_data;
          this.totalPages = Math.ceil(this.filteredData.length / this.itemsPerPage);
          this.updatePages();
          this.updatePaginatedData();
        } else {
          this.isLoading = false;
          this.notification_data = [];
          this.filteredData = [];
          this.totalPages = 0; // No pages
          this.pages = []; // Clear pagination buttons
          this.paginatedData = [];
        }
      })
  }

  Notification_set_Alert() {
    let  jsId = '';
  if(typeof(this.decoded_token.employee_flag) == 'undefined' || typeof(this.decoded_token.employee_flag) == undefined){
    jsId = this.decoded_token.js_id;
  }
  else{
    jsId = this.decoded_token.employee_flag.js_id;
  }
    this.helpAndSupportService.getTpAlerts({
      "actionType": "MXdEfPkwLLpzioGj2SqrpA==",
      "emp_id": this._EncrypterService.aesEncrypt(jsId?.toString()),
      "alertUserType": "NQUelVWA95Obc3VrzpwPhw==",
      "productTypeId": this.product_type,
    })
      .subscribe((resData: any) => {
        if (resData.statusCode) {
          // this.notification_data = JSON.parse(this._EncrypterService.aesDecrypt(resData.commonData));
          // console.log(this.notification_updated_data);

        } else {
          console.log(resData.message);
          // this.notification_data = [];
        }
      })

  }

  filterByDate(): void {
    // Utility function to format a Date object to 'DD/MM/YYYY'
    const formatDate = (date: Date): string => {
      const dd = date.getDate().toString().padStart(2, '0');
      const mm = (date.getMonth() + 1).toString().padStart(2, '0');
      const yyyy = date.getFullYear().toString();
      return `${dd}/${mm}/${yyyy}`;
    };

    if (this.fromDate && this.toDate) {

      // Convert the string dates to Date objects
      const fromDateObj = new Date(this.fromDate);
      const toDateObj = new Date(this.toDate);

      if (isNaN(fromDateObj.getTime()) || isNaN(toDateObj.getTime())) {
        this.toastr.error('Invalid date format. Please enter valid dates.', 'Invalid Dates');
        return;
      }

      // Format the dates for display
      this.filter_fromdate = formatDate(fromDateObj);
      this.filter_todate = formatDate(toDateObj);

      // Compare Date objects for validation
      if (toDateObj < fromDateObj) {
        this.toastr.error('To Date cannot be earlier than From Date.', 'Invalid Date Range');
        return;
      }
      this.searchQuery = '';
      this.Notification_Alert();
    }
  }



  resetDateFilter() {
    this.searchQuery = '';
    this.fromDate = null;
    this.toDate = null;
    this.filter_fromdate = '';
    this.filter_todate = '';  
    this.Notification_Alert()
  }

  // Method to filter the notification data based on search query
  filterNotifications(): void {
    if (this.searchQuery.trim() === '') {
      this.filteredData = this.notification_data; // No filter if search is empty
    } else {
      this.filteredData = this.notification_data.filter((item: any) =>
        item.alertmessage.toLowerCase().includes(this.searchQuery.toLowerCase()) // assuming 'alertmessage' is the field to search
      );
    }

    // After filtering, reset to the first page
    this.currentPage = 1;

    // Recalculate total pages
    this.totalPages = Math.ceil(this.filteredData.length / this.itemsPerPage);

    // Update pages and paginated data
    this.updatePages();
    this.updatePaginatedData();
  }


  updatePaginatedData(): void {
    const dataToPaginate = this.filteredData;  // Always use filtered data

    // Handle page size being 'All'
    const itemsPerPageNumber = this.itemsPerPage === 'All' ? dataToPaginate.length : Number(this.itemsPerPage);

    const startIndex = (this.currentPage - 1) * itemsPerPageNumber;
    const endIndex = this.itemsPerPage === 'All' ? dataToPaginate.length : startIndex + itemsPerPageNumber;

    // Slice the data for pagination
    this.paginatedData = dataToPaginate.slice(startIndex, endIndex);
  }


  onPageSizeChange(event: any): void {
    this.selectedPageSize = event.target.value;

    // Handle case where page size is 'All'
    this.itemsPerPage = this.selectedPageSize === 'All' ? this.filteredData.length : event.target.value;

    // Recalculate total pages after the page size change
    this.totalPages = Math.ceil(this.filteredData.length / this.itemsPerPage);

    // Reset to the first page after changing the page size
    this.currentPage = 1;

    // Update paginated data and pages
    this.updatePaginatedData();
    this.updatePages();
  }

  updatePages(): void {
    const maxVisiblePages = 5;  // Maximum pages to show in the pagination (adjust as necessary)
    const halfVisible = Math.floor(maxVisiblePages / 2);  // Calculate half of max pages before current page
    const startPage = Math.max(1, this.currentPage - halfVisible);  // Start page is half of max pages before current page
    const endPage = Math.min(this.totalPages, startPage + maxVisiblePages - 1);  // End page is calculated based on start page and max pages

    // Clear pages and start from scratch
    this.pages = [];

    // Show ellipsis before first page if the start page is greater than 2
    if (startPage > 1) {
      this.pages.push(1);  // Always show the first page
      if (startPage > 2) this.pages.push('...');  // If there are pages skipped, show '...'
    }

    // Add pages in the range
    for (let i = startPage; i <= endPage; i++) {
      this.pages.push(i);
    }

    // Show ellipsis after last page if the end page is less than the total number of pages
    if (endPage < this.totalPages) {
      if (endPage < this.totalPages - 1) this.pages.push('...');  // If there are pages skipped, show '...'
      this.pages.push(this.totalPages);  // Always show the last page
    }
  }


  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;  // Prevent invalid page numbers
    this.currentPage = page;
    this.updatePaginatedData();  // Update the paginated data for the selected page
    this.updatePages();  // Update pagination buttons
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages) return;  // Prevent invalid page numbers

    this.currentPage = page;
    this.updatePaginatedData();
    this.updatePages();  // Update the pagination buttons when the page changes
  }

  sortData(column: string): void {
    // Toggle the sort order for the specific column
    if (this.sortOrder[column] === undefined) {
      this.sortOrder[column] = true;  // Default to ascending if not set
    } else {
      this.sortOrder[column] = !this.sortOrder[column];  // Toggle the current order
    }

    // Sorting the employee data based on the column and order
    this.notification_data.sort((a, b) => {
      if (a[column] < b[column]) return this.sortOrder[column] ? -1 : 1;
      if (a[column] > b[column]) return this.sortOrder[column] ? 1 : -1;
      return 0;
    });

    // Update the paginated data after sorting
    this.updatePaginatedData();
  }
  getSortIcon(column: string): string {
    if (!this.sortOrder[column]) return 'fas fa-sort'; // Default icon (no sorting)
    return this.sortOrder[column] ? 'fas fa-sort-up' : 'fas fa-sort-down'; // Up or Down
  }
  decodeHtmlContent(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  // By prabhat 27-jan-2025
  archiveDateFilter(){
    if (this.fromDate == null || this.toDate == null || this.toDate == undefined || this.fromDate == undefined) {
      this.alertMessage = 'Please select both the From Date and To Date.';
      this.archiveSubmitButtonStatus = false;
    }
    else{
       this.alertMessage = 'Are you sure you want to archive the selected filter date data?';
       this.archiveSubmitButtonStatus = true;
    }
    this.archiveConfirmModal = true;
  } 
  closeArchiveModal(){
    this.archiveSubmitButtonStatus = false;
    this.archiveConfirmModal = false;
  }

  archiveData(){
    let actionType = 'jOn6A6uuQPmUVt4qLLzPuQTYof+Iw6S+71OJ+CWLy7Y=';
    this.archiveNotificationAlert(actionType);
  }

  archiveNotificationAlert($action="") {
  let  jsId = this.decoded_token.employee_flag.js_id;
  if(typeof(this.decoded_token.employee_flag.js_id) == 'undefined' || typeof(this.decoded_token.employee_flag.js_id) == undefined){
    jsId = this.decoded_token.js_id;
  }
 
    this.helpAndSupportService.getTpAlertsByDateFilter({
      "actionType": $action,
      "emp_id": this._EncrypterService.aesEncrypt(jsId.toString()),
      "alertUserType": "NQUelVWA95Obc3VrzpwPhw==",
      "productTypeId": this._EncrypterService.aesEncrypt(this.product_type.toString()),
      "fromDate": this.filter_fromdate,
      "toDate": this.filter_todate,
      "modifiedBy":this.tp_account_id?.toString()
    }).subscribe((resData: any) => {
        if (resData.statusCode == true) {
          this.Notification_Alert();
          this.toastr.success(resData.message, 'Success!');
          this.archiveConfirmModal = false;
        }
        else {
          this.toastr.error(resData.message, 'Oops!');
        }
      }, (error: any) => {
       
        this.toastr.error(error.error.message, 'Oops!');
      })
  }
  //new 15 apr 2025
  get_employee_list() {
    this._loginService.get_tpay_dashboard_data({
      "action": "get_employee_list",
      "accountId": this.tp_account_id,
      "geo_location_id": '',
      "ouIds": ''
    })
      .subscribe({
        next: (resData: any) => {
          if (resData.statusCode) {
            this.get_employee_list_data = resData.commonData[0];
          } else {
            this.get_employee_list_data = [];
          }
        }, error: (e) => {
          this.get_employee_list_data = [];
          console.log(e);
        }
      })
  }

}
