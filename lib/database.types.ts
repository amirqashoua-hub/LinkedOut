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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      connections: {
        Row: {
          created_at: string | null
          status: string
          user_a: string
          user_b: string
        }
        Insert: {
          created_at?: string | null
          status?: string
          user_a: string
          user_b: string
        }
        Update: {
          created_at?: string | null
          status?: string
          user_a?: string
          user_b?: string
        }
        Relationships: [
          {
            foreignKeyName: "connections_user_a_fkey"
            columns: ["user_a"]
            isOneToOne: false
            referencedRelation: "feed"
            referencedColumns: ["author_id"]
          },
          {
            foreignKeyName: "connections_user_a_fkey"
            columns: ["user_a"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "connections_user_b_fkey"
            columns: ["user_b"]
            isOneToOne: false
            referencedRelation: "feed"
            referencedColumns: ["author_id"]
          },
          {
            foreignKeyName: "connections_user_b_fkey"
            columns: ["user_b"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      endorsements: {
        Row: {
          created_at: string | null
          endorser_id: string
          skill_id: string
        }
        Insert: {
          created_at?: string | null
          endorser_id: string
          skill_id: string
        }
        Update: {
          created_at?: string | null
          endorser_id?: string
          skill_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "endorsements_endorser_id_fkey"
            columns: ["endorser_id"]
            isOneToOne: false
            referencedRelation: "feed"
            referencedColumns: ["author_id"]
          },
          {
            foreignKeyName: "endorsements_endorser_id_fkey"
            columns: ["endorser_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "endorsements_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          description: string | null
          id: string
          location: string | null
          org: string | null
          place_id: string | null
          source: string
          source_url: string | null
          starts_at: string
          title: string
        }
        Insert: {
          description?: string | null
          id?: string
          location?: string | null
          org?: string | null
          place_id?: string | null
          source?: string
          source_url?: string | null
          starts_at: string
          title: string
        }
        Update: {
          description?: string | null
          id?: string
          location?: string | null
          org?: string | null
          place_id?: string | null
          source?: string
          source_url?: string | null
          starts_at?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "experience"
            referencedColumns: ["place_id"]
          },
          {
            foreignKeyName: "events_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
        ]
      }
      places: {
        Row: {
          id: string
          logo_url: string | null
          name: string
          type: Database["public"]["Enums"]["place_type"]
        }
        Insert: {
          id?: string
          logo_url?: string | null
          name: string
          type: Database["public"]["Enums"]["place_type"]
        }
        Update: {
          id?: string
          logo_url?: string | null
          name?: string
          type?: Database["public"]["Enums"]["place_type"]
        }
        Relationships: []
      }
      post_reactions: {
        Row: {
          created_at: string | null
          post_id: string
          reaction: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          post_id: string
          reaction: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          post_id?: string
          reaction?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_reactions_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "feed"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_reactions_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_reactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "feed"
            referencedColumns: ["author_id"]
          },
          {
            foreignKeyName: "post_reactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          ai_text: string
          created_at: string | null
          id: string
          raw_text: string
          user_id: string | null
        }
        Insert: {
          ai_text: string
          created_at?: string | null
          id?: string
          raw_text: string
          user_id?: string | null
        }
        Update: {
          ai_text?: string
          created_at?: string | null
          id?: string
          raw_text?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "feed"
            referencedColumns: ["author_id"]
          },
          {
            foreignKeyName: "posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_views: {
        Row: {
          viewed_at: string
          viewed_id: string
          viewed_on: string
          viewer_id: string
        }
        Insert: {
          viewed_at?: string
          viewed_id: string
          viewed_on?: string
          viewer_id: string
        }
        Update: {
          viewed_at?: string
          viewed_id?: string
          viewed_on?: string
          viewer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_views_viewed_id_fkey"
            columns: ["viewed_id"]
            isOneToOne: false
            referencedRelation: "feed"
            referencedColumns: ["author_id"]
          },
          {
            foreignKeyName: "profile_views_viewed_id_fkey"
            columns: ["viewed_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_views_viewer_id_fkey"
            columns: ["viewer_id"]
            isOneToOne: false
            referencedRelation: "feed"
            referencedColumns: ["author_id"]
          },
          {
            foreignKeyName: "profile_views_viewer_id_fkey"
            columns: ["viewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          banner_url: string | null
          created_at: string | null
          full_name: string
          handle: string
          headline: string | null
          hide_grade: boolean | null
          id: string
          program: string | null
          school: string | null
          worst_class: string | null
          worst_grade: string | null
          year: string | null
        }
        Insert: {
          avatar_url?: string | null
          banner_url?: string | null
          created_at?: string | null
          full_name: string
          handle: string
          headline?: string | null
          hide_grade?: boolean | null
          id?: string
          program?: string | null
          school?: string | null
          worst_class?: string | null
          worst_grade?: string | null
          year?: string | null
        }
        Update: {
          avatar_url?: string | null
          banner_url?: string | null
          created_at?: string | null
          full_name?: string
          handle?: string
          headline?: string | null
          hide_grade?: boolean | null
          id?: string
          program?: string | null
          school?: string | null
          worst_class?: string | null
          worst_grade?: string | null
          year?: string | null
        }
        Relationships: []
      }
      rsvps: {
        Row: {
          attended: boolean | null
          created_at: string | null
          event_id: string
          user_id: string
        }
        Insert: {
          attended?: boolean | null
          created_at?: string | null
          event_id: string
          user_id: string
        }
        Update: {
          attended?: boolean | null
          created_at?: string | null
          event_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rsvps_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rsvps_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "feed"
            referencedColumns: ["author_id"]
          },
          {
            foreignKeyName: "rsvps_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      skills: {
        Row: {
          id: string
          name: string
          user_id: string | null
        }
        Insert: {
          id?: string
          name: string
          user_id?: string | null
        }
        Update: {
          id?: string
          name?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "skills_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "feed"
            referencedColumns: ["author_id"]
          },
          {
            foreignKeyName: "skills_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      visits: {
        Row: {
          count: number
          first_visit: string | null
          last_visit: string | null
          photo_url: string | null
          place_id: string
          user_id: string
        }
        Insert: {
          count?: number
          first_visit?: string | null
          last_visit?: string | null
          photo_url?: string | null
          place_id: string
          user_id: string
        }
        Update: {
          count?: number
          first_visit?: string | null
          last_visit?: string | null
          photo_url?: string | null
          place_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "visits_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "experience"
            referencedColumns: ["place_id"]
          },
          {
            foreignKeyName: "visits_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visits_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "feed"
            referencedColumns: ["author_id"]
          },
          {
            foreignKeyName: "visits_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      experience: {
        Row: {
          count: number | null
          first_visit: string | null
          last_visit: string | null
          name: string | null
          photo_url: string | null
          place_id: string | null
          title: string | null
          type: Database["public"]["Enums"]["place_type"] | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "visits_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "feed"
            referencedColumns: ["author_id"]
          },
          {
            foreignKeyName: "visits_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      feed: {
        Row: {
          ai_text: string | null
          author_id: string | null
          avatar_url: string | null
          created_at: string | null
          full_name: string | null
          handle: string | null
          headline: string | null
          id: string | null
          my_reaction: string | null
          raw_text: string | null
          reaction_counts: Json | null
        }
        Relationships: []
      }
    }
    Functions: {
      confirm_attendance: { Args: { p_event_id: string }; Returns: Json }
      guilt_trips: {
        Args: { p_limit?: number }
        Returns: {
          actor_avatar: string
          actor_handle: string
          actor_id: string
          actor_name: string
          created_at: string
          detail: string
          kind: string
          post_id: string
        }[]
      }
      log_visit: {
        Args: { p_photo_url?: string; p_place_id: string }
        Returns: Json
      }
      people_you_may_know: {
        Args: { p_limit?: number }
        Returns: {
          avatar_url: string
          full_name: string
          handle: string
          headline: string
          id: string
          my_count: number
          shared_places: number
          their_count: number
          top_place: string
        }[]
      }
      title_for: { Args: { n: number }; Returns: string }
    }
    Enums: {
      place_type: "drinking_week" | "bar" | "club"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      place_type: ["drinking_week", "bar", "club"],
    },
  },
} as const
