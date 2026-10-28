import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiRequest } from '../api/client';
import CarCard from '../components/CarCard';

export default function HomePage() {
    const navigate = useNavigate();
    const [keyword, setKeyword] = useState('');
    const [cars, setCars] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let cancelled = false;
        apiRequest('/api/cars', { params: { limit: 4, sortBy: 'createdAt', direction: 'desc' } })
            .then((data) => { if (!cancelled) setCars(data.items); })
            .catch((e) => { if (!cancelled) setError(e.message); })
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, []);

    function handleSearch(e) {
        e.preventDefault();
        const q = keyword.trim();
        navigate(q ? `/cars?keyword=${encodeURIComponent(q)}` : '/cars');
    }

    return (
        <div>
            <section className="hero">
                <h1>Used cars from Korea</h1>
                <p>Find a car and ask our manager about export.</p>
                <form onSubmit={handleSearch} className="hero-search">
                    <input
                        placeholder="Brand, model or keyword"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                    />
                    <button type="submit">Search</button>
                </form>
            </section>

            <h2>Latest cars</h2>
            {loading && <p>Loading...</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {!loading && !error && cars.length === 0 && <p>No cars yet.</p>}

            <div className="car-grid">
                {cars.map((car) => <CarCard key={car.id} car={car} />)}
            </div>

            <Link to="/cars">View all cars →</Link>
        </div>
    );
}