import * as React from 'react';
import Grid from '@mui/material/Unstable_Grid2'; // Grid version 2
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import CardHeader from "@mui/material/CardHeader";
import Divider from "@mui/material/Divider";
import Button from "@mui/material/Button";
import { CaretRight as CaretRightIcon } from "@phosphor-icons/react/dist/ssr/CaretRight";
import { AxiosError } from "axios";
import { logger } from "@/lib/default-logger";
import { authClient } from "@/lib/auth/client";
import type { Question } from '@/types/question';
import Box from "@mui/material/Box";
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import { Loading } from "@/components/dashboard/loading/loading";
import { updateMultipleAnswers } from "@/api/services/answer";
import { type Quest } from "@/types/quest";
import {getUserAnswerAttemptByQuest} from "@/api/services/user-answer-attempt";
import {type UserAnswerAttempt} from "@/types/user-answer-attempt";
import { regradeUserQuestAttemptsByQuest } from "@/api/services/user-quest-attempt";

interface ImportCardQuestionProps {
  questions: Question[];
  newQuestId: Quest['id'];
  onAggregationComplete: (aggregatedResults: AggregatedResult[], userAnswerAttempts: UserAnswerAttempt[]) => void;
}

interface AnswerAggregate {
  answerId: number;
  answerText: string;
  count: number;
  total: number;
  isCorrect: boolean;
}

interface QuestionAggregate {
  questionId: number;
  questionNumber: number;
  questionText: string;
  totalUsers: number;
  answers: Record<string, AnswerAggregate>;
}

export interface AggregatedResult {
  questionText: string;
  questionNumber: number;
  answers: {
    answerText: string;
    isCorrect: boolean;
    count: number;
    total: number;
    percentage: string;
  }[];
}

function aggregateUserAnswerAttempts(userAnswerAttempts: UserAnswerAttempt[]): AggregatedResult[] {
  // First, determine the number of unique users who attempted each question
  const usersPerQuestion = userAnswerAttempts.reduce<Record<number, Set<number>>>((acc, attempt) => {
    const questionId = attempt.question.id;
    const userQuestAttemptId = attempt.user_quest_attempt_id;

    if (!acc[questionId]) {
      acc[questionId] = new Set();
    }
    acc[questionId].add(userQuestAttemptId);

    return acc;
  }, {});

  // Now, aggregate the data
  const aggregateData = userAnswerAttempts.reduce<Record<number, QuestionAggregate>>((acc, attempt) => {
    const questionId = attempt.question.id;
    const questionText = attempt.question.text;
    const questionNumber = attempt.question.number;
    const answerId = attempt.answer.id;
    const answerText = attempt.answer.text;
    const isCorrect = attempt.answer.is_correct;

    // Initialize question entry if it doesn't exist
    if (!acc[questionId]) {
      acc[questionId] = {
        questionId,
        questionText,
        questionNumber,
        totalUsers: usersPerQuestion[questionId].size, // Total number of users who attempted this question
        answers: {}
      };
    }

    // Initialize answer entry if it doesn't exist
    if (!acc[questionId].answers[answerId]) {
      acc[questionId].answers[answerId] = {
        total: usersPerQuestion[questionId].size, // Set total to the number of users who attempted the question
        answerId,
        answerText,
        count: 0,
        isCorrect
      };
    }

    // Increment selected count if the answer was selected
    if (attempt.is_selected) {
      acc[questionId].answers[answerId].count += 1;
    }

    return acc;
  }, {});

  return Object.values(aggregateData)
    .map(({ questionText, questionNumber, totalUsers, answers }) => ({
      questionText,
      questionNumber,
      answers: Object.values(answers).map(({ answerText, count, isCorrect }) => ({
        answerText,
        isCorrect,
        count,
        total: totalUsers, // Set total to the number of users who attempted the question
        percentage: ((count / totalUsers) * 100).toFixed(2)
      }))
    }))
    .sort((a, b) => a.questionNumber - b.questionNumber);
}



export function ImportCardQuestion({ questions, onAggregationComplete, newQuestId }: ImportCardQuestionProps): React.JSX.Element {

  // Define loading states
  enum LoadingState {
    Idle = "Idle",
    UpdatingQuestions = "UpdatingQuestions",
    ConsolidatingUserAttempts = 'ConsolidatingUserAttempts',
  }

  // State to manage updated questions for UI
  const [updatedQuestions, setUpdatedQuestions] = React.useState<Question[]>(questions);


  // State to track changed answers for bulk update
  const [changedAnswers, setChangedAnswers] = React.useState<{
    id: number;
    text: string;
    is_correct: boolean;
    reason: string | null;
  }[]>([]);

  // State to manage loading indicators
  const [loadingState, setLoadingState] = React.useState<LoadingState>(LoadingState.Idle);


  /**
   * Handle the change of an answer's is_correct field.
   * @param questionId - ID of the question.
   * @param answerId - ID of the answer.
   * @param text - Text of the answer.
   * @param reason - Reason for the answer.
   * @param isCorrect - New value for is_correct.
   */
  const handleAnswerChange = (
    questionId: number,
    answerId: number,
    text: string,
    reason: string | null,
    isCorrect: boolean
  ): void => {
    // logger.debug('handleAnswerChange', questionId, answerId, isCorrect);

    // Update the questions state for UI
    const newQuestions = updatedQuestions.map((question) => {
      if (question.id === questionId) {
        return {
          ...question,
          answers: question.answers.map((answer) => {
            if (answer.id === answerId) {
              return { ...answer, is_correct: isCorrect };
            }
            return answer;
          }),
        };
      }
      return question;
    });
    setUpdatedQuestions(newQuestions);

    // Update the changedAnswers state
    setChangedAnswers((prev) => {
      const existing = prev.find((a) => a.id === answerId);
      if (existing) {
        // Update the existing answer
        return prev.map((a) =>
          a.id === answerId ? { ...a, is_correct: isCorrect } : a
        );
      }
      // Add the new changed answer
      return [...prev, { id: answerId, text, is_correct: isCorrect, reason }];

    });
  };

  /**
   * Bulk update the changed answers.
   */
  const bulkUpdateCorrectAnswers = async (): Promise<void> => {
    if (changedAnswers.length === 0) {
      logger.debug('No changes to update.');
      return;
    }

    try {
      setLoadingState(LoadingState.UpdatingQuestions);
      const response = await updateMultipleAnswers(changedAnswers);
      logger.debug('Update Success:', response);
      await regradeUserQuestAttemptsByQuest(newQuestId.toString());

      // Optionally, reset the changedAnswers state after successful update
      setChangedAnswers([]);
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        if (error.response?.status === 401) {
          await authClient.signInWithMsal();
        }
      }
      logger.error('Failed to save data', error);
    } finally {
      setLoadingState(LoadingState.Idle);
    }
  };

  const fetchUserAnswerAttemptByQuest = async (questId: number): Promise<void> => {
    try {
      setLoadingState(LoadingState.ConsolidatingUserAttempts);
      const response = await getUserAnswerAttemptByQuest(questId.toString());
      const aggregatedResults = aggregateUserAnswerAttempts(response);
      onAggregationComplete(aggregatedResults, response);
      logger.debug('aggregatedResults', aggregatedResults);
      // logger.debug('All answer attempts for this quest', response);
    } catch {
      logger.error('Error getting all answer attempts for this quest');
    } finally {
      setLoadingState(LoadingState.Idle);
    }
  }


  /**
   * Handle form submission.
   * @param event - Form event.
   */
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    await bulkUpdateCorrectAnswers();
    await fetchUserAnswerAttemptByQuest(newQuestId);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader title="Update Question" subheader="Select the correct answer for each question" />
        <Divider />

        <CardContent sx={{ pb: '16px' }}>
          <Grid container spacing={5}>
            {updatedQuestions.map((question) => (
              <Grid container key={question.id} spacing={1} sx={{ width: '100%' }}>
                <Grid xs={12}>
                  {/* Preserve question.text presentation */}
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    {question.number}. {question.text}
                  </Typography>
                </Grid>

                {question.answers.map((answer) => (
                  <Grid key={answer.id} md={6} xs={12}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={answer.is_correct}
                          onChange={(e) =>
                          { handleAnswerChange(
                            question.id,
                            answer.id,
                            answer.text,
                            answer.reason,
                            e.target.checked
                          ); }
                          }
                        />
                      }
                      label={answer.text}
                    />
                  </Grid>
                ))}
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Loading Indicators */}
      {loadingState === LoadingState.UpdatingQuestions && <Loading text="Updating Questions..." />}
      {loadingState === LoadingState.ConsolidatingUserAttempts && <Loading text="Consolidating all User Attempts..." />}

      {/* Submit Button */}
      <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
        <Button endIcon={<CaretRightIcon />} type="submit" variant="contained">
          Next: View Attempts
        </Button>
      </Box>
    </form>
  );
}

