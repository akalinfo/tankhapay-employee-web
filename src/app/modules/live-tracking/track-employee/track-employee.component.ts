import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { EncrypterService } from 'src/app/shared/services/encrypter.service';
import { SessionService } from 'src/app/shared/services/session.service';
import { dongleState, grooveState } from 'src/app/app.animation';
import jwtDecode from 'jwt-decode';
import { GlobalConstants } from 'src/app/shared/global-constants';
import { AlertService } from 'src/app/shared/_alert';
import { GeofencingService } from '../../business-settings/geofences/geofencing.service';
import { LiveTrackingService } from '../live-tracking.service';
declare var $: any;
@Component({
  selector: 'app-track-employee',
  templateUrl: './track-employee.component.html',
  styleUrls: ['./track-employee.component.css']
})
export class TrackEmployeeComponent {
  EmpCode_dec: any;
  showSidebar: boolean;
  empEventDetails_data: any;
  decoded_token: any;
  tp_account_id: any;
  userid: any;
  sso_admin_id: any;
  product_type: string;
  selectedDate: string = '';
  formattedDate: string = '';
  trackEmployee_Form: FormGroup;
  emp_name: any;
  designation: any;
  mobile: any;
  profile_photo: any;
  emp_email: any;
  empEventListing: any = [];
  empEventTrackingDetails_data: any = [];
  loadmapDiv: boolean = false;
  hoursAgo: number;

  constructor(
    private _sessionService: SessionService,
    private toastr: ToastrService,
    private _EncrypterService: EncrypterService,
    private router: ActivatedRoute,
    private geofenceService: GeofencingService,
    private liveTrackingService: LiveTrackingService,
    private _formBuilder: FormBuilder
  ) {
    this.router.params.subscribe((params: any) => {
      this.EmpCode_dec = this._EncrypterService.aesDecrypt(params['EmpCode']);
    });
  }
  map: any;
  waypoints = [];
  ngOnInit(): void {
    let session_obj = this._sessionService.get_user_session();
    let token = JSON.parse(session_obj).token;
    this.decoded_token = jwtDecode(token);
    this.tp_account_id = this.decoded_token.tp_account_id;
    this.userid = this.decoded_token.userid;
    this.product_type = localStorage.getItem('product_type');
    this.sso_admin_id = this.decoded_token.sso_admin_id
    this.trackEmployee_Form = this._formBuilder.group({
      CurrentDate: ['', [Validators.required]]
    });
    console.log($('#CurrentDate').val(), 'aaa');
  }
  toggle() {
    this.showSidebar = !this.showSidebar;
  }
  ngAfterViewInit() {
    const currentDate = new Date();
    setTimeout(() => {
      $('#CurrentDate').datepicker({
        dateFormat: 'dd/mm/yy',
        changeMonth: true,
        changeYear: true,
      }).datepicker('setDate', currentDate);
      this.get_EmployeeEventDetails($('#CurrentDate').val());
    }, 500);
  }
  searchTrackEmployee() {
    const CurrentDate = $('#CurrentDate').val();
    console.log(CurrentDate);
    this.get_EmployeeEventDetails(CurrentDate);
  }
  get_EmployeeEventDetails(CurrentDate: any) {
    this.liveTrackingService.GetEmpEventLiveTrackingDetails({
      "productTypeId": (this.product_type).toString(),
      "customerAccountId": (this.tp_account_id).toString(),
      "empCode": this.EmpCode_dec.toString(),
      "timelineDate": CurrentDate,
      "actionType": "EmployeeEventDetails",
    }).subscribe((resData: any) => {
      if (resData.statusCode) {
        this.empEventDetails_data = JSON.parse(this._EncrypterService.aesDecrypt(resData.commonData));
        this.emp_name = this.empEventDetails_data[0].emp_name;
        this.designation = this.empEventDetails_data[0].designation;
        this.mobile = this.empEventDetails_data[0].mobile;
        this.emp_email = this.empEventDetails_data[0].emp_email;
        if(this.empEventDetails_data[0].profile_photo !== ''){
          this.profile_photo = this.empEventDetails_data[0].profile_photo;
        }else{
          if(this.empEventDetails_data[0].gender === "Male"){
            this.profile_photo = 'assets/img/user-8.jpg';
          }else if(this.empEventDetails_data[0].gender === "Female"){
            this.profile_photo = 'assets/img/user-2.jpg';
          }else{
            this.profile_photo = 'assets/img/old2-user-1.jpg';
          }
        }
        this.empEventListing = this.empEventDetails_data[0].events;
      } else {
        this.emp_name = '';
        this.designation = '';
        this.mobile = '';
        this.emp_email = '';
        this.profile_photo = '';
        this.empEventListing = []
        this.toastr.error(resData.message);
      }
    });
  }

  trackEvent(trackEventId: any) {
    this.loadmapDiv = true;
    this.get_EmployeeEventTrackingDetails($('#CurrentDate').val(), trackEventId)


  }
  get_EmployeeEventTrackingDetails(CurrentDate: any, eventId: any) {
    this.liveTrackingService.GetEmpEventLiveTrackingDetails({
      "productTypeId": (this.product_type).toString(),
      "customerAccountId": (this.tp_account_id).toString(),
      "empCode": this.EmpCode_dec.toString(),
      "timelineDate": CurrentDate,
      "eventId": eventId,
      "actionType": "EmployeeEventTrackingDetails",
    }).subscribe((resData: any) => {
      if (resData.statusCode) {
        this.empEventTrackingDetails_data = JSON.parse(this._EncrypterService.aesDecrypt(resData.commonData));
        this.empEventTrackingDetails_data.forEach(data => {
          this.waypoints.push({
            lat: parseFloat(data.tracking_latitude),
            lng: parseFloat(data.tracking_longitude)
          });
        });
        this.geofenceService.loadGoogleMapsScript().then(() => {
          this.initMap();
        }).catch(error => {
          console.error('Failed to load Google Maps API:', error);
        });
        console.log(this.waypoints, 'hello');
      } else {

        this.toastr.error(resData.message);
      }
    });
  }



  initMap() {

    this.map = new google.maps.Map(document.getElementById("map"), {
      center: this.waypoints[0],
      zoom: 4
    });

    const directionsService = new google.maps.DirectionsService();
    const directionsRenderer = new google.maps.DirectionsRenderer({ map: this.map });

    const waypoints = this.waypoints.map(point => ({
      location: new google.maps.LatLng(point.lat, point.lng),
      stopover: true
    }));

    const request = {
      origin: waypoints[0].location,
      destination: waypoints[waypoints.length - 1].location,
      waypoints: waypoints.slice(1, waypoints.length - 1),
      travelMode: google.maps.TravelMode.DRIVING
    };

    directionsService.route(request, (result, status) => {
      if (status === google.maps.DirectionsStatus.OK) {
        directionsRenderer.setDirections(result);
      } else {
        console.error("Directions request failed due to " + status);
      }
    });
  }

  calculateHoursAgo(datetime: string): number {
    const givenDate = new Date(datetime);
    const currentDate = new Date();

    const diffInMilliseconds = currentDate.getTime() - givenDate.getTime();
    const diffInHours = diffInMilliseconds / (1000 * 60 * 60);

    return diffInHours;
  }


}
