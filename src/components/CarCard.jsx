import { Link } from 'react-router-dom';

export default function CarCard({ car }) {
    const mainImage = car.images.find((i) => i.main) || car.images[0];

    return (
        <Link to={`/cars/${car.id}`} className="car-card">
            <div className="car-card-image">
                {mainImage ? <img src={mainImage.fileUrl} alt={car.title} /> : <span>No photo</span>}
            </div>
            <h3>{car.title}</h3>
            <p>{car.year} · {car.mileage.toLocaleString()} km · {car.fuelType}</p>
            <p><strong>${car.price.toLocaleString()}</strong></p>
            {car.status === 'RESERVED' && <span className="badge">Reserved</span>}
        </Link>
    );
}