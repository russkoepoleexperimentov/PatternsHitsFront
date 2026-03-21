import React, { useState, useEffect } from 'react';
import { Modal } from '@/ui/shared/Modal';
import { Button } from '@/ui/shared/Button';
import { FormField, Input, TextArea } from '@/ui/shared/FormField';
import { useToast } from '@/ui/shared/Toast';
import { accountUseCases } from '@/domain/usecases/accountUseCases';

interface DepositWithdrawModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  type: 'deposit' | 'withdraw';
  accountId: string | null;
}

export const DepositWithdrawModal: React.FC<DepositWithdrawModalProps> = ({
  open,
  onClose,
  onSuccess,
  type,
  accountId,
}) => {
  const toast = useToast();
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ amount?: string }>({});

  useEffect(() => {
    if (open) {
      setAmount('');
      setDescription('');
      setErrors({});
    }
  }, [open]);

  const validate = (): boolean => {
    const newErrors: { amount?: string } = {};
    const num = parseFloat(amount);
    if (!amount || isNaN(num) || num <= 0) {
      newErrors.amount = 'Введите корректную сумму больше 0';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !accountId) return;

    setLoading(true);
    try {
      const request = { amount: parseFloat(amount), description };
      if (type === 'deposit') {
        await accountUseCases.deposit(accountId, request);
      } else {
        await accountUseCases.withdraw(accountId, request);
      }
      toast.success(type === 'deposit' ? 'Счёт пополнен' : 'Средства сняты');
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Ошибка операции',
      );
    } finally {
      setLoading(false);
    }
  };

  const title = type === 'deposit' ? 'Пополнение счёта' : 'Снятие со счёта';
  const okText = type === 'deposit' ? 'Пополнить' : 'Снять';

  return (
    <Modal open={open} onClose={onClose} title={title}>
      <form onSubmit={handleSubmit}>
        <FormField label="Сумма" required error={errors.amount}>
          <Input
            type="number"
            step="0.01"
            min="0.01"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            hasError={!!errors.amount}
          />
        </FormField>

        <FormField label="Описание (необязательно)">
          <TextArea
            rows={3}
            placeholder="Введите описание транзакции"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </FormField>

        <div className="flex justify-end gap-3 mt-2">
          <Button variant="secondary" type="button" onClick={onClose}>
            Отмена
          </Button>
          <Button variant="primary" type="submit" loading={loading}>
            {okText}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
