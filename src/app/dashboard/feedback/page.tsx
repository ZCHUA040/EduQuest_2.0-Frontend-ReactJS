import * as React from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

export default function Page(): React.JSX.Element {
  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={3}>
        <Stack>
          <Typography variant="h4">Feedback</Typography>
        </Stack>
      </Stack>
      <iframe
        src="https://docs.google.com/forms/d/e/1FAIpQLScMAsJrJ4RD_M73artYKLvSHacW7AimYUOxDOdY-OqhCBn6Bw/viewform?usp=sharing&ouid=101992332141641833333"
        width="640"
        height="1200"
        title="Feedback Form"
        style={{ border: 0 }}
      >
        Loading…
      </iframe>
    </Stack>
  );
}
