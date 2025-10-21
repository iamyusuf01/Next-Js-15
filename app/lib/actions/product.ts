'use server'
import { getCurrentUser } from "../auth";
import { prisma } from "../prisma";


export default async function deleteProduct(formData: FormData) {
    const user = await getCurrentUser()
    const id = String(formData.get('id') || '');

    await prisma.product.deleteMany({ where: { id: id, userId: user.id } });

}