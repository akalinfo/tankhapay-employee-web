import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { BusinesSettingsService } from '../business-settings.service';
import { SessionService } from 'src/app/shared/services/session.service';
import jwtDecode from 'jwt-decode';
import { ToastrService } from 'ngx-toastr';
import { FaceCheckinService } from '../../attendance/face-checkin.service';
import { EncrypterService } from 'src/app/shared/services/encrypter.service';
import { ActivatedRoute } from '@angular/router';
import { EmployeeService } from '../../employee/employee.service';
import { lastValueFrom } from 'rxjs';
import { dongleState, grooveState } from 'src/app/app.animation';
import { GlobalConstants } from 'src/app/shared/global-constants';

declare var $:any

@Component({
  selector: 'app-unit-parameter-settings',
  templateUrl: './unit-parameter-settings.component.html',
  styleUrls: ['./unit-parameter-settings.component.css'],
  animations: [grooveState, dongleState]
})
export class UnitParameterSettingsComponent {
  showSidebar: boolean=true;
  companyDetailForm : FormGroup;
  submitted: boolean=false;
  decoded_token: any;
  tp_account_id: any;
  userid: any;
  isOrganizationSaved: boolean=false;
  subUnitForm : FormGroup; 
  organzationUnit: any;
  orgid: any='';
  allState: any=[];
  roleSalaryForm : FormGroup;
  emp_list: any=[];
  selectedEmps: any=[];
  isShowMapEmp: boolean=false;
  currentDesg: any={};
  dropdownSettings={};
  selectedval:any=[];
  empGroup: any;
  minWagesCtg: any=[];
  product_type: any;
  minWageDays: any=[];
  salaryPercent: { basicPercent: any; hraPercent: any; };
  salary_setup_head: any=[];
  salaryCalcType:any='percent';
  esi_details: any='';
  pf_details: any='';
  customSalaryMsg: any='';
  grossSalary: any=[];
  customCalculatedData: any=[];
  isShowSalaryTable: boolean=false;
  isCustomInputTrigger: any=[];
  leaveTemplateData: any='';
  mapEmpAction: string='';
  salaryStructure: any='';
  isShowSalaryStructure: boolean=false;
  currentIdx: number;
  affectedEmp: any=[];
  p: any=1;
  isRoleAdded: boolean=false;
  edli_adminchargesincludeinctc: any='';
  isEmployerPartExcluded: any=[];


  constructor(private _fb : FormBuilder,
    private businessService : BusinesSettingsService,
    private _sessionService : SessionService,
    private toastr: ToastrService,
    private _faceCheckinService : FaceCheckinService,
    private _e : EncrypterService,
    private activeroute : ActivatedRoute,
    private _employeeService : EmployeeService
  ){
    this.activeroute.params.subscribe((params: any) => {
      if(params['orgid'])
      this.orgid = this._e.aesDecrypt(params['orgid']);
      
    });
  }

  ngOnInit(){

    let session_obj = this._sessionService.get_user_session();
    let token = JSON.parse(session_obj).token;
    this.decoded_token = jwtDecode(token);
    this.tp_account_id = this.decoded_token.tp_account_id;
    this.userid = this.decoded_token.userid;
    this.product_type = this.decoded_token.product_type;

    
    this.companyDetailForm = this._fb.group({
      org_unit_name : ['',[Validators.required]],
      address : ['',[Validators.required]],
      state : ['',[Validators.required]],
      pin_code : ['',[Validators.required,Validators.pattern(/^[0-9]{6}$/)]],
      gstno : ['',[Validators.pattern(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/)]],
      ou_epf_registration_number : ['', [ Validators.pattern(/^[A-Z]{2}[\s\/]?[A-Z]{3}[\s\/]?[0-9]{7}[\s\/]?[0-9]{3}$/)]],
      ou_esic_registration_number :['', [Validators.pattern(/^(\d{2})[--\s]?(\d{2})[--\s]?(\d{1,6})[--\s]?(\d{3})[--\s]?(\d{4})$/)]],
      rowid: ['']
    })

    this.subUnitForm = this._fb.group({
      divisions : new FormArray([])
    })

    this.roleSalaryForm = this._fb.group({
      roles : new FormArray([])
    })

    this.dropdownSettings = {
      singleSelection: false,
      idField: 'emp_code',
      textField: 'disp_name',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 3,
      allowSearchFilter: true, 
      allowRemoteDataSearch: true,     
      // searchFilter: (term: string, item: any)=> this.customSearchFilter(term, item)
   };

    if(this.orgid!=''){
      this.getMasterData();
    }
    this.getAllStates();
    this.getMinWageDays();
  }

  ngAfterViewChecked(){
    $('.effectiveDate').datepicker({
      dateFormat: 'dd/mm/yy',
      changeMonth: true,
      changeYear: true,
      maxDate: new Date(),
      beforeShowDay: function(date) {
        // Disable all days except the 1st of the month
        return [date.getDate() === 1, ''];
      }
    })
    $('.deputedDate').datepicker({
      dateFormat: 'dd/mm/yy',
      changeMonth: true,
      changeYear: true,
    })
  }

  toggle() {
    this.showSidebar = !this.showSidebar;
  }

  get cf(){
    return this.companyDetailForm.controls;
  }
  get divisionForm(){
    return this.subUnitForm.get('divisions') as FormArray;
  }

  get rolesFormArray(){
    return this.roleSalaryForm.get('roles') as FormArray;
  }

  saveCompanyDetails():any{
    if(this.cf.org_unit_name.value==''){
      return this.toastr.error('Please Enter Company Name');
    }
    if(this.cf.address.value==''){
      return this.toastr.error('Please Enter Company Address');
    }
    if(this.cf.state.value==''){
      return this.toastr.error('Please Enter Company State');
    }
    if(this.cf.pin_code.value==''){
      return this.toastr.error('Please Enter Company Pincode');
    } 

    if(this.cf.pin_code.errors?.pattern){
      return this.toastr.error("Invalid Pin Code")
    }
    if(this.cf.gstno.errors?.pattern){
      return this.toastr.error("Invalid Gst no")
    }
    this.companyDetailForm.patchValue({
      ou_epf_registration_number : this.cf.ou_epf_registration_number.value ? this.cf.ou_epf_registration_number.value.toUpperCase() :'',
    })
    if(this.cf.ou_epf_registration_number.errors?.pattern){
      return this.toastr.error("Invalid EPF number")
    }
    if(this.cf.ou_esic_registration_number.errors?.pattern){
      return this.toastr.error("Invalid ESI number")
    }
    this.submitted =true;
    
    let action = this.cf.rowid.value!=''?'update_organization_unit':'save_organization_unit';
    let postData ={
      ...this.companyDetailForm.value,
      userby :this.decoded_token.id,
      action:action,
      customeraccountid:this.tp_account_id.toString(),
      orgnization_unit_type : '2',
    };
    this.businessService.saveUpdateUnit(postData).subscribe((resData:any) =>{
      if(resData.statusCode){
        this.isOrganizationSaved= true;
        if(this.cf.rowid.value==''){
          this.divisionForm.push(this._fb.group({
            departmentName : ['',[Validators.required]],
            address : ['',[Validators.required]],
            state :['',[Validators.required]],
            pin_code : ['',[Validators.required,Validators.pattern(/^[0-9]{6}$/)]],
            gstno : ['',[Validators.pattern(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/)]],
            ou_epf_registration_number : ['', [ Validators.pattern(/^[A-Z]{2}[\s\/]?[A-Z]{3}[\s\/]?[0-9]{7}[\s\/]?[0-9]{3}$/)]],
            ou_esic_registration_number :['', [Validators.pattern(/^(\d{2})[--\s]?(\d{2})[--\s]?(\d{1,6})[--\s]?(\d{3})[--\s]?(\d{4})$/)]],
            isAddressSame :[''],
            id:['']
          }))
          this.toastr.success('Organization unit created successfully');
          let id= resData.message.split('#')[1];
          this.orgid=id;
          this.companyDetailForm.patchValue({
            rowid: id
          })
        }else{
          this.toastr.success('Organization unit updated successfully');
        }
      }else{
        this.toastr.error(resData.message);
      }
    })
  }

  addDiv():any{
    // return console.log(this.divisionForm.controls[this.divisionForm.controls.length-1])
    if(this.divisionForm.controls.length!=0 && this.divisionForm.controls[this.divisionForm.controls.length-1].invalid){
      return this.toastr.error("Please fill the previous division first");
    }
    this.divisionForm.push(this._fb.group({
      departmentName : ['',[Validators.required]],
      address : ['',[Validators.required]],
      state :['',[Validators.required]],
      pin_code : ['',[Validators.required,Validators.pattern(/^[0-9]{6}$/)]],
      gstno : ['',[Validators.pattern(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/)]],
      ou_epf_registration_number : ['', [ Validators.pattern(/^[A-Z]{2}[\s\/]?[A-Z]{3}[\s\/]?[0-9]{7}[\s\/]?[0-9]{3}$/)]],
      ou_esic_registration_number :['', [Validators.pattern(/^(\d{2})[--\s]?(\d{2})[--\s]?(\d{1,6})[--\s]?(\d{3})[--\s]?(\d{4})$/)]],
      isAddressSame :[''],
      id:['']
    }))
  }

  addRoleForm():any{

    if(this.rolesFormArray.controls.length!=0  && this.rolesFormArray.controls[this.rolesFormArray.controls.length-1].invalid){
      return this.toastr.error("Please fill the previous form first");
    }

    this.rolesFormArray.push(this._fb.group({
      mop:['',[Validators.required]],
      roleName : ['',[Validators.required]],
      employee : [''],
      dept : ['',[Validators.required]],
      effectiveDate : [''],
      deputedDate : [''],
      id :[''],
      salarystructure :  this._fb.array([]),
      pfOpted : ['N',[Validators.required]],
      esiOpted : ['N',[Validators.required]],
      pfCapApplied : ['N',[Validators.required]],
      lwfOpted : ['N',[Validators.required]],
      ptApplied : ['N',[Validators.required]],
      minWageState: [''],
      minWagesCtg: [''],
      salaryDays: [''],
      salaryDaysOpted : [''],
      employerGratuity: ['N',[Validators.required]],
      gratuityopted: ['N',[Validators.required]],
      gratuityInHand:['N',[Validators.required]],
      salarySetupid : ['']
    }))

    for(let i=0;i< this.rolesFormArray.length;i++){
      const roleGroup = this.rolesFormArray.at(i) as FormGroup;
      const salaryStructureArray = roleGroup.get('salarystructure') as FormArray;
      for(let idx=0;idx<this.salary_setup_head.length;idx++){
        let monthlyAmt=0;
        if(this.salary_setup_head[idx].calculationtype=='Flat'){
          monthlyAmt=Number(this.salary_setup_head[idx].calculationpercent); 
        }

        if(this.salary_setup_head[idx].isactive=='Y'){
          salaryStructureArray.push(this._fb.group({
            'salary_component_name': new FormControl(this.salary_setup_head[idx].componentname),
            'percentage_fixed': new FormControl(this.salary_setup_head[idx].calculationtype),
            'percentage_ctc': new FormControl(this.salary_setup_head[idx].calculationpercent),
            'is_taxable': new FormControl(this.salary_setup_head[idx].esiapplicable),
            'salary_component_id': new FormControl(this.salary_setup_head[idx].id),
            'salary_component_amount': new FormControl(monthlyAmt.toFixed(2)),
            'ispfapplicable': new FormControl(this.salary_setup_head[idx].epfapplicable),
            'earningType' : new FormControl(this.salary_setup_head[idx].earningtype)
          }));
        }
      }  
    }
    //console.log(this.organzationUnit.role.length+1);
    
    if(this.organzationUnit.role.length+1 == this.rolesFormArray.controls.length){
      this.isRoleAdded = true;
    }
  }


  getMasterData(){
    this._faceCheckinService.getemployeeList({ "action": "unit_list",
      "customeraccountid": this.tp_account_id,
      "organization_unitid": this.orgid,
      "emp_code": "",
      "keyword": "",
      "fromdate": "",
      "todate": ""
    }).subscribe((resData:any)=>{
      if(resData.statusCode){
        this.organzationUnit = JSON.parse(this._e.aesDecrypt(resData.commonData))[0];
       this.companyDetailForm.patchValue({
        org_unit_name : this.organzationUnit.org_unit_name,
        address : this.organzationUnit.org_unit_address,
        state : this.organzationUnit.org_unit_state.toUpperCase(),
        pin_code : this.organzationUnit.org_unit_pin,
        gstno : this.organzationUnit.gstin,
        rowid: this.organzationUnit.id.toString(),
        ou_epf_registration_number : this.organzationUnit.ou_epf_registration_number,
        ou_esic_registration_number : this.organzationUnit.ou_esic_registration_number
       })
       let department = this.organzationUnit.department ? JSON.parse(this.organzationUnit.department):[];
       
       this.organzationUnit.department = department;
       for(let i=0;i<department.length;i++){
        
        this.divisionForm.push(this._fb.group({
          departmentName : department[i].departmentname,
          address : department[i].address,
          state : department[i].state,
          pin_code : [department[i].pin_code,[Validators.required,Validators.pattern(/^[0-9]{6}$/)]],
          gstno : [department[i].gstin,[Validators.pattern(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/)]],
          isAddressSame :[''],
          ou_epf_registration_number : department[i].ou_epf_registration_number,
          ou_esic_registration_number : department[i].ou_esic_registration_number,
          id: department[i].id.toString()
        }))
       }
       if(department.length==0){
        this.divisionForm.push(this._fb.group({
          departmentName : ['',[Validators.required]],
          address : ['',[Validators.required]],
          state : ['',[Validators.required]],
          pin_code : ['',[Validators.required,Validators.pattern(/^[0-9]{6}$/)]],
          gstno : ['',[Validators.pattern(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/)]],
          ou_epf_registration_number : ['', [ Validators.pattern(/^[A-Z]{2}[\s\/]?[A-Z]{3}[\s\/]?[0-9]{7}[\s\/]?[0-9]{3}$/)]],
          ou_esic_registration_number :['', [Validators.pattern(/^(\d{2})[--\s]?(\d{2})[--\s]?(\d{1,6})[--\s]?(\d{3})[--\s]?(\d{4})$/)]],
          isAddressSame :[''],
          id: ['']
        }))
       }

       let role = this.organzationUnit.role ? JSON.parse(this.organzationUnit.role):[];
       this.isRoleAdded=false;
       this.organzationUnit.role = role;
       let empList = this.organzationUnit.emp_list ? JSON.parse(this.organzationUnit.emp_list):[];
       if(this.divisionForm.controls.length!=0 && this.divisionForm.controls[0].value.id!='' && role.length==0){
        this.getEmployeeList('');
        this.rolesFormArray.push(this._fb.group({
          mop:['',[Validators.required]],
          roleName : ['',[Validators.required]],
          employee : [''],
          dept : ['',[Validators.required]],
          effectiveDate : [''],
          deputedDate : [''],
          id :[''],
          salarystructure :  this._fb.array([]),
          pfOpted : ['N',[Validators.required]],
          esiOpted : ['N',[Validators.required]],
          pfCapApplied : ['N',[Validators.required]],
          lwfOpted : ['N',[Validators.required]],
          ptApplied : ['N',[Validators.required]],
          minWageState: [''],
          minWagesCtg: [''],
          salaryDays: [''],
          salaryDaysOpted : [''],
          employerGratuity: ['N',[Validators.required]],
          gratuityopted: ['N',[Validators.required]],
          gratuityInHand:['N',[Validators.required]],
          salarySetupid : [''],
          salaryid : ['']
        }))
       }else if(role.length>0){
        this.getEmployeeList('');
        let employee = new Map();
        if(empList.length>0){
          for(let i=0;i<empList.length;i++){
            let employeeData=[];
            if(!employee.has(empList[i].designationid)){
              
              employeeData.push({'name':empList[i].emp_name + " " + (empList[i].orgempcode!=''?empList[i].orgempcode : empList[i].cjcode),
              deputedDate : empList[i].deputeddate,emp_code: empList[i].emp_code,
              relievedDate : empList[i].relieveddate});
              
              employee.set(empList[i].designationid,{employees : employeeData});
            }else{
              let employeeName =[...(employee.get(empList[i].designationid)).employees,{'name':(empList[i].emp_name + " " + (empList[i].orgempcode!=''?empList[i].orgempcode : empList[i].cjcode)),
                deputedDate: empList[i].deputeddate,emp_code: empList[i].emp_code,relievedDate : empList[i].relieveddate}];
                employee.set(empList[i].designationid,{employees : employeeName});
            }
          }
         
        }
        for(let i=0;i<role.length;i++){
          if(employee.has(role[i].dsignationid)){
            this.rolesFormArray.push(this._fb.group({
              mop:[role[i].target_offered_salary,[Validators.required]],
              roleName : [role[i].designationname,[Validators.required]],
              employee : [employee.get(role[i].dsignationid).employees],
              dept : [role[i].organization_sub_unit_id.toString(),[Validators.required],,[Validators.required]],
              effectiveDate : [role[i].effective_date.split('-').reverse().join('-'),[Validators.required]],
              deputedDate : [employee.get(role[i].dsignationid).deputedDate],
              id : [role[i].dsignationid.toString()],
              salarystructure :  this._fb.array([]),
              pfOpted : ['N',[Validators.required]],
              esiOpted : ['N',[Validators.required]],
              pfCapApplied : ['N',[Validators.required]],
              lwfOpted : ['N',[Validators.required]],
              ptApplied : ['N',[Validators.required]],
              minWageState: [''],
              minWagesCtg: [''],
              salaryDays: [''],
              salaryDaysOpted : [''],
              employerGratuity: ['N',[Validators.required]],
              gratuityopted: ['N',[Validators.required]],
              gratuityInHand:['N',[Validators.required]],
              salarySetupid : [role[i].salary_setup_id],
              salaryid : [role[i].salary_id]
            }))
          }else{
            this.rolesFormArray.push(this._fb.group({
              mop:[role[i].target_offered_salary,[Validators.required]],
              roleName : [role[i].designationname],
              employee : [''],
              dept : [role[i].organization_sub_unit_id.toString(),[Validators.required]],
              effectiveDate : [role[i].effective_date.split('-').reverse().join('-'),[Validators.required]],
              deputedDate : [''],
              id : role[i].dsignationid.toString(),
              salarystructure : this._fb.array([]),
              pfOpted : ['N',[Validators.required]],
              esiOpted : ['N',[Validators.required]],
              pfCapApplied : ['N',[Validators.required]],
              lwfOpted : ['N',[Validators.required]],
              ptApplied : ['N',[Validators.required]],
              minWageState: [''],
              minWagesCtg: [''],
              salaryDays: [''],
              salaryDaysOpted : [''],
              employerGratuity: ['N',[Validators.required]],
              gratuityopted: ['N',[Validators.required]],
              gratuityInHand:['N',[Validators.required]],
              salarySetupid : [role[i].salary_setup_id],
              salaryid : [role[i].salary_id]
            }))
            
          }
          
          this.getStatutoryVariable(i);
        }
        for(let i=0;i<this.rolesFormArray.length;i++){

          setTimeout(()=>{
          document.getElementById('salary-toggle'+i).addEventListener('change', function() {
          const salaryToggle = this as HTMLInputElement;
          const salaryDetailsBoxUp:HTMLElement = document.getElementById('Salary-Details-inn-box-upper'+i);
          const salaryDetailsBox:HTMLElement = document.getElementById('Salary-Details-inn-box'+i);
          
          if (salaryToggle.checked) {
            salaryDetailsBox.style.display = 'block';
            salaryDetailsBoxUp.style.display = 'block';
          } else {
            salaryDetailsBox.style.display = 'none';
            salaryDetailsBoxUp.style.display = 'none';
          }
        })
      },0);
    }
        
      }
      this.getEmployerSocialSecurityDetails('ESI');
      this.getEmployerSocialSecurityDetails('EPF');

       if(this.rolesFormArray.controls.length>0){
        this.getMasterSalaryStructure();
       }
      }else{
        this.toastr.error(resData.message);
        this.organzationUnit = {};
      }
    })
  }
  

  getAllStates(){
    this._employeeService.getAll_state({}).subscribe((resData:any)=>{
      if(resData.statusCode){
        if(resData.statusCode){
          this.allState = resData.commonData;
        }
      }
    })
  }

  setAddress(isChecked:boolean,idx:number){
    if(isChecked){
      this.divisionForm.controls[idx].patchValue({
        address : this.cf.address.value,
        state : this.cf.state.value,
        pin_code : this.cf.pin_code.value,
        gstno : this.cf.gstno.value,
        ou_epf_registration_number : this.cf.ou_epf_registration_number.value,
        ou_esic_registration_number : this.cf.ou_esic_registration_number.value
      })
    }
  }

  async saveDepartmentUnits():Promise<any>{

    const savePromises = [];
    for(let i=0;i<this.divisionForm.controls.length;i++){
      if(this.divisionForm.controls[i].value.id==''){

        if(this.divisionForm.controls[i].value.departmentName==''){
          return this.toastr.error(`Please fill the department name in Division ${i+1}`);
        }
        if(this.divisionForm.controls[i].value.address==''){
          return this.toastr.error(`Please fill the address in Division ${i+1}`);
        }
        if(this.divisionForm.controls[i].value.state==''){
          return this.toastr.error(`Please fill the state in Division ${i+1}`);
        }
        if(this.divisionForm.controls[i].value.pin_code==''){
          return this.toastr.error(`Please fill the Pincode in Division ${i+1}`);
        }
       
        if(this.divisionForm.controls[i].get('pin_code').errors?.pattern){
          return this.toastr.error(`Invalid Pincode in Division ${i+1}`);
        }

        if(this.divisionForm.controls[i].get('gstno').errors?.pattern){
          return this.toastr.error(`Invalid GST number in Division ${i+1}`);
        }
      }
    }
    for (let i = 0; i < this.divisionForm.controls.length; i++) {
      if(this.divisionForm.controls[i].value.id==''){
        let postData = {
            ...this.divisionForm.controls[i].value, // Ensure each control's value is accessed correctly
            action: 'save_department_unit',
            customeraccountid: this.tp_account_id.toString(),
            userby: this.decoded_token.id,
            orgid: this.cf.rowid.value
        };


        const savePromise = lastValueFrom(this.businessService.saveDepartmentUnit(postData));
        savePromises.push(savePromise);
      }
  }

  try {
    const results:any = await Promise.allSettled(savePromises);
   
    const successResults = results.filter(result => result.value.statusCode === true);
    const errorResults = results.filter(result => result.value.statusCode === false);
    
    if (errorResults.length === 0) {
      while(this.divisionForm.length!=0){
        this.divisionForm.removeAt(0);
      }
      while(this.rolesFormArray.length!=0){
        this.rolesFormArray.removeAt(0);
      }
        this.toastr.success('All departments saved successfully');
        this.getMasterData();
    } else {
        this.toastr.error(results[0].value.message);
        // console.error('Error saving departments', errorResults);
    }
  } catch (error) {
      this.toastr.error('Error saving departments', error);
  }
  }

  updateDepartment(i:number):any{
    if(this.divisionForm.controls[i].value.departmentName==''){
      return this.toastr.error(`Please fill the department name in Division ${i+1}`);
    }
    if(this.divisionForm.controls[i].value.address==''){
      return this.toastr.error(`Please fill the address in Division ${i+1}`);
    }
    if(this.divisionForm.controls[i].value.state==''){
      return this.toastr.error(`Please fill the state in Division ${i+1}`);
    }
    if(this.divisionForm.controls[i].value.pin_code==''){
      return this.toastr.error(`Please fill the Pincode in Division ${i+1}`);
    }
    
    if(this.divisionForm.controls[i].get('pin_code').errors?.pattern){
      return this.toastr.error(`Invalid Pincode in Division ${i+1}`);
    }
    if(this.divisionForm.controls[i].get('gstno').errors?.pattern){
      return this.toastr.error(`Invalid GST number in Division ${i+1}`);
    }
    let postData = {
      ...this.divisionForm.controls[i].value, // Ensure each control's value is accessed correctly
      action: 'update_department_unit',
      customeraccountid: this.tp_account_id.toString(),
      userby: this.decoded_token.id,
      orgid: this.cf.rowid.value
  };
  this.businessService.saveDepartmentUnit(postData).subscribe((resData:any)=>{
    if(resData.statusCode){
      this.toastr.success('Department updated successfully');
    }else{
      this.toastr.error(resData.message);
    }
  })

  }

  updateDesignation(idx:number):any{
    if(this.rolesFormArray.controls[idx].value.roleName==''){
      return this.toastr.error(`Please fill the role name in Role ${idx+1}`);
    }

    if(this.rolesFormArray.controls[idx].value.mop==''){
      return this.toastr.error(`Please select the MOP in Role ${idx+1}`);
    }


    if(this.rolesFormArray.controls[idx].value.dept==''){
      return this.toastr.error(`Please select the Department in Role ${idx+1}`);
    }

    this.rolesFormArray.controls[idx].patchValue({
      effectiveDate: $('#customEffectiveDate'+idx).val(),
    })

    if(this.rolesFormArray.controls[idx].value.effectiveDate==''){
      return this.toastr.error(`Please select the Effective Date in Role ${idx+1}`);
    }

    let postData = {
      ...this.rolesFormArray.controls[idx].value, // Ensure each control's value is accessed correctly
      action: 'update_designation_unit',
      customeraccountid: this.tp_account_id.toString(),
      userby: this.decoded_token.id,
      orgid: this.cf.rowid.value,
  };

  this.businessService.saveDesignationUnit(postData).subscribe((resData:any)=>{
    if(resData.statusCode){
      // this.saveCustomSal(idx);
      let checkbox :any= document.getElementById('salary-toggle'+idx);
      if(checkbox.checked && this.customCalculatedData[idx])
        this.showMapEmployee(idx,'affectedEmp');
      this.toastr.success('Designation updated successfully');
    }else{
      this.toastr.error(resData.message);
    }
  });

  }

  getEmployeeList(key:string){

    let postdata ={
      action:'emp_ou_list',
      customeraccountid : this.tp_account_id.toString(),
      organization_unitid :'',
      emp_code:'',
      keyword:key,
      fromdate:'',
      todate:''
    }
    this._faceCheckinService.getemployeeList(postdata).subscribe((resData:any)=>{
      if(resData.statusCode){
        this.emp_list= JSON.parse(this._e.aesDecrypt(resData.commonData));
        this.emp_list.map(obj=> obj.disp_name= obj.emp_name + " " + (obj.orgempcode!=''? obj.orgempcode : obj.cjcode))
      }else{
        this.emp_list=[];
      }
    })
  }

  closeSalaryStructure(){
    this.isShowSalaryStructure=false;
    this.salaryStructure='';
    let body:HTMLElement = document.querySelector('body');
    if(body){
      body.style.overflow='auto';
    }
   }

   getStatutoryVariable(idx:any){
    let postData ={
      action : 'GetUnitVariables',
      "customeraccountid":this.tp_account_id.toString(),
      "organization_unitid": this.cf.rowid.value,
      "departmentid":this.rolesFormArray.controls[idx].value.dept,
      "designationid":this.rolesFormArray.controls[idx].value.id,
      "appointment_id":"-9999"
    }

    this._employeeService.get_unitSalaryStructure_data(postData).subscribe((resData:any)=>{})
   }
  getSalaryStructure(idx:number){
    this.isShowSalaryStructure=true;
    let body:HTMLElement = document.querySelector('body');
    let modal :HTMLElement =document.querySelector('.modal');
    if(modal){
      modal.classList.add('modal-open');
      modal.style.overflowX='hidden';
      modal.style.overflowY='auto';
    }
    if(body){
      body.style.overflow='hidden';
    }
    let postData ={
      action : 'GetUnitSalaryStructure',
      "customeraccountid":this.tp_account_id.toString(),
      "organization_unitid": this.cf.rowid.value,
      "departmentid":this.rolesFormArray.controls[idx].value.dept,
      "designationid":this.rolesFormArray.controls[idx].value.id,
      "appointment_id":"-9999"
    }
    this._employeeService.get_unitSalaryStructure_data(postData).subscribe((resData:any)=>{
      if(resData.statusCode){
        this.salaryStructure = JSON.parse(this._e.aesDecrypt(resData.commonData))[0];

        this.salaryStructure['ctcAnnual'] = Math.round(this.salaryStructure['ctc']*12);
        this.salaryStructure['inHandAnnual'] = Math.round(this.salaryStructure['salaryinhand']*12);
        this.salaryStructure['grossAnnual'] = Math.round(this.salaryStructure['gross']*12);
        this.salaryStructure['total'] = (parseFloat(this.salaryStructure.gross) + parseFloat(this.salaryStructure.bonus || '0') + parseFloat(this.salaryStructure.employerepfrate ||'0' ) + parseFloat(this.salaryStructure.employeresirate||'0') + parseFloat(this.salaryStructure.employerlwf||'0') + parseFloat(this.salaryStructure.employergratuity ||'0'));
        
        this.salaryStructure['totalAnnual'] = Math.round(this.salaryStructure['total']*12)
        this.salaryStructure['total'] = Math.round(this.salaryStructure['total'])

        if (this.salaryStructure && typeof this.salaryStructure === 'object') {
          for (const key in this.salaryStructure) {
            if (typeof Math.round(this.salaryStructure[key]) === 'number' && !Number.isNaN(Math.round(this.salaryStructure[key]))) {
              
              this.salaryStructure[key] = Math.round(this.salaryStructure[key]);
            } 
          }
        }

        this.salaryStructure['OtherDeductions'] = [
          {
            'deduction_name' : 'Salary Bonus',
            'deduction_amount' : this.salaryStructure.salarybonus
          },
          {
            'deduction_name' : 'Commission',
            'deduction_amount' : this.salaryStructure.commission
          },
          {
            'deduction_name' : 'Transport Allowance',
            'deduction_amount' : this.salaryStructure.transport_allowance
          },
          {
            'deduction_name' : 'Travelling Allowance',
            'deduction_amount' : this.salaryStructure.travelling_allowance
          },
          {
            'deduction_name' : 'Leave Encashment',
            'deduction_amount' : this.salaryStructure.leave_encashment
          },
          {
            'deduction_name' : 'Gratuity In Hand',
            'deduction_amount' : this.salaryStructure.gratuityinhand
          },
          {
            'deduction_name' : 'Overtime Allowance',
            'deduction_amount' : this.salaryStructure.overtime_allowance
          },
          {
            'deduction_name' : 'Notice Pay',
            'deduction_amount' : this.salaryStructure.notice_pay
          },
          {
            'deduction_name' : 'Hold Salary (Non Taxable)',
            'deduction_amount' : this.salaryStructure.hold_salary_non_taxable
          },
          {
            'deduction_name' : 'Children Education Allowance',
            'deduction_amount' : this.salaryStructure.children_education_allowance
          },
        ]
      }else{
        this.salaryStructure='';
      }
    })
  }

  async saveRole():Promise<any>{
    const savePromises = [];
    for(let i=0;i<this.rolesFormArray.controls.length;i++){
      // return;
      if(this.rolesFormArray.controls[i].value.id==''){
        //console.log(this.rolesFormArray.controls[i].value);
        // continue;
        if(this.rolesFormArray.controls[i].value.roleName==''){
          return this.toastr.error(`Please fill the role name in Role ${i+1}`);
        }

        if(this.rolesFormArray.controls[i].value.mop==''){
          return this.toastr.error(`Please enter AOP in Role ${i+1}`);
        }

        if(this.rolesFormArray.controls[i].value.dept==''){
          return this.toastr.error(`Please select the Department in Role ${i+1}`);
        }

        this.rolesFormArray.controls[i].patchValue({
          effectiveDate: $('#customEffectiveDate'+i).val()
        })

        if(this.rolesFormArray.controls[i].value.effectiveDate==''){
          return this.toastr.error(`Please select the Effective Date in Role ${i+1}`);
        }
  
        let postData = {
          ...this.rolesFormArray.controls[i].value, // Ensure each control's value is accessed correctly
          action: 'save_designation_unit',
          customeraccountid: this.tp_account_id.toString(),
          userby: this.decoded_token.id,
          orgid: this.cf.rowid.value,
          
        };

        const savePromise = lastValueFrom(this.businessService.saveDesignationUnit(postData));
        
        savePromises.push(savePromise);
    
        try {
          const results:any = await Promise.allSettled(savePromises);
          //console.log(savePromises,results);
          
          const successResults = results.filter(result => result.value.statusCode === true);
          const errorResults = results.filter(result => result.value.statusCode === false);
          
          if (errorResults.length === 0) {
            
            this.toastr.success('All Designations saved successfully');
            while(this.divisionForm.length!=0){
              this.divisionForm.removeAt(0);
            }
            while(this.rolesFormArray.length!=0){
              this.rolesFormArray.removeAt(0);
            }
            
            this.getMasterData();
          } else {
              this.toastr.warning(results[0].value.message);
              // console.error('Error saving departments', errorResults);
          }
        } catch (error) {
        
            this.toastr.error('Error saving Designation', error);
        }
      }
    }
  }

  // async clearFormsAndSaveSalary(indices: number[],result:any) {
  //   for (const index of indices) {
  //     let desgid = result[index].value.message.split('#')[1];
      
  //     this.rolesFormArray.controls[index].patchValue({
  //       id: desgid
  //     })
     
  //     // await this.saveCustomSal(index);
  //   }
  // }

  addEmployee(variable: any) {
    variable= JSON.parse(variable)
    let employee={'name':`${variable.emp_name} ${variable.orgempcode!=''? variable.orgempcode:variable.cjcode}`,
    'emp_code':variable.emp_code};
    for(let i=0;i<this.selectedEmps.length;i++){
      if(this.selectedEmps[i].name==employee.name){
        return
      }
    }
    
    this.selectedEmps.push(employee);
  }

  showMapEmployee(idx:number,action:string):any{
    this.currentDesg  = this.rolesFormArray.controls[idx].value;
    console.log(this.currentDesg);
    if(this.currentDesg.id =='' && action=='map'){
      return this.toastr.error("Please save the Role first.");
    }
    if(action=='affectedEmp'){
      this._faceCheckinService.getemployeeList({'action':'emp_unitsalary_list',
      "customeraccountid": this.tp_account_id,
      "organization_unitid": this.orgid,
      "emp_code": this.rolesFormArray.controls[idx].value.id,
      "keyword": "",
      "fromdate": "",
      "todate": ""
      }).subscribe((resData:any)=>{
        if(resData.statusCode){
          this.affectedEmp = JSON.parse(this._e.aesDecrypt(resData.commonData));
        }
      })
    }
    this.currentIdx = idx;
    this.mapEmpAction = action;
    this.isShowMapEmp = true;
  }

  hideMapModal(){
    this.isShowMapEmp=false;
    this.empGroup=[];
    this.p=1;
  }

  onFilterChange(key:any){
    this.getEmployeeList(key);
  }

  saveMapEmployee(){
    
    let empGroup = this.selectedval.map(emp=> emp.emp_code);
    let departmentName =''
    for(let i=0;i<this.divisionForm.controls.length;i++){
      if(this.divisionForm.controls[i].value.id==this.currentDesg.dept){
        departmentName = this.divisionForm.controls[i].value.departmentName
      } 
    }
  
    let postData = {
      action : 'emp_mapping',
      customeraccountid : this.tp_account_id.toString(),
      designationName : this.currentDesg.roleName,
      organization_unitid : this.currentDesg.employee,
      employee : empGroup.toString(),
      roleid : this.currentDesg.roleid,
      orgid : this.cf.rowid.value,
      departmentName :departmentName,
      dept : this.currentDesg.dept,
      id : this.currentDesg.id,
      effectiveDate : this.currentDesg.effectiveDate,
      deputedDate : $('#customDeputedDate').val(),
      mop: this.currentDesg.mop,
      userby: this.tp_account_id.toString()
    }
    this.businessService.mapEmployee(postData).subscribe((resData:any)=>{
      if(resData.statusCode){
        this.toastr.success('Map employee successfully');
        this.hideMapModal();
        this.getMasterData();
      }else{
        this.toastr.error(resData.message);
      }
    })
  }

  removeRole(i){
    if(i==0){
      if(!confirm("Are You sure you want to delete this role?")){
        return
      }
    }
    this.rolesFormArray.removeAt(i);
  }
  removeDivision(i){
    if(i==0){
      if(!confirm("Are You sure you want to delete this department?")){
        return
      }
    }
    this.divisionForm.removeAt(i);
  }
  
  getMinWagesState(state: any) {
   
    // this.salaryDetails='';
    this._employeeService.GetMinWageCategoryByState({ 'minWagesStateName': state.value, 'productTypeId': this.product_type,'customerAccountId':this.tp_account_id.toString() }).subscribe((resData: any) => {
      if (resData.statusCode) {
        this.minWagesCtg = JSON.parse(this._e.aesDecrypt(resData.commonData));
      } else {
        this.toastr.error(resData.message)
        this.minWagesCtg = [];
      }
    
    })
  }

  getMinWageDays(){
    this._employeeService.getMinWageDays({}).subscribe((resData:any)=>{
      if(resData.statusCode){
        this.minWageDays = JSON.parse(this._e.aesDecrypt(resData.commonData));
      }else{
        this.toastr.error(resData.message);
      }
    })
  }

  getMasterSalaryStructure():any{
    this._employeeService.getMasterSalaryStructure({
      'customerAccountId': this.tp_account_id.toString(),
    }).subscribe((resData:any)=>{
      if(resData.statusCode){
        this.salary_setup_head=  JSON.parse(this._e.aesDecrypt(resData.commonData));
        this.salaryPercent = {
          'basicPercent': this.salary_setup_head[0].calculationpercent,
          'hraPercent' :this.salary_setup_head[1].calculationpercent
        }
        for(let i=0;i< this.rolesFormArray.length;i++){
          const roleGroup = this.rolesFormArray.at(i) as FormGroup;
          const salaryStructureArray = roleGroup.get('salarystructure') as FormArray;
          for(let idx=0;idx<this.salary_setup_head.length;idx++){
            let monthlyAmt=0;
            if(this.salary_setup_head[idx].calculationtype=='Flat'){
              monthlyAmt=Number(this.salary_setup_head[idx].calculationpercent); 
            }

            if(this.salary_setup_head[idx].isactive=='Y'){
              salaryStructureArray.push(this._fb.group({
                'salary_component_name': new FormControl(this.salary_setup_head[idx].componentname),
                'percentage_fixed': new FormControl(this.salary_setup_head[idx].calculationtype),
                'percentage_ctc': new FormControl(this.salary_setup_head[idx].calculationpercent),
                'is_taxable': new FormControl(this.salary_setup_head[idx].esiapplicable),
                'salary_component_id': new FormControl(this.salary_setup_head[idx].id),
                'salary_component_amount': new FormControl(monthlyAmt.toFixed(2)),
                'ispfapplicable': new FormControl(this.salary_setup_head[idx].epfapplicable),
                'earningType' : new FormControl(this.salary_setup_head[idx].earningtype)
              }));
            }
          } 
       
          if(roleGroup.controls.salaryid.value){
            this.calculateSal(i);
          } 
        }  
       
      }else{
        this.toastr.error(resData.message);
      }
    })
  }

  getSalaryControls(roleIndex: number): FormArray {
    
    return (this.rolesFormArray.controls[roleIndex].get('salarystructure') as FormArray);
  }

  salaryInDays(isSal: any,idx:number) {
    
    if (isSal == 'Y') {
      this.rolesFormArray.controls[idx].patchValue({
        salaryDaysOpted: 'Y',
        salaryDays: ''
      })

    } else {
      this.rolesFormArray.controls[idx].patchValue({
        salaryDaysOpted: isSal,
        salaryDays: '30'
      })
    }
  }

  getIsEmployerPart(isChecked:boolean,idx:number){
    this.isEmployerPartExcluded[idx] = isChecked ? 'Y' : 'N';
    this.customCalculatedData[idx]='';
  }

  setSalDaysReq(salDayopted: any,idx:number) {
    
    if (salDayopted.value == '30') {
      this.rolesFormArray.controls[idx].patchValue({
        salaryDaysOpted: 'N'
      })
    } else {
      this.rolesFormArray.controls[idx].patchValue({
        salaryDaysOpted: 'Y'
      })
    }

    this.getuspccalcgrossfromctc_withoutconveyance(idx);
  }

  getEpfVal(isChecked:any,i:number){
    if(isChecked){
      this.rolesFormArray.controls[i].patchValue({
        pfOpted : 'Y'
      })
    }else{
      this.rolesFormArray.controls[i].patchValue({
        pfOpted : 'N'
      })
    }
    this.customCalculatedData[i] ='';
    this.getuspccalcgrossfromctc_withoutconveyance(i);
  }
  getEsiVal(isChecked:any,i:number){
    if(isChecked){
      this.rolesFormArray.controls[i].patchValue({
        esiOpted : 'Y'
      })
    }else{
      this.rolesFormArray.controls[i].patchValue({
        esiOpted : 'N'
      })
    }
    this.customCalculatedData[i] ='';
    this.getuspccalcgrossfromctc_withoutconveyance(i);
  }

  getLwfOnchange(isChecked:boolean,i:number){
    console.log(isChecked);
    
    if(isChecked){
      this.rolesFormArray.controls[i].patchValue({
        lwfOpted : 'Y'
      })
    }else{
      this.rolesFormArray.controls[i].patchValue({
        lwfOpted : 'N'
      })
    }
    this.customCalculatedData[i] ='';
    this.getuspccalcgrossfromctc_withoutconveyance(i);
  }

  getPtOnChange(isChecked:boolean,i:number){
    if(isChecked){
      this.rolesFormArray.controls[i].patchValue({
        ptApplied:'Y'
      })
    }else{
      this.rolesFormArray.controls[i].patchValue({
        ptApplied:'N'
      })
    }
    this.customCalculatedData[i] ='';
    this.getuspccalcgrossfromctc_withoutconveyance(i);
  }

  getPfCapOnChange(isChecked:boolean,i:number){
   
    if(isChecked){
      this.rolesFormArray.controls[i].patchValue({
        pfCapApplied:'Y'
      })
    }else{
      this.rolesFormArray.controls[i].patchValue({
        pfCapApplied:'N'
      })
    }
    this.customCalculatedData[i] ='';
    this.getuspccalcgrossfromctc_withoutconveyance(i);
  }

  getGratuity(isChecked:boolean,i){
    if(isChecked){
      this.rolesFormArray.controls[i].patchValue({
        gratuityopted:'Y'
      })
    }else{
      this.rolesFormArray.controls[i].patchValue({
        gratuityopted:'N'
      })
    }
    this.customCalculatedData[i] ='';
    this.getuspccalcgrossfromctc_withoutconveyance(i);
  }
  getEmployerGratuity(isChecked:boolean,i){
    if(isChecked){
      this.rolesFormArray.controls[i].patchValue({
        employerGratuity:'Y'
      })
    }else{
      this.rolesFormArray.controls[i].patchValue({
        employerGratuity:'N'
      })
    }
    this.customCalculatedData[i] ='';
    this.getuspccalcgrossfromctc_withoutconveyance(i);
  }

  getIsGratuityInHand(isChecked : boolean,idx:number){
    const roleGroup = this.rolesFormArray.at(idx) as FormGroup;
   
    roleGroup.patchValue({
      gratuityInHand:isChecked? 'Y':'N'
    })
    
    // this.gratuityInHand =isChecked;
    this.customCalculatedData[idx] ='';
    this.calculateSal(idx);
  }

  getEmployerSocialSecurityDetails(action:String){
    this.businessService.GetEmployerSocialSecurityDetails({
      'customerAccountId': this.tp_account_id.toString(),
      'socialSecurityType':action
    }).subscribe((resData:any)=>{
      if(resData.statusCode){
        if(action=='ESI'){
          this.esi_details = resData.commonData;
          for(let i=0;i<this.rolesFormArray.controls.length;i++){
            this.rolesFormArray.controls[i].patchValue({
              esiOpted : 'Y'
            })
          }
        }else{
          this.pf_details =resData.commonData;
          for(let i=0;i<this.rolesFormArray.controls.length;i++){
            this.rolesFormArray.controls[i].patchValue({
              pfOpted : 'Y'
            })
          }
        }
      }
    })
  }

  calculateSal(index:number):any{
  
    if(this.rolesFormArray.controls[index].value.mop==''){
      return this.toastr.error("Please enter Annual Salary");
    }

    const roleGroup = this.rolesFormArray.at(index) as FormGroup;
    const salaryStructureArray = roleGroup.get('salarystructure') as FormArray;

    if((salaryStructureArray.controls[0].value.percentage_ctc=='' || (parseFloat(salaryStructureArray.controls[0].value.percentage_ctc)<parseFloat(this.salaryPercent.basicPercent) || parseFloat(salaryStructureArray.controls[0].value.percentage_ctc)>100)) && this.salaryCalcType=='percent'){
      return this.toastr.error(`Basic salary percent must be between ${this.salaryPercent.basicPercent}-100 percent`);
    }
    if((salaryStructureArray.controls[1].value.percentage_ctc=='' || (parseFloat(salaryStructureArray.controls[1].value.percentage_ctc)<parseFloat(this.salaryPercent.hraPercent) || parseFloat(salaryStructureArray.controls[1].value.percentage_ctc)>100)) && this.salaryCalcType=='percent'){
      return this.toastr.error(`HRA percent must be between ${this.salaryPercent.hraPercent}-100 percent`);
    }
    let salary_setup_head =salaryStructureArray.controls;

    this.customCalculatedData[index]='';
    
    let decimalDiff = 0,allowanceIdx=0;
    for(let idx=0;idx< salary_setup_head.length;idx++){
     
      let monthlyAmt:any=0;
      // && salary_setup_head[idx].value.salary_component_name!='Special Allowance' && salary_setup_head[idx].value.percentage_fixed=='Percentage' && this.salaryCalcType=='percent'
      if(salary_setup_head[idx].value.salary_component_name!='HRA' && salary_setup_head[idx].value.salary_component_name!='Gratuity In Hand' && salary_setup_head[idx].value.percentage_fixed!='Flat'
        && salary_setup_head[idx].value.salary_component_name!='Special Allowance'
      ){
        
        monthlyAmt=  ((parseFloat(salary_setup_head[idx].value.percentage_ctc))/100)*((parseFloat(this.rolesFormArray.controls[index].value.mop))/12);

      }else if((salary_setup_head[idx].value.salary_component_name=='HRA' && this.salaryCalcType=='percent') || (salary_setup_head[idx].value.salary_component_name=='Gratuity In Hand' && roleGroup.value.gratuityInHand=='Y')){
        
        monthlyAmt= ((parseFloat(salary_setup_head[idx].value.percentage_ctc))/100)*(parseFloat(salary_setup_head[0].value.salary_component_amount ));
       
      }else if((salary_setup_head[idx].value.percentage_fixed=='Flat' || this.salaryCalcType=='percent') && salary_setup_head[idx].value.salary_component_name!='Gratuity In Hand'){
        monthlyAmt =  parseFloat(salary_setup_head[idx].value.percentage_ctc)
      }
      
      decimalDiff = parseFloat((monthlyAmt - Math.round(monthlyAmt) + decimalDiff).toFixed(2));
      
      if(salary_setup_head[idx].value.salary_component_name!='Special Allowance'){
        monthlyAmt = (((Math.round(monthlyAmt)).toFixed(2)));
      }else{
        allowanceIdx= idx;
        // monthlyAmt = monthlyAmt + decimalDiff;
      }
  
        salary_setup_head[idx].patchValue({
          'salary_component_amount': (monthlyAmt)
        })
      
        if(salary_setup_head[idx].value.percentage_fixed=='Flat'){
          salary_setup_head[idx].patchValue({
            'percentage_ctc': (monthlyAmt)
          })
        }
    }
      if(allowanceIdx!=0){
        salary_setup_head[allowanceIdx].patchValue({
          'salary_component_amount' : decimalDiff + salary_setup_head[allowanceIdx].value.salary_component_amount,
          'percentage_ctc' : decimalDiff + salary_setup_head[allowanceIdx].value.salary_component_amount
        })
      }
 
      this.getuspccalcgrossfromctc_withoutconveyance(index);
  }

    getuspccalcgrossfromctc_withoutconveyance(idx:number):any{
    if($('#customEffectiveDate'+idx).val()!=''){
      this.rolesFormArray.controls[idx].patchValue({
        effectiveDate : $('#customEffectiveDate'+idx).val()
      })
    }else{
      const today = new Date();
      const dd = String(today.getDate()).padStart(2, '0');
      const mm = String(today.getMonth() + 1).padStart(2, '0'); // January is 0!
      const yyyy = today.getFullYear();

      const currentDate = '01' + '/' +mm + '/' + yyyy;
      this.rolesFormArray.controls[idx].patchValue({
        effectiveDate : currentDate
      })
    }
 
    let checkbox :any= document.getElementById('salary-toggle'+idx);

    if(this.rolesFormArray.controls[idx].invalid || !checkbox.checked){
      return;
    }
    // let date =$('#customEffectiveDate'+idx).val()
    if(this.rolesFormArray.controls[idx].value.minWagesCtg==''){
      return this.toastr.error("Please select minimum wages category");
    }
    else if(this.rolesFormArray.controls[idx].value.salaryDays==''){
      return this.toastr.error("Please select salary days");
    }else if(!this.rolesFormArray.controls[idx].value.effectiveDate){
      return this.toastr.error('Please select effective date.');
    }
    
    let mop = parseFloat(((parseFloat(this.rolesFormArray.controls[idx].value.mop))/12).toFixed(2))
    let conveyance_amt =0;
    let pfSumAmt =0;
    const roleGroup = this.rolesFormArray.at(idx) as FormGroup;
    const salaryStructureArray = roleGroup.get('salarystructure') as FormArray;
    for(let i=0;i< salaryStructureArray.controls.length;i++){
      if(salaryStructureArray.controls[i].value.is_taxable=='N'){
        if(salaryStructureArray.controls[i].value.percentage_fixed=='Flat'){
          conveyance_amt+=parseFloat(salaryStructureArray.controls[i].value.percentage_ctc)
        }else{
          conveyance_amt+=parseFloat(salaryStructureArray.controls[i].value.salary_component_amount)
        }
      }
      if(salaryStructureArray.controls[i].value.ispfapplicable=='Y'){
        // console.log(salaryStructureArray.controls[i].value)
        if(salaryStructureArray.controls[i].value.percentage_fixed=='Flat'){
          pfSumAmt+=parseFloat(salaryStructureArray.controls[i].value.percentage_ctc)
        }else{
          pfSumAmt+=parseFloat(salaryStructureArray.controls[i].value.salary_component_amount)
        }
      }
    }


    if(this.isEmployerPartExcluded=='Y'){
      this.grossSalary[idx] = mop;
      let sum=0;
      
      for(let i=0;i<salaryStructureArray.controls.length;i++){
        if(salaryStructureArray.controls[i].value.percentage_fixed!='Flat')
          sum += parseFloat(salaryStructureArray.controls[i].value.salary_component_amount);
        else
          sum += parseFloat(salaryStructureArray.controls[i].value.percentage_ctc);
      }
      
      if(sum!=parseFloat(this.grossSalary[idx])){
        this.toastr.info(`Remaining Gross amount has been adjusted to special allowance which excceeds from ${(sum -this.grossSalary[idx]).toFixed(2)} amount. Adjust if you want!`)
      }

      for(let i=0;i<salaryStructureArray.value.length;i++){
        if(salaryStructureArray.controls[i].value.salary_component_name=='Special Allowance'){ 
          salaryStructureArray.controls[i].patchValue({
              salary_component_amount : (parseFloat(salaryStructureArray.controls[i].value.salary_component_amount) + parseFloat((this.grossSalary-sum).toFixed(2))).toFixed(2),
              percentage_ctc : (parseFloat(salaryStructureArray.controls[i].value.percentage_ctc) + parseFloat((this.grossSalary-sum).toFixed(2))).toFixed(2)
            })
        }
      }
      return;
    }
    let esiOpted= this.esi_details.is_esi_registered=='Y'? this.rolesFormArray.controls[idx].value.esiOpted : 'N';
    let pfOpted = this.pf_details.is_epf_registered=='Y' ? this.rolesFormArray.controls[idx].value.pfOpted : 'N';
    this.rolesFormArray.controls[idx].patchValue({
      esiOpted: esiOpted,
      pfOpted : pfOpted
    })
    this.customSalaryMsg='';
    let postData ={
      'appointmentid' : '-9999',
      ...this.rolesFormArray.controls[idx].value,
      // 'effectiveDate': date,
      'isEmployerPartExcluded' : this.isEmployerPartExcluded[idx] ? this.isEmployerPartExcluded[idx]:'N',
      'customerAccountId': this._e.aesEncrypt(this.tp_account_id.toString()),
      'basic': (Math.round(salaryStructureArray.controls[0].value.salary_component_amount)),
      'mop' : parseFloat(((parseFloat(this.rolesFormArray.controls[idx].value.mop))/12).toFixed(2)),
      'conveyance_amt': Math.round(conveyance_amt),
      'pfapplicablecomponents' : pfSumAmt
    }

    this._employeeService.uspccalcgrossfromctc_withoutconveyance(postData).subscribe((resData1:any):any=>{
      if(resData1.statusCode){
        
        if(resData1.commonData[0] && resData1.commonData[0].status==0) {
          this.customSalaryMsg= resData1.commonData[0].msg;
          return;
        }else{
          this.customSalaryMsg='';
        }
        this.grossSalary[idx] = parseFloat(resData1.commonData[0].gross.toFixed(5));
        let sum=0;
       
        for(let i=0;i<salaryStructureArray.controls.length;i++){
          if(salaryStructureArray.controls[i].value.percentage_fixed!='Flat')
            sum += parseFloat(salaryStructureArray.controls[i].value.salary_component_amount);
          else
            sum += parseFloat(salaryStructureArray.controls[i].value.percentage_ctc);
        }
        
        if(sum!=parseFloat(this.grossSalary[idx])){
          this.toastr.info(`Remaining Gross amount has been adjusted to special allowance which excceeds from ${(sum -this.grossSalary[idx]).toFixed(2)} amount. Adjust if you want!`)
        }
        for(let i=0;i<salaryStructureArray.value.length;i++){
          if(salaryStructureArray.controls[i].value.salary_component_name=='Special Allowance'){ 
            salaryStructureArray.controls[i].patchValue({
                salary_component_amount : (parseFloat(salaryStructureArray.controls[i].value.salary_component_amount) + parseFloat((this.grossSalary[idx]-sum).toFixed(2))).toFixed(2),
                percentage_ctc : (parseFloat(salaryStructureArray.controls[i].value.percentage_ctc) + parseFloat((this.grossSalary[idx]-sum).toFixed(2))).toFixed(2)
              })
          }
        }
        
        // this.salComponentHead.controls[2].patchValue({
        //   salary_component_amount : Math.round(this.salComponentHead.controls[2].value.salary_component_amount) + (Math.round(this.grossSalary)-sum)
        // })
      }else{
        return this.toastr.error(resData1.message);
      }
      })
  
  }

  clearCalculatedData(idx:any,j:number,amount:any):any{
    this.customCalculatedData[idx] ='';
    this.isCustomInputTrigger[idx]=true; 
   
    const roleGroup = this.rolesFormArray.at(idx) as FormGroup;
    const salaryStructureArray = roleGroup.get('salarystructure') as FormArray;

    salaryStructureArray.controls[j].patchValue({
      salary_component_amount: amount=='' ? '0.00': (amount)
    })
    if(salaryStructureArray.controls[j].value.percentage_fixed=='Flat'){
      salaryStructureArray.controls[j].patchValue({
        percentage_ctc: amount=='' ? '0.00': (amount)
      })
    }
    if(this.salaryCalcType=='flat'){
      salaryStructureArray.controls[0].patchValue({
        // salary_component_amount : parseFloat(this.salComponentHead.controls[0].value.salary_component_amount) + parseFloat(this.salComponentHead.controls[i].value.percentage_ctc),
        percentage_ctc : (parseFloat(salaryStructureArray.controls[0].value.salary_component_amount) / ((parseFloat(this.rolesFormArray.controls[idx].value.mop))/12)) * 100 
      })
    }
    if(idx==0){
      for(let i = 0;i< salaryStructureArray.controls.length;i++){
        if(salaryStructureArray.controls[i].value.salary_component_name=='HRA' && this.salaryCalcType!='flat' ){
          let amount :number = (((salaryStructureArray.controls[i].value.percentage_ctc))/100)*((parseInt(salaryStructureArray.controls[0].value.salary_component_amount)));
      
          salaryStructureArray.controls[i].patchValue({
            salary_component_amount: Math.round(amount)
          })
        }
      }

    }

    let sum=0;
       
    for(let i=0;i<salaryStructureArray.controls.length;i++){
      if(salaryStructureArray.controls[i].value.percentage_fixed!='Flat')
        sum += parseFloat(salaryStructureArray.controls[i].value.salary_component_amount);
      else
        sum += parseFloat(salaryStructureArray.controls[i].value.percentage_ctc);
    }
        
        // if(sum!=parseFloat(this.grossSalary)){
        //   this.toastr.info(`Remaining Gross amount hass been adjusted to special allowance which excceeds from ${(this.grossSalary-sum).toFixed(2)} amount. Adjust if you want!`)
        // }
    for(let i=0;i<salaryStructureArray.value.length;i++){
      if(salaryStructureArray.controls[i].value.salary_component_name=='Special Allowance'){ 
        
        salaryStructureArray.controls[i].patchValue({
            salary_component_amount : (parseFloat(salaryStructureArray.controls[i].value.salary_component_amount) + parseFloat((this.grossSalary[idx]-sum).toFixed(2))).toFixed(2),
            percentage_ctc : (parseFloat(salaryStructureArray.controls[i].value.salary_component_amount) + parseFloat((this.grossSalary[idx]-sum).toFixed(2))).toFixed(2)
          })
          
          if(salaryStructureArray.controls[i].value.percentage_ctc<0){
            salaryStructureArray.controls[1].patchValue({
              salary_component_amount : parseFloat(salaryStructureArray.controls[1].value.salary_component_amount) + parseFloat(salaryStructureArray.controls[i].value.percentage_ctc),
              percentage_ctc : ((parseFloat(salaryStructureArray.controls[1].value.salary_component_amount) + parseFloat(salaryStructureArray.controls[i].value.percentage_ctc)) / parseFloat(salaryStructureArray.controls[0].value.salary_component_amount)) * 100 
            })
            salaryStructureArray.controls[i].patchValue({
              salary_component_amount : 0.00,
              percentage_ctc : 0.00 
            })
            // return this.toastr.error("Salary amount cannot excced Gross Salary. Please check.");
          }
      }
      
    }
    if(salaryStructureArray.controls[j].value.is_taxable=='N' || j==0){
      this.getuspccalcgrossfromctc_withoutconveyance(idx)
    }
  }

  calculateCustomSal(idx:any):any{

    // if($('#customEffectiveDate').val()!=''){
    //   this.rolesFormArray.controls[idx].patchValue({
    //     effectiveDate : $('#customEffectiveDate'+idx).val()
    //   })
    // }
    // let date =+$('#customEffectiveDate').val()
    if(this.rolesFormArray.at(idx).value.minWagesCtg==''){
      return this.toastr.error("Please select minimum wages category");
    }
    else if(this.rolesFormArray.at(idx).value.salaryDays==''){
      return this.toastr.error("Please select salary days");
    }else if(!this.rolesFormArray.at(idx).value.effectiveDate){
      return this.toastr.error('Please select effective date.');
    }

    const roleGroup = this.rolesFormArray.at(idx) as FormGroup;
    const salaryStructureArray = roleGroup.get('salarystructure') as FormArray;

    let pfSumAmt =0;
    for(let i=0;i< salaryStructureArray.controls.length;i++){
      
      if(salaryStructureArray.controls[i].value.ispfapplicable=='Y'){
        if(salaryStructureArray.controls[i].value.percentage_fixed=='Flat'){
          pfSumAmt+=parseFloat(salaryStructureArray.controls[i].value.percentage_ctc)
        }else{
          pfSumAmt+=parseFloat(salaryStructureArray.controls[i].value.salary_component_amount)
        }
      }
    }
    console.log(parseFloat(((parseFloat(this.rolesFormArray.controls[idx].value.mop))/12).toFixed(2)));
    
    let postData ={
      'appointmentid' : '-9999',
      ...this.rolesFormArray.controls[idx].value,
      'isEmployerPartExcluded' : this.isEmployerPartExcluded[idx] ? this.isEmployerPartExcluded[idx]:'N',
      'customerAccountId': this._e.aesEncrypt(this.tp_account_id.toString()),
      'basic': (parseInt(salaryStructureArray.controls[0].value.salary_component_amount)),
      'mop' : parseFloat(((parseFloat(this.rolesFormArray.controls[idx].value.mop))/12).toFixed(2)),
      'pfSumAmt' : pfSumAmt
    }

    let sum=0;
       
    for(let i=0;i<salaryStructureArray.controls.length;i++){
      if(salaryStructureArray.controls[i].value.percentage_fixed!='Flat')
        sum += parseFloat(salaryStructureArray.controls[i].value.salary_component_amount);
      else
        sum += parseFloat(salaryStructureArray.controls[i].value.percentage_ctc);

      if(salaryStructureArray.controls[i].value.salary_component_name=='Special Allowance'){
        if(salaryStructureArray.controls[i].value.percentage_ctc<0){
          salaryStructureArray.controls[1].patchValue({
            salary_component_amount : parseFloat(salaryStructureArray.controls[1].value.salary_component_amount) + parseFloat(salaryStructureArray.controls[i].value.percentage_ctc),
            percentage_ctc : ((parseFloat(salaryStructureArray.controls[1].value.salary_component_amount) + parseFloat(salaryStructureArray.controls[i].value.percentage_ctc)) / parseFloat(salaryStructureArray.controls[0].value.salary_component_amount)) * 100 
          })
          salaryStructureArray.controls[i].patchValue({
            salary_component_amount : 0.00,
            percentage_ctc : 0.00 
          })
          // return this.toastr.error("Salary amount cannot excced Gross Salary. Please check.");
        }
      }
    }

    if(sum!=parseFloat(this.grossSalary[idx])){
      this.toastr.info(`Remaining Gross amount has been adjusted to special allowance which excceeds from ${(this.grossSalary[idx]-sum).toFixed(2)} amount. Adjust if you want!`)
    }
      postData.mop= this.grossSalary[idx];
      this._employeeService.createCustomSalaryStructure(postData).subscribe((resData:any):any=>{
        if(resData.statusCode){
          if(resData.commonData[0].status && resData.commonData[0].status==0){
            return this.toastr.error(resData.commonData[0].msg);
          }
          this.customCalculatedData[idx] = resData.commonData[0];
         
          this.customCalculatedData[idx] .gratuityRound = this.customCalculatedData[idx] .gratuityopted=='Y' ? (this.customCalculatedData[idx] .gratuity):'0';
          this.customCalculatedData[idx] .employerGratuityRound = this.customCalculatedData[idx] .employergratuityopted=='Y' ? (this.customCalculatedData[idx] .employergratuity):'0';
          this.leaveTemplateData = JSON.parse(this._e.aesDecrypt(resData.templateData));
        }else{
          this.customCalculatedData[idx]  ='';
        }
      })

  }

  saveCustomSal(idx: number): any {
    if(this.rolesFormArray.controls[idx].value.id===''){
      return this.toastr.error("Please save the role first");
    }
    this.edli_adminchargesincludeinctc = this.pf_details.edli_adminchargesincludeinctc;
    const roleGroup = this.rolesFormArray.at(idx) as FormGroup;
    const salaryStructureArray = roleGroup.get('salarystructure') as FormArray;
    let pfSumAmt =0;
    for(let i=0;i< salaryStructureArray.controls.length;i++){
      
      if(salaryStructureArray.controls[i].value.ispfapplicable=='Y'){
        if(salaryStructureArray.controls[i].value.percentage_fixed=='Flat'){
          pfSumAmt+=parseFloat(salaryStructureArray.controls[i].value.percentage_ctc)
        }else{
          pfSumAmt+=parseFloat(salaryStructureArray.controls[i].value.salary_component_amount)
        }
      }
    }
    const date = new Date();
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const year = date.getFullYear();
  
    let currentDate = `${day}/${month}/${year}`;
    let postData = {
      ...this.customCalculatedData[idx] ,
      'tp_leave_template_txt': this.leaveTemplateData,
      'dateOfJoining': currentDate,
      'jobRole': this.rolesFormArray.controls[idx].value.roleName,
      'unitid': this.companyDetailForm.controls.rowid.value,
      'customeraccountid': this.tp_account_id,
      'id': this.rolesFormArray.controls[idx].value.id,
      'dept': this.rolesFormArray.controls[idx].value.dept,
      'pfSumAmt': pfSumAmt,
      'edli_adminchargesincludeinctc' : this.edli_adminchargesincludeinctc
    };
  
    this.businessService.saveCustomSalaryStructureUnit(postData).subscribe((resData: any) => {
      if (resData.statusCode) {
        this.toastr.success(resData.message);
        this.customCalculatedData[idx] = '';
        this.isCustomInputTrigger[idx] = false;
        this.isShowSalaryTable = false;
        this.isShowMapEmp = false;
      } else {
        this.toastr.error(resData.message);
      }
    });
  }

  get_page(event: any) {
    this.p = event;
  }
  
}
