import React from 'react';

export const TurnSystemView: React.FC<Record<string, any>> = ({ children }) => (
  <section data-component="TurnSystemView" className="space-y-4">
    {children}
  </section>
);
