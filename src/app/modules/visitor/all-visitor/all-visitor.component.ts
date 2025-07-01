import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { timer, map, share, Subscription } from 'rxjs';
import { EncrypterService } from 'src/app/shared/services/encrypter.service';
import { SessionService } from 'src/app/shared/services/session.service';
import { EmployeeService } from '../../employee/employee.service';
import { VisitorService } from '../visitor.service';
import decode from 'jwt-decode';
import { dongleState, grooveState } from 'src/app/app.animation';
import { Router } from '@angular/router';
declare var $: any;
@Component({
  selector: 'app-all-visitor',
  templateUrl: './all-visitor.component.html',
  styleUrls: ['./all-visitor.component.css'],
  animations: [dongleState, grooveState]
})
export class AllVisitorComponent {
  showSidebar: boolean = true;
  showPopup:boolean=false;
  time = new Date();
  rxTime = new Date();
  NewTime:any=[];
  intervalId;
  date_time:any;
  filteredEmployees:any=[];
  check_out_data:any=[];
  Blacklist_Form:FormGroup;
  Datepicker_Form:FormGroup;
  subscription: Subscription;
  token: any = '';
  idx:any;
  p: number = 1;
  limit: any = 50;
  product_type: any;
  blacklist_data:any=[];
  visitor_list_data:any=[];
  pageIndex = 0;
  pageSize = 10;
  totalPages = 0;
  pageSizes = [10, 30,50,70,90,100,120,150];
  tp_account_id: any = '';
  visitor_data: any=[];
  isVisitorPopup : boolean =false;
  printTime: any;
  validUptoTime: any;

  constructor(
    private _formBuilder: FormBuilder,
    private _EncrypterService: EncrypterService,
    private _SessionService: SessionService,
    private _VisitorService: VisitorService,
    private _EmployeeService: EmployeeService,
    public toastr: ToastrService,
    private router: Router
  ) {
  }

  ngOnInit() {

    let session_obj_d: any = JSON.parse(this._SessionService.get_user_session());
    this.token = decode(session_obj_d.token);
    this.tp_account_id = this.token.tp_account_id;
    this.product_type = this.token.product_type;

    this.Datepicker_Form = this._formBuilder.group({
      FromDate: ['', [Validators.required]],
      ToDate: ['', [Validators.required]],
      searchKeyword:['',[Validators.required]]
    });
      this.Blacklist_Form = this._formBuilder.group({
      p_is_blacklist_visitor: [''],
      remarks: [''],
    });

    this.intervalId = setInterval(() => {
      this.time = new Date();
  }, 1000);
  
  // Using RxJS Timer
  this.subscription = timer(0, 1000)
      .pipe(
          map(() => new Date()),
          share()
      )
      .subscribe(time => {
          let hour = this.rxTime.getHours();
          let minutes = this.rxTime.getMinutes();
          let seconds = this.rxTime.getSeconds();
          this.NewTime = this.pad(hour) + ":" + this.pad(minutes) + ":" + this.pad(seconds);
          this.rxTime = time;
      });

    setTimeout(() => {
      this.Visitor_list();
    }, 1000);
  }
  pad(num) {
    return (num < 10 ? '0' : '') + num;
}
  ngAfterViewInit() {
    setTimeout(() => {
      $('#FromDate2').datepicker({
        dateFormat: 'dd-mm-yy',
        changeMonth: true,
        changeYear: true,
      }).datepicker('setDate', new Date()); // Set current date as default
    }, 500);

    setTimeout(() => {
      $('#ToDate2').datepicker({
        dateFormat: 'dd-mm-yy',
        changeMonth: true,
        changeYear: true,
      }).datepicker('setDate', new Date()); // Set current date as default
    }, 500);
  }
  toggle() {
    this.showSidebar = !this.showSidebar;
  }
  get_page(event: any) {
    this.p = event;
  }
  changePage(e: any) {
    this.limit = e.target.value;
    // this.p = 0;
    this.p = 1;
  }
  openPopup(id:any){
    this.idx=id?.toString();
    this.showPopup=true;
  }
  closePopup(){
    this.showPopup=false;
    this.Blacklist_Form.reset();
  }

  nextPage() {
    if (this.pageIndex < this.totalPages - 1) {
      this.pageIndex++;
      this.Visitor_list();
    }
  }

  previousPage() {
    if (this.pageIndex > 0) {
      this.pageIndex--;
      this.Visitor_list();
    }
  }

  search(key: any) {
    let invKey = key.target.value;
    this.p = 0;
    this.filteredEmployees = this.visitor_list_data.filter(function (element: any) {
      
      return element.visitor_name?.toLowerCase().includes(invKey.toLowerCase())||
      element.visitor_last_name?.toString().toLowerCase().includes(invKey.toLowerCase()) ||
      element.visitor_mobile?.toString()?.toLowerCase().includes(invKey.toString().toLowerCase())
      
    });

    if(invKey ==''){
      this.filteredEmployees=this.visitor_list_data;
    }
   
  }

  changePageSize(size: number) {
    this.pageSize = size;
    this.pageIndex = 0; // Reset page index when changing page size
    this.Visitor_list();
  }
//   changePageSize(size: number) {
//   if (size === -1) {
//     // Show all records
//     this.pageSize = this.visitor_list_data?.length;
//     this.pageIndex = 0;
//   } else {
//     this.pageSize = size;
//     this.pageIndex = 0;
//     this.Visitor_list();
//   }
// }

  enlargeImage(imageUrl: string) {
    // Create a new window with the enlarged image
    window.open(imageUrl, '_blank');
}
  Visitor_list(){
    this._VisitorService.visitor_list({
      "p_fromdt":$('#FromDate2').val(),
      "p_todt":$('#ToDate2').val(),
      "p_keyword": "",
      "p_pageindex": this.pageIndex?.toString(),
      "p_pagesize": this.pageSize?.toString(),
      "p_accountid": this.tp_account_id?.toString()
  
    }).subscribe((resData: any) => {
      // console.log(resData);
  
      if (resData.status) {
  
        this.visitor_list_data = resData.commonData;
        this.filteredEmployees=this.visitor_list_data;
      
      } else {
        this.visitor_list_data = [];
        this.filteredEmployees=[];
       // this.toastr.error(resData.message)
      }
    });
  }

  Update_blacklist_visitor(){
    this._VisitorService.update_blacklist_visitor({
      "p_action": "update_blacklist_visitor",
      "p_customeraccountid": this.tp_account_id?.toString(),
      "p_visitor_id": this.idx,
      "p_is_blacklist_visitor": this.Blacklist_Form.get('p_is_blacklist_visitor')?.value?.toString(),
      "p_blacklist_remarks":this.Blacklist_Form.get('remarks')?.value,
      
    }).subscribe((resData: any) => {
      // console.log(resData);
  
      if (resData.status) {
  
        this.blacklist_data = resData.commonData;
        console.log(this.blacklist_data?.msgcd);
        
        this.closePopup();
        this.Visitor_list();
        this.toastr.success(resData.message);
      
      } else {
        this.blacklist_data = [];
        this.toastr.error(resData.message)
      }
    }); 
  }
update_visitor(data:any){
  this.router.navigate(['/visitor/update_visitor'], {
    state: { selectedRowsParams: data }
  });
}
  formatDate(dateString: string): string {
    // Parse the input date string
    const date = new Date(dateString);

    // Extract day, month, and year
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Month is zero-based
    const year = date.getFullYear().toString().slice(-2); // Get last two digits of the year

    // Return formatted date string in dd/mm/yy format
    return `${day}/${month}/${year}`;
}

// check_in_out_visitor
Check_in_out_visitor(visitor_data:any){
  this.date_time=visitor_data?.visit_date_time.replace('T', ' ');
  console.log(this.date_time,this.NewTime,visitor_data.visitor_id);
  this._VisitorService.check_in_out_visitor({
    "p_action": "check_in_out_visitor",
    "p_visit_date_time": this.NewTime,
    "p_visitor_id":visitor_data?.visitor_id.toString(),
    "p_customeraccountid": this.tp_account_id?.toString(),
  }).subscribe((resData: any) => {
    // console.log(resData);
    if (resData.status) {

      this.check_out_data = resData.commonData;
      this.Visitor_list();
      this.toastr.success(resData.message);
    } else {
      this.check_out_data = [];
      this.toastr.error(resData.message)
    }
  });
}

  showVisitingCard(visitor:any){
    this.isVisitorPopup = true;
    let date = new Date();
    var options :any= {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false // Use 24-hour format
    };
    
    // Format the date string
    this.printTime = date.toLocaleDateString('en-GB', options);
    var dateTime = new Date("January 1, 1970 " + visitor.check_in_time);

    // Add 2 hours to the time
    dateTime.setHours(dateTime.getHours() + 2);
    
    // Convert the updated time back to a formatted time string
   this.validUptoTime = dateTime.toLocaleTimeString('en-US', { hour12: true });
  
    document.querySelector('body').classList.add('modal-open');
    this.visitor_data = visitor;
  }

  hideVisitorModal(){
    this.isVisitorPopup = false;
    document.querySelector('body').classList.remove('modal-open');
    this.visitor_data = {};
  }

  printFinalBill() {

    var modalContent = document.querySelector('#final-bill .modal-body.final-bill-inner-box');
    var printWindow = window.open('', '_blank');

    printWindow.document.open();
    printWindow.document.write('<html><head><title>Final Bill</title>');
    printWindow.document.write('<link rel="stylesheet" href="assets/css/style.css">');
    printWindow.document.write('<link rel="stylesheet" href="assets/css/custom.css">');
    printWindow.document.write('<link rel="stylesheet" href="assets/css/bootstrap.min.css">');
    printWindow.document.write('</head><body>');
    printWindow.document.write(modalContent.innerHTML);
    printWindow.document.write('</body></html>');
    printWindow.document.close();

    var printStyle = `
                      <style>
                        @media print {

                   body {
                    background-color: #eef5f9;
                    color: #67757c;
                    font-family: 'Montserrat', sans-serif;
                    font-size: 12px;
                    line-height: 1.618;
                    overflow-x: hidden;
                    -webkit-font-smoothing: antialiased;
                    margin: 0;
                    font-weight: 400;
                    }
                    .card-body {

                    padding: 0;
                    }
                    hr {
                    margin-top: 10px;
                    margin-bottom: 10px;
                    border: 0;
                    border-top: 1px solid #eee;
                    }
                    .table-responsive.top-table-date-box tbody tr th, .table-responsive.top-table-date-box tbody tr td {
                    padding: 2px 10px;
                    font-size:12px;
                    }
                    .take-picture-box.e-pass-img {
                    height: 120px;
                    }
                    .take-picture-box.e-pass-img img.img-responsive {
                    border: 1px;
                    height: 100%;
                    margin: 0 auto;
                    border-radius: 20px;
                    }
                    .table-responsive.top-table-date-box tr th, .table-responsive.top-table-date-box tr td {
                    border: none;
                    font-size: 12px;
                    vertical-align: middle;
                    padding: 2px 10px;
                    }
                    .modal-body.final-bill-inner-box {
                    background: #efefef;
                    }
                    .modal-body.final-bill-inner-box .card-body {
                    border: 1px dashed #a1a1a1;
                    background: #fff;
                    }

                 </style>`;
    printWindow.document.head.insertAdjacentHTML('beforeend', printStyle);

    printWindow.print();
    printWindow.window.close();

}
}
