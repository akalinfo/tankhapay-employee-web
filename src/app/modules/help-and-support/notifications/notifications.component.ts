import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import jwtDecode from 'jwt-decode';
import { ToastrService } from 'ngx-toastr';
import { SessionService } from 'src/app/shared/services/session.service';
import { ReportService } from '../../reports/report.service';
import { HelpAndSupportService } from '../help-and-support.service';
import { EncrypterService } from 'src/app/shared/services/encrypter.service';
import { PayoutService } from '../../payout/payout.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import moment from 'moment';

declare var $: any;

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css']
})
export class NotificationsComponent {
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
  decodedHtml: SafeHtml;

  archiveConfirmModal: boolean = false;
  alertMessage = "";
  archiveSubmitButtonStatus = false;
  isWfhFormValid: boolean;

  constructor(
    private helpAndSupportService: HelpAndSupportService,
    private toastr: ToastrService,
    private _sessionService: SessionService,
    private router: Router,
    private _EncrypterService: EncrypterService,
    private sanitizer: DomSanitizer
  ) {
  }


  ngOnInit() {
    let session_obj: any = JSON.parse(this._sessionService.get_user_session());
    this.decoded_token = jwtDecode(session_obj.token);
    this.tp_account_id = this.decoded_token.tp_account_id;
    this.product_type = localStorage.getItem('product_type');
    // console.log(decoded_token);
    this.filterByDate();
    this.Notification_set_Alert();
  }

  ngAfterViewInit() {

    setTimeout(() => {
      $('#FromDate').datepicker({
        dateFormat: 'dd/mm/yy',
        changeMonth: true,
        changeYear: true,
      }).datepicker('setDate', null);

      $('#ToDate').datepicker({
        dateFormat: 'dd/mm/yy',
        changeMonth: true,
        changeYear: true,
      }).datepicker('setDate', null);

      $('body').on('change', '#FromDate', function () {
        $('#recdate').trigger('click');
      });

      $('body').on('change', '#ToDate', function () {
        $('#recdate').trigger('click');
      });

      this.Notification_Alert();

    }, 100);

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

    if(this.isWfhFormValid == false){
      this.filterByDate();
      return;
    }

    let obj = {
      "actionType": "78/CzK1pQjuzWsvPCMTRgvEbVog5oEbKsb0bUC1RDk0=",
      "emp_id": this._EncrypterService.aesEncrypt(this.tp_account_id?.toString()),
      "alertUserType": "m93y/NzBMNUlqnp7NyGQ5w==",
      "productTypeId": this._EncrypterService.aesEncrypt(this.product_type.toString()),
      "fromDate": $(`#FromDate`).val(),
      "toDate": $(`#ToDate`).val()
    }

    // console.log("Notification_Alert objjj", obj)

    this.helpAndSupportService.getTpAlertsByDateFilter(obj)
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
    this.helpAndSupportService.getTpAlerts({
      "actionType": "MXdEfPkwLLpzioGj2SqrpA==",
      "emp_id": this._EncrypterService.aesEncrypt(this.tp_account_id?.toString()),
      "alertUserType": "m93y/NzBMNUlqnp7NyGQ5w==",
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


  // New filter logic sidharth kaul dated 07.05.2025
  filterByDate(): void {

    this.isWfhFormValid = true;
    let fromDate = $(`#FromDate`).val();
    let toDate = $(`#ToDate`).val();

    // Check if both dates have values
    if (!fromDate || !toDate) {
      console.log('One of the dates is missing, skipping validation');
      return;
    }

    let formatted_fromDate = moment(fromDate, 'DD-MM-YYYY').format('YYYY-MM-DD');
    let formatted_toDate = moment(toDate, 'DD-MM-YYYY').format('YYYY-MM-DD');

    if (fromDate && toDate) {
      if (new Date(formatted_toDate) >= new Date(formatted_fromDate)) {
        this.searchQuery = '';
        this.Notification_Alert();
      } else {
        this.toastr.error("From date should be less than or equal to the To date", 'Invalid Date Range!');
        this.isWfhFormValid = false;
        return;
      }
    }

  }

  resetDateFilter() {
    this.searchQuery = '';
    $('#FromDate').datepicker('setDate', null);
    $('#ToDate').datepicker('setDate', null);
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
  archiveDateFilter() {

    let fromDate = $(`#FromDate`).val();
    let toDate = $(`#ToDate`).val();

    if (!fromDate || !toDate) {
      this.alertMessage = 'Please select both the From Date and To Date.';
      this.archiveSubmitButtonStatus = false;
    }
    else {
      this.alertMessage = 'Are you sure you want to archive the selected filter date data?';
      this.archiveSubmitButtonStatus = true;
    }
    this.archiveConfirmModal = true;
  }

  closeArchiveModal() {
    this.archiveSubmitButtonStatus = false;
    this.archiveConfirmModal = false;
  }

  archiveData() {
    let actionType = 'jOn6A6uuQPmUVt4qLLzPuQTYof+Iw6S+71OJ+CWLy7Y=';
    this.archiveNotificationAlert(actionType);
  }

  archiveNotificationAlert($action = "") {
    this.helpAndSupportService.getTpAlertsByDateFilter({
      "actionType": $action,
      "emp_id": this._EncrypterService.aesEncrypt(this.tp_account_id?.toString()),
      "alertUserType": "m93y/NzBMNUlqnp7NyGQ5w==",
      "productTypeId": this._EncrypterService.aesEncrypt(this.product_type.toString()),
      "fromDate": $(`#$FromDate`).val(),
      "toDate": $(`#ToDate`).val(),
      "modifiedBy": this.tp_account_id?.toString()
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

  redirecttoModule(notification: any) {
    let notification_detail = notification;
    //   const url = this.router.createUrlTree(['/your-route']).toString();
    // window.open(url, '_blank');

    if (notification_detail.alert_category == 'ATTENDANCE') {
      // this.router.navigate(['/employee-mgmt/employee', this._EncrpterService.aesEncrypt(id.toString())]);
      const url = this.router.createUrlTree(['/attendance']).toString();
      window.open(url, '_blank');
      // this.router.navigate(['/attendance']);
    }
    else if (notification_detail.alert_category == 'PAYOUT') {
      // this.router.navigate(['/employee-mgmt/employee', this._EncrpterService.aesEncrypt(id.toString())]);
      const url = this.router.createUrlTree(['/payouts']).toString();
      window.open(url, '_blank');

      // this.router.navigate(['/payouts']);
    } else if (notification_detail.alert_category == 'LEAVE') {
      // this.router.navigate(['/employee-mgmt/employee', this._EncrpterService.aesEncrypt(id.toString())]);
      const url = this.router.createUrlTree(['/leave-mgmt/leave-application']).toString();
      window.open(url, '_blank');

      // this.router.navigate(['/leave-mgmt/leave-application']);
    }
    else {
      console.log('Invalid alert_category');
      // this.toastr.info();
    }
  }

}
