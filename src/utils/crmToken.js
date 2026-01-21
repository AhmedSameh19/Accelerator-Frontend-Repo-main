import Cookies from 'js-cookie';
import { CRM_ACCESS_TOKEN_KEY } from './tokenKeys';

export function getCrmAccessToken() {
  return Cookies.get(CRM_ACCESS_TOKEN_KEY);
}

export function isCrmAuthenticated() {
  return Boolean(getCrmAccessToken());
}
