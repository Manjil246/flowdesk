import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { Loader2, Package } from "lucide-react";
import { fetchOrders, type OrderStatus } from "@/lib/api/orders";
import { ORDER_STATUS_VALUES, orderStatusLabel } from "@/lib/order-status-workflow";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function OrdersPage() {
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");

  const { data, isLoading, error } = useQuery({
    queryKey: ["orders", statusFilter],
    queryFn: () =>
      fetchOrders({
        status: statusFilter === "all" ? undefined : statusFilter,
        limit: 50,
      }),
  });

  const orders = data?.orders ?? [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Orders</h1>
          <p className="text-sm text-muted-foreground">
            WhatsApp shop orders — open an order for full details and status updates.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Status</span>
          <Select
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as OrderStatus | "all")}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {ORDER_STATUS_VALUES.map((s) => (
                <SelectItem key={s} value={s}>
                  {orderStatusLabel(s)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Package className="h-4 w-4" />
            Placed orders
            {data != null ? (
              <Badge variant="secondary" className="font-normal">
                {data.total} total
              </Badge>
            ) : null}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="flex justify-center py-12 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          )}
          {error && !isLoading && (
            <p className="text-sm text-destructive py-8 text-center">{(error as Error).message}</p>
          )}
          {!isLoading && !error && orders.length === 0 && (
            <p className="text-sm text-muted-foreground py-8 text-center">No orders yet.</p>
          )}
          {!isLoading && !error && orders.length > 0 && (
            <div className="rounded-md border border-border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order #</TableHead>
                    <TableHead>When</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((row) => (
                    <TableRow key={row._id}>
                      <TableCell className="text-sm font-mono whitespace-nowrap">
                        {row.orderReference ?? "—"}
                      </TableCell>
                      <TableCell className="text-sm whitespace-nowrap">
                        {row.createdAt
                          ? format(new Date(row.createdAt), "MMM d, yyyy HH:mm")
                          : "—"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {orderStatusLabel(row.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        <div>{row.customerOrderPhone}</div>
                        <div className="text-muted-foreground text-xs">WA {row.customerWaPhone}</div>
                      </TableCell>
                      <TableCell className="text-right font-medium tabular-nums">
                        {row.currency} {row.grandTotal.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/orders/${row._id}`}>View details</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
