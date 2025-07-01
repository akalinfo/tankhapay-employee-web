import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router'
import { SessionService } from '../../shared/services/session.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-logout',
  templateUrl: './logout.component.html',
  styleUrls: ['./logout.component.css']
})
export class LogoutComponent implements OnInit {

  constructor(
    private router: Router,
    public toastr: ToastrService,
    private _SessionService: SessionService,
  ) { }

  ngOnInit() {
    if (this._SessionService.check_user_session()) {
      this._SessionService.destroy_user_session();
      localStorage.clear();
      // this.toastr.success('You have Logout successfully', 'success');
      this.router.navigate(['/login']);
    }
    else {
      localStorage.clear();
      this.router.navigate(['/login']);
    }

  }

  logIn() {
    if (this._SessionService.check_user_session()) {
      this._SessionService.destroy_user_session();
      localStorage.clear();
    }
    this.router.navigate(['/login']);
  }

}
