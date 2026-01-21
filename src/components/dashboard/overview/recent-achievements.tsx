'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import type { SxProps } from '@mui/material/styles';
import { Typography, Tooltip, Stack } from '@mui/material';
import { TrendUp as TrendUpIcon } from '@phosphor-icons/react/dist/ssr/TrendUp';
import { Info as InfoIcon } from '@phosphor-icons/react/dist/ssr/Info';
import FirstAttemptBadge from "../../../../public/assets/first_attempt_badge.svg";
import PerfectionistBadge from "../../../../public/assets/perfectionist_badge.svg";
import ExpertBadge from "../../../../public/assets/expert_badge.svg";
import SpeedsterBadge from "../../../../public/assets/speedster_badge.svg";
import CompletionistBadge from "../../../../public/assets/completionist_badge.svg";
import FullAttendanceBadge from "../../../../public/assets/full_attendance_badge.svg";
import HalfAttendanceBadge from "../../../../public/assets/half_attendance_badge.svg";
import { User as UserIcon } from "@phosphor-icons/react/dist/ssr/User";
import CardContent from "@mui/material/CardContent";
import RouterLink from "next/link";
import type {RecentBadge} from "@/types/analytics/analytics-three";


export interface RecentAchievementsProps {
  recentBadges: RecentBadge[];
  sx?: SxProps;
}

export function RecentAchievements({ recentBadges = [], sx }: RecentAchievementsProps): React.JSX.Element {
  const getBadgeImage = (badgeName: string): React.JSX.Element | null => {
    switch (badgeName) {
      case 'First Attempt':
        return <FirstAttemptBadge width={30} height={30} />;
      case 'Perfectionist':
        return <PerfectionistBadge width={30} height={30} />;
      case 'Expert':
        return <ExpertBadge width={30} height={30} />;
      case 'Speedster':
        return <SpeedsterBadge width={30} height={30} />;
      case 'Completionist':
        return <CompletionistBadge width={30} height={30} />;
      case 'Full Attendance':
        return <FullAttendanceBadge width={30} height={30} />;
      case 'Half Attendance':
        return <HalfAttendanceBadge width={30} height={30} />;
      default:
        return null;
    }
  };


  // const handleRoute = (id: string, type: 'course' | 'quest'): void => {
  //   router.push(`/dashboard/${type}/${id}`);
  // };

  return (
    <Card sx={{ ...sx, display: 'flex', flexDirection: 'column' }}>
      <Stack direction="row" sx={{ alignItems: 'center' }} spacing={0}>
        <CardHeader
          title="Recent Achievements"
          avatar={
            <TrendUpIcon fontSize="var(--icon-fontSize-md)" color="var(--mui-palette-primary-main)" />
          }
          sx={{ pr: '10px' }}
        />
        <Tooltip title="The most recent achievements made by users." placement="top">
          <InfoIcon fontSize="var(--icon-fontSize-sm)" style={{ marginLeft: '0px', cursor: 'pointer', color: "var(--mui-palette-neutral-500)", marginTop: '16px' }} />
        </Tooltip>
      </Stack>
      <CardContent >
        {recentBadges.length > 0 ? (
          recentBadges.map((recentBadge) => (
            <Stack mb={2} key={recentBadge.record_id}>
              <Box>
                <Typography variant="overline" color="text.secondary" display="block">
                  {new Date(recentBadge.awarded_date).toLocaleDateString("en-SG", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                  })}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2">
                  <Box component="span" sx={{ display: 'inline-block', verticalAlign: 'middle', mr: '4px' }}>
                    <UserIcon width={20} height={20} />
                  </Box>
                  {recentBadge.nickname} has just earned
                  <Tooltip title={`${recentBadge.badge_name} Badge`} placement="top">
                    <Box
                      component="span"
                      sx={{ display: 'inline-block', cursor: 'pointer', verticalAlign: 'middle', mx: 1 }}
                    >
                      {getBadgeImage(recentBadge.badge_name)}
                    </Box>
                  </Tooltip>
                  from
                  <Typography
                    component={RouterLink}
                    variant="body2"
                    sx={{ cursor: 'pointer', mx: '6px', fontWeight: '600', textDecoration: 'none' }}
                    href={`/dashboard/${recentBadge.quest_id ? 'quest' : 'course'}/${recentBadge.quest_id?.toString() ?? recentBadge.course_id.toString()}`}
                    // onClick={() => { handleRoute(recentBadge.quest_id?.toString() ?? recentBadge.course_id.toString(), recentBadge.quest_id ? 'quest' : 'course'); }}
                  >
                    {recentBadge.quest_id ? recentBadge.quest_name : `${recentBadge.course_code} ${recentBadge.course_name}`}
                  </Typography>
                  { recentBadge.quest_id ? `in ${recentBadge.course_code} ${recentBadge.course_name}` : null }
                </Typography>
              </Box>
            </Stack>
          ))
        ) : (
          <Typography variant="subtitle2" align="center" mt={1}>No data available.</Typography>
        )}
      </CardContent>
    </Card>
  );
}
