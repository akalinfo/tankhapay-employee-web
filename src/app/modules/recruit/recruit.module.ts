import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoreModule } from "../../components/core/core.module";
import { OfferLetterComponent } from './offer-letter/offer-letter.component';
import { RecruitRoutingModule } from './recruit-routing.module';
import { NgxSummernoteModule } from 'ngx-summernote';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { TagInputModule } from 'ngx-chips';
import { OfferLetterStatusComponent } from './offer-letter-status/offer-letter-status.component';
import { SafeUrlPipe } from 'src/app/shared/pipes/safe-url.pipe';
import { AngularEditorModule } from '@kolkov/angular-editor';
import { NgSelectModule } from '@ng-select/ng-select'

@NgModule({
    declarations: [
        OfferLetterComponent,
        OfferLetterStatusComponent,
        SafeUrlPipe
    ],
    imports: [
        CommonModule,
        RecruitRoutingModule,
        CoreModule,
        ReactiveFormsModule,
        NgxSummernoteModule,
        NgxPaginationModule,
        TagInputModule,
        FormsModule,
        AngularEditorModule,
        NgSelectModule
    ]
})
export class RecruitModule { }
