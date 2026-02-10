import { NgClass } from '@angular/common';
import { Component, inject, signal, computed, input } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-language-picker',
  standalone: true,
  imports: [NgClass],
  template: `
    <button
      class="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-gray-800 transition-colors w-full overflow-hidden"
      (click)="toggleLanguage()"
    >
      <i class="pi pi-globe text-lg min-w-[1.5rem] text-center"></i>
      <span
        class="whitespace-nowrap transition-opacity duration-300 mb-[2px]"
        [ngClass]="{ '!opacity-100': forceShowText() }"
      >
        {{ buttonText() }}
      </span>
    </button>
  `,
  styles: `
    :host {
      display: contents;
    }
  `,
})
export class LanguagePickerComponent {
  private translate = inject(TranslateService);

  forceShowText = input(false);

  selectedLanguage = signal<string>(this.getInitialLanguage());

  buttonText = computed(() => {
    return this.selectedLanguage() === 'en'
      ? 'Pregledaj na srpskom'
      : 'View in English';
  });

  constructor() {
    // Set initial language
    this.translate.use(this.selectedLanguage());
  }

  private getInitialLanguage(): string {
    const savedLanguage = localStorage.getItem('autocare-cms-lang');
    return savedLanguage || 'en';
  }

  toggleLanguage(): void {
    const newLanguage = this.selectedLanguage() === 'en' ? 'sr' : 'en';
    this.selectedLanguage.set(newLanguage);
    this.translate.use(newLanguage);
    localStorage.setItem('autocare-cms-lang', newLanguage);
  }
}
