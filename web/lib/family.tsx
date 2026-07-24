"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "./supabase";

export type Role = "dad" | "mom";

export interface Family {
  id: string;
  invite_code: string;
  nickname: string;
  surname: string;
  edd: string;
}

export interface Member {
  user_id: string;
  role: Role;
}

/**
 * local: Supabase 미설정 → localStorage 단독 모드
 * loading / signedOut / noFamily / ready: Supabase 설정됨
 */
export type FamilyStatus =
  | "local"
  | "loading"
  | "signedOut"
  | "noFamily"
  | "ready";

interface FamilyState {
  status: FamilyStatus;
  session: Session | null;
  family: Family | null;
  members: Member[];
  myRole: Role | null;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
}

const FamilyContext = createContext<FamilyState>({
  status: "local",
  session: null,
  family: null,
  members: [],
  myRole: null,
  refresh: async () => {},
  signOut: async () => {},
});

export function FamilyProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [family, setFamily] = useState<Family | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [status, setStatus] = useState<FamilyStatus>(
    supabase ? "loading" : "local",
  );

  const load = useCallback(async (s: Session | null) => {
    if (!supabase) return;
    if (!s) {
      setFamily(null);
      setMembers([]);
      setStatus("signedOut");
      return;
    }
    const { data: my } = await supabase
      .from("family_members")
      .select("family_id, role")
      .eq("user_id", s.user.id)
      .limit(1)
      .maybeSingle();
    if (!my) {
      setFamily(null);
      setMembers([]);
      setStatus("noFamily");
      return;
    }
    const [famRes, memRes] = await Promise.all([
      supabase.from("families").select("*").eq("id", my.family_id).single(),
      supabase
        .from("family_members")
        .select("user_id, role")
        .eq("family_id", my.family_id),
    ]);
    setFamily(famRes.data as Family);
    setMembers((memRes.data ?? []) as Member[]);
    setStatus("ready");
  }, []);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      load(data.session);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      load(s);
    });
    return () => sub.subscription.unsubscribe();
  }, [load]);

  const refresh = useCallback(async () => {
    if (!supabase) return;
    const { data } = await supabase.auth.getSession();
    setSession(data.session);
    await load(data.session);
  }, [load]);

  const signOut = useCallback(async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
  }, []);

  const myRole =
    members.find((m) => m.user_id === session?.user.id)?.role ?? null;

  return (
    <FamilyContext.Provider
      value={{ status, session, family, members, myRole, refresh, signOut }}
    >
      {children}
    </FamilyContext.Provider>
  );
}

export const useFamily = () => useContext(FamilyContext);
