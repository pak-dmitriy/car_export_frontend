import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { apiRequest } from '../../api/client';
import { FUEL_TYPES, TRANSMISSIONS, BODY_TYPES } from '../../constants';
import ImageManager from '../../components/ImageManager';
import StatusManager from '../../components/StatusManager';

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

function validate(f, t) {
    const e = {};
    const maxYear = new Date().getFullYear() + 1;
    const err = (key, options) => t(`admin.carForm.errors.${key}`, options);

    if (f.title.trim().length < 5 || f.title.trim().length > 150) e.title = err('title');
    if (!f.brand.trim()) e.brand = err('brand');
    if (!f.model.trim()) e.model = err('model');

    const year = Number(f.year);
    if (f.year === '' || !Number.isInteger(year) || year < 1980 || year > maxYear) {
        e.year = err('year', { max: maxYear });
    }

    if (f.price === '' || !(Number(f.price) > 0)) e.price = err('price');

    const mileage = Number(f.mileage);
    if (f.mileage === '' || !Number.isInteger(mileage) || mileage < 0) {
        e.mileage = err('mileage');
    }

    if (!f.fuelType) e.fuelType = err('fuelType');
    if (!f.transmission) e.transmission = err('transmission');
    if (!f.bodyType) e.bodyType = err('bodyType');

    if (f.engineVolume !== '' && !(Number(f.engineVolume) > 0)) {
        e.engineVolume = err('engineVolume');
    }
    if (f.description.length > 5000) e.description = err('description');
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

function SelectField({ label, name, form, errors, onChange, options, prefix }) {
    const { t } = useTranslation();
    const list = form[name] && !options.includes(form[name]) ? [form[name], ...options] : options;
    return (
        <label className="form-field">
            {label}
            <select name={name} value={form[name]} onChange={onChange}>
                <option value="">{t('admin.carForm.select')}</option>
                {list.map((o) => (
                    <option key={o} value={o}>{t(`${prefix}.${o}`, { defaultValue: o })}</option>
                ))}
            </select>
            {errors[name] && <span className="field-error">{errors[name]}</span>}
        </label>
    );
}

export default function CarFormPage() {
    const { t } = useTranslation();
    const { id } = useParams();
    const isEdit = Boolean(id);
    const navigate = useNavigate();

    const [form, setForm] = useState(EMPTY);
    const [images, setImages] = useState([]);
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
            .then((car) => {
                if (!cancelled) {
                    setForm(toForm(car));
                    setImages(car.images);
                }
            })
            .catch((e) => {
                if (!cancelled) setError(e.status === 404 ? t('admin.carForm.notFound') : e.message);
            })
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, [id, isEdit, t]);

    function handleChange(e) {
        setForm({ ...form, [e.target.name]: e.target.value });
        setSaved(false);
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setSaved(false);

        const localErrors = validate(form, t);
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

    if (loading) return <p>{t('common.loading')}</p>;
    if (isEdit && error && !form.title) {
        return (
            <div>
                <p style={{ color: 'red' }}>{error}</p>
                <Link to="/admin/cars">{t('admin.carForm.backShort')}</Link>
            </div>
        );
    }

    const shared = { form, errors, onChange: handleChange };
    const label = (key) => t(`admin.carForm.labels.${key}`);

    return (
        <div>
            <Link to="/admin/cars">{t('admin.carForm.back')}</Link>
            <h1>{isEdit ? t('admin.carForm.editTitle') : t('admin.carForm.addTitle')}</h1>

            <form onSubmit={handleSubmit} noValidate className="car-form">
                <Field label={label('title')} name="title" {...shared} />
                <div className="form-grid">
                    <Field label={label('brand')} name="brand" {...shared} />
                    <Field label={label('model')} name="model" {...shared} />
                    <Field label={label('year')} name="year" type="number" {...shared} />
                    <Field label={label('price')} name="price" type="number" step="0.01" {...shared} />
                    <Field label={label('mileage')} name="mileage" type="number" {...shared} />
                    <Field label={label('engineVolume')} name="engineVolume" type="number" step="0.1" {...shared} />
                    <SelectField label={label('fuelType')} name="fuelType" options={FUEL_TYPES} prefix="fuel" {...shared} />
                    <SelectField label={label('transmission')} name="transmission" options={TRANSMISSIONS} prefix="transmission" {...shared} />
                    <SelectField label={label('bodyType')} name="bodyType" options={BODY_TYPES} prefix="body" {...shared} />
                    <Field label={label('color')} name="color" {...shared} />
                    <Field label={label('countryOfOrigin')} name="countryOfOrigin" {...shared} />
                    <Field label={label('exportLocation')} name="exportLocation" {...shared} />
                </div>

                <label className="form-field">
                    {label('description')}
                    <textarea name="description" rows="5" value={form.description} onChange={handleChange} />
                    {errors.description && <span className="field-error">{errors.description}</span>}
                </label>

                {error && <p style={{ color: 'red' }}>{error}</p>}
                {saved && <p style={{ color: 'green' }}>{t('admin.carForm.saved')}</p>}

                <button type="submit" disabled={submitting}>
                    {submitting
                        ? t('admin.carForm.saving')
                        : isEdit ? t('admin.carForm.saveChanges') : t('admin.carForm.create')}
                </button>
            </form>

            {isEdit && <StatusManager carId={id} />}
            {isEdit && <ImageManager carId={id} images={images} onChange={setImages} />}
        </div>
    );
}