/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Building, 
  Users 
} from 'lucide-react';
import { IHRMSDepartment, IHRMSTeam, IHRMSEmployee } from '../../types';

interface HRMSTeamsProps {
  departments: IHRMSDepartment[];
  teams: IHRMSTeam[];
  employees: IHRMSEmployee[];
}

export default function HRMSTeams({
  departments,
  teams,
  employees
}: HRMSTeamsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="hrms-teams-root">
      
      {/* Column 1: Departments / Cost Centers */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs text-left">
        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
          <h3 className="text-slate-800 font-bold text-sm flex items-center gap-2">
            <Building className="w-4.5 h-4.5 text-brand-orange" />
            Départements & Centres de Coût
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">Codes d'imputations analytiques uniques</p>
        </div>

        <div className="divide-y divide-slate-100 p-2">
          {departments.map(dept => {
            const manager = employees.find(e => e.id === dept.manager_id);
            const staffCount = employees.filter(e => e.department_id === dept.id).length;

            return (
              <div key={dept.id} className="p-4 flex items-center justify-between gap-4 transition-all hover:bg-slate-50/40 rounded-xl">
                <div>
                  <h4 className="text-slate-800 font-bold text-sm">{dept.name}</h4>
                  <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5 flex-wrap">
                    Code : <span className="text-brand-orange font-mono font-bold bg-orange-50 px-2 py-0.5 rounded text-[10px] border border-orange-100">{dept.code}</span>
                    • Analytique : <span className="font-mono text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded text-[10px] border border-slate-150">{dept.cost_center_code}</span>
                  </p>
                  {manager && (
                    <p className="text-[10px] text-slate-400 mt-1.5 font-medium">
                      Chef de service : {manager.first_name} {manager.last_name}
                    </p>
                  )}
                </div>

                <div className="text-right">
                  <span className="text-base font-black text-slate-700 font-mono">{staffCount}</span>
                  <p className="text-[9px] text-slate-400 uppercase tracking-wider">Salariés</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Column 2: Operational Brigades / Teams */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs text-left">
        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <div>
            <h3 className="text-slate-800 font-bold text-sm flex items-center gap-2">
              <Users className="w-4.5 h-4.5 text-indigo-500" />
              Équipes & Brigades Opérationnelles
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Shifts de terrain, hébergement & restauration</p>
          </div>
          <span className="text-[9px] bg-indigo-50 text-indigo-500 px-2 py-0.5 rounded-full border border-indigo-150 font-bold font-mono uppercase">
            hrms_teams
          </span>
        </div>

        <div className="divide-y divide-slate-100 p-2">
          {teams.map(team => {
            const dept = departments.find(d => d.id === team.department_id);
            const supervisor = employees.find(e => e.id === team.supervisor_id);
            const teamMembersCount = employees.filter(e => e.team_id === team.id).length;

            return (
              <div key={team.id} className="p-4 flex items-center justify-between gap-4 transition-all hover:bg-slate-50/40 rounded-xl">
                <div>
                  <h4 className="text-slate-800 font-bold text-sm flex items-center gap-1.5">
                    {team.name}
                    <span className="text-[10px] bg-slate-100 text-slate-500 font-mono px-2 py-0.5 rounded border border-slate-200">
                      {team.code}
                    </span>
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Département : <span className="text-indigo-600 font-medium">{dept?.name}</span>
                  </p>
                  {supervisor && (
                    <p className="text-[10px] text-slate-400 mt-1.5 font-medium">
                      Superviseur de brigade : {supervisor.first_name} {supervisor.last_name}
                    </p>
                  )}
                </div>

                <div className="text-right">
                  <span className="text-base font-black text-slate-700 font-mono">{teamMembersCount}</span>
                  <p className="text-[9px] text-slate-400 uppercase tracking-wider">Membres</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
