import React, { createContext, useState, useContext, useEffect } from 'react';
import Cookies from 'js-cookie';

const AuthContext = createContext(null);

// Admin credentials for development
const ADMIN_CREDENTIALS = {
  email: 'admin@aiesec.org',
  password: 'admin123'
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        
        // Load LC from localStorage if not already in user object
        if (!user.lc) {
          const storedLC = localStorage.getItem('userLC');
          if (storedLC) {
            user.lc = storedLC;
          }
        }
        
        setCurrentUser(user);
        setIsAdmin(user.role === 'admin');
      }
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (accessToken, userRole = null, userLC = null, userName = null, currentOffices = null) => {
    try {
      console.log('🔍 [AuthContext] login() called with:', { accessToken: !!accessToken, userRole, userLC, userName, currentOffices });
      
      // For OAuth login, we expect an access token
      if (accessToken) {
        const personId = Cookies.get('person_id');
        const userEmail = Cookies.get('user_email');
        
        console.log('🔍 [AuthContext] Person ID from cookie:', personId);
        console.log('🔍 [AuthContext] User email from cookie:', userEmail);
        
        const oauthUser = {
          id: personId || 'oauth-user',
          email: userEmail || 'user@aiesec.org',
          role: userRole || 'user',
          name: userName || 'OAuth User',
          token: accessToken,
          lc: userLC,
          current_offices: currentOffices || []
        };

        // Store LC in localStorage for persistence
        if (userLC) {
          localStorage.setItem('userLC', userLC);
        }

        // Store in localStorage
        localStorage.setItem('user', JSON.stringify(oauthUser));
        localStorage.setItem('isAdmin', userRole === 'admin' || userRole === 'MCVP' || userRole === 'MCVP' ? 'true' : 'false');

        // Set cookies
        const cookieOptions = {
          expires: 7,
          secure: false, // Set to false for localhost
          sameSite: 'lax'
        };

        Cookies.set('token', accessToken, cookieOptions);
        Cookies.set('userRole', userRole || 'user', cookieOptions);
        Cookies.set('userId', oauthUser.id, cookieOptions);
        Cookies.set('userLC', userLC, cookieOptions);


        setCurrentUser(oauthUser);
        setIsAdmin(userRole === 'admin' || userRole === 'MCVP' || userRole === 'MCVP');
        
        console.log('🔍 [AuthContext] OAuth login successful:', oauthUser);
        return true;
      }
      
      // Fallback to admin login for backward compatibility
      if (typeof accessToken === 'string' && accessToken.includes('@')) {
        const email = accessToken;
        const password = userRole; // In this case, userRole is actually the password
        
        if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
          const adminUser = {
            id: 'admin-1',
            email: ADMIN_CREDENTIALS.email,
            role: 'admin',
            name: 'Admin User',
            token: 'admin-token'
          };

          // Store in localStorage
          localStorage.setItem('user', JSON.stringify(adminUser));
          localStorage.setItem('isAdmin', 'true');

          // Set cookies
          const cookieOptions = {
            expires: 7,
            secure: false,
            sameSite: 'lax'
          };

          Cookies.set('token', adminUser.token, cookieOptions);
          Cookies.set('userRole', 'admin', cookieOptions);
          Cookies.set('userId', adminUser.id, cookieOptions);

          setCurrentUser(adminUser);
          setIsAdmin(true);
          return true;
        }
      }
      
      throw new Error('Invalid credentials');
    } catch (error) {
      console.error('❌ [AuthContext] Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('isAdmin');
    Cookies.remove('token');
    Cookies.remove('userRole');
    Cookies.remove('userId');
    setCurrentUser(null);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      isAdmin,
      loading,
      login,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
