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
          connection_id: number | null
          cost: number | null
          created_at: string
          currency: string
          description: string
          id: number
          investable: Database["public"]["Enums"]["investable"]
          name: string
          notes: string
          parent: number | null
          quantity: number | null
          subtype: Database["public"]["Enums"]["account_subtype"]
          tax_rate: number | null
          taxability: Database["public"]["Enums"]["taxability"]
          ticker: string | null
          type: Database["public"]["Enums"]["account_type"]
          updated_at: string
          user_id: string
          value: number
        }
        Insert: {
          connection_id?: number | null
          cost?: number | null
          created_at?: string
          currency: string
          description?: string
          id?: number
          investable?: Database["public"]["Enums"]["investable"]
          name: string
          notes?: string
          parent?: number | null
          quantity?: number | null
          subtype: Database["public"]["Enums"]["account_subtype"]
          tax_rate?: number | null
          taxability?: Database["public"]["Enums"]["taxability"]
          ticker?: string | null
          type: Database["public"]["Enums"]["account_type"]
          updated_at?: string
          user_id: string
          value: number
        }
        Update: {
          connection_id?: number | null
          cost?: number | null
          created_at?: string
          currency?: string
          description?: string
          id?: number
          investable?: Database["public"]["Enums"]["investable"]
          name?: string
          notes?: string
          parent?: number | null
          quantity?: number | null
          subtype?: Database["public"]["Enums"]["account_subtype"]
          tax_rate?: number | null
          taxability?: Database["public"]["Enums"]["taxability"]
          ticker?: string | null
          type?: Database["public"]["Enums"]["account_type"]
          updated_at?: string
          user_id?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "account_parent_fkey"
            columns: ["parent"]
            isOneToOne: false
            referencedRelation: "account"
            referencedColumns: ["id"]
          },
        ]
      }
      account_history: {
        Row: {
          account_id: number
          connection_id: number | null
          cost: number | null
          created_at: string
          currency: string
          description: string
          id: number
          investable: Database["public"]["Enums"]["investable"]
          name: string
          notes: string
          parent: number | null
          quantity: number | null
          subtype: Database["public"]["Enums"]["account_subtype"]
          tax_rate: number | null
          taxability: Database["public"]["Enums"]["taxability"]
          ticker: string | null
          type: Database["public"]["Enums"]["account_type"]
          updated_at: string
          user_id: string
          value: number
        }
        Insert: {
          account_id: number
          connection_id?: number | null
          cost?: number | null
          created_at?: string
          currency: string
          description?: string
          id?: number
          investable?: Database["public"]["Enums"]["investable"]
          name: string
          notes?: string
          parent?: number | null
          quantity?: number | null
          subtype: Database["public"]["Enums"]["account_subtype"]
          tax_rate?: number | null
          taxability?: Database["public"]["Enums"]["taxability"]
          ticker?: string | null
          type: Database["public"]["Enums"]["account_type"]
          updated_at: string
          user_id: string
          value: number
        }
        Update: {
          account_id?: number
          connection_id?: number | null
          cost?: number | null
          created_at?: string
          currency?: string
          description?: string
          id?: number
          investable?: Database["public"]["Enums"]["investable"]
          name?: string
          notes?: string
          parent?: number | null
          quantity?: number | null
          subtype?: Database["public"]["Enums"]["account_subtype"]
          tax_rate?: number | null
          taxability?: Database["public"]["Enums"]["taxability"]
          ticker?: string | null
          type?: Database["public"]["Enums"]["account_type"]
          updated_at?: string
          user_id?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "account_history_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "account"
            referencedColumns: ["id"]
          },
        ]
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
          account_id: number
          created_at: string
          id: number
          name: string
          size: number
        }
        Insert: {
          account_id: number
          created_at?: string
          id?: number
          name: string
          size: number
        }
        Update: {
          account_id?: number
          created_at?: string
          id?: number
          name?: string
          size?: number
        }
        Relationships: [
          {
            foreignKeyName: "document_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "account"
            referencedColumns: ["id"]
          },
        ]
      }
      institution: {
        Row: {
          countries: string[] | null
          enabled: boolean
          institution_id: string
          logo_url: string
          name: string
          provider_id: number
        }
        Insert: {
          countries?: string[] | null
          enabled?: boolean
          institution_id: string
          logo_url: string
          name: string
          provider_id: number
        }
        Update: {
          countries?: string[] | null
          enabled?: boolean
          institution_id?: string
          logo_url?: string
          name?: string
          provider_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "institution_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "provider"
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
          provider_id: number
          secret: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          provider_id: number
          secret?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
      account_type: "asset" | "liability"
      investable:
        | "non_investable"
        | "investable_easy_convert"
        | "investable_cash"
      taxability: "taxable" | "tax_free" | "tax_deferred"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
