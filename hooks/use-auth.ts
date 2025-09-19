"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export function useAuth() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [isLoadingRole, setIsLoadingRole] = useState(true)

  useEffect(() => {
    const getUserRole = async () => {
      try {
        const supabase = createClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (user) {
          const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
          setUserRole(profile?.role || null)
        }
      } catch (error) {
        console.error("Error fetching user role:", error)
      } finally {
        setIsLoadingRole(false)
      }
    }

    getUserRole()
  }, [])

  const handleLogout = async () => {
    setIsLoading(true)
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push("/auth/login")
    } catch (error) {
      console.error("Error during logout:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return {
    userRole,
    isLoading,
    isLoadingRole,
    handleLogout,
    isAdmin: userRole === "admin"
  }
}
