import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function RegisterSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-lg bg-card-foreground text-secondary">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <CardTitle className="text-2xl font-bold text-primary">¡Registro Exitoso!</CardTitle>
            <CardDescription className="text-secondary">Verifica tu correo electrónico para continuar</CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-muted">
              Te hemos enviado un enlace de confirmación a tu correo electrónico. Por favor, revisa tu bandeja de
              entrada y haz clic en el enlace para activar tu cuenta.
            </p>
            <div className="pt-4">
              <Button asChild variant="outline" className="w-full bg-transparent">
                <Link href="/auth/login">Volver al Inicio de Sesión</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
