import React from 'react';

export const ShipFittingView: React.FC<Record<string, any>> = ({ children }) => (
  <section data-component="ShipFittingView" className="space-y-4">
    {children}
  </section>
);
