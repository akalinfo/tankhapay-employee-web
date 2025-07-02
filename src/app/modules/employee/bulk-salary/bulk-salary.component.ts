import { Component } from '@angular/core';
import * as XLSX from 'xlsx'
import { EmployeeService } from '../employee.service';
import { EncrypterService } from 'src/app/shared/services/encrypter.service';
import { SessionService } from 'src/app/shared/services/session.service';
import decode from 'jwt-decode';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { concatMap, delay, finalize, from, mergeMap, tap } from 'rxjs';
declare var $: any;

@Component({
  selector: 'app-bulk-salary',
  templateUrl: './bulk-salary.component.html',
  styleUrls: ['./bulk-salary.component.css']
})
export class BulkSalaryComponent {
  showSidebar: boolean = true;
  product_type: any;
  tp_account_id: any;
  Candidate_sal_data: any = [];
  token: any;
  excelBulkEmpUploadArray: any = [];
  excelToTableData: any = [];
  invalidRow: any = [];
  showDetails: any = [];
  calculatedData: any = [];
  isSalaryCalculated: boolean = false;
  isInvalidData: boolean = false;
  leaveTemplateData: any = [];
  savedRecords: number;
  totalRecords: any;
  isSaving: boolean = false;
  apiErrors: any = [];
  isApiError: boolean = false;
  constructor(private _EmployeeService: EmployeeService,
    private _EncrypterService: EncrypterService,
    private _SessionService: SessionService,
    private toastr: ToastrService,
    private router: Router
  ) { }

  ngOnInit() {
    let session_obj_d: any = JSON.parse(this._SessionService.get_user_session());
    this.token = decode(session_obj_d.token);
    this.tp_account_id = this.token.tp_account_id;
    this.product_type = localStorage.getItem('product_type');
    // this.exportToExcel()/
  }
  toggle() {
    this.showSidebar = !this.showSidebar;
  }

  exportToExcel() {

    this._EmployeeService.getCandidatesWhoseSalarySetupIsPending({
      'productTypeId': this._EncrypterService.aesEncrypt(this.product_type),
      'customerAccountId': this._EncrypterService.aesEncrypt(this.tp_account_id.toString()),
    }).subscribe((resData: any) => {
      if (resData.statusCode) {
        this.Candidate_sal_data = JSON.parse(this._EncrypterService.aesDecrypt(resData.commonData));
        // console.log(this.Candidate_sal_data);
        let exportData = [];

        for (let idx = 0; idx < this.Candidate_sal_data.length; idx++) {
          let obj = {
            'Employee Name': this.Candidate_sal_data[idx].emp_name,
            'Org Emp Code': this.Candidate_sal_data[idx].orgempcode,
            'TP Code': this.Candidate_sal_data[idx].cjcode,
            'Mobile': this.Candidate_sal_data[idx].mobile,
            'Minwage State': this.Candidate_sal_data[idx].minwagesstate,
            'Location Type (Metro/Non Metro)': this.Candidate_sal_data[idx].location_type,
            'Job Type': this.Candidate_sal_data[idx].jobtype,
            'Salary Effective Date (DD/MM/YYYY)': "'",
            'Salary Days Opted (Y/N)': '',
            'Salary Days (22/26/30)': this.Candidate_sal_data[idx].salary_days,
            'PF Cap Applied (Y/N)': '',
            'PF Opted (Y/N)': '',
            'ESIC Opted (Y/N)': '',
            'Professional Tax State Applicable?': '',
            'LWF State Applicable?': '',
            'CTC (Monthly)': '',
            'Basic %': '',
            'Is Hourly Setup': '',

            // 'CJ Code': this.Candidate_sal_data[idx].cjcode,
            // 'Date Of Birth': this.Candidate_sal_data[idx].dateofbirth,
          }

          exportData.push(obj);
        }

        // console.log(exportData);
        const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);
        const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
        const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const data: Blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const downloadLink: any = document.createElement('a');
        downloadLink.href = window.URL.createObjectURL(data);
        let date = new Date()
        downloadLink.download = `Bulk Salary Employee(s).xlsx`;
        downloadLink.click();
      }
    })
  }

  onFileChange(event: any) {
    this.excelBulkEmpUploadArray = [];
    this.excelToTableData = [];
    /* wire up file reader */
    const target: DataTransfer = <DataTransfer>(event.target);
    if (target.files.length !== 1) {
      throw new Error('Cannot use multiple files');
    }
    const reader: FileReader = new FileReader();
    reader.readAsBinaryString(target.files[0]);
    reader.onload = (e: any): any => {
      /* create workbook */


      const binarystr: string = e.target.result;
      const wb: XLSX.WorkBook = XLSX.read(binarystr, { type: 'binary' });

      /* selected the first sheet */
      const wsname: any = wb.SheetNames[0];
      const ws: XLSX.WorkSheet = wb.Sheets[wsname];
      const headers = this.extractHeaders(ws);
      if (!this.verifyHeaders(headers)) {
        return this.toastr.info("Please download the latest Add Bulk Employee template");
      }

      /* save data */
      const data = XLSX.utils.sheet_to_json(ws, { defval: '' }); // to get 2d array pass 2nd parameter as object {header: 1}
      // console.log(data); // Data will be logged in array format containing objects
      this.excelBulkEmpUploadArray = data;

      if (this.excelBulkEmpUploadArray.length > 100) {
        return this.toastr.info("Up to 100 records can be uploaded at a time. Please split the file and try again");
      }

      const mobileregex = /^[6-9]{1}[0-9]{9}$/;
      const dateRegex = /^[0-9]{2}[./-][0-9]{2}[./-][0-9]{4}$/;

      this.excelBulkEmpUploadArray.map(el => {

        this.excelToTableData.push({
          mobile: el['Mobile'] !== undefined ? el['Mobile'] : '',
          orgEmpCode: el['Org Emp Code'] !== undefined ? el['Org Emp Code'] : '',
          tpCode: el['TP Code'] !== undefined ? el['TP Code'] : '',
          empName: el['Employee Name'] !== undefined ? el['Employee Name'] : '',
          minwagesState: el['Minwage State'] !== undefined ? el['Minwage State'] : '',
          locationType: el['Location Type (Metro/Non Metro)'] !== undefined ? el['Location Type (Metro/Non Metro)']?.trim() : '',
          salaryDaysOpted: el['Salary Days Opted (Y/N)'] != undefined ? el['Salary Days Opted (Y/N)']?.toString()?.toUpperCase() : '',
          salaryDays: el['Salary Days (22/26/30)'] !== undefined ? el['Salary Days (22/26/30)'] : '',
          salaryEffectiveDate: el['Salary Effective Date (DD/MM/YYYY)'] !== undefined ? el['Salary Effective Date (DD/MM/YYYY)'].replace("'", '') : '',
          pfCapApplied: el['PF Cap Applied (Y/N)'] !== undefined ? el['PF Cap Applied (Y/N)']?.toString()?.toUpperCase() : '',
          pfOpted: el['PF Opted (Y/N)'] !== undefined ? el['PF Opted (Y/N)']?.toString()?.toUpperCase() : '',
          esicOpted: el['ESIC Opted (Y/N)'] !== undefined ? el['ESIC Opted (Y/N)']?.toString()?.toUpperCase() : '',
          professionalTaxStateApplicable: el['Professional Tax State Applicable?'] !== undefined ? el['Professional Tax State Applicable?']?.toUpperCase() : '',
          lwfStateApplicable: el['LWF State Applicable?'] !== undefined ? el['LWF State Applicable?']?.toString()?.toUpperCase() : '',
          ctc: el['CTC (Monthly)'] !== undefined ? el['CTC (Monthly)']?.toString().trim() : '',
          basicPercentage: el['Basic %'] !== undefined ? el['Basic %']?.toString().trim() : '',
          isValidMobile: el['Mobile'] && el['Mobile'].toString().length == 10 && el['Mobile']?.toString()?.match(mobileregex) != null ? true : false,
          isValidName: el['Employee Name'] && /^[A-Za-z ]+$/.test(el['Employee Name']) ? true : false,
          isValidMinWageSate: el['Minwage State'] && /^[A-Za-z ]+$/.test(el['Minwage State']) ? true : false,
          isValidLocationType: el['Location Type (Metro/Non Metro)'] && /^[A-Za-z ]+$/.test(el['Location Type (Metro/Non Metro)']) ? true : false,
          isValidDate: el['Salary Effective Date (DD/MM/YYYY)'] && el['Salary Effective Date (DD/MM/YYYY)']?.toString().trim().match(dateRegex) != null ? true : false,
          isValidSalaryDays: el['Salary Days (22/26/30)'] && (el['Salary Days (22/26/30)'] == 22 || el['Salary Days (22/26/30)'] == 26 || el['Salary Days (22/26/30)'] == 30) ? true : false,
          isValidCTC: el['CTC (Monthly)'] && el['CTC (Monthly)'].toString().trim().match(/^[0-9.]+$/) != null ? true : false,
          isValidBasic: el['Basic %'] && el['Basic %'].toString().trim().match(/^[0-9.]+$/) != null && el['Basic %'] >= 0 && el['Basic %'] <= 100 ? true : false,

          // Start - Add is hourly setup while uploading doc as per sample template
          ishourlysetup: el['Is Hourly Setup'] !== undefined ? el['Is Hourly Setup'] : 'N',
          // End - Add is hourly setup

        })
      })

      for (let i = 0; i < this.excelToTableData.length; i++) {
        const row = this.excelToTableData[i];
        if (!row.mobile || !row.tpCode || !row.minwagesState || !row.locationType ||
          !row.salaryEffectiveDate || !row.salaryDaysOpted || (row.salaryDaysOpted != 'Y' && row.salaryDaysOpted != 'N') || !row.salaryDays
          || !row.pfCapApplied || (row.pfCapApplied != 'Y' && row.pfCapApplied != 'N') || !row.pfOpted || (row.pfOpted != 'Y' &&
            row.pfOpted != 'N') || !row.esicOpted || (row.esicOpted != 'Y' && row.esicOpted != 'N') || !row.professionalTaxStateApplicable ||
          (row.professionalTaxStateApplicable != 'Y' && row.professionalTaxStateApplicable != 'N') || !row.lwfStateApplicable ||
          (row.lwfStateApplicable != 'Y' && row.lwfStateApplicable != 'N') || !row.ctc || !row.basicPercentage || !row.isValidMobile || !row.isValidName
          || !row.isValidMinWageSate || !row.isValidLocationType || !row.isValidDate || !row.isValidSalaryDays
          || !row.isValidCTC || !row.isValidBasic
        ) {
          this.invalidRow[i] = true;
          this.isInvalidData = true;
        }

      }

    };
  }

  removeErrorRecords() {
    let excel = this.excelToTableData;
    this.excelToTableData = excel.filter((_: any, i) => !this.invalidRow[i]);
    if (this.excelToTableData.length == 0) {
      $('#salary_input').val('');
    }
    this.isInvalidData = false;
    this.apiErrors = [];
    this.isApiError = false;
    this.calculatedData = [];
    this.invalidRow = [];
  }

  clearInput() {
    $('#salary_input').val('');
    this.excelToTableData = [];
    this.excelBulkEmpUploadArray = [];
    this.invalidRow = [];
    this.apiErrors = [];
    this.isApiError = false;
    this.calculatedData = [];
    this.isSalaryCalculated = false;
    this.invalidRow = [];
    this.isInvalidData = false;
  }

  toggleDetails(index: number): void {
    this.showDetails[index] = !this.showDetails[index];
  }

  extractHeaders(worksheet: XLSX.WorkSheet): string[] {
    // Assuming the headers are in the first row
    const range = XLSX.utils.decode_range(worksheet['!ref']);
    const headers: string[] = [];
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cellAddress = { c: C, r: 0 }; // Assuming headers are in row 0
      const headerCell = XLSX.utils.encode_cell(cellAddress);
      headers.push(worksheet[headerCell]?.v);
    }
    return headers;
  }

  verifyHeaders(headers: string[]): boolean {
    // Define your expected header names
    const expectedHeaders = ["Employee Name", "Org Emp Code", "TP Code", "Mobile", "Minwage State",
      "Location Type (Metro/Non Metro)", "Job Type", "Salary Effective Date (DD/MM/YYYY)", "Salary Days Opted (Y/N)", "Salary Days (22/26/30)",
      "PF Cap Applied (Y/N)", "PF Opted (Y/N)", "ESIC Opted (Y/N)", "Professional Tax State Applicable?",
      "LWF State Applicable?", "CTC (Monthly)", "Basic %", "Is Hourly Setup"
    ];

    return expectedHeaders.every((expectedHeader, index) => headers[index] === expectedHeader);

    // Compare the expected headers with the actual headers
  }

  calculateSal(): any {
    let postData = [];

    for (let i = 0; i < this.excelToTableData.length; i++) {

      if (!this.invalidRow[i]) {
        let row = this.excelToTableData[i];
        postData.push({
          productType: this.product_type,
          customerAccountId: this.tp_account_id.toString(),
          mobile: row.mobile,
          tpCode: row.tpCode,
          minWagesStateName: row.minwagesState,
          locationType: row.locationType,
          mop: row.ctc,
          basicSalaryPercent: row.basicPercentage,
          salaryDaysOpted: row.salaryDaysOpted,
          salaryDays: row.salaryDays,
          pfOpted: row.pfOpted,
          pfCapApplied: row.pfCapApplied,
          esiOpted: row.esicOpted,
          effectiveFrom: row.salaryEffectiveDate,
          ptApplied: row.professionalTaxStateApplicable,
          lwfApplied: row.lwfStateApplicable,
          // added on 30.05.2025
          isHourlySetup: row.ishourlysetup ? row.ishourlysetup : 'N'
          //end
        })
      } else {
        return this.toastr.error('Please fix or remove error records.');
      }
    }

    this._EmployeeService.calculateCandidateSalaryForExcel(postData).subscribe((resData: any) => {
      if (resData.code === "TP-200" && resData.response && resData.response.length > 0) {
        const exportData = [];
        this.leaveTemplateData = JSON.parse(this._EncrypterService.aesDecrypt(resData.templateData));
        let idx = 0;
        resData.response.forEach((resp: any, i: number): any => {
          if (resp.statusCode) {
            try {
              const decryptedData = this._EncrypterService.aesDecrypt(resp.commonData);
              this.isSalaryCalculated = true;
              this.calculatedData[idx] = JSON.parse(decryptedData);
              // this.excelToTableData.splice(i,1);
              idx++;
              // console.log(this.calculatedData);
            } catch (error) {
              this.toastr.error("Error in decrypting or parsing the data: ", error);
            }
          } else {
            this.invalidRow[idx] = true;
            this.apiErrors[idx] = resp.message;
            this.isApiError = true;
            idx++;
            // return this.toastr.error(`Error in row ${i+1}: ${resp.message}`)
          }
        })

      } else {
        this.toastr.error(resData.message);
      }
    })
  }

  // saveSalary(){
  //   this.isSaving = true;
  //   let successfulSaves = 0;
  //   from(this.calculatedData).pipe(
  //     // concatMap to process one record at a time
  //     concatMap((data, index) => {
  //       let sal_struct = [];
  //       sal_struct.push(data); // Push the salary details of the current iteration
  //      console.log(sal_struct);
  //       // Create postData for each record
  //       let postData = {
  //         'jsId': data['js_id'],
  //         'dateOfJoining': data['dateofjoining'],
  //         'tpSalaryStructure': sal_struct,
  //         'jobRole': data['post_offered'],
  //         'customerAccountId': this.tp_account_id.toString(),
  //         'tpLeaveTemplateId': this.leaveTemplateData[0].templateid.toString(),
  //         'updatedBy': this.token.id,
  //         'minWageStateName': this.excelToTableData[index].minwagesState,
  //         'productTypeId': this.product_type
  //       };

  //       // Call the service to save the data and return the observable
  //       return this._EmployeeService.setupSalary(postData).pipe(
  //         tap((resData: any) => {
  //           if (resData.statusCode) {
  //             successfulSaves++;
  //             this.toastr.success(`Record ${index + 1} saved successfully!`);
  //           } else {
  //             this.toastr.error(`Error saving record ${index + 1}: ${resData.message}`);
  //           }
  //         }),
  //         delay(500) // Simulate delay
  //       );
  //     }),
  //     finalize(() => {
  //       // return;
  //       this.isSaving = false;
  //       if (successfulSaves === this.calculatedData.length) {
  //         this.router.navigate(['/employees']); // Redirect after all records are saved
  //       } else {
  //         this.toastr.warning('Some records were not saved successfully.');
  //       }
  //     })
  //   ).subscribe({
  //     error: (err) => {
  //       this.isSaving = false;
  //       this.toastr.error('An error occurred while saving records.');
  //     }
  //   });

  // }


  saveSalary() {
    this.isSaving = true;
    let successfulSaves = 0;
    from(this.calculatedData).pipe(
      // Use mergeMap for parallel requests (set concurrency as needed)
      mergeMap((data, index) => {
        let sal_struct = [];
        sal_struct.push(data);
        let postData = {
          'jsId': data['js_id'],
          'dateOfJoining': data['dateofjoining'],
          'tpSalaryStructure': sal_struct,
          'jobRole': data['post_offered'],
          'customerAccountId': this.tp_account_id.toString(),
          'tpLeaveTemplateId': this.leaveTemplateData[0].templateid.toString(),
          'updatedBy': this.token.id,
          'minWageStateName': this.excelToTableData[index].minwagesState,
          'productTypeId': this.product_type
        };
        return this._EmployeeService.setupSalary(postData).pipe(
          tap((resData: any) => {
            if (resData.statusCode) {
              successfulSaves++;
              this.toastr.success(`Record ${index + 1} saved successfully!`);
            } else {
              this.toastr.error(`Error saving record ${index + 1}: ${resData.message}`);
            }
          }),
          // delay(500)
        );
      }, 10), // 5 = concurrency limit, adjust as needed
      finalize(() => {
        this.isSaving = false;
        if (successfulSaves === this.calculatedData.length) {
          this.router.navigate(['/employees']);
        } else {
          this.toastr.warning('Some records were not saved successfully.');
        }
      })
    ).subscribe({
      error: (err) => {
        this.isSaving = false;
        this.toastr.error('An error occurred while saving records.');
      }
    });
  }
    get_pt_applicable(salary:any) {
    if (!salary.ptid) {
      return 'N';
    }

    if (salary.ptid > 0) {
      return 'Y';
    } else {
      return 'N';
    }
  }
}
