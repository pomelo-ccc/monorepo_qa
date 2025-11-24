import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FaqItem } from './models/faq.model';

@Injectable({
    providedIn: 'root'
})
export class FaqService {
    private apiUrl = 'http://localhost:3000/api/faqs';

    constructor(private http: HttpClient) { }

    getFaqs(): Observable<FaqItem[]> {
        return this.http.get<FaqItem[]>(this.apiUrl);
    }

    getFaq(id: string): Observable<FaqItem> {
        return this.http.get<FaqItem>(`${this.apiUrl}/${id}`);
    }

    createFaq(faq: Partial<FaqItem>): Observable<FaqItem> {
        return this.http.post<FaqItem>(this.apiUrl, faq);
    }

    updateFaq(id: string, faq: Partial<FaqItem>): Observable<FaqItem> {
        return this.http.put<FaqItem>(`${this.apiUrl}/${id}`, faq);
    }

    deleteFaq(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
