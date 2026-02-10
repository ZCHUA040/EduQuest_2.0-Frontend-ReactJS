
/* eslint-disable react/no-array-index-key -- skeleton rows are static placeholders */
"use client";

import * as React from 'react';
import Grid from '@mui/material/Unstable_Grid2'; // Grid version 2
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import CardHeader from "@mui/material/CardHeader";
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import CardActions from "@mui/material/CardActions";
import Button from "@mui/material/Button";
import { FloppyDisk as FloppyDiskIcon } from "@phosphor-icons/react/dist/ssr/FloppyDisk";
import { PaperPlaneTilt as PaperPlaneTiltIcon } from "@phosphor-icons/react/dist/ssr/PaperPlaneTilt";
import {Divider, Stack, Skeleton} from "@mui/material";
import Points from "../../../../public/assets/point.svg";


export function SkeletonAnswerAttemptCard(): React.JSX.Element {
  return (
    <form >
      <FormGroup>
              <Card>
                <CardHeader
                  title={<Skeleton variant="text" width={100} />}
                  subheader={
                    <Stack direction="row" spacing='6px' sx={{ alignItems: 'center', pt: 0.5 }}>
                      <Typography variant="body2"><Skeleton variant="text" width={30}/> </Typography>
                      <Points height={18} />
                    </Stack>
                  }
                />
                <Divider />
                <CardContent>
                  <Grid container spacing={3}>
                    <Grid xs={12}>
                      <Typography variant="subtitle1">
                        <Skeleton variant="text" width={400} />
                      </Typography>
                      <Typography variant="subtitle1">
                        <Skeleton variant="text" width={400} />
                      </Typography>
                    </Grid>
                    {Array.from({ length: 4 }).map((_, index) => (
                      <Grid key={index} md={6} xs={12}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={false}
                            />
                          }
                          label={<Skeleton variant="text" width={200} />}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
                <CardActions sx={{ justifyContent: 'space-between' }}>
                  <Stack direction="row" pl={2}>
                    <Skeleton variant="text" width={100} />
                  </Stack>
                  <Stack direction="row" spacing={1}>
                    <Button
                      startIcon={<FloppyDiskIcon />}
                      variant="outlined"
                      disabled
                    >
                      Save All
                    </Button>
                    <Button
                      endIcon={<PaperPlaneTiltIcon />}
                      type="submit"
                      variant="contained"
                      disabled
                    >
                      Submit All
                    </Button>
                  </Stack>
                </CardActions>
              </Card>
      </FormGroup>
    </form>
  );
}
