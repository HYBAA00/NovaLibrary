import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function Home(){
  const navigate = useNavigate()
  const accent = '#F5A623'
  const bg = '#0a0a0a'
  const panel = '#0f1720'

  const Header = () => (
    <header style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'18px 28px',background:bg,borderBottom:'1px solid rgba(255,255,255,0.03)'}}>
      <div style={{display:'flex',alignItems:'center',gap:14}}>
        <div style={{width:44,height:44,background:accent,borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',color:'#000',fontWeight:800}}>📚</div>
        <div style={{color:'#fff',fontWeight:800,fontSize:18}}>NovaLibrary</div>
      </div>
      <nav style={{display:'flex',gap:20,alignItems:'center'}}>
        <a href="#" onClick={(e)=>{e.preventDefault(); navigate('/')}} style={{color:'#cbd5e1',textDecoration:'none'}}>Accueil</a>
        <a href="#" onClick={(e)=>{e.preventDefault(); navigate('/login')}} style={{color:'#cbd5e1',textDecoration:'none'}}>Catalogue</a>
        <a href="#" onClick={(e)=>{e.preventDefault(); navigate('/features')}} style={{color:'#cbd5e1',textDecoration:'none'}}>Fonctionnalités</a>
      </nav>
      <div>
        <button onClick={()=>navigate('/login')} style={{background:'transparent',color:'#cbd5e1',border:'none',marginRight:12,cursor:'pointer'}}>Connexion</button>
      </div>
    </header>
  )

  return (
    <div style={{background:bg,color:'#e6eef8,minHeight:' + '100vh'}}>
      <style>{`
        .btn-accent{background:${accent};color:#061021;padding:12px 18px;border-radius:10px;border:none;cursor:pointer;font-weight:700}
        .btn-ghost{background:transparent;border:1px solid rgba(255,255,255,0.06);color:#cbd5e1;padding:10px 14px;border-radius:10px;cursor:pointer}
      `}</style>
      <Header />

      {/* HERO */}
      <section style={{display:'flex',gap:40,padding:'56px 64px',alignItems:'center'}}>
        <div style={{flex:1,maxWidth:720}}>
          <div style={{display:'inline-block',background:'rgba(245,166,35,0.08)',color:accent,padding:'8px 14px',borderRadius:20,fontWeight:700}}>✨ Plus de 50 000 ouvrages disponibles</div>
          <h1 style={{fontSize:56,lineHeight:1.02,marginTop:24,color:'#fff'}}>
            Votre univers <span style={{color:accent}}>littéraire</span> sans limites
          </h1>
          <p style={{color:'#9fb0c9',marginTop:14,fontSize:16}}>Accédez à des milliers d'ouvrages numériques, explorez, annotez et découvrez de nouvelles lectures grâce à notre assistant IA.</p>

          <div style={{display:'flex',gap:12,marginTop:18}}>
            <button className="btn-accent" onClick={()=>navigate('/login')}>Explorer la bibliothèque →</button>
            <button className="btn-ghost" onClick={()=>navigate('/login')}>⚡ Parler au chatbot</button>
          </div>

          <div style={{display:'flex',alignItems:'center',gap:12,marginTop:20}}>
            <div style={{display:'flex',gap:-8}}>
              <div style={{width:36,height:36,borderRadius:18,background:'#ff7a59',display:'flex',alignItems:'center',justifyContent:'center',color:'#081020'}}>A</div>
              <div style={{width:36,height:36,borderRadius:18,background:'#2dd4bf',display:'flex',alignItems:'center',justifyContent:'center',color:'#081020'}}>B</div>
              <div style={{width:36,height:36,borderRadius:18,background:'#60a5fa',display:'flex',alignItems:'center',justifyContent:'center',color:'#081020'}}>C</div>
            </div>
            <div style={{color:'#9fb0c9'}}>★ ★ ★ ★ ★ &nbsp; 200K+ lecteurs satisfaits</div>
          </div>
        </div>

        <div style={{width:420,position:'relative'}}>
          {/* stack of cards */}
          <div style={{position:'absolute',right:0,top:20,transform:'rotate(-10deg)',width:260,background:'#111827',borderRadius:12,padding:18,color:'#fff',boxShadow:'0 10px 30px rgba(0,0,0,0.6)'}}>
            <div style={{fontSize:12,color:'#88a'}} >DYSTOPIE</div>
            <h4 style={{margin:'8px 0'}}>1984</h4>
            <div style={{opacity:0.8}}>George Orwell</div>
            <div style={{marginTop:8,color:accent}}>★ 4.7</div>
          </div>
          <div style={{position:'absolute',right:20,top:80,transform:'rotate(-4deg)',width:260,background:'#0b1220',borderRadius:12,padding:16,color:'#fff',boxShadow:'0 8px 24px rgba(0,0,0,0.5)'}}>
            <div style={{fontSize:12,color:'#7fb'}}>CLASSIQUE</div>
            <h4 style={{margin:'8px 0'}}>Le Petit Prince</h4>
            <div style={{opacity:0.8}}>Antoine de Saint-Exupéry</div>
            <div style={{marginTop:8,color:accent}}>★ 4.5</div>
          </div>
          <div style={{position:'absolute',right:40,top:140,transform:'rotate(2deg)',width:260,background:'#051026',borderRadius:12,padding:14,color:'#fff',boxShadow:'0 6px 18px rgba(0,0,0,0.4)'}}>
            <div style={{fontSize:12,color:'#7ec'}}>HISTOIRE</div>
            <h4 style={{margin:'8px 0'}}>Sapiens</h4>
            <div style={{opacity:0.8}}>Yuval Noah Harari</div>
            <div style={{marginTop:8,color:accent}}>★ 4.6</div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section style={{background:'#07080a',padding:'28px 64px'}}>
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:18}}>
          <div style={{background:panel,padding:20,borderRadius:12,textAlign:'center'}}>
            <div style={{color:accent,fontSize:28,fontWeight:800}}>50K+</div>
            <div style={{color:'#9fb0c9'}}>Ouvrages disponibles</div>
          </div>
          <div style={{background:panel,padding:20,borderRadius:12,textAlign:'center'}}>
            <div style={{color:accent,fontSize:28,fontWeight:800}}>200K+</div>
            <div style={{color:'#9fb0c9'}}>Lecteurs actifs</div>
          </div>
          <div style={{background:panel,padding:20,borderRadius:12,textAlign:'center'}}>
            <div style={{color:accent,fontSize:28,fontWeight:800}}>98%</div>
            <div style={{color:'#9fb0c9'}}>Satisfaction</div>
          </div>
          <div style={{background:panel,padding:20,borderRadius:12,textAlign:'center'}}>
            <div style={{color:accent,fontSize:28,fontWeight:800}}>24/7</div>
            <div style={{color:'#9fb0c9'}}>Disponibilité</div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section style={{padding:'36px 64px'}}>
        <div style={{textAlign:'center',marginBottom:12}}><div style={{display:'inline-block',background:'rgba(11,102,255,0.06)',color:'#7cc0ff',padding:'6px 12px',borderRadius:20}}>Fonctionnalités</div></div>
        <h2 style={{textAlign:'center',marginBottom:20}}>Tout ce dont vous avez besoin pour lire mieux</h2>
        <div style={{display:'flex',gap:16,justifyContent:'center'}}>
          <div style={{background:panel,padding:18,borderRadius:12,width:300}}>
            <div style={{fontSize:22,marginBottom:8}}>🔎 Recherche Avancée</div>
            <div style={{color:'#9fb0c9'}}>Filtrez par titre, auteur, catégorie et contenu. Résultats instantanés et pertinents.</div>
            <div style={{marginTop:12,color:accent}}>En savoir plus →</div>
          </div>
          <div style={{background:panel,padding:18,borderRadius:12,width:300}}>
            <div style={{fontSize:22,marginBottom:8}}>📄 Lecture PDF Intégrée</div>
            <div style={{color:'#9fb0c9'}}>Visualisez et annotez vos livres directement dans l'application.</div>
            <div style={{marginTop:12,color:accent}}>En savoir plus →</div>
          </div>
          <div style={{background:panel,padding:18,borderRadius:12,width:300}}>
            <div style={{fontSize:22,marginBottom:8}}>🤖 Assistant IA</div>
            <div style={{color:'#9fb0c9'}}>Posez des questions, obtenez des résumés ou recommandations personnalisées.</div>
            <div style={{marginTop:12,color:accent}}>En savoir plus →</div>
          </div>
        </div>
      </section>

      {/* CATALOGUE TRENDS */}
      <section style={{background:'linear-gradient(180deg, rgba(245,160,35,0.04), rgba(0,0,0,0.0))',padding:'36px 64px',display:'flex',gap:24}}>
        <div style={{flex:1,maxWidth:520}}>
          <div style={{display:'inline-block',background:'rgba(245,160,35,0.08)',color:accent,padding:'6px 12px',borderRadius:20}}>Catalogue en croissance</div>
          <h2 style={{marginTop:12}}>Découvrez les titres <span style={{color:accent}}>tendances du moment</span></h2>
          <p style={{color:'#9fb0c9'}}>Notre équipe de curation ajoute chaque semaine les meilleures parutions, classiques incontournables et pépites cachées.</p>
          <div style={{marginTop:12}}><button className="btn-accent" onClick={()=>navigate('/login')}>Voir le catalogue →</button></div>
        </div>
        <div style={{flex:1,display:'grid',gridTemplateColumns:'repeat(3,1fr)',gridTemplateRows:'repeat(2,1fr)',gap:12}}>
          {['orange','teal','blue','bordeaux','green','indigo'].map((c,i)=>(
            <div key={i} style={{background: i%2===0? '#1f2937':'#0b1220',borderRadius:12,padding:14,display:'flex',flexDirection:'column',justifyContent:'end'}}>
              <div style={{fontSize:12,opacity:0.7}}>Catégorie</div>
              <div style={{fontWeight:800,fontSize:18,marginTop:6,color: i%2===0?accent:'#fff'}}>Titre {i+1}</div>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section style={{padding:'36px 64px'}}>
        <div style={{textAlign:'center',marginBottom:12}}><div style={{display:'inline-block',background:'rgba(11,179,145,0.06)',color:'#7ee4c7',padding:'6px 12px',borderRadius:20}}>Témoignages</div></div>
        <h2 style={{textAlign:'center',marginBottom:20}}>Ce que disent nos lecteurs</h2>
        <div style={{display:'flex',gap:12,justifyContent:'center'}}>
          {[{n:'Sophie Marceau',t:'Étudiante en Lettres'},{n:'Thomas Bernard',t:'Chercheur universitaire'},{n:'Amina Diallo',t:'Professeure'}].map((p,i)=> (
            <div key={i} style={{background:panel,padding:18,borderRadius:12,width:320}}>
              <div style={{fontSize:28,color:accent}}>“</div>
              <div style={{color:'#9fb0c9'}}>Une bibliothèque numérique comme on en rêvait. La recherche avancée me fait gagner un temps précieux.</div>
              <div style={{display:'flex',alignItems:'center',gap:10,marginTop:12}}>
                <div style={{width:44,height:44,borderRadius:22,background:'#f59e0b',display:'flex',alignItems:'center',justifyContent:'center',color:'#061021',fontWeight:800}}>{p.n.charAt(0)}</div>
                <div>
                  <div style={{fontWeight:800}}>{p.n}</div>
                  <div style={{color:'#9fb0c9'}}>{p.t}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{background:'#071022',padding:'40px 64px',textAlign:'center',borderTop:'1px solid rgba(255,255,255,0.02)'}}>
        <div style={{display:'inline-block',background:'rgba(245,166,35,0.08)',color:accent,padding:'8px 14px',borderRadius:20}}>Prêt à commencer ?</div>
        <h2 style={{marginTop:18}}>Rejoignez <span style={{color:accent}}>NovaLibrary</span> aujourd'hui</h2>
        <p style={{color:'#9fb0c9'}}>Commencez gratuitement. Aucune carte bancaire requise. Accès immédiat à des milliers d'ouvrages.</p>
        <div style={{marginTop:16,display:'flex',gap:12,justifyContent:'center'}}>
          <button className="btn-accent" onClick={()=>navigate('/login')}>Créer un compte gratuit →</button>
          <button className="btn-ghost" onClick={()=>navigate('/login')}>Voir la démo</button>
        </div>
      </section>
    </div>
  )
}

