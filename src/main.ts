import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { Title } from '@angular/platform-browser';

import { AppModule } from './app/app.module';


platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
