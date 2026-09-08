"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireAdminSession } from "@/lib/require-admin";
import { certificationSchema } from "@/lib/validations/certification";

export type CertificationFormState = { error: string } | undefined;

function revalidateCertificationPaths() {
  revalidatePath("/dashboard/certifications");
  revalidatePath("/dashboard");
  revalidatePath("/certifications");
}

export async function createCertificationAction(
  _prevState: CertificationFormState,
  formData: FormData,
): Promise<CertificationFormState> {
  await requireAdminSession();

  const parsed = certificationSchema.safeParse({
    name: formData.get("name"),
    issuer: formData.get("issuer"),
    year: formData.get("year"),
    credentialUrl: formData.get("credentialUrl") ?? "",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form and try again." };
  }

  const maxOrder = await prisma.certification.aggregate({ _max: { order: true } });

  await prisma.certification.create({
    data: {
      name: parsed.data.name,
      issuer: parsed.data.issuer,
      year: parsed.data.year,
      credentialUrl: parsed.data.credentialUrl ?? null,
      order: (maxOrder._max.order ?? -1) + 1,
    },
  });

  revalidateCertificationPaths();
  redirect("/dashboard/certifications");
}

export async function updateCertificationAction(
  id: string,
  _prevState: CertificationFormState,
  formData: FormData,
): Promise<CertificationFormState> {
  await requireAdminSession();

  const parsed = certificationSchema.safeParse({
    name: formData.get("name"),
    issuer: formData.get("issuer"),
    year: formData.get("year"),
    credentialUrl: formData.get("credentialUrl") ?? "",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form and try again." };
  }

  await prisma.certification.update({
    where: { id },
    data: {
      name: parsed.data.name,
      issuer: parsed.data.issuer,
      year: parsed.data.year,
      credentialUrl: parsed.data.credentialUrl ?? null,
    },
  });

  revalidateCertificationPaths();
  redirect("/dashboard/certifications");
}

export async function deleteCertificationAction(id: string) {
  await requireAdminSession();
  await prisma.certification.delete({ where: { id } });
  revalidateCertificationPaths();
}
