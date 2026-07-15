/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback } from 'react';
import { timesheetService } from '../utils/timesheetService';

interface LogUser {
  name: string;
  email: string;
  role: string;
}

/**
 * Custom hook to manage timesheet and connection logs during login and logout actions.
 */
export function useTimesheetLog() {
  const logLogin = useCallback((user: LogUser) => {
    if (!user) return;
    timesheetService.logLogin(user);
  }, []);

  const logLogout = useCallback((user: LogUser) => {
    if (!user) return;
    timesheetService.logLogout(user);
  }, []);

  return { logLogin, logLogout };
}
