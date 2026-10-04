import React from 'react';

export const UniverseView: React.FC<Record<string, any>> = ({ children }) => (
  <section data-component="UniverseView" className="space-y-4">
    {children}
  </section>
);
