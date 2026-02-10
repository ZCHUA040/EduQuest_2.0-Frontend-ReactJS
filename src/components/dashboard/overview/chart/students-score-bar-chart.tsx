import * as React from 'react';
import { alpha, useTheme } from '@mui/material/styles';
import type { ApexOptions } from 'apexcharts';
import { Chart } from '@/components/core/chart';
import { logger } from "@/lib/default-logger";
import type { Quest } from "@/types/analytics/analytics-four";

export interface StudentsScoreBarChartProps {
  questProgress: Quest;
}

export function StudentsScoreBarChart({ questProgress }: StudentsScoreBarChartProps): React.JSX.Element {

  const userNames = questProgress.students_progress.map((progress) => progress.username);
  // Updated Mapping with Attempt Status
  const studentScores = questProgress.students_progress.map((progress) => {
    const attempted = progress.highest_score !== null;
    const highestScore = progress.highest_score !== null ? progress.highest_score : 0;
    const notScored = progress.highest_score !== null ? (questProgress.quest_max_score - progress.highest_score) : questProgress.quest_max_score;

    return {
      name: progress.username,
      highest_score: highestScore,
      not_scored: notScored,
      attempted, // Flag to indicate if the student attempted the quest
    };
  });

  // Sort studentScores based on highest_score in descending order
  studentScores.sort((a, b) => b.highest_score - a.highest_score);

  const chartOptions = useChartOptions(userNames, studentScores);

  logger.debug('Students Scores', studentScores);

  return (
    <Chart
      options={chartOptions}
      series={[
        { name: 'Highest Score', data: studentScores.map(quest => quest.highest_score) },
        { name: 'Not Scored', data: studentScores.map(quest => quest.not_scored) }
      ]}
      type="bar"
      width="100%"
      height={studentScores.length * 40}
      align="center"
    />
  );
}

function useChartOptions(labels: string[], studentScores: { name: string; highest_score: number; not_scored: number; attempted: boolean }[]): ApexOptions {
  const theme = useTheme();
  return {
    chart: {
      type: 'bar',
      background: 'transparent',
      stacked: true,
      stackType: '100%',
      toolbar: { show: false },
      // sparkline: { enabled: true }
    },
    legend: { show: false },
    plotOptions: {
      bar: {
        horizontal: true,
        barHeight: 20,
        borderRadius: 10,
        borderRadiusApplication: 'around',
        borderRadiusWhenStacked: 'all',
        colors: {
          backgroundBarColors: [alpha(theme.palette.grey[400], 0.5)],
          backgroundBarRadius: 10,
        },
        dataLabels: { orientation: 'horizontal' },
      },
    },
    xaxis: {
      categories: labels,
      max: 100,
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
        },
      },
      axisBorder: { show: false },
      axisTicks: { show: false }
    },
    dataLabels: {
      enabled: true,
      formatter: (val: number) => `${val.toFixed(0)}%`,
      style: { fontFamily: theme.typography.fontFamily },
    },
    fill: {
      colors: [theme.palette.primary.main, 'transparent'],
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
    tooltip: {
      enabled: true,
      x: { show: false },
      style: {
        fontFamily: theme.typography.fontFamily,
      },
      custom: ({ dataPointIndex }: { dataPointIndex: number }) => {
        const student = studentScores[dataPointIndex];
        const highest = student.highest_score;
        const notScored = student.not_scored;
        const attempted = student.attempted;

        const tooltipContent =
          `<div style="padding: 5px 10px; font-size: 12px;">
            <strong>${student.name}</strong><br/>
            Highest Score: ${highest.toString()}<br/>
            Not Scored: ${notScored.toString()}<br/>
            <div style="color: #f04438;">
            ${!attempted ? '<em>Did not attempt the quest.</em>' : ''}
            </div>
          </div>`;
        return tooltipContent;
      }
    },
    grid: {
      show: false,
      padding: { top: -20, bottom: -10 },
    },
  };
}
