import{c as e}from"./index-D1RxdqEy.js";var t={getAll:async()=>(await e.get(`/api/v1/message-templates`)).data?.data||[],create:async t=>(await e.post(`/api/v1/message-templates`,t)).data?.data,update:async(t,n)=>(await e.put(`/api/v1/message-templates/${t}`,n)).data?.data,delete:async t=>(await e.delete(`/api/v1/message-templates/${t}`)).data?.data,reset:async()=>(await e.post(`/api/v1/message-templates/reset`)).data?.data,saveAll:async t=>(await e.post(`/api/v1/message-templates/save-all`,{templates:t})).data?.data},n=window.location.origin+`/submission-tracking`,r=[{id:`bangla_standard`,name:`১. স্ট্যান্ডার্ড বাংলা তাগিদ (রবিবার সকালের ফলো-আপ)`,language:`bn`,category:`whatsapp_sms`,is_default:!0,is_system:!0,text:`আসসালামু আলাইকুম {salutation} {name},

বিএসআইএসসি (BSISC) থেকে অবহিত করা যাচ্ছে যে, '{batchTitle}'-এর লেসন প্ল্যান এখনও আপনার কাছ থেকে জমা পাওয়া যায়নি। শনিবার রাত ১১:৫৯ ছিল নির্ধারিত সময়।

অনুগ্রহ করে আজ রবিবারের মধ্যে শিক্ষক পোর্টালে গিয়ে আপনার লেসন প্ল্যান ফাইলটি সাবমিট করুন:
🌐 {portalUrl}

ধন্যবাদ,
একাডেমিক কো-অর্ডিনেটর ও কর্তৃপক্ষ
বারিধারা স্কলার্স ইন্টারন্যাশনাল স্কুল অ্যান্ড কলেজ`},{id:`with_login_credentials`,name:`২. পোর্টাল লিংক ও পাসওয়ার্ড সহ সরাসরি তাগিদ (With Password & Login Info)`,language:`bn`,category:`whatsapp_sms`,is_default:!1,is_system:!0,text:`আসসালামু আলাইকুম {salutation} {name},

বিএসআইএসসি (BSISC) লেসন প্ল্যান ট্র্যাকিং সিস্টেম অনুযায়ী '{batchTitle}'-এর ফাইল এখনও জমা দেওয়া হয়নি। অনুগ্রহ করে নিচের লিংকে গিয়ে সরাসরি আপলোড করুন।

🔑 আপনার লগইন বিবরণ:
🌐 পোর্টাল লিংক: {portalUrl}
👤 ইউজারনেম/মোবাইল: {phone}
🆔 এমপ্লয়ী আইডি: {employeeId}
🔒 পাসওয়ার্ড: {password} (বা আপনার পরিবর্তিত পাসওয়ার্ড)

ধন্যবাদ,
একাডেমিক কো-অর্ডিনেটর ও প্রশাসন
বিএসআইএসসি`},{id:`urgent_principal`,name:`৩. অধ্যক্ষ মহোদয়ের জরুরি নোটিশ (Urgent Directive)`,language:`bn`,category:`whatsapp`,is_default:!1,is_system:!0,text:`[জরুরি প্রাতিষ্ঠানিক নোটিশ]

সম্মানিত {salutation} {name},
অধ্যক্ষ মহোদয়ের নির্দেশক্রমে জানানো যাচ্ছে যে, '{batchTitle}'-এর লেসন প্ল্যান এখনও জমা পড়েনি। রবিবারের মনিটরিং রিপোর্টের পূর্বে অনুগ্রহ করে অবিলম্বে আপনার লেসন প্ল্যান ফাইল আপলোড করুন।

পোর্টাল লিংক:
🌐 {portalUrl}

ধন্যবাদ,
বিএসআইএসসি প্রশাসন`},{id:`bangla_short_with_pass`,name:`৪. সংক্ষিপ্ত এসএমএস / হোয়াটসঅ্যাপ (লিংক ও পাসওয়ার্ড সহ)`,language:`bn`,category:`sms`,is_default:!1,is_system:!0,text:`সম্মানিত {name}, '{batchTitle}'-এর লেসন প্ল্যান দ্রুত জমা দিন: {portalUrl} | ইউজার: {phone} | পাস: 123456 - BSISC`},{id:`english_formal`,name:`5. English Official Reminder (Formal with Login Link)`,language:`en`,category:`whatsapp_sms`,is_default:!1,is_system:!0,text:`Assalamu Alaikum {salutation} {name},

This is an official reminder from BSISC. Your Lesson Plan for '{batchTitle}' is currently pending submission. The designated deadline was Saturday 11:59 PM.

Please upload your lesson plan document via the teacher portal as soon as possible:
🌐 Portal Link: {portalUrl}
👤 Login ID: {phone} (EMP ID: {employeeId})
🔒 Default Password: {password}

Thank you,
Academic Coordinator & Authority
Baridhara Scholars' International School and College (BSISC)`}],i=e=>{if(!e)return null;let t=e.replace(/[^0-9]/g,``);return!t||t===`0`||t.length<10?null:t.startsWith(`880`)?t:t.startsWith(`0`)?`88`+t:(t.startsWith(`1`),`880`+t)},a=(e,t,r,i=n,a=`123456`)=>{let o=t.salutation?t.salutation:t.name.toLowerCase().includes(`begum`)||t.name.toLowerCase().includes(`akter`)||t.name.toLowerCase().includes(`shams`)||t.name.toLowerCase().includes(`mamataz`)?`Madam`:`Sir`,s=t.phone&&t.phone!==`0`?t.phone:`আপনার রেজিস্টার্ড মোবাইল নম্বর`,c=t.employee_id?t.employee_id:`N/A`,l=t.email||``,u=`🌐 লিংক: ${i}\n👤 ইউজার: ${s}\n🔒 পাসওয়ার্ড: ${a}`;return e.replace(/\{name\}/g,t.name).replace(/\{salutation\}/g,o).replace(/\{designation\}/g,t.designation||`Teacher`).replace(/\{department\}/g,t.department_name||``).replace(/\{batchTitle\}/g,r.title).replace(/\{deadline\}/g,r.deadline||`শনিবার রাত ১১:৫৯`).replace(/\{portalUrl\}/g,i).replace(/\{phone\}/g,s).replace(/\{mobile\}/g,s).replace(/\{email\}/g,l).replace(/\{employeeId\}/g,c).replace(/\{employee_id\}/g,c).replace(/\{password\}/g,a).replace(/\{loginInfo\}/g,u)},o=(e,t)=>`https://wa.me/${i(e)||e.replace(/[^0-9]/g,``)}?text=${encodeURIComponent(t)}`,s=(e,t)=>{let n=o(e,t);return n?(window.open(n,`_blank`,`noopener,noreferrer`),!0):!1};export{t as a,a as i,i as n,s as r,r as t};