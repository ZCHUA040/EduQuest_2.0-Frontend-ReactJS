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
import {logger} from "@/lib/default-logger";
import Typography from "@mui/material/Typography";
import Select, { type SelectChangeEvent} from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Alert from "@mui/material/Alert";
import { useUser } from "@/hooks/use-user";
import { FilePlus as FilePlusIcon } from '@phosphor-icons/react/dist/ssr/FilePlus';
import {CardMedia, TextField} from "@mui/material";
import type {Image} from "@/types/image";
import Chip from "@mui/material/Chip";
import FormLabel from "@mui/material/FormLabel";
import {useTheme} from "@mui/material/styles";
import Tooltip from "@mui/material/Tooltip";
import {Info as InfoIcon} from "@phosphor-icons/react/dist/ssr/Info";
import Stack from "@mui/material/Stack";
import {getImages} from "@/api/services/image";
import {createQuest} from "@/api/services/quest";
import {getCourseGroup, getNonPrivateCourseGroups} from "@/api/services/course-group";
import {type CourseGroup} from "@/types/course-group";
import {User as UserIcon} from "@phosphor-icons/react/dist/ssr/User";
import Skeleton from "@mui/material/Skeleton";

interface CourseFormProps {
  onFormSubmitSuccess: (courseGroupId: string) => void;
  courseGroupId: string | null;
}

export function QuestNewForm({onFormSubmitSuccess, courseGroupId}: CourseFormProps): React.JSX.Element {
  const { eduquestUser} = useUser();
  const theme = useTheme();
  const questTypeRef = React.useRef<HTMLInputElement>(null);
  const questNameRef = React.useRef<HTMLInputElement>(null);
  const questExpirationDateRef = React.useRef<HTMLInputElement>(null);
  const questTutorialDateRef = React.useRef<HTMLInputElement>(null);
  const questDescriptionRef = React.useRef<HTMLInputElement>(null);
  const questStatusRef = React.useRef<HTMLInputElement>(null);
  const questImageIdRef = React.useRef<HTMLInputElement>(null);
  const questMaxAttemptsRef = React.useRef<HTMLInputElement>(null);

  const [courseGroups, setCourseGroups] = React.useState<CourseGroup[]>();
  const [images, setImages] = React.useState<Image[]>();

  const [selectedCourseGroup, setSelectedCourseGroup] = React.useState<CourseGroup | null>(null);
  const [selectedImage, setSelectedImage] = React.useState<Image | null>(null);
  const [submitStatus, setSubmitStatus] = React.useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [isImagesLoading, setIsImagesLoading] = React.useState<boolean>(true);
  const [isCourseGroupsLoading, setIsCourseGroupsLoading] = React.useState<boolean>(true);


  const fetchImages = React.useCallback(async (): Promise<void> => {
    try {
      const response = await getImages();
      setImages(response);
    } catch (error: unknown) {
      logger.error('Failed to fetch images', error);
    } finally {
      setIsImagesLoading(false);
    }
  }, []);

  const fetchCourseGroups = React.useCallback(async (): Promise<void> => {
    try {
      if (courseGroupId) {
        // If courseGroupId is provided, filter the data to only show the selected group
        // This will be set to disabled and selected by default
        const response = await getCourseGroup(courseGroupId);
        setCourseGroups([response]);
      } else {
        const response = await getNonPrivateCourseGroups();
        setCourseGroups(response);
      }
    } catch (error: unknown) {
      logger.error('Failed to fetch course groups', error);
    } finally {
      setIsCourseGroupsLoading(false);
    }
  }, [courseGroupId]);

  // Handle Image Change
  const handleImageChange = (event: SelectChangeEvent<number>): void => {
    const imageId = Number(event.target.value);
    const image = images?.find(i => i.id === imageId) || null;
    setSelectedImage(image);
  };

  // Handle Course Change
  const handleCourseChange = (event: SelectChangeEvent<number>): void => {
    const cId = Number(event.target.value);
    const course = courseGroups?.find(c => c.id === cId) || null;
    setSelectedCourseGroup(course);
  };

  // Handle Form Submit
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    if (
      questNameRef.current &&
      questDescriptionRef.current &&
      questTypeRef.current &&
      questStatusRef.current &&
      questMaxAttemptsRef.current &&
      selectedImage &&
      selectedCourseGroup &&
      eduquestUser
    ) {
      const newQuest = {
        name: questNameRef.current.value.trim(),
        description: questDescriptionRef.current.value.trim(),
        type: questTypeRef.current.value.trim(),
        status: questStatusRef.current.value.trim(),
        max_attempts: Number(questMaxAttemptsRef.current.value),
        expiration_date: questExpirationDateRef.current?.value
          ? new Date(questExpirationDateRef.current.value).toISOString()
          : null,
        tutorial_date: questTutorialDateRef.current?.value
          ? new Date(questTutorialDateRef.current.value).toISOString()
          : null,
        course_group_id: selectedCourseGroup.id,
        image_id: selectedImage.id,
        organiser_id: eduquestUser.id
      };
      try {
        const response = await createQuest(newQuest);
        onFormSubmitSuccess(courseGroupId || selectedCourseGroup.id.toString());
        logger.debug('New Quest has been created successfully:', response);
        setSubmitStatus({type: 'success', message: 'Create Successful'});
      } catch (error: unknown) {
        logger.error('Failed to create new quest', error);
        setSubmitStatus({type: 'error', message: 'Create Failed. Please try again.'});
      }
    } else {
      setSubmitStatus({type: 'error', message: 'Please fill in all required fields.'});
    }
  }

  React.useEffect(() => {
    const fetchData = async (): Promise<void> => {
      await fetchCourseGroups();
      await fetchImages();
    };

    fetchData().catch((error: unknown) => {
      logger.error('Failed to fetch data', error);
    });
  }, [fetchCourseGroups, fetchImages]);

  // Pre-select the first image
  React.useEffect(() => {
    if (images && images.length > 0) {
      setSelectedImage(images[0]);
    }
  }, [images]);

  // Pre-select the first course group
  React.useEffect(() => {
    if (courseGroups && courseGroups.length > 0) {
      setSelectedCourseGroup(courseGroups[0]);
    }
  }, [courseGroups]);


  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader subheader="Add new quest to the system" title="New Quest" />
        <Divider />
        <CardContent>
          <Grid container spacing={3}>
            <Grid md={6} xs={12}>
              <FormControl fullWidth required>
                <FormLabel htmlFor="quest name">Quest Name</FormLabel>
                <TextField
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
                  defaultValue={1}
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
                <Select defaultValue="Eduquest MCQ" label="Quest Type" inputRef={questTypeRef} name="type" size="small">
                  <MenuItem value="Eduquest MCQ"><Chip variant="outlined" label="Eduquest MCQ" color="primary" size="small"/></MenuItem>
                  <MenuItem value="Private"><Chip variant="outlined" label="Private" color="secondary" size="small"/></MenuItem>
                  <MenuItem value="Kahoot!"><Chip variant="outlined" label="Kahoot!" color="violet" size="small"/></MenuItem>
                  <MenuItem value="Wooclap"><Chip variant="outlined" label="Wooclap" color="neon" size="small"/></MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid md={6} xs={12}>
              <FormControl fullWidth required>
                <FormLabel htmlFor="quest status">Quest Status</FormLabel>
                <Select defaultValue="Active" label="Quest Status" inputRef={questStatusRef} name="status" size="small">
                  <MenuItem value="Active"><Chip variant="outlined" label="Active" color="success" size="small"/></MenuItem>
                  <MenuItem value="Expired"><Chip variant="outlined" label="Expired" color="secondary" size="small"/></MenuItem>
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
                  inputRef={questExpirationDateRef}
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
                  inputRef={questTutorialDateRef}
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
                  inputRef={questDescriptionRef}
                  placeholder="The description of the quest"
                  variant='outlined'
                  multiline
                  size="medium"
                  rows={3}
                />
              </FormControl>
            </Grid>
            </Grid>

          <Typography sx={{my:3}} variant="h6">Thumbnail</Typography>

          {isImagesLoading ? <Skeleton variant="rectangular" height={50}/>
            : images ?
            <Grid container spacing={3} >
              <Grid container md={6} xs={12} alignItems="flex-start">
                <Grid xs={12}>
                  <FormControl required >
                    <FormLabel htmlFor="quest image">Thumbnail ID</FormLabel>
                    <Select
                      defaultValue={images[0]?.id}
                      onChange={handleImageChange}
                      inputRef={questImageIdRef}
                      variant="outlined"
                      type="number"
                      label="Thumbnail ID"
                      size="small"
                    >
                      {images.map((option) => (
                        <MenuItem key={option.id} value={option.id}>
                          {option.id} - {option.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid md={6} xs={12}>
                  <Typography variant="overline" color="text.secondary">Thumbnail Name</Typography>
                  <Typography variant="body2">{selectedImage?.name}</Typography>
                </Grid>
                <Grid md={6} xs={12}>
                  <Typography variant="overline" color="text.secondary">Thumbnail Filename</Typography>
                  <Typography variant="body2">{selectedImage?.filename}</Typography>
                </Grid>
              </Grid>
              <Grid md={6} xs={12}>
                <Grid xs={12}>
                  <Typography variant="overline" color="text.secondary">Thumbnail Preview</Typography>
                  <CardMedia
                    component="img"
                    alt={selectedImage?.name}
                    image={`/assets/${selectedImage?.filename || ''}`}
                    sx={{ backgroundColor: theme.palette.background.level1, border: `1px solid ${theme.palette.neutral[200]}`, borderRadius: '8px' }}
                  />
                </Grid>
              </Grid>
            </Grid> : null}
          <Divider sx={{my:3}}/>

          <Typography sx={{my:3}} variant="h6">Associated Course Group</Typography>

          {isCourseGroupsLoading ? <Skeleton variant="rectangular" height={50}/>
            : courseGroups ?
            <Grid container spacing={3} >
              <Grid container xs={12} alignItems="flex-start">
                <Grid xs={12}>
                  <FormControl required>
                    <FormLabel htmlFor="course id">Group ID</FormLabel>
                    <Select defaultValue={courseGroups[0]?.id} onChange={handleCourseChange}
                            label="Course ID" variant="outlined" type="number" disabled={Boolean(courseGroupId)} size="small">
                      {courseGroups.map((option) => (
                        <MenuItem key={option.id} value={option.id}>
                          {`${option.id.toString()} - [${option.name}] ${option.course.code} ${option.course.name}`}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid md={3} xs={12}>
                  <Typography variant="overline" color="text.secondary">Group Name</Typography>
                  <Typography variant="body2">{selectedCourseGroup?.name}</Typography>
                </Grid>
                <Grid md={3} xs={12}>
                  <Typography variant="overline" color="text.secondary">Group Session Day</Typography>
                  <Typography variant="body2">{selectedCourseGroup?.session_day}</Typography>
                </Grid>
                <Grid md={3} xs={12}>
                  <Typography variant="overline" color="text.secondary">Group Session Time</Typography>
                  <Typography variant="body2">{selectedCourseGroup?.session_time}</Typography>
                </Grid>
                <Grid md={3} xs={12}>
                  <Typography variant="overline" color="text.secondary">Instructor</Typography>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <UserIcon size={18}/>
                    <Typography variant="body2">{selectedCourseGroup?.instructor.nickname}</Typography>
                  </Stack>
                </Grid>
              </Grid>
            </Grid> : null}
        </CardContent>

        <CardActions sx={{ justifyContent: 'flex-end' }}>
          <Button startIcon={<FilePlusIcon fontSize="var(--icon-fontSize-md)"/>} type="submit" variant="contained">Add</Button>
        </CardActions>

      </Card>
      {submitStatus ? <Alert severity={submitStatus.type} sx={{ marginTop: 2 }}>
          {submitStatus.message}
        </Alert> : null}

    </form>
  );
}
