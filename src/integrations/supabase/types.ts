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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      conversations: {
        Row: {
          created_at: string
          id: string
          last_message_at: string | null
          participant_one: string
          participant_two: string
          room_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_message_at?: string | null
          participant_one: string
          participant_two: string
          room_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          last_message_at?: string | null
          participant_one?: string
          participant_two?: string
          room_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "public_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          is_filtered: boolean | null
          read_at: string | null
          sender_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          is_filtered?: boolean | null
          read_at?: string | null
          sender_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          is_filtered?: boolean | null
          read_at?: string | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          id: string
          payment_type: string
          paymob_order_id: string | null
          paymob_transaction_id: string | null
          platform_fee: number
          reservation_id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          payment_type?: string
          paymob_order_id?: string | null
          paymob_transaction_id?: string | null
          platform_fee: number
          reservation_id: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          payment_type?: string
          paymob_order_id?: string | null
          paymob_transaction_id?: string | null
          platform_fee?: number
          reservation_id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: false
            referencedRelation: "reservations"
            referencedColumns: ["id"]
          },
        ]
      }
      payouts: {
        Row: {
          amount: number
          created_at: string
          id: string
          notes: string | null
          owner_id: string
          payout_details: string | null
          payout_method: string
          processed_at: string | null
          processed_by: string | null
          reservation_id: string
          status: string
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          notes?: string | null
          owner_id: string
          payout_details?: string | null
          payout_method: string
          processed_at?: string | null
          processed_by?: string | null
          reservation_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          notes?: string | null
          owner_id?: string
          payout_details?: string | null
          payout_method?: string
          processed_at?: string | null
          processed_by?: string | null
          reservation_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payouts_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: false
            referencedRelation: "reservations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          about: string | null
          avatar_url: string | null
          created_at: string
          email: string
          email_verified: boolean | null
          full_name: string
          gender: Database["public"]["Enums"]["user_gender"]
          has_pets: boolean | null
          id: string
          is_smoker: boolean | null
          looking_for: string | null
          nationality: string | null
          occupation: string | null
          pet_type: string | null
          phone: string | null
          phone_verified: boolean | null
          updated_at: string
          user_id: string
          verification_status:
            | Database["public"]["Enums"]["verification_status"]
            | null
          whatsapp: string | null
        }
        Insert: {
          about?: string | null
          avatar_url?: string | null
          created_at?: string
          email: string
          email_verified?: boolean | null
          full_name: string
          gender: Database["public"]["Enums"]["user_gender"]
          has_pets?: boolean | null
          id?: string
          is_smoker?: boolean | null
          looking_for?: string | null
          nationality?: string | null
          occupation?: string | null
          pet_type?: string | null
          phone?: string | null
          phone_verified?: boolean | null
          updated_at?: string
          user_id: string
          verification_status?:
            | Database["public"]["Enums"]["verification_status"]
            | null
          whatsapp?: string | null
        }
        Update: {
          about?: string | null
          avatar_url?: string | null
          created_at?: string
          email?: string
          email_verified?: boolean | null
          full_name?: string
          gender?: Database["public"]["Enums"]["user_gender"]
          has_pets?: boolean | null
          id?: string
          is_smoker?: boolean | null
          looking_for?: string | null
          nationality?: string | null
          occupation?: string | null
          pet_type?: string | null
          phone?: string | null
          phone_verified?: boolean | null
          updated_at?: string
          user_id?: string
          verification_status?:
            | Database["public"]["Enums"]["verification_status"]
            | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      reservations: {
        Row: {
          check_in_date: string
          created_at: string
          duration_months: number
          id: string
          insurance_amount: number
          owner_confirmed: boolean | null
          owner_id: string
          platform_fee: number
          room_id: string
          room_price: number
          seeker_confirmed: boolean | null
          seeker_id: string
          status: string
          total_paid: number
          updated_at: string
        }
        Insert: {
          check_in_date: string
          created_at?: string
          duration_months?: number
          id?: string
          insurance_amount?: number
          owner_confirmed?: boolean | null
          owner_id: string
          platform_fee: number
          room_id: string
          room_price: number
          seeker_confirmed?: boolean | null
          seeker_id: string
          status?: string
          total_paid: number
          updated_at?: string
        }
        Update: {
          check_in_date?: string
          created_at?: string
          duration_months?: number
          id?: string
          insurance_amount?: number
          owner_confirmed?: boolean | null
          owner_id?: string
          platform_fee?: number
          room_id?: string
          room_price?: number
          seeker_confirmed?: boolean | null
          seeker_id?: string
          status?: string
          total_paid?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reservations_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "public_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservations_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      rooms: {
        Row: {
          address: string | null
          allows_pets: boolean | null
          allows_smoking: boolean | null
          amenities: string[] | null
          area: string | null
          available_from: string
          city: string
          created_at: string
          current_roommates: number | null
          description: string | null
          id: string
          insurance_amount: number | null
          is_featured: boolean | null
          max_roommates: number | null
          min_stay_months: number | null
          owner_id: string
          owner_payout_method: string | null
          payout_details: string | null
          photos: string[] | null
          preferred_gender: string | null
          price_per_month: number
          room_type: Database["public"]["Enums"]["room_type"]
          rules: string[] | null
          status: Database["public"]["Enums"]["listing_status"]
          title: string
          updated_at: string
          views_count: number | null
        }
        Insert: {
          address?: string | null
          allows_pets?: boolean | null
          allows_smoking?: boolean | null
          amenities?: string[] | null
          area?: string | null
          available_from?: string
          city: string
          created_at?: string
          current_roommates?: number | null
          description?: string | null
          id?: string
          insurance_amount?: number | null
          is_featured?: boolean | null
          max_roommates?: number | null
          min_stay_months?: number | null
          owner_id: string
          owner_payout_method?: string | null
          payout_details?: string | null
          photos?: string[] | null
          preferred_gender?: string | null
          price_per_month: number
          room_type?: Database["public"]["Enums"]["room_type"]
          rules?: string[] | null
          status?: Database["public"]["Enums"]["listing_status"]
          title: string
          updated_at?: string
          views_count?: number | null
        }
        Update: {
          address?: string | null
          allows_pets?: boolean | null
          allows_smoking?: boolean | null
          amenities?: string[] | null
          area?: string | null
          available_from?: string
          city?: string
          created_at?: string
          current_roommates?: number | null
          description?: string | null
          id?: string
          insurance_amount?: number | null
          is_featured?: boolean | null
          max_roommates?: number | null
          min_stay_months?: number | null
          owner_id?: string
          owner_payout_method?: string | null
          payout_details?: string | null
          photos?: string[] | null
          preferred_gender?: string | null
          price_per_month?: number
          room_type?: Database["public"]["Enums"]["room_type"]
          rules?: string[] | null
          status?: Database["public"]["Enums"]["listing_status"]
          title?: string
          updated_at?: string
          views_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "rooms_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "rooms_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      saved_rooms: {
        Row: {
          created_at: string
          id: string
          room_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          room_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          room_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_rooms_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "public_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_rooms_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_rooms_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "saved_rooms_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      verification_requests: {
        Row: {
          created_at: string
          document_type: string
          document_url: string
          document_url_back: string | null
          document_url_front: string | null
          id: string
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          document_type: string
          document_url: string
          document_url_back?: string | null
          document_url_front?: string | null
          id?: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          document_type?: string
          document_url?: string
          document_url_back?: string | null
          document_url_front?: string | null
          id?: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "verification_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "verification_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
    }
    Views: {
      public_profiles: {
        Row: {
          about: string | null
          avatar_url: string | null
          created_at: string | null
          full_name: string | null
          gender: Database["public"]["Enums"]["user_gender"] | null
          has_pets: boolean | null
          is_smoker: boolean | null
          looking_for: string | null
          nationality: string | null
          occupation: string | null
          pet_type: string | null
          user_id: string | null
          verification_status:
            | Database["public"]["Enums"]["verification_status"]
            | null
        }
        Insert: {
          about?: string | null
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          gender?: Database["public"]["Enums"]["user_gender"] | null
          has_pets?: boolean | null
          is_smoker?: boolean | null
          looking_for?: string | null
          nationality?: string | null
          occupation?: string | null
          pet_type?: string | null
          user_id?: string | null
          verification_status?:
            | Database["public"]["Enums"]["verification_status"]
            | null
        }
        Update: {
          about?: string | null
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          gender?: Database["public"]["Enums"]["user_gender"] | null
          has_pets?: boolean | null
          is_smoker?: boolean | null
          looking_for?: string | null
          nationality?: string | null
          occupation?: string | null
          pet_type?: string | null
          user_id?: string | null
          verification_status?:
            | Database["public"]["Enums"]["verification_status"]
            | null
        }
        Relationships: []
      }
      public_rooms: {
        Row: {
          address: string | null
          allows_pets: boolean | null
          allows_smoking: boolean | null
          amenities: string[] | null
          area: string | null
          available_from: string | null
          city: string | null
          created_at: string | null
          current_roommates: number | null
          description: string | null
          id: string | null
          is_featured: boolean | null
          max_roommates: number | null
          min_stay_months: number | null
          photos: string[] | null
          preferred_gender: string | null
          price_per_month: number | null
          room_type: Database["public"]["Enums"]["room_type"] | null
          rules: string[] | null
          status: Database["public"]["Enums"]["listing_status"] | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          allows_pets?: boolean | null
          allows_smoking?: boolean | null
          amenities?: string[] | null
          area?: string | null
          available_from?: string | null
          city?: string | null
          created_at?: string | null
          current_roommates?: number | null
          description?: string | null
          id?: string | null
          is_featured?: boolean | null
          max_roommates?: number | null
          min_stay_months?: number | null
          photos?: string[] | null
          preferred_gender?: string | null
          price_per_month?: number | null
          room_type?: Database["public"]["Enums"]["room_type"] | null
          rules?: string[] | null
          status?: Database["public"]["Enums"]["listing_status"] | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          allows_pets?: boolean | null
          allows_smoking?: boolean | null
          amenities?: string[] | null
          area?: string | null
          available_from?: string | null
          city?: string | null
          created_at?: string | null
          current_roommates?: number | null
          description?: string | null
          id?: string | null
          is_featured?: boolean | null
          max_roommates?: number | null
          min_stay_months?: number | null
          photos?: string[] | null
          preferred_gender?: string | null
          price_per_month?: number | null
          room_type?: Database["public"]["Enums"]["room_type"] | null
          rules?: string[] | null
          status?: Database["public"]["Enums"]["listing_status"] | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      confirm_reservation: {
        Args: { _reservation_id: string; _user_id: string }
        Returns: {
          owner_confirmed: boolean
          reservation_status: string
          seeker_confirmed: boolean
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      is_user_verified: { Args: { check_user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      listing_status: "draft" | "active" | "rented" | "expired"
      room_type: "private_room" | "shared_room" | "studio" | "apartment"
      user_gender: "male" | "female"
      verification_status: "unverified" | "pending" | "verified" | "rejected"
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
    Enums: {
      app_role: ["admin", "moderator", "user"],
      listing_status: ["draft", "active", "rented", "expired"],
      room_type: ["private_room", "shared_room", "studio", "apartment"],
      user_gender: ["male", "female"],
      verification_status: ["unverified", "pending", "verified", "rejected"],
    },
  },
} as const
