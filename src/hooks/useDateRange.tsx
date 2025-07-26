import { useState } from 'react';
import { subDays, format } from 'date-fns';

export function useDateRange(initialDays = 30) {
  const [from, setFrom] = useState<Date>(subDays(new Date(), initialDays));
  const [to, setTo] = useState<Date>(new Date());

  const isoFrom = format(from, 'yyyy-MM-dd');
  const isoTo = format(to, 'yyyy-MM-dd');

  return { from, to, setFrom, setTo, isoFrom, isoTo };
}
