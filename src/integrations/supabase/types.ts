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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      crop_cycles: {
        Row: {
          id:                string
          user_id:           string
          crop_name:         string
          variety:           string | null
          superficie_m2:     number | null
          duration_days:     number
          nursery_days:      number
          start_date:        string
          expected_end_date: string | null
          tools:             string[]
          workers_count:     number
          treatments:        Json
          status:            string
          ai_calendar:       Json | null
          ai_weekly_tasks:   Json | null
          ai_generated_at:   string | null
          weather_snapshot:  Json | null
          created_at:        string
          updated_at:        string
        }
        Insert: {
          id?:               string
          user_id:           string
          crop_name:         string
          variety?:          string | null
          superficie_m2?:    number | null
          duration_days:     number
          nursery_days?:     number
          start_date:        string
          expected_end_date?: string | null
          tools?:            string[]
          workers_count?:    number
          treatments?:       Json
          status?:           string
          ai_calendar?:      Json | null
          ai_weekly_tasks?:  Json | null
          ai_generated_at?:  string | null
          weather_snapshot?: Json | null
          created_at?:       string
          updated_at?:       string
        }
        Update: {
          crop_name?:        string
          variety?:          string | null
          superficie_m2?:    number | null
          duration_days?:    number
          nursery_days?:     number
          start_date?:       string
          expected_end_date?: string | null
          tools?:            string[]
          workers_count?:    number
          treatments?:       Json
          status?:           string
          ai_calendar?:      Json | null
          ai_weekly_tasks?:  Json | null
          ai_generated_at?:  string | null
          weather_snapshot?: Json | null
          updated_at?:       string
        }
        Relationships: []
      }
      crop_tasks: {
        Row: {
          id:             string
          cycle_id:       string
          user_id:        string
          scheduled_date: string
          week_number:    number | null
          day_number:     number | null
          category:       string
          title:          string
          description:    string | null
          priority:       string
          done:           boolean
          done_at:        string | null
          notes:          string | null
          created_at:     string
        }
        Insert: {
          id?:            string
          cycle_id:       string
          user_id:        string
          scheduled_date: string
          week_number?:   number | null
          day_number?:    number | null
          category:       string
          title:          string
          description?:   string | null
          priority?:      string
          done?:          boolean
          done_at?:       string | null
          notes?:         string | null
          created_at?:    string
        }
        Update: {
          scheduled_date?: string
          week_number?:    number | null
          day_number?:     number | null
          category?:       string
          title?:          string
          description?:    string | null
          priority?:       string
          done?:           boolean
          done_at?:        string | null
          notes?:          string | null
        }
        Relationships: [
          {
            foreignKeyName: "crop_tasks_cycle_id_fkey"
            columns: ["cycle_id"]
            isOneToOne: false
            referencedRelation: "crop_cycles"
            referencedColumns: ["id"]
          }
        ]
      }
      crop_recommendations: {
        Row: {
          created_at: string
          id: string
          irrigation_available: boolean | null
          location_lat: number | null
          location_lng: number | null
          market_data: Json | null
          previous_crop: string | null
          recommended_crops: Json | null
          soil_ph: number | null
          soil_type: string | null
          user_id: string
          weather_data: Json | null
        }
        Insert: {
          created_at?: string
          id?: string
          irrigation_available?: boolean | null
          location_lat?: number | null
          location_lng?: number | null
          market_data?: Json | null
          previous_crop?: string | null
          recommended_crops?: Json | null
          soil_ph?: number | null
          soil_type?: string | null
          user_id: string
          weather_data?: Json | null
        }
        Update: {
          created_at?: string
          id?: string
          irrigation_available?: boolean | null
          location_lat?: number | null
          location_lng?: number | null
          market_data?: Json | null
          previous_crop?: string | null
          recommended_crops?: Json | null
          soil_ph?: number | null
          soil_type?: string | null
          user_id?: string
          weather_data?: Json | null
        }
        Relationships: []
      }
      crops: {
        Row: {
          category: string
          created_at: string
          growing_season: string[] | null
          growth_duration_days: number | null
          id: string
          image_url: string | null
          max_temperature: number | null
          min_temperature: number | null
          name: string
          scientific_name: string | null
          soil_ph_max: number | null
          soil_ph_min: number | null
          water_requirement: string | null
        }
        Insert: {
          category: string
          created_at?: string
          growing_season?: string[] | null
          growth_duration_days?: number | null
          id?: string
          image_url?: string | null
          max_temperature?: number | null
          min_temperature?: number | null
          name: string
          scientific_name?: string | null
          soil_ph_max?: number | null
          soil_ph_min?: number | null
          water_requirement?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          growing_season?: string[] | null
          growth_duration_days?: number | null
          id?: string
          image_url?: string | null
          max_temperature?: number | null
          min_temperature?: number | null
          name?: string
          scientific_name?: string | null
          soil_ph_max?: number | null
          soil_ph_min?: number | null
          water_requirement?: string | null
        }
        Relationships: []
      }
      disease_detections: {
        Row: {
          confidence_score: number | null
          created_at: string
          crop_name: string
          detected_disease: string | null
          id: string
          image_url: string | null
          severity: string | null
          treatment_recommendations: string[] | null
          user_id: string
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string
          crop_name: string
          detected_disease?: string | null
          id?: string
          image_url?: string | null
          severity?: string | null
          treatment_recommendations?: string[] | null
          user_id: string
        }
        Update: {
          confidence_score?: number | null
          created_at?: string
          crop_name?: string
          detected_disease?: string | null
          id?: string
          image_url?: string | null
          severity?: string | null
          treatment_recommendations?: string[] | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          farm_size_hectares: number | null
          full_name: string | null
          id: string
          location: string | null
          phone: string | null
          primary_crops: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          farm_size_hectares?: number | null
          full_name?: string | null
          id?: string
          location?: string | null
          phone?: string | null
          primary_crops?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          farm_size_hectares?: number | null
          full_name?: string | null
          id?: string
          location?: string | null
          phone?: string | null
          primary_crops?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      weather_data: {
        Row: {
          created_at: string
          forecast_date: string
          humidity: number | null
          id: string
          location_lat: number
          location_lng: number
          rainfall_mm: number | null
          temperature_max: number | null
          temperature_min: number | null
          wind_speed_kmh: number | null
        }
        Insert: {
          created_at?: string
          forecast_date: string
          humidity?: number | null
          id?: string
          location_lat: number
          location_lng: number
          rainfall_mm?: number | null
          temperature_max?: number | null
          temperature_min?: number | null
          wind_speed_kmh?: number | null
        }
        Update: {
          created_at?: string
          forecast_date?: string
          humidity?: number | null
          id?: string
          location_lat?: number
          location_lng?: number
          rainfall_mm?: number | null
          temperature_max?: number | null
          temperature_min?: number | null
          wind_speed_kmh?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
