"use client";

import * as React from 'react';
import axios from 'axios';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Unstable_Grid2';
import microService from "@/api/micro-service";
import {logger} from "@/lib/default-logger";
import Typography from "@mui/material/Typography";
import type {AxiosResponse} from "axios";
import Select, { type SelectChangeEvent} from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Alert from "@mui/material/Alert";
import type {QuestNewForm} from "@/types/quest";
import { useUser } from "@/hooks/use-user";
import { MagicWand as MagicWandIcon } from '@phosphor-icons/react/dist/ssr/MagicWand';
import { CaretRight as CaretRightIcon } from '@phosphor-icons/react/dist/ssr/CaretRight';
import {TextField, Stack } from "@mui/material";
import type {Image} from "@/types/image";
import Chip from "@mui/material/Chip";
import type { Document } from "@/types/document";
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import { LinearProgressWithLabel } from '@/components/dashboard/misc/linear-progress-with-label';
import { paths } from '@/paths';
import RouterLink from 'next/link';
import FormLabel from "@mui/material/FormLabel";
import {getImages} from "@/api/services/image";
import {type CourseGroup} from "@/types/course-group";
import {getNonPrivateCourseGroups} from "@/api/services/course-group";
import {getMyDocuments} from "@/api/services/document";
import {createQuest} from "@/api/services/quest";
import {createQuestionsAndAnswers} from "@/api/services/question";
import type {GeneratedQuestion, GeneratedQuestions} from "@/types/question"
import type {AnswerNewForm} from "@/types/answer";


interface CourseFormProps {
  onFormSubmitSuccess: () => void;
}
export function GenerateQuestForm({onFormSubmitSuccess}: CourseFormProps): React.JSX.Element {
  const { eduquestUser} = useUser();
  const questTypeRef = React.useRef<HTMLInputElement>(null);
  const questNameRef = React.useRef<HTMLInputElement>(null);
  const questDescriptionRef = React.useRef<HTMLInputElement>(null);
  const questStatusRef = React.useRef<HTMLInputElement>(null);
  const questCourseIdRef = React.useRef<HTMLInputElement>(null);
  const questMaxAttemptsRef = React.useRef<HTMLInputElement>(null);
  const numQuestionsRef = React.useRef<HTMLInputElement>(null);
  const difficultyRef = React.useRef<HTMLInputElement>(null);

  const [courseGroups, setCourseGroups] = React.useState<CourseGroup[]>();
  const [documents, setDocuments] = React.useState<Document[]>();
  const [images, setImages] = React.useState<Image[]>();
  const [selectedCourseGroupId, setSelectedCourseGroupId] = React.useState<string>('');

  const [selectedDocument, setSelectedDocument] = React.useState<Document | null>(null);
  const [selectedDocumentId, setSelectedDocumentId] = React.useState<number | ''>('');
  const [submitStatus, setSubmitStatus] = React.useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [formErrors, setFormErrors] = React.useState<Record<string, string>>({});
  const [progress, setProgress] = React.useState(0);
  const [progressStatus, setProgressStatus] = React.useState<string>(''); // New state for progress status message
  const [showProgress, setShowProgress] = React.useState(false); // State to control progress bar visibility
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const fetchImages = React.useCallback(async (): Promise<void> => {
    try {
      const response = await getImages();
      const privateQuestImages = response.filter(image => image.name === 'Private Quest');
      setImages(privateQuestImages);
    } catch (error: unknown) {
      logger.error('Failed to fetch images', error);
    }
  }, []);

  const fetchCourseGroups = React.useCallback(async (): Promise<void> => {
    if (eduquestUser) {
      try {
        const response = await getNonPrivateCourseGroups();
        setCourseGroups(response);
        if (response.length && !selectedCourseGroupId) {
          const privateGroup = response.find(
            (courseGroup) => courseGroup.name.toLowerCase() === 'private course group'
          );
          setSelectedCourseGroupId(String((privateGroup ?? response[0])?.id));
        }
        logger.debug('Course groups from private course', response);
      } catch (error: unknown) {
        logger.error('Failed to fetch course groups', error);
      }
    }
  }, [eduquestUser, selectedCourseGroupId]);

  // Handle document change
  const handleDocumentChange = (event: SelectChangeEvent<number>): void => {
    const documentId = Number(event.target.value);
    setSelectedDocumentId(documentId);
    const document = documents?.find(d => d.id === documentId);
    if (document) {
      setSelectedDocument({
        id: document.id,
        name: document.name,
        file: document.file,
        size: document.size,
        uploaded_at: document.uploaded_at,
        uploaded_by: document.uploaded_by
      });
    }
    if (formErrors.document) {
      setFormErrors(prev => ({ ...prev, document: '' }));
    }
  };

  const handleCourseGroupChange = (event: SelectChangeEvent): void => {
    setSelectedCourseGroupId(event.target.value);
    if (formErrors.courseGroup) {
      setFormErrors(prev => ({ ...prev, courseGroup: '' }));
    }
  };

  const getCreateQuestErrorMessage = (error: unknown): string => {
    if (axios.isAxiosError(error)) {
      const statusCode = error.response?.status;
      if (statusCode === 400) {
        return 'Failed to create quest. Please check the quest details.';
      }
      if (statusCode === 401 || statusCode === 403) {
        return 'You are not allowed to create this quest.';
      }
      if (statusCode && statusCode >= 500) {
        return 'Failed to create quest due to a server issue. Please try again later.';
      }
    }
    return 'Failed to create quest. Please try again.';
  };

  const getGenerateQuestionsErrorMessage = (error: unknown): string => {
    if (axios.isAxiosError(error)) {
      const statusCode = error.response?.status;
      if (statusCode === 400) {
        return 'Question generation failed. Please use a valid uploaded document.';
      }
      if (statusCode === 408 || statusCode === 504) {
        return 'Question generation timed out. Please try with fewer questions.';
      }
      if (statusCode && statusCode >= 500) {
        return 'Question generation failed due to a server issue. Please try again later.';
      }
    }
    return 'Question generation failed. Please try again.';
  };

  const getCreateQuestionsErrorMessage = (error: unknown): string => {
    if (axios.isAxiosError(error)) {
      const statusCode = error.response?.status;
      if (statusCode === 400) {
        return 'Questions were generated but could not be saved. Please try again.';
      }
      if (statusCode && statusCode >= 500) {
        return 'Failed to save generated questions due to a server issue.';
      }
    }
    return 'Failed to save generated questions. Please try again.';
  };

  const fetchMyDocuments = React.useCallback(async (): Promise<void> => {
    if (eduquestUser) {
      try {
        const response = await getMyDocuments(eduquestUser.id.toString());
        setDocuments(response);
        logger.debug('Documents', response);
      } catch (error: unknown) {
        logger.error('Failed to fetch documents', error);
      }
    }
  }, [eduquestUser]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    if (isSubmitting) {
      return;
    }
    setSubmitStatus(null);
    const nextErrors: Record<string, string> = {};

    const questName = questNameRef.current?.value?.trim() || '';
    const questDescription = questDescriptionRef.current?.value?.trim() || '';
    const maxAttempts = Number(questMaxAttemptsRef.current?.value);
    const numQuestions = Number(numQuestionsRef.current?.value);
    const difficulty = difficultyRef.current?.value || '';
    const selectedSourceDocument = selectedDocument ?? documents?.find((doc) => doc.id === selectedDocumentId) ?? documents?.[0] ?? null;

    if (!questName) {
      nextErrors.questName = 'Quest Name is required.';
    }
    if (!questDescription) {
      nextErrors.questDescription = 'Quest Description is required.';
    }
    if (!Number.isFinite(maxAttempts) || maxAttempts < 1) {
      nextErrors.maxAttempts = 'Max Attempts must be at least 1.';
    }
    if (!Number.isFinite(numQuestions) || numQuestions < 1) {
      nextErrors.numQuestions = 'Number of Questions must be at least 1.';
    }
    if (!difficulty) {
      nextErrors.difficulty = 'Difficulty is required.';
    }
    if (!selectedSourceDocument) {
      nextErrors.document = 'Please upload/select a document source first.';
    }
    if (!selectedCourseGroupId) {
      nextErrors.courseGroup = 'Course Group is required.';
    }

    if (Object.keys(nextErrors).length > 0) {
      setFormErrors(nextErrors);
      setSubmitStatus({ type: 'error', message: 'Please complete all required fields.' });
      return;
    }
    setFormErrors({});

    if (!images?.length || !eduquestUser || !questTypeRef.current || !questStatusRef.current || !selectedSourceDocument) {
      setSubmitStatus({ type: 'error', message: 'Unable to process request. Please refresh and try again.' });
      return;
    }

    setIsSubmitting(true);
    setProgress(10);
    setProgressStatus('Creating a new Quest');
    setShowProgress(true);

    const newQuest = {
      type: questTypeRef.current.value,
      name: questName,
      description: questDescription,
      status: questStatusRef.current.value,
      max_attempts: maxAttempts,
      expiration_date: null,
      tutorial_date: null,
      course_group_id: Number(selectedCourseGroupId),
      organiser_id: eduquestUser.id,
      image_id: images[0].id,
      source_document_id: selectedSourceDocument.id
    };

    try {
      const filename = selectedSourceDocument.file;
      const newQuestId = await createNewQuest(newQuest);
      if (!newQuestId) {
        setProgressStatus('Quest creation failed');
        return;
      }

      setProgress(40);
      setProgressStatus('Generating Questions from Document');

      const generatedQuestions = await generateQuestions(
        filename?.split('/').pop() || '',
        numQuestions,
        difficulty
      );

      if (!generatedQuestions || !Array.isArray(generatedQuestions.questions)) {
        setSubmitStatus({ type: 'error', message: 'Question generation failed. Please try again.' });
        setProgressStatus('Generation failed');
        return;
      }

      setProgress(70);
      setProgressStatus('Importing Questions generated');

      await bulkCreateQuestions(generatedQuestions.questions, newQuestId);
      setProgress(100);
      setProgressStatus('Completed');
    } finally {
      setShowProgress(false);
      setIsSubmitting(false);
    }
  };


  const createNewQuest = async (newQuest: QuestNewForm): Promise<number | null> => {
    try {
      const response = await createQuest(newQuest);
      // logger.debug('Quest Create Success:', response);
      return response.id;
    }
    catch (error: unknown) {
      logger.error('Failed to create quest', error);
      setSubmitStatus({ type: 'error', message: getCreateQuestErrorMessage(error) });
      return null;
    }
  }

  const generateQuestions = async (filename: string, numQuestions: number, difficulty: string): Promise<GeneratedQuestions | null> => {
    try {
      const response: AxiosResponse<GeneratedQuestions> = await microService.post(`/generate_questions_from_document`, {
        document_id: filename,
        num_questions: numQuestions,
        difficulty
      });
      logger.debug('Generate Questions Success:', response.data);
      return response.data;
    } catch (error: unknown) {
      logger.error('Error in generateQuestions:', error);
      setSubmitStatus({ type: 'error', message: getGenerateQuestionsErrorMessage(error) });
      return null; // Explicitly return null on error
    } finally {
      logger.debug('Exiting generateQuestions');
    }
  };


  const bulkCreateQuestions = async (generatedQuestions: GeneratedQuestion[], createdQuestId: number): Promise<void> => {
    try {
      const updatedQuestions: {
        number: number;
        max_score: number;
        answers: AnswerNewForm[];
        quest_id: number;
        text: string
      }[] = generatedQuestions.map(question => ({
        ...question,
        max_score: 10,
        quest_id: createdQuestId
      }));
      logger.debug('Questions to be created:', updatedQuestions);
      await createQuestionsAndAnswers(updatedQuestions);
      setSubmitStatus({ type: 'success', message: 'Questions Created Successfully' });
      onFormSubmitSuccess();
    }
    catch (error: unknown) {
      logger.error('Questions Create Failed', error);
      setSubmitStatus({type: 'error', message: getCreateQuestionsErrorMessage(error)});
    }
  }

  React.useEffect(() => {
    const fetchData = async (): Promise<void> => {
      await fetchImages();
      await fetchCourseGroups();
      await fetchMyDocuments();
    };

    fetchData().catch((error: unknown) => {
      logger.error('Failed to fetch data', error);
    });
  }, [fetchImages, fetchCourseGroups, fetchMyDocuments]);

  React.useEffect(() => {
    if (courseGroups?.length && !selectedCourseGroupId) {
      setSelectedCourseGroupId(String(courseGroups[0]?.id));
    }
  }, [courseGroups, selectedCourseGroupId]);

  React.useEffect(() => {
    if (documents?.length) {
      const defaultDocument = documents[0];
      setSelectedDocument(defaultDocument);
      setSelectedDocumentId(defaultDocument.id);
    } else {
      setSelectedDocument(null);
      setSelectedDocumentId('');
    }
  }, [documents]);

  const firstDocument = documents?.[0] ?? null;


  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader
          subheader={
            <Box display="flex" alignItems="center">
              <Typography variant="body2" color="text.secondary">
                Generate quest from the uploaded document through LLM. Model used:
              </Typography>
              <Typography variant="body2" color="text.secondary" fontWeight={600} ml={1}>
               GPT 3.5 Turbo 16K
              </Typography>
            </Box>
          }
          title="Generate Quest"
          avatar={
            <Avatar
              variant="square"
              src="/assets/ChatGPT.svg"
              sx={{width: 42, height: 42}}
            />
          }
        />
        <Divider/>
        <CardContent>
          <Grid container spacing={3}>
            <Grid md={4} xs={12}>
              <FormControl fullWidth required error={Boolean(formErrors.questName)}>
                <FormLabel htmlFor="quest name">Quest Name</FormLabel>
                <TextField
                  defaultValue="My Private Quest"
                  inputRef={questNameRef}
                  placeholder="The name of your quest"
                  variant='outlined'
                  size='small'
                  required
                  error={Boolean(formErrors.questName)}
                  helperText={formErrors.questName || ''}
                  onChange={() => {
                    if (formErrors.questName) {
                      setFormErrors(prev => ({ ...prev, questName: '' }));
                    }
                  }}
                />
              </FormControl>
            </Grid>
            <Grid md={4} xs={12}>
              <FormControl fullWidth required>
                <FormLabel htmlFor="quest type">Quest Type</FormLabel>
                <Select defaultValue="Private" label="Quest Type" inputRef={questTypeRef} disabled size="small">
                  <MenuItem value="Private">
                    <Chip variant="outlined" label="Private" color="secondary" size="small"/>
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid md={4} xs={12}>
              <FormControl fullWidth required error={Boolean(formErrors.courseGroup)}>
                <FormLabel htmlFor="course group">Course Group</FormLabel>
                <Select
                  value={selectedCourseGroupId}
                  label="Course Group"
                  onChange={handleCourseGroupChange}
                  size="small"
                  disabled
                >
                  {courseGroups?.map((courseGroup) => (
                    <MenuItem key={courseGroup.id} value={String(courseGroup.id)}>
                      {courseGroup.name}
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.courseGroup ? <FormHelperText>{formErrors.courseGroup}</FormHelperText> : null}
              </FormControl>
            </Grid>
            <Grid md={4} xs={12}>
              <FormControl fullWidth required>
                <FormLabel htmlFor="quest status">Quest Status</FormLabel>
                <Select defaultValue="Active" label="Quest Status" inputRef={questStatusRef} disabled size="small">
                  <MenuItem value="Active"><Chip variant="outlined" label="Active" color="success"
                                                 size="small"/></MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid xs={12}>
              <FormControl fullWidth required error={Boolean(formErrors.questDescription)}>
                <FormLabel htmlFor="quest description">Quest Description</FormLabel>
                <TextField
                  defaultValue="Private quest for my own learning."
                  inputRef={questDescriptionRef}
                  placeholder="The description of your quest"
                  variant='outlined'
                  multiline
                  rows={3}
                  required
                  error={Boolean(formErrors.questDescription)}
                  helperText={formErrors.questDescription || ''}
                  onChange={() => {
                    if (formErrors.questDescription) {
                      setFormErrors(prev => ({ ...prev, questDescription: '' }));
                    }
                  }}
                />
              </FormControl>
            </Grid>
            <Grid md={4} xs={12}>
              <FormControl fullWidth required error={Boolean(formErrors.maxAttempts)}>
                <FormLabel htmlFor="max attempts">Max Attempts</FormLabel>
                <TextField
                  defaultValue="1"
                  inputRef={questMaxAttemptsRef}
                  type="number"
                  inputProps={{min: 1}}
                  variant='outlined'
                  size='small'
                  required
                  error={Boolean(formErrors.maxAttempts)}
                  helperText={formErrors.maxAttempts || ''}
                  onChange={() => {
                    if (formErrors.maxAttempts) {
                      setFormErrors(prev => ({ ...prev, maxAttempts: '' }));
                    }
                  }}
                />
              </FormControl>
            </Grid>
            <Grid md={4} xs={12}>
              <FormControl fullWidth required error={Boolean(formErrors.numQuestions)}>
                <FormLabel htmlFor="num questions">Number of Questions</FormLabel>
                <TextField
                  defaultValue="3"
                  inputRef={numQuestionsRef}
                  type="number"
                  inputProps={{min: 1}}
                  variant='outlined'
                  size='small'
                  required
                  error={Boolean(formErrors.numQuestions)}
                  helperText={formErrors.numQuestions || ''}
                  onChange={() => {
                    if (formErrors.numQuestions) {
                      setFormErrors(prev => ({ ...prev, numQuestions: '' }));
                    }
                  }}
                />
              </FormControl>
            </Grid>
            <Grid md={4} xs={12}>
              <FormControl fullWidth required error={Boolean(formErrors.difficulty)}>
                <FormLabel htmlFor="difficulty">Difficulty</FormLabel>
                <Select
                  defaultValue="Easy"
                  label="Difficulty"
                  inputRef={difficultyRef}
                  size="small"
                  required
                  onChange={() => {
                    if (formErrors.difficulty) {
                      setFormErrors(prev => ({ ...prev, difficulty: '' }));
                    }
                  }}
                >
                  <MenuItem value="Easy">Easy</MenuItem>
                  <MenuItem value="Intermediate">Intermediate</MenuItem>
                  <MenuItem value="Difficult">Difficult</MenuItem>
                </Select>
                {formErrors.difficulty ? <FormHelperText>{formErrors.difficulty}</FormHelperText> : null}
              </FormControl>
            </Grid>
          </Grid>

          <Typography sx={{mt: 4}} variant="h6">Document Source</Typography>
          <Typography sx={{mb: 3}} variant="body2" color="text.secondary">Select a document to generate questions from:</Typography>
          {documents && documents.length > 0 && firstDocument ?
            <Grid container spacing={3}>
              <Grid md={4} xs={12}>
                <FormControl fullWidth required error={Boolean(formErrors.document)}>
                  <FormLabel htmlFor="document">Document</FormLabel>
                  <Select
                    id="document"
                    value={selectedDocumentId}
                    onChange={handleDocumentChange}
                    inputRef={questCourseIdRef}
                    variant="outlined"
                    type="number"
                    size="small"
                    required
                  >
                    {documents.map((option) => (
                      <MenuItem key={option.id} value={option.id}>
                        {option.id} - {option.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {formErrors.document ? <FormHelperText>{formErrors.document}</FormHelperText> : null}
                </FormControl>
              </Grid>
              <Grid md={8} xs={12} sx={{display: {xs: 'none', md: 'block'}}}/>
              <Grid md={3} xs={6}>
                <Typography variant="overline" color="text.secondary">Filename</Typography>
                <Typography variant="body2">{selectedDocument?.name || firstDocument.name}</Typography>
              </Grid>
              <Grid md={3} xs={6}>
                <Typography variant="overline" color="text.secondary"> Size</Typography>
                <Typography variant="body2">{selectedDocument?.size || firstDocument.size} MB</Typography>
              </Grid>
              <Grid md={3} xs={6}>
                <Typography variant="overline" color="text.secondary">Uploaded At</Typography>
                <Typography
                  variant="body2"> {new Date(selectedDocument?.uploaded_at || firstDocument.uploaded_at).toLocaleDateString("en-SG", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit'
                })}</Typography>
              </Grid>
              <Grid md={3} xs={6}>
                <Typography variant="overline" color="text.secondary">Source</Typography>
                <Typography variant="body2">
                  <a href={selectedDocument?.file || firstDocument.file} target="_blank" rel="noopener noreferrer">
                    Source
                  </a>
                </Typography>
              </Grid>
            </Grid>
            :
            <Stack spacing={2}>
              <Typography variant="body2" color="text.secondary">No uploaded documents found. </Typography>
              <Typography variant="body2" color="text.secondary">Please upload a document
                first before proceeding.</Typography>
            </Stack>


          }

          {showProgress ?
            <Box sx={{width: '100%', mt: 5}}>
              <LinearProgressWithLabel value={progress} status={progressStatus}/>
            </Box> : null}
        </CardContent>

        <CardActions sx={{justifyContent: 'flex-end'}}>
          { documents && documents.length > 0 ?
            <Button startIcon={<MagicWandIcon fontSize="var(--icon-fontSize-md)"/>} type="submit"
                    variant="contained" disabled={isSubmitting || showProgress}>Generate</Button>
          :
            <Button endIcon={<CaretRightIcon/>} component={RouterLink} href={paths.dashboard.generator.upload} variant="contained">
              Upload Document
            </Button>
          }

        </CardActions>

      </Card>
      {submitStatus ?
        <Alert severity={submitStatus.type} sx={{marginTop: 2}}>
          {submitStatus.message}
        </Alert> : null}
    </form>
  );
}
