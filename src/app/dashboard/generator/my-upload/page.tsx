"use client"
import * as React from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { logger } from '@/lib/default-logger'
import {useUser} from "@/hooks/use-user";
import type { Document } from "@/types/document";
import { SkeletonBadgeCard } from '@/components/dashboard/skeleton/skeleton-badge-card';
import { DocumentCard } from "@/components/dashboard/generator/document-card";
import {getMyDocuments} from "@/api/services/document";



export default function Page(): React.JSX.Element {
  const { eduquestUser } = useUser();
  const [documents, setDocuments] = React.useState<Document[]>([]);
  const [loadingDocuments, setLoadingDocuments] = React.useState(true);



  const fetchMyDocuments = React.useCallback(async (): Promise<void> => {
    if (eduquestUser) {
      try {
        const response = await getMyDocuments(eduquestUser.id.toString());
        setDocuments(response);
        logger.debug('Documents', response);
      } catch (error: unknown) {
        logger.error('Failed to fetch documents', error);
      } finally {
        setLoadingDocuments(false);
      }
    }
  }, [eduquestUser]);

  const handleDeleteSuccess = async (): Promise<void> => {
    await fetchMyDocuments();
  }

  const handleSubmitSuccess = async (): Promise<void> => {
    await fetchMyDocuments();
  }


  React.useEffect(() => {
    const fetchData = async (): Promise<void> => {
      await fetchMyDocuments();
    };

    fetchData().catch((error: unknown) => {
      logger.error('Failed to fetch data', error);
    });
  }, [fetchMyDocuments]);


  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={3}>
        <Stack spacing={1} >
          <Typography variant="h4">My Documents</Typography>
          <Typography variant="body2" color="text.secondary">You can upload lecture materials here and use them to generate quests and questions!</Typography>

        </Stack>

      </Stack>


      <Stack spacing={1} sx={{ flex: '1 1 auto' }}>

            { loadingDocuments ? <SkeletonBadgeCard/>
            :
              ( documents ?
                  <DocumentCard
                    documents={documents}
                    handleDeleteSuccess={handleDeleteSuccess}
                    handleSubmitSuccess={handleSubmitSuccess}
                  /> :
               null
              )
            }


      </Stack>
    </Stack>

  );
}
