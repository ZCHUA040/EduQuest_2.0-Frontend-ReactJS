/* eslint-disable react/no-array-index-key -- skeleton rows are static placeholders */
import * as React from 'react';
import Card from '@mui/material/Card';
import Skeleton from '@mui/material/Skeleton';
import CardHeader from "@mui/material/CardHeader";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import {Info as InfoIcon} from "@phosphor-icons/react/dist/ssr/Info";
import CardContent from "@mui/material/CardContent";
import {Medal as MedalIcon} from "@phosphor-icons/react/dist/ssr/Medal";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import {CaretRight as CaretRightIcon} from "@phosphor-icons/react/dist/ssr/CaretRight";
import RouterLink from "next/link";
import {paths} from "@/paths";
import CardActions from "@mui/material/CardActions";

export function SkeletonMyBadgeProgress(): React.JSX.Element {
  return (
    <Card sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Stack direction="row" sx={{ alignItems: 'center' }} spacing={0}>
        <CardHeader
          title="My Badges"
          avatar={
            <MedalIcon fontSize="var(--icon-fontSize-md)" color="var(--mui-palette-primary-main)" />
          }
          sx={{ pr: '10px'}}
        />
        <Tooltip title="The badges that you have earned so far." placement="top" >
          <InfoIcon fontSize="var(--icon-fontSize-sm)" style={{ marginLeft: '0px', cursor: 'pointer', color: 'var(--mui-palette-neutral-500)', marginTop: '16px'}} />
        </Tooltip>
      </Stack>
      <CardContent sx={{ height: "100%", py:1, pb:0}}>
        <Stack
          direction="column"
          justifyContent="space-evenly"
          alignItems="center"
          spacing={2}
          height="100%"
          px={1}
        >
          {Array.from({ length: 5 }).map((_, index) => (
            <Stack alignItems="center" direction="row" key={index} justifyContent="center" width="100%">

              <Box sx={{ flexGrow: 1 }}>
                <Skeleton variant="rounded" height={20}/>
              </Box>
            </Stack>
          ))}
        </Stack>
      </CardContent>
      <CardActions sx={{justifyContent: "flex-end"}}>
        <Button size="small" endIcon={<CaretRightIcon/>} component={RouterLink} href={paths.dashboard.badge.my}>
          View
        </Button>
      </CardActions>
    </Card>
  );
}
