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
  field_key?: string;
  key?: string;
  category?: string;
  category_tag?: string;
  label_en: string;
  label_bn: string;
  type: FieldType;
  placeholder?: string;
  placeholder_en?: string;
  placeholder_bn?: string;
  options?: FormFieldOption[];
  required: boolean;
  visible: boolean;
  profile_sync?: string;
  grid_col?: number; // 1 to 12
  col_width?: number;
}

export interface FormSection {
  id: string;
  section_key?: string;
  key?: string;
  name_en?: string;
  name_bn?: string;
  title_en?: string;
  title_bn?: string;
  icon?: string;
  order?: number;
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
  slug?: string;
  description?: string;
  instructions?: string;
  deadline?: string | null;
  is_active?: boolean;
  submission_count?: number;
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
