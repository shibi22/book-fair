
// Initialize Supabase Client
// REPLACE THESE WITH YOUR ACTUAL SUPABASE PROJECT CREDENTIALS
const SUPABASE_URL = 'https://zbrfzmxvofzkmfdtwrsw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpicmZ6bXh2b2Z6a21mZHR3cnN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcxOTcxMzcsImV4cCI6MjA4Mjc3MzEzN30.mw3iTB9onxWLdscbR5nCt2iXf45cjpg7MmufBlZxvJU';

if (typeof supabase === 'undefined') {
    console.error('Supabase library not loaded! Check your CDN links.');
}

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Helper to check if user is admin
async function checkAdminAuth() {
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (!session) {
        window.location.href = 'admin-login.html';
    }
    return session;
}
