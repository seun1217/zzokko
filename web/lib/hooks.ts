"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "./supabase";
import { useFamily, type Role } from "./family";
import { useLocalStorage } from "./useLocalStorage";

/** family_id 필터로 테이블 변경을 구독해 refetch를 트리거한다. */
function useRealtime(
  enabled: boolean,
  familyId: string | undefined,
  table: string,
  refetch: () => void,
) {
  useEffect(() => {
    if (!enabled || !supabase || !familyId) return;
    const channel = supabase
      .channel(`sync-${table}-${familyId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table,
          filter: `family_id=eq.${familyId}`,
        },
        refetch,
      )
      .subscribe();
    return () => {
      supabase?.removeChannel(channel);
    };
  }, [enabled, familyId, refetch, table]);
}

// ── 체크리스트 ─────────────────────────────────────────────────────

export function useChecklist() {
  const { status, family, session } = useFamily();
  const shared = status === "ready";
  const [local, setLocal] = useLocalStorage<Record<string, string>>(
    "zzokko:checklist:v1",
    {},
  );
  const [remote, setRemote] = useState<Record<string, string>>({});

  const refetch = useCallback(async () => {
    if (!shared || !supabase || !family) return;
    const { data } = await supabase
      .from("checklist_done")
      .select("task_id, done_at")
      .eq("family_id", family.id);
    const map: Record<string, string> = {};
    for (const row of data ?? []) map[row.task_id] = row.done_at;
    setRemote(map);
  }, [shared, family]);

  useEffect(() => {
    refetch();
  }, [refetch]);
  useRealtime(shared, family?.id, "checklist_done", refetch);

  const done = shared ? remote : local;

  const toggle = useCallback(
    async (taskId: string) => {
      if (!shared || !supabase || !family || !session) {
        setLocal((prev) => {
          const next = { ...prev };
          if (next[taskId]) delete next[taskId];
          else next[taskId] = new Date().toISOString();
          return next;
        });
        return;
      }
      if (remote[taskId]) {
        setRemote((prev) => {
          const next = { ...prev };
          delete next[taskId];
          return next;
        });
        await supabase
          .from("checklist_done")
          .delete()
          .match({ family_id: family.id, task_id: taskId });
      } else {
        setRemote((prev) => ({ ...prev, [taskId]: new Date().toISOString() }));
        await supabase.from("checklist_done").insert({
          family_id: family.id,
          task_id: taskId,
          done_by: session.user.id,
        });
      }
    },
    [shared, family, session, remote, setLocal],
  );

  return { done, toggle, shared };
}

// ── 태담 일기 ──────────────────────────────────────────────────────

export interface JournalEntry {
  id: string;
  date: string; // YYYY-MM-DD
  author: Role;
  body: string;
  mine: boolean;
}

export function useJournal() {
  const { status, family, session, myRole } = useFamily();
  const shared = status === "ready";
  const [local, setLocal] = useLocalStorage<
    Array<{ id: string; date: string; author: Role; body: string }>
  >("zzokko:journal:v1", []);
  const [remote, setRemote] = useState<JournalEntry[]>([]);

  const refetch = useCallback(async () => {
    if (!shared || !supabase || !family || !session) return;
    const { data } = await supabase
      .from("journal_entries")
      .select("id, entry_date, author, author_role, body")
      .eq("family_id", family.id)
      .order("entry_date", { ascending: false })
      .order("created_at", { ascending: false });
    setRemote(
      (data ?? []).map((r) => ({
        id: r.id,
        date: r.entry_date,
        author: r.author_role as Role,
        body: r.body,
        mine: r.author === session.user.id,
      })),
    );
  }, [shared, family, session]);

  useEffect(() => {
    refetch();
  }, [refetch]);
  useRealtime(shared, family?.id, "journal_entries", refetch);

  const entries: JournalEntry[] = shared
    ? remote
    : local.map((e) => ({ ...e, mine: true }));

  const add = useCallback(
    async (author: Role, date: string, body: string) => {
      if (!shared || !supabase || !family || !session) {
        setLocal((prev) => [
          { id: crypto.randomUUID(), date, author, body },
          ...prev,
        ]);
        return;
      }
      await supabase.from("journal_entries").insert({
        family_id: family.id,
        author: session.user.id,
        author_role: myRole ?? author,
        entry_date: date,
        body,
      });
      await refetch();
    },
    [shared, family, session, myRole, setLocal, refetch],
  );

  const remove = useCallback(
    async (id: string) => {
      if (!shared || !supabase) {
        setLocal((prev) => prev.filter((e) => e.id !== id));
        return;
      }
      await supabase.from("journal_entries").delete().eq("id", id);
      await refetch();
    },
    [shared, setLocal, refetch],
  );

  return { entries, add, remove, shared, myRole };
}

// ── 이름 후보 ──────────────────────────────────────────────────────

export interface NameItem {
  id: string;
  hangul: string;
  hanja: string;
  meaning: string;
  dadScore: number;
  momScore: number;
}

export function useNames() {
  const { status, family, session, members, myRole, refresh } = useFamily();
  const shared = status === "ready";
  const [localNames, setLocalNames] = useLocalStorage<NameItem[]>(
    "zzokko:names:v1",
    [],
  );
  const [localSurname, setLocalSurname] = useLocalStorage<string>(
    "zzokko:surname",
    "",
  );
  const [remote, setRemote] = useState<NameItem[]>([]);

  const refetch = useCallback(async () => {
    if (!shared || !supabase || !family) return;
    const { data } = await supabase
      .from("name_candidates")
      .select("id, hangul, hanja, meaning, name_votes(user_id, score)")
      .eq("family_id", family.id)
      .order("created_at", { ascending: false });
    const roleOf = new Map(members.map((m) => [m.user_id, m.role]));
    setRemote(
      (data ?? []).map((r) => {
        let dadScore = 0;
        let momScore = 0;
        for (const v of r.name_votes ?? []) {
          if (roleOf.get(v.user_id) === "dad") dadScore = v.score;
          if (roleOf.get(v.user_id) === "mom") momScore = v.score;
        }
        return {
          id: r.id,
          hangul: r.hangul,
          hanja: r.hanja,
          meaning: r.meaning,
          dadScore,
          momScore,
        };
      }),
    );
  }, [shared, family, members]);

  useEffect(() => {
    refetch();
  }, [refetch]);
  useRealtime(shared, family?.id, "name_candidates", refetch);
  // name_votes는 family_id 컬럼이 없어 필터 구독 불가 → 후보 변경 구독 + 수동 refetch로 커버

  const names = shared ? remote : localNames;
  const surname = shared ? (family?.surname ?? "") : localSurname;

  const setSurname = useCallback(
    async (value: string) => {
      if (!shared || !supabase || !family) {
        setLocalSurname(value);
        return;
      }
      await supabase
        .from("families")
        .update({ surname: value })
        .eq("id", family.id);
      await refresh();
    },
    [shared, family, setLocalSurname, refresh],
  );

  const add = useCallback(
    async (hangul: string, hanja: string, meaning: string) => {
      if (!shared || !supabase || !family || !session) {
        setLocalNames((prev) => [
          {
            id: crypto.randomUUID(),
            hangul,
            hanja,
            meaning,
            dadScore: 0,
            momScore: 0,
          },
          ...prev,
        ]);
        return;
      }
      await supabase.from("name_candidates").insert({
        family_id: family.id,
        hangul,
        hanja,
        meaning,
        proposed_by: session.user.id,
      });
      await refetch();
    },
    [shared, family, session, setLocalNames, refetch],
  );

  const remove = useCallback(
    async (id: string) => {
      if (!shared || !supabase) {
        setLocalNames((prev) => prev.filter((n) => n.id !== id));
        return;
      }
      await supabase.from("name_candidates").delete().eq("id", id);
      await refetch();
    },
    [shared, setLocalNames, refetch],
  );

  /** 공유 모드에선 내 역할의 별점만 저장 가능. 로컬 모드는 둘 다 조작 가능. */
  const vote = useCallback(
    async (id: string, who: Role, score: number) => {
      if (!shared || !supabase || !session) {
        setLocalNames((prev) =>
          prev.map((n) =>
            n.id === id
              ? { ...n, [who === "dad" ? "dadScore" : "momScore"]: score }
              : n,
          ),
        );
        return;
      }
      if (who !== myRole) return;
      await supabase
        .from("name_votes")
        .upsert({ name_id: id, user_id: session.user.id, score });
      await refetch();
    },
    [shared, session, myRole, setLocalNames, refetch],
  );

  return { names, surname, setSurname, add, remove, vote, shared, myRole };
}
