import { createContext, useContext, useEffect, useState } from 'react';
import React from 'react';
import { iMaterial, iTopic } from '../interfaces/materials-interface';
import { useSnackbar } from './SnackbarProvider';
import { useAuth } from './AuthProvider';

type MaterialsContextType = {
  topics: iTopic[];
  setTopics: React.Dispatch<React.SetStateAction<iTopic[]>>;
  selectedTopic: iTopic | undefined;
  setSelectedTopic: React.Dispatch<React.SetStateAction<iTopic | undefined>>;

  materials: iMaterial[];
  setMaterials: React.Dispatch<React.SetStateAction<iMaterial[]>>;
  selectedMaterial: iMaterial | undefined;
  setSelectedMaterial: React.Dispatch<React.SetStateAction<iMaterial | undefined>>;

  getMaterials: () => void;
  postMaterial: (newMaterialName: string, material_type: string, material_grade: string) => void;
  getMaterial: (material_id: string) => void;
  putMaterial: (material_id: string, material_name: string, material_grade: string, material_subject: string) => void;
  deleteMaterial: (material_id: string) => void;

  getTopics: (material_id: string) => void;
  postTopic: (material_id: string, topic_name: string) => void;
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

  const [materials, setMaterials] = useState<iMaterial[]>([])
  const [selectedMaterial, setSelectedMaterial] = useState<iMaterial>()

  const { openSnackbar } = useSnackbar();
  const { protectedHttpClientInit } = useAuth();

  useEffect(() => {
    selectedMaterial && getTopics(selectedMaterial._id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMaterial])

  useEffect(() => {
    materials && setSelectedMaterial(materials[0])
  }, [materials])

  useEffect(() => {
    topics && setSelectedTopic(topics[0])
  }, [topics])

  const getMaterials = async () => {
    const protectedHttpClient = await protectedHttpClientInit();
    protectedHttpClient?.get('/api/get-materials')
      .then(res => {
        setMaterials(res.data)
      })
      .catch(err => {
        console.error(err)
      })
  }

  const postMaterial = async (newMaterialName: string, selectedMaterialType: string, selectedMaterialGrade: string) => {
    if (newMaterialName) {
      const protectedHttpClient = await protectedHttpClientInit();
      protectedHttpClient?.post('/api/post-material', {
        material_name: newMaterialName,
        material_type: selectedMaterialType,
        material_grade: selectedMaterialGrade
      })
        .then(() => {
          getMaterials()
          openSnackbar('Materiál úspěšně vytvořen!')
        })
        .catch(err => {
          console.error(err)
        })
    }
  }

  const getMaterial = async (material_id: string) => {
    const protectedHttpClient = await protectedHttpClientInit();
    protectedHttpClient?.get(`/api/get-material/${material_id}`)
      .then(res => {
        setSelectedMaterial(res.data)
      })
      .catch(err => {
        console.error(err)
      })
  }

  const putMaterial = async (material_id: string, material_name: string, material_subject: string, material_grade: string) => {
    const protectedHttpClient = await protectedHttpClientInit();
    protectedHttpClient?.put(`/api/put-material`, {
      material_id: material_id,
      material_name: material_name,
      material_grade: material_grade,
      material_subject: material_subject
    })
      .then(() => {
        getMaterials()
        setSelectedMaterial(undefined)
        openSnackbar('Materiál úspěšně upraven!')
      })
      .catch(err => {
        console.error(err)
      })
  }

  const deleteMaterial = async (material_id: string) => {
    const protectedHttpClient = await protectedHttpClientInit();
    protectedHttpClient?.delete(`/api/delete-material/${material_id}`)
      .then(() => {
        getMaterials()
        setSelectedMaterial(undefined)
        openSnackbar('Materiál úspěšně smazán!')
      })
      .catch(err => {
        console.error(err)
      })
  }

  const getTopics = async (material_id: string) => {
    const protectedHttpClient = await protectedHttpClientInit();
    protectedHttpClient?.get(`/api/get-material-topics/${material_id}`)
      .then(res => {
        setTopics(res.data)
      })
      .catch(err => {
        console.error(err)
      })
  }

  const postTopic = async (material_id: string, topic_name: string) => {
    const protectedHttpClient = await protectedHttpClientInit();
    protectedHttpClient?.post('/api/post-topic', {
      material_id,
      topic_name
    })
      .then(() => {
        getTopics(material_id)
        openSnackbar('Téma úspěšně vytvořeno!')
      })
      .catch(err => {
        console.error(err)
      })
  }

  const getTopic = async (topic_id: string) => {
    const protectedHttpClient = await protectedHttpClientInit();
    protectedHttpClient?.get(`/api/get-topic/${topic_id}`)
      .then(res => {
        setSelectedTopic(res.data)
      })
      .catch(err => {
        console.error(err)
      })
  }

  const putTopic = async (topic_id: string, topic_name: string, topic_content: string, keepTopicSelected?: boolean) => {
    const protectedHttpClient = await protectedHttpClientInit();
    protectedHttpClient?.put(`/api/put-topic`, {
      topic_id: topic_id,
      topic_name: topic_name,
      topic_content: topic_content
    })
      .then(() => {
        openSnackbar('Téma úspěšně uloženo!')
        keepTopicSelected && getTopic(topic_id)
      })
      .catch(err => {
        console.error(err)
        openSnackbar('Téma nemohlo být uloženo :(')
      })
  }

  const deleteTopic = async (topic_id: string) => {
    const protectedHttpClient = await protectedHttpClientInit();
    protectedHttpClient?.delete(`/api/delete-topic/${topic_id}`)
      .then(() => {
        selectedMaterial && getTopics(selectedMaterial._id)
        setSelectedTopic(undefined)
        openSnackbar('Téma úspěšně smazáno!')
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

    materials,
    setMaterials,
    selectedMaterial,
    setSelectedMaterial,

    getMaterials,
    postMaterial,
    getMaterial,
    putMaterial,
    deleteMaterial,

    getTopics,
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
