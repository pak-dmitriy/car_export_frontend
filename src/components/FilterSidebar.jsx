import { FUEL_TYPES, TRANSMISSIONS, BODY_TYPES } from '../constants';

function Select({ label, name, value, options, onChange }) {
    return (
        <label>
            {label}
            <select name={name} value={value} onChange={onChange}>
                <option value="">Any</option>
                {options.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
        </label>
    );
}

export default function FilterSidebar({ draft, onChange, onApply, onReset, open, onClose }) {
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
                <button type="button" className="filters-close" onClick={onClose}>Close</button>

                <label>
                    Search
                    <input name="keyword" placeholder="Brand, model, keyword"
                           value={draft.keyword} onChange={handleChange} />
                </label>

                <label>
                    Brand
                    <input name="brand" value={draft.brand} onChange={handleChange} />
                </label>

                <label>
                    Model
                    <input name="model" value={draft.model} onChange={handleChange} />
                </label>

                <div className="range">
                    <label>
                        Year from
                        <input type="number" name="yearFrom" min="1980" value={draft.yearFrom} onChange={handleChange} />
                    </label>
                    <label>
                        Year to
                        <input type="number" name="yearTo" min="1980" value={draft.yearTo} onChange={handleChange} />
                    </label>
                </div>

                <div className="range">
                    <label>
                        Price from
                        <input type="number" name="priceFrom" min="0" value={draft.priceFrom} onChange={handleChange} />
                    </label>
                    <label>
                        Price to
                        <input type="number" name="priceTo" min="0" value={draft.priceTo} onChange={handleChange} />
                    </label>
                </div>

                <Select label="Fuel type" name="fuelType" value={draft.fuelType}
                        options={FUEL_TYPES} onChange={handleChange} />
                <Select label="Transmission" name="transmission" value={draft.transmission}
                        options={TRANSMISSIONS} onChange={handleChange} />
                <Select label="Body type" name="bodyType" value={draft.bodyType}
                        options={BODY_TYPES} onChange={handleChange} />

                <button type="submit">Apply</button>
                <button type="button" onClick={onReset}>Reset</button>
            </form>
        </aside>
    );
}