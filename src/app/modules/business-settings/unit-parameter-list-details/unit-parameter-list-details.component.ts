import { Component } from '@angular/core';
import { FaceCheckinService } from '../../attendance/face-checkin.service';
import { SessionService } from 'src/app/shared/services/session.service';
import jwtDecode from 'jwt-decode';
import { ActivatedRoute, Router } from '@angular/router';
import { EncrypterService } from 'src/app/shared/services/encrypter.service';
import { ToastrService } from 'ngx-toastr';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { dongleState, grooveState } from 'src/app/app.animation';
import { AttendanceService } from '../../attendance/attendance.service';
import { EmployeeService } from '../../employee/employee.service';
import { BusinesSettingsService } from '../business-settings.service';
import { lastValueFrom } from 'rxjs';
declare var $:any;

@Component({
  selector: 'app-unit-parameter-list-details',
  templateUrl: './unit-parameter-list-details.component.html',
  styleUrls: ['./unit-parameter-list-details.component.css'],
  animations: [grooveState, dongleState]
})
export class UnitParameterListDetailsComponent {
  showSidebar: any=true;
  organzationUnitList:any=[];
  decoded_token: any;
  tp_account_id: any;
  userid: any;
  individualOrgData: any=[];
  orgid: any;
  isDivisionUnit : boolean =false;
  departmentForm :FormGroup;
  designationForm :FormGroup;
  desgList: any=[];
  deptList: any=[];
  currentDept: any='';
  isCollapsed: boolean[] = [];
  isDesignationUnit : boolean=false;
  salary_setup_head: any=[];
  salaryPercent: { basicPercent: any; hraPercent: any; };
  allState: any=[];
  esi_details: any='';
  pf_details: any='';
  customCalculatedData: any=[];
  customSalaryMsg: any=[];
  grossSalary: any=[];
  isCustomInputTrigger: any=[];
  salaryCalcType:any='percent';

  constructor(private _faceCheckinService : FaceCheckinService,
    private _sessionService : SessionService,
    private toastr: ToastrService,
    private _e : EncrypterService,
    private activeroute: ActivatedRoute,
    private _fb: FormBuilder,
    private _attndanceService : AttendanceService,
    private _employeeService : EmployeeService,
    private _businessService : BusinesSettingsService
  ){
    this.activeroute.params.subscribe((params: any) => {
      if(params['id'])
      this.orgid = this._e.aesDecrypt(params['id']);
    });

    this.isCollapsed = new Array(this.deptList.length).fill(false);
  }
  
  ngOnInit(){
    let session_obj = this._sessionService.get_user_session();
    let token = JSON.parse(session_obj).token;
    this.decoded_token = jwtDecode(token);
    this.tp_account_id = this.decoded_token.tp_account_id;
    this.userid = this.decoded_token.userid;

    this.departmentForm = this._fb.group({
      divisions : new FormArray([])
    })

    this.designationForm = this._fb.group({
      roles : new FormArray([])
    })
    this.getDesgDetails(this.orgid)
    this.getMasterData('','department_list_all');

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
    // $('.deputedDate').datepicker({
    //   dateFormat: 'dd/mm/yy',
    //   changeMonth: true,
    //   changeYear: true,
    // })
  }

  toggle() {
    this.showSidebar = !this.showSidebar;
  }

  toggleCollapse(dept :any,index: number) {

    this.deptList.map((collapsed, i) => {i === index ? this.isCollapsed[i]=true  : this.isCollapsed[i]=false});

    this.getMasterData(dept, 'designation_list_all');
}

  getDesgDetails(orgid:any){
    this._faceCheckinService.getemployeeList({ "action": "unit_list",
      "customeraccountid": this.tp_account_id,
      "organization_unitid": orgid.toString(),
      "emp_code": "",
      "keyword": "",
      "fromdate": "",
      "todate": ""
    }).subscribe((resData:any)=>{
      if(resData.statusCode){
        
        this.individualOrgData = (JSON.parse(this._e.aesDecrypt(resData.commonData)))[0];
        this.individualOrgData['department'] = !this.individualOrgData['department'] ? [] : JSON.parse(this.individualOrgData['department']);
        this.individualOrgData['role']= !this.individualOrgData['role'] ? [] : JSON.parse(this.individualOrgData['role']);
      }else{
        this.toastr.error(resData.message);
        this.individualOrgData = [];
      }
    })
  }

  get divisionForm(){
    return this.departmentForm.get('divisions') as FormArray;
  }

  get rolesFormArray(){
    return this.designationForm.get('roles') as FormArray;
  }

  getMasterData(deptid:any='',action:string=''){
    this.currentDept = deptid;
    this._attndanceService.get_att_master_list({ "action": action,
      "customeraccountid": this.tp_account_id,
      "unit_id": this.orgid,
      "department_id": deptid,
    }).subscribe((resData:any)=>{
      if(resData.statusCode){
        if(action=='department_list_all'){
            this.deptList =  resData.commonData;
        }else{
          this.desgList= resData.commonData;
        }
       
      }else{
        
        this.toastr.error(resData.message);       
        this.desgList=[];
          // this.salaryStructure='';
          // this.salaryStructureView='';
        // this.deptList=[];
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
            'salary_component_amount': new FormControl(monthlyAmt.toFixed(2))
          }));
        }
      }  
    }
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
                'salary_component_amount': new FormControl(monthlyAmt.toFixed(2))
              }));
            }
          }  
        }  
       
      }else{
        this.toastr.error(resData.message);
      }
    })
  }

  showDivisionUnitModal(){
    this.isDivisionUnit=true;
    this.divisionForm.push(this._fb.group({
      departmentName : ['',[Validators.required]],
      address : ['',[Validators.required]],
      state :['',[Validators.required]],
      pin_code : ['',[Validators.required,Validators.pattern(/^[0-9]{6}$/)]],
      gstno : ['',[Validators.pattern(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/)]],
      isAddressSame :[''],
      id:['']
    }))
    let body = document.querySelector('body');
    body.classList.add('modal-open');
    this.getAllStates();
  }

  closeDivisionModal(){
    this.isDivisionUnit=false;
    let body = document.querySelector('body');
    body.classList.remove('modal-open');
  }

  hideSalaryBox(idx:number){
 
      // document.getElementById('salary-toggle').addEventListener('change', function() {
      //   const salaryToggle = this as HTMLInputElement;
      //   const salaryDetailsBox:HTMLElement = document.getElementById('Salary-Details-inn-box'+idx);
      //   console.log(salaryDetailsBox);
        
      //   if (salaryToggle.checked) {
      //     salaryDetailsBox.style.display = 'block';
      //   } else {
      //     salaryDetailsBox.style.display = 'none';
      //   }
      // });
  }
  
  showDesgModal(dept:any){
    this.isDesignationUnit=true;   
    this.getMasterSalaryStructure();
    this.rolesFormArray.push(this._fb.group({
      mop:['',[Validators.required]],
      roleName : ['',[Validators.required]],
      employee : [''],
      dept : [dept.toString(),[Validators.required]],
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


    setTimeout(()=>{
        document.getElementById('salary-toggle').addEventListener('change', function() {
        const salaryToggle = this as HTMLInputElement;
        const salaryDetailsBox:HTMLElement = document.getElementById('Salary-Details-inn-box');
        console.log(salaryDetailsBox);
        
        if (salaryToggle.checked) {
          salaryDetailsBox.style.display = 'block';
        } else {
          salaryDetailsBox.style.display = 'none';
        }
      })
    },0);
    
    let body = document.querySelector('body');
    body.classList.add('modal-open');
  }

  closeDesignationUnit(){
    this.isDesignationUnit=false;
    let body = document.querySelector('body');
    body.classList.remove('modal-open');
  }

  setAddress(isChecked:boolean,idx:number){
    if(isChecked){
      this.divisionForm.controls[idx].patchValue({
        address : this.individualOrgData.org_unit_address,
        state : this.individualOrgData.org_unit_state?.toUpperCase(),
        pin_code : this.individualOrgData.org_unit_pin,
        gstno : !this.individualOrgData.gstin ? '': this.individualOrgData.gstin
      })
    }
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
            orgid: this.individualOrgData.id.toString()
        };

        const savePromise = lastValueFrom(this._businessService.saveDepartmentUnit(postData));
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
        this.closeDesignationUnit();
        this.getDesgDetails(this.individualOrgData.id);
    } else {
        this.toastr.error(results[0].value.message);
        // console.error('Error saving departments', errorResults);
    }
  } catch (error) {
      this.toastr.error('Error saving departments', error);
  }
  }

  async saveRole():Promise<any>{
    const savePromises = [];
    for(let i=0;i<this.rolesFormArray.controls.length;i++){
      if(this.rolesFormArray.controls[i].value.id==''){
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
          orgid: this.individualOrgData.id.toString(),
          
        };


        const savePromise = lastValueFrom(this._businessService.saveDesignationUnit(postData));
        savePromises.push(savePromise);
    
        try {
          const results:any = await Promise.allSettled(savePromises);
        
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
            this.closeDesignationUnit();
            this.getMasterData('','department_list_all');
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
    this._businessService.GetEmployerSocialSecurityDetails({
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
      return this.toastr.error("Please enter value Annual Salary");
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
      this.isCustomInputTrigger[index]=true;
 
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
 
    if(this.rolesFormArray.controls[idx].invalid){
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
      'isEmployerPartExcluded' : 'N',
      'customerAccountId': this._e.aesEncrypt(this.tp_account_id.toString()),
      'basic': (Math.round(salaryStructureArray.controls[0].value.salary_component_amount)),
      'mop' : parseFloat(((parseFloat(this.rolesFormArray.controls[idx].value.mop))/12).toFixed(2)),
      'conveyance_amt': Math.round(conveyance_amt)
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

  getSalaryControls(roleIndex: number): FormArray {
    return (this.rolesFormArray.controls[roleIndex].get('salarystructure') as FormArray);
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
}
