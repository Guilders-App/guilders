export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      account: {
        Row: {
          account_id: string;
          connection: number | null;
          cost: number | null;
          created_at: string;
          currency: string;
          description: string;
          id: number;
          investable: Database["public"]["Enums"]["investable"];
          name: string;
          notes: string;
          parent: number | null;
          quantity: number | null;
          subtype: Database["public"]["Enums"]["account_subtype"];
          tax_rate: number | null;
          taxability: Database["public"]["Enums"]["taxability"];
          ticker: string | null;
          type: Database["public"]["Enums"]["account_type"];
          value: number;
        };
        Insert: {
          account_id: string;
          connection?: number | null;
          cost?: number | null;
          created_at?: string;
          currency: string;
          description?: string;
          id?: number;
          investable?: Database["public"]["Enums"]["investable"];
          name: string;
          notes?: string;
          parent?: number | null;
          quantity?: number | null;
          subtype: Database["public"]["Enums"]["account_subtype"];
          tax_rate?: number | null;
          taxability?: Database["public"]["Enums"]["taxability"];
          ticker?: string | null;
          type: Database["public"]["Enums"]["account_type"];
          value: number;
        };
        Update: {
          account_id?: string;
          connection?: number | null;
          cost?: number | null;
          created_at?: string;
          currency?: string;
          description?: string;
          id?: number;
          investable?: Database["public"]["Enums"]["investable"];
          name?: string;
          notes?: string;
          parent?: number | null;
          quantity?: number | null;
          subtype?: Database["public"]["Enums"]["account_subtype"];
          tax_rate?: number | null;
          taxability?: Database["public"]["Enums"]["taxability"];
          ticker?: string | null;
          type?: Database["public"]["Enums"]["account_type"];
          value?: number;
        };
        Relationships: [
          {
            foreignKeyName: "account_connection_fkey";
            columns: ["connection"];
            isOneToOne: false;
            referencedRelation: "connection";
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
      connection: {
        Row: {
          account_id: number;
          aggregator: Database["public"]["Enums"]["aggregator"];
          created_at: string;
          id: number;
          last_updated: string;
          provider: string | null;
        };
        Insert: {
          account_id: number;
          aggregator: Database["public"]["Enums"]["aggregator"];
          created_at?: string;
          id?: number;
          last_updated?: string;
          provider?: string | null;
        };
        Update: {
          account_id?: number;
          aggregator?: Database["public"]["Enums"]["aggregator"];
          created_at?: string;
          id?: number;
          last_updated?: string;
          provider?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "connection_account_id_fkey";
            columns: ["account_id"];
            isOneToOne: false;
            referencedRelation: "account";
            referencedColumns: ["id"];
          },
        ];
      };
      document: {
        Row: {
          account_id: number;
          created_at: string;
          id: number;
          name: string;
          size: number;
        };
        Insert: {
          account_id: number;
          created_at?: string;
          id?: number;
          name: string;
          size: number;
        };
        Update: {
          account_id?: number;
          created_at?: string;
          id?: number;
          name?: string;
          size?: number;
        };
        Relationships: [
          {
            foreignKeyName: "document_account_id_fkey";
            columns: ["account_id"];
            isOneToOne: false;
            referencedRelation: "account";
            referencedColumns: ["id"];
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
        | "loan";
      account_type: "asset" | "liability";
      aggregator: "Plaid" | "SnapTrade";
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
