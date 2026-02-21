export interface Group {
  id: string;
  nome_do_grupo: string;
  descricao?: string;
  status: 'ativo' | 'inativo';
  created_at?: string;
}

export interface Brother {
  id: string;
  nome_completo: string;
  telefone: string;
  email: string;
  grupo_id: string;
  ativo: boolean;
  data_cadastro: string;
  grupo?: Group;
}

export interface Territory {
  id: string;
  nome_territorio: string;
  descricao?: string;
  mapa_imagem_url?: string;
  mapa_url?: string;
  grupo_id: string;
  ativo: boolean;
  data_cadastro: string;
  grupo?: Group;
}

export interface FieldServiceAssignment {
  id: string;
  grupo_id: string;
  data_saida: string;
  irmao_id: string;
  territorio_id: string;
  status: 'gerado' | 'concluido';
  created_at: string;
  irmao?: Brother;
  territorio?: Territory;
  grupo?: Group;
}

export type GroupInput = Omit<Group, 'id' | 'created_at'>;
export type BrotherInput = Omit<Brother, 'id' | 'data_cadastro' | 'grupo'>;
export type TerritoryInput = Omit<Territory, 'id' | 'data_cadastro' | 'grupo'>;
export type FieldServiceInput = Omit<FieldServiceAssignment, 'id' | 'created_at' | 'irmao' | 'territorio' | 'grupo'>;

export interface Profile {
  id: string;
  theme: 'claro' | 'escuro' | 'automatico';
  font_size: 'pequena' | 'media' | 'grande';
  layout_mode: 'padrao' | 'compacto';
  updated_at?: string;
}

export type Settings = Omit<Profile, 'id' | 'updated_at'>;
