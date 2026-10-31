import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../api/client';
import { useAuth } from '../context/AuthContext';
import Pagination from '../components/Pagination';

const LIMIT = 20;

export default function MessagesPage() {
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
            <h1>{isAdmin ? 'Inbox' : 'My messages'}</h1>

            {loading && <p>Loading...</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {!loading && !error && data?.items.length === 0 && <p>No messages yet.</p>}

            <div className="thread-list">
                {data?.items.map((thread) => (
                    <Link key={thread.id} to={`/messages/${thread.id}`} className="thread-item">
                        <strong>{thread.subject}</strong>
                        <span>
              {thread.carTitle ? `Car: ${thread.carTitle}` : 'General question'}
                            {isAdmin && ` · From: ${thread.userName}`}
            </span>
                        <span>
              {thread.status === 'CLOSED' ? 'Closed' : 'Open'} · {new Date(thread.updatedAt).toLocaleString()}
            </span>
                    </Link>
                ))}
            </div>

            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </div>
    );
}