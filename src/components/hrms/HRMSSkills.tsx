/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Award, 
  Plus, 
  ShieldAlert, 
  CheckCircle2 
} from 'lucide-react';
import { IHRMSEmployee, IHRMSSkill, IHRMSEmployeeSkill } from '../../types';

interface HRMSSkillsProps {
  employees: IHRMSEmployee[];
  skills: IHRMSSkill[];
  employeeSkills: IHRMSEmployeeSkill[];
  setShowAddSkillModal: (show: boolean) => void;
  setNewSkillForm: React.Dispatch<React.SetStateAction<any>>;
}

export default function HRMSSkills({
  employees,
  skills,
  employeeSkills,
  setShowAddSkillModal,
  setNewSkillForm
}: HRMSSkillsProps) {

  const triggerAssignSkillModal = (employeeId?: string) => {
    setNewSkillForm({
      employee_id: employeeId || employees[0]?.id || '',
      skill_id: skills[0]?.id || '',
      level: 'beginner',
      certified: true,
      issued_at: new Date().toISOString().split('T')[0],
      expires_at: ''
    });
    setShowAddSkillModal(true);
  };

  return (
    <div className="space-y-6" id="hrms-skills-root">
      
      {/* 1. Sanitation regulations alert banner */}
      <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl flex items-start gap-3 text-left">
        <ShieldAlert className="w-5 h-5 text-warning mt-0.5 flex-shrink-0" />
        <div>
          <h4 className="text-[#92400e] font-bold text-sm">Normes HACCP & Hygiène Restauration / Bar (Sécurité Légale)</h4>
          <p className="text-xs text-[#7c2d12] leading-relaxed mt-1">
            Les brigades de cuisine et de salle doivent détenir des habilitations de salubrité à jour. Ce tableau de bord permet de croiser les fiches d'employés avec leurs certificats validés pour prévenir tout risque sanitaire légal.
          </p>
        </div>
      </div>

      {/* 2. Main split view */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left column: Employee Skills list */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <h3 className="text-slate-800 font-bold text-sm flex items-center gap-2">
                <Award className="w-4.5 h-4.5 text-brand-orange" />
                Matrice des Habilitations du Personnel
              </h3>
              <button 
                onClick={() => triggerAssignSkillModal()}
                className="px-3 py-1.5 bg-brand-orange hover:bg-brand-orange-hover text-white rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" /> Associer un brevet
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {employees.map(emp => {
                const empSkills = employeeSkills.filter(es => es.employee_id === emp.id);

                return (
                  <div key={emp.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                        <h4 className="text-slate-800 font-bold text-sm">
                          {emp.first_name} {emp.last_name}
                        </h4>
                        <span className="text-[10px] text-slate-400 font-mono">({emp.employee_code})</span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium pl-3.5">
                        {emp.employee_type === 'EXTRA' ? 'Collaborateur Temporaire' : 'Collaborateur Permanent'}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2 justify-end">
                      {empSkills.map(es => {
                        const skillDef = skills.find(s => s.id === es.skill_id);
                        if (!skillDef) return null;

                        return (
                          <div 
                            key={es.id} 
                            className="bg-slate-50 border border-slate-200 hover:border-slate-300 px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition text-xs shadow-3xs"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                            <div>
                              <p className="text-slate-700 font-bold text-[11px] leading-tight">{skillDef.name}</p>
                              <p className="text-[9px] text-slate-400 uppercase tracking-wide">Niveau: {es.level}</p>
                            </div>
                          </div>
                        );
                      })}

                      {empSkills.length === 0 && (
                        <span className="text-xs text-slate-400 italic">Aucun brevet certifié enregistré</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right column: Reference catalogs */}
        <div className="space-y-4 text-left">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <h3 className="text-slate-800 font-bold text-sm border-b border-slate-100 pb-3 mb-3">
              Catalogue de Certifications Référencées
            </h3>
            
            <div className="space-y-3">
              {skills.map(sk => (
                <div key={sk.id} className="bg-slate-50 border border-slate-150 p-3 rounded-xl">
                  <h4 className="text-slate-800 font-bold text-xs flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-orange"></span>
                    {sk.name}
                  </h4>
                  <p className="text-[11px] text-slate-500 leading-normal mt-1 pl-3">
                    {sk.description}
                  </p>
                  <span className="inline-block mt-2 pl-3 text-[9px] text-brand-orange font-bold uppercase tracking-wider">
                    Catégorie: {sk.category.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
