import type { Database as BaseDatabase } from "./shared";
import type { DailyTipsTable } from "./tables/daily-tips";
import type { AgentsTable } from "./tables/agents";
import type { CharactersTable } from "./tables/characters";
import type { ConversationsTable } from "./tables/conversations";
import type { LanguagesTable } from "./tables/languages";
import type { MessagesTable } from "./tables/messages";
import type { ProfilesTable } from "./tables/profiles";
import type { PronunciationAttemptsTable } from "./tables/pronunciation-attempts";
import type { RecommendationsTable } from "./tables/recommendations";
import type { ScenariosTable } from "./tables/scenarios";
import type { TransformationsTable } from "./tables/transformations";
import type { UserProgressTable } from "./tables/user-progress";
import type { UserScenariosTable } from "./tables/user-scenarios";
import type { UsersTable } from "./tables/users";

export interface Database extends BaseDatabase {
  public: {
    Tables: {
      daily_tips: DailyTipsTable;
      agents: AgentsTable;
      characters: CharactersTable;
      conversations: ConversationsTable;
      languages: LanguagesTable;
      messages: MessagesTable;
      profiles: ProfilesTable;
      pronunciation_attempts: PronunciationAttemptsTable;
      recommendations: RecommendationsTable;
      scenarios: ScenariosTable;
      transformations: TransformationsTable;
      user_progress: UserProgressTable;
      user_scenarios: UserScenariosTable;
      users: UsersTable;
    } & BaseDatabase["public"]["Tables"];
    Views: BaseDatabase["public"]["Views"];
    Functions: BaseDatabase["public"]["Functions"];
    Enums: BaseDatabase["public"]["Enums"];
    CompositeTypes: BaseDatabase["public"]["CompositeTypes"];
  }
}

export type * from "./shared";
export type * from "./tables/agents";
export type * from "./tables/characters";
export type * from "./tables/conversations";
export type * from "./tables/daily-tips";
export type * from "./tables/languages";
export type * from "./tables/messages";
export type * from "./tables/profiles";
export type * from "./tables/pronunciation-attempts";
export type * from "./tables/recommendations";
export type * from "./tables/scenarios";
export type * from "./tables/transformations";
export type * from "./tables/user-progress";
export type * from "./tables/user-scenarios";
export type * from "./tables/users";
