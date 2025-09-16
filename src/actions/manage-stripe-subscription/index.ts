"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

export const manageStripeSubscription = actionClient
  .schema(z.string())
  .action(async ({ parsedInput: userEmail }) => {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user || !process.env.STRIPE_CUSTOMER_PORTAL_URL) {
      throw new Error(
        "Usuário não autenticado ou URL do portal não configurada.",
      );
    }

    const portalUrl = `${process.env.STRIPE_CUSTOMER_PORTAL_URL}?prefilled_email=${encodeURIComponent(userEmail)}`;
    redirect(portalUrl);
  });
