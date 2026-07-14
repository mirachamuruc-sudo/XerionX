import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, Plus, Trash2, LogOut, ShieldAlert, CheckCircle, Mail, DollarSign, Key, 
  Settings, UserPlus, Sliders, FileText, AlertCircle 
} from 'lucide-react';
import { Language, UserProfile, Team, TeamRole } from '../types';

interface TeamsViewProps {
  lang: Language;
  user: UserProfile;
  teams: Team[];
  onAddTeam: (name: string, desc: string, logo: string, banner: string) => Promise<any>;
  onDeleteTeam: (id: string) => Promise<any>;
  onAddMember: (teamId: string, email: string, role: TeamRole, limit: number) => Promise<any>;
  onRemoveMember: (teamId: string, userId: string) => Promise<any>;
  onAdjustMemberCredits: (teamId: string, userId: string, limit: number) => Promise<any>;
}

export default function TeamsView({
  lang,
  user,
  teams,
  onAddTeam,
  onDeleteTeam,
  onAddMember,
  onRemoveMember,
  onAdjustMemberCredits
}: TeamsViewProps) {
  const [activeTeamId, setActiveTeamId] = useState<string | null>(teams[0]?.id || null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  
  // Create Team state
  const [teamName, setTeamName] = useState('');
  const [teamDesc, setTeamDesc] = useState('');
  const [teamLogo, setTeamLogo] = useState('');
  const [teamBanner, setTeamBanner] = useState('');

  // Invite state
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<TeamRole>('MEMBER');
  const [inviteLimit, setInviteLimit] = useState(500);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeTeam = teams.find(t => t.id === activeTeamId) || null;
  const userInActiveTeam = activeTeam?.members.find(m => m.userId === user.uid) || null;
  const isOwnerOrAdmin = userInActiveTeam?.role === 'OWNER' || userInActiveTeam?.role === 'ADMIN';

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName) return;
    setLoading(true);
    setError(null);
    try {
      const res = await onAddTeam(teamName, teamDesc, teamLogo, teamBanner);
      if (res && res.id) {
        setActiveTeamId(res.id);
      }
      setTeamName('');
      setTeamDesc('');
      setTeamLogo('');
      setTeamBanner('');
      setShowCreateModal(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTeamId || !inviteEmail) return;
    setLoading(true);
    setError(null);
    try {
      await onAddMember(activeTeamId, inviteEmail, inviteRole, inviteLimit);
      setInviteEmail('');
      setInviteRole('MEMBER');
      setInviteLimit(500);
      setShowInviteModal(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!activeTeamId) return;
    if (confirm(lang === 'de' ? 'Bist du sicher, dass du dieses Mitglied entfernen möchtest?' : 'Are you sure you want to remove this member?')) {
      try {
        await onRemoveMember(activeTeamId, userId);
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  const handleAdjustLimit = async (userId: string, currentLimit: number) => {
    if (!activeTeamId) return;
    const newLimit = prompt(lang === 'de' ? 'Trage das neue monatliche Credit-Limit ein:' : 'Enter the new monthly credit quota limit:', currentLimit.toString());
    if (newLimit !== null && !isNaN(Number(newLimit))) {
      try {
        await onAdjustMemberCredits(activeTeamId, userId, Number(newLimit));
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  const handleDeleteTeamClick = async () => {
    if (!activeTeamId || !activeTeam) return;
    const confirmPhrase = lang === 'de' ? `Gebe 'LÖSCHEN' ein um das Team zu löschen:` : `Enter 'DELETE' to confirm team destruction:`;
    const check = prompt(confirmPhrase);
    if (check === 'LÖSCHEN' || check === 'DELETE') {
      try {
        await onDeleteTeam(activeTeamId);
        setActiveTeamId(teams[0]?.id || null);
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 py-6">
      
      {/* Upper header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-900 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-400" />
            <span>{lang === 'de' ? 'Team-Verwaltung' : 'Team Workspaces'}</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            {lang === 'de' ? 'Kollaboriere mit Entwicklern und verwalte Credit-Limits.' : 'Collaborate with fellow developers, set usage limits, and distribute credits.'}
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-4 py-2.5 rounded-lg text-sm transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-indigo-500/10"
        >
          <Plus className="w-4 h-4" />
          <span>{lang === 'de' ? 'Team erstellen' : 'Create New Team'}</span>
        </button>
      </div>

      {teams.length === 0 ? (
        /* Empty status view */
        <div className="text-center py-20 bg-slate-900/10 border border-slate-900 rounded-2xl max-w-xl mx-auto p-8 space-y-4">
          <Users className="w-12 h-12 text-indigo-400/20 mx-auto bg-indigo-500/5 p-3 rounded-full border border-indigo-500/10" />
          <h3 className="text-lg font-bold text-slate-200">{lang === 'de' ? 'Noch kein Team vorhanden' : 'No Active Teams'}</h3>
          <p className="text-slate-400 text-xs leading-relaxed">
            Erstelle ein Team, um Entwickler einzuladen, API-Schlüssel für Roblox und Discord zu teilen und Credit-Limits einzuführen.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-5 py-2 rounded-lg text-sm transition-all inline-block cursor-pointer"
          >
            Jetzt erstes Team erstellen
          </button>
        </div>
      ) : (
        /* Teams Layout dashboard */
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Side team selection */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest px-1">Deine Gilden</h3>
            {teams.map((t) => (
              <button
                key={t.id}
                onClick={() => { setActiveTeamId(t.id); setError(null); }}
                className={`w-full p-4 rounded-xl border text-left flex items-center gap-3.5 transition-all cursor-pointer ${
                  activeTeamId === t.id 
                    ? 'bg-indigo-600/10 border-indigo-500/30 text-slate-100 shadow-inner' 
                    : 'bg-slate-900/20 border-slate-900 text-slate-400 hover:text-slate-200'
                }`}
              >
                <img src={t.logo} alt={t.name} className="w-8 h-8 rounded-lg object-cover" referrerPolicy="no-referrer" />
                <div className="overflow-hidden">
                  <span className="font-bold text-xs block truncate">{t.name}</span>
                  <span className="text-[10px] text-slate-500 font-mono block">{t.members.length} Members</span>
                </div>
              </button>
            ))}
          </div>

          {/* Active Team detailed dashboard panel */}
          <div className="lg:col-span-3 space-y-6">
            {activeTeam && (
              <div className="bg-slate-900/20 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
                
                {/* Banner Header image */}
                <div className="h-28 w-full relative">
                  <img src={activeTeam.banner} alt={activeTeam.name} className="w-full h-full object-cover opacity-60" referrerPolicy="no-referrer" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent" />
                  <div className="absolute bottom-4 left-6 flex items-center gap-4">
                    <img src={activeTeam.logo} alt={activeTeam.name} className="w-12 h-12 rounded-xl object-cover border border-slate-800" referrerPolicy="no-referrer" />
                    <div>
                      <h2 className="text-lg font-bold text-slate-100">{activeTeam.name}</h2>
                      <p className="text-xs text-slate-400 line-clamp-1">{activeTeam.description}</p>
                    </div>
                  </div>
                </div>

                {/* Team Quota indicators */}
                <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-4 border-b border-slate-900 bg-slate-950/20 text-xs">
                  <div className="p-4 bg-slate-950 border border-slate-900 rounded-lg space-y-1">
                    <span className="text-slate-500 uppercase font-bold tracking-widest text-[9px] block">Team-Konto</span>
                    <span className="font-mono text-base font-bold text-slate-100">{activeTeam.credits} Credits</span>
                  </div>
                  <div className="p-4 bg-slate-950 border border-slate-900 rounded-lg space-y-1">
                    <span className="text-slate-500 uppercase font-bold tracking-widest text-[9px] block">Monatliches Limit</span>
                    <span className="font-mono text-base font-bold text-slate-100">{activeTeam.maxCredits} Credits</span>
                  </div>
                  <div className="p-4 bg-slate-950 border border-slate-900 rounded-lg space-y-1">
                    <span className="text-slate-500 uppercase font-bold tracking-widest text-[9px] block">Mitglieder Anzahl</span>
                    <span className="font-mono text-base font-bold text-indigo-400">{activeTeam.members.length} / 10 max</span>
                  </div>
                </div>

                {/* Team Members List */}
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-900">
                    <h3 className="font-bold text-sm text-slate-200">{lang === 'de' ? 'Teammitglieder' : 'Team Roster'}</h3>
                    {isOwnerOrAdmin && (
                      <button
                        onClick={() => setShowInviteModal(true)}
                        className="text-xs bg-indigo-600/10 border border-indigo-500/20 hover:bg-indigo-600/20 text-indigo-400 px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition-all font-medium"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>{lang === 'de' ? 'Mitglied hinzufügen' : 'Add Teammate'}</span>
                      </button>
                    )}
                  </div>

                  {/* Members table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-900 text-slate-500 uppercase tracking-wider text-[10px]">
                          <th className="pb-3">Benutzername</th>
                          <th className="pb-3">Rolle</th>
                          <th className="pb-3">Monats-Quota</th>
                          <th className="pb-3">Verbraucht</th>
                          {isOwnerOrAdmin && <th className="pb-3 text-right">Aktionen</th>}
                        </tr>
                      </thead>
                      <tbody>
                        {activeTeam.members.map((member) => {
                          const isSelf = member.userId === user.uid;
                          return (
                            <tr key={member.userId} className="border-b border-slate-900/40 text-slate-300 hover:bg-slate-900/5">
                              <td className="py-3.5 font-medium flex flex-col">
                                <span>{member.username}</span>
                                <span className="text-[10px] text-slate-500">{member.email}</span>
                              </td>
                              <td className="py-3.5">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                                  member.role === 'OWNER' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                                  member.role === 'ADMIN' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' :
                                  member.role === 'DEVELOPER' ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20' :
                                  'bg-slate-950 border border-slate-900 text-slate-400'
                                }`}>
                                  {member.role}
                                </span>
                              </td>
                              <td className="py-3.5 font-mono">{member.creditsLimit} Credits</td>
                              <td className="py-3.5 font-mono text-slate-400">{member.creditsUsed} Credits</td>
                              
                              {/* Member management Actions */}
                              {isOwnerOrAdmin && (
                                <td className="py-3.5 text-right space-x-1">
                                  {!isSelf && member.role !== 'OWNER' && (
                                    <>
                                      <button
                                        onClick={() => handleAdjustLimit(member.userId, member.creditsLimit)}
                                        className="p-1 hover:bg-slate-800 text-slate-400 hover:text-indigo-400 rounded cursor-pointer inline-flex"
                                        title="Limit anpassen"
                                      >
                                        <Sliders className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        onClick={() => handleRemoveMember(member.userId)}
                                        className="p-1 hover:bg-slate-800 text-slate-400 hover:text-red-400 rounded cursor-pointer inline-flex"
                                        title="Mitglied entfernen"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </>
                                  )}
                                </td>
                              )}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Owner Danger Operations Area */}
                  {userInActiveTeam?.role === 'OWNER' && (
                    <div className="mt-8 pt-6 border-t border-red-500/10 space-y-4">
                      <h4 className="text-xs font-semibold text-red-400 uppercase tracking-widest flex items-center gap-1.5">
                        <ShieldAlert className="w-4 h-4" />
                        <span>Danger Zone</span>
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Das Löschen des Teams zerstört alle Roblox-Konfigurationen, Discord-Bots und setzt die gemeinschaftlichen Quotas dauerhaft zurück.
                      </p>
                      <button
                        onClick={handleDeleteTeamClick}
                        className="bg-red-500/10 hover:bg-red-500 border border-red-500/20 text-red-400 hover:text-white px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                      >
                        {lang === 'de' ? 'Team dauerhaft auflösen' : 'Decommission Team Workspace'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CREATE TEAM MODAL */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[99] flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-xl p-6 relative space-y-4"
            >
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h3 className="font-bold text-slate-100">{lang === 'de' ? 'Neues Team erstellen' : 'Register New Guild'}</h3>
                <button onClick={() => setShowCreateModal(false)} className="text-slate-500 hover:text-slate-300">✕</button>
              </div>

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleCreateTeam} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{lang === 'de' ? 'Teamname' : 'Team Name'}</label>
                  <input
                    type="text"
                    required
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs focus:outline-none focus:border-indigo-500 text-slate-100"
                    placeholder="e.g. Nexus Studio"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{lang === 'de' ? 'Beschreibung' : 'Description'}</label>
                  <textarea
                    rows={2}
                    value={teamDesc}
                    onChange={(e) => setTeamDesc(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs focus:outline-none focus:border-indigo-500 text-slate-100 resize-none"
                    placeholder="e.g. Roblox game design & bot dev team"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{lang === 'de' ? 'Logo URL (Optional)' : 'Logo Image URL'}</label>
                  <input
                    type="text"
                    value={teamLogo}
                    onChange={(e) => setTeamLogo(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs focus:outline-none focus:border-indigo-500 text-slate-100"
                    placeholder="https://images.unsplash.com..."
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{lang === 'de' ? 'Banner URL (Optional)' : 'Banner Image URL'}</label>
                  <input
                    type="text"
                    value={teamBanner}
                    onChange={(e) => setTeamBanner(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs focus:outline-none focus:border-indigo-500 text-slate-100"
                    placeholder="https://images.unsplash.com..."
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-lg text-xs transition-all shadow-md shadow-indigo-500/10 cursor-pointer"
                >
                  {loading ? 'Creating...' : lang === 'de' ? 'Team jetzt erstellen' : 'Assemble Team Now'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* INVITE MEMBER MODAL */}
      <AnimatePresence>
        {showInviteModal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[99] flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-xl p-6 relative space-y-4"
            >
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h3 className="font-bold text-slate-100">{lang === 'de' ? 'Mitglied einladen' : 'Invite New Teammate'}</h3>
                <button onClick={() => setShowInviteModal(false)} className="text-slate-500 hover:text-slate-300">✕</button>
              </div>

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleInviteMember} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{lang === 'de' ? 'E-Mail-Adresse des Mitglieds' : 'User Email Address'}</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />
                    <input
                      type="email"
                      required
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 pl-10 pr-4 text-xs focus:outline-none focus:border-indigo-500 text-slate-100"
                      placeholder="mirachamuruc@gmail.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{lang === 'de' ? 'Rolle' : 'Team Role'}</label>
                    <select
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value as TeamRole)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="ADMIN">ADMIN</option>
                      <option value="DEVELOPER">DEVELOPER</option>
                      <option value="MODERATOR">MODERATOR</option>
                      <option value="MEMBER">MEMBER</option>
                      <option value="VIEWER">VIEWER</option>
                    </select>
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{lang === 'de' ? 'Credit-Limit' : 'Credit Limit'}</label>
                    <input
                      type="number"
                      required
                      value={inviteLimit}
                      onChange={(e) => setInviteLimit(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs focus:outline-none focus:border-indigo-500 text-slate-100"
                      placeholder="500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-lg text-xs transition-all shadow-md shadow-indigo-500/10 cursor-pointer"
                >
                  {loading ? 'Adding...' : lang === 'de' ? 'Einladung senden' : 'Add Teammate Now'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
