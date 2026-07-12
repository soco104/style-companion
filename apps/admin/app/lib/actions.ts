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

export async function updateCustomerFeeWaiverAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const feesWaived = String(formData.get("feesWaived") ?? "") === "true";
  const feeWaiverReason = String(formData.get("feeWaiverReason") ?? "");
  const feeWaivedByUserId = String(formData.get("feeWaivedByUserId") ?? "");

  if (!id) {
    return;
  }

  await adminApi.updateCustomerFeeWaiver(id, {
    feeWaivedByUserId: feeWaivedByUserId || undefined,
    feeWaiverReason: feeWaiverReason || undefined,
    feesWaived
  });
  revalidatePath("/users");
  revalidatePath("/");
}

export async function updateShopperFeeWaiverAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const feesWaived = String(formData.get("feesWaived") ?? "") === "true";
  const feeWaiverReason = String(formData.get("feeWaiverReason") ?? "");
  const feeWaivedByUserId = String(formData.get("feeWaivedByUserId") ?? "");

  if (!id) {
    return;
  }

  await adminApi.updateShopperFeeWaiver(id, {
    feeWaivedByUserId: feeWaivedByUserId || undefined,
    feeWaiverReason: feeWaiverReason || undefined,
    feesWaived
  });
  revalidatePath("/users");
  revalidatePath("/shoppers");
  revalidatePath("/");
}
