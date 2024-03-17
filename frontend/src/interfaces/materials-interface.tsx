export interface iMaterial {
  _id: string;
  author_id: string;
  material_name: string;
  date_created: string;
  date_modified: string;
  material_subject: string;
  material_grade: string;
}

export interface iTopic {
  _id: string;
  topic_name: string;
  topic_content: string;
  date_created: string;
  date_modified: string;
}