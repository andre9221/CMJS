export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      court_case: {
        Row: {
          case_id: number
          case_status: string | null
          court_name: string | null
          fir_id: number
          judge_name: string | null
        }
        Insert: {
          case_id?: number
          case_status?: string | null
          court_name?: string | null
          fir_id: number
          judge_name?: string | null
        }
        Update: {
          case_id?: number
          case_status?: string | null
          court_name?: string | null
          fir_id?: number
          judge_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "court_case_fir_id_fkey"
            columns: ["fir_id"]
            isOneToOne: true
            referencedRelation: "fir"
            referencedColumns: ["fir_id"]
          },
        ]
      }
      crime: {
        Row: {
          crime_date: string | null
          crime_id: number
          crime_type: string
          description: string | null
          location: string | null
          severity: string | null
        }
        Insert: {
          crime_date?: string | null
          crime_id?: number
          crime_type: string
          description?: string | null
          location?: string | null
          severity?: string | null
        }
        Update: {
          crime_date?: string | null
          crime_id?: number
          crime_type?: string
          description?: string | null
          location?: string | null
          severity?: string | null
        }
        Relationships: []
      }
      criminal: {
        Row: {
          address: string | null
          biometric_hash: string | null
          crime_id: number | null
          criminal_id: number
          dob: string | null
          gender: string | null
          investigation_id: number | null
          name: string
        }
        Insert: {
          address?: string | null
          biometric_hash?: string | null
          crime_id?: number | null
          criminal_id?: number
          dob?: string | null
          gender?: string | null
          investigation_id?: number | null
          name: string
        }
        Update: {
          address?: string | null
          biometric_hash?: string | null
          crime_id?: number | null
          criminal_id?: number
          dob?: string | null
          gender?: string | null
          investigation_id?: number | null
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "criminal_crime_id_fkey"
            columns: ["crime_id"]
            isOneToOne: false
            referencedRelation: "crime"
            referencedColumns: ["crime_id"]
          },
          {
            foreignKeyName: "criminal_investigation_id_fkey"
            columns: ["investigation_id"]
            isOneToOne: false
            referencedRelation: "investigation"
            referencedColumns: ["investigation_id"]
          },
        ]
      }
      evidence: {
        Row: {
          collection_date: string | null
          current_status: string | null
          description: string | null
          evidence_id: number
          fir_id: number
          type: string | null
        }
        Insert: {
          collection_date?: string | null
          current_status?: string | null
          description?: string | null
          evidence_id?: number
          fir_id: number
          type?: string | null
        }
        Update: {
          collection_date?: string | null
          current_status?: string | null
          description?: string | null
          evidence_id?: number
          fir_id?: number
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "evidence_fir_id_fkey"
            columns: ["fir_id"]
            isOneToOne: false
            referencedRelation: "fir"
            referencedColumns: ["fir_id"]
          },
        ]
      }
      fir: {
        Row: {
          crime_id: number
          fir_date: string
          fir_id: number
          station_id: number | null
          status: string | null
          victim_id: number
        }
        Insert: {
          crime_id: number
          fir_date?: string
          fir_id?: number
          station_id?: number | null
          status?: string | null
          victim_id: number
        }
        Update: {
          crime_id?: number
          fir_date?: string
          fir_id?: number
          station_id?: number | null
          status?: string | null
          victim_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "fir_crime_id_fkey"
            columns: ["crime_id"]
            isOneToOne: false
            referencedRelation: "crime"
            referencedColumns: ["crime_id"]
          },
          {
            foreignKeyName: "fir_victim_id_fkey"
            columns: ["victim_id"]
            isOneToOne: false
            referencedRelation: "victim"
            referencedColumns: ["victim_id"]
          },
        ]
      }
      hearing: {
        Row: {
          case_id: number
          hearing_date: string
          hearing_id: number
          remarks: string | null
        }
        Insert: {
          case_id: number
          hearing_date: string
          hearing_id?: number
          remarks?: string | null
        }
        Update: {
          case_id?: number
          hearing_date?: string
          hearing_id?: number
          remarks?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hearing_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "court_case"
            referencedColumns: ["case_id"]
          },
        ]
      }
      investigation: {
        Row: {
          crime_id: number
          end_date: string | null
          investigation_id: number
          start_date: string | null
          status: string | null
        }
        Insert: {
          crime_id: number
          end_date?: string | null
          investigation_id?: number
          start_date?: string | null
          status?: string | null
        }
        Update: {
          crime_id?: number
          end_date?: string | null
          investigation_id?: number
          start_date?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "investigation_crime_id_fkey"
            columns: ["crime_id"]
            isOneToOne: false
            referencedRelation: "crime"
            referencedColumns: ["crime_id"]
          },
        ]
      }
      officer: {
        Row: {
          contact_no: string | null
          name: string
          officer_id: number
          rank: string | null
          station_id: number | null
        }
        Insert: {
          contact_no?: string | null
          name: string
          officer_id?: number
          rank?: string | null
          station_id?: number | null
        }
        Update: {
          contact_no?: string | null
          name?: string
          officer_id?: number
          rank?: string | null
          station_id?: number | null
        }
        Relationships: []
      }
      officer_investigation: {
        Row: {
          investigation_id: number
          officer_id: number
        }
        Insert: {
          investigation_id: number
          officer_id: number
        }
        Update: {
          investigation_id?: number
          officer_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "officer_investigation_investigation_id_fkey"
            columns: ["investigation_id"]
            isOneToOne: false
            referencedRelation: "investigation"
            referencedColumns: ["investigation_id"]
          },
          {
            foreignKeyName: "officer_investigation_officer_id_fkey"
            columns: ["officer_id"]
            isOneToOne: false
            referencedRelation: "officer"
            referencedColumns: ["officer_id"]
          },
        ]
      }
      parole: {
        Row: {
          end_date: string | null
          parole_id: number
          prison_record_id: number | null
          start_date: string | null
          status: string | null
        }
        Insert: {
          end_date?: string | null
          parole_id?: number
          prison_record_id?: number | null
          start_date?: string | null
          status?: string | null
        }
        Update: {
          end_date?: string | null
          parole_id?: number
          prison_record_id?: number | null
          start_date?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "parole_prison_record_id_fkey"
            columns: ["prison_record_id"]
            isOneToOne: false
            referencedRelation: "prison_record"
            referencedColumns: ["prison_record_id"]
          },
        ]
      }
      prison_record: {
        Row: {
          admission_date: string | null
          criminal_id: number
          parole_id: number | null
          prison_location: string | null
          prison_name: string | null
          prison_record_id: number
          release_date: string | null
        }
        Insert: {
          admission_date?: string | null
          criminal_id: number
          parole_id?: number | null
          prison_location?: string | null
          prison_name?: string | null
          prison_record_id?: number
          release_date?: string | null
        }
        Update: {
          admission_date?: string | null
          criminal_id?: number
          parole_id?: number | null
          prison_location?: string | null
          prison_name?: string | null
          prison_record_id?: number
          release_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prison_record_criminal_id_fkey"
            columns: ["criminal_id"]
            isOneToOne: false
            referencedRelation: "criminal"
            referencedColumns: ["criminal_id"]
          },
          {
            foreignKeyName: "prison_record_parole_id_fkey"
            columns: ["parole_id"]
            isOneToOne: false
            referencedRelation: "parole"
            referencedColumns: ["parole_id"]
          },
        ]
      }
      verdict: {
        Row: {
          case_id: number
          sentence_duration: string | null
          verdict_date: string | null
          verdict_id: number
          verdict_type: string | null
        }
        Insert: {
          case_id: number
          sentence_duration?: string | null
          verdict_date?: string | null
          verdict_id?: number
          verdict_type?: string | null
        }
        Update: {
          case_id?: number
          sentence_duration?: string | null
          verdict_date?: string | null
          verdict_id?: number
          verdict_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "verdict_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: true
            referencedRelation: "court_case"
            referencedColumns: ["case_id"]
          },
        ]
      }
      victim: {
        Row: {
          address: string | null
          age: number | null
          contact: string | null
          gender: string | null
          name: string
          victim_id: number
        }
        Insert: {
          address?: string | null
          age?: number | null
          contact?: string | null
          gender?: string | null
          name: string
          victim_id?: number
        }
        Update: {
          address?: string | null
          age?: number | null
          contact?: string | null
          gender?: string | null
          name?: string
          victim_id?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      execute_sql: { Args: { query_text: string }; Returns: Json }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
