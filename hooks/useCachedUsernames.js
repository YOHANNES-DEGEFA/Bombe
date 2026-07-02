import { useEffect, useState, useMemo } from "react";
import { getCachedUsers, buildUsernameMap } from "../lib/cachedUsers";

export function useCachedUsernames(userIds) {
  const stableIds = useMemo(
    () => [...new Set((userIds || []).filter(Boolean))].sort().join(","),
    [userIds]
  );

  const [usernames, setUsernames] = useState({});
  const [loading, setLoading] = useState(Boolean(stableIds));

  useEffect(() => {
    const ids = stableIds ? stableIds.split(",") : [];
    if (ids.length === 0) {
      setUsernames({});
      setLoading(false);
      return;
    }

    let isMounted = true;
    setLoading(true);

    getCachedUsers(ids)
      .then((profiles) => {
        if (!isMounted) return;
        setUsernames(buildUsernameMap(profiles));
      })
      .catch((error) => {
        console.error("Error resolving usernames:", error);
        if (!isMounted) return;
        setUsernames({});
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [stableIds]);

  return { usernames, loading };
}
