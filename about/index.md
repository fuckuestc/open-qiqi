---
layout: default
title: 关于本站
description: "了解如何使用苹果风格的博客主题。"
permalink: /about/
---
<section class="section container about">
  <h1>关于本站</h1>
  <p>DoubleLuo Digest 自动同步 <code>{{ site.github_owner }}/{{ site.github_repo }}</code> 仓库的 GitHub Issues，并以苹果风格的界面呈现。它适合希望通过 Issues 记录事件、收集资料或发布图文帖的用户。</p>
  <h2>它是如何运作的？</h2>
  <ol>
    <li>进入 <a href="https://github.com/{{ site.github_owner }}/{{ site.github_repo }}" target="_blank" rel="noopener">原始仓库</a>，提交或编辑 Issue。</li>
    <li>本站会在访问时通过 GitHub API 获取最新的 Issue 列表。</li>
    <li>Issue 正文的 Markdown 由 GitHub 渲染，完整支持图片、代码块、引用和附件链接。</li>
  </ol>
  <h2>常见问题</h2>
  <ul>
    <li><strong>如何插入图片？</strong> 在 Issue 中使用标准 Markdown 图片语法，图片将自动显示圆角和阴影。</li>
    <li><strong>附件如何展示？</strong> 上传到 Issue 的附件或外部下载链接会直接出现在正文内，支持点击下载。</li>
    <li><strong>评论会同步吗？</strong> 帖子详情页会展示最新的 10 条公开评论，读者可跳转回 GitHub 继续讨论。</li>
  </ul>
</section>
