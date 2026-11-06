import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { apiRequest } from '../api/client';
import { useAuth } from '../context/AuthContext';
import Pagination from '../components/Pagination';

const LIMIT = 20;

export default function MessagesPage() {
    const { t, i18n } = useTranslation();
    const { user } = useAuth();
    const [page, setPage] = useState(1);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError('');
        apiRequest('/api/messages/threads', { params: { page, limit: LIMIT } })
            .then((result) => { if (!cancelled) setData(result); })
            .catch((e) => { if (!cancelled) setError(e.message); })
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, [page]);

    const isAdmin = user?.role === 'ADMIN';
    const totalPages = data ? Math.ceil(data.totalCount / LIMIT) : 0;

    return (
        <div>
            <h1>{isAdmin ? t('messagesPage.titleAdmin') : t('messagesPage.titleUser')}</h1>

            {loading && <p>{t('common.loading')}</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {!loading && !error && data?.items.length === 0 && <p>{t('messagesPage.noMessages')}</p>}

            <div className="thread-list">
                {data?.items.map((thread) => (
                    <Link key={thread.id} to={`/messages/${thread.id}`} className="thread-item">
                        <strong>{thread.subject}</strong>
                        <span>
                            {thread.carTitle
                                ? t('messagesPage.car', { title: thread.carTitle })
                                : t('messagesPage.general')}
                            {isAdmin && ` · ${t('messagesPage.from', { name: thread.userName })}`}
                        </span>
                        <span>
                            {thread.status === 'CLOSED' ? t('messagesPage.closed') : t('messagesPage.open')}
                            {' · '}
                            {new Date(thread.updatedAt).toLocaleString(i18n.language)}
                        </span>
                    </Link>
                ))}
            </div>

            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </div>
    );
}