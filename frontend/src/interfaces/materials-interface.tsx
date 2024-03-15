export interface iSubject {
  _id: string;
  author_id: string;
  subject_name: string;
  date_created: string;
  date_modified: string;
  subject_type: string;
  subject_grade: string;
}

export interface iTopic {
  _id: string;
  topic_name: string;
  topic_content: string;
  date_created: string;
  date_modified: string;
}