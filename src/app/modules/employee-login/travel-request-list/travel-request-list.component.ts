import { ChangeDetectorRef, Component } from '@angular/core';
import { EmployeeLoginService } from '../employee-login.service';
import { SessionService } from 'src/app/shared/services/session.service';
import jwtDecode from 'jwt-decode';
import { ActivatedRoute } from '@angular/router';
import { EncrypterService } from 'src/app/shared/services/encrypter.service';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
declare var $: any;

@Component({
  selector: 'app-travel-request-list',
  templateUrl: './travel-request-list.component.html',
  styleUrls: ['./travel-request-list.component.css']
})
export class TravelRequestListComponent {
  showSidebar: boolean = true;
  decoded_token: any;
  tp_account_id: any;
  product_type: any;
  emp_code: any;
  statusFilter: any = '';
  fromDate: any = '';
  toDate: any = '';
  travelData: any = [];
  filteredData: any = [];
  travelRequestForm: FormGroup;
  modeOfTravels: any = [];
  docTypes: any = [];
  accomodations: any = [];
  advanceRequired: any = [];
  requestData: any = ''
  uploadDoc: any = [];

  constructor(
    private _employeeLoginService: EmployeeLoginService,
    private _sessionService: SessionService,
    private route: ActivatedRoute,
    private _encrypterService: EncrypterService,
    private _fb: FormBuilder,
    private toastr: ToastrService, private cdRef: ChangeDetectorRef
  ) {
    this.route.params.subscribe((param: any) => {
      if (param['emp_code'])
        this.emp_code = this._encrypterService.aesDecrypt(param['emp_code'])
    })
  }

  ngOnInit() {
    let session_obj: any = JSON.parse(this._sessionService.get_user_session());
    this.decoded_token = jwtDecode(session_obj.token);
    this.tp_account_id = this.decoded_token.tp_account_id;
    this.product_type = localStorage.getItem('product_type');

    this.travelRequestForm = this._fb.group({
      purpose: [''],
      placeOfTravelFrom: [''],
      placeOfTravelTo: [''],
      dateOfTravelFrom: [''],
      dateOfTravelTo: [''],
      modeOfTravelId: [''],
      travelAdvId: [''],
      travelAdvAmount: [''],
      travelId: [''],
      department: [''],
      travelComment: [''],
      files: this._fb.array([])
    })
    this.getTravelSummary();
    this.getTravelMaster();
  }
  toggle() {
    this.showSidebar = !this.showSidebar;
  }

  get tf() {
    return this.travelRequestForm.controls;
  }
  getTravelSummary() {

    this._employeeLoginService.getTravelSummary({
      "customerAccountId": this.tp_account_id.toString(),
      "empCode": this.emp_code,
      "productTypeId": this.product_type,
      "travelId": "",
      "fromDt": this.fromDate,
      "toDt": this.toDate,
      "statusFilter": this.statusFilter
    }).subscribe((resData: any) => {
      if (resData.statusCode) {
        this.filteredData = JSON.parse(this._encrypterService.aesDecrypt(resData.commonData));

        //console.log(this.filteredData)
      } else {
        this.travelData = [];
        this.filteredData = [];
      }
    })
  }

  filterDataByDate() {
    if (this.fromDate && this.toDate) {
      this.getTravelSummary();
    }
  }
  getTravelMaster() {
    this._employeeLoginService.getTravelMaster({
      "actionType": "mst_list",
      "customerAccountId": this.tp_account_id.toString(),
      "empCode": this.emp_code,
      "productTypeId": this.product_type
    }).subscribe((resData: any) => {
      if (resData.statusCode) {
        let decryptedData = JSON.parse(this._encrypterService.aesDecrypt(resData.commonData));
        this.modeOfTravels = decryptedData.mode_of_travel;
        this.docTypes = decryptedData.doc_type;
        this.accomodations = decryptedData.accommodation,
          this.advanceRequired = decryptedData.advance_required;
      } else {
        this.modeOfTravels = [];
        this.docTypes = [];
        this.accomodations = [];
        this.advanceRequired = [];
      }
    })
  }

  showAddEditRequestModal() {
    $('#SendMessage1981').modal('show');
  }

  editRequest(request: any) {
    //console.log(request);
    this.requestData = request;
    this.travelRequestForm.patchValue({
      purpose: request.purpose,
      placeOfTravelFrom: request.place_of_travel_from,
      placeOfTravelTo: request.place_of_travel_to,
      dateOfTravelFrom: request.date_of_travel_from,
      dateOfTravelTo: request.date_of_travel_to,
      modeOfTravelId: request.mode_of_travel_id,
      travelAdvId: request.travel_adv_flag_id,
      travelAdvAmount: request.travel_adv_amount,
      travelId: request.travel_id,
      department: request.department,
      travelComment: request.action_comment_txt_req,
    })
    if (request.docment_file?.length) {
      this.files.clear();  // clear any existing controls

      request.docment_file.forEach(doc => {
        this.files.push(this.createFileControl({
          doc_url: doc.doc_url,
          doc_type: doc.doc_type
        }));
      });
    } else {
      this.files.clear();
      this.addFileControl();  // at least one blank
    }
    $('#SendMessage1981').modal('show');
  }

  hideAddEditRequestModal() {
    // $('#SendMessage1981').modal('hide');
    // Object.keys(this.travelRequestForm.controls).forEach((key) => {
    //   this.travelRequestForm.get(key)?.setValue('');
    // });
    // this.requestData = '';


    $('#SendMessage1981').modal('hide');

    this.travelRequestForm.reset();
    this.files.clear();
    this.addFileControl();
    this.uploadDoc = [];
    this.requestData = '';

    setTimeout(() => {
      this.cdRef.detectChanges();
    });

  }

  submitRequest(): any {

    let action = '';
    if (!this.travelRequestForm.value.travelId) {
      action = 'insert';
    } else {
      action = 'update';
    }

    if (!this.tf.purpose.value) {
      return this.toastr.error("Please enter purpose");
    }
    if (!this.tf.placeOfTravelFrom.value) {
      return this.toastr.error("Please enter place of travel from.");
    }
    if (!this.tf.placeOfTravelTo.value) {
      return this.toastr.error("Please enter place of travel to.");
    }
    if (!this.tf.dateOfTravelFrom.value) {
      return this.toastr.error("Please select date of travel from.");
    }
    if (!this.tf.dateOfTravelTo.value) {
      return this.toastr.error("Please select date of travel to.");
    }
    if (!this.tf.modeOfTravelId.value) {
      return this.toastr.error("Please select mode of travel.");
    }
    if (!this.tf.travelAdvId.value) {
      return this.toastr.error("Please select travel advance.");
    }

    if (this.tf.travelAdvId.value && this.tf.travelAdvId.value == '1' && !this.tf.travelAdvAmount.value) {
      return this.toastr.error("Please enter advance travel amount.");
    }
    this._employeeLoginService.saveTravelDetails({
      ...this.travelRequestForm.value,
      "actionType": action,
      "customerAccountId": this.tp_account_id.toString(),
      "empCode": this.emp_code,
      "productTypeId": this.product_type,
      "submittedBy": this.emp_code,
      "userIp": '::1',
      "uploadDoc": this.uploadDoc
    }).subscribe((resData: any) => {
      if (resData.statusCode) {
        this.toastr.success('Travel request submitted');
        this.hideAddEditRequestModal();
        setTimeout(() => {
          this.getTravelSummary();
        }, 200);
        // this.getTravelSummary();
      } else {
        this.toastr.error('Some issue');
      }
    })
  }
  get files(): FormArray {
    return this.travelRequestForm.get('files') as FormArray;
  }

  addFileControl() {
    if (this.files.length < 10) {
      this.files.push(this.createFileControl());
    } else {
      this.toastr.warning("You can upload a maximum of 10 files.");
    }
  }
  readFile(event: Event, doc: any) {
    const input = event.target as HTMLInputElement;
    //console.log(input);

    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      // this.fileName = file.name;
      let fileName = file.name;
      //console.log(fileName);

      const reader = new FileReader();
      reader.onload = () => {
        this.uploadDoc.push({
          docExtension: fileName.split('.')[1],
          docName: fileName.split('.')[0],
          docBase64: reader.result.toString().split(',')[1],
          docTypeId: '6'
        })
        // console.log(this.uploadDoc);

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

  removeFileControl(index: number) {
    this.files.removeAt(index);
  }
  uploadedFiles: File[] = [];

  onFileChange(event: any, index: number) {
    const file = event.target.files[0];
    if (file) {
      this.uploadedFiles[index] = file;

      const fileControl = this.files.at(index);
      fileControl.patchValue({
        file: file,
        doc_url: '',
        doc_type: 'Ticket'
      });

      this.readFile(event, index);
    }
  }

  createFileControl(fileData: any = null): FormGroup {
    return this._fb.group({
      doc_url: [fileData?.doc_url || ''],
      doc_type: [fileData?.doc_type || 'Ticket'],
      file: [null]  // for newly uploaded files
    });
  }


}
