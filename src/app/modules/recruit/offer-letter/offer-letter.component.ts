import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup,Validators } from '@angular/forms';
import { SessionService } from 'src/app/shared/services/session.service';
import { RecruitService } from '../recruit.service';
import { EncrypterService } from 'src/app/shared/services/encrypter.service';
import { ToastrService } from 'ngx-toastr';
import decode from "jwt-decode";
import { Base64 } from 'js-base64';
import { environment } from 'src/environments/environment';
import { EmployeeManagementService } from '../../employee-management/employee-management.service';
import { EmployeeService } from '../../employee/employee.service';
import { Router } from '@angular/router';
import { FaceCheckinService } from '../../attendance/face-checkin.service';

declare var $: any;

@Component({
  selector: 'app-offer-letter',
  templateUrl: './offer-letter.component.html',
  styleUrls: ['./offer-letter.component.css']
})
export class OfferLetterComponent {
  candidateForm: FormGroup;
  showSidebar: boolean = true;
  token: any;
  tp_account_id: any;
  candidateList: any=[];

  p: number = 1;
  total_count: number = 0;

  searchInput: any;
  joiningDate: any;
  department: string | null = null;
  offer_status: string | null = null;

  popupType: string;
  submitted = false;

  deleteCandidateId: any;
  offerLetterForm: FormGroup;
  templateList: any[];

  globalURL: string = environment.OfferLetterUrl;
  todayDate: string;
  isOfferlettersExist :any;
  offerLetterData: any;
  offerLetterStatus = [
    { id: 1, name: 'None', code: 'none' },
    { id: 2, name: 'Offer Accepted', code: 'accepted' },
    { id: 3, name: 'Offer Declined', code: 'declined' },
    // { id: 4, name: 'Offer Revised', code: 'revised' },
    // { id: 5, name: 'Offer Withdrawn', code: 'withdrawn' },
  ]

  public departments: any[] = [];
  defaultEmail: any = null;

  public config: any = {
    airMode: false,
    tabDisable: true,
    popover: {
      table: [
        ['add', ['addRowDown', 'addRowUp', 'addColLeft', 'addColRight']],
        ['delete', ['deleteRow', 'deleteCol', 'deleteTable']],
      ],
      image: [
        ['image', ['resizeFull', 'resizeHalf', 'resizeQuarter', 'resizeNone']],
        ['float', ['floatLeft', 'floatRight', 'floatNone']],
        ['remove', ['removeMedia']]
      ],
      link: [
        ['link', ['linkDialogShow', 'unlink']]
      ],
      air: [
        [
          'font',
          [
            'bold',
            'italic',
            'underline',
            'strikethrough',
            'superscript',
            'subscript',
            'clear'
          ]
        ],
      ]
    },
    height: '350px',
    // uploadImagePath: '/api/upload',
    toolbar: [
      ['misc', ['codeview', 'undo', 'redo', 'codeBlock']],
      [
        'font',
        [
          'bold',
          'italic',
          'underline',
          'strikethrough',
          'superscript',
          'subscript',
          'clear'
        ]
      ],
      ['fontsize', ['fontname', 'fontsize', 'color']],
      ['para', ['style0', 'ul', 'ol', 'paragraph', 'height']],
      ['insert', ['table', 'link', 'hr']],
      // ['insert', ['table', 'picture', 'link', 'video', 'hr']],
    ],
    codeviewFilter: true,
    // codeviewFilterRegex: /<\/*(?:applet|b(?:ase|gsound|link)|embed|frame(?:set)?|ilayer|l(?:ayer|ink)|meta|object|s(?:cript|tyle)|t(?:itle|extarea)|xml|.*onmouseover)[^>]*?>/gi,
    codeviewIframeFilter: true
  };
  masterTemplateList: any=[];
  product_type: any;
  candidateDetails: any;
  isDataLoaded : boolean=false;
  isEditStatus :boolean[]=[];
  hoverIndex: number | null = null;
  addDepartmentForm: FormGroup;


  constructor(
    private fb: FormBuilder,
    private _sessionService: SessionService,
    private _recruitService: RecruitService,
    private encrypterService: EncrypterService,
    private toastr: ToastrService,
    private _employeemgmtService : EmployeeManagementService,
    private _encrypterServce : EncrypterService,
    private _EmployeeService : EmployeeService,
    private router: Router,
    private _faceCheckinService : FaceCheckinService
  ) { }

  // #region ngOnInit
  ngOnInit() {
    let session_obj_d: any = JSON.parse(
      this._sessionService.get_user_session()
    );
    this.product_type=localStorage.getItem('product_type');
    this.token = decode(session_obj_d.token);
    this.tp_account_id = this.token.tp_account_id;
    this.todayDate = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
    this.getDepartmentData();
    this.getAllCandidates();
    this.getAllTemplates();
    this.initializeForm();
    this.getMasterLetters();
  }


  // #region initializeForm
  initializeForm() {
    this.candidateForm = this.fb.group({
      candidateId: [''],
      postingTitle: ['', Validators.required],
      departmentName: ['', Validators.required],
      candidateName: ['', Validators.required],
      emailId: ['', [Validators.required, this.emailValidator]],
      mobileNo: ['', Validators.required],
      address: [''],
      jobType: ['', Validators.required],
      joiningDate: ['', Validators.required],
      expiryDate: ['', Validators.required],
      ctc: ['', Validators.required]
    }, { validators: this.dateValidation });

    this.offerLetterForm = this.fb.group({
      from: '',
      emailTemplate: [''],
      to: [[], [Validators.required, this.emailArrayValidator]],
      cc: [[], this.emailArrayValidator],
      bcc: [[], this.emailArrayValidator],
      subject: ['', Validators.required],
      body: ['', Validators.required],
      attachment: ['', Validators.required]
    });

    this.addDepartmentForm = this.fb.group({
      departmentName : ['',[Validators.required]]
    })
  }


  // Convenience getter for easy access to form fields in the candidate form
  get fc() { return this.candidateForm.controls; }

  // Convenience getter for easy access to form fields in the offer letter form
  get fol() { return this.offerLetterForm.controls; }


  // Custom validator for email
  emailValidator(control: AbstractControl): { [key: string]: boolean } | null {
    if (!control.value) {
      return null; // Don't validate if the control is empty
    }
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const isValid = emailPattern.test(control.value);
    return isValid ? null : { invalidEmail: true };
  }


  // Custom validator to ensure joining date <= expiry date
  dateValidation(group: FormGroup): { [key: string]: boolean } | null {
    const joiningDate = group.get('joiningDate')?.value;
    const expiryDate = group.get('expiryDate')?.value;

    if (joiningDate && expiryDate && new Date(joiningDate) > new Date(expiryDate)) {
      group.get('joiningDate')?.setErrors({ invalidDate: true });
      group.get('expiryDate')?.setErrors({ invalidDate: true });
      return { invalidDate: true }; // Return an error object to signal invalid date range
    }

    // Clear errors if validation passes
    if (group.get('joiningDate')?.errors?.invalidDate) {
      group.get('joiningDate')?.updateValueAndValidity();
    }
    if (group.get('expiryDate')?.errors?.invalidDate) {
      group.get('expiryDate')?.updateValueAndValidity();
    }

    return null; // No errors
  }

  // Custom validator for ngx-chips email
  emailArrayValidator(control: FormControl) {
    const emails = control.value || [];
    const emailPattern = /^[a-zA-Z0-9._+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    for (const email of emails) {
      if (!emailPattern.test(email.label)) {
        return { invalidEmail: true };
      }
    }
    return null;
  }


  onItemRemoved(event: any) {
    const defaultEmail = (this.defaultEmail[0].label || this.defaultEmail[0].value) || '';
    const itemToRemove = (event.label || event.value) || '';
    let data = this.offerLetterForm.value['to']
    let isDefaultEmailExist = false;
    for (let i in data) {
      const label = data[i]?.['label'];
      const value = data[i]?.['value'];
      if ((label && label.includes(defaultEmail)) || (value && value.includes(defaultEmail))) {
        isDefaultEmailExist = true;
        return;
      }
    }

    if (defaultEmail === itemToRemove) {
      if (!isDefaultEmailExist) {
        data.unshift({label: defaultEmail, value: defaultEmail});
        this.offerLetterForm.get('to')?.updateValueAndValidity();
      }
    }
  }


  onItemAdded(event: any) {
  }


  toggle() {
    this.showSidebar = !this.showSidebar;
  }


  // #region getAllCandidates
  getAllCandidates(isOpenTemplate:boolean=false) {
    let obj = {
      action:'get_candidate',
      customeraccountid: this.tp_account_id.toString(),
      searchInput: this.searchInput,
      joiningDate: this.joiningDate,
      department: this.department,
      offer_status: this.offer_status,
      page: this.p,
      limit: 10
    };
    this._recruitService.getAllCandidateList(obj).subscribe((resp: any) => {
      if (resp.statusCode) {
        let allCandidatesData = JSON.parse(this.encrypterService.aesDecrypt(resp.commonData));
        this.candidateList = allCandidatesData;
        this.isOfferlettersExist = 'hasData';
        this.total_count = allCandidatesData[0]['totalCount'] || 0;
        this.candidateList.forEach((candidate,i) => {
          this.isEditStatus[i]=false;
          if (candidate.candidate_name) {
            candidate['candidateFileName'] = `${candidate.candidate_name.replace(/ /g, '_')} - Offer`;
          }
        });
        this.closeSidebar();
        if(isOpenTemplate){
          let candidate = this.candidateList.find(item => item.email_id == this.candidateForm.get('emailId').value)
         
          this.candidateForm.patchValue({
            candidateId : candidate.candidate_id
          })
          
          this.openSendOfferLetterModal(candidate.candidate_id)
        }
        this.isDataLoaded=true;
      } else {
        this.isDataLoaded=true;
        if(this.isOfferlettersExist=='hasData'){
          this.isOfferlettersExist='hasData';
        }else
          this.isOfferlettersExist='initial';
        this.candidateList = []
      }
    });
  }


  // #region Pagination, search, reset
  onPageChange(page: number) {
    this.p = page;
    this.getAllCandidates();
  }

  onSearch() {
    this.p = 1;
    // this.candidateList = [];
    // this.total_count = 0;
    this.getAllCandidates();
  }

  onReset() {
    this.p = 1;
    // this.candidateList = [];
    // this.total_count = 0;
    this.searchInput = null;
    this.joiningDate = null;
    this.department = null;
    this.offer_status = null;
    // this.getAllCandidates();
  }

  // #region openAddEditCandidateModal
  openAddEditCandidateModal(value: string, candidate?: any) {
    this.candidateForm.reset();
    this.offerLetterForm.reset();
    this.popupType = value;
    this.submitted = false;
    $('#candidate-modal').modal('show');

    this.candidateDetails = candidate;

    if (value == 'editCandidate') {
      this.candidateForm.patchValue({
        candidateId: candidate.candidate_id,
        postingTitle: candidate.posting_title,
        departmentName: candidate.department_name,
        candidateName: candidate.candidate_name,
        emailId: candidate.email_id,
        mobileNo: candidate.mobile,
        address : candidate.address,
        jobType: candidate.jobtype,
        joiningDate: this.formatDate(candidate.expected_doj),
        expiryDate: this.formatDate(candidate.expiry_date),
        ctc: candidate.ctc,
      });
    }
  }


  closeModal() {
    this.candidateForm.reset();
    this.offerLetterForm.reset();
  }


  // Convert the ISO date string to the format YYYY-MM-DD
  formatDate(dateString: string) {
    return new Date(dateString).toISOString().split('T')[0];
  };

  openInNewTab() {
    $('#add-department').modal('show');
    // window.open('/business-settings/unit-parameter-listing', '_blank');
  }

  closeNewDepartmentModal(){
    $('#add-department').modal('hide');
    this.addDepartmentForm.reset();
  }

  getMasterLetters(){

    this._employeemgmtService.getMasterLetters({'productTypeId': this.product_type,'customerAccountId':this.tp_account_id.toString(),
      'lettersType': 'Offer Letter', 'letterId': ''
    }).subscribe((resData:any)=>{
      if(resData.statusCode){
        this.masterTemplateList= JSON.parse(this._encrypterServce.aesDecrypt(resData.commonData));        
      }
    })
  }

  // #region Save Candidate
  onSaveCandidate() {
    this.submitted = true;

    // Stop here if the form is invalid
    if (this.candidateForm.invalid) {
      return;
    }

    if (this.popupType === 'createCandidate') {
      let obj = {
        action: 'ADD',
        posting_title: this.candidateForm.value.postingTitle,
        department_name: this.candidateForm.value.departmentName,
        candidate_name: this.candidateForm.value.candidateName,
        email_id: this.candidateForm.value.emailId,
        mobile: this.candidateForm.value.mobileNo?.toString(),
        address: this.candidateForm.value.address,
        jobtype: this.candidateForm.value.jobType,
        expected_doj: this.candidateForm.value.joiningDate,
        expiry_date: this.candidateForm.value.expiryDate,
        ctc: this.candidateForm.value.ctc,
        customeraccountid: this.tp_account_id.toString(),
      }
      this._recruitService.submitCandidateAction(obj).subscribe((resp: any) => {
        if (resp.statusCode) {
          let decryptedData = JSON.parse(this.encrypterService.aesDecrypt(resp.commonData));
          this.toastr.success(decryptedData.data);
          this.popupType = '';
          // this.candidateForm.reset();
          this.offerLetterForm.reset();
          // $('#candidate-modal').modal('hide');
          this.getAllCandidates(true);
        } else {
          this.toastr.error(resp.message, 'Error');
        }
      });
    }

    if (this.popupType === 'editCandidate') {
      let obj = {
        action: 'UPDATE',
        candidate_id: this.candidateForm.value.candidateId,
        posting_title: this.candidateForm.value.postingTitle,
        department_name: this.candidateForm.value.departmentName,
        candidate_name: this.candidateForm.value.candidateName,
        email_id: this.candidateForm.value.emailId,
        mobile: this.candidateForm.value.mobileNo?.toString(),
        address: this.candidateForm.value.address,
        jobtype: this.candidateForm.value.jobType,
        expected_doj: this.candidateForm.value.joiningDate,
        expiry_date: this.candidateForm.value.expiryDate,
        ctc: this.candidateForm.value.ctc,
        customeraccountid: this.tp_account_id.toString(),
      }

      this._recruitService.submitCandidateAction(obj).subscribe((resp: any) => {
        if (resp.statusCode) {
          let decryptedData = JSON.parse(this.encrypterService.aesDecrypt(resp.commonData));
          this.toastr.success(decryptedData.data);
          this.popupType = '';
          // $('#candidate-modal').modal('hide');
          this.getAllCandidates(true);
        } else {
          this.toastr.error(resp.message, 'Error');
        }
      });
    }
  }

  onHover(index: number) {
    this.hoverIndex = index; // Set the hover index when hovering
  }
  
  onLeave(index: number) {
    this.hoverIndex = null; // Reset hover index when mouse leaves
  }

  toggleEditStatus(index: number) {
    // Toggle the edit status for the specific row only if candidate is not joined
    if (!this.candidateList[index].tpcode) {
      this.isEditStatus[index] = !this.isEditStatus[index];
    }
  }

  addEmployee(candidate:any){
// return console.log(candidate);

      let postData = {
        'product_type' : localStorage.getItem('product_type'),
        'employee_name':candidate.candidate_name,
        'employee_mobile' : candidate.mobile ? candidate.mobile :'',
        'is_associate_notify_req':'N',
        'employee_email': candidate.email_id ? candidate.email_id :'',
        'category_cd':candidate.jobtype,
        'employer_leadid': this.token.tp_lead_id,
        'customeraccountid': this.token.tp_account_id,
        'employer_id': this.token.id.toString(),
        'geoFenceId': this.token.geo_location_id.toString(),
        'ouIds': this.token.ouIds.toString(),
        'subEmpId': this.token.sub_userid!=undefined ?this.token.sub_userid.toString():null
      };
      this._EmployeeService.add_new_employee(postData).subscribe((resData:any)=>{
        if(resData.statusCode){
          this.toastr.success(resData.message);
          this._recruitService.mapTPCode({'mobile':candidate.mobile,'action':'map_tp_code'}).subscribe((resData:any)=>{
            // if(resData)
            this.getAllCandidates();
          })
        }else{
          this.toastr.error(resData.message);
        }
      })
    
  }


  openDeleteModal(candidateId: any) {
    this.deleteCandidateId = candidateId;
    $('#delete-candidate-modal').modal('show');
  }

  // #region deleteCandidate
  deleteCandidate() {
    let obj = {
      action: 'DELETE',
      candidate_id: this.deleteCandidateId,
      customeraccountid: this.tp_account_id.toString(),
    }
    this._recruitService.submitCandidateAction(obj).subscribe((resp: any) => {
      if (resp.statusCode) {
        let decryptedData = JSON.parse(this.encrypterService.aesDecrypt(resp.commonData));
        this.toastr.success(decryptedData.data);
        this.candidateForm.reset();
        this.offerLetterForm.reset();
        $('#delete-candidate-modal').modal('hide');
        this.deleteCandidateId = null;
        this.getAllCandidates();
      } else {
        this.toastr.error(resp.message, 'Error');
      }
    });
  }


  // #region openSendOfferLetterModal
  async openSendOfferLetterModal(candidateId?: any) {
    let candidate = this.candidateList.find(item => item.candidate_id == candidateId);

    this.offerLetterForm.reset();
    $('#send-offer-letter').modal('show');

    // Transforming arrays of strings into arrays of objects
    const transformEmails = (emails: string[]) => {
      return emails.map(email => ({ label: email, value: email }));
    };
    if (candidate.offer_letter_data) {
      

      if(candidate.offer_letter_data.to != candidate.email_id) {
        candidate.offer_letter_data.to.shift();
        candidate.offer_letter_data.to.unshift(candidate.email_id);
      }

      this.defaultEmail = transformEmails(candidate.offer_letter_data.to);
      // this.changeEmailTemplate(candidate.candidate_id,candidate.offer_letter_data.emailTemplate);
      this.offerLetterForm.patchValue({
        from: 'test@gmail.com',
        emailTemplate: candidate.offer_letter_data.emailTemplate,
        to: transformEmails(candidate.offer_letter_data.to),
        cc: candidate.offer_letter_data.cc ? transformEmails(candidate.offer_letter_data.cc) : null,
        bcc: candidate.offer_letter_data.bcc ? transformEmails(candidate.offer_letter_data.bcc) : null,
        subject: candidate.offer_letter_data.subject,
        body: candidate.offer_letter_data.body,
        attachment: candidate.offer_letter_data.attachment
      });
    } else {
      // candidate.offer_letter_data = {}; 
      let toEmails: string[] = [];
      toEmails.push(candidate.email_id);

      // const encodedData = this.encrypterService.aesEncrypt(JSON.stringify({ candidateId: candidate.candidate_id }));
      // const urlToAdd = `${this.globalURL}/recruit/offer-letter-accept?data=${encodedData}`;
      // // const bodyUrl = `\n${urlToAdd}`;

      // const bodyUrl = `To accept the offer letter, please click here: ${urlToAdd}`;
      // // candidate.offer_letter_data['body'] = `${bodyUrl}`;

      this.defaultEmail = transformEmails(toEmails); //set default email

      this.offerLetterForm.patchValue({
        to: transformEmails(toEmails)
      });
    }
  }


  closeSendOfferLetterModal() {
    this.offerLetterForm.reset();
    $('#send-offer-letter').modal('hide');
  }


  // #region onSaveEmailJson
  onSaveEmailJson(candidateId: any, isEmailSend: any) {
    let candidate = this.candidateList.find(item => item.candidate_id == candidateId);
    this.isDataLoaded=false;
    // Transforming arrays of objects into arrays of strings
    const transformToStrings = (emails: { label: string, value: string }[]) => {
      return emails.map(email => email.label || email.value);
    };

    if(isEmailSend){
      // body: this.offerLetterForm.value.body,attachment: this.offerLetterForm.value.attachment
      this._recruitService.letterTEmplateById({candidateid : candidateId,templateid: this.offerLetterForm.value.emailTemplate,
        body: this.offerLetterForm.value.body,attachment: this.offerLetterForm.value.attachment,subject_html : this.offerLetterForm.value.subject
      }).subscribe((resData:any)=>{
        if(resData.statusCode){
          let offer_letter = resData.commonData;
          // console.log(offer_letter);
          // return
          // const encodedData = this.encrypterService.aesEncrypt(JSON.stringify({ candidateId: candidateId }));
          // const urlToAdd = `${this.globalURL}/recruit/offer-letter-accept?data=${Base64.encodeURI(encodedData)}`;

          // // Add the URL to the body with a newline
          // const bodyUrl = `To accept the offer letter, please click here: ${urlToAdd}`;
          let body_text =offer_letter.r_emailbody;
          // if (offer_letter.r_emailbody) {
          //   body_text = offer_letter.r_emailbody + bodyUrl;
          // } else {
          //   body_text = bodyUrl;
          // }
          let attachment = offer_letter.r_templatetext;
          let obj = {
            candidate_id: candidateId,
            candidateName : this.candidateForm.value.candidateName,
            offer_letter_data: {
              "from": '',
              "emailTemplate": this.offerLetterForm.value.emailTemplate,
              "to": transformToStrings(this.offerLetterForm.value?.to),
              "cc": this.offerLetterForm.value.cc ? transformToStrings(this.offerLetterForm.value?.cc) : null,
              "bcc": this.offerLetterForm.value?.bcc ? transformToStrings(this.offerLetterForm.value?.bcc) : null,
              "subject": offer_letter.r_emailsubject,
              "body": body_text,
              "attachment": attachment,
              "header": this.candidateList[0].header,
              "footer": this.candidateList[0].footer,
            },
            customeraccountid: this.tp_account_id.toString(),
            isEmailSend: isEmailSend
          }
          this._recruitService.saveEmailJson(obj).subscribe((resp: any) => {
            if (resp.statusCode) {
              this.isDataLoaded=true;
              let decryptedData = JSON.parse(this.encrypterService.aesDecrypt(resp.commonData));
              this.toastr.success(decryptedData.data);
              this.popupType = '';
              this.candidateForm.reset();
              this.offerLetterForm.reset();
              $('#send-offer-letter').modal('hide');
              $('#candidate-modal').modal('hide');
              this.getAllCandidates();
            } else {
              this.isDataLoaded=true;
              this.toastr.error(resp.message, 'Error');
            }
          });
        }else{
          this.isDataLoaded=true;
          this.toastr.error(resData.message, 'Error');
        }
      })
    }else{
      let obj = {
        candidate_id: candidateId,
        candidateName : this.candidateForm.value.candidateName,
        offer_letter_data: {
          "from": '',
          "emailTemplate": this.offerLetterForm.value.emailTemplate,
          "to": transformToStrings(this.offerLetterForm.value?.to),
          "cc": this.offerLetterForm.value.cc ? transformToStrings(this.offerLetterForm.value?.cc) : null,
          "bcc": this.offerLetterForm.value?.bcc ? transformToStrings(this.offerLetterForm.value?.bcc) : null,
          "subject": this.offerLetterForm.value.subject,
          "body": this.offerLetterForm.value.body,
          "attachment": this.offerLetterForm.value.attachment,
          "header": this.candidateList[0].header,
          "footer": this.candidateList[0].footer
        },
        customeraccountid: this.tp_account_id.toString(),
        isEmailSend: isEmailSend
      }
      this._recruitService.saveEmailJson(obj).subscribe((resp: any) => {
        if (resp.statusCode) {
          let decryptedData = JSON.parse(this.encrypterService.aesDecrypt(resp.commonData));
          this.toastr.success(decryptedData.data);
          this.isDataLoaded=true;
          this.popupType = '';
          // this.candidateForm.reset();
          // this.offerLetterForm.reset();
          // $('#send-offer-letter').modal('hide');
          // $('#candidate-modal').modal('hide');
          this.getAllCandidates();
        } else {
          this.isDataLoaded=true;
          this.toastr.error(resp.message, 'Error');
        }
      });
    }
    // return
    
  }


  savenewDepartment(){
    this._recruitService.SaveDepartment({
      "departmentName": this.addDepartmentForm.value.departmentName,
      "action": "save_department_direct",
      "customeraccountid": this.tp_account_id.toString(),
      "userby": this.tp_account_id.toString(),
    }).subscribe((resData:any)=>{
      if(resData.statusCode){
        this.toastr.success(resData.message);
        this.closeNewDepartmentModal();
        this.getDepartmentData();
      }else{
        this.toastr.error(resData.message);
      }
    })
  }


  // #region getAllTemplates
  async getAllTemplates() {
    let obj = {
      customeraccountid: this.tp_account_id.toString(),
    };
    this._recruitService.getAlltemplateList(obj).subscribe((resp: any) => {
      if (resp.statusCode) {
        let alltemplatesData = JSON.parse(this.encrypterService.aesDecrypt(resp.commonData));
        this.templateList = alltemplatesData.data;
      } else {
        this.templateList = []
      }
    });
  }


  previewLetter() {
    const encryptedParams = encodeURIComponent(this._encrypterServce.aesEncrypt('candidate,'+this.candidateForm.get('candidateId').value+', '));
    const url = `${window.location.origin}/employee-mgmt/preview-pdf/${encryptedParams}`;
    window.open(url, '_blank');
    
  }
  
  // #region changeEmailTemplate
  changeEmailTemplate(candidateId: any, templateId: any) {
    // console.log(this.templateList);
    
    this._employeemgmtService.getMasterLetters({'productTypeId': this.product_type,'customerAccountId':this.tp_account_id.toString(),
      'lettersType': 'Offer Letter', 'letterId': templateId
    }).subscribe((resData:any)=>{
      if(resData.statusCode){
        // this.masterTemplateList= JSON.parse(this._encrypterServce.aesDecrypt(resData.commonData));
        let template =JSON.parse(this._encrypterServce.aesDecrypt(resData.commonData))[0];
        let candidate = this.candidateList.find(item => item.candidate_id == candidateId);
   
        const encodedData = this.encrypterService.aesEncrypt(JSON.stringify({ candidateId: candidate.candidate_id }));
        const urlToAdd = `${this.globalURL}/recruit/offer-letter-accept?data=${Base64.encodeURI(encodedData)}`;

        // Add the URL to the body with a newline
        const bodyUrl = `To accept the offer letter, please click here: ${urlToAdd}`;

        if (template['emailbody']) {
          template['emailbody'] = template['emailbody'] + bodyUrl;
        } else {
          template['emailbody'] = urlToAdd;
        }

        this.offerLetterForm.patchValue({
          subject: template['emailsubject'],
          body: template['emailbody'],
          attachment: template['template_html']
        });
        
      }
    })
    
  }


  // #region changeOfferStatus
  changeOfferStatus(candidate: any, changedStatus: any,idx:number) {
    // check isOfferGenerated
    if (!candidate.offer_letter_issued) {
      this.toastr.error('Offer Letter is not generated yet!', 'Error');
      this.getAllCandidates();
      return;
    } else {

      if(!confirm('Are you sure you want to update status?')){
        return;
      }
      candidate['offer_status'] = changedStatus;
      let obj = {
        action: 'STATUS_CHANGE',
        candidate_id: candidate['candidate_id'],
        offer_status: candidate['offer_status'],
        customeraccountid: this.tp_account_id.toString(),
        ctc: candidate['ctc']
      }
      this._recruitService.submitCandidateAction(obj).subscribe((resp: any) => {
        if (resp.statusCode) {
          let decryptedData = JSON.parse(this.encrypterService.aesDecrypt(resp.commonData));
          this.toastr.success(decryptedData.data);
          this.isEditStatus[idx]=false;
          this.getAllCandidates();
        } else {
          this.isEditStatus[idx]=false;
          this.toastr.error(resp.message, 'Error');
        }
      });
    }
  }


  async getDepartmentData() {
    let obj = {
      action:'mst_dept',
      customeraccountid : this.tp_account_id.toString(),
      organization_unitid :'',
      emp_code:'',
      keyword:'',
      fromdate:'',
      todate:'',
      pagesize : 1000,
      index : 0
    }
    await this._faceCheckinService.getemployeeList(obj).subscribe((res: any) => {
      if(res.statusCode){
        this.departments = JSON.parse(this.encrypterService.aesDecrypt(res.commonData));
      }else{
        this.departments=[];
      }
    })

  }


  preventInvalidInput(event) {
    if (["e", "E", "+", "-"].includes(event.key)) {
      event.preventDefault();
    }
  }

  // Disable scroll wheel from changing input value
  disableScroll(event) {
    event.preventDefault();
  }

  openSidebar(){
    document.getElementById("sidebar").style.width = "380px";
  }

  closeSidebar() {
    document.getElementById("sidebar").style.width = "0";
  }

  routeToHrLetter() {

  $('.modal-backdrop').remove();

    this.router.navigate(['/employee-mgmt/letter-listing',this._encrypterServce.aesEncrypt('Offer Letter'+','+'4')]);
  }
}

