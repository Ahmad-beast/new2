import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check, Star, Zap, Crown, CreditCard, Smartphone, Copy, CheckCircle, ArrowRight, Sparkles, Users, TrendingUp, Shield, Clock, Gift, Calendar } from 'lucide-react';
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
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  // Base monthly plans with correct yearly calculation - Updated Free plan from 5 to 2 voices
  const basePlans = [
    {
      id: 'free',
      name: 'Free Starter',
      monthlyPrice: 0,
      yearlyPrice: 0,
      duration: 'Forever',
      description: 'Perfect for trying out our AI voice technology',
      features: [
        '2 voice generations', // Updated from 5 to 2
        'Basic voice models',
        'Standard quality audio',
        'Community support',
        'Download in MP3 format'
      ],
      icon: <Gift className="h-6 w-6" />,
      gradient: 'from-gray-400 to-gray-600',
      borderColor: 'border-gray-200 dark:border-gray-600',
      buttonStyle: 'bg-gray-600 hover:bg-gray-700',
      popular: false,
      badge: null
    },
    {
      id: 'daily',
      name: 'Quick Start',
      monthlyPrice: 99,
      yearlyPrice: 99 * 12, // 1188
      yearlyDiscountedPrice: Math.round(99 * 12 * 0.8), // 950 (20% discount)
      duration: billingCycle === 'monthly' ? '1 Day' : '12 Days',
      description: 'Ideal for small projects and testing',
      features: [
        billingCycle === 'monthly' ? '10 voice generations' : '120 voice generations/year',
        'All premium voice models',
        'High-quality audio',
        'Priority support',
        'Multiple download formats',
        'Commercial usage rights'
      ],
      icon: <Zap className="h-6 w-6" />,
      gradient: 'from-blue-500 to-cyan-500',
      borderColor: 'border-blue-200 dark:border-blue-600',
      buttonStyle: 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700',
      popular: false,
      badge: billingCycle === 'yearly' ? '20% OFF' : null
    },
    {
      id: 'weekly',
      name: 'Creator Pro',
      monthlyPrice: 200,
      yearlyPrice: 200 * 12, // 2400
      yearlyDiscountedPrice: Math.round(200 * 12 * 0.8), // 1920 (20% discount)
      duration: billingCycle === 'monthly' ? '7 Days' : '84 Days',
      description: 'Most popular choice for content creators',
      features: [
        billingCycle === 'monthly' ? '20 voice generations' : '240 voice generations/year',
        'Advanced voice customization',
        'Batch processing',
        'API access',
        'Priority generation queue',
        'Custom voice training',
        'Analytics dashboard'
      ],
      icon: <Star className="h-6 w-6" />,
      gradient: 'from-purple-500 to-pink-500',
      borderColor: 'border-purple-200 dark:border-purple-600 ring-2 ring-purple-500',
      buttonStyle: 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700',
      popular: true,
      badge: 'MOST POPULAR'
    },
    {
      id: 'biweekly',
      name: 'Business',
      monthlyPrice: 350,
      yearlyPrice: 350 * 12, // 4200
      yearlyDiscountedPrice: Math.round(350 * 12 * 0.8), // 3360 (20% discount)
      duration: billingCycle === 'monthly' ? '15 Days' : '180 Days',
      description: 'Perfect for growing businesses',
      features: [
        billingCycle === 'monthly' ? '29 voice generations' : '348 voice generations/year',
        'Custom voice cloning',
        'Team collaboration tools',
        'Advanced analytics',
        'White-label options',
        'Dedicated support',
        'Custom integrations'
      ],
      icon: <Users className="h-6 w-6" />,
      gradient: 'from-green-500 to-emerald-500',
      borderColor: 'border-green-200 dark:border-green-600',
      buttonStyle: 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700',
      popular: false,
      badge: billingCycle === 'yearly' ? '20% OFF' : null
    },
    {
      id: 'monthly',
      name: 'Enterprise',
      monthlyPrice: 499,
      yearlyPrice: 499 * 12, // 5988
      yearlyDiscountedPrice: Math.round(499 * 12 * 0.8), // 4790 (20% discount)
      duration: billingCycle === 'monthly' ? '30 Days' : '365 Days',
      description: 'Unlimited power for professionals',
      features: [
        'Unlimited voice generations',
        'All premium features',
        'Custom voice models',
        'Dedicated account manager',
        'SLA guarantee',
        'Custom integrations',
        'Enterprise security',
        billingCycle === 'yearly' ? 'Priority phone support' : 'Email support'
      ],
      icon: <Crown className="h-6 w-6" />,
      gradient: 'from-yellow-500 to-orange-500',
      borderColor: 'border-yellow-200 dark:border-yellow-600',
      buttonStyle: 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600',
      popular: false,
      badge: 'BEST VALUE'
    }
  ];

  // Calculate current plans based on billing cycle
  const plans = basePlans.map(plan => {
    const currentPrice = billingCycle === 'monthly' 
      ? plan.monthlyPrice 
      : plan.yearlyDiscountedPrice || plan.yearlyPrice;
    
    const originalPrice = billingCycle === 'yearly' && plan.monthlyPrice > 0 
      ? plan.yearlyPrice 
      : null;
    
    const savings = billingCycle === 'yearly' && plan.monthlyPrice > 0
      ? plan.yearlyPrice - (plan.yearlyDiscountedPrice || plan.yearlyPrice)
      : 0;
    
    return {
      ...plan,
      price: plan.monthlyPrice === 0 ? 'Free' : `Rs. ${currentPrice}`,
      originalPrice: originalPrice ? `Rs. ${originalPrice}` : null,
      actualAmount: currentPrice,
      billingCycle: billingCycle,
      savings: savings
    };
  });

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
        await addDoc(collection(db, 'payments'), {
          uid: user?.uid,
          userEmail: user?.email,
          plan: selectedPlan.name,
          planDuration: selectedPlan.duration,
          amount: selectedPlan.actualAmount,
          billingCycle: selectedPlan.billingCycle,
          originalAmount: selectedPlan.originalPrice ? parseInt(selectedPlan.originalPrice.replace('Rs. ', '')) : null,
          savings: selectedPlan.savings || 0,
          tid: transactionId.trim(),
          accountType: 'NayaPay',
          accountHolder: 'Ahmad Fraz',
          accountNumber: '03064482383',
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
        <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
          <div className="p-6 sm:p-8">
            <div className="text-center mb-6">
              <div className={`inline-flex p-3 rounded-full bg-gradient-to-r ${selectedPlan?.gradient} mb-4`}>
                <CreditCard className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Complete Your Purchase
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {selectedPlan?.name} - {selectedPlan?.billingCycle === 'yearly' ? 'Yearly' : 'Monthly'} Plan
              </p>
            </div>
            
            <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900 dark:to-purple-900 rounded-xl border border-blue-200 dark:border-blue-700">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Plan:</span>
                <span className="font-semibold text-gray-900 dark:text-white">{selectedPlan?.name}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Billing:</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {selectedPlan?.billingCycle === 'yearly' ? 'Yearly' : 'Monthly'}
                  {selectedPlan?.billingCycle === 'yearly' && (
                    <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                      20% OFF
                    </span>
                  )}
                </span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Duration:</span>
                <span className="font-semibold text-gray-900 dark:text-white">{selectedPlan?.duration}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Amount:</span>
                <div className="text-right">
                  <span className="text-lg font-bold text-gray-900 dark:text-white">{selectedPlan?.price}</span>
                  {selectedPlan?.originalPrice && (
                    <span className="text-sm text-gray-500 line-through ml-2">{selectedPlan.originalPrice}</span>
                  )}
                </div>
              </div>
              
              {selectedPlan?.billingCycle === 'yearly' && selectedPlan?.savings > 0 && (
                <div className="mt-3 p-2 bg-green-50 dark:bg-green-900 rounded border border-green-200 dark:border-green-700">
                  <p className="text-xs text-green-700 dark:text-green-300 text-center">
                    💰 You save Rs. {selectedPlan.savings} with yearly billing!
                  </p>
                </div>
              )}
            </div>

            {/* Payment Instructions */}
            <div className="mb-6 p-4 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900 dark:to-red-900 rounded-xl border border-orange-200 dark:border-orange-700">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center text-base">
                <Smartphone className="h-5 w-5 mr-2 text-orange-600" />
                Payment Instructions
              </h4>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center p-3 bg-white dark:bg-gray-800 rounded-lg">
                  <span className="font-medium text-gray-700 dark:text-gray-300">Account Title:</span>
                  <span className="text-gray-900 dark:text-white font-semibold">Muhammad Zubair</span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-white dark:bg-gray-800 rounded-lg">
                  <span className="font-medium text-gray-700 dark:text-gray-300">Account Number:</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-900 dark:text-white font-mono font-semibold">0306-4482383</span>
                    <button
                      onClick={copyAccountNumber}
                      className="flex items-center space-x-1 px-2 py-1 bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors"
                    >
                      {copied ? <CheckCircle className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      <span className="text-xs">{copied ? 'Copied!' : 'Copy'}</span>
                    </button>
                  </div>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-white dark:bg-gray-800 rounded-lg">
                  <span className="font-medium text-gray-700 dark:text-gray-300">Payment Method:</span>
                  <span className="text-gray-900 dark:text-white font-semibold">JazzCash</span>
                </div>
              </div>

              <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900 rounded-lg border border-yellow-200 dark:border-yellow-700">
                <p className="text-xs text-yellow-700 dark:text-yellow-300">
                  <strong>Step 1:</strong> Send {selectedPlan?.price} to the above JazzCash number<br/>
                  <strong>Step 2:</strong> Enter the transaction ID below<br/>
                  <strong>Step 3:</strong> Wait for admin verification (usually within 2-4 hours)
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
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your transaction ID"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  You'll receive this after completing the JazzCash payment
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 pt-4">
                <button
                  type="submit"
                  disabled={submitting || !transactionId.trim()}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-semibold"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Submit Payment Request
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  disabled={submitting}
                  className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 py-3 px-4 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors disabled:opacity-50 font-semibold"
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-full mb-6">
            <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400 mr-2" />
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
              Special Launch Pricing - Limited Time
            </span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Choose Your
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Perfect Plan</span>
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Unlock the power of AI voice generation with flexible pricing designed for creators, businesses, and enterprises
          </p>
        </div>

        {/* Enhanced Billing Toggle - Moved to separate container with proper spacing */}
        <div className="flex justify-center mb-16">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Choose Your Billing Cycle
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Save up to 20% with yearly billing
              </p>
            </div>
            
            <div className="inline-flex items-center p-1 bg-gray-100 dark:bg-gray-700 rounded-xl shadow-inner">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-6 py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  billingCycle === 'monthly'
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-md transform scale-105'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                }`}
              >
                <Calendar className="h-4 w-4 inline mr-2" />
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-6 py-3 rounded-lg text-sm font-semibold transition-all duration-200 relative ${
                  billingCycle === 'yearly'
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-md transform scale-105'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                }`}
              >
                <Calendar className="h-4 w-4 inline mr-2" />
                Yearly
                <span className="ml-2 text-xs bg-gradient-to-r from-green-500 to-emerald-500 text-white px-2 py-1 rounded-full font-bold">
                  Save 20%
                </span>
              </button>
            </div>

            {/* Savings Indicator */}
            {billingCycle === 'yearly' && (
              <div className="mt-4 inline-flex items-center px-4 py-2 bg-green-50 dark:bg-green-900 rounded-full border border-green-200 dark:border-green-700">
                <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400 mr-2" />
                <span className="text-sm font-medium text-green-700 dark:text-green-300">
                  🎉 You're saving up to Rs. 1,198 per plan with yearly billing!
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Pricing Cards - Fixed spacing and layout with proper badge positioning */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 lg:gap-8 mb-16">
          {plans.map((plan, index) => (
            <div
              key={`${plan.id}-${billingCycle}`}
              className={`relative bg-white dark:bg-gray-800 rounded-2xl border-2 ${plan.borderColor} p-6 lg:p-8 hover:shadow-2xl transition-all duration-300 ${
                plan.popular ? 'lg:transform lg:scale-105 lg:z-10' : ''
              }`}
              style={{
                // Increased margin top for popular cards to prevent any overlap
                marginTop: plan.popular ? '3rem' : '0',
                marginBottom: plan.popular ? '3rem' : '0'
              }}
            >
              {/* Badge - Fixed positioning with higher z-index and better spacing */}
              {plan.badge && (
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 z-30">
                  <span className={`px-4 py-2 rounded-full text-xs font-bold text-white shadow-lg whitespace-nowrap ${
                    plan.popular ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-gradient-to-r from-green-500 to-emerald-500'
                  }`}>
                    {plan.badge}
                  </span>
                </div>
              )}

              {/* Billing Cycle Indicator - Fixed positioning */}
              {billingCycle === 'yearly' && plan.id !== 'free' && (
                <div className="absolute top-4 right-4 z-20">
                  <div className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full text-xs font-medium">
                    Yearly
                  </div>
                </div>
              )}

              <div className="text-center">
                {/* Icon */}
                <div className={`inline-flex p-3 rounded-full bg-gradient-to-r ${plan.gradient} mb-4`}>
                  <div className="text-white">
                    {plan.icon}
                  </div>
                </div>
                
                {/* Plan Name */}
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {plan.name}
                </h3>
                
                {/* Description */}
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {plan.description}
                </p>
                
                {/* Pricing */}
                <div className="mb-6">
                  <div className="flex items-center justify-center space-x-2">
                    <span className="text-3xl font-bold text-gray-900 dark:text-white">
                      {plan.price}
                    </span>
                    {plan.originalPrice && (
                      <span className="text-lg text-gray-500 line-through">
                        {plan.originalPrice}
                      </span>
                    )}
                  </div>
                  {plan.duration !== 'Forever' && (
                    <div className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                      <span>for {plan.duration}</span>
                      {billingCycle === 'yearly' && plan.id !== 'free' && plan.savings > 0 && (
                        <div className="text-green-600 dark:text-green-400 text-xs font-medium mt-1">
                          💰 Save Rs. {plan.savings}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8 text-left">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start text-sm text-gray-600 dark:text-gray-300">
                      <Check className="h-4 w-4 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <button
                  onClick={() => handlePlanSelect(plan)}
                  className={`w-full py-3 px-4 ${plan.buttonStyle} text-white font-semibold rounded-lg transition-all transform hover:scale-105 shadow-lg hover:shadow-xl`}
                >
                  {plan.name === 'Free Starter' ? 'Start Free' : `Choose ${billingCycle === 'yearly' ? 'Yearly' : 'Monthly'}`}
                  <ArrowRight className="h-4 w-4 ml-2 inline" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Billing Comparison */}
        {billingCycle === 'yearly' && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900 dark:to-emerald-900 rounded-2xl p-8 border border-green-200 dark:border-green-700 mb-16">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                🎉 Yearly Savings Breakdown
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {plans.slice(1).map((plan, index) => (
                  <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-4 text-lg">{plan.name}</h4>
                    <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex justify-between">
                        <span>Monthly × 12:</span>
                        <span className="font-mono">Rs. {plan.yearlyPrice}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Yearly Price:</span>
                        <span className="font-mono">Rs. {plan.actualAmount}</span>
                      </div>
                      <div className="border-t pt-2 flex justify-between text-green-600 dark:text-green-400 font-semibold">
                        <span>You Save:</span>
                        <span className="font-mono">Rs. {plan.savings}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-gray-600 dark:text-gray-400 mt-6 text-lg">
                💡 <strong>Total possible savings:</strong> Up to Rs. 1,198 per year with our Enterprise plan!
              </p>
            </div>
          </div>
        )}

        {/* Trust Indicators */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700 mb-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex p-3 rounded-full bg-green-100 dark:bg-green-900 mb-4">
                <Shield className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Secure Payments
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Your payments are processed securely through our verified admin panel system
              </p>
            </div>
            
            <div className="text-center">
              <div className="inline-flex p-3 rounded-full bg-blue-100 dark:bg-blue-900 mb-4">
                <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Quick Activation
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Plans are activated within 2-4 hours after payment verification
              </p>
            </div>
            
            <div className="text-center">
              <div className="inline-flex p-3 rounded-full bg-purple-100 dark:bg-purple-900 mb-4">
                <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Flexible Billing
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Switch between monthly and yearly billing anytime with prorated adjustments
              </p>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-8 text-white mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8">
            Accepted Payment Methods
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-xl p-6 text-center">
              <Smartphone className="h-12 w-12 mx-auto mb-4" />
              <div className="text-xl font-bold mb-2">JazzCash</div>
              <div className="text-sm opacity-90">Mobile Wallet Payment</div>
              <div className="text-xs opacity-75 mt-2">Instant & Secure</div>
            </div>
            
            <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-xl p-6 text-center">
              <CreditCard className="h-12 w-12 mx-auto mb-4" />
              <div className="text-xl font-bold mb-2">EasyPaisa</div>
              <div className="text-sm opacity-90">Digital Payment Solution</div>
              <div className="text-xs opacity-75 mt-2">Fast & Reliable</div>
            </div>
          </div>
          
          <p className="text-center mt-6 text-sm opacity-90">
            All payments are verified by our admin team within 2-4 hours
          </p>
        </div>

        {/* FAQ Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-12">
            Frequently Asked Questions
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[
              {
                question: 'How does yearly billing work?',
                answer: 'Pay once for the entire year and save 20% compared to monthly billing. For example, our Creator Pro plan costs Rs. 2,400 monthly (Rs. 200 × 12) but only Rs. 1,920 yearly - saving you Rs. 480!'
              },
              {
                question: 'What are the exact savings with yearly plans?',
                answer: 'Quick Start: Save Rs. 238/year • Creator Pro: Save Rs. 480/year • Business: Save Rs. 840/year • Enterprise: Save Rs. 1,198/year'
              },
              {
                question: 'Can I switch between monthly and yearly?',
                answer: 'Yes! You can upgrade to yearly billing anytime. We\'ll prorate your current plan and apply the yearly discount to your remaining time.'
              },
              {
                question: 'What happens if I want to downgrade?',
                answer: 'You can downgrade at the end of your current billing cycle. Your current plan features remain active until the cycle ends.'
              },
              {
                question: 'Are there any setup fees?',
                answer: 'No setup fees, no hidden charges. The price you see is exactly what you pay. Yearly plans include additional savings.'
              },
              {
                question: 'Do you offer refunds for yearly plans?',
                answer: 'Yes! We offer prorated refunds for yearly plans within 30 days if you\'ve used less than 25% of your voice credits.'
              }
            ].map((faq, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 text-left">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                  {faq.question}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Final CTA */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              Ready to Transform Your Content?
            </h2>
            <p className="text-lg text-blue-100 mb-6">
              Join thousands of creators using AI Voice Generator
              {billingCycle === 'yearly' && (
                <span className="block text-yellow-200 font-semibold mt-2">
                  🎉 Start with yearly billing and save up to Rs. 1,198 today!
                </span>
              )}
            </p>
            <Link
              to="/login"
              className="inline-flex items-center px-8 py-4 bg-white text-blue-600 font-bold rounded-lg hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg"
            >
              Get Started Free
              <ArrowRight className="h-5 w-5 ml-2" />
            </Link>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && <PaymentModal />}
    </div>
  );
};

export default Pricing;
