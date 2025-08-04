import { axiosInstance1 } from '@/utils/axiosInstance';
import { useEffect, useState } from 'react';
// comment here
const useApi = (url:string, method:"post"|"get"|"delete"|"put", options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!url) return;

    const controller = new AbortController();
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await axiosInstance1[method](url, {
          signal: controller.signal,
          ...options,
        });

       

        
        setData(response);
      } catch (err:any) {
        if (err.name !== 'AbortError') {
          setError(err.message || 'Something went wrong');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Cleanup if the component unmounts
    return () => controller.abort();
  }, [url, JSON.stringify(options)]); // use JSON.stringify to handle object deps

  return { data, loader:loading, error };
};

export default useApi;
