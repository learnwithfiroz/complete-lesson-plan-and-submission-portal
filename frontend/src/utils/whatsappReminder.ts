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
  text: string;
}

export const REMINDER_TEMPLATES: MessageTemplate[] = [
  {
    id: 'bangla_standard',
    name: '১. স্ট্যান্ডার্ড বাংলা তাগিদ (রবিবার সকালের ফলো-আপ)',
    language: 'bn',
    text: `আসসালামু আলাইকুম {salutation} {name},

বিএসআইএসসি (BSISC) থেকে অবহিত করা যাচ্ছে যে, '{batchTitle}'-এর লেসন প্ল্যান এখনও আপনার কাছ থেকে জমা পাওয়া যায়নি। শনিবার রাত ১১:৫৯ ছিল নির্ধারিত সময়।

অনুগ্রহ করে আজ রবিবারের মধ্যে শিক্ষক পোর্টালে গিয়ে আপনার লেসন প্ল্যান ফাইলটি সাবমিট করুন:
🌐 {portalUrl}

ধন্যবাদ,
একাডেমিক কো-অর্ডিনেটর ও কর্তৃপক্ষ
বারিধারা স্কলার্স ইন্টারন্যাশনাল স্কুল অ্যান্ড কলেজ`,
  },
  {
    id: 'urgent_principal',
    name: '২. অধ্যক্ষ মহোদয়ের জরুরি নোটিশ (Urgent Directive)',
    language: 'bn',
    text: `[জরুরি প্রাতিষ্ঠানিক নোটিশ]

সম্মানিত {salutation} {name},
অধ্যক্ষ মহোদয়ের নির্দেশক্রমে জানানো যাচ্ছে যে, '{batchTitle}'-এর লেসন প্ল্যান এখনও জমা পড়েনি। রবিবারের মনিটরিং রিপোর্টের পূর্বে অনুগ্রহ করে অবিলম্বে আপনার লেসন প্ল্যান ফাইল আপলোড করুন।

পোর্টাল লিংক:
🌐 {portalUrl}

ধন্যবাদ,
বিএসআইএসসি প্রশাসন`,
  },
  {
    id: 'bangla_short',
    name: '৩. সংক্ষিপ্ত বাংলা এসএমএস / হোয়াটসঅ্যাপ রিমাইন্ডার',
    language: 'bn',
    text: `সম্মানিত {name} {salutation}, আপনার '{batchTitle}'-এর লেসন প্ল্যান এখনও জমা হয়নি। দয়া করে আজ রবিবারের মধ্যে পোর্টালে জমা দিন: {portalUrl}`,
  },
  {
    id: 'english_formal',
    name: '4. English Official Reminder (Formal Notification)',
    language: 'en',
    text: `Assalamu Alaikum {salutation} {name},

This is an official reminder from BSISC. Your Lesson Plan for '{batchTitle}' is currently pending submission. The designated deadline was Saturday 11:59 PM.

Please upload your lesson plan document via the teacher portal as soon as possible:
🌐 {portalUrl}

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
  portalUrl = DEFAULT_PORTAL_URL
): string => {
  const salutation = teacher.salutation ? teacher.salutation : (teacher.name.toLowerCase().includes('begum') || teacher.name.toLowerCase().includes('akter') || teacher.name.toLowerCase().includes('shams') || teacher.name.toLowerCase().includes('mamataz') ? 'Madam' : 'Sir');
  
  return templateText
    .replace(/\{name\}/g, teacher.name)
    .replace(/\{salutation\}/g, salutation)
    .replace(/\{designation\}/g, teacher.designation || 'Teacher')
    .replace(/\{department\}/g, teacher.department_name || '')
    .replace(/\{batchTitle\}/g, batch.title)
    .replace(/\{deadline\}/g, batch.deadline || 'শনিবার রাত ১১:৫৯')
    .replace(/\{portalUrl\}/g, portalUrl);
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
