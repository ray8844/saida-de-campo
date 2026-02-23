import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { PageHeader, PlaceholderCard } from './components/Layout';
import { GroupsPage } from './pages/GroupsPage';
import { BrothersPage } from './pages/BrothersPage';
import { TerritoriesPage } from './pages/TerritoriesPage';
import { FieldServicePage } from './pages/FieldServicePage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';
import { AuthPage } from './pages/AuthPage';
import { SettingsProvider } from './contexts/SettingsContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { groupService } from './services/groupService';
import { brotherService } from './services/brotherService';
import { territoryService } from './services/territoryService';
import { fieldService } from './services/fieldService';
import { FieldServiceAssignment } from './types';
import { cn, formatDate, isTodayOrFuture } from './lib/utils';
import { isSupabaseConfigured } from './lib/supabase';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, Map, Users, UserCircle, Calendar as CalendarIcon, CheckCircle2, Clock, Sparkles, X } from 'lucide-react';

function TerritoryImageModal({ imageUrl, territoryName, onClose }: { imageUrl: string, territoryName: string, onClose: () => void }) {
  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={onClose}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="relative max-w-4xl w-full bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xl"
          onClick={e => e.stopPropagation()}
        >
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{territoryName}</h3>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
              <X size={20} className="text-slate-500" />
            </button>
          </div>
          <div className="aspect-video w-full bg-slate-100 dark:bg-slate-800">
            <img 
              src={imageUrl} 
              alt={territoryName} 
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  const pathname = location.pathname;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Allow public access to Dashboard and Login
  const isPublicPath = pathname === '/' || pathname === '/login';

  if (!user && !isPublicPath) {
    return <AuthPage />;
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <Sidebar />
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = React.useState({
    territories: 0,
    brothers: 0,
    groups: 0
  });
  const [upcoming, setUpcoming] = React.useState<FieldServiceAssignment[]>([]);
  const [nextAssignmentsByGroup, setNextAssignmentsByGroup] = React.useState<FieldServiceAssignment[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [selectedTerritoryImage, setSelectedTerritoryImage] = React.useState<{ url: string, name: string } | null>(null);

  React.useEffect(() => {
    const loadDashboardData = async () => {
      if (!isSupabaseConfigured) {
        setIsLoading(false);
        return;
      }
      try {
        const [groups, brothers, territories, assignments] = await Promise.all([
          groupService.getAll(),
          brotherService.getAll(),
          territoryService.getAll(),
          fieldService.getAll()
        ]);

        setStats({
          groups: groups.length,
          brothers: brothers.length,
          territories: territories.filter(t => t.ativo).length
        });

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Find the next assignment for EACH group
        const nextByGroup: FieldServiceAssignment[] = [];
        
        groups.forEach(group => {
          const groupAssignments = assignments
            .filter(a => a.grupo_id === group.id)
            .sort((a, b) => new Date(a.data_saida).getTime() - new Date(b.data_saida).getTime());
          
          const next = groupAssignments.find(a => isTodayOrFuture(a.data_saida));
          if (next) {
            nextByGroup.push(next);
          }
        });

        // Sort the group highlights by date
        setNextAssignmentsByGroup(nextByGroup.sort((a, b) => 
          new Date(a.data_saida).getTime() - new Date(b.data_saida).getTime()
        ));

        // Get recent assignments (last 8)
        setUpcoming(assignments.slice(0, 8));
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  return (
    <div className="space-y-8">
      <PageHeader 
        title="Dashboard" 
        description={user ? `Bem-vindo, ${user.email}. Veja o resumo da semana.` : 'Bem-vindo. Faça login para gerenciar os dados.'} 
      />

      {!isSupabaseConfigured && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-6 flex items-start gap-4"
        >
          <div className="p-2 bg-amber-100 dark:bg-amber-900/40 rounded-lg text-amber-600 dark:text-amber-400">
            <AlertTriangle size={24} />
          </div>
          <div>
            <h4 className="text-amber-900 dark:text-amber-100 font-semibold">Configuração Necessária</h4>
            <p className="text-amber-700 dark:text-amber-300 text-sm mt-1">
              As chaves do Supabase não foram encontradas. Para que o sistema funcione corretamente, 
              configure as variáveis <strong>VITE_SUPABASE_URL</strong> e <strong>VITE_SUPABASE_ANON_KEY</strong> 
              no painel de Secrets do AI Studio.
            </p>
          </div>
        </motion.div>
      )}

      {/* Featured Next Assignments by Group */}
      {nextAssignmentsByGroup.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 px-1">
            <Sparkles size={20} className="text-amber-500" />
            Próximas Saídas por Grupo
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {nextAssignmentsByGroup.map((next, idx) => (
              <motion.div
                key={next.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="relative overflow-hidden bg-emerald-600 rounded-3xl text-white shadow-xl shadow-emerald-600/20 group"
              >
                <div className="absolute inset-0 opacity-15 transition-opacity group-hover:opacity-25">
                  {next.territorio?.mapa_imagem_url ? (
                    <img 
                      src={next.territorio.mapa_imagem_url} 
                      alt="Mapa" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-emerald-400 to-emerald-800" />
                  )}
                </div>
                <div className="relative z-10 p-6 flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-wider">
                      {next.grupo?.nome_do_grupo}
                    </div>
                    <div className="flex items-center gap-1.5 text-emerald-100 text-xs font-medium">
                      <CalendarIcon size={14} />
                      {formatDate(next.data_saida)}
                    </div>
                  </div>
                  
                  <div>
                    <h4 
                      className="text-2xl font-black tracking-tight leading-tight mb-1 cursor-pointer hover:text-emerald-200 transition-colors"
                      onClick={() => next.territorio?.mapa_imagem_url && setSelectedTerritoryImage({ url: next.territorio.mapa_imagem_url, name: next.territorio.nome_territorio })}
                    >
                      {next.territorio?.nome_territorio}
                    </h4>
                    <div className="flex items-center gap-2 text-emerald-50">
                      <UserCircle size={18} className="text-emerald-200" />
                      <span className="font-semibold">{next.irmao?.nome_completo}</span>
                    </div>
                  </div>

                  {next.territorio?.mapa_imagem_url && (
                    <div className="absolute right-4 bottom-4 w-20 h-20 rounded-xl overflow-hidden border-2 border-white/30 shadow-lg rotate-6 group-hover:rotate-0 transition-transform duration-500 hidden sm:block">
                      <img 
                        src={next.territorio.mapa_imagem_url} 
                        alt="Território" 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Territórios Ativos', value: stats.territories, color: 'bg-blue-500', icon: Map },
          { label: 'Irmãos Cadastrados', value: stats.brothers, color: 'bg-emerald-500', icon: UserCircle },
          { label: 'Grupos de Campo', value: stats.groups, color: 'bg-amber-500', icon: Users },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group"
          >
            <div className="relative z-10">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.label}</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">
                {isLoading ? '...' : stat.value}
              </p>
            </div>
            <stat.icon className="absolute right-[-10px] bottom-[-10px] w-24 h-24 text-slate-100 dark:text-slate-800 transition-transform group-hover:scale-110" />
            <div className={`absolute bottom-0 left-0 h-1 w-full ${stat.color} opacity-20`} />
          </motion.div>
        ))}
      </div>
      
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <CalendarIcon size={20} className="text-emerald-600" />
          Últimas Designações
        </h3>
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8 text-slate-400">Carregando...</div>
          ) : upcoming.length === 0 ? (
            <div className="text-center py-8 text-slate-400 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-xl">
              Nenhuma designação recente encontrada.
            </div>
          ) : (
            upcoming.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center text-emerald-600">
                    <Map size={20} />
                  </div>
                  <div>
                    <p 
                      className="font-medium text-slate-900 dark:text-white cursor-pointer hover:text-emerald-600 transition-colors"
                      onClick={() => item.territorio?.mapa_imagem_url && setSelectedTerritoryImage({ url: item.territorio.mapa_imagem_url, name: item.territorio.nome_territorio })}
                    >
                      {item.territorio?.nome_territorio}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {item.irmao?.nome_completo} • {formatDate(item.data_saida)}
                    </p>
                  </div>
                </div>
                <div className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
                  item.status === 'concluido' 
                    ? "bg-emerald-100 text-emerald-700" 
                    : "bg-amber-100 text-amber-700"
                )}>
                  {item.status === 'concluido' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                  {item.status === 'concluido' ? 'Concluído' : 'Pendente'}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {selectedTerritoryImage && (
        <TerritoryImageModal 
          imageUrl={selectedTerritoryImage.url}
          territoryName={selectedTerritoryImage.name}
          onClose={() => setSelectedTerritoryImage(null)}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <Router>
          <ProtectedLayout>
            <AnimatePresence mode="wait">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/login" element={<AuthPage />} />
                <Route path="/grupos" element={<GroupsPage />} />
                <Route path="/irmaos" element={<BrothersPage />} />
                <Route path="/territorios" element={<TerritoriesPage />} />
                <Route path="/saida-de-campo" element={<FieldServicePage />} />
                <Route path="/relatorios" element={<ReportsPage />} />
                <Route path="/configuracoes" element={<SettingsPage />} />
              </Routes>
            </AnimatePresence>
          </ProtectedLayout>
        </Router>
      </SettingsProvider>
    </AuthProvider>
  );
}
