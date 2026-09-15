import { createClient } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  image?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface SessionData {
  user: AuthUser | null;
}

function mapUser(u: {
  id: string;
  email?: string;
  user_metadata?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
}): AuthUser {
  return {
    id: u.id,
    email: u.email ?? "",
    name: (u.user_metadata?.name as string) || u.email?.split("@")[0] || "User",
    image: u.user_metadata?.image as string | undefined,
    createdAt: u.created_at,
    updatedAt: u.updated_at,
  };
}

export function useSession(): {
  data: SessionData;
  isLoading: boolean;
} {
  const [session, setSession] = useState<SessionData>({ user: null });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession({
        user: data.session?.user ? mapUser(data.session.user) : null,
      });
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession({
        user: sess?.user ? mapUser(sess.user) : null,
      });
    });

    return () => subscription.unsubscribe();
  }, []);

  return { data: session, isLoading };
}

export async function getSession(): Promise<{ data: SessionData }> {
  const { data } = await supabase.auth.getSession();
  return {
    data: {
      user: data.session?.user ? mapUser(data.session.user) : null,
    },
  };
}

export const auth = {
  useSession,
  getSession,

  signUp: {
    async email({
      name,
      email,
      password,
      callbackURL,
    }: {
      name: string;
      email: string;
      password: string;
      callbackURL?: string;
    }) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name },
        },
      });

      if (error) return { error: { message: error.message } };

      if (data.session && callbackURL) {
        window.location.href = callbackURL;
      }

      return {
        error: null,
        requiresEmailConfirmation: Boolean(data.user && !data.session),
      };
    },
  },

  signIn: {
    async email({
      email,
      password,
      callbackURL,
    }: {
      email: string;
      password: string;
      callbackURL?: string;
    }) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) return { error: { message: error.message } };

      if (data.user && callbackURL) {
        window.location.href = callbackURL;
      }

      return { error: null };
    },
  },

  async signOut() {
    await supabase.auth.signOut();
  },
};
