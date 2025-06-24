
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HomePageSettings } from '../types';
import { getHomePageSettings, updateHomePageSettings } from '../data';
import { ROUTES, COMMON_TRANSLATIONS } from '../constants';
import LoadingSpinner from '../components/LoadingSpinner';
import { useLanguage } from '../contexts/LanguageContext';

const AdminHomePageSettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const T = COMMON_TRANSLATIONS[language];

  const [settings, setSettings] = useState<HomePageSettings | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [mediaUrl, setMediaUrl] = useState('');
  const [fallbackImageUrl, setFallbackImageUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    const currentSettings = getHomePageSettings();
    setSettings(currentSettings);
    setMediaType(currentSettings.mediaType);
    setMediaUrl(currentSettings.mediaUrl);
    setFallbackImageUrl(currentSettings.fallbackImageUrl || '');
    setIsLoading(false);
  }, []);

  const isValidHttpUrl = (string: string) => {
    let url;
    try {
      url = new URL(string);
    } catch (_) {
      return false;  
    }
    return url.protocol === "http:" || url.protocol === "https:";
  }

  const handleSave = () => {
    setError(null);
    if (!mediaUrl.trim() || !isValidHttpUrl(mediaUrl)) {
        setError(T.invalidUrlError + ` (${T.mediaUrlLabel})`);
        return;
    }
    if (mediaType === 'video' && fallbackImageUrl.trim() && !isValidHttpUrl(fallbackImageUrl)) {
        setError(T.invalidUrlError + ` (${T.fallbackImageUrlLabel})`);
        return;
    }


    setIsSaving(true);
    const newSettings: HomePageSettings = {
      mediaType,
      mediaUrl,
      fallbackImageUrl: mediaType === 'video' ? (fallbackImageUrl || mediaUrl) : (settings?.fallbackImageUrl || mediaUrl), // ensure fallback for video
    };
    updateHomePageSettings(newSettings);
    setSettings(newSettings); // Update local state to reflect saved changes
    setTimeout(() => {
      setIsSaving(false);
      alert(T.heroSettingsUpdatedSuccess);
      // Optionally navigate away or give other feedback
    }, 1000);
  };

  if (isLoading || !settings) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner text={T.loading} />
      </div>
    );
  }

  const inputClass = "w-full p-3 border border-medium-gray rounded-md focus:ring-2 focus:ring-royal-blue focus:border-transparent outline-none transition-shadow bg-white text-gray-900 disabled:bg-gray-100";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-royal-blue font-display">{T.homePageHeroSettingsTitle}</h1>
        <Link to={ROUTES.ADMIN.DASHBOARD} className="text-sm text-royal-blue hover:underline">
          {T.backToDashboard}
        </Link>
      </div>

      <div className="bg-white p-6 md:p-8 rounded-lg shadow-xl space-y-8">
        {error && <p className="mb-4 text-sm text-red-600 bg-red-100 p-3 rounded-md">{error}</p>}
        
        <fieldset className="border border-medium-gray p-4 rounded-md">
          <legend className="text-lg font-semibold text-royal-blue px-2">{T.mediaTypeLabel}</legend>
          <div className="flex space-x-4 mt-2 rtl:space-x-reverse">
            <label className="flex items-center space-x-2 rtl:space-x-reverse cursor-pointer">
              <input
                type="radio"
                name="mediaType"
                value="image"
                checked={mediaType === 'image'}
                onChange={() => setMediaType('image')}
                className="form-radio text-royal-blue focus:ring-gold-accent"
                disabled={isSaving}
              />
              <span className="text-gray-700">{T.imageTypeLabel}</span>
            </label>
            <label className="flex items-center space-x-2 rtl:space-x-reverse cursor-pointer">
              <input
                type="radio"
                name="mediaType"
                value="video"
                checked={mediaType === 'video'}
                onChange={() => setMediaType('video')}
                className="form-radio text-royal-blue focus:ring-gold-accent"
                disabled={isSaving}
              />
              <span className="text-gray-700">{T.videoTypeLabel}</span>
            </label>
          </div>
        </fieldset>

        <fieldset className="border border-medium-gray p-4 rounded-md">
          <legend className="text-lg font-semibold text-royal-blue px-2">{T.mediaUrlLabel}</legend>
          <div className="mt-2">
            <label htmlFor="mediaUrl" className={labelClass}>
              {mediaType === 'image' ? T.imageUrlLabel : T.videoUrlLabel}
            </label>
            <input
              type="url"
              id="mediaUrl"
              value={mediaUrl}
              onChange={(e) => setMediaUrl(e.target.value)}
              className={inputClass}
              placeholder={mediaType === 'image' ? T.mediaUrlPlaceholderImage : T.mediaUrlPlaceholderVideo}
              disabled={isSaving}
              required
            />
          </div>
           {mediaType === 'video' && (
             <div className="mt-4">
               <label htmlFor="fallbackImageUrl" className={labelClass}>
                 {T.fallbackImageUrlLabel}
               </label>
               <input
                type="url"
                id="fallbackImageUrl"
                value={fallbackImageUrl}
                onChange={(e) => setFallbackImageUrl(e.target.value)}
                className={inputClass}
                placeholder={T.fallbackImageUrlPlaceholder}
                disabled={isSaving}
               />
                <p className="text-xs text-gray-500 mt-1">
                  {language === 'ar' ? 'اختياري. إذا ترك فارغًا، سيتم استخدام إطار من الفيديو أو رابط الفيديو نفسه كصورة غلاف إذا كان مدعومًا.' : 'Optional. If left blank, a frame from the video or the video URL itself will be used as poster if supported.'}
                </p>
             </div>
           )}
        </fieldset>

        <fieldset className="border border-medium-gray p-4 rounded-md">
          <legend className="text-lg font-semibold text-royal-blue px-2">{T.currentPreviewLabel}</legend>
          <div className="mt-2 bg-gray-100 p-4 rounded-md min-h-[200px] flex items-center justify-center">
            {mediaUrl && isValidHttpUrl(mediaUrl) ? (
              mediaType === 'image' ? (
                <img src={mediaUrl} alt={T.currentPreviewLabel} className="max-w-full max-h-80 object-contain rounded" />
              ) : (
                <video
                  key={mediaUrl} // Force re-render if URL changes
                  src={mediaUrl}
                  poster={fallbackImageUrl && isValidHttpUrl(fallbackImageUrl) ? fallbackImageUrl : undefined}
                  controls
                  className="max-w-full max-h-80 rounded"
                  onError={(e) => console.error("Preview video error", e)}
                >
                  Your browser does not support the video tag.
                </video>
              )
            ) : (
              <p className="text-gray-500">{language === 'ar' ? 'أدخل رابط وسائط صالح لعرض المعاينة.' : 'Enter a valid media URL to see a preview.'}</p>
            )}
          </div>
        </fieldset>

        <div className="flex justify-end pt-6 border-t border-medium-gray">
          <button
            onClick={handleSave}
            disabled={isSaving || isLoading}
            className="w-full sm:w-auto bg-gold-accent text-royal-blue px-6 py-3 rounded-md hover:bg-yellow-500 transition-colors font-semibold disabled:opacity-70 flex items-center justify-center"
          >
            {isSaving ? (
              <>
                <LoadingSpinner size="sm" color="text-royal-blue" />
                <span className="ml-2">{T.savingButton}</span>
              </>
            ) : (
              T.saveChanges
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminHomePageSettingsPage;
