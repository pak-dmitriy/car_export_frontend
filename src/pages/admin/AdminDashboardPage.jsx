import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { apiRequest } from '../../api/client';

const CARDS = [
    { key: 'totalCars', link: '/admin/cars' },
    { key: 'publishedCars', link: '/admin/cars' },
    { key: 'reservedCars', link: '/admin/cars' },
    { key: 'soldCars', link: '/admin/cars' },
    { key: 'totalUsers', link: '/admin/users' },
    { key: 'unreadMessages', link: '/messages' },
];

export default function AdminDashboardPage() {
    const { t } = useTranslation();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let cancelled = false;
        apiRequest('/api/admin/dashboard')
            .then((result) => { if (!cancelled) setData(result); })
            .catch((e) => { if (!cancelled) setError(e.message); })
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, []);

    return (
        <div>
            <h1>{t('admin.dashboard.title')}</h1>

            {loading && <p>{t('common.loading')}</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}

            {data && (
                <div className="dashboard-grid">
                    {CARDS.map(({ key, link }) => (
                        <Link key={key} to={link} className="dashboard-card">
                            <span className="dashboard-number">{data[key]}</span>
                            <span>{t(`admin.dashboard.${key}`)}</span>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}