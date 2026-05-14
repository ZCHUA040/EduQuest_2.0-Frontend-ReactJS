'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { MicrosoftOutlookLogo } from '@phosphor-icons/react/dist/ssr/MicrosoftOutlookLogo';
import { authClient } from '@/lib/auth/client';
import { useUser } from '@/hooks/use-user';
import { paths } from '@/paths';
import { Verifying } from '@/components/dashboard/loading/veryfying';

export function SignInButton(): React.JSX.Element {

  const router = useRouter();
  const { checkSession } = useUser();
  const [isPending, setIsPending] = React.useState<boolean>(false);

  const onSubmit = React.useCallback(
    async (): Promise<void> => {
      setIsPending(true);
      await authClient.signInWithMsal();

      // Refresh the auth state
      await checkSession?.();
      router.refresh();
    },
      [checkSession, router]
  );

  return (
    <Button
      id="signIn"
      fullWidth
      startIcon={<MicrosoftOutlookLogo size="34px" weight="fill"/>}
      disabled={isPending}
      variant="contained"
      onClick={onSubmit}
      sx={{ fontSize: '20px', padding: '20px' }}
    >
      Login with NTU Account
    </Button>
  );
}

export function DemoSignInButton(): React.JSX.Element {
  const router = useRouter();

  const onSubmit = React.useCallback(
    (): void => {
      router.push(paths.auth.demoSignIn);
    },
    [router]
  );

  return (
    <Button
      fullWidth
      variant="outlined"
      onClick={onSubmit}
      sx={{ fontSize: '20px', padding: '20px' }}
    >
      Login with demo account
    </Button>
  );
}

export function DemoSignInForm(): React.JSX.Element {
  const router = useRouter();
  const { checkSession } = useUser();
  const [isPending, setIsPending] = React.useState<boolean>(false);
  const [isVerifying, setIsVerifying] = React.useState<boolean>(false);
  const [email, setEmail] = React.useState<string>('');
  const [password, setPassword] = React.useState<string>('');
  const [error, setError] = React.useState<string | null>(null);

  const onSubmit = React.useCallback(
    async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
      event.preventDefault();
      setIsPending(true);
      setError(null);

      const { error: signInError } = await authClient.signInAsDemo(email, password);

      if (!signInError) {
        setIsVerifying(true);
        await checkSession?.();
        router.replace(paths.dashboard.overview);
        router.refresh();
        return;
      }

      setError(signInError);
      setIsPending(false);
    },
    [checkSession, email, password, router]
  );

  if (isVerifying) {
    return <Verifying />;
  }

  return (
    <Stack component="form" onSubmit={onSubmit} spacing={2}>
      <TextField
        autoComplete="email"
        disabled={isPending}
        fullWidth
        label="Demo email"
        onChange={(event) => { setEmail(event.target.value); }}
        required
        type="email"
        value={email}
      />
      <TextField
        autoComplete="current-password"
        disabled={isPending}
        fullWidth
        label="Demo password"
        onChange={(event) => { setPassword(event.target.value); }}
        required
        type="password"
        value={password}
      />
      {error ? <Alert severity="error">{error}</Alert> : null}
      <Button disabled={isPending} type="submit" variant="outlined">
        Login with demo account
      </Button>
    </Stack>
  );
}
