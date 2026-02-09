import { Directive, input, TemplateRef } from '@angular/core';

@Directive({
  selector: '[appColumnTemplate]',
  standalone: true,
})
export class ColumnTableDirective {
  appColumnTemplate = input.required<string>();

  constructor(public templateRef: TemplateRef<unknown>) {}
}
