"use client"
import * as React from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {ImportCard} from "@/components/dashboard/import/import-card";
import type { Question } from '@/types/question';
import {type Quest} from "@/types/quest";
import Alert from "@mui/material/Alert";
import RouterLink from "next/link";



export default function Page(): React.JSX.Element {

  const [newQuestId, setNewQuestId] = React.useState<Quest['id'] | null>(null);
  const [imported, setImported] = React.useState(false);

  const handleQuestions = (q: Question[]): void => {
    if (q.length > 0) {
      setNewQuestId(q[0].quest_id);
      setImported(true);
    }
  }

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={3}>
        <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
          <Typography variant="h4">Import Quest Attempts</Typography>
          <Typography variant="body2" color="text.secondary">Import external quest conducted during tutorial sessions</Typography>
        </Stack>


      </Stack>
      {!imported ? (
        <ImportCard courseGroupId={null} onImportSuccess={handleQuestions}/>
      ) : (
        <Alert severity="success">
          Quest import successful. Edit the quest to update correct answers and regrade student attempts.
          {newQuestId ? (
            <>
              {' '}<RouterLink href={`/dashboard/quest/${newQuestId.toString()}`}>Go to Quest</RouterLink>
            </>
          ) : null}
        </Alert>
      )}

    </Stack>
  );
}
