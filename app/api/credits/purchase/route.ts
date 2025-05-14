import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

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
    // Increment user's credits atomically
    const updatedUser = await prisma.user.update({
      where: { id: auth.userId },
      data: {
        credits: { increment: credits },
        // Optionally, you could log the transactionId in a future enhancement
      },
      select: { credits: true },
    });

    return NextResponse.json({
      message: "Credits successfully added.",
      credits: updatedUser.credits,
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to update credits", details: err instanceof Error ? err.message : err },
      { status: 500 }
    );
  }
}