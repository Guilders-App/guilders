export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          operationName?: string;
          query?: string;
          variables?: Json;
          extensions?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      account: {
        Row: {
          cost: number | null;
          created_at: string;
          currency: string;
          id: number;
          image: string | null;
          institution_connection_id: number | null;
          investable: Database["public"]["Enums"]["investable"];
          name: string;
          notes: string;
          parent: number | null;
          provider_account_id: string | null;
          subtype: Database["public"]["Enums"]["account_subtype"];
          tax_rate: number | null;
          taxability: Database["public"]["Enums"]["taxability"];
          ticker: string | null;
          type: Database["public"]["Enums"]["account_type"];
          units: number | null;
          updated_at: string;
          user_id: string;
          value: number;
        };
        Insert: {
          cost?: number | null;
          created_at?: string;
          currency: string;
          id?: number;
          image?: string | null;
          institution_connection_id?: number | null;
          investable?: Database["public"]["Enums"]["investable"];
          name: string;
          notes?: string;
          parent?: number | null;
          provider_account_id?: string | null;
          subtype: Database["public"]["Enums"]["account_subtype"];
          tax_rate?: number | null;
          taxability?: Database["public"]["Enums"]["taxability"];
          ticker?: string | null;
          type: Database["public"]["Enums"]["account_type"];
          units?: number | null;
          updated_at?: string;
          user_id: string;
          value: number;
        };
        Update: {
          cost?: number | null;
          created_at?: string;
          currency?: string;
          id?: number;
          image?: string | null;
          institution_connection_id?: number | null;
          investable?: Database["public"]["Enums"]["investable"];
          name?: string;
          notes?: string;
          parent?: number | null;
          provider_account_id?: string | null;
          subtype?: Database["public"]["Enums"]["account_subtype"];
          tax_rate?: number | null;
          taxability?: Database["public"]["Enums"]["taxability"];
          ticker?: string | null;
          type?: Database["public"]["Enums"]["account_type"];
          units?: number | null;
          updated_at?: string;
          user_id?: string;
          value?: number;
        };
        Relationships: [
          {
            foreignKeyName: "account_currency_fkey";
            columns: ["currency"];
            isOneToOne: false;
            referencedRelation: "currency";
            referencedColumns: ["code"];
          },
          {
            foreignKeyName: "account_institution_connection_id_fkey";
            columns: ["institution_connection_id"];
            isOneToOne: false;
            referencedRelation: "institution_connection";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "account_parent_fkey";
            columns: ["parent"];
            isOneToOne: false;
            referencedRelation: "account";
            referencedColumns: ["id"];
          },
        ];
      };
      currency: {
        Row: {
          code: string;
          country: string;
          name: string;
        };
        Insert: {
          code: string;
          country: string;
          name: string;
        };
        Update: {
          code?: string;
          country?: string;
          name?: string;
        };
        Relationships: [];
      };
      institution: {
        Row: {
          countries: string[] | null;
          demo: boolean;
          enabled: boolean;
          id: number;
          logo_url: string;
          name: string;
          provider_id: number;
          provider_institution_id: string;
        };
        Insert: {
          countries?: string[] | null;
          demo?: boolean;
          enabled?: boolean;
          id?: number;
          logo_url: string;
          name: string;
          provider_id: number;
          provider_institution_id: string;
        };
        Update: {
          countries?: string[] | null;
          demo?: boolean;
          enabled?: boolean;
          id?: number;
          logo_url?: string;
          name?: string;
          provider_id?: number;
          provider_institution_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "institution_provider_id_fkey";
            columns: ["provider_id"];
            isOneToOne: false;
            referencedRelation: "provider";
            referencedColumns: ["id"];
          },
        ];
      };
      institution_connection: {
        Row: {
          broken: boolean;
          connection_id: string | null;
          created_at: string;
          id: number;
          institution_id: number;
          provider_connection_id: number | null;
        };
        Insert: {
          broken?: boolean;
          connection_id?: string | null;
          created_at?: string;
          id?: number;
          institution_id: number;
          provider_connection_id?: number | null;
        };
        Update: {
          broken?: boolean;
          connection_id?: string | null;
          created_at?: string;
          id?: number;
          institution_id?: number;
          provider_connection_id?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "institution_connection_institution_id_fkey";
            columns: ["institution_id"];
            isOneToOne: false;
            referencedRelation: "institution";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "institution_connection_provider_connection_id_fkey";
            columns: ["provider_connection_id"];
            isOneToOne: false;
            referencedRelation: "provider_connection";
            referencedColumns: ["id"];
          },
        ];
      };
      provider: {
        Row: {
          id: number;
          logo_url: string;
          name: string;
        };
        Insert: {
          id?: number;
          logo_url: string;
          name: string;
        };
        Update: {
          id?: number;
          logo_url?: string;
          name?: string;
        };
        Relationships: [];
      };
      provider_connection: {
        Row: {
          created_at: string;
          id: number;
          provider_id: number;
          secret: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: number;
          provider_id: number;
          secret?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: number;
          provider_id?: number;
          secret?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "connection_provider_id_fkey";
            columns: ["provider_id"];
            isOneToOne: false;
            referencedRelation: "provider";
            referencedColumns: ["id"];
          },
        ];
      };
      transaction: {
        Row: {
          account_id: number;
          amount: number;
          category: string;
          currency: string;
          date: string;
          description: string;
          id: number;
          provider_transaction_id: string | null;
        };
        Insert: {
          account_id: number;
          amount: number;
          category?: string;
          currency: string;
          date: string;
          description: string;
          id?: number;
          provider_transaction_id?: string | null;
        };
        Update: {
          account_id?: number;
          amount?: number;
          category?: string;
          currency?: string;
          date?: string;
          description?: string;
          id?: number;
          provider_transaction_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "transaction_account_id_fkey";
            columns: ["account_id"];
            isOneToOne: false;
            referencedRelation: "account";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "transaction_currency_fkey";
            columns: ["currency"];
            isOneToOne: false;
            referencedRelation: "currency";
            referencedColumns: ["code"];
          },
        ];
      };
      user_settings: {
        Row: {
          api_key: string | null;
          currency: string;
          user_id: string;
        };
        Insert: {
          api_key?: string | null;
          currency?: string;
          user_id: string;
        };
        Update: {
          api_key?: string | null;
          currency?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_settings_currency_fkey";
            columns: ["currency"];
            isOneToOne: false;
            referencedRelation: "currency";
            referencedColumns: ["code"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      account_subtype:
        | "depository"
        | "brokerage"
        | "crypto"
        | "property"
        | "vehicle"
        | "creditcard"
        | "loan"
        | "stock";
      account_type: "asset" | "liability";
      investable:
        | "non_investable"
        | "investable_easy_convert"
        | "investable_cash";
      taxability: "taxable" | "tax_free" | "tax_deferred";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type PublicSchema = Database[Extract<keyof Database, "public">];

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
      Row: infer R;
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

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
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;
