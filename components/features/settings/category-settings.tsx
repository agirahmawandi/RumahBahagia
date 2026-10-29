"use client";

import React from "react";
import { Tag } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { CategoryItem } from "@/lib/data/accounts";

interface CategorySettingsProps {
  categories: CategoryItem[];
}

export function CategorySettings({ categories }: CategorySettingsProps) {
  const incomeCats = categories.filter((c) => c.kind === "income");
  const expenseCats = categories.filter((c) => c.kind === "expense");

  return (
    <div className="space-y-6">
      {/* Pemasukan Categories */}
      <Card className="p-6 space-y-4">
        <div>
          <h3 className="font-display text-lg font-bold text-ink">
            Kategori Pemasukan ({incomeCats.length})
          </h3>
          <p className="font-body text-xs text-ink-muted">
            Kategori yang terhubung ke Chart of Accounts Pendapatan (4-xxxx).
          </p>
        </div>

        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {incomeCats.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center gap-3 p-3 rounded-[10px] border border-line bg-cream-50/50"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-teal-50 border border-teal/20 text-teal-700">
                <Tag className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-ui text-sm font-bold text-ink truncate">
                  {cat.name}
                </p>
                <span className="font-ui text-[10px] text-teal-700 font-semibold uppercase">
                  Pendapatan
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Pengeluaran Categories */}
      <Card className="p-6 space-y-4">
        <div>
          <h3 className="font-display text-lg font-bold text-ink">
            Kategori Pengeluaran ({expenseCats.length})
          </h3>
          <p className="font-body text-xs text-ink-muted">
            Kategori yang terhubung ke Chart of Accounts Beban (5-xxxx).
          </p>
        </div>

        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {expenseCats.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center gap-3 p-3 rounded-[10px] border border-line bg-cream-50/50"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-flame-50 border border-flame/20 text-flame-700">
                <Tag className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-ui text-sm font-bold text-ink truncate">
                  {cat.name}
                </p>
                <span className="font-ui text-[10px] text-flame-700 font-semibold uppercase">
                  Beban Hidup
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
