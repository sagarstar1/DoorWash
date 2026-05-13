import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

export function useBookings({ role = 'customer', status, limit = 10 } = {}) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  const fetch = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit });
    if (status && status !== 'all') params.set('status', status);
    const endpoint = role === 'worker'
      ? `/bookings/worker/assigned?${params}`
      : role === 'admin'
      ? `/bookings/admin/all?${params}`
      : `/bookings/my?${params}`;
    api.get(endpoint)
      .then(r => { setBookings(r.data.bookings); setTotal(r.data.total); })
      .finally(() => setLoading(false));
  }, [role, status, page, limit]);

  useEffect(() => { fetch(); }, [fetch]);

  return { bookings, setBookings, loading, total, page, setPage, refetch: fetch };
}
