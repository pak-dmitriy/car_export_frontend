import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { apiRequest, imageUrl } from '../api/client';

const TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE = 5 * 1024 * 1024;
const MAX_IMAGES = 10;

export default function ImageManager({ carId, images, onChange }) {
    const { t } = useTranslation();
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');

    async function run(action) {
        setError('');
        setBusy(true);
        try {
            await action();
        } catch (e) {
            setError(e.message);
        } finally {
            setBusy(false);
        }
    }

    function handleFiles(e) {
        const files = Array.from(e.target.files);
        e.target.value = '';
        setError('');
        if (files.length === 0) return;

        if (images.length + files.length > MAX_IMAGES) {
            setError(t('imageManager.errMax', { max: MAX_IMAGES }));
            return;
        }
        for (const file of files) {
            if (!TYPES.includes(file.type)) {
                setError(t('imageManager.errType', { name: file.name }));
                return;
            }
            if (file.size > MAX_SIZE) {
                setError(t('imageManager.errSize', { name: file.name }));
                return;
            }
        }

        run(async () => {
            let current = images;
            for (const file of files) {
                const body = new FormData();
                body.append('file', file);
                const image = await apiRequest(`/api/admin/cars/${carId}/images`, { method: 'POST', body });
                current = [...current, image];
                onChange(current);
            }
        });
    }

    function handleMain(imageId) {
        run(async () => {
            const car = await apiRequest(`/api/admin/cars/${carId}/images/${imageId}/main`, { method: 'PATCH' });
            onChange(car.images);
        });
    }

    function handleDelete(imageId) {
        if (!window.confirm(t('imageManager.confirmDelete'))) return;
        run(async () => {
            const car = await apiRequest(`/api/admin/cars/${carId}/images/${imageId}`, { method: 'DELETE' });
            onChange(car.images);
        });
    }

    return (
        <section className="image-manager">
            <h2>{t('imageManager.title', { count: images.length, max: MAX_IMAGES })}</h2>

            <input type="file" accept="image/jpeg,image/png,image/webp" multiple
                   onChange={handleFiles} disabled={busy || images.length >= MAX_IMAGES} />
            {busy && <p>{t('imageManager.working')}</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {images.length === 0 && !busy && <p>{t('imageManager.noPhotos')}</p>}

            <div className="image-grid">
                {images.map((img) => (
                    <div key={img.id} className="image-item">
                        <img src={imageUrl(img.fileUrl)} alt="" />
                        {img.main ? (
                            <span className="badge badge-published">{t('imageManager.main')}</span>
                        ) : (
                            <button type="button" onClick={() => handleMain(img.id)} disabled={busy}>
                                {t('imageManager.makeMain')}
                            </button>
                        )}
                        <button type="button" onClick={() => handleDelete(img.id)} disabled={busy}>
                            {t('imageManager.delete')}
                        </button>
                    </div>
                ))}
            </div>
        </section>
    );
}