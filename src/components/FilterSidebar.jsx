import { useTranslation } from 'react-i18next';
import { FUEL_TYPES, TRANSMISSIONS, BODY_TYPES } from '../constants';

function Select({ label, name, value, options, group, onChange }) {
    const { t } = useTranslation();
    return (
        <label>
            {label}
            <select name={name} value={value} onChange={onChange}>
                <option value="">{t('filters.any')}</option>
                {options.map((o) => (
                    <option key={o} value={o}>{t(`${group}.${o}`, { defaultValue: o })}</option>
                ))}
            </select>
        </label>
    );
}

export default function FilterSidebar({ draft, onChange, onApply, onReset, open, onClose }) {
    const { t } = useTranslation();

    function handleChange(e) {
        onChange({ ...draft, [e.target.name]: e.target.value });
    }

    function handleSubmit(e) {
        e.preventDefault();
        onApply();
    }

    return (
        <aside className={`filters ${open ? 'open' : ''}`}>
            <form onSubmit={handleSubmit}>
                <button type="button" className="filters-close" onClick={onClose}>
                    {t('filters.close')}
                </button>

                <label>
                    {t('filters.search')}
                    <input name="keyword" placeholder={t('filters.searchPlaceholder')}
                           value={draft.keyword} onChange={handleChange} />
                </label>

                <label>
                    {t('filters.brand')}
                    <input name="brand" value={draft.brand} onChange={handleChange} />
                </label>

                <label>
                    {t('filters.model')}
                    <input name="model" value={draft.model} onChange={handleChange} />
                </label>

                <div className="range">
                    <label>
                        {t('filters.yearFrom')}
                        <input type="number" name="yearFrom" min="1980" value={draft.yearFrom} onChange={handleChange} />
                    </label>
                    <label>
                        {t('filters.yearTo')}
                        <input type="number" name="yearTo" min="1980" value={draft.yearTo} onChange={handleChange} />
                    </label>
                </div>

                <div className="range">
                    <label>
                        {t('filters.priceFrom')}
                        <input type="number" name="priceFrom" min="0" value={draft.priceFrom} onChange={handleChange} />
                    </label>
                    <label>
                        {t('filters.priceTo')}
                        <input type="number" name="priceTo" min="0" value={draft.priceTo} onChange={handleChange} />
                    </label>
                </div>

                <Select label={t('filters.fuelType')} name="fuelType" value={draft.fuelType}
                        options={FUEL_TYPES} group="fuel" onChange={handleChange} />
                <Select label={t('filters.transmission')} name="transmission" value={draft.transmission}
                        options={TRANSMISSIONS} group="transmission" onChange={handleChange} />
                <Select label={t('filters.bodyType')} name="bodyType" value={draft.bodyType}
                        options={BODY_TYPES} group="body" onChange={handleChange} />

                <button type="submit">{t('filters.apply')}</button>
                <button type="button" onClick={onReset}>{t('filters.reset')}</button>
            </form>
        </aside>
    );
}