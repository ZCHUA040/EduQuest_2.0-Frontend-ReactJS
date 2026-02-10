'use client';

import * as React from 'react';
import Card from '@mui/material/Card';
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { CourseGroup, Quest } from "@/types/analytics/analytics-four";
import CardHeader from "@mui/material/CardHeader";
import {Book as BookIcon} from "@phosphor-icons/react/dist/ssr/Book";
import Tooltip from "@mui/material/Tooltip";
import {Info as InfoIcon} from "@phosphor-icons/react/dist/ssr/Info";
import CardContent from "@mui/material/CardContent";
import {QuestCompletionRadialBarChart} from "@/components/dashboard/overview/chart/quest-completion-radial-bar-chart";
import {useTheme} from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import IconButton from "@mui/material/IconButton";
import {CaretLeft as CaretLeftIcon} from "@phosphor-icons/react/dist/ssr/CaretLeft";
import {CaretRight as CaretRightIcon} from "@phosphor-icons/react/dist/ssr/CaretRight";
import CardActions from "@mui/material/CardActions";
import Grid from "@mui/material/Unstable_Grid2";

interface CourseGroupInfoCardProps {
  groupProgress: CourseGroup | null;
  onQuestSelect: (quest: Quest) => void;

}
export function CourseGroupInfoCard({ groupProgress, onQuestSelect }: CourseGroupInfoCardProps): React.JSX.Element {
  const [page, setPage] = React.useState(0);
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down('sm'));
  const itemsPerPage = isXs ? 2 : 4;

  const handleNextPage = (): void => {
    if (groupProgress) {
      if (page < Math.ceil(groupProgress.quests.length / itemsPerPage) - 1) {
        setPage(page + 1);
      }
    }
  };

  const handlePreviousPage = (): void => {
    if (page > 0) {
      setPage(page - 1);
    }
  };

  let paginatedData: Quest[] = [];

  if (groupProgress) {
    paginatedData = groupProgress.quests.slice(page * itemsPerPage, (page + 1) * itemsPerPage);
  } else {
    paginatedData = [];
  }



  return (
    <Card sx={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <Stack direction="row" sx={{ alignItems: 'center' }} spacing={0}>
        <CardHeader
          title={`${groupProgress ? groupProgress.group_name: "Group"}'s Progress`}
          avatar={
            <BookIcon color="var(--mui-palette-primary-main)" />
          }
          sx={{ pr: '10px'}}
        />
        <Tooltip title="The progress of each quests in the selected course group" placement="top" >
          <InfoIcon fontSize="var(--icon-fontSize-sm)" style={{ marginLeft: '0px', cursor: 'pointer', color: 'var(--mui-palette-neutral-500)', marginTop: '16px'}} />
        </Tooltip>
      </Stack>
      <CardContent sx={{ justifyContent: 'center', alignItems: 'center', flexGrow: 1 }}>

        {groupProgress ? (
          paginatedData.length === 0 ? (
            <Typography variant="body2" align="center" pb={3}>
              This course group does not have any quest setup yet
            </Typography>
          ) : (
            <Stack direction="column" justifyContent="space-evenly" height="100%">
              <Grid container spacing={3}>
                {paginatedData.map((quest) => (
                  <Grid
                    key={quest.quest_id}
                    xs={12}
                    sm={6}
                    onClick={() => {
                      onQuestSelect(quest);
                    }}
                    sx={{
                      cursor: 'pointer',
                      // height: '100%',
                      transition: 'background-color 0.3s ease',
                      '&:hover': {
                        backgroundColor: 'var(--mui-palette-background-level2)',
                        borderRadius: '16px',
                      },
                    }}
                  >
                    <QuestCompletionRadialBarChart
                      key={quest.quest_id}
                      questProgress={quest}
                      enrolledStudents={groupProgress.enrolled_students}
                    />
                    <Typography variant="body2" align="center" color="text.secondary">
                      {quest.quest_completion} / {groupProgress.enrolled_students}
                    </Typography>
                    <Typography variant="body2" align="center">
                      {quest.quest_name}
                    </Typography>
                  </Grid>
                ))}
              </Grid>
            </Stack>
          )
        ) : (
          <Typography variant="body2" align="center" pb={3}>
            Select a quest to view its completion progress
          </Typography>
        )}



      </CardContent>
      { groupProgress ?
        <CardActions sx={{ justifyContent: 'flex-end' }}>
          <Stack direction="row" spacing={2}>
            <IconButton onClick={handlePreviousPage} disabled={page === 0} color="primary">
              <CaretLeftIcon />
            </IconButton>
            <IconButton onClick={handleNextPage} disabled={page >= Math.ceil(groupProgress.quests.length / itemsPerPage) - 1} color="primary">
              <CaretRightIcon />
            </IconButton>
          </Stack>
        </CardActions>
        : null }
    </Card>
  );
}

