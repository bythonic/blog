const GITHUB = {
  get _base() { return 'https://api.github.com'; },
  get _raw()  { return 'https://raw.githubusercontent.com'; },
  get _path() { return `/repos/${CONFIG.GITHUB_OWNER}/${CONFIG.GITHUB_REPO}/contents`; },

  async _api(path, opts = {}) {
    const token = AUTH.getToken();
    const headers = { 'Accept': 'application/vnd.github.v3+json' };
    if (token)    headers['Authorization'] = `token ${token}`;
    if (opts.body) headers['Content-Type'] = 'application/json';

    const res = await fetch(`${this._base}${path}`, { ...opts, headers });
    if (res.status === 404) throw new Error('NOT_FOUND');
    if (!res.ok) {
      const e = await res.json().catch(() => ({}));
      throw new Error(e.message || `HTTP ${res.status}`);
    }
    return res.json();
  },

  // raw URL로 공개 읽기 (rate limit 없음)
  async _rawGet(filePath) {
    const url = `${this._raw}/${CONFIG.GITHUB_OWNER}/${CONFIG.GITHUB_REPO}/${CONFIG.GITHUB_BRANCH}/${filePath}?_=${Date.now()}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    return res.json();
  },

  // GitHub API로 파일 읽기 (관리자용 - 항상 최신 상태)
  async readFile(filePath) {
    return this._api(`${this._path}/${filePath}?ref=${CONFIG.GITHUB_BRANCH}`);
  },

  // 파일 생성/수정
  async writeFile(filePath, content, sha, commitMsg) {
    const body = {
      message: commitMsg || `Update ${filePath}`,
      content: UTILS.b64Encode(content),
      branch: CONFIG.GITHUB_BRANCH,
    };
    if (sha) body.sha = sha;
    return this._api(`${this._path}/${filePath}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  },

  // 파일 삭제
  async deleteFile(filePath, sha, commitMsg) {
    return this._api(`${this._path}/${filePath}`, {
      method: 'DELETE',
      body: JSON.stringify({
        message: commitMsg || `Delete ${filePath}`,
        sha,
        branch: CONFIG.GITHUB_BRANCH,
      }),
    });
  },

  // GitHub 사용자 인증 확인
  async verifyToken() {
    return this._api('/user');
  },

  // ── 포스트 CRUD ──────────────────────────────────────────────────────────

  // 포스트 목록 읽기 (공개: raw URL, 관리자: API)
  async getPosts(asAdmin = false) {
    if (asAdmin) {
      try {
        const file = await this.readFile(CONFIG.DATA_FILE);
        const data = JSON.parse(UTILS.b64Decode(file.content));
        return { posts: data.posts || [], sha: file.sha };
      } catch (e) {
        if (e.message === 'NOT_FOUND') return { posts: [], sha: null };
        throw e;
      }
    }
    const data = await this._rawGet(CONFIG.DATA_FILE);
    return { posts: (data && data.posts) || [], sha: null };
  },

  // 포스트 저장 (전체 JSON 파일 교체)
  async savePosts(posts, sha, msg) {
    const content = JSON.stringify({ posts }, null, 2);
    return this.writeFile(CONFIG.DATA_FILE, content, sha, msg);
  },

  // 포스트 생성
  async createPost(postData, sha) {
    const { posts } = await this.getPosts(true).then(r => r).catch(() => ({ posts: [] }));
    const current = await this.getPosts(true);

    const newPost = {
      id:         UTILS.uid(),
      title:      postData.title,
      slug:       postData.slug || UTILS.slugify(postData.title),
      content:    postData.content,
      summary:    postData.summary || '',
      tags:       postData.tags || [],
      published:  postData.published ?? false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // slug 중복 방지
    const slugs = current.posts.map(p => p.slug);
    if (slugs.includes(newPost.slug)) {
      newPost.slug = `${newPost.slug}-${Date.now()}`;
    }

    const updated = [newPost, ...current.posts];
    await this.savePosts(updated, current.sha, `Add post: ${newPost.title}`);
    return newPost;
  },

  // 포스트 수정
  async updatePost(id, updates) {
    const current = await this.getPosts(true);
    const idx = current.posts.findIndex(p => p.id === id);
    if (idx === -1) throw new Error('포스트를 찾을 수 없습니다');

    current.posts[idx] = {
      ...current.posts[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    await this.savePosts(current.posts, current.sha, `Update post: ${current.posts[idx].title}`);
    return current.posts[idx];
  },

  // 포스트 삭제
  async deletePost(id) {
    const current = await this.getPosts(true);
    const post = current.posts.find(p => p.id === id);
    if (!post) throw new Error('포스트를 찾을 수 없습니다');

    const updated = current.posts.filter(p => p.id !== id);
    await this.savePosts(updated, current.sha, `Delete post: ${post.title}`);
  },
};
