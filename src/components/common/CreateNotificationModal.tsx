import React, { useState } from 'react';
import { 
  X, 
  Send, 
  CheckCircle2, 
  Radio
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useCases } from '../../hooks/useCases';
import { useNotifications } from '../../hooks/useNotifications';
import { AgencyType, UserRole, ROXAS_BARANGAYS, NotificationItem } from '../../types';

interface CreateNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateNotificationModal: React.FC<CreateNotificationModalProps> = ({
  isOpen,
  onClose
}) => {
  const { currentUser } = useAuth();
  const { cases } = useCases();
  const { triggerNotification } = useNotifications();

  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<NotificationItem['type']>('advisory');
  const [priority, setPriority] = useState<'normal' | 'high' | 'urgent'>('normal');
  const [targetAgencyType, setTargetAgencyType] = useState<AgencyType | 'ALL'>('RESIDENT');
  const [targetBarangay, setTargetBarangay] = useState<string>(currentUser.barangay || 'San Aquilino');
  const [targetCaseId, setTargetCaseId] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    const targetAgencyTypes: AgencyType[] = targetAgencyType === 'ALL' 
      ? ['RESIDENT', 'MDRRMO', 'LGU', 'ADMIN'] 
      : [targetAgencyType];

    const targetRoles: UserRole[] | undefined = targetAgencyType === 'RESIDENT' 
      ? ['RESIDENT'] 
      : undefined;

    triggerNotification(
      title.trim(),
      message.trim(),
      type,
      targetCaseId.trim() || undefined,
      targetAgencyType === 'ALL' ? undefined : targetAgencyType,
      priority,
      {
        targetAgencyTypes,
        targetRoles,
        targetBarangay: targetAgencyType === 'RESIDENT' ? targetBarangay : undefined
      }
    );

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      setTitle('');
      setMessage('');
      setTargetCaseId('');
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-2 sm:p-4 z-50 animate-in fade-in duration-150">
      <div 
        id="modal-create-notification"
        className="bg-paper text-ink rounded-lg shadow-card border border-rule max-w-lg w-full overflow-hidden max-h-[92dvh] flex flex-col"
      >
        {/* Header */}
        <div className="p-4 bg-paper-2 border-b border-rule flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="p-1.5 bg-paper rounded-md border border-rule text-accent flex-shrink-0">
              <Radio className="w-5 h-5 motion-safe:animate-pulse" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-bold text-ink leading-tight truncate">
                Dispatch role notification
              </h2>
              <p className="text-xs text-muted truncate">
                Logged in: <span className="font-semibold text-ink">{currentUser.name}</span> ({currentUser.agencyType})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-muted hover:text-ink hover:bg-paper-3 rounded-md transition-colors cursor-pointer flex-shrink-0 ml-2 focus-visible:ring-2 focus-visible:ring-focus"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        {isSuccess ? (
          <div className="p-6 sm:p-8 text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-paper-2 text-accent flex items-center justify-center mx-auto border border-rule">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-ink">Notification dispatched successfully</h3>
            <p className="text-xs text-muted">
              Your message has been targeted and delivered strictly to authorized {targetAgencyType === 'ALL' ? 'all network roles' : `${targetAgencyType} users`}.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
            {/* Target Role / Agency */}
            <div>
              <label className="block text-xs font-semibold text-ink mb-1.5">
                Target role audience
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'RESIDENT', label: 'Residents only', desc: 'Citizens of Roxas' },
                  { id: 'MDRRMO', label: 'MDRRMO rescue', desc: 'Emergency operations' },
                  { id: 'LGU', label: 'LGU municipal', desc: 'Mayor & executive' },
                  { id: 'ALL', label: 'All agencies', desc: 'Broadcast network' }
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setTargetAgencyType(item.id as any)}
                    className={`p-2 rounded-md text-left border transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-focus active:translate-y-px disabled:opacity-50 disabled:cursor-not-allowed ${
                      targetAgencyType === item.id
                        ? 'bg-paper-3 border-accent text-ink font-semibold'
                        : 'border-rule hover:bg-paper-2 text-ink bg-paper'
                    }`}
                  >
                    <div className="text-xs font-semibold truncate">{item.label}</div>
                    <div className="text-xs text-muted truncate">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Target Barangay (if targeting residents) */}
            {targetAgencyType === 'RESIDENT' && (
              <div>
                <label className="block text-xs font-semibold text-ink mb-1.5">
                  Target barangay location
                </label>
                <select
                  value={targetBarangay}
                  onChange={(e) => setTargetBarangay(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-rule rounded-md focus:ring-2 focus:ring-focus focus:outline-hidden bg-paper-2 font-medium text-ink transition-colors"
                >
                  <option value="ALL">All Barangays (Municipality-Wide Residents)</option>
                  {ROXAS_BARANGAYS.map((b) => (
                    <option key={b} value={b}>
                      Barangay {b}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-ink mb-1.5">
                Notification headline or title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g., Lupon conciliation summons notice or public advisory"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-1.5 text-xs border border-rule rounded-md focus:bg-paper focus:ring-2 focus:ring-focus focus:outline-hidden bg-paper-2 text-ink placeholder:text-muted transition-colors"
              />
            </div>

            {/* Message */}
            <div>
              <label className="block text-xs font-semibold text-ink mb-1.5">
                Notification message details *
              </label>
              <textarea
                required
                rows={3}
                placeholder="Enter detailed notice or instructions for the recipient..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-3 py-1.5 text-xs border border-rule rounded-md focus:bg-paper focus:ring-2 focus:ring-focus focus:outline-hidden bg-paper-2 text-ink placeholder:text-muted resize-none transition-colors"
              />
            </div>

            {/* Notification Type and Priority */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-ink mb-1.5">
                  Category type
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full px-3 py-1.5 text-xs border border-rule rounded-md focus:ring-2 focus:ring-focus focus:outline-hidden bg-paper-2 font-medium text-ink transition-colors"
                >
                  <option value="advisory">Public / community advisory</option>
                  <option value="hearing">Lupon hearing / summons</option>
                  <option value="pending_alert">Urgent action / alert</option>
                  <option value="referral">Inter-agency referral</option>
                  <option value="recommendation">DILG directive / compliance</option>
                  <option value="system">System notice</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink mb-1.5">
                  Priority level
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full px-3 py-1.5 text-xs border border-rule rounded-md focus:ring-2 focus:ring-focus focus:outline-hidden bg-paper-2 font-medium text-ink transition-colors"
                >
                  <option value="normal">Normal priority</option>
                  <option value="high">High priority</option>
                  <option value="urgent">Urgent / immediate action</option>
                </select>
              </div>
            </div>

            {/* Optional Related Case */}
            <div>
              <label className="block text-xs font-semibold text-ink mb-1.5">
                Related case docket ID (optional)
              </label>
              <select
                value={targetCaseId}
                onChange={(e) => setTargetCaseId(e.target.value)}
                className="w-full px-3 py-1.5 text-xs border border-rule rounded-md focus:ring-2 focus:ring-focus focus:outline-hidden bg-paper-2 font-medium text-ink transition-colors num"
              >
                <option value="">-- No Specific Case (General Announcement) --</option>
                {cases.slice(0, 10).map((c) => (
                  <option key={c.id} value={c.id}>
                    #{c.id} - {c.title.substring(0, 40)}... (Brgy. {c.barangay})
                  </option>
                ))}
              </select>
            </div>

            {/* Action Buttons */}
            <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-rule">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 text-xs font-semibold text-muted hover:text-ink bg-paper-2 hover:bg-paper-3 rounded-md transition-colors cursor-pointer border border-rule focus-visible:ring-2 focus-visible:ring-focus active:translate-y-px disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                id="btn-submit-role-notification"
                type="submit"
                className="px-4 py-1.5 text-xs font-semibold text-accent-ink bg-accent hover:opacity-90 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer focus-visible:ring-2 focus-visible:ring-focus active:translate-y-px disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Dispatch notification</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
