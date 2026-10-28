import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { apiRequest } from '../api/client';
import ImageGallery from '../components/ImageGallery';
import StatusBadge from '../components/StatusBadge';

export default function CarPage() {
    const { id } = useParams();
    const [car, setCar] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError(null);
        apiRequest(`/api/cars/${id}`)
            .then((result) => { if (!cancelled) setCar(result); })
            .catch((e) => { if (!cancelled) setError(e); })
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, [id]);

    if (loading) return <p>Loading...</p>;

    if (error) {
        return (
            <div>
                <p style={{ color: 'red' }}>
                    {error.status === 404 ? 'Car not found' : error.message}
                </p>
                <Link to="/cars">Back to catalogue</Link>
            </div>
        );
    }

    const specs = [
        ['Brand', car.brand],
        ['Model', car.model],
        ['Year', car.year],
        ['Mileage', `${car.mileage.toLocaleString()} km`],
        ['Fuel type', car.fuelType],
        ['Transmission', car.transmission],
        ['Engine volume', car.engineVolume ? `${car.engineVolume} L` : null],
        ['Body type', car.bodyType],
        ['Color', car.color],
        ['Country of origin', car.countryOfOrigin],
        ['Export location', car.exportLocation],
    ].filter(([, value]) => value);

    return (
        <div className="car-page">
            <Link to="/cars">← Back to catalogue</Link>
            <h1>{car.title} <StatusBadge status={car.status} /></h1>
            <p className="car-price">${car.price.toLocaleString()}</p>

            <div className="car-layout">
                <ImageGallery images={car.images} title={car.title} />

                <div>
                    <table className="specs">
                        <tbody>
                        {specs.map(([label, value]) => (
                            <tr key={label}><th>{label}</th><td>{value}</td></tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {car.description && (
                <>
                    <h2>Description</h2>
                    <p>{car.description}</p>
                </>
            )}
        </div>
    );
}