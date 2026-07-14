import { useGameStore } from '../../store/useGameStore';
import { PauseMenu } from './PauseMenu';
import { VirtualControls } from './VirtualControls';
import { Minimap } from './Minimap';

export function UILayer() {
  const activeDialog = useGameStore(state => state.activeDialog);
  const clearDialog = useGameStore(state => state.clearDialog);
  const activeQuestId = useGameStore(state => state.activeQuestId);
  const quests = useGameStore(state => state.quests);
  const showInteractPrompt = useGameStore(state => state.showInteractPrompt);
  const setMenu = useGameStore(state => state.setMenu);

  const activeQuest = activeQuestId ? quests[activeQuestId] : null;

  return (
    <>
    <PauseMenu />
    <div className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-between p-6 sm:p-10">
      
      {/* Top Section */}
      <div className="flex justify-between items-start pointer-events-none">
        {/* Top Left: Quest Tracker */}
        {activeQuest ? (
          <div className="bg-paper w-[280px] p-5 rounded-sm shadow-[8px_8px_0_var(--color-ink)] border border-black/10 pointer-events-auto relative mt-2 ml-2 transition-transform">
            <div className="absolute -top-4 -right-4 w-14 h-14 border-4 border-terracotta rounded-full flex items-center justify-center text-terracotta font-extrabold -rotate-12 bg-paper/90 text-xs shadow-sm">
              <span className="text-[10px]">QUEST</span>
            </div>
            <div className="text-[10px] uppercase tracking-[2px] font-semibold mb-2 text-terracotta">Active Quest</div>
            <h3 className="font-display text-xl mb-2 text-ink leading-tight">{activeQuest.title}</h3>
            <p className="text-xs leading-relaxed opacity-80 text-ink mb-3">{activeQuest.description}</p>
            <div className="mt-3 text-xs font-semibold text-ink p-2 border-l-4 border-orange bg-black/5">
               <span className="font-bold opacity-70 uppercase tracking-wider text-[10px] block mb-1">Objective</span> 
               {activeQuest.objectives[activeQuest.currentObjectiveIndex]}
            </div>
          </div>
        ) : (
          <div className="bg-paper w-[280px] p-5 rounded-sm shadow-[8px_8px_0_var(--color-ink)] border border-black/10 pointer-events-auto italic text-sm text-ink opacity-80">
             Talk to Taro to find out what's new.
          </div>
        )}
        {/* Top Right: Minimap and Pause Button */}
        <div className="flex flex-col items-end gap-4 pointer-events-auto mt-2 mr-2">
          <Minimap />
          <button onClick={() => setMenu('pause')} className="bg-paper p-3 border-2 border-ink shadow-[4px_4px_0_var(--color-ink)] hover:bg-cream hover:-translate-y-1 active:translate-y-0 active:shadow-[0_0_0_var(--color-ink)] transition-all text-ink">
             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          </button>
        </div>
      </div>

      {/* Interaction Prompt (Center Screen) */}
      {!activeDialog && showInteractPrompt && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none mt-16 animate-bounce">
            <div className="bg-ink text-white px-4 py-2 rounded-full shadow-lg font-bold text-sm tracking-wide border-2 border-transparent">
               [E] {showInteractPrompt}
            </div>
        </div>
      )}

      {/* Bottom Center: Dialog Box */}
      <div className="flex justify-center mb-8 sm:mb-6">
        {activeDialog && (
          <div className="bg-paper w-full max-w-2xl px-10 py-8 border-2 border-ink relative pointer-events-auto shadow-[8px_8px_0_var(--color-ink)] animate-in slide-in-from-bottom-4 fade-in">
             <div className="absolute -top-4 left-5 bg-ink text-white px-4 py-1 text-xs font-semibold uppercase tracking-widest">{activeDialog.speakerName}</div>
             <div className="text-lg leading-relaxed text-ink font-medium">{activeDialog.text}</div>
             <button 
                onClick={clearDialog}
                className="mt-6 float-right bg-orange text-white px-6 py-2 border-2 border-ink font-bold text-sm hover:bg-terracotta hover:-translate-y-1 transition-all shadow-[4px_4px_0_var(--color-ink)] active:shadow-[0_0_0_var(--color-ink)] active:translate-y-0"
              >
                {/* Could map next vs close but Next is universal enough */}
               Next 
             </button>
             <div className="clear-both"></div>
          </div>
        )}
      </div>
    </div>
    
    <VirtualControls />
    </>
  );
}
