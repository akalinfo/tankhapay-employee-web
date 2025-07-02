import { Component, OnInit, ViewChild, ElementRef, Renderer2, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import jwtDecode from 'jwt-decode';
import { ToastrService } from 'ngx-toastr';
import { dongleState, grooveState } from 'src/app/app.animation';
import { AlertService } from 'src/app/shared/_alert';
import { EncrypterService } from 'src/app/shared/services/encrypter.service';
import { SessionService } from 'src/app/shared/services/session.service';
import { EmployeeService } from '../../employee/employee.service';
import { FaceCheckinService } from '../face-checkin.service';
import { WebcamImage, WebcamInitError, WebcamUtil } from 'ngx-webcam';
import { Observable, Subject } from 'rxjs';
declare var $: any;

@Component({
  selector: 'app-face-check-list',
  templateUrl: './face-check-list.component.html',
  styleUrls: ['./face-check-list.component.css'],
  animations: [dongleState, grooveState]
})
export class FaceCheckListComponent {
  time = new Date();
  tp_account_id: any;
  product_type: any = '';
  showSidebar: boolean = true;
  decoded_token: any;
  currentDate: string;
  GeoFenceId: any
  employee_data: any = [];
  emp_json_data: any = [];
  filteredEmployees: any = [];
  invKey: any;
  p: number;
  limit: any = 50;
  showFaceCapturePopup: boolean = false;

  webcamImage: WebcamImage = null;
  showWebcam: boolean = false;
  allowCameraSwitch: boolean = true;
  multipleWebcamsAvailable: boolean = false;
  deviceId: string;
  webcamWidth: number = 200; // Adjust as needed
  webcamHeight: number = 150; // Adjust as needed
  videoOptions: MediaTrackConstraints = {
    width: { ideal: 200 }, // Adjust as needed
    height: { ideal: 150 }, // Adjust as needed
    facingMode: 'user'
  };


  errors: WebcamInitError[] = [];


  videoStream: MediaStream | null = null;

  private trigger: Subject<void> = new Subject<void>();
  private nextWebcam: Subject<boolean | string> = new Subject<boolean | string>();

  @ViewChild('modal', { static: false }) modal: ElementRef;
  emp_data_Webcam: any;
  imageDataUrl: string;
  basic_detail_form: any;
  bf: any;
  view_reg_image_path: any;
  employerNo:any;

  constructor(
    private _employeeService: EmployeeService,
    private _faceCheckinService: FaceCheckinService,
    private _sessionService: SessionService,
    private _EncrypterService: EncrypterService,
    private _formBuilder: FormBuilder,
    private toastr: ToastrService,
    private _alertservice: AlertService,
    private renderer: Renderer2

  ) { }

  ngOnInit() {

    let session_obj = this._sessionService.get_user_session();
    let token = JSON.parse(session_obj).token;
    this.decoded_token = jwtDecode(token);
    this.GeoFenceId = token.geo_location_id;
    this.employerNo = this.decoded_token.mobile;

    this.tp_account_id = this.decoded_token.tp_account_id;
    this.product_type = localStorage.getItem('product_type');

    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0'); // January is 0!
    const yy = String(today.getFullYear());

    this.currentDate = `${dd}/${mm}/${yy}`;
    this.employer_details();

    WebcamUtil.getAvailableVideoInputs()
      .then((mediaDevices: MediaDeviceInfo[]) => {
        this.multipleWebcamsAvailable = mediaDevices && mediaDevices.length > 1;
      });
    this.stopWebcam();
  }

  search(key: any) {
    this.invKey = key.target.value;
    this.p = 0;
    this.filteredEmployees = this.emp_json_data.filter(function (element: any) {
      return (element.emp_name.toLowerCase().includes(key.target.value.toLowerCase())
        || element.cjcode.toLowerCase().includes(key.target.value.toLowerCase())
      )
    });
  }
  get_page(event: any) {
    this.p = event;
  }

  toggle() {
    this.showSidebar = !this.showSidebar;
  }

  /*employer_details() {
    this._faceCheckinService
      .getemployeeList({
        action: "emp_face_list",
        customeraccountid: this.tp_account_id.toString(),
        organization_unitid: "",
        emp_code: "",
        keyword: "",
        fromdate: "",
        todate: "",
      })
      .subscribe((resData: any) => {
        if (resData.statusCode) {
          this.employee_data = JSON.parse(this._EncrypterService.aesDecrypt(resData.commonData));

          console.log(this.employee_data, 'tt');

          //this._EncrypterService.aesDecrypt(resData.commonData);
          this.emp_json_data = (this.employee_data);
          this.filteredEmployees = this.emp_json_data;
        }
      });
  }*/


    employer_details() {
      this._faceCheckinService.getemployeeHubList({
        mobileNo:this.employerNo,
          customerAccountId: this._EncrypterService.aesEncrypt(this.tp_account_id.toString()),
          productTypeId: this._EncrypterService.aesEncrypt(this.product_type.toString()),
          
        })
        .subscribe((resData: any) => {
          if (resData.statusCode) {
            this.employee_data = JSON.parse(this._EncrypterService.aesDecrypt(resData.commonData));
  
            //console.log(this.employee_data, 'tt');
  
            //this._EncrypterService.aesDecrypt(resData.commonData);
            this.emp_json_data = (this.employee_data);
            this.filteredEmployees = this.emp_json_data;
          }
        });
    }

  ongOnDestroy(): void {
    this.stopWebcam();
  }

  public triggerSnapshot(): void {
    this.trigger.next();
    console.log(this.trigger,'trssssssssss');
  }

  public toggleWebcam(): void {
    this.showWebcam = !this.showWebcam;
  }

  public handleInitError(error: WebcamInitError): void {
    this.errors.push(error);
  }

  public showNextWebcam(directionOrDeviceId: boolean | string): void {
    this.nextWebcam.next(directionOrDeviceId);
  }

  public handleImage(webcamImage: WebcamImage): void {
    this.webcamImage = webcamImage;
  }

  public cameraWasSwitched(deviceId: string): void {
    this.deviceId = deviceId;
  }

  public get triggerObservable(): Subject<void> {
    return this.trigger;
  }

  public get nextWebcamObservable(): Subject<boolean | string> {
    return this.nextWebcam;
  }

  public openFaceCapturePopup(emp_data: any): void {
    this.requestCameraAccess(emp_data);
    this.showFaceCapturePopup = true;
    console.log(this.showWebcam, 'showwebcam');
  }

  public closeFaceCapturePopup(): void {
    // Hide the webcam and the face capture popup
    this.showWebcam = false;
    this.showFaceCapturePopup = false;
    this.webcamImage = null;

    // Turn off the system camera
    navigator.mediaDevices.enumerateDevices()
      .then(devices => {
        devices.forEach(device => {
          if (device.kind === 'videoinput') {
            navigator.mediaDevices.getUserMedia({ video: { deviceId: device.deviceId } })
              .then(stream => {
                const videoTracks = stream.getTracks();
                videoTracks.forEach(track => {
                  track.stop();
                });
                console.log('Camera turned off successfully');
              })
              .catch(error => {
                console.error('Error stopping camera:', error);
                // Handle the error: Display an error message or perform any necessary actions
              });
          }
        });
      })
      .catch(error => {
        console.error('Error enumerating devices:', error);
        // Handle the error: Display an error message or perform any necessary actions
      });
  }

  private requestCameraAccess(emp_data: any): void {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        this.emp_data_Webcam = emp_data;
      })
      .catch(error => {
        console.error('Error accessing camera: ', error);
        this.errors.push(error);
      });
    this.showWebcam = true;
    console.log(this.showWebcam, 'showwebcam');
  }

  stopWebcam() {
    this.showWebcam = false;
  }

  public register(): void {
    const image = this.webcamImage.imageAsDataUrl;
    const emp_data_Webcam = this.emp_data_Webcam;
    const emp_name = emp_data_Webcam.emp_name;
    const emp_data = {
      action: "save_employee_faceid",
      id: "",
      customeraccountid: emp_data_Webcam.customeraccountid,
      emp_code: emp_data_Webcam.emp_code,
      person_id: emp_data_Webcam.personalinfoid,
      userby: this.tp_account_id?.toString()
    };

    this._faceCheckinService.registerFace({
      "image": image,
      "emp_name": emp_name,
      "emp_data": emp_data
    }).subscribe((resData: any) => {
      if (resData.statusCode) {
        this.toastr.success(resData.message)
      } else {
        this.toastr.error(resData.message);
      }
      this.employer_details();
      this.showWebcam = false;
      this.showFaceCapturePopup = false;
      this.webcamImage = null;
    });
  }

  getRegisteredImage(checkin_image: any) {
    console.log(checkin_image);

    if (checkin_image != '' && checkin_image != null) {
      this.view_reg_image_path = checkin_image;

    }
    else {
      this.view_reg_image_path = '';
    }
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

}