import React from 'react';
import { useTheme } from '@mui/material/styles';
import type { ApexOptions } from 'apexcharts';
import { Chart } from '@/components/core/chart';
import { type Quest } from '@/types/analytics/analytics-four';
import Typography from "@mui/material/Typography";

interface ZeroMaxScoreChartProps {
  questProgress: Quest;
}

export function ZeroMaxScoreChart({ questProgress }: ZeroMaxScoreChartProps): React.JSX.Element {

  // Prepare data for participation chart
  const studentParticipation = questProgress.students_progress.map((progress) => {
    const attempted = progress.highest_score !== null;
    return {
      name: progress.username,
      attempted, // true if participated, false otherwise
    };
  });

  // Sort by participation status (participants first)
  studentParticipation.sort((a, b) => {
    if (a.attempted === b.attempted) return 0;
    return a.attempted ? -1 : 1;
  });

  const chartOptions = useChartOptions(
    studentParticipation.map((student) => student.name),
    studentParticipation
  );

  return (
    <div>
      <Typography variant="body2" align="center">
        This quest has a maximum score of 0. Showing participation rates instead.
      </Typography>
      <Chart
        options={chartOptions}
        series={[
          { name: 'Participation', data: studentParticipation.map(() => 1) },
        ]}
        type="bar"
        width="100%"
        height={studentParticipation.length * 40}
      />
    </div>
  );
}

function useChartOptions(
  labels: string[],
  studentParticipation: { name: string; attempted: boolean }[],
): ApexOptions {
  const theme = useTheme();
  return {
    chart: {
      type: 'bar',
      background: 'transparent',
      toolbar: { show: false },
    },
    plotOptions: {
      bar: {
        horizontal: true,
        barHeight: 20,
        borderRadius: 10,
      },
    },
    xaxis: {
      categories: labels,
      max: 1,
      labels: {
        show: false,
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        style: {
          fontFamily: theme.typography.fontFamily,
          fontSize: '12px',
        },
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    dataLabels: {
      enabled: true,
      formatter: (_: number, { dataPointIndex }: { dataPointIndex: number }) => {
        const student = studentParticipation[dataPointIndex];
        return student.attempted ? 'Participated' : 'Did Not Participate';
      },
      style: { fontFamily: theme.typography.fontFamily },
    },
    fill: {
      colors: [
        function setColor ({ dataPointIndex }: { dataPointIndex: number }) {
          const student = studentParticipation[dataPointIndex];
          return student.attempted
            ? theme.palette.primary.main // Color for participants
            : theme.palette.grey[400];   // Grey color for non-participants
        },
      ],
    },
    tooltip: {
      enabled: true,
      x: { show: false },
      style: {
        fontFamily: theme.typography.fontFamily,
      },
      custom: ({ dataPointIndex }: { dataPointIndex: number }) => {
        const student = studentParticipation[dataPointIndex];
        const attempted = student.attempted;

        const tooltipContent = `<div style="padding: 5px 10px; font-size: 12px;">
          <strong>${student.name}</strong><br/>
          ${attempted ? 'Participated in the quest.' : `<div style='color: #f04438;'><em>Did not participate in the quest.</em></div>`}
        </div>`;
        return tooltipContent;
      },
    },
    grid: {
      show: false,
      padding: { top: -10, bottom: -10 },
    },
  };
}
