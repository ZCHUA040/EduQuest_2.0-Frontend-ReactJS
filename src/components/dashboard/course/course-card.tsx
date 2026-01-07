import * as React from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Unstable_Grid2'; // Grid version 2
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Pagination from '@mui/material/Pagination';
import type { Course } from '@/types/course';
import CardActionArea from "@mui/material/CardActionArea";
import CardHeader from "@mui/material/CardHeader";
import Chip from "@mui/material/Chip";
import CardActions from "@mui/material/CardActions";
import {CardMedia} from "@mui/material";
import { Users as UsersIcon } from "@phosphor-icons/react/dist/ssr/Users";
import RouterLink from "next/link";

interface CourseCardProps {
  rows?: Course[];
}

export function CourseCard({ rows = [] }: CourseCardProps): React.JSX.Element {
  const [page, setPage] = React.useState(1);
  const rowsPerPage = 6;

  // Calculate the number of pages
  const pageCount = Math.ceil(rows.length / rowsPerPage);

  // Calculate the items to be displayed on the current page
  const currentCourses = rows.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  // Handle page change
  const handleChangePage = (event: React.ChangeEvent<unknown>, newPage: number): void => {
    setPage(newPage);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
        <Pagination count={pageCount} page={page} onChange={handleChangePage} color="primary" />
      </Box>
      <Grid container spacing={4}>

      {currentCourses.map((course) => (
        <Grid key={course.id} lg={4} md={6} xs={12} >
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', hover: 'pointer' }}>
            <CardActionArea
              href={`/dashboard/course/${course.id.toString()}` }
              sx={{ height: '100%', borderBottomLeftRadius: 0, borderBottomRightRadius: 0, display: 'flex', flexDirection: 'column' }}
              component={RouterLink}
            >
              <CardHeader title={`${course.code} ${course.name}`} sx={{ width: '100%'}}/>
            {course.image?.filename ? (
              <CardMedia
                component="img"
                alt={course.image?.name || course.name}
                image={`/assets/${course.image.filename}`}
                sx={{ width: '100%'}}
              />
            ) : (
              <Typography variant="body2" color="text.secondary">
                No course image available.
              </Typography>
            )}
              <CardContent sx={{ flex: 1, width: '100%' }}>
                <Chip label={course.type} sx={{ mb: 1.5, mr: 1 }} color={
                  course.type === 'System-enroll' ? 'primary' :
                    course.type === 'Self-enroll' ? 'success' :
                      course.type === 'Private' ? 'secondary' : 'default'
                } size="small" variant="outlined"/>
                <Chip label={course.status} sx={{ mb: 1.5 }} color={
                    course.status === 'Active' ? 'success' : 'secondary'
                } size="small" variant="outlined"/>
                <Typography variant="subtitle1" mb={1}>
                  AY {course.term.academic_year.start_year}-{course.term.academic_year.end_year} {course.term.name}
                </Typography>
                <Typography variant="body2" sx={{
                  display: '-webkit-box',
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  WebkitLineClamp: 4,
                  textOverflow: 'ellipsis'
                }}>
                  {course.description}
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: 'space-between', mt: 'auto', width: '100%' }}>
                <Box sx={{ mx: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', my: 1 }}>
                  <UsersIcon size={20}/>
                  <Typography sx={{ marginLeft: '10px' }} variant="body1">
                    {course.total_students_enrolled}
                  </Typography>
                </Box>
              </CardActions>
            </CardActionArea>

          </Card>
        </Grid>
      ))}


    </Grid>

    </Box>
  );
}
