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
      audit_log: {
        Row: {
          action: string
          changes: Json
          created_at: string
          id: string
          record_id: string | null
          table_name: string
          user_email: string
          user_id: string | null
          workspace_id: string
        }
        Insert: {
          action: string
          changes?: Json
          created_at?: string
          id?: string
          record_id?: string | null
          table_name: string
          user_email?: string
          user_id?: string | null
          workspace_id: string
        }
        Update: {
          action?: string
          changes?: Json
          created_at?: string
          id?: string
          record_id?: string | null
          table_name?: string
          user_email?: string
          user_id?: string | null
          workspace_id?: string
        }
        Relationships: []
      }
      bank_accounts: {
        Row: {
          account_number: string
          agency: string
          bank: string
          created_at: string
          id: string
          name: string
          opening_balance: number
          owner_id: string
          pix_key: string
        }
        Insert: {
          account_number?: string
          agency?: string
          bank?: string
          created_at?: string
          id?: string
          name: string
          opening_balance?: number
          owner_id?: string
          pix_key?: string
        }
        Update: {
          account_number?: string
          agency?: string
          bank?: string
          created_at?: string
          id?: string
          name?: string
          opening_balance?: number
          owner_id?: string
          pix_key?: string
        }
        Relationships: []
      }
      clients: {
        Row: {
          address_number: string
          city: string
          complement: string
          created_at: string
          document: string
          email: string
          id: string
          name: string
          neighborhood: string
          notes: string
          owner_id: string
          person_type: string
          phone: string
          postal_code: string
          state: string
          street: string
        }
        Insert: {
          address_number?: string
          city?: string
          complement?: string
          created_at?: string
          document?: string
          email?: string
          id?: string
          name: string
          neighborhood?: string
          notes?: string
          owner_id?: string
          person_type?: string
          phone?: string
          postal_code?: string
          state?: string
          street?: string
        }
        Update: {
          address_number?: string
          city?: string
          complement?: string
          created_at?: string
          document?: string
          email?: string
          id?: string
          name?: string
          neighborhood?: string
          notes?: string
          owner_id?: string
          person_type?: string
          phone?: string
          postal_code?: string
          state?: string
          street?: string
        }
        Relationships: []
      }
      financial_entries: {
        Row: {
          amount: number
          bank_account_id: string | null
          category: string
          created_at: string
          description: string
          due_date: string
          id: string
          kind: string
          order_id: string | null
          owner_id: string
          paid_date: string | null
          payment_method: string
        }
        Insert: {
          amount: number
          bank_account_id?: string | null
          category?: string
          created_at?: string
          description: string
          due_date: string
          id?: string
          kind: string
          order_id?: string | null
          owner_id?: string
          paid_date?: string | null
          payment_method?: string
        }
        Update: {
          amount?: number
          bank_account_id?: string | null
          category?: string
          created_at?: string
          description?: string
          due_date?: string
          id?: string
          kind?: string
          order_id?: string | null
          owner_id?: string
          paid_date?: string | null
          payment_method?: string
        }
        Relationships: [
          {
            foreignKeyName: "financial_entries_bank_account_id_fkey"
            columns: ["bank_account_id"]
            isOneToOne: false
            referencedRelation: "bank_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_entries_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "service_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      service_orders: {
        Row: {
          amount: number
          client_id: string | null
          client_name: string
          created_at: string
          diagnosis: string
          due_date: string | null
          equipment: string
          id: string
          number: number
          owner_id: string
          problem: string
          status: string
          technician: string
        }
        Insert: {
          amount?: number
          client_id?: string | null
          client_name: string
          created_at?: string
          diagnosis?: string
          due_date?: string | null
          equipment: string
          id?: string
          number?: never
          owner_id?: string
          problem?: string
          status?: string
          technician?: string
        }
        Update: {
          amount?: number
          client_id?: string | null
          client_name?: string
          created_at?: string
          diagnosis?: string
          due_date?: string | null
          equipment?: string
          id?: string
          number?: never
          owner_id?: string
          problem?: string
          status?: string
          technician?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_orders_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          active: boolean
          created_at: string
          email: string
          id: string
          name: string
          role: string
          user_id: string | null
          workspace_id: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          email: string
          id?: string
          name: string
          role: string
          user_id?: string | null
          workspace_id?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          email?: string
          id?: string
          name?: string
          role?: string
          user_id?: string | null
          workspace_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      link_membership: { Args: never; Returns: undefined }
      my_membership: {
        Args: never
        Returns: {
          active: boolean
          created_at: string
          email: string
          id: string
          name: string
          role: string
          user_id: string | null
          workspace_id: string
        }
        SetofOptions: {
          from: "*"
          to: "team_members"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      my_role: { Args: never; Returns: string }
      my_workspace: { Args: never; Returns: string }
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
    Enums: {},
  },
} as const
