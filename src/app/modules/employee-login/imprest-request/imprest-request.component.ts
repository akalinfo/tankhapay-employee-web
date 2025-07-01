// compoff-eligibility.component.ts
import { DatePipe } from '@angular/common';
import { Component, Input, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PopoverDirective } from 'ngx-bootstrap/popover';
import { EmployeeLoginService } from '../employee-login.service';
import { SessionService } from 'src/app/shared/services/session.service';
import jwtDecode from 'jwt-decode';
import { ToastrService } from 'ngx-toastr';
import { EncrypterService } from 'src/app/shared/services/encrypter.service';
import * as moment from 'moment';
import { log } from '@tensorflow/tfjs';
import { firstValueFrom } from 'rxjs';

declare var $: any;

@Component({
  selector: 'app-imprest-request',
  templateUrl: './imprest-request.component.html',
  styleUrls: ['./imprest-request.component.css'],
  providers: [DatePipe]
})
export class ImprestRequestComponent {
  addImprestForm!: FormGroup;
  public appraisalCycleForm:FormGroup;
  compOffRequests: any[] = []; // Sample data, replace with your actual data
  wfhRequests: any[] = []; // Sample data, replace with your actual data
  isViewImprest: boolean = false;

  @ViewChild('popoverStart') popoverStart!: PopoverDirective;  // Correct type
  @ViewChild('popoverEnd') popoverEnd!: PopoverDirective;  // Correct type

  startTime: any;
  endTime: any;
  imprest_title: any = '';
  emp_id: any;
  decoded_token: any;
  tp_account_id: any;
  product_type: any;
  @Input() empDataFromParent: any;
  statusFilter: any = 'All';
  showSidebar: boolean;
  isDataLoaded: any = true;
  imprest_applid: any;
  isImprestFormValid: boolean;
  categoryListData: any;
  paymentListData: any;
  imprestsRequests: any[];
  attachmentData: any;
  newFilesUploaded: boolean = false;

  constructor(
    private fb: FormBuilder,
    private datePipe: DatePipe,
    private _employeeLoginService: EmployeeLoginService,
    private _sessionService: SessionService,
    private toastr: ToastrService,
    private _encrypterService: EncrypterService) { }

  ngOnInit(): void {

    let session_obj: any = JSON.parse(this._sessionService.get_user_session());
    this.decoded_token = jwtDecode(session_obj.token);
    this.tp_account_id = this.decoded_token.tp_account_id;
    this.product_type = localStorage.getItem('product_type');
    this.emp_id = this.decoded_token?.id;
    this.empDataFromParent = JSON.parse(localStorage.getItem('empDataFromParent'));
   
    this.addImprestForm = this.fb.group({
      category: ['', Validators.required],
      otherCategoryName: [''],
      expenseDate: ['',Validators.required],
      paymentMode: ['',Validators.required],
      expenseAmount: ['',Validators.required],
      expenseDesc: ['',Validators.required],
      data: [''],
      name: [''],
      attachments: this.fb.array([])  // <-- store multiple docs
    }); 
    
    this.addImprestForm.get('category')?.valueChanges.subscribe((categoryValue) => {
    const otherCategoryControl = this.addImprestForm.get('otherCategoryName');

      if (categoryValue === '4') {
        otherCategoryControl?.setValidators([Validators.required]);
      } else {
        otherCategoryControl?.clearValidators();
        otherCategoryControl?.setValue('');
      }
      otherCategoryControl?.updateValueAndValidity();
    });

    this.getMasterData();

  }

  ngAfterViewInit() {

    setTimeout(() => {
      $('#FromDate').datepicker({
        dateFormat: 'dd-mm-yy',
        changeMonth: true,
        changeYear: true,
      }).datepicker('setDate', new Date());

      $('#ToDate').datepicker({
        dateFormat: 'dd-mm-yy',
        changeMonth: true,
        changeYear: true,
      }).datepicker('setDate', new Date());

      $('body').on('change', '#FromDate', function () {
        $('#recdate').trigger('click');
      });

      $('body').on('change', '#ToDate', function () {
        $('#recdate').trigger('click');
      });

      this.getImprestRequest();

    }, 100);

  }

  toggle() {
    this.showSidebar = !this.showSidebar;
  }

  filterFromToDateRequests(fromDateId: string, toDateId: string) {
    this.isImprestFormValid = true;
    let fromDate = $(`#${fromDateId}`).val();
    let toDate = $(`#${toDateId}`).val();

    // Check if both dates have values
    if (!fromDate || !toDate) {
      console.log('One of the dates is missing, skipping validation');
      return;
    }

    let formatted_fromDate = moment(fromDate, 'DD-MM-YYYY').format('YYYY-MM-DD');
    let formatted_toDate = moment(toDate, 'DD-MM-YYYY').format('YYYY-MM-DD');
 
    // Get the current month's start and end dates
    const currentMonthStart = moment().startOf('month').format('YYYY-MM-DD'); 
    const currentMonthEnd = moment().endOf('month').format('YYYY-MM-DD'); 
    const errMsgStart = moment().startOf('month').format('DD-MM-YYYY'); 
    const errMsgEnd = moment().endOf('month').format('DD-MM-YYYY'); 
     
    // Validate that the dates are within the current month's range
    if (new Date(formatted_fromDate) < new Date(currentMonthStart) || new Date(formatted_fromDate) > new Date(currentMonthEnd)) {
      this.toastr.error(`From date must be between ${errMsgStart} and ${errMsgEnd}`, 'Oops!');
      this.isImprestFormValid = false;
      return;
    }

    if (new Date(formatted_toDate) < new Date(currentMonthStart) || new Date(formatted_toDate) > new Date(currentMonthEnd)) {
      this.toastr.error(`To date must be between ${errMsgStart} and ${errMsgEnd}`, 'Oops!');
      this.isImprestFormValid = false;
      return;
    }

   if (new Date(formatted_toDate) >= new Date(formatted_fromDate)) {
      this.getImprestRequest();
    } else {
      this.toastr.error("From date should be less than or equal to the To date", 'Oops!');
      this.isImprestFormValid = false;
      return;
    }

  }

  getCurrentTime(): Date {
    const now = new Date();
    return new Date(0, 0, 0, now.getHours(), now.getMinutes());
  }


  // Add Imprest Request
  openAddImprestRequestModal() {
    this.isViewImprest = false; // Ensure it's in add mode
    this.addImprestForm.reset(); // Clear the form
    this.imprest_title = 'Add';

    this.intialize_date_worked('');

    // ... (Show the modal - implementation depends on your modal library) ...
    const modal = document.getElementById('addImprestModal')!;
    modal.classList.add("show"); // Add these two lines.
    modal.style.display = "block";

  }


  // Update Imprest Request
  openUpdateImprestRequestModal(data:any) {
    
    this.isViewImprest = false;
    this.imprest_title = 'Update';
    this.imprest_applid = data?.ir_applid;


    this.intialize_date_worked(data?.date_of_expense);

    this.attachmentData = !data.billattachemnt_url ? [] : JSON.parse(data.billattachemnt_url);
    const attachmentsArray = this.addImprestForm.get('attachments') as FormArray;

    // const attachmentsArray = this.fb.array<FormGroup>([]);
    attachmentsArray.clear();

    this.attachmentData.forEach((item:any) => 
      attachmentsArray.push(this.fb.group(item))
    );

    // console.log("attachmentsArray", this.addImprestForm.value.attachments);
   
    this.addImprestForm.patchValue({
      category: data?.expense_category_id,
      otherCategoryName: data?.other_expense_category_name,
      expenseDate: data?.date_of_expense,
      paymentMode: data?.payment_mode,
      expenseAmount: data?.amount_spent,
      expenseDesc: data?.imprest_reim_description,
    })

    // attachments: this.fb.array([])

    const modal = document.getElementById('addImprestModal')!;
    modal.classList.add("show");
    modal.style.display = "block";
  }

  // Remove Imprest Modal
  openRemoveImprestRequestModal(data:any) {
    this.isViewImprest = true;
    this.imprest_title = 'Remove';
    this.imprest_applid = data?.ir_applid;
    this.intialize_date_worked(data?.date_of_expense);

    if (this.isViewImprest) {
    } else {
    }

    this.attachmentData = !data.billattachemnt_url ? [] : JSON.parse(data.billattachemnt_url);

    this.addImprestForm.patchValue({
      category: data?.expense_category_id,
      otherCategoryName: data?.other_expense_category_name,
      expenseDate: data?.date_of_expense,
      paymentMode: data?.payment_mode,
      expenseAmount: data?.amount_spent,
      expenseDesc: data?.imprest_reim_description,
    })

    const modal = document.getElementById('addImprestModal')!;
    modal.classList.add("show");
    modal.style.display = "block";

  }

  // Hide Imprest Modal
  hideAddImprestRequestModal() {
    const modal = document.getElementById('addImprestModal')!;
    modal.classList.remove("show"); // Add these two lines.
    modal.style.display = "none";
    this.newFilesUploaded = false;

    const attachmentsArray = this.addImprestForm.get('attachments') as FormArray;
    attachmentsArray.clear();
    this.addImprestForm.reset();
    

  }

  // View Imprest Request
  viewImprestRequest(data: any) {
    this.isViewImprest = true;
    this.imprest_title = 'View';

    this.intialize_date_worked(data?.date_of_expense);

    this.attachmentData = !data.billattachemnt_url ? [] : JSON.parse(data.billattachemnt_url);
    // console.log("AattachmentData", this.attachmentData)

    this.addImprestForm.patchValue({
      category: data?.expense_category_id,
      otherCategoryName: data?.other_expense_category_name,
      expenseDate: data?.date_of_expense,
      paymentMode: data?.payment_mode,
      expenseAmount: data?.amount_spent,
      expenseDesc: data?.imprest_reim_description,
    })

    const modal = document.getElementById('addImprestModal')!;
    modal.classList.add("show");
    modal.style.display = "block";
  }


  togglePopover(popover: any) {
     if (popover.isOpen) {
       popover.hide();
     } else {
       popover.show();
     }
   }

  // Get Master Data
  async getMasterData() {

  try {
    const resData: any = await firstValueFrom(
      this._employeeLoginService.getCategoryListData({
        action: "get_expense_master",
        customeraccountid: this.tp_account_id?.toString()
      })
    );

    if (resData.statusCode) {
      let apiData = this.categoryListData = JSON.parse(this._encrypterService.aesDecrypt(resData.commonData));
      this.categoryListData = apiData?.categoryMaster;
      this.paymentListData = apiData?.paymentMaster;
      // console.log("Category list:", this.categoryListData);
      // console.log("Payment list:", this.paymentListData);
    } else {
      this.toastr.error(resData.message, 'Oops!');
    }
  } catch (error) {
    console.error('Error while fetching category list', error);
    this.toastr.error('Something went wrong while loading data.', 'Error');
  }
}


  // On File Change
  readFiles(event: Event) {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {

      const files = Array.from(input.files);
      const attachmentsArray = this.fb.array<FormGroup>([]);

      let loadedFiles = 0;

      files.forEach((file, index) => {
        const reader = new FileReader();

        reader.onload = () => {
          const base64String = (reader.result as string).split(',')[1];
          attachmentsArray.push(this.fb.group({
            documentName: file.name,
            docBase64: base64String
          }));
          loadedFiles++;

          // When all files are processed
          if (loadedFiles === files.length) {
            this.addImprestForm.setControl('attachments', attachmentsArray);
            this.newFilesUploaded = true;
          }
        };

        reader.readAsDataURL(file);
      });
    }
  }


  // Upload Document
  uploadImprestDocument() {
  const formData = this.addImprestForm.value;

  if (!formData.attachments || formData.attachments.length === 0) {
    this.saveImprestRequest();
    return;
  }

  const uploadedDocs: any[] = [];

  let uploadCount = 0;

  formData.attachments.forEach((doc: any, index: number) => {
    this._employeeLoginService.uploadWFHDocument({
      data: doc.docBase64,
      name: doc.documentName
    }).subscribe({
      next: (resData: any) => {
        uploadCount++;

        if (resData.statusCode && resData.filePath) {
          uploadedDocs.push({
            documentName: doc.documentName,
            docBase64: doc.docBase64
          });
        } else {
          this.toastr.error(`Error uploading ${doc.documentName}`, 'Upload Failed');
        }

        // Once all are uploaded
        if (uploadCount === formData.attachments.length) {
          this.addImprestForm.patchValue({
            attachment_url: JSON.stringify(uploadedDocs)
          });
          this.saveImprestRequest();
          }
        },
        error: () => {
          uploadCount++;
          if (uploadCount === formData.attachments.length) {
            this.toastr.error("Some documents failed to upload.");
            this.saveImprestRequest();
          }
        }
      });
    });
  }


  // Create Imprest Application
  saveImprestRequest() {

    if (this.addImprestForm.invalid){
        this.addImprestForm.markAllAsTouched();
        const invalidControls = this.getInvalidControls();
        console.log('Invalid Controls:', invalidControls);
        this.toastr.error("Please fill all the mandatory fields!");
        return;
    }

    let action = '';

    if (this.imprest_title == 'Add') {
      action = 'apply_ir_application';
    } else if (this.imprest_title == 'Update') {
      action ='update_ir_application';
    } else if (this.imprest_title == 'Remove') {
      action ='remove_ir_appl';
    }


    let createdby = '';
    if (this.decoded_token.isEmployer == '0') {
      createdby = this.empDataFromParent?.emp_code?.toString()
    } else {
      createdby = this.tp_account_id?.toString();
    }

    let expenseDate = $('#expenseDate').val();

    let obj = {
      action: action,
      customeraccountid: this.tp_account_id?.toString(),
      row_id: (this.imprest_title == 'Update' || this.imprest_title == 'Remove')? this.imprest_applid?.toString(): '',
      emp_id: this.emp_id,
      date_of_expense: expenseDate,
      expense_category_id: this.addImprestForm.value.category,
      expense_category_name: this.addImprestForm.value.otherCategoryName || '',
      imprest_reim_description: this.addImprestForm.value.expenseDesc,
      amount_spent: this.addImprestForm.value.expenseAmount,
      payment_mode: this.addImprestForm.value.paymentMode,
      imprest_reim_remarks: '',
      documents: (this.imprest_title == 'Add' || (this.imprest_title == 'Update' && this.newFilesUploaded)) ? this.addImprestForm.value.attachments: undefined,
      attachment_urls:(this.imprest_title == 'Update' || this.imprest_title == 'Remove') ? this.addImprestForm.value.attachments: undefined,
      user_name: createdby || this.tp_account_id?.toString()
    }

    // console.log("objjjj", obj);

    this._employeeLoginService.createImprestRequest(obj).subscribe({
      next: (resData: any) => {
        if (resData.statusCode) {
          this.addImprestForm.reset();
          this.hideAddImprestRequestModal();
          this.getImprestRequest(); 
          const attachmentsArray = this.addImprestForm.get('attachments') as FormArray;
          attachmentsArray.clear();
          this.clear_file();
          this.toastr.success(resData.message, 'Success');
        } else {
          this.toastr.error(resData.message, 'Error');
        }
      }
    })
  }

  // Read Imprest Requests
  getImprestRequest() {
    const obj = {
      action: "get_ir_appl_filter",
      customeraccountid: this.tp_account_id.toString(),
      emp_id: this.emp_id,
      fromdate: $('#FromDate').val(),
      todate: $('#ToDate').val(),
      approval_status: this.statusFilter
    };
    // console.log("obj",obj)


    this._employeeLoginService.getImprestRequest(obj).subscribe({
      next: (resData: any) => {
        this.imprestsRequests = [];

        if (resData.statusCode) {
          const decryptedData = JSON.parse(this._encrypterService.aesDecrypt(resData.commonData));

          // Parse billattachemnt_url for each record
          this.imprestsRequests = decryptedData.map((item: any) => {
            try {
              item.attachments = item.billattachemnt_url ? JSON.parse(item.billattachemnt_url) : [];
            } catch (error) {
              item.attachments = [];
            }
            return item;
          });
          // console.log("Imprest Requests:", this.imprestsRequests);

        } else {
          console.log(resData.message);
          // this.toastr.error(resData.message, 'Error');
        }
      }
    });
  }



  // Utility Functions
  intialize_date_worked(expense_date:any) {

      setTimeout(() => {
        const component = this;

        $('#expenseDate').datepicker({
          dateFormat: 'dd-mm-yy',
          changeMonth: true,
          changeYear: true,
          maxDate: 0,
          onSelect: function(dateText) {
            component.addImprestForm.get('expenseDate')?.setValue(dateText);
            $('#imprest_date').trigger('click'); // Trigger manually within `onSelect`
          }
        }).datepicker('setDate', expense_date);
  
        // $('body').on('change', '#expenseDate', function () {
        //   console.log('expenseDate changed');
        //   $('#wfhdates').trigger('click');
        // });

      }, 200)

  }

  clear_file() {
    const fileInput = document.getElementById("compoff_doc") as HTMLInputElement;
    fileInput.value = '';
  }

  changeStatusFilter() {
    this.getImprestRequest();
  }

  // Expense Amount Validation -
  validateAmount(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    let value = inputElement.value;

    const validPattern = /^\d*\.?\d*$/;

    if (!validPattern.test(value)) {
      this.addImprestForm.get('expenseAmount')?.setValue('');
    }

  }

  getInvalidControls() {
    const invalidControls = [];
    const controls = this.addImprestForm.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        invalidControls.push(name);
      }
    }
    return invalidControls;
  }

  pdfUrl: string | null = null;

  openPdf(url: string) {
    this.pdfUrl = url;
  }

  closePdf() {
    this.pdfUrl = null;
  }

  isPdf(url: string | null): boolean {
    return url ? url.toLowerCase().endsWith('.pdf') : false;
  }

  isPdfFile(file: any): boolean {
    return file?.originalDocName?.toLowerCase().endsWith('.pdf');
  }

  isImageFile(file: any): boolean {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
    return imageExtensions.some(ext => file?.originalDocName?.toLowerCase().endsWith(ext));
  }




}
