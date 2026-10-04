import React from 'react';

export const SpyView: React.FC<Record<string, any>> = ({ children }) => (
  <section data-component="SpyView" className="space-y-4">
    {children}
  </section>
);
