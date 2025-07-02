import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BusinesSettingsService } from '../../business-settings/business-settings.service';
import { SessionService } from 'src/app/shared/services/session.service';
import { ToastrService } from 'ngx-toastr';
import jwtDecode from 'jwt-decode';
import { EncrypterService } from 'src/app/shared/services/encrypter.service';
import { dongleState, grooveState } from 'src/app/app.animation';
import { Router } from '@angular/router';
import { GeofencingService } from '../../business-settings/geofences/geofencing.service';
import { AlertService } from 'src/app/shared/_alert';
import { GlobalConstants } from 'src/app/shared/global-constants';
import { FaceCheckinService } from '../../attendance/face-checkin.service';
import { EmployeeService } from '../../employee/employee.service';

@Component({
  selector: 'app-geofence-setting',
  templateUrl: './geofence-setting.component.html',
  styleUrls: ['./geofence-setting.component.css'],
  animations: [grooveState, dongleState]
})
export class GeofenceSettingComponent {
  showSidebar: boolean = true;
  decoded_token: any;
  tp_account_id: any;
  geo_fencing_list_data: any[];
  geo_fencing_list_data_count: any;
  showSetGeofeningPopup: boolean = false
  SaveOUForm: FormGroup;
  Form_title_name: string;
  userid: any;
  Form_type: string;
  geo_fencing_json_data: any[];
  filteredGeo_fencing: any[] = [];
  PreviewGeoFencePopup: boolean = false;
  map: google.maps.Map;
  marker: google.maps.Marker;
  geo_longitude: any;
  geo_latitude: any;
  geo_radius: any;
  isMapLoaded: boolean = false;
  sso_admin_id: any = '';
  show_rest_button: boolean = false;
  empList: any = [];
  currentGS: any = '';
  totalEmp: any = 0;
  pageIndex: number = 1;
  isShowEmp: boolean = false;
  GSWiseEmpList: any = [];

  p: number = 1;
  limit: any = 50;
  total: number = 0;
  pageConfig: any;
  totalItems: number = 0;

  dropdownSettings = {};
  empGroup: String[][] = [];
  selectedval: any[][] = [];
  removedItems: any[][] = [];
  filteredData: any = [];

  constructor(
    private _formBuilder: FormBuilder,
    private _businesessSettingsService: BusinesSettingsService,
    private _sessionService: SessionService,
    private toastr: ToastrService,
    private _EncrypterService: EncrypterService,
    private router: Router,
    private geofenceService: GeofencingService,
    private _alertservice: AlertService,
    private _faceCheckinService: FaceCheckinService,
    private _EmployeeService: EmployeeService) { }

  ngOnInit() {
    let session_obj = this._sessionService.get_user_session();
    let token = JSON.parse(session_obj).token;
    this.decoded_token = jwtDecode(token);
    this.tp_account_id = this.decoded_token.tp_account_id;
    this.userid = this.decoded_token.userid;

    this.sso_admin_id = this.decoded_token.sso_admin_id

    this.get_geo_fencing_list();
    this.SaveOUForm = this._formBuilder.group({
      orgUnitName: ['', [Validators.required]],
      orgUnitAddress: ['', [Validators.required]],
      orgUnitState: ['', [Validators.required]],
      orgUnitPin: ['', [Validators.required]],
      isEnableGeofencing: [''],
      Form_type: [''],
      geoFenceId: [''],
    });
    // as discussed with client, show reset buttion in public mode
    //if (this.sso_admin_id == '6' || this.sso_admin_id == '151') {
    this.show_rest_button = true;
    //}

    this.dropdownSettings = {
      singleSelection: false,
      idField: 'emp_code',
      textField: 'emp_name',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 3,
      allowSearchFilter: true,
      //allowRemoteDataSearch: true,     
      // searchFilter: (term: string, item: any)=> this.customSearchFilter(term, item)
    };

  }
  toggle() {
    this.showSidebar = !this.showSidebar;
  }

  changePage(e: any) {
    this.limit = e.target.value;
    this.p = 1;
  }
  get_page_home(page: number): void {
    if (page < 1) {
      this.p = 1; // Prevent going below page 1
    } else {
      this.p = page;
    }

  }
  get_geo_fencing_list() {
    this._businesessSettingsService.GetGeoFencing_List({
      "customerAccountId": (this.tp_account_id).toString(),
      "action": "GetAllGeoFencingForCustomer"
    }).subscribe((resData: any) => {
      this.geo_fencing_list_data = [];
      if (resData.statusCode) {
        if (resData.commonData == null) {
          // this.toastr.info('No data found', 'Info');
          this._alertservice.info('No data found', GlobalConstants.alert_options_autoClose);

          return;
        }
        this.geo_fencing_list_data = resData.commonData;
        this.geo_fencing_list_data_count = this.geo_fencing_list_data.length
        this.geo_fencing_json_data = (this.geo_fencing_list_data);
        this.filteredGeo_fencing = this.geo_fencing_json_data;
        // console.log(this.filteredGeo_fencing);
        this.getEmployeeList('');
      } else {
        this._alertservice.error(resData.message, GlobalConstants.alert_options_autoClose);
        this.geo_fencing_list_data_count = 0
      }
    })
  }
  search(key: any) {
    // this.invKey = key.target.value;
    // this.p = 0;
    this.filteredGeo_fencing = this.geo_fencing_json_data.filter(function (element: any) {
      return element.org_unit_name.toLowerCase().includes(key.target.value.toLowerCase())
    });
    // console.log(this.filteredEmployees);
  }
  geo_fencing_byParticularId(GeoFencingData: any) {
    if (GeoFencingData.isenablegeofencing == 'Y' &&
      (GeoFencingData.geo_longitude !== '' && GeoFencingData.geo_longitude !== '0') &&
      (GeoFencingData.geo_latitude !== '' && GeoFencingData.geo_latitude !== '0') &&
      (GeoFencingData.geo_radius !== '' && GeoFencingData.geo_radius !== '0')) {
      this.router.navigate(['/business-settings/organization-unit']);
    } else {
      if (GeoFencingData.id != '' && GeoFencingData.id != undefined) {
        let GeoFencingId = GeoFencingData.id;
        this.router.navigate(['/business-settings/geofences/', this._EncrypterService.aesEncrypt(GeoFencingId.toString())]);
      } else {
        // this.toastr.info('Somthing went Wrong. Please try later.', 'Success');
        this._alertservice.info('Somthing went Wrong. Please try later.', GlobalConstants.alert_options_autoClose);
      }
    }
  }
  OpenNewOUPopup() {
    this.Form_title_name = 'Add Organization Unit';
    this.showSetGeofeningPopup = true;
    this.SaveOUForm.patchValue({
      'Form_type': 'add'
    })
  }
  OpenEditOUPopup(listDatabyID: any) {
    this.Form_title_name = 'Update Organization Unit';
    this.showSetGeofeningPopup = true;
    this.SaveOUForm.patchValue({
      'Form_type': 'update',
      'geoFenceId': listDatabyID.id,
      'orgUnitName': listDatabyID.org_unit_name,
      'orgUnitAddress': listDatabyID.org_unit_address,
      'orgUnitState': listDatabyID.org_unit_state,
      'orgUnitPin': listDatabyID.org_unit_pin,
      'isEnableGeofencing': listDatabyID.isenablegeofencing,
    })
  }

  close_OUPopup() {
    this.SaveOUForm.reset();
    this.showSetGeofeningPopup = false;
  }

  DisableLinkOptions(list_data: any): boolean {
    return (list_data.isenablegeofencing === 'Y' &&
      (list_data.geo_longitude !== '' && list_data.geo_longitude !== '0') &&
      (list_data.geo_latitude !== '' && list_data.geo_latitude !== '0') &&
      (list_data.geo_radius !== '' && list_data.geo_radius !== '0'));
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

  initMap(lat: number, lng: number, radiusData: number = 0): void {
    this.map = new google.maps.Map(document.getElementById('map'), {
      center: { lat, lng },
      zoom: 15,
    });

    this.marker = new google.maps.Marker({
      position: { lat, lng },
      map: this.map,
      title: '',
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
  ShowPreviewGeoFencePopup(list_data: any) {
    this.geo_longitude = parseFloat(list_data.geo_latitude);
    this.geo_latitude = parseFloat(list_data.geo_longitude);
    this.geo_radius = parseFloat(list_data.geo_radius);
    this.loadGoogleMapsApi()
      .then(() => {
        this.initMap(this.geo_longitude, this.geo_latitude, this.geo_radius)
      })
      .catch((error) => {
        console.error('Error occurred:', error);
      });
    this.PreviewGeoFencePopup = true
  }
  ClosePreviewPopup() {
    this.PreviewGeoFencePopup = false
  }
  SaveOrganizationUnit() {
    let data = this.SaveOUForm.value;
    // console.log(data)
    let action_val = '';
    if (data.Form_type === 'add') {
      action_val = 'add';
    } else if (data.Form_type === 'update') {
      action_val = 'update';
    }
    let geoFenceId_val = data.geoFenceId !== null && data.geoFenceId !== undefined && data.geoFenceId !== '' ? data.geoFenceId.toString() : '';
    let orgUnitName_val = data.orgUnitName.toString();
    let orgUnitAddress_val = data.orgUnitAddress.toString();
    let orgUnitState_val = data.orgUnitState.toString();
    let orgUnitPin_val = data.orgUnitPin.toString();
    let orgUnitLocation_val = data.orgUnitLocation !== null && data.orgUnitLocation !== undefined && data.orgUnitLocation !== '' ? data.orgUnitLocation : 'N/A';
    let geoLink_val = data.geoLink !== null && data.geoLink !== undefined && data.geoLink !== '' ? data.geoLink : 'https://maps.google.com/maps?ll=28.558496,77.208234&z=16&t=m&hl=en&gl=IN&mapclient=embed&cid=10702425003097553401';
    let geoLatitude_val = data.geoLatitude !== null && data.geoLatitude !== undefined && data.geoLatitude !== '' ? data.geoLatitude : 0;
    let geoLongitude_val = data.geoLongitude !== null && data.geoLongitude !== undefined && data.geoLongitude !== '' ? data.geoLongitude : 0;
    let geoRadius_val = data.geoRadius !== null && data.geoRadius !== undefined && data.geoRadius !== '' ? data.geoRadius : 0;
    let isEnableGeofencing_val = data.isEnableGeofencing !== null && data.isEnableGeofencing !== undefined && data.isEnableGeofencing !== '' && data.isEnableGeofencing !== '0' && data.isEnableGeofencing !== false && data.isEnableGeofencing !== 'N' ? 'Y' : 'N';
    this._businesessSettingsService.SaveGeoFencing({
      "customerAccountId": this.tp_account_id.toString(),
      "action": action_val,
      "geoFenceId": geoFenceId_val,
      "orgUnitName": orgUnitName_val,
      "orgUnitAddress": orgUnitAddress_val,
      "orgUnitState": orgUnitState_val,
      "orgUnitPin": orgUnitPin_val,
      "orgUnitLocation": orgUnitLocation_val,
      "geoLink": geoLink_val,
      "geoLatitude": geoLatitude_val,
      "geoLongitude": geoLongitude_val,
      "geoRadius": geoRadius_val,
      "createdBy": this.userid,
      "isEnableGeofencing": isEnableGeofencing_val,
    }).subscribe((resData: any) => {
      if (resData.statusCode) {
        if (resData.commonData == null) {
          // this.toastr.info('No data found', 'Info');
          this._alertservice.info('No data found.', GlobalConstants.alert_options_autoClose);
          return;
        }
        this.toastr.success(resData.message)
        this.SaveOUForm.reset();
        this.showSetGeofeningPopup = false;
      } else {
        this._alertservice.error(resData.message, GlobalConstants.alert_options_autoClose);
        this.SaveOUForm.reset();
        this.showSetGeofeningPopup = false;
      }
      this.get_geo_fencing_list();
    })
  }

  OpenResetOUPopup(listDatabyID: any) {
    const confirmationMessage = "Are you sure you want to disable the geofencing for change the Geo Location and radius?";
    if (window.confirm(confirmationMessage)) {
      this.SaveResetOrganizationUnit(listDatabyID);
    }
  }

  SaveResetOrganizationUnit(listDatabyID: any) {
    let data = listDatabyID;
    // return console.log(data);
    let geoFenceId_val = data.id !== null && data.id !== undefined && data.id !== '' ? data.id.toString() : '';
    let orgUnitName_val = data.org_unit_name.toString();
    let orgUnitAddress_val = data.org_unit_address.toString();
    let orgUnitState_val = data.org_unit_state.toString();
    let orgUnitPin_val = data.org_unit_pin.toString();
    let orgUnitLocation_val = 'N/A';
    let geoLink_val = '';
    let geoLatitude_val = 0;
    let geoLongitude_val = 0;
    let geoRadius_val = 0;
    let isEnableGeofencing_val = 'N';
    this._businesessSettingsService.SaveGeoFencing({
      "customerAccountId": this.tp_account_id.toString(),
      "action": 'update',
      "geoFenceId": geoFenceId_val,
      "orgUnitName": orgUnitName_val,
      "orgUnitAddress": orgUnitAddress_val,
      "orgUnitState": orgUnitState_val,
      "orgUnitPin": orgUnitPin_val,
      "orgUnitLocation": orgUnitLocation_val,
      "geoLink": geoLink_val,
      "geoLatitude": geoLatitude_val,
      "geoLongitude": geoLongitude_val,
      "geoRadius": geoRadius_val,
      "createdBy": this.userid,
      "isEnableGeofencing": isEnableGeofencing_val,
    }).subscribe((resData: any) => {
      if (resData.statusCode) {
        if (resData.commonData == null) {
          // this.toastr.info('No data found', 'Info');
          this._alertservice.info('No data found.', GlobalConstants.alert_options_autoClose);
          return;
        }
        this.toastr.success(resData.message)
      } else {
        this._alertservice.error(resData.message, GlobalConstants.alert_options_autoClose);
      }
      this.get_geo_fencing_list();
    })
  }

  geo_fencing_UpdateById(GeoFencingData: any) {
    if (GeoFencingData.isenablegeofencing == 'Y' &&
      (GeoFencingData.geo_longitude === '' && GeoFencingData.geo_longitude === '0') &&
      (GeoFencingData.geo_latitude === '' && GeoFencingData.geo_latitude === '0') &&
      (GeoFencingData.geo_radius === '' && GeoFencingData.geo_radius === '0')) {
      this.router.navigate(['/attendance/geofence-setting']);
    } else {
      if (GeoFencingData.id != '' && GeoFencingData.id != undefined) {
        let GeoFencingId = GeoFencingData.id;
        this.router.navigate(['/business-settings/geofences/', this._EncrypterService.aesEncrypt(GeoFencingId.toString()), this._EncrypterService.aesEncrypt('update')]);
      } else {
        // this.toastr.info('Somthing went Wrong. Please try later.', 'Success');
        this._alertservice.info('Somthing went Wrong. Please try later.', GlobalConstants.alert_options_autoClose);
      }
    }
  }

  getGSWiseEmp(user: any) {
    this.currentGS = user;
    this.totalEmp = user['geofencing_emp_map'];

    let postdata = {
      action: 'emp_list_geofence',
      customeraccountid: this.tp_account_id.toString(),
      organization_unitid: user['id'],
      emp_code: '',
      keyword: '',
      fromdate: '',
      todate: '',
      pagesize: 10,
      index: this.pageIndex - 1
    }
    this.isShowEmp = true;
    this._faceCheckinService.getemployeeList(postdata).subscribe((resData: any) => {
      if (resData.statusCode) {
        this.GSWiseEmpList = JSON.parse(this._EncrypterService.aesDecrypt(resData.commonData));
      } else {
        this.empList = [];
        this.GSWiseEmpList = [];
      }
    })
  }

  get_page(event: any) {
    this.pageIndex = event;
    this.getGSWiseEmp(this.currentGS)
  }

  onFilterChange(event: any) {
    if (event.length < 3) {
      this.filteredData = this.empList;
      return;
    }
    let postdata = {
      action: 'emp_ou_list',
      customeraccountid: this.tp_account_id.toString(),
      organization_unitid: this.decoded_token.geo_location_id,
      emp_code: '',
      keyword: event,
      fromdate: '',
      todate: ''
    }

    this._faceCheckinService.getemployeeList(postdata).subscribe((resData: any) => {
      if (resData.statusCode) {
        this.filteredData = JSON.parse(this._EncrypterService.aesDecrypt(resData.commonData));
        this.filteredData.map(emp => {

          if (emp.ou_id != '' && emp.ou_id != null) {
            emp.emp_name = `${emp.emp_name} - ${!emp.orgempcode ? emp.cjcode : emp.orgempcode} ( ${emp.org_unit_name})`;
          }
        })
      } else {
        this.filteredData = [];
      }
    })
  }

  getEmployeeList(key: string) {

    let postdata = {
      action: 'emp_ou_list',
      customeraccountid: this.tp_account_id.toString(),
      organization_unitid: this.decoded_token.geo_location_id,
      emp_code: '',
      keyword: key,
      fromdate: '',
      todate: ''
    }

    this._faceCheckinService.getemployeeList(postdata).subscribe((resData: any) => {
      if (resData.statusCode) {
        this.empList = JSON.parse(this._EncrypterService.aesDecrypt(resData.commonData));
        console.log(this.empList,'empList-data');
        this.selectedval = [];
        this.empGroup = [];
        this.removedItems = [];
        this.empList.map(emp => {
          if (emp.ou_id != '' && emp.ou_id != null) {
            emp.emp_name = `${emp.emp_name} - ${!emp.orgempcode ? emp.cjcode : emp.orgempcode}`;
          }
          if (emp.assigned_geofence_ids) {
            emp.emp_code = { 'empCode': emp.emp_code, 'geoFenceIdDetails': emp.assigned_geofence_ids }
          } else {
            emp.emp_code = { 'empCode': emp.emp_code, 'geoFenceIdDetails': '' }
          }
        })

        this.geo_fencing_list_data.forEach((element, i) => {
          if (element.emp_codes_geo != '') {
            let emp_codes_geo = element.emp_codes_geo.split(',');
            const cleanedArray = emp_codes_geo.map(item =>
              item.replace(/[{}]/g, '').trim()
            );
            cleanedArray.map((code, j) => {
              const matchedEmp = this.empList.find(emp => (emp.emp_code.empCode).toString() == (code.trim()).toString());

              if (matchedEmp) {
                this.selectedval[i] = this.selectedval[i] ? this.selectedval[i] : [];
                // If a match is found, update this.selectedVal[i]
                this.selectedval[i].push({
                  emp_code: matchedEmp.emp_code,
                  emp_name: matchedEmp.emp_name
                });
                this.empGroup[i] = this.empGroup[i] ? this.empGroup[i] : [];
                this.empGroup[i].push(matchedEmp.emp_code)
              }
            })
            return
          }
        });
        this.filteredData = this.empList;

      } else {
        this.empList = [];
      }
    })
  }

  onItemSelect(item: any, i: number) {
    // let empCode = 
    if (!this.empGroup[i]) {
      this.empGroup[i] = [];
    }

    this.empGroup[i].push(item.emp_code)

    if (this.removedItems[i] && this.removedItems[i].length != 0) {
      const itemIndex = this.removedItems[i].findIndex(
        (obj: any) => obj.emp_code.empCode === item.emp_code.empCode
      );

      if (itemIndex > -1) {
        this.removedItems[i].splice(itemIndex, 1);
      }
    }
  }
  onSelectAll(item: any, i: number) {

    this.empGroup[i] = item.map(emp => emp = emp.emp_code);
  }
  onUnselectAll(item: any, i: number) {
    this.empList.map(emp => {
      let removedItem = { emp_code: emp.emp_code, emp_name: emp.emp_name }
      if (this.removedItems[i]) {
        this.removedItems[i].push(removedItem);
      } else {
        this.removedItems[i] = [];
        this.removedItems[i].push(removedItem);
      }
    })
  }
  onItemUnselect(item: any, i: number) {
    // this.empGroup[i].map(emp => emp !== item.emp_code);
    // console.log(item);
    if (this.removedItems[i]) {
      this.removedItems[i].push(item);
    } else {
      this.removedItems[i] = [];
      this.removedItems[i].push(item);
    }

  }


  saveCreateGroup(ou: any, idx: any): any {
    // console.log(ou,this.empGroup[idx]);
    // return

    if (!this.empGroup[idx] || this.empGroup[idx].length == 0) {
      return this.toastr.error("Please select employee.")
    }
    let empGroup: any = this.empGroup[idx];

    for (let i = 0; i < empGroup.length; i++) {
      let empOu: any = empGroup[i];
      let ouIdsArray = empOu.geoFenceIdDetails ? empOu.geoFenceIdDetails.split(',') : [];

      if (this.removedItems[idx]) {
        for (let i = 0; i < this.removedItems[idx].length; i++) {
          let item = this.removedItems[idx]
          for (let j = 0; j < empGroup.length; j++) {

            if (item[i].emp_code.empCode == empGroup[j].empCode) {
              let ouIdsArray = empGroup[j].geoFenceIdDetails.split(','); // Split ouIds into an array
              ouIdsArray = ouIdsArray.filter(id => id != ou.id); // Remove the matching ouId
              empGroup[j].ouIds = ouIdsArray.join(',');
            }
          }
        }
      } else {

        if (!ouIdsArray.includes(ou.id)) {
          ouIdsArray.push(ou.id);
          empOu.geoFenceIdDetails = ouIdsArray.join(',');
        }
      }
    }

    let postData = {
      customerAccountId: this.tp_account_id.toString(),
      geoFenceIds: empGroup,
      // geoFenceId : ou.id,
      updatedBy: this.tp_account_id.toString()
    }
    this._businesessSettingsService.updateEmployeesGeoFenceIds(postData).subscribe((resData: any) => {
      if (resData.statusCode) {
        this.toastr.success(resData.message);
        this.get_geo_fencing_list();
      } else {
        this.get_geo_fencing_list();
        this.toastr.error(resData.message);
      }
    })
  }

}

