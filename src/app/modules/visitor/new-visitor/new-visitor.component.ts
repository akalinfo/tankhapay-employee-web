import { Component, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { EncrypterService } from 'src/app/shared/services/encrypter.service';
import { MasterServiceService } from 'src/app/shared/services/master-service.service';
import { SessionService } from 'src/app/shared/services/session.service';
import { EmployeeService } from '../../employee/employee.service';
import decode from 'jwt-decode';
import { VisitorService } from '../visitor.service';
import { Subscription, map, share, timer } from 'rxjs';
import MobileDetect from 'mobile-detect';
import { dongleState, grooveState } from 'src/app/app.animation';
declare var $: any;
@Component({
  selector: 'app-new-visitor',
  templateUrl: './new-visitor.component.html',
  styleUrls: ['./new-visitor.component.css'],
  animations: [dongleState, grooveState]
})
export class NewVisitorComponent {
  showSidebar: boolean = true;
  show_Popup:boolean =false;
  token: any = '';
  product_type: any;
  employeeNames: any = [];
  employee_data: any = [];
  tp_account_id: any = '';
  imageDataUrl:any='';
  dynamic_visitor_card: any = [];
  NewTime:any=[];
  basic_detail_form : FormGroup;
  card_Form:FormGroup;
  dropdownList = [];
  selectedItems = [];
  time = new Date();
  selectedCardIds:any;
  rxTime = new Date();
  visitor_card_data:any=[];
  intervalId;
  videoStream: MediaStream | null = null; 
  visitor_data:any=[];
  subscription: Subscription;
  dropdownSettings = {};
  isVerified : boolean =false;
  visitorData: any;
  isEnterOtp: boolean=false;
  formattedTime: string = '';
  remaining: number=0;
  timerId: any;
  currentDate: string='';
  hasBackCamera: boolean=false;
  isCameraEnabled : boolean =false;
  currentCamera: any='front';
  isCameraInitialized = false;

  constructor(
    private _formBuilder: FormBuilder,
    private _EncrypterService: EncrypterService,
    private _SessionService: SessionService,
    private _VisitorService: VisitorService,
    private _EmployeeService: EmployeeService,
    public toastr: ToastrService,
    private router: Router
  ) {
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
      
    var currentDate = new Date();

    var year = currentDate.getFullYear();
    var month = ('0' + (currentDate.getMonth() + 1)).slice(-2); // Months are zero-based, so we add 1
    var day = ('0' + currentDate.getDate()).slice(-2); // Add leading zero if day is a single digit

    // Concatenate the components to form the date string in "yyyy-mm-dd" format
    this.currentDate = year + '-' + month + '-' + day;
  
    // console.log(this.rxTime); 
    this.basic_detail_form = this._formBuilder.group({
      p_visitor_name: ['', [Validators.required, Validators.pattern('^[a-zA-Z ]+$')]],
      p_visitor_last_name: ['', [Validators.pattern('^[a-zA-Z ]+$')]],
      p_visitor_email: ['', [
        Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-z]{2,4}$'),
      ]],
      p_visitor_mobile: ['', [Validators.required,
      Validators.pattern('^[6-9]{1}[0-9]{9}$'),
      Validators.minLength(10),
      Validators.maxLength(10),]],
      otp : ['',[Validators.pattern('^[0-9]{4}$')]],
      p_visit_date_time: [this.currentDate,[Validators.required]],
      p_person_to_meet: ['', [Validators.required]],
      p_purpose_of_visit: ['', [Validators.required]],
      p_assign_visiting_card: [this.selectedItems, [Validators.required]],

      p_address1: ['', [Validators.required]],
      p_address2: [''],

      p_city: ['', [Validators.required]],
      p_state: ['', [Validators.required]],

      p_country: ['India', [Validators.required]],
      p_pincode: ['', [Validators.required]],
      p_identity_details:['']
    });
    
    this.card_Form = this._formBuilder.group({
      card_name: ['', [Validators.required]],
      card_type: ['', [Validators.required]],
      remarks: ['', [Validators.required]],
    });
    this.dropdownSettings = {
      singleSelection: false,
      idField: 'item_id',
      textField: 'item_text',
      selectAllText: '',
      unSelectAllText: '',
      itemsShowLimit: 7,
      allowSearchFilter: true,
      showSelectAll: false
    };
    this.employer_details();
    this.Visiting_card_list()
    this.checkCameraAvailability();
  }

  checkCameraAvailability() {

    const md = new MobileDetect(window.navigator.userAgent);
    console.log(md)
    if (md.mobile()) {
      this.hasBackCamera = true;
      console.log('This is a mobile device');
    } else {
      this.hasBackCamera = false;
      console.log('This is a desktop device');
    }
    navigator.mediaDevices.enumerateDevices().then(devices => {
      devices.forEach(device => {
        if (device.kind === 'videoinput') {
          console.log(device.label)
          
          if (device.label.toLowerCase().includes('back') || device.label.toLowerCase().includes('rear') || device.label.toLowerCase().includes('environment')) {
            this.hasBackCamera = true;
          }
        }
      });
    }).catch(error => {
      console.error('Error enumerating devices:', error);
    });
  }

  captureCamera(){
    this.isCameraEnabled = true;
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

  }

  getCamera(camera:any){
    this.currentCamera = camera;
    if(camera=='front'){
      this.useFrontCamera();
    }else{
      this.useBackCamera();
    }
  }
  useFrontCamera() {
    // this.captureCamera();
    this.startCamera('user');
  }

  useBackCamera() {
    // this.captureCamera();
    this.startCamera('environment');
  }

  startCamera(facingMode: 'user' | 'environment') {
    // Stop the previous camera stream, if any
    if (this.videoStream) {
      this.videoStream.getTracks().forEach(track => track.stop());
    }
    const video = document.getElementById('video') as HTMLVideoElement;
    // Get the camera stream with the specified facing mode (user or environment)
    navigator.mediaDevices.getUserMedia({
      video: { facingMode: facingMode }
    })
    .then(stream => {
      // Assign the camera stream to the video element
      this.videoStream = stream;
      video.srcObject = stream;
    })
    .catch(error => {
      console.error('Error accessing the camera:', error);
    });
  }


  get bf(){
    return this.basic_detail_form.controls;
  }

  pad(num) {
    return (num < 10 ? '0' : '') + num;
}
  ngOnDestroy() {
    clearInterval(this.intervalId);
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    if (this.videoStream) {
      this.videoStream.getTracks().forEach(track => track.stop());
    }
  }
  ngAfterViewInit() {
    const currentDate = new Date();
    setTimeout(() => {
      $('#Date').datepicker({
        dateFormat: 'yy-mm-dd',
        changeMonth: true,
        changeYear: true,
        maxDate: currentDate,
      }).datepicker(); 
    }, 100);

  }
  toggle() {
    this.showSidebar = !this.showSidebar;
  }
  keyPress(event: any) {
    const pattern = /[0-9]/;

    let inputChar = String.fromCharCode(event.charCode);
    if (event.keyCode != 8 && !pattern.test(inputChar)) {
      event.preventDefault();
    }
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
         this.employee_data.map((employee: any) =>{
          if(employee.joiningstatus.trim()=='Active' && employee.dateofrelieveing=='') {
            this.employeeNames.push({
              emp_name : employee.emp_name
            })
        }});
        // this.employeeNames = empNames.map((emp:any)=> emp.emp_name);
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
        //this.toastr.error(resData.message)
      }
    });
  }

  onItemSelect(item: any) {
        console.log(this.basic_detail_form.get('p_assign_visiting_card')?.value);
    this.updateSelectedCardIds();
  }
  
  // Function to handle item deselection
  onItemDeSelect(item: any) {
    this.updateSelectedCardIds();
  }
  
  // Update selected card IDs
  updateSelectedCardIds() {
    this.selectedCardIds = this.visitor_card_data.map(item => item.id).join(',');
    // console.log(this.selectedCardIds); // Log the selected card IDs
  }

  setupCamera() {
    const video = document.getElementById('video') as HTMLVideoElement;
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
      .then(stream => {
        this.videoStream = stream; // Store the camera stream
        video.srcObject = stream;
        this.isCameraInitialized = true;
      })
      .catch(err => {
        console.error('Error accessing camera:', err);
      });
  }

  takePicture() {
    if (!this.isCameraInitialized) {
      this.setupCamera();
    }
    this.captureCamera();
  }
  
  stopCamera() {
    const video = document.getElementById('video') as HTMLVideoElement;
    if (video.srcObject) {
      const stream = video.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      video.srcObject = null;
    }
  }

  open_popup(){
  this.show_Popup=true;
  }
  close_Popup(){
  this.show_Popup=false;
  }
  Save_visitor_card(){
    this._VisitorService.save_visitor_card({
      "p_action": "save_visitor_card",
      "card_name": this.card_Form.get('card_name')?.value,
      "card_type":this.card_Form.get('card_type')?.value || '',
      "remarks": this.card_Form.get('remarks')?.value || '',
      "p_userby": this.tp_account_id?.toString(),
      "p_customeraccountid": this.tp_account_id?.toString(),
    }).subscribe((resData: any) => {
      // console.log(resData);
      if (resData.status) {
  
        this.dynamic_visitor_card = resData.commonData;
       this.close_Popup();
       this.Visiting_card_list();
        this.toastr.success(resData.message);
      
      } else {
        this.dynamic_visitor_card = [];
        this.toastr.error(resData.message)
      }
    });


  
  }
  save_Visitor(){
    this._VisitorService.saveVisitor({
      "p_action": "save_new_visitor",
      "p_visitor_name": this.basic_detail_form.get('p_visitor_name')?.value,
      "p_visitor_last_name":this.basic_detail_form.get('p_visitor_last_name')?.value,
      "p_visitor_mobile": this.basic_detail_form.get('p_visitor_mobile')?.value,
      "p_visitor_email": this.basic_detail_form.get('p_visitor_email')?.value,
      "p_visit_date_time":$('#Date').val()+" "+this.NewTime,
       "p_person_to_meet":this.basic_detail_form.get('p_person_to_meet')?.value,
      "p_purpose_of_visit": this.basic_detail_form.get('p_purpose_of_visit')?.value,
      "p_assign_visiting_card":  [this.basic_detail_form.get('p_assign_visiting_card')?.value].join(),
      "p_userby": this.tp_account_id?.toString(),
      "p_customeraccountid": this.tp_account_id?.toString(),
      "p_identity_details":this.imageDataUrl,
  
    }).subscribe((resData: any) => {
      // console.log(resData);
  
      if (resData.status) {
  
        this.visitor_data = resData.commonData;
        this.stopCamera();
        this.router.navigate(['/visitor/all_visitor']);
        this.toastr.success(resData.message);
      
      } else {
        this.visitor_data = [];
        this.toastr.error(resData.message)
      }
    });


  }

  sendOTP():any{
    
    if(this.basic_detail_form.controls.p_visitor_mobile.value==''){
      return this.toastr.error("Please enter mobile number.");
    }
    if(this.basic_detail_form.controls.p_visitor_mobile.errors && this.basic_detail_form.controls.p_visitor_mobile.errors.pattern){
      return this.toastr.error("Invalid mobile number",'Oops!');
    }
    let postData =  {
      'mobile':this.basic_detail_form.controls.p_visitor_mobile.value,
      'customeraccountid': this.tp_account_id.toString(),
      'userby': this.token.id
    }
    this._VisitorService.send_visitor_otp(postData).subscribe((resData:any):any=>{
      if(resData.statusCode){
        this.isEnterOtp=true;
        this.resetStartTimer(60);
        return this.toastr.success(resData.message);
      }
      else{
        if(resData.commonData.r_is_mobile_verify=="true"){
          this.isVerified=true;
          this.basic_detail_form.patchValue({
            p_visitor_name : resData.commonData.r_name,
            p_visitor_last_name : resData.commonData.r_last_name,
            p_visitor_email : resData.commonData.r_email,
            p_visitor_mobile : resData.commonData.r_mobile,
            p_address1 : resData.commonData.r_add,
            p_address2 : resData.commonData.r_add2,
            p_city : resData.commonData.r_city,
            p_state : resData.commonData.r_state,
            p_pincode : resData.commonData.r_pincode
          })
          this.visitorData = resData.commonData;
          setTimeout(()=>{
            this.takePicture();
          },1000)
          return this.toastr.success(resData.message);
        }
        return this.toastr.error(resData.message);
      }
    })
  }

  verifyOtp():any{

    if(this.bf.otp.value==''){
      return this.toastr.error("Please enter OTP");
    }

    if(this.basic_detail_form.controls.otp.errors && this.basic_detail_form.controls.otp.errors.pattern){
      return this.toastr.error('Invalid OTP','Oops!');

    }
    let postData ={
      'mobile':this.basic_detail_form.controls.p_visitor_mobile.value,
      'customeraccountid': this.tp_account_id.toString(),
      'userby': this.token.id,
      'otp': this.basic_detail_form.controls.otp.value
    }
    this._VisitorService.verify_visitor_otp(postData).subscribe((resData:any):any=>{
      if(resData.statusCode){
        this.isVerified=true;
        this.isEnterOtp=false;
        this.visitorData = resData.commonData;
        this.basic_detail_form.patchValue({
          p_visitor_name: this.visitorData.r_name?.split(' ')[0],
          p_visitor_last_name: this.visitorData.r_name?.split(' ')[1],
          p_visitor_email: this.visitorData.r_email,
          p_visitor_mobile: this.visitorData.r_mobile,
        })
        setTimeout(()=>{
          this.takePicture();
        },1000)
        return this.toastr.success(resData.message);
      }else{
        
        return this.toastr.error(resData.message);
      }
    })
  }

  triggerVerifyOtp(event: KeyboardEvent){
    if (event.key === "Enter") {
      // Prevent the default form submit action
      this.verifyOtp();
    }
  }

  update_visitor():any{
    // console.log(dateTimeString);
    // console.log(dateOnly);

    // if(this.basic_detail_form.invalid){
    //   return this.toastr.error("Please fill the required fields");
    // }

    if(this.basic_detail_form.controls.p_visitor_name.value==''){
      return this.toastr.error("Please enter First Name.");
    }
    if(this.basic_detail_form.controls.p_visit_date_time.value==''){
      return this.toastr.error("Please select Visit Date.");
    }
    if(this.basic_detail_form.controls.p_person_to_meet.value==''){
      return this.toastr.error("Please select person to meet");
    }
    if(this.basic_detail_form.controls.p_visitor_mobile.value==''){
      return this.toastr.error("Please enter mobile number.");
    }
    if(this.basic_detail_form.controls.p_purpose_of_visit.value==''){
      return this.toastr.error("Please enter purpose of visit.");
    }
    if(this.basic_detail_form.controls.p_visitor_mobile.value==''){
      return this.toastr.error("Please enter mobile number.");
    }
    if(this.basic_detail_form.controls.p_assign_visiting_card.value==''){
      return this.toastr.error("Please select Visiting card.");
    }
    if(this.basic_detail_form.controls.p_address1.value==''){
      return this.toastr.error("Please enter Address.");
    }
    if(this.basic_detail_form.controls.p_city.value==''){
      return this.toastr.error("Please enter City.");
    }
    if(this.basic_detail_form.controls.p_state.value==''){
      return this.toastr.error("Please enter state.");
    }
    if(this.basic_detail_form.controls.p_country.value==''){
      return this.toastr.error("Please enter Country.");
    }
    if(this.basic_detail_form.controls.p_pincode.value==''){
      return this.toastr.error("Please enter Pincode.");
    }
    if(this.basic_detail_form.controls.p_identity_details.value==''){
      return this.toastr.error("Please click visitor photo.");
    }

    const selectedDate = $('#date').val();
    // console.log(selectedDate,"Arpit");
    let formattedDateTime = selectedDate + " " + this.NewTime;
    const p_identity_details = this.imageDataUrl?.includes('data:,') ? '' : this.imageDataUrl;
      this._VisitorService.Update_visitor({
        "p_action": "update_visitor",
        "p_visitor_id": this.visitorData.r_row_id,
        "p_visitor_name": this.basic_detail_form.get('p_visitor_name')?.value,
        "p_visitor_last_name":this.basic_detail_form.get('p_visitor_last_name')?.value,
        "p_visitor_mobile": this.basic_detail_form.get('p_visitor_mobile')?.value,
        "p_visitor_email": this.basic_detail_form.get('p_visitor_email')?.value,
        "p_visit_date_time":formattedDateTime,
         "p_person_to_meet":this.basic_detail_form.get('p_person_to_meet')?.value,
        "p_purpose_of_visit": this.basic_detail_form.get('p_purpose_of_visit')?.value,
        "p_assign_visiting_card":[this.basic_detail_form.get('p_assign_visiting_card')?.value].join(),
        "p_address1": this.basic_detail_form.get('p_address1')?.value,
        "p_address2": this.basic_detail_form.get('p_address2')?.value,
        "p_city": this.basic_detail_form.get('p_city')?.value,
        "p_state": this.basic_detail_form.get('p_state')?.value,
        "p_pincode":this.basic_detail_form.get('p_pincode')?.value,
        "p_country":this.basic_detail_form.get('p_country')?.value,
        "p_userby": this.token.id?.toString(),
        "p_customeraccountid": this.tp_account_id?.toString(),
        "p_identity_details":p_identity_details,
      }).subscribe((resData: any) => {
        // console.log(resData);
    
        if (resData.status) {
          this.stopCamera();
          this.router.navigate(['/visitor/all_visitor']);
          this.toastr.success(resData.message);
        
        } else {
          this.toastr.error(resData.message)
        }
      });
  
  }

  resetStartTimer(newRemaining: number) {
    // Clear the existing timer, if any
    clearTimeout(this.timerId);

    // Set the new remaining time
    this.remaining = newRemaining;

    // Start the timer
    this.timerTick();
  }

  timerTick() {
    this.remaining -= 1;
    if (this.remaining < 0) {
      // Timeout logic here
      this.stopTimer();

    } else {
      // Format the remaining time in "mm:ss" format
      const minutes = Math.floor(this.remaining / 60);
      const seconds = this.remaining % 60;
      // this.formattedTime = `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
      this.formattedTime = `${seconds < 10 ? '0' : ''}${seconds} seconds.`;

      // Update the timer display
      this.timerId = setTimeout(() => {
        this.timerTick();
      }, 1000);
    }
  }

  stopTimer() {
    clearTimeout(this.timerId);
    this.remaining = 0;
    this.formattedTime = '';
  }

}
