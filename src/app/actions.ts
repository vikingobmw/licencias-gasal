'use server';

import prisma from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function getLicencias() {
  return await prisma.licencia.findMany({
    include: { 
      producto: true,
      activaciones: true 
    },
            orderBy: { fechaCreacion: 'desc' }
  });
}

export async function checkLicenciaDependencies(id: string) {
  const license = await prisma.licencia.findUnique({
    where: { id },
    include: { activaciones: true }
  });
  return {
    hasActivations: license?.activaciones.length ? license.activaciones.length > 0 : false,
    activations: license?.activaciones || []
  };
}

export async function checkProductoDependencies(id: string) {
  const producto = await prisma.producto.findUnique({
    where: { id },
    include: { 
      licencias: {
        include: { activaciones: true }
      } 
    }
  });
  
  const licenseCount = producto?.licencias.length || 0;
  const activationCount = producto?.licencias.reduce((acc, l) => acc + l.activaciones.length, 0) || 0;

  return {
    hasLicencias: licenseCount > 0,
    licenseCount,
    activationCount,
    licencias: producto?.licencias || []
  };
}

export async function getProductos() {
  return await prisma.producto.findMany();
}
export async function crearLicencia(data: { 
  key: string, 
  productoId: string, 
  nombreUsuario?: string, 
  emailUsuario?: string,
  maxActivaciones: number,
  maxAsociaciones: number,
  initialPassword?: string,
  fechaExpiracion?: string
}) {
  try {
    const licencia = await prisma.licencia.create({
      data: {
        key: data.key,
        productoId: data.productoId,
        nombreUsuario: data.nombreUsuario,
        emailUsuario: data.emailUsuario,
        maxActivaciones: Number(data.maxActivaciones),
        maxAsociaciones: Number(data.maxAsociaciones),
        initialPassword: data.initialPassword,
        fechaExpiracion: data.fechaExpiracion ? new Date(data.fechaExpiracion) : null
      }
    });
    revalidatePath('/');
    return { success: true, licencia };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function toggleLicencia(id: string, activa: boolean) {
  await prisma.licencia.update({
    where: { id },
    data: { activa }
  });
  revalidatePath('/');
}

export async function borrarLicencia(id: string) {
  try {
    await prisma.$transaction([
      prisma.activacion.deleteMany({ where: { licenciaId: id } }),
      prisma.licencia.delete({ where: { id } })
    ]);
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
export async function editarLicencia(id: string, data: { 
  key: string, 
  productoId: string, 
  nombreUsuario?: string, 
  emailUsuario?: string,
  maxActivaciones: number,
  maxAsociaciones: number,
  initialPassword?: string,
  fechaExpiracion?: string
}) {
  try {
    const licencia = await prisma.licencia.update({
      where: { id },
      data: {
        key: data.key,
        productoId: data.productoId,
        nombreUsuario: data.nombreUsuario,
        emailUsuario: data.emailUsuario,
        maxActivaciones: Number(data.maxActivaciones),
        maxAsociaciones: Number(data.maxAsociaciones),
        initialPassword: data.initialPassword,
        fechaExpiracion: data.fechaExpiracion ? new Date(data.fechaExpiracion) : null
      }
    });
    revalidatePath('/');
    return { success: true, licencia };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

expexport async function crearProducto(nombre: string) {
    try {
          const producto = await prisma.producto.create({ data: { nombre } });
          revalidatePath('/');
          return { success: true, producto };
    } catch (error: any) {
          return { success: false, error: error.message };
    }
}

exp async function editarProducto(id: string, data: { nombre: string }) {
    try {
          const producto = await prisma.producto.update({
                  where: { id },
                  data: { nombre: data.nombre }
          });
          revalidatePath('/');
          return { success: true, producto };
    } catch (error: any) {
          return { success: false, error: error.message };
    }
}

export async function borrarProducto(id: string) {
    try {
          await prisma.producto.delete({ where: { id } });
          revalidatePath('/');
          return { success: true };
    } catch (error: any) {
          return { success: false, error: error.message };
    }
}
