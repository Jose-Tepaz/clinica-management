"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useState, useEffect } from "react"

interface SidebarProps {
  className?: string
}

const mainNavigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
        />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
      </svg>
    ),
  },
  {
    name: "Pacientes",
    href: "/dashboard/patients",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
        />
      </svg>
    ),
  },
  {
    name: "Citas",
    href: "/dashboard/appointments",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2z"
        />
      </svg>
    ),
  },
]

const adminNavigation = [
  {
    name: "Doctores",
    href: "/dashboard/doctors",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
        />
      </svg>
    ),
  },
  {
    name: "Servicios",
    href: "/dashboard/services",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
        />
      </svg>
    ),
  },
]

export function Sidebar({ className }: SidebarProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)

  useEffect(() => {
    const getUserRole = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
        setUserRole(profile?.role || null)
      }
    }

    getUserRole()
  }, [])

  const handleLogout = async () => {
    setIsLoading(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  const isAdmin = userRole === "admin"

  return (
    <div className={cn("pb-12 w-64", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="flex items-center mb-6">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-primary-foreground">WO.MENS</h2>
          </div>
          <ScrollArea className="h-[calc(100vh-200px)]">
            <div className="space-y-1">
              {mainNavigation.map((item) => (
                <Button key={item.name} variant="ghost" className="w-full justify-start text-primary-foreground hover:bg-secondary " asChild>
                  <Link href={item.href}>
                    {item.icon}
                    <span className="ml-2">{item.name}</span>
                  </Link> 
                </Button>
              ))}

              {isAdmin && (
                <>
                  <Separator className="my-4" />
                  <div className="px-2 py-2">
                    <h3 className="text-xs font-semibold text-primary-foreground uppercase tracking-wider">
                      Administración
                    </h3>
                  </div>
                  {adminNavigation.map((item) => (
                    <Button key={item.name} variant="ghost" className="w-full justify-start text-primary-foreground" asChild>
                      <Link href={item.href}>
                        {item.icon}
                        <span className="ml-2">{item.name}</span>
                      </Link>
                    </Button>
                  ))}
                </>
              )}
            </div>
          </ScrollArea>
        </div>
        <div className="px-3">
          <Button variant="outline" className="w-full bg-secondary text-secondary" onClick={handleLogout} disabled={isLoading}>
            {isLoading ? "Cerrando sesión..." : "Cerrar Sesión"}
          </Button>
        </div>
      </div>
    </div>
  )
}
