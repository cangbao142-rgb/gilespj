// ========== 认证模块 ==========

const Auth = {
  // 检查是否已登录
  async isLoggedIn() {
    const { data: { session } } = await supabase.auth.getSession();
    return !!session;
  },

  // 获取当前用户
  async getUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  // 邮箱密码登录
  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) throw error;
    return data;
  },

  // 注册
  async signUp(email, password) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    });
    if (error) throw error;
    return data;
  },

  // 退出登录
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // 保护管理页面 - 未登录则跳转
  async requireAuth() {
    const loggedIn = await this.isLoggedIn();
    if (!loggedIn) {
      window.location.href = 'login.html';
      return false;
    }
    return true;
  }
};
