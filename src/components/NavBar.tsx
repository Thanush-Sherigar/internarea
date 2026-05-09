import { signInWithPopup } from 'firebase/auth';
import { auth, provider } from '../firebase/firebase';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { login, logout } from "../Feature/UserSlice";
import { toast } from 'react-toastify';
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from "firebase/auth";
import axios from 'axios';

const NavBar = () => {
  const dispatch = useDispatch();
  const { isLoggedIn, userInfo } = useSelector((state: RootState) => state.user);

  // Language & OTP State
  const [showLangOtpModal, setShowLangOtpModal] = useState(false);
  const [emailForOtp, setEmailForOtp] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [loadingOtp, setLoadingOtp] = useState(false);
  const [currentLang, setCurrentLang] = useState('en');

  useEffect(() => {
    // This function runs every time the app loads
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        dispatch(login({
          name: user.displayName,
          email: user.email,
          photo: user.photoURL
        }));
      } else {
        dispatch(logout());
      }
    });

    return () => unsubscribe(); // Cleanup the listener
  }, [dispatch]);

  // Read current language from cookie on mount
  useEffect(() => {
    const match = document.cookie.match(/googtrans=\/en\/([a-zA-Z-]+)/);
    if (match && match[1]) {
      setCurrentLang(match[1]);
    }
  }, []);

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      dispatch(login({
        uid: result.user.uid,
        name: result.user.displayName,
        email: result.user.email,
        photo: result.user.photoURL
      }));

      toast.success("Welcome back!");
    } catch (error: any) {
      if (error.code === 'auth/popup-blocked') {
        alert('Popup was blocked. Please allow popups for this site.');
      } else if (error.code === 'auth/cancelled-popup-request') {
        alert('Cancelled popup request. Please try again.');
      } else if (error.code === 'auth/configuration-not-found') {
        alert('Firebase Auth is not configured correctly.');
      } else {
        alert('Login failed: ' + (error.message || 'Unknown error'));
      }
      console.error('Login error:', error);
    }
  };

  const applyLanguage = (lang: string) => {
    // If selecting English and we were already in another language, just clear the cookie
    if (lang === 'en') {
      document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    } else {
      document.cookie = `googtrans=/en/${lang}; path=/`;
    }
    window.location.reload();
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const lang = e.target.value;
    
    if (lang === 'fr') {
      // Secure French Verification
      if (isLoggedIn && userInfo?.email) {
        setEmailForOtp(userInfo.email);
      } else {
        setEmailForOtp(''); // They have to enter it manually
      }
      setOtpInput('');
      setShowLangOtpModal(true);
    } else {
      applyLanguage(lang);
    }
  };

  const handleSendLangOtp = async () => {
    if (!emailForOtp.trim()) {
      return toast.error("Please enter a valid email address");
    }
    setLoadingOtp(true);
    try {
      const response = await axios.post('http://localhost:5000/api/otp/send', { email: emailForOtp });
      if (response.data.success) {
        toast.success("OTP sent to your email!");
        console.log("OTP Preview URL for French Verification:", response.data.previewUrl);
        alert(`OTP Sent for French language access!\nCheck the browser console to see the Ethereal Email preview URL.`);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoadingOtp(false);
    }
  };

  const handleVerifyLangOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpInput) return;
    setLoadingOtp(true);
    try {
      const response = await axios.post('http://localhost:5000/api/otp/verify', { email: emailForOtp, otp: otpInput });
      if (response.data.success) {
        toast.success("French access verified!");
        setShowLangOtpModal(false);
        applyLanguage('fr');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Invalid OTP");
    } finally {
      setLoadingOtp(false);
    }
  };

  return (
    <>
      <nav className="navbar bg-white shadow-md relative z-40">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="text-xl font-bold text-blue-500">Internshala</div>
            <ul className="flex items-center space-x-4">
              <li><a href="/" className="text-gray-600 hover:text-blue-500">Internships</a></li>
              <li><a href="/" className="text-gray-600 hover:text-blue-500">Jobs</a></li>
              <li><a href="/public-space" className="text-gray-600 hover:text-blue-500 font-semibold text-blue-600">Public Space</a></li>
              <li><a href="/pricing" className="text-gray-600 hover:text-blue-500 font-semibold text-blue-600">Pricing</a></li>
              <li><a href="/resume-builder" className="text-gray-600 hover:text-blue-500 font-semibold text-blue-600">Resume Builder</a></li>
              
              {/* Language Selector */}
              <li className="flex items-center ml-4 border-l pl-4 border-gray-200">
                <svg className="w-4 h-4 text-gray-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"></path></svg>
                <select 
                  value={currentLang} 
                  onChange={handleLanguageChange}
                  className="bg-transparent text-sm text-gray-700 outline-none cursor-pointer hover:text-blue-600 notranslate"
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="hi">Hindi</option>
                  <option value="pt">Portuguese</option>
                  <option value="zh-CN">Chinese</option>
                  <option value="fr">French (Secure)</option>
                </select>
              </li>

              <div className="ml-2">
                {isLoggedIn ? (
                  <div className="flex items-center gap-4">
                    <img src={userInfo?.photo || 'https://ui-avatars.com/api/?name=User'} alt="User" className="w-8 h-8 rounded-full" />
                    <span className="text-sm font-medium text-gray-700">{userInfo?.name}</span>
                    <button
                      onClick={() => dispatch(logout())}
                      className="text-red-500 border border-red-500 px-3 py-1 rounded text-sm hover:bg-red-50 transition"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-4">
                    <a href="/forgot-password" className="text-sm text-blue-600 hover:underline font-medium">Forgot Password?</a>
                    <button
                      onClick={handleLogin}
                      className="bg-blue-500 text-white px-4 py-2 rounded text-sm hover:bg-blue-600 transition"
                    >
                      Login with Google
                    </button>
                  </div>
                )}
              </div>
            </ul>
          </div>
        </div>
      </nav>

      {/* French OTP Verification Modal */}
      {showLangOtpModal && (
        <div className="fixed inset-0 z-[100] overflow-y-auto flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-gray-900 bg-opacity-75 backdrop-blur-sm" onClick={() => setShowLangOtpModal(false)}></div>
          <div className="relative bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full z-10 text-center transform transition-all">
            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Secure Language Access</h2>
            <p className="text-gray-500 text-sm mb-6">Accessing the French translation requires email verification.</p>
            
            <div className="mb-4 text-left">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Email Address</label>
              <div className="flex gap-2">
                <input 
                  type="email" 
                  value={emailForOtp} 
                  onChange={(e) => setEmailForOtp(e.target.value)} 
                  placeholder="Enter your email"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                />
                <button 
                  type="button" 
                  onClick={handleSendLangOtp}
                  disabled={loadingOtp || !emailForOtp}
                  className="bg-gray-100 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition disabled:opacity-50"
                >
                  Send OTP
                </button>
              </div>
            </div>

            <form onSubmit={handleVerifyLangOtp}>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1 text-left">Enter 6-Digit OTP</label>
              <input 
                type="text" 
                maxLength={6} 
                required 
                value={otpInput}
                onChange={e => setOtpInput(e.target.value.replace(/\D/g, ''))}
                className="w-full text-center text-2xl tracking-[0.5em] font-mono px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-none mb-6"
                placeholder="------"
              />
              <button type="submit" disabled={loadingOtp || otpInput.length !== 6} className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg shadow-md hover:bg-blue-700 disabled:opacity-50 transition">
                {loadingOtp ? 'Verifying...' : 'Verify & Translate to French'}
              </button>
            </form>
            <button onClick={() => { setShowLangOtpModal(false); setCurrentLang('en'); }} className="mt-4 text-sm text-gray-500 hover:text-gray-800">Cancel</button>
          </div>
        </div>
      )}
    </>
  );
};
export default NavBar;