"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Bell, Check, ExternalLink, X } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

interface NotificationItem {
  id: number;
  title: string;
  message: string;
  link?: string;
  is_read: boolean;
  created_at: string;
}

export function NotificationDrawer() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifs = async () => {
    if (!user) return;
    try {
      const data = await api.getNotifications();
      setNotifications(data);
      setUnreadCount(data.filter((n: NotificationItem) => !n.is_read).length);
    } catch (err) {
      console.warn("Could not fetch notifications:", err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifs();
      const interval = setInterval(fetchNotifs, 10000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const markRead = async (id: number) => {
    try {
      await api.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-600 hover:text-primary-container rounded-full hover:bg-slate-100 transition-colors focus:outline-none"
        title="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-sm">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          ></div>
          <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-white shadow-elevated border border-slate-200 z-50 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-primary-container" />
                <h3 className="text-sm font-semibold text-slate-800">
                  Platform Notifications
                </h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500">
                  No notifications yet. Status updates and triage alerts will appear here.
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-3.5 transition-colors ${
                      n.is_read ? "bg-white" : "bg-blue-50/50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs font-semibold text-slate-900">
                        {n.title}
                      </h4>
                      {!n.is_read && (
                        <button
                          onClick={() => markRead(n.id)}
                          className="text-[11px] text-blue-600 hover:text-blue-800 flex items-center gap-0.5"
                          title="Mark read"
                        >
                          <Check className="w-3 h-3" /> Read
                        </button>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-slate-600 line-clamp-2">
                      {n.message}
                    </p>
                    <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                      <span>
                        {new Date(n.created_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      {n.link && (
                        <Link
                          href={n.link}
                          onClick={() => {
                            markRead(n.id);
                            setIsOpen(false);
                          }}
                          className="font-medium text-primary-container hover:underline inline-flex items-center gap-0.5"
                        >
                          Open <ExternalLink className="w-3 h-3" />
                        </Link>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
