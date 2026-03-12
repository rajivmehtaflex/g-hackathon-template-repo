export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          full_name?: string | null;
          updated_at?: string;
        };
      };
      projects: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          status: "Idea" | "Building" | "Launched";
          progress: number;
          owner_id: string | null;
          owner_name: string | null;
          is_demo: boolean | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          status?: "Idea" | "Building" | "Launched";
          progress?: number;
          owner_id?: string | null;
          owner_name?: string | null;
          is_demo?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          description?: string | null;
          status?: "Idea" | "Building" | "Launched";
          progress?: number;
          owner_id?: string | null;
          owner_name?: string | null;
          is_demo?: boolean;
          updated_at?: string;
        };
      };
      project_updates: {
        Row: {
          id: string;
          project_id: string;
          event: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          event: string;
          created_at?: string;
        };
        Update: {
          event?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      project_status: "Idea" | "Building" | "Launched";
    };
  };
};
