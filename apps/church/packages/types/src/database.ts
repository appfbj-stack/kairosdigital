export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      churches: {
        Row: {
          id: string;
          name: string;
          slug: string;
          plan: "free" | "starter" | "pro" | "enterprise";
          active_modules: string[];
          branding: Json;
          custom_domain: string | null;
          created_at: string;
          updated_at: string;
          created_by: string;
        };
        Insert: Omit<Database["public"]["Tables"]["churches"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["churches"]["Insert"]>;
      };
      users: {
        Row: {
          id: string;
          church_id: string;
          email: string;
          name: string;
          avatar_url: string | null;
          role: "super_admin" | "church_admin" | "pastor" | "leader" | "member" | "visitor";
          created_at: string;
          updated_at: string;
          created_by: string;
        };
        Insert: Omit<Database["public"]["Tables"]["users"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["users"]["Insert"]>;
      };
      members: {
        Row: {
          id: string;
          church_id: string;
          user_id: string | null;
          name: string;
          email: string | null;
          phone: string | null;
          avatar_url: string | null;
          birthdate: string | null;
          baptism_date: string | null;
          status: "active" | "inactive" | "visitor";
          cell_id: string | null;
          created_at: string;
          updated_at: string;
          created_by: string;
        };
        Insert: Omit<Database["public"]["Tables"]["members"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["members"]["Insert"]>;
      };
      cells: {
        Row: {
          id: string;
          church_id: string;
          name: string;
          leader_id: string;
          meeting_day: string;
          meeting_time: string;
          address: string | null;
          active: boolean;
          created_at: string;
          updated_at: string;
          created_by: string;
        };
        Insert: Omit<Database["public"]["Tables"]["cells"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["cells"]["Insert"]>;
      };
      events: {
        Row: {
          id: string;
          church_id: string;
          title: string;
          description: string | null;
          start_at: string;
          end_at: string | null;
          location: string | null;
          type: "service" | "event" | "meeting" | "other";
          created_at: string;
          updated_at: string;
          created_by: string;
        };
        Insert: Omit<Database["public"]["Tables"]["events"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["events"]["Insert"]>;
      };
      transactions: {
        Row: {
          id: string;
          church_id: string;
          type: "income" | "expense";
          category: string;
          amount: number;
          description: string | null;
          date: string;
          member_id: string | null;
          payment_method: "pix" | "cash" | "transfer" | "card";
          created_at: string;
          updated_at: string;
          created_by: string;
        };
        Insert: Omit<Database["public"]["Tables"]["transactions"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["transactions"]["Insert"]>;
      };
      prayer_requests: {
        Row: {
          id: string;
          church_id: string;
          member_id: string | null;
          title: string;
          description: string;
          status: "open" | "answered" | "closed";
          is_anonymous: boolean;
          created_at: string;
          updated_at: string;
          created_by: string;
        };
        Insert: Omit<Database["public"]["Tables"]["prayer_requests"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["prayer_requests"]["Insert"]>;
      };
      sermons: {
        Row: {
          id: string;
          church_id: string;
          title: string;
          pastor_id: string;
          series: string | null;
          scripture: string | null;
          video_url: string | null;
          audio_url: string | null;
          pdf_url: string | null;
          preached_at: string;
          created_at: string;
          updated_at: string;
          created_by: string;
        };
        Insert: Omit<Database["public"]["Tables"]["sermons"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["sermons"]["Insert"]>;
      };
      chat_rooms: {
        Row: {
          id: string;
          church_id: string;
          name: string;
          type: "general" | "ministry" | "cell" | "direct";
          created_at: string;
          updated_at: string;
          created_by: string;
        };
        Insert: Omit<Database["public"]["Tables"]["chat_rooms"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["chat_rooms"]["Insert"]>;
      };
      messages: {
        Row: {
          id: string;
          church_id: string;
          room_id: string;
          sender_id: string;
          content: string;
          type: "text" | "image" | "audio" | "file";
          media_url: string | null;
          created_at: string;
          updated_at: string;
          created_by: string;
        };
        Insert: Omit<Database["public"]["Tables"]["messages"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["messages"]["Insert"]>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: "super_admin" | "church_admin" | "pastor" | "leader" | "member" | "visitor";
      member_status: "active" | "inactive" | "visitor";
      transaction_type: "income" | "expense";
      payment_method: "pix" | "cash" | "transfer" | "card";
    };
  };
}
