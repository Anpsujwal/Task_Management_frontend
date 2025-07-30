import React, { createContext, useState } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [type,setType]=useState(null)
  const login = ({userData,type}) => 
    {setUser(userData);
      setType(type);
    }
  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user,type, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};