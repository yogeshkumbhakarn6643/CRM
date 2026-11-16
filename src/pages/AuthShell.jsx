import { Brand, LanguageMenu } from '../components/Layout.jsx';
import { Icon } from '../components/Icons.jsx';
import { useStore } from '../store/AppStore.jsx';

export default function AuthShell({ children, story }) {
  const { state, dispatch } = useStore();
  const dark = state.prefs.theme === 'dark';
  return (
    <main className="auth">
      <section className="auth-brand" aria-label="NovaTrade">
        <div className="auth-brand__top">
          <Brand to="/login" className="brand--light" />
          <p className="auth-brand__label">Trader portal</p>
        </div>
        <div className="auth-story">
          <h2>{story?.title || 'Your accounts. One clear view.'}</h2>
          <p>{story?.text || 'Balances, funding and onboarding stay in this CRM view. No dealing or order tools.'}</p>
        </div>
        <ul className="auth-caps">
          <li>
            <span>01</span>
            <strong>Accounts</strong>
          </li>
          <li>
            <span>02</span>
            <strong>Fund</strong>
          </li>
          <li>
            <span>03</span>
            <strong>Support</strong>
          </li>
        </ul>
      </section>
      <section className="auth-entry">
        <div className="auth-utils">
          <button
            type="button"
            role="switch"
            aria-checked={dark}
            className={`appearance-switch ${dark ? 'is-dark' : ''}`}
            onClick={() => dispatch({ type: 'prefs', prefs: { theme: dark ? 'light' : 'dark' } })}
            aria-label="Toggle theme"
          >
            <span className="appearance-switch__thumb" />
            <Icon.sun width={14} height={14} />
            <Icon.moon width={14} height={14} />
          </button>
          <LanguageMenu />
        </div>
        <div className="auth-entry__content">{children}</div>
        <p className="auth-foot">NOVATRADE · DEMO</p>
      </section>
    </main>
  );
}
