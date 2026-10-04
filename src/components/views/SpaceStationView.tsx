import React from 'react';

export const SpaceStationView: React.FC<Record<string, any>> = ({ children }) => (
  <section data-component="SpaceStationView" className="space-y-4">
    {children}
  </section>
);
