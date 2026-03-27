import { useCallback, useState } from 'react';
import {
  mkdir,
  writeFile,
  rm,
  mv,
  cp,
  search,
  readdir,
  stat,
} from '@/vfs/vfs';

interface FileOperationsState {
  loading: boolean;
  error: string | null;
}

export function useFileOperations() {
  const [state, setState] = useState<FileOperationsState>({
    loading: false,
    error: null,
  });

  const wrap = useCallback(async <T>(fn: () => Promise<T>): Promise<T | undefined> => {
    setState({ loading: true, error: null });
    try {
      const result = await fn();
      setState({ loading: false, error: null });
      return result;
    } catch (err) {
      setState({ loading: false, error: (err as Error).message });
      return undefined;
    }
  }, []);

  const createFolder = useCallback(
    (parentPath: string, name: string) =>
      wrap(() => mkdir(`${parentPath}/${name}`)),
    [wrap],
  );

  const createFile = useCallback(
    (parentPath: string, name: string) =>
      wrap(() => writeFile(`${parentPath}/${name}`, '')),
    [wrap],
  );

  const deleteItem = useCallback(
    (path: string) => wrap(() => rm(path)),
    [wrap],
  );

  const moveItem = useCallback(
    (fromPath: string, toPath: string) =>
      wrap(() => mv(fromPath, toPath)),
    [wrap],
  );

  const copyItem = useCallback(
    (fromPath: string, toPath: string) =>
      wrap(() => cp(fromPath, toPath)),
    [wrap],
  );

  const searchFiles = useCallback(
    (query: string, dirPath?: string) =>
      wrap(() => search(query, dirPath)),
    [wrap],
  );

  const listDir = useCallback(
    (dirPath: string) => wrap(() => readdir(dirPath)),
    [wrap],
  );

  const getStat = useCallback(
    (path: string) => wrap(() => stat(path)),
    [wrap],
  );

  const renameItem = useCallback(
    (path: string, newName: string) => {
      const parts = path.split('/');
      parts.pop();
      const newPath = parts.join('/') + '/' + newName;
      return wrap(() => mv(path, newPath));
    },
    [wrap],
  );

  return {
    ...state,
    createFolder,
    createFile,
    deleteItem,
    moveItem,
    copyItem,
    searchFiles,
    listDir,
    getStat,
    renameItem,
    clearError: () => setState((s) => ({ ...s, error: null })),
  };
}
