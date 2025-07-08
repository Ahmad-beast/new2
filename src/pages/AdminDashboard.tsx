import React, { useState, useEffect } from 'react';
import { 
  Users, 
  CreditCard, 
  TrendingUp, 
  Settings, 
  Search,
  Filter,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  DollarSign,
  Calendar,
  BarChart3,
  UserCheck,
  UserX,
  Crown,
  Gift,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Megaphone,
  MessageSquare,
  Bell
} from 'lucide-react';
import { 
  collection, 
  getDocs, 
  doc, 
  updateDoc, 
  addDoc, 
  deleteDoc,
  query, 
  orderBy, 
  where,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';
import toast from 'react-hot-toast';

interface User {
  uid: string;
  email: string;
  displayName: string;
  accountStatus: 'free' | 'pro';
  plan?: string;
  planAmount?: number;
  voicesGenerated: number;
  createdAt: Date;
  upgradedAt?: Date;
  planExpiry?: Date;
  status: 'active' | 'inactive';
  isActive: boolean;
}

interface Payment {
  id: string;
  uid: string;
  userEmail: string;
  plan: string;
  planDuration: string;
  amount: number;
  tid: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  processedAt?: Date;
  processedBy?: string;
  billingCycle?: 'monthly' | 'yearly';
  originalAmount?: number;
  savings?: number;
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

interface BroadcastMessage {
  id: string;
  title: string;
  description: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'payments' | 'pricing' | 'broadcast'>('overview');
  const [users, setUsers] = useState<User[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [pricingPlans, setPricingPlans] = useState<PricingPlan[]>([]);
  const [broadcastMessages, setBroadcastMessages] = useState<BroadcastMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<PricingPlan | null>(null);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [editingBroadcast, setEditingBroadcast] = useState<BroadcastMessage | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadUsers(),
        loadPayments(),
        loadPricingPlans(),
        loadBroadcastMessages()
      ]);
    } catch (error) {
      console.error('Error loading admin data:', error);
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const usersData = usersSnapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        upgradedAt: doc.data().upgradedAt?.toDate() || null,
        planExpiry: doc.data().planExpiry?.toDate() || null,
        status: doc.data().status || 'active',
        isActive: doc.data().isActive !== false
      })) as User[];
      setUsers(usersData);
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Failed to load users');
    }
  };

  const loadPayments = async () => {
    try {
      const paymentsQuery = query(collection(db, 'payments'), orderBy('createdAt', 'desc'));
      const paymentsSnapshot = await getDocs(paymentsQuery);
      const paymentsData = paymentsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        processedAt: doc.data().processedAt?.toDate() || null
      })) as Payment[];
      setPayments(paymentsData);
    } catch (error) {
      console.error('Error loading payments:', error);
      toast.error('Failed to load payments');
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
      toast.error('Failed to load pricing plans');
    }
  };

  const loadBroadcastMessages = async () => {
    try {
      const messagesQuery = query(collection(db, 'broadcastMessages'), orderBy('createdAt', 'desc'));
      const messagesSnapshot = await getDocs(messagesQuery);
      const messagesData = messagesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      })) as BroadcastMessage[];
      setBroadcastMessages(messagesData);
    } catch (error) {
      console.error('Error loading broadcast messages:', error);
      toast.error('Failed to load broadcast messages');
    }
  };

  const handlePaymentAction = async (paymentId: string, action: 'approve' | 'reject') => {
    try {
      const payment = payments.find(p => p.id === paymentId);
      if (!payment) return;

      // Update payment status
      await updateDoc(doc(db, 'payments', paymentId), {
        status: action === 'approve' ? 'approved' : 'rejected',
        processedAt: new Date(),
        processedBy: 'admin'
      });

      if (action === 'approve') {
        // Update user's plan
        const planDuration = getPlanDuration(payment.plan, payment.amount);
        const planExpiry = new Date();
        planExpiry.setDate(planExpiry.getDate() + planDuration);
        
        const voiceLimit = getPlanLimits(payment.plan, payment.amount);

        await updateDoc(doc(db, 'users', payment.uid), {
          accountStatus: 'pro',
          plan: payment.plan,
          planAmount: payment.amount,
          planExpiry: planExpiry,
          upgradedAt: new Date(),
          voicesGenerated: 0,
          voiceGenerationsLimit: voiceLimit === -1 ? 999999 : voiceLimit,
          subscriptionPlan: 'paid'
        });
      }

      toast.success(`Payment ${action}d successfully!`);
      await loadPayments();
      await loadUsers();
    } catch (error) {
      console.error(`Error ${action}ing payment:`, error);
      toast.error(`Failed to ${action} payment`);
    }
  };

  const handleUserStatusToggle = async (userId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      await updateDoc(doc(db, 'users', userId), {
        status: newStatus,
        isActive: newStatus === 'active'
      });

      toast.success(`User ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully!`);
      await loadUsers();
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error('Failed to update user status');
    }
  };

  const getPlanDuration = (plan: string, amount?: number) => {
    if (amount === 99 || plan === '1 Day') return 1;
    if (amount === 200 || plan === '7 Days') return 7;
    if (amount === 350 || plan === '15 Days') return 15;
    if (amount === 499 || plan === '30 Days') return 30;
    return 0;
  };

  const getPlanLimits = (plan: string, amount?: number) => {
    if (amount === 99 || plan === '1 Day') return 10;
    if (amount === 200 || plan === '7 Days') return 20;
    if (amount === 350 || plan === '15 Days') return 29;
    if (amount === 499 || plan === '30 Days') return -1; // Unlimited
    return 2; // Free plan
  };

  const handleSavePricingPlan = async (planData: Partial<PricingPlan>) => {
    try {
      const now = new Date();
      
      if (editingPlan) {
        // Update existing plan
        await updateDoc(doc(db, 'pricingPlans', editingPlan.id), {
          ...planData,
          updatedAt: now,
          discountExpiry: planData.discountExpiry || null
        });
        toast.success('Pricing plan updated successfully!');
      } else {
        // Create new plan
        await addDoc(collection(db, 'pricingPlans'), {
          ...planData,
          createdAt: now,
          updatedAt: now,
          discountExpiry: planData.discountExpiry || null
        });
        toast.success('Pricing plan created successfully!');
      }
      
      setShowPricingModal(false);
      setEditingPlan(null);
      await loadPricingPlans();
    } catch (error) {
      console.error('Error saving pricing plan:', error);
      toast.error('Failed to save pricing plan');
    }
  };

  const handleDeletePricingPlan = async (planId: string) => {
    if (!confirm('Are you sure you want to delete this pricing plan?')) return;
    
    try {
      await deleteDoc(doc(db, 'pricingPlans', planId));
      toast.success('Pricing plan deleted successfully!');
      await loadPricingPlans();
    } catch (error) {
      console.error('Error deleting pricing plan:', error);
      toast.error('Failed to delete pricing plan');
    }
  };

  const handleSaveBroadcastMessage = async (messageData: Partial<BroadcastMessage>) => {
    try {
      const now = new Date();
      
      if (editingBroadcast) {
        // Update existing message
        await updateDoc(doc(db, 'broadcastMessages', editingBroadcast.id), {
          ...messageData,
          updatedAt: now
        });
        toast.success('Broadcast message updated successfully!');
      } else {
        // Create new message
        await addDoc(collection(db, 'broadcastMessages'), {
          ...messageData,
          createdAt: now,
          updatedAt: now,
          createdBy: 'admin'
        });
        toast.success('Broadcast message created successfully!');
      }
      
      setShowBroadcastModal(false);
      setEditingBroadcast(null);
      await loadBroadcastMessages();
    } catch (error) {
      console.error('Error saving broadcast message:', error);
      toast.error('Failed to save broadcast message');
    }
  };

  const handleDeleteBroadcastMessage = async (messageId: string) => {
    if (!confirm('Are you sure you want to delete this broadcast message?')) return;
    
    try {
      await deleteDoc(doc(db, 'broadcastMessages', messageId));
      toast.success('Broadcast message deleted successfully!');
      await loadBroadcastMessages();
    } catch (error) {
      console.error('Error deleting broadcast message:', error);
      toast.error('Failed to delete broadcast message');
    }
  };

  // Filter data based on search and filters
  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.displayName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.tid.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || payment.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  // Calculate statistics
  const stats = {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.status === 'active').length,
    proUsers: users.filter(u => u.accountStatus === 'pro').length,
    totalPayments: payments.length,
    pendingPayments: payments.filter(p => p.status === 'pending').length,
    approvedPayments: payments.filter(p => p.status === 'approved').length,
    totalRevenue: payments.filter(p => p.status === 'approved').reduce((sum, p) => sum + p.amount, 0),
    monthlyRevenue: payments.filter(p => 
      p.status === 'approved' && 
      p.createdAt.getMonth() === new Date().getMonth() &&
      p.createdAt.getFullYear() === new Date().getFullYear()
    ).reduce((sum, p) => sum + p.amount, 0)
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
              { id: 'overview', label: 'Overview', icon: <BarChart3 className="h-4 w-4" /> },
              { id: 'users', label: 'Users', icon: <Users className="h-4 w-4" /> },
              { id: 'payments', label: 'Payments', icon: <CreditCard className="h-4 w-4" /> },
              { id: 'pricing', label: 'Pricing Plans', icon: <DollarSign className="h-4 w-4" /> },
              { id: 'broadcast', label: 'Broadcast', icon: <Megaphone className="h-4 w-4" /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-red-500 text-red-600 dark:text-red-400'
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
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Users</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalUsers}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {stats.activeUsers} active • {stats.proUsers} pro
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Payments</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pendingPayments}</p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-600" />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {stats.approvedPayments} approved total
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Monthly Revenue</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">Rs. {stats.monthlyRevenue}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Rs. {stats.totalRevenue} total
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Plans</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{pricingPlans.filter(p => p.isActive).length}</p>
                  </div>
                  <Crown className="h-8 w-8 text-purple-600" />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {pricingPlans.length} total plans
                </p>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Payments */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Payments</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {payments.slice(0, 5).map((payment) => (
                      <div key={payment.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{payment.userEmail}</p>
                          <p className="text-sm text-gray-500">{payment.plan} - Rs. {payment.amount}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          payment.status === 'approved' ? 'bg-green-100 text-green-700' :
                          payment.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {payment.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recent Users */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Users</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {users.slice(0, 5).map((user) => (
                      <div key={user.uid} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{user.displayName}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {user.accountStatus === 'pro' && (
                            <Crown className="h-4 w-4 text-purple-600" />
                          )}
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {user.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            {/* Search and Filters */}
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
                      <tr key={user.uid}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {user.displayName}
                            </div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {user.accountStatus === 'pro' && (
                              <Crown className="h-4 w-4 text-purple-600 mr-2" />
                            )}
                            <span className="text-sm text-gray-900 dark:text-white">
                              {user.accountStatus === 'pro' ? user.plan || 'Pro' : 'Free'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {user.voicesGenerated || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {user.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleUserStatusToggle(user.uid, user.status)}
                            className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-medium ${
                              user.status === 'active'
                                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                            }`}
                          >
                            {user.status === 'active' ? (
                              <>
                                <UserX className="h-3 w-3 mr-1" />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <UserCheck className="h-3 w-3 mr-1" />
                                Activate
                              </>
                            )}
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
            {/* Search and Filters */}
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
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {payment.plan}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            Rs. {payment.amount}
                            {payment.originalAmount && payment.originalAmount !== payment.amount && (
                              <span className="text-xs text-gray-500 line-through ml-2">
                                Rs. {payment.originalAmount}
                              </span>
                            )}
                          </div>
                          {payment.savings && payment.savings > 0 && (
                            <div className="text-xs text-green-600">
                              Saved Rs. {payment.savings}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900 dark:text-white">
                          {payment.tid}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            payment.status === 'approved' ? 'bg-green-100 text-green-700' :
                            payment.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {payment.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {payment.status === 'pending' && (
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handlePaymentAction(payment.id, 'approve')}
                                className="inline-flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200 text-xs"
                              >
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Approve
                              </button>
                              <button
                                onClick={() => handlePaymentAction(payment.id, 'reject')}
                                className="inline-flex items-center px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 text-xs"
                              >
                                <XCircle className="h-3 w-3 mr-1" />
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

        {/* Pricing Plans Tab */}
        {activeTab === 'pricing' && (
          <div className="space-y-6">
            {/* Header with Add Button */}
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Pricing Plans</h2>
              <button
                onClick={() => {
                  setEditingPlan(null);
                  setShowPricingModal(true);
                }}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Plan
              </button>
            </div>

            {/* Pricing Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pricingPlans.map((plan) => (
                <div key={plan.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{plan.name}</h3>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        Rs. {plan.currentPrice}
                        {plan.basePrice !== plan.currentPrice && (
                          <span className="text-sm text-gray-500 line-through ml-2">
                            Rs. {plan.basePrice}
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setEditingPlan(plan);
                          setShowPricingModal(true);
                        }}
                        className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeletePricingPlan(plan.id)}
                        className="p-1 text-red-600 hover:bg-red-100 rounded"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Duration: {plan.duration}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Voices: {plan.voiceLimit === 999999 ? 'Unlimited' : plan.voiceLimit}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Status: <span className={plan.isActive ? 'text-green-600' : 'text-red-600'}>
                        {plan.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </p>
                  </div>

                  {plan.discountType && (
                    <div className="bg-green-50 dark:bg-green-900 p-3 rounded-lg mb-4">
                      <p className="text-sm text-green-700 dark:text-green-300">
                        {plan.discountType === 'percentage' ? `${plan.discountValue}% OFF` : `Rs. ${plan.discountValue} OFF`}
                      </p>
                      {plan.discountExpiry && (
                        <p className="text-xs text-green-600 dark:text-green-400">
                          Expires: {plan.discountExpiry.toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="space-y-1">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <CheckCircle className="h-3 w-3 text-green-500 mr-2 flex-shrink-0" />
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Broadcast Messages Tab */}
        {activeTab === 'broadcast' && (
          <div className="space-y-6">
            {/* Header with Add Button */}
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Broadcast Messages</h2>
              <button
                onClick={() => {
                  setEditingBroadcast(null);
                  setShowBroadcastModal(true);
                }}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Message
              </button>
            </div>

            {/* Broadcast Messages List */}
            <div className="space-y-4">
              {broadcastMessages.map((message) => (
                <div key={message.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{message.title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          message.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {message.active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 mb-3">{message.description}</p>
                      <p className="text-sm text-gray-500">
                        Created: {message.createdAt.toLocaleDateString()} • 
                        Updated: {message.updatedAt.toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <button
                        onClick={() => {
                          setEditingBroadcast(message);
                          setShowBroadcastModal(true);
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteBroadcastMessage(message.id)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Pricing Plan Modal */}
      {showPricingModal && (
        <PricingPlanModal
          plan={editingPlan}
          onSave={handleSavePricingPlan}
          onClose={() => {
            setShowPricingModal(false);
            setEditingPlan(null);
          }}
        />
      )}

      {/* Broadcast Message Modal */}
      {showBroadcastModal && (
        <BroadcastMessageModal
          message={editingBroadcast}
          onSave={handleSaveBroadcastMessage}
          onClose={() => {
            setShowBroadcastModal(false);
            setEditingBroadcast(null);
          }}
        />
      )}
    </div>
  );
};

// Pricing Plan Modal Component
const PricingPlanModal: React.FC<{
  plan: PricingPlan | null;
  onSave: (plan: Partial<PricingPlan>) => void;
  onClose: () => void;
}> = ({ plan, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: plan?.name || '',
    basePrice: plan?.basePrice || 0,
    currentPrice: plan?.currentPrice || 0,
    duration: plan?.duration || '',
    voiceLimit: plan?.voiceLimit || 0,
    isActive: plan?.isActive ?? true,
    popular: plan?.popular || false,
    badge: plan?.badge || '',
    icon: plan?.icon || 'Zap',
    gradient: plan?.gradient || 'from-blue-500 to-cyan-500',
    discountType: plan?.discountType || null,
    discountValue: plan?.discountValue || 0,
    discountExpiry: plan?.discountExpiry ? plan.discountExpiry.toISOString().split('T')[0] : '',
    discountDescription: plan?.discountDescription || '',
    features: plan?.features || ['']
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const planData = {
      ...formData,
      features: formData.features.filter(f => f.trim() !== ''),
      discountExpiry: formData.discountExpiry ? new Date(formData.discountExpiry) : null,
      discountType: formData.discountType === 'null' ? null : formData.discountType
    };
    
    onSave(planData);
  };

  const addFeature = () => {
    setFormData(prev => ({
      ...prev,
      features: [...prev.features, '']
    }));
  };

  const updateFeature = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.map((f, i) => i === index ? value : f)
    }));
  };

  const removeFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              {plan ? 'Edit Pricing Plan' : 'Create Pricing Plan'}
            </h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Plan Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Duration
                </label>
                <input
                  type="text"
                  required
                  value={formData.duration}
                  onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  placeholder="e.g., 30 Days, 1 Month"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Base Price (Rs.)
                </label>
                <input
                  type="number"
                  required
                  value={formData.basePrice}
                  onChange={(e) => setFormData(prev => ({ ...prev, basePrice: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Current Price (Rs.)
                </label>
                <input
                  type="number"
                  required
                  value={formData.currentPrice}
                  onChange={(e) => setFormData(prev => ({ ...prev, currentPrice: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Voice Limit
                </label>
                <input
                  type="number"
                  required
                  value={formData.voiceLimit}
                  onChange={(e) => setFormData(prev => ({ ...prev, voiceLimit: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  placeholder="999999 for unlimited"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Badge Text
                </label>
                <input
                  type="text"
                  value={formData.badge}
                  onChange={(e) => setFormData(prev => ({ ...prev, badge: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  placeholder="e.g., MOST POPULAR, BEST VALUE"
                />
              </div>
            </div>

            {/* Discount Settings */}
            <div className="border-t pt-4">
              <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Discount Settings</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Discount Type
                  </label>
                  <select
                    value={formData.discountType || 'null'}
                    onChange={(e) => setFormData(prev => ({ ...prev, discountType: e.target.value === 'null' ? null : e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  >
                    <option value="null">No Discount</option>
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed Amount</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Discount Value
                  </label>
                  <input
                    type="number"
                    value={formData.discountValue}
                    onChange={(e) => setFormData(prev => ({ ...prev, discountValue: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    disabled={!formData.discountType}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Discount Expiry
                  </label>
                  <input
                    type="date"
                    value={formData.discountExpiry}
                    onChange={(e) => setFormData(prev => ({ ...prev, discountExpiry: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    disabled={!formData.discountType}
                  />
                </div>
              </div>
            </div>

            {/* Features */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Features
              </label>
              <div className="space-y-2">
                {formData.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={feature}
                      onChange={(e) => updateFeature(index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                      placeholder="Enter feature"
                    />
                    <button
                      type="button"
                      onClick={() => removeFeature(index)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addFeature}
                  className="inline-flex items-center px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Feature
                </button>
              </div>
            </div>

            {/* Checkboxes */}
            <div className="flex space-x-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Active</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.popular}
                  onChange={(e) => setFormData(prev => ({ ...prev, popular: e.target.checked }))}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Popular</span>
              </label>
            </div>

            {/* Submit Buttons */}
            <div className="flex space-x-3 pt-4">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 flex items-center justify-center"
              >
                <Save className="h-4 w-4 mr-2" />
                {plan ? 'Update Plan' : 'Create Plan'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500"
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

// Broadcast Message Modal Component
const BroadcastMessageModal: React.FC<{
  message: BroadcastMessage | null;
  onSave: (message: Partial<BroadcastMessage>) => void;
  onClose: () => void;
}> = ({ message, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    title: message?.title || '',
    description: message?.description || '',
    active: message?.active ?? true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-lg w-full">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              {message ? 'Edit Broadcast Message' : 'Create Broadcast Message'}
            </h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Title
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                placeholder="Enter message title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                rows={4}
                placeholder="Enter message description"
              />
            </div>

            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.active}
                  onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.checked }))}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Active</span>
              </label>
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 flex items-center justify-center"
              >
                <Save className="h-4 w-4 mr-2" />
                {message ? 'Update Message' : 'Create Message'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500"
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

export default AdminDashboard;