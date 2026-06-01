// src/app/(dashboard)/transactions/page.tsx
"use client"

import { useState } from "react"
import { useTransactions, useDeleteTransaction } from "@/hooks/useTransactions"
import { useAuthStore } from "@/store/auth.store"
import {
  useReactTable, getCoreRowModel, flexRender,
  ColumnDef,
} from "@tanstack/react-table"
import { Transaction } from "@/services/transaction.service"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import {
  DropdownMenu, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { AddTransactionModal } from "@/components/forms/add-transaction-modal"
import {
  Plus, Search, Download, MoreHorizontal,
  Trash2, ChevronLeft, ChevronRight,
} from "lucide-react"
import { transactionService } from "@/services/transaction.service"
import { format } from "date-fns"

export default function TransactionsPage() {
  const { user } = useAuthStore()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("")
  const [addOpen, setAddOpen] = useState(false)
  const symbol = user?.currency === "USD" ? "$" : "₹"

  const { data, isLoading } = useTransactions({
    page,
    per_page: 15,
    search: search || undefined,
    transaction_type: typeFilter || undefined,
  })

  const { mutate: deleteTransaction } = useDeleteTransaction()

  const columns: ColumnDef<Transaction>[] = [
    {
      header: "Date",
      accessorKey: "date",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          {format(new Date(row.original.date), "dd MMM yyyy")}
        </span>
      ),
    },
    {
      header: "Description",
      accessorKey: "description",
      cell: ({ row }) => {
        const t = row.original
        return (
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0"
              style={{ backgroundColor: `${t.category_color ?? "#6366F1"}20` }}
            >
              {t.category_icon ?? "📦"}
            </div>
            <div>
              <p className="text-sm font-medium">{t.description}</p>
              <p className="text-xs text-muted-foreground">{t.category_name ?? "Uncategorized"}</p>
            </div>
          </div>
        )
      },
    },
    {
      header: "Account",
      accessorKey: "account_name",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">{row.original.account_name}</span>
      ),
    },
    {
      header: "Type",
      accessorKey: "transaction_type",
      cell: ({ row }) => (
        <Badge
          variant="secondary"
          className={`capitalize text-xs border-0 ${row.original.transaction_type === "income"
              ? "bg-green-500/10 text-green-600 dark:text-green-400"
              : row.original.transaction_type === "expense"
                ? "bg-red-500/10 text-red-600 dark:text-red-400"
                : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
            }`}
        >
          {row.original.transaction_type}
        </Badge>
      ),
    },
    {
      header: "Payment",
      accessorKey: "payment_method",
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground capitalize">
          {row.original.payment_method.replace("_", " ")}
        </span>
      ),
    },
    {
      header: "Amount",
      accessorKey: "amount_display",
      cell: ({ row }) => {
        const t = row.original
        return (
          <span className={`text-sm font-semibold whitespace-nowrap ${t.transaction_type === "income"
              ? "text-green-600 dark:text-green-400"
              : "text-red-600 dark:text-red-400"
            }`}>
            {t.transaction_type === "income" ? "+" : "-"}
            {symbol}{t.amount_display.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </span>
        )
      },
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => deleteTransaction(row.original.id)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  const table = useReactTable({
    data: data?.items ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: data?.total_pages ?? 0,
  })

  return (
    <div className="space-y-5 page-enter">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Transactions</h2>
          <p className="text-muted-foreground text-sm mt-1">
            {data?.total ?? 0} total transactions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={transactionService.exportCSV}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button size="sm" onClick={() => setAddOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search transactions..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2">
            {["", "expense", "income", "transfer"].map((type) => (
              <Button
                key={type}
                variant={typeFilter === type ? "default" : "outline"}
                size="sm"
                onClick={() => { setTypeFilter(type); setPage(1) }}
                className="capitalize"
              >
                {type === "" ? "All" : type}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id} className="border-b border-border">
                  {hg.headers.map((header) => (
                    <th
                      key={header.id}
                      className="text-left text-xs font-medium text-muted-foreground px-4 py-3"
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {isLoading
                ? Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="border-b border-border">
                    {Array(7).fill(0).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <Skeleton className="h-4 w-full" />
                      </td>
                    ))}
                  </tr>
                ))
                : table.getRowModel().rows.length === 0
                  ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-16 text-center">
                        <p className="text-sm text-muted-foreground">
                          {search ? "No transactions match your search" : "No transactions yet — add your first one"}
                        </p>
                      </td>
                    </tr>
                  )
                  : table.getRowModel().rows.map((row) => (
                    <tr
                      key={row.id}
                      className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="px-4 py-3">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))
              }
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {(data?.total_pages ?? 0) > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Page {page} of {data?.total_pages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={page === data?.total_pages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      <AddTransactionModal open={addOpen} onOpenChange={setAddOpen} />
    </div>
  )
}