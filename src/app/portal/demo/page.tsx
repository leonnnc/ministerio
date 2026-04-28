'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePersonalStore } from '@/stores/personalStore';
import { useAlumnosStore } from '@/stores/alumnosStore';
import { useSalonesStore } from '@/stores/salonesStore';
import { useAgendaStore, proximosDomingos, SERVICIOS_DOMINGO } from '@/stores/agendaStore';
import { useAuthStore } from '@/stores/authStore';
import type { Personal, Alumno, Apoderado } from '@/types';

const MAESTROS_DEMO: { nombre: string; email: string }[] = [
  { nombre: 'Ana García',        email: 'ana.garcia@ministerio.com' },
  { nombre: 'María López',       email: 'maria.lopez@ministerio.com' },
  { nombre: 'Carmen Rodríguez',  email: 'carmen.rodriguez@ministerio.com' },
  { nombre: 'Laura Martínez',    email: 'laura.martinez@ministerio.com' },
  { nombre: 'Isabel Sánchez',    email: 'isabel.sanchez@ministerio.com' },
  { nombre: 'Patricia Flores',   email: 'patricia.flores@ministerio.com' },
  { nombre: 'Claudia Torres',    email: 'claudia.torres@ministerio.com' },
  { nombre: 'Verónica Ramírez',  email: 'veronica.ramirez@ministerio.com' },
  { nombre: 'Daniela Castro',    email: 'daniela.castro@ministerio.com' },
  { nombre: 'Fernanda Morales',  email: 'fernanda.morales@ministerio.com' },
  { nombre: 'Alejandra Vargas',  email: 'alejandra.vargas@ministerio.com' },
  { nombre: 'Gabriela Herrera',  email: 'gabriela.herrera@ministerio.com' },
  { nombre: 'Valentina Jiménez', email: 'valentina.jimenez@ministerio.com' },
  { nombre: 'Natalia Romero',    email: 'natalia.romero@ministerio.com' },
  { nombre: 'Sofía Mendoza',     email: 'sofia.mendoza@ministerio.com' },
  { nombre: 'Andrea Reyes',      email: 'andrea.reyes@ministerio.com' },
  { nombre: 'Paola Gutiérrez',   email: 'paola.gutierrez@ministerio.com' },
  { nombre: 'Mónica Díaz',       email: 'monica.diaz@ministerio.com' },
  { nombre: 'Lorena Peña',       email: 'lorena.pena@ministerio.com' },
  { nombre: 'Cristina Vega',     email: 'cristina.vega@ministerio.com' },
];

const NINOS_DEMO = [
  // Cuna (0-2 años)
  { nombre: 'Emilio Pérez',      fecha: '2024-03-10', sexo: 'masculino', apoderado: 'Roberto Pérez',    tel: '+56912345001' },
  { nombre: 'Valentina Cruz',    fecha: '2023-11-05', sexo: 'femenino',  apoderado: 'Sandra Cruz',      tel: '+56912345002' },
  { nombre: 'Mateo Silva',       fecha: '2024-01-20', sexo: 'masculino', apoderado: 'Jorge Silva',      tel: '+56912345003' },
  { nombre: 'Sofía Muñoz',       fecha: '2023-08-15', sexo: 'femenino',  apoderado: 'Carla Muñoz',      tel: '+56912345004' },
  { nombre: 'Lucas Rojas',       fecha: '2024-05-01', sexo: 'masculino', apoderado: 'Miguel Rojas',     tel: '+56912345005' },
  { nombre: 'Isabella Fuentes',  fecha: '2023-12-25', sexo: 'femenino',  apoderado: 'Ana Fuentes',      tel: '+56912345006' },
  { nombre: 'Tomás Navarro',     fecha: '2024-02-14', sexo: 'masculino', apoderado: 'Luis Navarro',     tel: '+56912345007' },
  { nombre: 'Camila Torres',     fecha: '2023-09-30', sexo: 'femenino',  apoderado: 'Rosa Torres',      tel: '+56912345008' },
  { nombre: 'Benjamín Díaz',     fecha: '2024-04-18', sexo: 'masculino', apoderado: 'Carlos Díaz',      tel: '+56912345009' },
  { nombre: 'Renata Gómez',      fecha: '2023-07-22', sexo: 'femenino',  apoderado: 'Patricia Gómez',   tel: '+56912345010' },
  { nombre: 'Nicolás Herrera',   fecha: '2024-06-08', sexo: 'masculino', apoderado: 'Felipe Herrera',   tel: '+56912345011' },
  { nombre: 'Antonella Vargas',  fecha: '2023-10-12', sexo: 'femenino',  apoderado: 'Diego Vargas',     tel: '+56912345012' },
  { nombre: 'Sebastián Reyes',   fecha: '2024-07-03', sexo: 'masculino', apoderado: 'Andrés Reyes',     tel: '+56912345013' },
  { nombre: 'Luciana Morales',   fecha: '2023-06-17', sexo: 'femenino',  apoderado: 'Verónica Morales', tel: '+56912345014' },
  { nombre: 'Agustín Castro',    fecha: '2024-08-25', sexo: 'masculino', apoderado: 'Marcelo Castro',   tel: '+56912345015' },
  { nombre: 'Catalina Flores',   fecha: '2023-05-09', sexo: 'femenino',  apoderado: 'Claudia Flores',   tel: '+56912345016' },
  { nombre: 'Martín Ramírez',    fecha: '2024-09-14', sexo: 'masculino', apoderado: 'Eduardo Ramírez',  tel: '+56912345017' },
  { nombre: 'Mariana López',     fecha: '2023-04-28', sexo: 'femenino',  apoderado: 'Gabriela López',   tel: '+56912345018' },
  { nombre: 'Santiago García',   fecha: '2024-10-02', sexo: 'masculino', apoderado: 'Hernán García',    tel: '+56912345019' },
  { nombre: 'Valeria Sánchez',   fecha: '2023-03-15', sexo: 'femenino',  apoderado: 'Natalia Sánchez',  tel: '+56912345020' },
  // Preescolar (3-5 años)
  { nombre: 'Diego Pérez',       fecha: '2021-03-10', sexo: 'masculino', apoderado: 'Roberto Pérez',    tel: '+56912345021' },
  { nombre: 'Fernanda Cruz',     fecha: '2020-11-05', sexo: 'femenino',  apoderado: 'Sandra Cruz',      tel: '+56912345022' },
  { nombre: 'Joaquín Silva',     fecha: '2021-01-20', sexo: 'masculino', apoderado: 'Jorge Silva',      tel: '+56912345023' },
  { nombre: 'Gabriela Muñoz',    fecha: '2020-08-15', sexo: 'femenino',  apoderado: 'Carla Muñoz',      tel: '+56912345024' },
  { nombre: 'Maximiliano Rojas', fecha: '2021-05-01', sexo: 'masculino', apoderado: 'Miguel Rojas',     tel: '+56912345025' },
  { nombre: 'Daniela Fuentes',   fecha: '2020-12-25', sexo: 'femenino',  apoderado: 'Ana Fuentes',      tel: '+56912345026' },
  { nombre: 'Rodrigo Navarro',   fecha: '2021-02-14', sexo: 'masculino', apoderado: 'Luis Navarro',     tel: '+56912345027' },
  { nombre: 'Paola Torres',      fecha: '2020-09-30', sexo: 'femenino',  apoderado: 'Rosa Torres',      tel: '+56912345028' },
  { nombre: 'Ignacio Díaz',      fecha: '2021-04-18', sexo: 'masculino', apoderado: 'Carlos Díaz',      tel: '+56912345029' },
  { nombre: 'Andrea Gómez',      fecha: '2020-07-22', sexo: 'femenino',  apoderado: 'Patricia Gómez',   tel: '+56912345030' },
  { nombre: 'Cristóbal Herrera', fecha: '2021-06-08', sexo: 'masculino', apoderado: 'Felipe Herrera',   tel: '+56912345031' },
  { nombre: 'Mónica Vargas',     fecha: '2020-10-12', sexo: 'femenino',  apoderado: 'Diego Vargas',     tel: '+56912345032' },
  { nombre: 'Alejandro Reyes',   fecha: '2021-07-03', sexo: 'masculino', apoderado: 'Andrés Reyes',     tel: '+56912345033' },
  { nombre: 'Lorena Morales',    fecha: '2020-06-17', sexo: 'femenino',  apoderado: 'Verónica Morales', tel: '+56912345034' },
  { nombre: 'Felipe Castro',     fecha: '2021-08-25', sexo: 'masculino', apoderado: 'Marcelo Castro',   tel: '+56912345035' },
  { nombre: 'Claudia Flores',    fecha: '2020-05-09', sexo: 'femenino',  apoderado: 'Claudia Flores',   tel: '+56912345036' },
  { nombre: 'Andrés Ramírez',    fecha: '2021-09-14', sexo: 'masculino', apoderado: 'Eduardo Ramírez',  tel: '+56912345037' },
  { nombre: 'Verónica López',    fecha: '2020-04-28', sexo: 'femenino',  apoderado: 'Gabriela López',   tel: '+56912345038' },
  { nombre: 'Gabriel García',    fecha: '2021-10-02', sexo: 'masculino', apoderado: 'Hernán García',    tel: '+56912345039' },
  { nombre: 'Natalia Sánchez',   fecha: '2020-03-15', sexo: 'femenino',  apoderado: 'Natalia Sánchez',  tel: '+56912345040' },
  // Primaria Baja (6-10 años)
  { nombre: 'Samuel Pérez',      fecha: '2017-03-10', sexo: 'masculino', apoderado: 'Roberto Pérez',    tel: '+56912345041' },
  { nombre: 'Abigail Cruz',      fecha: '2016-11-05', sexo: 'femenino',  apoderado: 'Sandra Cruz',      tel: '+56912345042' },
  { nombre: 'David Silva',       fecha: '2018-01-20', sexo: 'masculino', apoderado: 'Jorge Silva',      tel: '+56912345043' },
  { nombre: 'Rebeca Muñoz',      fecha: '2015-08-15', sexo: 'femenino',  apoderado: 'Carla Muñoz',      tel: '+56912345044' },
  { nombre: 'Elías Rojas',       fecha: '2017-05-01', sexo: 'masculino', apoderado: 'Miguel Rojas',     tel: '+56912345045' },
  { nombre: 'Raquel Fuentes',    fecha: '2016-12-25', sexo: 'femenino',  apoderado: 'Ana Fuentes',      tel: '+56912345046' },
  { nombre: 'Josué Navarro',     fecha: '2018-02-14', sexo: 'masculino', apoderado: 'Luis Navarro',     tel: '+56912345047' },
  { nombre: 'Ester Torres',      fecha: '2015-09-30', sexo: 'femenino',  apoderado: 'Rosa Torres',      tel: '+56912345048' },
  { nombre: 'Caleb Díaz',        fecha: '2017-04-18', sexo: 'masculino', apoderado: 'Carlos Díaz',      tel: '+56912345049' },
  { nombre: 'Rut Gómez',         fecha: '2016-07-22', sexo: 'femenino',  apoderado: 'Patricia Gómez',   tel: '+56912345050' },
  { nombre: 'Ezequiel Herrera',  fecha: '2018-06-08', sexo: 'masculino', apoderado: 'Felipe Herrera',   tel: '+56912345051' },
  { nombre: 'Miriam Vargas',     fecha: '2015-10-12', sexo: 'femenino',  apoderado: 'Diego Vargas',     tel: '+56912345052' },
  { nombre: 'Isaías Reyes',      fecha: '2017-07-03', sexo: 'masculino', apoderado: 'Andrés Reyes',     tel: '+56912345053' },
  { nombre: 'Débora Morales',    fecha: '2016-06-17', sexo: 'femenino',  apoderado: 'Verónica Morales', tel: '+56912345054' },
  { nombre: 'Jeremías Castro',   fecha: '2018-08-25', sexo: 'masculino', apoderado: 'Marcelo Castro',   tel: '+56912345055' },
  { nombre: 'Ana Flores',        fecha: '2015-05-09', sexo: 'femenino',  apoderado: 'Claudia Flores',   tel: '+56912345056' },
  { nombre: 'Pablo Ramírez',     fecha: '2017-09-14', sexo: 'masculino', apoderado: 'Eduardo Ramírez',  tel: '+56912345057' },
  { nombre: 'Priscila López',    fecha: '2016-04-28', sexo: 'femenino',  apoderado: 'Gabriela López',   tel: '+56912345058' },
  { nombre: 'Pedro García',      fecha: '2018-10-02', sexo: 'masculino', apoderado: 'Hernán García',    tel: '+56912345059' },
  { nombre: 'Lidia Sánchez',     fecha: '2015-03-15', sexo: 'femenino',  apoderado: 'Natalia Sánchez',  tel: '+56912345060' },
  // Primaria Alta (11-13 años)
  { nombre: 'Juan Pérez',        fecha: '2012-03-10', sexo: 'masculino', apoderado: 'Roberto Pérez',    tel: '+56912345061' },
  { nombre: 'Febe Cruz',         fecha: '2011-11-05', sexo: 'femenino',  apoderado: 'Sandra Cruz',      tel: '+56912345062' },
  { nombre: 'Marcos Silva',      fecha: '2013-01-20', sexo: 'masculino', apoderado: 'Jorge Silva',      tel: '+56912345063' },
  { nombre: 'Eunice Muñoz',      fecha: '2011-08-15', sexo: 'femenino',  apoderado: 'Carla Muñoz',      tel: '+56912345064' },
  { nombre: 'Timoteo Rojas',     fecha: '2012-05-01', sexo: 'masculino', apoderado: 'Miguel Rojas',     tel: '+56912345065' },
  { nombre: 'Lois Fuentes',      fecha: '2011-12-25', sexo: 'femenino',  apoderado: 'Ana Fuentes',      tel: '+56912345066' },
  { nombre: 'Esteban Navarro',   fecha: '2013-02-14', sexo: 'masculino', apoderado: 'Luis Navarro',     tel: '+56912345067' },
  { nombre: 'Salomé Torres',     fecha: '2011-09-30', sexo: 'femenino',  apoderado: 'Rosa Torres',      tel: '+56912345068' },
  { nombre: 'Bernabé Díaz',      fecha: '2012-04-18', sexo: 'masculino', apoderado: 'Carlos Díaz',      tel: '+56912345069' },
  { nombre: 'Marta Gómez',       fecha: '2011-07-22', sexo: 'femenino',  apoderado: 'Patricia Gómez',   tel: '+56912345070' },
  { nombre: 'Héctor Herrera',    fecha: '2013-06-08', sexo: 'masculino', apoderado: 'Felipe Herrera',   tel: '+56912345071' },
  { nombre: 'Víctor Vargas',     fecha: '2011-10-12', sexo: 'masculino', apoderado: 'Diego Vargas',     tel: '+56912345072' },
  { nombre: 'Óscar Reyes',       fecha: '2012-07-03', sexo: 'masculino', apoderado: 'Andrés Reyes',     tel: '+56912345073' },
  { nombre: 'Iván Morales',      fecha: '2011-06-17', sexo: 'masculino', apoderado: 'Verónica Morales', tel: '+56912345074' },
  { nombre: 'Alexis Castro',     fecha: '2013-08-25', sexo: 'masculino', apoderado: 'Marcelo Castro',   tel: '+56912345075' },
  { nombre: 'Cristian Flores',   fecha: '2011-05-09', sexo: 'masculino', apoderado: 'Claudia Flores',   tel: '+56912345076' },
  { nombre: 'Mauricio Ramírez',  fecha: '2012-09-14', sexo: 'masculino', apoderado: 'Eduardo Ramírez',  tel: '+56912345077' },
  { nombre: 'Patricio López',    fecha: '2011-04-28', sexo: 'masculino', apoderado: 'Gabriela López',   tel: '+56912345078' },
  { nombre: 'Phoebe García',     fecha: '2013-10-02', sexo: 'femenino',  apoderado: 'Hernán García',    tel: '+56912345079' },
  { nombre: 'Lydia Sánchez',     fecha: '2011-03-15', sexo: 'femenino',  apoderado: 'Natalia Sánchez',  tel: '+56912345080' },
] as const;

export default function DemoPage() {
  const router = useRouter();
  const { usuarioActual, estaAutenticado, _hasHydrated } = useAuthStore();
  const { agregarPersonal } = usePersonalStore();
  const { agregarAlumno } = useAlumnosStore();
  const { inicializarSalones, asignarMaestro } = useSalonesStore();
  const { agregarAsignacion } = useAgendaStore();

  const [cargando, setCargando] = useState(false);
  const [listo, setListo] = useState(false);
  const [log, setLog] = useState<string[]>([]);
  const [mostrarCredenciales, setMostrarCredenciales] = useState(false);

  // Proteger ruta — solo admin puede acceder
  useEffect(() => {
    if (!estaAutenticado) { router.replace('/login'); return; }
    const esAdmin = usuarioActual?.rol === 'Director_General' || usuarioActual?.rol === 'Lider_General';
    if (!esAdmin) router.replace('/portal');
  }, [estaAutenticado, usuarioActual, router]);
  function addLog(msg: string) {
    setLog((prev) => [...prev, msg]);
  }

  async function cargarDemo() {
    setCargando(true);
    setLog([]);

    // 1. Inicializar salones en Firestore
    addLog('⏳ Creando salones...');
    await inicializarSalones();
    await new Promise((r) => setTimeout(r, 800));

    const salonesActuales = useSalonesStore.getState().salones;
    if (salonesActuales.length === 0) {
      addLog('❌ No se pudieron crear los salones. Verifica las reglas de Firestore.');
      setCargando(false);
      return;
    }
    addLog(`✅ ${salonesActuales.length} salones creados en Firestore`);

    // 2. Registrar 20 maestros en Firestore
    addLog('⏳ Registrando 20 maestros...');
    const maestrosCreados: Personal[] = [];
    for (let i = 0; i < MAESTROS_DEMO.length; i++) {
      const m = MAESTROS_DEMO[i];
      const salonIdx = Math.floor(i / 5);
      const salon = salonesActuales[salonIdx];
      const maestro: Personal = {
        id: crypto.randomUUID(),
        nombreCompleto: m.nombre,
        rol: 'Maestro',
        telefono: `+56912345${String(i + 1).padStart(3, '0')}`,
        email: m.email,
        salonesIds: salon ? [salon.id] : [],
      };
      await agregarPersonal(maestro);
      maestrosCreados.push(maestro);
      if (i % 5 === 0 && salon) await asignarMaestro(salon.id, maestro.id);
    }
    addLog(`✅ 20 maestros registrados en Firestore`);

    // 3. Inscribir 80 niños en Firestore
    addLog('⏳ Inscribiendo 80 niños...');
    const gruposSalones = ['Cuna', 'Preescolar', 'PrimariaBaja', 'PrimariaAlta'];
    for (let i = 0; i < NINOS_DEMO.length; i++) {
      const nino = NINOS_DEMO[i];
      const grupoIdx = Math.floor(i / 20);
      const salon = salonesActuales.find((s) => s.grupoEdad === gruposSalones[grupoIdx]);
      if (!salon) continue;

      const apoderadoId = crypto.randomUUID();
      const alumnoId = crypto.randomUUID();

      const apoderado: Apoderado = {
        id: apoderadoId,
        nombreCompleto: nino.apoderado,
        relacion: i % 3 === 0 ? 'padre' : i % 3 === 1 ? 'madre' : 'tutor',
        telefono: nino.tel,
        email: `apoderado${i + 1}@correo.com`,
      };

      const alumno: Alumno = {
        id: alumnoId,
        nombreCompleto: nino.nombre,
        fechaNacimiento: nino.fecha,
        sexo: nino.sexo as 'masculino' | 'femenino',
        salonId: salon.id,
        apoderadoId,
        fechaRegistro: new Date().toISOString(),
      };

      await agregarAlumno(alumno, apoderado);
    }
    addLog(`✅ 80 niños inscritos en Firestore`);

    // 4. Crear agenda para los próximos 2 domingos
    addLog('⏳ Creando agenda...');
    const domingos = proximosDomingos(2);
    const alumnosFinales = useAlumnosStore.getState().alumnos;

    for (const fecha of domingos) {
      for (const servicio of SERVICIOS_DOMINGO) {
        for (let g = 0; g < 4; g++) {
          const salon = salonesActuales[g];
          if (!salon) continue;
          const maestraIdx = (g * 5) + (SERVICIOS_DOMINGO.indexOf(servicio) % 5);
          const maestra = maestrosCreados[maestraIdx];
          if (!maestra) continue;
          const alumnosSalon = alumnosFinales.filter((a) => a.salonId === salon.id).map((a) => a.id);
          await agregarAsignacion({
            id: crypto.randomUUID(),
            fecha,
            servicioId: servicio.id,
            salonId: salon.id,
            maestroId: maestra.id,
            auxiliaresIds: [],
            alumnosIds: alumnosSalon,
          });
        }
      }
    }
    addLog(`✅ Agenda creada para los próximos 2 domingos`);
    addLog(`🎉 ¡Todo listo! Los datos están en Firebase.`);

    setListo(true);
    setCargando(false);
  }

  return (
    <div className="min-h-screen px-4 py-12" style={{ background: '#FFFDE7' }}>
      <div className="max-w-2xl mx-auto space-y-6">

        <div className="rounded-3xl overflow-hidden shadow-xl border-2 border-yellow-200 bg-white">
          <div className="px-6 py-6 text-center" style={{ background: '#F5C518' }}>
            <p className="text-4xl mb-2">🧪</p>
            <h1 className="text-xl font-extrabold" style={{ color: '#4a2c00' }}>Datos Demo — Firebase</h1>
            <p className="text-sm mt-1" style={{ color: '#78350f' }}>
              20 maestros · 80 niños · Agenda precargada en Firestore
            </p>
          </div>

          <div className="px-6 py-6 space-y-4">
            {log.length > 0 && (
              <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4 space-y-1 max-h-48 overflow-y-auto">
                {log.map((l, i) => <p key={i} className="text-sm" style={{ color: '#4a2c00' }}>{l}</p>)}
              </div>
            )}

            {!listo ? (
              <button onClick={cargarDemo} disabled={cargando}
                className="w-full py-3 rounded-xl font-bold text-sm transition-opacity disabled:opacity-50"
                style={{ background: '#F5C518', color: '#4a2c00' }}>
                {cargando ? 'Cargando en Firebase...' : 'Cargar datos demo'}
              </button>
            ) : (
              <div className="space-y-3">
                <div className="rounded-xl bg-green-50 border border-green-200 p-3 text-center">
                  <p className="text-green-700 font-bold text-sm">✅ Datos cargados en Firebase</p>
                </div>
                <button onClick={() => router.push('/portal')}
                  className="w-full py-3 rounded-xl font-bold text-sm"
                  style={{ background: '#F5C518', color: '#4a2c00' }}>
                  Ir al Portal →
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Credenciales */}
        <div className="rounded-2xl border-2 border-yellow-200 bg-white overflow-hidden">
          <button onClick={() => setMostrarCredenciales(!mostrarCredenciales)}
            className="w-full px-5 py-4 flex items-center justify-between text-left"
            style={{ background: '#FFF9C4' }}>
            <span className="font-bold text-sm" style={{ color: '#4a2c00' }}>
              🔑 Credenciales de los 20 maestros
            </span>
            <span style={{ color: '#D97706' }}>{mostrarCredenciales ? '▲' : '▼'}</span>
          </button>

          {mostrarCredenciales && (
            <div className="px-5 py-4">
              <p className="text-xs text-gray-500 mb-3">
                Contraseña = primeros 6 caracteres del email + <strong>123</strong>
              </p>
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {MAESTROS_DEMO.map((m, i) => {
                  const pass = m.email.slice(0, 6) + '123';
                  const salon = ['Cuna', 'Preescolar', 'Primaria Baja', 'Primaria Alta'][Math.floor(i / 5)];
                  return (
                    <div key={m.email} className="flex items-center gap-3 rounded-xl p-2 border border-yellow-100 bg-yellow-50">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-none"
                        style={{ background: '#F5C518', color: '#4a2c00' }}>
                        {m.nombre.charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-gray-800 truncate">{m.nombre}</p>
                        <p className="text-xs text-gray-500 truncate">{m.email}</p>
                      </div>
                      <div className="text-right flex-none">
                        <p className="text-xs font-mono font-bold" style={{ color: '#D97706' }}>{pass}</p>
                        <p className="text-xs text-gray-400">{salon}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <p className="text-xs text-center text-gray-400">
          Los datos se guardan directamente en Firebase Firestore.
        </p>
      </div>
    </div>
  );
}
