"use client";

import * as React from 'react';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
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
  const [submitStatus, setSubmitStatus] = React.useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [progress, setProgress] = React.useState(0);
  const [progressStatus, setProgressStatus] = React.useState<string>(''); // New state for progress status message
  const [showProgress, setShowProgress] = React.useState(false); // State to control progress bar visibility

  const fetchImages = async (): Promise<void> => {
    try {
      const response = await getImages();
      const privateQuestImages = response.filter(image => image.name === 'Private Quest');
      setImages(privateQuestImages);
    } catch (error: unknown) {
      logger.error('Failed to fetch images', error);
    }
  }

  const fetchCourseGroups = async (): Promise<void> => {
    if (eduquestUser) {
      try {
        const response = await getNonPrivateCourseGroups()
        setCourseGroups(response);
        logger.debug('Course groups from private course', response);
      } catch (error: unknown) {
        logger.error('Failed to fetch course groups', error);
      }
    }
  };

  // Handle document change
  const handleDocumentChange = (event: SelectChangeEvent<number>): void => {
    const documentId = Number(event.target.value);
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
  };

  const handleCourseGroupChange = (event: SelectChangeEvent): void => {
    setSelectedCourseGroupId(event.target.value);
  };

  const fetchMyDocuments = async (): Promise<void> => {
    if (eduquestUser) {
      try {
        const response = await getMyDocuments(eduquestUser.id.toString());
        setDocuments(response);
        logger.debug('Documents', response);
      } catch (error: unknown) {
        logger.error('Failed to fetch documents', error);
      }
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setSubmitStatus(null); // Reset submit status
    setProgress(10); // Initial progress
    setProgressStatus('Creating a new Quest'); // Initial progress status
    setShowProgress(true); // Show progress bar

    if (
      images?.length &&
      courseGroups?.length &&
      selectedCourseGroupId &&
      eduquestUser &&
      questTypeRef.current &&
      questNameRef.current &&
      questDescriptionRef.current &&
      questStatusRef.current &&
      questMaxAttemptsRef.current
    ) {
      const newQuest = {
        type: questTypeRef.current?.value,
        name: questNameRef.current?.value,
        description: questDescriptionRef.current?.value,
        status: questStatusRef.current?.value,
        max_attempts: Number(questMaxAttemptsRef.current?.value),
        expiration_date: null,
        tutorial_date: null,
        course_group_id: Number(selectedCourseGroupId),
        organiser_id: eduquestUser?.id,
        image_id: images?.[0]?.id
      };

    const filename = selectedDocument?.file || documents?.[0].file;
    const newQuestId = await createNewQuest(newQuest);


    if (newQuestId) {
      setProgress(40); // Progress after quest creation
      setProgressStatus('Generating Questions from Document'); // Progress status after quest creation
      logger.debug('Calling generateQuestions');
      const generatedQuestions = await generateQuestions(
        filename?.split('/').pop() || '',
        Number(numQuestionsRef.current?.value),
        difficultyRef.current?.value || ''
      );

      logger.debug('Generated questions:', generatedQuestions);
      // logger.debug('is array:', Array.isArray(generatedQuestions.questions));

      if (generatedQuestions === null) {
        logger.debug('Generated questions is null');
        setSubmitStatus({ type: 'error', message: 'Generate Failed. Please try again.' });
        setProgressStatus('Generation failed'); // Progress status on failure
      } else if (Array.isArray(generatedQuestions.questions)) {
        setProgress(70); // Progress after questions generation
        setProgressStatus('Importing Questions generated'); // Progress status after questions generation
        logger.debug('Generated questions is an array');
        await bulkCreateQuestions(generatedQuestions.questions, newQuestId);
        setProgress(100); // Final progress
        setProgressStatus('Completed'); // Final progress status
      } else {
        logger.debug('Generated questions is not an array:', generatedQuestions);
        setSubmitStatus({ type: 'error', message: 'Generate Failed. Please try again.' });
        setProgressStatus('Generation failed'); // Progress status on failure
      }

      } else {
        setSubmitStatus({ type: 'error', message: 'Quest creation failed. Please try again.' });
        setProgressStatus('Quest creation failed'); // Progress status on failure
      }

    } else {
      setSubmitStatus({ type: 'error', message: 'Please fill in all required fields.' });
      setProgressStatus('Quest creation failed'); // Progress status
    }
    setShowProgress(false); // Hide progress bar after submission
  };


  const createNewQuest = async (newQuest: QuestNewForm): Promise<number | null> => {
    try {
      const response = await createQuest(newQuest);
      // logger.debug('Quest Create Success:', response);
      return response.id;
    }
    catch (error: unknown) {
      logger.error('Failed to create quest', error);
      setSubmitStatus({ type: 'error', message: 'Create Failed. Please try again.' });
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
      setSubmitStatus({ type: 'error', message: 'Generate Failed. Please try again.' });
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
      const errorMessage = 'Questions Create Failed. Please try again.';
      logger.error('Questions Create Failed', error);
      setSubmitStatus({type: 'error', message: errorMessage});
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
  }, []);

  React.useEffect(() => {
    if (courseGroups?.length && !selectedCourseGroupId) {
      setSelectedCourseGroupId(String(courseGroups[0]?.id));
    }
  }, [courseGroups, selectedCourseGroupId]);


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
              <FormControl fullWidth required>
                <FormLabel htmlFor="quest name">Quest Name</FormLabel>
                <TextField
                  defaultValue="My Private Quest"
                  inputRef={questNameRef}
                  placeholder="The name of your quest"
                  variant='outlined'
                  size='small'
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
              <FormControl fullWidth required>
                <FormLabel htmlFor="course group">Course Group</FormLabel>
                <Select
                  value={selectedCourseGroupId}
                  label="Course Group"
                  onChange={handleCourseGroupChange}
                  size="small"
                >
                  {courseGroups?.map((courseGroup) => (
                    <MenuItem key={courseGroup.id} value={String(courseGroup.id)}>
                      {courseGroup.name}
                    </MenuItem>
                  ))}
                </Select>
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
              <FormControl fullWidth required>
                <FormLabel htmlFor="quest description">Quest Description</FormLabel>
                <TextField
                  defaultValue="Private quest for my own learning."
                  inputRef={questDescriptionRef}
                  placeholder="The description of your quest"
                  variant='outlined'
                  multiline
                  rows={3}
                />
              </FormControl>
            </Grid>
            <Grid md={4} xs={12}>
              <FormControl fullWidth required>
                <FormLabel htmlFor="max attempts">Max Attempts</FormLabel>
                <TextField
                  defaultValue="1"
                  inputRef={questMaxAttemptsRef}
                  type="number"
                  inputProps={{min: 1}}
                  variant='outlined'
                  size='small'
                />
              </FormControl>
            </Grid>
            <Grid md={4} xs={12}>
              <FormControl fullWidth required>
                <FormLabel htmlFor="num questions">Number of Questions</FormLabel>
                <TextField
                  defaultValue="3"
                  inputRef={numQuestionsRef}
                  type="number"
                  inputProps={{min: 1}}
                  variant='outlined'
                  size='small'
                />
              </FormControl>
            </Grid>
            <Grid md={4} xs={12}>
              <FormControl fullWidth required>
                <FormLabel htmlFor="difficulty">Difficulty</FormLabel>
                <Select defaultValue="Easy" label="Difficulty" inputRef={difficultyRef} size="small">
                  <MenuItem value="Easy">Easy</MenuItem>
                  <MenuItem value="Intermediate">Intermediate</MenuItem>
                  <MenuItem value="Difficult">Difficult</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <Typography sx={{mt: 4}} variant="h6">Document Source</Typography>
          <Typography sx={{mb: 3}} variant="body2" color="text.secondary">Select a document to generate questions from:</Typography>
          {documents && documents.length > 0 ?
            <Grid container spacing={3}>
              <Grid md={4} xs={12}>
                <FormControl fullWidth required>
                  <FormLabel htmlFor="document">Document</FormLabel>
                  <Select
                    id="document"
                    defaultValue={documents[0]?.id}
                    onChange={handleDocumentChange}
                    inputRef={questCourseIdRef}
                    variant="outlined"
                    type="number"
                    size="small"
                  >
                    {documents.map((option) => (
                      <MenuItem key={option.id} value={option.id}>
                        {option.id} - {option.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid md={8} xs={12} sx={{display: {xs: 'none', md: 'block'}}}/>
              <Grid md={3} xs={6}>
                <Typography variant="overline" color="text.secondary">Filename</Typography>
                <Typography variant="body2">{selectedDocument?.name || documents[0].name}</Typography>
              </Grid>
              <Grid md={3} xs={6}>
                <Typography variant="overline" color="text.secondary"> Size</Typography>
                <Typography variant="body2">{selectedDocument?.size || documents[0].size} MB</Typography>
              </Grid>
              <Grid md={3} xs={6}>
                <Typography variant="overline" color="text.secondary">Uploaded At</Typography>
                <Typography
                  variant="body2"> {new Date(selectedDocument?.uploaded_at || documents[0].uploaded_at).toLocaleDateString("en-SG", {
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
                  <a href={selectedDocument?.file || documents[0].file} target="_blank" rel="noopener noreferrer">
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
                    variant="contained">Generate</Button>
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
