import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../../api/client';
import Pagination from '../../components/Pagination';
import StatusBadge from '../../components/StatusBadge';

const LIMIT = 10;
const STATUSES = ['DRAFT', 'PUBLISHED', 'RESERVED', 'SOLD', 'HIDDEN'];

export default function AdminCarsPage() {
    const [page, setPage] = useState(1);
    const [status, setStatus] = useState('');
    const [keyword, setKeyword] = useState('');
    const [search, setSearch] = useState('');
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [reload, setReload] = useState(0);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError('');
        apiRequest('/api/admin/cars', {
            params: { page, limit: LIMIT, sortBy: 'createdAt', direction: 'desc', status, keyword: search },
        })
            .then((result) => { if (!cancelled) setData(result); })
            .catch((e) => { if (!cancelled) setError(e.message); })
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, [page, status, search, reload]);

    function handleSearch(e) {
        e.preventDefault();
        setSearch(keyword.trim());
        setPage(1);
    }

    async function handleDelete(car) {
        if (!window.confirm(`Delete "${car.title}"?`)) return;
        try {
            await apiRequest(`/api/admin/cars/${car.id}`, { method: 'DELETE' });
            setReload((n) => n + 1);
        } catch (e) {
            setError(e.message);
        }
    }

    const totalPages = data ? Math.ceil(data.totalCount / LIMIT) : 0;

    return (
        <div>
            <h1>Manage cars</h1>

            <div className="catalog-toolbar">
                <Link to="/admin/cars/new">+ Add car</Link>

                <form onSubmit={handleSearch} className="hero-search">
                    <input placeholder="Search" value={keyword} onChange={(e) => setKeyword(e.target.value)} />
                    <button type="submit">Search</button>
                </form>

                <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
                    <option value="">All statuses</option>
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>

            {loading && <p>Loading...</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {!loading && !error && data?.items.length === 0 && <p>No cars found.</p>}

            {data?.items.length > 0 && (
                <div className="table-wrap">
                    <table className="admin-table">
                        <thead>
                        <tr><th>ID</th><th>Title</th><th>Price</th><th>Status</th><th></th></tr>
                        </thead>
                        <tbody>
                        {data.items.map((car) => (
                            <tr key={car.id}>
                                <td>{car.id}</td>
                                <td>{car.title}</td>
                                <td>${car.price.toLocaleString()}</td>
                                <td><StatusBadge status={car.status} /></td>
                                <td>
                                    <Link to={`/admin/cars/${car.id}/edit`}>Edit</Link>{' '}
                                    <button onClick={() => handleDelete(car)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}

            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </div>
    );
}