import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { apiRequest } from '../api/client';
import { useAuth } from '../context/AuthContext';

const MAX_LENGTH = 2000;

export default function ThreadPage() {
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
            setFormError('Message cannot be empty');
            return;
        }
        if (trimmed.length > MAX_LENGTH) {
            setFormError(`Message must be at most ${MAX_LENGTH} characters`);
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
        if (!window.confirm('Close this thread? No more replies will be possible.')) return;
        setFormError('');
        try {
            const updated = await apiRequest(`/api/messages/threads/${id}/close`, { method: 'PATCH' });
            setThread(updated);
        } catch (err) {
            setFormError(err.message);
        }
    }

    if (loading) return <p>Loading...</p>;

    if (error) {
        const message =
            error.status === 403 ? 'You do not have access to this thread'
                : error.status === 404 ? 'Thread not found'
                    : error.message;
        return (
            <div>
                <p style={{ color: 'red' }}>{message}</p>
                <Link to="/messages">Back to messages</Link>
            </div>
        );
    }

    const isAdmin = user?.role === 'ADMIN';
    const closed = thread.status === 'CLOSED';

    return (
        <div className="thread-page">
            <Link to="/messages">← Back to messages</Link>
            <h1>{thread.subject}</h1>

            <p>
                {thread.carId ? (
                    <>Car: <Link to={`/cars/${thread.carId}`}>{thread.carTitle}</Link></>
                ) : (
                    'General question'
                )}
                {isAdmin && ` · From: ${thread.userName}`}
                {' · '}
                {closed ? 'Closed' : 'Open'}
            </p>

            {isAdmin && !closed && (
                <button type="button" onClick={handleClose}>Close thread</button>
            )}

            <div className="chat">
                {thread.messages.map((m) => (
                    <div key={m.id} className={`chat-message ${m.senderId === user.id ? 'mine' : ''}`}>
                        <strong>{m.senderName}</strong>
                        <p>{m.text}</p>
                        <small>{new Date(m.createdAt).toLocaleString()}</small>
                    </div>
                ))}
            </div>

            {closed ? (
                <p>This thread is closed.</p>
            ) : (
                <form onSubmit={handleSend} className="reply-form">
          <textarea
              rows="4"
              placeholder="Write a message..."
              value={text}
              onChange={(e) => setText(e.target.value)}
          />
                    <small>{text.length}/{MAX_LENGTH}</small>
                    {formError && <span className="field-error">{formError}</span>}
                    <button type="submit" disabled={sending}>
                        {sending ? 'Sending...' : 'Send'}
                    </button>
                </form>
            )}
        </div>
    );
}