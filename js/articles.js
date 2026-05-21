// ========== 文章模块 ==========

const Articles = {
  // 获取文章列表
  async getList({ category = null, page = 1, pageSize = 10 } = {}) {
    let query = supabase
      .from('articles')
      .select('*', { count: 'exact' })
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false });

    if (category) {
      query = query.eq('category', category);
    }

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;
    if (error) throw error;
    return { data, total: count };
  },

  // 获取单篇文章
  async getById(id) {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  // 创建文章
  async create({ title, content, cover_url, category, is_pinned = false }) {
    const { data, error } = await supabase
      .from('articles')
      .insert([{ title, content, cover_url, category, is_pinned }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // 更新文章
  async update(id, { title, content, cover_url, category, is_pinned }) {
    const { data, error } = await supabase
      .from('articles')
      .update({ title, content, cover_url, category, is_pinned, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // 删除文章
  async delete(id) {
    const { error } = await supabase
      .from('articles')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  // 上传图片到 Supabase Storage
  async uploadImage(file) {
    const ext = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;
    const filePath = `images/${fileName}`;

    const { error } = await supabase.storage
      .from('blog-images')
      .upload(filePath, file);

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('blog-images')
      .getPublicUrl(filePath);

    return publicUrl;
  },

  // 获取统计数据
  async getStats() {
    const { count: totalArticles } = await supabase
      .from('articles')
      .select('*', { count: 'exact', head: true })
      .eq('category', 'article');

    const { count: totalDaily } = await supabase
      .from('articles')
      .select('*', { count: 'exact', head: true })
      .eq('category', 'daily');

    const { count: totalOperation } = await supabase
      .from('articles')
      .select('*', { count: 'exact', head: true })
      .eq('category', 'operation');

    return {
      articles: totalArticles || 0,
      daily: totalDaily || 0,
      operations: totalOperation || 0
    };
  },

  // 格式化日期
  formatDate(dateStr) {
    const d = new Date(dateStr);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  // 截取摘要
  getExcerpt(html, maxLen = 120) {
    const text = html.replace(/<[^>]+>/g, '');
    return text.length > maxLen ? text.substring(0, maxLen) + '...' : text;
  }
};
