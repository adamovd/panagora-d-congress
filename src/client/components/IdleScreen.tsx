import SafeArea from '@/components/SafeArea';
import '@/styles/IdleScreen.scss';

/**
 * The idle/welcome screen — bright green background
 * with the Panagora "P" logo and "Press the button" prompt.
 */
export default function IdleScreen() {
  return (
    <div className="idle-screen">
      <SafeArea>
        <div className="idle-screen__content">
          <img
            className="idle-screen__logo"
            src="/assets/panagora-logo.svg"
            alt="Panagora"
          />
          <p className="idle-screen__prompt">
            Press the button and
            <br />
            see your future success
          </p>
        </div>
      </SafeArea>
    </div>
  );
}
