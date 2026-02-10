import React from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Unstable_Grid2';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { CheckCircle as CheckCircleIcon } from "@phosphor-icons/react/dist/ssr/CheckCircle";
import CardActionArea from "@mui/material/CardActionArea";
import CardMedia from "@mui/material/CardMedia";
import Stack from "@mui/material/Stack";
import type { Badge } from "@/types/badge";

interface BadgeCardProps {
  badges?: Badge[];
}

export function BadgeCard({ badges = [] }: BadgeCardProps): React.JSX.Element {
  return (
    <Box>
      <Grid container spacing={4}>
        {badges.map((badge) => (
          <Grid key={badge.id} lg={3} md={4} xs={12}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }} className="card"> {/* Add className="card" */}
              <CardActionArea href='#' sx={{ height: '100%', borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}>
                <div className="badge-container">  {/* Wrapping div with perspective */}
                  <CardMedia
                    component="img"
                    alt={badge.image.name}
                    image={`/assets/${badge.image.filename}`}
                    className="badge"  // Apply the badge class
                  />
                </div>
                <CardContent sx={{ flex: 1 }}>
                  <Typography variant="h6" mb={3} align="center">
                    {badge.name}
                  </Typography>
                  <Typography variant="body2" mb={2}>
                    {badge.description}
                  </Typography>
                  <Typography variant="overline" color="text.secondary">Condition</Typography>
                  <Stack component="ul" spacing={1} style={{ listStyleType: 'none', paddingLeft: 0 }}>
                    {badge.condition.split(',').map((condition) => (
                      <li key={`${String(badge.id)}-${condition.trim()}`} style={{ display: 'flex', alignItems: 'center' }}>
                        <CheckCircleIcon size={22} style={{ flexShrink: 0, marginRight: '8px' }} color="#66bb6a" />
                        <Typography variant="body2">{condition.trim()}</Typography>
                      </li>
                    ))}
                  </Stack>
                </CardContent>
              </CardActionArea>
            </Card>

          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
