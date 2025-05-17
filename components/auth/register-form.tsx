"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
/**
 * Displays a message indicating that user registration is temporarily unavailable during authentication migration.
 *
 * @remark No registration functionality is currently provided; the form will be reintroduced after migration to Clerk authentication.
 */

export function RegisterForm() {
  return (
    <div>
      {/* Registration functionality will be provided by Clerk. */}
      <p className="text-center text-gray-500">
        Registration is temporarily unavailable while authentication is being migrated.
      </p>
    </div>
  );
}
