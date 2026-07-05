import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { format } from "date-fns";
import {
  ArrowLeft,
  ArrowRight,
  Ban,
  ExternalLink,
  Loader2,
  Mail,
  MapPin,
  Package,
  Phone,
  Undo2,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { fetchOrder, patchOrder, type OrderDto, type OrderStatus } from "@/lib/api/orders";
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

const STATUS_FLOW: OrderStatus[] = [
  "order_placed",
  "payment_confirmed",
  "dispatched",
  "delivered",
];

function statusStepIndex(status: OrderStatus): number {
  if (status === "cancelled") return -1;
  const i = STATUS_FLOW.indexOf(status);
  return i >= 0 ? i : 0;
}

function hasStructuredDelivery(order: OrderDto): boolean {
  return Boolean(
    order.deliveryStreet?.trim() ||
      order.deliveryCity?.trim() ||
      order.deliveryDistrict?.trim() ||
      order.deliveryProvince?.trim(),
  );
}

function DeliveryField({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) {
  if (!value?.trim()) return null;
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground mb-1">{label}</p>
      <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{value}</p>
    </div>
  );
}

export default function OrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const qc = useQueryClient();

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
    setTagsInput((order.tags ?? []).join(", "));
    setTracking(order.trackingReference ?? "");
    setDispatchNotes(order.dispatchNotes ?? "");
    setPaymentNotes(order.paymentNotes ?? "");
    setAdminNotes(order.adminNotes ?? "");
  }, [order]);

  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: ["orders"] });
    void qc.invalidateQueries({ queryKey: ["order", orderId] });
  };

  const statusMutation = useMutation({
    mutationFn: async (target: OrderStatus) => {
      if (!order?._id) return;
      if (!isAllowedStatusChange(order.status, target)) {
        throw new Error("That status change is not allowed from the current state.");
      }
      await patchOrder(order._id, { status: target });
    },
    onSuccess: (_data, target) => {
      toast.success(`Order marked as ${orderStatusLabel(target)}`);
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const notesMutation = useMutation({
    mutationFn: async () => {
      if (!order?._id) return;
      const tags = tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      await patchOrder(order._id, {
        tags,
        trackingReference: tracking.trim() || null,
        dispatchNotes: dispatchNotes.trim() || null,
        paymentNotes: paymentNotes.trim() || null,
        adminNotes: adminNotes.trim() || null,
      });
    },
    onSuccess: () => {
      toast.success("Notes saved");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const allowedTargets = useMemo(
    () => (order ? getAllowedNextStatuses(order.status) : []),
    [order],
  );

  const totalPieces = useMemo(
    () => order?.lineItems.reduce((sum, li) => sum + li.quantity, 0) ?? 0,
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
    <div className="mx-auto max-w-6xl space-y-6 pb-24 md:pb-6">
      <div className="flex flex-col gap-4">
        <Button variant="ghost" size="sm" className="-ml-2 h-8 w-fit text-muted-foreground" asChild>
          <Link to="/admin/orders" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to orders
          </Link>
        </Button>

        {isLoading && (
          <div className="flex items-center gap-2 text-muted-foreground py-12 justify-center">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="text-sm">Loading order…</span>
          </div>
        )}

        {error && !isLoading && (
          <p className="text-sm text-destructive py-8 text-center">{(error as Error).message}</p>
        )}

        {order && !isLoading && (
          <>
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
              <div className="space-y-2 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="admin-display-title text-2xl tracking-tight font-mono">
                    {order.orderReference}
                  </h1>
                  <Badge variant="secondary" className="shrink-0">
                    {orderStatusLabel(order.status)}
                  </Badge>
                  {order.source === "web" ? (
                    <Badge variant="outline" className="shrink-0">Website</Badge>
                  ) : order.source === "admin" ? (
                    <Badge variant="outline" className="shrink-0">Manual</Badge>
                  ) : order.source === "whatsapp" ? (
                    <Badge variant="outline" className="shrink-0">WhatsApp</Badge>
                  ) : null}
                </div>
                <p className="text-sm text-muted-foreground">
                  Placed {order.createdAt ? format(new Date(order.createdAt), "MMM d, yyyy 'at' HH:mm") : "—"}
                  {" · "}
                  {totalPieces} {totalPieces === 1 ? "piece" : "pieces"}
                  {" · "}
                  {order.lineItems.length} {order.lineItems.length === 1 ? "item" : "items"}
                </p>
              </div>
              <div className="rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm shrink-0">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Grand total</p>
                <p className="text-xl font-semibold tabular-nums">
                  {order.currency} {order.grandTotal.toLocaleString()}
                </p>
              </div>
            </div>

            {order.status !== "cancelled" && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {STATUS_FLOW.map((step, i) => {
                  const current = statusStepIndex(order.status);
                  const done = i < current;
                  const active = i === current;
                  return (
                    <div
                      key={step}
                      className={cn(
                        "rounded-lg border px-3 py-2.5 text-center text-xs",
                        done && "border-accent-foreground/30 bg-secondary text-accent-foreground",
                        active && "border-foreground bg-foreground/10 text-foreground font-medium",
                        !done && !active && "border-border bg-background text-muted-foreground",
                      )}
                    >
                      {orderStatusLabel(step)}
                    </div>
                  );
                })}
              </div>
            )}

            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-6">
                <Card className="overflow-hidden border-border/80 shadow-sm">
                  <CardHeader className="border-b border-border/60 bg-muted/30 pb-4">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      Ordered items
                    </CardTitle>
                    <CardDescription>
                      {order.lineItems.length} products · {totalPieces} total pieces
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <ul className="divide-y divide-border">
                      {order.lineItems.map((li, i) => (
                        <li key={`${li.productId}-${li.colorId}-${li.size}-${i}`} className="flex gap-4 p-4">
                          <div className="relative shrink-0">
                            {li.imageUrl ? (
                              <img
                                src={li.imageUrl}
                                alt={li.productName}
                                className="h-24 w-20 rounded-md object-cover border border-border bg-muted"
                              />
                            ) : (
                              <div className="h-24 w-20 rounded-md border border-border bg-muted flex items-center justify-center">
                                <Package className="h-6 w-6 text-muted-foreground" />
                              </div>
                            )}
                            <span className="absolute -top-2 -right-2 flex h-6 min-w-6 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-semibold text-primary-foreground">
                              ×{li.quantity}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0 space-y-1">
                            <p className="font-medium text-foreground leading-snug">{li.productName}</p>
                            <div className="flex flex-wrap gap-2 text-xs">
                              <Badge variant="outline">{li.colorName}</Badge>
                              <Badge variant="outline">Size {li.size}</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground pt-1">
                              {order.currency} {li.unitPrice.toLocaleString()} each
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="font-semibold tabular-nums">
                              {order.currency} {li.lineTotal.toLocaleString()}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {li.quantity} {li.quantity === 1 ? "pc" : "pcs"}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                    <div className="border-t border-border bg-muted/20 px-4 py-4 space-y-2 text-sm tabular-nums">
                      <div className="flex justify-between text-muted-foreground">
                        <span>Subtotal</span>
                        <span>{order.currency} {order.itemsSubtotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>Delivery</span>
                        <span>
                          {order.deliveryCharge === 0
                            ? "Free"
                            : `${order.currency} ${order.deliveryCharge.toLocaleString()}`}
                        </span>
                      </div>
                      <div className="flex justify-between font-semibold text-foreground pt-2 border-t border-border/60">
                        <span>Grand total</span>
                        <span>{order.currency} {order.grandTotal.toLocaleString()}</span>
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
                      <Input id="tags" className="mt-1.5" value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} placeholder="priority, cod, …" />
                    </div>
                    <div>
                      <Label htmlFor="tracking">Tracking reference</Label>
                      <Input id="tracking" className="mt-1.5" value={tracking} onChange={(e) => setTracking(e.target.value)} />
                    </div>
                    <div>
                      <Label htmlFor="dispatch">Dispatch notes</Label>
                      <Textarea id="dispatch" className="mt-1.5 min-h-[88px]" value={dispatchNotes} onChange={(e) => setDispatchNotes(e.target.value)} />
                    </div>
                    <div>
                      <Label htmlFor="payment">Payment notes</Label>
                      <Textarea id="payment" className="mt-1.5 min-h-[88px]" value={paymentNotes} onChange={(e) => setPaymentNotes(e.target.value)} />
                    </div>
                    <div>
                      <Label htmlFor="admin">Admin notes</Label>
                      <Textarea id="admin" className="mt-1.5 min-h-[88px]" value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)} />
                    </div>
                    <Button
                      onClick={() => notesMutation.mutate()}
                      disabled={notesMutation.isPending}
                      variant="outline"
                      className="w-full sm:w-auto"
                    >
                      {notesMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      Save notes
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card className="border-border/80 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Customer
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm">
                    {order.customerName ? (
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wide">Name</p>
                        <p className="font-medium mt-0.5">{order.customerName}</p>
                      </div>
                    ) : null}
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div>
                        <p className="text-xs text-muted-foreground">Phone</p>
                        <a href={`tel:${order.customerOrderPhone}`} className="font-medium hover:underline">
                          {order.customerOrderPhone}
                        </a>
                      </div>
                    </div>
                    {order.customerEmail ? (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs text-muted-foreground">Email</p>
                          <a href={`mailto:${order.customerEmail}`} className="text-sm break-all hover:underline">
                            {order.customerEmail}
                          </a>
                        </div>
                      </div>
                    ) : null}
                    {order.customerWaPhone ? (
                      <div>
                        <p className="text-xs text-muted-foreground">WhatsApp</p>
                        <p className="font-mono text-xs break-all">{order.customerWaPhone}</p>
                      </div>
                    ) : null}
                  </CardContent>
                </Card>

                <Card className="border-border/80 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Delivery address
                    </CardTitle>
                    <CardDescription>Same fields the customer entered at checkout</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm">
                    {hasStructuredDelivery(order) ? (
                      <>
                        <DeliveryField label="Street address *" value={order.deliveryStreet} />
                        <div className="grid grid-cols-2 gap-4">
                          <DeliveryField label="Province *" value={order.deliveryProvince} />
                          <DeliveryField label="City *" value={order.deliveryCity} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <DeliveryField label="District" value={order.deliveryDistrict} />
                          <DeliveryField label="Zip code" value={order.deliveryZipCode} />
                        </div>
                        <DeliveryField
                          label="Delivery notes"
                          value={
                            order.deliveryCustomerNotes ||
                            (order.source === "web" ? order.dispatchNotes : null)
                          }
                        />
                      </>
                    ) : (
                      <>
                        <DeliveryField label="Street address" value={order.deliveryLocation} />
                        <DeliveryField label="Zip code" value={order.deliveryZipCode} />
                      </>
                    )}
                    <div className="pt-2 border-t border-border/60 space-y-2">
                      <p className="text-xs text-muted-foreground">
                        Location verified:{" "}
                        <span className="text-foreground font-medium">
                          {order.locationVerified ? "Yes" : "No"}
                        </span>
                      </p>
                      {order.deliveryLocationLat != null && order.deliveryLocationLng != null ? (
                        <a
                          href={`https://www.google.com/maps?q=${order.deliveryLocationLat},${order.deliveryLocationLng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                        >
                          View GPS on map
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : null}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border/80 shadow-md overflow-hidden">
                  <CardHeader className="border-b border-border/60 bg-muted/30 pb-4">
                    <CardTitle className="text-base">Update status</CardTitle>
                    <CardDescription>
                      Changes apply immediately when you click a button below.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-5">
                    {order.status === "delivered" || order.status === "cancelled" ? (
                      <p className="text-sm text-muted-foreground">
                        This order is {orderStatusLabel(order.status).toLowerCase()} — status cannot be changed.
                      </p>
                    ) : (
                      <div className="flex flex-col gap-2">
                        {allowedTargets.map((target) => {
                          const kind = getStatusActionKind(order.status, target);
                          const label =
                            kind === "cancel"
                              ? "Cancel order"
                              : `Mark as ${orderStatusLabel(target)}`;
                          const Icon =
                            kind === "cancel" ? Ban : kind === "backward" ? Undo2 : ArrowRight;
                          const isPending =
                            statusMutation.isPending && statusMutation.variables === target;
                          return (
                            <Button
                              key={target}
                              type="button"
                              variant={kind === "cancel" ? "destructive" : kind === "backward" ? "outline" : "default"}
                              disabled={statusMutation.isPending}
                              onClick={() => statusMutation.mutate(target)}
                              className="min-h-11 justify-start gap-3"
                            >
                              {isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                              ) : (
                                <Icon className="h-4 w-4 shrink-0" />
                              )}
                              {label}
                            </Button>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
