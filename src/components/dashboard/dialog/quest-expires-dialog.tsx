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
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import {XCircle as XCircleIcon} from "@phosphor-icons/react/dist/ssr/XCircle";
import {CheckCircle as CheckCircleIcon} from "@phosphor-icons/react/dist/ssr/CheckCircle";
import Dialog from "@mui/material/Dialog";
import {type Quest} from "@/types/quest";


interface CourseExpiresDialogProps {
  quest?: Quest;
  openDialog: boolean;
  handleDialogClose: () => void;
  handleDialogConfirm: (status: 'Active' | 'Expired') => void;
}

export function QuestExpiresDialog({ quest, openDialog, handleDialogClose, handleDialogConfirm }: CourseExpiresDialogProps): React.JSX.Element | null {


  if (quest) {
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
            <Typography component='span' >Are you sure you want to set this quest to</Typography>
            <Typography component='span' fontWeight={600} > {quest.status === 'Active' ? 'Expired' : 'Active'}</Typography>
            <Typography component='span' >?</Typography>
          </DialogContentText>
          { quest.status === 'Active' ?
            <Box>
              <DialogContentText id="alert-dialog-description">
                <Typography component='span' >
                  The following state-sensitive badges will be issued to qualified users upon setting the quest to {quest.status === 'Active' ? 'Expired' : 'Active'}:
                </Typography>
                </DialogContentText>
              <Box>
                <List sx={{ width: '100%' }}>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar sx={{ backgroundColor: 'transparent', height: '100%' }} variant="square">
                        <ExpertBadge height={46}/>
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText primary="Expert Badge" secondary="Awarded to the user with the highest score for this quest." />
                  </ListItem>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar sx={{ backgroundColor: 'transparent', height: '100%' }} variant="square">
                        <SpeedsterBadge height={46}/>
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText primary="Speedster Badge" secondary="Awarded to the user with the fastest attempt for this quest. " />
                  </ListItem>
                </List>
              </Box>
              <DialogContentText id="alert-dialog-description">
                <Typography component='span' variant="body2" >*Note: The expiry date of this quest will be</Typography>
                <Typography component='span' variant="body2" fontWeight={600} > reset</Typography>
                <Typography component='span' variant="body2" >.</Typography>

              </DialogContentText>
            </Box>
            :
            <Box>
              <DialogContentText id="alert-dialog-description">
                <Typography component='span' variant="body2" >
                  Setting this quest to {quest.status === 'Active' ? 'Expired' : 'Active'} again
                </Typography>
                <Typography component='span' variant="body2" fontWeight={600} >
                  {` will not `}
                </Typography>
                <Typography component='span' variant="body2" >
                  re-issue the same badges to users who have already received them despite meeting the condition.
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
            onClick={() => { handleDialogConfirm(quest.status === 'Active' ? 'Expired' : 'Active'); }}
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
