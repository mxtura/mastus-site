"use client";

import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";

export default function About() {
  const [intro, setIntro] = useState<string>('')
  const [companyText, setCompanyText] = useState<string>('')
  const [factoryImages, setFactoryImages] = useState<string[]>([])

  useEffect(() => {
    let ignore = false
    async function load() {
      try {
        const res = await fetch('/api/content?type=ABOUT', { next: { revalidate: 60 } })
        if (!res.ok) return
        const payload = await res.json()
        if (ignore) return
        const data = payload?.data || {}
        if (typeof data.intro === 'string') setIntro(data.intro)
        if (typeof data.companyText === 'string') setCompanyText(data.companyText)
        if (Array.isArray(data.factoryImages)) {
          const sanitized = data.factoryImages
            .filter((item: unknown): item is string => typeof item === 'string')
            .map((item: string) => item.trim())
            .filter(Boolean)
          setFactoryImages(sanitized)
        } else {
          setFactoryImages([])
        }
      } catch {}
    }
    load()
    return () => { ignore = true }
  }, [])
  return (
  <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Заголовок */}
        <div className="text-center mb-12">
      <h1 className="text-4xl font-bold mb-4 heading tracking-wide">О КОМПАНИИ</h1>
  <p className="text-lg text-neutral-600 max-w-3xl mx-auto whitespace-pre-line">
    {intro}
      </p>
        </div>

        {/* О компании */}
        <section className="mb-20">
          <Card className="overflow-hidden border-neutral-300 bg-neutral-50 rounded-none">
            <div className="grid lg:grid-cols-2 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-neutral-300">
              <CardContent className="p-10">
                <CardHeader className="p-0 mb-6">
                  <CardTitle className="text-2xl font-semibold tracking-wide text-neutral-900 header">
                    Laddex
                  </CardTitle>
                </CardHeader>
                <div className="space-y-4 text-neutral-700 leading-relaxed whitespace-pre-line">
                  {companyText}
                </div>
              </CardContent>
              <div className="bg-neutral-100 p-8 lg:p-10">
                {factoryImages.length > 0 ? (
                  <div className="space-y-6">
                    <div className="relative w-full border border-neutral-300 bg-white overflow-hidden aspect-[4/3]">
                      <Image
                        src={factoryImages[0]}
                        alt="Производственный комплекс Laddex"
                        fill
                        className="object-cover"
                        sizes="(min-width: 1024px) 45vw, 100vw"
                        priority
                        unoptimized
                      />
                    </div>
                    {factoryImages.length > 1 && (
                      <div className="grid grid-cols-2 gap-4">
                        {factoryImages.slice(1).map((src, index) => (
                          <div key={`${src}-${index}`} className="relative border border-neutral-300 bg-white overflow-hidden aspect-square">
                            <Image
                              src={src}
                              alt={`Фото производства ${index + 2}`}
                              fill
                              className="object-cover"
                              sizes="(min-width: 1024px) 22vw, 45vw"
                              unoptimized
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center text-neutral-700">
                    <p className="text-base font-semibold tracking-wide text-neutral-900">Фотография производства появится позже</p>
                    <p className="text-xs text-neutral-500 mt-2 uppercase tracking-wide">контент обновляется</p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </section>        
      </div>
    </div>
  );
}
