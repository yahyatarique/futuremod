import {
  createContext,
  useContext,
  useMemo,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import type { ProjectSeoMeta } from "./project-seo";

type ProjectSeoContextValue = {
  projectSeo: ProjectSeoMeta;
  setProjectSeo: Dispatch<SetStateAction<ProjectSeoMeta>>;
};

const ProjectSeoContext = createContext<ProjectSeoContextValue | null>(null);

export function ProjectSeoProvider({
  projectSeo,
  setProjectSeo,
  children,
}: ProjectSeoContextValue & { children: ReactNode }) {
  const value = useMemo(
    () => ({ projectSeo, setProjectSeo }),
    [projectSeo, setProjectSeo]
  );
  return <ProjectSeoContext.Provider value={value}>{children}</ProjectSeoContext.Provider>;
}

export function useProjectSeo(): ProjectSeoContextValue {
  const ctx = useContext(ProjectSeoContext);
  if (!ctx) {
    return {
      projectSeo: {},
      setProjectSeo: () => {},
    };
  }
  return ctx;
}
