import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://uzybsyjmmsgkcsqehlaq.supabase.co';
const supabaseAnonKey = 'sb_publishable_XGcVpXl5qZN4Yu93I8K1NQ_0JL-Dzrk';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);