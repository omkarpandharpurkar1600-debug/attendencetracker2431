import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://rmkawqdgkedqezkbcfvn.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJta2F3cWRna2VkcWV6a2JjZnZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA2NTA2NjcsImV4cCI6MjA5NjIyNjY2N30.REjI6J6_76BMQD9VP-aDfRrJ-VEc8qIuiUP7RzlfEls'
);

export default supabase;
