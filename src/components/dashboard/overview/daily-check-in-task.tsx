'use client';

import * as React from 'react';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { CalendarCheck as CalendarCheckIcon } from '@phosphor-icons/react/dist/ssr/CalendarCheck';
import { CheckCircle as CheckCircleIcon } from '@phosphor-icons/react/dist/ssr/CheckCircle';
import { Circle as CircleIcon } from '@phosphor-icons/react/dist/ssr/Circle';
import type { EduquestUser } from '@/types/eduquest-user';
import { dailyCheckIn } from '@/api/services/eduquest-user';
import { logger } from '@/lib/default-logger';

interface DailyCheckInTaskProps {
  eduquestUser: EduquestUser;
  onCheckedIn?: () => Promise<void>;
}

const toSgDate = (date: Date): string =>
  date.toLocaleDateString('en-CA', { timeZone: 'Asia/Singapore' });

export function DailyCheckInTask({ eduquestUser, onCheckedIn }: DailyCheckInTaskProps): React.JSX.Element {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [message, setMessage] = React.useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);

  const checkedInToday = React.useMemo(() => {
    const today = toSgDate(new Date());
    const lastCheckInDate = eduquestUser.daily_checkin_last_date;
    return Boolean(lastCheckInDate) && lastCheckInDate === today;
  }, [eduquestUser.daily_checkin_last_date]);

  const handleCheckIn = async (): Promise<void> => {
    setIsSubmitting(true);
    setMessage(null);
    try {
      const result = await dailyCheckIn();
      const streakText = `Streak: ${String(result.current_streak)} day(s).`;
      const bonusText = result.streak_bonus_awarded > 0
        ? ` Bonus +${String(result.streak_bonus_awarded)} points.`
        : '';
      if (result.checked_in) {
        setMessage({
          type: 'success',
          text: `Checked in! +${String(result.daily_points_awarded)} points.${bonusText} ${streakText}`,
        });
      } else {
        setMessage({
          type: 'success',
          text: `Already checked in today. ${streakText}`,
        });
      }
      if (onCheckedIn) {
        await onCheckedIn();
      }
    } catch (error: unknown) {
      logger.error('Daily check-in failed', error);
      setMessage({
        type: 'error',
        text: 'Unable to check in now. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card sx={{ height: '100%' }}>
      <CardHeader
        title="Daily Task"
        subheader="Check in once per day to earn points and build your streak."
        avatar={<CalendarCheckIcon fontSize="var(--icon-fontSize-md)" color="var(--mui-palette-primary-main)" />}
      />
      <CardContent>
        <Stack spacing={1}>
          <List disablePadding>
            <ListItemButton
              onClick={() => {
                setDialogOpen(true);
              }}
              sx={{ px: 1 }}
            >
              <Stack direction="row" alignItems="center" spacing={1} sx={{ width: '100%' }}>
                {checkedInToday ? <CheckCircleIcon color="var(--mui-palette-success-main)" /> : <CircleIcon color="var(--mui-palette-neutral-400)" />}
                <ListItemText
                  primary="Check in"
                  secondary={`Streak: ${String(eduquestUser.daily_checkin_streak)} day(s)`}
                />
                <Chip
                  label={checkedInToday ? 'Done' : 'Pending'}
                  color={checkedInToday ? 'success' : 'default'}
                  size="small"
                />
              </Stack>
            </ListItemButton>
          </List>
          <Typography variant="caption" color="text.secondary">
            Resets daily at 00:00 SGT.
          </Typography>
          {message ? <Alert severity={message.type}>{message.text}</Alert> : null}
        </Stack>
      </CardContent>

      <Dialog open={dialogOpen} onClose={() => { setDialogOpen(false); }} fullWidth maxWidth="sm">
        <DialogTitle>Check in</DialogTitle>
        <DialogContent>
          <Stack spacing={1}>
            <Typography variant="body2" color="text.secondary">
              Check in once daily to earn +5 points.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Every 7-day streak gives +20 bonus points.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Current streak: {String(eduquestUser.daily_checkin_streak)} day(s)
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Resets daily at 00:00 SGT.
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setDialogOpen(false); }}>Close</Button>
          <Button
            variant="contained"
            onClick={() => { void handleCheckIn(); }}
            disabled={isSubmitting || checkedInToday}
          >
            {checkedInToday ? 'Checked In' : 'Check In Now'}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}
