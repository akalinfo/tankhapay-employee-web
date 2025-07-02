import { Component, HostListener } from '@angular/core';
import * as XLSX from 'xlsx';
import { EmployeeService } from '../employee.service';
import { EncrypterService } from 'src/app/shared/services/encrypter.service';
import { SessionService } from 'src/app/shared/services/session.service';
import { PayoutService } from '../../payout/payout.service';
import decode from 'jwt-decode'
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
declare var $: any;
import { firstValueFrom, from, of } from 'rxjs';
import { mergeMap, map, catchError } from 'rxjs/operators';
import { FaceCheckinService } from '../../attendance/face-checkin.service';



@Component({
  selector: 'app-bulk-employee',
  templateUrl: './bulk-employee.component.html',
  styleUrls: ['./bulk-employee.component.css']
})
export class BulkEmployeeComponent {
  showSidebar: boolean = true;
  excelBulkEmpUploadArray: any = [];
  excelToTableData: any = [];
  product_type: string;
  token: any = '';
  Candidate_sal_data: any = [];
  tp_account_id: any = '';
  tableDataValidation: any = [];
  excelErrorMsg: any = [];
  excelerrors: any = [];
  isExcelErrorFree: boolean = false;
  invalidRow: any = [];
  isAddemployee: boolean = true;
  payout_method: any;
  isInvalidData: boolean = false;
  showDropdown: boolean = false;
  isActiveEmp: boolean = false
  validateArr: any = [];
  resultLog: any = [];
  mobileObj: any = [];
  empCodeObj: any = [];
  isLoader: boolean = false;
  master_data: any = [];
  vendor_master_list_data: any[];
  salarybooked: any;
  progressPercentage: any = [];
  showProgressLoader: boolean = false;


  constructor(
    private _EmployeeService: EmployeeService,
    private _EncrypterService: EncrypterService,
    private _SessionService: SessionService,
    private toastr: ToastrService,
    private router: Router,
    private http: HttpClient,
    private _payoutService: PayoutService,
    private _faceCheckinService: FaceCheckinService

  ) {

  }

  ngOnInit() {
    let session_obj_d: any = JSON.parse(this._SessionService.get_user_session());
    this.token = decode(session_obj_d.token);
    this.tp_account_id = this.token.tp_account_id;
    this.product_type = localStorage.getItem('product_type');
    this.payout_method = this.token.payout_mode_type;
    // console.log(this.payout_method);
    this.getProjectList();
  }

  toggle() {
    this.showSidebar = !this.showSidebar;
  }

  exportToExcel(status: string) {
    this._EmployeeService.getCustomerEmployeeDetails({
      'customerAccountId': this.tp_account_id.toString(), 'productTypeId': this.product_type,
      GeoFenceId: this.token.geo_location_id, ouIds: this.token.ouIds,
      department: '',
      designation: '',
      searchKeyword: '',
      employeesStatus: status
    }).subscribe((resData: any) => {
      if (resData.statusCode) {
        let data: any = JSON.parse(this._EncrypterService.aesDecrypt(resData.commonData));
        // console.log(data)
        // return
        let exportData = [];
        for (let i = 0; i < data.length; i++) {
          if (this.payout_method == 'attendance') {
            exportData.push({
              'Employee Name*': data[i].emp_name,
              "Father/Husband's Name*": data[i].fathername,
              'Gender(M/F/T)*': data[i].gender,
              'DOB(DD/MM/YYYY)*': data[i].dateofbirth,
              'DOJ(DD/MM/YYYY)*': data[i].dateofjoining,
              'Mobile no*': data[i].mobile,
              'Email Id': data[i].email,
              'Personal Email Id': data[i]?.personal_email,
              "Job Type": data[i].job_type
            })
          } else {
            // console.log(data[i].permanent_address);

            let jsonData = data[i].permanent_address ? JSON.parse(data[i].permanent_address) : data[i].permanent_address;
            let nonemptyVal = Object.values(jsonData).filter(value => value !== "");
            let perm_add = nonemptyVal.join(', ')?.replaceAll('<br>', '');
            if (status == 'Onboarding Pending') {
              exportData.push({
                "Employee Name*": data[i].emp_name,
                "Father/Husband's Name*": data[i].fathername,
                "Gender(M/F/T)*": data[i].gender,
                "DOB(DD/MM/YYYY)*": data[i].dateofbirth,
                "DOJ(DD/MM/YYYY)*": data[i].dateofjoining,
                "Designation": data[i].post_offered,
                "Department": data[i].posting_department,
                "Mobile no*": data[i].mobile,
                "Email Id": data[i].email,
                "Job Type": data[i].jobtype,
                "Aadhaar Card No*": data[i].aadhar_card_no,
                "Pan Card No*": data[i].pancard,
                "Bank AC No*": data[i].bankaccountno,
                "IFSC Code*": data[i].ifsccode,
                'Bank Name*': data[i].bank_name,
                'Bank Branch*': data[i].bank_branch,
                'PF rqd(Y/N)*': data[i].pf_applicable,
                'UAN No': data[i].uannumber,
                'ESIC rqd(Y/N)*': data[i].esi_applicable,
                'ESIC No': data[i].esinumber,
                'ESIC Dependent Details': data[i]?.esic_dependent_details,
                'Relation Emergency Contact No': data[i].emergency_contact,
                'Blood Relation Name': data[i].bloodrelationname,
                'Permanent Address*': perm_add,
                'Residential Address': data[i].residential_address,
                'Org Emp Code': data[i].orgempcode,
                'Reporting Manager Name': data[i].reportingmanagername,
                'Job Type Category': data[i].jobtype_category,
                'Vendor Name': data[i].agencyname,
                'Salary Booked Under Project': data[i].salary_book_project,
                'Contractenddate(DD/MM/YYYY)': data[i].contractenddate,
                'Probationconfirmationdate(DD/MM/YYYY)': data[i].probation_confirmation_date,
                'Personal Email Id': data[i]?.personal_email,
                'Org Unit Name': data[i]?.assignedous,
              })
            } else if (status == 'Active') {
              exportData.push({
                "Employee Name*": data[i].emp_name,
                "Mobile no*": data[i].mobile,
                "TP Code": data[i].tpcode,
                "Father/Husband's Name*": data[i].fathername,
                "Gender(M/F/T)*": data[i].gender,
                "DOB(DD/MM/YYYY)*": data[i].dateofbirth,
                "Designation": data[i].post_offered,
                "Department": data[i].posting_department,
                "Email Id": data[i].email,
                "Aadhaar Card No*": data[i].aadhar_card_no,
                "Pan Card No*": data[i].pancard,
                "Bank AC No*": data[i].bankaccountno,
                "IFSC Code*": data[i].ifsccode,
                'Bank Name*': data[i].bank_name,
                'Bank Branch*': data[i].bank_branch,
                'isAccountNoVerified': data[i].account_verification_status,
                'UAN No': data[i].uannumber,
                'ESIC No': data[i].esinumber,
                'ESIC Dependent Details': data[i]?.esic_dependent_details,
                'Relation Emergency Contact No': data[i].emergency_contact,
                'Blood Relation Name': data[i].bloodrelationname,
                'Permanent Address*': perm_add,
                'Residential Address': data[i].residential_address,
                'Org Emp Code': data[i].orgempcode,
                'Reporting Manager Name': data[i].reportingmanagername,
                'Job Type Category': data[i].jobtype_category,
                'Vendor Name': data[i].agencyname,
                'Salary Booked Under Project': data[i].salary_book_project,
                'Contractenddate(DD/MM/YYYY)': data[i].contractenddate,
                'Probationconfirmationdate(DD/MM/YYYY)': data[i].probation_confirmation_date,
                'Personal Email Id': data[i]?.personal_email,
                'Org Unit Name': data[i]?.assignedous,

              })
            }
          }
        }

        const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);
        const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
        const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

        const excelData: Blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const downloadLink: any = document.createElement('a');
        downloadLink.href = window.URL.createObjectURL(excelData);
        let date = new Date()
        downloadLink.download = `Bulk_Employee_List.xlsx`;
        downloadLink.click();
      }
    })

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
    const expectedHeaders = ["Employee Name*", "Father/Husband's Name*", "Gender(M/F/T)*", "DOB(DD/MM/YYYY)*",
      "DOJ(DD/MM/YYYY)*", "Designation", "Department", "Mobile no*", "Email Id", "Job Type", "Aadhaar Card No*", "Pan Card No*", "Bank AC No*",
      "IFSC Code*", "Bank Name*", "Bank Branch*", "PF rqd(Y/N)*", "UAN No", "ESIC rqd(Y/N)*", "ESIC No", "ESIC Dependent Details",
      "Relation Emergency Contact No", "Blood Relation Name", "Permanent Address*", "Residential Address", "Org Emp Code",
      "Reporting Manager Name", "Job Type Category", "Vendor Name", "Salary Booked Under Project", "Contractenddate(DD/MM/YYYY)", "Probationconfirmationdate(DD/MM/YYYY)",
      "Org Unit Name"
    ]
    const expectedActiveHeaders = ["Employee Name*", "Mobile no*", "TP Code", "Father/Husband's Name*", "Gender(M/F/T)*", "DOB(DD/MM/YYYY)*",
      "Designation", "Department", "Email Id", "Aadhaar Card No*", "Pan Card No*", "Bank AC No*",
      "IFSC Code*", "Bank Name*", "Bank Branch*", "isAccountNoVerified", "UAN No", "ESIC No", "ESIC Dependent Details",
      "Relation Emergency Contact No", "Blood Relation Name", "Permanent Address*", "Residential Address", "Org Emp Code",
      "Reporting Manager Name", "Job Type Category", "Vendor Name", "Salary Booked Under Project", "Contractenddate(DD/MM/YYYY)", "Probationconfirmationdate(DD/MM/YYYY)",
      "Org Unit Name"
    ]
    const expectedHeadersAttn = ["Employee Name*", "Father/Husband's Name*", "Gender(M/F/T)*",
      "DOB(DD/MM/YYYY)*", "DOJ(DD/MM/YYYY)*", "Mobile no*", "Email Id", "Job Type"
    ]
    if (this.payout_method != 'attendance') {
      this.isActiveEmp = expectedActiveHeaders.every((expectedHeader, index) => headers[index] === expectedHeader);

      return expectedHeaders.every((expectedHeader, index) => headers[index] === expectedHeader) ||
        expectedActiveHeaders.every((expectedHeader, index) => headers[index] === expectedHeader);
    } else {
      return (expectedHeadersAttn.every((expectedHeader, index) => headers[index] === expectedHeader));
    }
    // Compare the expected headers with the actual headers
  }

  onFileChange(event: any) {
    this.isLoader = true;
    this.excelBulkEmpUploadArray = [];
    this.excelToTableData = [];
    this.clearInput('notEmpty');
    this.isInvalidData = false;
    this.isActiveEmp = false;
    /* wire up file reader */
    const target: DataTransfer = <DataTransfer>(event.target);
    if (target.files.length !== 1) {
      this.isLoader = false;
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
        this.isLoader = false;
        return this.toastr.info("Please download the latest Add Bulk Employee template");
      }

      /* save data */
      const data = XLSX.utils.sheet_to_json(ws, { raw: true, defval: '' }); // to get 2d array pass 2nd parameter as object {header: 1}
      // console.log(data, 'test'); // Data will be logged in array format containing objects
      this.excelBulkEmpUploadArray = data;
      // console.log(this.excelBulkAttUploadArray,'harsh11');
      // console.log(this.filteredEmployees);

      if (this.excelBulkEmpUploadArray.length > 500) {
        this.isLoader = false;
        return this.toastr.info("Up to 500 employees can be uploaded at a time. Please split the file and try again");

      }

      const mobileregex = /^[6-9]{1}[0-9]{9}$/;
      const panregex = /^[a-z]{5}[0-9]{4}[a-z]{1}$/;
      const aadharRegex = /^[0-9]{12}$/;
      const dateRegex = /^[0-9]{2}[./-][0-9]{2}[./-][0-9]{4}$/;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const personalEmailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // duplicate added to maintain validity flag
      const ifscRegex = /^[A-Za-z]{4}0[A-Za-z0-9]{6}$/;
      const bankRegex = /^[a-zA-Z\s.-]{2,100}$/

      const mobileDuplicateIndex = new Map();
      const orgEmpCodeDuplicateIndex = new Map();

      const parseDate = (dateString) => {
        const parts = dateString.split('/');
        // parts[0] = day, parts[1] = month, parts[2] = year
        return new Date(parts[2], parts[1] - 1, parts[0]); // Months are 0-indexed in JavaScript
      };

      const currentDate = new Date();
      const futureDate = new Date();
      this.mobileObj = [];
      this.empCodeObj = [];
      futureDate.setDate(currentDate.getDate() + 15);
      if (!this.isActiveEmp) {
        this.excelBulkEmpUploadArray.map((el, _i) => {
          this.excelToTableData.push({
            salutation: el['Salutation'] == undefined ? '' : el['Salutation'],
            fatherName: el[`Father/Husband's Name*`]?.trim(),
            empName: el['Employee Name*']?.trim(),
            gender: el['Gender(M/F/T)*']?.trim() == 'M' ? 'Male' : el['Gender(M/F/T)*']?.trim() == 'F' ? 'Female' : el['Gender(M/F/T)*']?.trim() == 'T' ? 'Other' : el['Gender(M/F/T)*']?.trim(),
            dob: el['DOB(DD/MM/YYYY)*']?.toString()?.replace(/[-.]/g, '/')?.trim(),
            doj: el['DOJ(DD/MM/YYYY)*']?.toString()?.replace(/[-.]/g, '/')?.trim(),
            postOffered: el['Designation'] == undefined ? 'N/A' : el['Designation']?.trim(),
            postingDepartment: el['Department'] == undefined ? '' : el['Department']?.trim(),
            mobile: el['Mobile no*'] == undefined ? '' : el['Mobile no*']?.toString()?.trim(),
            email: el['Email Id'] == undefined ? '' : el['Email Id']?.trim(),
            jobType: el['Job Type'] == undefined ? '' : el['Job Type']?.trim(),
            aadharCardNo: el['Aadhaar Card No*'] == undefined ? '' : el['Aadhaar Card No*']?.toString()?.trim().replace(' ', ''),
            panCardNo: el['Pan Card No*'] == undefined ? '' : el['Pan Card No*']?.trim(),
            bankAccountNo: el['Bank AC No*'] == undefined ? '' : el['Bank AC No*'].toString()?.trim(),
            ifscCode: el['IFSC Code*'] == undefined ? '' : el['IFSC Code*']?.toString()?.trim(),
            bankName: el['Bank Name*'] == undefined ? '' : el['Bank Name*']?.toString()?.trim(),
            bankBranch: el['Bank Branch*'] == undefined ? '' : el['Bank Branch*']?.toString()?.trim(),
            pfOpted: el['PF rqd(Y/N)*'] == undefined || el['PF rqd(Y/N)*'].toLowerCase().trim() == 'no' || el['PF rqd(Y/N)*'].toLowerCase().trim() == 'n' ? 'N' : el['PF rqd(Y/N)*']?.toLowerCase()?.trim() == 'yes' || el['PF rqd(Y/N)*']?.toLowerCase()?.trim() == 'y' ? 'Y' : el['PF rqd(Y/N)*']?.toUpperCase()?.trim(),
            uanNumber: el['UAN No'] == undefined && (el['PF rqd(Y/N)*'] != undefined && (el['PF rqd(Y/N)*'].toLowerCase() == 'y' || el['PF rqd(Y/N)*'].toLowerCase() == 'yes')) ? 'Request For UAN' : (el['UAN No'] == undefined ? '' : el['UAN No'].toString()?.trim()),
            esicOpted: el['ESIC rqd(Y/N)*'] == undefined || el['ESIC rqd(Y/N)*'].toLowerCase().trim() == 'no' || el['ESIC rqd(Y/N)*'].toLowerCase().trim() == 'n' ? 'N' : el['ESIC rqd(Y/N)*'].toLowerCase().trim() == 'yes' || el['ESIC rqd(Y/N)*'].toLowerCase().trim() == 'y' ? 'Y' : el['ESIC rqd(Y/N)*'].toUpperCase()?.trim(),
            esicNumber: el['ESIC No'] == undefined && (el['ESIC rqd(Y/N)*'] != undefined && (el['ESIC rqd(Y/N)*'].toLowerCase() == 'y' || el['ESIC rqd(Y/N)*'].toLowerCase() == 'yes')) ? 'Request For ESIC' : (el['ESIC No'] == undefined ? '' : el['ESIC No'].toString()?.trim()),
            esicDependentDetails: el['ESIC Dependent Details'] == undefined ? '' : el['ESIC Dependent Details']?.trim(),
            emergencyContact: el['Relation Emergency Contact No'] == undefined ? '' : el['Relation Emergency Contact No'],
            bloodRelationName: el['Blood Relation Name'] == undefined ? '' : el['Blood Relation Name']?.trim(),
            permanentAddress: el['Permanent Address*'] == undefined ? '' : el['Permanent Address*']?.trim(),
            residentialAddress: el['Residential Address'] == undefined ? '' : el['Residential Address']?.trim(),
            orgEmpCode: el['Org Emp Code'] == undefined ? '' : el['Org Emp Code']?.toString()?.trim(),
            reportingManagerName: el['Reporting Manager Name'] == undefined ? '' : el['Reporting Manager Name']?.toString()?.trim(),
            jobTypeCategory: el['Job Type Category'] == undefined ? '' : el['Job Type Category']?.toString()?.trim(),
            rowColor: el['Mobile no*']?.toString()?.trim().length == 10 && (el['Mobile no*']?.toString()?.trim()?.match(mobileregex) != null ? true : false),
            panFormat: el['Pan Card No*'] != undefined && el['Pan Card No*']?.trim()?.toLowerCase()?.match(panregex) != null ? true : el['Pan Card No*'] == undefined ? true : false,
            isPan: !el['Pan Card No*'] && this.payout_method != 'self' ? false : true,
            aadharRegex: el['Aadhaar Card No*']?.toString()?.match(aadharRegex) != null ? true : false,
            isAadhar: !el['Aadhaar Card No*'] && this.payout_method != 'self' ? false : true,
            dobValid: el['DOB(DD/MM/YYYY)*'] != undefined && el['DOB(DD/MM/YYYY)*']?.toString()?.trim().match(dateRegex) != null ? true : el['DOB(DD/MM/YYYY)*'] == undefined ? true : false,
            dojValid: el['DOJ(DD/MM/YYYY)*'] != undefined && el['DOJ(DD/MM/YYYY)*'].toString().trim().match(dateRegex) != null
              ? (() => {
                const dojDate = parseDate(el['DOJ(DD/MM/YYYY)*'].toString().trim().replace(/[-.]/g, '/'));
                return dojDate <= futureDate; // Check if DOJ is between currentDate and futureDate
              })()
              : el['DOJ(DD/MM/YYYY)*'] == undefined ? true : false,
            dobType: el['DOB(DD/MM/YYYY)*'] != undefined && el['DOB(DD/MM/YYYY)*'].toString().trim().match(/^[0-9]+$/) != null ? true : el['DOB(DD/MM/YYYY)*'] == undefined ? true : true,
            dojType: el['DOJ(DD/MM/YYYY)*'] != undefined && el['DOJ(DD/MM/YYYY)*'].toString().trim().match(/^[0-9]+$/) != null ? true : el['DOJ(DD/MM/YYYY)*'] == undefined ? true : true,
            bankAccountNoValid: el['Bank AC No*'] != undefined && el['Bank AC No*'].toString().trim().match(/^[0-9]+$/) && this.payout_method != 'self',
            ifscCodeValid: (this.payout_method === 'self' && (!el['IFSC Code*'] || ifscRegex.test(el['IFSC Code*']))) ||
              (this.payout_method !== 'self' && el['IFSC Code*'] !== undefined && ifscRegex.test(el['IFSC Code*'])),
            bankNameValid: (this.payout_method === 'self' && (!el['Bank Name*'] || bankRegex.test(el['Bank Name*']))) ||
              (this.payout_method !== 'self' && el['Bank Name*'] !== undefined && bankRegex.test(el['Bank Name*'])),
            bankBranchValid: el['Bank Branch*'] != undefined && this.payout_method != 'self',
            permAddValid: el['Permanent Address*'] != undefined,
            fatherNameValid: el[`Father/Husband's Name*`] != undefined && el[`Father/Husband's Name*`].toString().trim().match(/^[a-zA-Z\s]+$/),
            uanNoValid: !el['UAN No'] || el['UAN No'].toString().trim().toLowerCase() == 'request for uan' ? true : el['UAN No']?.toString()?.trim()?.match(/^[0-9]+$/) != null ? true : false,
            esicNovalid: !el['ESIC No'] || el['ESIC No'].toString().trim().toLowerCase() == 'request for esic' ? true : el['ESIC No'].toString().trim().match(/^[0-9]{10}$/) != null ? true : false,
            // postOfferedValid: el['Designation'] != undefined,
            emailRegex: el['Email Id'] == undefined ? true : el['Email Id'].match(emailRegex) != null ? true : false,
            isJobTypeValid: el['Job Type'] != undefined ? (el['Job Type'] == 'Contractual' || el['Job Type'] == 'Permanent' ||
              el['Job Type'] == 'Unit Parameter' || el['Job Type'] == 'Consultant'
              || el['Job Type'] == 'Meeting' || el['Job Type'] == 'Pay Scale' || el['Job Type'] == 'Third Party') : true,
            agencyName: el[`Vendor Name`] == undefined ? '' : el[`Vendor Name`]?.toString()?.trim(),
            salaryBookedProjectName: el[`Salary Booked Under Project`] == undefined ? '' : el[`Salary Booked Under Project`]?.toString()?.trim(),
            contractEndDate: el['Contractenddate(DD/MM/YYYY)']?.toString()?.replace(/[-.]/g, '/')?.toString()?.trim(),
            probationConfirmationDate: el['Probationconfirmationdate(DD/MM/YYYY)']?.toString()?.replace(/[-.]/g, '/')?.toString()?.trim(),
            personalEmailId: el['Personal Email Id'] == undefined ? '' : el['Personal Email Id']?.trim(),
            personalEmailRegex: el['Personal Email Id'] == undefined ? true : el['Personal Email Id'].match(personalEmailRegex) != null ? true : false,
            orgUnitName: !el['Org Unit Name'] ? '' : el['Org Unit Name']?.toString()?.trim(),
          })
          // console.log(this.payout_method != 'self' && (el['Bank Branch*']?.toString()?.trim()));

          if (mobileDuplicateIndex.has(el['Mobile no*'])) {
            this.mobileObj.push(mobileDuplicateIndex.get(el['Mobile no*']));
            this.mobileObj.push(_i);
          } else {
            mobileDuplicateIndex.set(el['Mobile no*'], _i);
          }
          if (orgEmpCodeDuplicateIndex.has(el['Org Emp Code']) && el['Org Emp Code']) {
            this.empCodeObj.push(orgEmpCodeDuplicateIndex.get(el['Org Emp Code']));
            this.empCodeObj.push(_i);
          } else {
            orgEmpCodeDuplicateIndex.set(el['Org Emp Code'] == undefined ? '' : el['Org Emp Code'], _i);
          }

        })

        let postData = [];
        for (let i = 0; i < this.excelToTableData.length; i++) {

          if ((this.payout_method != 'self' && ((!this.excelToTableData[i].aadharRegex && this.excelToTableData[i].isAadhar) || (!this.excelToTableData[i].panFormat && this.excelToTableData[i].isPan)
            || !this.excelToTableData[i].bankAccountNoValid || !this.excelToTableData[i].ifscCodeValid || !this.excelToTableData[i].bankNameValid || !this.excelToTableData[i].bankBranchValid ||
            (!this.excelToTableData[i].isAadhar && !this.excelToTableData[i].isPan))) || !this.excelToTableData[i].dobValid || !this.excelToTableData[i].dojValid ||
            (this.excelToTableData[i].email != '' && !this.excelToTableData[i].emailRegex) || (this.excelToTableData[i].personalEmailId != '' && !this.excelToTableData[i].personalEmailRegex) || !this.excelToTableData[i].permAddValid || (!this.excelToTableData[i].fatherNameValid && this.excelToTableData[i].fatherName)
            || !this.excelToTableData[i].esicNovalid || !this.excelToTableData[i].gender || !this.excelToTableData[i].isJobTypeValid || this.mobileObj.includes(i) || this.empCodeObj.includes(i)) {
            this.invalidRow[i] = false;
            this.isInvalidData = true;
            this.isExcelErrorFree = false;

          } else {
            this.invalidRow[i] = true;
          }

          postData.push({
            'productTypeId': this._EncrypterService.aesEncrypt(this.product_type),
            'customerAccountId': this._EncrypterService.aesEncrypt(this.tp_account_id.toString()),
            'empEmail': '',
            'empMobile': this.excelToTableData[i].mobile,
            'aadharCardNo': this.excelToTableData[i].aadharCardNo,
            'panCardNo': this.excelToTableData[i].panCardNo,
            'bankAccountNo': this.excelToTableData[i].bankAccountNo == undefined ? '' : this.excelToTableData[i].bankAccountNo,
            'orgEmpCode': this.excelToTableData[i].orgEmpCode == undefined ? '' : this.excelToTableData[i].orgEmpCode,
          })

        }

        this.GetMaster();
        this.get_vendor_master_list();
        this.getProjectList();
        this._EmployeeService.checkUniqueDetails({
          'productTypeId': this._EncrypterService.aesEncrypt(this.product_type),
          'customerAccountId': this._EncrypterService.aesEncrypt(this.tp_account_id.toString()), 'encrypted': postData
        }).subscribe((resData: any): any => {
          this.isLoader = false;
          if (resData.statusCode) {
            this.tableDataValidation = JSON.parse(this._EncrypterService.aesDecrypt(resData.commonData));

            this.excelErrorMsg = [];

            for (let i = 0; i < this.tableDataValidation.length; i++) {

              if (!this.tableDataValidation[i].aadharCardNoStatus || !this.tableDataValidation[i].bankAccountNoStatus || !this.tableDataValidation[i].empMobileStatus
                || !this.tableDataValidation[i].aadhaarCardNoValidStatus || !this.tableDataValidation[i].panCardNoValidStatus || !this.tableDataValidation[i].orgEmpCodeStatus || !this.excelToTableData[i].rowColor || !this.invalidRow[i]) {
                this.excelErrorMsg.push({
                  'aadharmsg': !this.tableDataValidation[i].aadharCardNoStatus ? this.tableDataValidation[i].aadharCardNoMsg : this.tableDataValidation[i].aadharCardNoValidMsg,
                  'panmsg': !this.tableDataValidation[i].panCardNoStatus ? this.tableDataValidation[i].panCardNoMsg : this.tableDataValidation[i].panCardNoValidMsg,
                  'bankmsg': this.tableDataValidation[i].bankAccountNoMsg,
                  'emailmsg': this.tableDataValidation[i].empEmailMsg,
                  'mobilemsg': this.excelToTableData[i].rowColor == false ? 'Invalid mobile no.' : this.tableDataValidation[i].empMobileMsg,
                  'orgEmpCodeMsg': this.tableDataValidation[i].orgEmpCodeMsg
                })
                this.excelerrors[i] = false;

                this.isExcelErrorFree = false;

              } else {

                this.excelerrors[i] = true;
                this.excelErrorMsg.push({
                  'aadharmsg': '',
                  'panmsg': '',
                  'bankmsg': '',
                  'emailmsg': '',
                  'mobilemsg': '',
                  'orgEmpCodeMsg': ''
                })
              }
            }
            // console.log(this.isExcelErrorFree);

          } else {
            return this.toastr.error(resData.message)
          }
        })

      } else {
        this.readActiveEmpData(data);
      }
    };
  }

  getIfscMsg(et: any): string {
    const ifscRegex = /^[A-Za-z]{4}0[A-Za-z0-9]{6}$/;
    return (et.ifscCode ? (!ifscRegex.test(et.ifscCode) ? 'Invalid value in IFSC Code' : '') :
      ((this.payout_method != 'self' && !et.ifscCode) ? 'No value in IFSC Code' : ''));
  }

  getBankNameMsg(et: any): string {
    const bankNameRegex = /^[A-Za-z\s]{3,}$/;

    return (et.bankName ? (!bankNameRegex.test(et.bankName) ? 'Invalid value in Bank Name' : '') :
      ((this.payout_method != 'self' && !et.bankName) ? 'No value in Bank Name' : ''));
  }

  readActiveEmpData(data: any) {

    this.getProjectList();
    this.get_vendor_master_list();

    this.validateArr = [];
    data.map(el => {
      const panregex = /^[a-z]{5}[0-9]{4}[a-z]{1}$/;
      const aadharRegex = /^[0-9]{12}$/;
      const dateRegex = /^[0-9]{2}[./-][0-9]{2}[./-][0-9]{4}$/;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const personalEmailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      const parseDate = (dateString) => {
        const parts = dateString.split('/');
        // parts[0] = day, parts[1] = month, parts[2] = year
        return new Date(parts[2], parts[1] - 1, parts[0]); // Months are 0-indexed in JavaScript
      };

      const currentDate = new Date();
      const futureDate = new Date();
      futureDate.setDate(currentDate.getDate() + 15);
      this.excelToTableData.push({
        empName: el['Employee Name*']?.trim(),
        mobile: el['Mobile no*']?.toString()?.trim(),
        tpCode: el['TP Code']?.trim(),
        fatherName: el[`Father/Husband's Name*`] ? el[`Father/Husband's Name*`]?.trim() : '',
        gender: el['Gender(M/F/T)*']?.trim() == 'M' ? 'Male' : el['Gender(M/F/T)*']?.trim() == 'F' ? 'Female' : el['Gender(M/F/T)*']?.trim() == 'T' ? 'Other' : el['Gender(M/F/T)*']?.trim(),
        dob: el['DOB(DD/MM/YYYY)*']?.toString()?.replace(/[-.]/g, '/')?.toString()?.trim(),
        postOffered: el['Designation'] == undefined ? 'N/A' : el['Designation']?.toString()?.trim(),
        postingDepartment: el['Department'] == undefined ? '' : el['Department']?.toString()?.trim(),
        email: el['Email Id'] == undefined ? '' : el['Email Id']?.toString()?.trim(),
        aadharCardNo: el['Aadhaar Card No*'] == undefined ? '' : el['Aadhaar Card No*']?.toString()?.trim().replace(' ', ''),
        panCardNo: el['Pan Card No*'] == undefined ? '' : el['Pan Card No*']?.toString()?.trim(),
        bankAccountNo: el['Bank AC No*'] == undefined ? '' : el['Bank AC No*']?.toString()?.trim(),
        ifscCode: el['IFSC Code*'] == undefined ? '' : el['IFSC Code*']?.toString()?.trim(),
        bankName: el['Bank Name*'] == undefined ? '' : el['Bank Name*']?.toString()?.trim(),
        bankBranch: el['Bank Branch*'] == undefined ? '' : el['Bank Branch*']?.trim(),
        isAccountNoVerified: el['isAccountNoVerified'].trim(),
        uanNumber: el['UAN No'] ? el['UAN No']?.toString()?.trim() : '',
        esicNumber: el['ESIC No'] ? el['ESIC No']?.toString()?.trim() : '',
        esicDependentDetails: el['ESIC Dependent Details'] ? el['ESIC Dependent Details'] : '',
        emergencyContact: el['Relation Emergency Contact No'] ? el['Relation Emergency Contact No'] : '',
        bloodRelationName: el['Blood Relation Name'] ? el['Blood Relation Name'] : '',
        permanentAddress: el['Permanent Address*'] ? el['Permanent Address*'] : '',
        residentialAddress: el['Residential Address'] ? el['Residential Address'] : '',
        orgEmpCode: el['Org Emp Code'] ? el['Org Emp Code']?.toString()?.trim() : '',
        reportingManagerName: el['Reporting Manager Name'] ? el['Reporting Manager Name'] : '',
        jobTypeCategory: el['Job Type Category'] == undefined ? '' : el['Job Type Category']?.toString()?.trim(),
        panFormat: el['Pan Card No*'] != undefined && el['Pan Card No*']?.trim()?.toLowerCase()?.match(panregex) != null ? true : el['Pan Card No*'] == undefined ? true : false,
        isPan: !el['Pan Card No*'] && this.payout_method != 'self' ? false : true,
        aadharRegex: el['Aadhaar Card No*']?.toString()?.match(aadharRegex) != null ? true : false,
        isAadhar: !el['Aadhaar Card No*'] && this.payout_method != 'self' ? false : true,
        dobValid: el['DOB(DD/MM/YYYY)*'] != undefined && el['DOB(DD/MM/YYYY)*']?.toString()?.trim().match(dateRegex) != null ? true : el['DOB(DD/MM/YYYY)*'] == undefined ? true : false,
        dojValid: el['DOJ(DD/MM/YYYY)*'] != undefined && el['DOJ(DD/MM/YYYY)*'].toString().trim().match(dateRegex) != null
          ? (() => {
            const dojDate = parseDate(el['DOJ(DD/MM/YYYY)*'].toString().trim().replace(/[-.]/g, '/'));
            return dojDate <= futureDate; // Check if DOJ is between currentDate and futureDate
          })()
          : el['DOJ(DD/MM/YYYY)*'] == undefined ? true : false,
        dobType: el['DOB(DD/MM/YYYY)*'] != undefined && el['DOB(DD/MM/YYYY)*'].toString().trim().match(/^[0-9]+$/) != null ? true : el['DOB(DD/MM/YYYY)*'] == undefined ? false : true,
        bankAccountNoValid: el['Bank AC No*'] != undefined && el['Bank AC No*'].toString().trim().match(/^[0-9]+$/) && this.payout_method != 'self',
        ifscCodeValid: el['IFSC Code*'] != undefined && this.payout_method != 'self',
        bankNameValid: el['Bank Name*'] != undefined && this.payout_method != 'self',
        bankBranchValid: el['Bank Branch*'] != undefined && this.payout_method != 'self',
        permAddValid: el['Permanent Address*'] != undefined,
        fatherNameValid: el[`Father/Husband's Name*`] != undefined && el[`Father/Husband's Name*`].toString().trim().match(/^[a-zA-Z\s]+$/),
        uanNoValid: !el['UAN No'] || el['UAN No'].toString().trim().toLowerCase() == 'request for uan' ? true : el['UAN No']?.toString()?.trim()?.match(/^[0-9]+$/) != null ? true : false,
        esicNovalid: !el['ESIC No'] || el['ESIC No'].toString().trim().toLowerCase() == 'request for esic' ? true : el['ESIC No'].toString().trim().match(/^[0-9]{10}$/) != null ? true : false,
        // postOfferedValid: el['Designation'] != undefined,
        emailRegex: el['Email Id'] == undefined ? true : el['Email Id'].match(emailRegex) != null ? true : false,
        agencyName: el[`Vendor Name`] == undefined ? '' : el[`Vendor Name`]?.toString()?.trim(),
        salaryBookedProjectName: el[`Salary Booked Under Project`] == undefined ? '' : el[`Salary Booked Under Project`]?.toString()?.trim(),
        contractEndDate: el['Contractenddate(DD/MM/YYYY)']?.toString()?.replace(/[-.]/g, '/')?.toString()?.trim(),
        probationConfirmationDate: el['Probationconfirmationdate(DD/MM/YYYY)']?.toString()?.replace(/[-.]/g, '/')?.toString()?.trim(),
        personalEmailId: el['Personal Email Id'] == undefined ? '' : el['Personal Email Id']?.toString()?.trim(),
        personalEmailRegex: el['Personal Email Id'] == undefined ? true : el['Personal Email Id'].match(personalEmailRegex) != null ? true : false,
        orgUnitName: !el['Org Unit Name'] ? '' : el['Org Unit Name']?.toString()?.trim(),

      })
    })

    let postData = [];



    for (let i = 0; i < this.excelToTableData.length; i++) {

      if ((this.payout_method != 'self' && ((!this.excelToTableData[i].aadharRegex && this.excelToTableData[i].isAadhar) || (!this.excelToTableData[i].panFormat && this.excelToTableData[i].isPan)
        || !this.excelToTableData[i].bankAccountNoValid || !this.excelToTableData[i].ifscCodeValid || !this.excelToTableData[i].bankNameValid || !this.excelToTableData[i].bankBranchValid ||
        (!this.excelToTableData[i].isAadhar && !this.excelToTableData[i].isPan))) || (!this.excelToTableData[i].dobValid && this.excelToTableData[i].dob) ||
        (this.excelToTableData[i].email != '' && !this.excelToTableData[i].emailRegex) || (this.excelToTableData[i].personalEmailId != '' && !this.excelToTableData[i].personalEmailRegex) || !this.excelToTableData[i].permAddValid || (!this.excelToTableData[i].fatherNameValid && this.excelToTableData[i].fatherName)
        || !this.excelToTableData[i].fatherName || !this.excelToTableData[i].esicNovalid || !this.excelToTableData[i].gender) {
        this.invalidRow[i] = false;
        this.isInvalidData = true;

        // return this.toastr.error("Invalid Data in excel");
      } else {
        this.invalidRow[i] = true;
      }

      postData.push({
        'empEmail': this.excelToTableData[i].email,
        'tpCode': this.excelToTableData[i].tpCode,
        'empMobile': this.excelToTableData[i].mobile,
        'aadharCardNo': this.excelToTableData[i].aadharCardNo,
        'panCardNo': this.excelToTableData[i].panCardNo,
        'bankAccountNo': this.excelToTableData[i].bankAccountNo,
        'orgEmpCode': this.excelToTableData[i].orgEmpCode,
        'uanNumber': this.excelToTableData[i].uanNumber,
        'esicNumber': this.excelToTableData[i].esicNumber,
        'jobTypeCategory': this.excelToTableData[i].jobTypeCategory,
        'agencyName': this.excelToTableData[i].agencyName,
        'salaryBookedProjectName': this.excelToTableData[i].salaryBookedProjectName,
        'contractEndDate': this.excelToTableData[i].salaryBookedProjectName,
        'Probationconfirmationdate': this.excelToTableData[i].probationConfirmationDate,
      })

    }

    this._EmployeeService.checkUniqueForActiveEmp({
      'productType': this.product_type, 'customerAccountId': this.tp_account_id,
      'postData': postData
    }).subscribe((resData: any) => {
      this.isLoader = false;

      // console.log(JSON.parse(this._EncrypterService.aesDecrypt(resData.commonData)));
      if (resData.statusCode) {
        this.validateArr = JSON.parse(this._EncrypterService.aesDecrypt(resData.commonData));
        let validateArr = this.validateArr;
        this.excelerrors = [];
        for (let i = 0; i < this.validateArr.length; i++) {
          if (validateArr[i].status_code == '0' || validateArr[i].aadhar_card_exists == 'Y'
            || validateArr[i].is_aadhar_card_changed == 'Y' || validateArr[i].is_bank_no_changed == 'Y' || validateArr[i].is_esic_no_changed == 'Y'
            || validateArr[i].is_org_emp_code_changed == 'Y' || validateArr[i].is_pan_card_changed == 'Y' || validateArr[i].is_uan_no_changed == 'Y'
            || validateArr[i].bank_no_exists == 'Y' || validateArr[i].esic_no_exists == 'Y' || validateArr[i].org_emp_code_exists == 'Y'
            || validateArr[i].pan_card_exists == 'Y' || validateArr[i].uan_no_exists == 'Y' || validateArr[i].is_job_type_category_exists == 'N') {
            this.excelerrors[i] = false;

            this.isExcelErrorFree = false;
          } else {
            this.excelerrors[i] = true;
            if (i != 0 && this.isExcelErrorFree) {
              this.isExcelErrorFree = true;
            }
          }
        }
      } else {
        this.validateArr = [];
      }
    })

  }

  onFileChangeaAttn(event: any) {
    this.isLoader = true;
    this.excelToTableData = [];
    this.isInvalidData = false;
    /* wire up file reader */
    const target: DataTransfer = <DataTransfer>(event.target);
    if (target.files.length !== 1) {
      this.isLoader = false;
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
        this.isLoader = false;
        return this.toastr.info("Please download the latest Add Bulk Employee template");
      }
      /* save data */
      // const data = XLSX.utils.sheet_to_json(ws); // to get 2d array pass 2nd parameter as object {header: 1}
      const data = XLSX.utils.sheet_to_json(ws, { raw: true, defval: '' });
      this.excelBulkEmpUploadArray = data;

      const mobileregex = /^[6-9]{1}[0-9]{9}$/;
      const dateRegex = /^[0-9]{2}[./-][0-9]{2}[./-][0-9]{4}$/;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const personalEmailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const panregex = /^[a-z]{5}[0-9]{4}[a-z]{1}$/;
      const aadharRegex = /^[0-9]{12}$/;

      const parseDate = (dateString) => {
        const parts = dateString.split('/');
        // parts[0] = day, parts[1] = month, parts[2] = year
        return new Date(parts[2], parts[1] - 1, parts[0]); // Months are 0-indexed in JavaScript
      };

      const currentDate = new Date();
      const futureDate = new Date();
      futureDate.setDate(currentDate.getDate() + 15);
      data.map(el => {
        this.excelToTableData.push({

          salutation: el['Salutation'] == undefined ? '' : el['Salutation'],
          fatherName: el[`Father/Husband's Name*`]?.trim(),
          empName: el['Employee Name*']?.trim(),
          gender: el['Gender(M/F/T)*'] == undefined ? '' : el['Gender(M/F/T)*']?.trim(),
          dob: el['DOB(DD/MM/YYYY)*'] != undefined ? el['DOB(DD/MM/YYYY)*']?.toString()?.trim()?.replace(/[-.]/g, '/') : '',
          doj: el['DOJ(DD/MM/YYYY)*']?.toString()?.trim().replace(/[-.]/g, '/'),
          postOffered: 'N/A',
          aadharCardNo: el['Aadhaar Card No*'] == undefined ? '' : el['Aadhaar Card No*']?.toString()?.trim().replace(' ', ''),
          panCardNo: el['Pan Card No*'] == undefined ? '' : el['Pan Card No*']?.toString()?.trim(),
          // mobile: el['Mobile no*'] == undefined ? ' ' : el['Mobile no*']?.trim(),
          mobile: el['Mobile no*'] == undefined ? '' : el['Mobile no*']?.toString()?.trim(),
          email: el['Email Id'] == undefined ? '' : el['Email Id']?.toString()?.trim(),
          jobType: el['Job Type'] == undefined ? '' : el['Job Type']?.trim(),
          emergencyContact: '',
          bloodRelationName: '',
          permanentAddress: 'N/A',
          residentialAddress: '',
          orgEmpCode: '',
          rowColor: el['Mobile no*']?.toString().length == 10 && (el['Mobile no*']?.toString()?.match(mobileregex) != null ? true : false),
          emailRegex: el['Email Id'] == undefined ? true : el['Email Id'].match(emailRegex) != null ? true : false,
          dobValid: el['DOB(DD/MM/YYYY)*'] != undefined && el['DOB(DD/MM/YYYY)*']?.toString()?.trim().match(dateRegex) != null ? true : el['DOB(DD/MM/YYYY)*'] == undefined ? true : false,
          dojValid: el['DOJ(DD/MM/YYYY)*'] != undefined && el['DOJ(DD/MM/YYYY)*'].toString().trim().match(dateRegex) != null
            ? (() => {
              const dojDate = parseDate(el['DOJ(DD/MM/YYYY)*'].toString().trim().replace(/[-.]/g, '/'));
              return dojDate <= futureDate; // Check if DOJ is between currentDate and futureDate
            })()
            : el['DOJ(DD/MM/YYYY)*'] == undefined ? true : false,
          dobType: el['DOB(DD/MM/YYYY)*'] != undefined && el['DOB(DD/MM/YYYY)*'].toString().trim().match(/^[0-9]+$/) != null ? false : true,
          dojType: el['DOJ(DD/MM/YYYY)*'] != undefined && el['DOJ(DD/MM/YYYY)*'].toString().trim().match(/^[0-9]+$/) != null ? false : true,
          permAddValid: el['Permanent Address*'] != undefined,
          fatherNameValid: el[`Father/Husband's Name*`] != undefined && el[`Father/Husband's Name*`].toString().trim().match(/^[a-zA-Z\s]+$/),
          isJobTypeValid: el['Job Type'] != undefined ? (el['Job Type'].trim() == 'Contractual' || el['Job Type'].trim() == 'Permanent' ||
            el['Job Type'].trim() == 'Unit Parameter' || el['Job Type'].trim() == 'Consultant'
            || el['Job Type'].trim() == 'Meeting') : true,
          personalEmailId: el['Personal Email Id'] == undefined ? '' : el['Personal Email Id']?.toString()?.trim(),
          personalEmailRegex: el['Personal Email Id'] == undefined ? true : el['Personal Email Id'].match(personalEmailRegex) != null ? true : false

        })
      })

      let postData = [];
      for (let i = 0; i < this.excelToTableData.length; i++) {

        if (!this.excelToTableData[i].dobValid || !this.excelToTableData[i].dojValid || this.excelToTableData[i].gender == ''
          || (!this.excelToTableData[i].fatherNameValid && this.excelToTableData[i].fatherName) || this.excelToTableData[i].name == '' || (this.excelToTableData[i].email != ''
            && !this.excelToTableData[i].emailRegex) || (this.excelToTableData[i].personalEmailId != ''
              && !this.excelToTableData[i].personalEmailRegex) || !this.excelToTableData[i].gender || !this.excelToTableData[i].isJobTypeValid) {
          this.invalidRow[i] = false;
          this.isExcelErrorFree = false;
          this.isInvalidData = true;
          // return this.toastr.error("Invalid Data in excel");
        } else {
          this.invalidRow[i] = true;
        }

        // if(this.excelToTableData[i].email==undefined ){
        //   return this.toastr.error("Email id missing for row no. "+ (i+1),'Oops');
        // }

        postData.push({
          'productTypeId': this._EncrypterService.aesEncrypt(this.product_type),
          'customerAccountId': this._EncrypterService.aesEncrypt(this.tp_account_id.toString()),
          'empEmail': '',
          'empMobile': this.excelToTableData[i].mobile,
          'aadharCardNo': '',
          'panCardNo': '',
          'bankAccountNo': '',
          'orgEmpCode': '',
        })

      }
      this.get_vendor_master_list();
      this.getProjectList();

      this._EmployeeService.checkUniqueDetails({
        'productTypeId': this._EncrypterService.aesEncrypt(this.product_type),
        'customerAccountId': this._EncrypterService.aesEncrypt(this.tp_account_id.toString()), 'encrypted': postData
      }).subscribe((resData: any): any => {
        this.isLoader = false;


        if (resData.statusCode) {
          this.tableDataValidation = JSON.parse(this._EncrypterService.aesDecrypt(resData.commonData));
          this.excelErrorMsg = [];

          for (let i = 0; i < this.tableDataValidation.length; i++) {

            if (!this.tableDataValidation[i].aadharCardNoStatus || !this.tableDataValidation[i].bankAccountNoStatus || !this.tableDataValidation[i].empMobileStatus
              || !this.tableDataValidation[i].aadhaarCardNoValidStatus || !this.tableDataValidation[i].panCardNoValidStatus || !this.tableDataValidation[i].orgEmpCodeStatus
              || !this.excelToTableData[i].rowColor || !this.invalidRow[i]) {
              this.excelErrorMsg.push({
                'aadharmsg': '',
                'panmsg': '',
                'bankmsg': '',
                'emailmsg': this.tableDataValidation[i].empEmailMsg,
                'mobilemsg': this.excelToTableData[i].rowColor == false ? 'Invalid mobile no.' : this.tableDataValidation[i].empMobileMsg,
                'orgEmpCodeMsg': this.tableDataValidation[i].orgEmpCodeMsg,
              })
              this.excelerrors[i] = false;
              this.isInvalidData = true;
              this.isExcelErrorFree = false;

            } else {
              // console.log("hr");

              this.excelerrors[i] = true;
              this.isExcelErrorFree = true;
              this.excelErrorMsg.push({
                'aadharmsg': '',
                'panmsg': '',
                'bankmsg': '',
                'emailmsg': '',
                'mobilemsg': '',
                'orgEmpCodeMsg': ''
              })
            }
          }
        } else {
          return this.toastr.error(resData.message)
        }
      })

    }
  }

  add_update_employee() {
    this.isAddemployee = !this.isAddemployee;
  }

  calculateAge(birthDate) {
    const today = new Date();
    const birth = new Date(birthDate);

    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    // If the birth month hasn't occurred yet this year, subtract one year
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    // console.log(age);

    return age;
  }

  removeRow(idx: any) {
    this.excelToTableData.splice(idx, 1);
    if (this.excelToTableData.length == 0) $('#employee_doc').val('');
    this.tableDataValidation.splice(idx, 1);
    this.excelerrors.splice(idx, 1);
    this.excelErrorMsg.splice(idx, 1);
    this.invalidRow.splice(idx, 1);
    this.isInvalidData = false;
    for (let i = 0; i < this.excelToTableData.length; i++) {
      if (this.payout_method != 'attendance') {
        if ((this.payout_method != 'self' && ((!this.excelToTableData[i].aadharRegex && this.excelToTableData[i].isAadhar) || (!this.excelToTableData[i].panFormat && this.excelToTableData[i].isPan)
          || !this.excelToTableData[i].bankAccountNoValid || !this.excelToTableData[i].ifscCodeValid || !this.excelToTableData[i].bankNameValid || !this.excelToTableData[i].bankBranchValid ||
          (!this.excelToTableData[i].isAadhar && !this.excelToTableData[i].isPan))) || !this.excelToTableData[i].dobValid || !this.excelToTableData[i].dojValid ||
          (this.excelToTableData[i].email != '' && !this.excelToTableData[i].emailRegex) || !this.excelToTableData[i].permAddValid || (!this.excelToTableData[i].fatherNameValid && this.excelToTableData[i].fatherName)
          || !this.excelToTableData[i].esicNovalid || !this.excelToTableData[i].gender || !this.excelToTableData[i].isJobTypeValid || this.mobileObj.includes(i) || this.empCodeObj.includes(i)) {
          this.isInvalidData = true;
          this.isExcelErrorFree = false;
        }
      } else {
        if (!this.excelToTableData[i].dobValid || !this.excelToTableData[i].dojValid || this.excelToTableData[i].gender == ''
          || (!this.excelToTableData[i].fatherNameValid && this.excelToTableData[i].fatherName) || this.excelToTableData[i].name == '' || (this.excelToTableData[i].email != ''
            && !this.excelToTableData[i].emailRegex) || !this.excelToTableData[i].gender || !this.excelToTableData[i].isJobTypeValid) {
          this.isInvalidData = true;
          this.isExcelErrorFree = false;
        }
      }

    }
    // console.log(this.isInvalidData);
    if (this.payout_method != 'attendance') {
      for (let i = 0; i < this.tableDataValidation.length; i++) {

        if (!this.tableDataValidation[i].aadharCardNoStatus || !this.tableDataValidation[i].bankAccountNoStatus || !this.tableDataValidation[i].empMobileStatus
          || !this.tableDataValidation[i].aadhaarCardNoValidStatus || !this.tableDataValidation[i].panCardNoValidStatus || !this.tableDataValidation[i].orgEmpCodeStatus || !this.excelToTableData[i].rowColor || !this.invalidRow[i]) {
          this.excelErrorMsg.push({
            'aadharmsg': !this.tableDataValidation[i].aadharCardNoStatus ? this.tableDataValidation[i].aadharCardNoMsg : this.tableDataValidation[i].aadharCardNoValidMsg,
            'panmsg': !this.tableDataValidation[i].panCardNoStatus ? this.tableDataValidation[i].panCardNoMsg : this.tableDataValidation[i].panCardNoValidMsg,
            'bankmsg': this.tableDataValidation[i].bankAccountNoMsg,
            'emailmsg': this.tableDataValidation[i].empEmailMsg,
            'mobilemsg': this.excelToTableData[i].rowColor == false ? 'Invalid mobile no.' : this.tableDataValidation[i].empMobileMsg,
            'orgEmpCodeMsg': this.tableDataValidation[i].orgEmpCodeMsg
          })
          this.excelerrors[i] = false;

          this.isExcelErrorFree = false;

        } else {
          // console.log("hr");

          this.excelerrors[i] = true;
          this.isExcelErrorFree = true;
          this.excelErrorMsg.push({
            'aadharmsg': '',
            'panmsg': '',
            'bankmsg': '',
            'emailmsg': '',
            'mobilemsg': '',
            'orgEmpCodeMsg': ''
          })
        }
      }
    } else {
      for (let i = 0; i < this.tableDataValidation.length; i++) {

        if (!this.tableDataValidation[i].aadharCardNoStatus || !this.tableDataValidation[i].bankAccountNoStatus || !this.tableDataValidation[i].empMobileStatus
          || !this.tableDataValidation[i].aadhaarCardNoValidStatus || !this.tableDataValidation[i].panCardNoValidStatus || !this.tableDataValidation[i].orgEmpCodeStatus
          || !this.excelToTableData[i].rowColor || !this.invalidRow[i]) {
          this.excelErrorMsg.push({
            'aadharmsg': '',
            'panmsg': '',
            'bankmsg': '',
            'emailmsg': this.tableDataValidation[i].empEmailMsg,
            'mobilemsg': this.excelToTableData[i].rowColor == false ? 'Invalid mobile no.' : this.tableDataValidation[i].empMobileMsg,
            'orgEmpCodeMsg': this.tableDataValidation[i].orgEmpCodeMsg,
          })
          this.excelerrors[i] = false;

          this.isExcelErrorFree = false;
        } else {
          // console.log("hr");

          this.excelerrors[i] = true;
          this.isExcelErrorFree = true;
          this.excelErrorMsg.push({
            'aadharmsg': '',
            'panmsg': '',
            'bankmsg': '',
            'emailmsg': '',
            'mobilemsg': '',
            'orgEmpCodeMsg': ''
          })
        }
      }
    }

  }

  removeRowActive(idx: number) {
    this.excelToTableData.splice(idx, 1);
    this.validateArr.splice(idx, 1);
    this.excelerrors.splice(idx, 1);
    this.invalidRow.splice(idx, 1);
  }

  removeErrorRecords() {
    let excel = this.excelToTableData;
    if (!this.isActiveEmp)
      this.excelToTableData = excel.filter((_: any, i) => (this.excelerrors[i]));
    else
      this.excelToTableData = excel.filter((_: any, i) => {
        return this.excelerrors[i] && this.invalidRow[i];
      });
    this.isExcelErrorFree = true;
    this.isInvalidData = false;
    this.excelerrors = [];
    this.invalidRow = [];
    this.excelErrorMsg = [];
    this.validateArr = [];
    this.tableDataValidation = [];
    $('#employee_doc').val('');
    for (let i = 0; i < this.excelToTableData.length; i++) {
      this.excelerrors[i] = true;
      this.invalidRow[i] = true;
    }

  }

  async uploadExcel(): Promise<void> {

    if (!this.isExcelErrorFree) {
      this.toastr.error("Excel data is incorrect.", "Oops");
      return;
    }

    const concurrencyLimit = 50; // Limit the number of concurrent API calls
    const promises: Promise<void>[] = [];
    let activePromises = 0;
    let showPerRowToastr = true;
    let completedTasks = 0; // Track completed tasks
    this.progressPercentage = 0; // Initialize progress percentage
    this.showProgressLoader = true; // Show progress bar

    const executeTask = async (postData: any, index: number): Promise<void> => {
      try {
        activePromises++;
        await firstValueFrom(this._EmployeeService.add_new_employee(postData));
        // if (showPerRowToastr) {
        //   this.toastr.success(`Employee added successfully for row ${index + 1}`);
        // }
      } catch (error) {
        // if (showPerRowToastr) {
        //   this.toastr.error(`Failed to add employee for row ${index + 1}: ${error.message}`);
        // }
      } finally {
        activePromises--;
        completedTasks++;
        this.progressPercentage = Math.round((completedTasks / this.excelToTableData.length) * 100);
      }
    };

    for (let i = 0; i < this.excelToTableData.length; i++) {
      const postData = {
        'product_type': this.product_type,
        'employee_name': this.excelToTableData[i].empName,
        'employee_mobile': this.excelToTableData[i].mobile,
        'employee_email': this.excelToTableData[i].email,
        'employer_leadid': this.token.tp_lead_id.toString(),
        'customeraccountid': this.token.tp_account_id.toString(),
        'employer_id': this.token.id.toString(),
        'geoFenceId': this.token.geo_location_id.toString(),
        'ouIds': this.token.ouIds.toString(),
        'subEmpId': this.token.sub_userid != undefined ? this.token.sub_userid.toString() : null,
        'category_cd': this.excelToTableData[i].jobType,
        'is_hub_left': 'Y',
        'agencyName': this.excelToTableData[i].agencyName,
        'salaryBookedProjectName': this.excelToTableData[i].salaryBookedProjectName,
        'contractEndDate': this.excelToTableData[i].contractEndDate,
        'Probationconfirmationdate': this.excelToTableData[i].probationConfirmationDate,
        'personalEmailId': this.excelToTableData[i].personalEmailId
      };

      const task = executeTask(postData, i);
      promises.push(task);

      if (activePromises >= concurrencyLimit) {
        await Promise.race(promises); // Wait for at least one promise to resolve
      }
    }



    const results = await Promise.allSettled(promises); // Wait for all remaining promises to complete
    showPerRowToastr = false;
    this.showProgressLoader = false; // Hide progress bar after completion
    // Handle results
    const failedUploads = results.filter(result => result.status === 'rejected');

    if (failedUploads.length > 0) {
      this.toastr.error(`${failedUploads.length} uploads failed. Please check the logs.`);
    } else {
      this.toastr.success('All employees added successfully.');
    }
    // Call the appropriate update function based on the payout method
    if (this.payout_method !== 'attendance') {
      await this.update_employee_details();
    } else {
      await this.update_attn_employee_details();
    }
  }

  async update_attn_employee_details(): Promise<void> {
    const concurrencyLimit = 50; // Limit the number of concurrent API calls
    const promises: Promise<void>[] = [];
    let completedTasks = 0; // Track completed tasks
    this.progressPercentage = 0; // Initialize progress percentage

    const executeTask = async (postData: any, index: number): Promise<void> => {
      try {
        await firstValueFrom(this._EmployeeService.updateAttendanceEmployeeDetails(postData));
      } catch (error) {
        this.toastr.error(`Failed to update employee details for row ${index + 1}: ${error.message}`);
      } finally {
        completedTasks++;
        this.progressPercentage = Math.round((completedTasks / this.excelToTableData.length) * 100);
      }
    };

    // this.showProgressLoader = true; // Show the progress bar
    this.isLoader = true;

    for (let i = 0; i < this.excelToTableData.length; i++) {

      const postData = {
        ...this.excelToTableData[i],
        'productTypeId': this._EncrypterService.aesEncrypt(this.product_type),
        'customerAccountId': this._EncrypterService.aesEncrypt(this.tp_account_id.toString()),
        'updatedBy': this.token.id
      };

      const task = executeTask(postData, i);
      promises.push(task);


      if (promises.length >= concurrencyLimit) {
        await Promise.race(promises); // Wait for at least one promise to resolve
      }
    }

    await Promise.allSettled(promises); // Wait for all remaining promises to complete
    // Handle results
    const failedUpdates = promises.length - completedTasks;
    if (failedUpdates > 0) {
      // this.showProgressLoader = false; // Hide the progress bar
      this.isLoader = false;
      this.toastr.error(`${failedUpdates} updates failed. Please check the logs.`);
    } else {
      // this.showProgressLoader = false; // Hide the progress bar
      this.isLoader = false;
      this.toastr.success('All employee details updated successfully.');
    }
    this.clearInput(); // Ensure this function exists and performs necessary actions
    window.history.back();

  }


  async update_employee_details(): Promise<void> {

    const concurrencyLimit = 50; // Limit the number of concurrent API calls
    const promises: Promise<void>[] = [];
    let completedTasks = 0; // Track completed tasks
    this.progressPercentage = 0; // Initialize progress percentage

    const executeTask = async (postData: any, index: number): Promise<void> => {
      try {
        await firstValueFrom(this._EmployeeService.updateEmployeeDetails(postData));
      } catch (error) {
        this.toastr.error(`Failed to update employee details for row ${index + 1}: ${error.message}`);
      } finally {
        completedTasks++;
        this.progressPercentage = Math.round((completedTasks / this.excelToTableData.length) * 100);
      }
    };

    // this.showProgressLoader = true;
    this.isLoader = true;

    for (let i = 0; i < this.excelToTableData.length; i++) {

      const postData = {
        ...this.excelToTableData[i],
        'productTypeId': this._EncrypterService.aesEncrypt(this.product_type),
        'customerAccountId': this._EncrypterService.aesEncrypt(this.tp_account_id.toString()),
        'updatedBy': this.token.id
      };

      const task = executeTask(postData, i);
      promises.push(task);

      if (promises.length >= concurrencyLimit) {
        await Promise.race(promises); // Wait for at least one promise to resolve
      }
    }

    await Promise.allSettled(promises); // Wait for all remaining promises to complete
    // Handle results
    const failedUpdates = promises.length - completedTasks;
    if (failedUpdates > 0) {
      // this.showProgressLoader = false;
      this.isLoader = false
      this.toastr.error(`${failedUpdates} updates failed. Please check the logs.`);
    } else {
      // this.showProgressLoader = false;
      this.isLoader = false

      this.toastr.success('All employee details updated successfully.');
    }

    // this.isLoader = false;
    this.clearInput(); // Ensure this function exists and performs necessary actions
    window.history.back();

  }

  async updateExisiting(): Promise<void> {
    const concurrencyLimit = 50; // Limit the number of concurrent API calls
    const promises: Promise<void>[] = [];
    let completedTasks = 0; // Track completed tasks
    this.progressPercentage = 0; // Initialize progress percentage
    const executeTask = async (postData: any, index: number): Promise<void> => {
      try {
        await firstValueFrom(this._EmployeeService.updateEmployeeDetails(postData));
      } catch (error) {
        this.toastr.error(`Failed to update employee details for row ${index + 1}: ${error.message}`);
      } finally {
        completedTasks++;
        this.progressPercentage = Math.round((completedTasks / this.excelToTableData.length) * 100);
      }
    };

    this.showProgressLoader = true; // Show the progress bar

    for (let i = 0; i < this.excelToTableData.length; i++) {

      const postData = {
        ...this.excelToTableData[i],
        'productTypeId': this._EncrypterService.aesEncrypt(this.product_type),
        'customerAccountId': this._EncrypterService.aesEncrypt(this.tp_account_id.toString()),
        'updatedBy': this.token.id
      };
      const task = executeTask(postData, i);
      promises.push(task);


      if (promises.length >= concurrencyLimit) {
        await Promise.race(promises); // Wait for at least one promise to resolve
      }
    }

    await Promise.allSettled(promises); // Wait for all remaining promises to complete

    // Handle results
    const failedUpdates = promises.length - completedTasks;
    if (failedUpdates > 0) {
      this.showProgressLoader = false; // Hide the progress bar
      this.toastr.error(`${failedUpdates} updates failed. Please check the logs.`);
    } else {
      this.showProgressLoader = false; // Hide the progress bar
      this.toastr.success('All employee details updated successfully.');
    }

    this.clearInput(); // Ensure this function exists and performs necessary actions
    window.history.back();
  }
  toggleDropdown(event: Event): void {
    event.preventDefault(); // Prevent default link action
    this.showDropdown = !this.showDropdown;
  }

  clearInput(action: any = '') {
    if (action != 'notEmpty')
      $('#employee_doc').val('');
    this.excelToTableData = [];
    this.isExcelErrorFree = true;
    this.isInvalidData = false;
    this.excelerrors = [];
    this.invalidRow = [];
    this.excelErrorMsg = [];
    this.validateArr = [];
    this.tableDataValidation = [];
    this.isAddemployee = true;
  }

  downloadSampleExcel() {

    let exportData: any;
    let path = '';
    if (this.payout_method == 'attendance') {
      path = 'assets/Bulk_Add_attendance_Employee_template.xlsx';
    } else {
      path = 'assets/Bulk_Add_Employee_template.xlsx';
    }
    this.http.get(path, { responseType: 'blob' }).subscribe((excelData: Blob) => {
      exportData = excelData;
      const data: Blob = new Blob([exportData], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const downloadLink: any = document.createElement('a');
      downloadLink.href = window.URL.createObjectURL(data);
      let date = new Date()
      downloadLink.download = `Bulk_Add_Employee_template.xlsx`;
      downloadLink.click();
    });

  }

  updateEmployee(updateType: any) {
    if (updateType == 'new') {
      this.update_employee_details();
    } else if (updateType == 'new_attn') {
      this.update_attn_employee_details();
    } else if (updateType == 'existing') {
      this.updateExisiting();
    }
  }

  closeDropdown(event: MouseEvent): void {
    // if (!this.elementRef.nativeElement.contains(event.target)) {
    this.showDropdown = false;
  }
  // }

  updateActiveEmp(): any {
    this.isLoader = true;
    if (!this.isExcelErrorFree) {
      this.isLoader = false;
      return this.toastr.error("Please remove the error records first.");
    }

    let postData = {
      productTypeId: this._EncrypterService.aesEncrypt(this.product_type),
      customerAccountId: this._EncrypterService.aesEncrypt(this.tp_account_id.toString()),
      data: this.excelToTableData
    }

    this._EmployeeService.updateActiveEmployeeDetails(postData).subscribe((resData: any) => {
      this.isLoader = false;

      if (resData.statusCode) {
        this.toastr.success('Employees details updated successfully.');
        window.history.back();
      } else {
        let count = 0;
        for (let i = 0; i < resData.commondata.length; i++) {
          if (resData.commondata[i].statusCode) {
            count++;
          }
        }
        this.toastr.error(`${count} records updated successfully.`);
        this.resultLog = resData.commonData;
      }
    })

  }


  GetMaster() {
    this._payoutService.GetMaster({
      "actionType": "MasterJobTypes",
      "productTypeId": this.product_type,
    }).subscribe((resData: any) => {
      if (resData.statusCode) {
        this.master_data = resData.commonData;
      } else {
        this.master_data = [];
        this.toastr.error(resData.message);
      }
    });

  }


  checkJobTypeCategoryValid(jobTypeCategory: string): boolean {
    // console.log("Checking job type category",jobTypeCategory,this.master_data);
    if (jobTypeCategory) {
      const isValid = this.master_data?.some((item: any) => item.jobtypecategory === jobTypeCategory);
      if (!isValid) {
        this.isExcelErrorFree = false;
      } return isValid;
    }
    return true;
  }
  get_vendor_master_list() {
    this._faceCheckinService.getemployeeList({
      "action": "mst_vendor_list",
      "customeraccountid": this.tp_account_id.toString(),
      "emp_code": "",
      "organization_unitid": "",
      "keyword": "",
      "fromdate": "",
      "todate": ""
    }).subscribe((resData: any) => {
      this.vendor_master_list_data = [];
      if (resData.statusCode) {
        if (resData.commonData == null) {
          // this.toastr.info('No data found', 'Info');
          this.toastr.error('No data found');
          return;
        }
        this.vendor_master_list_data = JSON.parse(this._EncrypterService.aesDecrypt(resData.commonData));

      } else {

        this.toastr.error('No data found');

      }
    }, (error: any) => {

      this.vendor_master_list_data = []
      this.toastr.error('No data found');

    })
  }
  getProjectList() {
    this._faceCheckinService.getemployeeList({
      "action": "mst_project_list",
      "customeraccountid": this.tp_account_id.toString(),
      "emp_code": "",
      "organization_unitid": "",
      "keyword": "",
      "fromdate": "",
      "todate": ""
    }).subscribe((resData: any) => {
      if (resData.statusCode) {
        this.salarybooked = JSON.parse(this._EncrypterService.aesDecrypt(resData.commonData));
        // console.log(this.salarybooked);

      } else {
        this.salarybooked = [];
      }
    })
  }
  checkSalarybookedValid(Salarybooked: string): boolean {
    // console.log("Checking job type category",jobTypeCategory,this.master_data);
    // console.log(this.salarybooked);
    // console.log(Salarybooked);

    if (Salarybooked) {

      const isValid = this.salarybooked?.some((item: any) => item.project_name === Salarybooked);
      if (!isValid) {
        this.isExcelErrorFree = false;
      }

      return isValid;
    }
    return true;
  }
  checkVendorNameValid(VendorName: string): boolean {

    // console.log("Checking job type category",jobTypeCategory,this.master_data);
    // console.log(VendorName);
    // console.log(this.vendor_master_list_data);

    if (VendorName) {

      const isValid = this.vendor_master_list_data?.some((item: any) => item.vendor_name === VendorName);
      if (!isValid) {
        this.isExcelErrorFree = false;
      }

      return isValid;
    }
    return true;
  }




  exportInvalidRecords(): void {
    if (!this.excelToTableData || this.excelToTableData.length === 0) {
      this.toastr.info('No records available to export.');
      return;
    }

    // Find indices of invalid records
    const invalidIndices = this.excelToTableData
      .map((et, i) => {
        if (
          this.excelerrors[i] === false ||
          !et.rowColor ||
          (!et.panFormat && et.isPan && this.payout_method !== 'self') ||
          (!et.aadharRegex && et.isAadhar && this.payout_method !== 'self') ||
          !this.invalidRow[i] ||
          this.mobileObj.includes(i) ||
          this.empCodeObj.includes(i)
        ) {
          return i;
        }
        return null;
      })
      .filter((i) => i !== null);

    const invalidRecords = invalidIndices.map((index) => this.excelBulkEmpUploadArray[index]);

    if (invalidRecords.length === 0) {
      this.toastr.info('No invalid records to export.');
      return;
    }

    const headers = this.excelBulkEmpUploadArray.length > 0 ? Object.keys(this.excelBulkEmpUploadArray[0]) : [];
    if (headers.length === 0) {
      this.toastr.error('No headers found in the uploaded Excel file.');
      return;
    }

    // Helper to build error string for a record (same logic as HTML)
    const buildErrorString = (et: any, i: number): string => {
      let errors: string[] = [];

      if (!et.fatherName || !et.fatherNameValid) {
        if (et.fatherName !== '' && !et.fatherNameValid) errors.push("Invalid Father/Husband's Name. Only Alphabets are allowed");
        else if (et.fatherName === '') errors.push('Father Name missing');
      }
      if (!et.gender) errors.push('Gender missing');
      if ((!et.dobValid && et.dobType) || !et.dobType) {
        if (!et.dobValid && et.dobType) errors.push('Invalid Date of birth.');
        if (et.dobType) errors.push('Please change field type to text in excel');
      }
      if ((!et.dojValid && et.dojType) || !et.dojType) {
        if (!et.dojValid && et.dojType) errors.push('Invalid Date of joining.');
        if (et.dojType) errors.push('Please change field type to text');
      }
      if (this.mobileObj.includes(i)) errors.push('Duplicate Mobile number exists in the excel.');
      if (this.excelErrorMsg[i]?.mobilemsg) errors.push(this.excelErrorMsg[i]?.mobilemsg);
      if (et.email !== '' && !et.emailRegex) errors.push('Invalid email');
      if (!et.isJobTypeValid) errors.push('Invalid Job Type');
      if (this.payout_method != 'attendance' && this.excelErrorMsg[i]?.aadharmsg) errors.push(this.excelErrorMsg[i]?.aadharmsg);
      if (this.payout_method != 'attendance' && this.payout_method != 'self' && !et.aadharRegex && et.isAadhar) errors.push('Invalid Aadhaar no.');
      if (this.payout_method != 'attendance' && this.payout_method != 'self' && !et.isPan && !et.isAadhar) errors.push('Aadhaar or Pan required');
      if (this.payout_method != 'attendance' && this.excelErrorMsg[i]?.panmsg) errors.push(this.excelErrorMsg[i]?.panmsg);
      if (this.payout_method != 'attendance' && this.payout_method != 'self' && !et.panFormat && et.isPan) errors.push('Invalid Pan no.');
      if (this.payout_method != 'attendance' && this.payout_method != 'self' && (!et.bankAccountNo || !et.bankAccountNoValid)) {
        if (!et.bankAccountNo && this.payout_method != 'attendance' && this.payout_method != 'self') errors.push('No value in Bank Account No.');
        else if (et.bankAccountNo && !et.bankAccountNoValid && this.payout_method != 'attendance' && this.payout_method != 'self') errors.push('Invalid bank account number. Account number should only contain numbers.');
      }
      if (this.payout_method != 'attendance' && this.excelErrorMsg[i]?.bankmsg) errors.push(this.excelErrorMsg[i]?.bankmsg);
      if (this.payout_method != 'attendance' && !et.ifscCodeValid) errors.push(this.getIfscMsg(et));
      if (this.payout_method != 'attendance' && !et.bankNameValid) errors.push(this.getBankNameMsg(et));
      if (!et.bankBranchValid && this.payout_method != 'attendance' && this.payout_method != 'self') errors.push('No value in Bank Branch');
      if (this.payout_method != 'attendance' && !et.uanNoValid) errors.push('Invalid UAN no.');
      if (this.payout_method != 'attendance' && !et.esicNovalid) errors.push('Invalid Esic no.');
      if (this.payout_method != 'attendance' && !et.permAddValid) errors.push('No value in Permanent Address');
      if (this.payout_method != 'attendance' && this.empCodeObj.includes(i)) errors.push('Duplicate Org Empcode exists in the excel.');
      if (this.payout_method != 'attendance' && this.excelErrorMsg[i]?.orgEmpCodeMsg) errors.push(this.excelErrorMsg[i]?.orgEmpCodeMsg);

      // New errors for Vendor Name and Salary Booked Under Project
      if (this.payout_method != 'attendance') {
        if (!this.checkVendorNameValid(et.agencyName)) {
          errors.push('Vendor Name does not exist.');
        }
        if (!this.checkSalarybookedValid(et.salaryBookedProjectName)) {
          errors.push('Salary Booked Under Project does not exist.');
        }
      }

      return errors.join(' | ');
    };

    // Map invalid records to include only the relevant headers and a single errors column
    const exportData = invalidIndices.map((index) => {
      const record = this.excelBulkEmpUploadArray[index];
      const et = this.excelToTableData[index];
      const filteredRecord: any = {};
      headers.forEach((header) => {
        filteredRecord[header] = record[header] || '';
      });
      filteredRecord['errors'] = buildErrorString(et, index);
      return filteredRecord;
    });

    // Convert invalid records to a worksheet
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);

    // Create a workbook and add the worksheet
    const workbook: XLSX.WorkBook = { Sheets: { 'Invalid Records': worksheet }, SheetNames: ['Invalid Records'] };

    // Write the workbook to a file and download it
    XLSX.writeFile(workbook, 'Invalid_Records.xlsx');
  }
}
