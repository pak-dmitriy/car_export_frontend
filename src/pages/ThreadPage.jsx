import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { apiRequest } from '../api/client';
import { useAuth } from '../context/AuthContext';

const MAX_LENGTH = 2000;

export default function ThreadPage() {
    const { t, i18n } = useTranslation();
    const { id } = useParams();
    const { user } = useAuth();
    const [thread, setThread] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [text, setText] = useState('');
    const [formError, setFormError] = useState('');
    const [sending, setSending] = useState(false);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError(null);
        apiRequest(`/api/messages/threads/${id}`)
            .then((result) => { if (!cancelled) setThread(result); })
            .catch((e) => { if (!cancelled) setError(e); })
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, [id]);

    async function handleSend(e) {
        e.preventDefault();
        setFormError('');

        const trimmed = text.trim();
        if (trimmed.length === 0) {
            setFormError(t('thread.errEmpty'));
            return;
        }
        if (trimmed.length > MAX_LENGTH) {
            setFormError(t('thread.errMax', { max: MAX_LENGTH }));
            return;
        }

        setSending(true);
        try {
            const updated = await apiRequest(`/api/messages/threads/${id}/messages`, {
                method: 'POST',
                body: { text: trimmed },
            });
            setThread(updated);
            setText('');
        } catch (err) {
            setFormError(err.fieldErrors?.text || err.message);
        } finally {
            setSending(false);
        }
    }

    async function handleClose() {
        if (!window.confirm(t('thread.confirmClose'))) return;
        setFormError('');
        try {
            const updated = await apiRequest(`/api/messages/threads/${id}/close`, { method: 'PATCH' });
            setThread(updated);
        } catch (err) {
            setFormError(err.message);
        }
    }

    if (loading) return <p>{t('common.loading')}</p>;

    if (error) {
        const message =
            error.status === 403 ? t('thread.noAccess')
                : error.status === 404 ? t('thread.notFound')
                    : error.message;
        return (
            <div>
                <p style={{ color: 'red' }}>{message}</p>
                <Link to="/messages">{t('thread.backShort')}</Link>
            </div>
        );
    }

    const isAdmin = user?.role === 'ADMIN';
    const closed = thread.status === 'CLOSED';

    return (
        <div className="thread-page">
            <Link to="/messages">{t('thread.back')}</Link>
            <h1>{thread.subject}</h1>

            <p>
                {thread.carId ? (
                    <>{t('thread.car')} <Link to={`/cars/${thread.carId}`}>{thread.carTitle}</Link></>
                ) : (
                    t('thread.general')
                )}
                {isAdmin && ` · ${t('thread.from', { name: thread.userName })}`}
                {' · '}
                {closed ? t('thread.closed') : t('thread.open')}
            </p>

            {isAdmin && !closed && (
                <button type="button" onClick={handleClose}>{t('thread.close')}</button>
            )}

            <div className="chat">
                {thread.messages.map((m) => (
                    <div key={m.id} className={`chat-message ${m.senderId === user.id ? 'mine' : ''}`}>
                        <strong>{m.senderName}</strong>
                        <p>{m.text}</p>
                        <small>{new Date(m.createdAt).toLocaleString(i18n.language)}</small>
                    </div>
                ))}
            </div>

            {closed ? (
                <p>{t('thread.isClosed')}</p>
            ) : (
                <form onSubmit={handleSend} className="reply-form">
                    <textarea
                        rows="4"
                        placeholder={t('thread.placeholder')}
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                    />
                    <small>{text.length}/{MAX_LENGTH}</small>
                    {formError && <span className="field-error">{formError}</span>}
                    <button type="submit" disabled={sending}>
                        {sending ? t('thread.sending') : t('thread.send')}
                    </button>
                </form>
            )}
        </div>
    );
}