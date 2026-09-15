import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  CheckCheck,
  Sparkles,
  Calendar,
  Users2,
  AlertTriangle,
  Info,
  ArrowRight
} from 'lucide-react';
import { campusApi } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import { NotificationItem } from '../types';

export const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();
  const navigate = useNavigate();

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const res = await campusApi.getNotifications();
      setNotifications(res.data.notifications || []);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkRead = async (id: string, linkUrl?: string | null) => {
    try {
      await campusApi.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      if (linkUrl) {
        navigate(linkUrl);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await campusApi.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      showToast('All notifications marked as read.', 'success');
    } catch (err) {
      console.error(err);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'MATCH':
        return <Sparkles className="w-4 h-4 text-amber-500" />;
      case 'EVENT':
        return <Calendar className="w-4 h-4 text-purple-500" />;
      case 'ROOMMATE':
        return <Users2 className="w-4 h-4 text-indigo-500" />;
      case 'ALERT':
        return <AlertTriangle className="w-4 h-4 text-rose-500" />;
      case 'ANNOUNCEMENT':
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Bell className="w-6 h-6 text-brand-600" />
            Notification Center
          </h1>
          <p className="text-xs text-slate-500">
            Real-time updates on lost & found matches, roommate connection requests, and event reminders
          </p>
        </div>

        {notifications.some((n) => !n.isRead) && (
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-brand-600 hover:bg-brand-50 border border-brand-200 transition-colors"
          >
            <CheckCheck className="w-4 h-4" />
            Mark All Read
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs divide-y divide-slate-100 overflow-hidden">
        {notifications.map((n) => (
          <div
            key={n.id}
            onClick={() => handleMarkRead(n.id, n.linkUrl)}
            className={`p-4 sm:p-5 flex items-start gap-4 transition-colors cursor-pointer hover:bg-slate-50/80 ${
              !n.isRead ? 'bg-indigo-50/40' : 'bg-white'
            }`}
          >
            <div className="w-9 h-9 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center justify-center flex-shrink-0 mt-0.5">
              {getNotificationIcon(n.type)}
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <h3 className={`text-sm ${!n.isRead ? 'font-bold text-slate-900' : 'font-semibold text-slate-700'}`}>
                  {n.title}
                </h3>
                <span className="text-[11px] text-slate-400 font-medium">
                  {new Date(n.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">{n.message}</p>
            </div>

            {!n.isRead && (
              <span className="w-2 h-2 rounded-full bg-brand-600 flex-shrink-0 mt-2" />
            )}
          </div>
        ))}

        {notifications.length === 0 && (
          <div className="py-16 text-center text-slate-400">
            <Bell className="w-12 h-12 mx-auto text-slate-300 mb-2" />
            <div className="text-sm font-semibold">No notifications right now</div>
            <p className="text-xs text-slate-400 mt-1">Campus alerts and updates will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
};
