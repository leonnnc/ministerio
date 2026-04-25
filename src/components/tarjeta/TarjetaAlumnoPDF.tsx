'use client';

import { Document, Page, View, Text, Image, StyleSheet, pdf } from '@react-pdf/renderer';
import type { Alumno, Apoderado, Salon } from '@/types';

// ─── Estilos ────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#ffffff',
    fontFamily: 'Helvetica',
    padding: 0,
  },
  card: {
    width: 230,
    margin: 'auto',
    marginTop: 20,
    borderRadius: 12,
    overflow: 'hidden',
    border: '1pt solid #c4b5fd',
  },
  header: {
    backgroundColor: '#6d28d9',
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  headerText: {
    color: '#ffffff',
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 0.5,
  },
  photoSection: {
    alignItems: 'center',
    marginTop: 14,
  },
  photo: {
    width: 72,
    height: 72,
    borderRadius: 36,
    border: '3pt solid #c4b5fd',
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#ede9fe',
    border: '3pt solid #c4b5fd',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    color: '#6d28d9',
    fontSize: 28,
    fontFamily: 'Helvetica-Bold',
  },
  nameSection: {
    alignItems: 'center',
    paddingHorizontal: 12,
    marginTop: 8,
  },
  nameText: {
    color: '#1e1b4b',
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
  },
  badgeRow: {
    alignItems: 'center',
    marginTop: 6,
  },
  badge: {
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: '#ede9fe',
  },
  badgeText: {
    color: '#5b21b6',
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    marginTop: 8,
    gap: 4,
  },
  infoLabel: {
    color: '#6b7280',
    fontSize: 9,
  },
  divider: {
    marginHorizontal: 14,
    marginVertical: 8,
    borderBottom: '1pt solid #ede9fe',
  },
  sectionLabel: {
    color: '#7c3aed',
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    paddingHorizontal: 14,
    marginBottom: 3,
  },
  apoderadoName: {
    color: '#1f2937',
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    paddingHorizontal: 14,
  },
  apoderadoPhone: {
    color: '#4b5563',
    fontSize: 9,
    paddingHorizontal: 14,
    marginTop: 2,
    marginBottom: 14,
  },
});

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatearFecha(fechaISO: string): string {
  const [year, month, day] = fechaISO.split('-').map(Number);
  const fecha = new Date(year, month - 1, day);
  return fecha.toLocaleDateString('es-CL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

// ─── Componente PDF ─────────────────────────────────────────────────────────

interface TarjetaAlumnoPDFProps {
  alumno: Alumno;
  apoderado: Apoderado;
  salon: Salon;
}

export default function TarjetaAlumnoPDF({ alumno, apoderado, salon }: TarjetaAlumnoPDFProps) {
  const inicial = alumno.nombreCompleto.charAt(0).toUpperCase();

  return (
    <Document>
      <Page size={[260, 340]} style={styles.page}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerText}>Ministerio de Niños</Text>
          </View>

          {/* Foto / Avatar */}
          <View style={styles.photoSection}>
            {alumno.fotografiaUrl ? (
              <Image src={alumno.fotografiaUrl} style={styles.photo} />
            ) : (
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarInitial}>{inicial}</Text>
              </View>
            )}
          </View>

          {/* Nombre */}
          <View style={styles.nameSection}>
            <Text style={styles.nameText}>{alumno.nombreCompleto}</Text>
          </View>

          {/* Badge grupo/salón */}
          <View style={styles.badgeRow}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{salon.nombre}</Text>
            </View>
          </View>

          {/* Fecha de nacimiento */}
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{formatearFecha(alumno.fechaNacimiento)}</Text>
          </View>

          {/* Separador */}
          <View style={styles.divider} />

          {/* Sección apoderado */}
          <Text style={styles.sectionLabel}>Apoderado</Text>
          <Text style={styles.apoderadoName}>{apoderado.nombreCompleto}</Text>
          <Text style={styles.apoderadoPhone}>{apoderado.telefono}</Text>
        </View>
      </Page>
    </Document>
  );
}

// ─── Función de descarga ─────────────────────────────────────────────────────

export async function descargarTarjetaPDF(
  alumno: Alumno,
  apoderado: Apoderado,
  salon: Salon
): Promise<void> {
  const blob = await pdf(
    <TarjetaAlumnoPDF alumno={alumno} apoderado={apoderado} salon={salon} />
  ).toBlob();

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `tarjeta-${alumno.nombreCompleto.replace(/\s+/g, '-').toLowerCase()}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
