import { useState, useEffect } from 'react';
import api from '@/lib/axios';

export function useFeatureBanner(featureKey) {
  const [feature, setFeature] = useState(null);
  useEffect(() => {
    api.get(`/megamenu-features/by-key/${featureKey}`)
      .then(r => setFeature(r.data))
      .catch(() => {});
  }, [featureKey]);
  return feature;
}
