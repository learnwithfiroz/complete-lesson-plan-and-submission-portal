/**
 * WhatsApp Reminder Utilities for BSISC Lesson Plan Management System
 */

export interface ReminderTeacher {
  teacher_id?: number;
  id?: number;
  sl?: number;
  serial_number?: number;
  employee_id?: string;
  name: string;
  salutation?: string;
  designation?: string;
  department_name?: string;
  phone?: string | null;
  email?: string | null;
  is_submitted?: boolean;
}

export interface ReminderBatchInfo {
  id?: number;
  title: string;
  category?: string;
  deadline?: string;
  date_range?: string;
  class_name?: string;
}

export const DEFAULT_PORTAL_URL = window.location.origin + '/submission-tracking';

export interface MessageTemplate {
  id: string;
  name: string;
  language: 'bn' | 'en';
  category?: 'whatsapp' | 'sms' | 'whatsapp_sms' | 'general';
  text: string;
  is_default?: boolean;
  is_system?: boolean;
  updated_at?: string;
}

export const REMINDER_TEMPLATES: MessageTemplate[] = [
  {
    id: 'bangla_standard',
    name: '১. স্ট্যান্ডার্ড বাংলা তাগিদ (রবিবার সকালের ফলো-আপ)',
    language: 'bn',
    category: 'whatsapp_sms',
    is_default: true,
    is_system: true,
    text: `আসসালামু আলাইকুম {salutation} {name},

বিএসআইএসসি (BSISC) থেকে অবহিত করা যাচ্ছে যে, '{batchTitle}'-এর লেসন প্ল্যান এখনও আপনার কাছ থেকে জমা পাওয়া যায়নি। শনিবার রাত ১১:৫৯ ছিল নির্ধারিত সময়।

অনুগ্রহ করে আজ রবিবারের মধ্যে শিক্ষক পোর্টালে গিয়ে আপনার লেসন প্ল্যান ফাইলটি সাবমিট করুন:
🌐 {portalUrl}

ধন্যবাদ,
একাডেমিক কো-অর্ডিনেটর ও কর্তৃপক্ষ
বারিধারা স্কলার্স ইন্টারন্যাশনাল স্কুল অ্যান্ড কলেজ`,
  },
  {
    id: 'with_login_credentials',
    name: '২. পোর্টাল লিংক ও পাসওয়ার্ড সহ সরাসরি তাগিদ (With Password & Login Info)',
    language: 'bn',
    category: 'whatsapp_sms',
    is_default: false,
    is_system: true,
    text: `আসসালামু আলাইকুম {salutation} {name},

বিএসআইএসসি (BSISC) লেসন প্ল্যান ট্র্যাকিং সিস্টেম অনুযায়ী '{batchTitle}'-এর ফাইল এখনও জমা দেওয়া হয়নি। অনুগ্রহ করে নিচের লিংকে গিয়ে সরাসরি আপলোড করুন।

🔑 আপনার লগইন বিবরণ:
🌐 পোর্টাল লিংক: {portalUrl}
👤 ইউজারনেম/মোবাইল: {phone}
🆔 এমপ্লয়ী আইডি: {employeeId}
🔒 পাসওয়ার্ড: {password} (বা আপনার পরিবর্তিত পাসওয়ার্ড)

ধন্যবাদ,
একাডেমিক কো-অর্ডিনেটর ও প্রশাসন
বিএসআইএসসি`,
  },
  {
    id: 'urgent_principal',
    name: '৩. অধ্যক্ষ মহোদয়ের জরুরি নোটিশ (Urgent Directive)',
    language: 'bn',
    category: 'whatsapp',
    is_default: false,
    is_system: true,
    text: `[জরুরি প্রাতিষ্ঠানিক নোটিশ]

সম্মানিত {salutation} {name},
অধ্যক্ষ মহোদয়ের নির্দেশক্রমে জানানো যাচ্ছে যে, '{batchTitle}'-এর লেসন প্ল্যান এখনও জমা পড়েনি। রবিবারের মনিটরিং রিপোর্টের পূর্বে অনুগ্রহ করে অবিলম্বে আপনার লেসন প্ল্যান ফাইল আপলোড করুন।

পোর্টাল লিংক:
🌐 {portalUrl}

ধন্যবাদ,
বিএসআইএসসি প্রশাসন`,
  },
  {
    id: 'bangla_short_with_pass',
    name: '৪. সংক্ষিপ্ত এসএমএস / হোয়াটসঅ্যাপ (লিংক ও পাসওয়ার্ড সহ)',
    language: 'bn',
    category: 'sms',
    is_default: false,
    is_system: true,
    text: `সম্মানিত {name}, '{batchTitle}'-এর লেসন প্ল্যান দ্রুত জমা দিন: {portalUrl} | ইউজার: {phone} | পাস: 123456 - BSISC`,
  },
  {
    id: 'english_formal',
    name: '5. English Official Reminder (Formal with Login Link)',
    language: 'en',
    category: 'whatsapp_sms',
    is_default: false,
    is_system: true,
    text: `Assalamu Alaikum {salutation} {name},

This is an official reminder from BSISC. Your Lesson Plan for '{batchTitle}' is currently pending submission. The designated deadline was Saturday 11:59 PM.

Please upload your lesson plan document via the teacher portal as soon as possible:
🌐 Portal Link: {portalUrl}
👤 Login ID: {phone} (EMP ID: {employeeId})
🔒 Default Password: {password}

Thank you,
Academic Coordinator & Authority
Baridhara Scholars' International School and College (BSISC)`,
  },
];

/**
 * Sanitize and format Bangladeshi phone numbers for WhatsApp API.
 * e.g., '01780017602' -> '8801780017602'
 * '+8801780017602' -> '8801780017602'
 */
export const formatWhatsAppPhone = (phone?: string | null): string | null => {
  if (!phone) return null;
  const cleaned = phone.replace(/[^0-9]/g, '');
  if (!cleaned || cleaned === '0' || cleaned.length < 10) return null;

  if (cleaned.startsWith('880')) {
    return cleaned;
  }
  if (cleaned.startsWith('0')) {
    return '88' + cleaned;
  }
  if (cleaned.startsWith('1')) {
    return '880' + cleaned;
  }
  return '880' + cleaned;
};

/**
 * Render message template with placeholders replaced with teacher and batch data
 */
export const renderReminderMessage = (
  templateText: string,
  teacher: ReminderTeacher,
  batch: ReminderBatchInfo,
  portalUrl = DEFAULT_PORTAL_URL,
  defaultPassword = '123456'
): string => {
  const salutation = teacher.salutation ? teacher.salutation : (teacher.name.toLowerCase().includes('begum') || teacher.name.toLowerCase().includes('akter') || teacher.name.toLowerCase().includes('shams') || teacher.name.toLowerCase().includes('mamataz') ? 'Madam' : 'Sir');
  const phone = teacher.phone && teacher.phone !== '0' ? teacher.phone : 'আপনার রেজিস্টার্ড মোবাইল নম্বর';
  const employeeId = teacher.employee_id ? teacher.employee_id : 'N/A';
  const email = teacher.email || '';

  const loginInfo = `🌐 লিংক: ${portalUrl}\n👤 ইউজার: ${phone}\n🔒 পাসওয়ার্ড: ${defaultPassword}`;

  return templateText
    .replace(/\{name\}/g, teacher.name)
    .replace(/\{salutation\}/g, salutation)
    .replace(/\{designation\}/g, teacher.designation || 'Teacher')
    .replace(/\{department\}/g, teacher.department_name || '')
    .replace(/\{batchTitle\}/g, batch.title)
    .replace(/\{deadline\}/g, batch.deadline || 'শনিবার রাত ১১:৫৯')
    .replace(/\{portalUrl\}/g, portalUrl)
    .replace(/\{phone\}/g, phone)
    .replace(/\{mobile\}/g, phone)
    .replace(/\{email\}/g, email)
    .replace(/\{employeeId\}/g, employeeId)
    .replace(/\{employee_id\}/g, employeeId)
    .replace(/\{password\}/g, defaultPassword)
    .replace(/\{loginInfo\}/g, loginInfo);
};

/**
 * Generate a direct WhatsApp Web / App Click-to-Chat URL
 */
export const generateWhatsAppLink = (phone: string, message: string): string => {
  const formattedPhone = formatWhatsAppPhone(phone) || phone.replace(/[^0-9]/g, '');
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
};

/**
 * Open WhatsApp directly in a new tab / window
 */
export const openWhatsAppChat = (phone: string, message: string): boolean => {
  const link = generateWhatsAppLink(phone, message);
  if (!link) return false;
  window.open(link, '_blank', 'noopener,noreferrer');
  return true;
};
