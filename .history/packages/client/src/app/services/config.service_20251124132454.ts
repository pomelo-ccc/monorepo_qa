import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ModuleNode {
  id: string;
  name: string;
  children?: ModuleNode[];
}

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) { }

  // Modules
  getModules(): Observable<ModuleNode[]> {
    return this.http.get<ModuleNode[]>(`${this.apiUrl}/modules`);
  }

  saveModules(modules: ModuleNode[]): Observable<ModuleNode[]> {
    return this.http.put<ModuleNode[]>(`${this.apiUrl}/modules`, modules);
  }

  // Tags
  getTags(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/tags`);
  }

  addTag(tag: string): Observable<string[]> {
    return this.http.post<string[]>(`${this.apiUrl}/tags`, { tag });
  }

  updateTag(oldTag: string, newTag: string): Observable<string[]> {
    return this.http.put<string[]>(`${this.apiUrl}/tags/${encodeURIComponent(oldTag)}`, { newTag });
  }

  deleteTag(tag: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/tags/${encodeURIComponent(tag)}`);
  }
}
