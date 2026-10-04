import React from 'react';

export const AdminUsersTab: React.FC<Record<string, any>> = ({ children }) => (
  <section data-component="AdminUsersTab" className="space-y-4">
    {children}
  </section>
);
