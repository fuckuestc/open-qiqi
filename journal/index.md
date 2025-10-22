---
layout: default
title: 最新文章
permalink: /journal/
description: "浏览所有苹果风格的博客文章。"
---
<section class="section container">
  <h1 class="section-title">所有文章</h1>
  <div class="post-list">
    {% for post in site.posts %}
      <article class="post-list-item">
        <a class="post-list-link" href="{{ post.url | relative_url }}">
          <div class="post-list-meta">
            <span class="post-list-date">{{ post.date | date: '%Y年%-m月%-d日' }}</span>
            <span class="post-list-reading">约 {{ post.content | number_of_words | divided_by: 300 | plus: 1 }} 分钟阅读</span>
          </div>
          <h2>{{ post.title }}</h2>
          <p>{{ post.excerpt | strip_html | truncate: 150 }}</p>
        </a>
      </article>
    {% endfor %}
  </div>
</section>
