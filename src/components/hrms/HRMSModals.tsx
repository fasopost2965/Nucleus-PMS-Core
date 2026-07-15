/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { 
  IHRMSDepartment, 
  IHRMSJob, 
  IHRMSTeam, 
  IHRMSEmployee, 
  IHRMSSkill 
} from '../../types';

interface HRMSModalsProps {
  // Add Employee Modal
  showAddEmployeeModal: boolean;
  setShowAddEmployeeModal: (show: boolean) => void;
  departments: IHRMSDepartment[];
  jobs: IHRMSJob[];
  teams: IHRMSTeam[];
  newEmpForm: any;
  setNewEmpForm: React.Dispatch<React.SetStateAction<any>>;
  handleCreateEmployee: (e: React.FormEvent) => void;

  // Add Contract Modal
  showAddContractModal: boolean;
  setShowAddContractModal: (show: boolean) => void;
  employees: IHRMSEmployee[];
  newContractForm: any;
  setNewContractForm: React.Dispatch<React.SetStateAction<any>>;
  handleCreateContract: (e: React.FormEvent) => void;

  // Add Skill Modal
  showAddSkillModal: boolean;
  setShowAddSkillModal: (show: boolean) => void;
  skills: IHRMSSkill[];
  newSkillForm: any;
  setNewSkillForm: React.Dispatch<React.SetStateAction<any>>;
  handleAssignSkill: (e: React.FormEvent) => void;
}

export default function HRMSModals({
  showAddEmployeeModal,
  setShowAddEmployeeModal,
  departments,
  jobs,
  teams,
  newEmpForm,
  setNewEmpForm,
  handleCreateEmployee,

  showAddContractModal,
  setShowAddContractModal,
  employees,
  newContractForm,
  setNewContractForm,
  handleCreateContract,

  showAddSkillModal,
  setShowAddSkillModal,
  skills,
  newSkillForm,
  setNewSkillForm,
  handleAssignSkill
}: HRMSModalsProps) {
  return (
    <div id="hrms-modals-root">
      
      {/* --- MODAL 1: ADD EMPLOYEE (ATS to Employee transaction) --- */}
      <AnimatePresence>
        {showAddEmployeeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div 
              className="fixed inset-0 bg-black/40 backdrop-blur-xs"
              onClick={() => setShowAddEmployeeModal(false)}
            ></div>
            
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl relative z-10 flex flex-col max-h-[90vh]"
            >
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-slate-800 text-base">Déclarer un recrutement (ATS → Registre Salarié)</h3>
                  <p className="text-[11px] text-slate-500">Intégrez une recrue validée et générez son dossier de façon sécurisée</p>
                </div>
                <button 
                  onClick={() => setShowAddEmployeeModal(false)} 
                  className="text-slate-400 hover:text-slate-600 p-1 bg-slate-100 rounded-lg transition"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              <form onSubmit={handleCreateEmployee} className="p-6 space-y-4 overflow-y-auto flex-1 text-left">
                
                {/* 1. Identity & Profile info */}
                <div className="space-y-2.5">
                  <h4 className="text-[10px] text-brand-orange uppercase tracking-widest font-bold">1. État Civil & Identité administrative</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Nom de Famille *</label>
                      <input 
                        type="text" 
                        required
                        value={newEmpForm.last_name}
                        onChange={(e) => setNewEmpForm({...newEmpForm, last_name: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 focus:border-brand-orange focus:ring-1 focus:ring-brand-orange rounded-lg p-2 text-xs text-slate-700 outline-none transition"
                        placeholder="Ex: COULIBALY"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Prénoms *</label>
                      <input 
                        type="text" 
                        required
                        value={newEmpForm.first_name}
                        onChange={(e) => setNewEmpForm({...newEmpForm, first_name: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 focus:border-brand-orange focus:ring-1 focus:ring-brand-orange rounded-lg p-2 text-xs text-slate-700 outline-none transition"
                        placeholder="Ex: Ibrahim Amadou"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">N° CNPS (Sécurité Sociale Ivoirienne) *</label>
                      <input 
                        type="text" 
                        required
                        value={newEmpForm.cnps_number}
                        onChange={(e) => setNewEmpForm({...newEmpForm, cnps_number: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 focus:border-brand-orange focus:ring-1 focus:ring-brand-orange rounded-lg p-2 text-xs text-slate-700 font-mono outline-none transition"
                        placeholder="Format : 1-XXXXXX-XX"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">N° Pièce d'Identité (CNI / Passeport) *</label>
                      <input 
                        type="text" 
                        required
                        value={newEmpForm.national_id_number}
                        onChange={(e) => setNewEmpForm({...newEmpForm, national_id_number: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 focus:border-brand-orange focus:ring-1 focus:ring-brand-orange rounded-lg p-2 text-xs text-slate-700 font-mono outline-none transition"
                        placeholder="N° CNI ou Passeport national"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Professional posting */}
                <div className="space-y-2.5 pt-3 border-t border-slate-100">
                  <h4 className="text-[10px] text-brand-orange uppercase tracking-widest font-bold">2. Affectation Professionnelle & Type</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Département *</label>
                      <select 
                        value={newEmpForm.department_id}
                        onChange={(e) => setNewEmpForm({...newEmpForm, department_id: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 focus:border-brand-orange rounded-lg p-2 text-xs text-slate-700 outline-none transition"
                      >
                        {departments.map(d => (
                          <option key={d.id} value={d.id} className="text-slate-800">{d.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Fiche de Poste / Job *</label>
                      <select 
                        value={newEmpForm.job_id}
                        onChange={(e) => setNewEmpForm({...newEmpForm, job_id: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 focus:border-brand-orange rounded-lg p-2 text-xs text-slate-700 outline-none transition"
                      >
                        {jobs.map(j => (
                          <option key={j.id} value={j.id} className="text-slate-800">{j.title}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Équipe Affectée</label>
                      <select 
                        value={newEmpForm.team_id}
                        onChange={(e) => setNewEmpForm({...newEmpForm, team_id: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 focus:border-brand-orange rounded-lg p-2 text-xs text-slate-700 outline-none transition"
                      >
                        <option value="" className="text-slate-800">Aucune (Hors équipe)</option>
                        {teams.map(t => (
                          <option key={t.id} value={t.id} className="text-slate-800">{t.name} ({t.code})</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Type de Contrat Global</label>
                      <select 
                        value={newEmpForm.employee_type}
                        onChange={(e) => setNewEmpForm({...newEmpForm, employee_type: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 focus:border-brand-orange rounded-lg p-2 text-xs text-slate-700 outline-none transition"
                      >
                        <option value="FULL_TIME" className="text-slate-800">Plein Temps CDI</option>
                        <option value="PART_TIME" className="text-slate-800">Temps Partiel</option>
                        <option value="EXTRA" className="text-slate-800">Extra / Tâche Journalière</option>
                        <option value="SEASONAL" className="text-slate-800">Saisonnier</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">E-mail Professionnel *</label>
                      <input 
                        type="email" 
                        required
                        value={newEmpForm.email}
                        onChange={(e) => setNewEmpForm({...newEmpForm, email: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 focus:border-brand-orange focus:ring-1 focus:ring-brand-orange rounded-lg p-2 text-xs text-slate-700 outline-none transition"
                        placeholder="nom@brunchbouake.ci"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">N° Téléphone *</label>
                      <input 
                        type="text" 
                        required
                        value={newEmpForm.phone}
                        onChange={(e) => setNewEmpForm({...newEmpForm, phone: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 focus:border-brand-orange focus:ring-1 focus:ring-brand-orange rounded-lg p-2 text-xs text-slate-700 outline-none transition"
                        placeholder="+225 07..."
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Initial Contract settings */}
                <div className="space-y-2.5 pt-3 border-t border-slate-100">
                  <h4 className="text-[10px] text-brand-orange uppercase tracking-widest font-bold">3. Contrat d'Embauche Immédiat</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Type de Contrat</label>
                      <select 
                        value={newEmpForm.contract_type}
                        onChange={(e) => setNewEmpForm({...newEmpForm, contract_type: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 focus:border-brand-orange rounded-lg p-2 text-xs text-slate-700 outline-none transition"
                      >
                        <option value="CDI" className="text-slate-800">CDI (Indéterminé)</option>
                        <option value="CDD" className="text-slate-800">CDD (Déterminé)</option>
                        <option value="EXTRA" className="text-slate-800">Extra à la tâche</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Salaire de Base Brut</label>
                      <input 
                        type="number" 
                        value={newEmpForm.base_salary}
                        onChange={(e) => setNewEmpForm({...newEmpForm, base_salary: Number(e.target.value)})}
                        className="w-full bg-slate-50 border border-slate-200 focus:border-brand-orange focus:ring-1 focus:ring-brand-orange rounded-lg p-2 text-xs text-slate-700 font-mono outline-none transition"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Devise du Contrat (i18n)</label>
                      <select 
                        value={newEmpForm.currency}
                        onChange={(e) => setNewEmpForm({...newEmpForm, currency: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 focus:border-brand-orange rounded-lg p-2 text-xs text-slate-700 font-mono outline-none transition"
                      >
                        <option value="XOF" className="text-slate-800">XOF (FCFA)</option>
                        <option value="EUR" className="text-slate-800">EUR (€)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* 4. Payment channel parameters */}
                <div className="space-y-2.5 pt-3 border-t border-slate-100">
                  <h4 className="text-[10px] text-brand-orange uppercase tracking-widest font-bold">4. Mode de Paiement et RIB (Multi-canal)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Canal de Règlement Préféré</label>
                      <select 
                        value={newEmpForm.payment_method}
                        onChange={(e) => setNewEmpForm({...newEmpForm, payment_method: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 focus:border-brand-orange rounded-lg p-2 text-xs text-slate-700 outline-none transition"
                      >
                        <option value="bank_transfer" className="text-slate-800">Virement Bancaire Réglementaire</option>
                        <option value="mobile_money" className="text-slate-800">Mobile Money (Wave / Orange / MTN)</option>
                        <option value="cash" className="text-slate-800">Espèces en caisse</option>
                      </select>
                    </div>
                  </div>

                  {newEmpForm.payment_method === 'bank_transfer' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-150">
                      <div>
                        <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Nom de la Banque</label>
                        <input 
                          type="text" 
                          value={newEmpForm.bank_name}
                          onChange={(e) => setNewEmpForm({...newEmpForm, bank_name: e.target.value})}
                          className="w-full bg-white border border-slate-200 focus:border-brand-orange focus:ring-1 focus:ring-brand-orange rounded-lg p-2 text-xs text-slate-700 outline-none transition"
                          placeholder="Ex: SGCI"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">N° de Compte / RIB</label>
                        <input 
                          type="text" 
                          value={newEmpForm.bank_account_number}
                          onChange={(e) => setNewEmpForm({...newEmpForm, bank_account_number: e.target.value})}
                          className="w-full bg-white border border-slate-200 focus:border-brand-orange focus:ring-1 focus:ring-brand-orange rounded-lg p-2 text-xs text-slate-700 font-mono"
                          placeholder="RIB complet"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">SWIFT / BIC</label>
                        <input 
                          type="text" 
                          value={newEmpForm.bank_swift}
                          onChange={(e) => setNewEmpForm({...newEmpForm, bank_swift: e.target.value})}
                          className="w-full bg-white border border-slate-200 focus:border-brand-orange focus:ring-1 focus:ring-brand-orange rounded-lg p-2 text-xs text-slate-700 font-mono"
                          placeholder="Ex: SGCIXX"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">IBAN International</label>
                        <input 
                          type="text" 
                          value={newEmpForm.bank_iban}
                          onChange={(e) => setNewEmpForm({...newEmpForm, bank_iban: e.target.value})}
                          className="w-full bg-white border border-slate-200 focus:border-brand-orange focus:ring-1 focus:ring-brand-orange rounded-lg p-2 text-xs text-slate-700 font-mono"
                          placeholder="IBAN complet"
                        />
                      </div>
                    </div>
                  ) : newEmpForm.payment_method === 'mobile_money' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-150">
                      <div>
                        <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Opérateur de Paiement</label>
                        <select 
                          value={newEmpForm.mobile_money_provider}
                          onChange={(e) => setNewEmpForm({...newEmpForm, mobile_money_provider: e.target.value})}
                          className="w-full bg-white border border-slate-200 focus:border-brand-orange rounded-lg p-2 text-xs text-slate-700 outline-none transition"
                        >
                          <option value="Wave" className="text-slate-800">Wave Côte d'Ivoire</option>
                          <option value="Orange Money" className="text-slate-800">Orange Money</option>
                          <option value="MTN MoMo" className="text-slate-800">MTN MoMo</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Numéro de Mobile Money</label>
                        <input 
                          type="text" 
                          value={newEmpForm.mobile_money_number}
                          onChange={(e) => setNewEmpForm({...newEmpForm, mobile_money_number: e.target.value})}
                          className="w-full bg-white border border-slate-200 focus:border-brand-orange focus:ring-1 focus:ring-brand-orange rounded-lg p-2 text-xs text-slate-700 font-mono"
                          placeholder="+225..."
                        />
                      </div>
                    </div>
                  ) : null}
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 bg-white sticky bottom-0">
                  <button 
                    type="button" 
                    onClick={() => setShowAddEmployeeModal(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-semibold cursor-pointer transition border border-slate-200"
                  >
                    Annuler
                  </button>
                  <button 
                    type="submit" 
                    className="px-5 py-2 bg-brand-orange hover:bg-brand-orange-hover text-white rounded-lg text-xs font-bold cursor-pointer transition shadow-xs"
                  >
                    Valider l'embauche
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- MODAL 2: ADD / RENEW CONTRACT (Multiple active contract career) --- */}
      <AnimatePresence>
        {showAddContractModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div 
              className="fixed inset-0 bg-black/40 backdrop-blur-xs"
              onClick={() => setShowAddContractModal(false)}
            ></div>
            
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-slate-200 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl relative z-10 text-left"
            >
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-slate-800 text-base">Rédiger un nouveau contrat (Avenant / Promotion)</h3>
                  <p className="text-[11px] text-slate-500">Traçabilité légale historique sans écrasement de données</p>
                </div>
                <button 
                  onClick={() => setShowAddContractModal(false)} 
                  className="text-slate-400 hover:text-slate-600 p-1 bg-slate-100 rounded-lg transition"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              <form onSubmit={handleCreateContract} className="p-6 space-y-4">
                <div>
                  <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Sélectionner l'employé *</label>
                  <select 
                    value={newContractForm.employee_id}
                    onChange={(e) => setNewContractForm({...newContractForm, employee_id: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-brand-orange rounded-lg p-2.5 text-xs text-slate-700 outline-none transition"
                  >
                    <option value="" className="text-slate-800">-- Choisir un salarié --</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id} className="text-slate-800">
                        {emp.first_name} {emp.last_name} ({emp.employee_code})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Type de Contrat</label>
                    <select 
                      value={newContractForm.contract_type}
                      onChange={(e) => setNewContractForm({...newContractForm, contract_type: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-brand-orange rounded-lg p-2.5 text-xs text-slate-700 outline-none transition"
                    >
                      <option value="CDI" className="text-slate-800">CDI (Indéterminé)</option>
                      <option value="CDD" className="text-slate-800">CDD (Déterminé)</option>
                      <option value="EXTRA" className="text-slate-800">Extra à la tâche</option>
                      <option value="INTERN" className="text-slate-800">Stage conventionné</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Date d'effet</label>
                    <input 
                      type="date" 
                      value={newContractForm.start_date}
                      onChange={(e) => setNewContractForm({...newContractForm, start_date: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-brand-orange rounded-lg p-2.5 text-xs text-slate-700 outline-none transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Nouveau salaire brut</label>
                    <input 
                      type="number" 
                      value={newContractForm.base_salary}
                      onChange={(e) => setNewContractForm({...newContractForm, base_salary: Number(e.target.value)})}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-brand-orange focus:ring-1 focus:ring-brand-orange rounded-lg p-2.5 text-xs text-slate-700 font-mono outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Devise de règlement (i18n)</label>
                    <select 
                      value={newContractForm.currency}
                      onChange={(e) => setNewContractForm({...newContractForm, currency: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-brand-orange rounded-lg p-2.5 text-xs text-slate-700 font-mono outline-none transition"
                    >
                      <option value="XOF" className="text-slate-800">XOF (Franc CFA)</option>
                      <option value="EUR" className="text-slate-800">EUR (€)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Notes / Raison de la revalorisation</label>
                  <textarea 
                    value={newContractForm.notes}
                    onChange={(e) => setNewContractForm({...newContractForm, notes: e.target.value})}
                    rows={2}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-brand-orange focus:ring-1 focus:ring-brand-orange rounded-lg p-2.5 text-xs text-slate-700 outline-none transition"
                    placeholder="Ex: Passage au grade de superviseur, renouvellement CDD..."
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 bg-white">
                  <button 
                    type="button" 
                    onClick={() => setShowAddContractModal(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-semibold cursor-pointer transition border border-slate-200"
                  >
                    Annuler
                  </button>
                  <button 
                    type="submit" 
                    className="px-5 py-2 bg-brand-orange hover:bg-brand-orange-hover text-white rounded-lg text-xs font-bold cursor-pointer transition shadow-xs"
                  >
                    Signer et enregistrer
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- MODAL 3: ASSIGN SKILL --- */}
      <AnimatePresence>
        {showAddSkillModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div 
              className="fixed inset-0 bg-black/40 backdrop-blur-xs"
              onClick={() => setShowAddSkillModal(false)}
            ></div>
            
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-slate-200 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative z-10 text-left"
            >
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-slate-800 text-base">Attribuer un brevet ou habilitation</h3>
                  <p className="text-[11px] text-slate-500">Mettre à jour le catalogue de compétences d'un salarié</p>
                </div>
                <button 
                  onClick={() => setShowAddSkillModal(false)} 
                  className="text-slate-400 hover:text-slate-600 p-1 bg-slate-100 rounded-lg transition"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              <form onSubmit={handleAssignSkill} className="p-6 space-y-4">
                <div>
                  <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Sélectionner l'employé</label>
                  <select 
                    value={newSkillForm.employee_id}
                    onChange={(e) => setNewSkillForm({...newSkillForm, employee_id: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-brand-orange rounded-lg p-2.5 text-xs text-slate-700 outline-none transition"
                  >
                    <option value="" className="text-slate-800">-- Choisir un salarié --</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id} className="text-slate-800">
                        {emp.first_name} {emp.last_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Brevet ou Compétence</label>
                  <select 
                    value={newSkillForm.skill_id}
                    onChange={(e) => setNewSkillForm({...newSkillForm, skill_id: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-brand-orange rounded-lg p-2.5 text-xs text-slate-700 outline-none transition"
                  >
                    <option value="" className="text-slate-800">-- Choisir une compétence --</option>
                    {skills.map(s => (
                      <option key={s.id} value={s.id} className="text-slate-800">{s.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Niveau de maîtrise</label>
                  <select 
                    value={newSkillForm.level}
                    onChange={(e) => setNewSkillForm({...newSkillForm, level: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-brand-orange rounded-lg p-2.5 text-xs text-slate-700 outline-none transition"
                  >
                    <option value="beginner" className="text-slate-800">Débutant (Notions de base)</option>
                    <option value="intermediate" className="text-slate-800">Intermédiaire (Opérationnel)</option>
                    <option value="advanced" className="text-slate-800">Avancé (Autonome)</option>
                    <option value="expert" className="text-slate-800">Expert (Référence interne / Superviseur)</option>
                  </select>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 bg-white">
                  <button 
                    type="button" 
                    onClick={() => setShowAddSkillModal(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-semibold cursor-pointer transition border border-slate-200"
                  >
                    Annuler
                  </button>
                  <button 
                    type="submit" 
                    className="px-5 py-2 bg-brand-orange hover:bg-brand-orange-hover text-white rounded-lg text-xs font-bold cursor-pointer transition shadow-xs"
                  >
                    Enregistrer
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
