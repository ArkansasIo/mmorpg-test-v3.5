import React from 'react';

export const AdminTicketsTab: React.FC<Record<string, any>> = ({ children }) => (
  <section data-component="AdminTicketsTab" className="space-y-4">
    {children}
  </section>
);
