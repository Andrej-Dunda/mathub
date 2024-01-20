import { createContext, useContext, useEffect, useState } from 'react';
import React from 'react';
import httpClient from '../utils/httpClient';
import { iSubject, iTopic } from '../interfaces/materials-interface';
import { useSnackbar } from './SnackbarProvider';

type MaterialsContextType = {
  topics: iTopic[];
  setTopics: React.Dispatch<React.SetStateAction<iTopic[]>>;
  selectedTopic: iTopic | undefined;
  setSelectedTopic: React.Dispatch<React.SetStateAction<iTopic | undefined>>;

  subjects: iSubject[];
  setSubjects: React.Dispatch<React.SetStateAction<iSubject[]>>;
  selectedSubject: iSubject | undefined;
  setSelectedSubject: React.Dispatch<React.SetStateAction<iSubject | undefined>>;

  getSubjects: () => void;
  postSubject: (newSubjectName: string) => void;
  getSubject: (subject_id: string) => void;
  putSubject: (subject_id: string, subject_name: string) => void;
  deleteSubject: (subject_id: string) => void;

  getSubjectTopics: (subject_id: string) => void;
  postTopic: (subject_id: string, topic_name: string) => void;
  getTopic: (topic_id: string) => void;
  putTopic: (topic_id: string, topic_name: string, topic_content: string, keepTopicSelected?: boolean) => void;
  deleteTopic: (topic_id: string) => void;
};

export const MaterialsContext = createContext<MaterialsContextType | null>(null);

type MaterialsProviderProps = {
  children: React.ReactNode;
};

export const MaterialsProvider = ({ children }: MaterialsProviderProps) => {
  const [topics, setTopics] = useState<iTopic[]>([])
  const [selectedTopic, setSelectedTopic] = useState<iTopic | undefined>()

  const [subjects, setSubjects] = useState<iSubject[]>([])
  const [selectedSubject, setSelectedSubject] = useState<iSubject>()

  const { openSnackbar } = useSnackbar();

  useEffect(() => {
    selectedSubject && getSubjectTopics(selectedSubject._id)
  }, [selectedSubject])

  useEffect(() => {
    topics && setSelectedTopic(topics[0])
  }, [topics])

  const getSubjects = async () => {
    httpClient.get('/api/get-subjects')
      .then(res => {
        setSubjects(res.data)
      })
      .catch(err => {
        console.error(err)
      })
  }

  const postSubject = async (newSubjectName: string) => {
    if (newSubjectName) httpClient.post('/api/post-subject', {
      subject_name: newSubjectName
    })
      .then(() => {
        getSubjects()
        openSnackbar('Předmět úspěšně vytvořen!')
      })
      .catch(err => {
        console.error(err)
      })
  }

  const getSubject = async (subject_id: string) => {
    httpClient.get(`/api/get-subject/${subject_id}`)
      .then(res => {
        setSelectedSubject(res.data)
      })
      .catch(err => {
        console.error(err)
      })
  }

  const putSubject = async (subject_id: string, subject_name: string) => {
    httpClient.put(`/api/put-subject`, {
      subject_id,
      subject_name
    })
      .then(() => {
        getSubjects()
        setSelectedSubject(undefined)
        openSnackbar('Předmět úspěšně upraven!')
      })
      .catch(err => {
        console.error(err)
      })
  }

  const deleteSubject = async (subject_id: string) => {
    httpClient.delete(`/api/delete-subject/${subject_id}`)
      .then(() => {
        getSubjects()
        setSelectedSubject(undefined)
        openSnackbar('Předmět úspěšně smazán!')
      })
      .catch(err => {
        console.error(err)
      })
  }

  const getSubjectTopics = async (subject_id: string) => {
    httpClient.get(`/api/get-subject-topics/${subject_id}`)
      .then(res => {
        setTopics(res.data)
      })
      .catch(err => {
        console.error(err)
      })
  }

  const postTopic = async (subject_id: string, topic_name: string) => {
    httpClient.post('/api/post-topic', {
      subject_id,
      topic_name
    })
      .then(() => {
        getSubjectTopics(subject_id)
        openSnackbar('Materiál úspěšně vytvořen!')
      })
      .catch(err => {
        console.error(err)
      })
  }

  const getTopic = async (topic_id: string) => {
    httpClient.get(`/api/get-topic/${topic_id}`)
      .then(res => {
        setSelectedTopic(res.data)
      })
      .catch(err => {
        console.error(err)
      })
  }

  const putTopic = async (topic_id: string, topic_name: string, topic_content: string, keepTopicSelected?: boolean) => {
    httpClient.put(`/api/put-topic`, {
      topic_id: topic_id,
      topic_name: topic_name,
      topic_content: topic_content
    })
      .then(() => {
        keepTopicSelected && getTopic(topic_id)
        openSnackbar('Materiál úspěšně uložen!')
      })
      .catch(err => {
        console.error(err)
        openSnackbar('Materiál nemohl být uložen :(')
      })
  }

  const deleteTopic = async (topic_id: string) => {
    httpClient.delete(`/api/delete-topic/${topic_id}`)
      .then(() => {
        selectedSubject && getSubjectTopics(selectedSubject._id)
        setSelectedTopic(undefined)
        openSnackbar('Materiál úspěšně smazán!')
      })
      .catch(err => {
        console.error(err)
      })
  }

  const contextValue: MaterialsContextType = {
    topics,
    setTopics,
    selectedTopic,
    setSelectedTopic,

    subjects,
    setSubjects,
    selectedSubject,
    setSelectedSubject,

    getSubjects,
    postSubject,
    getSubject,
    putSubject,
    deleteSubject,

    getSubjectTopics,
    postTopic,
    getTopic,
    putTopic,
    deleteTopic,
  };

  return (
    <MaterialsContext.Provider value={contextValue}>
      {children}
    </MaterialsContext.Provider>
  );
};

export const useMaterials = () => {
  const currentContext = useContext(MaterialsContext);

  if (!currentContext) {
    throw new Error('useMaterials must be used within MaterialsProvider');
  }

  return currentContext;
};
