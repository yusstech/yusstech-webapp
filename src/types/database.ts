// Convenience aliases used throughout the app
export type Plan = "basic" | "standard" | "business" | "business_pro";

export interface PaymentLinkPlan {
  id: string;
  name: string;
  is_current: boolean;
  original_price: number; // NGN
  after_discount: number; // NGN
  after_credit: number; // NGN
  features: string[];
}
export type SubscriptionStatus = "active" | "overdue" | "cancelled";
export type BillingCycle = "monthly" | "annual";
export type RequestCategory = "bug" | "content" | "feature" | "emergency";
export type RequestStatus = "open" | "in_progress" | "resolved";
export type UserRole = "client" | "admin";

// Supabase Database type — must match Supabase's generated type format exactly
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          clerk_id: string;
          email: string;
          name: string;
          role: "client" | "admin";
          created_at: string;
        };
        Insert: {
          id?: string;
          clerk_id: string;
          email: string;
          name: string;
          role?: "client" | "admin";
          created_at?: string;
        };
        Update: {
          id?: string;
          clerk_id?: string;
          email?: string;
          name?: string;
          role?: "client" | "admin";
          created_at?: string;
        };
        Relationships: [];
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          plan: "basic" | "standard" | "business" | "business_pro";
          track: string;
          status: "active" | "overdue" | "cancelled";
          billing_cycle: "monthly" | "annual";
          next_renewal_date: string;
          paystack_subscription_id: string | null;
          paystack_customer_code: string | null;
          outgrown: boolean;
          site_url: string | null;
          requests_used_this_month: number;
          usage_reset_date: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          plan: "basic" | "standard" | "business" | "business_pro";
          track?: string;
          status?: "active" | "overdue" | "cancelled";
          billing_cycle?: "monthly" | "annual";
          next_renewal_date: string;
          paystack_subscription_id?: string | null;
          paystack_customer_code?: string | null;
          outgrown?: boolean;
          site_url?: string | null;
          requests_used_this_month?: number;
          usage_reset_date?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          plan?: "basic" | "standard" | "business" | "business_pro";
          track?: string;
          status?: "active" | "overdue" | "cancelled";
          billing_cycle?: "monthly" | "annual";
          next_renewal_date?: string;
          paystack_subscription_id?: string | null;
          paystack_customer_code?: string | null;
          outgrown?: boolean;
          site_url?: string | null;
          requests_used_this_month?: number;
          usage_reset_date?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      support_requests: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          body: string;
          category: "bug" | "content" | "feature" | "emergency";
          status: "open" | "in_progress" | "resolved";
          out_of_scope: boolean;
          created_at: string;
          resolved_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          body: string;
          category: "bug" | "content" | "feature" | "emergency";
          status?: "open" | "in_progress" | "resolved";
          out_of_scope?: boolean;
          created_at?: string;
          resolved_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          body?: string;
          category?: "bug" | "content" | "feature" | "emergency";
          status?: "open" | "in_progress" | "resolved";
          out_of_scope?: boolean;
          created_at?: string;
          resolved_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "support_requests_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      payment_links: {
        Row: {
          id: string;
          slug: string;
          client_name: string;
          client_email: string;
          current_plan_label: string | null;
          available_credit: number;
          loyalty_discount_percent: number;
          plans: PaymentLinkPlan[];
          status: "active" | "paid" | "expired" | "pending_verification";
          paid_plan_label: string | null;
          paid_amount: number | null;
          paystack_reference: string | null;
          expires_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          client_name: string;
          client_email: string;
          current_plan_label?: string | null;
          available_credit?: number;
          loyalty_discount_percent?: number;
          plans: PaymentLinkPlan[];
          status?: "active" | "paid" | "expired";
          paid_plan_label?: string | null;
          paid_amount?: number | null;
          paystack_reference?: string | null;
          expires_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          client_name?: string;
          client_email?: string;
          current_plan_label?: string | null;
          available_credit?: number;
          loyalty_discount_percent?: number;
          plans?: PaymentLinkPlan[];
          status?: "active" | "paid" | "expired";
          paid_plan_label?: string | null;
          paid_amount?: number | null;
          paystack_reference?: string | null;
          expires_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      invoices: {
        Row: {
          id: string;
          user_id: string;
          subscription_id: string;
          amount: number;
          currency: string;
          status: "paid" | "failed" | "pending";
          paystack_reference: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          subscription_id: string;
          amount: number;
          currency?: string;
          status?: "paid" | "failed" | "pending";
          paystack_reference?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          subscription_id?: string;
          amount?: number;
          currency?: string;
          status?: "paid" | "failed" | "pending";
          paystack_reference?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "invoices_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "invoices_subscription_id_fkey";
            columns: ["subscription_id"];
            isOneToOne: false;
            referencedRelation: "subscriptions";
            referencedColumns: ["id"];
          }
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
      plan: "basic" | "standard" | "business" | "business_pro";
      subscription_status: "active" | "overdue" | "cancelled";
      billing_cycle: "monthly" | "annual";
      request_category: "bug" | "content" | "feature" | "emergency";
      request_status: "open" | "in_progress" | "resolved";
      user_role: "client" | "admin";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

// Convenience row types
export type PaymentLinkRow = Database["public"]["Tables"]["payment_links"]["Row"];
export type UserRow = Database["public"]["Tables"]["users"]["Row"];
export type SubscriptionRow =
  Database["public"]["Tables"]["subscriptions"]["Row"];
export type SupportRequestRow =
  Database["public"]["Tables"]["support_requests"]["Row"];
export type InvoiceRow = Database["public"]["Tables"]["invoices"]["Row"];
