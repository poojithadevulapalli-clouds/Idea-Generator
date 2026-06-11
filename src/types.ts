export type DifficultyType = 'Beginner' | 'Intermediate' | 'Advanced';

export interface KeyFeature {
  title: string;
  description: string;
}

export interface DbTable {
  tableName: string;
  fields: string[];
}

export interface ProjectMilestone {
  phase: string;
  tasks: string[];
}

export interface ProjectChallenge {
  title: string;
  solution: string;
}

export interface StarterFile {
  filename: string;
  language: string;
  code: string;
}

export interface ProjectBlueprint {
  id: string;
  title: string;
  tagline: string;
  description: string;
  difficulty: DifficultyType;
  estimatedTime: string;
  domain: string;
  techStack: string[];
  keyFeatures: KeyFeature[];
  architecture: string;
  databaseSchema: DbTable[];
  learningOutcomes: string[];
  milestones: ProjectMilestone[];
  challenges: ProjectChallenge[];
  starterCode: StarterFile[];
}

export interface GeneratorConfig {
  prompt: string;
  difficulty: DifficultyType | 'Any';
  domain: string;
  techStack: string[];
  constraints: string[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export interface SavedProjectState {
  blueprint: ProjectBlueprint;
  completedTasks: string[]; // List of unique completed task titles/keys (e.g. "Phase 1: Setup-Task Name")
  customNotes?: string;
  bookmarkedAt: string;
}
