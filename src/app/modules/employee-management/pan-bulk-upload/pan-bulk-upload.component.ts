import { Component } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { concatMap, delay, tap, catchError } from 'rxjs/operators';
import { EncrypterService } from 'src/app/shared/services/encrypter.service';
import { SessionService } from 'src/app/shared/services/session.service';
import { grooveState, dongleState } from 'src/app/app.animation';
import { AlertService } from 'src/app/shared/_alert';
import { EmployeeService } from '../../employee/employee.service';
import { from, of } from 'rxjs';
import decode from 'jwt-decode';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import { EmployeeManagementService } from '../employee-management.service';

@Component({
  selector: 'app-pan-bulk-upload',
  templateUrl: './pan-bulk-upload.component.html',
  styleUrls: ['./pan-bulk-upload.component.css']
})
export class PanBulkUploadComponent {

  isShowRoundedVal: boolean = false;
  showSidebar: boolean = false;
  isSideActive = false;
  addModalStatus = false;
  financialYearList = this.getFinancialYears();

  totalCount = 0;
  completedCount = 0;
  isProcessing = false;
  progressPercent = 0;
  messages:any =[];
  selectedFiles:any = [];
  tp_account_id:any='';
  token:any ='';
  employer_name:any ='';
  product_type:any = '';
  finYear = '';
  
  uploadForm16:FormGroup;

  financialYearsArray: string[] = [];
  selectedFinancialYear: string = '';
  GetForm16_data:any=[];

  constructor(public toastr: ToastrService,
    private _sessionService: SessionService,
    private _EncrypterService: EncrypterService,
    private _EmployeeService: EmployeeService,
    private _formBuilder: FormBuilder,
    private _EmployeeManagementService: EmployeeManagementService,
  ){

  }
  
  ngOnInit() {
      let session_obj_d: any = JSON.parse(
      this._sessionService.get_user_session());
      this.token = decode(session_obj_d.token);
      this.employer_name = this.token.name;
      this.tp_account_id = this.token.tp_account_id;
      this.product_type = localStorage.getItem('product_type');
      this.uploadForm16 = this._formBuilder.group({
        formType: ['', [Validators.required]],
        finYear: ['', [Validators.required]],
        file:['']
      });
    this.generateFinancialYears();
    this.GetForm16_Details();
  }

  toggle() {
    this.showSidebar = !this.showSidebar;
  }
  toggleSidebar() {
    this.isSideActive = !this.isSideActive;
  }

  generateFinancialYears(): void {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;

    // Determine financial year based on Indian fiscal calendar: April to March
    let startYear: number;
    if (currentMonth >= 4) {
      startYear = currentYear;
    } else {
      startYear = currentYear - 1;
    }

    //this.financialYearsArray.push('All');  // Add 'All' option first

    for (let i = 0; i < 3; i++) {
      const fyStart = startYear - i;
      const fyEnd = fyStart + 1;
      const financialYear = `${fyStart}-${fyEnd}`;
      this.financialYearsArray.push(financialYear);
    }

    // Set default selected year to current FY (not 'All')
    this.selectedFinancialYear = `${startYear}-${startYear + 1}`;
  }


  changeFinancialYear(event: any): void {
    this.selectedFinancialYear = event.target.value;
    this.GetForm16_Details();
  }

  GetForm16_Details(){
    this._EmployeeManagementService.GetForm16Details({
      "customerAccountId": this.tp_account_id?.toString(),
      "productTypeId":  this.product_type,
      "empCode": '-9999', //'6527',
      "financialYear":this.selectedFinancialYear?.toString()
        })
          .subscribe((resData: any) => {
            if (resData.statusCode) {
              this.GetForm16_data = resData.commonData;
              console.log(this.GetForm16_data[0]?.form16path);
              
            // this.toastr.success(resData.message, 'Success');
            } else {
              this.GetForm16_data=[];
              console.error('Error:', resData.message);
              // this.toastr.error(resData.message, 'Oops!');
            }
          })
  }

  getFinancialYears(): string[] {
    const startYear = 2023;
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1; // Jan = 0

    const lastYear = currentMonth >= 4 ? currentYear : currentYear - 1;

    const years: string[] = [];

    for (let year = lastYear; year >= startYear; year--) {
      years.push(`${year}-${(year + 1).toString()}`);
    }

    return years;
  }

  setFormToBlank() {
    this.uploadForm16.setValue({
      formType: '',
      finYear: '',
      file: ''
    });
  }


  closeFormModal(){
    this.selectedFiles = [];
    this.setFormToBlank();
    this.addModalStatus = false;
  }
  openFormModal(){
    this.selectedFiles = [];
    this.setFormToBlank();
    this.addModalStatus = true;
  }

  onFormTypeChange() {
    this.selectedFiles = [];
    this.uploadForm16.get('file')?.reset();
  }

  onFilesSelected(event: any): void {
    const files: FileList = event.target.files;

    if (files.length === 0) {
      this.toastr.error('No files selected', 'Validation Error');
      return;
    }

    const invalidFiles: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type !== 'application/pdf') {
        invalidFiles.push(file.name);
        
      }
      else{
        this.selectedFiles.push(file);
      }
    }

    if (invalidFiles.length > 0) {
      this.toastr.error(`Invalid files: ${invalidFiles.join(', ')}`, 'Only PDFs allowed');
      return;
    }

    // ✅ All files are valid PDFs
    const selectedFiles: File[] = Array.from(files);
    console.log('Selected PDF files:', selectedFiles);
  }

  async startUpload(): Promise<void> {
    if (this.selectedFiles.length === 0) {
      this.toastr.error('⚠️ Please select PDF files to upload.');
      return;
    }
    if (this.selectedFiles.length > 50) {
      this.toastr.error('⚠️ You can upload a maximum of 50 PDF files at a time.');
      return;
    }


    const validFormTypes = ['16A', '16B'];
    if (!validFormTypes.includes(this.uploadForm16.value.formType)) {
      this.toastr.error('⚠️ Please select a valid Form Type (16A or 16B).');
      return;
    }


    if(this.uploadForm16.value.finYear == '' ||this.uploadForm16.value.finYear == null){
       this.toastr.error('⚠️ Please select Financial Year.');
      return;
    }
    let encTpAccount = this._EncrypterService.aesEncrypt((this.tp_account_id).toString());
    let enc_product_type = this._EncrypterService.aesEncrypt((this.product_type).toString());
    let enc_action = this._EncrypterService.aesEncrypt(this.uploadForm16.value.formType === '16A' ? 'AddForm16' : 'AddForm16B');
    this.totalCount = this.selectedFiles.length;
    this.completedCount = 0;
    this.progressPercent = 0;
    this.messages = [];
    
    this.isProcessing = true;

    const fileBase64List = await Promise.all(
      this.selectedFiles.map(file => this.fileToBase64(file))
    );

    from(fileBase64List)
      .pipe(
        concatMap((base64Data, index) => {
          const file = this.selectedFiles[index];
          let fName = file.name.split('_')[0]; // Get PAN part before "_"
          if (file.name.split('_').length <= 1) {
            fName = file.name.replace('.pdf', ''); // fallback: remove .pdf if no underscore
          }
          const payload = {
             "customerAccountId":encTpAccount,
              "productTypeId":enc_product_type,
              "panCardNumber":fName.toString(),
              "action": enc_action,
              "createdBy":(this.tp_account_id),
              "createdByUserName":this.employer_name,
              "financialYear":this.uploadForm16.value.finYear,
              "originalDocumentName":file.name,
              "documentByteCode":base64Data.split(';base64,')[1],
              "form16RowId":""
          };
          console.log(payload)
          return this._EmployeeService.uploadPanForm16(payload).pipe(
            tap((res: any) => {
              if(res.statusCode == true){
                this.messages.push({ fileName: file.name, Message: res.message,status:'true' });
              }
              else{
                this.messages.push({ fileName: file.name, Message: res.message,status:'false' });
              }
            }),
            catchError((err) => {
             this.messages.push({ fileName: file.name, Message: err.message,status:'error' });
              return null;
            }),
            tap(() => {
              this.completedCount++;
              this.progressPercent = (this.completedCount / this.totalCount) * 100;
            })
          );
        })
      )
      .subscribe({
        complete: () => {
          this.isProcessing = false;
          // this.messages.push('🎉 All uploads completed');
          const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.messages);
          const workbook: XLSX.WorkBook = { Sheets: { data: worksheet }, SheetNames: ['data'] };
          const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
          const blob: Blob = new Blob([excelBuffer], { type: 'application/octet-stream' });

          // Generate dynamic file name
          const formType = this.uploadForm16.value.formType === '16A' ? 'A' : 'B';
          const finYear = this.uploadForm16.value.finYear.replace('-', '_');
          const timestamp = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14);
          const fileName = `Form16${formType}_UploadStatus_${finYear}_${timestamp}.xlsx`;
          
          FileSaver.saveAs(blob, fileName);
          this.GetForm16_Details();
          this.setFormToBlank();  
          this.closeFormModal();
          this.toastr.success('Files uploaded successfully. Please check the Excel report for details.');
        }
      });
  }

  fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  }

  exportExcelToForm16(){
    //this.GetForm16_data

        let exportData = [];
        for (let i = 0; i < this.GetForm16_data.length; i++) {
          exportData.push({
            'Financial Year': this.GetForm16_data[i].financial_year,
            'TP / Org Emp Code': this.GetForm16_data[i].orgempcode?.trim() ? this.GetForm16_data[i].orgempcode : this.GetForm16_data[i].tp_code,
            'EMP Name': this.GetForm16_data[i].emp_name,
            'Form 16 Part A': (this.GetForm16_data[i].form16path != '' && this.GetForm16_data[i].form16path != null)?'Y':'N',
            'Form 16 Part B': (this.GetForm16_data[i].form16b_path != '' && this.GetForm16_data[i].form16b_path != null)?'Y':'N',
          })

        }
      
        const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);
        const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
        const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

        const excelData: Blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const downloadLink: any = document.createElement('a');
        downloadLink.href = window.URL.createObjectURL(excelData);
        let date = new Date()
        downloadLink.download = `Form-16-${date.getMonth() + 1}-${date.getFullYear()}.xlsx`;
        downloadLink.click();

  }


}
