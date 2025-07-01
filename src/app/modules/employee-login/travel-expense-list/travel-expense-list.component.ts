import { Component, Input } from '@angular/core';
import { EmployeeLoginService } from '../employee-login.service';
import { SessionService } from 'src/app/shared/services/session.service';
import jwtDecode from 'jwt-decode';
import { ActivatedRoute } from '@angular/router';
import { EncrypterService } from 'src/app/shared/services/encrypter.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
declare var $:any;

@Component({
  selector: 'app-travel-expense-list',
  templateUrl: './travel-expense-list.component.html',
  styleUrls: ['./travel-expense-list.component.css']
})
export class TravelExpenseListComponent {
  showSidebar:boolean = true;
  decoded_token: any;
  tp_account_id:any;
  product_type:any;
  @Input() empDataFromParent:any;
  emp_code:any;
  travelExpenseForm: FormGroup;
  expenseData: any='';
  modeOfTravels:any = [];
  docTypes:any = [];
  accomodations :any=[];
  fromDate:any='';
  toDate:any='';
  statusFilter:any='';
  filteredData :any=[];
  transportationType :any=[];
  uploadDoc : any=[];

  constructor(
      private _employeeLoginService : EmployeeLoginService,
      private _sessionService : SessionService,
      private route : ActivatedRoute,
      private _encrypterService : EncrypterService,
      private _fb : FormBuilder,
      private toastr: ToastrService
    ){
      this.route.params.subscribe((param:any)=>{
        if(param['emp_code'])
        this.emp_code = this._encrypterService.aesDecrypt(param['emp_code'])
      })
    }

    ngOnInit() {
        let session_obj: any = JSON.parse(this._sessionService.get_user_session());
        this.decoded_token = jwtDecode(session_obj.token);
        this.tp_account_id = this.decoded_token.tp_account_id;
        this.product_type = localStorage.getItem('product_type');
    
        this.travelExpenseForm = this._fb.group({
       
          travelId : [''],
          transportationId : [''],
          accommodationId :[''],
          travelComment : [''],
        })
        this.getTravelExpenseDetails();
        this.getTravelMaster();
      }

    toggle() {
      this.showSidebar = !this.showSidebar;
    }


    getTravelExpenseDetails(){

      this._employeeLoginService.getTravelExpenseDetails({
        "customerAccountId": this.tp_account_id.toString(),
        "empCode": this.emp_code,
        "productTypeId": this.product_type,
        "travelId": "",
        "fromDt": this.fromDate,
        "toDt": this.toDate,
        "expFilterStatus": this.statusFilter
      }).subscribe((resData:any)=>{
        if(resData.statusCode){
          this.filteredData = JSON.parse(this._encrypterService.aesDecrypt(resData.commonData));
          console.log(this.filteredData)
        }else{
          // this.travelData = [];
          this.filteredData = [];
        }
      })
    }

    filterDataByDate(){
      if(this.fromDate && this.toDate){
        this.getTravelExpenseDetails();
      }
    }
    
    getTravelMaster(){
      this._employeeLoginService.getTravelMaster({
        "actionType": "mst_list",
        "customerAccountId": this.tp_account_id.toString(),
        "empCode": this.emp_code,
        "productTypeId": this.product_type
      }).subscribe((resData:any)=>{
        if(resData.statusCode){
          let decryptedData = JSON.parse(this._encrypterService.aesDecrypt(resData.commonData));
          console.log(decryptedData);
          
          this.modeOfTravels = decryptedData.mode_of_travel;
          this.docTypes = decryptedData.doc_type;
          this.accomodations = decryptedData.accommodation;
          this.transportationType = decryptedData.transportation
        }else{
          this.modeOfTravels=[];
          this.docTypes=[];
          this.accomodations=[];
        }
      })
    }

    showAddEditRequestModal(expense:any){
      console.log(expense);
      this.expenseData=expense;
      this.travelExpenseForm.patchValue({
        
        travelId : expense.travel_id,
        department : expense.department,
        travelComment : expense.action_comment_txt_req,
        transportationId : expense.transportation_id,
        accommodationId : expense.accommodation_id,

      })

      $('#SendMessage1981').modal('show');
    }

    hideAddEditRequestModal(){
      this.expenseData='';
      this.travelExpenseForm.reset({
        travelId : '',
        transportationId : '',
        accommodationId :'',
        department : '',
        travelComment: '',

      })
      $('#SendMessage1981').modal('hide');
    }

    readFile(event: Event,doc:any) {
      const input = event.target as HTMLInputElement;
      
      if (input.files && input.files.length > 0) {
        const file = input.files[0];
        // this.fileName = file.name;
        let fileName = file.name;
        
        const reader = new FileReader();
        reader.onload = () => {
          this.uploadDoc.push({
            docExtension : fileName.split('.')[1],
            docName: fileName.split('.')[0],
            docBase64 : reader.result.toString().split(',')[1],
            docTypeId : doc.id
          })
          // this.addLeaveRequstForm.patchValue({
          //   name : fileName,
          //   data : reader.result.toString().split(',')[1]
          // })
          // this.fileBase64 = reader.result; // Base64 result
          // console.log('Base64:', reader.result.toString().split(',')[1]);
        };
  
        reader.readAsDataURL(file);
      }
    }
  
    submitRequest(){
        this._employeeLoginService.updateTravelExpenseDetails({
          "customerAccountId": this.tp_account_id.toString(),
          "empCode": this.emp_code,
          "productTypeId": this.product_type,
          ...this.travelExpenseForm.value,
          "submittedBy": this.emp_code,
          "uploadDoc": this.uploadDoc
      }).subscribe((resData:any)=>{
        if(resData.statusCode){
          this.toastr.success(resData.message);
          this.hideAddEditRequestModal();
          this.getTravelExpenseDetails();
        }else{
          this.toastr.error(resData.message);
        }
      })
    }
}
