import{r as e}from"./rolldown-runtime-hePW80VL.js";import{l as t}from"./vendor-forms-C5v7U0Kt.js";import{Z as n}from"./vendor-libs-D7L-SkhJ.js";import{$ as r,An as i,At as a,C as o,Dt as s,Fn as c,Ft as l,G as u,Ht as d,It as f,Kt as p,Lt as m,Mt as h,O as g,P as _,Q as v,U as y,_n as b,a as x,bn as S,cn as ee,ct as te,f as C,fn as w,g as ne,in as T,jn as re,jt as E,k as ie,kt as D,m as ae,mn as O,nn as oe,nt as se,on as k,p as ce,qt as le,s as ue,sn as A,tn as de,v as j,vn as M,vt as fe,wt as pe,xn as me,y as he,yn as N,yt as ge,z as P}from"./vendor-react-CVOhUCv8.js";import{t as F}from"./submissionTracking-ZPOtqds_.js";var I=e(t(),1),_e=window.location.origin+`/submission-tracking`,L=[{id:`bangla_standard`,name:`১. স্ট্যান্ডার্ড বাংলা তাগিদ (রবিবার সকালের ফলো-আপ)`,language:`bn`,text:`আসসালামু আলাইকুম {salutation} {name},

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
Baridhara Scholars' International School and College (BSISC)`}],R=e=>{if(!e)return null;let t=e.replace(/[^0-9]/g,``);return!t||t===`0`||t.length<10?null:t.startsWith(`880`)?t:t.startsWith(`0`)?`88`+t:(t.startsWith(`1`),`880`+t)},z=(e,t,n,r=_e)=>{let i=t.salutation?t.salutation:t.name.toLowerCase().includes(`begum`)||t.name.toLowerCase().includes(`akter`)||t.name.toLowerCase().includes(`shams`)||t.name.toLowerCase().includes(`mamataz`)?`Madam`:`Sir`;return e.replace(/\{name\}/g,t.name).replace(/\{salutation\}/g,i).replace(/\{designation\}/g,t.designation||`Teacher`).replace(/\{department\}/g,t.department_name||``).replace(/\{batchTitle\}/g,n.title).replace(/\{deadline\}/g,n.deadline||`শনিবার রাত ১১:৫৯`).replace(/\{portalUrl\}/g,r)},B=(e,t)=>`https://wa.me/${R(e)||e.replace(/[^0-9]/g,``)}?text=${encodeURIComponent(t)}`,ve=(e,t)=>{let n=B(e,t);return n?(window.open(n,`_blank`,`noopener,noreferrer`),!0):!1},V=n(),ye=({data:e,onPrint:t,onOpenWhatsApp:n})=>{let r=()=>{let t=e.not_submitted_teachers.map(e=>e.phone).filter(e=>e&&e!==`0`&&e!==`N/A`);if(t.length===0){c.info(`অনুপস্থিত শিক্ষকদের কোনো ফোন নম্বর পাওয়া যায়নি বা সবাই জমা দিয়েছেন!`);return}navigator.clipboard.writeText(t.join(`, `)),c.success(`মোট ${t.length} জন মিসিং শিক্ষকের ফোন নম্বর কপি করা হয়েছে! (SMS / WhatsApp এ পেস্ট করতে পারেন)`)},i=e.summary.not_submitted_count===0&&e.summary.total_teachers>0;return(0,V.jsxs)(`div`,{className:`professional-report-container bg-white p-4 p-md-5 rounded-3 shadow-sm border`,id:`printable-official-report`,children:[(0,V.jsxs)(`div`,{className:`report-header pb-3 mb-4 border-bottom position-relative`,children:[(0,V.jsxs)(`div`,{className:`d-flex align-items-center justify-content-between flex-wrap gap-3`,children:[(0,V.jsxs)(`div`,{className:`d-flex align-items-center gap-3`,children:[(0,V.jsx)(`div`,{className:`logo-box p-1 rounded-circle border shadow-sm bg-white d-flex align-items-center justify-content-center`,style:{width:`85px`,height:`85px`,minWidth:`85px`,borderColor:`#1e3a8a`},children:(0,V.jsx)(`img`,{src:`/logo.png`,alt:`BSISC Official Seal`,style:{width:`75px`,height:`75px`,objectFit:`contain`},onError:e=>{e.target.onerror=null,e.target.src=`/logo.svg`}})}),(0,V.jsxs)(`div`,{children:[(0,V.jsx)(`h3`,{className:`fw-black text-dark mb-0 tracking-wide`,style:{fontSize:`1.45rem`,fontWeight:800,color:`#1e3a8a`},children:e.school_name}),(0,V.jsx)(`div`,{className:`text-secondary fw-semibold mb-1`,style:{fontSize:`0.95rem`},children:e.school_name_bn||`বারিধারা স্কলার্স ইন্টারন্যাশনাল স্কুল অ্যান্ড কলেজ`}),(0,V.jsx)(`div`,{className:`text-muted small`,children:e.address})]})]}),(0,V.jsxs)(`div`,{className:`text-md-end text-start`,children:[(0,V.jsxs)(`div`,{className:`d-flex flex-wrap justify-content-md-end gap-1 mb-1`,children:[(0,V.jsxs)(`span`,{className:`badge bg-light text-primary border px-2 py-1 font-monospace`,style:{fontSize:`0.78rem`},children:[`EIIN: `,(0,V.jsx)(`strong`,{children:e.eiin})]}),(0,V.jsxs)(`span`,{className:`badge bg-light text-primary border px-2 py-1 font-monospace`,style:{fontSize:`0.78rem`},children:[`School Code: `,(0,V.jsx)(`strong`,{children:e.school_code})]}),(0,V.jsxs)(`span`,{className:`badge bg-light text-primary border px-2 py-1 font-monospace`,style:{fontSize:`0.78rem`},children:[`College Code: `,(0,V.jsx)(`strong`,{children:e.college_code})]})]}),(0,V.jsxs)(`div`,{className:`small text-muted font-monospace`,children:[`Ref: `,(0,V.jsx)(`strong`,{className:`text-dark`,children:e.ref_no||`BSISC/ACAD/MONITOR/${e.batch.id}`})]}),t&&(0,V.jsx)(`div`,{className:`mt-2 d-print-none`,children:(0,V.jsxs)(N,{variant:`outline-primary`,size:`sm`,className:`d-inline-flex align-items-center`,onClick:t,children:[(0,V.jsx)(_,{size:14,className:`me-1`}),`প্রিন্ট করুন / Save as PDF`]})})]})]}),(0,V.jsx)(`div`,{className:`mt-3`,style:{height:`4px`,background:`linear-gradient(90deg, #1e3a8a 0%, #3b82f6 50%, #eab308 100%)`,borderRadius:`2px`}})]}),(0,V.jsx)(`div`,{className:`text-center mb-4`,children:(0,V.jsxs)(`div`,{className:`d-inline-block px-4 py-2 rounded-pill bg-light border shadow-xs`,children:[(0,V.jsxs)(`h5`,{className:`fw-bold text-dark mb-0 text-uppercase d-flex align-items-center justify-content-center`,style:{letterSpacing:`0.5px`},children:[(0,V.jsx)(fe,{size:18,className:`me-2 text-primary`}),e.batch.category.replace(`_`,` `),` Submission & Compliance Report`]}),(0,V.jsx)(`div`,{className:`text-muted small fw-medium mt-1`,children:`পাঠ পরিকল্পনা ও কার্যবিবরণী ট্র্যাকিং রিপোর্ট (রবিবার সকালের বিশেষ মনিটরিং)`})]})}),(0,V.jsx)(`div`,{className:`bg-light p-3 rounded-3 border mb-4`,children:(0,V.jsxs)(A,{className:`g-2 small`,children:[(0,V.jsxs)(b,{md:6,children:[(0,V.jsxs)(`div`,{className:`mb-1`,children:[(0,V.jsx)(`strong`,{children:`ব্যাচ শিরোনাম (Batch Title):`}),` `,(0,V.jsx)(`span`,{className:`text-dark fw-semibold`,children:e.batch.title})]}),(0,V.jsxs)(`div`,{className:`mb-1`,children:[(0,V.jsx)(`strong`,{children:`শ্রেণি / বিভাগ (Target Class):`}),` `,(0,V.jsx)(`span`,{className:`badge bg-white text-dark border`,children:e.batch.class_name})]}),(0,V.jsxs)(`div`,{children:[(0,V.jsx)(`strong`,{children:`কার্যকাল (Date Range):`}),` `,(0,V.jsx)(`span`,{className:`text-dark`,children:e.batch.date_range})]})]}),(0,V.jsxs)(b,{md:6,className:`text-md-end`,children:[(0,V.jsxs)(`div`,{className:`mb-1 text-danger fw-semibold`,children:[(0,V.jsx)(E,{size:13,className:`me-1`}),(0,V.jsx)(`strong`,{children:`ডেডলাইন (Deadline):`}),` `,e.batch.deadline_display]}),(0,V.jsxs)(`div`,{className:`mb-1`,children:[(0,V.jsx)(p,{size:13,className:`me-1 text-primary`}),(0,V.jsx)(`strong`,{children:`রিপোর্ট প্রস্তুতের সময়:`}),` `,e.generated_at]}),(0,V.jsxs)(`div`,{children:[(0,V.jsx)(`strong`,{children:`স্ট্যাটাস:`}),` `,i?(0,V.jsx)(`span`,{className:`badge bg-success`,children:`১০০% সম্পূর্ণ (Fully Compliant)`}):(0,V.jsx)(`span`,{className:`badge bg-danger`,children:`জরুরি ফলো-আপ প্রয়োজন (Action Required)`})]})]})]})}),(0,V.jsxs)(A,{className:`g-3 mb-4 text-center`,children:[(0,V.jsx)(b,{md:3,xs:6,children:(0,V.jsxs)(`div`,{className:`p-3 border rounded-3 bg-white shadow-xs`,children:[(0,V.jsx)(`div`,{className:`text-muted small fw-semibold`,children:`মোট শিক্ষক (Total Faculty)`}),(0,V.jsx)(`h3`,{className:`fw-bold text-dark mb-0 mt-1`,children:e.summary.total_teachers}),(0,V.jsx)(`div`,{className:`small text-muted mt-1`,children:`জন শিক্ষক`})]})}),(0,V.jsx)(b,{md:3,xs:6,children:(0,V.jsxs)(`div`,{className:`p-3 border rounded-3 shadow-xs`,style:{backgroundColor:`#f0fdf4`,borderColor:`#86efac`},children:[(0,V.jsx)(`div`,{className:`text-success small fw-semibold`,children:`জমা দিয়েছেন (Submitted)`}),(0,V.jsx)(`h3`,{className:`fw-bold text-success mb-0 mt-1`,children:e.summary.submitted_count}),(0,V.jsx)(`div`,{className:`small text-success mt-1`,children:`সফলভাবে প্রাপ্ত`})]})}),(0,V.jsx)(b,{md:3,xs:6,children:(0,V.jsxs)(`div`,{className:`p-3 border rounded-3 shadow-xs`,style:{backgroundColor:`#fef2f2`,borderColor:`#fca5a5`},children:[(0,V.jsx)(`div`,{className:`text-danger small fw-semibold`,children:`জমা দেননি (Not Submitted)`}),(0,V.jsx)(`h3`,{className:`fw-bold text-danger mb-0 mt-1`,children:e.summary.not_submitted_count}),(0,V.jsx)(`div`,{className:`small text-danger mt-1`,children:`বকেয়া / অনুপস্থিত`})]})}),(0,V.jsx)(b,{md:3,xs:6,children:(0,V.jsxs)(`div`,{className:`p-3 border rounded-3 shadow-xs`,style:{backgroundColor:`#eff6ff`,borderColor:`#bfdbfe`},children:[(0,V.jsx)(`div`,{className:`text-primary small fw-semibold`,children:`সম্পূর্ণতার হার (Rate)`}),(0,V.jsxs)(`h3`,{className:`fw-bold text-primary mb-0 mt-1`,children:[e.summary.completion_percent,`%`]}),(0,V.jsx)(`div`,{className:`small text-primary mt-1`,children:e.summary.completion_percent>80?`সন্তোষজনক`:`ফলো-আপ চলছে`})]})})]}),(0,V.jsxs)(`div`,{className:`section-missing mb-5`,children:[(0,V.jsxs)(`div`,{className:`d-flex justify-content-between align-items-center mb-2 flex-wrap gap-2`,children:[(0,V.jsxs)(`div`,{className:`d-flex align-items-center`,children:[(0,V.jsx)(`div`,{className:`p-1 px-2 rounded bg-danger text-white me-2 small fw-bold`,children:`SECTION A`}),(0,V.jsxs)(`h6`,{className:`fw-bold text-danger mb-0 d-flex align-items-center`,children:[(0,V.jsx)(C,{size:17,className:`me-2 text-danger`}),`যে সকল শিক্ষক শনিবার রাতের মধ্যে জমা দেননি (অনুপস্থিত তালিকা: `,e.not_submitted_teachers.length,` জন)`]})]}),(0,V.jsx)(`div`,{className:`d-flex gap-2 d-print-none`,children:e.not_submitted_teachers.length>0&&(0,V.jsxs)(V.Fragment,{children:[n&&(0,V.jsxs)(N,{variant:`success`,size:`sm`,className:`d-flex align-items-center fw-bold text-white shadow-xs`,style:{backgroundColor:`#25D366`,borderColor:`#25D366`},onClick:n,children:[(0,V.jsx)(u,{size:13,className:`me-1`}),`হোয়াটসঅ্যাপ রিমাইন্ডার হাব (`,e.not_submitted_teachers.length,`)`]}),(0,V.jsxs)(N,{variant:`outline-danger`,size:`sm`,className:`d-flex align-items-center fw-semibold`,onClick:r,children:[(0,V.jsx)(s,{size:13,className:`me-1`}),`ফোন নম্বর কপি (`,e.not_submitted_teachers.length,`)`]})]})})]}),e.not_submitted_teachers.length===0?(0,V.jsxs)(`div`,{className:`p-4 bg-success bg-opacity-10 text-success rounded-3 border border-success text-center`,children:[(0,V.jsx)(l,{size:24,className:`mb-2`}),(0,V.jsx)(`h6`,{className:`fw-bold mb-1`,children:`আলহামদুলিল্লাহ! সকল সম্মানিত শিক্ষক পাঠ পরিকল্পনা জমা দিয়েছেন।`}),(0,V.jsx)(`p`,{className:`small mb-0 text-muted`,children:`এই ব্যাচে কোনো বকেয়া বা অনুপস্থিত শিক্ষক নেই।`})]}):(0,V.jsx)(`div`,{className:`table-responsive border rounded-3 overflow-hidden`,children:(0,V.jsxs)(T,{bordered:!0,hover:!0,size:`sm`,className:`align-middle mb-0`,children:[(0,V.jsx)(`thead`,{style:{backgroundColor:`#fee2e2`,color:`#991b1b`},children:(0,V.jsxs)(`tr`,{className:`small text-uppercase fw-bold`,children:[(0,V.jsx)(`th`,{style:{width:`50px`},className:`text-center`,children:`SL`}),(0,V.jsx)(`th`,{style:{width:`85px`},className:`text-center`,children:`EMP ID`}),(0,V.jsx)(`th`,{children:`শিক্ষকের নাম (Faculty Member)`}),(0,V.jsx)(`th`,{children:`পদবি (Designation)`}),(0,V.jsx)(`th`,{children:`বিভাগ (Department)`}),(0,V.jsx)(`th`,{children:`মোবাইল নম্বর (Contact Phone)`}),(0,V.jsx)(`th`,{className:`text-center`,style:{width:`110px`},children:`স্ট্যাটাস`}),(0,V.jsx)(`th`,{className:`text-center d-print-none`,style:{width:`130px`},children:`তাগিদ / Action`})]})}),(0,V.jsx)(`tbody`,{className:`small`,children:e.not_submitted_teachers.map((t,n)=>(0,V.jsxs)(`tr`,{className:`table-hover-row`,children:[(0,V.jsx)(`td`,{className:`text-center font-monospace fw-bold`,children:t.serial_number!==void 0&&t.serial_number!==null?t.serial_number:n+1}),(0,V.jsx)(`td`,{className:`text-center font-monospace text-muted small`,children:t.employee_id||`—`}),(0,V.jsxs)(`td`,{children:[(0,V.jsx)(`div`,{className:`fw-bold text-dark`,children:t.name}),t.salutation&&(0,V.jsxs)(`span`,{className:`text-muted small`,children:[`(`,t.salutation,`)`]})]}),(0,V.jsx)(`td`,{children:t.designation}),(0,V.jsx)(`td`,{children:(0,V.jsx)(`span`,{className:`badge bg-light text-secondary border`,children:t.department})}),(0,V.jsx)(`td`,{className:`font-monospace fw-semibold text-danger`,children:t.phone&&t.phone!==`0`?(0,V.jsxs)(`a`,{href:`tel:${t.phone}`,className:`text-decoration-none text-danger d-flex align-items-center`,children:[(0,V.jsx)(P,{size:12,className:`me-1`}),t.phone]}):(0,V.jsx)(`span`,{className:`text-muted`,children:`N/A`})}),(0,V.jsx)(`td`,{className:`text-center`,children:(0,V.jsx)(`span`,{className:`badge px-2 py-1`,style:{backgroundColor:`#fecaca`,color:`#991b1b`,border:`1px solid #f87171`},children:`Not Submitted`})}),(0,V.jsx)(`td`,{className:`text-center d-print-none`,children:(0,V.jsxs)(N,{variant:`success`,size:`sm`,className:`py-0.5 px-2 d-inline-flex align-items-center text-white fw-semibold`,style:{backgroundColor:`#25D366`,borderColor:`#25D366`,fontSize:`0.75rem`},onClick:()=>{let n=z(L[0].text,{name:t.name,salutation:t.salutation,designation:t.designation,department_name:t.department,phone:t.phone},{title:e.batch.title,deadline:e.batch.deadline_display});if(!t.phone||t.phone===`0`||t.phone===`N/A`){c.error(`শিক্ষকের কোনো ফোন নম্বর নেই।`);return}ve(t.phone,n)},disabled:!t.phone||t.phone===`0`||t.phone===`N/A`,title:`এই শিক্ষককে হোয়াটসঅ্যাপে রিমাইন্ডার পাঠান`,children:[(0,V.jsx)(g,{size:11,className:`me-1`}),` WhatsApp`]})})]},n))})]})})]}),(0,V.jsxs)(`div`,{className:`section-submitted mb-5`,children:[(0,V.jsxs)(`div`,{className:`d-flex align-items-center mb-2`,children:[(0,V.jsx)(`div`,{className:`p-1 px-2 rounded bg-success text-white me-2 small fw-bold`,children:`SECTION B`}),(0,V.jsxs)(`h6`,{className:`fw-bold text-success mb-0 d-flex align-items-center`,children:[(0,V.jsx)(l,{size:17,className:`me-2 text-success`}),`যথা সময়ে জমা দেওয়া শিক্ষক তালিকা (`,e.submitted_teachers.length,` জন)`]})]}),e.submitted_teachers.length===0?(0,V.jsx)(`div`,{className:`p-3 bg-light text-muted rounded border text-center small`,children:`এখনও পর্যন্ত কোনো শিক্ষক ফাইল জমা দেননি।`}):(0,V.jsx)(`div`,{className:`table-responsive border rounded-3 overflow-hidden`,children:(0,V.jsxs)(T,{bordered:!0,hover:!0,size:`sm`,className:`align-middle mb-0`,children:[(0,V.jsx)(`thead`,{style:{backgroundColor:`#dcfce7`,color:`#166534`},children:(0,V.jsxs)(`tr`,{className:`small text-uppercase fw-bold`,children:[(0,V.jsx)(`th`,{style:{width:`50px`},className:`text-center`,children:`SL`}),(0,V.jsx)(`th`,{style:{width:`85px`},className:`text-center`,children:`EMP ID`}),(0,V.jsx)(`th`,{children:`শিক্ষকের নাম (Faculty Member)`}),(0,V.jsx)(`th`,{children:`পদবি ও বিভাগ`}),(0,V.jsx)(`th`,{children:`জমা দেওয়ার তারিখ ও সময়`}),(0,V.jsx)(`th`,{children:`সংযুক্ত ফাইলসমূহ (Attached Files)`}),(0,V.jsx)(`th`,{className:`text-center`,style:{width:`110px`},children:`স্ট্যাটাস`})]})}),(0,V.jsx)(`tbody`,{className:`small`,children:e.submitted_teachers.map((e,t)=>(0,V.jsxs)(`tr`,{children:[(0,V.jsx)(`td`,{className:`text-center font-monospace fw-bold`,children:e.serial_number!==void 0&&e.serial_number!==null?e.serial_number:t+1}),(0,V.jsx)(`td`,{className:`text-center font-monospace text-muted small`,children:e.employee_id||`—`}),(0,V.jsx)(`td`,{children:(0,V.jsx)(`div`,{className:`fw-bold text-dark`,children:e.name})}),(0,V.jsxs)(`td`,{children:[(0,V.jsx)(`div`,{children:e.designation}),(0,V.jsx)(`span`,{className:`badge bg-light text-secondary border small`,children:e.department})]}),(0,V.jsxs)(`td`,{className:`text-muted font-monospace`,children:[(0,V.jsx)(`div`,{children:e.submitted_at||`—`}),e.last_updated_at&&e.last_updated_at!==e.submitted_at&&(0,V.jsxs)(`div`,{className:`small text-primary fw-medium`,style:{fontSize:`0.72rem`},children:[`আপডেট: `,e.last_updated_at]})]}),(0,V.jsx)(`td`,{children:e.files&&e.files.length>0?(0,V.jsx)(`div`,{className:`d-flex flex-wrap gap-1`,children:e.files.map((e,t)=>(0,V.jsxs)(`div`,{className:`d-inline-flex align-items-center gap-1`,children:[(0,V.jsxs)(`a`,{href:e.url,target:`_blank`,rel:`noreferrer`,className:`badge bg-light text-primary border text-decoration-none p-1 px-2 d-flex align-items-center`,title:e.name,children:[(0,V.jsx)(y,{size:11,className:`me-1`}),e.name.length>20?e.name.substring(0,17)+`...`:e.name]}),e.gdrive_view_link&&(0,V.jsxs)(`a`,{href:e.gdrive_view_link,target:`_blank`,rel:`noreferrer`,className:`badge bg-light text-success border text-decoration-none p-1 px-1.5 d-flex align-items-center`,title:`Google Drive-এ ফাইলটি দেখুন`,children:[(0,V.jsx)(D,{size:10,className:`me-0.5`}),` Drive`]})]},t))}):(0,V.jsx)(`span`,{className:`text-muted small`,children:`—`})}),(0,V.jsxs)(`td`,{className:`text-center`,children:[(0,V.jsx)(`span`,{className:`badge bg-success px-2 py-1`,children:`Submitted`}),e.update_count&&e.update_count>1?(0,V.jsx)(`div`,{className:`mt-1`,children:(0,V.jsxs)(`span`,{className:`badge px-1.5 py-0.5 font-monospace`,style:{backgroundColor:`#fef3c7`,color:`#92400e`,border:`1px solid #fde68a`,fontSize:`0.68rem`},title:`এই শিক্ষক মোট ${e.update_count} বার ফাইল আপডেট করেছেন`,children:[`🔄 রিভিশন #`,e.update_count]})}):(0,V.jsx)(`div`,{className:`mt-1`,children:(0,V.jsx)(`span`,{className:`badge px-1.5 py-0.5 text-muted font-monospace bg-light border`,style:{fontSize:`0.68rem`},children:`১ম জমা`})})]})]},t))})]})})]}),(0,V.jsx)(`div`,{className:`report-signatures pt-5 mt-4 border-top`,children:(0,V.jsxs)(A,{className:`text-center g-3 align-items-end`,children:[(0,V.jsx)(b,{xs:4,children:(0,V.jsxs)(`div`,{className:`signature-box`,children:[(0,V.jsx)(`div`,{style:{height:`40px`}}),(0,V.jsx)(`div`,{className:`mx-auto mb-2`,style:{width:`85%`,maxWidth:`220px`,borderTop:`1.5px dotted #94a3b8`}}),(0,V.jsx)(`div`,{className:`fw-bold text-dark fs-7`,style:{color:`#0f172a`},children:`Aklima Begum`}),(0,V.jsx)(`div`,{className:`fw-semibold text-secondary small`,style:{fontSize:`0.8rem`},children:`VP (Jr. Div)`})]})}),(0,V.jsx)(b,{xs:4,children:(0,V.jsxs)(`div`,{className:`signature-box`,children:[(0,V.jsx)(`div`,{style:{height:`40px`}}),(0,V.jsx)(`div`,{className:`mx-auto mb-2`,style:{width:`85%`,maxWidth:`220px`,borderTop:`1.5px dotted #94a3b8`}}),(0,V.jsx)(`div`,{className:`fw-bold text-dark fs-7`,style:{color:`#0f172a`},children:`Masuma Mamataz`}),(0,V.jsx)(`div`,{className:`fw-semibold text-secondary small`,style:{fontSize:`0.8rem`},children:`VP (Sr. Div)`})]})}),(0,V.jsx)(b,{xs:4,children:(0,V.jsxs)(`div`,{className:`signature-box`,children:[(0,V.jsx)(`div`,{style:{height:`40px`}}),(0,V.jsx)(`div`,{className:`mx-auto mb-2`,style:{width:`90%`,maxWidth:`300px`,borderTop:`1.5px dotted #94a3b8`}}),(0,V.jsx)(`div`,{className:`fw-bold text-dark fs-7`,style:{color:`#0f172a`,lineHeight:1.3},children:`Brig Gen Akhter Shahid, SUP (BAR), ndc, psc, G+, MPhil (LPR)`}),(0,V.jsx)(`div`,{className:`fw-bold small mt-0.5`,style:{fontSize:`0.82rem`,color:`#1e3a8a`},children:`Principal`})]})})]})}),(0,V.jsx)(`div`,{className:`report-footer text-center mt-4 pt-3 border-top small text-muted`,children:(0,V.jsxs)(`div`,{className:`d-flex justify-content-between align-items-center flex-wrap gap-2`,style:{fontSize:`0.75rem`},children:[(0,V.jsxs)(`div`,{children:[`🔒 `,(0,V.jsx)(`strong`,{children:`Confidential:`}),` Internal Academic Tracking & Administrative Quality Audit Record.`]}),(0,V.jsxs)(`div`,{className:`font-monospace`,children:[`Generated Automatically by BSISC Academic ERP Portal | `,e.generated_at]})]})})]})},be=({show:e,onHide:t,batch:n,missingTeachers:r})=>{let[i,a]=(0,I.useState)(`bangla_standard`),[o,l]=(0,I.useState)(()=>L[0].text),[d,f]=(0,I.useState)(``),[p,m]=(0,I.useState)(new Set),[h,_]=(0,I.useState)(null);I.useEffect(()=>{if(e){let e=new Set(r.map(e=>e.teacher_id||e.id).filter(e=>e!==void 0));m(e),r.length>0&&_(r[0].teacher_id||r[0].id||null)}},[e,r]);let v=e=>{a(e);let t=L.find(t=>t.id===e);t&&l(t.text)},y=(0,I.useMemo)(()=>r.filter(e=>{let t=d.toLowerCase();return e.name.toLowerCase().includes(t)||e.phone&&e.phone.includes(t)||e.designation&&e.designation.toLowerCase().includes(t)||e.department_name&&e.department_name.toLowerCase().includes(t)}),[r,d]),x=(0,I.useMemo)(()=>h?r.find(e=>(e.teacher_id||e.id)===h)||r[0]||null:r[0]||null,[h,r]),ee=(0,I.useMemo)(()=>x?z(o,x,n):``,[o,x,n]),C=()=>{let e=new Set(p);y.every(t=>{let n=t.teacher_id||t.id;return n&&e.has(n)})?y.forEach(t=>{let n=t.teacher_id||t.id;n&&e.delete(n)}):y.forEach(t=>{let n=t.teacher_id||t.id;n&&e.add(n)}),m(e)},re=e=>{let t=new Set(p);t.has(e)?t.delete(e):t.add(e),m(t)},E=e=>{if(!e.phone||e.phone===`0`||e.phone===`N/A`){c.error(`${e.name}-এর কোনো বৈধ মোবাইল নম্বর পাওয়া যায়নি।`);return}let t=z(o,e,n);ve(e.phone,t)?c.success(`${e.name}-কে হোয়াটসঅ্যাপে মেসেজ পাঠানোর উইন্ডো ওপেন হয়েছে।`):c.error(`হোয়াটসঅ্যাপ ওপেন করা সম্ভব হয়নি।`)},D=e=>{let t=z(o,e,n);navigator.clipboard.writeText(t),c.success(`${e.name}-এর জন্য তৈরি মেসেজ ক্লিপবোর্ডে কপি করা হয়েছে!`)},ae=()=>{let e=r.filter(e=>{let t=e.teacher_id||e.id;return t&&p.has(t)}).map(e=>e.phone).filter(e=>!!(e&&e!==`0`&&e!==`N/A`));if(e.length===0){c.info(`নির্বাচিত শিক্ষকদের কোনো ফোন নম্বর পাওয়া যায়নি।`);return}navigator.clipboard.writeText(e.join(`, `)),c.success(`মোট ${e.length} জন শিক্ষকের ফোন নম্বর কপি করা হয়েছে!`)};return(0,V.jsxs)(w,{show:e,onHide:t,size:`xl`,centered:!0,className:`whatsapp-reminder-modal`,children:[(0,V.jsx)(w.Header,{closeButton:!0,style:{backgroundColor:`#075E54`,color:`#ffffff`},children:(0,V.jsxs)(w.Title,{className:`fs-6 fw-bold d-flex align-items-center`,children:[(0,V.jsx)(`div`,{className:`p-1.5 rounded-circle me-2 d-flex align-items-center justify-content-center`,style:{backgroundColor:`#25D366`},children:(0,V.jsx)(u,{size:18,className:`text-white`})}),`হোয়াটসঅ্যাপ তাগিদ / রিমাইন্ডার হাব (WhatsApp Reminder Hub)`]})}),(0,V.jsxs)(w.Body,{className:`p-3 p-md-4 bg-light`,children:[(0,V.jsxs)(`div`,{className:`bg-white p-3 rounded-3 border shadow-xs mb-3 d-flex justify-content-between align-items-center flex-wrap gap-2`,children:[(0,V.jsxs)(`div`,{children:[(0,V.jsx)(`div`,{className:`text-muted small`,children:`ব্যাচ ও লেসন প্ল্যান ট্র্যাকিং:`}),(0,V.jsx)(`h5`,{className:`fw-bold text-dark mb-0`,children:n.title})]}),(0,V.jsxs)(`div`,{className:`d-flex align-items-center gap-2`,children:[(0,V.jsxs)(S,{bg:`danger`,className:`p-2 fs-6 fw-semibold`,children:[`বাকি রয়েছে: `,r.length,` জন শিক্ষক`]}),(0,V.jsxs)(S,{bg:`dark`,className:`p-2 fs-6`,children:[`নির্বাচিত: `,p.size,` জন`]})]})]}),(0,V.jsxs)(A,{className:`g-3 mb-3`,children:[(0,V.jsx)(b,{lg:6,children:(0,V.jsxs)(M,{className:`border shadow-xs h-100 bg-white`,children:[(0,V.jsxs)(M.Header,{className:`bg-white py-2.5 d-flex justify-content-between align-items-center border-bottom`,children:[(0,V.jsxs)(`span`,{className:`fw-bold text-dark small d-flex align-items-center`,children:[(0,V.jsx)(he,{size:15,className:`text-primary me-1.5`}),`রিমাইন্ডার মেসেজ টেমপ্লেট নির্বাচন ও এডিট`]}),(0,V.jsx)(S,{bg:`light`,text:`dark`,className:`border`,children:`Live Customizable`})]}),(0,V.jsxs)(M.Body,{className:`p-3`,children:[(0,V.jsxs)(O.Group,{className:`mb-3`,children:[(0,V.jsx)(O.Label,{className:`fw-semibold small mb-1`,children:`টেমপ্লেট সিলেক্ট করুন (Preset Templates):`}),(0,V.jsx)(O.Select,{size:`sm`,value:i,onChange:e=>v(e.target.value),children:L.map(e=>(0,V.jsx)(`option`,{value:e.id,children:e.name},e.id))})]}),(0,V.jsxs)(O.Group,{className:`mb-2`,children:[(0,V.jsxs)(O.Label,{className:`fw-semibold small mb-1 d-flex justify-content-between`,children:[(0,V.jsx)(`span`,{children:`মেসেজের বিবরণ (Message Body):`}),(0,V.jsxs)(`span`,{className:`text-muted small`,style:{fontSize:`0.75rem`},children:[`ট্যাগ: `,`{name}`,`, `,`{salutation}`,`, `,`{batchTitle}`,`, `,`{portalUrl}`]})]}),(0,V.jsx)(O.Control,{as:`textarea`,rows:8,className:`small font-monospace`,style:{fontSize:`0.85rem`,lineHeight:`1.45`},value:o,onChange:e=>l(e.target.value)})]}),(0,V.jsxs)(`div`,{className:`d-flex justify-content-between align-items-center`,children:[(0,V.jsxs)(`span`,{className:`text-muted small`,style:{fontSize:`0.75rem`},children:[(0,V.jsx)(te,{size:13,className:`me-1 inline-block`}),`প্রতিটি শিক্ষকের নাম ও সম্বোধন স্বয়ংক্রিয়ভাবে মেসেজে যুক্ত হবে।`]}),(0,V.jsxs)(N,{variant:`outline-secondary`,size:`sm`,className:`py-0 px-2`,style:{fontSize:`0.75rem`},onClick:()=>{let e=z(o,{name:`সম্মানিত শিক্ষক / শিক্ষিকা`,salutation:`Sir/Madam`,designation:`Faculty Member`},n);navigator.clipboard.writeText(e),c.success(`হোয়াটসঅ্যাপ গ্রুপ বা ব্রডকাস্টে পাঠানোর মেসেজ কপি করা হয়েছে!`)},children:[(0,V.jsx)(s,{size:12,className:`me-1`}),` ব্রডকাস্ট টেক্সট কপি`]})]})]})]})}),(0,V.jsx)(b,{lg:6,children:(0,V.jsxs)(M,{className:`border shadow-xs h-100 bg-white`,children:[(0,V.jsxs)(M.Header,{className:`bg-white py-2.5 d-flex justify-content-between align-items-center border-bottom`,children:[(0,V.jsxs)(`span`,{className:`fw-bold text-dark small d-flex align-items-center`,children:[(0,V.jsx)(u,{size:15,className:`text-success me-1.5`}),`হোয়াটসঅ্যাপ মেসেজ লাইভ প্রিভিউ (WhatsApp Live Preview)`]}),x&&(0,V.jsx)(S,{bg:`success`,className:`fw-normal`,children:x.name})]}),(0,V.jsxs)(M.Body,{className:`p-3 d-flex flex-column justify-content-between`,children:[(0,V.jsx)(`div`,{className:`p-3 rounded-3 shadow-xs mb-3`,style:{backgroundColor:`#E7FFDB`,border:`1px solid #C2ECC1`,whiteSpace:`pre-wrap`,fontSize:`0.86rem`,color:`#111b21`,maxHeight:`280px`,overflowY:`auto`},children:ee}),x&&(0,V.jsxs)(`div`,{className:`p-2.5 bg-light rounded border small d-flex justify-content-between align-items-center flex-wrap gap-2`,children:[(0,V.jsxs)(`div`,{children:[(0,V.jsx)(`div`,{className:`fw-bold text-dark`,children:x.name}),(0,V.jsxs)(`div`,{className:`text-muted font-monospace`,style:{fontSize:`0.8rem`},children:[`📱 `,x.phone||`নম্বর নেই`,` (`,x.designation||`Teacher`,`)`]})]}),(0,V.jsxs)(`div`,{className:`d-flex gap-1.5`,children:[(0,V.jsxs)(N,{variant:`outline-secondary`,size:`sm`,className:`py-1 px-2.5`,onClick:()=>D(x),children:[(0,V.jsx)(s,{size:13,className:`me-1`}),` মেসেজ কপি`]}),(0,V.jsxs)(N,{variant:`success`,size:`sm`,className:`py-1 px-3 fw-bold d-flex align-items-center`,style:{backgroundColor:`#25D366`,borderColor:`#25D366`},onClick:()=>E(x),disabled:!x.phone||x.phone===`0`,children:[(0,V.jsx)(g,{size:13,className:`me-1.5`}),` হোয়াটসঅ্যাপে পাঠান`]})]})]})]})]})})]}),(0,V.jsxs)(M,{className:`border shadow-xs bg-white`,children:[(0,V.jsxs)(M.Header,{className:`bg-white p-3 border-bottom d-flex justify-content-between align-items-center flex-wrap gap-2`,children:[(0,V.jsxs)(`div`,{className:`d-flex align-items-center gap-2`,children:[(0,V.jsx)(N,{variant:`outline-dark`,size:`sm`,className:`d-flex align-items-center py-1`,onClick:C,children:y.length>0&&y.every(e=>p.has(e.teacher_id||e.id||0))?(0,V.jsxs)(V.Fragment,{children:[(0,V.jsx)(j,{size:14,className:`me-1 text-primary`}),` সব আনসিলেক্ট`]}):(0,V.jsxs)(V.Fragment,{children:[(0,V.jsx)(ne,{size:14,className:`me-1`}),` সব সিলেক্ট করুন (`,y.length,`)`]})}),(0,V.jsxs)(`span`,{className:`text-muted small`,children:[`(`,p.size,` জন নির্বাচিত)`]})]}),(0,V.jsxs)(`div`,{className:`d-flex align-items-center gap-2`,children:[(0,V.jsxs)(`div`,{className:`input-group input-group-sm`,style:{width:`260px`},children:[(0,V.jsx)(`span`,{className:`input-group-text bg-light`,children:(0,V.jsx)(ie,{size:13})}),(0,V.jsx)(O.Control,{placeholder:`শিক্ষকের নাম বা মোবাইল...`,value:d,onChange:e=>f(e.target.value)})]}),(0,V.jsxs)(N,{variant:`outline-primary`,size:`sm`,className:`d-flex align-items-center py-1`,onClick:ae,title:`নির্বাচিত সব শিক্ষকের মোবাইল নম্বর কপি করুন`,children:[(0,V.jsx)(s,{size:13,className:`me-1`}),` ফোন নম্বর কপি (`,p.size,`)`]})]})]}),(0,V.jsx)(M.Body,{className:`p-0`,children:(0,V.jsx)(`div`,{style:{maxHeight:`320px`,overflowY:`auto`},children:(0,V.jsxs)(T,{responsive:!0,hover:!0,size:`sm`,className:`align-middle mb-0 small`,children:[(0,V.jsx)(`thead`,{className:`table-light sticky-top`,style:{top:0,zIndex:1},children:(0,V.jsxs)(`tr`,{children:[(0,V.jsx)(`th`,{style:{width:`40px`},className:`text-center`,children:`#`}),(0,V.jsx)(`th`,{style:{width:`50px`},className:`text-center`,children:`SL`}),(0,V.jsx)(`th`,{style:{width:`80px`},children:`EMP ID`}),(0,V.jsx)(`th`,{children:`শিক্ষকের নাম ও পদবি`}),(0,V.jsx)(`th`,{children:`বিভাগ`}),(0,V.jsx)(`th`,{children:`মোবাইল নম্বর`}),(0,V.jsx)(`th`,{style:{width:`110px`},className:`text-center`,children:`প্রিভিউ`}),(0,V.jsx)(`th`,{style:{width:`160px`},className:`text-end pe-3`,children:`হোয়াটসঅ্যাপ কার্যক্রম`})]})}),(0,V.jsx)(`tbody`,{children:y.length===0?(0,V.jsx)(`tr`,{children:(0,V.jsx)(`td`,{colSpan:8,className:`text-center p-4 text-muted`,children:`কোনো মিসিং শিক্ষক পাওয়া যায়নি।`})}):y.map((e,t)=>{let n=e.teacher_id||e.id||t,r=p.has(n),i=h===n,a=R(e.phone)!==null;return(0,V.jsxs)(`tr`,{className:i?`table-warning`:r?``:`text-muted`,style:{cursor:`pointer`},onClick:()=>_(n),children:[(0,V.jsx)(`td`,{className:`text-center`,onClick:e=>e.stopPropagation(),children:(0,V.jsx)(O.Check,{type:`checkbox`,checked:r,onChange:()=>re(n)})}),(0,V.jsx)(`td`,{className:`text-center`,children:(0,V.jsx)(`span`,{className:`badge bg-light text-dark border font-monospace fw-bold`,children:e.serial_number!==void 0&&e.serial_number!==null?e.serial_number:t+1})}),(0,V.jsx)(`td`,{children:e.employee_id?(0,V.jsx)(`span`,{className:`badge bg-primary-subtle text-primary border border-primary-subtle font-monospace px-1.5 py-0.5`,children:e.employee_id}):(0,V.jsx)(`span`,{className:`text-muted small`,children:`-`})}),(0,V.jsxs)(`td`,{children:[(0,V.jsx)(`div`,{className:`fw-bold text-dark`,children:e.name}),(0,V.jsx)(`div`,{className:`text-muted small`,children:e.designation||`Teacher`})]}),(0,V.jsx)(`td`,{children:(0,V.jsx)(`span`,{className:`badge bg-light text-secondary border`,children:e.department_name||`General`})}),(0,V.jsx)(`td`,{className:`font-monospace`,children:a?(0,V.jsxs)(`span`,{className:`badge bg-success bg-opacity-10 text-success border border-success-subtle px-2 py-1`,children:[(0,V.jsx)(P,{size:11,className:`me-1`}),e.phone]}):(0,V.jsx)(`span`,{className:`badge bg-danger bg-opacity-10 text-danger border border-danger-subtle px-2 py-1`,children:`নম্বর নেই`})}),(0,V.jsx)(`td`,{className:`text-center`,children:(0,V.jsx)(N,{variant:i?`warning`:`outline-secondary`,size:`sm`,className:`py-0 px-2`,style:{fontSize:`0.75rem`},onClick:e=>{e.stopPropagation(),_(n)},children:i?`✓ প্রদর্শিত`:`প্রিভিউ দেখুন`})}),(0,V.jsx)(`td`,{className:`text-end pe-3`,onClick:e=>e.stopPropagation(),children:(0,V.jsxs)(`div`,{className:`d-flex justify-content-end gap-1`,children:[(0,V.jsx)(N,{variant:`outline-secondary`,size:`sm`,className:`py-0 px-2`,style:{fontSize:`0.75rem`},onClick:()=>D(e),title:`এই মেসেজটি কপি করুন`,children:(0,V.jsx)(s,{size:12})}),(0,V.jsxs)(N,{variant:`success`,size:`sm`,className:`py-0.5 px-2.5 d-inline-flex align-items-center fw-semibold text-white`,style:{backgroundColor:`#25D366`,borderColor:`#25D366`,fontSize:`0.78rem`},onClick:()=>E(e),disabled:!a,title:a?`হোয়াটসঅ্যাপে মেসেজ পাঠান`:`বৈধ মোবাইল নম্বর নেই`,children:[(0,V.jsx)(g,{size:12,className:`me-1`}),`WhatsApp`]})]})})]},n)})})]})})})]})]}),(0,V.jsxs)(w.Footer,{className:`bg-light d-flex justify-content-between`,children:[(0,V.jsxs)(`div`,{className:`text-muted small`,children:[`💡 `,(0,V.jsx)(`strong`,{children:`টিপস:`}),` WhatsApp Web বা মোবাইলে ওপেন করার পর সরাসরি 'Send' বাটনে চাপলেই মেসেজ চলে যাবে।`]}),(0,V.jsxs)(`div`,{className:`d-flex gap-2`,children:[(0,V.jsx)(N,{variant:`secondary`,onClick:t,children:`বন্ধ করুন`}),(0,V.jsxs)(N,{variant:`success`,className:`d-flex align-items-center fw-bold`,style:{backgroundColor:`#075E54`,borderColor:`#075E54`},onClick:ae,children:[(0,V.jsx)(s,{size:15,className:`me-1.5`}),`নির্বাচিত `,p.size,` জনের ফোন নম্বর কপি`]})]})]})]})},xe=e=>{let t=window.open(``,`_blank`,`width=1000,height=800`);if(!t){alert(`Popup blocker is preventing print window. Please allow popups for this site.`);return}let n=e.not_submitted_teachers.length>0?e.not_submitted_teachers.map((e,t)=>`
      <tr>
        <td style="text-align: center; color: #64748b; font-family: monospace;">${t+1}</td>
        <td>
          <strong style="color: #0f172a;">${e.name}</strong>
          ${e.salutation?`<span style="color: #64748b; font-size: 11px;"> (${e.salutation})</span>`:``}
        </td>
        <td>${e.designation||`Teacher`}</td>
        <td><span style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-size: 11px; border: 1px solid #e2e8f0;">${e.department||`General`}</span></td>
        <td style="font-family: monospace; font-weight: bold; color: #dc2626;">${e.phone&&e.phone!==`0`?e.phone:`N/A`}</td>
        <td style="text-align: center;"><span style="background: #fee2e2; color: #991b1b; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; border: 1px solid #fca5a5;">NOT SUBMITTED</span></td>
      </tr>
    `).join(``):`
      <tr>
        <td colspan="6" style="text-align: center; padding: 15px; color: #15803d; background: #f0fdf4;">
          🎉 আলহামদুলিল্লাহ! সকল সম্মানিত শিক্ষক পাঠ পরিকল্পনা যথা সময়ে জমা দিয়েছেন।
        </td>
      </tr>
    `,r=e.submitted_teachers.length>0?e.submitted_teachers.map((e,t)=>{let n=e.files&&e.files.length>0?e.files.map(e=>`<span style="background: #f8fafc; border: 1px solid #cbd5e1; padding: 2px 6px; border-radius: 4px; font-size: 10px; margin-right: 4px; display: inline-block;">📎 ${e.name}</span>`).join(``):`<span style="color: #94a3b8;">—</span>`;return`
        <tr>
          <td style="text-align: center; color: #64748b; font-family: monospace;">${t+1}</td>
          <td><strong style="color: #0f172a;">${e.name}</strong></td>
          <td>${e.designation} <span style="color: #64748b; font-size: 11px;">(${e.department})</span></td>
          <td style="color: #475569; font-size: 11px; font-family: monospace;">${e.submitted_at||`—`}</td>
          <td>${n}</td>
          <td style="text-align: center;"><span style="background: #dcfce7; color: #166534; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; border: 1px solid #86efac;">SUBMITTED</span></td>
        </tr>
      `}).join(``):`
      <tr>
        <td colspan="6" style="text-align: center; padding: 15px; color: #64748b;">
          এখনও কোনো শিক্ষক ফাইল জমা দেননি।
        </td>
      </tr>
    `,i=`
    <!DOCTYPE html>
    <html lang="bn">
    <head>
      <meta charset="UTF-8">
      <title>${e.batch.title} - Official Sunday Report</title>
      <style>
        @page {
          size: A4 portrait;
          margin: 12mm 10mm 15mm 10mm;
        }
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        body {
          font-family: 'Segoe UI', Arial, 'SolaimanLipi', sans-serif;
          color: #1e293b;
          background: #fff;
          font-size: 12px;
          line-height: 1.4;
          padding: 10px;
        }
        .report-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 2px solid #1e3a8a;
          padding-bottom: 10px;
          margin-bottom: 12px;
        }
        .header-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .logo-img {
          width: 75px;
          height: 75px;
          object-fit: contain;
        }
        .school-title {
          font-size: 18px;
          font-weight: 800;
          color: #1e3a8a;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 2px;
        }
        .school-title-bn {
          font-size: 13px;
          font-weight: 600;
          color: #475569;
          margin-bottom: 2px;
        }
        .school-address {
          font-size: 11px;
          color: #64748b;
        }
        .header-right {
          text-align: right;
          font-size: 11px;
          font-family: monospace;
        }
        .id-badges {
          margin-bottom: 4px;
        }
        .id-badge {
          background: #f1f5f9;
          border: 1px solid #cbd5e1;
          padding: 2px 5px;
          border-radius: 3px;
          display: inline-block;
          margin-left: 3px;
          font-size: 10px;
          color: #1e3a8a;
          font-weight: bold;
        }
        .report-banner {
          text-align: center;
          margin: 10px 0 14px 0;
        }
        .banner-title {
          display: inline-block;
          background: #f8fafc;
          border: 1px solid #cbd5e1;
          padding: 5px 18px;
          border-radius: 20px;
          font-weight: bold;
          font-size: 13px;
          text-transform: uppercase;
          color: #0f172a;
        }
        .banner-sub {
          font-size: 11px;
          color: #64748b;
          margin-top: 3px;
        }
        .meta-box {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          padding: 8px 12px;
          margin-bottom: 14px;
          display: flex;
          justify-content: space-between;
          font-size: 11.5px;
        }
        .meta-col strong {
          color: #334155;
        }
        .kpi-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
          margin-bottom: 16px;
          text-align: center;
        }
        .kpi-card {
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          padding: 8px;
          background: #fff;
        }
        .kpi-card.green {
          background: #f0fdf4;
          border-color: #86efac;
          color: #166534;
        }
        .kpi-card.red {
          background: #fef2f2;
          border-color: #fca5a5;
          color: #991b1b;
        }
        .kpi-card.blue {
          background: #eff6ff;
          border-color: #bfdbfe;
          color: #1e40af;
        }
        .kpi-num {
          font-size: 20px;
          font-weight: 800;
          margin-top: 2px;
        }
        .kpi-label {
          font-size: 10.5px;
          font-weight: 600;
          text-transform: uppercase;
        }
        .section-title {
          font-size: 12.5px;
          font-weight: bold;
          margin: 14px 0 6px 0;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .section-title.red {
          color: #dc2626;
        }
        .section-title.green {
          color: #16a34a;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 14px;
          font-size: 11px;
        }
        th, td {
          border: 1px solid #cbd5e1;
          padding: 5px 8px;
          text-align: left;
        }
        thead {
          display: table-header-group;
        }
        tr {
          page-break-inside: avoid;
        }
        th {
          font-weight: bold;
          font-size: 10.5px;
          text-transform: uppercase;
        }
        .th-red {
          background: #fee2e2;
          color: #991b1b;
        }
        .th-green {
          background: #dcfce7;
          color: #166534;
        }
        .signatures {
          margin-top: 35px;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          text-align: center;
          page-break-inside: avoid;
        }
        .signatures {
          margin-top: 40px;
          display: grid;
          grid-template-columns: 1fr 1fr 1.3fr;
          gap: 15px;
          text-align: center;
          page-break-inside: avoid;
        }
        .sig-line {
          border-top: 1.5px dotted #94a3b8;
          width: 85%;
          margin: 45px auto 6px auto;
        }
        .sig-name {
          font-weight: 700;
          font-size: 11.5px;
          color: #0f172a;
          margin-bottom: 2px;
          line-height: 1.3;
        }
        .sig-desig {
          font-size: 11px;
          font-weight: 600;
          color: #334155;
        }
        .sig-desig.principal {
          color: #1e3a8a;
          font-weight: 700;
        }
        .footer-note {
          margin-top: 20px;
          border-top: 1px solid #e2e8f0;
          padding-top: 6px;
          display: flex;
          justify-content: space-between;
          font-size: 9.5px;
          color: #94a3b8;
          page-break-inside: avoid;
        }
      </style>
    </head>
    <body>
      <!-- Institutional Header -->
      <div class="report-header">
        <div class="header-left">
          <img src="/logo.png" alt="BSISC Logo" class="logo-img" onerror="this.src='/logo.svg';" />
          <div>
            <div class="school-title">${e.school_name}</div>
            <div class="school-title-bn">${e.school_name_bn||`বারিধারা স্কলার্স ইন্টারন্যাশনাল স্কুল অ্যান্ড কলেজ`}</div>
            <div class="school-address">${e.address} | Web: ${e.website||`www.bsisc.edu.bd`}</div>
          </div>
        </div>
        <div class="header-right">
          <div class="id-badges">
            <span class="id-badge">EIIN: ${e.eiin}</span>
            <span class="id-badge">School: ${e.school_code}</span>
            <span class="id-badge">College: ${e.college_code}</span>
          </div>
          <div style="color: #64748b;">Ref: <strong>${e.ref_no||`BSISC/ACAD/`+e.batch.id}</strong></div>
        </div>
      </div>

      <!-- Banner -->
      <div class="report-banner">
        <div class="banner-title">${e.batch.category.replace(`_`,` `)} Submission & Monitoring Report</div>
        <div class="banner-sub">পাঠ পরিকল্পনা ও কার্যবিবরণী ট্র্যাকিং রিপোর্ট (রবিবার সকালের বিশেষ মনিটরিং)</div>
      </div>

      <!-- Metadata Box -->
      <div class="meta-box">
        <div class="meta-col">
          <div><strong>ব্যাচ নাম:</strong> ${e.batch.title}</div>
          <div><strong>শ্রেণি:</strong> ${e.batch.class_name}</div>
          <div><strong>কার্যকাল:</strong> ${e.batch.date_range}</div>
        </div>
        <div class="meta-col" style="text-align: right;">
          <div><strong style="color: #dc2626;">ডেডলাইন:</strong> ${e.batch.deadline_display}</div>
          <div><strong>রিপোর্ট প্রস্তুতের সময়:</strong> ${e.generated_at}</div>
          <div><strong>সম্পূর্ণতার হার:</strong> <strong style="color: #1e40af;">${e.summary.completion_percent}%</strong></div>
        </div>
      </div>

      <!-- KPI Grid -->
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-label">মোট শিক্ষক</div>
          <div class="kpi-num">${e.summary.total_teachers}</div>
        </div>
        <div class="kpi-card green">
          <div class="kpi-label">জমা দিয়েছেন</div>
          <div class="kpi-num">${e.summary.submitted_count}</div>
        </div>
        <div class="kpi-card red">
          <div class="kpi-label">জমা দেননি (বাকি)</div>
          <div class="kpi-num">${e.summary.not_submitted_count}</div>
        </div>
        <div class="kpi-card blue">
          <div class="kpi-label">অগ্রগতি হার</div>
          <div class="kpi-num">${e.summary.completion_percent}%</div>
        </div>
      </div>

      <!-- Section A: Missing Teachers -->
      <div class="section-title red">
        ⚠️ SECTION A: যে সকল শিক্ষক শনিবার রাতের মধ্যে জমা দেননি (অনুপস্থিত তালিকা: ${e.not_submitted_teachers.length} জন)
      </div>
      <table>
        <thead>
          <tr class="th-red">
            <th style="width: 35px; text-align: center;">#</th>
            <th>শিক্ষকের নাম</th>
            <th>পদবি</th>
            <th>বিভাগ / বিষয়</th>
            <th>মোবাইল নম্বর</th>
            <th style="width: 110px; text-align: center;">স্ট্যাটাস</th>
          </tr>
        </thead>
        <tbody>
          ${n}
        </tbody>
      </table>

      <!-- Section B: Submitted Teachers -->
      <div class="section-title green">
        ✔ SECTION B: যথা সময়ে জমা দেওয়া শিক্ষক তালিকা (${e.submitted_teachers.length} জন)
      </div>
      <table>
        <thead>
          <tr class="th-green">
            <th style="width: 35px; text-align: center;">#</th>
            <th>শিক্ষকের নাম</th>
            <th>পদবি ও বিভাগ</th>
            <th>জমা দেওয়ার সময়</th>
            <th>সংযুক্ত ফাইলসমূহ</th>
            <th style="width: 100px; text-align: center;">স্ট্যাটাস</th>
          </tr>
        </thead>
        <tbody>
          ${r}
        </tbody>
      </table>

      <!-- Signatures -->
      <div class="signatures">
        <div>
          <div class="sig-line"></div>
          <div class="sig-name">Aklima Begum</div>
          <div class="sig-desig">VP (Jr. Div)</div>
        </div>
        <div>
          <div class="sig-line"></div>
          <div class="sig-name">Masuma Mamataz</div>
          <div class="sig-desig">VP (Sr. Div)</div>
        </div>
        <div>
          <div class="sig-line"></div>
          <div class="sig-name">Brig Gen Akhter Shahid, SUP (BAR), ndc, psc, G+, MPhil (LPR)</div>
          <div class="sig-desig principal">Principal</div>
        </div>
      </div>

      <!-- Confidential Footer -->
      <div class="footer-note">
        <div>🔒 <strong>Confidential:</strong> Internal Academic Monitoring & Institutional Quality Audit Record.</div>
        <div>Generated Automatically by BSISC Academic ERP System | ${e.generated_at}</div>
      </div>

      <script>
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 300);
        };
      <\/script>
    </body>
    </html>
  `;t.document.open(),t.document.write(i),t.document.close()},Se=()=>{let{id:e}=re(),t=i(),[n,l]=(0,I.useState)(null),[S,te]=(0,I.useState)(!0),[C,ne]=(0,I.useState)(`table`),[D,j]=(0,I.useState)(!1),[_e,R]=(0,I.useState)(!1),[B,Se]=(0,I.useState)(null),[Ce,we]=(0,I.useState)(!1),[Te,Ee]=(0,I.useState)(!1),[H,De]=(0,I.useState)([]),[Oe,ke]=(0,I.useState)(``),[U,Ae]=(0,I.useState)(!1),[je,Me]=(0,I.useState)(null),[W,Ne]=(0,I.useState)(``),[G,Pe]=(0,I.useState)(`all`),[Fe,Ie]=(0,I.useState)(`all`);(0,I.useEffect)(()=>{K()},[e]);let K=async()=>{if(e){te(!0);try{let t=await F.getBatchDetails(Number(e));l(t.data),t.data.is_admin&&Le()}catch(e){c.error(e.response?.data?.message||`ব্যাচের বিস্তারিত তথ্য লোড করতে সমস্যা হয়েছে।`)}finally{te(!1)}}},Le=async()=>{if(!e)return null;we(!0);try{let t=await F.getSundayReport(Number(e));return Se(t.data),t.data}catch(e){return console.error(`Failed to load sunday report`,e),null}finally{we(!1)}},Re=async()=>{if(n)try{await F.toggleActive(n.batch.id),c.info(`ব্যাচ স্ট্যাটাস পরিবর্তন হয়েছে।`),K()}catch{c.error(`স্ট্যাটাস পরিবর্তন ব্যর্থ হয়েছে।`)}},ze=async()=>{if(n){Ee(!0);try{await F.downloadAllZip(n.batch.id,n.batch.title),c.success(`সকল জমা হওয়া ফাইল ZIP আকারে ডাউনলোড শুরু হয়েছে!`)}catch(e){c.error(e.response?.data?.message||`ZIP ফাইল ডাউনলোডে সমস্যা হয়েছে। জমা হওয়া ফাইল নাও থাকতে পারে।`)}finally{Ee(!1)}}},q=async()=>{c.info(`🖨️ অফিসিয়াল রিপোর্ট প্রিন্ট ডায়ালগ ওপেন হচ্ছে...`);let e=B;e||=await Le(),e?xe(e):c.error(`রিপোর্ট ডাটা লোড করা সম্ভব হয়নি।`)},Be=e=>{let t=[];if(e&&e.length>0?t=e.filter(e=>e&&e!==`0`&&e!==`N/A`):n&&n.teachers&&(t=n.teachers.filter(e=>!e.is_submitted&&e.phone&&e.phone!==`0`&&e.phone!==`N/A`).map(e=>e.phone)),t.length===0){c.info(`অনুপস্থিত শিক্ষকদের কোনো ফোন নম্বর পাওয়া যায়নি বা সবাই জমা দিয়েছেন!`);return}let r=t.join(`, `);navigator.clipboard.writeText(r),c.success(`মোট ${t.length} জন মিসিং শিক্ষকের ফোন নম্বর কপি করা হয়েছে! (SMS / WhatsApp এ পেস্ট করতে পারেন)`)},Ve=async t=>{if(t.preventDefault(),!e||H.length===0){c.warning(`অনুগ্রহ করে অন্তত একটি ফাইল নির্বাচন করুন।`);return}Ae(!0);try{await F.submitFiles(Number(e),H,Oe.trim()||void 0),c.success(`🎉 পাঠ পরিকল্পনা সফলভাবে জমা ও সিস্টেমে সংরক্ষিত হয়েছে!`),De([]),ke(``),K()}catch(e){c.error(e.response?.data?.message||`ফাইল আপলোড ব্যর্থ হয়েছে।`)}finally{Ae(!1)}},He=async e=>{if(window.confirm(`আপনি কি নিশ্চিত যে এই ফাইলটি মুছে ফেলতে চান?`)){Me(e);try{await F.deleteFile(e),c.success(`ফাইল মুছে ফেলা হয়েছে।`),K()}catch(e){c.error(e.response?.data?.message||`ফাইল মোছা সম্ভব হয়নি।`)}finally{Me(null)}}},Ue=e=>{if(!e||e===0)return`0 B`;let t=1024,n=[`B`,`KB`,`MB`,`GB`],r=Math.floor(Math.log(e)/Math.log(t));return parseFloat((e/t**r).toFixed(1))+` `+n[r]},We=e=>{let t=[`linear-gradient(135deg, #3b82f6, #1d4ed8)`,`linear-gradient(135deg, #10b981, #047857)`,`linear-gradient(135deg, #8b5cf6, #6d28d9)`,`linear-gradient(135deg, #f59e0b, #b45309)`,`linear-gradient(135deg, #ec4899, #be185d)`,`linear-gradient(135deg, #06b6d4, #0e7490)`,`linear-gradient(135deg, #6366f1, #4338ca)`,`linear-gradient(135deg, #14b8a6, #0f766e)`],n=0;for(let t=0;t<e.length;t++)n=e.charCodeAt(t)+((n<<5)-n);return t[Math.abs(n)%t.length]},Ge=e=>{if(!e)return`T`;let t=e.trim().split(/\s+/);return t.length>=2?(t[0][0]+t[1][0]).toUpperCase():e.slice(0,2).toUpperCase()};if(S)return(0,V.jsxs)(`div`,{className:`p-5 text-center text-muted`,children:[(0,V.jsx)(k,{animation:`border`,variant:`primary`,size:`sm`,className:`me-2`}),`ব্যাচ তথ্য লোড হচ্ছে...`]});if(!n)return(0,V.jsxs)(`div`,{className:`alert alert-danger p-4 text-center rounded-3 shadow-sm`,children:[(0,V.jsx)(`h5`,{children:`ব্যাচের তথ্য পাওয়া যায়নি।`}),(0,V.jsx)(N,{variant:`link`,onClick:()=>t(`/submission-tracking`),children:`সব ব্যাচ দেখুন`})]});let{batch:J,is_admin:Y=!1,my_submission:X}=n,Z=n.stats||{total_teachers:0,submitted_count:0,not_submitted_count:0,completion_percent:0},Q=n.teachers||[],Ke=Array.from(new Set(Q.map(e=>e.department_name).filter(Boolean))),qe=Q.filter(e=>{let t=e.name.toLowerCase().includes(W.toLowerCase())||e.phone&&e.phone.includes(W)||e.designation&&e.designation.toLowerCase().includes(W.toLowerCase())||e.employee_id&&e.employee_id.toLowerCase().includes(W.toLowerCase()),n=G===`all`||G===`submitted`&&e.is_submitted||G===`not_submitted`&&!e.is_submitted,r=Fe===`all`||e.department_name===Fe;return t&&n&&r}),$=Z.not_submitted_count;return(0,V.jsxs)(`div`,{className:`pb-5`,children:[(0,V.jsxs)(`div`,{className:`d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3`,children:[(0,V.jsxs)(N,{variant:`light`,size:`sm`,className:`d-flex align-items-center border shadow-xs rounded-pill px-3 py-1.5 fw-semibold text-secondary`,onClick:()=>t(`/submission-tracking`),children:[(0,V.jsx)(de,{size:16,className:`me-1 text-dark`}),(0,V.jsx)(`span`,{children:`সব ব্যাচ দেখুন (Back to Batches)`})]}),Y&&(0,V.jsxs)(`div`,{className:`d-flex gap-2 flex-wrap align-items-center`,children:[(0,V.jsxs)(`div`,{className:`toolbar-group bg-white p-1 rounded-3 border shadow-xs`,children:[(0,V.jsxs)(N,{variant:`primary`,size:`sm`,className:`d-flex align-items-center fw-bold shadow-xs px-3 py-1 text-white border-0`,style:{backgroundColor:`#0f2e5a`},onClick:q,title:`১-ক্লিকে প্রাতিষ্ঠানিক হেডার, লোগো ও ফুটারসহ রবিবার সকালের রিপোর্ট প্রিন্ট বা PDF হিসেবে সংরক্ষণ করুন`,children:[(0,V.jsx)(_,{size:15,className:`me-1.5 text-warning`}),(0,V.jsx)(`span`,{children:`রবিবার সকালের রিপোর্ট`})]}),$>0&&(0,V.jsxs)(N,{size:`sm`,className:`d-flex align-items-center fw-bold shadow-xs px-2.5 py-1 text-white border-0 btn-whatsapp`,onClick:()=>R(!0),title:`লেসন প্ল্যান জমা না দেওয়া শিক্ষকদের হোয়াটসঅ্যাপে সরাসরি রিমাইন্ডার মেসেজ পাঠান`,children:[(0,V.jsx)(u,{size:15,className:`me-1.5`}),(0,V.jsxs)(`span`,{children:[`WhatsApp তাগিদ (`,$,`)`]})]}),$>0&&(0,V.jsxs)(N,{variant:`outline-danger`,size:`sm`,className:`d-flex align-items-center fw-semibold px-2 py-1 border-0`,style:{backgroundColor:`#fef2f2`,color:`#dc2626`},onClick:()=>Be(),title:`SMS বা WhatsApp এ রিমাইন্ডার পাঠানোর জন্য মিসিং শিক্ষকদের ফোন নম্বর কপি করুন`,children:[(0,V.jsx)(s,{size:14,className:`me-1`}),(0,V.jsxs)(`span`,{children:[`নম্বর কপি (`,$,`)`]})]})]}),(0,V.jsxs)(`div`,{className:`toolbar-group bg-white p-1 rounded-3 border shadow-xs`,children:[Z.submitted_count>0&&(0,V.jsxs)(N,{variant:`outline-success`,size:`sm`,className:`d-flex align-items-center fw-semibold border-0 px-2.5 py-1`,style:{backgroundColor:`#f0fdf4`,color:`#166534`},onClick:ze,disabled:Te,title:`সকল শিক্ষকের জমাকৃত ফাইল এক ক্লিকে ZIP হিসেবে ডাউনলোড করুন`,children:[(0,V.jsx)(oe,{size:14,className:`me-1.5 text-success`}),(0,V.jsx)(`span`,{children:Te?`ZIP প্রস্তুত হচ্ছে...`:`সব ফাইল ZIP ডাউনলোড`})]}),(0,V.jsx)(N,{variant:J.is_active?`outline-secondary`:`success`,size:`sm`,className:`d-flex align-items-center border-0 px-2.5 py-1 fw-semibold`,style:J.is_active?{backgroundColor:`#f1f5f9`,color:`#475569`}:{},onClick:Re,title:J.is_active?`স্লট বন্ধ বা লক করুন`:`স্লট পুনরায় সক্রিয় করুন`,children:J.is_active?(0,V.jsxs)(V.Fragment,{children:[(0,V.jsx)(v,{size:14,className:`me-1 text-muted`}),` লক করুন`]}):(0,V.jsxs)(V.Fragment,{children:[(0,V.jsx)(r,{size:14,className:`me-1 text-white`}),` সক্রিয় করুন`]})})]})]})]}),(0,V.jsx)(M,{className:`border shadow-sm rounded-3 mb-4 bg-white overflow-hidden`,children:(0,V.jsxs)(M.Body,{className:`p-4`,children:[(0,V.jsxs)(`div`,{className:`d-flex justify-content-between align-items-start flex-wrap gap-3 mb-3`,children:[(0,V.jsxs)(`div`,{children:[(0,V.jsxs)(`div`,{className:`d-flex align-items-center gap-2 mb-2 flex-wrap`,children:[(0,V.jsx)(`span`,{className:`badge rounded-pill bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 px-2.5 py-1 fw-semibold small`,children:J.category.replace(`_`,` `).toUpperCase()}),J.allow_multiple_files&&(0,V.jsx)(`span`,{className:`badge rounded-pill bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-2.5 py-1 fw-semibold small`,children:`একাধিক ফাইল অনুমোদিত`}),J.is_active?(0,V.jsxs)(`span`,{className:`badge rounded-pill bg-success text-white px-2.5 py-1 fw-semibold small d-inline-flex align-items-center`,children:[(0,V.jsx)(`span`,{className:`spinner-grow spinner-grow-sm me-1.5`,style:{width:7,height:7}}),`সক্রিয় (Open)`]}):(0,V.jsx)(`span`,{className:`badge rounded-pill bg-secondary text-white px-2.5 py-1 fw-semibold small`,children:`🔒 বন্ধ / লক করা (Closed)`})]}),(0,V.jsx)(`h3`,{className:`fw-bold text-dark mb-2`,children:J.title}),(0,V.jsxs)(`div`,{className:`text-muted small d-flex align-items-center gap-3 flex-wrap`,children:[(0,V.jsxs)(`span`,{className:`d-inline-flex align-items-center bg-light px-2.5 py-1 rounded-2 border`,children:[(0,V.jsx)(p,{size:14,className:`me-1.5 text-primary`}),(0,V.jsx)(`strong`,{children:`কার্যকাল:`}),`\xA0`,J.date_range_display]}),(0,V.jsxs)(`span`,{className:`d-inline-flex align-items-center bg-light px-2.5 py-1 rounded-2 border`,children:[(0,V.jsx)(le,{size:14,className:`me-1.5 text-secondary`}),(0,V.jsx)(`strong`,{children:`শ্রেণি / বিভাগ:`}),`\xA0`,J.class_name]}),(0,V.jsxs)(`span`,{className:`d-inline-flex align-items-center px-2.5 py-1 rounded-2 border`,style:{backgroundColor:`#fef2f2`,borderColor:`#fecaca`,color:`#b91c1c`},children:[(0,V.jsx)(E,{size:14,className:`me-1.5 text-danger`}),(0,V.jsx)(`strong`,{children:`ডেডলাইন:`}),`\xA0শনিবার রাত ১১:৫৯`]})]})]}),Y&&(0,V.jsxs)(N,{variant:`outline-secondary`,size:`sm`,className:`d-flex align-items-center fw-semibold rounded-pill px-3 py-1.5 shadow-xs`,onClick:q,children:[(0,V.jsx)(_,{size:14,className:`me-1.5 text-primary`}),`পেজ প্রিন্ট / PDF`]})]}),J.instructions&&(0,V.jsxs)(`div`,{className:`p-3 bg-light rounded-3 border small mt-3 d-flex align-items-start gap-2`,children:[(0,V.jsx)(m,{size:17,className:`text-primary flex-shrink-0 mt-0.5`}),(0,V.jsxs)(`div`,{children:[(0,V.jsx)(`strong`,{className:`text-dark`,children:`নির্দেশনা (Instructions):`}),` `,J.instructions]})]}),Y&&(0,V.jsxs)(A,{className:`g-3 mt-3`,children:[(0,V.jsx)(b,{lg:3,sm:6,xs:6,children:(0,V.jsxs)(`div`,{className:`kpi-card kpi-card-navy h-100 d-flex align-items-center justify-content-between`,children:[(0,V.jsxs)(`div`,{children:[(0,V.jsx)(`div`,{className:`kpi-label`,children:`মোট শিক্ষক (Total Faculty)`}),(0,V.jsx)(`div`,{className:`kpi-value text-dark`,children:Z.total_teachers}),(0,V.jsx)(`div`,{className:`text-muted`,style:{fontSize:`0.75rem`},children:`তালিকাভুক্ত শিক্ষক`})]}),(0,V.jsx)(`div`,{className:`kpi-icon-box kpi-icon-navy`,children:(0,V.jsx)(ue,{size:22})})]})}),(0,V.jsx)(b,{lg:3,sm:6,xs:6,children:(0,V.jsxs)(`div`,{className:`kpi-card kpi-card-success h-100 d-flex align-items-center justify-content-between`,children:[(0,V.jsxs)(`div`,{children:[(0,V.jsx)(`div`,{className:`kpi-label text-success`,children:`জমা দিয়েছেন (Submitted)`}),(0,V.jsx)(`div`,{className:`kpi-value text-success`,children:Z.submitted_count}),(0,V.jsx)(`div`,{className:`text-success`,style:{fontSize:`0.75rem`},children:`সফলভাবে জমা হয়েছে`})]}),(0,V.jsx)(`div`,{className:`kpi-icon-box kpi-icon-success`,children:(0,V.jsx)(f,{size:22})})]})}),(0,V.jsx)(b,{lg:3,sm:6,xs:6,children:(0,V.jsxs)(`div`,{className:`kpi-card kpi-card-danger h-100 d-flex align-items-center justify-content-between`,children:[(0,V.jsxs)(`div`,{children:[(0,V.jsx)(`div`,{className:`kpi-label text-danger`,children:`বাকি রয়েছে (Pending)`}),(0,V.jsx)(`div`,{className:`kpi-value text-danger`,children:Z.not_submitted_count}),(0,V.jsx)(`div`,{className:`text-danger`,style:{fontSize:`0.75rem`},children:`তাগিদ পাঠানো প্রয়োজন`})]}),(0,V.jsx)(`div`,{className:`kpi-icon-box kpi-icon-danger`,children:(0,V.jsx)(m,{size:22})})]})}),(0,V.jsx)(b,{lg:3,sm:6,xs:12,children:(0,V.jsxs)(`div`,{className:`kpi-card kpi-card-primary h-100`,children:[(0,V.jsxs)(`div`,{className:`d-flex align-items-center justify-content-between mb-1`,children:[(0,V.jsx)(`div`,{className:`kpi-label text-primary`,children:`অগ্রগতি (Completion)`}),(0,V.jsx)(`div`,{className:`kpi-icon-box kpi-icon-primary`,style:{width:34,height:34},children:(0,V.jsx)(ce,{size:18})})]}),(0,V.jsxs)(`div`,{className:`d-flex align-items-baseline gap-2 mb-1.5`,children:[(0,V.jsxs)(`span`,{className:`kpi-value text-primary`,children:[Z.completion_percent,`%`]}),(0,V.jsx)(`span`,{className:`text-muted small`,children:`সম্পন্ন`})]}),(0,V.jsx)(ee,{now:Z.completion_percent,variant:Z.completion_percent>80?`success`:Z.completion_percent>50?`primary`:`warning`,style:{height:`7px`,borderRadius:`10px`}})]})})]})]})}),!Y&&(0,V.jsx)(`div`,{className:`teacher-submission-portal`,children:(0,V.jsxs)(A,{className:`g-4`,children:[(0,V.jsx)(b,{lg:7,children:(0,V.jsxs)(M,{className:`border shadow-sm rounded-3 h-100 bg-white`,children:[(0,V.jsxs)(M.Header,{className:`bg-white p-3.5 border-bottom d-flex align-items-center justify-content-between`,children:[(0,V.jsxs)(`div`,{className:`d-flex align-items-center`,children:[(0,V.jsx)(ge,{size:20,className:`text-primary me-2`}),(0,V.jsx)(`h5`,{className:`fw-bold mb-0 text-dark`,children:`আমার জমাকৃত পাঠ পরিকল্পনা`})]}),X?(0,V.jsxs)(`span`,{className:`badge rounded-pill bg-success px-3 py-1.5 fw-semibold d-inline-flex align-items-center shadow-xs`,children:[(0,V.jsx)(d,{size:14,className:`me-1`}),` জমা সম্পন্ন (Submitted)`]}):(0,V.jsxs)(`span`,{className:`badge rounded-pill bg-danger px-3 py-1.5 fw-semibold d-inline-flex align-items-center shadow-xs`,children:[(0,V.jsx)(m,{size:14,className:`me-1`}),` এখনও জমা দেননি`]})]}),(0,V.jsxs)(M.Body,{className:`p-4`,children:[X?(0,V.jsxs)(`div`,{children:[(0,V.jsx)(`div`,{className:`p-3.5 rounded-3 mb-4 border`,style:{backgroundColor:`#f0fdf4`,borderColor:`#86efac`},children:(0,V.jsxs)(A,{className:`g-3 small align-items-center`,children:[(0,V.jsxs)(b,{sm:6,children:[(0,V.jsx)(`div`,{className:`text-muted`,children:`জমা দেওয়ার স্ট্যাটাস:`}),(0,V.jsxs)(`div`,{className:`fw-bold text-success fs-6 d-flex align-items-center mt-1`,children:[(0,V.jsx)(f,{size:18,className:`me-1.5`}),`সফলভাবে জমা হয়েছে`]})]}),(0,V.jsxs)(b,{sm:6,children:[(0,V.jsx)(`div`,{className:`text-muted`,children:`রিভিশন কাউন্ট:`}),(0,V.jsx)(`div`,{className:`mt-1`,children:X.update_count&&X.update_count>1?(0,V.jsxs)(`span`,{className:`badge rounded-pill bg-warning text-dark border px-2.5 py-1 fs-6 font-monospace`,children:[`🔄 মোট `,X.update_count,` বার আপডেট হয়েছে`]}):(0,V.jsx)(`span`,{className:`badge rounded-pill bg-success bg-opacity-75 text-white px-2.5 py-1 fs-6 font-monospace`,children:`🔄 ১ম বার জমা দেওয়া হয়েছে`})})]}),(0,V.jsxs)(b,{sm:6,className:`mt-2`,children:[(0,V.jsx)(`span`,{className:`text-muted`,children:`প্রথম জমার সময়: `}),(0,V.jsx)(`strong`,{className:`text-dark font-monospace`,children:X.submitted_at||`—`})]}),(0,V.jsxs)(b,{sm:6,className:`mt-2`,children:[(0,V.jsx)(`span`,{className:`text-muted`,children:`সর্বশেষ আপডেট: `}),(0,V.jsx)(`strong`,{className:`text-dark font-monospace`,children:X.last_updated_at||X.submitted_at||`—`})]}),X.remarks&&(0,V.jsxs)(b,{xs:12,className:`mt-2 pt-2 border-top`,children:[(0,V.jsx)(`span`,{className:`text-muted`,children:`আপনার মন্তব্য / নোট: `}),(0,V.jsx)(`span`,{className:`text-dark fw-medium`,children:X.remarks})]})]})}),(0,V.jsxs)(`h6`,{className:`fw-bold text-dark mb-3 d-flex align-items-center`,children:[(0,V.jsx)(y,{size:16,className:`me-1.5 text-primary`}),`সংযুক্ত ফাইলসমূহ (`,X.files.length,`টি ফাইল)`]}),X.files.length===0?(0,V.jsx)(`p`,{className:`text-muted small`,children:`কোনো ফাইল খুঁজে পাওয়া যায়নি।`}):(0,V.jsx)(`div`,{className:`d-flex flex-column gap-2 mb-4`,children:X.files.map(e=>(0,V.jsxs)(`div`,{className:`d-flex align-items-center justify-content-between p-3 rounded-3 border bg-light`,children:[(0,V.jsxs)(`div`,{className:`d-flex align-items-center overflow-hidden me-2`,children:[(0,V.jsx)(fe,{size:20,className:`text-primary me-2.5 flex-shrink-0`}),(0,V.jsxs)(`div`,{className:`text-truncate`,children:[(0,V.jsx)(`div`,{className:`fw-semibold text-dark text-truncate`,title:e.file_name,children:e.file_name}),(0,V.jsxs)(`div`,{className:`text-muted d-flex align-items-center gap-1.5 flex-wrap`,style:{fontSize:`0.75rem`},children:[(0,V.jsx)(`span`,{children:Ue(e.file_size)}),(0,V.jsxs)(`span`,{children:[`• `,e.file_type?.toUpperCase()||`FILE`]})]})]})]}),(0,V.jsxs)(`div`,{className:`d-flex align-items-center gap-1.5 flex-shrink-0`,children:[(0,V.jsxs)(`a`,{href:e.file_url,target:`_blank`,rel:`noreferrer`,className:`btn btn-sm btn-outline-primary py-1 px-3 d-flex align-items-center text-decoration-none rounded-pill fw-semibold shadow-xs`,title:`ফাইলটি সরাসরি ডাউনলোড বা ভিউ করুন`,children:[(0,V.jsx)(pe,{size:13,className:`me-1.5`}),`ডাউনলোড`]}),J.is_active&&(0,V.jsx)(N,{variant:`outline-danger`,size:`sm`,className:`py-1 px-2 d-flex align-items-center rounded-2`,onClick:()=>He(e.id),disabled:je===e.id,title:`ফাইল মুছে ফেলুন`,children:je===e.id?(0,V.jsx)(k,{animation:`border`,size:`sm`}):(0,V.jsx)(ae,{size:13})})]})]},e.id))})]}):(0,V.jsxs)(`div`,{className:`text-center py-5`,children:[(0,V.jsx)(`div`,{className:`mb-3 text-warning`,children:(0,V.jsx)(m,{size:48,className:`text-warning`})}),(0,V.jsx)(`h6`,{className:`fw-bold text-dark`,children:`আপনি এখনও কোনো লেসন প্ল্যান বা ফাইল জমা দেননি`}),(0,V.jsx)(`p`,{className:`text-muted small mb-0 px-md-4`,children:`ডান পাশের ফর্মটি ব্যবহার করে নির্ধারিত ডেডলাইনের পূর্বে আপনার পাঠ পরিকল্পনা আপলোড করুন। ফাইলটি স্বয়ংক্রিয়ভাবে সার্ভারে সুরক্ষিত থাকবে।`})]}),(0,V.jsxs)(`div`,{className:`p-3 rounded-3 bg-light border mt-4 small text-muted d-flex align-items-start gap-2`,children:[(0,V.jsx)(o,{size:20,className:`text-success flex-shrink-0 mt-0.5`}),(0,V.jsxs)(`div`,{children:[(0,V.jsx)(`strong`,{children:`নিরাপত্তা ও প্রাইভেসি:`}),` আপনার জমাকৃত পাঠ পরিকল্পনা সম্পূর্ণ সুরক্ষিত। আপনি ও একাডেমিক কর্তৃপক্ষ ছাড়া অন্য কোনো সাধারণ শিক্ষক আপনার ফাইল দেখতে পারবেন না।`]})]})]})]})}),(0,V.jsx)(b,{lg:5,children:(0,V.jsxs)(M,{className:`border shadow-sm rounded-3 bg-white h-100`,children:[(0,V.jsx)(M.Header,{className:`bg-white p-3.5 border-bottom`,children:(0,V.jsxs)(`div`,{className:`d-flex align-items-center`,children:[(0,V.jsx)(a,{size:20,className:`text-primary me-2`}),(0,V.jsx)(`h5`,{className:`fw-bold mb-0 text-dark`,children:X?`নতুন ফাইল আপডেট করুন`:`ফাইল আপলোড করুন`})]})}),(0,V.jsx)(M.Body,{className:`p-4`,children:J.is_active?(0,V.jsxs)(O,{onSubmit:Ve,children:[X&&(0,V.jsxs)(`div`,{className:`p-3 rounded-3 small mb-3 border d-flex align-items-start gap-2`,style:{backgroundColor:`#eff6ff`,borderColor:`#bfdbfe`,color:`#1e40af`},children:[(0,V.jsx)(he,{size:16,className:`text-primary flex-shrink-0 mt-0.5`}),(0,V.jsxs)(`div`,{children:[(0,V.jsx)(`strong`,{children:`টিপস:`}),` আপনি একাধিকবার সংশোধিত ফাইল আপলোড করতে পারবেন। সর্বশেষ রিভিশনটি মূল ফাইল হিসেবে সেভ থাকবে।`]})]}),(0,V.jsxs)(O.Group,{className:`mb-3`,children:[(0,V.jsxs)(O.Label,{className:`fw-bold text-dark small`,children:[`ফাইল নির্বাচন করুন (Choose Files) `,(0,V.jsx)(`span`,{className:`text-danger`,children:`*`})]}),(0,V.jsx)(O.Control,{type:`file`,multiple:J.allow_multiple_files,onChange:e=>{e.target.files&&De(Array.from(e.target.files))},accept:`.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png`,disabled:U,className:`p-2.5 rounded-3`}),(0,V.jsxs)(O.Text,{className:`text-muted small`,children:[`সমর্থিত ফরম্যাট: PDF, DOC, DOCX, XLS, PPTX, JPG (সর্বোচ্চ ২৫ MB)`,J.allow_multiple_files&&` • একসাথে একাধিক ফাইল সিলেক্ট করতে পারেন।`]})]}),H.length>0&&(0,V.jsxs)(`div`,{className:`mb-3 p-3 bg-light rounded-3 border small`,children:[(0,V.jsxs)(`strong`,{className:`text-dark d-block mb-1.5`,children:[`নির্বাচিত ফাইল (`,H.length,`টি):`]}),(0,V.jsx)(`div`,{className:`d-flex flex-column gap-1`,children:H.map((e,t)=>(0,V.jsxs)(`div`,{className:`d-flex align-items-center justify-content-between text-muted text-truncate bg-white p-1.5 px-2 rounded border`,children:[(0,V.jsx)(`span`,{className:`text-truncate`,children:e.name}),(0,V.jsx)(`span`,{className:`text-secondary fw-semibold ms-2 font-monospace`,children:Ue(e.size)})]},t))})]}),(0,V.jsxs)(O.Group,{className:`mb-4`,children:[(0,V.jsx)(O.Label,{className:`fw-bold text-dark small`,children:`মন্তব্য বা নোট (ঐচ্ছিক / Optional Remarks)`}),(0,V.jsx)(O.Control,{as:`textarea`,rows:3,placeholder:`লেসন প্ল্যান বা সপ্তাহের বিশেষ কোনো নোট থাকলে লিখুন...`,value:Oe,onChange:e=>ke(e.target.value),disabled:U,className:`rounded-3`})]}),(0,V.jsx)(N,{type:`submit`,variant:`primary`,className:`w-100 py-2.5 fw-bold d-flex align-items-center justify-content-center shadow-sm rounded-3`,disabled:U||H.length===0,style:{backgroundColor:`#0f2e5a`,borderColor:`#0f2e5a`},children:U?(0,V.jsxs)(V.Fragment,{children:[(0,V.jsx)(k,{animation:`border`,size:`sm`,className:`me-2`}),`ফাইল আপলোড হচ্ছে...`]}):X?(0,V.jsxs)(V.Fragment,{children:[(0,V.jsx)(a,{size:18,className:`me-2 text-warning`}),`নতুন রিভিশন ফাইল আপডেট করুন`]}):(0,V.jsxs)(V.Fragment,{children:[(0,V.jsx)(a,{size:18,className:`me-2 text-warning`}),`লেসন প্ল্যান জমা দিন (Submit File)`]})})]}):(0,V.jsxs)(me,{variant:`secondary`,className:`p-3 text-center rounded-3`,children:[(0,V.jsx)(v,{size:28,className:`mb-2 text-muted`}),(0,V.jsx)(`h6`,{className:`fw-bold text-dark mb-1`,children:`এই ব্যাচের সময়সীমা শেষ হয়েছে / স্লট লক করা আছে`}),(0,V.jsx)(`p`,{className:`small text-muted mb-0`,children:`প্রশাসন থেকে ব্যাচটি বন্ধ থাকায় বর্তমানে নতুন ফাইল আপলোড বা পরিবর্তন গ্রহণ করা সম্ভব নয়।`})]})})]})})]})}),Y&&(0,V.jsxs)(V.Fragment,{children:[(0,V.jsxs)(`div`,{className:`mb-3 d-flex justify-content-between align-items-center flex-wrap gap-2`,children:[(0,V.jsxs)(`div`,{className:`segmented-control-wrapper`,children:[(0,V.jsxs)(`button`,{type:`button`,className:`segmented-control-btn ${C===`table`?`active`:``}`,onClick:()=>ne(`table`),children:[(0,V.jsx)(se,{size:16}),(0,V.jsx)(`span`,{children:`ম্যানেজমেন্ট টেবিল ভিউ (Table View)`})]}),(0,V.jsxs)(`button`,{type:`button`,className:`segmented-control-btn ${C===`report`?`active`:``}`,onClick:()=>ne(`report`),children:[(0,V.jsx)(fe,{size:16}),(0,V.jsx)(`span`,{children:`রবিবার সকালের অফিশিয়াল রিপোর্ট (Official Report)`})]})]}),(0,V.jsxs)(`div`,{className:`text-muted small`,children:[`মোট `,(0,V.jsx)(`strong`,{children:qe.length}),` জন শিক্ষক ফিল্টার করা হয়েছে`]})]}),C===`table`&&(0,V.jsxs)(M,{className:`border shadow-sm rounded-3 bg-white overflow-hidden`,children:[(0,V.jsx)(M.Header,{className:`bg-white p-3 border-bottom`,children:(0,V.jsxs)(A,{className:`g-2 align-items-center`,children:[(0,V.jsx)(b,{md:4,children:(0,V.jsxs)(`div`,{className:`position-relative`,children:[(0,V.jsx)(ie,{size:15,className:`position-absolute top-50 start-0 translate-middle-y ms-3 text-muted`}),(0,V.jsx)(O.Control,{className:`ps-5 pe-4 rounded-3`,size:`sm`,placeholder:`শিক্ষকের নাম, মোবাইল বা পদবি দিয়ে খুঁজুন...`,value:W,onChange:e=>Ne(e.target.value)}),W&&(0,V.jsx)(`button`,{type:`button`,className:`btn btn-link btn-sm position-absolute top-50 end-0 translate-middle-y text-muted p-1 me-1`,onClick:()=>Ne(``),children:(0,V.jsx)(x,{size:14})})]})}),(0,V.jsx)(b,{md:5,children:(0,V.jsxs)(`div`,{className:`d-flex gap-1.5 flex-wrap`,children:[(0,V.jsxs)(N,{size:`sm`,variant:G===`all`?`dark`:`light`,className:`rounded-pill px-3 py-1 fw-semibold border ${G===`all`?``:`text-secondary`}`,onClick:()=>Pe(`all`),children:[`সব (`,Q.length,`)`]}),(0,V.jsxs)(N,{size:`sm`,variant:G===`submitted`?`success`:`light`,className:`rounded-pill px-3 py-1 fw-semibold border ${G===`submitted`?`text-white`:`text-success`}`,style:G===`submitted`?{backgroundColor:`#10b981`}:{},onClick:()=>Pe(`submitted`),children:[`জমা দিয়েছেন (`,Z.submitted_count,`)`]}),(0,V.jsxs)(N,{size:`sm`,variant:G===`not_submitted`?`danger`:`light`,className:`rounded-pill px-3 py-1 fw-semibold border ${G===`not_submitted`?`text-white`:`text-danger`}`,style:G===`not_submitted`?{backgroundColor:`#ef4444`}:{},onClick:()=>Pe(`not_submitted`),children:[`বাকি রয়েছে (`,Z.not_submitted_count,`)`]})]})}),(0,V.jsx)(b,{md:3,children:(0,V.jsxs)(O.Select,{size:`sm`,className:`rounded-3`,value:Fe,onChange:e=>Ie(e.target.value),children:[(0,V.jsx)(`option`,{value:`all`,children:`সব বিভাগ (All Departments)`}),Ke.map(e=>(0,V.jsx)(`option`,{value:e,children:e},e))]})})]})}),(0,V.jsx)(M.Body,{className:`p-0`,children:(0,V.jsxs)(T,{responsive:!0,hover:!0,className:`table-modern align-middle mb-0`,children:[(0,V.jsx)(`thead`,{children:(0,V.jsxs)(`tr`,{children:[(0,V.jsx)(`th`,{style:{width:`55px`},className:`text-center`,children:`SL`}),(0,V.jsx)(`th`,{style:{width:`90px`},children:`EMP ID`}),(0,V.jsx)(`th`,{children:`শিক্ষকের নাম ও পদবি (Teacher)`}),(0,V.jsx)(`th`,{children:`বিভাগ (Department)`}),(0,V.jsx)(`th`,{children:`মোবাইল নম্বর (Phone)`}),(0,V.jsx)(`th`,{children:`স্ট্যাটাস ও রিভিশন (Status)`}),(0,V.jsx)(`th`,{children:`আপলোডকৃত ফাইল`}),(0,V.jsx)(`th`,{children:`জমা / আপডেটের সময়`})]})}),(0,V.jsx)(`tbody`,{children:qe.length===0?(0,V.jsx)(`tr`,{children:(0,V.jsxs)(`td`,{colSpan:8,className:`text-center py-5 text-muted`,children:[(0,V.jsx)(m,{size:32,className:`text-muted mb-2 opacity-50`}),(0,V.jsx)(`div`,{children:`কোনো শিক্ষকের তথ্য খুঁজে পাওয়া যায়নি।`})]})}):qe.map((e,t)=>(0,V.jsxs)(`tr`,{className:e.is_submitted?``:`table-light`,children:[(0,V.jsx)(`td`,{className:`text-center`,children:(0,V.jsx)(`span`,{className:`badge rounded-pill bg-light text-secondary border font-monospace fw-bold px-2 py-1`,children:e.serial_number!==void 0&&e.serial_number!==null?e.serial_number:t+1})}),(0,V.jsx)(`td`,{children:e.employee_id?(0,V.jsx)(`span`,{className:`badge rounded-pill bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 font-monospace px-2 py-1`,children:e.employee_id}):(0,V.jsx)(`span`,{className:`text-muted small`,children:`—`})}),(0,V.jsx)(`td`,{children:(0,V.jsxs)(`div`,{className:`d-flex align-items-center gap-2.5`,children:[(0,V.jsx)(`div`,{className:`teacher-avatar-chip`,style:{background:We(e.name)},children:Ge(e.name)}),(0,V.jsxs)(`div`,{children:[(0,V.jsx)(`div`,{className:`fw-bold text-dark`,children:e.name}),(0,V.jsx)(`div`,{className:`text-muted small`,children:e.designation})]})]})}),(0,V.jsx)(`td`,{children:(0,V.jsx)(`span`,{className:`badge rounded-pill bg-light text-secondary border px-2.5 py-1`,children:e.department_name})}),(0,V.jsx)(`td`,{className:`small font-monospace`,children:e.phone&&e.phone!==`0`&&e.phone!==`N/A`?(0,V.jsxs)(`a`,{href:`tel:${e.phone}`,className:`badge rounded-pill bg-light text-dark border text-decoration-none px-2.5 py-1 d-inline-flex align-items-center`,children:[(0,V.jsx)(P,{size:12,className:`me-1 text-primary`}),e.phone]}):(0,V.jsx)(`span`,{className:`text-muted small`,children:`N/A`})}),(0,V.jsx)(`td`,{children:e.is_submitted?(0,V.jsxs)(`div`,{children:[(0,V.jsxs)(`span`,{className:`badge rounded-pill px-2.5 py-1 d-inline-flex align-items-center`,style:{backgroundColor:`#dcfce7`,color:`#15803d`,border:`1px solid #86efac`},children:[(0,V.jsx)(f,{size:13,className:`me-1`}),`Submitted`]}),e.update_count&&e.update_count>1?(0,V.jsx)(`div`,{className:`mt-1`,children:(0,V.jsxs)(`span`,{className:`badge rounded-pill px-2 py-0.5 font-monospace`,style:{backgroundColor:`#fef3c7`,color:`#92400e`,border:`1px solid #fde68a`,fontSize:`0.7rem`},title:`এই শিক্ষক মোট ${e.update_count} বার ফাইল আপডেট করেছেন`,children:[`🔄 `,e.update_count,` বার আপডেট`]})}):(0,V.jsx)(`div`,{className:`mt-1`,children:(0,V.jsx)(`span`,{className:`badge rounded-pill px-2 py-0.5 text-muted font-monospace bg-light border`,style:{fontSize:`0.68rem`},children:`১ম জমা`})})]}):(0,V.jsxs)(`span`,{className:`badge rounded-pill px-2.5 py-1 d-inline-flex align-items-center`,style:{backgroundColor:`#fee2e2`,color:`#b91c1c`,border:`1px solid #fca5a5`},children:[(0,V.jsx)(h,{size:13,className:`me-1`}),`জমা দেননি`]})}),(0,V.jsx)(`td`,{children:e.files&&e.files.length>0?(0,V.jsx)(`div`,{className:`d-flex flex-column gap-1`,children:e.files.map(e=>(0,V.jsxs)(`a`,{href:e.file_url,target:`_blank`,rel:`noreferrer`,className:`file-download-chip`,title:`Download ${e.file_name}`,children:[(0,V.jsx)(y,{size:12,className:`text-primary`}),(0,V.jsx)(`span`,{children:e.file_name.length>20?e.file_name.substring(0,18)+`...`:e.file_name}),(0,V.jsx)(pe,{size:11,className:`text-muted ms-1`})]},e.id))}):(0,V.jsx)(`div`,{className:`d-flex align-items-center gap-1`,children:(0,V.jsxs)(N,{size:`sm`,className:`py-1 px-2.5 d-inline-flex align-items-center text-white fw-semibold rounded-pill btn-whatsapp border-0 shadow-xs`,style:{fontSize:`0.78rem`},onClick:()=>{let t=z(L[0].text,e,J);if(!e.phone||e.phone===`0`||e.phone===`N/A`){c.error(`শিক্ষকের কোনো ফোন নম্বর নেই।`);return}ve(e.phone,t)},disabled:!e.phone||e.phone===`0`||e.phone===`N/A`,title:`এই শিক্ষককে হোয়াটসঅ্যাপে রিমাইন্ডার পাঠান`,children:[(0,V.jsx)(g,{size:11,className:`me-1.5`}),`WhatsApp তাগিদ`]})})}),(0,V.jsxs)(`td`,{className:`small font-monospace text-muted`,children:[(0,V.jsx)(`div`,{children:e.submitted_at||`—`}),e.last_updated_at&&e.last_updated_at!==e.submitted_at&&(0,V.jsxs)(`div`,{className:`small text-primary fw-medium`,style:{fontSize:`0.72rem`},children:[`আপডেট: `,e.last_updated_at]})]})]},e.teacher_id))})]})})]}),C===`report`&&(0,V.jsxs)(`div`,{children:[(0,V.jsxs)(`div`,{className:`d-flex justify-content-end mb-3 gap-2 flex-wrap`,children:[$>0&&(0,V.jsxs)(N,{size:`sm`,className:`d-flex align-items-center fw-bold shadow-xs text-white btn-whatsapp border-0 rounded-pill px-3 py-1.5`,onClick:()=>R(!0),children:[(0,V.jsx)(u,{size:15,className:`me-1.5`}),`হোয়াটসঅ্যাপ রিমাইন্ডার (`,$,`)`]}),(0,V.jsxs)(N,{variant:`primary`,size:`sm`,className:`d-flex align-items-center fw-bold shadow-xs rounded-pill px-3.5 py-1.5 text-white border-0`,style:{backgroundColor:`#0f2e5a`},onClick:q,children:[(0,V.jsx)(_,{size:15,className:`me-1.5 text-warning`}),`এই রিপোর্টটি প্রিন্ট করুন / Save as PDF`]})]}),Ce?(0,V.jsxs)(`div`,{className:`p-5 text-center text-muted bg-white rounded-3 border`,children:[(0,V.jsx)(k,{animation:`border`,size:`sm`,className:`me-2`}),`রিপোর্ট লোড হচ্ছে...`]}):B?(0,V.jsx)(ye,{data:B,onPrint:q,onOpenWhatsApp:()=>R(!0)}):(0,V.jsx)(`div`,{className:`p-4 text-center text-danger bg-white rounded-3 border`,children:`রিপোর্ট ডাটা পাওয়া যায়নি।`})]}),(0,V.jsxs)(w,{show:D,onHide:()=>j(!1),size:`xl`,centered:!0,className:`sunday-report-modal`,children:[(0,V.jsx)(w.Header,{closeButton:!0,className:`bg-light`,children:(0,V.jsxs)(w.Title,{className:`fs-6 fw-bold text-dark d-flex align-items-center`,children:[(0,V.jsx)(le,{size:18,className:`me-2 text-primary`}),`রবিবার সকালের অফিসিয়াল রিপোর্ট (Sunday Morning Tracking Report)`]})}),(0,V.jsx)(w.Body,{className:`p-3 p-md-4`,children:Ce?(0,V.jsxs)(`div`,{className:`p-5 text-center text-muted`,children:[(0,V.jsx)(k,{animation:`border`,size:`sm`,className:`me-2`}),`রিপোর্ট প্রস্তুত করা হচ্ছে...`]}):B?(0,V.jsx)(ye,{data:B,onPrint:q,onOpenWhatsApp:()=>R(!0)}):(0,V.jsx)(`div`,{className:`p-4 text-center text-danger`,children:`রিপোর্ট ডাটা পাওয়া যায়নি।`})}),(0,V.jsxs)(w.Footer,{className:`bg-light`,children:[(0,V.jsx)(N,{variant:`secondary`,className:`rounded-pill px-3`,onClick:()=>j(!1),children:`বন্ধ করুন`}),(0,V.jsxs)(N,{variant:`primary`,className:`d-flex align-items-center fw-bold rounded-pill px-3.5`,style:{backgroundColor:`#0f2e5a`,borderColor:`#0f2e5a`},onClick:q,children:[(0,V.jsx)(_,{size:16,className:`me-1.5 text-warning`}),`রিপোর্ট প্রিন্ট করুন / Save as PDF`]})]})]}),(0,V.jsx)(be,{show:_e,onHide:()=>R(!1),batch:J,missingTeachers:Q.filter(e=>!e.is_submitted)})]})]})};export{Se as SubmissionBatchDetails};