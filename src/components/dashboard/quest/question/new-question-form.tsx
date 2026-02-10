/* eslint-disable react/no-array-index-key -- dynamic lists lack stable ids during authoring */
import * as React from 'react';
import { useState } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Unstable_Grid2';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import CardActions from '@mui/material/CardActions';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Divider from '@mui/material/Divider';
import Alert from '@mui/material/Alert';
import { FilePlus as FilePlusIcon } from "@phosphor-icons/react/dist/ssr/FilePlus";
import { Trash as TrashIcon } from '@phosphor-icons/react/dist/ssr/Trash';
import { Plus as PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';
import { XCircle as XCircleIcon } from '@phosphor-icons/react/dist/ssr/XCircle';
import CardHeader from "@mui/material/CardHeader";
import { IconButton } from '@mui/material';
import Stack from "@mui/material/Stack";
import Points from "../../../../../public/assets/point.svg";
import {logger} from "@/lib/default-logger";
import {AxiosError} from "axios";
import {QuestionNewDialog} from "@/components/dashboard/dialog/question-new-dialog";
import FormLabel from "@mui/material/FormLabel";
import FormControl from "@mui/material/FormControl";
import type {QuestionMultipleNewForm} from "@/types/question";
import type {Answer} from "@/types/answer";
import {createQuestionsAndAnswers} from "@/api/services/question";


interface NewQuestionFormProps {
  onCreateSuccess: () => void;
  onCancelCreate: () => void;
  questId: string;
}

export function NewQuestionForm({ questId, onCreateSuccess, onCancelCreate }: NewQuestionFormProps): React.JSX.Element {
  const [questions, setQuestions] = useState<QuestionMultipleNewForm[]>([
    {
      quest_id: questId as unknown as number,
      number: 1,
      text: '',
      max_score: 1,
      answers: [{ text: '', is_correct: false, reason: null }],
    },
  ]);
  const [formValid, setFormValid] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);

  const handleQuestionChange = (
    index: number,
    field: keyof QuestionMultipleNewForm,
    value: string | number
  ): void => {
    const newQuestions = [...questions];
    newQuestions[index] = { ...newQuestions[index], [field]: value };
    setQuestions(newQuestions);
  };

  const handleAnswerChange = (
    qIndex: number,
    aIndex: number,
    field: keyof Answer,
    value: string | boolean | null
  ): void => {
    const newQuestions = [...questions];
    newQuestions[qIndex].answers[aIndex] = {
      ...newQuestions[qIndex].answers[aIndex],
      [field]: value,
    };
    setQuestions(newQuestions);
  };

  const addQuestion = (): void => {
    setQuestions([
      ...questions,
      {
        quest_id: questId as unknown as number,
        number: questions.length + 1,
        text: '',
        max_score: 1,
        answers: [{ text: '', is_correct: false, reason: null }],
      },
    ]);
  };


  const addAnswer = (qIndex: number): void => {
    const newQuestions = [...questions];
    newQuestions[qIndex].answers.push({ text: '', is_correct: false, reason: null });
    setQuestions(newQuestions);
  };


  const deleteQuestion = (qIndex: number): void => {
    const newQuestions = questions.filter((_, index) => index !== qIndex);

    // Reassign the question numbers after deletion
    const updatedQuestions = newQuestions.map((question, index) => ({
      ...question,
      number: index + 1,
    }));

    setQuestions(updatedQuestions);
  };

  const deleteAnswer = (qIndex: number, aIndex: number): void => {
    const newQuestions = [...questions];
    newQuestions[qIndex].answers = newQuestions[qIndex].answers.filter(
      (_, index) => index !== aIndex
    );
    setQuestions(newQuestions);
  };

  const handleSubmit = async (): Promise<void> => {
    logger.debug('Questions to be created:', questions);
    if (
      questions.length === 0 ||
      questions.some(
        (q) =>
          q.text.trim() === '' ||
          q.answers.length === 0 ||
          q.answers.some(a => a.text.trim() === '') ||
          !q.answers.some(a => a.is_correct) // Ensure at least one correct answer
      )
    ) {
      setFormValid(false);
      return;
    }
    setFormValid(true);
    try {
      const response = await createQuestionsAndAnswers(questions);
      if (response) {
        logger.debug('Questions bulk-created:', response);
        onCreateSuccess();
      }
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        if (error.response?.status === 401) {
          // Handle unauthorized error, e.g., redirect to login
          // await authClient.signInWithMsal();
          logger.error('Unauthorized. Please sign in.');
        }
      }
      logger.error('Error creating questions:', error);
    }
  };


  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    setOpenDialog(true);
  };

  const handleDialogClose = (): void => {
    setOpenDialog(false);
  };

  const handleDialogConfirm = async (): Promise<void> => {
    setOpenDialog(false);
    await handleSubmit();
  };

  return (
    <form onSubmit={handleFormSubmit}>
      {questions.map((question, qIndex) => (
        <Card key={qIndex} sx={{ mb: 2 }}>
          <CardHeader
            title={`Question ${question.number.toString()}`}
            action={
              <Button
                startIcon={<TrashIcon />}
                onClick={() => { deleteQuestion(qIndex); }}
                color="error"
              >
                Delete Question
              </Button>
            }
          />
          <Divider />
          <CardContent>
            <Grid container spacing={3}>
              <Grid md={10} xs={12}>
                <FormControl fullWidth required>
                  <FormLabel htmlFor={`question-text-${qIndex.toString()}`}>Question Text</FormLabel>
                  <TextField
                    id={`question-text-${qIndex.toString()}`}
                    placeholder="Enter question text here"
                    size="small"
                    value={question.text}
                    onChange={(e) =>
                      { handleQuestionChange(qIndex, 'text', e.target.value); }
                    }
                    sx={{ mb: 2 }}
                  />
                </FormControl>
              </Grid>
              <Grid md={2} xs={12}>
                <FormControl fullWidth required>
                  <FormLabel htmlFor={`question-points-${qIndex.toString()}`}>
                    <Points height={14}/> Points
                  </FormLabel>
                  <TextField
                    id={`question-points-${qIndex.toString()}`}
                    type="number"
                    value={question.max_score}
                    size="small"
                    onChange={(e) =>
                      { handleQuestionChange(qIndex, 'max_score', parseInt(e.target.value, 10)); }
                    }
                    sx={{ mb: 2 }}
                    inputProps={{ min: 1 }}
                  />
                </FormControl>
              </Grid>
            </Grid>
            <Grid container spacing={5}>
              {question.answers.map((answer, aIndex) => (
                <Grid md={6} xs={12} key={aIndex}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
                    <FormControl fullWidth>
                      <FormLabel htmlFor={`answer-text-${qIndex.toString()}-${aIndex.toString()}`}>
                        Answer {aIndex + 1}
                      </FormLabel>
                      <TextField
                        id={`answer-text-${qIndex.toString()}-${aIndex.toString()}`}
                        size="small"
                        value={answer.text}
                        onChange={(e) =>
                          { handleAnswerChange(qIndex, aIndex, 'text', e.target.value); }
                        }
                        sx={{ mr: 2 }}
                        placeholder="Enter answer text here"
                      />
                    </FormControl>
                    <FormControlLabel
                      control={
                        <Checkbox
                          size="small"
                          checked={answer.is_correct}
                          onChange={(e) =>
                            { handleAnswerChange(qIndex, aIndex, 'is_correct', e.target.checked); }
                          }
                        />
                      }
                      label="Correct"
                      componentsProps={{ typography: { fontSize: 14 } }}
                      sx={{ mr: 1 }}
                    />
                    <IconButton
                      aria-label="delete answer"
                      onClick={() => { deleteAnswer(qIndex, aIndex); }}
                      color="error"
                      size="medium"
                    >
                      <TrashIcon height={20} width={20} />
                    </IconButton>
                  </Box>
                  {/* Optional: Reason for the answer */}
                  <Box sx={{ mt: 1 }}>
                    <FormControl fullWidth>
                      <FormLabel htmlFor={`answer-reason-${qIndex.toString()}-${aIndex.toString()}`}>
                        Reason (optional)
                      </FormLabel>
                      <TextField
                        id={`answer-reason-${qIndex.toString()}-${aIndex.toString()}`}
                        size="small"
                        value={answer.reason || ''}
                        onChange={(e) =>
                          { handleAnswerChange(qIndex, aIndex, 'reason', e.target.value); }
                        }
                        placeholder="Enter reason for this answer"
                      />
                    </FormControl>
                  </Box>
                </Grid>
              ))}
              <Grid md={6} xs={12} alignItems="flex-end" display="flex">
                <Button startIcon={<PlusIcon />} onClick={() => { addAnswer(qIndex); }}>
                  Add Answer
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      ))}

      {!formValid && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Each question must have text, at least one correct answer with text, and points.
        </Alert>
      )}

      <CardActions sx={{ justifyContent: 'space-between' }}>
        <Button startIcon={<PlusIcon />} onClick={addQuestion}>
          Add Question
        </Button>
        <Stack direction="row" spacing={2}>
          <Button
            startIcon={<XCircleIcon />}
            onClick={onCancelCreate}
            color="error"
          >
            Cancel
          </Button>
          <Button
            startIcon={<FilePlusIcon />}
            type="submit"
            variant="contained"
          >
            Create Questions
          </Button>
        </Stack>
      </CardActions>

      <QuestionNewDialog
        openDialog={openDialog}
        handleDialogClose={handleDialogClose}
        handleDialogConfirm={handleDialogConfirm}
      />
    </form>
  );
}
