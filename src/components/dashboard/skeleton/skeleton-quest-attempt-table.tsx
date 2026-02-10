/* eslint-disable react/no-array-index-key -- skeleton rows are static placeholders */
import * as React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Skeleton from '@mui/material/Skeleton';
import Divider from '@mui/material/Divider';
import Typography from "@mui/material/Typography";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import TablePagination from "@mui/material/TablePagination";
import {noop} from "@babel/types";

export function SkeletonQuestAttemptTable(): React.JSX.Element {
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
            {Array.from({ length: 3 }).map((_, index) => (
              <TableRow hover key={index}>
                <TableCell><Typography variant="body2"><Skeleton/></Typography></TableCell>
                <TableCell><Typography variant="body2"><Skeleton/></Typography></TableCell>
                <TableCell><Typography variant="body2"><Skeleton/></Typography></TableCell>
                <TableCell><Typography variant="body2"><Skeleton/></Typography></TableCell>
                <TableCell><Typography variant="body2"><Skeleton/></Typography></TableCell>
                <TableCell sx={{ width: '15%'}}><Typography variant="body2"><Skeleton/></Typography></TableCell>
                <TableCell><Typography variant="body2"><Skeleton/></Typography></TableCell>
              </TableRow>
              ))}
          </TableBody>
        </Table>
      </Box>
      <Divider />
      <TablePagination
        component="div"
        count={0} // Arbitrary value for skeleton
        page={0} // Arbitrary value for skeleton
        rowsPerPage={5}
        rowsPerPageOptions={[5, 10, 25]}
        onPageChange={() => {noop()}} // No-op function for skeleton
        onRowsPerPageChange={() => {noop()}} // No-op function for skeleton
      />
    </Card>
  );
}
