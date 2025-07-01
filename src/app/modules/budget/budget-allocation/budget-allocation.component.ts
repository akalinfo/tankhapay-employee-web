import { Component } from '@angular/core';
import { EncrypterService } from 'src/app/shared/services/encrypter.service';
import { SessionService } from 'src/app/shared/services/session.service';
import decode from 'jwt-decode';
import { FaceCheckinService } from '../../attendance/face-checkin.service';
import { debounceTime } from 'rxjs';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BudgetService } from '../budget.service';
import { ToastrService } from 'ngx-toastr';
import { dongleState, grooveState } from 'src/app/app.animation';
import { UserMgmtService } from '../../user-mgmt/user-mgmt.service';
import * as XLSX from 'xlsx';

declare var $:any;

@Component({
  selector: 'app-budget-allocation',
  templateUrl: './budget-allocation.component.html',
  styleUrls: ['./budget-allocation.component.css'],
  animations:[grooveState,dongleState]
})
export class BudgetAllocationComponent {
  showSidebar : boolean = true;
  token:any;
  tp_account_id: any;
  product_type: any;
  projectList: any=[];
  project_master_list_data :any=[];
  fiscalYears: string[] = this.FinancialYears();
  ledgHeadList : any=[];
  budgetDetailForm: FormGroup;
  budgetForm: FormGroup;
  currentProject:any=[];
  activeProject: number | null = null;
  isAddEditProject:boolean=false;
  projectForm : FormGroup;

  constructor(
    private _sessionService : SessionService,
    private _encrypterService:  EncrypterService,
    private _faceCheckinService : FaceCheckinService,
    private _fb: FormBuilder,
    private _budgetService : BudgetService,
    private toastr : ToastrService,
    private _userMgmtService : UserMgmtService,
    private _EncrpterService : EncrypterService
  ){}

  ngOnInit(){
    let session_obj_d: any = JSON.parse(
    this._sessionService.get_user_session());
    this.token = decode(session_obj_d.token);
    this.tp_account_id = this.token.tp_account_id;
    this.product_type = localStorage.getItem('product_type');

    this.budgetDetailForm = this._fb.group({
      fin_year : [''],
      projectid : [''],
      budgetAmount : [''],
      budgetid : [''],
      budgetType: ['Annually'],
      budgetDetails : this._fb.array([])
    })

    this.projectForm = this._fb.group({
      projectName: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      projectAmount : [''],
      projectLocation : [''],
      id:[null]
    })

    this.getbudgetList();
    this.getProjectList();
    this.getLedgerList();
  }
  toggle() {
    this.showSidebar = !this.showSidebar;
  }

  get budgetArr(){
    return this.budgetDetailForm.get('budgetDetails') as FormArray;
  }
  getbudgetList(key:any=''){
    console.log(key);
    
    if(key && key.length<3){
      return;
    }
    this._faceCheckinService.getemployeeList({
      "action": "mst_budget_list",
      "customeraccountid": this.tp_account_id.toString(),
      "emp_code": "",
      "organization_unitid": "",
      "keyword": key,
      "fromdate": "",
      "todate": ""
    }).pipe(debounceTime(100)).subscribe((resData:any)=>{
      if(resData.statusCode){
        this.projectList = JSON.parse(this._encrypterService.aesDecrypt(resData.commonData));
       console.log(this.projectList);
       
      }else{
        this.projectList =[];
      }
    })
  }

  // filterDataOnFinYear(val:any){

  // }

  // filterDataOnProject(val:any){

  // }

  getProjectList(){
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
          this.project_master_list_data =  JSON.parse(this._encrypterService.aesDecrypt(resData.commonData));
          console.log(this.project_master_list_data);
          
      }else{
        this.project_master_list_data =[];
      }
    })
  }

  getLedgerList(){
    this._faceCheckinService.getemployeeList({
      "action": "budget_led_head_list",
      "customeraccountid": this.tp_account_id.toString(),
      "emp_code": "",
      "organization_unitid": "",
      "keyword": "",
      "fromdate": "",
      "todate": ""
    }).subscribe((resData: any) => {
      if (resData.statusCode) {
          this.ledgHeadList =  JSON.parse(this._encrypterService.aesDecrypt(resData.commonData));
          console.log(this.ledgHeadList);
          
      }else{
        this.ledgHeadList =[];
      }
    })
  }

  FinancialYears(
    startingYear?: number,
    currentYear?: number,
    finYearStartMonth: number = 4 // Default financial year starts in April
  ): string[] {
    const now = new Date();
    const currentMonth = now.getMonth() + 1; // Months are 0-based, so add 1
    const current = currentYear || (currentMonth >= finYearStartMonth ? now.getFullYear() : now.getFullYear() - 1);
    const start = startingYear || (current ); // Default to 4 years ago if not provided
    const nextYear = current + 1; // Include the next financial year
  
    if (start > current) {
      throw new Error("Starting year cannot be greater than the current year.");
    }
  
    const fiscalYears: string[] = [];
    for (let i = start; i <= nextYear; i++) { // Loop till next year
      const finYear = `${i}-${i + 1}`; // Format as full four-digit years
      fiscalYears.push(finYear);
    }
  
    return fiscalYears;
  }
  

  addEditBudget(project:Object=''){

    $('#SendMessage04').modal('show');
    if(project){
      this.budgetDetailForm.patchValue({
        fin_year: project['fin_year'],
        projectid : project['project_id'],
        budgetAmount : project['budget_amount'],
        budgetid : project['budget_id'],
        budgetType : project['budget_type']
      })
    }
  }

  hideEditBudget(){
    $('#SendMessage04').modal('hide');
    this.budgetDetailForm.patchValue({
      fin_year: '',
      projectid : '',
      budgetAmount : '',
      budgetid : '',
      budgetType : 'Annually'
    })
    while(this.budgetArr.length!=0){
      this.budgetArr.removeAt(0)
    }
    this.activeProject=null;
  }

  updateBudget(id:any=''):any{

    
    let action='';
    if(this.budgetDetailForm.value.budgetid){
      action='update_budget'
    }else{
      action='save_budget'
    }

    if(id){
      action='delete_budget_details';
      this.budgetDetailForm.patchValue({
        budgetid : id
      })
    }else{
      if(!this.budgetDetailForm.value.fin_year){
        return this.toastr.error("Please select financial year.")
      }
      if(!this.budgetDetailForm.value.projectid){
        return this.toastr.error("Please select Project.")
      }
      if(!this.budgetDetailForm.value.budgetAmount){
        return this.toastr.error("Please enter budget amount.")
      }
      if(!this.budgetDetailForm.value.budgetType){
        return this.toastr.error("Please select budget type.")
      }
    }
    this._budgetService.addUpdateBudget({
      action : action,
      customeraccountid : this.tp_account_id,
      ...this.budgetDetailForm.value,
      userBy: this.tp_account_id
    }).subscribe((resData:any)=>{
      if(resData.statusCode){
        this.getbudgetList();
        this.hideEditBudget();
        this.toastr.success(resData.message);
      }else{
        this.toastr.error(resData.message);
      }
    })
  }

  addBudget(project:any):any{
    if(project){
      this.currentProject=  project;
    }

    for(let i=0;i<this.budgetArr.length;i++){
      if(!this.budgetArr.value[i].ledger_head_id){
        return this.toastr.error(`Please select subledger in row ${i+1}`);
      }
      if(!this.budgetArr.value[i].budget_led_head_amount){
        return this.toastr.error(`Please enter amount in row ${i+1}`);
      }
    }
    this.budgetDetailForm.patchValue({
      fin_year: this.currentProject['fin_year'],
        projectid : this.currentProject['project_id'],
        budgetAmount : this.currentProject['budget_amount'],
        budgetid : this.currentProject['budget_id'],
        budgetType : this.currentProject['budget_type']
    })
    if(project && project.budget_details){
      for(let i=0;i< project.budget_details.length;i++){
        this.budgetArr.push(this._fb.group({
          id: project.budget_details[i].id,
          ledger_head_id : project.budget_details[i].budget_ledger_head_id,
          budget_led_head_amount : project.budget_details[i].budget_led_head_amount,
        }))
      }
    }else{
      this.budgetArr.push(this._fb.group({
        ledger_head_id : [''],
        budget_led_head_amount : [''],
        id: [null]
      }))
    }
  }


  getTotalAmount(idx:number):any{
    let amount=0;
    for(let i=0;i< this.budgetArr.value.length;i++){
      amount+= parseInt(this.budgetArr.value[i].budget_led_head_amount);
    }

    if(amount> parseInt(this.budgetDetailForm.value.budgetAmount)){
      return this.toastr.error("Total ledget amount cannot exceed the budget amount");
    }
  }

  removeBudget(idx:any){
    if(this.budgetArr.value[idx].id){
      if(!confirm("Are you sure you want to delete this record?")){
        return
      }
      this.updateBudget(this.budgetArr.value[idx].id);
      this.budgetArr.removeAt(idx);
    }else{
      if(!confirm("Are you sure you want to delete this record?")){
        return
      }
      this.budgetArr.removeAt(idx);
    }
  }

  saveBudgetDetails():any{
    let amount=0;
    for(let i=0;i< this.budgetArr.value.length;i++){
      amount+= parseInt(this.budgetArr.value[i].budget_led_head_amount);
      if(!this.budgetArr.value[i].ledger_head_id){
        return this.toastr.error(`Please select a subledger in row ${i+1}.`);
      }
      if(!this.budgetArr.value[i].budget_led_head_amount){
        return this.toastr.error(`Please enter amount in row ${i+1}.`);
      }
    }

    if(amount> parseInt(this.budgetDetailForm.value.budgetAmount)){
      return this.toastr.error("Total ledget amount cannot exceed the budget amount");
    }
    this._budgetService.insertBudgetDetail({
      ...this.budgetDetailForm.value,
      action:'insert_budget_details',
      customeraccountid: this.tp_account_id.toString(),
      userBy : this.tp_account_id.toString()
    }).subscribe((resData:any)=>{
      if(resData.statusCode){
        this.toastr.success(resData.message);
        this.hideEditBudget();
        this.getbudgetList();
      }else{
        this.toastr.error(resData.message);
      }
    })
  }

  toggleSubTable(idx:number){
    if(this.activeProject==idx){
      while(this.budgetArr.length!=0){
        this.budgetArr.removeAt(0);
      }
      this.activeProject =null
    }else if(this.activeProject!=idx && this.activeProject!=null){
      while(this.budgetArr.length!=0){
        this.budgetArr.removeAt(0);
      }
      this.activeProject = this.activeProject === idx ? null : idx;
      if(this.budgetArr.length==0){
        this.addBudget(this.projectList[idx]);
      }
    }else{
      this.activeProject = this.activeProject === idx ? null : idx;
      if(this.budgetArr.length==0){
        this.addBudget(this.projectList[idx]);
      }
    }
  }

  hideProjectModal(){
    this.isAddEditProject=false;
    let body= document.querySelector('body');
    if(body){
      body.classList.remove('modal-open');
    }
    this.projectForm.patchValue({
      projectName : '',
      startDate : '',
      endDate : '',
      projectAmount : '',
      projectLocation : '',
      id:null
    })
  }

  isFieldInvalid(field: string): boolean {
    return this.projectForm.get(field)?.invalid && this.projectForm.get(field)?.touched;
  }

  manageProject(task:string='',id:any=null){
    let action;
    if(id){
      if(task){
        action = task;
        this.projectForm.patchValue({
          id:id
        })
      }
      
    }else if(this.projectForm.value.id){
      action ='update_project'
    }else{
      action='save_project';
    }

    if(action=='delete_project'){
      if(!confirm('Are you sure you want to delete this project?')){
        return;
      }
    }else{
      if (this.projectForm.invalid) {
        this.projectForm.markAllAsTouched(); // Mark all fields as touched to show errors
        return;
      }
    }
    
    this._userMgmtService.manageProjects({ "action":action, "customerAccountId":this.tp_account_id.toString(),
       "employeeValue":"", "createdBy":"4",...this.projectForm.value
       }).subscribe((resData:any)=>{
        if(resData.statusCode){
          this.toastr.success(resData.message);
          this.hideProjectModal();
          this.getProjectList();
        }else{
          this.toastr.error(resData.message);
        }
       })
  }

  showProjectModal(){
    this.isAddEditProject = true;

    let body= document.querySelector('body');
    if(body){
      body.classList.add('modal-open')
    }
  }

  exportExcelData() {

      this._faceCheckinService.getemployeeList({
        "action": "mst_budget_list",
        "customeraccountid": this.tp_account_id.toString(),
        "emp_code": "",
        "organization_unitid": "",
        "keyword": '',
        "fromdate": "",
        "todate": ""
      }).subscribe((resData:any)=>{
        if(resData.statusCode){
          let data: any =  JSON.parse(this._EncrpterService.aesDecrypt(resData.commonData));
  
          let exportData = [];
          for (let i = 0; i < data.length; i++) {
            const budgetDetails = data[i].budget_details ? data[i].budget_details : [];

            let ledgerColumn = '';
            for (let j = 0; j < budgetDetails.length; j++) {
                ledgerColumn += `${j + 1}. ${budgetDetails[j].budget_ledger_head} - ${budgetDetails[j].budget_led_head_amount}\n`;
            }
              exportData.push({
                'Financial Year': data[i].fin_year,
                'Project': data[i].project_name,
                'Budget Amount': data[i].budget_amount,
                'Ledger Details': ledgerColumn.trim() 
              })
            
          }
  
          const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);
          const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
          const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  
          const excelData: Blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
          const downloadLink: any = document.createElement('a');
          downloadLink.href = window.URL.createObjectURL(excelData);
          let date = new Date()
          downloadLink.download = `Budget-detail-${date.getMonth() + 1}-${date.getFullYear()}.xlsx`;
          downloadLink.click();
        }
      })
    }
    formatDate(date: Date): string {
      const dd = date.getDate().toString().padStart(2, '0');
      const mm = (date.getMonth() + 1).toString().padStart(2, '0');
      const yy = date.getFullYear().toString();
      return `${dd}-${mm}-${yy}`;
    }
}
