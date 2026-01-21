'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import { GithubLogo as GithubIcon } from "@phosphor-icons/react/dist/ssr/GithubLogo";
import { LinkedinLogo as LinkedInIcon } from "@phosphor-icons/react/dist/ssr/LinkedinLogo";
import Stack from "@mui/material/Stack";

export function Footer(): React.JSX.Element {
  return (
    <Box
      component="footer"
      sx={(theme) => ({
        pt: 3,
        pb: 4,
        px: 2,
        mt: 40,
        backgroundColor: theme.palette.background.paper,
        borderTop: `1px solid ${theme.palette.divider}`,
        textAlign: 'center',
        flexShrink: 0,
      })}
    >
      <Typography variant="body2" color="textSecondary">
        © 2026 EduQuest. All rights reserved.
      </Typography>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          gap: 4,
          mt: 2,
          flexWrap: 'wrap',
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <GithubIcon />
          <Link
            href="https://github.com/ZCHUA040"
            target="_blank"
            rel="noopener noreferrer"
            underline="hover"
            color="inherit"
            variant="body2"
          >
            Github
          </Link>
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center">
          <LinkedInIcon/>
          <Link
            href="https://www.linkedin.com/in/zhi-li-chua/"
            target="_blank"
            rel="noopener noreferrer"
            underline="hover"
            color="inherit"
            variant="body2"
          >
            LinkedIn
          </Link>
        </Stack>
      </Box>
    </Box>
  );
}
