import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EncrypterService } from 'src/app/shared/services/encrypter.service';
import { SessionService } from 'src/app/shared/services/session.service';
import { FaceCheckinService } from '../../attendance/face-checkin.service';
import decode from 'jwt-decode';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReportService } from '../../reports/report.service';
import { ShiftSpecificService } from '../../attendance/shift-specific-service';
import { EmployeeManagementService } from '../employee-management.service';
import { EmployeeService } from '../../employee/employee.service';
import { ToastrService } from 'ngx-toastr';
import { dongleState, grooveState } from 'src/app/app.animation';
declare var $:any;

@Component({
  selector: 'app-empl-app-setting',
  templateUrl: './empl-app-setting.component.html',
  styleUrls: ['./empl-app-setting.component.css'],
  animations : [grooveState,dongleState]
})
export class EmplAppSettingComponent {
  showSidebar: any=true;
  policyType='';
  policyid:any;
  token: any;
  policyList: any=[];
  policyForm:FormGroup;
  deptDropdownList:any=[];
  empDropdownList:any=[];
  selectedEmp :any=[];
  selectedDept :any=[];
  currentCursorField: any;
  page: number= 1;
  deptDropdownSettings ={};
  employeeDropdownSettings ={};
  isAddUpdatePolicy : boolean = false;
  isAddUpdatePolicy1 : boolean = false;
  isShowList : boolean = false;
  listType: string;
  listData: any=[];

  minDate:any = '';

  constructor(
    private route : ActivatedRoute,
    private _encrypterService : EncrypterService,
    private _sessionService : SessionService,
    private _faceCheckinService : FaceCheckinService,
    private _fb : FormBuilder,
    private _ReportService : ReportService,
    private shiftSettingService: ShiftSpecificService,
    private _employeeMgmtService : EmployeeManagementService,
    private _employeeService : EmployeeService,
    private toastr: ToastrService
  ){

    
    this.route.params.subscribe(param=>{
      let id = param['id'];
      if(id){
        this.policyid = this._encrypterService.aesDecrypt(id);
      }
    })
  }

  ngOnInit(){
    let session_obj_d: any = JSON.parse(
      this._sessionService.get_user_session());
      this.token = decode(session_obj_d?.token);

      const minDate = new Date();
   
    // Convert to YYYY-MM-DD format for input[type="date"]
    var mmm = minDate.getMonth()+1;
    var mmmm = (mmm>9)?mmm:"0"+mmm
    this.minDate = minDate.getFullYear()+"-"+mmmm+"-"+minDate.getDate();

      this.policyForm = this._fb.group({
        policiesName : [''],
        applicableForDept : ['',[Validators.required]],
        applicableForEmp : ['',[Validators.required]],
        policyCreateDt :['',[Validators.required]],
        id:[null],
        presentFlag : ['N'],
        leaveFlag : ['N'],
        halfDayFlag : ['N'],
        weeklyOff : ['N'],
        wfhFlag : ['N'],
        empTodayAttendanceFlag : ['N'],
        checkInCheckOutFlag : ['N'],
        salaryFlag : ['N'],
        leaves : ['N'],
        idCardFlag : ['N'],
        incomeTaxFlag : ['N'],
      })

      this.deptDropdownSettings = {
        singleSelection: false,
        idField: 'posting_department',
        textField: 'posting_department',
        selectAllText: 'Select All',
        unSelectAllText: 'UnSelect All',
        allowSearchFilter: true, 
        // allowRemoteDataSearch: true,     
        // searchFilter: (term: string, item: any)=> this.customSearchFilter(term, item)
    };

    this.employeeDropdownSettings = {
      singleSelection: false,
      idField: 'emp_code',
      textField: 'emp_name',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      allowSearchFilter: true, 
      itemsShowLimit: 3,
      // allowRemoteDataSearch: true,     
      // searchFilter: (term: string, item: any)=> this.customSearchFilter(term, item)
    };

      this.getPolicyListByid();
      this.get_att_dept_master_list();
      this.getUserList();
  }
  toggle() {
    this.showSidebar = !this.showSidebar;
  }

  getPolicyListByid(){
    this._faceCheckinService.getemployeeList({
      "action": "get_app_setting_list",
      "customeraccountid": this.token.tp_account_id.toString( ),
      "emp_code": '',
      "organization_unitid": "",
      "keyword": "",
      "fromdate": "",
      "todate": ""
    }).subscribe((resData:any)=>{
      if(resData.statusCode){
        this.policyList = JSON.parse(this._encrypterService.aesDecrypt(resData.commonData));

        let deptArr= [];
        this.policyList.department_value?.split(',').map(dept=>dept.trim()).map(dept=> deptArr.push({
          posting_department: dept
        }))
        this.selectedDept = deptArr
        this.policyForm.patchValue({
           applicableForDept : deptArr,
          policiesName : this.policyList[0].policies_name,
          policyCreateDt: this.policyList[0].policies_create_date?.substring(0,10),
          id : this.policyList[0].id,
          presentFlag : this.policyList[0].att_present_flag,
          leaveFlag : this.policyList[0].leave_flag,
          halfDayFlag : this.policyList[0].half_day_flag,
          weeklyOff : this.policyList[0].weekly_off_flag,
          wfhFlag : this.policyList[0].wfh_flag,
          empTodayAttendanceFlag : this.policyList[0].emp_today_attendance_flag,
          checkInCheckOutFlag : this.policyList[0].check_in_check_out_flag,
          salaryFlag : this.policyList[0].salary_flag,
          leaves :this.policyList[0].leaves_flag,
          idCardFlag : this.policyList[0].id_card_flag,
          incomeTaxFlag : this.policyList[0].income_tax_flag,
        })

// console.log(this.policyList[0].policies_name);
        // this.policyType = this.policyList[0].policies_type;
      }else{
        this.policyList= [];
      }
    })
  }

  get_att_dept_master_list(){
    this._ReportService.GetMaster_Dropdown({
      "actionType": "GetPostingDepartments",
      "productTypeId": this.token.product_type,
      "customerAccountId": this.token.tp_account_id.toString(),
    }).subscribe((resData: any) => {
      // console.log(resData);
      if (resData.statusCode) {
        this.deptDropdownList = resData.commonData;
      //   if (!this.deptList.some(department => department.posting_department === this.selectedDepartmentId)) {
      //     this.selectedDepartmentId = 'All';  // Reset if the previously selected department no longer exists
      // }
      } else {
        this.deptDropdownList = [];
        // console.log(resData.message);
      }
    });
  }

  getUserList(){
    let obj=
    {
     customeraccountid:this.token.tp_account_id.toString(),
     productTypeId:this.token.product_type,
     GeoFenceId:this.token.geo_location_id
  }
     this.shiftSettingService.getUserList(obj
      ).subscribe((res:any)=>{
        if(res.statusCode){
        this.empDropdownList=[];
        let userList=res.commonData
        userList.map((item)=>{
          item.emp_name = item.emp_name + `  (${item.orgempcode!=''? item.orgempcode : (item.tpcode ? item.tpcode : item.emp_code)})`
          if(item.joiningstatus.trim() == 'Active' && item.dateofrelieveing ==''){
            this.empDropdownList.push(item)
          }
        })
      
      }else{
        this.empDropdownList=[];
      }
    })
  }
  
  onItemSelect(item:any){
    
  }

  onSelectAll(item:any){
    
  }
  onUnselectAll(item:any){
    
  }
  onItemUnselect(item:any){
    
  }

  submitPolicy():any{
    let policyForm = this.policyForm.value;
    if(!policyForm.policiesName){
      policyForm.policiesName='Configration';
    }
    if(!policyForm.policiesName){
      return this.toastr.error("Please enter policy name");
    }
    if(!policyForm.applicableForDept && !policyForm.applicableForEmp){
      return this.toastr.error('Please select either department or employee');
    }

    // if(!policyForm.policyCreateDt){
    //   return this.toastr.error('Please select policy created date');
    // }
    let postData = {
      ...this.policyForm.value,
      action : this.policyForm.value.id ? 'update_app_setting' :'save_app_setting',
      customerAccountId : this.token.tp_account_id,
      applicableForEmp : this.selectedEmp.map(e1=> e1.emp_code).join(','),
      applicableForDept : this.selectedDept.map(e1 => e1.posting_department).join(',')

    }

    this._employeeMgmtService.manageEmpAppSettings(postData).subscribe((resData:any)=>{
      if(resData.statusCode){
        this.toastr.success(resData.message);
        this.getPolicyListByid();
        this.hideModal();
        this.hideModal1();
        return this.toastr.success(resData.message);
      }
      else{
        return this.toastr.error(resData.message);
      }
    })

  }

  deletePolicy(id:any){
    if(!confirm('Are you sure you want to delete this policy?')){
      return;
    }
    let postData = {
      action : 'delete_app_setting',
      customerAccountId : this.token.tp_account_id,
      id:id

    }

    this._employeeMgmtService.manageEmpAppSettings(postData).subscribe((resData:any)=>{
      if(resData.statusCode){
        this.toastr.success(resData.message);
        this.getPolicyListByid();
        this.hideModal();
      }
    })
    
  }

  hideModal(){
    // $('#add-policy').modal('hide');
    this.isAddUpdatePolicy= false;
    document.querySelector('body').classList.remove('modal-open')
    this.policyForm.reset();
    this.selectedEmp =[];
    this.selectedDept = [];
  }
  hideModal1(){// 2nd popup
    // $('#add-policy').modal('hide');
    this.isAddUpdatePolicy1= false;
    document.querySelector('body').classList.remove('modal-open')
    this.policyForm.reset();
    this.selectedEmp =[];
    this.selectedDept = [];
  }
  openAddPolicyModal(action:any,policyData:any){
 
    // $('#add-policy').modal('show');
    this.isAddUpdatePolicy = true;
    document.querySelector('body').classList.add('modal-open')
    let deptArr= [];
    policyData.department_value?.split(',').map(dept=>dept.trim()).map(dept=> deptArr.push({
      posting_department: dept
    }))
    this.selectedDept = deptArr
    this.policyForm.patchValue({
      applicableForDept : deptArr,
      // applicableForEmp : policyData.employee_value,
      policiesName : policyData.policies_name,
      policyCreateDt: policyData.policies_create_date?.substring(0,10),
      id : policyData.id,
      presentFlag : policyData.att_present_flag,
      leaveFlag : policyData.leave_flag,
      halfDayFlag : policyData.half_day_flag,
      weeklyOff : policyData.weekly_off_flag,
      wfhFlag : policyData.wfh_flag,
      empTodayAttendanceFlag : policyData.emp_today_attendance_flag,
      checkInCheckOutFlag : policyData.check_in_check_out_flag,
      salaryFlag : policyData.salary_flag,
      leaves :policyData.leaves_flag
    })

    let empCodesArray = policyData.employee_value?.split(',').map(code => code.trim());
        const validEmpData = empCodesArray
        .map(code => {
          const match = this.empDropdownList.find(emp => emp.emp_code === code);
          return match ? { emp_code: match.emp_code, emp_name: match.emp_name } : null;
        })
        .filter(emp => emp !== null); // Filter out invalid code
      if (validEmpData.length > 0)       
        this.selectedEmp = validEmpData;

  }
//2nd popup
openAddPolicyModal1(action:any,policyData:any){
 
  // $('#add-policy').modal('show');
  this.isAddUpdatePolicy1 = true;
  document.querySelector('body').classList.add('modal-open')
  let deptArr= [];
  policyData.department_value?.split(',').map(dept=>dept.trim()).map(dept=> deptArr.push({
    posting_department: dept
  }))
  this.selectedDept = deptArr
  this.policyForm.patchValue({
    applicableForDept : deptArr,
    // applicableForEmp : policyData.employee_value,
    policiesName : policyData.policies_name,
    policyCreateDt: policyData.policies_create_date?.substring(0,10),
    id : policyData.id,
    presentFlag : policyData.att_present_flag,
    leaveFlag : policyData.leave_flag,
    halfDayFlag : policyData.half_day_flag,
    weeklyOff : policyData.weekly_off_flag,
    wfhFlag : policyData.wfh_flag,
    empTodayAttendanceFlag : policyData.emp_today_attendance_flag,
    checkInCheckOutFlag : policyData.check_in_check_out_flag,
    salaryFlag : policyData.salary_flag,
    leaves :policyData.leaves_flag
  })

  let empCodesArray = policyData.employee_value?.split(',').map(code => code.trim());
      const validEmpData = empCodesArray
      .map(code => {
        const match = this.empDropdownList.find(emp => emp.emp_code === code);
        return match ? { emp_code: match.emp_code, emp_name: match.emp_name } : null;
      })
      .filter(emp => emp !== null); // Filter out invalid code
    if (validEmpData.length > 0)       
      this.selectedEmp = validEmpData;

}
//
  openAddPolicy(){
    this.isAddUpdatePolicy = true;
    document.querySelector('body').classList.add('modal-open')
  }
//2nd popup
openAddPolicy1(){
  this.isAddUpdatePolicy1 = true;
  document.querySelector('body').classList.add('modal-open')
}
//
  generatePDF(template:any) {
    const encryptedParams = encodeURIComponent(this._encrypterService.aesEncrypt('policy,'+'' + ',' + template.id));
    const url = `${window.location.origin}/employee-mgmt/preview-pdf/${encryptedParams}`;
    window.open(url, '_blank');
  }

  hideEmpListModal(){
    this.isShowList = false;
    document.querySelector('body').classList.remove('modal-open')
    this.listType ='';
    this.page=1;
    this.listData =[];
  }

  showList(policyData:any,listType:string){
    this.listType=  listType;
    this.isShowList = true;
    document.querySelector('body').classList.add('modal-open');
    if(listType=='user'){
      this.listData = this.empDropdownList.filter(obj => policyData.employee_value.split(',').includes(obj.emp_code))
    }else{
      this.listData = policyData.department_value.split(',');
    }
  }

  blockTyping(event: KeyboardEvent): void {
    event.preventDefault(); // Prevent typing into the date input field
  }
}