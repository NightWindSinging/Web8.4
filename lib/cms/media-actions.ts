"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/cms/session";
import { prisma } from "@/lib/db/prisma";
import { deleteStoredMedia } from "@/lib/media/storage";

export async function deleteDatabaseMediaAction(id: string) {
  await requireAdmin();
  const media = await prisma.media.findUnique({
    where: { id },
    include: { _count: { select: { articleCovers: true, productMainImages: true, galleryProducts: true } } },
  });
  if (!media) redirect("/admin/media?error=not-found");
  const usage = media._count.articleCovers + media._count.productMainImages + media._count.galleryProducts;
  if (usage > 0) redirect("/admin/media?error=in-use");

  await prisma.media.delete({ where: { id } });
  let storageWarning = false;
  try {
    await deleteStoredMedia(media.storageProvider, media.storageKey);
  } catch (error) {
    storageWarning = true;
    console.error(`Media object cleanup failed for ${media.storageKey}`, error);
  }
  revalidatePath("/admin/media");
  redirect(`/admin/media?deleted=${storageWarning ? "storage-warning" : "1"}`);
}
