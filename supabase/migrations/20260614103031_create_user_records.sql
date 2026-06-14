CREATE TABLE IF NOT EXISTS user_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  learned_term_ids text[] DEFAULT '{}',
  weak_term_ids text[] DEFAULT '{}',
  review_list_ids text[] DEFAULT '{}',
  quiz_history jsonb DEFAULT '[]',
  study_dates text[] DEFAULT '{}',
  streak integer DEFAULT 0,
  last_study_date text DEFAULT '',
  total_quizzes integer DEFAULT 0,
  correct_quizzes integer DEFAULT 0,
  weak_categories jsonb DEFAULT '{}',
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_own_record" ON user_records FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "insert_own_record" ON user_records FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "update_own_record" ON user_records FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "delete_own_record" ON user_records FOR DELETE
  TO authenticated USING (auth.uid() = user_id);
