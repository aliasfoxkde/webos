import React from 'react';
import { Clock } from './Clock';

export function SystemTray() {
  return (
    <div className="flex items-center gap-2 px-2">
      <Clock />
    </div>
  );
}
