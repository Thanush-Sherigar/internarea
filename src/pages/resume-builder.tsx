import React, { useState } from 'react';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { toast } from 'react-toastify';
import axios from 'axios';

export default function ResumeBuilder() {
  const { isLoggedIn, userInfo } = useSelector((state: RootState) => state.user);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    qualifications: '',
    experience: '',
    personalInfo: '',
    photo: ''
  });

  // Flow State
  const [step, setStep] = useState<'FORM' | 'OTP' | 'PAYMENT' | 'RESUME'>('FORM');
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState('');

  // Pre-fill email from logged-in user if available
  React.useEffect(() => {
    if (userInfo && userInfo.email) {
      setFormData(prev => ({ ...prev, email: userInfo.email, name: userInfo.name || '' }));
    }
  }, [userInfo]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Step 1: Request OTP
  const handleGenerateClick = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn) {
      toast.error("Please login to use the Resume Builder.");
      return;
    }
    if (!formData.name || !formData.email || !formData.qualifications) {
      toast.error("Please fill in the required fields (Name, Email, Qualifications).");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/otp/send', {
        email: formData.email
      });
      if (response.data.success) {
        toast.success(response.data.message);
        console.log("OTP Preview URL:", response.data.previewUrl);
        alert(`OTP Sent to your email!\n(Testing Note: Check the browser console to see the Ethereal Email preview URL!)`);
        setStep('OTP');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) return toast.error("Please enter the OTP.");

    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/otp/verify', {
        email: formData.email,
        otp
      });
      if (response.data.success) {
        toast.success("OTP Verified Successfully!");
        setStep('PAYMENT');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Mock Payment
  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Reusing the payment endpoint we built, bypassing time check for resume
      const response = await axios.post('http://localhost:5000/api/payment/checkout', {
        planId: 'resume_creation',
        planName: 'Resume Creation',
        amount: 50,
        userEmail: formData.email,
        bypassTimeCheck: true // Resumes aren't time-restricted like subscription plans
      });

      if (response.data.success) {
        toast.success("Payment Successful! Your resume is ready.");
        setStep('RESUME');
      }
    } catch (error: any) {
      toast.error("Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <NavBar />

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
        
        {step === 'FORM' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-blue-600 p-8 text-white">
              <h1 className="text-3xl font-bold mb-2">Professional Resume Builder</h1>
              <p className="text-blue-100">Create an outstanding resume automatically attached to your profile. (Premium Feature: ₹50)</p>
            </div>
            
            <form onSubmit={handleGenerateClick} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <input type="text" name="name" required value={formData.name} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Registered Email *</label>
                  <input type="email" name="email" required value={formData.email} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-none" readOnly={!!userInfo?.email} />
                  <p className="text-xs text-gray-500 mt-1">An OTP will be sent here before payment.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Photo URL</label>
                  <input type="text" name="photo" placeholder="https://..." value={formData.photo} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Qualifications *</label>
                <textarea name="qualifications" required rows={3} placeholder="E.g., B.Tech in Computer Science, 2020-2024" value={formData.qualifications} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-none resize-none" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Work Experience / Projects</label>
                <textarea name="experience" rows={4} placeholder="Describe your internships, projects, or relevant experience..." value={formData.experience} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-none resize-none" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Personal Information (Skills, Hobbies, etc.)</label>
                <textarea name="personalInfo" rows={3} placeholder="Skills: React, Node.js. Hobbies: Reading..." value={formData.personalInfo} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-none resize-none" />
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold shadow-md hover:bg-blue-700 transition disabled:opacity-70 flex items-center gap-2"
                >
                  {loading ? 'Processing...' : 'Generate Resume (₹50)'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* OTP Modal */}
        {step === 'OTP' && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-gray-900 bg-opacity-75 backdrop-blur-sm"></div>
            <div className="relative bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full z-10 text-center">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify Your Email</h2>
              <p className="text-gray-500 text-sm mb-6">We've sent a 6-digit OTP to <strong>{formData.email}</strong>. Enter it below to proceed to payment.</p>
              
              <form onSubmit={handleVerifyOtp}>
                <input 
                  type="text" 
                  maxLength={6} 
                  required 
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                  className="w-full text-center text-3xl tracking-[0.5em] font-mono px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-none mb-6"
                  placeholder="------"
                />
                <button type="submit" disabled={loading || otp.length !== 6} className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg shadow-md hover:bg-blue-700 disabled:opacity-50 transition">
                  {loading ? 'Verifying...' : 'Verify & Proceed to Pay'}
                </button>
              </form>
              <button onClick={() => setStep('FORM')} className="mt-4 text-sm text-gray-500 hover:text-gray-800">Cancel</button>
            </div>
          </div>
        )}

        {/* Payment Modal */}
        {step === 'PAYMENT' && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-gray-900 bg-opacity-75 backdrop-blur-sm"></div>
            <div className="relative bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full z-10">
              <div className="flex justify-between items-center mb-6 border-b pb-4">
                <div className="flex items-center gap-2 text-blue-600 font-bold text-xl">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
                  MockPay Gateway
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4 mb-6 border border-blue-100 flex justify-between items-center">
                <div>
                  <p className="text-sm text-blue-800 font-medium">Total Payable</p>
                  <p className="text-xs text-blue-600 mt-1">Premium Resume Generation</p>
                </div>
                <div className="text-2xl font-bold text-blue-900">₹50</div>
              </div>

              <form onSubmit={handlePayment} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                  <input type="text" required placeholder="4242 4242 4242 4242" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-none font-mono" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <input type="text" required placeholder="MM/YY" className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none font-mono" />
                  <input type="password" required placeholder="CVV" className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none font-mono" />
                </div>
                <button type="submit" disabled={loading} className="w-full py-3 px-4 mt-6 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg shadow-md transition">
                  {loading ? 'Processing...' : 'Pay ₹50 securely'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Generated Resume */}
        {step === 'RESUME' && (
          <div className="bg-white w-full max-w-4xl mx-auto rounded-xl shadow-2xl overflow-hidden border border-gray-200 my-8">
            {/* Header */}
            <div className="bg-gray-800 text-white p-10 flex flex-col md:flex-row items-center gap-8">
              {formData.photo ? (
                <img src={formData.photo} alt={formData.name} className="w-32 h-32 rounded-full object-cover border-4 border-gray-600 shadow-lg" />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gray-600 border-4 border-gray-500 flex items-center justify-center text-4xl font-bold">
                  {formData.name.charAt(0)}
                </div>
              )}
              <div className="text-center md:text-left">
                <h1 className="text-4xl font-black tracking-tight">{formData.name}</h1>
                <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-4 text-sm text-gray-300">
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"></path><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"></path></svg>
                    {formData.email}
                  </div>
                  {formData.phone && (
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"></path></svg>
                      {formData.phone}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-10 grid grid-cols-1 md:grid-cols-3 gap-10">
              
              <div className="md:col-span-2 space-y-8">
                <section>
                  <h2 className="text-2xl font-bold text-gray-900 border-b-2 border-gray-200 pb-2 mb-4">Qualifications</h2>
                  <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {formData.qualifications}
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 border-b-2 border-gray-200 pb-2 mb-4">Experience & Projects</h2>
                  <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {formData.experience || "No experience listed."}
                  </div>
                </section>
              </div>

              <div className="space-y-8">
                <section>
                  <h2 className="text-xl font-bold text-gray-900 border-b-2 border-gray-200 pb-2 mb-4">Personal Info</h2>
                  <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {formData.personalInfo || "No additional information provided."}
                  </div>
                </section>

                <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <p className="text-xs text-blue-600 font-semibold uppercase tracking-wider text-center">System Note</p>
                  <p className="text-sm text-blue-800 mt-2 text-center">
                    This verified resume has been automatically attached to your profile for future applications.
                  </p>
                </div>
              </div>
              
            </div>
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}
