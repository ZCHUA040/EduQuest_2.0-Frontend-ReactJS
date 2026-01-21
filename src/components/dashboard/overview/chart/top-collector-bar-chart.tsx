import * as React from 'react';
import { useTheme } from '@mui/material/styles';
import type { ApexOptions } from 'apexcharts';
import { Chart } from '@/components/core/chart';
import type {TopCollector} from "@/types/analytics/analytics-three";


interface TopCollectorsProps {
  topCollectors?: TopCollector[];
}

export function TopCollectorBarChart({ topCollectors = [] }: TopCollectorsProps): React.JSX.Element {
  // Sort topUsersWithMostBadges by the number of badges in descending order
  const sortedTopUsers = [...topCollectors].sort((a, b) => b.badge_count - a.badge_count);

  // Extract nicknames and badge counts
  const nicknames = sortedTopUsers.map(user => user.nickname);
  const badgeCounts = sortedTopUsers.map(user => user.badge_count);
  const badgeDetails = sortedTopUsers.map(user => {
    const badgeMap: Record<string, { count: number, image: string }> = {};

    // Process quest badges
    user.quest_badges.forEach(questBadge => {
      if (!badgeMap[questBadge.badge_name]) {
        badgeMap[questBadge.badge_name] = { count: 0, image: `assets/${questBadge.badge_filename}` };
      }
      badgeMap[questBadge.badge_name].count += questBadge.count;
    });

    // Process course badges
    user.course_badges.forEach(courseBadge => {
      if (!badgeMap[courseBadge.badge_name]) {
        badgeMap[courseBadge.badge_name] = { count: 0, image: `assets/${courseBadge.badge_filename}` };
      }
      badgeMap[courseBadge.badge_name].count += courseBadge.count;
    });

    return badgeMap;
  });

  const chartOptions = useChartOptions(nicknames, badgeCounts, badgeDetails);

  return (
    <Chart
      options={chartOptions}
      series={[{ name: 'Total Badges', data: badgeCounts }]}
      type="bar"
      width="100%"
      height="auto"
    />
  );
}

function useChartOptions(labels: string[], data: number[], badgeDetails: Record<string, { count: number, image: string }>[]): ApexOptions {
  const theme = useTheme();
  const maxValue = Math.max(...data);
  return {
    chart: {
      type: 'bar',
      background: 'transparent',
      toolbar: { show: false },
      // sparkline: { enabled: true },
    },
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 10,
        borderRadiusApplication: 'end',
        barHeight: 20,
        // columnWidth: '50%',
        colors: {
          backgroundBarColors: ['transparent'],
          backgroundBarRadius: 0,
        },

      },
    },
    states: {
      hover: {
        filter: {
          type: 'none',
          value: 0,
        }
      },
      active: {
        allowMultipleDataPointsSelection: false,
        filter: {
          type: 'none',
          value: 0,
        }
      }
    },
    legend: {
      show: false
    },
    xaxis: {
      categories: labels,
      max: maxValue,
      labels: {
        show: false,
      },
      axisBorder: { show: false },
      axisTicks: { show: false }
    },
    yaxis: {
      show: true,
      labels: {
        show: true,
        style: {
          fontFamily: theme.typography.fontFamily,
          fontSize: '12px',
          colors: [theme.palette.text.primary],
        },
      },
      axisBorder: { show: false },
      axisTicks: { show: false }
    },
    dataLabels: {
      enabled: true,
      formatter: (val: number) => Math.round(val).toString(),
      style: {
        fontFamily: theme.typography.fontFamily,
        colors: [theme.palette.text.primary],
      }
    },
    fill: {
      colors: [theme.palette.primary.main],
    },
    tooltip: {
      enabled: true,
      style: {
        fontFamily: theme.typography.fontFamily,
      },

      custom: ({ dataPointIndex }) => {
        /* eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- dataPointIndex is a number */
        const details = badgeDetails[dataPointIndex];
        const detailStrings = Object.entries(details).map(([name, { count, image }]) => `
          <div style="display: flex; align-items: center;">
            <img src="${image}" alt="${name}" style="width: 26px; height: 26px; margin-right: 5px; margin-bottom: 5px; margin-top: 5px" />
            ${name}: ${count.toString()}
          </div>
        `);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- dataPointIndex is a number
        return `<div style=" font-size: 12px; font-weight: 600; color: #373d3f; padding: 5px 10px; background: #f3f4f5; border-bottom: 1px solid #e3e4e5;">${labels[dataPointIndex]}</div>
          <div style="padding: 5px 10px;  font-size: 12px;">
            ${detailStrings.join('')}
          </div>
        `;
      }
    },
    grid: {
      show: false,
    },
  };
}
