import { useEffect, useState } from 'react';
import { apiRequest } from '../api/client';
import StatusBadge from './StatusBadge';

const TRANSITIONS = {
    DRAFT: ['PUBLISHED', 'HIDDEN'],
    PUBLISHED: ['RESERVED', 'SOLD', 'HIDDEN'],
    RESERVED: ['PUBLISHED', 'SOLD', 'HIDDEN'],
    SOLD: [],
    HIDDEN: ['DRAFT', 'PUBLISHED'],
};

export default function StatusManager({ carId }) {
    const [status, setStatus] = useState(null);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        let cancelled = false;
        apiRequest(`/api/admin/cars/${carId}`)
            .then((car) => { if (!cancelled) setStatus(car.status); })
            .catch((e) => { if (!cancelled) setError(e.message); });
        return () => { cancelled = true; };
    }, [carId]);

    async function change(next) {
        if (next === 'SOLD' && !window.confirm('Mark as SOLD? This cannot be undone.')) return;
        setError('');
        setBusy(true);
        try {
            const car = await apiRequest(`/api/admin/cars/${carId}/status`, {
                method: 'PATCH',
                body: { status: next },
            });
            setStatus(car.status);
        } catch (e) {
            setError(e.message);
        } finally {
            setBusy(false);
        }
    }

    if (!status) return error ? <p style={{ color: 'red' }}>{error}</p> : null;

    const options = TRANSITIONS[status] || [];

    return (
        <section className="status-manager">
            <h2>Status</h2>
            <p>Current: <StatusBadge status={status} /></p>

            {options.length === 0 && <p>No further changes are possible.</p>}

            <div className="status-buttons">
                {options.map((next) => (
                    <button key={next} type="button" onClick={() => change(next)} disabled={busy}>
                        Change to {next}
                    </button>
                ))}
            </div>

            {error && <p style={{ color: 'red' }}>{error}</p>}
        </section>
    );
}