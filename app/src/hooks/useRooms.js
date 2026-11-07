import { useCallback, useState } from 'react';
import * as roomService from '../services/roomService';

export default function useRooms() {
  const [rooms, setRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // showLoading = true troca a lista pelo indicador de carregamento
  const reload = useCallback(async (showLoading = false) => {
    if (showLoading) setIsLoading(true);
    setError('');

    try {
      setRooms(await roomService.listRooms());
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { rooms, isLoading, error, reload };
}