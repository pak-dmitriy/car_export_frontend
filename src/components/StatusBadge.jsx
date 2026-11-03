import { useTranslation } from 'react-i18next';

export default function StatusBadge({ status }) {
    const { t } = useTranslation();
    return (
        <span className={`badge badge-${status.toLowerCase()}`}>
      {t(`status.${status}`, { defaultValue: status })}
    </span>
    );
}