export type ProficiencyLevel = 1 | 2 | 3 | 4 | 5;

export interface Skill {
  id: string;
  name: string;
  category: string;
  level: ProficiencyLevel;
}

export interface Interest {
  id: string;
  topic: string;
}

export interface Credit {
  id: string;
  memberId: string;
  project: string;
  description: string;
  points: number;
  date: string;
}

export interface WorkProfile {
  id: string;
  name: string;
  role: string;
  skills: Skill[];
  interests: Interest[];
  preferredWorkTypes: string[];
  capacityPct: number;
  createdAt: string;
  updatedAt: string;
}

export type View = 'profiles' | 'matrix' | 'credits';
