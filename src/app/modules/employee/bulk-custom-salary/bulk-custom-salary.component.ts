import { Component } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import * as XLSX from 'xlsx'
import { EmployeeService } from '../employee.service';
import { SessionService } from 'src/app/shared/services/session.service';
import decode from 'jwt-decode';
import { EncrypterService } from 'src/app/shared/services/encrypter.service';
declare var $:any;

@Component({
  selector: 'app-bulk-custom-salary',
  templateUrl: './bulk-custom-salary.component.html',
  styleUrls: ['./bulk-custom-salary.component.css']
})
export class BulkCustomSalaryComponent {
  excelToTableData:any=[];
  excelBulkEmpUploadArray: any=[];
  showSidebar: boolean = true;
  displayedColumns:any=[];
  token: any;
  tp_account_id: any;
  product_type:any;
  payout_method:any;
  isApiError:any=[];
  showDropdown: boolean=false;

  constructor(private toastr : ToastrService,
    private _employeeService: EmployeeService,
    private _SessionService : SessionService,
    private _encrypterService: EncrypterService
  ){}

  ngOnInit(){
    let session_obj_d: any = JSON.parse(this._SessionService.get_user_session());
    this.token = decode(session_obj_d.token);
    this.tp_account_id = this.token.tp_account_id;
    this.product_type = localStorage.getItem('product_type');
    this.payout_method = this.token.payout_mode_type;
  }

  toggle() {
    this.showSidebar = !this.showSidebar;
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
        if(!this.verifyHeaders(headers)){
          return this.toastr.info("Please download the latest Add Bulk Employee template");
        }

        /* save data */
        const data = XLSX.utils.sheet_to_json(ws,{ defval: '' }); // to get 2d array pass 2nd parameter as object {header: 1}
        // console.log(data); // Data will be logged in array format containing objects
        this.excelBulkEmpUploadArray = data;
        if(this.excelBulkEmpUploadArray.length>50){
          return this.toastr.info("Up to 50 records can be uploaded at a time. Please split the file and try again");
        }

        const mobileregex = /^[6-9]{1}[0-9]{9}$/;
        const dateRegex = /^[0-9]{2}[./-][0-9]{2}[./-][0-9]{4}$/;
        this.displayedColumns = Object.keys(data[0]);
        this.excelToTableData = data;
        // console.log(this.displayedColumns,data);


      //   this.excelBulkEmpUploadArray.map(el => {
      // })

        // for (let i = 0; i < this.excelToTableData.length; i++) {
        //   const row = this.excelToTableData[i];
        //   if(!row.mobile || !row.tpCode || !row.minwagesState || !row.locationType ||
        //     !row.salaryEffectiveDate || !row.salaryDaysOpted || (row.salaryDaysOpted!='Y' && row.salaryDaysOpted!='N')  || !row.salaryDays
        //     || !row.pfCapApplied || (row.pfCapApplied !='Y' && row.pfCapApplied!='N') || !row.pfOpted || (row.pfOpted!='Y' &&
        //     row.pfOpted!='N') || !row.esicOpted || (row.esicOpted !='Y' && row.esicOpted !='N') || !row.professionalTaxStateApplicable ||
        //     (row.professionalTaxStateApplicable!='Y' && row.professionalTaxStateApplicable!='N') || !row.lwfStateApplicable ||
        //     (row.lwfStateApplicable!='Y' && row.lwfStateApplicable!='N') || !row.ctc || !row.basicPercentage || !row.isValidMobile || !row.isValidName
        //     || !row.isValidMinWageSate || !row.isValidLocationType || !row.isValidDate || !row.isValidSalaryDays
        //     || !row.isValidCTC || !row.isValidBasic
        //   ){
        //     this.invalidRow[i]=true;
        //     this.isInvalidData = true;
        //   }

        // }

      };
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
        const expectedHeaders = [
          "Employee_Name","orgempcode", "tpcode", "monthlyofferedpackage", "basic", "hra", "allowances",
          "conveyance_allowance", "medical_allowance", "commission", "salarybonus", "transport_allowance",
          "travelling_allowance", "leave_encashment", "overtime_allowance", "notice_pay",
          "hold_salary_non_taxable", "children_education_allowance", "gratuityinhand", "gross",
          "pfcapapplied", "edli_adminchargesincludeinctc", "epf_employer", "epf_employee",
          "esi_employer", "esi_employee", "salary_in_hand", "ctc", "salarydaysopted",
          "salarydays", "lwfapplicable", "ptapplicable", "location_type",
          "minwagestatename", "effectivedate", "dateofjoining", "gratuity",
          "pfapplicablecomponents", "esiappliedcomponents", "isgroupinsurance",
          "employeeinsuranceamount", "employerinsuranceamount", "employergratuity", "ishourlysetup"
        ];

         return expectedHeaders.every((expectedHeader,index)=> headers[index]===expectedHeader);

        // Compare the expected headers with the actual headers
      }

      saveBulkCustomSalary(){
        this.isApiError=[];
        this._employeeService.SaveBulkPreparedSalary({
          salaryJson : this.excelToTableData,
          user_by : this.token.tp_account_id,
          createdByName : this.token.name,
          customerAccountId: this.tp_account_id,
          productType : this.product_type
        }).subscribe((resData:any)=>{
          if(resData.statusCode){
            let response = JSON.parse(this._encrypterService.aesDecrypt(resData.commonData));
            for(let i=0;i<response.length;i++){
              if(response[i].salstatus=='F'){
                this.isApiError[i]={msg:response[i].msg,status:false};
              }else{
                this.isApiError[i]={msg:response[i].msg,status:true};
              }
            }
            if(this.isApiError.length==0){
              this.toastr.success(resData.message);
              this.excelToTableData=[];
              window.history.back();
            }
          }else{
            this.toastr.error(resData.message);
          }
        })
      }

      /*exportToExcel(status:string) {
        const link = document.createElement('a');
        link.href = 'assets/BulkSalaryTemplate.xlsx';  // Path to your file in the `assets` folder
        link.download = 'Bulk-CustomSalaryTemplate.xlsx';  // Desired file name for download
        link.click();
      }*/

        exportToExcel(status: string) {
          this._employeeService.getCustomerEmployeeDetails({
            "customerAccountId": this.tp_account_id.toString(),
            "productTypeId": this.product_type,
            "GeoFenceId": this.token.geo_location_id, ouIds: this.token.ouIds,
            "department": "",
            "designation": "",
            "searchKeyword": "",
            "employeesStatus": status
          }).subscribe((resData: any) => {
            let prefixName = '';
            if (status == 'Onboarding Pending') {
              prefixName = 'OnboardEmployee_';
            }
            else if (status == 'Active') {
              prefixName = 'ActiveEmployee_';
            }
            let exportData = [];
            if (resData.statusCode) {
              let data: any = JSON.parse(this._encrypterService.aesDecrypt(resData.commonData));
              // console.log("EXPORT DATA", data);

              if (status == 'Onboarding Pending') {
                prefixName = 'OnboardEmployee_';
              }
              else if (status == 'Active') {
                prefixName = 'ActiveEmployee_';
              }

              for (let i = 0; i < data.length; i++) {
                let jsonData = data[i].permanent_address ? JSON.parse(data[i].permanent_address) : data[i].permanent_address;
                let nonemptyVal = Object.values(jsonData).filter(value => value !== "");
                let perm_add = nonemptyVal.join(', ')?.replaceAll('<br>', '');


                // if(status=='Onboarding Pending'){
                if (status == 'Active') {
                  exportData.push({
                    "Employee_Name": data[i].emp_name,
                    "orgempcode": data[i].orgempcode,
                    "tpcode": data[i].tpcode,
                    "monthlyofferedpackage": data[i].monthlyofferedpackage,

                    "basic": data[i].basic, // basic1
                    "hra": data[i].hra,     // hra1
                    "allowances": data[i].allowances,  //allowances1

                    "conveyance_allowance": data[i].conveyance_allowance,
                    "medical_allowance": data[i].medical_allowance,
                    "commission": data[i].commission,
                    "salarybonus": data[i].salarybonus,
                    "transport_allowance": data[i].transport_allowance,
                    "travelling_allowance": data[i].travelling_allowance,
                    "leave_encashment": data[i].leave_encashment,
                    "overtime_allowance": data[i].overtime_allowance,
                    "notice_pay": data[i].notice_pay,
                    "hold_salary_non_taxable": data[i].hold_salary_non_taxable,
                    "children_education_allowance": data[i].children_education_allowance,
                    "gratuityinhand": data[i].gratuityinhand,

                    "gross": data[i].gorss,   //gross1

                    "pfcapapplied": data[i].pfcapapplied,
                    "edli_adminchargesincludeinctc": data[i].edli_adminchargesincludeinctc,
                    "epf_employer": data[i].epf_employer,
                    "epf_employee": data[i].epf_employee,
                    "esi_employer": data[i].esi_employer,
                    "esi_employee": data[i].esi_employee,
                    "salary_in_hand": data[i].salary_in_hand,

                    "ctc": data[i].ctc,  // ctc1

                    "salarydaysopted": data[i].salarydaysopted,

                    "salarydays": data[i].salarydays, // salarydays1

                    "lwfapplicable": data[i].lwfapplicable,
                    "ptapplicable": data[i].ptapplicable,
                    "location_type": data[i].location_type,
                    "minwagestatename": data[i].minwagestatename,
                    "effectivedate": data[i].effectivedate,

                    "dateofjoining": data[i].dateofjoining,  // dateofjoining1

                    "gratuity": data[i].gratuity,
                    "pfapplicablecomponents": data[i].pfapplicablecomponents,
                    "esiappliedcomponents": data[i].esiappliedcomponents,
                    "isgroupinsurance": data[i].isgroupinsurance,
                    "employeeinsuranceamount": data[i].employeeinsuranceamount,
                    "employerinsuranceamount": data[i].employerinsuranceamount,
                    "employergratuity": data[i].employergratuity,
                    "ishourlysetup": data[i].ishourlysetup,

                    // "Employee Name*": data[i].emp_name,
                    // "Mobile no*": data[i].mobile,
                    // "TP Code": data[i].tpcode,
                    // "Father/Husband's Name*": data[i].fathername,
                    // "Gender(M/F/T)*": data[i].gender,
                    // "DOB(DD/MM/YYYY)*": data[i].dateofbirth,
                    // "Designation": data[i].post_offered,
                    // "Department": data[i].posting_department,
                    // "Email Id": data[i].email,
                    // "Aadhaar Card No*": data[i].aadhar_card_no,
                    // "Pan Card No*": data[i].pancard,
                    // "Bank AC No*": data[i].bankaccountno,
                    // "IFSC Code*": data[i].ifsccode,
                    // 'Bank Name*': data[i].bank_name,
                    // 'Bank Branch*': data[i].bank_branch,
                    // 'isAccountNoVerified': data[i].account_verification_status,
                    // 'UAN No': data[i].uannumber,
                    // 'ESIC No': data[i].esinumber,
                    // 'ESIC Dependent Details': data[i]?.esic_dependent_details,
                    // 'Relation Emergency Contact No': data[i].emergency_contact,
                    // 'Blood Relation Name': data[i].bloodrelationname,
                    // 'Permanent Address*': perm_add,
                    // 'Residential Address': data[i].residential_address,
                    // 'Org Emp Code': data[i].orgempcode,
                    // 'Reporting Manager Name': data[i].reportingmanagername
                  })
                } else {
                  exportData.push({
                    "Employee_Name": data[i].emp_name,
                    "orgempcode": data[i].orgempcode,
                    "tpcode": data[i].tpcode,
                    "monthlyofferedpackage": "",
                    "basic": "",
                    "hra": "",
                    "allowances": "",
                    "conveyance_allowance": "",
                    "medical_allowance": "",
                    "commission": "",
                    "salarybonus": "",
                    "transport_allowance": "",
                    "travelling_allowance": "",
                    "leave_encashment": "",
                    "overtime_allowance": "",
                    "notice_pay": "",
                    "hold_salary_non_taxable": "",
                    "children_education_allowance": "",
                    "gratuityinhand": "",
                    "gross": "",
                    "pfcapapplied": "",
                    "edli_adminchargesincludeinctc": "",
                    "epf_employer": "",
                    "epf_employee": "",
                    "esi_employer": "",
                    "esi_employee": "",
                    "salary_in_hand": "",
                    "ctc": "",
                    "salarydaysopted": "",
                    "salarydays": "",
                    "lwfapplicable": "",
                    "ptapplicable": "",
                    "location_type": "",
                    "minwagestatename": "",
                    "effectivedate": "",
                    "dateofjoining": "",
                    "gratuity": "",
                    "pfapplicablecomponents": "",
                    "esiappliedcomponents": "",
                    "isgroupinsurance": "",
                    "employeeinsuranceamount": "",
                    "employerinsuranceamount": "",
                    "employergratuity": "",
                    "ishourlysetup": "N",

                  })

                }
              }

              const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);
              const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
              const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
              const excelData: Blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
              const downloadLink: any = document.createElement('a');
              downloadLink.href = window.URL.createObjectURL(excelData);
              let date = new Date()
              downloadLink.download = `${prefixName}Bulk-CustomSalaryTemplate.xlsx`;
              downloadLink.click();
              this.showDropdown = false;
            }
            else {

              exportData.push({
                "Employee_Name": "",
                "orgempcode": "",
                "tpcode": "",
                "monthlyofferedpackage": "",
                "basic": "",
                "hra": "",
                "allowances": "",
                "conveyance_allowance": "",
                "medical_allowance": "",
                "commission": "",
                "salarybonus": "",
                "transport_allowance": "",
                "travelling_allowance": "",
                "leave_encashment": "",
                "overtime_allowance": "",
                "notice_pay": "",
                "hold_salary_non_taxable": "",
                "children_education_allowance": "",
                "gratuityinhand": "",
                "gross": "",
                "pfcapapplied": "",
                "edli_adminchargesincludeinctc": "",
                "epf_employer": "",
                "epf_employee": "",
                "esi_employer": "",
                "esi_employee": "",
                "salary_in_hand": "",
                "ctc": "",
                "salarydaysopted": "",
                "salarydays": "",
                "lwfapplicable": "",
                "ptapplicable": "",
                "location_type": "",
                "minwagestatename": "",
                "effectivedate": "",
                "dateofjoining": "",
                "gratuity": "",
                "pfapplicablecomponents": "",
                "esiappliedcomponents": "",
                "isgroupinsurance": "",
                "employeeinsuranceamount": "",
                "employerinsuranceamount": "",
                "employergratuity": "",
                "ishourlysetup": ""
              })
              const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);
              const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
              const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
              const excelData: Blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
              const downloadLink: any = document.createElement('a');
              downloadLink.href = window.URL.createObjectURL(excelData);
              let date = new Date()
              downloadLink.download = `${prefixName}Bulk-CustomSalaryTemplate.xlsx`;
              downloadLink.click();
              this.showDropdown = false;
            }

          })
        }

      clearInput(action:any='') {
        if(action!='notEmpty')
        $('#salary_input').val('');
        this.excelToTableData = [];
        this.isApiError=[];
      }

      toggleDropdown(event: Event): void {
        event.preventDefault(); // Prevent default link action
        this.showDropdown = !this.showDropdown;
      }

      closeDropdown(event: MouseEvent): void {
        // if (!this.elementRef.nativeElement.contains(event.target)) {
          this.showDropdown = false;
        }

}
