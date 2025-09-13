import React, { useState } from 'react';
import { X, Mail, Lock, User, UserCheck, Eye, EyeOff } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import { useAuth } from '../hooks/useAuth';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab: 'passenger' | 'driver';
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, initialTab }) => {
  const [activeTab, setActiveTab] = useState<'passenger' | 'driver'>(initialTab);
  const [showPassword, setShowPassword] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    phone_number: '',
    employee_id: '',
    otp: '',
    license_number: ''
  });
  const [error, setError] = useState<string | null>(null);
  const { t } = useLanguage();
  const { signUp, signIn, sendDriverOTP, loading } = useAuth();

  if (!isOpen) return null;

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      if (activeTab === 'passenger') {
        if (isSignup) {
          await signUp('passenger', {
            email: formData.email,
            password: formData.password,
            full_name: formData.full_name,
            phone_number: formData.phone_number
          });
        } else {
          await signIn('passenger', {
            email: formData.email,
            password: formData.password
          });
        }
      } else {
        if (isSignup) {
          await signUp('driver', {
            employee_id: formData.employee_id,
            full_name: formData.full_name,
            phone_number: formData.phone_number,
            license_number: formData.license_number
          });
          setError('Registration submitted! Please wait for admin verification.');
          return;
        } else {
          await signIn('driver', {
            employee_id: formData.employee_id,
            otp: formData.otp
          });
        }
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleSendOTP = async () => {
    if (!formData.employee_id) {
      setError('Please enter your Employee ID');
      return;
    }

    try {
      const response = await sendDriverOTP(formData.employee_id);
      setOtpSent(true);
      setError(null);
      // For demo purposes, show the OTP
      if (response.debug_otp) {
        alert(`Demo OTP: ${response.debug_otp}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send OTP');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 overflow-hidden transform transition-all duration-300">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors duration-200"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="bg-gradient-to-r from-teal-500 to-cyan-500 px-8 pt-8 pb-6">
          <h2 className="text-2xl font-bold text-white mb-2">
            {activeTab === 'passenger' 
              ? (isSignup ? 'Create Passenger Account' : t('passengerWelcome'))
              : (isSignup ? 'Driver Registration' : t('driverWelcome'))
            }
          </h2>
          <p className="text-teal-100">
            {activeTab === 'passenger' 
              ? (isSignup ? 'Join thousands of happy commuters' : t('passengerSubtext'))
              : (isSignup ? 'Register as a verified driver' : t('driverSubtext'))
            }
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-gray-50 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('passenger')}
            className={`flex-1 flex items-center justify-center gap-2 py-4 font-semibold transition-all duration-200 ${
              activeTab === 'passenger'
                ? 'bg-white text-teal-600 border-b-2 border-teal-500'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <User size={18} />
            {t('passengerTab')}
          </button>
          <button
            onClick={() => setActiveTab('driver')}
            className={`flex-1 flex items-center justify-center gap-2 py-4 font-semibold transition-all duration-200 ${
              activeTab === 'driver'
                ? 'bg-white text-teal-600 border-b-2 border-teal-500'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <UserCheck size={18} />
            {t('driverTab')}
          </button>
        </div>

        {/* Form */}
        <div className="p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          <form onSubmit={handleLogin} className="space-y-6">
            {activeTab === 'passenger' ? (
              <>
                {isSignup && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="text"
                        value={formData.full_name}
                        onChange={(e) => handleInputChange('full_name', e.target.value)}
                        placeholder="Enter your full name"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                        required
                      />
                    </div>
                  </div>
                )}
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    {t('emailLabel')}
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder={t('emailPlaceholder')}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    {t('passwordLabel')}
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      placeholder={t('passwordPlaceholder')}
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  
                  {isSignup && (
                    <div className="space-y-2 mt-4">
                      <label className="text-sm font-medium text-gray-700">
                        Phone Number (Optional)
                      </label>
                      <input
                        type="tel"
                        value={formData.phone_number}
                        onChange={(e) => handleInputChange('phone_number', e.target.value)}
                        placeholder="+91 9876543210"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>
                  )}
                  
                  {!isSignup && (
                    <div className="text-right">
                    <a href="#" className="text-sm text-teal-600 hover:underline">
                      {t('forgotPassword')}
                    </a>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                {isSignup && (
                  <>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Full Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input
                          type="text"
                          value={formData.full_name}
                          onChange={(e) => handleInputChange('full_name', e.target.value)}
                          placeholder="Enter your full name"
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={formData.phone_number}
                        onChange={(e) => handleInputChange('phone_number', e.target.value)}
                        placeholder="+91 9876543210"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        License Number
                      </label>
                      <input
                        type="text"
                        value={formData.license_number}
                        onChange={(e) => handleInputChange('license_number', e.target.value)}
                        placeholder="DL1234567890"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                        required
                      />
                    </div>
                  </>
                )}
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    {t('driverIdLabel')}
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      value={formData.employee_id}
                      onChange={(e) => handleInputChange('employee_id', e.target.value)}
                      placeholder={t('driverIdPlaceholder')}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                      required
                    />
                  </div>
                </div>

                {!isSignup && (
                  <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    {t('otpLabel')}
                  </label>
                  <div className="flex gap-2">
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      value={formData.otp}
                      onChange={(e) => handleInputChange('otp', e.target.value)}
                      placeholder={t('otpPlaceholder')}
                      className="flex-1 pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                      maxLength={6}
                      required
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleSendOTP}
                    disabled={!formData.employee_id || loading}
                    className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                  >
                    {otpSent ? 'Resend' : 'Send OTP'}
                  </button>
                  </div>
                  </div>
                )}
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {isSignup ? 'Creating account...' : 'Logging in...'}
                </div>
              ) : (
                isSignup ? (activeTab === 'passenger' ? 'Create Account' : 'Register') : t('loginButton')
              )}
            </button>

            {activeTab === 'passenger' && !isSignup && (
              <>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500">{t('orSignInWith')}</span>
                  </div>
                </div>

                <button
                  type="button"
                  className="w-full flex items-center justify-center gap-3 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors duration-200"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span className="font-medium text-gray-700">Continue with Google</span>
                </button>
              </>
            )}
            
            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setIsSignup(!isSignup);
                  setError(null);
                  setOtpSent(false);
                }}
                className="text-sm text-teal-600 hover:underline"
              >
                {isSignup 
                  ? `Already have an account? Sign in`
                  : `Don't have an account? Sign up`
                }
              </button>
            </div>

            {activeTab === 'driver' && !isSignup && (
              <p className="text-xs text-center text-gray-500 mt-4">
                {t('driverHelpText')}
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;