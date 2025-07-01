import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ExitClearanceFormComponent } from './exit-clearance-form.component';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { EmployeeManagementService } from '../../employee-management/employee-management.service';
import { SessionService } from 'src/app/shared/services/session.service';
import { EncrypterService } from 'src/app/shared/services/encrypter.service';
import { ToastrService } from 'ngx-toastr';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of, throwError } from 'rxjs';

describe('ExitClearanceFormComponent', () => {
  let component: ExitClearanceFormComponent;
  let fixture: ComponentFixture<ExitClearanceFormComponent>;
  let mockEmployeeManagementService: jasmine.SpyObj<EmployeeManagementService>;
  let mockSessionService: jasmine.SpyObj<SessionService>;
  let mockEncrypterService: jasmine.SpyObj<EncrypterService>;
  let mockToastrService: jasmine.SpyObj<ToastrService>;
  let mockActivatedRoute: any;

  const empId = '123';
  const basicEmpData = {
    emp_name: 'Jane Doe',
    emp_code: 'E1002',
    department_name: 'HR',
    designation_name: 'HR Manager',
    dateofjoining: '2021-03-15',
    reporting_manager_name: 'Mr. Smith'
  };
  const empDataFromParent = { // Simulating localStorage.getItem('empDataFromParent')
    ...basicEmpData,
    last_working_day: '2023-12-31'
  };
  const mockUserSession = { emp_id: 'HRAdmin001' };

  beforeEach(async () => {
    mockEmployeeManagementService = jasmine.createSpyObj('EmployeeManagementService', ['GetExitDetails', 'AddEditExitDetails']);
    mockSessionService = jasmine.createSpyObj('SessionService', ['get_user_session']);
    mockEncrypterService = jasmine.createSpyObj('EncrypterService', ['aesDecrypt', 'aesEncrypt']);
    mockToastrService = jasmine.createSpyObj('ToastrService', ['success', 'error', 'info', 'warning']);

    mockActivatedRoute = {
      snapshot: {
        paramMap: convertToParamMap({ empId: empId })
      }
    };
    
    mockSessionService.get_user_session.and.returnValue(JSON.stringify({ token: 'fakeToken', emp_id: mockUserSession.emp_id }));
    

    await TestBed.configureTestingModule({
      declarations: [ExitClearanceFormComponent],
      imports: [ReactiveFormsModule, HttpClientTestingModule],
      providers: [
        FormBuilder,
        { provide: EmployeeManagementService, useValue: mockEmployeeManagementService },
        { provide: SessionService, useValue: mockSessionService },
        { provide: EncrypterService, useValue: mockEncrypterService },
        { provide: ToastrService, useValue: mockToastrService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ExitClearanceFormComponent);
    component = fixture.componentInstance;

    spyOn(localStorage, 'getItem').and.callFake((key: string) => {
      if (key === 'empDataFromParent') return JSON.stringify(empDataFromParent);
      if (key === 'emp_basic') return JSON.stringify(basicEmpData);
      return null;
    });
    
    mockEncrypterService.aesDecrypt.and.callFake((dataToDecrypt) => {
        if (dataToDecrypt === JSON.stringify(empDataFromParent)) return JSON.stringify(empDataFromParent);
        if (dataToDecrypt === JSON.stringify(basicEmpData)) return JSON.stringify(basicEmpData);
        if (typeof dataToDecrypt === 'string') return dataToDecrypt;
        return null; 
    });
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('ngOnInit and Data Loading', () => {
    it('should initialize form and call loadEmployeeDataAndDetails', () => {
      spyOn(component, 'initForm').and.callThrough();
      spyOn(component, 'loadEmployeeDataAndDetails').and.callThrough();
      fixture.detectChanges();
      expect(component.initForm).toHaveBeenCalled();
      expect(component.loadEmployeeDataAndDetails).toHaveBeenCalled();
      expect(component.empIdFromRoute).toBe(empId);
    });

    it('should load basic data from localStorage and call GetExitDetails for clearance', fakeAsync(() => {
      const serviceResponseData = {
            employee_info: { dateOfResignation: '2023-12-01' },
            clearance_data: { adminAccessCardRemarks: 'Y', adminAccessCardHodVerification: 'Returned' }
      };
      const mockClearanceDetailsResponse = { 
        statusCode: 200, 
        commonData: 'encryptedClearanceDataString'
      };

      mockEmployeeManagementService.GetExitDetails.and.returnValue(of(mockClearanceDetailsResponse));
      mockEncrypterService.aesDecrypt.withArgs('encryptedClearanceDataString').and.returnValue(JSON.stringify(serviceResponseData));


      fixture.detectChanges();
      tick();

      expect(localStorage.getItem).toHaveBeenCalledWith('empDataFromParent');
      expect(mockEmployeeManagementService.GetExitDetails).toHaveBeenCalledWith({ emp_id: empId, type: 'clearance' });
      
      expect(component.clearanceForm.get('employeeName').value).toBe(empDataFromParent.emp_name);
      expect(component.clearanceForm.get('dateOfResignation').value).toBe('2023-12-01');
      expect(component.clearanceForm.get('adminAccessCardRemarks').value).toBe('Y');
      expect(component.clearanceForm.get('adminAccessCardHodVerification').value).toBe('Returned');
      expect(component.isLoading).toBeFalse();
    }));

    it('should handle error from GetExitDetails for clearance', fakeAsync(() => {
      mockEmployeeManagementService.GetExitDetails.and.returnValue(throwError(() => new Error('API Error')));
      fixture.detectChanges();
      tick();
      expect(mockToastrService.error).toHaveBeenCalledWith('Failed to fetch exit clearance details.');
      expect(component.isLoading).toBeFalse();
    }));
  });

  describe('Form Validations', () => {
    beforeEach(() => {
        fixture.detectChanges(); 
    });

    it('should be invalid when required signature fields are empty', () => {
      component.clearanceForm.patchValue({
        employeeSignature: '',
        employeeDate: ''
      });
      expect(component.clearanceForm.valid).toBeFalse();
      expect(component.clearanceForm.get('employeeSignature').errors['required']).toBeTruthy();
      expect(component.clearanceForm.get('employeeDate').errors['required']).toBeTruthy();
    });
    
    it('should be valid when all required fields (signatures) are filled', () => {
        component.clearanceForm.patchValue({
            employeeSignature: 'Test User Sign',
            employeeDate: '2023-01-15'
        });
        expect(component.clearanceForm.valid).toBeTrue();
    });
  });
  
  describe('onSubmit', () => {
    beforeEach(() => {
        fixture.detectChanges(); 
        component.clearanceForm.patchValue({ 
            employeeSignature: 'Test User Sign',
            employeeDate: '2023-01-15'
        });
    });

    it('should not call AddEditExitDetails if form is invalid', () => {
      component.clearanceForm.get('employeeSignature').setValue(''); 
      component.onSubmit();
      expect(mockEmployeeManagementService.AddEditExitDetails).not.toHaveBeenCalled();
      expect(mockToastrService.error).toHaveBeenCalledWith('Please fill all required fields (Employee Signature and Date). Marked fields are mandatory.');
    });

    it('should call AddEditExitDetails with correct payload if form is valid', () => {
      const expectedPayload = {
        emp_id: empId,
        clearance_data: component.clearanceForm.getRawValue(),
        created_by: mockUserSession.emp_id,
        updated_by: mockUserSession.emp_id
      };
      mockEmployeeManagementService.AddEditExitDetails.and.returnValue(of({ statusCode: 200, message: 'Success' }));
      
      component.onSubmit();
      
      expect(mockEmployeeManagementService.AddEditExitDetails).toHaveBeenCalledWith(jasmine.objectContaining({
          emp_id: expectedPayload.emp_id,
          clearance_data: jasmine.any(Object),
          created_by: expectedPayload.created_by,
          updated_by: expectedPayload.updated_by
      }));
      const actualPayload = mockEmployeeManagementService.AddEditExitDetails.calls.mostRecent().args[0];
      expect(actualPayload.clearance_data.employeeSignature).toBe('Test User Sign');

      expect(mockToastrService.success).toHaveBeenCalledWith('Exit Clearance Form submitted successfully!');
      expect(component.isLoading).toBeFalse();
    });

    it('should handle error from AddEditExitDetails for clearance', () => {
      mockEmployeeManagementService.AddEditExitDetails.and.returnValue(throwError(() => new Error('API Error')));
      component.onSubmit();
      expect(mockToastrService.error).toHaveBeenCalledWith('An error occurred while submitting the clearance form.');
      expect(component.isLoading).toBeFalse();
    });

    it('should handle specific error message from AddEditExitDetails if statusCode is not 200', () => {
      mockEmployeeManagementService.AddEditExitDetails.and.returnValue(of({ statusCode: 500, message: 'Server issue' }));
      component.onSubmit();
      expect(mockToastrService.error).toHaveBeenCalledWith('Server issue');
      expect(component.isLoading).toBeFalse();
    });
  });

});
