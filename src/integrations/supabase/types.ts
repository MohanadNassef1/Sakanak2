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
      ai_chat_logs: {
        Row: {
          chat_type: string
          content: string
          created_at: string
          id: string
          language: string | null
          role: string
          session_id: string
          user_id: string | null
        }
        Insert: {
          chat_type: string
          content: string
          created_at?: string
          id?: string
          language?: string | null
          role: string
          session_id: string
          user_id?: string | null
        }
        Update: {
          chat_type?: string
          content?: string
          created_at?: string
          id?: string
          language?: string | null
          role?: string
          session_id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      contact_submissions: {
        Row: {
          created_at: string
          email: string
          id: string
          is_read: boolean
          message: string
          name: string
          rating: number | null
          subject: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_read?: boolean
          message: string
          name: string
          rating?: number | null
          subject: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_read?: boolean
          message?: string
          name?: string
          rating?: number | null
          subject?: string
        }
        Relationships: []
      }
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
      decline_reports: {
        Row: {
          admin_action: string | null
          admin_notes: string | null
          admin_reviewed: boolean | null
          admin_reviewed_at: string | null
          admin_reviewed_by: string | null
          broker_fee_details: string | null
          broker_illegal_fees: boolean | null
          created_at: string
          evidence_photos: string[] | null
          evidence_videos: string[] | null
          id: string
          landlord_id: string
          reason: Database["public"]["Enums"]["decline_reason"]
          reason_details: string | null
          room_id: string
          tenant_id: string
          viewing_request_id: string
        }
        Insert: {
          admin_action?: string | null
          admin_notes?: string | null
          admin_reviewed?: boolean | null
          admin_reviewed_at?: string | null
          admin_reviewed_by?: string | null
          broker_fee_details?: string | null
          broker_illegal_fees?: boolean | null
          created_at?: string
          evidence_photos?: string[] | null
          evidence_videos?: string[] | null
          id?: string
          landlord_id: string
          reason: Database["public"]["Enums"]["decline_reason"]
          reason_details?: string | null
          room_id: string
          tenant_id: string
          viewing_request_id: string
        }
        Update: {
          admin_action?: string | null
          admin_notes?: string | null
          admin_reviewed?: boolean | null
          admin_reviewed_at?: string | null
          admin_reviewed_by?: string | null
          broker_fee_details?: string | null
          broker_illegal_fees?: boolean | null
          created_at?: string
          evidence_photos?: string[] | null
          evidence_videos?: string[] | null
          id?: string
          landlord_id?: string
          reason?: Database["public"]["Enums"]["decline_reason"]
          reason_details?: string | null
          room_id?: string
          tenant_id?: string
          viewing_request_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "decline_reports_landlord_id_fkey"
            columns: ["landlord_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "decline_reports_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "public_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "decline_reports_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "decline_reports_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "decline_reports_viewing_request_id_fkey"
            columns: ["viewing_request_id"]
            isOneToOne: false
            referencedRelation: "viewing_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      email_logs: {
        Row: {
          created_at: string
          email_type: string
          error_message: string | null
          html_content: string | null
          id: string
          recipient_email: string
          recipient_name: string | null
          recipient_user_id: string | null
          sent_by: string
          status: string
          subject: string
        }
        Insert: {
          created_at?: string
          email_type?: string
          error_message?: string | null
          html_content?: string | null
          id?: string
          recipient_email: string
          recipient_name?: string | null
          recipient_user_id?: string | null
          sent_by: string
          status?: string
          subject: string
        }
        Update: {
          created_at?: string
          email_type?: string
          error_message?: string | null
          html_content?: string | null
          id?: string
          recipient_email?: string
          recipient_name?: string | null
          recipient_user_id?: string | null
          sent_by?: string
          status?: string
          subject?: string
        }
        Relationships: []
      }
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      inbound_emails: {
        Row: {
          created_at: string
          from_email: string
          from_name: string | null
          html_body: string | null
          id: string
          in_reply_to: string | null
          is_read: boolean
          message_id: string | null
          raw_payload: Json | null
          received_at: string
          subject: string | null
          text_body: string | null
          to_email: string
        }
        Insert: {
          created_at?: string
          from_email: string
          from_name?: string | null
          html_body?: string | null
          id?: string
          in_reply_to?: string | null
          is_read?: boolean
          message_id?: string | null
          raw_payload?: Json | null
          received_at?: string
          subject?: string | null
          text_body?: string | null
          to_email: string
        }
        Update: {
          created_at?: string
          from_email?: string
          from_name?: string | null
          html_body?: string | null
          id?: string
          in_reply_to?: string | null
          is_read?: boolean
          message_id?: string | null
          raw_payload?: Json | null
          received_at?: string
          subject?: string | null
          text_body?: string | null
          to_email?: string
        }
        Relationships: []
      }
      listing_questions: {
        Row: {
          answer: string | null
          answered_at: string | null
          asker_id: string
          created_at: string
          id: string
          is_public: boolean | null
          question: string
          room_id: string
          updated_at: string
        }
        Insert: {
          answer?: string | null
          answered_at?: string | null
          asker_id: string
          created_at?: string
          id?: string
          is_public?: boolean | null
          question: string
          room_id: string
          updated_at?: string
        }
        Update: {
          answer?: string | null
          answered_at?: string | null
          asker_id?: string
          created_at?: string
          id?: string
          is_public?: boolean | null
          question?: string
          room_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "listing_questions_asker_id_fkey"
            columns: ["asker_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "listing_questions_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "public_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listing_questions_room_id_fkey"
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
          age: number | null
          avatar_url: string | null
          bio: string | null
          cover_url: string | null
          created_at: string
          date_of_birth: string | null
          disabled_at: string | null
          disabled_by: string | null
          disabled_reason: string | null
          email: string
          email_verified: boolean | null
          faculty: string | null
          full_name: string
          gender: Database["public"]["Enums"]["user_gender"] | null
          has_pets: boolean | null
          hear_about_us: string | null
          id: string
          interested_area_1: string | null
          interested_area_2: string | null
          is_disabled: boolean
          is_smoker: boolean | null
          is_student_verified: boolean | null
          job_title: string | null
          looking_for: string | null
          nationality: string | null
          occupation: string | null
          occupation_status: string | null
          personality_tags: string[] | null
          pet_type: string | null
          phone: string | null
          phone_verified: boolean | null
          public_id: string | null
          referral_code: string | null
          referral_count: number | null
          referred_by: string | null
          university: string | null
          updated_at: string
          user_id: string
          verification_status:
            | Database["public"]["Enums"]["verification_status"]
            | null
          whatsapp: string | null
        }
        Insert: {
          about?: string | null
          age?: number | null
          avatar_url?: string | null
          bio?: string | null
          cover_url?: string | null
          created_at?: string
          date_of_birth?: string | null
          disabled_at?: string | null
          disabled_by?: string | null
          disabled_reason?: string | null
          email: string
          email_verified?: boolean | null
          faculty?: string | null
          full_name: string
          gender?: Database["public"]["Enums"]["user_gender"] | null
          has_pets?: boolean | null
          hear_about_us?: string | null
          id?: string
          interested_area_1?: string | null
          interested_area_2?: string | null
          is_disabled?: boolean
          is_smoker?: boolean | null
          is_student_verified?: boolean | null
          job_title?: string | null
          looking_for?: string | null
          nationality?: string | null
          occupation?: string | null
          occupation_status?: string | null
          personality_tags?: string[] | null
          pet_type?: string | null
          phone?: string | null
          phone_verified?: boolean | null
          public_id?: string | null
          referral_code?: string | null
          referral_count?: number | null
          referred_by?: string | null
          university?: string | null
          updated_at?: string
          user_id: string
          verification_status?:
            | Database["public"]["Enums"]["verification_status"]
            | null
          whatsapp?: string | null
        }
        Update: {
          about?: string | null
          age?: number | null
          avatar_url?: string | null
          bio?: string | null
          cover_url?: string | null
          created_at?: string
          date_of_birth?: string | null
          disabled_at?: string | null
          disabled_by?: string | null
          disabled_reason?: string | null
          email?: string
          email_verified?: boolean | null
          faculty?: string | null
          full_name?: string
          gender?: Database["public"]["Enums"]["user_gender"] | null
          has_pets?: boolean | null
          hear_about_us?: string | null
          id?: string
          interested_area_1?: string | null
          interested_area_2?: string | null
          is_disabled?: boolean
          is_smoker?: boolean | null
          is_student_verified?: boolean | null
          job_title?: string | null
          looking_for?: string | null
          nationality?: string | null
          occupation?: string | null
          occupation_status?: string | null
          personality_tags?: string[] | null
          pet_type?: string | null
          phone?: string | null
          phone_verified?: boolean | null
          public_id?: string | null
          referral_code?: string | null
          referral_count?: number | null
          referred_by?: string | null
          university?: string | null
          updated_at?: string
          user_id?: string
          verification_status?:
            | Database["public"]["Enums"]["verification_status"]
            | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      rate_limits: {
        Row: {
          created_at: string
          endpoint: string
          id: string
          identifier: string
        }
        Insert: {
          created_at?: string
          endpoint: string
          id?: string
          identifier: string
        }
        Update: {
          created_at?: string
          endpoint?: string
          id?: string
          identifier?: string
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
      room_payout_info: {
        Row: {
          created_at: string
          id: string
          owner_id: string
          payout_details: string | null
          payout_method: string
          room_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          owner_id: string
          payout_details?: string | null
          payout_method?: string
          room_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          owner_id?: string
          payout_details?: string | null
          payout_method?: string
          room_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "room_payout_info_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: true
            referencedRelation: "public_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "room_payout_info_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: true
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      room_reviews: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          rating: number
          reviewer_id: string
          room_id: string
          updated_at: string
          viewing_request_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          rating: number
          reviewer_id: string
          room_id: string
          updated_at?: string
          viewing_request_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          rating?: number
          reviewer_id?: string
          room_id?: string
          updated_at?: string
          viewing_request_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "room_reviews_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "public_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "room_reviews_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "room_reviews_viewing_request_id_fkey"
            columns: ["viewing_request_id"]
            isOneToOne: true
            referencedRelation: "viewing_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      rooms: {
        Row: {
          address: string | null
          allowed_gender: string | null
          allows_pets: boolean | null
          allows_smoking: boolean | null
          allows_visits: boolean | null
          amenities: string[] | null
          area: string | null
          available_from: string
          bills_included: string[] | null
          city: string
          created_at: string
          current_roommates: number | null
          deposit: number | null
          description: string | null
          has_ac: boolean | null
          has_balcony: boolean | null
          has_doorman: boolean | null
          has_elevator: boolean | null
          has_natural_gas: boolean | null
          has_private_bathroom: boolean | null
          has_water_heater: boolean | null
          has_wifi: boolean | null
          id: string
          instant_book: boolean
          insurance_amount: number | null
          is_featured: boolean | null
          is_student_listing: boolean
          lister_type: string | null
          location_link: string | null
          max_roommates: number | null
          min_stay_months: number | null
          owner_id: string
          personality_tags: string[] | null
          photos: string[] | null
          preferred_gender: string | null
          price_negotiable: boolean
          price_per_month: number
          room_type: Database["public"]["Enums"]["room_type"]
          rules: string[] | null
          status: Database["public"]["Enums"]["listing_status"]
          title: string
          total_bedrooms: number | null
          updated_at: string
          videos: string[] | null
          views_count: number | null
        }
        Insert: {
          address?: string | null
          allowed_gender?: string | null
          allows_pets?: boolean | null
          allows_smoking?: boolean | null
          allows_visits?: boolean | null
          amenities?: string[] | null
          area?: string | null
          available_from?: string
          bills_included?: string[] | null
          city: string
          created_at?: string
          current_roommates?: number | null
          deposit?: number | null
          description?: string | null
          has_ac?: boolean | null
          has_balcony?: boolean | null
          has_doorman?: boolean | null
          has_elevator?: boolean | null
          has_natural_gas?: boolean | null
          has_private_bathroom?: boolean | null
          has_water_heater?: boolean | null
          has_wifi?: boolean | null
          id?: string
          instant_book?: boolean
          insurance_amount?: number | null
          is_featured?: boolean | null
          is_student_listing?: boolean
          lister_type?: string | null
          location_link?: string | null
          max_roommates?: number | null
          min_stay_months?: number | null
          owner_id: string
          personality_tags?: string[] | null
          photos?: string[] | null
          preferred_gender?: string | null
          price_negotiable?: boolean
          price_per_month: number
          room_type?: Database["public"]["Enums"]["room_type"]
          rules?: string[] | null
          status?: Database["public"]["Enums"]["listing_status"]
          title: string
          total_bedrooms?: number | null
          updated_at?: string
          videos?: string[] | null
          views_count?: number | null
        }
        Update: {
          address?: string | null
          allowed_gender?: string | null
          allows_pets?: boolean | null
          allows_smoking?: boolean | null
          allows_visits?: boolean | null
          amenities?: string[] | null
          area?: string | null
          available_from?: string
          bills_included?: string[] | null
          city?: string
          created_at?: string
          current_roommates?: number | null
          deposit?: number | null
          description?: string | null
          has_ac?: boolean | null
          has_balcony?: boolean | null
          has_doorman?: boolean | null
          has_elevator?: boolean | null
          has_natural_gas?: boolean | null
          has_private_bathroom?: boolean | null
          has_water_heater?: boolean | null
          has_wifi?: boolean | null
          id?: string
          instant_book?: boolean
          insurance_amount?: number | null
          is_featured?: boolean | null
          is_student_listing?: boolean
          lister_type?: string | null
          location_link?: string | null
          max_roommates?: number | null
          min_stay_months?: number | null
          owner_id?: string
          personality_tags?: string[] | null
          photos?: string[] | null
          preferred_gender?: string | null
          price_negotiable?: boolean
          price_per_month?: number
          room_type?: Database["public"]["Enums"]["room_type"]
          rules?: string[] | null
          status?: Database["public"]["Enums"]["listing_status"]
          title?: string
          total_bedrooms?: number | null
          updated_at?: string
          videos?: string[] | null
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
        ]
      }
      saved_searches: {
        Row: {
          created_at: string
          filters: Json
          id: string
          is_active: boolean
          label: string | null
          last_notified_at: string | null
          notify_email: boolean
          notify_in_app: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          filters?: Json
          id?: string
          is_active?: boolean
          label?: string | null
          last_notified_at?: string | null
          notify_email?: boolean
          notify_in_app?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          filters?: Json
          id?: string
          is_active?: boolean
          label?: string | null
          last_notified_at?: string | null
          notify_email?: boolean
          notify_in_app?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      search_notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          room_id: string
          saved_search_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          room_id: string
          saved_search_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          room_id?: string
          saved_search_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "search_notifications_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "public_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "search_notifications_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "search_notifications_saved_search_id_fkey"
            columns: ["saved_search_id"]
            isOneToOne: false
            referencedRelation: "saved_searches"
            referencedColumns: ["id"]
          },
        ]
      }
      site_ratings: {
        Row: {
          created_at: string
          id: string
          rating: number
          reason: string | null
          user_email: string | null
          user_id: string | null
          user_name: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          rating: number
          reason?: string | null
          user_email?: string | null
          user_id?: string | null
          user_name?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          rating?: number
          reason?: string | null
          user_email?: string | null
          user_id?: string | null
          user_name?: string | null
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          id: string
          is_public: boolean
          key: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          id?: string
          is_public?: boolean
          key: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Update: {
          id?: string
          is_public?: boolean
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      support_conversations: {
        Row: {
          created_at: string
          id: string
          last_message_at: string | null
          status: string
          subject: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_message_at?: string | null
          status?: string
          subject?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          last_message_at?: string | null
          status?: string
          subject?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      support_messages: {
        Row: {
          attachment_url: string | null
          content: string | null
          conversation_id: string
          created_at: string
          id: string
          is_admin: boolean
          read_at: string | null
          sender_id: string
        }
        Insert: {
          attachment_url?: string | null
          content?: string | null
          conversation_id: string
          created_at?: string
          id?: string
          is_admin?: boolean
          read_at?: string | null
          sender_id: string
        }
        Update: {
          attachment_url?: string | null
          content?: string | null
          conversation_id?: string
          created_at?: string
          id?: string
          is_admin?: boolean
          read_at?: string | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "support_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
        }
        Relationships: []
      }
      user_bans: {
        Row: {
          banned_by: string
          banned_until: string | null
          created_at: string
          id: string
          is_active: boolean | null
          is_permanent: boolean | null
          lifted_at: string | null
          lifted_by: string | null
          reason: string
          related_report_id: string | null
          user_id: string
        }
        Insert: {
          banned_by: string
          banned_until?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          is_permanent?: boolean | null
          lifted_at?: string | null
          lifted_by?: string | null
          reason: string
          related_report_id?: string | null
          user_id: string
        }
        Update: {
          banned_by?: string
          banned_until?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          is_permanent?: boolean | null
          lifted_at?: string | null
          lifted_by?: string | null
          reason?: string
          related_report_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_bans_related_report_id_fkey"
            columns: ["related_report_id"]
            isOneToOne: false
            referencedRelation: "decline_reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_bans_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
      user_warnings: {
        Row: {
          acknowledged: boolean | null
          acknowledged_at: string | null
          created_at: string
          id: string
          issued_by: string
          reason: string
          related_report_id: string | null
          user_id: string
        }
        Insert: {
          acknowledged?: boolean | null
          acknowledged_at?: string | null
          created_at?: string
          id?: string
          issued_by: string
          reason: string
          related_report_id?: string | null
          user_id: string
        }
        Update: {
          acknowledged?: boolean | null
          acknowledged_at?: string | null
          created_at?: string
          id?: string
          issued_by?: string
          reason?: string
          related_report_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_warnings_related_report_id_fkey"
            columns: ["related_report_id"]
            isOneToOne: false
            referencedRelation: "decline_reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_warnings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
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
        ]
      }
      viewing_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          read_at: string | null
          sender_id: string
          viewing_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          read_at?: string | null
          sender_id: string
          viewing_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          read_at?: string | null
          sender_id?: string
          viewing_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "viewing_messages_viewing_id_fkey"
            columns: ["viewing_id"]
            isOneToOne: false
            referencedRelation: "viewing_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      viewing_requests: {
        Row: {
          cancel_reason: string | null
          completed_at: string | null
          confirmed_at: string | null
          confirmed_date: string | null
          confirmed_time: string | null
          counter_proposed_date: string | null
          counter_proposed_time_end: string | null
          counter_proposed_time_start: string | null
          created_at: string
          id: string
          landlord_id: string
          landlord_rental_confirmed: boolean | null
          landlord_rental_confirmed_at: string | null
          landlord_response: string | null
          location_shared: boolean | null
          location_shared_at: string | null
          proposed_date: string
          proposed_time_end: string
          proposed_time_start: string
          room_id: string
          status: Database["public"]["Enums"]["viewing_status"]
          tenant_id: string
          tenant_message: string | null
          tenant_rental_confirmed: boolean | null
          tenant_rental_confirmed_at: string | null
          updated_at: string
        }
        Insert: {
          cancel_reason?: string | null
          completed_at?: string | null
          confirmed_at?: string | null
          confirmed_date?: string | null
          confirmed_time?: string | null
          counter_proposed_date?: string | null
          counter_proposed_time_end?: string | null
          counter_proposed_time_start?: string | null
          created_at?: string
          id?: string
          landlord_id: string
          landlord_rental_confirmed?: boolean | null
          landlord_rental_confirmed_at?: string | null
          landlord_response?: string | null
          location_shared?: boolean | null
          location_shared_at?: string | null
          proposed_date: string
          proposed_time_end: string
          proposed_time_start: string
          room_id: string
          status?: Database["public"]["Enums"]["viewing_status"]
          tenant_id: string
          tenant_message?: string | null
          tenant_rental_confirmed?: boolean | null
          tenant_rental_confirmed_at?: string | null
          updated_at?: string
        }
        Update: {
          cancel_reason?: string | null
          completed_at?: string | null
          confirmed_at?: string | null
          confirmed_date?: string | null
          confirmed_time?: string | null
          counter_proposed_date?: string | null
          counter_proposed_time_end?: string | null
          counter_proposed_time_start?: string | null
          created_at?: string
          id?: string
          landlord_id?: string
          landlord_rental_confirmed?: boolean | null
          landlord_rental_confirmed_at?: string | null
          landlord_response?: string | null
          location_shared?: boolean | null
          location_shared_at?: string | null
          proposed_date?: string
          proposed_time_end?: string
          proposed_time_start?: string
          room_id?: string
          status?: Database["public"]["Enums"]["viewing_status"]
          tenant_id?: string
          tenant_message?: string | null
          tenant_rental_confirmed?: boolean | null
          tenant_rental_confirmed_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "viewing_requests_landlord_id_fkey"
            columns: ["landlord_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "viewing_requests_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "public_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "viewing_requests_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "viewing_requests_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
    }
    Views: {
      public_profiles: {
        Row: {
          about: string | null
          age: number | null
          avatar_url: string | null
          created_at: string | null
          full_name: string | null
          gender: Database["public"]["Enums"]["user_gender"] | null
          has_pets: boolean | null
          is_smoker: boolean | null
          is_verified: boolean | null
          job_title: string | null
          looking_for: string | null
          nationality: string | null
          occupation: string | null
          personality_tags: string[] | null
          pet_type: string | null
          university: string | null
          user_id: string | null
        }
        Relationships: []
      }
      public_rooms: {
        Row: {
          allows_pets: boolean | null
          allows_smoking: boolean | null
          allows_visits: boolean | null
          amenities: string[] | null
          area: string | null
          available_from: string | null
          bills_included: string[] | null
          city: string | null
          created_at: string | null
          current_roommates: number | null
          deposit: number | null
          description: string | null
          has_ac: boolean | null
          has_balcony: boolean | null
          has_doorman: boolean | null
          has_elevator: boolean | null
          has_natural_gas: boolean | null
          has_water_heater: boolean | null
          has_wifi: boolean | null
          id: string | null
          is_featured: boolean | null
          is_student_listing: boolean | null
          lister_type: string | null
          location_link: string | null
          max_roommates: number | null
          min_stay_months: number | null
          personality_tags: string[] | null
          photos: string[] | null
          preferred_gender: string | null
          price_per_month: number | null
          room_type: Database["public"]["Enums"]["room_type"] | null
          rules: string[] | null
          status: Database["public"]["Enums"]["listing_status"] | null
          title: string | null
          total_bedrooms: number | null
          updated_at: string | null
          videos: string[] | null
        }
        Insert: {
          allows_pets?: boolean | null
          allows_smoking?: boolean | null
          allows_visits?: boolean | null
          amenities?: string[] | null
          area?: string | null
          available_from?: string | null
          bills_included?: string[] | null
          city?: string | null
          created_at?: string | null
          current_roommates?: number | null
          deposit?: number | null
          description?: string | null
          has_ac?: boolean | null
          has_balcony?: boolean | null
          has_doorman?: boolean | null
          has_elevator?: boolean | null
          has_natural_gas?: boolean | null
          has_water_heater?: boolean | null
          has_wifi?: boolean | null
          id?: string | null
          is_featured?: boolean | null
          is_student_listing?: boolean | null
          lister_type?: string | null
          location_link?: string | null
          max_roommates?: number | null
          min_stay_months?: number | null
          personality_tags?: string[] | null
          photos?: string[] | null
          preferred_gender?: string | null
          price_per_month?: number | null
          room_type?: Database["public"]["Enums"]["room_type"] | null
          rules?: string[] | null
          status?: Database["public"]["Enums"]["listing_status"] | null
          title?: string | null
          total_bedrooms?: number | null
          updated_at?: string | null
          videos?: string[] | null
        }
        Update: {
          allows_pets?: boolean | null
          allows_smoking?: boolean | null
          allows_visits?: boolean | null
          amenities?: string[] | null
          area?: string | null
          available_from?: string | null
          bills_included?: string[] | null
          city?: string | null
          created_at?: string | null
          current_roommates?: number | null
          deposit?: number | null
          description?: string | null
          has_ac?: boolean | null
          has_balcony?: boolean | null
          has_doorman?: boolean | null
          has_elevator?: boolean | null
          has_natural_gas?: boolean | null
          has_water_heater?: boolean | null
          has_wifi?: boolean | null
          id?: string | null
          is_featured?: boolean | null
          is_student_listing?: boolean | null
          lister_type?: string | null
          location_link?: string | null
          max_roommates?: number | null
          min_stay_months?: number | null
          personality_tags?: string[] | null
          photos?: string[] | null
          preferred_gender?: string | null
          price_per_month?: number | null
          room_type?: Database["public"]["Enums"]["room_type"] | null
          rules?: string[] | null
          status?: Database["public"]["Enums"]["listing_status"] | null
          title?: string | null
          total_bedrooms?: number | null
          updated_at?: string | null
          videos?: string[] | null
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
      current_user_email: { Args: never; Returns: string }
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      generate_public_id: { Args: never; Returns: string }
      generate_referral_code: { Args: { p_full_name: string }; Returns: string }
      get_accessible_public_profiles: {
        Args: never
        Returns: {
          about: string
          age: number
          avatar_url: string
          created_at: string
          full_name: string
          gender: Database["public"]["Enums"]["user_gender"]
          has_pets: boolean
          is_smoker: boolean
          is_verified: boolean
          job_title: string
          looking_for: string
          nationality: string
          occupation: string
          personality_tags: string[]
          pet_type: string
          university: string
          user_id: string
        }[]
      }
      get_browsable_roommate: {
        Args: { _roommate_user_id: string }
        Returns: {
          about: string
          avatar_url: string
          created_at: string
          full_name: string
          gender: string
          has_pets: boolean
          is_smoker: boolean
          looking_for: string
          nationality: string
          occupation: string
          pet_type: string
          user_id: string
          verification_status: string
        }[]
      }
      get_browsable_roommates: {
        Args: {
          _has_pets?: boolean
          _is_smoker?: boolean
          _occupation?: string
          _search_query?: string
        }
        Returns: {
          about: string
          avatar_url: string
          created_at: string
          full_name: string
          gender: string
          has_pets: boolean
          is_smoker: boolean
          looking_for: string
          nationality: string
          occupation: string
          pet_type: string
          user_id: string
          verification_status: string
        }[]
      }
      get_confirmed_reservation_partner_contact: {
        Args: { _partner_id: string }
        Returns: {
          avatar_url: string
          email: string
          full_name: string
          phone: string
          user_id: string
          whatsapp: string
        }[]
      }
      get_public_rooms: {
        Args: never
        Returns: {
          allows_pets: boolean
          allows_smoking: boolean
          allows_visits: boolean
          amenities: string[]
          area: string
          available_from: string
          bills_included: string[]
          city: string
          created_at: string
          current_roommates: number
          deposit: number
          description: string
          has_ac: boolean
          has_balcony: boolean
          has_doorman: boolean
          has_elevator: boolean
          has_natural_gas: boolean
          has_water_heater: boolean
          has_wifi: boolean
          id: string
          is_featured: boolean
          is_student_listing: boolean
          lister_type: string
          location_link: string
          max_roommates: number
          min_stay_months: number
          personality_tags: string[]
          photos: string[]
          preferred_gender: string
          price_per_month: number
          room_type: Database["public"]["Enums"]["room_type"]
          rules: string[]
          status: Database["public"]["Enums"]["listing_status"]
          title: string
          total_bedrooms: number
          updated_at: string
        }[]
      }
      get_referral_stats: {
        Args: never
        Returns: {
          full_name: string
          referral_code: string
          total_signups: number
          user_id: string
          verified_signups: number
        }[]
      }
      get_room_details: {
        Args: { _room_id: string }
        Returns: {
          address: string | null
          allowed_gender: string | null
          allows_pets: boolean | null
          allows_smoking: boolean | null
          allows_visits: boolean | null
          amenities: string[] | null
          area: string | null
          available_from: string
          bills_included: string[] | null
          city: string
          created_at: string
          current_roommates: number | null
          deposit: number | null
          description: string | null
          has_ac: boolean | null
          has_balcony: boolean | null
          has_doorman: boolean | null
          has_elevator: boolean | null
          has_natural_gas: boolean | null
          has_private_bathroom: boolean | null
          has_water_heater: boolean | null
          has_wifi: boolean | null
          id: string
          instant_book: boolean
          insurance_amount: number | null
          is_featured: boolean | null
          is_student_listing: boolean
          lister_type: string | null
          location_link: string | null
          max_roommates: number | null
          min_stay_months: number | null
          owner_id: string
          personality_tags: string[] | null
          photos: string[] | null
          preferred_gender: string | null
          price_negotiable: boolean
          price_per_month: number
          room_type: Database["public"]["Enums"]["room_type"]
          rules: string[] | null
          status: Database["public"]["Enums"]["listing_status"]
          title: string
          total_bedrooms: number | null
          updated_at: string
          videos: string[] | null
          views_count: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "rooms"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_room_owner_public_info: {
        Args: { _owner_id: string }
        Returns: {
          about: string
          age: number
          avatar_url: string
          faculty: string
          full_name: string
          gender: Database["public"]["Enums"]["user_gender"]
          has_pets: boolean
          interested_area_1: string
          interested_area_2: string
          is_smoker: boolean
          is_verified: boolean
          job_title: string
          looking_for: string
          nationality: string
          occupation: string
          personality_tags: string[]
          pet_type: string
          university: string
          user_id: string
        }[]
      }
      get_room_viewing_count: { Args: { _room_id: string }; Returns: number }
      get_verified_host_room_ids: {
        Args: never
        Returns: {
          room_id: string
        }[]
      }
      get_viewing_participant_profile: {
        Args: { _participant_id: string }
        Returns: {
          age: number
          avatar_url: string
          full_name: string
          has_pets: boolean
          is_smoker: boolean
          job_title: string
          nationality: string
          occupation: string
          occupation_status: string
          personality_tags: string[]
          university: string
          user_id: string
          verification_status: string
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
      is_user_banned: { Args: { check_user_id: string }; Returns: boolean }
      is_user_disabled: { Args: { check_user_id: string }; Returns: boolean }
      is_user_verified: { Args: { check_user_id: string }; Returns: boolean }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
      }
      validate_referral_code: { Args: { p_code: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      decline_reason:
        | "different_than_photos"
        | "location_issues"
        | "price_too_high"
        | "found_better_option"
        | "broker_illegal_fees"
        | "safety_concerns"
        | "other"
      listing_status: "draft" | "active" | "rented" | "expired"
      occupation_status: "student" | "working" | "unemployed"
      room_type: "private_room" | "shared_room" | "studio" | "apartment"
      user_gender: "male" | "female"
      verification_status: "unverified" | "pending" | "verified" | "rejected"
      viewing_status:
        | "pending"
        | "counter_proposed"
        | "confirmed"
        | "completed"
        | "rental_confirmed"
        | "declined"
        | "cancelled"
        | "expired"
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
      decline_reason: [
        "different_than_photos",
        "location_issues",
        "price_too_high",
        "found_better_option",
        "broker_illegal_fees",
        "safety_concerns",
        "other",
      ],
      listing_status: ["draft", "active", "rented", "expired"],
      occupation_status: ["student", "working", "unemployed"],
      room_type: ["private_room", "shared_room", "studio", "apartment"],
      user_gender: ["male", "female"],
      verification_status: ["unverified", "pending", "verified", "rejected"],
      viewing_status: [
        "pending",
        "counter_proposed",
        "confirmed",
        "completed",
        "rental_confirmed",
        "declined",
        "cancelled",
        "expired",
      ],
    },
  },
} as const
