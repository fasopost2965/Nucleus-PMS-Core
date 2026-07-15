/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ConnectionLog {
  id: string;
  userName: string;
  userEmail: string;
  role: string;
  timestamp: string;
  type: 'Connexion' | 'Déconnexion' | 'Déconnexion (Inactivité)';
}

export interface TimesheetSession {
  id: string;
  userName: string;
  userEmail: string;
  startTime: string;
  endTime: string;
  hours: number;
  status: 'Validé' | 'En attente';
}

/**
 * Service to manage Connection Logging & Timesheet data persistence.
 */
export const timesheetService = {
  /**
   * Log a successful user login event
   */
  logLogin(user: { name: string; email: string; role: string }) {
    if (!user) return;
    try {
      const logs: ConnectionLog[] = JSON.parse(localStorage.getItem('pms_connection_journal') || '[]');
      const newLog: ConnectionLog = {
        id: `conn-${Date.now()}`,
        userName: user.name,
        userEmail: user.email,
        role: user.role,
        timestamp: new Date().toLocaleString('fr-FR'),
        type: 'Connexion'
      };
      logs.unshift(newLog);
      localStorage.setItem('pms_connection_journal', JSON.stringify(logs));
    } catch (e) {
      console.error('Error logging user login:', e);
    }
  },

  /**
   * Log a user logout event
   */
  logLogout(user: { name: string; email: string; role: string }) {
    if (!user) return;
    try {
      const logs: ConnectionLog[] = JSON.parse(localStorage.getItem('pms_connection_journal') || '[]');
      const newLog: ConnectionLog = {
        id: `conn-${Date.now()}`,
        userName: user.name,
        userEmail: user.email,
        role: user.role,
        timestamp: new Date().toLocaleString('fr-FR'),
        type: 'Déconnexion'
      };
      logs.unshift(newLog);
      localStorage.setItem('pms_connection_journal', JSON.stringify(logs));
    } catch (e) {
      console.error('Error logging user logout:', e);
    }
  },

  /**
   * Fetch all connection logs
   */
  getConnectionLogs(): ConnectionLog[] {
    try {
      return JSON.parse(localStorage.getItem('pms_connection_journal') || '[]');
    } catch (e) {
      return [];
    }
  },

  /**
   * Fetch connection logs for a specific user
   */
  getPersonalConnectionLogs(email: string): ConnectionLog[] {
    const logs = this.getConnectionLogs();
    return logs.filter(log => log.userEmail.toLowerCase().trim() === email.toLowerCase().trim());
  },

  /**
   * Fetch timesheet history for all users
   */
  getTimesheetHistory(): TimesheetSession[] {
    try {
      return JSON.parse(localStorage.getItem('pms_timesheet_history') || '[]');
    } catch (e) {
      return [];
    }
  },

  /**
   * Fetch timesheet history for a specific user
   */
  getPersonalTimesheetHistory(email: string): TimesheetSession[] {
    const history = this.getTimesheetHistory();
    return history.filter(session => session.userEmail.toLowerCase().trim() === email.toLowerCase().trim());
  }
};
