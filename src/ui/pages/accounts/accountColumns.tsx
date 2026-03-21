
import { Badge } from '@/ui/shared/Badge';
import { Button } from '@/ui/shared/Button';
import { type Column } from '@/ui/shared/DataTable';
import type { Account } from '@/domain/models/account';
import type { User } from '@/domain/models/user';
import { Trash2, BookOpen, UserCircle } from 'lucide-react';
import dayjs from 'dayjs';

export const getAccountStatus = (record: Account) => {
  if (!record.closedAt && !record.isDeleted) return { label: 'Активен', variant: 'green' as const };
  if (record.closedAt)
    return { label: `Закрыт ${dayjs(record.closedAt).format('DD.MM.YYYY')}`, variant: 'red' as const };
  return { label: 'Пользователь заблокирован', variant: 'red' as const };
};

export const getAccountColumns = (
  usersMap: Record<string, User>,
  onOpenDrawer: (account: Account) => void,
  onCloseAccount: (accountId: string) => void
): Column<Account>[] => [
  {
    key: 'id',
    title: 'ID счёта',
    render: (r) => <code className="text-xs text-gray-500">{r.id.substring(0, 8)}…</code>,
  },
  {
    key: 'balance',
    title: 'Баланс',
    render: (r) => <Badge variant="green">{r.balance} {r.currency || "RUB"}</Badge>,
  },
  {
    key: 'status',
    title: 'Статус',
    render: (r) => {
      const status = getAccountStatus(r);
      return <Badge variant={status.variant}>{status.label}</Badge>;
    },
  },
  {
    key: 'owner',
    title: 'Владелец',
    render: (r) => {
      const owner = usersMap[r.userId];
      if (!owner) return '—';
      return (
        <span className="flex items-center gap-1" title={owner.email}>
          <UserCircle className="h-4 w-4 text-gray-400" />
          {owner.credentials || owner.email}
        </span>
      );
    },
  },
  {
    key: 'actions',
    title: 'Действия',
    render: (r) => (
      <div className="flex gap-2">
        <Button
          variant="ghost"
          size="sm"
          icon={<BookOpen className="h-4 w-4" />}
          onClick={(e) => {
            e.stopPropagation();
            onOpenDrawer(r);
          }}
        >
          История
        </Button>
        {!r.closedAt && !r.isDeleted && (
          <Button
            variant="danger"
            size="sm"
            icon={<Trash2 className="h-4 w-4" />}
            onClick={(e) => {
              e.stopPropagation();
              onCloseAccount(r.id);
            }}
          >
            Закрыть
          </Button>
        )}
      </div>
    ),
  },
];