import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export default async function HomePage() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getUser()

  // Si hay usuario, redirigir al dashboard
  if (data?.user) {
    redirect("/dashboard")
  }

  // Si no hay usuario, redirigir al login
  redirect("/auth/login")
}
