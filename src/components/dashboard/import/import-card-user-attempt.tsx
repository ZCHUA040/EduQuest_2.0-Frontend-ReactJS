import * as React from 'react';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import CardHeader from "@mui/material/CardHeader";
import Divider from "@mui/material/Divider";
import Button from "@mui/material/Button";
import { CheckFat as CheckFatIcon} from "@phosphor-icons/react/dist/ssr/CheckFat";
import {logger} from "@/lib/default-logger";
import Box from "@mui/material/Box";
import {useRouter} from "next/navigation";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import LinearProgress from "@mui/material/LinearProgress";
import Pagination from "@mui/material/Pagination";
import {Loading} from "@/components/dashboard/loading/loading";
import { CheckCircle as CheckCircleIcon } from "@phosphor-icons/react/dist/ssr/CheckCircle";
import Stack from "@mui/material/Stack";
import {useUser} from "@/hooks/use-user";
import {type AggregatedResult} from "@/components/dashboard/import/import-card-question";
import {type UserAnswerAttempt} from "@/types/user-answer-attempt";
import {updateUserQuestAttemptByQuestAsSubmitted} from "@/api/services/user-quest-attempt";
import {type Quest} from "@/types/quest";
import {updateQuest} from "@/api/services/quest";
import Alert from "@mui/material/Alert";
import axios from "axios";


interface ImportCardUserAttemptProps {
  userAnswerAttempts: UserAnswerAttempt[];
  aggregatedResults: AggregatedResult[];
  newQuestId: Quest['id'];
}


export function ImportCardUserAttempt( { aggregatedResults, newQuestId }:ImportCardUserAttemptProps): React.JSX.Element {
  enum LoadingState {
    Idle = "Idle",
    CalculatingScores = "CalculatingScores",
    IssuingBadges = 'IssuingBadges',
    SettingQuestAsExpired = 'SettingQuestAsExpired',
    IssuingPoints = 'IssuingPoints',
    Redirecting = 'Redirecting',
  }
  const { checkSession } = useUser();

  const [page, setPage] = React.useState(1);
  const rowsPerPage = 1; // Each page will show one card
  const router = useRouter();
  const [loadingState, setLoadingState] = React.useState<LoadingState>(LoadingState.Idle);
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const delay = (ms: number): Promise<void> => new Promise(resolve => {setTimeout(resolve, ms)});

  const handleChangePage = (_event: React.ChangeEvent<unknown>, newPage: number): void => {
    setPage(newPage);
  };

  const getErrorMessage = (error: unknown): string => {
    if (axios.isAxiosError(error)) {
      const data: unknown = error.response?.data;
      if (typeof data === 'string') {
        return data;
      }
      if (data && typeof data === 'object') {
        if (Array.isArray(data)) {
          return data.length > 0 ? String(data[0]) : 'Request failed.';
        }
        const detail = (data as { detail?: unknown }).detail;
        if (typeof detail === 'string') {
          return detail;
        }
        const entries = Object.entries(data as Record<string, unknown>);
        if (entries.length > 0) {
          const [field, value] = entries[0];
          const fieldMessage = Array.isArray(value) ? String(value[0]) : String(value);
          return `${String(field)}: ${fieldMessage}`;
        }
      }
      return error.message || 'Request failed.';
    }
    if (error instanceof Error) {
      return error.message;
    }
    return 'Unexpected error occurred.';
  };

  const refreshUser = async () : Promise<void> => {
    setLoadingState(LoadingState.IssuingPoints);
    if (checkSession) {
      await checkSession();
    }
  };
  const setAttemptsAsSubmitted = async (questId: Quest['id']): Promise<void> => {
    setLoadingState(LoadingState.IssuingBadges);
    await updateUserQuestAttemptByQuestAsSubmitted(questId.toString());
  }

  const setQuestToExpire = async (questId: number): Promise<void> => {
    setLoadingState(LoadingState.SettingQuestAsExpired);
    const data = { status: 'Expired' };
    await updateQuest(questId.toString(), data);
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    if (isSubmitting) {
      return;
    }
    setSubmitError(null);
    setIsSubmitting(true);
    setLoadingState(LoadingState.CalculatingScores);
    try {

      // 2. Set all attempts for the quest as submitted
      await setAttemptsAsSubmitted(newQuestId);

      // Insert a 5-second blocking timer
      await delay(5000);

      // 3. Set the quest as expired
      await setQuestToExpire(newQuestId);

      // 4. Refresh the user's level bar
      await refreshUser();

      // 5. Redirect to the quest page
      setLoadingState(LoadingState.Redirecting);
      router.push(`/dashboard/quest/${newQuestId.toString()}`);
    }
    catch (error: unknown) {
      logger.error('Failed to save data', error);
      setSubmitError(getErrorMessage(error));
      setLoadingState(LoadingState.Idle);
    } finally {
      setIsSubmitting(false);
    }
  }

  const pageCount = Math.ceil(aggregatedResults.length / rowsPerPage);
  const currentResults = aggregatedResults.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  return (
    <form onSubmit={handleSubmit}>
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
        <Pagination count={pageCount} page={page} onChange={handleChangePage} color="primary" />
      </Box>
      {currentResults.map((result) => (
        <Card key={result.questionNumber}>
          <CardHeader title={`Question ${result.questionNumber.toString()}. ${result.questionText}`} />
          <Divider />
            <Table sx={{ minWidth: '800px' }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{px:'24px'}}>Answer Text</TableCell>
                  <TableCell sx={{px:'24px', width: '20%'}}>Selected / Total</TableCell>
                  <TableCell sx={{px:'24px', width: '30%'}}>Percentage Selected</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {result.answers.map((answer) => (
                  <TableRow hover key={`${answer.answerText}-${String(answer.count)}-${String(answer.total)}`}>
                    <TableCell sx={{px:'24px'}}>
                      <Stack direction="row" spacing={1}>
                        <Typography variant="body2">{answer.answerText}</Typography>
                       {answer.isCorrect ? <CheckCircleIcon size={20} color="#66bb6a"/> : null}
                      </Stack>
                      </TableCell>
                    <TableCell sx={{px:'24px'}}>{answer.count} / {answer.total}</TableCell>
                    <TableCell sx={{px:'24px'}}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box sx={{ width: '100%', mr: 1 }}>
                          <LinearProgress variant="determinate" value={parseFloat(answer.percentage)} />
                        </Box>
                        <Box sx={{ minWidth: 45 }}>
                          <Typography variant="body2" color="textSecondary">{`${answer.percentage}%`}</Typography>
                        </Box>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
        </Card>
      ))}

      {loadingState === LoadingState.CalculatingScores ? <Loading text="Calculating Scores all Attempts..." /> : null}
      {loadingState === LoadingState.IssuingBadges ? <Loading text="Checking Conditions and Issuing Badges..." /> : null}
      {loadingState === LoadingState.SettingQuestAsExpired ? <Loading text='Setting Quest as Expired...' /> : null}
      {loadingState === LoadingState.IssuingPoints ? <Loading text='Issuing Points...' /> : null}
      {loadingState === LoadingState.Redirecting ? <Loading text='Completed! Redirecting...' /> : null}
      {submitError ? <Alert severity="error" sx={{ mt: 2 }}>{submitError}</Alert> : null}

      <Box sx={{display: "flex", justifyContent: "center", mt: 6}}>
        <Button startIcon={<CheckFatIcon/>} type="submit" variant="contained" disabled={isSubmitting}>
          {isSubmitting ? 'Processing...' : 'Grade Attempts'}
        </Button>
      </Box>

    </form>
  );
}
