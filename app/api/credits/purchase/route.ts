import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { transactionLogger, TransactionOperations } from "@/lib/transaction-logger";
import { Prisma } from "@/prisma/generated/client";

export const dynamic = 'force-dynamic';

// Request body schema
const purchaseSchema = z.object({
  credits: z.number().int().positive(),
  transactionId: z.string().min(1),
});

export async function POST(request: NextRequest) {
  const auth = getAuth(request);

  if (!auth.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let data;
  try {
    data = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const result = purchaseSchema.safeParse(data);
  if (!result.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: result.error.flatten() },
      { status: 400 }
    );
  }

  const { credits, transactionId } = result.data;

  try {
    transactionLogger.info(auth.userId, TransactionOperations.CREDITS_PURCHASED, {
      metadata: { transactionId, credits }
    });
    
    // Use a transaction to ensure both operations succeed together
    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // TODO: Add purchase transaction record for audit trail when model is created
      // await tx.purchaseTransaction.create({
      //   data: {
      //     userId: auth.userId,
      //     transactionId,
      //     credits,
      //     status: "completed",
      //   },
      // });

      // Increment user's credits atomically
      const updatedUser = await tx.user.update({
        where: { id: auth.userId },
        data: {
          credits: { increment: credits },
        },
        select: { credits: true },
      });

      return updatedUser;
    });

    // Convert Decimal to Number for consistent handling
    const creditsBalance = Number(result.credits);
    
    transactionLogger.info(auth.userId, TransactionOperations.CREDITS_ADDED, {
      metadata: { transactionId, creditsAdded: credits, newBalance: creditsBalance }
    });

    return NextResponse.json({
      message: "Credits successfully added.",
      credits: creditsBalance,
    });
  } catch (err) {
    transactionLogger.error(auth.userId, TransactionOperations.CREDITS_PURCHASED, {
      error: err instanceof Error ? err.message : 'Unknown error',
      metadata: { transactionId, credits }
    });
    
    return NextResponse.json(
      { error: "Failed to update credits", details: err instanceof Error ? err.message : err },
      { status: 500 }
    );
  }
}