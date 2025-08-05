import { AppLayout } from "@/components/app-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TermsPage() {
  return (
    <AppLayout>
      <div className="container mx-auto px-6 py-8 max-w-4xl">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">Términos y Condiciones</h1>
            <p className="text-muted-foreground">
              Última actualización:{" "}
              {new Date().toLocaleDateString("es-ES", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>

          {/* Introduction */}
          <Card>
            <CardHeader>
              <CardTitle>1. Introducción</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Bienvenido a Wearly. Estos términos y condiciones ("Términos") rigen el uso de nuestro sitio web y
                servicios. Al acceder o usar Wearly, aceptas estar sujeto a estos Términos.
              </p>
              <p className="text-muted-foreground">
                Si no estás de acuerdo con alguna parte de estos términos, no debes usar nuestros servicios.
              </p>
            </CardContent>
          </Card>

          {/* User Accounts */}
          <Card>
            <CardHeader>
              <CardTitle>2. Cuentas de Usuario</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">2.1 Registro</h4>
                <p className="text-muted-foreground">
                  Para usar ciertas funciones de Wearly, debes crear una cuenta. Debes proporcionar información precisa
                  y mantenerla actualizada.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">2.2 Responsabilidad de la Cuenta</h4>
                <p className="text-muted-foreground">
                  Eres responsable de mantener la confidencialidad de tu cuenta y contraseña, y de todas las actividades
                  que ocurran bajo tu cuenta.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">2.3 Edad Mínima</h4>
                <p className="text-muted-foreground">
                  Debes tener al menos 13 años para usar Wearly. Si eres menor de 18 años, necesitas el consentimiento
                  de tus padres o tutores.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Content and Conduct */}
          <Card>
            <CardHeader>
              <CardTitle>3. Contenido y Conducta</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">3.1 Tu Contenido</h4>
                <p className="text-muted-foreground">
                  Mantienes la propiedad de todo el contenido que publicas en Wearly. Al publicar contenido, nos otorgas
                  una licencia para usar, mostrar y distribuir ese contenido en nuestra plataforma.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">3.2 Contenido Prohibido</h4>
                <p className="text-muted-foreground">No puedes publicar contenido que sea:</p>
                <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                  <li>Ilegal, dañino o amenazante</li>
                  <li>Difamatorio o que viole la privacidad</li>
                  <li>Spam o contenido comercial no autorizado</li>
                  <li>Que infrinja derechos de autor o propiedad intelectual</li>
                  <li>Contenido para adultos o inapropiado</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">3.3 Moderación</h4>
                <p className="text-muted-foreground">
                  Nos reservamos el derecho de revisar, editar o eliminar cualquier contenido que viole estos términos.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Privacy */}
          <Card>
            <CardHeader>
              <CardTitle>4. Privacidad</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Tu privacidad es importante para nosotros. Nuestra Política de Privacidad explica cómo recopilamos,
                usamos y protegemos tu información personal.
              </p>
            </CardContent>
          </Card>

          {/* Intellectual Property */}
          <Card>
            <CardHeader>
              <CardTitle>5. Propiedad Intelectual</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Wearly y su contenido original, características y funcionalidad son propiedad de Wearly y están
                protegidos por derechos de autor, marcas comerciales y otras leyes de propiedad intelectual.
              </p>
              <p className="text-muted-foreground">
                No puedes usar nuestras marcas comerciales, logotipos o contenido sin nuestro permiso expreso por
                escrito.
              </p>
            </CardContent>
          </Card>

          {/* Termination */}
          <Card>
            <CardHeader>
              <CardTitle>6. Terminación</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Podemos terminar o suspender tu cuenta inmediatamente, sin previo aviso, por cualquier motivo,
                incluyendo si violas estos Términos.
              </p>
              <p className="text-muted-foreground">
                Puedes terminar tu cuenta en cualquier momento contactándonos o eliminando tu cuenta desde la
                configuración.
              </p>
            </CardContent>
          </Card>

          {/* Disclaimers */}
          <Card>
            <CardHeader>
              <CardTitle>7. Limitación de Responsabilidad</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Wearly se proporciona "tal como está" sin garantías de ningún tipo. No garantizamos que el servicio sea
                ininterrumpido, seguro o libre de errores.
              </p>
              <p className="text-muted-foreground">
                En ningún caso seremos responsables por daños indirectos, incidentales, especiales o consecuentes.
              </p>
            </CardContent>
          </Card>

          {/* Changes */}
          <Card>
            <CardHeader>
              <CardTitle>8. Cambios a los Términos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Nos reservamos el derecho de modificar estos términos en cualquier momento. Te notificaremos sobre
                cambios significativos publicando los nuevos términos en esta página.
              </p>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card>
            <CardHeader>
              <CardTitle>9. Contacto</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Si tienes preguntas sobre estos Términos y Condiciones, puedes contactarnos en:
              </p>
              <div className="mt-4 space-y-2">
                <p className="text-muted-foreground">Email: legal@wearly.com</p>
                <p className="text-muted-foreground">Dirección: [Tu dirección]</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}
