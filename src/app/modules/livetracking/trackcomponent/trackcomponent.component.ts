//componennt
import { Component, Injectable } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, Routes } from '@angular/router'; // 👈 Needed for routerLink
import { DataService } from '../data.service';





@Injectable({
  providedIn: 'root'
})

@Component({
  selector: 'app-trackcomponent',
  templateUrl: './trackcomponent.component.html',
  styleUrls: ['./trackcomponent.component.css'],
})

export class TrackcomponentComponent {
 
  constructor( private router: Router, private dataService: DataService) 
    {
    //   const state = this.dataService.getData();
    //   if (state) {
    //     this.customeraccountid = state.customeraccountid;
    //     this.token = state.token;
    //     console.log('Received Customer Account ID:', this.customeraccountid);
    //     console.log('Received Token:', this.token);
    //   } else {
    //     console.log('No data received from service.');
    //   }

    }
 

  showSubTabs = false;
  selectedTab: string = '';
  isLoading: boolean = false;
  customeraccountid: string= ''; // static 
  token = '';
  

  subTabsList = [
    { label: 'List Employees', route: '/monitoring/list-employees' },
    { label: 'Live Tracking', route: '/monitoring/live-tracking' },
  ];

  

  toggleSubTabs() {
    this.showSubTabs = !this.showSubTabs;
  }

 
  selectTab(tab: { label: string; route: string }) {
    this.selectedTab = tab.label;
    this.router.navigate([tab.route]);
  }
  
  
}