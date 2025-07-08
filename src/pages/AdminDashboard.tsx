import React, { useState, useEffect } from 'react';
import { 
  Users, 
  CreditCard, 
  TrendingUp, 
  Settings, 
  Search, 
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  Eye,
  Edit,
  Trash2,
  Plus,
  Save,
  X,
  Calendar,
  Percent,
  Tag,
  Zap,
  Crown,
  Star,
  Gift,
  Palette,
  Target,
  MessageSquare,
  Send,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { collection, getDocs, doc, updateDoc, addDoc, deleteDoc, query, orderBy, where, Timestamp } from 'firebase/firestore';
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
  billingCycle?: string;
  planDuration?: string;
}

interface PricingPlan {
  id?: string;
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
  createdAt?: Date;
  updatedAt?: Date;
}

interface BroadcastMessage {
  id?: string;
  title: string;
  description: string;
  active: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: string;
}

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState<User[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [pricingPlans, setPricingPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<PricingPlan | null>(null);
  const [broadcastMessage, setBroadcastMessage] = useState<BroadcastMessage>({
    title: '',
    description: '',
    active: false
  });

  // Form state for pricing plan
  const [planForm, setPlanForm] = useState<PricingPlan>({
    name: '',
    basePrice: 0,
    currentPrice: 0,
    duration: '',
    features: [''],
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

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadUsers(),
        loadPayments(),
        loadPricingPlans(),
        loadBroadcastMessage()
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
        createdAt: doc.data().createdAt?.toDate() || new Date()
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

  const loadBroadcastMessage = async () => {
    try {
      const messagesQuery = query(
        collection(db, 'broadcastMessages'),
        where('active', '==', true),
        orderBy('createdAt', 'desc')
      );
      const messagesSnapshot = await getDocs(messagesQuery);
      
      if (!messagesSnapshot.empty) {
        const messageDoc = messagesSnapshot.docs[0];
        const messageData = messageDoc.data();
        setBroadcastMessage({
          id: messageDoc.id,
          title: messageData.title || '',
          description: messageData.description || '',
          active: messageData.active || false,
          createdAt: messageData.createdAt?.toDate() || new Date(),
          updatedAt: messageData.updatedAt?.toDate() || new Date(),
          createdBy: messageData.createdBy || 'admin'
        });
      }
    } catch (error) {
      console.error('Error loading broadcast message:', error);
    }
  };

  const handleUserStatusToggle = async (userId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, { 
        status: newStatus,
        isActive: newStatus === 'active'
      });
      
      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, status: newStatus as 'active' | 'inactive', isActive: newStatus === 'active' }
          : user
      ));
      
      toast.success(`User ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error('Failed to update user status');
    }
  };

  const handlePaymentStatusUpdate = async (paymentId: string, newStatus: 'approved' | 'rejected') => {
    try {
      const paymentRef = doc(db, 'payments', paymentId);
      await updateDoc(paymentRef, { status: newStatus });
      
      if (newStatus === 'approved') {
        const payment = payments.find(p => p.id === paymentId);
        if (payment) {
          const userRef = doc(db, 'users', payment.uid);
          const planExpiry = new Date();
          
          // Set plan duration based on amount
          if (payment.amount === 99) planExpiry.setDate(planExpiry.getDate() + 1);
          else if (payment.amount === 200) planExpiry.setDate(planExpiry.getDate() + 7);
          else if (payment.amount === 350) planExpiry.setDate(planExpiry.getDate() + 15);
          else if (payment.amount === 499) planExpiry.setDate(planExpiry.getDate() + 30);
          
          await updateDoc(userRef, {
            accountStatus: 'pro',
            plan: payment.plan,
            planAmount: payment.amount,
            planExpiry: Timestamp.fromDate(planExpiry),
            upgradedAt: Timestamp.fromDate(new Date()),
            voicesGenerated: 0
          });
        }
      }
      
      setPayments(payments.map(payment => 
        payment.id === paymentId ? { ...payment, status: newStatus } : payment
      ));
      
      toast.success(`Payment ${newStatus} successfully`);
    } catch (error) {
      console.error('Error updating payment status:', error);
      toast.error('Failed to update payment status');
    }
  };

  // Pricing Plan Management Functions
  const calculateCurrentPrice = (basePrice: number, discountType: string | null, discountValue: number) => {
    if (!discountType || !discountValue) return basePrice;
    
    if (discountType === 'percentage') {
      return Math.round(basePrice * (1 - discountValue / 100));
    } else if (discountType === 'fixed') {
      return Math.max(0, basePrice - discountValue);
    }
    
    return basePrice;
  };

  const handlePlanFormChange = (field: keyof PricingPlan, value: any) => {
    const updatedForm = { ...planForm, [field]: value };
    
    // Recalculate current price when discount changes
    if (field === 'basePrice' || field === 'discountType' || field === 'discountValue') {
      updatedForm.currentPrice = calculateCurrentPrice(
        updatedForm.basePrice,
        updatedForm.discountType,
        updatedForm.discountValue || 0
      );
    }
    
    setPlanForm(updatedForm);
  };

  const handleFeatureChange = (index: number, value: string) => {
    const newFeatures = [...planForm.features];
    newFeatures[index] = value;
    setPlanForm({ ...planForm, features: newFeatures });
  };

  const addFeature = () => {
    setPlanForm({ ...planForm, features: [...planForm.features, ''] });
  };

  const removeFeature = (index: number) => {
    const newFeatures = planForm.features.filter((_, i) => i !== index);
    setPlanForm({ ...planForm, features: newFeatures });
  };

  const savePricingPlan = async () => {
    try {
      // Validate form
      if (!planForm.name || !planForm.duration || planForm.basePrice < 0 || planForm.voiceLimit < 0) {
        toast.error('Please fill in all required fields');
        return;
      }

      // Filter out empty features
      const validFeatures = planForm.features.filter(feature => feature.trim() !== '');
      if (validFeatures.length === 0) {
        toast.error('Please add at least one feature');
        return;
      }

      const planData = {
        ...planForm,
        features: validFeatures,
        currentPrice: calculateCurrentPrice(planForm.basePrice, planForm.discountType, planForm.discountValue || 0),
        updatedAt: Timestamp.fromDate(new Date()),
        discountExpiry: planForm.discountExpiry ? Timestamp.fromDate(planForm.discountExpiry) : null
      };

      if (editingPlan?.id) {
        // Update existing plan
        const planRef = doc(db, 'pricingPlans', editingPlan.id);
        await updateDoc(planRef, planData);
        toast.success('Pricing plan updated successfully');
      } else {
        // Create new plan
        await addDoc(collection(db, 'pricingPlans'), {
          ...planData,
          createdAt: Timestamp.fromDate(new Date())
        });
        toast.success('Pricing plan created successfully');
      }

      // Reset form and close modal
      resetPlanForm();
      setShowEditModal(false);
      setEditingPlan(null);
      
      // Reload pricing plans
      await loadPricingPlans();
    } catch (error) {
      console.error('Error saving pricing plan:', error);
      toast.error('Failed to save pricing plan');
    }
  };

  const deletePricingPlan = async (planId: string) => {
    if (!confirm('Are you sure you want to delete this pricing plan?')) return;
    
    try {
      await deleteDoc(doc(db, 'pricingPlans', planId));
      setPricingPlans(pricingPlans.filter(plan => plan.id !== planId));
      toast.success('Pricing plan deleted successfully');
    } catch (error) {
      console.error('Error deleting pricing plan:', error);
      toast.error('Failed to delete pricing plan');
    }
  };

  const editPricingPlan = (plan: PricingPlan) => {
    setEditingPlan(plan);
    setPlanForm({
      ...plan,
      discountExpiry: plan.discountExpiry || null
    });
    setShowEditModal(true);
  };

  const resetPlanForm = () => {
    setPlanForm({
      name: '',
      basePrice: 0,
      currentPrice: 0,
      duration: '',
      features: [''],
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
  };

  const handleBroadcastSave = async () => {
    try {
      if (!broadcastMessage.title || !broadcastMessage.description) {
        toast.error('Please fill in title and description');
        return;
      }

      const messageData = {
        title: broadcastMessage.title,
        description: broadcastMessage.description,
        active: broadcastMessage.active,
        updatedAt: Timestamp.fromDate(new Date()),
        createdBy: 'admin'
      };

      if (broadcastMessage.id) {
        // Update existing message
        const messageRef = doc(db, 'broadcastMessages', broadcastMessage.id);
        await updateDoc(messageRef, messageData);
      } else {
        // Create new message
        await addDoc(collection(db, 'broadcastMessages'), {
          ...messageData,
          createdAt: Timestamp.fromDate(new Date())
        });
      }

      toast.success('Broadcast message saved successfully');
      await loadBroadcastMessage();
    } catch (error) {
      console.error('Error saving broadcast message:', error);
      toast.error('Failed to save broadcast message');
    }
  };

  // Filter functions
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

  // Statistics
  const stats = {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.status === 'active').length,
    proUsers: users.filter(u => u.accountStatus === 'pro').length,
    pendingPayments: payments.filter(p => p.status === 'pending').length,
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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Users</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalUsers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Users</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.activeUsers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <Crown className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pro Users</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.proUsers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Payments</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pendingPayments}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">Rs. {stats.totalRevenue}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', name: 'Overview', icon: TrendingUp },
                { id: 'users', name: 'Users', icon: Users },
                { id: 'payments', name: 'Payments', icon: CreditCard },
                { id: 'pricing', name: 'Pricing', icon: Tag },
                { id: 'broadcast', name: 'Broadcast', icon: MessageSquare },
                { id: 'settings', name: 'Settings', icon: Settings }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Dashboard Overview</h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Recent Users */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Recent Users</h3>
                    <div className="space-y-3">
                      {users.slice(0, 5).map((user) => (
                        <div key={user.id} className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{user.displayName}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                          </div>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            user.accountStatus === 'pro' 
                              ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
                              : 'bg-gray-100 text-gray-700 dark:bg-gray-600 dark:text-gray-300'
                          }`}>
                            {user.accountStatus}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recent Payments */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Recent Payments</h3>
                    <div className="space-y-3">
                      {payments.slice(0, 5).map((payment) => (
                        <div key={payment.id} className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Rs. {payment.amount}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{payment.userEmail}</p>
                          </div>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            payment.status === 'approved' 
                              ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                              : payment.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                              : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                          }`}>
                            {payment.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">User Management</h2>
                  <button
                    onClick={loadUsers}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </button>
                </div>

                {/* Search and Filter */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                {/* Users Table */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Plan
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Voices Used
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
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
                                : 'bg-gray-100 text-gray-700 dark:bg-gray-600 dark:text-gray-300'
                            }`}>
                              {user.accountStatus === 'pro' ? `Pro (${user.plan})` : 'Free'}
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
            )}

            {/* Payments Tab */}
            {activeTab === 'payments' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Payment Management</h2>
                  <button
                    onClick={loadPayments}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </button>
                </div>

                {/* Search and Filter */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search payments..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                {/* Payments Table */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Plan
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Transaction ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
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
                            <div className="text-sm text-gray-900 dark:text-white">
                              {payment.plan}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {payment.planDuration}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            Rs. {payment.amount}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-mono">
                            {payment.tid}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              payment.status === 'approved' 
                                ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                                : payment.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                                : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                            }`}>
                              {payment.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            {payment.status === 'pending' && (
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handlePaymentStatusUpdate(payment.id, 'approved')}
                                  className="px-3 py-1 bg-green-100 text-green-700 rounded text-xs font-medium hover:bg-green-200 dark:bg-green-900 dark:text-green-300"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => handlePaymentStatusUpdate(payment.id, 'rejected')}
                                  className="px-3 py-1 bg-red-100 text-red-700 rounded text-xs font-medium hover:bg-red-200 dark:bg-red-900 dark:text-red-300"
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
            )}

            {/* Pricing Tab */}
            {activeTab === 'pricing' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Pricing Management</h2>
                  <div className="flex gap-2">
                    <button
                      onClick={loadPricingPlans}
                      className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh
                    </button>
                    <button
                      onClick={() => {
                        resetPlanForm();
                        setEditingPlan(null);
                        setShowEditModal(true);
                      }}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add New Plan
                    </button>
                  </div>
                </div>

                {/* Pricing Plans Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pricingPlans.map((plan) => (
                    <div
                      key={plan.id}
                      className={`bg-white dark:bg-gray-800 rounded-xl border-2 p-6 ${
                        plan.popular 
                          ? 'border-purple-500 ring-2 ring-purple-200 dark:ring-purple-800' 
                          : 'border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      {/* Plan Header */}
                      <div className="text-center mb-6">
                        {plan.badge && (
                          <span className="inline-block px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold rounded-full mb-3">
                            {plan.badge}
                          </span>
                        )}
                        
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                          {plan.name}
                        </h3>
                        
                        <div className="mb-4">
                          <div className="flex items-center justify-center space-x-2">
                            <span className="text-3xl font-bold text-gray-900 dark:text-white">
                              {plan.currentPrice === 0 ? 'Free' : `Rs. ${plan.currentPrice}`}
                            </span>
                            {plan.basePrice !== plan.currentPrice && (
                              <span className="text-lg text-gray-500 line-through">
                                Rs. {plan.basePrice}
                              </span>
                            )}
                          </div>
                          <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                            {plan.duration}
                          </p>
                        </div>
                      </div>

                      {/* Features */}
                      <ul className="space-y-2 mb-6 text-left">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-start text-sm text-gray-600 dark:text-gray-300">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                            {feature}
                          </li>
                        ))}
                      </ul>

                      {/* Plan Info */}
                      <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-6">
                        <p><strong>Voice Limit:</strong> {plan.voiceLimit === 999999 ? 'Unlimited' : plan.voiceLimit}</p>
                        <p><strong>Status:</strong> 
                          <span className={`ml-1 px-2 py-1 rounded-full text-xs ${
                            plan.isActive 
                              ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                              : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                          }`}>
                            {plan.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </p>
                        {plan.discountExpiry && (
                          <p><strong>Discount Expires:</strong> {plan.discountExpiry.toLocaleDateString()}</p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex space-x-2">
                        <button
                          onClick={() => editPricingPlan(plan)}
                          className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </button>
                        <button
                          onClick={() => deletePricingPlan(plan.id!)}
                          className="flex items-center justify-center px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Broadcast Tab */}
            {activeTab === 'broadcast' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Broadcast Message</h2>
                
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Message Title
                      </label>
                      <input
                        type="text"
                        value={broadcastMessage.title}
                        onChange={(e) => setBroadcastMessage({ ...broadcastMessage, title: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white"
                        placeholder="Enter broadcast message title"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Message Description
                      </label>
                      <textarea
                        value={broadcastMessage.description}
                        onChange={(e) => setBroadcastMessage({ ...broadcastMessage, description: e.target.value })}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white"
                        placeholder="Enter broadcast message description"
                      />
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="broadcast-active"
                        checked={broadcastMessage.active}
                        onChange={(e) => setBroadcastMessage({ ...broadcastMessage, active: e.target.checked })}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="broadcast-active" className="ml-2 block text-sm text-gray-900 dark:text-white">
                        Active (show to users)
                      </label>
                    </div>

                    <button
                      onClick={handleBroadcastSave}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Save Broadcast Message
                    </button>
                  </div>
                </div>

                {/* Preview */}
                {broadcastMessage.title && broadcastMessage.description && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Preview</h3>
                    <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                        {broadcastMessage.title}
                      </h4>
                      <p className="text-gray-600 dark:text-gray-300">
                        {broadcastMessage.description}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">System Settings</h2>
                
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                  <p className="text-gray-600 dark:text-gray-400">
                    System settings and configuration options will be available here.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pricing Plan Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {editingPlan ? 'Edit Pricing Plan' : 'Create New Pricing Plan'}
                </h3>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingPlan(null);
                    resetPlanForm();
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Form */}
                <div className="space-y-6">
                  {/* Basic Info */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Basic Information</h4>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Plan Name *
                      </label>
                      <input
                        type="text"
                        value={planForm.name}
                        onChange={(e) => handlePlanFormChange('name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                        placeholder="e.g., Pro Plan"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Base Price (Rs.) *
                        </label>
                        <input
                          type="number"
                          value={planForm.basePrice}
                          onChange={(e) => handlePlanFormChange('basePrice', parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                          min="0"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Current Price (Rs.)
                        </label>
                        <input
                          type="number"
                          value={planForm.currentPrice}
                          readOnly
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-600 dark:text-gray-300 bg-gray-100"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Duration *
                        </label>
                        <input
                          type="text"
                          value={planForm.duration}
                          onChange={(e) => handlePlanFormChange('duration', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                          placeholder="e.g., 30 Days"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Voice Limit *
                        </label>
                        <input
                          type="number"
                          value={planForm.voiceLimit}
                          onChange={(e) => handlePlanFormChange('voiceLimit', parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                          min="0"
                          placeholder="999999 for unlimited"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Discount Settings */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Discount Settings</h4>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Discount Type
                      </label>
                      <select
                        value={planForm.discountType || ''}
                        onChange={(e) => handlePlanFormChange('discountType', e.target.value || null)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                      >
                        <option value="">No Discount</option>
                        <option value="percentage">Percentage Discount</option>
                        <option value="fixed">Fixed Amount Discount</option>
                      </select>
                    </div>

                    {planForm.discountType && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Discount Value {planForm.discountType === 'percentage' ? '(%)' : '(Rs.)'}
                          </label>
                          <input
                            type="number"
                            value={planForm.discountValue || 0}
                            onChange={(e) => handlePlanFormChange('discountValue', parseInt(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                            min="0"
                            max={planForm.discountType === 'percentage' ? 100 : planForm.basePrice}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Discount Expiry Date
                          </label>
                          <input
                            type="date"
                            value={planForm.discountExpiry ? planForm.discountExpiry.toISOString().split('T')[0] : ''}
                            onChange={(e) => handlePlanFormChange('discountExpiry', e.target.value ? new Date(e.target.value) : null)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Discount Description
                          </label>
                          <input
                            type="text"
                            value={planForm.discountDescription || ''}
                            onChange={(e) => handlePlanFormChange('discountDescription', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                            placeholder="e.g., Limited Time Offer"
                          />
                        </div>
                      </>
                    )}
                  </div>

                  {/* Features */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Features</h4>
                    
                    {planForm.features.map((feature, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={feature}
                          onChange={(e) => handleFeatureChange(index, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                          placeholder="Enter feature description"
                        />
                        <button
                          onClick={() => removeFeature(index)}
                          className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    
                    <button
                      onClick={addFeature}
                      className="inline-flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Feature
                    </button>
                  </div>

                  {/* Visual Settings */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Visual Settings</h4>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Icon
                        </label>
                        <select
                          value={planForm.icon || 'Zap'}
                          onChange={(e) => handlePlanFormChange('icon', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                        >
                          <option value="Zap">⚡ Zap</option>
                          <option value="Crown">👑 Crown</option>
                          <option value="Star">⭐ Star</option>
                          <option value="Gift">🎁 Gift</option>
                          <option value="Users">👥 Users</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Gradient
                        </label>
                        <select
                          value={planForm.gradient || 'from-blue-500 to-cyan-500'}
                          onChange={(e) => handlePlanFormChange('gradient', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                        >
                          <option value="from-blue-500 to-cyan-500">Blue to Cyan</option>
                          <option value="from-purple-500 to-pink-500">Purple to Pink</option>
                          <option value="from-green-500 to-emerald-500">Green to Emerald</option>
                          <option value="from-yellow-500 to-orange-500">Yellow to Orange</option>
                          <option value="from-red-500 to-pink-500">Red to Pink</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Badge Text
                      </label>
                      <input
                        type="text"
                        value={planForm.badge || ''}
                        onChange={(e) => handlePlanFormChange('badge', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                        placeholder="e.g., MOST POPULAR"
                      />
                    </div>

                    <div className="flex items-center space-x-4">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={planForm.popular || false}
                          onChange={(e) => handlePlanFormChange('popular', e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-900 dark:text-white">Popular Plan</span>
                      </label>

                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={planForm.isActive}
                          onChange={(e) => handlePlanFormChange('isActive', e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-900 dark:text-white">Active</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Preview */}
                <div className="space-y-6">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Preview</h4>
                  
                  <div className={`bg-white dark:bg-gray-800 rounded-xl border-2 p-6 ${
                    planForm.popular 
                      ? 'border-purple-500 ring-2 ring-purple-200 dark:ring-purple-800' 
                      : 'border-gray-200 dark:border-gray-700'
                  }`}>
                    {/* Preview Badge */}
                    {planForm.badge && (
                      <div className="text-center mb-4">
                        <span className={`inline-block px-3 py-1 bg-gradient-to-r ${planForm.gradient} text-white text-xs font-bold rounded-full`}>
                          {planForm.badge}
                        </span>
                      </div>
                    )}
                    
                    {/* Preview Icon */}
                    <div className="text-center mb-4">
                      <div className={`inline-flex p-3 rounded-full bg-gradient-to-r ${planForm.gradient}`}>
                        {planForm.icon === 'Crown' && <Crown className="h-6 w-6 text-white" />}
                        {planForm.icon === 'Star' && <Star className="h-6 w-6 text-white" />}
                        {planForm.icon === 'Gift' && <Gift className="h-6 w-6 text-white" />}
                        {planForm.icon === 'Users' && <Users className="h-6 w-6 text-white" />}
                        {(!planForm.icon || planForm.icon === 'Zap') && <Zap className="h-6 w-6 text-white" />}
                      </div>
                    </div>
                    
                    {/* Preview Name */}
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 text-center">
                      {planForm.name || 'Plan Name'}
                    </h3>
                    
                    {/* Preview Pricing */}
                    <div className="text-center mb-4">
                      <div className="flex items-center justify-center space-x-2">
                        <span className="text-3xl font-bold text-gray-900 dark:text-white">
                          {planForm.currentPrice === 0 ? 'Free' : `Rs. ${planForm.currentPrice}`}
                        </span>
                        {planForm.basePrice !== planForm.currentPrice && planForm.basePrice > 0 && (
                          <span className="text-lg text-gray-500 line-through">
                            Rs. {planForm.basePrice}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                        {planForm.duration || 'Duration'}
                      </p>
                      
                      {/* Discount Info */}
                      {planForm.discountType && planForm.discountValue && (
                        <div className="mt-2">
                          <span className="inline-block px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 text-xs font-medium rounded-full">
                            {planForm.discountType === 'percentage' 
                              ? `${planForm.discountValue}% OFF` 
                              : `Rs. ${planForm.discountValue} OFF`}
                          </span>
                          {planForm.discountExpiry && (
                            <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                              Expires: {planForm.discountExpiry.toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Preview Features */}
                    <ul className="space-y-2 mb-6 text-left">
                      {planForm.features.filter(f => f.trim()).map((feature, index) => (
                        <li key={index} className="flex items-start text-sm text-gray-600 dark:text-gray-300">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    {/* Preview Info */}
                    <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                      <p><strong>Voice Limit:</strong> {planForm.voiceLimit === 999999 ? 'Unlimited' : planForm.voiceLimit}</p>
                      <p><strong>Status:</strong> {planForm.isActive ? 'Active' : 'Inactive'}</p>
                      {planForm.popular && <p><strong>Popular Plan</strong></p>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200 dark:border-gray-600">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingPlan(null);
                    resetPlanForm();
                  }}
                  className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={savePricingPlan}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {editingPlan ? 'Update Plan' : 'Create Plan'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;