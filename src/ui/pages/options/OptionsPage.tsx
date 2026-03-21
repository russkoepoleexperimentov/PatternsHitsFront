import React, { useEffect, useState } from 'react';

import { PageHeader } from '@/ui/shared/PageHeader';
import { Button } from '@/ui/shared/Button';
import { FormField } from '@/ui/shared/FormField';
import { Spinner } from '@/ui/shared/Spinner';
import { useToast } from '@/ui/shared/Toast';
import { optionsUseCases } from '@/domain/usecases/optionsUseCases';
import type { OptionsDto } from '@/domain/models/options';

export const OptionsPage: React.FC = () => {
  const toast = useToast();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [options, setOptions] = useState<OptionsDto>({
    webTheme: null,
    mobileTheme: null,
    hiddenAccounts: null,
  });

  useEffect(() => {
    const fetchOptions = async () => {
      setIsLoading(true);
      try {
        const data = await optionsUseCases.getOptions();
        setOptions(data);
      } catch (error) {
        console.error('Ошибка при загрузке настроек', error);
        toast.error('Ошибка при загрузке настроек');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOptions();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updatedOptions = await optionsUseCases.updateOptions(options);
      setOptions(updatedOptions);
      toast.success('Настройки сохранены');
    } catch (error) {
      console.error('Ошибка при сохранении настроек', error);
      toast.error('Ошибка при сохранении настроек');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Настройки" subtitle="Персональные настройки приложения" />

      <div className="space-y-6">
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Темы</h3>

          <div className="space-y-4">
            <FormField label="Веб-тема">
              <select
                value={options.webTheme || ''}
                onChange={(e) => setOptions({ ...options, webTheme: e.target.value || null })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="">По умолчанию</option>
                <option value="light">Светлая</option>
                <option value="dark">Темная</option>
              </select>
            </FormField>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Скрытые счета</h3>
          <p className="text-sm text-gray-600 mb-4">
            Список ID счетов, которые будут скрыты из интерфейса
          </p>
          <div className="text-sm text-gray-500">
            {options.hiddenAccounts && options.hiddenAccounts.length > 0
              ? options.hiddenAccounts.join(', ')
              : 'Нет скрытых счетов'}
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Сохранение...' : 'Сохранить настройки'}
          </Button>
        </div>
      </div>
    </div>
  );
};