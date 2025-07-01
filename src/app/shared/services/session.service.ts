import { Injectable } from '@angular/core';
import decode from 'jwt-decode';
@Injectable({
  providedIn: 'root'
})
export class SessionService {

  constructor() { }

check_user_session() {
    const sessionData = localStorage.getItem('activeUser');
    if (sessionData !== null) {
      const sessionObj: any = JSON.parse(sessionData);
      if (sessionObj && typeof sessionObj === 'object') {
        return true;
      } else {
        return false;
      }
    }
    return false;
  }

  set_user_session(data: any){
    localStorage.setItem('activeUser',JSON.stringify(data));
  }

  get_user_session(required_item=''){
    let session_obj:any = (localStorage.getItem('activeUser'));
    return session_obj;
    // const session_obj:any = JSON.parse(a);
    // console.log(a);

    // if(required_item == ''){
    //   return session_obj;
    // }else{
    //   if(required_item in session_obj){
    //       return session_obj.required_item;
    //   }else{
    //     return '';
    //   }
    // }
  }

   destroy_user_session(){
     localStorage.removeItem('activeUser');
     //localStorage.clear();
     
   }


}
