import { Component } from '@angular/core';
import { SessionService } from 'src/app/shared/services/session.service';
import { ToastrService } from 'ngx-toastr';
import jwtDecode from 'jwt-decode';
import { EncrypterService } from 'src/app/shared/services/encrypter.service';
import { dongleState, grooveState } from 'src/app/app.animation';
import { Router } from '@angular/router';
import { AlertService } from 'src/app/shared/_alert';
import { GlobalConstants } from 'src/app/shared/global-constants';
import { FaceCheckinService } from '../../attendance/face-checkin.service';
import { EmployeeService } from '../../employee/employee.service';
import { catchError, debounceTime, map, Observable, of, Subject, switchMap } from 'rxjs';
import { UserMgmtService } from '../user-mgmt.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-project-master',
  templateUrl: './project-master.component.html',
  styleUrls: ['./project-master.component.css'],
  animations: [grooveState, dongleState]
})
export class ProjectMasterComponent {
  showSidebar: boolean = true;
  decoded_token: any;
  tp_account_id: any;
  project_master_list_data: any=[];
  project_master_data_count: any;
  project_master_json_data: any[];
  filteredproject_master: any;
  product_type: any;
  empSearchKey : string='';
  filteredEmployees: any=[];
  selectedEmp : any[]=[];
  search$ = new Subject<string>();
  loading = false;
  isAddEditProject : boolean= false;
  projectForm : FormGroup;
  dropdownSettings= {};
  isShowEmp: boolean=false;
  OUWiseEmpList: any=[];
  pageIndex :number=1;
  totalEmp : number=0;

  constructor(
    private _sessionService: SessionService,
    private toastr: ToastrService,
    private _fb : FormBuilder,
    private _alertservice: AlertService,
    private _faceCheckinService: FaceCheckinService,
    private _EncrpterService: EncrypterService,
    private _employeeService : EmployeeService,
    private _userMgmtService : UserMgmtService
  ) { 
    this.search$
    .pipe(
      debounceTime(500),
      switchMap(term => this.getEmployees(term).pipe(
        catchError(() => of([])) // Prevents errors from breaking stream
      ))
    )
    .subscribe(results => {
      this.filteredEmployees = results;
      this.loading=false;
    });

    this.selectedEmp.fill([]);
  }

  ngOnInit() {
    let session_obj = this._sessionService.get_user_session();
    let token = JSON.parse(session_obj).token;
    this.decoded_token = jwtDecode(token);
    this.tp_account_id = this.decoded_token.tp_account_id;
    this.product_type = this.decoded_token.product_type;

    this.projectForm = this._fb.group({
      projectName: ['', Validators.required],
      startDate: [''],
      endDate: [''],
      projectAmount : [''],
      projectLocation : [''],
      id:[null]
    })

    this.dropdownSettings = {
      singleSelection: false,
      idField: 'emp_code',
      textField: 'emp_name',
      selectAllText: 'Select All',
      SelectAllText: 'UnSelect All',
      allowSearchFilter: true, 
      // allowRemoteDataSearch: true,     
      // searchFilter: (term: string, item: any)=> this.customSearchFilter(term, item)
   };

    this.get_project_master_list();
    
  }


  toggle() {
    this.showSidebar = !this.showSidebar;
  }
  get_project_master_list() {
    this._faceCheckinService.getemployeeList({
      "action": "mst_project_list",
      "customeraccountid": this.tp_account_id.toString(),
      "emp_code": "",
      "organization_unitid": "",
      "keyword": "",
      "fromdate": "",
      "todate": ""
    }).subscribe((resData: any) => {
      this.project_master_list_data = [];
      if (resData.statusCode) {
        if (resData.commonData == null) {
          // this.toastr.info('No data found', 'Info');
          this._alertservice.info('No data found', GlobalConstants.alert_options_autoClose);
          return;
        }
        this.project_master_list_data =  JSON.parse(this._EncrpterService.aesDecrypt(resData.commonData));
        this.project_master_data_count = this.project_master_list_data.length
        this.project_master_json_data = (this.project_master_list_data);
        this.filteredproject_master = this.project_master_json_data;
        this.getEmployees().subscribe(results => {
          this.filteredEmployees = results;
          this.filteredproject_master.forEach((project, _i) => {
            this.selectedEmp[_i] =[];
            if (project.emp_codes) {
              const empCodesArray = project.emp_codes.split(',').map(emp => emp.trim());
        // console.log(empCodesArray);
        
              // Find matching employee objects from filteredEmployees
              this.selectedEmp[_i] = this.filteredEmployees.filter(emp => 
                empCodesArray.includes(emp.emp_code)
              );
            } else {
              this.selectedEmp[_i] = [];
              // If no emp_codes, initialize with an empty array  dated. 02.05.2025
              // this.selectedEmp[project.id] = [];
            }
          });
        });
      } else {
        this.filteredproject_master = this.project_master_list_data =[]
        this._alertservice.error(resData.message, GlobalConstants.alert_options_autoClose);
        this.project_master_data_count = 0;
      }
    }, (error: any) => {
        
      this.filteredproject_master = this.project_master_list_data =[]
        this._alertservice.error(error.error.message, GlobalConstants.alert_options_autoClose);
        this.project_master_data_count = 0;
    })
  }


  getEmployees(term: string = ''): Observable<any[]> {
    this.loading = true;
    // if (term == null) {
    //   return of([]); // Return an empty array without making an API call
    // }
    return this._employeeService.employer_details({
      customeraccountid: this.tp_account_id.toString(),
      productTypeId: this.product_type,
      GeoFenceId: this.decoded_token.geo_location_id,
      ouIds: this.decoded_token.ouIds || '',
      department: '',
      designation: '',
      searchKeyword: term?term?.toString()?.trim():'',
      employeesStatus: 'Active',
      pageNo: 1,
      pageLimit: 1000
    }).pipe(
      map((resData: any) => resData.statusCode ? resData.commonData : []),  // Transform response
      catchError(() => of([]))  // Handle errors and return an empty array
    );
  }
  search(key: any) {
    // console.log(key)
    // this.invKey = key.target.value;
    // this.p = 0;
    this.filteredproject_master = this.project_master_json_data.filter(function (element: any) {
      return element.project_name.toLowerCase().includes(key.target.value.toLowerCase())
    });
  }

  updateSelectedEmp(projectId: number, selectedValues: any[]) {
    // console.log(this.selectedEmp[projectId])
    this.selectedEmp[projectId] = selectedValues.map(emp => emp.emp_code);
  }

  onItemSelect(idx: number, selectedValues: any[]){
    
    this.selectedEmp[idx].push(selectedValues);
  }
  onSelectAll(idx: number, selectedValues: any[]){
    // console.log(selectedValues)
    this.selectedEmp[idx] = selectedValues;
  }
  onUnselectAll(projectId: number, selectedValues: any[]){
    this.selectedEmp[projectId] = selectedValues;
  }
  onItemUnselect(projectId: number, selectedValues: any[]){
    this.selectedEmp[projectId] = selectedValues;
  }
  trackByProjectId(index: number, item: any): number {
    return item.id; // Assuming each project has a unique ID
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
          this.get_project_master_list();
        }else{
          this.toastr.error(resData.message);
        }
       })
  }

  showProjectModal(project:any=''){
    this.isAddEditProject = true;

    if(project){
      this.projectForm.patchValue({
        id:project.id,
        projectName : project.project_name,
        startDate : project.start_date.split('-').reverse().join('-'),
        endDate : project.end_date.split('-').reverse().join('-'),
        projectLocation : project.project_location,
        projectAmount : project.project_amount
      })
    }
    let body= document.querySelector('body');
    if(body){
      body.classList.add('modal-open')
    }
  }

  isFieldInvalid(field: string): boolean {
    return this.projectForm.get(field)?.invalid && this.projectForm.get(field)?.touched;
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

  mapEmployees(project :any,idx:number){
    // console.log(this.selectedEmp,project.id)
    let employeeValue = this.selectedEmp[idx].map(emp=> emp.emp_code);
    this._userMgmtService.manageProjects({ "action": "employee_mapping", 
      "customerAccountId": this.tp_account_id.toString(), "id": project.id,
      "employeeValue": employeeValue.toString(),"projectName": project.project_name
    }).subscribe((resData:any)=>{
          if(resData.statusCode){
            this.toastr.success(resData.message);
            this.get_project_master_list();
          }else{
            this.toastr.error(resData.message);
          }
      })
  }

  getProjectWiseEmp(project:any){
    // this.currentOu = user;
    if(project['emp_count']==0){
      return;
    }
    // console.log(project)
    this.OUWiseEmpList=project.emp_json;
    this.totalEmp =project['emp_count'];
    this.isShowEmp=true;
    // this.getEmployees().subscribe(results => {
    //   this.filteredEmployees = results;
    //   this.OUWiseEmpList = this.filteredEmployees.filter(emp=> 
    //     project.emp_codes.split(',').map(code => code.trim()).includes(emp.emp_code)
    //   );
    //   // console.log(this.filteredEmployees)
    // })
  }
  get_page(page:any){
    this.pageIndex = page;
  }

}

