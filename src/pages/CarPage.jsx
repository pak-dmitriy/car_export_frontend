import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { apiRequest } from '../api/client';
import { useAuth } from '../context/AuthContext';
import ImageGallery from '../components/ImageGallery';
import StatusBadge from '../components/StatusBadge';

export default function CarPage() {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [car, setCar] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [askOpen, setAskOpen] = useState(false);
    const [subject, setSubject] = useState('');
    const [text, setText] = useState('');
    const [errors, setErrors] = useState({});
    const [formError, setFormError] = useState('');
    const [sending, setSending] = useState(false);

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

    function handleAskClick() {
        if (!user) {
            navigate('/login');
            return;
        }
        setSubject(`Question about ${car.title}`.slice(0, 150));
        setAskOpen(true);
    }

    async function handleSend(e) {
        e.preventDefault();
        setFormError('');

        const trimmedSubject = subject.trim();
        const trimmedText = text.trim();
        const localErrors = {};
        if (trimmedSubject.length < 3 || trimmedSubject.length > 150) {
            localErrors.subject = 'Subject must be 3–150 characters';
        }
        if (trimmedText.length < 1 || trimmedText.length > 2000) {
            localErrors.text = 'Message must be 1–2000 characters';
        }
        setErrors(localErrors);
        if (Object.keys(localErrors).length > 0) return;

        setSending(true);
        try {
            const thread = await apiRequest('/api/messages/threads', {
                method: 'POST',
                body: { carId: car.id, subject: trimmedSubject, text: trimmedText },
            });
            navigate(`/messages/${thread.id}`);
        } catch (err) {
            setFormError(err.message);
            setErrors(err.fieldErrors || {});
        } finally {
            setSending(false);
        }
    }

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
            <h1>
                {car.title} <StatusBadge status={car.status} />
            </h1>
            <p className="car-price">${car.price.toLocaleString()}</p>

            {user?.role === 'ADMIN' && (
                <p>
                    <Link to={`/admin/cars/${car.id}/edit`}>Edit this car</Link>
                </p>
            )}

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

                    {!askOpen && (
                        <button type="button" onClick={handleAskClick}>Ask about this car</button>
                    )}

                    {askOpen && (
                        <form onSubmit={handleSend} noValidate className="reply-form">
                            <label className="form-field">
                                Subject
                                <input value={subject} onChange={(e) => setSubject(e.target.value)} />
                                {errors.subject && <span className="field-error">{errors.subject}</span>}
                            </label>
                            <label className="form-field">
                                Message
                                <textarea rows="4" value={text} onChange={(e) => setText(e.target.value)} />
                                <small>{text.length}/2000</small>
                                {errors.text && <span className="field-error">{errors.text}</span>}
                            </label>
                            {formError && <span className="field-error">{formError}</span>}
                            <button type="submit" disabled={sending}>
                                {sending ? 'Sending...' : 'Send'}
                            </button>
                            <button type="button" onClick={() => setAskOpen(false)} disabled={sending}>
                                Cancel
                            </button>
                        </form>
                    )}
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