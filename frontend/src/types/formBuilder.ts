export type FormType = 'admission' | 'job' | 'tender';

export type FieldType =
  | 'text'
  | 'select'
  | 'date'
  | 'number'
  | 'tel'
  | 'email'
  | 'textarea'
  | 'file'
  | 'radio'
  | 'checkbox';

export interface FormFieldOption {
  label_en: string;
  label_bn: string;
  value: string;
}

export interface FormField {
  id: string;
  field_key: string;
  category: string;
  label_en: string;
  label_bn: string;
  type: FieldType;
  placeholder?: string;
  options?: FormFieldOption[];
  required: boolean;
  visible: boolean;
  profile_sync?: string;
  grid_col?: number; // 1 to 12
}

export interface FormSection {
  id: string;
  section_key: string;
  name_en: string;
  name_bn: string;
  icon?: string;
  order: number;
  fields: FormField[];
}

export interface FormSchemaData {
  title: string;
  sub_title?: string;
  school_name?: string;
  school_id?: string;
  post_payment_document: string;
  layout_style: 'wizard' | 'single_page' | 'tabbed';
  sections: FormSection[];
}

export interface FormSchema {
  id: number;
  form_type: FormType;
  title: string;
  description?: string;
  is_default: boolean;
  post_payment_action?: string;
  layout_style?: string;
  schema_data: FormSchemaData;
  created_by?: number;
  creator?: {
    id: number;
    name: string;
    email: string;
  };
  created_at?: string;
  updated_at?: string;
}
