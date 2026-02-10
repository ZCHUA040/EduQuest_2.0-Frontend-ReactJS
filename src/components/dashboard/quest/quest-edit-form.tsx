"use client"
import * as React from 'react';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { XCircle as XCircleIcon } from '@phosphor-icons/react/dist/ssr/XCircle';
import { logger } from '@/lib/default-logger'
import type { Quest } from '@/types/quest';
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import Divider from "@mui/material/Divider";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Unstable_Grid2";
import FormControl from "@mui/material/FormControl";
import Select, {type SelectChangeEvent} from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Chip from "@mui/material/Chip";
import {CardMedia, TextField} from "@mui/material";
import CardActions from "@mui/material/CardActions";
import {Trash as TrashIcon} from "@phosphor-icons/react/dist/ssr/Trash";
import {FloppyDisk as FloppyDiskIcon} from "@phosphor-icons/react/dist/ssr/FloppyDisk";
import {paths} from "@/paths";
import {useRouter} from "next/navigation";
import {useUser} from "@/hooks/use-user";
import type {Image} from "@/types/image";
import FormLabel from "@mui/material/FormLabel";
import {useTheme} from "@mui/material/styles";
import Tooltip from "@mui/material/Tooltip";
import {Info as InfoIcon} from "@phosphor-icons/react/dist/ssr/Info";
import {getImages} from "@/api/services/image";
import {type CourseGroup} from "@/types/course-group";
import {getNonPrivateCourseGroups} from "@/api/services/course-group";
import {deleteQuest, updateQuest} from "@/api/services/quest";
import {User as UserIcon} from "@phosphor-icons/react/dist/ssr/User";

interface QuestEditFormProps {
  quest: Quest
  setSubmitStatus: React.Dispatch<React.SetStateAction<{ type: 'success' | 'error'; message: string } | null>>;
  toggleForm: () => void;
  onUpdateSuccess: () => void;
  onStatusChange: (status: string) => void;
}

export default function QuestEditForm( {quest, toggleForm, setSubmitStatus, onUpdateSuccess } : QuestEditFormProps ): React.JSX.Element {
  const router = useRouter();
  const { eduquestUser } = useUser();
  const theme = useTheme();
  const [images, setImages] = React.useState<Image[]>();
  const [courseGroups, setCourseGroups] = React.useState<CourseGroup[]>();

  const [selectedCourseGroup, setSelectedCourseGroup] = React.useState<CourseGroup | null>(null);
  const [selectedImage, setSelectedImage] = React.useState<Image | null>(null);

  const questTypeRef = React.useRef<HTMLInputElement>(null);
  const questNameRef = React.useRef<HTMLInputElement>(null);
  const questDescriptionRef = React.useRef<HTMLInputElement>(null);
  const questMaxAttemptsRef = React.useRef<HTMLInputElement>(null);
  const questStatusRef = React.useRef<HTMLInputElement>(null);
  const questExpirationDateRef = React.useRef<HTMLInputElement>(null);
  const questTutorialDateRef = React.useRef<HTMLInputElement>(null);
  const questImageIdRef = React.useRef<HTMLInputElement>(null);


  const fetchImages = async (): Promise<void> => {
    try {
      const response = await getImages()
      setImages(response);
    } catch (error: unknown) {
      logger.error('Failed to fetch images', error);
    }
  }

  const fetchCourseGroups = async (): Promise<void> => {
    try {
      const response = await getNonPrivateCourseGroups()
      setCourseGroups(response);
    } catch (error: unknown) {
      logger.error('Failed to fetch course groups', error);
    }
  }


  const handleCourseGroupChange = (event: SelectChangeEvent<number>): void => {
    const courseGroupId = Number(event.target.value);
    const newCourseGroup = courseGroups?.find(cg => cg.id === courseGroupId) || null;
    setSelectedCourseGroup(newCourseGroup);
  };

  const handleImageChange = (event: SelectChangeEvent<number>): void => {
    const imageId = Number(event.target.value);
    const newImage = images?.find(i => i.id === imageId) || null;
    setSelectedImage(newImage);
  };


  const handleQuestSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    const updatedQuest = {
      type: questTypeRef.current?.value,
      name: questNameRef.current?.value,
      description: questDescriptionRef.current?.value,
      status: questStatusRef.current?.value,
      expiration_date: questExpirationDateRef.current?.value
        ? new Date(questExpirationDateRef.current.value).toISOString()
        : null,
      tutorial_date: questTutorialDateRef.current?.value
        ? new Date(questTutorialDateRef.current.value).toISOString()
        : null,
      max_attempts: questMaxAttemptsRef.current?.value as unknown as number,
      course_group_id: selectedCourseGroup?.id as unknown as number,
      image_id: selectedImage?.id as unknown as number
    };

    try {
      await updateQuest(quest.id.toString(), updatedQuest);
      // logger.debug('Update Success:', response);
      setSubmitStatus({ type: 'success', message: 'Update Successful' });
      toggleForm();
      onUpdateSuccess();
    } catch (error: unknown) {
      logger.error('Submit Error:', error);
      setSubmitStatus({type: 'error', message: 'Update Failed. Please try again.'});
    }
  };


  const handleDeleteQuest = async (): Promise<void> => {
    try {
      await deleteQuest(quest.id.toString());
      const redirectPath = quest.type === 'Private'
        ? paths.dashboard.generator.quest
        : paths.dashboard.quest.all;
      router.push(redirectPath as string);
    } catch (error: unknown) {
        logger.error('Failed to delete the quest', error);
        setSubmitStatus({type: 'error', message: 'Delete Failed. Please try again.'});
    }
  };

  React.useEffect(() => {
    const fetchData = async (): Promise<void> => {
      await fetchImages();
      await fetchCourseGroups();
    };

    fetchData().catch((error: unknown) => {
      logger.error('Failed to fetch data', error);
    });
  }, []);


  return (
    <form onSubmit={handleQuestSubmit}>
      {quest ?
        <Card>
          <CardHeader
            title="Edit Quest Details"
            subheader={`ID: ${quest.id.toString()}`}
            action={
              eduquestUser?.is_staff ?
                <Stack direction="row" spacing={2} sx={{alignItems: 'center'}}>
                  <Button startIcon={<XCircleIcon fontSize="var(--icon-fontSize-md)"/>} color="error"
                          onClick={toggleForm}>
                    Cancel
                  </Button>
                </Stack> : null
            }
          />
          <Divider/>

          <CardContent>


            <Grid container spacing={3}>
              <Grid md={6} xs={12}>
                <FormControl fullWidth required>
                  <FormLabel htmlFor="quest name">Quest Name</FormLabel>
                  <TextField
                    defaultValue={quest.name}
                    inputRef={questNameRef}
                    placeholder="The name of the quest"
                    variant='outlined'
                    size='small'
                  />
                </FormControl>
              </Grid>
              <Grid md={6} xs={12}>
                <FormControl fullWidth required>
                  <FormLabel htmlFor="quest max attempts">Quest Maximum Attempts</FormLabel>
                  <TextField
                    defaultValue={quest.max_attempts}
                    inputRef={questMaxAttemptsRef}
                    type="number"
                    variant='outlined'
                    size='small'
                    inputProps={{ min: 1 }}
                  />
                </FormControl>
              </Grid>
              <Grid md={6} xs={12}>
                <FormControl fullWidth required>
                  <Stack direction="row" sx={{ alignItems: 'center' }} spacing={1}>
                    <FormLabel htmlFor="quest type">Quest Type</FormLabel>
                    <Tooltip title={
                      <Typography variant="inherit">
                        <strong>Eduquest MCQ</strong> Quest developed from EduQuest<br />
                        <strong>Wooclap:</strong> Quest imported from Wooclap<br />
                        <strong>Kahoot!:</strong> Quest imported from Kahoot!<br />
                        <strong>Private:</strong> Quest for personal quest generation use only
                      </Typography>
                    } placement="top">
                      <InfoIcon fontSize="var(--icon-fontSize-sm)" style={{ marginBottom: '8px', cursor: 'pointer', color: 'var(--mui-palette-neutral-500)' }} />
                    </Tooltip>
                  </Stack>
                  <Select defaultValue={quest.type ?? ""} label="Quest Type" inputRef={questTypeRef} name="type" size="small">
                    <MenuItem value="Eduquest MCQ">
                      <Chip variant="outlined" label="Eduquest MCQ" color="primary" size="small"/>
                    </MenuItem>
                    <MenuItem value="Private">
                      <Chip variant="outlined" label="Private" color="secondary" size="small"/>
                    </MenuItem>
                    <MenuItem value="Kahoot!">
                      <Chip variant="outlined" label="Kahoot!" color="violet" size="small"/>
                    </MenuItem>
                    <MenuItem value="Wooclap">
                      <Chip variant="outlined" label="Wooclap" color="neon" size="small"/>
                    </MenuItem>
                  </Select>

                </FormControl>
              </Grid>
              <Grid md={6} xs={12}>
                <FormControl fullWidth required>
                  <FormLabel htmlFor="quest status">Quest Status</FormLabel>
                  <Select value={quest.status ?? ""} label="Quest Status" inputRef={questStatusRef} name="status" size="small">
                    <MenuItem value="Active">
                      <Chip variant="outlined" label="Active" color="success" size="small"/>
                    </MenuItem>
                    <MenuItem value="Expired">
                      <Chip variant="outlined" label="Expired" color="secondary" size="small"/>
                    </MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid md={6} xs={12}>
                <FormControl fullWidth>
                  <Stack direction="row" sx={{ alignItems: 'center' }} spacing={1}>
                    <FormLabel htmlFor="quest expiry date">Quest Expiry Date</FormLabel>
                    <Tooltip title="Optional: When the expiry date is reached, the quest status will be set to 'Expired'." placement="right">
                      <InfoIcon style={{ marginBottom: '8px',cursor: 'pointer', color: 'var(--mui-palette-neutral-500)' }} />
                    </Tooltip>
                  </Stack>
                  <TextField
                    defaultValue={quest.expiration_date ?
                      new Date(new Date(quest.expiration_date).getTime() - (new Date().getTimezoneOffset() * 60000))
                        .toISOString()
                        .slice(0, 16) // Convert to local time and format to 'YYYY-MM-DDTHH:MM'
                      : ''}
                    inputRef={questExpirationDateRef}
                    name="Quest Expiry Date"
                    type="datetime-local"
                    variant='outlined'
                    size='small'
                  />

                </FormControl>
              </Grid>
              <Grid md={6} xs={12}>
                <FormControl fullWidth>
                  <Stack direction="row" sx={{ alignItems: 'center' }} spacing={1}>
                    <FormLabel htmlFor="quest tutorial date">Quest Tutorial Date</FormLabel>
                    <Tooltip title="Optional: The date and time of the tutorial session conducted" placement="right">
                      <InfoIcon style={{ marginBottom: '8px',cursor: 'pointer', color: 'var(--mui-palette-neutral-500)' }} />
                    </Tooltip>
                  </Stack>
                  <TextField
                    defaultValue={quest.tutorial_date ?
                      new Date(new Date(quest.tutorial_date).getTime() - (new Date().getTimezoneOffset() * 60000))
                        .toISOString()
                        .slice(0, 16) // Convert to local time and format to 'YYYY-MM-DDTHH:MM'
                      : ''}
                    inputRef={questTutorialDateRef}
                    name="Quest Tutorial Date"
                    type="datetime-local"
                    variant='outlined'
                    size='small'
                  />
                </FormControl>
              </Grid>
              <Grid xs={12}>
                <FormControl fullWidth required>
                  <FormLabel htmlFor="quest description">Quest Description</FormLabel>
                  <TextField
                    defaultValue={quest.description}
                    inputRef={questDescriptionRef}
                    placeholder="The description of the quest"
                    variant='outlined'
                    multiline
                    rows={3}
                    />
                </FormControl>
              </Grid>

            </Grid>

            <Divider sx={{my: 4}}/>

            <Typography sx={{my: 3}} variant="h6">Thumbnail</Typography>

            {images ?
              <Grid container spacing={3}>
                <Grid container md={6} xs={12} alignItems="flex-start">
                  <Grid md={6} xs={12}>
                    <FormControl required>
                      <FormLabel htmlFor="image id">Thumbnail ID</FormLabel>
                      <Select defaultValue={quest.image.id ?? ""} onChange={handleImageChange} inputRef={questImageIdRef}
                              label="Thumbnail ID" variant="outlined" type="number" size="small">
                        {images.map((option) => (
                          <MenuItem key={option.id} value={option.id}>
                            {option.id} - {option.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid md={6} xs={12} sx={{display: {xs: 'none', md: 'block'}}}/>
                  <Grid md={6} xs={12}>
                    <Typography variant="overline" color="text.secondary">Thumbnail Name</Typography>
                    <Typography variant="body2">{selectedImage?.name || quest.image.name}</Typography>
                  </Grid>
                  <Grid md={6} xs={12}>
                    <Typography variant="overline" color="text.secondary">Thumbnail Filename</Typography>
                    <Typography variant="body2">{selectedImage?.filename || quest.image.filename}</Typography>
                  </Grid>
                </Grid>

                <Grid md={6} xs={12}>
                  <Typography variant="overline" color="text.secondary">Thumbnail Preview</Typography>
                  <CardMedia
                    component="img"
                    alt={selectedImage?.name || quest.image.name}
                    image={`/assets/${selectedImage?.filename || quest.image.filename}`}
                    sx={{ backgroundColor: theme.palette.background.level1, border: `1px solid ${theme.palette.neutral[200]}`, borderRadius: '8px' }}
                  />
                </Grid>
              </Grid> : null}

            <Divider sx={{my: 4}}/>

            <Typography sx={{my: 3}} variant="h6">Associated Course Group</Typography>
            {courseGroups ?
              <Grid container spacing={3}>
                <Grid container md={6} xs={12}>
                  <Grid md={6} xs={12}>
                    <FormControl required>
                      <FormLabel htmlFor="group-id">Group ID</FormLabel>
                      <Select defaultValue={quest.course_group.id ?? ""} onChange={handleCourseGroupChange}
                              label="Group ID" variant="outlined" type="number" size="small">
                        {courseGroups.map((option) => (
                          <MenuItem key={option.id} value={option.id}>
                            {`${option.id.toString()} - [${option.name}] ${option.course.code} ${option.course.name}`}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid md={6} xs={12} sx={{display: {xs: 'none', md: 'block'}}}/>
                  <Grid md={6} xs={12}>
                    <Typography variant="overline" color="text.secondary">Group Name</Typography>
                    <Typography variant="body2">{selectedCourseGroup?.name || quest.course_group.name}</Typography>
                  </Grid>
                  <Grid md={6} xs={12}>
                    <Typography variant="overline" color="text.secondary">Group Session Day</Typography>
                    <Typography variant="body2">{selectedCourseGroup?.session_day || quest.course_group.session_day}</Typography>
                  </Grid>
                  <Grid md={6} xs={12}>
                    <Typography variant="overline" color="text.secondary">Group Session Time</Typography>
                    <Typography variant="body2">{selectedCourseGroup?.session_time || quest.course_group.session_time}</Typography>
                  </Grid>
                  <Grid md={6} xs={12}>
                    <Typography variant="overline" color="text.secondary">Instructor</Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <UserIcon size={18}/>
                      <Typography variant="body2">{selectedCourseGroup?.instructor.nickname || quest.course_group.instructor.nickname}</Typography>
                    </Stack>

                  </Grid>
                </Grid>
              </Grid> : null}



          </CardContent>

          <CardActions sx={{justifyContent: 'space-between'}}>
            <Button startIcon={<TrashIcon/>} color="error" onClick={handleDeleteQuest}>Delete Quest</Button>
            <Button startIcon={<FloppyDiskIcon/>} type="submit" variant="contained">Update Quest</Button>
          </CardActions>
        </Card>
       : null }

    </form>
  );
}
