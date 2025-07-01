import { AfterViewInit, Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import decode from 'jwt-decode';
import { ActivityLogsService } from './shared/services/activity-logs.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit {
  title = 'Tpay';
  showEmailForm: boolean = true; // Set this to true by default
  showMobileForm: boolean = false;

  constructor(private router: Router,
    private activityLogsService: ActivityLogsService) { }

  // New logic for Activity Logging using Centralised Implementation - sidharth kaul dated. 06.05.2025
  ngAfterViewInit() {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {

        setTimeout(() => {
          const h3 = document.querySelector('h3.text-themecolor');
          const moduleName = h3?.textContent?.trim();
          const currentRoute = this.router.url;
          const lastLoggedRoute = sessionStorage.getItem('lastActivityRoute');

          // console.log("Navigated to moduleName --", moduleName);

          if (moduleName && currentRoute !== lastLoggedRoute) {
            const activeUser: string | null = localStorage.getItem('activeUser');
            if (activeUser) {
              const token = decode(JSON.parse(activeUser).token);
              this.activityLogsService.insertActivityLog(token, moduleName, currentRoute);
              sessionStorage.setItem('lastActivityRoute', currentRoute);
            }
          }
        }, 0);
      });
  }
  // New logic - End

  ngOnInit() {
    const loader = document.getElementById('global-loader');
    if (loader) {
      loader.style.display = 'none';
    }
  }

}
