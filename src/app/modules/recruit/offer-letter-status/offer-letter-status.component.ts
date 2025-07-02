import { Component } from '@angular/core';
import { RecruitService } from '../recruit.service';
import { EncrypterService } from 'src/app/shared/services/encrypter.service';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute } from '@angular/router';
import { Base64 } from 'js-base64';
import { EmployeeService } from '../../employee/employee.service';
import { SessionService } from 'src/app/shared/services/session.service';
import decode from 'jwt-decode';
declare var $: any;


@Component({
  selector: 'app-offer-letter-status',
  templateUrl: './offer-letter-status.component.html',
  styleUrls: ['./offer-letter-status.component.css']
})
export class OfferLetterStatusComponent {
  showSidebar: boolean = true;
  token: any;
  tp_account_id: any;

  candidateData: any;
  isPageValid: boolean = false; // page is valid on checking expiry date
  invalidLink: boolean = true; // check the url is valid or not

  constructor(
    private _recruitService: RecruitService,
    private encrypterService: EncrypterService,
    private route: ActivatedRoute,
    private toastr: ToastrService,
    private _EmployeeService : EmployeeService,
    private _sessionService : SessionService
  ) { }

  // #region ngOnInit
  ngOnInit() {
    // Get the query parameters from the URL
 
    // this.token = decode(session_obj_d.token);
    this.route.queryParams.subscribe(params => {
 
      try {
        let decodedData = JSON.parse(this.encrypterService.aesDecrypt(atob(decodeURIComponent(params['data']))));
   
        const { candidateId } = decodedData;

        if (candidateId) {
          this.invalidLink = false;
          this.getCandidateDetails(candidateId)
        } else {
          this.invalidLink = true;
        }
      } catch (error) {
        this.invalidLink = true;
      }
    });
  }

  toggle() {
    this.showSidebar = !this.showSidebar;
  }

  // #region getCandidateDetails
  getCandidateDetails(candidateId: any) {
    let obj = {
      action: 'CANDIDATE_GET',
      candidateId: candidateId,
    }
    this._recruitService.callOfferLetterAction(obj).subscribe((resp: any) => {
      if (resp.statusCode) {
        let decryptedData = JSON.parse(this.encrypterService.aesDecrypt(resp.commonData));
        this.candidateData = decryptedData.data[0];

        const expiryDateObj = new Date(this.candidateData.expiry_date);
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Reset today's time to midnight

        // valid date should be greater or equal to today's date
        const isExpiryDateValid = expiryDateObj >= today;

        if (!isExpiryDateValid) {
          this.isPageValid = false
          this.candidateData = {};
        } else {
          this.isPageValid = true;
          this.candidateData['candidateFileName'] = `${this.candidateData.candidate_name.replace(/ /g, '_')} - Offer.pdf`;
        }
      } else {
        this.candidateData = {};
      }
    });
  }

  // #region onStatusAction
  onStatusAction(type: boolean,candidate:any='') {
    let obj = {
      action: 'CANDIDATE_STATUS',
      candidateId: this.candidateData['candidate_id'],
      candidateStatus: type
    }
// return console.log(candidate);

    this._recruitService.callOfferLetterAction(obj).subscribe((resp: any) => {
      if (resp.statusCode) {
        let decryptedData = JSON.parse(this.encrypterService.aesDecrypt(resp.commonData));
        this.toastr.success(decryptedData.data);
        
        this.ngOnInit();
      } else {
        this.toastr.error(resp.message, 'Error');
      }
    });
  }

}