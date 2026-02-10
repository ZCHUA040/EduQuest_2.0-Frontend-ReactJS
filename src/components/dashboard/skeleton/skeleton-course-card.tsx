/* eslint-disable react/no-array-index-key -- skeleton rows are static placeholders */
import * as React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import CardActions from '@mui/material/CardActions';
import Skeleton from '@mui/material/Skeleton';
import Grid from "@mui/material/Unstable_Grid2";
import Typography from "@mui/material/Typography";

export function SkeletonCourseCard(): React.JSX.Element {
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
        <Skeleton width="30%"/>
      </Box>
      <Grid container spacing={4}>
        {Array.from({ length: 6 }).map((_, index) => (
          <Grid key={index} lg={4} md={6} xs={12} >
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <CardHeader
                title={<Skeleton width="60%" />} sx={{my: 1}}
              />
              <Skeleton variant="rectangular" height={160} />
              <CardContent sx={{ flex: 1 }}>
                <Typography sx={{ mb: 1.5 }} color="text.secondary">
                  <Skeleton width="20%" />
                </Typography>
                <Typography variant="subtitle1">
                  <Skeleton width="40%" />
                </Typography>
                <Typography sx={{ mb: 1.5 }} variant="subtitle1">
                  <Skeleton width="40%" />
                </Typography>
                <Typography variant="body2">
                  <Skeleton width="90%" />
                </Typography>
                <Typography variant="body2">
                  <Skeleton width="90%" />
                </Typography>
                <Typography variant="body2">
                  <Skeleton width="70%" />
                </Typography>
              </CardContent>
              <Box>
                <CardActions sx={{ justifyContent: 'space-between' }}>
                  <Skeleton width="20%" sx={{my: 1}} />
                  <Skeleton width="20%" />
                </CardActions>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
