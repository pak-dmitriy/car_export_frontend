import { useTranslation } from 'react-i18next';

export default function Pagination({ page, totalPages, onChange }) {
    const { t } = useTranslation();

    if (totalPages <= 1) return null;

    return (
        <div className="pagination">
            <button onClick={() => onChange(page - 1)} disabled={page <= 1}>
                {t('pagination.previous')}
            </button>
            <span>{t('pagination.page', { page, total: totalPages })}</span>
            <button onClick={() => onChange(page + 1)} disabled={page >= totalPages}>
                {t('pagination.next')}
            </button>
        </div>
    );
}