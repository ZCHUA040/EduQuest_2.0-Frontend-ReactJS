'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Collapse from '@mui/material/Collapse';
import Divider from '@mui/material/Divider';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TablePagination from '@mui/material/TablePagination';
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { Users as UsersIcon } from '@phosphor-icons/react/dist/ssr/Users';
import type { AnalyticsPartFour, CourseGroup } from "@/types/analytics/analytics-four";

interface CourseTableProps {
  rows?: AnalyticsPartFour[];
  onCourseGroupSelect: (courseGroupAnalytics: CourseGroup) => void;
}

interface CollapsibleRowProps {
  row: AnalyticsPartFour;
  onCourseGroupSelect: (courseGroupAnalytics: CourseGroup) => void;
}

function getTotalStudents(courseGroups: CourseGroup[]): number {
  return courseGroups.reduce((total, group) => total + group.enrolled_students, 0);
}

export function CourseTable({ rows = [], onCourseGroupSelect }: CourseTableProps): React.JSX.Element {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

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


  return (
    <Card>
      <TableContainer component={Box} sx={{ maxHeight: 600 }}>
        <Table stickyHeader aria-label="courses table">
          <TableHead>
            <TableRow>
              {/*<TableCell />*/}
              <TableCell>Course</TableCell>
              <TableCell>Term</TableCell>
              <TableCell>Groups</TableCell>
              <TableCell>Total Students</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row) => (
                <CollapsibleRow key={row.course_id} row={row} onCourseGroupSelect={onCourseGroupSelect} />
              ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Divider />
      <TablePagination
        component="div"
        count={rows.length}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        page={page}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[5, 10, 15]}
      />
    </Card>
  );
}

function CollapsibleRow({ row, onCourseGroupSelect }: CollapsibleRowProps): React.JSX.Element {
  const [open, setOpen] = React.useState(false);
  const handleGroupClick = (group: CourseGroup): void => {
    onCourseGroupSelect(group);
  };
  return (
    <>
      <TableRow
        hover
        onClick={() => { setOpen(!open); }}
        sx={{ cursor: 'pointer', '& > *': { borderBottom: 'unset' }  }}
      >
        <TableCell sx={{ borderBottom: 'unset'}}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Box
              component="img"
              src={`/assets/${row.course_image}`}
              alt={`${row.course_name} image`}
              sx={{ height: '24px', width: '24px', borderRadius: '4px' }}
            />
            <Typography variant="body2">{`${row.course_code} ${row.course_name}`}</Typography>
          </Stack>
        </TableCell>
        <TableCell sx={{ borderBottom: 'unset'}}>
          <Typography variant="body2">{row.course_term}</Typography>
        </TableCell>
        <TableCell sx={{ borderBottom: 'unset'}}>
          <Typography variant="body2">{row.course_groups.length}</Typography>
        </TableCell>
        <TableCell sx={{ borderBottom: 'unset'}}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="body2">{getTotalStudents(row.course_groups)}</Typography>
            <UsersIcon size={18} />
          </Stack>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ padding: 0 }} colSpan={4}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box>
                <Table size="small" aria-label="course groups" >
                  <TableHead sx={{ '& .MuiTableCell-root': { backgroundColor: 'var(--mui-palette-common-white)' } }}>
                    <TableRow >
                      <TableCell sx={{ paddingLeft: 7, py: 2 }}>Group Name</TableCell>
                      <TableCell sx={{ backgroundColor: 'var(--mui-palette-common-white)' }}>Quests</TableCell>
                      <TableCell>Students</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {row.course_groups.map((group) => (
                      <TableRow
                        key={group.group_id}
                        hover
                        onClick={() => { handleGroupClick(group); }}

                        sx={{ cursor: 'pointer'}}
                      >
                        <TableCell
                          sx={{
                            paddingLeft: 7,
                            borderBottom: 'none',
                          }}
                        >
                          {group.group_name}
                        </TableCell>

                        <TableCell sx={{ borderBottom: 'none' }}>
                          {group.quests.length}
                        </TableCell>
                        <TableCell sx={{ borderBottom: 'none' }}>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Typography variant="body2">{group.enrolled_students}</Typography>
                            <UsersIcon size={18} />
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}
