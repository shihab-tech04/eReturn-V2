/** UI guidance only: not statutory interpretation or verified NBR instructions. */
export type HelpLanguage = 'en' | 'bn';
export type HelpCopy = { en: string; bn: string };
export type Guide = { title: HelpCopy; purpose: HelpCopy; steps: [HelpCopy, HelpCopy]; caution?: HelpCopy };
const c=(en:string,bn:string):HelpCopy=>({en,bn});
const g=(en:string,bn:string,purposeEn:string,purposeBn:string):Guide=>({
  title:c(en,bn),purpose:c(purposeEn,purposeBn),
  steps:[
    c('Review the section and enter only facts supported by your records.','বিভাগটি পর্যালোচনা করুন এবং কেবল নথিপত্রসমর্থিত তথ্য দিন।'),
    c('Check every entry and use the return summary to review your draft.','প্রতিটি তথ্য যাচাই করে রিটার্ন সারসংক্ষেপে খসড়া পর্যালোচনা করুন।')
  ]
});
const guides:Record<string,Guide>={
  home:g('Dashboard','ড্যাশবোর্ড','Begin or resume your return and see the information you have entered.','রিটার্ন শুরু বা চালু করুন এবং আপনার দেওয়া তথ্য দেখুন।'),
  'return-workspace':g('My Tax Return','আমার আয়কর রিটার্ন','Review assessment, income, expenditure, assets, payment entries and draft preview.','কর নির্ধারণ, আয়, ব্যয়, সম্পদ, পরিশোধ ও খসড়ার পূর্বরূপ দেখুন।'),
  'tax-records':g('Tax Records','কর রেকর্ড','Access certificate, challan and history screens. Entries are not proof of an official record.','সনদ, চালান ও ইতিহাসের পৃষ্ঠা দেখুন। নথিভুক্ত তথ্য সরকারি রেকর্ডের প্রমাণ নয়।'),
  assessment:g('Assessment details','কর নির্ধারণের তথ্য','Check assessment year, income period, residency and return selections before entering income.','আয়ের তথ্যের আগে করবর্ষ, আয়কাল, আবাসিক অবস্থা ও রিটার্নের ধরন যাচাই করুন।'),
  income:g('Income overview','আয়ের সারসংক্ষেপ','Open the income sections relevant to your circumstances; you do not have to enter every category.','শুধু আপনার ক্ষেত্রে প্রযোজ্য আয়ের বিভাগ খুলুন; সব বিভাগ পূরণ করা বাধ্যতামূলক নয়।'),
  employment:g('Employment income','চাকরি হতে আয়','Enter employer and salary facts from records, not assumed exemptions or net tax values.','নথি থেকে নিয়োগকর্তা ও বেতনের তথ্য দিন; ছাড় বা করযোগ্য অঙ্ক অনুমান করবেন না।'),
  'financial-assets':g('Income from financial assets','আর্থিক সম্পদ হতে আয়','Review income from applicable bank deposits, securities or other financial assets.','প্রযোজ্য আমানত, সিকিউরিটিজ ও অন্যান্য আর্থিক সম্পদের আয় পর্যালোচনা করুন।'),
  rent:g('Rental income','ভাড়া হতে আয়','Capture property, rent and evidenced expenses; any statutory deductions require approved rules.','সম্পত্তি, ভাড়া ও প্রমাণিত ব্যয় দিন; আইনগত কর্তনের জন্য অনুমোদিত নিয়ম প্রয়োজন।'),
  agriculture:g('Agricultural income','কৃষি আয়','Capture agricultural receipts and documented costs relevant to your return.','আপনার রিটার্নের প্রাসঙ্গিক কৃষি আয় ও নথিভুক্ত ব্যয় দিন।'),
  business:g('Business or profession','ব্যবসা বা পেশা','Record business identity, receipts, expenses and documented results.','ব্যবসার পরিচয়, আয়, ব্যয় ও নথিভুক্ত ফলাফল দিন।'),
  'capital-gain':g('Capital gains','মূলধনি মুনাফা','Record asset disposals, acquisition facts and dates with supporting documents.','সম্পদ হস্তান্তর, ক্রয়ের তথ্য ও তারিখ প্রমাণসহ দিন।'),
  'income-from-other-sources':g('Other income','অন্যান্য উৎসের আয়','Review other receipts that do not fit the earlier income sections.','আগের আয় বিভাগে না থাকা অন্যান্য আয় পর্যালোচনা করুন।'),
  'firm-etc':g('Income from firm','ফার্ম হতে আয়','Enter your documented share and any relevant partnership details.','ফার্মে আপনার নথিভুক্ত অংশ ও প্রাসঙ্গিক অংশীদারি তথ্য দিন।'),
  aop:g('Association of persons','ব্যক্তিসংঘ','Record an evidenced share of income from an association of persons.','ব্যক্তিসংঘ হতে আয়ের প্রমাণিত অংশ দিন।'),
  'foreign-income':g('Foreign income','বৈদেশিক আয়','Enter overseas income and applicable supporting dates; do not assume exchange rates.','বিদেশের আয় ও প্রাসঙ্গিক তারিখ দিন; বিনিময় হার অনুমান করবেন না।'),
  'spouse-income':g('Spouse or minor income','স্বামী/স্ত্রী বা অপ্রাপ্তবয়স্কের আয়','Record relevant family-income facts only when applicable; inclusion needs legal review.','প্রযোজ্য ক্ষেত্রে পরিবারের আয়ের তথ্য দিন; অন্তর্ভুক্তি আইনগত যাচাইসাপেক্ষ।'),
  'tax-exempted-income':g('Tax-exempt income','করমুক্ত আয়','Enter a claimed exemption with supporting evidence. Entry does not prove eligibility.','প্রমাণসহ দাবিকৃত করমুক্ত আয় দিন। তথ্য দেওয়া যোগ্যতার প্রমাণ নয়।'),
  'voluntary-disclosure-income':g('Voluntary disclosure','স্বেচ্ছায় আয় প্রকাশ','Review the disclosure facts and dates carefully before proceeding.','এগোনোর আগে প্রকাশের তথ্য ও তারিখ সতর্কভাবে যাচাই করুন।'),
  rebate:g('Investment and rebate','বিনিয়োগ ও রেয়াত','Record eligible-looking investment facts; the system cannot certify a rebate yet.','বিনিয়োগের তথ্য দিন; সিস্টেম এখনো আইনগত রেয়াত প্রত্যয়ন করতে পারে না।'),
  expenditure:g('Lifestyle expenditure','জীবনযাত্রার ব্যয়','Review documented IT-10BB expenditure categories and totals.','আইটি-১০বিবি ব্যয়ের বিভাগ ও মোট নথি অনুযায়ী যাচাই করুন।'),
  'assets-liabilities':g('Assets and liabilities','সম্পদ ও দায়','Enter opening and closing assets, debts and sources of funds; reconcile supporting records.','সম্পদ, দায় ও তহবিলের উৎস নথি অনুযায়ী দিন এবং সমন্বয় দেখুন।'),
  'tax-payment':g('Tax and payment entries','কর ও পরিশোধের তথ্য','Enter withholding and payment details as facts. A claim does not establish a government credit.','উৎসে কর ও পরিশোধের তথ্য দিন; দাবিকৃত অঙ্ক সরকারি ক্রেডিটের প্রমাণ নয়।'),
  'return-view':g('Return preview','রিটার্নের পূর্বরূপ','Inspect the drafted return; this is not an officially filed or calculated return.','খসড়া রিটার্ন দেখুন; এটি সরকারি দাখিল বা প্রত্যয়িত হিসাব নয়।'),
  submission:g('Submission review','দাখিল পর্যালোচনা','Check the prepared return. Filing remains unavailable until authorized services are certified.','প্রস্তুত রিটার্ন যাচাই করুন। অনুমোদিত সেবা প্রত্যয়িত না হওয়া পর্যন্ত দাখিল বন্ধ।'),
  'guided-submission':g('Guided submission','নির্দেশিত দাখিল','Review details, tax/payment evidence, then declaration. Real filing is not enabled.','বিবরণ, কর ও পরিশোধের প্রমাণ, তারপর ঘোষণা যাচাই করুন। প্রকৃত দাখিল এখনো চালু নয়।'),
  'tin-certificate':g('TIN certificate','টিআইএন সনদ','Review this certificate screen; confirm any official record through the authorized service.','সনদ পৃষ্ঠা দেখুন; অনুমোদিত সেবায় সরকারি রেকর্ড নিশ্চিত করুন।'),
  acknowledgement:g('Acknowledgement','প্রাপ্তিস্বীকার','An actual acknowledgement requires a verified official submission.','প্রকৃত প্রাপ্তিস্বীকারের জন্য যাচাইকৃত সরকারি দাখিল প্রয়োজন।'),
  'challan-history':g('Challan history','চালান ইতিহাস','Review entered challan details; records must be matched to official payment evidence.','চালানের তথ্য যাচাই করুন; সরকারি পরিশোধের প্রমাণের সঙ্গে মিলাতে হবে।'),
  'certificate-request':g('Certificate request','সনদ আবেদন','Review requested certificate details before a future authorized submission.','ভবিষ্যৎ অনুমোদিত জমার আগে সনদ আবেদনের তথ্য দেখুন।'),
  'certificate-status':g('Certificate status','সনদের অবস্থা','Status requires an independently verified official source.','সনদের অবস্থা জানতে স্বতন্ত্র যাচাইকৃত সরকারি উৎস প্রয়োজন।'),
  'return-history':g('Return history','রিটার্নের ইতিহাস','Review only confirmed filed return records; drafts are not submissions.','শুধু নিশ্চিত দাখিলকৃত রিটার্ন দেখুন; খসড়া দাখিল নয়।'),
  'return-records':g('Return records','রিটার্নের রেকর্ড','Review only confirmed filed return records; drafts are not submissions.','শুধু নিশ্চিত দাখিলকৃত রিটার্ন দেখুন; খসড়া দাখিল নয়।'),
  'revised-return':g('Revised return','সংশোধিত রিটার্ন','Eligibility, dates and previous filing must be verified before a revised return.','সংশোধিত রিটার্নের আগে যোগ্যতা, তারিখ ও আগের দাখিল যাচাই প্রয়োজন।'),
  'audited-accounts':g('Audited accounts','নিরীক্ষিত হিসাব','Record and review comparative audited statements and supporting notes when applicable.','প্রযোজ্য ক্ষেত্রে নিরীক্ষিত তুলনামূলক বিবরণী ও নোট পর্যালোচনা করুন।'),
  profile:g('Personal details','ব্যক্তিগত তথ্য','Review your taxpayer profile and contact details.','করদাতার প্রোফাইল ও যোগাযোগের তথ্য যাচাই করুন।'),
  'change-password':g('Account security','অ্যাকাউন্ট নিরাপত্তা','Password changes require a verified authenticated account service.','পাসওয়ার্ড পরিবর্তনের জন্য যাচাইকৃত অনুমোদিত অ্যাকাউন্ট সেবা প্রয়োজন।')
};
const routeSteps:Record<string,[HelpCopy,HelpCopy]>={
  home:[
    c('Start with My Tax Return, then review the assessment details and relevant income categories.','আমার আয়কর রিটার্ন খুলে কর নির্ধারণ ও প্রযোজ্য আয়ের তথ্য যাচাই করুন।'),
    c('Review your draft and download a copy before leaving the browser.','ব্রাউজার ছাড়ার আগে খসড়া যাচাই করে কপি সংরক্ষণ করুন।')
  ],
  'return-workspace':[
    c('Open Assessment, then select only income sections that apply to you.','কর নির্ধারণ খুলুন, তারপর কেবল প্রযোজ্য আয়ের বিভাগগুলো বাছুন।'),
    c('Review investment, expenditure, assets and tax-payment entries before opening the draft preview.','খসড়া দেখার আগে বিনিয়োগ, ব্যয়, সম্পদ ও কর পরিশোধের তথ্য যাচাই করুন।')
  ],
  'tax-records':[
    c('Choose Certificates, Return documents or Payment documents based on the record you need.','প্রয়োজনীয় নথি অনুযায়ী সনদ, রিটার্নের নথি বা পরিশোধের নথি খুলুন।'),
    c('Verify any acknowledgement, challan or certificate with the official issuing service.','প্রাপ্তিস্বীকার, চালান বা সনদ সরকারি সেবার সঙ্গে যাচাই করুন।')
  ],
  assessment:[
    c('Confirm the assessment year and income period shown before changing return selections.','রিটার্নের ধরন বদলানোর আগে করবর্ষ ও আয়কাল যাচাই করুন।'),
    c('Use your own identity and residency records; do not guess any uncertain selection.','নিজের পরিচয় ও আবাসিক তথ্যের নথি ব্যবহার করুন; অনিশ্চিত কিছু অনুমান করবেন না।')
  ],
  income:[
    c('Choose relevant income types, such as Employment, Rent or Business, one at a time.','চাকরি, ভাড়া বা ব্যবসার মতো প্রযোজ্য আয়ের ধরন একে একে খুলুন।'),
    c('Check totals against your statements before moving to investments and expenses.','বিনিয়োগ ও ব্যয়ে যাওয়ার আগে বিবরণীর সঙ্গে মোট অঙ্ক মিলিয়ে নিন।')
  ],
  employment:[
    c('Use employer statements and salary records to enter pay components.','নিয়োগকর্তার বিবরণী ও বেতনের নথি থেকে তথ্য লিখুন।'),
    c('Review employer details and all entered amounts; tax treatment requires verified rules.','নিয়োগকর্তা ও অঙ্ক যাচাই করুন; কর ব্যবস্থাপনায় অনুমোদিত নিয়ম প্রয়োজন।')
  ],
  business:[
    c('Use business records for receipts and costs, choosing the documented business category.','ব্যবসার আয়-ব্যয়ের নথি এবং প্রমাণিত ব্যবসার শ্রেণি ব্যবহার করুন।'),
    c('Review the entered results and supporting statements before returning to the summary.','সারসংক্ষেপে ফেরার আগে দেওয়া অঙ্ক ও বিবরণী যাচাই করুন।')
  ],
  rebate:[
    c('Record each investment only where you have its supporting document.','সমর্থনকারী নথি থাকলে তবেই বিনিয়োগের তথ্য দিন।'),
    c('Review entries carefully; entering an investment does not confirm any rebate entitlement.','তথ্য যাচাই করুন; বিনিয়োগ লিখলেই রেয়াতের যোগ্যতা নিশ্চিত হয় না।')
  ],
  expenditure:[
    c('Group household and personal expenditure by the form category and available records.','ফরমের বিভাগ ও নথি অনুযায়ী ব্যক্তিগত ও পারিবারিক ব্যয় দিন।'),
    c('Recheck annual totals and avoid entering the same expense twice.','বার্ষিক মোট অঙ্ক মিলিয়ে একই ব্যয় দুবার দেওয়া এড়িয়ে চলুন।')
  ],
  'assets-liabilities':[
    c('Gather asset ownership, debt and source-of-funds evidence before entering values.','অঙ্ক দেওয়ার আগে সম্পদ, ঋণ ও তহবিলের উৎসের প্রমাণ সংগ্রহ করুন।'),
    c('Reconcile opening and closing balances where required; do not guess unknown amounts.','প্রয়োজনমতো শুরু ও শেষের স্থিতি মিলিয়ে নিন; অজানা অঙ্ক অনুমান করবেন না।')
  ],
  'tax-payment':[
    c('Enter withholding and advance-payment facts using certificates, challans and dates.','সনদ, চালান ও তারিখ থেকে উৎসে কর ও অগ্রিম পরিশোধের তথ্য দিন।'),
    c('Match year, ownership and any duplicate entry before assuming a payment credit.','কর ক্রেডিট ধরার আগে বছর, মালিকানা ও একই পরিশোধ দুবার দেওয়া হয়েছে কি না মিলিয়ে নিন।')
  ],
  'return-view':[
    c('Review all entered sections and use Edit to correct anything inaccurate.','সব বিভাগ দেখুন এবং ভুল তথ্য সংশোধন করুন।'),
    c('Download the draft if you need to keep a copy; this preview is not an official filing.','কপি রাখতে খসড়া ডাউনলোড করুন; এটি সরকারি দাখিল নয়।')
  ],
  'guided-submission':[
    c('Check taxpayer details and income sections first, then review the payment evidence.','প্রথমে করদাতার তথ্য ও আয়ের বিভাগ, তারপর পরিশোধের প্রমাণ যাচাই করুন।'),
    c('Read the declaration carefully. Actual filing remains disabled until the authorized service is verified.','ঘোষণা সতর্কভাবে পড়ুন। অনুমোদিত সেবা যাচাই না হওয়া পর্যন্ত দাখিল বন্ধ।')
  ],
  submission:[
    c('Check each part of the draft and return to its editor when corrections are needed.','খসড়ার সব অংশ দেখুন; সংশোধন লাগলে সংশ্লিষ্ট ফরমে ফিরুন।'),
    c('Do not treat a draft or review screen as a filed return or acknowledgement.','খসড়া বা পর্যালোচনাকে দাখিলকৃত রিটার্ন বা প্রাপ্তিস্বীকার ভাববেন না।')
  ],
  'revised-return':[
    c('Check the earlier return and the reason for revision against your records.','আগের রিটার্ন ও সংশোধনের কারণ নথির সঙ্গে যাচাই করুন।'),
    c('Eligibility and deadlines must be verified before any actual revised submission.','প্রকৃত সংশোধিত দাখিলের আগে যোগ্যতা ও সময়সীমা যাচাই প্রয়োজন।')
  ],
  'audited-accounts':[
    c('Review audited financial statements and notes for the relevant period, if applicable.','প্রযোজ্য হলে সংশ্লিষ্ট সময়ের নিরীক্ষিত বিবরণী ও নোট দেখুন।'),
    c('Keep original report references and verify proposed figures before using any imported data.','মূল প্রতিবেদনের সূত্র রাখুন এবং আমদানি করা প্রস্তাবিত অঙ্ক যাচাই করুন।')
  ]
};
export const getGuide=(pathname:string):Guide=>{
  const tail=pathname.split('/').filter(Boolean);
  const key=tail.includes('guided-submission')?'guided-submission':tail[tail.length-1]??'home';
  const base=guides[key]??guides['home'];
  return routeSteps[key]?{...base,steps:routeSteps[key]}:base;
};
export const translate=(copy:HelpCopy,lang:HelpLanguage)=>copy[lang];
export const guideKeys=Object.keys(guides);
export const guidedReply=(question:string,guide:Guide,language:HelpLanguage,field:string):string=>{
  const q=question.trim().toLowerCase();
  if (!q) return '';
  if (/tax rate|slab|rebate|exempt|minimum tax|credit|refund|eligible|অব্যাহতি|রেয়াত|করহার|কর ছাড়/.test(q))
    return language==='bn'
      ? 'এই দাবি বা অঙ্ক আইনগতভাবে প্রত্যয়িত নয়। প্রযোজ্য করবর্ষ, করদাতার তথ্য ও সরকারি উৎস যাচাই ছাড়া কোনো হার, ছাড় বা ক্রেডিট নিশ্চিত করা যাবে না।'
      : 'That rate, exemption or credit is not certified here. It requires controlling law, the applicable year and taxpayer facts. I cannot confirm an entitlement.';
  if (/submit|file|payment|pay|receipt|দাখিল|পরিশোধ|প্রাপ্তিস্বীকার/.test(q))
    return language==='bn'
      ? 'এই সংস্করণে সরকারি দাখিল, পরিশোধ বা প্রাপ্তিস্বীকার চালু নয়। খসড়া তথ্য পর্যালোচনা ও সংরক্ষণ করতে পারেন।'
      : 'Official filing, payment and acknowledgement are not enabled here. You can review and export the draft.';
  if (/save|draft|resume|ড্রাফট|খসড়া|সংরক্ষণ/.test(q))
    return language==='bn'
      ? 'এই সংস্করণে খসড়া বর্তমান ব্রাউজার সেশনে থাকে। পরে চালু করার জন্য খসড়া JSON ডাউনলোড করুন; এটি সরকারি দাখিল নয়।'
      : 'Draft entries remain in this browser session. Export the draft JSON to keep a copy; this is not an official submission.';
  if(field && /field|input|enter|type|column|ঘর|তথ্য|ক্ষেত্র/.test(q))
    return language==='bn'
      ? `“${field}” ঘরে নথি অনুযায়ী তথ্য দিন। প্রযোজ্যতা অনিশ্চিত হলে অনুমান করবেন না।`
      : `For “${field}”, use your supporting records; do not guess an unknown value or eligibility.`;
  return translate(guide.purpose,language)+' '+translate(guide.steps[0],language);
};
