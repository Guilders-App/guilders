export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      account: {
        Row: {
          cost: number | null
          created_at: string
          currency: string
          documents: string[] | null
          id: number
          image: string | null
          institution_connection_id: number | null
          investable: Database["public"]["Enums"]["investable"]
          name: string
          notes: string
          parent: number | null
          provider_account_id: string | null
          subtype: Database["public"]["Enums"]["account_subtype"]
          tax_rate: number | null
          taxability: Database["public"]["Enums"]["taxability"]
          ticker: string | null
          type: Database["public"]["Enums"]["account_type"]
          units: number | null
          updated_at: string
          user_id: string
          value: number
        }
        Insert: {
          cost?: number | null
          created_at?: string
          currency: string
          documents?: string[] | null
          id?: number
          image?: string | null
          institution_connection_id?: number | null
          investable?: Database["public"]["Enums"]["investable"]
          name: string
          notes?: string
          parent?: number | null
          provider_account_id?: string | null
          subtype: Database["public"]["Enums"]["account_subtype"]
          tax_rate?: number | null
          taxability?: Database["public"]["Enums"]["taxability"]
          ticker?: string | null
          type: Database["public"]["Enums"]["account_type"]
          units?: number | null
          updated_at?: string
          user_id: string
          value: number
        }
        Update: {
          cost?: number | null
          created_at?: string
          currency?: string
          documents?: string[] | null
          id?: number
          image?: string | null
          institution_connection_id?: number | null
          investable?: Database["public"]["Enums"]["investable"]
          name?: string
          notes?: string
          parent?: number | null
          provider_account_id?: string | null
          subtype?: Database["public"]["Enums"]["account_subtype"]
          tax_rate?: number | null
          taxability?: Database["public"]["Enums"]["taxability"]
          ticker?: string | null
          type?: Database["public"]["Enums"]["account_type"]
          units?: number | null
          updated_at?: string
          user_id?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "account_currency_fkey"
            columns: ["currency"]
            isOneToOne: false
            referencedRelation: "currency"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "account_institution_connection_id_fkey"
            columns: ["institution_connection_id"]
            isOneToOne: false
            referencedRelation: "institution_connection"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "account_parent_fkey"
            columns: ["parent"]
            isOneToOne: false
            referencedRelation: "account"
            referencedColumns: ["id"]
          },
        ]
      }
      country: {
        Row: {
          code: string
          name: string
        }
        Insert: {
          code: string
          name: string
        }
        Update: {
          code?: string
          name?: string
        }
        Relationships: []
      }
      currency: {
        Row: {
          code: string
          country: string
          name: string
        }
        Insert: {
          code: string
          country: string
          name: string
        }
        Update: {
          code?: string
          country?: string
          name?: string
        }
        Relationships: []
      }
      document: {
        Row: {
          created_at: string
          entity_id: number
          entity_type: Database["public"]["Enums"]["document_entity_type"]
          id: number
          name: string
          path: string
          size: number
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          entity_id: number
          entity_type: Database["public"]["Enums"]["document_entity_type"]
          id?: number
          name: string
          path: string
          size: number
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          entity_id?: number
          entity_type?: Database["public"]["Enums"]["document_entity_type"]
          id?: number
          name?: string
          path?: string
          size?: number
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      institution: {
        Row: {
          country: string | null
          enabled: boolean
          id: number
          logo_url: string
          name: string
          provider_id: number
          provider_institution_id: string
        }
        Insert: {
          country?: string | null
          enabled?: boolean
          id?: number
          logo_url: string
          name: string
          provider_id: number
          provider_institution_id: string
        }
        Update: {
          country?: string | null
          enabled?: boolean
          id?: number
          logo_url?: string
          name?: string
          provider_id?: number
          provider_institution_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "institution_country_fkey"
            columns: ["country"]
            isOneToOne: false
            referencedRelation: "country"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "institution_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "provider"
            referencedColumns: ["id"]
          },
        ]
      }
      institution_connection: {
        Row: {
          broken: boolean
          connection_id: string | null
          created_at: string
          id: number
          institution_id: number
          provider_connection_id: number
        }
        Insert: {
          broken?: boolean
          connection_id?: string | null
          created_at?: string
          id?: number
          institution_id: number
          provider_connection_id: number
        }
        Update: {
          broken?: boolean
          connection_id?: string | null
          created_at?: string
          id?: number
          institution_id?: number
          provider_connection_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "institution_connection_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institution"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "institution_connection_provider_connection_id_fkey"
            columns: ["provider_connection_id"]
            isOneToOne: false
            referencedRelation: "provider_connection"
            referencedColumns: ["id"]
          },
        ]
      }
      provider: {
        Row: {
          id: number
          logo_url: string
          name: string
        }
        Insert: {
          id?: number
          logo_url: string
          name: string
        }
        Update: {
          id?: number
          logo_url?: string
          name?: string
        }
        Relationships: []
      }
      provider_connection: {
        Row: {
          created_at: string
          id: number
          provider_id: number
          secret: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: number
          provider_id: number
          secret?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: number
          provider_id?: number
          secret?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "connection_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "provider"
            referencedColumns: ["id"]
          },
        ]
      }
      rate: {
        Row: {
          currency_code: string
          rate: number
        }
        Insert: {
          currency_code: string
          rate: number
        }
        Update: {
          currency_code?: string
          rate?: number
        }
        Relationships: [
          {
            foreignKeyName: "rates_currency_fkey"
            columns: ["currency_code"]
            isOneToOne: true
            referencedRelation: "currency"
            referencedColumns: ["code"]
          },
        ]
      }
      subscription: {
        Row: {
          cancel_at: string | null
          cancel_at_period_end: boolean | null
          canceled_at: string | null
          created_at: string
          current_period_end: string
          current_period_start: string
          ended_at: string | null
          id: number
          status: Database["public"]["Enums"]["subscription_status"] | null
          stripe_customer_id: string
          trial_end: string | null
          trial_start: string | null
          user_id: string
        }
        Insert: {
          cancel_at?: string | null
          cancel_at_period_end?: boolean | null
          canceled_at?: string | null
          created_at?: string
          current_period_end?: string
          current_period_start?: string
          ended_at?: string | null
          id?: number
          status?: Database["public"]["Enums"]["subscription_status"] | null
          stripe_customer_id: string
          trial_end?: string | null
          trial_start?: string | null
          user_id: string
        }
        Update: {
          cancel_at?: string | null
          cancel_at_period_end?: boolean | null
          canceled_at?: string | null
          created_at?: string
          current_period_end?: string
          current_period_start?: string
          ended_at?: string | null
          id?: number
          status?: Database["public"]["Enums"]["subscription_status"] | null
          stripe_customer_id?: string
          trial_end?: string | null
          trial_start?: string | null
          user_id?: string
        }
        Relationships: []
      }
      transaction: {
        Row: {
          account_id: number
          amount: number
          category: string
          created_at: string
          currency: string
          date: string
          description: string
          documents: string[] | null
          id: number
          provider_transaction_id: string | null
          updated_at: string
        }
        Insert: {
          account_id: number
          amount: number
          category?: string
          created_at?: string
          currency: string
          date: string
          description: string
          documents?: string[] | null
          id?: number
          provider_transaction_id?: string | null
          updated_at?: string
        }
        Update: {
          account_id?: number
          amount?: number
          category?: string
          created_at?: string
          currency?: string
          date?: string
          description?: string
          documents?: string[] | null
          id?: number
          provider_transaction_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "transaction_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "account"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transaction_currency_fkey"
            columns: ["currency"]
            isOneToOne: false
            referencedRelation: "currency"
            referencedColumns: ["code"]
          },
        ]
      }
      transaction_category: {
        Row: {
          display_name: string
          emoji: string
          id: number
          name: string
        }
        Insert: {
          display_name: string
          emoji: string
          id?: number
          name: string
        }
        Update: {
          display_name?: string
          emoji?: string
          id?: number
          name?: string
        }
        Relationships: []
      }
      user_setting: {
        Row: {
          api_key: string | null
          currency: string
          profile_url: string | null
          user_id: string
        }
        Insert: {
          api_key?: string | null
          currency?: string
          profile_url?: string | null
          user_id: string
        }
        Update: {
          api_key?: string | null
          currency?: string
          profile_url?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_settings_currency_fkey"
            columns: ["currency"]
            isOneToOne: false
            referencedRelation: "currency"
            referencedColumns: ["code"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_mfa: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      account_subtype:
        | "depository"
        | "brokerage"
        | "crypto"
        | "property"
        | "vehicle"
        | "creditcard"
        | "loan"
        | "stock"
      account_type: "asset" | "liability"
      document_entity_type: "account" | "transaction"
      investable:
        | "non_investable"
        | "investable_easy_convert"
        | "investable_cash"
      subscription_status:
        | "unsubscribed"
        | "trialing"
        | "active"
        | "canceled"
        | "incomplete"
        | "incomplete_expired"
        | "past_due"
        | "unpaid"
        | "paused"
      taxability: "taxable" | "tax_free" | "tax_deferred"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      account_subtype: [
        "depository",
        "brokerage",
        "crypto",
        "property",
        "vehicle",
        "creditcard",
        "loan",
        "stock",
      ],
      account_type: ["asset", "liability"],
      document_entity_type: ["account", "transaction"],
      investable: [
        "non_investable",
        "investable_easy_convert",
        "investable_cash",
      ],
      subscription_status: [
        "unsubscribed",
        "trialing",
        "active",
        "canceled",
        "incomplete",
        "incomplete_expired",
        "past_due",
        "unpaid",
        "paused",
      ],
      taxability: ["taxable", "tax_free", "tax_deferred"],
    },
  },
} as const
