"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabaseClient";
import { Card, SectionHeading, Label, TextInput, PrimaryButton, SavedBadge } from "@/components/admin/ui";

type FieldStatus = { saving: boolean; saved: boolean; error: string | null };
const IDLE: FieldStatus = { saving: false, saved: false, error: null };

export default function AccountSettings({ userEmail }: { userEmail: string }) {
  const [newEmail, setNewEmail] = useState("");
  const [emailStatus, setEmailStatus] = useState<FieldStatus>(IDLE);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordStatus, setPasswordStatus] = useState<FieldStatus>(IDLE);

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    setEmailStatus({ saving: true, saved: false, error: null });

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ email: newEmail });

    if (error) {
      setEmailStatus({ saving: false, saved: false, error: error.message });
      return;
    }
    setEmailStatus({ saving: false, saved: true, error: null });
    setNewEmail("");
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (newPassword.length < 8) {
      setPasswordStatus({ saving: false, saved: false, error: "Password must be at least 8 characters." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordStatus({ saving: false, saved: false, error: "Passwords don't match." });
      return;
    }

    setPasswordStatus({ saving: true, saved: false, error: null });

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      setPasswordStatus({ saving: false, saved: false, error: error.message });
      return;
    }
    setPasswordStatus({ saving: false, saved: true, error: null });
    setNewPassword("");
    setConfirmPassword("");
  }

  return (
    <div className="space-y-6">
      <Card>
        <SectionHeading title="Account" description={`Signed in as ${userEmail}`} />
      </Card>

      <Card>
        <SectionHeading
          title="Change email"
          description="You may need to confirm the change from a link sent to the new address before it takes effect."
        />
        <form onSubmit={handleEmailSubmit} className="max-w-sm space-y-4">
          <div>
            <Label htmlFor="new-email">New email</Label>
            <TextInput
              id="new-email"
              type="email"
              required
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>
          {emailStatus.error ? <p className="text-sm text-red-600">{emailStatus.error}</p> : null}
          <div className="flex items-center gap-3">
            <PrimaryButton type="submit" disabled={emailStatus.saving}>
              {emailStatus.saving ? "Saving…" : "Update email"}
            </PrimaryButton>
            <SavedBadge show={emailStatus.saved} />
          </div>
        </form>
      </Card>

      <Card>
        <SectionHeading title="Change password" description="Choose a password with at least 8 characters." />
        <form onSubmit={handlePasswordSubmit} className="max-w-sm space-y-4">
          <div>
            <Label htmlFor="new-password">New password</Label>
            <TextInput
              id="new-password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="confirm-password">Confirm new password</Label>
            <TextInput
              id="confirm-password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          {passwordStatus.error ? <p className="text-sm text-red-600">{passwordStatus.error}</p> : null}
          <div className="flex items-center gap-3">
            <PrimaryButton type="submit" disabled={passwordStatus.saving}>
              {passwordStatus.saving ? "Saving…" : "Update password"}
            </PrimaryButton>
            <SavedBadge show={passwordStatus.saved} />
          </div>
        </form>
      </Card>
    </div>
  );
}
