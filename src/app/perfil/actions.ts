'use server';

import db from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

export async function changePassword(oldPass: string, newPass: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.name) return { success: false, error: "No autenticado" };

    const admin = await db.admin.findUnique({
      where: { username: session.user.name }
    });

    if (!admin) return { success: false, error: "Usuario no encontrado" };

    const isValid = await bcrypt.compare(oldPass, admin.password);
    if (!isValid) return { success: false, error: "La contraseña actual es incorrecta" };

    const hashedNewPassword = await bcrypt.hash(newPass, 10);
    await db.admin.update({
      where: { username: session.user.name },
      data: { password: hashedNewPassword }
    });

    revalidatePath("/perfil");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
