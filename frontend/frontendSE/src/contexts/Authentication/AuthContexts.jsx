import { useState } from 'react';
import AuthContext from './authContext';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const loginUser = (userData) => setUser(userData);
  const logoutUser = () => setUser(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: Boolean(user),
        loginUser,
        logoutUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}