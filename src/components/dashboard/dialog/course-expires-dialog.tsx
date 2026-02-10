import * as React from 'react';
import Box from '@mui/material/Box';
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import Typography from "@mui/material/Typography";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import Avatar from "@mui/material/Avatar";
import ExpertBadge from "../../../../public/assets/expert_badge.svg";
import ListItemText from "@mui/material/ListItemText";
import SpeedsterBadge from "../../../../public/assets/speedster_badge.svg";
import CompletionistBadge from "../../../../public/assets/completionist_badge.svg";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import {XCircle as XCircleIcon} from "@phosphor-icons/react/dist/ssr/XCircle";
import {CheckCircle as CheckCircleIcon} from "@phosphor-icons/react/dist/ssr/CheckCircle";
import Dialog from "@mui/material/Dialog";
import {type Course} from "@/types/course"; // Grid version 2


interface CourseExpiresDialogProps {
  course?: Course;
  openDialog: boolean;
  handleDialogClose: () => void;
  handleDialogConfirm: (status: 'Active' | 'Expired') => void;
}

export function CourseExpiresDialog({ course, openDialog, handleDialogClose, handleDialogConfirm }: CourseExpiresDialogProps): React.JSX.Element | null {


  if (course) {
    return (
      <Dialog
        open={openDialog}
        onClose={handleDialogClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Confirm State Change</DialogTitle>
        <DialogContent sx={{pb:0}}>
          <DialogContentText id="alert-dialog-description" pb={1}>
            <Typography component='span' >Are you sure you want to set this course to</Typography>
            <Typography component='span' fontWeight={600} > {course.status === 'Active' ? 'Expired' : 'Active'}</Typography>
            <Typography component='span' >?</Typography>
          </DialogContentText>
          { course.status === 'Active' ?
            <Box>
              <DialogContentText id="alert-dialog-description">
                <Typography component='span'>
                  The following state-sensitive badges will be issued to qualified users upon setting this course to {course.status === 'Active' ? 'Expired' : 'Active'}:
                </Typography>
                </DialogContentText>
              <Box>
                <List sx={{ width: '100%' }}>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar sx={{ backgroundColor: 'transparent', height: '100%' }} variant="square">
                        <CompletionistBadge height={46}/>
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText primary="Completionist Badge" secondary="Awarded to the user who have completed all Quests under this course." />
                  </ListItem>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar sx={{ backgroundColor: 'transparent', height: '100%' }} variant="square">
                        <ExpertBadge height={46}/>
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText primary="Expert Badge" secondary="Awarded to the user with the highest score for any quest under this course." />
                  </ListItem>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar sx={{ backgroundColor: 'transparent', height: '100%' }} variant="square">
                        <SpeedsterBadge height={46}/>
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText primary="Speedster Badge" secondary="Awarded to the user with the fastest attempt for any quest under this course." />
                  </ListItem>
                </List>
              </Box>
              <DialogContentText id="alert-dialog-description">
                <Typography component='span' variant="body2">
                  *Note: All the Active Quests under this Course will be set to
                </Typography>
                <Typography component='span' fontWeight={600} variant="body2">
                  {` Expired`}
                </Typography>
                <Typography component='span' variant="body2">
                  .
                </Typography>

              </DialogContentText>
            </Box>
            :
            <Box>
              <DialogContentText id="alert-dialog-description">
                <Typography component='span'>
                  Setting this Course to {course.status === 'Active' ? 'Expired' : 'Active'} again will not re-issue the same badges to users who have already received them.
                </Typography>
                </DialogContentText>
              <DialogContentText id="alert-dialog-description">
                <Typography component='span' variant="body2">
                  *Note: All the Expired Quests under this Course will
                </Typography>
                <Typography component='span' fontWeight={600} variant="body2">
                  {` not `}
                </Typography>
                <Typography component='span' variant="body2">
                  be set to
                </Typography>
                <Typography component='span' variant="body2">
                  {` Active`}
                </Typography>
                <Typography component='span' variant="body2">
                  .
                </Typography>

              </DialogContentText>
            </Box>
          }
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="error" startIcon={<XCircleIcon />} >
            Cancel
          </Button>
          <Button
            onClick={() => { handleDialogConfirm(course.status === 'Active' ? 'Expired' : 'Active'); }}
            color="primary"
            variant="contained"
            startIcon={<CheckCircleIcon />}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
    return null;


}
