"use client"
import * as React from 'react';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Plus as PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';
import { XCircle as XCircleIcon } from '@phosphor-icons/react/dist/ssr/XCircle';
import { Funnel as FunnelIcon } from '@phosphor-icons/react/dist/ssr/Funnel';
import { Upload as UploadIcon } from '@phosphor-icons/react/dist/ssr/Upload';
import { logger } from '@/lib/default-logger'
import { QuestNewForm } from "@/components/dashboard/quest/quest-new-form";
import { QuestCard } from "@/components/dashboard/quest/quest-card";
import type { Quest } from '@/types/quest';
import { SkeletonQuestCard } from "@/components/dashboard/skeleton/skeleton-quest-card";
import Select, {type SelectChangeEvent} from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import {useUser} from "@/hooks/use-user";
import RouterLink from "next/link";
import {paths} from "@/paths";
import Grid from '@mui/material/Unstable_Grid2';
import {getNonPrivateQuests} from "@/api/services/quest";


export default function Page(): React.JSX.Element {
  const [quests, setQuests] = React.useState<Quest[]>([]);

  const [showForm, setShowForm] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [selectedCourseId, setSelectedCourseId] = React.useState<string | null>(null);
  const [courseIds, setCourseIds] = React.useState<string[]>([]);
  const { eduquestUser } = useUser();


  const toggleForm = (): void => {
    setShowForm(!showForm);
  };

  const fetchQuests = async (): Promise<void> => {
    try {
      const response = await getNonPrivateQuests()
      setQuests(response);
      const uniqueCourseIds = Array.from(new Set(response.map(quest => `${quest.course_group.course.id.toString()} - [${quest.course_group.name}] ${quest.course_group.course.code} ${quest.course_group.course.name}`)));
      setCourseIds(uniqueCourseIds);
    } catch (error: unknown) {
      logger.error('Failed to fetch my courses', error);
    } finally {
      setLoading(false);
    }
  }


  React.useEffect(() => {
    const fetchData = async (): Promise<void> => {
      await fetchQuests();
    };

    fetchData().catch((error: unknown) => {
      logger.error('Failed to fetch data', error);
    });
  }, []);

  const handleCourseChange = (event: SelectChangeEvent): void => {
    setSelectedCourseId(event.target.value);
  };


  const filteredQuests = selectedCourseId
    ? quests.filter(quest => `${quest.course_group.course.id.toString()} - [${quest.course_group.name}] ${quest.course_group.course.code} ${quest.course_group.course.name}` === selectedCourseId)
    : quests;


  return (
    <Stack spacing={3}>

      <Grid container spacing={1} sx={{ justifyContent: 'space-between' }}>
        <Grid md={6} xs={12}>
          <Stack spacing={1}>
            <Typography variant="h4">All Quests</Typography>
            <Typography variant="body2" color="text.secondary">List of all the quests available on the platform.</Typography>
          </Stack>
          </Grid>
        <Grid md={6} xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
          <Stack direction="column" spacing={2} alignItems="center">
            {eduquestUser?.is_staff ? (
              <Stack direction="row" spacing={1}>
                <Button startIcon={<UploadIcon />} variant="contained" color="primary" component={RouterLink} href={paths.dashboard.import}>
                  Import
                </Button>
                <Button
                  startIcon={showForm ? <XCircleIcon fontSize="var(--icon-fontSize-md)" /> : <PlusIcon fontSize="var(--icon-fontSize-md)" />}
                  variant={showForm ? 'text' : 'contained'}
                  color={showForm ? 'error' : 'primary'}
                  onClick={toggleForm}
                >
                  {showForm ? 'Cancel' : 'Create'}
                </Button>
              </Stack>
            ) : null}
          </Stack>
        </Grid>
      </Grid>

      {showForm ? <QuestNewForm onFormSubmitSuccess={fetchQuests} courseGroupId={null}/> : null} {/* Conditional rendering */}

      {eduquestUser?.is_staff ? (
        <Stack direction="row" spacing={2} alignItems="center" justifyContent="flex-end">
          <FunnelIcon height={20} width={20} />
          <FormControl size="small">
            <Select
              value={selectedCourseId || ''}
              onChange={handleCourseChange}
              displayEmpty
              sx={{ minWidth: 200 }}
              size="small"
            >
              <MenuItem value="">
                <em>All Courses</em>
              </MenuItem>
              {courseIds.map(courseId => (
                <MenuItem key={courseId} value={courseId}>
                  {courseId}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      ) : null}

      {loading ? (
        <SkeletonQuestCard />
      ) : (
        quests.length === 0 ? (
            <Typography variant="h6" align="center" mt={4}>No data available.</Typography>
          ) :
        <QuestCard rows={filteredQuests} onQuestDeleteSuccess={fetchQuests}/>
      )}
    </Stack>
  );
}
