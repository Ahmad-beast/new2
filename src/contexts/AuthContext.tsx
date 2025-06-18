import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  subscriptionPlan: 'free' | 'paid';
  subscriptionExpiry: Date | null;
  voiceGenerationsUsed: number;
  voiceGenerationsLimit: number;
  isActive: boolean;
  createdAt: Date;
  accountStatus?: 'free' | 'pro';
  plan?: string;
  planAmount?: number;
  upgradedAt?: Date;
  voicesGenerated?: number;
  planExpiry?: Date;
  status?: 'active' | 'inactive'; // Add status field for account deactivation
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isOffline: boolean;
  logout: () => Promise<void>;
  updateUserProfile: (profile: Partial<UserProfile>) => Promise<void>;
  checkPlanExpiry: () => Promise<void>;
  incrementVoiceGeneration: () => Promise<boolean>;
  getRemainingVoices: () => number;
  getVoiceLimit: () => number;
  isAccountActive: () => boolean; // Add method to check account status
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);

  // Plan limits mapping
  const getPlanLimits = (plan: string, amount?: number) => {
    if (amount === 99 || plan === '1 Day') return 10;
    if (amount === 200 || plan === '7 Days') return 20;
    if (amount === 350 || plan === '15 Days') return 29;
    if (amount === 499 || plan === '30 Days') return -1; // Unlimited
    return 5; // Free plan default
  };

  const getPlanDuration = (plan: string, amount?: number) => {
    if (amount === 99 || plan === '1 Day') return 1;
    if (amount === 200 || plan === '7 Days') return 7;
    if (amount === 350 || plan === '15 Days') return 15;
    if (amount === 499 || plan === '30 Days') return 30;
    return 0; // Free plan
  };

  // Create fallback profile for offline mode
  const createFallbackProfile = (user: User): UserProfile => {
    return {
      uid: user.uid,
      email: user.email || '',
      displayName: user.displayName || user.email?.split('@')[0] || 'User',
      subscriptionPlan: 'free',
      subscriptionExpiry: null,
      voiceGenerationsUsed: 0,
      voiceGenerationsLimit: 5,
      isActive: true,
      createdAt: new Date(),
      accountStatus: 'free',
      voicesGenerated: 0,
      status: 'active'
    };
  };

  // Check if user is in admin mode
  const isAdminMode = () => {
    const isAdmin = localStorage.getItem('isAdmin');
    const adminLoginTime = localStorage.getItem('adminLoginTime');
    
    if (!isAdmin || !adminLoginTime) return false;
    
    // Check if admin session is still valid (24 hours)
    const sessionAge = Date.now() - parseInt(adminLoginTime);
    const isSessionValid = sessionAge < 24 * 60 * 60 * 1000;
    
    if (!isSessionValid) {
      // Clear expired session
      localStorage.removeItem('isAdmin');
      localStorage.removeItem('adminLoginTime');
      return false;
    }
    
    return true;
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      // If in admin mode, skip user profile loading
      if (isAdminMode()) {
        console.log('🔧 Admin mode detected - skipping user profile loading');
        setUserProfile(null);
        setLoading(false);
        setIsOffline(false);
        return;
      }
      
      if (user) {
        try {
          console.log('🔄 Attempting to fetch user profile from Firestore...');
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          
          if (userDoc.exists()) {
            const data = userDoc.data();
            const profile: UserProfile = {
              ...data,
              createdAt: data.createdAt?.toDate() || new Date(),
              subscriptionExpiry: data.subscriptionExpiry?.toDate() || null,
              upgradedAt: data.upgradedAt?.toDate() || null,
              planExpiry: data.planExpiry?.toDate() || null,
              voicesGenerated: data.voicesGenerated || 0,
              accountStatus: data.accountStatus || 'free',
              plan: data.plan || null,
              planAmount: data.planAmount || null,
              status: data.status || 'active' // Default to active if not set
            } as UserProfile;
            
            setUserProfile(profile);
            setIsOffline(false);
            console.log('✅ User profile loaded successfully from Firestore');
            
            // Check plan expiry on load
            await checkPlanExpiryForProfile(profile);
          } else {
            console.log('📝 Creating new user profile...');
            // Create new user profile with proper defaults
            const newProfile: UserProfile = {
              uid: user.uid,
              email: user.email || '',
              displayName: user.displayName || user.email?.split('@')[0] || 'User',
              subscriptionPlan: 'free',
              subscriptionExpiry: null,
              voiceGenerationsUsed: 0,
              voiceGenerationsLimit: 5,
              isActive: true,
              createdAt: new Date(),
              accountStatus: 'free',
              voicesGenerated: 0,
              status: 'active' // Default to active for new users
            };
            
            await setDoc(doc(db, 'users', user.uid), {
              ...newProfile,
              createdAt: new Date(),
              subscriptionExpiry: null,
              upgradedAt: null,
              planExpiry: null
            });
            setUserProfile(newProfile);
            setIsOffline(false);
            console.log('✅ New user profile created successfully');
          }
        } catch (error: any) {
          console.warn('⚠️ Firestore connection failed, using offline mode:', error.message);
          
          // Check if it's a network/offline error
          if (error.message?.includes('offline') || 
              error.message?.includes('network') || 
              error.message?.includes('Failed to get document because the client is offline')) {
            setIsOffline(true);
            console.log('🔌 App is running in offline mode');
            
            // Create a fallback profile for offline use
            const fallbackProfile = createFallbackProfile(user);
            setUserProfile(fallbackProfile);
            console.log('✅ Fallback profile created for offline use');
          } else {
            console.error('❌ Unexpected Firestore error:', error);
            // Still create fallback profile for any other errors
            const fallbackProfile = createFallbackProfile(user);
            setUserProfile(fallbackProfile);
            setIsOffline(true);
          }
        }
      } else {
        setUserProfile(null);
        setIsOffline(false);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const checkPlanExpiryForProfile = async (profile: UserProfile) => {
    if (isOffline || isAdminMode()) {
      console.log('⚠️ Skipping plan expiry check - app is offline or in admin mode');
      return;
    }

    if (profile.accountStatus === 'pro' && profile.planExpiry) {
      const now = new Date();
      if (now > profile.planExpiry) {
        // Plan expired, revert to free
        const updatedProfile = {
          ...profile,
          accountStatus: 'free' as const,
          plan: null,
          planAmount: null,
          voicesGenerated: 0,
          voiceGenerationsLimit: 5,
          subscriptionPlan: 'free' as const
        };
        
        try {
          await setDoc(doc(db, 'users', profile.uid), {
            ...updatedProfile,
            createdAt: updatedProfile.createdAt,
            subscriptionExpiry: null,
            upgradedAt: updatedProfile.upgradedAt,
            planExpiry: null
          }, { merge: true });
          
          setUserProfile(updatedProfile);
          console.log('✅ Plan expired, user reverted to free tier');
        } catch (error) {
          console.warn('⚠️ Error updating expired plan (offline mode):', error);
          // Update locally even if Firestore fails
          setUserProfile(updatedProfile);
        }
      }
    }
  };

  const checkPlanExpiry = async () => {
    if (userProfile && !isAdminMode()) {
      await checkPlanExpiryForProfile(userProfile);
    }
  };

  const logout = async () => {
    try {
      // Clear admin session if exists
      if (isAdminMode()) {
        localStorage.removeItem('isAdmin');
        localStorage.removeItem('adminLoginTime');
        console.log('🔧 Admin session cleared');
      }
      
      // Sign out from Firebase if user is logged in
      if (user) {
        await signOut(auth);
      }
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    if ((!user && !isAdminMode()) || !userProfile) return;

    try {
      const updatedProfile = { ...userProfile, ...updates };
      
      // If upgrading to pro, set plan expiry and limits
      if (updates.accountStatus === 'pro' && updates.plan && updates.planAmount) {
        const durationDays = getPlanDuration(updates.plan, updates.planAmount);
        const planExpiry = new Date();
        planExpiry.setDate(planExpiry.getDate() + durationDays);
        
        const voiceLimit = getPlanLimits(updates.plan, updates.planAmount);
        
        updatedProfile.planExpiry = planExpiry;
        updatedProfile.voiceGenerationsLimit = voiceLimit === -1 ? 999999 : voiceLimit; // Set high number for unlimited
        updatedProfile.voicesGenerated = 0; // Reset counter for new plan
        updatedProfile.subscriptionPlan = 'paid';
      }
      
      // Update local state immediately
      setUserProfile(updatedProfile);
      
      // Try to update Firestore if online and not in admin mode
      if (!isOffline && !isAdminMode() && user) {
        await setDoc(doc(db, 'users', user.uid), {
          ...updatedProfile,
          createdAt: updatedProfile.createdAt,
          subscriptionExpiry: updatedProfile.subscriptionExpiry,
          upgradedAt: updatedProfile.upgradedAt,
          planExpiry: updatedProfile.planExpiry
        }, { merge: true });
        console.log('✅ User profile updated in Firestore');
      } else {
        console.log('⚠️ Profile updated locally only (offline mode or admin mode)');
      }
    } catch (error) {
      console.warn('⚠️ Error updating user profile:', error);
      // Update local state even if Firestore fails
      setUserProfile(prev => prev ? { ...prev, ...updates } : null);
    }
  };

  const isAccountActive = (): boolean => {
    if (!userProfile) return false;
    return userProfile.status === 'active' && userProfile.isActive !== false;
  };

  const incrementVoiceGeneration = async (): Promise<boolean> => {
    if ((!user && !isAdminMode()) || !userProfile) return false;

    // Check if account is active first
    if (!isAccountActive()) {
      console.log('❌ Account is deactivated, cannot generate voice');
      return false;
    }

    // Check plan expiry first (skip if offline or admin mode)
    if (!isOffline && !isAdminMode()) {
      await checkPlanExpiry();
    }
    
    const currentProfile = userProfile;
    const currentVoices = currentProfile.voicesGenerated || 0;
    
    // Check limits based on plan
    if (currentProfile.accountStatus === 'pro') {
      const limit = getPlanLimits(currentProfile.plan || '', currentProfile.planAmount);
      
      // If unlimited plan (30 days), allow generation
      if (limit === -1) {
        try {
          await updateUserProfile({ voicesGenerated: currentVoices + 1 });
          return true;
        } catch (error) {
          console.error('Error incrementing voice generation:', error);
          return false;
        }
      }
      
      // Check if limit reached for other plans
      if (currentVoices >= limit) {
        return false; // Limit reached
      }
    } else {
      // Free plan - check free limit
      if (currentVoices >= 5) {
        return false; // Free limit reached
      }
    }

    // Increment counter
    try {
      await updateUserProfile({ voicesGenerated: currentVoices + 1 });
      return true;
    } catch (error) {
      console.error('Error incrementing voice generation:', error);
      return false;
    }
  };

  const getRemainingVoices = (): number => {
    if (!userProfile || !isAccountActive()) return 0;
    
    const currentVoices = userProfile.voicesGenerated || 0;
    
    if (userProfile.accountStatus === 'pro') {
      const limit = getPlanLimits(userProfile.plan || '', userProfile.planAmount);
      if (limit === -1) return 999999; // Unlimited
      return Math.max(0, limit - currentVoices);
    } else {
      return Math.max(0, 5 - currentVoices);
    }
  };

  const getVoiceLimit = (): number => {
    if (!userProfile || !isAccountActive()) return 0;
    
    if (userProfile.accountStatus === 'pro') {
      const limit = getPlanLimits(userProfile.plan || '', userProfile.planAmount);
      return limit === -1 ? 999999 : limit;
    } else {
      return 5;
    }
  };

  const value = {
    user,
    userProfile,
    loading,
    isOffline,
    logout,
    updateUserProfile,
    checkPlanExpiry,
    incrementVoiceGeneration,
    getRemainingVoices,
    getVoiceLimit,
    isAccountActive
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
