"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface AdminPaginationProps {
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (newPage: number) => void;
  onPageSizeChange?: (newSize: number) => void;
  pageSizeOptions?: number[];
}

export function AdminPagination({
  page,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [12, 24, 48, 96],
}: AdminPaginationProps) {
  if (totalItems === 0) return null;

  const startItem = (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, totalItems);

  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (page <= 4) {
      return [1, 2, 3, 4, 5, "...", totalPages];
    }

    if (page >= totalPages - 3) {
      return [1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }

    return [1, "...", page - 1, page, page + 1, "...", totalPages];
  };

  const pages = getPageNumbers();

  return (
    <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-navy-900/70 border-t border-navy-100 pt-4">
      <div className="flex flex-wrap items-center gap-3">
        <span className="font-medium text-navy-900">
          <span className="text-navy-900 font-bold">{startItem}-{endItem}</span> dan {" "}
          <span className="text-navy-900 font-bold">{totalItems}</span> ta mahsulot
        </span>

        {onPageSizeChange && (
          <div className="flex items-center gap-1.5 text-xs text-navy-900/60 pl-2 sm:border-l sm:border-navy-200">
            <span>Ko'rsatish:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="rounded-md border border-navy-200 bg-white px-2 py-1 text-xs font-semibold text-navy-900 outline-none hover:border-navy-400 focus:border-navy-900"
            >
              {pageSizeOptions.map((sz) => (
                <option key={sz} value={sz}>
                  {sz} tadan
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1 select-none">
        <button
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="flex h-8 items-center gap-1 rounded-lg border border-navy-200/80 px-2.5 text-xs font-semibold text-navy-900 transition hover:bg-navy-50 disabled:opacity-30 disabled:pointer-events-none"
          title="Oldingi sahifa"
        >
          <ChevronLeft size={14} />
          <span className="hidden sm:inline">Oldingi</span>
        </button>

        <div className="flex items-center gap-1">
          {pages.map((p, idx) => {
            if (p === "...") {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className="flex h-8 w-7 items-center justify-center text-xs font-bold text-navy-900/40"
                >
                  ...
                </span>
              );
            }

            const pageNumber = p as number;
            const isActive = page === pageNumber;

            return (
              <button
                key={pageNumber}
                onClick={() => onPageChange(pageNumber)}
                className={`flex h-8 min-w-[32px] px-1.5 items-center justify-center rounded-lg text-xs font-bold transition ${isActive ? "bg-navy-900 text-white shadow-xs" : "border border-navy-200/80 text-navy-900 hover:bg-navy-50"}`}
              >
                {pageNumber}
              </button>
            );
          })}
        </div>

        <button
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="flex h-8 items-center gap-1 rounded-lg border border-navy-200/80 px-2.5 text-xs font-semibold text-navy-900 transition hover:bg-navy-50 disabled:opacity-30 disabled:pointer-events-none"
          title="Keyingi sahifa"
        >
          <span className="hidden sm:inline">Keyingi</span>
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
