import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { format } from "date-fns";
import {
  ArrowLeft,
  ArrowRight,
  Ban,
  Loader2,
  MapPin,
  Package,
  Phone,
  RotateCcw,
  Undo2,
} from "lucide-react";
import { toast } from "sonner";
import { fetchOrder, patchOrder, type OrderStatus } from "@/lib/api/orders";
import {
  getAllowedNextStatuses,
  getStatusActionKind,
  isAllowedStatusChange,
  orderStatusLabel,
} from "@/lib/order-status-workflow";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function OrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const qc = useQueryClient();

  const [editStatus, setEditStatus] = useState<OrderStatus>("order_placed");
  const [tagsInput, setTagsInput] = useState("");
  const [tracking, setTracking] = useState("");
  const [dispatchNotes, setDispatchNotes] = useState("");
  const [paymentNotes, setPaymentNotes] = useState("");
  const [adminNotes, setAdminNotes] = useState("");

  const {
    data: order,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => fetchOrder(orderId!),
    enabled: Boolean(orderId),
  });

  useEffect(() => {
    if (!order) return;
    setEditStatus(order.status);
    setTagsInput((order.tags ?? []).join(", "));
    setTracking(order.trackingReference ?? "");
    setDispatchNotes(order.dispatchNotes ?? "");
    setPaymentNotes(order.paymentNotes ?? "");
    setAdminNotes(order.adminNotes ?? "");
  }, [order]);

  const patchMutation = useMutation({
    mutationFn: async () => {
      if (!order?._id) return;
      const tags = tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      const statusChanged = editStatus !== order.status;
      if (statusChanged && !isAllowedStatusChange(order.status, editStatus)) {
        throw new Error("That status change is not allowed from the current state.");
      }
      await patchOrder(order._id, {
        ...(statusChanged ? { status: editStatus } : {}),
        tags,
        trackingReference: tracking.trim() || null,
        dispatchNotes: dispatchNotes.trim() || null,
        paymentNotes: paymentNotes.trim() || null,
        adminNotes: adminNotes.trim() || null,
      });
    },
    onSuccess: () => {
      toast.success("Order updated");
      void qc.invalidateQueries({ queryKey: ["orders"] });
      void qc.invalidateQueries({ queryKey: ["order", orderId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const allowedTargets = useMemo(
    () => (order ? getAllowedNextStatuses(order.status) : []),
    [order],
  );

  if (!orderId) {
    return (
      <div className="p-6">
        <p className="text-sm text-muted-foreground">Missing order id.</p>
      </div>
    );
  }

  return (
    <div className="p-6 pb-24 md:pb-6 max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-3 min-w-0">
          <Button variant="ghost" size="sm" className="-ml-2 h-8 text-muted-foreground" asChild>
            <Link to="/orders" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to orders
            </Link>
          </Button>
          {isLoading && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm">Loading order…</span>
            </div>
          )}
          {error && !isLoading && (
            <p className="text-sm text-destructive">{(error as Error).message}</p>
          )}
          {order && !isLoading && (
            <>
              <div className="flex flex-wrap items-center gap-2 gap-y-2">
                <h1 className="text-2xl font-semibold tracking-tight text-foreground font-mono">
                  {order.orderReference ?? "—"}
                </h1>
                <Badge variant="secondary" className="capitalize shrink-0">
                  {orderStatusLabel(order.status)}
                </Badge>
                {editStatus !== order.status ? (
                  <Badge variant="outline" className="capitalize shrink-0 border-primary/40 text-primary">
                    Pending: {orderStatusLabel(editStatus)}
                  </Badge>
                ) : null}
              </div>
              <p className="text-sm text-muted-foreground">
                {order.createdAt
                  ? `Placed ${format(new Date(order.createdAt), "MMM d, yyyy 'at' HH:mm")}`
                  : "Order"}
                {" · "}
                <span className="font-mono text-xs break-all">{order._id}</span>
              </p>
            </>
          )}
        </div>
        {order && !isLoading && (
          <div className="flex shrink-0 gap-2 sm:pt-8">
            <Button
              onClick={() => patchMutation.mutate()}
              disabled={patchMutation.isPending}
              className="min-w-[132px] shadow-sm"
            >
              {patchMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : null}
              Save changes
            </Button>
          </div>
        )}
      </div>

      {order && !isLoading && (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card className="overflow-hidden border-border/80 shadow-sm">
              <CardHeader className="border-b border-border/60 bg-muted/30 pb-4">
                <CardTitle className="text-base flex items-center gap-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  Line items
                </CardTitle>
                <CardDescription>Products, variants, and totals</CardDescription>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <ul className="space-y-3">
                  {order.lineItems.map((li, i) => (
                    <li
                      key={i}
                      className="rounded-lg border border-border/80 bg-card px-3 py-3 text-sm leading-relaxed"
                    >
                      <div className="font-medium text-foreground">{li.productName}</div>
                      <div className="text-muted-foreground text-xs mt-1">
                        {li.colorName} · size {li.size} × {li.quantity}
                      </div>
                      <div className="mt-2 flex flex-wrap justify-between gap-2 text-xs tabular-nums">
                        <span className="text-muted-foreground">
                          {order.currency} {li.unitPrice.toLocaleString()} each
                        </span>
                        <span className="font-medium text-foreground">
                          {order.currency} {li.lineTotal.toLocaleString()}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="rounded-lg bg-muted/40 px-3 py-3 text-sm space-y-1 tabular-nums">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span>
                      {order.currency} {order.itemsSubtotal.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Delivery</span>
                    <span>
                      {order.currency} {order.deliveryCharge.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between font-semibold text-foreground pt-1 border-t border-border/60 mt-1">
                    <span>Grand total</span>
                    <span>
                      {order.currency} {order.grandTotal.toLocaleString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/80 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Fulfillment & notes</CardTitle>
                <CardDescription>Tracking, dispatch, payment, and internal notes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="tags">Tags</Label>
                  <Input
                    id="tags"
                    className="mt-1.5"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    placeholder="priority, cod, …"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Comma-separated</p>
                </div>
                <div>
                  <Label htmlFor="tracking">Tracking reference</Label>
                  <Input
                    id="tracking"
                    className="mt-1.5"
                    value={tracking}
                    onChange={(e) => setTracking(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="dispatch">Dispatch notes</Label>
                  <Textarea
                    id="dispatch"
                    className="mt-1.5 min-h-[88px]"
                    value={dispatchNotes}
                    onChange={(e) => setDispatchNotes(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="payment">Payment notes</Label>
                  <Textarea
                    id="payment"
                    className="mt-1.5 min-h-[88px]"
                    value={paymentNotes}
                    onChange={(e) => setPaymentNotes(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="admin">Admin notes</Label>
                  <Textarea
                    id="admin"
                    className="mt-1.5 min-h-[88px]"
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-border/80 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Customer</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="flex gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Phone className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Order phone</p>
                    <p className="font-medium">{order.customerOrderPhone}</p>
                    <p className="text-xs text-muted-foreground mt-2">WhatsApp</p>
                    <p className="font-mono text-xs break-all">{order.customerWaPhone}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Delivery</p>
                    <p className="whitespace-pre-wrap mt-0.5">{order.deliveryLocation}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Location verified:{" "}
                      <span className="text-foreground font-medium">
                        {order.locationVerified ? "Yes" : "No"}
                      </span>
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Conversation</p>
                  <p className="font-mono text-xs break-all mt-1">{order.conversationId}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/80 shadow-md ring-1 ring-border/40 overflow-hidden">
              <CardHeader className="border-b border-border/60 bg-gradient-to-br from-muted/50 via-muted/20 to-background pb-4">
                <CardTitle className="text-base">Status</CardTitle>
                <CardDescription>
                  One step forward, one step back, or cancel until delivered. Skips are blocked on the
                  server.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-5">
                {order.status === "delivered" || order.status === "cancelled" ? (
                  <p className="text-sm text-muted-foreground">
                    This order is terminal — status cannot be changed.
                  </p>
                ) : (
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {allowedTargets.map((target) => {
                        const kind = getStatusActionKind(order.status, target);
                        const selected = editStatus === target;
                        const label =
                          kind === "cancel"
                            ? "Cancel order"
                            : `Set to ${orderStatusLabel(target)}`;
                        const Icon =
                          kind === "cancel" ? Ban : kind === "backward" ? Undo2 : ArrowRight;
                        return (
                          <Button
                            key={target}
                            type="button"
                            variant={kind === "cancel" ? "destructive" : kind === "backward" ? "outline" : "default"}
                            disabled={selected}
                            onClick={() => setEditStatus(target)}
                            className={cn(
                              "min-h-11 px-4 justify-start text-left font-medium transition-all",
                              kind === "forward" &&
                                "bg-primary text-primary-foreground shadow-md hover:shadow-lg hover:bg-primary/92 ring-0 ring-offset-0 border-0",
                              kind === "backward" &&
                                "border-2 border-dashed border-muted-foreground/35 bg-background hover:bg-muted/60 hover:border-muted-foreground/50",
                              kind === "cancel" &&
                                "shadow-md hover:shadow-lg border border-destructive/20",
                            )}
                          >
                            <span
                              className={cn(
                                "flex h-8 w-8 shrink-0 items-center justify-center rounded-md",
                                kind === "forward" && "bg-primary-foreground/15",
                                kind === "backward" && "bg-muted",
                                kind === "cancel" && "bg-destructive-foreground/15",
                              )}
                            >
                              <Icon className="h-4 w-4" />
                            </span>
                            <span className="flex flex-col items-start gap-0.5">
                              <span className="leading-tight">{label}</span>
                              <span className="text-[11px] font-normal opacity-80 capitalize">
                                {orderStatusLabel(target)}
                              </span>
                            </span>
                          </Button>
                        );
                      })}
                    </div>
                    {editStatus !== order.status ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="gap-2 text-muted-foreground hover:text-foreground"
                        onClick={() => setEditStatus(order.status)}
                      >
                        <RotateCcw className="h-4 w-4" />
                        Reset pending status
                      </Button>
                    ) : null}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {order && !isLoading && (
        <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-background/95 backdrop-blur-md p-3 md:hidden flex justify-end gap-2 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <Button variant="outline" size="sm" asChild>
            <Link to="/orders">List</Link>
          </Button>
          <Button
            size="sm"
            onClick={() => patchMutation.mutate()}
            disabled={patchMutation.isPending}
            className="min-w-[120px]"
          >
            {patchMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Save
          </Button>
        </div>
      )}
    </div>
  );
}
