import React, { useState, useMemo, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList, Treemap, PieChart, Pie, Legend
} from 'recharts';
import { 
  Database, BookOpen, Search, CheckCircle, XCircle, List, BarChart2, 
  Trophy, Activity, Baby, Stethoscope, Scissors, ArrowLeft, 
  EyeOff, RotateCcw, FileText, Clipboard, FolderOpen, Loader2, Filter, Layers,
  PieChart as PieIcon, LayoutList, Book, Grid, Zap, Target, Microscope, Calendar
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

// --- DATA NORMALIZATION LAYER (DICCIONARIO DE UNIFICACIÓN) ---
// Esta función corrige los nombres de capítulos "sucios" o variantes OCR
const normalizeChapter = (rawChapter: string, module: string): string => {
  if (!rawChapter) return 'Sin Capítulo';
  if (module !== 'CIRUGIA') return rawChapter; // Aplicar normalización estricta principalmente a Cirugía

  const text = rawChapter.toLowerCase();
  
  // Reglas de Unificación para Cirugía
  if (text.includes('19') || (text.includes('pared') && text.includes('tórax')) || text.includes('mediastino') || text.includes('medias') || text.includes('pulmón')) {
      return "Cap 19: Pared Torácica, Pulmón, Mediastino y Pleura";
  }
  if (text.includes('29') || (text.includes('colon') && text.includes('recto'))) {
      return "Cap 29: Colon, Recto y Ano";
  }
  if (text.includes('30') || text.includes('apéndice')) return "Cap 30: Apéndice";
  if (text.includes('32') || text.includes('biliares') || text.includes('vesícula')) return "Cap 32: Vías Biliares";
  if (text.includes('33') || text.includes('páncreas')) return "Cap 33: Páncreas";
  if (text.includes('35') || text.includes('pared abdominal') || text.includes('hernia')) return "Cap 35: Pared Abdominal";
  if ((text.includes('7') && text.includes('trauma')) || text.includes('traumatismos')) return "Cap 7: Trauma";
  if ((text.includes('6') && text.includes('infecc')) || text.includes('infecciones quirúrgicas')) return "Cap 6: Infecciones Quirúrgicas";
  if (text.includes('28') || text.includes('intestino delgado')) return "Cap 28: Intestino Delgado";
  if (text.includes('26') || text.includes('estómago')) return "Cap 26: Estómago";
  if (text.includes('25') || text.includes('esófago')) return "Cap 25: Esófago y Hernia Diafragmática";
  if ((text.includes('8') && text.includes('quemad')) || text.includes('quemaduras')) return "Cap 8: Quemaduras";
  if (text.includes('31') || text.includes('hígado')) return "Cap 31: Hígado";
  if (text.includes('46') || text.includes('anestesia')) return "Cap 46: Anestesia del Paciente Quirúrgico";
  if (text.includes('16') || (text.includes('piel') && text.includes('tejido'))) return "Cap 16: Piel y Tejido Subcutáneo";
  if (text.includes('38') || text.includes('tiroides')) return "Cap 38: Tiroides";
  if (text.includes('17') || text.includes('mama')) return "Cap 17: Mama";
  if (text.includes('27') || text.includes('obesidad')) return "Cap 27: Tratamiento Quirúrgico de la Obesidad";
  if (text.includes('34') || text.includes('bazo')) return "Cap 34: Bazo";
  if (text.includes('23') || text.includes('arteriales')) return "Cap 23: Enfermedades Arteriales";
  if (text.includes('9') && text.includes('cicatriz')) return "Cap 9: Cicatrización";
  if (text.includes('12') && text.includes('seguridad')) return "Cap 12: Seguridad del Paciente";
  if (text.includes('24') || (text.includes('venosa') && text.includes('linfática'))) return "Cap 24: Enfermedad Venosa y Linfática";
  if (text.includes('3') && text.includes('líquidos')) return "Cap 3: Manejo de Líquidos y Electrolitos";

  return rawChapter;
};

// --- SUBTOPIC NORMALIZATION LAYER (MEDICINA INTERNA) ---
const normalizeSubtopic = (rawSubtopic: string | undefined, module: string): string => {
  if (!rawSubtopic) return 'General';
  if (module !== 'MEDINT') return rawSubtopic;

  const text = rawSubtopic.toLowerCase().trim();
  
  if (text.includes('diabetes')) return 'Diabetes Mellitus';
  if (text.includes('artritis') && (text.includes('reumatoide') || text.includes('reumatoidea'))) return 'Artritis Reumatoide';
  if (text.includes('lupus')) return 'Lupus Eritematoso Sistémico';
  if (text.includes('insuficiencia') && (text.includes('cardiaca') || text.includes('cardíaca'))) return 'Insuficiencia Cardíaca';
  if (text.includes('hipertensión') || text.includes('hipértension')) return 'Hipertensión Arterial';
  if (text.includes('shock') || (text.includes('sepsis') || text.includes('septicemia'))) return 'Sepsis y Shock';
  if (text.includes('renal crónica') || text.includes('nefropatía crónica')) return 'Enfermedad Renal Crónica';
  if (text.includes('renal aguda') || text.includes('injuria renal') || text.includes('necrosis tubular')) return 'Insuficiencia Renal Aguda';
  if (text.includes('litiasis')) return 'Litiasis Renal';
  if (text.includes('neumonía') || text.includes('neumonia')) return 'Neumonía';
  if (text.includes('derrame') && text.includes('pleural')) return 'Derrame Pleural';
  if (text.includes('cefalea')) return 'Cefaleas';
  if (text.includes('convulsi') || text.includes('epilep')) return 'Epilepsia y Convulsiones';
  if (text.includes('guillain')) return 'Síndrome de Guillain-Barré';
  if (text.includes('inflamatoria intestinal') || text.includes('colitis ulcerosa') || text.includes('crohn')) return 'Enfermedad Inflamatoria Intestinal';
  if (text.includes('cirrosis')) return 'Cirrosis Hepática';
  if (text.includes('hepatitis')) return 'Hepatitis';
  if (text.includes('isquémica') || text.includes('coronaria') || text.includes('infarto')) return 'Cardiopatía Isquémica';
  if (text.includes('vasculitis') || text.includes('arteritis')) return 'Vasculitis';
  if (text.includes('paliativo') || text.includes('final de la vida') || text.includes('malas noticias')) return 'Cuidados Paliativos';
  if (text.includes('glomerul') || text.includes('nefritis')) return 'Glomerulopatías';
  if (text.includes('tiroides') || text.includes('tiroideo') || text.includes('hipotiroidismo') || text.includes('hipertiroidismo')) return 'Patología Tiroidea';
  if (text.includes('suprarrenal') || text.includes('cushing')) return 'Patología Suprarrenal';
  if (text.includes('arritmia') || text.includes('fibrilación auricular') || text.includes('bloqueo av')) return 'Arritmias';
  if (text.includes('epoc')) return 'EPOC';
  if (text.includes('asma')) return 'Asma';

  return rawSubtopic;
};

// --- PEDIATRICS PARSING LOGIC ---
const getPediatricsArea = (chapter: string, subtopic?: string): string => {
  const text = (chapter + " " + (subtopic || "")).toLowerCase();
  
  if (text.includes('neonat') || text.includes('recién nacido') || text.includes('apgar')) return 'Neonatología';
  if (text.includes('vacuna') || text.includes('inmuniza') || text.includes('pai') || text.includes('niño sano') || text.includes('crecimiento') || text.includes('desarrollo') || text.includes('lactancia') || text.includes('nutrición') || text.includes('desnutri') || text.includes('vitamina') || text.includes('zinc')) return 'Niño Sano y Preventiva';
  if (text.includes('respirator') || text.includes('neumon') || text.includes('bronquio') || text.includes('asma') || text.includes('crup') || text.includes('tos')) return 'Respiratorio';
  if (text.includes('infect') || text.includes('dengue') || text.includes('covid') || text.includes('bacteri') || text.includes('virus') || text.includes('parotiditis') || text.includes('sarampión') || text.includes('varicela') || text.includes('vih') || text.includes('sida') || text.includes('parasit') || text.includes('amebiasis') || text.includes('ascaris') || text.includes('enterobiasis')) return 'Infectología';
  if (text.includes('urgencia') || text.includes('emergencia') || text.includes('shock') || text.includes('quemadura') || text.includes('intoxicaci') || text.includes('trauma') || text.includes('reanimación') || text.includes('paro') || text.includes('anafilaxia') || text.includes('cuerpo extraño')) return 'Urgencias y Trauma';
  if (text.includes('gastro') || text.includes('diarrea') || text.includes('vómito') || text.includes('abdomen') || text.includes('apéndice') || text.includes('píloro') || text.includes('invaginación') || text.includes('constipación') || text.includes('hepatitis')) return 'Gastroenterología';
  if (text.includes('neuro') || text.includes('convulsi') || text.includes('epilep') || text.includes('meningitis') || text.includes('cefalea') || text.includes('autismo')) return 'Neurología';
  if (text.includes('renal') || text.includes('urinari') || text.includes('itu') || text.includes('nefr') || text.includes('glomerulo')) return 'Nefrología';
  if (text.includes('cardio') || text.includes('corazón') || text.includes('soplo')) return 'Cardiología';
  
  return 'Otras Especialidades';
};

// --- SURGERY MICRO-ANALYSIS LOGIC ---
const analyzeSurgeryConcept = (questionText: string, chapterName: string): string => {
  const txt = questionText.toLowerCase();
  const chap = chapterName.toLowerCase();

  // 1. Colon, Recto y Ano
  if (chap.includes('colon') || chap.includes('recto') || chap.includes('ano')) {
    if (txt.includes('diverti') || txt.includes('hinchey') || txt.includes('fístula colovesical')) return 'Enf. Diverticular';
    if (txt.includes('cáncer') || txt.includes('adenocarcinoma') || txt.includes('margen') || txt.includes('polipo') || txt.includes('tamizaje') || txt.includes('sangre oculta') || txt.includes('cea')) return 'Oncología Colorrectal';
    if (txt.includes('hemorroid') || txt.includes('fisura') || txt.includes('fístula') || txt.includes('absceso') || txt.includes('condiloma')) return 'Patología Benigna/Orificial';
    if (txt.includes('vólvulo') || txt.includes('ogilvie') || txt.includes('obstrucción') || txt.includes('trauma') || txt.includes('herida')) return 'Urgencias/Trauma Colónico';
    if (txt.includes('colostom') || txt.includes('hartmann')) return 'Técnica Quirúrgica';
    return 'Otras Patologías Colónicas';
  }
  // ... (otros casos similares) ...
  return 'Conceptos Generales';
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
          <tspan x={-10} dy={index === 0 ? 0 : 12} key={index}>{line}</tspan>
        ))}
      </text>
    </g>
  );
};

const CustomTreemapContent = (props: any) => {
  const { root, depth, x, y, width, height, index, name, value } = props;
  return (
    <g>
      <rect
        x={x} y={y} width={width} height={height}
        style={{ fill: getIntensityColor(value, root.value * 0.4), stroke: '#fff', strokeWidth: 2, strokeOpacity: 1 }}
      />
      {width > 50 && height > 30 && (
        <text x={x + width / 2} y={y + height / 2} textAnchor="middle" fill="#fff" fontSize={Math.min(14, width / 8)} fontWeight={700} style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
          {name}
          <tspan x={x + width / 2} dy="1.2em" fontSize={Math.min(12, width / 10)} fontWeight={400}>{value} pregs.</tspan>
        </text>
      )}
    </g>
  );
};

const App = () => {
  const [currentModule, setCurrentModule] = useState<string>('HOME'); 
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  const AVAILABLE_YEARS = [2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018];
  const [startYear, setStartYear] = useState<number>(2018);
  const [endYear, setEndYear] = useState<number>(2025);

  const [filterChapter, setFilterChapter] = useState<string>('Todos'); 
  const [filterStatus, setFilterStatus] = useState<string>('Todos'); 
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({}); // Store key (a,b,c...)
  const [drillDownTopic, setDrillDownTopic] = useState<string | null>(null);
  const [drillDownFilter, setDrillDownFilter] = useState<string | null>(null); 
  const [viewMode, setViewMode] = useState<string>('chapters');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    setDrillDownTopic(null);
    setDrillDownFilter(null);
    if (currentModule === 'PEDIATRIA') setViewMode('areas'); 
    else if (currentModule === 'CIRUGIA') setViewMode('chapters'); 
    else setViewMode('chapters');
  }, [currentModule]);

  useEffect(() => {
    setFilterChapter('Todos');
    setFilterStatus('Todos');
  }, [currentModule, startYear, endYear]);

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
    
    // 1. DEDUPLICACIÓN (Updated to use q.pregunta)
    const uniqueMap = new Map();
    data.forEach(q => {
        const key = q.pregunta.trim();
        if (!uniqueMap.has(key)) {
            uniqueMap.set(key, q);
        }
    });
    const uniqueData = Array.from(uniqueMap.values());

    // 2. NORMALIZACIÓN (Updated to use q.tema)
    return uniqueData.map(q => ({
        ...q,
        tema: normalizeChapter(q.tema, currentModule),
        subtopic: normalizeSubtopic(q.subtopic, currentModule)
    }));
  }, [currentModule]);

  const availableChapters = useMemo(() => {
    let data = moduleData;
    data = data.filter(q => q.year >= startYear && q.year <= endYear);
    const chapters = [...new Set(data.map(q => q.tema))].filter(Boolean).sort();
    return chapters;
  }, [moduleData, startYear, endYear]);

  const filteredData = useMemo(() => {
    let data = moduleData;
    data = data.filter(q => q.year >= startYear && q.year <= endYear);

    if (filterChapter !== 'Todos') {
        data = data.filter(q => q.tema === filterChapter);
    }
    
    if (searchTerm) {
        data = data.filter(q => 
            q.pregunta.toLowerCase().includes(searchTerm.toLowerCase()) ||
            q.tema.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (q.subtopic && q.subtopic.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }

    if (filterStatus !== 'Todos') {
        data = data.filter(q => {
            const answer = selectedAnswers[q.id]; // This is 'a', 'b', etc.
            if (filterStatus === 'Pendientes') return !answer;
            if (filterStatus === 'Correctas') return answer === q.respuesta;
            if (filterStatus === 'Incorrectas') return answer && answer !== q.respuesta;
            return true;
        });
    }

    if (currentModule === 'CIRUGIA' && drillDownTopic && drillDownFilter) {
       data = data.filter(q => {
          if (q.tema !== drillDownTopic) return false;
          const concept = analyzeSurgeryConcept(q.pregunta, q.tema);
          return concept === drillDownFilter;
       });
    } else if (currentModule === 'CIRUGIA' && drillDownTopic) {
        data = data.filter(q => q.tema === drillDownTopic);
    }

    return data;
  }, [moduleData, startYear, endYear, filterChapter, filterStatus, searchTerm, drillDownTopic, drillDownFilter, currentModule, selectedAnswers]);

  const chartStats = useMemo(() => {
    let sourceData = filteredData;
    if (currentModule === 'CIRUGIA' && drillDownTopic) {
        sourceData = moduleData.filter(q => q.year >= startYear && q.year <= endYear);
    }

    let groupKey: keyof Question = 'tema'; 
    let useCustomGrouping = false;

    if (currentModule === 'MEDINT') {
      if (viewMode === 'subtopics') {
        groupKey = 'subtopic';
      } else if (drillDownTopic) {
        sourceData = filteredData.filter(q => q.tema === drillDownTopic);
        groupKey = 'subtopic'; 
      }
    }

    if ((currentModule === 'GINOBS' && viewMode === 'bibliography') || 
        (currentModule === 'PEDIATRIA' && (viewMode === 'bibliography' || viewMode === 'areas'))) {
      useCustomGrouping = true;
    }

    if (currentModule === 'CIRUGIA' && drillDownTopic) {
       sourceData = sourceData.filter(q => q.tema === drillDownTopic);
    }

    const counts = sourceData.reduce((acc: Record<string, number>, q) => {
      let key = '';

      if (currentModule === 'CIRUGIA' && drillDownTopic) {
          key = analyzeSurgeryConcept(q.pregunta, q.tema);
      } else if (useCustomGrouping) {
        const chapterStr = q.tema || '';
        const lowerChap = chapterStr.toLowerCase();
        // ... (existing grouping logic for Pediatria/GinObs but using q.tema) ...
        if (currentModule === 'PEDIATRIA' && viewMode === 'areas') {
           key = getPediatricsArea(q.tema, q.subtopic);
        } else {
           key = chapterStr.split('-')[0].trim();
           if (!key) key = 'Otros / No especificado';
        }
      } else {
        key = (q[groupKey] as string);
        if (!key || key.trim() === '') {
          key = groupKey === 'subtopic' ? 'General / No especificado' : 'General';
        }
      }
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const sortedStats: ChartStat[] = Object.entries(counts)
      .map(([name, count]) => ({ name, count: count as number }))
      .sort((a, b) => b.count - a.count);

    const maxVal = Math.max(...sortedStats.map(s => s.count), 1); 
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

    return sortedStats.map((item, index) => {
      const color = (currentModule === 'CIRUGIA' && drillDownTopic) 
        ? COLORS[index % COLORS.length] 
        : getIntensityColor(item.count, maxVal); 
      return { ...item, fill: color };
    });
  }, [filteredData, drillDownTopic, currentModule, viewMode, startYear, endYear, moduleData]);

  const handleOptionSelect = (questionId: number, key: string) => {
    setSelectedAnswers(prev => ({ ...prev, [questionId]: key }));
  };

  const resetModuleQuiz = () => {
    const visibleIds = filteredData.map(q => q.id);
    const nextState = { ...selectedAnswers };
    visibleIds.forEach(id => delete nextState[id]);
    setSelectedAnswers(nextState);
  };

  const scoreStats = useMemo(() => {
    let answered = 0;
    let correct = 0;
    filteredData.forEach(q => {
      if (selectedAnswers[q.id]) {
        answered++;
        if (selectedAnswers[q.id] === q.respuesta) {
          correct++;
        }
      }
    });
    const percentage = answered > 0 ? Math.round((correct / answered) * 100) : 0;
    return { answered, correct, percentage, total: filteredData.length };
  }, [filteredData, selectedAnswers]);

  const handleChartClick = (data: any) => {
    if (!data || !data.name) return;
    if (currentModule === 'CIRUGIA' && !drillDownTopic && viewMode === 'chapters') {
        setDrillDownTopic(data.name);
        setDrillDownFilter(null); 
        return;
    }
    if (currentModule === 'CIRUGIA' && drillDownTopic) {
        setDrillDownFilter(data.name); 
        setActiveTab('list'); 
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
    }
    if (currentModule === 'MEDINT' && !drillDownTopic && viewMode === 'chapters') {
      setDrillDownTopic(data.name);
      return;
    }
    const searchTermToUse = data.name.split(':')[0].trim(); 
    setSearchTerm(searchTermToUse);
    setFilterChapter('Todos');
    setActiveTab('list');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetDrillDown = () => {
      setDrillDownTopic(null);
      setDrillDownFilter(null);
  }

  // ... (ModuleCard and StatCard components remain same) ...
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

  // Main UI
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

               <div className="relative">
                 <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400"><Target size={14} /></div>
                 <select 
                    className="bg-white pl-9 pr-8 py-2 rounded text-xs font-bold shadow-sm outline-none cursor-pointer border border-slate-200 text-slate-600 appearance-none hover:border-slate-300 transition-colors w-full md:w-[150px]"
                    value={filterStatus}
                    onChange={e => setFilterStatus(e.target.value)}
                 >
                   <option value="Todos">Todos</option>
                   <option value="Pendientes">Pendientes</option>
                   <option value="Correctas">Correctas</option>
                   <option value="Incorrectas">Incorrectas</option>
                 </select>
               </div>
              </>
            )}

            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-slate-200 shadow-sm">
               <Calendar size={14} className="text-slate-400" />
               <select 
                  className="bg-transparent text-xs font-bold outline-none cursor-pointer text-slate-600 hover:text-slate-800"
                  value={startYear} 
                  onChange={e => setStartYear(parseInt(e.target.value))}
               >
                 {AVAILABLE_YEARS.slice().reverse().map(y => (
                    <option key={`start-${y}`} value={y}>{y}</option>
                 ))}
               </select>
               <span className="text-slate-400 text-xs">-</span>
               <select 
                  className="bg-transparent text-xs font-bold outline-none cursor-pointer text-slate-600 hover:text-slate-800"
                  value={endYear} 
                  onChange={e => setEndYear(parseInt(e.target.value))}
               >
                 {AVAILABLE_YEARS.map(y => (
                    <option key={`end-${y}`} value={y}>{y}</option>
                 ))}
               </select>
            </div>
          </div>
        </div>

        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard title="Total Preguntas" value={filteredData.length} icon={<Database size={20}/>} />
              <StatCard title={drillDownTopic || viewMode === 'subtopics' ? "Subtemas Identificados" : viewMode === 'bibliography' ? "Fuentes Bibliográficas" : ((viewMode === 'areas' && currentModule === 'PEDIATRIA') ? 'Áreas Clínicas' : "Capítulos Evaluados")} value={chartStats.length} icon={<BookOpen size={20}/>} />
              <StatCard title="Tema Más Rentable" value={chartStats[0]?.name.split(':')[0] || 'N/A'} icon={<Trophy size={20}/>} highlight />
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-100">
               {/* Chart Component Here (Same logic but using chartStats which is already adapted) */}
               <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                  <h3 className="font-bold text-slate-700 flex items-center gap-2">
                    {drillDownTopic && (<button onClick={resetDrillDown} className="p-1 hover:bg-slate-100 rounded-full mr-1 transition-colors"><ArrowLeft size={18} className="text-slate-500" /></button>)}
                    <Activity size={18} className="text-slate-400"/>
                    {drillDownTopic 
                      ? `Análisis Microscópico: ${drillDownTopic}` 
                      : viewMode === 'subtopics' 
                        ? "Ranking de Subtemas (Global)" 
                        : viewMode === 'bibliography' 
                          ? "Distribución por Bibliografía"
                          : (viewMode === 'areas' && currentModule === 'PEDIATRIA')
                            ? "Mapa de Calor por Bloques Temáticos"
                            : "Mapa de Calor por Capítulos"}
                  </h3>
                   {/* ... (View toggles code same as before, no logic change needed) ... */}
                </div>
               </div>
               
               <div className="w-full" style={{ height: Math.max(600, chartStats.length * 65) + 'px' }}>
                <ResponsiveContainer width="100%" height="100%">
                   {(currentModule === 'PEDIATRIA') && viewMode === 'areas' && !drillDownTopic ? (
                    <Treemap
                      data={chartStats}
                      dataKey="count"
                      aspectRatio={4 / 3}
                      stroke="#fff"
                      fill="#8884d8"
                      content={<CustomTreemapContent />}
                      onClick={handleChartClick}
                      style={{ cursor: 'pointer' }}
                    >
                      <Tooltip contentStyle={{borderRadius: '4px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'}} itemStyle={{ color: '#333', fontWeight: 'bold' }} formatter={(value: any) => [`${value} preguntas`, 'Cantidad']} />
                    </Treemap>
                   ) : (currentModule === 'CIRUGIA' && drillDownTopic) ? (
                    <div className="flex flex-col items-center h-full">
                       <div className="w-full h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={chartStats}
                                    dataKey="count"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={150}
                                    fill="#8884d8"
                                    label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                                        const RADIAN = Math.PI / 180;
                                        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                                        const x = cx + radius * Math.cos(-midAngle * RADIAN);
                                        const y = cy + radius * Math.sin(-midAngle * RADIAN);
                                        return percent > 0.05 ? <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={12} fontWeight={700}>{`${(percent * 100).toFixed(0)}%`}</text> : null;
                                    }}
                                    onClick={handleChartClick}
                                    cursor="pointer"
                                >
                                    {chartStats.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} stroke="#fff" strokeWidth={2}/>
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{fontSize: '12px', fontWeight: 600}} />
                            </PieChart>
                        </ResponsiveContainer>
                       </div>
                    </div>
                   ) : (
                    <BarChart data={chartStats} layout="vertical" margin={{ left: 10, right: 30 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                      <XAxis type="number" hide />
                      <YAxis dataKey="name" type="category" width={280} tick={<CustomYAxisTick />} interval={0} axisLine={false} tickLine={false} />
                      <Tooltip cursor={{fill: '#f8fafc', radius: 4}} contentStyle={{borderRadius: '4px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'}} />
                      <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={24} onClick={handleChartClick} style={{ cursor: 'pointer' }}>
                        {chartStats.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.fill} />))}
                        <LabelList dataKey="count" position="right" fill={THEME.text} fontSize={12} fontWeight={800} formatter={(v: any) => v} />
                      </Bar>
                    </BarChart>
                   )}
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
              
              <div className="flex flex-col md:flex-row justify-between items-center px-1 gap-2">
                <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{filteredData.length} Preguntas clasificadas</span>
                    {drillDownFilter && (
                        <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 border border-emerald-200">
                            <Microscope size={10} /> Filtro Patológico: {drillDownFilter}
                            <button onClick={() => setDrillDownFilter(null)} className="ml-1 hover:text-emerald-900"><XCircle size={10} /></button>
                        </span>
                    )}
                </div>
                {scoreStats.answered > 0 && (
                  <div className="flex items-center gap-4 bg-slate-800 text-white px-4 py-2 rounded-full shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center gap-2">
                        <Target size={16} className="text-emerald-400" />
                        <span className="text-xs font-bold">Progreso: {scoreStats.answered}/{scoreStats.total}</span>
                    </div>
                    <div className="w-px h-4 bg-white/20"></div>
                    <div className="flex items-center gap-2">
                        <span className={`text-xs font-black ${scoreStats.percentage >= 60 ? 'text-emerald-400' : 'text-amber-400'}`}>{scoreStats.percentage}% Aciertos</span>
                    </div>
                  </div>
                )}
              </div>

              {filteredData.map((q) => {
                const userAnswer = selectedAnswers[q.id]; // 'a', 'b', etc.
                const isAnswered = !!userAnswer;
                return (
                 <div key={q.id} className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 hover:border-slate-300 transition-colors">
                    <div className="flex justify-between mb-4 border-b border-slate-50 pb-3">
                      <div className="flex items-center gap-2">
                        <FileText size={14} className="text-slate-400"/>
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                          {q.tema} {q.subtopic && <span className="font-normal text-slate-400 normal-case"> • {q.subtopic}</span>}
                        </span>
                        {currentModule === 'CIRUGIA' && (
                            <span className="text-[10px] bg-slate-100 text-slate-400 px-2 py-0.5 rounded font-medium border border-slate-200">
                                {analyzeSurgeryConcept(q.pregunta, q.tema)}
                            </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-bold uppercase">{q.specialty} {q.year}</span>
                        <span className="text-xs font-bold text-slate-400">#{q.id}</span>
                      </div>
                    </div>
                    <h3 className="text-base font-bold mb-6 text-slate-800 leading-relaxed">{q.pregunta}</h3>
                    <div className="space-y-2">
                      {Object.entries(q.opciones).map(([key, text]: [string, any]) => {
                        const isSelected = userAnswer === key;
                        const isCorrect = key === q.respuesta;
                        let optionStyle = "border-slate-100 bg-white hover:bg-slate-50 text-slate-600";
                        let icon = <div className="w-4 h-4 rounded-full border border-slate-300"></div>; // Placeholder
                        
                        if (isAnswered) {
                          if (isCorrect) { 
                              optionStyle = `border-emerald-200 bg-emerald-50/50 text-emerald-900 font-medium`; 
                              icon = <CheckCircle size={16} className="text-emerald-600" />;
                          } else if (isSelected && !isCorrect) { 
                              optionStyle = `border-red-200 bg-red-50/50 text-red-900`; 
                              icon = <XCircle size={16} className="text-red-500" />;
                          } else { 
                              optionStyle = "border-transparent opacity-40 bg-slate-50"; 
                              icon = <div className="w-4 h-4 rounded-full border border-slate-200"></div>;
                          }
                        }
                        return (
                          <button key={key} onClick={() => !isAnswered && handleOptionSelect(q.id, key)} disabled={isAnswered} className={`w-full text-left flex items-start gap-3 p-3 rounded-md border transition-all duration-200 text-sm ${optionStyle} ${!isAnswered ? 'cursor-pointer' : 'cursor-default'}`}>
                             <div className="mt-0.5 flex-shrink-0 flex items-center justify-center font-bold uppercase text-[10px] text-slate-400 w-6 h-6 rounded-full bg-slate-50 border border-slate-200">
                                 {isAnswered && (isCorrect || (isSelected && !isCorrect)) ? icon : key}
                             </div>
                             <span className="leading-snug mt-0.5">{text}</span>
                          </button>
                        );
                      })}
                    </div>
                    {!isAnswered && (<div className="mt-4 flex justify-center"><span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1 bg-slate-50 px-2 py-1 rounded"><EyeOff size={10} /> Oculto</span></div>)}
                 </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
};

export default App;