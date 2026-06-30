import { useForm } from 'react-hook-form'
import { Check } from 'lucide-react'
import { pb } from '../../lib/pocketbase'
import { useLang } from '../../i18n/LanguageContext'
import type { WizardData } from './data'

export function StepAccount({ user, register, errors }: {
  user: { id: string; email?: string; displayName?: string } | null
  register: ReturnType<typeof useForm<WizardData>>['register']
  errors: ReturnType<typeof useForm<WizardData>>['formState']['errors']
}) {
  const { t } = useLang()
  if (user) {
    return (
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-1">{t.order.yourAccountTitle}</h2>
        <p className="text-slate-500 text-sm mb-6">{t.order.signedInDesc}</p>
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-green-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {((user?.displayName ?? user?.email ?? 'U')[0] ?? 'U').toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">{user.displayName || user.email}</p>
            <p className="text-xs text-slate-500">{user.email}</p>
          </div>
          <Check size={16} className="text-green-500 ml-auto" />
        </div>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-900 mb-1">{t.order.createAccountTitle}</h2>
      <p className="text-slate-500 text-sm mb-6">{t.order.createAccountDesc}</p>

      <div className="space-y-4">
        <button
          type="button"
          onClick={() => pb.collection('users').authWithOAuth2({ provider: 'google' })}
          className="w-full flex items-center justify-center gap-3 border border-slate-300 rounded-xl py-3 text-sm font-semibold text-slate-700 hover:border-[#1a56ff] hover:text-[#1a56ff] transition-all"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.616z" fill="#4285F4"/>
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
            <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
          </svg>
          {t.order.continueWithGoogle}
        </button>

        <div className="relative flex items-center gap-3">
          <div className="flex-1 h-px bg-slate-200" />
          <span className="text-xs text-slate-400 flex-shrink-0">{t.order.orFillDetails}</span>
          <div className="flex-1 h-px bg-slate-200" />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">{t.order.fullNameLabel} <span className="text-red-500">*</span></label>
          <input
            {...register('fullName', { required: t.order.fullNameRequired })}
            placeholder={t.order.accountFullNamePlaceholder}
            className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a56ff] focus:ring-2 focus:ring-[#1a56ff]/10"
          />
          {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">{t.order.emailAddressLabel} <span className="text-red-500">*</span></label>
          <input
            {...register('email', {
              required: t.order.emailRequired,
              pattern: { value: /^\S+@\S+\.\S+$/, message: t.order.validEmail }
            })}
            type="email"
            placeholder={t.order.emailAddressPlaceholder}
            className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a56ff] focus:ring-2 focus:ring-[#1a56ff]/10"
          />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">{t.order.whatsappLabel}</label>
          <input
            {...register('whatsapp')}
            placeholder={t.order.phonePlaceholder}
            className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a56ff] focus:ring-2 focus:ring-[#1a56ff]/10"
          />
          <p className="text-xs text-slate-400 mt-1">{t.order.whatsappNote}</p>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-amber-800 text-sm font-semibold mb-1">🔐 {t.order.accountCreatedTitle}</p>
          <p className="text-amber-700 text-xs">{t.order.accountCreatedDesc}</p>
        </div>
      </div>
    </div>
  )
}
