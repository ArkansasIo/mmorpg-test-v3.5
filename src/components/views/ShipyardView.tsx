import React from 'react';

export const ShipyardView: React.FC<Record<string, any>> = ({ children }) => (
  <section data-component="ShipyardView" className="space-y-4">
    {children}
  </section>
);
