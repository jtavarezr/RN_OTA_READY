
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const EditProfileScreen = () => {
  const navigate = useNavigate();
  
  // --- States for dynamic data ---
  const [basicInfo, setBasicInfo] = useState({
    fullName: "Alex Johnson",
    headline: "Senior Software Engineer",
    email: "alex.j@example.com",
    phone: "+1 (555) 000-1234",
    city: "San Francisco",
    country: "USA"
  });

  const [socialLinks, setSocialLinks] = useState({
    linkedin: "linkedin.com/in/alexj",
    github: "github.com/alexj",
    portfolio: "alexj.dev"
  });

  const [skills, setSkills] = useState(['React', 'TypeScript', 'Node.js', 'AWS']);
  const [newSkill, setNewSkill] = useState('');

  const [experiences, setExperiences] = useState([
    { title: 'Lead Frontend Architect', company: 'TechNova Systems', date: '2021 - Actualidad' }
  ]);
  const [newExp, setNewExp] = useState({ title: '', company: '', date: '' });
  const [showExpForm, setShowExpForm] = useState(false);

  const [education, setEducation] = useState([
    { degree: 'B.S. Computer Science', school: 'University of Technology', date: '2014 - 2018' }
  ]);
  const [newEdu, setNewEdu] = useState({ degree: '', school: '', date: '' });
  const [showEduForm, setShowEduForm] = useState(false);

  const [projects, setProjects] = useState([
    { name: 'AI Interviewer Bot', tech: 'OpenAI, Next.js' }
  ]);
  const [newProj, setNewProj] = useState({ name: '', tech: '' });
  const [showProjForm, setShowProjForm] = useState(false);

  const [languages, setLanguages] = useState([
    { name: 'Inglés', level: 'Nativo' },
    { name: 'Español', level: 'Nativo' }
  ]);
  const [newLang, setNewLang] = useState({ name: '', level: 'Básico' });

  const [certs, setCerts] = useState([
    { name: "AWS Solutions Architect Pro", issuer: "Amazon Web Services", date: "2023" }
  ]);
  const [newCert, setNewCert] = useState({ name: '', issuer: '', date: '' });
  const [showCertForm, setShowCertForm] = useState(false);

  // --- Handlers ---
  const addItem = (list: any[], setList: Function, item: any, resetItem: any, setShow?: Function) => {
    const isNotEmpty = Object.values(item).every(val => {
      if (typeof val === 'string') return val.trim() !== '';
      return val !== null && val !== undefined;
    });

    if (isNotEmpty) {
      setList([...list, item]);
      if (resetItem) {
        if (typeof resetItem === 'function') {
           const emptyItem = Object.keys(item).reduce((acc, key) => ({ ...acc, [key]: '' }), {});
           resetItem(emptyItem);
        }
      }
      if (setShow) setShow(false);
    }
  };

  const removeItem = (list: any[], setList: Function, index: number) => {
    setList(list.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-background-dark pb-32">
      <header className="h-16 flex items-center justify-between px-4 border-b border-slate-200 dark:border-border-dark sticky top-0 bg-white/90 dark:bg-background-dark/90 backdrop-blur-md z-50">
        <button onClick={() => navigate(-1)} className="text-slate-400 p-2"><span className="material-symbols-outlined">close</span></button>
        <h2 className="font-black text-[10px] dark:text-white uppercase tracking-[0.2em]">Editor de Perfil Pro</h2>
        <button onClick={() => navigate('/profile')} className="bg-primary text-white font-black text-[10px] uppercase px-4 py-2 rounded-xl shadow-lg shadow-primary/20">Guardar</button>
      </header>

      <main className="p-4 space-y-10 max-w-lg mx-auto">
        
        {/* Datos Básicos y Contacto */}
        <section className="space-y-4">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 px-1">
            <span className="material-symbols-outlined text-[16px]">contact_page</span> Información de Contacto
          </h3>
          <div className="bg-white dark:bg-surface-dark p-5 rounded-3xl border border-slate-200 dark:border-border-dark space-y-4 shadow-sm">
            <input 
              value={basicInfo.fullName} 
              onChange={e => setBasicInfo({...basicInfo, fullName: e.target.value})}
              className="w-full bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border-none text-sm dark:text-white" placeholder="Nombre completo" 
            />
            <input 
              value={basicInfo.headline} 
              onChange={e => setBasicInfo({...basicInfo, headline: e.target.value})}
              className="w-full bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border-none text-sm dark:text-white font-bold" placeholder="Headline profesional" 
            />
            <div className="grid grid-cols-2 gap-3">
               <input 
                value={basicInfo.email} 
                onChange={e => setBasicInfo({...basicInfo, email: e.target.value})}
                className="w-full bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border-none text-xs dark:text-white" placeholder="Email" 
              />
              <input 
                value={basicInfo.phone} 
                onChange={e => setBasicInfo({...basicInfo, phone: e.target.value})}
                className="w-full bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border-none text-xs dark:text-white" placeholder="Teléfono" 
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
               <input 
                value={basicInfo.city} 
                onChange={e => setBasicInfo({...basicInfo, city: e.target.value})}
                className="w-full bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border-none text-xs dark:text-white" placeholder="Ciudad" 
              />
              <input 
                value={basicInfo.country} 
                onChange={e => setBasicInfo({...basicInfo, country: e.target.value})}
                className="w-full bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border-none text-xs dark:text-white" placeholder="País" 
              />
            </div>
          </div>
        </section>

        {/* Redes Sociales */}
        <section className="space-y-4">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Enlaces y Portafolio</h3>
          <div className="bg-white dark:bg-surface-dark p-5 rounded-3xl border border-slate-200 dark:border-border-dark space-y-3">
            <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900/50 p-1 rounded-2xl pr-4 border border-transparent focus-within:border-primary/30">
              <div className="w-10 h-10 bg-white dark:bg-surface-dark rounded-xl flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-blue-500">link</span>
              </div>
              <input value={socialLinks.linkedin} onChange={e => setSocialLinks({...socialLinks, linkedin: e.target.value})} className="flex-1 bg-transparent border-none text-xs dark:text-white focus:ring-0" placeholder="LinkedIn URL" />
            </div>
            <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900/50 p-1 rounded-2xl pr-4 border border-transparent focus-within:border-primary/30">
              <div className="w-10 h-10 bg-white dark:bg-surface-dark rounded-xl flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-slate-800 dark:text-white">code_blocks</span>
              </div>
              <input value={socialLinks.github} onChange={e => setSocialLinks({...socialLinks, github: e.target.value})} className="flex-1 bg-transparent border-none text-xs dark:text-white focus:ring-0" placeholder="GitHub URL" />
            </div>
          </div>
        </section>

        {/* Experiencia Laboral */}
        <section className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Experiencia Laboral</h3>
            <button onClick={() => setShowExpForm(!showExpForm)} className="text-primary text-[10px] font-black uppercase tracking-widest">+ Añadir</button>
          </div>
          
          {showExpForm && (
            <div className="bg-primary/5 p-4 rounded-3xl border border-primary/20 space-y-3 animate-in fade-in zoom-in-95">
              <input value={newExp.title} onChange={e => setNewExp({...newExp, title: e.target.value})} className="w-full bg-white dark:bg-slate-900 p-3 rounded-xl text-xs dark:text-white" placeholder="Cargo" />
              <input value={newExp.company} onChange={e => setNewExp({...newExp, company: e.target.value})} className="w-full bg-white dark:bg-slate-900 p-3 rounded-xl text-xs dark:text-white" placeholder="Empresa" />
              <input value={newExp.date} onChange={e => setNewExp({...newExp, date: e.target.value})} className="w-full bg-white dark:bg-slate-900 p-3 rounded-xl text-xs dark:text-white" placeholder="Periodo" />
              <button onClick={() => addItem(experiences, setExperiences, newExp, setNewExp, setShowExpForm)} className="w-full bg-primary text-white py-3 rounded-xl font-bold text-xs uppercase">Confirmar</button>
            </div>
          )}

          <div className="space-y-3">
            {experiences.map((exp, i) => (
              <div key={i} className="bg-white dark:bg-surface-dark p-4 rounded-3xl border border-slate-200 dark:border-border-dark flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-slate-400">work</span>
                  <div>
                    <h4 className="text-xs font-bold dark:text-white">{exp.title}</h4>
                    <p className="text-[10px] text-primary font-bold">{exp.company}</p>
                    <p className="text-[9px] text-slate-400">{exp.date}</p>
                  </div>
                </div>
                <button onClick={() => removeItem(experiences, setExperiences, i)} className="text-slate-200 hover:text-red-500"><span className="material-symbols-outlined text-lg">delete</span></button>
              </div>
            ))}
          </div>
        </section>

        {/* Educación Dinámica */}
        <section className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Educación Académica</h3>
            <button onClick={() => setShowEduForm(!showEduForm)} className="text-primary text-[10px] font-black uppercase tracking-widest">+ Añadir</button>
          </div>
          
          {showEduForm && (
            <div className="bg-secondary/5 p-4 rounded-3xl border border-secondary/20 space-y-3 animate-in fade-in zoom-in-95">
              <input value={newEdu.degree} onChange={e => setNewEdu({...newEdu, degree: e.target.value})} className="w-full bg-white dark:bg-slate-900 p-3 rounded-xl text-xs dark:text-white" placeholder="Título / Carrera" />
              <input value={newEdu.school} onChange={e => setNewEdu({...newEdu, school: e.target.value})} className="w-full bg-white dark:bg-slate-900 p-3 rounded-xl text-xs dark:text-white" placeholder="Institución" />
              <input value={newEdu.date} onChange={e => setNewEdu({...newEdu, date: e.target.value})} className="w-full bg-white dark:bg-slate-900 p-3 rounded-xl text-xs dark:text-white" placeholder="Periodo (ej: 2014-2018)" />
              <button onClick={() => addItem(education, setEducation, newEdu, setNewEdu, setShowEduForm)} className="w-full bg-secondary text-white py-3 rounded-xl font-bold text-xs uppercase">Añadir Educación</button>
            </div>
          )}

          <div className="space-y-3">
            {education.map((edu, i) => (
              <div key={i} className="bg-white dark:bg-surface-dark p-4 rounded-3xl border border-slate-200 dark:border-border-dark flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-slate-400">school</span>
                  <div>
                    <h4 className="text-xs font-bold dark:text-white">{edu.degree}</h4>
                    <p className="text-[10px] text-secondary font-bold">{edu.school}</p>
                    <p className="text-[9px] text-slate-400">{edu.date}</p>
                  </div>
                </div>
                <button onClick={() => removeItem(education, setEducation, i)} className="text-slate-200 hover:text-red-500"><span className="material-symbols-outlined text-lg">delete</span></button>
              </div>
            ))}
          </div>
        </section>

        {/* Proyectos Destacados */}
        <section className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Proyectos Destacados</h3>
            <button onClick={() => setShowProjForm(!showProjForm)} className="text-primary text-[10px] font-black uppercase tracking-widest">+ Añadir</button>
          </div>
          
          {showProjForm && (
            <div className="bg-accent/5 p-4 rounded-3xl border border-accent/20 space-y-3 animate-in fade-in zoom-in-95">
              <input value={newProj.name} onChange={e => setNewProj({...newProj, name: e.target.value})} className="w-full bg-white dark:bg-slate-900 p-3 rounded-xl text-xs dark:text-white" placeholder="Nombre del proyecto" />
              <input value={newProj.tech} onChange={e => setNewProj({...newProj, tech: e.target.value})} className="w-full bg-white dark:bg-slate-900 p-3 rounded-xl text-xs dark:text-white" placeholder="Tecnologías (ej: React, Python)" />
              <button onClick={() => addItem(projects, setProjects, newProj, setNewProj, setShowProjForm)} className="w-full bg-accent text-white py-3 rounded-xl font-bold text-xs uppercase">Guardar Proyecto</button>
            </div>
          )}

          <div className="space-y-3">
            {projects.map((p, i) => (
              <div key={i} className="bg-white dark:bg-surface-dark p-4 rounded-3xl border border-slate-200 dark:border-border-dark flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-slate-400">rocket</span>
                  <div>
                    <h4 className="text-xs font-bold dark:text-white">{p.name}</h4>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">{p.tech}</p>
                  </div>
                </div>
                <button onClick={() => removeItem(projects, setProjects, i)} className="text-slate-200 hover:text-red-500"><span className="material-symbols-outlined text-lg">delete</span></button>
              </div>
            ))}
          </div>
        </section>

        {/* Idiomas Dinámicos */}
        <section className="space-y-4">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Idiomas</h3>
          <div className="bg-white dark:bg-surface-dark p-5 rounded-3xl border border-slate-200 dark:border-border-dark space-y-4 shadow-sm">
            <div className="flex gap-2">
              <input value={newLang.name} onChange={e => setNewLang({...newLang, name: e.target.value})} className="flex-1 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl text-xs dark:text-white" placeholder="Idioma" />
              <select value={newLang.level} onChange={e => setNewLang({...newLang, level: e.target.value})} className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl text-xs dark:text-white border-none">
                <option>Básico</option>
                <option>Intermedio</option>
                <option>Avanzado</option>
                <option>Nativo</option>
              </select>
              <button onClick={() => addItem(languages, setLanguages, newLang, setNewLang)} className="bg-primary text-white px-4 rounded-xl">
                <span className="material-symbols-outlined text-sm">add</span>
              </button>
            </div>
            <div className="space-y-2 pt-2">
              {languages.map((l, i) => (
                <div key={i} className="flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/30 p-3 rounded-2xl">
                  <span className="text-xs font-bold dark:text-white">{l.name} — <span className="text-primary uppercase text-[9px]">{l.level}</span></span>
                  <button onClick={() => removeItem(languages, setLanguages, i)} className="text-slate-300"><span className="material-symbols-outlined text-sm">close</span></button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Certificaciones Dinámicas */}
        <section className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Certificaciones</h3>
            <button onClick={() => setShowCertForm(!showCertForm)} className="text-primary text-[10px] font-black uppercase tracking-widest">+ Añadir</button>
          </div>

          {showCertForm && (
            <div className="bg-accent/5 p-4 rounded-3xl border border-accent/20 space-y-3 animate-in fade-in zoom-in-95">
              <input value={newCert.name} onChange={e => setNewCert({...newCert, name: e.target.value})} className="w-full bg-white dark:bg-slate-900 p-3 rounded-xl text-xs dark:text-white" placeholder="Nombre" />
              <input value={newCert.issuer} onChange={e => setNewCert({...newCert, issuer: e.target.value})} className="w-full bg-white dark:bg-slate-900 p-3 rounded-xl text-xs dark:text-white" placeholder="Emisor" />
              <button onClick={() => addItem(certs, setCerts, newCert, setNewCert, setShowCertForm)} className="w-full bg-accent text-white py-3 rounded-xl font-bold text-xs uppercase">Guardar</button>
            </div>
          )}

          <div className="space-y-3">
            {certs.map((c, i) => (
              <div key={i} className="bg-white dark:bg-surface-dark p-4 rounded-3xl border border-slate-200 dark:border-border-dark flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-accent">military_tech</span>
                  <div>
                    <h4 className="text-xs font-bold dark:text-white">{c.name}</h4>
                    <p className="text-[9px] text-slate-400 font-bold uppercase">{c.issuer}</p>
                  </div>
                </div>
                <button onClick={() => removeItem(certs, setCerts, i)} className="text-slate-200 hover:text-red-500"><span className="material-symbols-outlined text-lg">delete</span></button>
              </div>
            ))}
          </div>
        </section>

        {/* Competencias (Skills) */}
        <section className="space-y-4">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Skills Técnicas</h3>
          <div className="bg-white dark:bg-surface-dark p-5 rounded-3xl border border-slate-200 dark:border-border-dark space-y-4 shadow-sm">
            <div className="flex flex-wrap gap-2">
              {skills.map((s, i) => (
                <div key={i} className="flex items-center gap-2 bg-primary/10 text-primary px-3 py-2 rounded-xl text-[10px] font-black border border-primary/20 transition-all hover:bg-primary/20">
                  {s}
                  <button onClick={() => setSkills(skills.filter((_, idx) => idx !== i))} className="material-symbols-outlined text-[14px]">close</button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input value={newSkill} onChange={e => setNewSkill(e.target.value)} onKeyPress={e => e.key === 'Enter' && (setSkills([...skills, newSkill]), setNewSkill(''))} className="flex-1 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl text-xs dark:text-white border-none focus:ring-1 focus:ring-primary" placeholder="Añadir skill..." />
              <button onClick={() => {if(newSkill) setSkills([...skills, newSkill]); setNewSkill('')}} className="bg-primary text-white px-4 rounded-xl active:scale-95 transition-transform"><span className="material-symbols-outlined">add</span></button>
            </div>
          </div>
        </section>

        <div className="pt-10">
          <button onClick={() => navigate('/profile')} className="w-full bg-primary text-white py-5 rounded-3xl font-black shadow-2xl shadow-primary/40 active:scale-[0.98] transition-all uppercase tracking-[0.2em] text-[11px] flex items-center justify-center gap-3">
            <span className="material-symbols-outlined text-lg">check_circle</span>
            Finalizar y Publicar Perfil
          </button>
        </div>
      </main>
    </div>
  );
};

export default EditProfileScreen;
