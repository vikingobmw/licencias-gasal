import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function POST(req: Request) {
  try {
    const { key, hardwareId, osInfo } = await req.json();

    if (!key || !hardwareId) {
      return NextResponse.json(
        { success: false, error: 'Faltan datos obligatorios (clave o ID de equipo).' }, 
        { 
          status: 400,
          headers: { 'Access-Control-Allow-Origin': '*' }
        }
      );
    }

    // 1. Buscar licencia
    const licencia = await prisma.licencia.findUnique({
      where: { key },
      include: { activaciones: true }
    });

    if (!licencia) {
      return NextResponse.json(
        { success: false, error: 'Licencia no válida.' }, 
        { 
          status: 404,
          headers: { 'Access-Control-Allow-Origin': '*' }
        }
      );
    }

    if (!licencia.activa) {
      return NextResponse.json(
        { success: false, error: 'Esta licencia ha sido desactivada por el administrador.' }, 
        { 
          status: 403,
          headers: { 'Access-Control-Allow-Origin': '*' }
        }
      );
    }

    // 2. Verificar si ya está activada en este equipo
    const yaActivada = licencia.activaciones.find(a => a.hwid === hardwareId);
    if (yaActivada) {
      return NextResponse.json(
        { 
          success: true, 
          message: 'Equipo ya activado.', 
          alreadyActive: true,
          licencia: {
            key: licencia.key,
            maxAsociaciones: licencia.maxAsociaciones,
            maxActivaciones: licencia.maxActivaciones,
            nombreUsuario: licencia.nombreUsuario,
            emailUsuario: licencia.emailUsuario,
            initialPassword: licencia.initialPassword
          }
        },
        { headers: { 'Access-Control-Allow-Origin': '*' } }
      );
    }

    // 3. Verificar límite de activaciones
    if (licencia.activaciones.length >= licencia.maxActivaciones) {
      return NextResponse.json(
        { success: false, error: 'Límite de activaciones alcanzado para esta licencia.' }, 
        { 
          status: 403,
          headers: { 'Access-Control-Allow-Origin': '*' }
        }
      );
    }

    await prisma.activacion.create({
      data: {
        licenciaId: licencia.id,
        hwid: hardwareId,
        nombreEquipo: osInfo || 'Desconocido'
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Licencia activada con éxito en este equipo.',
      licencia: {
        key: licencia.key,
        maxAsociaciones: licencia.maxAsociaciones,
        maxActivaciones: licencia.maxActivaciones,
        nombreUsuario: licencia.nombreUsuario,
        emailUsuario: licencia.emailUsuario,
        initialPassword: licencia.initialPassword
      }
    }, {
      headers: { 'Access-Control-Allow-Origin': '*' }
    });

  } catch (error) {
    console.error('Error en activación:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor.' }, 
      { 
        status: 500,
        headers: { 'Access-Control-Allow-Origin': '*' }
      }
    );
  }
}
