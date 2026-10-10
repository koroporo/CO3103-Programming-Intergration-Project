import { useContext } from 'react';
import AuthContext from '../../contexts/Authentication/authContext';

export function useAuth() {
  return useContext(AuthContext);
}
