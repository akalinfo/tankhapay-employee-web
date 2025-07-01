
 export  interface liveTrackingEmployee{
    emp_name: string;
    mobile:string;
    emp_code: string;
    customeraccountid: string;
    orgempcode:string;
    emp_checkIn:string;
    emp_checkOut:string;
    emp_batteryStatus:string;
    emp_gpsStatus:string;
    emp_checkInLocation:string;
    emp_checkOutLocation:string;
    event_details: EventDetail[]; 
  }  
  export interface EventDetail {
    check_in_time: string;
    check_out_time: string;
    check_in_location: string;
    check_out_location: string;
  
  }

  export interface GetEmployeeDetail {
    customerAccountId: string;
    empCode: string;
    latitude: string;
    longitude: string;
    locationStatus: string;
    batteryPercentage: string;
    deviceType: string;
    eventid: string;   //26-05-2025
    dateTime: string;
  }
