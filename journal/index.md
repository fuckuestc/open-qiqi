---
layout: default
title: 最新帖子
permalink: /journal/
description: "浏览 DoubleLuo 仓库全部公开 Issue 内容。"
---
<section class="section container">
  <h1 class="section-title">全部帖子</h1>
  <p class="section-intro">这里展示 GitHub <code>{{ site.github_owner }}/{{ site.github_repo }}</code> 仓库的 Issue 内容，按照最新更新时间排序。</p>
  <div class="issue-list" data-issues-list data-per-page="12">
    <div class="loading-card">正在加载 Issue 列表…</div>
  </div>
  <div class="list-actions">
    <button class="load-more" type="button" data-issues-load-more disabled>加载更多</button>
  </div>
</section>
