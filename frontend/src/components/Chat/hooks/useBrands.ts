import { useEffect, useState } from "react";
import { axiosInstance1 } from "@/utils/axiosInstance";

export const useBrands = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoadingBrands, setIsLoadingBrands] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    const fetchBrands = async () => {
      try {
        setIsLoadingBrands(true);
        const response = await axiosInstance1.get("/api/cargpt/brands/");
        if (!isMounted) return;
        setBrands(response?.data ?? []);
      } catch (error) {
        // No-op: callers can handle empty brand list
      } finally {
        if (isMounted) setIsLoadingBrands(false);
      }
    };
    fetchBrands();
    return () => {
      isMounted = false;
    };
  }, []);

  return { brands, isLoadingBrands, setBrands };
};


