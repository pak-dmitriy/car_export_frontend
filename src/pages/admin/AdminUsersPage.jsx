import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { apiRequest } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import Pagination from '../../components/Pagination';

const LIMIT = 20;
const ROLES = ['USER', 'ADMIN'];
const STATUSES = ['ACTIVE', 'BLOCKED'];

export default function AdminUsersPage() {
    const { t } = useTranslation();
    const { user: me } = useAuth();

    const [page, setPage] = useState(1);
    const [keyword, setKeyword] = useState('');
    const [search, setSearch] = useState('');
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [busyId, setBusyId] = useState(null);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError('');
        apiRequest('/api/admin/users', { params: { page, limit: LIMIT, keyword: search } })
            .then((result) => { if (!cancelled) setData(result); })
            .catch((e) => { if (!cancelled) setError(e.message); })
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, [page, search]);

    function handleSearch(e) {
        e.preventDefault();
        setSearch(keyword.trim());
        setPage(1);
    }

    async function handleChange(target, patch) {
        if (patch.status === 'BLOCKED' && !window.confirm(t('admin.users.confirmBlock'))) return;
        setError('');
        setBusyId(target.id);
        try {
            const updated = await apiRequest(`/api/admin/users/${target.id}`, {
                method: 'PATCH',
                body: patch,
            });
            setData((prev) => ({
                ...prev,
                users: prev.users.map((u) => (u.id === updated.id ? updated : u)),
            }));
        } catch (e) {
            setError(e.message);
        } finally {
            setBusyId(null);
        }
    }

    const totalPages = data ? Math.ceil(data.totalCount / LIMIT) : 0;

    return (
        <div>
            <h1>{t('admin.users.title')}</h1>

            <form onSubmit={handleSearch} className="hero-search">
                <input
                    placeholder={t('admin.users.searchPlaceholder')}
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                />
                <button type="submit">{t('admin.users.search')}</button>
            </form>

            {loading && <p>{t('common.loading')}</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {!loading && !error && data?.users.length === 0 && <p>{t('admin.users.noUsers')}</p>}

            {data?.users.length > 0 && (
                <div className="table-wrap">
                    <table className="admin-table">
                        <thead>
                        <tr>
                            <th>ID</th>
                            <th>{t('admin.users.name')}</th>
                            <th>{t('admin.users.email')}</th>
                            <th>{t('admin.users.role')}</th>
                            <th>{t('admin.users.status')}</th>
                        </tr>
                        </thead>
                        <tbody>
                        {data.users.map((u) => {
                            const isMe = u.id === me.id;
                            return (
                                <tr key={u.id}>
                                    <td>{u.id}</td>
                                    <td>{u.fullName}{isMe && ` (${t('admin.users.you')})`}</td>
                                    <td>{u.email}</td>
                                    <td>
                                        <select
                                            value={u.role}
                                            disabled={isMe || busyId === u.id}
                                            onChange={(e) => handleChange(u, { role: e.target.value })}
                                        >
                                            {ROLES.map((r) => (
                                                <option key={r} value={r}>{t(`admin.users.roleNames.${r}`)}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td>
                                        <select
                                            value={u.status}
                                            disabled={isMe || busyId === u.id}
                                            onChange={(e) => handleChange(u, { status: e.target.value })}
                                        >
                                            {STATUSES.map((s) => (
                                                <option key={s} value={s}>{t(`admin.users.statusNames.${s}`)}</option>
                                            ))}
                                        </select>
                                    </td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>
                </div>
            )}

            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </div>
    );
}