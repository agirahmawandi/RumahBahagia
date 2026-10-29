"use client";

import React, { useState } from "react";
import { UserPlus, Copy } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { inviteMemberAction } from "@/app/actions/household";
import { formatTanggal } from "@/lib/format";

interface MemberItem {
  id: string;
  role: string;
  joinedAt: string;
  userId?: string;
  fullName: string;
  avatarUrl: string | null;
}

interface HouseholdSettingsProps {
  household: {
    id: string;
    name: string;
    type: string;
    role: string;
  };
  members: MemberItem[];
}

export function HouseholdSettings({ household, members }: HouseholdSettingsProps) {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"editor" | "viewer">("editor");
  const [invitationToken, setInvitationToken] = useState<string | null>(null);

  async function handleInvite(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Alamat email wajib diisi.");
      return;
    }

    setLoading(true);
    const res = await inviteMemberAction(household.id, email, role);
    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success("Undangan berhasil dibuat!");
      setInvitationToken(res.token || null);
      setEmail("");
    }
    setLoading(false);
  }

  function copyInviteLink() {
    if (!invitationToken) return;
    const url = `${window.location.origin}/onboarding?invitation=${invitationToken}`;
    navigator.clipboard.writeText(url);
    toast.success("Tautan undangan berhasil disalin ke clipboard!");
  }

  return (
    <div className="space-y-6">
      {/* Household Info */}
      <Card className="p-6 space-y-4">
        <h3 className="font-display text-lg font-bold text-ink">
          Informasi Buku Keuangan
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <span className="font-ui text-xs font-bold text-ink-muted">
              Nama Buku
            </span>
            <p className="mt-1 font-ui text-base font-bold text-ink">
              {household.name}
            </p>
          </div>
          <div>
            <span className="font-ui text-xs font-bold text-ink-muted">
              Jenis Buku
            </span>
            <p className="mt-1 font-ui text-base font-bold capitalize text-ink">
              {household.type === "family" ? "Keluarga" : "Pribadi"}
            </p>
          </div>
        </div>
      </Card>

      {/* Members List */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display text-lg font-bold text-ink">
              Anggota Terdaftar ({members.length})
            </h3>
            <p className="font-body text-xs text-ink-muted">
              Seluruh anggota yang memiliki akses ke buku keuangan ini.
            </p>
          </div>
        </div>

        <div className="divide-y divide-line/60">
          {members.map((m) => (
            <div key={m.id} className="py-3 flex items-center justify-between first:pt-0">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-cream border border-line font-ui text-xs font-bold text-ink">
                  {m.fullName.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="font-ui text-sm font-bold text-ink">
                    {m.fullName}
                  </p>
                  <p className="font-body text-xs text-ink-muted">
                    Bergabung {formatTanggal(m.joinedAt)}
                  </p>
                </div>
              </div>
              <Badge
                variant={m.role === "owner" ? "income" : "neutral"}
                className="capitalize"
              >
                {m.role}
              </Badge>
            </div>
          ))}
        </div>
      </Card>

      {/* Invite Form */}
      {household.role === "owner" && (
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-teal-700" />
            <h3 className="font-display text-lg font-bold text-ink">
              Undang Anggota Keluarga
            </h3>
          </div>
          <p className="font-body text-xs text-ink-muted">
            Kirim undangan ke pasangan atau anggota keluarga agar dapat mencatat transaksi bersama.
          </p>

          <form onSubmit={handleInvite} className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-12">
              <div className="sm:col-span-7 space-y-1.5">
                <Label htmlFor="invite-email">Alamat Email Pasangan / Anggota</Label>
                <Input
                  id="invite-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="pasangan@email.com"
                  required
                />
              </div>
              <div className="sm:col-span-3 space-y-1.5">
                <Label htmlFor="invite-role">Hak Akses</Label>
                <Select
                  id="invite-role"
                  value={role}
                  onChange={(e) => setRole(e.target.value as "editor" | "viewer")}
                >
                  <option value="editor">Editor (Bisa Catat)</option>
                  <option value="viewer">Viewer (Lihat Saja)</option>
                </Select>
              </div>
              <div className="sm:col-span-2 flex items-end">
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? "..." : "Undang"}
                </Button>
              </div>
            </div>
          </form>

          {invitationToken && (
            <div className="mt-4 p-4 rounded-[12px] bg-teal-50 border border-teal/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-ui text-xs font-bold text-teal-800">
                  Tautan Undangan Siap Dibagikan
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyInviteLink}
                  className="h-7 text-xs bg-white"
                >
                  <Copy className="h-3 w-3 mr-1" />
                  Salin Tautan
                </Button>
              </div>
              <p className="font-mono text-xs text-teal-900 break-all bg-white p-2 rounded-[8px] border border-teal/20">
                {typeof window !== "undefined"
                  ? `${window.location.origin}/onboarding?invitation=${invitationToken}`
                  : invitationToken}
              </p>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
