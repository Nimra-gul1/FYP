const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400&family=Scheherazade+New:wght@400;700&family=Outfit:wght@300;400;500;600;700&display=swap');

:root {
  --p: #7c3aed;
  --pd: #5b21b6;
  --pl: #a78bfa;
  --pp: #0f172a;
  --deep: #0f172a;
  --ink: #4A235A;
  --mu: #884EA0;
  --go: #9D50BB;
  --gl: rgba(255, 255, 255, 0.8);
  --bd: #D7BDE2;
  --glass: rgba(255, 255, 255, 0.8);
  --blur: blur(20px);
  --shadow-sm: 0 4px 12px rgba(94, 43, 151, 0.08);
  --shadow-lg: 0 10px 40px rgba(94, 43, 151, 0.15);
  --transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  --ok: #22c55e;
  --er: #ef4444;
  --wa: #f59e0b;
  --su: #F9F5FF;
}

* { margin:0; padding:0; box-sizing:border-box; }

body { 
  font-family: 'Poppins', 'Outfit', sans-serif; 
  min-height: 100vh;
  background: #F3E8FF;
  overflow-x: hidden;
  color: var(--ink);
}

@keyframes fU { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
@keyframes pu { 0%, 100% { opacity: 1; } 50% { opacity: 0.35; } }
@keyframes bo { 0%, 80%, 100% { transform: translateY(0); } 40% { transform: translateY(-7px); } }
@keyframes fl { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
@keyframes sp { to { transform: rotate(360deg); } }

.fa { animation: fU 0.4s ease both; }

.mesh-bg {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  z-index: -1;
  background-color: var(--su);
  background-image: 
    radial-gradient(at 0% 0%, rgba(125, 60, 152, 0.15) 0px, transparent 50%),
    radial-gradient(at 100% 0%, rgba(157, 80, 187, 0.1) 0px, transparent 50%),
    radial-gradient(at 100% 100%, rgba(216, 191, 216, 0.2) 0px, transparent 50%),
    radial-gradient(at 0% 100%, rgba(110, 52, 138, 0.1) 0px, transparent 50%);
  animation: mesh-drift 20s ease-in-out infinite alternate;
}

@keyframes mesh-drift {
  0% { transform: scale(1) translate(0, 0); }
  100% { transform: scale(1.1) translate(-2%, -2%); }
}

.glass {
  background: var(--glass);
  backdrop-filter: var(--blur);
  -webkit-backdrop-filter: var(--blur);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: var(--shadow-sm);
}

.btn-premium {
  background: linear-gradient(135deg, var(--p), var(--pd));
  color: white;
  padding: 0.8rem 1.8rem;
  border-radius: 100px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: var(--transition);
  box-shadow: 0 4px 15px rgba(125, 60, 152, 0.3);
  font-family: inherit;
}

.btn-premium:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(125, 60, 152, 0.4);
  opacity: 0.95;
}

.spin { width: 16px; height: 16px; border: 2px solid rgba(255, 255, 255, 0.35); border-top-color: #fff; border-radius: 50%; animation: sp 0.7s linear infinite; display: inline-block; flex-shrink: 0; }
`;

export default GLOBAL_CSS;
