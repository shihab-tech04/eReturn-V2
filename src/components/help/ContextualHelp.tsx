import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { CircleHelp, MessageCircleQuestion, Send } from 'lucide-react';
import { Drawer } from '../sobaike-ui/Drawer';
import { useApp } from '../../context/AppContext';
import { getGuide, guidedReply, translate } from './returnHelpContent';
import './contextualHelp.css';

interface HelpContextShape { openHelp: (topic?: string, hint?: string) => void }
const HelpContext = createContext<HelpContextShape | null>(null);
export const useReturnHelp = (): HelpContextShape =>
  useContext(HelpContext) ?? { openHelp: () => {} };

/** Use the same Sobaike source button contract across tax forms. */
export const ContextHelpButton: React.FC<{topic?: string; hint?: string; compact?: boolean}> =
  ({ topic, hint, compact = false }) => {
    const { openHelp } = useReturnHelp();
    const { language } = useApp();
    return <button type="button" className={'er-help-inline' + (compact ? ' er-help-inline--compact' : '')}
      title={language === 'bn' ? 'বিস্তারিত সহায়তা খুলুন' : 'Open contextual help'}
      aria-haspopup="dialog"
      aria-label={(language === 'bn' ? 'সহায়তা খুলুন: ' : 'Get help: ') +
        (topic || (language === 'bn' ? 'এই বিষয়' : 'this field'))}
      onClick={e => { e.stopPropagation(); openHelp(topic, hint); }}>
      <MessageCircleQuestion aria-hidden="true" size={18} />
    </button>;
  };

type Message = { id: number; who: 'visitor' | 'guide'; text: string };
export const ContextualHelpProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const location = useLocation();
  const { language } = useApp();
  const [open, setOpen] = useState(false);
  const [topic, setTopic] = useState('');
  const [hint, setHint] = useState('');
  const [focusedField, setFocusedField] = useState('');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [mobile, setMobile] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches);
  const msgId = useRef(0);
  const guide = getGuide(location.pathname);
  const bn = language === 'bn';
  const t = (en: string, bengali: string) => bn ? bengali : en;

  const openHelp = useCallback((nextTopic = '', nextHint = '') => {
    setTopic(nextTopic);
    setHint(nextHint);
    setInput('');
    setMessages([]);
    setOpen(true);
  }, []);
  const closeHelp = useCallback(() => setOpen(false), []);

  useEffect(() => {
    closeHelp();
    setFocusedField('');
    setMessages([]);
  }, [location.pathname, closeHelp]);

  useEffect(() => {
    const media = window.matchMedia('(max-width: 767px)');
    const update = () => setMobile(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  // Only labels: never read a field value, password, TIN, draft, or financial amount.
  useEffect(() => {
    const onFocus = (event: FocusEvent) => {
      const target = event.target;
      if (!(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement)) return;
      if (target.closest('#er-help') || target.type === 'password' || target.type === 'hidden') return;
      const label = (target.labels?.[0]?.textContent || target.getAttribute('aria-label') ||
        (target.id ? document.querySelector('label[for="' + CSS.escape(target.id) + '"]')?.textContent : '') ||
        target.getAttribute('placeholder') || '').trim().replace(/\s+/g, ' ').slice(0, 110);
      if (label) setFocusedField(label);
    };
    document.addEventListener('focusin', onFocus);
    return () => document.removeEventListener('focusin', onFocus);
  }, []);

  const ask = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const question = input.trim().slice(0, 500);
    if (!question) return;
    const reply = guidedReply(question, guide, language, topic || focusedField);
    setMessages(prev => [...prev,
      { id: ++msgId.current, who: 'visitor', text: question },
      { id: ++msgId.current, who: 'guide', text: reply }]);
    setInput('');
  };
  const selected = topic || focusedField;
  return <HelpContext.Provider value={{ openHelp }}>
    {children}
    <button data-er-help-launcher type="button" className="er-help-launcher"
      onClick={() => openHelp()} aria-haspopup="dialog"
      aria-label={t('Open eReturn help and chat', 'ই-রিটার্ন সহায়তা ও চ্যাট খুলুন')}>
      <MessageCircleQuestion size={21} aria-hidden="true" />
      <span>{t('Need help?', 'সহায়তা')}</span>
    </button>
    <Drawer id="er-help" isOpen={open} onClose={closeHelp} language={language}
      title={t('eReturn guided help', 'ই-রিটার্ন সহায়তা')}
      description={t('Screen explanations and chat-style guidance', 'পৃষ্ঠা ও প্রশ্নভিত্তিক সহায়তা')}
      position={mobile ? 'bottom' : 'right'}>
      <div className="er-help-content">
        <section className="er-help-topic" aria-label={t('Current section', 'বর্তমান বিভাগ')}>
          <p className="er-help-overline">{t('THIS SCREEN', 'এই পৃষ্ঠা')}</p>
          <h3>{topic || translate(guide.title, language)}</h3>
          <p>{hint || translate(guide.purpose, language)}</p>
          {selected && <p className="er-help-focus"><CircleHelp size={16} aria-hidden="true" />
            <span>{t('Selected field or section: ', 'নির্বাচিত ঘর বা বিভাগ: ')}{selected}</span></p>}
          <h3>{t('What to do', 'কী করবেন')}</h3>
          <ol>{guide.steps.map((step, i) => <li key={i}>{translate(step, language)}</li>)}</ol>
        </section>
        <section className="er-help-chat" aria-label={t('Help conversation', 'সহায়তা কথোপকথন')}>
          <h3>{t('Ask about this screen', 'এই পৃষ্ঠা সম্পর্কে প্রশ্ন করুন')}</h3>
          <p className="er-help-mode" role="status">{t(
            'Guided answers only. Live AI is not connected; legal calculations and entitlements are not verified.',
            'এখানে নির্ধারিত নির্দেশনা দেওয়া হয়। লাইভ এআই সংযুক্ত নয়; আইনগত কর হিসাব ও সুবিধা প্রত্যয়িত নয়।'
          )}</p>
          {messages.length > 0 && <div className="er-help-messages" aria-live="polite">
            {messages.map(message => <p key={message.id}
              className={'er-help-message er-help-message--' + message.who}>{message.text}</p>)}
          </div>}
          <form onSubmit={ask} className="er-help-form">
            <label htmlFor="er-help-question">{t('Your question', 'আপনার প্রশ্ন')}</label>
            <textarea id="er-help-question" rows={3} maxLength={500} value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={t('How do I fill in this section?', 'এই বিভাগ কীভাবে পূরণ করব?')} />
            <button type="submit" disabled={!input.trim()}>
              <Send size={16} aria-hidden="true" />{t('Ask', 'জিজ্ঞাসা করুন')}
            </button>
          </form>
          <p className="er-help-privacy">{t(
            'Do not enter TIN, passwords or personal financial details. Questions stay in this browser session and are not sent to an AI provider.',
            'টিআইএন, পাসওয়ার্ড বা ব্যক্তিগত আর্থিক তথ্য লিখবেন না। প্রশ্ন এই ব্রাউজার সেশনেই থাকে; এআই সেবায় পাঠানো হয় না।'
          )}</p>
        </section>
      </div>
    </Drawer>
  </HelpContext.Provider>;
};
