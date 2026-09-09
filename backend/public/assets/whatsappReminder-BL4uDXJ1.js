import{c as e}from"./index-XUQLdHYI.js";var t={getAll:async()=>(await e.get(`/api/v1/message-templates`)).data?.data||[],create:async t=>(await e.post(`/api/v1/message-templates`,t)).data?.data,update:async(t,n)=>(await e.put(`/api/v1/message-templates/${t}`,n)).data?.data,delete:async t=>(await e.delete(`/api/v1/message-templates/${t}`)).data?.data,reset:async()=>(await e.post(`/api/v1/message-templates/reset`)).data?.data,saveAll:async t=>(await e.post(`/api/v1/message-templates/save-all`,{templates:t})).data?.data},n=window.location.origin+`/submission-tracking`,r=[{id:`bangla_standard`,name:`১. স্ট্যান্ডার্ড বাংলা তাগিদ (রবিবার সকালের ফলো-আপ)`,language:`bn`,text:`আসসালামু আলাইকুম {salutation} {name},

বিএসআইএসসি (BSISC) থেকে অবহিত করা যাচ্ছে যে, '{batchTitle}'-এর লেসন প্ল্যান এখনও আপনার কাছ থেকে জমা পাওয়া যায়নি। শনিবার রাত ১১:৫৯ ছিল নির্ধারিত সময়।

অনুগ্রহ করে আজ রবিবারের মধ্যে শিক্ষক পোর্টালে গিয়ে আপনার লেসন প্ল্যান ফাইলটি সাবমিট করুন:
🌐 {portalUrl}

ধন্যবাদ,
একাডেমিক কো-অর্ডিনেটর ও কর্তৃপক্ষ
বারিধারা স্কলার্স ইন্টারন্যাশনাল স্কুল অ্যান্ড কলেজ`},{id:`urgent_principal`,name:`২. অধ্যক্ষ মহোদয়ের জরুরি নোটিশ (Urgent Directive)`,language:`bn`,text:`[জরুরি প্রাতিষ্ঠানিক নোটিশ]

সম্মানিত {salutation} {name},
অধ্যক্ষ মহোদয়ের নির্দেশক্রমে জানানো যাচ্ছে যে, '{batchTitle}'-এর লেসন প্ল্যান এখনও জমা পড়েনি। রবিবারের মনিটরিং রিপোর্টের পূর্বে অনুগ্রহ করে অবিলম্বে আপনার লেসন প্ল্যান ফাইল আপলোড করুন।

পোর্টাল লিংক:
🌐 {portalUrl}

ধন্যবাদ,
বিএসআইএসসি প্রশাসন`},{id:`bangla_short`,name:`৩. সংক্ষিপ্ত বাংলা এসএমএস / হোয়াটসঅ্যাপ রিমাইন্ডার`,language:`bn`,text:`সম্মানিত {name} {salutation}, আপনার '{batchTitle}'-এর লেসন প্ল্যান এখনও জমা হয়নি। দয়া করে আজ রবিবারের মধ্যে পোর্টালে জমা দিন: {portalUrl}`},{id:`english_formal`,name:`4. English Official Reminder (Formal Notification)`,language:`en`,text:`Assalamu Alaikum {salutation} {name},

This is an official reminder from BSISC. Your Lesson Plan for '{batchTitle}' is currently pending submission. The designated deadline was Saturday 11:59 PM.

Please upload your lesson plan document via the teacher portal as soon as possible:
🌐 {portalUrl}

Thank you,
Academic Coordinator & Authority
Baridhara Scholars' International School and College (BSISC)`}],i=e=>{if(!e)return null;let t=e.replace(/[^0-9]/g,``);return!t||t===`0`||t.length<10?null:t.startsWith(`880`)?t:t.startsWith(`0`)?`88`+t:(t.startsWith(`1`),`880`+t)},a=(e,t,r,i=n)=>{let a=t.salutation?t.salutation:t.name.toLowerCase().includes(`begum`)||t.name.toLowerCase().includes(`akter`)||t.name.toLowerCase().includes(`shams`)||t.name.toLowerCase().includes(`mamataz`)?`Madam`:`Sir`;return e.replace(/\{name\}/g,t.name).replace(/\{salutation\}/g,a).replace(/\{designation\}/g,t.designation||`Teacher`).replace(/\{department\}/g,t.department_name||``).replace(/\{batchTitle\}/g,r.title).replace(/\{deadline\}/g,r.deadline||`শনিবার রাত ১১:৫৯`).replace(/\{portalUrl\}/g,i)},o=(e,t)=>`https://wa.me/${i(e)||e.replace(/[^0-9]/g,``)}?text=${encodeURIComponent(t)}`,s=(e,t)=>{let n=o(e,t);return n?(window.open(n,`_blank`,`noopener,noreferrer`),!0):!1};export{t as a,a as i,i as n,s as r,r as t};