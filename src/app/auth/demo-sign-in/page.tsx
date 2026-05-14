'use client';

import * as React from 'react';
import RouterLink from 'next/link';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { paths } from '@/paths';
import { GuestGuard } from '@/components/auth/guest-guard';
import { Layout } from '@/components/auth/layout';
import { DemoSignInForm } from '@/components/auth/sign-in-button';

export default function Page(): React.JSX.Element {
  return (
    <Layout>
      <GuestGuard>
        <Stack spacing={4} sx={{ width: '100%' }}>
          <Stack spacing={1}>
            <Typography align="center" variant="h6">
              Demo Account Login
            </Typography>
            <Typography align="center" color="text.secondary" variant="body2">
              Sign in with the provided demo credentials.
            </Typography>
          </Stack>
          <DemoSignInForm />
          <Button component={RouterLink} href={paths.auth.signIn} variant="text">
            Back to NTU login
          </Button>
        </Stack>
      </GuestGuard>
    </Layout>
  );
}
