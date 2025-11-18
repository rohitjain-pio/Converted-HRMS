import { PropsWithChildren, useEffect } from "react";
import { FeatureFlagMap, useFeatureFlagStore } from "@/store/featureFlagStore";
import useAsync from "@/hooks/useAsync";
import methods from "@/utils";
import axios from "axios";
import { FEATURE_FLAGS_URL } from "@/utils/constants";

function isExistingFeatureFlag(key: string, flags: FeatureFlagMap) {
  return Object.keys(flags).includes(key);
}

declare global {
  interface Window {
    featureFlags?: FeatureFlagMap;
  }
}

export type FeatureFlagsConfig = {
  flags: FeatureFlagMap;
  version: string;
};

export function FeatureFlagProvider({ children }: PropsWithChildren) {
  const { setFlag, mergeRemoteFlags, flags } = useFeatureFlagStore();

  const { data: remote } = useAsync<FeatureFlagsConfig>({
    requestFn: async (): Promise<FeatureFlagsConfig> => {
      return await axios.get(FEATURE_FLAGS_URL);
    },
    onError: (err) => {
      methods.throwApiError(err);
    },
    autoExecute: true,
  });

  useEffect(() => {
    if (remote) {
      mergeRemoteFlags(remote);
    }
  }, [remote, mergeRemoteFlags]);

  useEffect(() => {
    const handler = {
      set(_: unknown, prop: string, value: boolean) {
        if (!isExistingFeatureFlag(prop, flags)) {
          console.error(
            `[FeatureFlags] Feature flag "${prop}" is not a known flag`
          );
          return false;
        }
        setFlag(prop, value);
        console.log(`[FeatureFlags] "${prop}" set to`, value);
        return true;
      },
    };

    window.featureFlags = new Proxy<FeatureFlagMap>({}, handler);

    return () => {
      delete window.featureFlags;
    };
  }, [setFlag]);

  return <>{children}</>;
}
