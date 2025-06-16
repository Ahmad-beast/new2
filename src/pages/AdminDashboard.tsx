import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, addDoc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Users, Activity, DollarSign, Search, ToggleLeft, ToggleRight, Plus, Eye, AlertTriangle, LogOut, Database, Wifi, Clock, CheckCircle, XCircle, CreditCard, Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

interface User {
  uid: string;
  email: string;
  displayName: string;
  subscriptionPlan: string;
  voiceGenerationsUsed: number;
  voiceGenerationsLimit: number;
  isActive: boolean;
  createdAt: Date;
  accountStatus?: string;
  plan?: string;
  planAmount?: number;
  upgradedAt?: Date;
  voicesGenerated?: number;
  planExpiry?: Date;
}

interface Payment {
  id: string;
  accountType: string;
  accountHolder: string;
  accountNumber: string;
  tid: string;
  amount: number;
  userId: string;
  userEmail: string;
  status: 'pending' | 'verified' | 'rejected';
  createdAt: Date;
  uid?: string;
  plan?: string;
  planDuration?: string;
  timestamp?: number;
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'demo'>('connecting');
  const [activeTab, setActiveTab] = useState<'users' | 'payments' | 'requests'>('users');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalGenerations: 0,
    pendingPayments: 0
  });

  // Payment form data
  const [paymentForm, setPaymentForm] = useState({
    accountType: 'JazzCash',
    accountHolder: '',
    accountNumber: '',
    tid: '',
    amount: '',
    userEmail: ''
  });

  // Plan limits mapping
  const getPlanLimits = (amount: number) => {
    if (amount === 99) return 10;
    if (amount === 200) return 20;
    if (amount === 350) return 29;
    if (amount === 499) return -1; // Unlimited
    return 5; // Free plan default
  };

  const getPlanDuration = (amount: number) => {
    if (amount === 99) return 1;
    if (amount === 200) return 7;
    if (amount === 350) return 15;
    if (amount === 499) return 30;
    return 0; // Free plan
  };

  const getPlanName = (amount: number) => {
    if (amount === 99) return '1 Day';
    if (amount === 200) return '7 Days';
    if (amount === 350) return '15 Days';
    if (amount === 499) return '30 Days';
    return 'Free';
  };

  // Mock data for demo mode
  const mockUsers: User[] = [
    {
      uid: 'demo_user1',
      email: 'john.doe@example.com',
      displayName: 'John Doe',
      subscriptionPlan: 'free',
      voiceGenerationsUsed: 3,
      voiceGenerationsLimit: 5,
      isActive: true,
      createdAt: new Date('2024-01-15'),
      voicesGenerated: 3,
      accountStatus: 'free'
    },
    {
      uid: 'demo_user2',
      email: 'jane.smith@example.com',
      displayName: 'Jane Smith',
      subscriptionPlan: 'paid',
      voiceGenerationsUsed: 25,
      voiceGenerationsLimit: 20,
      isActive: true,
      createdAt: new Date('2024-02-10'),
      accountStatus: 'pro',
      plan: '7 Days',
      planAmount: 200,
      upgradedAt: new Date('2024-06-10'),
      voicesGenerated: 15,
      planExpiry: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) // 5 days from now
    },
    {
      uid: 'demo_user3',
      email: 'bob.wilson@example.com',
      displayName: 'Bob Wilson',
      subscriptionPlan: 'free',
      voiceGenerationsUsed: 5,
      voiceGenerationsLimit: 5,
      isActive: false,
      createdAt: new Date('2024-03-05'),
      voicesGenerated: 5,
      accountStatus: 'free'
    },
    {
      uid: 'demo_user4',
      email: 'alice.johnson@example.com',
      displayName: 'Alice Johnson',
      subscriptionPlan: 'paid',
      voiceGenerationsUsed: 45,
      voiceGenerationsLimit: 999999,
      isActive: true,
      createdAt: new Date('2024-04-20'),
      accountStatus: 'pro',
      plan: '30 Days',
      planAmount: 499,
      upgradedAt: new Date('2024-06-12'),
      voicesGenerated: 45,
      planExpiry: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000) // 25 days from now
    }
  ];

  const mockPayments: Payment[] = [
    {
      id: 'demo_payment1',
      accountType: 'JazzCash',
      accountHolder: 'Jane Smith',
      accountNumber: '03001234567',
      tid: 'TXN123456789',
      amount: 200,
      userId: 'demo_user2',
      userEmail: 'jane.smith@example.com',
      status: 'pending',
      createdAt: new Date('2024-06-15'),
      uid: 'demo_user2',
      plan: '7 Days',
      planDuration: '7 Days'
    },
    {
      id: 'demo_payment2',
      accountType: 'JazzCash',
      accountHolder: 'Ahmed Ali',
      accountNumber: '03009876543',
      tid: 'TXN987654321',
      amount: 99,
      userId: 'demo_user4',
      userEmail: 'ahmed@example.com',
      status: 'verified',
      createdAt: new Date('2024-06-14'),
      uid: 'demo_user4',
      plan: '1 Day',
      planDuration: '1 Day'
    },
    {
      id: 'demo_payment3',
      accountType: 'JazzCash',
      accountHolder: 'Sarah Khan',
      accountNumber: '03005555555',
      tid: 'TXN555666777',
      amount: 350,
      userId: 'demo_user6',
      userEmail: 'sarah@example.com',
      status: 'rejected',
      createdAt: new Date('2024-06-13'),
      uid: 'demo_user6',
      plan: '15 Days',
      planDuration: '15 Days'
    }
  ];

  useEffect(() => {
    // Check admin access via password authentication
    const isAdmin = localStorage.getItem('isAdmin');
    const adminLoginTime = localStorage.getItem('adminLoginTime');
    
    if (!isAdmin || !adminLoginTime || (Date.now() - parseInt(adminLoginTime)) > 24 * 60 * 60 * 1000) {
      localStorage.removeItem('isAdmin');
      localStorage.removeItem('adminLoginTime');
      navigate('/admin-access');
      return;
    }

    // Load data from Firestore with fallback to demo data
    loadFirestoreData();
  }, [navigate]);

  const loadFirestoreData = async () => {
    setConnectionStatus('connecting');
    
    try {
      console.log('🔄 Attempting to connect to Firestore...');
      
      // Try to load users from Firestore
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const usersData = usersSnapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        upgradedAt: doc.data().upgradedAt?.toDate() || null,
        planExpiry: doc.data().planExpiry?.toDate() || null
      })) as User[];

      console.log(`✅ Successfully loaded ${usersData.length} users from Firestore`);
      setUsers(usersData);

      // Try to load payments from Firestore
      const paymentsQuery = query(collection(db, 'payments'), orderBy('createdAt', 'desc'));
      const paymentsSnapshot = await getDocs(paymentsQuery);
      const paymentsData = paymentsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      })) as Payment[];

      console.log(`✅ Successfully loaded ${paymentsData.length} payments from Firestore`);
      setPayments(paymentsData);

      // Set up real-time listener for payments
      const unsubscribe = onSnapshot(
        paymentsQuery,
        (querySnapshot) => {
          const updatedPayments = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date()
          })) as Payment[];
          
          setPayments(updatedPayments);
          updateStats(usersData, updatedPayments);
          console.log('🔄 Real-time payment updates received');
        },
        (error) => {
          console.error('❌ Real-time listener error:', error);
          toast.error('Real-time updates disabled due to connection issues');
        }
      );

      // Calculate initial stats
      updateStats(usersData, paymentsData);
      setConnectionStatus('connected');
      toast.success('✅ Connected to production database', { duration: 3000 });

      // Cleanup function
      return () => unsubscribe();

    } catch (error: any) {
      console.error('❌ Firestore connection failed:', error);
      
      // Fallback to demo data
      console.log('🎭 Falling back to demo data');
      setUsers(mockUsers);
      setPayments(mockPayments);
      updateStats(mockUsers, mockPayments);
      setConnectionStatus('demo');
      
      if (error.code === 'permission-denied') {
        toast.error('⚠️ Database permissions not configured - Using demo data', { duration: 4000 });
      } else if (error.code === 'unavailable') {
        toast.error('⚠️ Database temporarily unavailable - Using demo data', { duration: 4000 });
      } else {
        toast.error('⚠️ Unable to connect to database - Using demo data', { duration: 4000 });
      }
    }
  };

  const updateStats = (usersData: User[], paymentsData: Payment[]) => {
    setStats({
      totalUsers: usersData.length,
      activeUsers: usersData.filter(u => u.isActive).length,
      totalGenerations: usersData.reduce((sum, u) => sum + (u.voicesGenerated || 0), 0),
      pendingPayments: paymentsData.filter(p => p.status === 'pending').length
    });
  };

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      if (connectionStatus === 'demo') {
        // Demo mode - update local state only
        const updatedUsers = users.map(user => 
          user.uid === userId ? { ...user, isActive: !currentStatus } : user
        );
        setUsers(updatedUsers);
        updateStats(updatedUsers, payments);
        toast.success(`User ${!currentStatus ? 'activated' : 'deactivated'} (Demo mode)`, { duration: 2000 });
        return;
      }

      // Production mode - update Firestore
      await updateDoc(doc(db, 'users', userId), {
        isActive: !currentStatus
      });
      
      const updatedUsers = users.map(user => 
        user.uid === userId ? { ...user, isActive: !currentStatus } : user
      );
      setUsers(updatedUsers);
      updateStats(updatedUsers, payments);
      
      toast.success(`User ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
    } catch (error: any) {
      console.error('Error updating user status:', error);
      toast.error('Failed to update user status');
    }
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const newPaymentData = {
        ...paymentForm,
        amount: parseFloat(paymentForm.amount),
        userId: '',
        status: 'pending' as const,
        createdAt: new Date()
      };

      if (connectionStatus === 'demo') {
        // Demo mode - update local state only
        const newPayment: Payment = {
          id: `demo_payment_${Date.now()}`,
          ...newPaymentData
        };
        const updatedPayments = [newPayment, ...payments];
        setPayments(updatedPayments);
        updateStats(users, updatedPayments);
        toast.success('Payment method added (Demo mode)', { duration: 2000 });
      } else {
        // Production mode - add to Firestore
        await addDoc(collection(db, 'payments'), newPaymentData);
        toast.success('Payment method added successfully');
      }
      
      // Reset form
      setPaymentForm({
        accountType: 'JazzCash',
        accountHolder: '',
        accountNumber: '',
        tid: '',
        amount: '',
        userEmail: ''
      });
      setShowPaymentForm(false);
    } catch (error: any) {
      console.error('Error adding payment method:', error);
      toast.error('Failed to add payment method');
    }
  };

  const updatePaymentStatus = async (paymentId: string, status: 'verified' | 'rejected') => {
    try {
      const payment = payments.find(p => p.id === paymentId);
      
      if (connectionStatus === 'demo') {
        // Demo mode - update local state only
        const updatedPayments = payments.map(payment => 
          payment.id === paymentId ? { ...payment, status } : payment
        );
        setPayments(updatedPayments);
        updateStats(users, updatedPayments);
        toast.success(`Payment ${status} (Demo mode)`, { duration: 2000 });
        return;
      }

      // Production mode - update Firestore
      await updateDoc(doc(db, 'payments', paymentId), {
        status: status
      });

      // If payment is approved, upgrade the user
      if (status === 'verified' && payment) {
        const userId = payment.uid || payment.userId;
        if (userId) {
          const planName = getPlanName(payment.amount);
          const durationDays = getPlanDuration(payment.amount);
          const voiceLimit = getPlanLimits(payment.amount);
          const planExpiry = new Date();
          planExpiry.setDate(planExpiry.getDate() + durationDays);

          await updateDoc(doc(db, 'users', userId), {
            accountStatus: 'pro',
            plan: planName,
            planAmount: payment.amount,
            upgradedAt: new Date(),
            planExpiry: planExpiry,
            subscriptionPlan: 'paid',
            voiceGenerationsLimit: voiceLimit === -1 ? 999999 : voiceLimit,
            voicesGenerated: 0 // Reset counter for new plan
          });

          // Update local user state
          const updatedUsers = users.map(user => 
            user.uid === userId ? { 
              ...user, 
              accountStatus: 'pro',
              plan: planName,
              planAmount: payment.amount,
              upgradedAt: new Date(),
              planExpiry: planExpiry,
              subscriptionPlan: 'paid',
              voiceGenerationsLimit: voiceLimit === -1 ? 999999 : voiceLimit,
              voicesGenerated: 0
            } : user
          );
          setUsers(updatedUsers);
          updateStats(updatedUsers, payments);
        }
      }

      toast.success(`Payment ${status} successfully`);
    } catch (error: any) {
      console.error(`Error ${status} payment:`, error);
      toast.error(`Failed to ${status} payment`);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('adminLoginTime');
    toast.success('Logged out successfully');
    navigate('/admin-access');
  };

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.displayName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pendingPayments = payments.filter(p => p.status === 'pending');

  const getStatusBanner = () => {
    switch (connectionStatus) {
      case 'connecting':
        return (
          <div className="mb-4 sm:mb-6 bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-xl p-3 sm:p-4">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-3"></div>
              <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                Connecting to production database...
              </p>
            </div>
          </div>
        );
      case 'connected':
        return (
          <div className="mb-4 sm:mb-6 bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-xl p-3 sm:p-4">
            <div className="flex items-center">
              <Wifi className="h-4 w-4 text-green-600 dark:text-green-400 mr-2" />
              <Database className="h-4 w-4 text-green-600 dark:text-green-400 mr-2" />
              <p className="text-sm font-medium text-green-700 dark:text-green-300">
                Connected to production database - Real-time updates active
              </p>
            </div>
          </div>
        );
      case 'demo':
        return (
          <div className="mb-4 sm:mb-6 bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-xl p-3 sm:p-4">
            <div className="flex items-center">
              <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600 dark:text-yellow-400 mr-2 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-yellow-700 dark:text-yellow-300">
                  Demo Mode - Using sample data
                </p>
                <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                  Database connection failed. All changes are simulated and won't be saved.
                </p>
              </div>
            </div>
          </div>
        );
    }
  };

  const formatPlanExpiry = (expiry: Date | undefined) => {
    if (!expiry) return null;
    const now = new Date();
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) return 'Expired';
    if (diffDays === 1) return '1 day left';
    return `${diffDays} days left`;
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                Password-authenticated admin panel with voice generation limits
              </p>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                {showMobileMenu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-md hover:shadow-lg text-sm"
              >
                <LogOut className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Status Banner */}
        {getStatusBanner()}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white dark:bg-gray-800 p-3 sm:p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <Users className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
              <div className="ml-2 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Total Users</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">{stats.totalUsers}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-3 sm:p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <Activity className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
              <div className="ml-2 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Active Users</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">{stats.activeUsers}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-3 sm:p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <Activity className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
              <div className="ml-2 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Voice Generations</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">{stats.totalGenerations}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-3 sm:p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <DollarSign className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600" />
              <div className="ml-2 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Pending Payments</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">{stats.pendingPayments}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 mb-6 sm:mb-8 shadow-sm">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-4 sm:space-x-8 px-4 sm:px-6 overflow-x-auto">
              <button
                onClick={() => setActiveTab('users')}
                className={`py-3 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap ${
                  activeTab === 'users'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <Users className="h-3 w-3 sm:h-4 sm:w-4 inline mr-1 sm:mr-2" />
                Users Management
              </button>
              <button
                onClick={() => setActiveTab('requests')}
                className={`py-3 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm transition-colors relative whitespace-nowrap ${
                  activeTab === 'requests'
                    ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <CreditCard className="h-3 w-3 sm:h-4 sm:w-4 inline mr-1 sm:mr-2" />
                Payment Requests
                {stats.pendingPayments > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center">
                    {stats.pendingPayments}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('payments')}
                className={`py-3 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap ${
                  activeTab === 'payments'
                    ? 'border-green-500 text-green-600 dark:text-green-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 inline mr-1 sm:mr-2" />
                All Payments
              </button>
            </nav>
          </div>

          <div className="p-4 sm:p-6">
            {/* Users Management Tab */}
            {activeTab === 'users' && (
              <div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 space-y-3 sm:space-y-0">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Users Management</h2>
                  <div className="relative w-full sm:w-auto">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white w-full sm:w-64 text-sm"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-medium text-gray-900 dark:text-white text-xs sm:text-sm">User</th>
                        <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-medium text-gray-900 dark:text-white text-xs sm:text-sm">Plan</th>
                        <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-medium text-gray-900 dark:text-white text-xs sm:text-sm">Voice Usage</th>
                        <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-medium text-gray-900 dark:text-white text-xs sm:text-sm">Status</th>
                        <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-medium text-gray-900 dark:text-white text-xs sm:text-sm">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user) => (
                        <tr key={user.uid} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                          <td className="py-2 sm:py-3 px-2 sm:px-4">
                            <div>
                              <div className="flex items-center">
                                <p className="font-medium text-gray-900 dark:text-white text-xs sm:text-sm truncate">{user.displayName}</p>
                                {user.accountStatus === 'pro' && (
                                  <span className="ml-1 sm:ml-2 px-1 sm:px-2 py-0.5 sm:py-1 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white text-xs font-bold rounded-full">
                                    PRO
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                              {user.plan && (
                                <div className="flex flex-col space-y-1 mt-1">
                                  <p className="text-xs text-blue-600 dark:text-blue-400">Plan: {user.plan}</p>
                                  {user.planExpiry && (
                                    <p className="text-xs text-orange-600 dark:text-orange-400">
                                      {formatPlanExpiry(user.planExpiry)}
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="py-2 sm:py-3 px-2 sm:px-4">
                            <span className={`px-1 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium ${
                              user.accountStatus === 'pro' 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                            }`}>
                              {user.accountStatus === 'pro' ? user.plan || 'Pro' : 'Free'}
                            </span>
                          </td>
                          <td className="py-2 sm:py-3 px-2 sm:px-4">
                            <div className="text-xs sm:text-sm">
                              <span className="text-gray-600 dark:text-gray-400">
                                {user.voicesGenerated || 0}/{user.voiceGenerationsLimit === 999999 ? '∞' : user.voiceGenerationsLimit}
                              </span>
                              {user.voiceGenerationsLimit !== 999999 && (
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1 mt-1">
                                  <div
                                    className="bg-blue-500 h-1 rounded-full"
                                    style={{ 
                                      width: `${Math.min(((user.voicesGenerated || 0) / user.voiceGenerationsLimit) * 100, 100)}%` 
                                    }}
                                  ></div>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="py-2 sm:py-3 px-2 sm:px-4">
                            <span className={`px-1 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium ${
                              user.isActive 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            }`}>
                              {user.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="py-2 sm:py-3 px-2 sm:px-4">
                            <button
                              onClick={() => toggleUserStatus(user.uid, user.isActive)}
                              className="flex items-center space-x-1 text-xs sm:text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                            >
                              {user.isActive ? <ToggleRight className="h-3 w-3 sm:h-4 sm:w-4" /> : <ToggleLeft className="h-3 w-3 sm:h-4 sm:w-4" />}
                              <span className="hidden sm:inline">{user.isActive ? 'Deactivate' : 'Activate'}</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Payment Requests Tab */}
            {activeTab === 'requests' && (
              <div>
                <div className="flex justify-between items-center mb-4 sm:mb-6">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                    Payment Requests ({pendingPayments.length} pending)
                  </h2>
                </div>

                {pendingPayments.length === 0 ? (
                  <div className="text-center py-8 sm:py-12">
                    <Clock className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">No pending payment requests</p>
                  </div>
                ) : (
                  <div className="space-y-3 sm:space-y-4">
                    {pendingPayments.map((payment) => (
                      <div key={payment.id} className="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4 sm:p-6">
                        <div className="flex flex-col lg:flex-row justify-between items-start space-y-4 lg:space-y-0">
                          <div className="flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-center mb-2 space-y-1 sm:space-y-0">
                              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                                {payment.accountHolder || payment.userEmail}
                              </h3>
                              <span className="ml-0 sm:ml-2 px-2 py-1 bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200 text-xs font-medium rounded-full w-fit">
                                Pending
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-xs sm:text-sm">
                              <div>
                                <label className="font-medium text-gray-700 dark:text-gray-300">Plan:</label>
                                <p className="text-gray-900 dark:text-white">{getPlanName(payment.amount)}</p>
                                <p className="text-xs text-gray-500">
                                  {getPlanLimits(payment.amount) === -1 ? 'Unlimited' : `${getPlanLimits(payment.amount)} voices`}
                                </p>
                              </div>
                              <div>
                                <label className="font-medium text-gray-700 dark:text-gray-300">Amount:</label>
                                <p className="text-gray-900 dark:text-white">Rs. {payment.amount}</p>
                              </div>
                              <div>
                                <label className="font-medium text-gray-700 dark:text-gray-300">Transaction ID:</label>
                                <p className="text-gray-900 dark:text-white font-mono text-xs">{payment.tid}</p>
                              </div>
                              <div>
                                <label className="font-medium text-gray-700 dark:text-gray-300">Date:</label>
                                <p className="text-gray-900 dark:text-white">{payment.createdAt.toLocaleDateString()}</p>
                              </div>
                            </div>
                            
                            <div className="mt-2 sm:mt-3 text-xs sm:text-sm">
                              <label className="font-medium text-gray-700 dark:text-gray-300">User Email:</label>
                              <p className="text-gray-900 dark:text-white">{payment.userEmail}</p>
                            </div>
                          </div>
                          
                          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full lg:w-auto lg:ml-4">
                            <button
                              onClick={() => updatePaymentStatus(payment.id, 'verified')}
                              className="flex items-center justify-center space-x-1 px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                            >
                              <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                              <span>Accept</span>
                            </button>
                            <button
                              onClick={() => updatePaymentStatus(payment.id, 'rejected')}
                              className="flex items-center justify-center space-x-1 px-3 sm:px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                            >
                              <XCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                              <span>Reject</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* All Payments Tab */}
            {activeTab === 'payments' && (
              <div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 space-y-3 sm:space-y-0">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">All Payments</h2>
                  <button
                    onClick={() => setShowPaymentForm(true)}
                    className="bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-1 sm:space-x-2 shadow-md hover:shadow-lg text-sm"
                  >
                    <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>Add Payment Method</span>
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-medium text-gray-900 dark:text-white text-xs sm:text-sm">User</th>
                        <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-medium text-gray-900 dark:text-white text-xs sm:text-sm">Plan</th>
                        <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-medium text-gray-900 dark:text-white text-xs sm:text-sm">Amount</th>
                        <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-medium text-gray-900 dark:text-white text-xs sm:text-sm">Status</th>
                        <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-medium text-gray-900 dark:text-white text-xs sm:text-sm">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map((payment) => (
                        <tr key={payment.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                          <td className="py-2 sm:py-3 px-2 sm:px-4">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white text-xs sm:text-sm truncate">{payment.accountHolder}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{payment.userEmail}</p>
                            </div>
                          </td>
                          <td className="py-2 sm:py-3 px-2 sm:px-4">
                            <div>
                              <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                                {getPlanName(payment.amount)}
                              </span>
                              <p className="text-xs text-gray-500">
                                {getPlanLimits(payment.amount) === -1 ? 'Unlimited' : `${getPlanLimits(payment.amount)} voices`}
                              </p>
                            </div>
                          </td>
                          <td className="py-2 sm:py-3 px-2 sm:px-4">
                            <span className="font-medium text-gray-900 dark:text-white text-xs sm:text-sm">Rs. {payment.amount}</span>
                          </td>
                          <td className="py-2 sm:py-3 px-2 sm:px-4">
                            <span className={`px-1 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium ${
                              payment.status === 'verified' 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : payment.status === 'rejected'
                                ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                            }`}>
                              {payment.status}
                            </span>
                          </td>
                          <td className="py-2 sm:py-3 px-2 sm:px-4">
                            <div className="flex space-x-1 sm:space-x-2">
                              <button
                                onClick={() => setSelectedPayment(payment)}
                                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                              >
                                <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                              </button>
                              {payment.status === 'pending' && (
                                <>
                                  <button
                                    onClick={() => updatePaymentStatus(payment.id, 'verified')}
                                    className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 text-xs px-1 sm:px-2 py-0.5 sm:py-1 bg-green-100 dark:bg-green-900 rounded transition-colors"
                                  >
                                    Verify
                                  </button>
                                  <button
                                    onClick={() => updatePaymentStatus(payment.id, 'rejected')}
                                    className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-xs px-1 sm:px-2 py-0.5 sm:py-1 bg-red-100 dark:bg-red-900 rounded transition-colors"
                                  >
                                    Reject
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Payment Form Modal */}
        {showPaymentForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Add Payment Method</h3>
              <form onSubmit={handlePaymentSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Account Type
                  </label>
                  <select
                    value={paymentForm.accountType}
                    onChange={(e) => setPaymentForm({...paymentForm, accountType: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm"
                  >
                    <option value="JazzCash">JazzCash</option>
                    <option value="EasyPaisa">EasyPaisa</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Account Holder Name
                  </label>
                  <input
                    type="text"
                    required
                    value={paymentForm.accountHolder}
                    onChange={(e) => setPaymentForm({...paymentForm, accountHolder: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Account Number
                  </label>
                  <input
                    type="text"
                    required
                    value={paymentForm.accountNumber}
                    onChange={(e) => setPaymentForm({...paymentForm, accountNumber: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Transaction ID (TID)
                  </label>
                  <input
                    type="text"
                    required
                    value={paymentForm.tid}
                    onChange={(e) => setPaymentForm({...paymentForm, tid: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Amount (Rs.)
                  </label>
                  <input
                    type="number"
                    required
                    value={paymentForm.amount}
                    onChange={(e) => setPaymentForm({...paymentForm, amount: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    User Email
                  </label>
                  <input
                    type="email"
                    required
                    value={paymentForm.userEmail}
                    onChange={(e) => setPaymentForm({...paymentForm, userEmail: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm"
                  />
                </div>
                
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    Add Payment
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPaymentForm(false)}
                    className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Payment Detail Modal */}
        {selectedPayment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Payment Details</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Account Type</label>
                  <p className="text-gray-900 dark:text-white">{selectedPayment.accountType}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Account Holder</label>
                  <p className="text-gray-900 dark:text-white">{selectedPayment.accountHolder}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Account Number</label>
                  <p className="text-gray-900 dark:text-white">{selectedPayment.accountNumber}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Transaction ID</label>
                  <p className="text-gray-900 dark:text-white">{selectedPayment.tid}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Amount</label>
                  <p className="text-gray-900 dark:text-white">Rs. {selectedPayment.amount}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Plan</label>
                  <p className="text-gray-900 dark:text-white">
                    {getPlanName(selectedPayment.amount)} 
                    <span className="text-sm text-gray-500 ml-2">
                      ({getPlanLimits(selectedPayment.amount) === -1 ? 'Unlimited' : `${getPlanLimits(selectedPayment.amount)} voices`})
                    </span>
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</label>
                  <p className="text-gray-900 dark:text-white capitalize">{selectedPayment.status}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Date</label>
                  <p className="text-gray-900 dark:text-white">{selectedPayment.createdAt.toLocaleDateString()}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedPayment(null)}
                className="mt-4 w-full bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors text-sm"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;