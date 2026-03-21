import React, { useEffect, useState, useCallback } from 'react';
import { useToast } from '@/ui/shared/Toast';
import { accountUseCases } from '@/domain/usecases/accountUseCases';
import { userUseCases } from '@/domain/usecases/userUseCases';
import type { Account, Transaction } from '@/domain/models/account';
import type { User } from '@/domain/models/user';
import { PageHeader } from '@/ui/shared/PageHeader';
import { DataTable, type Column } from '@/ui/shared/DataTable';
import { PageSpinner } from '@/ui/shared/Spinner';
import { Badge } from '@/ui/shared/Badge';
import { Button } from '@/ui/shared/Button';
import { Drawer } from '@/ui/shared/Drawer';
import { ConfirmDialog } from '@/ui/shared/ConfirmDialog';
import { DepositWithdrawModal } from './DepositWithdrawModal';
import { getTransactionColumns } from './transactionColumns';
import { Trash2, BookOpen, Plus, Minus, UserCircle } from 'lucide-react';
import dayjs from 'dayjs';
import { useTransactionsWebSocket } from '@/infrastructure/api/useTransactionsWebSocket';

export const AccountsPage: React.FC = () => {
  const toast = useToast();

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(false);
  const [usersMap, setUsersMap] = useState<Record<string, User>>({});

  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [txLoading, setTxLoading] = useState(false);

  const [confirmClose, setConfirmClose] = useState<string | null>(null);
  const [closeLoading, setCloseLoading] = useState(false);

  const handleWebSocketTransaction = useCallback((transaction: Transaction) => {
    console.log('Получена транзакция через WebSocket:', transaction, selectedAccount);
    if (!selectedAccount) return;
    if (transaction.sourceId === selectedAccount.id || 
      transaction.targetId === selectedAccount.id) {
      setTransactions((prev) => [transaction, ...prev]);
      toast.info(`Новая транзакция: ${transaction.resolutionMessage || 'Без описания'} (${transaction.amount} ₽)`);
    }
  }, [selectedAccount, toast]);

  useEffect(() => {
      toast.info(`Выбрана новая учётная запись: ${selectedAccount?.id.substring(0, 8) ?? 'нет'}…`);
    }, [selectedAccount]);

  useTransactionsWebSocket(() => {
    toast.info('WebSocket подключён');
  }, handleWebSocketTransaction, (error) => {
    toast.error('Ошибка WebSocket: ' + error);
  });
  
  const [modalState, setModalState] = useState<{
    open: boolean;
    type: 'deposit' | 'withdraw';
  }>({ open: false, type: 'deposit' });

  const fetchAccounts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await accountUseCases.getAllAccounts();
      setAccounts(data);
      const userIds = data.map((a) => a.userId);
      const map = await userUseCases.loadUsersMap(userIds);
      setUsersMap(map);
    } catch {
      toast.error('Не удалось загрузить счета');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const loadTransactions = async (accountId: string) => {
    setTxLoading(true);
    try {
      const data = await accountUseCases.getTransactions(accountId);
      setTransactions(data);
    } catch {
      toast.error('Не удалось загрузить транзакции');
      setTransactions([]);
    } finally {
      setTxLoading(false);
    }
  };

  const handleOpenDrawer = (account: Account) => {
    setSelectedAccount(account);
    setDrawerOpen(true);
    loadTransactions(account.id);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setSelectedAccount(null);
    setTransactions([]);
  };

  const handleDeleteAccount = async () => {
    if (!confirmClose) return;
    setCloseLoading(true);
    try {
      await accountUseCases.closeAccount(confirmClose);
      toast.success('Счёт закрыт');
      setConfirmClose(null);
      fetchAccounts();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Ошибка при закрытии счёта');
    } finally {
      setCloseLoading(false);
    }
  };

  const invalidate = () => {
    fetchAccounts();
    if (selectedAccount?.id) loadTransactions(selectedAccount.id);
  };

  const getAccountStatus = (record: Account) => {
    if (!record.closedAt && !record.isDeleted) return { label: 'Активен', variant: 'green' as const };
    if (record.closedAt)
      return { label: `Закрыт ${dayjs(record.closedAt).format('DD.MM.YYYY')}`, variant: 'red' as const };
    return { label: 'Пользователь заблокирован', variant: 'red' as const };
  };

  const columns: Column<Account>[] = [
    {
      key: 'id',
      title: 'ID счёта',
      render: (r) => <code className="text-xs text-gray-500">{r.id.substring(0, 8)}…</code>,
    },
    {
      key: 'balance',
      title: 'Баланс',
      render: (r) => <Badge variant="green">{r.balance} ₽</Badge>,
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
              handleOpenDrawer(r);
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
                setConfirmClose(r.id);
              }}
            >
              Закрыть
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Счета клиентов" subtitle="Управление счетами и транзакциями" />

      {loading ? (
        <PageSpinner />
      ) : (
        <DataTable data={accounts} columns={columns} rowKey="id" />
      )}

      {/* Transaction Drawer */}
      <Drawer
        open={drawerOpen}
        onClose={handleCloseDrawer}
        title={`Транзакции счёта ${selectedAccount?.id.substring(0, 8) ?? ''}…`}
        extra={
          selectedAccount && !selectedAccount.closedAt && !selectedAccount.isDeleted ? (
            <div className="flex gap-2">
              <Button
                variant="primary"
                size="sm"
                icon={<Plus className="h-4 w-4" />}
                onClick={() => setModalState({ open: true, type: 'deposit' })}
              >
                Пополнить
              </Button>
              <Button
                variant="secondary"
                size="sm"
                icon={<Minus className="h-4 w-4" />}
                onClick={() => setModalState({ open: true, type: 'withdraw' })}
              >
                Снять
              </Button>
            </div>
          ) : undefined
        }
      >
        {txLoading ? (
          <PageSpinner />
        ) : (
          <DataTable
            data={transactions}
            columns={getTransactionColumns(selectedAccount?.id ?? '')}
            rowKey="id"
            pageSize={20}
            emptyText="Нет транзакций"
          />
        )}
      </Drawer>

      {/* Confirm Close */}
      <ConfirmDialog
        open={!!confirmClose}
        onClose={() => setConfirmClose(null)}
        onConfirm={handleDeleteAccount}
        title="Закрытие счёта"
        message="Вы уверены, что хотите закрыть этот счёт? Это действие необратимо."
        confirmText="Закрыть счёт"
        loading={closeLoading}
      />

      {/* Deposit / Withdraw Modal */}
      <DepositWithdrawModal
        open={modalState.open}
        type={modalState.type}
        accountId={selectedAccount?.id ?? null}
        onClose={() => setModalState({ open: false, type: 'deposit' })}
        onSuccess={invalidate}
      />
    </div>
  );
};
