const LABELS = {
    DRAFT: 'Draft',
    PUBLISHED: 'Available',
    RESERVED: 'Reserved',
    SOLD: 'Sold',
    HIDDEN: 'Hidden',
};

export default function StatusBadge({ status }) {
    return <span className={`badge badge-${status.toLowerCase()}`}>{LABELS[status] || status}</span>;
}