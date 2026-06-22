const ADMIN_CSS = `
:root {
  --p: #7c3aed;
  --pd: #5b21b6;
  --pl: #a78bfa;
  --mu: #884EA0;
  --ink: #4A235A;
  --bg: transparent;
  --c1: #FFFFFF;
  --bd: #D7BDE2;
  --glass: rgba(255, 255, 255, 0.8);
}

nav { 
  background: rgba(94, 43, 151, 0.85); 
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  color: white; 
  padding: 0.8rem 2rem; 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
  box-shadow: 0 8px 32px rgba(94, 43, 151, 0.15); 
  position: sticky; 
  top: 0; 
  z-index: 100;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.logo { font-size: 1.3rem; font-weight: 700; display: flex; align-items: center; gap: 0.8rem; letter-spacing: -0.02em; }
.logo-icon { background: white; color: var(--p); width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; }

.dl { display: flex; min-height: calc(100vh - 64px); background: transparent; }

.dsb { 
  width: 280px; 
  background: #FFFFFF; 
  backdrop-filter: blur(20px);
  border-right: 1px solid var(--bd); 
  display: flex; 
  flex-direction: column; 
  gap: 0.4rem; 
  padding: 1.5rem 0; 
  flex-shrink: 0; 
  box-shadow: 10px 0 30px rgba(110, 72, 170, 0.05);
}

.dni { 
  width: calc(100% - 1.5rem); 
  margin: 0 0.75rem; 
  padding: 0.9rem 1.25rem; 
  border: none; 
  background: transparent; 
  border-radius: 14px; 
  text-align: left; 
  font-weight: 600; 
  font-size: 0.9rem; 
  color: var(--mu); 
  cursor: pointer; 
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); 
  display: flex; 
  align-items: center; 
  gap: 1rem; 
}

.dni:hover { background: rgba(125, 60, 152, 0.05); color: var(--pd); transform: translateX(4px); }
.dni.on { background: linear-gradient(135deg, var(--p), var(--pd)); color: white; box-shadow: 0 4px 15px rgba(125, 60, 152, 0.25); }

.dm { flex: 1; padding: 1.5rem 2.5rem 2.5rem; overflow-y: auto; max-width: 1400px; margin: 0 auto; width: 100%; position: relative; z-index: 5; }
.dh { margin-bottom: 3rem; }
.dh h2 { font-size: 2.2rem; font-weight: 700; color: var(--pd); margin: 0 0 0.6rem; letter-spacing: -0.04em; }
.dh p { color: var(--mu); font-size: 1.05rem; opacity: 0.8; }

.kg { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.5rem; margin-bottom: 3rem; }
.kc { 
  background: #FFFFFF; 
  backdrop-filter: blur(20px);
  padding: 1.8rem; 
  border-radius: 20px; 
  border: 1px solid var(--bd); 
  box-shadow: 0 10px 30px rgba(110, 72, 170, 0.05); 
  transition: all 0.4s;
}
.kc:hover { transform: translateY(-8px); box-shadow: 0 15px 45px rgba(94, 43, 151, 0.12); border-color: var(--p); }

.kl { font-size: 0.75rem; font-weight: 700; color: var(--mu); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 1rem; opacity: 0.7; }
.kv { font-size: 1.8rem; font-weight: 700; color: var(--ink); margin-bottom: 0.4rem; }
.kt { font-size: 0.8rem; color: var(--mu); font-weight: 500; }
.kt.tu { color: #22c55e; display: flex; align-items: center; gap: 0.3rem; }

.c { 
  background: #FFFFFF; 
  backdrop-filter: blur(20px);
  border-radius: 24px; 
  border: 1px solid var(--bd); 
  margin-bottom: 2rem; 
  overflow: hidden; 
  box-shadow: 0 10px 40px rgba(110, 72, 170, 0.05);
}
.ch { padding: 1.5rem 2rem; border-bottom: 1px solid rgba(125, 60, 152, 0.05); font-weight: 700; color: var(--pd); font-size: 1.1rem; }

table { width: 100%; border-collapse: collapse; }
th { padding: 1.2rem 2rem; background: rgba(125, 60, 152, 0.03); font-size: 0.75rem; font-weight: 700; color: var(--mu); text-transform: uppercase; letter-spacing: 0.05em; }
td { padding: 1.2rem 2rem; border-bottom: 1px solid rgba(125, 60, 152, 0.03); font-size: 0.95rem; color: var(--ink); font-weight: 500; }
tr:hover td { background: rgba(125, 60, 152, 0.02); }

.sp { padding: 0.4rem 1rem; border-radius: 100px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; }
.spg { background: rgba(34, 197, 94, 0.1); color: #16a34a; }
.spr { background: rgba(239, 68, 68, 0.1); color: #dc2626; }
.spp { background: rgba(125, 60, 152, 0.1); color: var(--p); }

.map { height: 450px; background: rgba(125, 60, 152, 0.05); border-radius: 16px; margin: 1.5rem; border: 1px dashed var(--p); }

.gtbox { padding: 2rem; background: rgba(125, 60, 152, 0.03); border-radius: 16px; margin: 1.5rem; border: 1px solid rgba(157, 80, 187, 0.05); }

.btn-premium-sm {
  background: white;
  border: 1px solid var(--p);
  color: var(--p);
  padding: 0.4rem 1rem;
  border-radius: 100px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}
.btn-premium-sm:hover { background: var(--p); color: white; box-shadow: 0 4px 12px rgba(125, 60, 152, 0.3); }
`;

export default ADMIN_CSS;
