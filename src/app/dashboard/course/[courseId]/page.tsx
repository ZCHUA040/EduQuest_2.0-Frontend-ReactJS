"use client"
import * as React from 'react';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { CaretLeft as CaretLeftIcon } from "@phosphor-icons/react/dist/ssr/CaretLeft";
import { Pen as PenIcon } from "@phosphor-icons/react/dist/ssr/Pen";
import type {Course} from '@/types/course';
import type { Quest } from '@/types/quest';
import { logger } from '@/lib/default-logger'
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Unstable_Grid2";
import CardActions from "@mui/material/CardActions";
import RouterLink from "next/link";
import {paths} from "@/paths";
import Alert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import {QuestCard} from "@/components/dashboard/quest/quest-card";
import {useUser} from "@/hooks/use-user";
import {CardMedia} from "@mui/material";
// import {Check as CheckIcon} from "@phosphor-icons/react/dist/ssr/Check";
// import {SignIn as SignInIcon} from "@phosphor-icons/react/dist/ssr/SignIn";
import Box from "@mui/material/Box";
import {User as UserIcon} from "@phosphor-icons/react/dist/ssr/User";
import IconButton, { type IconButtonProps } from '@mui/material/IconButton';
import { CaretDown as CaretDownIcon } from "@phosphor-icons/react/dist/ssr/CaretDown";
import {styled} from '@mui/material/styles';
import Collapse from '@mui/material/Collapse';
import { SkeletonQuestCard } from "@/components/dashboard/skeleton/skeleton-quest-card";
import { SkeletonCourseDetailCard } from "@/components/dashboard/skeleton/skeleton-course-detail-card";
import {CourseEditForm} from "@/components/dashboard/course/course-edit-form";
import { Plus as PlusIcon } from "@phosphor-icons/react/dist/ssr/Plus";
import { XCircle as XCircleIcon } from "@phosphor-icons/react/dist/ssr/XCircle";
import {QuestNewForm} from "@/components/dashboard/quest/quest-new-form";
import {useState} from "react";
import {IOSSwitch} from "@/components/dashboard/misc/buttons";
import {CourseExpiresDialog} from "@/components/dashboard/dialog/course-expires-dialog";
// import {CalendarX as CalendarXIcon} from "@phosphor-icons/react/dist/ssr/CalendarX";
import {Upload as UploadIcon} from "@phosphor-icons/react/dist/ssr/Upload";
import {getCourse, updateCourse} from "@/api/services/course";
import {getCourseGroupsByCourse} from "@/api/services/course-group";
import {CourseGroupCard} from "@/components/dashboard/course-group/course-group-card";
import {getQuests, getQuestsByCourseGroup} from "@/api/services/quest";
import {CourseNewGroupForm} from "@/components/dashboard/course-group/course-group-new-form";
import type {CourseGroup} from "@/types/course-group";
import {getUserCourseGroupEnrollmentsByCourseAndUser} from "@/api/services/user-course-group-enrollment";
import type {UserCourseGroupEnrollment} from "@/types/user-course-group-enrollment";
import {SkeletonCourseGroupCard} from "@/components/dashboard/skeleton/skeleton-course-group-card";


interface ExpandMoreProps extends IconButtonProps {
  expand: boolean;
}

const ExpandMore = styled((props: ExpandMoreProps) => {
  // eslint-disable-next-line no-unused-vars -- expand is defined in props
  const { expand, ...other } = props;
  return <IconButton {...other} />;
})(({ theme, expand }) => ({
  transform: !expand ? 'rotate(0deg)' : 'rotate(180deg)',
  marginLeft: 'auto',
  transition: theme.transitions.create('transform', {
    duration: theme.transitions.duration.shortest,
  }),
}));


export default function Page({ params }: { params: { courseId: string } }) : React.JSX.Element {
  const { eduquestUser } = useUser();
  const [course, setCourse] = React.useState<Course>();
  const [courseGroups, setCourseGroups] = React.useState<CourseGroup[]>();
  const [userCourseGroupEnrollments, setUserCourseGroupEnrollments] = React.useState<UserCourseGroupEnrollment[]>();
  const [quests, setQuests] = React.useState<Quest[]>();
  const [showEditCourseForm, setShowEditCourseForm] = React.useState(false);
  const [showCreateQuestForm, setShowCreateQuestForm] = React.useState(false);
  const [showCreateCourseGroupForm, setShowCreateCourseGroupForm] = React.useState(false);
  const [expanded, setExpanded] = React.useState(false);
  const [loadingQuests, setLoadingQuests] = React.useState(false);
  const [loadingCourse, setLoadingCourse] = React.useState(true);
  const [loadingCourseGroups, setLoadingCourseGroups] = React.useState(true);
  const [loadingUserCourseGroupEnrollments, setLoadingUserCourseGroupEnrollments] = React.useState(true);
  const [submitStatus, setSubmitStatus] = React.useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedCourseGroupId, setSelectedCourseGroupId] = React.useState<string | null>(null);

  const handleExpandClick = (): void => {
    setExpanded(!expanded);
  };

  const handleCourseGroupSelect = async(courseGroupId: string): Promise<void> => {
    setSelectedCourseGroupId(courseGroupId);
    await fetchQuestsByCourseGroup(courseGroupId);
  };

  const toggleCreateQuestForm = (): void => {
    setShowCreateQuestForm(!showCreateQuestForm);
  };

  const toggleCreateCourseGroupForm = (): void => {
    setShowCreateCourseGroupForm(!showCreateCourseGroupForm);
  }

  const toggleEditCourseForm = (): void => {
    setShowEditCourseForm(!showEditCourseForm);
  };

  const handleDialogOpen = (): void => {
    setOpenDialog(true);
  }

  const handleDialogClose = (): void => {
    setOpenDialog(false);
  };

  const handleDialogConfirm = async (status: 'Active' | 'Expired'): Promise<void> => {
    setOpenDialog(false);
    await handleStatusChange(status);
  };

  const handleStatusChange = async (status: 'Active' | 'Expired'): Promise<void> => {
    try {
      const response = await updateCourse(params.courseId, { status });
      setSubmitStatus({ type: 'success', message: `Course has been set to '${status}'` });
      setCourse(response);
    } catch (error: unknown) {
      logger.error('Failed to expire course', error);
      setSubmitStatus({type: 'error', message: 'Failed to change course status. Please try again.'});
    }
  }

  const fetchCourse = async (): Promise<void> => {
    try {
      const response = await getCourse(params.courseId);
      setCourse(response);
      // logger.debug('Course details', response);
    } catch (error: unknown) {
      logger.error('Failed to fetch course', error);
    } finally {
      setLoadingCourse(false);
    }
  };

  const fetchMyCourseGroups = async (): Promise<void> => {
    if (eduquestUser) {
      try {
        const response = await getUserCourseGroupEnrollmentsByCourseAndUser(params.courseId, eduquestUser?.id.toString());
        setUserCourseGroupEnrollments(response);
        // logger.debug('My course groups', response);
      } catch (error: unknown) {
        logger.error('Failed to fetch course group enrollments', error);
      } finally {
        setLoadingUserCourseGroupEnrollments(false);
      }
    }
  }

  const fetchCourseGroups = async (): Promise<void> => {
    try {
      const response = await getCourseGroupsByCourse(params.courseId);
      setCourseGroups(response);
      // logger.debug('All course groups', response);
    } catch (error: unknown) {
      logger.error('Failed to fetch course groups', error);
    } finally {
      setLoadingCourseGroups(false);
    }
  }

  const fetchQuestsByCourseGroup = async (courseGroupId: string): Promise<void> => {
    try {
      setLoadingQuests(true)
      const response = await getQuestsByCourseGroup(courseGroupId);
      setQuests(response);
      // logger.debug('My quests', response);
    } catch (error: unknown) {
      logger.error('Failed to fetch quests', error);
    } finally {
      setLoadingQuests(false);
    }
  };


  const fetchQuests = async (): Promise<void> => {
    try {
      const response = await getQuests();
      setQuests(response);
      // logger.debug('quests', response);
    } catch (error: unknown) {
      logger.error('Failed to fetch quests', error);
    } finally {
      setLoadingQuests(false);
    }
  };

  React.useEffect(() => {
    const fetchData = async (): Promise<void> => {
      await fetchMyCourseGroups();
      await fetchCourse();
      await fetchCourseGroups();
    };

    fetchData().catch((error: unknown) => {
      logger.error('Failed to fetch data', error);
    });
  }, []);


  return (
    <Stack spacing={3}>
      <Stack direction="row"sx={{justifyContent: 'space-between'}}>
        <Button startIcon={<CaretLeftIcon fontSize="var(--icon-fontSize-md)"/>} component={RouterLink} href={paths.dashboard.course.all}>View all Courses</Button>

      </Stack>

      {!showEditCourseForm && (
        loadingCourse ? (
          <SkeletonCourseDetailCard />
        ) : (
          course ? (
        <Card>
          <CardHeader
            title="Course Details"
            subheader={`ID: ${course.id.toString()}`}
            action={
              eduquestUser?.is_staff ?
                <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }} color="error">
                  <Stack direction="row" spacing={1} sx={{alignItems: 'center'}}>

                    <IOSSwitch
                      checked={course.status === 'Active'}
                      onClick={handleDialogOpen}
                      inputProps={{ 'aria-label': 'Change State' }}
                    />
                    <Typography variant="overline" color="text.secondary">
                      {course.status === 'Active' ? 'Active' : 'Expired'}
                    </Typography>
                  </Stack>
                  <Button startIcon={<PenIcon fontSize="var(--icon-fontSize-md)" />} variant="contained" onClick={toggleEditCourseForm}>
                    Edit Course
                  </Button>
                </Stack> : null
            }
          />

          <CardContent sx={{pb: '16px'}}>
            <Grid container spacing={3}>
              <Grid md={3} xs={12} display="flex" justifyContent="center" alignItems="center">
                {course.image?.filename ? (
                  <CardMedia
                    component="img"
                    alt={course.image?.name || course.name}
                    image={`/assets/${course.image.filename}`}
                  />
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No course image available.
                  </Typography>
                )}
              </Grid>

              <Grid container md={9} xs={12} >
                <Grid md={6} xs={12}>
                  <Typography variant="overline" color="text.secondary">Code</Typography>
                  <Typography variant="body2">{course.code}</Typography>
                </Grid>
                <Grid md={6} xs={12}>
                  <Typography variant="overline" color="text.secondary">Name</Typography>
                  <Typography variant="body2">{course.name}</Typography>
                </Grid>
                <Grid md={6} xs={12}>
                  <Typography variant="overline" color="text.secondary" display="block">Type</Typography>
                  <Chip label={course.type} color={
                    course.type === 'System-enroll' ? 'primary' :
                      course.type === 'Self-enroll' ? 'success' :
                        course.type === 'Private' ? 'secondary' : 'default'
                  } size="small" variant="outlined"/>
                </Grid>
                <Grid md={6} xs={12}>
                  <Typography variant="overline" color="text.secondary" display="block">Status</Typography>
                  <Chip label={course.status} color={
                    course.status === 'Active' ? 'success' : 'secondary'
                  } size="small" variant="outlined"/>

                </Grid>
                <Grid md={6} xs={12}>
                  <Typography variant="overline" color="text.secondary" display="block">Coordinators</Typography>
                  <Stack direction="row" spacing={2}>
                    {course.coordinators_summary.map((coordinator) => (
                      <Stack direction="row" spacing={1} key={coordinator.id} alignItems="center">
                        <UserIcon size={18}/>
                        <Typography variant="body2">{coordinator.nickname}</Typography>
                      </Stack>
                    ))}
                  </Stack>
                </Grid>
                <Grid xs={12}>
                  <Typography variant="overline" color="text.secondary">Description</Typography>
                  <Typography variant="body2">{course.description}</Typography>
                </Grid>
                <Grid xs={12}>
                  <ExpandMore
                    expand={expanded}
                    onClick={handleExpandClick}
                    aria-expanded={expanded}
                    aria-label="show more"
                    sx={{ display: 'flex', mx: 'auto'}}
                  >
                    <CaretDownIcon />
                  </ExpandMore>
                </Grid>
              </Grid>
            </Grid>


            <Collapse in={expanded} timeout="auto" unmountOnExit>
            <Grid container spacing={3}>
              <Grid md={3} xs={12} sx={{ display: { xs: 'none', md: 'block' } }}/>

              <Grid container md={9} xs={12}>
                <Grid md={6} xs={12}>
                  <Typography variant="overline" color="text.secondary">Term ID</Typography>
                  <Typography variant="body2">{course.term.id}</Typography>
                </Grid>
                <Grid md={6} xs={12}>
                  <Typography variant="overline" color="text.secondary">Term Name</Typography>
                  <Typography variant="body2">{course.term.name}</Typography>
                </Grid>
                <Grid md={6} xs={12}>
                  <Typography variant="overline" color="text.secondary">Term Start Date</Typography>
                  <Typography variant="body2">{course.term.start_date}</Typography>
                </Grid>
                <Grid md={6} xs={12}>
                  <Typography variant="overline" color="text.secondary">Term End Date</Typography>
                  <Typography variant="body2">{course.term.end_date}</Typography>
                </Grid>
                <Grid md={6} xs={12}>
                  <Typography variant="overline" color="text.secondary">Academic Year ID</Typography>
                  <Typography variant="body2">{course.term.academic_year.id}</Typography>
                </Grid>
                <Grid md={6} xs={12}>
                  <Typography variant="overline" color="text.secondary">Academic Year</Typography>
                  <Typography variant="body2">AY {course.term.academic_year.start_year}-{course.term.academic_year.end_year}</Typography>
                </Grid>
              </Grid>
            </Grid>
            </Collapse>
          </CardContent>
          <CardActions sx={{ justifyContent: 'space-between'}}>
            <Box sx={{ mx: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center', my:1 }}>
              <UserIcon size={20}/>
              <Typography sx={{ marginLeft: '10px' }} variant="body1">
                {course.total_students_enrolled}
              </Typography>
            </Box>
            {/*{eduquestUser && course.enrolled_users.includes(eduquestUser?.id.toString()) ? (*/}
            {/*  <Button endIcon={<CheckIcon/>} disabled>Enrolled</Button>*/}
            {/*) : course.type === 'System-enroll' ?*/}
            {/*  <Button startIcon={<SignInIcon/>} disabled>Enroll</Button>*/}
            {/*  : course.status === 'Expired' ?*/}
            {/*    <Button startIcon={<CalendarXIcon/>} disabled>Expired</Button>*/}
            {/*    : (*/}
            {/*      <Button endIcon={<SignInIcon/>} onClick={() => handleEnroll()}>Enroll</Button>*/}

            {/*    )}*/}
          </CardActions>

          <CourseExpiresDialog
            openDialog={openDialog}
            handleDialogClose={handleDialogClose}
            handleDialogConfirm={handleDialogConfirm}
            course={course}
          />

        </Card>
          ) : (
            <Typography variant="body1">Course details not available.</Typography>
          )
        )
      )}

      { showEditCourseForm && course ?
        <CourseEditForm
          setSubmitStatus={setSubmitStatus}
          course={course}
          toggleForm={toggleEditCourseForm}
          onUpdateSuccess={fetchCourse}
        />
        : null }

      {submitStatus ? (
        <Alert severity={submitStatus.type} sx={{ marginTop: 2 }}>
          {submitStatus.message}
        </Alert>
      ) : null}

      {course && course.type === 'System-enroll' ? (
        <Box>






      <Stack direction="row" sx={{justifyContent: 'space-between', alignItems: 'center', verticalAlign: 'center', pt:3}}>
        <Box>
          <Typography variant="h5">Groups</Typography>
          <Typography variant="body2" color="text.secondary" pb={2}>Groups available for this course</Typography>
        </Box>
        { eduquestUser?.is_staff ?
          <Stack direction='row' spacing={1}>
            <Button
              startIcon={showCreateCourseGroupForm ? <XCircleIcon/> : <PlusIcon />}
              variant={showCreateCourseGroupForm ? 'text' : 'contained'}
              color={showCreateCourseGroupForm ? 'error' : 'primary'}
              onClick={toggleCreateCourseGroupForm}
            >
              {showCreateCourseGroupForm ? 'Cancel' : 'Create Group'}
            </Button>
          </Stack>
          : null }
      </Stack>

      {showCreateCourseGroupForm && courseGroups ?
        <CourseNewGroupForm
          onFormSubmitSuccess={fetchCourseGroups}
          courseId={params.courseId}
        /> : null}


      {loadingCourseGroups || loadingUserCourseGroupEnrollments ? (
        <SkeletonCourseGroupCard />
      ) : courseGroups && userCourseGroupEnrollments && courseGroups.length > 0 ? (
        <CourseGroupCard
          rows={courseGroups}
          userCourseGroupEnrollments={userCourseGroupEnrollments}
          handleCourseGroupSelect={handleCourseGroupSelect}
        />
      ) : (
        <Typography variant="body1" pb={2}>No groups available for this course</Typography>
      )}


      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', verticalAlign: 'center', pt: 3 }}>
        <Box>
          <Typography variant="h5" pt={4}>Quests</Typography>
          <Typography variant="body2" color="text.secondary" pb={2}>Quests available for this group</Typography>
        </Box>
        {eduquestUser?.is_staff && selectedCourseGroupId? (
          <Stack direction="row" spacing={1}>
            <Button startIcon={<UploadIcon />} variant="contained" color="primary" component={RouterLink} href={`${paths.dashboard.import}/${selectedCourseGroupId.toString()}`}>
              Import
            </Button>
            <Button
              startIcon={showCreateQuestForm ? <XCircleIcon fontSize="var(--icon-fontSize-md)" /> : <PlusIcon fontSize="var(--icon-fontSize-md)" />}
              variant={showCreateQuestForm ? 'text' : 'contained'}
              color={showCreateQuestForm ? 'error' : 'primary'}
              onClick={toggleCreateQuestForm}
            >
              {showCreateQuestForm ? 'Cancel' : 'Create Quest'}
            </Button>
          </Stack>
        ) : null}
      </Stack>

      {showCreateQuestForm && course ?
        <QuestNewForm onFormSubmitSuccess={fetchQuestsByCourseGroup} courseGroupId={selectedCourseGroupId} /> : null}

      {loadingQuests ? (
        <SkeletonQuestCard />
      ) : selectedCourseGroupId ? (
        quests && quests.length > 0 ? (
          <QuestCard rows={quests} onQuestDeleteSuccess={fetchQuests} />
        ) : (
          <Typography variant="body1" pb={2}>No quests available for this group</Typography>
        )
      ) : (
        <Typography variant="body1">Select a group to view the quests</Typography>
      )}

        </Box> ): null }

    </Stack>


  );
}
