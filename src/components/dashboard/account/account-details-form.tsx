"use client";
import * as React from 'react';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Unstable_Grid2';
import { useUser } from '@/hooks/use-user';
import {UserAvatar, type UserAvatarProps} from "@/components/auth/user-avatar";
import {logger} from "@/lib/default-logger";
import Avatar from "@mui/material/Avatar";
import {FloppyDisk as FloppyDiskIcon} from "@phosphor-icons/react/dist/ssr/FloppyDisk";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import Points from "../../../../public/assets/point.svg";
import Stack from "@mui/material/Stack";
import FormLabel from "@mui/material/FormLabel";
import {TextField} from "@mui/material";
import {User as UserIcon} from "@phosphor-icons/react/dist/ssr/User";
import {updateEduquestUser} from "@/api/services/eduquest-user";

export function AccountDetailsForm(): React.JSX.Element {
  const { eduquestUser, avatar, checkSession } = useUser();
  const nicknameRef = React.useRef<HTMLInputElement>(null);
  const [userPhoto, setUserPhoto] = React.useState<string | null>(null);
  const [showUserInitials, setShowUserInitials] = React.useState(false);
  const [userAvatarProps, setUserAvatarProps] = React.useState<UserAvatarProps>({
    name: '?',
  });
  const [submitStatus, setSubmitStatus] = React.useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const refreshUser = async (): Promise<void> => {
    if (checkSession) {
      await checkSession();
    }
  };


  function formatName(name: string | undefined): string {
    if (!name) return '';
    // Remove the starting and ending #
    return name.replace(/^#|#$/g, '')
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    if (nicknameRef.current?.value) {
      const updatedNickname = {
        nickname: nicknameRef.current?.value,
      };
      if (eduquestUser) {
        try {
          const response = await updateEduquestUser(eduquestUser.id.toString(), updatedNickname);
          logger.debug('Update Success:', response);
          setSubmitStatus({ type: 'success', message: 'Update Successful' });
          await refreshUser();
        } catch (error) {
          logger.error('Update Failed:', error);
        }
      }
    }
  };

  const setUserPhotoAvatar = React.useCallback(async (): Promise<void> => {
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
  }, [avatar, eduquestUser]);

  React.useEffect(() => {
    const fetchData = async (): Promise<void> => {
      await setUserPhotoAvatar();
    }
    fetchData().catch((error: unknown) => {
      logger.error('Failed to fetch data', error);
    });
  }, [eduquestUser, setUserPhotoAvatar]);

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader
          subheader="Update nickname"
          title="Profile"
          avatar={
            showUserInitials ?
              <UserAvatar size='48px' {...userAvatarProps}/>
              : userPhoto ?
              <Avatar
                src={userPhoto}
                sx={{width: 48, height: 48}}
              /> : <UserIcon size={32} color="var(--mui-palette-primary-main)" />
          }
        />

        <Divider/>
        {eduquestUser ? (
          <CardContent>
            <Grid container spacing={3}>
              <Grid sm={6} xs={12}>
                <Typography variant="overline" color="text.secondary">ID</Typography>
                <Typography variant="body2">{eduquestUser.id} </Typography>
              </Grid>
              <Grid sm={6} xs={12}>
                <FormControl>
                  <FormLabel htmlFor="nickname">Nickname</FormLabel>
                  <TextField
                    defaultValue={eduquestUser.nickname}
                    inputRef={nicknameRef}
                    placeholder="Your nickname will be displayed to other users."
                    variant='outlined'
                    size='small'
                  />
                </FormControl>
              </Grid>

              <Grid sm={6} xs={12}>
                <Typography variant="overline" color="text.secondary">First Name</Typography>
                <Typography variant="body2">{eduquestUser.first_name} </Typography>
              </Grid>
              <Grid sm={6} xs={12}>
                <Typography variant="overline" color="text.secondary">Last Name</Typography>
                <Typography variant="body2">{eduquestUser.last_name} </Typography>
              </Grid>
              <Grid sm={6} xs={12}>
                <Typography variant="overline" color="text.secondary">Username</Typography>
                <Typography variant="body2">{eduquestUser.username} </Typography>
              </Grid>
              <Grid sm={6} xs={12}>
                <Typography variant="overline" color="text.secondary">Email address</Typography>
                <Typography variant="body2">{eduquestUser.email} </Typography>
              </Grid>
              <Grid sm={6} xs={12}>
                <Typography variant="overline" color="text.secondary">Total points</Typography>
                <Stack direction="row" spacing='6px' sx={{ alignItems: 'center' }}>
                  <Typography variant="body2">{eduquestUser.total_points}</Typography>
                  <Points height={18}/>
                </Stack>
              </Grid>
              <Grid sm={6} xs={12}>
                <Typography variant="overline" color="text.secondary">Last login</Typography>
                <Typography variant="body2">
                  {new Date(eduquestUser.last_login).toLocaleDateString("en-SG", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit'
                })}
                </Typography>
              </Grid>
              <Grid sm={6} xs={12}>
                <Typography variant="overline" color="text.secondary">Updated at</Typography>
                <Typography variant="body2">
                  {new Date(eduquestUser.updated_at).toLocaleDateString("en-SG", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit'
                })}
                </Typography>
              </Grid>
              <Grid sm={6} xs={12}>
                <Typography variant="overline" color="text.secondary">Is superuser</Typography>
                <Typography variant="body2">{eduquestUser.is_superuser ? "Yes" : "No"} </Typography>
              </Grid>
              <Grid sm={6} xs={12}>
                <Typography variant="overline" color="text.secondary">Is active</Typography>
                <Typography variant="body2">{eduquestUser.is_active ? "Yes" : "No"} </Typography>
              </Grid>
              <Grid sm={6} xs={12}>
                <Typography variant="overline" color="text.secondary">Is staff</Typography>
                <Typography variant="body2">{eduquestUser.is_staff ? "Yes" : "No"} </Typography>
              </Grid>

            </Grid>
          </CardContent>
        ) : null}

        <CardActions sx={{justifyContent: 'flex-end'}}>
          <Button startIcon={<FloppyDiskIcon/>} type="submit" variant="contained">Update</Button>
        </CardActions>
      </Card>
      {submitStatus ? <Alert severity={submitStatus.type} sx={{ marginTop: 2 }}>
        {submitStatus.message}
      </Alert> : null}

    </form>
  );
}
