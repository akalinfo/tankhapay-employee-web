import { Component } from '@angular/core';
import {EmployeeLoginService} from '../employee-login.service';
import { EncrypterService } from 'src/app/shared/services/encrypter.service';
import { ToastrService } from 'ngx-toastr';
import { SessionService } from 'src/app/shared/services/session.service';
import jwtDecode from 'jwt-decode';
import { ActivatedRoute } from '@angular/router';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
declare var $:any;

@Component({
  selector: 'app-training-details',
  templateUrl: './training-details.component.html',
  styleUrls: ['./training-details.component.css']
})
export class TrainingDetailsComponent {
  showSidebar: boolean = true;
  emp_code :any;
  decoded_token: any;
  tp_account_id:any;
  product_type:any;
  trainingId: any;
  training:any={};
  examQuestion:any=[];
  feedBackData:any=[];
  
  constructor(
    private _employeeLoginService : EmployeeLoginService,
    private _encrypterService : EncrypterService,
    private toastr : ToastrService,
    private _sessionService : SessionService,
    private route : ActivatedRoute,
    private fb : FormBuilder
  ){
    this.route.params.subscribe((param:any)=>{
      if(param['trainingid']){
        let decrypted = this._encrypterService.aesDecrypt(param['trainingid']);
        this.trainingId = decrypted.split(',')[0];
        this.emp_code = decrypted.split(',')[1];
      }
    })
  }

  ngOnInit(){
      let session_obj: any = JSON.parse(this._sessionService.get_user_session());
    this.decoded_token = jwtDecode(session_obj.token);
    this.tp_account_id = this.decoded_token.tp_account_id;
    this.product_type = localStorage.getItem('product_type');
    // this.emp_code= this.empDataFromParent.emp_code;
    this.getCalenderRecordsByEmployee();
    this.getExamQuestion();
    this.previewFeedbackAnswer();
  }
  
  toggle() {
    this.showSidebar = !this.showSidebar;
  }
  getCalenderRecordsByEmployee(){
    this._employeeLoginService.getCalenderRecordsByEmployee({
      "action": "tnd_list",
      "customerAccountId":  this.tp_account_id.toString(),
      "empCode": this.emp_code,
      "trainingId": this.trainingId,
      "fromDt": "",
      "toDt": "",
      "productTypeId": this.product_type
    }).subscribe((resData:any)=>{
      if(resData.statusCode){
        this.training = JSON.parse(this._encrypterService.aesDecrypt(resData.commonData))[0];
        console.log(this.training)
      }else{
        this.training={};
      }
    })
  }
  
  getExamQuestion(){
    this._employeeLoginService.previewTrainingExamAnswer({
      "customerAccountId": this.tp_account_id,
      "empCode": this.emp_code,
      "trainingId": this.trainingId,
      "productTypeId": this.product_type
    }).subscribe((resData:any)=>{
      if(resData.statusCode){
        this.examQuestion = JSON.parse(this._encrypterService.aesDecrypt(resData.commonData));
        console.log(this.examQuestion);
        
      }else{
        this.examQuestion=[];
      }
    })
  }

  showExamQuestionModal(){
    $('#SendMessage2000').modal('show');
    
  }
  showFeedBackModal(){
    $('#SendMessage2001').modal('show');
    
  }

  isAnswerCorrect(question: any): boolean {
    if (!question.user_answers || !question.answers_selected) {
      return false;
    }
    
    // Sort and compare both arrays
    const userAnswersSorted = [...question.user_answers].sort();
    const selectedAnswersSorted = [...question.answers_selected].sort();
  
    return JSON.stringify(userAnswersSorted) === JSON.stringify(selectedAnswersSorted);
  }

  previewFeedbackAnswer(){
    this._employeeLoginService.previewFeedbackAnswer({
      "customerAccountId": this.tp_account_id,
      "empCode": this.emp_code,
      "trainingId": this.trainingId,
      "productTypeId": this.product_type
    }).subscribe((resData:any)=>{
      if(resData.statusCode){
        this.feedBackData =JSON.parse(this._encrypterService.aesDecrypt(resData.commonData));
        console.log(this.feedBackData);
        
      }else{
        this.feedBackData=[];
      }
    })
  }
  employeeTrainingMarkAttendance(att:any,status){

    this._employeeLoginService.employeeTrainingMarkAttendance({
      action : 'attendance_mark',
      customerAccountId : this.tp_account_id.toString(),
      nominationId : this.training.nominationid,
      empCode : this.emp_code,
      productTypeId : this.product_type,
      attendanceDt : att.attendance_date,
      atttendanceStatus : status,
      createdBy : this.emp_code
    }).subscribe((resData:any)=>{
      if(resData.statusCode){
        this.toastr.success(resData.message);
        this.getCalenderRecordsByEmployee();
      }else{
        this.toastr.error(resData.message);
      }
    })
  }
  
  isAttnExpired(attn:any){
    console.log(attn);
    const today = new Date();
    const [year, month, day] = attn.attendance_date.split('-').map(Number); // Assuming format is 'YYYY-MM-DD'
    const attendanceDate = new Date(year, month - 1, day);
// console.log(attendanceDate.toDateString() !== today.toDateString());

    return (attendanceDate.toDateString() !== today.toDateString());
  }
}
