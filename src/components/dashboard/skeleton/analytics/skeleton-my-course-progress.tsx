/* eslint-disable react/no-array-index-key -- skeleton rows are static placeholders */
import * as React from 'react';
import Card from '@mui/material/Card';
import Skeleton from '@mui/material/Skeleton';
import CardHeader from "@mui/material/CardHeader";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import {Info as InfoIcon} from "@phosphor-icons/react/dist/ssr/Info";
import {Typography} from "@mui/material";
import {Book as BookIcon} from "@phosphor-icons/react/dist/ssr/Book";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Unstable_Grid2";
import type {SxProps} from "@mui/material/styles";
import Box from "@mui/material/Box";

interface SkeletonMyCourseProgressProps {
  sx?: SxProps;
  title: string;
  tooltip: string;
}


export function SkeletonMyCourseProgress({ sx, title, tooltip,  }: SkeletonMyCourseProgressProps): React.JSX.Element {
  return (
    <Card sx={{ ...sx, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <Stack direction="row" sx={{ alignItems: 'center' }} spacing={0}>
        <CardHeader
          title={title}
          avatar={
            <BookIcon fontSize="var(--icon-fontSize-md)" color="var(--mui-palette-primary-main)" />
          }
          sx={{ pr: '10px'}}
        />
        <Tooltip title={tooltip} placement="top" >
          <InfoIcon fontSize="var(--icon-fontSize-sm)" style={{ marginLeft: '0px', cursor: 'pointer', color: 'var(--mui-palette-neutral-500)', marginTop: '16px'}} />
        </Tooltip>
      </Stack>
      <CardContent sx={{ justifyContent: 'center', alignItems: 'center'}}>

          <Stack
            direction="column"
          >
            <Grid container spacing={3} >
              {Array.from({ length: 2 }).map((_, index) => (
                <Grid sm={6} xs={12}
                      key={index}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', my: 2 }}>
                    <Skeleton variant="circular" width={120} height={120} />
                  </Box>
                  <Typography variant="body2" align="center" my={2}><Skeleton /></Typography>
                  <Typography variant="body2" align="center" my={2}><Skeleton /></Typography>
                </Grid>
              )) }
            </Grid>
          </Stack>

      </CardContent>
    </Card>
  );
}
