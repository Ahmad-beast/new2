import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check, Star, Zap, Crown, CreditCard, Smartphone, Copy, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import toast from 'react-hot-toast';

const Pricing: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const plans = [
    {
      id: 'free',
      name: 'Free Trial',
      price: 'Free',
      duration: 'Forever',
      features: [
        '3-5 voice generations',
        'Basic voice models',
        'Standard quality',
        'Community support'
      ],
      icon: <Star className="h-5 w-5 sm:h-6 sm:w-6" />,
      color: 'border-gray-200 dark:border-gray-600',
      buttonColor: 'bg-gray-600 hover:bg-gray-700',
      popular: false
    },
    {
      id: 'daily',
      name: '1 Day',
      price: 'Rs. 99',
      duration: '1 Day',
      features: [
        '10 voice generations',
        'All voice models',
        'Premium quality',
        'Priority support',
        'Download in multiple formats'
      ],
      icon: <Zap className="h-5 w-5 sm:h-6 sm:w-6" />,
      color: 'border-blue-200 dark:border-blue-600',
      buttonColor: 'bg-blue-600 hover:bg-blue-700',
      popular: false
    },
    {
      id: 'weekly',
      name: '7 Days',
      price: 'Rs. 200',
      duration: '7 Days',
      features: [
        '20 voice generations',
        'Advanced voice customization',
        'Batch processing',
        'API access',
        'Priority queue'
      ],
      icon: <Zap className="h-5 w-5 sm:h-6 sm:w-6" />,
      color: 'border-purple-200 dark:border-purple-600 ring-2 ring-purple-500',
      buttonColor: 'bg-purple-600 hover:bg-purple-700',
      popular: true
    },
    {
      id: 'biweekly',
      name: '15 Days',
      price: 'Rs. 350',
      duration: '15 Days',
      features: [
        '29 voice generations',
        'Custom voice training',
        'Team collaboration',
        'Advanced analytics',
        'White-label options'
      ],
      icon: <Crown className="h-5 w-5 sm:h-6 sm:w-6" />,
      color: 'border-green-200 dark:border-green-600',
      buttonColor: 'bg-green-600 hover:bg-green-700',
      popular: false
    },
    {
      id: 'monthly',
      name: '30 Days',
      price: 'Rs. 499',
      duration: '30 Days',
      features: [
        'Unlimited voice generations',
        'Unlimited voice models',
        'Premium support',
        'Custom integrations',
        'Dedicated account manager'
      ],
      icon: <Crown className="h-5 w-5 sm:h-6 sm:w-6" />,
      color: 'border-yellow-200 dark:border-yellow-600',
      buttonColor: 'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700',
      popular: false
    }
  ];

  const handlePlanSelect = (plan: any) => {
    if (plan.id === 'free') {
      if (!user) {
        navigate('/login');
      } else {
        toast.success('You are already on the free plan!');
      }
      return;
    }

    if (!user) {
      navigate('/login');
      return;
    }

    setSelectedPlan(plan);
    setShowPaymentModal(true);
  };

  const copyAccountNumber = () => {
    navigator.clipboard.writeText('0306-4482383');
    setCopied(true);
    toast.success('Account number copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const PaymentModal = () => {
    const [transactionId, setTransactionId] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handlePaymentSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      
      if (!transactionId.trim()) {
        toast.error('Please enter the transaction ID');
        return;
      }

      setSubmitting(true);

      try {
        // Save payment request to Firestore
        await addDoc(collection(db, 'payments'), {
          uid: user?.uid,
          userEmail: user?.email,
          plan: selectedPlan.name,
          planDuration: selectedPlan.duration,
          amount: parseInt(selectedPlan.price.replace('Rs. ', '')),
          tid: transactionId.trim(),
          accountType: 'JazzCash',
          accountHolder: 'Muhammad Zubair',
          accountNumber: '0306-4482383',
          status: 'pending',
          createdAt: new Date(),
          timestamp: Date.now()
        });

        toast.success('Payment request submitted successfully! You will be notified once verified.');
        setShowPaymentModal(false);
        setSelectedPlan(null);
        setTransactionId('');
      } catch (error: any) {
        console.error('Error submitting payment:', error);
        toast.error('Failed to submit payment request. Please try again.');
      } finally {
        setSubmitting(false);
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
          <div className="p-4 sm:p-6">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4">
              Complete Payment - {selectedPlan?.name}
            </h3>
            
            <div className="mb-6 p-3 sm:p-4 bg-blue-50 dark:bg-blue-900 rounded-lg border border-blue-200 dark:border-blue-700">
              <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">
                <strong>Plan:</strong> {selectedPlan?.name} ({selectedPlan?.duration})
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                <strong>Amount:</strong> {selectedPlan?.price}
              </p>
            </div>

            {/* Payment Instructions */}
            <div className="mb-6 p-3 sm:p-4 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900 dark:to-red-900 rounded-lg border border-orange-200 dark:border-orange-700">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center text-sm sm:text-base">
                <Smartphone className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-orange-600" />
                Payment Instructions
              </h4>
              
              <div className="space-y-3 text-xs sm:text-sm">
                <div>
                  <label className="font-medium text-gray-700 dark:text-gray-300">Account Title:</label>
                  <p className="text-gray-900 dark:text-white">Muhammad Zubair</p>
                </div>
                
                <div>
                  <label className="font-medium text-gray-700 dark:text-gray-300">Account Number:</label>
                  <div className="flex items-center space-x-2 mt-1">
                    <p className="text-gray-900 dark:text-white font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs sm:text-sm">
                      0306-4482383
                    </p>
                    <button
                      onClick={copyAccountNumber}
                      className="flex items-center space-x-1 px-2 py-1 bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors"
                    >
                      {copied ? <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" /> : <Copy className="h-3 w-3 sm:h-4 sm:w-4" />}
                      <span className="text-xs">{copied ? 'Copied!' : 'Copy'}</span>
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="font-medium text-gray-700 dark:text-gray-300">Account Type:</label>
                  <p className="text-gray-900 dark:text-white">JazzCash</p>
                </div>
              </div>

              <div className="mt-4 p-2 sm:p-3 bg-yellow-50 dark:bg-yellow-900 rounded border border-yellow-200 dark:border-yellow-700">
                <p className="text-xs text-yellow-700 dark:text-yellow-300">
                  <strong>Instructions:</strong> Send {selectedPlan?.price} to the above JazzCash number and enter the transaction ID below.
                </p>
              </div>
            </div>

            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Transaction ID (TID) *
                </label>
                <input
                  type="text"
                  required
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                  placeholder="Enter your transaction ID"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  You'll receive this after completing the JazzCash payment
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
                <button
                  type="submit"
                  disabled={submitting || !transactionId.trim()}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm sm:text-base"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Submitting...
                    </>
                  ) : (
                    'Submit Payment Request'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  disabled={submitting}
                  className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors disabled:opacity-50 text-sm sm:text-base"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
            Choose Your Perfect Plan
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-xs sm:max-w-2xl mx-auto px-4 sm:px-0">
            Flexible pricing options to suit creators of all sizes. Start free and upgrade anytime.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6 lg:gap-8">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative bg-white dark:bg-gray-800 rounded-2xl border ${plan.color} p-4 sm:p-6 lg:p-8 hover:shadow-xl transition-all duration-300 ${
                plan.popular ? 'lg:transform lg:scale-105 lg:mt-4 lg:mb-4' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 sm:-top-4 lg:-top-6 left-1/2 transform -translate-x-1/2 z-20">
                  <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-medium shadow-lg whitespace-nowrap">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center">
                <div className={`inline-flex p-2 sm:p-3 rounded-full ${plan.popular ? 'bg-purple-100 dark:bg-purple-900' : 'bg-gray-100 dark:bg-gray-700'} mb-3 sm:mb-4`}>
                  {plan.icon}
                </div>
                
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {plan.name}
                </h3>
                
                <div className="mb-4 sm:mb-6">
                  <span className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                    {plan.price}
                  </span>
                  {plan.duration !== 'Forever' && (
                    <span className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm block">
                      for {plan.duration}
                    </span>
                  )}
                </div>

                <ul className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                      <Check className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 mr-2 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handlePlanSelect(plan)}
                  className={`block w-full py-2 sm:py-3 px-3 sm:px-4 ${plan.buttonColor} text-white font-semibold rounded-lg transition-colors text-center text-sm sm:text-base`}
                >
                  {plan.name === 'Free Trial' ? 'Start Free' : 'Choose Plan'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Payment Methods Section */}
        <div className="mt-16 sm:mt-20 bg-white dark:bg-gray-800 rounded-2xl p-6 sm:p-8 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white text-center mb-6 sm:mb-8">
            Accepted Payment Methods
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-2xl mx-auto">
            <div className="flex items-center justify-center p-4 sm:p-6 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl text-white">
              <div className="text-center">
                <Smartphone className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2" />
                <div className="text-lg sm:text-2xl font-bold mb-2">JazzCash</div>
                <div className="text-xs sm:text-sm opacity-90">Mobile Wallet Payment</div>
              </div>
            </div>
            
            <div className="flex items-center justify-center p-4 sm:p-6 bg-gradient-to-r from-green-500 to-teal-500 rounded-xl text-white">
              <div className="text-center">
                <CreditCard className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2" />
                <div className="text-lg sm:text-2xl font-bold mb-2">EasyPaisa</div>
                <div className="text-xs sm:text-sm opacity-90">Digital Payment Solution</div>
              </div>
            </div>
          </div>
          
          <p className="text-center text-gray-600 dark:text-gray-400 mt-4 sm:mt-6 text-sm sm:text-base">
            Secure payments processed through our admin panel verification system
          </p>
        </div>

        {/* FAQ Section */}
        <div className="mt-16 sm:mt-20">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white text-center mb-8 sm:mb-12">
            Frequently Asked Questions
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto">
            {[
              {
                question: 'How does the free trial work?',
                answer: 'Get 3-5 voice generations completely free. No credit card required, no time limit.'
              },
              {
                question: 'Can I upgrade my plan anytime?',
                answer: 'Yes! You can upgrade your plan at any time. Your remaining credits will be preserved.'
              },
              {
                question: 'What voice models are available?',
                answer: 'We offer multiple ElevenLabs voice models including different accents, ages, and styles.'
              },
              {
                question: 'How do payments work?',
                answer: 'Send payment to our JazzCash number, submit the transaction ID, and get verified by our admin team.'
              }
            ].map((faq, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm sm:text-base">
                  {faq.question}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && <PaymentModal />}
    </div>
  );
};

export default Pricing;
