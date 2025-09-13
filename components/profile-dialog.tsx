"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  User,
  Settings,
  Bell,
  Save,
  X,
  Download,
  Upload,
  AlertCircle,
  CheckCircle2,
  Volume2,
  VolumeX,
  Mail,
} from "lucide-react"
import { useAuth } from "@/lib/auth"
import {
  type UserProfile,
  saveProfile,
  getProfile,
  createDefaultProfile,
  validateProfile,
  exportProfile,
  importProfile,
} from "@/lib/profile"
import { useToast } from "@/hooks/use-toast"

interface ProfileDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ProfileDialog({ open, onOpenChange }: ProfileDialogProps) {
  const { user, updateUser } = useAuth()
  const { toast } = useToast()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const [hasChanges, setHasChanges] = useState(false)
  const [originalProfile, setOriginalProfile] = useState<UserProfile | null>(null)

  useEffect(() => {
    if (user && open) {
      const existingProfile = getProfile()
      if (existingProfile && existingProfile.userId === user.id) {
        setProfile(existingProfile)
        setOriginalProfile(JSON.parse(JSON.stringify(existingProfile)))
      } else {
        const defaultProfile = createDefaultProfile(user.id)
        setProfile(defaultProfile)
        setOriginalProfile(JSON.parse(JSON.stringify(defaultProfile)))
      }
      setHasChanges(false)
      setErrors([])
    }
  }, [user, open])

  useEffect(() => {
    if (profile && originalProfile) {
      const changed = JSON.stringify(profile) !== JSON.stringify(originalProfile)
      setHasChanges(changed)

      // Real-time validation
      const validationErrors = validateProfile(profile)
      setErrors(validationErrors)
    }
  }, [profile, originalProfile])

  const handleSave = async () => {
    if (!profile || !user) return

    if (errors.length > 0) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors before saving.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)
      await saveProfile(profile)

      // Update user name if changed
      const fullName = `${profile.firstName} ${profile.lastName}`.trim()
      if (fullName && fullName !== user.name) {
        updateUser({ name: fullName })
      }

      setOriginalProfile(JSON.parse(JSON.stringify(profile)))
      setHasChanges(false)

      toast({
        title: "Profile saved",
        description: "Your profile has been updated successfully.",
      })
      onOpenChange(false)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleExport = () => {
    try {
      const profileData = exportProfile()
      const blob = new Blob([profileData], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `chatxpert-profile-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast({
        title: "Profile exported",
        description: "Your profile has been downloaded as a JSON file.",
      })
    } catch (error: any) {
      toast({
        title: "Export failed",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const profileData = e.target?.result as string
        const importedProfile = importProfile(profileData)
        setProfile({ ...importedProfile, userId: user!.id })
        toast({
          title: "Profile imported",
          description: "Your profile has been imported successfully.",
        })
      } catch (error: any) {
        toast({
          title: "Import failed",
          description: error.message,
          variant: "destructive",
        })
      }
    }
    reader.readAsText(file)
    event.target.value = "" // Reset input
  }

  const updateProfile = (updates: Partial<UserProfile>) => {
    if (profile) {
      setProfile({ ...profile, ...updates })
    }
  }

  const updatePreferences = (key: keyof UserProfile["preferences"], value: any) => {
    if (profile) {
      setProfile({
        ...profile,
        preferences: {
          ...profile.preferences,
          [key]: value,
        },
      })
    }
  }

  if (!user || !profile) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto inception-layer">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-foreground flex items-center gap-2">
            <User className="w-5 h-5" />
            Profile Settings
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Manage your account information and preferences
          </DialogDescription>
        </DialogHeader>

        {errors.length > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <ul className="list-disc list-inside space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card className="inception-layer">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Personal Information
                </CardTitle>
                <CardDescription>Update your personal details and contact information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={user.picture || "/placeholder.svg"} alt={user.name} />
                    <AvatarFallback className="text-lg">
                      {user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-foreground">{user.name}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    <p className="text-xs text-muted-foreground">Member since {user.createdAt.toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={profile.firstName}
                      onChange={(e) => updateProfile({ firstName: e.target.value })}
                      placeholder="Enter your first name"
                      maxLength={50}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={profile.lastName}
                      onChange={(e) => updateProfile({ lastName: e.target.value })}
                      placeholder="Enter your last name"
                      maxLength={50}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={profile.bio}
                    onChange={(e) => updateProfile({ bio: e.target.value })}
                    placeholder="Tell us about yourself..."
                    rows={3}
                    maxLength={500}
                  />
                  <p className="text-xs text-muted-foreground text-right">{profile.bio.length}/500 characters</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={profile.location}
                      onChange={(e) => updateProfile({ location: e.target.value })}
                      placeholder="City, Country"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={profile.phone}
                      onChange={(e) => updateProfile({ phone: e.target.value })}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={profile.website}
                    onChange={(e) => updateProfile({ website: e.target.value })}
                    placeholder="https://yourwebsite.com"
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button variant="outline" onClick={handleExport} size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export Profile
                  </Button>
                  <div className="relative">
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImport}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <Button variant="outline" size="sm">
                      <Upload className="w-4 h-4 mr-2" />
                      Import Profile
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences" className="space-y-6">
            <Card className="inception-layer">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  App Preferences
                </CardTitle>
                <CardDescription>Customize your CHATXPERT experience</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Theme</Label>
                    <p className="text-sm text-muted-foreground">Choose your preferred appearance</p>
                  </div>
                  <Select
                    value={profile.preferences.theme}
                    onValueChange={(value: "light" | "dark" | "system") => updatePreferences("theme", value)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Language</Label>
                    <p className="text-sm text-muted-foreground">Select your preferred language</p>
                  </div>
                  <Select
                    value={profile.preferences.language}
                    onValueChange={(value) => updatePreferences("language", value)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                      <SelectItem value="it">Italian</SelectItem>
                      <SelectItem value="pt">Portuguese</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base flex items-center gap-2">
                      <Bell className="w-4 h-4" />
                      Push Notifications
                    </Label>
                    <p className="text-sm text-muted-foreground">Receive notifications about updates and features</p>
                  </div>
                  <Switch
                    checked={profile.preferences.notifications}
                    onCheckedChange={(checked) => updatePreferences("notifications", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email Updates
                    </Label>
                    <p className="text-sm text-muted-foreground">Receive email updates about new features</p>
                  </div>
                  <Switch
                    checked={profile.preferences.emailUpdates}
                    onCheckedChange={(checked) => updatePreferences("emailUpdates", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base flex items-center gap-2">
                      {profile.preferences.soundEnabled ? (
                        <Volume2 className="w-4 h-4" />
                      ) : (
                        <VolumeX className="w-4 h-4" />
                      )}
                      Sound Effects
                    </Label>
                    <p className="text-sm text-muted-foreground">Enable sound effects for interactions</p>
                  </div>
                  <Switch
                    checked={profile.preferences.soundEnabled}
                    onCheckedChange={(checked) => updatePreferences("soundEnabled", checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between items-center pt-4 border-t border-border">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {hasChanges && (
              <>
                <AlertCircle className="w-4 h-4 text-amber-500" />
                <span>You have unsaved changes</span>
              </>
            )}
            {!hasChanges && originalProfile && (
              <>
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span>All changes saved</span>
              </>
            )}
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isLoading || !hasChanges || errors.length > 0}
              className="inception-button"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save Profile
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
