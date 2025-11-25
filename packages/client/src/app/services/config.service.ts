import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ModuleNode {
  id: string;
  name: string;
  children?: ModuleNode[];
}

export interface Version {
  id: string;
  name: string;
  description?: string;
  createTime: string;
}

@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api';

  // Modules
  getModules(): Observable<ModuleNode[]> {
    return this.http.get<ModuleNode[]>(`${this.apiUrl}/modules`);
  }

  createModuleParent(data: { id: string; name: string }): Observable<ModuleNode> {
    return this.http.post<ModuleNode>(`${this.apiUrl}/modules`, data);
  }

  addModuleChild(parentId: string, data: { id: string; name: string }): Observable<ModuleNode> {
    return this.http.post<ModuleNode>(`${this.apiUrl}/modules/${parentId}/children`, data);
  }

  updateModuleName(id: string, name: string, parentId?: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/modules/${id}`, { name, parentId });
  }

  deleteModuleParent(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/modules/${id}`);
  }

  deleteModuleChild(parentId: string, childId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/modules/${parentId}/children/${childId}`);
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

  // Versions
  getVersions(): Observable<Version[]> {
    return this.http.get<Version[]>(`${this.apiUrl}/versions`);
  }

  addVersion(version: { name: string; description?: string }): Observable<Version> {
    return this.http.post<Version>(`${this.apiUrl}/versions`, version);
  }

  updateVersion(id: string, version: Partial<Version>): Observable<Version> {
    return this.http.put<Version>(`${this.apiUrl}/versions/${id}`, version);
  }

  deleteVersion(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/versions/${id}`);
  }
}
