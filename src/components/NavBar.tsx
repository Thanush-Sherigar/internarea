import { signInWithPopup } from 'firebase/auth';
import { auth, provider } from '../firebase/firebase';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { login, logout } from "../Feature/UserSlice";
import { toast } from 'react-toastify';
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from "firebase/auth";
import axios from 'axios';
import { UAParser } from 'ua-parser-js';

const NavBar = () => {
  const dispatch = useDispatch();
  const { isLoggedIn, userInfo } = useSelector((state: RootState) => state.user);

  // Language & OTP State
  const [showLangOtpModal, setShowLangOtpModal] = useState(false);
  const [emailForOtp, setEmailForOtp] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [loadingOtp, setLoadingOtp] = useState(false);
  const [currentLang, setCurrentLang] = useState('en');

  // Login Environment Rules State
  const [showLoginOtpModal, setShowLoginOtpModal] = useState(false);
  const [pendingLoginUser, setPendingLoginUser] = useState<any>(null);
  const [loginOtpInput, setLoginOtpInput] = useState('');
  const [loadingLoginOtp, setLoadingLoginOtp] = useState(false);
  const [testBypassMobile, setTestBypassMobile] = useState(false); // For testing mobile restrictions

  useEffect(() => {
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
    return () => unsubscribe();
  }, [dispatch]);

  useEffect(() => {
    const match = document.cookie.match(/googtrans=\/en\/([a-zA-Z-]+)/);
    if (match && match[1]) {
      setCurrentLang(match[1]);
    }
  }, []);

  const dispatchAndLogHistory = async (user: any) => {
    dispatch(login({
      uid: user.uid,
      name: user.name || user.displayName,
      email: user.email,
      photo: user.photo || user.photoURL
    }));

    toast.success("Welcome back!");

    // Parse UA
    const parser = new UAParser();
    const result = parser.getResult();
    
    try {
      await axios.post('http://localhost:5000/api/auth/log-history', {
        email: user.email,
        name: user.name || user.displayName,
        os: result.os.name || 'Unknown OS',
        browser: result.browser.name || 'Unknown Browser',
        deviceType: result.device.type || 'desktop'
      });
    } catch (e) {
      console.error("Failed to log history", e);
    }
  };

  const checkMobileTimeRestriction = () => {
    if (testBypassMobile) return true; // Bypass for testing

    const now = new Date();
    // Convert to IST (UTC + 5:30)
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istTime = new Date(now.getTime() + now.getTimezoneOffset() * 60000 + istOffset);
    const hours = istTime.getHours();

    return hours >= 10 && hours < 13; // 10:00 AM to 1:00 PM (13:00)
  };

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const parser = new UAParser();
      const uaResult = parser.getResult();
      const deviceType = uaResult.device.type || 'desktop';
      const browserName = uaResult.browser.name || 'Unknown';

      // Rule 1: Mobile time restriction
      if (deviceType === 'mobile') {
        if (!checkMobileTimeRestriction()) {
          toast.error("Mobile login is only allowed between 10:00 AM and 1:00 PM IST.");
          return; // Block
        }
      }

      // Rule 2: Chrome requires OTP
      if (browserName === 'Chrome') {
        setPendingLoginUser(user);
        setShowLoginOtpModal(true);
        // Request OTP automatically
        toast.info("Chrome detected. Sending verification OTP...");
        try {
          const res = await axios.post('http://localhost:5000/api/otp/send', { email: user.email });
          if (res.data.success) {
            console.log("Login OTP Preview URL:", res.data.previewUrl);
            alert(`OTP Sent to verify Chrome login!\nCheck the browser console to see the Ethereal Email preview URL.`);
          }
        } catch (e) {
          toast.error("Failed to send OTP for Chrome verification.");
        }
        return; // Wait for OTP
      }

      // If passing rules and not Chrome, proceed directly
      await dispatchAndLogHistory(user);

    } catch (error: any) {
      if (error.code === 'auth/popup-blocked') {
        alert('Popup was blocked. Please allow popups for this site.');
      } else if (error.code === 'auth/cancelled-popup-request') {
        alert('Cancelled popup request. Please try again.');
      } else {
        alert('Login failed: ' + (error.message || 'Unknown error'));
      }
      console.error('Login error:', error);
    }
  };

  const handleVerifyLoginOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginOtpInput || !pendingLoginUser) return;
    setLoadingLoginOtp(true);
    try {
      const response = await axios.post('http://localhost:5000/api/otp/verify', { 
        email: pendingLoginUser.email, 
        otp: loginOtpInput 
      });
      if (response.data.success) {
        toast.success("Chrome login verified!");
        setShowLoginOtpModal(false);
        await dispatchAndLogHistory(pendingLoginUser);
        setPendingLoginUser(null);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Invalid OTP");
    } finally {
      setLoadingLoginOtp(false);
    }
  };

  // ... (Language functions remain same)
  const applyLanguage = (lang: string) => {
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
      if (isLoggedIn && userInfo?.email) setEmailForOtp(userInfo.email);
      else setEmailForOtp('');
      setOtpInput('');
      setShowLangOtpModal(true);
    } else {
      applyLanguage(lang);
    }
  };

  const handleSendLangOtp = async () => {
    if (!emailForOtp.trim()) return toast.error("Please enter a valid email address");
    setLoadingOtp(true);
    try {
      const response = await axios.post('http://localhost:5000/api/otp/send', { email: emailForOtp });
      if (response.data.success) {
        toast.success("OTP sent to your email!");
        console.log("Language OTP Preview URL:", response.data.previewUrl);
        alert(`OTP Sent for French access!\nCheck console.`);
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
                    <a href="/profile" className="text-sm font-medium text-gray-700 hover:text-blue-600">{userInfo?.name}</a>
                    <button
                      onClick={() => dispatch(logout())}
                      className="text-red-500 border border-red-500 px-3 py-1 rounded text-sm hover:bg-red-50 transition"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-4">
                    <label className="flex items-center text-xs text-gray-500 cursor-pointer" title="Testing Toggle for Mobile 10AM-1PM Rule">
                      <input type="checkbox" checked={testBypassMobile} onChange={(e) => setTestBypassMobile(e.target.checked)} className="mr-1" />
                      Bypass Mobile Time Check
                    </label>
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

      {/* French Language OTP Modal */}
      {showLangOtpModal && (
        <div className="fixed inset-0 z-[100] overflow-y-auto flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-gray-900 bg-opacity-75 backdrop-blur-sm" onClick={() => setShowLangOtpModal(false)}></div>
          <div className="relative bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full z-10 text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Secure Language Access</h2>
            <p className="text-gray-500 text-sm mb-6">Accessing the French translation requires email verification.</p>
            <div className="mb-4 text-left">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Email Address</label>
              <div className="flex gap-2">
                <input type="email" value={emailForOtp} onChange={(e) => setEmailForOtp(e.target.value)} placeholder="Enter email" className="flex-1 px-3 py-2 border border-gray-300 rounded-lg outline-none text-sm" />
                <button type="button" onClick={handleSendLangOtp} disabled={loadingOtp || !emailForOtp} className="bg-gray-100 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 disabled:opacity-50">Send OTP</button>
              </div>
            </div>
            <form onSubmit={handleVerifyLangOtp}>
              <input type="text" maxLength={6} required value={otpInput} onChange={e => setOtpInput(e.target.value.replace(/\D/g, ''))} className="w-full text-center text-2xl tracking-[0.5em] font-mono px-4 py-2 border border-gray-300 rounded-lg outline-none mb-6" placeholder="------" />
              <button type="submit" disabled={loadingOtp || otpInput.length !== 6} className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50">Verify & Translate</button>
            </form>
            <button onClick={() => { setShowLangOtpModal(false); setCurrentLang('en'); }} className="mt-4 text-sm text-gray-500">Cancel</button>
          </div>
        </div>
      )}

      {/* Chrome Login OTP Modal */}
      {showLoginOtpModal && pendingLoginUser && (
        <div className="fixed inset-0 z-[100] overflow-y-auto flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-gray-900 bg-opacity-75 backdrop-blur-sm"></div>
          <div className="relative bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full z-10 text-center">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-100">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Chrome Security Check</h2>
            <p className="text-gray-500 text-sm mb-6">Since you are logging in via Google Chrome, we require an OTP sent to your email <strong>{pendingLoginUser.email}</strong>.</p>
            <form onSubmit={handleVerifyLoginOtp}>
              <input type="text" maxLength={6} required value={loginOtpInput} onChange={e => setLoginOtpInput(e.target.value.replace(/\D/g, ''))} className="w-full text-center text-2xl tracking-[0.5em] font-mono px-4 py-2 border border-gray-300 rounded-lg outline-none mb-6" placeholder="------" />
              <button type="submit" disabled={loadingLoginOtp || loginOtpInput.length !== 6} className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50">Verify & Complete Login</button>
            </form>
            <button onClick={() => { setShowLoginOtpModal(false); setPendingLoginUser(null); }} className="mt-4 text-sm text-gray-500">Cancel Login</button>
          </div>
        </div>
      )}
    </>
  );
};
export default NavBar;