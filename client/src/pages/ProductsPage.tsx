import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  deleteProduct,
  fetchCategories,
  fetchProducts,
  type CategoryDto,
} from "@/lib/api/catalog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

function categoryName(categories: CategoryDto[], id: string): string {
  return categories.find((c) => c.id === id)?.name ?? id.slice(0, 8);
}

function shortId(id: string): string {
  return id.length > 10 ? `${id.slice(0, 10)}…` : id;
}

export default function ProductsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [activeFilter, setActiveFilter] = useState<"all" | "true" | "false">(
    "all",
  );
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: () => fetchCategories({ active: "all" }),
  });

  const {
    data: products = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["products", categoryFilter, activeFilter, search],
    queryFn: () =>
      fetchProducts({
        active: activeFilter,
        categoryId: categoryFilter === "all" ? undefined : categoryFilter,
        search: search.trim() || undefined,
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onSuccess: () => {
      toast.success("Product deleted");
      qc.invalidateQueries({ queryKey: ["products"] });
      setDeleteId(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Products
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage products, colors, and stock. Open a row to edit details.
          </p>
        </div>
        <Button
          className="gap-2 shrink-0"
          disabled={categories.length === 0}
          asChild
        >
          <Link to="/products/new">
            <Plus className="h-4 w-4" />
            New product
          </Link>
        </Button>
      </div>

      {categories.length === 0 && (
        <p className="text-sm text-amber-700 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-md px-3 py-2">
          Create at least one category before adding products.
        </p>
      )}

      <Card className="card-shadow border-border/60">
        <CardHeader className="pb-2 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between space-y-0">
          <CardTitle className="text-base">Catalogue</CardTitle>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Input
              placeholder="Search by name or paste product id…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="sm:w-[220px]"
            />
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="sm:w-[200px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={activeFilter}
              onValueChange={(v) =>
                setActiveFilter(v as "all" | "true" | "false")
              }
            >
              <SelectTrigger className="sm:w-[160px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="true">Active only</SelectItem>
                <SelectItem value="false">Inactive only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="flex items-center justify-center py-12 text-muted-foreground gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading…
            </div>
          )}
          {error && (
            <p className="text-sm text-destructive py-6">
              {(error as Error).message}
            </p>
          )}
          {!isLoading && !error && (
            <div className="rounded-md border border-border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead className="hidden sm:table-cell">Category</TableHead>
                    <TableHead className="font-mono text-xs hidden lg:table-cell">
                      Id
                    </TableHead>
                    <TableHead className="hidden md:table-cell w-[90px]">
                      Status
                    </TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="w-[120px] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center text-muted-foreground py-10"
                      >
                        No products match your filters.
                      </TableCell>
                    </TableRow>
                  ) : (
                    products.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium">
                          <Link
                            to={`/products/${p.id}`}
                            className="hover:text-primary hover:underline"
                          >
                            {p.name}
                          </Link>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-muted-foreground text-sm">
                          {categoryName(categories, p.categoryId)}
                        </TableCell>
                        <TableCell
                          className="text-muted-foreground font-mono text-xs max-w-[120px] truncate hidden lg:table-cell"
                          title={p.id}
                        >
                          {shortId(p.id)}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {p.active ? (
                            <Badge variant="secondary" className="font-normal">
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="font-normal">
                              Off
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {p.currency} {p.basePrice}
                        </TableCell>
                        <TableCell className="text-right space-x-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                            <Link to={`/products/${p.id}`} title="Edit">
                              <Pencil className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => setDeleteId(p.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={Boolean(deleteId)} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete product?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This removes the product, all colors, and stock rows.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
