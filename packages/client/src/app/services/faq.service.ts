import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FaqItem } from '../models';

const API_URL = 'http://localhost:3000/api';

@Injectable({
  providedIn: 'root',
})
export class FaqService {
  private http = inject(HttpClient);

  getAll(): Observable<FaqItem[]> {
    return this.http.get<FaqItem[]>(`${API_URL}/faqs`);
  }

  getById(id: string): Observable<FaqItem> {
    return this.http.get<FaqItem>(`${API_URL}/faqs/${id}`);
  }

  create(faq: Partial<FaqItem>): Observable<FaqItem> {
    return this.http.post<FaqItem>(`${API_URL}/faqs`, faq);
  }

  update(id: string, faq: Partial<FaqItem>): Observable<FaqItem> {
    return this.http.put<FaqItem>(`${API_URL}/faqs/${id}`, faq);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${API_URL}/faqs/${id}`);
  }

  search(query: {
    keyword?: string;
    module?: string;
    tags?: string[];
    status?: string;
  }): Observable<FaqItem[]> {
    const params = new URLSearchParams();
    if (query.keyword) params.set('keyword', query.keyword);
    if (query.module) params.set('component', query.module);
    if (query.tags?.length) params.set('tags', query.tags.join(','));
    if (query.status) params.set('status', query.status);

    return this.http.get<FaqItem[]>(`${API_URL}/faqs/search?${params.toString()}`);
  }
}
