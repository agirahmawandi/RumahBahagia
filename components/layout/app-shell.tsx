"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  Wallet,
  PiggyBank,
  TrendingUp,
  Home,
  HandCoins,
  FileBarChart2,
  Settings,
  Plus,
  ChevronDown,
  Calendar,
  Users,
  Check,
  LogOut,
  X,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { switchHouseholdAction } from "@/app/actions/household";
import { logoutAction } from "@/app/(auth)/actions";
import type { CurrentHousehold, UserHouseholdSummary } from "@/lib/data/household";

export const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Pemasukan", href: "/pemasukan", icon: ArrowDownLeft },
  { label: "Pengeluaran", href: "/pengeluaran", icon: ArrowUpRight },
  { label: "Transfer", href: "/transfer", icon: ArrowLeftRight },
  { label: "Rekening", href: "/rekening", icon: Wallet },
  { label: "Tabungan", href: "/tabungan", icon: PiggyBank },
  { label: "Investasi", href: "/investasi", icon: TrendingUp },
  { label: "Aset", href: "/aset", icon: Home },
  { label: "Utang", href: "/utang", icon: HandCoins },
  { label: "Laporan", href: "/laporan", icon: FileBarChart2 },
  { label: "Pengaturan", href: "/pengaturan", icon: Settings },
] as const;

const QUICK_ACTIONS = [
  {
    label: "Catat Pemasukan",
    desc: "Gaji, bonus, usaha, hadiah",
    href: "/pemasukan?new=1",
    icon: ArrowDownLeft,
    badgeClass: "bg-teal-50 text-teal-700 border-teal/30",
  },
  {
    label: "Catat Pengeluaran",
    desc: "Belanja, tagihan, makan, transportasi",
    href: "/pengeluaran?new=1",
    icon: ArrowUpRight,
    badgeClass: "bg-flame-50 text-flame-700 border-flame/30",
  },
  {
    label: "Transfer Rekening",
    desc: "Pindah saldo antar bank, cash, e-wallet",
    href: "/transfer?new=1",
    icon: ArrowLeftRight,
    badgeClass: "bg-cream text-ink border-line",
  },
  {
    label: "Setor Tabungan",
    desc: "Alokasikan dana ke pos tabungan impian",
    href: "/tabungan?new=1",
    icon: PiggyBank,
    badgeClass: "bg-peach-100 text-ink border-peach/40",
  },
];

interface AppShellProps {
  children: React.ReactNode;
  currentUser?: {
    id: string;
    email?: string;
    fullName: string;
    avatarUrl: string | null;
  } | null;
  currentHousehold?: CurrentHousehold | null;
  userHouseholds?: UserHouseholdSummary[];
}

export function AppShell({
  children,
  currentUser,
  currentHousehold,
  userHouseholds = [],
}: AppShellProps) {
  const pathname = usePathname();
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [mobileMoreOpen, setMobileMoreOpen] = useState(false);
  const [householdMenuOpen, setHouseholdMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [switching, setSwitching] = useState(false);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  const userInitials = (currentUser?.fullName || "User")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  async function handleSwitchHousehold(id: string) {
    if (id === currentHousehold?.id) {
      setHouseholdMenuOpen(false);
      return;
    }
    setSwitching(true);
    await switchHouseholdAction(id);
    setSwitching(false);
    setHouseholdMenuOpen(false);
  }

  return (
    <div className="min-h-screen bg-cream-50 text-ink flex">
      {/* Sidebar Desktop (248px, bg --cream sesuai DBD §4) */}
      <aside className="hidden lg:flex lg:w-[248px] lg:flex-col lg:fixed lg:inset-y-0 bg-cream border-r border-line select-none z-30">
        {/* Brand Header */}
        <div className="flex h-16 items-center gap-3 px-5 border-b border-line/80">
          <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-teal text-ink font-display font-bold text-xl shadow-xs">
            RB
          </div>
          <div>
            <span className="font-display text-lg font-bold tracking-tight text-ink block leading-none">
              RumahBahagia
            </span>
            <span className="font-ui text-[11px] font-semibold text-ink-muted">
              Keuangan Keluarga
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-[12px] px-3.5 py-2.5 font-ui text-sm font-bold transition-colors",
                  active
                    ? "bg-teal text-ink shadow-xs"
                    : "text-ink/80 hover:bg-cream-50 hover:text-ink"
                )}
              >
                <Icon className="h-5 w-5 shrink-0" strokeWidth={1.75} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer Info Household */}
        <div className="p-3 border-t border-line/80">
          <div className="rounded-[12px] bg-cream-50 p-3 border border-line">
            <div className="flex items-center justify-between">
              <span className="font-ui text-[11px] font-bold uppercase tracking-wider text-teal-700">
                Buku Aktif
              </span>
              <span className="rounded-full bg-teal-50 px-2 py-0.5 font-ui text-[10px] font-bold text-teal-700 capitalize">
                {currentHousehold?.role || "Owner"}
              </span>
            </div>
            <p className="mt-1 font-display text-sm font-bold text-ink truncate">
              {currentHousehold?.name || "Buku Keuangan"}
            </p>
            <p className="font-body text-xs text-ink-muted">
              Double-Entry Ledger · IDR
            </p>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:pl-[248px] min-w-0">
        {/* Topbar */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-line bg-cream-50/90 px-4 lg:px-8 backdrop-blur-md">
          {/* Mobile Brand / Household Switcher */}
          <div className="flex items-center gap-3 relative">
            <div className="flex lg:hidden h-9 w-9 items-center justify-center rounded-[10px] bg-teal text-ink font-display font-bold text-base">
              RB
            </div>

            {/* Switcher Button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setHouseholdMenuOpen(!householdMenuOpen)}
                className="inline-flex items-center gap-2 rounded-[12px] border border-line bg-white px-3 py-1.5 font-ui text-xs sm:text-sm font-bold text-ink hover:bg-cream transition-colors cursor-pointer"
              >
                <Users className="h-4 w-4 text-teal-700" strokeWidth={1.75} />
                <span className="truncate max-w-[130px] sm:max-w-[200px]">
                  {currentHousehold?.name || "Pilih Buku"}
                </span>
                <ChevronDown className="h-3.5 w-3.5 text-ink-muted" />
              </button>

              {/* Household Switcher Dropdown */}
              {householdMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setHouseholdMenuOpen(false)}
                  />
                  <div className="absolute left-0 mt-2 w-64 rounded-[14px] border border-line bg-white p-2 shadow-tropical z-40 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-2 py-1.5 font-ui text-[11px] font-bold uppercase tracking-wider text-ink-muted border-b border-line/60 mb-1">
                      Ganti Buku Keuangan
                    </div>
                    <div className="max-h-60 overflow-y-auto space-y-1">
                      {userHouseholds.map((h) => (
                        <button
                          key={h.id}
                          type="button"
                          disabled={switching}
                          onClick={() => handleSwitchHousehold(h.id)}
                          className={cn(
                            "w-full flex items-center justify-between gap-2 rounded-[10px] px-3 py-2 text-left font-ui text-sm font-semibold transition-colors cursor-pointer",
                            h.id === currentHousehold?.id
                              ? "bg-teal-50 text-teal-800 font-bold"
                              : "hover:bg-cream-50 text-ink"
                          )}
                        >
                          <span className="truncate">{h.name}</span>
                          {h.id === currentHousehold?.id && (
                            <Check className="h-4 w-4 text-teal-700 shrink-0" />
                          )}
                        </button>
                      ))}
                    </div>
                    <div className="pt-2 mt-1 border-t border-line/60">
                      <Link
                        href="/onboarding"
                        onClick={() => setHouseholdMenuOpen(false)}
                        className="flex items-center gap-2 rounded-[10px] px-3 py-2 font-ui text-xs font-bold text-teal-700 hover:bg-teal-50 transition-colors"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Buat Buku Baru</span>
                      </Link>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Period Indicator */}
            <div className="hidden sm:inline-flex items-center gap-2 rounded-[12px] border border-line bg-white px-3 py-1.5 font-ui text-xs sm:text-sm font-semibold text-ink">
              <Calendar className="h-4 w-4 text-peach" strokeWidth={1.75} />
              <span>
                {new Date().toLocaleDateString("id-ID", {
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2.5 relative">
            <Button
              variant="primary"
              size="sm"
              onClick={() => setQuickAddOpen(true)}
              className="hidden sm:inline-flex"
            >
              <Plus className="h-4 w-4" strokeWidth={2.25} />
              <span>Catat Transaksi</span>
            </Button>

            {/* User Profile Avatar & Menu */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-cream font-ui text-xs font-bold text-ink hover:bg-peach-100 transition-colors cursor-pointer"
                title={currentUser?.fullName || "Profil Pengguna"}
              >
                {userInitials}
              </button>

              {userMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setUserMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 rounded-[14px] border border-line bg-white p-2 shadow-tropical z-40 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-3 py-2 border-b border-line/60 mb-1">
                      <p className="font-ui text-sm font-bold text-ink truncate">
                        {currentUser?.fullName}
                      </p>
                      <p className="font-body text-xs text-ink-muted truncate">
                        {currentUser?.email}
                      </p>
                    </div>
                    <Link
                      href="/pengaturan"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 rounded-[10px] px-3 py-2 font-ui text-xs font-bold text-ink hover:bg-cream-50 transition-colors"
                    >
                      <Settings className="h-4 w-4 text-ink-muted" />
                      <span>Pengaturan Akun</span>
                    </Link>
                    <button
                      type="button"
                      onClick={async () => {
                        setUserMenuOpen(false);
                        await logoutAction();
                      }}
                      className="w-full flex items-center gap-2 rounded-[10px] px-3 py-2 font-ui text-xs font-bold text-flame-700 hover:bg-flame-50 transition-colors cursor-pointer"
                    >
                      <LogOut className="h-4 w-4 text-flame" />
                      <span>Keluar (Logout)</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Page Container */}
        <main className="flex-1 w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 lg:pb-10">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 h-16 border-t border-line bg-white/95 backdrop-blur-md px-2 flex items-center justify-around">
        <Link
          href="/dashboard"
          className={cn(
            "flex flex-col items-center justify-center gap-1 px-2 py-1 font-ui text-[11px] font-bold",
            isActive("/dashboard") ? "text-teal-700" : "text-ink-muted"
          )}
        >
          <LayoutDashboard className="h-5 w-5" strokeWidth={1.75} />
          <span>Dashboard</span>
        </Link>

        <Link
          href="/pengeluaran"
          className={cn(
            "flex flex-col items-center justify-center gap-1 px-2 py-1 font-ui text-[11px] font-bold",
            isActive("/pengeluaran") || isActive("/pemasukan")
              ? "text-teal-700"
              : "text-ink-muted"
          )}
        >
          <ArrowUpRight className="h-5 w-5" strokeWidth={1.75} />
          <span>Transaksi</span>
        </Link>

        {/* FAB 56px */}
        <div className="-mt-6">
          <button
            type="button"
            onClick={() => setQuickAddOpen(true)}
            aria-label="Tambah transaksi cepat"
            className="flex h-14 w-14 items-center justify-center rounded-full bg-flame text-white shadow-lg hover:bg-flame-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal transition-transform active:scale-95 cursor-pointer"
          >
            <Plus className="h-7 w-7" strokeWidth={2.5} />
          </button>
        </div>

        <Link
          href="/tabungan"
          className={cn(
            "flex flex-col items-center justify-center gap-1 px-2 py-1 font-ui text-[11px] font-bold",
            isActive("/tabungan") ? "text-teal-700" : "text-ink-muted"
          )}
        >
          <PiggyBank className="h-5 w-5" strokeWidth={1.75} />
          <span>Tabungan</span>
        </Link>

        <button
          type="button"
          onClick={() => setMobileMoreOpen(true)}
          className={cn(
            "flex flex-col items-center justify-center gap-1 px-2 py-1 font-ui text-[11px] font-bold cursor-pointer",
            mobileMoreOpen ? "text-teal-700" : "text-ink-muted"
          )}
        >
          <Menu className="h-5 w-5" strokeWidth={1.75} />
          <span>Lainnya</span>
        </button>
      </nav>

      {/* Quick-Add Sheet / Modal */}
      {quickAddOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-ink/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-[16px] border border-line bg-white p-5 shadow-tropical animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-line">
              <div>
                <h2 className="font-display text-xl font-bold text-ink">
                  Catat Transaksi Cepat
                </h2>
                <p className="font-body text-xs text-ink-muted">
                  Pilih transaksi yang ingin Anda catat
                </p>
              </div>
              <button
                type="button"
                onClick={() => setQuickAddOpen(false)}
                className="rounded-[8px] p-1.5 text-ink-muted hover:bg-cream transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-2.5">
              {QUICK_ACTIONS.map((action) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.href}
                    href={action.href}
                    onClick={() => setQuickAddOpen(false)}
                    className="flex items-center gap-3.5 rounded-[12px] border border-line p-3 hover:bg-cream-50 transition-colors"
                  >
                    <div
                      className={cn(
                        "flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] border",
                        action.badgeClass
                      )}
                    >
                      <Icon className="h-5 w-5" strokeWidth={2} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-ui text-sm font-bold text-ink">
                        {action.label}
                      </p>
                      <p className="font-body text-xs text-ink-muted truncate">
                        {action.desc}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Mobile More Navigation Sheet */}
      {mobileMoreOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 backdrop-blur-xs lg:hidden">
          <div className="w-full rounded-t-[20px] border-t border-line bg-white p-5 shadow-tropical animate-in slide-in-from-bottom duration-200 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-line">
              <span className="font-display text-lg font-bold text-ink">
                Menu Lengkap
              </span>
              <button
                type="button"
                onClick={() => setMobileMoreOpen(false)}
                className="rounded-[8px] p-1.5 text-ink-muted hover:bg-cream"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2.5 py-4">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMoreOpen(false)}
                    className={cn(
                      "flex flex-col items-center justify-center gap-2 rounded-[14px] p-3 text-center border font-ui text-xs font-bold transition-colors",
                      active
                        ? "border-teal bg-teal text-ink shadow-xs"
                        : "border-line bg-white text-ink hover:bg-cream"
                    )}
                  >
                    <Icon className="h-6 w-6" strokeWidth={1.75} />
                    <span className="truncate w-full">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
