"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEffect, useMemo, useState } from "react";

interface FormData {
  name: string;
  email: string;
  phone: string;
  company: string;
  subject: string;
  message: string;
  consent: boolean;
}

type WorkingHour = { label: string; time: string };

export default function Contacts() {
  type Requisites = { companyName: string; inn: string; kpp: string; ogrn: string; bankName: string; bik: string; settlementAccount: string; correspondentAccount: string; legalAddress: string }
  const [intro, setIntro] = useState<string>('')
  const [requisites, setRequisites] = useState<Requisites>({
    companyName: '', inn: '', kpp: '', ogrn: '', bankName: '', bik: '', settlementAccount: '', correspondentAccount: '', legalAddress: ''
  })
  const [contact, setContact] = useState<{ phoneTel: string; emailInfo: string; emailSales: string; addressCityRegion: string; addressStreet: string }>({
    phoneTel: '', emailInfo: '', emailSales: '', addressCityRegion: '', addressStreet: ''
  })
  const [workingHours, setWorkingHours] = useState<WorkingHour[]>([])
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    company: '',
    subject: '',
    message: '',
    consent: false
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const [mapUrls, setMapUrls] = useState<{ shareHref: string; widgetSrc: string; resolvedAddress: string } | null>(null);

  const resolvedMapAddress = useMemo(() => {
    const contactParts = [contact.addressCityRegion, contact.addressStreet]
      .map(part => (typeof part === 'string' ? part.trim() : ''))
      .filter(Boolean)

    return contactParts.join(', ')
  }, [contact.addressCityRegion, contact.addressStreet])

  const displayWorkingHours = workingHours

  const cityMapHref = useMemo(() => {
    const city = contact.addressCityRegion?.trim()
    if (city) return `https://yandex.ru/maps/?mode=search&text=${encodeURIComponent(city)}`
    return mapUrls?.shareHref ?? 'https://yandex.ru/maps/'
  }, [contact.addressCityRegion, mapUrls?.shareHref])

  useEffect(() => {
    let ignore = false
    async function load() {
      try {
        const res = await fetch('/api/content?type=CONTACTS', { next: { revalidate: 60 } })
        if (!res.ok) return
        const payload = await res.json()
        if (ignore) return
        const data = payload?.data || {}
        if (typeof data.intro === 'string') setIntro(data.intro)
        if (data.requisites && typeof data.requisites === 'object') {
          const r = data.requisites as Partial<Requisites>
          setRequisites({
            companyName: r.companyName ?? '',
            inn: r.inn ?? '',
            kpp: r.kpp ?? '',
            ogrn: r.ogrn ?? '',
            bankName: r.bankName ?? '',
            bik: r.bik ?? '',
            settlementAccount: r.settlementAccount ?? '',
            correspondentAccount: r.correspondentAccount ?? '',
            legalAddress: r.legalAddress ?? '',
          })
        }
        setContact({
          phoneTel: typeof data.phoneTel === 'string' ? data.phoneTel : '',
          emailInfo: typeof data.emailInfo === 'string' ? data.emailInfo : '',
          emailSales: typeof data.emailSales === 'string' ? data.emailSales : '',
          addressCityRegion: typeof data.addressCityRegion === 'string' ? data.addressCityRegion : '',
          addressStreet: typeof data.addressStreet === 'string' ? data.addressStreet : '',
        })
        const rawWorkingHours = Array.isArray(data.workingHours) ? data.workingHours : []
        const normalizedWorkingHours: WorkingHour[] = []
        for (const entry of rawWorkingHours) {
          if (!entry || typeof entry !== 'object') continue
          const record = entry as Record<string, unknown>
          const label = typeof record.label === 'string' ? record.label.trim() : ''
          const time = typeof record.time === 'string' ? record.time.trim() : ''
          if (!label && !time) continue
          normalizedWorkingHours.push({ label, time })
        }
        setWorkingHours(normalizedWorkingHours)
      } catch {}
    }
    load()
    return () => { ignore = true }
  }, [])

  useEffect(() => {
    const trimmedAddress = resolvedMapAddress.trim()

    if (!trimmedAddress) {
      setMapUrls(null)
      return
    }

    const encodedAddress = encodeURIComponent(trimmedAddress)
    const fallback = {
      shareHref: `https://yandex.ru/maps/?mode=search&z=17&text=${encodedAddress}`,
      widgetSrc: `https://yandex.ru/map-widget/v1/?mode=search&z=17&text=${encodedAddress}`,
      resolvedAddress: trimmedAddress,
    }
    setMapUrls(fallback)

    const controller = new AbortController()

    async function resolvePreciseLink() {
      try {
        const params = new URLSearchParams({ query: trimmedAddress })
        const response = await fetch(`/api/maps/geocode?${params.toString()}`, {
          signal: controller.signal,
        })
        if (!response.ok) return

        const payload = await response.json()
        if (controller.signal.aborted) return

        const data = payload?.data
        if (!data || typeof data.shareHref !== 'string' || typeof data.widgetSrc !== 'string') return

        const resolvedAddressFromApi = typeof data.resolvedAddress === 'string' && data.resolvedAddress.trim()
          ? data.resolvedAddress.trim()
          : trimmedAddress

        if (!controller.signal.aborted) {
          setMapUrls({
            shareHref: data.shareHref,
            widgetSrc: data.widgetSrc,
            resolvedAddress: resolvedAddressFromApi,
          })
        }
      } catch {
        if (!controller.signal.aborted) {
          // swallow network/geocoding errors, fallback links already set
        }
      }
    }

    resolvePreciseLink()

    return () => controller.abort()
  }, [resolvedMapAddress])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  // Сбрасываем сообщения валидации при изменении полей
  if (validationErrors.length) setValidationErrors([]);
  if (submitMessage) setSubmitMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Кастомная проверка обязательных полей
    const errors: string[] = [];
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.name.trim()) errors.push('Укажите имя.');
    if (!formData.email.trim() || !emailRegex.test(formData.email.trim())) errors.push('Укажите корректный email.');
    if (!formData.subject) errors.push('Выберите тему обращения.');
    if (!formData.message.trim()) errors.push('Введите сообщение.');
    if (errors.length) {
      setValidationErrors(errors);
      return;
    }
    
    if (!formData.consent) {
      setValidationErrors(['Необходимо согласие на обработку персональных данных.']);
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage(null);
    setValidationErrors([]);

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          company: formData.company,
          subject: formData.subject,
          message: formData.message,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setSubmitMessage({ 
          type: 'success', 
          text: 'Сообщение отправлено успешно! Мы свяжемся с вами в ближайшее время.' 
        });
        
        // Сброс формы
        setFormData({
          name: '',
          email: '',
          phone: '',
          company: '',
          subject: '',
          message: '',
          consent: false
        });
      } else {
        setSubmitMessage({ 
          type: 'error', 
          text: result.error || 'Произошла ошибка при отправке сообщения' 
        });
      }
    } catch {
      setSubmitMessage({ 
        type: 'error', 
        text: 'Ошибка сети. Попробуйте еще раз.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
  <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
      <h1 className="text-4xl font-bold mb-4 heading tracking-wide">КОНТАКТЫ</h1>
  <p className="text-lg text-neutral-600 max-w-2xl mx-auto whitespace-pre-line">
    {intro}
      </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Контактная информация */}
          <div className="space-y-8">
            <Card className="p-10 border-neutral-300 bg-neutral-50 rounded-none">
              <CardHeader className="px-0 pt-0">
                <CardTitle className="text-2xl font-semibold tracking-wide heading mb-6">Laddex</CardTitle>
              </CardHeader>
              <CardContent className="px-0">
                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="w-12 h-12 bg-white flex items-center justify-center mr-4 mt-1 border border-neutral-300">
                      <svg className="w-6 h-6 text-neutral-700" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6.62,10.79C8.06,13.62 10.38,15.94 13.21,17.38L15.41,15.18C15.69,14.9 16.08,14.82 16.43,14.93C17.55,15.3 18.75,15.5 20,15.5A1,1 0 0,1 21,16.5V20A1,1 0 0,1 20,21A17,17 0 0,1 3,4A1,1 0 0,1 4,3H7.5A1,1 0 0,1 8.5,4C8.5,5.25 8.7,6.45 9.07,7.57C9.18,7.92 9.1,8.31 8.82,8.59L6.62,10.79Z"/>
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold tracking-wide text-neutral-900 mb-1 text-sm">ТЕЛЕФОН</h3>
                      <p className="text-neutral-700"><a href={contact.phoneTel ? `tel:${contact.phoneTel}` : '#'}>{contact.phoneTel ? contact.phoneTel.replace(/^\+?7?\s*(\d{3})(\d{3})(\d{2})(\d{2})$/, "+7 ($1) $2-$3-$4") : '+7'}</a></p>
                    </div>
                  </div>

                <div className="flex items-start">
                  <div className="w-12 h-12 bg-white flex items-center justify-center mr-4 mt-1 border border-neutral-300">
                    <svg className="w-6 h-6 text-neutral-700" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20,8L12,13L4,8V6L12,11L20,6M20,4H4C2.89,4 2,4.89 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V6C22,4.89 21.1,4 20,4Z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold tracking-wide text-neutral-900 mb-1 text-sm">EMAIL</h3>
                    <p className="text-neutral-700"><a href={contact.emailInfo ? `mailto:${contact.emailInfo}` : '#'}>{contact.emailInfo || 'info@site.ru'}</a></p>
                    <p className="text-neutral-700">{contact.emailSales || ''}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-12 h-12 bg-white flex items-center justify-center mr-4 mt-1 border border-neutral-300">
                    <svg className="w-6 h-6 text-neutral-700" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12,11.5A2.5,2.5 0 0,1 9.5,9A2.5,2.5 0 0,1 12,6.5A2.5,2.5 0 0,1 14.5,9A2.5,2.5 0 0,1 12,11.5M12,2A7,7 0 0,0 5,9C5,14.25 12,22 12,22C12,22 19,14.25 19,9A7,7 0 0,0 12,2Z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold tracking-wide text-neutral-900 mb-1 text-sm">АДРЕС</h3>
                    <p className="text-neutral-700">{[contact.addressCityRegion, contact.addressStreet].filter(Boolean).join(', ')}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-12 h-12 bg-white flex items-center justify-center mr-4 mt-1 border border-neutral-300">
                    <svg className="w-6 h-6 text-neutral-700" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M16.2,16.2L11,13V7H12.5V12.2L17,14.9L16.2,16.2Z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold tracking-wide text-neutral-900 mb-1 text-sm">РЕЖИМ РАБОТЫ</h3>
                    <div className="space-y-1">
                      {displayWorkingHours.length > 0 ? (
                        displayWorkingHours.map((item, index) => {
                          const hasLabel = Boolean(item.label)
                          const hasTime = Boolean(item.time)
                          return (
                            <p key={`${item.label}-${item.time}-${index}`} className="text-neutral-700">
                              {hasLabel ? (
                                <span className="font-medium">
                                  {item.label}
                                  {hasTime ? ': ' : ''}
                                </span>
                              ) : null}
                              {hasTime ? item.time : (!hasLabel ? '—' : '')}
                            </p>
                          )
                        })
                      ) : (
                        <p className="text-neutral-500 text-sm">График работы не указан.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              </CardContent>
            </Card>

            {/* Реквизиты */}
  <Card className="bg-neutral-100 p-10 border-neutral-300 rounded-none">
              <CardHeader className="px-0 pt-0">
        <CardTitle className="text-xl font-semibold tracking-wide text-neutral-900 mb-4">РЕКВИЗИТЫ КОМПАНИИ</CardTitle>
              </CardHeader>
              <CardContent className="px-0">
  <div className="space-y-3 text-sm text-neutral-700">
                  <div><span className="font-medium">Наименование: </span>{requisites.companyName || '—'}</div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><span className="font-medium">ИНН: </span>{requisites.inn || '—'}</div>
                    <div><span className="font-medium">КПП: </span>{requisites.kpp || '—'}</div>
                  </div>
                  <div><span className="font-medium">ОГРН: </span>{requisites.ogrn || '—'}</div>
                  <div><span className="font-medium">Банк: </span>{requisites.bankName || '—'}</div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><span className="font-medium">БИК: </span>{requisites.bik || '—'}</div>
                    <div><span className="font-medium">Р/с: </span>{requisites.settlementAccount || '—'}</div>
                  </div>
                  <div><span className="font-medium">К/с: </span>{requisites.correspondentAccount || '—'}</div>
                  <div><span className="font-medium">Юр. адрес: </span>{requisites.legalAddress || '—'}</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Форма обратной связи */}
      <Card className="p-10 border-neutral-300 rounded-none">
            <CardHeader className="px-0 pt-0">
        <CardTitle className="text-2xl font-semibold tracking-wide text-neutral-900 mb-6">ОТПРАВИТЬ СООБЩЕНИЕ</CardTitle>
            </CardHeader>
            <CardContent className="px-0">
              {/* Блок ошибок валидации — под заголовком */}
              {validationErrors.length > 0 && (
                <div className="mb-6 p-4 border rounded-none bg-red-50 border-red-200 text-red-800">
                  <ul className="list-disc pl-5 space-y-1">
                    {validationErrors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              <form noValidate onSubmit={handleSubmit} className="space-y-6">
              {/* Сообщение о результате отправки */}
              {submitMessage && (
                <div className={`p-4 border rounded-none ${
                  submitMessage.type === 'success' 
                    ? 'bg-green-50 border-green-200 text-green-800' 
                    : 'bg-red-50 border-red-200 text-red-800'
                }`}>
                  {submitMessage.text}
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-xs font-medium tracking-wide text-neutral-600 mb-2 uppercase">
                    Имя *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-neutral-400 bg-white text-neutral-900 focus:outline-none focus:ring-0 focus:border-orange-600 text-sm tracking-wide rounded-none"
                    placeholder="Ваше имя"
                  />
                </div>
                
                <div>
                  <label htmlFor="company" className="block text-xs font-medium tracking-wide text-neutral-600 mb-2 uppercase">
                    Компания
                  </label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-neutral-400 bg-white text-neutral-900 focus:outline-none focus:ring-0 focus:border-orange-600 text-sm tracking-wide rounded-none"
                    placeholder="Название компании"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="phone" className="block text-xs font-medium tracking-wide text-neutral-600 mb-2 uppercase">
                    Телефон
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-neutral-400 bg-white text-neutral-900 focus:outline-none focus:ring-0 focus:border-orange-600 text-sm tracking-wide rounded-none"
                    placeholder="+7 (XXX) XXX-XX-XX"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-xs font-medium tracking-wide text-neutral-600 mb-2 uppercase">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-neutral-400 bg-white text-neutral-900 focus:outline-none focus:ring-0 focus:border-orange-600 text-sm tracking-wide rounded-none"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="subject" className="block text-xs font-medium tracking-wide text-neutral-600 mb-2 uppercase">
                  Тема обращения
                </label>
                <select
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-neutral-400 bg-white text-neutral-900 focus:outline-none focus:ring-0 focus:border-[var(--primary)] text-sm tracking-wide rounded-none"
                >
                  <option value="">Выберите тему</option>
                  <option value="PRICE">Запрос цены</option>
                  <option value="ORDER">Размещение заказа</option>
                  <option value="DELIVERY">Доставка</option>
                  <option value="TECHNICAL">Техническая консультация</option>
                  <option value="OTHER">Другое</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-xs font-medium tracking-wide text-neutral-600 mb-2 uppercase">
                  Сообщение *
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={6}
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-neutral-400 bg-white text-neutral-900 focus:outline-none focus:ring-0 focus:border-orange-600 text-sm tracking-wide rounded-none"
                  placeholder="Опишите ваш запрос подробнее..."
                ></textarea>
              </div>

              <div>
                <label className="flex items-start">
                  <input
                    type="checkbox"
                    name="consent"
                    checked={formData.consent}
                    onChange={handleChange}
                    className="mt-1 h-4 w-4 text-[var(--primary)] focus:ring-0 border-neutral-400 rounded-none"
                  />
                  <span className="ml-2 text-xs tracking-wide text-neutral-600 leading-relaxed">
                    Я согласен на обработку персональных данных в соответствии с{" "}
                    <Link href="/privacy" className="text-[var(--primary)] hover:text-[var(--primary)]/80 underline underline-offset-2">
                      политикой конфиденциальности
                    </Link>
                  </span>
                </label>
              </div>

              <Button 
                type="submit" 
                disabled={isSubmitting || !formData.consent}
                className="w-full bg-[var(--primary)] hover:bg-[var(--primary)]/90 rounded-none tracking-wide" 
                size="lg"
              >
                {isSubmitting ? 'ОТПРАВКА...' : 'ОТПРАВИТЬ'}
              </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Яндекс карта */}
        {mapUrls ? (
          <div className="mt-16">
            <div className="bg-white border border-neutral-300 overflow-hidden rounded-none">
              <div style={{position:"relative",overflow:"hidden"}}>
                <a href={cityMapHref} style={{color:"#eee",fontSize:"12px",position:"absolute",top:"0px"}} target="_blank" rel="noreferrer">
                  {contact.addressCityRegion || mapUrls.resolvedAddress}
                </a>
                <a href={mapUrls.shareHref} style={{color:"#eee",fontSize:"12px",position:"absolute",top:"14px"}} target="_blank" rel="noreferrer">
                  {mapUrls.resolvedAddress || resolvedMapAddress} — Яндекс Карты
                </a>
                <iframe
                  // Метка с подписью улицы через режим поиска
                  src={mapUrls.widgetSrc}
                  width="100%"
                  height="400"
                  frameBorder="0"
                  allowFullScreen={true}
                  style={{ position: "relative" }}
                  title={`Местоположение: ${mapUrls.resolvedAddress || resolvedMapAddress}`}
                />
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
