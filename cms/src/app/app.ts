import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastModule],
  template: `
    <p-toast />
    <router-outlet />
  `,
})
export class App implements OnInit {
  translateService = inject(TranslateService);
  ngOnInit(): void {
    let lang = localStorage.getItem('autocare-cms-lang');
    if (!lang) {
      lang = 'en';
    }
    this.translateService.use(lang);
  }
}
