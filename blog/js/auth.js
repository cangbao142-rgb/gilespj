// ========== 认证模块 ==========

const Auth = {
  // 检查是否已登录
  async isLoggedIn() {
    const session = supabase.auth.session();
    return !!session;
  },

  // 获取当前用户
  async getUser() {
    const user = supabase.auth.user();
    return user;
  },

  // 邮箱密码登录
  async signIn(email, password) {
    const { user, session, error } = await supabase.auth.signIn({
      email,
      password
    });
    if (error) throw error;
    return { user, session };
  },

  // 注册
  async signUp(email, password) {
    const { user, session, error } = await supabase.auth.signUp({
      email,
      password
    });
    if (error) throw error;
    return { user, session };
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
