'use client';
import * as React from 'react';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { DemoSignInButton, SignInButton } from '@/components/auth/sign-in-button';
import { useTheme } from '@mui/material/styles';
import { CheckSquareOffset as CheckSquareOffsetIcon } from "@phosphor-icons/react/dist/ssr/CheckSquareOffset";
import { Ranking as RankingIcon } from "@phosphor-icons/react/dist/ssr/Ranking";
import { Medal as MedalIcon } from "@phosphor-icons/react/dist/ssr/Medal";

import Box from "@mui/material/Box";

interface SignInFormProps {
  error: string | null;
}

export function SignInForm({ error }: SignInFormProps): React.JSX.Element {
  const theme = useTheme();

  return (
    <Stack spacing={4} >
      <Typography align="center" variant="h6">
        Welcome to EduQuest!
      </Typography>
      <Typography align="center" variant="body1">
        A platform for you to learn and earn.
      </Typography>
      <SignInButton />
      <DemoSignInButton />
      { error ? <Alert severity="error">{error}</Alert>
        :
        <Alert severity="info">
          Only users with {' '}
          <Typography component="span" sx={{ fontWeight: 700 }} variant="inherit">
            NTU 365 Account
          </Typography>{' '}
          have access to this site.
        </Alert>
      }


      {/*<Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>*/}
      <Stack spacing={3} px={3}>
        <Stack spacing={1} direction="row">
          <CheckSquareOffsetIcon size={20} color={theme.palette.primary.main} />
          <Box>
            <Typography variant="body2" fontWeight={600} gutterBottom>Complete</Typography>
            <Typography variant="body2">Finish quests to earn points, level up, and unlock new challenges.</Typography>
          </Box>
        </Stack>
        <Stack spacing={1} direction="row" >
          <RankingIcon size={20} color={theme.palette.primary.main} />
          <Box>
            <Typography variant="body2" gutterBottom fontWeight={600}>Compete</Typography>
            <Typography variant="body2">Challenge peers and climb the leaderboard to showcase your achievements.</Typography>
          </Box>
        </Stack>
        <Stack spacing={1} direction="row">
          <MedalIcon size={20} color={theme.palette.primary.main} />
          <Box>
            <Typography variant="body2" gutterBottom fontWeight={600}>Collect</Typography>
            <Typography variant="body2">Earn exclusive badges by completing challenging quests and mastering courses.</Typography>
          </Box>
        </Stack>
      </Stack>




    </Stack>
  );
}
