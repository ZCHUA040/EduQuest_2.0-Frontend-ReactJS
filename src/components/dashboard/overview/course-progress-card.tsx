'use client';

import * as React from 'react';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import type { SxProps } from '@mui/material/styles';
import { CourseRadialBarChart } from "@/components/dashboard/overview/chart/course-radial-bar-chart";
import {Book as BookIcon} from "@phosphor-icons/react/dist/ssr/Book";
import {CaretRight as CaretRightIcon} from "@phosphor-icons/react/dist/ssr/CaretRight";
import {CaretLeft as CaretLeftIcon} from "@phosphor-icons/react/dist/ssr/CaretLeft";
import {Info as InfoIcon} from "@phosphor-icons/react/dist/ssr/Info";
import Stack from "@mui/material/Stack";
import type { UserCourseProgression } from "@/types/analytics/analytics-two";
import Typography from "@mui/material/Typography";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Unstable_Grid2";
import CardActions from '@mui/material/CardActions';
import IconButton from "@mui/material/IconButton";
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import Tooltip from "@mui/material/Tooltip";

export interface MyEnrolledCoursesProps {
  userCourseProgression?: UserCourseProgression[];
  handleOnClick: (UserCourseProgression: UserCourseProgression) => void;
  sx?: SxProps;
  title: string;
  tooltip: string;
  nullPrompt: string;
}

export function CourseProgressCard({ userCourseProgression = [], sx, handleOnClick, title, tooltip, nullPrompt }: MyEnrolledCoursesProps): React.JSX.Element {
  const [page, setPage] = React.useState(0);
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down('sm'));
  const itemsPerPage = isXs ? 1 : 2;

  const handleNextPage = (): void => {
    if (page < Math.ceil(userCourseProgression.length / itemsPerPage) - 1) {
      setPage(page + 1);
    }
  };

  const handlePreviousPage = (): void => {
    if (page > 0) {
      setPage(page - 1);
    }
  };

  const paginatedData = userCourseProgression.slice(page * itemsPerPage, (page + 1) * itemsPerPage);

  return (
    <Card sx={{ ...sx, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <Stack direction="row" sx={{ alignItems: 'center' }} spacing={0}>
        <CardHeader
          title={title}
          // subheader="The progress of the courses that you are enrolled in"
          avatar={
            <BookIcon fontSize="var(--icon-fontSize-md)" color="var(--mui-palette-primary-main)" />
          }
          sx={{ pr: '10px'}}
        />
        <Tooltip title={tooltip} placement="top" >
          <InfoIcon fontSize="var(--icon-fontSize-sm)" style={{ marginLeft: '0px', cursor: 'pointer', color: 'var(--mui-palette-neutral-500)', marginTop: '16px'}} />
        </Tooltip>
      </Stack>
      <CardContent sx={{ justifyContent: 'center', alignItems: 'center', flexGrow: 1 }}>

        { paginatedData.length === 0 ?
          <Typography variant="body2" align="center" mt={4}>{nullPrompt}</Typography>
          :
          <Stack
            direction="column"
            justifyContent="space-evenly"
            height="100%"
          >
            <Grid container spacing={3} >
              { paginatedData.map((aUserCourseProgression: UserCourseProgression) => (
                <Grid  sm={6} xs={12}
                       key={aUserCourseProgression.course_id}
                       onClick={() => { handleOnClick(aUserCourseProgression); }}
                       sx={{
                         cursor: 'pointer',
                         height: '100%',
                         transition: 'background-color 0.3s ease', '&:hover': {
                           backgroundColor: 'var(--mui-palette-background-level2)',
                           borderRadius: '16px',
                         } }}
                >
                  <CourseRadialBarChart aUserCourseProgression={aUserCourseProgression}/>
                  <Typography variant="body2" align="center" >{aUserCourseProgression.course_code}</Typography>
                  <Typography variant="body2" align="center" color="text.secondary">{aUserCourseProgression.course_name}</Typography>
                </Grid>
              )) }
            </Grid>
          </Stack>
        }
      </CardContent>
      <CardActions sx={{ justifyContent: 'flex-end' }}>
        <Stack direction="row" spacing={2}>
          <IconButton onClick={handlePreviousPage} disabled={page === 0} color="primary">
            <CaretLeftIcon />
          </IconButton>
          <IconButton onClick={handleNextPage} disabled={page >= Math.ceil(userCourseProgression.length / itemsPerPage) - 1} color="primary">
            <CaretRightIcon />
          </IconButton>
        </Stack>
      </CardActions>
    </Card>
  );
}
