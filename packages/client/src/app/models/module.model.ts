export interface ModuleChild {
  id: string;
  name: string;
}

export interface ModuleNode {
  id: string;
  name: string;
  children?: ModuleChild[];
}

export interface FlatModule {
  id: string;
  name: string;
  parentId?: string;
  parentName?: string;
}
