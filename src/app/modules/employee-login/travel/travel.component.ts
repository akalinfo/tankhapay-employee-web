import { Component, Input } from '@angular/core';
import { EncrypterService } from 'src/app/shared/services/encrypter.service';

@Component({
  selector: 'app-travel',
  templateUrl: './travel.component.html',
  styleUrls: ['./travel.component.css']
})
export class TravelComponent {
  @Input() empDataFromParent: any;
  emp_code :any;

  constructor(
    private _encrypterService : EncrypterService
  ){}

  ngOnInit(){
    this.emp_code = this._encrypterService.aesEncrypt(this.empDataFromParent.emp_code);
 
  }
}
