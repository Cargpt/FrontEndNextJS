import { useEffect, useState } from "react";
import { axiosInstance1 } from "@/utils/axiosInstance";

export const usePreferences = (shouldFetch: boolean) => {
  const [preferences, setPreferences] = useState<any[]>([]);
  const [isLoadingPreferences, setIsLoadingPreferences] = useState<boolean>(false);

  useEffect(() => {
    if (!shouldFetch) return;

    let isMounted = true;
    const fetchPreference = async () => {
      try {
        setIsLoadingPreferences(true);
        const response = await axiosInstance1.get("/api/cargpt/preferences/");
        if (!isMounted) return;
        setPreferences(response ?? []);
      } catch (error) {
        // Silently ignore; consumer can show fallback UI
      } finally {
        if (isMounted) setIsLoadingPreferences(false);
      }
    };

    fetchPreference();
    return () => {
      isMounted = false;
    };
  }, [shouldFetch]);

  return { preferences, isLoadingPreferences };
};


