// import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
// import { ExitInterviewQuestionnaireComponent } from './exit-interview-questionnaire.component';
// import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
// import { EmployeeManagementService } from '../../employee-management/employee-management.service';
// import { SessionService } from 'src/app/shared/services/session.service';
// import { EncrypterService } from 'src/app/shared/services/encrypter.service';
// import { ToastrService } from 'ngx-toastr';
// import { HttpClientTestingModule } from '@angular/common/http/testing';
// import { ActivatedRoute, convertToParamMap } from '@angular/router';
// import { of, throwError } from 'rxjs';

// describe('ExitInterviewQuestionnaireComponent', () => {
//   let component: ExitInterviewQuestionnaireComponent;
//   let fixture: ComponentFixture<ExitInterviewQuestionnaireComponent>;
//   let mockEmployeeManagementService: jasmine.SpyObj<EmployeeManagementService>;
//   let mockSessionService: jasmine.SpyObj<SessionService>;
//   let mockEncrypterService: jasmine.SpyObj<EncrypterService>;
//   let mockToastrService: jasmine.SpyObj<ToastrService>;
//   let mockActivatedRoute: any;

//   const empId = '123';
//   const basicEmpData = {
//     emp_name: 'John Doe',
//     emp_code: 'E1001',
//     department_name: 'Engineering',
//     designation_name: 'Software Engineer',
//     dateofjoining: '2022-01-01',
//     mobile: '1234567890',
//     email_id: 'john.doe@example.com'
//   };
//   const empDataFromParent = { // Simulating localStorage.getItem('empDataFromParent')
//     ...basicEmpData,
//     ctc: '100000'
//   };
//    const mockUserSession = { emp_id: 'HR001' };


//   beforeEach(async () => {
//     mockEmployeeManagementService = jasmine.createSpyObj('EmployeeManagementService', ['GetExitDetails', 'AddEditExitDetails']);
//     mockSessionService = jasmine.createSpyObj('SessionService', ['get_user_session']);
//     mockEncrypterService = jasmine.createSpyObj('EncrypterService', ['aesDecrypt', 'aesEncrypt']);
//     mockToastrService = jasmine.createSpyObj('ToastrService', ['success', 'error', 'info', 'warning']);

//     mockActivatedRoute = {
//       snapshot: {
//         paramMap: convertToParamMap({ empId: empId })
//       }
//     };
    
//     mockSessionService.get_user_session.and.returnValue(JSON.stringify({ token: 'fakeToken', emp_id: mockUserSession.emp_id })); // Ensure userSession is populated
    

//     await TestBed.configureTestingModule({
//       declarations: [ExitInterviewQuestionnaireComponent],
//       imports: [ReactiveFormsModule, HttpClientTestingModule],
//       providers: [
//         FormBuilder,
//         { provide: EmployeeManagementService, useValue: mockEmployeeManagementService },
//         { provide: SessionService, useValue: mockSessionService },
//         { provide: EncrypterService, useValue: mockEncrypterService },
//         { provide: ToastrService, useValue: mockToastrService },
//         { provide: ActivatedRoute, useValue: mockActivatedRoute }
//       ]
//     }).compileComponents();

//     fixture = TestBed.createComponent(ExitInterviewQuestionnaireComponent);
//     component = fixture.componentInstance;
    
//     // Mock localStorage getItem
//     spyOn(localStorage, 'getItem').and.callFake((key: string) => {
//       if (key === 'empDataFromParent') return JSON.stringify(empDataFromParent);
//       if (key === 'emp_basic') return JSON.stringify(basicEmpData); 
//       return null;
//     });

//     // Default mock for aesDecrypt, can be overridden in specific tests if needed
//     mockEncrypterService.aesDecrypt.and.callFake((dataToDecrypt) => {
//         if (dataToDecrypt === JSON.stringify(empDataFromParent)) return JSON.stringify(empDataFromParent);
//         if (dataToDecrypt === JSON.stringify(basicEmpData)) return JSON.stringify(basicEmpData);
//         // For GetExitDetails mock commonData, it is handled by specific spy if it's a string
//         if (typeof dataToDecrypt === 'string') return dataToDecrypt; 
//         return null; 
//     });
//   });

//   it('should create', () => {
//     fixture.detectChanges(); // ngOnInit
//     expect(component).toBeTruthy();
//   });

//   describe('ngOnInit and Data Loading', () => {
//     it('should initialize form and call loadEmployeeDataAndDetails', () => {
//       spyOn(component, 'initForm').and.callThrough();
//       spyOn(component, 'loadEmployeeDataAndDetails').and.callThrough();
//       fixture.detectChanges(); // ngOnInit
//       expect(component.initForm).toHaveBeenCalled();
//       expect(component.loadEmployeeDataAndDetails).toHaveBeenCalled();
//       expect(component.empIdFromRoute).toBe(empId);
//     });

//     it('should load basic data from localStorage and call GetExitDetails', fakeAsync(() => {
//       const serviceResponseData = { 
//             employee_info: { designation_at_joining: 'Intern', salary_at_joining: '50000' },
//             questionnaire_data: { contactAddress: '123 Main St' }
//       };
//       const mockExitDetailsResponse = { 
//         statusCode: 200, 
//         commonData: 'encryptedCommonDataString' // Assume commonData is an encrypted string
//       };

//       mockEmployeeManagementService.GetExitDetails.and.returnValue(of(mockExitDetailsResponse));
//       // Specific mock for aesDecrypt when called with the service's encrypted string
//       mockEncrypterService.aesDecrypt.withArgs('encryptedCommonDataString').and.returnValue(JSON.stringify(serviceResponseData));

//       fixture.detectChanges(); 
//       tick(); 

//       expect(localStorage.getItem).toHaveBeenCalledWith('empDataFromParent');
//       // emp_basic would be called if empDataFromParent was null, let's adjust the spy for that if needed
//       // For this test, empDataFromParent is found.
      
//       expect(mockEmployeeManagementService.GetExitDetails).toHaveBeenCalledWith({ emp_id: empId, type: 'questionnaire' });
      
//       expect(component.questionnaireForm.get('employeeName').value).toBe(empDataFromParent.emp_name);
//       expect(component.questionnaireForm.get('employeeId').value).toBe(empDataFromParent.emp_code);
//       // Check fields merged from service
//       expect(component.questionnaireForm.get('designationAtJoining').value).toBe('Intern');
//       // Check field from questionnaire_data
//       expect(component.questionnaireForm.get('contactAddress').value).toBe('123 Main St');
//       expect(component.isLoading).toBeFalse();
//     }));
    
//     it('should handle error from GetExitDetails', fakeAsync(() => {
//       mockEmployeeManagementService.GetExitDetails.and.returnValue(throwError(() => new Error('API Error')));
//       fixture.detectChanges();
//       tick();
//       expect(mockToastrService.error).toHaveBeenCalledWith('Failed to fetch exit details.');
//       expect(component.isLoading).toBeFalse();
//     }));
//   });

//   describe('Form Validations', () => {
//     beforeEach(() => {
//         fixture.detectChanges(); 
//     });

//     it('should be invalid when required fields are empty', () => {
//       component.questionnaireForm.patchValue({
//         employeeName: 'Test', 
//         contactAddress: '',
//         phoneNo: '',
//         emailId: '',
//         rankOfficeFacilities: null,
//         triggeringReasonEvent: '',
//         considerReturning: '',
//         recommendOrganization: '',
//         exitingEmployeeSignature: '',
//         exitingEmployeeDate: ''
//       });
//       expect(component.questionnaireForm.valid).toBeFalse();
//     });
    
//     it('should be valid when all required fields are filled', () => {
//         component.questionnaireForm.patchValue({
//             contactAddress: '123 Test St',
//             phoneNo: '1234567890',
//             emailId: 'test@example.com',
//             rankOfficeFacilities: 5, rankOrganizationPolicies: 5, rankFreedomAtWork: 5,
//             rankSkillDevelopment: 5, rankRelationshipPeers: 5, rankTrainingDevelopment: 5,
//             rankRelationshipSuperiors: 5, rankSystemsProcesses: 5, rankSalaryBenefits: 5,
//             rankWorkCultureProfessionalism: 5, rankProfessionalDevelopment: 5, rankCareerGrowth: 5,
//             triggeringReasonEvent: 'Event X',
//             considerReturning: 'Yes',
//             recommendOrganization: 'Yes',
//             exitingEmployeeSignature: 'Test User',
//             exitingEmployeeDate: '2023-01-01'
//         });
//         expect(component.questionnaireForm.valid).toBeTrue();
//     });

//     it('should validate rank fields for min/max values', () => {
//         const rankControl = component.questionnaireForm.get('rankOfficeFacilities');
//         rankControl.setValue(0); 
//         expect(rankControl.valid).toBeFalse();
//         rankControl.setValue(11); 
//         expect(rankControl.valid).toBeFalse();
//         rankControl.setValue(5); 
//         expect(rankControl.valid).toBeTrue();
//     });
//   });
  
//   describe('onSubmit', () => {
//     beforeEach(() => {
//         fixture.detectChanges(); 
//         component.questionnaireForm.patchValue({
//             contactAddress: '123 Test St', phoneNo: '1234567890', emailId: 'test@example.com',
//             rankOfficeFacilities: 5, rankOrganizationPolicies: 5, rankFreedomAtWork: 5,
//             rankSkillDevelopment: 5, rankRelationshipPeers: 5, rankTrainingDevelopment: 5,
//             rankRelationshipSuperiors: 5, rankSystemsProcesses: 5, rankSalaryBenefits: 5,
//             rankWorkCultureProfessionalism: 5, rankProfessionalDevelopment: 5, rankCareerGrowth: 5,
//             triggeringReasonEvent: 'Event X', considerReturning: 'Yes', recommendOrganization: 'Yes',
//             exitingEmployeeSignature: 'Test User', exitingEmployeeDate: '2023-01-01'
//         });
//     });

//     it('should not call AddEditExitDetails if form is invalid', () => {
//       component.questionnaireForm.get('contactAddress').setValue(''); 
//       component.onSubmit();
//       expect(mockEmployeeManagementService.AddEditExitDetails).not.toHaveBeenCalled();
//       expect(mockToastrService.error).toHaveBeenCalledWith('Please fill all required fields and correct any errors. Marked fields are mandatory.');
//     });

//     it('should call AddEditExitDetails with correct payload if form is valid', () => {
//       const expectedPayload = {
//         emp_id: empId,
//         questionnaire_data: component.questionnaireForm.getRawValue(),
//         created_by: mockUserSession.emp_id,
//         updated_by: mockUserSession.emp_id
//       };
//       mockEmployeeManagementService.AddEditExitDetails.and.returnValue(of({ statusCode: 200, message: 'Success' }));
      
//       component.onSubmit();
      
//       expect(mockEmployeeManagementService.AddEditExitDetails).toHaveBeenCalledWith(jasmine.objectContaining({
//           emp_id: expectedPayload.emp_id,
//           questionnaire_data: jasmine.any(Object), 
//           created_by: expectedPayload.created_by,
//           updated_by: expectedPayload.updated_by
//       }));
      
//       const actualPayload = mockEmployeeManagementService.AddEditExitDetails.calls.mostRecent().args[0];
//       expect(actualPayload.questionnaire_data.contactAddress).toBe('123 Test St');

//       expect(mockToastrService.success).toHaveBeenCalledWith('Exit Interview Questionnaire submitted successfully!');
//       expect(component.isLoading).toBeFalse();
//     });

//     it('should handle error from AddEditExitDetails', () => {
//       mockEmployeeManagementService.AddEditExitDetails.and.returnValue(throwError(() => new Error('API Error')));
//       component.onSubmit();
//       expect(mockToastrService.error).toHaveBeenCalledWith('An error occurred while submitting the questionnaire. Please try again.');
//       expect(component.isLoading).toBeFalse();
//     });

//      it('should handle specific error message from AddEditExitDetails if statusCode is not 200', () => {
//       mockEmployeeManagementService.AddEditExitDetails.and.returnValue(of({ statusCode: 400, message: 'Backend validation failed' }));
//       component.onSubmit();
//       expect(mockToastrService.error).toHaveBeenCalledWith('Backend validation failed');
//       expect(component.isLoading).toBeFalse();
//     });
//   });

// });
