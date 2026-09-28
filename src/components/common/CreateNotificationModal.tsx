import React, { useState } from 'react';
import { 
  X, 
  Send, 
  Bell, 
  Shield, 
  Building2, 
  Landmark, 
  CheckCircle2, 
  AlertTriangle,
  FileText,
  Radio,
  Users
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
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div 
        id="modal-create-notification"
        className="bg-white rounded-3xl shadow-2xl border border-emerald-100 max-w-lg w-full overflow-hidden"
      >
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 border border-emerald-400/30 rounded-xl text-emerald-300">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white leading-tight">
                Create & Dispatch Role Notification
              </h2>
              <p className="text-xs text-emerald-200/80">
                Logged in as: <span className="font-semibold text-white">{currentUser.name}</span> ({currentUser.agencyType})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-emerald-200 hover:text-white hover:bg-white/10 rounded-full transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        {isSuccess ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Notification Dispatched Successfully!</h3>
            <p className="text-xs text-slate-500">
              Your message has been targeted and delivered strictly to authorized {targetAgencyType === 'ALL' ? 'all network roles' : `${targetAgencyType} users`}.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Target Role / Agency */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-tight mb-1.5">
                Target Role Audience
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'RESIDENT', label: 'Residents Only', desc: 'Citizens of Roxas' },
                  { id: 'MDRRMO', label: 'MDRRMO Rescue', desc: 'Emergency Operations' },
                  { id: 'LGU', label: 'LGU Municipal', desc: 'Mayor & Executive' },
                  { id: 'ALL', label: 'All Agencies', desc: 'Broadcast Network' }
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setTargetAgencyType(item.id as any)}
                    className={`p-2 rounded-xl text-left border transition cursor-pointer ${
                      targetAgencyType === item.id
                        ? 'bg-emerald-50 border-emerald-600 text-emerald-950 font-bold ring-1 ring-emerald-600'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                    }`}
                  >
                    <div className="text-[11px] font-bold truncate">{item.label}</div>
                    <div className="text-[9px] text-slate-400 truncate">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Target Barangay (if targeting residents) */}
            {targetAgencyType === 'RESIDENT' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-tight mb-1.5">
                  Target Barangay Location
                </label>
                <select
                  value={targetBarangay}
                  onChange={(e) => setTargetBarangay(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden bg-slate-50 font-medium text-slate-800"
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
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-tight mb-1.5">
                Notification Headline / Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g., Lupon Conciliation Summons Notice or Public Advisory"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden text-slate-800 placeholder-slate-400"
              />
            </div>

            {/* Message */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-tight mb-1.5">
                Notification Message Details *
              </label>
              <textarea
                required
                rows={3}
                placeholder="Enter detailed notice or instructions for the recipient..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden text-slate-800 placeholder-slate-400 resize-none"
              />
            </div>

            {/* Notification Type and Priority */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-tight mb-1.5">
                  Category Type
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden bg-slate-50 font-medium text-slate-800"
                >
                  <option value="advisory">Public / Community Advisory</option>
                  <option value="hearing">Lupon Hearing / Summons</option>
                  <option value="pending_alert">Urgent Action / Alert</option>
                  <option value="referral">Inter-Agency Referral</option>
                  <option value="recommendation">DILG Directive / Compliance</option>
                  <option value="system">System Notice</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-tight mb-1.5">
                  Priority Level
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden bg-slate-50 font-medium text-slate-800"
                >
                  <option value="normal">Normal Priority</option>
                  <option value="high">High Priority</option>
                  <option value="urgent">Urgent / Immediate Action</option>
                </select>
              </div>
            </div>

            {/* Optional Related Case */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-tight mb-1.5">
                Related Case Docket ID (Optional)
              </label>
              <select
                value={targetCaseId}
                onChange={(e) => setTargetCaseId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden bg-slate-50 font-medium text-slate-800"
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
            <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                id="btn-submit-role-notification"
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Dispatch Notification</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
