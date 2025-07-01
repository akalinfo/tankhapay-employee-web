import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import decode from 'jwt-decode';
import jsPDF from 'jspdf';
declare var $: any;
import { ToastrService } from 'ngx-toastr';
import { EncrypterService } from 'src/app/shared/services/encrypter.service';
import { SessionService } from 'src/app/shared/services/session.service';
import { ReportService } from '../../report.service';
import { environment } from 'src/environments/environment';
import { PDFDocument } from 'pdf-lib';
import { DomSanitizer } from '@angular/platform-browser';
import { forkJoin, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
// import { GlobalConstants } from 'src/app/shared/global-constants';
// import { AlertService } from 'src/app/shared/_alert';

@Component({
  selector: 'app-multiple-salary-slip',
  templateUrl: './multiple-salary-slip.component.html',
  styleUrls: ['./multiple-salary-slip.component.css']
})
export class MultipleSalarySlipComponent {
  showSidebar: boolean = true;
  profilepath: string = '';
  user_name: string = '';
  disp_image_txt: string = '';
  month: any;
  salmonth: any = [];
  salyear: any = '';
  yearsArray: any = [];
  emp_code: any = '';
  fromdate: any = '';
  employer_name: any = '';
  user_type: any = '';
  registered_address: any = '';
  todate: any = '';
  employer_profile: any = [];
  business_detail: FormGroup;
  payout_date_form: FormGroup;
  days_count: any;
  employer_mobile: any;
  Emp_code: any;
  empCodeArray: any = [];
  selectedMonth: any;
  billing_address: any;
  includeEmployeeDetails: boolean = true;
  year: any;
  employer_email: any;
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
  bankDetailsForm: FormGroup;
  selected_date: any;
  product_type: any;
  employeeSalaryData: any[] = [];
  name: any;
  all_salary_data: any[] = [];
  // empCode:any;
  tp_account_id: any = '';
  token: any = '';
  cur_payout_day: string = '';
  data: any = [];
  salary_data: any = [];
  payout_date: any;
  variable_data: any = [];
  deduction_data: any = [];
  json_data: any = [];
  show_label: boolean = true;
  from_date: any = '';
  to_date: any = '';
  salMonthYear: any;
  company_name: any = '';
  earningsHeaders: any=[];
  deductionHeaders: any=[];
  /*Plz hide DOB from salary slip for Kateeba
    4643 "KATEBAA RURAL SERVICES & SOLUTIONS
*/
  // restrictedAccountIds: string[] = ['653'];
  showDoB: boolean = true;
  is_production: boolean = environment.production;
  pdfUrls: any =[];
  isLoading: boolean = false;
  loadedCount: number =0;
  totalCount: any =0;

  constructor(
    public toastr: ToastrService,
    private _sessionService: SessionService,
    private _formBuilder: FormBuilder,
    private router: ActivatedRoute, // Import ActivatedRoute
    // private _alertservice: AlertService,
    private _EncrypterService: EncrypterService,
    private _ReportService: ReportService,
    private sanitizer: DomSanitizer,
    private http : HttpClient
  ) {
    this.router.queryParams.subscribe((params: any) => {
      let encryptedEmpCodes = this._EncrypterService.aesDecrypt(params['empCodes']);

      this.empCodeArray = JSON.parse(encryptedEmpCodes); // Parse the decrypted JSON string
      console.log(this.empCodeArray);

      let session_obj_d: any = JSON.parse(
        this._sessionService.get_user_session());
      this.token = decode(session_obj_d.token);
      this.tp_account_id = this.token?.tp_account_id;
      this.product_type = localStorage.getItem('product_type');
      // Loop through empCodeArray values
      for (let i = 0; i < this.empCodeArray.length; i++) {
        let empCodeObj = this.empCodeArray[i];
        let empCode = empCodeObj.empCode;
        this.salMonthYear = empCodeObj.salMonthYear; // Get the selected employee's salary month-year

        // Call the function with empCode and salMonthYear parameters
        
        // this.Salary_Slip(empCode, this.salMonthYear, this.tp_account_id?.toString());
        // [this.salmonth, this.salyear] = this.salMonthYear.split('-');
      }
      this.getSalaryDetail(this.empCodeArray.map(emp=> emp.empCode))
    });
  }

  ngOnInit() {

    let session_obj_d: any = JSON.parse(
      this._sessionService.get_user_session());
    this.token = decode(session_obj_d.token);
    this.tp_account_id = this.token.tp_account_id;
    // this.product_type = token.product_type;
    
    let currDate = new Date();

    currDate.setMonth(currDate.getMonth() + 1);
    currDate.setDate(currDate.getDate() - currDate.getDate())
    this.profilepath = session_obj_d.profile_photo_path;
    this.user_name = session_obj_d.name + ' [ ' + session_obj_d.email_id + ' ]';
    // this.name=session_obj_d.name;

    this.disp_image_txt = session_obj_d.name;
    if (this.disp_image_txt.trim().split(' ').length > 1 && this.disp_image_txt.split(' ')[1] != '') {
      this.disp_image_txt = this.disp_image_txt.trim().split(' ')[0].charAt(0).toUpperCase() + this.disp_image_txt.split(' ')[1].charAt(0).toUpperCase();

    } else {
      this.disp_image_txt = this.disp_image_txt.trim().split(' ')[0].charAt(0).toUpperCase();
    }


    if (this.profilepath == null || this.profilepath == '' || this.profilepath == undefined) {
      this.profilepath = '';
    }
    // this.Salary_Slip(this.empCode, this.salmonth, this.salyear);
    // this.get_Employer_Profile();
    // for kateeba
    //this.is_production &&
    // console.log(this.restrictedAccountIds.includes(this.tp_account_id));
    /*Plz hide DOB from salary slip for Kateeba
 4643 "KATEBAA RURAL SERVICES & SOLUTIONS
 */
    if (this.is_production && this.tp_account_id == '4643') {
      this.showDoB = false;
    }
    // end  // for kateeba

  }

  async mergePDFs(pdfUrls: string[]) {
    const mergedPdf = await PDFDocument.create();

    for (const url of pdfUrls) {
        try {
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();
            const pdf = await PDFDocument.load(arrayBuffer);
            const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
            copiedPages.forEach((page) => mergedPdf.addPage(page));
        } catch (error) {
            console.error(`Error fetching or merging PDF from URL: ${url}`, error);
        }
    }

    // Convert merged PDF to blob and create a download link
    const mergedPdfBytes = await mergedPdf.save();
    const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);

     // Set the iframe source to display the merged PDF
     const iframe = document.getElementById('pdfViewer') as HTMLIFrameElement;
     if (iframe) {
         iframe.src = url;
     }

    // Set the download link
    const downloadLink = document.getElementById('downloadPdf') as HTMLAnchorElement;
    if (downloadLink) {
        downloadLink.href = url;
        downloadLink.download = 'merged.pdf';
    }
  }

  getSalaryDetail(salary_slip_input:any){
    // this.isShowSalary = true;
    this.isLoading = true; // Show Loader
    this.loadedCount = 0;  // Track progress
    this.totalCount = salary_slip_input.length;
   
    const pdfReq = salary_slip_input.map(empCode=> 
      this._ReportService.getSalarySlip({
        'productTypeId' : this.product_type,
        'empCodeString' : empCode,
        'isPayslipAdvance' : 'N'
      }).pipe(
        tap(() => this.updateProgress()),
        catchError(()=> of(null))
      )
    );

    forkJoin(pdfReq).subscribe(async(resData:any)=>{
      const pdfUrls = resData
      .filter(res => res?.statusCode) // Filter out failed requests
      .map(res => (res.pdfPath));

      if (pdfUrls.length > 0) {
        await this.mergePDFsAndDisplay(pdfUrls);
      } else {
        console.error('No valid PDFs found');
      }

      this.isLoading = false; // Hide Loader
    })
  }

  updateProgress() {
    this.loadedCount++;
    const progressText = document.querySelector('.loader-content p');
    if (progressText) {
      progressText.textContent = `Fetching PDF ${this.loadedCount} out of ${this.totalCount}...`;
    }
  }
  

  pdfProxy(id:any){
    // this.pdfSrc = 'http://localhost:3000/api/employee/pdfProxy';
    let url='';
    
    // if(url){
      
    //     const iframe = document.createElement('iframe');
    //     iframe.style.width = '100%';
    //     iframe.style.height = '100vh';
    //     iframe.src = pdfUrl;
    //     document.getElementById(id).appendChild(iframe); // Assuming there's a div with id 'pdf-container'
    //   });
    // }
  }

  async mergePDFsAndDisplay(pdfUrls: any[]) {
    
    const mergedPdf = await PDFDocument.create();
    this.loadedCount = 0;
      const requests = pdfUrls.map((file) =>
        this.http.post(`${environment.tankhapay_api}employee/pdfProxy`, { pdf: file }, { responseType: 'blob' })
      );
      forkJoin(requests).subscribe(async (responses: Blob[]) => {
        for (const response of responses) {
          try {
            const fileArrayBuffer = await response.arrayBuffer();
            const pdf = await PDFDocument.load(fileArrayBuffer);
            const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
            copiedPages.forEach(page => mergedPdf.addPage(page));
          } catch (error) {
            console.error("Error merging PDF:", error);
          }
        }

        const mergedPdfBytes = await mergedPdf.save();
      const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      const iframe = document.getElementById('pdfViewer') as HTMLIFrameElement;
      if (iframe) {
        iframe.src = url;
      }
    });

  // const mergedPdfBytes = await mergedPdf.save();
  // const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
  // const url = URL.createObjectURL(blob);
  
  // const iframe = document.getElementById('pdfViewer') as HTMLIFrameElement;
  //   if (iframe) {
  //     iframe.src = url;
  //   }
  // document.getElementById('iframe').src = url; // Show in iframe
  
    // const pdfDocuments = await Promise.all(fetchPdfRequests);
    
    // for (const pdf of pdfDocuments) {
    //   if (pdf) {
    //     const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    //     copiedPages.forEach(page => mergedPdf.addPage(page));
    //   }
    }
  
    // const mergedPdfBytes = await mergedPdf.save();
    // const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
    // const pdfUrl = URL.createObjectURL(blob);
  
    // Display in iframe
    // console.log(pdfUrl)
    // const iframe = document.getElementById('pdfViewer') as HTMLIFrameElement;
    // if (iframe) {
    //   iframe.src = pdfUrl;
    // }
  
    // Set download link
    // const downloadLink = document.getElementById('downloadPdf') as HTMLAnchorElement;
    // if (downloadLink) {
    //   downloadLink.href = pdfUrl;
    //   downloadLink.download = 'merged_salary_slip.pdf';
    // }
    // this.isLoading = false; // Hide Loader after merging
  

  getFilteredSalaryData(empCode: number, salMonthYear: string) {
    return this.all_salary_data.filter(e => e.empCode === empCode && e.salMonthYear === salMonthYear);
  }

  toggle() {
    this.showSidebar = !this.showSidebar;
  }


  downloadPdf() {
    const pdf = new jsPDF();
    pdf.save('multiple-salary-slip.pdf');
  }

  // child component method
  Salary_Slip(empCode: string, salmonth: string, customer_AccountId: any) {
    const monthMap: { [key: string]: string } = {
      'Jan': '1', 'Feb': '2', 'Mar': '3', 'Apr': '4', 'May': '5', 'Jun': '6',
      'Jul': '7', 'Aug': '8', 'Sep': '9', 'Oct': '10', 'Nov': '11', 'Dec': '12'
    };

    const [monthName, salyear] = salmonth.split('-');
    const monthNumber = monthMap[monthName];

    this._ReportService.SalarySlip({
      "customerAccountId": customer_AccountId,
      "month": monthNumber,
      "year": salyear.toString(),
      "empCode": empCode.toString(),
      "GeoFenceId": this.token.geo_location_id
    }).subscribe((resData: any) => {
      let employeeData = {
        salary_data: [],
        variable_data: [],
        deduction_data: [],
        earningsHeaders: [],
        deductionHeaders: [],
        show_label: true
      };

      if (resData.statusCode && resData.commonData) {
        employeeData.salary_data = resData.commonData.salaryStructureDetails;
        employeeData.variable_data = resData.commonData.variablesDetails;
        employeeData.deduction_data = resData.commonData.deductionDetails;
        employeeData.earningsHeaders = resData.commonData.dynamicEarningHeads;
        employeeData.deductionHeaders = (resData.commonData.dynamicDeductionHeads);
      } else {
        employeeData.show_label = false;
      }

      // Check if any data exists for this employee
      if (employeeData.salary_data.length > 0 ||
        employeeData.variable_data.length > 0 ||
        employeeData.deduction_data.length > 0) {
        this.all_salary_data.push(employeeData); // Push employee data only if it contains any information
      } else {
        // If no data, remove the empCode and salmonth from empCodeArray
        this.empCodeArray = this.empCodeArray.filter(item => !(item.empCode === empCode && item.salMonthYear === salmonth));
      }
    });
  }


  // get_Employer_Profile(){
  //   this._ReportService.getEmployerProfile({
  //     customeraccountid: (this.tp_account_id),
  //     productTypeId: this.product_type,
  //   })
  //   .subscribe((resData: any) => {
  //     if (resData.statusCode) {
  //       this.employer_profile = resData.commonData;
  //       this.cur_payout_day = this.employer_profile.payout_frequency_dt;
  //           this.employer_name= this.employer_profile.full_name,
  //           this.company_name= this.employer_profile.company_name,
  //           this.user_type= this.employer_profile.user_type,
  //           this.employer_mobile= this.employer_profile.employer_mobile,
  //           this.employer_email= this.employer_profile.employer_email,
  //           this.registered_address= (this.employer_profile.company_address).trim(),
  //           this.billing_address= this.employer_profile.bill_address + '  ' + this.employer_profile.bill_city + '  ' + this.employer_profile.bill_pincode + '  ' + this.employer_profile.bill_state,
  //           this.payout_date= this.employer_profile.payout_frequency_dt + ' date of every month'

  //     }  else {
  //       this.employer_profile = [];
  //       this.toastr.error(resData.message, 'Oops!');
  //     }
  //   });
  // }


  // onPrint() {
  //   // Concatenate HTML content for all salary slips
  //   let printContent = '';
  //   for (let i = 0; i < this.all_salary_data.length; i++) {
  //     const dynamicId = `123${i}`;
  //     printContent += document.getElementById(dynamicId).innerHTML;  // Add some spacing between salary slips
  //   }

  //   // Open a new window and write the concatenated HTML content
  //   const printWindow = window.open('', '_blank');

  //   printWindow.document.write(`<html><head><title>Multiple-Salary-Slip</title></head><body>`);

  //       const styles = document.getElementsByTagName('style');
  //     for (let j = 0; j < styles.length; j++) {
  //       printWindow.document.write(styles[j].outerHTML);
  //     }

  //     printWindow.document.write('</head><body>');

  //   printWindow.document.write(printContent);
  //   printWindow.document.write('</body></html>');

  //     var printStyle = `<style>  @media print { .light-skyblue{background:lightblue}.white{background:white}.export-button{background-color:#72ee74;color:white;border:0;padding:10px 20px;text-align:center;text-decoration:none;display:inline-block;font-size:10px;margin:4px 2px;cursor:pointer;border-radius:4px}.dropdown.float-right-box ul#menu3{left:-52px}.top-right-outer-box{display:flex;justify-content:flex-start}.form-check{padding-top:10px}.form-check .form-check-input{height:20px;width:20px;vertical-align:text-bottom;margin:3px 5px 0 0}.table-responsive.reports-table-outer-box thead{background:#1669b6 !important;color:#fff}table.table-striped td{border:1px solid black;padding:2px;border-collapse:collapse;color:#000}.brd-top{border-top:none !important}.brd-btm{border-bottom:none !important}*{-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box}.text-left{text-align:left}table.salary-slip-header-box{background-color:#f6f6f6;width:100%;max-width:100%}.salary-slip-logo-box{vertical-align:text-bottom}.salary-slip-logo-box{padding:20px}.salary-slip-address-box{text-align:right;float:right;max-width:300px;padding:20px}.salary-slip-address-box p{font-weight:600;font-size:12px;margin-bottom:5px}.Salary-Slip-month-title-box h4{width:100%;text-align:center;display:block;padding-bottom:30px;font-weight:500;font-size:22px}p.print-btn-box.text-right{position:absolute;top:-45px;right:0}.table-responsive.reports-table-outer-box table tr td,.table-responsive.reports-table-outer-box table tr th{padding:4px !important;font-size:12px  .card {
  //       page-break-after: always;
  //   }}} </style>`;
  //     printWindow.document.head.insertAdjacentHTML('beforeend', printStyle);

  //   // Close the document
  //   printWindow.document.close();
  //   printWindow.print();

  // }

  onPrint() {
    // Open a new window
    const printWindow = window.open('', '_blank');

    // Write the basic structure of the document
    printWindow.document.write(`<html><head><title>Multiple-Salary-Slip</title></head><body>`);

    // Add styles from the current document
    const styles = document.getElementsByTagName('style');
    for (let j = 0; j < styles.length; j++) {
      printWindow.document.write(styles[j].outerHTML);
    }

    // Add custom print styles
    const printStyle = `<style>
      /* Add your print styles here */
      @media print {
          .card {
              page-break-after: always;
          }
      }
  </style>`;
    printWindow.document.head.insertAdjacentHTML('beforeend', printStyle);

    // Loop through each salary slip and append it to the print content
    for (let i = 0; i < this.all_salary_data.length; i++) {
      const dynamicId = `123${i}`;
      const salarySlipContent = document.getElementById(dynamicId).innerHTML;
      printWindow.document.write(`<div class="card" id="${dynamicId}">${salarySlipContent}</div>`);
    }

    // Close the document
    printWindow.document.write('</body></html>');
    printWindow.document.close();

    // Print the document
    printWindow.print();
  }

}
