import React from 'react';

export const MoonBaseView: React.FC<Record<string, any>> = ({ children }) => (
  <section data-component="MoonBaseView" className="space-y-4">
    {children}
  </section>
);
