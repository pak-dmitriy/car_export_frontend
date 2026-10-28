import { useState } from 'react';

export default function ImageGallery({ images, title }) {
    const sorted = [...images].sort((a, b) => Number(b.main) - Number(a.main));
    const [index, setIndex] = useState(0);

    if (sorted.length === 0) {
        return <div className="gallery-empty">No photo</div>;
    }

    return (
        <div className="gallery">
            <img className="gallery-main" src={sorted[index].fileUrl} alt={title} />
            {sorted.length > 1 && (
                <div className="gallery-thumbs">
                    {sorted.map((img, i) => (
                        <img
                            key={img.id}
                            src={img.fileUrl}
                            alt={`${title} ${i + 1}`}
                            className={i === index ? 'active' : ''}
                            onClick={() => setIndex(i)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}