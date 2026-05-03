import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { DataSourceConfig, QueryDefinition, QueryResult } from "./types";
import { executeQueryForStudio } from "./query-executor";

interface DataStudioState {
  userId: string;
  setUserId: (id: string) => void;
  sources: DataSourceConfig[];
  addSource: (s: DataSourceConfig) => void;
  queries: QueryDefinition[];
  addQuery: (q: QueryDefinition) => void;
  runQuery: (queryId: string) => Promise<QueryResult>;
}

const DataStudioContext = createContext<DataStudioState | null>(null);

const STORAGE_USER = "futuremod-studio-user-id";

export function DataStudioProvider({ children }: { children: ReactNode }) {
  const [userId, setUserIdState] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_USER) ?? "local-user";
    } catch {
      return "local-user";
    }
  });

  const setUserId = useCallback((id: string) => {
    setUserIdState(id);
    try {
      localStorage.setItem(STORAGE_USER, id);
    } catch {
      /* ignore */
    }
  }, []);

  const [sources, setSources] = useState<DataSourceConfig[]>(() => [
    {
      id: "sample-builtin",
      name: "Built-in data",
      kind: "sample",
      createdAt: new Date().toISOString(),
    },
  ]);

  const [queries, setQueries] = useState<QueryDefinition[]>(() => [
    {
      id: "q-revenue",
      name: "Monthly revenue",
      sourceId: "sample-builtin",
      definition: { type: "sql", sql: 'select month, revenue from "sales"' },
    },
  ]);

  const addSource = useCallback((s: DataSourceConfig) => {
    setSources((prev) => [...prev.filter((x) => x.id !== s.id), s]);
  }, []);

  const addQuery = useCallback((q: QueryDefinition) => {
    setQueries((prev) => [...prev.filter((x) => x.id !== q.id), q]);
  }, []);

  const runQuery = useCallback(
    async (queryId: string): Promise<QueryResult> => {
      const q = queries.find((x) => x.id === queryId);
      const src = q ? sources.find((s) => s.id === q.sourceId) : undefined;
      return executeQueryForStudio({ userId, query: q, source: src });
    },
    [queries, sources, userId]
  );

  const value = useMemo(
    () =>
      ({
        userId,
        setUserId,
        sources,
        addSource,
        queries,
        addQuery,
        runQuery,
      }) satisfies DataStudioState,
    [userId, setUserId, sources, addSource, queries, addQuery, runQuery]
  );

  return <DataStudioContext.Provider value={value}>{children}</DataStudioContext.Provider>;
}

export function useDataStudio() {
  const ctx = useContext(DataStudioContext);
  if (!ctx) throw new Error("useDataStudio must be used within DataStudioProvider");
  return ctx;
}
