import { createClient } from '@supabase/supabase-js';

// To be more secure: .env file. 
const supabaseURL = "https://gkbfeltbnshikhbhnmxg.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdrYmZlbHRibnNoaWtoYmhubXhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI1ODAyNzgsImV4cCI6MjA1ODE1NjI3OH0.jp6XHDaKd6nWrBxnfE51_2VIE8bDBvsAjbbCFVi8Zuo";

export const supabase = createClient(supabaseURL, supabaseAnonKey);

// import { createClient } from '@supabase/supabase-js';

// const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
// const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// export const supabase = createClient(supabaseUrl, supabaseAnonKey);
