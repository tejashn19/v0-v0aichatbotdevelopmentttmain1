"use client"

export interface UserProfile {
  id: string
  userId: string
  firstName: string
  lastName: string
  bio: string
  location: string
  website: string
  phone: string
  preferences: {
    theme: "light" | "dark" | "system"
    language: string
    notifications: boolean
    emailUpdates: boolean
    soundEnabled: boolean
  }
  updatedAt: Date
  version: number
}

export function validateProfile(profile: Partial<UserProfile>): string[] {
  const errors: string[] = []

  if (profile.firstName && profile.firstName.length > 50) {
    errors.push("First name must be less than 50 characters")
  }

  if (profile.lastName && profile.lastName.length > 50) {
    errors.push("Last name must be less than 50 characters")
  }

  if (profile.bio && profile.bio.length > 500) {
    errors.push("Bio must be less than 500 characters")
  }

  if (profile.website && profile.website.length > 0) {
    const urlPattern = /^https?:\/\/.+\..+/
    if (!urlPattern.test(profile.website)) {
      errors.push("Website must be a valid URL (include http:// or https://)")
    }
  }

  if (profile.phone && profile.phone.length > 0) {
    const phonePattern = /^[+]?[1-9][\d]{0,15}$/
    if (!phonePattern.test(profile.phone.replace(/[\s\-$$$$]/g, ""))) {
      errors.push("Please enter a valid phone number")
    }
  }

  return errors
}

export async function saveProfile(profile: Partial<UserProfile>): Promise<void> {
  try {
    // Validate profile data
    const errors = validateProfile(profile)
    if (errors.length > 0) {
      throw new Error(errors.join(", "))
    }

    const existingProfile = getProfile()
    const updatedProfile = {
      ...existingProfile,
      ...profile,
      updatedAt: new Date(),
      version: (existingProfile?.version || 0) + 1,
    }

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 800))

    localStorage.setItem("chatxpert_profile", JSON.stringify(updatedProfile))

    // Trigger custom event for profile updates
    window.dispatchEvent(new CustomEvent("profileUpdated", { detail: updatedProfile }))
  } catch (error) {
    console.error("Error saving profile:", error)
    throw error
  }
}

export function getProfile(): UserProfile | null {
  try {
    const saved = localStorage.getItem("chatxpert_profile")
    if (saved) {
      const profile = JSON.parse(saved)
      return {
        ...profile,
        updatedAt: new Date(profile.updatedAt),
      }
    }
    return null
  } catch (error) {
    console.error("Error loading profile:", error)
    return null
  }
}

export function createDefaultProfile(userId: string): UserProfile {
  return {
    id: "profile-" + Date.now(),
    userId,
    firstName: "",
    lastName: "",
    bio: "",
    location: "",
    website: "",
    phone: "",
    preferences: {
      theme: "dark",
      language: "en",
      notifications: true,
      emailUpdates: false,
      soundEnabled: true,
    },
    updatedAt: new Date(),
    version: 1,
  }
}

export function exportProfile(): string {
  const profile = getProfile()
  if (!profile) {
    throw new Error("No profile found to export")
  }
  return JSON.stringify(profile, null, 2)
}

export function importProfile(profileData: string): UserProfile {
  try {
    const profile = JSON.parse(profileData)
    const errors = validateProfile(profile)
    if (errors.length > 0) {
      throw new Error("Invalid profile data: " + errors.join(", "))
    }
    return profile
  } catch (error) {
    throw new Error("Failed to import profile: Invalid JSON format")
  }
}
