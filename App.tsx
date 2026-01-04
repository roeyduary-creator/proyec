import React, { useState, useMemo, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList
} from 'recharts';
import { 
  Database, BookOpen, Search, CheckCircle, XCircle, List, BarChart2, 
  Trophy, Activity, Baby, Stethoscope, Scissors, ArrowLeft, 
  EyeOff, RotateCcw, FileText, Clipboard, FolderOpen, Loader2, Filter, Layers
} from 'lucide-react';
import { INITIAL_DATA } from './data';
import { Question, ChartStat, Theme } from './types';

// --- TEMA VISUAL PROYECTO ACETATO ---
const THEME: Theme = {
  bg: '#DBDBDD',        // Gris claro (Fondo general)
  text: '#586C73',      // Azul grisáceo (Texto principal y estructura)
  textLight: '#7A8C93', // Azul grisáceo claro (Subtítulos)
  accent: '#E0AF26',    // Dorado (Acento distintivo)
  accentDark: '#B38B1D', // Dorado oscuro (Variante para Medicina Interna)
  white: '#FFFFFF',
  cardShadow: '0 4px 6px -1px rgba(88, 108, 115, 0.1), 0 2px 4px -1px rgba(88, 108, 115, 0.06)', 
};

const getIntensityColor = (value: number, max: number): string => {
  const limit = max > 0 ? max : 1;
  const ratio = Math.pow(value / limit, 0.8); 
  const hue = ((1 - ratio) * 160).toFixed(0);
  return `hsl(${hue}, 75%, 45%)`;
};

const wrapText = (text: string, maxChars: number): string[] => {
  if (!text) return [];
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = words[0];

  for (let i = 1; i < words.length; i++) {
    if ((currentLine + " " + words[i]).length <= maxChars) {
      currentLine += ' ' + words[i];
    } else {
      lines.push(currentLine);
      currentLine = words[i];
    }
  }
  lines.push(currentLine);
  return lines;
};

const CustomYAxisTick = (props: any) => {
  const { x, y, payload } = props;
  const lines = wrapText(payload.value, 35); 
  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} dy={-((lines.length - 1) * 6) + 3} textAnchor="end" fill={THEME.text} fontSize={11} fontWeight={600}>
        {lines.map((line, index) => (
          <tspan x={-10} dy={index === 0 ? 0 : 12} key={index}>
            {line}
          </tspan>
        ))}
      </text>
    </g>
  );
};

const App = () => {
  const [currentModule, setCurrentModule] = useState<string>('HOME'); 
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterYear, setFilterYear] = useState<string>('Todos');
  const [filterChapter, setFilterChapter] = useState<string>('Todos'); 
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [drillDownTopic, setDrillDownTopic] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    setDrillDownTopic(null);
  }, [currentModule, activeTab]);

  useEffect(() => {
    setFilterChapter('Todos');
  }, [currentModule, filterYear]);

  const handleModuleChange = (module: string) => {
    setIsLoading(true);
    setTimeout(() => {
      setCurrentModule(module);
      setIsLoading(false);
    }, 500);
  };

  const moduleData = useMemo(() => {
    let data: Question[] = [];
    if (currentModule === 'CIRUGIA') data = INITIAL_DATA.filter(q => q.specialty === 'Cirugía');
    else if (currentModule === 'GINOBS') data = INITIAL_DATA.filter(q => q.specialty === 'Gineco-Obstetricia');
    else if (currentModule === 'MEDINT') data = INITIAL_DATA.filter(q => q.specialty === 'Medicina Interna');
    else if (currentModule === 'PEDIATRIA') data = INITIAL_DATA.filter(q => q.specialty === 'Pediatría');
    return data;
  }, [currentModule]);

  const availableChapters = useMemo(() => {
    let data = moduleData;
    if (filterYear !== 'Todos') {
      data = data.filter(q => q.year.toString() === filterYear);
    }
    const chapters = [...new Set(data.map(q => q.chapter))].filter(Boolean).sort();
    return chapters;
  }, [moduleData, filterYear]);

  const filteredData = useMemo(() => {
    let data = moduleData;

    if (filterYear !== 'Todos') {
      data = data.filter(q => q.year.toString() === filterYear);
    }

    if (filterChapter !== 'Todos') {
        data = data.filter(q => q.chapter === filterChapter);
    }
    
    if (searchTerm) {
        data = data.filter(q => 
            q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
            q.chapter.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (q.subtopic && q.subtopic.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }

    return data;
  }, [moduleData, filterYear, filterChapter, searchTerm]);

  const chartStats = useMemo(() => {
    let sourceData = filteredData;
    let groupKey: keyof Question = 'chapter'; 

    if (currentModule === 'MEDINT' && drillDownTopic) {
      sourceData = filteredData.filter(q => q.chapter === drillDownTopic);
      groupKey = 'subtopic'; 
    }

    const counts = sourceData.reduce((acc: Record<string, number>, q) => {
      const key = (q[groupKey] as string) || 'General'; 
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    
    const sortedStats: ChartStat[] = Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    const maxVal = Math.max(...sortedStats.map(s => s.count), 1); 

    return sortedStats.map((item) => {
      const color = getIntensityColor(item.count, maxVal); 
      return { ...item, fill: color };
    });
  }, [filteredData, drillDownTopic, currentModule]);

  const handleOptionSelect = (questionId: number, option: string) => {
    setSelectedAnswers(prev => ({ ...prev, [questionId]: option }));
  };

  const resetModuleQuiz = () => {
    const visibleIds = filteredData.map(q => q.id);
    const nextState = { ...selectedAnswers };
    visibleIds.forEach(id => delete nextState[id]);
    setSelectedAnswers(nextState);
  };

  const handleBarClick = (data: any) => {
    if (currentModule === 'MEDINT' && !drillDownTopic && data && data.name) {
      setDrillDownTopic(data.name);
    }
  };

  const ModuleCard = ({ title, icon, count, onClick }: any) => (
    <div onClick={onClick} className="group cursor-pointer rounded-lg bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-lg relative overflow-hidden" style={{ boxShadow: THEME.cardShadow, borderLeft: `4px solid ${THEME.text}` }}>
      <div className="p-6 relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div className="p-3 rounded-md bg-slate-100 text-slate-600 group-hover:bg-slate-200 transition-colors">{icon}</div>
          <span className="text-3xl font-bold opacity-20" style={{ color: THEME.text }}>{count}</span>
        </div>
        <div>
          <h3 className="text-lg font-bold mb-1 tracking-tight" style={{ color: THEME.text }}>{title}</h3>
          <div className="flex items-center gap-1 text-xs font-semibold opacity-60" style={{ color: THEME.text }}>
            <FolderOpen size={12} /><span>Expediente de estudio</span>
          </div>
        </div>
      </div>
      <div className="absolute top-0 right-0 w-16 h-16 transform translate-x-8 -translate-y-8 rotate-45 opacity-10" style={{ backgroundColor: THEME.text }} />
    </div>
  );

  const StatCard = ({ title, value, icon, highlight = false }: any) => (
    <div className="rounded-lg p-5 relative overflow-hidden bg-white border border-slate-100" style={{ boxShadow: THEME.cardShadow }}>
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-md flex-shrink-0" style={{ backgroundColor: highlight ? `${THEME.accent}20` : '#f1f5f9', color: highlight ? THEME.accentDark : '#64748b' }}>{icon}</div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-0.5" style={{ color: THEME.text }}>{title}</p>
          <h3 className="text-2xl font-bold tracking-tight" style={{ color: THEME.text }}>{value}</h3>
        </div>
      </div>
    </div>
  );

  if (currentModule === 'HOME') {
    return (
      <div className="min-h-screen font-sans p-6 md:p-12 flex flex-col items-center justify-center relative" style={{ backgroundColor: THEME.bg, color: THEME.text }}>
        <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#586C73 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
        {isLoading ? (
           <div className="flex flex-col items-center justify-center animate-pulse">
             <Loader2 size={48} className="animate-spin text-slate-400 mb-4" />
             <span className="text-sm font-bold text-slate-500 tracking-widest uppercase">Cargando Módulo...</span>
           </div>
        ) : (
        <div className="max-w-5xl w-full space-y-10 animate-in fade-in zoom-in duration-500 relative z-10">
          <div className="text-center space-y-2">
            <h2 className="text-sm font-black tracking-[0.3em] uppercase mb-2" style={{ color: THEME.accent }}>PROYECTO ACETATO</h2>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tighter leading-tight" style={{ color: THEME.text }}>Plataforma de Análisis <span className="font-light">CONAREM</span></h1>
            <div className="w-16 h-1 mx-auto mt-6 rounded-full" style={{ backgroundColor: THEME.text }}></div>
            <p className="text-sm md:text-base opacity-70 max-w-xl mx-auto mt-4 leading-relaxed font-medium">Seleccione un módulo de estudio para acceder al desglose estadístico, rentabilidad por capítulo y banco de preguntas comentado.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <ModuleCard title="Cirugía General" icon={<Scissors size={24} strokeWidth={1.5} />} count={INITIAL_DATA.filter(q => q.specialty === 'Cirugía').length} onClick={() => handleModuleChange('CIRUGIA')} />
            <ModuleCard title="Ginecología y Obs." icon={<Baby size={24} strokeWidth={1.5} />} count={INITIAL_DATA.filter(q => q.specialty === 'Gineco-Obstetricia').length} onClick={() => handleModuleChange('GINOBS')} />
            <ModuleCard title="Pediatría" icon={<Trophy size={24} strokeWidth={1.5} />} count={INITIAL_DATA.filter(q => q.specialty === 'Pediatría').length} onClick={() => handleModuleChange('PEDIATRIA')} />
            <ModuleCard title="Medicina Interna" icon={<Stethoscope size={24} strokeWidth={1.5} />} count={INITIAL_DATA.filter(q => q.specialty === 'Medicina Interna').length} onClick={() => handleModuleChange('MEDINT')} />
          </div>
          <div className="text-center opacity-40 text-xs font-bold mt-12 flex items-center justify-center gap-2"><Database size={12} /> Base de datos actualizada: Ciclo 2025</div>
        </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans pb-20" style={{ backgroundColor: THEME.bg, color: THEME.text }}>
      <nav className="px-6 py-4 sticky top-0 z-50 backdrop-blur-md border-b border-white/20 shadow-sm" style={{ backgroundColor: 'rgba(235, 235, 237, 0.95)' }}>
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button onClick={() => setCurrentModule('HOME')} className="p-2 rounded-lg hover:bg-slate-200/50 transition-colors text-slate-500"><ArrowLeft size={20} /></button>
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider opacity-50 mb-0.5"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: THEME.accent }}></span>Proyecto Acetato</div>
              <h1 className="text-lg font-bold tracking-tight text-slate-700">{currentModule === 'CIRUGIA' ? 'Cirugía General' : currentModule === 'GINOBS' ? 'Gineco-Obstetricia' : currentModule === 'PEDIATRIA' ? 'Pediatría' : 'Medicina Interna'}</h1>
            </div>
          </div>
          <div className="flex p-1 rounded-lg bg-slate-200/50">
            <button onClick={() => setActiveTab('dashboard')} className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${activeTab === 'dashboard' ? 'bg-white shadow-sm text-slate-700' : 'text-slate-500 hover:text-slate-700'}`}><BarChart2 size={14} /> Análisis</button>
            <button onClick={() => setActiveTab('list')} className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${activeTab === 'list' ? 'bg-white shadow-sm text-slate-700' : 'text-slate-500 hover:text-slate-700'}`}><List size={14} /> Banco</button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6 space-y-8 animate-in slide-in-from-right-8 duration-500">
        <div className="flex flex-col md:flex-row justify-between items-center border-b border-slate-300/50 pb-4 gap-4">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <h2 className="text-xl font-light text-slate-500 flex items-center gap-2">
              <Clipboard size={20} />{activeTab === 'dashboard' ? 'Reporte Estadístico' : 'Banco de Preguntas'}
            </h2>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
            {activeTab === 'list' && (
              <>
               <button onClick={resetModuleQuiz} className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors bg-white px-3 py-2 rounded border border-slate-200 shadow-sm whitespace-nowrap"><RotateCcw size={14} /> Reiniciar</button>
               
               {/* FILTRO DE CAPÍTULO - CLASIFICACIÓN */}
               <div className="relative">
                 <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400"><Layers size={14} /></div>
                 <select 
                    className="bg-white pl-9 pr-8 py-2 rounded text-xs font-bold shadow-sm outline-none cursor-pointer border border-slate-200 text-slate-600 appearance-none hover:border-slate-300 transition-colors w-full md:w-[220px]"
                    value={filterChapter}
                    onChange={e => setFilterChapter(e.target.value)}
                 >
                   <option value="Todos">Todos los Capítulos</option>
                   {availableChapters.map((cat, idx) => (
                     <option key={idx} value={cat}>{cat}</option>
                   ))}
                 </select>
               </div>
              </>
            )}

            {/* FILTRO DE AÑO EXTENDIDO */}
            <div className="relative">
               <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400"><Filter size={14} /></div>
               <select 
                  className="bg-white pl-9 pr-8 py-2 rounded text-xs font-bold shadow-sm outline-none cursor-pointer border border-slate-200 text-slate-600 appearance-none hover:border-slate-300 transition-colors"
                  value={filterYear} 
                  onChange={e => setFilterYear(e.target.value)}
               >
                 <option value="Todos">Histórico (2018-2025)</option>
                 <option value="2025">Ciclo 2025</option>
                 <option value="2024">Ciclo 2024</option>
                 <option value="2023">Ciclo 2023</option>
                 <option value="2022">Ciclo 2022</option>
                 <option value="2021">Ciclo 2021</option>
                 <option value="2020">Ciclo 2020</option>
                 <option value="2019">Ciclo 2019</option>
                 <option value="2018">Ciclo 2018</option>
               </select>
            </div>
          </div>
        </div>

        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard title="Total Preguntas" value={filteredData.length} icon={<Database size={20}/>} />
              <StatCard title={drillDownTopic ? "Subtemas" : "Capítulos Evaluados"} value={chartStats.length} icon={<BookOpen size={20}/>} />
              <StatCard title="Tema Más Rentable" value={chartStats[0]?.name.split(':')[0] || 'N/A'} icon={<Trophy size={20}/>} highlight />
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-100">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                  <h3 className="font-bold text-slate-700 flex items-center gap-2">
                    {drillDownTopic && (<button onClick={() => setDrillDownTopic(null)} className="p-1 hover:bg-slate-100 rounded-full mr-1 transition-colors"><ArrowLeft size={18} className="text-slate-500" /></button>)}
                    <Activity size={18} className="text-slate-400"/>
                    {drillDownTopic ? `Análisis: ${drillDownTopic}` : "Mapa de Calor por Capítulos"}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">{drillDownTopic ? "Distribución de subtemas preguntados." : "Los colores indican la frecuencia histórica de cada capítulo."}</p>
                </div>
                <div className="flex gap-3 text-[10px] font-bold uppercase tracking-wide bg-slate-50 p-2 rounded-md border border-slate-100">
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{backgroundColor: '#10b981'}}></span> Baja</span>
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{backgroundColor: '#facc15'}}></span> Media</span>
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{backgroundColor: '#ef4444'}}></span> Alta</span>
                </div>
              </div>
              <div className="w-full" style={{ height: Math.max(600, chartStats.length * 65) + 'px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartStats} layout="vertical" margin={{ left: 10, right: 30 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" width={280} tick={<CustomYAxisTick />} interval={0} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{fill: '#f8fafc', radius: 4}} contentStyle={{borderRadius: '4px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'}} />
                    <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={24} onClick={handleBarClick} style={{ cursor: (currentModule === 'MEDINT' && !drillDownTopic) ? 'pointer' : 'default' }}>
                      {chartStats.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.fill} />))}
                      <LabelList dataKey="count" position="right" fill={THEME.text} fontSize={12} fontWeight={800} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'list' && (
          <div className="space-y-4">
              <div className="bg-white p-3 rounded-lg shadow-sm border border-slate-200 flex gap-3 sticky top-20 z-30 items-center">
                <Search className="text-slate-400" size={20} />
                <input type="text" placeholder="Buscar por palabra clave, diagnóstico o capítulo..." className="w-full outline-none text-sm font-medium text-slate-600 placeholder:font-normal bg-transparent" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                {searchTerm && (
                  <button onClick={() => setSearchTerm('')} className="text-xs font-bold text-slate-400 hover:text-slate-600 uppercase">Limpiar</button>
                )}
              </div>
              
              <div className="flex justify-between items-center px-1">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{filteredData.length} Preguntas clasificadas</span>
                <div className="flex gap-2">
                  {filterChapter !== 'Todos' && <span className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1"><Layers size={10}/> {filterChapter}</span>}
                  {filterYear !== 'Todos' && <span className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1"><Filter size={10}/> {filterYear}</span>}
                </div>
              </div>

              {filteredData.map((q) => {
                const userAnswer = selectedAnswers[q.id];
                const isAnswered = !!userAnswer;
                return (
                 <div key={q.id} className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 hover:border-slate-300 transition-colors">
                    <div className="flex justify-between mb-4 border-b border-slate-50 pb-3">
                      <div className="flex items-center gap-2">
                        <FileText size={14} className="text-slate-400"/>
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                          {q.chapter} {q.subtopic && <span className="font-normal text-slate-400 normal-case"> • {q.subtopic}</span>}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-bold uppercase">{q.specialty} {q.year}</span>
                        <span className="text-xs font-bold text-slate-400">#{q.id}</span>
                      </div>
                    </div>
                    <h3 className="text-base font-bold mb-6 text-slate-800 leading-relaxed">{q.question}</h3>
                    <div className="space-y-2">
                      {q.options.map((opt, i) => {
                        const isSelected = userAnswer === opt;
                        const isCorrect = opt === q.correctAnswer;
                        let optionStyle = "border-slate-100 bg-white hover:bg-slate-50 text-slate-600";
                        let icon = <div className="w-4 h-4 rounded-full border border-slate-300"></div>;
                        if (isAnswered) {
                          if (isCorrect) { optionStyle = `border-emerald-200 bg-emerald-50/50 text-emerald-900 font-medium`; icon = <CheckCircle size={16} className="text-emerald-600" />; } 
                          else if (isSelected && !isCorrect) { optionStyle = `border-red-200 bg-red-50/50 text-red-900`; icon = <XCircle size={16} className="text-red-500" />; } 
                          else { optionStyle = "border-transparent opacity-40 bg-slate-50"; icon = <div className="w-4 h-4 rounded-full border border-slate-200"></div>; }
                        }
                        return (
                          <button key={i} onClick={() => !isAnswered && handleOptionSelect(q.id, opt)} disabled={isAnswered} className={`w-full text-left flex items-start gap-3 p-3 rounded-md border transition-all duration-200 text-sm ${optionStyle} ${!isAnswered ? 'cursor-pointer' : 'cursor-default'}`}>
                             <div className="mt-0.5 flex-shrink-0">{icon}</div><span className="leading-snug">{opt}</span>
                          </button>
                        );
                      })}
                    </div>
                    {!isAnswered && (<div className="mt-4 flex justify-center"><span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1 bg-slate-50 px-2 py-1 rounded"><EyeOff size={10} /> Oculto</span></div>)}
                 </div>
                );
              })}
              {filteredData.length === 0 && (
                <div className="text-center py-20 opacity-40 font-bold text-slate-500 flex flex-col items-center gap-2">
                  <Database size={32} />
                  <p>No se encontraron registros con los filtros actuales.</p>
                </div>
              )}
          </div>
        )}
      </div>
    </div>
  );
};

export default App;