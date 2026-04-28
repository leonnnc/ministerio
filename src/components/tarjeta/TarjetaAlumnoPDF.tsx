'use client';

import { Document, Page, View, Text, Image, StyleSheet, pdf } from '@react-pdf/renderer';
import QRCode from 'qrcode';
import type { Alumno, Apoderado, Salon } from '@/types';

const AMARILLO   = '#F5C518';
const CAFE_OSC   = '#4a2c00';
const CAFE_MED   = '#78350f';
const CAFE_LIGHT = '#92400e';
const CREMA      = '#FFFDE7';
const CREMA2     = '#FFF9C4';
const GRIS       = '#6b7280';
const ROJO       = '#dc2626';

const styles = StyleSheet.create({
  page: { backgroundColor: '#ffffff', fontFamily: 'Helvetica', padding: 0 },

  card: {
    width: 240,
    margin: 'auto',
    marginTop: 16,
    borderRadius: 14,
    overflow: 'hidden',
    border: `2pt solid ${AMARILLO}`,
  },

  header: {
    backgroundColor: AMARILLO,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  headerTitle: { color: CAFE_OSC, fontSize: 11, fontFamily: 'Helvetica-Bold' },
  headerSub:   { color: CAFE_MED, fontSize: 7, marginTop: 1 },

  photoSection: { alignItems: 'center', marginTop: 10 },
  photo: { width: 60, height: 60, borderRadius: 30, border: `3pt solid ${AMARILLO}` },
  avatarCircle: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: CREMA, border: `3pt solid ${AMARILLO}`,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarInitial: { color: CAFE_OSC, fontSize: 24, fontFamily: 'Helvetica-Bold' },

  qrSection: { alignItems: 'center', marginTop: 6 },
  qrBox: {
    padding: 4, backgroundColor: '#ffffff',
    borderRadius: 6, border: `1pt solid #FDE68A`,
  },
  qrImage: { width: 64, height: 64 },
  codigoText: { color: GRIS, fontSize: 6.5, textAlign: 'center', marginTop: 2 },

  nameSection: { alignItems: 'center', paddingHorizontal: 12, marginTop: 5 },
  nameText: { color: CAFE_OSC, fontSize: 13, fontFamily: 'Helvetica-Bold', textAlign: 'center' },

  infoBox: {
    marginHorizontal: 10, marginTop: 6,
    backgroundColor: CREMA, borderRadius: 7,
    paddingVertical: 6, paddingHorizontal: 9,
  },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 },
  infoLabel: { color: GRIS, fontSize: 8 },
  infoValue: { color: CAFE_OSC, fontSize: 8, fontFamily: 'Helvetica-Bold' },
  infoValueRed: { color: ROJO, fontSize: 8, fontFamily: 'Helvetica-Bold' },

  apodBox: {
    marginHorizontal: 10, marginTop: 5, marginBottom: 10,
    backgroundColor: CREMA2, borderRadius: 7,
    paddingVertical: 6, paddingHorizontal: 9,
    border: `1pt solid ${AMARILLO}`,
  },
  apodLabel: { color: CAFE_LIGHT, fontSize: 6.5, fontFamily: 'Helvetica-Bold', marginBottom: 3 },
  apodName:  { color: CAFE_OSC, fontSize: 9, fontFamily: 'Helvetica-Bold' },
  apodPhone: { color: GRIS, fontSize: 8, marginTop: 2 },
  apodDist:  { color: GRIS, fontSize: 7, marginTop: 1 },
});

function formatearFecha(fechaISO: string): string {
  const [y, m, d] = fechaISO.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('es-PE', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

async function generarQRBase64(texto: string): Promise<string> {
  return await QRCode.toDataURL(texto, {
    width: 200,
    margin: 1,
    color: { dark: '#000000', light: '#ffffff' },
  });
}

interface Props { alumno: Alumno; apoderado: Apoderado; salon: Salon; qrDataUrl?: string }

function TarjetaAlumnoPDF({ alumno, apoderado, salon, qrDataUrl }: Props) {
  const inicial = alumno.nombreCompleto.charAt(0).toUpperCase();
  const codigo = alumno.codigoQR ?? alumno.id;

  return (
    <Document>
      <Page size={[270, 390]} style={styles.page}>
        <View style={styles.card}>

          {/* Header amarillo */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Ministerio de Niños</Text>
            <Text style={styles.headerSub}>Tarjeta de Identificación</Text>
          </View>

          {/* Foto */}
          <View style={styles.photoSection}>
            {alumno.fotografiaUrl ? (
              <Image src={alumno.fotografiaUrl} style={styles.photo} />
            ) : (
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarInitial}>{inicial}</Text>
              </View>
            )}
          </View>

          {/* QR */}
          <View style={styles.qrSection}>
            <View style={styles.qrBox}>
              {qrDataUrl && <Image src={qrDataUrl} style={styles.qrImage} />}
            </View>
            <Text style={styles.codigoText}>{codigo}</Text>
          </View>

          {/* Nombre */}
          <View style={styles.nameSection}>
            <Text style={styles.nameText}>{alumno.nombreCompleto}</Text>
          </View>

          {/* Datos del niño — solo muestra campos con valor real */}
          <View style={styles.infoBox}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Salón:</Text>
              <Text style={styles.infoValue}>{salon.nombre}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Nacimiento:</Text>
              <Text style={styles.infoValue}>{formatearFecha(alumno.fechaNacimiento)}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Sexo:</Text>
              <Text style={styles.infoValue}>{alumno.sexo === 'masculino' ? 'Masculino' : 'Femenino'}</Text>
            </View>
            {alumno.alergias && alumno.alergias.toLowerCase() !== 'no' && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Alergias:</Text>
                <Text style={styles.infoValueRed}>{alumno.alergias}</Text>
              </View>
            )}
            {alumno.tipoSangre && alumno.tipoSangre !== 'desconocido' && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Sangre:</Text>
                <Text style={styles.infoValueRed}>{alumno.tipoSangre}</Text>
              </View>
            )}
            {alumno.condicionesMedicas && alumno.condicionesMedicas.toLowerCase() !== 'no' && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Condición:</Text>
                <Text style={styles.infoValue}>{alumno.condicionesMedicas}</Text>
              </View>
            )}
          </View>

          {/* Apoderado */}
          <View style={styles.apodBox}>
            <Text style={styles.apodLabel}>
              {apoderado.relacion === 'padre' ? 'PADRE' : apoderado.relacion === 'madre' ? 'MADRE' : 'APODERADO'}
            </Text>
            <Text style={styles.apodName}>{apoderado.nombreCompleto}</Text>
            <Text style={styles.apodPhone}>{apoderado.telefono}</Text>
            {(() => {
              if (!apoderado.telefonoEmergencia) return null;
              const telP = apoderado.telefono.replace(/\D/g, '').slice(-9);
              const telE = apoderado.telefonoEmergencia.replace(/\D/g, '').slice(-9);
              const mismoNum = telP === telE;
              const mismoNom = !apoderado.nombreEmergencia ||
                apoderado.nombreEmergencia.trim().toLowerCase() === apoderado.nombreCompleto.trim().toLowerCase();
              if (mismoNum && mismoNom) return null;
              return (
                <Text style={styles.apodPhone}>
                  Emergencia: {apoderado.telefonoEmergencia}
                  {apoderado.nombreEmergencia ? ` (${apoderado.nombreEmergencia})` : ''}
                </Text>
              );
            })()}
            {apoderado.email && (
              <Text style={styles.apodPhone}>{apoderado.email}</Text>
            )}
            {apoderado.distrito && (
              <Text style={styles.apodDist}>{apoderado.distrito}, {apoderado.departamento ?? 'Lima'}</Text>
            )}
          </View>

        </View>
      </Page>
    </Document>
  );
}

export async function descargarTarjetaPDF(alumno: Alumno, apoderado: Apoderado, salon: Salon): Promise<void> {
  // Generar QR como imagen base64
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const qrUrl = `${baseUrl}/verificar/${alumno.codigoQR ?? alumno.id}`;
  const qrDataUrl = await generarQRBase64(qrUrl);

  const blob = await pdf(
    <TarjetaAlumnoPDF alumno={alumno} apoderado={apoderado} salon={salon} qrDataUrl={qrDataUrl} />
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
