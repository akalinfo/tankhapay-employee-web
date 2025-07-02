import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { BusinesSettingsService } from '../business-settings.service';
import { SessionService } from 'src/app/shared/services/session.service';
import { ToastrService } from 'ngx-toastr';
import jwtDecode from 'jwt-decode';
import { EncrypterService } from 'src/app/shared/services/encrypter.service';
import { dongleState, grooveState } from 'src/app/app.animation';
import { Router } from '@angular/router';
import { GeofencingService } from '../geofences/geofencing.service';
import { AlertService } from 'src/app/shared/_alert';
import { GlobalConstants } from 'src/app/shared/global-constants';
import { FaceCheckinService } from '../../attendance/face-checkin.service';
import * as XLSX from 'xlsx';
declare var $: any;
@Component({
  selector: 'app-organization-unit',
  templateUrl: './organization-unit.component.html',
  styleUrls: ['./organization-unit.component.css'],
  animations: [grooveState, dongleState]
})
export class OrganizationUnitComponent {
  showSidebar: boolean = true;
  decoded_token: any;
  tp_account_id: any;
  geo_fencing_list_data: any = [];
  geo_fencing_list_data_count: any;
  showSetGeofeningPopup: boolean = false
  SaveOUForm: FormGroup;
  filterSearchForm: FormGroup;
  Form_title_name: string;
  userid: any;
  Form_type: string;
  geo_fencing_json_data: any[];
  filteredGeo_fencing: any;
  PreviewGeoFencePopup: boolean = false;
  map: google.maps.Map;
  marker: google.maps.Marker;
  geo_longitude: any;
  geo_latitude: any;
  geo_radius: any;
  isMapLoaded: boolean = false;
  sso_admin_id: any = '';
  show_rest_button: boolean = false;
  dropdownSettings = {};
  empList: any = [];
  empGroup: String[][] = [];
  selectedval: any[][] = [];
  filteredData: any = [];
  currentOu: any = '';
  totalEmp: any = 0;
  pageIndex: number = 1;
  isShowEmp: boolean = false;
  OUWiseEmpList: any = [];
  removedItems: any[][] = [];



  constructor(
    private _formBuilder: FormBuilder,
    private _businesessSettingsService: BusinesSettingsService,
    private _sessionService: SessionService,
    private toastr: ToastrService,
    private _EncrypterService: EncrypterService,
    private router: Router,
    private geofenceService: GeofencingService,
    private _alertservice: AlertService,
    private _faceCheckinService: FaceCheckinService
  ) { }

  ngOnInit() {
    let session_obj = this._sessionService.get_user_session();
    let token = JSON.parse(session_obj).token;
    this.decoded_token = jwtDecode(token);
    this.tp_account_id = this.decoded_token.tp_account_id;
    this.userid = this.decoded_token.userid;

    this.sso_admin_id = this.decoded_token.sso_admin_id


    this.SaveOUForm = this._formBuilder.group({
      orgUnitName: ['', [Validators.required]],
      orgUnitAddress: ['', [Validators.required]],
      orgUnitState: ['', [Validators.required]],
      orgUnitPin: ['', [Validators.required]],
      isEnableGeofencing: [''],
      Form_type: [''],
      geoFenceId: [''],
    });

    this.filterSearchForm = this._formBuilder.group({
      search_keyword: ['', Validators.required]
    });
    this.get_geo_fencing_list();
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
  toggle() {
    this.showSidebar = !this.showSidebar;
  }
  get_geo_fencing_list() {

    let manualForm = this.filterSearchForm.value;
    let searchKeywordValue = manualForm.search_keyword;
    this._businesessSettingsService.GetGeoFencing_List({
      "customerAccountId": (this.tp_account_id).toString(),
      "action": "GetAllGeoFencingForCustomer",
      "searchKeyword": searchKeywordValue.trim(' ')
    }).subscribe((resData: any) => {
      this.geo_fencing_list_data = [];
      if (resData.statusCode) {
        if (resData.commonData == null) {
          // this.toastr.info('No data found', 'Info');
          this._alertservice.info('No data found', GlobalConstants.alert_options_autoClose);

          return;
        }
        this.geo_fencing_list_data = resData.commonData;

        for (let index = 0; index < this.geo_fencing_list_data.length; index++) {
          const element = this.geo_fencing_list_data[index];
          if (element.emp_codes) {
            this.geo_fencing_list_data[index].emp_codes = element.emp_codes ? element.emp_codes.replace(/}/g, '').replace(/{/g, '') : '';
          }
        }
        this.geo_fencing_list_data_count = this.geo_fencing_list_data.length
        this.geo_fencing_json_data = (this.geo_fencing_list_data);
        this.filteredGeo_fencing = this.geo_fencing_json_data;
        this.getEmployeeList('');
      } else {
        this.filteredGeo_fencing = this.geo_fencing_list_data = []
        this._alertservice.error(resData.message, GlobalConstants.alert_options_autoClose);
        this.geo_fencing_list_data_count = 0;
      }
    }, (error: any) => {

      this.filteredGeo_fencing = this.geo_fencing_list_data = []
      this._alertservice.error(error.error.message, GlobalConstants.alert_options_autoClose);
      this.geo_fencing_list_data_count = 0;
    })
  }

  getOuWiseEmp(user: any) {
    this.currentOu = user;
    this.totalEmp = user['emp_map'];

    let postdata = {
      action: 'emp_list',
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
        this.OUWiseEmpList = JSON.parse(this._EncrypterService.aesDecrypt(resData.commonData));
      } else {
        this.empList = [];
        this.OUWiseEmpList = [];
      }
    })
  }

  get_page(event: any) {
    console.log(event);
    this.pageIndex = event;
    this.getOuWiseEmp(this.currentOu)
  }

  search(key: any) {
    // this.invKey = key.target.value;
    // this.p = 0;
    /*this.filteredGeo_fencing = this.geo_fencing_json_data.filter(function (element: any) {
      return element.org_unit_name.toLowerCase().includes(key.target.value.toLowerCase())
    });*/
    if ((key.target.value).length > 2) {
      this.get_geo_fencing_list()
    }
    else if ((key.target.value).length < 1) {
      this.get_geo_fencing_list()
    }
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
    return (list_data.isenablegeofencing == 'Y' &&
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
    if (data.Form_type == 'add') {
      action_val = 'add';
    } else if (data.Form_type == 'update') {
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
    const confirmationMessage = "Are you sure you want to reset the geofencing radius?";
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
        // console.log(this.empList.length);
        this.selectedval = [];
        this.empGroup = [];
        this.removedItems = [];
        this.empList.map(emp => {
          if (emp.ou_id != '' && emp.ou_id != null) {
            emp.emp_name = `${emp.emp_name} - ${!emp.orgempcode ? emp.cjcode : emp.orgempcode}`;
          }
          if (emp.assigned_ou_ids) {
            emp.emp_code = { 'empCode': emp.emp_code, 'ouIds': emp.assigned_ou_ids }
          } else {
            emp.emp_code = { 'empCode': emp.emp_code, 'ouIds': '' }
          }
        })

        this.geo_fencing_list_data.forEach((element, i) => {
          if (element.emp_codes != '') {
            let emp_codes = element.emp_codes.split(',');
            emp_codes.map((code, j) => {
              const matchedEmp = this.empList.find(emp => emp.emp_code.empCode == code.trim());

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

  // onItemSelect(item: any, i: number) {
  //   // let empCode =
  //   if (!this.empGroup[i]) {
  //     this.empGroup[i] = [];
  //   }

  //   this.empGroup[i].push(item.emp_code)

  //   if (this.removedItems[i] && this.removedItems[i].length != 0) {
  //     const itemIndex = this.removedItems[i].findIndex(
  //       (obj: any) => obj.emp_code.empCode == item.emp_code.empCode
  //     );

  //     if (itemIndex > -1) {
  //       this.removedItems[i].splice(itemIndex, 1);
  //     }
  //   }
  // }
  onItemSelect(item: any, i: number) {
    if (!this.empGroup[i]) {
      this.empGroup[i] = [];
    }
    // Prevent duplicates
    if (!this.empGroup[i].some((emp: any) => emp.empCode == item.emp_code.empCode)) {
      this.empGroup[i].push(item.emp_code);
    }

    if (this.removedItems[i] && this.removedItems[i].length != 0) {
      const itemIndex = this.removedItems[i].findIndex(
        (obj: any) => obj.emp_code.empCode == item.emp_code.empCode
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
    // console.log(ou,this.empGroup[idx]);return

    if (!this.empGroup[idx] || this.empGroup[idx].length == 0) {
      return this.toastr.error("Please select employee.")
    }
    let empGroup: any = this.empGroup[idx];

    for (let i = 0; i < empGroup.length; i++) {
      let empOu: any = empGroup[i];
      let ouIdsArray = empOu.ouIds ? empOu.ouIds.split(',') : [];

      if (this.removedItems[idx]) {
        for (let i = 0; i < this.removedItems[idx].length; i++) {
          let item = this.removedItems[idx]
          for (let j = 0; j < empGroup.length; j++) {

            if (item[i].emp_code.empCode == empGroup[j].empCode) {
              let ouIdsArray = empGroup[j].ouIds.split(','); // Split ouIds into an array
              ouIdsArray = ouIdsArray.filter(id => id != ou.id); // Remove the matching ouId
              empGroup[j].ouIds = ouIdsArray.join(',');
            }
          }
        }
      } else {
        // Add the ou.id if it's not present
        //console.log(ouIdsArray);

        if (!ouIdsArray.includes(ou.id)) {
          ouIdsArray.push(ou.id);
          empOu.ouIds = ouIdsArray.join(',');
        }
      }
    }

    // if(empGroup.length ==0 ){
    //   this.selectedval[idx]=[];
    //   return this.toastr.error("Employee already mapped to this organization unit.")
    // }

    // console.log(empGroup);
    // return;

    let postData = {
      customerAccountId: this.tp_account_id.toString(),
      empouIds: empGroup,
      // geoFenceId : ou.id,
      updatedBy: this.tp_account_id.toString()
    }
    this._businesessSettingsService.updateEmployeeOuIds(postData).subscribe((resData: any) => {
      if (resData.statusCode) {
        this.toastr.success(resData.message);
        this.get_geo_fencing_list();
      } else {
        this.get_geo_fencing_list();
        this.toastr.error(resData.message);
      }
    })
  }

  setEmployeeSetting(isChecked: boolean, idx: number): any {
    if (!confirm("Are u sure enable this organization unit only for attendance and leave purposes?")) {
      let ele: any = document.getElementById('attOnly' + idx);
      if (isChecked) {
        ele.checked = false;
      } else {
        ele.checked = true;
      }
      return;
    }

    this._businesessSettingsService.attendanceOnly({
      'attendanceOnly': isChecked ? 'Y' : 'N',
      'customerAccountId': this.tp_account_id,
      'id': this.filteredGeo_fencing[idx].id
    }).subscribe((resData: any) => {
      if (resData.statusCode) {
        this.get_geo_fencing_list();
        return this.toastr.success(resData.message);
      } else {
        return this.toastr.error(resData.message);
      }

    })
  }



  downloadExcel(ou_data: any) {
    let exportData: any = [];

    for (let i = 0; i < this.empList.length; i++) {

      let emp_ouId_check = false;
      if (this.empList[i].assigned_ou_ids) {
        let ouIdArray = this.empList[i].assigned_ou_ids.split(',');
        // console.log('arr', ouIdArray);
        if (ouIdArray.includes(ou_data.id.toString())) {
          emp_ouId_check = true;
        }
      }

      exportData.push({
        "OuId": ou_data.id,
        "OuName": ou_data.org_unit_name,
        // "EmpCode": this.empList[i].emp_code,
        "EmpName": this.empList[i].emp_name,
        "Mobile": this.empList[i].mobile,
        "Email": this.empList[i].email,
        "CjCode": this.empList[i].cjcode,
        "Include": emp_ouId_check ? 'Y' : 'N',

      });
    }
    // return;


    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);
    const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

    const data: Blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const downloadLink: any = document.createElement('a');
    downloadLink.href = window.URL.createObjectURL(data);
    let date = new Date()
    downloadLink.download = `${ou_data.org_unit_name}-ou-sheet.xlsx`;
    downloadLink.click();
  }


  onFileChange(event: any, ou_data: any, index: any) {
    let fileUpload_binarystr = '';
    let fileUpload_name = '';

    const target: DataTransfer = <DataTransfer>(event.target);
    if (target.files.length !== 1) {
      this.toastr.error('Please select a single file', 'Oops!');
      return;
    }
    const reader: FileReader = new FileReader();
    reader.readAsBinaryString(target.files[0]);
    fileUpload_name = target.files[0].name;
    if (fileUpload_name.split('.')[1] !== 'xlsx') {
      this.toastr.error('Please upload a valid xlsx file', 'Oops!');
      return;
    }
    reader.onload = (e: any) => {
      const binaryContent = e.target.result;
      fileUpload_binarystr = btoa(binaryContent);
      const wb: XLSX.WorkBook = XLSX.read(binaryContent, { type: 'binary' });

      const wsname: string = wb.SheetNames[0];
      const ws: XLSX.WorkSheet = wb.Sheets[wsname];

      const data: any = XLSX.utils.sheet_to_json(ws, { header: 1 });
      // Convert rows to objects using header row
      let excelBulkAttUploadArray = data
        .filter((_, rowIndex) => rowIndex > 0)
        .map((row) => {
          const rowObj: any = {};
          data[0].forEach((key: string, idx: number) => {
            rowObj[key] = row[idx] ? row[idx].toString() : '';
          });
          return rowObj;
        });

      if (excelBulkAttUploadArray.length == 0) {
        this.toastr.error('No data found in the excel file', 'Oops!');
        return;
      }

      console.log(excelBulkAttUploadArray)


      const affectedOuIds = excelBulkAttUploadArray
        .filter(row => row.Include == 'Y' && row.OuId)
        .map(row => row.OuId);

      affectedOuIds.forEach(ouId => {
        const ouIndex = this.filteredGeo_fencing.findIndex(ou => ou.id == ouId);
        if (ouIndex !== -1) {
          this.selectedval[ouIndex] = [];
          this.empGroup[ouIndex] = [];
        }
      });

      excelBulkAttUploadArray.forEach(row => {
        if (row.Include == 'Y' && row.OuId) {
          // Find the OU index
          const ouIndex = this.filteredGeo_fencing.findIndex(ou => ou.id == row.OuId);
          if (ouIndex !== -1) {
            // Find the employee in empList by CjCode (or EmpCode if needed)
            const empObj = this.empList.find(e => e.cjcode == row.CjCode);

            if (empObj) {
              // Initialize selectedval[ouIndex] if not already
              this.selectedval[ouIndex] = this.selectedval[ouIndex] || [];
              // Avoid duplicates
              if (!this.selectedval[ouIndex].some(sel => sel.emp_code.empCode == empObj.emp_code.empCode)) {
                this.selectedval[ouIndex].push({
                  emp_code: empObj.emp_code,
                  emp_name: empObj.emp_name
                });
                // Also update empGroup for this OU
                this.empGroup[ouIndex] = this.empGroup[ouIndex] || [];
                if (!this.empGroup[ouIndex].some((e: any) => e.empCode == empObj.emp_code.empCode)) {
                  this.empGroup[ouIndex].push(empObj.emp_code);
                }
                // Optionally, trigger your select logic
                this.onItemSelect({ emp_code: empObj.emp_code, emp_name: empObj.emp_name }, ouIndex);
              }
            }
          }
        }
      });


      const fileInput = document.getElementById("fileInput" + index) as HTMLInputElement;
      fileInput.value = '';

    };
  }

  triggerFileInput() {
    const fileInput = document.getElementById('fileInput9999') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }

  selectedOUsIndexForExcel: any = [];

  checkEmployeeAll(e: any) {
    this.selectedOUsIndexForExcel = [];
    if (e.target.checked) {
      for (let i = 0; i < this.filteredGeo_fencing.length; i++) {
        this.selectedOUsIndexForExcel.push(i);
      }
      $('input[name="checkempAll"]').prop('checked', true);


    } else {
      this.selectedOUsIndexForExcel = [];
      $('input[name="checkempAll"]').prop('checked', false);

    }
  }

  checkEmployee(e: any, index: any) {
    let findIndex = this.selectedOUsIndexForExcel.findIndex((ouIndex: any) => ouIndex == index);
    if (e.target.checked) {
      if (findIndex == -1) {
        this.selectedOUsIndexForExcel.push(index);

        if (this.selectedOUsIndexForExcel.length == this.filteredGeo_fencing.length) {
          $('input[name="checkempAll"]').prop('checked', true);
        }
      }
    } else {
      if (findIndex != -1) {
        this.selectedOUsIndexForExcel.splice(findIndex, 1);
      }
      if (this.selectedOUsIndexForExcel.length == 0) {
        $('input[name="checkempAll"]').prop('checked', false);
      }
    }
  }

  closeCheckedEmp() {
    $('input[name="checkemp"]').prop('checked', false);
    $('input[name="checkempAll"]').prop('checked', false);

    const fileInput = document.getElementById("fileInput9999") as HTMLInputElement;
    fileInput.value = '';
  }


  dowloadBulkOUExcel() {
    let exportData: any[] = [];

    // Loop through all selected OUs
    for (let i = 0; i < this.filteredGeo_fencing.length; i++) {
      if (this.selectedOUsIndexForExcel.includes(i)) {
        const ou_data = this.filteredGeo_fencing[i];

        // For each employee, check if they belong to this OU and push to exportData
        for (let j = 0; j < this.empList.length; j++) {
          let emp_ouId_check = false;
          if (this.empList[j].assigned_ou_ids) {
            let ouIdArray = this.empList[j].assigned_ou_ids.split(',');
            if (ouIdArray.includes(ou_data.id.toString())) {
              emp_ouId_check = true;
            }
          }

          exportData.push({
            "OuId": ou_data.id,
            "OuName": ou_data.org_unit_name,
            "EmpName": this.empList[j].emp_name,
            "Mobile": this.empList[j].mobile,
            "Email": this.empList[j].email,
            "CjCode": this.empList[j].cjcode,
            "Include": emp_ouId_check ? 'Y' : 'N',
          });
        }
      }
    }

    if (exportData.length === 0) {
      this.toastr.error('No data to export. Please select at least one Organization Unit.');
      return;
    }

    // Create and download the Excel file
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);
    const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

    const data: Blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const downloadLink: any = document.createElement('a');
    downloadLink.href = window.URL.createObjectURL(data);
    let date = new Date();
    downloadLink.download = `Bulk-OU-Employee-Sheet.xlsx`;
    downloadLink.click();
  }

  // saveBulkCreateGroup() {
  //   // Find all OUs that have empGroup updated (i.e., have employees selected)
  //   const affectedOuIndexes = this.empGroup
  //     .map((group, idx) => (group && group.length > 0 ? idx : -1))
  //     .filter(idx => idx !== -1);

  //   if (affectedOuIndexes.length === 0) {
  //     this.toastr.error("Please select at least one employee in any Organization Unit.");
  //     return;
  //   }

  //   // Prepare a combined empGroup array for all affected OUs
  //   let bulkEmpGroup: any[] = [];

  //   affectedOuIndexes.forEach(idx => {
  //     const ou = this.filteredGeo_fencing[idx];
  //     const empGroup = this.empGroup[idx];

  //     for (let i = 0; i < empGroup.length; i++) {
  //       let empOu: any = empGroup[i];
  //       let ouIdsArray = empOu.ouIds ? empOu.ouIds.split(',') : [];

  //       // Remove ou.id if employee was removed (check removedItems)
  //       if (this.removedItems[idx]) {
  //         for (let k = 0; k < this.removedItems[idx].length; k++) {
  //           let item = this.removedItems[idx][k];
  //           if (item.emp_code.empCode == empOu.empCode) {
  //             ouIdsArray = ouIdsArray.filter(id => id != ou.id);
  //             empOu.ouIds = ouIdsArray.join(',');
  //           }
  //         }
  //       } else {
  //         // Add the ou.id if it's not present
  //         if (!ouIdsArray.includes(ou.id.toString())) {
  //           ouIdsArray.push(ou.id.toString());
  //           empOu.ouIds = ouIdsArray.join(',');
  //         }
  //       }
  //       // Push to bulkEmpGroup (avoid duplicates)
  //       if (!bulkEmpGroup.some(e => e.empCode == empOu.empCode)) {
  //         bulkEmpGroup.push(empOu);
  //       }
  //     }
  //   });

  //   if (bulkEmpGroup.length === 0) {
  //     this.toastr.error("No employees to update.");
  //     return;
  //   }

  //   console.log(bulkEmpGroup);
  //   return;

  //   let postData = {
  //     customerAccountId: this.tp_account_id.toString(),
  //     empouIds: bulkEmpGroup,
  //     updatedBy: this.tp_account_id.toString()
  //   };

  //   this._businesessSettingsService.updateEmployeeOuIds(postData).subscribe((resData: any) => {
  //     if (resData.statusCode) {
  //       this.toastr.success(resData.message);
  //       this.get_geo_fencing_list();
  //     } else {
  //       this.get_geo_fencing_list();
  //       this.toastr.error(resData.message);
  //     }
  //   });
  // }

  saveBulkCreateGroup() {
    // Use only the selected OUs for bulk operation
    const affectedOuIndexes = this.selectedOUsIndexForExcel;

    if (!affectedOuIndexes || affectedOuIndexes.length === 0) {
      this.toastr.error("Please select at least one Organization Unit.");
      return;
    }

    // Prepare a combined empGroup array for all selected OUs
    let bulkEmpGroup: any[] = [];

    affectedOuIndexes.forEach(idx => {
      const ou = this.filteredGeo_fencing[idx];
      const empGroup = this.empGroup[idx];

      if (!empGroup || empGroup.length === 0) {
        // Optionally skip OUs with no selected employees
        return;
      }

      for (let i = 0; i < empGroup.length; i++) {
        let empOu: any = empGroup[i];
        let ouIdsArray = empOu.ouIds ? empOu.ouIds.split(',') : [];

        // Remove ou.id if employee was removed (check removedItems)
        if (this.removedItems[idx]) {
          for (let k = 0; k < this.removedItems[idx].length; k++) {
            let item = this.removedItems[idx][k];
            if (item.emp_code.empCode == empOu.empCode) {
              ouIdsArray = ouIdsArray.filter(id => id != ou.id);
              empOu.ouIds = ouIdsArray.join(',');
            }
          }
        } else {
          // Add the ou.id if it's not present
          if (!ouIdsArray.includes(ou.id.toString())) {
            ouIdsArray.push(ou.id.toString());
            empOu.ouIds = ouIdsArray.join(',');
          }
        }
        // Push to bulkEmpGroup (avoid duplicates)
        if (!bulkEmpGroup.some(e => e.empCode == empOu.empCode)) {
          bulkEmpGroup.push(empOu);
        }
      }
    });

    if (bulkEmpGroup.length === 0) {
      this.toastr.error("No employees to update.");
      return;
    }

    // console.log(bulkEmpGroup);
    // return;

    let postData = {
      customerAccountId: this.tp_account_id.toString(),
      empouIds: bulkEmpGroup,
      updatedBy: this.tp_account_id.toString()
    };

    this._businesessSettingsService.updateEmployeeOuIds(postData).subscribe((resData: any) => {
      if (resData.statusCode) {
        this.toastr.success(resData.message);
        this.closeCheckedEmp();
        this.get_geo_fencing_list();
      } else {
        this.get_geo_fencing_list();
        this.toastr.error(resData.message);
      }
    });
  }

}
