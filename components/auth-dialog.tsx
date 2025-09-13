"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Mail, Chrome, Eye, EyeOff, AlertCircle, CheckCircle, RotateCcw, Shield } from "lucide-react"
import { useAuth } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"
import { Checkbox } from "@/components/ui/checkbox"

interface AuthDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AuthDialog({ open, onOpenChange }: AuthDialogProps) {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail, resetPassword, resendVerification, loading } = useAuth()
  const { toast } = useToast()
  const [isSigningIn, setIsSigningIn] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)

  // Sign in form state
  const [signInData, setSignInData] = useState({
    email: "",
    password: "",
  })

  // Sign up form state
  const [signUpData, setSignUpData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  const handleGoogleSignIn = async () => {
    try {
      setIsSigningIn(true)
      setError("")
      setSuccess("Redirecting to Google for secure authentication...")
      await signInWithGoogle()
      onOpenChange(false)
      toast({
        title: "Welcome to CHATXPERT!",
        description: "Successfully signed in with your Gmail account.",
      })
    } catch (error: any) {
      setError(error.message || "Failed to sign in with Google")
      setSuccess("")
    } finally {
      setIsSigningIn(false)
    }
  }

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setIsSigningIn(true)
      setError("")
      setSuccess("")
      await signInWithEmail(signInData.email, signInData.password, rememberMe)
      onOpenChange(false)
      toast({
        title: "Welcome back!",
        description: rememberMe ? "Successfully signed in. You'll stay logged in." : "Successfully signed in.",
      })
    } catch (error: any) {
      setError(error.message || "Failed to sign in")
    } finally {
      setIsSigningIn(false)
    }
  }

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault()

    if (signUpData.password !== signUpData.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    try {
      setIsSigningIn(true)
      setError("")
      await signUpWithEmail(signUpData.email, signUpData.password, signUpData.name)
      onOpenChange(false)
      toast({
        title: "Account created!",
        description: "Welcome to CHATXPERT. Your account has been created successfully.",
      })
    } catch (error: any) {
      setError(error.message || "Failed to create account")
    } finally {
      setIsSigningIn(false)
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setIsSigningIn(true)
      setError("")
      await resetPassword(signInData.email)
      setSuccess("Password reset instructions have been sent to your email.")
      setShowForgotPassword(false)
      toast({
        title: "Reset email sent",
        description: "Check your email for password reset instructions.",
      })
    } catch (error: any) {
      setError(error.message || "Failed to send reset email")
    } finally {
      setIsSigningIn(false)
    }
  }

  const handleResendVerification = async () => {
    try {
      setIsSigningIn(true)
      setError("")
      await resendVerification(signUpData.email)
      setSuccess("Verification email has been resent.")
      toast({
        title: "Verification email sent",
        description: "Check your email to verify your account.",
      })
    } catch (error: any) {
      setError(error.message || "Failed to resend verification email")
    } finally {
      setIsSigningIn(false)
    }
  }

  const resetForm = () => {
    setSignInData({ email: "", password: "" })
    setSignUpData({ name: "", email: "", password: "", confirmPassword: "" })
    setError("")
    setSuccess("")
    setShowPassword(false)
    setShowForgotPassword(false)
    setRememberMe(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        onOpenChange(open)
        if (!open) resetForm()
      }}
    >
      <DialogContent className="sm:max-w-md inception-layer">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold text-foreground">Welcome to CHATXPERT</DialogTitle>
          <DialogDescription className="text-center text-muted-foreground">
            Sign in to access your profile and personalized chat experience
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mt-4 border-green-200 bg-green-50 text-green-800">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <TabsContent value="signin" className="space-y-4">
            {showForgotPassword ? (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="text-center">
                  <h3 className="text-lg font-semibold">Reset Password</h3>
                  <p className="text-sm text-muted-foreground">
                    Enter your email address and we'll send you reset instructions.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reset-email">Email</Label>
                  <Input
                    id="reset-email"
                    type="email"
                    value={signInData.email}
                    onChange={(e) => setSignInData((prev) => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter your email"
                    required
                    disabled={isSigningIn}
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowForgotPassword(false)}
                    disabled={isSigningIn}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button type="submit" disabled={isSigningIn || !signInData.email} className="flex-1 inception-button">
                    {isSigningIn ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <RotateCcw className="w-4 h-4 mr-2" />
                    )}
                    {isSigningIn ? "Sending..." : "Send Reset"}
                  </Button>
                </div>
              </form>
            ) : (
              <>
                <Button
                  onClick={handleGoogleSignIn}
                  disabled={loading || isSigningIn}
                  className="w-full inception-button flex items-center gap-3 h-12 bg-[#4285f4] hover:bg-[#3367d6] text-white border-0"
                >
                  {isSigningIn ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <div className="flex items-center gap-2">
                      <Chrome className="w-5 h-5" />
                      <Shield className="w-4 h-4" />
                    </div>
                  )}
                  {isSigningIn ? "Connecting to Gmail..." : "Sign in with Gmail"}
                </Button>

                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Secure authentication powered by Google OAuth 2.0</p>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or</span>
                  </div>
                </div>

                <form onSubmit={handleEmailSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      value={signInData.email}
                      onChange={(e) => setSignInData((prev) => ({ ...prev, email: e.target.value }))}
                      placeholder="Enter your email"
                      required
                      disabled={isSigningIn}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <div className="relative">
                      <Input
                        id="signin-password"
                        type={showPassword ? "text" : "password"}
                        value={signInData.password}
                        onChange={(e) => setSignInData((prev) => ({ ...prev, password: e.target.value }))}
                        placeholder="Enter your password"
                        required
                        disabled={isSigningIn}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isSigningIn}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="remember-me"
                        checked={rememberMe}
                        onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                        disabled={isSigningIn}
                      />
                      <Label htmlFor="remember-me" className="text-sm">
                        Remember me
                      </Label>
                    </div>
                    <Button
                      type="button"
                      variant="link"
                      className="px-0 text-sm"
                      onClick={() => setShowForgotPassword(true)}
                      disabled={isSigningIn}
                    >
                      Forgot password?
                    </Button>
                  </div>

                  <Button
                    type="submit"
                    disabled={isSigningIn || !signInData.email || !signInData.password}
                    className="w-full inception-button h-12"
                  >
                    {isSigningIn ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Mail className="w-5 h-5 mr-2" />
                    )}
                    {isSigningIn ? "Signing in..." : "Sign In"}
                  </Button>
                </form>
              </>
            )}
          </TabsContent>

          <TabsContent value="signup" className="space-y-4">
            <form onSubmit={handleEmailSignUp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signup-name">Full Name</Label>
                <Input
                  id="signup-name"
                  type="text"
                  value={signUpData.name}
                  onChange={(e) => setSignUpData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter your full name"
                  required
                  disabled={isSigningIn}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  value={signUpData.email}
                  onChange={(e) => setSignUpData((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter your email"
                  required
                  disabled={isSigningIn}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <div className="relative">
                  <Input
                    id="signup-password"
                    type={showPassword ? "text" : "password"}
                    value={signUpData.password}
                    onChange={(e) => setSignUpData((prev) => ({ ...prev, password: e.target.value }))}
                    placeholder="Create a password (min. 6 characters)"
                    required
                    minLength={6}
                    disabled={isSigningIn}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isSigningIn}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-confirm">Confirm Password</Label>
                <Input
                  id="signup-confirm"
                  type={showPassword ? "text" : "password"}
                  value={signUpData.confirmPassword}
                  onChange={(e) => setSignUpData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                  placeholder="Confirm your password"
                  required
                  disabled={isSigningIn}
                />
              </div>

              <Button
                type="submit"
                disabled={
                  isSigningIn ||
                  !signUpData.name ||
                  !signUpData.email ||
                  !signUpData.password ||
                  !signUpData.confirmPassword
                }
                className="w-full inception-button h-12"
              >
                {isSigningIn ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Mail className="w-5 h-5 mr-2" />
                )}
                {isSigningIn ? "Creating account..." : "Create Account"}
              </Button>

              {signUpData.email && (
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-2">Didn't receive verification email?</p>
                  <Button
                    type="button"
                    variant="link"
                    className="text-xs"
                    onClick={handleResendVerification}
                    disabled={isSigningIn}
                  >
                    Resend verification email
                  </Button>
                </div>
              )}
            </form>
          </TabsContent>
        </Tabs>

        <p className="text-xs text-center text-muted-foreground">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </DialogContent>
    </Dialog>
  )
}
