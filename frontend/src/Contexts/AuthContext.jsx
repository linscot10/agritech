// // src/contexts/AuthContext.jsx
// import { createContext, useContext, useState, useEffect } from 'react'
// import { authAPI } from '../utils/api'

// const AuthContext = createContext()

// export const useAuth = () => {
//   const context = useContext(AuthContext)
//   if (!context) {
//     throw new Error('useAuth must be used within an AuthProvider')
//   }
//   return context
// }

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null)
//   const [loading, setLoading] = useState(true)
//   const [token, setToken] = useState(localStorage.getItem('token'))

//   useEffect(() => {
//     if (token) {
//       authAPI.getMe(token)
//         .then(response => {
//           setUser(response.data)
//           setLoading(false)
//         })
//         .catch(() => {
//           localStorage.removeItem('token')
//           setToken(null)
//           setLoading(false)
//         })
//     } else {
//       setLoading(false)
//     }
//   }, [token])

//   const login = async (email, password) => {
//     try {
//       const response = await authAPI.login({ email, password })
//       const { token: newToken, user: userData } = response.data
//       localStorage.setItem('token', newToken)
//       setToken(newToken)
//       setUser(userData)
//       return { success: true }
//     } catch (error) {
//       return { 
//         success: false, 
//         message: error.response?.data?.message || 'Login failed' 
//       }
//     }
//   }

//   const register = async (userData) => {
//     try {
//       const response = await authAPI.register(userData)
//       setToken(newToken)
//       const { token: newToken, user: userData } = response.data
//       localStorage.setItem('token', newToken)
//       setUser(userData)
//       console.log(response)
//       return { success: true }
//     } catch (error) {
//       return { 
//         success: false, 
//         message: error.response?.data?.message || 'Registration failed' 
//       }
//     }
//   }
  

//   const logout = () => {
//     localStorage.removeItem('token')
//     setToken(null)
//     setUser(null)
//   }

//   const value = {
//     user,
//     login,
//     register,
//     logout,
//     loading,
//     token
//   }

//   return (
//     <AuthContext.Provider value={value}>
//       {children}
//     </AuthContext.Provider>
//   )
// }


// src/Contexts/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../utils/api'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(localStorage.getItem('token'))

  useEffect(() => {
    if (token) {
      authAPI.getMe()
        .then(response => {
          setUser(response.data)
        })
        .catch(() => {
          localStorage.removeItem('token')
          setToken(null)
        })
        .finally(() => {
          setLoading(false)
        })
    } else {
      setLoading(false)
    }
  }, [token])

  const login = async (email, password) => {
    try {
      const response = await authAPI.login({ email, password })
      const { token: newToken, user: userData } = response.data
      
      localStorage.setItem('token', newToken)
      setToken(newToken)
      setUser(userData)
      
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      }
    }
  }

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData)
      const { token: newToken, user: registeredUser } = response.data  // Fixed line here
      
      localStorage.setItem('token', newToken)
      setToken(newToken)
      setUser(registeredUser)
      
      return { success: true }
    } catch (error) {
      console.error('Registration error:', error)
      return { 
        success: false, 
        message: error.response?.data?.message || 'Registration failed' 
      }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
  }

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    token
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
