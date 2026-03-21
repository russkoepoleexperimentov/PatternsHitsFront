import React, { useEffect, useState, useCallback } from 'react';
import { useToast } from '@/ui/shared/Toast';
import { tariffUseCases } from '@/domain/usecases/tariffUseCases';
import type { Tariff, CreateTariffRequest } from '@/domain/models/tariff';
import { PageHeader } from '@/ui/shared/PageHeader';
import { DataTable, type Column } from '@/ui/shared/DataTable';
import { PageSpinner } from '@/ui/shared/Spinner';
import { Button } from '@/ui/shared/Button';
import { Modal } from '@/ui/shared/Modal';
import { ConfirmDialog } from '@/ui/shared/ConfirmDialog';
import { FormField, Input } from '@/ui/shared/FormField';
import { Plus, Edit, Trash2 } from 'lucide-react';

interface TariffFormData {
  name: string;
  interestRate: string;
  maxAmount: string;
  maxTermDays: string;
}

const emptyForm: TariffFormData = {
  name: '',
  interestRate: '',
  maxAmount: '',
  maxTermDays: '',
};

export const TariffsPage: React.FC = () => {
  const toast = useToast();

  const [tariffs, setTariffs] = useState<Tariff[]>([]);
  const [loading, setLoading] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingTariff, setEditingTariff] = useState<Tariff | null>(null);
  const [form, setForm] = useState<TariffFormData>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof TariffFormData, string>>>({});
  const [submitting, setSubmitting] = useState(false);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchTariffs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await tariffUseCases.getAllTariffs();
      setTariffs(data);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Ошибка загрузки тарифов');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchTariffs();
  }, []);

  const handleCreate = () => {
    setEditingTariff(null);
    setForm(emptyForm);
    setErrors({});
    setModalOpen(true);
  };

  const handleEdit = (tariff: Tariff) => {
    setEditingTariff(tariff);
    setForm({
      name: tariff.name,
      interestRate: String(tariff.interestRate),
      maxAmount: String(tariff.maxAmount),
      maxTermDays: String(tariff.maxTermDays),
    });
    setErrors({});
    setModalOpen(true);
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof TariffFormData, string>> = {};
    if (!form.name.trim()) newErrors.name = 'Введите название';
    const rate = parseFloat(form.interestRate);
    if (isNaN(rate) || rate <= 0 || rate > 100) newErrors.interestRate = 'Ставка от 0.01 до 100';
    const amount = parseFloat(form.maxAmount);
    if (isNaN(amount) || amount <= 0) newErrors.maxAmount = 'Сумма должна быть больше 0';
    const days = parseInt(form.maxTermDays, 10);
    if (isNaN(days) || days < 1) newErrors.maxTermDays = 'Минимум 1 день';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const data: CreateTariffRequest = {
        name: form.name.trim(),
        interestRate: parseFloat(form.interestRate),
        maxAmount: parseFloat(form.maxAmount),
        maxTermDays: parseInt(form.maxTermDays, 10),
      };
      if (editingTariff) {
        await tariffUseCases.updateTariff(editingTariff.id, data);
        toast.success('Тариф обновлён');
      } else {
        await tariffUseCases.createTariff(data);
        toast.success('Тариф создан');
      }
      setModalOpen(false);
      fetchTariffs();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Ошибка сохранения');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    try {
      await tariffUseCases.deleteTariff(deleteId);
      toast.success('Тариф удалён');
      setDeleteId(null);
      fetchTariffs();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Ошибка удаления');
    } finally {
      setDeleteLoading(false);
    }
  };

  const columns: Column<Tariff>[] = [
    { key: 'name', title: 'Название', render: (r) => r.name },
    { key: 'interestRate', title: 'Ставка %', render: (r) => `${r.interestRate} %` },
    {
      key: 'maxAmount',
      title: 'Макс. сумма',
      render: (r) => `${r.maxAmount.toLocaleString()} ₽`,
    },
    { key: 'maxTermDays', title: 'Срок (дней)', render: (r) => `${r.maxTermDays} дн.` },
    {
      key: 'actions',
      title: 'Действия',
      render: (r) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            icon={<Edit className="h-4 w-4" />}
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(r);
            }}
          >
            Редактировать
          </Button>
          <Button
            variant="danger"
            size="sm"
            icon={<Trash2 className="h-4 w-4" />}
            onClick={(e) => {
              e.stopPropagation();
              setDeleteId(r.id);
            }}
          >
            Удалить
          </Button>
        </div>
      ),
    },
  ];

  const updateField = (field: keyof TariffFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div>
      <PageHeader
        title="Управление тарифами"
        subtitle="Создание и редактирование тарифов по кредитам"
        actions={
          <Button variant="primary" icon={<Plus className="h-4 w-4" />} onClick={handleCreate}>
            Создать тариф
          </Button>
        }
      />

      {loading ? (
        <PageSpinner />
      ) : (
        <DataTable data={tariffs} columns={columns} rowKey="id" />
      )}

      {/* Create/Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingTariff ? 'Редактировать тариф' : 'Создать тариф'}
      >
        <form onSubmit={handleSave}>
          <FormField label="Название" required error={errors.name}>
            <Input
              value={form.name}
              onChange={(e) => updateField('name', e.target.value)}
              placeholder="Название тарифа"
              hasError={!!errors.name}
            />
          </FormField>
          <FormField label="Процентная ставка (%)" required error={errors.interestRate}>
            <Input
              type="number"
              step="0.1"
              value={form.interestRate}
              onChange={(e) => updateField('interestRate', e.target.value)}
              placeholder="Ставка"
              hasError={!!errors.interestRate}
            />
          </FormField>
          <FormField label="Максимальная сумма" required error={errors.maxAmount}>
            <Input
              type="number"
              step="1000"
              value={form.maxAmount}
              onChange={(e) => updateField('maxAmount', e.target.value)}
              placeholder="Макс. сумма"
              hasError={!!errors.maxAmount}
            />
          </FormField>
          <FormField label="Максимальный срок (дней)" required error={errors.maxTermDays}>
            <Input
              type="number"
              step="1"
              value={form.maxTermDays}
              onChange={(e) => updateField('maxTermDays', e.target.value)}
              placeholder="Срок в днях"
              hasError={!!errors.maxTermDays}
            />
          </FormField>
          <div className="flex justify-end gap-3 mt-2">
            <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>
              Отмена
            </Button>
            <Button variant="primary" type="submit" loading={submitting}>
              {editingTariff ? 'Сохранить' : 'Создать'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirm Delete */}
      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Удаление тарифа"
        message="Вы уверены, что хотите удалить этот тариф?"
        confirmText="Удалить"
        loading={deleteLoading}
      />
    </div>
  );
};
