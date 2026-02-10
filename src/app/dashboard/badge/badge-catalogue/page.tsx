"use client"
import * as React from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import { logger } from '@/lib/default-logger';
import type { Badge } from "@/types/badge";
import type { Image } from "@/types/image";
import { BadgeCard } from "@/components/dashboard/badge/badge-card";
import { SkeletonBadgeCard } from "@/components/dashboard/skeleton/skeleton-badge-card";
import { createBadge, deleteBadge, getBadges, updateBadge } from "@/api/services/badge";
import { getImages } from "@/api/services/image";
import { useUser } from "@/hooks/use-user";

interface BadgeFormState {
  name: string;
  description: string;
  type: string;
  condition: string;
  imageId: string;
}

const emptyBadgeForm: BadgeFormState = {
  name: '',
  description: '',
  type: '',
  condition: '',
  imageId: '',
};

export default function Page(): React.JSX.Element {
  const { eduquestUser } = useUser();
  const [badges, setBadges] = React.useState<Badge[]>([]);
  const [images, setImages] = React.useState<Image[]>([]);
  const [loadingBadge, setLoadingBadge] = React.useState(true);
  const [manageAnchorEl, setManageAnchorEl] = React.useState<null | HTMLElement>(null);
  const [isAddOpen, setIsAddOpen] = React.useState(false);
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
  const [selectedBadgeId, setSelectedBadgeId] = React.useState<number | ''>('');
  const [badgeForm, setBadgeForm] = React.useState<BadgeFormState>(emptyBadgeForm);
  const [manageError, setManageError] = React.useState<string | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);
  const canManageBadges = Boolean(eduquestUser?.is_staff || eduquestUser?.is_superuser);

  const fetchMyCourseBadges = async (): Promise<void> => {
    try {
      const response = await getBadges();
      setBadges(response);
    } catch (error: unknown) {
      logger.error('Failed to fetch badge catalogue', error);
    } finally {
      setLoadingBadge(false);
    }
  };

  const fetchImages = async (): Promise<void> => {
    try {
      const response = await getImages();
      setImages(response);
    } catch (error: unknown) {
      logger.error('Failed to fetch images', error);
    }
  };

  const handleOpenManage = (event: React.MouseEvent<HTMLElement>): void => {
    setManageAnchorEl(event.currentTarget);
  };

  const handleCloseManage = (): void => {
    setManageAnchorEl(null);
  };

  const handleOpenAdd = (): void => {
    handleCloseManage();
    setManageError(null);
    setBadgeForm(emptyBadgeForm);
    setIsAddOpen(true);
  };

  const handleOpenEdit = (): void => {
    handleCloseManage();
    setManageError(null);
    setSelectedBadgeId('');
    setBadgeForm(emptyBadgeForm);
    setIsEditOpen(true);
  };

  const handleOpenDelete = (): void => {
    handleCloseManage();
    setManageError(null);
    setSelectedBadgeId('');
    setIsDeleteOpen(true);
  };

  const handleCloseDialogs = (): void => {
    setIsAddOpen(false);
    setIsEditOpen(false);
    setIsDeleteOpen(false);
  };

  const handleBadgeSelect = (value: number | ''): void => {
    setSelectedBadgeId(value);
    if (value === '') {
      setBadgeForm(emptyBadgeForm);
      return;
    }
    const badge = badges.find((item) => item.id === value);
    if (!badge) {
      setBadgeForm(emptyBadgeForm);
      return;
    }
    setBadgeForm({
      name: badge.name,
      description: badge.description,
      type: badge.type,
      condition: badge.condition,
      imageId: String(badge.image.id),
    });
  };

  const handleBadgeFormChange = (field: keyof BadgeFormState, value: string): void => {
    setBadgeForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddBadge = async (): Promise<void> => {
    if (!badgeForm.imageId) {
      setManageError('Please select a badge image.');
      return;
    }
    setIsSaving(true);
    setManageError(null);
    try {
      await createBadge({
        name: badgeForm.name.trim(),
        description: badgeForm.description.trim(),
        type: badgeForm.type.trim(),
        condition: badgeForm.condition.trim(),
        image_id: Number(badgeForm.imageId),
      });
      await fetchMyCourseBadges();
      setIsAddOpen(false);
    } catch (error: unknown) {
      logger.error('Failed to create badge', error);
      setManageError('Failed to create badge. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateBadge = async (): Promise<void> => {
    if (selectedBadgeId === '') {
      setManageError('Please select a badge to edit.');
      return;
    }
    if (!badgeForm.imageId) {
      setManageError('Please select a badge image.');
      return;
    }
    setIsSaving(true);
    setManageError(null);
    try {
      await updateBadge(selectedBadgeId, {
        name: badgeForm.name.trim(),
        description: badgeForm.description.trim(),
        type: badgeForm.type.trim(),
        condition: badgeForm.condition.trim(),
        image_id: Number(badgeForm.imageId),
      });
      await fetchMyCourseBadges();
      setIsEditOpen(false);
    } catch (error: unknown) {
      logger.error('Failed to update badge', error);
      setManageError('Failed to update badge. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteBadge = async (): Promise<void> => {
    if (selectedBadgeId === '') {
      setManageError('Please select a badge to delete.');
      return;
    }
    setIsSaving(true);
    setManageError(null);
    try {
      await deleteBadge(selectedBadgeId);
      await fetchMyCourseBadges();
      setIsDeleteOpen(false);
    } catch (error: unknown) {
      logger.error('Failed to delete badge', error);
      setManageError('Failed to delete badge. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  React.useEffect(() => {
    const fetchData = async (): Promise<void> => {
      await fetchMyCourseBadges();
      await fetchImages();
    };

    fetchData().catch((error: unknown) => {
      logger.error('Failed to fetch data', error);
    });
  }, []);

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={3} alignItems="center" justifyContent="space-between">
        <Stack spacing={1}>
          <Typography variant="h4">Badge Catalogue</Typography>
        </Stack>
        {canManageBadges ? (
          <Button variant="outlined" onClick={handleOpenManage}>
            Manage Badges
          </Button>
        ) : null}
      </Stack>

      <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
        {loadingBadge ? <SkeletonBadgeCard /> : (
          badges.length === 0 ? (
            <Typography variant="h6" align="center" mt={4}>No data available.</Typography>
          ) :
          <BadgeCard badges={badges} />
        )}
      </Stack>

      <Menu
        anchorEl={manageAnchorEl}
        open={Boolean(manageAnchorEl)}
        onClose={handleCloseManage}
      >
        <MenuItem onClick={handleOpenAdd}>Add badge</MenuItem>
        <MenuItem onClick={handleOpenEdit}>Edit badge</MenuItem>
        <MenuItem onClick={handleOpenDelete}>Delete badge</MenuItem>
      </Menu>

      <Dialog open={isAddOpen} onClose={handleCloseDialogs} maxWidth="sm" fullWidth>
        <DialogTitle>Add badge</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            label="Name"
            value={badgeForm.name}
            onChange={(event) => { handleBadgeFormChange('name', event.target.value); }}
          />
          <TextField
            label="Description"
            value={badgeForm.description}
            onChange={(event) => { handleBadgeFormChange('description', event.target.value); }}
            multiline
            minRows={2}
          />
          <TextField
            label="Type"
            value={badgeForm.type}
            onChange={(event) => { handleBadgeFormChange('type', event.target.value); }}
          />
          <TextField
            label="Condition"
            value={badgeForm.condition}
            onChange={(event) => { handleBadgeFormChange('condition', event.target.value); }}
            helperText="Separate multiple conditions with commas."
          />
          <FormControl>
            <InputLabel id="badge-image-label">Badge image</InputLabel>
            <Select
              labelId="badge-image-label"
              label="Badge image"
              value={badgeForm.imageId}
              onChange={(event) => { handleBadgeFormChange('imageId', String(event.target.value)); }}
            >
              {images.map((image) => (
                <MenuItem key={image.id} value={String(image.id)}>
                  {image.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {manageError ? (
            <Typography variant="body2" color="error">
              {manageError}
            </Typography>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogs}>Cancel</Button>
          <Button variant="contained" onClick={handleAddBadge} disabled={isSaving}>
            Add badge
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={isEditOpen} onClose={handleCloseDialogs} maxWidth="sm" fullWidth>
        <DialogTitle>Edit badge</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <FormControl>
            <InputLabel id="badge-select-label">Select badge</InputLabel>
            <Select
              labelId="badge-select-label"
              label="Select badge"
              value={selectedBadgeId === '' ? '' : String(selectedBadgeId)}
              onChange={(event) => {
                const value = event.target.value === '' ? '' : Number(event.target.value);
                handleBadgeSelect(value);
              }}
            >
              {badges.map((badge) => (
                <MenuItem key={badge.id} value={String(badge.id)}>
                  {badge.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Name"
            value={badgeForm.name}
            onChange={(event) => { handleBadgeFormChange('name', event.target.value); }}
            disabled={selectedBadgeId === ''}
          />
          <TextField
            label="Description"
            value={badgeForm.description}
            onChange={(event) => { handleBadgeFormChange('description', event.target.value); }}
            multiline
            minRows={2}
            disabled={selectedBadgeId === ''}
          />
          <TextField
            label="Type"
            value={badgeForm.type}
            onChange={(event) => { handleBadgeFormChange('type', event.target.value); }}
            disabled={selectedBadgeId === ''}
          />
          <TextField
            label="Condition"
            value={badgeForm.condition}
            onChange={(event) => { handleBadgeFormChange('condition', event.target.value); }}
            helperText="Separate multiple conditions with commas."
            disabled={selectedBadgeId === ''}
          />
          <FormControl disabled={selectedBadgeId === ''}>
            <InputLabel id="badge-edit-image-label">Badge image</InputLabel>
            <Select
              labelId="badge-edit-image-label"
              label="Badge image"
              value={badgeForm.imageId}
              onChange={(event) => { handleBadgeFormChange('imageId', String(event.target.value)); }}
            >
              {images.map((image) => (
                <MenuItem key={image.id} value={String(image.id)}>
                  {image.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {manageError ? (
            <Typography variant="body2" color="error">
              {manageError}
            </Typography>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogs}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleUpdateBadge}
            disabled={isSaving || selectedBadgeId === ''}
          >
            Save changes
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={isDeleteOpen} onClose={handleCloseDialogs} maxWidth="sm" fullWidth>
        <DialogTitle>Delete badge</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <FormControl>
            <InputLabel id="badge-delete-label">Select badge</InputLabel>
            <Select
              labelId="badge-delete-label"
              label="Select badge"
              value={selectedBadgeId === '' ? '' : String(selectedBadgeId)}
              onChange={(event) => {
                const value = event.target.value === '' ? '' : Number(event.target.value);
                setSelectedBadgeId(value);
              }}
            >
              {badges.map((badge) => (
                <MenuItem key={badge.id} value={String(badge.id)}>
                  {badge.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {manageError ? (
            <Typography variant="body2" color="error">
              {manageError}
            </Typography>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogs}>Cancel</Button>
          <Button
            color="error"
            variant="contained"
            onClick={handleDeleteBadge}
            disabled={isSaving || selectedBadgeId === ''}
          >
            Delete badge
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
