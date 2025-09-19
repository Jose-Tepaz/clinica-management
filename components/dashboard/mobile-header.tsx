"use client"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu } from "lucide-react"
import { SidebarContent } from "./sidebar"
import { useAuth } from "@/hooks/use-auth"

export function MobileHeader() {
  const { isAdmin, isLoading, handleLogout } = useAuth()
  return (
    <div className="lg:hidden flex items-center justify-between p-4 bg-primary text-primary-foreground">
      <div className="flex items-center">
        <div className="w-8 h-8 bg-primary-foreground/20 rounded-lg flex items-center justify-center mr-3">
          <svg className="w-5 h-5 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h1 className="text-lg font-semibold">WO.MENS</h1>
      </div>
      
      <Sheet>
        <SheetTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-primary-foreground hover:bg-primary-foreground/20"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Abrir menú</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0 bg-primary border-primary">
          <SidebarContent 
            isAdmin={isAdmin} 
            onLogout={handleLogout} 
            isLoading={isLoading} 
          />
        </SheetContent>
      </Sheet>
    </div>
  )
}
