import React from 'react';

export const GateRoomTelemetryView: React.FC<Record<string, any>> = ({ children }) => (
  <section data-component="GateRoomTelemetryView" className="space-y-4">
    {children}
  </section>
);
