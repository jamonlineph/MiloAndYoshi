import { useGameStore } from '../../store/useGameStore';

export function PauseMenu() {
  const currentMenu = useGameStore(state => state.currentMenu);
  const setMenu = useGameStore(state => state.setMenu);
  const inventory = useGameStore(state => state.inventory);
  const stamps = useGameStore(state => state.stamps);
  const quests = useGameStore(state => state.quests);

  if (currentMenu === 'none') return null;

  return (
    <div className="absolute inset-0 pointer-events-auto z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm shadow-xl p-4">
      <div className="bg-paper p-8 border-4 border-ink shadow-[8px_8px_0_var(--color-ink)] flex flex-col items-center w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <h2 className="text-3xl font-bold mb-8 text-terracotta font-display uppercase tracking-wider">
           {currentMenu === 'pause' ? 'PAUSED' : currentMenu}
        </h2>
        
        {currentMenu === 'pause' && (
            <div className="flex flex-col gap-4 w-full">
              <button onClick={() => setMenu('none')} className="w-full py-3 bg-cream border-2 border-ink font-bold text-lg hover:bg-orange hover:text-ink transition-colors shadow-[4px_4px_0_var(--color-ink)] active:translate-y-1 active:shadow-[0_0_0_var(--color-ink)]">
                Resume
              </button>
              <button onClick={() => setMenu('journal')} className="w-full py-3 bg-cream border-2 border-ink font-bold text-lg hover:bg-moss hover:text-white transition-colors shadow-[4px_4px_0_var(--color-ink)] active:translate-y-1 active:shadow-[0_0_0_var(--color-ink)]">
                Journal & Inventory
              </button>
              <button onClick={() => setMenu('settings')} className="w-full py-3 bg-cream border-2 border-ink font-bold text-lg hover:bg-sky hover:text-ink transition-colors shadow-[4px_4px_0_var(--color-ink)] active:translate-y-1 active:shadow-[0_0_0_var(--color-ink)]">
                Settings
              </button>
              <button onClick={() => window.location.reload()} className="w-full py-3 bg-terracotta text-white border-2 border-ink font-bold text-lg hover:bg-orange transition-colors shadow-[4px_4px_0_var(--color-ink)] active:translate-y-1 active:shadow-[0_0_0_var(--color-ink)] mt-4">
                Restart Game
              </button>
            </div>
        )}

        {currentMenu === 'settings' && (
            <div className="flex flex-col gap-4 w-full px-4 text-center pb-4">
              <p className="text-xl text-ink font-medium">Settings coming soon!</p>
              <p className="text-sm opacity-80 mb-4">Volume, graphics, and controls will be adjustable here.</p>
              <button onClick={() => setMenu('pause')} className="w-full py-3 bg-terracotta border-2 border-ink font-bold text-lg text-white hover:bg-orange transition-colors shadow-[4px_4px_0_var(--color-ink)] active:translate-y-1 active:shadow-[0_0_0_var(--color-ink)] mt-4">
                Back
              </button>
            </div>
        )}

        {currentMenu === 'journal' && (
            <div className="flex flex-col w-full pb-4 items-stretch text-left">
              <h3 className="font-bold text-lg mb-2 text-ink">Active Quests</h3>
              <div className="bg-cream border-2 border-ink p-4 mb-6 shadow-sm overflow-y-auto max-h-48 text-sm h-full">
                  {Object.values(quests).filter(q => q.status === 'active').length === 0 ? (
                      <p className="italic opacity-80">No active quests.</p>
                  ) : (
                      Object.values(quests).filter(q => q.status === 'active').map(q => (
                          <div key={q.id} className="mb-4 last:mb-0">
                              <h4 className="font-bold text-terracotta">{q.title}</h4>
                              <p className="italic opacity-80 mb-1">{q.description}</p>
                              <div className="pl-2 border-l-4 border-orange">
                                  <strong>Next:</strong> {q.objectives[q.currentObjectiveIndex]}
                              </div>
                          </div>
                      ))
                  )}
              </div>

              <h3 className="font-bold text-lg mb-2 text-ink">Inventory</h3>
              <div className="flex flex-wrap gap-2 mb-6">
                 {Object.keys(inventory).length === 0 ? (
                     <p className="italic opacity-80 w-full text-sm">Your bag is empty.</p>
                 ) : (
                     Object.entries(inventory).map(([item, qty]) => (
                         <div key={item} className="bg-paper border-2 border-ink px-3 py-1 text-sm font-semibold flex items-center gap-2">
                             <span className="capitalize">{item.replace(/_/g, ' ')}</span>
                             <span className="bg-ink text-white px-2 py-0.5 rounded-full text-xs">{qty}</span>
                         </div>
                     ))
                 )}
              </div>
              
              <h3 className="font-bold text-lg mb-2 text-ink">Stamps</h3>
              <div className="grid grid-cols-5 gap-2 mb-4">
                {[1,2,3,4,5,6,7,8,9,10].map(i => {
                    const stamp = stamps[i-1];
                    return (
                        <div key={i} className="aspect-square bg-cream border-2 border-dashed border-ink/40 rounded flex items-center justify-center p-1 text-center text-xs overflow-hidden">
                            {stamp ? <span className="font-bold text-terracotta scale-75 block rotate-[-10deg] border-2 border-terracotta p-1">{stamp}</span> : <span className="opacity-20 uppercase font-mono tracking-widest">{i}</span>}
                        </div>
                    );
                })}
              </div>

              <button onClick={() => setMenu('pause')} className="w-full py-3 bg-terracotta border-2 border-ink font-bold text-lg text-white hover:bg-orange transition-colors shadow-[4px_4px_0_var(--color-ink)] active:translate-y-1 active:shadow-[0_0_0_var(--color-ink)] mt-4">
                Back
              </button>
            </div>
        )}

        {(currentMenu !== 'pause' && currentMenu !== 'settings' && currentMenu !== 'journal') && (
            <div className="flex flex-col gap-4 w-full">
              <button onClick={() => setMenu('pause')} className="w-full py-3 bg-terracotta border-2 border-ink font-bold text-lg text-white hover:bg-orange transition-colors shadow-[4px_4px_0_var(--color-ink)] active:translate-y-1 active:shadow-[0_0_0_var(--color-ink)] mt-4">
                Back
              </button>
            </div>
        )}
      </div>
    </div>
  );
}
