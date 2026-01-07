'use client';

import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import {List as ListIcon} from '@phosphor-icons/react/dist/ssr/List';
import { Moon as MoonIcon } from '@phosphor-icons/react/dist/ssr/Moon';
import { Sun as SunIcon } from '@phosphor-icons/react/dist/ssr/Sun';
import { useColorScheme } from '@mui/material/styles';
import {UserAvatar, type UserAvatarProps} from '@/components/auth/user-avatar';
import {usePopover} from '@/hooks/use-popover';
import {useUser} from '@/hooks/use-user';
import {logger} from '@/lib/default-logger';
import {MobileNav} from './mobile-nav';
import {UserPopover} from './user-popover';
import { LinearProgressForLevel, } from "@/components/dashboard/misc/linear-progress-with-label";
import {User as UserIcon} from "@phosphor-icons/react/dist/ssr/User";

export function MainNav(): React.JSX.Element {
  const [openNav, setOpenNav] = React.useState<boolean>(false);
  const userPopover = usePopover<HTMLDivElement>();
  const [userPhoto, setUserPhoto] = React.useState<string | null>(null);
  const [showUserInitials, setShowUserInitials] = React.useState(false);
  const [userAvatarProps, setUserAvatarProps] = React.useState<UserAvatarProps>({
    name: '?',
  });
  const { eduquestUser, avatar } = useUser();
  const { mode, setMode } = useColorScheme();


  function formatName(name: string | undefined): string {
    if (!name) return '';

    // Remove the starting and ending #
    return name.replace(/^#|#$/g, '')
  }

  const setUserPhotoAvatar = async (): Promise<void> => {
    if (eduquestUser) {
      try {
        logger.debug("User Avatar: ", avatar);
        if (avatar === '') {
          setShowUserInitials(true);
          setUserAvatarProps({
            name: formatName(eduquestUser.nickname),
            bgColor: 'var(--mui-palette-neutral-900)',
            textColor: "white",
          });
        } else {
          setUserPhoto(avatar);
          setShowUserInitials(false);
        }
      } catch (error) {
        setShowUserInitials(true);
        setUserAvatarProps({
          name: formatName(eduquestUser.nickname),
          bgColor: 'var(--mui-palette-neutral-900)',
          textColor: "white",
        });
        logger.error('Error fetching user photo: ', error)
      }
    }
  };

  // React.useEffect(() => {
  //   const fetchData = async (): Promise<void> => {
  //     await setUserPhotoAvatar();
  //   }
  //   fetchData().catch((error: unknown) => {
  //     logger.error('Failed to fetch data', error);
  //   });
  // }, [eduquestUser]);

  React.useEffect(() => {
    const fetchData = async (): Promise<void> => {
      await setUserPhotoAvatar();
    }
    fetchData().catch((error: unknown) => {
      logger.error('Failed to fetch data', error);
    });
  }, [])

  return (
    <React.Fragment>
      <Box
        component="header"
        sx={{
          borderBottom: '1px solid var(--mui-palette-divider)',
          backgroundColor: 'var(--mui-palette-background-paper)',
          position: 'sticky',
          top: 0,
          zIndex: 'var(--mui-zIndex-appBar)',
        }}
      >
        <Stack
          direction="row"
          spacing={2}
          sx={{ alignItems: 'center', justifyContent: 'space-between', minHeight: '64px', px: 2 }}
        >


          <Stack sx={{ alignItems: 'center' }} direction="row" spacing={2}>
            <IconButton
              onClick={(): void => {
                setOpenNav(true);
              }}
              sx={{ display: { lg: 'none' } }}
            >
              <ListIcon />
            </IconButton>

          </Stack>
          <Stack sx={{ alignItems: 'center' }} direction="row" spacing={2}>
            <IconButton
              aria-label="Toggle dark mode"
              onClick={() => {
                setMode(mode === 'dark' ? 'light' : 'dark');
              }}
              sx={{ color: 'var(--mui-palette-text-primary)' }}
            >
              {mode === 'dark' ? <SunIcon size={22} /> : <MoonIcon size={22} />}
            </IconButton>
            {eduquestUser ?
              <LinearProgressForLevel
                sx={{ width: '200px' }}
                value={eduquestUser.total_points % 100}
                level={`Level ${(Math.floor(eduquestUser.total_points / 100) + 1).toString()}`}
                absValue={eduquestUser.total_points}
              />
              : null}



            {
              showUserInitials ?
                <Box
                  onClick={userPopover.handleOpen}
                  ref={userPopover.anchorRef}
                  sx={{cursor: 'pointer'}}
                >
                  <UserAvatar {...userAvatarProps}/>
                </Box>
                 : userPhoto ?
                <Avatar
                  onClick={userPopover.handleOpen}
                  ref={userPopover.anchorRef}
                  src={userPhoto}
                  sx={{ cursor: 'pointer' }}
                /> : <UserIcon size={32} color="var(--mui-palette-primary-main)" />
            }

          </Stack>
        </Stack>
      </Box>
      <UserPopover anchorEl={userPopover.anchorRef.current} onClose={userPopover.handleClose} open={userPopover.open} />
      <MobileNav
        onClose={() => {
          setOpenNav(false);
        }}
        open={openNav}
      />
    </React.Fragment>
  );
}
