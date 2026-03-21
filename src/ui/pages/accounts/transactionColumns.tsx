import dayjs from 'dayjs';
import { Badge } from '@/ui/shared/Badge';
import type { Column } from '@/ui/shared/DataTable';
import type { Transaction, TransactionDisplayType, TransactionStatus } from '@/domain/models/account';

const typeMap: Record<TransactionDisplayType, string> = {
  Unclassified: 'Неклассифицировано',
  Deposit: 'Пополнение ч/з банкомат',
  Withdrawal: 'Снятие ч/з банкомат',
  Transfer: 'Перевод',
  CreditPayment: 'Выплата кредита',
  CreditIncoming: 'Взятие кредита',
};

const statusColors: Record<TransactionStatus, 'yellow' | 'green' | 'red'> = {
  Pending: 'yellow',
  Completed: 'green',
  Failed: 'red',
};

export const getTransactionColumns = (selectedAccountId: string): Column<Transaction>[] => [
  {
    key: 'createdAt',
    title: 'Дата',
    render: (r) => dayjs(r.createdAt).format('DD.MM.YYYY HH:mm'),
  },
  {
    key: 'type',
    title: 'Тип',
    render: (r) => typeMap[r.displayType] || typeMap.Unclassified,
  },
  {
    key: 'amount',
    title: 'Сумма',
    render: (r) => {
      const isIncoming = r.targetId === selectedAccountId;
      return (
        <Badge variant={isIncoming ? 'green' : 'red'}>
          {isIncoming ? '+' : '-'} {r.amount}
        </Badge>
      );
    },
  },
  {
    key: 'Сообщение',
    title: 'Описание',
    render: (r) => r.description || '—',
  },
  {
    key: 'resolutionMessage',
    title: 'Описание',
    render: (r) => r.resolutionMessage || '—',
  },
  {
    key: 'status',
    title: 'Статус',
    render: (r) => <Badge variant={statusColors[r.status]}>{r.status}</Badge>,
  },
];
