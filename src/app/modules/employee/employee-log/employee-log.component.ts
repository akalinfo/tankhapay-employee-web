import { Component } from '@angular/core';
import { EmployeeService } from '../employee.service';
import { EncrypterService } from 'src/app/shared/services/encrypter.service';
import { SessionService } from 'src/app/shared/services/session.service';
import decode from 'jwt-decode';
import { ToastrService } from 'ngx-toastr';
import { firstValueFrom } from 'rxjs';
import { isNgContainer } from '@angular/compiler';

@Component({
  selector: 'app-employee-log',
  templateUrl: './employee-log.component.html',
  styleUrls: ['./employee-log.component.css']
})
export class EmployeeLogComponent {

  showSidebar: boolean=true;
  token : any;
  tp_account_id:any;
  employeeList:any=[];
  product_type :any
  totalRecords: any=0;
  pendingInCrm: any=0;
  partiallyPending: any=0;
  page: any=1;
  uniqueDetails: any=[];
  isDataUpdated :any=[];
  partialEmployees: boolean=false;
  partialRecords: any=[];
  errormsg:any =[];
  apiPage: any=0;
  duplicateCount: any=0;
  isbuttonClicked:boolean=false;

  constructor(private _EmployeeService: EmployeeService,
    private _EncrypterSerivce : EncrypterService,
    private _SessionService : SessionService,
    private toastr : ToastrService){}

  ngOnInit(){
    let session_obj_d: any = JSON.parse(this._SessionService.get_user_session());
    this.token = decode(session_obj_d.token);
    this.tp_account_id = this.token.tp_account_id;
    this.product_type = this.token.product_type;
    // this.payout_method = this.token.payout_mode_type;
    if(!localStorage.getItem('pageNo')){
      localStorage.setItem('pageNo',this.page);
    }
    // this.fetchEmployeesFromAPI(0);
    this.getEmployerEmployeeviaApi();
  }

  toggle() {
    this.showSidebar = !this.showSidebar;
  }

  fetchEmployeesFromAPI(inc_page:number){
    console.log(this.apiPage);
    
    this._EmployeeService.fetchEmployeesFromAPI({'customerAccountId':this._EncrypterSerivce.aesEncrypt(this.tp_account_id.toString()),'pageNo':this.apiPage+1}).subscribe((resData:any)=>{
      if(resData.statusCode){
        this.toastr.success("Employee fetched succcessfully.")
        // if(this.employeeList.length==0)
        this.getEmployerEmployeeviaApi();
      }else{
        this.toastr.error(resData.message);
      }
    })
  }

  getEmployerEmployeeviaApi(){
    this._EmployeeService.getEmployerEmployeeFromApi({'pageNo':this.page,'limit':20,'customerAccountId': this._EncrypterSerivce.aesEncrypt(this.tp_account_id.toString())}).subscribe((resData:any)=>{
      if(resData.statusCode){
        this.totalRecords = resData.totalRecords;
        this.pendingInCrm = resData.pendingToPushInCRM;
        this.partiallyPending= resData.pendingToPushInHub;
        this.employeeList= resData.commonData!=''?JSON.parse(this._EncrypterSerivce.aesDecrypt(resData.commonData)):[];
        this.apiPage = resData.pageNo;
       
        //  this.markDuplicates()
        this.checkUniqueDetails();
      }else{
        this.apiPage = !resData.pageNo? this.apiPage : resData.pageNo;
        this.toastr.error(resData.message);
        this.employeeList=[]
      }
    })
  }

  markDuplicates() {
    let records = this.employeeList;
    const seen = {
      mobile: new Map(),
      pan: new Map(),
      aadhar: new Map(),
      bankAccount: new Map(),
      empCode: new Map()
    };
  
    for (let i = 0; i < records.length; i++) {
      let record = records[i];
      let isDuplicate = false;
  
      if (seen.mobile.has(record.mobile_number)) {
        isDuplicate = true;
        records[seen.mobile.get(record.mobile_number)].isDuplicate = true; // Mark original as duplicate
      } else {
        seen.mobile.set(record.mobile_number, i);
      }
  
      // Uncomment and implement similar logic for other fields if required
      // if (seen.pan.has(record.pan_number)) {
      //   isDuplicate = true;
      //   records[seen.pan.get(record.pan_number)].isDuplicate = true;
      // } else {
      //   seen.pan.set(record.pan_number, i);
      // }
  
      // if (seen.aadhar.has(record.aadhar_number)) {
      //   isDuplicate = true;
      //   records[seen.aadhar.get(record.aadhar_number)].isDuplicate = true;
      // } else {
      //   seen.aadhar.set(record.aadhar_number, i);
      // }
  
      // if (seen.bankAccount.has(record.account_number)) {
      //   isDuplicate = true;
      //   records[seen.bankAccount.get(record.account_number)].isDuplicate = true;
      // } else {
      //   seen.bankAccount.set(record.account_number, i);
      // }
  
      // if (seen.empCode.has(record.employee_id)) {
      //   isDuplicate = true;
      //   records[seen.empCode.get(record.employee_id)].isDuplicate = true;
      // } else {
      //   seen.empCode.set(record.employee_id, i);
      // }
  
      record.isDuplicate = isDuplicate;
      if (isDuplicate) {
        this.duplicateCount += 1;
      }
    }
  
  }
 async checkUniqueDetails(){
    let postData=[];
    for (let i = 0; i < this.employeeList.length; i++) {
      const postData = {
        'productTypeId': this._EncrypterSerivce.aesEncrypt(this.product_type),
        'customerAccountId': this._EncrypterSerivce.aesEncrypt(this.tp_account_id.toString()),
        'empEmail': '',
        'empMobile': this.employeeList[i].mobile_number !== '' ? this.employeeList[i].mobile_number.replace(/\D/g, '') : '',
        'aadharCardNo': this.employeeList[i].aadhar_number !== '' ? this.employeeList[i].aadhar_number.replace(/\D/g, '') : '',
        'panCardNo': this.employeeList[i].pan_number !== '' ? this.employeeList[i].pan_number : '',
        'bankAccountNo': this.employeeList[i].account_number !== '' ? this.employeeList[i].account_number.replace(/\D/g, '') : '',
        'orgEmpCode': this.employeeList[i].employee_id === '' ? '' : this.employeeList[i].employee_id,
      };
  
      try {
        const resData :any= await firstValueFrom(this._EmployeeService.checkUniqueDetails({
          'productTypeId': this._EncrypterSerivce.aesEncrypt(this.product_type),
          'customerAccountId': this._EncrypterSerivce.aesEncrypt(this.tp_account_id.toString()),
          'encrypted': [postData]
        }));
  
        if (resData.statusCode) {
          const data = JSON.parse(this._EncrypterSerivce.aesDecrypt(resData.commonData));
          // console.log(data);
          
          this.uniqueDetails[i] = data[0];
          if(i==this.employeeList.length-1)
          this.getErrorRecords();
        }
      } catch (error) {
        this.toastr.error(error);
        console.error('Error:', error);
      }
    }
}

  checkallCheckbox(isChecked:boolean,index:any){
    
    if(isChecked){
      let elements:any = document.querySelectorAll('.employeeListCheck');
      if(index==0){

        for(let idx=0;idx<elements.length;idx++){
          elements[idx].checked=true;
          this.partialRecords[idx] = true;
        }
      }else{
        this.partialRecords[index] = true;
      }
      this.partialEmployees = true;
    }else{
      let elements:any = document.querySelectorAll('.checkallCheckbox');
      if(index==0){

        for(let idx=0;idx<elements.length;idx++){
          elements[idx].checked=false;
          this.partialRecords[idx] = false;
        }
      }else{
        this.partialRecords[index] = false;
      }
      this.partialEmployees = false;
    }
  
  }

  getErrorRecords(){
    let mobileRegex = /^[0-9]{10}$/;
    let aadharRegex = /^[0-9]{12}$/;
    let panRegex = /^[a-zA-Z]{5}[0-9]{4}[a-zA-Z]{1}$/;
    let emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;

    for (let i = 0; i < this.employeeList.length; i++) {
      this.partialRecords[i] = false;

      const mobileValid = mobileRegex.test(this.employeeList[i].mobile_number.replace(/\D/g, ""));
      // const aadharValid = this.employeeList[i].aadhar_number ? aadharRegex.test(this.employeeList[i].aadhar_number) : false;
      // const panValid = this.employeeList[i].pan_number ? panRegex.test(this.employeeList[i].pan_number) : false;
      const emailValid = this.employeeList[i].email_id ? emailRegex.test(this.employeeList[i].email_id) : true;

      const empMobileStatus = this.uniqueDetails[i]?.empMobileStatus || false;
      const otherConditions = this.employeeList[i].status !== '0' && this.employeeList[i].staff_category === '1' && !this.employeeList[i].is_duplicate_mobile_no;

      if (!mobileValid || !empMobileStatus || !otherConditions || !emailValid) {
          this.employeeList[i].error_record = true;
      } else {
          this.employeeList[i].error_record = false;
      }
    }
  }

  getErrorMsg(i: any) {
    let mobileRegex = /^[0-9]{10}$/;
    let aadharRegex = /^[0-9]{12}$/;
    let panRegex = /^[a-zA-Z]{5}[0-9]{4}[a-zA-Z]{1}$/;
    let emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
  
    this.errormsg[i] = '';
  
    if (this.employeeList[i].status == '0') {
      this.errormsg[i] += this.employeeList[i].status_msg + '\n';
    }
    if (this.employeeList[i].staff_category != '1') {
      this.errormsg[i] += this.employeeList[i].staff_category_msg + '\n';
    }
    if (this.employeeList[i].is_duplicate_mobile_no) {
      this.errormsg[i] += "Duplicate Records in this Dataset.\n";
    }
    if (this.employeeList[i].status == '0' || this.employeeList[i].staff_category != '1') return;
  
    if (!mobileRegex.test(this.employeeList[i].mobile_number.replace(/\D/g, ""))) {
      this.errormsg[i] += 'Invalid Mobile number.\n';
    }
    const aadharValid = this.employeeList[i].aadhar_number != '' && aadharRegex.test(this.employeeList[i].aadhar_number.replace(/\D/g, ""));
    const panValid = this.employeeList[i].pan_number != '' && panRegex.test(this.employeeList[i].pan_number.replaceAll("'", ""));
  
    if (!aadharValid) {
        this.employeeList[i].aadharCardNo = ''; 
      }
    if (!panValid) {
        this.employeeList[i].panCardNo = '';  
    }
  
    if (this.employeeList[i].email_id != '' && !emailRegex.test(this.employeeList[i].email_id.replaceAll("'", ""))) {
      this.errormsg[i] += 'Invalid Email id.\n';
    }
  
    if (!this.uniqueDetails[i]?.empMobileStatus) {
      this.errormsg[i] += 'Mobile number Already exist.\n';
    }
    if (!this.uniqueDetails[i]?.aadharCardNoStatus) {
      this.errormsg[i] += 'Aadharcard number Already exist.\n';
    }
    if (!this.uniqueDetails[i]?.bankAccountNoStatus) {
      this.errormsg[i] += 'Bank account number Already exist.\n';
    }
    if (!this.uniqueDetails[i]?.panCardNoStatus) {
      this.errormsg[i] += 'Pancard number Already exist.\n';
    }
    if (!this.uniqueDetails[i]?.orgEmpCodeStatus) {
      this.errormsg[i] += 'Employee code Already exist.\n';
    }
  }
  

  uploadExcel(): any {
    let employeeList = this.employeeList;
    this.isbuttonClicked=true;
    if (employeeList) {
        let promises = [];

        for (let i = 0; i < employeeList.length; i++) {
            if (!employeeList[i].error_record && !employeeList[i].is_duplicate_mobile_no) {
                const promise = new Promise((resolve, reject) => {
                 
                    let postData = {
                        'product_type': this.product_type,
                        'employee_name': employeeList[i].emp_name,
                        'employee_mobile': employeeList[i].mobile_number.replace(/\D/g, ""),
                        'employee_email': employeeList[i].email_id,
                        'employer_leadid': this.token.tp_lead_id.toString(),
                        'customeraccountid': this.token.tp_account_id.toString(),
                        'employer_id': this.token.id.toString(),
                        'geoFenceId': this.token.geo_location_id.toString(),
                        'ouIds': this.token.ouIds.toString(),
                        'subEmpId': this.token.sub_userid != undefined ? this.token.sub_userid.toString() : null,
                        'category_cd': !employeeList[i].jobType ? 'Permanent': employeeList[i].jobType
                    };

                    this._EmployeeService.add_new_employee(postData).subscribe((resData: any) => {
                        if (resData.statusCode) {
                            this._EmployeeService.updateSyncStatus({
                                'customeraccountid': this._EncrypterSerivce.aesEncrypt(this.token.tp_account_id.toString()),
                                'statusSyncAction': this._EncrypterSerivce.aesEncrypt('PushedInCrm'),
                                'row_id': employeeList[i].row_id,
                                'modifiedBy': this.token.id
                            }).subscribe((resData1: any) => {
                                if (resData1.statusCode) {
                                    resolve('Employee saved and status updated');
                                } else {
                                    reject(`Failed to update status for row ${i + 1}`);
                                }
                            });
                        } else {
                            reject(resData.message);
                        }
                    });
                });

                promises.push(promise);
            }
        }

        Promise.all(promises).then(async (results) => {
            await this.update_employee_details(employeeList);
        }).catch(async (error) => {
          this.isbuttonClicked=false;
            return this.toastr.error(error);
        });
    } else {
      this.isbuttonClicked=false;
        this.toastr.error("Excel data is incorrect.", "Oops");
    }
}

update_employee_details(employeeList: any): any {
    const promises = [];

    for (let i = 0; i < employeeList.length; i++) {
        if (!employeeList[i].error_record || (employeeList[i].error_record && employeeList[i]?.isRecordToBeUpdated)) {
          const panRegex = /^[a-zA-Z]{5}[0-9]{4}[a-zA-Z]{1}$/;
          const aadharRegex = /^[0-9]{12}$/;

          const isPanValid = panRegex.test(employeeList[i].pan_number.replaceAll("'", ''));
          const isAadharValid = aadharRegex.test(employeeList[i].aadhar_number.replace(/\D/g, ""));

            const postData = {
                salutation: '',
                fatherName: employeeList[i].father_name !== '' ? employeeList[i].father_name.replaceAll("'", '') : '',
                empName: employeeList[i].emp_name != '' ? employeeList[i].emp_name.replaceAll("'", '') : '',
                gender: employeeList[i].gender == '' ? 'O' : employeeList[i].gender.replaceAll("'", ''),
                dob: employeeList[i].date_of_birth == '0000-00-00' ? '' : employeeList[i].date_of_birth,
                doj: employeeList[i].joining_date,
                postOffered: employeeList[i].role != '' ? employeeList[i].role.replaceAll("',", '') : 'N/A',
                mobile: employeeList[i].mobile_number.replace(/\D/g, ""),
                email: employeeList[i].email_id != '' ? employeeList[i].email_id.replaceAll("'", '') : '',
                aadharCardNo: isAadharValid ? employeeList[i].aadhar_number.replace(/\D/g, "") : '',
                panCardNo: isPanValid ? employeeList[i].pan_number.replaceAll("'", '') : '',
                bankAccountNo: employeeList[i].account_number.replace(/\D/g, ""),
                ifscCode: employeeList[i].ifsc_code != '' ? employeeList[i].ifsc_code.replaceAll("'", '') : '',
                bankName: employeeList[i].bank_name != '' ? employeeList[i].bank_name.replaceAll("'", '') : '',
                bankBranch: employeeList[i].bank_branch_name != '' ? employeeList[i].bank_branch_name.replaceAll("'", '') : '',
                pfOpted: employeeList[i].epf_eligible == '' ? 'N' : employeeList[i].epf_eligible == 'No' ? 'N' : employeeList[i].epf_eligible == 'Yes' ? 'Y' : 'N',
                uanNumber: !employeeList[i].uan_number && (employeeList[i].epf_eligible == 'Y' || employeeList[i].epf_eligible == 'Yes') ? 'Request for UAN' : employeeList[i].uan_number.replace(/\D/g, ""),
                esicOpted: employeeList[i].esi_eligible == '' ? 'N' : employeeList[i].esi_eligible == 'No' ? 'N' : employeeList[i].esi_eligible == 'Yes' ? 'Y' : 'N',
                esicNumber: !employeeList[i].esi_number && (employeeList[i].esi_eligible == 'Y' || employeeList[i].esi_eligible == 'Yes') ? 'Request for ESIC' : employeeList[i].esi_number.replace(/\D/g, ""),
                esicDependentDetails: employeeList[i].esic_dependent_details != '' ? employeeList[i].esic_dependent_details.replace("'", '') : '',
                emergencyContact: employeeList[i].alternate_mobile_number != '' ? employeeList[i].alternate_mobile_number.replace("'", '') : '',
                bloodRelationName: employeeList[i].bloodrelationname != '' ? employeeList[i].bloodrelationname.replace("'", '') : '',
                permanentAddress: employeeList[i].permanent_address != '' ? employeeList[i].permanent_address.replace("'", '') : '',
                residentialAddress: employeeList[i].communication_address != '' ? employeeList[i].communication_address.replace("'", '') : '',
                orgEmpCode: employeeList[i].employee_id != '' ? employeeList[i].employee_id.replace("'", '') : '',
                reportingManagerName: employeeList[i].reportingmanagername != '' ? employeeList[i].reportingmanagername.replace("'", '') : '',
                academy : employeeList[i].academy ? employeeList[i].academy.trim() :'',
                'productTypeId': this._EncrypterSerivce.aesEncrypt(this.product_type),
                'customerAccountId': this._EncrypterSerivce.aesEncrypt(this.tp_account_id.toString()),
                'updatedBy': this.token.id
            };

            const promise = new Promise(async (resolve, reject) => {
              this.isbuttonClicked=true;
                await this._EmployeeService.updateEmployeeDetailsThroughApiProcess(postData).subscribe(
                    (resData: any) => {
                        if (resData.statusCode) {
                            this._EmployeeService.updateSyncStatus({
                                'customeraccountid': this._EncrypterSerivce.aesEncrypt(this.token.tp_account_id.toString()),
                                'statusSyncAction': this._EncrypterSerivce.aesEncrypt('PushedInHub'),
                                'row_id': employeeList[i].row_id,
                                'modifiedBy': this.token.id
                            }).subscribe((resData1: any) => {
                                if (resData1.statusCode) {
                                    resolve(`Employee details updated for row ${i + 1}`);
                                }
                            });
                        } else {
                            this._EmployeeService.updateSyncStatus({
                                'customeraccountid': this._EncrypterSerivce.aesEncrypt(this.token.tp_account_id.toString()),
                                'statusSyncAction': this._EncrypterSerivce.aesEncrypt('PushedInCrm'),
                                'row_id': employeeList[i].row_id,
                                'modifiedBy': this.token.id
                            }).subscribe((resData1: any) => {
                                if (resData1.statusCode) {
                                    reject(`Failed to update employee details for row ${i + 1}: ${resData.message}`);
                                }
                            });
                        }
                    },
                    (error) => {
                        reject(`Error updating employee details for row ${i + 1}: ${error.message}`);
                    }
                );
            });

            promises.push(promise);
        }
    }

    Promise.all(promises)
        .then((results: any): any => {
          
            if (promises.length == 0) {
                return this.toastr.info("Invalid records");
            }
            this.toastr.success(`${promises.length} records saved successfully.`);
            this.isbuttonClicked=false;
            this.getEmployerEmployeeviaApi();
        })
        .catch((error) => {
      
          this.isbuttonClicked=false;
            this.getEmployerEmployeeviaApi();
            this.toastr.error(error);
        });
}



  get_page(event: any) {
    this.page = event;
    localStorage.setItem('pageNo',this.page);
    this.duplicateCount =0;
    this.getEmployerEmployeeviaApi();
  }

  updateEmp(emp:any){
    this._EmployeeService.syncEmployeeDetails({'customerAccountId':this.tp_account_id,'orgEmpCode':emp.employee_id,'modifiedBy':this.token.id}).subscribe((resData:any)=>{
      if(resData.statusCode){
        this.getEmployerEmployeeviaApi();
        return this.toastr.success(resData.commonData.savedEmployeesDetails[0].message);
      }else{
        return this.toastr.error(resData.message);
      }
    })
  }

  updateExisitingRecords(){
    let postdata=[]
    for(let i=0;i<this.employeeList.length;i++){
     
      if(this.employeeList[i].record_push_to_crm=='1'){
        this.employeeList[i].isRecordToBeUpdated = true;
        postdata.push(this.employeeList[i])
      }
    }
   
    this.update_employee_details(postdata);
  }
}
