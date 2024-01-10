export interface iSubject {
  subjectId: string;
  subjectName: string;
  materials: iMaterial[];
}

export interface iMaterial {
  materialId: string;
  materialName: string;
}