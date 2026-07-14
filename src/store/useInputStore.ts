import { create } from 'zustand';

interface InputState {
  joystickLine: { x: number, y: number };
  virtualButtons: {
    run: boolean;
    interact: boolean;
    bark: boolean;
    jump: boolean;
  };
  setJoystick: (val: { x: number, y: number }) => void;
  setButton: (btn: keyof InputState['virtualButtons'], isPressed: boolean) => void;
}

export const useInputStore = create<InputState>((set) => ({
  joystickLine: { x: 0, y: 0 },
  virtualButtons: {
    run: false,
    interact: false,
    bark: false,
    jump: false,
  },
  setJoystick: (val) => set({ joystickLine: val }),
  setButton: (btn, isPressed) => set((state) => ({
    virtualButtons: { ...state.virtualButtons, [btn]: isPressed }
  })),
}));
