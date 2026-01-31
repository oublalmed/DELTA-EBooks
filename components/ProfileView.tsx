import React, { useState } from 'react';
import { User, Language } from '../types';
import { translations } from '../i18n';

interface ProfileViewProps {
  user: User;
  language: Language;
  onUpdateUser: (name: string) => void;
  onUpdateLanguage: (language: Language) => void;
  onBack: () => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ user, language, onUpdateUser, onUpdateLanguage, onBack }) => {
  const [name, setName] = useState(user.name);
  const [currentLanguage, setCurrentLanguage] = useState<Language>(language);
  const t = translations[language].profile_view;

  const handleSave = () => {
    onUpdateUser(name);
    onUpdateLanguage(currentLanguage);
    onBack();
  };

  return (
    <div className="min-h-screen bg-themed text-themed-sub">
      <div className="max-w-xl mx-auto px-6 py-12">
        <button onClick={onBack} className="flex items-center gap-2 text-themed-muted hover:text-themed transition-all mb-8">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span className="text-xs font-bold uppercase tracking-widest">Back</span>
        </button>
        <h1 className="text-4xl font-display text-themed mb-2">{t.my_profile}</h1>
        <p className="text-themed-muted mb-8">View and update your profile details.</p>

        <div className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-themed-muted mb-2">{t.name}</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-themed-card border border-themed-muted rounded-lg px-4 py-2 text-themed"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-themed-muted mb-2">{t.email}</label>
            <input
              type="email"
              id="email"
              value={user.email}
              disabled
              className="w-full bg-themed-card border border-themed-muted rounded-lg px-4 py-2 text-themed-muted"
            />
          </div>
          <div>
            <label htmlFor="language" className="block text-sm font-medium text-themed-muted mb-2">{t.language}</label>
            <select
              id="language"
              value={currentLanguage}
              onChange={(e) => setCurrentLanguage(e.target.value as Language)}
              className="w-full bg-themed-card border border-themed-muted rounded-lg px-4 py-2 text-themed"
            >
              <option value="en">{t.english}</option>
              <option value="fr">{t.french}</option>
            </select>
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-4">
          <button onClick={onBack} className="px-6 py-2 rounded-lg text-themed-muted hover:bg-themed-muted transition-all">{t.close}</button>
          <button onClick={handleSave} className="px-6 py-2 rounded-lg bg-rose-500 text-white font-bold hover:bg-rose-600 transition-all">{t.save}</button>
        </div>
      </div>
    </div>
  );
};

export default ProfileView;
