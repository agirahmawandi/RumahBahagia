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
      accounts: {
        Row: {
          account_number_last4: string | null
          archived_at: string | null
          color: string | null
          created_at: string
          credit_limit: number | null
          household_id: string
          icon: string | null
          id: string
          institution: string | null
          ledger_account_id: string
          name: string
          owner_member_id: string | null
          sort_order: number | null
          type: Database["public"]["Enums"]["cash_account_type"]
          updated_at: string
        }
        Insert: {
          account_number_last4?: string | null
          archived_at?: string | null
          color?: string | null
          created_at?: string
          credit_limit?: number | null
          household_id: string
          icon?: string | null
          id?: string
          institution?: string | null
          ledger_account_id: string
          name: string
          owner_member_id?: string | null
          sort_order?: number | null
          type?: Database["public"]["Enums"]["cash_account_type"]
          updated_at?: string
        }
        Update: {
          account_number_last4?: string | null
          archived_at?: string | null
          color?: string | null
          created_at?: string
          credit_limit?: number | null
          household_id?: string
          icon?: string | null
          id?: string
          institution?: string | null
          ledger_account_id?: string
          name?: string
          owner_member_id?: string | null
          sort_order?: number | null
          type?: Database["public"]["Enums"]["cash_account_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "accounts_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounts_ledger_account_id_fkey"
            columns: ["ledger_account_id"]
            isOneToOne: true
            referencedRelation: "ledger_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounts_ledger_account_id_fkey"
            columns: ["ledger_account_id"]
            isOneToOne: true
            referencedRelation: "v_account_balances"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "accounts_owner_member_id_fkey"
            columns: ["owner_member_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      assets: {
        Row: {
          acquired_date: string
          acquisition_cost: number
          category: Database["public"]["Enums"]["asset_category"]
          created_at: string
          current_value: number
          depreciation_method: string | null
          disposed_at: string | null
          household_id: string
          id: string
          ledger_account_id: string
          name: string
          notes: string | null
          updated_at: string
          useful_life_months: number | null
        }
        Insert: {
          acquired_date?: string
          acquisition_cost?: number
          category?: Database["public"]["Enums"]["asset_category"]
          created_at?: string
          current_value?: number
          depreciation_method?: string | null
          disposed_at?: string | null
          household_id: string
          id?: string
          ledger_account_id: string
          name: string
          notes?: string | null
          updated_at?: string
          useful_life_months?: number | null
        }
        Update: {
          acquired_date?: string
          acquisition_cost?: number
          category?: Database["public"]["Enums"]["asset_category"]
          created_at?: string
          current_value?: number
          depreciation_method?: string | null
          disposed_at?: string | null
          household_id?: string
          id?: string
          ledger_account_id?: string
          name?: string
          notes?: string | null
          updated_at?: string
          useful_life_months?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "assets_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assets_ledger_account_id_fkey"
            columns: ["ledger_account_id"]
            isOneToOne: true
            referencedRelation: "ledger_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assets_ledger_account_id_fkey"
            columns: ["ledger_account_id"]
            isOneToOne: true
            referencedRelation: "v_account_balances"
            referencedColumns: ["account_id"]
          },
        ]
      }
      attachments: {
        Row: {
          created_at: string
          entry_id: string
          household_id: string
          id: string
          mime_type: string | null
          size: number | null
          storage_path: string
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string
          entry_id: string
          household_id: string
          id?: string
          mime_type?: string | null
          size?: number | null
          storage_path: string
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string
          entry_id?: string
          household_id?: string
          id?: string
          mime_type?: string | null
          size?: number | null
          storage_path?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attachments_entry_id_fkey"
            columns: ["entry_id"]
            isOneToOne: false
            referencedRelation: "journal_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attachments_entry_id_fkey"
            columns: ["entry_id"]
            isOneToOne: false
            referencedRelation: "v_transactions_list"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attachments_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attachments_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      budgets: {
        Row: {
          amount: number
          category_id: string
          created_at: string
          household_id: string
          id: string
          period_month: string
          updated_at: string
        }
        Insert: {
          amount?: number
          category_id: string
          created_at?: string
          household_id: string
          id?: string
          period_month: string
          updated_at?: string
        }
        Update: {
          amount?: number
          category_id?: string
          created_at?: string
          household_id?: string
          id?: string
          period_month?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "budgets_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budgets_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          archived_at: string | null
          color: string | null
          created_at: string
          household_id: string
          icon: string | null
          id: string
          kind: string
          ledger_account_id: string
          name: string
          parent_id: string | null
          updated_at: string
        }
        Insert: {
          archived_at?: string | null
          color?: string | null
          created_at?: string
          household_id: string
          icon?: string | null
          id?: string
          kind: string
          ledger_account_id: string
          name: string
          parent_id?: string | null
          updated_at?: string
        }
        Update: {
          archived_at?: string | null
          color?: string | null
          created_at?: string
          household_id?: string
          icon?: string | null
          id?: string
          kind?: string
          ledger_account_id?: string
          name?: string
          parent_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "categories_ledger_account_id_fkey"
            columns: ["ledger_account_id"]
            isOneToOne: true
            referencedRelation: "ledger_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "categories_ledger_account_id_fkey"
            columns: ["ledger_account_id"]
            isOneToOne: true
            referencedRelation: "v_account_balances"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      household_invitations: {
        Row: {
          accepted_at: string | null
          created_at: string
          email: string
          expires_at: string
          household_id: string
          id: string
          invited_by: string | null
          role: Database["public"]["Enums"]["member_role"]
          token: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          email: string
          expires_at?: string
          household_id: string
          id?: string
          invited_by?: string | null
          role?: Database["public"]["Enums"]["member_role"]
          token?: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          household_id?: string
          id?: string
          invited_by?: string | null
          role?: Database["public"]["Enums"]["member_role"]
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "household_invitations_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "household_invitations_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      household_members: {
        Row: {
          household_id: string
          joined_at: string
          role: Database["public"]["Enums"]["member_role"]
          user_id: string
        }
        Insert: {
          household_id: string
          joined_at?: string
          role?: Database["public"]["Enums"]["member_role"]
          user_id: string
        }
        Update: {
          household_id?: string
          joined_at?: string
          role?: Database["public"]["Enums"]["member_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "household_members_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "household_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      households: {
        Row: {
          allow_negative_balance: boolean
          created_at: string
          created_by: string | null
          currency: string
          id: string
          name: string
          type: Database["public"]["Enums"]["household_type"]
          updated_at: string
        }
        Insert: {
          allow_negative_balance?: boolean
          created_at?: string
          created_by?: string | null
          currency?: string
          id?: string
          name: string
          type?: Database["public"]["Enums"]["household_type"]
          updated_at?: string
        }
        Update: {
          allow_negative_balance?: boolean
          created_at?: string
          created_by?: string | null
          currency?: string
          id?: string
          name?: string
          type?: Database["public"]["Enums"]["household_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "households_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      investment_transactions: {
        Row: {
          amount: number
          created_at: string
          entry_id: string
          fee: number | null
          id: string
          investment_id: string
          kind: string
          price: number | null
          realized_gain: number | null
          units: number | null
        }
        Insert: {
          amount: number
          created_at?: string
          entry_id: string
          fee?: number | null
          id?: string
          investment_id: string
          kind: string
          price?: number | null
          realized_gain?: number | null
          units?: number | null
        }
        Update: {
          amount?: number
          created_at?: string
          entry_id?: string
          fee?: number | null
          id?: string
          investment_id?: string
          kind?: string
          price?: number | null
          realized_gain?: number | null
          units?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "investment_transactions_entry_id_fkey"
            columns: ["entry_id"]
            isOneToOne: false
            referencedRelation: "journal_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "investment_transactions_entry_id_fkey"
            columns: ["entry_id"]
            isOneToOne: false
            referencedRelation: "v_transactions_list"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "investment_transactions_investment_id_fkey"
            columns: ["investment_id"]
            isOneToOne: false
            referencedRelation: "investments"
            referencedColumns: ["id"]
          },
        ]
      }
      investments: {
        Row: {
          archived_at: string | null
          avg_cost: number
          created_at: string
          household_id: string
          id: string
          ledger_account_id: string
          market_price: number
          market_updated_at: string | null
          market_value: number
          name: string
          platform: string | null
          ticker: string | null
          type: Database["public"]["Enums"]["investment_type"]
          units: number
          updated_at: string
        }
        Insert: {
          archived_at?: string | null
          avg_cost?: number
          created_at?: string
          household_id: string
          id?: string
          ledger_account_id: string
          market_price?: number
          market_updated_at?: string | null
          market_value?: number
          name: string
          platform?: string | null
          ticker?: string | null
          type?: Database["public"]["Enums"]["investment_type"]
          units?: number
          updated_at?: string
        }
        Update: {
          archived_at?: string | null
          avg_cost?: number
          created_at?: string
          household_id?: string
          id?: string
          ledger_account_id?: string
          market_price?: number
          market_updated_at?: string | null
          market_value?: number
          name?: string
          platform?: string | null
          ticker?: string | null
          type?: Database["public"]["Enums"]["investment_type"]
          units?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "investments_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "investments_ledger_account_id_fkey"
            columns: ["ledger_account_id"]
            isOneToOne: true
            referencedRelation: "ledger_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "investments_ledger_account_id_fkey"
            columns: ["ledger_account_id"]
            isOneToOne: true
            referencedRelation: "v_account_balances"
            referencedColumns: ["account_id"]
          },
        ]
      }
      journal_entries: {
        Row: {
          created_at: string
          created_by: string | null
          description: string
          entry_date: string
          household_id: string
          id: string
          reference_id: string | null
          reference_type: string | null
          tags: string[] | null
          type: Database["public"]["Enums"]["txn_type"]
          updated_at: string
          updated_by: string | null
          voided_at: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description: string
          entry_date?: string
          household_id: string
          id?: string
          reference_id?: string | null
          reference_type?: string | null
          tags?: string[] | null
          type: Database["public"]["Enums"]["txn_type"]
          updated_at?: string
          updated_by?: string | null
          voided_at?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string
          entry_date?: string
          household_id?: string
          id?: string
          reference_id?: string | null
          reference_type?: string | null
          tags?: string[] | null
          type?: Database["public"]["Enums"]["txn_type"]
          updated_at?: string
          updated_by?: string | null
          voided_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "journal_entries_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journal_entries_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journal_entries_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      journal_lines: {
        Row: {
          account_id: string
          created_at: string
          credit: number
          debit: number
          entry_id: string
          household_id: string
          id: string
          memo: string | null
        }
        Insert: {
          account_id: string
          created_at?: string
          credit?: number
          debit?: number
          entry_id: string
          household_id: string
          id?: string
          memo?: string | null
        }
        Update: {
          account_id?: string
          created_at?: string
          credit?: number
          debit?: number
          entry_id?: string
          household_id?: string
          id?: string
          memo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "journal_lines_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "ledger_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journal_lines_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "v_account_balances"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "journal_lines_entry_id_fkey"
            columns: ["entry_id"]
            isOneToOne: false
            referencedRelation: "journal_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journal_lines_entry_id_fkey"
            columns: ["entry_id"]
            isOneToOne: false
            referencedRelation: "v_transactions_list"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journal_lines_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      ledger_accounts: {
        Row: {
          archived_at: string | null
          class: Database["public"]["Enums"]["account_class"]
          code: string
          created_at: string
          household_id: string
          id: string
          is_system: boolean
          name: string
          parent_id: string | null
          updated_at: string
        }
        Insert: {
          archived_at?: string | null
          class: Database["public"]["Enums"]["account_class"]
          code: string
          created_at?: string
          household_id: string
          id?: string
          is_system?: boolean
          name: string
          parent_id?: string | null
          updated_at?: string
        }
        Update: {
          archived_at?: string | null
          class?: Database["public"]["Enums"]["account_class"]
          code?: string
          created_at?: string
          household_id?: string
          id?: string
          is_system?: boolean
          name?: string
          parent_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ledger_accounts_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ledger_accounts_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "ledger_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ledger_accounts_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "v_account_balances"
            referencedColumns: ["account_id"]
          },
        ]
      }
      liabilities: {
        Row: {
          closed_at: string | null
          created_at: string
          due_day: number | null
          household_id: string
          id: string
          installment_amount: number | null
          interest_rate: number | null
          ledger_account_id: string
          lender: string | null
          name: string
          principal: number
          start_date: string
          tenor_months: number | null
          type: Database["public"]["Enums"]["liability_type"]
          updated_at: string
        }
        Insert: {
          closed_at?: string | null
          created_at?: string
          due_day?: number | null
          household_id: string
          id?: string
          installment_amount?: number | null
          interest_rate?: number | null
          ledger_account_id: string
          lender?: string | null
          name: string
          principal?: number
          start_date?: string
          tenor_months?: number | null
          type?: Database["public"]["Enums"]["liability_type"]
          updated_at?: string
        }
        Update: {
          closed_at?: string | null
          created_at?: string
          due_day?: number | null
          household_id?: string
          id?: string
          installment_amount?: number | null
          interest_rate?: number | null
          ledger_account_id?: string
          lender?: string | null
          name?: string
          principal?: number
          start_date?: string
          tenor_months?: number | null
          type?: Database["public"]["Enums"]["liability_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "liabilities_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "liabilities_ledger_account_id_fkey"
            columns: ["ledger_account_id"]
            isOneToOne: true
            referencedRelation: "ledger_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "liabilities_ledger_account_id_fkey"
            columns: ["ledger_account_id"]
            isOneToOne: true
            referencedRelation: "v_account_balances"
            referencedColumns: ["account_id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          default_household_id: string | null
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          default_household_id?: string | null
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          default_household_id?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_default_household_id_fkey"
            columns: ["default_household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      savings_goals: {
        Row: {
          archived_at: string | null
          color: string | null
          created_at: string
          description: string | null
          household_id: string
          icon: string | null
          id: string
          ledger_account_id: string
          linked_account_id: string | null
          name: string
          target_amount: number
          target_date: string | null
          updated_at: string
        }
        Insert: {
          archived_at?: string | null
          color?: string | null
          created_at?: string
          description?: string | null
          household_id: string
          icon?: string | null
          id?: string
          ledger_account_id: string
          linked_account_id?: string | null
          name: string
          target_amount?: number
          target_date?: string | null
          updated_at?: string
        }
        Update: {
          archived_at?: string | null
          color?: string | null
          created_at?: string
          description?: string | null
          household_id?: string
          icon?: string | null
          id?: string
          ledger_account_id?: string
          linked_account_id?: string | null
          name?: string
          target_amount?: number
          target_date?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "savings_goals_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "savings_goals_ledger_account_id_fkey"
            columns: ["ledger_account_id"]
            isOneToOne: true
            referencedRelation: "ledger_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "savings_goals_ledger_account_id_fkey"
            columns: ["ledger_account_id"]
            isOneToOne: true
            referencedRelation: "v_account_balances"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "savings_goals_linked_account_id_fkey"
            columns: ["linked_account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      v_account_balances: {
        Row: {
          account_id: string | null
          archived_at: string | null
          balance: number | null
          class: Database["public"]["Enums"]["account_class"] | null
          code: string | null
          household_id: string | null
          is_system: boolean | null
          name: string | null
          parent_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ledger_accounts_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ledger_accounts_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "ledger_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ledger_accounts_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "v_account_balances"
            referencedColumns: ["account_id"]
          },
        ]
      }
      v_net_worth: {
        Row: {
          household_id: string | null
          net_worth: number | null
          total_assets: number | null
          total_liabilities: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ledger_accounts_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      v_transactions_list: {
        Row: {
          amount: number | null
          created_at: string | null
          created_by: string | null
          created_by_name: string | null
          description: string | null
          entry_date: string | null
          household_id: string | null
          id: string | null
          reference_id: string | null
          reference_type: string | null
          tags: string[] | null
          type: Database["public"]["Enums"]["txn_type"] | null
          voided_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "journal_entries_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journal_entries_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      accept_invitation: { Args: { p_token: string }; Returns: string }
      can_edit: { Args: { h: string }; Returns: boolean }
      create_asset: {
        Args: {
          p_account_id?: string
          p_acquired_date?: string
          p_category?: Database["public"]["Enums"]["asset_category"]
          p_cost?: number
          p_household_id: string
          p_name: string
          p_notes?: string
        }
        Returns: string
      }
      create_cash_account: {
        Args: {
          p_account_number_last4?: string
          p_color?: string
          p_credit_limit?: number
          p_household_id: string
          p_icon?: string
          p_institution?: string
          p_name: string
          p_opening_balance?: number
          p_type: Database["public"]["Enums"]["cash_account_type"]
        }
        Returns: string
      }
      create_household: {
        Args: {
          p_name: string
          p_type?: Database["public"]["Enums"]["household_type"]
        }
        Returns: string
      }
      create_investment: {
        Args: {
          p_household_id: string
          p_name: string
          p_platform?: string
          p_ticker?: string
          p_type?: Database["public"]["Enums"]["investment_type"]
        }
        Returns: string
      }
      create_liability: {
        Args: {
          p_account_id?: string
          p_household_id: string
          p_installment_amount?: number
          p_interest_rate?: number
          p_lender?: string
          p_name: string
          p_principal?: number
          p_tenor_months?: number
          p_type?: Database["public"]["Enums"]["liability_type"]
        }
        Returns: string
      }
      create_savings_goal: {
        Args: {
          p_color?: string
          p_description?: string
          p_household_id: string
          p_icon?: string
          p_linked_account_id?: string
          p_name: string
          p_target_amount?: number
          p_target_date?: string
        }
        Returns: string
      }
      create_transaction: {
        Args: {
          p_description: string
          p_entry_date: string
          p_household_id: string
          p_lines: Json
          p_ref_id?: string
          p_ref_type?: string
          p_tags?: string[]
          p_type: Database["public"]["Enums"]["txn_type"]
        }
        Returns: string
      }
      is_member: { Args: { h: string }; Returns: boolean }
      is_owner: { Args: { h: string }; Returns: boolean }
      record_expense: {
        Args: {
          p_account_id: string
          p_amount: number
          p_category_id: string
          p_date: string
          p_description: string
          p_household_id: string
          p_tags?: string[]
        }
        Returns: string
      }
      record_income: {
        Args: {
          p_account_id: string
          p_amount: number
          p_category_id: string
          p_date: string
          p_description: string
          p_household_id: string
          p_tags?: string[]
        }
        Returns: string
      }
      record_investment_buy: {
        Args: {
          p_account_id: string
          p_date?: string
          p_fee?: number
          p_investment_id: string
          p_price: number
          p_units: number
        }
        Returns: string
      }
      record_liability_payment: {
        Args: {
          p_account_id: string
          p_date?: string
          p_interest_amount?: number
          p_liability_id: string
          p_note?: string
          p_principal_amount: number
        }
        Returns: string
      }
      record_transfer: {
        Args: {
          p_admin_fee?: number
          p_amount: number
          p_date: string
          p_description?: string
          p_from_account_id: string
          p_household_id: string
          p_to_account_id: string
        }
        Returns: string
      }
      report_balance_sheet: {
        Args: { p_as_of?: string; p_household_id: string }
        Returns: {
          account_id: string
          balance: number
          class: Database["public"]["Enums"]["account_class"]
          code: string
          name: string
        }[]
      }
      report_general_ledger: {
        Args: { p_account_id: string; p_from: string; p_to: string }
        Returns: {
          balance_change: number
          credit: number
          debit: number
          description: string
          entry_date: string
          entry_id: string
          type: Database["public"]["Enums"]["txn_type"]
        }[]
      }
      report_income_statement: {
        Args: { p_from: string; p_household_id: string; p_to: string }
        Returns: {
          account_id: string
          amount: number
          class: Database["public"]["Enums"]["account_class"]
          code: string
          name: string
        }[]
      }
      saving_deposit: {
        Args: {
          p_account_id: string
          p_amount: number
          p_date?: string
          p_goal_id: string
          p_note?: string
        }
        Returns: string
      }
      saving_withdraw: {
        Args: {
          p_account_id: string
          p_amount: number
          p_date?: string
          p_goal_id: string
          p_note?: string
        }
        Returns: string
      }
      seed_household_categories: {
        Args: { p_household_id: string }
        Returns: undefined
      }
      void_transaction: { Args: { p_entry_id: string }; Returns: boolean }
    }
    Enums: {
      account_class: "asset" | "liability" | "equity" | "income" | "expense"
      asset_category:
        | "property"
        | "vehicle"
        | "electronics"
        | "land"
        | "jewelry"
        | "other"
      cash_account_type: "cash" | "bank" | "ewallet" | "credit_card"
      household_type: "personal" | "family"
      investment_type:
        | "mutual_fund"
        | "stock"
        | "gold"
        | "bond"
        | "deposit"
        | "crypto"
        | "other"
      liability_type:
        | "mortgage"
        | "vehicle_loan"
        | "personal_loan"
        | "credit_card"
        | "paylater"
        | "other"
      member_role: "owner" | "editor" | "viewer"
      txn_type:
        | "income"
        | "expense"
        | "transfer"
        | "saving_deposit"
        | "saving_withdraw"
        | "investment_buy"
        | "investment_sell"
        | "investment_dividend"
        | "revaluation"
        | "asset_purchase"
        | "asset_disposal"
        | "liability_drawdown"
        | "liability_payment"
        | "opening_balance"
        | "adjustment"
        | "manual_journal"
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
      account_class: ["asset", "liability", "equity", "income", "expense"],
      asset_category: [
        "property",
        "vehicle",
        "electronics",
        "land",
        "jewelry",
        "other",
      ],
      cash_account_type: ["cash", "bank", "ewallet", "credit_card"],
      household_type: ["personal", "family"],
      investment_type: [
        "mutual_fund",
        "stock",
        "gold",
        "bond",
        "deposit",
        "crypto",
        "other",
      ],
      liability_type: [
        "mortgage",
        "vehicle_loan",
        "personal_loan",
        "credit_card",
        "paylater",
        "other",
      ],
      member_role: ["owner", "editor", "viewer"],
      txn_type: [
        "income",
        "expense",
        "transfer",
        "saving_deposit",
        "saving_withdraw",
        "investment_buy",
        "investment_sell",
        "investment_dividend",
        "revaluation",
        "asset_purchase",
        "asset_disposal",
        "liability_drawdown",
        "liability_payment",
        "opening_balance",
        "adjustment",
        "manual_journal",
      ],
    },
  },
} as const
