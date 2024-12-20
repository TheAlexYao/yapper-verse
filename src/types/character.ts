export interface Character {
  id: string;
  name: string;
  age: number;
  gender: string;
  avatar_url?: string;
  bio: string;
  language_style: string[];
  scenario_id?: string;
}