export interface Role {
  id: number;
  name: 'super_admin' | 'principal' | 'academic_coordinator' | 'teacher' | string;
  display_name_bn: string;
  display_name_en: string;
  description?: string;
}

export interface Department {
  id: number;
  name_bn: string;
  name_en: string;
  code: string;
}

export interface User {
  id: number;
  employee_id?: string;
  serial_number?: number;
  sl?: number;
  name: string;
  name_bn?: string;
  salutation?: string;
  gender?: string;
  religion?: string;
  blood_group?: string;
  date_of_birth?: string;
  join_date?: string;
  nid?: string;
  nationality?: string;
  father_name?: string;
  mother_name?: string;
  present_address?: string;
  permanent_address?: string;
  home_district?: string;
  emergency_contact_name?: string;
  emergency_contact_relation?: string;
  emergency_contact_phone?: string;
  appointment_subject?: string;
  teaching_subject?: string;
  school_hours?: string;
  employee_type?: string;
  bio?: string;
  facebook_url?: string;
  bank_account_no?: string;
  bank_name?: string;
  email: string;
  phone?: string;
  designation?: string;
  department?: Department | null;
  avatar?: string | null;
  is_active: boolean;
  login_count?: number;
  last_login_at?: string | null;
  last_login_ip?: string | null;
  last_login_device?: string | null;
  roles: Role[];
  role_names: string[];
  permissions: string[];
  created_at?: string;
}

export interface LoginHistoryItem {
  id: number;
  user_id: number;
  ip_address: string;
  device_type: 'Desktop' | 'Mobile' | 'Tablet' | string;
  browser: string;
  platform: string;
  location: string;
  user_agent?: string;
  logged_in_at: string;
  created_at?: string;
}

export interface LoginHistoryResponse {
  success: boolean;
  data: LoginHistoryItem[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  summary: {
    total_logins: number;
    last_login_at?: string | null;
    last_login_ip?: string | null;
    current_ip: string;
    current_device?: string | null;
  };
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: { user: User; token: string }) => void;
  logout: () => void;
  setUser: (user: User) => void;
  hasRole: (role: string | string[]) => boolean;
  hasPermission: (permission: string | string[]) => boolean;
}