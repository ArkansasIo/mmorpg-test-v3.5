import React from 'react';

export const AdminMaintenanceTab: React.FC<Record<string, any>> = ({ children }) => (
  <section data-component="AdminMaintenanceTab" className="space-y-4">
    {children}
  </section>
);
