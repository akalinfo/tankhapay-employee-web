import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import jwtDecode from 'jwt-decode';
import { ToastrService } from 'ngx-toastr';
import { SessionService } from 'src/app/shared/services/session.service';
import { ReportService } from '../../reports/report.service';
import { VisitorService } from '../../visitor/visitor.service';
import { PayoutService } from '../payout.service';
import { AccountsService } from '../../accounts/accounts.service';
import { EncrypterService } from 'src/app/shared/services/encrypter.service';
import { GlobalConstants } from 'src/app/shared/global-constants';
import { AlertService } from 'src/app/shared/_alert';
declare var $: any;
@Component({
  selector: 'app-pay-consultant',
  templateUrl: './pay-consultant.component.html',
  styleUrls: ['./pay-consultant.component.css']
})
export class PayConsultantComponent {
  showSidebar: boolean = false;
  invoicePath: string = ''; 
  payout_amount:any;
  submit_button:boolean = false;
  button_status:boolean=false;
  calPaymentStatus: any;
  confirmPaymentPop: any = false;
  record_popup:boolean=false;
  invoicedetail:any=[];
  tp_account_id: any;
  decoded_token:any;
  report_button:boolean=false;
  showTDSBox: boolean = false;
  add_consultant_popup:boolean=false;
  edit_consultant_popup:boolean=false;
  product_type:any;
  header_checkbox: boolean = false;
  paymentpurpose_data:any=[];
  payment_mode_type:any=[];
  months = [
    { value: 1, name: 'January' },
    { value: 2, name: 'February' },
    { value: 3, name: 'March' },
    { value: 4, name: 'April' },
    { value: 5, name: 'May' },
    { value: 6, name: 'June' },
    { value: 7, name: 'July' },
    { value: 8, name: 'August' },
    { value: 9, name: 'September' },
    { value: 10, name: 'October' },
    { value: 11, name: 'November' },
    { value: 12, name: 'December' }
  ];
  month: number = new Date().getMonth() + 1;
  year: number = new Date().getFullYear();
  filteredMonths: { value: number, name: string }[] = [];
  consultant_detail_data:any=[];
  edit_consultant_detail_data:any=[];
  payoutSummary:any=[];
  consultant_list_data:any=[];
  documentName: string = '';
  documentType: string = '';
  base64Data: string = '';
  add_consultant_detail_data:any=[];
  selectedConsultantCode: string = '';
  add_consultant_Form:FormGroup;
  edit_consultant_Form:FormGroup;
  selectedPaymentPurpose: any ;
  selectedConsultant:any;
  delete_consultant_data:any=[];
  gstnoRegex: string = "^([0-9]{2}[A-Za-z]{5}[0-9]{4}[A-Za-z]{1}[1-9A-Za-z]{1}[A-Za-z]{1}[0-9A-Za-z]{1})$";
  tdsOverride: number;
  // tdsPercent:any;
  // tdsId:any;
  tdsPercent: any;
  tdsId: string = "-9999";
  selected_row_Consultant:any=[];
  edit_payment_Purpose:any;
  customerSummary: any = [];
  netpay_sum: number = 0;
  selectedPayment: any = '';
  payout_mode_type: any;
  payout_form: FormGroup;
  invoice_detail_data:any=[];
  invoice_amount:any;
  total_Amount:any;
  currentMonth:any;
  currentYear:any;
  payout_status:any;
  selectSummary: any = '';
  open_approve_popup:boolean = false;
  constructor(
    private payoutService: PayoutService,
    private toastr: ToastrService,
    private _sessionService: SessionService,
    private _EncrypterService: EncrypterService,
    private _accountService: AccountsService,
    private _formBuilder: FormBuilder,
    private router: Router,
    private _alertservice: AlertService,
  ) {
    this.updateFilteredMonths();
   }

  
  ngOnInit() {
    let session_obj: any = JSON.parse(this._sessionService.get_user_session());
     this.decoded_token = jwtDecode(session_obj.token);
    this.tp_account_id = this.decoded_token.tp_account_id;
    this.product_type = localStorage.getItem('product_type');
    this.payout_mode_type = this.decoded_token.payout_mode_type;

    const currentDate = new Date();
    this.currentMonth = currentDate.getMonth() + 1; // Adding 1 because getMonth returns zero-based index
    this.currentYear = currentDate.getFullYear();

    this.add_consultant_Form = this._formBuilder.group({
      amount: ['', [Validators.required]],
      paymentDate: ['', [Validators.required]],
      gst: ['', [Validators.required]],
      gstNumber:['', [Validators.required, Validators.pattern(this.gstnoRegex)]],
      certificateNumber: ['', [Validators.required]],
      invoiceDate: ['', [Validators.required]], 
      remarks: ['', [Validators.required]],
      payment_purpose:['', [Validators.required]],
      tds: ['', [Validators.required]],
    });

    this.edit_consultant_Form = this._formBuilder.group({
      amount: ['', [Validators.required]],
      payment_Date: ['', [Validators.required]],
      gst: ['', [Validators.required]],
      gstNumber: ['', [Validators.required, Validators.pattern(this.gstnoRegex)]],
      certificateNumber: ['', [Validators.required]],
      invoice_Date: ['', [Validators.required]], 
      remarks: ['', [Validators.required]],
      payment_purpose:['', [Validators.required]],
      tds: ['', [Validators.required]],
    });

    this.payout_form = this._formBuilder.group({
      selected_payout_mode: ['1', [Validators.required]],
      paymentRecordDate:['', [Validators.required]]

    });
    this.netpay_sum=0;
    this.getCustomerLedgerSummary();
    this.payment_purpose();
    this.GetConsultant_PayoutDetails();
    this.setupFormListeners();
  }

  setupFormListeners() {
    this.edit_consultant_Form.get('tds').valueChanges.subscribe(() => {
      this.edit_consultant_Form.get('payment_purpose').setValue('');
    });
    this.edit_consultant_Form.get('certificateNumber').valueChanges.subscribe(() => {
      this.edit_consultant_Form.get('payment_purpose').setValue('');
    });
  }
  getCustomerLedgerSummary() {
    this._accountService.getCustomerLedgerSummary({
      'productTypeId': this.product_type,
      'customerAccountId': this.tp_account_id?.toString()
    }).subscribe((resData: any) => {
      if (resData.statusCode) {
        this.customerSummary = JSON.parse(this._EncrypterService.aesDecrypt(resData.commonData));
        // console.log(this._EncrypterService.aesEncrypt(this.customerSummary));

      }
    })
  }

  ngAfterViewInit() {
    setTimeout(() => {
      $('#paymentDate').datepicker({
        dateFormat: 'dd/mm/yy',
        changeMonth: true,
        changeYear: true,
        defaultDate: null 
      })
    }, 500);

    setTimeout(() => {
      $('#invoiceDate').datepicker({
        dateFormat: 'dd/mm/yy',
        changeMonth: true,
        changeYear: true,
        defaultDate: null 
      })
    }, 500);

    setTimeout(() => {
      $('#payment_Date').datepicker({
        dateFormat: 'dd/mm/yy',
        changeMonth: true,
        changeYear: true,
        defaultDate: null 
      })
    }, 500);

    setTimeout(() => {
      $('#invoice_Date').datepicker({
        dateFormat: 'dd/mm/yy',
        changeMonth: true,
        changeYear: true,
        defaultDate: null 
      })
    }, 500);

    setTimeout(() => {
      $('#FromDate2').datepicker({
        dateFormat: 'dd/mm/yy',
        changeMonth: true,
        changeYear: true,
      }).datepicker('setDate', new Date()); // Set current date as default
    }, 500);
  }

  approve_popup(){
    this.open_approve_popup=true;
  }

  close_approve_popup(){
    this.open_approve_popup=false;
  }

  open_record_popup(){
    this.record_popup=true;
  }

  close_record_popup(){
    this.record_popup=false;
  }
  closeModal() {
    this.confirmPaymentPop = false;

  }
  toggle() {
    this.showSidebar = !this.showSidebar;
  }
  PayoutDetails(payout: any) {
    if (payout.amount < 0) {
      this.toastr.error("Invalid Required amount", "Oops!");
      return
    }
    this.selectSummary = payout;
    this.GetConsultant_PayoutDetails();
  }
  toggleTDSBox() {
    this.showTDSBox = !this.showTDSBox;
  }
  updateFilteredMonths() {
    let currentMonth = new Date().getMonth() + 1;
    let currentYear = new Date().getFullYear();
    this.filteredMonths = [];
  
    for (let i = 0; i < 3; i++) {
      let month = currentMonth - i;
      let year = currentYear;
  
      if (month <= 0) {
        month += 12;
        year -= 1;
      }
  
      this.filteredMonths.push({ value: month, name: this.months.find(m => m.value === month)?.name || '' });
    }
  }
  
  changeMonthYear(event: any) {
    this.month = parseInt(event.target.value, 10);
    this.GetConsultant_PayoutDetails();
    this.button_status=false;
    this.submit_button=false;
    this.report_button=false;
    setTimeout(() => {
      if (this.consultant_detail_data.length == 0) {
        this.header_checkbox = false;
        this.netpay_sum=0;
      }
    }, 1000);
  }

  payment_purpose(){
    this.payoutService.GetMaster({
      "actionType": "GetAllPaymentPurposes",
      "productTypeId": this.product_type,
    }).subscribe((resData: any) => {
      // console.log(resData);
      if (resData.statusCode) {

        this.paymentpurpose_data = resData.commonData;
        // console.log(this.paymentpurpose_data);

      } else {
        this.paymentpurpose_data = [];
        this.toastr.error(resData.message);
      }
    });
  }
  
  open_consultant_popup(){
    this.add_consultant_popup=true;
    this.GetConsultantList();
  }

  close_consultant_popup(){
    this.add_consultant_popup=false;
    this.documentName = ''; // Reset the displayed file name
    this.base64Data = '';
    this.add_consultant_Form.reset();
    this.removeImage();
    // this.selectedConsultant='';
    // this.selectedConsultantCode='';
    this.selectedPaymentPurpose = '';
    this.tdsOverride = 0; 
    this.showTDSBox = false;
  }

  selectAll(event: any) {
    this.header_checkbox = event.target.checked;

    if (this.header_checkbox) {
      // Select all rows where payout_done_flag == 'N'
      this.consultant_detail_data.forEach(row => {
        if (row.payout_done_flag === 'N') {
          row.isSelected = true;
        }
      });
    } else {
      // Deselect all rows
      this.consultant_detail_data.forEach(row => row.isSelected = false);
    }
    this.calculateNetPaySum();
    this.GetConsultant_PayoutDetails();
  }
  onCheckbox_Change(event: any, row: any, index: any) {
    row.isSelected = event.target.checked;
    // Check if all rows are selected or not
    this.header_checkbox = this.consultant_detail_data
    .filter(row => row.payout_done_flag === 'N')
    .every(row => row.isSelected);
    this.calculateNetPaySum();
    this.GetConsultant_PayoutDetails();
  }
  anyRowSelected(): boolean {
    return this.consultant_detail_data.some(row => row.isSelected && row.payout_done_flag === 'N');
  }
  formatAmount(totalSelectedAmount: number, balance: string): string {
    const remainingAmount = totalSelectedAmount - parseFloat(balance || '0.00');
    return (remainingAmount >= 0 ? remainingAmount : 0).toFixed(2);
  }
  isShortfallZero(): boolean {
    return this.formatAmount(this.netpay_sum, this.customerSummary?.balance) === '0.00';
  }

  addBalance(enc_account_id: any, enc_amount: any, enc_totalemployees: any, status: any) {
    if (enc_amount < 0) {
      this.toastr.error("Invalid Required amount", "Oops!");
      return
    }

    this.payout_amount = enc_amount;
    this.payout_status = status;
    
    let resq = {
      "amount": enc_amount,
      "custumerAccountId": enc_account_id,
      "numOfAssociate": enc_totalemployees
    }
    localStorage.setItem('paymentRequest', JSON.stringify(resq));

    this.router.navigate(['/payouts/consultant_payment'], {
      state: { amount: this.payout_amount, payout_status: this.payout_status,invoice_details: this.invoicedetail,month:this.payoutSummary[0].mprmonth,year:this.payoutSummary[0].mpryear,invoice_val:this.payoutSummary[0].invoicevalue,Total_Amount:this.total_Amount}
    });
 
  }

  GetConsultant_PayoutDetails(){
 // Prepare selected consultant codes
    const selectedConsultantCodes = this.consultant_detail_data
    .filter(row => row.isSelected)
    .map(row => row.consultant_emp_code);

    this.payoutService.GetConsultantPayoutDetails({
      "action": "GetPayConsultantDetails",
      "payoutMonth": this.month?.toString(),
      "payoutYear": this.year?.toString(),
      "customerAccountId": this.tp_account_id?.toString(),
      "consultantPayoutAmount":this.netpay_sum?.toString()
    }).subscribe((resData: any) => {
      // console.log(resData);
      if (resData.statusCode) {
        this.consultant_detail_data = resData.commonData;
        this.payoutSummary=JSON.parse(this._EncrypterService.aesDecrypt(resData.payoutSummary));
    
         // Reapply selection state based on selectedConsultantCodes
         this.consultant_detail_data.forEach(row => {
          row.isSelected = selectedConsultantCodes.includes(row.consultant_emp_code);
        });
        this.calculateNetPaySum();
        this.calculate_Amount();
        // console.log(this.consultant_detail_data);

        if (this.payoutSummary[0].status === 'Low Balance' && this.payoutSummary[0].invoicevalue == 0 && !(this.currentMonth == this.payoutSummary[0].mprmonth && this.currentYear == 
          this.payoutSummary[0].mpryear)) {
          this.GetCustomer_InvoiceDetails();
        }

        if (( this.payoutSummary[0].status === 'Pending') && this.payoutSummary[0].invoicevalue == 0 && !(this.currentMonth == this.payoutSummary[0].mprmonth && this.currentYear == 
          this.payoutSummary[0].mpryear) && this.payout_mode_type=='self') {
          this.GetCustomer_InvoiceDetails();
        }


      } else {
        this.consultant_detail_data = [];
        this.toastr.error(resData.message);
      }
    });
  }
  calculateNetPaySum() {
    this.netpay_sum = this.consultant_detail_data
      .filter(row => row.isSelected && row.payout_done_flag === 'N')
      .reduce((sum, row) => sum + parseFloat(row.grossearning), 0)?.toFixed(2);
  }

  GetCustomer_InvoiceDetails(){
    this.payoutService.GetCustomerInvoiceDetails({
      "baseAmount": this.payoutSummary[0]?.amount,
      "noOfEmployees": this.payoutSummary[0]?.totalemployees,
      "customerAccountId": this.tp_account_id?.toString()
    }).subscribe((resData: any) => {
      if (resData.statusCode) {
         this.invoice_detail_data = (resData.commonData);
       this.invoice_amount=this.invoice_detail_data?.invoiceamount;
       this.calculate_Amount(); 
      } else {
        this.invoice_detail_data = [];
        this.invoice_amount='';
        this._alertservice.error(resData.message, GlobalConstants.alert_options_autoClose);
      }
    });
  }

  resetCheckboxes() {
    this.header_checkbox = false; // Uncheck header checkbox
    this.netpay_sum=0;
    this.consultant_detail_data.forEach((reimbursement: any) => {
        reimbursement.isSelected = false; // Uncheck all row checkboxes
    });

  }

  calculate_Amount() {
    const payoutamount = parseFloat(this.payoutSummary[0]?.amount) || 0;
    const invoice_amount = parseFloat(this.invoice_detail_data?.invoiceamount) || 0;
    // console.log(invoice_amount);
    if(this.payoutSummary[0].status === 'Low Balance' && this.payoutSummary[0].invoicevalue == 0){
    this.total_Amount = parseFloat((payoutamount + invoice_amount).toFixed(2));
  }
  else if(( this.payoutSummary[0].status === 'Pending') && this.payoutSummary[0].invoicevalue == 0 && this.payout_mode_type=='self'){
    this.total_Amount = parseFloat((payoutamount + invoice_amount).toFixed(2));  
  }
    else{
      this.total_Amount = parseFloat((payoutamount).toFixed(2));
    }
 
}
  GetConsultantList(){
    this.payoutService.GetConsultantPayoutDetails({
      "action": "GetConsultantList",
      "payoutMonth": this.month?.toString(),
      "payoutYear": this.year?.toString(),
      "customerAccountId": this.tp_account_id?.toString(),
    }).subscribe((resData: any) => {
      // console.log(resData);
      if (resData.statusCode) {
        this.consultant_list_data = resData.commonData;
        
      } else {
        this.consultant_list_data = [];
        // this.toastr.error(resData.message);
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) {
      this.documentName = ''; 
      this.base64Data = '';
      this.clearFileInput(input);
        return;
    }
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.documentName = file.name;
      // console.log(this.documentName);

      if (file.size > 1048576) { // Check if file size is more than 1 MB
        this.toastr.error('Uploaded document must be less than 1 MB.', 'File Size Error');
        this.clearFileInput(input); // Clear input to reset selection
        return;
      }

      // Check the document name extension and set documentType accordingly
      const fileExtension = this.documentName.split('.').pop()?.toLowerCase();
      if (fileExtension === 'jpg' || fileExtension === 'jpeg' || fileExtension === 'png' || fileExtension === 'pdf') {
        this.handleSupportedFile(file, fileExtension);
      } else {
        this.toastr.error('Invalid file type. Only JPG, PNG, and PDF are allowed.', 'File Type Error');
        this.clearFileInput(input); // Clear input to reset selection
      }
    }
  }

   handleSupportedFile(file: File, fileType: string): void {
    if (file.type === 'image/jpeg' || file.type === 'image/jpg' || file.type === 'image/png' || file.type === 'application/pdf') {
      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onload = () => {
        const base64String = reader.result as string;
        // Extract the base64 part of the string
        this.base64Data = base64String.split(',')[1];
        this.documentType = file.type.split('/')[1];
        
      };

      reader.onerror = (error) => {
        console.error('File reading error: ', error);
      };
    } else {
      this.toastr.error('Invalid file type. Only JPG, PNG, and PDF are allowed.', 'File Type Error');
    }
  }

   clearFileInput(input: HTMLInputElement): void {
    input.value = ''; // Clear the input file selection
    this.documentName = ''; // Reset the displayed file name
    this.base64Data = ''; // Clear the base64 data
    this.documentType = '';
  }

  triggerFileInput(): void {
    const fileInput = document.querySelector('.file') as HTMLInputElement;
    fileInput.click();
  }
    isImage(fileName: string): boolean {
    const extension = fileName?.split('.')?.pop()?.toLowerCase();
    return extension === 'jpg' || extension === 'jpeg' || extension === 'png';
  }

  isPdf(fileName: string): boolean {
    const extension = fileName?.split('.')?.pop()?.toLowerCase();
    return extension === 'pdf';
  }
  removeImage(): void {
    this.documentName = '';
    this.documentType = '';
    this.base64Data = '';

    const fileInput = document.querySelector('.file') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = ''; // Clear the input file selection
    }
  }
  resetFileData(): void {
    this.documentName = ''; // Reset the displayed file name
    this.base64Data = ''; // Clear the base64 data
  }
getDocumentNameWithoutExtension(filePath: string): string {
  if (!filePath) {
    return '';
  }
  const fileName = filePath.split('/').pop(); // Get the file name from the path
  return fileName ? fileName.split('.').slice(0, -1).join('.') : ''; // Remove the extension
}
open_edit_popup(consultant:any,event: any){
  this.edit_consultant_popup=true;
  const selectedEmpCode = event.target.value;
  this.selectedConsultant = this.consultant_list_data.find(consultant => consultant.emp_code === selectedEmpCode);

  this.selected_row_Consultant = consultant;
  this.tdsId = this.selected_row_Consultant.tdsid?.toString();
  this.tdsPercent = this.selected_row_Consultant.tds_percent?.toString();
  this.selectedPaymentPurpose ={'id' : this.selected_row_Consultant.tdsid,'tds':this.selected_row_Consultant.tds_percent}
  console.log(this.tdsId,this.tdsPercent,this.selectedPaymentPurpose);
  
  const tdsValue = consultant.tdsid === '-9999' ? consultant.tds_percent : '';
  this.documentName = consultant.original_document_name;
  this.invoicePath = consultant.invoicepath;
  if (consultant.tdsid?.toString() !== '-9999') {
     this.edit_payment_Purpose = this.paymentpurpose_data.find(p => p.id?.toString() === consultant.tdsid?.toString());

    if (this.edit_payment_Purpose) {
      this.edit_consultant_Form.get('payment_purpose').setValue(this.edit_payment_Purpose.id?.toString());
    }
  } else {
    this.edit_consultant_Form.get('payment_purpose').setValue('');
  }
  
  this.edit_consultant_Form.patchValue({
    amount: consultant.grossearning,
    payment_Date: consultant.payment_date,
    gst: consultant.gst,
    gstNumber: consultant.gst_number,
    certificateNumber: consultant.section_197_certificate_number,
    invoice_Date: consultant.invoice_date, 
    remarks: consultant.remark,
    tds: tdsValue?.toString(),
    payment_purpose: this.edit_consultant_Form.get('payment_purpose')?.value
  });

}
close_edit_consultant_popup() {
  this.edit_consultant_popup = false;
  this.documentName = ''; 
  this.invoicePath='';
  // this.base64Data = null;
  this.edit_consultant_Form.reset();
  this.removeImage();
  // this.selectedConsultant = '';
  // this.selectedConsultantCode = '';
  this.selectedPaymentPurpose = '';
  this.tdsOverride = 0;
  this.showTDSBox = false;
}

onConsultantSelect(event: any) {
  const selectedEmpCode = event.target.value;
  this.selectedConsultant = this.consultant_list_data.find(consultant => consultant.emp_code === selectedEmpCode);

  if (this.selectedConsultant) {
    this.selectedConsultantCode = selectedEmpCode;
    // console.log(this.selectedConsultantCode?.toString());
    this.selectedPaymentPurpose = this.paymentpurpose_data.find(purpose => purpose.id?.toString() === this.selectedConsultant.consultanttdsid?.toString());
    this.tdsOverride = 0;

    this.add_consultant_Form.patchValue({
      amount: this.selectedConsultant.monthlyofferedpackage,
    });

  } else {
    // this.selectedConsultantCode = '';
    this.selectedPaymentPurpose = '';
    this.tdsOverride = 0;
    this.add_consultant_Form.get('tds')?.reset();
    this.edit_consultant_Form.get('tds')?.reset();
  }
}

isSelectedPurpose(purpose: any): boolean {
  if (this.tdsOverride != 0) {
    return false;
  }
  this.tdsId=purpose.id?.toString();
  this.tdsPercent=this.add_consultant_Form.get('payment_purpose')?.value?.toString();
  
  return this.selectedConsultant?.consultanttdsid?.toString() === purpose.id?.toString();
}

Edit_SelectedPurpose(purpose: any): boolean {
  if (this.tdsOverride != 0) {
    this.tdsId = purpose.id?.toString();
    this.tdsPercent = purpose.tds?.toString();
    // console.log(this.tdsId,this.tdsPercent);
    return false;
  }
  if (purpose.id?.toString() === this.edit_payment_Purpose?.id?.toString()) {
    return true;
  } else {
    this.tdsId = "-9999";
    this.tdsPercent = this.edit_consultant_Form.get('tds')?.value?.toString();
    return false;
  }
}

onPaymentPurposeChange(purpose: any) {
  this.selectedPaymentPurpose = purpose;
  this.tdsOverride = 0;
  this.tdsId=purpose.id?.toString()
  this.tdsPercent=purpose.tds?.toString()
  // console.log(this.tdsId,this.tdsPercent);

}

onTdsOverrideChange(): void {
  this.selectedPaymentPurpose = '';
  this.tdsOverride = this.add_consultant_Form.get('tds')?.value?.toString();
  this.add_consultant_Form.get('payment_purpose')?.setValue('');
}

onTdsOverrideChange_for_edit(): void {
  this.selectedPaymentPurpose = '';
  this.tdsOverride = this.edit_consultant_Form.get('tds')?.value?.toString();
   this.edit_consultant_Form.get('payment_purpose')?.setValue('');
}

Add_Consultant_PayoutDetails() {
  const selectedPurpose = this.selectedPaymentPurpose;
  
  if (selectedPurpose) {
    this.tdsId = selectedPurpose.id?.toString();
    this.tdsPercent = selectedPurpose.tds?.toString();
  } else if (this.tdsOverride == null) {
    console.log(this.tdsOverride);
    this.tdsId = "-9999";
    this.tdsPercent = '';
  } else {
    this.tdsId = "-9999";
    this.tdsPercent = this.add_consultant_Form.get('tds')?.value?.toString();
  }
  // console.log(this.add_consultant_Form.value);
  
    this.payoutService.AddEditConsultantPayoutDetails({
      "action": "AddConsultantPayoutDetails",
      "payoutMonth": this.month?.toString(),
      "payoutYear": this.year?.toString(),
      "customerAccountId": this.tp_account_id?.toString(),
      "createdBy":this.tp_account_id?.toString(),
      "consultantEmpCode":this.selectedConsultantCode?.toString(),
      "amount":this.add_consultant_Form.get('amount')?.value,
      "tdsPercent":this.tdsPercent?.toString(),
      "paymentDate":$('#paymentDate').val(),
      "gst":this.add_consultant_Form.get('gst')?.value,
      "gstNumber":this.add_consultant_Form.get('gstNumber')?.value,
      "originalDocumentName":this.documentName,
      "documentByteCode":this.base64Data,
      "tdsId":this.tdsId?.toString(),
      "certificateNumber":this.add_consultant_Form.get('certificateNumber')?.value || '',
      "invoiceDate":$('#invoiceDate').val(),
      "remarks":this.add_consultant_Form.get('remarks')?.value || '',
      "documentUploadType":"New"
    }).subscribe((resData: any) => {
      // console.log(resData);
      if (resData.statusCode) {
        this.add_consultant_detail_data = resData.commonData;
        this.GetConsultant_PayoutDetails();
        this.close_consultant_popup();
        // console.log(this.add_consultant_detail_data);
        this.toastr.success(resData.message);

      } else {
        this.add_consultant_detail_data = [];
        this.toastr.error(resData.message);
      }
    });
  }

  Edit_Consultant_PayoutDetails() {
    const selectedPurpose = this.selectedPaymentPurpose;
    // console.log(selectedPurpose);
    if (selectedPurpose) {
      this.tdsId = selectedPurpose.id?.toString();
      this.tdsPercent = selectedPurpose.tds?.toString();
    } else if (this.tdsOverride == null) {
      this.tdsId = "-9999";
      this.tdsPercent = '';
    } else {
      this.tdsId = "-9999";
      this.tdsPercent = this.edit_consultant_Form.get('tds')?.value?.toString();
    }

    const documentUploadType = this.base64Data ? "New" : "Same";
    const documentName = documentUploadType === "Same" ? "" : this.documentName;
    // console.log(this.edit_consultant_Form.value);

      this.payoutService.AddEditConsultantPayoutDetails({
        "action": "EditConsultantPayoutDetails",
        "payoutMonth": this.month?.toString(),
        "payoutYear": this.year?.toString(),
        "customerAccountId": this.tp_account_id?.toString(),
        "createdBy":this.tp_account_id?.toString(),
        "consultantEmpCode":this.selected_row_Consultant?.consultant_emp_code?.toString(),
        "amount":this.edit_consultant_Form.get('amount')?.value?.toString(),
        "tdsPercent":this.tdsPercent?.toString(),
        "paymentDate":$('#payment_Date').val(),
        "gst":this.edit_consultant_Form.get('gst')?.value?.toString(),
        "gstNumber":this.edit_consultant_Form.get('gstNumber')?.value?.toString(),
        "originalDocumentName":documentName,
        "documentByteCode":this.base64Data,
        "tdsId":this.tdsId?.toString(),
        "certificateNumber":this.edit_consultant_Form.get('certificateNumber')?.value || '',
        "invoiceDate":$('#invoice_Date').val(),
        "remarks":this.edit_consultant_Form.get('remarks')?.value || '',
         "documentUploadType":documentUploadType
      }).subscribe((resData: any) => {
        // console.log(resData);
        if (resData.statusCode) {
          this.edit_consultant_detail_data = resData.commonData;
          this.GetConsultant_PayoutDetails();
          this.close_edit_consultant_popup();
          // console.log(this.edit_consultant_detail_data);
          this.toastr.success(resData.message);
  
        } else {
          this.edit_consultant_detail_data = [];
          this.toastr.error(resData.message);
        }
      });
    }

  DeleteConsultant_PayoutRecord(consultant:any){
    this.payoutService.DeleteConsultantPayoutRecord({
      "payoutRecordId": consultant.consultant_payout_id,
      "customerAccountId": this.tp_account_id?.toString(),
      "createdBy":this.tp_account_id?.toString(),
      "consultantEmpCode":consultant.consultant_emp_code?.toString(),

    }).subscribe((resData: any) => {
      // console.log(resData);
      if (resData.statusCode) {
        this.delete_consultant_data = resData.commonData;
        this.GetConsultant_PayoutDetails();
        // console.log(this.delete_consultant_data);
        this.toastr.success(resData.message);

      } else {
        this.delete_consultant_data = [];
        this.toastr.error(resData.message);
      }
    });
  }
  GetPaymentMode_Types(){
    this.payoutService.GetPaymentModeTypes({}).subscribe((resData: any) => {
  
      if (resData.statusCode) {
        this.payment_mode_type = resData.commonData;
        // console.log(this.payment_mode_type);
        
      } else {
        this.payment_mode_type = [];
        this._alertservice.error(resData.message, GlobalConstants.alert_options_autoClose);
      }
    });
  }
  submitPayButton(payment: any) {

    if (payment.amount < 0) {
      this.toastr.error("Invalid Required amount", "Oops!");
      return
    }
    this.selectedPayment = payment;
    this.confirmPaymentPop = true;
    
  }

  submit_Button(){
    
    this.GetPaymentMode_Types();
    this.record_popup=true;
    this.open_approve_popup=false;
  }
  submitPaySalary() {

    this.GetPaymentMode_Types();
    this.Consultant_Payout();

  }

  Consultant_Payout(){
    const empCodesJson = this.consultant_detail_data
    .filter(row => row.isSelected && parseInt(row.grossearning)> 0)
    .map(row => ({ emp_code: row.consultant_emp_code }));

    this.payoutService.ConsultantPayout({
      "action": "PayBulkSalary",
      "payoutMonth": this.month?.toString(),
      "payoutYear": this.year?.toString(),
      "customerAccountId": this.tp_account_id?.toString(),
      "createdBy":this.tp_account_id?.toString(),
      "empCodesJson": JSON.stringify(empCodesJson),
    }).subscribe((resData: any) => {
      if (resData.statusCode) {
        this.GetConsultant_PayoutDetails();
        this.closeModal();
        this.button_status=true;
        if ((this.payoutSummary[0]?.status === 'PartiallyPending' && this.payoutSummary[0]?.invoicevalue==0) || (this.payoutSummary[0]?.status === 'Pending' && this.payoutSummary[0]?.invoicevalue==0) && !(this.currentMonth == this.payoutSummary[0]?.mprmonth && this.currentYear == 
          this.payoutSummary[0]?.mpryear) && this.payoutSummary[0]?.days_left==0 && this.payoutSummary[0]?.amount!=0 && (this.payoutSummary[0]?.amount !=this.customerSummary.balance)) {
          // this.Generate_Required_AmountPI();
          this.CalcReciebaleFromBaseAmount();
        }
    
        if ((this.payoutSummary[0]?.status === 'Low Balance' && this.payoutSummary[0]?.invoicevalue==0) && !(this.currentMonth == this.payoutSummary[0]?.mprmonth && this.currentYear == 
          this.payoutSummary[0]?.mpryear) && this.payoutSummary[0]?.days_left==0  && (this.payoutSummary[0]?.amount !=this.customerSummary.balance)) {
            if(this.payoutSummary[0]?.amount == 0 && this.total_Amount > 0){
              this.CalcReciebaleFromBaseAmount();
            }
        }
        if ((this.payoutSummary[0]?.status === 'Low Balance' ||this.payoutSummary[0]?.status === 'PartiallyPending' || this.payoutSummary[0]?.status === 'Pending') && this.payoutSummary[0]?.invoicevalue == 0 && !(this.currentMonth == this.payoutSummary[0]?.mprmonth && this.currentYear == 
          this.payoutSummary[0]?.mpryear) && this.payoutSummary[0]?.days_left==0 && this.payout_mode_type=='self') {
          this.GetCustomer_InvoiceDetails();
          this.CalcReciebaleFromBaseAmount();
        }
        this.confirmPaymentPop = false;
        this.toastr.success(resData.message);

      } else {
        this.confirmPaymentPop = false;
        this.toastr.error(resData.message);
      }
    });
  }
  
  Record_Payment(){
    const empCodesJson = this.consultant_detail_data
    .filter(row => row.isSelected && parseInt(row.grossearning) >0)
    .map(row => ({ emp_code: row.consultant_emp_code }));

    this.payoutService.ConsultantPayout({
      "action": "RecordPayment",
      "payoutMonth": this.month?.toString(),
      "payoutYear": this.year?.toString(),
      "customerAccountId": this.tp_account_id?.toString(),
      "createdBy":this.tp_account_id?.toString(),
      "empCodesJson": JSON.stringify(empCodesJson),
      "paymentMethodId":this.payout_form.get('selected_payout_mode')?.value,
      "paymentRecordDate":$('#FromDate2').val()
    }).subscribe((resData: any) => {
      if (resData.statusCode) {
        this.report_button=true;
        this.submit_button=true;
        this.button_status=true;
        this.close_record_popup();
        this.resetCheckboxes();
       this.GetConsultant_PayoutDetails();
        this.toastr.success(resData.message);

      } else {
        this.toastr.error(resData.message);
      }
    });
  
  }
  saveReceiable() {
    let resq = {
      "customeraccountid": this.invoicedetail?.customeraccountid,
      "numberofemployees": this.invoicedetail?.numberofemployees,
      "netamountreceived": this.invoicedetail?.netamountreceived,
      "servicechargerate": this.invoicedetail?.servicechargerate,
      "servicechargeamount": this.invoicedetail?.servicechargeamount,
      "gstmode": this.invoicedetail?.gstmode,
      "sgstrate": this.invoicedetail?.sgstrate,
      "sgstamount": this.invoicedetail?.sgstamount,
      "cgstrate": this.invoicedetail?.cgstrate,
      "cgstamount": this.invoicedetail?.cgstamount,
      "igstrate": this.invoicedetail?.igstrate,
      "igstamount": this.invoicedetail?.igstamount,
      "netvalue": this.invoicedetail?.payoutamount,
      "source": "Web",
      "created_by": this.invoicedetail?.customeraccountid,
      // "createdbyip": ":::1",
      "invoicetype": "",
      "service_name": this.invoicedetail?.service_name,
      "package_name": "Payrolling",
      "productTypeId": this.product_type
    }
    this.payoutService.saveReceiable({
      "encrypted": this._EncrypterService.aesEncrypt(JSON.stringify(resq))
    })
      .subscribe((resData: any) => {
        // console.log(resData)
        if (resData.statusCode == true) {
          this.calPaymentStatus = '3';
        }
        else {
          this.toastr.error(resData.message, 'Error');
        }
      }, (error: any) => {
        this.toastr.error(error.error.message, 'Oops!');
      });

  }
  CalcReciebaleFromBaseAmount() {
    this.payoutService.CalcReciebaleFromBaseAmount({
      "encrypted": this._EncrypterService.aesEncrypt(JSON.stringify({
        "customerAccountId": this._EncrypterService.aesEncrypt(this.tp_account_id.toString()),
        "baseAmount": this.payoutSummary[0].amount,
        "numberOfEmployees": this.payoutSummary[0].totalemployees,
        "productTypeId": this.product_type,
        "packageName": "Payrolling",
        "billtype": "Salary",
        "invoicemonth": this.month?.toString(),
        "invoiceyear": this.year?.toString()
      }))
    }).subscribe((resData: any) => {
      if (resData.statusCode == true) {
        let resultJson = this._EncrypterService.aesDecrypt(resData.commonData);
        this.invoicedetail = JSON.parse(resultJson);
        // this.calculateTotalAmount();
        this.calculate_Amount();
        if(this.payoutSummary[0].amount!=0  && this.payoutSummary[0].days_left==0){

          this.saveReceiable();
        }
      }
      else {
        this.invoicedetail = [];
        this.toastr.error(resData.message, 'Error');
      }
    }, (error: any) => {
      this.invoicedetail = [];
      this.toastr.error(error.error.message, 'Oops!');
    });

  }

}
