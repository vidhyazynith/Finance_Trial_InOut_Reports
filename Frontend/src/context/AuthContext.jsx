import React, { createContext, useState, useContext, useEffect } from 'react'

const AuthContext = createContext()

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)

  const login = async (email, password) => {
    // Mock login - in real app, this would call your API
    if (email && password) {
      const user = { id: 1, name: 'Admin', email: email }
      setUser(user)
      localStorage.setItem('user', JSON.stringify(user))
      return user
    }
    throw new Error('Invalid credentials')
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
  }

  useEffect(() => {
    // Check if user is logged in on app start
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
  }, [])

  const value = {
    user,
    login,
    logout
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}