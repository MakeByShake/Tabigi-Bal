import { createContext, useContext } from 'react';

// { call(action, body?, query?), notify(message, kind?) }
export const AdminContext = createContext(null);
export const useAdmin = () => useContext(AdminContext);
