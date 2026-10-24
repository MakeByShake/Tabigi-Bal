import { useCart } from '../context/cart';
import { CheckIcon } from './Icons';

export default function Notification() {
  const { toast } = useCart();

  return (
    <div className="toast-region" role="status" aria-live="polite">
      {toast && (
        <div className="toast" key={toast.key}>
          <span className="toast-icon"><CheckIcon width={16} height={16} /></span>
          {toast.message}
        </div>
      )}
    </div>
  );
}
