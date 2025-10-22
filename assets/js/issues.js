(function () {
  const config = window.__ISSUE_SITE_CONFIG__ || {};
  if (!config.owner || !config.repo) {
    return;
  }

  const API_ROOT = `https://api.github.com/repos/${config.owner}/${config.repo}`;
  const JSON_HEADERS = { Accept: 'application/vnd.github+json' };
  const HTML_HEADERS = { Accept: 'application/vnd.github.html+json' };

  function formatDate(isoString) {
    const date = new Date(isoString);
    if (Number.isNaN(date.getTime())) {
      return isoString || '';
    }
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
  }

  function formatDateTime(isoString) {
    const date = new Date(isoString);
    if (Number.isNaN(date.getTime())) {
      return isoString || '';
    }
    const hours = `${date.getHours()}`.padStart(2, '0');
    const minutes = `${date.getMinutes()}`.padStart(2, '0');
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 ${hours}:${minutes}`;
  }

  function summarise(text = '', max = 130) {
    if (!text) return '';
    const cleaned = text
      .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
      .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
      .replace(/[#>*`]/g, '')
      .replace(/\r?\n+/g, ' ')
      .trim();
    if (cleaned.length <= max) {
      return cleaned;
    }
    return `${cleaned.slice(0, max)}…`;
  }

  function buildIssueUrl(number) {
    const base = config.issueDetailBase || '/journal/issue/';
    if (base.includes('?')) {
      const separator = base.endsWith('?') || base.endsWith('&') ? '' : '&';
      return `${base}${separator}id=${number}`;
    }
    const trailing = base.endsWith('/') ? base : `${base}/`;
    return `${trailing}?id=${number}`;
  }

  async function fetchIssuesPage({ page = 1, perPage = 20 } = {}) {
    const params = new URLSearchParams({
      state: 'all',
      sort: 'updated',
      direction: 'desc',
      per_page: String(perPage),
      page: String(page)
    });
    const response = await fetch(`${API_ROOT}/issues?${params.toString()}`, {
      headers: JSON_HEADERS
    });
    if (!response.ok) {
      throw new Error(`无法获取 Issue 列表，状态码 ${response.status}`);
    }
    const data = await response.json();
    const filtered = Array.isArray(data) ? data.filter(item => !item.pull_request) : [];
    return {
      items: filtered,
      rawCount: Array.isArray(data) ? data.length : 0
    };
  }

  async function fetchIssueDetail(number) {
    const response = await fetch(`${API_ROOT}/issues/${number}`, {
      headers: HTML_HEADERS
    });
    if (!response.ok) {
      throw new Error(`无法获取 Issue #${number}，状态码 ${response.status}`);
    }
    return response.json();
  }

  async function fetchIssueComments(number, limit = 10) {
    const params = new URLSearchParams({
      per_page: String(limit),
      page: '1',
      direction: 'asc'
    });
    const response = await fetch(`${API_ROOT}/issues/${number}/comments?${params.toString()}`, {
      headers: HTML_HEADERS
    });
    if (!response.ok) {
      throw new Error(`无法获取 Issue #${number} 的评论，状态码 ${response.status}`);
    }
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  }

  function createLabelBadges(labels = []) {
    if (!labels || !labels.length) {
      return null;
    }
    const container = document.createElement('div');
    container.className = 'issue-label-group';
    labels.forEach(label => {
      const badge = document.createElement('span');
      badge.className = 'issue-label';
      badge.textContent = label.name;
      badge.style.setProperty('--label-color', `#${label.color}`);
      container.appendChild(badge);
    });
    return container;
  }

  function createHighlightCard(issue) {
    const card = document.createElement('article');
    card.className = 'post-card issue-card';
    const link = document.createElement('a');
    link.className = 'post-card-link';
    link.href = buildIssueUrl(issue.number);

    const header = document.createElement('div');
    header.className = 'post-card-header';

    const date = document.createElement('span');
    date.className = 'post-date';
    date.textContent = formatDate(issue.updated_at || issue.created_at);
    header.appendChild(date);

    const title = document.createElement('h3');
    title.textContent = issue.title;
    header.appendChild(title);

    link.appendChild(header);

    if (issue.body) {
      const excerpt = document.createElement('p');
      excerpt.className = 'post-excerpt';
      excerpt.textContent = summarise(issue.body, 130);
      link.appendChild(excerpt);
    }

    const footer = document.createElement('div');
    footer.className = 'post-card-footer';

    const number = document.createElement('span');
    number.className = 'issue-number';
    number.textContent = `#${issue.number}`;
    footer.appendChild(number);

    const cta = document.createElement('span');
    cta.className = 'post-cta';
    cta.textContent = '查看详情';
    footer.appendChild(cta);

    link.appendChild(footer);

    const labelBadges = createLabelBadges(issue.labels);
    if (labelBadges) {
      labelBadges.classList.add('post-card-labels');
      link.appendChild(labelBadges);
    }

    card.appendChild(link);
    return card;
  }

  function createListItem(issue) {
    const article = document.createElement('article');
    article.className = 'issue-list-item';

    const link = document.createElement('a');
    link.className = 'issue-list-link';
    link.href = buildIssueUrl(issue.number);

    const meta = document.createElement('div');
    meta.className = 'issue-list-meta';

    const date = document.createElement('span');
    date.className = 'issue-list-date';
    date.textContent = formatDate(issue.updated_at || issue.created_at);
    meta.appendChild(date);

    const number = document.createElement('span');
    number.className = 'issue-list-number';
    number.textContent = `#${issue.number}`;
    meta.appendChild(number);

    if (typeof issue.comments === 'number' && issue.comments > 0) {
      const comments = document.createElement('span');
      comments.className = 'issue-list-comments';
      comments.textContent = `${issue.comments} 条评论`;
      meta.appendChild(comments);
    }

    link.appendChild(meta);

    const title = document.createElement('h2');
    title.textContent = issue.title;
    link.appendChild(title);

    if (issue.body) {
      const summary = document.createElement('p');
      summary.className = 'issue-list-summary';
      summary.textContent = summarise(issue.body, 180);
      link.appendChild(summary);
    }

    const labelBadges = createLabelBadges(issue.labels);
    if (labelBadges) {
      labelBadges.classList.add('issue-list-labels');
      link.appendChild(labelBadges);
    }

    article.appendChild(link);
    return article;
  }

  function createEmptyState(message) {
    const div = document.createElement('div');
    div.className = 'empty-card';
    div.textContent = message;
    return div;
  }

  function renderLatestSections() {
    const containers = document.querySelectorAll('[data-issues-latest]');
    if (!containers.length) {
      return;
    }

    containers.forEach(container => {
      const limit = parseInt(container.getAttribute('data-limit') || '3', 10);
      container.innerHTML = '';
      const loading = document.createElement('div');
      loading.className = 'loading-card';
      loading.textContent = '正在加载最新 Issue…';
      container.appendChild(loading);

      const perPage = Math.min(Math.max(limit * 3, limit), 100);
      fetchIssuesPage({ page: 1, perPage })
        .then(({ items }) => {
          container.innerHTML = '';
          if (!items.length) {
            container.appendChild(createEmptyState('暂时没有可展示的 Issue。'));
            return;
          }
          items.slice(0, limit).forEach(issue => {
            container.appendChild(createHighlightCard(issue));
          });
        })
        .catch(error => {
          container.innerHTML = '';
          const message = createEmptyState(`加载失败：${error.message}`);
          container.appendChild(message);
        });
    });
  }

  function initIssueList() {
    const list = document.querySelector('[data-issues-list]');
    if (!list) {
      return;
    }

    const loadMoreButton = list.closest('section')?.querySelector('[data-issues-load-more]');
    const perPage = parseInt(list.getAttribute('data-per-page') || '10', 10);
    let currentPage = 1;
    let loading = false;
    let reachedEnd = false;

    function setButtonState() {
      if (!loadMoreButton) return;
      if (reachedEnd) {
        loadMoreButton.textContent = '已经到底了';
        loadMoreButton.disabled = true;
      } else if (loading) {
        loadMoreButton.textContent = '加载中…';
        loadMoreButton.disabled = true;
      } else {
        loadMoreButton.textContent = '加载更多';
        loadMoreButton.disabled = false;
      }
    }

    async function loadNextPage() {
      if (loading || reachedEnd) {
        return;
      }
      loading = true;
      setButtonState();
      if (currentPage === 1) {
        list.innerHTML = '';
      }
      try {
        const { items, rawCount } = await fetchIssuesPage({ page: currentPage, perPage });
        if (!items.length) {
          if (currentPage === 1) {
            list.appendChild(createEmptyState('暂未找到任何 Issue。'));
          }
          if (rawCount < perPage) {
            reachedEnd = true;
          } else {
            currentPage += 1;
          }
        } else {
          const fragment = document.createDocumentFragment();
          items.forEach(issue => {
            fragment.appendChild(createListItem(issue));
          });
          list.appendChild(fragment);
          if (rawCount < perPage) {
            reachedEnd = true;
          } else {
            currentPage += 1;
          }
        }
      } catch (error) {
        if (!list.children.length) {
          list.appendChild(createEmptyState(`加载失败：${error.message}`));
        }
        reachedEnd = true;
      } finally {
        loading = false;
        setButtonState();
      }
    }

    if (loadMoreButton) {
      loadMoreButton.addEventListener('click', () => {
        loadNextPage();
      });
    }

    loadNextPage();
  }

  function buildStatusBadge(issue) {
    const badge = document.createElement('span');
    badge.className = `issue-status issue-status--${issue.state}`;
    badge.textContent = issue.state === 'open' ? '开放中' : '已关闭';
    return badge;
  }

  function initIssueDetail() {
    const container = document.querySelector('[data-issue-container]');
    if (!container) {
      return;
    }

    const numberTarget = container.querySelector('[data-issue-number]');
    const metaTarget = container.querySelector('[data-issue-meta]');
    const titleTarget = container.querySelector('[data-issue-title]');
    const bodyTarget = container.querySelector('[data-issue-body]');
    const labelsTarget = container.querySelector('[data-issue-labels]');
    const commentsSection = document.querySelector('[data-issue-comments]');
    const commentsList = document.querySelector('[data-issue-comments-list]');

    const url = new URL(window.location.href);
    const idParam = url.searchParams.get('id') || url.searchParams.get('issue') || url.searchParams.get('number');
    const issueNumber = Number.parseInt(idParam, 10);

    if (!issueNumber) {
      titleTarget.textContent = '未找到 Issue 编号';
      metaTarget.textContent = '请在链接中提供 ?id=数字。';
      bodyTarget.innerHTML = '';
      bodyTarget.appendChild(createEmptyState('无法加载内容。'));
      if (numberTarget) {
        numberTarget.textContent = '';
      }
      if (commentsSection) {
        commentsSection.hidden = true;
      }
      return;
    }

    if (numberTarget) {
      numberTarget.textContent = `Issue #${issueNumber}`;
    }

    metaTarget.textContent = '正在加载元数据…';
    bodyTarget.innerHTML = '';
    const loading = document.createElement('div');
    loading.className = 'loading-card';
    loading.textContent = '正在加载帖子内容…';
    bodyTarget.appendChild(loading);

    fetchIssueDetail(issueNumber)
      .then(issue => {
        titleTarget.textContent = issue.title;
        if (metaTarget) {
          metaTarget.innerHTML = '';
          const badge = buildStatusBadge(issue);
          metaTarget.appendChild(badge);

          if (issue.user) {
            metaTarget.appendChild(document.createTextNode(' · 作者 '));
            const authorLink = document.createElement('a');
            authorLink.href = issue.user.html_url;
            authorLink.target = '_blank';
            authorLink.rel = 'noopener';
            authorLink.textContent = issue.user.login;
            metaTarget.appendChild(authorLink);
          }

          metaTarget.appendChild(document.createTextNode(` · 发布于 ${formatDateTime(issue.created_at)}`));
          metaTarget.appendChild(document.createTextNode(` · 最近更新 ${formatDateTime(issue.updated_at)}`));

          const originLink = document.createElement('a');
          originLink.href = issue.html_url;
          originLink.target = '_blank';
          originLink.rel = 'noopener';
          originLink.textContent = '前往 GitHub 查看原文';
          metaTarget.appendChild(document.createTextNode(' · '));
          metaTarget.appendChild(originLink);
        }

        if (labelsTarget) {
          labelsTarget.innerHTML = '';
          const labelBadges = createLabelBadges(issue.labels);
          if (labelBadges) {
            labelsTarget.appendChild(labelBadges);
          }
        }

        if (bodyTarget) {
          bodyTarget.innerHTML = '';
          const wrapper = document.createElement('div');
          wrapper.className = 'issue-body-html';
          if (issue.body_html) {
            wrapper.innerHTML = issue.body_html;
          } else if (issue.body) {
            wrapper.textContent = issue.body;
          } else {
            wrapper.textContent = '这篇 Issue 没有正文内容。';
          }
          bodyTarget.appendChild(wrapper);
        }

        if (config.siteTitle && issue.title) {
          document.title = `${issue.title} · ${config.siteTitle}`;
        }

        if (commentsSection && commentsList && issue.comments > 0) {
          commentsSection.hidden = false;
          commentsList.innerHTML = '';
          const commentLoading = document.createElement('div');
          commentLoading.className = 'loading-card';
          commentLoading.textContent = '正在加载评论…';
          commentsList.appendChild(commentLoading);

          fetchIssueComments(issueNumber)
            .then(comments => {
              commentsList.innerHTML = '';
              if (!comments.length) {
                commentsList.appendChild(createEmptyState('暂无公开评论。'));
                return;
              }
              const fragment = document.createDocumentFragment();
              comments.forEach(comment => {
                const item = document.createElement('article');
                item.className = 'issue-comment';

                const header = document.createElement('header');
                header.className = 'issue-comment-header';

                const author = document.createElement('span');
                author.className = 'issue-comment-author';
                if (comment.user) {
                  const authorLink = document.createElement('a');
                  authorLink.href = comment.user.html_url;
                  authorLink.target = '_blank';
                  authorLink.rel = 'noopener';
                  authorLink.textContent = comment.user.login;
                  author.appendChild(authorLink);
                } else {
                  author.textContent = '匿名';
                }
                header.appendChild(author);

                const time = document.createElement('time');
                time.className = 'issue-comment-time';
                time.dateTime = comment.created_at;
                time.textContent = formatDateTime(comment.created_at);
                header.appendChild(time);

                item.appendChild(header);

                const body = document.createElement('div');
                body.className = 'issue-comment-body';
                if (comment.body_html) {
                  body.innerHTML = comment.body_html;
                } else if (comment.body) {
                  body.textContent = comment.body;
                }
                item.appendChild(body);

                fragment.appendChild(item);
              });
              commentsList.appendChild(fragment);
            })
            .catch(() => {
              commentsList.innerHTML = '';
              commentsList.appendChild(createEmptyState('评论加载失败。'));
            });
        } else if (commentsSection) {
          commentsSection.hidden = true;
        }
      })
      .catch(error => {
        titleTarget.textContent = `加载 Issue #${issueNumber} 失败`;
        metaTarget.textContent = error.message;
        bodyTarget.innerHTML = '';
        bodyTarget.appendChild(createEmptyState('无法显示该 Issue。'));
        if (commentsSection) {
          commentsSection.hidden = true;
        }
      });
  }

  document.addEventListener('DOMContentLoaded', () => {
    renderLatestSections();
    initIssueList();
    initIssueDetail();
  });
})();
