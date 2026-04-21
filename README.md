# GitHub Pages Blog

GitHub Pages와 GitHub API를 활용한 순수 정적 블로그입니다.  
서버 없이 모든 CRUD 기능이 동작합니다.

---

## 특징

- **서버 불필요** — GitHub Pages(정적 호스팅) + GitHub API로 모든 기능 구현
- **마크다운 지원** — 실시간 미리보기, 코드 하이라이팅
- **태그 분류** — 태그별 필터링 및 목록 보기
- **관리자 대시보드** — 글 작성/편집/삭제, 발행/임시저장 구분
- **미니멀 디자인** — 블랙 앤 화이트, 시스템 폰트, 반응형

---

## 폴더 구조

```
blog/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Pages 자동 배포
├── data/
│   └── posts.json              # 포스트 데이터 (CRUD 대상)
├── frontend/
│   ├── index.html              # 블로그 메인 (포스트 목록)
│   ├── post.html               # 포스트 상세
│   ├── 404.html                # 404 페이지
│   ├── admin/
│   │   ├── login.html          # 관리자 로그인 (GitHub PAT)
│   │   ├── index.html          # 관리자 대시보드 (목록/삭제)
│   │   └── editor.html         # 포스트 에디터 (작성/편집)
│   └── assets/
│       ├── css/
│       │   └── style.css       # 전체 스타일
│       └── js/
│           ├── config.js       # 블로그 설정 (★ 반드시 수정)
│           ├── github.js       # GitHub API 클라이언트
│           ├── auth.js         # 인증 헬퍼
│           └── utils.js        # 유틸리티 함수
└── README.md
```

---

## 시작하기

### 1. 레포지토리 생성

`{username}.github.io` 또는 원하는 이름으로 새 GitHub 레포지토리를 생성하세요.

> **팁**: `username.github.io` 이름으로 만들면 `https://username.github.io`로 접속됩니다.

### 2. 코드 업로드

```bash
git clone https://github.com/{username}/{repo-name}
# 이 프로젝트 파일을 복사한 뒤
git add .
git commit -m "init blog"
git push origin main
```

### 3. config.js 설정 ★

`frontend/assets/js/config.js`를 반드시 수정하세요:

```js
const CONFIG = {
  GITHUB_OWNER:  'your-username',   // GitHub 사용자명
  GITHUB_REPO:   'your-repo',       // 레포지토리명
  GITHUB_BRANCH: 'main',
  DATA_FILE:     'data/posts.json',
  BLOG_TITLE:    'My Blog',         // 블로그 이름
  BLOG_DESC:     '',
  POSTS_PER_PAGE: 10,
};
```

### 4. GitHub Pages 활성화

1. 레포지토리 → **Settings** → **Pages**
2. **Source** : `GitHub Actions` 선택

이후 `main` 브랜치에 push할 때마다 자동으로 배포됩니다.

### 5. Personal Access Token 발급

관리자 기능 사용 시 GitHub PAT이 필요합니다.

1. [GitHub Settings → Tokens](https://github.com/settings/tokens) 이동
2. **Generate new token (classic)** 클릭
3. `repo` 스코프 체크 (또는 Fine-grained token의 `contents: Read and write`)
4. 발급된 토큰 복사 (`ghp_...`)

> 토큰은 `sessionStorage`에만 저장되며, 브라우저를 닫으면 자동 삭제됩니다.

---

## 사용 방법

### 블로그 접속

배포 후 `https://{username}.github.io/{repo-name}/` (또는 `https://{username}.github.io/`)로 접속

### 관리자 로그인

`/admin/login.html` 접속 → GitHub PAT 입력 → 로그인

### 포스트 작성

1. 대시보드에서 **+ 새 포스트** 클릭
2. 제목, 슬러그, 요약, 태그 입력
3. 마크다운으로 본문 작성 (우측 미리보기 실시간 확인)
4. **임시저장** 또는 **발행** 클릭

> **Ctrl+S** 단축키로 임시저장 가능

### 포스트 편집 / 삭제

대시보드에서 각 포스트의 **편집** / **삭제** 버튼 사용

---

## CRUD 동작 방식

| 작업 | 방법 |
|------|------|
| **Read** (공개) | `raw.githubusercontent.com`으로 `data/posts.json` 직접 읽기 |
| **Read** (관리자) | GitHub Contents API로 최신 상태 읽기 |
| **Create** | GitHub Contents API로 `posts.json` 업데이트 |
| **Update** | GitHub Contents API로 `posts.json` 업데이트 |
| **Delete** | GitHub Contents API로 `posts.json` 업데이트 |

모든 포스트 데이터는 `data/posts.json` 파일 하나에 저장되며, Git 커밋 히스토리로 버전 관리됩니다.

> **캐시 지연**: `raw.githubusercontent.com`은 최대 5분 캐시가 있어, 발행 후 공개 블로그에 반영되기까지 최대 5분이 소요될 수 있습니다.

---

## 마크다운 지원

`marked.js` CDN을 통해 다음을 지원합니다:

- 헤딩 (`#`, `##`, ...)
- **굵게**, *기울임*, ~~취소선~~
- 인라인 코드, 코드 블록 (언어 명시 가능)
- 링크, 이미지
- 표 (GFM)
- 인용구 (`>`)
- 수평선 (`---`)

---

## 커스터마이징

### 블로그 제목 변경

`frontend/assets/js/config.js`의 `BLOG_TITLE` 수정

### 스타일 변경

`frontend/assets/css/style.css`에서 CSS 변수 수정:

```css
:root {
  --bg:      #ffffff;   /* 배경색 */
  --fg:      #000000;   /* 텍스트 색 */
  --muted:   #666666;   /* 흐린 텍스트 */
  --border:  #e5e5e5;   /* 구분선 */
  --surface: #f5f5f5;   /* 코드 블록 등 배경 */
}
```

### 페이지당 포스트 수

`config.js`의 `POSTS_PER_PAGE` 값 변경

---

## 주의사항

- 레포지토리는 **Public** 이어야 합니다 (GitHub Pages 무료 플랜 조건)
- GitHub PAT는 외부에 노출되지 않도록 주의하세요
- `data/posts.json`이 매우 커지면(수 MB 이상) 로딩이 느려질 수 있습니다

---

## 라이선스

MIT
