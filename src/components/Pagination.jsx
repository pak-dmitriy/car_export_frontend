export default function Pagination({ page, totalPages, onChange }) {
    if (totalPages <= 1) return null;

    return (
        <div className="pagination">
            <button onClick={() => onChange(page - 1)} disabled={page <= 1}>Previous</button>
            <span>Page {page} of {totalPages}</span>
            <button onClick={() => onChange(page + 1)} disabled={page >= totalPages}>Next</button>
        </div>
    );
}