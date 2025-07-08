import React, { useState, useEffect } from 'react';
import { 
  Users, 
  CreditCard, 
  TrendingUp, 
  DollarSign, 
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  Plus,
  Save,
  X,
  AlertTriangle,
  Settings,
  Tag,
  Percent,
  Gift,
  Timer,
  Zap,
  Crown,
  Star
} from 'lucide-react';
import { 
  collection, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  addDoc,
  query, 
  orderBy, 
  where,
  onSnapshot,
  setDoc
} from 'firebase/firestore';
import { db } from '../config/firebase';
import toast from 'react-hot-toast';

interface User {
  id: string;
  email: string;
  displayName: string;
  accountStatus: 'free' | 'pro';
  plan?: string;
  planAmount?: number;
  voicesGenerated: number;
  createdAt: Date;
  status: 'active' | 'inactive';
  isActive: boolean;
}

interface Payment {
  id: string;
  uid: string;
  userEmail: string;
  plan: string;
  amount: number;
  tid: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  planDuration?: string;
  billingCycle?: string;
  originalAmount?: number;
  savings?: number;
}

interface BroadcastMessage {
  id?: string;
  title: string;
  description: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

interface PricingPlan {
  id: string;
  name: string;
  basePrice: number;
  currentPrice: number;
  duration: string;
  features: string[];
  voiceLimit: number;
  isActive: boolean;
  discountType?: 'percentage' | 'fixed' | null;
  discountValue?: number;
  discountExpiry?: Date | null;
  discountDescription?: string;
  popular?: boolean;
  badge?: string;
  icon?: string;
  gradient?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'payments' | 'pricing' | 'broadcast'>('overview');
  const [users, setUsers] = useState<User[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [pricingPlans, setPricingPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<PricingPlan | null>(null);
  const [broadcastMessage, setBroadcastMessage] = useState<BroadcastMessage>({
    title: '',
    description: '',
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'admin'
  });

  // Pricing form state
  const [pricingForm, setPricingForm] = useState<Partial<PricingPlan>>({
    name: '',
    basePrice: 0,
    currentPrice: 0,
    duration: '',
    features: [],
    voiceLimit: 0,
    isActive: true,
    discountType: null,
    discountValue: 0,
    discountExpiry: null,
    discountDescription: '',
    popular: false,
    badge: '',
    icon: 'Zap',
    gradient: 'from-blue-500 to-cyan-500'
  });

  const [newFeature, setNewFeature] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadUsers(),
        loadPayments(),
        loadPricingPlans()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const usersData = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      })) as User[];
      setUsers(usersData);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const loadPayments = async () => {
    try {
      const paymentsQuery = query(collection(db, 'payments'), orderBy('createdAt', 'desc'));
      const paymentsSnapshot = await getDocs(paymentsQuery);
      const paymentsData = paymentsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      })) as Payment[];
      setPayments(paymentsData);
    } catch (error) {
      console.error('Error loading payments:', error);
    }
  };

  const loadPricingPlans = async () => {
    try {
      const plansQuery = query(collection(db, 'pricingPlans'), orderBy('basePrice', 'asc'));
      const plansSnapshot = await getDocs(plansQuery);
      const plansData = plansSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        discountExpiry: doc.data().discountExpiry?.toDate() || null
      })) as PricingPlan[];
      setPricingPlans(plansData);
    } catch (error) {
      console.error('Error loading pricing plans:', error);
    }
  };

  const handleUserStatusToggle = async (userId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      await updateDoc(doc(db, 'users', userId), {
        status: newStatus,
        isActive: newStatus === 'active'
      });
      
      toast.success(`User ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`);
      loadUsers();
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error('Failed to update user status');
    }
  };

  const handlePaymentAction = async (paymentId: string, action: 'approve' | 'reject') => {
    try {
      const payment = payments.find(p => p.id === paymentId);
      if (!payment) return;

      await updateDoc(doc(db, 'payments', paymentId), {
        status: action === 'approve' ? 'approved' : 'rejected',
        processedAt: new Date(),
        processedBy: 'admin'
      });

      if (action === 'approve') {
        // Update user's plan
        const planExpiry = new Date();
        const durationDays = getPlanDurationDays(payment.plan, payment.amount);
        planExpiry.setDate(planExpiry.getDate() + durationDays);

        await updateDoc(doc(db, 'users', payment.uid), {
          accountStatus: 'pro',
          plan: payment.plan,
          planAmount: payment.amount,
          planExpiry: planExpiry,
          upgradedAt: new Date(),
          voicesGenerated: 0,
          voiceGenerationsLimit: getPlanVoiceLimit(payment.plan, payment.amount),
          subscriptionPlan: 'paid'
        });
      }

      toast.success(`Payment ${action}d successfully`);
      loadPayments();
      loadUsers();
    } catch (error) {
      console.error(`Error ${action}ing payment:`, error);
      toast.error(`Failed to ${action} payment`);
    }
  };

  const getPlanDurationDays = (plan: string, amount: number) => {
    if (amount === 99) return 1;
    if (amount === 200) return 7;
    if (amount === 350) return 15;
    if (amount === 499) return 30;
    return 0;
  };

  const getPlanVoiceLimit = (plan: string, amount: number) => {
    if (amount === 99) return 10;
    if (amount === 200) return 20;
    if (amount === 350) return 29;
    if (amount === 499) return 999999;
    return 2;
  };

  const handleBroadcastSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Deactivate all existing messages first
      const existingMessages = await getDocs(collection(db, 'broadcastMessages'));
      const updatePromises = existingMessages.docs.map(doc => 
        updateDoc(doc.ref, { active: false })
      );
      await Promise.all(updatePromises);

      // Add new message
      await addDoc(collection(db, 'broadcastMessages'), {
        ...broadcastMessage,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      toast.success('Broadcast message sent successfully!');
      setShowBroadcastModal(false);
      setBroadcastMessage({
        title: '',
        description: '',
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'admin'
      });
    } catch (error) {
      console.error('Error sending broadcast:', error);
      toast.error('Failed to send broadcast message');
    }
  };

  const handlePricingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const planData = {
        ...pricingForm,
        currentPrice: calculateCurrentPrice(pricingForm.basePrice || 0, pricingForm.discountType, pricingForm.discountValue || 0),
        updatedAt: new Date(),
        createdAt: editingPlan ? editingPlan.createdAt : new Date()
      };

      if (editingPlan) {
        await updateDoc(doc(db, 'pricingPlans', editingPlan.id), planData);
        toast.success('Pricing plan updated successfully!');
      } else {
        await addDoc(collection(db, 'pricingPlans'), {
          ...planData,
          createdAt: new Date()
        });
        toast.success('Pricing plan created successfully!');
      }

      setShowPricingModal(false);
      setEditingPlan(null);
      resetPricingForm();
      loadPricingPlans();
    } catch (error) {
      console.error('Error saving pricing plan:', error);
      toast.error('Failed to save pricing plan');
    }
  };

  const calculateCurrentPrice = (basePrice: number, discountType: string | null, discountValue: number) => {
    if (!discountType || !discountValue) return basePrice;
    
    if (discountType === 'percentage') {
      return Math.round(basePrice * (1 - discountValue / 100));
    } else if (discountType === 'fixed') {
      return Math.max(0, basePrice - discountValue);
    }
    
    return basePrice;
  };

  const resetPricingForm = () => {
    setPricingForm({
      name: '',
      basePrice: 0,
      currentPrice: 0,
      duration: '',
      features: [],
      voiceLimit: 0,
      isActive: true,
      discountType: null,
      discountValue: 0,
      discountExpiry: null,
      discountDescription: '',
      popular: false,
      badge: '',
      icon: 'Zap',
      gradient: 'from-blue-500 to-cyan-500'
    });
    setNewFeature('');
  };

  const handleEditPlan = (plan: PricingPlan) => {
    setEditingPlan(plan);
    setPricingForm({
      ...plan,
      discountExpiry: plan.discountExpiry
    });
    setShowPricingModal(true);
  };

  const handleDeletePlan = async (planId: string) => {
    if (!confirm('Are you sure you want to delete this pricing plan?')) return;
    
    try {
      await deleteDoc(doc(db, 'pricingPlans', planId));
      toast.success('Pricing plan deleted successfully!');
      loadPricingPlans();
    } catch (error) {
      console.error('Error deleting pricing plan:', error);
      toast.error('Failed to delete pricing plan');
    }
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      setPricingForm(prev => ({
        ...prev,
        features: [...(prev.features || []), newFeature.trim()]
      }));
      setNewFeature('');
    }
  };

  const removeFeature = (index: number) => {
    setPricingForm(prev => ({
      ...prev,
      features: prev.features?.filter((_, i) => i !== index) || []
    }));
  };

  const iconOptions = [
    { value: 'Zap', label: 'Zap', icon: <Zap className="h-4 w-4" /> },
    { value: 'Crown', label: 'Crown', icon: <Crown className="h-4 w-4" /> },
    { value: 'Star', label: 'Star', icon: <Star className="h-4 w-4" /> },
    { value: 'Gift', label: 'Gift', icon: <Gift className="h-4 w-4" /> },
    { value: 'Users', label: 'Users', icon: <Users className="h-4 w-4" /> }
  ];

  const gradientOptions = [
    { value: 'from-blue-500 to-cyan-500', label: 'Blue to Cyan' },
    { value: 'from-purple-500 to-pink-500', label: 'Purple to Pink' },
    { value: 'from-green-500 to-emerald-500', label: 'Green to Emerald' },
    { value: 'from-yellow-500 to-orange-500', label: 'Yellow to Orange' },
    { value: 'from-red-500 to-pink-500', label: 'Red to Pink' },
    { value: 'from-gray-400 to-gray-600', label: 'Gray' }
  ];

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.displayName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.tid.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.status === 'active').length,
    proUsers: users.filter(u => u.accountStatus === 'pro').length,
    totalPayments: payments.length,
    pendingPayments: payments.filter(p => p.status === 'pending').length,
    approvedPayments: payments.filter(p => p.status === 'approved').length,
    totalRevenue: payments.filter(p => p.status === 'approved').reduce((sum, p) => sum + p.amount, 0)
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage users, payments, pricing, and system settings
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8 border-b border-gray-200 dark:border-gray-700">
            {[
              { id: 'overview', label: 'Overview', icon: <TrendingUp className="h-4 w-4" /> },
              { id: 'users', label: 'Users', icon: <Users className="h-4 w-4" /> },
              { id: 'payments', label: 'Payments', icon: <CreditCard className="h-4 w-4" /> },
              { id: 'pricing', label: 'Pricing', icon: <Tag className="h-4 w-4" /> },
              { id: 'broadcast', label: 'Broadcast', icon: <Settings className="h-4 w-4" /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Users</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalUsers}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pro Users</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.proUsers}</p>
                  </div>
                  <Crown className="h-8 w-8 text-purple-600" />
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Payments</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pendingPayments}</p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-600" />
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Revenue</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">Rs. {stats.totalRevenue}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Payments</h3>
              <div className="space-y-4">
                {payments.slice(0, 5).map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{payment.userEmail}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{payment.plan} - Rs. {payment.amount}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      payment.status === 'approved' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                      payment.status === 'pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' :
                      'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                    }`}>
                      {payment.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            {/* Users Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Plan
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Voices Used
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredUsers.map((user) => (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {user.displayName}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {user.email}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            user.accountStatus === 'pro' 
                              ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
                              : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                          }`}>
                            {user.accountStatus === 'pro' ? user.plan || 'Pro' : 'Free'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {user.voicesGenerated || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            user.status === 'active'
                              ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                              : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                          }`}>
                            {user.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleUserStatusToggle(user.id, user.status)}
                            className={`px-3 py-1 rounded text-xs font-medium ${
                              user.status === 'active'
                                ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900 dark:text-red-300'
                                : 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900 dark:text-green-300'
                            }`}
                          >
                            {user.status === 'active' ? 'Deactivate' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Payments Tab */}
        {activeTab === 'payments' && (
          <div className="space-y-6">
            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search payments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            {/* Payments Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Plan
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Transaction ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredPayments.map((payment) => (
                      <tr key={payment.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {payment.userEmail}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">{payment.plan}</div>
                          {payment.planDuration && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">{payment.planDuration}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            Rs. {payment.amount}
                          </div>
                          {payment.originalAmount && payment.savings && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              Was Rs. {payment.originalAmount} (Saved Rs. {payment.savings})
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-mono">
                          {payment.tid}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            payment.status === 'approved' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                            payment.status === 'pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' :
                            'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                          }`}>
                            {payment.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {payment.status === 'pending' && (
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handlePaymentAction(payment.id, 'approve')}
                                className="px-3 py-1 bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900 dark:text-green-300 rounded text-xs font-medium"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handlePaymentAction(payment.id, 'reject')}
                                className="px-3 py-1 bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900 dark:text-red-300 rounded text-xs font-medium"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Pricing Tab */}
        {activeTab === 'pricing' && (
          <div className="space-y-6">
            {/* Header with Add Button */}
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Pricing Management</h2>
              <button
                onClick={() => {
                  resetPricingForm();
                  setShowPricingModal(true);
                }}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add New Plan
              </button>
            </div>

            {/* Pricing Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pricingPlans.map((plan) => (
                <div key={plan.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{plan.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{plan.duration}</p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditPlan(plan)}
                        className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-lg transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeletePlan(plan.id)}
                        className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl font-bold text-gray-900 dark:text-white">
                        Rs. {plan.currentPrice}
                      </span>
                      {plan.basePrice !== plan.currentPrice && (
                        <span className="text-lg text-gray-500 line-through">
                          Rs. {plan.basePrice}
                        </span>
                      )}
                    </div>
                    {plan.discountType && plan.discountValue && (
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-sm bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 px-2 py-1 rounded-full">
                          {plan.discountType === 'percentage' ? `${plan.discountValue}% OFF` : `Rs. ${plan.discountValue} OFF`}
                        </span>
                        {plan.discountExpiry && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            Until {plan.discountExpiry.toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {plan.voiceLimit === 999999 ? 'Unlimited' : plan.voiceLimit} voice generations
                    </p>
                    <div className="space-y-1">
                      {plan.features.slice(0, 3).map((feature, index) => (
                        <div key={index} className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <CheckCircle className="h-3 w-3 text-green-500 mr-2 flex-shrink-0" />
                          {feature}
                        </div>
                      ))}
                      {plan.features.length > 3 && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          +{plan.features.length - 3} more features
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      plan.isActive
                        ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                        : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                    }`}>
                      {plan.isActive ? 'Active' : 'Inactive'}
                    </span>
                    {plan.popular && (
                      <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300 rounded-full">
                        Popular
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Broadcast Tab */}
        {activeTab === 'broadcast' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Broadcast Messages</h2>
              <button
                onClick={() => setShowBroadcastModal(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Send Broadcast
              </button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Send Message to All Users
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Broadcast messages will be shown to all users when they visit the dashboard. 
                Only one message can be active at a time.
              </p>
              <div className="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mr-2" />
                  <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                    Messages are shown as modal popups and can be dismissed by users.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pricing Modal */}
        {showPricingModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {editingPlan ? 'Edit Pricing Plan' : 'Add New Pricing Plan'}
                  </h3>
                  <button
                    onClick={() => {
                      setShowPricingModal(false);
                      setEditingPlan(null);
                      resetPricingForm();
                    }}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <form onSubmit={handlePricingSubmit} className="space-y-6">
                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Plan Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={pricingForm.name || ''}
                        onChange={(e) => setPricingForm(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                        placeholder="e.g., Creator Pro"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Duration *
                      </label>
                      <input
                        type="text"
                        required
                        value={pricingForm.duration || ''}
                        onChange={(e) => setPricingForm(prev => ({ ...prev, duration: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                        placeholder="e.g., 7 Days, 1 Month"
                      />
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Base Price (Rs.) *
                      </label>
                      <input
                        type="number"
                        required
                        min="0"
                        value={pricingForm.basePrice || ''}
                        onChange={(e) => {
                          const basePrice = parseInt(e.target.value) || 0;
                          setPricingForm(prev => ({
                            ...prev,
                            basePrice,
                            currentPrice: calculateCurrentPrice(basePrice, prev.discountType, prev.discountValue || 0)
                          }));
                        }}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                        placeholder="200"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Voice Limit *
                      </label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={pricingForm.voiceLimit || ''}
                        onChange={(e) => setPricingForm(prev => ({ ...prev, voiceLimit: parseInt(e.target.value) || 0 }))}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                        placeholder="20 (or 999999 for unlimited)"
                      />
                    </div>
                  </div>

                  {/* Discount Settings */}
                  <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                      <Percent className="h-5 w-5 mr-2" />
                      Discount Settings
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Discount Type
                        </label>
                        <select
                          value={pricingForm.discountType || ''}
                          onChange={(e) => {
                            const discountType = e.target.value || null;
                            setPricingForm(prev => ({
                              ...prev,
                              discountType: discountType as any,
                              currentPrice: calculateCurrentPrice(prev.basePrice || 0, discountType, prev.discountValue || 0)
                            }));
                          }}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                        >
                          <option value="">No Discount</option>
                          <option value="percentage">Percentage</option>
                          <option value="fixed">Fixed Amount</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Discount Value
                        </label>
                        <input
                          type="number"
                          min="0"
                          max={pricingForm.discountType === 'percentage' ? 100 : undefined}
                          value={pricingForm.discountValue || ''}
                          onChange={(e) => {
                            const discountValue = parseInt(e.target.value) || 0;
                            setPricingForm(prev => ({
                              ...prev,
                              discountValue,
                              currentPrice: calculateCurrentPrice(prev.basePrice || 0, prev.discountType, discountValue)
                            }));
                          }}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                          placeholder={pricingForm.discountType === 'percentage' ? '20' : '50'}
                          disabled={!pricingForm.discountType}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Current Price
                        </label>
                        <div className="px-4 py-2 bg-gray-100 dark:bg-gray-600 rounded-lg text-gray-900 dark:text-white font-semibold">
                          Rs. {pricingForm.currentPrice || pricingForm.basePrice || 0}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Discount Expiry Date
                        </label>
                        <input
                          type="date"
                          value={pricingForm.discountExpiry ? pricingForm.discountExpiry.toISOString().split('T')[0] : ''}
                          onChange={(e) => setPricingForm(prev => ({ 
                            ...prev, 
                            discountExpiry: e.target.value ? new Date(e.target.value) : null 
                          }))}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                          disabled={!pricingForm.discountType}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Discount Description
                        </label>
                        <input
                          type="text"
                          value={pricingForm.discountDescription || ''}
                          onChange={(e) => setPricingForm(prev => ({ ...prev, discountDescription: e.target.value }))}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                          placeholder="Limited time offer"
                          disabled={!pricingForm.discountType}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Features */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Features
                    </label>
                    <div className="space-y-2 mb-3">
                      {pricingForm.features?.map((feature, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={feature}
                            onChange={(e) => {
                              const newFeatures = [...(pricingForm.features || [])];
                              newFeatures[index] = e.target.value;
                              setPricingForm(prev => ({ ...prev, features: newFeatures }));
                            }}
                            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                          />
                          <button
                            type="button"
                            onClick={() => removeFeature(index)}
                            className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={newFeature}
                        onChange={(e) => setNewFeature(e.target.value)}
                        placeholder="Add a feature..."
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                      />
                      <button
                        type="button"
                        onClick={addFeature}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Add
                      </button>
                    </div>
                  </div>

                  {/* Appearance */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Icon
                      </label>
                      <select
                        value={pricingForm.icon || 'Zap'}
                        onChange={(e) => setPricingForm(prev => ({ ...prev, icon: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                      >
                        {iconOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Gradient
                      </label>
                      <select
                        value={pricingForm.gradient || 'from-blue-500 to-cyan-500'}
                        onChange={(e) => setPricingForm(prev => ({ ...prev, gradient: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                      >
                        {gradientOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Settings */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Badge Text
                      </label>
                      <input
                        type="text"
                        value={pricingForm.badge || ''}
                        onChange={(e) => setPricingForm(prev => ({ ...prev, badge: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                        placeholder="MOST POPULAR"
                      />
                    </div>

                    <div className="flex items-center space-x-4">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={pricingForm.popular || false}
                          onChange={(e) => setPricingForm(prev => ({ ...prev, popular: e.target.checked }))}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Popular Plan</span>
                      </label>
                    </div>

                    <div className="flex items-center space-x-4">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={pricingForm.isActive !== false}
                          onChange={(e) => setPricingForm(prev => ({ ...prev, isActive: e.target.checked }))}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Active</span>
                      </label>
                    </div>
                  </div>

                  {/* Submit Buttons */}
                  <div className="flex space-x-4 pt-6">
                    <button
                      type="submit"
                      className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center justify-center"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {editingPlan ? 'Update Plan' : 'Create Plan'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowPricingModal(false);
                        setEditingPlan(null);
                        resetPricingForm();
                      }}
                      className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 py-3 px-4 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors font-semibold"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Broadcast Modal */}
        {showBroadcastModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    Send Broadcast Message
                  </h3>
                  <button
                    onClick={() => setShowBroadcastModal(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <form onSubmit={handleBroadcastSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={broadcastMessage.title}
                      onChange={(e) => setBroadcastMessage(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                      placeholder="Important Announcement"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Message *
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={broadcastMessage.description}
                      onChange={(e) => setBroadcastMessage(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                      placeholder="Your message to all users..."
                    />
                  </div>

                  <div className="flex space-x-4 pt-4">
                    <button
                      type="submit"
                      className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                    >
                      Send Broadcast
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowBroadcastModal(false)}
                      className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 py-3 px-4 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors font-semibold"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;