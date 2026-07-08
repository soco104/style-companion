"use server";

import { revalidatePath } from "next/cache";

import { adminApi } from "./api";

export async function moderateReviewAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const moderationStatus = String(formData.get("moderationStatus") ?? "");
  const moderationNotes = String(formData.get("moderationNotes") ?? "");

  if (!id || !moderationStatus) {
    return;
  }

  await adminApi.moderateReview(id, moderationStatus, moderationNotes || undefined);
  revalidatePath("/reviews");
  revalidatePath("/");
}

export async function updateSafetyReportAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  const resolutionNotes = String(formData.get("resolutionNotes") ?? "");

  if (!id || !status) {
    return;
  }

  await adminApi.updateSafetyReport(id, status, resolutionNotes || undefined);
  revalidatePath("/safety-reports");
  revalidatePath("/");
}
