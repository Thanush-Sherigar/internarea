import React, { useState } from 'react';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';

export default function ForgotPassword() {
  const [identifier, setIdentifier] = useState('');
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [error, setError] = useState('');

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setGeneratedPassword('');

    if (!identifier.trim()) {
      setError('Please enter your email or phone number.');
      return;
    }

    const today = new Date().toDateString();
    const lastResetDate = localStorage.getItem('lastPasswordResetDate');

    if (lastResetDate === today) {
      setError('You can use this option only once per day.');
      return;
    }

    // Generate new password
    const newPassword = generatePassword();
    
    // Save state
    localStorage.setItem('lastPasswordResetDate', today);
    setGeneratedPassword(newPassword);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
      <NavBar />
      
      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-md border border-gray-100">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Forgot Password</h2>
            <p className="text-gray-500 text-sm">
              Enter your registered email or phone number to reset your password.
            </p>
          </div>

          <form onSubmit={handleReset} className="space-y-6">
            <div>
              <label htmlFor="identifier" className="block text-sm font-medium text-gray-700 mb-1">
                Email or Phone Number
              </label>
              <input
                id="identifier"
                name="identifier"
                type="text"
                autoComplete="email"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                placeholder="john@example.com or +1234567890"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm font-medium border border-red-100 flex items-start gap-2">
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                {error}
              </div>
            )}

            {generatedPassword && (
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 text-green-700 mb-2 font-medium">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  Password Reset Successful!
                </div>
                <p className="text-sm text-green-600 mb-3">
                  Please copy your new secure password below. Make sure to save it somewhere safe.
                </p>
                <div className="bg-white px-4 py-3 rounded border border-green-200 text-center text-xl font-mono tracking-widest text-gray-800 shadow-sm">
                  {generatedPassword}
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition"
            >
              Reset Password
            </button>
          </form>

          <div className="mt-6 text-center">
            <a href="/" className="text-sm text-blue-600 hover:underline font-medium">
              Back to Login
            </a>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
