import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { imageUrl } from '../api/client';

export default function CarCard({ car }) {
    const { t } = useTranslation();
    const mainImage = car.images.find((i) => i.main) || car.images[0];
    const fuel = t(`fuel.${car.fuelType}`, { defaultValue: car.fuelType });

    return (
        <Link to={`/cars/${car.id}`} className="car-card">
            <div className="car-card-image">
                {mainImage ? (
                    <img src={imageUrl(mainImage.fileUrl)} alt={car.title} />
                ) : (
                    <span>{t('car.noPhoto')}</span>
                )}
            </div>
            <h3>{car.title}</h3>
            <p>{car.year} · {car.mileage.toLocaleString()} {t('car.km')} · {fuel}</p>
            <p><strong>${car.price.toLocaleString()}</strong></p>
            {car.status === 'RESERVED' && <span className="badge">{t('car.reserved')}</span>}
        </Link>
    );
}