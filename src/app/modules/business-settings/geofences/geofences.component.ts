import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { EncrypterService } from 'src/app/shared/services/encrypter.service';
import { SessionService } from 'src/app/shared/services/session.service';
import { BusinesSettingsService } from '../business-settings.service';
import { GeofencingService } from './geofencing.service';
import { dongleState, grooveState } from 'src/app/app.animation';
import jwtDecode from 'jwt-decode';
import { GlobalConstants } from 'src/app/shared/global-constants';
import { AlertService } from 'src/app/shared/_alert';

@Component({
  selector: 'app-geofences',
  templateUrl: './geofences.component.html',
  styleUrls: ['./geofences.component.css'],
  animations: [grooveState, dongleState]
})

export class GeofencesComponent {
  GeoFencingId: any;
  Formactiontype: any;
  geo_fencing_DatabyId: any[];
  org_unit_name: any;
  org_unit_address: any;
  org_unit_state: any;
  org_unit_pin: any;
  org_unit_location: any;
  geo_link: any;
  geo_longitude: any;
  geo_latitude: any;
  geo_radius: any;
  isenablegeofencing: any;

  tp_account_id: any;
  map: google.maps.Map;
  decoded_token: any;
  SetupGeofencingForm: FormGroup;
  ShowSetGeofeningPopup: boolean = false;
  userid: any;
  currentLatByMap: any;
  currentLngByMap: any;
  clickedLat_byMap: number;
  clickedLng_byMap: number;
  isMapLoaded: boolean = false;
  selectedLocation: google.maps.LatLngLiteral = { lat: 0, lng: 0 };
  mapOptions: google.maps.MapOptions = { zoom: 8 };
  marker: google.maps.Marker;
  latitude: any;
  longitude: any;
  address: string = '';
  addressSuggestions: any[] = [];
  place_location: any = null;
  place_lat: any;
  place_lng: any;
  place_formatted_address: any;
  latitudeInput: any;
  longitudeInput: any;
  longitudelongitudeInput: any;
  chek_flag = true;
  showSidebar: boolean = true;
  iscurrentLocation: boolean = false
  isfindLocation: boolean = false

  constructor(
    private _businesessSettingsService: BusinesSettingsService,
    private _sessionService: SessionService,
    private toastr: ToastrService,
    private _EncrypterService: EncrypterService,
    private router: ActivatedRoute,
    private geofenceService: GeofencingService,
    private _formBuilder: FormBuilder,
    private route: Router,
    private _alertservice: AlertService
  ) {
    this.router.params.subscribe((params: any) => {
      this.GeoFencingId = this._EncrypterService.aesDecrypt(params['geofencingid']);
      this.Formactiontype = this._EncrypterService.aesDecrypt(params['actiontype'] ? params['actiontype'] : '');
    });
  }
  ngOnInit() {
    let session_obj = this._sessionService.get_user_session();
    let token = JSON.parse(session_obj).token;
    this.decoded_token = jwtDecode(token);
    this.tp_account_id = this.decoded_token.tp_account_id;
    this.userid = this.decoded_token.userid;
    this.SetupGeofencingForm = this._formBuilder.group({
      geoRadius: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
      orgUnitName: [''],
      orgUnitAddress: [''],
      orgUnitState: [''],
      orgUnitPin: [''],
      geoLink: [''],
      geoLongitude: [''],
      geoLatitude: [''],
      isEnableGeofencing: [''],
      orgUnitLocation: [''],
    });
    if (this.Formactiontype) {
      this.get_geoFencingdatabyId();
    }

  }
  toggle() {
    this.showSidebar = !this.showSidebar;
  }
  get_geoFencingdatabyId() {
    this._businesessSettingsService.GetGeoFencingForParticularId({
      "customerAccountId": this.tp_account_id.toString(),
      "action": "GetparticularGeoFencingDetails",
      "geoFenceId": (this.GeoFencingId).toString()
    }).subscribe((resData: any) => {
      this.geo_fencing_DatabyId = [];
      if (resData.statusCode) {
        if (resData.commonData == null) {
          // this.toastr.info('No data found', 'Info');
          this._alertservice.info('No data found', GlobalConstants.alert_options_autoClose);
          return;
        }
        this.geo_fencing_DatabyId = resData.commonData;
        let databyID = this.geo_fencing_DatabyId
        console.log(databyID, 'dddddddddd');

        this.org_unit_name = databyID[0]?.org_unit_name;
        this.org_unit_address = databyID[0]?.org_unit_address;
        this.org_unit_state = databyID[0]?.org_unit_state;
        this.org_unit_pin = databyID[0]?.org_unit_pin;
        if (this.place_formatted_address) {
          this.org_unit_location = this.place_formatted_address;
        } else {
          this.org_unit_location = databyID[0]?.org_unit_location;
        }
        this.geo_link = databyID[0]?.geo_link;
        this.geo_latitude = databyID[0]?.geo_latitude;
        this.geo_longitude = databyID[0]?.geo_longitude;
        this.geo_radius = databyID[0]?.geo_radius;
        this.isenablegeofencing = databyID[0]?.isenablegeofencing;
        if (!this.latitudeInput && !this.longitudeInput && !this.Formactiontype && !this.isfindLocation) {
          this.selectMapType('currentLocation');
        }
        console.log(this.selectedLocation, 'selectedLocation');
        console.log(this.place_location, 'place_location');
        if (this.Formactiontype && !this.iscurrentLocation && !this.isfindLocation) {
          if ((this.geo_latitude !== '' && this.geo_latitude !== '0') &&
            (this.geo_longitude !== '' && this.geo_longitude !== '0')) {
            this.currentLatByMap = this.geo_latitude;
            this.currentLngByMap = this.geo_longitude;
            this.updateLocation();
          }
        } else if (this.latitudeInput && this.longitudeInput && this.isfindLocation) {
          this.currentLatByMap = this.latitudeInput;
          this.currentLngByMap = this.longitudeInput;
        } else if (this.selectedLocation) {
          this.currentLatByMap = this.selectedLocation.lat;
          this.currentLngByMap = this.selectedLocation.lng
        }
        console.log(this.currentLatByMap, 'currentLatByMap');

        this.SetupGeofencingForm.patchValue({
          'orgUnitName': this.org_unit_name,
          'orgUnitAddress': this.org_unit_address,
          'orgUnitState': this.org_unit_state,
          'orgUnitPin': this.org_unit_pin,
          'orgUnitLocation': this.org_unit_location,
          'geoLink': this.geo_link,
          'geoLatitude': this.currentLatByMap,
          'geoLongitude': this.currentLngByMap,
          'isEnableGeofencing': this.isenablegeofencing,
          'geoRadius': this.Formactiontype ? this.geo_radius : ''
        })
      } else {
        this._alertservice.error(resData.message, GlobalConstants.alert_options_autoClose);
      }
      this.chek_flag = false;
    })
  }

  selectMapType(buttonId: any) {
    if (buttonId === 'currentLocation') {
      this.loadMapCurrentLocation();
      this.iscurrentLocation = true;
      this.isfindLocation = false;
      this.SetupGeofencingForm.patchValue({
        'geoRadius': ''
      })
    }
    // Remove 'selected' class from all buttons
    const buttons = document.querySelectorAll('.form-control');
    buttons.forEach(button => {
      button.classList.remove('selected');
    });
    // Add 'selected' class to the clicked button
    const clickedButton = document.getElementById(buttonId);
    clickedButton.classList.add('selected');
    this.chek_flag = false;
  }
  private loadGoogleMapsApi(): Promise<void> {
    if (this.isMapLoaded) {
      return Promise.resolve();
    }
    return this.geofenceService.loadGoogleMapsScript().then(
      () => {
        this.isMapLoaded = true;
      },
      (error) => {
        console.error('Error loading Google Maps API:', error);
        throw error; // rethrow the error to propagate it to the caller
      }
    );
  }

  loadMapCurrentLocation() {
    this.address = '';
    this.geofenceService.getCurrentLocation().then(
      (location) => {
        // console.log(location); 
        this.selectedLocation = location;
        // Format and patch the longitudelongitudeInput
        this.longitudelongitudeInput = `${location.lat.toFixed(6)},${location.lng.toFixed(6)}`;

        this.loadGoogleMapsApi()
          .then(() => {
            // if ((!this.geo_latitude && !this.geo_longitude) ||
            //   (this.geo_latitude === '0' && this.geo_longitude === '0')) {
            this.initMap(location.lat, location.lng, 0);

            // }
            //  else {
            //   const latitudeNumber = parseFloat(this.geo_latitude);
            //   const longitudeNumber = parseFloat(this.geo_longitude);

            //   this.longitudelongitudeInput = latitudeNumber.toString() + ',' + longitudeNumber.toString();

            //   if (!isNaN(latitudeNumber) && !isNaN(longitudeNumber)) {
            //     this.initMap(latitudeNumber, longitudeNumber, 0);
            //   } else {
            //     // this.toastr.error('Invalid latitude or longitude values.', 'Oops!');
            //     this._alertservice.error('Invalid latitude or longitude values.', GlobalConstants.alert_options_autoClose);
            //   }
            // }
            this.addMapClickListener();
          })
          .catch((error) => {
            console.error('Error occurred:', error);
          });
        console.log('loadMapCurrentLocation', this.selectedLocation);
      },
      (error) => {
        console.error('Error getting current location:', error);
      }
    );
  }

  initMap(lat: number, lng: number, radiusData: number = 0): void {
    this.map = new google.maps.Map(document.getElementById('map'), {
      center: { lat, lng },
      zoom: 15,
    });

    this.marker = new google.maps.Marker({
      position: { lat, lng },
      map: this.map,
      title: this.org_unit_name,
      draggable: true,
    });
    if (radiusData) {
      const circle = new google.maps.Circle({
        map: this.map,
        center: { lat, lng },
        radius: radiusData, // in meters
        fillColor: '#AA0000',
        fillOpacity: 0.3,
        strokeColor: '#FF0000',
        strokeOpacity: 0.8,
        strokeWeight: 2,
      });
      // console.log(circle)
    }
  }

  addMapClickListener(): void {
    // Add a click event listener to the map
    google.maps.event.addListener(this.map, 'click', (event) => {
      console.log(event)
      this.onMapClick(event.latLng);
    });
    this.marker = new google.maps.Marker({
      map: this.map,
      draggable: true,
      label: 'A',
    });
  }
  onMapClick(latLng: google.maps.LatLng): void {
    const clickedLat = latLng.lat();
    const clickedLng = latLng.lng();
    this.clickedLat_byMap = clickedLat;
    this.clickedLng_byMap = clickedLng;
    console.log('Clicked Coordinates:', clickedLat, clickedLng);
    this.updateMarkerPosition(clickedLat, clickedLng);
    this.selectedLocation = { lat: 0, lng: 0 };
  }
  updateMarkerPosition(lat: number, lng: number): void {
    // Update the marker position
    this.map.setCenter({ lat, lng });
    this.marker.setPosition({ lat, lng });
  }
  // setup data
  OpenGeoPreview() {
    if (!this.place_location) {
      this.get_geoFencingdatabyId();
    }
    this.ShowSetGeofeningPopup = true;
  }
  CloseGeoPreview() {
    this.SetupGeofencingForm.reset();
    this.ShowSetGeofeningPopup = false;
  }
  confirmFinalSubmit(): void {
    let data = this.SetupGeofencingForm.value;
    if (!data.geoRadius || data.geoRadius <= 0) {
      this.toastr.info('Please set radius before final submission.', 'Info');
      return;
    }

    const confirmationMessage =
      "Finalizing submission confirms your information is accurate. After this, no further edits are possible. Proceed with final submission?";
    if (window.confirm(confirmationMessage)) {
      // User clicked 'OK', proceed with the final submit logic
      this.FinalSubmit();
    } else {
      // User clicked 'Cancel', do nothing or handle accordingly
    }
  }
  FinalSubmit() {
    let data = this.SetupGeofencingForm.value;
    if (data.geoLongitude <= 0 && data.geoLatitude <= 0 && (data.geoRadius <= 0 || data.geoRadius === '')) {
      this.toastr.info('Data is Missing, Please Refresh Page and Setup again', 'Info');
    } else {
      this._businesessSettingsService.SaveGeoFencing({
        "customerAccountId": this.tp_account_id.toString(),
        "action": "setup",
        "geoFenceId": (this.GeoFencingId).toString(),
        "orgUnitName": data.orgUnitName.toString(),
        "orgUnitAddress": data.orgUnitAddress.toString(),
        "orgUnitState": data.orgUnitState.toString(),
        "orgUnitPin": data.orgUnitPin.toString(),
        "orgUnitLocation": data.orgUnitLocation.toString(),
        "geoLink": data.geoLink.toString(),
        "geoLongitude": data.geoLongitude,
        "geoLatitude": data.geoLatitude,
        "geoRadius": data.geoRadius,
        "createdBy": this.userid,
        "isEnableGeofencing": data.isEnableGeofencing,
      }).subscribe((resData: any) => {
        if (resData.statusCode) {
          if (resData.commonData == null) {
            this.toastr.info('No data found', 'Info');
            return;
          }
          this.toastr.success(resData.message)
          this.SetupGeofencingForm.reset();
          this.ShowSetGeofeningPopup = false;
          // this.route.navigate(['/attendance/geofence-setting']);
        } else {
          this.toastr.error(resData.message, 'Oops!');
          this.SetupGeofencingForm.reset();
          this.ShowSetGeofeningPopup = false;
        }
        this.get_geoFencingdatabyId();
      })
    }
  }

  SetupGeofencingPreview() {
    let data = this.SetupGeofencingForm.value;
    // console.log(data, 'datattatatt');

    this.initMap(parseFloat(data.geoLatitude), parseFloat(data.geoLongitude), parseFloat(data.geoRadius))
    this.ShowSetGeofeningPopup = false;
  }

  onLocationChange(): void {
    if (this.address.length >= 5) {
      this.geofenceService.getPlacePredictions(this.address, 'IN').then(
        (predictions) => {
          this.addressSuggestions = predictions;
        },
        (error) => {
          console.error(error);
        }
      );
    } else {
      // Clear suggestions if the length is less than 5
      this.addressSuggestions = [];
    }
  }

  selectSuggestion(suggestion: any): void {
    this.address = suggestion.description;
    this.geocode();
  }

  geocode(): void {
    this.geofenceService.geocodeLocation(this.address, 'IN').then(
      (results) => {
        this.place_location = results[0];
        console.log(this.place_location);
        this.place_formatted_address = this.place_location.formatted_address.toString();
        this.place_lat = parseFloat(this.place_location.geometry.location.lat());
        this.place_lng = parseFloat(this.place_location.geometry.location.lng());
        this.SetupGeofencingForm.patchValue({
          'geoLatitude': this.place_lat,
          'geoLongitude': this.place_lng
        })
        this.initMap(this.place_lat, this.place_lng, 0);
        this.addressSuggestions = []; // Clear suggestions after selecting an option
      },
      (error) => {
        console.error(error);
      }
    );
  }

  findLocation() {

    if (this.longitudelongitudeInput.split(',').length === 2) {
      const lat = this.longitudelongitudeInput.split(',')[0].trim();
      const lng = this.longitudelongitudeInput.split(',')[1].trim();

      if (!lat || !lng || isNaN(Number(lat)) || isNaN(Number(lng))) {
        this._alertservice.error('Please enter valid latitude and longitude values.', GlobalConstants.alert_options_autoClose);
        return;
      }
      this.latitudeInput = Number(lat);
      this.longitudeInput = Number(lng);
      this.loadGoogleMapsApi()
        .then(() => {
          this.initMap(this.latitudeInput, this.longitudeInput, 0);
          this.isfindLocation = true;
          this.iscurrentLocation = false;
          this.SetupGeofencingForm.patchValue({
            'geoRadius': ''
          })
          // this.get_geoFencingdatabyId();
        })
        .catch((error) => {
          console.error('Error occurred:', error);
        });
      this.chek_flag = false;
    } else {
      this._alertservice.error('Please enter valid latitude and longitude values.', GlobalConstants.alert_options_autoClose);
      return;
    }


  }
  resetbutton() {
    this.chek_flag = true;
    this.longitudelongitudeInput = '';
  }

  keyPress(event: any) {
    const pattern = /[0-9]/;

    let inputChar = String.fromCharCode(event.charCode);
    if (event.keyCode != 8 && !pattern.test(inputChar)) {
      event.preventDefault();
    }
  }

  updateLocation() {

    if (this.Formactiontype &&
      (this.geo_latitude && this.geo_longitude) ||
      (this.geo_latitude !== '0' && this.geo_longitude !== '0')
    ) {
      const latitudeNumber = parseFloat(this.geo_latitude);
      const longitudeNumber = parseFloat(this.geo_longitude);
      const georadiusNumber = parseFloat(this.geo_radius);

      this.longitudelongitudeInput = latitudeNumber.toString() + ',' + longitudeNumber.toString();
      if (!isNaN(latitudeNumber) && !isNaN(longitudeNumber)) {
        this.loadGoogleMapsApi()
          .then(() => {
            this.initMap(latitudeNumber, longitudeNumber, georadiusNumber);
            this.latitudeInput = '';
            this.longitudeInput = '';
          })
          .catch((error) => {
            console.error('Error occurred:', error);
          });
      } else {
        // this.toastr.error('Invalid latitude or longitude values.', 'Oops!');
        this._alertservice.error('Invalid latitude or longitude values.', GlobalConstants.alert_options_autoClose);
      }
    }

  }

}