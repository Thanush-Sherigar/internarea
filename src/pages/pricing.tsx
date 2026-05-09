import React, { useState } from 'react';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { toast } from 'react-toastify';
import axios from 'axios';

const plans = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    features: ['1 Internship Application per month', 'Basic Support'],
    buttonText: 'Current Plan',
    popular: false
  },
  {
    id: 'bronze',
    name: 'Bronze',
    price: 100,
    features: ['3 Internship Applications per month', 'Standard Support'],
    buttonText: 'Subscribe to Bronze',
    popular: false
  },
  {
    id: 'silver',
    name: 'Silver',
    price: 300,
    features: ['5 Internship Applications per month', 'Priority Support', 'Resume Review'],
    buttonText: 'Subscribe to Silver',
    popular: true
  },
  {
    id: 'gold',
    name: 'Gold',
    price: 1000,
    features: ['Unlimited Internship Applications', '24/7 Dedicated Support', '1-on-1 Mentorship', 'Verified Badge'],
    buttonText: 'Subscribe to Gold',
    popular: false
  }
];

export default function Pricing() {
  const { isLoggedIn, userInfo } = useSelector((state: RootState) => state.user);
  
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [bypassTimeCheck, setBypassTimeCheck] = useState(true); // Default to true for testing

  const handleSelectPlan = (plan: any) => {
    if (plan.price === 0) return; // Free plan
    if (!isLoggedIn) {
      toast.error('Please login to subscribe!');
      return;
    }
    setSelectedPlan(plan);
    setShowModal(true);
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/payment/checkout', {
        planId: selectedPlan.id,
        planName: selectedPlan.name,
        amount: selectedPlan.price,
        userEmail: userInfo.email || 'test@example.com',
        bypassTimeCheck
      });

      if (response.data.success) {
        toast.success(response.data.message);
        console.log("Invoice Preview URL:", response.data.emailPreviewUrl);
        
        // Show success alert to user with the preview link since they can't access Ethereal otherwise easily
        alert(`Payment Successful!\nTransaction ID: ${response.data.transactionId}\n\nInvoice sent to email.\n(Testing Note: Check the browser console to see the Ethereal Email preview URL!)`);
        
        setShowModal(false);
        setSelectedPlan(null);
      }
    } catch (error: any) {
      if (error.response && error.response.data) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Payment failed due to an unexpected error.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <NavBar />
      
      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          
          <div className="text-center mb-12">
            <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
              Simple, transparent pricing
            </h1>
            <p className="mt-4 text-xl text-gray-600">
              Choose the plan that best fits your internship application needs.
            </p>
            
            {/* Testing Toggle */}
            <div className="mt-6 inline-flex items-center gap-2 bg-yellow-50 px-4 py-2 rounded-full border border-yellow-200">
              <span className="text-sm font-medium text-yellow-800">Testing Mode: Bypass 10AM-11AM Time Check</span>
              <button 
                onClick={() => setBypassTimeCheck(!bypassTimeCheck)}
                className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${bypassTimeCheck ? 'bg-blue-600' : 'bg-gray-200'}`}
              >
                <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${bypassTimeCheck ? 'translate-x-4' : 'translate-x-0'}`}></span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {plans.map((plan) => (
              <div 
                key={plan.id} 
                className={`bg-white rounded-2xl shadow-sm border flex flex-col ${plan.popular ? 'border-blue-500 ring-2 ring-blue-500 ring-opacity-50 relative' : 'border-gray-200'}`}
              >
                {plan.popular && (
                  <div className="absolute top-0 inset-x-0 transform -translate-y-1/2">
                    <div className="inline-block bg-blue-500 text-white text-xs font-bold uppercase tracking-wide px-3 py-1 rounded-full shadow-sm">
                      Most Popular
                    </div>
                  </div>
                )}
                <div className="p-8 flex-1">
                  <h3 className="text-xl font-semibold text-gray-900">{plan.name}</h3>
                  <div className="mt-4 flex items-baseline text-5xl font-extrabold text-gray-900">
                    ₹{plan.price}
                    <span className="ml-1 text-xl font-medium text-gray-500">/mo</span>
                  </div>
                  <ul className="mt-8 space-y-4">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start">
                        <svg className="flex-shrink-0 h-6 w-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                        <p className="ml-3 text-base text-gray-700">{feature}</p>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="p-8 bg-gray-50 rounded-b-2xl border-t border-gray-100">
                  <button
                    onClick={() => handleSelectPlan(plan)}
                    disabled={plan.price === 0}
                    className={`w-full py-3 px-4 rounded-xl font-medium text-center transition ${
                      plan.price === 0 
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : plan.popular 
                          ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md' 
                          : 'bg-white text-blue-600 border border-blue-200 hover:bg-blue-50'
                    }`}
                  >
                    {plan.buttonText}
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      </main>

      {/* Mock Payment Gateway Modal */}
      {showModal && selectedPlan && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-75 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>

            <div className="relative inline-block w-full max-w-md p-8 overflow-hidden text-left align-middle transition-all transform bg-white rounded-2xl shadow-2xl z-10">
              
              <div className="flex justify-between items-center mb-6 border-b pb-4">
                <div className="flex items-center gap-2 text-blue-600 font-bold text-xl">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
                  MockPay Gateway
                </div>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 transition">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
              </div>

              <div className="bg-blue-50 rounded-lg p-4 mb-6 border border-blue-100 flex justify-between items-center">
                <div>
                  <p className="text-sm text-blue-800 font-medium">Total Payable</p>
                  <p className="text-xs text-blue-600 mt-1">{selectedPlan.name} Plan Subscription</p>
                </div>
                <div className="text-2xl font-bold text-blue-900">₹{selectedPlan.price}</div>
              </div>

              <form onSubmit={handlePaymentSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                  <div className="relative">
                    <input type="text" required placeholder="4242 4242 4242 4242" maxLength={19} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono" />
                    <svg className="absolute right-3 top-3 w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Expiry</label>
                    <input type="text" required placeholder="MM/YY" maxLength={5} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                    <input type="password" required placeholder="•••" maxLength={3} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono" />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cardholder Name</label>
                  <input type="text" required placeholder="John Doe" defaultValue={userInfo?.name || ''} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 mt-6 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg shadow-md transition flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-wait"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    <>Pay ₹{selectedPlan.price}</>
                  )}
                </button>
              </form>
              
              <div className="mt-4 text-center text-xs text-gray-500 flex items-center justify-center gap-1">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                Payments are securely processed. Mock Environment.
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
