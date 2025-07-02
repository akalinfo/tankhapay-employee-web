import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import jwtDecode from 'jwt-decode';
import { ToastrService } from 'ngx-toastr';
import { SessionService } from 'src/app/shared/services/session.service';
import { VisitorService } from '../../visitor/visitor.service';
import { ReportService } from '../report.service';
import { dongleState, grooveState } from 'src/app/app.animation';
import { retry } from 'rxjs';
declare var $: any;
@Component({
  selector: 'app-esic-report',
  templateUrl: './esic-report.component.html',
  styleUrls: ['./esic-report.component.css'],
  animations: [dongleState, grooveState]
})
export class EsicReportComponent {
  @ViewChild('fileInput', { static: false }) fileInput: ElementRef;
  showSidebar: boolean = false;
  show_Popup:boolean=false;
  tp_account_id: any;
  filteredEmployees: any = [];
  esic_data: any = [];
  data: any = [];
  submit_esic_data: any = [];
  header_checkbox: boolean = false;
  decoded_token: any;
  currentDate: any;
  filterStatus: any = 'NG';
  p: number = 1;
  currentDateString: any;
  visitor_list_data: any = [];
  fileNames: string[] = [];
  update_esic_data: any = [];
  employer_name: any = '';
  base64String: any;
  base64Strings: string[] = [];
  fileName:any;
  emp_name: any;
  emp_code: any;
  ESI_NUMBER: any;
  esiccardpath: any;
  actualIndex:any
  file_name:any
  document_byte_code:any;
  emp_id: any;
  dispensary_address: any;
  ESIC_Form: FormGroup;
  esicForm: FormGroup;
  message: any;
  idx:any;
  constructor(
    private _VisitorService: VisitorService,
    private toastr: ToastrService,
    private _sessionService: SessionService,
    private router: Router,
    private _ReportService: ReportService,
    private _formBuilder: FormBuilder,
  ) {
    this.currentDate = new Date();
    this.currentDateString = this.currentDate.toString().slice(0, -30);
  }


  ngOnInit() {
    let session_obj: any = JSON.parse(this._sessionService.get_user_session());
    this.decoded_token = jwtDecode(session_obj.token);
    this.tp_account_id = this.decoded_token.tp_account_id;
    this.employer_name = this.decoded_token.name;
    // console.log(decoded_token);

    this.ESIC_Report('NG');

    this.esicForm = this._formBuilder.group({
      filterStatus: ['NG', [Validators.required]],
    });
  }

  toggle() {
    this.showSidebar = !this.showSidebar;
  }
  onRadioChange(filter: any) {
    this.filterStatus = filter.target.value;
    this.ESIC_Report(this.filterStatus);
  }

  search(key: any) {
    let invKey = key.target.value;
    this.p = 0;
    this.filteredEmployees = this.esic_data.filter(function (element: any) {

      return element.orgempcode.toLowerCase().includes(invKey.toLowerCase())||
      element.tpcode.toLowerCase().includes(invKey.toLowerCase())||
        element.emp_name.toString().toLowerCase().includes(invKey.toLowerCase()) ||
        element.mobile.toString().toLowerCase().includes(invKey.toLowerCase())||
        element.esinumber.toString().toLowerCase().includes(invKey.toLowerCase())
    });

  }

  selectAll(event: any) {
    this.header_checkbox = event.target.checked;

    if (this.header_checkbox) {
      // Select all rows based on a condition (e.g., status === 'pending')
      this.esic_data.forEach(row => row.isSelected = true);
    } else {
      // Deselect all rows
      this.esic_data.forEach(row => row.isSelected = false);
    }
  }
  onCheckbox_Change(event: any, row: any, index: any) {
    row.isSelected = event.target.checked;
    // Check if all rows are selected or not
    this.header_checkbox = this.esic_data.every(row => row.isSelected);
  }

  isAnyCheckboxChecked(): boolean {
    return this.esic_data.some(row => row.isSelected);
  }

  onFileSelected(event: Event, index: number) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) {
      this.base64String = '';
      this.fileName = '';
      this.clearFileData(index, input);
      return;
    }

    const file = input.files[0];
    if (file.size > 1048576) {
      this.toastr.error('Uploaded ESIC document must be less than 1 MB.', 'File Size Error');
      this.clearFileData(index, input);
      return;
    }

    const reader = new FileReader();
    
    reader.onload = () => {
        const arrayBuffer = reader.result as ArrayBuffer;
        const byteArray = new Uint8Array(arrayBuffer);
        const base64String = this.byteArrayToBase64(byteArray);
        
        // Assign base64 to the specific index and store globally
        this.base64Strings[index] = base64String;
        this.fileNames[index] = file.name;

        this.base64String = base64String; // Ensure this is available for submission
        this.fileName = file.name;

        // Only call submitEsicBusiness after reading file successfully
        console.log('File read successfully:', this.fileName, this.base64String);
    };

    reader.onerror = (error) => {
        console.error('Error reading file:', error);
    };

    reader.readAsArrayBuffer(file); // Asynchronously read the file
}

clearFileData(index: number, input?: HTMLInputElement): void {
  this.base64Strings[index] = '';
  this.fileNames[index] = 'No file chosen';
  this.base64String = '';
  this.fileName = '';
  if (input) {
    input.value = ''; // Reset the input field
  }
}
byteArrayToBase64(byteArray: Uint8Array): string {
    let binary = '';
    const len = byteArray.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(byteArray[i]);
    }
    return window.btoa(binary);
}

  close_Popup(){
    this.show_Popup=false;
  }
  ESIC_Report(Filterstatus: any) {
    this._ReportService.complianceFlagReportForBusiness({
      "compliancesFlag": "ESIC",
      "filterStatus": Filterstatus,
      "customerAccountId": this.tp_account_id.toString(),
      "orgUnitId": this.decoded_token.geo_location_id?.toString()
    }).subscribe((resData: any) => {
      if (resData.statusCode) {
        this.esic_data = resData.commonData;
        this.filteredEmployees = this.esic_data;
      } else {
        this.filteredEmployees = [];
        this.esic_data = [];
        this.toastr.error(resData.message, 'Oops!');
      }
    });
  }

  confirmation() {
    const message = window.confirm('Are you sure you want to process selected records?');
    if (message) {
        this.SubmitEsic_Business();
    } else {
        console.log('Operation cancelled');
    }
}

submitEsicBusiness(index: number): void {
    const row = this.filteredEmployees[index];
    const esinumber = row?.Esinumber;
    const fileName = this.fileNames[index];
    const base64String = this.base64Strings[index];
    const dispensaryAddress = row?.dispensaryAddress || row?.esicdispensoryaddress;

    //  console.log('Submitting ESIC for row', index, fileName,esinumber,dispensaryAddress);

    this._ReportService.SubmitEsicForBusiness({
        "empId": row.emp_id?.toString(),
        "empCode": row.emp_code?.toString(),
        "customerAccountId": this.tp_account_id.toString(),
        "createdBy": this.tp_account_id.toString(),
        "esicNumber": esinumber?.toString(),
        "dispensaryAddress": dispensaryAddress,
        "documentUploadType": "Insert",
        "documentByteCode": base64String,
        "originalDocumentName": fileName, 
        "documentFilePath": ""
    }).subscribe((resData: any) => {
        if (resData.statusCode) {
            this.submit_esic_data = resData.commonData;
            this.ESIC_Report(this.filterStatus);
            this.toastr.success(resData.message, 'Success!');
        } else {
            this.submit_esic_data = [];
            this.toastr.error(resData.message, 'Error!');
        }
    });
}

SubmitEsic_Business(): void {
  const checkedRows = this.filteredEmployees.filter(row => row.isSelected);
  checkedRows.forEach((row, index) => {
       this.actualIndex = this.filteredEmployees.indexOf(row); // Get the actual index
       this.submitEsicBusiness(this.actualIndex); 
  });
}

  updateEsicpopup(report_JSON: any,id:any) {
    this.show_Popup=true;
    this.fileName='';
    this.emp_name = report_JSON.emp_name;
    this.emp_code = report_JSON.emp_code;
    this.ESI_NUMBER = report_JSON.esinumber;
    this.dispensary_address = report_JSON.esicdispensoryaddress;
    this.emp_id = report_JSON.emp_id;
    this.esiccardpath = report_JSON.esiccardpath
    this.idx=id;

    if (this.fileInput && this.fileInput.nativeElement) {
      this.fileInput.nativeElement.value = '';
    }

    this.base64String = '';
    this.fileName = '';
  }

  handleUpdateEsicBusiness(): void {
    if (window.confirm('Are you sure you want to update ESIC detail?')) {
      if (this.base64String && this.base64String.length > 0) {
        this.Insert_UpdateEsic_Business();
      } else {
        this.updateEsic_Business();
      }
    }
  }

  updateEsic_Business(): void {
    this.base64String = '';
    this.fileName = '';

    this._ReportService.SubmitEsicForBusiness({
      "empId": this.emp_id.toString(),
      "empCode": this.emp_code.toString(),
      "customerAccountId": this.tp_account_id.toString(),
      "createdBy": this.tp_account_id.toString(),
      "esicNumber": this.ESI_NUMBER.toString(),
      "dispensaryAddress": this.dispensary_address,
      "documentUploadType": "Update",
      "documentByteCode": "",
      "originalDocumentName": "",
      "documentFilePath": this.esiccardpath
    }).subscribe((resData: any) => {
      if (resData.statusCode) {
        this.update_esic_data = resData.commonData;
        this.ESIC_Report(this.filterStatus);
        this.close_Popup();
        this.toastr.success(resData.message, 'Success!');
      } else {
        this.update_esic_data = [];
        this.toastr.error(resData.message, 'Error!');
      }
    });
    // });
  }

  Insert_UpdateEsic_Business(): void {
    this._ReportService.SubmitEsicForBusiness({
      "empId": this.emp_id.toString(),
      "empCode": this.emp_code.toString(),
      "customerAccountId": this.tp_account_id.toString(),
      "createdBy": this.tp_account_id.toString(),
      "esicNumber": this.ESI_NUMBER.toString(),
      "dispensaryAddress": this.dispensary_address,
      "documentUploadType": "Insert",
      "documentByteCode": this.base64String,
      "originalDocumentName": this.fileName,
      "documentFilePath": ""
    }).subscribe((resData: any) => {
      if (resData.statusCode) {
        this.update_esic_data = resData.commonData;
        this.ESIC_Report(this.filterStatus);
        this.close_Popup();
        this.toastr.success(resData.message, 'Success!');
      } else {
        this.update_esic_data = [];
        this.toastr.error(resData.message, 'Error!');
      }
    });
  }



}
