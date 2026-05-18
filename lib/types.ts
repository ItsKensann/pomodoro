export type Phase = "work" | "shortBreak" | "longBreak";

export type TimerStatus = "idle" | "running" | "paused";

export interface Settings {
  workMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  longBreakInterval: number;
  autoStart: boolean;
  soundOn: boolean;
  musicOn: boolean;
}

export interface Task {
  id: string;
  text: string;
  done: boolean;
  createdAt: number;
}
