import React, { useState } from 'react';
import { BookOpen, ChevronRight, Search, FileText, Users, BarChart3, Calendar, Scissors, Monitor, User, Globe, Bell, Settings, HelpCircle } from 'lucide-react';

const sections = [
  {
    id: 'overview',
    title: 'Que es Barberia El Bronx?',
    icon: <FileText className="h-4 w-4" />,
    content: `Barberia El Bronx es un sistema de gestion integral para barberias. Permite administrar citas, clientes, barberos, estaciones de trabajo, servicios y ver estadisticas del negocio en tiempo real.

El sistema esta dividido en dos partes principales:
- **Panel Administrativo**: Para administradores y barberos. Gestiona toda la operacion del negocio.
- **Portal del Cliente**: Para clientes finales. Permite agendar citas, ver historial y gestionar su perfil.`,
  },
  {
    id: 'roles',
    title: 'Roles y Permisos',
    icon: <Users className="h-4 w-4" />,
    content: `El sistema maneja tres tipos de acceso:

### Administrador
- Ve y edita toda la informacion del negocio
- Gestiona barberos, estaciones, servicios y clientes
- Ve estadisticas completas de ingresos y desempeno
- Cambia el estado de cualquier cita
- **Puede eliminar cualquier registro**: citas, clientes, barberos, servicios y estaciones
- Accede a la configuracion del negocio y al manual de ayuda

### Barbero
- Ve sus propias citas y agenda
- Cambia el estado de sus citas (pendiente, confirmada, completada, cancelada)
- Ve sus estadisticas de ingresos y desempeno personal
- Ve la lista de clientes que ha atendido
- **Puede eliminar solo sus propias citas** (no las de otros barberos)
- NO puede crear/editar/eliminar barberos, estaciones, servicios ni clientes
- NO puede acceder a la configuracion del negocio ni al manual de ayuda

### Cliente
- Se registra e inicia sesion con **correo electronico y codigo OTP de 6 digitos**
- Agenda citas eligiendo servicio, fecha y hora
- Ve su historial de citas
- Edita su perfil (nombre, telefono, email)
- Puede cancelar sus propias citas mientras esten pendientes o confirmadas`,
  },
  {
    id: 'dashboard',
    title: 'Dashboard / Resumen',
    icon: <BarChart3 className="h-4 w-4" />,
    content: `El dashboard muestra las metricas principales del negocio.

**KPIs principales:**
- **Ingresos confirmados**: Dinero de citas confirmadas en el periodo seleccionado
- **Ingresos completados**: Dinero de citas ya realizadas
- **Ticket promedio**: Valor promedio por cita completada
- **Citas periodo anterior**: Cantidad de citas del periodo anterior para comparar

**Estado de Citas:**
- Pendientes: Citas agendadas pero no confirmadas
- Confirmadas: Citas validadas por el barbero/admin
- Completadas: Citas ya realizadas
- Canceladas: Citas canceladas

**Agenda del Dia:**
Muestra las citas de cada barbero para la fecha seleccionada. Los barberos solo ven su propia agenda.`,
  },
  {
    id: 'appointments',
    title: 'Gestion de Citas',
    icon: <Calendar className="h-4 w-4" />,
    content: `Las citas son el corazon del sistema. Una cita representa una reserva de un servicio para un cliente en una fecha/hora especifica.

**Flujo de una cita:**
1. El cliente agenda desde el portal web escaneando QR o con Google
2. La cita se crea con estado "pendiente"
3. El barbero/admin la confirma
4. El dia de la cita, se marca como "completada" o "no-show"
5. Si es necesario, se puede cancelar

**Estados disponibles:**
- pendiente: Recien creada, esperando confirmacion
- confirmada: Validada por el barbero o admin
- completada: Servicio ya realizado
- cancelada: Cita cancelada
- no-show: Cliente no se presento

**Como editar una cita:**
1. Clic en el icono de edicion (lapiz) sobre la cita
2. Modificar los campos necesarios
3. Guardar cambios

**Como cambiar el estado:**
1. Usar el selector de estado en la tarjeta de la cita
2. O desde la agenda del dia

**Reglas de negocio:**
- No se puede agendar en horarios ocupados
- La cancelacion requiere anticipacion minima (configurable)
- Los barberos solo pueden modificar SUS propias citas
- **Eliminacion**: El administrador puede eliminar cualquier cita. Los barberos solo pueden eliminar sus propias citas.`,
  },
  {
    id: 'barbers',
    title: 'Gestion de Barberos',
    icon: <Scissors className="h-4 w-4" />,
    content: `Los barberos son los usuarios que atienden las citas. Cada barbero puede tener una o mas estaciones de trabajo asignadas.

**Campos de un barbero:**
- Nombre: Nombre completo del barbero
- Email: Correo electronico (opcional)
- Telefono: Numero de contacto
- Estado: Activo o inactivo

**Acciones disponibles (solo admin):**
- Crear nuevo barbero
- Editar datos del barbero
- Desactivar barbero (no se elimina, solo se marca inactivo)

**Credenciales de acceso:**
Los barberos inician sesion con usuario y contrasena. El usuario se crea automaticamente al registrar el barbero, o se puede configurar manualmente en la base de datos.

**Nota:** Desactivar un barbero no elimina su historial de citas. Sus citas pasadas se mantienen para estadisticas.`,
  },
  {
    id: 'workstations',
    title: 'Estaciones de Trabajo',
    icon: <Monitor className="h-4 w-4" />,
    content: `Las estaciones son los puestos fisicos donde trabajan los barberos. Cada estacion puede estar asignada a un barbero especifico.

**Campos de una estacion:**
- Nombre: Identificador del puesto (ej: "Puesto 1 - Marco")
- Barbero: Barbero asignado a esta estacion
- Estado: Activa o inactiva

**Como funciona en las citas:**
Cuando un cliente elige una estacion al agendar, la cita se asigna automaticamente al barbero de esa estacion.

**Acciones disponibles:**
- Admin: Crea, edita y desactiva estaciones
- Barbero: Solo ve sus propias estaciones asignadas`,
  },
  {
    id: 'services',
    title: 'Servicios',
    icon: <Scissors className="h-4 w-4" />,
    content: `Los servicios son los trabajos que se pueden agendar. Cada servicio tiene duracion, precio y categoria.

**Categorias disponibles:**
- 'corte': Cortes de cabello
- 'barba': Arreglo de barba
- 'cejas': Perfilado de cejas
- 'combo': Paquetes combinados
- 'premium': Servicios premium
- 'luxury': Servicios luxury

**Campos de un servicio:**
- Nombre: Nombre del servicio
- Categoria: Tipo de servicio
- Duracion: Tiempo en minutos
- Precio: Costo en pesos colombianos
- Descripcion: Detalles del servicio
- Popular: Marcar como servicio destacado
- Estado: Activo o inactivo

**Acciones disponibles (solo admin):**
- Crear nuevo servicio
- Editar servicio existente
- Desactivar servicio

**Nota:** Los servicios desactivados no aparecen en el portal del cliente.`,
  },
  {
    id: 'clients',
    title: 'Clientes',
    icon: <User className="h-4 w-4" />,
    content: `Los clientes son las personas que agendan citas. Cada cliente se identifica por su telefono, email o cuenta de Google.

**Campos de un cliente:**
- Nombre: Nombre completo
- Telefono: Numero de 10 digitos (opcional)
- Email: Correo electronico (identificador unico para acceso)
- Codigo QR: Codigo unico para acceso rapido (opcional)
- Notas: Observaciones adicionales
- Total de visitas: Cantidad de citas completadas
- Ultima visita: Fecha de la ultima cita

**Acciones disponibles:**
- Admin: Crear, editar, eliminar y ver todos los clientes
- Barbero: Ver solo clientes que ha atendido
- Cliente: Ver y editar solo su propio perfil

**Acceso de clientes:**
Los clientes pueden iniciar sesion de tres formas:
1. **Correo electronico**: Ingresa su email, recibe un codigo OTP de 6 digitos por correo y lo ingresa
2. **Google**: Iniciando sesion con su cuenta de Google
3. **Telefono**: Ingresando su numero y verificando con codigo OTP por WhatsApp

**Clientes inactivos:**
El sistema detecta automaticamente clientes que no han agendado en mas de 40 dias. Esto ayuda a crear campanas de re-engagement.`,
  },
  {
    id: 'client-portal',
    title: 'Portal del Cliente',
    icon: <Globe className="h-4 w-4" />,
    content: `El portal del cliente es la parte publica de la barberia donde los usuarios pueden agendar sus citas sin necesidad de llamar.

**Como agendar una cita:**
1. El cliente ingresa a la pagina web
2. Selecciona el servicio deseado
3. Elige la fecha en el calendario
4. Selecciona el horario disponible
5. Ingresa sus datos (nombre, telefono, email opcional)
6. Confirma la reserva
7. Recibe confirmacion por WhatsApp y correo electronico

**Inicio de sesion:**
- **Correo electronico**: Ingresa tu email, recibe un codigo OTP de 6 digitos por correo, lo ingresas y accedes
- **Google**: Usa "Iniciar sesion con Google" para entrar con tu cuenta de Google
- **Telefono**: Ingresa tu numero, recibe un codigo OTP por WhatsApp, lo ingresas y accedes

**Perfil del cliente:**
- Ver historial de citas
- Ver estado de cada cita
- Editar nombre, telefono y email
- Cerrar sesion

**Notificaciones:**
- Confirmacion de cita por WhatsApp y correo electronico
- Recordatorio de cita (opcional)
- Codigo de verificacion OTP por correo o WhatsApp`,
  },
  {
    id: 'notifications',
    title: 'Notificaciones',
    icon: <Bell className="h-4 w-4" />,
    content: `El sistema registra todas las notificaciones enviadas y permite automatizar el envio por correo electronico.

**Tipos de notificacion:**
- Confirmacion de booking: Se envia automaticamente cuando se crea una cita
- Recordatorio: Se envia el dia anterior a la cita
- Verificacion: Codigo de acceso para clientes por correo o WhatsApp

**Proveedores soportados:**
- **Gmail**: SMTP de Gmail (requiere contrasena de aplicacion)
- **Outlook/Hotmail**: SMTP de Office365
- **Yahoo**: SMTP de Yahoo Mail
- Configurable mediante la variable EMAIL_PROVIDER en el archivo .env

**Configuracion:**
Para enviar notificaciones reales, es necesario configurar:
- WhatsApp: Meta WhatsApp Cloud API o Twilio
- Email: Gmail, Outlook, Yahoo o cualquier SMTP
- Las variables se configuran en el archivo '.env' del backend

Las notificaciones se registran en la tabla 'notifications' de la base de datos para auditoria.`,
  },
  {
    id: 'settings',
    title: 'Configuracion del Negocio',
    icon: <Settings className="h-4 w-4" />,
    content: `La configuracion del negocio permite definir los datos publicos que se muestran en el portal del cliente.

**Campos configurables:**
- Nombre del negocio: Se muestra en el navbar, footer y titulos
- Nombre del barbero: Titulo secundario
- Direccion: Direccion fisica del local
- Telefono: Numero de contacto publico
- WhatsApp: Numero para agendamiento
- Email: Correo de contacto
- Instagram: Usuario de Instagram
- Facebook: Nombre de pagina de Facebook
- TikTok: Usuario de TikTok
- YouTube: Canal de YouTube

**Como acceder:**
Solo administradores pueden acceder a la configuracion. Se encuentra en el dashboard, boton "Configuracion".

**Importante:** Los cambios se reflejan inmediatamente en el portal del cliente.`,
  },
  {
    id: 'faq',
    title: 'Preguntas Frecuentes',
    icon: <HelpCircle className="h-4 w-4" />,
    content: `**P: No puedo iniciar sesion como barbero**
R: Verifica que el barbero este activo en la base de datos. El usuario y contrasena son sensibles a mayusculas.

**P: Un cliente no recibe el codigo OTP por correo**
R: Verifica que el servicio de email este configurado correctamente (Gmail, Outlook o Yahoo SMTP). Actualmente las notificaciones se registran en la base de datos.

**P: No aparecen horarios disponibles**
R: Verifica que haya estaciones activas y que los horarios no esten ocupados por otras citas.

**P: Como cambio la duracion de un servicio?**
R: Solo el administrador puede editar servicios desde la seccion "Servicios".

**P: Los barberos ven citas de otros barberos?**
R: No. Cada barbero solo ve sus propias citas y su propia agenda.

**P: Como elimino una cita?**
R: Los administradores pueden eliminar cualquier cita. Los barberos solo pueden eliminar sus propias citas.

**P: Como elimino un cliente?**
R: Solo el administrador puede eliminar clientes desde la seccion "Clientes".

**P: Como elimino un servicio?**
R: Solo el administrador puede eliminar servicios desde la seccion "Servicios".

**P: Que significa "buffer_minutes_between_appointments"?**
R: Son los minutos de descanso entre citas. Si esta en 0, las citas se pueden agenda una tras otra sin descanso.

**P: Como actualizo la pagina del cliente?**
R: El sitio web es una SPA (Single Page Application). Los cambios se reflejan al recargar la pagina.

**P: Como accede un cliente con correo?**
R: El cliente debe ingresar su correo electronico en el portal, recibir un codigo OTP de 6 digitos por correo y ingresarlo para acceder automaticamente sin necesidad de telefono o contrasena.`,
  },
];

const Help = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSections = sections.filter(
    (section) =>
      section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      section.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeContent = sections.find((s) => s.id === activeSection);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="section-title">Manual de Usuario</h2>
          <p className="text-sm text-stone mt-1">
            Guia completa del sistema Barberia El Bronx
          </p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-stone-faint" />
          <input
            type="text"
            placeholder="Buscar en el manual..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-4 py-2.5 border border-cream-line rounded-xl text-sm bg-white focus:ring-2 focus:ring-gold/30 focus:border-gold outline-none transition-all duration-200 text-ink-soft w-full sm:w-64"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <div className="card-premium p-3 sm:p-4 lg:sticky lg:top-6">
            <nav className="space-y-1">
              {filteredSections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => {
                    setActiveSection(section.id);
                    setSearchQuery('');
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    activeSection === section.id
                      ? 'bg-gold/15 text-gold-deep shadow-sm'
                      : 'text-stone hover:text-ink-soft hover:bg-cream'
                  }`}
                >
                  <span className="flex-shrink-0">{section.icon}</span>
                  <span className="truncate text-left">{section.title}</span>
                  {activeSection === section.id && (
                    <ChevronRight className="h-4 w-4 ml-auto flex-shrink-0 text-gold" />
                  )}
                </button>
              ))}
            </nav>
            {filteredSections.length === 0 && (
              <p className="text-sm text-stone-faint text-center py-4">
                No se encontraron resultados para "{searchQuery}"
              </p>
            )}
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="card-premium p-5 sm:p-8">
            {activeContent && (
              <div className="prose prose-stone max-w-none">
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-gold">{React.cloneElement(activeContent.icon, { className: 'h-8 w-8' })}</span>
                  <h3 className="font-serif text-2xl text-ink-soft m-0">
                    {activeContent.title}
                  </h3>
                </div>
                <div className="text-sm text-stone leading-relaxed whitespace-pre-line">
                  {activeContent.content}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Help;
