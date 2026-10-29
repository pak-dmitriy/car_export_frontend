import { useState } from 'react';
import { apiRequest, imageUrl } from '../api/client';

const TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE = 5 * 1024 * 1024;
const MAX_IMAGES = 10;

export default function ImageManager({ carId, images, onChange }) {
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
            setError(`A car can have at most ${MAX_IMAGES} images`);
            return;
        }
        for (const file of files) {
            if (!TYPES.includes(file.type)) {
                setError(`${file.name}: only JPG, PNG and WEBP are allowed`);
                return;
            }
            if (file.size > MAX_SIZE) {
                setError(`${file.name}: file is larger than 5 MB`);
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
        if (!window.confirm('Delete this image?')) return;
        run(async () => {
            const car = await apiRequest(`/api/admin/cars/${carId}/images/${imageId}`, { method: 'DELETE' });
            onChange(car.images);
        });
    }

    return (
        <section className="image-manager">
            <h2>Photos ({images.length}/{MAX_IMAGES})</h2>

            <input type="file" accept="image/jpeg,image/png,image/webp" multiple
                   onChange={handleFiles} disabled={busy || images.length >= MAX_IMAGES} />
            {busy && <p>Working...</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {images.length === 0 && !busy && <p>No photos yet.</p>}

            <div className="image-grid">
                {images.map((img) => (
                    <div key={img.id} className="image-item">
                        <img src={imageUrl(img.fileUrl)} alt="" />
                        {img.main ? (
                            <span className="badge badge-published">Main</span>
                        ) : (
                            <button type="button" onClick={() => handleMain(img.id)} disabled={busy}>Make main</button>
                        )}
                        <button type="button" onClick={() => handleDelete(img.id)} disabled={busy}>Delete</button>
                    </div>
                ))}
            </div>
        </section>
    );
}