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
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  logout: () => Promise<void>;
  updateUserProfile: (profile: Partial<UserProfile>) => Promise<void>;
  checkPlanExpiry: () => Promise<void>;
  incrementVoiceGeneration: () => Promise<boolean>;
  getRemainingVoices: () => number;
  getVoiceLimit: () => number;
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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      if (user) {
        try {
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
              planAmount: data.planAmount || null
            } as UserProfile;
            
            setUserProfile(profile);
            
            // Check plan expiry on load
            await checkPlanExpiryForProfile(profile);
          } else {
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
              voicesGenerated: 0
            };
            
            await setDoc(doc(db, 'users', user.uid), {
              ...newProfile,
              createdAt: new Date(),
              subscriptionExpiry: null,
              upgradedAt: null,
              planExpiry: null
            });
            setUserProfile(newProfile);
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
          // Create a minimal profile if Firestore fails
          const fallbackProfile: UserProfile = {
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
            voicesGenerated: 0
          };
          setUserProfile(fallbackProfile);
        }
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const checkPlanExpiryForProfile = async (profile: UserProfile) => {
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
          console.log('Plan expired, user reverted to free tier');
        } catch (error) {
          console.error('Error updating expired plan:', error);
        }
      }
    }
  };

  const checkPlanExpiry = async () => {
    if (userProfile) {
      await checkPlanExpiryForProfile(userProfile);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    if (!user || !userProfile) return;

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
      
      await setDoc(doc(db, 'users', user.uid), {
        ...updatedProfile,
        createdAt: updatedProfile.createdAt,
        subscriptionExpiry: updatedProfile.subscriptionExpiry,
        upgradedAt: updatedProfile.upgradedAt,
        planExpiry: updatedProfile.planExpiry
      }, { merge: true });
      
      setUserProfile(updatedProfile);
    } catch (error) {
      console.error('Error updating user profile:', error);
      // Update local state even if Firestore fails
      setUserProfile(prev => prev ? { ...prev, ...updates } : null);
    }
  };

  const incrementVoiceGeneration = async (): Promise<boolean> => {
    if (!user || !userProfile) return false;

    // Check plan expiry first
    await checkPlanExpiry();
    
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
    if (!userProfile) return 0;
    
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
    if (!userProfile) return 5;
    
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
    logout,
    updateUserProfile,
    checkPlanExpiry,
    incrementVoiceGeneration,
    getRemainingVoices,
    getVoiceLimit
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};