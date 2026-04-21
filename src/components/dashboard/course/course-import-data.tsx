"use client";

import * as React from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from "@mui/material/Stack";
import { X } from "@phosphor-icons/react";

interface ImportDataFormProps {
    open: boolean;
    setOpen: (open: boolean) => void;
}

export function ImportDataForm({open, setOpen}: ImportDataFormProps): React.JSX.Element {
    const [name, setName] = React.useState('');
    const [file, setFile] = React.useState<File | null>(null);

    const handleClose = () => {
        setOpen(false);
    };

    const handleSubmit = () => {
        console.log(name);
        console.log(file);
        handleClose();
    };

    return (
    <React.Fragment>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>
            <Stack direction="row" sx={{ alignContent: 'space-between', justifyContent: 'space-between' }}>
            Add Test Results
            <Button startIcon={<X fontSize="var(--icon-fontSize-md)" />} onClick={handleClose}></Button>
            </Stack>
        </DialogTitle>
        <DialogContent>
            <label htmlFor="name">File Name</label>
            <TextField
                margin="dense"
                fullWidth
                variant="standard"
                id="name"
                value={name}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                    setName(event.target.value);
                }}
            />
            <label htmlFor="file-upload" style={{ marginTop: '16px', display: 'block' }}>
              Upload File
            </label>
            <Button
            variant="contained"
            component="label"
            >
            Upload File
            <input
                type="file"
                id="file-upload"
                name="file"
                accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                hidden
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                    if (event.target.files && event.target.files.length > 0) {
                        setFile(event.target.files[0]);
                    }
                }}
            />
            </Button>
            <p>{file ? file.name : 'No file selected'}</p>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit}>Submit</Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}