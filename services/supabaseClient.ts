import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gbkybyjnkhzbashmnrxk.supabase.co';
const supabaseKey = 'sb_publishable_srTQVlvsAMXT-y80rMJSog_tv51kQsa';

export const supabase = createClient(supabaseUrl, supabaseKey);