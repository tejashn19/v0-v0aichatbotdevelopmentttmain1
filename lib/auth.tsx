"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

export interface User {
  id: string
  email: string
  name: string
  picture?: string
  createdAt: Date
  lastLoginAt?: Date
  emailVerified?: boolean
  provider: "google" | "email"
}

interface AuthContextType {
  user: User | null
  loading: boolean
  signInWithGoogle: () => Promise<void>
  signInWithEmail: (email: string, password: string, rememberMe?: boolean) => Promise<void>
  signUpWithEmail: (email: string, password: string, name: string) => Promise<void>
  resetPassword: (email: string) => Promise<void>
  resendVerification: (email: string) => Promise<void>
  signOut: () => Promise<void>
  updateUser: (updates: Partial<User>) => void
  validateSession: () => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const validateSession = async (): Promise<boolean> => {
    try {
      const savedUser = localStorage.getItem("chatxpert_user")
      const sessionExpiry = localStorage.getItem("chatxpert_session_expiry")
      const rememberMe = localStorage.getItem("chatxpert_remember_me") === "true"

      if (savedUser && sessionExpiry) {
        const expiryDate = new Date(sessionExpiry)
        const now = new Date()

        if (expiryDate <= now) {
          if (rememberMe) {
            const newExpiry = new Date()
            newExpiry.setDate(newExpiry.getDate() + 30)
            localStorage.setItem("chatxpert_session_expiry", newExpiry.toISOString())
            return true
          } else {
            await signOut()
            return false
          }
        }
        return true
      }
      return false
    } catch (error) {
      console.error("Session validation error:", error)
      return false
    }
  }

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const isValidSession = await validateSession()

        if (isValidSession) {
          const savedUser = localStorage.getItem("chatxpert_user")
          if (savedUser) {
            const parsedUser = JSON.parse(savedUser)
            setUser({
              ...parsedUser,
              createdAt: new Date(parsedUser.createdAt),
              lastLoginAt: parsedUser.lastLoginAt ? new Date(parsedUser.lastLoginAt) : undefined,
            })
          }
        }
      } catch (error) {
        console.error("Error initializing auth:", error)
        localStorage.removeItem("chatxpert_user")
        localStorage.removeItem("chatxpert_session_expiry")
        localStorage.removeItem("chatxpert_profile")
        localStorage.removeItem("chatxpert_remember_me")
      }
      setLoading(false)
    }

    initializeAuth()
  }, [])

  const signInWithGoogle = async () => {
    try {
      setLoading(true)
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Simulate Gmail OAuth popup and user selection
      const gmailDomains = ["gmail.com", "googlemail.com"]
      const randomDomain = gmailDomains[Math.floor(Math.random() * gmailDomains.length)]
      const randomNames = ["John Doe", "Sarah Smith", "Mike Johnson", "Emily Davis", "Alex Wilson"]
      const randomName = randomNames[Math.floor(Math.random() * randomNames.length)]
      const emailPrefix = randomName.toLowerCase().replace(" ", ".")

      const mockUser: User = {
        id: "google-user-" + Date.now(),
        email: `${emailPrefix}@${randomDomain}`,
        name: randomName,
        picture: `https://lh3.googleusercontent.com/a/default-user=s96-c?seed=${Date.now()}`,
        createdAt: new Date(),
        lastLoginAt: new Date(),
        emailVerified: true,
        provider: "google",
      }

      setUser(mockUser)

      const expiryDate = new Date()
      expiryDate.setDate(expiryDate.getDate() + 7)

      localStorage.setItem("chatxpert_user", JSON.stringify(mockUser))
      localStorage.setItem("chatxpert_session_expiry", expiryDate.toISOString())
      localStorage.setItem("chatxpert_remember_me", "true")
    } catch (error) {
      console.error("Google sign in error:", error)
      throw new Error("Failed to sign in with Google. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const signInWithEmail = async (email: string, password: string, rememberMe = false) => {
    try {
      setLoading(true)

      if (!email || !email.includes("@")) {
        throw new Error("Please enter a valid email address")
      }

      if (!password || password.length < 6) {
        throw new Error("Password must be at least 6 characters long")
      }

      await new Promise((resolve) => setTimeout(resolve, 1000))

      const mockUser: User = {
        id: "email-user-" + Date.now(),
        email: email,
        name: email
          .split("@")[0]
          .replace(/[^a-zA-Z]/g, " ")
          .replace(/\b\w/g, (l) => l.toUpperCase()),
        picture: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
        createdAt: new Date(),
        lastLoginAt: new Date(),
        emailVerified: Math.random() > 0.3,
        provider: "email",
      }

      setUser(mockUser)

      const expiryDate = new Date()
      if (rememberMe) {
        expiryDate.setDate(expiryDate.getDate() + 30)
      } else {
        expiryDate.setHours(expiryDate.getHours() + 24)
      }

      localStorage.setItem("chatxpert_user", JSON.stringify(mockUser))
      localStorage.setItem("chatxpert_session_expiry", expiryDate.toISOString())
      localStorage.setItem("chatxpert_remember_me", rememberMe.toString())
    } catch (error) {
      console.error("Email sign in error:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signUpWithEmail = async (email: string, password: string, name: string) => {
    try {
      setLoading(true)

      if (!email || !email.includes("@")) {
        throw new Error("Please enter a valid email address")
      }

      if (!password || password.length < 6) {
        throw new Error("Password must be at least 6 characters long")
      }

      if (!name || name.trim().length < 2) {
        throw new Error("Please enter your full name")
      }

      await new Promise((resolve) => setTimeout(resolve, 1200))

      const mockUser: User = {
        id: "new-user-" + Date.now(),
        email: email,
        name: name.trim(),
        picture: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
        createdAt: new Date(),
        lastLoginAt: new Date(),
        emailVerified: false,
        provider: "email",
      }

      setUser(mockUser)

      const expiryDate = new Date()
      expiryDate.setHours(expiryDate.getHours() + 24)

      localStorage.setItem("chatxpert_user", JSON.stringify(mockUser))
      localStorage.setItem("chatxpert_session_expiry", expiryDate.toISOString())
      localStorage.setItem("chatxpert_remember_me", "false")
    } catch (error) {
      console.error("Email sign up error:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async (email: string) => {
    try {
      if (!email || !email.includes("@")) {
        throw new Error("Please enter a valid email address")
      }

      await new Promise((resolve) => setTimeout(resolve, 1000))

      console.log(`Password reset email sent to ${email}`)
    } catch (error) {
      console.error("Password reset error:", error)
      throw error
    }
  }

  const resendVerification = async (email: string) => {
    try {
      if (!email || !email.includes("@")) {
        throw new Error("Please enter a valid email address")
      }

      await new Promise((resolve) => setTimeout(resolve, 800))

      console.log(`Verification email sent to ${email}`)
    } catch (error) {
      console.error("Resend verification error:", error)
      throw error
    }
  }

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates }
      setUser(updatedUser)
      localStorage.setItem("chatxpert_user", JSON.stringify(updatedUser))
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      setUser(null)
      localStorage.removeItem("chatxpert_user")
      localStorage.removeItem("chatxpert_session_expiry")
      localStorage.removeItem("chatxpert_profile")
      localStorage.removeItem("chatxpert_remember_me")

      await new Promise((resolve) => setTimeout(resolve, 500))
    } catch (error) {
      console.error("Sign out error:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        resetPassword,
        resendVerification,
        signOut,
        updateUser,
        validateSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
