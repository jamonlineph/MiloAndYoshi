import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type QuestStatus = 'locked' | 'available' | 'active' | 'completed';

export interface Quest {
  id: string;
  title: string;
  description: string;
  status: QuestStatus;
  currentObjectiveIndex: number;
  objectives: string[];
  rewardDescription?: string;
}

export type TimeOfDay = 'morning' | 'afternoon' | 'sunset' | 'evening';
export type CompanionCommand = 'follow' | 'stay' | 'come';

export interface GameSettings {
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  dialogueVolume: number;
  cameraSensitivity: number;
  invertCameraY: boolean;
  reducedMotion: boolean;
  textSpeed: 'slow' | 'normal' | 'fast';
  graphicsQuality: 'low' | 'medium' | 'high';
  showMinimap: boolean;
}

export interface Vector3State {
  x: number;
  y: number;
  z: number;
}

export interface DialogState {
  speakerName: string;
  text: string;
  onClose?: () => void;
}

interface GameState {
  // Quests & Progression
  quests: Record<string, Quest>;
  activeQuestId: string | null;
  unlockedAreas: string[];
  inventory: Record<string, number>;
  stamps: string[];
  
  // World State
  timeOfDay: TimeOfDay;
  worldFlags: Record<string, boolean | string | number>;
  spawnPoint: Vector3State;
  playerPosition: Vector3State;
  
  // Characters & Companions
  hasMilo: boolean;
  miloCommand: CompanionCommand;
  miloFriendship: number;
  
  // Customization
  unlockedAccessories: string[];
  yoshiAccessory: string | null;
  miloAccessory: string | null;
  
  // Interaction System
  closestInteractableId: string | null;
  setClosestInteractableId: (id: string | null) => void;
  registerInteractable: (id: string, position: Vector3State, prompt: string, onInteract: () => void) => void;
  unregisterInteractable: (id: string) => void;
  interactables: Map<string, { position: Vector3State, prompt: string, onInteract: () => void }>;
  currentMenu: 'none' | 'pause' | 'map' | 'journal' | 'wardrobe' | 'settings' | 'collections';
  showInteractPrompt: string | null;
  activeDialog: DialogState | null;
  
  // Settings
  settings: GameSettings;

  // Actions
  initQuests: (quests: Record<string, Quest>) => void;
  setQuestStatus: (id: string, status: QuestStatus) => void;
  setActiveQuest: (id: string | null) => void;
  advanceQuestObjective: (id: string) => void;
  setWorldFlag: (key: string, value: boolean | string | number) => void;
  
  setDialog: (speakerName: string, text: string, onClose?: () => void) => void;
  clearDialog: () => void;
  
  addItem: (itemId: string, amount?: number) => void;
  removeItem: (itemId: string, amount?: number) => void;
  
  setMenu: (menu: GameState['currentMenu']) => void;
  updateSettings: (settings: Partial<GameSettings>) => void;
  setSpawnPoint: (point: Vector3State) => void;
  setPlayerPosition: (point: Vector3State) => void;
  setInteractPrompt: (prompt: string | null) => void;
  
  setMiloState: (hasMilo: boolean) => void;
  setMiloCommand: (command: CompanionCommand) => void;
  addMiloFriendship: (amount: number) => void;
  
  equipYoshiAccessory: (accessoryId: string | null) => void;
  equipMiloAccessory: (accessoryId: string | null) => void;
  unlockAccessory: (accessoryId: string) => void;
  
  setTimeOfDay: (time: TimeOfDay) => void;
  unlockArea: (areaId: string) => void;
  addStamp: (stampId: string) => void;
  resetSaveData: () => void;
}

const defaultSettings: GameSettings = {
  masterVolume: 1.0,
  musicVolume: 0.5,
  sfxVolume: 0.8,
  dialogueVolume: 0.8,
  cameraSensitivity: 1.0,
  invertCameraY: false,
  reducedMotion: false,
  textSpeed: 'normal',
  graphicsQuality: 'medium',
  showMinimap: true,
};

const initialState = {
  quests: {},
  activeQuestId: null,
  unlockedAreas: ['courier-cove', 'sunbeam-harbor'],
  inventory: {},
  stamps: [],
  timeOfDay: 'morning' as TimeOfDay,
  worldFlags: {},
  spawnPoint: { x: 0, y: 2, z: -5 },
  playerPosition: { x: 0, y: 1, z: -5 },
  hasMilo: true,
  miloCommand: 'follow' as CompanionCommand,
  miloFriendship: 0,
  unlockedAccessories: ['red-neckerchief'],
  yoshiAccessory: 'red-neckerchief',
  miloAccessory: null,
  closestInteractableId: null,
  interactables: new Map(),
  activeDialog: null,
  currentMenu: 'none' as const,
  showInteractPrompt: null,
  settings: defaultSettings,
};

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      ...initialState,

      initQuests: (quests) => set((state) => {
        if (Object.keys(state.quests).length === 0) {
           return { quests };
        }

        const mergedQuests = Object.fromEntries(
          Object.entries(quests).map(([id, quest]) => {
            const savedQuest = state.quests[id];
            return [
              id,
              savedQuest
                ? {
                    ...quest,
                    status: savedQuest.status,
                    currentObjectiveIndex: savedQuest.currentObjectiveIndex,
                  }
                : quest,
            ];
          })
        );

        return { quests: mergedQuests };
      }),
      
      setQuestStatus: (id, status) => set((state) => ({
        quests: {
          ...state.quests,
          [id]: { ...state.quests[id], status }
        }
      })),
      
      setActiveQuest: (id) => set((state) => {
        if (!id || !state.quests[id]) {
          return { activeQuestId: id };
        }

        return {
          activeQuestId: id,
          quests: {
            ...state.quests,
            [id]: { ...state.quests[id], status: 'active' },
          },
        };
      }),
      
      advanceQuestObjective: (id) => set((state) => {
        const quest = state.quests[id];
        if (!quest) return state;
        
        const nextIndex = quest.currentObjectiveIndex + 1;
        if (nextIndex >= quest.objectives.length) {
           return {
             quests: { ...state.quests, [id]: { ...quest, status: 'completed' } },
             activeQuestId: state.activeQuestId === id ? null : state.activeQuestId
           };
        }
        
        return {
          quests: { ...state.quests, [id]: { ...quest, currentObjectiveIndex: nextIndex } }
        };
      }),
      
      setWorldFlag: (key, value) => set((state) => ({
        worldFlags: { ...state.worldFlags, [key]: value }
      })),

      setDialog: (speakerName, text, onClose) => set({ activeDialog: { speakerName, text, onClose } }),
      clearDialog: () => set((state) => {
        if (state.activeDialog?.onClose) {
          state.activeDialog.onClose();
        }
        return { activeDialog: null };
      }),
      
      addItem: (itemId, amount = 1) => set((state) => ({
        inventory: { 
          ...state.inventory, 
          [itemId]: (state.inventory[itemId] || 0) + amount 
        }
      })),
      
      removeItem: (itemId, amount = 1) => set((state) => {
        const current = state.inventory[itemId] || 0;
        const next = Math.max(0, current - amount);
        const newInventory = { ...state.inventory };
        if (next === 0) {
          delete newInventory[itemId];
        } else {
          newInventory[itemId] = next;
        }
        return { inventory: newInventory };
      }),
      
      setMenu: (menu) => set({ currentMenu: menu }),
      
      updateSettings: (newSettings) => set((state) => ({ 
        settings: { ...state.settings, ...newSettings } 
      })),
      
      setSpawnPoint: (spawnPoint) => set({ spawnPoint }),
      setPlayerPosition: (playerPosition) => set({ playerPosition }),
      setInteractPrompt: (prompt) => set({ showInteractPrompt: prompt }),
      
      setClosestInteractableId: (id) => set({ closestInteractableId: id }),
      registerInteractable: (id, position, prompt, onInteract) => {
         const interactables = get().interactables;
         interactables.set(id, { position, prompt, onInteract });
         // we don't call set() to avoid react re-renders on map mutation, it's used as a ref
      },
      unregisterInteractable: (id) => {
         const interactables = get().interactables;
         interactables.delete(id);
      },
      
      setMiloState: () => set({ hasMilo: true }),
      setMiloCommand: (miloCommand) => set({ miloCommand }),
      addMiloFriendship: (amount) => set((state) => ({ miloFriendship: state.miloFriendship + amount })),
      
      equipYoshiAccessory: (id) => set({ yoshiAccessory: id }),
      equipMiloAccessory: (id) => set({ miloAccessory: id }),
      unlockAccessory: (id) => set((state) => ({
        unlockedAccessories: state.unlockedAccessories.includes(id) 
          ? state.unlockedAccessories 
          : [...state.unlockedAccessories, id]
      })),
      
      setTimeOfDay: (timeOfDay) => set({ timeOfDay }),
      unlockArea: (areaId) => set((state) => ({
        unlockedAreas: state.unlockedAreas.includes(areaId) 
          ? state.unlockedAreas 
          : [...state.unlockedAreas, areaId]
      })),
      
      addStamp: (stampId) => set((state) => ({
        stamps: state.stamps.includes(stampId) ? state.stamps : [...state.stamps, stampId]
      })),
      
      resetSaveData: () => set({ ...initialState, settings: get().settings }),
    }),
    {
      name: 'yoshi-milo-save',
      version: 4,
      migrate: (persistedState, version) => {
        const state = persistedState as Partial<GameState>;
        if (version < 4) {
          return {
            ...state,
            quests: {},
            activeQuestId: null,
            worldFlags: {},
            spawnPoint: { x: 0, y: 2, z: -5 },
            hasMilo: true,
          } as any;
        }

        return state as any;
      },
      partialize: (state) => ({
        quests: state.quests,
        activeQuestId: state.activeQuestId,
        unlockedAreas: state.unlockedAreas,
        inventory: state.inventory,
        stamps: state.stamps,
        timeOfDay: state.timeOfDay,
        worldFlags: state.worldFlags,
        spawnPoint: state.spawnPoint,
        hasMilo: state.hasMilo,
        miloFriendship: state.miloFriendship,
        unlockedAccessories: state.unlockedAccessories,
        yoshiAccessory: state.yoshiAccessory,
        miloAccessory: state.miloAccessory,
        settings: state.settings,
      }),
    }
  )
);
