/* eslint-disable react/no-array-index-key -- skeleton rows are static placeholders */
import * as React from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Unstable_Grid2'; // Grid version 2
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActionArea from "@mui/material/CardActionArea";
import CardHeader from "@mui/material/CardHeader";
import CardActions from "@mui/material/CardActions";
import { Users as UsersIcon } from "@phosphor-icons/react/dist/ssr/Users";
import Stack from "@mui/material/Stack";
import Skeleton from "@mui/material/Skeleton";



export function SkeletonCourseGroupCard(): React.JSX.Element {
  return (
    <Box>

      {/* Grid Container */}
      <Grid container spacing={2}>
        {Array.from({ length: 4 }).map((_, index) => (
          <Grid key={index} lg={3} md={3} sm={4} xs={6}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                textAlign: 'center',
                cursor: 'pointer',
              }}
            >
              <CardActionArea
                sx={{
                  height: '100%',
                  borderBottomLeftRadius: 0,
                  borderBottomRightRadius: 0,
                }}
              >
                {/* Card Header */}
                <CardHeader
                  title={<Skeleton width="60%" />} sx={{my: 1, width: '100%', }}
                />

                {/* Card Content */}
                <CardContent sx={{ flex: 1, py: 1, justifyContent: 'center', alignItems: 'center' }}>
                  <Stack spacing={1} alignItems="center">
                    <Skeleton width="40%" />
                    <Skeleton width="40%" />
                    <Skeleton width="40%" />
                  </Stack>

                </CardContent>

                {/* Card Actions */}
                <CardActions sx={{ display: 'flex' }}>
                  <Stack direction="row" spacing={2} mx={2} my={1}>
                    <UsersIcon size={20} />
                    <Skeleton width={50} />
                  </Stack>
                </CardActions>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
