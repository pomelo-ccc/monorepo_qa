export interface ModuleChild {
  id: string;
  name: string;
}

export interface ModuleNode {
  id: string;
  name: string;
  children?: ModuleChild[];
}
