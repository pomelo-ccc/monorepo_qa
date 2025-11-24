import { Routes } from '@angular/router';
import { FaqListComponent } from './faq-list/faq-list.component';
import { FaqEditComponent } from './faq-edit/faq-edit.component';

export const routes: Routes = [
    { path: '', component: FaqListComponent },
    { path: 'create', component: FaqEditComponent },
    { path: 'edit/:id', component: FaqEditComponent },
    { path: '**', redirectTo: '' }
];
