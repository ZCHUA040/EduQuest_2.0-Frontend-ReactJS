// src/components/dashboard/quest/question/attempt/question-attempt-card.tsx

"use client";

import * as React from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Unstable_Grid2'; // Grid version 2
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Pagination from '@mui/material/Pagination';
import CardHeader from "@mui/material/CardHeader";
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import CardActions from "@mui/material/CardActions";
import Button from "@mui/material/Button";
import { FloppyDisk as FloppyDiskIcon } from "@phosphor-icons/react/dist/ssr/FloppyDisk";
import { PaperPlaneTilt as PaperPlaneTiltIcon } from "@phosphor-icons/react/dist/ssr/PaperPlaneTilt";
import { Eye as EyeIcon } from "@phosphor-icons/react/dist/ssr/Eye";
import { EyeClosed as EyeClosedIcon } from "@phosphor-icons/react/dist/ssr/EyeClosed";
import { Divider, Alert, Stack } from "@mui/material";
import type { UserAnswerAttempt, UserAnswerAttemptUpdateForm } from "@/types/user-answer-attempt";
import { type UserQuestAttemptUpdateForm } from "@/types/user-quest-attempt";
import { logger } from "@/lib/default-logger";
import { updateMultipleUserAnswerAttempts } from "@/api/services/user-answer-attempt";
import { updateUserQuestAttempt } from "@/api/services/user-quest-attempt";
import Points from "../../../../../../public/assets/point.svg";
import { useUser } from '@/hooks/use-user';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';


interface AnswerAttemptCardProps {
  data: UserAnswerAttempt[];
  onAnswerChange: (attemptId: number, answerId: number, isChecked: boolean) => void;
  userQuestAttemptId: string;
  submitted: boolean;
  onHintUsed: (questionId: number) => void;
  onAnswerSubmit: (attemptId: string) => void;
  onAnswerSave: () => void;
}

interface GroupedQuestion {
  question: UserAnswerAttempt['question'];
  answers: UserAnswerAttempt[];
}

/**
 * Parses the text and replaces KaTeX expressions with InlineMath components.
 *
 * @param text - The text containing KaTeX expressions.
 * @returns An array of React elements.
 */
const parseKaTeX = (text: string): React.ReactNode[] => {
  // Replace double backslashes with a single backslash
  const sanitizedText = text.replace(/\\\\/g, '\\');

  const parts = sanitizedText.split(/(?<temp1>\$[^$]*\$)/g); // Split by KaTeX expressions
  return parts.map((part, index) => {
    if (part.startsWith('$') && part.endsWith('$')) {
      const math = part.slice(1, -1); // Remove the $ delimiters
      return <InlineMath key={index} math={math} />;
    }
    return part;
  });
};

export function AnswerAttemptCard({ data, userQuestAttemptId, onAnswerChange, submitted, onHintUsed, onAnswerSubmit, onAnswerSave }: AnswerAttemptCardProps): React.JSX.Element {
  const { checkSession, eduquestUser } = useUser();
  const [page, setPage] = React.useState(1);
  const [showExplanation, setShowExplanation] = React.useState<Record<number, boolean>>({});
  const rowsPerPage = 1; // Adjust as needed
  const [status, setStatus] = React.useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // 1. Group UserAnswerAttempt by Question using useMemo
  const groupedQuestions: GroupedQuestion[] = React.useMemo(() => {
    const map = new Map<number, GroupedQuestion>();
    data.forEach(attempt => {
      const q = attempt.question;
      if (!map.has(q.id)) {
        map.set(q.id, { question: q, answers: [] });
      }
      map.get(q.id)?.answers.push(attempt);
    });

    // Sort answers by answer.id in ascending order
    map.forEach(group => {
      group.answers.sort((a, b) => a.answer.id - b.answer.id);
    });

    return Array.from(map.values()).sort((a, b) => a.question.number - b.question.number);
  }, [data]);

  // 2. Calculate pageCount after groupedQuestions is defined
  const pageCount = Math.ceil(groupedQuestions.length / rowsPerPage);

  // 3. Slice groupedQuestions to get current page's questions
  const currentPageQuestions = groupedQuestions.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  const handleChangePage = (_event: React.ChangeEvent<unknown>, newPage: number): void => {
    setPage(newPage);
  };

  const markHintUsed = (questionId: number): void => {
    onHintUsed(questionId);
  };

  const refreshUser = async (): Promise<void> => {
    if (checkSession) {
      await checkSession();
    }
  };

  const bulkUpdateUserAnswerAttempts = async (updatedUserAnswerAttempts: UserAnswerAttemptUpdateForm[]): Promise<void> => {
    try {
      const response = await updateMultipleUserAnswerAttempts(updatedUserAnswerAttempts);
      logger.debug('Bulk Update UserAnswerAttempts Success:', response);
    } catch (error: unknown) {
      logger.error('Bulk Update UserAnswerAttempts Failed:', error);
    }
  };

  /**
   * Handles the Save action.
   */
  const handleSave = async (event: React.MouseEvent<HTMLButtonElement>): Promise<void> => {
    event.preventDefault();
    const currentDate = new Date().toISOString();

    // 1. Prepare the data to update is_selected
    const updatedUserAnswerAttempts: UserAnswerAttemptUpdateForm[] = data.map(attempt => ({
      id: attempt.id,
      is_selected: attempt.is_selected,
      hint_used: attempt.hint_used,
    }));

    if (eduquestUser) {
      try {
        // 2. Update UserAnswerAttempts
        await bulkUpdateUserAnswerAttempts(updatedUserAnswerAttempts);

        // 3. Update UserQuestAttempt with last_attempted_date
        const updatedUserQuestAttempt: UserQuestAttemptUpdateForm = {
          submitted: false,
          last_attempted_date: currentDate,
          student_id: eduquestUser.id,
          quest_id: data[0].question.quest_id,
        };
        await updateUserQuestAttempt(userQuestAttemptId, updatedUserQuestAttempt);

        // 4. Refresh the user attempt table
        onAnswerSave();

        // 5. Update local state with calculated scores
        setStatus({ type: 'success', message: 'Save Successful.' });
        logger.debug('Save action completed successfully.');
      } catch (error) {
        setStatus({ type: 'error', message: 'Save Failed. Please try again.' });
        logger.error('Save action failed:', error);
      }
    }


  };

  /**
   * Handles the Submit action.
   * Calculates scores, updates is_selected, sets submitted to true, updates last_attempted_date, and redirects.
   */
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    const currentDate = new Date().toISOString();

    // 1. Calculate scores
    // const updatedData = calculateScores([...data]); // Clone data to avoid mutating state directly
    // logger.debug('Updated Data:', updatedData);
    // 2. Prepare the data to update is_selected and score_achieved
    const updatedUserAnswerAttempts: UserAnswerAttemptUpdateForm[] = data.map(attempt => ({
      id: attempt.id,
      is_selected: attempt.is_selected,
      hint_used: attempt.hint_used
    }));

    logger.debug('Updated UserAnswerAttempts:', updatedUserAnswerAttempts);

    if (eduquestUser) {
      try {
        // 3. Update UserAnswerAttempts
        await bulkUpdateUserAnswerAttempts(updatedUserAnswerAttempts);

        // 4. Update UserQuestAttempt with submitted=true and last_attempted_date
        const updatedUserQuestAttempt: UserQuestAttemptUpdateForm = {
          submitted: true,
          last_attempted_date: currentDate,
          student_id: eduquestUser.id,
          quest_id: data[0].question.quest_id,
        };
        await updateUserQuestAttempt(userQuestAttemptId, updatedUserQuestAttempt);

        // 5. Update local state with calculated scores
        setStatus({ type: 'success', message: 'Submit Successful! Redirecting to Quest page...' });
        logger.debug('Submit action completed successfully.');

        // 6. Optionally, refresh user session or data here
        await refreshUser();

        // 7. Redirect to Quest page after submission
        onAnswerSubmit(userQuestAttemptId);
      } catch (error) {
        setStatus({ type: 'error', message: 'Submit Failed. Please try again.' });
        logger.error('Submit action failed:', error);
      }
    }

  };

  const toggleExplanation = (questionId: number): void => {
    setShowExplanation(prevState => ({
      ...prevState,
      [questionId]: !prevState[questionId],
    }));
  };

  const handleCheckboxChange = (attemptId: number, answerId: number, isChecked: boolean): void => {
    onAnswerChange(attemptId, answerId, isChecked);
  };

  return (
    <form onSubmit={handleSubmit}>
      <FormGroup>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <Pagination count={pageCount} page={page} onChange={handleChangePage} color="primary" />
        </Box>
        <Grid container spacing={4}>
          {currentPageQuestions.map(({ question, answers }) => (
            <Grid key={question.id} xs={12}>
              <Card>
                <CardHeader
                  title={`Question ${question.number.toString()}`}
                  subheader={
                    <Stack direction="row" spacing='6px' sx={{ alignItems: 'center', pt: 0.5 }}>
                      <Typography variant="body2">{question.max_score}</Typography>
                      <Points height={18} />
                    </Stack>
                  }
                  action={submitted && question.answers.some(a => a.reason) ? (
                      <Button
                        startIcon={showExplanation[question.id] ? <EyeClosedIcon /> : <EyeIcon />}
                        onClick={() => { toggleExplanation(question.id); }}
                      >
                        {showExplanation[question.id] ? 'Hide Explanation' : 'Show Explanation'}
                      </Button>
                    ) : null
                  }
                />
                <Divider />
                <CardContent>
                  <Grid container spacing={3}>
                    <Grid xs={12}>
                      <Typography variant="subtitle1">
                        {parseKaTeX(question.text)}
                      </Typography>
                      {question.hint ? (
                        <Button
                          size="small"
                          variant="text"
                          onClick={() => { markHintUsed(question.id); }}
                          disabled={answers.some(a => a.hint_used)}
                          sx={{ mt: 1, px: 0 }}
                        >
                          {answers.some(a => a.hint_used) ? 'Hint Used (-5 points)' : 'Show Hint (-5 points)'}
                        </Button>
                      ) : null}
                      {question.hint && answers.some(a => a.hint_used) ? (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          {parseKaTeX(question.hint)}
                        </Typography>
                      ) : null}
                    </Grid>
                    {answers.map((attempt) => {
                      return (
                        <Grid key={attempt.answer.id} md={6} xs={12}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={attempt.is_selected}
                                onChange={(e) => { handleCheckboxChange(attempt.id, attempt.answer.id, e.target.checked); }}
                              />
                            }
                            label={parseKaTeX(attempt.answer.text)}
                          />
                          {showExplanation[attempt.question.id] && attempt.answer.reason ? <Typography variant="body2" mt={1}>
                              {parseKaTeX(attempt.answer.reason)}
                            </Typography> : null}
                        </Grid>
                      );
                    })}
                  </Grid>
                </CardContent>
                <CardActions sx={{ justifyContent: 'space-between' }}>
                  <Stack direction="row" pl={2}>
                    { submitted ?
                      <Typography variant="subtitle2">
                        Score Achieved: {answers.reduce((acc, curr) => acc + curr.score_achieved, 0).toFixed(2)} / {question.max_score}
                      </Typography> : null
                    }
                      </Stack>
                  <Stack direction="row" spacing={1}>
                    <Button
                      startIcon={<FloppyDiskIcon />}
                      variant="outlined"
                      onClick={handleSave}
                      disabled={submitted}
                    >
                      Save All
                    </Button>
                    <Button
                      endIcon={<PaperPlaneTiltIcon />}
                      type="submit"
                      variant="contained"
                      disabled={submitted}
                    >
                      Submit All
                    </Button>
                  </Stack>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
        {status ? <Alert severity={status.type} sx={{ marginTop: 2 }}>
            {status.message}
          </Alert> : null}
      </FormGroup>
    </form>
  );
}
