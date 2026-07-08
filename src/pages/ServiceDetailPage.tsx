import { useState, useEffect } from 'react'
import { useParams, Link } from '@tanstack/react-router'
import * as Icons from 'lucide-react'
import { ChevronRight, ChevronLeft, Loader2, ArrowRight, Check, Calendar, HelpCircle, Shield, Clock, AlertTriangle } from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useLang } from '../i18n/LanguageContext'
import { setPageMeta, injectJsonLd, generateFaqSchema, getCanonical, injectBreadcrumb } from '../lib/seo'
import { useServices, ServiceRecord } from '../hooks/useServices'
import { CATEGORY_MAP } from './ServicesPage'
import { getServiceTimeline } from './ServiceCategoryPage'
import PublicOrderModal from '../components/PublicOrderModal'

interface ServiceDetailContent {
  overview_en: string
  overview_ar: string
  included_en: string[]
  included_ar: string[]
  process_en: string[]
  process_ar: string[]
  requirements_en: string[]
  requirements_ar: string[]
  faq_en: { q: string; a: string }[]
  faq_ar: { q: string; a: string }[]
}

const SERVICE_DETAILS_LOOKUP: Record<string, ServiceDetailContent> = {
  'usllc149onetime': {
    overview_en: 'Form a US Limited Liability Company (LLC) quickly and securely. Suitable for non-US residents wanting to launch a global business, access US banking, and process USD payments.',
    overview_ar: 'قم بتأسيس شركة ذات مسؤولية محدودة (LLC) في الولايات المتحدة بشكل سريع وآمن. خيار مثالي لغير المقيمين لإطلاق أعمالهم العالمية، وتفعيل الحسابات البنكية الأمريكية بوابات الدفع بالدولار.',
    included_en: [
      'Articles of Organization Filing with the State',
      '1 Year of Registered Agent Service',
      '1 Year of Premium Business Address',
      'Operating Agreement Template',
      'Digital Delivery of State Documents',
      'Lifetime Support & Formation Certificate'
    ],
    included_ar: [
      'إيداع وثيقة تأسيس الشركة (Articles of Organization) لدى الولاية',
      'خدمة الوكيل المسجل لمدة عام كامل (Registered Agent)',
      'عنوان عمل تجاري مميز في أمريكا لمدة عام',
      'نموذج اتفاقية التشغيل القانونية (Operating Agreement)',
      'تسليم المستندات الرسمية رقمياً فور صدورها',
      'دعم مستمر مدى الحياة مع شهادة التأسيس'
    ],
    process_en: [
      'Submit Details: Choose your state (Delaware/Wyoming/Florida) and provide owner passport copies.',
      'Name Check: We verify your proposed company name availability in the state registry.',
      'State Filing: We file your Articles of Organization and establish the legal company structure.',
      'Document Handover: You receive certified copy of formation documents.'
    ],
    process_ar: [
      'تقديم البيانات: اختر الولاية (وايومنغ، ديلاوير، فلوريدا) وقدم صورة جواز السفر لمالك الشركة.',
      'فحص الاسم: نتحقق من توفر الاسم المقترح لشركتك في سجلات الولاية الرسمية.',
      'إيداع الولاية: نقوم بإرسال طلب التأسيس ودفع رسوم الولاية لبدء نشاط الشركة رسمياً.',
      'تسليم الوثائق: تتلقى الوثائق الرسمية المعتمدة رقمياً فور إصدارها من الولاية.'
    ],
    requirements_en: [
      'Proposed company names (top 3 choices)',
      'Scanned copy of owner(s) valid passport',
      'Physical home address of owner(s)'
    ],
    requirements_ar: [
      'الأسماء المقترحة للشركة (أفضل 3 خيارات بالترتيب)',
      'صورة واضحة من جواز السفر الساري للمالك / الملاك',
      'العنوان السكني الحالي للمالك / الملاك'
    ],
    faq_en: [
      { q: 'Do I need to be a US citizen or travel to the US?', a: 'No, the entire process is 100% remote. You do not need to be a US citizen or travel to the US at any point.' },
      { q: 'Which state is best for non-residents?', a: 'Wyoming is recommended for e-commerce and general services due to low annual fees. Delaware is ideal for startups seeking venture capital.' }
    ],
    faq_ar: [
      { q: 'هل أحتاج لأن أكون مواطناً أمريكياً أو السفر إلى أمريكا؟', a: 'لا، العملية تتم بالكامل عن بُعد بنسبة 100%. لا تحتاج للتواجد في الولايات المتحدة أو امتلاك إقامة فيها لتأسيس شركة.' },
      { q: 'ما هي الولاية الأفضل لأصحاب المشاريع الرقمية وغير المقيمين؟', a: 'نوصي بولاية وايومنغ (Wyoming) للتجارة الإلكترونية والخدمات الرقمية لقلة رسومها السنوية. بينما ديلاوير (Delaware) تعد الأفضل إذا كنت تخطط لجذب استثمارات رأس مال مخاطر.' }
    ]
  },
  'ukltd149onetime': {
    overview_en: 'Incorporate a UK Private Limited Company (LTD) directly with Companies House. Get registered in under 24 hours with a physical business address and official filing.',
    overview_ar: 'قم بإنشاء شركة مساهمة خاصة ذات مسؤولية محدودة (LTD) في المملكة المتحدة مع الهيئة الرسمية لتسجيل الشركات (Companies House) في أقل من 24 ساعة.',
    included_en: [
      'UK Companies House Incorporation Fees',
      '1 Year UK Registered Office Address',
      'Certificate of Incorporation',
      'Share Certificates & Memorandum of Association',
      'Digital Delivery of Corporate Pack'
    ],
    included_ar: [
      'رسوم التأسيس الرسمية لدى مسجل الشركات البريطاني',
      'عنوان مكتب مسجل في المملكة المتحدة لمدة عام كامل',
      'شهادة التأسيس الرسمية (Certificate of Incorporation)',
      'شهادات الأسهم وعقد التأسيس (Memorandum & Articles)',
      'تسليم رقمي فوري لملف الشركة الكامل'
    ],
    process_en: [
      'Submit Details: Provide UK company name, owner passport details, and share split.',
      'Registry Submission: We file the incorporation forms directly with Companies House.',
      'Active Registration: Company registry registers and approves company within 24 hours.',
      'Corporate Pack: We send all certificates and register books.'
    ],
    process_ar: [
      'تقديم البيانات: زودنا بالاسم المقترح وتفاصيل جواز السفر للمالك وتوزيع الحصص والأسهم.',
      'تقديم الملف: نقوم بإرسال وثائق التأسيس ومقترح هيكل المساهمين للوزارة المختصة.',
      'التسجيل الفوري: يتم مراجعة الملف وتنشيط الشركة في غضون 24 ساعة كحد أقصى.',
      'حقيبة الشركة: نرسل لك شهادات التأسيس وحصص الأسهم وعقد التأسيس رقمياً.'
    ],
    requirements_en: [
      'UK Company Name',
      'Valid passport copy of Director & Shareholder',
      'Residential address details'
    ],
    requirements_ar: [
      'اسم الشركة في المملكة المتحدة (ينتهي بـ LTD)',
      'نسخة جواز السفر الساري للمدير والمساهم الرئيسي',
      'عنوان السكن للمساهمين'
    ],
    faq_en: [
      { q: 'How fast is UK formation?', a: 'UK LTD formation is typically processed and approved in 12 to 24 hours.' },
      { q: 'Do I get a VAT number automatically?', a: 'No, VAT registration is optional and is a separate application that you apply for when your turnover exceeds £90,000.' }
    ],
    faq_ar: [
      { q: 'ما هي سرعة تأسيس الشركة البريطانية؟', a: 'يتم عادةً معالجة وتأسيس الشركة في المملكة المتحدة في غضون 12 إلى 24 ساعة فقط.' },
      { q: 'هل أحصل على رقم ضريبي VAT تلقائياً؟', a: 'لا، التسجيل في ضريبة القيمة المضافة (VAT) اختياري ويقدم له بشكل منفصل عندما تتخطى مبيعاتك السنوية 90,000 جنيه إسترليني.' }
    ]
  }
}

// Fallback content generator if service is not in lookup map
const getServiceDetailFallback = (svc: ServiceRecord, isAr: boolean): ServiceDetailContent => {
  const title = isAr ? svc.title_ar : svc.title_en
  const desc = isAr ? svc.description_ar : svc.description_en
  const detail = isAr ? (svc.detail_ar || svc.description_ar) : (svc.detail_en || svc.description_en)

  return {
    overview_en: `Get professional, reliable ${title}. ${desc} We handle the entire application, verification, and setup process, ensuring a seamless experience.`,
    overview_ar: `احصل على خدمة ${title} الاحترافية والموثوقة. ${desc} نقوم بمعالجة الطلب بالكامل وتنسيق الإجراءات لضمان تجربة سلسة وخالية من المتاعب.`,
    included_en: [
      `Professional execution of ${title}`,
      'Full verification of files and documents',
      'Standard filing/setup and agency fees',
      'Digital document delivery',
      'Expert post-delivery support'
    ],
    included_ar: [
      `التنفيذ الاحترافي لخدمة ${title}`,
      'المراجعة الدقيقة لجميع الملفات والوثائق المقدمة',
      'دفع الرسوم الحكومية أو الإدارية الخاصة بالخدمة',
      'تسليم المستندات والتقارير رقمياً',
      'دعم وخبرة فنية متوفرة بعد التسليم'
    ],
    process_en: [
      'Order: Select the service and submit contact information.',
      'Onboarding: We request specific documents and details via email.',
      'Verification & Filing: Our legal and digital specialists review and file.',
      'Delivery: We deliver final confirmation and credentials.'
    ],
    process_ar: [
      'طلب الخدمة: اختر الخدمة وقدم معلومات الاتصال والبيانات الأولية.',
      'تجهيز المستندات: نرسل لك بريداً إلكترونياً بالتفاصيل والوثائق المطلوبة.',
      'التدقيق والتقديم: يقوم خبراؤنا بمراجعة المستندات وتقديمها للجهة المعنية.',
      'التسليم والتشغيل: نرسل لك إشعاراً بالتنفيذ وصوراً من التراخيص أو الاعتمادات.'
    ],
    requirements_en: [
      'Primary identity document (passport or national ID)',
      'Basic company information (if applicable)',
      'Signed authorization form if required'
    ],
    requirements_ar: [
      'وثيقة هوية أساسية (جواز سفر أو بطاقة شخصية)',
      'معلومات الشركة الأساسية (إذا كانت الخدمة لشركة قائمة)',
      'توقيع نموذج تفويض عند الحاجة'
    ],
    faq_en: [
      { q: `What does ${title} include?`, a: `${detail}` },
      { q: 'How do I start?', a: 'Simply click the Order Now button, complete the contact details, and our compliance officer will contact you within hours.' }
    ],
    faq_ar: [
      { q: `ماذا تشمل خدمة ${title}؟`, a: `${detail}` },
      { q: 'كيف أبدأ بالطلب؟', a: 'ببساطة اضغط على زر اطلب الآن، واملأ بيانات الاتصال الخاصة بك، وسيقوم مسؤول الدعم بالتواصل معك في غضون ساعات للتنفيذ.' }
    ]
  }
}

export default function ServiceDetailPage() {
  const { categorySlug, serviceSlug } = useParams({ from: '/services/$categorySlug/$serviceSlug' })
  const { lang } = useLang()
  const isAr = lang === 'ar'
  const { services, loading } = useServices()
  const [selectedService, setSelectedService] = useState<ServiceRecord | null>(null)

  // Scroll to top on load/change
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [serviceSlug])

  const category = CATEGORY_MAP[categorySlug]
  const service = services.find(s => s.id === serviceSlug && s.active)

  useEffect(() => {
    if (!service || !category) return
    const svcTitle = isAr ? service.title_ar : service.title_en
    const svcDesc = isAr ? service.description_ar : service.description_en
    const catLabel = isAr ? category.label_ar : category.label_en

    setPageMeta({
      title: `${svcTitle} | ${catLabel} | Instant Grow`,
      description: svcDesc,
      canonical: getCanonical(`/services/${categorySlug}/${serviceSlug}`),
    })

    injectBreadcrumb([
      { name: isAr ? 'الرئيسية' : 'Home', url: getCanonical('/') },
      { name: isAr ? 'الخدمات' : 'Services', url: getCanonical('/services') },
      { name: catLabel, url: getCanonical(`/services/${categorySlug}`) },
      { name: svcTitle, url: getCanonical(`/services/${categorySlug}/${serviceSlug}`) },
    ])

    // Inject FAQ Schema and Service Schema under a single JSON-LD graph
    const details = SERVICE_DETAILS_LOOKUP[service.id] || getServiceDetailFallback(service, isAr)
    const faqs = isAr ? details.faq_ar : details.faq_en
    
    const serviceSchema = {
      '@type': 'Service',
      'name': svcTitle,
      'description': svcDesc,
      'provider': {
        '@type': 'Organization',
        'name': 'Instant Grow',
        'url': window.location.origin
      },
      'offers': {
        '@type': 'Offer',
        'priceCurrency': 'USD',
        'price': service.price > 0 ? service.price.toString() : '0',
        'availability': 'https://schema.org/InStock'
      }
    }

    const faqSchema = faqs.length > 0 ? generateFaqSchema(faqs.map(f => ({ question: f.q, answer: f.a }))) : null

    injectJsonLd({
      '@context': 'https://schema.org',
      '@graph': [
        serviceSchema,
        faqSchema
      ].filter(Boolean)
    })
  }, [service, category, isAr, categorySlug, serviceSlug])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="animate-spin text-[#2563EB]" size={32} />
          <span className="text-slate-500 text-sm">{isAr ? 'جاري تحميل الخدمة...' : 'Loading service...'}</span>
        </div>
        <Footer />
      </div>
    )
  }

  if (!service || !category) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center py-20">
          <h2 className="text-xl font-bold text-slate-800 mb-2">Service Not Found</h2>
          <Link to="/services" className="text-[#2563EB] hover:underline font-bold">Back to Services</Link>
        </div>
        <Footer />
      </div>
    )
  }

  const details = SERVICE_DETAILS_LOOKUP[service.id] || getServiceDetailFallback(service, isAr)
  const ServiceIcon = (Icons as any)[service.icon] || Icons.HelpCircle
  const title = isAr ? service.title_ar : service.title_en
  const desc = isAr ? service.description_ar : service.description_en
  const period = isAr ? service.period_ar : service.period_en
  const timeline = getServiceTimeline(service.id, isAr)
  const catLabel = isAr ? category.label_ar : category.label_en

  // Get related services (services in same category except this one)
  const relatedServices = services
    .filter(s => s.category === category.dbName && s.id !== service.id && s.active)
    .slice(0, 3)

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-[1280px] w-full mx-auto px-5 sm:px-8 lg:px-10 pt-32 pb-24">
        
        {/* Breadcrumbs */}
        <div className={`flex items-center gap-1.5 text-xs font-semibold text-slate-400 mb-8 ${isAr ? 'flex-row-reverse' : ''}`}>
          <Link to="/" className="hover:text-[#2563EB] transition-colors">{isAr ? 'الرئيسية' : 'Home'}</Link>
          {isAr ? <ChevronLeft size={12} /> : <ChevronRight size={12} />}
          <Link to="/services" className="hover:text-[#2563EB] transition-colors">{isAr ? 'الخدمات' : 'Services'}</Link>
          {isAr ? <ChevronLeft size={12} /> : <ChevronRight size={12} />}
          <Link to="/services/$categorySlug" params={{ categorySlug }} className="hover:text-[#2563EB] transition-colors">{catLabel}</Link>
          {isAr ? <ChevronLeft size={12} /> : <ChevronRight size={12} />}
          <span className="text-[#2563EB] truncate max-w-[200px]">{title}</span>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* Main Info Column */}
          <div className="lg:col-span-2 space-y-10">
            
            {/* Header info */}
            <div className="space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/10 to-indigo-500/5 text-[#2563EB] flex items-center justify-center">
                <ServiceIcon size={32} />
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight" style={{ fontFamily: 'Sora, Inter, sans-serif' }}>
                {title}
              </h1>
              <p className="text-slate-500 text-base sm:text-lg leading-relaxed font-medium">
                {desc}
              </p>
            </div>

            {/* Overview Section */}
            <div className="bg-white border border-slate-200/50 rounded-3xl p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.01)] space-y-4">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2" style={{ fontFamily: 'Sora, Inter, sans-serif' }}>
                <Shield size={20} className="text-[#2563EB]" />
                {isAr ? 'نظرة عامة على الخدمة' : 'Service Overview'}
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed font-medium">
                {isAr ? details.overview_ar : details.overview_en}
              </p>
            </div>

            {/* What's Included Section */}
            <div className="bg-white border border-slate-200/50 rounded-3xl p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.01)] space-y-5">
              <h3 className="text-lg font-bold text-slate-900" style={{ fontFamily: 'Sora, Inter, sans-serif' }}>
                {isAr ? 'ماذا تشمل الخدمة؟' : "What's Included"}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(isAr ? details.included_ar : details.included_en).map((item, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                      <Check size={12} className="stroke-[3]" />
                    </div>
                    <span className="text-slate-600 text-xs sm:text-sm font-semibold">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Process / Steps Section */}
            <div className="bg-white border border-slate-200/50 rounded-3xl p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.01)] space-y-6">
              <h3 className="text-lg font-bold text-slate-900" style={{ fontFamily: 'Sora, Inter, sans-serif' }}>
                {isAr ? 'خطوات تنفيذ الخدمة' : 'How the Process Works'}
              </h3>
              <div className="relative border-l border-slate-200/60 pl-6 ml-3 space-y-8">
                {(isAr ? details.process_ar : details.process_en).map((step, i) => (
                  <div key={i} className="relative">
                    {/* Circle marker */}
                    <div className="absolute -left-[35px] top-0 w-[18px] h-[18px] rounded-full bg-white border-2 border-blue-500 flex items-center justify-center shadow-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    </div>
                    
                    <span className="inline-block text-[#2563EB] text-[10px] font-extrabold uppercase tracking-wider mb-1">
                      {isAr ? `الخطوة ${i + 1}` : `STEP 0${i + 1}`}
                    </span>
                    <p className="text-slate-700 text-xs sm:text-sm font-semibold leading-relaxed">
                      {step}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Requirements Section */}
            <div className="bg-white border border-slate-200/50 rounded-3xl p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.01)] space-y-4">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2" style={{ fontFamily: 'Sora, Inter, sans-serif' }}>
                <AlertTriangle size={18} className="text-[#2563EB]" />
                {isAr ? 'المتطلبات والمستندات المطلوبة' : 'Client Requirements'}
              </h3>
              <ul className="space-y-2.5 list-disc pl-5 text-slate-600 text-xs sm:text-sm font-semibold">
                {(isAr ? details.requirements_ar : details.requirements_en).map((req, i) => (
                  <li key={i} className="leading-relaxed">
                    {req}
                  </li>
                ))}
              </ul>
            </div>

            {/* FAQ Section */}
            <div className="bg-white border border-slate-200/50 rounded-3xl p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.01)] space-y-5">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2" style={{ fontFamily: 'Sora, Inter, sans-serif' }}>
                <HelpCircle size={20} className="text-[#2563EB]" />
                {isAr ? 'الأسئلة الشائعة' : 'Frequently Asked Questions'}
              </h3>
              <div className="space-y-4">
                {(isAr ? details.faq_ar : details.faq_en).map((faq, i) => (
                  <div key={i} className="border-b border-slate-100 last:border-0 pb-4 last:pb-0 space-y-1.5">
                    <h4 className="text-slate-800 text-sm sm:text-base font-bold">
                      {faq.q}
                    </h4>
                    <p className="text-slate-500 text-xs sm:text-sm leading-relaxed font-semibold">
                      {faq.a}
                    </p>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Sticky Checkout Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 space-y-6">
              
              {/* Pricing Card */}
              <div className="bg-white border border-slate-200/50 rounded-3xl p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.015)] space-y-6">
                <div>
                  <span className="text-xs font-extrabold text-slate-400 uppercase tracking-widest block mb-2">
                    {isAr ? 'تكلفة الخدمة' : 'Service Price'}
                  </span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-4xl font-black text-blue-600">
                      {service.price > 0 ? `$${service.price}` : (isAr ? 'مشمول' : 'Included')}
                    </span>
                    {service.price > 0 && (
                      <span className="text-sm font-semibold text-slate-400">/ {period}</span>
                    )}
                  </div>
                </div>

                <div className="space-y-3.5 border-t border-slate-100 pt-5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Clock size={14} className="text-slate-400" />
                      {isAr ? 'المدة المتوقعة' : 'Timeline'}
                    </span>
                    <span className="text-slate-800 font-bold">{timeline}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Calendar size={14} className="text-slate-400" />
                      {isAr ? 'تحديثات الحالة' : 'Status Updates'}
                    </span>
                    <span className="text-slate-800 font-bold">{isAr ? 'تنبيهات فورية' : 'Real-time Alerts'}</span>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <button
                    onClick={() => setSelectedService(service)}
                    className="w-full py-4 rounded-xl bg-[#2563EB] hover:bg-[#1d4ed8] text-white text-sm font-extrabold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/15 transition-all"
                  >
                    <span>{isAr ? 'اطلب الخدمة الآن' : 'Order Now'}</span>
                    <ArrowRight size={15} className={isAr ? 'rotate-180' : ''} />
                  </button>
                  
                  <a
                    href="https://cal.com/instant-grow-llc"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-bold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Calendar size={15} />
                    <span>{isAr ? 'احجز استشارة مجانية' : 'Book Consultation'}</span>
                  </a>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Related Services */}
        {relatedServices.length > 0 && (
          <section className="mt-20 border-t border-slate-200/50 pt-16 space-y-8">
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900" style={{ fontFamily: 'Sora, Inter, sans-serif' }}>
              {isAr ? 'خدمات ذات صلة' : 'Related Services'}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedServices.map(rel => {
                const RelIcon = (Icons as any)[rel.icon] || Icons.HelpCircle
                const relTitle = isAr ? rel.title_ar : rel.title_en
                const relDesc = isAr ? rel.description_ar : rel.description_en
                
                return (
                  <Link
                    key={rel.id}
                    to="/services/$categorySlug/$serviceSlug"
                    params={{ categorySlug, serviceSlug: rel.id }}
                    className="bg-white border border-slate-200/60 rounded-3xl p-6 hover:shadow-lg hover:border-blue-500/20 transition-all duration-300 group flex flex-col justify-between"
                  >
                    <div className="space-y-4">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <RelIcon size={18} />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-bold text-slate-900 text-base group-hover:text-blue-600 transition-colors">
                          {relTitle}
                        </h4>
                        <p className="text-slate-500 text-xs sm:text-sm leading-relaxed line-clamp-2">
                          {relDesc}
                        </p>
                      </div>
                    </div>
                    <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold">
                      <span className="text-[#2563EB]">
                        {rel.price > 0 ? `$${rel.price}` : (isAr ? 'مشمول' : 'Included')}
                      </span>
                      <span className="text-slate-400 group-hover:text-blue-600 transition-colors flex items-center gap-1">
                        {isAr ? 'عرض التفاصيل' : 'View Details'}
                        <ArrowRight size={12} className={isAr ? 'rotate-180' : ''} />
                      </span>
                    </div>
                  </Link>
                )
              })}
            </div>
          </section>
        )}

      </main>

      {/* Order Modal */}
      {selectedService && (
        <PublicOrderModal
          service={selectedService}
          isAr={isAr}
          onClose={() => setSelectedService(null)}
        />
      )}

      <Footer />
    </div>
  )
}
