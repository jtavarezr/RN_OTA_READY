
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const mockApi = {
  get: async (url: string) => ({
    data: {
      fullName: "Alex Johnson",
      headline: "Senior Software Engineer | Cloud Architect",
      completionPercentage: 92,
      city: "San Francisco",
      country: "USA",
      email: "alex.j@example.com",
      phoneNumber: "+1 (555) 000-1234",
      links: { linkedin: "linkedin.com/in/alexj", github: "github.com/alexj", portfolio: "alexj.dev" },
      summary: "Highly motivated Senior Software Engineer with 8+ years of experience in full-stack development. Specialist in high-scale cloud architectures and React-based microfrontends.",
      skills: ['React', 'TypeScript', 'Node.js', 'AWS', 'System Design', 'Docker', 'Kubernetes'],
      experience: [
        { title: 'Lead Frontend Architect', company: 'TechNova Systems', dates: '2021 — PRESENT', description: 'Driving the architectural vision for the main SaaS product using React and GraphQL.' },
        { title: 'Senior Developer', company: 'Global Solutions', dates: '2018 — 2021', description: 'Developed core features for the logistics management platform.' }
      ],
      education: [
        { degree: 'B.S. Computer Science', institution: 'University of Technology', dates: '2014 — 2018' }
      ],
      certifications: [
        { name: "AWS Solutions Architect Professional", issuer: "Amazon Web Services", date: "2023", icon: "cloud" },
        { name: "Google Professional Cloud Developer", issuer: "Google Cloud", date: "2022", icon: "layers" }
      ],
      languages: [
        { name: "English", level: "Native", progress: 100 },
        { name: "Spanish", level: "Professional Working", progress: 85 }
      ],
      projects: [
        { name: "AI Interviewer Bot", tech: "OpenAI, Next.js", desc: "Automated screening tool for recruiters." }
      ]
    }
  })
};

const ProfileScreen = () => {
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await mockApi.get('/api/profile/123');
        setProfileData(response.data);
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetchProfile();
  }, []);

  if (loading || !profileData) return (
    <div className="h-screen flex items-center justify-center dark:bg-background-dark">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pb-24 bg-slate-50 dark:bg-background-dark overflow-y-auto custom-scrollbar">
      <main className="px-4 py-6 max-w-lg mx-auto space-y-4">
        
        {/* Card Principal de Usuario */}
        <div className="bg-white dark:bg-surface-dark rounded-3xl border border-slate-200 dark:border-border-dark p-6 shadow-sm overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
          <div className="flex flex-col items-center text-center relative z-10">
            <div className="relative mb-4">
              <div className="w-28 h-28 rounded-full border-4 border-primary/20 bg-cover bg-center shadow-2xl"
                style={{ backgroundImage: 'url("https://picsum.photos/seed/alex/300")' }}></div>
              <div className="absolute -bottom-1 -right-1 bg-green-500 w-6 h-6 rounded-full border-4 border-white dark:border-surface-dark"></div>
            </div>
            <h2 className="text-2xl font-black dark:text-white leading-tight">{profileData.fullName}</h2>
            <p className="text-primary font-bold text-sm mt-1">{profileData.headline}</p>
            
            <div className="flex gap-4 mt-4">
              <span className="material-symbols-outlined text-slate-400 hover:text-primary cursor-pointer">language</span>
              <span className="material-symbols-outlined text-slate-400 hover:text-primary cursor-pointer">terminal</span>
              <span className="material-symbols-outlined text-slate-400 hover:text-primary cursor-pointer">alternate_email</span>
            </div>

            <div className="w-full grid grid-cols-1 gap-2 mt-6 pt-6 border-t border-slate-100 dark:border-border-dark">
              <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
                <span className="material-symbols-outlined text-primary !text-lg">location_on</span>
                {profileData.city}, {profileData.country}
              </div>
            </div>
          </div>
        </div>

        {/* Barra de Fuerza de Perfil */}
        <div className="bg-primary/5 border border-primary/10 rounded-2xl p-4">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary fill-1">verified</span>
              <span className="text-[10px] font-black uppercase text-primary tracking-widest">Estatus del Perfil</span>
            </div>
            <span className="text-[10px] font-black text-primary">{profileData.completionPercentage}%</span>
          </div>
          <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-primary" style={{ width: `${profileData.completionPercentage}%` }}></div>
          </div>
        </div>

        <button onClick={() => navigate('/edit-profile')} 
          className="w-full bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark dark:text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-50 transition-all">
          <span className="material-symbols-outlined !text-xl text-primary">edit_square</span>
          Editar Perfil Completo
        </button>

        {/* Resumen */}
        <section className="bg-white dark:bg-surface-dark p-5 rounded-2xl border border-slate-200 dark:border-border-dark">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Extracto</h4>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{profileData.summary}</p>
        </section>

        {/* Skills */}
        <section className="bg-white dark:bg-surface-dark p-5 rounded-2xl border border-slate-200 dark:border-border-dark">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Competencias</h4>
          <div className="flex flex-wrap gap-2">
            {profileData.skills.map((s: string) => (
              <span key={s} className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-border-dark rounded-xl text-[11px] font-bold dark:text-slate-300">
                {s}
              </span>
            ))}
          </div>
        </section>

        {/* Idiomas */}
        <section className="bg-white dark:bg-surface-dark p-5 rounded-2xl border border-slate-200 dark:border-border-dark">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Idiomas</h4>
          <div className="space-y-4">
            {profileData.languages.map((l: any) => (
              <div key={l.name}>
                <div className="flex justify-between items-center mb-1 text-xs">
                  <span className="font-bold dark:text-white">{l.name}</span>
                  <span className="text-primary font-black uppercase text-[9px]">{l.level}</span>
                </div>
                <div className="h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-primary/40" style={{ width: `${l.progress}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Experiencia */}
        <section className="bg-white dark:bg-surface-dark p-5 rounded-2xl border border-slate-200 dark:border-border-dark">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-5">Trayectoria</h4>
          <div className="space-y-6">
            {profileData.experience.map((exp: any, i: number) => (
              <div key={i} className="flex gap-4 group">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                    <span className="material-symbols-outlined text-primary">corporate_fare</span>
                  </div>
                  {i !== profileData.experience.length - 1 && <div className="w-0.5 h-full bg-slate-100 dark:bg-slate-800 my-1"></div>}
                </div>
                <div className="flex-1 pb-4">
                  <h5 className="text-sm font-black dark:text-white">{exp.title}</h5>
                  <p className="text-xs text-primary font-bold">{exp.company}</p>
                  <p className="text-[10px] text-slate-400 mb-2 font-semibold uppercase">{exp.dates}</p>
                  <p className="text-[11px] text-slate-500 leading-snug">{exp.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Certificaciones */}
        <section className="bg-white dark:bg-surface-dark p-5 rounded-2xl border border-slate-200 dark:border-border-dark">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-5">Licencias y Certificaciones</h4>
          <div className="space-y-4">
            {profileData.certifications.map((cert: any) => (
              <div key={cert.name} className="flex items-center gap-4 bg-slate-50 dark:bg-slate-900/40 p-3 rounded-2xl border border-slate-100 dark:border-border-dark">
                <div className="w-10 h-10 bg-white dark:bg-surface-dark rounded-xl flex items-center justify-center shadow-sm">
                  <span className="material-symbols-outlined text-accent">{cert.icon}</span>
                </div>
                <div>
                  <h5 className="text-[13px] font-bold dark:text-white">{cert.name}</h5>
                  <p className="text-[10px] text-slate-500 font-semibold">{cert.issuer} • {cert.date}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <button className="w-full bg-primary text-white py-4 rounded-2xl font-black shadow-xl shadow-primary/20 flex items-center justify-center gap-2 active:scale-95 transition-all">
          <span className="material-symbols-outlined">auto_awesome</span>
          GENERAR CV CON IA
        </button>
      </main>
    </div>
  );
};

export default ProfileScreen;
