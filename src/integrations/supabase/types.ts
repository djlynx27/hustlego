export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      cities: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      zones: {
        Row: {
          id: string;
          city_id: string;
          name: string;
          type: string;
          current_score: number;
          // Add other fields as needed
        };
        Insert: {
          id?: string;
          city_id: string;
          name: string;
          type: string;
          current_score?: number;
          // Add other fields as needed
        };
        Update: {
          id?: string;
          city_id?: string;
          name?: string;
          type?: string;
          current_score?: number;
          // Add other fields as needed
        };
        Relationships: [];
      };
    }
  }
}
