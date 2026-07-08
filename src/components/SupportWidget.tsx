import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, User } from 'lucide-react'
import { useLang } from '../i18n/LanguageContext'
import { usePricingConfig } from '../hooks/usePricingConfig'
import { PRICING_DATA } from '../config/pricing'

interface Message {
  id: string
  sender: 'user' | 'bot'
  text: string
  timestamp: Date
}

type AnswerKey = 'pricing' | 'wyoming_delaware' | 'legality' | 'stripe' | 'fallback'

export default function SupportWidget() {
  const { lang, isRTL } = useLang()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [hasNewBadge, setHasNewBadge] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { pricing } = usePricingConfig()

  const isAr = lang === 'ar'

  // Standard greetings
  const getGreeting = () => {
    return isAr
      ? 'مرحباً! أنا المساعد الذكي لإنسنت جرو. كيف يمكنني مساعدتك اليوم في تأسيس شركتك الأمريكية؟'
      : "Hello! I'm the Instant Grow AI assistant. How can I help you form your US LLC today?"
  }

  // Quick Action options
  const quickActions: { text: string; key: AnswerKey }[] = isAr
    ? [
        { text: 'باقات الأسعار والتكلفة', key: 'pricing' },
        { text: 'مقارنة وايومنغ وديلاوير', key: 'wyoming_delaware' },
        { text: 'هل هو قانوني لغير المقيمين؟', key: 'legality' },
        { text: 'تفعيل حساب سترايب للمدفوعات', key: 'stripe' },
      ]
    : [
        { text: 'Pricing & Packages', key: 'pricing' },
        { text: 'Wyoming vs Delaware', key: 'wyoming_delaware' },
        { text: 'Is it legal for non-residents?', key: 'legality' },
        { text: 'Stripe & PayPal Payments', key: 'stripe' },
      ]

  const getPricingAnswer = () => {
    const usBasicEn = pricing.us.basic ? pricing.us.basic.features_en.slice(0, 3).join(', ') : 'LLC formation, state fee, EIN, and 1 year Registered Agent.'
    const usBasicAr = pricing.us.basic ? pricing.us.basic.features_ar.slice(0, 3).join('، ') : 'تشمل التأسيس، الرسوم الحكومية، الرقم الضريبي EIN، والوكيل المسجل.'
    
    const usPremiumEn = pricing.us.premium ? pricing.us.premium.features_en.slice(0, 3).join(', ') : 'Adds ITIN, virtual US phone, and priority setup.'
    const usPremiumAr = pricing.us.premium ? pricing.us.premium.features_ar.slice(0, 3).join('، ') : 'تضيف رقم ITIN للأفراد، رقم هاتف أمريكي، ودعمًا سريعًا.'
    
    const ukBasicEn = pricing.uk.basic ? pricing.uk.basic.features_en.slice(0, 3).join(', ') : 'UK LTD, registered office address, Wise referral.'
    const ukBasicAr = pricing.uk.basic ? pricing.uk.basic.features_ar.slice(0, 3).join('، ') : 'تشمل تأسيس الشركة وعنوان المكتب المسجل وحساب Wise.'
    
    const ukPremiumEn = pricing.uk.premium ? pricing.uk.premium.features_en.slice(0, 3).join(', ') : 'Adds director privacy, virtual UK phone, Wise/Stripe setup.'
    const ukPremiumAr = pricing.uk.premium ? pricing.uk.premium.features_ar.slice(0, 3).join('، ') : 'تضيف خصوصية المدير، هاتف بريطاني، وإعداد حسابات Wise و Stripe.'

    const usBasicPrice = pricing.us.basic?.price ?? PRICING_DATA.us.basic
    const usPremiumPrice = pricing.us.premium?.price ?? PRICING_DATA.us.premium
    const ukBasicPrice = pricing.uk.basic?.price ?? PRICING_DATA.uk.basic
    const ukPremiumPrice = pricing.uk.premium?.price ?? PRICING_DATA.uk.premium

    return {
      en: `We offer packages for both US LLCs and UK LTDs:\n\n• **US LLC Basic ($${usBasicPrice}):** ${usBasicEn}\n• **US LLC Premium ($${usPremiumPrice}):** ${usPremiumEn}\n\n• **UK LTD Basic ($${ukBasicPrice}):** ${ukBasicEn}\n• **UK LTD Premium ($${ukPremiumPrice}):** ${ukPremiumEn}\n\nWould you like to check our pricing table or schedule a call?`,
      ar: `نقدم باقات تأسيس للشركات الأمريكية والبريطانية:\n\n• **الأساسية لأمريكا (${usBasicPrice}$):** ${usBasicAr}\n• **المميزة لأمريكا (${usPremiumPrice}$):** ${usPremiumAr}\n\n• **الأساسية لبريطانيا (${ukBasicPrice}$):** ${ukBasicAr}\n• **المميزة لبريطانيا (${ukPremiumPrice}$):** ${ukPremiumAr}\n\nهل ترغب في الانتقال لجدول الأسعار أو حجز مكالمة استشارية؟`,
    }
  }

  // Answers mapping
  const answers: Record<AnswerKey, { en: string; ar: string }> = {
    pricing: getPricingAnswer(),
    wyoming_delaware: {
      en: '• **Wyoming:** Best for 90% of international founders. It is cheaper ($60/year annual fee vs $300+ in Delaware), offers complete privacy, and has very simple compliance.\n\n• **Delaware:** Recommended only if you plan to raise venture capital or have institutional investors who require a Delaware corporation.\n\nFor general online businesses, agencies, and e-commerce, Wyoming is the superior choice.',
      ar: '• **وايومنغ:** الولاية الأفضل لـ 90% من المؤسسين الدوليين. تكاليفها السنوية منخفضة جداً (60$ سنوياً مقارنة بـ 300$+ في ديلاوير)، وتوفر خصوصية تامة لأصحاب الشركة مع سهولة كاملة في الامتثال.\n\n• **ديلاوير:** نوصي بها فقط إذا كنت تخطط لجمع تمويل رأس مال جريء (VC) أو إذا كان المستثمرون يشترطون ذلك.\n\nللمتاجر الإلكترونية والخدمات والعمل الحر، تعتبر وايومنغ هي الخيار الأمثل والأنسب مالياً.',
    },
    legality: {
      en: 'Yes, it is 100% legal. The US government explicitly allows foreign nationals (non-US residents) to form LLCs and own 100% of the company. You do not need a US visa, a US address, or a US partner. You can manage everything remotely from your home country.',
      ar: 'نعم، قانوني تماماً بنسبة 100%. تسمح قوانين الولايات المتحدة صراحةً لغير المقيمين بتأسيس شركات مسؤولة محدودة (LLC) وامتلاكها بنسبة 100%. لا تحتاج إلى تأشيرة سفر، ولا إلى زيارة أمريكا، ولا إلى شريك أمريكي. يمكنك إدارة كل شيء عن بعد من بلدك.',
    },
    stripe: {
      en: 'With a US LLC and a US business bank account (which we help you open remotely), you are fully qualified to open a US Stripe and US PayPal business account to accept credit cards globally and settle payouts in USD.',
      ar: 'من خلال الشركة الأمريكية ورقم الـ EIN، بالإضافة للحساب البنكي الأمريكي (الذي نساعدك في فتحه عن بعد تماماً)، يمكنك تفعيل حساب Stripe أمريكي وحساب باي بال للأعمال بشكل رسمي وقبول مدفوعات البطاقات من جميع عملائك حول العالم بالدولار.',
    },
    fallback: {
      en: "I'm here to help with any questions about US LLCs, banking, and Stripe payments. You can also click the WhatsApp button next to me to chat with our human support team directly!",
      ar: 'أنا هنا لمساعدتك في أي استفسارات تخص تأسيس الشركات الأمريكية، والحسابات البنكية، وتفعيل سترايب. يمكنك أيضاً الضغط على أيقونة واتساب المجاورة للتحدث مع فريق الدعم البشري لدينا مباشرة!',
    },
  }

  useEffect(() => {
    // Initial welcome message
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          sender: 'bot',
          text: getGreeting(),
          timestamp: new Date(),
        },
      ])
    }
  }, [lang])

  useEffect(() => {
    if (isOpen) {
      setHasNewBadge(false)
      // Scroll to bottom
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    }
  }, [isOpen, messages, isTyping])

  const handleSend = (text: string, actionKey?: AnswerKey) => {
    if (!text.trim()) return

    const userMsg: Message = {
      id: Math.random().toString(),
      sender: 'user',
      text,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMsg])
    setInputValue('')
    setIsTyping(true)

    // Match keywords or action key
    setTimeout(() => {
      let botResponse = isAr ? answers.fallback.ar : answers.fallback.en
      
      const key = actionKey || determineKeyFromText(text)
      if (key && answers[key]) {
        botResponse = isAr ? answers[key].ar : answers[key].en
      }

      const botMsg: Message = {
        id: Math.random().toString(),
        sender: 'bot',
        text: botResponse,
        timestamp: new Date(),
      }

      setMessages(prev => [...prev, botMsg])
      setIsTyping(false)
    }, 1000)
  }

  const determineKeyFromText = (text: string): AnswerKey | null => {
    const t = text.toLowerCase()
    if (t.includes('price') || t.includes('cost') || t.includes('package') || t.includes('سعر') || t.includes('تكلف') || t.includes('باقة')) {
      return 'pricing'
    }
    if (t.includes('delaware') || t.includes('wyoming') || t.includes('ديلاوير') || t.includes('وايومنغ') || t.includes('مقارنة')) {
      return 'wyoming_delaware'
    }
    if (t.includes('legal') || t.includes('resident') || t.includes('قانون') || t.includes('مقيم')) {
      return 'legality'
    }
    if (t.includes('stripe') || t.includes('paypal') || t.includes('payment') || t.includes('سترايب') || t.includes('باي بال') || t.includes('دفع')) {
      return 'stripe'
    }
    return null
  }

  return (
    <div
      className={`fixed bottom-24 md:bottom-6 z-[999] flex flex-col items-end gap-3 ${
        isRTL ? 'left-6' : 'right-6'
      }`}
      style={{ direction: isRTL ? 'rtl' : 'ltr' }}
    >
      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className={`w-[calc(100vw-3rem)] max-w-[370px] h-[520px] bg-slate-950/95 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden backdrop-blur-2xl`}
          >
            {/* Header */}
            <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src="/mascot-chat.png"
                    alt="Instant Grow AI Mascot"
                    className="w-10 h-10 rounded-full object-cover border border-slate-800"
                  />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-slate-950 rounded-full animate-pulse" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-white">
                    {isAr ? 'مساعد إنسنت جرو الذكي' : 'Instant Grow AI'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {isAr ? 'نشط الآن • يجيب فوراً' : 'Online • Replies instantly'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800/50 hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              {messages.map(msg => (
                <div
                  key={msg.id}
                  className={`flex gap-2.5 max-w-[85%] ${
                    msg.sender === 'user'
                      ? 'ms-auto flex-row-reverse'
                      : 'me-auto'
                  }`}
                >
                  {msg.sender === 'user' ? (
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] flex-shrink-0 bg-slate-800 text-slate-300">
                      <User size={12} />
                    </div>
                  ) : (
                    <img
                      src="/mascot-chat.png"
                      alt="Bot"
                      className="w-7 h-7 rounded-full object-cover flex-shrink-0 border border-slate-800/80"
                    />
                  )}
                  <div
                    className={`p-3 rounded-2xl text-xs leading-relaxed whitespace-pre-line ${
                      msg.sender === 'user'
                        ? 'bg-[#1a56ff] text-white rounded-tr-none'
                        : 'bg-slate-900 text-slate-200 border border-slate-800/80 rounded-tl-none'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex gap-2.5 max-w-[85%] me-auto">
                  <img
                    src="/mascot-chat.png"
                    alt="Bot Typing"
                    className="w-7 h-7 rounded-full object-cover flex-shrink-0 border border-slate-800/80"
                  />
                  <div className="p-3 bg-slate-900 border border-slate-800/80 rounded-2xl rounded-tl-none flex items-center justify-center gap-1">
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions Chips */}
            <div className="px-4 py-2 border-t border-slate-900 bg-slate-950 flex flex-wrap gap-1.5">
              {quickActions.map(action => (
                <button
                  key={action.key}
                  onClick={() => handleSend(action.text, action.key)}
                  className="px-2.5 py-1.5 bg-slate-900 hover:bg-[#1a56ff]/10 border border-slate-800 hover:border-[#1a56ff]/30 text-[10px] text-slate-300 hover:text-[#1a56ff] rounded-full transition-all duration-200"
                >
                  {action.text}
                </button>
              ))}
            </div>

            {/* Input Form */}
            <form
              onSubmit={e => {
                e.preventDefault()
                handleSend(inputValue)
              }}
              className="p-3 border-t border-slate-800 bg-slate-900/30 flex gap-2"
            >
              <input
                type="text"
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                placeholder={isAr ? 'اكتب رسالتك هنا...' : 'Type a message...'}
                className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl px-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#1a56ff] focus:ring-2 focus:ring-[#1a56ff]/10"
              />
              <button
                type="submit"
                disabled={!inputValue.trim()}
                className="w-9 h-9 rounded-2xl bg-[#1a56ff] hover:bg-[#1546cc] text-white flex items-center justify-center transition-colors disabled:opacity-40 disabled:hover:bg-[#1a56ff]"
              >
                <Send size={14} className={isRTL ? 'rotate-180' : ''} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Bubbles Container */}
      <div className="flex flex-col items-center gap-3.5">
        {/* WhatsApp Bubble */}
        <motion.a
          href="https://wa.me/13072898149"
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="w-16 h-16 bg-[#25D366] text-white rounded-full hidden md:flex items-center justify-center shadow-[0_4px_20px_rgba(37,211,102,0.4)] hover:shadow-[0_4px_24px_rgba(37,211,102,0.6)] hover:bg-[#20ba59] transition-all duration-300 relative"
          title={isAr ? 'راسلنا على واتساب' : 'Chat on WhatsApp'}
        >
          <svg
            className="w-8 h-8 fill-current"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.487-1.761-1.66-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a5.28 5.28 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.46 7.44c-1.81 0-3.58-.49-5.13-1.4l-.37-.22-3.81 1 .1-.3.9-.38.9-3.7-.24-.39c-1-1.61-1.53-3.48-1.53-5.42 0-5.51 4.49-10 10-10s10 4.49 10 10-4.49 10-10 10m8.49-18.49A11.95 11.95 0 0 0 12 0C5.38 0 0 5.38 0 12c0 2.12.55 4.19 1.59 6.02L0 24l6.15-1.61C7.94 23.44 9.94 24 12 24c6.62 0 12-5.38 12-12 0-3.21-1.25-6.22-3.51-8.49" />
          </svg>
        </motion.a>
        
        {/* AI Chatbot Bubble */}
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="relative focus:outline-none"
          title={isAr ? 'المحادثة الذكية' : 'AI Chat Assistant'}
        >
          {isOpen ? (
            <div className="w-16 h-16 bg-gradient-to-tr from-[#1a56ff] to-[#6366f1] text-white rounded-full flex items-center justify-center shadow-[0_4px_20px_rgba(26,86,255,0.4)] hover:shadow-[0_4px_24px_rgba(26,86,255,0.6)]">
              <X size={28} />
            </div>
          ) : (
            <img
              src="/mascot-chat.png"
              alt="AI Chat Assistant"
              className="w-16 h-16 rounded-full shadow-[0_4px_20px_rgba(26,86,255,0.3)] hover:shadow-[0_4px_24px_rgba(26,86,255,0.5)] transition-all duration-300 object-cover"
            />
          )}
          
          {hasNewBadge && !isOpen && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-indigo-500 text-[9px] items-center justify-center font-bold text-white">1</span>
            </span>
          )}
        </motion.button>
      </div>
    </div>
  )
}
