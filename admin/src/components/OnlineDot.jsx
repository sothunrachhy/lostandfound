import React from 'react';

/**
 * Presence indicator shown on a user's avatar: green when online, grey when not.
 *
 * The server decides who counts as online — a user is online if their last
 * heartbeat landed within the last 2 minutes — and sends it as `isOnline`.
 * Never infer it on the client (an admin is not online just for being an admin).
 *
 * The parent element must be positioned, e.g. `className="relative"`.
 */
export function isUserOnline(user) {
  return user?.isOnline === true || user?.IsOnline === true;
}

const SIZES = {
  sm: 'w-2.5 h-2.5',
  md: 'w-3 h-3',
  lg: 'w-4 h-4',
};

export default function OnlineDot({ user, online, size = 'md' }) {
  const isOnline = typeof online === 'boolean' ? online : isUserOnline(user);
  const label = isOnline ? 'Online' : 'Offline';

  return (
    <span
      className={`absolute -bottom-0.5 -right-0.5 ${SIZES[size] || SIZES.md} rounded-full border-2 border-white shadow-xs ${
        isOnline ? 'bg-emerald-500' : 'bg-slate-300'
      }`}
      title={label}
      aria-label={label}
      role="img"
    />
  );
}
