import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, FileText, ClipboardCheck, ReceiptText } from 'lucide-react';
import { IconButton } from '../../components/sobaike-ui/IconButton';

/**
 * eReturn's domain-specific counterpart to Sobaike Public's ServiceHeroCarousel.
 * Mirrors its slide-track, 15s autoplay, focus/hover pause, keyboard and touch
 * behavior, hero grid and separate mobile CTA.
 * Source: Sobaike-janao-public main 97d23297 ServiceHeroCarousel/CategoryHeroBanner.
 * These are navigation prompts, NEVER computed income or tax obligations.
 */
export function TaxServiceHeroCarousel({
  language, hasDraft, assessmentYear,
}: {language:'en' | 'bn';hasDraft:boolean;assessmentYear:string}) {
  const bn=language==='bn';
  const slides=[
    {
      id:'start',
      title:bn?'আপনার আয়কর রিটার্ন প্রস্তুত করুন':'Prepare your tax return',
      short:bn?'এক জায়গায় আপনার রিটার্নের তথ্য পূরণ ও পর্যালোচনা করুন।':'Enter and review your return information in one place.',
      description:bn?'ধাপে ধাপে রিটার্ন প্রস্তুত করুন। প্রযোজ্য আয়ের খাত ও অন্যান্য বিবরণ পূরণ করুন।':'Prepare your draft step by step. Complete the income and other sections that apply to you.',
      cta:hasDraft?(bn?'আমার রিটার্ন চালিয়ে যান':'Continue My Tax Return'):(bn?'আমার রিটার্ন শুরু করুন':'Start My Tax Return'),
      path:'/user-panel/return-workspace',
      icon:FileText,
      tint:'var(--ui-surface-subtle)',
    },
    {
      id:'assessment',
      title:bn?'করবর্ষ ও করদাতার বিবরণ':'Assessment and taxpayer details',
      short:bn?'আপনার করবর্ষ ও প্রয়োজনীয় তথ্য যাচাই করুন।':'Check your assessment year and required details.',
      description:bn?'নিজের কর নির্ধারণের তথ্য ও প্রযোজ্য আয়কাল নিশ্চিত করুন।':'Confirm your assessment information and relevant income period before entering figures.',
      cta:bn?'বিবরণ দেখুন':'Review assessment',
      path:'/user-panel/assessment',
      icon:ClipboardCheck,
      tint:'var(--ui-accent-soft)',
    },
    {
      id:'records',
      title:bn?'আপনার কর নথিপত্র':'Your tax records',
      short:bn?'রিটার্ন, সনদ ও পরিশোধের নথি দেখুন।':'Find return documents, certificates and payment records.',
      description:bn?'যাচাইকৃত তথ্য উপলব্ধ হলে সংশ্লিষ্ট রিটার্ন, সনদ ও পরিশোধের নথি দেখুন।':'Access return documents, certificates and payment records when verified information is available.',
      cta:bn?'কর রেকর্ড খুলুন':'Open tax records',
      path:'/user-panel/tax-records',
      icon:ReceiptText,
      tint:'var(--ui-surface-subtle)',
    },
  ];
  const [index,setIndex]=useState(0);
  const [paused,setPaused]=useState(false);
  const [visible,setVisible]=useState(true);
  const [reduced,setReduced]=useState(false);
  const start=useRef<{x:number;y:number}|null>(null);
  const timer=useRef<number|null>(null);
  const previous=useCallback(()=>setIndex(x=>(x+slides.length-1)%slides.length),[slides.length]);
  const next=useCallback(()=>setIndex(x=>(x+1)%slides.length),[slides.length]);
  useEffect(()=>{
    const media=window.matchMedia('(prefers-reduced-motion: reduce)');
    const onMedia=()=>setReduced(media.matches);
    const onVisibility=()=>setVisible(document.visibilityState==='visible');
    onMedia();onVisibility();
    media.addEventListener?.('change',onMedia);
    document.addEventListener('visibilitychange',onVisibility);
    return()=>{media.removeEventListener?.('change',onMedia);document.removeEventListener('visibilitychange',onVisibility)};
  },[]);
  useEffect(()=>{
    if(timer.current!==null)window.clearTimeout(timer.current);
    if(!paused&&visible&&!reduced)timer.current=window.setTimeout(next,15000);
    return()=>{if(timer.current!==null)window.clearTimeout(timer.current)};
  },[index,paused,visible,reduced,next]);
  return <div className="relative group w-full er-service-hero" onPointerEnter={e=>{if(e.pointerType==='mouse')setPaused(true)}}
    onPointerLeave={e=>{if(e.pointerType==='mouse')setPaused(false)}} onFocusCapture={()=>setPaused(true)}
    onBlurCapture={e=>{if(!e.currentTarget.contains(e.relatedTarget as Node))setPaused(false)}}>
    <section id="er-home-service-carousel" role="region" aria-roledescription="carousel"
      aria-label={bn?'কর সেবার হাইলাইট ব্যানার':'Tax service highlights hero banner'}
      tabIndex={0} className="w-full ui-radius-card ui-border-default ui-elevation-card relative overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-ui-focus"
      onKeyDown={e=>{if((e.target as HTMLElement).closest('button,a'))return;if(e.key==='ArrowRight'){e.preventDefault();next()}else if(e.key==='ArrowLeft'){e.preventDefault();previous()}}}
      onTouchStart={e=>{const t=e.touches[0];start.current={x:t.clientX,y:t.clientY};setPaused(true)}}
      onTouchEnd={e=>{const t=e.changedTouches[0],p=start.current;if(p&&Math.abs(t.clientX-p.x)>45&&Math.abs(t.clientX-p.x)>Math.abs(t.clientY-p.y)*1.35)(t.clientX<p.x?next:previous)();start.current=null;setPaused(false)}}
      onTouchCancel={()=>{start.current=null;setPaused(false)}}>
      <div className={'hero-slider-track'+(reduced?' !transition-none':'')} style={{transform:'translateX(-'+(index*100)+'%)'}}>
        {slides.map((slide,i)=>{
          const active=i===index,Icon=slide.icon;
          return <div key={slide.id} className="w-full shrink-0 min-w-full p-0 flex flex-col er-tax-slide"
            role="group" aria-roledescription="slide" aria-label={(bn?'স্লাইড ':'Slide ')+(i+1)+' / '+slides.length}
            aria-hidden={!active} style={{backgroundColor:slide.tint}}>
            <div className="hero-slider-grid">
              <div className="hero-slider-content">
                <p className="er-tax-hero-kicker">{bn?'করবর্ষ':'ASSESSMENT YEAR'} {assessmentYear}</p>
                <h2 className="type-h1 tracking-tight text-center md:text-left text-ui-content-primary">{slide.title}</h2>
                <p className="block md:hidden type-body text-center max-w-md mx-auto text-ui-content-secondary">{slide.short}</p>
                <p className="hidden md:block type-body max-w-xl text-left text-ui-content-secondary">{slide.description}</p>
                <div className="hero-slider-cta-row">
                  <Link to={slide.path} tabIndex={active?0:-1} className="btn-hero-cta shadow-none">{slide.cta}</Link>
                </div>
              </div>
              <div className="hero-slider-media">
                <div className="er-tax-hero-illustration" aria-hidden="true">
                  <div className="er-tax-hero-illustration-back"/>
                  <div className="er-tax-hero-illustration-front">
                    <Icon size={72} strokeWidth={1.35}/>
                    <span className="er-tax-hero-illustration-line"/>
                    <span className="er-tax-hero-illustration-line short"/>
                  </div>
                </div>
              </div>
              <div className="hero-slider-mobile-cta">
                <Link to={slide.path} tabIndex={active?0:-1} className="btn-hero-cta w-full shadow-none">{slide.cta}</Link>
              </div>
            </div>
          </div>;
        })}
      </div>
    </section>
    <IconButton variant="outline" size="md" icon={<ChevronLeft size={20}/>} aria-label={bn?'আগের সেবা':'Previous service'} onClick={previous}
      className="hero-slider-arrow hero-slider-arrow-prev ui-radius-pill"/>
    <IconButton variant="outline" size="md" icon={<ChevronRight size={20}/>} aria-label={bn?'পরের সেবা':'Next service'} onClick={next}
      className="hero-slider-arrow hero-slider-arrow-next ui-radius-pill"/>
  </div>;
}
