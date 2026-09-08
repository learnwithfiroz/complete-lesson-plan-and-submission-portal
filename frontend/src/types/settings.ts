export interface PublicSettings {
  school_name_bn: string;
  school_name_en: string;
  school_eiin: string;
  school_code: string;
  college_code: string;
  address: string;
  email: string;
  phone: string;
  default_language: 'bn' | 'en';
  primary_color: string;
  secondary_color: string;
  academic_year: string;
  [key: string]: any;
}