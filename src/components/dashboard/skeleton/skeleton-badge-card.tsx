/* eslint-disable react/no-array-index-key -- skeleton rows are static placeholders */
import * as React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Skeleton from '@mui/material/Skeleton';
import Grid from "@mui/material/Unstable_Grid2";
import Typography from "@mui/material/Typography";

export function SkeletonBadgeCard(): React.JSX.Element {
  return (
    <Box>
      <Grid container spacing={4}>
        {Array.from({ length: 4 }).map((_, index) => (
          <Grid key={index} lg={3} md={4} xs={12} >
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <Skeleton variant="rectangular" height={160} sx={{ backgroundColor: '#fafafa' }} />
              <CardContent sx={{ flex: 1 }}>
                <Typography variant="subtitle1">
                  <Skeleton width="20%" />
                </Typography>
                <Typography sx={{ mb: 1.5 }} variant="body2">
                  <Skeleton width="80%" />
                </Typography>

                <Typography variant="subtitle1">
                  <Skeleton width="20%" />
                </Typography>
                <Typography sx={{ mb: 1.5 }} variant="body2">
                  <Skeleton width="80%" />
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
