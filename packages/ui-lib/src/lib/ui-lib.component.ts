import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'lib-ui-lib',
    standalone: true,
    imports: [CommonModule],
    template: `
    <p>
      ui-lib works!
    </p>
  `,
    styles: ``
})
export class UiLibComponent { }
