import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { format } from 'date-fns';
import { Loader2, Mail, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import {
  fetchContactInquiries,
  updateContactInquiryStatus,
  type ContactInquiryDto,
  type ContactInquiryStatus,
} from '@/lib/api/contact';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const STATUS_LABELS: Record<ContactInquiryStatus, string> = {
  new: 'New',
  read: 'Read',
  archived: 'Archived',
};

function statusVariant(status: ContactInquiryStatus) {
  if (status === 'new') return 'default' as const;
  if (status === 'read') return 'secondary' as const;
  return 'outline' as const;
}

export default function ContactInquiriesPage() {
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<ContactInquiryStatus | 'all'>(
    'all',
  );
  const [selected, setSelected] = useState<ContactInquiryDto | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['contactInquiries', statusFilter],
    queryFn: () =>
      fetchContactInquiries({
        status: statusFilter === 'all' ? undefined : statusFilter,
        limit: 50,
      }),
  });

  const patchMutation = useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string;
      status: ContactInquiryStatus;
    }) => updateContactInquiryStatus(id, status),
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: ['contactInquiries'] });
      setSelected(updated);
      toast.success(`Marked as ${STATUS_LABELS[updated.status]}`);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const inquiries = data?.inquiries ?? [];

  const openInquiry = (row: ContactInquiryDto) => {
    setSelected(row);
    if (row.status === 'new') {
      patchMutation.mutate({ id: row.id, status: 'read' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-body text-sm text-muted-foreground">
            Inquiries submitted from the storefront contact form.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Status</span>
          <Select
            value={statusFilter}
            onValueChange={(v) =>
              setStatusFilter(v as ContactInquiryStatus | 'all')
            }
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="read">Read</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Messages
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
            <p className="text-sm text-destructive py-8 text-center">
              {(error as Error).message}
            </p>
          )}
          {!isLoading && !error && inquiries.length === 0 && (
            <p className="text-sm text-muted-foreground py-8 text-center">
              No contact messages yet.
            </p>
          )}
          {!isLoading && !error && inquiries.length > 0 && (
            <div className="rounded-md border border-border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>When</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inquiries.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="text-sm whitespace-nowrap">
                        {row.createdAt
                          ? format(new Date(row.createdAt), 'MMM d, yyyy HH:mm')
                          : '—'}
                      </TableCell>
                      <TableCell className="font-medium">{row.name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {row.email}
                      </TableCell>
                      <TableCell className="text-sm">
                        {row.subject || '—'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusVariant(row.status)}>
                          {STATUS_LABELS[row.status]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openInquiry(row)}
                        >
                          View
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

      <Dialog open={Boolean(selected)} onOpenChange={() => setSelected(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              {selected?.subject || 'Contact message'}
            </DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-muted-foreground">From</p>
                  <p className="font-medium">{selected.name}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <a
                    href={`mailto:${selected.email}`}
                    className="font-medium text-primary hover:underline break-all"
                  >
                    {selected.email}
                  </a>
                </div>
                {selected.phone ? (
                  <div>
                    <p className="text-xs text-muted-foreground">Phone</p>
                    <a
                      href={`tel:+977${selected.phone}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {selected.phone}
                    </a>
                  </div>
                ) : null}
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Message</p>
                <p className="whitespace-pre-wrap leading-relaxed text-foreground">
                  {selected.message}
                </p>
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                {(['read', 'archived'] as ContactInquiryStatus[]).map(
                  (status) => (
                    <Button
                      key={status}
                      size="sm"
                      variant={
                        selected.status === status ? 'default' : 'outline'
                      }
                      disabled={
                        patchMutation.isPending || selected.status === status
                      }
                      onClick={() =>
                        patchMutation.mutate({ id: selected.id, status })
                      }
                    >
                      Mark {STATUS_LABELS[status]}
                    </Button>
                  ),
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
