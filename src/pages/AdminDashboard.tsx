import React, { useState, useEffect } from 'react';
import { 
  Users, 
  CreditCard, 
  TrendingUp, 
  Search, 
  Filter, 
  MoreVertical,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  UserX,
  UserCheck,
  AlertTriangle,
  RefreshCw,
  Mic,
  Volume2,
  Calendar,
  FileText,
  MessageSquare,
  Send,
  Edit,
  Trash2,
  Plus
} from 'lucide-react';
import { collection, getDocs, doc, updateDoc, query, orderBy, where, addDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import toast from 'react-hot-toast';

interface User {
  id: string;
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
  isActive: boolean;
  status?: 'active' | 'inactive';
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
  accountType: string;
  accountHolder: string;
  accountNumber: string;
}

interface VoiceGeneration {
  id: string;
  uid: string;
  userEmail: string;
  displayName: string;
  accountStatus: 'free' | 'pro';
  plan: string;
  voiceId: string;
  voiceName: string;
  textLength: number;
  textPreview: string;
  generatedAt: Date;
  isApiGenerated: boolean;
  audioSize: number;
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
  const [users, setUsers] = useState<User[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [voiceGenerations, setVoiceGenerations] = useState<VoiceGeneration[]>([]);
  const [broadcastMessages, setBroadcastMessages] = useState<BroadcastMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'users' | 'payments' | 'voices' | 'messages'>('users');
  const [voiceSearchTerm, setVoiceSearchTerm] = useState('');
  const [voiceFilterPlan, setVoiceFilterPlan] = useState('all');
  
  // Broadcast message form state
  const [showMessageForm, setShowMessageForm] = useState(false);
  const [messageTitle, setMessageTitle] = useState('');
  const [messageDescription, setMessageDescription] = useState('');
  const [editingMessage, setEditingMessage] = useState<BroadcastMessage | null>(null);
  const [messageSubmitting, setMessageSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([loadUsers(), loadPayments(), loadVoiceGenerations(), loadBroadcastMessages()]);
    } catch (error) {
      console.error('Error loading admin data:', error);
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const usersQuery = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
      const usersSnapshot = await getDocs(usersQuery);
      
      const usersData = usersSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          uid: data.uid,
          email: data.email,
          displayName: data.displayName,
          accountStatus: data.accountStatus || 'free',
          plan: data.plan,
          planAmount: data.planAmount,
          voicesGenerated: data.voicesGenerated || 0,
          createdAt: data.createdAt?.toDate() || new Date(),
          upgradedAt: data.upgradedAt?.toDate(),
          planExpiry: data.planExpiry?.toDate(),
          isActive: data.isActive !== false,
          status: data.status || 'active'
        } as User;
      });
      
      setUsers(usersData);
      console.log(`Loaded ${usersData.length} users`);
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Failed to load users');
    }
  };

  const loadPayments = async () => {
    try {
      const paymentsQuery = query(collection(db, 'payments'), orderBy('createdAt', 'desc'));
      const paymentsSnapshot = await getDocs(paymentsQuery);
      
      const paymentsData = paymentsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          uid: data.uid,
          userEmail: data.userEmail,
          plan: data.plan,
          planDuration: data.planDuration,
          amount: data.amount,
          tid: data.tid,
          status: data.status,
          createdAt: data.createdAt?.toDate() || new Date(),
          accountType: data.accountType,
          accountHolder: data.accountHolder,
          accountNumber: data.accountNumber
        } as Payment;
      });
      
      setPayments(paymentsData);
      console.log(`Loaded ${paymentsData.length} payments`);
    } catch (error) {
      console.error('Error loading payments:', error);
      toast.error('Failed to load payments');
    }
  };

  const loadVoiceGenerations = async () => {
    try {
      const voicesQuery = query(collection(db, 'voiceGenerations'), orderBy('generatedAt', 'desc'));
      const voicesSnapshot = await getDocs(voicesQuery);
      
      const voicesData = voicesSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          uid: data.uid,
          userEmail: data.userEmail,
          displayName: data.displayName,
          accountStatus: data.accountStatus || 'free',
          plan: data.plan || 'Free',
          voiceId: data.voiceId,
          voiceName: data.voiceName,
          textLength: data.textLength || 0,
          textPreview: data.textPreview || '',
          generatedAt: data.generatedAt?.toDate() || new Date(),
          isApiGenerated: data.isApiGenerated || false,
          audioSize: data.audioSize || 0
        } as VoiceGeneration;
      });
      
      setVoiceGenerations(voicesData);
      console.log(`Loaded ${voicesData.length} voice generations`);
    } catch (error) {
      console.error('Error loading voice generations:', error);
      toast.error('Failed to load voice generations');
    }
  };

  const loadBroadcastMessages = async () => {
    try {
      const messagesQuery = query(collection(db, 'broadcastMessages'), orderBy('createdAt', 'desc'));
      const messagesSnapshot = await getDocs(messagesQuery);
      
      const messagesData = messagesSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title,
          description: data.description,
          active: data.active,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          createdBy: data.createdBy || 'admin'
        } as BroadcastMessage;
      });
      
      setBroadcastMessages(messagesData);
      console.log(`Loaded ${messagesData.length} broadcast messages`);
    } catch (error) {
      console.error('Error loading broadcast messages:', error);
      toast.error('Failed to load broadcast messages');
    }
  };

  const handleUserStatusToggle = async (user: User) => {
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    const actionText = newStatus === 'inactive' ? 'Deactivating' : 'Activating';
    
    setActionLoading(user.id);
    const loadingToast = toast.loading(`${actionText} user account...`);

    try {
      console.log(`${actionText} user:`, {
        userId: user.id,
        uid: user.uid,
        email: user.email,
        currentStatus: user.status,
        newStatus: newStatus
      });

      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        status: newStatus,
        isActive: newStatus === 'active',
        lastStatusUpdate: new Date(),
        updatedBy: 'admin'
      });

      setUsers(prevUsers => 
        prevUsers.map(u => 
          u.id === user.id 
            ? { ...u, status: newStatus, isActive: newStatus === 'active' }
            : u
        )
      );

      const successMessage = newStatus === 'inactive' 
        ? 'User account deactivated successfully' 
        : 'User account activated successfully';
      
      toast.success(successMessage, { id: loadingToast });
      
      console.log(`✅ User ${user.email} ${newStatus === 'inactive' ? 'deactivated' : 'activated'} successfully`);
      
      if (showUserModal && selectedUser?.id === user.id) {
        setShowUserModal(false);
        setSelectedUser(null);
      }
      
    } catch (error: any) {
      console.error(`❌ Error ${actionText.toLowerCase()} user:`, error);
      toast.error(`Failed to ${actionText.toLowerCase()} user account. Please try again.`, { id: loadingToast });
    } finally {
      setActionLoading(null);
    }
  };

  const handlePaymentAction = async (payment: Payment, action: 'approve' | 'reject') => {
    setActionLoading(payment.id);
    const loadingToast = toast.loading(`${action === 'approve' ? 'Approving' : 'Rejecting'} payment...`);

    try {
      const paymentRef = doc(db, 'payments', payment.id);
      await updateDoc(paymentRef, {
        status: action === 'approve' ? 'approved' : 'rejected',
        processedAt: new Date(),
        processedBy: 'admin'
      });

      if (action === 'approve') {
        const userRef = doc(db, 'users', payment.uid);
        const planExpiry = new Date();
        
        const durationDays = payment.planDuration === '1 Day' ? 1 :
                           payment.planDuration === '7 Days' ? 7 :
                           payment.planDuration === '15 Days' ? 15 :
                           payment.planDuration === '30 Days' ? 30 : 0;
        
        planExpiry.setDate(planExpiry.getDate() + durationDays);

        await updateDoc(userRef, {
          accountStatus: 'pro',
          plan: payment.plan,
          planAmount: payment.amount,
          planExpiry: planExpiry,
          upgradedAt: new Date(),
          voicesGenerated: 0
        });

        setUsers(prevUsers => 
          prevUsers.map(user => 
            user.uid === payment.uid 
              ? { 
                  ...user, 
                  accountStatus: 'pro' as const,
                  plan: payment.plan,
                  planAmount: payment.amount,
                  planExpiry: planExpiry,
                  upgradedAt: new Date(),
                  voicesGenerated: 0
                }
              : user
          )
        );
      }

      setPayments(prevPayments => 
        prevPayments.map(p => 
          p.id === payment.id 
            ? { ...p, status: action === 'approve' ? 'approved' : 'rejected' }
            : p
        )
      );

      toast.success(`Payment ${action === 'approve' ? 'approved' : 'rejected'} successfully!`, { id: loadingToast });
    } catch (error: any) {
      console.error(`Error ${action}ing payment:`, error);
      toast.error(`Failed to ${action} payment. Please try again.`, { id: loadingToast });
    } finally {
      setActionLoading(null);
    }
  };

  const handleBroadcastMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!messageTitle.trim() || !messageDescription.trim()) {
      toast.error('Please fill in both title and description');
      return;
    }

    setMessageSubmitting(true);
    const loadingToast = toast.loading(editingMessage ? 'Updating message...' : 'Creating broadcast message...');

    try {
      if (editingMessage) {
        // Update existing message
        const messageRef = doc(db, 'broadcastMessages', editingMessage.id);
        await updateDoc(messageRef, {
          title: messageTitle.trim(),
          description: messageDescription.trim(),
          updatedAt: new Date()
        });

        setBroadcastMessages(prev => 
          prev.map(msg => 
            msg.id === editingMessage.id 
              ? { ...msg, title: messageTitle.trim(), description: messageDescription.trim(), updatedAt: new Date() }
              : msg
          )
        );

        toast.success('Broadcast message updated successfully!', { id: loadingToast });
      } else {
        // Deactivate all existing messages first
        const activeMessages = broadcastMessages.filter(msg => msg.active);
        for (const msg of activeMessages) {
          const msgRef = doc(db, 'broadcastMessages', msg.id);
          await updateDoc(msgRef, { active: false });
        }

        // Create new message
        const newMessage = {
          title: messageTitle.trim(),
          description: messageDescription.trim(),
          active: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: 'admin'
        };

        const docRef = await addDoc(collection(db, 'broadcastMessages'), newMessage);
        
        setBroadcastMessages(prev => [
          { ...newMessage, id: docRef.id },
          ...prev.map(msg => ({ ...msg, active: false }))
        ]);

        toast.success('Broadcast message sent to all users!', { id: loadingToast });
      }

      // Reset form
      setMessageTitle('');
      setMessageDescription('');
      setShowMessageForm(false);
      setEditingMessage(null);
    } catch (error: any) {
      console.error('Error handling broadcast message:', error);
      toast.error('Failed to process broadcast message. Please try again.', { id: loadingToast });
    } finally {
      setMessageSubmitting(false);
    }
  };

  const handleToggleMessageStatus = async (message: BroadcastMessage) => {
    setActionLoading(message.id);
    const loadingToast = toast.loading(message.active ? 'Deactivating message...' : 'Activating message...');

    try {
      if (!message.active) {
        // Deactivate all other messages first
        const activeMessages = broadcastMessages.filter(msg => msg.active && msg.id !== message.id);
        for (const msg of activeMessages) {
          const msgRef = doc(db, 'broadcastMessages', msg.id);
          await updateDoc(msgRef, { active: false });
        }
      }

      const messageRef = doc(db, 'broadcastMessages', message.id);
      await updateDoc(messageRef, {
        active: !message.active,
        updatedAt: new Date()
      });

      setBroadcastMessages(prev => 
        prev.map(msg => 
          msg.id === message.id 
            ? { ...msg, active: !msg.active, updatedAt: new Date() }
            : !message.active ? { ...msg, active: false } : msg
        )
      );

      toast.success(`Message ${!message.active ? 'activated' : 'deactivated'} successfully!`, { id: loadingToast });
    } catch (error: any) {
      console.error('Error toggling message status:', error);
      toast.error('Failed to update message status. Please try again.', { id: loadingToast });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteMessage = async (message: BroadcastMessage) => {
    if (!confirm('Are you sure you want to delete this message? This action cannot be undone.')) {
      return;
    }

    setActionLoading(message.id);
    const loadingToast = toast.loading('Deleting message...');

    try {
      await deleteDoc(doc(db, 'broadcastMessages', message.id));
      setBroadcastMessages(prev => prev.filter(msg => msg.id !== message.id));
      toast.success('Message deleted successfully!', { id: loadingToast });
    } catch (error: any) {
      console.error('Error deleting message:', error);
      toast.error('Failed to delete message. Please try again.', { id: loadingToast });
    } finally {
      setActionLoading(null);
    }
  };

  const handleEditMessage = (message: BroadcastMessage) => {
    setEditingMessage(message);
    setMessageTitle(message.title);
    setMessageDescription(message.description);
    setShowMessageForm(true);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.displayName.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterStatus === 'all') return matchesSearch;
    if (filterStatus === 'active') return matchesSearch && user.status === 'active';
    if (filterStatus === 'inactive') return matchesSearch && user.status === 'inactive';
    if (filterStatus === 'pro') return matchesSearch && user.accountStatus === 'pro';
    if (filterStatus === 'free') return matchesSearch && user.accountStatus === 'free';
    
    return matchesSearch;
  });

  const filteredVoiceGenerations = voiceGenerations.filter(voice => {
    const matchesSearch = voiceSearchTerm === '' ||
      voice.userEmail.toLowerCase().includes(voiceSearchTerm.toLowerCase()) ||
      voice.displayName.toLowerCase().includes(voiceSearchTerm.toLowerCase()) ||
      voice.voiceName.toLowerCase().includes(voiceSearchTerm.toLowerCase()) ||
      voice.textPreview.toLowerCase().includes(voiceSearchTerm.toLowerCase());
    
    if (voiceFilterPlan === 'all') return matchesSearch;
    if (voiceFilterPlan === 'free') return matchesSearch && voice.accountStatus === 'free';
    if (voiceFilterPlan === 'pro') return matchesSearch && voice.accountStatus === 'pro';
    
    return matchesSearch;
  });

  const pendingPayments = payments.filter(p => p.status === 'pending');
  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.status === 'active').length;
  const inactiveUsers = users.filter(u => u.status === 'inactive').length;
  const proUsers = users.filter(u => u.accountStatus === 'pro').length;
  const totalVoiceGenerations = voiceGenerations.length;
  const freeUserVoices = voiceGenerations.filter(v => v.accountStatus === 'free').length;
  const proUserVoices = voiceGenerations.filter(v => v.accountStatus === 'pro').length;
  const activeBroadcastMessages = broadcastMessages.filter(msg => msg.active).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
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
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Admin Dashboard
            </h1>
            <button
              onClick={loadData}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalUsers}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Active Users</p>
                  <p className="text-2xl font-bold text-green-600">{activeUsers}</p>
                </div>
                <UserCheck className="h-8 w-8 text-green-600" />
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Pro Users</p>
                  <p className="text-2xl font-bold text-purple-600">{proUsers}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Voice Generations</p>
                  <p className="text-2xl font-bold text-indigo-600">{totalVoiceGenerations}</p>
                </div>
                <Volume2 className="h-8 w-8 text-indigo-600" />
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Pending Payments</p>
                  <p className="text-2xl font-bold text-orange-600">{pendingPayments.length}</p>
                </div>
                <CreditCard className="h-8 w-8 text-orange-600" />
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Active Messages</p>
                  <p className="text-2xl font-bold text-red-600">{activeBroadcastMessages}</p>
                </div>
                <MessageSquare className="h-8 w-8 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Pending Payments Alert */}
        {pendingPayments.length > 0 && (
          <div className="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-xl p-4 mb-8">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mr-2" />
              <p className="text-yellow-700 dark:text-yellow-300 font-medium">
                {pendingPayments.length} payment{pendingPayments.length > 1 ? 's' : ''} pending approval
              </p>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 mb-8">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('users')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'users'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span>Users ({totalUsers})</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('payments')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'payments'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <CreditCard className="h-4 w-4" />
                  <span>Payments ({payments.length})</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('voices')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'voices'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Mic className="h-4 w-4" />
                  <span>Voice Generations ({totalVoiceGenerations})</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('messages')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'messages'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <MessageSquare className="h-4 w-4" />
                  <span>Broadcast Messages ({broadcastMessages.length})</span>
                </div>
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'users' && (
              <>
                {/* Search and Filter */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search users by email or name..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  
                  <div className="relative">
                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="pl-10 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    >
                      <option value="all">All Users</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="pro">Pro Users</option>
                      <option value="free">Free Users</option>
                    </select>
                  </div>
                </div>

                {/* Users Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Plan
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Voices Used
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Joined
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {filteredUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
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
                            <div className="flex items-center space-x-2">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                user.status === 'active' 
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                              }`}>
                                {user.status === 'active' ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              user.accountStatus === 'pro'
                                ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                            }`}>
                              {user.accountStatus === 'pro' ? user.plan || 'Pro' : 'Free'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {user.voicesGenerated || 0}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {user.createdAt.toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => {
                                  setSelectedUser(user);
                                  setShowUserModal(true);
                                }}
                                className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleUserStatusToggle(user)}
                                disabled={actionLoading === user.id}
                                className={`${
                                  user.status === 'active'
                                    ? 'text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300'
                                    : 'text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300'
                                } disabled:opacity-50`}
                              >
                                {actionLoading === user.id ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                                ) : user.status === 'active' ? (
                                  <UserX className="h-4 w-4" />
                                ) : (
                                  <UserCheck className="h-4 w-4" />
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {activeTab === 'payments' && (
              <div className="overflow-x-auto">
                <table className="w-full">
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
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {payments.map((payment) => (
                      <tr key={payment.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {payment.userEmail}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {payment.plan} ({payment.planDuration})
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            Rs. {payment.amount}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-mono text-gray-900 dark:text-white">
                            {payment.tid}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            payment.status === 'approved' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : payment.status === 'rejected'
                              ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          }`}>
                            {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {payment.createdAt.toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {payment.status === 'pending' && (
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handlePaymentAction(payment, 'approve')}
                                disabled={actionLoading === payment.id}
                                className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 disabled:opacity-50"
                              >
                                {actionLoading === payment.id ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                                ) : (
                                  <CheckCircle className="h-4 w-4" />
                                )}
                              </button>
                              <button
                                onClick={() => handlePaymentAction(payment, 'reject')}
                                disabled={actionLoading === payment.id}
                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50"
                              >
                                <XCircle className="h-4 w-4" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'voices' && (
              <>
                {/* Voice Generations Search and Filter */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search by user, voice name, or text..."
                      value={voiceSearchTerm}
                      onChange={(e) => setVoiceSearchTerm(e.target.value)}
                      className="pl-10 w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  
                  <div className="relative">
                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <select
                      value={voiceFilterPlan}
                      onChange={(e) => setVoiceFilterPlan(e.target.value)}
                      className="pl-10 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    >
                      <option value="all">All Plans</option>
                      <option value="free">Free Users</option>
                      <option value="pro">Pro Users</option>
                    </select>
                  </div>
                </div>

                {/* Voice Generation Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Total Generations</p>
                        <p className="text-xl font-bold text-gray-900 dark:text-white">{totalVoiceGenerations}</p>
                      </div>
                      <Volume2 className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Free User Voices</p>
                        <p className="text-xl font-bold text-gray-900 dark:text-white">{freeUserVoices}</p>
                      </div>
                      <Users className="h-6 w-6 text-gray-600" />
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Pro User Voices</p>
                        <p className="text-xl font-bold text-purple-600">{proUserVoices}</p>
                      </div>
                      <TrendingUp className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                </div>

                {/* Voice Generations Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Plan
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Voice Used
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Text Preview
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Length
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Generated
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Type
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {filteredVoiceGenerations.map((voice) => (
                        <tr key={voice.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {voice.displayName}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {voice.userEmail}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              voice.accountStatus === 'pro'
                                ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                            }`}>
                              {voice.plan}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 dark:text-white">
                              {voice.voiceName}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900 dark:text-white max-w-xs truncate">
                              "{voice.textPreview}"
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {voice.textLength} chars
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-3 w-3" />
                              <span>{voice.generatedAt.toLocaleDateString()}</span>
                            </div>
                            <div className="text-xs text-gray-400">
                              {voice.generatedAt.toLocaleTimeString()}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              voice.isApiGenerated
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                            }`}>
                              {voice.isApiGenerated ? 'API' : 'Demo'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  {filteredVoiceGenerations.length === 0 && (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 dark:text-gray-400">No voice generations found</p>
                    </div>
                  )}
                </div>
              </>
            )}

            {activeTab === 'messages' && (
              <>
                {/* Broadcast Messages Header */}
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Broadcast Messages
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Send popup messages to all users when they log in
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setShowMessageForm(true);
                      setEditingMessage(null);
                      setMessageTitle('');
                      setMessageDescription('');
                    }}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    <span>New Message</span>
                  </button>
                </div>

                {/* Active Message Alert */}
                {activeBroadcastMessages > 0 && (
                  <div className="bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-xl p-4 mb-6">
                    <div className="flex items-center">
                      <MessageSquare className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
                      <p className="text-green-700 dark:text-green-300 font-medium">
                        {activeBroadcastMessages} active message{activeBroadcastMessages > 1 ? 's' : ''} will be shown to users
                      </p>
                    </div>
                  </div>
                )}

                {/* Messages List */}
                <div className="space-y-4">
                  {broadcastMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`bg-white dark:bg-gray-800 rounded-xl border-2 p-6 ${
                        message.active 
                          ? 'border-green-200 dark:border-green-700 bg-green-50 dark:bg-green-900' 
                          : 'border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                              {message.title}
                            </h4>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              message.active
                                ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                            }`}>
                              {message.active ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          <p className="text-gray-600 dark:text-gray-300 mb-3">
                            {message.description}
                          </p>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            Created: {message.createdAt.toLocaleDateString()} at {message.createdAt.toLocaleTimeString()}
                            {message.updatedAt.getTime() !== message.createdAt.getTime() && (
                              <span className="ml-4">
                                Updated: {message.updatedAt.toLocaleDateString()} at {message.updatedAt.toLocaleTimeString()}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          <button
                            onClick={() => handleEditMessage(message)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                            title="Edit message"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleToggleMessageStatus(message)}
                            disabled={actionLoading === message.id}
                            className={`${
                              message.active
                                ? 'text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300'
                                : 'text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300'
                            } disabled:opacity-50`}
                            title={message.active ? 'Deactivate message' : 'Activate message'}
                          >
                            {actionLoading === message.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                            ) : message.active ? (
                              <XCircle className="h-4 w-4" />
                            ) : (
                              <CheckCircle className="h-4 w-4" />
                            )}
                          </button>
                          <button
                            onClick={() => handleDeleteMessage(message)}
                            disabled={actionLoading === message.id}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50"
                            title="Delete message"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {broadcastMessages.length === 0 && (
                    <div className="text-center py-12">
                      <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        No broadcast messages yet
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400 mb-4">
                        Create your first message to communicate with all users
                      </p>
                      <button
                        onClick={() => {
                          setShowMessageForm(true);
                          setEditingMessage(null);
                          setMessageTitle('');
                          setMessageDescription('');
                        }}
                        className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Create Message</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* User Details Modal */}
        {showUserModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    User Details
                  </h3>
                  <button
                    onClick={() => setShowUserModal(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <XCircle className="h-6 w-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Display Name
                      </label>
                      <p className="text-gray-900 dark:text-white">{selectedUser.displayName}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Email
                      </label>
                      <p className="text-gray-900 dark:text-white">{selectedUser.email}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Account Status
                      </label>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        selectedUser.status === 'active' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {selectedUser.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Plan
                      </label>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        selectedUser.accountStatus === 'pro'
                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        {selectedUser.accountStatus === 'pro' ? selectedUser.plan || 'Pro' : 'Free'}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Voices Generated
                      </label>
                      <p className="text-gray-900 dark:text-white">{selectedUser.voicesGenerated || 0}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Joined Date
                      </label>
                      <p className="text-gray-900 dark:text-white">{selectedUser.createdAt.toLocaleDateString()}</p>
                    </div>
                    {selectedUser.planExpiry && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Plan Expiry
                        </label>
                        <p className="text-gray-900 dark:text-white">{selectedUser.planExpiry.toLocaleDateString()}</p>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => handleUserStatusToggle(selectedUser)}
                      disabled={actionLoading === selectedUser.id}
                      className={`w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 ${
                        selectedUser.status === 'active'
                          ? 'bg-red-600 text-white hover:bg-red-700'
                          : 'bg-green-600 text-white hover:bg-green-700'
                      }`}
                    >
                      {actionLoading === selectedUser.id ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>{selectedUser.status === 'active' ? 'Deactivating...' : 'Activating...'}</span>
                        </>
                      ) : (
                        <>
                          {selectedUser.status === 'active' ? (
                            <UserX className="h-4 w-4" />
                          ) : (
                            <UserCheck className="h-4 w-4" />
                          )}
                          <span>{selectedUser.status === 'active' ? 'Deactivate Account' : 'Activate Account'}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Broadcast Message Form Modal */}
        {showMessageForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {editingMessage ? 'Edit Broadcast Message' : 'Create Broadcast Message'}
                  </h3>
                  <button
                    onClick={() => {
                      setShowMessageForm(false);
                      setEditingMessage(null);
                      setMessageTitle('');
                      setMessageDescription('');
                    }}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <XCircle className="h-6 w-6" />
                  </button>
                </div>

                <form onSubmit={handleBroadcastMessage} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Message Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={messageTitle}
                      onChange={(e) => setMessageTitle(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter message title"
                      maxLength={100}
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {messageTitle.length}/100 characters
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Message Description *
                    </label>
                    <textarea
                      required
                      value={messageDescription}
                      onChange={(e) => setMessageDescription(e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter message description"
                      maxLength={500}
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {messageDescription.length}/500 characters
                    </p>
                  </div>

                  {!editingMessage && (
                    <div className="p-4 bg-blue-50 dark:bg-blue-900 rounded-lg border border-blue-200 dark:border-blue-700">
                      <div className="flex items-start space-x-2">
                        <MessageSquare className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                            Important Notes:
                          </p>
                          <ul className="text-xs text-blue-600 dark:text-blue-400 mt-1 space-y-1">
                            <li>• This message will be shown to all users when they log in</li>
                            <li>• Only one message can be active at a time</li>
                            <li>• Creating this message will deactivate any existing active messages</li>
                            <li>• Users can dismiss the popup by clicking the close button</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex space-x-3 pt-4">
                    <button
                      type="submit"
                      disabled={messageSubmitting || !messageTitle.trim() || !messageDescription.trim()}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-semibold"
                    >
                      {messageSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          {editingMessage ? 'Updating...' : 'Creating...'}
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          {editingMessage ? 'Update Message' : 'Send to All Users'}
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowMessageForm(false);
                        setEditingMessage(null);
                        setMessageTitle('');
                        setMessageDescription('');
                      }}
                      disabled={messageSubmitting}
                      className="px-6 py-3 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors disabled:opacity-50 font-semibold"
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
