import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/AppStore.jsx';
import { Icon } from '../components/Icons.jsx';
import { Empty, PageHead, Panel, Tabs } from '../components/ui.jsx';
import { dateTime } from '../utils/format.js';

export default function Notifications() {
  const { state, dispatch } = useStore();
  const nav = useNavigate();
  const [tab, setTab] = useState('all');
  const unread = state.notifications.filter((n) => !n.read).length;
  const list = state.notifications.filter((n) => tab === 'all' || (tab === 'unread' ? !n.read : n.kind === tab));

  return (
    <>
      <PageHead
        eyebrow="Inbox"
        title="Notifications"
        text="Account, funding and verification updates."
        actions={
          <button className="btn btn--secondary" disabled={!unread} onClick={() => dispatch({ type: 'readAll' })}>
            <Icon.check width={16} height={16} /> Mark all read
          </button>
        }
      />
      <Panel
        action={
          <Tabs
            value={tab}
            onChange={setTab}
            tabs={[
              { id: 'all', label: 'All', count: state.notifications.length },
              { id: 'unread', label: 'Unread', count: unread },
              { id: 'warn', label: 'Action needed' },
              { id: 'success', label: 'Updates' },
            ]}
          />
        }
      >
        {list.length ? (
          <ul className="notifications">
            {list.map((n) => (
              <li key={n.id} className={n.read ? '' : 'is-unread'}>
                <span className={`note-dot note-dot--${n.kind}`} />
                <button
                  className="notifications__body"
                  onClick={() => {
                    dispatch({ type: 'readNotification', id: n.id });
                    if (n.link) nav(n.link);
                  }}
                >
                  <b>{n.title}</b>
                  <p>{n.text}</p>
                  <time>{dateTime(n.date)}</time>
                </button>
                <div className="notifications__actions">
                  {!n.read && (
                    <button className="icon-btn" onClick={() => dispatch({ type: 'readNotification', id: n.id })} aria-label="Mark read" title="Mark read">
                      <Icon.check width={16} height={16} />
                    </button>
                  )}
                  <button className="icon-btn" onClick={() => dispatch({ type: 'deleteNotification', id: n.id })} aria-label="Delete" title="Delete">
                    <Icon.trash width={16} height={16} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <Empty title="You're all caught up" text="New notifications will appear here." />
        )}
      </Panel>
    </>
  );
}
