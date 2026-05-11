// ========== Supabase 配置 ==========
// 部署前请替换为你自己的 Supabase 项目 URL 和 anon key
const SUPABASE_URL = 'https://ljyktooeikwjdhwcxazm.supabase.co/rest/v1/';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqeWt0b29laWt3amRod2N4YXptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg1MDI4NjIsImV4cCI6MjA5NDA3ODg2Mn0.LVpRSFAqgFEy17m4Ub5fVIjc6FV9KztnUIAVqDH1QYA';

// 初始化 Supabase 客户端
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
