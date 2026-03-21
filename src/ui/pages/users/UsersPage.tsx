import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from '@/ui/context/AuthContext';
import { useToast } from '@/ui/shared/Toast';
import { userUseCases } from '@/domain/usecases/userUseCases';
import type { User } from '@/domain/models/user';
import { PageHeader } from '@/ui/shared/PageHeader';
import { DataTable, type Column } from '@/ui/shared/DataTable';
import { PageSpinner } from '@/ui/shared/Spinner';
import { Drawer } from '@/ui/shared/Drawer';
import { DetailRow } from '@/ui/shared/DetailRow';
import { Badge } from '@/ui/shared/Badge';
import { Button } from '@/ui/shared/Button';
import { Input } from '@/ui/shared/FormField';
import { Search, Eye, Lock, Unlock, ShieldCheck, ShieldOff } from 'lucide-react';
import { CreditRating } from '@/domain/models/credit';
import { creditUseCases } from '@/domain/usecases/creditUseCases';

export const UsersPage: React.FC = () => {
  const { user: authUser } = useAuth();
  const toast = useToast();

  const [users, setUsers] = useState<User[]>([]);
  const [rating, setRating] = useState<CreditRating | null>(null);
  const [loadingRating, setLoadingRating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [roleLoading, setRoleLoading] = useState(false);
  const [blockLoading, setBlockLoading] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchUsers = useCallback(async (query: string) => {
    setLoading(true);
    try {
      const data = await userUseCases.searchUsers(query);
      setUsers(data);
    } catch (error) {
      toast.error('Ошибка загрузки пользователей');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchUsers('');
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchUsers(value), 500);
  };

  const showUserDetails = async (user: User) => {
    setSelectedUser(user);
    setDrawerOpen(true);
    
    setLoadingRating(true);
    await creditUseCases.getUserRating(user.id)
      .then(setRating)
      .catch(() => {
        setRating(null); 
        toast.error('Не удалось загрузить кредитный рейтинг пользователя');
      })
      .finally(() => setLoadingRating(false));
  };

  const refreshSelectedUser = async (userId: string) => {
    try {
      const updated = await userUseCases.getUserDetails(userId);
      setSelectedUser(updated);
    } catch {
      // ignore
    }
  };

  const handleAssignEmployee = async (userId: string) => {
    setRoleLoading(true);
    try {
      await userUseCases.assignEmployeeRole(userId);
      toast.success('Роль Employee назначена');
      await refreshSelectedUser(userId);
      fetchUsers(searchQuery);
    } catch {
      toast.error('Ошибка назначения роли');
    } finally {
      setRoleLoading(false);
    }
  };

  const handleRemoveEmployee = async (userId: string) => {
    setRoleLoading(true);
    try {
      await userUseCases.removeEmployeeRole(userId);
      toast.success('Роль Employee снята');
      await refreshSelectedUser(userId);
      fetchUsers(searchQuery);
    } catch {
      toast.error('Ошибка снятия роли');
    } finally {
      setRoleLoading(false);
    }
  };

  const handleBlock = async (userId: string) => {
    setBlockLoading(true);
    try {
      await userUseCases.blockUser(userId);
      toast.success('Пользователь заблокирован');
      await refreshSelectedUser(userId);
    } catch {
      toast.error('Ошибка блокировки');
    } finally {
      setBlockLoading(false);
    }
  };

  const handleUnblock = async (userId: string) => {
    setBlockLoading(true);
    try {
      await userUseCases.unblockUser(userId);
      toast.success('Пользователь разблокирован');
      await refreshSelectedUser(userId);
    } catch {
      toast.error('Ошибка разблокировки');
    } finally {
      setBlockLoading(false);
    }
  };

  const isSelf = selectedUser && authUser?.profile?.sub === selectedUser.id;

  const columns: Column<User>[] = [
    {
      key: 'id',
      title: 'ID',
      render: (r) => <code className="text-xs text-gray-500">{r.id.substring(0, 8)}…</code>,
    },
    { key: 'email', title: 'Email', render: (r) => r.email },
    { key: 'credentials', title: 'Имя', render: (r) => r.credentials || '—' },
    {
      key: 'actions',
      title: 'Действия',
      render: (r) => (
        <Button
          variant="ghost"
          size="sm"
          icon={<Eye className="h-4 w-4" />}
          onClick={(e) => {
            e.stopPropagation();
            showUserDetails(r);
          }}
        >
          Просмотр
        </Button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Пользователи" subtitle="Управление учётными записями" />

      <div className="mb-4">
        <div className="relative max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Поиск по имени..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="pl-9"
          />
        </div>
      </div>

      {loading ? (
        <PageSpinner />
      ) : (
        <DataTable
          data={users}
          columns={columns}
          rowKey="id"
          onRowClick={showUserDetails}
          emptyText="Пользователи не найдены"
        />
      )}

      <Drawer
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setSelectedUser(null);
        }}
        title="Информация о пользователе"
      >
        {selectedUser && (
          <div>
            <DetailRow label="ID">{selectedUser.id}</DetailRow>
            <DetailRow label="Email">{selectedUser.email}</DetailRow>
            <DetailRow label="Имя">{selectedUser.credentials || '—'}</DetailRow>
            <DetailRow label="Статус">
              {selectedUser.isBlocked ? (
                <Badge variant="red">Заблокирован</Badge>
              ) : (
                <Badge variant="green">Активен</Badge>
              )}
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

            <DetailRow label="Роли">
              {selectedUser.roles?.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {selectedUser.roles.map((role) => (
                    <Badge key={role} variant="blue">
                      {role}
                    </Badge>
                  ))}
                </div>
              ) : (
                <span className="text-gray-400">Нет ролей</span>
              )}
            </DetailRow>

            {!isSelf && (
              <>
                <hr className="my-4" />
                <div className="flex flex-wrap gap-3">
                  {selectedUser.roles?.includes('Employee') ? (
                    <Button
                      variant="danger"
                      size="sm"
                      loading={roleLoading}
                      icon={<ShieldOff className="h-4 w-4" />}
                      onClick={() => handleRemoveEmployee(selectedUser.id)}
                    >
                      Снять роль Employee
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      size="sm"
                      loading={roleLoading}
                      icon={<ShieldCheck className="h-4 w-4" />}
                      onClick={() => handleAssignEmployee(selectedUser.id)}
                    >
                      Назначить Employee
                    </Button>
                  )}

                  {selectedUser.isBlocked ? (
                    <Button
                      variant="secondary"
                      size="sm"
                      loading={blockLoading}
                      icon={<Unlock className="h-4 w-4" />}
                      onClick={() => handleUnblock(selectedUser.id)}
                    >
                      Разблокировать
                    </Button>
                  ) : (
                    <Button
                      variant="danger"
                      size="sm"
                      loading={blockLoading}
                      icon={<Lock className="h-4 w-4" />}
                      onClick={() => handleBlock(selectedUser.id)}
                    >
                      Заблокировать
                    </Button>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
};
