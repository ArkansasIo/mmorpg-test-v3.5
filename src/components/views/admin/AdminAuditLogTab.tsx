import React from 'react';

export const AdminAuditLogTab: React.FC<Record<string, any>> = ({ children }) => (
  <section data-component="AdminAuditLogTab" className="space-y-4">
    {children}
  </section>
);
