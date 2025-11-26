import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ModuleNode, FlatModule, Version } from '../models';

const API_URL = 'http://localhost:3000/api';

@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  private http = inject(HttpClient);

  // Modules
  getModules(): Observable<ModuleNode[]> {
    return this.http.get<ModuleNode[]>(`${API_URL}/modules`);
  }

  /**
   * 获取扁平化的模块列表（用于下拉选择）
   */
  getFlatModules(): Observable<FlatModule[]> {
    return this.http.get<FlatModule[]>(`${API_URL}/modules/flat`);
  }

  /**
   * 获取模块选项（用于 Select 组件）
   */
  getModuleOptions(): Observable<{ label: string; value: string }[]> {
    return this.getFlatModules().pipe(
      map((modules) =>
        modules.map((m) => ({
          label: m.parentName ? `${m.parentName} - ${m.name}` : m.name,
          value: m.id,
        })),
      ),
    );
  }

  createModuleParent(data: { id: string; name: string }): Observable<ModuleNode> {
    return this.http.post<ModuleNode>(`${API_URL}/modules`, data);
  }

  addModuleChild(parentId: string, data: { id: string; name: string }): Observable<ModuleNode> {
    return this.http.post<ModuleNode>(`${API_URL}/modules/${parentId}/children`, data);
  }

  updateModuleName(id: string, name: string, parentId?: string): Observable<void> {
    return this.http.put<void>(`${API_URL}/modules/${id}`, { name, parentId });
  }

  deleteModuleParent(id: string): Observable<void> {
    return this.http.delete<void>(`${API_URL}/modules/${id}`);
  }

  deleteModuleChild(parentId: string, childId: string): Observable<void> {
    return this.http.delete<void>(`${API_URL}/modules/${parentId}/children/${childId}`);
  }

  saveModules(modules: ModuleNode[]): Observable<ModuleNode[]> {
    return this.http.put<ModuleNode[]>(`${API_URL}/modules`, modules);
  }

  // Tags
  getTags(): Observable<string[]> {
    return this.http.get<string[]>(`${API_URL}/tags`);
  }

  /**
   * 获取标签选项（用于 Select/Tag 组件）
   */
  getTagOptions(): Observable<{ label: string; value: string }[]> {
    return this.getTags().pipe(map((tags) => tags.map((t) => ({ label: t, value: t }))));
  }

  addTag(tag: string): Observable<string[]> {
    return this.http.post<string[]>(`${API_URL}/tags`, { tag });
  }

  updateTag(oldTag: string, newTag: string): Observable<string[]> {
    return this.http.put<string[]>(`${API_URL}/tags/${encodeURIComponent(oldTag)}`, { newTag });
  }

  deleteTag(tag: string): Observable<void> {
    return this.http.delete<void>(`${API_URL}/tags/${encodeURIComponent(tag)}`);
  }

  // Versions
  getVersions(): Observable<Version[]> {
    return this.http.get<Version[]>(`${API_URL}/versions`);
  }

  /**
   * 获取版本选项（用于 Select 组件）
   */
  getVersionOptions(): Observable<{ label: string; value: string }[]> {
    return this.getVersions().pipe(
      map((versions) => versions.map((v) => ({ label: v.name, value: v.name }))),
    );
  }

  addVersion(version: { name: string; description?: string }): Observable<Version> {
    return this.http.post<Version>(`${API_URL}/versions`, version);
  }

  updateVersion(id: string, version: Partial<Version>): Observable<Version> {
    return this.http.put<Version>(`${API_URL}/versions/${id}`, version);
  }

  deleteVersion(id: string): Observable<void> {
    return this.http.delete<void>(`${API_URL}/versions/${id}`);
  }
}
