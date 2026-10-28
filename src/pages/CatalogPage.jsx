import { useEffect, useState } from 'react';
import { apiRequest } from '../api/client';
import CarCard from '../components/CarCard';
import Pagination from '../components/Pagination';

const LIMIT = 12;

const SORT_OPTIONS = [
    { value: 'createdAt:desc', label: 'Newest first' },
    { value: 'price:asc', label: 'Price: low to high' },
    { value: 'price:desc', label: 'Price: high to low' },
    { value: 'year:desc', label: 'Year: newest' },
    { value: 'mileage:asc', label: 'Mileage: lowest' },
];

export default function CatalogPage() {
    const [page, setPage] = useState(1);
    const [sort, setSort] = useState('createdAt:desc');
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let cancelled = false;
        const [sortBy, direction] = sort.split(':');

        setLoading(true);
        setError('');
        apiRequest('/api/cars', { params: { page, limit: LIMIT, sortBy, direction } })
            .then((result) => { if (!cancelled) setData(result); })
            .catch((e) => { if (!cancelled) setError(e.message); })
            .finally(() => { if (!cancelled) setLoading(false); });

        return () => { cancelled = true; };
    }, [page, sort]);

    function handleSortChange(e) {
        setSort(e.target.value);
        setPage(1);
    }

    const totalPages = data ? Math.ceil(data.totalCount / LIMIT) : 0;

    return (
        <div>
            <h1>Catalogue</h1>

            <select value={sort} onChange={handleSortChange}>
                {SORT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                ))}
            </select>

            {loading && <p>Loading...</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {!loading && !error && data?.items.length === 0 && <p>No cars found.</p>}

            <div className="car-grid">
                {data?.items.map((car) => <CarCard key={car.id} car={car} />)}
            </div>

            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </div>
    );
}