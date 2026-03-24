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
import TableSortLabel from '@mui/material/TableSortLabel';

import { type StudentTutorialAttemptRow } from '@/types/analytics/student-tutorial-attempt';
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Points from "../../../../../public/assets/point.svg";

export interface TutorialSessionColumn {
  questId: number;
  courseGroupId: number;
  label: string;
}

interface UserTableProps {
  rows?: StudentTutorialAttemptRow[];
  handleUserSelection: (id: number) => void;
  tutorialSessionColumns?: TutorialSessionColumn[];
  attendanceKeys?: Set<string>;
  showSessionColumns?: boolean;
}

export function StudentTable({
  rows = [],
  handleUserSelection,
  tutorialSessionColumns = [],
  attendanceKeys = new Set<string>(),
  showSessionColumns = true
}: UserTableProps): React.JSX.Element {
  const [activeRow, setActiveRow] = React.useState<number | null>(null);
  const [orderBy, setOrderBy] = React.useState<'id' | 'email' | 'username' | 'points' | 'tutorials'>('id');
  const [orderDirection, setOrderDirection] = React.useState<'asc' | 'desc'>('asc');

  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const safeTutorialSessionColumns = React.useMemo(
    () => tutorialSessionColumns.filter((column) => typeof column.questId === 'number' && !Number.isNaN(column.questId)),
    [tutorialSessionColumns]
  );

  const handleChangePage = (
    event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number,
  ) : void => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) : void => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleRowClick = (id: number): void => {
    setActiveRow(id);
    handleUserSelection(id);
  };

  const handleSort = (column: 'id' | 'email' | 'username' | 'points' | 'tutorials'): void => {
    if (orderBy === column) {
      setOrderDirection(orderDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setOrderBy(column);
      setOrderDirection('asc');
    }
    setPage(0);
  };

  const sortedRows = React.useMemo(() => {
    const copy = [...rows];
    const getValue = (row: StudentTutorialAttemptRow): string | number => {
      switch (orderBy) {
        case 'email':
          return row.email.toLowerCase();
        case 'username':
          return row.username.toLowerCase();
        case 'points':
          return row.total_points;
        case 'tutorials':
          return row.tutorial_percentage;
        case 'id':
        default:
          return row.id;
      }
    };

    copy.sort((a, b) => {
      const aVal = getValue(a);
      const bVal = getValue(b);
      if (aVal < bVal) return orderDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return orderDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return copy;
  }, [rows, orderBy, orderDirection]);


  return (
    <Card>
      <Box sx={{ overflowX: 'auto' }}>
        <Table sx={{ minWidth: '800px' }}>
          <TableHead>
            <TableRow>
              <TableCell sortDirection={orderBy === 'id' ? orderDirection : false}>
                <TableSortLabel
                  active={orderBy === 'id'}
                  direction={orderBy === 'id' ? orderDirection : 'asc'}
                  onClick={() => { handleSort('id'); }}
                >
                  ID
                </TableSortLabel>
              </TableCell>
              <TableCell sortDirection={orderBy === 'username' ? orderDirection : false}>
                <TableSortLabel
                  active={orderBy === 'username'}
                  direction={orderBy === 'username' ? orderDirection : 'asc'}
                  onClick={() => { handleSort('username'); }}
                >
                  Username
                </TableSortLabel>
              </TableCell>
              <TableCell sortDirection={orderBy === 'email' ? orderDirection : false}>
                <TableSortLabel
                  active={orderBy === 'email'}
                  direction={orderBy === 'email' ? orderDirection : 'asc'}
                  onClick={() => { handleSort('email'); }}
                >
                  Email
                </TableSortLabel>
              </TableCell>
              <TableCell sortDirection={orderBy === 'points' ? orderDirection : false}>
                <TableSortLabel
                  active={orderBy === 'points'}
                  direction={orderBy === 'points' ? orderDirection : 'asc'}
                  onClick={() => { handleSort('points'); }}
                >
                  Points
                </TableSortLabel>
              </TableCell>
              {showSessionColumns ? (
                safeTutorialSessionColumns.map((column) => (
                  <TableCell key={`session_header_${column.questId.toString()}`}>
                    {column.label}
                  </TableCell>
                ))
              ) : null}
              <TableCell sortDirection={orderBy === 'tutorials' ? orderDirection : false}>
                <TableSortLabel
                  active={orderBy === 'tutorials'}
                  direction={orderBy === 'tutorials' ? orderDirection : 'asc'}
                  onClick={() => { handleSort('tutorials'); }}
                >
                  Tutorials Attempted
                </TableSortLabel>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
                <TableRow
                  hover
                  key={row.id}
                  onClick={() => { handleRowClick(row.id); }}
                  sx={{
                    textDecoration: 'none',
                    cursor: 'pointer',
                    backgroundColor: activeRow === row.id ? 'rgba(0, 0, 0, 0.08)' : 'inherit'
                  }}
                >
                  <TableCell>{row.id}</TableCell>
                  <TableCell>{row.username}</TableCell>
                  <TableCell>{row.email}</TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <Typography variant="body2" color="text.secondary" >
                        {row.total_points.toFixed(2)}
                      </Typography>
                      <Points height={18}/>
                    </Stack>
                  </TableCell>
                  {showSessionColumns ? (
                    safeTutorialSessionColumns.map((column) => {
                      const attendanceKey = `${column.questId.toString()}_${row.id.toString()}`;
                      const isPresent = attendanceKeys.has(attendanceKey);
                      return (
                        <TableCell key={`session_cell_${attendanceKey}`}>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ userSelect: 'none' }}
                          >
                            {isPresent ? '1' : '0'}
                          </Typography>
                        </TableCell>
                      );
                    })
                  ) : null}
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {row.tutorial_attempted.toString()}/{row.tutorial_total.toString()} ({row.tutorial_percentage.toString()}%)
                    </Typography>
                  </TableCell>
                </TableRow>
            ))}
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
        rowsPerPageOptions={[10, 15, 20]}
      />
    </Card>
  );
}
