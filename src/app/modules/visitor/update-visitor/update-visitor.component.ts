import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { timer, map, share, Subscription } from 'rxjs';
import decode from 'jwt-decode';
import { EncrypterService } from 'src/app/shared/services/encrypter.service';
import { SessionService } from 'src/app/shared/services/session.service';
import { EmployeeService } from '../../employee/employee.service';
import { VisitorService } from '../visitor.service';
import { ActivatedRoute, Router } from '@angular/router';
declare var $: any;

@Component({
  selector: 'app-update-visitor',
  templateUrl: './update-visitor.component.html',
  styleUrls: ['./update-visitor.component.css']
})
export class UpdateVisitorComponent {
  showSidebar: boolean = true;
  showPicture = false;
  token: any = '';
  formattedDateTime:any;
  product_type: any;
  employeeNames: string[] = [];
  update_visitor_data:any=[];
  employee_data: any = [];
  tp_account_id: any = '';
  NewTime:any=[];
  basic_detail_form : FormGroup;
  dropdownList = [];
  selectedItems = [];
  imageDataUrl:any;
  time = new Date();
  selectedCardIds:any;
  imageUrl:any;
  rxTime = new Date();
  visitor_card_data:any=[];
  visitorData: any=[];
  imageDataShort:any;
  intervalId;
  videoStream: MediaStream | null = null; 
  visitor_data:any=[];
  selectedRowsParams:any=[];
  subscription: Subscription;
  dropdownSettings = {};
  constructor(
    private _formBuilder: FormBuilder,
    private _EncrypterService: EncrypterService,
    private _SessionService: SessionService,
    private _VisitorService: VisitorService,
    private _EmployeeService: EmployeeService,
    public toastr: ToastrService,
    private router: Router,
  ) {
    if (this.router.getCurrentNavigation()?.extras.state) {
      const state = this.router.getCurrentNavigation().extras.state;
      this.selectedRowsParams = state.selectedRowsParams;
      console.log(this.selectedRowsParams);
    }
  }

  ngOnInit() {

    let session_obj_d: any = JSON.parse(this._SessionService.get_user_session());
    this.token = decode(session_obj_d.token);
    this.tp_account_id = this.token.tp_account_id;
    this.product_type = this.token.product_type;
 
    this.intervalId = setInterval(() => {
      this.time = new Date();
  }, 1000);
  
  // Using RxJS Timer
  this.subscription = timer(0, 1000)
      .pipe(
          map(() => new Date()),
          share()
      )
      .subscribe(time => {
          let hour = this.rxTime.getHours();
          let minutes = this.rxTime.getMinutes();
          let seconds = this.rxTime.getSeconds();
          this.NewTime = this.pad(hour) + ":" + this.pad(minutes) + ":" + this.pad(seconds);
          this.rxTime = time;
      });
  
    // console.log(this.rxTime);
    this.basic_detail_form = this._formBuilder.group({
      p_visitor_name: ['', [Validators.required, Validators.pattern('^[a-zA-Z ]+$')]],
      p_visitor_last_name: ['', [Validators.required, Validators.pattern('^[a-zA-Z ]+$')]],
      p_visitor_email: ['', [
        Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-z]{2,4}$'),
      ]],
      p_visitor_mobile: ['', [Validators.required,
      Validators.pattern('^[6-9]{1}[0-9]{9}$'),
      Validators.minLength(10),
      Validators.maxLength(10),]],
      p_visit_date_time: [''],
      p_person_to_meet: ['', [Validators.required]],
      p_purpose_of_visit: ['', [Validators.required]],
      p_assign_visiting_card: [this.selectedItems, [Validators.required]],

      p_address1: ['', [Validators.required]],
      p_address2: ['', [Validators.required]],

      p_city: ['', [Validators.required]],
      p_state: ['', [Validators.required]],

      p_country: ['', [Validators.required]],
      p_pincode: ['', [Validators.required]],
      p_identity_details:['']
    });
    this.intervalId = setInterval(() => {
      this.time = new Date();
  }, 1000);
  
  // Using RxJS Timer
  this.subscription = timer(0, 1000)
      .pipe(
          map(() => new Date()),
          share()
      )
      .subscribe(time => {
          let hour = this.rxTime.getHours();
          let minutes = this.rxTime.getMinutes();
          let seconds = this.rxTime.getSeconds();
          this.NewTime = this.pad(hour) + ":" + this.pad(minutes) + ":" + this.pad(seconds);
          this.rxTime = time;
      });
    // console.log(this.selectedRowsParams?.assign_visiting_card1.split(',').map(card => ({ item_text: card })));
    this.dropdownSettings = {
      singleSelection: false,
      primaryKey: 'item_id',
      labelKey: 'item_text',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 7,
      allowSearchFilter: true
    };
  
    this.basic_detail_form.patchValue({
      p_visitor_name: this.selectedRowsParams?.visitor_name,
      p_visitor_last_name: this.selectedRowsParams?.visitor_last_name,
      p_visitor_email: this.selectedRowsParams?.visitor_email,
      p_visitor_mobile: this.selectedRowsParams?.visitor_mobile,
      p_visit_date_time: this.selectedRowsParams?.visit_date_time ? this.selectedRowsParams.visit_date_time.substring(0, 10) : '',
      p_person_to_meet: this.selectedRowsParams?.person_to_meet,
      p_purpose_of_visit: this.selectedRowsParams?.purpose_of_visit,
      p_assign_visiting_card: this.selectedRowsParams?.assign_visiting_card,
      p_address1: this.selectedRowsParams?.address1 || '', // Add default value if the property is null
      p_address2: this.selectedRowsParams?.address2 || '',
      p_city: this.selectedRowsParams?.city || '',
      p_state: this.selectedRowsParams?.state || '',
      p_country: this.selectedRowsParams?.country || '',
      p_pincode: this.selectedRowsParams?.pincode || '',
      p_identity_details: this.selectedRowsParams?.identity_details || ''
    });
    // this.dropdownList = this.basic_detail_form.controls.p_assign_visiting_card.value;
    this.selectedItems = this.selectedRowsParams?.assign_visiting_card || [];
    this.employer_details();
    // this.convertBase64ToImage(this.selectedRowsParams.identity_details);
    this.Visiting_card_list();
  }

  pad(num) {
    return (num < 10 ? '0' : '') + num;
}
  ngOnDestroy() {
    clearInterval(this.intervalId);
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    this.stopCamera();

  }
  ngAfterViewInit() {
    setTimeout(() => {
      $('#date').datepicker({
        dateFormat: 'yy-mm-dd',
        changeMonth: true,
        changeYear: true,
      }).datepicker(); 
    }, 100);

  }

  toggle() {
    this.showSidebar = !this.showSidebar;
  }
  onItemSelect(item: any) {
    console.log(this.selectedItems);
    
    this.updateSelectedCardIds();
  }
  onSelectAll(item:any){
    console.log(this.selectedItems,item);
    console.log(this.basic_detail_form.get('p_assign_visiting_card')?.value);
    this.updateSelectedCardIds();
  }
  
  // Function to handle item deselection
  onItemDeSelect(item: any) {
    this.updateSelectedCardIds();
  }
  onDeSelectAll(item: any){
    this.updateSelectedCardIds();
  }
  // Update selected card IDs
  updateSelectedCardIds() {
    this.selectedCardIds = this.visitor_card_data.map(item => item.id).join(',');
    // console.log(this.selectedCardIds); // Log the selected card IDs
  }
  employer_details() {

    this._EmployeeService
      .employer_details({
        customeraccountid: this.tp_account_id.toString(),
        productTypeId: this.product_type,
        GeoFenceId: this.token.geo_location_id
      })
      .subscribe((resData: any) => {
        if (resData.statusCode) {
          this.employee_data = resData.commonData;
        // console.log(this.employee_data);
        const empNames = this.employee_data.map((employee: any) => employee.emp_name);
        this.employeeNames = empNames;
        }
      });
  }

  Visiting_card_list(){
    this._VisitorService.visiting_card_list({
      "p_action": "visiting_card_list",
      "p_keyword": "",
      "p_accountid": this.tp_account_id?.toString()
  
    }).subscribe((resData: any) => {
      // console.log(resData);
  
      if (resData.status) {
  
        this.visitor_card_data = resData.commonData;
        // Extract visiting card numbers and populate dropdownList array
        this.dropdownList = this.visitor_card_data.map(card => card.visiting_card_id);
      } else {
        this.visitor_card_data = [];
        this.toastr.error(resData.message);
      }
    });
  }
  setupCamera() {
    const video = document.getElementById('video') as HTMLVideoElement;
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
      .then(stream => {
        this.videoStream = stream; // Store the camera stream
        video.srcObject = stream;
      })
      .catch(err => {
        console.error('Error accessing camera:', err);
      });
  }
  takePicture() {
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;
    const video = document.getElementById('video') as HTMLVideoElement;
    const context = canvas.getContext('2d');
  
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
  
    // Convert the canvas image to a data URL
    this.imageDataUrl = canvas.toDataURL('image/jpeg');

  if (this.imageDataUrl.includes('data:,')) {
    // If it contains 'data:,' then set p_identity_details to an empty string
    this.basic_detail_form.patchValue({
        p_identity_details: ''
    });
} else {
    // Otherwise, set p_identity_details to the imageDataUrl
    this.basic_detail_form.patchValue({
        p_identity_details: this.imageDataUrl
    });
}

   this.setupCamera();
  }
  
  stopCamera() {
    const video = document.getElementById('video') as HTMLVideoElement;
    if (video.srcObject) {
      const stream = video.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      video.srcObject = null;
    }
  }
  
  update_visitor(){
    const dateTimeString =this.selectedRowsParams?.visit_date_time;
    // console.log(dateTimeString);
    const dateOnly = dateTimeString.split('T')[0];
    // console.log(dateOnly);
    const selectedDate = $('#date').val();
    // console.log(selectedDate,"Arpit");
    
    if (dateOnly === selectedDate) {
      this.formattedDateTime = dateTimeString.replace('T', ' ');
  } else {
      this.formattedDateTime = selectedDate + " " + this.NewTime;
  }
    const p_identity_details = this.imageDataUrl?.includes('data:,') ? '' : this.imageDataUrl;
      this._VisitorService.Update_visitor({
        "p_action": "update_visitor",
        "p_visitor_id":this.selectedRowsParams?.visitor_id.toString(),
        "p_visitor_name": this.basic_detail_form.get('p_visitor_name')?.value,
        "p_visitor_last_name":this.basic_detail_form.get('p_visitor_last_name')?.value,
        "p_visitor_mobile": this.basic_detail_form.get('p_visitor_mobile')?.value,
        "p_visitor_email": this.basic_detail_form.get('p_visitor_email')?.value,
        "p_visit_date_time":this.formattedDateTime,
         "p_person_to_meet":this.basic_detail_form.get('p_person_to_meet')?.value,
        "p_purpose_of_visit": this.basic_detail_form.get('p_purpose_of_visit')?.value,
        "p_assign_visiting_card":[this.basic_detail_form.get('p_assign_visiting_card')?.value].join(),
        "p_address1": this.basic_detail_form.get('p_address1')?.value,
        "p_address2": this.basic_detail_form.get('p_address2')?.value,
        "p_city": this.basic_detail_form.get('p_city')?.value,
        "p_state": this.basic_detail_form.get('p_state')?.value,
        "p_pincode":this.basic_detail_form.get('p_pincode')?.value,
        "p_country":this.basic_detail_form.get('p_country')?.value,
        "p_userby": this.tp_account_id?.toString(),
        "p_customeraccountid": this.tp_account_id?.toString(),
        "p_identity_details":p_identity_details,
        "p_ou_id":this.token.geo_location_id?.toString()
      }).subscribe((resData: any) => {
        // console.log(resData);
    
        if (resData.status) {
          this.update_visitor_data = resData.commonData;
          this.stopCamera();
          this.router.navigate(['/visitor/all_visitor']);
          this.toastr.success(resData.message);
        
        } else {
          this.update_visitor_data = [];
          this.toastr.error(resData.message)
        }
      });
  
    }

}
