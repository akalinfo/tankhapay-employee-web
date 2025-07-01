import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import jwtDecode from 'jwt-decode';
import { ToastrService } from 'ngx-toastr';
import { SessionService } from 'src/app/shared/services/session.service';
import { ReportService } from '../../reports/report.service';
import { VisitorService } from '../../visitor/visitor.service';
import { HelpAndSupportService } from '../help-and-support.service';
declare var $: any;
import * as moment from 'moment';
@Component({
  selector: 'app-tickets',
  templateUrl: './tickets.component.html',
  styleUrls: ['./tickets.component.css']
})
export class TicketsComponent {
  showSidebar: boolean = false;
  tp_account_id: any;
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
  Create_Ticket_Form:FormGroup;
  selectedTicketStatus: string = '';
  ticketStatus:any;
  status:any;
  emp_name:any;
  emp_code:any;
  base64Data:any;
  documentName:any;
  documentType:any;
  constructor(
    private helpAndSupportService:HelpAndSupportService,
    private toastr: ToastrService,
    private _sessionService: SessionService,
    private router: Router,
    private _ReportService:ReportService,
    private _formBuilder: FormBuilder,
  ) {
   }

  
  ngOnInit() {
    let session_obj: any = JSON.parse(this._sessionService.get_user_session());
     this.decoded_token = jwtDecode(session_obj.token);
    this.tp_account_id = this.decoded_token.tp_account_id;
    this.product_type = localStorage.getItem('product_type');
    // console.log(decoded_token);
    
    this.Ticket_Form = this._formBuilder.group({
      FromDate: ['', [Validators.required]],
      ToDate: ['', [Validators.required]],
      ticketStatus:['Open']
    });

    this.Create_Ticket_Form = this._formBuilder.group({
      ticketComment: ['', [Validators.required]],
    });

    setTimeout(() => {
      this.Get_Tickets();
    }, 1000);
  }

  ngAfterViewInit() {
    setTimeout(() => {
      $('#FromDate2').datepicker({
        dateFormat: 'dd/mm/yy',
        changeMonth: true,
        changeYear: true,
      }); // Set current date as default
    }, 500);
//.datepicker('setDate', new Date())
    setTimeout(() => {
      $('#ToDate2').datepicker({
        dateFormat: 'dd/mm/yy',
        changeMonth: true,
        changeYear: true,
      })// Set current date as default
    }, 500);
    //.datepicker('setDate', new Date()); 
  }

  toggle() {
    this.showSidebar = !this.showSidebar;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      const file = input.files[0];
    this.documentName=file.name;

    if (file.size > 1048576) { // Check if file size is more than 1 MB
      this.toastr.error('Uploaded document must be less than 1 MB.', 'File Size Error');
      return;
    }

    this.documentType = file.type.split('/')[1];
    // console.log(this.documentName, this.documentType);

      if (file.type === 'image/jpeg' || file.type === 'image/jpg' || file.type === 'image/png') {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        
        reader.onload = () => {
          const base64String = reader.result as string;
          // Extract the base64 part of the string
           this.base64Data = base64String.split(',')[1];
        };

        reader.onerror = (error) => {
          console.error('File reading error: ', error);
        };
      } else {
        console.error('Invalid file type');
      }
    }
  }

  removeImage(): void {
    this.documentName = null;
    this.documentType = null;
    this.base64Data = null;
  }

  Get_Tickets(){
     this.ticketStatus = this.Ticket_Form.get('ticketStatus')?.value || ''; 
    // console.log(this.Ticket_Form.get('ticketStatus')?.value );
    

    this.helpAndSupportService.GetTickets({
      "fromDate": ($('#FromDate2').val() == '') ? '01/01/2020' : $('#FromDate2').val(),
      "toDate": ($('#ToDate2').val() == '') ? moment().format('DD/MM/YYYY') : $('#ToDate2').val(),
      "ticketStatus": this.ticketStatus,
      "orgUnitId": this.decoded_token.geo_location_id?.toString(),
      "productTypeId": this.product_type,
      "customerAccountId": this.tp_account_id?.toString()
    }).subscribe((resData: any) => {
      // console.log(resData);
      if (resData.statusCode) {
        if(this.ticketStatusMaster.length==0){

          this.ticketStatusMaster = resData.commonData.ticketStatusMaster;
        }
        this.ticketsDashboardDetails=resData.commonData.ticketsDashboardDetails;
        this.ticketsDetails = resData.commonData.ticketsDetails;
        if(this.ticketsDetails=="" || this.ticketsDetails=="undefined" || this.ticketsDetails==null){
          this.toastr.error('No Record Found','Oops!');
        }
        this.filtered_ticket_status=resData.commonData.ticketStatusMaster.filter((status: any) => status.Description !== 'All')

      } else {
        this.ticketStatusMaster = [];
        this.ticketsDashboardDetails=[];
        this.ticketsDetails =[];
        this.toastr.error(resData.message);
      }
    });

  }
  help_support_popup(ticket_json:any){
    this.ticket_id=ticket_json?.ticket_id;
    this.emp_name=ticket_json?.emp_name;
    this.emp_code=ticket_json?.emp_code;
    this.status=ticket_json?.status;
    this.GetTicket_Trail();
  }
  onClose() {
    this.Create_Ticket_Form.reset();
    this.removeImage();
  }
  GetTicket_Trail(){
    this.helpAndSupportService.GetTicketTrail({
      "ticketId": this.ticket_id,
      "productTypeId": this.product_type,
      "customerAccountId": this.tp_account_id?.toString()
    }).subscribe((resData: any) => {
      // console.log(resData);
      if (resData.statusCode) {
        this.ticket_trail_data=resData.commonData;
        // console.log(this.ticket_trail_data);
        
      } else {
        this.ticket_trail_data = [];
        this.toastr.error(resData.message);
      }
    });

  }
  getIconForDocumentType(document_type: string): string {
    if (document_type === 'pdf') {
      return 'fa fa-file-pdf-o text-danger';
    } else {
      return 'fa fa-file-image-o';
    }
  }

  CreateTicket_Trail(){
    // console.log(this.base64Data,this.documentName,this.documentType);
    if (!this.base64Data || !this.documentName || !this.documentType) {
      this.base64Data = "";
      this.documentName = "";
      this.documentType = "";
  }

    this.helpAndSupportService.CreateTicketTrail({
      "ticketId": this.ticket_id,
      "productTypeId": this.product_type,
      "customerAccountId": this.tp_account_id?.toString(),
      "empCode": this.emp_code,
      "ticketStatus":"In-progress",
      "ticketComment":this.Create_Ticket_Form.get('ticketComment')?.value||"",
      "createdBy":this.tp_account_id?.toString(),
      "document": this.base64Data || "",
      "documentName": this.documentName || "",
      "documentType": this.documentType || ""
    }).subscribe((resData: any) => {
      // console.log(resData);
      if (resData.statusCode) {
        this.create_ticket_data=resData.commonData;
        this.GetTicket_Trail()
        this.onClose();
        // console.log(this.ticket_trail_data);
        this.toastr.success(resData.message);
        
      } else {
        this.create_ticket_data = [];
        this.toastr.error(resData.message);
      }

      this.base64Data = "";
      this.documentName = "";
      this.documentType = "";
    });

  }

  UpdateTicketstatus(ticket_json:any,status:any){
    const Ticket_Id=ticket_json?.ticket_id;
    const Emp_Code=ticket_json?.emp_code;
    const status_code=status?.shortCode
    this.helpAndSupportService.UpdateTicketstatus({
      "ticketId": Ticket_Id,
      "productTypeId": this.product_type,
      "customerAccountId": this.tp_account_id?.toString(),
      "empCode": Emp_Code,
      "ticketStatus":status_code,
      "updatedBy":this.tp_account_id?.toString()
    }).subscribe((resData: any) => {
      if (resData.statusCode) {
        this.update_ticket_data=resData.commonData;
        this.Get_Tickets()
        console.log(this.update_ticket_data);
        this.toastr.success(resData.message);
        
      } else {
        this.update_ticket_data = [];
        this.toastr.error(resData.message);
      }
    });
  }

  
}
