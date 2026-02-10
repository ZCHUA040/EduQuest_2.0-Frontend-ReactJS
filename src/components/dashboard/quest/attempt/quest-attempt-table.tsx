'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Divider from '@mui/material/Divider';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import type { UserQuestAttempt } from '@/types/user-quest-attempt';
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import { formatTime } from "@/components/dashboard/overview/shortest-user"
import {LinearProgressSlim} from "@/components/dashboard/misc/linear-progress-with-label";

interface UserQuestAttemptTableProps {
  questId?: string;
  rows: UserQuestAttempt[];
  totalMaxScore?: number;
  questStatus?: string;
  handleViewAnswerAttempts: (params: { attemptId: string; submitted: boolean; bonusAwarded: boolean }) => void;
}

export function UserQuestAttemptTable({rows = [], totalMaxScore = 0, questStatus, handleViewAnswerAttempts }: UserQuestAttemptTableProps): React.JSX.Element {

  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);

  const handleChangePage = (
    event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number,
  ): void => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ): void => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  return (
    <Card>
      <Box sx={{ overflowX: 'auto' }}>
        <Table sx={{ minWidth: '800px' }}>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>First Attempted On</TableCell>
              <TableCell>Last Attempted On</TableCell>
              <TableCell>Time Taken</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Score</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
              return (
                <TableRow hover key={row.id}>
                  <TableCell>{row.id}</TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      { row.first_attempted_date === null || row.first_attempted_date === "" ? "Not Available"
                        : new Date(row.first_attempted_date).toLocaleTimeString("en-SG", {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit'
                        })
                      }
                    </Typography>
                    <Typography variant="body2">
                      { row.first_attempted_date === null || row.first_attempted_date === "" ? null
                        : new Date(row.first_attempted_date).toLocaleDateString("en-SG", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric"
                        })
                      }
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      { row.last_attempted_date === null || row.last_attempted_date === "" ? "Not Available"
                        : new Date(row.last_attempted_date).toLocaleTimeString("en-SG", {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit'
                        })
                      }

                    </Typography>
                    <Typography variant="body2">
                      { row.last_attempted_date === null || row.last_attempted_date === "" ? null
                        : new Date(row.last_attempted_date).toLocaleDateString("en-SG", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric"
                        })
                      }
                    </Typography>
                  </TableCell>
                  <TableCell>
                    { row.time_taken === 0 ? "Not Available" : formatTime(row.time_taken)}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={row.submitted ? "Submitted" : "In Progress"}
                      color={row.submitted ? "success" : "primary"}
                      variant="outlined"
                      size="small"/>
                  </TableCell>
                  <TableCell sx={{ width: '15%'}}>
                    {row.submitted ?
                      <LinearProgressSlim
                        value={(row.total_score_achieved / totalMaxScore) * 100}
                        text={`${(Math.round(row.total_score_achieved * 100) / 100).toString()} / ${totalMaxScore?.toString()}`} />
                       : "Not Available"}
                  </TableCell>
                  <TableCell>
                    {row.submitted ? (
                      <Button
                        onClick={() => { handleViewAnswerAttempts({attemptId: row.id.toString(), submitted: row.submitted, bonusAwarded: Boolean(row.bonus_awarded)}); }}
                      >
                        View
                      </Button>
                    ) :
                      <Button
                        onClick={() => { handleViewAnswerAttempts({attemptId: row.id.toString(), submitted: row.submitted, bonusAwarded: Boolean(row.bonus_awarded)}); }}
                        disabled={questStatus === 'Expired'}>
                        Continue
                      </Button>
                    }
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Box>
      <Divider />
      <TablePagination
        component="div"
        count={rows.length}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        page={page}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[5, 10, 25]}
      />
    </Card>
  );
}
