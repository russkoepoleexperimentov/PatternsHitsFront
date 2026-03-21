import React, { useEffect, useState, useCallback } from 'react';
import { useToast } from '@/ui/shared/Toast';
import { creditUseCases } from '@/domain/usecases/creditUseCases';
import { userUseCases } from '@/domain/usecases/userUseCases';
import type { Credit, ApproveCreditRequest, RejectCreditRequest, CreditRating, Payment } from '@/domain/models/credit';
import type { User } from '@/domain/models/user';
import { PageHeader } from '@/ui/shared/PageHeader';
import { DataTable, type Column } from '@/ui/shared/DataTable';
import { PageSpinner } from '@/ui/shared/Spinner';
import { Badge } from '@/ui/shared/Badge';
import { Button } from '@/ui/shared/Button';
import { Drawer } from '@/ui/shared/Drawer';
import { Modal } from '@/ui/shared/Modal';
import { DetailRow } from '@/ui/shared/DetailRow';
import { FormField, Input, TextArea } from '@/ui/shared/FormField';
import { Eye, Check, X, UserCircle } from 'lucide-react';
import dayjs from 'dayjs';
import type { CreditStatus } from '@/domain/models/credit';

const statusBadge: Record<CreditStatus, { variant: 'orange' | 'green' | 'red' | 'gray'; label: string }> = {
  Pending: { variant: 'orange', label: 'Ожидает' },
  Approved: { variant: 'green', label: 'Одобрен' },
  Rejected: { variant: 'red', label: 'Отклонён' },
  Closed: { variant: 'gray', label: 'Закрыт' },
};

const paymentStatusBadge: Record<Payment['status'], { variant: 'orange' | 'green' | 'red' | 'gray'; label: string }> = {
  Pending: { variant: 'orange', label: 'В ожидании' },
  Processed: { variant: 'green', label: 'Выполнено' },
  Failed: { variant: 'red', label: 'Ошибка' },
  Overdue: { variant: 'red', label: 'Просрочено' },
};

export const CreditsPage: React.FC = () => {
  const toast = useToast();

  const [credits, setCredits] = useState<Credit[]>([]);
  const [loading, setLoading] = useState(false);
  const [usersMap, setUsersMap] = useState<Record<string, User>>({});

  const [selectedCredit, setSelectedCredit] = useState<Credit | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [rating, setRating] = useState<CreditRating | null>(null);
  const [loadingRating, setLoadingRating] = useState(false);

  const [overduePayments, setOverduePayments] = useState<Payment[]>([]);
  const [loadingOverdue, setLoadingOverdue] = useState(false);

  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [approvedAmount, setApprovedAmount] = useState('');
  const [approveComment, setApproveComment] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [rejectError, setRejectError] = useState('');

  const fetchCredits = useCallback(async () => {
    setLoading(true);
    try {
      const data = await creditUseCases.getAllCredits();
      setCredits(data);
      const userIds = data.map((c) => c.userId);
      const map = await userUseCases.loadUsersMap(userIds);
      setUsersMap(map);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Не удалось загрузить кредиты');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchCredits();
  }, []);

  const handleView = (credit: Credit) => {
    setSelectedCredit(credit);
    setDrawerOpen(true);

    setRating(null);
    setOverduePayments([]);

    setLoadingRating(true);
    creditUseCases.getUserRating(credit.userId)
      .then(setRating)
      .catch(() => {
        setRating(null);
        toast.error('Не удалось загрузить кредитный рейтинг пользователя');
      })
      .finally(() => setLoadingRating(false));

    setLoadingOverdue(true);
    creditUseCases.getOverduePayments(credit.id)
      .then(setOverduePayments)
      .catch(() => {
        setOverduePayments([]);
        toast.error('Не удалось загрузить просроченные платежи');
      })
      .finally(() => setLoadingOverdue(false));
  };

  const handleApprove = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCredit) return;
    setActionLoading(true);
    try {
      const data: ApproveCreditRequest = {};
      if (approvedAmount) data.approvedAmount = parseFloat(approvedAmount);
      if (approveComment) data.comment = approveComment;
      await creditUseCases.approveCredit(selectedCredit.id, data);
      toast.success('Кредит одобрен');
      setApproveModalOpen(false);
      setApprovedAmount('');
      setApproveComment('');
      const updated = await creditUseCases.getCreditDetails(selectedCredit.id);
      setSelectedCredit(updated);
      fetchCredits();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Ошибка одобрения');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCredit) return;
    if (!rejectReason.trim()) {
      setRejectError('Введите причину');
      return;
    }
    setActionLoading(true);
    try {
      const data: RejectCreditRequest = { reason: rejectReason.trim() };
      await creditUseCases.rejectCredit(selectedCredit.id, data);
      toast.success('Кредит отклонён');
      setRejectModalOpen(false);
      setRejectReason('');
      const updated = await creditUseCases.getCreditDetails(selectedCredit.id);
      setSelectedCredit(updated);
      fetchCredits();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Ошибка отклонения');
    } finally {
      setActionLoading(false);
    }
  };

  const columns: Column<Credit>[] = [
    {
      key: 'id',
      title: 'ID',
      render: (r) => <code className="text-xs text-gray-500">{r.id.substring(0, 8)}…</code>,
    },
    {
      key: 'user',
      title: 'Клиент',
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
    { key: 'amount', title: 'Сумма', render: (r) => `${r.amount.toLocaleString()} ${r.currency || 'RUB'}` },
    {
      key: 'remainingDebt',
      title: 'Остаток долга',
      render: (r) => `${r.remainingDebt.toLocaleString()} ${r.currency || 'RUB'}`,
    },
    { key: 'termDays', title: 'Срок', render: (r) => `${r.termDays} дн.` },
    {
      key: 'status',
      title: 'Статус',
      render: (r) => {
        const s = statusBadge[r.status];
        return <Badge variant={s.variant}>{s.label}</Badge>;
      },
    },
    {
      key: 'createdAt',
      title: 'Создан',
      render: (r) => dayjs(r.createdAt).format('DD.MM.YYYY HH:mm'),
    },
    {
      key: 'actions',
      title: '',
      render: (r) => (
        <Button
          variant="ghost"
          size="sm"
          icon={<Eye className="h-4 w-4" />}
          onClick={(e) => {
            e.stopPropagation();
            handleView(r);
          }}
        >
          Просмотр
        </Button>
      ),
    },
  ];

  const overdueColumns: Column<Payment>[] = [
    {
      key: 'id',
      title: 'ID',
      render: (p) => <code className="text-xs text-gray-500">{p.id.substring(0, 8)}…</code>,
    },
    {
      key: 'amount',
      title: 'Сумма',
      render: (p) => `${p.amount.toLocaleString()} ${p.currency}`,
    },
    {
      key: 'dueDate',
      title: 'Дата срока',
      render: (p) => (p.dueDate ? dayjs(p.dueDate).format('DD.MM.YYYY') : '—'),
    },
    {
      key: 'status',
      title: 'Статус',
      render: (p) => {
        const s = paymentStatusBadge[p.status];
        return <Badge variant={s.variant}>{s.label}</Badge>;
      },
    },
    {
      key: 'createdAt',
      title: 'Создан',
      render: (p) => dayjs(p.createdAt).format('DD.MM.YYYY HH:mm'),
    },
  ];

  return (
    <div>
      <PageHeader title="Управление кредитами" subtitle="Просмотр, одобрение и отклонение заявок" />

      {loading ? (
        <PageSpinner />
      ) : (
        <DataTable data={credits} columns={columns} rowKey="id" onRowClick={handleView} />
      )}

      {/* Credit Details Drawer */}
      <Drawer
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setSelectedCredit(null);
          setRating(null);
          setOverduePayments([]);
        }}
        title={`Кредит ${selectedCredit?.id.substring(0, 8) ?? ''}…`}
        width="w-[550px]"
      >
        {selectedCredit && (
          <div>
            <DetailRow label="ID">{selectedCredit.id}</DetailRow>
            <DetailRow label="Клиент">
              {usersMap[selectedCredit.userId]?.email || selectedCredit.userId}
            </DetailRow>

            <DetailRow label="Кредитный рейтинг">
              {loadingRating ? (
                <span className="text-gray-400">Загрузка...</span>
              ) : rating ? (
                <span className="font-bold">{rating.rating} ед.</span>
              ) : (
                <span className="text-gray-400">Нет данных</span>
              )}
            </DetailRow>

            <div className="mt-4 border-t border-gray-200 pt-3">
              <h3 className="text-sm font-semibold text-gray-700">Просроченные платежи</h3>
              {loadingOverdue ? (
                <p className="text-gray-500">Загрузка...</p>
              ) : overduePayments.length > 0 ? (
                <DataTable
                  data={overduePayments}
                  columns={overdueColumns}
                  rowKey="id"
                  pageSize={5}
                  emptyText="Нет просроченных платежей"
                />
              ) : (
                <p className="text-gray-500">Просроченных платежей нет</p>
              )}
            </div>

            <DetailRow label="Сумма">{selectedCredit.amount}  {selectedCredit.currency || 'RUB'}</DetailRow>
            <DetailRow label="Остаток долга">{selectedCredit.remainingDebt} {selectedCredit.currency || 'RUB'}</DetailRow>
            <DetailRow label="Срок">{selectedCredit.termDays} дн.</DetailRow>
            <DetailRow label="Статус">
              <Badge variant={statusBadge[selectedCredit.status].variant}>
                {statusBadge[selectedCredit.status].label}
              </Badge>
            </DetailRow>
            <DetailRow label="Создан">
              {dayjs(selectedCredit.createdAt).format('DD.MM.YYYY HH:mm')}
            </DetailRow>
            {selectedCredit.approvedAmount != null && (
              <DetailRow label="Одобренная сумма">{selectedCredit.approvedAmount} {selectedCredit.currency || 'RUB'}</DetailRow>
            )}
            {selectedCredit.approvedBy && (
              <DetailRow label="Кем одобрен">{selectedCredit.approvedBy}</DetailRow>
            )}
            {selectedCredit.rejectionReason && (
              <DetailRow label="Причина отказа">{selectedCredit.rejectionReason}</DetailRow>
            )}

            {selectedCredit.status === 'Pending' && (
              <>
                <hr className="my-4" />
                <div className="flex gap-3">
                  <Button
                    variant="primary"
                    icon={<Check className="h-4 w-4" />}
                    onClick={() => setApproveModalOpen(true)}
                  >
                    Одобрить
                  </Button>
                  <Button
                    variant="danger"
                    icon={<X className="h-4 w-4" />}
                    onClick={() => setRejectModalOpen(true)}
                  >
                    Отказать
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </Drawer>

      {/* Approve Modal */}
      <Modal
        open={approveModalOpen}
        onClose={() => setApproveModalOpen(false)}
        title="Одобрение кредита"
      >
        <form onSubmit={handleApprove}>
          <FormField label="Одобренная сумма (необязательно)">
            <Input
              type="number"
              step="0.01"
              min="0.01"
              placeholder="Оставьте пустым для суммы заявки"
              value={approvedAmount}
              onChange={(e) => setApprovedAmount(e.target.value)}
            />
          </FormField>
          <FormField label="Комментарий">
            <TextArea
              rows={3}
              placeholder="Комментарий (необязательно)"
              value={approveComment}
              onChange={(e) => setApproveComment(e.target.value)}
            />
          </FormField>
          <div className="flex justify-end gap-3 mt-2">
            <Button variant="secondary" type="button" onClick={() => setApproveModalOpen(false)}>
              Отмена
            </Button>
            <Button variant="primary" type="submit" loading={actionLoading}>
              Одобрить
            </Button>
          </div>
        </form>
      </Modal>

      {/* Reject Modal */}
      <Modal
        open={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        title="Отказ в кредите"
      >
        <form onSubmit={handleReject}>
          <FormField label="Причина отказа" required error={rejectError}>
            <TextArea
              rows={3}
              placeholder="Укажите причину"
              value={rejectReason}
              onChange={(e) => {
                setRejectReason(e.target.value);
                setRejectError('');
              }}
              hasError={!!rejectError}
            />
          </FormField>
          <div className="flex justify-end gap-3 mt-2">
            <Button variant="secondary" type="button" onClick={() => setRejectModalOpen(false)}>
              Отмена
            </Button>
            <Button variant="danger" type="submit" loading={actionLoading}>
              Отказать
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
