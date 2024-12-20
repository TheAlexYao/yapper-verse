import type { Json } from "../shared";

export interface UserScenariosTable {
  Row: {
    id: string;
    user_id: string;
    scenario_id: string;
    status: string;
    started_at: string | null;
    completed_at: string | null;
    created_at: string | null;
    updated_at: string | null;
  };
  Insert: {
    id?: string;
    user_id: string;
    scenario_id: string;
    status?: string;
    started_at?: string | null;
    completed_at?: string | null;
    created_at?: string | null;
    updated_at?: string | null;
  };
  Update: {
    id?: string;
    user_id?: string;
    scenario_id?: string;
    status?: string;
    started_at?: string | null;
    completed_at?: string | null;
    created_at?: string | null;
    updated_at?: string | null;
  };
}