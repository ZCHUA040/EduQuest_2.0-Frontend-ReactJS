"use client"
import * as React from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import { logger } from '@/lib/default-logger'
import { QuestCard } from "@/components/dashboard/quest/quest-card";
import type { Quest } from '@/types/quest';
import { SkeletonQuestCard } from "@/components/dashboard/skeleton/skeleton-quest-card";
import {useUser} from "@/hooks/use-user";
import type { SelectChangeEvent } from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import {Funnel as FunnelIcon} from "@phosphor-icons/react/dist/ssr/Funnel";
import {getMyQuests} from "@/api/services/quest";


export default function Page(): React.JSX.Element {
  const { eduquestUser } = useUser();
  const [quests, setQuests] = React.useState<Quest[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedCourseId, setSelectedCourseId] = React.useState<string | null>(null);
  const [courseIds, setCourseIds] = React.useState<string[]>([]);

  const fetchMyQuests = React.useCallback(async (): Promise<void> => {
    if (eduquestUser) {
      try {
        const response = await getMyQuests(eduquestUser.id.toString());
        setQuests(response);
        const uniqueCourseIds = Array.from(new Set(response.map(quest => `${quest.course_group.course.id.toString()} - [${quest.course_group.name}] ${quest.course_group.course.code} ${quest.course_group.course.name}`)));
        setCourseIds(uniqueCourseIds);
      } catch (error: unknown) {
        logger.error('Failed to fetch my courses', error);
      } finally {
        setLoading(false);
      }
    }
  }, [eduquestUser]);


  React.useEffect(() => {
    const fetchData = async (): Promise<void> => {
      await fetchMyQuests();
    };

    fetchData().catch((error: unknown) => {
      logger.error('Failed to fetch data', error);
    });
  }, [fetchMyQuests]);

  const handleCourseChange = (event: SelectChangeEvent): void => {
    setSelectedCourseId(event.target.value);
  };


  const filteredQuests = selectedCourseId
    ? quests.filter(quest => `${quest.course_group.course.id.toString()} - [${quest.course_group.name}] ${quest.course_group.course.code} ${quest.course_group.course.name}` === selectedCourseId)
    : quests;

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={1} sx={{justifyContent: 'space-between'}}>
        <Stack spacing={1}>
          <Typography variant="h4">My Quests</Typography>
          <Typography variant="body2" color="text.secondary">
            List of all quests from the courses you are enrolled in.
          </Typography>
        </Stack>
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
          <FunnelIcon height={20} width={20}/>
          <FormControl size="small">
            <Select
              value={selectedCourseId || ''}
              onChange={handleCourseChange}
              displayEmpty
              sx={{minWidth: 200}}
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
      </Stack>
      {loading ? (
          <SkeletonQuestCard/>
        ) : (
        filteredQuests.length === 0 ? (
          <Typography variant="h6" align="center" mt={4}>No data available.</Typography>
          ) :
          <QuestCard rows={filteredQuests} onQuestDeleteSuccess={fetchMyQuests}/>
        )}
    </Stack>
  );
}
