import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { apiRequest } from '../../api/client';
import { FUEL_TYPES, TRANSMISSIONS, BODY_TYPES } from '../../constants';

const EMPTY = {
    title: '', brand: '', model: '', year: '', price: '', mileage: '',
    fuelType: '', transmission: '', engineVolume: '', bodyType: '',
    color: '', countryOfOrigin: '', exportLocation: '', description: '',
};

function toForm(car) {
    const form = {};
    for (const key of Object.keys(EMPTY)) form[key] = car[key] ?? '';
    return form;
}

function toRequest(f) {
    const optional = (v) => (String(v).trim() === '' ? null : String(v).trim());
    return {
        title: f.title.trim(),
        brand: f.brand.trim(),
        model: f.model.trim(),
        year: Number(f.year),
        price: Number(f.price),
        mileage: Number(f.mileage),
        fuelType: f.fuelType,
        transmission: f.transmission,
        engineVolume: f.engineVolume === '' ? null : Number(f.engineVolume),
        bodyType: f.bodyType,
        color: optional(f.color),
        countryOfOrigin: optional(f.countryOfOrigin),
        exportLocation: optional(f.exportLocation),
        description: optional(f.description),
    };
}

function validate(f) {
    const e = {};
    const maxYear = new Date().getFullYear() + 1;

    if (f.title.trim().length < 5 || f.title.trim().length > 150) e.title = 'Title must be 5–150 characters';
    if (!f.brand.trim()) e.brand = 'Brand is required';
    if (!f.model.trim()) e.model = 'Model is required';

    const year = Number(f.year);
    if (f.year === '' || !Number.isInteger(year) || year < 1980 || year > maxYear) {
        e.year = `Year must be between 1980 and ${maxYear}`;
    }

    if (f.price === '' || !(Number(f.price) > 0)) e.price = 'Price must be a positive number';

    const mileage = Number(f.mileage);
    if (f.mileage === '' || !Number.isInteger(mileage) || mileage < 0) {
        e.mileage = 'Mileage must be zero or a positive whole number';
    }

    if (!f.fuelType) e.fuelType = 'Fuel type is required';
    if (!f.transmission) e.transmission = 'Transmission is required';
    if (!f.bodyType) e.bodyType = 'Body type is required';

    if (f.engineVolume !== '' && !(Number(f.engineVolume) > 0)) {
        e.engineVolume = 'Engine volume must be a positive number';
    }
    if (f.description.length > 5000) e.description = 'Description must be at most 5000 characters';
    return e;
}

function Field({ label, name, form, errors, onChange, type = 'text', ...rest }) {
    return (
        <label className="form-field">
            {label}
            <input type={type} name={name} value={form[name]} onChange={onChange} {...rest} />
            {errors[name] && <span className="field-error">{errors[name]}</span>}
        </label>
    );
}

function SelectField({ label, name, form, errors, onChange, options }) {
    // если у машины значение не из нашего списка, оставляем его в выборе
    const list = form[name] && !options.includes(form[name]) ? [form[name], ...options] : options;
    return (
        <label className="form-field">
            {label}
            <select name={name} value={form[name]} onChange={onChange}>
                <option value="">Select...</option>
                {list.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
            {errors[name] && <span className="field-error">{errors[name]}</span>}
        </label>
    );
}

export default function CarFormPage() {
    const { id } = useParams();
    const isEdit = Boolean(id);
    const navigate = useNavigate();

    const [form, setForm] = useState(EMPTY);
    const [errors, setErrors] = useState({});
    const [error, setError] = useState('');
    const [saved, setSaved] = useState(false);
    const [loading, setLoading] = useState(isEdit);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!isEdit) return;
        let cancelled = false;
        setLoading(true);
        apiRequest(`/api/admin/cars/${id}`)
            .then((car) => { if (!cancelled) setForm(toForm(car)); })
            .catch((e) => { if (!cancelled) setError(e.status === 404 ? 'Car not found' : e.message); })
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, [id, isEdit]);

    function handleChange(e) {
        setForm({ ...form, [e.target.name]: e.target.value });
        setSaved(false);
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setSaved(false);

        const localErrors = validate(form);
        setErrors(localErrors);
        if (Object.keys(localErrors).length > 0) return;

        setSubmitting(true);
        try {
            if (isEdit) {
                await apiRequest(`/api/admin/cars/${id}`, { method: 'PUT', body: toRequest(form) });
                setSaved(true);
            } else {
                const car = await apiRequest('/api/admin/cars', { method: 'POST', body: toRequest(form) });
                navigate(`/admin/cars/${car.id}/edit`);
            }
        } catch (err) {
            setError(err.message);
            setErrors(err.fieldErrors || {});
        } finally {
            setSubmitting(false);
        }
    }

    if (loading) return <p>Loading...</p>;
    if (isEdit && error && !form.title) {
        return (
            <div>
                <p style={{ color: 'red' }}>{error}</p>
                <Link to="/admin/cars">Back to cars</Link>
            </div>
        );
    }

    const shared = { form, errors, onChange: handleChange };

    return (
        <div>
            <Link to="/admin/cars">← Back to cars</Link>
            <h1>{isEdit ? 'Edit car' : 'Add car'}</h1>

            <form onSubmit={handleSubmit} noValidate className="car-form">
                <Field label="Title" name="title" {...shared} />
                <div className="form-grid">
                    <Field label="Brand" name="brand" {...shared} />
                    <Field label="Model" name="model" {...shared} />
                    <Field label="Year" name="year" type="number" {...shared} />
                    <Field label="Price ($)" name="price" type="number" step="0.01" {...shared} />
                    <Field label="Mileage (km)" name="mileage" type="number" {...shared} />
                    <Field label="Engine volume (L)" name="engineVolume" type="number" step="0.1" {...shared} />
                    <SelectField label="Fuel type" name="fuelType" options={FUEL_TYPES} {...shared} />
                    <SelectField label="Transmission" name="transmission" options={TRANSMISSIONS} {...shared} />
                    <SelectField label="Body type" name="bodyType" options={BODY_TYPES} {...shared} />
                    <Field label="Color" name="color" {...shared} />
                    <Field label="Country of origin" name="countryOfOrigin" {...shared} />
                    <Field label="Export location" name="exportLocation" {...shared} />
                </div>

                <label className="form-field">
                    Description
                    <textarea name="description" rows="5" value={form.description} onChange={handleChange} />
                    {errors.description && <span className="field-error">{errors.description}</span>}
                </label>

                {error && <p style={{ color: 'red' }}>{error}</p>}
                {saved && <p style={{ color: 'green' }}>Saved</p>}

                <button type="submit" disabled={submitting}>
                    {submitting ? 'Saving...' : isEdit ? 'Save changes' : 'Create car'}
                </button>
            </form>
        </div>
    );
}