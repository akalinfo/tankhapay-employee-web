import { Component,Input  } from '@angular/core';
import jwtDecode from 'jwt-decode';
import { ToastrService } from 'ngx-toastr'; 
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SessionService } from 'src/app/shared/services/session.service';
import { dongleState, grooveState } from 'src/app/app.animation';
import { environment } from 'src/environments/environment';
//import { EmployeeLoginService } from '../../employee-login/employee-login.service';
import { EncrypterService } from 'src/app/shared/services/encrypter.service';
import { EmployeeLoginService } from '../../employee-login/employee-login.service';


@Component({
  selector: 'app-empl-help-support',
  templateUrl: './empl-help-support.component.html',
  styleUrls: ['./empl-help-support.component.css'],
  animations : [grooveState,dongleState]
})
export class EmplHelpSupportComponent {
  showSidebar: boolean = false;
    tp_account_id: any;
    @Input() empDataFromParent: any;
    filteredEmployees:any=[];
    ticket_trail_data:any=[];
    ticketStatusMaster:any=[];
    create_ticket_data:any=[];
    ticketsDashboardDetails:any=[];
    ticketsDetails:any=[];
    update_ticket_data:any=[];
    filtered_ticket_status:any;
    decoded_token:any;
    product_type: any = '';
    ticket_id:any;
    Ticket_Form:FormGroup;
   
    selectedTicketStatus: string = '';
    ticketStatus:any;
    status:any;
    emp_name:any = '';
    emp_code:any='';
    base64Data:any = '';
    documentName:any = '';
    documentType:any = '';

    trailModalStatus :boolean = false;
    createModalStatus :boolean = false;
    ticketCategory  :any = '';
    createTicketForm:FormGroup;
    selectedTicket:'';
    base64FileData:any = '';
    fileName:any = '';
    fileType:any = '';
    queryId:any = '';
    queryTrailForm:FormGroup;
    constructor(
      private toastr: ToastrService,
      private _sessionService: SessionService,
      private _formBuilder: FormBuilder,
      private _EncrypterService:EncrypterService,
      private _EmployeeLoginService : EmployeeLoginService
     
    ) {
     }
  
    
    ngOnInit() {
      let session_obj: any = JSON.parse(this._sessionService.get_user_session());
       this.decoded_token = jwtDecode(session_obj.token);
      
      this.tp_account_id = this.decoded_token.tp_account_id;
      this.product_type = localStorage.getItem('product_type');
      
      this.Ticket_Form = this._formBuilder.group({
        FromDate: ['', [Validators.required]],
        ToDate: ['', [Validators.required]],
        ticketStatus:['all']
      });
  
      this.createTicketForm = this._formBuilder.group({
        categortType: ['', [Validators.required]],
        ticketComment: ['', [Validators.required]],
        attachImage:['']
      });

      this.queryTrailForm = this._formBuilder.group({
        ticketQueryComment : ['']
      })
  
      setTimeout(() => {
        this.getTickets();
      }, 1000);
      this.getTicketCategory();
    }
  
    ngAfterViewInit() {
      /*setTimeout(() => {
        $('#FromDate2').datepicker({
          dateFormat: 'dd/mm/yy',
          changeMonth: true,
          changeYear: true,
        }).datepicker('setDate', new Date()); // Set current date as default
      }, 500);
  
      setTimeout(() => {
        $('#ToDate2').datepicker({
          dateFormat: 'dd/mm/yy',
          changeMonth: true,
          changeYear: true,
        }).datepicker('setDate', new Date()); // Set current date as default
      }, 500); */
    }

    getTickets(){
      this.ticketsDetails = [];
      let emp_code = this.empDataFromParent.mobile + 'CJHUB' + (this.empDataFromParent.emp_code == '' ? this.empDataFromParent.js_id : this.empDataFromParent.emp_code) + 'CJHUB' + this.empDataFromParent.dob;
      let reqst ={
        "emp_code": this._EncrypterService.aesEncrypt(emp_code.toString()),
        "query_type": "Open",
        "productTypeId": this.product_type
      }
      this._EmployeeLoginService.getEmployeeSupportTicket(reqst).subscribe((resData: any) => {
        if (resData.statusCode == true) {
          let result = this._EncrypterService.aesDecrypt(resData.commonData);
          result = JSON.parse(result);
          this.ticketsDetails = result.queries;
          
        } else {
          this.ticketsDetails = [];
          this.toastr.error(resData.message, 'Oops!');
        }
      },error=>{
        this.toastr.error(error.error.message, 'Oops!');
      })
      
    }

    getTicketCategory(){
      this.ticketCategory = [];
      let emp_code = this.empDataFromParent.mobile + 'CJHUB' + (this.empDataFromParent.emp_code == '' ? this.empDataFromParent.js_id : this.empDataFromParent.emp_code) + 'CJHUB' + this.empDataFromParent.dob;
      let reqst = {
        "emp_code": this._EncrypterService.aesEncrypt(emp_code),
        "productTypeId": this.product_type
      }

      this._EmployeeLoginService.getTicketCategory(reqst).subscribe((resData: any) => {
        if (resData.statusCode == true) {
          let result = this._EncrypterService.aesDecrypt(resData.commonData);
          result = JSON.parse(result);
          this.ticketCategory = result.tickets;
          
        } else {
          this.ticketCategory = [];
          this.toastr.error(resData.message, 'Oops!');
        }
      },error=>{
        this.toastr.error(error.error.message, 'Oops!');
      })

    }

    getQueryTrail(queryId){
      this.queryId = queryId;
      this.base64Data = '';
      this.documentName = '';
      this.documentType = '';
      this.ticket_trail_data = [];
      let emp_code = this.empDataFromParent.mobile + 'CJHUB' + (this.empDataFromParent.emp_code == '' ? this.empDataFromParent.js_id : this.empDataFromParent.emp_code) + 'CJHUB' + this.empDataFromParent.dob;
      let reqst ={
        "emp_code": this._EncrypterService.aesEncrypt(emp_code.toString()),
        "query_id":this._EncrypterService.aesEncrypt(queryId.toString()),
        "productTypeId": this.product_type
      }

      this._EmployeeLoginService.getEmployeeQueryTrail(reqst).subscribe((resData: any) => {
        if (resData.statusCode == true) {
          let result = this._EncrypterService.aesDecrypt(resData.commonData);
          result = JSON.parse(result);
          this.ticket_trail_data = result.data.queries_trail;
          this.trailModalStatus = true;
        } else {
          this.ticket_trail_data = [];
          this.toastr.error(resData.message, 'Oops!');
        }
      },error=>{
        this.toastr.error(error.error.message, 'Oops!');
      })

    }

    onClose() {
      this.createTicketForm.reset();
      this.trailModalStatus = false;
    }
    
    getIconForDocumentType(document_type: string): string {
      if (document_type === 'pdf') {
        return 'fa fa-file-pdf-o text-danger';
      } else {
        return 'fa fa-file-image-o';
      }
    }

    openCreateTicket(){
      this.base64FileData = '';
      this.fileName = '';
      this.fileType = '';
      this.createModalStatus =true;
    }
    closeCreateTicket(){
      this.createModalStatus =false;
    }

    getSelectedText(event){
      const selectElement = event.target as HTMLSelectElement;
      const selectedIndex = (selectElement.selectedIndex)-1;
      this.selectedTicket = this.ticketCategory[selectedIndex]?.ticket_name || '';
     
    }
    saveTicketDetail(){
      let saveTicketPost = this.createTicketForm.value;
      if(saveTicketPost.categortType == '' || saveTicketPost.categortType == null){
        this.toastr.error('Please select ticket category', 'Oops!');
        return ;
      }
      else if(saveTicketPost.ticketComment == '' || saveTicketPost.ticketComment == null){
        this.toastr.error('Message Required', 'Oops!');
        return ;
      }
      let emp_code = this.empDataFromParent.mobile + 'CJHUB' + (this.empDataFromParent.emp_code == '' ? this.empDataFromParent.js_id : this.empDataFromParent.emp_code) + 'CJHUB' + this.empDataFromParent.dob;
        let reqst = {
          "emp_code": this._EncrypterService.aesEncrypt(emp_code.toString()),
          "created_ip": "::1",
          "subject_id": saveTicketPost.categortType,
          "subject_desc": this.selectedTicket,
          "query_comment": saveTicketPost.ticketComment,
          "document": this.base64FileData,
          "documentname": this.fileName,
          "documenttype": this.fileType,
          "productTypeId": this.product_type
        }
        

        this._EmployeeLoginService.saveTicketDetail(reqst).subscribe((resData: any) => {
          if (resData.statusCode == true) {
            this.toastr.success(resData.message, 'Success !');
            this.createTicketForm.reset();
            this.createModalStatus =false;
            this.getTickets();
            
          } else {
            this.toastr.error(resData.message, 'Oops!');
          }
        },error=>{
          this.toastr.error(error.error.message, 'Oops!');
        })
       
    }

    onFileTicketSelected(event: Event) {
      const input = event.target as HTMLInputElement;
      if (input.files && input.files.length > 0) {
        const file = input.files[0];
  
        // Validate MIME type (extra security check)
        if (!file.type.startsWith('image/')) {
          alert('Please select a valid image file.');
          input.value = ''; // Clear invalid selection
          return;
        }
  
        this.fileName = file.name;
        this.fileType = file.type;
  
        // Convert to Base64
        const reader = new FileReader();
        reader.onload = () => {
          this.base64FileData = reader.result as string;
          this.base64FileData = this.base64FileData.split(',')[1];
        };
        reader.readAsDataURL(file);
      }
    }

    onFileQueryTrailSelected(event: Event) {
      const input = event.target as HTMLInputElement;
      if (input.files && input.files.length > 0) {
        const file = input.files[0];
  
        // Validate MIME type (extra security check)
        if (!file.type.startsWith('image/')) {
          alert('Please select a valid image file.');
          input.value = ''; // Clear invalid selection
          return;
        }
        this.documentName = file.name;
        this.documentType = file.type;
        // Convert to Base64
        const reader = new FileReader();
        reader.onload = () => {
          this.base64Data = reader.result as string;
          this.base64Data = this.base64Data.split(',')[1];
          this.saveQueryTrail();
        };
        reader.readAsDataURL(file);
      }
    }
    creatQueryTrail(){
      if(this.queryTrailForm.value.ticketQueryComment == '' || this.queryTrailForm.value.ticketQueryComment == null){
        this.toastr.error('Message Required', 'Oops!');
      }
      else{
        this.saveQueryTrail();
      }
    }
    saveQueryTrail(){
      let emp_code = this.empDataFromParent.mobile + 'CJHUB' + (this.empDataFromParent.emp_code == '' ? this.empDataFromParent.js_id : this.empDataFromParent.emp_code) + 'CJHUB' + this.empDataFromParent.dob;
      
      let reqst = {
          "emp_code": this._EncrypterService.aesEncrypt(emp_code.toString()),
          "created_ip": "::1",
          "query_id": this._EncrypterService.aesEncrypt((this.queryId).toString()),
          "reply_status": "Open",
          "query_comment": this.queryTrailForm.value.ticketQueryComment,
          "document": this.base64Data,
          "documentname": this.documentName,
          "documenttype": this.documentType,
          "productTypeId": (this.product_type).toString()
      }
      this._EmployeeLoginService.saveQueryTrail(reqst).subscribe((resData: any) => {
        if (resData.statusCode == true) {
          this.toastr.success(resData.message, 'Success !');
          this.queryTrailForm.reset();
          this.getQueryTrail(this.queryId);
        } else {
          this.toastr.error(resData.message, 'Oops!');
        }
      },error=>{
        this.toastr.error(error.error.message, 'Oops!');
      })
      
    }
  
  
}
