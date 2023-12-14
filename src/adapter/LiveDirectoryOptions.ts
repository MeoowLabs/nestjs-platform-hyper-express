import { Stats } from 'fs';

import { WatchOptions } from 'chokidar';

type FilterFunction = (path: string, stats: Stats) => boolean;

interface FilterProperties {
  names?: string[];
  extensions?: string[];
}

export interface LiveDirectoryOptions {
  directory: string;
  static?: boolean;
  watcher?: WatchOptions;
  cache?: {
    max_file_count?: number;
    max_file_size?: number;
  };
  filter?: {
    keep?: FilterFunction | FilterProperties;
    ignore?: FilterFunction | FilterProperties;
  };
}
