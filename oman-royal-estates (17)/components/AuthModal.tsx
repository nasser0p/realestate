import React, { useState, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { CloseIcon } from './IconComponents';
import LoadingSpinner from './LoadingSpinner';
import { useLanguage } from '../contexts/LanguageContext';
import { COMMON_TRANSLATIONS } from '../constants';

interface AuthModalProps {
  mode: 'login' | 'register';
  onClose: () => void;
  onSwitchMode: (mode: 'login' | 'register') => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ mode, onClose, onSwitchMode }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); 
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { login, register } = useContext(AuthContext);
  const { language } = useLanguage();
  const T = COMMON_TRANSLATIONS[language];


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (mode === 'register' && password !== confirmPassword) {
      setError(T.passwordsDoNotMatch);
      setIsLoading(false);
      return;
    }

    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register(email, password);
      }
      onClose(); 
    } catch (err: any) {
      setError(err.message || T.unexpectedError);
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-royal-blue focus:border-transparent transition-shadow";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 transition-opacity duration-300 ease-in-out">
      <div className="bg-white p-6 sm:p-8 rounded-lg shadow-xl w-full max-w-md transform transition-all duration-300 ease-in-out scale-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-royal-blue font-display">
            {mode === 'login' ? T.loginToAccount : T.createAnAccount}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>

        {error && <p className="mb-4 text-sm text-red-600 bg-red-100 p-3 rounded-md">{error}</p>}
        {isLoading && <LoadingSpinner text={mode === 'login' ? T.loggingIn : T.registering} size="sm" />}

        {!isLoading && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">{T.emailAddressLabel}</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={inputClass}
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">{T.passwordLabel}</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={inputClass}
                placeholder="••••••••"
              />
            </div>
            {mode === 'register' && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">{T.confirmPasswordLabel}</label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className={inputClass}
                  placeholder="••••••••"
                />
              </div>
            )}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-royal-blue text-white py-3 px-4 rounded-md hover:bg-opacity-90 transition-colors font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-royal-blue"
            >
              {isLoading ? T.processing : (mode === 'login' ? T.login : T.register)}
            </button>
          </form>
        )}

        {!isLoading && (
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {mode === 'login' ? T.dontHaveAccount : T.alreadyHaveAccount}{' '}
              <button
                onClick={() => onSwitchMode(mode === 'login' ? 'register' : 'login')}
                className="font-medium text-royal-blue hover:text-gold-accent"
              >
                {mode === 'login' ? T.registerHere : T.loginHere}
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthModal;
