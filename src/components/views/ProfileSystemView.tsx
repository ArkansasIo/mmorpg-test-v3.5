import React from 'react';

export const ProfileSystemView: React.FC<Record<string, any>> = ({ children }) => (
  <section data-component="ProfileSystemView" className="space-y-4">
    {children}
  </section>
);
