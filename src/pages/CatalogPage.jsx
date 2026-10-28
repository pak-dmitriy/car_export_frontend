import { useEffect, useState } from 'react';
import { apiRequest } from '../api/client';
import CarCard from '../components/CarCard';
import FilterSidebar from '../components/FilterSidebar';
import Pagination from '../components/Pagination';
import { useSearchParams } from 'react-router-dom';

const LIMIT = 12;

const EMPTY_FILTERS = {
    keyword: '', brand: '', model: '',
    yearFrom: '', yearTo: '', priceFrom: '', priceTo: '',
    fuelType: '', transmission: '', bodyType: '',
};

const SORT_OPTIONS = [
    { value: 'createdAt:desc', label: 'Newest first' },
    { value: 'price:asc', label: 'Price: low to high' },
    { value: 'price:desc', label: 'Price: high to low' },
    { value: 'year:desc', label: 'Year: newest' },
    { value: 'mileage:asc', label: 'Mileage: lowest' },
];

export default function CatalogPage() {
    const [searchParams] = useSearchParams();
    const initialFilters = { ...EMPTY_FILTERS, keyword: searchParams.get('keyword') || '' };

    const [page, setPage] = useState(1);
    const [sort, setSort] = useState('createdAt:desc');
    const [filters, setFilters] = useState(initialFilters);
    const [draft, setDraft] = useState(initialFilters);
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let cancelled = false;
        const [sortBy, direction] = sort.split(':');

        setLoading(true);
        setError('');
        apiRequest('/api/cars', { params: { page, limit: LIMIT, sortBy, direction, ...filters } })
            .then((result) => { if (!cancelled) setData(result); })
            .catch((e) => { if (!cancelled) setError(e.message); })
            .finally(() => { if (!cancelled) setLoading(false); });

        return () => { cancelled = true; };
    }, [page, sort, filters]);

    function handleSortChange(e) {
        setSort(e.target.value);
        setPage(1);
    }

    function applyFilters() {
        setFilters(draft);
        setPage(1);
        setFiltersOpen(false);
    }

    function resetFilters() {
        setDraft(EMPTY_FILTERS);
        setFilters(EMPTY_FILTERS);
        setPage(1);
        setFiltersOpen(false);
    }

    const totalPages = data ? Math.ceil(data.totalCount / LIMIT) : 0;

    return (
        <div>
            <h1>Catalogue</h1>

            <div className="catalog-layout">
                <FilterSidebar
                    draft={draft}
                    onChange={setDraft}
                    onApply={applyFilters}
                    onReset={resetFilters}
                    open={filtersOpen}
                    onClose={() => setFiltersOpen(false)}
                />

                <section>
                    <div className="catalog-toolbar">
                        <button className="filters-toggle" onClick={() => setFiltersOpen(true)}>Filters</button>
                        <select value={sort} onChange={handleSortChange}>
                            {SORT_OPTIONS.map((o) => (
                                <option key={o.value} value={o.value}>{o.label}</option>
                            ))}
                        </select>
                        {data && <span>{data.totalCount} cars</span>}
                    </div>

                    {loading && <p>Loading...</p>}
                    {error && <p style={{ color: 'red' }}>{error}</p>}
                    {!loading && !error && data?.items.length === 0 && <p>No cars found.</p>}

                    <div className="car-grid">
                        {data?.items.map((car) => <CarCard key={car.id} car={car} />)}
                    </div>

                    <Pagination page={page} totalPages={totalPages} onChange={setPage} />
                </section>
            </div>
        </div>
    );
}