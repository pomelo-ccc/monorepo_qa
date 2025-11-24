import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FaqService } from '../faq.service';
import { FaqItem } from '../models/faq.model';

@Component({
  selector: 'app-faq-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="faq-list-container">
      <div class="header">
        <h2>FAQ List</h2>
        <a routerLink="/create" class="btn btn-primary">Create New FAQ</a>
      </div>
      
      <div class="faq-grid">
        <div *ngFor="let faq of faqs" class="faq-card">
          <h3>{{ faq.title }}</h3>
          <div class="meta">
            <span class="badge">{{ faq.component }}</span>
            <span class="badge version">{{ faq.version }}</span>
          </div>
          <p class="summary">{{ faq.summary }}</p>
          <div class="actions">
            <a [routerLink]="['/edit', faq.id]" class="btn btn-sm">Edit</a>
            <button (click)="deleteFaq(faq.id)" class="btn btn-sm btn-danger">Delete</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .faq-list-container { padding: 20px; max-width: 1200px; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .faq-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
    .faq-card { border: 1px solid #ddd; padding: 15px; border-radius: 8px; background: #fff; display: flex; flex-direction: column; gap: 10px; }
    .meta { display: flex; gap: 10px; }
    .badge { background: #eee; padding: 2px 6px; border-radius: 4px; font-size: 0.8em; }
    .badge.version { background: #e0f7fa; color: #006064; }
    .summary { color: #666; font-size: 0.9em; flex-grow: 1; }
    .actions { display: flex; gap: 10px; margin-top: auto; }
    .btn { padding: 5px 10px; text-decoration: none; border-radius: 4px; cursor: pointer; border: none; }
    .btn-primary { background: #007bff; color: white; }
    .btn-sm { font-size: 0.8em; background: #f0f0f0; color: #333; }
    .btn-danger { background: #dc3545; color: white; }
  `]
})
export class FaqListComponent implements OnInit {
  faqs: FaqItem[] = [];

  constructor(private faqService: FaqService) { }

  ngOnInit() {
    this.loadFaqs();
  }

  loadFaqs() {
    this.faqService.getFaqs().subscribe(data => {
      this.faqs = data;
    });
  }

  deleteFaq(id: string) {
    if (confirm('Are you sure you want to delete this FAQ?')) {
      this.faqService.deleteFaq(id).subscribe(() => {
        this.loadFaqs();
      });
    }
  }
}
