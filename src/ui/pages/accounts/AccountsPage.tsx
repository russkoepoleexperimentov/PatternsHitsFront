import React, { useEffect, useState, useCallback } from 'react';
import { useToast } from '@/ui/shared/Toast';
import { ErrorBoundary } from '@/ui/shared/ErrorBoundary';
import { ErrorPage } from '@/ui/pages/error/ErrorPage';
import { accountUseCases } from '@/domain/usecases/accountUseCases';
import { userUseCases } from '@/domain/usecases/userUseCases';
import { optionsUseCases } from '@/domain/usecases/optionsUseCases';
import type { Account, Transaction } from '@/domain/models/account';
import type { User } from '@/domain/models/user';
import type { OptionsDto } from '@/domain/models/options';
import { PageHeader } from '@/ui/shared/PageHeader';
import { DataTable, type Column } from '@/ui/shared/DataTable';
import { PageSpinner } from '@/ui/shared/Spinner';
import { Button } from '@/ui/shared/Button';
import { Drawer } from '@/ui/shared/Drawer';
import { ConfirmDialog } from '@/ui/shared/ConfirmDialog';
import { DepositWithdrawModal } from './DepositWithdrawModal';
import { getTransactionColumns } from './transactionColumns';
import { getAccountColumns } from './accountColumns';
import { Plus, Minus } from 'lucide-react';
import { useTransactionsWebSocket } from '@/infrastructure/api/useTransactionsWebSocket';

export const AccountsPage: React.FC = () => {
  const toast = useToast();

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(false);
  const [usersMap, setUsersMap] = useState<Record<string, User>>({});
  const [masterAccount, setMasterAccount] = useState<Account | null>(null);
  const [options, setOptions] = useState<OptionsDto>({ webTheme: null, mobileTheme: null, hiddenAccounts: null });
  const [showHidden, setShowHidden] = useState(false);

  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [txLoading, setTxLoading] = useState(false);

  const [confirmClose, setConfirmClose] = useState<string | null>(null);
  const [closeLoading, setCloseLoading] = useState(false);

  const handleWebSocketTransaction = useCallback((transaction: Transaction) => {
    if (!selectedAccount) return;
    if (transaction.sourceId === selectedAccount.id || 
      transaction.targetId === selectedAccount.id) {
      setTransactions((prev) => [transaction, ...prev]);
    }
  }, [selectedAccount, toast]);

  const { get: getTransactions } = useTransactionsWebSocket(() => {
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
      const [data, master, opts] = await Promise.all([
        accountUseCases.getAllAccounts(),
        accountUseCases.getMasterAccount(),
        optionsUseCases.getOptions(),
      ]);
      setAccounts(data);
      setMasterAccount(master);
      setOptions(opts);

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
      //const data = await accountUseCases.getTransactions(accountId);
      //setTransactions(data);
      setTransactions([]); // Очистка перед загрузкой новых данных
      getTransactions(accountId, null, null); // Запрос на получение транзакций через WebSocket 
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

  const handleToggleHidden = async (accountId: string) => {
    try {
      const isHidden = options.hiddenAccounts?.includes(accountId);
      if (isHidden) {
        await optionsUseCases.removeHiddenAccount(accountId);
        toast.success('Счёт показан');
      } else {
        await optionsUseCases.addHiddenAccount(accountId);
        toast.success('Счёт скрыт');
      }
      // Перезагрузить options
      const updatedOptions = await optionsUseCases.getOptions();
      setOptions(updatedOptions);
    } catch (error) {
      toast.error('Ошибка при изменении видимости счёта');
    }
  };

  const invalidate = () => {
    fetchAccounts();
    if (selectedAccount?.id) loadTransactions(selectedAccount.id);
  };

  const filteredAccounts = accounts.filter(account => 
    showHidden || !options.hiddenAccounts?.includes(account.id)
  );

  const columns: Column<Account>[] = getAccountColumns(
    usersMap,
    handleOpenDrawer,
    (id) => setConfirmClose(id),
    handleToggleHidden,
    options.hiddenAccounts || []
  );

  return (
    <ErrorBoundary fallback={<ErrorPage title="Ошибка страницы Счета" message="Произошла неожиданная ошибка при загрузке страницы счетов." />}>
      <div>
        <PageHeader title="Счета клиентов" subtitle="Управление счетами и транзакциями" />

        <div className="mt-4 mb-4 flex items-center gap-2">
          <input
            type="checkbox"
            id="showHidden"
            checked={showHidden}
            onChange={(e) => setShowHidden(e.target.checked)}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <label htmlFor="showHidden" className="text-sm text-gray-700">
            Показать скрытые счета ({options.hiddenAccounts?.length || 0})
          </label>
        </div>

      <div className="mt-4 mb-6 rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-700">Мастер-счёт</h2>
        {masterAccount ? (
          <div className="mt-2 text-sm text-gray-800">
            <div>Баланс: <strong>{masterAccount.balance.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong> {masterAccount.currency || 'RUB'}</div>
            <div className="text-xs text-gray-500">ID: {masterAccount.id.substring(0, 8)}…</div>
          </div>
        ) : (
          <div className="mt-2 text-sm text-gray-500">Загрузка данных мастер-счёта...</div>
        )}
      </div>

      {loading ? (
        <PageSpinner />
      ) : (
        <DataTable data={filteredAccounts} columns={columns} rowKey="id" />
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
    </ErrorBoundary>
  );
};
