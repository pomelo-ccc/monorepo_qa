import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { UiLibComponent } from '@repo/ui-lib';
import { formatDate } from '@repo/utils';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, UiLibComponent],
  template: `
    <h1>Welcome to Client!</h1>
    <p>Current Date: {{ date }}</p>
    <lib-ui-lib></lib-ui-lib>
    <router-outlet></router-outlet>
  `,
  styles: [],
})
export class AppComponent {
  date = formatDate(new Date());
}
