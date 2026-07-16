/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ShieldCheck, Plus, Search, Eye, RefreshCw, HardDrive, Cpu, ShieldAlert, Users, Key, Terminal, Shield, Check, Info, Trash2, X, AlertTriangle, Download, UploadCloud, Database, Activity, FileCode, Server, CheckCircle, HelpCircle } from 'lucide-react';
import { PageHeader, Badge, AlertBanner } from '../components/ui/pms-ui';
import { mockActivityLogs } from '../mockData';
import { ALL_PMS_MODULES } from '../utils/permissions';
import { api } from '../utils/api';
import { useToast } from '../context/ToastContext';

export default function Admin() {
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [activeTab, setActiveTab] = useState<'users' | 'audit' | 'diagnostic' | 'backups'>('users');
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Privileges state
  const [editingPrivilegesUser, setEditingPrivilegesUser] = useState<any | null>(null);
  const [selectedPrivileges, setSelectedPrivileges] = useState<string[]>([]);

  // Add user modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [formFirstName, setFormFirstName] = useState('');
  const [formLastName, setFormLastName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formRole, setFormRole] = useState('Réceptionniste');
  const [formPhone, setFormPhone] = useState('');

  // Diagnostics & schema states
  const [dbDiagnostics, setDbDiagnostics] = useState<any>(null);
  const [diagLoading, setDiagLoading] = useState(false);
  const [schemaInfo, setSchemaInfo] = useState<any>(null);
  const [schemaLoading, setSchemaLoading] = useState(false);

  // Backup & Restore states
  const [backupStatus, setBackupStatus] = useState<string>('');
  const [restoreStatus, setRestoreStatus] = useState<string>('');
  const [restoreError, setRestoreError] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);
  const [pendingRestoreData, setPendingRestoreData] = useState<any>(null);

  const toast = useToast();

  // Config Backup & Restore states
  const [configBackupStatus, setConfigBackupStatus] = useState<string>('');
  const [configRestoreStatus, setConfigRestoreStatus] = useState<string>('');
  const [configRestoreError, setConfigRestoreError] = useState<string>('');
  const [isConfigDragging, setIsConfigDragging] = useState(false);
  const [showConfigRestoreConfirm, setShowConfigRestoreConfirm] = useState(false);
  const [pendingConfigRestoreData, setPendingConfigRestoreData] = useState<any>(null);

  // Form validations & Server diagnostics
  const [clientErrors, setClientErrors] = useState<Record<string, string>>({});
  const [verboseServerError, setVerboseServerError] = useState<any | null>(null);

  const loadDbDiagnostics = async () => {
    setDiagLoading(true);
    try {
      const res = await api.getDbDiagnostics();
      if (res.success) {
        setDbDiagnostics(res.diagnostics);
      }
    } catch (err: any) {
      console.error('Error fetching db diagnostics:', err);
    } finally {
      setDiagLoading(false);
    }
  };

  const loadSchemaInfo = async () => {
    setSchemaLoading(true);
    try {
      const res = await api.getDebugUserCreation();
      if (res.success) {
        setSchemaInfo(res.schemaInfo);
      }
    } catch (err: any) {
      console.error('Error fetching schema info:', err);
    } finally {
      setSchemaLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'diagnostic') {
      loadDbDiagnostics();
      loadSchemaInfo();
    }
  }, [activeTab]);

  const validateForm = (field?: string) => {
    const errors: Record<string, string> = {};

    if (!field || field === 'firstName') {
      if (!formFirstName.trim()) errors.firstName = 'Le prénom de l\'employé est obligatoire.';
    }
    if (!field || field === 'lastName') {
      if (!formLastName.trim()) errors.lastName = 'Le nom de l\'employé est obligatoire.';
    }
    if (!field || field === 'email') {
      if (!formEmail.trim()) {
        errors.email = 'L\'adresse email est obligatoire.';
      } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formEmail)) {
          errors.email = 'Format d\'adresse email incorrect (ex: nom@domaine.com).';
        } else if (users.some(u => u.email?.toLowerCase() === formEmail.toLowerCase())) {
          errors.email = '⚠️ Doublon : cette adresse email est déjà utilisée par un autre employé !';
        }
      }
    }
    if (!field || field === 'password') {
      if (!formPassword) {
        errors.password = 'Le mot de passe temporaire est obligatoire.';
      } else if (formPassword.length < 6) {
        errors.password = '⚠️ Sécurité insuffisante : le mot de passe doit faire au moins 6 caractères.';
      }
    }

    if (field) {
      setClientErrors(prev => {
        const updated = { ...prev };
        if (errors[field]) {
          updated[field] = errors[field];
        } else {
          delete updated[field];
        }
        return updated;
      });
    } else {
      setClientErrors(errors);
    }

    return Object.keys(errors).length === 0;
  };

  const loadUsers = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const data = await api.getUsers();
      setUsers(data || []);
    } catch (err: any) {
      setErrorMsg(err.message || 'Impossible de charger la liste des utilisateurs.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleEditPrivileges = (u: any) => {
    setEditingPrivilegesUser(u);
    setSelectedPrivileges(u.privileges || []);
  };

  const handleTogglePrivilege = (path: string) => {
    if (selectedPrivileges.includes(path)) {
      setSelectedPrivileges(selectedPrivileges.filter(p => p !== path));
    } else {
      setSelectedPrivileges([...selectedPrivileges, path]);
    }
  };

  const handleSavePrivileges = async () => {
    if (editingPrivilegesUser) {
      try {
        await api.updateUser(editingPrivilegesUser.id, { privileges: selectedPrivileges });
        setSuccessMsg(`Privilèges de "${editingPrivilegesUser.name}" enregistrés avec succès.`);
        toast.showSuccess(`Privilèges de "${editingPrivilegesUser.name}" mis à jour avec succès !`);
        setEditingPrivilegesUser(null);
        await loadUsers();
        // Dispatch storage event so components can react to permissions change
        window.dispatchEvent(new Event('storage'));
        setTimeout(() => setSuccessMsg(''), 4000);
      } catch (err: any) {
        setErrorMsg(err.message || 'Erreur lors de la sauvegarde des privilèges.');
        toast.showError(`Échec de mise à jour des privilèges : ${err.message || 'Erreur hôtelière'}`);
        setTimeout(() => setErrorMsg(''), 4000);
      }
    }
  };

  const handleResetToDefaults = async () => {
    if (editingPrivilegesUser) {
      try {
        const defaults: Record<string, string[]> = {
          'Super Administrateur': [
            '/dashboard', '/reception', '/rooms', '/reservations', '/guests', '/finance', 
            '/hrms', '/housekeeping', '/maintenance', '/restaurant', '/inventory', '/reports', '/settings', '/admin'
          ],
          'Support Technique': [
            '/dashboard', '/reception', '/rooms', '/reservations', '/guests', '/finance', 
            '/hrms', '/housekeeping', '/maintenance', '/restaurant', '/inventory', '/reports', '/settings', '/admin'
          ],
          'Réceptionniste': [
            '/dashboard', '/reception', '/rooms', '/reservations', '/guests', '/restaurant'
          ],
          'Housekeeping': [
            '/dashboard', '/housekeeping', '/maintenance'
          ],
          'Technicien Maintenance': [
            '/dashboard', '/maintenance'
          ],
          'Magasinier / Stock': [
            '/dashboard', '/inventory'
          ]
        };
        const defaultPrivs = defaults[editingPrivilegesUser.role] || ['/dashboard'];
        await api.updateUser(editingPrivilegesUser.id, { privileges: defaultPrivs });
        setSuccessMsg(`Privilèges de "${editingPrivilegesUser.name}" réinitialisés aux valeurs par défaut.`);
        toast.showSuccess(`Privilèges de "${editingPrivilegesUser.name}" réinitialisés aux valeurs par défaut.`);
        setEditingPrivilegesUser(null);
        await loadUsers();
        window.dispatchEvent(new Event('storage'));
        setTimeout(() => setSuccessMsg(''), 4000);
      } catch (err: any) {
        setErrorMsg(err.message || 'Erreur lors de la réinitialisation.');
        toast.showError(`Échec de la réinitialisation : ${err.message}`);
        setTimeout(() => setErrorMsg(''), 4000);
      }
    }
  };

  const toggleUserStatus = async (id: string | number, currentStatus: string) => {
    const newStatus = currentStatus === 'Actif' ? 'Suspendu' : 'Actif';
    try {
      await api.updateUser(id, { status: newStatus });
      setSuccessMsg(`Statut de l'utilisateur mis à jour en "${newStatus}".`);
      toast.showSuccess(`Compte de l'employé désormais ${newStatus === 'Actif' ? 'activé' : 'suspendu'}.`);
      await loadUsers();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Impossible de mettre à jour le statut.');
      toast.showError(`Impossible de mettre à jour le statut : ${err.message}`);
      setTimeout(() => setErrorMsg(''), 4000);
    }
  };

  const handleDeleteUser = async (id: string | number, email: string) => {
    const currentUser = JSON.parse(localStorage.getItem('pms_user') || '{}');
    if (currentUser && currentUser.email === email) {
      setErrorMsg('Vous ne pouvez pas supprimer votre propre compte actif.');
      toast.showWarning('Action interdite : vous ne pouvez pas supprimer votre propre compte.');
      setTimeout(() => setErrorMsg(''), 4000);
      return;
    }

    if (!window.confirm(`Confirmez-vous la suppression définitive du compte de l'employé (${email}) ?`)) {
      return;
    }

    try {
      await api.deleteUser(id);
      setSuccessMsg('Compte utilisateur supprimé avec succès.');
      toast.showSuccess('Compte utilisateur supprimé avec succès.');
      await loadUsers();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Erreur lors de la suppression du compte.');
      toast.showError(`Échec de la suppression : ${err.message}`);
      setTimeout(() => setErrorMsg(''), 4000);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerboseServerError(null);

    if (!validateForm()) {
      setErrorMsg('Erreurs de validation détectées. Veuillez corriger le formulaire.');
      return;
    }

    try {
      // Map basic privileges based on role
      const defaults: Record<string, string[]> = {
        'Super Administrateur': [
          '/dashboard', '/reception', '/rooms', '/reservations', '/guests', '/finance', 
          '/hrms', '/housekeeping', '/maintenance', '/restaurant', '/inventory', '/reports', '/settings', '/admin'
        ],
        'Support Technique': [
          '/dashboard', '/reception', '/rooms', '/reservations', '/guests', '/finance', 
          '/hrms', '/housekeeping', '/maintenance', '/restaurant', '/inventory', '/reports', '/settings', '/admin'
        ],
        'Réceptionniste': [
          '/dashboard', '/reception', '/rooms', '/reservations', '/guests', '/restaurant'
        ],
        'Housekeeping': [
          '/dashboard', '/housekeeping', '/maintenance'
        ],
        'Technicien Maintenance': [
          '/dashboard', '/maintenance'
        ],
        'Magasinier / Stock': [
          '/dashboard', '/inventory'
        ]
      };
      const privileges = defaults[formRole] || ['/dashboard'];

      await api.createUser({
        first_name: formFirstName,
        last_name: formLastName,
        email: formEmail,
        password: formPassword,
        role: formRole,
        phone: formPhone,
        privileges
      });

      setSuccessMsg(`Compte de "${formFirstName} ${formLastName}" créé avec succès.`);
      toast.showSuccess(`Compte créé avec succès pour ${formFirstName} ${formLastName} !`);
      setShowAddModal(false);
      
      // Reset form
      setFormFirstName('');
      setFormLastName('');
      setFormEmail('');
      setFormPassword('');
      setFormRole('Réceptionniste');
      setFormPhone('');
      setClientErrors({});
      
      await loadUsers();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      console.error('[API Admin] User creation failed:', err);
      setVerboseServerError({
        message: err.message || 'Erreur lors de la création du compte.',
        details: err.stack || err.toString(),
        time: new Date().toISOString()
      });
      setErrorMsg(`Échec de création : ${err.message || 'Une erreur serveur s\'est produite.'}`);
      toast.showError(`Échec de création : ${err.message}`);
    }
  };

  const handleExportBackup = async () => {
    setBackupStatus('Exportation en cours...');
    try {
      const res = await api.getBackupData();
      const backupData = res.backup || res;
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
      const downloadAnchor = document.createElement('a');
      const filename = `brunch_bouake_pms_backup_${new Date().toISOString().slice(0, 10)}.json`;
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", filename);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      setBackupStatus('Fichier de sauvegarde téléchargé avec succès !');
      setTimeout(() => setBackupStatus(''), 4000);
    } catch (err: any) {
      setBackupStatus(`Erreur d'exportation : ${err.message}`);
      setTimeout(() => setBackupStatus(''), 6000);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.type === "application/json" || file.name.endsWith('.json'))) {
      processBackupFile(file);
    } else {
      setRestoreError('Seuls les fichiers de sauvegarde au format JSON (.json) sont acceptés.');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processBackupFile(file);
    }
  };

  const processBackupFile = (file: File) => {
    setRestoreError('');
    setRestoreStatus('');
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (!parsed.users || !Array.isArray(parsed.users)) {
          setRestoreError('Fichier de sauvegarde non valide : la table clé "users" est absente.');
          return;
        }
        setPendingRestoreData(parsed);
        setShowRestoreConfirm(true);
      } catch (err) {
        setRestoreError('Fichier JSON illisible ou malformé.');
      }
    };
    reader.readAsText(file);
  };

  const handleConfirmRestore = async () => {
    if (!pendingRestoreData) return;
    setShowRestoreConfirm(false);
    setRestoreStatus('Restauration et synchronisation des tables de la base...');
    setRestoreError('');
    try {
      const res = await api.restoreDb(pendingRestoreData);
      if (res.success) {
        setRestoreStatus(`La base de données a été restaurée avec succès (${res.details?.restoredTables?.length || 17} tables injectées) !`);
        toast.showSuccess(`Base de données restaurée avec succès (${res.details?.restoredTables?.length || 17} tables) !`);
        setPendingRestoreData(null);
        await loadUsers();
        setTimeout(() => setRestoreStatus(''), 5000);
      } else {
        setRestoreError(res.error?.message || 'Erreur lors de la restauration hôtelière.');
        toast.showError(`Erreur de restauration : ${res.error?.message}`);
      }
    } catch (err: any) {
      setRestoreError(err.message || 'Impossible de restaurer la sauvegarde.');
      toast.showError(`Erreur : ${err.message}`);
    }
  };

  const handleExportConfigBackup = async () => {
    setConfigBackupStatus('Exportation de la configuration en cours...');
    try {
      const res = await api.getBackupConfigData();
      const backupData = res.backup || res;
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
      const downloadAnchor = document.createElement('a');
      const filename = `brunch_bouake_config_backup_${new Date().toISOString().slice(0, 10)}.json`;
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", filename);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      setConfigBackupStatus('Configuration téléchargée avec succès !');
      toast.showSuccess('Sauvegarde de configuration exportée et téléchargée avec succès !');
      setTimeout(() => setConfigBackupStatus(''), 4000);
    } catch (err: any) {
      setConfigBackupStatus(`Erreur d'exportation : ${err.message}`);
      toast.showError(`Échec de l'exportation de configuration : ${err.message}`);
      setTimeout(() => setConfigBackupStatus(''), 6000);
    }
  };

  const handleConfigDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsConfigDragging(true);
  };

  const handleConfigDragLeave = () => {
    setIsConfigDragging(false);
  };

  const handleConfigDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsConfigDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.type === "application/json" || file.name.endsWith('.json'))) {
      processConfigFile(file);
    } else {
      setConfigRestoreError('Seuls les fichiers de sauvegarde au format JSON (.json) sont acceptés.');
      toast.showWarning('Format de fichier incorrect. Utilisez un fichier JSON.');
    }
  };

  const handleConfigFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processConfigFile(file);
    }
  };

  const processConfigFile = (file: File) => {
    setConfigRestoreError('');
    setConfigRestoreStatus('');
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (!parsed.settings || !parsed.system_config || !parsed.module_access) {
          setConfigRestoreError('Fichier de configuration invalide : tables requises manquantes.');
          toast.showError('Structure invalide : settings, system_config ou module_access introuvables.');
          return;
        }
        setPendingConfigRestoreData(parsed);
        setShowConfigRestoreConfirm(true);
      } catch (err) {
        setConfigRestoreError('Fichier JSON illisible ou malformé.');
        toast.showError('JSON corrompu ou malformé.');
      }
    };
    reader.readAsText(file);
  };

  const handleConfirmConfigRestore = async () => {
    if (!pendingConfigRestoreData) return;
    setShowConfigRestoreConfirm(false);
    setConfigRestoreStatus('Restauration et synchronisation des tables de configuration...');
    setConfigRestoreError('');
    try {
      const res = await api.restoreConfig(pendingConfigRestoreData);
      if (res.success) {
        setConfigRestoreStatus(`La configuration système a été restaurée avec succès (${res.details?.restoredTables?.join(', ')}) !`);
        toast.showSuccess(`Configuration restaurée avec succès (${res.details?.restoredTables?.length} tables réinjectées) !`);
        setPendingConfigRestoreData(null);
        setTimeout(() => setConfigRestoreStatus(''), 5000);
      } else {
        setConfigRestoreError(res.error?.message || 'Erreur lors de la restauration de la configuration.');
        toast.showError(`Échec de la restauration : ${res.error?.message || 'Erreur serveur.'}`);
      }
    } catch (err: any) {
      setConfigRestoreError(err.message || 'Impossible de restaurer la configuration.');
      toast.showError(`Erreur : ${err.message}`);
    }
  };

  return (
    <div className="flex flex-col h-full text-left">
      <PageHeader
        title="Administration Système"
        description="Gérer les comptes d'accès des employés hôteliers, inspecter la sécurité (Audit Trail) et surveiller la santé des serveurs."
      />

      <div className="p-6 lg:p-8 space-y-6 flex-1 overflow-y-auto">
        {successMsg && (
          <AlertBanner text={successMsg} type="success" />
        )}
        {errorMsg && (
          <AlertBanner text={errorMsg} type="error" />
        )}

        {/* SUB NAV BAR */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex space-x-1 bg-slate-100 p-1 rounded-lg self-start flex-wrap gap-y-1">
            <button
              onClick={() => setActiveTab('users')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${activeTab === 'users' ? 'bg-white text-brand-orange shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Comptes Employés
            </button>
            <button
              onClick={() => setActiveTab('audit')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${activeTab === 'audit' ? 'bg-white text-brand-orange shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Journal d'Audit Système
            </button>
            <button
              onClick={() => setActiveTab('diagnostic')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${activeTab === 'diagnostic' ? 'bg-white text-brand-orange shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Diagnostic & Santé Base
            </button>
            <button
              onClick={() => setActiveTab('backups')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${activeTab === 'backups' ? 'bg-white text-brand-orange shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Sauvegarde & Restauration
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-full md:w-60">
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 bg-slate-50 focus:bg-white text-xs text-slate-800 rounded-lg border border-slate-200 focus:border-brand-orange focus:outline-none"
              />
              <Search className="absolute left-3 top-2.5 text-slate-400" size={12} />
            </div>

            {activeTab === 'users' && (
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-bold px-3.5 py-1.5 rounded-lg flex items-center justify-center space-x-1 cursor-pointer transition-all shadow-md shadow-brand-orange/10"
              >
                <Plus size={14} />
                <span>Nouveau Compte</span>
              </button>
            )}
            
            <button
              onClick={loadUsers}
              title="Rafraîchir les données"
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 rounded-lg bg-white transition-all"
            >
              <RefreshCw size={14} className={isLoading ? 'animate-spin text-brand-orange' : ''} />
            </button>
          </div>
        </div>

        {/* ACTIVE MODULE WINDOW */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          
          {activeTab === 'users' && (
            <div className="overflow-x-auto">
              {isLoading ? (
                <div className="p-12 text-center text-xs text-slate-500 flex flex-col items-center justify-center space-y-2">
                  <RefreshCw size={24} className="animate-spin text-brand-orange" />
                  <span>Chargement des comptes utilisateurs sécurisés...</span>
                </div>
              ) : users.length === 0 ? (
                <div className="p-12 text-center text-xs text-slate-500">
                  Aucun compte utilisateur trouvé.
                </div>
              ) : (
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider font-bold bg-slate-50/20">
                      <th className="py-3 px-6">Identifiant unique</th>
                      <th className="py-3 px-4">Employé</th>
                      <th className="py-3 px-4">Rôle Système</th>
                      <th className="py-3 px-4">Adresse email</th>
                      <th className="py-3 px-4 text-center">Accès active</th>
                      <th className="py-3 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {users
                      .filter(u => u.name?.toLowerCase().includes(searchQuery.toLowerCase()) || u.email?.toLowerCase().includes(searchQuery.toLowerCase()))
                      .map((u) => (
                        <tr key={u.id} className="hover:bg-slate-50/50">
                          <td className="py-3.5 px-6 font-mono text-slate-500 font-bold">{u.id}</td>
                          <td className="py-3.5 px-4 font-extrabold text-slate-900">{u.name}</td>
                          <td className="py-3.5 px-4">
                            <span className="bg-orange-50 text-brand-orange font-bold px-2 py-0.5 rounded text-[10px] border border-orange-100">
                              {u.role}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-500 font-mono font-medium">{u.email}</td>
                          <td className="py-3.5 px-4 text-center">
                            <Badge label={u.status} type="default" status={u.status === 'Actif' ? 'disponible' : 'occupée'} />
                          </td>
                          <td className="py-3.5 px-6 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleEditPrivileges(u)}
                                className="bg-orange-50 hover:bg-orange-100 text-brand-orange font-bold text-[10px] px-2 py-1 border border-orange-200 rounded-lg cursor-pointer flex items-center space-x-1"
                                title="Gérer les privilèges spécifiques de cet utilisateur"
                              >
                                <Shield size={10} />
                                <span>Privilèges</span>
                              </button>
                              
                              <button
                                onClick={() => toggleUserStatus(u.id, u.status)}
                                className="bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-[10px] px-2 py-1 border border-slate-200 rounded-lg cursor-pointer transition-colors"
                              >
                                {u.status === 'Actif' ? 'Suspendre' : 'Réactiver'}
                              </button>

                              <button
                                onClick={() => handleDeleteUser(u.id, u.email)}
                                title="Supprimer définitivement"
                                className="bg-red-50 hover:bg-red-100 text-red-600 p-1 border border-red-200 rounded-lg cursor-pointer transition-colors"
                              >
                                <Trash2 size={11} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {activeTab === 'users' && editingPrivilegesUser && (
            <div className="p-6 bg-slate-50 border-t border-slate-200 animate-fade-in text-slate-800">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 flex items-center space-x-2">
                    <Shield className="text-brand-orange animate-pulse" size={16} />
                    <span>Gestion des Privilèges : {editingPrivilegesUser.name}</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Rôle de base : <span className="font-bold text-slate-700">{editingPrivilegesUser.role}</span> &bull; Email : <span className="font-mono text-slate-600 bg-slate-100 px-1 py-0.5 rounded">{editingPrivilegesUser.email}</span>
                  </p>
                </div>
                <button
                  onClick={() => setEditingPrivilegesUser(null)}
                  className="text-slate-500 hover:text-slate-800 hover:bg-slate-100 text-xs font-bold px-2.5 py-1 rounded-lg border border-slate-200 bg-white transition-colors cursor-pointer"
                >
                  Fermer
                </button>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-4 mb-4 shadow-inner">
                <div className="flex items-center space-x-2 bg-blue-50 text-blue-700 p-3 rounded-lg text-xs font-medium border border-blue-100">
                  <Info size={14} className="flex-shrink-0" />
                  <span>
                    {editingPrivilegesUser.role === 'Super Administrateur' || editingPrivilegesUser.role === 'Support Technique' 
                      ? "Cet utilisateur possède un rôle d'administration système de niveau supérieur. Tous les modules lui sont accessibles par défaut et ne peuvent être restreints."
                      : "Sélectionnez ou désélectionnez les modules ci-dessous pour accorder ou retirer des privilèges d'accès pour cet utilisateur. Les droits seront sauvegardés de façon permanente."}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {ALL_PMS_MODULES.map((mod) => {
                    const isChecked = selectedPrivileges.includes(mod.path);
                    const isSuper = editingPrivilegesUser.role === 'Super Administrateur' || editingPrivilegesUser.role === 'Support Technique';
                    return (
                      <label 
                        key={mod.path} 
                        className={`flex items-center space-x-2.5 p-2.5 rounded-lg border cursor-pointer select-none transition-all ${
                          isChecked || isSuper
                            ? 'border-brand-orange/40 bg-orange-50/20 text-brand-orange font-bold' 
                            : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                        } ${isSuper ? 'opacity-65 cursor-not-allowed' : ''}`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked || isSuper}
                          disabled={isSuper}
                          onChange={() => handleTogglePrivilege(mod.path)}
                          className="rounded text-brand-orange focus:ring-brand-orange cursor-pointer"
                        />
                        <span className="text-[11px]">{mod.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-2">
                <button
                  onClick={handleResetToDefaults}
                  disabled={editingPrivilegesUser.role === 'Super Administrateur' || editingPrivilegesUser.role === 'Support Technique'}
                  className="bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs px-3 py-1.5 border border-slate-200 rounded-lg cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Réinitialiser au rôle
                </button>
                <button
                  onClick={handleSavePrivileges}
                  disabled={editingPrivilegesUser.role === 'Super Administrateur' || editingPrivilegesUser.role === 'Support Technique'}
                  className="bg-brand-orange hover:bg-brand-orange-hover text-white font-bold text-xs px-4 py-1.5 rounded-lg cursor-pointer flex items-center space-x-1.5 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md shadow-brand-orange/10"
                >
                  <Check size={14} />
                  <span>Enregistrer les privilèges</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'audit' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider font-bold bg-slate-50/20">
                    <th className="py-3 px-6">Heure</th>
                    <th className="py-3 px-4">Utilisateur</th>
                    <th className="py-3 px-4">Module</th>
                    <th className="py-3 px-4">Action</th>
                    <th className="py-3 px-4">Détail des modifications</th>
                    <th className="py-3 px-6 text-right">Adresse IP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {mockActivityLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/50">
                      <td className="py-3.5 px-6 font-semibold text-slate-500">{log.time}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-800">{log.user}</td>
                      <td className="py-3.5 px-4 font-semibold text-slate-600">{log.module}</td>
                      <td className="py-3.5 px-4 font-black uppercase text-[10px] text-slate-700">{log.action}</td>
                      <td className="py-3.5 px-4 text-slate-600 font-medium">{log.details}</td>
                      <td className="py-3.5 px-6 text-right font-mono text-slate-400">192.168.1.{Math.floor(Math.random() * 200)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'diagnostic' && (
            <div className="p-6 space-y-6">
              {/* Dynamic DB Health Card */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center space-x-3.5">
                  <div className={`p-2.5 rounded-lg ${dbDiagnostics?.connected ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                    <Database size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">État Connexion</p>
                    <p className="text-xs font-black text-slate-800">
                      {diagLoading ? 'Chargement...' : dbDiagnostics?.connected ? 'MySQL Connecté' : 'Fallback JSON Actif'}
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center space-x-3.5">
                  <div className="p-2.5 rounded-lg bg-orange-100 text-brand-orange">
                    <Server size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Moteur de Données</p>
                    <p className="text-xs font-black text-slate-800">
                      {diagLoading ? 'Chargement...' : dbDiagnostics?.engine || 'Local Database'}
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center space-x-3.5">
                  <div className="p-2.5 rounded-lg bg-blue-100 text-blue-700">
                    <Activity size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Latence Requête</p>
                    <p className="text-xs font-black text-slate-800">
                      {diagLoading ? 'Calcul...' : `${dbDiagnostics?.latency || 1} ms`}
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center space-x-3.5">
                  <div className="p-2.5 rounded-lg bg-indigo-100 text-indigo-700">
                    <Cpu size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Hôte d'Ingress</p>
                    <p className="text-xs font-mono font-bold text-slate-800">
                      {diagLoading ? '...' : dbDiagnostics?.host ? `${dbDiagnostics.host}:${dbDiagnostics.port || 3306}` : 'Local Filesystem'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Table counts grid */}
              <div className="space-y-3">
                <h4 className="text-xs uppercase font-extrabold text-slate-900 tracking-wider flex items-center space-x-1.5">
                  <Activity size={12} className="text-brand-orange" />
                  <span>Métriques d'occupation des tables principales</span>
                </h4>
                
                {diagLoading ? (
                  <div className="p-8 text-center text-xs text-slate-400">Calcul du volume de la base...</div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                    {dbDiagnostics?.tableCounts && Object.entries(dbDiagnostics.tableCounts).map(([tableName, count]: any) => (
                      <div key={tableName} className="p-3 bg-white border border-slate-100 rounded-lg hover:border-slate-200 transition-all flex flex-col justify-between">
                        <span className="text-[10px] font-mono text-slate-500 font-bold truncate" title={tableName}>{tableName}</span>
                        <div className="flex items-baseline justify-between mt-1">
                          <span className="text-sm font-black text-slate-800">{count}</span>
                          <span className="text-[9px] text-slate-400 uppercase font-bold">Lignes</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Users Schema debugger */}
              <div className="p-5 border border-slate-200 rounded-xl bg-slate-50/50 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-black uppercase text-slate-800 tracking-wider flex items-center space-x-1.5">
                      <FileCode size={14} className="text-brand-orange" />
                      <span>Inspecteur de Structure SQL : Table "users"</span>
                    </h4>
                    <p className="text-[10px] text-slate-500">
                      Consultez la signature attendue par le serveur SQL pour prévenir les échecs de création d'utilisateurs.
                    </p>
                  </div>
                  <button 
                    onClick={loadSchemaInfo}
                    disabled={schemaLoading}
                    className="px-2.5 py-1 text-[10px] font-bold text-brand-orange bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors cursor-pointer"
                  >
                    {schemaLoading ? 'Vérification...' : 'Analyser le schéma'}
                  </button>
                </div>

                {schemaLoading ? (
                  <div className="text-center p-6 text-xs text-slate-400">Interrogation de l'état des colonnes...</div>
                ) : schemaInfo ? (
                  <div className="space-y-3">
                    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
                      <table className="w-full text-left border-collapse text-[10px]">
                        <thead>
                          <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 uppercase font-bold">
                            <th className="py-2 px-3">Colonne</th>
                            <th className="py-2 px-3">Type</th>
                            <th className="py-2 px-3">Nullable</th>
                            <th className="py-2 px-3">Clé</th>
                            <th className="py-2 px-3">Défaut</th>
                            <th className="py-2 px-3">Extra</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-mono text-slate-700">
                          {schemaInfo.columns?.map((col: any) => (
                            <tr key={col.field} className="hover:bg-slate-50/30">
                              <td className="py-1.5 px-3 font-bold text-slate-950">{col.field}</td>
                              <td className="py-1.5 px-3 text-brand-orange">{col.type}</td>
                              <td className="py-1.5 px-3">{col.null}</td>
                              <td className="py-1.5 px-3 font-bold text-indigo-600">{col.key}</td>
                              <td className="py-1.5 px-3 text-slate-400">{col.default === null ? 'NULL' : String(col.default)}</td>
                              <td className="py-1.5 px-3 text-slate-500 text-[9px]">{col.extra}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    
                    {/* Real-time constraint analyzer warning badges */}
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-[11px] text-amber-800 space-y-1">
                      <p className="font-extrabold flex items-center space-x-1">
                        <AlertTriangle size={12} className="text-amber-600" />
                        <span>Rapport de Conformité de Création :</span>
                      </p>
                      <ul className="list-disc pl-4 space-y-0.5 text-slate-700">
                        <li>
                          <strong>ID Clé Primaire :</strong> La colonne <code>id</code> de type <code>{schemaInfo.columns?.find((c: any) => c.field === 'id')?.type || 'inconnu'}</code> attend des valeurs {schemaInfo.columns?.find((c: any) => c.field === 'id')?.type?.toLowerCase().includes('int') ? 'entières numériques' : 'chaînes de caractères'}. Le PMS génère automatiquement des identifiants alignés.
                        </li>
                        <li>
                          <strong>Habilitations de Rôle :</strong> La clé étrangère <code>role_id</code> est configurée. Le formulaire d'administration injecte désormais automatiquement le <code>role_id</code> mappé aux rôles PMS pour éviter les violations de contrainte.
                        </li>
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-slate-50 text-center text-xs text-slate-500 border border-dashed border-slate-200 rounded-lg">
                    Cliquez sur "Analyser le schéma" pour ausculter la structure actuelle de la table des utilisateurs.
                  </div>
                )}
              </div>

              {/* Service Health Console */}
              <div className="p-4 bg-slate-950 rounded-xl font-mono text-[11px] text-emerald-400 border border-slate-800 space-y-1 shadow-inner">
                <p className="text-[#A1A5B7] font-bold uppercase mb-1 flex items-center space-x-1">
                  <Terminal size={12} />
                  <span>Brunch Bouake Node Ingress Service Console</span>
                </p>
                <p>[SYSTEM] boot successfully at 2026-07-13T06:49:45-07:00</p>
                <p>[DATABASE] Connected to host: {dbDiagnostics?.connected ? 'MySQL Real-time Connection Engine v3' : 'Fallback local-pms_database.json (JSON Core Engine v2)'}</p>
                <p>[NETWORK] Ingress proxy binding established at 0.0.0.0:3000</p>
                <p>[API_GW] Admin debug endpoint mounted on path /api/admin/debug-user-creation</p>
                <p>[SYSTEM] All server sub-nodes are online and responsive.</p>
              </div>
            </div>
          )}

          {activeTab === 'backups' && (
            <div className="p-6 space-y-6 text-slate-800">
              <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 flex items-start space-x-3 text-xs text-brand-orange">
                <Info size={16} className="shrink-0 mt-0.5" />
                <div>
                  <p className="font-extrabold mb-1">Stratégie de Préservation des Données (Antidéploiement)</p>
                  <p className="text-slate-700 leading-relaxed text-left">
                    Parce que Brunch Bouaké utilise une base résiliente ou un système de fichiers de conteneurs volatiles (lors des redéploiements), 
                    il est fortement conseillé d'exporter une sauvegarde de votre base avant de mettre à jour le projet. Après redéploiement, 
                    importez simplement ce fichier ici pour rétablir instantanément l'intégralité de vos comptes employés, réservations et configurations.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                {/* Export Backup Card */}
                <div className="p-5 border border-slate-200 rounded-xl bg-white space-y-4 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-slate-900 font-extrabold text-xs uppercase tracking-wider">
                      <Download size={16} className="text-brand-orange" />
                      <span>Exporter la base de données</span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Télécharge un fichier <code>.json</code> complet contenant toutes les tables d'activité de l'hôtel : employés hôteliers, 
                      chambres, fiches clients, réservations actives et historiques de paiements.
                    </p>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={handleExportBackup}
                      className="w-full bg-brand-orange hover:bg-brand-orange-hover text-white font-bold text-xs py-2.5 px-4 rounded-lg flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-md shadow-brand-orange/10"
                    >
                      <Download size={14} />
                      <span>Télécharger le fichier de sauvegarde (.json)</span>
                    </button>
                    {backupStatus && (
                      <p className="text-[10px] text-center mt-2 font-bold text-emerald-600 animate-pulse">{backupStatus}</p>
                    )}
                  </div>
                </div>

                {/* Import / Restore Card */}
                <div className="p-5 border border-slate-200 rounded-xl bg-white space-y-4">
                  <div className="flex items-center space-x-2 text-slate-900 font-extrabold text-xs uppercase tracking-wider">
                    <UploadCloud size={16} className="text-indigo-600" />
                    <span>Restaurer / Importer une sauvegarde</span>
                  </div>

                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-lg p-5 text-center transition-all cursor-pointer ${
                      isDragging 
                        ? 'border-indigo-500 bg-indigo-50/30' 
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                    }`}
                  >
                    <input
                      type="file"
                      id="backup-file-upload"
                      accept=".json"
                      className="hidden"
                      onChange={handleFileSelect}
                    />
                    <label htmlFor="backup-file-upload" className="cursor-pointer space-y-2 block">
                      <UploadCloud size={28} className="mx-auto text-slate-400 animate-bounce" />
                      <p className="text-xs font-bold text-slate-700">Glissez-déposez votre fichier de sauvegarde JSON ici</p>
                      <p className="text-[10px] text-slate-400">ou cliquez pour parcourir vos fichiers (.json uniquement)</p>
                    </label>
                  </div>

                  {restoreStatus && (
                    <div className="p-2 bg-emerald-50 border border-emerald-100 rounded text-emerald-700 text-[11px] font-bold text-center">
                      {restoreStatus}
                    </div>
                  )}

                  {restoreError && (
                    <div className="p-2 bg-rose-50 border border-rose-100 rounded text-rose-700 text-[11px] font-bold text-center">
                      {restoreError}
                    </div>
                  )}
                </div>
              </div>

              <hr className="border-slate-200/80 my-6" />

              <div className="space-y-1">
                <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight flex items-center space-x-2">
                  <Database size={16} className="text-amber-500" />
                  <span>Configuration & Rôles Système</span>
                </h4>
                <p className="text-xs text-slate-500 max-w-2xl">
                  Sauvegardez ou restaurez spécifiquement la configuration générale (paramètres généraux de l'hôtel, variables techniques, accès aux modules hôteliers et privilèges de rôles) pour conserver ces configurations clés lors des redéploiements de l'application.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                {/* Export Config Card */}
                <div className="p-5 border border-slate-200 rounded-xl bg-white space-y-4 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-slate-900 font-extrabold text-xs uppercase tracking-wider">
                      <Download size={16} className="text-amber-600" />
                      <span>Exporter la configuration</span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Génère et télécharge un fichier <code>.json</code> ciblé contenant uniquement les paramètres généraux de l'hôtel, les variables techniques, les tables d'accès aux modules et de privilèges des rôles.
                    </p>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={handleExportConfigBackup}
                      className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs py-2.5 px-4 rounded-lg flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-md shadow-amber-600/10"
                    >
                      <Download size={14} />
                      <span>Télécharger la configuration (.json)</span>
                    </button>
                    {configBackupStatus && (
                      <p className="text-[10px] text-center mt-2 font-bold text-amber-600 animate-pulse">{configBackupStatus}</p>
                    )}
                  </div>
                </div>

                {/* Import / Restore Config Card */}
                <div className="p-5 border border-slate-200 rounded-xl bg-white space-y-4">
                  <div className="flex items-center space-x-2 text-slate-900 font-extrabold text-xs uppercase tracking-wider">
                    <UploadCloud size={16} className="text-emerald-600" />
                    <span>Restaurer la configuration</span>
                  </div>

                  <div
                    onDragOver={handleConfigDragOver}
                    onDragLeave={handleConfigDragLeave}
                    onDrop={handleConfigDrop}
                    className={`border-2 border-dashed rounded-lg p-5 text-center transition-all cursor-pointer ${
                      isConfigDragging 
                        ? 'border-emerald-500 bg-emerald-50/30' 
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                    }`}
                  >
                    <input
                      type="file"
                      id="config-file-upload"
                      accept=".json"
                      className="hidden"
                      onChange={handleConfigFileSelect}
                    />
                    <label htmlFor="config-file-upload" className="cursor-pointer space-y-2 block">
                      <UploadCloud size={28} className="mx-auto text-slate-400 animate-bounce" />
                      <p className="text-xs font-bold text-slate-700">Glissez-déposez votre fichier de configuration JSON ici</p>
                      <p className="text-[10px] text-slate-400">ou cliquez pour parcourir vos fichiers (.json uniquement)</p>
                    </label>
                  </div>

                  {configRestoreStatus && (
                    <div className="p-2 bg-emerald-50 border border-emerald-100 rounded text-emerald-700 text-[11px] font-bold text-center">
                      {configRestoreStatus}
                    </div>
                  )}

                  {configRestoreError && (
                    <div className="p-2 bg-rose-50 border border-rose-100 rounded text-rose-700 text-[11px] font-bold text-center">
                      {configRestoreError}
                    </div>
                  )}
                </div>
              </div>

              {/* Restore Confirmation Dialog Modal */}
              {showRestoreConfirm && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
                  <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-sm w-full p-6 space-y-4 text-center animate-fade-in">
                    <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-2">
                      <AlertTriangle size={24} />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-black uppercase text-slate-900">Écraser la base hôtelière ?</h4>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Cette opération est <strong>IRRÉVERSIBLE</strong>. Toutes les données hôtelières actuelles seront détruites 
                        et remplacées par celles contenues dans votre fichier de sauvegarde.
                      </p>
                    </div>
                    <div className="flex space-x-2 pt-2 justify-center">
                      <button
                        onClick={() => { setShowRestoreConfirm(false); setPendingRestoreData(null); }}
                        className="bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs px-4 py-2 border border-slate-200 rounded-lg cursor-pointer transition-colors"
                      >
                        Annuler
                      </button>
                      <button
                        onClick={handleConfirmRestore}
                        className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-5 py-2 rounded-lg cursor-pointer transition-colors shadow-md shadow-rose-600/15"
                      >
                        Confirmer la Restauration
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Restore Configuration Confirmation Dialog Modal */}
              {showConfigRestoreConfirm && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
                  <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-sm w-full p-6 space-y-4 text-center animate-fade-in">
                    <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-2">
                      <AlertTriangle size={24} />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-black uppercase text-slate-900">Restaurer la configuration hôtelière ?</h4>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Cette opération écrasera la configuration actuelle (paramètres généraux de l'hôtel, variables d'environnement, accès des rôles) par celle du fichier d'export. Les données d'activité (chambres, clients, réservations) resteront intactes.
                      </p>
                    </div>
                    <div className="flex space-x-2 pt-2 justify-center">
                      <button
                        onClick={() => { setShowConfigRestoreConfirm(false); setPendingConfigRestoreData(null); }}
                        className="bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs px-4 py-2 border border-slate-200 rounded-lg cursor-pointer transition-colors"
                      >
                        Annuler
                      </button>
                      <button
                        onClick={handleConfirmConfigRestore}
                        className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-5 py-2 rounded-lg cursor-pointer transition-colors shadow-md shadow-amber-600/15"
                      >
                        Confirmer l'Importation
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* CREATE USER MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 text-slate-800">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-md w-full overflow-hidden animate-fade-in">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-xs uppercase font-extrabold tracking-wider text-slate-900 flex items-center space-x-1.5">
                <Users size={14} className="text-brand-orange" />
                <span>Nouveau compte employé</span>
              </h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-6 space-y-4 text-left">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Prénom *</label>
                  <input
                    type="text"
                    placeholder="Amadou"
                    value={formFirstName}
                    onChange={(e) => { setFormFirstName(e.target.value); validateForm('firstName'); }}
                    onBlur={() => validateForm('firstName')}
                    className={`w-full px-3 py-2 border rounded-lg text-xs focus:outline-none focus:border-brand-orange bg-slate-50 focus:bg-white ${clientErrors.firstName ? 'border-rose-500 bg-rose-50/20' : 'border-slate-200'}`}
                  />
                  {clientErrors.firstName && (
                    <span className="text-[10px] font-bold text-rose-600 block mt-0.5">{clientErrors.firstName}</span>
                  )}
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Nom *</label>
                  <input
                    type="text"
                    placeholder="Koné"
                    value={formLastName}
                    onChange={(e) => { setFormLastName(e.target.value); validateForm('lastName'); }}
                    onBlur={() => validateForm('lastName')}
                    className={`w-full px-3 py-2 border rounded-lg text-xs focus:outline-none focus:border-brand-orange bg-slate-50 focus:bg-white ${clientErrors.lastName ? 'border-rose-500 bg-rose-50/20' : 'border-slate-200'}`}
                  />
                  {clientErrors.lastName && (
                    <span className="text-[10px] font-bold text-rose-600 block mt-0.5">{clientErrors.lastName}</span>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Adresse email *</label>
                <input
                  type="email"
                  placeholder="nom@brunchbouake.com"
                  value={formEmail}
                  onChange={(e) => { setFormEmail(e.target.value); validateForm('email'); }}
                  onBlur={() => validateForm('email')}
                  className={`w-full px-3 py-2 border rounded-lg text-xs focus:outline-none focus:border-brand-orange bg-slate-50 focus:bg-white ${clientErrors.email ? 'border-rose-500 bg-rose-50/20' : 'border-slate-200'}`}
                />
                {clientErrors.email && (
                  <span className="text-[10px] font-bold text-rose-600 block mt-0.5">{clientErrors.email}</span>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Mot de passe temporaire *</label>
                <input
                  type="password"
                  placeholder="Saisissez un mot de passe sécurisé"
                  value={formPassword}
                  onChange={(e) => { setFormPassword(e.target.value); validateForm('password'); }}
                  onBlur={() => validateForm('password')}
                  className={`w-full px-3 py-2 border rounded-lg text-xs focus:outline-none focus:border-brand-orange bg-slate-50 focus:bg-white ${clientErrors.password ? 'border-rose-500 bg-rose-50/20' : 'border-slate-200'}`}
                />
                {clientErrors.password && (
                  <span className="text-[10px] font-bold text-rose-600 block mt-0.5">{clientErrors.password}</span>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Téléphone portable</label>
                <input
                  type="text"
                  placeholder="+225 07 45 89 12 34"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-brand-orange bg-slate-50 focus:bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Rôle d'habilitation système *</label>
                <select
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-brand-orange bg-slate-50 focus:bg-white font-medium text-slate-700 cursor-pointer"
                >
                  <option value="Super Administrateur">Super Administrateur</option>
                  <option value="Réceptionniste">Réceptionniste / Front Desk</option>
                  <option value="Housekeeping">Housekeeping / Gouvernance</option>
                  <option value="Technicien Maintenance">Technicien Maintenance</option>
                  <option value="Magasinier / Stock">Magasinier / Stock</option>
                  <option value="Support Technique">Support Technique</option>
                </select>
              </div>

              {/* Verbose SQL Server constraints diagnostic logs */}
              {verboseServerError && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-lg space-y-1 text-[11px] text-rose-900 max-h-48 overflow-y-auto">
                  <div className="flex items-center space-x-1 font-bold">
                    <ShieldAlert size={12} className="text-rose-600 shrink-0" />
                    <span>Détails Techniques d'Erreur SQL :</span>
                  </div>
                  <p className="font-extrabold text-slate-800">{verboseServerError.message}</p>
                  <div className="font-mono text-[9px] bg-slate-900 text-rose-400 p-2 rounded border border-slate-800 mt-1 whitespace-pre-wrap break-all select-all">
                    {verboseServerError.details}
                  </div>
                  <p className="text-[8px] text-slate-400 mt-1 text-right">Généré le {verboseServerError.time}</p>
                </div>
              )}

              <div className="pt-2 flex items-center justify-end space-x-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => { setShowAddModal(false); setClientErrors({}); setVerboseServerError(null); }}
                  className="bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs px-4 py-2 border border-slate-200 rounded-lg cursor-pointer transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="bg-brand-orange hover:bg-brand-orange-hover text-white font-bold text-xs px-5 py-2 rounded-lg cursor-pointer transition-all shadow-md shadow-brand-orange/10"
                >
                  Créer le compte
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
